# SheetJS/sheetjs — 網頁「讀寫 Excel 檔」的標準工具庫（不是試算表介面，是匯入匯出引擎）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：3f44ddd（預設分支 `github`；原始碼實際在 `master` 分支 515d1c6）
> GitHub：https://github.com/SheetJS/sheetjs｜⭐ 36341｜授權：Apache-2.0（另有付費 SheetJS Pro）｜主要語言：-｜最近更新：2024-04-18

> **先講清楚這個 repo 的狀況**：GitHub 上的預設分支 `github`（commit `3f44ddd99c704d7ca35ea76fef7b8af2d2d435cb`，2024-01-31「exit stage left」）只剩 37 個檔案（README、demos 說明、一支 `xlsxspread.js`），**沒有任何原始碼**。README 明講新家搬到 git.sheetjs.com，而「`master` 分支包含到 `515d1c6f…` 為止的所有 commit」（[GBASE/README.md](https://github.com/SheetJS/sheetjs/blob/3f44ddd99c704d7ca35ea76fef7b8af2d2d435cb/README.md)）。所以本資料包的程式碼分析全部讀 **`master` 分支 commit `515d1c6f2e1d3ca422ee9198b177cfd926434936`（2022-10-04，版本 0.18.12）**。
>
> 下文 permalink：`BASE/` = `https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/`；`GBASE/` = `https://github.com/SheetJS/sheetjs/blob/3f44ddd99c704d7ca35ea76fef7b8af2d2d435cb/`。所有引用的檔案都是本次實際打開過的。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：SheetJS（npm 套件名 `xlsx`）是「把 Excel／CSV／ODS 等試算表**檔案**解析成 JavaScript 物件、再把 JavaScript 物件寫回檔案」的純 JavaScript 函式庫。它**沒有畫面、沒有格子 UI、沒有公式計算**；它是幾乎所有網頁試算表專案（Luckysheet、x-spreadsheet、各種 data grid）背後負責「匯入／匯出 .xlsx」的那顆引擎。

**對你（台灣小老闆、純 JS + Firebase 倉儲 App、跑廣告）最實用的用途：**

1. **倉儲 App 加「匯入 Excel」按鈕**：廠商報價單、蝦皮／momo 後台匯出的訂單 .xlsx／.csv，使用者選檔 → `XLSX.read()` → `XLSX.utils.sheet_to_json()` 變成 `[{品名:'A', 數量:3}, …]` → 直接寫進 Firestore。全程在瀏覽器裡做，不用伺服器、不用 API Key。
2. **倉儲 App 加「匯出 Excel」按鈕**：把 Firestore 撈出來的庫存、進貨成本、毛利表用 `json_to_sheet()` + `writeFile()` 產生真正的 .xlsx 給會計或供應商。
3. **比價／成本計算**：把多家供應商的報價 Excel 讀進來、在 JS 裡比對最低價、算成本後輸出一份「比價結果.xlsx」（公式可以寫進檔案讓 Excel 打開時自己算，但 SheetJS 本身不會算，見第 11 節）。
4. **廣告報表整理**：Meta／Google Ads 匯出的 CSV（常是 UTF-8 BOM 或 UTF-16）讀進來、合併、輸出成給老闆看的 xlsx。
5. **當「網頁 Excel 組合」的檔案層**：你之後挑 A（格子 UI，例如 x-spreadsheet／Luckysheet／Univer）＋ B（公式引擎，例如 HyperFormula）時，SheetJS 就是 C ——負責「開 .xlsx 檔／存 .xlsx 檔」。repo 裡甚至附了一支跟 x-spreadsheet 互轉的 `xlsxspread.js`（第 5、6 節）。

**它做不到的（避免期待落差）**：不是試算表編輯器（沒有格子、捲動、選取、復原）；開源版**不能寫入儲存格樣式**（字體、顏色、框線都會丟掉，只保留數字格式）；不會計算公式；不能讀寫圖表與圖片。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：Apache-2.0**（[BASE/LICENSE](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/LICENSE)、[BASE/package.json](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/package.json) 的 `"license": "Apache-2.0"`）。README 另加一句「All rights not explicitly granted by the Apache 2.0 License are reserved by the Original Author」（Apache 本來就是這樣，不影響你的使用）。
- **個人使用**：完全自由，可改、可複製進你自己的倉儲 App。
- **公司商用**：可以，包括閉源商用、做成產品賣。義務：(1) 保留 LICENSE 與著作權聲明（例如在「關於／第三方授權」頁附上）；(2) 如果你**修改了 SheetJS 原始檔**再散布，要在改過的檔案註明有修改；(3) Apache-2.0 有專利授權條款，也有「你告別人專利侵權就失去授權」的條款。商標 SheetJS 不能拿來當你的產品名。
- **付費版 SheetJS Pro（閉源）**：README 寫得很直白——Pro 才有「styling（樣式）、images/graphs/PivotTables（圖片／圖表／樞紐分析）、evaluate formula expressions（公式計算）、編輯複雜範本」（[BASE/README.md 第 7–10 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/README.md#L7-L10)）。程式碼也印證：開源版寫檔時的樣式表是寫死的一組預設字型／填色／框線（見第 5 節 `write_sty_xml`）。Pro 價格本次**未確認**（不能上網）。
- **社群版另一個坑（npm 版本）**：見第 9 節，npm 上的 `xlsx` 版本停在舊版，新版只放在 SheetJS 自己的 CDN；授權仍是 Apache-2.0，但「從哪裡安裝」會影響你拿到的是不是有安全修補的版本。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | 純 JavaScript（ES3/ES5 相容寫法，帶 Flow 型別註解在註解裡），另有 TypeScript 型別檔 `types/index.d.ts` |
| 前端 | 瀏覽器直接 `<script>` 載入或 ES Module `import`；不依賴 React／Vue／jQuery |
| 後端 | 可選。Node.js（`engines: node >=0.8`）、Deno、Bun 都能跑（`.github/workflows` 有 `bun.yml`、`deno.yml`、`node-*.yml`） |
| 執行期相依 | **零**——`package.json` 的 `dependencies` 是空的（[BASE/package.json](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/package.json)）；CHANGELOG v0.18.6 寫「Removed all npm dependencies」。ZIP 壓縮解壓、OLE 容器（舊 .xls）都自己內建在 `bits/18_cfb.js` |
| 資料庫 | 無（你自己存 Firestore） |
| 部署 | 一支 JS 檔丟到 Firebase Hosting 或用 CDN 即可 |
| 硬體／GPU | 不需要 GPU。大檔案吃的是瀏覽器記憶體（整份活頁簿會轉成 JS 物件放在記憶體） |
| API Key／費用 | **不需要任何 API Key，0 元**。只有想要樣式、公式計算等功能才要買 Pro（價格未確認） |

**套件大小**（本次用 `wc -c` 與 `gzip -9c | wc -c` 自己量 master 分支內的檔案）：

| 檔案 | 原始大小 | gzip 後 | 內容 |
|---|---|---|---|
| `dist/xlsx.full.min.js` | 914,236 bytes | 約 324 KB | 全功能＋所有字碼頁（含 Big5／cp950） |
| `dist/xlsx.core.min.js` | 469,543 bytes | 約 150 KB | 全格式，但不含字碼頁表 |
| `dist/xlsx.mini.min.js` | 267,314 bytes | 約 83 KB | 只含 xlsx／csv／ods 等常用格式 |
| `xlsx.mjs`（ESM，未壓縮） | 972,376 bytes | 約 239 KB | 給 Vite／打包工具用，可 tree-shake |

---

## 4. 程式架構地圖

```
master 分支（515d1c6）
├── bits/                 ★ 真正的原始碼：84 個 .js 檔，依檔名數字順序串接成 xlsx.js（共 26,569 行，wc -l 計）
│   ├── 01_version.js         版本號 XLSX.version = '0.18.12'
│   ├── 02_codepage.js        字碼頁（含 950 = Big5 繁中）
│   ├── 10_ssf.js             ★ SSF：Excel 數字格式引擎（"#,##0.00"、日期、上午/下午）
│   ├── 18_cfb.js             ★ ZIP 與 OLE(CFB) 容器讀寫、自帶 deflate/inflate
│   ├── 19_fsutils.js         瀏覽器下載檔案（Blob + <a download>）
│   ├── 27_csfutils.js        ★ A1 位址編碼解碼、aoa_to_sheet
│   ├── 39_xlsbiff.js / 76_xls.js / 78_writebiff.js   舊版 .xls (BIFF2–8) 讀寫
│   ├── 44_offcrypto.js       加密檔處理（只支援舊式）
│   ├── 47_styxml.js          xlsx 樣式表讀取＋寫出（寫出是固定預設樣式）
│   ├── 61_fcommon.js〜64_ftab.js  公式「文字化」：把二進位公式 token 轉成 "SUM(A1:A3)"（不計算）
│   ├── 66_wscommon.js〜68_wsbin.js  ★ 工作表 XML/二進位讀寫（合併、欄寬、篩選、超連結）
│   ├── 72_wbxml.js / 73_wbbin.js   活頁簿層（工作表清單、定義名稱）
│   ├── 75_xlml.js            Excel 2003 XML
│   ├── 79_html.js            ★ HTML <table> ⇄ 工作表
│   ├── 80_parseods.js / 81_writeods.js   OpenDocument
│   ├── 83_numbers.js         Apple Numbers
│   ├── 84_defaults.js        讀寫選項預設值
│   ├── 85_parsezip.js / 86_writezip.js   xlsx/xlsb/ods 的 ZIP 內容組裝
│   ├── 87_read.js            ★ XLSX.read：用檔頭 magic bytes 自動判斷格式
│   ├── 88_write.js           ★ XLSX.write / writeFile：依 bookType 分派
│   ├── 90_utils.js           ★ sheet_to_json / json_to_sheet / sheet_to_csv 等
│   ├── 95_api.js             ★ XLSX.utils 物件（公開 API 清單）
│   └── 98_exports.js         匯出 XLSX.read / write / utils / SSF
├── xlsx.js / xlsx.mjs        bits 串接後的成品（CommonJS / ESM）
├── dist/                     壓縮版（full / core / mini）、cpexcel 字碼頁、xlsx.zahl（Numbers 用）
├── types/index.d.ts          TypeScript 型別（922 行），資料模型最權威的說明
├── xlsxworker.js             Web Worker 範例（在背景執行緒解析）
├── packages/                 子套件：ssf（數字格式獨立版）、xlsx-cli、s、s2c、otorp
├── modules/                  TypeScript 寫的部分模組（Numbers、VBA、RTF…）
├── demos/                    各框架整合說明（多數只剩 README 指向官網）
│   └── xspreadsheet/xlsxspread.js  ★ SheetJS ⇄ x-spreadsheet 互轉
├── test.js                   mocha 測試（2,913 行）
└── Makefile                  `DEPS=$(sort $(wildcard bits/*.js))` → 串成 xlsx.js
```

建置方式見 [BASE/Makefile 第 19 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/Makefile#L19)：就是把 `bits/*.js` 依檔名排序串起來。所以**你要拆功能時，直接看 bits 單檔就好，每個檔只做一件事**。

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置 → 實作重點）

### 5.1 讀檔：`XLSX.read()` 自動判斷格式
- 位置：[bits/87_read.js 第 67–119 行 `readSync`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/87_read.js#L67-L119)
- 重點：不看副檔名，看**檔頭前幾個 byte**：`0xD0 0xCF 0x11 0xE0` → 舊 .xls（OLE 容器）；`0x50 0x4B`（"PK"）→ ZIP（xlsx／xlsb／ods／numbers）；`0x3C`（"<"）→ XML／HTML；`0xFF 0xFE` → UTF-16 文字；其他 → 當純文字（CSV／PRN）。還會擋掉 PNG、TIFF 並丟出「不是試算表」錯誤。
- 傳入 `ArrayBuffer`／`Uint8Array` 會自動設成 `type:"array"`，所以瀏覽器 `await file.arrayBuffer()` 直接丟進去即可。
- 讀取選項預設值：[bits/84_defaults.js 第 11–31 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/84_defaults.js#L11-L31)——`cellFormula`（預設讀公式字串）、`cellNF`（數字格式）、`cellStyles`（預設不讀樣式）、`cellDates`（日期是否轉 JS Date）、`sheetRows`（只讀前 N 列，大檔預覽很好用）、`password`。

### 5.2 寫檔：`XLSX.write()`／`writeFile()`
- 位置：[bits/88_write.js 第 121–165 行 `writeSync`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/88_write.js#L121-L165)
- 重點：一個大 `switch(o.bookType)`，本次自己數 case 標籤共 29 個（xlsx、xlsm、xlsb、xls/biff2–8、ods、fods、csv、txt、html、dif、dbf、sylk、prn、rtf、eth、wk1、wk3、numbers…）。CSV 輸出會自動加 UTF-8 BOM `﻿`（Excel 開繁中 CSV 不亂碼的關鍵）。
- ZIP 壓縮預設**關閉**（[bits/84_defaults.js 第 42 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/84_defaults.js#L42)），要自己加 `{compression:true}`，否則檔案會比 Excel 存的大好幾倍（[bits/88_write.js 第 32–57 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/88_write.js#L32-L57)）。
- 瀏覽器下載：[bits/19_fsutils.js 第 11–50 行 `write_dl`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/19_fsutils.js#L11-L50)，用 `Blob` + `URL.createObjectURL` + 動態 `<a download>` 點擊；Chrome 擴充套件則改用 `chrome.downloads`。

### 5.3 JSON ⇄ 工作表（你最常用的）
- `sheet_to_json`：[bits/90_utils.js 第 46–100 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/90_utils.js#L46-L100)。第一列當表頭；重複表頭自動改名成 `品名_1`；空白表頭變 `__EMPTY`；`header:1` 回傳二維陣列；`defval:""` 讓空格也有鍵；`raw:false` 回傳「Excel 顯示的文字」而不是原始數值；`skipHidden` 跳過隱藏列欄。
- 每列的組裝：[同檔第 7–43 行 `make_json_row`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/90_utils.js#L7-L43)，會偷偷塞一個不可列舉的 `__rowNum__`（原始列號），回寫錯誤訊息時很有用。
- `json_to_sheet`／`sheet_add_json`：[同檔第 192–261 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/90_utils.js#L192-L261)。
- `aoa_to_sheet`／`sheet_add_aoa`（二維陣列）：[bits/27_csfutils.js 第 113–179 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/27_csfutils.js#L113-L179)。依 JS 型別判斷儲存格型別（number→`n`、boolean→`b`、Date→轉成 Excel 序號並套日期格式、其他→`s`）；陣列元素若是物件就直接當儲存格物件（可以塞 `{v:100, f:"B2*C2", z:"#,##0"}`）；`origin:-1` 代表「接在最後一列後面」，很適合做「追加紀錄」。

### 5.4 A1 位址工具
- [bits/27_csfutils.js 第 1–45 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/27_csfutils.js#L1-L45)：`encode_col(0)="A"`、`decode_cell("B3")={c:1,r:2}`、`decode_range("A1:C9")`。任何網頁試算表專案都需要，這幾行可以直接抄。

### 5.5 HTML 表格 ⇄ 工作表
- `sheet_to_html`：[bits/79_html.js 第 116–127 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/79_html.js#L116-L127)；每列：[第 60–91 行 `make_html_row`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/79_html.js#L60-L91)，合併儲存格變 `rowspan/colspan`，每格帶 `data-t`（型別）`data-v`（原始值）`data-z`（格式）與 `id="sjs-B3"`。選項 `editable:true` 會把內容包成 `<span contenteditable="true">`（[第 80 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/79_html.js#L80)）——這是 SheetJS 唯一「可編輯」的東西，非常陽春。
- `table_to_sheet`／`sheet_add_dom`：[第 129–226 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/79_html.js#L129-L226)。讀 `data-v`／`data-t`／`data-z`，沒有就讀 innerHTML 去標籤；`TRUE/FALSE` 轉布林、像數字的轉數字、像日期的轉日期；`display:true` 會略過被 CSS 隱藏的列。**你現有倉儲 App 的任何 `<table>` 都可以一行匯出成 xlsx。**

### 5.6 數字格式引擎 SSF
- [bits/10_ssf.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/10_ssf.js)：內建格式表 [第 36–69 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/10_ssf.js#L36-L69)；格式解析 `eval_fmt` 第 701 行起；入口 `SSF_format` [第 944–965 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/10_ssf.js#L944-L965)。
- 支援中文 `上午/下午`（[第 736–740 行附近](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/10_ssf.js#L736-L740)）與泰國佛曆 `b`（年 +543，[第 288–289 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/10_ssf.js#L288-L289)）。
- **台灣要注意**：`e`（年號／era）格式只是直接輸出西元年（[第 343–344 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/10_ssf.js#L343-L344)），全檔搜尋沒有 `1911` 的換算——**不支援民國年**。台灣會計軟體匯出的「113/05/01」顯示格式，讀進來的 `.w` 文字可能變成西元年；要以 `.v`（Excel 日期序號）自己換算。
- 這個引擎也被 Luckysheet 等專案內嵌（Luckysheet 用的就是 SSF 0.11.2），獨立版在 `packages/ssf/`。

### 5.7 公式：只「讀寫字串」，不計算
- 二進位格式（xls／xlsb）的公式是 token，SheetJS 用函數對照表把編號還原成名稱：[bits/64_ftab.js 第 399–879 行 `Ftab`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/64_ftab.js#L399-L879)（本次用 `sed -n 399,879p | grep -cE '^\s*[0-9]+: *"'` 數得 **479 個函數名稱**，到 `AVERAGEIFS` 為止；Excel 2010 以後的新函數以 `_xlfn.` 前綴保存）。**這是「看得懂名稱」，不是「會算」**。
- 全 `bits/` 搜尋 `evaluat|recalc` 只找到對照表與 Excel 的 calcPr 設定，**沒有任何計算引擎**。讀 xlsx 時你拿到的值是 Excel 上次存檔時快取的計算結果；你自己寫進去的公式，SheetJS 寫出的檔案裡沒有值，要等使用者用 Excel 打開才會算。
- 陣列公式：`sheet_set_array_formula`（[bits/90_utils.js 第 359–379 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/90_utils.js#L359-L379)）可以寫入陣列公式與動態陣列。
- `sheet_to_formulae`（[bits/90_utils.js 第 158 行起](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/90_utils.js#L158)）把整張表列成 `A1=…` 清單，拿來 debug 或交給公式引擎（HyperFormula）很方便。

### 5.8 樣式：讀「部分」、寫「幾乎沒有」
- **寫**：[bits/47_styxml.js 第 413–430 行 `write_sty_xml`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/47_styxml.js#L413-L430)：fonts、fills、borders 都是**寫死一組**（Calibri 12、無填色、無框線），只有 `numFmts`（數字格式）與 `cellXfs` 是動態的。`cellXfs` 由 [bits/66_wscommon.js 第 60–82 行 `get_cell_style`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/66_wscommon.js#L60-L82) 產生——**只看 `cell.z`（數字格式），完全不看 `cell.s`**，fontId/fillId/borderId 全部是 0。所以網路上教你設 `cell.s = {font:{bold:true}}` 的範例，在社群版**不會有效果**（那是 Pro 或第三方 fork 的功能）。
- **讀**：`cellStyles:true` 時，[bits/66_wscommon.js 第 84–118 行 `safe_format`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/66_wscommon.js#L84-L118) 只把**填色**（`Fills[fillid]`，含 theme 色換算 rgb）放進 `cell.s`；字型、框線雖然有解析（`parse_fonts`、`parse_borders`）但不會掛到儲存格上。欄寬（`!cols`）也要 `cellStyles:true` 才讀（[bits/67_wsxml.js 第 49–55 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L49-L55)）。

### 5.9 工作表層級的功能（寫 xlsx 時）
- [bits/67_wsxml.js 第 541–659 行 `write_ws_xml`](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L541-L659) 是最好的「開源版能寫什麼」清單：有寫 `!cols`（欄寬／隱藏）、列高 `!rows`、`!protect`（工作表保護）、`!autofilter`（篩選按鈕）、`!merges`（合併儲存格）、超連結、`!margins`（列印邊界）、註解（VML）。
- 只留下註解沒有實作：`sheetCalcPr`、`sortState`、`conditionalFormatting`（條件格式）、`dataValidations`（下拉選單）、`pageSetup`、`tableParts`（Excel 表格）、`picture`（第 584–654 行的 `/* … */` 註解）。
- 凍結窗格：`write_ws_xml_sheetviews`（[第 252–256 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L252-L256)）只寫 `workbookViewId` 與 `rightToLeft`，**沒有 `<pane>`，不能凍結窗格**。

### 5.10 與 x-spreadsheet 的橋接（「格子 UI」怎麼接）
- [BASE/demos/xspreadsheet/xlsxspread.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/demos/xspreadsheet/xlsxspread.js)（`github` 分支也有一份完全相同的：[GBASE/demos/xspreadsheet/xlsxspread.js](https://github.com/SheetJS/sheetjs/blob/3f44ddd99c704d7ca35ea76fef7b8af2d2d435cb/demos/xspreadsheet/xlsxspread.js)，本次 `diff` 確認一致）。
- `stox(wb)`（[第 14–64 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/demos/xspreadsheet/xlsxspread.js#L14-L64)）：SheetJS 活頁簿 → x-spreadsheet 的 `{name, rows:{i:{cells:{j:{text}}}}, merges}`；公式轉成 `"=" + f`。
- `xtos(sdata)`（[第 73–133 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/demos/xspreadsheet/xlsxspread.js#L73-L133)）：反方向。
- **已知 bug**：[第 100 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/demos/xspreadsheet/xlsxspread.js#L100) `cellText = Boolean(cellText)`——`Boolean("false")` 在 JS 是 `true`，所以格子裡打 `false` 匯出會變成 TRUE。拿來用時改成 `cellText.toLowerCase() === "true"`。另外它只搬文字與合併，**樣式、欄寬都會丟**。

### 5.11 編碼（繁中舊檔）
- [bits/02_codepage.js 第 6 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/02_codepage.js#L6) 的 `VALID_ANSI` 含 `950`（Big5），第 17 行把 Excel 的 charset 136（CHINESEBIG5）對到 950。舊 .xls、DBF 或 Big5 編碼的 CSV 要用 **full 版**（含 cpexcel 字碼頁表）並傳 `{codepage:950}`，否則中文會亂碼；`readSync` 偵測到有 `codepage` 但沒載入字碼頁表時會在 console 警告（[bits/87_read.js 第 70 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/87_read.js#L70)）。

### 5.12 加密檔
- [bits/85_parsezip.js 第 296–300 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/85_parsezip.js#L296-L300)：會檢查 `decrypt_agile`／`decrypt_std76` 是否存在，但全 `bits/` 搜尋**找不到這兩個函數的定義**，所以有開啟密碼的新版 .xlsx 會丟出「File is password-protected」。只有舊 .xls 的 XOR／RC4 有部分實作（`bits/44_offcrypto.js`）。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整包 xlsx 讀寫（建議直接用，不要拆） | [BASE/xlsx.mjs](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/xlsx.mjs)、[dist/](https://github.com/SheetJS/sheetjs/tree/515d1c6f2e1d3ca422ee9198b177cfd926434936/dist) | 無 | 低 | `<script src>` 或 `import * as XLSX`；當成所有網頁試算表 UI 的「開檔／存檔」層 |
| `sheet_to_json`／`json_to_sheet` | [bits/90_utils.js#L46-L261](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/90_utils.js#L46-L261) | 位址工具、`format_cell`（SSF） | 中 | Excel ⇄ Firestore 文件陣列的轉換核心 |
| A1 位址工具 | [bits/27_csfutils.js#L1-L45](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/27_csfutils.js#L1-L45) | 無 | 低 | 直接複製約 45 行，給你自己的格子 UI／公式引擎用 |
| SSF 數字格式引擎 | [bits/10_ssf.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/10_ssf.js)、[packages/ssf/](https://github.com/SheetJS/sheetjs/tree/515d1c6f2e1d3ca422ee9198b177cfd926434936/packages/ssf) | 無 | 低 | 讓你的網頁表格用 Excel 格式字串（`#,##0`、`yyyy/mm/dd`）顯示數字；可自行補民國年 |
| HTML table ⇄ sheet | [bits/79_html.js#L60-L226](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/79_html.js#L60-L226) | 位址工具、SSF、`htmldecode` | 中 | 倉儲 App 現有 `<table>` 一鍵匯出；或做 Excel 預覽 |
| x-spreadsheet 橋接 `stox/xtos` | [demos/xspreadsheet/xlsxspread.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/demos/xspreadsheet/xlsxspread.js) | XLSX 全域物件、x-spreadsheet | 低 | 133 行；照這個模式寫 SheetJS ⇄ Luckysheet／Univer／Handsontable 的轉換器（記得修第 100 行 bug） |
| 瀏覽器下載 `write_dl` | [bits/19_fsutils.js#L11-L50](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/19_fsutils.js#L11-L50) | 無 | 低 | 任何「產生檔案給使用者下載」的功能都能抄 |
| ZIP 讀寫（純 JS） | [bits/18_cfb.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/18_cfb.js)（`parse_zip` 第 1371 行、`write_zip` 第 1480 行） | 無 | 中 | 想自己打包多個檔案時可參考；但通常直接用 fflate／JSZip 更省事 |
| Web Worker 背景解析 | [BASE/xlsxworker.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/xlsxworker.js) | xlsx.js、cpexcel.js | 低 | 大檔（幾萬列）在 Worker 解析，主畫面不卡 |
| TypeScript 型別（資料模型說明書） | [types/index.d.ts#L633-L669](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/types/index.d.ts#L633-L669) | 無 | 低 | 讓 Claude Code 讀這份就能正確產生 SheetJS 程式碼 |

---

## 7. AI／Claude 整合

- **專案本身完全沒有 AI 功能**：沒有模型、沒有 prompt、沒有 MCP、沒有 Skills（全 repo 檔案清單中無相關檔案）。
- **能不能接 Claude？可接，而且很適合**：SheetJS 是「把 Excel 變成 Claude 看得懂的文字」的最佳前處理器：
  1. 使用者丟一份供應商報價單 → `sheet_to_csv(ws)` 或 `sheet_to_json(ws)` → 送給 Claude（透過你自己的 Firebase Cloud Function 代理 API Key）請它「整理成標準欄位：品名／規格／單價／最小訂購量」→ 回傳 JSON → `json_to_sheet` → 下載乾淨的 xlsx。
  2. 廣告報表 CSV → `sheet_to_json` → Claude 寫成週報文字。
  3. 反過來：讓 Claude 產生 `[[…],[…]]` 二維陣列（例如 30 支短影音的腳本清單：集數／鉤子／台詞／拍攝鏡位），用 `aoa_to_sheet` 輸出成 xlsx 給拍攝團隊。
- **注意**：送給 Claude 時用 `sheet_to_csv` 比 JSON 省 token；大表先用 `sheetRows` 或 `range` 只取需要的部分。公式欄位用 `sheet_to_formulae` 才看得到公式本身。
- Anthropic 官方的 Excel 相關 Skill 是用 Python（openpyxl）而不是 SheetJS——這點是一般知識，本次未在此 repo 內驗證；若你要在瀏覽器端做，SheetJS 是首選。

---

## 8. 擴充方式與 API

**公開 API 全清單**（[bits/95_api.js 第 1–39 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/95_api.js#L1-L39) 與 [bits/98_exports.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/98_exports.js)）：

- 頂層：`XLSX.read`、`readFile`、`write`、`writeFile`、`writeFileAsync`、`writeXLSX`、`writeFileXLSX`（只含 xlsx 寫入，打包較小）、`XLSX.SSF`、`XLSX.CFB`、`XLSX.stream`（Node 串流輸出 CSV／HTML，[bits/97_node.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/97_node.js)）。
- `XLSX.utils`：位址 `encode_/decode_*`、`format_cell`、`sheet_add_aoa/json/dom`、`aoa_to_sheet`、`json_to_sheet`、`table_to_sheet`、`table_to_book`、`sheet_to_csv/txt/json/html/formulae`、`sheet_get_cell`、`book_new`、`book_append_sheet`、`book_set_sheet_visibility`、`cell_set_number_format`、`cell_set_hyperlink`、`cell_set_internal_link`、`cell_add_comment`、`sheet_set_array_formula`、`consts`。
- **沒有外掛系統、沒有事件**：它是無狀態函式庫，「擴充」的方式就是直接操作資料物件（`ws["C5"] = {t:"n", v:100, z:"#,##0"}`）。
- 子專案：`packages/xlsx-cli`（命令列轉檔）、`packages/ssf`（數字格式獨立版）、`packages/s`（仿 OfficeJS Excel API 的包裝，README 寫 1.x 不穩定）、`packages/s2c`（Deno 版「上傳試算表轉 CSV」服務）。

---

## 9. 程式品質與風險

**維護狀況**
- GitHub 這份已**停止更新**：`github` 分支最後 commit 2024-01-31（只剩說明檔），`master` 原始碼停在 **2022-10-04（0.18.12）**。後續開發搬到 git.sheetjs.com（本次依規定未連線，**新版內容未確認**）。
- **npm 版本停在舊版的問題**：master 的 `package.json` 是 0.18.12，但就我所知 npm 上的 `xlsx` 最後一版停在 **0.18.5**，更新的版本只發佈在 `cdn.sheetjs.com`（官方建議 `npm i https://cdn.sheetjs.com/xlsx-<版本>/xlsx-<版本>.tgz`）。這段屬外部資訊，**本次未連網驗證**。實務影響：`npm install xlsx` 會拿到 2022 年的舊版，`npm audit` 會報弱點。
- **已知弱點（外部資訊，未連網驗證）**：CVE-2023-30533（讀取惡意檔案的原型污染，0.19.3 修正）、CVE-2024-22363（ReDoS，0.20.2 修正）。master 的 0.18.12 都在受影響範圍內。**如果你要讓「別人上傳的 Excel」進到你的系統，請從 SheetJS CDN 裝 0.20.2 以上**；只處理自己的檔案則風險較低。

**測試**：`test.js` 2,913 行，`grep -c "it("` 得 253 行含測試案例；CI 有 Node 0.8〜最新、Deno、Bun 等多組 workflow（`.github/workflows/` 8 個檔）。測試檔案庫在另一個 repo（`test_files` 是 submodule，本次未取）。成熟度高，十年以上「battle-tested」。

**資安／隱私**
- 函式庫本身**無遙測**：`bits/` 內除了下載檔案用的 `navigator.msSaveBlob` 外，搜尋不到 `fetch`／`XMLHttpRequest`／`sendBeacon`。README 裡有 ga-beacon 統計圖片（只在 GitHub 頁面上，不會進你的程式）。檔案全程在瀏覽器解析，不會上傳。
- **XSS 風險**：`sheet_to_html` 直接使用 `cell.h`（從檔案讀來的富文字 HTML），而超連結 `cell.l.Target` 沒有跳脫就放進 `<a href="…">`（[bits/79_html.js 第 85 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/79_html.js#L85)）。**不要把陌生人的 Excel 用 `sheet_to_html` 直接 `innerHTML` 到頁面**；改用 `sheet_to_json` + `textContent` 自己畫表。
- `sheet_to_json` 用表頭文字當物件鍵（[bits/90_utils.js 第 74–91 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/90_utils.js#L74-L91)），表頭若是 `__proto__` 之類的字串會有怪行為；寫進 Firestore 前建議白名單過濾欄位。

**已知的坑（本次讀程式碼發現）**
1. [bits/67_wsxml.js 第 554 行](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L554)：`range.e.r = Math.min(range.e.c, 0xFFFFF);`——應該是 `range.e.r`，打錯成 `e.c`。只在範圍超過 Excel 上限時觸發，平常不會遇到。
2. `xlsxspread.js` 第 100 行 `Boolean("false") === true`（見 5.10）。
3. 寫檔預設不壓縮（見 5.2），一定要加 `compression:true`。
4. 日期：預設把日期讀成 Excel 序號數字；要 `cellDates:true` 才是 JS `Date`；時區問題常見（序號沒有時區）。
5. 民國年格式不支援（見 5.6）。
6. 社群版樣式寫不出去（見 5.8）——這是最多人踩的坑。
7. 整份活頁簿進記憶體，非串流解析；幾十萬列的 xlsx 在手機瀏覽器可能爆記憶體（未實測）。

---

## 10. 跟其他專案組合的建議

- **最推薦組合（純 JS、可接 Firestore）**：
  - A＝格子 UI：x-spreadsheet（MIT，純 JS，canvas）或 Luckysheet（已停維護）／Univer（新、功能完整、Apache-2.0）。
  - B＝公式引擎：HyperFormula（GPL-3.0 或商業授權，要注意授權）或 Univer 內建公式。
  - C＝SheetJS：負責 .xlsx／.csv 開檔與存檔。
  - 流程：`XLSX.read` → 轉成 A 的資料格式（照 `stox` 寫）→ 使用者編輯 → B 算出結果 → 轉回 SheetJS 物件（照 `xtos` 寫）→ `writeFile`。Firestore 存的是 A 的 JSON 或 SheetJS 的稀疏格式（見第 11 節）。
- **只要「匯入匯出」不要「像 Excel 一樣編輯」**（多數倉儲場景其實是這樣）：SheetJS + 你現有的 HTML 表格就夠了，不用引入大型試算表 UI。
- **要「匯出漂亮報表」（粗體、底色、框線）**：SheetJS 社群版做不到。替代：ExcelJS（MIT，支援樣式寫入，本次未掃描）或第三方 fork（例如 `xlsx-js-style`，未確認維護狀況），或買 SheetJS Pro。可以「SheetJS 讀、ExcelJS 寫」。
- **跟 AI 影片／腳本工具組合**：用 SheetJS 讀「商品清單.xlsx」（品名、賣點、價格）→ 每列丟給 Claude 產生短影音腳本 → 結果寫回同一份 xlsx 的新欄位，給剪輯或 AI 影片工具批次使用。

---

## 11. 網頁 Excel 能力檢查表

> 先講結論：SheetJS 是「檔案格式」工具，不是「試算表 UI」。下表中大多數 UI 項目都是「沒有」，這是**定位不同**，不是品質差。

### 渲染與效能
- **渲染方式**：沒有（無 UI）。唯一能「顯示」的是 `sheet_to_html` 產生普通 DOM `<table>`（[bits/79_html.js#L116-L127](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/79_html.js#L116-L127)）。
- **虛擬捲動**：沒有。
- **10 萬列以上**：解析層面可以（xlsx 格式上限 1,048,576 列，程式有檢查 `0xFFFFF`，[bits/67_wsxml.js#L550-L556](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L550-L556)）；可用 `sheetRows` 只讀前 N 列、用 Web Worker（`xlsxworker.js`）背景解析、`dense` 模式（工作表用二維陣列而非 `"A1"` 鍵物件，[bits/27_csfutils.js#L115-L117](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/27_csfutils.js#L115-L117)）省記憶體。實際速度**未實測**。顯示 10 萬列要靠別的 grid 元件。

### 公式引擎
- **函數數量**：計算函數 **0 個**（沒有計算引擎）。「認得名稱」的函數對照表 `Ftab` 有 **479 個**（數法：`sed -n 399,879p bits/64_ftab.js | grep -cE '^\s*[0-9]+: *"'`，[bits/64_ftab.js#L399-L879](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/64_ftab.js#L399-L879)），用途只是把 xls/xlsb 二進位公式還原成文字。
- **解析器**：有「二進位公式 → 文字」解碼器（`bits/62_fxls.js`、`bits/63_fbin.js`）；xlsx 本來就是文字公式直接保存。**依賴圖／重算：沒有**（全 bits 搜尋 `evaluat|recalc` 無計算程式）。計算是 **付費版才有**（README 第 9 行「evaluate formula expressions」列為 Pro 功能）。
- **陣列公式**：有（讀寫保存 `F` 範圍；`sheet_set_array_formula`，[bits/90_utils.js#L359-L379](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/90_utils.js#L359-L379)），但不計算。
- **跨工作表參照**：有（以字串保存，例如 `Sheet2!A1`；`formula_quote_sheet_name` 處理含空白的表名，[bits/27_csfutils.js#L53](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/27_csfutils.js#L53)），不計算。
- **自訂函數**：沒有。

### 編輯操作
- **儲存格編輯**：沒有（只有 `sheet_to_html({editable:true})` 的 `contenteditable` 陽春版，[bits/79_html.js#L80](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/79_html.js#L80)）。
- **複製貼上**：函式庫內沒有剪貼簿處理；但可以自己做：Excel／Google 試算表複製時剪貼簿裡有 `text/html`（含 `<table>`），把它塞進一個 `<div>` 再 `table_to_sheet` 就能解析（`html_to_sheet` 也能直接吃 HTML 字串，[bits/79_html.js#L2](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/79_html.js#L2)）。官方 demos/README 也列了「Clipboard Data」範例（[BASE/demos/README.md](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/demos/README.md)，內容在官網，未確認）。
- **拖拉填滿、復原／重做**：沒有。

### 格式
- **數字格式**：有，讀寫都支援（`cell.z`，SSF 引擎，[bits/10_ssf.js#L944-L965](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/10_ssf.js#L944-L965)）。民國年不支援。
- **字型／顏色／框線**：讀只有填色，寫**付費版才有**（[bits/47_styxml.js#L413-L430](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/47_styxml.js#L413-L430)）。
- **條件格式**：沒有（`write_ws_xml` 中只有 `/* conditionalFormatting */` 註解，[bits/67_wsxml.js#L600](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L600)）；Pro 是否有：未確認。
- **合併儲存格**：有，讀寫（`!merges`，[bits/67_wsxml.js#L96-L101](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L96-L101)）。
- **凍結窗格**：沒有（[bits/67_wsxml.js#L252-L256](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L252-L256) 不寫 pane）。
- **欄寬列高**：有（`!cols` 的 `wch`／`wpx`／`width`、`!rows` 的 `hpt`／`hpx`，[bits/66_wscommon.js#L33-L46](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/66_wscommon.js#L33-L46)、[bits/67_wsxml.js#L206-L214](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L206-L214)）；讀取需 `cellStyles:true`。
- **篩選**：部分有——只能寫出「篩選按鈕範圍」（`!autofilter`，[bits/67_wsxml.js#L216-L235](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L216-L235)），不能存篩選條件。
- **排序**：沒有（`/* sortState */` 只是註解）；排序請在 JS 陣列層自己做。
- **資料驗證（下拉選單）**：沒有（`/* dataValidations */` 只是註解，[bits/67_wsxml.js#L601](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/67_wsxml.js#L601)）。

### 圖表、樞紐、圖片
- **圖表**：讀取只抓得到 chartsheet 的快取數據（`bits/69_chartxml.js`、`bits/70_csheet.js`），`parse_drawing` 註解寫「TODO: handle embedded charts and other types of graphics」（[bits/54_drawing.js#L3-L19](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/54_drawing.js#L3-L19)）。寫入圖表：**付費版才有**（README）。
- **樞紐分析**：付費版才有（README）。開源版讀檔時樞紐表只剩一般儲存格值。
- **圖片／附件**：付費版才有（README「images」）；`write_ws_xml` 中 `/* picture */` 只是註解。註解（cell comments）有：`cell_add_comment`。超連結有：`cell_set_hyperlink`。

### 匯入匯出（這是 SheetJS 的本業）
- **.xlsx**：有，讀寫，**自己實作**（不依賴 JSZip／ExcelJS）；ZIP 在 [bits/18_cfb.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/18_cfb.js)，xlsx 組裝在 [bits/86_writezip.js](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/86_writezip.js)（`write_zip_xlsx` 第 136 行）。
- **.csv**：有，讀寫；寫出自動加 UTF-8 BOM（[bits/88_write.js#L141](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/bits/88_write.js#L141)），讀取支援 UTF-16 與 Big5（需 full 版＋`codepage:950`）。
- **其他**：xls（BIFF2–8）、xlsb、xlsm、ods、fods、Numbers、HTML、SYLK、DIF、DBF、Lotus WK1/WK3、RTF 等（`writeSync` 的 29 個 bookType case）。
- **保真度**：**資料（值、公式字串、數字格式、合併、欄寬、超連結、註解、定義名稱、工作表隱藏）高**；**外觀（字型、顏色、框線、條件格式、資料驗證、圖表、圖片、樞紐、凍結窗格）在「讀→寫」來回後會遺失**。換句話說：拿來做資料交換很好，拿來「編輯別人精心排版的範本再存回去」不行（那正是 Pro 的賣點「Edit complex templates」）。

### 多人即時協作
- 沒有（無 OT／CRDT／鎖定）。協作要靠 A（UI 專案）或你自己用 Firestore 即時監聽實作。

### 資料模型與存進 Firestore
- 活頁簿：`{ SheetNames: ["庫存"], Sheets: { "庫存": ws }, Workbook: {...} }`；工作表是「稀疏物件」，鍵是 A1 位址，`!` 開頭是中繼資料（[types/index.d.ts#L548-L583](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/types/index.d.ts#L548-L583)）；儲存格欄位（[types/index.d.ts#L633-L669](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/types/index.d.ts#L633-L669)）：`v` 原始值、`t` 型別（b/n/e/s/d/z）、`w` 顯示文字、`f` 公式、`F` 陣列公式範圍、`z` 數字格式、`l` 超連結、`c` 註解、`s` 樣式（只讀填色）、`h`／`r` 富文字。

```json
{
  "!ref": "A1:C3",
  "!merges": [{"s":{"r":0,"c":0},"e":{"r":0,"c":2}}],
  "!cols": [{"wch":20},{"wch":8},{"wch":12}],
  "A1": {"t":"s","v":"五月進貨"},
  "A2": {"t":"s","v":"品名"}, "B2": {"t":"s","v":"數量"}, "C2": {"t":"s","v":"成本"},
  "A3": {"t":"s","v":"紙箱 60cm"}, "B3": {"t":"n","v":200},
  "C3": {"t":"n","v":3600,"f":"B3*18","z":"#,##0"}
}
```

- **存 Firestore 的建議**：
  1. **最簡單**：`sheet_to_json(ws)` → 每列一份文件（`collection('inventory').doc(料號)`），這最符合你倉儲 App 的資料結構；要匯出時再 `json_to_sheet`。
  2. **要保留整張表（含公式、合併、格式）**：存上面那種稀疏物件。注意 Firestore 欄位名不能含某些字元且 `!` 開頭鍵、`__` 開頭鍵有限制（Firestore 保留 `__.*__` 形式的欄位名；`!ref` 能否當欄位名：未確認），建議轉成 `{ meta:{ref, merges, cols}, cells:{ "A1":{...} } }` 再存；單一文件上限 1 MiB，大表要分片。
  3. 日期一律存 ISO 字串或 Firestore Timestamp，不要存 Excel 序號。

### 手機／觸控、繁體中文介面
- 手機／觸控：不適用（無 UI）；函式庫本身可在手機瀏覽器執行（未實測大檔效能）。
- 繁中介面：不適用；**繁中資料**支援良好（UTF-8／UTF-16、Big5 字碼頁、`上午/下午` 格式），但不支援民國年。

### 嵌入純 JavaScript 網頁（不用 React／Vue）
- **可以**，這是它最基本的用法。大小見第 3 節（mini 約 83 KB gzip、full 約 324 KB gzip）。
- 最小可用範例（匯入 → 顯示 → 匯出；CDN 版本號請到 cdn.sheetjs.com 確認，或用 jsDelivr 的 `xlsx@0.18.5` 舊版）：

```html
<input type="file" id="f" accept=".xlsx,.xls,.csv">
<button id="exp">匯出 xlsx</button>
<table id="tbl"></table>
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
<script>
let rows = [];
document.getElementById('f').onchange = async (e) => {
  const wb = XLSX.read(await e.target.files[0].arrayBuffer(), { cellDates: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  rows = XLSX.utils.sheet_to_json(ws, { defval: '' });   // [{品名:'紙箱', 數量:200}, ...]
  const tbl = document.getElementById('tbl'); tbl.replaceChildren();
  rows.forEach(r => {                                     // 用 textContent 畫，避免 XSS
    const tr = tbl.insertRow();
    Object.values(r).forEach(v => { tr.insertCell().textContent = v; });
  });
  // 這裡可以：rows.forEach(r => db.collection('inventory').add(r))
};
document.getElementById('exp').onclick = () => {
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 20 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '庫存');
  XLSX.writeFile(wb, '庫存匯出.xlsx', { compression: true });
};
</script>
```
（`cdn.sheetjs.com/xlsx-0.20.3` 這個網址本次不能連網，**未確認**是否存在；保守做法是把 master 的 `dist/xlsx.full.min.js` 下載放進你自己的 Firebase Hosting，但那是 0.18.12 舊版，有上述 CVE。）

### API／事件
- **用程式讀寫儲存格**：有，直接操作物件：`ws['B3'].v`、`ws['B3'] = {t:'n', v:5}`（改完記得更新 `ws['!ref']`），或 `XLSX.utils.sheet_add_aoa(ws, [[5]], {origin:'B3'})`（自動擴充範圍）。
- **監聽變更**：沒有（無狀態函式庫、沒有事件系統）。要監聽請由 UI 層（A 專案）或 Firestore `onSnapshot` 負責。

---

## 關鍵字
SheetJS、sheetjs、xlsx、js-xlsx、SheetJS CE、SheetJS Pro、社群版、付費版、網頁版 Excel、試算表、匯入 Excel、匯出 Excel、讀寫 xlsx、CSV、UTF-8 BOM、Big5、cp950、ODS、xls、xlsb、Numbers、sheet_to_json、json_to_sheet、aoa_to_sheet、table_to_sheet、sheet_to_html、writeFile、XLSX.read、SSF、數字格式、number format、民國年、合併儲存格、欄寬、autofilter、樣式不支援、cell style、公式不計算、formula evaluation、x-spreadsheet、xlsxspread、stox、xtos、Firestore、Firebase、純 JavaScript、Web Worker、Apache-2.0、npm 0.18.5、cdn.sheetjs.com、CVE-2023-30533、CVE-2024-22363、原型污染、ReDoS、XSS、倉儲、庫存匯出、比價表、成本計算
