# 網頁版 Excel／試算表：全面比較（2026-11-04）

> 資料來源：本目錄 21 份資料包（掃描日 2026-11-04）＋ 12 份深入分析（[deep-dives/](deep-dives/)）＋ `_oss-research/cards/` 的 JSON 卡片。
> 本文件**沒有重新閱讀任何專案的原始碼**，所有數字、結論都來自上述資料；資料包之間不一致或標「未確認」的地方，本文會直接指出（集中在 [6.3](#63-資料包之間不一致或未確認的地方)）。
> 星數、授權、程式碼位置都是 2026-11-04 的快照，動手前請重新確認。授權白話整理**不是法律意見**。
> 圖例：✅ 有　⚠️ 部分／有條件　❌ 沒有　💰 付費版才有　❓ 未確認　—：不適用（例如沒有畫面）。

---

## 先講結論（給趕時間的人）

1. **沒有一個開源專案同時做到「免費、能嵌進自己網頁、完整 Excel、xlsx 高保真、多人協作」**。你得在「免費」和「完整」之間選邊，或組合幾個專案。
2. **只想在倉儲系統加一個可編輯表格**：先試 [Jspreadsheet CE](jspreadsheet__ce.md)（MIT、純 JS、gzip 約 34 KB；但是 DOM 渲染、沒有 xlsx）；資料量大就改 [AG Grid 社群版](ag-grid__ag-grid.md)（MIT；但貼上多格、拖拉填滿、xlsx 匯出是付費）。
3. **要完整 Excel 體驗又要嵌進自己的頁面**：[Univer](dream-num__univer.md) 是底座首選（Apache-2.0、Canvas、511 個真正有計算的函數），但 **xlsx 匯入匯出、即時協作、圖表、樞紐分析都在付費的 Pro**。想要這些全部開源，看 [o-spreadsheet](odoo__o-spreadsheet.md)（LGPL，自帶 xlsx／圖表／樞紐／OT 協作，但要自備協作伺服器、沒有繁中語系）。
4. **要最接近真 Excel 的檔案相容與多人同時編輯，而且願意多架一台伺服器**：[ONLYOFFICE DocumentServer](ONLYOFFICE__DocumentServer.md)（AGPL，Docker，用 iframe 嵌入；Firebase Hosting 放不了它）。
5. **處理 .xlsx 檔**：讀寫引擎用 [SheetJS](SheetJS__sheetjs.md)（Apache-2.0，要從它自己的 CDN 安裝；免費版寫不出樣式，也不會算公式）。要「改別人排好版的範本又不破壞外觀」，改看 [OfficeCLI](iOfficeAI__OfficeCLI.md)／[GenOffice](genspark-ai__genoffice.md)。
6. **只要公式計算（成本、毛利、比價）**：[IronCalc](ironcalc__IronCalc.md)（MIT／Apache，Rust→WebAssembly，497 個函數）或 [HyperFormula](handsontable__hyperformula.md)（GPL 或買商業授權），都沒有畫面，要自配表格 UI。
7. **要讓 Claude 讀寫**：檔案層用 OfficeCLI／GenOffice／[GridCraft](storytold__gridcraft.md)（都有 MCP）；資料庫層用 [NocoDB](nocodb__nocodb.md)（社群版就有 MCP，但授權限內部使用）或 [Grist](gristlabs__grist-core.md)（REST API；官方 MCP 在「完整版」）。
8. **Grist／NocoDB／Teable／APITable 是「資料庫型試算表」，不是 Excel**：公式是「整欄一條」，沒有 A1 儲存格位址，也不能合併儲存格；但拿來做進銷存、成本比價後台很順手。
9. **授權地雷**：Handsontable（小生意自家營運依條文算商用）、HyperFormula（GPL）、NocoDB（只限內部）、ONLYOFFICE／Teable／APITable（AGPL）、Univer Pro（閉源）、univer-workspace（開發憑證只認 localhost）。詳見[第 5 節](#5-授權地雷整理)。
10. **所有資料包都沒有實測「10 萬列效能」「套件大小」「手機手感」**（只有少數專案量過檔案大小）。選定前請自己用真實資料跑一次。

---

## 1. 21 個專案分類

星數是掃描當天的數字。GridCraft（一個月 23 萬行 Rust）與 GenOffice（建立三個月 1.1 萬星）成長極快，資料包提醒「星數衝很快不代表成熟」。

### 1.1 完整產品（整套服務，不是元件）

| 專案 | 一句話 | ⭐／授權 | 資料包 |
|---|---|---|---|
| ONLYOFFICE DocumentServer | 自架的線上 Office：網頁上完整編輯、多人協作 .xlsx（Canvas＋C++ 轉檔器） | 7,088／AGPL-3.0＋附加條款 | [連結](ONLYOFFICE__DocumentServer.md) |
| Grist (grist-core) | Python 公式、SQLite 存檔的自架「試算表＋關聯式資料庫」伺服器 | 12,046／Apache-2.0（預設映像含非開源完整版） | [連結](gristlabs__grist-core.md) |
| NocoDB | 自架 Airtable 替代品：試算表介面管 SQL 資料庫，社群版就有 MCP | 65,421／Sustainable Use License（非 OSI 開源） | [連結](nocodb__nocodb.md) |
| Teable | 跑在 PostgreSQL 上的資料庫型試算表，附 MIT 授權的 Canvas 表格元件 | 21,952／apps AGPL＋packages MIT | [連結](teableio__teable.md) |
| APITable | 開源版 Airtable：Canvas 表格＋欄位公式＋OT 即時協作（開源 repo 為低度維護） | 15,658／AGPL-3.0 | [連結](apitable__apitable.md) |
| univer-workspace | Univer 官方可自架 Office 工作區，含 AI 草稿審核；重度依賴 Pro 套件 | 2,269／Apache-2.0＋Pro 商業授權 | [連結](dream-num__univer-workspace.md) |

### 1.2 可嵌入元件（表格／試算表 UI）

| 專案 | 一句話 | ⭐／授權 | 資料包 |
|---|---|---|---|
| Univer | 可嵌入網頁的 Canvas 版 Excel SDK，外掛式架構，自帶公式引擎 | 22,883／Apache-2.0（Pro 另售） | [連結](dream-num__univer.md) |
| o-spreadsheet | Odoo 的網頁試算表引擎：Canvas、336 函數、xlsx、OT 協作 | 298／LGPL-3.0 | [連結](odoo__o-spreadsheet.md) |
| Luckysheet | **已停止維護**、純 JS＋jQuery 的類 Excel 試算表（Univer 前身） | 16,630／MIT | [連結](dream-num__Luckysheet.md) |
| FortuneSheet | Luckysheet 的 TypeScript＋React 改寫版 | 3,748／MIT | [連結](ruilisi__fortune-sheet.md) |
| x-spreadsheet | 純 JS 零依賴 Canvas 試算表，易讀但公式只有 8 個、**已停更** | 14,571／MIT | [連結](myliang__x-spreadsheet.md) |
| Jspreadsheet CE | 純 JS、免框架的輕量試算表／可編輯表格（DOM `<table>`） | 7,242／MIT | [連結](jspreadsheet__ce.md) |
| Handsontable | 像 Excel 的商用級表格元件，含公式、貼上、xlsx 匯出 | 22,075／自訂雙授權（非開源） | [連結](handsontable__handsontable.md) |
| AG Grid | 最普及的 JS 資料表格，社群版免費，公式／填滿／貼上／xlsx 匯出是企業版 | 15,672／MIT（社群）＋商業 EULA（企業） | [連結](ag-grid__ag-grid.md) |
| Glide Data Grid | Canvas 的超快 React 表格，可貼 Excel、拖拉填滿，但沒有公式 | 5,426／MIT | [連結](glideapps__glide-data-grid.md) |

### 1.3 公式引擎（沒有或只有附屬的畫面）

| 專案 | 一句話 | ⭐／授權 | 資料包 |
|---|---|---|---|
| HyperFormula | 無畫面的 Excel 公式引擎（TypeScript），355 個類 Excel 函數 | 2,829／GPL-3.0 或商業 | [連結](handsontable__hyperformula.md) |
| IronCalc | Rust 寫的 Excel 相容引擎，編成 wasm 在瀏覽器算公式、讀寫 xlsx，另附 React＋Canvas 介面 | 4,247／MIT 或 Apache-2.0 | [連結](ironcalc__IronCalc.md) |

### 1.4 檔案讀寫

| 專案 | 一句話 | ⭐／授權 | 資料包 |
|---|---|---|---|
| SheetJS | 純 JS 讀寫 xlsx／csv／xls 等的標準工具庫；沒有 UI、不算公式；GitHub 這份已停更 | 36,341／Apache-2.0（Pro 另售） | [連結](SheetJS__sheetjs.md) |

### 1.5 AI Office（給 AI 操作的試算表／Office 工具）

| 專案 | 一句話 | ⭐／授權 | 資料包 |
|---|---|---|---|
| GenOffice | 桌面版開源 AI Office，試算表用 Univer 開源版＋自寫 Rust xlsx 引擎，Claude 是一等公民 | 11,717／Apache-2.0 | [連結](genspark-ai__genoffice.md) |
| OfficeCLI | 給 AI 讀寫 xlsx／docx／pptx 的單檔 CLI，內建公式引擎與 HTML 預覽，MCP 原生支援 Claude | 33,035／Apache-2.0 | [連結](iOfficeAI__OfficeCLI.md) |
| GridCraft | 純 Rust 仿 Excel（桌面＋瀏覽器 wasm），內建 MCP 讓 Claude 直接操作 | 7,139／MIT 或 Apache-2.0 | [連結](storytold__gridcraft.md) |

> 分類有重疊：univer-workspace 也算 AI Office；IronCalc 附有介面；Teable 的 Grid 可獨立拿出來當元件；Grist 有 grist-static 可純前端跑。表中取「最主要的用法」。

---

## 2. 功能比較矩陣

欄位說明（凍結／合併／篩選／驗證 依序四個符號；圖表／樞紐 依序兩個符號）。「純 JS 嵌入」指**不用 React／Vue**、能放進你現有的純 JavaScript 網頁。所有「函數數」都是各資料包自己數的，**算法不同不能直接比**（見 [3.2](#32-公式引擎)的對照表）。

| 專案 | 渲染方式 | 公式函數數 | 開源版 xlsx 匯入／匯出 | 即時協作 | 凍結／合併／篩選／驗證 | 圖表／樞紐 | 手機觸控 | 純 JS 嵌入 | 約略套件大小 | 授權（個人／商用） | 維護狀況 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **ONLYOFFICE** | Canvas 2D（4 層疊合） | 483（500 註冊，17 未實作） | ✅／✅（伺服器端 C++ x2t；保真度是開源中最高的一群，但 core 沒掃，精確度❓） | ✅ 鎖定＋變更廣播（socket.io），需 DocumentServer | ✅✅✅✅ | ✅✅（社群版就有） | 💰（手機網頁版社群版沒有） | ⚠️ 只能 iframe＋`api.js`，要另架伺服器 | ❓（打包來源約 109 萬行／37 MB） | ✅／⚠️ AGPL＋附加條款 | 非常活躍（10.0.0） |
| **SheetJS** | 無（只有 `<table>` 輸出） | 0（不計算；`Ftab` 認得 479 個名稱） | ✅／✅（寫樣式💰；來回後外觀會遺失） | ❌ | ❌✅⚠️❌ | 💰💰 | — | ✅ | mini 約 83 KB／core 約 150 KB／full 約 324 KB（gzip，資料包自量） | ✅／✅ Apache-2.0 | ⚠️ GitHub 停更（master 0.18.12，2022-10）；新版在 cdn.sheetjs.com，內容❓ |
| **AG Grid** | DOM | 💰（企業版 20 名稱／18 實作） | ❌（官方範例搭 SheetJS）／💰；csv 匯出✅ | ❌ | ✅⚠️✅⚠️ | 💰💰 | ⚠️ 基本 | ✅（`createGrid`，CDN UMD） | ❓ | ✅／✅（社群 MIT）；企業版公開網址要買 | 非常活躍 |
| **APITable** | Canvas（Konva）＋DOM 編輯層 | 82 名稱（81 實作），整欄公式 | ✅／✅（低保真：全轉文字、無公式無格式；5 萬列上限） | ✅ OT（json0）＋Redis 等 | ⚠️❌✅⚠️（只凍欄；驗證靠單／多選欄位） | ⚠️❌（圖表靠小程式） | ✅ | ❌ 只能 iframe | ❓（前端依賴 194 個） | ✅／⚠️ AGPL | ⚠️ 低度維護（從閉源 repo 定期同步） |
| **Luckysheet** | Canvas 2D＋jQuery | 375 定義／374 實作 | ❌／⚠️（匯入需另一個 Luckyexcel；匯出需自備伺服器） | ⚠️ 陽春：廣播操作、後到覆蓋；需 Java 後端 | ✅✅✅✅ | ⚠️✅（圖表依賴 unpkg CDN） | ⚠️ 基本 | ✅（最大優點） | ❓（核心原始碼未壓縮約 6.3 MB） | ✅／✅ MIT | ❌ 官方宣布停止維護 |
| **univer-workspace** | Canvas（Univer） | ❓ | 💰／💰（Pro 伺服器端；免費額度每月 10 次匯出） | 💰（OT 在 Pro） | ✅✅✅✅ | 💰💰 | ✅ | ❌（整個是 React 19 App） | ❓ | ⚠️ 只在 localhost 順／💰 Pro | 非常活躍（2026-08 建立） |
| **Univer** | Canvas 2D（自製引擎） | 511 有計算（517 或 538 註冊，見 6.3） | 💰／💰（csv 也沒有） | 💰（OT 插座在開源、引擎在 Pro） | ✅✅✅✅ | 💰💰 | ✅（獨立 Mobile 外掛） | ⚠️ 要 Vite 打包；不必寫 React，但 React／rxjs 是必裝 peer | ❓（原始碼約 47 萬行，推估數 MB 級） | ✅／✅ Apache-2.0 | 非常活躍（1.3.1） |
| **GenOffice** | Canvas（Univer 0.25.1 開源 preset） | ❓（引擎來自 Univer；另有 IronCalc 重算） | ✅／✅（自寫 Rust；未動項目逐位元組保留）；csv✅、PDF 匯出✅ | ❌ | ✅✅✅✅ | ✅✅（自製 SVG 圖表、自製樞紐） | ❌（桌面 Electron） | ❌ | —（桌面 App） | ✅／✅ Apache-2.0 | 非常活躍（仍是 0.x） |
| **Glide Data Grid** | Canvas 2D | 0（沒有公式） | ❌／❌（只有剪貼簿 TSV） | ❌ | ✅⚠️❌✅（合併只能橫向；篩選要自己做） | ⚠️❌（只有格內迷你圖） | ⚠️ 基本 | ⚠️ 要 React，但可不用打包工具 | ❓（核心 TS 原始碼約 755 KB 未壓縮） | ✅／✅ MIT | ⚠️ 偏慢（main 2026-01-21 後無新 commit，6.0.4-alpha25） |
| **Grist** | DOM（Knockout＋GrainJS；只做直向虛擬化） | 148 實作（+REQUEST）；Python | ✅／✅（匯入只拿值；匯出值＋樣式、無公式） | ✅ 伺服器集中序列化（非 OT／CRDT） | ⚠️❌✅✅（只凍欄） | ✅✅（Plotly；摘要表） | ⚠️ | ❌ 整套伺服器；grist-static 可純前端跑但不儲存 | —（伺服器） | ✅／✅ Apache-2.0（完整版 MCP／AI／SSO 非開源） | 非常活躍（1.7.22） |
| **Handsontable** | DOM（`<table>`，虛擬捲動） | 約 355～406（靠 HyperFormula；各包算法不同） | ⚠️／✅（匯出需注入 ExcelJS；**匯入只在 develop 分支，未發佈**）；csv 匯出✅ | ❌ | ✅✅✅✅ | ❌❌ | ⚠️ 外掛 | ✅ | ❓（full 版含 HyperFormula，屬大型） | ✅／💰 自家營運依條文算商用 | 非常活躍（18.1.2） |
| **HyperFormula** | 無畫面 | 355 類 Excel 函數（含別名 423） | ❌／❌（引擎只存值＋公式） | ❌ | — | — | — | ✅（CDN 全域 `HyperFormula`） | 官方稱「a few hundred kB」（❓未自量） | ✅（`gpl-v3` 金鑰）／⚠️ GPL 或買授權 | 活躍（3.5.0，2026-10-09） |
| **OfficeCLI** | 伺服端產生 HTML `<table>`（虛擬捲動為私有實作） | 461（+LET／LAMBDA 共 463） | ✅／✅（直接改 OOXML，未動部分原樣保留）；csv 匯入✅、匯出❌ | ❌ | ✅✅⚠️✅（寫入檔案，預覽不能真的篩選） | ✅✅（樞紐是強項） | ❌ | ❌（原生執行檔；用 iframe 看預覽） | 前端 0 KB；後端執行檔❓ | ✅／✅ Apache-2.0 | 非常活躍（1.0.160） |
| **IronCalc** | Canvas 2D（React） | 497（含 37 個舊版相容；現代約 460） | ✅／✅（圖表、樞紐、資料驗證、圖片會遺失）；csv ⚠️ | ❌（只有 diff 同步零件） | ✅✅❌❌ | ❌❌ | ✅ 基本 | ⚠️ 引擎 `@ironcalc/wasm` 可純 JS；UI 是 React | ❓ | ✅／✅ MIT 或 Apache-2.0 | 活躍（0.9.1，未到 1.0） |
| **Jspreadsheet CE** | DOM `<table>`（懶載入，非真虛擬捲動） | ❓（外部套件宣稱 403，未驗證） | ❌／❌；csv 匯入匯出✅ | ❌ | ⚠️✅✅⚠️（只凍欄；通用驗證💰） | ❌❌ | ⚠️ 基本 | ✅（主要用法） | 約 145 KB（未壓縮）／34 KB（gzip），另加 jsuites 與 formula | ✅／✅ MIT | 活躍（2026-10-14） |
| **x-spreadsheet** | Canvas 2D | 8 | ❌／❌ | ❌ | ✅✅⚠️✅（篩選陽春；排序實際不可用） | ❌❌ | ⚠️ | ✅（零依賴） | 約 198 KB／42 KB（gzip） | ✅／✅ MIT | ❌ 視為停止維護（遷移到 @wolf-table/table） |
| **NocoDB** | Canvas（預設）＋Vue 編輯器 | 70；整欄公式即時轉 SQL | ✅／✅（低保真：公式只留結果；匯出單一 `Data` 工作表）；csv✅ | 💰（社群版無；後寫覆蓋） | ⚠️❌✅✅（只凍欄；驗證靠單／多選欄位） | ❌❌ | ⚠️ 基本 | ❌ iframe 或 API | ❓ | ✅／⚠️ 僅限自家內部 | 非常活躍（0.301.3；開發主體在私有 EE） |
| **o-spreadsheet** | Canvas 2D（UI 用 Owl 3 alpha） | 336 | ✅／✅（匯入需自備 JSZip 之類解壓） | ✅ OT（需自備能依 revision 排序廣播的伺服器） | ✅✅✅✅（31 種驗證條件） | ✅✅（24 種圖表） | ⚠️ 基本（未確認程度） | ✅（Owl 用 `<script>` 載入，不需 npm） | ❓（743 個 TS 檔、約 14.2 萬行；另需 Chart.js、luxon） | ✅／✅ LGPL（改原檔要公開修改） | 非常活躍（20.0.6） |
| **FortuneSheet** | Canvas 2D（React 18） | 說明清單 371；實際可算數❓ | ❌／❌（第三方 FortuneExcel，授權❓） | ⚠️ 基本：後到覆蓋，需自備 WebSocket 後端 | ✅✅✅✅ | ❌❌ | ⚠️ 基本 | ⚠️ 一定要載 React 18＋ReactDOM | ❓ | ✅／✅ MIT | ⚠️ 活躍度下降（commit：2023 年 225、2024 年 190、2025 年 71） |
| **GridCraft** | Canvas（egui→WebGPU／WebGL2，wasm） | 約 515（自數 492 不重複＋其他） | ✅／✅（自寫；保真度中等、未經 Excel 實證）；csv✅ | ❌ | ✅✅✅✅ | ✅✅（17 種圖表、樞紐） | ⚠️ 單指平移，無手機版面 | ❌ 只能 iframe 整個 App，JS 端無單格 API | ❓（推測數 MB，未量） | ✅／✅ MIT 或 Apache-2.0（商標除外） | 非常活躍（大量 AI 生成程式碼） |
| **Teable** | Canvas（自製 MIT Grid） | 81（v1）／83（v2）；整欄公式→PostgreSQL SQL | ✅／❌（匯入只取值；僅 csv 匯出） | ✅ ShareDB（非傳統 OT；後寫蓋掉） | ⚠️❌✅✅（只凍欄；驗證靠單／多選欄位） | ⚠️❌（圖表靠外掛／儀表板） | ✅（點格子會展開整列，不能格內編輯） | ⚠️ Grid 需 React，要 Vite 打包成 `mountGrid()` | ❓ | ✅／⚠️ apps AGPL＋品牌保護；packages MIT | 非常活躍 |

### 2.1 矩陣的補充說明（容易看錯的地方）

- **「渲染 Canvas」不等於效能一定好**：Luckysheet、x-spreadsheet、FortuneSheet 的資料模型是完整二維陣列或每次編輯整張快照，資料包都判斷 10 萬列有風險（皆未實測）。DOM 版的 Handsontable 反而有官方 10 萬列×100 欄的效能測試情境（數字❓）。
- **Jspreadsheet CE 的「虛擬捲動」只是懶載入**：每次只掛 100 列到畫面，但所有列的 DOM 物件初始化時都會建立；資料包的估計是「數千到一兩萬列可以，更大請分頁」。
- **「公式 ✅」的意義差很多**：Univer／ONLYOFFICE／o-spreadsheet／IronCalc／GridCraft 是儲存格 A1 公式；Grist／Teable／NocoDB／APITable 是「整欄公式」；AG Grid 的公式在企業版；Glide 與 SheetJS 完全不算。
- **Handsontable 的 xlsx**：資料包說匯出是已發佈版就有（17.1.0 起需注入 ExcelJS）；`importFile`、內建 xlsx 引擎、`sheetsBar` 都只存在於 `develop` 分支的變更紀錄，**不在已發佈的 18.1.2**。
- **ONLYOFFICE 的「手機」**：社群版沒有手機網頁編輯器（README 版本表為「-」）；`sdkjs` 內有觸控程式碼，限制機制❓。
- **Univer 與 GenOffice 的版本差**：Univer 資料包掃的是 1.3.1，GenOffice 用 0.25.1；GenOffice 因此自己做了圖表與樞紐，並不代表 Univer 1.3.1 開源版有這兩項（Univer 資料包明確寫圖表、樞紐為 Pro）。API 事件名稱也不同（Univer 資料包用 `SheetValueChanged`，GenOffice 用 `SheetEditEnded`），照抄範例前先對版本。
- **繁體中文介面**：✅ Univer 核心（`zh-TW`，sheets-ui 398 行）、ONLYOFFICE（約 87%）、NocoDB（約 80%）、Handsontable（154／160 鍵）、Luckysheet（`zh_tw`，但 `changLang()` 不接受）、FortuneSheet、GenOffice、AG Grid（847 鍵）、Grist（client 約 45%）。❌ Jspreadsheet CE（舊鍵名對不上 v5）、x-spreadsheet（只有 en／zh-cn／de／nl）、IronCalc（de／en／es／fr／it）、Glide、HyperFormula（函數名無中文）、OfficeCLI、GridCraft（只有簡中）、Teable（只有簡中）、APITable（只有 zh-HK 港式用語）。o-spreadsheet 沒有翻譯檔但字串都經 `_t()`，可自接；univer-workspace 這個 App 只有 zh-CN／en-US。

---

## 3. 架構比較

### 3.1 渲染引擎

| 做法 | 代表專案 | 優點 | 缺點 |
|---|---|---|---|
| 自製 Canvas＋疊 DOM 編輯層 | Univer、ONLYOFFICE、o-spreadsheet、IronCalc、Luckysheet、x-spreadsheet、FortuneSheet、Glide、Teable、NocoDB | 大量格子時較省資源；畫面完全可控 | 沒有無障礙（canvas 無 ARIA）；中文輸入法、貼上、選取都要自己處理；CSS 無法直接改格子外觀 |
| DOM（`<table>`／`div`） | Handsontable、Jspreadsheet CE、AG Grid、Grist | 好客製、好除錯、無障礙佳 | 格子極多時吃效能；Jspreadsheet 初始化就建立所有列 |
| Canvas 跑在 WebGPU／WebGL（wasm） | GridCraft（egui） | 整個 App 同一份 Rust 程式 | 不能當 JS 元件，只能 iframe；wasm 體積大（推測，未量） |
| 伺服端產生 HTML 預覽 | OfficeCLI | 前端 0 KB | 預覽不能編輯（只有雙擊改值），開源版無虛擬捲動、上限 5,000 列 |
| 無畫面 | HyperFormula、SheetJS | 純邏輯，好測 | 畫面要自己配 |

**Univer 的做法**（[render-interaction 深入分析](deep-dives/dream-num__univer__render-interaction.md)）：每個活頁簿一個 `RenderUnit`，只有一張真正的 `<canvas>`，上面疊「邏輯圖層」（試算表用 5 層）；主表格層與欄名列號層各有離屏快取畫布。虛擬捲動是把列高欄寬算成累積陣列，再二分搜尋出可視範圍，四周多畫 100px 緩衝；捲動時快取畫布整塊位移、只補畫新露出的條帶。儲存格編輯器其實是**一份迷你 Univer 文件**（另一個 Doc 單元、另一個 Engine），鍵盤／注音輸入法／貼上都打進一個 1×1 像素的隱藏 `contenteditable`。原始碼：[canvas.ts#L58-L104](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/canvas.ts#L58-L104)。深入分析的建議：渲染引擎與 DI、Registry、rxjs 綁太深，**不適合單獨拆**，要嘛整套嵌入，要嘛只抄演算法（累積陣列＋二分搜尋、搬移像素式捲動、Excel HTML 解析、自動填滿規則）。

**ONLYOFFICE**（[sdkjs-cell 深入分析](deep-dives/ONLYOFFICE__DocumentServer__sdkjs-cell.md)）：4 層 Canvas 疊起來、只畫可視範圍，捲動時 `drawImage` 自己貼自己再補畫新露出的列；**文字不用瀏覽器的 `fillText`**，而是用 FreeType＋HarfBuzz 編成的 WebAssembly 字型引擎畫字形，好處是各瀏覽器一致，代價是要先備好字型檔與 `AllFonts.js`。這也是為什麼繁中字型要在伺服器端另外處理（見 [server-deploy 深入分析](deep-dives/ONLYOFFICE__DocumentServer__server-deploy.md)：預設只有文泉驛正黑等替代字型，微軟正黑體要自己掛）。

**Teable 的雙畫布**（[grid 深入分析](deep-dives/teableio__teable__grid.md)）：格子背景、格線、選取框每次在主畫布重畫，最花時間的「儲存格內容」畫在離屏快取畫布，只有捲動中或資料／欄位／主題變動才重畫；另有文字量測 LRU 快取與圖片物件池。它沒有 Glide 的「上一幀平移重用（blit）」，捲動時每一幀都重畫所有可見格內容，資料量大時可能是和 Glide 差最多的地方（深入分析自述為推論，未實測）。對照 Glide 的 blit 實作：[data-grid-render.blit.ts#L21](https://github.com/glideapps/glide-data-grid/blob/0875d78cc41535a39f8b417ff88ce1ebe129c363/packages/core/src/internal/data-grid/render/data-grid-render.blit.ts#L21)。Teable 的 Grid 前身就是 glide-data-grid 5.2.1（2023-07 換成自製），但這是深入分析憑對 glide 的既有了解比對的，**標為未確認**。

**NocoDB**（[grid 深入分析](deep-dives/nocodb__nocodb__grid.md)）：正式環境走 Canvas（80 個檔、約 3 萬行），只有「正在編輯的那格」換成浮在 canvas 上的 Vue 元件；顯示和編輯是兩套程式（33 個 canvas 繪製器對上 26＋14 種 Vue 編輯器），新增欄位型別兩邊都要寫。因為 `CanvasTable` 要 41 個 props、13 種 `inject`、依賴 Nuxt 自動 import，**不能直接拆成獨立元件**（建議「搬邏輯、不搬元件」）。

**Grist**（[client-mcp 深入分析](deep-dives/gristlabs__grist-core__client-mcp.md)）：表格是 Knockout 3.5.0 加自家 `koDom` 綁定與自製虛擬捲動（`koDomScrolly.js`，列高放在 Fenwick tree `BinaryIndexedTree.js`），只做**直向**虛擬化，每列都把全部欄位畫出來。注意 Grist 資料包第一版寫的「GrainJS 渲染」被深入分析更正：GrainJS 用在較新的介面，表格核心是 Knockout。

### 3.2 公式引擎

先看「**三種完全不同的公式模型**」，這比函數數量重要：

1. **儲存格 A1 公式（Excel 式）**：Univer、ONLYOFFICE、o-spreadsheet、IronCalc、HyperFormula、GridCraft、OfficeCLI、Luckysheet、FortuneSheet、x-spreadsheet、Jspreadsheet。
2. **整欄公式（Airtable／資料庫式）**：Grist（Python）、Teable（ANTLR4→PostgreSQL SQL）、NocoDB（jsep→每次查詢即時轉 SQL）、APITable（自寫 lexer／parser／interpreter，以「欄位」為依賴節點）。沒有 `A1`、`Sheet2!A1`，跨表要靠 Link＋Lookup／Rollup。
3. **沒有公式／公式要付費**：Glide Data Grid（0）、SheetJS（0，只保存公式字串，計算是 Pro）、AG Grid（企業版）。

| 專案 | 解析器 | 依賴追蹤 | 陣列／溢出 | 自訂函數 | 注意事項 |
|---|---|---|---|---|---|
| Univer | 手寫：Lexer 狀態機→調度場→AST→Interpreter | 範圍登記進 R-tree（`rbush`／`kdbush`），改動時查交集，DFS 排序、Kosaraju 找循環；支援 Excel 式反覆運算 | ✅ 動態陣列完整（FILTER／SORT／UNIQUE／LAMBDA／LET／MAP…）；`A1#` 只解析不求值 | ✅ `registerFunction`／`registerAsyncFunction` | **Web Worker 模式下，主執行緒註冊的自訂函數不會送進 Worker，直接丟錯** |
| ONLYOFFICE | 手寫：調度場→逆波蘭→堆疊求值 | `DependencyGraph`（單格＋範圍監聽） | ✅ 動態陣列；**LET／LAMBDA 沒有** | ✅ 巨集 `Api.AddCustomFunction`（支援 async） | 公式物件綁全域單例，**單獨拆出來非常難** |
| o-spreadsheet | 編譯成 JS（`new Function`） | 公式依賴圖（interval tree）、增量重算 | ✅ 溢出＋碰撞檢查 | ✅ `addFunction`（自訂格式、延遲參數） | 嚴格 CSP 要允許 `unsafe-eval`（Firebase Hosting 預設無 CSP） |
| IronCalc | 手寫遞迴下降（Rust） | **沒有增量依賴圖**：每次整本遞迴重算，偵測循環 | ✅ CSE 與動態陣列溢出 | ❌（可用 LAMBDA＋命名範圍） | 每次編輯全量重算，公式多時編輯會變慢（未實測） |
| HyperFormula | chevrotain | 依賴圖＋拓撲排序＋增量重算＋Tarjan 循環偵測 | ✅ 但非 Excel 365 動態陣列；輸出大小須在解析時確定 | ✅ `registerFunctionPlugin`，**不支援非同步** | 預設 `maxRows: 40_000` 要自己調高；沒有 3D 參照；GPL |
| GridCraft | Rust | 增量重算＋拓撲排序＋循環偵測 | ✅ | ⚠️ 只能 LAMBDA＋命名；無外掛 API | 數字格式碼只有 en-US |
| OfficeCLI | 手寫遞迴下降，邊解析邊求值 | **沒有依賴圖**（拉取式求值＋memo） | ✅ | ⚠️ 只能 LAMBDA／LET／命名 | 邏輯是「寫入時算一次、存檔時掃一遍修快取」 |
| Luckysheet | 手寫，轉成 JS 字串再 `new Function` | `calcChain`＋DFS | ⚠️ 部分 | ✅（無文件）`customFunctions` | 最後一版 2021 年 CHANGELOG |
| FortuneSheet | Jison 文法（fork 自 handsontable/formula-parser） | `getFormulaRunList`，只重算受影響公式 | ❌ 動態陣列實質停用（程式被註解掉） | ❌ 無公開 API | **中文工作表名稱要寫成 `'庫存'!A1`（加單引號）** |
| x-spreadsheet | 中序→後序 | **沒有**：重繪時畫到哪格算哪格 | ❌ | ❌ | 公式同步執行，不能 await |
| Jspreadsheet CE | 外部 `@jspreadsheet/formula`（Basic 版 MIT，**原始碼不在 GitHub**） | 簡易反向索引＋遞迴 | ❌ | ✅ `setFormula` | Basic 版沒處理浮點誤差（`37.02+2.56` 可能出現 39.580000000000005），算錢請 `ROUND` |
| Grist | Python codegen（`codebuilder.py`） | **執行時動態收集**，精準到「列」 | ❌ 無 spill | ⚠️ 公式內可寫多行 Python | **沒有 COUNTIF／XLOOKUP／FILTER／IFS／SWITCH／TEXTJOIN／PMT／NPV／IRR**；SUMIF、INDEX、MATCH 只是空殼 |
| Teable | ANTLR4（沿用 Baserow 語法） | 欄位層級，`reference` 表＋DFS 拓撲 | ⚠️ 多值欄位函式 | ❌（前後端兩邊都要改原始碼） | 公式翻成 PostgreSQL SQL，v1 做成 `GENERATED ALWAYS AS` 欄位 |
| NocoDB | `nc-jsep` | 無傳統依賴圖（查詢時算） | ⚠️ 只吃關聯欄位 | ❌ | 公式複雜時會拖慢整張表的查詢 |
| APITable | 自寫遞迴下降 | 以欄位為節點 | ⚠️ 有 ARRAY* 函數 | ❌（靜態 Map） | 開源版 5 萬列硬上限（`MAX_RECORD_NUM = 50000`） |

Univer 公式引擎的完整細節在 [formula-engine 深入分析](deep-dives/dream-num__univer__formula-engine.md)；依賴登記程式碼：[formula-dependency.ts#L97-L147](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-formula/src/engine/dependency/formula-dependency.ts#L97-L147)。HyperFormula：[DependencyGraph.ts#L89-L210](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/DependencyGraph/DependencyGraph.ts#L89-L210)、[Evaluator.ts#L34-L110](https://github.com/handsontable/hyperformula/blob/187dfa1660fa0b0c3f13c15a6ddb81ccf799c9e3/src/Evaluator.ts#L34-L110)。IronCalc 重算：[evaluation.rs#L1-L40](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/evaluation.rs#L1-L40)。o-spreadsheet：[formula_dependency_graph.ts#L7-L42](https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/evaluation/cell_evaluation/formula_dependency_graph.ts#L7-L42)、[evaluator.ts#L60-L272](https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/plugins/evaluation/cell_evaluation/evaluator.ts#L60-L272)。

**Grist 的整欄公式**（[data-engine 深入分析](deep-dives/gristlabs__grist-core__data-engine.md)）：每個公式欄被產生成 `def 欄名(rec, table): ...`，`$Price` 只是 `rec.Price` 的簡寫；每開一份文件就起一個 Python 行程，把資料整份讀進記憶體；重算時改資料只「標髒」，整批動作套完才統一計算，碰到需要的格子還沒算好就丟 `OrderError` 重新排序。**預設部署是 `unsandboxed`（直接用主機 Python 跑使用者公式，等於沒防護）**，要自己設 `GRIST_SANDBOX_FLAVOR` 成 `gvisor`／`pyodide` 等。引擎可以純 Python 單獨驅動，姊妹專案 grist-static 已把它包成 wheel 用 Pyodide 在瀏覽器 Web Worker 跑。程式碼：[engine.py#L327-L380](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L327-L380)、[codebuilder.py#L98-L204](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L98-L204)。

**Teable 的公式→SQL**（[backend 深入分析](deep-dives/teableio__teable__backend.md)）：儲存格的值不是在 JS 裡算，而是翻成 PostgreSQL SQL 交給資料庫算；v2 把公式編成「運算式圖→SQL」（共用子運算式變成 MATERIALIZED CTE），並附 2,268 筆 SQL 快照測試。這塊 `packages/v2/formula-sql-pg` 是 MIT，翻譯器入口：[FormulaSqlPgTranslator.ts#L147-L180](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/formula-sql-pg/src/FormulaSqlPgTranslator.ts#L147-L180)。

**函數數量為什麼不能直接比**：各資料包的算法不同，見下表。真要比，請用你**實際會用到的函數清單**（VLOOKUP／XLOOKUP／SUMIFS／TEXTJOIN／ROUND／IFERROR／TEXT…）逐一去試。

| 專案 | 資料包的數字 | 怎麼數／備註 |
|---|---|---|
| Univer | 517（總覽包）／538（深入包）；兩者都說有計算邏輯的是 511 | 差異在 21 個「佔位空殼」是否算註冊，見 6.3 |
| ONLYOFFICE | 483 實作／500 註冊 | 17 個 `NotRealised`（CUBE*、FORECAST.ETS*、PHONETIC、RTD…） |
| GridCraft | 約 515 | 正規式掃出 492 個不重複名稱後調整，細節見資料包 |
| IronCalc | 497（含 37 個舊版相容名） | 現代函數約 460 |
| OfficeCLI | 461／463（含 LET、LAMBDA） | 函數名稱數 |
| Luckysheet | 375 定義／374 實作 | 說明清單 `functionListDescriptor.js` |
| FortuneSheet | 說明清單 371 | 實際可計算數❓ |
| HyperFormula | 355（類 Excel）／370（含 HF.*）／423（含 53 個別名） | Handsontable 資料包另算 367 實作＋53 別名≈406 一般用 |
| Jspreadsheet CE | ❓（外部套件宣稱 403） | 原始碼不在 GitHub，無法驗證 |
| o-spreadsheet | 336 | `module_*.ts` 的匯出常數 |
| Grist | 148 實作（+REQUEST） | 9 個模組共宣告 230，其中 82 個 `@unimplemented` |
| Teable | 81（v1）／83（v2） | `FunctionName` 列舉 |
| APITable | 82 名稱／81 實作 | `ISERROR` 與 `IS_ERROR` 同實作 |
| NocoDB | 70 | `formulas.ts` 頂層鍵 |
| AG Grid | 20 名稱／18 實作（企業版） | — |
| x-spreadsheet | 8 | 另有 3 個被註解掉 |

### 3.3 資料模型（也決定了怎麼存進 Firestore）

| 專案 | 資料模型 | 存進 Firestore（或你的資料庫）的注意 |
|---|---|---|
| Univer | 純 JSON `IWorkbookData`：集中樣式表 `styles`、稀疏矩陣 `cellData[列][欄]`（`v` 值、`t` 型別、`f` 公式、`s` 樣式）、`resources` 放外掛資料；定義見 [typedef.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/typedef.ts#L32-L342) | `fWorkbook.save()` 取 JSON，`JSON.stringify` 成字串欄位；超過 ~800 KB 改存 Cloud Storage；用 debounce 自動存檔。repo 內完全沒有 Firebase 程式碼 |
| ONLYOFFICE | 記憶體內每張表按欄存成 `ArrayBuffer`，每格固定 16 bytes（[SheetMemory.js#L45-L62](https://github.com/ONLYOFFICE/sdkjs/blob/9d2138866d929be32f1d107e8b5bfae36156e097/cell/model/SheetMemory.js#L45-L62)）；對外是 .xlsx 檔 | **存檔案、不存 JSON**：.xlsx 放 Firebase Storage，Firestore 只放 metadata；callback 狀態 2／6 時下載新檔 |
| o-spreadsheet | JSON（demo 稱 OSHEET），有版本號與自動遷移（`src/migrations/`） | `JSON.stringify(model.exportData())` 存字串；單文件 1 MiB 上限，大表改存 Cloud Storage |
| IronCalc | 內部是 bitcode 二進位（`.ic`），也可 xlsx | 不建議直接存 Firestore；存 `.ic`／xlsx 位元組到 Storage |
| HyperFormula | 二維陣列 `RawCellContent[][]`，字串以 `=` 開頭為公式 | Firestore 不能存「陣列裡的陣列」，要轉成物件或字串 |
| Luckysheet | 工作表陣列，`data` 二維陣列＋`celldata`；圖片 base64 內嵌 | 不要存二維 `data`，用 `getAllSheets()` 補上 `celldata`；圖片改存 Storage |
| Jspreadsheet CE | 二維陣列＋以 A1 為鍵的樣式／合併／註解物件 | 同樣不能直接存二維陣列；`type: 'image'` 只吃 base64，別存 Firestore |
| x-spreadsheet | `getData()` 回傳工作表陣列 | `onSnapshot` 整份覆蓋，後寫的人蓋掉先寫的人 |
| Glide／AG Grid／Handsontable | 沒有自己的文件格式，資料是你的陣列（物件陣列最自然） | 每列一個 Firestore 文件、`getRowId` 對應文件 ID；變更事件寫回 |
| Grist | 每份文件一個 SQLite 檔；欄位定義在 `_grist_Tables*` 中繼表 | 後端不能換 Firestore；用 webhook→Cloud Function 同步，或定時 `GET /records` |
| Teable | 真正的 PostgreSQL 資料表（每 Base 一個 schema、每表一個實體表） | 只支援 Postgres；只拆 Grid 時在 `getCellContent` 讀 Firestore 快取、`onCellEdited` 寫回 |
| NocoDB | 每張表是真 SQL 表；中繼資料另放 `nc_*_v2` 表 | webhook→Cloud Function，或用 v3 `records/upsert` |
| APITable | JSON 快照；MySQL 一筆紀錄一列 JSON | 官方不支援；建議不搬資料，用 Fusion API 讀寫 |
| OfficeCLI／GenOffice／GridCraft | 檔案本身（OOXML／xlsx） | OfficeCLI 可用 `dump` 產生可重播的批次指令 JSON；GridCraft 與 ONLYOFFICE 一樣建議存 xlsx 到 Storage |

> 「Firestore 單文件 1 MiB、不能陣列套陣列」是各資料包引用的 Firestore 一般規則，不是各 repo 的內容。

### 3.4 協作機制

| 專案 | 機制 | 衝突處理 | 需要的伺服器 | 開源版有嗎 |
|---|---|---|---|---|
| ONLYOFFICE | 鎖（範圍／物件／工作表三類）＋變更紀錄，socket.io；有「快速」與「嚴格」兩種模式 | 鎖定避免衝突；有人插刪列欄時，伺服器會幫其他人重算鎖的座標 | DocumentServer 本身，**不能用 Firebase Realtime DB 取代** | ✅（社群版 v9.4 起單一行程、全記憶體；「20 人」限制已變動，見 6.3） |
| o-spreadsheet | OT（Operational Transform），依 revision 排序；撤銷是「選擇性復原」只撤自己的 | 轉換（[ot.ts#L59-L95](https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/collaborative/ot/ot.ts#L59-L95)） | 任何能「原子比對 revisionId→寫入→廣播」的服務；範例 Node＋WebSocket **無驗證、CORS `*`，不能直接上線** | ✅（資料包提出用 Firestore transaction 實作的思路，**未驗證**） |
| Grist | 伺服器集中序列化（每份文件一個 Mutex，[Sharing.ts#L46-L60](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/Sharing.ts#L46-L60)），WebSocket 廣播 | 一份文件的動作逐一套用，不是 OT／CRDT；**沒有離線編輯** | Grist 伺服器 | ✅ |
| Teable | ShareDB pub/sub，但格子編輯走 HTTP `PATCH`，伺服器提交後自己組 json0 op 廣播；`ShareDbAdapter.commit()` 直接丟「Method not implemented」，op 不落地 | 實質是**後寫的蓋掉先寫的** | Node＋PostgreSQL（多台需 Redis） | ✅（[share-db.service.ts#L61-L77](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.service.ts#L61-L77)；apps 為 AGPL） |
| APITable | OT（json0）：socket.io 送 changeset（帶 baseRevision），room-server 用 Redis 鎖＋transform＋revision 檢查 | 轉換 | room-server＋Redis＋MySQL＋RabbitMQ | ✅ |
| Univer | Command→Mutation→（Pro 的）OT；開源有插座（`onMutationExecutedForCollab`、`fromCollab` 旗標、`IChangeset` 型別） | 開源只有「陽春同步」範例：用 WebSocket 廣播 mutation、對方以 `fromCollab: true` 套用，**沒有 OT**，兩人同時插列會不一致 | Pro：協作 client／service 在閉源套件 | 💰 |
| Luckysheet／FortuneSheet | 本地操作→廣播 op→他人套用 | **後到覆蓋**；同時插列可能錯位（未實測） | 自備 WebSocket（Luckysheet 官方 Java 版、FortuneSheet 範例 Node＋ws＋MongoDB） | ⚠️ 陽春 |
| IronCalc | 只有 `flushSendQueue()`／`applyExternalDiffs()` 交換 diff 的零件 | 沒有鎖、沒有 OT／CRDT | 沒附伺服器 | ❌（只有零件） |
| NocoDB | 社群版 socket 只送遙測；EE 才有 | 每次編輯 PATCH 單列，最後寫入者覆蓋 | — | 💰 |
| Handsontable／AG Grid／Glide／Jspreadsheet／x-spreadsheet／HyperFormula／GridCraft／OfficeCLI／GenOffice | 沒有 | 自己用 Firestore `onSnapshot`＋寫入，最後寫入者贏 | — | ❌ |

**給你的實務結論**：多人同時編輯在 Firebase 上是整個比較裡最難的一塊。Univer 深入分析（[oss-vs-pro](deep-dives/dream-num__univer__oss-vs-pro.md)）的建議是先做「**單人編輯＋鎖定**」，或「一人編輯、多人觀看／每人負責不同工作表」；真要 OT 就看 o-spreadsheet（開源）或買 Univer Pro。

### 3.5 xlsx 處理的三種架構

| 路線 | 做法 | 代表 | 保真度 |
|---|---|---|---|
| A. 伺服器轉成自家格式 | C++ 轉檔器 x2t 把 xlsx 轉成自家二進位（簽名 `XLSY`），瀏覽器只讀寫這種二進位；存檔時由伺服器組回 xlsx | ONLYOFFICE | 開源中最高的一群（資料包說法，core 未掃，❓） |
| B. 解析成自家 JSON 模型 | 讀 XML→內部模型→再寫出；模型裝不下的東西會遺失 | SheetJS、o-spreadsheet、IronCalc、Handsontable、Teable／NocoDB／Grist／APITable（資料庫型：只取值） | 值與公式字串尚可；外觀（樣式、條件格式、驗證、圖表、樞紐）視模型而定 |
| C. 直接改 OOXML，未動的部分原樣保留 | 不經過轉換 | OfficeCLI（DocumentFormat.OpenXml 3.4.1）、GenOffice（未改動 ZIP 項目逐位元組保留） | 最適合「改別人排好版的範本」 |

SheetJS 的保真度邊界最值得記：**資料（值、公式字串、數字格式、合併、欄寬、超連結、註解）高；外觀（字型、顏色、框線、條件格式、資料驗證、圖表、圖片、樞紐、凍結窗格）讀→寫來回後會遺失**，也就是官方 Pro 賣的「Edit complex templates」。README 說明：[README#L7-L10](https://github.com/SheetJS/sheetjs/blob/515d1c6f2e1d3ca422ee9198b177cfd926434936/README.md#L7-L10)。

### 3.6 Claude／AI 的接入面

| 專案 | 現況 | 對你的意義 |
|---|---|---|
| GenOffice | Claude 是一等公民（供應商清單含 `claude-sonnet-5-5` 預設）；系統提示詞要求「先讀再寫、用公式不要心算、數字回讀、儲存格內容視為不可信資料」；`genoffice mcp`（stdio）28 個工具；AI 輸出要過 zod 驗證、版本衝突檢查、整批套用且可復原 | 目前最完整的「Claude 改 Excel」範本；桌面 App，不能嵌網頁 |
| OfficeCLI | MCP 只暴露一個工具 `officecli`（參數是命令）；內建「交付前檢查」`validate`→`view issues`→`view screenshot` 自我修正；`officecli install` 會把 SKILL.md 裝進 `~/.claude/skills` | 讓 Claude 產出正式報表／報價單的後端工具 |
| GridCraft | MCP 原生（`read_range`／`write_range`／`set_cell`／`get_cell`），文件直接寫 `claude mcp add gridcraft -- gridcraft-cli mcp` | 無視窗或連到桌面視窗兩種模式；大量 AI 生成程式碼，長期維護是風險 |
| NocoDB | **社群版就有 MCP**（13 個工具：查表結構、查／增／改／刪紀錄、連結等） | 授權限內部使用，做內部資料庫剛好 |
| Grist | 社群版有舊版「AI 公式助手」（OpenAI 格式，可經 OpenRouter 換 Claude）；**MCP 伺服器屬完整版**，grist-core 只留插座；開源版建議用 REST API 自寫 MCP | `get_formula_prompt()` 把表結構翻成「型別化 Python stub」交給 LLM 補完，這招可借到自己的系統 |
| Univer | 開源核心**無 AI**；周邊有 `univer-sdk-skills`（4 個 Skill，Apache-2.0）、Node 無頭執行＋Facade API；官方 MCP 是雲端 `mcp.univer.ai`（要 API key），瀏覽器橋接外掛是 Pro | 可自己用 Facade API 寫 MCP 給 Claude 呼叫 |
| univer-workspace | `uvw` CLI＋Skill，README 明寫給 Claude 等既有 agent 用；內建 Agent 底層是 DeepSeek Harness，是否支援 Claude❓ | 範本價值高，但依賴 Pro |
| ONLYOFFICE | 9.x 起內建 AI 外掛，伺服器代理已處理 Anthropic 標頭；10.0 ROADMAP 提到 MCP 與網路搜尋 | AI 外掛本體在另一個 repo，prompt 內容❓ |
| o-spreadsheet | 無 AI；repo 有給開發者用的 `CLAUDE.md` 與 2 個 Skill；`model.dispatch(...)` 命令有 TypeScript 型別，適合當 Claude 的 tool schema | 「Claude 產 JSON 整張表」或「Claude 發 dispatch 命令」兩條路 |
| AG Grid | 企業版 AI Toolkit 只給 JSON Schema；有 `npx ag-mcp`、`npx skills add ag-grid/skills`（明列給 Claude Code） | 用 Claude Code 寫表格時裝 Skill 可減少寫錯舊版 API |
| Handsontable／HyperFormula | 產品無 AI；官方有給 Claude Code 的 Skills 外掛（`handsontable-skills`） | **風險提醒**：Handsontable repo 的 `.mcp.json` 設了 ClickUp、GitHub 等內部 MCP，clone 後用 Claude Code 開啟請拒絕啟用 |
| Teable | 支援 17 種供應商（含 Anthropic）；社群版只有「AI 寫公式」；AI 欄位執行端與 MCP 本體在本 repo 找不到 | — |
| 其餘（Luckysheet、FortuneSheet、x-spreadsheet、Jspreadsheet、Glide、IronCalc、SheetJS、APITable） | 無 AI／MCP | 都可自行用 Cloud Function 呼叫 Claude API（**API Key 絕不放前端**）；Luckysheet 的 `ASK_AI` 是假的（寫死示範資料），且原始碼含 base64 編碼的 Airtable Token |

**「`=CLAUDE(...)` 公式」可不可行**：公式多半同步計算。Univer 有 `registerAsyncFunction` 最自然；o-spreadsheet 可照文件「連外部 API」章節寫 `EvaluationPlugin`＋快取（第一次回「Loading...」）；HyperFormula 不支援非同步；x-spreadsheet 每次重繪都重算，硬做會每次捲動就打一次 API。

---

## 4. 依情境推薦

> 前提：你的倉儲系統是純 JavaScript、放在 Firebase Hosting；Hosting 只放靜態檔，跑不了 Docker 或 .NET 執行檔，需要伺服器的專案要另外租 VPS 或用 Cloud Run。以下「首選」是依資料包的證據排序，**不是實測結果**。

### 4.1 只要在倉儲系統裡加一個可編輯表格

| 候選 | 適合時機 | 取捨 |
|---|---|---|
| **Jspreadsheet CE**（首選） | 今天就要嵌進去；批次改庫存、成本試算 | MIT、純 JS、gzip 約 34 KB（另加 jsuites 與 formula）；Firestore 載入商品、逐格存回的範例資料包已附。限制：DOM 渲染，建議數千到一兩萬列；沒有 xlsx、跨工作表公式、條件格式；浮點誤差記得 `ROUND`；沒有繁中語系（要自己翻） |
| **AG Grid 社群版** | 資料量大、要強篩選／排序／分組；用 `valueGetter` 算毛利 | MIT、虛擬捲動、有繁中；**貼上多格、拖拉填滿、xlsx 匯出、公式都是企業版**；企業版放公開網址要買授權 |
| **Handsontable** | 要最像 Excel 的手感（公式、貼上、拖拉、xlsx 匯出） | 功能最完整，但**自家營運依條文算商用，需買授權**（見 5.2）；xlsx 匯入尚未發佈 |
| **Glide Data Grid** | 要 Canvas 級的超快；想抄它的貼上解析 | MIT，但要 React、沒有公式、沒有繁中 UI、沒有篩選；中文輸入法直接打字有問題（資料包第 9 節） |
| 不建議 | x-spreadsheet（停更、排序不可用）、Luckysheet（停止維護） | 只適合學原理 |

要公式：Jspreadsheet CE 內建的 Basic 公式引擎夠簡單成本計算；進階就外接 HyperFormula（GPL）或 IronCalc（MIT／Apache）。要 xlsx：外接 SheetJS。

### 4.2 要完整 Excel 體驗

| 路線 | 首選 | 重點 |
|---|---|---|
| 自架伺服器、相容度最高 | **ONLYOFFICE** | 483 個函數、圖表、樞紐、條件格式、資料驗證、多人協作、xlsx 保真度高，全在社群版。代價：Docker 部署（建議 4 GB RAM／雙核，為資料包推估）、JWT 簽發與 callback 必須在後端（例如 Cloud Functions）、AGPL、社群版沒有手機網頁編輯器、繁中字型要另掛。深入分析的判斷：「在倉儲 App 某一頁放能打公式的表格」太重；「要檔案高度互通＋樞紐＋多人編輯且願意多架伺服器」很值得 |
| 嵌入元件、要全開源 | **o-spreadsheet** | 336 個函數、24 種圖表、樞紐、31 種驗證、xlsx 匯入匯出、OT 協作**全部開源**（LGPL）。代價：UI 依賴 Owl 3.0.0-alpha.50（升級 API 可能變）、xlsx 要自備解壓、**沒有 CSV**、沒有繁中語系檔、協作要自建伺服器、從 Excel 貼上只保留純文字值、星數僅 298（多半經 Odoo 使用） |
| 嵌入元件、願意補件 | **Univer** | 最完整的前端外殼（外掛式架構、手機版、繁中、511 個函數）。**xlsx、協作、圖表、樞紐要買 Pro 或自己補**：xlsx 用 SheetJS 轉 `IWorkbookData`、圖表用浮動 DOM 掛 ECharts、協作先做單人編輯加鎖定 |

沒有任何一個開源專案在「免費＋嵌入＋圖表＋樞紐＋xlsx＋協作」全拿滿分，o-spreadsheet 最接近，但維運成本在你。

### 4.3 要多人協作

- **要 Excel 式格子**：ONLYOFFICE（鎖，最成熟）、o-spreadsheet（OT，自建伺服器）、Univer Pro（付費）。
- **可接受資料庫型**：[Grist](gristlabs__grist-core.md)（Apache-2.0，伺服器集中序列化，最穩的免費選擇）、[Teable](teableio__teable.md)（ShareDB，但後寫蓋掉）、[APITable](apitable__apitable.md)（OT，但低度維護、AGPL）。NocoDB 社群版沒有即時協作。
- **輕量需求**（兩三個人、各改各的列）：直接在現有 Firestore 上用 `onSnapshot`＋「最後寫入者贏」，搭配任何表格元件（Handsontable／Jspreadsheet／AG Grid／Glide）。Jspreadsheet 資料包提醒：收到別人改動後用 `setValueFromCoords` 更新時也會觸發 `onafterchanges`，要用旗標避免寫回迴圈。
- 不要被「有協作」騙了：Luckysheet、FortuneSheet 是「廣播後到覆蓋」，不是真的協作。

### 4.4 要讓 Claude 讀寫

分三層看你要 Claude 動哪裡：

1. **動檔案（xlsx）**：OfficeCLI（MCP＋Skill，直接改 OOXML 保留外觀，含樞紐與圖表）、GenOffice（`genoffice mcp` 28 個工具，AI 修改整批可復原）、GridCraft（MCP，約 515 函數）。IronCalc 資料包建議的另一招：自寫一個小 MCP（`set_cell`／`get_cell`／`evaluate`／`export_xlsx`），**讓 Claude 寫公式、由 IronCalc 算出正確數字，避免 LLM 算術出錯**。
2. **動資料庫**：NocoDB（社群版 13 個 MCP 工具；授權限內部）、Grist（REST `/records`、`/apply`、`/sql`；官方 MCP 在完整版，完整版對年資金低於 100 萬美元的組織免費但需啟用金鑰）、Teable（REST＋oRPC）、APITable（Fusion API）。
3. **動網頁上的表格 UI**：Univer（Node 無頭執行＋Facade API、`univer-sdk-skills`）、o-spreadsheet（`model.dispatch`）；Handsontable／Jspreadsheet／Glide／AG Grid 則是 `getData()`→Cloud Function→Claude→`setDataAtCell`／`setRowData` 批次寫回。

注意事項：(1) API Key 一律放後端；(2) GenOffice 把儲存格內容視為不可信資料（防 prompt injection），自己做時照辦；(3) 「Claude 產生整張表」最直接的是 o-spreadsheet（輸出 `sheets[].cells` JSON 後 `new Model(json)`）或 Univer（`createWorkbook` 的 JSON）。

### 4.5 要處理 .xlsx 檔

| 需求 | 建議 | 備註 |
|---|---|---|
| 匯入供應商報價單成資料 | **SheetJS**（`sheet_to_json`）；大檔／伺服器端可看 Teable 的 `packages/v2/import`（MIT，串流解析 xlsx／xls／XML／HTML，用 `yauzl`、`saxes`） | SheetJS 內建 Big5（需 full 版＋`codepage:950`）；解析 10 萬列速度未實測，可用 `sheetRows`、Web Worker、`dense` 模式 |
| 匯出簡單報表（值＋欄寬） | SheetJS | 免費版寫不出字型／顏色／框線 |
| 匯出有樣式的報表 | Handsontable＋ExcelJS（有授權問題）、Grist／NocoDB 的 ExcelJS 匯出（僅值＋數字格式）、o-spreadsheet `exportXLSX()`、OfficeCLI／GenOffice（讓 Claude 產出）、Univer Pro | 資料包多處提到 ExcelJS，但它本身不在這 21 份資料包內，未單獨評估 |
| 改別人排好版的範本又不破壞外觀 | **OfficeCLI**、**GenOffice** | SheetJS 免費版做不到（這是 Pro 的賣點） |
| 在瀏覽器裡完整讀寫、算公式 | **IronCalc**（`@ironcalc/wasm-xlsx`；圖表／樞紐／驗證／圖片會遺失，測試用約 225 個在 Excel 裡算好的對照檔） | 沒有事件回呼，只能輪詢 `flushSendQueue()` |
| 網頁上直接開啟、編輯真 xlsx | **ONLYOFFICE** | 需 Docker 伺服器 |

**SheetJS 安裝陷阱**：GitHub 這份已停更（master 停在 0.18.12，2022-10），新版放在 `cdn.sheetjs.com`。資料包的說法是「npm 上的 `xlsx` 最後一版停在 0.18.5」，這是「就我所知」，未驗證；卡片建議「從 SheetJS CDN 安裝新版」，理由是舊版 `npm audit` 會報弱點。**新版內容與授權是否仍是 Apache-2.0，資料包都未確認**（依規定沒有連線）。

### 4.6 要最省事、直接用現成產品

| 產品 | 適合 | 提醒 |
|---|---|---|
| **Grist**（首選） | 進銷存、成本／比價後台：Python 公式、Reference 欄做跨表、REST／webhook 接 Firebase | Apache-2.0。公式是整欄 Python，缺不少 Excel 函數（COUNTIF、XLOOKUP…）；沒有拖拉填滿；繁中約 45%；預設沙盒關閉；Docker 請用 `gristlabs/grist-oss` 映像確保全開源 |
| NocoDB | 最快上手的 Airtable 風格、需要 MCP 給 Claude | 授權限自家內部；**社群版沒有復原（undo）**、條件格式與即時協作是付費；xlsx 匯入保真度低 |
| Teable | 要 PostgreSQL、要 ShareDB 協作 | Node＋PostgreSQL＋Redis（Redis 不能省）；AI 欄位、App Builder 要付費；沒有 xlsx 匯出 |
| ONLYOFFICE | 要「開 Excel 檔直接編輯」 | 見 4.2 |
| APITable | — | 開源 repo 為低度維護，僅在「想要免費自架 Airtable」時參考 |

### 4.7 A＋B＋C 組合配方（給之後用 Claude Code 自己做工具）

| 配方 | 組成 | 授權狀態 | 缺什麼 |
|---|---|---|---|
| ① 最小風險的倉儲表格 | Jspreadsheet CE（畫面）＋ SheetJS（xlsx）＋ Firestore | 全是 MIT／Apache-2.0，可商用 | 協作、條件格式、跨表公式、圖表 |
| ② Excel 手感、授權乾淨 | Univer（畫面＋公式，Apache-2.0）＋ SheetJS 轉 `IWorkbookData` ＋ `save()` JSON 存 Firestore ＋ Cloud Function 呼叫 Claude | 乾淨 | 圖表（浮動 DOM 掛 ECharts）、協作、高保真 xlsx、套件較重 |
| ③ 公式正確性優先的成本計算 | IronCalc wasm 或 HyperFormula（引擎）＋ Glide／AG Grid（畫面）＋ Claude 產公式字串 | IronCalc 乾淨；HyperFormula 要處理 GPL；Glide／AG Grid 社群版 MIT | 要自己接資料流（`setCellContents`／`valuesUpdated`） |
| ④ Claude 產正式報表 | OfficeCLI（MCP＋Skill）＋ 倉儲系統匯出 JSON | Apache-2.0 | 需在你電腦或 Cloud Run 跑執行檔，Firebase Hosting 放不了 |
| ⑤ 內部資料庫型後台 | Grist（Apache-2.0）＋ webhook→Cloud Function→Firestore，或 NocoDB（內部用）＋ MCP | Grist 乾淨；NocoDB 只限內部 | 不是 Excel；跨表靠關聯欄 |

想從資料庫型專案借東西：Teable 的 MIT `packages/`（Canvas Grid、`packages/formula`、`packages/v2/import`、`formula-sql-pg`）最乾淨；Grist 值得借貼上 HTML 解析（`parsePasteHtml`）、批次送出（`BundleSender`）、exceljs 匯出（`ExcelFormatter`）；NocoDB 的程式碼與授權綁太緊，只借想法。

---

## 5. 授權地雷整理

> 個人用大多沒問題。但你是**用在自己公司營運的小老闆**：資料包的卡片多半寫「個人使用」，而 Handsontable 的條文把「自家營運」定義為商業用途，所以「個人」和「公司營運」要分開看。以下是白話整理，不是法律意見。

### 5.1 一覽表

| 專案 | 授權 | 個人用 | 公司商用要注意 | 風險 |
|---|---|---|---|---|
| Univer | Apache-2.0（核心）＋閉源 Pro | ✅ 免費、可閉源 | 保留版權與 LICENSE（內嵌 numfmt 為 MIT 也要保留）；xlsx、協作、圖表、樞紐、列印、走勢圖、伺服器端計算屬 Pro，價格❓ | 低；功能邊界是重點 |
| univer-workspace | Apache-2.0（repo）＋Pro SDK 商業授權 | ⚠️ 僅 localhost／127.0.0.1／app 順利；內建 90 天開發憑證（2027-02-03 到期） | 換成自己網域會被協作端點拒絕（403／9018）；合計依賴 106 個 `@univerjs-pro/*` 套件；無授權時免費額度為 1 協作節點、3 同時編輯連線、每月 10 次匯出 | **高**：不能當免費自架產品 |
| Handsontable | 自訂雙授權（非開源） | ⚠️ `licenseKey: 'non-commercial-and-evaluation'` 僅限個人或評估 | **小生意自家營運依條文屬商業用途，需購買商業授權**（價格❓）；從 18.1 起沒填或填錯金鑰，畫面被關不掉的遮罩鎖住；不得用它開發與之競爭的軟體（拆原始碼做自己的表格引擎不行）；新版「權益金鑰」可能只開部分功能 | **高** |
| HyperFormula | GPL-3.0 或商業 | ✅ 填 `licenseKey: 'gpl-v3'` 免費用全部功能（不填則公式全變 `#LIC!`） | 前端會把 JS 散布給使用者，選 GPL 則與它結合的前端程式碼須以 GPL 開源；不想開源要買商業授權（價格❓）；3.5.0 起商業金鑰可分級（未買的函數群組回 `#LIC!`，GPL 金鑰不受限）。**在 Handsontable 內使用不必另買**（內部金鑰 `internal-use-in-handsontable`） | **高**（對外商用時） |
| NocoDB | Sustainable Use License 1.0（非 OSI 開源） | ✅ | **僅限自家公司內部業務**；不可轉賣、不可包成 SaaS 或付費服務；拆出的程式碼（含 `nocodb-sdk`）同受限；復原、即時協作、條件格式、AI 等屬付費 EE | 中：內部用安全，產品化不行 |
| ONLYOFFICE | AGPL-3.0＋第 7 條附加條款 | ✅ 不改碼幾乎沒義務 | 社群版建議 20 人內；改了程式碼又透過網路提供他人，須公開修改後原始碼、標示「基於 ONLYOFFICE」、介面顯示法律聲明；不得用其商標或去品牌（白牌僅 Developer 版）；叢集、手機網頁版、Automation API、Document Builder 屬付費；把 sdkjs 程式碼抽進自己產品會帶入 AGPL | 中 |
| Teable | 混合：`apps/` AGPL＋品牌保護；`packages/` MIT | ✅ | 內部使用可；改了 `apps/` 又對外提供網路服務須公開原始碼，且**不得移除或替換 Teable 品牌與 Logo**；只拆 `packages/`（Canvas Grid、公式、匯入器）可商用閉源；AI 對話、App Builder 等要付費 | 中（拆零件則低） |
| APITable | AGPL-3.0＋付費 Embedding／企業版 | ✅ | 改碼後對外提供或把碼抄進自己產品須以 AGPL 公開；嵌入頁拿掉「Powered by APITable」要買嵌入授權；AI、SSO、稽核、Embed 產生器是閉源企業版 | 中 |
| AG Grid | 社群 MIT＋企業商業 EULA | ✅ 社群完全免費；企業版僅 localhost 測試（無金鑰會浮水印＋主控台警告） | 企業版放公開網址需依開發者人數與部署方式購買永久授權（含一年更新，價格 repo 內未載）；企業版原始碼不可拆出再利用 | 低（只用社群版） |
| o-spreadsheet | LGPL-3.0-or-later | ✅ | 可嵌進閉源商用系統、可收費；**修改了 o-spreadsheet 本身的檔案，修改部分要以 LGPL 公開**；建議只用 `addFunction`、plugin、registry 擴充點。沒有付費版 | 低；別改原檔 |
| Grist | Apache-2.0（但預設安裝／Docker 映像附非開源完整版） | ✅ | 保留 LICENSE／NOTICE；MCP 伺服器、新版 AI Assistant、Automations、SSO、通知信屬完整版，對年資金低於 100 萬美元的組織免費但需啟用金鑰；建議用 `gristlabs/grist-oss` 映像 | 低 |
| SheetJS | Apache-2.0（Pro 另售） | ✅ | 保留 LICENSE，改過的檔案要註明；商標不能當產品名；樣式寫入、公式計算、圖片、圖表、樞紐屬閉源 SheetJS Pro（價格❓）；npm 版本問題見 4.5 | 低 |
| Jspreadsheet CE | MIT | ✅ | 保留版權與授權文字；公式引擎 Basic 版標示 MIT，但**原始碼不在 GitHub（只有 README）**，無法審查；Premium 公式綁網域；跨工作表計算、通用資料驗證、儲存格層級格式等屬 Jspreadsheet Pro（另一個閉源產品） | 低 |
| Glide Data Grid | MIT | ✅ | 保留版權；若搭配 HyperFormula 要另外處理其 GPL | 低 |
| Luckysheet | MIT | ✅ | 保留 MIT；打包的 jQuery 2.2.4（已停止支援，有已知 CVE，屬一般知識未在資料包驗證）、lodash、內嵌 SheetJS SSF（Apache-2.0）授權聲明要一併附上。**原始碼內含 base64 編碼的 Airtable Token**（`GET_AIRTABLE_DATA`），別直接上線 | 低（授權）／中（安全） |
| FortuneSheet | MIT（含 fork 自 handsontable/formula-parser 的 MIT 解析器） | ✅ | 保留授權；xlsx 外掛 FortuneExcel 是第三方 repo，**授權未確認** | 低 |
| x-spreadsheet | MIT | ✅ | 保留著作權聲明；搭 SheetJS 要另附其 Apache-2.0 聲明 | 低（但已停更） |
| IronCalc | MIT 或 Apache-2.0（任選） | ✅ | 保留版權與授權（含 CLDR 的 Unicode License 與字型 OFL 聲明）；可閉源、可做 SaaS | 低 |
| GenOffice | Apache-2.0（`ee/` 目錄另有企業授權但目前是空的） | ✅ | 保留 LICENSE／NOTICE 並標註修改；底層 Univer 只用開源 preset，刻意避開 `@univerjs-pro` | 低 |
| OfficeCLI | Apache-2.0 | ✅ | 保留 LICENSE／NOTICE；Excel 預覽的虛擬捲動是私有實作、外掛可為閉源商業版（是否收費❓）；第三方依賴（OpenXML SDK、System.CommandLine、.NET Runtime）皆 MIT | 低 |
| GridCraft | MIT 或 Apache-2.0 | ✅ | 選 Apache-2.0 須保留 NOTICE；**ArtCraft 名稱與 `docs/brand` 標誌是商標，不在授權內**，fork 要移除 | 低（授權）／中（維護） |

### 5.2 最容易踩的幾個

1. **Handsontable**：卡片寫「個人使用免費」，但資料包分析條文後的結論是：你用在公司營運（含小生意倉儲系統）依條文就是商業用途，正式上線要買。目前自己評估、試用沒問題；**不要把它的原始碼拆去做自己的表格產品**（禁止競爭條款）。
2. **HyperFormula 的 GPL**：自用、內部用、不對外散布，GPL 義務通常不觸發；但網頁前端會把 JS 交到使用者手上，「員工／客戶透過瀏覽器使用」算不算散布，請在對外前先問懂的人。
3. **NocoDB 的「內部使用」**：管自己的庫存、價格可以；之後若要把它包成服務賣給別人，不行。
4. **AGPL 家族（ONLYOFFICE／Teable／APITable）**：只自己或公司內部用、不改碼，幾乎沒負擔；一旦「改碼＋透過網路給外部人用」就要公開修改後的原始碼，而且 Teable、ONLYOFFICE 還有品牌／商標限制。想拆零件時只拆 Teable 的 MIT `packages/`。
5. **Univer 的 Pro 邊界**：套件名稱會騙人，`@univerjs/preset-sheets-advanced`、`@univerjs/preset-sheets-collaboration` 掛著開源前綴，但開源 repo 裡找不到任何引用，實際是 Pro。判斷標準是「在不在開源 repo 裡」，不是 npm 名稱。Pro 是混淆過的閉源程式＋授權金鑰。
6. **univer-workspace**：技術上很值得讀，但它是「Pro 怎麼組裝」的參考實作，**不是可以免費自架上線的產品**；要嵌進自己系統請改用開源 Univer 套件，別整套搬。
7. **SheetJS 的來源**：授權沒問題，但「從哪裡裝」會決定你拿到的是不是有安全修補的版本。
8. **星數不等於可用**：Luckysheet（停止維護）、x-spreadsheet（停更）、APITable（低度維護）星數都高；GridCraft、GenOffice 星數暴增但都是新專案。

---

## 6. 資料來源

### 6.1 21 份資料包

| 資料包 | 備註 |
|---|---|
| [ONLYOFFICE__DocumentServer.md](ONLYOFFICE__DocumentServer.md) | |
| [SheetJS__sheetjs.md](SheetJS__sheetjs.md) | 掃描的是 master 分支 515d1c6（預設分支 `github` 3f44ddd 只剩說明檔） |
| [ag-grid__ag-grid.md](ag-grid__ag-grid.md) | |
| [apitable__apitable.md](apitable__apitable.md) | |
| [dream-num__Luckysheet.md](dream-num__Luckysheet.md) | |
| [dream-num__univer-workspace.md](dream-num__univer-workspace.md) | |
| [dream-num__univer.md](dream-num__univer.md) | 固定在 commit c13b042（版本 1.3.1） |
| [genspark-ai__genoffice.md](genspark-ai__genoffice.md) | 使用 Univer 0.25.1 |
| [glideapps__glide-data-grid.md](glideapps__glide-data-grid.md) | |
| [gristlabs__grist-core.md](gristlabs__grist-core.md) | |
| [handsontable__handsontable.md](handsontable__handsontable.md) | |
| [handsontable__hyperformula.md](handsontable__hyperformula.md) | |
| [iOfficeAI__OfficeCLI.md](iOfficeAI__OfficeCLI.md) | |
| [ironcalc__IronCalc.md](ironcalc__IronCalc.md) | |
| [jspreadsheet__ce.md](jspreadsheet__ce.md) | |
| [myliang__x-spreadsheet.md](myliang__x-spreadsheet.md) | |
| [nocodb__nocodb.md](nocodb__nocodb.md) | |
| [odoo__o-spreadsheet.md](odoo__o-spreadsheet.md) | |
| [ruilisi__fortune-sheet.md](ruilisi__fortune-sheet.md) | |
| [storytold__gridcraft.md](storytold__gridcraft.md) | |
| [teableio__teable.md](teableio__teable.md) | |

### 6.2 12 份深入分析

| 深入分析 | 主要用在本文 |
|---|---|
| [dream-num__univer__architecture.md](deep-dives/dream-num__univer__architecture.md) | 外掛架構、Command→Mutation、資料模型、Firestore 接法 |
| [dream-num__univer__formula-engine.md](deep-dives/dream-num__univer__formula-engine.md) | 3.2 公式引擎、函數數、Worker 自訂函數的坑 |
| [dream-num__univer__oss-vs-pro.md](deep-dives/dream-num__univer__oss-vs-pro.md) | 開源與 Pro 邊界、3.4 協作、AI／MCP |
| [dream-num__univer__render-interaction.md](deep-dives/dream-num__univer__render-interaction.md) | 3.1 渲染、手機、貼上、填滿 |
| [ONLYOFFICE__DocumentServer__sdkjs-cell.md](deep-dives/ONLYOFFICE__DocumentServer__sdkjs-cell.md) | 3.1／3.2／3.3 ONLYOFFICE 核心 |
| [ONLYOFFICE__DocumentServer__server-deploy.md](deep-dives/ONLYOFFICE__DocumentServer__server-deploy.md) | 部署、授權、20 人限制、callback 存檔 |
| [gristlabs__grist-core__client-mcp.md](deep-dives/gristlabs__grist-core__client-mcp.md) | Grist 前端、MCP 插座、REST、grist-static |
| [gristlabs__grist-core__data-engine.md](deep-dives/gristlabs__grist-core__data-engine.md) | Grist 公式引擎、沙盒、函數缺口 |
| [nocodb__nocodb__backend.md](deep-dives/nocodb__nocodb__backend.md) | 公式→SQL、API 三代並存、權限、授權 |
| [nocodb__nocodb__grid.md](deep-dives/nocodb__nocodb__grid.md) | Canvas Grid、虛擬化、填滿、貼上 |
| [teableio__teable__backend.md](deep-dives/teableio__teable__backend.md) | 公式→PostgreSQL、ShareDB、v1→v2、MIT 可借部分 |
| [teableio__teable__grid.md](deep-dives/teableio__teable__grid.md) | MIT Canvas Grid、雙畫布、可否單獨拆出 |

另參考 `_oss-research/cards/` 中 `category` 為 `01-web-excel` 的 21 張 JSON 卡片（一句話、技術棧、授權白話、`fit_for_user`）。

### 6.3 資料包之間不一致或未確認的地方

動手前請優先確認這些：

1. **Univer 函數數**：總覽包 517（排除註解掉的 21 個空殼），深入包 538（含 21 個佔位類別、一律回 `#N/A`）。兩者都說真正有計算邏輯的是 511。
2. **HyperFormula 函數數**：總覽包 355／370／423，Handsontable 包算 367 實作＋53 別名、約 406 個一般用。
3. **Grist 的渲染**：總覽包寫 DOM＋GrainJS，深入包更正為 Knockout＋自家 koDom，GrainJS 用在較新介面。
4. **APITable 規模**：README 宣稱 100k+，程式碼寫死每表 5 萬筆（`MAX_RECORD_NUM = 50000`），資料包判定與程式碼矛盾，5 萬列下的流暢度也未確認。
5. **ONLYOFFICE 的「20 人」**：舊版 `license.js` 的連線數為 20；v9.4 起改成不限，改由記憶體守門員限制同時可編輯文件數；但 README 版本比較表仍寫「建議最多 20 位使用者」。
6. **ONLYOFFICE 與 LET／LAMBDA**：深入包在 `cell/` 全目錄搜尋 0 筆，視為沒有；Univer 則有。
7. **Univer 繁中**：Univer 資料包確認 `zh-TW` 語系存在；`locales/zh-TW` 這個 preset 子路徑「由建置時產生，未安裝實測」；univer-workspace 這個 App 本身只有 zh-CN／en-US。
8. **SheetJS 新版**：GitHub 停更，新版在 cdn.sheetjs.com，內容、授權是否變動未確認；「npm 最後一版 0.18.5」是資料包憑記憶，未驗證。
9. **Handsontable 的授權詮釋**：卡片說「個人使用免費」，資料包條文分析說自家營運算商業用途；PDF 條款全文未展開，細節❓。
10. **Teable 的 Grid 來源**：深入包稱前身為 glide-data-grid 5.2.1，但沒開 glide 原始碼比對，屬未確認。
11. **OfficeCLI 的虛擬捲動**：私有檔實作，是否收費未確認。
12. **幾乎所有「10 萬列效能」「套件大小」「手機實際手感」**：資料包都沒有實測。有自量檔案大小的只有 SheetJS（mini 267,314 bytes）、Jspreadsheet CE（`dist/index.js` 148,051 bytes）、x-spreadsheet（`dist/xspreadsheet.js` 202,350 bytes）。
13. **Luckysheet／FortuneSheet 的 xlsx**：Luckyexcel 與 FortuneExcel 都是另一個 repo，兩份資料包都沒掃描，保真度未確認。
14. **所有「建議做法」**（例如用 Firestore transaction 做 o-spreadsheet 協作、用 Cloud Function 轉接 Claude）都是資料包作者的設計建議，**沒有人實際跑過**。
