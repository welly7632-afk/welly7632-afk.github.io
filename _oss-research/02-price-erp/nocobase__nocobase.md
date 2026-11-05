# nocobase/nocobase — 讓 Claude Code 在現成地基（權限、流程、資料庫、AI）上「寫程式」蓋業務系統的 TypeScript 框架（v3，全面改寫中）

> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：3681eb0
> GitHub：https://github.com/nocobase/nocobase｜⭐ 24837｜授權：v3-develop 分支無根目錄 LICENSE；88 個套件中 14 個標 Apache-2.0、其餘未標；舊版（main 分支）為「NocoBase License Agreement（Apache-2.0＋附加條款）」｜主要語言：TypeScript｜最近更新：2026-11-04

> 先講最重要的一件事：這次掃的是預設分支 `v3-develop`（NocoBase 3）。它**已經不是**大家印象中「在網頁上拖拉、免寫程式」的 NocoBase 1/2。v3 把整個應用變成**你自己 repo 裡的原始碼**，由 Claude Code／Codex 依照官方 Skills 來寫；NocoBase 只提供 npm 套件（伺服器、前端、資料庫、權限、流程、AI）。舊的無程式碼版本（含匯入匯出 Excel、公式欄位、MCP server 外掛）還在 `main` 分支（commit `11b5aef`）。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

一句話：NocoBase 3 是「給 AI 寫程式用的業務系統地基」，登入、角色權限、資料列權限、狀態機流程、通知、檔案、排程、AI 模型閘道都做好了，你叫 Claude Code 只寫你的商業邏輯（進貨、報價、庫存）。

對你（台灣小老闆、自己用 Claude 寫倉儲系統、跑廣告）可以拿來做：

- **當作「Claude Code 寫 ERP 的範本庫」**：repo 內附 38 份 `SKILL.md`（用 `find . -name SKILL.md | wc -l` 數的），其中 `nocobase-app-development` 這份 Skill 附了一個完整的**採購申請（procurement）範例**：供應商、物料、申請單、明細行、金額以「分」為單位的整數計算、與目錄價比對的「價差」欄、審核狀態機。你可以直接把這個範例當作「報價單／採購單」的骨架，叫 Claude 改成你的品項。
- **當作「AI 讀單據→結構化」的參考**：範例 App 有一支「AI 結構化擷取」API，把供應商訂單文字變成 `{supplier, currency, items:[{product, quantity, unitPrice}]}`，可對應你的「進貨單貼上→自動建檔」。
- **報價單／發票列印**：Carbone 套 DOCX 範本、可用 LibreOffice 轉 PDF 的範例。
- **權限、多人帳號、API Key**：如果之後倉儲系統要給員工或外包用，可以參考它的權限設計。
- **不適合**：直接拿來當「網頁版 Excel」（v3 只有 TanStack Table 的資料表格元件，沒有試算表、沒有公式、沒有儲存格編輯）、也不是開箱即用的進銷存／ERP（v3 沒有現成的庫存、採購、成本模組，只有範例）。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

**實際狀況（自己數的）：**
- `v3-develop` 分支根目錄**沒有 LICENSE 檔**（`git ls-tree` 全清單 11,087 個檔案中 grep `license` 只找到一個 workflow 檔）。
- 88 個 `packages/*/*/package.json` 裡，只有 14 個寫 `"license": "Apache-2.0"`（如 `app-cli`、`agent-runner`、`app-skills`、`create-app`、`app-plugin-file`、`app-plugin-template-print`、`app-template-examples`），其餘 74 個（包含核心 `@nocobase/app-server`、`@nocobase/app-client`、`@nocobase/db`、`app-plugin-agents`、`app-plugin-authorization`）**沒有標授權**。
- 舊版 `main` 分支的 [LICENSE.txt](https://github.com/nocobase/nocobase/blob/11b5aef8c212f0dbd5113b17b27f78532efa4f3c/LICENSE.txt) 是「NocoBase License Agreement」：以 Apache-2.0 為基礎，再加附加條款，且附加條款優先。重點條文：5.1 可商用；5.2 不可移除介面上的 NocoBase 品牌／版本／授權資訊（左上角主 LOGO 除外）；5.3 不可移除程式碼中的智財聲明；5.4 **不可拿原版或改版對外提供任何無程式碼／低程式碼／AI 平台的 SaaS／PaaS**；第 8 條準據法為新加坡法、ICC 仲裁。

**白話：**
- **個人使用**：自己架在自己電腦或伺服器上用，沒問題。
- **公司商用（自己公司內部用）**：v2 條款明文可商用，但要保留 NocoBase 品牌資訊。v3 核心套件目前**沒寫授權**，法律上「沒標授權」不等於開源，正式商用前要等官方補 LICENSE 或直接問官方——**未確認**。
- **不能做的事（依 v2 條款）**：把它包成「讓別人自己拉系統的平台」對外賣。你只是自己公司用的倉儲／報價系統，不在此限。
- **付費版功能（repo 內文件明寫）**：審核（Approval，`@nocobase/app-plugin-approval`）是「commercial Pro plugin」，Redis 後端外掛、KingbaseES／達夢／OceanBase 資料庫驅動也是付費套件，需從私有 registry `pkg-v3.nocobase.com` 安裝（見 [plugins.md#L13](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/references/plugins.md#L13) 與 [#L66-L88](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/references/plugins.md#L66-L88)）。另外 README 提到的 NocoBase Studio（多 Agent 協作治理平台）是官方產品，repo 內只有 `app-plugin-projects`／`app-plugin-releases` 等相關外掛，完整 Studio 是否開源**未確認**。
- 第三方：列印範例用的 Carbone 社群版有自己的授權（範例 README 註明再散布要附 Carbone Community License 連結）。

## 3. 技術棧與執行需求

| 項目 | 內容（出處） |
|---|---|
| 語言 | TypeScript（全清單 7,389 個 `.ts/.tsx` 檔，用 `grep -cE '\.(ts|tsx)$'` 數） |
| 執行環境 | Node.js **24 以上**、pnpm 11（[package.json](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/package.json) `engines.node >=24.0.0`；README 寫 Windows 要用 WSL） |
| 後端 | Hono（`@nocobase/app-server` 依賴 `hono`、`zod`），路由宣告 OpenAPI 文件（`packages/app/app-server/src/router/openapi/`） |
| 前端 | React 19 + Vite + Tailwind + shadcn/ui；表格用 `@tanstack/react-table` |
| 資料庫 | `@nocobase/db`（底層 knex），方言套件：SQLite、PostgreSQL、MySQL、SQL Server、Oracle（[db README](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/libs/db/README.zh-CN.md)）；KingbaseES／達夢／OceanBase 為付費驅動。**不支援 Firebase／Firestore**（NoSQL） |
| 認證 | Better Auth（API Key 外掛即包裝 Better Auth 的 API Key plugin） |
| 部署 | PM2 或 Docker 自架，或部署到 NocoBase Studio（[deployment.md](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/docs/docs/en/deployment.md)），範例環境「Linux x64 · SQLite」、反向代理到 `127.0.0.1:13000` |
| GPU | 不需要 |
| API Key 與費用 | 框架本身免費。AI 功能二選一：(a) App 內「模型服務」（OpenAI／Anthropic／Google／DeepSeek／阿里／Moonshot／Cohere／Ollama／OpenAI 相容）需各家 API Key，按用量計費，Ollama 本機免費；(b) 「Runner」讓 Claude Code／Codex／OpenCode／Pi 在你的電腦或伺服器上跑，用的是你自己的 Claude 訂閱或 API。PDF 轉檔要另裝 LibreOffice。實際月費**未確認**（看你用量） |

注意：所有 88 個套件版本都是 `-beta`（例如 `@nocobase/app-server 5.0.0-beta.0`、`@nocobase/db 1.0.0-beta.25`），還在預覽期。

## 4. 程式架構地圖

```
nocobase (v3-develop, 3681eb0)
├── AGENTS.md / CLAUDE.md          # 給 AI coding agent 的開發規則（內容視為資料，未照做）
├── README*.md                      # 12 國語言 README，含繁中 README.zh-TW.md
├── docs/docs/{en,cn}/              # 官方文件：capabilities（權限、流程、審核、AI 員工、知識庫、列印…）、deployment、2 vs 3 比較
├── skills/                         # 根目錄 Skills：nocobase-create-app、nocobase-app-installer…
├── ui-library/registry/            # 「複製原始碼進專案」的 UI 元件庫（shadcn registry 格式），共 46 個元件
│   ├── components/data-table/      # ★ TanStack 資料表格（排序/篩選/分頁/欄位顯示/勾選）
│   ├── components/kanban.tsx       # 看板
│   ├── approval/ lifecycle/ inbox/ # 審核 UI、流程圖、收件匣
│   └── agents/                     # AI 對話、Agent 選擇器、執行紀錄 UI
├── packages/
│   ├── app/
│   │   ├── app-server/             # Hono 伺服器框架、路由、OpenAPI、idempotency、repository-routes（自動 CRUD API）
│   │   ├── app-client/             # React 前端框架
│   │   ├── app-cli/                # `pnpm nocobase ...` 指令
│   │   ├── app-skills/             # ★ 給 Claude Code 的 Skills（含採購、入職兩個完整商業範例）
│   │   ├── agent-runner/           # ★ 在你機器上執行 Claude Code/Codex/OpenCode/Pi 的 runner
│   │   └── app-host / app-host-docker / app-websocket
│   ├── libs/
│   │   ├── db (+ db-sqlite/postgres/mysql/mssql/oracle)  # Schema as code、migration、seed、Repository、decimal 工具
│   │   ├── lifecycle/              # 狀態機（訂單/請款/發票流程）
│   │   ├── authorization/ queue/ jobs/ caching/ realtime/ mailer/ drive/ secrets/ i18n/
│   │   └── document-extractor/     # PDF/DOCX/XLSX/CSV 轉文字（用 xlsx 0.18.5）
│   ├── plugins/                    # 25 個官方外掛（`ls packages/plugins | wc -l`）：authentication、authorization(+3 種規則)、users、api-keys、
│   │                               #   file、mail、notification(+in-app/web-push/providers)、scheduler、i18n、
│   │                               #   database-explorer、agents、agent-sessions、knowledge、projects、releases、foundation…
│   ├── examples/                   # 16 個範例外掛：lifecycle（訂單/購買/發票/請款）、template-print（發票列印）…
│   ├── templates/
│   │   ├── app-template-default/   # 新 App 的起始專案（client/ server/ database/ cli/）
│   │   └── app-template-examples/  # 範例 App：採購、AI 擷取、AI 填表、外部 CRM、數值範例…
│   └── tools/ create-app, create-plugin, app-installer, dev-config
└── tests/ dev/ scripts/ .github/workflows/
```

一個 v3 App 的結構（`app-template-default`）：`client/`（pages、routes）、`server/`（routes、providers、`plugins.ts` 註冊外掛）、`database/main/migrations|seeds`（資料表以程式碼定義）、`cli/`。

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 外掛註冊 | [app-template-default/server/plugins.ts#L23-L41](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/templates/app-template-default/server/plugins.ts#L23-L41) | 用 `defineServerPlugins([...])` 列出要啟用的外掛（權限、使用者、檔案、排程、郵件…），順序有意義；不像 v2 在 UI 上開關 |
| 資料表定義（Schema as code） | [procurement migration#L6-L50](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/database/main/migrations/202611040001_create_procurement.ts#L6-L50) | `defineMigration` + `builder.createCollection('...', c => { c.string()... c.belongsTo()... c.hasMany()... c.index() })`；migration 合併後不可再改 |
| 精確小數 | [db/src/numeric/decimal.ts](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/libs/db/src/numeric/decimal.ts) | 「不經過 JavaScript number 四捨五入」，用 BigInt 處理 decimal 字串，最多 1000 位；數值範例表有 `decimal(30,6)` 欄位 |
| 自動 CRUD API | [repository-routes.ts#L42-L51](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-server/src/router/repository-routes.ts#L42-L51)、[#L183-L198](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-server/src/router/repository-routes.ts#L183-L198) | `defineRepositoryApiRoutes` 把資料表開成 `POST /api/{name}/{action}`，action 有 findMany／findOne／count／aggregate／groupBy／exists／createOne／updateOne／deleteOne；註解明說這個基本 adapter **不含認證授權**，要自己加 |
| 採購單金額計算 | [shared/procurement.ts#L9-L25](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/shared/procurement.ts#L9-L25) | 金額字串限 7 位整數＋2 位小數，`minorUnits()` 轉成「分」整數，`amount()` 加總並檢查上限 20 億分；前後端共用（zod） |
| 報價 vs 目錄價 價差 | [detail.tsx#L492-L500](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/client/pages/procurement/detail.tsx#L492-L500) | `priceDifference(quote, reference)` 顯示 +/− 每單位價差；文件說明：存的是「申請人報價快照」，選物料時預填目錄價，可改，審核者決定是否接受 |
| 交易一致性 | [server/providers/procurement.ts](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/server/providers/procurement.ts#L351) | 單頭、明細、歷程在同一個 `connection.transaction()` 內寫入；樂觀鎖（version）防止覆蓋 |
| 狀態機（訂單／購買／發票） | [lifecycle/src/definition.ts#L546](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/libs/lifecycle/src/definition.ts#L546)、[purchase.ts](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/examples/app-plugin-lifecycle-example/server/lifecycles/purchase.ts) | `defineLifecycle` 宣告狀態與轉換；範例「限時搶購」：倉庫先保留庫存（reserving）→ 扣款（charging）→ 失敗則釋放（releasing），提交後的副作用自動重試 |
| 資料表格 UI | [data-table.tsx#L79-L141](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/ui-library/registry/components/data-table/data-table.tsx#L79-L141) | `useReactTable` + shadcn `Table`：排序、欄位篩選、欄位顯示切換、勾選、前端或伺服器分頁；**沒有儲存格編輯、沒有公式** |
| 報價單／發票列印 | [template-print.ts#L311-L341](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/examples/app-plugin-template-print-example/server/routes/template-print.ts#L311-L341) | `carbone.render(templatePath, data)` 套 `templates/invoice.docx`；`format=pdf` 時 `convertTo:'pdf'`，需伺服器裝 LibreOffice，沒裝回 `PDF_CONVERTER_UNAVAILABLE` |
| AI 擷取單據 | [structured-extraction-service.ts#L32-L36](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/templates/app-template-examples/server/providers/structured-extraction-service.ts#L32-L36)、[#L148-L165](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/templates/app-template-examples/server/providers/structured-extraction-service.ts#L148-L165)、[schemas.ts#L17-L30](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/templates/app-template-examples/client/pages/ai-structured-extraction/schemas.ts#L17-L30) | 系統 prompt：只擷取事實、來源文字視為不可信資料、缺數字填 null；用 `onlineAgent.background()` + `session.run(..., schema)` 取得符合 JSON Schema 的結果；訂單 schema 含 supplier、currency（CNY/USD/EUR）、items（product/quantity/unitPrice） |
| Excel/CSV 讀入（給 AI 讀） | [document-extractor/src/worker.ts#L74-L82](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/libs/document-extractor/src/worker.ts#L74-L82) | 用 `xlsx`（SheetJS 0.18.5）把工作表轉成列陣列，是為了餵給 AI／知識庫，不是匯入資料表 |
| CSV 匯出 | [realtime-example exports.tsx#L158-L166](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/examples/app-plugin-realtime-example/client/pages/business/exports.tsx#L158-L166) | 背景工作產生 CSV，前端用 Blob 下載 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 金額「分」整數化＋加總 | [shared/procurement.ts#L9-L25](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/shared/procurement.ts#L9-L25) | zod（可拿掉） | 低 | 約 17 行，改寫成純 JS 放進你的 Firebase 倉儲系統，避免 0.1+0.2 浮點誤差；台幣可改成 0 位小數 |
| 報價 vs 目錄價 價差 | [detail.tsx#L492-L500](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/client/pages/procurement/detail.tsx#L492-L500) | 上一列 | 低 | 進貨單每行顯示「這次報價比上次／目錄價貴多少」 |
| 採購／報價資料模型 | [migration#L6-L50](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/database/main/migrations/202611040001_create_procurement.ts#L6-L50) | @nocobase/db | 低（當設計參考）／中（照搬） | 四張表：供應商、物料（含 `unitPriceMinor`）、申請單、明細（含報價快照）。照著設計 Firestore collection 即可 |
| decimal 字串工具 | [decimal.ts](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/libs/db/src/numeric/decimal.ts) | 無（純 BigInt） | 低 | 需要多位小數的成本／匯率計算時直接複製 |
| TanStack 資料表格 | [data-table/](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/ui-library/registry/components/data-table/data-table.tsx) | React、@tanstack/react-table、shadcn Table、`#components/list-feedback` | 中 | 只有 React 專案能用；你的倉儲系統是純 JS，要嘛改 React，要嘛只參考它的「排序/篩選/分頁」狀態設計 |
| DOCX 報價單列印 | [template-print.ts#L311-L341](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/examples/app-plugin-template-print-example/server/routes/template-print.ts#L311-L341) | carbone、LibreOffice（PDF）、Node 伺服器 | 中 | 放到 Firebase Cloud Functions（Node）或一台小 VPS，傳 JSON 進去回 DOCX/PDF；Cloud Functions 上裝 LibreOffice 較麻煩（**未確認**是否可行） |
| AI 結構化擷取 prompt + schema | [structured-extraction-service.ts#L32-L36](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/templates/app-template-examples/server/providers/structured-extraction-service.ts#L32-L36)、[schemas.ts#L17-L30](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/templates/app-template-examples/client/pages/ai-structured-extraction/schemas.ts#L17-L30) | 任一 LLM（Claude 可） | 低 | 只拿 prompt 文字＋JSON Schema，直接呼叫 Claude API 的結構化輸出，把廠商報價 Email／LINE 訊息變成進貨明細 |
| 狀態機（含保留庫存→扣款→釋放補償） | [lifecycle/](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/libs/lifecycle/src/definition.ts#L546)、[purchase.ts](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/examples/app-plugin-lifecycle-example/server/lifecycles/purchase.ts) | @nocobase/lifecycle、db、jobs | 高 | 建議只抄「狀態列舉＋轉換表」的設計，不要整包搬 |
| Claude Code runner | [agent-runner/src/agent/adapters/claude.ts](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/agent-runner/src/agent/adapters/claude.ts#L30) | @anthropic-ai/claude-agent-sdk 0.3.285 | 高 | 想做「網頁上按按鈕叫 Claude Code 在我電腦跑任務」時參考；1,142 行（`wc -l`） |
| Skills 寫法 | [app-skills/skills/](https://github.com/nocobase/nocobase/tree/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills) | 無 | 低 | 參考怎麼把「你的倉儲系統開發規則」寫成 Claude Code Skill（references 分檔、附可執行範例） |

## 7. AI／Claude 整合

- **兩條 AI 路線**（[model-services.md](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/plugins/app-plugin-agents/skills/nocobase-app-plugin-agents/references/model-services.md)）：
  1. **Runner Agents**：在伺服器、VM 或你自己的電腦跑 `nocobase-runner`，接 Claude Code、Codex、OpenCode、Pi 四種原生 adapter（[registry.ts#L17-L24](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/agent-runner/src/agent/adapters/registry.ts#L17-L24)），其他走 ACP 協定。Claude adapter 用官方 `@anthropic-ai/claude-agent-sdk` 的 `query()`，並預設關閉 Claude Code 的非必要網路流量（遙測、更新檢查）（[claude.ts#L88-L101](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/agent-runner/src/agent/adapters/claude.ts#L88-L101)）。
  2. **OnlineAgent／模型閘道**：App 自己呼叫模型（對話、知識庫 embedding、rerank、短文字生成），透過 Vercel AI SDK，供應商清單在 [shared/models.ts#L77-L140](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/plugins/app-plugin-agents/shared/models.ts#L77-L140)，Anthropic 在 [server/online/providers.ts#L187-L188](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/plugins/app-plugin-agents/server/online/providers.ts#L178-L230) 用 `createAnthropic(settings)(model)`（`languageModel()` 的 switch）。API Key 以 secrets 服務加密保存，每次呼叫記錄到 `agModelUsage` 並依設定的單價算成本。
- **Prompt 放哪**：各功能自己的 service 檔，例如 AI 擷取的 `PROMPT` 常數；AI 員工的工作規則在文件 `docs/docs/en/capabilities/ai-employee/work-rules.md`（只看了檔名，內容未確認）。
- **Skills**：有，而且是 v3 的核心開發方式——repo 內 38 份 `SKILL.md`，對外用 `npx skills add nocobase/skills-v3 --skill nocobase-create-app` 安裝（README）。範本內 `.cursor/mcp.json` 只掛 shadcn 的 MCP。
- **MCP**：v3 搜尋 `mcp` 只出現在 acp-bridge／runner／agent-sessions 等內部協定程式，**沒有找到 v3 版 MCP server**；v2（main 分支）有 `plugin-mcp-server` 外掛（只看了目錄名）。
- **能不能換成 Claude**：可以，而且是一等公民（Runner 的 Claude Code adapter＋模型服務的 Anthropic provider）。
- 和「影片／腳本生成」無關，此專案沒有影片功能。

## 8. 擴充方式與 API

- **外掛**：`pnpm plugin:create`（`packages/tools/create-plugin`）建立；在 `server/plugins.ts`、`client/plugins.ts` 註冊；第三方／付費外掛用 `pnpm nocobase plugin register <package>`。
- **HTTP API**：所有 `/api` 路由都要宣告給 OpenAPI 文件（`app-server/src/router/openapi/`），可匯出 API 文件；採購範例的 API 例：`GET /api/procurement?q=&status=`、`POST /api/procurement`、`PATCH /api/procurement/{id}`、`POST /api/procurement/{id}/fire`（[procurement.md](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/docs/procurement.md)）。
- **API Key**：[api-keys README](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/plugins/app-plugin-api-keys/README.md)：`x-api-key` 標頭，以建立者身分與角色通過權限檢查——這就是你的 Firebase 系統呼叫 NocoBase 的方式。
- **唯讀資料庫瀏覽 API**：[database-explorer README](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/plugins/app-plugin-database-explorer/README.md)，列出連線、資料表、欄位，不寫入。
- **外部資料來源**：可把另一個 App 的 SQL 資料庫接成外部資料源（docs `capabilities/data-sources`）；Firestore 不在支援方言內。
- **Webhook**：v3 沒有通用 Webhook 外掛；只在 lifecycle 範例裡模擬金流／發票供應商回呼（sandbox）。要收 Webhook 得自己寫 Hono 路由。

## 9. 程式品質與風險

- **維護**：非常活躍。`.changeset/` 有 1,542 個檔案（`grep -c '^.changeset/'`），掃描當天仍有 push；33 個 GitHub workflow。
- **測試**：全清單 2,073 個 `*.test.ts/tsx/mjs` 檔（`grep -cE '\.test\.(ts|tsx|mjs)$'`），有 DB 方言整合測試、Playwright 測試；我沒有執行任何測試。
- **成熟度風險（最大）**：全部套件都是 beta；v3 是**整個重寫**，與 v1/v2 架構完全不同，v2 的大量外掛（匯入匯出、公式欄位、圖表、甘特、行事曆、MCP server 等 110 個目錄）在 v3 尚未有對應；網路上的 NocoBase 教學多半是 v2 的，會混淆。
- **分支混亂**：任務資料顯示預設分支是 `v3-develop`，但 repo 內 [.github/V3-MIGRATION.md#L25](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/.github/V3-MIGRATION.md#L25) 還寫「`main` 是預設分支、`v3-develop` 預計取代它」，屬過渡期。
- **授權風險**：v3 核心套件未標授權（見第 2 節）。
- **資安／隱私**：設計上相當嚴謹——AI 擷取 prompt 明確防 prompt injection；API Key 只能用建立者權限；repository-routes 註明自身不含驗證，要自己加（這是坑：照抄會開出沒保護的 API）。Runner 會在你的機器執行 coding agent，等於讓遠端任務在本機跑指令，要小心。
- **遙測**：grep `telemetry|posthog|sentry|gtag` 在套件程式碼中沒找到 NocoBase 自家遙測；只有 Claude Code 自己的非必要流量被預設關掉。
- **AI 規則檔**：repo 內 AGENTS.md／CLAUDE.md／SKILL.md 很長且很「指令化」（例如要求 agent 自動探測付費 registry 並安裝），拿來參考時要自己判斷，不要讓 Claude 盲從。
- **硬體**：Node 24 + 建置前端，低階主機可能吃力；實際記憶體需求**未確認**。

## 10. 跟其他專案組合的建議

- **你的 Firebase 倉儲系統（A）＋ NocoBase 範例（B）＋ 網頁 Excel 專案（C）**：
  - 從 B 拿：金額整數化、價差顯示、採購四張表的資料設計、AI 擷取 prompt＋JSON Schema、DOCX 報價單列印。這些都能「抄設計、用純 JS 重寫」接到 A，不必搬框架。
  - 網頁版 Excel 請找 01-web-excel 分類的專案（例如 Univer、Luckysheet／Fortune-sheet 類）當 C；NocoBase v3 只有 TanStack 資料表，可參考它的「伺服器分頁＋排序」API 設計，讓 C 的試算表背後接 Firestore 或 SQL。
  - 價格追蹤（爬價、降價通知）NocoBase 沒有，要搭配 02 分類的 Discount-Bandit 類專案。
- **如果你想換掉 Firebase、整套重來**：可以考慮直接用 `pnpm create @nocobase/app@beta` 開一個 v3 App，讓 Claude Code 依它的 Skills 寫出「商品／供應商／進貨／庫存」模組——權限、登入、API 文件、狀態機都免費得到。代價：要自己管 Node 伺服器與 SQL 資料庫、beta 期 API 可能變。
- **如果想要「不寫程式、網頁上拉一拉就有進銷存」**：那是 v2（main 分支），需另外評估 v2，本資料包未深入掃 v2 程式碼。

## 11. 價格相關功能檢查表

- **商品與價格資料模型**：**部分有（範例）**。採購範例有「物料＋單價（`unitPriceMinor`）」與「供應商」表（[migration#L13-L20](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/database/main/migrations/202611040001_create_procurement.ts#L13-L20)）。**沒有**多單位換算、價目表、客戶別價格；多幣別只在 AI 擷取 schema 有 `currency` 列舉（CNY/USD/EUR），採購範例文件明說「USD 是唯一幣別」；匯率**沒有**。
- **進價：多家供應商報價、比價、RFQ、採購單**：**部分有**。有採購申請單＋供應商選擇＋「報價 vs 目錄價」價差（[detail.tsx#L492-L500](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/app/app-skills/skills/nocobase-app-development/assets/business-examples/procurement/client/pages/procurement/detail.tsx#L492-L500)）、審核流程；**沒有**同一品項多家供應商並排比價、**沒有**詢價單（RFQ）。範例 App 有 `quotationReviewTasks` 報價審核表（[migration](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/templates/app-template-examples/database/main/migrations/202609300002_create_quotation_review_tasks.ts)），但之後的 migration `202610100001_drop_review_tasks_and_daily_reports` 已把它刪除（只看檔名推斷，內容未確認）。
- **成本：庫存估值（FIFO／移動平均）、到岸成本、毛利定價**：**沒有**。在 `packages/` 與 `ui-library/` 的 .ts/.tsx 中 grep `fifo|landed cost|moving average|gross margin`（不分大小寫）0 筆。只有精確 decimal 工具可用來自己算（[decimal.ts](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/libs/db/src/numeric/decimal.ts)）。
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知**：**沒有**。有通用通知（站內、Web Push、Email）與排程外掛可自行組合，但沒有爬價功能。
- **庫存／倉儲（入庫、出庫、盤點）**：**沒有**現成模組。只有 lifecycle 範例的「保留庫存→扣款→釋放」示範（sandbox 假倉庫，[purchase.ts](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/examples/app-plugin-lifecycle-example/server/lifecycles/purchase.ts)）。**與 Firebase 串接**：沒有原生 Firestore 支援；可行路徑是 (1) Firebase 端用 `x-api-key` 呼叫 NocoBase 的 REST API（[api-keys](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/plugins/app-plugin-api-keys/README.md)）；(2) 在 NocoBase 自寫 Hono 路由接收 Firebase Cloud Functions 的 Webhook；(3) CSV 匯出（[exports.tsx](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/examples/app-plugin-realtime-example/client/pages/business/exports.tsx#L158-L166)）。v3 **沒有** Excel 匯入成資料表的功能（xlsx 只用來給 AI 讀文件）。
- **台灣在地化**：**繁中介面有（部分）**——有 README.zh-TW.md，全清單中 55 個路徑含 `zh-TW`（多為各外掛 `locales/zh-TW.ts`），對比 `zh-CN` 243 個，繁中覆蓋較少。**新台幣**：沒有（grep `TWD`／`新台幣` 0 筆；範例都用 USD 與 `Intl.NumberFormat('en-US')`）。**台灣稅制／電子發票**：沒有。lifecycle 範例的「電子發票」流程是串假的發票供應商，稅號格式是 15–20 碼（較接近中國納稅人識別號格式，[invoice.ts#L57](https://github.com/nocobase/nocobase/blob/3681eb091e6785c395b8ba7e511857aa4b3d23c5/packages/examples/app-plugin-lifecycle-example/server/lifecycles/invoice.ts#L57)），不是台灣 8 碼統編，也沒有串財政部電子發票平台。

## 關鍵字

NocoBase、NocoBase 3、v3-develop、無程式碼、低程式碼、no-code、low-code、AI 寫程式、Claude Code、Claude Agent SDK、Skills、SKILL.md、Agent Runner、Codex、業務系統、ERP、採購單、procurement、報價、quotation、價差、price difference、金額整數化、minor units、decimal、TanStack Table、data table、shadcn、Hono、React、Vite、SQLite、PostgreSQL、MySQL、schema as code、migration、狀態機、lifecycle、權限、RBAC、API Key、OpenAPI、Carbone、DOCX 列印、PDF、AI 結構化擷取、structured extraction、Vercel AI SDK、Anthropic、Apache-2.0、NocoBase License、付費外掛、Approval、Firebase 串接、繁體中文
