# ONLYOFFICE/DocumentServer — 自架版「線上 Office」：能完整開啟、編輯、多人協作 .xlsx 的網頁試算表伺服器
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：c4ad98d
> GitHub：https://github.com/ONLYOFFICE/DocumentServer｜⭐ 7088｜授權：AGPL-3.0（附 Section 7 額外條款：保留署名、修改標示、介面法律聲明、不授權商標）｜主要語言：Shell｜最近更新：2026-10-26

> 掃描範圍說明：`DocumentServer` 這個 repo 本身只是「組裝殼」——裡面只有 README、LICENSE、CHANGELOG、ROADMAP 和 8 個 Git 子模組指標（共 22 個檔案，用 `git ls-tree -r` 數的）。真正的程式碼在同組織的其他 repo。我另外 clone 了：
> - `ONLYOFFICE/server`：用子模組固定的 commit `f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0`
> - `ONLYOFFICE/sdkjs`：子模組固定的 commit `6423d2d` 無法從 GitHub 取得（`not our ref`），改用 master `9d2138866d929be32f1d107e8b5bfae36156e097`
> - `ONLYOFFICE/web-apps`：子模組固定的 commit `848568f` 同樣取不到，改用 master `f79972a400c3a696490094961772d1f86fac1b82`
>
> 下面引用 sdkjs／web-apps 的 permalink 都是指向這兩個 master commit，跟 DocumentServer 釘選的版本可能有幾天的差距。`core`（C++ 轉檔器）沒有 clone，相關說法會標「未確認」。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：ONLYOFFICE Docs（以前叫 Document Server）是一套「自己架在伺服器上的 Google 試算表／Office 365」，瀏覽器裡開的就是幾乎 1:1 的 Excel 介面，直接讀寫真正的 `.xlsx`，支援多人同時編輯。

**對你（台灣小老闆、自己用 Claude 寫倉儲網頁、跑廣告）來說，實際能做的事：**

1. **在你的倉儲系統裡嵌一個「真的 Excel」**：庫存表、進貨成本表、廣告花費表，存在你自己的 Firebase Storage，用一個 `<div>` + `api.js` 就能在網頁打開編輯，不用再把檔案下載到電腦開 Excel 再上傳。
2. **報價／成本計算**：它的公式引擎有 483 個已實作函數（我自己數的，方法見第 11 節），`VLOOKUP`、`XLOOKUP`、`SUMIFS`、`FILTER`、`UNIQUE`、`SORT`、`TEXTSPLIT` 都有，還有樞紐分析、條件格式、資料驗證下拉選單。你現有的 Excel 報價單／成本試算檔幾乎可以原封不動丟上去用。
3. **跟同事或代工廠一起改同一份表**：多人即時協作（類似 Google 試算表），有留言、版本歷史。
4. **把 Excel 當「表單前端」**：用外掛（plugin）或巨集（macro，JavaScript 寫）讀寫儲存格，例如按一個按鈕就把庫存表某一欄寫回你的 Firestore。
5. **轉檔服務**：伺服器有 `/converter` API，可以把 `.xlsx` ↔ `.csv`、`.pdf`、`.ods` 等互轉，可以拿來「每天把庫存 Excel 自動匯出成 PDF 寄給老闆」。
6. **AI**：編輯器內建 AI 外掛，伺服器端有一個 AI 代理（`/ai-proxy`），程式碼裡**明確支援 Anthropic（Claude）的 `x-api-key` 標頭**，可以把 Claude 接進試算表裡用（細節見第 7 節）。

**不適合的地方（先講清楚）**：它不是一個「可以拆開來 import 的 JavaScript 表格元件」。它是一整套伺服器（Node.js + C++ 轉檔器 + 前端靜態檔），必須用 Docker 或 Linux 套件安裝在一台 VPS／主機上，**沒辦法直接放在 Firebase Hosting 上跑**。如果你要的是「在自己頁面裡畫一個小表格、資料存 Firestore」，Univer／Luckysheet／Handsontable 類的元件會比較輕；ONLYOFFICE 強在「要跟真正的 Excel 檔 100% 相容」。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

### 2.1 授權本體：AGPL-3.0 + 額外條款
- [LICENSE](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/LICENSE) 前段是標準 GNU AGPL v3 全文，後段（[#L664-L728](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/LICENSE#L664-L728)）依 AGPL 第 7 條加了 5 條「Additional Terms」：
  1. 必須保留所有版權、授權、署名聲明。
  2. **修改過的版本必須明顯標示「已修改」、修改日期，並註明是基於 Ascensio System SIA 的 ONLYOFFICE。**
  3. **有互動式介面的話，必須在介面上明顯可見的地方顯示法律聲明**，讓使用者知道原開發者是 ONLYOFFICE、版本可能已修改、怎麼查授權。
  4. **不授權商標**：不能用 ONLYOFFICE 的名稱、logo、品牌（[#L703-L709](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/LICENSE#L703-L709)）。
  5. 圖示、插圖、文件文字等「非程式碼」內容是 CC BY-SA 4.0。
- server／sdkjs／web-apps 每個原始檔開頭都是同樣的版權宣告，標 `SPDX-License-Identifier: AGPL-3.0-only`（例：[server/Common/sources/license.js#L1-L34](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/license.js#L1-L34)）。

### 2.2 個人使用
- **完全免費、可以自由安裝在自己的主機上使用**，不用登記、不用付錢。只是自己用、沒有修改程式碼的話，AGPL 幾乎沒有義務。

### 2.3 公司商用要注意什麼
- **「不改程式、只是架起來給員工用」**：可以。社群版（Community Edition）README 寫「Perfect for small teams and personal use」，建議人數「up to 20」（[Readme.md#L79](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L79)）。
- **「改了 ONLYOFFICE 的程式碼，然後讓別人透過網路使用」**：這就是 AGPL 的重點——**透過網路提供服務也算「散布」，必須把你修改後的完整原始碼公開給使用者**，而且要遵守上面的「修改標示」「介面法律聲明」。
- **「只是用 `api.js` 把編輯器嵌進我自己的倉儲網頁」**：你的網頁是透過 iframe + `postMessage` 跟 ONLYOFFICE 溝通（見第 5 節），一般看法是你自己的網頁程式碼不會因此被 AGPL 感染，但這是法律解讀，不是程式碼能證明的 → **未確認，若要對外營利服務請另詢律師或直接買商業版**。
- **把 sdkjs 的公式引擎、JSON 轉換器等程式碼「抄出來」放進你自己的產品**：那段程式碼仍是 AGPL，你的產品整體很可能要以 AGPL 開源。**拆零件給自己用沒問題；要做成商品賣給別人，AGPL 程式碼不要直接搬。**
- **不能把 ONLYOFFICE 改名或去 logo 當自己的產品賣**：白牌（White label）只在付費的 Developer Edition（[Readme.md#L95](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L95)）。

### 2.4 付費版才有的功能（依 README 表格，[Readme.md#L63-L160](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L63-L160)）
| 功能 | 社群版 | Enterprise | Developer |
|---|---|---|---|
| 叢集（Clusterization） | ✗ | ✓ | ✓ |
| 手機網頁版編輯器（Mobile web editors） | ✗ | ✓（需 DMS 支援） | ✓ |
| Document Builder Service | ✗ | ✗ | ✓ |
| Automation API（從外部頁面用程式控制編輯器） | ✗ | ✗ | ✓ |
| 白牌 | ✗ | ✗ | ✓ |
| Admin Panel | ✗ | ✓ | ✓ |
| 試算表功能（公式、樞紐、資料驗證、條件格式、走勢圖、規劃求解） | ✓ | ✓ | ✓ |

**程式碼層面的證據（這次掃描發現的重點）**：
- 開源版 server 的授權檢查是寫死的「社群版」：[`license.js` 的 `readLicense()`](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/license.js#L43-L71) 直接回傳 `packageType: PACKAGE_TYPE_OS`、`connections: LICENSE_CONNECTIONS_OS`、`customization: false`、`advancedApi: false`、`multitenancy: false`。
- 而 `LICENSE_CONNECTIONS_OS = 0x7fffffff`（[constants.js#L95-L98](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/constants.js#L95-L98)），也就是**這版開源程式碼裡沒有「同時 20 個連線」的硬限制**（舊版是 20）；「20 人」現在只是 README 的建議值。官方打包好的 Docker／deb 是否另有限制 → 未確認。
- **資料庫、Redis、RabbitMQ 連接器在這版開源 server 中被換成「記憶體版」**：[`baseConnector.js#L37`](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/databaseConnectors/baseConnector.js#L37) 只有一行 `module.exports = require('./memoryConnector');`；[`pubsubRabbitMQ.js#L37`](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/pubsubRabbitMQ.js#L37) 直接指向 `pubsubMemory`；`taskqueueRabbitMQ.js` 指向 `taskqueueMemory`；`editorDataStorage` 引用的 `editorDataRedis.js` 在 repo 中不存在（用 `ls-tree` 查過檔案清單）。雖然 `default.json` 還保留 `"sql": {"type": "postgres", ...}` 設定、`package.json` 還有 `pg`、`mysql2` 依賴，**開源 server 實際上是單機、狀態放記憶體**。這和 [ROADMAP.md#L8-L12](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/ROADMAP.md#L8-L12) 10.0 版寫的 “Server: Paid package only in Enterprise Edition and Developer Edition versions” 方向一致。
  - **白話**：個人用、單台主機，沒差；但伺服器重開機時，正在編輯中的變更要靠關機流程寫回（CHANGELOG 有提到「changes are restored to forgotten when the server shuts down」，[CHANGELOG.md#L155-L162](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L155-L162)），**當機時未存檔的協作變更可能遺失**。官方 Docker 映像是否仍含 PostgreSQL 版連接器 → 未確認。

---

## 3. 技術棧與執行需求

| 層 | 技術 | 證據 |
|---|---|---|
| 前端 UI | Backbone.js + jQuery + RequireJS + Less（不是 React／Vue） | [server/license/](https://github.com/ONLYOFFICE/server/tree/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/license) 裡列 Backbone、Bootstrap、jQuery、RequireJS、less、Underscore 的授權；web-apps 的 `vendor/` 目錄 |
| 編輯器核心 | 純 JavaScript（sdkjs），**Canvas 繪圖**；建置方式是「把幾百個 .js 串接起來」，不用編譯器 | [sdkjs/build/build.py 第 1 行說明](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/build/build.py)：“concatenation only, no compiler”；[configs/cell.json](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/configs/cell.json) 列出試算表 SDK 要串的 38＋376 個檔案 |
| 後端 | Node.js ≥ 20、Express 4、socket.io 4、jsonwebtoken | [DocService/package.json](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/package.json) |
| 轉檔 | C++ `x2t`（在 `ONLYOFFICE/core`），server 的 FileConverter 只是包裝 | server [Readme.md](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Readme.md)「FileConverter — wrapper around the document conversion binary」；core 未 clone → 細節未確認 |
| 資料庫 | 設定檔仍寫 PostgreSQL／Redis／RabbitMQ，但開源程式碼實際用記憶體版（見 2.4） | [default.json#L380-L392](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L380-L392) |
| 檔案儲存 | 本機檔案系統、S3、Azure Blob | [Common/sources/storage/](https://github.com/ONLYOFFICE/server/tree/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/storage) 有 `storage-fs.js`、`storage-s3.js`、`storage-az.js` |
| 部署 | 官方建議 Docker（`ONLYOFFICE/Docker-DocumentServer`），或 Linux deb/rpm、Windows 安裝檔 | [Readme.md#L161-L170](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L161-L170)；deb/rpm 預設埠改成 8083（[CHANGELOG.md#L178](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L178)） |

**硬體**：repo 內沒有寫硬體需求 → 未確認。依架構推估：Node 服務＋C++ 轉檔器＋大量字型，一般 VPS 至少要給 2 核心、4 GB RAM 以上比較保險（這是推估，不是 repo 寫的）。**不需要 GPU。**

**API Key 與費用**：
- 編輯器本身：**不需要任何 API Key、免費**。
- 必要的是你自己訂的一組 **JWT secret**（10.0 起預設啟用 JWT，[default.json#L476-L505](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L476-L505)，預設值是 `developer-only-not-a-real-secret`，**一定要改**）。
- AI 功能：要自己填 Claude／OpenAI 等的 API Key，費用依各家計價。
- 主機費：台灣常見 VPS（2C4G）每月約新台幣幾百到一千多元（市場行情推估，非 repo 資料）。

---

## 4. 程式架構地圖

### 4.1 DocumentServer（本 repo，只是殼）
```
DocumentServer/                     ← 22 個檔案，全是說明和子模組指標
├── Readme.md          版本比較表（社群／企業／開發者版）、安裝連結
├── LICENSE            AGPL-3.0 全文 + 5 條 Additional Terms
├── CHANGELOG.md       8,801 行，每版功能／修正／資安修補（10.0.0 在最上面）
├── ROADMAP.md         959 行，各版規劃
├── .gitmodules        8 個主要子模組 + 10 個 sdkjs 外掛子模組
├── .mrconfig          用 `mr` 工具一次 clone 全部 repo 的設定（含 Docker-DocumentServer、document-server-integration 等）
├── mr-update.sh       對所有子模組 checkout develop/master 並 pull
├── core/              → ONLYOFFICE/core（C++：x2t 轉檔、字型、PDF 渲染）
├── core-fonts/        → 內建開源字型
├── dictionaries/      → 拼字檢查字典
├── document-formats/  → 支援格式的中繼資料 JSON
├── document-templates/→ 新檔空白範本
├── sdkjs/             → ★ 編輯器核心（試算表在 cell/）
├── server/            → ★ Node.js 後端（協作、轉檔排程、JWT、AI 代理）
└── web-apps/          → ★ 編輯器 UI（工具列、對話框、語系檔）＋ api.js 嵌入介面
```
連結：[.gitmodules](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/.gitmodules)、[.mrconfig](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/.mrconfig)

### 4.2 sdkjs/cell（試算表核心，共 74 個檔案、約 32.8 萬行 JS，用 `find cell -name "*.js" | xargs cat | wc -l` 數）
```
cell/
├── api.js                (10,811 行) 編輯器對 UI 的 API：spreadsheet_api
├── apiBuilder.js         (33,523 行) 「Office JS API」：Api／ApiWorksheet／ApiRange…，巨集與外掛都用它
├── api_plugins.js        外掛專用方法（pluginMethod_*）
├── plugin-events.js      外掛事件（onChangeCurrentSheet 等）
├── fromToJSON.js         (11,205 行) ★ 活頁簿 ↔ JSON 互轉
├── model/
│   ├── Workbook.js       (27,399 行) Workbook／Worksheet／Cell／Range、DependencyGraph（重算）
│   ├── WorkbookElems.js  (22,821 行) 樣式、欄列、自訂函數引擎 CCustomFunctionEngine
│   ├── FormulaObjects/   ★ 公式引擎：parserFormula.js（14,576 行）+ 13 個函數分類檔
│   ├── Serialize.js      (16,661 行) 內部二進位格式（XLSY）讀寫
│   ├── clipboard.js      複製貼上（含從 Excel／Word／HTML 貼上）
│   ├── History.js / UndoRedo.js  復原重做
│   ├── CollaborativeEditing.js   協作（鎖定＋變更同步）
│   ├── ConditionalFormatting.js / DataValidation.js / autofilters.js / PivotTables.js / Slicer.js
│   ├── whatIfAnalysis.js 規劃求解／假設分析
│   └── CellStyleStorage/ 樣式與資料分開儲存（10.0 的效能改善）
├── view/
│   ├── WorkbookView.js   (8,150 行) 建立 4 層 canvas
│   ├── WorksheetView.js  (31,933 行) ★ 格線、儲存格繪製、捲動、凍結窗格、填滿把手
│   ├── CellEditorView.js 儲存格內編輯器
│   └── mobileTouch.js    觸控
└── graphics/DrawingContext.js  Canvas 2D 包裝
```

### 4.3 server（Node.js 後端）
```
server/
├── DocService/sources/
│   ├── server.js         Express 路由總表
│   ├── DocsCoServer.js   (5,034 行) ★ socket.io 協作核心：auth、getLock、saveChanges、callback
│   ├── canvasservice.js  開檔、存檔、下載
│   ├── converterservice.js / convertFromFile.js  轉檔 API
│   ├── jwtService.js     JWT 驗證
│   ├── ai/aiProxyHandler.js ★ AI 代理（藏 API Key、支援 Anthropic）
│   └── wopiClient.js     WOPI 協定（給 Nextcloud 等整合）
├── Common/config/default.json  全部預設設定（645 行）
├── Common/sources/license.js   社群版授權（寫死）
├── FileConverter/        包裝 C++ x2t
└── tests/                61 個測試檔（Jest）
```

### 4.4 web-apps（UI）
```
web-apps/apps/
├── api/documents/api.js       ★ 嵌入用的唯一入口：new DocsAPI.DocEditor(...)
├── spreadsheeteditor/main/    桌面版試算表 UI（13,707 個檔案，多為圖示）
│   ├── app/controller/        Main.js、Toolbar.js、DataTab.js、PivotTable.js、FormulaDialog.js…
│   └── locale/zh-tw.json      繁體中文介面
├── spreadsheeteditor/mobile/  手機版 UI（README 說社群版不提供）
└── common/locale.js           語系載入邏輯
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| **嵌入編輯器** | [web-apps api.js#L402-L440](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L402-L440) | `DocsAPI.DocEditor(placeholderId, config)` 會把 `<div>` 換成 iframe，載入 `spreadsheeteditor/main/index.html`；`events` 裡有註冊哪些回呼，就自動打開對應功能（例如有 `onRequestHistory` 才顯示版本歷史）。 |
| 設定格式說明 | [api.js#L36-L398](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L36-L398) | 原始碼開頭有一大段註解列出完整 config：`document.url/key/fileType/permissions`、`editorConfig.mode/lang/callbackUrl/user/customization/coEditing`、所有 `events`。 |
| 外部可呼叫的方法 | [api.js#L930-L963](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L930-L963) | `downloadAs`、`insertImage`、`refreshHistory`、`destroyEditor`、`requestClose`、`refreshFile`、`openDocument`… **沒有「讀寫儲存格」的方法**，也沒有 `createConnector`（那是 Developer 版的 Automation API）。 |
| 開檔流程 | [server.js#L279-L358](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/server.js#L279-L358) | DocumentServer 從 `document.url` 下載檔案 → C++ x2t 轉成內部二進位 → 瀏覽器用 sdkjs 讀入。所以**你的檔案 URL 必須讓 DocumentServer 主機下載得到**。 |
| 多人協作通道 | [DocsCoServer.js#L2052-L2080](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L2052-L2080) | socket.io 訊息類型：`auth`、`message`（聊天）、`cursor`、`getLock`、`saveChanges`、`isSaveLock`… |
| 試算表鎖定 | [DocsCoServer.js#L3638-L3685](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L3638-L3685) | `getLock` 依編輯器類型選 `_checkLockExcel`；把鎖放進 `editorData.addLocksNX`，衝突就退回。**是「鎖定 + 變更廣播」模式，不是 CRDT。** |
| 存檔回呼（callback） | [DocsCoServer.js#L241-L250](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L241-L250) | 回呼狀態碼：0 NotFound、1 Editing、2 MustSave、3 Corrupted、4 Closed、6 MustSaveForce、7 CorruptedForce。**收到 2 或 6 時，從 body 的 `url` 下載新檔存回你的儲存空間**。 |
| 轉檔 API | [server.js#L283-L286](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/server.js#L283-L286) | `POST /converter`（JSON）、`POST /converter/from-file`（直接上傳，10.0 新增）。 |
| 4 層 Canvas | [WorkbookView.js#L410-L430](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorkbookView.js#L410-L430) | `ws-canvas`（儲存格）、`ws-canvas-overlay`（選取框）、`ws-canvas-graphic`（圖表圖片）、`ws-canvas-graphic-overlay`，各包成 `DrawingContext`。 |
| 公式解析 | [parserFormula.js#L8564](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L8564) | `parserFormula.prototype.parse`：自寫的手寫解析器（無外部依賴），轉成運算元陣列；`calculate` 在 [#L10621](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L10621)。 |
| 依賴圖／重算 | [Workbook.js#L624-L655](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L624-L655) | `DependencyGraph`：`sheetListeners` 記錄「誰在監聽哪些儲存格／範圍」，`volatileListeners` 給 `NOW()`、`RAND()`；`calcTree`（[#L1676](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L1676)）→ `_calculateDirty`（[#L2098](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L2098)）只重算髒掉的格子。 |
| 活頁簿 ↔ JSON | [fromToJSON.js#L169-L220](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/fromToJSON.js#L169-L220)、[#L2642-L2755](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/fromToJSON.js#L2642-L2755) | `WriterToJSON.SerWorksheet` 輸出每張表的 cols、mergeCells、sheetData、conditionalFormatting、dataValidations、pivotTables…；`ReaderFromJSON.WorksheetFromJSON` 反向讀入。 |
| AI 代理 | [aiProxyHandler.js#L236-L287](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/ai/aiProxyHandler.js#L236-L287) | 瀏覽器只拿到 `********` 佔位符，伺服器轉送時才換成真 Key；網址含 `anthropic.com` 就放 `x-api-key` 標頭。 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

> 提醒：以下都是 AGPL-3.0-only。**自己內部用沒問題；要做成對外產品，拆出來的部分會把 AGPL 義務帶進你的程式**。

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| **整套編輯器（不拆，用 iframe 嵌）** | [web-apps/apps/api/documents/api.js](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js) | 一台跑 DocumentServer 的主機 | **低** | 倉儲網頁放一個 `<div>` + `<script src=".../api.js">`，檔案放 Firebase Storage，callback 用 Cloud Function 接。**最推薦的用法。** |
| 存檔回呼協定 | [DocsCoServer.js#L241-L250](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L241-L250) | 無 | 低 | 只要照狀態碼寫一個 HTTP endpoint（回 `{"error":0}`），你的後端完全不用碰 AGPL 程式碼。 |
| 轉檔 API（xlsx↔csv↔pdf） | [server.js#L283-L286](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/server.js#L283-L286) | DocumentServer 主機 | 低 | 從 Cloud Function 呼叫 `POST /converter`（帶 JWT），當成「Excel 轉 PDF 報價單」服務。 |
| AI 代理的「藏 Key」設計 | [aiProxyHandler.js#L236-L316](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/ai/aiProxyHandler.js#L236-L316) | Node.js | 低（參考思路） | 你自己的 Claude 代理也可以照這招：前端只送佔位符，後端換真 Key，並用 `isUnderProviderBase` 白名單限制轉送目標。**看懂後自己重寫，不必複製程式碼。** |
| 函數清單與分類 | [cell/model/FormulaObjects/](https://github.com/ONLYOFFICE/sdkjs/tree/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects) | 整個 sdkjs 的 `AscCommonExcel` 全域物件 | **高** | 單一函數（例如 `cXLOOKUP`，[lookupandreferenceFunctions.js#L5019](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/lookupandreferenceFunctions.js#L5019)）依賴 `cBaseFunction`、`cArea`、`cRef` 等型別，**拿來當「Excel 行為規格參考」比直接搬好**。 |
| 依賴圖／重算演算法 | [Workbook.js#L624-L1700](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L624-L1700) | Workbook、Range、parserFormula | 高 | 參考它「單格 cellMap ＋範圍 areaMap ＋ volatile 清單」三種監聽結構，自己寫輕量版。 |
| JSON 資料模型 | [fromToJSON.js#L2642-L2755](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/fromToJSON.js#L2642-L2755) | sdkjs 內部模型 | 中 | 欄位命名直接沿用 OOXML（`r`、`s`、`t`、`v`、`f`），可當你 Firestore 文件結構的設計參考（見第 11 節範例）。 |
| Office JS 風格 API（巨集／外掛） | [apiBuilder.js#L9709](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L9709)、[#L11472-L11580](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L11472-L11580) | 在編輯器內執行 | 低（在編輯器內用） | `Api.GetActiveSheet().GetRange("A1").SetValue(...)`；寫成外掛就能在試算表裡加「同步到 Firestore」按鈕。 |
| 繁中介面字串 | [zh-tw.json](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/spreadsheeteditor/main/locale/zh-tw.json) | 無 | 低 | 試算表常用術語的繁中翻譯（例：`Common.define.conditionalData.textGreater` → 「大於」），自己做表格元件時可當用詞表。注意非程式碼內容授權。 |

---

## 7. AI／Claude 整合

- **有內建 AI 外掛**：CHANGELOG 9.0.x 寫「Added AI, … plugins to the server version distribution」（[CHANGELOG.md#L1765-L1767](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L1765-L1767)）；9.1 加了「AI 依描述產生巨集、VBA 轉 JavaScript」（[#L2021-L2022](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L2021-L2022)）；可在 `/info` 頁設定 AI 模型與金鑰（[#L2090-L2091](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L2090-L2091)）。
- **10.0 的 ROADMAP**：AI 外掛支援試算表內容、**支援 MCP 與網路搜尋**（[ROADMAP.md#L14-L22](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/ROADMAP.md#L14-L22)）。9.x ROADMAP 也寫「AI functions for the Spreadsheet Editor」（[#L159](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/ROADMAP.md#L159)）。
- **伺服器端代理已經看得到 MCP 與 Claude**：[`getAiProxyTargets`](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/ai/aiProxyHandler.js#L290-L316) 會收集 `providers`、`pluginSettings.profiles[].baseUrl`、`webSearch.baseUrl`、`mcpServers[].url` 作為允許轉送的目標；`insertKeyToProvider`（[#L236-L287](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/ai/aiProxyHandler.js#L236-L287)）對 `anthropic.com` 用 `x-api-key`、Gemini 用 `?key=`、其他（OpenAI、DeepSeek、Groq、xAI、Mistral…）用 Bearer。
- 設定入口：[default.json#L12-L22](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L12-L22) 的 `aiSettings`（預設 `enable: true`，`providers: {}` 空的，`allowedCorsOrigins` 允許 `onlyoffice.github.io` 外掛網域）；前端可用 `editorConfig.customization.ai.disabled = true` 關掉（[api.js 對應程式](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L435-L442)）。
- **Prompt 放在哪**：AI 外掛本體在另一個 repo（`ONLYOFFICE/onlyoffice.github.io` 的外掛），本次沒 clone → prompt 內容**未確認**。外掛 GUID 是 `asc.{9DC93CDB-B576-4F0C-B55E-FCC9C48DD007}`。
- **能不能換成 Claude**：**可接**。在 AI 外掛設定裡新增 Anthropic 供應商、填 Claude API Key 即可；伺服器代理已處理 Anthropic 的標頭格式。
- **給你的實用玩法**：
  1. 在試算表裡選一欄商品名，讓 Claude 產生廣告文案／短影音腳本草稿，直接寫在旁邊欄位。
  2. 用「AI 產生巨集」叫它寫「把 B 欄成本 × 1.3 寫到 C 欄、低於安全庫存標紅」的 JavaScript 巨集。
  3. 若要更深度整合，可以自己寫外掛，在外掛裡呼叫你自己的 Claude 代理（例如 Firebase Function），再用 `Api.GetActiveSheet().GetRange(...).SetValue()` 寫回。

---

## 8. 擴充方式與 API

1. **Docs API（嵌入）**：`DocsAPI.DocEditor` 的 config ＋ events ＋ 方法（第 5 節）。事件中跟試算表最相關的：`onDocumentReady`、`onDocumentStateChange`（有沒有未存變更）、`onRequestSaveAs`、`onRequestInsertImage`、`onRequestReferenceData`（外部連結資料更新）、`onError`。
2. **Callback API**：DocumentServer 在使用者關閉／強制存檔時 POST 到你的 `callbackUrl`（狀態碼見第 5 節）。
3. **Command Service**：`POST /command`（[server.js#L281](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/server.js#L281)），例如強制存檔、踢人、查版本。
4. **Conversion API**：`POST /converter`、`/converter/from-file`。
5. **外掛（Plugins）**：HTML + JS，在編輯器內的 iframe 執行，可呼叫 `Api.*`。10.0 新增全域 `Editor` 物件，方法回傳 Promise（`await Editor.GetSelectedText()`，[CHANGELOG.md#L189-L198](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L189-L198)）。外掛事件定義在 [plugin-events.js](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/plugin-events.js)。
6. **巨集（Macros）**：在編輯器內寫 JavaScript，使用同一套 `Api`。可以 `Api.AddCustomFunction` 註冊自訂公式函數（[apiBuilder.js#L856](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L856)）。
7. **Office JS API 規模**：`apiBuilder.js` 裡符合 `Api*.prototype.X = function` 或 `Api.X = function` 的定義共 **1,068 個**（用 `grep -c` 數，含少數內部方法）。
8. **WOPI**：可以被 Nextcloud、ownCloud、Seafile、Odoo 等整合（`/hosting/discovery`）。
9. **Automation API（`createConnector`，從你自己的頁面直接操作編輯器）**：開源 `api.js` 回傳的方法清單裡**沒有**，README 標示只有 Developer Edition。

---

## 9. 程式品質與風險

- **維護狀況：非常活躍**。DocumentServer 最後推送 2026-10-26；CHANGELOG 最新為 10.0.0，從 6.1 一路記錄到 10.0（`grep -n "^## " CHANGELOG.md`）。公司是拉脫維亞的 Ascensio System SIA。
- **測試**：server 有 61 個測試檔（Jest；`package.json` 有 unit／integration／storage 測試指令）。**sdkjs 公開 repo 裡找不到 `tests/` 目錄**（`grep -c "^tests/"` 結果為 0），試算表核心的公開測試覆蓋 → 未確認。
- **資安**：10.0.0 一版就修了超過 40 項資安問題（[CHANGELOG.md#L82-L148](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L82-L148)），包含巨集沙箱逃逸、XSS、WOPI SSRF、轉檔器記憶體越界讀寫、路徑穿越。**意思是：這是一個攻擊面很大的軟體，一定要跟著官方更新，不要長期停在舊版**；也不要把 DocumentServer 對全世界開放卻不設 JWT。
- **JWT 預設值**：`default.json` 的 secret 是 `developer-only-not-a-real-secret`，上線前必改。
- **遙測**：`statsd.useMetrics: false`（[default.json#L6-L11](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L6-L11)），伺服器端指標預設關閉。前端是否有對外統計 → 未確認（未全面掃描 web-apps）。
- **隱私**：檔案在你自己的主機上處理，不會傳給 ONLYOFFICE。AI 功能開啟時，選取內容會送到你設定的 AI 供應商。
- **已知的坑**：
  1. **`document.key` 一定要隨版本更換**：key 相同時，伺服器會沿用快取的舊檔／協作工作階段；檔案改過卻沿用舊 key 會開到舊內容。
  2. **DocumentServer 必須能下載 `document.url`、也必須能連到你的 `callbackUrl`**（雙向網路）。Firebase Storage 用簽名 URL、Cloud Function 要公開可呼叫。
  3. **開源版狀態在記憶體**（見 2.4），重開機／當機可能丟掉未存的協作變更；建議開啟 `forcesave` 或在 UI 提醒存檔。
  4. **社群版沒有手機網頁版編輯器**（README）。
  5. 整套很大：試算表 SDK 要串接 414 個 JS 檔，我本地有的其中 117 個原始碼就已 16.4 MB（`os.path.getsize` 加總）；第一次載入慢，官方提供 `preload`／`warmUp`（[api.js#L984](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L984)）預熱快取。
  6. 子模組釘選的 commit 在 sdkjs、web-apps 公開 repo 抓不到（`not our ref`），**想自己從原始碼建置會比較麻煩**，建議直接用官方 Docker 映像。

---

## 10. 跟其他專案組合的建議

1. **ONLYOFFICE（重型 Excel 相容）＋ 你的 Firebase 倉儲系統（輕型資料）**
   - 日常庫存、訂單資料仍存 Firestore，用你自己的表格／Univer 類元件顯示（快、好改）。
   - 需要「給會計、給廠商、要 100% 相容 Excel 格式」的報表，才用 ONLYOFFICE 開 `.xlsx`。
   - 串接：Cloud Function 從 Firestore 產 `.xlsx`（可用 SheetJS），存 Storage → 用 ONLYOFFICE 開；callback 回來再用 SheetJS 讀回 Firestore。
2. **ONLYOFFICE ＋ SheetJS**：SheetJS 負責「程式產生／解析 xlsx」，ONLYOFFICE 負責「人眼編輯」。兩者分工清楚。
3. **ONLYOFFICE ＋ Claude**：用它的 AI 外掛（填 Claude Key）處理表內文案；或把 ONLYOFFICE 轉檔 API 當工具，讓 Claude Code 寫的腳本把報價單轉 PDF。
4. **跟 Univer／Luckysheet 比**：Univer 是可以 `npm install` 進你頁面的元件、資料是 JSON、好接 Firestore，但 xlsx 保真度與函數數量不如 ONLYOFFICE。**要「元件」選 Univer；要「完整 Office」選 ONLYOFFICE**。兩個都可以留：ONLYOFFICE 當「高保真檢視／編輯器」，Univer 當「嵌在 App 裡的輕量表格」。
5. **不建議**：把 sdkjs 的公式引擎單獨抽出來塞進自己的元件——依賴整個 `AscCommonExcel`／`AscCommon` 全域系統，工程量很大，且 AGPL 會傳染。

---

## 11. 網頁 Excel 能力檢查表

**渲染方式（Canvas／DOM／WebGL）**：**有 — Canvas 2D**。
[WorkbookView.js#L410-L430](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorkbookView.js#L410-L430) 取得 4 個 canvas（`ws-canvas`、`ws-canvas-overlay`、`ws-canvas-graphic`、`ws-canvas-graphic-overlay`）並包成 `asc.DrawingContext`。不是 DOM 表格，也不是 WebGL。

**虛擬捲動**：**有**。
[WorksheetView.js#L1101-L1107](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorksheetView.js#L1101-L1107) 以 `visibleRange` 只計算可見列欄，列數上限為 `gc_nMaxRow`。Canvas 只畫看得到的範圍。

**10 萬列以上的效能**：**有（Excel 規格上限）**，實測數字未確認。
上限定義在 [SerializeCommonWordExcel.js#L951-L954](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/common/SerializeCommonWordExcel.js#L951-L954)：1,048,576 列 × 16,384 欄（同 Excel）。10.0 也改成樣式與資料分開儲存以提升大檔效能（`cell/model/CellStyleStorage/`）。我沒有實際跑效能測試。

**公式引擎：函數數量**：**有 — 483 個已實作（另有 17 個已登記但標為未實作）**。
- 怎麼數：寫 Python 腳本掃 [cell/model/FormulaObjects/*.js](https://github.com/ONLYOFFICE/sdkjs/tree/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects)，抓所有 `cFormulaFunctionGroup['分類'].push(...)` 裡的 `cXXX` 識別字，去重複後得到 500 個；再扣掉 `cFormulaFunctionGroup['NotRealised']` 裡的 17 個，得 483。這和 [getFormulasInfo()](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L6050-L6075) 對 UI 公開函數時的排除邏輯一致。
- 分類（已實作數）：統計 145、數學 83、財務 55、工程 54、文字 44、查閱與參照 35、日期時間 25、資訊 19、資料庫 12、邏輯 11、Cube 0。
- 未實作的 17 個：`ANCHORARRAY`、`BAHTTEXT`、`CUBE*` 共 7 個、`DBCS`、`FORECAST.ETS*` 共 4 個、`JIS`、`PHONETIC`、`RTD`。
- 新式函數有：`XLOOKUP`、`XMATCH`、`FILTER`、`SORT`、`SORTBY`、`UNIQUE`、`VSTACK`、`TEXTSPLIT`、`SEQUENCE`、`RANDARRAY`、`IMPORTRANGE`、`GETPIVOTDATA`（`grep "function cXXX"` 確認）。`LET`／`LAMBDA` 在 `cell/` 搜不到 → 視為沒有。

**解析器與依賴圖／重算的位置**：**有**。
解析：[parserFormula.prototype.parse #L8564](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L8564)；依賴圖：[DependencyGraph #L624](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L624-L655)；重算：[calcTree #L1676](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L1676)。手寫，無第三方公式函式庫。

**陣列公式**：**有**。
[cArray #L3032](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L3032) 型別；DependencyGraph 有 `buildArrayFormula`、`volatileArrays`（動態陣列溢出）。10.0 改善整欄／整列陣列公式效能（[CHANGELOG.md#L39-L41](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L39-L41)）。

**跨工作表參照**：**有**。
[cArea3D #L1546](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L1546)（`Sheet1!A1:E5`）、[cRef3D #L2119](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/FormulaObjects/parserFormula.js#L2119)（`Sheet1!A1`），另支援外部活頁簿連結（`externalLink` 參數）。

**自訂函數**：**有（用 JavaScript 巨集）**。
`Api.AddCustomFunction`（[apiBuilder.js#L856](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L856)）→ `CCustomFunctionEngine.addToFunctionsList` 加到 `cFormulaFunctionGroup['Custom']`（[WorkbookElems.js#L20192](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/WorkbookElems.js#L20192)）。例：可寫一個 `=匯率換算(A2,"USD")`。

**儲存格編輯**：**有**。[CellEditorView.js](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/CellEditorView.js)（4,289 行），含公式自動完成、範圍上色（10.0 新增公式列範圍標色）。

**複製貼上（能否直接從 Excel／Google 試算表貼上）**：**有**。
[Clipboard.pasteData #L491](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/clipboard.js#L491) 依格式分流；ONLYOFFICE 自家之間用內嵌 base64 二進位（`_pasteFromBinaryExcel`），從外部（Excel、Google 試算表、網頁）貼上走 HTML 剪貼簿，經 `AscCommon.PasteProcessor` 解析表格後寫入（[#L3340-L3435](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/clipboard.js#L3340-L3435)），連圖片也會上傳到伺服器。從 Google 試算表貼上的實際保真度未實測。

**拖拉填滿**：**有**。
[WorksheetView.applyFillHandle #L15988](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorksheetView.js#L15988)、雙擊填滿 `applyFillHandleDoubleClick`；數列／趨勢填滿 [CSerial.promoteCells #L25373](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L25373)。

**復原／重做**：**有**。[CHistory.Undo #L551 / Redo #L894](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/History.js#L551)，具體操作反向邏輯在 `UndoRedo.js`（6,735 行）。協作時也能復原自己的變更。

**數字格式**：**有**。[Range.setNumFormat #L19788](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L19788)，支援 Excel 格式碼（含貨幣、日期、自訂）。

**條件格式**：**有**。[CConditionalFormattingRule #L94](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/ConditionalFormatting.js#L94)，含資料橫條、色階、圖示集（繁中字串「圖示集」見 zh-tw.json）。

**合併儲存格**：**有**。[Range.merge #L20683](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L20683)。

**凍結窗格**：**有**。[WorksheetView.freezePane #L8582](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorksheetView.js#L8582)。

**欄寬列高**：**有**。[Worksheet.setColWidth #L8863](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L8863)、`setRowHeight` #L9277。

**篩選**：**有**。[AutoFilters #L830](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/autofilters.js#L830)，另有交叉分析篩選器（Slicer.js）與「工作表檢視」（NamedSheetViews.js，每人自己的篩選）。

**排序**：**有**。[Range.sort #L21555](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Workbook.js#L21555)，支援依顏色、自訂排序、依列排序。

**資料驗證（下拉選單）**：**有**。[CDataValidation #L214](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/DataValidation.js#L214)；UI 設定 [WorksheetView.setDataValidationProps #L27906](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/WorksheetView.js#L27906)。做「商品類別下拉」「倉位下拉」沒問題。

**圖表**：**有**。[spreadsheet_api.asc_addChartDrawingObject #L4802](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/api.js#L4802)；繪圖物件共用 `common/Drawings`。10.0 新增圖表「資料表」元素、非相鄰資料建圖。走勢圖（Sparklines）也有。

**樞紐分析**：**有（社群版就有）**。[CT_pivotTableDefinition #L3510](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/PivotTables.js#L3510)（PivotTables.js 共 23,286 行）；README 版本表也列為三版皆有（[Readme.md#L125](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L125)）。

**圖片／附件**：**圖片有、附件未確認**。插入圖片會上傳到 DocumentServer（`POST /upload/:docid`，[server.js#L302](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/server.js#L302)），允許格式見 `limits_image_types_upload`（jpg/png/webp/heic/avif…）。嵌入 OLE 物件有 `pluginMethod_RemoveOleObject` 等，一般「檔案附件」功能未確認。

**匯入匯出 .xlsx／.csv**：**有（開源版就有）**。
轉換由 C++ `x2t`（`ONLYOFFICE/core`）負責，不是 JS 函式庫；瀏覽器端用內部二進位格式（[Serialize.js](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/Serialize.js)）。開啟的副檔名清單（xls、xlsx、ods、csv、tsv、xlsm、xlsb、numbers…）寫在 [api.js 的 getAppPath](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L1124-L1160)。10.0 新增「存成 XLS」。**保真度是目前開源網頁試算表中最高的一群**（原生 OOXML 模型，欄位名稱直接是 OOXML），但 core 我沒掃，精確度 → 未確認。

**多人即時協作（OT／CRDT／鎖定；需要什麼伺服器）**：**有 — 鎖定式 + 變更廣播（非 CRDT）**。
前端 [CCollaborativeEditing #L58](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/CollaborativeEditing.js#L58)；伺服器 [getLock／_checkLockExcel](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L3638-L3685) + `saveChanges`，走 socket.io。有「快速」（即時看到）與「嚴格」（按存檔才同步）兩種模式（`editorConfig.coEditing.mode`）。**需要 DocumentServer 本身**，不能用 Firebase Realtime DB 取代。

**資料模型（JSON 長什麼樣）**：**有（fromToJSON.js）**。依 [SerSheetData](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/fromToJSON.js#L2642-L2755) 輸出，結構大致如下（欄位名稱照程式碼，值是示意）：
```json
{
  "name": "庫存", "id": "...", "hidden": "visible", "type": "worksheet",
  "mergeCells": ["A1:C1"],
  "sheetData": [
    { "r": 2, "ht": 15, "hidden": false, "s": 0, "cell": [
      { "r": "A2", "s": 3, "t": "s", "v": "保溫杯 500ml" },
      { "r": "B2", "s": 5, "t": "n", "v": 120 },
      { "r": "C2", "s": 5, "t": "n", "v": 156, "f": { "t": "normal", "v": "B2*1.3" } }
    ]}
  ],
  "dataValidations": [ ... ], "conditionalFormatting": [ ... ]
}
```
（`t` 的實際字串由 `ToXml_ST_CellValueType` 決定，上面的 `"s"`／`"n"` 是依 OOXML 慣例推測 → 未確認。）

**怎麼存進自己的資料庫（例如 Firebase Firestore）**：
- **推薦做法：存檔案，不存 JSON**。`.xlsx` 放 Firebase Storage，Firestore 只存 metadata（檔名、`key`、版本、更新時間）。callback 收到狀態 2／6 時，Cloud Function 下載新檔覆寫 Storage、更新 Firestore 的 `key`。
- 若要把格子資料同步進 Firestore 做查詢（例如庫存數量）：在 callback 裡用 SheetJS 解析 `.xlsx` 寫進 Firestore；或在編輯器內寫外掛／巨集，用 `Api.GetActiveSheet().GetUsedRange().GetValue()` 讀值送出。fromToJSON 的 JSON 很大（含樣式表），**不建議直接整份塞 Firestore**（單文件 1 MB 限制）。

**手機／觸控**：**付費版才有（手機版 UI）**；桌面版 UI 有觸控支援程式碼。
sdkjs 有 [mobileTouch.js](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/view/mobileTouch.js)（1,385 行），web-apps 也有 `spreadsheeteditor/mobile/`，但 README 版本表寫「Mobile web editors」社群版為「-」（[Readme.md#L98](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L98)）。限制的實際程式機制 → 未確認。

**繁體中文介面**：**有**。
[zh-tw.json](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/spreadsheeteditor/main/locale/zh-tw.json)：英文 `en.json` 有 5,406 個字串鍵，`zh-tw.json` 有 4,693 個，其中 4,681 個與英文鍵相同 → 約 **86.6% 已翻譯**，缺的會退回英文（用 Python 載入兩份 JSON 比對鍵）。語系載入邏輯 [common/locale.js#L46](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/common/locale.js#L46) 把 `zh-tw` 列為 4 碼語系，`editorConfig.lang: "zh-TW"` 會被轉小寫後載入 `zh-tw.json`（[#L114-L119](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/common/locale.js#L114-L119)）。

**嵌入方式：能不能嵌進純 JavaScript 網頁（不用 React／Vue）？**：**有，而且官方方式就是純 JS**。最小可用範例（你的倉儲網頁可以直接用）：
```html
<!DOCTYPE html>
<html lang="zh-Hant"><head><meta charset="utf-8"><title>庫存表</title></head>
<body style="margin:0">
  <div id="sheet" style="height:100vh"></div>
  <!-- 換成你自己 DocumentServer 的網址 -->
  <script src="https://docs.你的網域.com/web-apps/apps/api/documents/api.js"></script>
  <script>
    const config = {
      documentType: "cell",
      document: {
        fileType: "xlsx",
        key: "stock-20261104-v3",            // 檔案每改一版就換一個
        title: "庫存.xlsx",
        url: "https://firebasestorage.googleapis.com/....stock.xlsx?token=..." // DocumentServer 要能下載
      },
      editorConfig: {
        mode: "edit",
        lang: "zh-TW",
        callbackUrl: "https://asia-east1-你的專案.cloudfunctions.net/onlyofficeCallback",
        user: { id: "owner", name: "老闆" }
      },
      token: "<由 Cloud Function 用 JWT secret 簽出的 config JWT>",
      events: {
        onDocumentReady: () => console.log("試算表載入完成"),
        onDocumentStateChange: (e) => console.log("有未存變更：", e.data),
        onError: (e) => alert("錯誤：" + JSON.stringify(e.data))
      }
    };
    const editor = new DocsAPI.DocEditor("sheet", config);
  </script>
</body></html>
```
套件大小：前端不用安裝任何 npm 套件，`api.js` 本身 1,358 行；但編輯器 iframe 會從 DocumentServer 載入完整試算表 SDK（414 個 JS 串接，本地可量到的 117 個原始檔已 16.4 MB，正式版會壓縮，實際下載大小未確認）。**你的頁面不需要 React／Vue，但需要一台 DocumentServer。**

**API／事件：能否監聽變更**：**部分有**。
- 從外部頁面：只有 `onDocumentStateChange`（有／無未存變更）、`onCollaborativeChanges`（別人改了），**拿不到「哪一格改成什麼」**。
- 在編輯器內（巨集／外掛）：有 `Api#onWorksheetChange` 事件，回傳被修改的 `ApiRange`（[apiBuilder.js#L108-L115](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L108-L115)；undo／redo 不觸發）。

**用程式讀寫儲存格**：**有（在編輯器內）；從外部頁面直接呼叫 → 付費版才有**。
- 編輯器內：`Api.GetActiveSheet()`（[#L1046](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L1046)）→ `ApiWorksheet.GetRange("B2")`（[#L9709](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L9709)）→ `GetValue()`（[#L11472](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L11472)）／`SetValue()`（[#L11501](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/apiBuilder.js#L11501)）。
- 外部頁面：`createConnector`（Automation API）不在開源 `api.js` 回傳方法中（[#L930-L963](https://github.com/ONLYOFFICE/web-apps/blob/f79972a400c3a696490094961772d1f86fac1b82/apps/api/documents/api.js#L930-L963)），README 列為 Developer Edition 限定（[Readme.md#L90](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L90)）。**社群版的變通**：寫外掛，外掛 iframe 內可用 `fetch` 跟你的後端溝通，等於「從編輯器裡面往外推資料」。

---

## 關鍵字
ONLYOFFICE、DocumentServer、ONLYOFFICE Docs、網頁版 Excel、線上試算表、自架 Office、協作編輯、多人即時協作、xlsx 相容、OOXML、AGPL-3.0、社群版、Community Edition、Enterprise Edition、Developer Edition、sdkjs、web-apps、Canvas 渲染、公式引擎、483 個函數、XLOOKUP、樞紐分析、Pivot Table、條件格式、資料驗證、下拉選單、凍結窗格、Docs API、DocsAPI.DocEditor、api.js、callbackUrl、JWT、轉檔 API、converter、x2t、外掛、Plugin、巨集、Macro、Office JS API、AddCustomFunction、自訂函數、AI 外掛、AI proxy、Claude、Anthropic、MCP、Firebase Storage、Cloud Functions、Docker、繁體中文、zh-TW、WOPI、Nextcloud
