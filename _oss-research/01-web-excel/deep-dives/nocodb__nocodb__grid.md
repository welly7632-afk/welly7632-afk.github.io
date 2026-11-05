# nocodb/nocodb｜深入：前端 Grid 實作

> 深入分析｜掃描日期：2026-11-04｜commit：5f2e381｜總覽資料包：_oss-research/01-web-excel/nocodb__nocodb.md

> 這篇只看一件事：NocoDB 網頁上那張「像 Excel 的表格」怎麼做出來，程式在 `packages/nc-gui`（Vue 3＋Nuxt 4 前端）。所有連結都釘在 commit `5f2e38194e0bda13d8818a412bd4d723fd944cb8`（2026-11-04，commit 訊息是「sync-ee-to-ce」）。數字是我用 `find`、`wc -l`、`grep` 自己數的，數法寫在旁邊。標「未確認」的是我沒在原始碼裡親眼驗證的推論。這次只讀程式碼，沒有安裝、建置或執行任何東西。

## 重點結論（5–10 點）

1. **是 canvas grid，而且是預設**：一般使用者看到的表格在 `components/smartsheet/grid/canvas/`。表頭、儲存格、勾選框、群組標題、底部統計列，全部畫在同一張 `<canvas>` 上。只有「正在編輯的那一格」會換成真正的 Vue 元件，浮在 canvas 上面。canvas 目錄共 80 個 .ts/.vue 檔，30,407 行（`find … | xargs cat | wc -l`）。
2. **另外還留著 3 套 DOM 表格**：分頁版 `Table.vue`、DOM 無限捲動版 `InfiniteTable.vue`、DOM 群組版 `GroupBy.vue`。只有使用者關掉「Infinite scrolling」實驗功能，或在 Playwright 自動測試環境裡，才會用到它們。
3. **顯示和編輯是兩套程式**：顯示靠 33 個 canvas 繪製器（登錄表有 40 筆對應），編輯靠 `components/cell/` 的 Vue 編輯器（`Cell.vue` 分 26 種，`VirtualCell.vue` 分 14 種）。要新增一種欄位型別，兩邊都得寫。
4. **虛擬化分兩層**：畫面層只畫看得到的列和欄。全表列高一樣，所以用 `scrollTop / rowHeight` 就能直接算出從第幾列開始畫。資料層每 50 列切成一塊向伺服器要，往下捲會先抓下一塊；快取超過 200 列時，就丟掉離畫面遠的塊。
5. **拖拉填滿只能上下**。數列規則寫在 nocodb-sdk（純 TypeScript），仿 Google 試算表：數字照等差遞增，「文字＋數字尾碼」會遞增，日期依間隔遞增，其他型別就照抄。不過它只把最後一位數字當序號，貨號 `SKU009` 往下拖會變成 `SKU0010`。
6. **複製貼上走系統剪貼簿**：複製時同時寫入 `text/html`（`<table>`）和 `text/plain`（Tab 分隔，TSV）。貼上只讀 `text/plain`，用 papaparse 依 Tab 切開，上限 5,000 列。貼的範圍超出現有列或欄時，會跳對話框問要不要自動新增。
7. **排序、篩選、群組都在伺服器做**：工具列 UI 只負責修改「視圖設定」並存回後端，再重新載入資料。篩選有 21 種運算子、18 種日期子選項，條件群組可以巢狀。群組最多 5 層。
8. **跟 Excel 差最多的地方**：沒有儲存格公式（公式是「整欄」的欄位型別，由伺服器計算）。開源版（CE）沒有復原／重做（`useUndoRedo` 是空殼）。選取只能是一個連續矩形，最多 1,000 列。列高只有 4 段，而且全表一致。也沒有凍結列、合併儲存格和手動儲存格格式。
9. **沒辦法直接拆成獨立元件**：`CanvasTable` 要 41 個 props，另外靠 13 種 `inject`。整個 canvas 目錄呼叫了 67 種 `use*()`，還依賴 Nuxt 的自動 import（很多檔案用了函式，檔頭卻沒有 import）。比較實際的做法是「搬邏輯，不搬元件」。
10. **授權是 Sustainable Use License，不是 OSI 認可的開源授權**：個人、非商業或「自家公司內部業務」可以使用和修改。要拿去賣，或收費提供給別人，就不行。

## 逐題詳解（每個問題一節，附 permalink 與必要的短程式碼摘錄）

### 一、表格實作：是不是 canvas grid？檔案在哪？

**用哪一套表格**由 `grid/index.vue` 決定（[grid/index.vue#L243-L259](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/index.vue#L243-L259)）：

```ts
const isInfiniteScrollingEnabled = computed(() => isFeatureEnabled(FEATURE_FLAG.INFINITE_SCROLLING))
const isCanvasTableEnabled = computed(() => !ncIsPlaywright())
```

`infinite_scrolling` 這個旗標預設是 `enabled: true`（[useBetaFeatureToggle.ts#L30-L36](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useBetaFeatureToggle.ts#L30-L36)）。`ncIsPlaywright()` 只看有沒有 `window.isPlaywright`（[utils/is.ts#L17-L19](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/utils/is.ts#L17-L19)）。模板裡依序判斷四個分支（[grid/index.vue#L934-L1051](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/index.vue#L934-L1051)），行數是 `wc -l` 數的：

| 條件 | 用哪個元件 | 技術 |
|---|---|---|
| 關掉 Infinite scrolling，而且沒有群組 | `Table.vue`（3,264 行） | DOM＋分頁 |
| 預設（不是 Playwright） | `canvas/index.vue`（4,511 行） | Canvas，群組也畫在 canvas 上 |
| 開著 Infinite scrolling，但 canvas 被關掉（Playwright） | `InfiniteTable.vue`（3,904 行） | DOM 虛擬捲動 |
| 有群組，而且上一列的 canvas 條件不成立 | `GroupBy.vue`（612 行） | DOM |

開源版的 `blockExternalSourceRecordVisibility` 是空函式（[useEeConfig.ts#L232](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useEeConfig.ts#L232)），所以開源版有群組時一樣走 canvas。

**canvas 版的組成**（`components/smartsheet/grid/canvas/`）：

- `index.vue`：外殼。模板主體是 `<Scroller>` 包著一張 `<canvas>`（[index.vue#L3903-L3953](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L3903-L3953)），再加上一個絕對定位的編輯器容器（[index.vue#L3994-L4066](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L3994-L4066)）。右鍵選單和欄位選單用的是 `NcDropdown`，它包的是 ant-design-vue 的 `a-dropdown`。
- `composables/useCanvasTable.ts`（2,410 行）：總指揮，把 11 個子功能接在一起，包括 cell handler、繪製、拖曳列、抓資料、複製貼上、填滿、欄寬、欄序、鍵盤、滑鼠選取和凍結線。接線從 [useCanvasTable.ts#L1403-L1420](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCanvasTable.ts#L1403-L1420) 開始。
- `composables/useCanvasRender.ts`（4,528 行）：負責所有繪圖。每一幀 `renderCanvas()` 先清空整張 canvas，依序畫出資料列、表頭、拖曳提示、統計列和凍結線，最後畫作用中儲存格的框和填滿把手（[useCanvasRender.ts#L4384-L4520](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCanvasRender.ts#L4384-L4520)）。
- `cells/`：41 個 .ts 檔，每種欄位型別各有一個繪製器。
- `components/Scroller.vue`（596 行）：自製捲軸。外層設 `overflow-hidden`，攔下滾輪和觸控事件，自己計算 `scrollTop`、`scrollLeft`，再 emit 給 canvas 重畫。支援 Shift＋滾輪橫向捲動和觸控慣性（[Scroller.vue#L128-L198](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/components/Scroller.vue#L128-L198)）。
- `loaders/`：`SpriteLoader` 用 Vue 的 `renderToString` 把圖示元件轉成 SVG，畫到離屏 canvas 上快取，之後每次直接 `drawImage`（[SpriteLoader.ts#L6-L60](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/loaders/SpriteLoader.ts#L6-L60)）。另外還有圖片、Markdown、角色權限、表結構的載入器。
- `utils/canvas.ts`（1,815 行）：繪圖小工具，包括截斷文字、多行文字、圓角框、標籤和條碼。文字量測的結果用 `lru-cache` 快取起來（[canvas.ts#L1-L58](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/utils/canvas.ts#L1-L58)、[#L433-L490](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/utils/canvas.ts#L433-L490)）。

**整體資料流**（我依程式整理的示意圖）：

```
捲動： Scroller(wheel/觸控) ─emit scroll→ handleScroll(RAF 合併)
        → calculateSlices() 算出 rowSlice / colSlice
        → updateVisibleRows() → fetchChunk() → loadData({offset, limit}) → REST API
        → cachedRows(Map) → renderCanvas() → 每格 renderCell() → cells/<型別>.ts 的 render()

編輯： 滑鼠/鍵盤 → handleCellClick / handleCellKeyDown（各型別可自己處理，例如勾選框）
        → makeCellEditable() 檢查權限 → editEnabled = 那一格
        → index.vue 在 canvas 上方放 <SmartsheetCell>（Vue 編輯器）
        → updateOrSaveRow(row, 欄位) → $api.dbViewRow.update → 伺服器回傳公式等計算欄位
```

**點擊怎麼對到格子**：canvas 裡沒有 DOM 元素可以點，所以每畫一幀，就把每一列的位置記進 `elementMap`（[CanvasElement.ts#L1-L60](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/utils/CanvasElement.ts#L1-L60)）。滑鼠按下時，用座標找出是哪一列，用 `findClickedColumn` 找出是哪一欄，再交給該欄位型別的 `handleClick` 處理。雙擊則進入編輯（[index.vue#L2264-L2300](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L2264-L2300)）。

### 二、各種 cell 型別與編輯器

**顯示（canvas 繪製器）**：`cells/index.ts` 用一個 `Map` 當登錄表。`cellTypesRegistry.set(UITypes.X, XRenderer)` 共 40 筆（`grep -c`），對應 33 個不同的繪製器（[cells/index.ts#L150-L191](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/index.ts#L150-L191)）。例如 DateTime 的繪製器同時給 CreatedTime 和 LastModifiedTime 用。nocodb-sdk 的 `UITypes` 列舉有 46 個成員，其中 6 個沒有登錄：Collaborator、Count、AutoNumber、Order、Deleted、Meta。這 6 種會落到預設分支，直接把值轉成字串畫出來（[cells/index.ts#L475-L486](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/index.ts#L475-L486)）。

每個繪製器都是一個物件，介面定義在 `lib/types.ts`（[types.ts#L823-L917](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/lib/types.ts#L823-L917)，摘要如下）：

```ts
interface CellRenderer {
  render: CellRenderFn                       // 必填：在 ctx 上畫
  renderEmpty?: CellRenderFn                 // 值為空時
  handleClick?: (options) => Promise<boolean> // 回傳 true 表示已處理
  handleKeyDown?: (options) => Promise<boolean | void>
  handleHover?: (options) => Promise<void>
}
```

兩個例子：

- `Currency.ts` 全檔 71 行。`render` 用 `formatCurrencyValue` 格式化後靠右畫；`handleKeyDown` 在使用者按數字鍵時先清空，再呼叫 `makeCellEditable` 進入編輯（[Currency.ts#L1-L71](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/Currency.ts#L1-L71)）。注意它的預設值是 `currency_locale: 'en-US'`、`currency_code: 'USD'`，用新台幣的話，要在欄位設定裡改成 TWD。
- `Checkbox.ts` 整個點擊切換都在 canvas 上處理，不會開編輯器（[Checkbox.ts#L119-L156](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/Checkbox.ts#L119-L156)）。

**編輯（DOM 編輯器）**：使用者雙擊、按 Enter 或直接打字時，`makeCellEditable` 會先檢查一連串規則：唯讀、主鍵、系統欄、同步欄位、欄位權限、資料表沒有主鍵等等（[useCanvasTable.ts#L2046-L2134](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCanvasTable.ts#L2046-L2134)）。全部通過後，把 `editEnabled` 設成那一格。`index.vue` 再依照它的位置，用絕對定位放一個 `<SmartsheetCell>` 或 `<SmartsheetVirtualCell>` 上去。

- `smartsheet/Cell.vue` 的 `cellType` 計算屬性分出 25 種具名型別，再加上預設的文字（[Cell.vue#L226-L258](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/Cell.vue#L226-L258)）。多數型別再分成 `Editor` 和 `Readonly` 兩個元件；`components/cell/` 底下有 21 個 `Editor.vue`、21 個 `Readonly.vue`（`find -name`）。
- `smartsheet/VirtualCell.vue` 管 14 種「虛擬欄位」：Links、HasMany、ManyToMany、BelongsTo、OneToOne、Rollup、Formula、QrCode、Barcode、Count、Lookup、Button、建立／修改時間、建立／修改者（[VirtualCell.vue#L84-L105](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/VirtualCell.vue#L84-L105)）。
- 編輯器靠 Vue 的 `inject` 取得上下文，例如 `Currency/Editor.vue` 用到 `ColumnInj`、`EditModeInj`、`ReadonlyInj`、`IsCanvasInjectionInj`（[Editor.vue#L15-L21](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/cell/Currency/Editor.vue#L15-L21)）。

**型別轉換**（貼上和填滿共用）在 nocodb-sdk 的 `ColumnHelper`。它依欄位型別找到對應的 helper 類別（`columnHelper/columns/` 底下有 33 個檔，另有 LTAR 子目錄），提供 `serializeValue`、`parseValue`、`populateFillHandle` 三個方法（[column-helper.ts#L170-L182](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/columnHelper/column-helper.ts#L170-L182)）。這一層是純 TypeScript，不依賴 Vue。

### 三、虛擬化

**畫面層：只畫看得到的格子**。見 `calculateSlices()`（[index.vue#L907-L947](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L907-L947)）：

```ts
const startRowIndex = Math.max(0, Math.floor(scrollTop.value / rowHeight.value))
const visibleRowCount = Math.ceil(containerRef.value.clientHeight / rowHeight.value)
```

- 全表列高一樣，所以換算第幾列只要一次除法。欄寬各不相同，`findColumnIndex` 就從第一欄開始累加欄寬，一欄一欄找（[useCanvasTable.ts#L1167-L1176](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCanvasTable.ts#L1167-L1176)）。
- `COLUMN_BUFFER_SIZE = 5` 的單位是像素，不是 5 欄。
- 總高度＝總列數×列高＋表頭＋留白（[index.vue#L725-L732](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L725-L732)）。
- 捲動事件用 `requestAnimationFrame` 合併，並在同一幀裡直接重畫，避免畫面慢兩幀（[index.vue#L2831-L2853](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L2831-L2853)）。

**資料層：分塊向伺服器要**。常數定義在 `useDataFetch.ts`（[useDataFetch.ts#L1-L8](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useDataFetch.ts#L1-L8)）：

```ts
const MAX_RECORDS_PER_CALL = 100
const INITIAL_LOAD_SIZE = 100
const CHUNK_SIZE = 50
const BUFFER_SIZE = 100
const PREFETCH_THRESHOLD = 50
const API_THROTTLE = 500
```

- 每 50 列是一塊，`chunkStates[]` 記錄每一塊是 loading 還是 loaded（[useDataFetch.ts#L44-L94](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useDataFetch.ts#L44-L94)）。
- 依捲動方向，預先抓下一塊或上一塊。連續的塊會合併成一次 API 呼叫，每次最多 100 列，並且每 500ms 節流一次（[useDataFetch.ts#L119-L208](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useDataFetch.ts#L119-L208)）。
- 快取的格式是 `Map<列號, Row>`。超過 `MAX_CACHE_SIZE = 200` 列時，只留下畫面前後 100 列範圍內的塊，以及含有「已勾選、新增中、拖曳中」列的塊（[useInfiniteData.ts#L418-L422](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useInfiniteData.ts#L418-L422)、[#L805-L848](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useInfiniteData.ts#L805-L848)）。
- 資料還沒到的列，畫成灰色的閃爍佔位（[useCanvasRender.ts#L337](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCanvasRender.ts#L337)）。

群組模式另有一套：群組本身每 100 個一批（`GROUP_CHUNK_SIZE`）。`calculateGroupRange` 從第一個群組開始一路往下掃，找出落在畫面內的範圍（[groupby.ts#L107-L158](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/utils/groupby.ts#L107-L158)）。

**可以直接學的效能技巧**（都寫在程式註解裡，數字是原作者的說法，我沒有實測）：

- canvas 的像素緩衝區只在尺寸或 `devicePixelRatio` 改變時才重設，其餘時候只呼叫 `ctx.setTransform`。註解說每幀重設會多花 5–15ms（[useCanvasRender.ts#L4405-L4430](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCanvasRender.ts#L4405-L4430)）。
- 每幀只取一次時間戳記和主題顏色，不在每個格子裡重算。註解說這樣每幀可以省下約 425 次 `Date.now()`（[cells/index.ts#L193](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/index.ts#L193)）。
- 文字截斷、多行斷行、條碼、選項顏色都用 LRU 快取；圖示畫好一次就存成小 canvas，之後重複使用。
- 捲動時在同一個 `requestAnimationFrame` 裡算範圍和重畫，不再排第二個 RAF（[index.vue#L2844](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L2844)）。
- 每一幀都用 `try/finally` 包住 `ctx.save()` 和 `ctx.restore()`，避免某一格畫到一半出錯，留下的裁切區域把之後每一幀都弄壞（[useCanvasRender.ts#L4384-L4520](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCanvasRender.ts#L4384-L4520)）。

### 四、拖拉填滿

- 把手畫在選取框右下角，用圓形範圍判斷有沒有點到（[useFillHandler.ts#L100-L158](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useFillHandler.ts#L100-L158)）。
- 拖曳時 `handleFillMove` 只改「列」，欄固定在原本的選取範圍，所以**只能往上或往下填**。
- 放開滑鼠後，`v2HandleFillValue` 先把原選取範圍轉成字串矩陣，一欄一欄呼叫 `ColumnHelper.populateFillHandle` 算出要填的值，再用 `convertCellData` 轉型，最後用一次 `bulkUpdateRows` 送出（[useFillHandler.ts#L160-L268](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useFillHandler.ts#L160-L268)）。
- 規則在 `nocodb-sdk/src/lib/columnHelper/utils/fill-handler.ts`，全檔 209 行（[fill-handler.ts#L34-L192](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/columnHelper/utils/fill-handler.ts#L34-L192)）：
  - 純數字：從最後一個值開始，一直加上平均間隔。例如 `1, 2` 往下拖得到 `3, 4, 5`；`1, 3, 4` 的平均間隔是 1.5，往下拖得到 `5.5, 7, 8.5`。
  - 「文字＋數字尾碼」：正規式 `/(.*)(\d+)$/` 的前半段是貪婪比對，所以**只有最後一位數字會被當成序號**，前面的字（包括補的 0）都算前綴。同一個前綴歸成一組，間隔一致就遞增，不一致就照抄。
  - 只選一格時照抄。
  - 用貨號實際推算：我照這段邏輯另外寫了一支 Python 小腳本（放在 clone 外面，先用官方測試檔 `fill-handler.spec.ts` 的 3 個案例核對，答案一致）。結果是：`SKU001, SKU002` 往下拖得到 `SKU003, SKU004`，看起來正常；但 `SKU008, SKU009` 會變成 `SKU0010`，多出一位數；`SKU019, SKU020` 的前綴不同（`SKU01`、`SKU02`），只會照抄。
- 有覆寫 `populateFillHandle` 的欄位型別共 8 種：Currency、Date、DateTime、Decimal、Number、Percent、SingleLineText、Year（`grep 'override populateFillHandle'`；Rating 那一筆只是註解）。日期會判斷間隔是秒、分、時、日、月還是年（[Date.ts#L57-L90](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/columnHelper/columns/Date.ts#L57-L90)）。其他型別一律照抄（[fill-handler.ts#L194-L209](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/columnHelper/utils/fill-handler.ts#L194-L209)）。
- 程式裡其實有「AI 填滿」：按住 Ctrl／⌘ 拖把手，讓 AI 依樣本列產生內容。但它要求 `ai_fill_handle` 旗標，而這個旗標已列為退役，固定是 false，等於關閉（[useCanvasTable.ts#L541-L543](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCanvasTable.ts#L541-L543)、[useBetaFeatureToggle.ts#L323-L335](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useBetaFeatureToggle.ts#L323-L335)）。

### 五、複製貼上

**複製**：`copyTable` 呼叫 `serializeRange`，同時產生 `<table>` HTML 和 Tab 分隔文字，再用 `navigator.clipboard.write` 一次寫入兩種格式（[useCopyPaste.ts#L1322-L1355](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L1322-L1355)、[pasteUtils.ts#L163-L242](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/utils/pasteUtils.ts#L163-L242)）。它另外在記憶體裡存一份「剛剛複製的原始值」（rowIds、dbCellValueArr），在 NocoDB 裡面互相貼上時，可以拿到比純文字更完整的值。我讀到的 `<td>${…}</td>` 是直接把字串拼進去，沒看到 HTML 跳脫。內容含 `<` 或 `&` 時，貼到 Word 這類吃 HTML 的程式可能會變形（未實測）。

**貼上**：`handlePaste` 掛在 `document` 的 `paste` 事件上（[useCopyPaste.ts#L1584](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L1584)），主要步驟在 [useCopyPaste.ts#L367-L470](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L367-L470)：

1. 只讀 `getData('text/plain')`，並去掉從 Excel 複製時結尾多出來的 `\n`。
2. 內容有 Tab 或換行，就用 papaparse 以 `\t` 切成矩陣。字串 `"null"` 會變成空字串。
3. 超過 `MAX_ROWS = 5000` 列就截斷，並跳出提示（[useCopyPaste.ts#L29](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L29)）。
4. 算出要新增幾列、幾欄。需要擴張時，跳出 `DlgRecordUpsert` 對話框讓使用者選（[index.vue#L2906-L2947](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L2906-L2947)）。新增的欄一律是 `SingleLineText`。
5. 每一格用 `convertCellData` 呼叫 `ColumnHelper.serializeValue`，轉成目標欄位的型別（[convertCellData.ts#L67-L80](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useMultiSelect/convertCellData.ts#L67-L80)）。
6. 剪貼簿裡有檔案、而目標是附件欄時，會直接上傳檔案。

**快速鍵**（[useKeyboardNavigation.ts#L124-L300](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useKeyboardNavigation.ts#L124-L300)）：

| 按鍵 | 動作 |
|---|---|
| Ctrl／⌘+C | 複製 |
| Delete／Backspace | 清除單格或整個選取範圍 |
| Enter | 進入編輯；編輯中按則跳到下一列 |
| Esc | 離開編輯 |
| 方向鍵 | 移動；加 Ctrl／⌘ 跳到最前或最後，加 Shift 擴大選取 |
| Tab／Shift+Tab | 往右／往左移；到行尾會換到下一列，在最後一格按 Tab 會自動新增一列 |
| 空白鍵 | 展開整列的表單 |
| Alt+R | 新增一列 |
| Alt+C | 新增一欄 |

### 六、群組／篩選／排序 UI

三者都放在工具列 `components/smartsheet/toolbar/`。這部分的 UI 是一般 DOM（ant-design-vue），不在 canvas 裡。括號內是 `wc -l` 的行數：

| 功能 | UI 檔案 | 狀態與 API | 說明 |
|---|---|---|---|
| 篩選 | `ColumnFilterMenu.vue`（486）、`ColumnFilter.vue`（2,338）、`Filter/*` | `useViewFilters.ts`：`filterCreate`、`filterUpdate`、`filterDelete`、`filterChildrenList` | 21 種運算子＋18 種日期子選項；條件群組在 `nestedLevel < 5` 時還能再加子群組（[ColumnFilter.vue#L1357](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/toolbar/ColumnFilter.vue#L1357)） |
| 排序 | `SortListMenu.vue`（456）、`CreateSort.vue`（100） | `useViewSorts.ts`：`sortCreate`、`sortUpdate`、`sortDelete`，存完呼叫 `reloadData()` | 可多欄排序 |
| 群組 | `GroupByMenu.vue`（776）、`CreateGroupBy.vue`（81） | 存在「視圖欄位」的 `group_by`、`group_by_order`、`group_by_sort`（[GroupByMenu.vue#L197-L226](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/toolbar/GroupByMenu.vue#L197-L226)）；資料用 `$api.dbViewRow.groupBy` 取得（[useInfiniteGroups.ts#L219-L227](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useInfiniteGroups.ts#L219-L227)） | 最多 5 層（[useViewGroupBy.ts#L49](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useViewGroupBy.ts#L49)、[globals.ts#L80](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/globals.ts#L80)） |

運算子的數量，是我在 `comparisonOpList`（[filterUtils.ts#L223-L587](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/filter/filterUtils.ts#L223-L587)）裡逐一數 `value:` 得到的：checked、notchecked、eq、neq、like、nlike、empty、notempty、null、notnull、allof、anyof、nallof、nanyof、gt、lt、gte、lte、isWithin、blank、notblank。每個運算子再用 `includedTypes`、`excludedTypes` 限定能用在哪些欄位型別。

重點是：**排序、篩選、群組都是改後端的「視圖設定」再重新查詢**（[useViewSorts.ts#L65-L113](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useViewSorts.ts#L65-L113)），由資料庫用 SQL 處理，不是在瀏覽器裡排序。好處是幾十萬列也篩得動；代價是沒有後端就不能用，而且所有人看到的是同一份視圖設定。只有公開分享頁、共用 base 和 interface 頁面，才只改本機。

底部統計列（加總、平均等）平常用 `dataAggregate` 向伺服器要（[useViewAggregate.ts#L133](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useViewAggregate.ts#L133)）。選取一塊範圍時，則改在瀏覽器裡即時計算，上限 50,000 格，類似 Excel 的狀態列（[useCanvasTable.ts#L776-L781](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCanvasTable.ts#L776-L781)）。

### 七、跟 Excel 體驗的差距

| 項目 | Excel | NocoDB canvas grid | 證據 |
|---|---|---|---|
| 公式 | 每格都能打 `=A1*B1` | 沒有儲存格公式。公式是「欄位型別」（Formula），整欄共用同一條公式，由伺服器計算。在 smartsheet、cell、composables 三個目錄 grep `startsWith('=')` 是 0 筆 | Formula 繪製器只負責顯示結果 |
| 復原／重做 | 有 | 開源版沒有。`undo`、`redo` 是空函式，註解寫「CE has no undo」 | [useUndoRedo.ts#L1-L30](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useUndoRedo.ts#L1-L30) |
| 選取 | 可以選多個不連續範圍 | 只有一個連續矩形（`CellRange`）。Shift 擴選和拖曳選取上限 1,000 列（環境變數 `NC_GRID_MAX_SELECTION_LIMIT`）。點欄頭只選前 100 列。勾選列最多 100 列（「全選」模式除外） | [cellRange.ts#L1-L110](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useMultiSelect/cellRange.ts#L1-L110)、[index.vue#L295](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L295)、[constants/index.ts#L84-L85](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/constants/index.ts#L84-L85)、[index.vue#L1940-L1946](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L1940-L1946) |
| 列高 | 每一列都能調 | 全表一致，只有 4 段：32、60、90、120 px | [utils/cell.ts#L55-L60](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/utils/cell.ts#L55-L60) |
| 凍結 | 可以凍結列和欄 | 只能凍結左側欄（存成 `frozen_column_count`，最多占畫面 3/4）；不能凍結列（grep `frozen_row` 等是 0 筆） | [useFreezeDivider.ts#L7-L12](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useFreezeDivider.ts#L7-L12)、[constants.ts#L1-L25](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/utils/constants.ts#L1-L25) |
| 合併儲存格 | 有 | 沒有（canvas 目錄 grep `mergeCell` 是 0 筆） | — |
| 儲存格格式 | 粗體、底色、框線 | 沒有手動格式。依條件替列或格子上色的功能，在 CE 是空殼（`evaluateRowColor` 回傳 null） | [useViewRowColorRender.ts#L1-L30](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/viewRowColor/useViewRowColorRender.ts#L1-L30) |
| 型別 | 一欄可以混放各種型別 | 一欄只有一種型別，貼上時會強制轉型 | ColumnHelper |
| 填滿 | 上下左右都行，還能自訂清單 | 只能上下 | useFillHandler.ts |
| 存檔 | 手動存檔，可以離線 | 每改一格就呼叫一次 `dbViewRow.update`（帶 `typecast: 'true'`），立刻寫進資料庫 | [useInfiniteData.ts#L1710-L1745](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useInfiniteData.ts#L1710-L1745) |
| 多工作表 | 一個檔案多個工作表，可以跨表參照 | 每張表就是資料庫裡的一張 table，跨表要靠 Links、Lookup、Rollup 欄位 | — |
| 即時協作 | Office 365 有 | CE 的 `useRealtime` 回傳空物件；`useGridFocusPresence` 註明「EE-only」 | [useRealtime.ts#L1-L3](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useRealtime.ts#L1-L3)、[useGridFocusPresence.ts#L9-L22](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useGridFocusPresence.ts#L9-L22) |
| 無障礙 | 有 | canvas 主檔和捲軸元件裡，`aria-` 和 `role=` 都是 0 筆 | grep |

反過來看，NocoDB 也有比 Excel 強的地方。它的欄位有型別，像貨幣、評分、單選、附件、使用者。表跟表可以關聯（Links、Lookup、Rollup），很適合做進貨、庫存、訂單這類 ERP 資料。資料放在真正的資料庫裡，可以多人共用，還自帶 REST API。匯出有 CSV、JSON、Excel、ICS 四種（[globals.ts#L112-L117](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/globals.ts#L112-L117)）。

### 八、能否拆出來單獨使用

**直接拆成獨立元件：很難，不建議。** 我數到的耦合點如下：

- `CanvasTable` 有 41 個 props（[index.vue#L51-L142](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L51-L142)），幾乎都是資料操作函式，例如 `loadData`、`updateOrSaveRow`、`bulkUpsertRows`、`getRows`，還有一堆群組相關的函式。這組 props 反而是最好的「切點」：你可以照著它的簽名，自己實作一份資料層。
- `index.vue` 和 `useCanvasTable.ts` 合計 inject 13 種 key，例如 `FieldsInj`、`ReadonlyInj`、`IsPublicInj`、`ReloadViewDataHookInj`。整個 canvas 目錄呼叫了 67 種不同的 `use*()`（`grep -oh '\buse[A-Z]…(' | sort -u`），包括 `useSmartsheetStoreOrThrow`、`useViewColumnsOrThrow`、`useRoles`、`useMetas`、`useNocoAi`、`useScriptStore` 等。
- **Nuxt 自動 import**：`Currency.ts` 只 import 了兩行，卻用到 `parseProp`、`isValidValue`、`themeV4Colors`、`ncIsNull`。`Checkbox.ts` 只 import 一行，卻用到 `rowHeightInPx`、`message`、`extractSdkResponseErrorMsg`。搬出去時，這些都要補成明確的 import。
- 型別與資料：`ColumnType`、`UITypes` 來自 nocodb-sdk。`Row` 的結構（`row`、`oldRow`、`rowMeta`）定義在 [types.ts#L118-L158](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/lib/types.ts#L118-L158)。
- UI 與框架：Nuxt 4（[package.json#L233](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/package.json#L233)）、ant-design-vue 3（[#L91](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/package.json#L91)）、vue-i18n、Pinia、UnoCSS 的 class 名稱。
- 編輯器靠 `ColumnInj`、`EditModeInj` 等 provide／inject 取得上下文，沒有外層 provider 就跑不起來。

**比較可行的三條路**：

1. **個人用：直接自架整個 NocoDB**（Docker），接你自己的 PostgreSQL 或 MySQL，再用它的 REST API 跟倉庫系統互通。完全不用拆。要注意它不能直接讀 Firestore（整個 repo 的檔名搜 firebase、firestore 是 0 筆），兩邊的資料要自己寫程式透過 API 同步。
2. **搬「純邏輯」**：fill-handler、CellRange、分塊載入、TSV 貼上解析、文字截斷快取。這幾塊依賴少，改寫成原生 JavaScript 很快，下一節有清單。
3. **搬「架構」**：照它「一張 canvas 畫全部＋一個 DOM 編輯器浮在上面＋資料分塊抓」的做法，請 Claude Code 在你的 Firebase 專案裡重寫一個精簡版。

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. `packages/nc-gui/components/smartsheet/grid/index.vue`：看 L243-L259、L934-L1051，了解四種表格怎麼選。
2. `grid/canvas/index.vue`：看 L51-L142 的 props（資料層的切點）、L907-L947 的 `calculateSlices`、L2831-L2853 的捲動處理、L3895-L4066 的模板（canvas 加浮動編輯器）。
3. `grid/canvas/composables/useCanvasTable.ts`：從 L1403 往下看子功能怎麼接起來；L2046-L2134 看進入編輯的規則。
4. `grid/canvas/composables/useCanvasRender.ts`：先看 L4384-L4520 的 `renderCanvas` 畫圖順序，再看 L2391 起的 `renderRows`。
5. `grid/canvas/cells/index.ts`：看 L150-L191 的登錄表、L210-L487 的 `renderCell`。接著挑 `Currency.ts`、`Checkbox.ts`、`SingleSelect.ts` 三個當範例。
6. `lib/types.ts`：看 L707-L917 的 `CellRendererOptions` 和 `CellRenderer` 介面。
7. `grid/canvas/composables/useDataFetch.ts`（全檔 223 行），以及 `composables/useInfiniteData.ts` L805-L848 的快取淘汰。
8. `grid/canvas/composables/useKeyboardNavigation.ts`、`useMouseSelection.ts`、`composables/useMultiSelect/cellRange.ts`：鍵盤和選取。
9. `grid/canvas/composables/useFillHandler.ts`，搭配 `nocodb-sdk/src/lib/columnHelper/utils/fill-handler.ts`：填滿。
10. `grid/canvas/composables/useCopyPaste.ts`（L367-L470、L1322-L1355），搭配 `utils/pasteUtils.ts`：複製貼上。
11. `components/smartsheet/Cell.vue`、`VirtualCell.vue`，再挑一個 `components/cell/*/Editor.vue`：編輯器。
12. `components/smartsheet/toolbar/ColumnFilter.vue`、`SortListMenu.vue`、`GroupByMenu.vue`，以及對應的 `composables/useView*.ts`：工具列。

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 部分 | 檔案（行數） | 依賴 | 難度 | 怎麼用在你的專案 |
|---|---|---|---|---|
| 填滿數列規則 | `nocodb-sdk/.../utils/fill-handler.ts`（209） | 只依賴同目錄的 `decimal.ts` 和 `~/lib/is` | 低 | 改成一個 JS 函式 `fill(已選的值, 總列數)`，給倉庫表格的拖拉填滿用 |
| 選取模型 | `useMultiSelect/cellRange.ts`（110） | 無 | 低 | 原樣搬過去，把型別拿掉就是 JS |
| 分塊載入＋快取淘汰 | `useDataFetch.ts`（223）＋`useInfiniteData.ts` 的 `clearCache` | Vue `ref`、VueUse `useThrottleFn`、axios | 中 | 換成普通物件和自己寫的節流。資料來源換成 Firestore 時要注意：Firestore 沒有便宜的 offset，要改用游標分頁（`startAfter`） |
| 剪貼簿 | `pasteUtils.ts` 的 `serializeRange`、`useCopyPaste.ts` 的 `handlePaste` 前段 | papaparse（MIT 授權） | 低～中 | 複製時寫入 text/plain＋text/html；貼上時用 `papaparse.parse(text, { delimiter: '\t' })` |
| 文字繪製與快取 | `utils/canvas.ts` 的 `truncateText`、`renderSingleLineText`、`wrapTextToLines` | `lru-cache`，部分靠自動 import | 中 | 給自己的 canvas 表格畫文字用 |
| 圖示快取 | `loaders/SpriteLoader.ts`（107） | Vue SSR 的 `renderToString` | 中 | 原生 JS 可改成用 `Image` 載入 SVG data URL，畫到離屏 canvas 後再 `drawImage` |
| 自製捲軸 | `components/Scroller.vue`（596） | Vue | 中 | 抄它的滾輪單位換算和 Shift 橫捲邏輯 |
| 欄位型別轉換 | `nocodb-sdk/src/lib/columnHelper/` | dayjs 等 | 中 | 只挑你要的型別（Currency、Decimal、Date）來搬 |
| 整套 canvas grid | `grid/canvas/`（80 檔、30,407 行） | 上面全部再加 NocoDB API | 很高 | 不建議 |

**接到你 Firebase 倉庫系統的骨架**（這是我寫的示意，不是 NocoDB 的程式碼）：

```js
// 對照 CanvasTable 的 loadData / updateOrSaveRow 兩個 props
async function loadChunk(chunkId, cursorMap) {           // 對應 useDataFetch 的 fetchChunk
  let q = query(collection(db, 'items'), orderBy('sku'), limit(50))
  if (cursorMap[chunkId - 1]) q = query(q, startAfter(cursorMap[chunkId - 1]))
  const snap = await getDocs(q)
  cursorMap[chunkId] = snap.docs.at(-1)
  return snap.docs.map((d, i) => ({ row: { id: d.id, ...d.data() }, rowMeta: { rowIndex: chunkId * 50 + i } }))
}
async function saveCell(row, field) {                    // 對應 updateOrSaveRow(row, property)
  await updateDoc(doc(db, 'items', row.row.id), { [field]: row.row[field] })
}
```

這個骨架用的是游標分頁，只適合從上往下依序載入。使用者把捲軸直接拖到中間時，前一塊的游標還不存在，要另外處理，例如先依序補抓，或改用可以跳頁的排序欄位。NocoDB 是用 SQL 的 offset，所以沒有這個問題。

給 Claude Code 的指令範例：「請讀 `nocodb-sdk/src/lib/columnHelper/utils/fill-handler.ts`，改寫成不依賴任何套件的原生 JavaScript 模組 `fillSeries.js`，保留原本的規則和測試案例（參考同目錄的 `fill-handler.spec.ts`），檔頭加上 NocoDB 授權聲明和『已修改』說明。」

**授權注意**：根目錄的 LICENSE（2026-01-29 更新）寫明 master 和 develop 兩個分支都採 Sustainable Use License。條款是：只能用於「自己公司的內部業務」或「非商業、個人用途」；要散布，只能免費而且是非商業目的；必須附上授權條款；修改過的版本要有明顯的「已修改」聲明（[LICENSE.md#L1-L35](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/LICENSE.md#L1-L35)）。依我對條文的理解，你把它用在自家倉庫系統屬於內部業務，可以；做成產品賣給其他店家就不行（這不是法律意見）。另外，`packages/nc-gui/LICENSE.md` 是 2026-01-09 的舊版，寫的是「只有 master 分支有授權」（[nc-gui/LICENSE.md#L1-L9](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/LICENSE.md#L1-L9)），跟根目錄的說法不一致。保守做法是從 master 分支或正式 release 取程式碼。

## 坑與限制

- **開源版是從企業版同步出來的「去功能版」**：這次的 commit 訊息就是「sync-ee-to-ce」，`isEeUI` 寫死成 `false`（[ncUtils.ts#L1](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/utils/ncUtils.ts#L1)）。在 `composables/` 目錄用 `grep -il 'CE stub\|EE-only\|CE has no'` 找到 23 個檔案。跟表格有關的空殼包括：復原／重做、條件上色、即時協作、他人游標位置、儲存格共同編輯。讀程式碼時看到的功能，不一定在開源版能用。
- **每次編輯都直接寫進伺服器**：沒有「先在本機試算、最後再存檔」的模式，網路慢的時候每一格都要等。
- **選取和貼上有硬上限**：範圍選取 1,000 列、點欄頭 100 列、勾選 100 列、貼上 5,000 列。大量整理資料時，要改用匯入功能或 API。
- **貨號往下拖會出錯**：填滿只把最後一位數字當序號，所以 `SKU009` 往下拖會變成 `SKU0010`。跨十位數時（例如 `SKU019`→`SKU020`）甚至只會照抄（見第四節）。貨號最好由程式或公式欄位產生，不要靠拖拉。
- **貼上會遺失格式和公式**：只讀 `text/plain`，所以從 Excel 貼過來的是「顯示值」。自動新增的欄一律是單行文字，事後要自己改型別。
- **兩套程式要同步維護**：每種欄位型別都有 canvas 繪製器加 DOM 編輯器兩份，另外還有 3 套舊 DOM 表格。自動測試（Playwright）跑的是 DOM 版，canvas 版的測試覆蓋程度「未確認」。
- **大檔案**：`useCanvasRender.ts` 4,528 行、`canvas/index.vue` 4,511 行、`InfiniteTable.vue` 3,904 行。Claude Code 讀的時候，要指定行號範圍，不要整檔塞進去。
- **canvas 的通病**：畫在 canvas 上的字不是 DOM 文字，瀏覽器內建的 Ctrl+F 找不到（這是 canvas 的一般特性，沒在本專案實測），所以要用它工具列的搜尋。螢幕閱讀器也讀不到內容。
- **效能上的小地方**：`findColumnIndex` 和 `calculateGroupRange` 都是線性掃描。欄位或群組非常多的時候可能變慢，但我沒有實測。
- **命名容易誤會**：`COLUMN_BUFFER_SIZE = 5` 是 5 像素，不是 5 欄。
- **貨幣預設是美元**：`Currency.ts` 的預設值是 `en-US` 和 `USD`，台灣使用要在欄位設定裡改。
- **複製出來的 HTML 沒有跳脫**：可能讓含特殊字元的內容貼到其他程式時變形（未實測）。
