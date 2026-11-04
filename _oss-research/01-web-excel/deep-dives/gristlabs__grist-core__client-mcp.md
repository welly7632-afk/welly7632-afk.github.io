# gristlabs/grist-core｜深入：前端、嵌入與 MCP 整合

> 深入分析｜掃描日期：2026-11-04｜commit：484236f｜總覽資料包：_oss-research/01-web-excel/gristlabs__grist-core.md

> 這篇只看六件事：表格前端怎麼做、怎麼嵌進別的網頁、MCP（讓 Claude 讀寫 Grist）在哪裡、REST API、xlsx 匯入匯出、權限規則。grist-core 的連結都釘在 commit `484236f6abc960ed7dadade5c2b714465492a063`。另外讀了伴隨專案 **gristlabs/grist-static**（commit `e4aa8369de0229edba33058c9afe1c56e3a7adca`，Apache-2.0）。MCP 真正的實作在 **gristlabs/grist-ee**，我執行 `git clone` 時 GitHub 要求帳號密碼（不公開），所以 MCP 內部只能從 grist-core 這一側的「掛勾」反推，推論處都標「未確認」。數字是我用 `wc -l`、`grep -c`、`grep -rl`、`find` 自己數的，數法寫在旁邊。

## 重點結論（5–10 點）

1. **grist-core 裡沒有 MCP 伺服器本體。** README 把「MCP server（2026）」列在「Features not in grist-core」，`Telemetry.ts` 的註解直接寫「the MCP server implementation lives in ext/」。grist-core 只留了插座：`/api/docs/:docId/mcp` 路由轉送（要 `GRIST_MCP_ENABLED=true` 才掛上）、CORS 標頭、OAuth 權杖欄位、API 用量計算、遙測欄位，以及 Assistant 介面上兩個註明「給 MCP 用」的方法 `callTool`／`getServerTools`。
2. **讓 Claude 讀寫 Grist 有兩條路。** (A) 跑完整版：Docker 映像 `gristlabs/grist` 內含擴充，README 說個人與年度資金少於 100 萬美元的小組織可免費取得啟用碼，再開 `GRIST_MCP_ENABLED`、`GRIST_ENABLE_OIDC_SERVER`、`GRIST_ENABLE_OIDC_DCR`。(B) 只用開源的 grist-core：拿 API Key 呼叫 REST API，再請 Claude Code 寫一支小型 MCP 伺服器包起來（README 也這樣建議）。第三節附「工具 ↔ 端點」對照表。
3. **表格不是 GrainJS 寫的。** 核心 `GridView.ts`（2,635 行）用 Knockout 3.5.0 的 observable 加自家 `koDom` 綁定，再加自製虛擬捲動 `koDomScrolly.js`（659 行）。GrainJS 1.1.0 是 Grist Labs 自己的小型響應式 DOM 函式庫，用在較新的介面。app/client 下 543 個 .ts/.js 檔中，405 個 import grainjs、72 個 import knockout（`grep -rl` 計），兩者靠 `setupKoDisposal(ko)` 共存。
4. **只做直向虛擬化。** 只渲染「看得到的列＋上下各 5 列緩衝」，每列高度存在 Fenwick tree（`BinaryIndexedTree.js`，258 行、零相依），捲出畫面的 DOM 與 row model 會回收重用；但每一列都用 `kd.foreach` 把全部欄位畫出來，我沒找到橫向（欄）虛擬化。
5. **前端不算公式。** 編輯儲存格 → 變成 `UpdateRecord` 動作 → `BundleSender` 把同一個 tick 內的動作合併 → 經 WebSocket 呼叫 `applyUserActions` → 伺服器上的 Python 資料引擎重算 → 把 DocActions 廣播回所有瀏覽器。
6. **grist-static 是「把整個後端搬進瀏覽器」。** SQLite 換成 sql.js（WASM）、Python 用 Pyodide 0.28.1 跑在 Web Worker、用 31 條 webpack alias 把 Node 專用模組換成 stub，連 DocApi 的 REST 路由都掛在頁面內的迷你 Express 上。任何靜態主機（包含 Firebase Hosting）都能放，但改動不會被儲存，也沒有權限控制。
7. **REST API 很完整。** `DocApi.ts` 72 個路由、`DocApiTriggers.ts`（webhooks）13 個、`ApiServer.ts`（組織／工作區／文件管理）52 個；認證是 `Authorization: Bearer <API Key>`。records 支援 GET／POST／PATCH／PUT（upsert）；`/sql` 只能 SELECT，而且要求使用者「能複製整份文件」。
8. **xlsx 匯入只拿值、不拿公式。** 匯入在 Python 端用 openpyxl，參數 `data_only=True`，Excel 公式只剩快取的計算結果；匯出用 exceljs（Node worker threads，最多 4 條）輸出值與數字格式，同樣不輸出公式。
9. **權限規則存在文件本身。** `_grist_ACLResources`／`_grist_ACLRules` 兩張中繼資料表；條件用類 Python 語法寫，由 Python 解析成 JSON 樹，再由 TypeScript 編成判斷函式；伺服器端 `GranularAccess.ts`（3,588 行）寫入前檢查、送出前審查，REST 讀取也走同一關。
10. **最值得借的零件**：虛擬捲動演算法（koDomScrolly＋BinaryIndexedTree）、exceljs 匯出含日期／貨幣格式（ExcelFormatter＋convertToExcel）、從 Excel／Google 試算表貼上的 HTML 解析（parsePasteHtml）、批次送出模式（BundleSender）、records／upsert 的 REST 介面形狀、grist-static「一行 script 嵌進任何網頁」的做法。

## 逐題詳解（每個問題一節，附 permalink 與必要的短程式碼摘錄）

### 一、app/client 的表格實作（GrainJS、DOM 虛擬化）

#### 1-1 技術棧：新舊混搭

- 版本：[`"grainjs": "1.1.0"`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/package.json#L184)、[`"knockout": "3.5.0"`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/package.json#L199)，另有 backbone、jquery、underscore 等舊式函式庫。
- [GridView.ts 第 63–79 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L63-L79) 同時 import grainjs（`dom`、`Computed`、`Observable`…）與 knockout。DOM 由 GrainJS 的 `dom()` 建立，但大部分綁定是 `kd.*`（`app/client/lib/koDom.js`，Knockout 版綁定）。
- [app/client/app.js 第 19–22 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/app.js#L19-L22) 呼叫 `setupKoDisposal(ko)`：GrainJS 移除 DOM 時一併清掉 Knockout 訂閱，這是兩套系統能混用的關鍵。
- 計數方法：在 app/client 的 .ts/.js 中 `grep -rl` 找 `from "grainjs"`／`require("grainjs")` 得 405 個檔，同法找 knockout 得 72 個；`find` 得 .ts/.js 共 543 個。

#### 1-2 資料怎麼進到畫面：BaseView → LazyArrayModel → scrolly

1. [BaseView.ts 第 201–202 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/BaseView.ts#L201-L202)：`this.viewData = this.tableModel.createLazyRowsModel(this.sortedRows)`，把排序／篩選後的 rowId 清單包成 **LazyArrayModel**。
2. [DataTableModel.js 第 93–135 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/models/DataTableModel.js#L93-L135)：LazyArrayModel 是「長度等於總列數、但大部分位置是 null」的陣列，只有正在顯示的列才配置 `DataRowModel`。
3. [第 163–195 行 `setItemModel`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/models/DataTableModel.js#L163-L195)：把一個 row model 搬到新索引（舊位置歸 null）。捲動時就是靠「搬家」而不是新建物件。
4. 整個專案只有兩處用 scrolly：表格 [GridView.ts 第 1621–1624 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L1621-L1624)，和卡片清單 [DetailView.ts 第 382 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/DetailView.ts#L382)。

#### 1-3 虛擬捲動 koDomScrolly.js 拆解

- **兩層 DOM**（[第 24–51 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js#L24-L51)）：外層 `scrolly_outer` 高度＝全部列高總和（撐出捲軸），內層 blockDiv 用 `position:absolute; top:blockTop` 只放真正渲染的列。可以有多個 pane 同步捲動（例如左邊列號、右邊資料）。
- **狀態**（[第 164–175 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js#L164-L175)）：`rowHeights` 陣列＋`rowOffsetTree`（Fenwick tree，O(log n) 查「第 i 列的 y 座標」與「某 y 座標落在第幾列」），`minRowHeight = 23` px。
- **算要渲染幾列**（[第 292–308 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js#L292-L308)、[第 622–627 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js#L622-L627)）：

```js
var numVisible = Math.max(1, Math.ceil((overrideHeight ?? this.shownHeight) / this.minRowHeight));
this.numBuffered = 5;
this.numRendered = numVisible + 2 * this.numBuffered;
// _updateRange()
const begin = this.rowOffsetTree.getIndex(this.scrollTop) - this.numBuffered;
```

- **捲動**（[第 321–352 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js#L321-L352)）：新的可視範圍若仍在已渲染區塊內，直接返回、不重畫。
- **render 五步驟**（[第 402–511 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js#L402-L511)）：① 範圍外的 model 放進 freeList；② 缺的位置從 freeList 取或新建，`setItemModel` 指派；③ 各 pane `prepareNewRows` 重用舊 DOM、只替新列建 DOM；④ 一次量完新列實際高度（集中成一次 reflow），差值寫回 Fenwick tree；⑤ 依序擺放 DOM，並修正 scrollTop，避免上方列高變化讓畫面跳動。
- **Fenwick tree**：[BinaryIndexedTree.js 第 1–15 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/BinaryIndexedTree.js#L1-L15)，整檔 258 行，`grep -c` 計 require／import 為 0，可以直接帶走。

> **白話說明**：想像一份 5 萬列的庫存表。瀏覽器真的畫出來的只有螢幕上那三、四十列，加上上下各 5 列備用；你往下捲，程式不是新畫一列，而是把捲出畫面的那幾個「格子盒」搬到下面、換上新資料。Fenwick tree 則像一張「累計高度速查表」：要跳到第 30,000 列時，不用把前面每列高度加一遍，查幾次就知道它在第幾個像素。你自己的倉庫系統如果商品一多就卡，原因通常就是把全部列都畫出來；照這個做法改，列數再多也只畫幾十列。

#### 1-4 欄位、凍結欄與游標效能

- 欄寬也用同一種樹：[GridView.ts 第 253–259 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L253-L259) 用各欄寬建 `colRightOffsets`，用來算凍結欄位置、拖曳選取時滑鼠落在哪一欄。
- 每列畫全部欄：[第 1783–1830 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L1783-L1830) `kd.foreach(v.viewFields(), ...)` 為每個欄位建一個 `div.field`。列很多沒問題，欄非常多（上百欄）時每列 DOM 會變重（效能未實測）。
- [第 1638–1658 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L1638-L1658) 的註解說明一個好技巧：每列一個 `isRowActive`，只有作用中的那列才訂閱 `isCellActive`，游標移動時的計算量從「列數 × 欄數」降到「列數 + 2 × 欄數」。

#### 1-5 編輯後怎麼存

1. [DataRowModel.ts 第 58–67 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/models/DataRowModel.ts#L58-L67)：`updateColValues` 產生 `["UpdateRecord", rowId, colValues]`（新增列時是 `AddRecord`），呼叫 `sendTableAction`。
2. [DocData.ts 第 239–279 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/models/DocData.ts#L239-L279)：`BundleSender` 用 `Promise.resolve().then(...)` 延到下一個 tick，把同一 tick 的多個動作合成一次送出（例如貼上一大塊資料）。
3. [DocComm.ts 第 19–33 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/DocComm.ts#L19-L33)：`fetchTable`、`applyUserActions`、`importFiles` 等全部是 WebSocket 上的 RPC。
4. 伺服器的 Python 資料引擎算完公式後回傳 DocActions，前端各 row model 更新畫面。公式引擎細節在另一份深入分析（data-engine），這裡不重複。

#### 1-6 選取、貼上、快捷鍵

- [CellSelector.ts 第 9–36 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/CellSelector.ts#L9-L36)：選取分 ROW／COL／CELL 三種，各記 start／end。
- [Clipboard.ts 第 1–20 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/Clipboard.ts#L1-L20)：用一個永遠保持焦點、內含選取文字的隱藏 textarea 攔截瀏覽器的 copy／cut／paste 事件。
- [tableUtil.ts 第 112–144 行 `parsePasteHtml`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/tableUtil.ts#L112-L144)：把剪貼簿裡的 HTML 表格（從 Excel、Google 試算表或 Grist 自己複製）解析成二維陣列；Grist 自己複製時會帶 `data-grist-raw-value` 保留原始型別。
- 快捷鍵集中在 `commandList.ts`，`grep -c '^\s+name: "'` 數到 135 個命令，例如 [undo／redo](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/commandList.ts#L200-L207)（`Mod+z`、`Mod+Shift+Z`）與 `fillSelectionDown`（`Mod+D`）。

### 二、grist-static 純前端嵌入

#### 2-1 怎麼用

[grist-static README 第 39–63 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/README.md#L39-L63)：在 `<head>` 載入 `https://grist-static.com/latest.js`，再呼叫：

```html
<script>
  bootstrapGrist({ initialFile: 'investment-research.grist', name: 'Investment Research' });
</script>
```

- `initialData: 'xxx.csv'` 匯入 CSV；`elementId` 嵌在頁面某個 div 裡；`singlePage: true` 用精簡版面。一頁放多個的例子見 [page/index_embed.html 第 33–50 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/page/index_embed.html#L33-L50)。
- `<csv-viewer>` web component 與 `data-grist-csv-open` 按鈕：[README 第 93–116 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/README.md#L93-L116)。
- 不想用官方 CDN，可從 npm 套件 `grist-static` 取出 `dist/` 自己託管：[README 第 179–198 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/README.md#L179-L198)。
- `elementId` 模式的實作：[bootstrap.js 第 13–66 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/pipe/bootstrap.js#L13-L66) 其實是動態建一個 `iframe srcdoc`，在裡面再呼叫一次 `bootstrapGrist`；[第 109–144 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/pipe/bootstrap.js#L109-L144) 手動組出 `window.gristConfig`，隱藏說明中心、帳單、多站台等介面。

#### 2-2 原理：core 子模組＋ext 覆寫

- [DEV.md 第 3–22 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/DEV.md#L3-L22)：`core/` 是不改動的 grist-core 子模組，`ext/` 放替換檔，webpack 與 TypeScript paths 兩套覆寫機制。
- 子模組固定在 grist-core 的 `2d13642`（`git ls-tree HEAD core` 讀到；我另外 `git fetch` 這一個 commit，`git log` 顯示日期 2026-08-27），比本篇掃描的 `484236f`（2026-11-04）早約 10 週，兩者程式碼可能有落差。
- [webpack.config.js 第 28–65 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/buildtools/webpack.config.js#L28-L65)：逐行數到 31 條 alias，例如 `express`、`@gristlabs/sqlite3` → 空 stub，`app/client/components/Comm`（WebSocket）→ `CommStub`，`exceljs` → 瀏覽器版。
- [create.ts 第 60–97 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/server/lib/create.ts#L60-L97)：`StaticCreate` 覆寫 grist-core 的 `ICreate`：`getSqliteVariant()` 回傳 sql.js 版，`NSandbox()` 回傳 `PyodideSandbox`（postMessage 給 Web Worker，用 Mutex 保證一次一個呼叫）。

#### 2-3 資料引擎跑在 Web Worker

[webworker.js 第 23–68 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/pipe/webworker.js#L23-L68)：`loadPyodide()` → 載入相依 wheel 與 `grist-1.0-py3-none-any.whl`（Grist 的 Python 資料引擎）→ `import main`。[第 70–85 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/pipe/webworker.js#L70-L85) 以 `{type:'call', name, args}` 訊息呼叫 Python 函式。[ext/package.json](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/package.json#L1-L14) 鎖 `pyodide 0.28.1`、`sql.js ^1.8.0`；[DEV.md 第 104–111 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/DEV.md#L104-L111) 提醒 Pyodide 內建的 Python 版本必須和 grist-core 相符，否則 wheel 會全部 404。

#### 2-4 頁面內的 REST API

- [CommStub.ts 第 98–130 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/server/lib/CommStub.ts#L98-L130)：`openDoc` 直接在瀏覽器 new 出 `DocManager`、`ActiveDoc`（原本是伺服器物件），載入 `.grist` 種子檔或匯入 CSV，最後設定 `gristOverrides.expressApp`。
- [Doc.ts 第 61–192 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/server/Doc.ts#L61-L192) `MiniExpressImpl`：只比對路徑、執行最後一個 handler（中介層跳過）的假 Express；[第 258–277 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/server/Doc.ts#L258-L277) 把 grist-core 的 `addDocApiRoutes` 整組掛上去。
- [HookStub.ts 第 133–198 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/client/HookStub.ts#L133-L198)：下載連結（例如 `/api/docs/<id>/download/xlsx`）改成在頁面內執行 REST handler，再用 Blob 觸發下載；同時掛到 `window.fetchDownloadContent`。
- xlsx 匯出：[ExportXLSXStub.ts](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/server/lib/ExportXLSXStub.ts#L1-L14) 直接呼叫 core 的 `workerExporter.doMakeXLSXFromOptions`；core 的 [workerExporter.ts 第 167–187 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/workerExporter.ts#L167-L187) 註解也寫明「沒有 stream 時改用 Workbook，這是給 grist-static 用的」。

#### 2-5 grist-core 為它留的接口

- [ICreate.ts 第 63–123 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ICreate.ts#L63-L123)：`NSandbox()`、`getSqliteVariant?()`、`Assistant()`、`addExtraDocWorkerEndpoints?()` 都是可替換點；core 版預設在 [stubs/app/server/lib/create.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/stubs/app/server/lib/create.ts#L13-L15)。grist-static 和完整版都是靠換掉它來接上自己的東西。
- [DefaultHooks.ts 第 5–23 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/DefaultHooks.ts#L5-L23)：前端 `IHooks`（`fetch`、`baseURI`、`urlTweaks`、`maybeModifyLinkAttrs`），註解直接點名 grist-static。
- [SqliteCommon.ts 第 77–79 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/SqliteCommon.ts#L77-L79) 的 `SqliteVariant` 介面只有一個 `opener()`，所以換資料庫驅動很容易。

#### 2-6 另外兩種「嵌入」

- **iframe 嵌入正式伺服器**：[gristUrls.ts 第 617–631 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/gristUrls.ts#L617-L631)，網址加 `?embed=true` 會自動切成檢視模式（非 fork 時）並預設 `singlePage` 版面；也可只加 `style=singlePage`。
- **反過來，把你的程式嵌進 Grist（自訂小工具 custom widget）**：`app/plugin/grist-plugin-api.ts`（625 行）提供 [`fetchSelectedTable`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/grist-plugin-api.ts#L119)、[`selectedTable`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/grist-plugin-api.ts#L219)、[`onRecord`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/grist-plugin-api.ts#L357)、[`onRecords`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/grist-plugin-api.ts#L386)、[`ready`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/grist-plugin-api.ts#L480)。比價、成本試算這類小工具很適合寫成 Grist 裡的一個面板：選到哪一列，面板就算哪一列。

#### 2-7 該選哪一種嵌入方式

| 需求 | 建議 | 原因 |
|---|---|---|
| 在官網或 Firebase Hosting 上展示一份報表、價目表，讓客人自己篩選排序 | grist-static | 不需要伺服器；但改動不會存 |
| 自己和員工每天要改資料、要保存、要分權限 | 自架 Grist（Docker） | 資料存在伺服器，權限規則、REST、版本紀錄都有 |
| 在你的 Firebase 後台頁面裡「看」某份 Grist 表 | iframe＋`?embed=true` | 最省事；登入與權限由 Grist 處理（跨網域登入細節未確認） |
| 在 Grist 裡面加一個比價、成本試算、列印標籤的小工具 | 自訂小工具（grist-plugin-api） | 直接拿到使用者選到的那幾列資料 |

### 三、MCP endpoint（讓 Claude 讀寫 Grist 文件）的實作位置與用法

> **白話說明**：MCP 是 Claude 這類 AI 呼叫外部工具的共通協定。Grist 若有 MCP 端點，你在 Claude 裡加上一個「連接器」網址，就能直接說「把 A 供應商這週的報價寫進比價表」。問題在於：這個端點是 Grist 完整版的功能，開源的 grist-core 只有插座、沒有插頭。個人使用的話，最省事是走完整版（符合免費啟用碼條件的話），想保持全開源就用 REST 自己做一支小程式當橋樑。

#### 3-1 實作不在 grist-core 的證據

1. [README 第 133–138 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L133-L138)：OAuth apps 與 MCP server 都列在「Features not in grist-core」，並說 grist-core 使用者可以改用社群 MCP 伺服器、透過 REST API 連線。
2. [Telemetry.ts 第 1934–1995 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/Telemetry.ts#L1934-L1995)：只有遙測欄位定義（工具名稱、JSON-RPC method、Mcp-Session-Id、用戶端名稱與版本），註解寫「implementation lives in ext/」。
3. 擴充怎麼來：[install_edition.sh 第 1–47 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/buildtools/install_edition.sh#L1-L47) 是 `yarn install` 的 postinstall，**預設版本是 full**，接著執行 [prepare_ee.sh](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/buildtools/prepare_ee.sh#L9-L13)；[checkout-ext-directory.sh 第 38–53 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/buildtools/checkout-ext-directory.sh#L38-L53) 對 grist-ee 一律下載 `https://grist-static.com/ext/ext-built-<版本>.tar.gz` 預先編譯好的壓縮檔（版本記在 `buildtools/.grist-ee-version`，目前是 `date-2026-11-02-08-50-34`）。依任務規則我沒有下載它。
4. 對 `github.com/gristlabs/grist-ee` 執行 `git clone`，回應 `could not read Username`，需要認證。
5. 我用 `grep -ril -E '\bmcp\b|modelcontextprotocol|McpServer'` 掃整個 repo，命中 25 個檔（含 6 個語系檔），全部是設定、轉送、遙測或文案；`tools/call` 只出現在一個遙測測試檔，package.json 也沒有 `@modelcontextprotocol` 相依。

#### 3-2 grist-core 裡看得到的 MCP 掛勾

| 位置 | 作用 |
|---|---|
| [DocApiProxy.ts L120–123](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/gen-server/lib/DocApiProxy.ts#L120-L123)、[L163–165](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/gen-server/lib/DocApiProxy.ts#L163-L165)、[L172–194](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/gen-server/lib/DocApiProxy.ts#L172-L194) | 首頁伺服器把 `/api/docs/:docId/mcp` 轉給負責該文件的 doc worker。模式 `"route"`：只查文件在哪、不先檢查權限（註解：MCP 在 worker 端「每個工具各自驗證」），並轉送 `accept`、`mcp-session-id` 標頭 |
| [gristSettings.ts L182–190](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/gristSettings.ts#L182-L190) | `isMcpEnabled()` 讀 `GRIST_MCP_ENABLED`，預設 false |
| [ICreate.ts L119–123](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ICreate.ts#L119-L123)＋[DocApi.ts L200–208](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L200-L208) | `addExtraDocWorkerEndpoints`：「不屬於 grist-core 但需要 ActiveDoc 的端點」在這裡註冊，拿到同一組 `canEdit`、`withDoc` 中介層；core 預設是空函式（[ICreate.ts L292](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ICreate.ts#L292)）。推論 MCP 端點從這裡掛進來（未確認） |
| [IAssistant.ts L49–62](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/IAssistant.ts#L49-L62) | `callTool(docSession, doc, toolName, params)`「不經 LLM 直接呼叫單一工具，給 MCP endpoint 用」、`getServerTools()`「回傳不需瀏覽器的工具」。推論 MCP 的工具就是 Grist Assistant 的伺服器端工具（未確認）。core 內建的 `OpenAIAssistantV1`（[coreCreator.ts L26–28](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/coreCreator.ts#L26-L28)）沒實作這兩個方法（`grep -c` 為 0） |
| [FlexServer.ts L3097–3108](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/FlexServer.ts#L3097-L3108) | 開啟 MCP 時，CORS 允許 `mcp-protocol-version`、`mcp-session-id` |
| [AccessTokens.ts L26–48](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/AccessTokens.ts#L26-L48) | 權杖可帶 `oauth.scopes`，註解說只在伺服器端設定，例如「MCP signed URLs」 |
| [Authorizer.ts L308–326](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/Authorizer.ts#L308-L326) | Bearer 權杖先當 OAuth 權杖驗證（得到受限憑證），不是才當 API Key |
| [GristServer.ts L127–129](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/GristServer.ts#L127-L129)、[usageKeys.ts L1–2](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/usageKeys.ts#L1-L2) | MCP 工具呼叫也計入每月 API 用量上限 |
| [McpConnectBanner.ts L19–42](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/McpConnectBanner.ts#L19-L42) | 首頁橫幅「Connect Grist to Claude and ChatGPT」，註解寫明**所有版本都會顯示**，不管 MCP 有沒有開 |

#### 3-3 用法 A：完整版內建 MCP

[docker-compose 範例第 52–65 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/docker-compose-examples/grist-with-keycloak-postgres-redis-rustfs/docker-compose.yml#L52-L65)：

```yaml
GRIST_SERVER_EDITION: full
GRIST_MCP_ENABLED: true
GRIST_ENABLE_OIDC_SERVER: true   # Grist 自己當 OAuth 伺服器，發權杖給 MCP 用戶端
GRIST_ENABLE_OIDC_DCR: true      # 讓 Claude 等用戶端自動註冊
GRIST_OIDC_CIMD_ALLOWED_HOSTS: claude.ai,cursor.com,cursor.sh,vscode.dev,openai.com,chatgpt.com
```

- 旗標說明：[README 第 531–546 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L531-L546)。
- 端點：由路由推得是「每份文件一個」：`https://<你的網域>/api/docs/<docId>/mcp`。有沒有站台層級端點、工具清單有哪些，未確認；官方說明網址寫在 [gristUrls.ts 第 170 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/gristUrls.ts#L170)（support.getgrist.com/mcp/）。
- 授權：完整版擴充「not under a free or open-source license」（[README 第 250–261 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L250-L261)）；[README 第 105 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L105) 說個人與年資金少於 100 萬美元的小組織免費。想完全不碰非開源程式碼，用 `gristlabs/grist-oss` 映像或 `yarn run set-community-edition`（[README 第 299–310 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L299-L310)）。
- getgrist.com 雲端版是否開放 MCP、哪些方案可用：未確認。

#### 3-4 用法 B：只用 grist-core，自己做一個 MCP

在 Grist 個人設定產生 API Key，所有請求帶 `Authorization: Bearer <API Key>`。請 Claude Code 寫一支 MCP 伺服器（Node 或 Python 皆可），每個工具對一個端點：

| 自訂 MCP 工具 | REST 端點 | 需要的權限 |
|---|---|---|
| list_tables | `GET /api/docs/{docId}/tables` | 檢視 |
| list_columns | `GET /api/docs/{docId}/tables/{tableId}/columns` | 檢視 |
| read_records | `GET .../tables/{tableId}/records?filter={"欄":[值]}&sort=-欄&limit=50` | 檢視 |
| query_sql | `POST /api/docs/{docId}/sql`，body `{"sql":"select ...","args":[...]}` | 能複製整份文件 |
| add_records | `POST .../records`（`?flat=1` 可直接送平面物件陣列） | 編輯 |
| update_records | `PATCH .../records` | 編輯 |
| upsert_records | `PUT .../records`（以 require 欄位比對，有就更新、沒有就新增） | 編輯 |
| apply_actions | `POST /api/docs/{docId}/apply`（直接送 UserActions，例如新增欄位） | 編輯 |

`filter` 的值必須是陣列（[DocApi.ts readTable](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L215-L237) 會檢查），`sort`／`limit`／`cellFormat` 由 [DocApiUtils.ts 第 162–168 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApiUtils.ts#L162-L168) 解析。建議先只開唯讀工具，寫入工具要 Claude 先回報要改什麼再執行。

### 四、REST API

#### 4-1 規模與認證

- 計數：`grep -c -E 'this\._app\.(get|post|patch|put|delete)\('`，DocApi.ts 72、DocApiTriggers.ts 13（webhooks，例如 [L408](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApiTriggers.ts#L408)）、`app/gen-server/ApiServer.ts` 52（依 `/api/` 後第一段分組：orgs 11、workspaces 8、profile 8、docs 8、service 7、users 3、session 3、其他 4）。
- 認證：[Authorizer.ts 第 178–215 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/Authorizer.ts#L178-L215)，格式必須是 `Bearer XXX`；程式碼裡也處理「service account」型別的使用者，到期或擁有者被停用會拒絕；ApiServer.ts 有 7 個 `/api/service...` 路由，API 層看來支援，介面入口未確認。給 AI 用的金鑰最好用這類專用帳號，而不是你自己的帳號。
- 架構：瀏覽器打的是首頁伺服器，[DocApiProxy.ts 第 124–169 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/gen-server/lib/DocApiProxy.ts#L124-L169) 列出要轉給 doc worker 的路徑（我數到 43 條 `app.use`／`app.delete`，含條件式的 mcp）。官方 Docker 映像啟動時，[stubs/app/server/server.ts 第 194 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/stubs/app/server/server.ts#L194) 預設 `GRIST_SERVERS=home,docs,static`，也就是首頁伺服器與 doc worker 在同一個程序裡。

#### 4-2 常用端點

- `POST /apply`（[L210–213](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L210-L213)）：直接送 UserActions，能力最強，等同前端在做的事。
- 讀取：`/tables/:tableId/data`（欄導向）、`/records`（列導向）、`/records/list`（參數放 body）、`/columns`、`/tables`，見 [L289–340](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L289-L340)。
- 新增：[L591–618](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L591-L618)；upsert：[L818–832](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L818-L832)，可用 `noadd`、`noupdate`、`onmany=first|none|all` 控制。對「每天匯入供應商價格表、以料號更新」這種需求非常合用。
- upsert 的 body 形狀見 [DocApiTypes.ts 第 40–45、88–90 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/DocApiTypes.ts#L40-L90)：每筆是 `{require, fields}`。以「用料號更新成本」為例（網址與表名為示意）：

```bash
curl -X PUT "https://<你的 Grist>/api/docs/<docId>/tables/Products/records" \
  -H "Authorization: Bearer $GRIST_API_KEY" -H "Content-Type: application/json" \
  -d '{"records":[{"require":{"SKU":"A-001"},"fields":{"Cost":120,"Supplier":"甲公司"}}]}'
```

- SQL：[L620–640](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L620-L640)；[runSQLQuery.ts 第 20–42 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/runSQLQuery.ts#L20-L42) 先要求 `canCopyEverything`，再檢查語句含 select，之後包成 `select * from (...)` 並設逾時。
- 下載：`/download/csv`、`/tsv`、`/xlsx`（[L1302–1310](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L1302-L1310)）。

#### 4-3 型別化用戶端

[UserAPI.ts 的 `DocAPIImpl`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/UserAPI.ts#L1226) 有 [`getRows`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/UserAPI.ts#L1247)、[`sql`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/UserAPI.ts#L1256) 等方法，是很好的「API 用戶端該長什麼樣」範本。你的 Firebase 前端可以照這個形狀寫一個薄薄的 fetch 包裝。

### 五、xlsx 匯入匯出

#### 5-1 匯入流程（Excel → Grist）

1. 可匯入副檔名：[uploads.ts 第 56–58 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/uploads.ts#L56-L58)，文件內匯入 .xlsx／.json／.csv／.tsv／.dsv，新建文件另可 .grist／.txt／.xlsm。
2. 前端 `Importer.ts`（1,930 行）→ `DocComm.importFiles` → 伺服器 [ActiveDocImport.ts 第 393 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ActiveDocImport.ts#L393) 呼叫 `parseFile`。
3. 內建外掛宣告：[plugins/core/manifest.yml 第 7–19 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/plugins/core/manifest.yml#L7-L19)，xlsx／xlsm 交給 Python 沙箱的 `xls_parser`；[register.py 第 8–13 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/imports/register.py#L8-L13) 接到 `import_xls.import_file`。
4. [import_xls.py 第 42–49 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/imports/import_xls.py#L42-L49)：`openpyxl.load_workbook(read_only=True, keep_vba=False, data_only=True, keep_links=False)`。
5. [第 60–83 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/imports/import_xls.py#L60-L83)：跳過全空列、用前 1000 列猜標題列（`headers_guess`）、`parse_data.get_table_data` 猜欄位型別，之後移除無標題的空欄；每個工作表變一張資料表。
6. 舊 .xls 改副檔名會被擋，訊息要求另存成 .xlsx（[DocPluginManager.ts 第 143–146 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocPluginManager.ts#L143-L146)）。

#### 5-2 匯出流程（Grist → Excel）

1. `GET /download/xlsx`（見上）→ `downloadXLSX`。
2. [ExportXLSX.ts 第 1–40 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ExportXLSX.ts#L1-L40)：用 piscina 執行緒池（`maxThreads: 4`、`maxQueue: 100`、閒置 10 秒回收），worker 透過 grain-rpc 向主執行緒要資料。
3. [workerExporter.ts 第 167–264 行 `convertToExcel`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/workerExporter.ts#L167-L264)：有 stream 用 exceljs 的串流 `WorkbookWriter`（省記憶體），沒有就用 `Workbook`；表頭灰底、細框、欄寬至少 14。
4. [ExcelFormatter.ts 第 59–81 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ExcelFormatter.ts#L59-L81)：把 Grist 欄位格式轉成 Excel `numFmt`：日期、日期時間、貨幣（例如 `"$ "#,##0.000`）、百分比、小數、科學記號。

#### 5-3 實際影響

- Excel → Grist：程式只讀儲存格值（`values_only=True`），公式、樣式、圖表都不會進來；需要的公式要在 Grist 用 Python 重寫。
- Grist → Excel：公式欄輸出的是計算結果，`workerExporter.ts` 裡 `formula:` 出現 0 次（`grep -c`）。
- 若你要「Excel 公式來回不失真」，要看 SheetJS、Univer、IronCalc 等其他資料包。

### 六、權限規則（Access Rules）

#### 6-1 存在文件裡

[schema.ts 第 180–196 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/schema.ts#L180-L196)：`_grist_ACLRules`（resource、`aclFormula`、`aclFormulaParsed`、`permissionsText`、`rulePos`、`userAttributes`、`memo`）與 `_grist_ACLResources`（`tableId`、`colIds`）。所以 `.grist` 檔帶著自己的權限規則。

#### 6-2 權限位元與條件公式

- [ACLPermissions.ts 第 1–36 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/ACLPermissions.ts#L1-L36)：五種權限 C／R／U／D／S（新增、讀取、修改、刪除、改結構），文字表示如 `+R-U`、`all`、`none`；評估結果可能是 allow、deny 或 mixed（要看哪一列）。
- 條件例子（[PredicateFormula.ts 第 1–10 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/PredicateFormula.ts#L1-L10)）：`rec.office == 'Seattle' and user.email in ['sally@', 'xie@']`。Python 的 [predicate_formula.py 第 18–25 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/predicate_formula.py#L18-L25) 解析成樹，TypeScript 的 [compilePredicateFormula（第 80–106 行）](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/PredicateFormula.ts#L80-L106) 編成 JS 函式（And、Or、Eq、In、Attr…）。
- 使用者屬性：[GranularAccessClause.ts 第 34–40 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/GranularAccessClause.ts#L34-L40) 的 `UserAttributeRule` 可以「用登入 email 去某張表查一筆資料」掛到 `user` 上，例如 `user.Staff.Store == rec.Store` 這類「門市只看自己門市」的規則（範例為示意）。

#### 6-3 執行流程

- [GranularAccess.ts 第 241–271 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/GranularAccess.ts#L241-L271) 的註解寫出完整順序：`checkUserActions` → `getGranularAccessForBundle` → `canApplyBundle` → `appliedBundle` → `sendDocUpdateForBundle` → `finishedBundle`。
- 送出前審查：[`filterOutgoingDocActions`（L746）](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/GranularAccess.ts#L746)、[`filterData`（L1261）](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/GranularAccess.ts#L1261)；[`canCopyEverything`（L1157）](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/GranularAccess.ts#L1157) 給 `/sql` 等「需完整讀取權」的功能用。
- 介面：[AccessRules.ts（2,652 行）第 133 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/aclui/AccessRules.ts#L133)；規則集合 [ACLRuleCollection.ts 第 258 行](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/ACLRuleCollection.ts#L258)。

#### 6-4 對 REST、SQL、MCP 的影響

- REST 讀取：`readTable` → [ActiveDoc.fetchQuery（L1433）](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ActiveDoc.ts#L1433) → [`filterData`（L1490）](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ActiveDoc.ts#L1490)，拿到的是已審查的資料。
- `/sql`：使用者只要被任何列／欄規則限制，就無法 `canCopyEverything`，會得到 403。
- MCP（完整版）：路由層刻意不檢查，交給 worker 端「每個工具各自驗證」，細節未確認。給 AI 用的 API Key，建議另開一個專用帳號，再用權限規則限縮它能看、能改的表與欄。

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. `README.md` 第 101–139、250–261、531–546 行：先分清楚哪些功能在 core、哪些在完整版。
2. `app/client/lib/koDomScrolly.js`：整檔 659 行，重點是 `render()`、`_updateRange()`、`scrollRowIntoView()`。
3. `app/common/BinaryIndexedTree.js`：看 `getSumTo`、`getIndex`、`fillFromValues` 三個方法就夠。
4. `app/client/models/DataTableModel.js` 第 93–215 行：LazyArrayModel 怎麼「只為可視列建物件」。
5. `app/client/components/BaseView.ts` 第 190–215 行 → `GridView.ts` 的 `buildDom()`（第 1394 行起）與 `renderRow()`（第 1638 行起）。
6. `app/client/models/DataRowModel.ts` → `app/client/models/DocData.ts`（BundleSender）→ `app/client/components/DocComm.ts`：編輯怎麼送到伺服器。
7. `app/client/components/Clipboard.ts`＋`app/client/lib/tableUtil.ts`：複製貼上。
8. `app/server/lib/DocApi.ts` 第 170–900 行（records、sql、apply）＋`runSQLQuery.ts`＋`Authorizer.ts` 第 178–330 行。
9. `app/gen-server/lib/DocApiProxy.ts`：首頁伺服器怎麼把請求轉給 doc worker，以及 MCP 的特殊 `"route"` 模式。
10. `app/server/lib/ICreate.ts`：所有可替換點，grist-static 與完整版都靠它。
11. `sandbox/grist/imports/import_xls.py` → `app/server/lib/ExportXLSX.ts` → `workerExporter.ts` → `ExcelFormatter.ts`。
12. `app/server/lib/GranularAccess.ts`（先讀第 241–271 行註解）→ `app/common/PredicateFormula.ts` → `app/common/ACLPermissions.ts`。
13. grist-static：`README.md` → `DEV.md` → `ext/app/pipe/bootstrap.js` → `ext/app/server/lib/create.ts` → `CommStub.ts` → `Doc.ts` → `ext/app/client/HookStub.ts`。

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 零件 | 檔案 | 相依 | 難度 | 怎麼接 |
|---|---|---|---|---|
| Fenwick tree | `app/common/BinaryIndexedTree.js`（258 行） | 無 | 低 | 直接複製（保留授權聲明），用在你自己表格的列位置計算 |
| 虛擬捲動演算法 | `app/client/lib/koDomScrolly.js`（659 行） | knockout、underscore、jQuery、自家 dom／koDom／dispose／Delay | 中 | 不建議原樣搬。請 Claude Code 依「兩層 DOM＋Fenwick tree＋model 回收＋集中量測」改寫成原生 JS 類別 |
| LazyArrayModel | `app/client/models/DataTableModel.js` | knockout、koArray、Backbone events | 中高 | 只借概念：陣列長度不變，只替可視列建物件 |
| 貼上 HTML 表格 | `app/client/lib/tableUtil.ts` 第 112–144 行 | DOMParser、`safeJsonParse` | 低 | 抽出 `parsePasteHtml`，讓你的倉庫系統支援從 Excel 一次貼上多列進貨資料 |
| 批次送出 | `app/client/models/DocData.ts` BundleSender | 只用 Promise | 低 | 把同一 tick 的多次 Firestore 寫入合成一個 batch |
| xlsx 匯出含格式 | `workerExporter.ts` convertToExcel＋`ExcelFormatter.ts` | exceljs、moment-timezone、currency-symbol-map、Grist 型別 | 中 | 抽出 numFmt 對照（日期、貨幣、百分比）與表頭樣式，改吃你自己的欄位定義，做「庫存報表下載」 |
| xlsx 匯入猜標題／型別 | `sandbox/grist/imports/import_xls.py`＋`import_utils`／`parse_data` | Python、openpyxl | 中 | 放到 Python 版 Cloud Functions：上傳供應商 Excel → 自動判斷標題列與欄位型別 |
| REST 介面形狀 | `DocApi.ts` records／upsert／sql | Express | 低（照抄設計） | 在 Firebase Cloud Functions 做同樣形狀的 API，日後包成 MCP 幾乎不用改 |
| 權限條件編譯 | `PredicateFormula.ts` 第 80 行起 | 解析在 Python | 高 | 只借「條件存成 JSON 樹，再編成函式」的模式 |
| 純前端嵌入 | grist-static 整套 | Pyodide、sql.js、整個 grist-core | 整套用低、拆開高 | 直接用 CDN 或 npm 的 grist-static，在 Firebase Hosting 放 `.grist`／CSV 報表頁，不要拆 |
| 整個 Grist | Docker `gristlabs/grist-oss` 或 `gristlabs/grist` | Docker | 低 | 自架一台當「後台試算表＋REST（＋完整版 MCP）」，你的 Firebase app 用 REST 讀寫 |

給 A＋B＋C 的建議組合：**A＝Grist 本體當資料庫與權限**（自架，或直接用雲端版），**B＝你現有的 Firebase 前端**透過 REST／upsert 同步商品與庫存，**C＝自訂小工具**（grist-plugin-api）做比價或成本試算面板；Claude 端走完整版 MCP，或用第三節表格自寫 MCP。給 Claude Code 的指令可以這樣下：「參考 gristlabs/grist-core commit 484236f 的 `app/client/lib/koDomScrolly.js` 的 `render()` 流程與 `app/common/BinaryIndexedTree.js`，用原生 JS 寫一個不依賴框架的虛擬捲動表格，保留 Apache-2.0 授權註記。」

## 坑與限制

1. **MCP 不開源。** grist-core 只有掛勾；首頁「Connect Grist to Claude」橫幅在所有版本都會出現，容易誤以為 core 版就能用。
2. **`yarn install` 預設會下載完整版擴充**（`install_edition.sh` 預設 full，非開源程式碼），要純開源請先 `yarn run set-community-edition` 或用 `gristlabs/grist-oss` 映像。
3. **表格前端是 Knockout＋jQuery＋Backbone 的老架構**，`GridView.ts` 2,635 行又相依 GristDoc、commands、ViewSectionRec 等，整個表格元件幾乎拆不出來；能帶走的是演算法與小工具函式。
4. **沒有欄虛擬化**，超寬表格的效能未實測；最小列高固定 23px，多行文字的列高靠實際量測。
5. **公式一律在 Python 算。** 自架要處理 Python 沙箱（`NSandbox.ts` 第 523–538 行列出 gvisor、docker、macSandboxExec、pyodide 等選項）；grist-static 首次載入要下載 Pyodide 與 wheel，README 的 roadmap（[第 218–238 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/README.md#L218-L238)）也承認資料引擎啟動慢。
6. **grist-static 改動不會保存、沒有權限控制**（[README 第 135–146 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/README.md#L135-L146)）；`behaviorOverrides.onChange`／`save` 看似可以接你自己的儲存（[GristOverrides.ts 第 42–53 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/pipe/GristOverrides.ts#L42-L53)），但 `elementId` 嵌入模式會把這些函式在 JSON 序列化時丟掉（[bootstrap.js 第 169–180 行](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/pipe/bootstrap.js#L169-L180) 註解），能否用來存到 Firebase 未確認。README 的「Differences」寫匯入匯出未移植，但程式碼已有 xlsx 下載 stub 與 `initialData` 匯入，實際可用程度未確認。
7. **grist-static 綁的是較舊的 core**（子模組 `2d13642`，2026-08-27），本篇描述的 core 程式碼（2026-11-04）不一定和它完全一致；另外 MCP 在 grist-static 裡派不上用場，因為頁面裡沒有可讓 Claude 連進來的伺服器。
8. **xlsx 不互轉公式**；舊 .xls 不支援；`/sql` 只能 SELECT，受權限規則限制的使用者無法使用。
9. **權限規則跟著文件走**，規則寫錯就等於資料外洩；條件語法刻意精簡（`predicate_formula.py` 註解說不需要支援太多），複雜邏輯要靠使用者屬性表。
10. **授權**：grist-core（`package.json` 第 4 行）與 grist-static 都是 Apache-2.0，可商用、可修改，複製程式碼要保留 LICENSE 與 NOTICE（Copyright Grist Labs）並註明修改；完整版擴充不是開源授權，不能拆用。
