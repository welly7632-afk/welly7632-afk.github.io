# glideapps/glide-data-grid — 用 Canvas 畫的超快 React 資料表格（試算表的「外殼」，本身沒有公式）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：0875d78
> GitHub：https://github.com/glideapps/glide-data-grid｜⭐ 5426｜授權：MIT｜主要語言：TypeScript｜最近更新：2026-11-01

> 備註：本次掃描的 `main` 分支 HEAD 是 commit `0875d78cc41535a39f8b417ff88ce1ebe129c363`，該 commit 本身的日期是 2026-01-21（訊息 `6.0.4-alpha25`）。GitHub 顯示的「最近 push 2026-11-01」可能是推到其他分支，`main` 的程式碼最後一次變動是 2026-01-21。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** Glide Data Grid 是一個用 HTML Canvas 畫出來的 React 表格元件，幾十萬、上百萬列也能順順捲動，內建儲存格編輯、從 Excel／Google 試算表複製貼上、拖拉填滿、凍結欄、合併儲存格（橫向）、搜尋，但**沒有公式引擎、沒有 .xlsx 匯入匯出、沒有多人協作**。它是「試算表的畫面層」，不是完整的試算表。

**對你（台灣小老闆、自己用 Claude 寫倉儲／庫存網頁、放在 Firebase）可以做的事：**

1. **庫存／商品總表的「Excel 式編輯畫面」**：把 Firestore 裡幾千～幾萬筆商品、SKU、庫存數量放進來，員工可以像 Excel 一樣點兩下改數字、整欄貼上、往下拖拉填滿，改完觸發 `onCellsEdited` 再寫回 Firestore。
2. **比價／成本試算表**：例如「進價、運費、平台抽成、廣告費 → 毛利率」。表格本身不會算公式，但你可以在自己的 JavaScript 裡算好（或接 HyperFormula 這類公式引擎），再把結果餵給表格顯示。
3. **廣告成效報表檢視器**：把廣告後台匯出的 CSV 自己解析後丟進來，十萬列也不會卡；可以用 `themeOverride` 把 ROAS 太低的列塗紅（等於自己做「條件格式」）。
4. **A＋B＋C 組合中的「B＝畫面層」**：搭配一個公式引擎（A）＋ 一個 xlsx 讀寫函式庫（C）＋ 你的 Firestore，就能湊出一個「自己的線上 Excel」。這是它最適合的定位。

**不適合**：想要「打開就是完整 Excel，有公式、有圖表、能存 .xlsx」——那要找 Univer、Luckysheet／FortuneSheet、x-spreadsheet 這類專案；Glide Data Grid 只適合當底層表格。

---

## 2. 授權白話

- **授權：MIT**。根目錄 [`LICENSE`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/LICENSE) 開頭是 `MIT License, Copyright (c) 2021 typeguard, Inc.`；三個子套件 `packages/core`、`packages/cells`、`packages/source` 的 `package.json` 也都寫 `"license": "MIT"`。
- **個人使用**：完全可以，免費、不用回報、不用開源你的程式碼。
- **公司商用**：可以，包含閉源、收費的產品。唯一義務是**保留著作權聲明與 MIT 授權文字**（通常在打包後的第三方授權清單裡附上即可）。沒有任何擔保（壞掉不能找他們求償）。
- **閉源或付費版**：這個 repo 裡**沒有**「開源版／付費版」切割，所有功能都在 MIT 程式碼裡。Glide 公司另有商業產品「Glide Data Editor」（README 說這個表格是它的基礎），那是 Glide 的 SaaS，不是這個套件的付費版。
- **依賴的授權**：核心直接依賴 `@linaria/react`、`canvas-hypertxt`、`react-number-format`，peer 依賴 `react`、`react-dom`、`lodash`、`marked`、`react-responsive-carousel`（見 [`packages/core/package.json`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/package.json)）；`packages/cells` 另外依賴 `@toast-ui/editor`、`react-select`。這些依賴各自的授權本次**未逐一確認**，商用前建議用 `license-checker` 之類工具掃一遍。
- **要特別注意的是「你接上去的公式引擎」**：例如 HyperFormula 依一般認知是 GPLv3／商業雙授權（本次未在此 repo 內驗證），商用閉源要付費或改用 MIT 的方案。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 前端 | React 16／17／18／19（peerDependencies 寫 `^16.12.0 \|\| 17.x \|\| 18.x \|\| 19.x`）＋ TypeScript；畫面用 HTML Canvas 2D 繪製 |
| CSS | 必須 import `@glideapps/glide-data-grid/dist/index.css`（5.0 起改用 linaria，不再用 styled-components，見 [`packages/core/CHANGELOG.md`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/CHANGELOG.md)） |
| HTML 前置 | 需要一個 `<div id="portal" style="position: fixed; left: 0; top: 0; z-index: 9999;">` 放在 `<body>` 最後，給編輯框用；或用 `portalElementRef` 自己指定（見 [`packages/core/API.md#L3-L24`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/API.md#L3-L24)）。**忘記放 portal 是最常見的「點兩下就當掉」原因**，README FAQ 也這麼說。 |
| 後端 | **不需要**。純前端元件，資料從哪裡來由你決定（陣列、Firestore、REST API 都行） |
| 資料庫 | 無內建。你自己決定存哪裡 |
| 部署 | 靜態網站即可，Firebase Hosting 沒問題 |
| 硬體／GPU | 不需要 GPU，一般瀏覽器 Canvas 2D 即可 |
| API Key | **不需要任何 API Key**，沒有外部服務 |
| 費用 | 0 元（MIT）。只有你自己的 Firebase 讀寫費用 |
| 版本 | HEAD 的三個套件版號都是 `6.0.4-alpha25`（表示 6.0.4 還在 alpha）；npm 上最新穩定版號**未確認**（本次不連 npm） |

---

## 4. 程式架構地圖

```
glide-data-grid/                      monorepo（npm workspaces）
├── LICENSE                           MIT
├── README.md                         功能介紹、FAQ（為何用 Canvas、為何不內建排序／篩選）
├── packages/
│   ├── core/                         ★ 主套件 @glideapps/glide-data-grid
│   │   ├── API.md                    完整 props 文件（含 portal 前置說明）
│   │   ├── CHANGELOG.md              5.0 破壞性變更說明
│   │   ├── src/
│   │   │   ├── index.ts              所有對外 export
│   │   │   ├── data-editor-all.tsx   DataEditor（預設帶齊所有內建 renderer）
│   │   │   ├── data-editor/          ★ 「試算表行為」層
│   │   │   │   ├── data-editor.tsx       4346 行的主元件：選取、鍵盤、編輯、貼上、填滿、刪除
│   │   │   │   ├── copy-paste.ts         複製成 TSV + HTML <table>、解析貼上的 HTML
│   │   │   │   ├── data-editor-fns.ts    TSV 解析（unquote）、寫入剪貼簿、選取範圍擴展
│   │   │   │   ├── data-editor-keybindings.ts  所有快捷鍵開關
│   │   │   │   ├── row-grouping*.ts      列分組（可收合）
│   │   │   │   └── use-column-sizer.ts   自動欄寬
│   │   │   ├── internal/
│   │   │   │   ├── data-grid/            ★ Canvas 繪圖引擎
│   │   │   │   │   ├── data-grid.tsx         Canvas、雙緩衝、滑鼠／觸控事件、無障礙 DOM 樹
│   │   │   │   │   ├── data-grid-types.ts    GridCell / GridColumn / GridSelection 型別
│   │   │   │   │   └── render/               drawGrid、blit（重用上一格畫面）、畫格線、畫表頭
│   │   │   │   ├── scrolling-data-grid/  原生捲軸 + 超大高度處理（infinite-scroller）
│   │   │   │   ├── data-grid-search/     內建搜尋列（Ctrl/Cmd+F）
│   │   │   │   ├── data-grid-dnd/        欄寬拖拉、欄／列拖曳排序
│   │   │   │   ├── data-grid-overlay-editor/  點兩下跳出的 DOM 編輯框（文字、數字、圖片、網址、markdown）
│   │   │   │   └── markdown-div/         用 marked 把 markdown 轉 HTML
│   │   │   ├── cells/                內建 12 種儲存格的 renderer（text、number、boolean、image…）
│   │   │   └── docs/examples/        74 個 Storybook 範例（最好的「用法字典」）
│   │   └── test/                     29 個測試檔（vitest）
│   ├── cells/                        @glideapps/glide-data-grid-cells：13 種額外儲存格
│   │   └── src/cells/                下拉選單、日期、多選、標籤、星等、sparkline 小圖、按鈕、樹狀…
│   └── source/                       @glideapps/glide-data-grid-source：資料來源 hooks
│       └── src/                      useUndoRedo、useColumnSort、useAsyncDataSource、useMoveableColumns、useCollapsingGroups
├── test-projects/                    CRA5 與 Next.js 的整合測試專案
└── .github/workflows/                CI：build + vitest coverage + 測試 source/cells/test-projects
```

**程式量（自己數）**：`packages/core/src` 排除 `*.stories.tsx` 與 `docs/` 後共 21,146 行（`find … | xargs cat | wc -l`）；`packages/cells/src` + `packages/source/src` 排除 stories 共 3,740 行。

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| Canvas 繪圖 + 雙緩衝 | [`data-grid.tsx#L737-L757`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/data-grid.tsx#L737-L757) | 建立兩個 `getContext("2d", { alpha: false })` 的離屏 canvas（bufferA/B）交替使用，關掉 alpha 讓繪製更快 |
| 主繪製流程 | [`render/data-grid-render.ts#L115`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/render/data-grid-render.ts#L115) | `drawGrid(arg, lastArg)`：比較這一次和上一次的參數，只重畫有變的地方（damage） |
| 捲動時重用畫面（blit） | [`render/data-grid-render.blit.ts#L21`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/render/data-grid-render.blit.ts#L21)、[`#L233`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/render/data-grid-render.blit.ts#L233) | `blitLastFrame` 把上一格畫面整塊位移貼上，只補畫新露出來的列；`computeCanBlit` 判斷能不能這樣偷懶。這是「捲動不卡」的關鍵 |
| 只走訪可見列／欄 | [`render/data-grid-render.walk.ts#L21`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/render/data-grid-render.walk.ts#L21) | `walkRowsInCol`、`walkColumns` 只跑畫面上看得到的範圍，所以 100 萬列和 100 列成本差不多 |
| 畫儲存格 | [`render/data-grid-render.cells.ts#L75`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/render/data-grid-render.cells.ts#L75) | `drawCells` 依 cell.kind 找 renderer 呼叫 `draw()`；支援 `highlightRegions`（標記區塊）、row theme 覆寫 |
| 超大資料捲軸 | [`infinite-scroller.tsx#L73-L135`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/scrolling-data-grid/infinite-scroller.tsx#L73-L135) | 瀏覽器 div 最高約 33,554,400px（`BROWSER_MAX_DIV_HEIGHT`），超過時用多段 5,000,000px 的 padder + 位移換算虛擬座標，所以能撐到上億列 |
| 資料來源（拉模式） | [`data-editor.tsx#L546`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L546) | 你只要提供 `getCellContent([col,row]) => GridCell`，表格要畫哪格就問哪格，**資料完全由你掌控** |
| 編輯回寫 | [`data-editor.tsx#L209-L217`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L209-L217)、[`#L1207-L1224`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L1207-L1224) | `onCellEdited`（單格）／`onCellsEdited`（批次：貼上、填滿都走這個）。`onCellsEdited` 回傳 `true` 就不會再逐格呼叫 `onCellEdited` |
| 輸入驗證 | [`data-editor.tsx#L277-L281`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L277-L281) | `validateCell(cell, newValue, prevValue)` 回傳 `false` 拒絕，或回傳修正後的 cell |
| 直接打字進入編輯 | [`data-editor.tsx#L3507-L3530`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L3507-L3530) | `editOnType`（預設 true）：只有 `event.key.length === 1` 才觸發。**中文注音／倉頡輸入法 keydown 時 key 通常是 `"Process"`，依程式碼推論不會觸發「直接打字就編輯」，要先按 Enter 或點兩下再打字（未實測）** |
| 複製 | [`copy-paste.ts#L180-L236`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/copy-paste.ts#L180-L236)、[`data-editor-fns.ts#L168`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor-fns.ts#L168) | 同時寫入 `text/plain`（TSV，以 Tab 分隔）與 `text/html`（`<table>`，加 `mso-data-placement:same-cell` 讓 Excel 不把換行拆格；每格帶 `gdg-raw-value` 屬性保存原值） |
| 貼上 | [`data-editor.tsx#L3583-L3767`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L3583-L3767) | 優先讀 `navigator.clipboard.read()` 的 HTML → `decodeHTML`；沒有就讀純文字 → `unquote` 解析 TSV。每格交給該儲存格 renderer 的 `onPaste` 轉型，可用 `coercePasteValue` 自訂（例如把「NT$1,200」轉成數字 1200） |
| 解析貼上的 HTML 表格 | [`copy-paste.ts#L239-L320`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/copy-paste.ts#L239-L320) | 走訪 `<table><tr><td>`，`<br>` 轉換行，特別處理 Apple Numbers 的 `<p><font>` 包法 |
| 解析 TSV（含引號） | [`data-editor-fns.ts#L107-L165`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor-fns.ts#L107-L165) | 小型狀態機處理 `"..."` 內含 Tab／換行、`""` 跳脫。這段可以直接抄去你的庫存系統做「從 Excel 貼上」 |
| 拖拉填滿 | [`data-editor.tsx#L2245-L2296`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L2245-L2296) | `fillPattern`：把來源範圍**原樣循環複製**（`pattern[y % h][x % w]`）。**不會像 Excel 自動遞增 1,2,3 或日期**；要遞增得自己用 `onFillPattern` 攔截後算 |
| 復原／重做 | [`packages/source/src/use-undo-redo.ts#L107-L227`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/source/src/use-undo-redo.ts#L107-L227) | 不在 core 裡，在 source 套件。包住 `onCellEdited`，把一段時間內的編輯打包成 batch，監聽 window 的 Ctrl/Cmd+Z、Ctrl/Cmd+Y |
| 排序 | [`packages/source/src/use-column-sort.ts#L40-L73`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/source/src/use-column-sort.ts#L40-L73) | `useColumnSort` 回傳一個重新排序後的 `getCellContent`；`compareSmart` 會把可轉數字的字串當數字比 |
| 非同步分頁載入 | [`packages/source/src/use-async-data-source.ts#L20`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/source/src/use-async-data-source.ts#L20) | 依 `onVisibleRegionChanged` 只抓看得到的頁；很適合「Firestore 分頁查詢」 |
| 搜尋 | [`data-grid-search.tsx#L385-L398`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid-search/data-grid-search.tsx#L385-L398) | 內建搜尋列，結果超過 1000 顯示 `over 1000`；文字寫死英文 |
| 無障礙 | [`data-grid.tsx#L1737-L1790`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/data-grid.tsx#L1737-L1790) | Canvas 後面同步產生一個隱藏的 `role="grid"` `<table>` 給螢幕報讀器 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整個 `DataEditor` 表格（直接用 npm 套件） | [`packages/core/src/index.ts`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/index.ts) | React、lodash、marked | 低 | 不要拆，直接 `npm i @glideapps/glide-data-grid`，當「試算表畫面」，公式／存檔由其他專案負責 |
| TSV 解析器 `unquote` | [`data-editor-fns.ts#L100-L165`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor-fns.ts#L100-L165) | 無（只依賴一個型別） | 低 | 約 65 行純函式，複製到你的純 JS 庫存系統，做「從 Excel 貼上多列商品」 |
| HTML 表格剪貼簿解析 `decodeHTML` ＋ 產生 `createHtmlBuffer` | [`copy-paste.ts#L180-L320`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/copy-paste.ts#L180-L320) | 只用 DOM API | 低 | 讓你自己的表格「複製出去貼到 Excel／Google 試算表格式不跑掉」；改成回傳普通二維陣列即可 |
| 超大高度捲軸 `InfiniteScroller` | [`infinite-scroller.tsx`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/scrolling-data-grid/infinite-scroller.tsx) | React、linaria | 中 | 想學「千萬列虛擬捲動」可參考 33.5M px 限制的處理手法，移植成原生 JS 需要改寫 React 部分 |
| Canvas blit 位移重繪 | [`data-grid-render.blit.ts`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/render/data-grid-render.blit.ts) | `DrawGridArg` 型別、walk 函式 | 高 | 與整個繪圖管線耦合深，建議當教材，不建議單獨搬 |
| 填滿邏輯 `fillPattern` | [`data-editor.tsx#L2245-L2296`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L2245-L2296) | 選取型別 | 低 | 邏輯只有幾十行，可改寫成「偵測等差數列就遞增」的 Excel 式填滿 |
| 復原／重做 hook | [`use-undo-redo.ts`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/source/src/use-undo-redo.ts) | React（useReducer） | 中 | reducer（undoHistory／redoHistory 兩個 stack）可抽成純 JS class，給任何表格用 |
| 智慧排序比較 `compareSmart` | [`use-column-sort.ts#L40-L57`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/source/src/use-column-sort.ts#L40-L57) | 無 | 低 | 數字字串當數字比、其餘 `localeCompare`；中文排序可改成 `localeCompare(b, "zh-Hant-TW")` |
| 下拉選單儲存格 | [`packages/cells/src/cells/dropdown-cell.tsx`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/cells/src/cells/dropdown-cell.tsx) | react-select | 低（在 GDG 內用） | `allowedValues` 就是「資料驗證下拉選單」，例如倉庫位置、商品狀態 |
| Sparkline 迷你圖儲存格 | [`packages/cells/src/cells/sparkline-cell.tsx`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/cells/src/cells/sparkline-cell.tsx) | 無外部圖表庫（自己用 canvas 畫） | 低 | 在商品列裡顯示「近 30 天銷量」小折線／長條圖 |
| 非同步分頁資料來源 | [`use-async-data-source.ts`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/source/src/use-async-data-source.ts) | React | 中 | 把 `getRowData` 換成 Firestore `startAfter` 分頁查詢 |

---

## 7. AI／Claude 整合

- **沒有任何 AI 整合**。全 repo 沒有呼叫任何模型 API、沒有 prompt 檔、沒有 MCP、沒有 Skills（以 `grep -rn "fetch(\|sendBeacon\|analytics\|XMLHttpRequest" packages/*/src` 檢查，非 stories 的原始碼沒有任何網路請求）。
- **能不能接 Claude**：可以，而且很好接，因為資料完全在你手上：
  1. **「AI 欄」**：在 `columns` 加一欄「AI 建議售價」或「AI 商品文案」，按按鈕（`packages/cells` 的 button cell）時把該列資料送到你自己的後端（例如 Firebase Cloud Functions）呼叫 Claude API，回來後更新陣列再 `gridRef.current.updateCells([{cell:[col,row]}])` 重畫。
  2. **「用自然語言篩選」**：使用者打「找出毛利率低於 20% 的商品」，Claude 回傳篩選條件 JSON，你在自己的資料陣列上篩好，再把 `rows` 與 `getCellContent` 換成篩選後的結果。
  3. **用 Claude Code 開發**：這個專案型別完整（`data-grid-types.ts`、`API.md`），74 個 Storybook 範例在 `packages/core/src/docs/examples/`，非常適合讓 Claude Code 參考後幫你產生程式碼。
- **注意**：API Key 不能放前端；請透過 Cloud Functions 代理。

---

## 8. 擴充方式與 API

**主要擴充點：**

1. **自訂儲存格 renderer**：實作 [`CustomRenderer`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/cells/cell-types.ts#L61-L116)：`isMatch`、`draw`（用 canvas 畫）、可選 `provideEditor`（回傳一個 React 元件當編輯器）、`onPaste`、`onClick`、`onDelete`、`measure`。`packages/cells` 的 13 種儲存格都是範例。
2. **主題**：`theme` prop（整體）、`column.themeOverride`、`cell.themeOverride`、`getRowThemeOverride(row)`——這就是你的「條件格式」入口。
3. **快捷鍵**：`keybindings` prop，可開關 [`keybindingDefaults`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor-keybindings.ts#L76) 裡每一項（`downFill`／`rightFill` 預設關閉，就是 Ctrl+D／Ctrl+R 填滿）。
4. **事件**（節錄自 [`data-editor.tsx#L209-L700`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L209-L700)）：`onCellEdited`、`onCellsEdited`、`onDelete`、`onPaste`、`onFillPattern`、`onRowAppended`、`onColumnAppended`、`onHeaderClicked`、`onHeaderContextMenu`、`onCellContextMenu`（右鍵選單自己畫）、`onCellClicked`、`onCellActivated`、`onGridSelectionChange`、`onVisibleRegionChanged`、`onColumnResize`、`onColumnMoved`、`onRowMoved`、`onSearchResultsChanged`。
5. **命令式 API（ref）**：[`DataEditorRef`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L715-L760)：`updateCells`（通知重畫某些格）、`scrollTo`、`appendRow`、`appendColumn`、`emit("copy" | "paste" | "delete" | "fill-right" | "fill-down")`、`getBounds`、`focus`、`remeasureColumns`、`getMouseArgsForPosition`。
6. **資料 hooks**（`packages/source`）：`useUndoRedo`、`useColumnSort`、`useAsyncDataSource`、`useMoveableColumns`、`useCollapsingGroups`；core 內還有 `useRowGrouping`（[`row-grouping-api.ts#L27`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/row-grouping-api.ts#L27)）。

---

## 9. 程式品質與風險

- **維護狀況**：2020 年建立、5426 顆星；`main` 最後一次程式碼變動 2026-01-21（`6.0.4-alpha25`），之後到掃描日約 9 個多月 `main` 沒有新 commit。版號一路 alpha 到 25，表示更新節奏偏慢、以修 bug 為主。屬於「穩定但不太長新功能」的狀態。
- **測試**：`packages/core/test` 29 個測試檔、全部 test 檔合計 36 個；用 `grep -cE "^\s*(test|it)\("` 數到約 399 個測試案例。CI（[`.github/workflows/node.js.yml`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/.github/workflows/node.js.yml)）在每次 push／PR 跑 build、vitest coverage、source／cells 測試與 test-projects。品質算好。
- **遙測／隱私**：原始碼（排除 stories）沒有任何網路請求、沒有分析追蹤。資料不會外傳。
- **資安：**
  - **Markdown 儲存格沒有消毒（sanitize）**：[`markdown-div.tsx#L22-L31`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/markdown-div/markdown-div.tsx#L22-L31) 直接把 `marked` 的輸出塞進 `innerHTML`。若 markdown 內容來自不可信來源（例如客人填的備註），有 XSS 風險。解法：用 `markdownDivCreateNode` prop 自己接 DOMPurify。
  - **貼上 HTML 的解析**：[`copy-paste.ts#L240-L242`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/copy-paste.ts#L240-L242) 把剪貼簿 HTML 設進 `document.createElement("html").innerHTML`。依程式碼推論，惡意剪貼簿內容（如帶 `onerror` 的 `<img>`）理論上可能觸發腳本，屬於低風險的 self-XSS（未實測）。
- **已知的坑：**
  1. **預設貼上只貼一格**：`onPaste` 沒設定時，程式會把整段剪貼簿內容當成一格貼進去（[`data-editor.tsx#L3699-L3707`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L3699-L3707)）。要像 Excel 一樣貼一整塊，必須設 `onPaste={true}`（或函式）。
  2. **複製需要 `getCellsForSelection`**：沒設定的話複製不會動（見 [`data-editor.tsx#L583-L604`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L583-L604) 註解）。最簡單是設 `getCellsForSelection={true}`。
  3. **貼上不會自動加列**：超過 `rows` 的部分直接丟掉（`if (row + targetRow >= rows) break;`）。
  4. **忘了 `<div id="portal">`** 會在編輯時出錯。
  5. **TSV 解析遇到 emoji 可能錯位**：`unquote` 用 `for…of` 逐「字元」走訪但 `index++` 後用 `str.slice(index)` 切 UTF-16 位置，含 emoji（代理對）的資料可能切錯（依程式碼推論，未實測）。一般中文字在 BMP 內不受影響。
  6. **中文輸入法直接打字不會進編輯**（見第 5 節 `editOnType`，未實測）。
  7. **填滿不會遞增**：只是循環複製。
  8. 必須用 React；純 JS 網頁要多載入 React（見第 11 節）。

---

## 10. 跟其他專案組合的建議

**推薦組合：「Glide Data Grid（畫面）＋ 公式引擎 ＋ xlsx 函式庫 ＋ Firestore」**

```
使用者輸入 "=B2*C2"
   │ onCellEdited
   ▼
你的資料層（JS 物件：每格存 raw 輸入 + 計算後的值）
   │ 交給公式引擎（例如 HyperFormula.setCellContents / formula.js）
   ▼
引擎回傳「哪些格變了」 → 更新陣列 → gridRef.updateCells([...]) 重畫
   │
   └─ 存檔：只存 raw（含公式字串）到 Firestore；匯出時用 SheetJS／ExcelJS 轉 .xlsx
```

- **getCellContent 的關鍵技巧**：`TextCell` 有 `data`（編輯時看到的值）和 `displayData`（畫面顯示的值）兩個欄位（[`data-grid-types.ts#L342-L351`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/data-grid-types.ts#L342-L351)）。把 `data` 設成 `"=B2*C2"`、`displayData` 設成計算結果 `"3,600"`，就做出 Excel「點進去看到公式、平常看到值」的效果。
- **公式引擎選擇**（以下為一般認知，本次未驗證）：HyperFormula（功能最完整、有依賴圖，但 GPLv3／商業授權）；formula.js（MIT，只有函數，沒有依賴圖，要自己做重算順序）。同一批研究中若有掃到 Univer／FortuneSheet 等專案，可以比較它們的公式模組能否單獨拆出。
- **xlsx 匯入匯出**：本專案完全沒有；需配 SheetJS（社群版）或 ExcelJS。
- **和你現有庫存系統的接法**：你目前是純 JS + Firebase，有兩條路：
  1. 整個庫存系統不動，只在「批次編輯頁」用 esm CDN 載入 React + Glide Data Grid（第 11 節範例）。
  2. 不用它，只抄 `unquote`、`decodeHTML`、`createHtmlBuffer`、`fillPattern` 這幾段到你自己的 DOM 表格，就能有「Excel 式複製貼上」。
- **和 AI 影片／腳本專案的關係**：可以當「腳本清單／分鏡表／商品素材表」的編輯介面（每列一個鏡頭，欄位是畫面描述、旁白、秒數、圖片），圖片欄用內建 `Image` cell 顯示縮圖。

---

## 11. 網頁 Excel 能力檢查表

### 渲染與效能
- **渲染方式：有，Canvas 2D**。[`data-grid.tsx#L737-L790`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/data-grid.tsx#L737-L790) 用 `getContext("2d", { alpha: false })`；全 repo 沒有 WebGL。編輯框是另外疊上去的 DOM。
- **虛擬捲動：有**。只畫可見範圍（`render/data-grid-render.walk.ts`）＋ 原生捲軸 padder（`infinite-scroller.tsx`）。
- **10 萬列以上效能：有（官方範例宣稱）**。Storybook 範例 [`one-million-rows.stories.tsx#L33`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/docs/examples/one-million-rows.stories.tsx#L33) 設 `rows={1_000_000}`、`ten-million-cells` 用 10 萬列、另有 10 萬欄範例；infinite-scroller 註解提到 1 億列的處理。本次**未實測**，效能最終取決於你的 `getCellContent` 夠不夠快（要 O(1) 查陣列，不要每次去查資料庫）。

### 公式引擎
- **公式引擎：沒有**。函數數量 **0**。數法：對整個 repo 執行 `grep -rli "formula\|hyperformula\|=SUM"`（含 .ts／.tsx／.md），結果**0 個檔案**。
- **解析器／依賴圖／重算：沒有**。
- **陣列公式：沒有**。
- **跨工作表參照：沒有**（也沒有「工作表」概念，一個 `DataEditor` 就是一張表）。
- **自訂函數：沒有**（要靠外接引擎）。

### 編輯
- **儲存格編輯：有**。點兩下／Enter 開啟 overlay 編輯器（[`data-grid-overlay-editor/`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid-overlay-editor/data-grid-overlay-editor.tsx)），數字用 `react-number-format`。
- **複製貼上：有，可直接從 Excel／Google 試算表貼上**。讀 `text/html` 的 `<table>` 或 `text/plain` TSV（[`data-editor.tsx#L3660-L3712`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L3660-L3712)），連 Apple Numbers 都特別處理。只貼值，**不帶格式、不帶公式**。須設 `onPaste={true}` 與 `getCellsForSelection`。
- **拖拉填滿：有（陽春版）**。`fillHandle` prop ＋ `allowedFillDirections`（預設 `"orthogonal"`）；只循環複製，不會遞增（[`#L2245-L2296`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/data-editor/data-editor.tsx#L2245-L2296)）。
- **復原／重做：有（在附加套件）**。`@glideapps/glide-data-grid-source` 的 `useUndoRedo`；core 本身沒有。

### 格式
- **數字格式：部分有**。`NumberCell` 有 `fixedDecimals`、`thousandSeparator`、`decimalSeparator`、`allowNegative`（[`data-grid-types.ts#L353-L364`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/data-grid-types.ts#L353-L364)）；畫面文字是你給的 `displayData`，所以任何格式（NT$、百分比）都自己用 `Intl.NumberFormat("zh-TW")` 產生。沒有 Excel 式格式碼（`#,##0.00`）。
- **條件格式：沒有內建規則 UI，但可自己做**。用 `cell.themeOverride`、`getRowThemeOverride`、`highlightRegions`。
- **合併儲存格：有（只能橫向）**。`BaseGridCell.span?: [start, end]` 是同一列內的欄範圍（[`data-grid-types.ts#L311-L320`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/data-grid-types.ts#L311-L320)）；**沒有找到縱向（跨列）合併**。
- **凍結窗格：有**。`freezeColumns`（左側凍結欄）、`freezeTrailingRows`（底部凍結列，例如「合計」列）；表頭固定。頂端任意凍結 N 列**未找到**對應 prop（未確認是否有其他做法）。
- **欄寬列高：有**。欄寬可拖拉（`onColumnResize`）、自動欄寬（`use-column-sizer.ts`）；列高 `rowHeight` 可為數字或函式（預設 34）。
- **篩選：沒有內建**。README FAQ 明說篩選、排序要在資料來源自己做；有 `search-as-filter` 範例可參考。
- **排序：附加套件有**。`useColumnSort`（多欄排序、smart/raw 模式），點表頭排序的 UI 要自己接 `onHeaderClicked`。
- **資料驗證（下拉選單）：有**。`validateCell` prop ＋ `packages/cells` 的 `dropdown-cell`、`multi-select-cell`、`date-picker-cell`。

### 圖表、樞紐、圖片
- **圖表：只有儲存格內迷你圖**（`sparkline-cell`：line／bar／area）。沒有獨立圖表。
- **樞紐分析：沒有**。
- **圖片／附件：圖片有**（`GridCellKind.Image`，可多張、有輪播檢視器 `react-responsive-carousel`）；附件上傳**沒有**。

### 匯入匯出
- **.xlsx：沒有**。整個 repo 沒有 xlsx 讀寫程式碼，`package.json` 也沒有 SheetJS／ExcelJS 依賴。
- **.csv：沒有檔案匯入匯出**。只有剪貼簿層級的 TSV 讀寫（`unquote`、`createTextBuffer`）。
- **保真度：不適用**。

### 協作
- **多人即時協作：沒有**。沒有 OT／CRDT／鎖定。要做的話：Firestore `onSnapshot` 收到別人改的資料 → 更新陣列 → `updateCells` 重畫；衝突以「最後寫入者贏」為主。

### 資料模型與存資料庫
- **資料模型：沒有自己的文件格式**，它只是「問你每一格長什麼樣」。每格回傳一個 `GridCell` 物件，例如：

```json
{ "kind": "number", "data": 1200, "displayData": "NT$1,200", "allowOverlay": true, "contentAlign": "right" }
```

- **12 種內建 kind**（[`data-grid-types.ts#L79-L92`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/data-grid-types.ts#L79-L92)，自己數 enum 成員）：uri、text、image、row-id、number、bubble、boolean、loading、markdown、drilldown、protected、custom；`packages/cells` 再加 13 種 custom cell（數 `src/index.ts` 的 `cells` 陣列）。
- **存進 Firestore 的建議結構**：
  - 集合 `sheets/{sheetId}/rows/{rowId}`，每份文件 `{ sku: "A001", name: "保溫杯", cost: 120, price: 299, order: 1 }`。
  - `onCellsEdited(list)` → 用 `writeBatch` 一次寫多格（貼上 100 格就是一次 batch，省錢省時間）。
  - 若要存公式，另存 `formulas: { price: "=cost*2.5" }`，讀回來後交給公式引擎計算。

### 手機與語系
- **手機／觸控：有基本支援**。`data-grid.tsx` 有 31 處 touch／Touch 相關程式碼、依 `pointerType === "touch"` 分流（[`#L535-L539`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/data-grid.tsx#L535-L539)），另有 `use-kinetic-scroll.ts` 慣性捲動。實際手機上框選、拖拉填滿的手感**未實測**。
- **繁體中文介面：沒有**。沒有 i18n 機制；可見的 UI 文字很少，主要是搜尋列的 `"N results"`、`"over 1000"` 等英文字串寫死在 [`data-grid-search.tsx#L390-L398`](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid-search/data-grid-search.tsx#L390-L398)。表頭、內容都是你自己給的，所以中文資料顯示沒問題；有支援 RTL 文字偵測。中文輸入法直接打字的問題見第 9 節。

### 嵌入方式
- **純 JavaScript（不用 React／Vue）：不能「不用 React」，但可以「不用打包工具」**。它是 React 元件，一定要載入 React；可以用 ES module CDN + `React.createElement`，不寫 JSX、不用 webpack。以下範例**未實測**，版號 `6.0.3` 為假設的穩定版（請到 npm 確認）：

```html
<link rel="stylesheet" href="https://esm.sh/@glideapps/glide-data-grid@6.0.3/dist/index.css">
<div id="grid"></div>
<div id="portal" style="position:fixed;left:0;top:0;z-index:9999"></div>
<script type="module">
import React from "https://esm.sh/react@18.3.1";
import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
import { DataEditor, GridCellKind } from "https://esm.sh/@glideapps/glide-data-grid@6.0.3?deps=react@18.3.1,react-dom@18.3.1";

const keys = ["sku", "name", "cost", "price"];
const columns = [{ title: "SKU", width: 100 }, { title: "品名", width: 200 },
                 { title: "成本", width: 100 }, { title: "售價", width: 100 }];
const data = [{ sku: "A001", name: "保溫杯", cost: 120, price: 299 },
              { sku: "A002", name: "環保袋", cost: 15, price: 59 }];

function getCellContent([c, r]) {
  const v = data[r][keys[c]];
  return typeof v === "number"
    ? { kind: GridCellKind.Number, data: v, displayData: v.toLocaleString("zh-TW"), allowOverlay: true }
    : { kind: GridCellKind.Text, data: v, displayData: v, allowOverlay: true };
}
function App() {
  const [, force] = React.useState(0);
  return React.createElement(DataEditor, {
    columns, rows: data.length, getCellContent, width: "100%", height: 400,
    getCellsForSelection: true, onPaste: true, fillHandle: true, rowMarkers: "number",
    onCellEdited: ([c, r], v) => { data[r][keys[c]] = v.data; force(x => x + 1); /* 這裡寫回 Firestore */ },
  });
}
createRoot(document.getElementById("grid")).render(React.createElement(App));
</script>
```

- **套件大小：未確認**。README 有 bundlephobia 徽章但本次不連外部網站。可參考的自數資料：`packages/core/src`（排除 stories、docs）原始碼 21,146 行、約 755 KB（未壓縮 TypeScript 原始碼，含註解，不等於打包後大小）；另外還要加上 React＋ReactDOM、lodash、marked。

### API／事件
- **監聽變更：有**。`onCellEdited`、`onCellsEdited`（貼上、填滿、刪除都會走批次）、`onDelete`、`onGridSelectionChange`、`onVisibleRegionChanged`。
- **用程式讀寫儲存格：有，但方式是「改你的資料再叫它重畫」**。表格不存資料，所以「寫入」= 改你自己的陣列 → `ref.updateCells([{ cell: [col, row] }])`；「讀取」= 直接讀你的陣列。另可用 `ref.emit("copy" | "paste" | "fill-down")` 用程式觸發操作、`ref.scrollTo(col, row)` 捲動。

---

## 關鍵字
glide-data-grid、Glide Data Grid、網頁版 Excel、線上試算表、資料表格、data grid、React 表格、Canvas 表格、canvas rendering、虛擬捲動、virtual scrolling、百萬列、大量資料、儲存格編輯、複製貼上、從 Excel 貼上、TSV 解析、clipboard、拖拉填滿、fill handle、復原重做、undo redo、凍結欄、freeze columns、合併儲存格、span、下拉選單、資料驗證、sparkline、自訂儲存格、custom renderer、無公式引擎、HyperFormula 搭配、Firestore、庫存管理、批次編輯、MIT 授權、TypeScript
