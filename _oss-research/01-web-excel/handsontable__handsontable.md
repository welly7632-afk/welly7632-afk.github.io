# handsontable/handsontable — 長得像 Excel、可直接嵌進純 JavaScript 網頁的商用級資料表格元件

> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：e5fe5bc
> GitHub：https://github.com/handsontable/handsontable｜⭐ 22075｜授權：自訂雙授權（非商業／評估免費＋商用需購買授權，非開源授權）｜主要語言：TypeScript｜最近更新：2026-11-04

本次掃描的程式碼版本：`develop` 分支 commit `e5fe5bcd895c1a38b1f585c486743d274d2625d1`（`handsontable/package.json` 版本號 18.1.2）。公式引擎在另一個 repo `handsontable/hyperformula`，一併掃描了 `master` 分支 commit `187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3`（版本 3.5.0）。下文以「H」代表 handsontable repo、「HF」代表 hyperformula repo。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Handsontable 是「看起來、操作起來像 Excel 的表格元件」，不是一套完整的 Excel 應用程式；它給你格子、編輯、複製貼上、排序篩選、凍結、合併、公式（透過 HyperFormula）、.xlsx 匯出入，你自己決定資料存哪裡。

對你（自建倉儲／庫存網頁、純 JavaScript、Firebase）最實際的用途：

1. **直接替換你倉儲系統裡的「表格頁」**：庫存清單、進貨單、出貨單、盤點表。它沒有外部執行期依賴（`handsontable/package.json` 的 `dependencies` 是空物件 `{}`），一支 CDN `<script>` 就能嵌進你現有的純 JS 頁面，不用改成 React。
2. **成本／報價計算表**：開啟 `formulas` 外掛後可以寫 `=B2*C2`、`=SUMIFS(...)`、`=VLOOKUP(...)`、`=XLOOKUP(...)`、`=ROUND(...)`；毛利、運費、廣告 ROAS 試算都能在網頁上像 Excel 一樣做。
3. **從 Excel／Google 試算表貼上**：同事或廠商給的報價單，選取後直接 Ctrl+V 貼進網頁表格（它會解析剪貼簿裡的 HTML `<table>` 或 TSV 純文字）。
4. **匯出 .xlsx／.csv 給會計或廠商**：`exportFile` 外掛。
5. **下拉選單、驗證**：倉位、供應商、商品分類用 `dropdown` 型別；數量用 `numeric` 驗證，填錯格子會標紅。
6. **伺服器端資料模式（DataProvider）**：分頁／排序／篩選交給後端，適合資料量大時接 Firestore 或你的 API。

不適合的地方：它**沒有圖表、沒有樞紐分析、沒有多人即時協作**；若你想做「像 Google 試算表那樣可多人共編、有圖表的完整試算表 App」，要搭配別的專案（見第 10 節）。另外授權有「不得開發與本軟體競爭之軟體」條款，若你的目標是「自己做一套網頁 Excel 產品」需特別注意（見第 2 節）。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

GitHub 顯示 `NOASSERTION`，因為它**不是 MIT／Apache 這類開源授權**，而是自訂的雙授權。原文在 [LICENSE.txt](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/LICENSE.txt)：

- **嚴格個人使用或純評估（非正式環境測試）**：適用 repo 根目錄的 `handsontable-non-commercial-license.pdf`（PDF 內文本次未展開閱讀，條款細節「未確認」）。程式裡對應的授權金鑰是字串 `'non-commercial-and-evaluation'`。
- **商業用途**（原文定義：意圖取得或導致商業利益、金錢報酬）：要另簽商業授權合約、購買金鑰。
- **所有情況都適用**：「不得以本軟體開發可被視為與本軟體競爭的軟體」。你未來要「A＋B＋C 拼出自己的網頁 Excel」，如果拿 Handsontable 的程式碼去改出另一個表格元件／試算表產品，就踩到這條。**拿它當你倉儲系統裡的一個表格畫面**比較沒問題；**拆它的原始碼去做自己的表格引擎**則不建議。

**你的情況（個人用、小生意）的白話判斷**：你是做生意的人，倉儲系統用在自己公司營運，嚴格說屬於「商業用途」，`non-commercial-and-evaluation` 金鑰只涵蓋「個人或評估」。現階段自己試用、評估可以；正式拿來跑公司庫存，依條文應購買商業授權。價格 repo 內沒有寫，「未確認」（程式碼裡的連結指向 handsontable.com/pricing）。

**程式裡金鑰怎麼判斷**（自己讀程式碼確認的）：

- [helpers/mixed.ts#L463-L466](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/helpers/mixed.ts#L463-L466)：金鑰（先 `trim()`）不分大小寫等於 `non-commercial-and-evaluation` 就是非商業狀態，只在 console 印 info，不擋畫面。
- [helpers/mixed.ts#L410](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/helpers/mixed.ts#L410)：`_BLOCKING_MODAL_STATES = ['trial_hard_stop', 'invalid', 'missing']`。**從 18.1 起，沒填金鑰或金鑰錯誤，表格會被一個關不掉的遮罩鎖住**（CHANGELOG 18.1.0 也寫明「made a missing or invalid license key block the grid with a modal that cannot be closed」）。所以 README 範例把 `licenseKey` 註解掉，照抄會被鎖，**一定要填**。
- [utils/licenseBranding/index.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/licenseBranding/index.ts)：鎖畫面／試用角標／「Powered by」橫條的掛載邏輯；非商業金鑰不顯示角標與橫條。
- [utils/entitlementLicenseKey/grants.ts#L3-L17](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/entitlementLicenseKey/grants.ts#L3-L17)：舊格式商業金鑰、非商業金鑰（以及缺漏／無效金鑰，但這兩種會被鎖畫面）一律是 `UNRESTRICTED_GRANTS`，**不限制功能**；只有新的「權益金鑰」才會只開列出的功能。

**有沒有付費版才有的功能？** 程式碼都在同一個 repo，沒有另外閉源的「Pro 套件」。但新版加入了「權益金鑰（entitlement key）」機制：每個外掛的 `feature.json` 都標了 `"licensing": "token"`（本次用 python 讀了 51 個 `plugins/*/feature.json`，49 個是 `token`、`touchScroll` 與 `multipleSelectionHandles` 是 `none`），商業金鑰可以只開某些功能（例如 `xlsx:import`、`xlsx:export`、`xlsx:styles`，見 [utils/xlsxEngine/features.json](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/xlsxEngine/features.json)）。**用 `non-commercial-and-evaluation` 時全部功能都開**；買商業授權時要確認你買的方案包含哪些 token。

**公式引擎 HyperFormula** 是另一個授權：[HF LICENSE.txt](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/LICENSE.txt) 為「GPLv3 或專有授權」雙授權。Handsontable 呼叫它時預設傳入 `licenseKey: 'internal-use-in-handsontable'`（[plugins/formulas/engine/settings.ts#L3-L6](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/formulas/engine/settings.ts#L3-L6)），HF 端在 [licenseKeyValidator.ts#L230](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/helpers/licenseKeyValidator.ts#L230) 承認這個金鑰。也就是在 Handsontable 裡用公式不用另買 HF 金鑰；但如果你**單獨**用 HF（不透過 Handsontable），就要選 `gpl-v3`（你的整個程式要 GPL 開源）或買授權。

公式列 UI（`formulaBuilder` 外掛）依賴 npm 套件 `hyperformula-ui`（devDependencies 寫 `0.3.6`），其授權「未確認」。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容 |
|---|---|
| 語言 | TypeScript（`handsontable/src` 下非測試 `.ts` 共 1,146 個，用 `git ls-tree` 檔案清單計算） |
| 前端 | 純瀏覽器元件，DOM 渲染（不是 Canvas）；另有 React／Angular／Vue 3 包裝層 |
| 後端 | **不需要**。沒有伺服器程式；資料存哪裡由你決定 |
| 資料庫 | 無內建；你自己接 Firestore／REST API（用 `afterChange` hook 或 `dataProvider` 外掛） |
| 執行期依賴 | `handsontable` 本體 `dependencies: {}`；公式要 `hyperformula`（HF 依賴 `chevrotain`、`tiny-emitter`）；.xlsx 可用內建引擎或注入 `exceljs` |
| 建置工具 | rspack、babel、swc（只有你要自己從原始碼建置才需要；一般直接用 npm 或 CDN 成品） |
| 部署 | 靜態檔即可，Firebase Hosting 完全可行 |
| 硬體／GPU | 不需要 GPU；一般電腦瀏覽器即可 |
| API Key | 不需要任何雲端 API Key；只需要 Handsontable 自己的 `licenseKey` 字串（離線檢查，不連網） |
| 費用 | 個人／評估：0 元；商用：需購買授權，價格 repo 內未寫，「未確認」 |
| 遙測 | 在 `handsontable/src`（排除測試）grep `fetch(`、`XMLHttpRequest`、`sendBeacon`、`WebSocket` 都沒有命中，**未發現連網回報**；金鑰檢查是純本地運算 |

`handsontable.full.min.js`（CDN 用）會把 HyperFormula 一起打包並掛到 `window.HyperFormula`（[.config/development.js#L22-L40](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/.config/development.js#L22-L40)），所以純 JS 頁面一支 script 就有公式。

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

Repo 全部 9,969 個檔案（`git ls-tree -r` 計），歷史含 docs、範例、測試，所以有 946 MB。真正元件程式碼只在 `handsontable/src`。

```
handsontable/                      monorepo 根目錄
├─ LICENSE.txt                     自訂雙授權（見第 2 節）
├─ handsontable-non-commercial-license.pdf
├─ CHANGELOG.md / .changelogs/     已發佈版本記錄／尚未發佈的變更（405 個 json）
├─ handsontable/                   ★ 主套件 npm "handsontable"
│  ├─ package.json                 v18.1.2，dependencies 為空
│  ├─ .config/                     rspack 建置設定（full 版打包 HyperFormula）
│  └─ src/
│     ├─ core.ts                   ★ 10,827 行，Handsontable 主建構子與所有公開 API
│     ├─ tableView.ts              把設定轉給 Walkontable 渲染器
│     ├─ 3rdparty/walkontable/     ★ 自家 DOM 虛擬捲動渲染引擎（viewport、overlay 凍結區、render）
│     ├─ 3rdparty/SheetClip/       TSV（Excel 純文字剪貼簿）解析與輸出
│     ├─ dataMap/                  資料來源（陣列或物件陣列）＋ metaManager（儲存格屬性）
│     ├─ core/hooks/constants.ts   ★ 287 個事件（hook）名稱清單
│     ├─ selection/                選取範圍邏輯
│     ├─ editors/                  16 種編輯器（text、numeric、dropdown、date、intl-datetime…）
│     ├─ renderers/                對應的格子渲染器
│     ├─ validators/               驗證器（numeric、dropdown、regExp、maxLength…）
│     ├─ cellTypes/                14 種儲存格型別＝編輯器＋渲染器＋驗證器的組合
│     ├─ plugins/                  ★ 51 個功能外掛（排序、篩選、公式、匯出入、合併、凍結…）
│     ├─ i18n/languages/           22 種語言，含 zh-TW.ts
│     ├─ themes/                   main／horizon／classic 主題，支援暗色、密度
│     ├─ utils/xlsxEngine/         ★ 內建 .xlsx 讀寫引擎（自寫 zip、XML，約 5,900 行）
│     ├─ utils/parseTable.ts       ★ 剪貼簿 HTML 表格 ↔ 格子資料
│     ├─ utils/licenseBranding/    授權鎖畫面、試用角標
│     └─ helpers/mixed.ts          授權金鑰檢查（凍結的舊邏輯＋新權益金鑰）
├─ wrappers/
│  ├─ react-wrapper/               @handsontable/react-wrapper（HotTable、HotColumn）
│  ├─ angular-wrapper/             @handsontable/angular-wrapper
│  └─ vue3/                        @handsontable/vue3
├─ docs/                           文件網站原始碼（3,586 檔）
├─ examples/                       各框架範例
├─ performance-tests/              效能測試情境（含 10 萬列 × 100 欄）
├─ visual-tests/、tests/           視覺回歸／整合測試
└─ .claude/、.ai/、AGENTS.md、CLAUDE.md、.mcp.json   開發團隊自己給 AI 助手用的設定
```

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 主物件與公開 API | [core.ts#L443](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L443) | `Core()` 建構子；`setDataAtCell`（[#L4168](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L4168)）、`loadData`（[#L5503](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L5503)）、`updateSettings`（[#L5821](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L5821)）、`getDataAtCell`（[#L7601](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L7601)）、`getSourceData`（[#L7756](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L7756)）、`batch`（[#L5133](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L5133)） |
| 渲染（虛擬捲動） | [tableView.ts#L2388](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/tableView.ts#L2388)、[walkontable/src/calculator/viewportRows.ts#L32](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/3rdparty/walkontable/src/calculator/viewportRows.ts#L32)、[walkontable/src/render/tableRenderer.ts#L71](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/3rdparty/walkontable/src/render/tableRenderer.ts#L71) | 真正的 `<table>` DOM，只渲染可見列欄＋緩衝；凍結區用 overlay 疊多份表格 |
| 資料模型 | [dataMap/dataMap.ts#L59](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/dataMap/dataMap.ts#L59) | 支援二維陣列或物件陣列，`columns[].data` 對應物件屬性 |
| 事件系統 | [core/hooks/constants.ts#L126](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core/hooks/constants.ts#L126) | `REGISTERED_HOOKS` 共 287 個（我用 grep 數陣列內 `'名稱',` 行）；如 `afterChange`（[#L197](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core/hooks/constants.ts#L197)）、`beforePaste`、`afterPaste` |
| 公式 | [plugins/formulas/formulas.ts#L404](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/formulas/formulas.ts#L404)、[engine/register.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/formulas/engine/register.ts) | 5,815 行的橋接層：把格子變動同步給 HyperFormula、把計算結果回寫顯示；處理排序／移動列時的參照重寫、復原 |
| 複製貼上 | [plugins/copyPaste/copyPaste.ts#L1074](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/copyPaste/copyPaste.ts#L1074)、[#L1201-L1208](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/copyPaste/copyPaste.ts#L1201-L1208)、[utils/parseTable.ts#L525](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/parseTable.ts#L525)、[SheetClip.ts#L54](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/3rdparty/SheetClip/SheetClip.ts#L54) | 剪貼簿有 `<table>` 就走 `text/html` → `htmlToGridSettings()`（可帶出合併儲存格），否則 `text/plain` 用 SheetClip 解析 TSV（處理引號與換行） |
| 拖拉填滿 | [plugins/autofill/autofill.ts#L64](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/autofill/autofill.ts#L64)、[#L493-L531](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/autofill/autofill.ts#L493-L531) | 依拖曳方向重複選取區資料；未看到「1,2,3 自動遞增」的數列推算，可在 `beforeAutofill` hook 自己改 |
| 復原／重做 | [plugins/undoRedo/undoRedo.ts#L148](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/undoRedo/undoRedo.ts#L148) | 動作物件堆疊，每種操作有 `undo`/`redo`；`loadData` 等 `auto` 來源不記錄 |
| 合併儲存格 | [plugins/mergeCells/mergeCells.ts#L240](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/mergeCells/mergeCells.ts#L240) | 3,979 行，處理合併後的選取、捲動、篩選後保持合併 |
| 篩選 | [plugins/filters/filters.ts#L264](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/filters/filters.ts#L264)、`plugins/filters/condition/` | 條件：等於、包含、介於、開頭／結尾、日期、依值勾選、空白等 |
| 排序 | [plugins/columnSorting/columnSorting.ts#L190](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/columnSorting/columnSorting.ts#L190)、[multiColumnSorting.ts#L74](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/multiColumnSorting/multiColumnSorting.ts#L74) | 只改「視覺索引」不動原始資料，所以存檔時拿到的仍是原順序 |
| .xlsx 匯入 | [plugins/importFile/importFile.ts#L1120](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/importFile/importFile.ts#L1120)、`importFromBlob`（[#L1422](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/importFile/importFile.ts#L1422)）、[mapper.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/importFile/mapper.ts) | 讀活頁簿 → 值、型別推斷、數字格式、下拉、合併、凍結、欄寬、公式、條件格式描述、註解 |
| .xlsx／.csv 匯出 | [plugins/exportFile/exportFile.ts#L434](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/exportFile/exportFile.ts#L434)、`downloadFile`（[#L675](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/exportFile/exportFile.ts#L675)）、[types/xlsx.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/exportFile/types/xlsx.ts)、[types/csv.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/exportFile/types/csv.ts) | CSV 同步產生字串；XLSX 2,313 行，可寫公式、樣式、條件格式、資料驗證 |
| 內建 xlsx 引擎 | [utils/xlsxEngine/capabilities.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/xlsxEngine/capabilities.ts)、`utils/xlsxEngine/adapters/native/`（zip、xml 子資料夾）、[adapters/exceljs.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/xlsxEngine/adapters/exceljs.ts) | 自寫 zip（用瀏覽器 `CompressionStream`）與 XML tokenizer；也可改用注入的 ExcelJS |
| 多工作表分頁 | [plugins/sheetsBar/sheetsBar.ts#L587](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/sheetsBar/sheetsBar.ts#L587) | 底部工作表分頁列，每頁可有自己的 data／settings |
| 伺服器端資料 | [plugins/dataProvider/dataProvider.ts#L299](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/dataProvider/dataProvider.ts#L299) | 你提供 `rowId`、`fetchRows`、`onRowsCreate`、`onRowsUpdate`、`onRowsRemove` 五個回呼；失敗自動還原 |
| 公式列＋公式編輯器 | [plugins/formulaBuilder/formulaBuilder.ts#L325](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/formulaBuilder/formulaBuilder.ts#L325) | 公式列、彩色參照、點選格子帶入參照、函數自動完成（需 `hyperformula-ui`） |
| 繁中介面 | [i18n/languages/zh-TW.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/i18n/languages/zh-TW.ts) | 例如 `復原`、`確認` |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

> 提醒：授權禁止「開發與本軟體競爭的軟體」，下表的「拆出」建議以**當作套件整包引用、只用它的 API**為主；若要複製原始碼進你自己的表格引擎，請先確認授權。真正授權寬鬆、可以放心拆的是 HyperFormula 的 GPLv3 部分（但 GPL 會傳染）。

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整個表格元件（當黑盒子用） | [handsontable/src/index.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/index.ts) | 無 | 低 | CDN `handsontable.full.min.js` 或 `npm i handsontable`，`new Handsontable(el, settings)` |
| 按需註冊模組 | [handsontable/src/registry.ts#L27](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/registry.ts#L27) | 無 | 低 | 用 `handsontable/base` ＋只註冊需要的外掛，縮小打包體積 |
| TSV 剪貼簿解析 SheetClip | [3rdparty/SheetClip/SheetClip.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/3rdparty/SheetClip/SheetClip.ts) | 無 | 低（195 行） | `parse(str)` 把 Excel 複製的純文字變二維陣列、`stringify(arr)` 反向；檔頭有獨立出處，授權請先確認 |
| Excel HTML 剪貼簿解析 | [utils/parseTable.ts#L525](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/parseTable.ts#L525) | 需 sanitizer、HotInstance 型別 | 中 | 參考它如何從 `<table>` 讀出 rowspan／colspan 變成合併資訊 |
| 欄型別自動推斷 | `importFile.inferColumnTypes()`（[importFile.ts#L1347](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/importFile/importFile.ts#L1347)）、`utils/columnTypeInference/` | 無引擎也能跑 | 中 | 匯入 CSV／貼上資料時自動判斷「數字／日期／勾選／下拉」欄，適合廠商報價單 |
| 內建 xlsx 讀寫引擎 | `utils/xlsxEngine/`（[capabilities.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/xlsxEngine/capabilities.ts)） | 瀏覽器 `CompressionStream` | 高 | 與授權 token 檢查綁在一起；若想要獨立的 xlsx 函式庫，改用 MIT 的 ExcelJS 或 SheetJS 社群版較乾淨 |
| DataProvider 伺服器資料協定 | [dataProvider.ts#L299](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/dataProvider/dataProvider.ts#L299) | 核心 | 低（用設定） | 五個回呼對到 Firestore 的 query／add／update／delete；參考它的「樂觀更新＋失敗還原」設計 |
| 公式引擎 HyperFormula | [HF src/HyperFormula.ts](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts) | chevrotain、tiny-emitter | 低（獨立套件） | 無介面公式計算核心，可在 Node／Cloud Functions 跑報價計算；`gpl-v3` 或買授權 |
| 繁中翻譯 | [i18n/languages/zh-TW.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/i18n/languages/zh-TW.ts) | 常數表 | 低 | 右鍵選單、篩選等字串，可參考用詞 |
| 主題系統 | `handsontable/src/themes/` | 無 | 中 | `colorScheme`、`density` 設定暗色／緊湊 |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **產品本身沒有任何 AI 功能**：在 `handsontable/src` grep `openai`、`anthropic`、`llm`、`claude`（排除 AGENTS.md／CLAUDE.md 說明檔）沒有命中。沒有 prompt、沒有模型呼叫。
- **開發團隊自己用 Claude Code 開發**：repo 有 `CLAUDE.md`、`AGENTS.md`、`.claude/agents/`（2 個子代理：reviewer、test-writer）、`.claude/skills/`（約 30 個 SKILL.md，例如 plugin-dev、celltype-dev、renderer-dev、walkontable-dev）、`.ai/`（STACK、STRUCTURE、TESTING 等說明）、`evals/`（評估 AI 寫測試品質的案例）、`context7.json`。這些是**給維護者的 AI 開發流程**，不是給終端使用者的功能。
- **`.mcp.json`**：設定了 ClickUp、GitHub、filesystem、code-review-graph 四個 MCP 伺服器（用 `npx`／`pipx` 啟動）。**風險提醒**：如果你把這個 repo clone 下來用 Claude Code 打開，可能會被詢問是否啟用這些 MCP 伺服器，請拒絕，它們是對方公司內部流程用的。
- **跟 Claude 接的方式（建議）**：Handsontable 是純資料元件，很容易接 Claude：
  1. 用 `hot.getData()`／`getSourceData()` 取出表格 → 送 Claude API 請它「檢查價格異常」「依供應商分類」「產生商品描述欄位」→ 用 `hot.setDataAtCell([[row, col, value], ...])` 批次寫回。
  2. 自訂右鍵選單（`contextMenu` 外掛）加一個「AI 填寫此欄」項目。
  3. 這些都要你自己的後端（例如 Firebase Cloud Functions）代呼 Claude API，避免 API Key 外洩到瀏覽器。
- **Claude 支援程度：可接**（無原生，但 API 乾淨、事件完整，非常好接）。

---

## 8. 擴充方式與 API

- **設定物件**：所有功能都是 `new Handsontable(el, { ... })` 的選項，執行中用 `hot.updateSettings({...})` 修改。選項完整定義在 [dataMap/metaManager/metaSchema.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/dataMap/metaManager/metaSchema.ts)（例如 `licenseKey` 在 [#L5058](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/dataMap/metaManager/metaSchema.ts#L5058)、`formulas` 在 [#L4289](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/dataMap/metaManager/metaSchema.ts#L4289)、`sanitizer` 在 [#L9659](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/dataMap/metaManager/metaSchema.ts#L9659)）。設定有三層：整張表、`columns`（每欄）、`cells`／`cell`（每格）。
- **Hook（事件）**：287 個，`before*` 可回傳 `false` 取消動作，`after*` 用來同步存檔。用 `hot.addHook('afterChange', fn)`（[core.ts#L10339](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L10339)）或直接寫在設定裡。
- **自訂儲存格型別**：自己寫 `renderer(hot, TD, row, col, prop, value, cellProperties)`、`editor`（繼承 `BaseEditor`）、`validator(value, callback)`，再用 `registerCellType` 註冊。條件格式就是靠自訂 renderer 或 `cells()` 回傳 `className`。
- **自訂外掛**：繼承 `BasePlugin`（[plugins/base](https://github.com/handsontable/handsontable/tree/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/base)），實作 `isEnabled`、`enablePlugin`、`disablePlugin`，`registerPlugin` 後就能用設定開關。
- **外掛實例**：`hot.getPlugin('exportFile')`、`hot.getPlugin('filters')` 等取得程式化控制。
- **自訂公式函數**：在 HyperFormula 層做，`HyperFormula.registerFunctionPlugin(plugin, translations)`（[HF HyperFormula.ts#L493](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L493)），例如寫一個 `=SHIPPING(重量,地區)` 運費函數。
- **框架包裝**：React `@handsontable/react-wrapper`（`HotTable`、`HotColumn`，peer 需 React 18+）、Angular、Vue 3，版本皆為 18.1.2。

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

**維護狀況**：非常活躍。2011 年建立，2026-11-04 仍有推送；CHANGELOG 顯示 18.1.2（2026-10-07）、18.1.1（2026-09-15）、18.1.0（2026-09-01）、18.0.0（2026-06-30），約每 1–2 個月一版；`.changelogs/` 有 405 個未發佈變更 json。有專職公司（Handsoncode，波蘭）維護。

**測試**：檔名符合 `*.spec.*`／`*.unit.*`／`*.test.*` 的檔案共 2,639 個（以檔案清單 grep 計）；有 Jasmine E2E、Jest 單元測試、Playwright 視覺測試、`performance-tests/` 效能回歸（19 個情境）、`.github/workflows/` 30 個以上 CI 流程（含 a11y、效能、型別檢查）。品質屬於商用元件等級。

**資安／隱私**：
- `html` 儲存格型別**刻意輸出原始 HTML**（[renderers/htmlRenderer/htmlRenderer.ts#L16-L23](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/renderers/htmlRenderer/htmlRenderer.ts#L16-L23)），若資料來自外部（廠商、客戶輸入）會有 XSS 風險；其他標題／內容的 HTML 寫入會走 `sanitizer` 選項，沒設時會「寫入原始 HTML 並警告一次」（[utils/sanitizer.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/sanitizer.ts)）。**建議設定 `sanitizer`（例如接 DOMPurify）**。
- 未發現遙測或連網（見第 3 節）。金鑰檢查完全本地。

**已知的坑**：
1. **沒填 `licenseKey` 會被鎖畫面**（18.1 起），範例常常把它註解掉。
2. **授權**：個人／評估免費，商業要付費；且有「不得開發競爭軟體」條款。
3. **`.xlsx` 匯入（`importFile`）、內建 xlsx 引擎、`sheetsBar` 多工作表、`formulaBuilder` 公式列、`freezeBar` 拖曳凍結線**都只在 `develop` 分支的 `.changelogs/` 裡（例如 13172、13409、13551、13634），**不在已發佈的 CHANGELOG 18.1.2 內**。也就是截至掃描日，npm 上的正式版**可能還沒有**這些功能（以 npm 實際版本為準，「未確認」）。已發佈的是 17.1.0 起的「XLSX 匯出（需注入 ExcelJS）」。
4. **公式效能**：大量公式時重算在主執行緒，10 萬列以上含公式的實際速度「未確認」。
5. **公式與排序**：排序只改視覺順序，HyperFormula 會依它自己的順序改寫參照；`formulas.ts` 花了大量程式碼處理這件事，自訂外掛若直接改資料要小心。
6. **自動填滿不會自動遞增數列**（依程式碼閱讀判斷）。
7. Repo 很大（946 MB，含文件與影像），研究時請用 sparse checkout。

---

## 10. 跟其他專案組合的建議

（同資料夾已有 `handsontable__hyperformula.md`、`dream-num__univer.md`、`dream-num__Luckysheet.md`、`odoo__o-spreadsheet.md`、`glideapps__glide-data-grid.md`、`nocodb__nocodb.md`、`apitable__apitable.md` 等資料包可對照。）

- **方案 A｜最快上線的倉儲表格**：Handsontable（表格 UI）＋ Firestore（存資料）＋ 你現有的倉儲 JS。用 `afterChange` 寫回 Firestore，或用 `dataProvider` 做大量資料分頁。適合「庫存清單、進出貨明細、報價計算」。
- **方案 B｜要完整「試算表 App」（多工作表、圖表、樞紐、多人協作）**：改看 Univer（Apache-2.0、Canvas 渲染、有協作伺服器）或 o-spreadsheet；Handsontable 不提供圖表／樞紐／協作。
- **方案 C｜後端算價格**：把 HyperFormula 放在 Cloud Functions 當「價格計算引擎」，前端 Handsontable 顯示；同一份公式前後端一致（注意 HF 單獨用時是 GPLv3／商業授權）。
- **方案 D｜完全開源、可商用的替代**：若授權是最大顧慮，可評估 Glide Data Grid（MIT，Canvas）＋ HyperFormula（GPL）或 Univer（Apache-2.0）的組合。
- **與 AI 短影音／腳本工具組合**：用 Handsontable 做「商品清單 → 每列一支影片」的批次工作表：欄位放商品名、賣點、價格，右鍵「送 Claude 生成腳本」把結果寫回同一列的「腳本」欄，再丟給影片生成工具。

---

## 11. 網頁 Excel 能力檢查表

**渲染方式（Canvas／DOM／WebGL）**：**DOM**。Walkontable 用真正的 `<table>`／`<td>` 渲染，見 [walkontable/src/render/tableRenderer.ts#L71](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/3rdparty/walkontable/src/render/tableRenderer.ts#L71)、[render/cells.ts#L30](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/3rdparty/walkontable/src/render/cells.ts#L30)。好處是容易用 CSS 客製、可存取性好；壞處是極大量格子時比 Canvas 吃資源。

**虛擬捲動**：**有**。只渲染可見區＋緩衝（`viewportRowRenderingOffset`），[walkontable/src/calculator/viewportRows.ts#L32](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/3rdparty/walkontable/src/calculator/viewportRows.ts#L32)、[viewport/viewport.ts#L69](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/3rdparty/walkontable/src/viewport/viewport.ts#L69)；可用 `renderAllRows: true` 關閉（[metaSchema.ts#L6832](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/dataMap/metaManager/metaSchema.ts#L6832)）。

**10 萬列以上效能**：**有官方測試情境，實際數字未確認**。`performance-tests/scenarios/` 的 `initial-load`、`filtering`、`sorting` 都是「100000 rows x 100 cols」（讀 `scenario.config.mjs` 第一行註解確認），`filtering` 的註解提到篩選在約 50–100 ms、300 MB heap 的區間內量測。18.1.0 CHANGELOG 有一大串大資料效能改善（捲出畫面的列釋放 meta、單次渲染、排序比較快取）。本次未執行測試。

**公式引擎 — 函數數量**：**有（透過 HyperFormula）**。我的數法：寫 python 腳本掃 HF 的 `src/interpreter/plugin/**/*.ts`，抓每個 `implementedFunctions` 物件最外層的鍵，加上 `aliases` 物件的鍵：得到 **367 個實作名稱（分布在 49 個外掛檔）＋ 53 個別名 ＝ 420 個函數名**；其中 14 個是 `HF.ADD` 等內部運算子函數，扣掉後 **約 406 個一般使用的函數**，另有 `OFFSET` 在解析階段處理（[FunctionRegistry.ts#L44](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/FunctionRegistry.ts#L44)）。交叉驗證：HF 的 `i18n/languages/enGB.ts` 函數翻譯也正好 420 筆。README 寫「400 built-in formulas」相符。抽查：`SUM`、`SUMIFS`、`VLOOKUP`、`XLOOKUP`、`INDEX`、`MATCH`、`FILTER`、`SORT`、`UNIQUE`、`IFS`、`SWITCH`、`TEXTJOIN`、`NPV`、`PMT`、`IRR`、`SEQUENCE`、`HYPERLINK` **有**；`LET`、`LAMBDA`、`CONCAT`、`INDIRECT`、`QUERY`、`TEXTSPLIT`、`REGEXMATCH`、`IMPORTRANGE` **沒有**。HF 語言包 19 種，**沒有中文函數名**（英文函數名即可，不影響使用）。

**解析器與依賴圖／重算位置**：**有**。解析器 [HF src/parser/FormulaParser.ts#L123](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/parser/FormulaParser.ts#L123)（以 chevrotain 為基礎）→ 依賴圖 [HF src/DependencyGraph/DependencyGraph.ts](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/DependencyGraph/DependencyGraph.ts) → 拓撲排序 [TopSort.ts#L21](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/DependencyGraph/TopSort.ts#L21) → 增量重算 `Evaluator.partialRun()`（[Evaluator.ts#L44](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Evaluator.ts#L44)）。

**陣列公式**：**有**。`ARRAYFORMULA`（[HF ArrayPlugin.ts#L16-L18](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/plugin/ArrayPlugin.ts#L16-L18)），Handsontable 預設 `useArrayArithmetic: true`（[engine/settings.ts#L12](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/formulas/engine/settings.ts#L12)），`FILTER`／`SORT`／`UNIQUE` 可溢出（spill），formulas.ts 有處理 spill 儲存格（[#L4260](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/formulas/formulas.ts#L4260)）。

**跨工作表參照**：**有**。多個 Handsontable 實例共用同一個 HF 引擎，各自設 `formulas.sheetName`，即可寫 `='庫存'!B2`；引擎共用登錄在 [engine/register.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/formulas/engine/register.ts)。`sheetsBar`（develop 分支）提供分頁 UI。

**自訂函數**：**有**。`HyperFormula.registerFunctionPlugin`（[HF HyperFormula.ts#L493](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L493)）。

**儲存格編輯**：**有**。16 個編輯器資料夾（`editors/`），含文字、數字、下拉、自動完成、勾選、日期、時間、`intl-datetime`、多選、密碼；支援 IME（中文輸入法）。

**複製貼上（能否直接從 Excel／Google 試算表貼上）**：**有**。剪貼簿有 HTML 表格就解析 HTML（保留合併），否則解析 TSV；[copyPaste.ts#L1201-L1208](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/copyPaste/copyPaste.ts#L1201-L1208)、[parseTable.ts#L525](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/parseTable.ts#L525)。CHANGELOG 有修過「從 Excel 貼單格」的 bug，代表有實際對 Excel 測試；Google 試算表貼上的保真度「未確認」（同樣走 HTML／TSV 路徑）。

**拖拉填滿**：**有**（複製模式）。[autofill.ts#L493-L531](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/autofill/autofill.ts#L493-L531)；未看到自動遞增數列。

**復原／重做**：**有**。[undoRedo.ts#L148](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/undoRedo/undoRedo.ts#L148)，涵蓋編輯、插刪列欄、排序、合併、移動等。

**數字格式**：**有**。`numeric` 型別用瀏覽器 `Intl.NumberFormat`（`numericFormat: { style: 'currency', currency: 'TWD' }`），舊的 numbro 格式已移除（[renderers/numericRenderer/numericRenderer.ts#L53](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/renderers/numericRenderer/numericRenderer.ts#L53) 的遷移提示）。日期時間有 `intl-date`／`intl-time`／`intl-datetime`。

**條件格式**：**格子上沒有內建 UI 外掛，用程式做**。沒有 `conditionalFormatting` 外掛（plugins 清單中沒有）；README 的「Conditional formatting」指的是用自訂 renderer／`cells()` 依值加 class。匯出 xlsx 時可帶 `conditionalFormatting` 規則（[exportFile.ts#L232](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/exportFile/exportFile.ts#L232)），匯入時會把 Excel 的條件格式**轉成描述資料回傳但不自動上色**（[importFile/mapper.ts#L2470-L2484](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/importFile/mapper.ts#L2470-L2484)）。

**合併儲存格**：**有**。[mergeCells.ts#L240](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/mergeCells/mergeCells.ts#L240)。

**凍結窗格**：**有**。設定 `fixedRowsTop`、`fixedColumnsStart`、`fixedRowsBottom`；右鍵凍結欄 [manualColumnFreeze.ts#L70](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/manualColumnFreeze/manualColumnFreeze.ts#L70)；拖曳凍結線 `freezeBar`（develop 分支）[freezeBar.ts#L101](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/freezeBar/freezeBar.ts#L101)。

**欄寬列高**：**有**。`manualColumnResize`（[#L42](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/manualColumnResize/manualColumnResize.ts#L42)）、`manualRowResize`、`autoColumnSize`、`autoRowSize`。

**篩選**：**有**。[filters.ts#L264](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/filters/filters.ts#L264)，配合 `dropdownMenu` 出現 Excel 式欄位選單。

**排序**：**有**。單欄 [columnSorting.ts#L190](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/columnSorting/columnSorting.ts#L190)、多欄 `multiColumnSorting`。

**資料驗證（下拉選單）**：**有**。`dropdown` 型別 [cellTypes/dropdownType/dropdownType.ts#L6-L7](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/cellTypes/dropdownType/dropdownType.ts#L6-L7)＋[dropdownValidator.ts#L16](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/validators/dropdownValidator/dropdownValidator.ts#L16)；另有 `multiSelect`、`regExpValidator`、`maxLength`。

**圖表**：**沒有**。plugins 清單無 chart；core.ts 只留「`ganttChart` 自 8.0 起不支援」的錯誤訊息。xlsx 匯入遇到圖表工作表會略過並回報 `chartSheets`。要圖表請自行接 Chart.js／ECharts 讀 `getData()`。

**樞紐分析**：**沒有**。只有 `columnSummary`（欄位加總／平均等摘要列，[columnSummary.ts#L150](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/columnSummary/columnSummary.ts#L150)）和 `nestedRows`（巢狀列群組）。

**圖片／附件**：**沒有內建型別**。可用 `html` 型別或自訂 renderer 放 `<img>`（注意 XSS）；xlsx 匯入時圖片列入 `dropped`（[capabilities.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/xlsxEngine/capabilities.ts) 的 `DROPPED_FEATURES.images`）。

**匯入匯出 .xlsx／.csv**：
- **CSV 匯出**：**有**，已發佈版即有（[types/csv.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/exportFile/types/csv.ts)）。
- **XLSX 匯出**：**有**。已發佈版（17.1.0 起）需注入 ExcelJS（MIT）；develop 分支新增內建引擎，不必 ExcelJS（[types/xlsx.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/plugins/exportFile/types/xlsx.ts)）。
- **XLSX 匯入**：**develop 分支才有**（`importFile`，尚未出現在已發佈 CHANGELOG）。
- **CSV 匯入**：**沒有現成的「讀 CSV 檔」**；要自己用 Papa Parse 之類解析後 `loadData()`，再可用 `inferColumnTypes()` 自動判斷欄型別。
- **保真度**：寫得相當細。[xlsxEngine/features.json](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/xlsxEngine/features.json) 列出支援：公式（含動態陣列、定義名稱）、欄寬列高／隱藏／合併／凍結／RTL、數字格式、註解、樣式（字型、填色、框線、對齊）、條件格式（cellIs、expression、containsText、top10、aboveAverage、timePeriod）、資料驗證下拉、工作表保護。**會掉的東西**明列在 [capabilities.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/utils/xlsxEngine/capabilities.ts) 的 `DROPPED_FEATURES`：自動篩選、超連結、圖片、Rich Text、Excel 表格（Tables）、圖表工作表、巨集、樞紐等，並在匯入結果的 `dropped` 告訴你。

**多人即時協作（OT／CRDT／鎖定）**：**沒有**。grep `collaborat`、`yjs`、`crdt`、`websocket` 只命中與協作無關的程式註解。要多人同時編輯需自行用 Firestore `onSnapshot` 監聽＋`setDataAtCell(..., 'remote')` 套用，衝突處理自己做（最後寫入者勝）。

**資料模型（JSON 長相）**：二維陣列或物件陣列，儲存格屬性（型別、唯讀、class）另存在 meta。範例：

```js
// 物件陣列（建議，方便存 Firestore）
data: [
  { sku: 'A001', name: '紙箱 S', cost: 12.5, qty: 300, location: 'A-01' },
  { sku: 'A002', name: '紙箱 M', cost: 18,   qty: 120, location: 'A-02' },
],
columns: [
  { data: 'sku', title: '料號', readOnly: true },
  { data: 'name', title: '品名' },
  { data: 'cost', title: '成本', type: 'numeric', numericFormat: { style: 'currency', currency: 'TWD' } },
  { data: 'qty', title: '數量', type: 'numeric' },
  { data: 'location', title: '倉位', type: 'dropdown', source: ['A-01', 'A-02', 'B-01'] },
]
```

**怎麼存進 Firestore**：（1）每列一個文件、文件 ID 用 `sku`；`afterChange(changes, source)` 裡 `changes` 是 `[[row, prop, oldValue, newValue], ...]`，用 `hot.getSourceDataAtRow(row)` 取整列，`batch` 寫回 Firestore；排除 `source === 'loadData'`。（2）資料量大時用 `dataProvider` 外掛：`fetchRows` 對到 Firestore query（含分頁、排序、篩選參數），`onRowsUpdate`／`onRowsCreate`／`onRowsRemove` 對到 update／add／delete。（3）公式欄：存公式字串（`'=C2*D2'`）即可，`getSourceData` 拿到的是公式原文，`getData` 拿到計算值。

**手機／觸控**：**有**。`touchScroll`、`multipleSelectionHandles`（觸控選取把手）兩個外掛不需授權 token；18.1.0 有調整 iPad「雙擊開編輯器」。實機體驗「未確認」，大型表格在手機上仍屬勉強可用。

**繁體中文介面**：**有**。[i18n/languages/zh-TW.ts](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/i18n/languages/zh-TW.ts)，設定 `language: 'zh-TW'`。我比對單行 `[C.xxx]` 鍵：en-US 160 個、zh-TW 154 個，缺 6 個（勾選框的已勾／未勾讀屏文字、3 個「連同欄標題複製」選單、「無項目」），缺的會顯示英文。

**嵌入方式（純 JavaScript）**：**可以，不需要 React／Vue**。最小可用範例（CDN、含公式、繁中、存檔掛鉤）：

```html
<div id="grid"></div>
<!-- 版本請固定；full 版內含 HyperFormula（掛在 window.HyperFormula） -->
<script src="https://cdn.jsdelivr.net/npm/handsontable@18.1.2/dist/handsontable.full.min.js"></script>
<!-- 繁中語系：依 .config/languages-production.js 推得輸出為 dist/languages/zh-TW.min.js，實際路徑請以 npm 套件內容為準（未確認） -->
<script src="https://cdn.jsdelivr.net/npm/handsontable@18.1.2/dist/languages/zh-TW.min.js"></script>
<script>
  const hot = new Handsontable(document.getElementById('grid'), {
    data: [
      ['品名', '單價', '數量', '小計'],
      ['紙箱 S', 12.5, 300, '=B2*C2'],
      ['膠帶', 35, 20, '=B3*C3'],
      ['合計', '', '', '=SUM(D2:D3)'],
    ],
    rowHeaders: true,
    colHeaders: true,
    contextMenu: true,
    formulas: { engine: HyperFormula },
    language: 'zh-TW',
    height: 'auto',
    licenseKey: 'non-commercial-and-evaluation', // 一定要填，否則 18.1 起會被鎖畫面
    afterChange(changes, source) {
      if (!changes || source === 'loadData') return;
      console.log('要存檔的變更', changes); // 這裡改成寫入 Firestore
    },
  });
</script>
```

**套件大小**：**未確認**（本次不執行建置，repo 內也沒有現成 dist 檔）。從結構看：`handsontable/src` 有 1,146 個 `.ts`，core.ts 一支就上萬行，加上 HyperFormula，full 版是「大型」套件；npm 用法可用 `handsontable/base` ＋ `registry.ts` 的按需註冊（[registry.ts#L27](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/registry.ts#L27)）縮小體積。

**API／事件（監聽變更、程式讀寫儲存格）**：**有，非常完整**。287 個 hook（[hooks/constants.ts#L126](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core/hooks/constants.ts#L126)）；讀寫：`getDataAtCell`、`setDataAtCell`、`getData`、`getSourceData`、`loadData`、`updateData`、`alter`（插刪列欄，[core.ts#L7226](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L7226)）、`setCellMeta`／`getCellMeta`（[#L8422](https://github.com/handsontable/handsontable/blob/e5fe5bcd895c1a38b1f585c486743d274d2625d1/handsontable/src/core.ts#L8422)）、`batch`（多次修改只渲染一次）。

---

## 關鍵字

Handsontable、HyperFormula、網頁版 Excel、網頁試算表、資料表格、data grid、spreadsheet component、JavaScript 表格元件、純 JavaScript、虛擬捲動、virtual scrolling、DOM 渲染、Walkontable、公式引擎、formula engine、XLOOKUP、SUMIFS、陣列公式、跨工作表參照、複製貼上 Excel、copy paste、拖拉填滿、autofill、復原重做、undo redo、合併儲存格、merge cells、凍結窗格、freeze panes、篩選、排序、filters、column sorting、下拉選單、dropdown、資料驗證、validator、xlsx 匯出、xlsx 匯入、export to Excel、CSV、ExcelJS、DataProvider、伺服器端資料、Firestore、Firebase、afterChange、hooks、繁體中文、zh-TW、React、Vue、Angular、non-commercial-and-evaluation、授權金鑰、license key、商業授權、GPLv3、庫存管理、倉儲、報價、成本計算、ERP
