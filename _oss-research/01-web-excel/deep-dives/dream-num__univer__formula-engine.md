# dream-num/univer｜深入：公式引擎
> 深入分析｜掃描日期：2026-11-04｜commit：c13b042｜總覽資料包：_oss-research/01-web-excel/dream-num__univer.md

> 範圍：以 `packages/engine-formula`（`@univerjs/engine-formula` 1.3.1，Apache-2.0）為主，旁及把引擎接上試算表的 `packages/sheets-formula`、負責 Web Worker 通訊的 `packages/rpc`，以及引擎借用的 `packages/core`（R-tree、計算設定）。所有連結固定在 commit `c13b042d18c80c8348fbe52da445d68435febbca`。我只讀程式碼，沒有安裝、建置或執行任何東西；凡是「實際跑起來會怎樣」而我沒驗證的，都標「未實測」或「未確認」。

---

## 重點結論（5–10 點）

1. **整條管線是手寫的，不靠解析器產生器。** 公式字串 → `LexerTreeBuilder` 逐字元狀態機切成巢狀 `LexerNode` → 用調度場演算法（shunting-yard）把每一層改成後序（逆波蘭）→ `AstTreeBuilder` 用 10 個節點工廠組成 AST → `Interpreter` 後序走訪求值。只有 `IF`、`IFERROR` 會短路（只算走到的那一邊）。
2. **依賴管理用「空間索引」，不是傳統的格子連格子圖。** 每條公式把「我讀了哪些矩形範圍」登記進 R-tree（`rbush`，單格另用 `kdbush`）；有格子被改，就拿改動範圍去 R-tree 查交集，找出要重算的公式，再用 DFS 排順序、用 Kosaraju 演算法找循環群組。
3. **支援 Excel 式反覆運算（循環參照）**：每本活頁簿可設 `iterativeCalculation`、`maxIterations`（預設 100，上限 32767）、`maxChange`（預設 0.001），跟 Excel 預設一致。依同批 HyperFormula 資料包，HyperFormula 不支援、只會給 `#CYCLE!`。
4. **函數數量（我自己數）：538 個註冊項目 = 532 個使用者能在公式裡打的名稱 + 6 個引擎內部用的項目（加減乘除、比較運算與多區域聯集）。** 其中 21 個是佔位類別、一律回 `#N/A`，**真正有計算邏輯的是 511 個**；有 UI 說明文字的是 528 個。
5. **動態陣列做得相當完整**：FILTER、SORT、SORTBY、UNIQUE、SEQUENCE、VSTACK、HSTACK、TAKE、DROP、XLOOKUP，LAMBDA／LET／MAP／REDUCE／SCAN／BYROW／BYCOL／MAKEARRAY，甚至 GROUPBY、PERCENTOF；溢出（spill）被擋住會出 `#SPILL!`。**但 `A1#` 溢出範圍參照只會解析、不會求值（回 `#VALUE!`，程式註解寫 todo）**。
6. **跨工作表參照齊全**：`Sheet2!A1`、`'庫存 表'!A1:B9`、3D 參照 `Sheet1:Sheet3!A1`（HyperFormula 沒有）、外部活頁簿 `[Book1.xlsx]Sheet1!A1`（真正讀外部檔要自己寫載入器）。改工作表名稱會自動改寫公式，刪工作表變 `#REF!`。
7. **自訂函數兩條路**：(a) `univerAPI.getFormula().registerFunction('DISCOUNT', (價格, 折數) => …)`，參數是 JS 原生值、可回傳二維陣列（會溢出），另有 `registerAsyncFunction` 可以在公式裡 `await fetch()`；(b) 繼承 `BaseFunction` 寫類別，用 `function` 設定註冊，能拿到參照物件、地區設定等進階資訊。同名會直接覆蓋內建函數。
8. **Web Worker 是官方內建模式**：主執行緒設 `notExecuteFormula: true`＋`UniverRPCMainThreadPlugin`，Worker 裡跑一份完整活頁簿副本與引擎。**最大的坑：Worker 模式下，主執行緒 `registerFunction` 的自訂函數不會送進 Worker，程式直接丟錯**，自訂函數必須寫在 Worker 端。
9. **給你的實用結論**：要「網頁 Excel＋完整公式」就用 Univer 全套（Apache-2.0，商用友善）；只想在倉儲 App 裡算成本／售價，可照官方整合測試的寫法「不開 UI、只跑引擎」，或直接複製 `basics/financial.ts` 裡零依賴的 `calculatePMT`、`calculateNpv` 等純函數。

---

## 逐題詳解（每個問題一節，附 permalink 與必要的短程式碼摘錄）

> **先講白話名詞**：lexer（詞法分析）＝把 `=SUM(A1:B2)*2` 切成「SUM、(、A1:B2、)、*、2」這些詞；parser（語法分析）＝決定先算什麼後算什麼；AST（抽象語法樹）＝排好順序的「計算步驟樹」；依賴圖＝記錄「哪一格的公式引用了哪些格」，改一格時才知道要連帶重算誰；動態陣列＝一條公式吐出一整片結果、自動「溢出」到旁邊的格子。

### 1. engine-formula 的 lexer／parser／AST

**整體流程**

```
"=SUM(A1:B2)*2"
  │ Lexer.treeBuilder()                 engine/analysis/lexer.ts
  ▼
LexerTreeBuilder._nodeMaker()  逐字元狀態機 → 巢狀 LexerNode（R_1 根、P_1 參數、函數名）
  ▼
_suffixExpressionHandler()     調度場：每層改成後序
  ▼
AstTreeBuilder.parse()          10 個節點工廠 → AST              engine/analysis/parser.ts
  ▼
Interpreter.execute()           後序走訪求值                      engine/interpreter/interpreter.ts
```

- **入口**：[lexer.ts#L24-L50](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/lexer.ts#L24-L50)。沒有定義名稱時直接交給 `LexerTreeBuilder`；有的話把 `getValueByName`、`hasFunction` 等回呼一起帶進去，在詞法階段就把定義名稱展開。
- **詞法（狀態機）**：[lexer-tree-builder.ts#L1571-L1700](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/lexer-tree-builder.ts#L1571-L1700)。`while (cur < charsCount)` 一個字元一個字元看，靠一組狀態欄位判斷意義：括號堆疊、大括號、單／雙引號、LAMBDA、冒號、表格結構化參照 `Table1[[#All],[欄1]]`（欄位定義在 [L99-L131](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/lexer-tree-builder.ts#L99-L131)）。`#N/A`、`#REF!` 這類錯誤值也在這裡辨識。檔案共 2,562 行，是整個引擎最複雜的一塊。
- **快取**：[L82-L86](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/lexer-tree-builder.ts#L82-L86) 兩個 2,000 筆 LRU；[treeBuilder L712-L788](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/lexer-tree-builder.ts#L712-L788) 裡含 `LET(`、`LAMBDA(` 的公式不快取（因為解析時會改寫樹）。
- **運算子優先序**：[token.ts#L41-L54](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/basics/token.ts#L41-L54)，數字越小越優先：`^`(0) ＞ `* /`(1) ＞ `+ -`(2) ＞ `&`(3) ＞ 比較運算(4)，與 Excel 順序相同。
- **轉後序**：[lexer-tree-builder.ts#L987-L1059](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/lexer-tree-builder.ts#L987-L1059)，標準調度場。核心只有幾行：

```ts
// lexer-tree-builder.ts L1022-L1035（節錄；中文註解為本文所加）
const lastSymbolPriority = OPERATOR_TOKEN_PRIORITY.get(lastSymbol);
const charPriority = OPERATOR_TOKEN_PRIORITY.get(char);
if (charPriority >= lastSymbolPriority) {
    baseStack.push(symbolStack.pop()!);   // 同級也先彈出 → 左結合
} else { break; }
symbolStack.push(node as string);
```

  因為同級用 `>=` 彈出，`^` 是左結合（`2^3^2` 應為 64，與 Excel 一致；依程式推論，未實測）。
- **建 AST**：[parser.ts#L187-L363](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/parser.ts#L187-L363)。拿後序序列用一個 `calculateStack` 疊：遇到運算子就彈出兩個子節點掛上去。`LET` 會先被改寫成 `LAMBDA`（[L144-L184](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/parser.ts#L144-L184)，註解寫明「兩者行為相同，只保留一種計算」）。節點工廠清單在 [L423-L436](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/parser.ts#L423-L436)，依 zIndex（[node-type.ts#L17-L44](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/node-type.ts#L17-L44)）由小到大逐一嘗試：Lambda → Lambda 參數 → Union（`:`）→ Prefix（`-`、`@`）→ Suffix（`%`、`#`）→ Function → Reference → Operator → Value → Root；全都不認得就變 `#NAME?`。
- **AST 快取**：[generate-ast-node.ts#L31-L94](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/utils/generate-ast-node.ts#L31-L94)，key＝`活頁簿:工作表:位移X:位移Y:公式字串`，5,000 筆 LRU；定義名稱或表格變動時強制重建。
- **錯誤值**：共 12 種，除了 Excel 常見的 `#DIV/0!`、`#N/A`、`#REF!`、`#VALUE!`、`#NAME?`、`#NUM!`、`#NULL!`、`#SPILL!`、`#CALC!`，還有自家的 `#CYCLE!`、`#ERROR!` 與 `#GETTING_DATA`（列舉註解寫「connected to remote」，但我在引擎程式碼裡沒找到產生它的地方，只有 UI 的提示對照表用到）（[error-type.ts#L17-L47](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/basics/error-type.ts#L17-L47)）。
- **求值**：[interpreter.ts#L132-L212](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/interpreter/interpreter.ts#L132-L212) 先遞迴算子節點、再算自己，每個節點前檢查 `isStopExecution()`（所以能中途停止）。IF／IFERROR 短路在 [L234-L252](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/interpreter/interpreter.ts#L234-L252)。只要樹裡有非同步函數，就改走 `executeAsync` 整棵 await。
- **現成的公式工具 API**（engine-formula facade）：`moveFormulaRefOffset('=SUM(A1,B2)',1,1)` 複製公式時位移參照（[f-formula.ts#L110-L112](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/facade/f-formula.ts#L110-L112)）、`sequenceNodesBuilder()` 切 token 可做語法上色（[L126-L128](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/facade/f-formula.ts#L126-L128)）、`getFormulaExpressTree()` 拆出子運算式樹（[L739-L741](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/facade/f-formula.ts#L739-L741)）。後者配上 `executeFormulas()`（[L333-L336](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/facade/f-formula.ts#L333-L336)，可一次算多個子運算式）很適合做「讓 Claude 解說這條公式每一段算出什麼」。

### 2. 依賴圖與增量重算

**資料結構**

- 每條公式＝一個 `FormulaDependencyTree`（[dependency-tree.ts#L290-L338](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/dependency-tree.ts#L290-L338)），記公式字串、所在位置，以及 `rangeList`（它讀了哪些範圍）。
- `DependencyManagerService` 把 `rangeList` 用 `bulkInsert` 塞進 R-tree（[dependency-manager.service.ts#L166-L183](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/dependency-manager.service.ts#L166-L183)），查詢就是 `bulkSearch`（[L134-L136](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/dependency-manager.service.ts#L134-L136)）。它用 `new RTree(true)` 開啟單格快取（[L236-L239](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/dependency-manager.service.ts#L236-L239)）。
- `RTree` 本體在 core：[r-tree.ts#L17-L69](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/r-tree.ts#L17-L69)，每本活頁簿每張表各一棵 `rbush`，單格參照另放 `kdbush`。

**一次重算的六個步驟**（`FormulaDependencyGenerator.generate()`，[formula-dependency.ts#L147-L232](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L147-L232)）

1. **登記所有公式**（[L695-L765](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L695-L765)）：共用公式（同一個 `si`，例如整欄往下拉的 `=B2*C2`）只有第一格完整建立，其餘建「虛擬 tree」共用 AST 並跳過範圍計算（[L355-L434](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L355-L434)）。範圍靠「預先執行參照節點」取得（[L962-L995](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L962-L995)）；`OFFSET`、`INDIRECT`、`INDEX` 這類位址函數會先算出實際範圍，登記到另一棵專用 R-tree。
2. **找出受影響公式**（[L465-L512](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L465-L512)）：用這次的 dirty ranges 查 R-tree；另外 `_includeTree`（[L1293-L1365](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L1293-L1365)）讓揮發性函數每次都算——清單只有 RAND、RANDBETWEEN、NOW、TODAY（[token-type.ts#L33](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/basics/token-type.ts#L33)）——以及定義名稱、工作表增刪等情況。
3. **排順序**（[L532-L596](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L532-L596)）：用堆疊做 DFS，沿著「誰依賴我」一路往下走，產生執行清單。
4. **找循環**：[dependency-groups.ts#L17-L82](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/dependency-groups.ts#L17-L82)，迭代版 Kosaraju 求強連通元件（避免遞迴爆堆疊），「被依賴的先算」；成員超過一個或自我參照的群組標成 `cycleGroup`。
5. **執行**：`_apply`（[calculate-formula.service.ts#L394-L536](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/calculate-formula.service.ts#L394-L536)）依序算；循環群組交給 `_iterateCalculationGroup`（[L128-L203](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/calculate-formula.service.ts#L128-L203)）反覆算，直到每格變化 ≤ `maxChange` 或次數用完。設定預設值在 [calculation-settings.ts#L17-L61](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/calculation-settings.ts#L17-L61)。
6. **溢出後補算第二輪**：`_executeStep`（[L288-L313](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/calculate-formula.service.ts#L288-L313)）把陣列公式新溢出的範圍當成 dirty range 再跑一次，讓引用溢出格的公式也更新。

**查詢依賴（追蹤前導／從屬儲存格）**：facade 提供 `getCellDependencyTree({unitId, sheetId, row, column})`（某格公式引用誰、被誰引用，[f-formula.ts#L455-L458](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/facade/f-formula.ts#L455-L458)）、`getRangeDependents(範圍)`（哪些公式依賴這塊範圍，[L518-L521](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/facade/f-formula.ts#L518-L521)）、`getInRangeFormulas`、`getAllDependencyTrees`。做「刪這欄會影響哪些報表」的提醒，或把依賴關係交給 Claude 解釋，都可以直接用。

**誰觸發重算**：sheets-formula 的 `ActiveDirtyController` 把 `SetRangeValuesMutation`、插刪列欄、搬移範圍、隱藏列等 mutation 轉成 dirty ranges（[active-dirty.controller.ts#L77-L93](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/controllers/active-dirty.controller.ts#L77-L93)）；只改樣式、框線不會觸發。

**白話評估**：「哪些公式要重新求值」是增量的；但依程式碼，每次重算都會把**全部**公式重新登記、重新算一次 `rangeList`（AST 走快取，共用公式可省），所以公式數量非常大時，「分析」這一步本身可能是成本（未實測）。HyperFormula 則是把範圍也做成圖上的節點、維持一張常駐依賴圖（依同批資料包）。

### 3. 函數清單（實際數量與檔案位置，自己數）

**怎麼數**：我寫了一支 Python 腳本（放在 clone 外、用 `python3 -I` 執行），掃 16 個 `functions/<分類>/function-map.ts`，用正規表達式抓 `[類別, FUNCTION_NAMES_X.名稱]`，再對照各分類的 `function-names.ts` 把 enum 換成實際名稱；並用 `grep -c 'FUNCTION_NAMES_'` 逐檔交叉驗證，數字一致。總表是 [functions/index.ts#L37-L56](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/index.ts#L37-L56) 的 `ALL_IMPLEMENTED_FUNCTIONS`。

| 分類（資料夾） | 註冊數 | 說明 |
|---|---|---|
| statistical 統計 | 113 | FORECAST.ETS 系列 4 個是佔位 |
| math 數學 | 82 | SUMIFS、SUMPRODUCT、SEQUENCE、RANDARRAY；ISO.CEILING 佔位 |
| engineering 工程 | 57 | 進位轉換、BESSEL、複數 IM* |
| financial 財務 | 55 | PMT、NPV、IRR、XIRR、PRICE…；AMORDEGRC 佔位 |
| text 文字 | 52 | REGEX 系列、TEXTSPLIT、TEXTBEFORE/AFTER；CALL、REGISTER.ID、PHONETIC、EUROCONVERT 佔位 |
| compatibility 相容 | 38 | NORMDIST 等舊名，大多直接重用統計類別 |
| lookup 查閱 | 38 | XLOOKUP、XMATCH、FILTER、SORT、UNIQUE、VSTACK…；RTD 佔位 |
| date 日期 | 27 | 含 Google 試算表的 EPOCHTODATE、TO_DATE |
| information 資訊 | 25 | ISEMAIL、ISURL、ISBETWEEN 等；INFO、ISOMITTED 佔位 |
| logical 邏輯 | 21 | LAMBDA、LET、MAP、REDUCE、SCAN、BYROW、BYCOL、MAKEARRAY、GROUPBY、PERCENTOF |
| database 資料庫 | 12 | DSUM、DGET 等 D 系列 |
| cube | 7 | 全部佔位 |
| meta（內部） | 6 | PLUS、MINUS、MULTIPLY、DIVIDED、COMPARE 是運算子的實作；CUBE 用來表示 `INDEX((A6:B6,C6:D7),1,1,2)` 這種括號內多區域聯集（[lexer-tree-builder.ts#L1817-L1822](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/analysis/lexer-tree-builder.ts#L1817-L1822)）；都不是給使用者直接打的 |
| web | 3 | ENCODEURL、FILTERXML；WEBSERVICE 佔位 |
| array | 2 | ARRAY_CONSTRAIN、FLATTEN（Google 試算表函數） |
| univer | 0 | 空的保留分類 |
| **合計** | **538** | 使用者可用 532＋內部 6 |

- **佔位**：[not-implemented-function.ts#L22-L29](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/not-implemented-function.ts#L22-L29)，用 `grep -rn "extends NotImplementedFunction"` 數到 21 個 → 532 − 21 = **511 個有實作**。
- **UI 說明**：在 `services/formula/function-list/*.ts`，用 `grep -c 'functionName:'` 數到 528 筆；缺說明的 4 個是 ANCHORARRAY、GROUPBY、PERCENTOF、REGEXTEST（REGEXTEST 在解析時會被換成 REGEXMATCH，[function-node.ts#L553-L565](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/function-node.ts#L553-L565)）。
- **規模**：engine-formula 非測試程式約 10.4 萬行（不含 locale），其中函數實作約 5.2 萬行；`*.spec.ts` 測試檔 569 個（函數資料夾內 476 個）。用 `find … | xargs cat | wc -l` 與 `find -name '*.spec.ts' | wc -l` 數的。
- **對照**：同批 HyperFormula 資料包數出「類 Excel 函數 355 個（不含別名）」。Univer 多出來的主要是 Excel 365 新函數與 Google 試算表獨有函數。

### 4. 陣列與動態陣列公式

- **廣播規則**：[array-value-object.ts#L1781-L1915](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/value-object/array-value-object.ts#L1781-L1915)。兩個陣列做運算（加減乘除、比較、`&` 串接、次方等）時，結果取最大列數 × 最大欄數；1×1 擴成整片、單列往下複製、單欄往右複製，對不上的位置給 `#N/A`，與 Excel 一致。
- **溢出判斷**：[runtime.service.ts#L702-L846](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/runtime.service.ts#L702-L846)。結果是多格陣列或範圍時，記錄 `arrayFormulaRange`（左上角＝公式格），再檢查範圍內是否已有資料、是否超出工作表邊界，任一成立就整個變 `#SPILL!`；1×1 結果直接當單值。
- **溢出值不寫進儲存格本身**：溢出格是讀取時由 `CELL_CONTENT` 攔截器「疊上去」的（[array-formula-cell-interceptor.controller.ts#L59-L101](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/controllers/array-formula-cell-interceptor.controller.ts#L59-L101)），資料存在 `FormulaDataModel` 的 `arrayFormulaCellData`。所以自己直接讀活頁簿快照的 `cellData`，很可能看不到溢出值（推論，未實測），要讀值請用 facade 的 `getValues()`。
- **官方整合測試示範**：`=SORT(A1:A5)` 放在 D1，測試斷言 `D1:D5` 得到排序後五個值（[formua-correctness.spec.ts#L10-L56](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/tests/formula-integration/src/__tests__/formua-correctness.spec.ts#L10-L56)，檔名原文就拼成 formua）。
- **LAMBDA 家族**：[lambda-value-object.ts#L85-L123](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/value-object/lambda-value-object.ts#L85-L123)。LAMBDA 值物件持有 AST 與參數名，被 MAP、REDUCE 等呼叫時把實參塞進私有變數表再求值；自訂 JS 函數也能收 LAMBDA 並用 `executeCustom()` 呼叫（官方範例 [sheets-formula f-formula.ts#L104-L148](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/facade/f-formula.ts#L104-L148)）。
- **舊式 CSE 陣列公式**：`returnsLegacyArrayAsScalar` 旗標（[base-function.ts#L112-L116](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/base-function.ts#L112-L116)）讓頂層舊式陣列函數只寫第一格；目前只有 LINEST 開啟（grep 數到 1 個）。
- **沒做完**：`A1#`（[suffix-node.ts#L80-L114](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/suffix-node.ts#L80-L114) 最後直接回 `#VALUE!` 並註解 `/** todo */`）；`ANCHORARRAY` 只是把參照原樣回傳（[anchorarray/index.ts#L20-L30](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/lookup/anchorarray/index.ts#L20-L30)）。

### 5. 跨工作表參照

- **解析**：[reference.ts#L206-L304](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/utils/reference.ts#L206-L304)。依序剝出 `[活頁簿]`（正則 [regex.ts#L23](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/basics/regex.ts#L23)）、`工作表!`（去引號並把 `''` 還原成 `'`）、範圍本體；`B10:A1` 會被正規化成 `A1:B10`；整欄 `A:A`、整列 `1:1` 有各自型別。
- **中文工作表名**：產生參照時要不要加引號由 `needsQuoting` 決定（[reference.ts#L410-L436](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/utils/reference.ts#L410-L436)），它用 Unicode `\p{Letter}` 判斷，所以 `庫存!B2` 不加引號也算合法；名稱含空白或全形括號（）才需要引號（依程式推論，未實測）。這點比 HyperFormula 友善（同批資料包指出它的中文表名一定要加引號）。
- **名稱→ID**：[base-reference-object.ts#L290-L295](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/reference-object/base-reference-object.ts#L290-L295) 用「工作表名稱→ID」對照表找 ID。參照節點求值時把整本活頁簿資料、執行期結果、溢出資料都塞進參照物件（[reference-node.ts#L104-L160](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/reference-node.ts#L104-L160)），所以讀別張表跟讀本表走同一條路。
- **3D 參照**：[union-node.ts#L46-L111](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/union-node.ts#L46-L111)，`Sheet1:Sheet3!B5:E16` 依工作表順序展開成多區塊參照；測試有 `VSTACK(Sheet1:Sheet3!B5:E16)` 案例（[union-node.spec.ts#L224](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/__tests__/union-node.spec.ts#L224)）。
- **外部活頁簿**：[unit-reference-resolver.service.ts#L57-L117](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/unit-reference-resolver.service.ts#L57-L117)，`[Book1.xlsx]` 會先找同一個 Univer 裡已開啟、名稱相符（忽略副檔名與大小寫）的活頁簿；要讀真正的外部檔，得自己實作 `IFormulaExternalReferenceDataLoader`，內建是什麼都不做的空實作（[external-reference-data-loader.service.ts#L35-L51](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/external-reference-data-loader.service.ts#L35-L51)）。
- **改名／刪表**：[update-formula.controller.ts#L649-L667](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/controllers/update-formula.controller.ts#L649-L667)：改工作表名稱 → 所有引用它的公式字串被改寫；刪工作表 → 變 `#REF!`。所有「參照自動調整」的情境列在 [ref-range-formula.ts#L25-L45](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/controllers/utils/ref-range-formula.ts#L25-L45)（插刪列欄、搬移、改名、定義名稱、表格改名等共 19 種）。

### 6. 自訂函數註冊方式

**A. 最簡單：facade 一行註冊（主執行緒模式）**

```js
const formula = univerAPI.getFormula();
formula.registerFunction('DISCOUNT', (price, pct) => price * (1 - pct / 100), '折扣後售價');
// 儲存格輸入：=DISCOUNT(A1, 20)
```

（改寫自官方註解範例 [sheets-formula f-formula.ts#L78-L103](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/facade/f-formula.ts#L78-L103)；實作在 [L333-L352](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/facade/f-formula.ts#L333-L352)）

- **參數長什麼樣**：範圍會變成二維陣列，單格是數字／字串／布林，LAMBDA 是物件（[function-node.ts#L313-L325](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/function-node.ts#L313-L325)）。
- **回傳**：單值或二維陣列，陣列會溢出（[function-node.ts#L281-L299](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/function-node.ts#L281-L299)）。
- **非同步**：`registerAsyncFunction('PRICE', async (sku) => …)`；函數節點建立時就標成非同步（[function-node.ts#L59-L61](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/function-node.ts#L59-L61)），直譯器整棵改走 await（[interpreter.ts#L49-L71](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/interpreter/interpreter.ts#L49-L71)）。
- **底層**：`RegisterFunctionService` 建一個 `CustomFunction`／`AsyncCustomFunction` 實例，把你的函數放進 `calculateCustom`，同時登記 UI 說明（[register-function.service.ts#L179-L211](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/formula/register-function.service.ts#L179-L211)、[custom-function.ts#L19-L29](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/custom-function.ts#L19-L29)）。`FunctionService.registerExecutors` 用 `Map.set`，**同名直接覆蓋內建**（[function.service.ts#L74-L79](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/function.service.ts#L74-L79)）。
- **名稱請全大寫**：解析時會把函數 token 轉大寫再查表（[function-node.ts#L529-L535](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/function-node.ts#L529-L535)），註冊時卻原樣存；用小寫註冊應該會查不到而出 `#NAME?`（依程式推論，未實測）。官方範例全部用大寫。

**B. 進階：繼承 BaseFunction**

- 照 [math/sum/index.ts#L22-L57](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/math/sum/index.ts#L22-L57) 的樣子寫 `class MyFn extends BaseFunction { minParams = 1; maxParams = 2; calculate(...v) {…} }`，再用引擎設定 `function: [[MyFn, 'MYFN']]` 註冊（[config.ts#L27-L36](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/config/config.ts#L27-L36)、[formula.controller.ts#L135-L147](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/controllers/formula.controller.ts#L135-L147)）。
- 好處是能開旗標拿更多資訊（[base-function.ts#L64-L126](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/base-function.ts#L64-L126)）：`needsReferenceObject`（拿參照而不是值）、`needsLocale`、`needsSheetsInfo`、`needsFilteredOutRows`（像 SUBTOTAL 要忽略被篩掉的列）、`needsAstChildren`（自己控制子節點何時求值）。
- 函數提示文字另外用 `UniverSheetsFormulaPlugin` 的 `description` 設定登記（[sheets-formula plugin.ts#L115-L117](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/plugin.ts#L115-L117)）。

**對你「查價」情境的提醒**：自訂函數不是揮發性函數，只有參數格改變時才重算。若 `=PRICE("SKU001")` 要從 Firestore 抓最新價格，資料更新後要呼叫 `univerAPI.getFormula().executeCalculation()` 強制全部重算（[engine-formula f-formula.ts#L144-L146](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/facade/f-formula.ts#L144-L146)）。

### 7. Web Worker 計算

**怎麼接（照官方 preset）**

- 主執行緒：[preset-sheets-core/src/preset.ts#L107-L163](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/preset.ts#L107-L163)。有 `workerURL` 就掛 `UniverRPCMainThreadPlugin`，並把 `UniverFormulaEnginePlugin`、`UniverSheetsPlugin`、`UniverSheetsFormulaPlugin` 都設 `notExecuteFormula: true`。
- Worker 檔：[preset-sheets-core/src/worker.ts#L31-L43](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/worker.ts#L31-L43)。Worker 裡另開一個 `Univer`，掛 `UniverSheetsPlugin`（只註冊公式相關 mutation）、`UniverFormulaEnginePlugin`（**自訂函數 `function` 放這裡**）、`UniverRPCWorkerThreadPlugin`、`UniverRemoteSheetsFormulaPlugin`。

**底層機制**

- 通訊就是 `postMessage` 包成 RxJS Observable（[web-worker-rpc.service.ts#L24-L57](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/rpc/src/services/rpc/implementations/web-worker-rpc.service.ts#L24-L57)）。
- `DataSyncPrimaryController` 在活頁簿建立時把**整份快照**送進 Worker，之後每個登記過的 mutation 依序轉送（[data-sync-primary.controller.ts#L40-L120](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/rpc/src/controllers/data-sync/data-sync-primary.controller.ts#L40-L120)）。也就是 Worker 有完整副本，記憶體大約多一份（推論）。
- `notExecuteFormula` 時，主執行緒根本不註冊 Lexer／Parser／Interpreter（[engine plugin.ts#L132-L207](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/plugin.ts#L132-L207)），所以主執行緒很輕。
- **就算不開 Worker 也不會整個卡死**：每算 `intervalCount`（預設 500）條公式，用 `MessageChannel` 讓出一次事件迴圈（[calculate-formula.service.ts#L439-L468](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/calculate-formula.service.ts#L439-L468)、[request-immediate-macro-task.ts#L17-L47](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/common/request-immediate-macro-task.ts#L17-L47)），讓「停止計算」等訊息插得進來；進度用 `calculationProcessing` 事件回報。
- 篩選（隱藏列）資訊不在 Worker 裡，每次開算由主執行緒附上（[trigger-calculation.controller.ts#L152-L171](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/controllers/trigger-calculation.controller.ts#L152-L171)）。

**坑**

1. 主執行緒 `registerFunction` 的函數不會進 Worker：Worker 端 `RemoteRegisterFunctionService` 收到就丟錯「Remote custom function registration is disabled because function deserialization over RPC is unsafe」（[remote-register-function.service.ts#L29-L58](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/services/remote/remote-register-function.service.ts#L29-L58)）；`RegisterFunctionMutation` 還在，但 handler 只是 `() => true`（[register-function.mutation.ts#L20-L39](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/commands/mutations/register-function.mutation.ts#L20-L39)）。
2. `packages/rpc/README.md` 指向的 `examples/src/sheets-mobile/worker.ts`、`packages/rpc-node/README.md` 指向的 `examples/src/node/sdk/worker.ts`，在這個 commit 的完整檔案清單裡都不存在；照抄請以 preset 那兩個檔為準。
3. Node.js 端有對應的 `@univerjs/rpc-node`（worker_threads），可以在伺服器上分執行緒算（只讀了 README，未實測）。

### 8. 跟 HyperFormula、IronCalc 的差異

> 資料來源說明：Univer 欄是本次逐行確認。HyperFormula 欄引用同批資料包 `_oss-research/01-web-excel/handsontable__hyperformula.md`（commit 187dfa1，該包附 permalink），我沒有重讀它的原始碼。IronCalc 依本次規則不能下載，只能寫一般公開資訊，**整欄都是未確認**，請以官方 repo 為準。

| 項目 | Univer engine-formula | HyperFormula | IronCalc |
|---|---|---|---|
| 語言／執行 | TypeScript；瀏覽器、Node | TypeScript；瀏覽器、Node | Rust，編成 WebAssembly；另有 Python 綁定（未確認） |
| 授權 | Apache-2.0 | GPL-3.0 或商業授權，需填 `licenseKey: 'gpl-v3'` | MIT／Apache-2.0 雙授權（未確認） |
| 定位 | Univer 全套的一部分，吃 Univer 的資料模型與依賴注入 | 獨立無介面引擎，表格 UI 自備；可直接丟二維陣列 | 引擎＋.xlsx 讀寫，另有自己的網頁 UI（未確認） |
| 解析器 | 手寫逐字元狀態機＋調度場 | chevrotain 產生；相對位址 hash 共用 AST | 未確認 |
| 依賴／重算 | R-tree 空間索引＋每次 DFS 與 Kosaraju | 常駐依賴圖（含範圍節點）＋拓樸排序 | 未確認 |
| 循環參照 | 支援反覆運算 | 不支援，出 `#CYCLE!` | 未確認 |
| 函數數 | 自數 532（有實作 511） | 資料包數 355（不含別名） | 未確認 |
| 動態陣列 | 有（缺 `A1#`） | 有，但輸出大小須在解析時確定 | 未確認 |
| 3D 參照 | 有 | 沒有 | 未確認 |
| 多活頁簿互相參照 | 有（`[Book]Sheet!A1`） | 不支援（資料包引用官方 known-limitations） | 未確認 |
| 表格結構化參照 `Table1[欄]` | 有（[reference-node.ts#L363-L379](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/reference-node.ts#L363-L379)） | 不支援 | 未確認 |
| SUBTOTAL 忽略隱藏列 | 有（`needsFilteredOutRows`，[base-function.ts#L97-L100](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/base-function.ts#L97-L100)） | 不會忽略 | 未確認 |
| 非同步函數 | 有 | 沒有 | 未確認 |
| Web Worker | 內建 RPC 模式 | 資料包未提到內建模式，應需自行包裝（未確認） | WASM 可放 Worker（未確認） |
| .xlsx 匯入匯出 | 開源 repo 沒有（我在檔案清單搜 exchange、xlsx 無結果） | 沒有 | 有（未確認） |

**白話怎麼選**

- 要的是「整個網頁版 Excel」→ Univer，公式與 UI、協作模型一體。
- 只要一顆乾淨、API 單純的計算核心塞進自己的表格 → HyperFormula 最好接，但 GPL 對「網頁散布」有義務，商用要想清楚。
- 要在伺服器端大量處理真正的 .xlsx → IronCalc 值得研究。同批資料包 `genspark-ai__genoffice.md` 記錄了一個實例：編輯時用 Univer 引擎在瀏覽器算，大檔改交 IronCalc（Rust）重算——這就是一種 A＋B 混搭。

---

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. `packages/engine-formula/src/plugin.ts`：看 `notExecuteFormula` 開關讓哪些服務只在「真的要算的那一端」註冊（L132-L207）。先建立全局地圖。
2. `services/calculate-formula.service.ts`：`execute()` → `_executeStep()` → `_apply()`，這是每次重算的主迴圈；順便看反覆運算 `_iterateCalculationGroup`。
3. `engine/utils/generate-ast-node.ts`：AST 快取與「字串 → AST」的總入口。
4. `engine/analysis/lexer.ts` → `lexer-tree-builder.ts`：先看 `treeBuilder`（L712）與 `_suffixExpressionHandler`（L987），`_nodeMaker` 很長，建議搭配 `engine/analysis/__tests__/lexer-tree-builder.spec.ts` 的範例一起讀。
5. `engine/analysis/parser.ts`：`_parse` 怎麼把後序序列疊成樹、LET 怎麼變 LAMBDA。
6. `engine/ast-node/`：`function-node.ts`（參數怎麼傳給函數、自訂函數怎麼包）、`reference-node.ts`、`union-node.ts`（冒號與 3D 參照）、`operator-node.ts`。
7. `engine/interpreter/interpreter.ts`：後序求值與 IF 短路，不到 500 行。
8. `engine/value-object/`：`base-value-object.ts`、`primitive-object.ts`、`array-value-object.ts`，理解錯誤值傳遞與陣列廣播。
9. `engine/reference-object/base-reference-object.ts`：範圍怎麼讀格子、怎麼處理跨表。
10. `engine/dependency/formula-dependency.ts` ＋ `dependency-groups.ts` ＋ `services/dependency-manager.service.ts` ＋ core 的 `shared/r-tree.ts`：依賴分析全貌。
11. `services/runtime.service.ts`：`setRuntimeData` 的溢出與 `#SPILL!`。
12. `functions/base-function.ts`，再挑三個函數看：`math/sum`（最簡單）、`lookup/xlookup` 或 `lookup/filter`（陣列）、`financial/pmt`（呼叫 `basics/financial.ts` 純函數），每個資料夾都有 `__tests__`。
13. `packages/sheets-formula/src/`：`controllers/active-dirty.controller.ts`（誰觸發重算）、`controllers/update-formula.controller.ts`（插刪列欄、改表名時改寫公式）、`facade/f-formula.ts`（registerFunction）。
14. Worker：`presets/packages/preset-sheets-core/src/preset.ts`、`worker.ts`，再看 `packages/rpc/src/`。
15. 最後看 `tests/formula-integration/src/__testing__/univer.ts`：不開 UI 只跑引擎的最小範例。

---

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 可借用的部分 | 位置 | 依賴 | 難度 | 怎麼接 |
|---|---|---|---|---|
| 整顆引擎「無 UI」模式 | [tests/formula-integration/src/__testing__/univer.ts#L14-L42](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/tests/formula-integration/src/__testing__/univer.ts#L14-L42) | `@univerjs/core`、`sheets`、`engine-formula`、`sheets-formula`、rxjs | 低 | 註冊三個插件 → `api.createWorkbook(快照)` → `await getFormula().onCalculationResultApplied()` → `getRange().getValues()`。可放瀏覽器或 Node（例如 Firebase Functions）批次算成本／售價表；套件體積與冷啟動時間未實測 |
| 財務純函數 | [basics/financial.ts#L217-L277](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/basics/financial.ts#L217-L277) | `calculatePMT`、`calculateFV`、`calculateIPMT`、`calculateNpv` 零依賴（檔案其他函數用到 core 日期工具） | 極低 | 直接複製到倉儲 App 做分期、投資回收試算；保留 Apache-2.0 版權聲明 |
| 循環偵測／分組 | [dependency-groups.ts#L17-L82](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/dependency-groups.ts#L17-L82) | 無（約 60 行泛型函數） | 極低 | 任何有依賴關係的計算都能用：BOM 物料展開、成本分攤、多層加價規則，用來排順序並抓出互相引用 |
| 範圍依賴索引 | [core r-tree.ts#L17-L69](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/r-tree.ts#L17-L69) | `rbush`、`kdbush` | 低～中 | 整檔搬走；用在「改了哪幾格 → 哪些計算欄位要更新」的影響分析 |
| 不卡畫面的長計算 | [request-immediate-macro-task.ts#L17-L47](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/common/request-immediate-macro-task.ts#L17-L47) ＋ 主迴圈 [L439-L468](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/calculate-formula.service.ts#L439-L468) | 無 | 極低 | 每處理 N 筆就 await 一次，倉儲大量匯入時 UI 不凍結 |
| 公式解析＋參照位移 | `LexerTreeBuilder`（2,562 行） | `@univerjs/core` 的 Tools、範圍工具 | 中 | 想在自己的欄位支援 `=數量*單價`：小需求請 Claude Code 參考調度場段落重寫；要完整 Excel 語法就整顆引擎一起用，硬拆不划算 |
| 查表加速 | [inverted-index-cache.ts#L56-L76](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/basics/inverted-index-cache.ts#L56-L76) | `@flatten-js/interval-tree` | 中 | 依欄建「值 → 列號」倒排索引，大價目表 VLOOKUP／MATCH 加速的思路可參考 |
| 單一函數移植 | `functions/<分類>/<函數>/index.ts`＋`__tests__` | value-object 系統（`array-value-object.ts` 2,072 行、`primitive-object.ts` 1,692 行等） | 中 | 移植到別的引擎時只取計算核心，再接自己的型別；`__tests__` 的期望值可直接當驗收資料 |
| 自訂查價函數 | facade `registerAsyncFunction`；Worker 模式改寫成 `AsyncCustomFunction` 子類別放 Worker 端 `function` 設定 | 引擎本身 | 低（主執行緒）／中（Worker） | `=PRICE(料號)` 讀 Firestore；Worker 端寫法依程式推論可行，未實測 |
| 公式解說給 Claude | `getFormulaExpressTree` ＋ `executeFormulas` ＋ `getCellDependencyTree` | 引擎本身 | 低 | 把公式拆成子運算式、各自算出值、加上前導／從屬格，一起丟給 Claude 產生白話解說或除錯建議 |

**草稿 A：不開畫面、只用引擎算一張成本表**（照官方測試檔 [univer.ts#L14-L42](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/tests/formula-integration/src/__testing__/univer.ts#L14-L42) 與 [formua-correctness.spec.ts#L10-L56](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/tests/formula-integration/src/__tests__/formua-correctness.spec.ts#L10-L56) 改寫；我沒有執行過，**未實測**）

```ts
import { LocaleType, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import zhCN from '@univerjs/sheets/locale/zh-CN';      // 測試檔用簡中語系；繁中語系檔各套件另有提供
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-formula/facade';

const univer = new Univer({ locale: LocaleType.ZH_CN, locales: { [LocaleType.ZH_CN]: zhCN } });
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverSheetsPlugin);
univer.registerPlugin(UniverSheetsFormulaPlugin);
const api = FUniver.newAPI(univer);

const wb = api.createWorkbook({
    id: 'cost', name: '成本試算', sheetOrder: ['s1'],
    sheets: { s1: { id: 's1', name: '成本', rowCount: 100, columnCount: 10, cellData: {
        0: { 0: { v: 120 }, 1: { v: 0.05 }, 2: { f: '=ROUND(A1*(1+B1),0)' } },   // 進價、加成、售價
    } } },
});
await api.getFormula().onCalculationResultApplied();
console.log(wb.getActiveSheet().getRange('C1').getValues());   // 預期 [[126]]
univer.dispose();
```

**草稿 B：Worker 模式下的非同步查價函數**（依 [preset-sheets-core worker.ts#L31-L43](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/worker.ts#L31-L43)、[custom-function.ts#L25-L29](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/functions/custom-function.ts#L25-L29) 與 `createUniver`（[presets/src/preset.ts#L48](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/src/preset.ts#L48)）推出來的寫法，**未實測**）

```ts
// formula.worker.ts —— 這個檔案跑在 Web Worker 裡
import { createUniver } from '@univerjs/presets';
import { UniverSheetsCoreWorkerPreset } from '@univerjs/preset-sheets-core/worker';
import { AsyncCustomFunction } from '@univerjs/engine-formula';

class PriceFunction extends AsyncCustomFunction {
    override async calculateCustom(sku: unknown) {
        // 換成你自己的 API（例如 Firebase Cloud Functions 的 HTTPS 端點）
        const res = await fetch(`https://example.com/api/price?sku=${encodeURIComponent(String(sku))}`);
        return Number((await res.json()).price);
    }
}

createUniver({
    presets: [UniverSheetsCoreWorkerPreset({ formula: { function: [[PriceFunction, 'PRICE']] } })],
});
// 主執行緒：UniverSheetsCorePreset({ workerURL: new Worker(new URL('./formula.worker.ts', import.meta.url), { type: 'module' }) })
// 函數提示文字放主執行緒 preset 的 formula.description；價格更新後呼叫 univerAPI.getFormula().executeCalculation()
```

---

## 坑與限制

1. **Worker 模式自訂函數不同步**：主執行緒 `registerFunction` 不會送進 Worker，會丟錯；函數要寫在 Worker 端的 `function` 設定（見第 7 節）。
2. **`A1#` 溢出參照未完成**：解析會過，但求值回 `#VALUE!`；`ANCHORARRAY` 只是回傳原參照。從 Excel 帶來的 `=SUM(D2#)` 會得到 `#VALUE!`，要改寫成明確範圍。
3. **21 個佔位函數一律 `#N/A`**：CUBE 系列、FORECAST.ETS 系列、WEBSERVICE、RTD、INFO 等。Excel 檔裡用到這些時結果會不同。
4. **揮發性範圍很窄**：只有 RAND、RANDBETWEEN、NOW、TODAY 每次重算；RANDARRAY 與所有自訂函數都不在清單（依程式推論，未實測），外部資料變了要自己 `executeCalculation()`。
5. **數值是 IEEE 754 雙精度浮點數**：[math-kit.ts#L17-L21](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/utils/math-kit.ts#L17-L21) 註解寫明只在顯示時處理 15 位精度，`0.1+0.2` 內部仍是 0.30000000000000004；`decimal.js` 只用在複數。金額請在公式裡自己 `ROUND`。
6. **每次重算都重新分析全部公式**：受影響公式才重新求值，但登記與 `rangeList` 計算會掃過全部公式（第 2 節），超大量公式時要實測。
7. **溢出值不在儲存格資料裡**：存 Firestore 或匯出時，讀快照 `cellData` 可能拿不到溢出結果，要用 facade 讀值或另存 `arrayFormulaCellData`。
8. **跟 Univer 資料模型綁死**：引擎從 `IUniverInstanceService` 取目前活頁簿（[current-data.service.ts#L519-L529](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/services/current-data.service.ts#L519-L529)），不能像 HyperFormula 直接丟二維陣列；要先把你的資料轉成 Univer 活頁簿快照格式。
9. **函數執行個體是共用的**：同名函數只有一個實例（`Map`），參照資訊在每次呼叫前寫進實例；自訂類別別在欄位裡存「這次呼叫」的狀態，非同步函數交錯執行時尤其要小心（推論）。
10. **錯誤不會丟例外**：找不到的函數直接變 `#NAME?`，部分路徑只用 `console.error` 記一行（例如 [function-node.ts#L497-L502](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/ast-node/function-node.ts#L497-L502) 的 `No function ${token}`）；自訂函數出問題時，記得看瀏覽器主控台而不是等 try/catch。
11. **文件與範例落差**：rpc、rpc-node README 指向的 Worker 範例檔在此 commit 不存在；請以 `presets/packages/preset-sheets-core/src/worker.ts` 為準。
12. **授權**：engine-formula、sheets-formula、sheets-formula-ui、rpc、rpc-node、sheets、core 的 `package.json` 都寫 Apache-2.0（逐一看過），個人用、商用、修改都可以，保留版權與授權聲明即可。.xlsx 匯入匯出不在這個開源 repo（檔案清單搜不到 exchange、xlsx 相關套件）。
