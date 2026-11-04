# jspreadsheet/ce — 純 JavaScript、免框架、MIT 授權的輕量「可編輯表格／簡易試算表」元件

> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：d9c04e8
> GitHub：https://github.com/jspreadsheet/ce｜⭐ 7242｜授權：MIT（公式引擎為另一個 npm 套件 @jspreadsheet/formula，其 Basic 版亦標示 MIT）｜主要語言：JavaScript｜最近更新：2026-10-14

本資料包所有程式碼連結都指向 commit `d9c04e8a1acec6b87b0580b79868cd4d2f73599e`（以下簡寫為「P」＝ `https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e`）。套件版本（package.json）：`jspreadsheet-ce` 5.0.4。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 一個約 1 萬行、純 JavaScript、用 HTML `<table>`（DOM）畫出來的「像 Excel 的可編輯表格」，丟一個 `<div>` 就能用，不需要 React／Vue，最適合直接嵌進你現有的 Firebase 倉儲網頁。

**對你最實際的用途：**
1. **倉儲／庫存批次編輯表**：把 Firestore 的商品清單載進來，像 Excel 一樣直接改庫存、成本、售價；`onafterchanges` 事件拿到「哪一格改了什麼」，逐格寫回 Firestore（第 11 節有最小範例）。
2. **成本／報價試算表**：欄位用 `=B2*C2*(1-D2)` 這類公式算毛利、折扣後售價、運費分攤；支援 `SUM`、`ROUND` 等常用函數（實際函數清單在另一個套件裡，見第 11 節）。
3. **從 Excel／Google 試算表貼上**：Ctrl+V 直接貼進一整塊（以 Tab 分隔的純文字），適合把廠商報價單、蝦皮／momo 後台匯出的資料貼進來整理。
4. **匯出 CSV**：一行 `worksheet.download()` 就能下載 CSV（含 UTF-8 BOM，Excel 開中文不會亂碼）。
5. **下拉選單、勾選框、日期、顏色、圖片欄**：做「供應商」下拉、「是否上架」勾選、「進貨日」日曆。
6. **廣告成效小表**：把各渠道花費、轉換貼進來，用公式算 ROAS／CPA。

**不適合拿來做的事：** 需要 .xlsx 匯入匯出、跨工作表公式、多人即時協作、圖表、樞紐分析、十萬列以上大資料——這些 CE 版都沒有（細節見第 11 節）。

---

## 2. 授權白話

- **本體（這個 repo）是 MIT**：[P/LICENSE](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/LICENSE)，版權人「Jspreadsheet Ltd」。`package.json` 的 `license` 也是 `MIT`（[P/package.json](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/package.json)）。
- **個人使用**：完全免費，可改、可複製程式碼到你的專案。
- **公司商用**：MIT 允許商用、修改、閉源再發佈；唯一義務是**保留原始版權聲明與授權文字**（例如在你的 JS 檔頭或 `LICENSES.txt` 放一份）。
- **公式引擎是另一個套件**：程式碼 `import formula from '@jspreadsheet/formula'`（[P/src/utils/internal.js#L2](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L2)）。我另外 clone 了同組織的 [jspreadsheet/formula](https://github.com/jspreadsheet/formula/blob/2cef76b9580a968482b9fb07470d5e6457794f34/README.md)，該 repo **只有一個 README，沒有原始碼**；README 表格寫「Formula Basic：MIT；Formula Premium：需授權（綁定網域）」。所以 CE 用的 Basic 版公式引擎是 MIT，但**原始碼不在 GitHub 上公開**（只能從 npm 套件看到發佈後的檔案，本次未檢查）。
- **付費版（Jspreadsheet Pro，不同產品）才有的功能**，官方比較表 [P/docs/jspreadsheet/docs/comparison.md](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/docs/jspreadsheet/docs/comparison.md) 列出 CE 沒有：多欄進階篩選、完整工作表管理（拖拉／改名／刪除）、原生持久化（row ID、儲存方法）、複製貼上時自動調整公式、儲存格層級的 renderer／editor／格式、**跨工作表計算**（Premium）、**原生資料驗證**（Premium）、列／欄群組、定義名稱、公式挑選器、Extensions；另外 xlsx 匯入匯出、即時協作也是 Pro 生態系的東西（README 連到 `spreadsheet-react-server`），CE 沒有。
- 結論：**CE 本身沒有「藏起來的付費功能開關」**，就是一個功能較少但完整開源的版本；要更多功能得換成 Pro（另一份閉源程式碼）。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 前端 | 純 JavaScript（ES 模組原始碼，webpack 打包成 UMD；`target: ['web','es5']`，見 [P/webpack.config.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/webpack.config.js)） |
| 執行期依賴 | `jsuites`（^5.12.0，同團隊的 UI 小工具庫：下拉、日曆、遮罩、分頁籤、右鍵選單、ajax）＋ `@jspreadsheet/formula`（^2.0.2，公式引擎） |
| 後端 | **不需要**。可選：給 `url`／`csv` 讓它 GET 載入資料；給 `persistence` 讓它把變更 POST 到你的伺服器（[P/src/utils/dispatch.js#L33-L58](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/dispatch.js#L33-L58)） |
| 資料庫 | 無內建；自己接 Firestore（用事件）最直接 |
| 部署 | 靜態檔，放 Firebase Hosting 即可 |
| 硬體／GPU | 無需求，一般瀏覽器 |
| API Key／費用 | 無；完全不連外（見第 9 節「遙測」） |
| 框架包裝 | repo 內有 Vue 包裝 `packages/vue/`；React 包裝是另一個 npm 套件（文件中出現 `@jspreadsheet-ce/react`，本 repo 未包含原始碼） |

**套件大小（自己量）：** repo 內 `dist/index.js` = 148,051 bytes（約 145 KB，未經 minify 的 UMD，`gzip -c | wc -c` 量得約 34 KB）；`dist/jspreadsheet.css` = 19,935 bytes；`dist/index.d.ts` = 85,271 bytes。**不含** jsuites 與 formula 套件（未量測）。

---

## 4. 程式架構地圖

repo 共 266 個檔案（`git ls-tree -r` 計數），大多是文件。真正的程式碼只有 `src/`：36 個 JS 檔、共 10,903 行（`wc -l src/*.js src/utils/*.js`）。

```
ce/
├── src/
│   ├── index.js            進入點：jspreadsheet(el, options)、destroy、setDictionary、helpers（95 行）
│   ├── webcomponent.js     <j-spreadsheet-ce> Web Component（Shadow DOM）
│   ├── test.js             開發用測試頁
│   ├── jspreadsheet.css    主樣式
│   ├── jspreadsheet.themes.css 主題（CSS 變數）
│   └── utils/
│       ├── factory.js      建立 spreadsheet 物件、分頁籤（工作表）、外掛、全域事件
│       ├── worksheets.js   建立 <table> DOM、載入 csv/url、85 個公開方法註冊表（729 行）
│       ├── internal.js     ★ 公式執行 executeFormula、相依鏈、建立／更新儲存格（1,298 行）
│       ├── events.js       ★ 滑鼠／鍵盤／觸控／貼上／右鍵選單、快捷鍵（1,639 行，最大檔）
│       ├── data.js         setData／getData／setValue／getValueFromCoords（417 行）
│       ├── selection.js    選取範圍、填滿控點（copyData）
│       ├── copyPaste.js    複製（輸出 TSV）、貼上（解析 TSV）
│       ├── history.js      復原／重做
│       ├── editor.js       開啟／關閉儲存格編輯器（依欄位型別）
│       ├── columns.js / rows.js  插入、刪除、移動、隱藏、寬高
│       ├── merges.js       合併儲存格
│       ├── filter.js       欄位篩選（單欄下拉多選）
│       ├── orderBy.js      排序
│       ├── search.js       全表搜尋
│       ├── pagination.js / lazyLoading.js  分頁、懶載入（每頁 100 列）
│       ├── style.js / meta.js / comments.js  儲存格樣式、隱藏中繼資料、註解
│       ├── toolbar.js      工具列（復原、存檔、字型、粗體、顏色、合併…）
│       ├── freeze.js       凍結欄
│       ├── headers.js / footer.js  欄標題、頁尾公式列
│       ├── download.js     匯出 CSV
│       ├── dispatch.js     ★ 事件派送＋外掛＋persistence POST
│       └── helpers.js      欄名轉換、parseCSV、從 <table> 建立
├── dist/                   打包結果（index.js、css、index.d.ts 型別定義＝最完整的 API 清單）
├── packages/vue/           Vue 包裝
├── resources/lang/*.json   9 種語言（含 zh_CN，無 zh_TW）——但格式是舊版，見第 11 節
├── test/                   15 個 mocha 測試檔
└── docs/                   v2～v5 官方文件 Markdown（約 180 份）
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 初始化 | [P/src/index.js#L11-L26](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/index.js#L11-L26)、[P/src/utils/factory.js#L112-L196](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/factory.js#L112-L196) | `jspreadsheet()` 立刻回傳一個 `worksheets` 陣列，但建立過程是 async；全部建好後才觸發 `onload`。多張工作表用 jSuites 的 tabs 做分頁籤。 |
| 畫表格 | [P/src/utils/worksheets.js#L62-L330](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/worksheets.js#L62-L330)、[P/src/utils/rows.js#L13](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/rows.js#L13)、[P/src/utils/internal.js#L390-L527](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L390-L527) | 真的 `<table><thead><tbody>`，每格一個 `<td data-x data-y>`。依欄位 `type` 產生不同內容（checkbox 用 `<input>`、image 只接受 `data:image` 開頭、html 用 innerHTML）。 |
| 公式計算 | [P/src/utils/internal.js#L111-L271](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L111-L271) | 先去掉 `$`、把 `A1:B3` 展開成 `A1,B1,A2,…`；用正規式 `([A-Z]+[0-9]+)` 抓出參照，遞迴算出被參照的公式值，組成 `{A1: 10, B1: "文字"}`，再丟給 `formula(expression, values, x, y, obj)`（L254）。有自我參照與循環參照保護（回傳 `#ERROR`）。 |
| 相依圖／重算 | 同上 L190-L198 建鏈；[P/src/utils/internal.js#L776-L804](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L776-L804) `updateFormulaChain` | `obj.formula` 是「被參照格 → 參照它的公式格清單」的反向索引；某格改了就遞迴重算清單上的格子。簡單但沒有拓撲排序。 |
| 公式在插入／刪除列後自動改參照 | [P/src/utils/internal.js#L809-L896](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L809-L896) `updateFormula`／`updateFormulas` | 逐字元掃公式字串，替換儲存格名稱。 |
| 編輯儲存格 | [P/src/utils/editor.js#L13](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/editor.js#L13)（openEditor）、[#L277](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/editor.js#L277)（closeEditor） | 依欄型別開 textarea／jSuites dropdown／calendar／color；自訂型別可傳入物件（`createCell/openEditor/closeEditor/updateCell`）。 |
| 寫值＋事件 | [P/src/utils/data.js#L263-L325](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/data.js#L263-L325) | `setValue`／`setValueFromCoords`：更新格子 → 重算公式鏈 → 寫入 history → 派送 `onafterchanges(worksheet, [{x,y,value,oldValue}])`。 |
| 複製貼上 | [P/src/utils/copyPaste.js#L18](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/copyPaste.js#L18)、[#L221-L300](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/copyPaste.js#L221-L300)、[P/src/utils/events.js#L795-L818](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/events.js#L795-L818) | 複製輸出 Tab 分隔文字；貼上讀 `clipboardData.getData('text')` 再用 `parseCSV(data,'\t')` 解析。選取範圍是來源整數倍時會重複貼滿。`onbeforepaste` 可攔截改資料。 |
| 填滿控點 | [P/src/utils/selection.js#L420-L592](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/selection.js#L420-L592) | 拖右下角小方塊：公式會平移參照、單一數字會遞增、日期欄會加天數。 |
| 復原／重做 | [P/src/utils/history.js#L187-L336](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/history.js#L187-L336) | 指令式 history（`action` + `records`）；支援 setValue、插入／刪除／移動列欄、樣式、合併、排序等。 |
| 快捷鍵 | [P/src/utils/events.js#L1427-L1458](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/events.js#L1427-L1458) | Ctrl+A／C／X／V／Z／Y；**Ctrl+S 是下載 CSV**（不是存檔）。 |
| 懶載入 | [P/src/utils/lazyLoading.js#L4-L47](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/lazyLoading.js#L4-L47)、[P/src/utils/data.js#L75-L111](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/data.js#L75-L111) | 一次只把 100 列 `<tr>` 掛到 tbody；但**所有列的 DOM 都先建好放記憶體**（L102-L110 的迴圈對每一列都 `createRow`）。 |
| 持久化 | [P/src/utils/dispatch.js#L94-L110](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/dispatch.js#L94-L110) | `onafterchanges` 時呼叫外掛的 `persistence()`，或把 `{row, data:{欄名:值}}` POST 到 `options.persistence` 網址。 |
| 匯出 CSV | [P/src/utils/download.js#L8-L37](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/download.js#L8-L37) | 重用 copy 產生字串，前面加 `﻿`（BOM），用 Blob 下載。 |
| 匯入 CSV | [P/src/utils/worksheets.js#L453-L494](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/worksheets.js#L453-L494)、[P/src/utils/helpers.js#L102](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/helpers.js#L102) | 給 `csv: '網址'` 會 GET 下載後用自寫的 `parseCSV` 解析（處理雙引號跳脫）。 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整個元件（直接用） | [P/src/index.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/index.js) | jsuites、@jspreadsheet/formula | 低 | CDN 引入，`jspreadsheet(div, {worksheets:[…]})`；用事件接 Firestore。 |
| CSV／TSV 解析器 `parseCSV` | [P/src/utils/helpers.js#L102-L173](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/helpers.js#L102-L173) | 無 | 低 | 純函式，複製即可；拿來解析使用者貼上的 Excel 內容或匯入 CSV。 |
| 欄名／座標轉換（A1 ↔ [0,0]） | [P/src/utils/helpers.js#L46-L100](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/helpers.js#L46-L100)、[P/src/utils/internalHelpers.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internalHelpers.js) | 無 | 低 | 任何自寫表格都用得到；也已暴露在 `jspreadsheet.helpers`。 |
| 公式參照展開＋相依鏈 | [P/src/utils/internal.js#L111-L271](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L111-L271)、[#L776-L804](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L776-L804) | 公式函數求值器 | 中 | 想自己做「輕量公式」時參考；但正式需求建議改接 HyperFormula 之類完整引擎（替換 L254 那一行的 `formula(...)` 呼叫）。 |
| 公式參照平移 `updateFormula` | [P/src/utils/internal.js#L809-L847](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L809-L847) | 無 | 低 | 填滿／插列時改寫 `=A1+B1` → `=A2+B2`。 |
| 填滿控點邏輯 | [P/src/utils/selection.js#L420-L592](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/selection.js#L420-L592) | 本專案的 records／history | 中 | 讀懂後移植「數字遞增、日期加天、公式平移」規則。 |
| 指令式復原／重做 | [P/src/utils/history.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/history.js) | 本專案內部結構 | 中 | 設計參考：每個動作存 `{action, records, selection}`。 |
| CSV 下載（含 BOM） | [P/src/utils/download.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/download.js) | 無（改掉 copy 呼叫） | 低 | 你倉儲系統任何「匯出 CSV」按鈕都能用這段 Blob＋BOM 寫法，避免 Excel 開中文亂碼。 |
| 事件＋外掛派送器 | [P/src/utils/dispatch.js#L63-L113](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/dispatch.js#L63-L113) | 無 | 低 | 小而清楚的「全域 onevent ＋ 個別事件 ＋ 外掛」模式，可借來做自己元件的事件系統。 |
| Web Component 包裝 | [P/src/webcomponent.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/webcomponent.js) | jspreadsheet | 低 | `<j-spreadsheet-ce>` 標籤；Shadow DOM 隔離樣式，可直接放進任何頁面。 |

---

## 7. AI／Claude 整合

- **沒有任何 AI 功能**：`src/` 內沒有模型呼叫、沒有 prompt、沒有 MCP／Skills（grep `http`、`fetch(`、`XMLHttpRequest` 只找到 webcomponent 載入 CDN CSS 的網址）。
- repo 根目錄有 `context7.json`（指向 context7.com 的文件索引設定），只是讓 AI 程式助理查文件用，不是產品功能。
- **能不能接 Claude：可接，而且很容易**，因為它是純 JS、API 清楚：
  1. **自訂公式呼叫 Claude**：官方文件示範 `formula.setFormula({ NEGATIVE })` 註冊大寫函數（[P/docs/jspreadsheet/docs/custom-formulas.md](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/docs/jspreadsheet/docs/custom-formulas.md)）。但公式是同步執行，若要 `=CLAUDE("幫我寫商品標題", A2)` 這種非同步呼叫，建議做法：公式先回傳「計算中…」，背景呼叫你的 Firebase Cloud Function（裡面放 Claude API Key，不可放前端）→ 拿到結果用 `setValueFromCoords` 寫到旁邊欄位。
  2. **右鍵選單加「AI 產生」**：透過外掛 `contextMenu(worksheet, x, y, e, items)` 加一項，例如「用 AI 生成選取列的商品文案／廣告腳本」，把 `getData(true)`（選取範圍）送給後端。
  3. **用 Claude Code 改它**：程式碼小（約 1.1 萬行）、單一語言，非常適合請 Claude Code 讀懂後客製（例如加繁中字典、改工具列）。

---

## 8. 擴充方式與 API

- **公開方法 85 個**：在 [P/src/utils/worksheets.js#L582-L727](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/worksheets.js#L582-L727) 的 `worksheetPublicMethods` 陣列（我用 awk 擷取該陣列後以 grep 計算項目數＝85）。常用：`getData`、`setData`、`getValue`、`setValue`、`getValueFromCoords`、`setValueFromCoords`、`insertRow`、`deleteRow`、`insertColumn`、`setStyle`、`getStyle`、`setMerge`、`setComments`、`setMeta`、`orderBy`、`search`、`download`、`undo`、`redo`、`executeFormula`、`setReadOnly`、`openFilter`、`createWorksheet`、`deleteWorksheet`。
- **事件 43 個**：用 grep 抓原始碼中 `dispatch.call(…, 'onXXX'` 得到 41 個，再加上兩個跨行呼叫的 `onbeforepaste`、`onsort`，共 43 個；型別檔 `dist/index.d.ts` 另列 `onevent`（全部事件總入口）。重要的：`onload`、`onbeforechange`（可改寫要寫入的值）、`onchange`（單格）、`onafterchanges`（一批，**存 Firestore 用這個**）、`oninsertrow`、`ondeleterow`、`onundo`、`onredo`、`onbeforepaste`、`onpaste`、`onselection`、`onbeforeformula`（可在計算前改寫公式）。
- **欄位型別**：`text`、`numeric`、`hidden`、`dropdown`、`autocomplete`、`checkbox`、`radio`、`calendar`、`image`、`color`、`html`，或傳入自訂編輯器物件（[P/dist/index.d.ts#L160](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/dist/index.d.ts#L160)）。
- **外掛介面**：`beforeinit`、`init`、`onevent`、`persistence`、`contextMenu`、`toolbar`（[P/docs/jspreadsheet/docs/plugins.md](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/docs/jspreadsheet/docs/plugins.md)；派送在 [P/src/utils/dispatch.js#L80-L109](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/dispatch.js#L80-L109)、[P/src/utils/worksheets.js#L440-L446](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/worksheets.js#L440-L446)）。
- **工作表選項**：`dist/index.d.ts` 的 `WorksheetOptions`（[#L909](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/dist/index.d.ts#L909)）共 55 個屬性，例如 `data`、`columns`、`minDimensions`、`freezeColumns`、`mergeCells`、`style`、`comments`、`meta`、`nestedHeaders`、`footers`、`filters`、`search`、`pagination`、`lazyLoading`、`tableOverflow`、`tableHeight`、`persistence`。
- **型別定義**：`dist/index.d.ts`（2,381 行）是最完整的 API 說明書，給 Claude Code 讀這一個檔就能掌握全部 API。

---

## 9. 程式品質與風險

- **維護狀況**：最後一次 commit 2026-10-14（「Keep string literals untouched when removing $ from formula references」），仍在維護；7 千多顆星，創立於 2017 年（前身 jExcel）。v5 是 2024–2025 年重構（工作表／試算表分離）。
- **測試**：`test/` 15 個檔、共 79 個 `it(`（grep 計數），用 mocha + jsdom。公式測試 `test/calculations.js` 只用到 `SUM`，**函數正確性幾乎沒有在本 repo 測**（公式引擎在另一個套件）。
- **資安：XSS 風險** — `html` 型別欄位或 `parseHTML: true` 時用 `innerHTML`，而 `stripScript`（[P/src/utils/internal.js#L382-L388](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L382-L388)）**只移除 `<script>` 標籤**，`<img onerror=…>` 之類擋不住。預設（非 html 欄、未開 parseHTML）用 `textContent`，是安全的。**建議：別開 parseHTML，別讓使用者輸入進 html 欄。**
- **資安：公式求值** — 依 formula repo README，Basic 版用 `new Function`、作用域是 `window`；CE 端只做 `secureFormulas`（把引號外的字轉大寫，[P/src/utils/internal.js#L748-L770](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L748-L770)）。我無法讀到 Basic 版原始碼，**實際能否被惡意公式利用：未確認**。如果表格內容來自不受信任的人（例如客人填的資料），建議關閉 `parseFormulas` 或只讓自己人編輯。
- **遙測／隱私**：沒有遙測。有一個「Jspreadsheet CE」連結元素（[P/src/utils/worksheets.js#L215-L224](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/worksheets.js#L215-L224)），CSS 預設 `display: none`。只有你設定 `url`／`csv`／`persistence` 時才會發網路請求。Web Component 版會從 jsDelivr 和 Google Fonts 載 CSS。
- **已知的坑（我讀程式碼發現的）**：
  1. **`getWorksheetInstanceByName` 邏輯寫反**：[P/src/index.js#L30-L49](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/index.js#L30-L49) 第 35 行「找到了就回傳 `{}`」，找不到時又會對 undefined 取屬性出錯——這個函式基本上不能用，請改用 `jspreadsheet()` 的回傳值或 `onload` 拿到的物件。
  2. **復原／重做不會觸發 `onafterchanges`**：`undo` 內部把 `ignoreEvents` 設為 true（[P/src/utils/history.js#L190-L196](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/history.js#L190-L196)），結束時只派送 `onundo`（L264）。**同步 Firestore 必須另外監聽 `onundo`／`onredo`**，否則按 Ctrl+Z 後資料庫和畫面會不一致。
  3. **Ctrl+S 會下載 CSV**，不是存檔；如果你的使用者習慣 Ctrl+S，要自己在 keydown 攔截。
  4. **沒有載入公式套件時，所有公式顯示 `#ERROR`**：打包後的 `dist/index.js` 開頭是 `if (! formula && typeof(require) === 'function') …`（formula 是外部全域，[P/webpack.config.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/webpack.config.js)、[P/build.cjs](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/build.cjs)），README 的 CDN 範例沒有列出 formula 的 script，照抄會沒公式。
  5. **懶載入只在 `tableOverflow: true` 或 `fullscreen: true` 時生效**（[P/src/utils/worksheets.js#L334-L337](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/worksheets.js#L334-L337)），且懶載入與分頁互斥。
  6. **排序會清掉合併儲存格**（會跳 confirm，[P/src/utils/orderBy.js#L92-L100](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/orderBy.js#L92-L100)）。
  7. 程式內大量使用 `==` 鬆散比較與字串型座標（`CellChange.x/y` 型別寫的是 string，[P/dist/index.d.ts#L315-L320](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/dist/index.d.ts#L315-L320)），自己寫程式時記得 `Number()` 轉型。

---

## 10. 跟其他專案組合的建議

- **jspreadsheet CE（介面）＋ HyperFormula（公式）**：CE 的公式引擎是黑盒、函數清單無法驗證；可以在 `onbeforeformula` 事件（[P/src/utils/internal.js#L243-L248](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L243-L248)）或直接改 L254 的呼叫，換成 HyperFormula 計算。注意 HyperFormula 是 GPL-3.0／商用授權，個人用沒問題，公司閉源商用要注意。
- **jspreadsheet CE ＋ SheetJS（xlsx 匯入匯出）**：CE 沒有 xlsx。用 SheetJS 把 .xlsx 讀成二維陣列 → `worksheet.setData(array)`；匯出時 `worksheet.getData()` → SheetJS 寫成 .xlsx。只能保留值與公式字串，格式（顏色、框線）要自己對應 `getStyle()`。
- **jspreadsheet CE ＋ 你的 Firebase 倉儲系統**：最推薦的組合，見第 11 節範例。商品主檔、進貨單、盤點表各做一張工作表。
- **jspreadsheet CE ＋ 價格比較／ERP 專案**：把爬蟲或比價結果寫進 Firestore，再用 CE 呈現成可排序、可篩選、可加公式的比價表（例如 `=C2-B2` 算價差、`=ROUND((D2-E2)/D2,3)` 算毛利率）。
- **jspreadsheet CE ＋ Claude（影片／腳本生成）**：做一張「商品 → 賣點 → 腳本 → 影片狀態」的工作表，右鍵選單呼叫 Cloud Function 讓 Claude 填腳本欄，當成你的短影音／廣告素材生產排程表。
- **如果需求變大**（十萬列、xlsx 高保真、多人協作、圖表）：改看 Univer、Luckysheet／FortuneSheet、x-spreadsheet（Canvas 渲染），CE 不適合硬撐。

---

## 11. 網頁 Excel 能力檢查表

### 渲染方式、虛擬捲動、效能
- **渲染：DOM（HTML `<table>`）** — 有。每格一個 `<td>`（[P/src/utils/internal.js#L390-L398](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L390-L398)）。好處是好客製、好除錯；壞處是格子多會慢。
- **虛擬捲動：沒有真正的虛擬捲動，只有「懶載入」** — 每次只掛 100 列到畫面（[P/src/utils/lazyLoading.js#L18](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/lazyLoading.js#L18)），但所有列的 DOM 物件在初始化時都會建立（[P/src/utils/data.js#L102-L110](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/data.js#L102-L110)）；欄方向沒有虛擬化。官方比較表也寫 CE＝「Lazy loading」、Pro＝「Smart loading」。
- **10 萬列以上：未實測，從程式結構推估不適合**。10 萬列 × 10 欄＝100 萬個 `<td>` 物件在記憶體，加上排序／篩選會讀 `element.textContent`（[P/src/utils/orderBy.js#L130-L134](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/orderBy.js#L130-L134)）。數千到一兩萬列的倉儲清單應可用；更大請分頁或從 Firestore 分批查詢。

### 公式引擎
- **函數數量：未確認（無法自己數）**。CE 本身沒有函數實作，只呼叫外部 `@jspreadsheet/formula`；同組織的 [formula repo README](https://github.com/jspreadsheet/formula/blob/2cef76b9580a968482b9fb07470d5e6457794f34/README.md) **聲稱** Basic 版「403 個」、Premium「455 個」，但 repo 內沒有原始碼可數。本 repo 測試只驗證 `SUM`；文件範例出現 `SUM`、`ROUND`。
- **解析器**：參照解析在 CE（[P/src/utils/internal.js#L111-L271](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L111-L271)），函數求值在 formula 套件（README 說 Basic 用 `new Function`）。
- **依賴圖／重算**：有，簡易版 — `obj.formula` 反向索引＋遞迴 `updateFormulaChain`（[#L776-L804](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L776-L804)）；有循環參照保護。
- **陣列公式**：沒有（formula README：矩陣計算只有 Premium）。
- **跨工作表參照**：沒有（CE 的參照正規式只認 `A1` 形式；官方比較表與 formula README 都寫只有 Pro／Premium）。
- **整欄參照 `A:A`、`%` 運算子**：付費版才有（formulas.md 列為 Formula Pro 功能）。
- **自訂函數**：有 — `formula.setFormula({ 大寫函數名 })`（[custom-formulas.md](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/docs/jspreadsheet/docs/custom-formulas.md)）；也可用 `onbeforeformula` 改寫公式。
- **浮點誤差**：Basic 版沒處理（README：「JavaScript precision issues — Basic: No」），例如 `37.02+2.56` 可能出現 39.580000000000005，算錢記得用 `ROUND`。

### 編輯
- **儲存格編輯**：有（雙擊或直接打字，[P/src/utils/editor.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/editor.js)）。
- **複製貼上**：有。**可以從 Excel／Google 試算表貼上「值」**（它們放進剪貼簿的是 Tab 分隔文字，CE 用 `getData('text')` + `parseCSV('\t')` 解析，[P/src/utils/events.js#L795-L818](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/events.js#L795-L818)）。**格式、顏色不會帶過來**；Excel 的公式也是以「顯示值」貼入。CE 內部互相複製時會帶樣式（以 hash 判斷是否同一份來源）。官方比較表：複製貼上時自動調整公式參照是 Pro 才有。
- **拖拉填滿**：有（[P/src/utils/selection.js#L420-L592](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/selection.js#L420-L592)），數字遞增、日期加天、公式平移；但沒有 Excel 那種「1,3,5 推等差」的智慧序列。
- **復原／重做**：有（[P/src/utils/history.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/history.js)），Ctrl+Z／Ctrl+Y。

### 格式
- **數字格式**：有，以「欄」為單位設定 `mask`／`format`／`locale`（用 jSuites.mask，[P/src/utils/internal.js#L274-L322](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L274-L322)、[#L721-L744](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L721-L744)），支援負數 `[Red]` 與括號。**儲存格層級的格式是 Pro 才有**。
- **條件格式**：沒有內建；可在 `onchange`／`oncreatecell` 事件自己用 `setStyle` 上色。
- **合併儲存格**：有（[P/src/utils/merges.js#L120](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/merges.js#L120)）。
- **凍結窗格**：只有凍結「欄」（`freezeColumns`，[P/src/utils/freeze.js](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/freeze.js)）；表頭用 sticky 固定。凍結任意「列」：沒有。
- **欄寬列高**：有（拖拉調整，`setWidth`／`setHeight`）。
- **篩選**：有，每欄一個多選下拉（[P/src/utils/filter.js#L8-L77](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/filter.js#L8-L77)）；進階／條件式篩選是 Pro 才有。另有全表搜尋。
- **排序**：有（點欄標題，[P/src/utils/orderBy.js#L88](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/orderBy.js#L88)），數字欄按數值、其他按顯示文字；可傳自訂 `sorting` 函式。只能單欄排序。
- **資料驗證（下拉選單）**：下拉選單有（`type: 'dropdown'`，可 `source` 陣列或 `url` 遠端載入、可多選、可 autocomplete）；**通用的資料驗證規則（數字範圍、必填等）是付費版（Premium）才有**，CE 可用 `onbeforechange` 回傳修正值自己做。

### 圖表、樞紐分析、圖片
- **圖表**：沒有（v4 文件有一個搭配 Highcharts 的案例 `docs/jspreadsheet/v4/cases/highcharts.md`，需自己接）。
- **樞紐分析**：沒有。
- **圖片**：有 `type: 'image'` 欄位，但只接受 `data:image` 開頭的 base64（[P/src/utils/internal.js#L474-L479](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/internal.js#L478-L483)）。**存 Firestore 時別存 base64**（文件 1 MiB 上限），改上傳 Firebase Storage、表格只存網址並用 html 欄或自訂型別顯示。
- **附件**：沒有。**註解（comments）**：有（存在 `<td title>`）。

### 匯入匯出
- **.csv**：匯出有（`download()`，含 BOM）；匯入有（`csv:` 網址選項，或自己讀檔後 `parseCSV` + `setData`）。函式庫：自寫，無外部依賴。
- **.xlsx**：**沒有**。程式碼裡沒有任何 xlsx 讀寫；需另接 SheetJS 等函式庫，保真度取決於你自己對應多少樣式。
- **從現有 HTML `<table>` 建立**：有（[P/src/utils/helpers.js#L175](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/helpers.js#L175)）。

### 多人即時協作
- **沒有**。無 OT／CRDT／鎖定機制。`persistence` 只是把變更 POST 出去，不會接收別人的變更。若要「兩台電腦同時開」：可用 Firestore `onSnapshot` 監聽，收到別人改動時用 `setValueFromCoords` 更新畫面（注意這也會觸發 `onafterchanges`，要用旗標避免回寫迴圈）；衝突處理只能「最後寫入者贏」。

### 資料模型與存進 Firestore
- **資料模型**：每張工作表的值就是**二維陣列**（公式以字串存），樣式、合併、註解另存為以「A1」為鍵的物件：

```json
{
  "worksheetName": "商品",
  "columns": [{"type":"text","title":"品名","width":200},{"type":"numeric","title":"成本"}],
  "data": [["T恤", 120, 2, "=B1*C1"], ["帽子", 80, 5, "=B2*C2"]],
  "style": {"A1": "font-weight: bold;"},
  "mergeCells": {"A3": [2, 1]},
  "comments": {"B1": "含運"}
}
```
  可用 `getData()`、`getStyle()`、`getMerge()`、`getComments()`、`getConfig()` 取回（[P/src/utils/style.js#L10-L44](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/style.js#L10-L44)、[P/src/utils/merges.js#L90-L111](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/merges.js#L90-L111)、[P/src/utils/comments.js#L9-L35](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/comments.js#L9-L35)）。
- **存進 Firestore 的注意事項**：Firestore **不允許陣列裡直接放陣列**，所以 `data` 二維陣列不能原封不動存。兩種做法：
  1. **一列一個文件（推薦給倉儲）**：`products/{id}` 存 `{sku, name, qty, cost, price}`，表格用一個隱藏欄放文件 id；改哪格就 `updateDoc` 那個欄位。好處是能和你現有的倉儲資料共用、可查詢。
  2. **整張表一個文件**：`sheets/{id}` 存 `{dataJson: JSON.stringify(getData()), style: getStyle(), …}`；簡單但受 1 MiB 上限，且無法查詢。

### 手機／觸控、繁體中文
- **觸控**：有基本支援（`touchstart` 長按約 0.5 秒開編輯器，[P/src/utils/events.js#L1193-L1243](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/events.js#L1193-L1243)）；但沒有專門的手機版介面，小螢幕建議只放少數欄或改 `tableOverflow` 讓它橫向捲動。
- **繁體中文介面：沒有現成的**。`resources/lang/` 有 9 個語言檔含 `zh_CN.json`，但它們用的是舊版 camelCase 鍵（如 `"noRecordsFound"`），而 v5 程式碼呼叫的是 `jSuites.translate('No records found')` 這種英文原句為鍵；我 grep `jSuites.translate('…')` 共找到 28 個不重複字串。**正確作法**：自己寫一份繁中字典呼叫 `jspreadsheet.setDictionary({...})`（[P/src/index.js#L53-L55](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/index.js#L52-L54)，文件範例 `docs/jspreadsheet/docs/examples/translations.md`）。可直接用：

```js
jspreadsheet.setDictionary({
  'Search':'搜尋','Show ':'顯示 ','entries':'筆','No records found':'查無資料',
  'Showing page {0} of {1} entries':'第 {0} 頁，共 {1} 筆',
  'Insert a new column before':'在左側插入欄','Insert a new column after':'在右側插入欄',
  'Delete selected columns':'刪除選取的欄','Rename this column':'重新命名此欄','Column name':'欄位名稱',
  'Order ascending':'遞增排序','Order descending':'遞減排序',
  'Insert a new row before':'在上方插入列','Insert a new row after':'在下方插入列','Delete selected rows':'刪除選取的列',
  'Comments':'註解','Clear comments':'清除註解','Copy':'複製','Paste':'貼上','Save as':'另存為','About':'關於',
  'Merge the selected cells':'合併選取的儲存格','No cells selected':'未選取儲存格',
  'Are you sure to delete the selected rows?':'確定要刪除選取的列？',
  'Are you sure to delete the selected columns?':'確定要刪除選取的欄？',
  'This action will destroy any existing merged cells. Are you sure?':'這會取消現有的合併儲存格，確定嗎？',
  'This action will clear your search results. Are you sure?':'這會清除搜尋結果，確定嗎？',
  'The merged cells will retain the value of the top-left cell only. Are you sure?':'合併後只保留左上角的值，確定嗎？'
});
```
  （右鍵選單中部分項目如「Edit comments／Add comments」可能經由變數傳入 `jSuites.translate(t)`，未逐一確認，若看到沒翻到的英文再補進字典即可。）

### 嵌入方式（純 JavaScript，不用 React／Vue）
- **可以**，這正是它的主要用法。套件大小見第 3 節（本體約 145 KB 未壓縮／約 34 KB gzip，另加 jsuites 與 formula）。
- **最小可用範例：從 Firestore 載入商品並逐格存回**（沿用你現有的 Firebase 初始化；Firebase SDK 版本請與你專案一致）：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jsuites/dist/jsuites.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/jspreadsheet-ce@5.0.4/dist/jspreadsheet.css">
<script src="https://cdn.jsdelivr.net/npm/jsuites/dist/jsuites.min.js"></script>
<!-- 公式引擎：必須載入，否則公式全顯示 #ERROR；CDN 實際檔名未確認，請到 jsdelivr 的 @jspreadsheet/formula 套件頁確認 dist 檔名 -->
<script src="https://cdn.jsdelivr.net/npm/@jspreadsheet/formula@2/dist/index.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jspreadsheet-ce@5.0.4/dist/index.js"></script>
<div id="sheet"></div>
<script type="module">
import { db } from './firebase-init.js';               // 你現有的 Firestore 實例
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'; // 依你現有的載入方式
const FIELDS = ['sku', 'name', 'qty', 'cost', 'price'];
const snap = await getDocs(collection(db, 'products'));
const data = snap.docs.map(d => [d.id, ...FIELDS.map(f => d.data()[f] ?? '')]);
const save = (ws, x, y, value) => {
  const id = ws.getValueFromCoords(0, Number(y));       // 第 0 欄是隱藏的文件 id
  const field = FIELDS[Number(x) - 1];
  if (id && field) updateDoc(doc(db, 'products', id), { [field]: field === 'qty' || field === 'cost' || field === 'price' ? Number(value) : value });
};
jspreadsheet(document.getElementById('sheet'), {
  worksheets: [{ data, tableOverflow: true, tableHeight: '70vh', columns: [
    { type: 'hidden', title: 'id' },
    { type: 'text', title: 'SKU', width: 120 }, { type: 'text', title: '品名', width: 220 },
    { type: 'numeric', title: '庫存', width: 80 }, { type: 'numeric', title: '成本', width: 90 },
    { type: 'numeric', title: '售價', width: 90 },
  ]}],
  onafterchanges: (ws, changes) => changes.forEach(c => save(ws, c.x, c.y, c.value)),
  onundo: (ws, h) => (h?.records || []).forEach(r => save(ws, r.x, r.y, ws.getValueFromCoords(r.x, r.y))),
  onredo: (ws, h) => (h?.records || []).forEach(r => save(ws, r.x, r.y, ws.getValueFromCoords(r.x, r.y))),
});
</script>
```
  說明：①`jspreadsheet` 是 UMD 全域變數，classic script 載入後在 module 裡也能用；②`onundo`／`onredo` 的 `h.records` 結構以 `setValue` 動作為準（插入／刪除列的 history 結構不同，需另外處理）；③新增列（`oninsertrow`）時要 `addDoc` 後用 `setValueFromCoords(0, y, 新id)` 回填；刪除列用 `onbeforedeleterow` 先記下 id 再 `deleteDoc`；④若資料量大，請改分頁查詢。以上範例我**未實際執行**（規定不可執行程式），是依原始碼的事件簽章撰寫。

### API／事件
- **監聽變更：有** — `onchange`（單格）、`onafterchanges`（一批，含 `oldValue`）、`onbeforechange`（可攔截／改值）、`oninsertrow`、`ondeleterow`、`onmoverow`、`onsort`、`onpaste`、`onundo`、`onredo` 等 43 個事件（見第 8 節計數方式）。全域 `onevent` 可一次接全部。
- **程式讀寫儲存格：有** — `getValue('A1')`、`setValue('A1', 100)`、`getValueFromCoords(x,y)`、`setValueFromCoords(x,y,v)`、`getData()`、`setData()`、`getRowData()`、`setRowData()`、`getColumnData()`、`setColumnData()`、`executeFormula('=SUM(A1:A10)')`；`setValue` 也接受陣列 `[{x,y,value}]` 一次改多格（[P/src/utils/data.js#L228-L260](https://github.com/jspreadsheet/ce/blob/d9c04e8a1acec6b87b0580b79868cd4d2f73599e/src/utils/data.js#L228-L260)），只產生一次 history 與一次 `onafterchanges`。

### 總結
對你來說，jspreadsheet CE 是「**最容易今天就嵌進倉儲系統**」的選項：無框架、MIT、API 小而完整、事件清楚，Firestore 同步只要幾十行。代價是公式引擎黑盒且功能基本、沒有 xlsx、沒有協作、大資料效能有限。建議當作「批次編輯／成本試算」的介面層，公式需求變複雜時再接 HyperFormula，需要 xlsx 時接 SheetJS。

---

## 關鍵字
jspreadsheet、jspreadsheet-ce、jExcel、網頁版 Excel、網頁試算表、線上試算表、可編輯表格、data grid、spreadsheet、JavaScript 試算表、純 JavaScript、vanilla JS、無框架、MIT 授權、公式、formula、@jspreadsheet/formula、自訂函數、複製貼上、從 Excel 貼上、填滿控點、復原重做、合併儲存格、凍結欄、篩選、排序、下拉選單、資料驗證、CSV 匯出、CSV 匯入、懶載入、lazy loading、DOM 渲染、Firebase、Firestore、倉儲管理、庫存管理、成本試算、批次編輯、繁體中文字典、setDictionary、onafterchanges、事件、外掛、plugin、Web Component、jsuites、Jspreadsheet Pro、Claude 整合
