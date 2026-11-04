# paperclipai/paperclip — 把 Claude Code、Codex 當「AI 員工」管理的自架控制台：組織圖、工單、技能庫、排程巡檢一次到位
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：e968131
> GitHub：https://github.com/paperclipai/paperclip｜⭐ 111031｜授權：MIT｜主要語言：TypeScript｜最近更新：2026-11-04

（本文所有 permalink 都固定在 commit `e968131efa7e63d321f3bcca8d47a62513c2efb4`。只引用我實際打開讀過的檔案；只看到檔名、沒讀內容的會註明「未讀」。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** Paperclip 是一套自己架在電腦上的「AI 公司管理系統」（Node.js 伺服器＋React 網頁介面＋PostgreSQL 資料庫）。你把 Claude Code、Codex、Cursor、Gemini CLI 等 AI 工具「僱用」成員工，每個員工有職稱、上司、預算、技能；工作用「工單（issue／task）」流轉；AI 不是一直開著，而是被「心跳（heartbeat）」或「例行排程（routine，cron）」叫醒，做完一段就回報、交接、下線。

它跟這個分類裡其他專案（spec-kit、BMAD、agent-skills 等「規則檔／技能範本集」）最大的不同：**它是真正會跑的系統**，而且原生內建你最在意的三件事——
1. **角色與分工**：資料庫裡每個 AI 員工有 `role`、`reportsTo`（向誰負責）、`capabilities`、`budgetMonthlyCents`、`permissions`。
2. **排程巡檢**：內建 cron 解析器與 routine 排程器，可以設定「每天台北時間凌晨 2 點叫醒巡檢員」；官方自己的 LLM Wiki 外掛就內建一個「每晚 03:00 lint（抓矛盾、過期、孤兒頁）」的例行工作。
3. **防漏**：工單一次只能一個 AI 領（原子 checkout，搶到第二個回 409）、「結束前必須給出明確狀態」的檢查表、以及「任務看門狗（task watchdog）」——整串子任務都停下來時，自動叫另一個 AI 來檢查「是不是停錯了」。

**對你（台灣小商家、自己用 Claude 寫倉儲網頁 App、也想讓 GPT/Codex 一起幫忙）可以拿來做：**
- **A. 直接用（較重）**：在自己電腦跑 Paperclip，建一間「倉儲 App 公司」：CTO＝Claude Code（寫功能）、QA＝Codex（驗收）、巡檢員＝Claude（每晚讀整個專案、出報告），全部在同一個看板上看誰在做什麼、花多少錢。
- **B. 不裝，只抄架構（推薦先做）**：它自己的 repo 就是「多 AI 協作規則」的優秀範本——根目錄 `AGENTS.md` 當總規則、`rules/*.mdc` 用 `globs` 分範圍、`.claude/agents/*.md` 與 `.codex/agents/*.toml` 同一個角色寫兩種格式、`.claude/skills/` 用 symlink 指向共用的 `.agents/skills/`，讓 Claude 和 Codex 讀同一份技能。
- **C. 抄「每日巡讀」技能**：`doc-maintenance`（用 `.doc-review-cursor` 檔記住上次巡到哪個 commit，只看新變更）、`wiki-lint`（七類問題：矛盾、過期、孤兒、概念缺頁、斷鏈、出處薄弱、索引漂移，唯讀不改檔）、`issue-triage`（每張卡只給一個下一步）、`setup-code-maintenance-bot`（把巡檢設定成排程＋上限＋防重複的完整流程），以及純程式的 `scripts/check-maps.mjs`（抓重複 ID、孤兒、斷鏈）。
- **D. 試算表小彩蛋**：`packages/google-sheets-mcp-server` 是一個只有 9 個工具、有白名單的 Google Sheets MCP 伺服器，可以拿來讓 Claude 讀寫你的庫存試算表（第 6 節）。

**要先知道的代價**：這是 1.4 萬個檔案、需要 Node.js 24.11+ 的大型系統，比較適合「已經同時開很多個 Claude Code 視窗、開始搞不清楚誰在做什麼」的階段（README 原文就這樣寫）。如果你目前只有 1 個 Claude＋1 個 Codex，建議先走 B＋C，把它的規則與巡檢技能抄進你的專案；等 AI 數量變多再考慮 A。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**。`LICENSE` 開頭是 `MIT License / Copyright (c) 2025 Paperclip AI`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/LICENSE ）。GitHub 偵測也是 MIT。
- **個人使用**：完全自由，可以改、可以把它的 `AGENTS.md`、`rules/`、`SKILL.md` 段落直接抄進你自己的專案。
- **公司商用**：可以（含內部工具、對外產品、改了再賣）。唯一條件是散布時保留原著作權聲明與 MIT 授權全文。
- **付費／閉源版**：README 第 32 行有「Sign up for the Paperclip Cloud waitlist」（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/README.md#L32 ），代表官方有規劃「代管雲端版」。開源版本身我沒有看到「要付費才解鎖」的功能旗標，但沒有逐一檢查全部 1,123 個服務檔，所以「開源版是否完全沒有鎖功能」標為**未確認**。README 寫「Open source. Self-hosted. No Paperclip account required.」（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/README.md#L346-L348 ）。
- **要另外注意的授權**：
  1. 技能目錄裡「外部引用」的技能各自有授權；它的 Agent Companies 規格要求匯入時保留授權與出處、缺授權要提示（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/companies/companies-spec.md#L370-L393 ）。
  2. 你用的 Claude／ChatGPT（Codex）訂閱或 API 各自的使用條款，跟 Paperclip 的 MIT 無關。
  3. **遙測預設開啟**：會傳匿名使用資料給 Paperclip（官方說不含個資、工單內容、prompt、路徑、密鑰），可用 `PAPERCLIP_TELEMETRY_DISABLED=1` 或 `DO_NOT_TRACK=1` 關掉（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/README.md#L547-L561 ）。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容 | 出處 |
|---|---|---|
| 語言／套件管理 | TypeScript monorepo，`pnpm@9.15.4`，`engines.node >= 24.11.0`，`.nvmrc` = 24 | `package.json` 第 110–113 行（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/package.json#L110-L113 ） |
| 後端 | Express REST API（`/api`）＋編排服務 | `AGENTS.md` Repo Map（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/AGENTS.md#L50-L63 ） |
| 前端 | React + Vite 看板 UI | 同上 |
| 資料庫 | PostgreSQL＋Drizzle ORM；開發時不設 `DATABASE_URL` 就用內嵌 PGlite（README 說是「embedded PostgreSQL，自動建立」） | `AGENTS.md` §4（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/AGENTS.md#L65-L91 ） |
| 部署模式 | `local_trusted`（只綁 localhost、不用登入，預設）／`authenticated + private`（Tailscale、區網）／`authenticated + public`（上雲，文件以 AWS ECS Fargate 為例） | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/deploy/overview.md |
| 安裝 | `npx paperclipai@latest onboard --yes`；或 `git clone` 後 `pnpm install && pnpm dev`，網址 `http://localhost:3100` | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/README.md#L346-L420 |
| 遠端沙箱（選用） | E2B、Cloudflare、Daytona、Modal、Novita、Kubernetes 等 | `ROADMAP.md` 第 53–55 行 |
| 硬體／GPU | **不需要 GPU**。Paperclip 只是控制台，真正的 AI 推論在 Anthropic／OpenAI 雲端；但每個 AI 員工會在你電腦上啟動一個 `claude` 或 `codex` CLI 行程，同時跑多個會吃記憶體（AGENTS.md 也提到記憶體不足時改用 `scripts/typecheck-low-memory.mjs`）。 | — |

**需要的金鑰（依你要接哪種 AI）：**
- Claude Code：`ANTHROPIC_API_KEY` 或 `CLAUDE_CODE_OAUTH_TOKEN`，或直接用你已登入的 Claude Code 訂閱（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/adapters/claude-local.md#L18-L23 ）。未設定 model 時預設 `claude-opus-5`（同檔第 44 行起）。
- Codex：沿用你 ChatGPT 訂閱登入的 `auth.json`，或給每個 AI 員工設 `OPENAI_API_KEY`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/adapters/codex-local.md ）。
- 快速試駕：`ANTHROPIC_API_KEY=... npx paperclipai test-drive`，或 `OPENAI_API_KEY=... npx paperclipai test-drive --harness codex`（README 第 371–372 行）。

**費用**：Paperclip 本身免費。花費全在模型用量：用訂閱（Claude Max、ChatGPT Plus/Pro）就是月費內；用 API 就按 token 計費。repo 內沒有寫具體金額，我也沒查價格，所以金額**未確認**。要注意它預設每次心跳最多 300 回合（`maxTurnsPerRun` 預設 300，https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/adapters/claude-local.md#L37 ），若用 API 計費、又開了排程，費用可能比你想像高——它有「每位員工月預算（分）」與「100% 自動暫停、80% 只做關鍵任務」的機制可以擋（見第 5 節）。

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree -r --name-only HEAD` 共 **13,944** 個檔案；以下數字都是我用 `grep`／`ls`／`wc` 對這份清單或 checkout 後的檔案數出來的。

```
paperclip/
├── AGENTS.md                 ★ 總規則（給人類與 AI 貢獻者）：必讀順序、分範圍規則、驗證、完成定義
├── rules/                    ★ 11 個檔（10 個 .mdc＋README）：分範圍規則，frontmatter 用 globs／alwaysApply
├── .greptile/                ★ 讓 AI 程式碼審查工具（Greptile）讀同一份 rules/ 的索引檔
├── .agents/skills/           ★ 37 個資料夾：開發這個 repo 用的技能（巡檢、PR、發版、文件維護…）
├── .claude/
│   ├── agents/               ★ 2 個 Claude 子代理（codemod-runner、token-auditor）
│   └── skills/               ★ 4 項，其中 3 項是 symlink → ../../.agents/skills/… 或 ../../skills/paperclip
├── .codex/agents/            ★ 同樣 2 個角色的 Codex 版（.toml）
├── skills/                   ★ 9 個「執行期」技能：paperclip（795 行，心跳協議）、paperclip-create-agent（招募）、para-memory-files…
├── maps/                     74 檔：功能地圖＋AI 存取地圖（同 ID 雙邊對照），配 scripts/check-maps.mjs 做結構檢查
├── server/                   3,629 檔：Express API 與編排服務
│   └── src/
│       ├── services/         1,123 個項目（ls 計）：heartbeat.ts（4,392 行）、routines.ts（3,332 行）、cron.ts（373 行）、task-watchdogs.ts（1,898 行）…
│       └── onboarding-assets/ 預設 CEO／一般員工的 AGENTS.md（CEO 另有舊版 HEARTBEAT.md、SOUL.md、TOOLS.md，已不再預設載入）
├── ui/                       3,286 檔：React + Vite 看板
├── packages/
│   ├── db/src/schema/        183 個 .ts、共 314 個 pgTable( 定義（grep 計）；migrations 430 個 .sql
│   ├── adapters/             12 個轉接器：claude-local、codex-local、cursor-local、cursor-cloud、gemini-local、grok-local、kimi-local、opencode-local、pi-local、hermes、hermes-gateway、openclaw-gateway
│   ├── skills-catalog/       App 內建技能目錄：16 個 SKILL.md（bundled 10＋optional 6）
│   ├── teams-catalog/        App 內建「團隊範本」：core-exec-team（CEO/CTO/QA）、product-engineering、content-machine…
│   ├── plugins/              7 個：plugin-llm-wiki（含每晚 lint 排程）、sdk、create-paperclip-plugin、sandbox-providers…
│   ├── google-sheets-mcp-server/  Google Sheets MCP 伺服器（9 個工具）
│   ├── mcp-server/、shared/、adapter-utils/、paperclip-runner/ …
├── integrations/assistant-plugins/ ★ 一份共用 skills → 同時打包成 Claude 外掛與 OpenAI（ChatGPT/Codex）外掛
├── docs/（136 檔）、doc/（725 檔）  使用者文件與內部規格／計畫（doc/plans/ 以 YYYY-MM-DD-slug.md 命名）
└── tests/（1,183 檔）＋各處 *.test.*：全 repo 共 3,833 個測試檔（以 \.test\.(ts|tsx|mjs|js)$ 計）
```
全 repo 共有 **83 個 SKILL.md**、**22 個 AGENTS.md**（含根目錄；以檔名結尾比對檔案清單計算）。

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

### 5-1 AI 員工的資料模型（角色、上司、預算、權限）
- 位置：https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/db/src/schema/agents.ts#L17-L60
- 重點：`agents` 表有 `role`（預設 `general`）、`title`、`reportsTo`（自我參照外鍵＝向誰負責）、`capabilities`（文字描述能做什麼）、`adapterType`／`adapterConfig`（用 Claude 還是 Codex、哪個 model）、`runtimeConfig`（心跳設定）、`budgetMonthlyCents`／`spentMonthlyCents`、`permissions`（JSON）、`status`、`lastHeartbeatAt`。概念文件說「嚴格樹狀，除了 CEO 每個人只向一個上司報告，用於升級與委派」（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/start/core-concepts.md#L20-L31 ）。
- 給你的啟示：就算不裝 Paperclip，你的 `AGENTS.md` 角色表也可以照這幾個欄位寫：角色、職稱、向誰負責、能做什麼、能用哪些工具、預算上限。

### 5-2 工單與「一次只給一個 AI」（防兩個 AI 改同一件事）
- 位置：`issues` 表 https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/db/src/schema/issues.ts#L40-L57 （`parentId`、`status`、`statusVersion`、`assigneeAgentId`、`checkoutRunId`、`executionRunId`）。
- 狀態流程：`backlog → todo → in_progress → in_review → done`，另有 `blocked`、`cancelled`；進入 `in_progress` 必須「原子 checkout」，兩個 AI 同時搶，其中一個會拿到 `409 Conflict`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/start/core-concepts.md#L32-L52 ）。技能裡規定「**Never retry a 409**」。
- 每張工單都有 `parentId`，最後都能追溯到公司目標——這就是它「防漏」的骨架。

### 5-3 心跳（heartbeat）：AI 怎麼被叫醒
- 觸發來源：排程、被指派、被留言、人工按 Invoke、核准結果（core-concepts 第 64–77 行）。
- **員工層級的計時心跳**：`runtimeConfig.heartbeat` 的 `enabled`／`intervalSec`；排程讀取在 https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/services/heartbeat/idle-timer-schedule.ts#L9-L60 ，會沿 `reportsTo` 往上檢查整條上司鏈是否可被呼叫（上司被暫停，下屬也不跑）。`wakeOnDemand` 預設 true（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/services/heartbeat-policy.ts ）。
- **AI 端的「心跳協議」**：寫在 795 行的 `skills/paperclip/SKILL.md`。步驟：確認身分 → 處理核准 → 拿待辦 → 挑工作（`in_progress` 優先）→ checkout → 讀脈絡 → 做事 → 更新狀態並留言（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/SKILL.md#L92-L130 ）。

### 5-4 Routine（cron 排程）：最適合做「每日巡讀」
- 資料表：`routines`、`routine_revisions`、`routine_triggers`、`routine_runs`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/db/src/schema/routines.ts#L106-L140 ）；trigger 有 `kind`（schedule／webhook／api）、`cronExpression`、`timezone`、`nextRunAt`、`lastFiredAt`、`lastResult`。
- cron 解析器：自己寫的標準 5 欄位解析，不靠外部套件（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/services/cron.ts#L1-L24 、`parseCron`／`validateCron`／`nextCronTick` 在 https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/services/cron.ts#L204-L253 ）。373 行、零依賴，**很適合直接拆出來用**。
- 排程器：`tickScheduledTriggers` 找出 `nextRunAt <= now` 的 trigger，用「條件式 UPDATE（WHERE nextRunAt = 舊值）」搶佔，搶到才發動，避免同一個巡檢被跑兩次；專案暫停時跳過但仍推進到下一個時間點（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/services/routines.ts#L3186-L3260 ）。
- 兩個關鍵策略（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/api/routines.md#L31-L78 ）：
  - `concurrencyPolicy`：`coalesce_if_active`（預設，上一輪還沒跑完就合併）、`skip_if_active`、`always_enqueue`。→ **防止巡檢重疊、重複產生報告。**
  - `catchUpPolicy`：`skip_missed`（預設，電腦關機漏掉的就算了）、`enqueue_missed_with_cap`。
- 版本與還原：更新時可帶 `baseRevisionId`，舊版本會回 `409`；有 append-only 修訂紀錄與「還原到某版」（同檔第 80–106 行，https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/api/routines.md#L80-L106 ）。→ **防新舊版本衝突的實作範例。**
- 每次觸發會建立一張「執行工單」指派給該 AI，AI 照一般心跳流程處理（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/SKILL.md#L542-L551 ）。

### 5-5 任務看門狗（task watchdog）：抓「AI 默默停工／誤報完成」
- 資料表：https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/db/src/schema/issue_watchdogs.ts （`watchdogAgentId`、`instructions`、`lastObservedFingerprint`／`lastReviewedFingerprint`、`triggerCount`）。
- 說明文件：https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/doc/TASK-WATCHDOG.md （第 1–45 行）。原文列的失誤類型正是你擔心的：「誤讀阻塞、接受過期的計畫確認、沒有證據就宣稱 done、放在 in_review 卻沒有真正的審查人、遇到可恢復的錯誤就放棄」。
- 做法：當被看管的工單與其所有子工單都「停下來」且沒有任何活的後續路徑時，算出一個「停止指紋」；同一個指紋只檢查一次（避免重複叫醒），再喚醒看門狗 AI 讀證據、決定接受或重新推動。產生的留言格式在 https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/services/task-watchdogs.ts#L636-L667 。

### 5-6 技能（skills）怎麼餵給 Claude 與 Codex
- Claude：建一個暫存資料夾放技能 symlink，用 `--add-dir` 交給 `claude`；角色指示用 `--append-system-prompt-file`，續接 session 時不重複注入以省 token（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/adapters/claude-local/src/server/execute.ts#L842-L875 ；文件 https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/adapters/claude-local.md#L103-L105 ）。
- Codex：把技能 symlink 到全域 `~/.codex/skills`，不覆蓋使用者原有技能；`instructionsFilePath` 的內容會 prepend 到送給 `codex exec` 的 prompt，且**不會關掉 Codex 自己讀 repo 內 `AGENTS.md` 的行為**（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/adapters/codex-local.md ，「Skills Injection」與「Instructions Resolution」兩節；程式 https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/adapters/codex-local/src/server/execute.ts#L1149-L1160 ）。
- 公司技能庫：`company_skills` 有 `trustLevel`（預設 `markdown_only`）、`sourceType`、`currentVersionId`，另有 `company_skill_versions`、`company_skill_test_runs` 等（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/db/src/schema/company_skills.ts#L19-L60 ）。→ 技能有版本、可測試、可還原。

### 5-7 團隊範本（角色＋技能＋排程任務打包）
- https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/teams-catalog/catalog/bundled/company-defaults/core-exec-team/TEAM.md ：CEO（策略、排優先、委派）→ CTO（工程執行，向 CEO）→ QA（驗證、收證據，向 CTO）；`requiredSkills` 列出 task-planning、issue-triage、github-pr-workflow、qa-acceptance。
- 角色檔超短，例：QA 的 `AGENTS.md` 只有 frontmatter（`role: qa`、`reportsTo: cto`、`skills: [qa-acceptance]`）＋一句話（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/teams-catalog/catalog/bundled/company-defaults/core-exec-team/agents/qa/AGENTS.md ）。
- 週期任務：`TASK.md` 寫 `recurring: true`，實際 cron 放在廠商擴充 `.paperclip.yaml`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/teams-catalog/catalog/bundled/company-defaults/core-exec-team/projects/first-project/tasks/first-heartbeat/TASK.md ；規格 https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/companies/companies-spec.md#L246-L288 ）。

### 5-8 預算與治理
- 預算：技能規則寫「100% 自動暫停，超過 80% 只做關鍵任務」（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/SKILL.md#L601-L620 ）。
- 治理：招募 AI、CEO 策略需董事會（你）核准；所有變更寫入 activity log（core-concepts 第 78 行起）。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 總規則＋分範圍規則的寫法 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/AGENTS.md#L29-L48 ＋ https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/rules/README.md | 無（純 Markdown） | 低 | 照抄結構：根 `AGENTS.md` 寫「編輯前先讀符合範圍的 `rules/*.mdc`」，每個 rule 用 `globs`／`alwaysApply` 宣告範圍 |
| Claude／Codex 雙格式子代理 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.claude/agents/token-auditor.md ↔ https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.codex/agents/token-auditor.toml | 無 | 低 | 同一個角色內文一字不改，Claude 用 YAML frontmatter（`tools`、`model`），Codex 用 TOML（`developer_instructions`）。可寫小腳本從單一來源產生兩份 |
| 技能共用 symlink | `.claude/skills/company-creator -> ../../.agents/skills/company-creator`（我用 `ls -la` 確認） | 檔案系統支援 symlink（Windows 需注意） | 低 | 技能只寫一份在 `.agents/skills/`，`.claude/skills/` 用 symlink 指過去，Codex 讀 `.agents/skills` |
| 單一來源打包兩家外掛 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/integrations/assistant-plugins/build.mjs | Node.js | 低 | 30 行：把 `shared/skills` 複製進 `claude/…/.claude-plugin` 與 `openai/…/.codex-plugin` 兩個包。可改成「把共用規則同步成 CLAUDE.md 與 AGENTS.md」 |
| cron 解析器 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/services/cron.ts | 無外部依賴 | 低 | 純 TS 函式，可直接搬進 Firebase Functions 或前端，計算下次巡檢時間 |
| routine 排程＋防重疊策略 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/services/routines.ts#L3186-L3260 | Drizzle、Postgres、整個 service 層 | 高 | 不建議搬程式；建議只抄設計：`nextRunAt` 條件式搶佔、`concurrencyPolicy`、`catchUpPolicy`。在 Firestore 可用 transaction 實作同樣的搶佔 |
| 地圖一致性檢查腳本 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/scripts/check-maps.mjs#L31-L127 | Node.js 內建 fs | 低～中 | 抓「重複 ID、孤兒條目、缺對應檔、斷掉的相對連結」，改一下就能檢查你的規則檔／技能是否有重複或互相指不到 |
| 文件漂移巡檢技能（含 cursor 檔） | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/doc-maintenance/SKILL.md | git、gh | 低 | 把目標文件表改成你的 `README`、`AGENTS.md`、`CLAUDE.md`，`.doc-review-cursor` 記住上次巡到的 commit |
| Wiki 健康檢查技能 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/plugins/plugin-llm-wiki/skills/wiki-lint/SKILL.md | 原本用外掛工具 `wiki_search` 等 | 低 | 把工具名換成 Read／Grep 即可，當「每日巡讀」主技能 |
| 排程維護機器人設定流程 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/setup-code-maintenance-bot/SKILL.md ＋ https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/setup-code-maintenance-bot/references/run-instructions.md | Paperclip API（可改成 Claude Code 的排程或 GitHub Actions） | 中 | 抄「每次執行的任務範本」：範圍、排除、時間／成本上限、最多幾個 PR、先查有沒有重複的 PR、驗證、回報格式 |
| 待辦分流技能 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/skills-catalog/catalog/bundled/paperclip-operations/issue-triage/SKILL.md | 原本呼叫 Paperclip API | 低 | 改成讀你的 `TODO.md`／GitHub Issues，套用「卡住判斷規則」與「每張只給一個下一步」 |
| Google Sheets MCP 伺服器 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/google-sheets-mcp-server/src/tools.ts#L140-L248 | Google 服務帳戶、`@modelcontextprotocol/sdk`、zod | 中 | 9 個工具（list_spreadsheets、get_spreadsheet_info、read_values、search_rows、append_rows、update_values、add_sheet_tab、clear_values、delete_rows），每個標註 read／write／destructive，且只能存取白名單試算表 ID。可讓 Claude 直接查／寫你的庫存表 |
| 團隊／角色打包格式 | https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/companies/companies-spec.md#L51-L85 | 無 | 低 | `COMPANY.md`／`TEAM.md`／`agents/<slug>/AGENTS.md`／`skills/<slug>/SKILL.md` 的資料夾慣例，可當你整理 AI 團隊的目錄標準 |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **支援的 AI 工具**：12 個轉接器（`packages/adapters/` 下的資料夾，ls 計）：Claude Code、Codex、Cursor（本機＋雲端）、Gemini CLI、Grok、Kimi、OpenCode、Pi、Hermes（＋Gateway）、OpenClaw Gateway；另可接自訂行程或 HTTP webhook。**Claude 是原生支援**，而且 Claude 與 Codex 可以在同一間公司當不同角色。
- **Claude 的跑法**：`claude --print --output-format stream-json`，帶 `--resume`（續接上一個 session，cwd 變了會開新 session）、`--model`、`--effort`、`--max-turns`、`--append-system-prompt-file`、`--mcp-config … --strict-mcp-config`、`--add-dir`（技能）（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/adapters/claude-local/src/server/execute.ts#L842-L875 ）。
- **prompt 放在哪**：
  - 共通行為：`skills/paperclip/SKILL.md`（心跳協議、狀態規則、留言格式）。
  - 角色：每個員工的 `AGENTS.md`（預設 CEO：一句話 https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/onboarding-assets/ceo/AGENTS.md ；一般員工：「You are an agent in a Paperclip company.」）。載入邏輯只挑 `AGENTS.md`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/services/default-agent-instructions.ts ）。
  - 舊版 CEO 的 `HEARTBEAT.md`（85 行每次心跳檢查表）、`SOUL.md`（人格）、`TOOLS.md` 還在 repo 但不再預設載入（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/server/src/onboarding-assets/ceo/HEARTBEAT.md ）。內容仍很值得參考（每日計畫寫在 `$AGENT_HOME/memory/YYYY-MM-DD.md`）。
  - 團隊範本：`packages/teams-catalog/catalog/**/agents/*/AGENTS.md`。
- **MCP**：Claude 轉接器支援 `--mcp-config`；另有對外 MCP 端點 `/mcp/paperclip`，搭配 `integrations/assistant-plugins` 讓你在 Claude 或 ChatGPT 裡直接「看我的 AI 團隊、派工、拿結果」（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/integrations/assistant-plugins/README.md ）。三個共用技能：`review-my-team`、`delegate-work`、`follow-up-results`。
- **Skills**：有，而且是重點功能（技能庫、版本、測試、信任等級）。規格明確說要相容 Agent Skills／`skills.sh`，Paperclip 自己的欄位只能放在 `metadata.paperclip`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/companies/companies-spec.md#L289-L326 ）。
- **能不能全換成 Claude**：可以，所有角色都設 `claude_local` 即可；也可以「寫程式用 Claude、驗收用 Codex」交叉檢查。

---

## 8. 擴充方式與 API

- **REST API**：全部在 `/api`；AI 員工用 bearer API key（雜湊儲存），不可跨公司；新增端點要做公司存取檢查、區分董事會與 AI 權限、寫 activity log（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/AGENTS.md#L230-L243 ）。修改工單時必須帶 `X-Paperclip-Run-Id` 標頭，把動作綁到這次心跳以便稽核。
- **Routines API**：`POST /api/companies/{companyId}/routines`、`POST /api/routines/{id}/triggers`（schedule／webhook／api），webhook 支援 `hmac_sha256` 簽章（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/api/routines.md ）。→ 你可以從自己的 Firebase App 打 webhook，叫 Paperclip 的某個 AI 開工。
- **外掛**：`packages/plugins/`（7 個）。外掛可在 manifest 裡宣告自己的 AI 員工、技能、routines、工具；LLM Wiki 外掛就是完整範例（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/plugins/plugin-llm-wiki/src/manifest.ts#L236-L316 ）。`sdk/` 資料夾我沒讀內容（未讀）。
- **自訂轉接器**：repo 有 `.agents/skills/create-agent-adapter/`（716 行）與 `packages/adapters/AUTHORING.md`，我只確認存在、沒有細讀（未讀）。
- **公司打包匯入／匯出**：Agent Companies 規格（`agentcompanies/v1-draft`），Markdown 為準、可放 GitHub、外部引用要釘 commit＋sha256，對不上就拒絕（fail closed）（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/companies/companies-spec.md#L370-L393 ）。
- **CLI**：`paperclipai`；`npx paperclipai agent local-cli <agent> --company-id <id>` 可把 Paperclip 技能裝進你的 Claude／Codex 並輸出環境變數，讓你在終端機手動扮演某個 AI 員工（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/SKILL.md#L20-L30 ）。

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

**維護狀況**：非常活躍。2026-03-02 建立、8 個月 11 萬星、掃描當天（2026-11-04）仍有推送（HEAD commit 時間 `2026-11-04 10:31 -0600`）。`.github/workflows` 30 個檔，其中 7 個有 cron 排程（每日發版、每日 lockfile 更新、每週測試耗時統計、多個每週評測等，grep `schedule:` 計）。

**測試與紀律**：3,833 個測試檔；`AGENTS.md` 的完成定義要求型別檢查、測試、建置全過、db/shared/server/ui 契約同步、PR 模板每欄都填（含「Model Used」：用哪個 AI 模型寫的）（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/AGENTS.md#L251-L270 ）。

**風險與坑：**
1. **非常龐大、變動很快**：`heartbeat.ts` 4,392 行、`routines.ts` 3,332 行、`server/src/services` 有 1,123 個項目。要從原始碼改它不容易；建議當「使用者」用或只抄設計。
2. **它自己也有「新舊版本並存」**：CEO 的 `HEARTBEAT.md`／`SOUL.md`／`TOOLS.md` 還在但不再預設載入（`packages/teams-catalog/MIGRATION.md` 第 11 行有說明）；`agent_instruction_revisions` 資料表已被「persistent agent files」取代，只保留相容（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/doc/agent-instruction-revisions.md ）。抄範本時要確認抄的是現行版。
3. **同一檔案的編輯衝突是「最後同步者勝」**：AI 員工的個人檔案在同一把鎖下，競爭編輯同一檔時「last synchronization to acquire the lock wins」，不保留衝突副本（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/doc/agent-files.md#L141-L170 ）。工單文件與 routine 則有 `baseRevisionId`→`409` 的樂觀鎖。
4. **權限預設很寬**：`claude_local` 的 `dangerouslySkipPermissions` 預設 `true`（無人值守時無法互動核准）（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/adapters/claude-local.md#L38 ）。AI 在你電腦上可以不經詢問執行指令——請把工作目錄限制在專案資料夾、不要放正式環境的 Firebase 金鑰。
5. **`local_trusted` 不需登入**：只綁 localhost 沒問題，但千萬不要改成對外開放又不開登入。
6. **遙測預設開**（見第 2 節）。
7. **費用失控風險**：每次心跳預設最多 300 回合；排程開太密會一直燒 token。一定要設每位員工月預算。
8. **Commit 署名規則**：它的技能要求 AI 提交時一律加 `Co-Authored-By: Paperclip <noreply@paperclip.ing>`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/SKILL.md#L601-L620 最後一點）。如果你不想要，要自己改技能。
9. **Windows 支援**：README 只寫需要 Node 24.11+；我沒有找到 Windows 專門說明，**未確認**。symlink 技能共用在 Windows 可能要開開發者模式。

---

## 10. 跟其他專案組合的建議

- **Paperclip（排程＋派工＋看板）＋ spec-kit（專案憲法＋`/speckit.analyze` 一致性稽核）**：用 spec-kit 寫一份帶版本號的總規則與稽核指令，用 Paperclip routine 每晚叫巡檢員跑稽核，結果寫成工單文件。
- **Paperclip ＋ addyosmani/agent-skills 或 mattpocock/skills**：那些是高品質的技能內容，Paperclip 是技能庫＋派發；技能格式都是 `SKILL.md`，可以直接匯入公司技能庫。
- **Paperclip ＋ BMAD-METHOD**：BMAD 的角色（PM、架構師、開發、QA）可直接對應成 Paperclip 的 AI 員工與 `reportsTo`。
- **給你的最小可行組合（不裝 Paperclip 版）**：
  1. 根目錄 `AGENTS.md`（總規則，Codex 會讀）＋`CLAUDE.md` 只寫一行「請先讀 AGENTS.md」或用同步腳本產生（仿 `build.mjs`）。
  2. `rules/*.mdc`：例如 `firebase-security.mdc`（globs: `firestore.rules,functions/**`）、`inventory-calc.mdc`（globs: `src/inventory/**`）。
  3. `.agents/skills/daily-patrol/SKILL.md`：合併 `doc-maintenance`（cursor 檔）＋`wiki-lint`（七類問題、唯讀）＋`issue-triage`（每項一個下一步）。
  4. `.claude/skills/daily-patrol` → symlink 到上面；Codex 版可放 `.codex` 對應位置或直接讀 `.agents/skills`。
  5. 排程：先用 Claude Code 或 GitHub Actions 每天跑一次；等 AI 數量多了再換成 Paperclip routine。
- **試算表方向**：`google-sheets-mcp-server` 可跟 01 類的網頁試算表專案（Univer、Luckysheet 等）並用：網頁端給人操作，Google Sheets＋MCP 給 AI 讀寫。

---

## 11. 規則／角色／巡檢 檢查表

### 11-1 共用規則怎麼寫
- **檔案結構：有。** 根 `AGENTS.md`（274 行，wc -l 計）＋`rules/*.mdc`（10 個規則）＋巢狀 `AGENTS.md`（全 repo 22 個）。規則檔是 Markdown＋YAML frontmatter（`description`、`globs`、`alwaysApply`）（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/rules/README.md ）。repo 根目錄**沒有** `CLAUDE.md`（檔案清單比對確認）——它讓 Claude 也讀 `AGENTS.md`。
- **分層：有。** 全域（`alwaysApply: true`，例：`module-boundaries.mdc`、`product-harness-responsibility.mdc`、`pull-request-review.mdc`）→ 子範圍（`globs`，例：`heartbeat-execution-boundaries.mdc` 只管 `server/src/services/heartbeat*`）→ 子資料夾 `AGENTS.md`（例：`packages/adapter-utils/src/acpx-engine/AGENTS.md`）。
- **優先順序：部分有。** `AGENTS.md` 寫「這些規則**補充**本檔與任何適用的巢狀 AGENTS.md」，並規定必讀順序 GOAL → PRODUCT → SPEC-implementation → DEVELOPING → DATABASE（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/AGENTS.md#L10-L48 ）。衝突時誰贏沒有明文規則，**未確認**。
- **讓 Codex 和 Claude 讀同一份：有，三種手法。** (1) 只寫 `AGENTS.md`；(2) `rules/` 是單一事實來源，連 AI 審查工具 Greptile 也透過 `.greptile/files.json` 指向同一批檔，並規定「政策內容只留在 rule 檔，不要複製到工具設定」（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.greptile/files.json ）；(3) 技能用 symlink、子代理寫兩種格式（第 6 節）。另外 `rules/README.md` 特別提醒：Cursor 不會自動讀 `rules/`，`.mdc` 副檔名本身不會讓任何工具自動套用——**要靠 AGENTS.md 明文叫 AI 去讀**。

### 11-2 角色設計
- **有。** 角色、職責、技能、向誰負責都有資料欄位（`agents.role/title/reportsTo/capabilities/permissions`）與範本（core-exec-team：CEO→CTO→QA）。
- **技能：有**，用 frontmatter `skills:` 列出，依簡稱解析：本地 `skills/<shortname>/SKILL.md` → 引用的套件 → 公司技能庫（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/companies/companies-spec.md#L183-L224 ）。
- **可用工具：有**（Claude 子代理 `tools: Read, Grep, Glob, Bash`；公司層級有 tool access 相關資料表，未細讀）。
- **交接（handoff）：有。** 委派用子工單（必設 `parentId`、`goalId`）、需要人決定時用 `ask_user_questions`／`request_confirmation` 互動卡並把工單設 `in_review`；「send it back to me」要改指派給該使用者（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/SKILL.md#L601-L620 ）。
- **角色檔寫法的重要原則（值得照抄）**：角色 `AGENTS.md` 只寫「你是誰、負責什麼」一小段；上司、權限、轉接器、技能放設定檔；通用流程放技能，**不要在每個角色重複寫**（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip-create-agent/references/baseline-role-guide.md ；檢查表 https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip-create-agent/references/draft-review-checklist.md ）。這直接解決你「規則互相重複」的問題。

### 11-3 防漏
- **任務追蹤：有**（工單樹、`blockedByIssueIds` 一級阻塞關係，規定不要只在留言寫「被 X 擋住」）。
- **完成前驗證：有。** 結束心跳前的「最終狀態檢查表」：`done` 必須有驗證紀錄；`in_review` 必須有真正的審查路徑（指派給自己＋留言「請審查」不算）；`in_progress` 只有在真的有排程續跑時才可保留（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/SKILL.md#L223-L232 ）。還有「Verify writes — never infer them」：API 回應是空的就算失敗。
- **交接紀錄：有。** 每個修改帶 `X-Paperclip-Run-Id`、activity log、工單文件（plan 等）有修訂版本。
- **漏網偵測：有。** task watchdog（第 5-5 節）＋ issue-triage 的卡住規則：「`in_progress` 24 小時沒留言也沒文件更新 → 需叫醒」「子工單全完成但父工單仍 in_progress → 確認後關閉」（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/skills-catalog/catalog/bundled/paperclip-operations/issue-triage/SKILL.md ）。

### 11-4 防重複
- **重複工作：有。** 原子 checkout＋409；建立工單／互動要帶 `idempotencyKey`；routine 的 `coalesce_if_active`／`skip_if_active`；維護機器人設定前要「比對公司、repo、技能、觸發條件找重複的 routine，名稱相同不代表同一個」（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/setup-code-maintenance-bot/SKILL.md#L77-L92 ）；每次執行前先查還開著的 PR、重試時接回自己的分支而不是再開一個（run-instructions 第 21–25 行）。
- **重複留言：有**（「Blocked-task dedup」：自己上一則就是阻塞更新且沒人回，就不要再留言，https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/SKILL.md#L120 ）。
- **重複內容／規則：部分有。** `check-maps.mjs` 會抓 `duplicate capability`、`orphan capability`；`wiki-lint` 抓「同一概念散在三頁以上卻沒有專頁」；`token-auditor` 子代理專門找重複元件、只列建議不合併。**沒有**找到專門比對「兩份規則檔內容重複」的工具。
- **重複角色：未確認**（沒找到自動偵測重複 AI 員工的功能；建立時是人工檢查表）。

### 11-5 防新舊版本衝突
- **版本標記：有。** routine 修訂（append-only＋還原）、公司技能版本（`company_skill_versions`）、工單文件 `latestRevisionId`。
- **樂觀鎖：有。** 帶 `baseRevisionId`，別人已改過就回 `409`，要求先讀最新版再合併（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/references/issue-documents.md#L45-L58 ）。
- **單一事實來源：有。** 明文：`DESIGN.md` 是 UI 決策唯一來源；`doc/SPEC-implementation.md` 是 V1 建置契約，`doc/SPEC.md` 與它要對齊；rules 本文只留一份；外部引用要釘 commit＋sha256。
- **變更提案／封存：有。** 計畫檔一律放 `doc/plans/YYYY-MM-DD-slug.md`；「除非被要求，不要整份取代策略文件，優先追加」（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/AGENTS.md#L121-L126 ）。
- **過期（drift）偵測：有。** `doc-maintenance` 技能定義「漂移」：文件寫的旗標／端點已不存在、範例跑不動、預設值和程式不符、「即將推出」其實已上線或取消（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/skills-catalog/catalog/bundled/docs/doc-maintenance/SKILL.md#L51-L61 ）；`wiki-lint` 的「Stale claims：較新的來源推翻了舊頁 → 標記舊頁，**不要覆寫**」；LLM Wiki 規則：新資訊與舊頁矛盾時加註 `> ⚠ contradicted by [[...]] (YYYY-MM-DD)` 而不是默默改掉（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/plugins/plugin-llm-wiki/templates/AGENTS.md#L77 ）。

### 11-6 定期巡檢
- **排程機制：有，而且是內建功能。** routine＋cron（第 5-4 節）、員工計時心跳、task watchdog 的定期重評。
- **現成的「每日巡讀」設定：有。** LLM Wiki 外掛內建三個 routine：每 6 小時處理更新、**每晚 03:00 UTC 跑 lint**、每小時刷新索引；都預設 `paused`、trigger `enabled: false`，`concurrencyPolicy: skip_if_active`、`catchUpPolicy: skip_missed`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/plugins/plugin-llm-wiki/src/manifest.ts#L236-L316 ）。→ 預設關閉、人確認後才開，這個原則值得照抄。
- **增量巡讀：有。** `doc-maintenance` 用 `.doc-review-cursor` 存上次巡到的 commit SHA，第一次往回看 60 天，之後只看 `git log 上次..HEAD`；巡完（不論有沒有改）都更新 cursor（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/doc-maintenance/SKILL.md#L34-L60 ）。
- **報告格式：有。** `wiki-lint` 依嚴重度分組（critical：矛盾、指向現行頁的斷鏈、捏造出處；medium：過期、出處薄弱、概念缺頁；low：孤兒、日誌漂移），每項附檔案路徑、1–2 行證據引文、建議修法、該由哪個後續動作處理；沒發現也要寫一筆紀錄（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/plugins/plugin-llm-wiki/skills/wiki-lint/SKILL.md ）。
- **簡短範例（依 wiki-lint＋doc-maintenance＋issue-triage 的格式，改寫成你的倉儲專案；非 repo 原文）：**
  ```
  ## [2026-11-05] patrol | 5 項發現（critical 1／medium 2／low 2）
  - 範圍：commit 3f2a1c0..9b7e4d2（12 個 commit），cursor 已更新
  - critical｜AGENTS.md vs CLAUDE.md：盤點單位一個寫「箱」、一個寫「件」
    證據：AGENTS.md L42「庫存以箱計」／CLAUDE.md L18「庫存一律以件計」
    建議：以 AGENTS.md 為準，CLAUDE.md 改為引用 → 下一步：人工確認
  - medium｜docs/price.md：仍寫「成本計算尚未支援運費」，但 commit 7c1e 已上線
  - medium｜TODO.md「匯出 Excel」標 in_progress 已 3 天無更新 → wake-needed（Codex）
  - low｜rules/firebase.mdc 與 rules/firestore.mdc 第 2–5 條重複 → 建議合併
  - low｜skills/old-import/ 沒被任何 AGENTS.md 引用（孤兒）
  ```
- **hook：未確認**（`.claude/` 下只有 `agents/`、`skills/`、`launch.json`，沒有看到 hooks 設定）。

### 11-7 Skill 寫法
- **SKILL.md 格式：有。** frontmatter 只要 `name`（kebab-case）＋`description`；資料夾可有 `references/`、`scripts/`、`assets/`、`examples/`（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/docs/guides/agent-developer/writing-a-skill.md ）。
- **description 怎麼寫才會被正確觸發：有明確規則。** 「寫成路由邏輯，不是行銷文案」；包含「什麼時候用、什麼時候不要用」；內建目錄技能強制 **40–300 字元**，由測試檢查（https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/create-paperclip-bundled-skill/SKILL.md#L159-L235 ）。執行期原理：AI 先只看 name＋description，判斷相關才載入全文，所以 description 決定會不會被叫到。
- **內文結構：** 「When to use／When not to use」、具體指令勝過散文、細節放 `references/`、附 1–2 個完整範例。
- **腳本放哪：** `scripts/`；但只要有 `scripts/`，信任等級就變成 `scripts_executables`，安裝需稽核——官方建議「能純 Markdown 就純 Markdown」。範例：`skills/paperclip/scripts/paperclip-issue-update.sh`（檢查 HTTP 狀態、重試、確認回傳狀態）。
- **Codex 顯示資訊：** 10 個 `.agents/skills/*/agents/openai.yaml`（find 計），寫 `display_name`、`short_description`、`default_prompt`（例：https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/setup-code-maintenance-bot/agents/openai.yaml ）。

### 11-8 支援哪些工具與安裝方式
- **有。** Claude Code、Codex、Cursor（本機／雲端）、Gemini CLI、OpenCode、Pi、Hermes、Grok、Kimi、OpenClaw，另可接 HTTP／自訂行程。
- 安裝：`npx paperclipai@latest onboard --yes`（Node 24.11+）。單機手動把技能裝進 Claude／Codex：`npx paperclipai agent local-cli <agent> --company-id <id>`。ChatGPT／Claude 對話端外掛：`node integrations/assistant-plugins/build.mjs <你的 https 端點>/mcp/paperclip`。

### 11-9 可以直接借用到你「基礎架構」的檔案或段落
1. `AGENTS.md` §2「Scoped repository rules」（L29–L48）→ 你的總規則開頭。
2. `AGENTS.md` §5 第 4、5 點（L121–L126）→「不要整份取代、優先追加」「計畫檔用日期命名集中放」。
3. `AGENTS.md` §7、§11（L178–L270）→「交接前驗證、做不到要明說哪些沒跑」「完成定義」。
4. `rules/README.md` 全文 → 規則檔怎麼寫、單一來源、不要複製到工具設定。
5. `.claude/agents/token-auditor.md`＋`.codex/agents/token-auditor.toml` → 「唯讀巡檢員」角色的雙格式範本（「只產報告、從不改原始碼、合併要人核准」）。
6. `skills/paperclip/SKILL.md` L223–L232（最終狀態檢查表）、L601–L620（Critical Rules）→ 改寫成你所有 AI 都要遵守的「收工規則」。
7. `skills/paperclip-create-agent/references/baseline-role-guide.md`＋`draft-review-checklist.md` → 角色檔寫法與建角色檢查表。
8. `packages/skills-catalog/catalog/bundled/paperclip-operations/issue-triage/SKILL.md` → 每日待辦分流。
9. `.agents/skills/doc-maintenance/SKILL.md` → 增量巡讀（cursor 檔）。
10. `packages/plugins/plugin-llm-wiki/skills/wiki-lint/SKILL.md` → 每日巡讀主體（七類問題、唯讀、分級報告）。
11. `packages/plugins/plugin-llm-wiki/templates/AGENTS.md` L77、L101–L126 → 矛盾標註法、`log.md` 標題格式（`## [YYYY-MM-DD] op | subject`，可用 `grep "^## \[" log.md | tail` 查近況）。
12. `.agents/skills/setup-code-maintenance-bot/references/run-instructions.md` → 排程巡檢每次執行的任務範本（上限、防重複、驗證、回報）。
13. `scripts/check-maps.mjs` → 規則／技能索引的結構檢查腳本範本。
14. `integrations/assistant-plugins/build.mjs` → 一份來源產生 Claude 與 Codex 兩份包裝。

---

## 關鍵字
Paperclip、paperclipai、AI 員工、AI 公司、多代理協作、multi-agent orchestration、control plane、控制台、組織圖、org chart、角色、role、reportsTo、心跳、heartbeat、例行排程、routine、cron、每日巡檢、巡讀、nightly lint、wiki-lint、doc-maintenance、文件漂移、drift detection、stale、矛盾偵測、contradiction、防重複、dedup、idempotencyKey、原子 checkout、409 Conflict、task watchdog、任務看門狗、issue-triage、工單、issue、AGENTS.md、CLAUDE.md、rules/*.mdc、globs、alwaysApply、Greptile、SKILL.md、skills、技能庫、Agent Skills、agentcompanies spec、TEAM.md、TASK.md、.claude/agents、.codex/agents、symlink、Claude Code、Codex、Cursor、Gemini CLI、MCP、Google Sheets MCP、預算、budget、治理、governance、自架、self-hosted、Node.js 24、PostgreSQL、PGlite、Drizzle、React、Vite、Express、TypeScript、MIT
