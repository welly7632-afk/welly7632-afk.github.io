# teableio/teable — 跑在 PostgreSQL 上的「資料庫型試算表」（Airtable 開源替代品），附一個 MIT 授權的高效能 Canvas 表格元件
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：f8be01f
> GitHub：https://github.com/teableio/teable｜⭐ 21952｜授權：混合授權：apps/ 為 AGPL-3.0（附品牌保護條款）＋ packages/ 為 MIT｜主要語言：TypeScript｜最近更新：2026-11-04

> 以下所有程式碼連結都固定在 commit `f8be01fadb86790d3d3a878bedd10cf949f9a8f8`。我只引用自己實際打開過的檔案；沒查到或無法驗證的地方一律標「未確認」。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Teable 不是「網頁版 Excel」，而是「長得像試算表的資料庫」——每張表是一張真的 PostgreSQL 資料表、每一欄是有型別的欄位（文字、數字、單選、附件、關聯、公式…），公式是「整欄套用」而不是 A1 儲存格參照。它比較像開源版 Airtable／多維表格。

**對你（台灣小老闆、自己用 Claude 寫倉庫進銷存網頁、跑廣告）最實際的用法：**

1. **直接自架當「進銷存／商品主檔／成本表」後台**：用 Docker 起一套（Teable＋PostgreSQL＋Redis），建「商品」「進貨」「出貨」「供應商報價」幾張表，用「關聯（Link）＋彙總（Rollup）＋公式」算庫存、平均成本、毛利。多人可同時編輯、有表單、看板、日曆、紀錄歷史、復原／重做。
2. **當你自己 Firebase 網頁的「資料管理介面」**：Teable 有完整 REST API＋個人存取權杖（Access Token），你現有的純 JavaScript 倉庫網頁可以透過 API 讀寫 Teable 的表；或反過來把 Firestore 資料定期同步進 Teable 方便自己用試算表介面整理。
3. **拆零件**（這是 A＋B＋C 組合時最有價值的）：
   - `packages/sdk/src/components/grid`：一套 **MIT 授權、Canvas 繪製、可撐百萬列的表格元件**（13,133 行，非測試檔），支援凍結欄、拖拉排序、填滿把手、觸控、選取範圍、複製貼上事件。可以搬進你自己的 React 小工具裡當「網頁 Excel 介面」。
   - `packages/core/src/formula` ＋ `packages/formula`：**MIT 授權的公式引擎**（ANTLR 語法＋JS 求值器，81 個函數），可以在瀏覽器裡直接算「{售價} - {成本}」這種欄位公式。
   - `packages/v2/import`：自己寫的串流式 Excel／CSV 匯入器（.xlsx、.xls、XML、HTML 表格都能讀），適合拿去做「上傳供應商報價單 Excel → 轉成 JSON」。
   - `apps/nextjs-app/.../fill.ts`：Excel 式「往下拖拉自動產生數列／日期數列」的邏輯，小而好抄（但在 AGPL 區）。
4. **價格比對／成本計算**：Teable 本身沒有爬價或比價功能，但「多張供應商報價表＋關聯欄位＋公式取最小值」很適合拿來當比價資料庫；爬蟲另外用別的專案寫，結果透過 API 寫進 Teable。
5. **AI 影片／腳本**：社群版只有「AI 幫你寫公式」與欄位 AI 設定的資料結構；AI 對話、App Builder、AI 自動化在開源版**沒有完整實作**（要付費授權或雲端版，見第 2、7 節）。如果要做「商品表 → 自動產生廣告腳本」，比較實際的是：Teable 存商品資料，另寫一支小程式用 Claude API 讀 Teable 的 API 產腳本再寫回去。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

**實際授權（自己讀 [LICENSE](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/LICENSE) 確認）：**

| 範圍 | 授權 | 我怎麼確認 |
|---|---|---|
| `apps/nestjs-backend`、`apps/nextjs-app`（主程式後端與前端） | **AGPL-3.0**＋第 7(e) 條「品牌保護」附加條款 | LICENSE 第 1–37 行；兩個 `package.json` 的 `"license": "AGPL-3.0"` |
| `packages/*`（core、formula、sdk、openapi、ui-lib、icons、v2/* 等） | **MIT** | LICENSE 說 packages 全部 MIT；我數了 `packages/*/package.json` 與 `packages/v2/*/package.json`，58 個寫 `"license": "MIT"`。注意 `packages/formula` 沒有單獨 LICENSE 檔，但 package.json 寫 MIT |
| `plugins/`（外掛 Next.js App） | **AGPL-3.0** | [plugins/LICENSE](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/plugins/LICENSE) 是 AGPL 全文 |
| 公式語法檔 `Formula.g4` | MIT，且註明部分來自 Baserow | [Formula.g4 第 1–25 行](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/parser/Formula.g4#L1-L25) |
| 匯入用的 SheetJS（`xlsx`） | Apache-2.0（第三方） | [import/open-api/NOTICE.md](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/import/open-api/NOTICE.md) |

GitHub 顯示 NOASSERTION，就是因為這種「混合授權＋自訂附加條款」它判斷不出來。

**白話：**
- **個人自己用**：完全可以。自架、改程式都沒問題。
- **公司內部用（不對外提供服務）**：AGPL 也沒問題；只在公司內部跑、沒有讓外部使用者透過網路使用，通常不觸發公開原始碼義務。
- **改了 apps/ 的程式、然後放到網路上給客戶／外部人用**：AGPL 要求你**把修改後的完整原始碼提供給這些使用者**。而且品牌保護條款**禁止你移除或替換 Teable 的名稱、Logo**——也就是說，你不能把它改成「你自己品牌的進銷存系統」對外賣。
- **只拿 packages/ 裡的東西（Grid 元件、公式引擎、匯入器、SDK）**：MIT，最寬鬆，商用、閉源、改名都可以，只要保留授權聲明。**這是 A＋B＋C 組合時應該優先挑的區塊。**
- 小心：`apps/nextjs-app` 裡的「貼上解析」「填滿數列」「Grid 外層整合」都是 AGPL。抄邏輯前要知道這點；想安全就自己重寫（邏輯不難）。

**付費／閉源功能（從程式碼與 README 推斷）：**
- README 明說：官方 Docker 映像 `ghcr.io/teableio/teable` 是「完整產品」，**付費方案用 license key 解鎖 AI 功能與企業功能**；Standalone 自架版的比較表中「AI features（chat, agents）」「App Builder」為 ❌。
- 程式碼佐證：前端 [automation/Pages.tsx](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/automation/Pages.tsx#L9-L60) 在社群版只顯示升級提示，註解寫「實際元件透過 override 提供」；後端 `apps/nestjs-backend/src/features` 下**找不到 automation／workflow／chat 模組**；`packages/openapi/src/admin/enterprise-license/` 有企業授權狀態 API 的型別定義。
- AI 欄位（摘要、翻譯、分類、產圖…）的設定格式在 [ai-config/text.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/field/ai-config/text.ts#L4-L15)，但我在後端**沒找到實際呼叫 LLM 執行這些動作的程式**（`FieldAIActionType.Summary` 只出現在 core 型別、zod 錯誤與前端設定 UI）→ 社群版能否真的跑 AI 欄位：**未確認，傾向付費版才有**。
- `plugins/src/app/sheet-form-view`：原本用 Univer 做的「試算表表單設計器」已移除，[註解寫明](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/plugins/src/app/sheet-form-view/components/Pages.tsx#L43-L44)「Univer 0.3 無法在 React 19 初始化，此檢視目前是空的」。

---

## 3. 技術棧與執行需求

| 項目 | 內容（出處） |
|---|---|
| 語言 | TypeScript（我數了檔案清單，`.ts/.tsx` 共 8,183 個檔） |
| 前端 | Next.js 16.4.2、React 19.2.3、Tailwind、shadcn/ui（`packages/ui-lib`）、TanStack Query、Zustand、Milkdown／Tiptap（長文字編輯）、CodeMirror（公式編輯器） |
| 表格元件 | 自製 Canvas Grid（`packages/sdk/src/components/grid`），依賴 `scroller`、`react-hammerjs`（觸控）、`lru-cache`、`react-hotkeys-hook` |
| 後端 | NestJS 12（`apps/nestjs-backend`）、Prisma 6.2（系統資料表）、Knex 3.1＋`pg`（動態使用者資料表）、BullMQ（背景工作）、ioredis |
| 即時協作 | ShareDB 5.2.2（OT）＋ SockJS WebSocket（路徑 `/socket`），多台伺服器時用 Redis Pub/Sub |
| 資料庫 | **PostgreSQL 必須**（Makefile 的 `switch-db-mode` 只剩 postgres 選項；docker-compose 用 `postgres:15.4`） |
| 快取／佇列 | Redis（docker-compose 用 `redis:7.2.4`）；開發用 `.env.example` 裡 `BACKEND_CACHE_PROVIDER=sqlite` 也可 |
| 檔案儲存 | 本機（`BACKEND_STORAGE_PROVIDER=local`）或 S3／MinIO |
| 公式 | ANTLR4（`antlr4ts 0.5.0-alpha.4`）語法；後端把公式**翻譯成 PostgreSQL SQL**（`packages/v2/formula-sql-pg`），前端用 JS 求值器做預覽 |
| 匯入 | PapaParse（CSV）、自製串流 Excel 解析器（ZIP/BIFF/XML/HTML），SheetJS 只用到 `SSF`（數字格式） |
| AI SDK | Vercel `ai` 7.x＋`@ai-sdk/anthropic`、openai、google、azure、bedrock、deepseek、mistral 等 |

**部署方式**（[dockers/examples/standalone/docker-compose.yaml](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/dockers/examples/standalone/docker-compose.yaml)）：三個容器 `teable`（3000 埠）＋`teable-db`（Postgres）＋`teable-cache`（Redis），填好 `.env` 後 `docker compose up -d`。那份 README 寫「Telemetry is disabled」。

**硬體**：不需要 GPU。官方沒有寫最低規格（未確認）；以 Next.js＋NestJS＋Postgres＋Redis 四個行程同時跑來估，個人使用建議至少 2 vCPU／4 GB RAM 的 VPS 或家用 NAS。**沒辦法放在 Firebase Hosting 上**（要長駐的 Node 伺服器與 Postgres）。

**API Key 與費用**：
- 基本試算表功能：**不需要任何 API Key**，只要主機費。
- 「AI 寫公式」：要在管理後台設定自己的 LLM 供應商金鑰（可填 Anthropic），依用量付費給供應商。
- AI Chat／App Builder／AI 自動化：要用官方 [teable-deployment](https://github.com/teableio/teable-deployment) 的「完整版自架」或雲端版，且需付費授權（價格請看官網，這裡未確認）。

---

## 4. 程式架構地圖

（依 `git ls-tree` 檔案清單整理；共 9,378 個檔，括號內是我數的檔案數）

```
teable/
├── LICENSE / AGPL_LICENSE          混合授權說明（apps=AGPL、packages=MIT、品牌保護條款）
├── apps/
│   ├── nestjs-backend/ (1732)      【AGPL】後端 API 伺服器
│   │   └── src/
│   │       ├── features/           各功能模組：record、field、view、table、selection（複製貼上）、
│   │       │                       import、export、undo-redo、calculation（依賴圖）、ai、plugin、
│   │       │                       google-sheet-import、airtable-import、access-token、oauth…
│   │       ├── share-db/           ShareDB 即時協作：Postgres adapter、Redis pubsub
│   │       ├── ws/                 WebSocket（SockJS）gateway
│   │       └── db-provider/        把篩選／排序／分組／公式轉 SQL 的 Postgres 實作
│   └── nextjs-app/ (1369)          【AGPL】前端主程式
│       └── src/features/app/
│           ├── blocks/view/grid/   Grid 檢視整合（GridViewBaseInner.tsx、copyAndPaste、fill.ts）
│           ├── utils/clipboard.ts  剪貼簿 HTML 表格解析
│           └── automation/         社群版只有升級提示
├── packages/                       【全部 MIT】
│   ├── core/ (327)                 資料模型（欄位、檢視、紀錄）、公式求值器、OT 指令產生器
│   │   └── src/formula/            81 個公式函數 + EvalVisitor
│   ├── formula/ (32)               ANTLR 語法檔與產生的 Lexer/Parser、欄位參照分析
│   ├── sdk/ (845)                  React SDK：Canvas Grid、編輯器、hooks、外掛橋接（penpal iframe）
│   │   └── src/components/grid/    ★ Canvas 表格元件本體（77 檔、13,133 行非測試）
│   ├── openapi/ (569)              所有 REST API 的 zod schema + axios 用戶端
│   ├── db-main-prisma/ (163)       系統資料表 Prisma schema（Field、View、Ops、Reference…）
│   ├── ui-lib/ (287)、icons/ (287) shadcn 元件、圖示
│   ├── common-i18n/ (178)          介面翻譯（12 語系，只有簡中 zh，沒有繁中）
│   └── v2/ (3410, 48 個子套件)     新一代架構：領域核心、PGlite（瀏覽器內 Postgres）、
│                                   formula-sql-pg（公式→SQL）、import（Excel/CSV 匯入）、
│                                   headless-runtime / headless-cli（無介面執行）…
├── plugins/                        【AGPL】外掛 App（目前只剩空殼 sheet-form-view）
└── dockers/examples/standalone/    docker-compose 自架範例
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| Canvas 表格渲染 | [Grid.tsx L162-L196](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L162-L196)、[RenderLayer.tsx L250](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/RenderLayer.tsx#L250) | 「資料驅動」：你只給 `columns`、`rowCount`、`getCellContent([col,row])`，元件只對可視範圍呼叫 `getCellContent` 再畫到 `<canvas>`。編輯器、選取框才用 DOM 疊在上面 |
| 超大捲動高度 | [InfiniteScroller.tsx L350-L361](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/InfiniteScroller.tsx#L350-L361) | 瀏覽器單一元素高度有上限，所以每 5,000,000px 塞一個空 div 疊起來，撐出百萬列的捲軸 |
| 分頁載入紀錄 | [record-window.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/utils/record-window.ts)、[use-grid-async-records.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid-enhancements/hooks/use-grid-async-records.ts) | 初次載入 64 筆（`INITIAL_LOAD_PAGE_SIZE`），之後依可視範圍每次 300 筆（`LOAD_PAGE_SIZE`），並只抓可視欄位（column projection） |
| 儲存格型別 | [cell-renderer/interface.ts L11-L23](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/cell-renderer/interface.ts#L11-L23) | 11 種：Text、Link、Number、Select、Image、Chart、Rating、User、Boolean、Loading、Button，各有獨立 renderer |
| 公式語法 | [Formula.g4 L27-L56](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/parser/Formula.g4#L27-L56) | 支援字串、數字、布林、四則、比較、`&&`/`||`、`&` 串接、`{欄位}` 參照、函數呼叫；**沒有 A1／範圍參照** |
| 公式函數表 | [functions/common.ts L59-L152](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/functions/common.ts#L59-L152)、[factory.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/functions/factory.ts) | `FunctionName` 列舉＋`FUNCTIONS` 註冊表 |
| 前端求值 | [evaluate.ts L8-L24](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/evaluate.ts#L8-L24) | ANTLR 解析 → `EvalVisitor` 走訪，回傳 `TypedValue`；需要欄位定義 map ＋ 一筆紀錄 |
| 後端求值（主要路徑） | [formula-sql-pg/ARCHITECTURE.md](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/formula-sql-pg/ARCHITECTURE.md) | 公式 AST 轉成 PostgreSQL 表達式（必要時 CTE、generated column），在資料庫內整欄計算 |
| 欄位依賴圖／重算 | [calculation/utils/dfs.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/calculation/utils/dfs.ts)（`hasCycle` L15、`getTopoOrders` L64）、[calculation/README.md](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/calculation/README.md)、[Reference 資料表 L672-L682](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/prisma/template.prisma#L672-L682) | 「欄位→欄位」依賴存進 `reference` 表，拓撲排序決定重算順序、偵測循環；關聯欄位會把一筆變動「裂變」成多筆紀錄重算。另有 `ComputedUpdateOutbox` 等表做非同步重算佇列 |
| 複製（輸出到剪貼簿） | [utils/clipboard.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/utils/clipboard.ts) | 同時放 `text/plain`（TSV）與帶 Teable 標記的 `<table>` HTML（內含欄位定義），所以 Teable 之間貼上能保留型別 |
| 貼上（含從 Excel／Google 試算表） | [copyAndPaste.ts L99-L132](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/utils/copyAndPaste.ts#L99-L132)、[parseNormalHtml L120-L132](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/utils/clipboard.ts#L120-L132)、[core parseClipboardText](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/utils/clipboard.ts#L6) | 有 HTML 就用 DOMParser 找 `<table>`、取每格 `textContent`；沒有就解析 TSV（處理引號、Windows 換行）。貼上範圍超出會詢問是否自動新增列／欄（`getExpandInfo`），送後端 `selection` API 一次寫入 |
| 拖拉填滿 | [fill.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/utils/fill.ts)（L22-L36 判斷數列、L121 `buildFillSelectionPaste`）、[GridViewBaseInner.tsx L1326](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/GridViewBaseInner.tsx#L1326) | 只支援**垂直**填滿；選兩個以上不同數字 → 產生等差數列；選兩個不同日期 → 日期數列；否則重複複製 |
| 復原／重做 | `apps/nestjs-backend/src/features/undo-redo/`（`operations/`、`stack/`、`open-api/undo-redo.service.ts`） | **伺服器端**記錄每個操作（新增/刪除紀錄、改欄位、貼上…）的反向操作；v2 另有 `packages/v2/adapter-undo-redo-keyv` |
| 即時協作 | [share-db.service.ts L46](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.service.ts#L46)、[share-db.adapter.ts L94](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.adapter.ts#L94)、[useConnection.tsx L10-L49](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/context/app/useConnection.tsx#L10-L49) | ShareDB（OT）：前端連 `/socket`，後端自訂 adapter 從 Postgres 讀快照、op 存在 [`ops` 表 L657-L670](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/prisma/template.prisma#L657-L670)；有 Redis 時用 Redis Pub/Sub 讓多台伺服器同步 |
| CSV/Excel 匯入 | [import.class.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/import/open-api/import.class.ts)（`CsvImporter` L365、`ExcelImporter` L495）、[ExcelImportAdapter.ts L25-L41](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/import/src/adapters/ExcelImportAdapter.ts#L25-L41) | 看檔頭判斷格式：`PK` → xlsx（ZIP）、`<Workbook` → Excel 2003 XML、`<html/<table` → HTML 假 xls、其他 → BIFF（舊 .xls）。串流逐列讀、分批寫入，前 30 列自動找表頭，可多個工作表一次匯入成多張表 |
| 匯出 | [export-open-api.controller.ts L12-L26](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/export/open-api/export-open-api.controller.ts#L12-L26) | `GET /api/export/:tableId` 只輸出 **CSV**；整個 Base 可匯出成 `.tea`（zip＋structure.json，見 `packages/v2/dottea`） |
| 資料模型 | [template.prisma Field L333-L370](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/prisma/template.prisma#L333-L370)、[record.ts L44-L66](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/record/record.ts#L44-L66)、[FieldType L2-L23](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/field/constant.ts#L2-L23) | 欄位定義存在 `field` 表（含 `dbFieldName`、`dbFieldType`、`options` JSON）；使用者資料存在每張表各自的實體 Postgres 資料表。20 種欄位型別 |
| 檢視 | [view/constant.ts L1-L16](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/view/constant.ts#L1-L16) | 6 種檢視：Grid、Calendar、Kanban、Form、Gallery、Plugin；列高 5 級（short～extraTall＋autoFit） |
| AI 寫公式 | [openapi/formula/ai.ts L3](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/openapi/src/formula/ai.ts#L3)、[AiPromptContainer.tsx](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/editor/formula/components/AiPromptContainer.tsx)、[ai.service.ts L727-L752](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/ai/ai.service.ts#L727-L752) | 把「欄位名清單＋所有函數說明」組成 prompt，呼叫 `/api/{baseId}/ai/generate-stream` 串流回傳 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| **Canvas Grid 表格元件**（MIT） | [packages/sdk/src/components/grid](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx) | React 18/19、lodash、lru-cache、react-use、react-hotkeys-hook、scroller、react-hammerjs、react-textarea-autosize、ts-key(code)-enum、`tailwindcss/colors`；少量 `@teable/ui-lib`（`cn`、Input、Button、Tooltip、`useUiDirection`）、`@teable/icons`、`@teable/core`（`getRandomString`、`Colors`） | 中 | 整個 grid 資料夾複製出來，把 `@teable/*` 那幾個小函式換成自己的（或一起帶 ui-lib/icons，也是 MIT）。用 Vite 打包成一個 `mountGrid(el, options)` 函式給你的純 JS 網頁呼叫。資料來源接 Firestore：`getCellContent` 從記憶體陣列讀、`onCellEdited` 寫回 Firestore |
| **公式引擎**（MIT） | [packages/core/src/formula](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/evaluate.ts) ＋ [packages/formula](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/parser/Formula.g4) | `antlr4ts`、dayjs、lodash；`evaluate()` 需要 `FieldCore` 物件（core 的欄位模型） | 中 | 適合「欄位公式」：例如商品表 `{售價}*(1-{折扣})-{成本}`。直接 `npm i @teable/core`（package.json 設為公開發佈，npm 上版本未確認）或複製這兩個資料夾（約 7,500 行非測試）。注意：它不是 Excel 的 A1 公式引擎，要 Excel 相容請改看 HyperFormula |
| **串流 Excel 匯入器**（MIT） | [packages/v2/import/src/adapters](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/import/src/adapters/ExcelImportAdapter.ts) | Node.js（用檔案系統暫存）、`yauzl`、`saxes`、`htmlparser2`、`papaparse`、SheetJS `SSF`、`neverthrow`、`@teable/v2-core` 型別 | 中 | 適合放在 Cloud Functions／Node 小服務：上傳供應商報價單 → 串流解析成列陣列 → 寫 Firestore。excel 子資料夾 1,718 行；要把 `v2-core` 的型別與錯誤包裝換掉 |
| **剪貼簿 TSV 解析** `parseClipboardText`（MIT） | [packages/core/src/utils/clipboard.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/utils/clipboard.ts#L6) | 無 | 低 | 一個純函式，貼到任何網頁就能把「從 Excel 複製的文字」轉成二維陣列 |
| 剪貼簿 HTML 表格解析＋Teable 標記 | [apps/nextjs-app/src/features/app/utils/clipboard.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/utils/clipboard.ts) | 瀏覽器 DOMParser | 低（但 **AGPL**） | 想法可借：複製時在 `<table>` 上塞自訂屬性存欄位定義。商用請自己重寫 |
| 填滿數列邏輯 | [fill.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/utils/fill.ts) | 無 | 低（但 **AGPL**） | 搭配 Grid 的 `onFillSelection` 事件使用；邏輯簡單可自行重寫 |
| 欄位依賴拓撲排序 | [calculation/utils/dfs.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/calculation/utils/dfs.ts) | 無 | 低（但 **AGPL**） | 自己做「改成本 → 自動更新毛利、庫存價值」時的重算順序參考 |
| REST API 型別＋用戶端（MIT） | [packages/openapi/src](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/openapi/src/record/get-list.ts) | axios、zod | 低 | 你若自架 Teable，前端可直接用這套型別安全的 API 函式（`getRecords`、`createRecords`…）存取 |
| 數字格式定義（MIT） | [formatting/number.ts L3-L7](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/field/formatting/number.ts#L3-L7) | zod | 低 | 小數／百分比／貨幣三種格式的 schema 與格式化函式 |
| 瀏覽器內 PGlite 版核心（實驗） | [packages/v2/container-browser](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/container-browser/ARCHITECTURE.md) | `@electric-sql/pglite`、整個 v2 core | 高 | 理論上可在瀏覽器裡跑一個「不需伺服器的 Teable 核心」；文件只說是 DI 組裝，實際成熟度**未確認** |

---

## 7. AI／Claude 整合

- **支援的模型供應商**：[LLMProviderType L26-L45](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/openapi/src/admin/setting/update.ts#L26-L45) 列了 OpenAI、**Anthropic**、Google、Azure、Cohere、Mistral、DeepSeek、通義千問、智譜、零一萬物、xAI、Together、Ollama、Amazon Bedrock、OpenRouter、OpenAI 相容、Vercel AI Gateway。實際建立 Anthropic 客戶端在 [ai/util.ts L269](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/ai/util.ts#L269)（`createAnthropic`）。→ **Claude 可以直接接**，在管理後台填 Anthropic API Key 即可。
- **Prompt 放哪**：社群版看得到的只有「AI 寫公式」的 prompt 組裝 [getFormulaPrompt](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/openapi/src/formula/ai.ts#L3)（69 行，把欄位名與 80 個函數說明塞進去）。`generateStream` 本身只是把前端傳來的 prompt 原封不動丟給模型。
- **AI 欄位**（摘要、翻譯、改寫、擷取、分類、標籤、自訂、產圖、評分）：只有設定 schema（[ai-config/text.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/field/ai-config/text.ts#L4-L15)）和前端設定畫面；執行端在社群版找不到 → **未確認／應為付費功能**。
- **MCP**：後端有 OAuth 動態用戶端註冊（RFC 7591），註解寫明「MCP clients call this on first connect」（[oauth-server.controller.ts L66-L72](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/oauth/oauth-server.controller.ts#L66-L72)），MCP 權限範圍定義在 [core/auth/oauth.ts L119-L130](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/auth/oauth.ts#L119-L130)。但**MCP 伺服器本體（工具定義、/mcp 端點）在這個 repo 搜不到**（我 grep 了 `@modelcontextprotocol`、`McpServer`、`/mcp`）→ 在雲端或付費版裡，社群版能否讓 Claude Desktop／Claude Code 用 MCP 直接操作表格：**未確認**。
- **Skills**：沒有 Claude Skills 相關檔案。
- **AI 影片／腳本**：沒有任何影片生成功能。
- **怎麼換成 Claude／自己接**：最簡單的做法是不依賴 Teable 內建 AI，自己寫一支腳本：用 Access Token 呼叫 `GET /api/table/{tableId}/record` 取商品資料 → 丟給 Claude 產廣告腳本 → `PATCH` 寫回「腳本」欄位。

---

## 8. 擴充方式與 API

1. **REST API**：所有路由以 zod 定義在 `packages/openapi/src`（例如紀錄列表 `GET /table/{tableId}/record`，見 [get-list.ts L287-L291](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/openapi/src/record/get-list.ts#L287-L291)；新增 `POST`、更新 `PATCH` 在 `create.ts`、`update.ts`）。用 Access Token（`features/access-token`）當 Bearer 驗證。還有 upsert、批次更新、上傳附件、按鈕點擊、紀錄歷史等。
2. **即時訂閱**：前端可用 ShareDB 連 `/socket` 訂閱表格變更（SDK 已包好）；伺服器端 Webhook：我在 openapi 沒找到 webhook 路由（只在 admin setting 出現字樣）→ **未確認**，自動化觸發屬付費功能。
3. **外掛（Plugin）**：外掛是 iframe 網頁，透過 [packages/sdk/src/plugin-bridge](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/plugin-bridge/bridge.ts)（penpal）和主程式溝通，可放在儀表板、檢視、右鍵選單、側邊面板（後端有 `plugin-panel`、`plugin-context-menu` 模組）。官方內建圖表外掛 `features/plugin/official/chart`。
4. **SQL 查詢**：`features/base-sql-executor` 可對 Base 直接下 SQL（README 也列「SQL query」）。
5. **匯入來源**：CSV、Excel、Google Sheets（`features/google-sheet-import`，走 Google API）、Airtable（`features/airtable-import`）、`.tea` 檔。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。最新 commit 2026-11-03（`refactor(data-query): …`），掃描當天仍有推送；GitHub 21,952 星。
- **測試**：我數檔名，`*.spec.ts(x)`＋`*.e2e-spec.ts` 共 2,114 個，其中後端 e2e 230 個；CI 有 unit-tests、integration-tests、v2-core-tests、v2-benchmark-tests、linting 等 7 個 workflow。
- **架構正在大改**：`packages/v2`（3,410 檔、48 個子套件）是新一代核心，後端到處有 `UseV2Feature`、`V2FeatureGuard` 灰度切換。好處是持續進化；壞處是你若 fork 改 apps/，之後合併上游會很痛。
- **遙測／隱私**：Sentry、PostHog、Umami 都是 `.env` 選填（預設空白）；standalone README 寫「Telemetry is disabled」。資料全部在你自己的 Postgres。
- **資安**：有 SSRF 防護設定（`TEABLE_SSRF_PROTECTION_DISABLED=false`）、權限守衛（`PermissionGuard`）、OAuth 伺服器。自架時務必改掉預設的 Postgres／Redis 密碼，docker-compose 預設把 Postgres 開在主機 42345 埠，**對外網路要關掉**。
- **已知的坑**：
  - 不是 Excel：沒有 A1 參照、合併儲存格、條件格式、樞紐分析、xlsx 匯出；匯入 Excel 只拿「值」，公式與樣式會遺失（以解析器只輸出 `values` 判斷）。
  - 沒有繁體中文介面（只有簡中 `zh`）。
  - Grid 元件是 React 元件，不能直接塞進純 JS 網頁，要自己包一層。
  - 品牌保護條款：不能拿掉 Teable Logo。
  - 付費功能用「override」注入，社群版畫面會出現升級提示。
  - Univer 試算表表單外掛已被拿掉（空殼）。

---

## 10. 跟其他專案組合的建議

- **Teable Grid（介面）＋ HyperFormula（Excel 公式）＋ SheetJS（xlsx 匯出）**：想要「真正像 Excel 的網頁版」：用 Teable 的 Canvas Grid 當畫面（MIT，效能好、觸控有支援），儲存格公式交給 HyperFormula（A1 參照、跨工作表），匯出交給 SheetJS。資料存 Firestore。
- **Teable 整套自架（後台）＋ 你自己的 Firebase 倉庫網頁（前台）**：Teable 當「老闆用的資料庫試算表」（進貨、成本、供應商報價），你的網頁負責現場出入庫掃碼。兩邊用 REST API 同步。比自己從頭寫試算表後台省力很多。
- **Teable（資料）＋ 爬價／比價專案 ＋ Claude**：爬蟲把各平台價格寫進 Teable「價格紀錄」表，用公式欄位算價差與毛利；再用 Claude 讀表產出廣告文案／短影音腳本寫回去。
- **和 NocoDB／APITable 比**：三者都是 Airtable 型。Teable 的強項是 Canvas 表格效能、資料直接在 Postgres 實體表（可直接下 SQL）、packages 為 MIT 方便拆；弱項是 AI 功能付費、無繁中介面。
- **不建議**：拿 Teable 去做「需要 Excel 精確相容（合併儲存格、跨表公式、格式保真）」的工具，那請看 Univer／o-spreadsheet。

---

## 11. 網頁 Excel 能力檢查表

| 能力 | 狀態 | 程式碼位置與說明 |
|---|---|---|
| **渲染方式** | 有：Canvas | [RenderLayer.tsx L250](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/RenderLayer.tsx#L250) 主畫面是 `<canvas>`；編輯器／選取等互動層是 DOM（`InteractionLayer.tsx`）。版面繪製主體 [layoutRenderer.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/renderers/layout-renderer/layoutRenderer.ts)（2,226 行） |
| **虛擬捲動** | 有 | 只畫可視範圍（`useVisibleRegion`、`CoordinateManager`）；[InfiniteScroller.tsx L350-L361](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/InfiniteScroller.tsx#L350-L361) 用多個 5,000,000px 佔位 div 突破瀏覽器高度上限 |
| **10 萬列以上效能** | 有（官方宣稱，未實測） | README 宣稱「millions of rows」；資料端依可視範圍分頁抓取（[record-window.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/utils/record-window.ts) 64／300 筆），排序篩選在 Postgres 做，所以前端不用一次載入 10 萬列。我沒有執行任何程式，數字未實測 |
| **公式：函數數量** | 有：81 個 | 計算方式：數 [common.ts L59-L152](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/functions/common.ts#L59-L152) 的 `FunctionName` 列舉成員（用 `grep -cE "^\s+\w+ = '"`）＝81，並逐一核對 [factory.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/functions/factory.ts) `FUNCTIONS` 表也是 81 個。分類：數值 19、文字 18、邏輯 9、日期時間 25、陣列 7、系統 3。說明文件 `func-define.ts` 收 80 個（少 `TEXT_ALL`）。另有 4 個別名（ARRAYJOIN 等，[function-aliases.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/function-aliases.ts)）。**沒有** VLOOKUP、SUMIF、INDEX/MATCH 這類 Excel 函數（查找改用「關聯＋Lookup／Rollup 欄位」） |
| **公式：解析器** | 有 | ANTLR4：[Formula.g4](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/parser/Formula.g4#L27-L56)、`FormulaLexer.g4`；JS 求值 [evaluate.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/evaluate.ts#L8-L24)；伺服器端轉 SQL（`packages/v2/formula-sql-pg`） |
| **公式：依賴圖／重算** | 有（欄位層級） | [dfs.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/calculation/utils/dfs.ts) 拓撲排序＋循環偵測；依賴關係存 `reference` 表；重算由資料庫與 `ComputedUpdateOutbox` 佇列處理 |
| **陣列公式** | 部分 | 沒有 Excel 動態陣列；但多值欄位（多選、關聯、Lookup）可用 ARRAY_JOIN／ARRAY_UNIQUE／ARRAY_FLATTEN／ARRAY_COMPACT、TEXTSPLIT 處理 |
| **跨工作表參照** | 沒有（用關聯取代） | 語法只有 `{欄位}` 參照（[Formula.g4](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/parser/Formula.g4#L52)），跨表要先建 Link 欄位，再用 Lookup／Rollup／ConditionalRollup 欄位帶值 |
| **自訂函數** | 沒有（無外掛 API） | 函數寫死在 `FunctionName` 列舉與 `FUNCTIONS` 表；要加只能改原始碼（前端 JS 版與後端 SQL 版兩邊都要加） |
| **儲存格編輯** | 有 | Grid 內建 Text／Number／Select／Boolean／Rating 編輯器（`grid/components/editor`）；`grid-enhancements/editor` 另有日期、附件、關聯、使用者、Markdown 編輯器；事件 `onCellEdited` |
| **複製貼上（含 Excel／Google 試算表）** | 有（只取值） | [copyAndPaste.ts L99-L132](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/utils/copyAndPaste.ts#L99-L132)：讀 `text/html` 的 `<table>` 或 `text/plain` TSV，所以從 Excel／Google 試算表直接 Ctrl+V 可以貼；格式、顏色、公式會遺失，伺服器端依欄位型別轉換。也支援貼上檔案到附件欄（`filePasteHandler`） |
| **拖拉填滿** | 有（僅垂直） | [Grid.tsx `onFillSelection`](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L143-L147) 註解寫明「Only vertical fill is supported」；[fill.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/utils/fill.ts#L22-L36) 支援數字等差、日期數列 |
| **復原／重做** | 有（伺服器端） | `apps/nestjs-backend/src/features/undo-redo/`（operations 有 paste-selection、create/delete records/fields/views、convert-field 等）；Grid 提供 `onUndo`／`onRedo` 事件 |
| **數字格式** | 有 | [number.ts L3-L7](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/field/formatting/number.ts#L3-L7)：小數（decimal）、百分比、貨幣三種；日期格式＋時區在 `formatting/datetime.ts`。數字還能「顯示為」進度條／圓環（`show-as`） |
| **條件格式** | 沒有 | 在 `packages/core/src` 與 `packages/openapi/src` grep `conditionalFormat`、`colorRule`、`rowColor` 皆無結果（只有日曆檢視的顏色設定）。單選標籤有顏色 |
| **合併儲存格** | 沒有 | 資料模型是「紀錄×欄位」，沒有合併概念 |
| **凍結窗格** | 有（只凍結欄） | [grid-view-option.schema.ts L16](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/view/derivate/grid-view-option.schema.ts#L16) `frozenColumnCount`；Grid `onColumnFreeze`。凍結列：沒有（只有固定表頭） |
| **欄寬列高** | 有 | 欄寬可拖拉（`onColumnResize`、`useColumnResize`）；列高是整個檢視統一 5 級（[RowHeightLevel](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/view/constant.ts#L1-L7)），不能單列調整 |
| **篩選、排序、分組** | 有 | `packages/core/src/models/view/filter`、`sort`、`group`；後端轉 SQL（`db-provider/filter-query`、`sort-query`、`group-query`）；另有欄位統計列（aggregation） |
| **資料驗證（下拉選單）** | 有 | 單選／多選欄位就是下拉選單（`SelectEditor`）；欄位可設 `notNull`、`unique`（[Field 模型](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/prisma/template.prisma#L333-L370)） |
| **圖表** | 有（外掛／儀表板） | 官方圖表外掛後端 `features/plugin/official/chart`；儀表板 `features/dashboard`；儲存格內迷你圖 `chartCellRenderer.ts`。圖表外掛的前端是否在本 repo：未確認 |
| **樞紐分析** | 沒有 | 全 repo grep `pivot` 無結果；可用「分組＋統計」或 SQL 查詢代替 |
| **圖片／附件** | 有 | `Attachment` 欄位，儲存格內縮圖（`imageCellRenderer.ts`、`ImageManager`）、預覽器 `GridFilePreviewer.tsx`；檔案存本機或 S3／MinIO |
| **匯入 .xlsx／.csv** | 有（開源版） | 自製串流解析器（[ExcelImportAdapter.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/import/src/adapters/ExcelImportAdapter.ts#L25-L41)，支援 xlsx/xls/Excel XML/HTML），SheetJS 只用 `SSF` 做數字格式；CSV 用 PapaParse。**保真度：只匯入值**，自動猜欄位型別；公式、樣式、合併儲存格不保留 |
| **匯出 .xlsx／.csv** | CSV 有；xlsx 沒有 | [export controller](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/export/open-api/export-open-api.controller.ts#L12-L26) 只有 `exportCsvFromTable`；前端與 openapi 中沒有 xlsx 匯出程式（只在匯入 MIME 清單出現 xlsx） |
| **多人即時協作** | 有：OT（ShareDB） | [share-db.service.ts](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.service.ts#L46) 繼承 ShareDB；需要 Node 伺服器＋Postgres，多台需 Redis。Grid 支援顯示其他協作者游標（`collaborators` 屬性） |
| **資料模型** | 有 | 一筆紀錄＝`{ id, fields: { 欄位名或欄位ID: 值 } }`（[record.ts L44-L66](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/record/record.ts#L44-L66)），範例見下方 |
| **存進自己的資料庫（Firestore）** | 需自己接 | Teable 本身只支援 Postgres。若只拆 Grid：Grid 不管資料存哪，你在 `getCellContent` 讀 Firestore 快取、`onCellEdited` 寫回即可 |
| **手機／觸控** | 有 | `isTouchDevice` 時換用 [TouchLayer.tsx](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/TouchLayer.tsx#L3)（react-hammerjs 處理點擊），InfiniteScroller 有觸控拖曳捲軸邏輯 |
| **繁體中文介面** | 沒有（只有簡中） | `packages/common-i18n/src/locales` 有 ar、de、en、es、fr、he、it、ja、ru、tr、uk、zh 共 12 語系；zh 內容是簡體（例：「当前计算任务」）。可自己複製 zh 轉繁體 |
| **嵌入純 JavaScript 網頁** | 不能直接（需 React） | Grid 是 React forwardRef 元件，`peerDependencies` 要 React 18/19。做法：用 Vite 把 Grid＋React 打包成一支 `mountGrid()`，你的純 JS 頁面只呼叫這個函式（範例見下方）。打包後大小：**未確認**（我沒有執行建置）；原始碼規模 77 檔、13,133 行 |
| **API／事件** | 有 | Grid 事件：`onCellEdited`、`onSelectionChanged`、`onCopy`、`onPaste`、`onDelete`、`onFillSelection`、`onColumnResize`、`onRowOrdered`、`onVisibleRegionChanged`…（[Grid.tsx L44-L160](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L44-L160)）；程式控制 `IGridRef`：`scrollToItem`、`setSelection`、`setActiveCell`、`setCellLoading`、`setCellErrors`、`forceUpdate`（[L175-L196](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/grid/Grid.tsx#L175-L196)）。注意：Grid 本身不存資料，「讀寫儲存格」是改你自己的陣列後 `forceUpdate()`。整套 Teable 則用 REST API 讀寫紀錄、ShareDB 監聽變更 |

**資料模型範例**（依 `recordSchema` 與 Field 模型整理，欄位名為示意）：

```json
// 一筆紀錄（GET /api/table/{tableId}/record 的 records[i]）
{
  "id": "recXXXXXXXXXXXXXXX",
  "fields": {
    "商品名稱": "保溫杯 500ml",
    "成本": 120,
    "售價": 299,
    "毛利": 179,                     // 公式欄位：{fldSale} - {fldCost}
    "供應商": [{ "id": "recYYY", "title": "大順貿易" }],  // 關聯欄位（格式依欄位型別，未逐一驗證）
    "分類": "廚房用品"                 // 單選
  },
  "autoNumber": 12,
  "createdTime": "2026-11-04T02:00:00.000Z"
}
// 欄位定義（field 表的一列，options 是 JSON 字串）
{ "id": "fldProfit", "name": "毛利", "type": "formula",
  "options": "{\"expression\":\"{fldSale} - {fldCost}\"}",
  "cellValueType": "number", "dbFieldType": "REAL", "dbFieldName": "毛利" }
```

存 Firestore 的建議：一張表＝一個 collection，一筆紀錄＝一份文件 `{ fields: {...} }`；欄位定義另存一個 `_schema` 文件。公式欄位不要存，前端載入後用 `@teable/core` 的公式引擎或自己的函式即時算。

**嵌入純 JS 網頁的最小範例**（要先用 Vite 打包；`Grid`、`CellType` 取自複製出來的 `packages/sdk/src/components/grid`，未實際建置驗證）：

```js
// grid-entry.jsx —— 用 Vite library mode 打包成 grid-bundle.js
import React, { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Grid, CellType } from './grid'; // 從 packages/sdk/src/components/grid 複製

export function mountGrid(el, { columns, rows, onChange }) {
  function App() {
    const ref = useRef(null);
    return (
      <Grid
        ref={ref}
        style={{ width: '100%', height: '100%' }}
        columns={columns.map((name) => ({ name, width: 140 }))}
        rowCount={rows.length}
        getCellContent={([c, r]) => {
          const v = rows[r][c] ?? '';
          return { type: CellType.Text, data: String(v), displayData: String(v) };
        }}
        onCellEdited={([c, r], cell) => {
          rows[r][c] = cell.data;          // 改記憶體資料
          onChange?.(r, c, cell.data);     // 交給外面寫回 Firestore
          ref.current?.forceUpdate();
        }}
      />
    );
  }
  createRoot(el).render(<App />);
}
```

```html
<!-- 你的純 JS 網頁 -->
<div id="sheet" style="height:600px"></div>
<script type="module">
  import { mountGrid } from './grid-bundle.js';
  mountGrid(document.getElementById('sheet'), {
    columns: ['品名', '成本', '售價'],
    rows: [['保溫杯', 120, 299], ['便當盒', 80, 199]],
    onChange: (r, c, v) => console.log('改了', r, c, v),
  });
</script>
```

（Grid 會用到 Tailwind class 與 `@teable/ui-lib` 的元件；若不帶 Tailwind，部分浮動編輯器樣式會跑掉，需要自己補 CSS——這點未實測。）

---

## 關鍵字

Teable、teableio、網頁版 Excel、線上試算表、資料庫試算表、多維表格、Airtable 替代、NocoDB 替代、自架、self-hosted、PostgreSQL、Canvas 表格、canvas grid、虛擬捲動、virtual scroll、公式引擎、formula engine、ANTLR、欄位公式、Lookup、Rollup、關聯欄位、即時協作、ShareDB、OT、CSV 匯入、Excel 匯入、xlsx import、複製貼上、拖拉填滿、復原重做、REST API、Access Token、外掛、plugin、AGPL-3.0、MIT、品牌保護條款、進銷存、庫存管理、成本計算、比價資料庫、Anthropic、Claude、AI 寫公式、MCP OAuth、NestJS、Next.js、React、TypeScript、PGlite
