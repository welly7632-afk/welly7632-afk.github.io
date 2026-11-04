# teableio/teable｜深入：前端 canvas grid

> 深入分析｜掃描日期：2026-11-04｜commit：f8be01f｜總覽資料包：_oss-research/01-web-excel/teableio__teable.md

> 這篇只看一件事：Teable 表格畫面背後那個「用 Canvas 自己畫的試算表格子」，也就是 `packages/sdk/src/components/grid/`。所有連結都釘在 commit `f8be01fadb86790d3d3a878bedd10cf949f9a8f8`（2026-11-03）。數字是我自己用 `find`、`wc -l`、`grep`、`git log` 和一支只讀的 Python 小腳本數的，數法寫在旁邊。標「未確認」的是我沒有親眼在原始碼裡驗證的推論。

## 重點結論（5–10 點）

1. **這是 Teable 自己寫的 Canvas 表格，授權是 MIT**：程式在 `packages/sdk/src/components/grid/`，共 91 個檔案（77 個程式檔＋14 個測試檔）。程式碼 13,133 行，測試 1,812 行（`find … | xargs cat | wc -l`）。根目錄授權寫明 `packages/` 底下全部是 MIT（[LICENSE#L13-L17](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/LICENSE#L13-L17)），跟採 AGPL-3.0 的主程式 `apps/` 分開。對你「挑好的拿去用」來說，這一點最要緊。
2. **它的前身就是 glide-data-grid**：2023-07-26 以前，Teable 的表格直接用 glide-data-grid 5.2.1。PR #99（commit `28a81af`）的訊息寫著「remove konva and draw with native canvas」和「remove glide-data-grid」，之後就換成自製的。現在主表格**一行 glide 都沒 import**，glide 6.0.3 只剩「附件 Excel 預覽」在用。自製版有好幾個模組（圖示快取、圖片載入、超高捲軸）和 glide 的寫法幾乎一樣。這是我憑對 glide 原始碼的既有了解比對的，本次沒有開 glide 原始碼，所以屬於「未確認」。
3. **結構分三層**：`Grid` 管狀態和座標，`InteractionLayer` 管滑鼠、選取、拖曳和編輯器，`RenderLayer` 只有一個 `<canvas>`，在 `useLayoutEffect` 裡呼叫 `drawGrid`。捲軸是兩個真正的原生 `<div>` 捲軸，編輯器則是蓋在 canvas 上的一般 DOM 輸入框。
4. **虛擬化分兩層**：畫面層靠 `CoordinateManager`（延遲量測，再用指數搜尋和二分搜尋）算出看得到哪些列和欄，只畫那些格子。資料層由 Teable 的 hook 用滑動視窗跟伺服器要資料，一次 300 筆，第一次 64 筆，前後各留 1/3 當緩衝。
5. **效能關鍵是「雙畫布」**：格子背景、格線和選取框每次都在主畫布重畫。最花時間的「儲存格內容」畫在另一張離屏的快取畫布上，只有在捲動中，或資料、欄位、主題改變時才重畫。平常移動滑鼠或選取，只是把快取「貼」回去。另外還有文字量測 LRU 快取（兩個，各 1,000 筆）、把 SVG 圖示轉成點陣後快取，以及只載入可見範圍的圖片加上 12 個 `<img>` 的物件池。
6. **沒有 glide 的「上一幀平移重用（blit）」**：捲動時 `shouldRerender` 一定是 true，每一幀都把所有可見格子的內容重畫一次。資料量大時，這可能是它跟 glide 差最多的地方（推論，未實測）。
7. **格子和編輯器都能擴充**：有 11 種儲存格類型和 4 個內建編輯器元件，任何格子都能用 `customEditor` 掛上你自己的 React 元件。數字可以畫成進度條或圓環，Chart 格可以畫迷你折線圖或長條圖，拿來做「庫存水位」和「價格走勢」剛好。
8. **可以單獨拿出來，難度中等**：77 個程式檔裡只有 14 個用到 Teable 的其他套件，其餘只需要 React 加 10 個 npm 套件。官方測試已經示範了最小可跑的寫法：用 `<AppContext.Provider value={{ locale: {}, lang: 'en' }}>` 包住 `<Grid columns rowCount getCellContent />`。
9. **有幾件事要自己補**：複製貼上、填滿、復原/重做、資料存取，grid 都只「發出事件」。真正的處理寫在 AGPL 的 `apps/nextjs-app`，其中複製貼上還是交給後端 API 做。拆出去之後這些要自己寫。
10. **主要限制**：沒有無障礙支援（canvas 沒有 ARIA）。儲存格只能選一個矩形。觸控裝置點格子會「展開整列」，不能直接在格子裡編輯。填滿把手只能上下拉。欄寬最小值寫死 100px。沒有公式引擎，公式是在後端算的。

## 逐題詳解（每個問題一節，附 permalink 與必要的短程式碼摘錄）

### 一、渲染：一張 canvas 怎麼畫出整張表

**元件分工**（都在 `packages/sdk/src/components/grid/`）：

| 層 | 檔案 | 負責什麼 |
|---|---|---|
| 外殼 | [`Grid.tsx#L211-L842`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L211-L842) | 接收 props；建立 `CoordinateManager`、`SpriteManager`、`ImageManager`；決定用桌機層還是觸控層 |
| 互動層 | `InteractionLayer.tsx`（985 行） | 滑鼠事件 → 判斷點到哪 → 選取、拖曳、縮放、填滿；掛上編輯器 |
| 繪圖層 | `RenderLayer.tsx`（260 行） | 一個 `<canvas>`，用 `useLayoutEffect` 呼叫 `drawGrid` |
| 捲軸 | `InfiniteScroller.tsx`（417 行） | 兩個原生捲軸 div，把捲動量換算成 scrollTop/scrollLeft |
| 指示器 | `LoadingIndicator`、`ErrorIndicator` | 用 DOM 顯示 AI 填值的進度，以及錯誤和重試按鈕 |

我數了 `Grid` 的 props：`IGridExternalProps` 有 53 個，其中 31 個是 `on…` 事件，再加上 `IGridProps` 自己的 10 個，一共 63 個（[`Grid.tsx#L44-L173`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L44-L173)；數法是 grep「縮排兩格的屬性名」）。真正必要的只有 `columns`、`rowCount`、`getCellContent` 三個。另外 `IGridRef` 提供 18 個可以直接呼叫的方法，例如 `scrollTo`、`setSelection`、`getCellBounds`、`setCellLoading`（[`#L175-L197`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L175-L197)）。

**畫一幀的順序**（[`layoutRenderer.ts#L2141-L2226`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts#L2141-L2226)）：
1. 把 `devicePixelRatio` 無條件進位成整數，依此放大畫布再 `scale`，高解析度螢幕上才不會糊。
2. 執行 `drawCells`：在主畫布畫格子背景和格線（凍結區和非凍結區各 clip 一次）；儲存格的「內容」則畫在快取畫布上。
3. 把整張快取畫布用 `drawImage` 貼回主畫布。
4. 再往上疊 15 個步驟（我數 L2194-L2223 的呼叫次數）：欄標題、凍結分隔線、協作者游標、搜尋命中、統計列、作用中儲存格（放大版）、填滿預覽、填滿把手、欄寬拖曳線、列和欄的拖曳影子、凍結把手，最後把目前的可見範圍告訴 `ImageManager`。

決定要不要重畫快取，核心就這幾行：

```ts
// layoutRenderer.ts#L2088-L2100（節錄）
export const computeShouldRerender = (current: ILayoutDrawerProps, last?: ILayoutDrawerProps) => {
  if (last == null) return true;
  return !(
    current.theme === last.theme &&
    current.columns === last.columns &&
    current.getCellContent === last.getCellContent &&
    current.coordInstance === last.coordInstance &&
    current.visibleRegion === last.visibleRegion &&
    current.forceRenderFlag === last.forceRenderFlag &&
    current.hoverCellPosition === last.hoverCellPosition /* 另有 getLinearRow、real2RowIndex */
  );
};
// drawGrid 內（#L2156）：const shouldRerender = isScrolling || computeShouldRerender(props, lastProps);
```

意思是：如果只有滑鼠位置、選取範圍或作用中儲存格變了，就不重畫文字和圖片，只重畫背景和外框，再把上一次的內容快取貼上去。快取畫布是用 `document.createElement('canvas')` 建立的，從來不會放進 DOM（[`RenderLayer.tsx#L123-L128`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/RenderLayer.tsx#L123-L128)）。這裡比對的是「參照是否相同」，所以實務上有個要點：**`getCellContent` 和 `columns` 一定要用 `useCallback`/`useMemo` 固定住**，不然父元件每 render 一次，快取就全部失效。

**儲存格 renderer 的外掛介面**（[`cell-renderer/interface.ts#L258-L283`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/cell-renderer/interface.ts#L258-L283)）：每種格子是一個物件，欄位如下：
- `draw`：唯一必填，負責畫出格子。
- `measure`：格子成為作用中儲存格時，要長到多高。
- `checkRegion` 和 `onClick`：格子裡哪些地方能點，例如網址、星星、勾選框。
- `needsHover` 和 `needsHoverPosition`：要不要追蹤滑鼠位置。

`getCellRenderer` 用一個 switch 依 `CellType` 挑 renderer（[`cell-renderer/index.ts#L17-L43`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/cell-renderer/index.ts#L17-L43)）。所以要加新的格子類型，就得改這個 switch，沒有註冊機制。

`CellType` 這個 enum 有 11 個成員：Text、Link、Number、Select、Image、Chart、Rating、User、Boolean、Loading、Button（[`interface.ts#L11-L23`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/cell-renderer/interface.ts#L11-L23)），各對應一個 renderer 檔。其中兩個對你特別實用：
- `Number` 的 `showAs`：可以畫成圓環或進度條，`maxValue` 就是滿格（[`numberCellRenderer.ts#L53-L95`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/cell-renderer/numberCellRenderer.ts#L53-L95)）。拿來顯示「目前庫存／安全庫存」很直覺。
- `Chart`：在一格裡畫迷你折線圖或長條圖，滑鼠移上去會顯示數值（[`chartCellRenderer.ts#L12-L53`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/cell-renderer/chartCellRenderer.ts#L12-L53)）。適合放「近 30 天進價走勢」。

**文字**：`drawMultiLineText` 和 `drawSingleLineText` 用 `Intl.Segmenter` 處理斷行和尾端的「...」，先依「詞」切，切不下再依「字形」切，所以中文和 emoji 不會被切壞。結果存在兩個各 1,000 筆的 LRU 快取裡；多行文字的快取 key 包含字型、文字、寬度和行數（[`baseRenderer.ts#L21-L45`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/base-renderer/baseRenderer.ts#L21-L45)、[`#L102-L104`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/base-renderer/baseRenderer.ts#L102-L104)）。阿拉伯文這類由右至左的文字也有處理。

**圖示**：`SpriteManager` 把 SVG 字串轉成點陣圖。SVG 是把 `@teable/icons` 的 React 元件用 `renderToString` 輸出的。轉好的點陣依「前景色＋背景色＋尺寸＋名稱」快取在小 canvas 裡，之後每次只要 `drawImage`，而且至少用 2 倍解析度畫（[`SpriteManager.ts#L41-L92`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/managers/sprite-manager/SpriteManager.ts#L41-L92)、[`sprites.tsx#L19-L74`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/managers/sprite-manager/sprites.tsx#L19-L74)）。

**圖片**（[`ImageManager.ts#L21-L41`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/managers/image-manager/ImageManager.ts#L21-L41)、[`#L98-L171`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/managers/image-manager/ImageManager.ts#L98-L171)）：
- 只保留「可見視窗內」格子用到的圖片，捲出視窗就取消下載。
- `<img>` 物件池最多回收 12 個。
- 設定 `src` 的動作延到 `requestAnimationFrame` 才做。
- 圖片載入完成後，以 20ms 節流通知重畫。
- 載入失敗時改畫 `fallbackUrl`。

### 二、虛擬化：怎麼撐住幾十萬列

**座標管理 `CoordinateManager`**（268 行）：
- 每列高度預設都是 `rowHeight`，例外放在 `rowHeightMap`，例如分組標題 48px、新增列 32px。
- `getCellMetaData` 只量到「被問到的那一列」為止。量過的位置存在 `rowMetaDataMap`，下次不必從頭加（[`CoordinateManager.ts#L113-L150`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/managers/coordinate-manager/CoordinateManager.ts#L113-L150)）。
- 要從 scrollTop 找出第一個可見列時：已經量過的範圍直接二分搜尋；還沒量過的，先用「指數跳躍」（每次跳 1、2、4、8…列）找到大概位置，再二分搜尋（[`#L152-L209`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/managers/coordinate-manager/CoordinateManager.ts#L152-L209)）：

```ts
// CoordinateManager.ts#L152-L167（節錄）
let interval = 1;
while (index < itemCount && this.getCellMetaData(index, itemType).offset < offset) {
  index += interval;
  interval *= 2;
}
return this.findNearestCellIndexBinary(offset, Math.floor(index / 2), Math.min(index, itemCount - 1), itemType);
```

這跟 react-window 的 VariableSizeList 是同一套演算法（依既有知識比對，沒開 react-window 原始碼，未確認）。算出範圍後，`useVisibleRegion` 會往下多算 1 列當緩衝（[`useVisibleRegion.ts#L12-L32`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/hooks/useVisibleRegion.ts#L12-L32)）。

**捲軸 `InfiniteScroller`**：捲軸不是用 canvas 畫的，而是水平、垂直兩個真正的原生捲動 div，裡面放一個看不見、但非常高的「墊片」來撐出捲動長度。瀏覽器對元素高度有上限，所以墊片切成很多段，每段最多 5,000,000px（[`InfiniteScroller.tsx#L351-L362`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/InfiniteScroller.tsx#L351-L362)）。如果瀏覽器實際能捲的高度還是比需要的短，就照比例換算，補上一個 `offsetY`：

```ts
// InfiniteScroller.tsx#L158-L166
if (
  scrollableHeight > 0 &&
  (Math.abs(delta) > 2000 || newScrollTop === 0 || newScrollTop === scrollableHeight) &&
  scrollHeight > el.scrollHeight + 5
) {
  const prog = newScrollTop / scrollableHeight;
  const recomputed = (scrollHeight - el.clientHeight) * prog;
  offsetY.current = recomputed - newScrollTop;
}
```

其他捲動細節（[`#L217-L260`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/InfiniteScroller.tsx#L217-L260)）：
- 在表格上滾滑鼠滾輪時，事件會被攔下（非 passive 監聽＋`preventDefault`），換算成兩個捲軸 div 的 `scrollLeft`／`scrollTop`。
- 「捲動中」旗標 `isScrolling` 要等停止捲動 200ms 後才清掉，計時器是用 rAF 做的。
- 觸控裝置另外用 npm 套件 `scroller` 0.0.3 做慣性捲動；它的 API（`doTouchStart`、`setDimensions`）跟 Zynga Scroller 一樣，但套件來源未確認（[`#L332-L349`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/InfiniteScroller.tsx#L332-L349)）。

**分組**：傳入 `groupPoints`（分組標題，以及每組有幾列），Grid 會把它攤平成 `linearRows`，並建一張「真實列號 ↔ 畫面列號」對照表；收合的子組直接跳過（[`Grid.tsx#L417-L522`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L417-L522)）。要注意的是，這會為每一列建立一個物件，資料量越大越吃記憶體。

**資料層的視窗**：這部分不在 grid 資料夾，但一樣屬於 MIT 的 sdk。
- `computeNextWindowQuery` 決定什麼時候換頁：預設一次 300 筆，第一次 64 筆；可見範圍超出「已載入範圍扣掉 1/3 緩衝」時，才換到下一個視窗（[`record-window.ts#L3-L48`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/utils/record-window.ts#L3-L48)）。
- 可見範圍變動的通知有 30ms 的 debounce，最多等 500ms（[`use-grid-async-records.ts#L546-L565`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid-enhancements/hooks/use-grid-async-records.ts#L546-L565)）。
- 還沒載入的格子會回傳 `CellType.Loading`。

### 三、互動：滑鼠、鍵盤、拖曳

**判斷滑鼠點到哪裡**：
1. 滑鼠每移動一次，`getPosition` 就把像素座標換成列號和欄號；標題列記為 -1，新增欄按鈕記為 -2（[`InteractionLayer.tsx#L290-L309`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/InteractionLayer.tsx#L290-L309)）。
2. 接著交給 `getRegionData`，依優先順序跑 16 項檢查（[`region.ts#L79-L99`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/utils/region.ts#L79-L99)）：
   - 先看操作狀態和優先區域：凍結中、填滿把手、作用中儲存格、超出範圍、選取中、縮放中、拖曳中。
   - 再看各種控制項：凍結把手、新增欄、統計列、全選框、新增列、列標頭、分組標題。
   - 最後是儲存格和欄標題。
3. 結果是 25 種 `RegionType` 之一（[`interface.ts#L36-L62`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/interface.ts#L36-L62)）。游標樣式和點擊行為都是依這個結果決定的。

**選取模型 `CombinedSelection`**：有三種型別（[`CombinedSelection.ts#L65-L105`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/managers/selection-manager/CombinedSelection.ts#L65-L105)）：
- `Cells`：只有一個矩形，記錄起點和終點。
- `Rows` 和 `Columns`：可以選好幾段，重疊的部分會自動合併。

所以「按住 Ctrl 點選好幾塊不相連的儲存格」做不到，但整列、整欄可以複選。

**鍵盤**：`useKeyboardSelection` 用 `react-hotkeys-hook` 綁了 10 組快捷鍵（[`useKeyboardSelection.ts#L39-L242`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/hooks/useKeyboardSelection.ts#L39-L242)）：
- 方向鍵：可搭配 Shift 擴大選取、搭配 Cmd/Ctrl 跳到邊界，共 16 種組合。
- Tab、PageUp/PageDown、Cmd/Ctrl+A。
- Delete/Backspace、F2、Enter、Esc。
- Space：展開整列。
- 復原、重做。

Enter 的處理會檢查 `keyboardEvent.isComposing`，所以用注音輸入法選字時按 Enter 不會誤送出（[`#L187-L190`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/hooks/useKeyboardSelection.ts#L187-L190)）。這對台灣使用者很重要。

**各種拖曳**：
- 拖曳調欄寬，最小寬度寫死 100px（[`useColumnResize.ts#L42`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/hooks/useColumnResize.ts#L42)）。
- 拖曳列或欄來排序（`useDrag`）。
- 拖曳凍結線來改凍結欄數（`useColumnFreeze`）。
- 填滿把手，只能上下拉（[`Grid.tsx#L143-L147`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L143-L147)）。
- 拖到邊緣會自動捲動：距離邊緣 30px 開始，1.2 秒內加速到每毫秒 2px（[`useAutoScroll.ts#L7-L9`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/hooks/useAutoScroll.ts#L7-L9)）。

拖曳進行時，`mousemove` 和 `mouseup` 的監聽會從畫布改掛到 `window`，所以拖出表格外也不會中斷（[`InteractionLayer.tsx#L842-L843`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/InteractionLayer.tsx#L842-L843)）。

**觸控**：有傳 `isTouchDevice` 時，改用 `TouchLayer`，由 `react-hammerjs` 偵測點擊。點儲存格會呼叫 `onRowExpand` 打開整筆記錄，而不是直接在格子裡編輯（[`TouchLayer.tsx#L250-L254`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/TouchLayer.tsx#L250-L254)）。

**複製、貼上、刪除、復原**：grid 本身只負責發事件。隱藏的輸入框收到 `copy`、`paste` 事件時，會呼叫 `onCopy(selection, e)`、`onPaste(selection, e)`；刪除和復原則呼叫 `onDelete(selection)`、`onUndo()`（[`EditorContainer.tsx#L327-L348`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/components/editor/EditorContainer.tsx#L327-L348)）。

Teable 的實際處理寫在 AGPL 的 app 裡，會把選取範圍交給後端的 `copy`、`pasteSelectionByIdStream` 這兩支 API（[`useSelectionOperation.ts#L36-L55`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/hooks/useSelectionOperation.ts#L36-L55)、[`copyAndPaste.ts#L32-L45`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/utils/copyAndPaste.ts#L32-L45)）。拆出去之後這段要自己寫，例如用 `e.clipboardData.getData('text/plain')` 取得剪貼簿內容，再當成 TSV 解析。

### 四、編輯器：怎麼在 canvas 上打字

`EditorContainer` 是一個蓋在畫布上、絕對定位的 div。它的位置由 `CoordinateManager` 算出來，並且限制在可視範圍內（[`EditorContainer.tsx#L190-L210`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/components/editor/EditorContainer.tsx#L190-L210)）。

設計上的巧思是**編輯器一直都在**：只要有作用中儲存格，對應的編輯器就已經掛載好了。沒在編輯時，它是透明的、寬高為 0、也不接收滑鼠（[`#L181-L187`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/components/editor/EditorContainer.tsx#L181-L187)）。鍵盤焦點停在它，或停在一個隱藏的 `<input>` 上（[`#L371-L399`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/components/editor/EditorContainer.tsx#L371-L399)）。

```tsx
// EditorContainer.tsx#L311-L325（節錄）
const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (!activeCell || isEditing) return;
  if (!isPrintableKey(event.nativeEvent)) return;
  if (NO_EDITING_CELL_TYPES.has(cellType)) return;
  // …記下第一個字給選擇類編輯器當搜尋字
  setEditing(true);
  editorRef.current?.setValue?.(null);
};
```

結果就跟 Excel 一樣：選中格子直接打字就開始編輯，第一個字不會不見。選擇類的格子會把第一個字當成搜尋字 `initialSearch`。

**用哪個編輯器**（[`#L212-L309`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/components/editor/EditorContainer.tsx#L212-L309)）：
- 格子有 `customEditor`，就用它。
- 沒有的話：Text、Link、Number 共用 `TextEditor`；Boolean、Rating、Select 各有內建元件。
- Boolean 和 Rating 不會進入編輯模式。點一下時，renderer 的 `onClick` 回報 `CellRegionType.Update`，直接改值（[`#L78`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/components/editor/EditorContainer.tsx#L78)、[`InteractionLayer.tsx#L498-L551`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/InteractionLayer.tsx#L498-L551)）。
- `TextEditor` 在失焦時存檔；數字欄會自動轉成 `Number()`；需要換行的文字用 Shift+Enter（[`TextEditor.tsx#L33-L55`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/components/editor/TextEditor.tsx#L33-L55)）。

**自訂編輯器的規則很少**：元件用 `forwardRef` 對外提供 `focus`、`setValue`、`saveValue` 三個方法；props 會拿到 `cell`、`rect`、`theme`、`isEditing`、`onChange(value)`（[`EditorContainer.tsx#L55-L76`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/components/editor/EditorContainer.tsx#L55-L76)）。呼叫 `onChange` 之後，會轉成 Grid 的 `onCellEdited([欄, 列], 新格子)`。

**作用中儲存格會「長大」**：renderer 有 `measure` 的話，作用中的格子最多會展開到 5 行（`maxRowCount: 5`）。內容比 5 行還長，就在格子裡出現小捲軸（`CellScroller`）（[`Grid.tsx#L566-L602`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L566-L602)、[`textCellRenderer.ts#L116-L144`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/cell-renderer/textCellRenderer.ts#L116-L144)、[`configs/grid.ts#L5-L13`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/configs/grid.ts#L5-L13)）。

**Teable 自己的進階編輯器**放在 `grid-enhancements/editor/`，共 7 個編輯器加 1 個預覽器：日期、選項、連結、附件、Markdown 長文字、數字、使用者。`use-grid-columns.tsx` 會依欄位型別把它們掛成 `customEditor`（[`use-grid-columns.tsx#L477-L495`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid-enhancements/hooks/use-grid-columns.tsx#L477-L495)）。

不過這 7 個都直接呼叫 Teable 資料模型的 `record.updateCell(...)` 寫回 ShareDB（例如 [`GridNumberEditor.tsx#L30-L33`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid-enhancements/editor/GridNumberEditor.tsx#L30-L33)；我 grep 過，7 個檔都是這樣）。所以不能原封不動搬走，要改成呼叫 `props.onChange`。

### 五、跟 glide-data-grid 的關係

**時間線（git 證據）**：
- **2023-07-26 以前**：`GridView.tsx` 直接 `import DataEditor … from '@glideapps/glide-data-grid'`，`package.json` 依賴 glide 5.2.1（[舊版 GridView.tsx#L1-L6](https://github.com/teableio/teable/blob/24c38d68f0145fb5b18b429429011180e52cb535/apps/nextjs-app/src/features/app/blocks/view/grid/GridView.tsx#L1-L6)、[舊版 package.json#L117](https://github.com/teableio/teable/blob/24c38d68f0145fb5b18b429429011180e52cb535/apps/nextjs-app/package.json#L117)）。
- **2023-07-26，PR #99「feat: new grid」**（[commit 28a81af](https://github.com/teableio/teable/commit/28a81af2e84edcd336e2c7cd9135b4ddc71f65d9)，作者 SkyHuang）：
  - commit 訊息的子項目包括 `refactor: remove konva and draw with native canvas`、`chore: remove glide-data-grid`、`perf: add image manager & performance tracker`。
  - 這個 commit 新增 66 個檔、刪除 16 個，刪掉的包含原本給 glide 用的自訂儲存格 `components/cells/*`（用 `git show --name-status` 數）。
- **2023-08-07，PR #124「perf: grid rendering」**（[commit 1a48d68](https://github.com/teableio/teable/commit/1a48d685c58d6ff5c05c626f738c5da7616eff68)）：訊息寫「provide caching when rendering text」和「provide cache for grid rendering」，也就是現在的 LRU 文字快取和快取畫布。
- **2023-11-09，PR #249**（[commit 773ba62](https://github.com/teableio/teable/commit/773ba62c3d5af5e3a5fa9c717c6bf0c5d84e05b4)）：整個 grid 從 `apps/nextjs-app/src/features/app/blocks/grid/` 搬到 `packages/sdk/src/components/grid/`。`git log --follow` 顯示 Grid.tsx 是 R085 的搬移，也就是說，它從那時起由 AGPL 區搬進了 MIT 區。
- **2024-10-26，PR #1025**（[commit 61a65d1](https://github.com/teableio/teable/commit/61a65d1c268a66c6597393f600c221aa959aa0cd)）：附件預覽加入 `ExcelPreview.tsx`，glide 6.0.3 以「SheetJS 解析 .xlsx，再用 glide 的 `DataEditor` 唯讀顯示」的方式回到專案。檔案超過 10MB 就拒絕預覽，SheetJS 則等用到時才載入（[`ExcelPreview.tsx#L1-L2`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/ui-lib/src/base/file/preview/office/ExcelPreview.tsx#L1-L2)、[`#L65-L78`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/ui-lib/src/base/file/preview/office/ExcelPreview.tsx#L65-L78)、[`#L145-L164`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/ui-lib/src/base/file/preview/office/ExcelPreview.tsx#L145-L164)）。app 的 `_app.tsx` 也全域載入了 glide 的 CSS（[`_app.tsx#L26`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/pages/_app.tsx#L26)）。`packages/ui-lib/package.json` 也同時列了 glide 6.0.3，以及從 SheetJS CDN 安裝的 xlsx 0.20.3（[`#L132`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/ui-lib/package.json#L132)、[`#L183`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/ui-lib/package.json#L183)）。
- **到現在**：碰過新舊兩個路徑的 commit 共 144 個（2023 年 43 個、2024 年 53 個、2025 年 24 個、2026 年 24 個），最近一次是 2026-11-03，表示還在維護。不過 2026 年的 commit 多半是「[sync]」批次同步，從訊息看不出改了 grid 的哪裡。

**程式碼的相似處（未確認）**：下表是我依對 glide-data-grid 原始碼的既有了解比對的，本次只開了 Teable 這邊。同資料夾裡有另一個代理寫的 glide 資料包（`_oss-research/01-web-excel/glideapps__glide-data-grid.md`），可以交叉參考。

| Teable 檔案 | 跟 glide 的哪個部分像 | 相似程度 |
|---|---|---|
| `SpriteManager.ts` | glide 的 SpriteManager：快取 key 一樣是 `${bg}_${fg}_${size}_${sprite}`，同樣有 `inFlight` 計數，`imgSource.decode()` 之後呼叫 `onSettled` | 強（寫法幾乎一樣） |
| `ImageManager.ts` | glide 的 image-window-loader：`packColRowToNumber`、`rowShift = 1 << 16`、`imgPool`，連註解「never retain more than 12」「use request animation time…」都有 | 強 |
| `InfiniteScroller.tsx` | glide 的 infinite-scroller：5,000,000px 分段墊片、`Math.abs(delta) > 2000` 的比例換算（glide 資料包也是這樣記載） | 強 |
| `hooks/useEventListener.ts` | glide 的同名 hook：用 ref 存 handler，參數同樣是 passive 和 capture | 中 |
| `IInternalCellRenderer` | glide 的 InternalCellRenderer：`getAccessibilityString`、`onPaste`、`provideEditor`、`needsHoverPosition` 同名。Teable 只宣告了前三個，沒有任何實作或呼叫（我 grep 確認過） | 中 |
| `utils/measure.ts` 的預設字型 | 跟 glide 預設主題是同一串字型 `Inter, Roboto, -apple-system…` | 弱 |

我在整個 grid 和 grid-enhancements 資料夾 grep 了「glide」「inspired」「adapted from」「credit」，**都是 0 筆**，沒有任何註明出處的註解。第一版（28a81af 那 58 個檔）也一樣沒有。兩邊都是 MIT，個人使用沒有問題。如果以後要公開散布你改過的版本，至少要保留 Teable 的 MIT 聲明；是否也該保留 glide 的聲明屬於「未確認」，在意的話可以再自己比對 glide 原始碼。

**主要差異**：
- **Teable 有、glide 本體沒有或做法不同**：多層可收合的分組列、協作者游標、搜尋命中標示、底部統計列、AI 填值進度和錯誤指示、作用中格子展開並可在格內捲動、拖曳凍結線。
- **glide 有、Teable 沒有**：上一幀 blit 位移重用、無障礙支援（Teable 的 `getAccessibilityString` 只是宣告）、多塊不相連的選取範圍。glide 這一側是依既有知識，未確認。

### 六、效能設計總整理（含隱憂）

**已在原始碼裡看到的設計**：
1. 只畫可見的格子：`calcCells` 的迴圈只跑可見的列和欄（[`layoutRenderer.ts#L125-L330`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts#L125-L330)）。
2. 雙畫布＋`computeShouldRerender`（見第一節）。
3. 多處 LRU 快取：文字量測兩個（各 1,000 筆），select、user、button、image 四種格子各有位置快取（10～200 筆）。grid 資料夾裡 `new LRUCache` 一共 6 處。
4. 圖示點陣快取；圖片只載入可見範圍，並搭配物件池。
5. 滑鼠只有「換到另一格」才會觸發重畫：`RenderLayer` 先把 mouseState 的 x/y 清成 0 再做 memo，只有拖曳中才保留座標（[`RenderLayer.tsx#L130-L144`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/RenderLayer.tsx#L130-L144)）。也只有需要的 renderer（例如含網址的文字）才追蹤格子內的座標（[`InteractionLayer.tsx#L105-L115`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/InteractionLayer.tsx#L105-L115)）。
6. 用 `useLayoutEffect` 在瀏覽器上色前就畫好，避免畫布和編輯器 DOM 不同步而閃一幀（[`RenderLayer.tsx#L146-L148`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/RenderLayer.tsx#L146-L148)）。
7. 量測工具：Teable app 掛了 `useScrollFrameRate`，在瀏覽器 Console 輸入 `measureRate(捲動量, 秒數)`，它就會自動捲動並印出平均 FPS（[`useScrollFrameRate.ts#L27-L65`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/hooks/useScrollFrameRate.ts#L27-L65)、[`GridViewBaseInner.tsx#L1589`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx#L1589)）。`PerformanceTracker` 雖然有寫，但 grep 不到任何呼叫。

**讀程式時看到的隱憂**（推論，未實測）：
- 捲動時每一幀都重畫全部可見內容：捲動中 `shouldRerender` 一定是 true（[`layoutRenderer.ts#L2156`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts#L2156)），沒有 blit。
- 每個可見格子每幀會呼叫 `getCellContent` 兩次，`calcCells` 一次（[`#L203`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts#L203)）、`drawCellContent` 一次（[`#L85`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts#L85)）。所以你的 `getCellContent` 必須很快，最好直接查陣列。
- `Grid` 每次 render 都會讀 `coordInstance.totalHeight`（[`Grid.tsx#L552`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L552)），它會一路量到最後一列（[`CoordinateManager.ts#L99-L102`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/managers/coordinate-manager/CoordinateManager.ts#L99-L102)）。而列數一變，就會重建 `CoordinateManager`（[`Grid.tsx#L534-L550`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L534-L550)）。結果是每新增或刪除一列，就要把所有列重新走一遍，並為每一列存一個物件。幾萬列感覺不出來，到百萬列就要注意記憶體。
- 每次捲動事件都會 `setScrollState`，讓整棵 Grid 的 React 元件重新 render。全部工作都在主執行緒，沒有用 Worker 或 OffscreenCanvas（grep 結果 0 筆）。

### 七、能不能單獨拿出來用

可以。Teable 自己就在 4 個檔案裡重複使用它：主表格、查詢預覽表、連結選擇清單、記錄快照表（grep `<Grid`）。主表格那個檔裡還另外用了 2 次，給預填列和預排序列。最簡單的範例是 MIT 區的 `RecordSnapshotGrid.tsx`，只傳 16 個 props（外加 ref）就做出一個唯讀表格（[`RecordSnapshotGrid.tsx#L260-L278`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/record-snapshot-grid/RecordSnapshotGrid.tsx#L260-L278)）。

**依賴盤點**（用只讀的 Python 腳本掃 77 個程式檔的 import）：
- 用到 Teable 其他套件的只有 14 個檔：
  - `@teable/ui-lib`：14 個符號，包括 cn、Button、Tooltip 系列、Input、Command 系列、useUiDirection。
  - `@teable/icons`：14 個圖示。
  - `@teable/core`：5 個符號（getRandomString、Colors、contractColorForTheme，以及 2 個只是型別）。
  - sdk 內部 9 個模組：i18n、觸控偵測、文字方向、網址偵測、選項配色、`IUser` 和 `Record` 型別等。
- 第三方 npm：除了 React 和 ReactDOM，還有 10 個：lodash、lru-cache、react-use、react-hotkeys-hook、react-textarea-autosize、react-hammerjs、scroller、ts-key-enum、ts-keycode-enum，以及 tailwindcss（只用到 `tailwindcss/colors` 調色盤）。
- 樣式：畫布裡的內容完全不靠 CSS。DOM 的部分用 Tailwind class（12 個檔、53 處 `className=`），捲軸外觀則靠 app 裝的 `tailwind-scrollbar` 外掛和自訂的 `.scrollbar-min-thumb`（[`apps/nextjs-app/tailwind.config.js#L6-L29`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/tailwind.config.js#L6-L29)）。

**一個會卡住你的地方**：`Grid` 一定會渲染 `ErrorIndicator`。`ErrorIndicator` 會呼叫 sdk 的 `useTranslation()`，裡面解構 `AppContext`；而 `AppContext` 的預設值是 `null`。所以沒有包 Provider 的話，依程式碼判讀會直接丟出 TypeError（[`ErrorIndicator.tsx#L15-L17`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/components/ErrorIndicator.tsx#L15-L17)、[`AppContext.ts#L14`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/context/app/AppContext.ts#L14)）。官方測試也特地包了 Provider，以下就是照著測試改寫的：

```tsx
// 依 grid-edit-exit.spec.tsx#L76-L94 改寫的最小範例（未實際執行）
<AppContext.Provider value={{ locale: {} as never, lang: 'en' }}>
  <Grid
    style={{ width: 800, height: 400 }}
    columns={columns /* 例：[{ id: 'sku', name: '料號', width: 150 }]，用 useMemo 固定 */}
    rowCount={rows.length}
    getCellContent={getCellContent /* useCallback：([col, row]) => ({ type: CellType.Text, data, displayData }) */}
    onCellEdited={([col, row], cell) => save(row, col, cell.data)}
  />
</AppContext.Provider>
```

（測試原文見 [`grid-edit-exit.spec.tsx#L76-L94`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/grid-edit-exit.spec.tsx#L76-L94)。）

**那直接裝 npm 的 `@teable/sdk` 呢？** 不建議，原因有三：
- `packages/sdk/package.json` 雖然設了 `publishConfig.access: public`（版本 1.10.0），但 `exports` 只開放根路徑 `.` 和 `./ui.config`（及其 `.cjs`），不能寫 `import … from '@teable/sdk/components/grid'`。
- 整包有 71 個 dependencies，包括 sharedb、milkdown、tiptap、codemirror 等（[`package.json#L23-L39`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/package.json#L23-L39)、[`#L58-L130`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/package.json#L58-L130)）。
- npm 上實際發佈到哪一版、是否跟 develop 同步：未確認（本次規定不能連 npm）。

結論：複製原始碼比裝整包划算。

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

想自己讀的話，照這個順序（路徑都相對於 `packages/sdk/src/components/grid/`）：

1. `interface.ts`：先看資料型別，包括 `IGridColumn`（L83-L97）、`RegionType`（L36-L62）、分組用的 `IGroupPoint` 和 `ILinearRow`（L190-L238）。
2. `renderers/cell-renderer/interface.ts`：`CellType` 和 `IBaseCellRenderer`，弄懂「一格長什麼樣」。
3. `Grid.tsx`：props（L44-L197）、建立座標管理（L534-L564）、組裝各元件（L676-L838）。
4. `managers/coordinate-manager/CoordinateManager.ts`：虛擬化的核心，整個檔才 268 行。
5. `hooks/useVisibleRegion.ts`：53 行，看可見範圍怎麼算。
6. `InfiniteScroller.tsx`：原生捲軸和超高高度的處理（L143-L260、L351-L413）。
7. `RenderLayer.tsx`：畫布和 `useLayoutEffect`。
8. `renderers/layout-renderer/layoutRenderer.ts`（2,226 行）：先看最後約 140 行的 `computeShouldRerender`、`drawCacheContent`、`drawGrid`，再看 `calcCells`（L125-L330）、`drawCells`（L348-L455）、`drawActiveCell`（L591-L700）。檔案裡一共有 30 個 `export const draw…`，其他的需要時再查。
9. `renderers/base-renderer/baseRenderer.ts`：繪圖的基本函式，包括文字斷行、圓角矩形、勾選框、圓環、進度條、迷你圖。
10. `renderers/cell-renderer/textCellRenderer.ts`：最完整的 renderer 範本，`draw`、`measure`、`checkRegion`、`onClick` 都有。
11. `InteractionLayer.tsx`：事件的總管，看 `getPosition`（L290）和 `onMouseDown`／`onMouseMove`／`onMouseUp`（L613-L797）。
12. `utils/region.ts`：判斷點到哪裡的優先順序（L79-L99）。
13. `managers/selection-manager/CombinedSelection.ts` 和 `hooks/useSelection.ts`：選取模型。
14. `components/editor/EditorContainer.tsx` 和 `TextEditor.tsx`：編輯器的運作方式。
15. `hooks/useKeyboardSelection.ts`：快捷鍵。
16. `managers/sprite-manager/*` 和 `managers/image-manager/ImageManager.ts`：圖示和圖片的快取。
17. 想知道資料怎麼接進來：`../grid-enhancements/hooks/use-grid-columns.tsx`（欄位怎麼轉成格子）、`../../utils/record-window.ts`（分頁視窗）、`../record-snapshot-grid/RecordSnapshotGrid.tsx`（最簡單的使用範例）。

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 想借的東西 | 檔案 | 依賴 | 難度 | 怎麼接到你的專案 |
|---|---|---|---|---|
| 整個 canvas grid | `packages/sdk/src/components/grid/` 全部 | React＋10 個 npm；14 個檔要換掉 Teable 依賴 | 中 | 用 Vite 打包成 React 元件，掛進現有頁面 |
| 座標和虛擬化引擎 | `CoordinateManager.ts`＋`useVisibleRegion.ts` | 無（純 TS） | 低 | 改寫成純 JS，搭配你自己的 canvas 或 DOM 表格 |
| 超高捲軸 | `InfiniteScroller.tsx`（重點在 L143-L215、L351-L362） | React；觸控才需要 scroller | 低～中 | 純 JS 版本：兩個 div 加上 onscroll 就能做 |
| 雙畫布快取 | `layoutRenderer.ts` 的 L348-L455、L2088-L2226 | 本身不靠套件，但跟 props 型別綁在一起 | 中 | 當設計參考，照這個思路寫你自己的 drawGrid |
| 文字斷行和省略 | `baseRenderer.ts` 的 L21-L339 | lru-cache；`text-direction.ts`（56 行，無依賴） | 低 | 直接拿，中文斷行能用 |
| 圖示快取、圖片視窗載入 | `SpriteManager.ts`、`ImageManager.ts` | lodash 的 throttle | 低 | 直接拿 |
| 數字進度條/圓環、迷你圖 | `numberCellRenderer.ts`、`chartCellRenderer.ts`，加上 `baseRenderer` 的 `drawRing`、`drawProcessBar`、`drawChart*` | 同上 | 低 | 做庫存水位欄、價格走勢欄 |
| Excel 檔預覽 | `packages/ui-lib/src/base/file/preview/office/ExcelPreview.tsx`（189 行） | glide-data-grid 6.0.3、xlsx（SheetJS） | 低 | 上傳 .xlsx 時先預覽，再決定要不要匯入 |
| AI 填值進度和錯誤 | `LoadingIndicator.tsx`、`ErrorIndicator.tsx`，加上 ref 方法 `setColumnLoadings`、`setCellLoading`、`setCellErrors` | `@teable/icons`、ui-lib | 低～中 | 用 Claude 批次產生商品文案或腳本時，顯示每格的進度，失敗可重試 |

**用 Claude Code 拆出整個 grid 的建議步驟**：
1. **建專案、複製檔案**：開一個 Vite + React + TypeScript 新專案（例如 `my-grid`），把 `packages/sdk/src/components/grid/` 整個複製到 `src/grid/`，`packages/sdk/LICENSE` 也一起帶走。
2. **補上 sdk 內部的小檔案**：
   - `utils/text-direction.ts`：56 行，沒有依賴。
   - `utils/find-urls.ts`：146 行，只依賴 lru-cache。
   - `context/app/AppContext.ts` 和 `i18n/useTranslation.ts`：也可以直接把 `ErrorIndicator` 裡的 `t()` 換成中文字串。
   - `hooks/use-is-touch-device.ts`：可以簡化成 `matchMedia('(pointer: coarse)')`。
   - `hooks/use-content-dir.ts`：直接回傳 undefined 就好。
3. **替換 `@teable/*`**：
   - `cn` 換成 `clsx`。
   - Button、Tooltip、Input、Command 換成你自己的簡單元件，或改用 shadcn。
   - 14 個圖示：名稱和 `lucide-react` 一樣，可以找同名圖示替代（`MagicAi`、`DraggableHandle` 要另外找；外觀是否完全相同未確認）。
   - `getRandomString` 換成 `crypto.randomUUID()`。
   - 用不到 `Button` 格子類型的話，可以整個刪掉，連帶刪掉 `@teable/core` 的按鈕型別、`select-color.ts`、`IButtonClickStatusHook` 和 `Record` 型別。
4. **處理樣式**：把 `gridTheme.ts` 裡 `tailwindcss/colors` 的顏色直接寫成十六進位色碼。DOM 部分的 Tailwind class 可以保留（另外安裝 Tailwind 和 tailwind-scrollbar），也可以改寫成一般 CSS。
5. **接到 Firebase 頁面**：用 Vite 的 library mode 打包成一支 ES module，在你 Firebase 的純 JS 頁面用 `createRoot(div).render(<GridApp/>)` 掛上去。
   - `getCellContent`：從你已經抓好的 Firestore 陣列取值，不要在裡面查資料庫。
   - `onCellEdited`：把修改寫回 Firestore。
6. **補上 grid 沒有的功能**：複製貼上（`onCopy`／`onPaste` 拿到的是 `CombinedSelection` 加剪貼簿事件，轉成 TSV 即可）、復原/重做的堆疊、刪除。這些**不要**從 `apps/nextjs-app` 複製，那裡是 AGPL。

**對應到你的三個主題**：
- **倉儲、比價、ERP**：
  - `Number` 格用 Bar 顯示「庫存／安全庫存」的比例。
  - `Chart` 格顯示歷史進價。
  - `groupPoints` 依倉別或商品分類分組。
  - 用填滿把手批次改值。
  - 凍結前兩欄（料號、品名）。
- **AI 影片和腳本**：
  - 一列代表一個分鏡：文字格放描述、圖片格放畫面、數字格放秒數。
  - 用 Claude 批次產生腳本時，`setColumnLoadings` 顯示整欄進度，`setCellErrors` 顯示失敗並提供重試。
  - 長文字用 `isWrap` 的文字格，編輯器裡用 Shift+Enter 換行。

## 坑與限制

1. **一定要包 AppContext**：不包 `AppContext.Provider`，`ErrorIndicator` 就會出錯（見第七節）。
2. **授權的界線**：grid 本身在 MIT 的 `packages/` 裡。但實際使用它的 `GridViewBaseInner.tsx`（2,037 行），以及複製貼上、填滿、選取操作（`useSelectionOperation.ts`，1,880 行），都在 AGPL 的 `apps/nextjs-app`。只抄 `packages/` 的東西就沒有 AGPL 的問題。另外，Teable 的名稱和 logo 這類品牌素材另有保護條款（[LICENSE#L21-L37](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/LICENSE#L21-L37)）。
3. **沒有無障礙支援**：canvas 沒有 ARIA。grid 裡 grep `aria-`，只有下拉選單內的 1 處，螢幕閱讀器讀不到格子內容。
4. **選取的限制**：儲存格只能選一個矩形；填滿只能上下拉；Cmd/Ctrl+A 只有在有作用中儲存格時才有效（[`useKeyboardSelection.ts#L156-L169`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/hooks/useKeyboardSelection.ts#L156-L169)）。
5. **觸控**：手機或平板點格子是展開整列，沒辦法在格子裡直接編輯，也不能用手指拖曳選取（`TouchLayer` 沒有掛 `EditorContainer`）。如果倉庫要用平板盤點，得另外做一個表單畫面。
6. **新增格子類型要改 switch**：`getCellRenderer` 是寫死的 switch，沒有外掛註冊機制。不過多數需求用現有的 Text、Number 加上 `customEditor` 就夠了。
7. **一些寫死的預設值**：最小欄寬 100px；預設列高 32、欄寬 150；`freezeColumnCount` 預設凍結 1 欄（[`Grid.tsx#L220`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L220)、[`configs/grid.ts#L5-L48`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/configs/grid.ts#L5-L48)）。
8. **效能隱憂**：見第六節，包括捲動時全部重畫、`getCellContent` 每格每幀被叫兩次、列數一變就全部重新量測。資料量要上百萬列之前，建議先用 `measureRate` 實際測一下。
9. **老舊或擺錯位置的依賴**：
   - `react-hammerjs` 1.0.1 和 `scroller` 0.0.3（只有觸控會用到）都很舊，長期維護有風險。
   - `tailwindcss` 在 sdk 裡只是 devDependency，但 `gridTheme.ts` 在執行時就 import 了它的 colors（[`gridTheme.ts#L1`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/configs/gridTheme.ts#L1)、[`package.json#L160`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/package.json#L160)）。獨立打包時記得安裝，或改寫掉。
10. **沒有公式**：這只是「格子的外殼」。公式、排序、篩選、分組都在 Teable 後端計算。如果需要 Excel 公式，要另外接，例如 HyperFormula（同資料夾有它的資料包）。
11. **刻意鎖成由左至右**：整個表格強制 `dir="ltr"`，欄的順序不會左右鏡像（[`Grid.tsx#L677-L682`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L677-L682)）。中文介面不受影響。
