# myliang/x-spreadsheet — 一萬行內讀得完的 Canvas 網頁試算表：純 JS 就能嵌入，但公式只有 8 個、作者已轉去 wolf-table
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：0c55f3e
> GitHub：https://github.com/myliang/x-spreadsheet｜⭐ 14571｜授權：MIT｜主要語言：JavaScript｜最近更新：2024-08-07

> 下文所有 permalink 都以 `https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/` 開頭（以下連結文字簡稱 `BASE/`），都是本次實際打開過的檔案。master 分支 HEAD 的 commit 時間是 2023-08-15（PR #663 合併）；GitHub 顯示的「最近 push 2024-08-07」可能來自其他分支或 metadata，本次未確認。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：x-spreadsheet（npm 套件名 `x-data-spreadsheet`）是中國開發者 myliang 2018 年起寫的「網頁版 Excel 外觀」元件：用一張 `<canvas>` 畫格子、DOM 只負責工具列／編輯框／右鍵選單，**零執行期依賴、純 JavaScript、不需要 React／Vue**。整個 `src/` 只有 96 個檔案、約 9,800 行 JS（本次用 `find src -name '*.js' | xargs cat | wc -l` 自己數：9,787 行），是所有網頁試算表專案裡**最容易「從頭讀到尾」的一個**。但 GitHub 專案描述已寫明「已遷移到 @wolf-table/table」，等同停止維護。

**對你（台灣小老闆、倉儲 App 用純 JS + Firebase）可以拿來做什麼：**

1. **在現有倉儲網頁裡快速塞一個「像 Excel 的格子」**：CDN 引入 1 支 JS + 1 支 CSS，`x_spreadsheet('#el')` 就有工具列、多工作表、合併儲存格、凍結窗格、篩選、資料驗證下拉選單（[BASE/readme.md](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/readme.md)）。適合做「進貨清單」「盤點表」「簡單報價單」這種**資料為主、公式很少**的畫面。
2. **把整張表存進 Firestore**：`getData()` 回傳的是很乾淨的稀疏 JSON（只存有內容的格子），`loadData()` 讀回去（[BASE/src/index.js 第 70–91 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/index.js#L70-L91)）。存法見第 11 節。
3. **自訂工具列按鈕**：`extendToolbar.left/right` 可以加「儲存到 Firebase」「送去 Claude 產生文案」之類的按鈕，按下時會拿到整張表的資料（[BASE/src/component/toolbar/index.js 第 84–104 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/toolbar/index.js#L84-L104)）。
4. **當作「自己用 Claude Code 寫試算表」的教科書**：Canvas 只畫可視範圍的作法、稀疏資料模型、合併儲存格、凍結窗格四象限繪製、中序轉後序的公式解析器，每一塊都是幾百行內、可以整段讀懂再改寫。

**不建議**：拿它做「成本計算／比價」這種公式很重的表。開源版只有 8 個函數（SUM、AVERAGE、MAX、MIN、IF、AND、OR、CONCAT），而且小數乘法、除法會被自動四捨五入、AVERAGE 會把空白格算進分母（見第 9、11 節）。需要真的算錢，請改用 Univer／Luckysheet，或把公式引擎換掉（見第 10 節）。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**（[BASE/LICENSE](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/LICENSE)，Copyright (c) 2017 myliang；`package.json` 也標 `"license": "MIT"`，見 [BASE/package.json](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/package.json)）。
- **個人使用**：完全自由，想改就改、想拆就拆。
- **公司商用**：可以閉源商用、可以賣給客戶，只要**保留原著作權聲明與 MIT 授權全文**（放在你的 `LICENSE`／`THIRD_PARTY_NOTICES` 或「關於」頁）。MIT 沒有保固、沒有專利授權條款。
- **付費版／閉源功能**：程式碼裡**沒有**任何授權金鑰檢查、付費開關或「Pro 版」功能。`package.json` 只有一個 Open Collective 捐款連結。
- **第三方授權**：執行期沒有任何第三方程式庫被打包進去（`dependencies` 只有 `opencollective`、`opencollective-postinstall` 這兩個 npm 安裝時印捐款訊息的套件，瀏覽器端用不到）。如果你照 README 用 SheetJS 做 .xlsx 匯入匯出，SheetJS 社群版是 Apache-2.0，要另外附它的聲明。
- **後繼專案 wolf-table**：屬於另一個 GitHub 組織（wolf-table/table），本次**沒有掃描**，其授權與功能「未確認」。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容 |
|---|---|
| 前端 | 純 ES2015+ JavaScript（class、箭頭函式），LESS 寫樣式；繪製用 Canvas 2D（[BASE/src/canvas/draw.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/canvas/draw.js)）。沒有 React／Vue／jQuery。 |
| 型別 | 有手寫的 TypeScript 宣告檔 [BASE/src/index.d.ts](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/index.d.ts)（Options、CellData、SheetData、事件型別）。 |
| 建置工具 | webpack 4 + babel 7 + less-loader（[BASE/build/webpack.config.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/build/webpack.config.js) 等；版本見 `package.json` 的 `devDependencies`）。都是 2019–2020 年的版本，新版 Node 上重建可能要處理相容性問題（未實測）。 |
| 後端 | **沒有**。資料存哪裡完全由你決定（`change` 事件 + `getData()`）。 |
| 資料庫 | 無內建。可存 Firestore、localStorage、任何 REST API。 |
| 部署 | 靜態檔案即可：`dist/xspreadsheet.js`、`dist/xspreadsheet.css`、`dist/locale/*.js`。README 提供 unpkg CDN（版本 1.1.5）；`package.json` 目前版本號是 1.1.8。 |
| 套件大小 | 本次用 `git cat-file -s` 量 repo 裡已提交的建置檔：`dist/xspreadsheet.js` 202,350 bytes（約 198 KB；我自己用 `gzip -9` 壓縮後約 42 KB）、`dist/xspreadsheet.css` 23,713 bytes、`dist/locale/zh-cn.js` 3,601 bytes。repo 內的 `dist/` 是否與最新 `src/` 同步：未確認。 |
| 硬體／GPU | 不需要。一般電腦、手機瀏覽器都能跑。 |
| API Key／費用 | **零**。沒有任何雲端服務、沒有 AI、沒有遙測。 |

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

本次用 `git ls-tree -r --name-only HEAD` 拿到完整清單：整個 repo 159 個檔案，其中 `src/` 96 個。

```
x-spreadsheet/
├── readme.md                 ← 使用說明（CDN、NPM、事件、i18n、功能清單）
├── LICENSE                   ← MIT
├── package.json              ← npm 名 x-data-spreadsheet，main 指向 src/index.js
├── index.html                ← 開發用 demo（1000 列假資料、extendToolbar 範例）
├── build/                    ← webpack 設定（dev / prod / locale 打包）
├── dist/ 與 docs/            ← 已提交的建置成品（JS/CSS/locale、GitHub Pages demo）
├── test/                     ← mocha 單元測試，9 個檔、共 845 行，只測 core
└── src/
    ├── index.js              ← 對外 API：Spreadsheet 類別、loadData/getData/cellText/on/change/locale
    ├── index.d.ts            ← TypeScript 型別宣告
    ├── index.less            ← 全部樣式
    ├── config.js             ← CSS 前綴 x-spreadsheet、devicePixelRatio
    ├── canvas/
    │   ├── draw.js           ← ★ Canvas 繪製底層：文字換行、框線、裁切、錯誤紅角、凍結標記
    │   └── draw2.js          ← 舊版／實驗用繪圖（未被主流程引用，未逐行確認）
    ├── core/                 ← ★ 純資料邏輯（不碰 DOM，最好拆）
    │   ├── data_proxy.js     ← ★★ 單一工作表的大腦（1257 行）：選取、複製貼上、合併、凍結、插入刪除、篩選、undo、getData/setData
    │   ├── row.js / col.js   ← 稀疏列／欄資料、列高欄寬、隱藏、插入刪除時改寫公式參照
    │   ├── cell.js           ← ★ 公式解析與計算（中序→後序、堆疊求值、循環參照防呆）
    │   ├── formula.js        ← ★ 函數表（8 個）
    │   ├── format.js         ← 數字格式（11 種）
    │   ├── helper.js         ← cloneDeep、merge、numberCalc（小數運算）
    │   ├── history.js        ← undo/redo（整份 JSON 快照）
    │   ├── clipboard.js      ← 內部剪貼簿狀態
    │   ├── merge.js          ← 合併儲存格清單
    │   ├── auto_filter.js    ← 篩選／排序
    │   ├── validation.js / validator.js ← 資料驗證（list/number/date/phone/email）
    │   ├── cell_range.js     ← 範圍運算（A1:C3 ↔ 座標、交集、差集）
    │   ├── alphabet.js       ← A1 ↔ (x,y) 轉換
    │   └── selector.js / scroll.js / font.js
    ├── component/            ← UI 元件（DOM）
    │   ├── sheet.js          ← ★★ 事件中樞（1013 行）：滑鼠、鍵盤、捲動、貼上、自動填滿、右鍵選單
    │   ├── table.js          ← ★ 把 data_proxy 畫到 canvas（可視範圍、凍結四象限、合併格）
    │   ├── editor.js         ← 儲存格編輯 textarea、公式提示、日期選擇器
    │   ├── selector.js       ← 選取框、填滿把手、隱藏 input（中文輸入法 compositionend）
    │   ├── toolbar/          ← 工具列按鈕（每個按鈕一個檔）＋ extendToolbar
    │   ├── contextmenu.js    ← 右鍵選單
    │   ├── bottombar.js      ← 工作表分頁
    │   ├── sort_filter.js    ← 篩選下拉
    │   ├── modal_validation.js ← 資料驗證設定視窗
    │   ├── print.js          ← 列印預覽（分頁畫到 canvas 再 window.print）
    │   └── event.js / element.js ← 小型事件系統與 DOM 包裝（h('div') 那種）
    └── locale/               ← en / zh-cn / de / nl 四種語言，沒有 zh-TW
```

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 進入點與多工作表**
- [BASE/src/index.js 第 11–42 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/index.js#L11-L42)：`new Spreadsheet(selector, options)` 建立根節點，每個工作表是一個 `DataProxy`，`Sheet` 元件只有一個，切換分頁時 `sheet.resetData(d)` 換掉資料。
- [第 133–136 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/index.js#L133-L136)：把工廠函式掛到 `window.x_spreadsheet`，所以 CDN 版直接能用。

**5.2 資料模型（稀疏 JSON）**
- [BASE/src/core/data_proxy.js 第 18–70 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L18-L70)：作者用註解寫出完整格式——`styles` 是樣式陣列，儲存格只存樣式索引；`rows[ri].cells[ci] = { text, style, merge }`；`merges` 是 `'A1:F11'` 字串陣列。
- [第 1208–1217 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L1208-L1217) `addStyle()`：新樣式先跟既有樣式逐一比對（`helper.equals`），相同就重用索引——這就是「樣式去重」，讓 JSON 很小。
- [第 1225–1256 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L1225-L1256) `setData()/getData()`：`freeze` 以 `"A1"` 字串存；只輸出 name/freeze/styles/merges/rows/cols/validations/autofilter。注意 `hyperlinks`、`comments` 在建構子裡有欄位（[第 336–337 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L336-L337)），但沒有任何功能、也不會被存。

**5.3 Canvas 繪製與虛擬捲動**
- [BASE/src/core/data_proxy.js 第 1110–1135 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L1110-L1135) `viewRange()`：從目前捲動到的列／欄開始累加高度寬度，超過畫面就停 → 只算出「看得到的範圍」。
- [BASE/src/component/table.js 第 314–366 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/table.js#L314-L366) `render()`：每次重畫整張 canvas，依序畫格線、內容、欄列標題；有凍結時再畫上方、左方、左上三塊（「凍結四象限」）。
- [第 52–108 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/table.js#L52-L108) `renderCell()`：每格取樣式 → 畫底色框線 → **在這裡即時計算公式**（第 78–82 行）→ 套數字格式 → 畫文字 → 驗證錯誤畫紅角。
- [BASE/src/canvas/draw.js 第 218–270 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/canvas/draw.js#L218-L270) `text()`：逐字 `measureText` 做自動換行（中文逐字斷行 OK）；[第 381–394 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/canvas/draw.js#L381-L394) `rect()` 用 `clip()` 把文字裁在格內（所以長文字**不會**像 Excel 一樣溢到右邊空格）。
- 高解析度螢幕：[第 2–12 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/canvas/draw.js#L2-L12) 依 `devicePixelRatio` 放大座標。

**5.4 公式引擎**
- [BASE/src/core/cell.js 第 5–120 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/cell.js#L5-L120) `infixExprToSuffixExpr()`：手寫的中序轉後序（類似 Shunting-yard），處理 `+ - * /`、括號、函數、字串 `"..."`、比較運算子 `= == > >= < <=`；**範圍 `A1:B5` 在解析時就展開成每一格**（第 39–55 行），所以 `SUM(A1:A10000)` 會推 1 萬個參照進堆疊。
- [第 144–205 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/cell.js#L144-L205) `evalSuffixExpr()`：堆疊求值；遇到儲存格參照就遞迴計算該格（第 193–200 行用 `cellList` 偵測循環參照，偵測到直接回傳 0）。
- [第 207–219 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/cell.js#L207-L219) `cellRender()`：以 `=` 開頭才算。**沒有依賴圖、沒有快取**——每次畫面重繪，可視範圍內每個公式格都從頭遞迴算一次。
- [BASE/src/core/formula.js 第 17–75 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/formula.js#L17-L75)：函數表，見第 11 節的計數。
- [BASE/src/core/helper.js 第 113–134 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/helper.js#L113-L134) `numberCalc()`：為了避免 `0.1+0.2` 浮點誤差，加減乘的結果用 `toFixed(兩個運算元中較多的小數位數)`，除法結果小數超過 5 位就 `toFixed(2)`。這招在加減法 OK，**乘除法會丟精度**（見第 9 節）。

**5.5 編輯、鍵盤、中文輸入**
- [BASE/src/component/sheet.js 第 739–885 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/sheet.js#L739-L885)：全域 keydown——方向鍵、Tab、Enter、Ctrl+Z/Y、Ctrl+B/I/U、Ctrl+方向鍵跳到邊界、F2 進入編輯、Delete/Backspace 清內容；按英數鍵或 `=` 直接開始輸入。
- [BASE/src/component/selector.js 第 22–29 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/selector.js#L22-L29)：選取框裡藏一個 `<input>`，監聽 `compositionend`——**注音／倉頡等輸入法選完字就直接寫進儲存格**，對台灣使用者是重要細節。
- [BASE/src/component/editor.js 第 58–106 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/editor.js#L58-L106)：編輯框 textarea；打 `=` 會跳函數提示；儲存格有 list 驗證時變成下拉建議；date 驗證會開日期選擇器。

**5.6 複製、剪下、貼上、自動填滿**
- 內部複製貼上：[BASE/src/core/data_proxy.js 第 447–461 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L447-L461) 支援「全部／只貼值／只貼格式」（右鍵選單有三種）。
- 複製到系統剪貼簿：[第 407–440 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L407-L440)，Tab 分隔、`\n` 換列，**複製的是原始文字（公式字串），不是計算結果**。
- 從外部貼上：[第 463–494 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L463-L494) 用 `navigator.clipboard.readText()` 讀純文字，以 `\n`、`\t` 切開逐格寫入。
- 自動填滿：[BASE/src/core/row.js 第 113–178 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/row.js#L113-L178)，公式會用正規表示式把 `A1` 類參照位移；一般文字若結尾是數字就遞增（例如 `品項1 → 品項2`）。

**5.7 Undo／Redo**
- [BASE/src/core/history.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/history.js)：每次變更前把**整個工作表 `getData()` 做 `JSON.stringify` 快照**推進陣列，沒有上限。
- [BASE/src/core/data_proxy.js 第 1219–1223 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L1219-L1223) `changeData()`：所有「正規」修改都包在這裡 → 存快照 → 改資料 → 觸發 change。

**5.8 合併、凍結、插入刪除列欄**
- 合併：[第 776–803 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L776-L803)；凍結：[第 1042–1046 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L1042-L1046)。
- 插入／刪除列欄：[第 864–930 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L864-L930)，並由 [BASE/src/core/row.js 第 210–282 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/row.js#L210-L282) 改寫受影響公式的參照。

**5.9 篩選、排序、資料驗證、列印**
- 篩選：[BASE/src/core/auto_filter.js 第 18–27 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/auto_filter.js#L18-L27) 實際只支援「全部」與「勾選值（in）」兩種條件。
- 排序：[BASE/src/core/data_proxy.js 第 830–851 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L830-L851)（問題見第 9 節）。
- 資料驗證：[BASE/src/core/validator.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/validator.js)，類型 list/number/date/phone/email，比較運算 between/notBetween/eq/neq/lt/lte/gt/gte。
- 列印：[BASE/src/component/print.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/print.js) 依紙張大小把內容分頁畫到多張 canvas 再呼叫列印。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 稀疏資料模型＋樣式去重 | [data_proxy.js 第 18–70、1208–1256 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L18-L70) | helper.js | 低 | 直接當你自家試算表／倉儲表格的 JSON 格式規格，存 Firestore 很省空間。 |
| A1 參照轉換工具 | [alphabet.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/alphabet.js) | 無 | 低 | 91 行，`expr2xy('B10')`、`xy2expr(1,9)`、`expr2expr` 位移參照，任何表格工具都用得到。 |
| 範圍運算 CellRange | [cell_range.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/cell_range.js) | alphabet.js | 低 | 交集、差集、包含、`valueOf('A1:C3')`；有 368 行單元測試護航（[test/core/cell_range_test.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/test/core/cell_range_test.js)）。 |
| Canvas 繪圖小工具 Draw/DrawBox | [canvas/draw.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/canvas/draw.js) | 無 | 低 | 403 行，含高 DPI、文字換行、框線樣式、裁切。自己用 Canvas 畫「庫存熱圖」「貨架格位圖」時可以直接搬。 |
| 可視範圍渲染器 | [table.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/table.js) ＋ [data_proxy.js viewRange](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L1110-L1135) | Draw、DataProxy | 中 | 學「只畫看得到的格子＋凍結四象限」的寫法；要搬需連 DataProxy 介面一起帶走。 |
| 公式解析器（中序→後序） | [cell.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/cell.js) ＋ [formula.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/formula.js) | alphabet.js、helper.js | 低 | 當教材很好；**不建議**直接用在算錢（精度、函數太少）。可改成只保留解析、計算交給 formula.js 類函式庫。 |
| 資料驗證規則 | [validator.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/validator.js) | locale | 低 | 136 行，可搬到你的倉儲表單做「數量必須介於 1–999」「狀態必須是下拉清單之一」。phone 規則要改成台灣格式。 |
| 小型事件系統 | [event.js 第 88–153 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/event.js#L88-L153) | 無 | 低 | `on/once/fire/removeListener`，純 JS 專案可直接用。 |
| 自訂工具列按鈕 | [toolbar/index.js 第 84–104、158–170 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/toolbar/index.js#L84-L104) | 整個元件 | 低（用）／中（改） | 不用改原始碼就能加「存檔」「AI 產生」按鈕，`onClick(data, sheet)` 拿到資料。 |
| 中文輸入法處理 | [selector.js 第 22–29 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/selector.js#L22-L29) | element.js | 低 | 自己用 Canvas 做格子時，「隱藏 input + compositionend」是讓注音輸入正常的關鍵技巧。 |
| 列印分頁 | [print.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/print.js) | Draw、table.renderCell | 中 | 想把倉儲盤點表印成 A4 可參考。 |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **完全沒有 AI 功能**：`src/` 裡沒有任何 LLM、prompt、MCP、Skills 相關程式碼；本次 `grep` 也找不到 `fetch(`、`XMLHttpRequest` 等網路請求。
- **能不能接 Claude：可接**，有兩條路：
  1. **工具列按鈕（最簡單）**：用 `extendToolbar` 加一顆「AI 產生文案」按鈕，`onClick(data)` 拿到目前工作表 JSON → 呼叫你自己的 Firebase Cloud Function（裡面放 Anthropic API Key，**不要把 Key 放前端**）→ 把 Claude 回傳的文字用 `s.cellText(ri, ci, text).reRender()` 寫回儲存格。例如 A 欄商品名、B 欄賣點，按一下讓 Claude 在 C 欄寫 30 字廣告文案。
  2. **自訂 `=AI()` 公式（不建議）**：公式是在**每次重繪時同步計算**（[table.js 第 78–82 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/table.js#L78-L82)），不能 `await` 網路請求；硬做會每次捲動就打一次 API、花錢又卡。若真要做，要自己加快取層（第一次回傳「計算中…」、背景拿到結果後存快取並 `reRender()`）。
- **讓 Claude Code 讀懂它**：程式碼小、命名一致、沒有框架魔法，把 `src/core/` 整個資料夾丟給 Claude Code 就能請它改寫（例如「幫我把 numberCalc 換成 decimal.js」）。

---

## 8. 擴充方式與 API

**對外 API（[BASE/src/index.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/index.js) 與 [index.d.ts 第 143–202 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/index.d.ts#L143-L202)）**

| API | 用途 | 注意 |
|---|---|---|
| `new Spreadsheet(el, options)` / `x_spreadsheet(el, options)` | 建立 | options 見 [index.d.ts 第 8–48 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/index.d.ts#L8-L48)：`mode: 'edit'|'read'`、`showToolbar`、`showGrid`、`showContextmenu`、`showBottomBar`、`view.width/height`（函式）、`row.len/height`、`col.len/width`、預設 `style`、`extendToolbar`、`autoFocus` |
| `loadData(json 或 json[])` / `getData()` | 讀寫全部資料 | `loadData` **會改動你傳進去的物件**（刪掉 `rows.len`、`cols.len`，見 [row.js 第 339–345 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/row.js#L339-L345)），傳之前先 `structuredClone` |
| `cellText(ri, ci, text, sheetIndex)` | 程式寫入儲存格 | 寫完要 `reRender()`；不會觸發 `change` |
| `cell(ri, ci, sheetIndex)` / `cellStyle(...)` | 讀儲存格物件／樣式 | 讀到的是原始 `text`（公式字串），**沒有 API 直接拿計算結果** |
| `on('cell-selected' / 'cells-selected' / 'cell-edited' / 'pasted-clipboard', fn)` | 事件 | `cell-edited` 在**每個按鍵**都觸發（[sheet.js 第 513–524 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/sheet.js#L513-L524)）|
| `change(fn)` | 資料變更 | 大部分操作都會觸發，但**拖拉欄寬列高、隱藏列欄不觸發**（它們直接改 rows/cols，沒走 `changeData`，見 [sheet.js 第 477–511 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/sheet.js#L477-L511)） |
| `validate()` | 回傳目前工作表驗證是否全過 | |
| `deleteSheet()`、`reRender()` | | |
| `Spreadsheet.locale(lang, messages)` | 多語系 | 見第 11 節 |

**擴充點**
- **工具列**：`extendToolbar`（不用改原始碼）。
- **函數**：沒有正式 API。`formulam`、`baseFormulas` 是模組層級的可變物件（[formula.js 第 77–98 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/formula.js#L77-L98)），用打包工具（webpack/Vite）直接 import `x-data-spreadsheet/src/core/formula` 並塞新函數「理論上」可行，因為 `package.json` 的 `main` 就是 `src/index.js`、同一個模組實例；CDN 的 `dist` 版則碰不到，只能 fork。以下是概念範例（未實測）：
  ```js
  import { formulam, baseFormulas } from 'x-data-spreadsheet/src/core/formula';
  const ROUND = { key: 'ROUND', title: () => '四捨五入',
    render: ([v, d]) => Number(Number(v).toFixed(Number(d || 0))) };
  baseFormulas.push(ROUND);   // 讓編輯時的提示清單看得到
  formulam.ROUND = ROUND;     // 讓計算時找得到
  ```
- **數字格式**：同理 `formatm`／`baseFormats`（[format.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/format.js)），可加 `NT$` 格式。
- **右鍵選單、驗證類型**：寫死在 [contextmenu.js 第 6–28 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/contextmenu.js#L6-L28) 與 validator.js，要改只能 fork。

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

**維護狀況**
- 專案描述明寫「已遷移到 @wolf-table/table」；master HEAD 的 commit 日期是 2023-08-15。**視為停止維護**，有 bug 要自己修。
- CI 設定是 Travis + Node 10.12（[BASE/.travis.yml](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/.travis.yml)），屬於已停用的舊服務。

**測試**
- `test/` 9 個檔共 845 行（`wc -l` 自己數），只測 core（alphabet、cell_range、cell、font、format、formula、helper、locale），UI 與 data_proxy 幾乎沒測。公式測試見 [test/core/cell_test.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/test/core/cell_test.js)。

**資安／隱私／遙測**
- 執行期**沒有遙測、沒有對外連線**（`grep fetch\(|XMLHttp|analytics` 無結果）。demo 用的 `index.html` 會載入 ghbtns.com 的 GitHub 星星 iframe，只有 demo 頁有，套件本身沒有。
- `npm install` 時 `opencollective-postinstall` 會印捐款訊息（安裝期 script；本次依規定未執行）。
- **潛在 XSS**：編輯框用來量文字寬度的 `textlineEl` 用 `innerHTML` 塞入儲存格文字（[editor.js 第 80、102、122 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/editor.js#L80) 呼叫 [element.js 第 213–219 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/element.js#L213-L219) 的 `html()`）。如果載入的資料來自不可信來源（例如多人共用的 Firestore 文件），有人在儲存格存 `<img src=x onerror=...>`，別人**雙擊編輯那格時就可能執行**。自用風險低；要給員工／客戶共用時，建議把那幾行改成 `textContent`。

**已知的坑（依程式碼判讀，未實際執行）**
1. **小數乘除會四捨五入**（[helper.js 第 113–134 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/helper.js#L113-L134)）：乘法結果被 `toFixed` 成「兩個數字中較多的小數位數」，例如 `=0.5*0.5` 依程式邏輯會顯示 `0.3` 而不是 `0.25`；除法結果超過 5 位小數就變成 2 位，`=1/3` 得 `0.33`，再被別的格參照時是用 `0.33` 繼續算。**對成本、匯率、毛利率計算是致命問題**。
2. **AVERAGE 把空白格算進分母、MIN/MAX 把空白當 0**：範圍在解析時逐格展開，空白格取到 `''` → `Number('')` 為 0（[formula.js 第 23–37 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/formula.js#L23-L37)）。
3. **「排序」不是依數值排序**：[data_proxy.js 第 830–851 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L830-L851) 拿去 sort 的是**列號**而不是儲存格內容，結果只會是「原順序」或「整個反過來」。
4. **不支援絕對參照 `$A$1`、跨工作表 `Sheet2!A1`**：解析器沒有處理 `$` 與 `!`（[cell.js 第 5–120 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/cell.js#L5-L120)），`$` 會被當成運算子；比較運算也不支援 `<>`。
5. **Undo 記憶體無上限**：每次修改都存整份 JSON 快照（[history.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/history.js)）；大表 + 長時間編輯會吃光記憶體。
6. **從外部貼上不能復原**：`pasteFromSystemClipboard` 走 `setCellText(..., 'input')`，沒進 history（[data_proxy.js 第 463–479、1023–1035 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L1023-L1035)）。
7. **change 事件很吵**：輸入時每個按鍵都 `getData()` 整份資料並觸發 change；存 Firestore 一定要 debounce。
8. **驗證規則是中國格式**：`phone` 規則 `/^[1-9]\d{10}$/` 是中國 11 碼手機，台灣 `09xxxxxxxx` 會判錯；`email` 規則少了反斜線（寫成 `w+` 而非 `\w+`），基本上無效（[validator.js 第 4–7 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/validator.js#L4-L7)）。
9. **百分比格式只是後面加 %**：`0.1` 會顯示 `0.1%`，不會乘 100（[format.js 第 35–41 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/format.js#L35-L41)）；日期／時間格式只是原樣顯示。
10. **數字千分位格式的寫法有瑕疵**：`split('\\.')` 切的是字面上的 `\.`（[format.js 第 5–13 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/format.js#L5-L13)），回傳陣列再被轉字串，結果大致正確但屬於「剛好能動」。

---

## 10. 跟其他專案組合的建議

針對「挑 A＋B＋C 的好部分，用 Claude Code 自己做」：

1. **x-spreadsheet（UI 外殼）＋ formula.js 類函式庫（函數）＋ decimal.js 類函式庫（精度）**：保留 x-spreadsheet 的 Canvas 介面與資料模型，把 `numberCalc` 換成十進位精確運算、把 `formulam` 擴充成 Excel 常用函數（SUMIF、VLOOKUP、ROUND…）。整體仍是純 JS、MIT 友善。注意：同資料夾的 **HyperFormula 是 GPL-3.0／商業雙授權**，個人用沒問題，日後公司商用要付費或開源，選它前先看授權（見 `handsontable__hyperformula.md`）。
2. **x-spreadsheet ＋ SheetJS（匯入匯出 .xlsx）**：README 直接指向 SheetJS 的 xspreadsheet demo（[readme.md](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/readme.md)）。只能轉值與部分格式，保真度有限，適合「把廠商報價 Excel 拉進來看」，不適合來回編輯複雜格式檔（見 `SheetJS__sheetjs.md`）。
3. **x-spreadsheet 當「輕量檢視器」，Univer／Luckysheet 當「重型編輯器」**：倉儲 App 裡只要看、少量改的頁面用 x-spreadsheet（42 KB gzip、零依賴）；真的要算成本、做報表的頁面用 Univer（Apache-2.0、函數多、維護中）。
4. **自己寫專用表格**：如果你的需求其實是「商品 × 倉位 × 數量」的固定欄位表，與其嵌整個試算表，不如拆 `alphabet.js`＋`cell_range.js`＋`draw.js`＋`table.js` 的思路，請 Claude Code 寫一個只做你需要功能的 Canvas 表格，資料直接對 Firestore 集合。
5. **AI 欄位**：用 `extendToolbar` 加按鈕 → Firebase Cloud Function → Claude API → `cellText()` 回填，做「批次產生商品文案／廣告標題／短影音腳本大綱」的試算表介面（第 7 節）。

---

## 11. 網頁 Excel 能力檢查表

**渲染方式（Canvas／DOM／WebGL）**：**Canvas 2D**。格子、文字、框線全畫在一張 canvas 上；編輯框、選取框、選單是 DOM 疊在上面。→ [table.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/table.js)、[draw.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/canvas/draw.js)

**虛擬捲動**：**有**（只畫可視範圍）。`viewRange()` 算出看得到的列欄，`render()` 只畫那一塊。→ [data_proxy.js 第 1110–1135 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L1110-L1135)

**10 萬列以上的效能**：**未確認（未實測），依程式推估偏弱**。純資料捲動應可接受，但：總高度、滑鼠點擊定位（[data_proxy.js 第 276–304 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L276-L304)）都是從第 0 列線性加總；每次編輯都 `JSON.stringify` 整張表做 undo 快照；公式每次重繪都全部重算且範圍逐格展開。官方 demo 只放 1,000 列（[index.html](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/index.html)）。預設 `row.len` 只有 100 列，要更多需設定 `row: { len: 100000 }` 或在資料裡給 `rows.len`。

**公式引擎－函數數量**：**8 個可用**：SUM、AVERAGE、MAX、MIN、IF、AND、OR、CONCAT。另有 DIVIDE、PRODUCT、SUBTRACT 3 個被註解掉。**數法**：`grep -c "^    key:" src/core/formula.js` 得 11 筆，再人工確認第 58–74 行在 `/* */` 註解中，扣掉 3 個 = 8。→ [formula.js 第 17–75 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/formula.js#L17-L75)

**公式引擎－解析器與依賴圖／重算**：解析器在 [cell.js 第 5–120 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/cell.js#L5-L120)（中序→後序），求值在 [第 144–219 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/cell.js#L144-L219)。**沒有依賴圖**，重算方式是「畫到哪格就遞迴算哪格」（[table.js 第 78–82 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/table.js#L78-L82)）；循環參照回傳 0。`evalPaused` 設定可暫停計算。

**陣列公式**：**沒有**。

**跨工作表參照**：**沒有**（不解析 `!`；公式取值只讀目前工作表）。

**自訂函數**：**沒有正式 API**；可用 import 模組改 `formulam` 的方式硬加（第 8 節，未實測），CDN 版需 fork。

**儲存格編輯**：**有**。雙擊、F2、直接打字；Alt+Enter 換行；注音輸入法經 `compositionend` 直接寫入。→ [sheet.js 第 739–885 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/sheet.js#L739-L885)、[selector.js 第 22–29 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/selector.js#L22-L29)

**複製貼上（能否直接從 Excel／Google 試算表貼上）**：**部分**。內部複製貼上支援全部／只值／只格式；從 Excel／Google 試算表貼上**只吃純文字**（Tab 分隔），**格式、合併、公式計算結果都不會帶過來**；需要瀏覽器剪貼簿讀取權限（HTTPS）；以 `\n` 切列，Excel 的 `\r\n` 可能讓每列最後一格殘留 `\r`；含換行的儲存格會錯位；且不能 undo。→ [data_proxy.js 第 463–509 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L463-L509)、[sheet.js 第 332–350 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/sheet.js#L332-L350)

**拖拉填滿**：**有**（選取框右下角把手）。數字結尾遞增、公式參照位移；**沒有**日期序列、等差推算（例如 2、4 → 6）。→ [row.js 第 113–178 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/row.js#L113-L178)

**復原／重做**：**有**（Ctrl+Z／Ctrl+Y），整份快照式、無上限；拖拉欄寬列高、隱藏、外部貼上不在 history 內。→ [history.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/history.js)

**數字格式**：**有，11 種**（normal、text、number、percent、rmb、usd、eur、date、time、datetime、duration；自己數 `baseFormats` 陣列）。沒有自訂格式字串（像 `#,##0.00`），沒有新台幣；percent 與日期類只是字串加工。→ [format.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/format.js)

**條件格式**：**沒有**（`src/` 內無相關程式）。

**合併儲存格**：**有**。→ [data_proxy.js 第 776–803 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L776-L803)

**凍結窗格**：**有**（以目前選取格為界，凍結上方列與左方欄）。→ [table.js 第 336–365 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/table.js#L336-L365)

**欄寬列高**：**有**（拖拉標題邊界，多選時一起調）、可隱藏／取消隱藏列欄。→ [sheet.js 第 477–511 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/sheet.js#L477-L511)

**篩選**：**有，但很陽春**：只能勾選要顯示的值（in）。→ [auto_filter.js 第 18–27、121–144 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/auto_filter.js#L121-L144)

**排序**：**名義上有，實際不可用**：依列號而非內容排序（第 9 節第 3 點）。→ [data_proxy.js 第 830–851 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L830-L851)

**資料驗證（下拉選單）**：**有**。類型 list（逗號分隔選項 → 編輯時出現下拉建議）、number、date（日期選擇器）、phone、email；可設必填與範圍比較；不合格的格子畫紅角。→ [validator.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/validator.js)、[validation.js](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/validation.js)、[editor.js 第 251–275 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/editor.js#L251-L275)

**圖表**：**沒有**（工具列 `chart` 分支是空的，[sheet.js 第 569–572 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/sheet.js#L569-L572)）。

**樞紐分析**：**沒有**。

**圖片／附件**：**沒有**。超連結、註解只有空欄位（[data_proxy.js 第 336–337 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L336-L337)），無功能。

**匯入匯出 .xlsx／.csv**：**開源版本身沒有**。README 指向 SheetJS 的 xspreadsheet demo（外部、本次未驗證其程式）；保真度：未確認，依 x-spreadsheet 資料模型能承載的內容推估，最多只能帶值、合併、部分樣式。CSV 也沒有內建，但用 `getData()` 自己轉很簡單。列印：**有**。

**多人即時協作**：**沒有**（無 OT／CRDT／鎖定）。要做只能自己用 Firestore `onSnapshot` 整份覆蓋（後寫的人會蓋掉先寫的人）。

**資料模型與存進 Firestore**：`getData()` 回傳「工作表陣列」，每張表大致如下（依 [data_proxy.js 第 1242–1256 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/data_proxy.js#L1242-L1256) 與 [validation.js 第 39–47 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/core/validation.js#L39-L47) 整理）：

```json
[{
  "name": "進貨成本",
  "freeze": "A2",
  "styles": [{ "font": { "bold": true }, "bgcolor": "#fff2cc" }, { "format": "number" }],
  "merges": [],
  "rows": {
    "len": 100,
    "0": { "cells": { "0": { "text": "品名", "style": 0 }, "1": { "text": "單價", "style": 0 },
                      "2": { "text": "數量", "style": 0 }, "3": { "text": "小計", "style": 0 } } },
    "1": { "cells": { "0": { "text": "保溫杯" }, "1": { "text": "199", "style": 1 },
                      "2": { "text": "12" }, "3": { "text": "=B2*C2", "style": 1 } } }
  },
  "cols": { "len": 26, "0": { "width": 160 } },
  "validations": [{ "refs": ["E2:E100"], "mode": "cell", "type": "list",
                    "required": false, "operator": "", "value": "未下單,已下單,已到貨" }],
  "autofilter": {}
}]
```

存 Firestore 建議：(1) **直接 `JSON.stringify` 成一個字串欄位**最省事，避開 Firestore 對巢狀陣列與欄位名稱的限制；(2) 單一文件上限 1 MiB，大表請一張工作表一份文件，或依列分段存子集合；(3) `change` 事件一定要 debounce（例如 1 秒）；(4) 讀回時先複製一份再 `loadData`（它會改動傳入物件）；(5) 欄寬列高變動不觸發 change，存檔按鈕或 `beforeunload` 時再主動 `getData()` 一次。

**手機／觸控**：**部分**。有觸控滑動捲動（[event.js 第 57–85 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/event.js#L57-L85)、[sheet.js 第 650–655 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/sheet.js#L650-L655)），工具列寬度不夠時會收進「更多」選單；點選、雙擊編輯依賴瀏覽器把觸控轉成滑鼠事件，實際手感未確認；沒有針對手機的介面。

**繁體中文介面**：**沒有現成的**，只有 en、zh-cn、de、nl（[BASE/src/locale/](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/locale/zh-cn.js)）。做法：複製 `zh-cn.js`（136 行）改成繁體與台灣用語（撤销→復原、粘贴→貼上、单元格→儲存格），再 `x_spreadsheet.locale('zh-tw', zhTW)`；語系機制見 [locale.js 第 57–71 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/locale/locale.js#L57-L71)。注意 `rmb` 格式顯示「￥」，台幣需自己加格式。

**嵌入方式（純 JavaScript 網頁）**：**可以**，不需要 React／Vue。最小可用範例（CDN 版，依 README 寫法；Firestore 部分假設你現有 App 已初始化 `db`，未實測）：

```html
<link rel="stylesheet" href="https://unpkg.com/x-data-spreadsheet@1.1.5/dist/xspreadsheet.css">
<script src="https://unpkg.com/x-data-spreadsheet@1.1.5/dist/xspreadsheet.js"></script>
<script src="https://unpkg.com/x-data-spreadsheet@1.1.5/dist/locale/zh-cn.js"></script>
<div id="sheet" style="height:600px"></div>
<script type="module">
  import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
  // db 為你 App 既有的 Firestore 實例
  x_spreadsheet.locale('zh-cn');
  const box = document.getElementById('sheet');
  const s = x_spreadsheet(box, {
    view: { width: () => box.clientWidth, height: () => box.clientHeight },
    row: { len: 500, height: 25 },
    extendToolbar: { right: [{ tip: '存檔', el: Object.assign(document.createElement('span'), { textContent: '存' }),
      onClick: () => save() }] },
  });
  const ref = doc(db, 'sheets', 'purchase-cost');
  const snap = await getDoc(ref);
  if (snap.exists()) s.loadData(JSON.parse(snap.data().json));
  const save = () => setDoc(ref, { json: JSON.stringify(s.getData()), updatedAt: Date.now() });
  let t; s.change(() => { clearTimeout(t); t = setTimeout(save, 1000); });
</script>
```

套件大小：`dist/xspreadsheet.js` 約 198 KB（gzip 約 42 KB）＋ CSS 約 23 KB，沒有其他依賴（數字來源見第 3 節）。

**API／事件**：**有**。監聽：`change`、`cell-selected`、`cells-selected`、`cell-edited`、`pasted-clipboard`；讀寫：`cell()`、`cellStyle()`、`cellText()`＋`reRender()`、`getData()`、`loadData()`。缺點：沒有「取得計算後的值」API、`cellText()` 不觸發 change、沒有批次寫入 API（大量寫入請直接組 JSON 再 `loadData`）。→ [index.js 第 89–128 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/index.js#L89-L128)、[sheet.js 第 70–88 行](https://github.com/myliang/x-spreadsheet/blob/0c55f3ee1e708002eaef280432d6efeaeabdc886/src/component/sheet.js#L70-L88)

---

## 關鍵字

x-spreadsheet、x-data-spreadsheet、myliang、wolf-table、網頁版 Excel、網頁試算表、線上試算表、Canvas 試算表、canvas spreadsheet、web spreadsheet、純 JavaScript、vanilla JS、零依賴、虛擬捲動、virtual rendering、公式解析器、formula parser、中序轉後序、shunting-yard、稀疏 JSON、資料模型、Firestore、Firebase、資料驗證、下拉選單、data validation、凍結窗格、合併儲存格、自動填滿、autofill、undo redo、SheetJS、xlsx 匯入匯出、extendToolbar、自訂工具列、注音輸入法、compositionend、MIT 授權、停止維護、學習範本、輕量嵌入
