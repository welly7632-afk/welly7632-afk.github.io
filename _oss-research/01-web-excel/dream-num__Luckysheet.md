# dream-num/Luckysheet — 已停止維護、但純 JavaScript 就能嵌入的「類 Excel」網頁試算表（Univer 的前身）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：5b3fe58
> GitHub：https://github.com/dream-num/Luckysheet｜⭐ 16630｜授權：MIT｜主要語言：JavaScript｜最近更新：2025-08-19

> 下文所有 permalink 都以 `https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/` 開頭（以下簡稱 `BASE/`），都是本次實際打開過的檔案。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Luckysheet 是中國「夢數科技」2020 年開源的線上試算表，用 jQuery + Canvas 畫格子、自己寫了一套 Excel 公式引擎（本次自己數：375 個函數定義、374 個有實作），功能面很廣（條件格式、篩選、排序、樞紐分析、圖表、資料驗證、凍結窗格、協作）。但 README 第一行就寫明「**不再維護，請改用 Univer**」（[BASE/README.md](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/README.md)）。

**對你（台灣小老闆、倉儲 App 用純 JS + Firebase）可以拿來做什麼：**

1. **最快速把「像 Excel 的表格」塞進你現有的倉儲網頁**：它不需要 React／Vue，載入兩支 JS + 四支 CSS，呼叫 `luckysheet.create({container:'xxx'})` 就有完整試算表（[docs/guide/README.md 第 129–174 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/README.md#L129-L174)）。你目前的技術棧（純 JS）跟它是同一路線，是所有網頁 Excel 專案中「接進你現有 App 門檻最低」的之一。
2. **做「進貨成本試算表／報價單／比價表」**：內建 SUMIFS、COUNTIFS、VLOOKUP、INDEX/MATCH、SUMPRODUCT、ROUND、TEXT 等常用函數；可以讓員工在網頁上像 Excel 一樣算毛利、運費、廣告 ROAS。
3. **把儲存格變更即時寫回 Firestore**：用 `hook.updated`／`hook.cellUpdated` 監聽變更，再用 `luckysheet.toJson()` 或 `transToCellData()` 轉成稀疏格式存進 Firestore（細節見第 11 節）。
4. **用 `=REMOTE("…")` 公式接 Claude**：原始碼裡有一個 `REMOTE` 函數，會把字串交給你自己寫的 `remoteFunction(字串, callback)`，非同步回填結果（[functionImplementation.js 第 27885–27918 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionImplementation.js#L27885-L27918)）。等於可以做出「在儲存格裡打 `=REMOTE("幫這個商品寫 30 字廣告文案:"&A2)` 就呼叫 Claude」的效果（要經過你自己的後端代理 API Key）。
5. **當作「自己做試算表」的教科書**：Canvas 只畫可視範圍、公式字串轉 JS 再執行、依賴圖 DFS 重算、Excel 數字格式（內嵌 SheetJS 的 SSF）、剪貼簿 HTML 解析——每一塊都有可讀的實作可以抄思路。

**不建議**：拿它當正式上線的核心系統（停止維護、無測試、公式用 `new Function` 執行、有安全疑慮，見第 9 節）。正式產品請評估同公司的 Univer（Apache-2.0）。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**（[BASE/LICENSE](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/LICENSE)，著作權人 Mengshukeji，2020-present）。
- **個人使用**：完全自由，可修改、可複製、可拿片段進你的倉儲 App。
- **公司商用**：可以，包括閉源商用、賣給客戶。唯一義務是**保留原始著作權聲明與 MIT 授權文字**（例如在你的 `THIRD_PARTY_LICENSES` 或「關於」頁面附上）。MIT 沒有專利授權條款、也不提供任何保證。
- **連帶的第三方授權**：打包後的 `plugin.js` 會一起包進 jQuery、jQuery UI、lodash、jStat、html2canvas、localforage、spectrum、clipboard.js 等（[gulpfile.js 第 95–109 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/gulpfile.js#L95-L109)），多數是 MIT；個別套件授權本次**未逐一確認**。數字格式模組是內嵌 SheetJS SSF 0.11.2（[format.js 第 6–8 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/format.js#L6-L8)，SSF 原專案為 Apache-2.0，商用時建議一併附上其聲明）。
- **付費版／閉源功能**：Luckysheet 本身沒有付費版，但 README 直接說「匯入、匯出、列印等進階功能請用 Univer」（[README.md](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/README.md) Plugins 段）。實際原始碼也證實：
  - **xlsx 匯出**外掛只是把 JSON POST 到你提供的伺服器網址，**開源版沒有在瀏覽器端產生 xlsx 的程式**（[expendPlugins/exportXlsx/plugin.js 第 28–60 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/expendPlugins/exportXlsx/plugin.js#L28-L60)）。
  - **列印外掛** `print.js` 是 0 行空檔（`wc -l` 結果為 0），等於沒有實作（[expendPlugins/print/plugin.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/expendPlugins/print/plugin.js)）。
  - 圖表外掛是一個**只有壓縮檔**的 `chartmix.umd.min.js`（約 352 KB，沒附原始碼），本次無法閱讀其原始碼。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 前端 | 原生 ES Module 原始碼 + **jQuery 2.2.4**（全域 `$`），Canvas 2D 繪圖；`dayjs`、`numeral`、`flatpickr`（日期選擇）、`pako`（gzip）、`escape-html`（[package.json](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/package.json)） |
| 圖表外掛 | 執行時從 **unpkg.com** 動態載入 Vue 2.6.11、Vuex 3.4.0、Element-UI 2.13.2、ECharts 4.8.0（[chart/plugin.js 第 25–36 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/expendPlugins/chart/plugin.js#L25-L36)）——離線環境會壞，也是第三方 CDN 依賴 |
| 打包 | gulp 4 + esbuild（IIFE，全域名稱 `luckysheet`）輸出 `dist/luckysheet.umd.js`（[gulpfile.js 第 218–231 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/gulpfile.js#L218-L231)） |
| 後端 | **不需要**。純前端即可運作。若要「載入／儲存／多人協作」，可設定 `loadUrl`、`updateUrl`（WebSocket），官方配套的是另一個 Java 專案 LuckysheetServer（README Ecosystem 段，本次未掃描） |
| 資料庫 | 本身不綁資料庫；你可自行存 JSON 到 Firestore／任何地方 |
| 部署 | 靜態檔案即可（Firebase Hosting、GitHub Pages 都行）；或用 jsDelivr CDN |
| 硬體／GPU | 無特殊需求，一般瀏覽器即可 |
| API Key／費用 | **0 元**。本身不呼叫任何付費 API。若你要接 Claude（透過 `REMOTE` 公式），費用依 Claude API 用量計 |
| 套件大小 | 本次沒有建置（規則禁止），所以 **dist 實際大小未確認**。自己量的原始資料：核心原始碼（不含 demoData、第三方 min 檔）104 個 JS 檔約 6.3 MB（未壓縮，含 4 種語系檔每個約 7000 行）；`src/plugins/js` 第三方 min 檔合計約 475 KB（`cat … | wc -c`）。另外 jQuery 會由 node_modules 打包進 `plugin.js` |

---

## 4. 程式架構地圖

```
Luckysheet/
├── README.md / README-zh.md   ← 首行「不再維護，改用 Univer」
├── LICENSE                     ← MIT
├── CHANGELOG.md                ← 只記到 v2.1.13（2021-01-19），之後的修改沒有寫進來
├── gulpfile.js                 ← 打包：esbuild 打 core，gulp concat 第三方插件與 CSS
├── package.json                ← v2.1.13；依賴 jquery 2.2.4、dayjs、numeral、pako…
├── docs/                       ← VuePress 文件（英文 guide/、簡中 zh/guide/）
│   └── guide/  api.md(2982 行，108 個 ### 標題) config.md(含 hook 說明) sheet.md(資料格式) cell.md(儲存格屬性)
└── src/
    ├── index.js                ← 進入點，module.exports = luckysheet
    ├── core.js                 ← luckysheet.create()：讀設定、初始化各模組、載入資料
    ├── config.js               ← 所有預設選項（container、lang、hook、plugins、loadUrl…）
    ├── store/index.js          ← 全域狀態 Store（flowdata、luckysheetfile、選取、undo/redo 堆疊）
    ├── global/                 ← 核心引擎
    │   ├── draw.js             ← Canvas 繪製：格子、欄列標題、文字溢出、合併儲存格
    │   ├── formula.js          ← 公式解析、依賴圖、重算（6211 行，最重要）
    │   ├── format.js           ← Excel 數字格式（內嵌 SheetJS SSF 0.11.2）
    │   ├── api.js              ← 109 個 export 的對外 API（getCellValue、setRangeValue、toJson…）
    │   ├── method.js           ← createHookFunction：hook 呼叫機制
    │   ├── getdata.js/setdata.js ← 讀寫儲存格的底層函數
    │   ├── dynamicArray.js     ← 動態陣列（溢出 spill）
    │   ├── rhchInit.js         ← 計算每列/每欄的累積像素位置（虛擬捲動基礎）
    │   ├── editor.js、refresh.js、scroll.js、sort.js …
    ├── function/
    │   ├── functionListDescriptor.js  ← 375 個函數的參數描述（名稱、參數數量、型別）
    │   ├── functionImplementation.js  ← 27921 行，每個函數的實作
    │   ├── functionlist.js            ← 合併描述+實作+自訂函數，掛到 window.luckysheet_function
    │   └── func.js、matrix_methods.js …
    ├── controllers/            ← 各功能的 UI 與邏輯（jQuery）
    │   ├── handler.js          ← 滑鼠/鍵盤/貼上 總事件處理（6431 行）
    │   ├── conditionformat.js、alternateformat.js（條件格式、交替顏色）
    │   ├── filter.js、orderBy.js（篩選、排序）
    │   ├── dataVerificationCtrl.js（資料驗證，下拉選單）
    │   ├── dropCell.js（拖拉填滿）
    │   ├── freezen.js（凍結窗格）
    │   ├── pivotTable.js（樞紐分析）、sparkline.js（走勢圖）
    │   ├── imageCtrl.js、postil.js（圖片、註解）
    │   ├── controlHistory.js（復原/重做）
    │   ├── server.js（WebSocket 協作、gzip 傳送）
    │   ├── protection.js（工作表保護）
    │   ├── mobile.js（觸控捲動）
    │   └── listener.js（用 Proxy 監聽 undo 堆疊觸發 updated hook）
    ├── expendPlugins/          ← 外掛：chart（只有壓縮檔）、exportXlsx（要伺服器）、print（空）
    ├── locale/                 ← en、zh（簡中）、zh_tw（繁中）、es
    ├── methods/get.js、set.js  ← 取得/設定內部狀態的輔助函數
    ├── demoData/               ← 示範資料；但 chat.js、getTargetData.js 被核心 import（見第 9 節）
    └── plugins/js/             ← 第三方壓縮檔（jquery-ui、lodash、jstat…）
```

規模（自己數）：檔案清單共 238 個檔案（`git ls-tree -r --name-only HEAD | wc -l`）；`src/` 下 JS 合計約 193,770 行（`wc -l src/*.js src/*/*.js`，含語系與示範資料）。

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 建立試算表 | [core.js 第 48–186 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/core.js#L48-L186) | `create(setting)` 把設定合併 `config.js` 預設值，存進 `Store` 與 `luckysheetConfigsetting`；`loadUrl` 為空就用 `setting.data`，否則 `$.post(loadUrl)` 取資料並用 `new Function("return "+d)` 解析（注意：等於執行伺服器回傳內容） |
| 初始化各模組 | [core.js 第 188–200 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/core.js#L188-L200) | 依序初始化 handler、篩選、工作表列、公式列、鍵盤、排序、縮放、監聽器 |
| 預設設定 | [config.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/config.js) | 預設 84 列 × 60 欄、`lang:'en'`、`plugins:[]`、`allowUpdate:false` 等 |
| Canvas 繪製 | [draw.js 第 384–510 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/draw.js#L384-L510) | `luckysheetDrawMain` 用 `luckysheet_searcharray(Store.visibledatarow, scrollHeight)` 找出畫面上第一列與最後一列，只畫可視範圍 |
| 可視列搜尋 | [sheetSearch.js 第 65–76 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/sheetSearch.js#L65-L76) | 長度 <40 或靠近兩端時線性搜尋，否則二分搜尋 |
| 列高累積表 | [rhchInit.js 第 5–40 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/rhchInit.js#L5-L40) | 每列計算累積像素位置存進 `Store.visibledatarow`；隱藏列不加高度；支援 `'auto'` 自動列高 |
| 資料轉換 | [sheetmanage.js 第 715–750 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/sheetmanage.js#L715-L750) | `buildGridData`：把稀疏 `celldata [{r,c,v}]` 展開成**完整二維陣列** `data[r][c]`（空格為 null） |
| 公式解析 | [formula.js 第 4037 行起](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L4037-L4080) | `functionParser` 手寫逐字元狀態機（括號、逗號、引號、比較運算子），把 `=SUM(A1:B2)*2` 轉成 `luckysheet_function.SUM.f(luckysheet_getcelldata('A1:B2'))*2` 這類 **JS 字串** |
| 公式執行 | [formula.js 第 5970–6050 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L5970-L6050) | `execfunction` 先檢查循環參照（引用到自己就報錯），再用 `new Function("return " + fp)()` 執行轉好的字串 |
| 依賴圖與重算 | [formula.js 第 5260–5330 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L5260-L5330)、[第 5760–5870 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L5760-L5870) | `execFunctionGroup` 從 `calcChain`（每個工作表記錄有公式的格子）建立頂點，找出受影響的公式，再 `functionDFS` 深度優先（白/灰/黑三色）依序重算 |
| calcChain 管理 | [formula.js 第 4380–4510 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L4380-L4510) | `addFunctionGroup`、`getAllFunctionGroup`、`insertUpdateFunctionGroup` 維護 `file.calcChain` |
| 跨工作表參照 | [formula.js 第 700–740 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L700-L740) | `getcellrange` 解析 `Sheet2!A1:B3`、`'工作表 名稱'!A1`，用名稱找到對應 sheet |
| 函數註冊 | [functionlist.js 第 8–33 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionlist.js#L8-L33) | 描述檔＋實作合併，再 push `customFunctions`，掛到 `window.luckysheet_function`（給 `new Function` 用） |
| 數字格式 | [format.js 第 6 行起](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/format.js#L6-L30) | 內嵌 SSF（SheetJS 的格式引擎），支援 `#,##0.00`、日期格式等 Excel 格式碼 |
| 貼上 | [handler.js 第 5931–5990 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/handler.js#L5931-L5990)、[第 6064–6330 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/handler.js#L6064-L6330) | 先讀 `text/html`；若是自己複製的就用內部資料；外部 HTML 表格則放進隱藏 div 用 jQuery 讀每個 `<td>` 的 CSS（粗體、顏色、對齊、框線、rowspan/colspan→合併）；貼圖片則插入圖片；否則讀純文字 |
| 復原／重做 | [controlHistory.js 第 62 行（redo）、第 447 行（undo）](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/controlHistory.js#L62) | 操作記錄存在 `Store.jfredo`／`Store.jfundo`，每種操作類型各自處理還原 |
| 變更監聽 | [listener.js 第 25–43 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/listener.js#L25-L43) | 用 Proxy 包住 `Store.jfredo`，有新操作就呼叫 `hook.updated`；外掛都載入完成時呼叫 `hook.workbookCreateAfter(toJson())` |
| Hook 機制 | [method.js 第 510–525 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/method.js#L510-L525) | `createHookFunction(name, ...args)`：呼叫 `options.hook[name]`，回傳 `false` 可阻止動作 |
| 協作 | [server.js 第 87–175 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/server.js#L87-L175)、[第 176–383 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/server.js#L176-L383) | `saveParam` 把每個操作包成 `{t:'v'|'rv'|'cg'|'all'|'fc'|'drc'|'arc'|'f'|'sha'…}`，`pako.gzip` 後走 WebSocket；收到別人的訊息由 `wsUpdateMsg` 套用到本地 |
| 條件格式 | [conditionformat.js 第 19 行起](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/conditionformat.js#L19) | 類型：`default`（大於/小於/介於/包含…）、`dataBar` 資料橫條、`colorGradation` 色階、`icons` 圖示集、`top10`、`duplicateValue`、`formula`（用 grep 數字串出現次數確認） |
| 資料驗證 | [dataVerificationCtrl.js 第 19–110 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/dataVerificationCtrl.js#L19-L110) | 類型：下拉 `dropdown`、核取方塊 `checkbox`、整數/小數、文字內容、日期等；還有中國身分證格式驗證（第 1676 行） |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| **整套嵌入**（不拆） | [docs/guide/README.md 第 129–174 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/README.md#L129-L174) | jQuery（已包在 plugin.js） | 低 | 直接用 CDN 引入，`luckysheet.create()`；用 hook 存 Firestore。適合你「先能用」 |
| **Excel 數字格式引擎（SSF）** | [src/global/format.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/format.js) | 只依賴 numeral 與少量內部函數 | 低 | 其實就是 SheetJS SSF 0.11.2；更建議直接用 npm 的 `ssf` 套件（同源、可單獨使用），用來把數字顯示成 `NT$#,##0`、日期格式 |
| **函數實作庫**（SUMIFS、財務函數、日期函數等） | [src/function/functionImplementation.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionImplementation.js) + [functionListDescriptor.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionListDescriptor.js) | 深度依賴 `formula`、`Store`、`window.luckysheetCurrentRow` 等全域；部分用 jStat、dayjs、numeral | 高 | 不建議整包搬；可以讓 Claude Code「參考某個函數的演算法」（例如 PMT、NETWORKDAYS、DATEDIF）改寫成純函數。正式公式引擎建議改用 HyperFormula（GPLv3／商業授權）或 Univer 的公式引擎 |
| **可視範圍搜尋＋累積列高**（虛擬捲動核心想法） | [sheetSearch.js 第 65–76 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/sheetSearch.js#L65-L76)、[rhchInit.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/rhchInit.js) | 只依賴 `Store` | 低 | 抄「累積高度陣列＋二分搜尋找可視列」的概念，用在你自己的倉儲清單（幾萬筆商品）虛擬捲動 |
| **Canvas 格子繪製** | [src/global/draw.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/draw.js) | `Store`、jQuery、格式、條件格式、走勢圖 | 高 | 適合當學習範本（文字溢出 `getCellOverflowMap`、合併儲存格繪製），不適合直接拆 |
| **外部 HTML 表格貼上解析**（Excel／Google 試算表貼上） | [handler.js 第 6064–6330 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/handler.js#L6064-L6330) | jQuery、`menuButton.getQKBorder` | 中 | 把「讀 `<td>` 的 style、rowspan/colspan」邏輯改寫成獨立函數，用在你的倉儲 App「從 Excel 貼上進貨單」。**務必改成 `DOMParser` 解析，不要 `.html()` 塞進頁面**（見第 9 節） |
| **REMOTE 非同步公式模式** | [functionImplementation.js 第 27885–27918 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionImplementation.js#L27885-L27918) | `remoteFunction` 設定 | 低 | 「公式先回 Loading…，callback 回來再寫值並重算」的模式，可直接用在「=AI 文案」「=查價」之類的儲存格函數 |
| **協作訊息格式**（操作型同步） | [server.js 第 87–175 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/server.js#L87-L175) | WebSocket、pako | 中 | 參考 `{t,i,v,r,c}` 這種精簡操作格式，改成寫進 Firestore 子集合＋`onSnapshot` 接收，就能做簡易多人同步（無衝突解決，需自行處理） |
| **條件格式規則資料結構** | [docs/guide/sheet.md](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/sheet.md)（`luckysheet_conditionformat_save` 第 677 行起） | 無 | 低 | 參考它的 JSON 規則設計（type、cellrange、format），套進你的庫存表做「低庫存變紅」 |
| **繁中語系字串** | [src/locale/zh_tw.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/locale/zh_tw.js) | 無 | 低 | 7022 行繁中 UI 與函數說明，可當作你自己試算表介面／函數說明的翻譯參考 |

---

## 7. AI／Claude 整合

- **沒有真正的 AI 整合**。原始碼裡雖然有 `ASK_AI` 與 `GET_AIRTABLE_DATA` 兩個函數（[functionImplementation.js 第 4709 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionImplementation.js#L4709-L4810)、[第 4808 行起](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionImplementation.js#L4808-L4900)），但實際讀過：
  - `ASK_AI` **沒有呼叫任何大型語言模型**，只是對寫死在 `demoData/getTargetData.js` 的保險業務示範資料做本地樞紐統計，再依提問文字是否含「10月／11月／12月」回傳預先準備好的表格（`askAIData`，[getTargetData.js 第 5383–5428 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/demoData/getTargetData.js#L5383-L5428)）。是行銷展示用的「假 AI」。
  - `GET_AIRTABLE_DATA` 會用 **寫死在原始碼裡、base64 編碼的 Airtable Token** 呼叫 `api.airtable.com`（[getTargetData.js 第 12–13 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/demoData/getTargetData.js#L12-L13)、[第 5430–5445 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/demoData/getTargetData.js#L5430-L5445)）。
  - 聊天浮窗 `initChat()` 只在 `crm.lashuju.com`、`localhost:3000` 這兩個網域啟用（[chat.js 第 339–350 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/demoData/chat.js#L339-L350)），它只是把你打的句子變成 `=ASK_AI("…")` 公式寫進儲存格（第 353–390 行）。
- **模型／prompt 位置**：無。**MCP／Skills**：無。
- **能不能換成 Claude？可以，而且很簡單**：用內建的 `REMOTE` 函數＋`remoteFunction` 設定（`customFunctions`、`remoteFunction` 這兩個設定在官方文件中沒有說明，是讀原始碼才發現：[core.js 第 120–121 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/core.js#L120-L121)）。範例：

```js
luckysheet.create({
  container: 'sheet',
  lang: 'zh_tw',
  // 儲存格輸入 =REMOTE("為這個商品寫 30 字蝦皮標題：藍芽耳機") 就會呼叫這裡
  remoteFunction: function (text, done) {
    // 呼叫你自己的 Firebase Cloud Function，由它帶 API Key 去呼叫 Claude；不要把 Key 放在前端
    fetch('/api/claude', { method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ prompt: text }) })
      .then(r => r.json()).then(j => done(j.text)).catch(() => done('#ERROR'));
  }
});
```

注意：`REMOTE` 回填後會觸發重算，若同一張表有很多 `REMOTE`，任何重算都可能再次呼叫 API（重算時是否重複呼叫，本次**未實測**），建議在後端加快取（以 prompt 雜湊為 key）。

---

## 8. 擴充方式與 API

1. **設定選項**：[config.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/config.js) 約 60 個選項，可隱藏工具列、自訂右鍵選單（`cellRightClickConfig`）、自訂工具列（`showtoolbarConfig`）、唯讀（`allowEdit:false`）、語言（`lang`）。
2. **Hook（事件）**：文件列出約 60 個 hook（[docs/guide/config.md 第 587–1160 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/config.md#L587-L1160)，標題寫「Hook Function (TODO)」），但我用 `grep -rhoE "createHookFunction\(['\"]…"` 數原始碼，**實際有被呼叫的只有 37 種**，例如 `cellEditBefore`、`cellUpdateBefore`、`cellUpdated`、`cellRenderBefore/After`、`cellAllRenderBefore`、`rangeSelect`、`rangePasteBefore`、`rangeDeleteBefore`、`rowInsertBefore`、`rowDeleteBefore`、`sheetCreate/Delete/Copy/Activate…`、`commentInsert/Update/Delete…`、`imageDeleteBefore/After`、`updated`、`workbookCreateAfter`、`scroll`、`cooperativeMessage`。文件上的 `rangeCopyBefore`、`rangeMoveAfter`、`sheetZoomBefore` 等**在原始碼找不到呼叫點**，別依賴。
3. **API**：[src/global/api.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/api.js) 共 109 個 `export function`（`grep -cE '^export (async )?function'`）。常用：
   - `getCellValue(r,c,{type:'v'|'m'|'f'})`（第 56 行）、`setCellValue(r,c,value)`（第 115 行）
   - `getRangeValue`（第 1807 行）、`setRangeValue(二維陣列)`（第 2836 行）、`getRangeJson`（第 2449 行，把選取區轉成物件陣列，適合匯出給程式用）
   - `setRangeFilter`、`setRangeMerge`、`setRangeSort`、`setRangeConditionalFormat`、`setDataVerification`、`insertImage`
   - `toJson()`（第 6719 行）、`transToCellData`／`transToData`（第 6677／6699 行）、`getAllSheets`、`undo`／`redo`、`refreshFormula`
4. **自訂函數**：`customFunctions` 陣列會被 push 進函數表（[functionlist.js 第 19–21 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionlist.js#L19-L21)），格式需同 `functionListDescriptor.js`（`n` 名稱、`t` 類別、`m` 參數數量、`p` 參數描述）＋`f` 實作函數。官方文件沒寫，屬於「能用但無文件」。
5. **外掛**：只有寫死的三個（chart／print／exportXlsx），沒有開放第三方外掛註冊機制（[expendPlugins.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/expendPlugins.js)）。

---

## 9. 程式品質與風險

- **維護狀況**：官方宣布停止維護、轉向 Univer（README 首行，連到 issue #1454）。最後一次 push 2025-08-19 是文件連結修改（`git log -1`：「docs: link」）。CHANGELOG 只寫到 v2.1.13（2021-01-19）。
- **測試**：檔案清單中**沒有任何測試檔**（`grep -iE 'test|spec'` 只命中 spectrum 套件的兩個檔名）。
- **資安風險（重要）**：
  1. **公式用 `new Function` 執行**：公式字串被轉成 JS 程式碼再執行（[formula.js 第 6039 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L6030-L6045)）。雖然解析器會改寫字串，但只要有繞過的寫法就可能變成 XSS。若表格內容可能來自他人（例如客戶上傳、多人協作），風險不可忽視。是否有已知繞過手法，本次**未確認**。
  2. **貼上外部 HTML 直接塞進 DOM**：`$("#luckysheet-copy-content").html(txtdata)`（[handler.js 第 6067–6068 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/handler.js#L6064-L6070)），剪貼簿 HTML 裡若有 `<img onerror=…>` 會被執行。
  3. **`loadUrl` 回應也用 `new Function` 解析**（[core.js 第 171 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/core.js#L163-L180)），伺服器回傳等於可執行程式碼。
  4. **示範程式被打包進正式版**：`functionImplementation.js` 第 20 行 import 了 `demoData/getTargetData.js`（約 371 KB 示範資料＋寫死的 Airtable Token），`core.js` 也 import `demoData/chat.js` 並每次 `create()` 都呼叫 `initChat()`（[core.js 第 185 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/core.js#L185)）。esbuild 從 `src/index.js` 打包時會一併包進去，所以 **dist 檔案很可能內含這組 Token 與示範資料**（依原始碼推斷，未建置驗證）。你自己 fork 時建議刪掉這兩個 import。
- **遙測／隱私**：在 `src` 中 grep `hm.baidu`、`google-analytics`、`gtag`、`analytics`、`sentry` 皆無命中；**未發現遙測**。但圖表外掛會從 unpkg.com 載入第三方程式碼（供應鏈風險、離線不能用）。
- **已知的坑**：
  - **全域狀態**：大量使用 `window.luckysheet_*`、`Store` 單例，一個頁面基本上只能放**一個**試算表實例（`create()` 開頭會先 `method.destroy()`）。
  - **效能**：資料以完整二維陣列存放，許多操作會 `editor.deepCopyFlowData` 深複製整張表（原始碼共 92 處呼叫），大表格會吃記憶體、卡頓。README 自己也說 Univer 解決了「大數據載入」問題。
  - **函數缺口**：沒有 XLOOKUP、IFS、SWITCH、TEXTJOIN、MAXIFS、LET、LAMBDA（逐一 grep 描述檔確認）。
  - `COMPOSESPLINES` 有描述檔但沒有實作（描述檔 375 vs 實作 374，`comm` 比對結果）。
  - `changLang()` API 只接受 `zh/en/es`（[api.js 第 6747 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/api.js#L6747-L6756)），但初始化時 `lang:'zh_tw'` 可以用（[locale.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/locale/locale.js) 有註冊 `zh_tw`）。
  - jQuery 2.2.4 本身已停止支援，有已知 CVE（屬一般知識，未在本 repo 驗證）。
  - `flatpickr` 只在 `lang === 'zh'` 時切中文（[core.js 第 143 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/core.js#L143-L147)），繁中模式下日期選擇器可能是英文（未實測）。

---

## 10. 跟其他專案組合的建議

- **短期（自己用、馬上有東西）**：Luckysheet（CDN 嵌入）＋ Firebase Firestore（用 `hook.updated` 節流後存 `celldata`）＋ Cloud Function 代理 Claude（`REMOTE` 公式）→ 做「商品成本／定價試算表＋AI 文案欄」。一個下午可完成雛形。
- **匯入 Excel**：配合同組織的 **Luckyexcel**（把 .xlsx 轉成 Luckysheet JSON，FAQ 有提，[docs/guide/FAQ.md 第 66–68 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/FAQ.md#L66-L68)；本次未掃描該 repo）。**匯出 Excel**：開源版需自己做，可用 ExcelJS 或 SheetJS 讀 `toJson()` 自行轉換（需自己寫對照）。
- **長期（正式產品）**：直接改用 **Univer**（同公司、Apache-2.0、TypeScript、官方持續維護、有公式引擎與協作）；Luckysheet 只當「理解原理」的參考。若只需要「表格＋公式」而不需要完整 Excel UI，可考慮 HyperFormula（公式引擎，GPLv3 或商業授權）＋輕量表格元件（如 Handsontable 社群版/Jspreadsheet CE，各自授權需查）。
- **A+B+C 拆法建議**：
  - A＝Luckysheet 的「外部 HTML 貼上解析」＋「REMOTE 非同步公式模式」想法
  - B＝SSF（`ssf` npm）做數字格式
  - C＝HyperFormula 或 Univer 公式引擎做計算
  - 再用你自己的 Canvas／DOM 表格或 Univer 呈現。

---

## 11. 網頁 Excel 能力檢查表

### 渲染方式、虛擬捲動、效能
- **渲染：Canvas 2D（有）**。主格子、欄列標題都是 Canvas（[draw.js 第 23–60、384–480 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/draw.js#L384-L480)，`getContext("2d")`）。編輯框、選取框、下拉選單等則是 DOM 疊在上面。
- **虛擬捲動：有**。只畫可視範圍（`luckysheet_searcharray` 找出起訖列/欄，[sheetSearch.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/sheetSearch.js#L65-L76)）。
- **10 萬列以上效能：未確認（推測偏弱）**。原因：資料存成完整二維陣列（`buildGridData` 會把每個格子都建出來，[sheetmanage.js 第 715–750 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/sheetmanage.js#L715-L750)）、`rhchInit` 每次逐列計算高度、許多操作深複製整張表。官方 README 自己承認大資料載入是 Univer 才解決的問題。

### 公式引擎
- **函數數量：375 個定義、374 個有實作（有）**。怎麼數：`grep -oE '"n": "[A-Z0-9_.]+"' src/function/functionListDescriptor.js | sort -u | wc -l` = 375；`grep -oE '^    "[A-Z0-9_.]+": function' src/function/functionImplementation.js | sort -u | wc -l` = 374；兩者 `comm` 比對，差異只有 `COMPOSESPLINES`（有描述無實作）。其中包含 12 個走勢圖函數（`*SPLINES`）、示範用的 `ASK_AI`、`GET_AIRTABLE_DATA`，以及 `REMOTE`、`EVALUATE` 等非 Excel 標準函數，所以**真正對應 Excel 的函數約 360 個**。依描述檔 `t` 欄位粗分（`functionlist.js` 註解定義 0 數學、1 統計、2 查找、6 日期、8 財務、9 工程、10 邏輯、12 文字、14 陣列…）：數學 58、統計 77、財務 44、文字 31、日期 25（＋1）、工程 23、查找 15、陣列 13（＋5）、資料庫函數（DSUM、DGET 等，t=17）12 等。
- **解析器：有（手寫）**。[formula.js `functionParser` 第 4037 行起](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L4037-L4080)，把公式轉成 JS 字串，再 `new Function` 執行（[第 6039 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L6030-L6045)）。
- **依賴圖／重算：有**。`calcChain`＋`execFunctionGroup`＋`functionDFS`（[第 5260 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L5260-L5330)、[第 5760–5870 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L5760-L5870)）。另有 `forceCalculation` 選項可強制全部重算（config 註解寫「公式多會有效能問題，慎用」）。
- **陣列公式：有（部分）**。有動態陣列溢出（[dynamicArray.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/dynamicArray.js)），也有 FILTER、UNIQUE、SORT、SEQUENCE 函數（grep 確認存在）。與 Excel 相容程度未確認。
- **跨工作表參照：有**。`Sheet2!A1`、`'名稱'!A1:B3`（[formula.js 第 700–740 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/formula.js#L700-L740)）。跨活頁簿（外部檔案）：沒有。
- **自訂函數：有（無文件）**。`customFunctions` 選項（[functionlist.js 第 19–21 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionlist.js#L19-L21)），以及非同步的 `REMOTE`＋`remoteFunction`（[functionImplementation.js 第 27885 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/function/functionImplementation.js#L27885-L27918)）。

### 編輯操作
- **儲存格編輯：有**（含富文字 `inlineString.js`、公式列 `formulaBar.js`）。
- **複製貼上：有；可從 Excel／Google 試算表貼上（含樣式）**。讀剪貼簿 `text/html`，解析 `<table>` 的字體、顏色、對齊、框線、合併（[handler.js 第 6064–6330 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/handler.js#L6064-L6330)）；沒有 HTML 時用純文字（Tab 分隔）。也能貼上圖片。數字格式/公式能否保留：未實測。
- **拖拉填滿：有**（[dropCell.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/dropCell.js)，2753 行，含數列/日期遞增邏輯）。
- **復原／重做：有**（[controlHistory.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/controlHistory.js#L62)；API `undo()`／`redo()`）。

### 格式
- **數字格式：有**（內嵌 SSF，[format.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/format.js#L6-L30)；儲存格 `ct:{fa:"#,##0.00", t:"n"}`）。
- **條件格式：有**（大小比較、資料橫條、色階、圖示集、前 10 名、重複值、公式，[conditionformat.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/conditionformat.js#L19)）；另有交替顏色（`alternateformat.js`）。
- **合併儲存格：有**（`config.merge`；API `setRangeMerge`，[api.js 第 3104 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/api.js#L3104)）。
- **凍結窗格：有**（[freezen.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/freezen.js#L15)；sheet 設定 `frozen`）。
- **欄寬列高：有**（`config.columnlen`／`config.rowlen`，可設 `'auto'` 自動列高，[rhchInit.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/rhchInit.js#L5-L40)）。
- **篩選：有**（[filter.js `createFilter` 第 140 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/filter.js#L140)）。
- **排序：有**（單欄/多欄，[sort.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/sort.js#L14)、[orderBy.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/orderBy.js#L25)）。
- **資料驗證（下拉選單）：有**（dropdown、checkbox、數字範圍、文字、日期…，[dataVerificationCtrl.js 第 19–110 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/dataVerificationCtrl.js#L19-L110)）。

### 圖表、樞紐分析、圖片
- **圖表：有，但只有壓縮檔且依賴 unpkg CDN**（Vue2＋ECharts 4，[chart/plugin.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/expendPlugins/chart/plugin.js#L25-L36)）。需 `plugins:['chart']`。README 承認圖表樣式問題是 Univer 才改善。
- **樞紐分析：有**（[pivotTable.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/pivotTable.js#L41)，3789 行）。
- **走勢圖（sparkline）：有**（12 個 `*SPLINES` 函數，`COMPOSESPLINES` 沒實作）。
- **圖片：有**（插入、貼上；圖片以 `FileReader.readAsDataURL` 轉 base64 存進 JSON，[imageCtrl.js 第 65–66 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/imageCtrl.js#L60-L70)）——存 Firestore 時要注意 1 MiB 文件上限，建議改存 Firebase Storage 只存網址。**附件：沒有**。註解（批註）：有（`postil.js`）。

### 匯入匯出
- **.xlsx 匯入：開源本體沒有**；要另用同組織的 Luckyexcel（FAQ 說明，本次未掃描）。
- **.xlsx 匯出：開源本體沒有（需自備伺服器）**。外掛把 `toJson()`＋圖表 base64 POST 到 `config.url`，等伺服器回 xlsx blob（[exportXlsx/plugin.js 第 28–60 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/expendPlugins/exportXlsx/plugin.js#L28-L60)）。伺服器端程式不在此 repo。保真度：未確認。
- **.csv：沒有專門功能**（`src` 內 grep `.csv` 只命中示範資料）。可自行用 `getRangeValue` 組 CSV。
- **列印：沒有**（`print.js` 為空檔）。

### 多人即時協作
- **有，但很陽春**。前端以 WebSocket 傳送 gzip 壓縮的「操作訊息」（[server.js 第 87–175、176–383 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/server.js#L87-L175)），收到他人操作直接套用；並顯示他人選取區（type 3）。**不是 OT 也不是 CRDT**，沒有看到衝突合併邏輯（以本次閱讀為準），本質是「後到覆蓋」。需要後端伺服器（官方 Java 版 LuckysheetServer，另一個 repo）。若改用 Firestore，需自行把 `saveParam` 改寫。

### 資料模型與存進 Firestore
- **有完整文件**（[docs/guide/sheet.md](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/sheet.md)、[docs/guide/cell.md](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/cell.md)）。一本活頁簿＝工作表陣列：

```json
[{
  "name": "庫存", "index": "s1", "status": 1, "order": 0,
  "row": 200, "column": 26,
  "celldata": [
    { "r": 0, "c": 0, "v": { "v": "品名", "m": "品名", "ct": {"fa": "General", "t": "g"}, "bl": 1, "bg": "#fff2cc" } },
    { "r": 1, "c": 1, "v": { "v": 120, "m": "120", "ct": {"fa": "#,##0", "t": "n"} } },
    { "r": 1, "c": 3, "v": { "f": "=B2*C2", "v": 3600, "m": "3,600" } }
  ],
  "config": { "merge": {}, "rowlen": {}, "columnlen": {"0": 160}, "borderInfo": [] },
  "calcChain": [], "frozen": {"type": "row"}
}]
```

  - `celldata`：稀疏 `{r,c,v}`（只在初始化用）；載入後內部轉成二維 `data[r][c]`（[sheet.md 第 130–162 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/sheet.md#L130-L162)）。
  - 儲存格屬性縮寫：`v` 原值、`m` 顯示值、`f` 公式、`ct` 格式、`bg` 背景、`fc` 字色、`bl` 粗體、`fs` 字級、`ht/vt` 對齊、`mc` 合併（[cell.md](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/cell.md)）。
- **存進 Firestore 的做法**：**不要存二維 `data`**——Firestore 不支援「陣列裡面再放陣列」。請用 `luckysheet.getAllSheets()`（它會深複製每張工作表並自動補上 `celldata`，[api.js 第 5908–5921 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/api.js#L5908-L5921)）或 `luckysheet.transToCellData(sheet.data)`（[api.js 第 6677 行](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/api.js#L6677-L6720)）取得 `celldata`，**存之前把 `data` 欄位刪掉**再存；工作表大時每張 sheet 一份文件，或把 celldata 切塊（每塊 < 1 MiB），圖片改存 Storage。載回時把 `celldata` 放回 `options.data[i].celldata`、刪掉 `data` 即可。

### 手機／觸控、繁中
- **手機／觸控：有（基本）**。`mobile.js` 232 行，處理觸控捲動與慣性（[mobile.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/controllers/mobile.js#L8-L40)）；雙指縮放、觸控選取的完整度未確認，工具列在手機上很擠。
- **繁體中文介面：有**（`lang: 'zh_tw'`，[locale.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/locale/locale.js)、[zh_tw.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/locale/zh_tw.js)，7022 行）。但 `ASK_AI`、`GET_AIRTABLE_DATA` 的函數說明只在 en/zh 有（grep 結果），且 `changLang()` 不接受 `zh_tw`。

### 嵌入純 JavaScript 網頁（不用 React／Vue）
- **可以（有）**。這是 Luckysheet 最大的優點。最小可用範例（版本號請釘死；`2.1.13` 取自 package.json，jsDelivr 上是否有此版本本次未連網確認）：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/css/pluginsCss.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/plugins.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/css/luckysheet.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/assets/iconfont/iconfont.css">
<script src="https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/plugins/js/plugin.js"></script>
<script src="https://cdn.jsdelivr.net/npm/luckysheet@2.1.13/dist/luckysheet.umd.js"></script>

<div id="sheet" style="position:absolute;inset:0"></div>
<script>
  let saveTimer;
  luckysheet.create({
    container: 'sheet', lang: 'zh_tw', title: '庫存成本表',
    showinfobar: false,
    data: [{ name: '庫存', index: 's1', status: 1, order: 0, celldata: [
      { r: 0, c: 0, v: { v: '品名' } }, { r: 0, c: 1, v: { v: '數量' } },
      { r: 0, c: 2, v: { v: '單價' } }, { r: 0, c: 3, v: { v: '小計' } },
      { r: 1, c: 0, v: { v: '藍芽耳機' } }, { r: 1, c: 1, v: { v: 30 } },
      { r: 1, c: 2, v: { v: 450 } }, { r: 1, c: 3, v: { f: '=B2*C2' } }
    ]}],
    hook: {
      updated: function () {                 // 任何操作後觸發（含 undo/redo）
        clearTimeout(saveTimer);
        saveTimer = setTimeout(function () {
          const sheets = luckysheet.getAllSheets().map(s => ({
            name: s.name, index: s.index, order: s.order,
            celldata: s.celldata,              // getAllSheets() 已自動把 data 轉成 celldata
            config: s.config || {}, calcChain: s.calcChain || []
          }));
          console.log('存到 Firestore：', sheets);  // 這裡換成 setDoc(...)
        }, 1500);
      }
    }
  });
</script>
```

- **套件大小：未確認**（本次未建置）。參考值：未壓縮核心原始碼約 6.3 MB（含四國語系），第三方 min 檔約 475 KB＋jQuery；實際 `luckysheet.umd.js` minify 後大小請自行在 CDN 查看。

### API／事件
- **監聽變更：有**。`hook.updated`（每次操作）、`hook.cellUpdated(r,c,oldValue,newValue,isRefresh)`、`hook.cellUpdateBefore`（回傳 false 可阻止）、`hook.rangeSelect` 等 37 種實際存在的 hook（見第 8 節）。
- **程式讀寫儲存格：有**。`luckysheet.getCellValue(r,c)`、`setCellValue(r,c,v)`、`setRangeValue([[...]])`、`getRangeJson()`（[api.js](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/src/global/api.js#L56-L120)），109 個 API 函數；官方 [docs/guide/api.md](https://github.com/dream-num/Luckysheet/blob/5b3fe58f5ad2aaa6a3cef15c6d567f5e10ea1f37/docs/guide/api.md) 有 108 個 `###` 條目說明。

---

## 關鍵字
Luckysheet、Univer、dream-num、夢數科技、網頁版 Excel、線上試算表、online spreadsheet、web Excel、Canvas 渲染、canvas rendering、jQuery、純 JavaScript 嵌入、vanilla JS、公式引擎、formula engine、calcChain、依賴圖、dependency graph、celldata、二維陣列、SSF、數字格式、條件格式、conditional formatting、資料驗證、下拉選單、data validation、凍結窗格、樞紐分析、pivot table、走勢圖、sparkline、複製貼上 Excel、clipboard HTML paste、REMOTE 公式、remoteFunction、customFunctions、自訂函數、hook、updated、Firestore、Firebase、WebSocket 協作、LuckysheetServer、Luckyexcel、xlsx 匯入匯出、MIT 授權、已停止維護、archived、new Function、XSS、Airtable、ASK_AI、繁體中文 zh_tw
