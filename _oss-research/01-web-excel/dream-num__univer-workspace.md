# dream-num/univer-workspace — Univer 官方做的「可自架 Office 工作區＋AI Agent 審稿」完整產品（重度依賴 Pro 套件）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：852f1cb
> GitHub：https://github.com/dream-num/univer-workspace｜⭐ 2269｜授權：Apache-2.0（本 repo 原始碼）＋ Univer Pro SDK 商業授權（執行期依賴）｜主要語言：TypeScript｜最近更新：2026-11-04

本文所有 permalink 都指向 commit `852f1cbe3ed6e0e90fef782924c4e519abd8ddf0`。以下簡寫 `P/` = `https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/`，實際連結都寫成完整網址。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這不是「試算表元件」，而是 Univer 團隊用自家 Univer Office SDK 組出來的「類 Google Drive＋GitHub 工作流」的完整產品：網頁版 Sheet／Doc／Slide／Base（關聯式資料表）／Board（白板），加上 Node＋SQLite 後端、多人即時協作、權限分享、資源回收筒，以及讓 AI agent 在「Worktree（草稿分支）」裡改文件、再由人審核合併的流程。

**對你（台灣電商／倉儲老闆，自己用 Claude 寫 JS＋Firebase 工具）可以拿來做什麼：**

1. **在自己電腦上（localhost）跑一套「私人版 Google 試算表＋文件」**：內建的開發用授權只認 `localhost`／`127.0.0.1`／`app` 這幾個網域，個人在自己電腦用最省事（見第 2 節）。
2. **讓 Claude Code 直接幫你建、改、算試算表**：它附了 `uvw` 命令列工具和一個 Skill（`skills/univer-workspace-cli/SKILL.md`），README 明講可給 Claude／Codex 這類 agent 用。例如：「把這份廠商報價 xlsx 匯入、算毛利、標出低於成本的品項、再匯出 xlsx」，Claude 會寫 Univer Facade API 程式碼在「草稿」上改，你在瀏覽器裡審核後再合併。
3. **「試算表驅動的小網頁（mini-app）」**：用 HTML＋JS 寫一個儀表板頁面，裡面的數字、圖表、輸入框直接綁定到某張試算表的儲存格（可讀也可寫）。很適合做「進貨成本計算機」「比價看板」「庫存警示面板」，資料仍然放在試算表裡。
4. **學怎麼組裝 Univer**：如果你之後要把 Univer 試算表嵌進自己的倉儲 App，這個 repo 是官方「怎麼把幾十個 Univer 外掛組起來、怎麼接協作伺服器、怎麼做匯入匯出、怎麼寫自訂公式」的最完整範例。
5. **兩版本比對（diff）檢視器**：`packages/unit-comparison-viewer` 能把兩個版本的試算表並排顯示差異（儲存格值、公式、樣式），概念上很適合「新舊價目表比對」。

**不適合直接拿來做的事**：直接嵌進你現有的純 JavaScript＋Firebase 網頁（它是 React＋Node＋SQLite 的整套產品，而且很多功能靠 Pro 套件）。要嵌試算表，請直接用上游 `dream-num/univer` 的開源套件（同目錄另有 `dream-num__univer.md` 資料包）。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

這個專案要分「兩層」看，非常重要：

### 第一層：本 repo 原始碼 = Apache-2.0（寬鬆）
- `LICENSE` 是 Apache License 2.0：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/LICENSE
- 決策紀錄 ADR 0004 也寫明 repo 原始碼採 Apache-2.0，但「執行期開發憑證、Pro SDK 依賴」另外處理：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/docs/adr/0004-license-the-repository-under-apache-2.0.md
- 白話：這個 repo 裡的程式碼（React 前端、Express 後端、CLI、agent 外掛）你可以自由修改、商用、閉源再發佈，只要保留授權聲明與 NOTICE。

### 第二層：它跑起來需要的 Univer Pro 套件 = 商業授權（需要 license）
- 我自己數 `apps/workspace/package.json` 的 `dependencies`（用 python 讀 JSON、依套件名前綴分類）：**`@univerjs-pro/*` 有 99 個、上游開源 `@univerjs/*` 有 67 個**（另有 6 個 `workspace:*` 本地套件、3 個 `@univerjs-labs/*` 開發版）。https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/package.json
- 協作（`@univerjs-pro/collaboration*`）、Office 匯入匯出（`@univerjs-pro/exchange-*`）、圖表、樞紐分析、列印、Slides、Base、Board、版本歷史 UI 全部是 Pro。
- repo 內建一組「90 天輪替的執行期開發憑證」，**授權網域只有 `localhost`、`app`、`127.0.0.1`**，到期日寫在檔頭（2027-02-03）：
  - 前端：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/features/license.ts#L1-L8
  - 後端：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/server/src/integrations/univer/license.ts#L1-L10
- Workspace README 說明：瀏覽器頁面若不在授權網域，協作端點會回 **403（code 9018）**；伺服器沒有授權時退回**免費額度：1 個協作節點、3 個同時編輯連線、每月 10 次匯出**。https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/README.md#L286-L298
- 根 README 也明講這組憑證「不是 repo 的軟體授權」，部署到其他網域要自己設 `VITE_UNIVER_LICENSE`／`UNIVER_LICENSE`＋`UNIVER_LICENSE_KEY`：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/README.md#L283-L296

### 對你的白話結論
| 情境 | 可不可以 | 要注意 |
|---|---|---|
| 個人在自己電腦 `http://127.0.0.1:5173` 用 | 可以，最順 | 內建憑證 90 天到期；到期前要拉新版 repo（官方會輪替）或自己申請 |
| 架在自己網域（例如 `sheet.你的網域.tw`）給自己用 | 技術上可以，但前端會被拒（403/9018）或退回免費額度 | 需要向 Univer 申請 license（費用：未確認，repo 內沒有價格資訊） |
| 公司內多人使用／商用 | 本 repo 程式碼 OK；Pro 套件需商業授權 | 免費額度只有 3 個同時編輯連線、每月 10 次匯出 |
| 只想拿某段程式碼（例如 Express 權限模組、IMPORTRANGE 寫法） | 可以（Apache-2.0） | 但只要那段程式 import 了 `@univerjs-pro/*`，就又回到 Pro 授權問題 |

另外：agent 部分用的 DSH（DeepSeek Harness，`@deepseek-ai/*` 套件）的授權條款，本 repo 沒附，**未確認**。

---

## 3. 技術棧與執行需求

| 層 | 內容 | 出處 |
|---|---|---|
| 前端 | React 19、TypeScript、Vite 8、TanStack Router／Query、Base UI、Tailwind CSS 4 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/docs/architecture.md#L7-L24 |
| 試算表／文件引擎 | Univer SDK 1.3.1（開源 `@univerjs/*`＋Pro `@univerjs-pro/*`，全部鎖同一版本） | `apps/workspace/package.json` |
| 後端 | Node.js ≥ 24、Express 5、同一個 Node 行程同時提供 API、協作端點、靜態網頁 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/docs/architecture.md#L1-L5 |
| 資料庫 | 兩個 **SQLite** 檔（Node 內建 `node:sqlite`）：產品資料庫＋協作資料庫；上傳檔案存本機資料夾 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/.env.example#L9-L11 |
| API 契約 | OpenAPI 3.1（Redocly、openapi-typescript、Scalar 文件頁 `/api-docs`） | architecture.md |
| 登入 | 帳密、GitHub、Google、Discord OAuth、外部 OAuth client | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/.env.example |
| 部署 | Docker（`node:24-bookworm-slim`），掛一個持久化 volume 存 `.data` | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/Dockerfile |
| 監控 | pino 日誌、Prometheus `/metrics`、Grafana 範本（`observability/`） | `.env.example`、`observability/` |
| AI Agent | 桌面版／本機網頁 app，建立在 DSH（DeepSeek Harness）；CLI `uvw` 給 Claude 等外部 agent | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/agent/README.md#L1-L18 |

**怎麼跑（README 寫法，我沒有執行）**：Node 24＋pnpm 11 → `pnpm install` → 複製 `.env.example` 成 `.env` → `pnpm workspace:dev:server`（3020 埠）＋`pnpm workspace:dev:web`（5173 埠）→ 開 `http://127.0.0.1:5173`。

**硬體**：不需要 GPU。後端在 worker thread 池裡跑「伺服器端 Univer 執行期」（每個 worker 首次啟動約 1 秒，見 `unit-store.ts` 註解）https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/server/src/integrations/univer/unit-store.ts#L50-L60 ；Dockerfile 建置時預設 `NODE_MAX_OLD_SPACE_SIZE=4096`，建置機器建議至少 4–8 GB 記憶體（推估）。

**能不能放 Firebase？** 不能直接放 Firebase Hosting：它需要長駐的 Node 伺服器、WebSocket、和可寫入的本機磁碟（SQLite＋檔案）。要上雲得用 VPS 或可掛持久磁碟的容器服務。

**API Key 與費用**：
- 只用試算表／文件：不需要任何 AI API Key。
- 用 Workspace Agent 聊天：要模型憑證，README 舉例 `DEEPSEEK_API_KEY`「或其他供應商憑證」https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/agent/README.md#L144-L159 ，費用依你選的模型。
- 用 Claude Code＋`uvw` CLI：花的是你本來 Claude 的額度，Workspace 本身不收費。
- Univer 商業 license：在授權網域以外部署才需要，價格**未確認**。

---

## 4. 程式架構地圖

```text
univer-workspace/                     （1484 個檔案；非測試 .ts/.tsx 764 個，約 11 萬行；測試檔 *.test.* 264 個）
├── README.md / README.zh-CN.md       產品說明、授權說明（含 Runtime development license 段）
├── LICENSE                           Apache-2.0
├── package.json / pnpm-workspace.yaml  pnpm monorepo；packageExtensions 修補 Univer 套件型別依賴
├── apps/
│   ├── workspace/                    ★ 主產品：瀏覽器前端＋伺服器（同一個 package 兩個入口）
│   │   ├── web/src/
│   │   │   ├── features/editor/      ★★ 所有 Univer 編輯器組裝都在這
│   │   │   │   ├── collaboration-editor.tsx   共用工廠：createUniver、協作、授權、嵌入、歷史版本
│   │   │   │   ├── units/sheet/      ★ 試算表：sheet-presets.ts（桌面外掛清單）、sheet-mobile-presets.ts（手機）、sheet-editor.tsx
│   │   │   │   ├── units/{doc,slide,base,board}/  其他四種文件
│   │   │   │   ├── features/import-export/  匯入匯出 UI 與流程
│   │   │   │   ├── features/exchange-plugins.ts  匯入匯出端點設定
│   │   │   │   └── features/license.ts / univer-license.ts  前端 license 與覆寫
│   │   │   ├── features/html-views/  試算表綁定小網頁（mini-app）宿主
│   │   │   ├── features/{nodes,permissions,spaces,trash,worktrees,issues,...}  產品功能
│   │   │   ├── modes/{wiki,repository}/  兩種介面風格（Wiki／GitHub 風格）
│   │   │   └── shared/i18n.tsx      介面語言：只有 zh-CN、en-US
│   │   ├── server/src/
│   │   │   ├── app.ts / main.ts      組裝所有模組、掛 WebSocket
│   │   │   ├── db/schema.sql + migrations/  產品資料庫（SQLite，目前 V13，32 張表）
│   │   │   ├── integrations/univer/  ★ 協作伺服器組裝（collaboration-gateway.ts、unit-store.ts、worktree-store.ts、content-permissions.ts）
│   │   │   ├── modules/exchange/     ★ xlsx/csv/docx/pptx 匯入匯出（伺服器端 exchange-node）
│   │   │   └── modules/{identity,access,nodes,resources,permissions,blobs,trash,worktrees,issues,views,...}
│   │   ├── contracts/http/           OpenAPI 原始定義（paths/、schemas/）
│   │   ├── docs/                     架構、資料模型、應用設計、ADR（多數為簡體中文）
│   │   └── Dockerfile
│   ├── cli/                          ★ `uvw` 命令列（給 AI agent 用）＋ skill-data/（sheet、doc、html-view…等 Skill）
│   └── agent/                        Workspace Agent（DSH 本機網頁／Electron 桌面版）
├── packages/
│   ├── client-core/                  CLI／Agent 共用：無頭 Univer 執行、截圖、PDF、Office 轉換
│   ├── dsh-univer-workspace-plugin/  Agent 工具組（22 個 univer_* 工具）、Skills、IMPORTRANGE 自訂公式
│   ├── workspace-html-viewer/        HTML View 沙盒與綁定引擎（BindingEngine 子類別）
│   ├── unit-comparison-viewer/       ★ 兩版本並排比對檢視器（React）
│   ├── reference-provider/           跨文件引用權限政策（瀏覽器端）
│   ├── workspace-file-browser / workspace-ui / workspace-markdown-viewer  UI 小元件
│   └── dsh-univer-workspace-skin-plugin  Agent 外觀
├── skills/univer-workspace-cli/SKILL.md  給 Claude 等 agent 安裝的入口 Skill
├── scripts/                          SDK 版本同步、license 輪替、CLI 發佈
└── observability/                    Grafana 設定
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 試算表外掛清單（桌面） | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/units/sheet/sheet-presets.ts#L104-L161 | 用 Univer「Preset」組合：Core、Drawing、條件格式、篩選、超連結、資料驗證、尋找取代、註記、排序、表格、留言、**Advanced（Pro）**、**Collaboration（Pro）**。`workbenchChrome: "hidden"` 可把工具列、公式列全部藏起來（做唯讀預覽很好用）。 |
| 試算表編輯器 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/units/sheet/sheet-editor.tsx#L35-L68 | 交給共用工廠 `createCollaborationEditor`，指定歷史版本外掛、綠色主題、匯入匯出功能，`load` 時呼叫 `univerAPI.getCollaboration().loadSheetAsync(unitId)` 從協作伺服器載入。 |
| Univer 初始化 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/collaboration-editor.tsx#L383-L424 | `createUniver({ locale, locales, theme, darkMode, collaboration: true, presets, plugins })`；之後用 `univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, …)` 攔截「對被引用來源的寫入」並 `event.cancel = true`。 |
| 手機版試算表 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/units/sheet/sheet-mobile-presets.ts#L1-L40 | 不用 preset，改逐一載入 `*MobileUIPlugin`（`UniverSheetsMobileUIPlugin`、`UniverMobileUIPlugin` 等），並載入 Pro 公式引擎 `UniverProFormulaEnginePlugin` 與 Pro 圖表。 |
| 協作伺服器 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/server/src/integrations/univer/collaboration-gateway.ts#L3-L30 、#L95-L101 | 全部用 Pro 伺服器套件：`UniverCollabEndpoint`、`UniverCommentEndpoint`、`UniverHistoryEndpoint`、`UniverCollabWorktreeEndpoint`，用 `@univerjs-pro/collaboration-transport-node` 接到 Express／WebSocket。匿名使用者只允許一小串唯讀路徑（#L56-L61）。 |
| 文件儲存 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/server/src/integrations/univer/unit-store.ts#L1-L60 | `SQLiteDatabaseAdapter`（Pro）存快照＋changeset；`UniverCollabService.createUnitFromData` 建檔（#L169-L190）。 |
| 匯入匯出 | 伺服器：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/server/src/modules/exchange/exchange.service.ts#L5-L19 ；格式判斷 #L798-L833；前端端點：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/features/exchange-plugins.ts#L4-L14 | 用 Pro 的 `@univerjs-pro/exchange-node`（`importBuffer`、`importBufferToSnapshot`）。可匯入 .xls/.xlsx/.csv/.tsv（→試算表）、.doc/.docx、.ppt/.pptx；試算表可匯出 XLSX/CSV/TSV。暫存檔 2 小時過期。 |
| 自訂公式 IMPORTRANGE | 函數本體：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/dsh-univer-workspace-plugin/src/client/viewer/importrange-formula/functions/import-range.function.ts#L29-L53 ；註冊：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/dsh-univer-workspace-plugin/src/client/viewer/importrange-formula/controllers/import-range-formula.controller.ts#L18-L38 ；外掛：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/dsh-univer-workspace-plugin/src/client/viewer/importrange-formula/plugin.ts#L16-L39 | **示範如何寫「非同步自訂函數」**：`IRegisterFunctionService.registerAsyncFunction({ name, description, func })`，`func` 是 async，回傳二維陣列或 `ErrorType.REF/VALUE`。註解說「沒有公開的 IMPORTRANGE 套件所以自己寫」。這段可以改成你的 `=查價("SKU001")` 去打 Firebase。 |
| 試算表綁定小網頁 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/workspace-html-viewer/src/engine.ts#L1-L60 ；規格：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/skill-data/html-view/SKILL.md#L1-L63 | 繼承 `@univerjs-labs/binding-engine` 的 `BindingEngine`，覆寫 `setCellValue`／`insertRowsWithValues` 加權限檢查。HTML 用 `data-univer-cell-subscribe`、`data-univer-range-subscribe`、`data-univer-cell-model` 等屬性綁定儲存格，在 `sandbox="allow-scripts allow-forms"` iframe 裡跑。 |
| Agent 修改文件 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/dsh-univer-workspace-plugin/src/tools/edit.ts#L245-L256 | `univer_execute` 工具：讓模型寫 Facade API 程式碼，在無頭 Univer 裡對「草稿 Worktree」執行並提交，之後再 ready／merge。 |
| 版本比對 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/unit-comparison-viewer/README.md | React 元件 `UnitComparisonViewer`，吃兩份已解碼的 `unitData`，由宿主提供 `createUniver` 工廠；src/sheet 下有公式差異（`workbook-fx-diff.ts`）、結構差異等。 |
| 權限／分享 | `apps/workspace/server/src/modules/{access,permissions}/`、`integrations/univer/content-permissions.ts`（498 行） | 伺服器是唯一權威；Space／Node 層級角色＋連結分享＋匿名唯讀。 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 試算表外掛清單（哪些是開源、哪些是 Pro） | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/units/sheet/sheet-presets.ts#L104-L161 | `@univerjs/preset-sheets-*` | 低 | 拿掉 `UniverSheetsAdvancedPreset`、`UniverSheetsCollaborationPreset` 兩個 Pro preset，剩下的全是開源，可直接搬到你的頁面。 |
| IMPORTRANGE 非同步自訂公式寫法 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/dsh-univer-workspace-plugin/src/client/viewer/importrange-formula/functions/import-range.function.ts#L29-L53 | `@univerjs/engine-formula`（開源）；原版還依賴 `@univerjs-pro/embed` | 中 | 保留 `registerAsyncFunction` 骨架，把 `referencedUnitManager.readData` 換成 `fetch` Firestore／你的價格 API，就成了 `=PRICE("SKU")`、`=COST(...)`。 |
| HTML 綁定小網頁的屬性規格 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/skill-data/html-view/SKILL.md#L1-L63 | `@univerjs-labs/binding-engine`（開發版）＋ Pro 協作 | 高 | 真要搬很難；但「`data-xxx-cell-subscribe` 宣告式綁定」這個設計可以照抄，用開源 Univer 的事件＋自己寫 50 行綁定器實現。 |
| 唯讀預覽（藏工具列） | sheet-presets.ts 的 `workbenchChrome: "hidden"` 分支（#L112-L127） | 開源 | 低 | 做「報價單預覽」「庫存表唯讀分享頁」。 |
| 手機版外掛清單 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/units/sheet/sheet-mobile-presets.ts#L1-L40 | 開源 `*MobileUIPlugin`＋Pro 公式／圖表 | 中 | 倉庫人員用手機盤點時，載入這組 Mobile UI 外掛（Pro 那兩個拿掉）。 |
| Agent 寫試算表的「規則書」 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/skill-data/sheet/SKILL.md#L26-L56 、#L93-L106 | 無（純文件） | 低 | 直接放進你自己的 Claude Code `CLAUDE.md`／Skill：儲存格一定要寫 `{v,t}`、SKU 用 `t:4` 強制文字避免前導 0 消失、公式要等 `onCalculationResultApplied()`。對任何 Univer 專案都通用。 |
| 版本比對檢視器 | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/unit-comparison-viewer/README.md | React、Tailwind 4、多個 Pro 套件（bases、boards、slides、edit-history-ui） | 高 | 只取 `src/sheet/` 的比對演算法概念做「價目表新舊對照」；整包搬會帶進 Pro 依賴。 |
| 產品後端（Space／Node 樹／權限／回收筒／OpenAPI） | `apps/workspace/server/src/modules/` 、`apps/workspace/contracts/http/openapi.yaml` | Express 5、node:sqlite | 中 | 想做「多店鋪／多倉庫資料夾＋權限」時當參考架構；資料表設計見 `docs/data-model.md`。 |
| `uvw` CLI＋Skill（給 Claude Code） | https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/README.md#L61-L78 | 需要一台在跑的 Workspace 伺服器 | 低（照用） | `npm install -g univer-workspace-cli`＋`npx skills add dream-num/univer-workspace --skill univer-workspace-cli -g`，Claude Code 就能操作你本機的 Workspace。 |

---

## 7. AI／Claude 整合

- **兩條路**：
  1. **Workspace Agent**（`apps/agent`）：本機網頁／Electron 桌面 app，底層是 DSH（DeepSeek Harness，`@deepseek-ai/*` 套件）。模型憑證是本機設定，README 舉例 `DEEPSEEK_API_KEY`「或其他供應商憑證」https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/agent/README.md#L144-L159 。DSH 是否支援 Anthropic Claude 模型：**未確認**（本 repo 沒有出現 anthropic 字樣，我用 grep 全 repo 搜 `anthropic|claude` 只在三份 README 出現）。
  2. **`uvw` CLI＋Skill**（`apps/cli`、`skills/univer-workspace-cli/SKILL.md`）：README 明寫「給既有 agent，例如 Claude、Codex、Kimi Work 使用」。這條路對你最實用：在 Claude Code 裡裝好就能用。https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/README.md#L61-L78
- **Prompt／知識放在哪**：不是傳統 prompt，而是一組 Skill 文件：
  - CLI 版：`apps/cli/skill-data/{core,sheet,doc,slide,base,board,blob,embed,html-view,cross-unit-formula}/SKILL.md`（安裝後用 `uvw skills get sheet` 讀）
  - Agent 版：`packages/dsh-univer-workspace-plugin/skills/univer-*/SKILL.md`
- **Agent 工具**：我用 grep 數 `packages/dsh-univer-workspace-plugin/src/tools/*.ts` 裡 `name: "univer_…"` 定義，共 **22 個工具**：`univer_api`、`univer_blob`、`univer_spaces`、`univer_new`、`univer_create`、`univer_documents`、`univer_list`、`univer_open`、`univer_status`、`univer_edit`、`univer_inspect`、`univer_execute`、`univer_import`、`univer_export`、`univer_html_view`、`univer_issue`、`univer_lint`、`univer_compile_svg`、`univer_screenshot`、`univer_resources`、`univer_unit`、`univer_worktree`。
- **MCP**：沒有（grep 全 repo 無 `mcp`）。整合方式是「CLI＋Skill」，不是 MCP server。
- **安全機制（Worktree）**：agent 只能改「草稿分支」，`Ready → 人審 → Merge／Reopen` 才會進正式版本。這對「讓 AI 改價目表」很重要：不會直接改壞正式資料。
- **能不能換成 Claude**：CLI 路線本來就能用 Claude Code（原生設計對象之一）。Agent app 路線要看 DSH 支援哪些供應商（未確認）。

---

## 8. 擴充方式與 API

1. **Univer 外掛（Plugin）**：繼承 `Plugin`、用 `registerDependencies`／`touchDependencies` 掛 controller，依賴注入用 `setDependencies`。IMPORTRANGE 外掛就是完整範本（見第 5 節）。
2. **Facade API（`univerAPI`）**：讀寫儲存格的官方高階 API。Skill 文件整理了常用寫法（https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/skill-data/sheet/SKILL.md#L63-L71）：`sheet.getRange("A1:C9")`、`getCellDatas()`、`setValues()`、`setFormula()`、`setBackgroundColor()`；圖片 `newOverGridImage()`；富文字 `api.newRichText()`。
3. **事件**：`univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, cb)`（可取消）、`Event.LifeCycleChanged`、`Event.CollaborationStatusChanged`（collaboration-editor.tsx 中使用）。
4. **產品 HTTP API**：OpenAPI 定義在 `apps/workspace/contracts/http/openapi.yaml`，執行時可看 `http://127.0.0.1:3020/api-docs`。涵蓋 auth、nodes、resources、spaces、permissions、trash、worktrees、issues、blobs、views、operations。
5. **協作／匯入匯出端點**：`/universer-api/**`（Univer SDK 規格，不在產品 OpenAPI 內）。
6. **外部 OAuth client**：`OAUTH_CLIENTS_JSON` 註冊外部程式，可取得 `workspace_session` 代表使用者呼叫 API（例如你自己的倉儲 App 呼叫 Workspace）。
7. **HTML View**：寫 `.univer.html` 上傳，就是一個綁定試算表的小網頁。

---

## 9. 程式品質與風險

**維護狀況**：
- repo 建立 2026-08-14，最近一次 commit 是 2026-11-04（`fix(workspace): name exported files after the Workspace node (#173)`），短短不到 3 個月已到 PR #173，非常活躍；由 Univer 官方團隊（dream-num）維護。
- 有 5 個 GitHub Actions workflow（`ci.yml`、`push.yml`、`push-use-ecs.yml`、`agent-desktop.yml`、`release-cli-manual.yml`）。
- 測試：我數檔名含 `.test.` 的檔案共 **264 個**（Vitest），另有 13 支 production 資料庫遷移測試腳本；我沒有執行任何測試。
- 文件非常完整（架構、資料模型、ADR、遷移步驟），但多數內部文件是**簡體中文**。

**風險／已知的坑**：
1. **Pro 授權綁網域＋90 天輪替**：內建憑證 2027-02-03 到期；換網域會 403；免費額度很小（3 連線、每月 10 次匯出）。這是最大的坑。
2. **依賴 `@univerjs-labs/*` 開發版**（`1.0.0-dev.6518eb0`），HTML View 功能可能變動。
3. **SDK 版本強耦合**：所有 `@univerjs/*`、`@univerjs-pro/*`、`@univer-cli/*` 必須同版，只能用 repo 的腳本整批升級。
4. **SQLite＋WAL**：README 警告容器執行中不要從主機端開 SQLite 檔，可能損毀；升級要停機、單一實例、先備份。
5. **AI 執行程式碼**：`univer_execute`／`uvw execute` 讓模型寫的 JS 在本機 Node worker 裡跑（`packages/client-core/src/content-execution.ts` 用 `@univer-cli/content-execution`）。沙盒強度**未確認**；建議只對自己信任的 agent 開放。
6. **遙測**：前端與後端程式碼中 grep 不到 Google Analytics、Sentry、PostHog 等第三方追蹤；有自帶 Prometheus `/metrics`（預設關閉，需設 `METRICS_TOKEN`）。Univer Pro license 驗證是否連網：**未確認**。CLI 預設連 `https://space.univer.ai/`（官方試用站），自用時記得改成自己的位址（`apps/cli/src/config.ts`）。
7. **Repo 內含 license 字串與 license key**：是官方刻意放的開發憑證，不是外洩；但別把你自己申請的正式 license commit 進 git。
8. **介面只有簡中與英文**（見第 11 節）。

---

## 10. 跟其他專案組合的建議

- **你要的「嵌進自己倉儲 App 的網頁 Excel」**：用上游 **`dream-num/univer`** 的開源套件（只用 `@univerjs/preset-sheets-core` 等開源 preset），本 repo 當「組裝範本」參考 `sheet-presets.ts` 與 IMPORTRANGE 外掛寫法。不要把整個 workspace 搬過去。
- **公式引擎替代**：若只要「後端算價格公式」不要畫面，可搭 `handsontable/hyperformula`（已有資料包）在 Firebase Functions 裡算；畫面用 Univer。
- **xlsx 匯入匯出**：本 repo 的匯入匯出是 Pro（`exchange-node`）。開源路線改用 **SheetJS**（`SheetJS__sheetjs.md`）在前端把 xlsx 轉成 Univer 的 `IWorkbookData`（需要自己寫轉換，保真度較差）。
- **AI 改表**：把 `apps/cli/skill-data/sheet/SKILL.md` 的規則（`{v,t}`、強制文字、等公式重算）抄進你自己的 Claude Code Skill，就算不用 Workspace 也適用。
- **小網頁儀表板**：抄「HTML 屬性宣告式綁定儲存格」的設計，做「比價看板」：試算表放各通路價格，網頁顯示最低價、毛利率紅綠燈。
- **組合範例（A＋B＋C）**：A＝開源 Univer 試算表（畫面），B＝本 repo 的 IMPORTRANGE 寫法改成 `=FIREBASE_PRICE(sku)` 非同步公式，C＝SheetJS 處理廠商 xlsx 報價單匯入；資料用 `IWorkbookData` JSON 存 Firestore。

---

## 11. 網頁 Excel 能力檢查表

> 說明：本 repo 是「組裝」Univer，引擎本身在 npm 套件裡（本 repo 不含其原始碼），所以很多項目只能從「它載入了哪個外掛」判斷「有」，細節效能無法在本 repo 驗證。

### 渲染與效能
- **渲染方式：有，Canvas。** 依賴 `@univerjs/engine-render`；內部文件提到「native document canvas」，並提醒要用滾輪而不是 DOM `scrollIntoView` 捲動：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/docs/embed-runtime.md#L97-L99
- **虛擬捲動：未確認**（引擎在 npm 套件內）；Canvas 架構本質上只畫可見範圍。
- **10 萬列以上效能：未確認**。測試資料裡有 `rowCount: 1000000` 的工作表定義（https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/unit-comparison-viewer/test/workbook-comparison-display.test.ts#L6-L50），代表格式允許 100 萬列，但沒有效能測試數據。伺服器端有「Sheet Block」分塊儲存（data-model.md 提到）。

### 公式引擎
- **函數數量：未確認。** 函數實作在 `@univerjs/engine-formula`（開源）與 `@univerjs-pro/engine-formula`（Pro）npm 套件中，本 repo 沒有。我在本 repo 用 grep 搜 `registerAsyncFunction|registerFunction(|IRegisterFunctionService`（所有 .ts/.tsx、排除測試），只找到 **1 個自訂函數 IMPORTRANGE**。
- **解析器與依賴圖／重算：有（在 SDK 內）。** README 寫明「SDK 負責公式依賴失效、計算順序與結果套用，Workspace 不另做重算排程」：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/README.md#L101-L108。重算是**非同步**：要先註冊 `api.getFormula().onCalculationResultApplied()` 再 `executeCalculation()`：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/skill-data/sheet/SKILL.md#L93-L106
- **陣列公式：未確認。** 測試資料中有共享公式（`si`、`ref: "A2:A3"`）。
- **跨工作表參照：有**；**跨檔案參照：有（Pro）**，透過 cross-unit formula（`FFormula.buildReference`、`upsertExternalReference`）與 IMPORTRANGE：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/skill-data/cross-unit-formula/SKILL.md
- **自訂函數：有（開源 API）。** `IRegisterFunctionService.registerAsyncFunction`，範例見第 5 節 IMPORTRANGE。
- **Excel 結構化參照（表格公式 `Orders[@[Amount]]`）：有**，Skill 有專門規則（sheet SKILL.md #L108-L124）。

### 編輯
- **儲存格編輯：有**（`UniverSheetsCorePreset`）。
- **複製貼上（從 Excel／Google 試算表貼上）：未確認**（引擎行為，本 repo 無相關程式碼）。
- **拖拉填滿：未確認**（同上）。
- **復原／重做：有**；另有 Pro 的「版本歷史」可還原整份文件（`UniverSheetsHistoryUIPlugin`，sheet-editor.tsx #L37-L50）。

### 格式
- **數字格式：有**（`@univerjs/sheets-numfmt`，由 core preset 帶入；儲存格 `s.n.pattern`，例如 `"yyyy-MM-DD"`、`"0%"`、`"$0.00"`）。
- **條件格式：有**（`UniverSheetsConditionalFormattingPreset`）。
- **合併儲存格：有**（資料模型 `mergeData`）。
- **凍結窗格：有**（資料模型 `freeze`）。
- **欄寬列高：有**（`columnData.w`、`rowData.h`）。
- **篩選：有**（`UniverSheetsFilterPreset({ enableSyncSwitch: true })`）。
- **排序：有**（`UniverSheetsSortPreset`）。
- **資料驗證（下拉選單）：有**（`UniverSheetsDataValidationPreset`）。
- 另有：超連結、註記、留言串、表格（Table）、尋找取代、大綱分組（Pro）、迷你圖 sparkline（Pro）、形狀（Pro）。
- 以上皆見 https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/units/sheet/sheet-presets.ts#L104-L161

### 圖表、樞紐、圖片
- **圖表：付費版才有**（`@univerjs-pro/sheets-chart`，由 `UniverSheetsAdvancedPreset` 帶入；lockfile 顯示 advanced preset 依賴 chart-ui、engine-chart、sheets-chart 等全為 Pro）：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/pnpm-lock.yaml
- **樞紐分析：付費版才有**（`@univerjs-pro/sheets-pivot`，同上）。
- **圖片：有（開源）**（`UniverSheetsDrawingPreset`，上限 `MAX_UNIVER_IMAGE_BYTES`）。附件：工作區層級有 Blob 檔案上傳（任意檔），不是儲存格附件。

### 匯入匯出
- **.xlsx／.csv／.tsv：付費版才有（在本 repo 的做法）。** 用伺服器端 `@univerjs-pro/exchange-node`；可匯入 .xls/.xlsx/.csv/.tsv，匯出 XLSX/CSV/TSV；免費額度每月 10 次匯出。https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/server/src/modules/exchange/exchange.service.ts#L798-L833
- **保真度：未確認**（沒有實測）。README 說匯出前會把圖片內嵌、缺圖就讓匯出失敗；Skill 提醒顏色必須是 `#RRGGBB` 或 `rgb()`，否則匯出的 xlsx 可能打不開；CSV 匯入會整欄推斷型別（一個 `N/A` 會讓整欄變文字）。
- **開源替代**：本 repo 沒有；需自行搭 SheetJS 等。

### 多人即時協作
- **有，付費版才有。** **OT**（根 README 寫「Univer Collaboration SDK owns snapshots, revisions, OT, realtime collaboration」，https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/README.md#L176-L201）。需要本 repo 的 Node 伺服器（Express＋WebSocket＋SQLite）。另有「Worktree」分支／合併機制與單一實例鎖（`enableSingleActiveInstanceLock`）。免費額度只 3 個同時編輯連線。

### 資料模型與存進自己的資料庫
- **JSON 長相（IWorkbookData）**，摘自本 repo 測試資料（簡化）：
```json
{
  "id": "book", "name": "價目表", "locale": "zhCN",
  "styles": { "money": { "n": { "pattern": "$0.00" } } },
  "sheetOrder": ["s1"],
  "sheets": {
    "s1": {
      "id": "s1", "name": "商品", "rowCount": 1000, "columnCount": 20,
      "columnData": { "0": { "w": 200 } },
      "mergeData": [{ "startRow": 5, "endRow": 5, "startColumn": 0, "endColumn": 2 }],
      "freeze": { "startRow": 1, "startColumn": -1, "xSplit": 0, "ySplit": 1 },
      "cellData": {
        "0": { "0": { "v": "SKU", "t": 1 }, "1": { "v": "售價", "t": 1 } },
        "1": { "0": { "v": "00123", "t": 4 }, "1": { "v": 199, "t": 2, "s": "money" } },
        "2": { "1": { "f": "=SUM(B2:B2)" } }
      }
    }
  }
}
```
  （`t`：1 文字、2 數字、3 布林、4 強制文字；`f` 公式；`s` 樣式 id 或內嵌樣式。`locale` 實際值是 `LocaleType` 列舉，上面字串為示意。）出處：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/unit-comparison-viewer/test/workbook-comparison-display.test.ts#L6-L50 、https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/skill-data/sheet/SKILL.md#L26-L56
- **本 repo 怎麼存**：協作 SQLite 存「快照＋changeset＋Sheet Block」，產品 SQLite 只存 `univer_resources(resource_id, unit_id, unit_type)` 對照：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/docs/data-model.md#L171-L177
- **存進 Firestore**：本 repo **沒有** Firestore adapter（協作資料庫 adapter 只有 SQLite 版本）。自己做的話：不走協作，單機版 Univer 把整份 `IWorkbookData` JSON 存成 Firestore 文件（注意 Firestore 單文件 1 MB 上限，大表要依工作表或列區塊拆開）。上游 Facade 的「取出整份 JSON」方法（例如 `workbook.save()`）本 repo 只看到 Slide 的 `presentation.save()` 用法，Sheet 版**未在本 repo 驗證**。

### 手機／觸控、繁體中文
- **手機／觸控：有。** 試算表、文件、簡報、Base、Board 都有 `*.mobile.tsx` 編輯器，載入 `*MobileUIPlugin`：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/units/sheet/sheet-mobile-presets.ts#L1-L40
- **繁體中文介面：沒有（本 repo）。** App 只定義 `"zh-CN" | "en-US"`：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/shared/i18n.tsx#L11 ，試算表語系包也只合併 zh-CN／en-US。Univer core 有 `LocaleType.ZH_TW`（本 repo 的比對檢視器有 zh-TW 翻譯檔：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/packages/unit-comparison-viewer/src/i18n/locale-registry.ts ），但各 preset 是否提供 zh-TW 語系包：**未確認**。

### 嵌入方式（純 JavaScript）
- **本 repo：不行直接嵌。** 整個前端是 React 19 App，編輯器是 React 元件，還綁協作伺服器與 Pro license。
- **改用上游開源 Univer：可以**（Univer 自己的 UI 內部用 React，但對你的頁面只是「給一個 `<div>`」；React 仍會被打包進來，lockfile 顯示 preset 以 react／react-dom 為 peer dependency）。以下最小範例的 import 路徑、`createUniver`／`mergeLocales`／`UniverSheetsCorePreset({ container })` 寫法都取自本 repo（sheet-presets.ts、sheet-editor.tsx、collaboration-editor.tsx）；`univerAPI.createWorkbook()` 是上游 API，**本 repo 未使用、未驗證**：

```html
<!-- index.html（用 Vite 打包：npm i @univerjs/presets @univerjs/preset-sheets-core @univerjs/core react react-dom rxjs） -->
<div id="sheet" style="height: 600px"></div>
<script type="module">
  import { LocaleType } from "@univerjs/core";
  import { createUniver, mergeLocales } from "@univerjs/presets";
  import { UniverSheetsCorePreset } from "@univerjs/preset-sheets-core";
  import zhCN from "@univerjs/preset-sheets-core/locales/zh-CN";
  import "@univerjs/preset-sheets-core/lib/index.css";

  const { univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: { [LocaleType.ZH_CN]: mergeLocales(zhCN) },
    presets: [UniverSheetsCorePreset({ container: document.getElementById("sheet") })],
  });

  const workbook = univerAPI.createWorkbook({ name: "價目表" }); // 上游 API，未在本 repo 驗證
  const sheet = workbook.getActiveSheet();
  sheet.getRange("A1").setValue({ v: "SKU", t: 1 });
  sheet.getRange("A2").setValue({ v: "00123", t: 4 });   // 強制文字，保留前導 0
  sheet.getRange("B2").setValue({ v: 199, t: 2 });
  sheet.getRange("C2").setFormula("=B2*1.05");

  univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, (e) => {
    console.log("即將執行指令", e); // 可在這裡把變更同步到 Firestore
  });
</script>
```
- **套件大小：未確認**（沒有建置；不能執行安裝或建置）。

### API／事件
- **用程式讀寫儲存格：有。** `getRange()`、`getCellDatas()`、`getDisplayValues()`、`setValues()`、`setFormula()`、`clearContent()`、`setRowCount()`；詳細整理在 https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/skill-data/sheet/SKILL.md#L63-L71
- **監聽變更：有。** `univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, …)`（可設 `event.cancel = true` 擋掉），用法在 https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/collaboration-editor.tsx#L383-L424 。「儲存格值已變更」之類的專用事件名稱在本 repo 沒看到使用，**未確認**。
- **伺服器端／無頭操作：有（Pro＋`@univer-cli/*`）**：`uvw execute` 在 Node 裡用無頭 Univer 執行 Facade 程式碼，可截圖（PNG）、輸出 PDF。

---

## 關鍵字
Univer、Univer Workspace、univer-workspace、dream-num、網頁版 Excel、線上試算表、協作試算表、多人即時協作、OT、Office 工作區、Google 試算表替代、自架、self-hosted、Canvas 試算表、公式引擎、自訂公式、IMPORTRANGE、registerAsyncFunction、Facade API、univerAPI、IWorkbookData、xlsx 匯入匯出、exchange-node、Univer Pro、商業授權、license、Apache-2.0、SQLite、Express、React、Node.js 24、Docker、AI agent、Worktree、草稿審核、uvw CLI、Claude Code Skill、DeepSeek Harness、DSH、HTML View、mini-app、儲存格綁定、binding engine、版本比對、diff、手機版試算表、價目表、比價、成本計算
