# odoo/o-spreadsheet — Odoo 自家的完整網頁試算表引擎（Canvas 繪製、336 個函數、xlsx 匯入匯出、OT 即時協作，LGPL 可獨立嵌入）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：01aeeba
> GitHub：https://github.com/odoo/o-spreadsheet｜⭐ 298｜授權：LGPL-3.0-or-later（GitHub 顯示 NOASSERTION）｜主要語言：TypeScript｜最近更新：2026-11-04

> 掃描版本：分支 `20.0`，最新 commit 是 `[REL] 20.0.6`（2026-11-03）。下文的 permalink 都固定在完整 SHA `01aeeba88a48688b6243d800e8c4cd9d4f236ffd`。
> 為了簡潔，以下用 **`BASE`** 代表 `https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd`；表格與檢查表裡的連結都是完整網址。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Odoo ERP 裡「試算表／儀表板」功能背後的引擎，可以單獨拿出來，用一個 `<script>` 把接近 Google 試算表等級的試算表嵌進你自己的網頁。

星數雖然只有 298，但它是 Odoo（全球最大的開源 ERP 之一）正式產品的元件，有專職團隊在維護：從 14.0 到 master 都有穩定分支，並固定發布 `[REL]` 版本。程式碼量也大：`src/` 有 743 個 `.ts` 檔、約 14.2 萬行，另外有 197 個 XML 模板和 106 個 CSS 檔；`tests/` 裡有 299 個 `*.test.ts`。

**對你（台灣小老闆、自己用 Claude 寫倉儲網頁、放在 Firebase）可以拿來做：**
1. **把倉儲系統的「庫存表／進貨表」換成真正的試算表**：可以打公式、拖拉填滿、篩選排序、凍結窗格、條件格式（例如庫存低於安全量就標紅）、下拉選單（資料驗證）。資料用 `model.exportData()` 匯出成 JSON 存進 Firestore，下次再用 `new Model(json)` 載回來。
2. **成本／報價計算表**：內建 49 個財務函數（PMT、NPV、IRR、XNPV…）、VLOOKUP／XLOOKUP、SUMIFS，以及樞紐分析（PIVOT 函數＋樞紐表 UI），可以做進貨成本攤提、毛利試算、比價表。
3. **自訂函數接你自己的資料**：例如寫一個 `=STOCK("SKU123")` 直接讀 Firestore 庫存，或 `=PRICE("商品", "蝦皮")` 去查價。官方文件有一整節教你接外部 API（非同步＋快取的寫法）。
4. **廣告成效儀表板**：24 種圖表子類型（折線、長條、圓餅、組合、瀑布、漏斗、量表、計分卡、樹狀圖、日曆熱圖…），還有「dashboard 模式」可以唯讀展示。
5. **匯入／匯出 Excel（.xlsx）**：讓會計或廠商給的 Excel 直接開在網頁上，改完再匯出成 .xlsx。
6. **以後（A＋B＋C）**：它的公式引擎（tokenizer → parser → compiler → 依賴圖）、Canvas 繪製、OT 協作、xlsx 讀寫都可以分開研究和取用（見第 6 節）。

**一個要先知道的門檻**：UI 用的是 Odoo 自家的前端框架 **Owl**（不是 React 或 Vue）。好消息是 Owl 也可以用 `<script>` 載入，不需要建置工具，所以純 JavaScript 網頁也嵌得進去（見第 11 節的範例）。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **實際授權**：**LGPL-3.0-or-later**。`LICENSE` 開頭寫明「o-spreadsheet is published under the GNU LESSER GENERAL PUBLIC LICENSE, Version 3 (LGPLv3)」，`package.json` 的 `"license": "LGPL-3.0-or-later"`。GitHub 之所以顯示 NOASSERTION，是因為 LICENSE 檔把 LGPL 和 GPL 全文合在一起，加上 Odoo 自己寫的前言，GitHub 自動辨識不出來。
  - 檔案：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/LICENSE
  - 版權：`COPYRIGHT` 寫的是「Copyright (c) 2004-2015 Odoo S.A.」，另有第三方貢獻。
- **個人使用**：完全免費，愛怎麼用就怎麼用，也可以修改。
- **公司商用（白話版，不是法律意見）**：
  - 可以把它嵌進你**閉源的商用網站或系統**，收費也沒關係。LGPL 和 GPL 最大的差別就在這裡：你自己的程式碼不會被「傳染」。
  - 你要做到的事：(1) 保留授權與版權聲明；(2) 如果你**修改了 o-spreadsheet 本身的檔案**，把修改過的這個函式庫原始碼以 LGPL 公開給拿到它的使用者；(3) 讓使用者理論上可以把這個函式庫換成別的版本（網頁 JS 本來就會送到瀏覽器，通常很容易做到）。
  - 比較簡單的做法：**不要改它的原始碼**，所有客製都用官方的擴充點（`addFunction`、plugin registry、menu registry）寫在你自己的檔案裡。這樣你的程式碼就不受 LGPL 約束。
  - 想貢獻程式碼回去，要先簽 Odoo 的 CLA（readme 寫的）。
- **有沒有付費版才有的功能**：這個 repo 本身**沒有**分開源版／付費版，xlsx 匯入匯出、協作、樞紐分析、圖表全部都在 LGPL 程式碼裡。Odoo 產品中「跟 Odoo 資料庫連動」的部分（例如從 Odoo 撈銷售資料的函數）**不在這個 repo**，我在 336 個函數名稱裡沒看到任何 `ODOO.*` 函數；那些整合放在 Odoo 主程式或企業版模組，這次沒有查證，所以是「未確認」。對你來說不影響，因為你本來就不用 Odoo。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容（來源：`package.json`、`demo/minimalist.html`、`rolldown.config.js`） |
|---|---|
| 語言 | TypeScript（`tsc` 轉譯，`rolldown` 打包成 `esm`／`cjs`／`iife` 三種格式） |
| 執行時相依（dependencies） | `@odoo/owl` **3.0.0-alpha.50**（UI 框架）、`bootstrap` 5.3.3（只用 CSS）、`rbush`（R-tree 空間索引） |
| 外部（不打包、要自己用 script 載入） | `chart.js` 4.5.0、`luxon` 3.7.2、`chartjs-adapter-luxon`、`chartjs-chart-geo`（地圖圖表）、treemap 外掛（`demo/lib/chart_js_treemap.js`）；demo 另外載入 `material-symbols` 圖示 CSS |
| 打包產物 | `dist/o_spreadsheet.iife.js`（掛在全域 `window.o_spreadsheet`）、`o_spreadsheet.esm.js`、`o_spreadsheet.cjs`、`o_spreadsheet.xml`（Owl 模板）、`o_spreadsheet.css` |
| 後端 | **單人使用不需要後端**。多人協作才需要一台「訊息排序伺服器」，repo 附了一個 Express＋WebSocket 範例（`tools/server/main.cjs`，185 行，檔頭寫明「not suitable for production」） |
| 資料庫 | 沒有綁定。整份試算表就是一個 JSON（`exportData()`），你要存 Firestore、localStorage 或檔案都可以 |
| 部署 | 純靜態檔案，可以直接放 Firebase Hosting。`.github/workflows/release.yml` 每次 `[REL]` 都會把 `dist/*` 附在 GitHub Release，並發布到 npm（`@odoo/o-spreadsheet`），所以可以**不自己建置**，直接下載 dist |
| 建置需求（只有要改原始碼才需要） | `package.json` 的 `engines` 要求 Node `>=24.22.1`、npm `>=11.19.1`（repo 裡的 CLAUDE.md 寫 Node >=22，兩者不一致） |
| 硬體／GPU | 不需要 GPU，一般瀏覽器就能跑。`browserslist` 只寫「last 1 Chrome versions」，舊瀏覽器的支援度是**未確認** |
| API Key／費用 | **完全不需要**。沒有任何雲端服務相依；要接 Claude 才需要 Anthropic API Key（見第 7 節） |
| Node 端（無 UI） | `tools/run_in_node.mjs` 示範在 Node 裡 `new Model()`，代表**模型層（公式計算）可以在伺服器端跑**，例如放在 Firebase Functions 做批次試算（未實際執行驗證） |

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

```
o-spreadsheet/
├── LICENSE / COPYRIGHT          LGPLv3＋GPLv3 全文；Odoo S.A. 版權
├── readme.md                    簡介與文件索引
├── CLAUDE.md, .claude/skills/   ← 給「貢獻者」用 Claude Code 的說明與 2 個 Skills（review、testing），不是產品功能
├── package.json                 相依、build script、jest 設定
├── rolldown.config.js           打包設定（owl / chart.js / luxon 設為 external）
├── demo/                        ★ 範例：完整 demo（main.js）與最小範例（minimalist.html/js）
│   ├── minimalist.html/.js      ★ 最小嵌入範例（純 script 載入）
│   ├── main.js                  完整 demo：xlsx 匯入／匯出選單、協作、FileStore
│   ├── transport.js             WebSocket 版 TransportService（協作用）
│   ├── file_store.js            圖片上傳介面範例
│   └── data.js                  範例資料，含 makeLargeDataset（效能測試資料產生器）
├── doc/                         ★ 官方文件
│   ├── integrating/integration.md         嵌入、Model 參數、翻譯、圖片、幣別、地區
│   ├── integrating/collaborative/         協作（OT）原理與伺服器協定
│   ├── data-model.md, data-model/*.md     ★ JSON 資料格式（cells、style、format、cf、chart、pivot、table…）
│   ├── add_function.md                    ★ 自訂函數＋接外部 API
│   └── extending/                         架構、plugin、command、UI 擴充、翻譯
├── tools/server/main.cjs        協作伺服器範例（Express＋express-ws）
├── src/
│   ├── index.ts                 ★ 對外 API 匯出（Model、Spreadsheet、registries、helpers、addFunction…）
│   ├── model.ts                 ★ 核心 Model：dispatch 命令、getters、exportData、exportXLSX
│   ├── formulas/                ★ 公式引擎前段：tokenizer.ts → parser.ts（AST）→ compiler.ts（編譯成 JS function）
│   ├── functions/               ★ 內建函數：15 個 module_*.ts（數學、統計、財務、查找、文字、日期…）
│   ├── plugins/
│   │   ├── core/                (24 檔) 會被存檔、會同步的資料：cell、sheet、merge、borders、CF、資料驗證、chart、pivot、image、tables…
│   │   ├── evaluation/          計算層：cell_evaluation/（evaluator、依賴圖、interval tree、R-tree）、篩選、CF 評估
│   │   ├── ui_feature/          排序、格式、復原／重做(local_history)、鎖定工作表、協作游標
│   │   └── ui_stateful/         選取範圍、欄列位置、圖形
│   ├── collaborative/           ★ 協作：session.ts（revision 管理）、ot/（Operational Transform）、command_squisher
│   ├── history/                 選擇性復原（selective history）樹狀結構
│   ├── stores/                  UI 狀態；grid_renderer_store.ts ★ Canvas 格線繪製
│   ├── components/              (280 個 .ts) Owl 元件：grid、composer（公式編輯列）、side_panel、figures（圖表）、filters、autofill…
│   ├── clipboard_handlers/      複製貼上：儲存格、格式、CF、資料驗證、合併、圖表、圖片…
│   ├── xlsx/                    ★ xlsx 讀（xlsx_reader.ts＋extraction/＋conversion/）與寫（xlsx_writer.ts＋functions/）
│   ├── migrations/              舊版 JSON 資料自動升級；data.ts 的 load() 也會偵測 xlsx
│   ├── registries/              所有擴充點（function、chart、menu、side panel、autofill、criterion、OT…）
│   └── helpers/                 格式化（format/）、日期、樞紐（pivot/）、圖表（figures/charts/）、剪貼簿等工具
└── tests/                       417 個檔（299 個 *.test.ts）：figures 93、pivots 25、collaborative 20、functions 21…
```

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

### 5.1 Model：所有狀態變更都透過「命令（command）」
- 位置：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/model.ts#L156-L258 （建構子）、#L548-L620（`dispatch`）
- 重點：採用 **Command Query Separation**。寫入一律 `model.dispatch("UPDATE_CELL", {...})`，讀取一律 `model.getters.xxx()`。Plugin 分三層：Core（會存檔、會同步）、Evaluation（計算）、UI（選取、捲動等本機狀態）。建構子依序載入 `corePluginRegistry` → `evaluationPluginRegistry` → `statefulUIPluginRegistry` → `featurePluginRegistry`。
- 命令型別全部定義在 https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/types/commands.ts （我用 `grep -c 'type: "'` 算出 139 處命令型別宣告）。例如 `UPDATE_CELL` 在 #L393-L398，payload 有 `content`、`style`、`format`。
- 架構說明：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/doc/extending/architecture.md

### 5.2 公式引擎：Tokenizer → Parser → Compiler（產生 JS 函數）→ 依賴圖重算
- Tokenizer：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/formulas/tokenizer.ts#L52 （`tokenize(str, locale)`，支援依地區設定切換小數點與參數分隔符號）
- Parser：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/formulas/parser.ts#L323-L370 （以運算子優先順序的遞迴下降方式產生 AST；陣列常值 `{1,2;3,4}` 在 #L296）
- Compiler：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/formulas/compiler.ts#L423-L460 。重點：把 AST 轉成 JS 原始碼，再用 **`new Function(...)`** 編譯（#L445）。並且用「公式形狀」當快取鍵（`compilationCacheKey`，#L602），所以 `=A1+B1`、`=A2+B2` 這類同形狀的公式只會編譯一次，這是它在大量公式下效能好的關鍵之一。
- 依賴圖：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/evaluation/cell_evaluation/formula_dependency_graph.ts#L7-L42 。每個欄位一棵 **interval tree**，可以很快找出「哪些公式依賴這個範圍」。註解也承認刪除依賴沒實作（會累積過期的區間，但他們說實務上沒遇到效能問題）。
- 計算器：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/evaluation/cell_evaluation/evaluator.ts#L60-L272 。`updateDependencies`、`evaluateCells`（只重算受影響的格子）、`evaluateAllCells`；陣列公式溢出（spill）與碰撞檢查在 #L520-L545；循環參照錯誤在 #L826。

### 5.3 內建函數：一個函數＝一個物件
- 註冊：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/functions/function_registry_population.ts#L23-L48 。15 個模組依分類註冊；匯出名稱裡的 `_` 會換成 `.`（例如 `STDEV_P` → `STDEV.P`）。
- 範例 `ABS`：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/functions/module_math.ts#L46-L53 。每個函數都是 `{ description, args, compute, isExported }`，`isExported: true` 表示匯出 xlsx 時可以保留公式。

### 5.4 Canvas 繪製＋只畫看得到的範圍
- Canvas 掛載：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/components/helpers/draw_grid_hook.ts#L27-L66 。`canvas.getContext("2d")`，依 `devicePixelRatio` 和縮放倍率調整解析度，並位移 0.5px 讓線條清晰。
- 分層繪製：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/stores/grid_renderer_store.ts#L158-L196 。依序畫背景、溢出文字背景、儲存格底色、框線、文字、圖示，最後畫凍結窗格和欄列標題。
- 只算可視範圍：同檔 #L956-L970 的 `getGridBoxes`，只對 `getSheetViewVisibleCols/Rows` 回傳的欄列產生要畫的方塊。Viewport 邏輯在 https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/helpers/internal_viewport.ts#L17

### 5.5 協作：Operational Transform（OT）＋中央 revision 排序
- 文件：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/doc/integrating/collaborative/collaborative.md
- Session：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/collaborative/session.ts#L36
- OT 轉換：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/collaborative/ot/ot.ts#L59-L95
- 重點：**轉換都在前端做**，伺服器只負責一件事：訊息裡的 `serverRevisionId` 等於目前的 revision 才接受，接受後把 revision 改成 `nextRevisionId` 並廣播給所有人（包括送出者）；不符合就拒絕，讓前端自己轉換後重送。範例伺服器的判斷就這幾行：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/tools/server/main.cjs#L155-L175 。所以後端可以用很簡單的方式自己實作，包括用 Firestore transaction（見 11 節）。

### 5.6 xlsx 匯入／匯出（不需要第三方 xlsx 函式庫，但要自己解壓縮或壓縮 zip）
- 匯入：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/migrations/data.ts#L37-L51 。`load()` 看到資料裡有 `"[Content_Types].xml"` 鍵，就交給 `XlsxReader`（https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/xlsx/xlsx_reader.ts#L30-L58 ）。也就是說，你只要把 xlsx 解壓成 `{ 檔名: XML 字串 }` 直接丟給 `new Model(files)` 就行。
- 匯出：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/model.ts#L760-L771 → https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/xlsx/xlsx_writer.ts#L68-L84 。回傳 `{ name, files: [{path, content}] }`，**zip 打包要你自己做**（demo 用 JSZip）：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/demo/main.js#L33-L52
- XML 解析和產生都是自己寫的（`src/xlsx/helpers/xml_helpers.ts`），不依賴 SheetJS 或 ExcelJS。

### 5.7 JSON 資料壓縮（squish）
- `exportData()` 會把同一欄裡「同形狀、只差參照位移」的公式壓成 delta 物件；格式說明在 https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/doc/data-model/cells.md 。
- 實作：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/core/squisher.ts#L38
- **要注意**：`exportData()`（https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/model.ts#L707-L731 ）每次都會**另外建一個 Model** 把壓縮後的資料載回來比對，確認無誤才回傳壓縮版。這很安全，但對大表來說很耗資源，自動儲存一定要加 debounce。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度（低／中／高） | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整個試算表（Model＋UI） | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/index.ts#L223-L242 | Owl 3 alpha、bootstrap CSS、chart.js、luxon | **低**（不拆，直接用 dist） | 用 `<script>` 載入 `o_spreadsheet.iife.js`，把 `Spreadsheet` 元件掛到一個 `<div>`；資料存 Firestore |
| 只用 Model（無 UI 的公式計算引擎） | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/model.ts#L156 | 打包後在 Node 可以 `new Model()`（`tools/run_in_node.mjs`） | **低～中** | 在 Firebase Functions 或瀏覽器裡用 `dispatch("UPDATE_CELL")` 寫值、`getters.getEvaluatedCell()` 讀結果，當「報價、成本計算 API」 |
| 公式解析器（tokenize／parse） | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/formulas/parser.ts#L363 | 少量 helpers、locale 型別 | **中** | `index.ts` 有直接匯出 `tokenize`、`parse`、`astToFormula`，可以拿來做公式語法檢查、公式高亮，或讓 Claude 產生的公式先驗證 |
| 函數庫（336 個） | https://github.com/odoo/o-spreadsheet/tree/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/functions | `helpers.ts`、`arguments.ts`、型別、`_t` 翻譯 | **中** | 財務（`module_financial.ts`）、日期（`module_date.ts`）可以單獨參考實作；要整包搬到別的引擎，需要改寫參數轉換層 |
| 依賴圖＋interval tree | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/evaluation/cell_evaluation/formula_dependency_graph.ts | `interval_tree.ts`、`range_set.ts`、zones helpers | **中** | 自己寫格狀計算工具（例如批次報價表）時，可以照抄這套「欄位 interval tree」來做增量重算 |
| Canvas 格線繪製 | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/stores/grid_renderer_store.ts | getters、viewport、store engine | **高** | 和 Model 綁得很緊；比較適合當成「怎麼用 Canvas 畫表格」的教材，讓 Claude 參考後重寫 |
| xlsx 讀取器 | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/xlsx/xlsx_reader.ts | 自家 XML helper、轉換對照表、`DOMParser`（瀏覽器） | **中～高** | 輸出是 o-spreadsheet 的 JSON 格式；如果你的 B 專案也用類似的 JSON，可以接一層轉換 |
| xlsx 寫出器 | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/xlsx/xlsx_writer.ts#L68 | `ExcelWorkbookData` 型別、JSZip（自備） | **中** | 想讓倉儲系統「下載成 Excel」又不想用 SheetJS 時可以參考；不過直接用整個 Model 的 `exportXLSX()` 最簡單 |
| 數字格式引擎 | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/helpers/format/format.ts#L85 | `format_parser.ts`、`format_tokenizer.ts`、locale | **低～中** | `formatValue(value, {format, locale})` 支援 Excel 格式字串（`#,##0.00`、`[$NT$]#,##0`、日期）；`index.ts` 的 `helpers.formatValue` 有匯出，可以拿來顯示金額 |
| 協作 OT＋Session | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/collaborative/session.ts#L36 | 命令系統、history | **高**（拆）／**低**（整包用） | 整包使用時，只要實作 `TransportService` 三個方法（https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/types/collaborative/transport_service.ts#L96-L119 ） |
| 資料驗證條件庫 | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/registries/criterion_registry.ts#L101 | 函數 helpers | **中** | 31 種條件（包含 `isValueInList`、`isValueInRange` 下拉選單、`isEmail`、`customFormula`），可以參考來做表單驗證 |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **產品本身沒有任何 AI 功能**。我在 `src/`、`demo/`、`doc/` 裡 grep `openai|anthropic|llm|gpt-|claude`，結果是 0 筆。也沒有 MCP server。
- **repo 裡有 Claude 相關檔案，但都是給「開發者」用的**：根目錄的 `CLAUDE.md`（60 行，說明怎麼跑測試、程式架構），以及 `.claude/skills/o-spreadsheet-review/`、`.claude/skills/o-spreadsheet-testing/` 兩個 Skill。這表示 Odoo 團隊自己就用 Claude Code 開發這個專案；你以後用 Claude Code 改它時，這些檔案會讓 Claude 比較快上手（內容我當成資料讀過，沒有照著執行）。
- **可以怎麼接 Claude（建議做法，未實作）**：
  1. **自訂函數 `=CLAUDE("幫我寫這個商品的 30 字廣告文案", A2)`**：照 `doc/add_function.md` 的「Connecting to an external API」章節（https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/doc/add_function.md ，約 L430 之後），寫一個 `EvaluationPlugin` 加上快取：第一次計算先回傳「Loading...」，呼叫你的 Firebase Function（由它帶 API Key 去呼叫 Claude API），結果回來存進快取，再觸發重算。**不要把 API Key 放在前端。**
  2. **讓 Claude 直接產生整張表**：Claude 輸出符合 `doc/data-model.md` 的 JSON（`sheets[].cells` 用 `"A1": "=SUM(...)"` 這種格式就好），前端 `new Model(json)` 直接打開。適合「幫我做一張短劇拍攝排程表」「幫我做 10 個 SKU 的成本試算表」。
  3. **讓 Claude 操作現有的表**：把使用者的指令轉成一串 `model.dispatch(...)` 命令（`UPDATE_CELL`、`SET_FORMATTING`、`ADD_CONDITIONAL_FORMAT`、`CREATE_CHART`…）。命令都有 TypeScript 型別，很適合當作 Claude 的 tool schema。
- **能不能換成 Claude**：本來就沒有綁定任何模型，所以是「可接」。

---

## 8. 擴充方式與 API

| 擴充點 | 怎麼用 | 位置 |
|---|---|---|
| 自訂函數 | `o_spreadsheet.addFunction("MY.FUNC", { description, args:[arg("x (number)", "...")], compute(x){...}, isExported:false })`，回傳值可以鏈式呼叫 | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/index.ts#L602-L608 、文件 `doc/add_function.md` |
| 外部相依 | `new Model(data, { custom: {...} })`，函數的 `this` 和 plugin config 都拿得到 | `doc/integrating/integration.md` |
| Plugin | `registries.corePluginRegistry`／`evaluationPluginRegistry`／`featurePluginRegistry.add(name, Class)`；core plugin 要實作 `import/export`（會存檔） | `doc/extending/plugin.md`、`src/plugins/plugin_registries.ts` |
| 選單 | `registries.topbarMenuRegistry.addChild("id", ["file"], { name, execute })`；也有 `cellMenuRegistry`、`colMenuRegistry`、`rowMenuRegistry` | `demo/main.js` L23-L52 |
| 側邊欄、圖表類型、自動填滿規則、資料驗證條件、儲存格圖示 | `registries.sidePanelRegistry`、`chartRegistry`、`autofillRulesRegistry`、`criterionEvaluatorRegistry`、`iconsOnCellRegistry`… | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/index.ts#L285 |
| 協作命令 | 新增會同步的命令：`coreTypes.add("MY_CMD")`，並用 `otRegistry.addTransformation(...)` 寫轉換函數 | `doc/integrating/collaborative/collaborative.md` |
| 圖片 | `external.fileStore`，實作 `upload(file) → path`、`getFile(path)` | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/types/files.ts#L9-L19 |
| 幣別／地區 | `external.loadCurrencies()`、`external.loadLocales()`；`defaultCurrencyFormat` 可以設成 `"[$NT$]#,##0"` | `doc/integrating/integration.md` |
| 翻譯 | `o_spreadsheet.setTranslationMethod(_t)` | `doc/extending/translations.md` |
| 模式 | `mode: "normal" | "readonly" | "dashboard"`，也可以執行時呼叫 `model.updateMode()` | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/model.ts#L745-L749 |
| 事件 | `model.on("update", owner, cb)`、`"command-dispatched"`、`"command-finalized"`、`"command-rejected"`、`"unexpected-revision-id"` | https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/model.ts#L389-L391 、#L662-L671；EventBus：`src/helpers/event_bus.ts` |

readme 裡有幾項文件（選單、側邊欄、通知、匯出 Excel）標示「under construction」，這些要看原始碼或 demo 才知道怎麼用。

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

**維護狀況：非常活躍。**
- 最新 commit 是 2026-11-03 的 `[REL] 20.0.6`。用 `git ls-remote` 看到 664 個分支、1114 個 tag。穩定分支從 `14.0` 到 `20.0`，另外有 `saas-14.4` 到 `saas-19.4` 和 `master`，跟著 Odoo 版本走。
- 由 Odoo S.A. 的團隊維護。星數少只是因為大家多半是透過 Odoo 在用它。

**測試：** `tests/` 有 299 個 `*.test.ts`（jest＋jsdom＋canvas、圖片快照），還有 `npm run monkey` 協作壓力測試。依安全規則，我**沒有執行**任何測試。

**資安／隱私／遙測：**
- 在 `src/` 裡 grep `fetch(`、`XMLHttpRequest`、`sendBeacon`，只找到 `standalone_grid_canvas.ts` 用來載入圖表圖片路徑的一處 `fetch(path)`。**沒有發現任何遙測或往外傳資料的程式。**
- 編譯器用 `new Function`（`src/formulas/compiler.ts#L445`）。如果你的網站有設嚴格的 CSP（Content-Security-Policy），要允許 `'unsafe-eval'`，不然公式無法計算。Firebase Hosting 預設沒有 CSP，所以通常沒問題。
- 產生 JS 原始碼時，`code_builder.ts` 的 `jsStr` 模板只接受 `JsString`、數字、布林（`isSafeJsValue`，#L51-L52），字串與數字字面值另外以參數陣列傳入。這是有意識的防注入設計，但我沒有做完整的安全稽核，所以實際安全性是**未確認**。
- 範例協作伺服器 `tools/server/main.cjs` 開了 `Access-Control-Allow-Origin: *`，也沒有身分驗證，**絕對不能直接上線**。

**已知的坑（實際讀程式碼看到的）：**
1. **UI 依賴 Owl 3.0.0-alpha.50**，是 alpha 版，demo 還要透過 `compatibility` 層（`src/owl3_compatibility_layer.ts`）。升級時 API 可能會變。
2. **xlsx 匯入要自己解壓縮**（例如 JSZip），匯出也要自己壓縮，函式庫只處理 XML。
3. **xlsx 匯入不支援的項目**（`src/xlsx/helpers/xlsx_parser_error_manager.ts#L4-L23` 有列出）：斜線框線、部分框線樣式、填滿樣式、部分字型與對齊、多規則條件格式、條件格式裡的框線／數字格式、時間／文字長度／整數類型的資料驗證等。遇到時會跳警告，然後略過。
4. **從 Excel／Google 試算表貼上只保留「純文字值」**：`clipboard_helpers.ts` 一看到 Microsoft 的 HTML 命名空間就直接忽略 HTML（#L111-L118，判斷在 #L115），改用 `\t` 和換行切成表格（`cell_clipboard.ts#L291`）。所以格式、顏色、公式都不會跟著貼過來；只有 o-spreadsheet 內部互相複製時才會保留完整格式。
5. **沒有 CSV 匯入／匯出**：`src/` 裡 grep `csv` 不分大小寫是 0 筆。要自己寫（很簡單：CSV → `cells` JSON）。
6. **復原上限 99 步**（`src/constants.ts#L213`，`MAX_HISTORY_STEPS = 99`）。
7. **`exportData()` 很耗資源**（見 5.7 節），自動儲存要加 debounce。
8. **函數是同步執行的**，接外部 API 一定要用「快取＋Loading」的寫法。
9. **repo 裡沒有翻譯檔**（檔案清單中沒有 `.po`），預設介面是英文；繁體中文要自己提供 `_t` 翻譯表（見第 11 節）。

---

## 10. 跟其他專案組合的建議

- **o-spreadsheet（A）＋你的 Firebase 倉儲系統（B）**：最直接的組合。用 o-spreadsheet 當「進階檢視／報表頁」，把 Firestore 庫存資料轉成 `cells` JSON 灌進去；用自訂函數 `=STOCK(sku)` 即時讀庫存。主要的 CRUD 畫面仍然用你原本的表單，避免整個系統都綁在試算表上。
- **o-spreadsheet（UI）＋HyperFormula（handsontable/hyperformula，另一份資料包）**：一般**不建議混用**，因為 o-spreadsheet 已經內建完整的公式引擎，換掉的成本很高。比較好的分工是：後端批次計算想用輕量引擎時用 HyperFormula（授權要另外看），前端互動用 o-spreadsheet。
- **o-spreadsheet vs Univer（dream-num/univer）／Luckysheet**：三者都是 Canvas 試算表。o-spreadsheet 的優點是 **LGPL、xlsx 匯入匯出都在開源版、協作協定簡單到可以自己用 Firestore 實作、有大廠產品長期維護**；缺點是 Owl 框架比較少人用、社群和中文資源少。建議兩邊都做一個小 PoC，再決定 A 用哪個。
- **o-spreadsheet＋Claude（AI 影片／腳本專案）**：把「短劇分鏡表」「廣告素材排程」做成試算表，每一列是一場戲或一支素材。用 `=CLAUDE()` 自訂函數產生台詞或文案，再用另一個函數呼叫影片生成 API，把回傳的網址寫回儲存格（連結格式 `[文字](url)` 有支援，見 `demo/data.js`）。
- **比價／成本計算**：內建 SUMIFS、XLOOKUP、FILTER、SORT、UNIQUE、PIVOT，以及 49 個財務函數，加上條件格式（色階、圖示集、資料橫條），已經足夠做「多通路比價表」。抓價格的部分用自訂函數接你自己的爬蟲或 API。

---

## 11. 網頁 Excel 能力檢查表

### 渲染方式（Canvas／DOM／WebGL）、虛擬捲動、10 萬列以上的效能
- **渲染：有，Canvas 2D。** https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/components/helpers/draw_grid_hook.ts#L32 。格線、文字、框線全部畫在 canvas 上；選單、側邊欄、公式編輯器是 DOM（Owl 元件）。
- **虛擬捲動：有。** 只對可視欄列產生繪製方塊（https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/stores/grid_renderer_store.ts#L956-L970 ）。
- **10 萬列效能：未確認**（沒有實際執行）。我讀到的證據有：demo 內建 `makeLargeDataset(26, 10_000, ...)` 效能測試資料（`demo/main.js`），可以測公式、陣列公式、向量化公式；有公式形狀快取、interval tree 依賴圖、R-tree（`r_tree.ts`、`rbush`）；樞紐分析上限 `PIVOT_MAX_NUMBER_OF_CELLS = 5e5`（`src/constants.ts`）。程式碼裡沒有看到列數上限常數。

### 公式引擎
- **函數數量：有，336 個（自己數的）。** 計算方式：在 `src/functions/module_*.ts` 這 15 個檔案裡，用 `grep -hoE '^export const [A-Z0-9_]+'` 列出所有匯出的大寫常數，共 336 個，`sort -u` 之後也是 336 個，沒有重複；`CORREL` 是 `PEARSON` 的別名，也算在內。各模組數量：math 61、statistical 65、financial 49、date 32、text 28、array 23、lookup 20、operators 16、database 12、info 11、logical 11、filter 4，engineering、parser、web 各 1。其中 **3 個是隱藏的**（`ARRAY.LITERAL`、`ARRAY.ROW`、`SPILLED.RANGE`），**16 個是運算子對應函數**（`ADD`、`MINUS`、`EQ`…，Google 試算表也有這些）。所以使用者看得到、可以打的函數約 333 個，扣掉運算子類約 318 個。另外用 `grep -c 'isExported: true'` 加總約 290 處，代表匯出 xlsx 時能保留公式的函數大約有這麼多（概略數字）。
  - 包含：VLOOKUP／HLOOKUP／XLOOKUP／INDEX／MATCH、SUMIFS／COUNTIFS／AVERAGEIFS、FILTER／SORT／SORTN／UNIQUE、SEQUENCE、TEXTSPLIT、REGEXEXTRACT、HSTACK／VSTACK／TAKE／DROP 等動態陣列函數、PIVOT／PIVOT.VALUE／PIVOT.HEADER、XIRR／XNPV。**沒有** `LET`、`LAMBDA`（清單中沒有這兩個名字）。
- **解析器與依賴圖／重算：有。** Parser：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/formulas/parser.ts#L363 ；依賴圖：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/evaluation/cell_evaluation/formula_dependency_graph.ts#L15 ；增量重算：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/evaluation/cell_evaluation/evaluator.ts#L196-L238
- **陣列公式（動態溢出）：有。** 溢出與碰撞檢查在 `evaluator.ts` #L520-L545，有 `isArrayFormulaSpillBlocked`；陣列常值 `{1,2;3,4}` 由 `parser.ts#L296` 處理。
- **跨工作表參照：有。** `Sheet2!A1` 這種格式在 `doc/data-model/cells.md` 有記載；demo 資料裡有 `=Charts!B2`。依賴圖以 `sheetId` 分組（`formula_dependency_graph.ts#L17`）。
- **自訂函數：有。** `addFunction`（https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/index.ts#L602-L608 ），支援自訂格式（`computeFormat`）、延遲參數、可重複參數、匯出 xlsx 標記。

### 儲存格編輯、複製貼上、拖拉填滿、復原／重做
- **儲存格編輯：有。** 有公式編輯器 composer（`src/components/composer/`），支援自動完成和參數提示（`src/functions/autocomplete_arguments_provider.ts`）。
- **複製貼上：有，但從 Excel／Google 試算表貼上只保留純文字值**（格式和公式會遺失）。https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/helpers/clipboard/clipboard_helpers.ts#L75-L124 、https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/clipboard_handlers/cell_clipboard.ts#L291 。從 o-spreadsheet 複製出去時，會同時放 HTML table 和 TSV（`src/stores/clipboard_store.ts` L573-L627），貼到 Excel 時文字可以正確分欄。也支援貼上剪貼簿裡的圖片（`clipboard_store.ts` L166-L180）。
- **拖拉填滿：有。** `src/components/autofill/autofill_store.ts#L105`（`AUTOFILL` 命令），規則可以擴充：`src/registries/autofill_rules.ts`（數列、日期間隔等）。
- **復原／重做：有，上限 99 步。** https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/ui_feature/local_history.ts#L15 、`src/constants.ts#L213`；協作模式下是「選擇性復原」（`src/history/selective_history.ts`），只撤銷自己的操作。

### 格式
- **數字格式：有。** 支援 Excel 格式字串、幣別、會計格式、大數字縮寫：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/helpers/format/format.ts#L85 、`format_parser.ts#L78`。
- **條件格式：有。** 單色規則（CellIsRule 等）、色階、資料橫條、圖示集：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/types/conditional_formatting.ts#L25 ；plugin：`src/plugins/core/conditional_format.ts#L48`。
- **合併儲存格：有。** https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/core/merge.ts#L40
- **凍結窗格：有。** `FREEZE_ROWS`／`FREEZE_COLUMNS`：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/core/sheet.ts#L194 ；最多可以凍結到畫面的 85%（`MAXIMAL_FREEZABLE_RATIO`）。
- **欄寬列高：有。** https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/core/header_size.ts#L17 ；也支援隱藏欄列和欄列群組折疊（`header_grouping.ts`）。
- **篩選：有。** 透過「表格（table）」功能提供：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/core/tables.ts#L49 ＋ `src/plugins/evaluation/filter_evaluation.ts#L15`。
- **排序：有。** https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/ui_feature/sort.ts#L23
- **資料驗證（下拉選單）：有。** 31 種條件，包含 `isValueInList`、`isValueInRange`（下拉選單）、`isBoolean`（核取方塊）、`customFormula`：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/core/data_validation.ts#L24 、`src/registries/criterion_registry.ts`（我用 grep `criterionEvaluatorRegistry.add("…"` 數出 31 種）。

### 圖表、樞紐分析、圖片／附件
- **圖表：有，24 種子類型**（用 grep `.add("…", {` 數 `src/registries/chart_types.ts` 得到）：line、stacked_line、area、stacked_area、scatter、bubble、column、stacked_column、bar、stacked_bar、combo、pie、doughnut、gauge、scorecard、waterfall、pyramid、radar、filled_radar、geo、funnel、sunburst、treemap、calendar。繪圖用 Chart.js（要自己載入）。檔案在 https://github.com/odoo/o-spreadsheet/tree/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/helpers/figures/charts
- **樞紐分析：有。** 有 UI 側邊欄，也有 `PIVOT()`、`PIVOT.VALUE()`、`PIVOT.HEADER()` 公式（`module_lookup.ts#L798`、`#L898`）；core plugin：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/core/pivot.ts#L33 ；資料來源是試算表範圍（`src/helpers/pivot/spreadsheet_pivot/`）。
- **圖片：有，但要你提供 FileStore**（上傳到哪裡由你決定，例如 Firebase Storage）。https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/core/image.ts#L16 、`src/types/files.ts#L9`。
- **附件（任意檔案）：沒有**（只有圖片和超連結；連結語法 `[文字](https://...)`）。

### 匯入匯出
- **.xlsx 匯入：有（開源版就有），不用第三方 xlsx 函式庫，但要自備解壓縮工具（例如 JSZip）。** 保真度：儲存格、樣式、數字格式、合併、條件格式、資料驗證、表格、圖表、圖片、樞紐、外部連結都有對應的 extractor（`src/xlsx/extraction/` 有 11 個檔）；不支援的項目見第 9 節第 3 點。
- **.xlsx 匯出：有。** `model.exportXLSX()`。不支援匯出為 Excel 公式的函數（`isExported` 不是 true 的），會改寫成計算後的值（`cell_evaluation_plugin.ts` L396-L433）。
- **.csv：沒有。** grep 結果是 0，要自己寫。
- **原生格式**：JSON（demo 稱為 OSHEET），有版本號和自動遷移（`src/migrations/`）。

### 多人即時協作
- **有，使用 OT（Operational Transform），不是 CRDT，也不是鎖定。** 伺服器只需要「依 revision 排序並廣播」，見 5.5 節。
- **需要的伺服器**：任何能「原子性比對 revisionId → 寫入 → 廣播」的服務都可以。範例是 Node＋WebSocket（https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/tools/server/main.cjs ）。
- **用 Firebase 實作的思路（建議，未驗證）**：`sendMessage(msg)` → Firestore transaction 讀 `sheets/{id}/meta.revision`，等於 `msg.serverRevisionId` 才寫入 `messages/{nextRevisionId}` 並把 revision 更新為 `msg.nextRevisionId`；`onNewMessage` 用 `onSnapshot` 監聽 `messages` 依時間排序；不符合 revision 就直接丟掉（前端會自己轉換後重送）。至於不改變狀態的訊息（CLIENT_JOINED／MOVED／LEFT），可以考慮用 Realtime Database 處理。

### 資料模型（JSON）與存進 Firestore
- 文件：https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/doc/data-model.md （另有 `doc/data-model/` 下 9 個分項文件）
- 最小範例（可以直接 `new Model(這個物件)`）：
```json
{
  "version": "18.4.2",
  "revisionId": "START_REVISION",
  "sheets": [{
    "id": "inv", "name": "庫存", "colNumber": 10, "rowNumber": 500,
    "cells": { "A1": "SKU", "B1": "數量", "C1": "單價", "D1": "金額",
               "A2": "TW-001", "B2": "12", "C2": "350", "D2": "=B2*C2" },
    "merges": [], "conditionalFormats": [], "figures": [], "tables": []
  }],
  "styles": {}, "formats": {}, "borders": {}
}
```
  `version` 可以省略，省略時當成最新版。`load()` 會自動補上缺少的欄位並做遷移（`src/migrations/data.ts#L37`）。
- **存進 Firestore 的建議**：(1) 存成**字串**：`JSON.stringify(model.exportData())`，因為 Firestore 不支援陣列裡再放陣列，而且 `exportData()` 可能產生物件型的 delta；(2) 單一文件上限 1 MiB，大表改存 Cloud Storage，Firestore 只放 metadata；(3) 監聽 `model.on("update", …)` 時要加 debounce（例如 2 秒）再儲存，因為 `exportData()` 很耗資源。

### 手機／觸控、繁體中文介面
- **手機／觸控：有基本支援（程度未確認）。** `isMobileOS()` 偵測（`src/components/helpers/dom_helpers.ts#L293`）、觸控處理 hook（https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/components/helpers/touch_handlers_hook.ts#L18 ）、手機版底部工具列 `src/components/small_bottom_bar/`（含 ribbon_menu）。實際手機體驗沒有測試。
- **繁體中文介面：沒有內建翻譯檔**（repo 裡沒有 `.po`），但所有字串都經過 `_t()`，可以用 `setTranslationMethod` 自己接上中文翻譯表。Odoo 主程式應該有 zh_TW 翻譯，但沒有查證，所以是**未確認**。地區設定方面，`src/migrations/locale.ts` 有 `zh_TW` 的週起始日（週日），可以自訂 locale（`dateFormat: "yyyy/mm/dd"`、千分位等）；中文輸入法（IME）的 composer 行為**未確認**。

### 嵌入方式：純 JavaScript 網頁（不用 React／Vue）
- **可以。** 需要 Owl 執行環境，但 Owl 是用 `<script>` 載入的，**不需要 npm 或任何建置步驟**。dist 檔案可以從 GitHub Release 下載，或用 npm 套件 `@odoo/o-spreadsheet`。
- **套件大小：未確認**（依規則沒有建置，也沒有下載 npm 套件）。原始碼規模是 743 個 TS 檔、約 14.2 萬行，可以預期 iife 檔不小；另外還要加上 Chart.js、luxon、bootstrap CSS。
- 最小範例（依 `doc/integrating/integration.md` 與 `demo/minimalist.html/.js` 改寫，**沒有實際執行**；CDN 網址請改成你實際下載或確認存在的版本）：
```html
<link rel="stylesheet" href="./o_spreadsheet.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css">
<div id="sheet" style="width:100vw;height:100vh"></div>
<script src="https://cdn.jsdelivr.net/npm/@odoo/owl@3.0.0-alpha.50/dist/owl.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.js"></script>
<script src="https://cdn.jsdelivr.net/npm/luxon@3.7.2/build/global/luxon.js"></script>
<script src="./o_spreadsheet.iife.js"></script>
<script type="module">
  const { Spreadsheet, Model, compatibility, setTranslationMethod } = o_spreadsheet;
  const { App } = compatibility;
  setTranslationMethod((t) => ({ "Insert": "插入", "Format": "格式" }[t] ?? t));
  const saved = localStorage.getItem("mySheet");             // 改成從 Firestore 讀
  const model = new Model(saved ? JSON.parse(saved) : {}, { mode: "normal" });
  let timer;
  model.on("update", null, () => {                            // 監聽變更，2 秒後存檔
    clearTimeout(timer);
    timer = setTimeout(() => localStorage.setItem("mySheet",
      JSON.stringify(model.exportData())), 2000);
  });
  const templates = await (await fetch("./o_spreadsheet.xml")).text();
  const app = new App({ templates });
  await app.createRoot(Spreadsheet, { props: { model } }).mount(document.getElementById("sheet"));
</script>
```

### API／事件：監聽變更、用程式讀寫儲存格
- **有。**
```js
const sheetId = model.getters.getActiveSheetId();
model.dispatch("UPDATE_CELL", { sheetId, col: 1, row: 1, content: "=SUM(B3:B10)" }); // 寫 B2
const cell = model.getters.getEvaluatedCell({ sheetId, col: 1, row: 1 });            // 讀計算結果
console.log(cell.value, cell.formattedValue);
model.on("command-dispatched", null, (cmd) => console.log(cmd.type));                 // 每個命令
```
  `getEvaluatedCell` 在 https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/evaluation/cell_evaluation/cell_evaluation_plugin.ts#L310 ；`getCell`（原始內容）的用法見 `doc/extending/architecture.md`；`helpers.toCartesian("B2")`、`toXC(col,row)` 可以做 A1 和座標之間的轉換（`src/index.ts` L382 起）。`EvaluatedCell` 型別確實有 `formattedValue` 欄位（`src/types/cells.ts#L32`）。

---

## 關鍵字
o-spreadsheet、Odoo、Odoo 試算表、網頁版 Excel、web spreadsheet、試算表引擎、spreadsheet engine、Canvas 渲染、canvas rendering、公式引擎、formula engine、依賴圖、dependency graph、interval tree、自訂函數、custom function、addFunction、xlsx 匯入、xlsx 匯出、xlsx import export、即時協作、real-time collaboration、Operational Transform、OT、TransportService、樞紐分析、pivot table、條件格式、conditional formatting、資料驗證、下拉選單、data validation、凍結窗格、合併儲存格、圖表、Chart.js、Owl、owl framework、LGPL、LGPL-3.0、TypeScript、Firebase、Firestore、嵌入、embed、純 JavaScript、iife、dashboard 模式、成本計算、比價表、ERP、Claude 整合
