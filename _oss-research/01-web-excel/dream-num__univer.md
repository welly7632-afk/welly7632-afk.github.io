# dream-num/univer — 可嵌進自家網頁的「網頁版 Excel＋公式引擎」SDK（Canvas 渲染、500+ 函數、Apache-2.0）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：c13b042
> GitHub：https://github.com/dream-num/univer｜⭐ 22883｜授權：Apache-2.0（開源核心；協作、xlsx 匯入匯出、圖表、樞紐分析等在另售的 Univer Pro）｜主要語言：TypeScript｜最近更新：2026-11-04

> 本資料包所有程式碼連結都固定在 commit `c13b042d18c80c8348fbe52da445d68435febbca`（掃描時 `dev` 分支最新一筆，訊息為 `fix(engine-render): restore public watermark constants (#8086)`，版本號 1.3.1）。
> 本次只「讀程式碼」，沒有安裝、建置或執行任何東西，所以效能數字與套件大小都標「未確認」。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** Univer 是一套「把 Excel／Google 試算表等級的試算表編輯器，嵌進你自己網頁」的開源 SDK——它不是一個現成網站，而是一堆可拼裝的外掛（plugin），提供 Canvas 繪製的表格畫面、相容 Excel 的公式引擎（本次數到 517 個已註冊函數）、以及一套可以用程式讀寫儲存格的 Facade API。

**對你（台灣小老闆、自己用 Claude 寫倉儲網頁 + Firebase）可以拿來做：**

1. **把倉儲系統的「庫存表」換成真正的試算表介面**：員工可以像在 Excel 裡一樣直接改數量、拖拉填滿、複製貼上（可以從 Excel 直接貼進來，見第 11 節），而你的程式用 `univerAPI` 監聽變更，再寫回 Firestore。
2. **成本計算／報價單／比價表**：公式引擎有 `VLOOKUP`、`XLOOKUP`、`SUMIFS`、`FILTER`、`UNIQUE`、`LAMBDA`、`LET`、`REGEXEXTRACT` 等現代 Excel 函數；還能用 `registerAsyncFunction` 寫自訂「非同步」函數，例如 `=查價("SKU123")` 讓儲存格自己去呼叫你的 API 或 Firebase 抓最新進價。
3. **廣告成效表**：把廣告平台匯出的資料貼進來，用條件格式（紅綠燈）、篩選、排序、資料驗證（下拉選單）做成每天看的報表。
4. **AI 協作（之後）**：官方定位是「AI Agent 的 Office 執行環境」，Facade API 可在瀏覽器與 Node.js 執行，Claude Code 可以寫腳本直接操作活頁簿 JSON；但本 repo 本身**沒有**內建任何 LLM／Claude 呼叫（見第 7 節）。

**不適合的地方（先講清楚）：** 開源版**沒有** `.xlsx` 匯入匯出、沒有圖表、沒有樞紐分析、沒有多人即時協作伺服器——這些都在付費的 Univer Pro（README 明列）。要開 Excel 檔，你得自己接 SheetJS／ExcelJS 之類的函式庫做轉換（A＋B＋C 組合的典型用法）。

---

## 2. 授權白話

- **授權：Apache-2.0**（[LICENSE](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/LICENSE)、根目錄 [package.json](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/package.json) 的 `"license": "Apache-2.0"`，每個 `packages/*/package.json` 也都是 Apache-2.0，例如 [packages/core/package.json](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/package.json)）。
- **個人使用：** 完全可以，免費、不用登記、不用開源你自己的程式碼。
- **公司商用：** 也可以免費商用、可以改、可以閉源包進你的產品。要做的事只有：保留原本的版權聲明與 LICENSE、若你修改了它的原始檔要註明有改過；Apache-2.0 另外有「專利授權」條款（對使用者有利）。不能用 Univer／DreamNum 的商標來宣傳你的產品。
- **內嵌的第三方程式碼：** 數字格式模組是從 borgar/numfmt 3.2.6（MIT 授權）複製進來的，見 [packages/core/src/shared/numfmt/LICENSE](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/numfmt/LICENSE)，散布時一併保留即可。
- **閉源／付費版（Univer Pro，`@univerjs-pro/*` 套件）才有的功能**（README「Open Source and Pro」表格，[README.md](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md)）：
  - 試算表：**即時協作、編輯歷史、匯入／匯出（xlsx）、列印、圖表、樞紐分析、走勢圖（sparkline）、大綱（群組）、形狀、儲存格內圖形、資料連接器、伺服器端計算、效能強化版公式功能**。
  - 簡報（Slides）整個搬到 Pro：[packages/slides/README.md](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/slides/README.md) 只剩一句「This package has moved to `@univerjs-pro/slides`」。
  - 伺服器：協作伺服器、SSR、計算委派等。
  - README 有寫邊界原則：「OSS 套件應能單獨使用，Pro 是選配」。Pro 的價格本 repo 沒寫 → **未確認**（需向官方詢價）。
- repo 內有一個 GitHub Actions 會在 `dev` 有變更時通知私有的 Pro repo（[DREAMNUM.md](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/DREAMNUM.md) 提到 `dispatch-sync-univer-pro.yml`），表示 Pro 是建立在這份開源碼之上、另外維護的閉源層。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | TypeScript（本次數到 6,729 個 `.ts/.tsx` 檔；`packages/*/src` 下排除 `__tests__` 的原始檔 4,510 個——用 `git ls-tree` 檔案清單 + `grep -E '\.(ts\|tsx)$'` 計算） |
| 前端 | 自家 Canvas 2D 渲染引擎（`@univerjs/engine-render`）；工具列／選單／對話框是 **React**（`@univerjs/ui`、`@univerjs/design` 以 react、react-dom 為 peerDependency，元件用 Radix UI、cmdk、sonner），另有 **RxJS**、依賴注入框架 `@wendellhu/redi` |
| 公式 | 自家公式引擎 `@univerjs/engine-formula`，依賴 `decimal.js`、`@flatten-js/interval-tree`（見 [packages/engine-formula/package.json](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/package.json)） |
| 後端 | **不需要**。純前端即可跑；也可在 Node.js（>=18.17）無介面（headless）跑公式與資料處理 |
| 資料庫 | 不綁定。活頁簿是一份 JSON（`IWorkbookData`），你自己決定存哪（Firestore、localStorage 都行） |
| 部署 | 打包成靜態檔丟 Firebase Hosting 即可；官方建議用 Vite／esbuild／Webpack 5 打包 |
| 瀏覽器 | Chrome/Edge ≥88、Firefox ≥90、Safari ≥14.1；需要 `Intl.Segmenter`（舊瀏覽器要 polyfill）（README「Compatibility」） |
| 硬體／GPU | 不需要 GPU；一般電腦、手機瀏覽器即可 |
| API Key／費用 | 開源版**不需要任何 API Key**，0 元。Pro 版需授權碼（README 提到 license configuration），價格未確認 |
| 開發這個 monorepo 本身 | Node.js ≥22.18、pnpm（根目錄 `package.json` 的 `devEngines`、`packageManager: pnpm@12.16.1`）。你**只是使用**的話不需要 clone，直接 `npm install @univerjs/...` 即可 |

---

## 4. 程式架構地圖

本次數到：`packages/` 下 60 個資料夾（其中 58 個有 `package.json`；`slides`、`slides-ui` 只剩「已搬到 Pro」的 README），`presets/packages/` 下 15 個 preset。

```
univer/
├── packages/                       ← 所有 @univerjs/* 套件（外掛化）
│   ├── core/                       ← 地基：Univer 類別、外掛系統、Command/Mutation、復原重做、資料模型(Workbook/Worksheet)、Facade 基底
│   │   └── src/sheets/typedef.ts   ← ★ 活頁簿 JSON 格式定義（IWorkbookData / IWorksheetData / ICellData）
│   ├── engine-render/              ← ★ Canvas 2D 渲染引擎（Scene/Viewport/Spreadsheet 元件、捲動快取）
│   ├── engine-formula/             ← ★ 公式引擎（Lexer → Parser(AST) → 依賴圖 → Interpreter；functions/ 下 16 類函數）
│   ├── sheets/                     ← 試算表「無 UI」邏輯：65 個 command、48 個 mutation（設值、合併、凍結、欄寬…）、自動填滿規則、Facade(FWorkbook/FWorksheet/FRange)
│   ├── sheets-ui/                  ← 試算表介面：選取、儲存格編輯器、剪貼簿(含從 Excel 貼上)、拖拉填滿 UI、手機版外掛、20 種語系
│   ├── sheets-formula / -ui        ← 把公式引擎接到試算表；自訂函數 registerFunction；公式輸入提示
│   ├── sheets-numfmt / -ui         ← 數字格式（貨幣、百分比、小數位）
│   ├── sheets-filter / -ui         ← 篩選
│   ├── sheets-sort / -ui           ← 排序
│   ├── sheets-conditional-formatting / -ui ← 條件格式
│   ├── sheets-data-validation / -ui        ← 資料驗證（下拉清單、核取方塊、日期…）
│   ├── sheets-table / -ui          ← 「表格」（類 Excel Table）
│   ├── sheets-drawing / -ui、drawing / -ui ← 浮動圖片、儲存格圖片、OLE 附件
│   ├── sheets-hyper-link / -ui、sheets-note / -ui、sheets-thread-comment / -ui ← 超連結、附註、留言串
│   ├── sheets-find-replace、find-replace ← 尋找取代
│   ├── sheets-crosshair-highlight  ← 十字準線高亮
│   ├── docs / docs-ui …            ← 文件編輯器（儲存格編輯器也借用它）
│   ├── ui / design / themes        ← React UI 外殼、元件庫、主題（含深色模式）
│   ├── rpc / rpc-node / network    ← Web Worker／Node 之間的 RPC、HTTP 抽象
│   ├── telemetry                   ← 只有「介面」，不會自己送資料（見第 9 節）
│   ├── ui-adapter-vue3 / ui-adapter-web-component ← Vue 3、Web Component 轉接
│   └── watermark、action-recorder、protocol …
├── presets/
│   ├── src/preset.ts               ← createUniver()：一次註冊一組外掛的入口
│   └── packages/preset-sheets-core 等 15 個 ← 「懶人包」：核心、篩選、排序、條件格式、資料驗證、圖片、表格…
├── examples/                       ← 官方 Vite 範例工作台（sheets/mount.ts 示範把所有 preset 疊起來＋手機模式切換）
├── common/shared/                  ← 建置工具（tsdown、UMD 設定、preset 建置）
├── tests/formula-integration/      ← 公式整合測試
└── docs/                           ← 架構筆記（ISOMORPHIC、API_STABILITY、FIX_MEMORY_LEAK、tldr 圖）
```

關鍵入口：
- [packages/core/src/univer.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/univer.ts#L122-L240)：`Univer` 類別、`createUnit()`（L197）、`registerPlugin()`（L239）。
- [presets/src/preset.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/src/preset.ts#L48)：`createUniver()`。
- [presets/packages/preset-sheets-core/src/preset.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/preset.ts#L87-L169)：核心 preset 實際註冊了哪些外掛（Network、Docs、Render、UI、Formula、Sheets、SheetsUI、Numfmt、SheetsFormula…）。

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 外掛系統 | [core/src/services/plugin/plugin.service.ts#L42-L65](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L42-L65) | 每個功能都是 `Plugin` 子類別，有 `onStarting / onReady / onRendered / onSteady` 四個生命週期；用 `@wendellhu/redi` 做依賴注入。要加功能就是寫一個 Plugin。 |
| Command／Mutation（所有編輯的單一通道） | [core/src/services/command/command.service.ts#L37-L60](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L37-L60) | 三種型別：COMMAND（業務動作，會產生 mutation 和 undo mutation）、OPERATION（不存檔的狀態，如捲動）、MUTATION（真正改資料、可序列化）。復原重做、協作（Pro）、監聽變更都建在這上面。 |
| 設定儲存格值 | [sheets/src/commands/commands/set-range-values.command.ts#L53](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/commands/set-range-values.command.ts#L53)、[sheets/src/commands/mutations/set-range-values.mutation.ts#L156-L157](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/mutations/set-range-values.mutation.ts#L156-L157) | command id `sheet.command.set-range-values` → mutation id `sheet.mutation.set-range-values`。監聽這個 mutation 就能做「增量存檔」。 |
| 復原／重做 | [core/src/services/undoredo/undoredo.service.ts#L180-L219](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/undoredo/undoredo.service.ts#L180-L219) | `LocalUndoRedoService.pushUndoRedo()` 收集每個 command 的 redo/undo mutation 組。 |
| Canvas 渲染 | [engine-render/src/canvas.ts#L88](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/canvas.ts#L88)、[components/sheets/spreadsheet.ts#L268-L420](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L268-L420) | 用 `getContext('2d')`（不是 WebGL、不是 DOM 表格）。`Spreadsheet.draw()` 依序呼叫背景、框線、文字等 extension（[extensions/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/extensions)）。 |
| 捲動只重畫差異區 | [spreadsheet.ts#L518-L560](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L518-L560)、[#L627-L690](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L627-L690) | 維護一張「快取 canvas」，捲動時把舊畫面平移複製（`_copyCacheForScrolling`），只畫新露出來的 `diffBounds`；位移太大才整張重畫。 |
| 只算可見列欄（虛擬捲動） | [engine-render/src/components/sheets/sheet.render-skeleton.ts#L1280-L1310](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/sheet.render-skeleton.ts#L1280-L1310) | 用列高累加陣列 `rowHeightAccumulation` + 二分搜尋 `searchArray` 找出 viewport 的起訖列欄，只為這些儲存格建樣式快取（`setStylesCache`，L524）。 |
| 公式：詞法分析 | [engine-formula/src/engine/analysis/lexer-tree-builder.ts#L99](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/lexer-tree-builder.ts#L99)（`treeBuilder` 在 L712，共 2,562 行） | 把公式字串切成 token 樹，處理括號、參照、陣列常數、新版 Excel 函數前綴（`NEW_EXCEL_FUNCTIONS`，L2123）。 |
| 公式：語法樹 | [engine/analysis/parser.ts#L48-L80](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/parser.ts#L48-L80) | `AstTreeBuilder.parse()` 產生 AST；節點型別在 [engine/ast-node/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node)（function、lambda、operator、reference、union…）。 |
| 公式：依賴圖 | [engine/dependency/formula-dependency.ts#L97-L147](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L97-L147) | `FormulaDependencyGenerator.generate()` 建依賴樹，搭配 interval tree 判斷哪些公式受「髒範圍」影響，只重算受影響的。 |
| 公式：執行 | [services/calculate-formula.service.ts#L265-L310](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/calculate-formula.service.ts#L265-L310)、[engine/interpreter/interpreter.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/interpreter/interpreter.ts) | `execute()` 加鎖 → 載入設定 → `_executeStep()`：先算一般公式，再處理陣列公式溢出（spill）範圍造成的二次髒區；含循環參照處理。 |
| 公式在 Web Worker 算 | [presets/packages/preset-sheets-core/src/worker.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/worker.ts)、[preset.ts#L107-L136](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/preset.ts#L107-L136) | 給 `workerURL` 時，主執行緒設 `notExecuteFormula: true`，公式改在 Worker 裡算（透過 `@univerjs/rpc`），大表不卡畫面。 |
| 剪貼簿（與 Excel 互通） | [sheets-ui/src/services/clipboard/clipboard.service.ts#L153](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/clipboard.service.ts#L153)、[utils.ts#L97-L118](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/utils.ts#L97-L118)、[html-to-usm/converter.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/html-to-usm/converter.ts) | 貼上時讀 HTML：偵測 Excel 標記（`urn:schemas-microsoft-com:office:excel`、`mso-` 樣式），解析 `mso-number-format` 還原數字格式、框線顏色；複製出去時包成 Excel 認得的 HTML。純文字貼上用 `\t` 分欄（[utils.ts#L293-L305](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/utils.ts#L293-L305)）。另有 Word、飛書（Lark）貼上外掛（`html-to-usm/paste-plugins/`）。 |
| 拖拉填滿 | [sheets/src/services/auto-fill/auto-fill.service.ts#L110](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/auto-fill.service.ts#L110)、[rules.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/rules.ts) | 規則化（數字序列、日期、文字+數字等）；公式、條件格式、資料驗證、超連結、儲存格圖片各自有 auto-fill controller 掛進來。 |
| 自訂函數 | [sheets-formula/src/facade/f-formula.ts#L52-L232](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/facade/f-formula.ts#L52-L232) | `univerAPI.getFormula().registerFunction('HELLO', (name)=>...)`；`registerAsyncFunction` 支援 `async`（可 fetch）。 |
| 存檔快照 | [sheets/src/facade/f-workbook.ts#L170-L185](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-workbook.ts#L170-L185) | `fWorkbook.save()` 回傳完整 `IWorkbookData`（含條件格式、資料驗證等外掛資料，放在 `resources`）。 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| **整套試算表（preset-sheets-core）** | [presets/packages/preset-sheets-core/src/preset.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/preset.ts) | React、RxJS、Univer 各套件 | 低（直接用 npm 套件） | 最推薦：不要拆原始碼，直接 `npm i @univerjs/presets @univerjs/preset-sheets-core`，在你的倉儲網頁開一個 `<div id="app">` 掛上去。 |
| **公式引擎（無 UI）** | [packages/engine-formula/src/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src) | `@univerjs/core`、`@univerjs/rpc`、decimal.js、interval-tree | 中 | 可在 Node.js／Cloud Functions headless 跑（README「Headless Mode」），做「後台批次算成本／報價」。但它吃 Univer 的資料模型，不能像 HyperFormula 那樣丟一個二維陣列就算，需要先建 Workbook。 |
| **單一函數實作**（如 `VLOOKUP`、財務函數） | [packages/engine-formula/src/functions/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions)（每個函數一個資料夾） | `BaseFunction`、ValueObject 體系 | 高 | 想抄演算法（例如 `financial/` 54 個財務函數、`statistical/` 109 個）可參考邏輯，但直接搬要連 value-object 一起搬，不建議。 |
| **數字格式化** | [packages/core/src/shared/numfmt/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/numfmt) | 無（vendored 的 borgar/numfmt 3.2.6，MIT） | 低 | 想在自己的表單／報表用 Excel 格式碼（`#,##0.00`、`yyyy/mm/dd`）顯示數字：直接用原專案 `numfmt` npm 套件即可。 |
| **Excel 剪貼簿 HTML 解析** | [sheets-ui/src/services/clipboard/html-to-usm/converter.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/html-to-usm/converter.ts)、[utils.ts#L97-L118](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/utils.ts#L97-L118) | DOM、Univer 樣式型別 | 中 | 想讓自己的倉儲表單「從 Excel 貼一大塊進來就自動拆成列」：抄 `htmlIsFromExcel` + `_parseTableByHtml` + `mso-number-format` 解碼邏輯。 |
| **自動填滿規則** | [sheets/src/services/auto-fill/rules.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/rules.ts) | core 型別 | 中 | 參考「A001→A002」「1,3→5,7」「日期遞增」的判斷規則。 |
| **捲動快取繪製技巧** | [engine-render/src/components/sheets/spreadsheet.ts#L518-L690](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L518-L690) | 整個 render 引擎 | 高 | 只適合「學作法」：自己用 Canvas 做大表格時，照這個「快取畫布平移 + 只畫差異區」思路。 |
| **資料驗證（下拉清單）邏輯** | [sheets-data-validation/src/validators/list-validator.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-data-validation/src/validators/list-validator.ts) | Univer 資料驗證框架 | 中 | 學規則格式；直接用 preset `@univerjs/preset-sheets-data-validation` 最省事。 |
| **活頁簿 JSON 格式** | [core/src/sheets/typedef.ts#L32-L342](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/typedef.ts#L32-L342) | 無 | 低 | 拿來當你自己資料庫的「試算表欄位」格式；其他工具（例如 SheetJS 讀出的資料）轉成這個格式就能塞進 Univer。 |

---

## 7. AI／Claude 整合

- **本 repo 內沒有任何 LLM 呼叫**：在 `packages/`、`presets/` 的 `.ts/.tsx` 原始碼中搜尋 `anthropic|openai|claude|mcp|llm`，命中的都是無關字串（選單、圖片儲存等檔名），沒有模型、沒有 prompt 檔、沒有 API Key 設定。→ 結論：**開源核心本身「無」AI**，但「可接」。
- **README 提到的 AI 周邊（都是「別的 repo」，本次未 clone 驗證 → 未確認）**：
  - `dream-num/univer-mcp`：用自然語言（MCP）操控 Univer Sheets。
  - `dream-num/univer-sdk-skills`：給 AI Agent 用的「Skills」說明集（整合、Pro 功能、外掛開發、Node 後端）。
  - `dream-num/univer-cli`：讓 agent 在本機建立／編輯／檢查 Office 內容的命令列工具。
  - `dream-num/univer-workspace`：可自架的工作區，agent 能生成「綁定儲存格的迷你 App／儀表板」。
  - 官方 AI SDK 文件 docs.univer.ai/ai（外部網站，未讀）。README 也說即時編輯、共享修訂、Worktree 流程需要對應的協作能力，「套件取得與授權依功能而異」——意思是部分 AI 協作功能可能要 Pro。
- **怎麼換成／接上 Claude（你可以自己做）：**
  1. **最簡單**：在你的網頁加一個「問 Claude」按鈕，把 `fWorkbook.save()` 的 JSON（或選取範圍 `getValues()`）送到你自己的 Firebase Cloud Function，Function 呼叫 Claude API，回傳「要寫入的值或公式」，再用 `range.setValues()` 寫回。
  2. **自訂公式**：用 `registerAsyncFunction('AI', async (prompt)=>...)` 做 `=AI("把這段商品描述改成 30 字廣告文案", A2)`；注意每格都會打一次 API，要做快取，費用會依 Claude 用量計。
  3. **Claude Code 直接寫腳本**：因為 Facade API 一致（瀏覽器與 Node.js 同一套），可請 Claude Code 寫 Node 腳本 headless 開活頁簿、算公式、輸出 JSON。
- `claude_support` 判定：**可接**。

---

## 8. 擴充方式與 API

1. **Facade API（推薦，給一般開發者）**
   - 建立：`univerAPI.createWorkbook(data)`（[sheets/src/facade/f-univer.ts#L93](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-univer.ts#L93)）、`getActiveWorkbook()`（L104）。
   - 讀寫：`FRange.getValue()`（[f-range.ts#L489-L512](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-range.ts#L489-L512)）、`getValues()`（L583）、`getCellData()`（L756）、`setValue()`（L1351，可給 `{ f: '=SUM(A1:A3)' }` 寫公式）、`setValues()`（L1631）。
   - 存檔：`fWorkbook.save()`（[f-workbook.ts#L182](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-workbook.ts#L182)）。
   - 事件：`univerAPI.addEvent(univerAPI.Event.SheetValueChanged, cb)`（[sheets/src/facade/f-event.ts#L345-L353](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-event.ts#L345-L353)、參數型別 L612 起 `effectedRanges`、`payload`）；另有 SheetCreated、ActiveSheetChanged、SheetNameChanged 等 Before/After 事件（L668-L744）。`addEvent` 定義在 [core/src/facade/f-univer.ts#L615](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/facade/f-univer.ts#L615)。
   - 低階監聽：`fWorkbook.onBeforeCommandExecute()`（可攔截）／`onCommandExecuted()`（[f-workbook.ts#L492-L530](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-workbook.ts#L492-L530)）；`univerAPI.executeCommand()`（[core/src/facade/f-univer.ts#L547](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/facade/f-univer.ts#L547)）。
   - 自訂函數：`registerFunction` / `registerAsyncFunction`（[sheets-formula/src/facade/f-formula.ts#L148](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/facade/f-formula.ts#L148)、L232、實作 L333-L370）。
   - 自訂選單：`univerAPI.createMenu()`、`registerComponent()`（[ui/src/facade/f-univer.ts#L170-L210](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/ui/src/facade/f-univer.ts#L170-L210)）。
2. **寫外掛（Plugin Mode）**：繼承 `Plugin`，註冊自己的 command／mutation／controller／UI 元件；README 推薦先看 `examples/` 與 docs 的 architecture guide。命名規則見 [docs/NAMING_CONVENTION.md](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/docs/NAMING_CONVENTION.md)，API 穩定性分級見 [docs/API_STABILITY.md](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/docs/API_STABILITY.md)。
3. **框架轉接**：React（原生）、Vue 3（`ui-adapter-vue3`）、Web Component（`ui-adapter-web-component`）——讓你在選單／側欄放自己的元件。
4. **Headless／Node.js**：同一套 Facade 在 Node 跑，適合 Cloud Functions 做批次運算（README「Headless Mode」；Node 用的 preset 在本 repo 的 `presets/packages` 沒看到 → 細節未確認）。

---

## 9. 程式品質與風險

- **維護狀況：非常活躍。** 掃描當天（2026-11-04）仍有 commit；版本 1.3.1；CHANGELOG 顯示 2026-08 才發 1.0.0-beta 系列，代表 1.x 是近期大改版。8 個 GitHub Actions（建置、品質檢查、semgrep 資安掃描、npm 發佈、同步 Gitee 鏡像、同步 Pro）。公司（DreamNum）全職維護。
- **測試：** 檔案清單中 `spec.ts/test.ts` 共 1,882 個，其中 engine-formula 569 個、core 174、sheets-ui 138、sheets 114、engine-render 109（`grep -E 'spec\.ts|test\.ts'` 依套件分組計算）。公式引擎測試特別多，另有 `tests/formula-integration/` 整合測試，codecov 有設定。
- **資安／隱私：**
  - **遙測：** `@univerjs/telemetry` 只定義 `ITelemetryService` 介面（[telemetry.service.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/telemetry/src/services/telemetry.service.ts)），在 sheets-ui 是 `@Optional` 注入（[sheet.render-controller.ts#L70](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts#L70)）——**開源版不會自己把資料送出去**，除非你自己實作。在 core / engine-render / sheets-ui / ui 原始碼搜尋 `fetch(`、`sendBeacon` 沒有找到對外呼叫。
  - 剪貼簿會解析外部 HTML；有 [SECURITY.md](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/SECURITY.md) 回報流程。
- **已知的坑：**
  1. **xlsx 匯入匯出不在開源版**——這是最大的坑。要自己接 SheetJS（Apache-2.0）或 ExcelJS（MIT）把 xlsx ↔ `IWorkbookData` 互轉，保真度（樣式、條件格式、合併）要自己處理。
  2. **重量級**：需要 React + ReactDOM + RxJS，CSS 也要一起載；整體 bundle 大小本次無法建置量測 → **未確認**（預期是數 MB 級，不適合極輕量頁面）。
  3. **所有 `@univerjs/*` 套件版本必須一致**（README 明講），升級時要一起升。
  4. **Slides 已移到 Pro**，若看到舊教學引用 `@univerjs/slides` 會裝不到功能。
  5. 預設新工作表只有 1,000 列 × 20 欄（[core/src/sheets/sheet-snapshot-utils.ts#L24-L27](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/sheet-snapshot-utils.ts#L24-L27)），要大表需自己設 `rowCount`；上限常數 `MAX_ROW_COUNT = 1048576`（與 Excel 相同，[max-row-column.ts#L37](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/max-row-column.ts#L37)）。
  6. 記憶體洩漏：官方特別寫了 [docs/FIX_MEMORY_LEAK.md](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/docs/FIX_MEMORY_LEAK.md)，在單頁應用切換頁面時記得 `univer.dispose()`。
  7. 1.x 剛從 beta 出來，API 仍可能變動；看 API_STABILITY 的 experimental 標記。

---

## 10. 跟其他專案組合的建議

- **Univer（介面＋公式）＋ SheetJS／ExcelJS（xlsx 讀寫）**：最實用的組合。上傳 xlsx → SheetJS 解析 → 轉 `IWorkbookData`（`cellData[row][col] = { v, f, s }`）→ `createWorkbook()`；匯出時反過來。請 Claude Code 寫轉換器時，把第 11 節的 JSON 範例和 [typedef.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/typedef.ts#L32-L342) 一起給它。
- **Univer ＋ 你的 Firebase 倉儲系統**：Firestore 存 `save()` 快照（或只存每個工作表），配合 `SheetValueChanged` 做防抖自動存檔；多人同時編輯時，開源版沒有合併機制，建議用「鎖定／最後寫入者勝」或只讓一人編輯。
- **Univer ＋ HyperFormula（若同類專案中有）**：HyperFormula 是純計算引擎、輸入二維陣列即可算，適合後端；Univer 公式引擎綁資料模型但函數多、與 UI 整合好。需要「純後端算價」時可比較兩者（注意 HyperFormula 是 GPL／商業雙授權，與 Univer 的 Apache-2.0 不同）。
- **Univer ＋ Claude API**：自訂 `=AI()` 非同步函數、或側欄「讓 Claude 幫我填這一欄」；廣告文案、商品標題批次生成很適合在試算表裡做。
- **對照 Luckysheet／FortuneSheet**：Univer 是 Luckysheet 原團隊（DreamNum）的新一代架構；若其他資料包裡有 Luckysheet，記得它已停止維護，新專案選 Univer。（此句的「同團隊」依據是 Univer 官方長期公開說法，本 repo 內未見明文 → 未確認。）

---

## 11. 網頁 Excel 能力檢查表

### 11.1 渲染方式、虛擬捲動、大量資料
- **渲染方式：有——Canvas 2D。** [engine-render/src/canvas.ts#L88](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/canvas.ts#L88) 用 `getContext('2d')`；檔案中找不到 WebGL。工具列、選單、對話框是 React DOM。
- **虛擬捲動：有。** 只計算可見列欄（[sheet.render-skeleton.ts#L1280-L1310](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/sheet.render-skeleton.ts#L1280-L1310)），捲動時用快取 canvas 平移只畫差異（[spreadsheet.ts#L518-L560](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L518-L560)）。資料用稀疏的 `ObjectMatrix`（[core/src/shared/object-matrix.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/object-matrix.ts)），空儲存格不佔空間。
- **10 萬列以上效能：未確認（未實測）。** 架構上支援（上限 1,048,576 列、虛擬渲染、公式可丟 Web Worker），但 repo 內沒有可直接引用的基準測試數據；初次載入大 JSON 與公式全量計算仍可能是瓶頸。README 也把「performance-enhanced formula features」列為 Pro。

### 11.2 公式引擎
- **函數數量：有，517 個已註冊（其中 511 個是一般函數、6 個是內部運算子）。**
  - **怎麼數：** 對 `packages/engine-formula/src/functions/*/function-map.ts` 每個檔，排除 `//` 開頭的註解行後，抓出不重複的 `FUNCTION_NAMES_<類別>.<名稱>`，共 517 個。分類：統計 109、數學 81、工程 57、財務 54、文字 48、相容性 38、查閱 37、日期 27、資訊 23、邏輯 21、資料庫 12、meta 6（`PLUS/MINUS/MULTIPLY/DIVIDED/COMPARE/CUBE`，是運算子用的內部函數，不算 Excel 函數）、陣列 2（`ARRAY_CONSTRAIN`、`FLATTEN`，Google 試算表函數）、web 2、cube 0。
  - 另外有 21 個 `extends NotImplementedFunction` 的空殼（CUBE* 7 個、`RTD`、`INFO`、`PHONETIC`、`WEBSERVICE`、`FORECAST.ETS` 系列等），在 function-map 中**全部被註解掉、沒有註冊**，所以不在 517 之內。
  - 總表入口：[functions/index.ts#L37-L56](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/index.ts#L37-L56)；例如 [math/function-map.ts#L42-L184](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/math/function-map.ts#L42-L184)。
  - 實際確認存在的常用／新函數：`VLOOKUP`、`XLOOKUP`、`XMATCH`、`SUMIFS`、`TEXTJOIN`、`UNIQUE`、`FILTER`、`SORT`、`SORTBY`、`SEQUENCE`、`LAMBDA`、`LET`、`MAP`、`REDUCE`、`SCAN`、`BYROW`、`BYCOL`、`MAKEARRAY`、`GROUPBY`、`PERCENTOF`、`REGEXEXTRACT/REGEXMATCH/REGEXREPLACE/REGEXTEST`。
- **解析器：有。** Lexer [lexer-tree-builder.ts#L99](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/lexer-tree-builder.ts#L99) → Parser [parser.ts#L48-L80](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/parser.ts#L48-L80) → Interpreter [interpreter.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/interpreter/interpreter.ts)。
- **依賴圖／重算：有。** [formula-dependency.ts#L97-L147](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L97-L147)；執行流程 [calculate-formula.service.ts#L265-L310](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/calculate-formula.service.ts#L265-L310)（含陣列公式 spill 二次計算、循環參照）。
- **陣列公式（動態陣列溢出）：有。** 見上方 `_getArrayFormulaDirtyRangeAndExcludedRange`；`NEW_EXCEL_FUNCTIONS` 清單含 dynamic array 函數（[new-excel-functions.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/new-excel-functions.ts)）。
- **跨工作表參照：有。** `serializeRangeWithSheet` 產生 `'工作表'!A1`、`serializeRangeWithSpreadsheet` 產生跨活頁簿參照（[engine/utils/reference.ts#L158-L172](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/utils/reference.ts#L158-L172)）；參照物件有 cell/row/column/range/multi-area/table（[reference-object/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/reference-object)）。
- **自訂函數：有（含非同步）。** [f-formula.ts#L52-L232](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/facade/f-formula.ts#L52-L232)；底層 [custom-function.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/custom-function.ts)（`CustomFunction`、`AsyncCustomFunction`）。

### 11.3 編輯操作
- **儲存格編輯：有。** sheets-ui 的 editor 服務（[sheets-ui/src/services/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services) 下 `editor/`、`editor-bridge.service.ts`），編輯器借用 docs 富文字引擎（儲存格可有富文字 `p` 欄位）。
- **複製貼上：有，可從 Excel 貼上；Google 試算表：大致可以（未實測）。** Excel：偵測 `urn:schemas-microsoft-com:office:excel` 等標記並解析 `mso-number-format`（[utils.ts#L97-L118](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/utils.ts#L97-L118)、[converter.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/html-to-usm/converter.ts)）。Google 試算表貼過來是 HTML `<table>`，走同一個通用 HTML 表格解析；Univer 複製出去時也包成 `<google-sheets-html-origin>` 格式（`usm-to-html/convertor.ts`），讓 Google 試算表認得。純文字以 Tab 分欄。設計說明見 [clipboard/README.md](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/README.md)。
- **拖拉填滿：有。** [auto-fill.service.ts#L110](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/auto-fill.service.ts#L110)、[rules.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/rules.ts)、指令 [auto-fill.command.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/commands/auto-fill.command.ts)；填完會跳出選單（複製／序列／只填格式）。
- **復原／重做：有。** [undoredo.service.ts#L180-L219](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/undoredo/undoredo.service.ts#L180-L219)。

### 11.4 格式
- **數字格式：有。** [sheets-numfmt/src/commands/commands/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-numfmt/src/commands/commands)（`set-numfmt`、`set-currency`、`set-percent`、增減小數位），格式引擎是內嵌的 numfmt（[core/src/shared/numfmt/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/numfmt)）。
- **條件格式：有。** [sheets-conditional-formatting/src/models/conditional-formatting-rule-model.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-conditional-formatting/src/models/conditional-formatting-rule-model.ts)（含圖示集 `icon-map.ts`、資料橫條、色階）。
- **合併儲存格：有。** [add-worksheet-merge.command.ts#L177](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/commands/add-worksheet-merge.command.ts#L177)；資料存在 `mergeData`。
- **凍結窗格：有。** [set-frozen.command.ts#L32](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/commands/set-frozen.command.ts#L32)；資料存在 `freeze`（`xSplit/ySplit/startRow/startColumn`）。
- **欄寬列高：有。** [set-worksheet-col-width.command.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/commands/set-worksheet-col-width.command.ts)、`set-worksheet-row-height.command.ts`；另有自動列高（`auto-height.service.ts`）。
- **篩選：有。** [sheets-filter/src/models/filter-model.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-filter/src/models/filter-model.ts)。
- **排序：有。** [sheets-sort/src/services/sheets-sort.service.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-sort/src/services/sheets-sort.service.ts)。
- **資料驗證（下拉選單）：有。** [list-validator.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-data-validation/src/validators/list-validator.ts)；另有多選清單、核取方塊、日期、整數、小數、文字長度、自訂公式驗證（[validators/](https://github.com/dream-num/univer/tree/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-data-validation/src/validators)）。
- 另外開源版也有：超連結、附註、留言串、尋找取代、Excel 式「表格」（sheets-table）、工作表／範圍保護（`add-range-protection.command.ts`）、格式刷、分欄（`split-text-to-columns.command.ts`）。

### 11.5 圖表、樞紐分析、圖片／附件
- **圖表：付費版才有。**（README Pro 表格明列 charts；開源 `packages/` 內沒有 chart 套件。）
- **樞紐分析：付費版才有。**（同上。）
- **走勢圖、大綱群組、形狀：付費版才有。**
- **圖片：有（開源）。** 插入浮動圖片 [insert-image.command.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/commands/commands/insert-image.command.ts)、儲存格圖片存檔 `save-cell-images.command.ts`、工作表背景圖、群組／翻轉。README 把「in-cell graphics」列為 Pro，與開源的儲存格圖片相關指令邊界不完全清楚 → 細節未確認。
- **附件（OLE）：有資料格式支援，轉換需 Pro。** [packages/drawing/docs/ole-attachments.md](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/drawing/docs/ole-attachments.md)：可在 JSON 中保存附件（上限 50 MiB），但 Office 轉換是「optional Pro conversion」。

### 11.6 匯入匯出
- **.xlsx 匯入／匯出：付費版才有。** README 寫明 import/export 屬 Pro；在所有 `package.json` 搜尋 `xlsx|exceljs|sheetjs|papaparse` 依賴，**一個都沒有**。
- **.csv：沒有（開源版無檔案匯入匯出）。** 只能「貼上」Tab 分隔文字，或自己用程式 parse 後 `setValues()`。
- **保真度：** 開源版不適用；Pro 版未確認。
- **自己補的做法：** SheetJS 讀檔 → 轉 `IWorkbookData`；或 CSV 用 Papa Parse → `range.setValues(二維陣列)`。

### 11.7 多人即時協作
- **付費版才有。** README：「Real-time collaboration」「Collaboration client/server packages」屬 Pro。
- 開源版的底子：所有變更都是可序列化的 Mutation（[command.service.ts#L37-L60](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L37-L60)），core 依賴 `ot-json1`（[core/package.json](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/package.json)）——也就是 **OT（操作轉換）** 路線；但衝突合併與伺服器在 Pro。若你要「多人同時編同一張表」又不想付費，只能自己用 `onCommandExecuted` 廣播 mutation 到 Firestore 再 `executeCommand` 套用，且需自己處理衝突 → 難度高。

### 11.8 資料模型與存進 Firestore
- **有，JSON。** 定義在 [core/src/sheets/typedef.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/typedef.ts)：`IWorkbookData`（L32-L97）、`IWorksheetData`（L123-L192）、`ICellData`（L290-L342）。儲存格欄位縮寫：`v` 值、`t` 型別（1 字串、2 數字、3 布林、4 強制字串）、`f` 公式、`si` 共用公式 ID、`s` 樣式（物件或樣式表 ID）、`p` 富文字、`custom` 自訂資料。
- **簡短範例：**
```json
{
  "id": "wb-inventory",
  "name": "庫存",
  "appVersion": "1.3.1",
  "locale": "zhTW",
  "styles": { "money": { "n": { "pattern": "#,##0" } } },
  "sheetOrder": ["s1"],
  "sheets": {
    "s1": {
      "id": "s1",
      "name": "庫存表",
      "rowCount": 1000,
      "columnCount": 20,
      "freeze": { "xSplit": 0, "ySplit": 1, "startRow": 1, "startColumn": 0 },
      "mergeData": [],
      "cellData": {
        "0": { "0": { "v": "品名" }, "1": { "v": "數量" }, "2": { "v": "單價" }, "3": { "v": "小計" } },
        "1": { "0": { "v": "紙箱 A" }, "1": { "v": 120, "t": 2 }, "2": { "v": 8, "t": 2, "s": "money" }, "3": { "f": "=B2*C2", "s": "money" } }
      },
      "rowData": { "0": { "h": 28 } },
      "columnData": { "0": { "w": 160 } }
    }
  }
}
```
  （`locale` 的值 `zhTW` 來自 [locale-type.ts#L25](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/types/enum/locale-type.ts#L25)；樣式 `n: { pattern }` 是數字格式欄位，見 [i-style-data.ts#L318-L320](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/types/interfaces/i-style-data.ts#L318-L320)。）
- **存進 Firestore 的建議：**
  1. 取資料：`const snap = univerAPI.getActiveWorkbook().save()`。
  2. Firestore 單一文件上限 1 MiB、巢狀 map 有深度限制；`cellData` 是 `列→欄→儲存格` 的巢狀物件，大表很容易超過。建議 `JSON.stringify(snap)` 存成字串欄位；超過 ~800 KB 就改存 Cloud Storage（Firestore 只放路徑與更新時間），或每個工作表一份文件。
  3. 自動存檔：`univerAPI.addEvent(univerAPI.Event.SheetValueChanged, debounce(save, 2000))`。
  4. 載入：從 Firestore 讀回 → `univerAPI.createWorkbook(JSON.parse(str))`。
  5. 若只想同步「庫存數量」這類結構化欄位：在事件中讀 `effectedRanges` 對應的列，轉成你的商品文件更新，而不是存整份快照。

### 11.9 手機／觸控、繁體中文介面
- **手機／觸控：有（獨立的 Mobile 外掛）。** [sheets-ui/src/mobile-plugin.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/mobile-plugin.ts)，另有 mobile 捲動、儲存格編輯、右鍵選單、欄寬拖拉 render controller（`controllers/render-controllers/mobile/`）。範例 [examples/src/sheets/mount.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/examples/src/sheets/mount.ts) 示範用 `UniverMobileUIPlugin`、`UniverSheetsMobileUIPlugin` 等替換桌面版外掛。實際手感未實測。
- **繁體中文介面：有。** `LocaleType.ZH_TW`（[locale-type.ts#L25-L74](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/types/enum/locale-type.ts#L25-L74)），sheets-ui 有 [locale/zh-TW.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/locale/zh-TW.ts)（398 行，與 en-US 396 行幾乎等量，用語如「字型」「填滿色彩」「底線」是台灣用法）；公式函數說明也有 zh-TW。另有 zh-HK。共 20 種語系。

### 11.10 嵌入方式（純 JavaScript 網頁）
- **能，但需要「打包工具」或 CDN 的 ESM。** 你的程式碼可以是純 JS（不用寫 React），但 Univer 內部會用到 React／ReactDOM／RxJS，它們會被一起打包進來。
- **建議做法（Vite，最穩）：** `npm i @univerjs/presets @univerjs/preset-sheets-core react react-dom rxjs`，然後：

```html
<!-- index.html -->
<div id="app" style="height: 100vh"></div>
<script type="module" src="/main.js"></script>
```
```js
// main.js（純 JavaScript）
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import zhTW from '@univerjs/preset-sheets-core/locales/zh-TW'
import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.ZH_TW,
  locales: { [LocaleType.ZH_TW]: mergeLocales(zhTW) },
  presets: [UniverSheetsCorePreset({ container: 'app' })],
})

const wb = univerAPI.createWorkbook({ name: '庫存' })
const ws = wb.getActiveSheet()
ws.getRange('A1:C1').setValues([['品名', '數量', '單價']])
ws.getRange('D2').setValue({ f: '=B2*C2' })

// 監聽變更 → 存到 Firestore（自行實作 saveToFirestore）
univerAPI.addEvent(univerAPI.Event.SheetValueChanged, () => {
  saveToFirestore(wb.save())
})
```
  這段是依 README「Preset Mode」範例改寫成繁中（README 用 `locales/en-US`；`locales/zh-TW` 這個子路徑由建置時產生，本次未安裝實測 → 未確認，若找不到就退回 en-US 或用 Plugin Mode 逐套件匯入 `@univerjs/sheets-ui/locale/zh-TW`，該檔確定存在）。
- **不用打包工具（`<script>` 直接引入）：未確認。** 個別套件建置時會輸出 UMD（`lib/umd/index.js`，全域名稱如 `UniverCore`、`UniverSheetsUi`、`UniverCoreFacade`，需先載 `React`、`ReactDOM`、`rxjs` 全域；見 [common/shared/tsdown/configs/umd.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/configs/umd.ts)、[tsdown/data/peer-deps.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/data/peer-deps.ts)），但本 commit 的 preset 只建置 ESM/CJS、不出 UMD（[common/shared/preset-build/index.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/preset-build/index.ts) 的 `moduleFormats: ['esm','cjs']`）。所以「不打包」要逐一用 `<script>` 引入十幾個 UMD 檔，順序要對，**不建議**；你目前已經在用 Firebase，加一個 Vite 打包步驟最省事。
- **套件大小：未確認**（未建置）。依賴清單看得出包含 React、Radix UI、RxJS、整個公式引擎（1,500+ 檔），預期比 jspreadsheet 之類輕量表格大很多。
- **Web Worker 公式（可選）：** `UniverSheetsCorePreset({ container:'app', workerURL: new Worker(...) })` + worker 檔用 `UniverSheetsCoreWorkerPreset()`（[worker.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/worker.ts)）。

### 11.11 API／事件
- **監聽變更：有。** `addEvent(Event.SheetValueChanged)`（[f-event.ts#L345-L353（參數型別在 L612）](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-event.ts#L345-L353)）、`onBeforeCommandExecute`（可攔截、可做權限檢查）、`onCommandExecuted`（[f-workbook.ts#L492-L530](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-workbook.ts#L492-L530)）。
- **程式讀寫儲存格：有。** `getRange('A1').getValue()`、`getValues()`、`getCellData()`、`setValue()`、`setValues()`（[f-range.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-range.ts#L489-L1631)）；公式寫法 `setValue({ f: '=SUM(A1:A9)' })`；公式算完的回呼 `formulaEngine.calculationEnd(cb)`（f-formula.ts 範例 L72-L75）。
- **其他：** `executeCommand()` 可呼叫任何內建指令；`createMenu()` 加自訂工具列按鈕。

---

## 關鍵字
Univer、univerjs、dream-num、DreamNum、網頁版 Excel、線上試算表、web spreadsheet、Excel-like、spreadsheet SDK、嵌入式試算表、Canvas 渲染、canvas rendering、虛擬捲動、公式引擎、formula engine、自訂函數、registerFunction、非同步函數、動態陣列、LAMBDA、XLOOKUP、條件格式、資料驗證、下拉選單、篩選、排序、凍結窗格、合併儲存格、複製貼上 Excel、拖拉填滿、復原重做、Facade API、univerAPI、IWorkbookData、headless、Node.js、Web Worker、Firebase、Firestore、繁體中文、zh-TW、手機版、Apache-2.0、Univer Pro、xlsx 匯入匯出（Pro）、即時協作（Pro）、樞紐分析（Pro）、圖表（Pro）、Luckysheet 後繼、倉儲庫存表、成本計算、報價單、比價表、MCP、AI Agent
