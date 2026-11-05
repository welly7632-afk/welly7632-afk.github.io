# nocodb/nocodb — 自架的 Airtable 替代品：用「試算表介面」管理真正的 SQL 資料庫

> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：5f2e381
> GitHub：https://github.com/nocodb/nocodb｜⭐ 65421｜授權：自訂授權 Sustainable Use License 1.0（非 OSI 開源；GitHub 顯示 NOASSERTION）｜主要語言：TypeScript｜最近更新：2026-11-04

（本文 permalink 前綴：`https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/`，以下簡寫為「B/」時代表此前綴；表格與重點處仍寫完整網址。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** NocoDB 不是「Excel 引擎」，而是「長得像試算表的資料庫後台」——每張表是真的 SQLite／PostgreSQL／MySQL 資料表，每一欄有型別（數字、貨幣、單選、附件、關聯…），公式是「欄位公式」（整欄套用，編譯成 SQL），不是 A1、B2 那種儲存格公式。

**對你（台灣小老闆、自己用 Claude 寫倉儲網頁、有投廣告）的實際用途：**

1. **馬上可用的商品／庫存／進貨成本表**：用 Docker 一行指令架起來，建「商品」「供應商」「進貨單」三張表，用「Links（關聯）＋Lookup＋Rollup＋Formula」做出「每個商品平均進價、毛利率、庫存金額」——這就是簡易 ERP 的骨架，而且多人可同時用網頁編輯。
2. **比價／查價資料庫**：把各通路價格匯入（.csv／.xlsx 匯入在開源版就有），用 Formula 欄算價差、用篩選＋排序找最低價，用 Gallery 檢視看商品圖。
3. **讓 Claude 直接讀寫你的表（重點）**：開源版內建 **MCP 伺服器**，設定頁直接產生 `claude mcp add ...` 指令（Claude Code）或 Claude Desktop 的設定 JSON。接上後你可以對 Claude 說「把上週廣告費超過 3,000 的商品列出來並算 ROAS」，Claude 會呼叫 `queryRecords`／`updateRecords` 等工具操作資料。
4. **當你自家倉儲網頁的後端 API**：每張表自動有 REST API（v2／v3），你的純 JavaScript 網頁可以 `fetch` 讀寫，不必自己寫後端。
5. **學習／拆用 Canvas 表格的寫法**：它的 Grid 已改成 Canvas 繪製（4,500 行級的 `useCanvasRender.ts`），複製貼上（含從 Excel 貼上 TSV）、拖拉填滿（數列遞增）、凍結欄、欄寬拖拉都有完整程式碼可參考。

**不適合的用途：** 想要「像 Excel 一樣任意儲存格寫公式、合併儲存格、改字型顏色、畫圖表、做樞紐分析」——NocoDB 的開源版做不到，請看分類中其他專案（例如 Univer、Luckysheet、x-spreadsheet 類）。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

**實際授權：** 根目錄 [LICENSE.md](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/LICENSE.md#L1-L27)（「Updated on: January 29, 2026」）寫明 `master` 與 `develop` 分支內容採 **Sustainable Use License 1.0**（與 n8n 同一份條款），且「其他分支的內容不授權」。`package.json` 的 `"license"` 也已改成 `"Sustainable Use License"`。它**不是** OSI 認可的開源授權（過去 NocoDB 曾是 AGPL-3.0，2026/1 起改掉），所以 GitHub 偵測為 NOASSERTION。

**關鍵限制（第 25–27 行 Limitations）白話：**
- ✅ **個人使用、非商業使用**：可以用、可以改。
- ✅ **公司「內部業務用途」**（your own internal business purposes）：可以。也就是你自己公司拿來管庫存、管價格、內部員工共用，**是允許的**。
- ❌ **拿去賣、或當成服務提供給別人收費**：不行。條款只允許「免費且非商業目的」的散布。例如你把改過的 NocoDB 包裝成「倉儲系統」賣給其他店家、或做成 SaaS 收月費，都違反授權。
- ❌ 不可移除版權與授權聲明；修改後再散布要標註「已修改」。
- ⚠️ **把它的程式碼「拆出來」放進你自己的產品**：拆出來的片段仍受同一份授權約束（衍生作品）。只要你的產品只給自己公司內部用就沒問題；若哪天要賣給別人，這些片段就必須換掉或重寫。這點對你「A＋B＋C 組合」的計畫很重要——**把 NocoDB 當「參考寫法」比「直接複製程式碼」安全**。
- 另注意：[packages/nc-gui/LICENSE.md](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/LICENSE.md) 是較舊版本（2026/1/9），只提到 master 分支，與根目錄版本字面不同；以根目錄版本為準較合理，但此不一致屬「未確認」法律解釋。

**付費版（EE／雲端）才有的功能——這個 repo 是「從 EE 同步過來的 CE 子集」：**
- 最新 commit 標題就是 `Merge pull request #14992 from nocodb/sync-ee-to-ce`；[.github/workflows/dispatch-oss.yml](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/.github/workflows/dispatch-oss.yml) 會通知私有 repo `nocodb/nocohub`。EE 程式碼不在這裡。
- 前端開關 [nc-gui/utils/ncUtils.ts#L1](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/utils/ncUtils.ts#L1) 寫死 `isEeUI = false`；後端 [nocodb/src/utils/constants.ts#L2](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/constants.ts#L2) 寫死 `isEE = false`。
- 我用「`.vue` 檔行數 ≤ 8 行」當作「CE 空殼元件」的粗略判斷：`packages/nc-gui/components` 共 999 個 `.vue`，其中 **161 個 ≤ 8 行**（例如 Gantt、Timeline、List、Map 檢視都只有 3 行的空殼）。
- 我**逐一確認是空殼／關閉**的：**復原／重做**（[useUndoRedo.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useUndoRedo.ts#L1-L30) 註解「CE has no undo」）、**即時協作推播**（[NocoSocket.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/socket/NocoSocket.ts#L1-L21) 所有 broadcast 都是空函式）、**多人游標／焦點顯示**（[useGridFocusPresence.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useGridFocusPresence.ts) 「CE stub — focus presence is EE-only」）、**列著色（條件格式）**（[RowColorFilter/Dropdown.vue#L7-L12](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/toolbar/RowColorFilter/Dropdown.vue#L7-L12) `isShowColoringButton = ref(false)`）、**AI 功能**（`useNocoAi.ts` 需 `appInfo.ee`）、Gantt／Timeline／List／Map 檢視、個人檢視（Personal views）。
- 付費功能清單（方案旗標）在 [nocodb-sdk/src/lib/payment/index.ts#L52-L130](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/payment/index.ts#L52-L130)：如 `FEATURE_AI`、`FEATURE_ROW_COLOUR`、`FEATURE_CELL_COLOUR`、`FEATURE_FORM_FIELD_VALIDATION`、`FEATURE_UNIQUE`、`FEATURE_RLS`、`FEATURE_SSO`、`FEATURE_GANTT_VIEW` 等。

---

## 3. 技術棧與執行需求

| 層 | 內容（皆從 package.json 確認） |
|---|---|
| 前端 | `packages/nc-gui`：Nuxt 4（`"nuxt": "^4.6.2"`）＋ Vue 3.5 ＋ ant-design-vue 3 ＋ UnoCSS；Grid 用 **HTML Canvas** 自繪；monaco-editor（程式碼編輯）、echarts、papaparse、SheetJS `xlsx@0.20.3`（瀏覽器端解析匯入檔） |
| 後端 | `packages/nocodb`：NestJS 10 ＋ Express ＋ Knex 3.1（SQL 產生器）＋ socket.io 4；ExcelJS（串流匯入／匯出 xlsx）；BullMQ／ioredis（工作佇列，選用） |
| 共用 | `packages/nocodb-sdk`：欄位型別、公式定義與驗證、填滿邏輯、Swagger 自動產生的 API 客戶端（`Api.ts` 20,123 行） |
| 資料庫 | 預設 SQLite（零設定）；正式用建議 PostgreSQL（`NC_DB="pg://..."`）；`ClientType` 列舉含 mysql2、pg、sqlite3、mssql、oracledb、snowflake、databricks（[enums.ts#L758-L767](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/enums.ts#L758-L767)），但 `functionMappings/mssql.ts`、`oracle.ts` 都只有 3 行，可見公式對這兩種 DB 支援有限。**沒有 Firebase／Firestore 支援**（全 repo grep 不到）。 |
| 部署 | README：`docker run -d --name noco -v "$(pwd)"/nocodb:/usr/app/data/ -p 8080:8080 nocodb/nocodb:latest`；另有 Auto-upstall 腳本（自動裝 PG＋Redis＋Traefik＋SSL）、各平台單一執行檔（官方說僅供測試）、Helm chart（`charts/nocodb`） |
| Node 版本 | 後端 `"engines": { "node": ">=24" }`；前端 `>=18` |
| 硬體 | 無 GPU 需求。一般 1–2 核、1–2GB RAM 的 VPS 或家用電腦跑 Docker 即可（未實測，屬經驗估計） |
| API Key／費用 | **核心功能不需要任何 API Key**，自架免費。附件放 S3／GCS／R2 等要自備帳號（`src/plugins` 有 S3、GCS、MinIO、R2、Backblaze、Spaces 等 20+ 個外掛）。AI 功能在開源版關閉，所以不會產生 LLM 費用；用 Claude 操作則是透過你自己的 Claude（MCP），費用就是你的 Claude 方案。 |
| 遙測 | 預設會送匿名遙測到 `telemetry.nocodb.com`；設環境變數 `NC_DISABLE_TELE=1` 關閉（[tele.ts#L11](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/tele.ts#L11)） |

程式量（我用 `find ... -name "*.ts" -o -name "*.vue" | xargs cat | wc -l` 數）：nc-gui 約 34.2 萬行、nocodb 後端約 27.8 萬行、nocodb-sdk 約 9.6 萬行。整個 repo 共 4,944 個檔案（`git ls-tree -r` 計數）。

---

## 4. 程式架構地圖

```
nocodb/
├─ LICENSE.md                         ← Sustainable Use License（2026/1/29 版）
├─ README.md                          ← 安裝方式（Docker／Auto-upstall／執行檔）
├─ docker-compose/                    ← 1_Auto_Upstall 腳本、PG／MySQL 範例
├─ charts/nocodb/                     ← Kubernetes Helm chart
└─ packages/
   ├─ nc-gui/                         ← 前端（Nuxt／Vue）
   │  ├─ components/smartsheet/       ← 「試算表」本體：各種檢視
   │  │  ├─ grid/canvas/              ★ Canvas 表格（最值得看）
   │  │  │  ├─ index.vue              ← 4,511 行：事件、捲動、虛擬化 calculateSlices
   │  │  │  ├─ composables/           ← 渲染、複製貼上、填滿、鍵盤、選取、欄寬、凍結、拖曳
   │  │  │  ├─ cells/                 ← 每種欄位型別一個 Canvas 渲染器（約 40 種）
   │  │  │  ├─ utils/canvas.ts        ← 文字截斷、換行、標籤、checkbox 等繪圖工具
   │  │  │  └─ loaders/               ← 圖片／sprite／markdown 載入快取
   │  │  ├─ grid/Table.vue            ← 舊的 DOM 版表格（分頁模式／測試用）
   │  │  ├─ kanban/ calendar/ Gallery.vue Form.vue  ← 開源版可用的其他檢視
   │  │  ├─ gantt/ timeline/ list/ Map.vue          ← CE 空殼（3 行）
   │  │  └─ toolbar/                  ← 篩選、排序、分組、欄位顯示、匯出、列高
   │  ├─ composables/                 ← useInfiniteData（分塊載入）、useUndoRedo（CE 空殼）…
   │  ├─ workers/importWorker.ts      ← 瀏覽器端用 SheetJS 解析 csv／xlsx
   │  ├─ lang/                        ← 41 個語言 JSON 檔，含 zh-Hant.json
   │  └─ components/dashboard/settings/base/MCP/  ← MCP 設定頁（產生 Claude 設定）
   ├─ nocodb/                         ← 後端（NestJS）
   │  └─ src/
   │     ├─ controllers/              ← 56 個控制器（v1／v2 API）＋ v3/
   │     ├─ services/                 ← 商業邏輯；services/v3/ 為新版 API
   │     ├─ db/BaseModelSqlv2.ts      ← 11,238 行：所有資料 CRUD 的核心
   │     ├─ db/formulav2/             ★ 公式 → SQL 編譯器
   │     ├─ db/functionMappings/      ← 各資料庫的函數對應（pg／mysql／sqlite／databricks）
   │     ├─ db/conditionV2.ts sortV2.ts ← 篩選與排序轉 SQL
   │     ├─ modules/jobs/jobs/        ← 匯入（csv／excel／json）、匯出、Airtable 匯入
   │     ├─ mcp/                      ★ MCP 伺服器（給 Claude 用）
   │     ├─ plugins/                  ← 儲存（S3/GCS/R2…）、通知（Slack/Discord/SMTP…）
   │     ├─ socket/ gateways/         ← socket.io；CE 只送遙測、不推資料
   │     └─ utils/tele.ts             ← 遙測
   ├─ nocodb-sdk/                     ← 前後端共用：UITypes、formula、fill-handler、Api.ts
   ├─ nocodb-sdk-v2/                  ← 新版 SDK（0.0.1，早期）
   └─ noco-integrations/core/         ← 整合框架（AI 抽象類別在此，但實際供應商實作不在 CE）
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| Canvas 表格選擇 | [grid/index.vue#L245-L258](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/index.vue#L245-L258) | `isCanvasTableEnabled = !ncIsPlaywright()`：正式環境一律用 Canvas，只有自動化測試才走舊 DOM 表格 |
| 虛擬捲動 | [canvas/index.vue#L915-L945](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L915-L945) | `calculateSlices()` 依 `scrollTop / rowHeight` 算出可見列區間 `rowSlice`、依 scrollLeft 算可見欄 `colSlice`（左右多緩衝 5px），只畫看得到的格子 |
| 分塊載入資料 | [useInfiniteData.ts#L418-L440](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useInfiniteData.ts#L418-L440) | `CHUNK_SIZE = 50`、`MAX_CACHE_SIZE = 200`：捲到哪就向後端要那一塊 50 列（offset/limit），快取上限後淘汰；所以 10 萬列也不會一次全載 |
| 欄位渲染器註冊 | [cells/index.ts#L150-L190](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/index.ts#L150-L190) | `cellTypesRegistry` 用 Map 把 UITypes 對應到渲染器（Currency、Date、Attachment、SingleSelect…），每個渲染器實作 `render / handleClick / handleKeyDown` |
| 渲染器介面 | [lib/types.ts#L827-L870](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/lib/types.ts#L827-L870) | `interface CellRenderer`；範例 [cells/Currency.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/Currency.ts)（71 行，用 `formatCurrencyValue` 格式化後靠右繪字） |
| 繪圖工具 | [canvas/utils/canvas.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/utils/canvas.ts) | 1,815 行；`truncateText`、`renderSingleLineText`、`wrapTextToLines`、`renderTagLabel`、`renderCheckbox`，大量 LRU 快取量測文字寬度 |
| 貼上（含從 Excel） | [useCopyPaste.ts#L395-L445](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L395-L445) | 讀 `text/plain`，去掉 Excel 結尾多的 `\n`，用 papaparse 以 `\t` 切成矩陣；單次上限 `MAX_ROWS = 5000`（[#L29](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L29)）；之後依欄位型別轉換（貨幣、日期、單選…） |
| 複製 | [useCopyPaste.ts#L1320-L1345](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L1320-L1345) | 同時寫入 `text/html`（表格）與 `text/plain`（TSV）兩種剪貼簿格式，所以貼到 Excel／Google 試算表會保持格子 |
| 拖拉填滿 | [useFillHandler.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useFillHandler.ts) ＋ [sdk fill-handler.ts#L35](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/columnHelper/utils/fill-handler.ts#L35) | 註解寫「follow google sheet behavior」：數字等差遞增、「品號1、品號2」這種「文字＋數字尾碼」也會遞增 |
| 公式解析 | [formula/jsepInstances.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/jsepInstances.ts) ＋ [validate-extract-tree.ts#L753](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/validate-extract-tree.ts#L753) | 用 fork 的 `nc-jsep`（JS 運算式解析器）＋ `{欄位名}` 外掛把公式轉 AST，再做型別檢查 |
| 公式執行 | [formulaQueryBuilderv2.ts#L86-L130](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/formulav2/formulaQueryBuilderv2.ts#L86-L130) ＋ [functionMappings/pg.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/functionMappings/pg.ts) | AST → Knex SQL 運算式，**由資料庫在查詢時計算**；不同 DB 有不同函數對應檔 |
| 篩選／排序 | [conditionV2.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/conditionV2.ts) ／ [sortV2.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/sortV2.ts) | 都轉成 SQL WHERE／ORDER BY，所以大資料量時效能取決於資料庫與索引 |
| Excel 匯入 | [excel-import.handler.ts#L42-L64](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/modules/jobs/jobs/data-import/handlers/excel-import.handler.ts#L42-L64) | ExcelJS 串流讀；公式格只取「計算結果」、富文字只取文字、超連結只取顯示文字、錯誤值變 null；有 `xlsx-bomb-guard.ts` 防壓縮炸彈 |
| Excel 匯出 | [export.service.ts#L1859-L1905](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/modules/jobs/jobs/export-import/export.service.ts#L1859-L1905) | ExcelJS `stream.xlsx.WorkbookWriter` 每 200 列一頁串流寫出，單一工作表 `Data`，只保留數字欄的 numFmt 與欄寬 |
| MCP 伺服器 | [mcp.controller.ts#L22-L60](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/mcp/mcp.controller.ts#L22-L60) ＋ [mcp.service.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/mcp/mcp.service.ts) | 路徑 `/mcp/:mcpTokenId`，用 `xc-mcp-token` 或 `x-api-key` 標頭驗證，套用使用者角色與欄位權限 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

> ⚠️ 授權提醒：以下片段都是 Sustainable Use License，拆出來只能內部／個人用；要商品化請「看懂後自己重寫」。

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| Excel 風格「拖拉填滿」數列推算 | [nocodb-sdk/.../fill-handler.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/columnHelper/utils/fill-handler.ts) | 只依賴同目錄 `decimal.ts`（浮點加減除）與 `is.ts` | **低** | 209 行純函式：輸入選取的值陣列＋要填幾列，輸出推算值。可直接改寫成純 JS，接到你自己的倉儲表格或任何 Grid |
| 剪貼簿 TSV 貼上解析 | [useCopyPaste.ts#L395-L445](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L395-L445) | papaparse | **低** | 「讀 text/plain → 去結尾換行 → 用 `\t` 解析成二維陣列」這段 30 行邏輯可直接搬到純 JS，用來支援「從 Excel 複製一整塊貼進我的網頁」 |
| 複製成 HTML＋TSV 雙格式 | [useCopyPaste.ts#L1320-L1345](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L1320-L1345) | 瀏覽器 Clipboard API | **低** | 用 `new ClipboardItem({'text/html':…, 'text/plain':…})` 讓使用者能把你的表格貼回 Excel |
| 公式定義表（70 個函數的說明、語法、範例、參數驗證） | [nocodb-sdk/src/lib/formula/formulas.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/formulas.ts#L32) | `nc-jsep`、型別定義 | **中** | 可當作「公式自動完成提示」的資料來源；但真正計算在後端 SQL，前端沒有 JS 計算器，要自己補 |
| 公式 → SQL 編譯器 | [db/formulav2/](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/formulav2/formulaQueryBuilderv2.ts) ＋ [functionMappings/](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/functionMappings/commonFns.ts) | Knex、Model／Column 中繼資料、BaseModelSqlv2 | **高** | 與 NocoDB 中繼資料深度耦合；只適合參考「怎麼把使用者公式安全地轉 SQL」（有白名單檢查 `assertParsedTreeFunctions`）。你用 Firestore 的話用不上 |
| Canvas 儲存格渲染器（約 40 種） | [grid/canvas/cells/](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/index.ts) ＋ [utils/canvas.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/utils/canvas.ts) | Vue ref、Nuxt 自動匯入（`themeV4Colors`、`parseProp` 等全域）、nocodb-sdk | **中** | 單一渲染器（如 Currency、Rating、Checkbox）的 `render(ctx, props)` 很好抄：輸入 canvas context＋座標＋值就畫。可移植到 Glide Data Grid 的 custom cell |
| 虛擬捲動＋分塊載入 | [canvas/index.vue#L915-L945](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L915-L945) ＋ [useInfiniteData.ts#L418-L440](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useInfiniteData.ts#L418-L440) | Vue reactivity | **中** | 概念簡單（可見列 = scrollTop/rowHeight；50 列一塊向後端要），可用於你的倉儲頁面接 Firestore 分頁查詢 |
| 整個 Canvas Grid | [grid/canvas/](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue) | Nuxt、Pinia／composables、ant-design-vue、nocodb-sdk、後端 API | **高** | 約 1.9 萬行且綁在 Nuxt 全域狀態裡，**不建議整包拆**；要可嵌入的 Canvas 表格請改用 Glide Data Grid（同分類已有資料包） |
| Excel 串流匯入／匯出 | [excel-import.handler.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/modules/jobs/jobs/data-import/handlers/excel-import.handler.ts) ＋ [export.service.ts#L1859-L1990](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/modules/jobs/jobs/export-import/export.service.ts#L1859-L1990) | ExcelJS（MIT） | **中** | 「大檔不爆記憶體」的寫法（串流、關 shared strings）可直接參考；用在 Firebase Cloud Functions 匯出報表 |
| MCP 伺服器（資料表給 Claude 用） | [packages/nocodb/src/mcp/](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/mcp/mcp.service.ts) | `@modelcontextprotocol/server`／`@modelcontextprotocol/node`、NocoDB 服務層 | **高**（拆）／**低**（直接用） | 直接用最划算；若要替自己的 Firestore 倉儲做 MCP，可參考它的工具切法（查詢、計數、彙總、建立、更新、刪除、連結）與 `descriptions.ts` 給模型看的說明文字 |
| Airtable 匯入器 | `packages/nocodb/src/modules/jobs/jobs/at-import/` | NocoDB 服務層 | 高 | 若你原本資料在 Airtable，可直接用 NocoDB 匯入（未實測） |

---

## 7. AI／Claude 整合

- **開源版的 AI 功能是關的**：前端 `composables/useNocoAi.ts` 的 `isAiBetaFeaturesEnabled` 需要 `appInfo.value?.ee`；`components/connect-ai/Pane.vue`（7 行）、`components/chat/Panel.vue`（3 行）都是空殼。方案旗標中 `FEATURE_AI`、`FEATURE_AI_PROMPT_FIELD`、`FEATURE_AI_BUTTON_FIELD`、`FEATURE_AI_CHAT` 屬付費。
- **AI 抽象層有開出來**：[noco-integrations/core/src/ai/types.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/noco-integrations/core/src/ai/types.ts)（796 行）用 Vercel AI SDK（`ai@6`）定義 `abstract class AiIntegration`；後端 package.json 也列了 `@ai-sdk/anthropic`、`@ai-sdk/openai`、`@ai-sdk/google`、bedrock、azure、deepseek、groq。但**實際供應商實作與 prompt 檔不在此 repo**（`noco-integrations` 下只有 `core/`），grep 不到 `generateText` 的實際呼叫點。→ prompt 放在哪：**未確認（在 EE）**。
- **MCP（開源版就有，這是重點）**：
  - 後端 [mcp.controller.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/mcp/mcp.controller.ts#L22-L60) 註冊在 CE 的 `noco.module.ts`。
  - 我在 [mcp.service.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/mcp/mcp.service.ts#L232) 數到 13 次 `server.registerTool(`：`getBaseInfo`、`getTablesList`、`getTableSchema`、`queryRecords`、`getRecord`、`countRecords`、`readAttachment`、`aggregate_single`、`createRecords`、`updateRecords`、`deleteRecords`、`linkRecords`、`unlinkRecords`。
  - 設定頁 [MCP/Setup.vue#L95-L100](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/dashboard/settings/base/MCP/Setup.vue#L95-L100) 直接產生：
    ```bash
    claude mcp add --transport http --scope user <名稱> \
      https://你的網域/mcp/<tokenId> \
      --header "x-api-key: <token>"
    ```
    Claude Desktop 則用 `npx -y mcp-remote <url> --transport http-only --header x-api-key:<token>` 橋接。
  - 權限：MCP token 綁定使用者，至少要 VIEWER 角色，並套用表格／欄位權限（controller 內 `loadPermissions`）。
- **Skills**：`components/skill/` 有 UI 元件（Detail、PolicyEditor 等），後端 migration 有 `nc_202609031200_agents.ts`，看起來是 EE 的 Agent／Skill 功能，CE 是否可用：**未確認**。
- **能不能換成 Claude**：MCP 這條路已經是 Claude 原生支援（`claude_support` 評為「原生」）。若想在 NocoDB 內部用 Claude 生成欄位內容（AI 欄位），開源版沒有，需付費版或自己寫 webhook → Cloud Function → Claude API 的串接。

---

## 8. 擴充方式與 API

1. **REST API**
   - v2：[data-table.controller.ts#L30](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/controllers/data-table.controller.ts#L30) `GET /api/v2/tables/:modelId/records`、`POST/PATCH/DELETE` 同路徑、`/records/count`、`/aggregate`、links 系列。
   - v3：[data-v3.controller.ts#L85-L215](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/controllers/v3/data-v3.controller.ts#L85-L215) 前綴 `/api/v3/data/:baseName/:modelId/records`，有 `upsert`。資料格式見 [data-v3.types.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/services/v3/data-v3.types.ts#L1-L40)：`{ id, fields: {...} }`。
   - 驗證：API Token 放 `xc-token` 標頭（[apiHelpers.ts#L94-L108](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/helpers/apiHelpers.ts#L94-L108)）。
   - CORS：Docker 進入點 [run/dockerEntry.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/run/dockerEntry.ts) 直接 `server.use(cors())`（全開），所以你的 GitHub Pages 網頁可以直接 fetch。
2. **Webhook**：`hooks.controller.ts`；事件 insert／update／delete／手動 trigger（[enums.ts#L946-L966](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/enums.ts#L946-L966)）。可打到 Firebase Cloud Function 同步到 Firestore。自訂 payload（`FEATURE_WEBHOOK_CUSTOM_PAYLOAD`）屬付費。
3. **SDK**：`nocodb-sdk` 的 `Api.ts` 是 swagger-typescript-api 自動產生（20,123 行），axios 為基礎。
4. **外掛**：`packages/nocodb/src/plugins/`（儲存、Email、Slack、Discord、Teams、Twilio、WhatsApp…）。
5. **前端擴充（Extensions）**：`nc-gui/extensions/` 只有 `data-exporter`、`json-exporter`；Extensions 屬方案旗標 `FEATURE_EXTENSIONS`，CE 可用程度未確認。
6. **嵌入**：公開分享檢視可產生 iframe 碼（[general/CopyUrl.vue#L21-L24](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/general/CopyUrl.vue#L21-L24)）。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。最近 commit 2026-11-04（掃描當天），版本 `0.301.3`；65k 星。但開發主體在私有 EE repo，公開 repo 是「sync-ee-to-ce」同步而來，**社群 PR 的空間有限**。
- **測試**：公開 repo 的後端 `packages/nocodb/src` 我找不到任何 `*.spec.ts`／`*.test.ts`（`find` 計數為 0），`tests/` 只放測試用資料庫檔；`nocodb-sdk` 有 57 個 spec 檔。CI 的 jest workflow 設 `EE=true`，可見主要測試在 EE 端跑。→ 你若改 CE 程式碼，幾乎沒有測試保護。
- **資安**：
  - 程式碼中可見多個 GHSA 安全修補註解（例如公式白名單 `assertParsedTreeFunctions` 提到 GHSA-frqc、xlsx 匯出提到 GHSA-4hcr-28g4-m9pm），代表有在處理資安回報，但也代表「自架要記得更新」。
  - 匯入有 `xlsx-bomb-guard.ts` 防壓縮炸彈；CSV 匯出會跳脫開頭 `= + - @` 防公式注入，Excel 匯出則刻意不跳脫（註解說明 ExcelJS 會當字串處理）。
  - **CORS 全開＋API Token**：若把 `xc-token` 寫進公開網頁（如 GitHub Pages），任何人都看得到並可讀寫你的資料庫。正確做法是放在後端／Cloud Function，或只在內網用。
- **隱私／遙測**：預設送遙測至 `telemetry.nocodb.com`（[tele.ts#L93](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/tele.ts#L93)），前端 socket 也會送 page／event 遙測（[socket.gateway.ts#L51-L86](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/gateways/socket.gateway.ts#L51-L86)）。設 `NC_DISABLE_TELE=1` 關閉。README 也嵌了 scarf.sh 追蹤圖。
- **已知的坑**：
  1. **授權變更**：2026/1 改為 Sustainable Use License，舊文章說「AGPL 開源可商用」已過時。
  2. **開源版沒有復原（Ctrl+Z）**——對習慣 Excel 的人是大坑，誤刪資料要靠資料庫備份（Docker 版有 `litestream.yml` 可做 SQLite 持續備份）。
  3. **開源版沒有即時同步**：別人改了資料，你的畫面不會自動更新，要重新整理。
  4. 公式是「整欄」的，不能在某一格單獨寫公式。
  5. 後端 Node 需 ≥ 24。
  6. 中繼資料表（`nc_bases_v2`、`nc_columns_v2`…，見 [utils/globals.ts#L1-L21](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/globals.ts#L1-L21)）跟你的資料放在同一個 DB（預設），升級時會自動 migration，務必先備份。

---

## 10. 跟其他專案組合的建議

- **NocoDB（資料後台＋MCP）＋ 你現有的 Firebase 倉儲網頁**：NocoDB 不能直接接 Firestore。兩種接法：(a) 價格／供應商／成本這類「後台資料」放 NocoDB（PostgreSQL），你的網頁用 REST API 讀；(b) 用 NocoDB Webhook → Firebase Cloud Function 單向同步到 Firestore。
- **NocoDB ＋ Glide Data Grid（Canvas 表格元件，MIT）**：要在自己的純 JS／React 頁面放「像 Excel 的表格」，用 Glide 做前端、NocoDB v3 API 做後端；NocoDB 的 fill-handler 與 TSV 貼上邏輯可當參考補進去。
- **NocoDB ＋ 真正的試算表引擎（Univer／Luckysheet／HyperFormula 類）**：需要「儲存格公式、合併儲存格、樣式、圖表」時，把那類引擎當「報表／計算頁」，原始資料仍放 NocoDB。
- **NocoDB ＋ Claude Code（MCP）＋ AI 影片／腳本專案**：把「商品資料表」（品名、賣點、價格、圖片附件）放 NocoDB，Claude 透過 MCP 讀出來後丟給影片／腳本生成專案，產出的腳本再用 `createRecords` 寫回「廣告素材表」——形成「商品 → 腳本 → 影片 → 投放成效」一條龍的資料中心。
- **NocoDB ＋ ERP 類專案**：NocoDB 適合做「輕量 ERP 的資料層與管理介面」，但沒有庫存異動過帳、會計分錄等業務邏輯；需要時用 Webhook／API 串 ERP 類專案，或請 Claude Code 寫 Cloud Function 補。

---

## 11. 網頁 Excel 能力檢查表

> 定義：「有」= 開源版（此 repo）可用；「付費版才有」= 程式碼中有 EE 旗標或 CE 空殼。

**渲染與效能**
- **渲染方式：有，Canvas**。[grid/index.vue#L245-L258](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/index.vue#L245-L258) 正式環境走 `canvas/index.vue`；舊版 DOM 表格 `Table.vue` 只在測試／特定模式使用。
- **虛擬捲動：有**。[canvas/index.vue#L915-L945](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/index.vue#L915-L945) 列與欄雙向虛擬化。
- **10 萬列以上效能：有設計但未實測**。前端只快取 50 列一塊、最多 200 塊（[useInfiniteData.ts#L418-L420](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useInfiniteData.ts#L418-L420)），排序篩選交給 SQL；實際速度取決於 DB 與索引。Excel 匯出註解提到舊實作「幾十萬列就爆記憶體」，新版已改串流。

**公式引擎**
- **函數數量：70 個**。計數方法：`grep -cE "^  [A-Z_0-9]+: \{" packages/nocodb-sdk/src/lib/formula/formulas.ts`（`formulas` 物件第 32–1399 行的頂層鍵）。包含 AVG、ADD、IF、SWITCH、AND、OR、CONCAT、LEFT/RIGHT/MID、ROUND/ROUNDUP/ROUNDDOWN、DATEADD、DATETIME_DIFF、REGEX_*、ARRAY*（4 個）、COUNT 系列、JSON_EXTRACT、LAST_MODIFIED_TIME 等。**沒有 SUM、VLOOKUP、SUMIF**（跨表彙總改用 Rollup／Lookup 欄位）。另支援運算子：算術 `+ - * / %`、比較 `= == != < > <= >=`、字串串接 `& ||`（[operators.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/operators.ts)）。
- **解析器：有**。`nc-jsep`（[jsepInstances.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/jsepInstances.ts)），驗證與型別推導在 [validate-extract-tree.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/validate-extract-tree.ts#L753)。
- **依賴圖／重算：沒有傳統依賴圖**。公式在每次查詢時由資料庫即時計算（[formulaQueryBuilderv2.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/formulav2/formulaQueryBuilderv2.ts#L86-L130)），所以不需要「重算」；`referenced-info-extractor.ts` 與 `CircularRefContext.ts` 負責找出引用欄位與防循環參照。
- **陣列公式：部分有**。ARRAYUNIQUE／ARRAYSORT／ARRAYCOMPACT／ARRAYSLICE 只吃「關聯（Has Many／Many to Many）或引用它的 Lookup」（[formulas.ts#L13-L30](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/formulas.ts#L13-L30)），不是 Excel 的 `{=...}` 陣列公式。
- **跨工作表參照：用「關聯欄位」達成**。Links ＋ Lookup ＋ Rollup（[lookup-or-ltar-builder.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/formulav2/lookup-or-ltar-builder.ts)），沒有 `Sheet2!A1` 語法。
- **自訂函數：沒有**（要改 `formulas.ts` ＋ 各 DB 的 `functionMappings/*.ts` 原始碼）。

**編輯**
- **儲存格編輯：有**。依欄位型別有不同編輯器（`handleKeyDown`／`makeCellEditable`，見 [lib/types.ts#L827](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/lib/types.ts#L827-L870)）。
- **複製貼上：有，能直接從 Excel／Google 試算表貼上**。讀 TSV（[useCopyPaste.ts#L395-L445](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useCopyPaste.ts#L395-L445)），單次最多 5,000 列；貼上的值會依欄位型別轉換，格式（顏色、粗體）不會帶入。複製時同時給 HTML＋TSV。
- **拖拉填滿：有，含數列遞增**（[fill-handler.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/columnHelper/utils/fill-handler.ts#L35)，「follow google sheet behavior」）。
- **復原／重做：付費版才有**（[useUndoRedo.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/composables/useUndoRedo.ts#L1-L30) CE 中 `undo = () => {}`，註解「CE has no undo」）。

**格式**
- **數字格式：有（以欄位為單位）**。Number／Decimal（小數位）／Currency（`currency_locale`、`currency_code`，可設 `zh-TW`＋`TWD`，見 [Currency.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/Currency.ts)）／Percent／Duration／Date 格式。無法對單一格設格式。
- **條件格式：付費版才有**。列著色按鈕在 CE 被隱藏（[RowColorFilter/Dropdown.vue#L7-L12](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/toolbar/RowColorFilter/Dropdown.vue#L7-L12)），方案旗標 `FEATURE_ROW_COLOUR`／`FEATURE_CELL_COLOUR`。
- **合併儲存格：沒有**（資料庫模型，每格對應一列一欄）。
- **凍結窗格：有（凍結左側欄）**。[useFreezeDivider.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useFreezeDivider.ts) 可拖拉的凍結分隔線。凍結上方列：沒有（標題列固定）。
- **欄寬／列高：有**。[useColumnResize.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/composables/useColumnResize.ts) 拖拉欄寬；列高為整個檢視統一選擇（`toolbar/RowHeight.vue`），不能單列調整。
- **篩選：有**（巢狀 AND／OR 群組，轉 SQL，[conditionV2.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/conditionV2.ts)）。釘選篩選、切換篩選屬付費旗標。
- **排序：有**（多欄排序，[sortV2.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/sortV2.ts)）；另有分組（Group by）與欄位底部彙總（Sum、Avg 等，`aggregationHelper.ts`）。
- **資料驗證（下拉選單）：有**。SingleSelect／MultiSelect 欄位就是下拉選單（含顏色標籤）；欄位型別本身即驗證（Email、URL、Phone、Number）。表單欄位自訂驗證（regex、最小最大值）與唯一值約束是付費旗標 `FEATURE_FORM_FIELD_VALIDATION`、`FEATURE_UNIQUE`。

**圖表、樞紐、附件**
- **圖表：開源版沒有**。sdk 有 `dashboard/charts.ts` 型別，但 CE 前端找不到圖表儀表板元件（echarts 只用在 `nc/PieChart.vue`、`payment/CreditUsageChart.vue`），推測在付費版。
- **樞紐分析：沒有**（grep 不到 pivot UI）；替代方案是 Group by ＋ 彙總列。
- **圖片／附件：有**。Attachment 欄位（[cells/Attachment.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/cells/Attachment.ts)）在格內顯示縮圖、可拖放上傳（`FileDropZone.vue`）、可直接貼上剪貼簿中的檔案；儲存到本機或 S3／GCS／R2 等。

**匯入匯出**
- **.csv 匯入／匯出：有**。匯入 `csv-import.handler.ts`（papaparse）；匯出支援輸出成舊式字元集（`csv-encoding.ts` 用 iconv，註解列出 GBK、Big5、Shift-JIS 等；Big5 匯出給舊版 Excel 開啟繁中不亂碼，UI 是否開放該選項未確認），會跳脫公式注入字元。
- **.xlsx 匯入：有**。後端 ExcelJS 串流（[excel-import.handler.ts#L42-L64](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/modules/jobs/jobs/data-import/handlers/excel-import.handler.ts#L42-L64)）＋前端 SheetJS 預覽（`workers/importWorker.ts`）。每個工作表變成一張表，自動推測欄位型別。**保真度低**：公式只留計算結果、樣式／合併儲存格／圖表全部丟棄。
- **.xlsx 匯出：有**。ExcelJS 串流（[export.service.ts#L1894-L1951](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/modules/jobs/jobs/export-import/export.service.ts#L1894-L1951)）；單一工作表 `Data`，只保留數字欄 numFmt 與欄寬。另有 JSON、ICS（行事曆）匯出（`ExportTypes`）。

**協作**
- **多人即時協作：付費版才有**。CE 的 [NocoSocket.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/socket/NocoSocket.ts#L1-L21) 全是空函式、前端 `useRealtime.ts` 回傳 `{}`；socket.io 只用來送遙測（[socket.gateway.ts#L51](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/gateways/socket.gateway.ts#L51-L86)）。沒有 OT／CRDT，多人同時改是「最後寫入者覆蓋」（每次編輯即 PATCH 單列）。EE 用 Redis（`RedisIoAdapter.ts`）擴充 socket.io。CE 的「多人」= 多人可登入、各自重新整理看到最新資料。

**資料模型**
- **有，關聯式**。每張表 = 資料庫中真正的一張 SQL 表；欄位定義存在中繼表 `nc_models_v2`、`nc_columns_v2`、`nc_col_formula_v2`、`nc_col_select_options_v2` 等（[utils/globals.ts#L1-L21](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/globals.ts#L1-L21)）。欄位型別共 46 個 UITypes（[UITypes.ts#L14-L61](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/UITypes.ts#L14-L61)，用 awk 數 enum 內 `=` 行；其中 ID、ForeignKey、Order、Deleted、Meta 等是系統欄）。
- v3 API 的一筆資料長這樣（依 [data-v3.types.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/services/v3/data-v3.types.ts#L1-L40)）：
  ```json
  { "records": [
      { "id": 12,
        "fields": { "品名": "保溫杯 500ml", "進價": 120, "售價": 299,
                    "毛利率": 0.5987, "分類": "生活用品",
                    "圖片": [{ "title": "cup.jpg", "mimetype": "image/jpeg" }] } }
    ],
    "next": "…下一頁網址…" }
  ```
  （欄位內容為示意；附件物件的完整鍵值未逐一確認。）
- **存進 Firestore：沒有直接支援**。做法：Webhook（insert/update/delete）→ Cloud Function → 把 `fields` 原樣寫進 `products/{id}` 文件；或反過來，定期從 Firestore 讀出再呼叫 v3 `records/upsert`。公式欄是查詢時才算，同步到 Firestore 後就只是靜態值。

**手機與語系**
- **手機／觸控：有基本支援**。`isMobileMode` 會隱藏部分桌面功能；Canvas 捲軸有單指拖曳（[Scroller.vue](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/smartsheet/grid/canvas/components/Scroller.vue) `touchPan`）。手機上大量編輯體驗：未實測。
- **繁體中文介面：有，但約 80% 翻譯**。`lang/zh-Hant.json`（顯示名「繁體中文」，[lib/enums.ts#L43](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/lib/enums.ts#L43)）。我用 Python 攤平 JSON 比對：en.json 9,848 個鍵、zh-Hant 有 7,849 個（缺 1,999 個會顯示英文），另有 231 個與英文相同。用詞是台灣用法（例如「儲存」「篩選條件」）。

**嵌入**
- **嵌入純 JavaScript 網頁：只能用 iframe 或 API，不能當元件 import**。nc-gui 是完整 Nuxt 應用，沒有發布成可獨立引入的套件；套件大小：未確認（未建置）。
- 最小可用範例 A（iframe，最簡單；先在 NocoDB 把檢視設為「公開分享」，可加密碼）：
  ```html
  <iframe src="https://你的nocodb網域/dashboard/#/nc/view/<分享UUID>"
          width="100%" height="600" style="border:none"></iframe>
  ```
  （網址組法見 [SharePage.vue#L375-L409](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/dlg/share-and-collaborate/SharePage.vue#L375-L409)：`${dashboardUrl}/nc/${viewType}/${uuid}`，Grid 的 viewType 是 `view`、表單是 `form`；實際網址以介面「複製連結」為準；iframe 碼產生邏輯見 [CopyUrl.vue#L21-L24](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nc-gui/components/general/CopyUrl.vue#L21-L24)。）
- 最小可用範例 B（純 JS 讀寫 v3 API，約 25 行；**token 只能在你自己電腦或內網用，不要放公開網站**）：
  ```html
  <table id="t" border="1"></table>
  <script>
  const HOST = 'http://localhost:8080';
  const BASE = 'p_xxxxxxxx', TABLE = 'm_xxxxxxxx';   // 從 NocoDB 介面複製
  const TOKEN = '你的 API token';
  const url = `${HOST}/api/v3/data/${BASE}/${TABLE}/records`;
  const H = { 'xc-token': TOKEN, 'Content-Type': 'application/json' };

  async function load() {
    const { records = [] } = await (await fetch(url, { headers: H })).json();
    const t = document.getElementById('t');
    t.innerHTML = '';
    records.forEach(r => {
      const tr = t.insertRow();
      Object.entries(r.fields).forEach(([k, v]) => {
        const td = tr.insertCell();
        td.textContent = typeof v === 'object' ? JSON.stringify(v) : v;
        td.contentEditable = true;                     // 改完失焦就寫回
        td.onblur = () => fetch(url, { method: 'PATCH', headers: H,
          body: JSON.stringify([{ id: r.id, fields: { [k]: td.textContent } }]) });
      });
    });
  }
  load();
  </script>
  ```
  （路由與 body 形狀依 [data-v3.controller.ts#L85-L215](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/controllers/v3/data-v3.controller.ts#L85-L215)；未實際執行。）

**API／事件**
- **監聽變更：有（伺服器端 Webhook）**；瀏覽器端即時事件：付費版才有（CE socket 不推資料）。
- **用程式讀寫儲存格：有**。REST v2／v3、`nocodb-sdk`、以及 MCP（讓 Claude 讀寫）。粒度是「列＋欄位」，不是 A1 座標。

---

## 關鍵字

NocoDB、Airtable 替代品、自架資料庫、網頁版試算表、Canvas 表格、虛擬捲動、欄位公式、公式轉 SQL、nc-jsep、Knex、NestJS、Nuxt、Vue 3、PostgreSQL、SQLite、MySQL、ExcelJS、SheetJS、papaparse、xlsx 匯入、csv 匯出、從 Excel 貼上、拖拉填滿、凍結欄、Lookup、Rollup、Links 關聯、Webhook、REST API v3、xc-token、MCP 伺服器、Claude Code、Claude Desktop、mcp-remote、Sustainable Use License、非開源授權、CE 與 EE、付費版功能、沒有復原、沒有即時協作、遙測 NC_DISABLE_TELE、繁體中文介面、庫存管理、比價表、成本計算、輕量 ERP、Firebase Firestore 同步、no-code database、spreadsheet UI、self-hosted
