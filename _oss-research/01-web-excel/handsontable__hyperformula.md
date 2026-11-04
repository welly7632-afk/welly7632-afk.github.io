# handsontable/hyperformula — 沒有畫面的「Excel 公式大腦」：只負責算，表格 UI 要自己接
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：187dfa1
> GitHub：https://github.com/handsontable/hyperformula｜⭐ 2829｜授權：GPL-3.0-only 或 Handsoncode 商業授權（雙授權；GitHub 偵測為 NOASSERTION 是因為 LICENSE.txt 是自訂的雙授權文字）｜主要語言：TypeScript｜最近更新：2026-11-04（master 最新 commit 為 2026-10-15，版本 3.5.0）

> 本資料包所有程式碼位置皆以 commit `187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3` 為準。以下 `P/` 代表 `https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/`。內文表格與連結都寫完整網址。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** HyperFormula 是一個純 TypeScript 寫的「無介面（headless）試算表引擎」——你丟給它一個二維陣列（裡面可以有 `=SUM(A1:A10)` 這類 Excel 公式），它幫你解析、建依賴圖、算出結果、在你改某格時只重算受影響的格子，還附 undo/redo、剪貼簿、插入刪除列欄、排序重排等 API。**它完全不畫表格**，畫面要你自己做或接別的表格元件。

**對你（台灣小店老闆、自己用 Claude 做倉儲網頁 + 跑廣告）可以拿來做：**

1. **倉儲 App 裡的「公式欄位」**：在你現有的純 JavaScript + Firebase 倉儲系統裡，讓某些欄位可以寫 `=B2*C2`（數量×單價）、`=SUMIF(類別欄,"飲料",金額欄)`、`=VLOOKUP(料號, 價目表, 3, FALSE)`，改一格其他格自動跟著變。資料仍存 Firestore，HyperFormula 只在瀏覽器裡算。
2. **成本／售價／毛利試算器**：進貨成本、運費、平台抽成、廣告費 → 用公式算毛利率、損益兩平 ROAS。財務函數（`PMT`、`NPV`、`IRR`、`XIRR`）都有，可做分期、投資回收試算。
3. **比價表、報價單**：多個供應商價格放不同工作表，用 `MIN`、`XLOOKUP`、`INDEX/MATCH` 找最低價；跨工作表參照（`'供應商A'!B2`）支援。
4. **當成「網頁版 Excel」的公式核心**：配一個開源表格 UI（例如 Jspreadsheet CE、glide-data-grid、x-spreadsheet 或自己寫 `<table>`），就變成可以打公式的網頁試算表。官方的 Handsontable 表格元件本身就是用它做公式功能（README 寫「Maintained by the team that stands behind the Handsontable data grid」）。
5. **給 Claude 當「精確計算工具」**：LLM 算數字容易錯。你可以在 Node.js 裡包一個小工具（例如自己寫 MCP 工具），讓 Claude 把公式丟給 HyperFormula 算，結果可重現、可稽核。官方也把這個當賣點（README：「Deterministic compute layer for AI & LLMs」），但官方 MCP／AI SDK 套件目前「尚未推出」（見第 7 節）。

**不適合拿來做：** 它不能讀寫 .xlsx、不能畫表格、沒有儲存格格式（顏色、框線）、沒有圖表、沒有多人協作。這些都要靠別的專案補。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

**實際授權：** 雙授權。`LICENSE.txt` 寫明二選一：(1) 向 Handsoncode（波蘭公司）購買的專有／商業授權；(2) GNU GPL v3。`package.json` 的 `"license": "GPL-3.0-only"`。
- LICENSE：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/LICENSE.txt
- 官方授權說明：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/docs/guide/licensing.md

**一定要注意：程式裡有「授權金鑰」機制，不填就不能用。**
- 建立實例時必須傳 `licenseKey: 'gpl-v3'`（代表你選 GPL 授權）。預設值是空字串 `''`（見 `src/Config.ts` 的 `defaultConfig`），會被判成 `MISSING`。
- 金鑰缺少或無效時：所有公式都算出 `#LIC!` 錯誤，而且編輯儲存格、增刪列欄、`copy/cut/paste`、`undo/redo`、`batch`、命名運算式等 API 會丟出 `LicenseCapabilityMissingError`（CHANGELOG 3.5.0 明載）。
  - 金鑰判斷：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/helpers/licenseKeyValidator.ts#L224-L253 （第 230 行：`'gpl-v3'` 直接判為 VALID）
  - 公式被擋：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/license/FunctionCallLicenseGate.ts#L56-L71
  - API 被擋：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/license/ensureFeatureAllowed.ts#L25-L44

**有沒有「付費版才有」的功能？**
- 用 `gpl-v3` 金鑰時是「不限制（unrestricted）」，**全部函數與 API 都能用**（`src/license/licenseResolution.ts` 中非新式金鑰一律回傳 `unrestrictedEntitlement()`）。
- 3.5.0（2026-10-09）新增「新式商業金鑰」：商業版可以只買部分功能，函數被分成 21 組（`fun:math.a`、`fun:lookup.c`、`fun:finance.c`…），沒買到的函數算出 `#LIC!`。見 https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/license/functionCapabilities.ts 。**這是商業版「分級販售」，不是 GPL 版少功能。** 但這也透露官方在走「分級收費」路線，未來版本政策可能再變，建議鎖定版本號。
- 官方「完整測試套件」不公開，需寫信索取（`test/README.md`），公開 repo 只有 5 個 smoke test。
- 官方 MCP Server、Vercel AI SDK 整合：文件標示「Not available yet — coming soon」，目前無法使用。

**白話結論：**
- **個人使用／自己公司內部使用（不把程式散布給外人）**：用 `gpl-v3` 金鑰即可，免費、功能完整。GPL 的義務主要在「散布」時才觸發；你自己或自己員工在內部倉儲系統使用，一般不視為對外散布。（此為一般性說明，非法律意見。）
- **公司商用、要給客戶或公開網站使用**：網頁版 JS 會被下載到使用者瀏覽器，這通常被視為「散布」。若用 GPL，你整個前端（跟它綁在一起的程式碼）都要以 GPL 開放原始碼給使用者。不想開源就要買商業授權（官網詢價，價格本 repo 未載明 → 未確認）。
- **組合 A+B+C 時**：只要有一塊是 GPL 的 HyperFormula，合起來散布的整體就要遵守 GPL。若未來要做成賣給別人的產品，請把這點放在第一位考量。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容 |
|---|---|
| 語言 | TypeScript（`src/` 共 224 個 .ts 檔、約 54,558 行，我用 `find src -name "*.ts" \| xargs cat \| wc -l` 數的） |
| 執行環境 | 瀏覽器（`browserslist` 涵蓋 Chrome／Firefox／Safari／iOS Safari／Edge／Android 最新兩版）或 Node.js（開發用 Node 22，`.github/workflows/test.yml`） |
| 執行期依賴 | 只有 2 個：`chevrotain ^6.5.0`（公式解析器框架）、`tiny-emitter ^2.1.0`（事件）。見 `package.json` |
| 前端框架 | 不需要。純 JS 可用；官方有 React／Angular／Vue／Svelte 整合文件 |
| 後端 | 不需要。純前端即可；也可放 Node.js 伺服器端算 |
| 資料庫 | 沒有。資料由你自己存（例如 Firestore），用 `buildFromSheets()` 載入、`getAllSheetsSerialized()` 匯出 |
| 部署 | npm 套件 `hyperformula`，或 CDN `<script>`（jsDelivr：`dist/hyperformula.full.min.js` 已含依賴） |
| 硬體／GPU | 不需要 GPU。記憶體視資料量；大量資料時可調 `chooseAddressMappingPolicy`（稠密／稀疏） |
| API Key | 不需要任何雲端 API Key。只需設定 `licenseKey: 'gpl-v3'`（字串，不連網驗證） |
| 費用 | GPL 免費；商業授權需詢價（未確認金額） |
| 套件大小 | repo 內沒有編好的 dist，**我無法自己量** → 未確認。官方文件 `docs/guide/integration-with-react.md` 第 92 行寫「a few hundred kB」 |

**網路／遙測：** 我在 `src/` 全域搜尋 `fetch(`、`XMLHttpRequest`、`sendBeacon`、`navigator.`，**一個都沒有** → 引擎本身不會連網、不回傳資料。金鑰狀態只會印在 `console.warn/console.error`。

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

```
hyperformula/
├── src/                                  ← 全部引擎原始碼
│   ├── index.ts                          ← 套件入口；在這裡把所有內建函數 plugin 註冊進去（L114-L122 附近）
│   ├── HyperFormula.ts                   ← ★ 唯一的公開 API 類別（5,141 行）：build*/get*/set*/undo/copy/on…
│   ├── Config.ts / ConfigParams.ts       ← 所有設定與預設值（maxRows 40000、undoLimit 20、licenseKey ''…）
│   ├── BuildEngineFactory.ts             ← 組裝引擎各零件（parser、graph、evaluator…）
│   ├── GraphBuilder.ts                   ← 從二維陣列建立依賴圖
│   ├── Evaluator.ts                      ← ★ 重算排程：全量 run() / 增量 partialRun()
│   ├── CrudOperations.ts / Operations.ts ← 改值、增刪列欄、搬移、換工作表等「寫入」邏輯
│   ├── UndoRedo.ts                       ← 復原／重做（每種操作一個 UndoEntry 類別）
│   ├── ClipboardOperations.ts            ← 內部剪貼簿（copy/cut/paste，非系統剪貼簿）
│   ├── Serialization.ts                  ← 匯出：值、公式、序列化內容
│   ├── Exporter.ts                       ← 變更事件的資料格式（ExportedCellChange）
│   ├── Emitter.ts                        ← 事件：valuesUpdated、sheetAdded…（8 種）
│   ├── NamedExpressions.ts               ← 命名運算式（像 Excel 的「名稱管理員」）
│   ├── CellContentParser.ts              ← 判斷輸入是數字、日期、貨幣、布林、公式還是文字
│   ├── DateTimeDefault.ts / DateTimeHelper.ts ← 日期解析與序號換算
│   ├── format/format.ts, format/parser.ts← TEXT() 函數用的數字／日期格式字串處理
│   ├── parser/                           ← ★ 公式解析器
│   │   ├── LexerConfig.ts                ← 詞法 token 定義（chevrotain）
│   │   ├── FormulaParser.ts              ← 語法解析 → AST（943 行）
│   │   ├── ParserWithCaching.ts          ← 依「相對位置」雜湊快取 AST，往下複製的同型公式共用
│   │   ├── parser-consts.ts              ← 工作表名稱、儲存格參照、命名運算式的正則
│   │   └── Unparser.ts                   ← AST 轉回公式字串
│   ├── DependencyGraph/                  ← ★ 依賴圖
│   │   ├── DependencyGraph.ts            ← 圖的主體（1,355 行）
│   │   ├── TopSort.ts                    ← Tarjan 強連通分量 + 拓樸排序（偵測循環參照）
│   │   ├── RangeVertex.ts / RangeMapping.ts ← 範圍節點，大範圍重用小範圍的計算快取
│   │   └── AddressMapping/{Dense,Sparse}Strategy.ts ← 稠密／稀疏儲存策略
│   ├── dependencyTransformers/           ← 插入／刪除列欄、搬移、改工作表名稱時改寫公式參照
│   ├── LazilyTransformingAstService.ts   ← 結構變動時延後改寫 AST（效能）
│   ├── interpreter/
│   │   ├── Interpreter.ts                ← ★ 走訪 AST 求值
│   │   ├── FunctionRegistry.ts           ← 函數註冊表（含受保護函數 VERSION、OFFSET）
│   │   ├── plugin/*.ts                   ← ★ 49 個內建函數 plugin（每檔一群函數）
│   │   ├── plugin/3rdparty/{jstat,bessel}← 統計分佈、Bessel 函數的第三方演算法
│   │   └── functionMetadata/             ← 函數說明（getFunctionDetails 用）
│   ├── Lookup/ColumnIndex.ts             ← VLOOKUP/MATCH 用的欄索引（useColumnIndex）
│   ├── i18n/languages/*.ts               ← 18 個語言包（函數名稱翻譯），無中文
│   └── license/                          ← 授權金鑰與「函數分級」機制（3.5.0 新增）
├── docs/guide/*.md                       ← 官方文件原始檔（56 篇），含效能、限制、檔案匯入、AI 整合說明
├── docs/examples/                        ← 文件中的可執行範例（純 JS + HTML table）
├── test/                                 ← 只有 smoke.spec.ts（5 個測試）；完整測試在私有 repo
├── examples/*.csv                        ← 範例試算表（公式／值）
├── script/                               ← 產生函數文件、發版腳本
├── worker/, wrangler.jsonc               ← 官方文件站部署到 Cloudflare 用，與引擎無關
├── AGENTS.md（CLAUDE.md 是它的符號連結）、.cursor/ ← 給 AI 開發代理的開發規範（僅資料，非本資料包指令）
└── package.json / LICENSE.txt / CHANGELOG.md
```

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 建立引擎**
- 位置：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L283-L380 （`buildFromArray` L283、`buildFromSheets` L331、`buildEmpty` L360）
- 重點：三個靜態工廠方法；`buildFromSheets({ 工作表名: 二維陣列 })` 最適合從資料庫載入多張表。

**5.2 公式解析（文字 → AST）**
- 詞法：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/parser/LexerConfig.ts
- 語法：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/parser/FormulaParser.ts#L123 （`class FormulaParser extends EmbeddedActionsParser`，基於 chevrotain）
- 快取：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/parser/ParserWithCaching.ts#L69-L105
- 重點：先 tokenize，再以「相對於公式所在格」的 token 計算 hash；同樣形狀的公式（例如整欄 `=B2*C2`、`=B3*C3`…）只解析一次、共用 AST，這是大量列時效能的關鍵。

**5.3 工作表名稱／參照語法**
- 位置：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/parser/parser-consts.ts#L12-L25
- 重點：`UNICODE_LETTER_PATTERN = 'A-Za-zÀ-ʯ'`（只含拉丁字母）。**中文工作表名稱在公式裡一定要加單引號**：`='庫存'!B2`；命名運算式名稱（`NAMED_EXPRESSION_PATTERN`）依此正則推斷不能用中文（未實測）。

**5.4 依賴圖與增量重算**
- 依賴圖：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/DependencyGraph/DependencyGraph.ts#L89-L210 （`setFormulaToCell`、`setValueToCell`、`processCellDependencies`；L202 起用 `findSmallerRange` 讓 `A1:A100` 重用 `A1:A99` 的結果）
- 拓樸排序與循環偵測：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/DependencyGraph/TopSort.ts#L21-L60
- 重算排程：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Evaluator.ts#L34-L110 （`run()` 全量、`partialRun()` 只從髒節點往下算；在循環中的格子設成 `#CYCLE!`）
- 觸發點：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L5118-L5140 （每個寫入 API 最後呼叫 `recomputeIfDependencyGraphNeedsIt()`，算完發出 `valuesUpdated` 事件並回傳變更清單）
- 重點：不支援「反覆運算（iterative calculation）」；`IF` 即使只走一邊也會被判循環（`docs/guide/known-limitations.md`）。

**5.5 求值與函數呼叫**
- 直譯器：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/Interpreter.ts#L68-L210 （L183 `FUNCTION_CALL` 先過授權閘門，再交給 plugin）
- 函數基底類別：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/plugin/FunctionPlugin.ts#L265-L420 （`runFunction` 負責參數型別轉換、陣列向量化、錯誤傳遞）
- 函數註冊：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/FunctionRegistry.ts#L39-L95

**5.6 查表（VLOOKUP／XLOOKUP／MATCH）**
- 位置：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/plugin/LookupPlugin.ts#L20-L70 、欄索引 https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Lookup/ColumnIndex.ts#L39-L120
- 重點：預設對排序資料用二分搜尋、未排序則線性；開 `useColumnIndex: true` 會建欄索引（耗記憶體但大表查價快）。**這對「價目表查價」很實用。**

**5.7 復原／重做**
- 位置：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/UndoRedo.ts#L500-L760 （`saveOperation` L514、`undo` L569、`redo` L756）
- 重點：每種操作一個 `*UndoEntry` 類別（L47 起），上限 `undoLimit`（預設 20）。

**5.8 剪貼簿、填滿、排序**
- 剪貼簿：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/ClipboardOperations.ts#L74-L100 （只存記憶體參照，不碰系統剪貼簿）
- 拖拉填滿資料：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L2836-L2857 （`getFillRangeData`：把來源範圍循環鋪到目標範圍，公式相對參照自動位移）
- 排序：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L1623 （`setRowOrder`，你自己算好排列順序，它負責搬列並修正公式）

**5.9 匯出與事件**
- 序列化：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Serialization.ts#L64-L140
- 事件：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Emitter.ts#L9-L18 、訂閱 https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L4912-L4990

**5.10 TEXT() 的數字／日期格式**
- 位置：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/format/format.ts#L10-L37
- 重點：依序嘗試 `stringifyCurrency` → 日期 → 時間長度 → 數字格式（`#,##0.00`）。可自訂 `stringifyCurrency` 讓 `TEXT(A1,"NT$#,##0")` 之類照你要的方式輸出。注意這是「函數」層的格式化，**不是**儲存格顯示格式。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度（低／中／高） | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整個引擎（不拆，直接當套件用） | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts | chevrotain、tiny-emitter | 低 | CDN 引入 `hyperformula.full.min.js`，你的表格 UI 每次編輯就呼叫 `setCellContents`，再用 `getCellValue` 填回畫面。**最推薦的用法** |
| 自訂函數 plugin 機制 | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/plugin/FunctionPlugin.ts | 引擎本體 | 低 | 寫 `class MyPlugin extends FunctionPlugin`，例如 `=運費(重量,地區)`、`=蝦皮抽成(售價)`（函數 ID 須英文，如 `SHIPFEE`），`HyperFormula.registerFunctionPlugin()` 註冊 |
| 財務函數（PMT/NPV/IRR/XIRR…） | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/plugin/FinancialPlugin.ts | 小量內部型別 | 中 | 想在沒有試算表的成本計算器直接用演算法，可參考其數學邏輯自行改寫（注意 GPL 傳染：複製程式碼即受 GPL 約束） |
| 統計函數＋jStat 移植 | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/plugin/StatisticalPlugin.ts 、 https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/plugin/3rdparty/jstat/jstat.ts | 無外部依賴 | 中 | 廣告 A/B 測試的 `T.TEST`、`CHISQ.TEST`、信賴區間等可直接用公式。`jstat.ts`（1,003 行）檔頭是 jStat 2013 的 **MIT** 授權聲明，若只要統計分佈演算法，可改去用原版 jStat（MIT）避開 GPL |
| 公式解析器（Lexer+Parser+AST） | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/parser/FormulaParser.ts | chevrotain 6、Config、函數註冊表 | 高 | 跟引擎內部型別耦合很深，不建議單拆；要「公式語法檢查」可直接用 `hf.validateFormula()`、`hf.normalizeFormula()` |
| 依賴圖＋拓樸排序（Tarjan） | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/DependencyGraph/TopSort.ts | 無（泛型類別） | 低～中 | `TopSort<T>` 是 189 行的泛型類別，可拿去做「欄位相依重算」或工作流程排序；`DependencyGraph.ts` 本體耦合高 |
| 數字／日期格式字串處理 | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/format/format.ts | Config、DateTimeHelper | 中 | 自己的表格 UI 想做簡易「數字格式」顯示可參考；完整 Excel 格式（條件、色彩）不支援 |
| 查價欄索引 | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Lookup/ColumnIndex.ts | 引擎內部 | 高 | 不建議拆；直接開 `useColumnIndex: true` |
| 命名運算式 | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/NamedExpressions.ts | 引擎本體 | 低（用 API） | `hf.addNamedExpression('TaxRate', 0.05)`，公式寫 `=A2*(1+TaxRate)`；名稱請用英文 |
| 變更事件 | https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Emitter.ts | tiny-emitter | 低 | `hf.on('valuesUpdated', changes => ...)` 只把變動的格子寫回 Firestore 或更新畫面 |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **引擎本身沒有任何 AI**：`src/` 裡沒有呼叫任何模型、沒有 prompt、沒有網路請求。
- **官方 Claude Skill（給「寫程式的 Claude」用，不是給終端使用者）**：`docs/guide/setup-coding-agent.md` 說明可在 Claude Code 安裝：
  ```
  /plugin marketplace add handsontable/handsontable-skills
  /plugin install handsontable-skills@handsontable-skills
  ```
  Skill 本體在另一個 repo `handsontable/handsontable-skills`（我沒有 clone，內容未確認）。對你很有用：之後用 Claude Code 組合 A+B+C 時，Claude 能更正確地寫 HyperFormula 程式碼。
  - 文件：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/docs/guide/setup-coding-agent.md
- **文件 MCP Server**：同一份文件提到 `claude mcp add --transport http handsontable-docs https://docs-assistant.handsontable.com/mcp`，是「查文件」用的 MCP，不是計算用。另外 repo 根目錄有 `context7.json`，表示 Context7 也索引了 `docs/`。
- **官方「HyperFormula MCP Server」（讓 Claude 呼叫引擎算公式）**：`docs/guide/mcp-server.md` 明寫「Not available yet — coming soon… cannot be installed or used today」。預覽 API 是 `npx -y @hyperformula/mcp`，工具名 `evaluate`、`getCellValue`、`setCellContents`。**目前不能用。**
  - https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/docs/guide/mcp-server.md
- **Vercel AI SDK 整合（`hyperformula/ai` 的 `createSpreadsheetTools`）**：`docs/guide/ai-sdk.md` 同樣標示尚未推出；範例用 OpenAI，但它是工具層，模型可換。另有 `integration-with-langchain.md`（未細讀內容，未確認是否可用）。
- **能不能換成 Claude？** 可以，而且很容易自己做：在 Node.js 寫一個 MCP 工具（或 Claude API 的 tool use），工具內部 `HyperFormula.buildFromSheets(...)` + `hf.calculateFormula('=...', sheetId)`（`src/HyperFormula.ts` L4570），讓 Claude 把「成本、毛利、ROAS、分期」等算式交給引擎算。注意：若對外提供服務且散布程式碼，仍受 GPL 約束。
- **對 AI 影片／腳本生成（你的第 3 個興趣）**：本專案無關，0 分。

`claude_support` 判定：**可接**（沒有內建 Claude，但有官方 Claude Code Skill，且引擎非常適合包成 Claude 的計算工具）。

---

## 8. 擴充方式與 API

**8.1 公開 API（`src/HyperFormula.ts`，我用 `grep "^  public"` 列出約 130 個方法）主要分類：**
- 建立：`buildFromArray`、`buildFromSheets`、`buildEmpty`
- 讀：`getCellValue`、`getCellFormula`、`getCellSerialized`、`getSheetValues`、`getRangeValues`、`getAllSheetsSerialized`、`getCellValueType`、`getCellValueFormat`、`getCellDependents`／`getCellPrecedents`（追蹤前導／從屬儲存格，L3355／L3393）
- 寫：`setCellContents`（L1480）、`setSheetContent`、`addRows`／`removeRows`／`addColumns`／`removeColumns`、`moveCells`／`moveRows`／`moveColumns`、`setRowOrder`／`setColumnOrder`、`addSheet`／`removeSheet`／`renameSheet`／`clearSheet`
- 每個寫入都有 `isItPossibleTo*()` 先檢查，適合做 UI 按鈕的可用狀態
- 效能：`batch(fn)`（L3894）、`suspendEvaluation()`／`resumeEvaluation()`
- 剪貼簿：`copy`／`cut`／`paste`
- 復原：`undo`／`redo`／`isThereSomethingToUndo`
- 公式工具：`calculateFormula`（不寫進格子直接算一條公式）、`validateFormula`、`normalizeFormula`、`getNamedExpressionsFromFormula`
- 函數清單：`getAvailableFunctions()`、`getFunctionDetails()`（3.4.0 新增，可做公式自動完成提示）
- 日期：`numberToDateTime`、`numberToDate`、`numberToTime`
- 事件：`on`／`once`／`off`（L4912–L4990），事件種類 8 種：`sheetAdded`、`sheetRemoved`、`sheetRenamed`、`namedExpressionAdded`、`namedExpressionRemoved`、`valuesUpdated`、`evaluationSuspended`、`evaluationResumed`

**8.2 擴充點：**
- **自訂函數**：繼承 `FunctionPlugin`，定義 `implementedFunctions`（ID → method、parameters 型別、`isVolatile`、`arrayFunction` 等），`HyperFormula.registerFunctionPlugin(Plugin, translations)`。官方範例見 https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/docs/guide/custom-functions.md （L172–L210 完整範例）。**自訂函數不受商業金鑰分級影響**（`functionCapabilities.ts` 註解明載）。不支援非同步函數（不能在公式裡直接呼叫 API 抓即時匯率／價格，要先抓好再寫進格子）。
- **語言包**：`HyperFormula.registerLanguage(code, pack)`，pack 結構為 `{ langCode, functions, errors, ui }`（`src/i18n/TranslationPackage.ts` L11–L16）。可自己做 `zhTW`，但只翻函數名與錯誤訊息，通常不需要（台灣 Excel 也用英文函數名）。
- **設定**：`src/Config.ts` 的 `defaultConfig`（L44 起）可改：`maxRows`、`maxColumns`、`dateFormats`、`currencySymbol`、`thousandSeparator`、`decimalSeparator`、`functionArgSeparator`、`undoLimit`、`useColumnIndex`、`useArrayArithmetic`、`caseSensitive`、`precisionRounding`、`stringifyCurrency` 等。
  - https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Config.ts#L44-L85

**8.3 台灣在地化建議設定：**
```js
{
  licenseKey: 'gpl-v3',
  dateFormats: ['YYYY/MM/DD', 'YYYY-MM-DD'],   // 預設是 DD/MM/YYYY，台灣要改
  currencySymbol: ['NT$', '$', '元'],          // 讓 "NT$120" 被當成數字（未實測「元」後綴是否可行）
  maxRows: 200000,                              // 預設只有 40,000 列
  useColumnIndex: true,                         // 大價目表查價加速
}
```

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

**維護狀況：** 活躍，由商業公司 Handsoncode 維護。CHANGELOG 版本節奏：3.2.0（2026-02-19）→ 3.3.0（2026-05-20）→ 3.4.0（2026-08-10）→ 3.5.0（2026-10-09），約每 2–3 個月一版。master 最新 commit 2026-10-15。最近版本持續加函數（XLOOKUP、SORT、UNIQUE、VSTACK、HSTACK、XIRR、12 個資料庫函數、PERCENTILE/QUARTILE 等）與修精度問題。

**測試：** 公開 repo 只有 `test/smoke.spec.ts`（106 行、5 個 `it(`）。完整測試套件在私有 repo `hyperformula-tests`，CI（`.github/workflows/test.yml`）用 deploy token 拉取。有 lint、CodeQL、audit、performance workflow。對使用者而言：品質可信度高，但**你 fork 修改後無法跑官方完整測試**。

**資安／隱私／遙測：** `src/` 內無 `fetch`／`XMLHttpRequest`／`sendBeacon`／`navigator.` → 不連網、無遙測。金鑰驗證是純本機字串判斷。

**已知的坑（實用度由高到低）：**
1. **忘記 `licenseKey: 'gpl-v3'`** → 全部 `#LIC!`、寫入 API 丟錯。這是新手第一大坑。
2. **預設最多 40,000 列**（`maxRows: 40_000`），要做 10 萬列要自己調高。
3. **中文工作表名稱**在公式中必須加單引號 `'庫存'!A1`；命名運算式名稱不能用中文（依 `parser-consts.ts` 正則推斷）。
4. **日期預設 DD/MM/YYYY**，台灣的 `2026/11/04` 要設 `dateFormats` 才會被當日期。
5. **剪貼簿只在記憶體**：`copy/paste` 只是引擎內部操作，要從 Excel／Google 試算表貼上，你得自己在 UI 監聽 `paste` 事件、把 TSV 切成二維陣列再 `setCellContents`。
6. **不支援**（`docs/guide/known-limitations.md`）：多活頁簿、3D 參照、動態陣列（自動溢出那種）、非同步函數、結構化參照（Excel「表格」）、相對命名運算式、SUBTOTAL 不會忽略隱藏列。
7. `OFFSET` 在解析時就被改寫成固定參照，參數只能是常數；`SEQUENCE(A1)` 這類以儲存格決定大小的陣列函數會回 `#VALUE!`；`SORT` 只支援單鍵排序；`INDEX` 不能回整列整欄；`FILTER` 有維度限制。
8. 循環參照一律 `#CYCLE!`，沒有反覆運算選項；`IF` 兩支都算進依賴。
9. 3.5.0 新增分級授權機制，**升級前要看 CHANGELOG**；建議 `package.json` 鎖版本。
10. GPL：若你的工具日後要賣或公開給外人用，需開源或買商業授權。

---

## 10. 跟其他專案組合的建議

1. **最實際的組合（推薦你先做）：你的倉儲 App（純 JS + Firestore）＋ HyperFormula（CDN）＋ 自己寫的 `<table>` 或輕量表格 UI**
   - 只在「需要公式的頁面」（成本試算、報價單、比價表）載入 HyperFormula。
   - Firestore 存原始內容（含公式字串），開頁時 `buildFromSheets`，`valuesUpdated` 事件更新畫面，存檔時 `getAllSheetsSerialized()`。
2. **想要「像 Excel 的操作體驗」：表格 UI 專案（A）＋ HyperFormula（B）**
   - A 選擇：Jspreadsheet CE、x-spreadsheet、glide-data-grid、RevoGrid、Tabulator 等（各自授權與 API 請看對應資料包）。A 負責畫面、選取、複製貼上、拖拉填滿；B 負責公式。接法：A 的 `onchange` → `hf.setCellContents`；`hf.on('valuesUpdated')` → A 的 `setValue`。拖拉填滿可直接用 `hf.getFillRangeData` 算出要填的內容。
   - Handsontable（同公司）內建用 HyperFormula 的 Formulas 外掛，整合最省事，但 Handsontable 本身授權需另外確認（不在本 repo，未確認）。
3. **匯入匯出 .xlsx：加 ExcelJS 或 SheetJS（C）**
   - 官方文件 `docs/guide/file-import.md` 示範用 ExcelJS 讀 .xlsx → 轉成 `{工作表: 二維陣列}`（公式前面補 `=`）→ `buildFromSheets`。匯出則反過來：`getAllSheetsSerialized()` → ExcelJS 寫出。格式（顏色、框線）HyperFormula 不管，要 C 自己保留。
4. **跟 Claude 組合：Claude（D）＋ HyperFormula 計算工具**
   - 自建 MCP 工具，讓 Claude 讀你的商品成本表、算廣告 ROAS、毛利、建議售價，數字由引擎算保證正確。官方 MCP 未上線前，自己包約 50–100 行 Node.js 即可（推估，未實作）。
5. **與比價／ERP 類專案**：ERP 若要讓使用者自訂計算欄位（例如「售價 = 成本 × 1.35 + 運費」），可內嵌 HyperFormula 當「公式欄位引擎」，用 `calculateFormula` 計算單筆，不必開完整試算表。

**注意 GPL 傳染**：把 HyperFormula 跟 MIT 授權的表格 UI 合在一起「散布」，整體要以 GPL 釋出。個人／內部使用不受影響。

---

## 11. 網頁 Excel 能力檢查表

> 先講結論：HyperFormula 是「公式引擎」，所以所有「畫面／格式／互動」類項目基本都是**沒有**；它強在公式、依賴重算、undo、結構操作。

### 11.1 渲染與效能
- **渲染方式（Canvas／DOM／WebGL）：沒有**。純 headless，無任何渲染程式碼；官方範例用自己拼 HTML `<table>`：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/docs/examples/basic-usage/example1.js
- **虛擬捲動：沒有**（UI 層的事，要靠搭配的表格元件）。
- **10 萬列以上的效能：未確認（沒有實測）**。引擎面有：預設 `maxRows: 40_000` 須自行調高（https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Config.ts#L65-L66 ）；同型公式共用 AST 快取（`ParserWithCaching.ts`）、範圍重用小範圍結果（`DependencyGraph.ts` L202）、只重算受影響節點（`Evaluator.partialRun`）、稠密／稀疏位址策略、`useColumnIndex`、`batch()`。官方效能建議：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/docs/guide/performance.md

### 11.2 公式引擎
- **函數數量：有，自己數的結果如下。**
  - **怎麼數**：寫 Python 腳本掃 `src/interpreter/plugin/*.ts` 中每個 `implementedFunctions: ImplementedFunctions = {…}` 物件的「第一層 key」（用大括號深度配對，支援有引號與無引號 key），共 49 個 plugin 檔。
  - **結果**：369 個不重複的函數 ID，其中 15 個是 `HF.ADD`、`HF.CONCAT` 這類「運算子的函數形式」；另外 `OFFSET` 沒有 plugin、在解析時處理（`FunctionRegistry.ts` L42–L45 列為受保護函數），所以**正式函數共 370 個**（含 HF.*），**類 Excel 函數 355 個**（不含 HF.*）。
  - **交叉驗證**：`src/license/functionCapabilities.ts` 的完整函數目錄我另外抽出 370 個名稱，與上述集合比對，唯一差異就是 `OFFSET` → 數字吻合。
  - **別名**：再掃各 plugin 的 `static aliases`，共 53 個別名（如 `STDEV→STDEV.S`、`TRUNC→ROUNDDOWN`、`NORMDIST→NORM.DIST`）。**連別名一起算是 423 個可呼叫名稱**，這就是官方「400+」說法的來源；只算真正不同的類 Excel 函數則是 355 個。
  - 位置：https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/license/functionCapabilities.ts
- **解析器位置：有**。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/parser/FormulaParser.ts
- **依賴圖／重算位置：有**。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/DependencyGraph/DependencyGraph.ts 、 https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Evaluator.ts#L34-L54 。增量重算 + Tarjan 循環偵測。
- **陣列公式：有（但非 Excel 365 的動態陣列）**。`ARRAYFORMULA`、`ARRAY_CONSTRAIN`、`{1,2;3,4}` 內嵌陣列、`useArrayArithmetic` 全域模式；FILTER／SORT／UNIQUE／SEQUENCE／VSTACK／HSTACK 會溢出到相鄰格。限制：輸出大小須在解析時可確定。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/interpreter/plugin/ArrayPlugin.ts 、 https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/docs/guide/arrays.md
- **跨工作表參照：有**（`Sheet2!A1`、`'庫存'!A1:B10`），3D 參照（`Sheet1:Sheet3!A1`）沒有。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/parser/parser-consts.ts#L15-L19
- **自訂函數：有**。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L493-L550 （`registerFunctionPlugin`／`registerFunction`），不支援非同步。

### 11.3 編輯操作
- **儲存格編輯：有（API 層）**，`setCellContents` 接受單值或二維陣列；畫面上的編輯器沒有。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L1480-L1484
- **複製貼上：部分有**。引擎內部 `copy/cut/paste` 會正確位移公式參照；但**不讀寫系統剪貼簿**，無法直接從 Excel／Google 試算表貼上，要你在 UI 自行解析剪貼簿 TSV 後寫入（`docs/guide/clipboard-operations.md` 明載「stored as a memory reference, not directly in the system clipboard」）。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/ClipboardOperations.ts#L74-L100
- **拖拉填滿：部分有**。沒有拖拉 UI，但 `getFillRangeData(source, target)` 會回傳要填的內容（公式參照自動位移）；不會自動推算數列（1,2,3…遞增）—— 依程式碼只做循環複製。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L2836-L2857
- **復原／重做：有**，含結構操作（增刪列欄、搬移、排序）。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/UndoRedo.ts#L500-L760

### 11.4 格式
- **數字格式：沒有（儲存格層級）**。只有 `TEXT()` 函數的格式字串，以及 `getCellValueFormat()` 回報輸入時偵測到的格式（如貨幣）。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/format/format.ts#L10-L37
- **條件格式：沒有**。
- **合併儲存格：沒有**。
- **凍結窗格：沒有**（UI）。
- **欄寬列高：沒有**（UI）。
- **篩選：沒有 UI**；公式層有 `FILTER()`、`D*` 資料庫函數（`DSUM` 等）。
- **排序：部分有**。`setRowOrder`／`setColumnOrder` 依你提供的排列重排並修正公式（https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L1623 ），排序比較邏輯要你自己寫；公式層有 `SORT()`。
- **資料驗證（下拉選單）：沒有**。

### 11.5 圖表、樞紐、圖片
- **圖表：沒有**。
- **樞紐分析：沒有**（可用 `SUMIFS`／`COUNTIFS`／`UNIQUE` 自己組）。
- **圖片／附件：沒有**（`HYPERLINK()` 有，可用 `getCellHyperlink` 取得網址）。

### 11.6 匯入匯出
- **.xlsx：沒有（開源版也沒有，商業版也沒有）**。官方建議接 ExcelJS 或 SheetJS（xlsx），範例只搬「值與公式」，格式不保留。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/docs/guide/file-import.md
- **.csv：沒有內建**，建議用 PapaParse 等解析後 `buildFromArray`；匯出用 `getSheetValues()` 自己串 CSV。
- **保真度**：只到「值 + 公式」層級；顏色、格式、合併、圖表全部會遺失（因為引擎根本不存這些）。

### 11.7 多人即時協作
- **沒有**。無 OT／CRDT／鎖定，也不需要伺服器。一個 HyperFormula 實例只處理一個活頁簿。若要多人，需自行用 Firestore 監聽（`onSnapshot`）把別人改的格子 `setCellContents` 進本機引擎，衝突處理自己做。

### 11.8 資料模型與存進 Firestore
- **資料模型：有，非常簡單**。`Sheet = RawCellContent[][]`、`Sheets = Record<string, Sheet>`，`RawCellContent = Date | string | number | boolean | null | undefined`；字串以 `=` 開頭就是公式。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Sheet.ts#L12-L14 、 https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/CellContentParser.ts#L25
- 範例（`getAllSheetsSerialized()` 的輸出長相）：
  ```json
  {
    "庫存": [
      ["品名", "數量", "單價", "小計"],
      ["綠茶", 120, 18, "=B2*C2"],
      ["紅茶", 80, 20, "=B3*C3"],
      ["合計", null, null, "=SUM(D2:D3)"]
    ],
    "設定": [["稅率", 0.05]]
  }
  ```
- **存進 Firestore 的坑：Firestore 不能直接存「陣列裡的陣列」**（一般 Firestore 規則，非本 repo 內容）。建議三種存法：
  1. 整張表 `JSON.stringify` 存成一個字串欄位（簡單，1 MB 文件上限內適用）；
  2. 轉成 `{ r0: [...], r1: [...] }` 的 map；
  3. 每列一個文件（`sheets/庫存/rows/{rowIndex}`），配合 `valuesUpdated` 只更新變動的列。
  - 只需存「原始內容（含公式字串）」，算出來的值每次載入由引擎重算即可。命名運算式另用 `getAllNamedExpressionsSerialized()` 存。

### 11.9 手機／觸控、繁體中文介面
- **手機／觸控：不適用（無 UI）**；引擎本身可在手機瀏覽器跑（`browserslist` 包含 iOS Safari、Android Chrome）。觸控體驗取決於你搭配的表格 UI。
- **繁體中文介面：沒有**。內建 18 個語言包（csCZ、daDK、deDE、enGB、enUS、esES、fiFI、frFR、huHU、idID、itIT、nbNO、nlNL、plPL、ptPT、ruRU、svSE、trTR），無中文；只影響函數名稱與錯誤訊息，可自寫 zhTW 包。儲存格內容中文完全沒問題。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/i18n/TranslationPackage.ts#L11-L16

### 11.10 嵌入純 JavaScript 網頁
- **可以，不需要 React／Vue**。CDN 版會暴露全域變數 `HyperFormula`（`docs/guide/client-side-installation.md`）。
- **套件大小：未確認**（repo 無編譯產物；官方文件說「a few hundred kB」）。
- 最小可用範例（約 30 行，可直接存成 .html 開啟；版本號請鎖定）：
  ```html
  <script src="https://cdn.jsdelivr.net/npm/hyperformula@3.5.0/dist/hyperformula.full.min.js"></script>
  <table id="t" border="1"></table>
  <script>
    const hf = HyperFormula.buildFromSheets({
      '報價': [
        ['品名', '數量', '單價', '小計'],
        ['綠茶', 10, 18, '=B2*C2'],
        ['紅茶', 5, 20, '=B3*C3'],
        ['合計', '', '', '=SUM(D2:D3)'],
      ],
    }, { licenseKey: 'gpl-v3', dateFormats: ['YYYY/MM/DD'] });
    const sheet = hf.getSheetId('報價');

    function render() {
      const { height, width } = hf.getSheetDimensions(sheet);
      let html = '';
      for (let r = 0; r < height; r++) {
        html += '<tr>';
        for (let c = 0; c < width; c++) {
          const v = hf.getCellValue({ sheet, row: r, col: c });
          const raw = hf.getCellSerialized({ sheet, row: r, col: c });
          html += `<td contenteditable data-r="${r}" data-c="${c}" title="${raw ?? ''}">${v ?? ''}</td>`;
        }
        html += '</tr>';
      }
      document.getElementById('t').innerHTML = html;
    }
    document.getElementById('t').addEventListener('focusout', (e) => {
      const { r, c } = e.target.dataset;
      const text = e.target.innerText.trim();
      hf.setCellContents({ sheet, row: +r, col: +c }, text === '' ? null : text);
    });
    hf.on('valuesUpdated', render);   // 任何重算都重畫
    render();
  </script>
  ```
  （此範例依本 repo 的 API 簽名與官方範例撰寫，我未實際在瀏覽器執行；點進格子會看到算好的值，若要編輯公式可把 `title` 的原始內容帶進編輯狀態。）

### 11.11 API／事件
- **監聽變更：有**。`hf.on('valuesUpdated', (changes) => …)`，`changes` 是 `ExportedCellChange[]`（含 `address`、`newValue`，有 `row/col/sheet/value` getter）。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Exporter.ts#L23-L45
- **用程式讀寫儲存格：有**，這正是它的主要用途。每個寫入 API 也直接回傳變更清單，不一定要用事件。https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/HyperFormula.ts#L866-L1000
- **追蹤公式來源：有**，`getCellPrecedents`／`getCellDependents`，可做「這個售價是從哪些格子算來的」說明。

---

## 關鍵字
HyperFormula、Handsontable、Handsoncode、無介面試算表、headless spreadsheet、公式引擎、formula engine、Excel 公式、Excel formulas、試算表、網頁版 Excel、依賴圖、dependency graph、增量重算、incremental recalculation、拓樸排序、Tarjan、chevrotain、公式解析器、formula parser、AST、自訂函數、custom functions、FunctionPlugin、命名運算式、named expressions、復原重做、undo redo、陣列公式、ARRAYFORMULA、跨工作表參照、VLOOKUP、XLOOKUP、SUMIFS、財務函數、PMT、IRR、XIRR、成本計算、毛利試算、比價表、報價單、價目表查價、useColumnIndex、ExcelJS、SheetJS、xlsx 匯入、CSV、Firebase、Firestore、純 JavaScript、CDN、jsDelivr、TypeScript、Node.js、GPL-3.0、雙授權、dual license、商業授權、licenseKey gpl-v3、#LIC!、MCP、Claude Skill、Claude Code、handsontable-skills、AI 精確計算、deterministic compute、LLM 工具
