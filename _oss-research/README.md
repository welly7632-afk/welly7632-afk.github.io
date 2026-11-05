# 開源專案資料包（2026-11-04 掃描）

這裡是 87 個開源專案的程式碼研究資料包，分四類。每個專案一份 Markdown（架構、核心程式碼位置、可以拆出來用的部分、授權、風險），
網頁版 Excel 另有深入分析。之後想把 A、B、C 的優點組合起來做，先看各類的 `00-` 總結，再看個別資料包第 6 節。

- 機器可讀索引：[`index.json`](index.json)（含關鍵字對照 `keyword_map`）
- 每個專案的摘要卡：[`cards/`](cards/)

## 各類總結與組合建議

- [`00-build-blueprint.md`](01-web-excel/00-build-blueprint.md)（網頁版 Excel／試算表）
- [`00-comparison.md`](01-web-excel/00-comparison.md)（網頁版 Excel／試算表）
- [`00-summary.md`](02-price-erp/00-summary.md)（查價・比價・ERP）
- [`00-summary.md`](03-video-script/00-summary.md)（影片・腳本（AI））
- [`00-blueprint.md`](04-agent-rules-skills/00-blueprint.md)（AI 協作規則・角色・技能）
- [`00-summary.md`](04-agent-rules-skills/00-summary.md)（AI 協作規則・角色・技能）

## AI 協作基礎架構範本

- [`04-agent-rules-skills/templates/`](04-agent-rules-skills/templates/)：共用規則（AGENTS／CLAUDE 範本）、角色檔、每日巡檢 skill，安裝方式見該資料夾的 README。

## 網頁版 Excel／試算表

| 專案 | ⭐ | 一句話 | 適合度 | Claude | 個人使用 | 資料包 |
|---|---|---|---|---|---|---|
| [nocodb/nocodb](https://github.com/nocodb/nocodb) | 65,421 | 自架Airtable替代品：試算表介面管SQL資料庫，MCP接Claude | ★★★★ | 原生 | 個人使用：可以免費使用、修改；非商業目的也可免費散布（須保留授權與版權聲明）。 | [看資料包](01-web-excel/nocodb__nocodb.md) |
| [SheetJS/sheetjs](https://github.com/SheetJS/sheetjs) | 36,341 | 純 JS 讀寫 xlsx/csv 的引擎，無試算表 UI、不算公式 | ★★★★★ | 可接 | 個人使用：完全自由，可修改、可複製進自己的倉儲 App，不需付費。 | [看資料包](01-web-excel/SheetJS__sheetjs.md) |
| [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | 33,035 | 給AI讀寫Excel／Word／PPT的單檔CLI，含公式引擎與預覽 | ★★★ | 原生 | 個人使用：完全免費，可改、可自行編譯；第三方依賴（OpenXML SDK、Sys | [看資料包](01-web-excel/iOfficeAI__OfficeCLI.md) |
| [dream-num/univer](https://github.com/dream-num/univer) | 22,883 | 可嵌入網頁的 Canvas 版 Excel，含 500+ 函數公式引擎 | ★★★★★ | 可接 | 個人使用：完全免費，可自由修改、嵌進自己的網頁，不需公開你的程式碼。 | [看資料包](01-web-excel/dream-num__univer.md) |
| [handsontable/handsontable](https://github.com/handsontable/handsontable) | 22,075 | 像 Excel 的 JS 表格元件，含公式、貼上、xlsx 匯出入，非開源授權 | ★★★★ | 可接 | 個人使用：填 licenseKey 'non-commercial-and-ev | [看資料包](01-web-excel/handsontable__handsontable.md) |
| [teableio/teable](https://github.com/teableio/teable) | 21,952 | PostgreSQL 上的資料庫型試算表，附 MIT 授權 Canvas 表格 | ★★★★ | 可接 | 個人使用：可以自由自架、修改，不需付費；只用基本試算表功能不需任何 API Ke | [看資料包](01-web-excel/teableio__teable.md) |
| [dream-num/Luckysheet](https://github.com/dream-num/Luckysheet) | 16,630 | 已停止維護、純 JS 可嵌入的類 Excel 網頁試算表（Univer 前身） | ★★★ | 可接 | 個人使用：完全自由，可修改、複製、拿片段放進自己的倉儲 App。 | [看資料包](01-web-excel/dream-num__Luckysheet.md) |
| [ag-grid/ag-grid](https://github.com/ag-grid/ag-grid) | 15,672 | 最普及的 JS 資料表格，社群版免費，公式填滿貼上匯出 Excel 需付費 | ★★★★ | 可接 | 個人使用：社群版 MIT 完全免費；企業版只允許本機（localhost）測試， | [看資料包](01-web-excel/ag-grid__ag-grid.md) |
| [apitable/apitable](https://github.com/apitable/apitable) | 15,658 | 開源版 Airtable：Canvas 表格＋欄位公式＋OT 即時協作 | ★★★ | 可接 | 個人使用：自己架、自己用完全免費，無限制。 | [看資料包](01-web-excel/apitable__apitable.md) |
| [myliang/x-spreadsheet](https://github.com/myliang/x-spreadsheet) | 14,571 | 純 JS 零依賴 Canvas 網頁試算表，易嵌入易讀，但公式僅 8 個且已停更 | ★★★ | 可接 | 個人使用：完全自由，可修改、複製、拆片段進自己的倉儲 App。 | [看資料包](01-web-excel/myliang__x-spreadsheet.md) |
| [gristlabs/grist-core](https://github.com/gristlabs/grist-core) | 12,046 | Python 公式、SQLite 存檔的自架關聯式網頁試算表伺服器 | ★★★★ | 可接 | 個人使用：完全免費、可自架、可修改，無人數限制；建議用 gristlabs/gr | [看資料包](01-web-excel/gristlabs__grist-core.md) |
| [genspark-ai/genoffice](https://github.com/genspark-ai/genoffice) | 11,717 | 開源桌面AI Office，試算表用Univer，Claude可改Excel | ★★★★ | 原生 | 個人使用：完全免費自由，可下載安裝版或自行編譯修改；AI 費用另依你自己的 AP | [看資料包](01-web-excel/genspark-ai__genoffice.md) |
| [jspreadsheet/ce](https://github.com/jspreadsheet/ce) | 7,242 | 純 JS、免框架、MIT 的輕量網頁試算表元件，最易嵌入倉儲系統 | ★★★★ | 可接 | 個人使用：完全免費，可任意修改、複製程式碼到自己的專案。 | [看資料包](01-web-excel/jspreadsheet__ce.md) |
| [storytold/gridcraft](https://github.com/storytold/gridcraft) | 7,139 | Rust 寫的仿 Excel 試算表，支援瀏覽器與 Claude MCP | ★★★ | 原生 | 個人使用：完全免費、可修改，無付費版或授權金鑰。 | [看資料包](01-web-excel/storytold__gridcraft.md) |
| [ONLYOFFICE/DocumentServer](https://github.com/ONLYOFFICE/DocumentServer) | 7,088 | 自架的線上 Office，網頁上完整編輯並多人協作 .xlsx | ★★★★ | 可接 | 個人使用：完全免費，可自架在自己主機上用，不改程式碼幾乎沒有義務。 | [看資料包](01-web-excel/ONLYOFFICE__DocumentServer.md) |
| [glideapps/glide-data-grid](https://github.com/glideapps/glide-data-grid) | 5,426 | Canvas 繪製的超快 React 表格，可貼 Excel、拖拉填滿，但無公式 | ★★★★ | 可接 | 個人使用：完全免費，可任意修改、不需開源自己的程式碼。 | [看資料包](01-web-excel/glideapps__glide-data-grid.md) |
| [ironcalc/IronCalc](https://github.com/ironcalc/IronCalc) | 4,247 | Rust 寫的 Excel 相容公式引擎，wasm 在瀏覽器算公式讀寫xlsx | ★★★★ | 可接 | 個人使用：完全自由，可修改、拆用、組合。 | [看資料包](01-web-excel/ironcalc__IronCalc.md) |
| [ruilisi/fortune-sheet](https://github.com/ruilisi/fortune-sheet) | 3,748 | Luckysheet 的 TS＋React 改寫，MIT 網頁試算表元件 | ★★★★ | 可接 | 個人使用：MIT，可自由使用、修改，沒有任何限制。 | [看資料包](01-web-excel/ruilisi__fortune-sheet.md) |
| [handsontable/hyperformula](https://github.com/handsontable/hyperformula) | 2,829 | 無畫面的 Excel 公式引擎，355 個函數，表格 UI 需自配 | ★★★★ | 可接 | 個人使用：設定 licenseKey: 'gpl-v3' 即可免費使用全部函數與 | [看資料包](01-web-excel/handsontable__hyperformula.md) |
| [dream-num/univer-workspace](https://github.com/dream-num/univer-workspace) | 2,269 | Univer 官方可自架 Office 工作區，含 AI 草稿審核流程 | ★★★ | 可接 | 個人使用：在自己電腦 localhost／127.0.0.1 跑最順，repo  | [看資料包](01-web-excel/dream-num__univer-workspace.md) |
| [odoo/o-spreadsheet](https://github.com/odoo/o-spreadsheet) | 298 | Odoo 的網頁試算表引擎：Canvas、336 函數、xlsx、OT 協作 | ★★★★ | 可接 | 個人使用：完全免費，可以任意使用和修改。 | [看資料包](01-web-excel/odoo__o-spreadsheet.md) |

### 深入分析

- [ONLYOFFICE__DocumentServer__sdkjs-cell](01-web-excel/deep-dives/ONLYOFFICE__DocumentServer__sdkjs-cell.md)
- [ONLYOFFICE__DocumentServer__server-deploy](01-web-excel/deep-dives/ONLYOFFICE__DocumentServer__server-deploy.md)
- [dream-num__univer__architecture](01-web-excel/deep-dives/dream-num__univer__architecture.md)
- [dream-num__univer__formula-engine](01-web-excel/deep-dives/dream-num__univer__formula-engine.md)
- [dream-num__univer__oss-vs-pro](01-web-excel/deep-dives/dream-num__univer__oss-vs-pro.md)
- [dream-num__univer__render-interaction](01-web-excel/deep-dives/dream-num__univer__render-interaction.md)
- [gristlabs__grist-core__client-mcp](01-web-excel/deep-dives/gristlabs__grist-core__client-mcp.md)
- [gristlabs__grist-core__data-engine](01-web-excel/deep-dives/gristlabs__grist-core__data-engine.md)
- [nocodb__nocodb__backend](01-web-excel/deep-dives/nocodb__nocodb__backend.md)
- [nocodb__nocodb__grid](01-web-excel/deep-dives/nocodb__nocodb__grid.md)
- [teableio__teable__backend](01-web-excel/deep-dives/teableio__teable__backend.md)
- [teableio__teable__grid](01-web-excel/deep-dives/teableio__teable__grid.md)

## 查價・比價・ERP

| 專案 | ⭐ | 一句話 | 適合度 | Claude | 個人使用 | 資料包 |
|---|---|---|---|---|---|---|
| [odoo/odoo](https://github.com/odoo/odoo) | 55,539 | 全功能開源 ERP：價目表、比價、到岸成本、估值、台灣電子發票，內建網頁試算表 | ★★★★ | 可接 | 個人使用：完全免費，可自架、可修改，不必公開程式碼。 | [看資料包](02-price-erp/odoo__odoo.md) |
| [frappe/erpnext](https://github.com/frappe/erpnext) | 40,922 | 全開源 ERP，採購比價、到岸成本、FIFO 估值、價格規則一應俱全 | ★★★★ | 可接 | 個人使用：完全可以，自架、修改都不必公開程式碼。 | [看資料包](02-price-erp/frappe__erpnext.md) |
| [YunaiV/ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro) | 40,231 | Java 全家桶後台，內含進銷存 ERP、WMS、報表設計器與 AI | ★★★ | 原生 | 個人使用：MIT，完全免費、可改、可不公開原始碼。 | [看資料包](02-price-erp/YunaiV__ruoyi-vue-pro.md) |
| [dgtlmoon/changedetection.io](https://github.com/dgtlmoon/changedetection.io) | 35,504 | 自架網頁變動監控，可追蹤商品價格與補貨並通知，內建 AI 與 MCP | ★★★★ | 原生 | 個人使用：完全自由，可自架、修改、不公開原始碼。 | [看資料包](02-price-erp/dgtlmoon__changedetection.io.md) |
| [nocobase/nocobase](https://github.com/nocobase/nocobase) | 24,837 | 讓 Claude Code 寫業務系統的開源地基框架（v3 beta） | ★★★ | 原生 | 個人使用：自架自用沒問題。 | [看資料包](02-price-erp/nocobase__nocobase.md) |
| [aureuserp/aureuserp](https://github.com/aureuserp/aureuserp) | 12,166 | Laravel＋Filament 輕量版 Odoo，價目表與供應商報價邏輯好抄 | ★★★ | 可接 | 個人使用：完全自由，可下載、修改、自架，不用付費。 | [看資料包](02-price-erp/aureuserp__aureuserp.md) |
| [invoiceninja/invoiceninja](https://github.com/invoiceninja/invoiceninja) | 10,487 | Laravel 報價、發票、採購單與簡易庫存系統，附 API 與 Webhook | ★★★ | 可接 | 個人使用：可自架、修改、複製程式碼，免費。 | [看資料包](02-price-erp/invoiceninja__invoiceninja.md) |
| [idurar/idurar-erp-crm](https://github.com/idurar/idurar-erp-crm) | 8,939 | MERN 極簡開源發票＋收款系統，報價與稅率已從開源版移除 | ★★ | 可接 | 個人使用：自己架、自己改都可以，不需公開任何東西。 | [看資料包](02-price-erp/idurar__idurar-erp-crm.md) |
| [Dolibarr/dolibarr](https://github.com/Dolibarr/dolibarr) | 7,831 | 老牌開源 PHP ERP，多供應商進價比價、庫存成本，內建 Claude MCP | ★★★★ | 原生 | 個人使用：完全自由，可自行架設、修改，不需公開任何內容。 | [看資料包](02-price-erp/Dolibarr__dolibarr.md) |
| [inventree/InvenTree](https://github.com/inventree/InvenTree) | 7,813 | 自架庫存採購系統，內建多供應商級距報價與多幣別成本引擎 | ★★★ | 可接 | 個人使用：完全自由，可修改、可只取片段程式碼。 | [看資料包](02-price-erp/inventree__InvenTree.md) |
| [jishenghua/jshERP](https://github.com/jishenghua/jshERP) | 4,686 | 簡中開源進銷存＋財務 ERP，多單位四價格、移動平均成本 | ★★★ | 可接 | 個人使用：完全可以自由使用、修改，不必公開原始碼。 | [看資料包](02-price-erp/jishenghua__jshERP.md) |
| [GreaterWMS/GreaterWMS](https://github.com/GreaterWMS/GreaterWMS) | 4,431 | Django＋Quasar 開源倉儲系統：入出庫、揀貨、盤點、PDA 掃碼 | ★★★ | 可接 | 個人使用：完全自由，可改可部署，不需公開程式碼。 | [看資料包](02-price-erp/GreaterWMS__GreaterWMS.md) |
| [jez500/pricebuddy](https://github.com/jez500/pricebuddy) | 1,490 | 自架多店價格追蹤：貼網址抓價、存歷史、降價補貨通知，可用 Claude 補抓 | ★★★ | 原生 | 個人使用：完全可以，自架、修改都不受限。 | [看資料包](02-price-erp/jez500__pricebuddy.md) |
| [clucraft/PriceGhost](https://github.com/clucraft/PriceGhost) | 1,132 | 自架網頁價格追蹤，四種抓價法投票＋Claude 仲裁，降價補貨推播 | ★★★ | 原生 | 個人使用：自己架設、研究程式碼風險很低，作者在 README 明示 MIT 意圖 | [看資料包](02-price-erp/clucraft__PriceGhost.md) |
| [Cybrarist/Discount-Bandit](https://github.com/Cybrarist/Discount-Bandit) | 762 | 自架多使用者電商降價追蹤：自訂商店爬蟲＋價格歷史＋多通道通知 | ★★★ | 無 | 個人使用：自己下載、架設來追價格，實務風險低。 | [看資料包](02-price-erp/Cybrarist__Discount-Bandit.md) |

## 影片・腳本（AI）

| 專案 | ⭐ | 一句話 | 適合度 | Claude | 個人使用 | 資料包 |
|---|---|---|---|---|---|---|
| [harry0703/MoneyPrinterTurbo](https://github.com/harry0703/MoneyPrinterTurbo) | 138,727 | 輸入主題即自動產生腳本、配音、字幕、素材剪輯的短影片產線 | ★★★★ | 原生 | 個人使用：MIT，可自由使用、修改，沒有限制。 | [看資料包](03-video-script/harry0703__MoneyPrinterTurbo.md) |
| [nexu-io/open-design](https://github.com/nexu-io/open-design) | 105,898 | 叫 Claude Code 做網頁、簡報、生圖與動態影片的本機 AI 設計工作區 | ★★★★ | 原生 | 個人使用：完全可以，自由修改使用；官方桌面版預設開啟產品分析遙測，可在 Sett | [看資料包](03-video-script/nexu-io__open-design.md) |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | 100,711 | 本機版 ElevenLabs：聲音複製、影片翻譯配音與字幕，可接 Claude | ★★★★ | 原生 | 個人使用：App 與預設模型都可免費在自己電腦使用，沒有問題。 | [看資料包](03-video-script/debpalash__VoiceStudio.md) |
| [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | 78,761 | 用 HTML 寫影片、逐幀渲染成 MP4，原生支援 Claude Code | ★★★★★ | 原生 | 個人使用：完全免費，可改可私用；只做 HTML 動畫＋本機 TTS 不用花錢。 | [看資料包](03-video-script/heygen-com__hyperframes.md) |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | 76,348 | 給 Claude Code 用的開源影片產線：12 條流程，腳本到成片 | ★★★★ | 原生 | 個人使用：完全可以，下載、修改、本機跑、產出的影片拿去投廣告都沒問題；AGPL  | [看資料包](03-video-script/calesthio__OpenMontage.md) |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | 70,673 | 用 React 程式碼寫影片並渲染成 MP4，官方附 Claude 外掛 | ★★★★ | 原生 | 個人使用：免費，可商用製作影片與圖片，也可修改原始碼自用。 | [看資料包](03-video-script/remotion-dev__remotion.md) |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 58,474 | 53 個 Claude Code 行銷 Skills：廣告素材、短影音腳本、文案、SEO | ★★★★ | 原生 | 個人使用：完全自由，可安裝、修改、翻成中文。 | [看資料包](03-video-script/coreyhaines31__marketingskills.md) |
| [FujiwaraChoki/MoneyPrinterV2](https://github.com/FujiwaraChoki/MoneyPrinterV2) | 32,295 | 本機LLM＋Gemini生圖，自動做並上傳YouTube短影片的Python工具 | ★★ | 可接 | 個人使用：在自己電腦跑、修改都可以，不需公開任何東西；產出的影片不受 AGPL  | [看資料包](03-video-script/FujiwaraChoki__MoneyPrinterV2.md) |
| [browser-use/video-use](https://github.com/browser-use/video-use) | 30,532 | Claude Code 剪片 Skill：讀逐字稿選段，ffmpeg 剪接上字幕 | ★★★★ | 原生 | 個人使用：完全自由，可修改、可拆零件進自己的工具。 | [看資料包](03-video-script/browser-use__video-use.md) |
| [hypit-ai/hypit](https://github.com/hypit-ai/hypit) | 27,938 | 給 Claude Code 用的爆款短影音複製與量產引擎（SVML＋本機渲染） | ★★★★ | 原生 | 個人使用：可以，自己電腦安裝執行完全允許；產出的影片歸你所有。 | [看資料包](03-video-script/hypit-ai__hypit.md) |
| [HBAI-Ltd/Toonflow-app](https://github.com/HBAI-Ltd/Toonflow-app) | 20,452 | 畫布式 AI 短劇／商品影片工作室，原生接 Claude 與 MCP | ★★★★ | 原生 | 個人使用：完全免費，可自架、可修改，無功能鎖。 | [看資料包](03-video-script/HBAI-Ltd__Toonflow-app.md) |
| [bradautomates/claude-video](https://github.com/bradautomates/claude-video) | 19,856 | Claude Code 看影片技能：下載、抽幀、轉錄後交給 Claude | ★★★★ | 原生 | 個人使用：完全自由，可修改、拆解、混用，無任何付費功能或限制。 | [看資料包](03-video-script/bradautomates__claude-video.md) |
| [chatfire-AI/huobao-drama](https://github.com/chatfire-AI/huobao-drama) | 16,997 | 小說一句話到成片：AI 寫劇本、拆分鏡、生圖生影片再拼接的短劇工作台 | ★★★ | 可接 | 個人使用：可以，自己跑、自己改、自己研究都沒問題，需保留署名。 | [看資料包](03-video-script/chatfire-AI__huobao-drama.md) |
| [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | 16,909 | Claude Code 技能：用 Remotion 把網頁截圖做成產品宣傳片 | ★★★ | 原生 | 個人使用：Apache-2.0 可自由使用、修改；Remotion 對個人免費； | [看資料包](03-video-script/Vincentwei1021__video-shotcraft.md) |
| [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | 13,529 | 703 則用 Claude Opus 5.5 寫程式產生動態影片的提示詞收藏 | ★★★ | 原生 | 個人使用：拿提示詞學習、改寫後產生自己的影片沒問題。 | [看資料包](03-video-script/yihui-dev__awesome-opus5-5-videos.md) |
| [HKUDS/ViMax](https://github.com/HKUDS/ViMax) | 12,853 | 多代理把點子／劇本／小說拆成分鏡、關鍵影格，再呼叫 Veo 等生成整支影片 | ★★★ | 可接 | 個人使用：完全自由，可修改、可自用，不需公開程式碼。 | [看資料包](03-video-script/HKUDS__ViMax.md) |
| [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) | 12,152 | 讓 Claude Code 用程式碼逐格畫出影片的 66 種風格庫與工具鏈 | ★★★★ | 原生 | 個人使用：完全自由；你用它做出的影片歸你，不需標註。 | [看資料包](03-video-script/lemomo-ai__lemo-opuscar.md) |
| [linyqh/NarratoAI](https://github.com/linyqh/NarratoAI) | 11,713 | 把現成影片用 AI 看懂、寫解說稿、配音剪成短片的工具 | ★★★ | 可接 | 個人使用：MIT，免費、可任意修改使用。 | [看資料包](03-video-script/linyqh__NarratoAI.md) |
| [irinabuht12-oss/marketing-skills](https://github.com/irinabuht12-oss/marketing-skills) | 6,805 | 49 個給 Claude 的廣告／SEO 分析 Skills，純 Markdown | ★★★ | 原生 | 個人使用：可以，作者明言免費、MIT，複製 skills 到 ~/.claude | [看資料包](03-video-script/irinabuht12-oss__marketing-skills.md) |
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | 6,335 | Remotion 官方 Claude Code 技能包，讓 AI 用 React 程式碼做影片 | ★★★★ | 原生 | 個人使用：可以，官方鼓勵用 npx skills add 安裝；產出的影片專案依 | [看資料包](03-video-script/remotion-dev__skills.md) |
| [zenstory-ai/drama-skills](https://github.com/zenstory-ai/drama-skills) | 3,777 | 裝進 Claude Code 的 12 個短劇 skill，從原著寫到分鏡、提示詞與剪輯成片 | ★★★★ | 原生 | 個人使用：完全自由，可安裝、修改、拆零件。 | [看資料包](03-video-script/zenstory-ai__drama-skills.md) |
| [digitalsamba/claude-code-video-toolkit](https://github.com/digitalsamba/claude-code-video-toolkit) | 2,435 | Claude Code 原生影片工具箱：腳本、配音、生圖、配樂、字幕到 MP4 | ★★★★ | 原生 | 個人使用：工具箱本身 MIT，自由使用與修改；但它呼叫的模型與服務（Remoti | [看資料包](03-video-script/digitalsamba__claude-code-video-toolkit.md) |
| [zhuyansen/awesome-claude-video-skills](https://github.com/zhuyansen/awesome-claude-video-skills) | 1,556 | 讓 Claude Code 做影片的 413 個 skill 分類目錄，附安全評級與實測 | ★★★★ | 原生 | 個人使用：完全自由，清單文字與 data/skills.json 可任意複製、改 | [看資料包](03-video-script/zhuyansen__awesome-claude-video-skills.md) |
| [xixihhhh/clipforge](https://github.com/xixihhhh/clipforge) | 1,193 | 一張商品圖自動出帶貨短影片：腳本、配畫面、免費配音字幕、FFmpeg 合成 | ★★★★ | 可接 | 個人使用：完全可以，自己電腦裝、出片拿去賣貨都沒問題；產出的影片不受 AGPL  | [看資料包](03-video-script/xixihhhh__clipforge.md) |
| [backtrue/thinkwithblack-skill](https://github.com/backtrue/thinkwithblack-skill) | 255 | 小黑老師 365 個繁中行銷 Skills，可直接當 Claude Skills 用 | ★★★★ | 原生 | 個人使用：完全可以，下載、修改、丟給 Claude 用都沒問題。 | [看資料包](03-video-script/backtrue__thinkwithblack-skill.md) |

## AI 協作規則・角色・技能

| 專案 | ⭐ | 一句話 | 適合度 | Claude | 個人使用 | 資料包 |
|---|---|---|---|---|---|---|
| [mattpocock/skills](https://github.com/mattpocock/skills) | 312,707 | 示範 Claude 與 Codex 共用規則、角色分工的工程 Skills 庫 | ★★★★ | 原生 | 個人使用：完全自由，可複製、翻譯、改寫成自己的 skill。 | [看資料包](04-agent-rules-skills/mattpocock__skills.md) |
| [obra/superpowers](https://github.com/obra/superpowers) | 312,273 | 最紅的AI寫程式紀律技能包：計畫、子代理分工、審查、有證據才算完成 | ★★★★ | 原生 | 個人使用：完全自由，可安裝、修改，把任何 SKILL.md 或提示詞範本整段複製 | [看資料包](04-agent-rules-skills/obra__superpowers.md) |
| [affaan-m/ECC](https://github.com/affaan-m/ECC) | 297,007 | Claude／Codex 共用規則、角色、技能與文件巡檢工具大全 | ★★★★★ | 原生 | 個人使用：完全自由，可複製、修改規則／角色／技能檔。 | [看資料包](04-agent-rules-skills/affaan-m__ECC.md) |
| [anthropics/skills](https://github.com/anthropics/skills) | 187,332 | Anthropic官方Skills範本：SKILL.md寫法、觸發測試與規則稽核 | ★★★★ | 原生 | 個人使用：Apache-2.0 的 skill 可自由使用、修改；docx/pd | [看資料包](04-agent-rules-skills/anthropics__skills.md) |
| [msitarzewski/agency-agents](https://github.com/msitarzewski/agency-agents) | 166,482 | 283 個 AI 角色＋交接範本，一份檔裝進 Claude 與 Codex | ★★★★ | 原生 | 個人使用：完全自由，可任意修改、安裝到自己的 Claude Code／Codex | [看資料包](04-agent-rules-skills/msitarzewski__agency-agents.md) |
| [github/spec-kit](https://github.com/github/spec-kit) | 147,114 | GitHub官方規格驅動工具：專案憲法＋一致性稽核，原生支援Claude | ★★★★ | 原生 | 個人使用：完全自由，可修改、可把範本與提示詞直接抄進自己的專案。 | [看資料包](04-agent-rules-skills/github__spec-kit.md) |
| [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | 142,273 | 把整個專案轉成可查詢知識圖譜的 AI 技能，附多平台規則防漂移範本 | ★★★ | 原生 | 個人使用：免費、可任意使用與修改。 | [看資料包](04-agent-rules-skills/Graphify-Labs__graphify.md) |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | 113,212 | 25 個工程流程 Skill＋4 角色，Claude 與 Codex 共用同一份 | ★★★★ | 原生 | 個人使用：完全自由，可複製、修改、放進自己的 CLAUDE.md／AGENTS. | [看資料包](04-agent-rules-skills/addyosmani__agent-skills.md) |
| [paperclipai/paperclip](https://github.com/paperclipai/paperclip) | 111,031 | 把Claude Code與Codex當AI員工管理的自架控制台，內建排程巡檢 | ★★★★ | 原生 | 個人使用：完全自由，可修改、可自架，也可把它的 AGENTS.md、rules、 | [看資料包](04-agent-rules-skills/paperclipai__paperclip.md) |
| [Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec) | 73,913 | 用現行規格＋變更提案＋封存，讓多個 AI 共用同一份真相 | ★★★★ | 原生 | 個人使用：完全自由，可使用、修改、複製與拆零件。 | [看資料包](04-agent-rules-skills/Fission-AI__OpenSpec.md) |
| [bmad-code-org/BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) | 54,994 | 以角色、技能與工單樹讓 Claude／Codex 有紀律協作的 AI 開發方法 | ★★★★ | 原生 | 個人使用：完全免費，可自由修改、複製、拆出 SKILL.md 與腳本使用，無付費 | [看資料包](04-agent-rules-skills/bmad-code-org__BMAD-METHOD.md) |
| [wshobson/agents](https://github.com/wshobson/agents) | 42,187 | 一份 Markdown 轉成 7 種 AI 工具格式的角色技能市集，附漂移巡檢 | ★★★★★ | 原生 | 個人使用：完全可以複製、修改、拿進自己的專案，不用付費。 | [看資料包](04-agent-rules-skills/wshobson__agents.md) |
| [openai/skills](https://github.com/openai/skills) | 28,518 | OpenAI 官方 Codex 技能庫與 Claude 轉 Codex 對照表 | ★★★★ | 可接 | 個人使用：Apache-2.0 / MIT 的技能可自由複製、修改，拿來改寫成自 | [看資料包](04-agent-rules-skills/openai__skills.md) |
| [VoltAgent/awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) | 26,328 | 166 個 Claude Code 子代理角色檔，可當 AI 角色說明書範本 | ★★★★ | 原生 | 個人使用：可自由複製、修改、翻成中文使用，無任何限制。 | [看資料包](04-agent-rules-skills/VoltAgent__awesome-claude-code-subagents.md) |
| [agentsmd/agents.md](https://github.com/agentsmd/agents.md) | 25,318 | AGENTS.md 開放格式官網：讓多家 AI 讀同一份專案規則的檔名標準 | ★★★★ | 可接 | 個人使用：完全沒問題；自己寫 AGENTS.md 不涉及本 repo 授權，檔名 | [看資料包](04-agent-rules-skills/agentsmd__agents.md.md) |
| [MrLesk/Backlog.md](https://github.com/MrLesk/Backlog.md) | 7,278 | Markdown 任務看板，讓人與 Claude、Codex 共用交接紀錄 | ★★★★ | 原生 | 個人使用：完全自由，可安裝、修改、照抄規則檔與程式碼。 | [看資料包](04-agent-rules-skills/MrLesk__Backlog.md.md) |
| [intellectronica/ruler](https://github.com/intellectronica/ruler) | 2,959 | 單一 .ruler 規則同步給 Claude、Codex 等 32 種 AI | ★★★★ | 原生 | 個人使用：完全自由，可安裝、修改、抄範例與 workflow。 | [看資料包](04-agent-rules-skills/intellectronica__ruler.md) |
| [centminmod/my-claude-code-setup](https://github.com/centminmod/my-claude-code-setup) | 2,713 | Claude Code 記憶庫範本：同步子代理、去重封存、雙AI比對 | ★★★★ | 原生 | 個人使用：MIT，可自由複製、修改，保留版權聲明即可；Highcharts 個人 | [看資料包](04-agent-rules-skills/centminmod__my-claude-code-setup.md) |
| [dyoshikawa/rulesync](https://github.com/dyoshikawa/rulesync) | 1,583 | 一份規則來源，自動產生 Claude、Codex 等 70 種 AI 工具設定 | ★★★★ | 原生 | 個人使用：完全自由，可安裝、修改、取用程式碼片段；repo 內 .rulesyn | [看資料包](04-agent-rules-skills/dyoshikawa__rulesync.md) |
| [jakubsuplicki/codument](https://github.com/jakubsuplicki/codument) | 48 | 用文件登記表管住 AI 改程式：漂移偵測、提交前驗證、對抗式審查 | ★★★★ | 原生 | 個人使用：免費、可修改、可用在自己的專案，不需公開程式碼。 | [看資料包](04-agent-rules-skills/jakubsuplicki__codument.md) |
| [raccioly/docguard](https://github.com/raccioly/docguard) | 32 | 本機 CLI，巡檢 AI 規則檔與文件的重複、矛盾、過期與漂移 | ★★★★ | 原生 | 個人使用：完全自由，可修改、可拆程式碼，不需付費也不需帳號。 | [看資料包](04-agent-rules-skills/raccioly__docguard.md) |
| [mennanov/blockwatch](https://github.com/mennanov/blockwatch) | 30 | 用註解標籤寫規則，確定性檢查程式碼、設定、文件與 AI 規則檔是否漂移 | ★★★★ | 原生 | 個人使用：完全自由，可安裝、修改、放進自己的專案。 | [看資料包](04-agent-rules-skills/mennanov__blockwatch.md) |
| [ejklock/living-docs-skill](https://github.com/ejklock/living-docs-skill) | 14 | 專案決策活紀錄 Skill＋Rust 檢查器：防重號、索引漂移、新舊版衝突 | ★★★ | 原生 | 個人使用：完全自由，可修改、可拆程式碼與規則文字，不需付費、不需帳號。 | [看資料包](04-agent-rules-skills/ejklock__living-docs-skill.md) |
| [majiabin2020/majiu-management](https://github.com/majiabin2020/majiu-management) | 8 | 工作空間治理 Skill：台帳狀態機＋草稿三分法＋只讀巡檢報告 | ★★★ | 可接 | 個人使用：完全自由，可複製、修改、翻成繁體並改寫成 Claude Code／Co | [看資料包](04-agent-rules-skills/majiabin2020__majiu-management.md) |
| [Thomaszhou22/memory-checkup](https://github.com/Thomaszhou22/memory-checkup) | 1 | 只讀的 AI 記憶庫健檢 Skill：抓過期數字、斷掉引用、日誌斷檔、孤兒檔 | ★★★ | 原生 | 個人使用：完全自由，可複製、修改、合併進自己的工具。 | [看資料包](04-agent-rules-skills/Thomaszhou22__memory-checkup.md) |
| [wikiiizhao/pm-review-copilot](https://github.com/wikiiizhao/pm-review-copilot) | 1 | PM 用 Agent Skill：專案記憶分層、過期偵測、版本漂移與幻覺審查 | ★★★★ | 可接 | 個人使用：可自由複製、修改、翻成繁中，無任何限制。 | [看資料包](04-agent-rules-skills/wikiiizhao__pm-review-copilot.md) |

## 注意

- 這是 2026-11-04 的快照，星數、授權、程式碼位置之後可能改變；要動手前先確認最新版本。
- 授權欄位是白話整理，正式商用前請看原始 LICENSE。
