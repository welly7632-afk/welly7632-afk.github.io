# ag-grid/ag-grid — 業界最常見的 JavaScript 資料表格元件（社群版 MIT 免費，真正「像 Excel」的功能大多在付費企業版）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：dd8bb29
> GitHub：https://github.com/ag-grid/ag-grid｜⭐ 15672｜授權：雙授權（社群版 MIT／企業版 Commercial EULA；GitHub 因此顯示 NOASSERTION）｜主要語言：TypeScript｜最近更新：2026-11-04

本次掃描的套件版本：`ag-grid-community` / `ag-grid-enterprise` 皆為 **36.3.0**（來自兩個 `package.json`）。以下所有 permalink 都指向 commit `dd8bb2912dbafa34f130167bb5154eb50de71298`。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** AG Grid 是一個「資料表格（Data Grid）」元件，不是完整的試算表軟體；它擅長把幾千到幾十萬筆資料漂亮、快速地顯示、排序、篩選、編輯，純 JavaScript 就能用。

對你（台灣小老闆、自己用 Claude 寫倉儲／庫存網頁、Firebase 託管、投廣告）來說，具體可以拿來做：

1. **把現有倉儲系統的「列表頁」升級成 Excel 般的表格**：商品清單、庫存、進出貨紀錄，直接在格子裡改數量／成本，改完用 `onCellValueChanged` 事件寫回 Firestore。這部分 **社群版（免費、MIT）就做得到**。
2. **價格查詢／比價／成本試算表**：用社群版的 `valueGetter`（每列自動算「成本 × 數量」「毛利率」）就能做出「計算欄」，不必買企業版的公式功能。條件格式（低庫存變紅、毛利為負變紅）用社群版 `cellClassRules`。
3. **廣告成效報表**：把各平台廣告花費、點擊、轉換匯進來做排序／篩選／匯出 CSV（社群版）；若要「樞紐分析」「分組小計」「內建圖表」「匯出真正的 .xlsx」，則是企業版。
4. **給 Claude Code 當「表格層」**：AG Grid 官方有 MCP 伺服器與 AI Skills（文件裡寫明支援 Claude Code），叫 Claude 寫 AG Grid 程式碼時準確度較高；企業版還有 `getStructuredSchema()` 讓你做「用自然語言叫 AI 幫我篩選／排序表格」。

**不適合的地方：** 如果你要的是「像 Google 試算表那樣，每格都能打 `=SUM(A1:A10)`、有多個工作表、能直接開 .xlsx 檔」——AG Grid 的公式、範圍選取、拖拉填滿、複製貼上、Excel 匯出全部在**企業版**，而且公式只有約 18 個函數、沒有跨工作表、沒有 .xlsx 匯入。這種需求比較該看 Univer / Luckysheet / Handsontable + HyperFormula（同資料夾有另外的資料包）。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

這個 repo 是「同一個倉庫、兩種授權」，根目錄的 [LICENSE.txt](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/LICENSE.txt) 寫得很清楚：

| 套件 | 授權 | 白話 |
|---|---|---|
| `ag-grid-community`、`ag-grid-react`、`ag-grid-angular`、`ag-grid-vue3`、`@ag-grid-community/locale`、`@ag-grid-community/styles`、內部共用的 `ag-stack` | **MIT** | 個人、公司、商用、改程式碼、閉源再散布都可以，只要保留版權聲明。完全免費。見 [packages/ag-grid-community/LICENSE.txt](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/LICENSE.txt) |
| `ag-grid-enterprise` | **Commercial EULA（商業授權，第 40 版，2026-09-09 更新）** | 原始碼公開看得到，但**不是開源授權**。正式上線（production）要買授權；依開發者人數＋部署方式計價。見 [packages/ag-grid-enterprise/LICENSE.html](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/LICENSE.html) |

**重點細節（我實際讀過的條文與程式碼）：**

- 官方文件 [community-vs-enterprise/index.mdoc](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/documentation/ag-grid-docs/src/content/docs/community-vs-enterprise/index.mdoc) 原文：Community「Free for everyone, including production use」；Enterprise「Requires a licence to use in production. Free to test locally」。授權為「per-developer, per-deployment」、永久授權含一年更新與支援。實際價格這份 repo 裡沒有寫（指向官網 pricing 頁）→ **價格未確認**。
- EULA 第 13 條「Trial Licence」：試用授權只能做「internal evaluation and review」，期限 30 天試用＋30 天議約，且軟體可能加浮水印（[LICENSE.html#L257-L272](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/LICENSE.html#L257-L272)）。
- **沒有授權金鑰時企業版會怎樣**（[licenseManager.ts#L182-L215](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/license/shared/licenseManager.ts#L182-L215)、[#L403-L418](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/license/shared/licenseManager.ts#L403-L418)、[watermark.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/license/watermark.ts)）：所有企業功能**照樣能用**；主控台印出「License Key Not Found / All features are unlocked for trial」；在非 `localhost`／`127.0.0.1` 的網址會顯示「For Trial Use Only」浮水印（約 5 秒後淡出隱藏）。也就是說**技術上不會鎖功能，但授權上不能拿來正式用**。
- 金鑰驗證是純前端 MD5 比對，**不會連網回報**（我在 community／enterprise／ag-stack 的 src 裡 grep `fetch(`、`XMLHttpRequest`、`sendBeacon`、`WebSocket`，非測試檔皆 0 筆）。

**給你的白話建議：**
- 個人自用、只用社群版：完全沒問題，MIT。
- 你的倉儲系統掛在 Firebase 公開網址＝算「production」。若在上面用企業版功能（公式、範圍選取、Excel 匯出、樞紐…）而沒買授權，即使只有你自己用，嚴格說也不符合 EULA（文件只允許「在本機測試」）。要嘛只用社群版，要嘛買授權，要嘛把這些功能換成別的開源方案（例如公式改用 HyperFormula、匯出改用 SheetJS／ExcelJS）。
- 不要去改授權驗證或拿掉浮水印——那是明確違約。

**付費版才有的功能（以程式碼為準）：** [validation/enterpriseModuleNames.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/validation/enterpriseModuleNames.ts) 列出 41 個企業模組名稱（我用 `grep -c ': 1,'` 數的，含 `AllEnterprise` 與舊名 `GridCharts`、`Menu`、`RangeSelection` 這類別名）。對試算表最關鍵的幾個：`Formula`（公式）、`CellSelection`／`RangeSelection`（範圍選取＋拖拉填滿）、`Clipboard`（複製貼上）、`ExcelExport`、`PdfExport`、`Pivot`、`RowGrouping`、`IntegratedCharts`、`Sparklines`、`RichSelect`、`SetFilter`、`Notes`（儲存格註解）、`Find`、`BatchEdit`、`CalculatedColumns`、`AiToolkit`、`ContextMenu`、`StatusBar`、`RowNumbers`、`ServerSideRowModel`。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

- **前端：** TypeScript 寫成，打包後是純瀏覽器 JavaScript 函式庫，**零外部執行依賴**（`ag-grid-community` 只依賴自家的 `ag-stack` 與型別套件 `ag-charts-types`；企業版只依賴 community＋ag-stack，圖表才選配 `ag-charts-community/enterprise` 14.3.0）。框架包裝：React、Angular、Vue 3；**純 JavaScript 直接用 `createGrid()`**（[grid.ts#L77-L80](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/grid.ts#L77-L80)）。
- **後端：** 不需要。它只是一個前端元件；資料從哪來（Firestore、REST、CSV）你自己決定。大量資料可用「Infinite Row Model」（社群）或「Server-Side Row Model」（企業）分頁向伺服器拉。
- **資料庫：** 無內建。
- **部署：** 用 CDN `<script>` 或 npm 安裝後打包，丟到 Firebase Hosting 就好。
- **硬體／GPU：** 不需要，一般瀏覽器即可（DOM 渲染）。
- **API Key：** 社群版不用。企業版要授權金鑰（`LicenseManager.setLicenseKey(...)`），費用未確認（repo 內無價格）。AI Toolkit 的範例用的是你自己的 LLM API（範例是 ChatGPT），換 Claude 就是 Anthropic API 的費用。
- **開發工具鏈（只是讀到，沒有執行）：** Nx monorepo、esbuild、Vitest、Playwright、Yarn。你自己使用時完全不需要這些。

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

整個 repo 約 13,277 個檔案（`git ls-tree -r` 計數），其中 8,233 個在 `documentation/ag-grid-docs`（官網文件與範例）。真正的程式核心在 `packages/`：

```
ag-grid/  (default branch: latest)
├── LICENSE.txt                         ← 說明哪些套件 MIT、哪些 Commercial
├── packages/
│   ├── ag-grid-community/src/          ← MIT 核心（641 個 .ts 非測試檔，約 11.9 萬行）
│   │   ├── grid.ts                     ← createGrid() 進入點
│   │   ├── allCommunityModule.ts       ← 社群版全部模組清單（44 個依賴模組）
│   │   ├── rendering/rowRenderer.ts    ← 列虛擬化：算出要畫第幾列到第幾列
│   │   ├── rendering/rowContainerHeightService.ts ← 超過瀏覽器 div 最大高度時的「拉伸」技巧
│   │   ├── columns/columnViewportService.ts       ← 欄虛擬化
│   │   ├── rendering/spanning/         ← 列合併（spanRows，類似合併儲存格）
│   │   ├── edit/                       ← 儲存格編輯器（文字、數字、日期、勾選、下拉、長文字）
│   │   ├── undoRedo/                   ← 編輯的復原／重做
│   │   ├── filter/  sort/              ← 篩選、排序
│   │   ├── csvExport/  export/         ← CSV 匯出與共用序列化框架
│   │   ├── styling/                    ← cellClassRules（條件格式）、rowClassRules
│   │   ├── clientSideRowModel/         ← 全部資料在瀏覽器時的資料模型
│   │   ├── infiniteRowModel/           ← 捲動時分段向後端拿資料
│   │   ├── misc/state/                 ← getState()/setState()：欄寬、排序、篩選等狀態存取
│   │   ├── valueService/cellApi.ts     ← api.getCellValue()
│   │   ├── entities/colDef.ts, gridOptions.ts ← 所有設定項的型別定義（最好的「說明書」）
│   │   ├── validation/                 ← 開發時的設定檢查；enterpriseModuleNames.ts 列出付費模組
│   │   └── theming/                    ← JS 主題 API（Quartz、Alpine、Balham、Material）
│   ├── ag-grid-enterprise/src/         ← Commercial（586 個 .ts 非測試檔，約 11.9 萬行）
│   │   ├── formula/                    ← 公式引擎（解析器、求值、函數、公式編輯器）
│   │   ├── rangeSelection/             ← 範圍選取、拖拉填滿 agFillHandle.ts
│   │   ├── clipboard/                  ← 複製／貼上（含 Excel HTML 剪貼簿對齊）
│   │   ├── excelExport/                ← 自寫 .xlsx 產生器（OOXML + 自製 zip，不用 SheetJS）
│   │   ├── pdfExport/                  ← PDF 匯出
│   │   ├── pivot/ rowGrouping/ aggregation/ ← 樞紐、分組、彙總
│   │   ├── charts/ sparkline/          ← 內建圖表、迷你走勢圖
│   │   ├── calculatedColumns/          ← 使用者執行時新增「計算欄」
│   │   ├── notes/ find/ batch-edit/    ← 儲存格註解、搜尋、批次編輯
│   │   ├── aiToolkit/                  ← 產生給 LLM 的 JSON Schema
│   │   ├── license/                    ← 授權驗證與浮水印
│   │   └── allEnterpriseModule.ts      ← 企業版全部模組清單
│   ├── ag-stack/                       ← MIT，內部共用 DOM／工具函式
│   ├── ag-grid-react / -angular / -vue3 ← 框架包裝
├── community-modules/locale/src/       ← 47 個語系檔（含 zh-TW.ts 繁體中文）
├── community-modules/styles/           ← CSS 主題
├── documentation/ag-grid-docs/         ← 官網文件原始檔（mdoc）＋大量範例
└── testing/                            ← 行為測試（behavioural 679 個 .test.ts）、e2e、模組大小量測
```

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**(1) 模組化註冊（決定你用到哪些功能、包多大）**
- [allCommunityModule.ts#L50-L99](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/allCommunityModule.ts#L50-L99)、[allEnterpriseModule.ts#L42-L79](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/allEnterpriseModule.ts#L42-L79)
- 每個功能是一個 `Module` 物件（`beans` 服務、`apiFunctions`、`dependsOn`）。用 `ModuleRegistry.registerModules([...])` 只註冊需要的，打包時可 tree-shake。CDN 的 UMD 版會自動註冊 `AllCommunityModule`（[main-umd-styles.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/main-umd-styles.ts)）。

**(2) 列虛擬化（大量資料不卡的關鍵）**
- [rowRenderer.ts#L1397-L1490](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/rendering/rowRenderer.ts#L1397-L1490) `workOutFirstAndLastRowsToRender()`：依捲動位置算出可見的第一列／最後一列，再加上 `rowBuffer`（預設緩衝）；單次最多渲染 `max(rowBuffer, 500)` 列的保護（L1471-L1476）。可用 `suppressRowVirtualisation` 關掉。
- [rowContainerHeightService.ts#L7-L60](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/rendering/rowContainerHeightService.ts#L7-L60)：瀏覽器 div 有最大高度上限，資料總高度超過時啟用「stretching」，按捲動比例偏移每列的 top，因此百萬列也能捲。
- [columnViewportService.ts#L130-L160](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/columns/columnViewportService.ts#L130-L160)：欄虛擬化，只畫可見欄（`suppressColumnVirtualisation` 可關）。

**(3) 公式引擎（企業版）**
- 模組：[formulaModule.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/formulaModule.ts)（依賴 `RowNumbersModule`，提供 `agFormulaCellEditor` 與 `api.refreshFormulas()`）。
- 解析器：[ast/parsers.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/ast/parsers.ts)（786 行，手寫 tokenizer＋運算子優先序，`parseFormula` 在 L622）；長格式參照 `REF(COLUMN(id),ROW(id))` 的折疊在 [#L739-L760](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/ast/parsers.ts#L739-L760)。序列化回 A1 寫法在 [ast/serializer.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/ast/serializer.ts)。
- 求值：[formulaService.ts#L839-L935](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/formulaService.ts#L839-L935) `resolveValue()`——**沒有預先建好的全域依賴圖**，而是「拉式（pull）」求值：要某格的值時，用顯式堆疊（非遞迴）走訪它依賴的格子，先算完依賴再算自己，結果快取在 `Map<RowNode, Map<AgColumn, CellFormula>>`；用 visiting/visited 標記偵測循環參照（`#CIRCREF!`）。資料變動時用 `valueCacheVersion` 整批失效再重畫（`bumpValueCacheAndRefresh`）。
- 自訂函數：[formulaService.ts#L418-L436](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/formulaService.ts#L418-L436) 讀 `gridOptions.formulaFuncs`，名稱轉大寫後加入函數表。
- 公式存哪：預設存在 row data 的欄位值裡（字串 `=...`）；也可設 `formulaDataSource`（[formulaDataService.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/formulaDataService.ts)）讓公式存到另一個儲存區（例如另一個 Firestore collection）。

**(4) 範圍選取＋拖拉填滿（企業版）**
- [rangeSelection/rangeService.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/rangeSelection/rangeService.ts)（1,741 行）管理多個 CellRange。
- [agFillHandle.ts#L636-L679](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/rangeSelection/agFillHandle.ts#L636-L679)：全是數字時用最小平方法線性回歸推下一個值（[utils.ts#L1](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/rangeSelection/utils.ts#L1) `findLineByLeastSquares`）；有文字或按 Alt 則循環複製；公式會依拖拉方向平移相對參照（`updateFormulaByOffset`）。

**(5) 複製貼上（企業版）**
- [clipboardService.ts#L290-L345](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/clipboard/clipboardService.ts#L290-L345)：同時讀 `text/plain` 與 `text/html`（`navigator.clipboard.read({ unsanitized: ['text/html'] })` 或 paste 事件）。
- [#L369-L420](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/clipboard/clipboardService.ts#L369-L420) `processClipboardData()`：預設以 Tab 切欄（正是 Excel／Google 試算表複製出來的格式），並用 HTML 表格對齊來去掉 Excel 多帶的最後空行；`processDataFromClipboard` 回呼可讓你自己清洗資料。
- 社群版只有鍵盤事件掛勾點（[rowContainerEventsFeature.ts#L296-L340](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/gridBodyComp/rowContainer/rowContainerEventsFeature.ts#L296-L340)），沒有 `clipboardSvc` 就不處理 Ctrl+C/V。

**(6) Excel 匯出（企業版）**
- [excelSerializingSession.ts#L520-L545](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/excelExport/excelSerializingSession.ts#L520-L545)：公式欄會以 `f` 型別寫出「公式本身」讓 Excel 重算（不是只寫結果）。同檔還有圖片（L130-L150）、合併（`mergeAcross`）、凍結列／欄（L191-L320）。
- [files/ooxml/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/excelExport/files/ooxml)：自己產生 workbook、worksheet、sharedStrings、styles、drawing、comments、table、mergeCell 等 XML；[zipContainer/zipContainer.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/excelExport/zipContainer/zipContainer.ts) 自製 zip（含 CRC 表與壓縮）。**沒有用 SheetJS／ExcelJS**。

**(7) 編輯、復原／重做（社群版）**
- [edit/editModule.ts#L62-L72](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/edit/editModule.ts#L62-L72) `UndoRedoEditModule`；[undoRedoService.ts#L35-L52](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/undoRedo/undoRedoService.ts#L35-L52)：`undoRedoCellEditing: true` 開啟，監聽 `cellValueChanged` 推進堆疊，`undoRedoCellEditingLimit` 控制步數。
- 編輯器在 [edit/cellEditors/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/edit/cellEditors)（text、number、date、dateString、checkbox、select、largeText）。

**(8) 條件格式（社群版）**：[styling/cellStyleService.ts#L14-L30](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/styling/cellStyleService.ts#L14-L30) 套用 `colDef.cellClassRules`。

**(9) AI Toolkit（企業版）**：[aiToolkit/structuredSchema.ts#L28-L57](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/aiToolkit/structuredSchema.ts#L28-L57)：把目前欄位、篩選、排序、樞紐、分組、欄寬、顯示欄位轉成 JSON Schema，丟給 LLM 當 structured output 格式。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

> 注意：企業版目錄下的程式碼是 Commercial EULA，**不能**拆出來放進你自己的程式（即使個人用也屬改作授權軟體）；下表把它們列出來是讓你「參考設計思路」，標示為「僅參考」。真正能拿來拆的是 MIT 的 community／ag-stack。

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整個社群版表格（直接當元件用，不拆） | [packages/ag-grid-community/src](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src) | 無（CDN 一支 js） | 低 | 當你倉儲系統的表格 UI 層；資料從 Firestore 讀成 `rowData`，`onCellValueChanged` 寫回 |
| 列虛擬化演算法 | [rowRenderer.ts#L1397-L1490](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/rendering/rowRenderer.ts#L1397-L1490) | 綁 grid 內部 bean（rowModel、scroll） | 中 | 若你用別的表格（例如自己寫）要做虛擬捲動，把「scrollTop → first/last row + buffer」這段邏輯改寫成獨立函式 |
| 超高容器拉伸 | [rowContainerHeightService.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/rendering/rowContainerHeightService.ts) | `_getMaxDivHeight`（ag-stack） | 低 | 141 行，概念獨立，可移植到任何 DOM 虛擬捲動 |
| CSV 匯出 | [csvExport/csvSerializingSession.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/csvExport/csvSerializingSession.ts) | `export/` 序列化框架 | 中 | 直接用 `api.exportDataAsCsv()` 最省事；拆出來不划算 |
| 復原／重做堆疊 | [undoRedo/undoRedoStack.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/undoRedo/undoRedoStack.ts) | 幾乎無 | 低 | 59 行的有上限堆疊，可抄去任何編輯器 |
| 繁中語系字串 | [community-modules/locale/src/zh-TW.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/community-modules/locale/src/zh-TW.ts) | 無 | 低 | 847 個 key，MIT。可當別的表格元件繁中翻譯的對照表 |
| Grid 狀態存取 | [misc/state/stateApi.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/misc/state/stateApi.ts) | GridStateModule | 低（用 API） | `api.getState()` 存成 JSON 進 Firestore，下次開啟 `initialState` 還原欄寬／排序／篩選 |
| 公式引擎（僅參考，Commercial） | [formula/formulaService.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/formulaService.ts) | grid 內部 | 高＋授權不允許 | 想要公式請改用 MIT 的 HyperFormula 或 Univer 公式引擎，再透過社群版 `valueGetter` 接上 |
| 填滿序列推算（僅參考） | [rangeSelection/utils.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/rangeSelection/utils.ts) | 無 | 低（但授權不允許照抄） | 「最小平方法推下一個值」是公開數學，可請 Claude 自己重寫 |
| AI Schema 產生器（僅參考） | [aiToolkit/schemaBuilder.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/aiToolkit/schemaBuilder.ts) | 無 | 中 | 概念：把表格欄位轉 JSON Schema → 給 Claude tool_use → 回傳 filterModel/sort → `api.setFilterModel()`。社群版 API 就能自己實作這套 |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **函式庫本身不呼叫任何 AI**：src 裡沒有任何網路請求（見第 2 節 grep 結果）。
- **AI Toolkit（企業版模組 `AiToolkit`）**：只提供 `api.getStructuredSchema()`（[structuredSchema.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/aiToolkit/structuredSchema.ts)），支援 7 個面向：aggregation、filter、sort、pivot、columnVisibility、columnSizing、rowGroup。官方範例 [chatgptApi.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/documentation/ag-grid-docs/src/content/docs/ai-toolkit/_examples/natural-language-grid-state/chatgptApi.ts) 把 schema＋目前 `getState()` 放進 system prompt，請模型回傳 `gridState`、`propertiesToIgnore`、`explanation`，再 `api.setState()` 套用。prompt 就寫在這個範例檔裡。
- **能不能換成 Claude：可以**。它只是 JSON Schema，丟給 Claude 的 tool use（`input_schema`）或 structured output 都行。若不想買企業版，可以自己用社群版的 `getColumnDefs()`、`getFilterModel()`／`setFilterModel()`、`applyColumnState()` 組一個簡化版 schema。
- **MCP 伺服器：** 文件 [mcp-server/index.mdoc](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/documentation/ag-grid-docs/src/content/docs/mcp-server/index.mdoc) 介紹 `npx ag-mcp`，提供文件搜尋、版本偵測／設定工具與「建新表格」「升級版本」prompt，明列 Claude 為支援的客戶端。（MCP 伺服器原始碼不在此 repo，**未確認**其實作。）
- **AI Skills：** 文件 [skills/index.mdoc](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/documentation/ag-grid-docs/src/content/docs/skills/index.mdoc) 介紹 `npx skills add ag-grid/skills`，提供 `ag-dev`（寫 AG Grid 程式碼的規則）與 `ag-update`（版本升級）兩個 skill，明寫給 Claude Code / Codex 用。Skills 本體在另一個 repo `ag-grid/skills`，本次**未掃描**。
- 對你最實用的一點：用 Claude Code 幫你寫倉儲系統的表格時，裝 `ag-dev` skill 或 `ag-mcp`，Claude 會查到對應版本的 API，減少寫錯舊版語法。

---

## 8. 擴充方式與 API

- **設定物件：** 所有行為都由 `gridOptions` 與每欄的 `colDef` 控制。型別定義就是最完整的說明書：[entities/gridOptions.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/entities/gridOptions.ts)、[entities/colDef.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/entities/colDef.ts)。例如 `allowFormula`（colDef L352）、`valueFormatter`（L371）、`editable`（L505）、`cellEditor`（L552）、`onCellValueChanged`（L592）、`pinned`（L717）、`cellClassRules`（L805）、`colSpan`（L1075）、`spanRows`（L1086）；gridOptions 的 `undoRedoCellEditing`（L653）、`rowBuffer`（L984）、`formulaDataSource`（L1284）、`formulaFuncs`（L1319）、`enableCellSpan`（L1396）、`cellSelection`（L1990）、`getRowId`（L2544）、`onCellValueChanged`（L2788）。
- **自訂元件：** cellRenderer（顯示，例如放商品圖片、按鈕）、cellEditor（自訂編輯器）、filter、header、tooltip、overlay，都可以是純 JS class 或函式。
- **讀寫資料 API：** `api.getCellValue()`（[cellApi.ts#L34](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/valueService/cellApi.ts#L34)）、`rowNode.setDataValue(colKey, value)`（[rowNode.ts#L568](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/entities/rowNode.ts#L568)）、`api.applyTransaction({add, update, remove})`（[clientSideRowModelApi.ts#L51](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/clientSideRowModel/clientSideRowModelApi.ts#L51)，適合 Firestore `onSnapshot` 增量更新）、`api.getState()/setState()`（[stateApi.ts#L4-L8](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/misc/state/stateApi.ts#L4-L8)）、`api.exportDataAsCsv()`。
- **事件：** `cellValueChanged`、`cellEditingStarted/Stopped`、`selectionChanged`、`filterChanged`、`sortChanged`、`rowDataUpdated`、`pasteStart/End`（企業）等，可在 gridOptions 寫 `onXxx` 或 `api.addEventListener`。
- **企業版擴充點：** `formulaFuncs`（自訂公式函數）、`formulaDataSource`、`processDataFromClipboard`、`processCellForClipboard`、Excel 匯出的 `excelStyles`、`getContextMenuItems`。

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護：** 非常活躍。公司 AG GRID LTD 全職維護、最後推送就是掃描當天（2026-11-04）；SECURITY.md 標示 32.x 與 36.x 有安全更新。repo 建立於 2014 年，十多年歷史。
- **測試：** community src 內 38 個 `.test.ts`、enterprise src 內 52 個；另 `testing/behavioural/` 有 679 個 `.test.ts`（用 file list 以 `grep -c` 數的），還有 Playwright e2e、模組大小比較、無障礙測試、CSP 測試目錄。CI workflow 25 個檔案。
- **遙測／隱私：** src 未發現網路請求；授權檢查純本地。✓
- **資安（已知的坑）：**
  - cellRenderer 回傳「字串」時會被當 HTML 用 `innerHTML` 插入（[agComponentUtils.ts#L28-L33](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/components/framework/agComponentUtils.ts#L28-L33) → [ag-stack dom.ts#L242-L248](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-stack/src/utils/dom.ts#L242-L248)）。如果商品名稱、客戶備註是外部輸入，**不要**在 cellRenderer 用字串拼 HTML，要回傳 DOM 元素或用 `textContent`，否則有 XSS 風險。
  - 剪貼簿 HTML 讀取用 `unsanitized: ['text/html']`，只用來對齊表格形狀，不會插入 DOM（依我讀到的 L378-L420 邏輯）。
- **其他坑：**
  - **社群版沒有：** 範圍選取、拖拉填滿、Ctrl+C/V、Excel 匯出、公式、樞紐、分組、右鍵選單。很多人裝了社群版以為「像 Excel」，結果發現這些都要付費。
  - 企業版沒金鑰也能跑 → 容易「不小心」違約上線。
  - 公式功能限制（官方文件 [formulas/index.mdoc](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/documentation/ag-grid-docs/src/content/docs/formulas/index.mdoc) 的相容表）：**不支援** Tree Data、Row Grouping、Pivot、Aggregation、Master Detail、Server-Side／Infinite／Viewport Row Model；且要設 `getRowId`。
  - 每次大版本升級（v32→v33→…→v36）常有 breaking changes（官方特地做了 `ag-update` skill 來處理）。
  - 套件體積：repo 內沒有提交量測數字（`testing/module-size` 只說明量測方法），我沒有執行建置 → **體積未確認**。

---

## 10. 跟其他專案組合的建議

1. **最務實（全免費、MIT）：AG Grid 社群版＋HyperFormula（或自寫 `valueGetter`）＋SheetJS**
   - AG Grid 社群版負責顯示／編輯／排序／篩選／虛擬捲動；
   - 簡單計算（成本、毛利、庫存金額）直接 `valueGetter`；真的需要使用者自己打公式時，可用 HyperFormula（注意它是 GPL-3.0／商業雙授權，見同資料夾資料包）或 Univer 的公式引擎；
   - .xlsx 匯入匯出用 SheetJS（官方 Excel Import 文件也是示範用 `xlsx` 套件：[excel-import/index.mdoc](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/documentation/ag-grid-docs/src/content/docs/excel-import/index.mdoc)）。
2. **要真正的試算表體驗（多工作表、每格公式、儲存格格式、協作）**：直接選 Univer（Apache-2.0）或 Luckysheet，而不是 AG Grid。AG Grid 適合「資料庫表格／後台管理」，Univer 適合「Excel 替代品」。
3. **倉儲系統建議架構：** Firestore（每個商品一個 document）→ `onSnapshot` → `api.applyTransaction({update})` → AG Grid 顯示；使用者改格子 → `onCellValueChanged` → `updateDoc()`；欄寬排序篩選用 `api.getState()` 存到使用者設定 document。
4. **AI 自然語言查表：** 參考 AG Grid AI Toolkit 的做法，但用 Claude API＋社群版的 filter/sort API 自己實作（「幫我找毛利率低於 20% 的商品」→ Claude 回傳 filterModel）。
5. **廣告報表：** AG Grid 社群版表格＋另外的圖表庫（例如 AG Charts Community、ECharts、Chart.js），不需要企業版的 Integrated Charts。

---

## 11. 網頁 Excel 能力檢查表

| 項目 | 結果 | 程式碼位置 / 說明 |
|---|---|---|
| **渲染方式** | **DOM**（每格是 div，非 Canvas／WebGL） | [rowRenderer.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/rendering/rowRenderer.ts)、[gridBodyComp/rowContainer/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/gridBodyComp/rowContainer)。好處是 CSS 好改、可放任何 HTML；缺點是極大量欄＋列時比 Canvas 表格（如 Glide Data Grid）吃效能。 |
| **虛擬捲動** | **有（社群版）**，列＋欄都有 | 列：[rowRenderer.ts#L1397-L1490](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/rendering/rowRenderer.ts#L1397-L1490)；欄：[columnViewportService.ts#L130-L160](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/columns/columnViewportService.ts#L130-L160)；超高容器：[rowContainerHeightService.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/rendering/rowContainerHeightService.ts) |
| **10 萬列以上效能** | 架構上支援；**實測未確認** | 因為只畫可見列＋緩衝，10 萬列 client-side 是常見用法；更大量可用 Infinite（社群）或 Server-Side Row Model（企業）。我沒有執行任何效能測試。 |
| **公式引擎** | **付費版才有**（`Formula` 模組） | [formula/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula)。欄位需 `allowFormula: true`；支援 A1、`$A$1` 絕對參照、`A1:B2` 範圍、自動補全的公式編輯器。 |
| ├ 函數數量 | **20 個名稱 / 18 個實作** | 數法：讀 [supportedFuncs.ts#L7-L64](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/functions/supportedFuncs.ts#L7-L64) 的 default export，排除註解行與運算子符號鍵，用 Python 數出 20 個英文名稱：IF、NOW、TODAY、PRODUCT、SUM、ADD(=SUM 別名)、SUMIF、POWER、MIN、MAX、AVERAGE、MEDIAN、ROUND、COUNT、COUNTA、COUNTBLANK、COUNTIF、RAND、CONCAT、CONCATENATE(=CONCAT 別名)。另有 13 個運算子（+ - * / ^ % = & <> > >= < <=）。**沒有** VLOOKUP、XLOOKUP、INDEX/MATCH、IFERROR、SUMIFS、TEXT、日期運算函數等。 |
| ├ 解析器／依賴圖／重算 | 有（拉式求值＋快取，無全域依賴圖） | 解析：[ast/parsers.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/ast/parsers.ts)；求值與循環偵測：[formulaService.ts#L839-L935](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/formulaService.ts#L839-L935)；錯誤型別 `#REF! #NAME? #CIRCREF! #PARSE! #VALUE! #DIV/0! #ERROR!`（[i18n.ts#L1](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/i18n.ts#L1)）。 |
| ├ 陣列公式 | **沒有**（未見動態陣列／溢出相關程式碼） | parsers.ts 中沒有 `{...}` 陣列常數或 spill 邏輯；範圍只能當函數參數展開。 |
| ├ 跨工作表參照 | **沒有** | AG Grid 只有「一張表」，沒有工作表概念；參照解析只對應目前 grid 的欄（[referenceColumns.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/referenceColumns.ts)）。Excel 匯出則可多 sheet。 |
| ├ 自訂函數 | **付費版才有** | `gridOptions.formulaFuncs`，見 [formulaService.ts#L418-L436](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/formula/formulaService.ts#L418-L436)。社群版替代：`valueGetter` 函式（每欄一條 JS 計算式）。 |
| **儲存格編輯** | **有（社群版）** | [edit/cellEditors/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/edit/cellEditors)：文字、數字、日期、勾選、下拉、長文字。批次編輯（BatchEdit）是付費。 |
| **複製貼上** | **付費版才有**（`Clipboard` 模組） | [clipboardService.ts#L369-L420](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/clipboard/clipboardService.ts#L369-L420)。預設 Tab 分隔＋HTML 對齊，**能直接從 Excel／Google 試算表貼上**多格區塊。社群版可設 `enableCellTextSelection` 讓瀏覽器原生選字複製，但不能貼入多格。 |
| **拖拉填滿** | **付費版才有** | [agFillHandle.ts#L636-L679](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/rangeSelection/agFillHandle.ts#L636-L679)：數字線性推算、文字循環、公式平移、Alt 鍵 ±1。 |
| **復原／重做** | **有（社群版）**，限儲存格編輯 | [undoRedoService.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/undoRedo/undoRedoService.ts)，`undoRedoCellEditing: true`。不含欄寬、排序等操作的復原。 |
| **數字格式** | **有（社群版，寫程式）** | `colDef.valueFormatter`（[colDef.ts#L371](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/entities/colDef.ts#L371)）用 JS 函式格式化（例如 `Intl.NumberFormat('zh-TW')`）。沒有 Excel 那種 `#,##0.00` 格式字串＋使用者介面選格式。 |
| **條件格式** | **有（社群版，寫程式）** | `cellClassRules`（[cellStyleService.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/styling/cellStyleService.ts)）。沒有給一般使用者點選設定的 UI。 |
| **合併儲存格** | **部分有（社群版）** | 橫向：`colSpan`（[colDef.ts#L1075](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/entities/colDef.ts#L1075)）；縱向：`enableCellSpan`＋`spanRows`（相鄰同值自動合併，[rendering/spanning/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/rendering/spanning)）。不是 Excel 那種「任意選一塊按合併」。 |
| **凍結窗格** | **有（社群版）** | 欄：`pinned: 'left'/'right'`（[colDef.ts#L717](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/entities/colDef.ts#L717)）；列：`PinnedRowModule`（pinnedTopRowData）。 |
| **欄寬列高** | **有（社群版）** | `ColumnResize`、`ColumnAutoSize`、`RowAutoHeight` 模組（[allCommunityModule.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/allCommunityModule.ts)）。使用者拖拉列高未確認（通常由程式設定）。 |
| **篩選** | **有（社群版）**；進階篩選付費 | 文字／數字／日期／BigInt／快速篩選／外部篩選為社群；Excel 式勾選清單的 Set Filter、Multi Filter、Advanced Filter 為企業。 |
| **排序** | **有（社群版）** | [sort/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/sort)，多欄排序。 |
| **資料驗證（下拉選單）** | **有（社群版基本）** | `agSelectCellEditor`（[selectCellEditor.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/edit/cellEditors/selectCellEditor.ts)）；可搜尋的 Rich Select 為付費。數值驗證可用 `valueParser` 轉型、自訂 `valueSetter`（回傳 false 表示不寫入）自行把關。 |
| **圖表** | **付費版才有** | `IntegratedCharts`、`Sparklines`（[charts/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/charts)），需另裝 AG Charts。 |
| **樞紐分析** | **付費版才有** | [pivot/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/pivot)＋rowGrouping、aggregation。 |
| **圖片／附件** | 顯示：**有（社群版，自訂 cellRenderer）**；Excel 匯出圖片：付費 | 自己寫 cellRenderer 回傳 `<img>` 元素即可顯示商品圖；附件上傳無內建。Excel 匯出圖片見 [excelSerializingSession.ts#L130-L150](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/excelExport/excelSerializingSession.ts#L130-L150)。儲存格註解（Notes）付費。 |
| **匯出 .csv** | **有（社群版）** | [csvExport/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/csvExport)，`api.exportDataAsCsv()`；公式欄匯出計算後的值。 |
| **匯出 .xlsx** | **付費版才有** | 自寫 OOXML＋zip，不依賴第三方（[excelExport/](https://github.com/ag-grid/ag-grid/tree/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-enterprise/src/excelExport)）。保真度：樣式、數字格式、合併、凍結、圖片、超連結、註解、表格、多 sheet、公式（寫公式本身）、頁面設定、資料保護都有對應程式或文件頁。開源版**沒有**。 |
| **匯入 .xlsx／.csv** | **沒有內建** | 官方文件示範用第三方 `xlsx`（SheetJS）解析再塞 `rowData`（[excel-import/index.mdoc](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/documentation/ag-grid-docs/src/content/docs/excel-import/index.mdoc)）。src 內沒有 unzip／讀檔程式（grep `readAsArrayBuffer`、`unzip`、`DecompressionStream` 只在 PDF 圖片解壓與測試出現）。 |
| **多人即時協作** | **沒有** | src grep `crdt|yjs|collaborat|websocket` 0 筆。要協作就自己用 Firestore `onSnapshot`＋`applyTransaction` 做「最後寫入者贏」的同步；沒有 OT／CRDT、沒有儲存格鎖定。 |
| **資料模型** | 陣列物件 `rowData` ＋欄定義 `columnDefs` | 一列＝一個 JS 物件，一欄＝物件的一個 field。範例：`{ id: 1, sku:'A001', name:'保溫杯', price:120, quantity:35 }`。企業版公式直接存在欄位值裡，官方範例的長格式（以欄 id＋列 id 參照，不怕排序後位移）是 `subtotal: '=REF(COLUMN("price"),ROW(1))*REF(COLUMN("quantity"),ROW(1))'`（[formulas/_examples/formulas/main.ts#L53-L59](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/documentation/ag-grid-docs/src/content/docs/formulas/_examples/formulas/main.ts#L53-L59)，`ROW(1)` 的 1 是 `getRowId` 回傳的列 id）。 |
| **存進 Firestore** | 容易（自己接） | 每列一個 document，`getRowId: p => p.data.id` 對應 doc id；`onCellValueChanged: e => updateDoc(doc(db,'items',e.data.id), {[e.colDef.field]: e.newValue})`；監聽 `onSnapshot` 用 `api.applyTransaction({update:[...]})`。表格本身的狀態（欄寬、排序）用 `api.getState()` 另存。 |
| **手機／觸控** | **基本有** | 文件 [touch/index.mdoc](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/documentation/ag-grid-docs/src/content/docs/touch/index.mdoc)：點選＝滑鼠點擊、拖曳欄標題、拖拉欄寬、長按開選單；雙擊編輯需關閉縮放。沒有手機專用版面。 |
| **繁體中文介面** | **有（MIT）** | [community-modules/locale/src/zh-TW.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/community-modules/locale/src/zh-TW.ts)，847 個 key，與 en-US 數量相同（`grep -c` 計數）；匯出名稱 `AG_GRID_LOCALE_TW`。用 `localeText: AG_GRID_LOCALE_TW`。部分翻譯偏中國用語（例如「無顯示行」），可自行覆寫。 |
| **嵌入純 JavaScript** | **可以（不用 React／Vue）** | `agGrid.createGrid(div, gridOptions)`；CDN 一支 `ag-grid-community.min.js` 已含 CSS 與全部社群模組（[main-umd-styles.ts](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/src/main-umd-styles.ts)）。套件大小：**未確認**（未建置、repo 無量測結果）。 |
| **API／事件** | **有（社群版）** | 監聽：`onCellValueChanged`；讀：`api.getCellValue({rowNode, colKey})`；寫：`rowNode.setDataValue(col, v)`、`api.applyTransaction()`；狀態：`getState/setState`。 |

**最小可用範例（純 JavaScript，社群版，可直接放進你的 Firebase Hosting 頁面）：**

```html
<script src="https://cdn.jsdelivr.net/npm/ag-grid-community@36.3.0/dist/ag-grid-community.min.js"></script>
<style>.low-stock { background:#fde2e2; color:#b00020; }</style>
<div id="grid" style="height:500px"></div>
<script>
  const rows = [
    { sku: 'A001', name: '保溫杯', cost: 120, price: 299, qty: 35, status: '上架' },
    { sku: 'A002', name: '環保袋', cost: 30,  price: 99,  qty: 6,  status: '上架' },
  ];
  const nt = (p) => p.value == null ? '' : 'NT$ ' + Number(p.value).toLocaleString('zh-TW');
  const api = agGrid.createGrid(document.getElementById('grid'), {
    rowData: rows,
    getRowId: (p) => p.data.sku,
    undoRedoCellEditing: true,
    defaultColDef: { filter: true, sortable: true, resizable: true },
    columnDefs: [
      { field: 'sku', headerName: '料號', pinned: 'left' },
      { field: 'name', headerName: '品名', editable: true },
      { field: 'cost', headerName: '成本', editable: true, cellEditor: 'agNumberCellEditor', valueFormatter: nt },
      { field: 'price', headerName: '售價', editable: true, cellEditor: 'agNumberCellEditor', valueFormatter: nt },
      { headerName: '毛利率', valueGetter: (p) => p.data.price ? (p.data.price - p.data.cost) / p.data.price : null,
        valueFormatter: (p) => p.value == null ? '' : (p.value * 100).toFixed(1) + '%' },
      { field: 'qty', headerName: '庫存', editable: true, cellEditor: 'agNumberCellEditor',
        cellClassRules: { 'low-stock': (p) => p.value < 10 } },
      { field: 'status', headerName: '狀態', editable: true, cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ['上架', '下架', '缺貨'] } },
    ],
    onCellValueChanged: (e) => console.log('改了', e.data.sku, e.colDef.field, e.newValue), // 這裡改成 updateDoc 寫回 Firestore
  });
  // api.exportDataAsCsv();  // 匯出 CSV（社群版）
</script>
```

（CDN 路徑 `dist/ag-grid-community.min.js` 來自 [packages/ag-grid-community/README.md](https://github.com/ag-grid/ag-grid/blob/dd8bb2912dbafa34f130167bb5154eb50de71298/packages/ag-grid-community/README.md) 的官方範例；`@36.3.0` 版本號取自 repo 的 package.json，npm 上是否已發布此版本未逐一確認，若載入失敗改用最新版號即可。）

---

## 關鍵字

AG Grid、ag-grid、ag-grid-community、ag-grid-enterprise、資料表格、Data Grid、網頁版 Excel、試算表、spreadsheet、虛擬捲動、virtual scrolling、row virtualisation、DOM 渲染、公式引擎、formula、拖拉填滿、fill handle、範圍選取、cell selection、剪貼簿、clipboard、Excel 匯出、xlsx export、CSV 匯出、樞紐分析、pivot、條件格式、cellClassRules、valueGetter、凍結窗格、pinned columns、合併儲存格、colSpan、spanRows、復原重做、undo redo、繁體中文、zh-TW、localeText、純 JavaScript、createGrid、Firebase、Firestore、雙授權、MIT、Commercial EULA、浮水印、watermark、AI Toolkit、getStructuredSchema、MCP、ag-mcp、Claude Code、AI Skills、ag-dev、倉儲管理、庫存表、成本計算、比價
