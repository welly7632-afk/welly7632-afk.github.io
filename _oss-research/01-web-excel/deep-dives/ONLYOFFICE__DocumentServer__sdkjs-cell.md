# ONLYOFFICE/DocumentServer｜深入：試算表核心（sdkjs cell）
> 深入分析｜掃描日期：2026-11-04｜commit：c4ad98d｜總覽資料包：_oss-research/01-web-excel/ONLYOFFICE__DocumentServer.md

> **範圍與版本**：DocumentServer 本身只是「總裝 repo」，試算表程式碼都放在 git submodule 指向的 companion repo（sdkjs、web-apps、core）。DocumentServer `c4ad98db9f0dd84a9949566de399fc79698acd46`（2026-10-26）記錄的 sdkjs 指標 `6423d2d…` 與 web-apps 指標 `848568f…` 在 GitHub 公開分支上抓不到（`git fetch` 回 `not our ref`），所以我改讀兩者的 master：sdkjs `9d2138866d929be32f1d107e8b5bfae36156e097`、web-apps `f79972a400c3a696490094961772d1f86fac1b82`（兩者都是 2026-10-15 的「Merge branch release/v10.0.0 into master」，對應 CHANGELOG 的 10.0.0）。core 的指標 `ed63e94de814ff1d4ea28cddfaba6939bc9df9ed` 剛好等於 core master，是精準對應。下面的連結都固定在這些 SHA。我只讀程式碼，沒有安裝、建置或執行；數字都是我自己用 grep、wc 或 Python 腳本數的，方法寫在各節。

---

## 重點結論（5–10 點）

1. **「試算表核心」不是小函式庫，而是一整台引擎。** `sdkjs/cell/` 有 71 個 JS 檔、約 32.8 萬行；但官方打包試算表編輯器時（[`configs/cell.json`](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/configs/cell.json#L1-L471)）一共串接 414 個檔：cell 69、**word 205**（文書編輯器的段落與文字引擎，用在文字方塊、註解、頁首頁尾）、common 134、vendor 5、slide 1，合計約 109 萬行、37 MB 原始碼。
2. **公式引擎是手寫的「調度場 → 逆波蘭式 → 堆疊求值」**，加上以「單格監聽＋範圍監聽」為主的依賴圖。我數到 **500 個註冊函數，其中 483 個真的能用**（17 個被列在 `NotRealised`），分 11 類，另有 17 個運算子。動態陣列（FILTER、SORT、UNIQUE、XLOOKUP、VSTACK…）、REGEX 三兄弟、Google 風格的 IMPORTRANGE 都有；**LET、LAMBDA、GROUPBY、PIVOTBY 在 `cell/` 全目錄搜尋 0 筆**。
3. **資料模型很省記憶體**：每張工作表「按欄」存成 `ArrayBuffer`（`SheetMemory`），每格固定 16 bytes（4 bytes 旗標＋4 bytes 公式編號＋8 bytes 數字或共用字串編號）；`Cell` 物件只是臨時借來讀寫的「窗口」，不是每格一個物件。上限 1,048,576 列 × 16,384 欄，與 Excel 相同。
4. **畫面是 4 層 Canvas 疊起來**，只畫看得到的範圍；捲動時用 `drawImage` 把舊畫面「自己貼自己」，只補畫新露出的那幾列。**文字不用瀏覽器的 `fillText`**，而是用 FreeType＋HarfBuzz 編成的 WebAssembly 字型引擎把字形點陣畫上去——各瀏覽器長得一樣，但也代表要先備好字型檔與 `AllFonts.js`。
5. **xlsx 預設不是在瀏覽器裡解析的。** 伺服器上的 C++ 轉檔器 x2t（core repo）先把 xlsx 轉成 ONLYOFFICE 自家二進位（簽名 `XLSY`），瀏覽器的 `Serialize.js` 只讀寫這種二進位；存檔時再由伺服器轉回 xlsx。sdkjs 雖有「瀏覽器直接開 xlsx」的路徑，但被 `Asc.Addons.ooxml` 旗標擋住，**而且 `Worksheet.prototype.fromXml`、`saveDocumentToZip` 的實作不在公開 sdkjs 裡**。
6. **web-apps 的試算表介面**是 jQuery＋Backbone＋RequireJS 的老派架構（桌面版 116 個 JS、約 8.6 萬行；行動版是 React＋Framework7），和核心之間只透過 `spreadsheet_api` 的 458 個 `asc_*` 方法與 `asc_registerCallback` 事件溝通。官方 `test/spreadsheeteditor` 是不到 800 行的極簡外殼，證明介面可以自己換。繁體中文介面字串 4,693／5,406（約 87%），函數說明 zh-tw 有 485 條。
7. **能不能把核心抽出來單獨用？公式引擎單獨拆非常難；整台引擎拿來用可行，但要伺服器。** 公式物件一建立就呼叫 `ws.getRange2()`，還有一堆全域單例（History、g_oTableId、g_StyleCache…）。務實路線：(a) 用 Docker 架 DocumentServer，以 `DocsAPI.DocEditor` 用 iframe 嵌進你的系統；(b) 在 ONLYOFFICE 裡用巨集 API 的 `Api.AddCustomFunction`（支援 async）做「查價函數」；(c) 只借演算法與設計（例如零依賴的 `SheetMemory`、捲動貼圖技巧、財務函數演算法）。
8. **授權：AGPL-3.0＋附加條款**（保留版權聲明、修改要標註並寫明源自 ONLYOFFICE、介面要看得到法律聲明、不給商標權）。你個人自用沒問題；改過之後放到網路上讓員工或客戶用，就要提供修改後的原始碼。Community 版 README 寫「建議 20 人以內」，而且沒有行動版網頁編輯器。
9. **給你的實用判斷**：如果你要的是「在倉儲 App 某一頁放一個能打公式的表格」，ONLYOFFICE 太重（要伺服器、字型、上百萬行程式碼）；如果你要的是「跟 Excel 檔高度互通、樞紐分析表、圖表、多人同時編輯，而且願意多架一台伺服器」，它很值得用——做法是把整個編輯器當黑盒子嵌入，再用巨集與自訂函數接你的查價、庫存與成本資料。

---

## 逐題詳解（每個問題一節，附 permalink 與必要的短程式碼摘錄）

> **白話名詞**：**逆波蘭式（RPN）**＝把 `=A1+B1*2` 改排成「A1 B1 2 * +」，電腦用一個堆疊由左往右就算完；**依賴圖**＝記錄「誰引用了誰」，改一格只重算受影響的公式；**Canvas**＝瀏覽器裡的一塊畫布，整張表是「畫」出來的，不是用 HTML 表格排出來的；**享元（flyweight）**＝不為每一格建物件，需要時才臨時借一個物件讀寫。

### 0. 先看地圖：程式碼在哪裡

| 元件 | Repo | 角色 |
|---|---|---|
| sdkjs | ONLYOFFICE/sdkjs | 瀏覽器端引擎：資料模型、公式、Canvas 繪製、對外 API |
| web-apps | ONLYOFFICE/web-apps | 你看到的工具列、公式列、對話框（桌面、行動、嵌入三版） |
| core | ONLYOFFICE/core | 伺服器端 C++：x2t 轉檔、doctrenderer（在伺服器上跑 sdkjs） |

出處：[`.gitmodules` L10–L18](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/.gitmodules#L10-L18)、[`Readme.md` 元件清單 L52–L60](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L52-L60)。

`sdkjs/cell/` 裡最大的幾個檔（`wc -l`）：

| 檔案 | 行數 | 內容 |
|---|---|---|
| `view/WorksheetView.js` | 31,933 | 單張工作表的 Canvas 繪製、捲動、選取、互動 |
| `apiBuilder.js` | 33,523 | 巨集／外掛用的 Office JS 風格 API |
| `model/Workbook.js` | 27,399 | Workbook、Worksheet、Cell、Range、依賴圖 |
| `model/PivotTables.js` | 23,286 | 樞紐分析表 |
| `model/WorkbookElems.js` | 22,821 | 樣式、共用字串、自訂函數引擎等 |
| `model/FormulaObjects/`（14 檔） | 70,146 | 公式解析、求值與全部函數 |
| `model/Serialize.js` | 16,661 | XLSY 二進位讀寫 |
| `api.js` | 10,811 | 給介面呼叫的 `spreadsheet_api` |

### 1. 公式引擎與函數數量

**流程（示意，不是實際除錯輸出）**

```
"=SUM(A1:B2)*2"
 │ parserFormula.parse()     調度場演算法：中序 → 後序，結果放在 this.outStack
 ▼
outStack ≈ [ A1:B2 , 1(參數個數) , SUM , 2 , * ]
 │ parserFormula.calculate() 由左往右：運算元推進堆疊；遇到函數／運算子就彈出參數計算
 ▼
cNumber / cString / cBool / cError / cArray … → 寫回儲存格
```

- **解析**：[`parse()` 開頭 L8564–L8583](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L8564-L8583) 的註解直接寫「converting infix notation to postfix or Reverse Polish Notation」。主迴圈 [L10078–L10146](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L10078-L10146) 依序判斷運算子、括號、逗號、陣列常數 `{}`，其餘交給運算元解析（數字、字串、布林、錯誤值、`Sheet1:Sheet3!A1` 這種 3D 參照、範圍、表格結構化參照 `表1[欄]`、已定義名稱、函數）。公式長度上限 8,192 字元、儲存格內容上限 32,767 字元（[`commonDefines.js` L2209–L2210](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/commonDefines.js#L2209-L2210)）。
- **運算子**：[`cFormulaOperators` L6003–L6040](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L6003-L6040) 共 17 個（`:` 範圍、空白交集、正負號、`%`、`^`、四則、`&`、六種比較）。
- **求值**：[`calculate()` L10621–L10652](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L10621-L10652)。值得一提的是 **lazy IF**：條件是單一值的 IF，在一般計算時會跳過沒走到的那一邊（L10640 註解），但依賴圖仍把兩邊都登記。
- **值的型別**：`cNumber`、`cString`、`cBool`、`cError`、`cRef`／`cArea`（含 3D 版）、`cName`、`cStrucTable`、`cArray` 等，定義在 [L740 起](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L740-L803) 到 L3912。

**函數怎麼註冊**：每個函數是一個繼承 [`cBaseFunction`（L4140–L4167）](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L4140-L4167) 的「類別」，設定名稱、參數個數、參數型別與 `Calculate`。例如 [VLOOKUP L4996–L5013](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/lookupandreferenceFunctions.js#L4996-L5013) 只有 18 行，真正的查找交給有快取的 `VHLOOKUPCache`（[L3338 起](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/lookupandreferenceFunctions.js#L3338-L3349)）。各分類檔把建構子推進 `cFormulaFunctionGroup['分類']`，再由 [`getFormulasInfo()` L6042–L6071](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L6042-L6071) 彙整：

```js
// parserFormula.js L6060–L6066（節錄）
a = new cFormulaFunctionGroup[type][i]();
//cFormulaFunctionGroup['NotRealised'] - array of not yet implemented formulas
if (-1 === cFormulaFunctionGroup['NotRealised'].indexOf(cFormulaFunctionGroup[type][i])) {
    f = new AscCommon.asc_CFormula(a);
    b.asc_addFormulaElement(f);
    cFormulaFunction[f.asc_getName()] = cFormulaFunctionGroup[type][i];
}
```

**我怎麼數**：寫 Python 腳本掃 `FormulaObjects/` 14 個檔裡所有 `cFormulaFunctionGroup['X'].push(...)`，以建構子去重，扣掉 `NotRealised`，再用各建構子的 `prototype.name` 對應成函數名稱。交叉驗證：web-apps 的 `en_desc.json` 與 `zh-tw_desc.json` 都是 485 條說明，差別正好是「4 個 FORECAST.ETS 有說明但沒實作」與「AREAS、SINGLE 有實作但沒說明」，兩邊對得起來。

| 分類（程式碼名稱） | 註冊 | 可用 | 代表函數（和你的生意有關的優先） |
|---|---|---|---|
| Mathematic（[L112](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/mathematicFunctions.js#L112-L113)） | 83 | 83 | SUM、SUMIFS、SUMPRODUCT、ROUND、MROUND、SEQUENCE、AGGREGATE |
| Statistical（[L71](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/statisticalFunctions.js#L71-L72)） | 149 | 145 | COUNTIFS、AVERAGEIFS、MAXIFS、MINIFS、FORECAST.LINEAR、TREND |
| Financial（[L663](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/financialFunctions.js#L663-L664)） | 55 | 55 | PMT、NPV、XNPV、IRR、XIRR、RATE |
| Engineering | 54 | 54 | CONVERT、DEC2HEX、複數 IM* 系列 |
| TextAndData（[L68–L75](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/textanddataFunctions.js#L68-L75)） | 48 | 44 | TEXT、TEXTJOIN、TEXTSPLIT、REGEXEXTRACT、IMPORTRANGE |
| LookupAndReference（[L73–L79](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/lookupandreferenceFunctions.js#L73-L79)） | 37 | 35 | VLOOKUP、XLOOKUP、XMATCH、FILTER、SORT、UNIQUE、VSTACK |
| DateAndTime | 25 | 25 | EDATE、EOMONTH、NETWORKDAYS.INTL、WORKDAY.INTL |
| Information | 19 | 19 | ISNUMBER、CELL、SHEETS |
| Database | 12 | 12 | DSUM、DGET |
| Logical（[L58–L59](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/logicalFunctions.js#L58-L59)） | 11 | 11 | IF、IFS、SWITCH、IFERROR、XOR |
| Cube（[L47–L52](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/cubeFunctions.js#L47-L52)） | 7 | 0 | CUBEVALUE 等全部未實作 |
| **合計** | **500** | **483** | |

未實作的 17 個：CUBE 系列 7 個、RTD、FORECAST.ETS 系列 4 個、BAHTTEXT、JIS、PHONETIC、DBCS、ANCHORARRAY。另外 `FILTERXML`、`WEBSERVICE`、`QUERYSTRING` 有寫類別但沒放進任何分類（[`_xlfnFunctions.js` L42–L47](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/_xlfnFunctions.js#L42-L47) 是被註解掉的清單），使用者打不到。

**改一格之後發生什麼事（白話版）**
1. 你在 B2 改了進價 → 新值寫回該欄的 ArrayBuffer，並在 History 記一筆（之後可以復原）。
2. 依賴圖查兩張表：`cellMap`（誰直接引用 B2）和 `areaMap`（誰引用了包含 B2 的範圍，例如 `SUM(B2:B500)`），把這些公式標成「髒」，再一層層往下游傳（例如毛利率公式引用了成本公式）。
3. `calcTree` 把所有髒公式重算一遍；NOW、RAND 這類易變函數每次都算；一般情況下，條件是單一值的 IF 只算走到的那一邊。
4. 清掉 VLOOKUP、SUMIFS 等查找快取，通知畫面重畫。

**其他引擎特性**
- **依賴圖**：[`DependencyGraph` L624–L655](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L624-L655) 為每張表維護 `cellMap`（單格，鍵＝列×16384＋欄，見 [L586–L589](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L586-L589)）與 `areaMap`（範圍），另有名稱與易變函數（NOW、RAND）的監聽表；登記邏輯在 [`startListeningRange` L661–L702](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L661-L702)。
- **重算**：[`calcTree` L1676–L1754](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L1676-L1754)：建依賴 → 廣播「髒」標記（易變、名稱、單格、範圍）→ `_calculateDirty` 統一重算 → 處理非同步函數 → 清掉 VLOOKUP、MATCH、COUNTIF、SUMIFS 等查找快取。
- **反覆運算（循環參照）**：[`CalcRecursion` L12666–L12696](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L12666-L12696)，預設最多 100 次、相對誤差 0.001，與 Excel 相同。
- **動態陣列**預設開啟（[L57](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L57)），但可被 localStorage 旗標關掉（[L90–L95](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L90-L95)）。
- **非同步自訂函數**：[`AsyncFormulasManager` L2980–L2990](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L2980-L2990)；對外入口見第 6 節。
- **目標搜尋與規劃求解**：[`CGoalSeek` L292](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/whatIfAnalysis.js#L292)、[`CSolver` L2843](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/whatIfAnalysis.js#L2843)（單形法 `CSimplexTableau` 在 L1712），可用來算「毛利最大化」這類問題。

### 2. Canvas 繪製

- **4 層 Canvas**：[`api.js` L3452–L3459](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api.js#L3452-L3459) 直接用 innerHTML 塞進 `ws-canvas`（儲存格）、`ws-canvas-overlay`（選取框、拖曳線）、`ws-canvas-graphic`（圖表、圖形）、`ws-canvas-graphic-overlay`（圖形拖曳）。[`WorkbookView._init` L410–L440](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorkbookView.js#L410-L440) 把每層包成 `DrawingContext`。
- **繪製順序**：[`WorksheetView.draw` L5020–L5054](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorksheetView.js#L5020-L5054)：清空 → 左上角 → 欄標題 → 列標題 → 格線 → 儲存格與框線 → 群組大綱 → 凍結窗格 → 篩選按鈕 → 註解標記 → 圖形 → 選取框（畫在 overlay 層）。
- **儲存格本體**：[`_drawCellsAndBorders` L6403–L6470](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorksheetView.js#L6403-L6470) 逐列畫背景（含條件式格式設定的資料橫條、圖示集）、最後補畫合併儲存格、走勢圖、框線；文字在 `_drawCellText`（L6845 起）。
- **只畫看得到的**：[`_calcVisibleRows` L3135–L3148](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorksheetView.js#L3135-L3148) 從可見第一列往下累加列高，填滿畫布高度就停。
- **捲動省工**：[L11670–L11683](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorksheetView.js#L11670-L11683) 用 `ctx.drawImage(ctx.getCanvas(), …)` 把舊畫面整塊位移，再只畫新露出的列（L11752–L11786）；Safari 另有補丁。
- **DrawingContext**：[L420–L461](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/graphics/DrawingContext.js#L420-L461) 負責單位換算（px／pt／mm）、變換矩陣與 Retina 解析度。文字：

```js
// DrawingContext.js L1088–L1094（節錄）：不是 ctx.fillText，而是逐字載入字形點陣再貼上
_x = asc_round(manager.LoadString4C(code, _x, _y));
pGlyph = manager.m_oGlyphString.m_pGlyphsBuffer[0];
...
this.fillGlyph(pGlyph, manager);
```

  `fillGlyph`（[L1052–L1069](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/graphics/DrawingContext.js#L1052-L1069)）把字形點陣上色後畫到 canvas。字型引擎的 JS 包裝 [`common/libfont/engine.js` L60–L80](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/libfont/engine.js#L60-L80) 對應的是 `FT_*`（FreeType）與 `HB_ShapeText`（HarfBuzz），本體是 `common/libfont/engine/fonts.wasm`。
- **字型清單**來自 `AllFonts.js` 定義的 `__fonts_files`／`__fonts_infos`（[`Externals.js` L634–L660](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/Drawings/Externals.js#L634-L660)）；這個檔在 sdkjs 的 `.gitignore` 裡，是安裝時產生的。
- **中文輸入法**：`common/text_input2.js` 監聽 `compositionstart／update／end`（[L1046](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/text_input2.js#L1046)），注音、倉頡在儲存格裡選字應有處理（未實測）。

### 3. 資料模型

```
Workbook（L3203）
 ├─ dependencyFormulas : DependencyGraph   依賴圖
 ├─ sharedStrings      : CSharedStrings    共用字串表（相同文字只存一份）
 ├─ workbookFormulas   : CWorkbookFormulas 所有已解析公式，用編號引用
 ├─ CellStyles / TableStyles               樣式
 └─ aWorksheets[] : Worksheet（L7048）
       ├─ cellsByCol[欄]   : SheetMemory     每欄一塊 ArrayBuffer，每格 16 bytes
       ├─ cellStylesByCol  : 每欄的樣式區段（10.0 版「樣式與資料分開存」）
       ├─ rowsData         : SheetMemory     列高、隱藏等列屬性
       └─ mergeManager / hyperlinkManager / TableParts / AutoFilter / Drawings / aComments
```

出處：[Workbook L3203–L3240](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L3203-L3240)、[Worksheet L7048–L7062](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L7048-L7062)、CHANGELOG 10.0.0「Sped up some operations by storing styles and data separately」（[L30–L34](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L30-L34)）。

**每格 16 bytes**：[`g_nCellStructSize = 4 + 4 + 8` 與旗標定義 L15593–L15600](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L15593-L15600)；寫入在 [`Cell.saveContent` L15664–L15696](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L15664-L15736)：

```js
// Workbook.js L15679–L15681（節錄）：數字格
sheetMemory.writeInt32(structOffset, 0, (flags << 24));  // 旗標：型別、是否髒、是否計算中
sheetMemory.writeInt32(structOffset, 4, formulaSave);    // 公式在 workbookFormulas 的編號（0＝無）
sheetMemory.writeFloat64(structOffset, 8, this.number);  // 數值；文字格則改存共用字串編號
```

`loadContent` 反過來從 ArrayBuffer 讀回一個臨時 `Cell`（[`Cell` 建構子 L15604–L15627](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L15604-L15627)）。[`SheetMemory`（L45–L62）](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/SheetMemory.js#L45-L62) 用同一塊 ArrayBuffer 的 Uint8／Int32／Float64 三種視圖，初始 32 列、不夠時放大 1.5 倍。粗略估算：10 萬列 × 20 欄全填數字＝200 萬格 × 16 bytes ≈ 32 MB 純資料（不含字串表、樣式與公式物件）；若每格都建一個 JS 物件，額外開銷通常更大（未實測）。這就是它能撐大檔的關鍵設計之一。上限定義在 [`SerializeCommonWordExcel.js` L951–L954](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/SerializeCommonWordExcel.js#L951-L954)。

所有修改都經過 `AscCommon.History.Add(...)` 記錄（例如合併儲存格，[Worksheet 建構子 L7073–L7085](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L7073-L7085)），復原／重做與共同編輯送給伺服器的變更都建立在這套記錄上（後者為依檔名與呼叫關係的推論）。

### 4. xlsx（OOXML）讀寫

```
開檔：xlsx ─(伺服器 x2t：CXlsxSerializer.saveToFile)→ XLSY 二進位 ─→ 瀏覽器 BinaryFileReader 建模型
編輯：每次修改 → History 變更 → WebSocket 送伺服器（共同編輯）
存檔：伺服器 doctrenderer 用同一份 sdkjs 套用變更 → x2t（CXlsxSerializer.loadFromFile）→ xlsx
```

（上圖依 sdkjs 與 core 的程式碼整理；伺服器 `server` repo 如何串起這幾步本次沒讀，屬推論。）

- **瀏覽器要的是 XLSY**：開檔時 [`_getOpenCmd` L1417–L1453](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/apiBase.js#L1417-L1453) 向伺服器要求輸出格式，試算表是 `CANVAS_SPREADSHEET`（[L508–L509](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/apiBase.js#L508-L509)）。簽名 `XLSY` 定義在 [`apiDefines.js` L345–L348](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiDefines.js#L345-L348)；檔頭格式 `XLSY;v版本;長度;`，主表分成共用字串、樣式、活頁簿、工作表、計算鏈等（[`Serialize.js` L154–L166](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Serialize.js#L154-L166)）。寫入器 [`BinaryFileWriter` L7832–L7870](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Serialize.js#L7832-L7870)，讀取器 [`BinaryFileReader.Read` L13908 起](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Serialize.js#L13838-L13937)。
- **分流點**：[`openDocument` L1871–L1890](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api.js#L1871-L1890)：若 `isOpenOOXInBrowser` 走 `OpenDocumentFromZip`，否則走 [`OpenDocumentFromBin` L1928–L1942](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api.js#L1928-L1942)。
- **瀏覽器直接開 xlsx 的路徑**：[`OpenDocumentFromZipNoInit` L2056–L2095](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api.js#L2056-L2095) 用 ZLib 解壓、`StaxParser` 逐段 `fromXml`。但開關是 [`asc_isSupportFeature("ooxml")` L5340–L5343](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/apiBase.js#L5340-L5343)，只看 `window.Asc.Addons.ooxml`。我在公開 sdkjs 的 `cell/`、`common/` 搜 `Worksheet.prototype.fromXml`、`CT_Workbook.prototype.fromXml`、`saveDocumentToZip` 的定義都是 0 筆（只有呼叫端，例如 [`apiBase.js` L3329–L3334](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/apiBase.js#L3329-L3334)）。用 `git ls-remote` 測 `ONLYOFFICE/sdkjs-ooxml` 會要求登入（同組織的 `sdkjs-forms` 則公開可讀），所以實作應在非公開的 addon（推論，未確認）。
- **伺服器端轉檔**（core）：[`xlsx.h` L137–L158](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/lib/xlsx.h#L137-L158) 把解開的 xlsx 資料夾轉成 XLSY；[L270–L306](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/lib/xlsx.h#L270-L306) 反向轉回 xlsx，若帶著變更則先呼叫 `apply_changes(... NSDoctRenderer ...)`。sdkjs 對應的「伺服器模式」入口是 [`asc_nativeOpenFile` L7047–L7078](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api.js#L7047-L7078) 與 [`asc_nativeGetFileData` L7130–L7152](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api.js#L7130-L7152)（先 `calcTree()` 再輸出二進位）。
- **CSV／TXT 匯入**也是送伺服器轉成 TXT 再讀回（[`asc_TextFromFileOrUrl` L549–L600](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api.js#L549-L600)）。
- **離線空白活頁簿**：`cell/document/empty.js` 內嵌一份 base64 的空白 XLSY；[`_openEmptyDocument` L1479–L1489](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/apiBase.js#L1479-L1489) 在離線模式直接用它開檔，不經伺服器。

**對你的意義**：如果只是想把供應商的 xlsx 報價單匯進 Firebase，用不到 ONLYOFFICE 的瀏覽器引擎；ONLYOFFICE 的強項是「在網頁上直接編輯 xlsx，再存回 xlsx」，模型裡有樞紐分析表、條件式格式設定、資料驗證、交叉分析篩選器等完整物件（實際還原度未實測）。另外，x2t 本身是獨立的命令列轉檔程式，用一個 XML 設定檔指定 `m_sFileFrom`／`m_sFileTo`（[`X2tConverter/README.md` L1–L30](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/README.md#L1-L30)），可拿來批次把 xls、ods、csv 轉成 xlsx（要先編譯或從安裝好的伺服器裡取得，未實測）。

### 5. web-apps 的試算表介面

- **結構**：`apps/spreadsheeteditor/` 分 `main`（桌面）、`mobile`（行動）、`embed`（嵌入檢視器）。`main/app` 有 116 個 JS、約 85,684 行；20 個 controller 共 25,278 行，最大的是 `Toolbar.js`（5,463）、`DocumentHolderExt.js`（右鍵選單，5,189）、`Main.js`（3,917）。
- **啟動**：[`app.js` L44–L67](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/spreadsheeteditor/main/app.js#L44-L67) 用 RequireJS 載入 `sdk: '../../sdkjs/cell/sdk-all-min'`、`allfonts`、socket.io；[L126–L162](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/spreadsheeteditor/main/app.js#L126-L162) 建立命名空間 `SSE` 的 Backbone 應用程式（19 個試算表 controller＋12 個共用 controller）。核心在 [`Viewport.js` L196–L201](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/spreadsheeteditor/main/app/controller/Viewport.js#L196-L201) 用 `new Asc.spreadsheet_api({'id-view':'editor_sdk', …})` 建立。
- **介面怎麼跟核心說話**：公式列 [`CellEditor.js` L87–L108](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/spreadsheeteditor/main/app/controller/CellEditor.js#L87-L108) 註冊 `asc_onEditCell`、`asc_onSelectionNameChanged` 等事件；函數精靈 [`FormulaDialog.js` L391](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/spreadsheeteditor/main/app/controller/FormulaDialog.js#L391) 呼叫 `asc_getFormulasInfo()`。`cell/api.js` 裡 `spreadsheet_api.prototype.asc_*` 方法我數到 458 個。
- **在地化**：`resources/formula-lang/zh-tw.json` 把函數名對應到自己（SUM→SUM，和 Excel 繁中版一樣用英文函數名）；`zh-tw_desc.json` 有 485 條中文說明。介面字串 `main/locale/zh-tw.json` 4,693 鍵，英文 5,406 鍵。
- **行動版**是 React＋Framework7（[`mobile/src/page/app.jsx` L38–L39](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/spreadsheeteditor/mobile/src/page/app.jsx#L38-L39)），71 個 jsx。**嵌入檢視器**只有 1,384 行（[`embedded: true` L965–L969](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/spreadsheeteditor/embed/js/ApplicationController.js#L965-L969)）。
- **極簡外殼**：`test/spreadsheeteditor/main` 全部 792 行（含 HTML、LESS）。[`index.html` L63–L87](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/test/spreadsheeteditor/main/index.html#L63-L87) 放一個 `editor_sdk` div、載入 sdkjs；[`ApplicationController.js` L315–L318](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/test/spreadsheeteditor/main/js/ApplicationController.js#L315-L318) 建 API，[L53–L91](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/test/spreadsheeteditor/main/js/ApplicationController.js#L53-L91) 設定文件資訊，[L154–L166](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/test/spreadsheeteditor/main/js/ApplicationController.js#L154-L166) 拿到權限後 `asc_LoadDocument()`：

```js
// test/.../ApplicationController.js L315–L318、L164–L165（節錄）
api = new Asc.spreadsheet_api({ 'id-view': 'editor_sdk', 'id-input': 'ce-cell-content' });
...
api.asc_setViewMode(!appOptions.isEdit);
api.asc_LoadDocument();
```

  自己做介面的套路就是：**用 `asc_*` 方法下命令**（例如 `asc_findCell`、`asc_showWorksheet`），**用 `asc_on*` 事件收狀態**（例如 `asc_onSelectionNameChanged` 告訴你選到哪一格、`asc_onSheetsChanged` 告訴你工作表清單變了），中間的畫格子、算公式全交給 sdkjs。
- **嵌進你自己網站的官方方式**：[`apps/api/documents/api.js` L400–L402](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L400-L402) 的 `DocsAPI.DocEditor(placeholderId, config)`，`documentType: 'cell'`（[L46](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L46)）、存檔回呼 `callbackUrl`（[L109](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L109)）。L400 的註解寫著「TODO: allow several instances on one page simultaneously」。

### 6. 可否把試算表核心抽出來單獨使用

| 層級 | 做法 | 需要什麼 | 難度 | 判斷 |
|---|---|---|---|---|
| A. 整套嵌入 | Docker 架 DocumentServer＋`DocsAPI.DocEditor` | 一台能跑 Docker 的主機、接收存檔的 callbackUrl | 低～中 | **最務實**（未實測） |
| B. 換自己的介面 | 照 `test/spreadsheeteditor` 寫外殼，呼叫 `asc_*` | 仍要 DocumentServer 後端：[`asc_LoadDocument` L1462–L1477](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/apiBase.js#L1462-L1477) 第一步就是 `CoAuthoringApi.auth`；還要字型與 sdkjs 打包檔 | 高 | 想要完全客製外觀才值得 |
| C. 純前端離線 | 離線模式＋`_openEmptyDocument` | 只能開空白檔或 XLSY；xlsx 進出要靠伺服器 x2t 或非公開 addon | 很高 | 未實測，不建議 |
| D. 無畫面批次 | core 的 doctrenderer／docbuilder（有 [Python、Java、.NET、COM 包裝](https://github.com/ONLYOFFICE/core/tree/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/DesktopEditor/doctrenderer)）＋`apiBuilder.js` | 要編譯 C++ 或使用官方 Document Builder 產品；README 表格寫 Document Builder Service 只在 Developer 版（[L89](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L89)） | 高 | 我只看了檔案清單，散布與授權細節未確認 |
| E. 只拆公式引擎 | 把 `FormulaObjects/` 搬走 | `cArea` 建構時就 `ws.getRange2(val)`（[L1202–L1215](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L1202-L1215)）；`parserFormula.js` 用到 `AscCommonExcel` 32 種、`AscCommon` 29 種不同符號 | 極高 | **不建議**，當演算法參考就好 |

全域單例的證據：[`asc_CloseFile` L1892–L1899](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api.js#L1892-L1899) 關檔時要逐一清 `History`、`g_oIdCounter`、`g_oTableId`、`g_StyleCache`、`CollaborativeEditing`。

**依你的需求怎麼選**
- 只要在倉儲 App 裡看、改一張表 → 不必用 ONLYOFFICE，改用同系列較輕的前端表格或公式庫。
- 要和會計師、供應商來回傳 xlsx，需要樞紐分析表、圖表、多人同時編輯 → 走 A。
- 要在試算表裡直接查 Firebase 的價格、庫存 → A＋自訂函數（下一節範例）。
- 要每天自動產出報表 xlsx → D 或其他產生 xlsx 的函式庫（本文未比較）。

---

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. **`configs/cell.json`**：先看試算表到底由哪 414 個檔組成，理解「cell 依賴 word」。
2. **`cell/api.js`**：`spreadsheet_api`（L74）、`openDocument`（L1871）、Canvas 建立（L3452）、伺服器模式入口（L7047、L7130）。
3. **`cell/model/SheetMemory.js`**（439 行）：最短、最好懂，先建立「按欄存 ArrayBuffer」的概念。
4. **`cell/model/Workbook.js`**：Workbook（L3203）→ Worksheet（L7048）→ Cell 的 16 bytes 存取（L15593–L15736）→ 依賴圖（L624）與 `calcTree`（L1676）。
5. **`cell/model/FormulaObjects/parserFormula.js`**：型別 `cElementType`（L495）→ `cBaseFunction`（L4140）→ 運算子表（L6003）→ 註冊（L6042）→ `parse`（L8564、主迴圈 L10078）→ `calculate`（L10621）。
6. **挑一個和生意有關的函數檔**：`financialFunctions.js`（PMT、XIRR）或 `lookupandreferenceFunctions.js`（VLOOKUP L4996、快取 L3338）。
7. **`cell/view/WorkbookView.js` → `WorksheetView.js`**：`_init`（L410）、`draw`（L5020）、`_drawCellsAndBorders`（L6403）、捲動貼圖（L11670）。
8. **`cell/graphics/DrawingContext.js` → `common/libfont/engine.js`**：看文字怎麼變成點陣。
9. **`cell/model/Serialize.js` ＋ core 的 `X2tConverter/src/lib/xlsx.h`**：理解 XLSY 與伺服器轉檔分工。
10. **`cell/apiBuilder.js`、`cell/api_plugins.js`**：巨集 API 與自訂函數。
11. **web-apps**：`test/spreadsheeteditor`（最小可用）→ `apps/spreadsheeteditor/main/app.js` → `controller/Viewport.js` → `CellEditor.js`、`FormulaDialog.js`。

---

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 想借的東西 | 位置 | 外部依賴 | 難度 | 怎麼接到你的 Firebase 純 JS 專案 |
|---|---|---|---|---|
| 整個網頁 Excel | DocumentServer＋`DocsAPI.DocEditor` | 伺服器、callbackUrl | 低～中 | 頁面放一個 div、載入 DocumentServer 的 `api.js`，config 給 xlsx 網址與 callbackUrl（例如 Cloud Functions），收到存檔通知時把新檔寫回 Storage（未實測） |
| 查價／算成本的自訂函數 | [`Api.AddCustomFunction` L830–L856](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L830-L856) | 只在 ONLYOFFICE 編輯器裡有效 | 低 | 見下方範例 |
| 按欄 typed array 儲存 | `cell/model/SheetMemory.js` | 0 個 `Asc*` 依賴，只掛到 `window.AscCommonExcel` | 低 | 自己重寫同概念：每欄一個 ArrayBuffer、每格固定長度、字串另存字典 |
| 依賴圖設計 | Workbook.js L624–L702、L1676–L1754 | 範圍物件、工作表模型 | 中 | 學「單格 map＋範圍 map」兩套監聽、先廣播髒標記再統一重算 |
| 可見範圍＋捲動貼圖 | WorksheetView.js L3135–L3148、L11670–L11683 | Canvas | 中 | 自製 canvas 表格時，捲動先 `drawImage` 自己再補畫新列 |
| 函數演算法 | `financialFunctions.js`（7,462 行）等 | `cNumber`／`cError`／`cArray` 型別 | 中 | 只移植數學部分，輸入輸出改成一般 JS 數字 |
| Excel 數字格式 | `common/NumFormat.js`（6,226 行）＋`NumFormatData.js` | 地區文化資訊、字型 | 中～高 | 要連地區設定一起搬 |
| 繁中函數說明 | web-apps `formula-lang/zh-tw_desc.json` | 無 | 低 | 做自己的函數精靈時當字典；屬 AGPL 還是 CC BY-SA 4.0 的「非程式內容」未確認 |

**整套嵌入的最小設定（依 `api.js` L38–L120 的設定說明整理，未實測）**

```js
new DocsAPI.DocEditor("placeholder", {
  documentType: "cell",
  document: { title: "庫存.xlsx", url: "https://你的檔案網址/庫存.xlsx", fileType: "xlsx", key: "inventory-v12" },
  editorConfig: { mode: "edit", callbackUrl: "https://你的後端/onlyoffice-callback",
                  user: { id: "u1", name: "老闆" } },
  token: "<伺服器若開 JWT 驗證才需要>"
});
```

接 Firebase 的思路：xlsx 放在 Storage、產生可下載網址給 `document.url`；`callbackUrl` 在 api.js 的說明是「sdk 與入口網站之間的連線網址」，一般做法是指向一支 Cloud Function，由伺服器在存檔時回呼、你再把新檔寫回 Storage。`key` 一般當作文件版本識別、內容改過就換新值。以上三點是常見整合方式，callback 的實際欄位、`key` 規則與 JWT 設定本次沒讀伺服器程式碼，請以官方 API 文件為準（未確認）。

**自己重寫 SheetMemory 概念的步驟**（建議重寫而非照抄，避開 AGPL）：(1) 讀完 `SheetMemory.js` 的 `checkIndex`，學「只配置用到的列區間、不夠就放大 1.5 倍」；(2) 定義你自己的每格結構，例如 4 bytes 型別＋4 bytes 字串編號＋8 bytes 數值；(3) 字串另放一個「文字 → 編號」字典（對照 `CSharedStrings`，[`WorkbookElems.js` L13204 起](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/WorkbookElems.js#L13204-L13215)）；(4) 對外只提供 `getCell(row, col)` 回傳臨時物件，而不是每格常駐一個物件。

**查價函數範例（依 apiBuilder.js 的 JSDoc 規格改寫，未實測）**：L835 註解寫明「The passed function can be asynchronous」，型別要用 `@customfunction` JSDoc 宣告。

```js
/**
 * 依商品編號查目前售價
 * @customfunction
 * @param {string} sku 商品編號
 * @returns {number} 售價
 */
Api.AddCustomFunction(async function GETPRICE(sku) {
  const r = await fetch("https://你的後端/price?sku=" + encodeURIComponent(sku));
  return (await r.json()).price;
});
```

要接 Claude 做「AI 欄位」時，請讓這個函數呼叫你自己的後端（例如 Cloud Functions），由後端帶金鑰去呼叫 Claude，不要把金鑰寫在巨集裡。另外 sdkjs 有 `Api.AI` → 外掛事件 `onAIRequest` 的橋接（[`apiBuilder.js` L33516–L33519](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L33516-L33519)、[`apiBase.js` L6170–L6200](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/apiBase.js#L6170-L6200)），實際的 AI 外掛在別的 repo，本次未讀。巨集 API 很完整：我數到 `Api*` 類別原型方法 1,115 個（`ApiRange` 83、`ApiWorksheet` 65、可在 JS 裡直接呼叫 VLOOKUP 等函數的 `ApiWorksheetFunction` 398 個），另有 46 個 `Api.*` 靜態方法。

**授權提醒**：上面任何「照抄程式碼」都會讓你的程式碼變成 AGPL 衍生作品；只「學概念自己重寫」不受影響。個人自用無妨，若要給員工或客戶在網路上使用，請先想清楚是否願意公開原始碼。

---

## 坑與限制

1. **版本對不上**：DocumentServer 記錄的 sdkjs、web-apps 指標在公開 repo 抓不到，本文以兩者 master（10.0.0 合併）為準；若你下載的是 9.x 正式版，行號會不同。
2. **瀏覽器直接讀寫 xlsx 的實作不公開**：自架 Community 版一定要走伺服器 x2t；想做「純前端、零伺服器」的 Excel，ONLYOFFICE 不適合。
3. **很重**：打包約 109 萬行、37 MB 原始碼；`build/build.py` 開頭註明「concatenation only, no compiler」（[L1–L17](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/build/build.py#L1-L17)），實際部署大小未確認。不適合塞進你現有的倉儲 App 當小元件。
4. **全域狀態**：大量 `window.Asc*` 命名空間與單例，同一頁跑兩份編輯器官方也寫成 TODO。
5. **字型是硬需求**：沒有 `AllFonts.js` 與字型檔就無法正確量字、畫字；中文字型檔很大，載入時間要留意（未實測）。
6. **公式缺口**：沒有 LET、LAMBDA、GROUPBY、PIVOTBY；17 個函數未實作；WEBSERVICE、FILTERXML 打不到。
7. **自訂函數存在瀏覽器**：函數庫存在 localStorage 的 `cell-custom-functions-library`，用 `safePluginEval` 執行（[`api_plugins.js` L182–L215](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api_plugins.js#L182-L215)）——不在 xlsx 檔裡，換電腦要重新登記（依程式碼推論）；也只能放你信得過的程式碼。
8. **動態陣列可被 localStorage 關閉**，不同電腦設定不同時，同一檔案的結果可能不同（推論）。
9. **授權附加條款**：[LICENSE L665–L728](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/LICENSE#L665-L728) 要求保留聲明、標註修改與日期、介面上可看到原作者與授權資訊，且不得使用 ONLYOFFICE 商標。
10. **Community 版限制**：README 寫建議 20 人以內、沒有行動版網頁編輯器、沒有 Document Builder Service 與 Automation API（[L79–L98](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L79-L98)）；這些限制在伺服器端怎麼執行，本次未讀。
11. **介面技術老舊**：Backbone＋jQuery 的元件很難單獨拆來用，建議把整個編輯器當黑盒子用 iframe 嵌入。
12. **繁中介面不完整**：約 87% 字串有翻譯，其餘應會顯示英文（未實測）。
