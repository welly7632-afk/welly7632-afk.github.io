# MrLesk/Backlog.md — 把任務寫成 git 裡的 Markdown，讓人、Claude、Codex 照同一張看板領任務、寫計畫、勾驗收、留紀錄
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：3a296c0
> GitHub：https://github.com/MrLesk/Backlog.md｜⭐ 7278｜授權：MIT｜主要語言：TypeScript｜最近更新：2026-10-29

> 本資料包所有程式碼位置都以 commit `3a296c0f6f949b31e458b849b9617702c56c1023` 為準，連結都寫成完整網址。
> 版本：`package.json` 寫的是 `1.55.3`（[package.json](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/package.json)）。
> 計數方式：檔案數用 `git ls-tree -r --name-only HEAD`（共 1,533 個檔案）；測試檔用 `find src -name '*.test.ts' -o -name '*.test.tsx'`（330 個）；非測試的 `.ts/.tsx` 原始碼 221 個；MCP 工具名稱用 grep `name: "` 掃 `src/mcp/tools/*/index.ts`（24 個）。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Backlog.md 是一支指令列工具 `backlog`（也附終端機看板 TUI 和本機網頁看板），它在專案裡建一個 `backlog/` 資料夾，每個任務是一個 Markdown 檔（YAML 表頭 + 描述／驗收條件／完成定義／實作計畫／實作筆記／留言／最終摘要），人和 AI 都透過同一組 `backlog task ...` 指令建立、領取、更新、結案，所以「誰在做什麼、做到哪、怎麼驗證的」全部留在 git 裡。

**它最值得你學的不是看板，而是這三個設計**：

1. **規則只寫一份，AI 每次從工具「現領」**：它不把一大段工作流程貼進 `AGENTS.md`／`CLAUDE.md`，而是只放一小段「提醒」（nudge），叫 AI 每次對話一開始先跑 `backlog instructions overview`，詳細流程由執行檔即時輸出。這樣 Claude 和 Codex 讀到的一定是同一版、最新版，不會出現「CLAUDE.md 是新的、AGENTS.md 是舊的」。它自己的專案更直接：`CLAUDE.md` 是指向 `AGENTS.md` 的符號連結（git mode `120000`），兩個 AI 讀同一個檔。
2. **任務就是交接單**：每個任務強制分成「為什麼（Description）→ 做到什麼程度算完成（Acceptance Criteria）→ 專案通用的完成定義（Definition of Done）→ 開工前寫的計畫（Plan）→ 過程筆記（Notes）→ 結案摘要（Final Summary）」。下一個 AI 不用看聊天紀錄，打開任務檔就能接手。這正好對應你說的「AI 會漏東西」。
3. **衝突與重複的「機械層」防護**：任務 ID 由工具配發並加鎖（多個 AI 同時建任務不會撞號）；同一任務同時被兩個 AI 編輯會立刻失敗（fail fast）；`backlog doctor` 會找出重複 ID、自我依賴、循環依賴；跨 git 分支會比對同一任務的狀態取「最進度」那一份。

**對你的倉儲／庫存 App（純 JavaScript + Firebase）具體可以這樣用**：

- 在 App 的 git 專案根目錄跑 `backlog init "倉儲系統"`，選「CLI instructions」，勾 `AGENTS.md` 和 `CLAUDE.md`。之後 Claude Code 和 Codex 進來都會先讀同一套流程。
- 你只要對 AI 說「我要加『進貨單匯入 Excel』，請拆成 Backlog 任務」，它會先 `backlog search` 確認沒重複，再建任務並寫驗收條件。你看過驗收條件（檢查點 1）→ 叫某一個 AI「只做 TASK-12，先寫計畫等我批准」（檢查點 2）→ 實作完成，它要拿證據逐條勾驗收才能改成 Done（檢查點 3）。
- 分工建議：Claude 寫計畫＋實作，Codex 做審查（在任務裡用 `--comment` 留審查意見），兩邊都寫進同一個任務檔，`assignee` 欄位寫 `@claude`／`@codex` 就知道是誰負責。它自己的倉庫就是這樣跑的：我用 grep 數 `backlog/tasks`、`backlog/completed`、`backlog/archive/tasks` 裡的 `assignee` 欄位，`@codex` 出現 292 次、`@claude` 130 次、`@Claude` 25 次、`@alex-agent` 40 次、`@MrLesk`（人）41 次（只抓 `assignee:` 後 3 行，屬粗估）。
- 每天巡讀：工具本身**沒有排程**，但 `backlog doctor`、`backlog task list --json`、`backlog search --json` 都是可給腳本讀的輸出，很適合做成你自己的每日巡檢腳本（第 11 節有範本）。
- 也可以拿來管非程式的工作（廣告素材、影片腳本待辦）：`backlog init "廣告排程" --no-git` 建一個純資料夾版的看板，用 `backlog browser` 在本機網頁拖拉卡片。

**它不做的事**（要從別的專案補）：沒有「角色／人格」系統、沒有 SKILL.md 技能包（目前只是待辦任務）、沒有語意層的「內容重複」偵測、沒有排程巡檢。

---

## 2. 授權白話

- **授權：MIT**（[LICENSE](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/LICENSE)，`package.json` 的 `license` 也寫 `MIT`）。
- **個人使用**：完全自由，裝來用、改程式碼、抄規則檔都可以。
- **公司商用**：可以，包括把程式碼併進你自己的商業工具、閉源販售；唯一義務是在你散布的程式裡保留原本的著作權聲明與 MIT 授權全文。
- **付費版／閉源功能**：程式碼裡沒有看到授權金鑰、付費功能開關或雲端服務。README 推薦的 Groma.md（架構地圖）是**另一個獨立產品**（`npm i -g groma.md`），它的授權與收費我沒有檢查，**未確認**。
- **你自己的任務檔**：放在你自己的 repo，屬於你，工具不會上傳。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | TypeScript，執行環境是 **Bun**（程式碼大量用 `Bun.file`、`Bun.write`、`Bun.spawn`，例如 [src/agent-instructions.ts](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/agent-instructions.ts#L26-L34)） |
| 發佈方式 | npm 套件 `backlog.md` 只是啟動器（`scripts/cli.cjs`），真正的執行檔是各平台編譯好的 `backlog.md-<os>-<arch>`（見 `package.json` 的 `optionalDependencies`）。也有 Homebrew、Nix |
| CLI 框架 | `commander`、互動問答 `@clack/prompts` |
| 終端機 UI | `neo-neo-bblessed`（blessed 分支） |
| 網頁 UI | React 19 + React Router 7 + Tailwind CSS 4，`@uiw/react-md-editor` 編輯 Markdown，`mermaid` 畫圖 |
| 本機伺服器 | Bun 內建 HTTP，只綁 `127.0.0.1`（[src/server/index.ts#L224](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/server/index.ts#L224)），預設埠 6420 |
| 資料庫 | **沒有資料庫**。資料就是 `backlog/` 底下的 Markdown 檔（`gray-matter` 解析 YAML 表頭，`mdast-util-from-markdown` 解析內文） |
| 搜尋 | `fuse.js` 模糊搜尋（[src/core/search-service.ts](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/core/search-service.ts)） |
| 併發控制 | `proper-lockfile` 檔案鎖 |
| AI 介面 | CLI 文字／JSON 輸出（主要），MCP 伺服器 `@modelcontextprotocol/sdk`（次要，官方稱「legacy、optional」） |
| 硬體／GPU | 不需要 GPU，一般筆電即可 |
| API Key／費用 | **不需要任何 API Key，工具本身免費**。費用只來自你本來就在用的 Claude Code／Codex 訂閱 |
| 安裝 | `npm i -g backlog.md` → `backlog init "專案名"`；試用可 `npx backlog.md init` |

---

## 4. 程式架構地圖

```
Backlog.md/
├── AGENTS.md                 ← 給 AI 的專案規則（Codex、Cursor… 讀這個）
├── CLAUDE.md -> AGENTS.md    ← 符號連結，Claude 讀到的就是同一份
├── MANIFESTO.md              ← 專案「憲法」：產品原則、單一事實來源、風險
├── .claude/agents/project-manager-backlog.md  ← Claude Code 子代理（專案經理角色）
├── .claude/skills -> ../.codex/skills          ← 符號連結，但 .codex/skills 沒有進版控（只有 .codex/.gitignore）
├── .github/copilot-instructions.md            ← 給 Copilot 的舊版說明（內容已落後，見第 9 節）
├── ADVANCED-CONFIG.md / CLI-INSTRUCTIONS.md   ← 設定與指令完整說明
├── backlog/                  ← 這個專案自己的任務資料（吃自己的狗糧）
│   ├── config.yml            ← 狀態欄、DoD 預設、任務前綴 back
│   ├── tasks/      (168 個 back-*.md，進行中／待辦／剛完成)
│   ├── completed/  (585 個 back-*.md，舊版本的「已完成」資料夾)
│   ├── archive/tasks/ (49 個，封存)
│   ├── drafts/     (16 個 draft-*.md，草稿)
│   ├── decisions/ docs/ milestones/   ← 決策紀錄、文件、里程碑
├── groma/                    ← Groma.md 產生的 C4 架構地圖（每個元件一個 .md）
│   └── actors/ai-coding-agent.md      ← 把「AI 代理」寫成系統的一個角色
├── src/
│   ├── cli.ts                ← 所有指令定義（6,252 行，doctor／cleanup／agents 都在這）
│   ├── agent-instructions.ts ← 把規則區塊寫進 AGENTS.md/CLAUDE.md/GEMINI.md/Copilot 的邏輯
│   ├── guidelines/           ← 給 AI 的流程文字（打包進執行檔）
│   │   ├── cli-agent-nudge.md          ← 寫進 AGENTS.md 的短提醒
│   │   ├── cli-instructions/*.md       ← overview / task-creation / task-execution / task-finalization
│   │   ├── mcp/*.md                    ← 同一套流程的 MCP 版本
│   │   └── project-manager-backlog.md  ← Claude 子代理的原稿
│   ├── commands/instructions.ts ← `backlog instructions <guide>` 指令
│   ├── core/
│   │   ├── backlog.ts        ← 核心 Core 類別（5,401 行）：建立／編輯／封存任務、狀態回呼、決策取代
│   │   ├── duplicate-task-repair.ts ← 重複 ID 修復計畫
│   │   ├── cross-branch-tasks.ts / task-loader.ts / task-identity-index.ts ← 跨分支讀取同一任務
│   │   ├── search-service.ts ← 模糊搜尋
│   │   └── init.ts           ← `backlog init` 時寫規則檔、設定 MCP
│   ├── markdown/structured-sections.ts ← 任務檔各區段的 BEGIN/END 標記解析與改寫
│   ├── file-system/operations.ts       ← 讀寫檔、ID 配發鎖、單任務編輯鎖
│   ├── mcp/                  ← MCP 伺服器與 24 個工具
│   ├── utils/                ← 重複偵測、依賴就緒判斷、狀態回呼…
│   ├── server/index.ts       ← 本機網頁看板的 REST API
│   ├── ui/                   ← 終端機看板
│   ├── web/                  ← React 網頁看板
│   └── test/                 ← 大部分測試檔（全 repo 共 330 個測試檔）
└── .github/workflows/ci.yml, architecture.yml, release.yml
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 把規則寫進各 AI 的說明檔 | [src/agent-instructions.ts#L126-L210](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/agent-instructions.ts#L126-L210) | 同一段內容寫入 `AGENTS.md`、`CLAUDE.md`、`GEMINI.md`、`.github/copilot-instructions.md`；用 `<!-- BACKLOG.MD GUIDELINES START/END -->` 包起來，**只替換標記內的區塊，保留你原本寫的其他內容**；沒有標記就附加在檔尾 |
| 規則區塊版本標記 | [src/agent-instructions.ts#L57-L73](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/agent-instructions.ts#L57-L73) | 每個區塊內嵌 `<!-- backlog.md-instructions-version: x.y.z -->`。註解說是為了日後比對新舊；但我 grep 全 repo，除了測試以外**沒有程式讀它來比對**，所以目前只是標記，不會自動警告過期 |
| MCP 模式改寫規則區塊 | [src/agent-instructions.ts#L228-L280](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/agent-instructions.ts#L228-L280) | 切換成 MCP 時，先拆掉 CLI 版區塊再在同位置插入 MCP 版，**避免兩套規則同時存在而互相矛盾** |
| 短提醒（nudge）內容 | [src/guidelines/cli-agent-nudge.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-agent-nudge.md) | 只有 20 行：開場先跑 `backlog instructions overview`，建立／執行／結案前各讀對應指南，不准直接改任務 Markdown 檔 |
| 流程指南輸出 | [src/commands/instructions.ts#L56-L90](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/commands/instructions.ts#L56-L90)、[src/mcp/workflow-guides.ts#L16-L90](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/mcp/workflow-guides.ts#L16-L90) | 4 份指南（overview、task-creation、task-execution、task-finalization）+ init-required；CLI 與 MCP 共用同一份清單，MCP 以 `backlog://workflow/...` 資源提供 |
| 初始化時選 AI 工具 | [src/core/init.ts#L27-L32](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/core/init.ts#L27-L32)、[#L253-L299](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/core/init.ts#L253-L299) | 對應表：claude→`CLAUDE.md`、codex→`AGENTS.md`、gemini→`GEMINI.md`、kiro→`AGENTS.md`；CLI 模式可選裝 Claude 子代理 |
| 自動幫各 AI 註冊 MCP | [src/utils/mcp-client-setup.ts#L17-L44](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/utils/mcp-client-setup.ts#L17-L44) | 直接呼叫 `claude mcp add -s user backlog -- backlog mcp start`、`codex mcp add backlog -- backlog mcp start` 等 |
| 任務檔格式 | [src/types/index.ts#L46-L88](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/types/index.ts#L46-L88) | 欄位：id、title、status、assignee、dependencies、references、documentation、**modifiedFiles**、priority、type、milestone、parentTaskId、onStatusChange… |
| 區段標記與安全改寫 | [src/markdown/structured-sections.ts#L14-L60](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/markdown/structured-sections.ts#L14-L60) | 每個區段用 `<!-- SECTION:PLAN:BEGIN -->`、`<!-- AC:BEGIN -->`、`<!-- DOD:BEGIN -->`、`<!-- COMMENTS:BEGIN -->` 包住；舊格式邊界不明時拒絕取代（見 task-execution 指南 L49-L54），避免 AI 誤刪別段 |
| 任務 ID 配發鎖 | [src/file-system/operations.ts#L699-L734](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/file-system/operations.ts#L699-L734) | 鎖放在 `git rev-parse --git-common-dir` 底下的 `backlog.md/locks/create`，**所有 worktree 共用**，所以多個 AI 在不同 worktree 同時建任務也不會拿到同一個號碼 |
| 單一任務編輯鎖 | [src/file-system/operations.ts#L736-L800](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/file-system/operations.ts#L736-L800) | `retries: 0`：有人在改就立刻失敗，「不在背後合併或覆蓋」，由人或 AI 決定是否重試 |
| 重複 ID 偵測 | [src/utils/duplicate-detection.ts#L66-L104](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/utils/duplicate-detection.ts#L66-L104) | 依正規化後的 ID 分組，>1 即重複；輸出人看得懂的警告並要求跑 `backlog doctor` |
| 巡檢／修復 `doctor` | [src/cli.ts#L5841-L6015](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/cli.ts#L5841-L6015) | 檢查：任務／文件／決策／草稿重複 ID、自我依賴、循環依賴、放錯位置的封存任務、保留前綴衝突；有問題時 exit code=1；`--fix` 先預覽、再確認、修完重新驗證 |
| 清理已完成任務 | [src/cli.ts#L6017-L6128](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/cli.ts#L6017-L6128) | 只封存「最終狀態且超過 N 天」的任務；必須互動確認，非互動環境直接失敗不動任何檔 |
| 依賴就緒判斷 | [src/utils/readiness.ts#L1-L60](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/utils/readiness.ts#L1-L60) | 依賴的任務必須是最終狀態才算滿足；ID 找不到或模稜兩可一律視為「未解決」，**絕不猜** |
| 跨分支狀態 | [src/core/cross-branch-tasks.ts#L28-L60](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/core/cross-branch-tasks.ts#L28-L60) | 掃最近活躍的分支，找同一任務在各分支的位置與狀態，讓 A 分支的 AI 看得到 B 分支的 AI 已經做到哪 |
| 狀態變更回呼（hook） | [src/core/backlog.ts#L3339-L3374](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/core/backlog.ts#L3339-L3374)、[src/utils/status-callback.ts#L26-L69](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/utils/status-callback.ts#L26-L69) | 狀態改變時以 `sh -c` 執行設定的指令，環境變數帶 `TASK_ID`、`OLD_STATUS`、`NEW_STATUS`、`TASK_TITLE`；任務檔的設定優先於全域設定；失敗只記錄不阻擋 |
| 決策被新決策取代 | [src/core/backlog.ts#L4493-L4530](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/core/backlog.ts#L4493-L4530) | `backlog decision edit decision-1 --superseded-by decision-2`：驗證新決策存在、不能取代自己，寫入 `supersededBy` 並更新時間 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 共用規則檔寫法（AGENTS.md 範本） | [AGENTS.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md) | 無 | 低 | 直接借結構：「先讀憲法 → 事實以設定檔為準、發現說明過期要回報 → 範圍規則 → 驗證指令表 → 審查與完成條件 → git 規則」。把 bun 指令換成你的 Firebase 指令 |
| CLAUDE.md = AGENTS.md 符號連結 | [CLAUDE.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/CLAUDE.md) | git | 低 | `ln -s AGENTS.md CLAUDE.md`，從此 Claude 與 Codex 規則永遠同一份 |
| 專案憲法 | [MANIFESTO.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/MANIFESTO.md) | 無 | 低 | 照它的章節（使用者、核心流程、單一事實來源、設計原則、邊界、風險）寫你自己的 `MANIFESTO.md`，規則檔第一行要求 AI 先讀 |
| 「標記區塊」寫入器 | [src/agent-instructions.ts#L41-L124](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/agent-instructions.ts#L41-L124) | 只有字串處理（讀寫檔用 Bun，換成 Node `fs` 即可） | 低 | 你可以自己寫一支 `sync-rules.js`：從一份 `rules/shared.md` 產生區塊，塞進 AGENTS.md／CLAUDE.md／GEMINI.md 的固定標記之間，不動其他內容 |
| 四段式工作流程指南 | [src/guidelines/cli-instructions/](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/overview.md) | 無 | 低 | 抄 overview／task-creation／task-execution／task-finalization 的段落，改寫成你自己的 SKILL.md（例如 `plan-task`、`finish-task` 兩個技能） |
| Claude 專案經理子代理 | [.claude/agents/project-manager-backlog.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/.claude/agents/project-manager-backlog.md) | backlog CLI | 低 | 直接放進你的 `.claude/agents/`；description 有 3 個 `<example>`，是教 Claude 何時呼叫它的寫法範例 |
| 任務檔格式（含區段標記） | [backlog/tasks/back-798 …](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/backlog/tasks/back-798%20-%20Correct-most-progressed-status-resolution-across-active-branches.md) | 無 | 低 | 就算不裝工具，也可以用同樣的 Markdown 格式當「AI 交接單」範本 |
| 檔案鎖（ID 配發＋單檔編輯） | [src/file-system/operations.ts#L670-L800](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/file-system/operations.ts#L670-L800) | `proper-lockfile`、git | 中 | 你若自己寫多 AI 協作腳本，可照這個「共用 git common dir 放鎖、編輯鎖立即失敗」的模式 |
| 重複偵測函式 | [src/utils/duplicate-detection.ts](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/utils/duplicate-detection.ts) | 無（純函式） | 低 | 改成以「標題正規化」或「檔名」為 key，就能檢查你的規則檔／文件是否重複 |
| 依賴就緒判斷 | [src/utils/readiness.ts](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/utils/readiness.ts) | task-record-index | 中 | 給巡檢腳本用：列出「可以開工」與「被卡住」的任務 |
| 狀態回呼 | [src/utils/status-callback.ts](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/utils/status-callback.ts) | Bun spawn | 低 | 不用拆，直接用設定：任務變 In Progress 時自動叫 Claude 開工、變 Done 時叫 Codex 審查 |
| 本機看板 REST API | [src/server/index.ts](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/server/index.ts) | Bun HTTP | 高 | 檔案 2,128 行且綁 Bun；比較實際的做法是直接用 `backlog browser`，或用 CLI `--json` 讀資料 |

---

## 7. AI／Claude 整合

- **不呼叫任何 LLM**：專案本身沒有模型、沒有 prompt 呼叫 API。它是「給 AI 用的工具」，不是「用 AI 的工具」。
- **prompt（給 AI 讀的文字）放在**：[src/guidelines/](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/index.ts)（`cli-instructions/*.md`、`mcp/*.md`、`cli-agent-nudge.md`、`mcp/agent-nudge.md`、`project-manager-backlog.md`），編譯時打包進執行檔。另有 866 行的 `agent-guidelines.md`，我 grep 發現它只在 `src/guidelines/index.ts` 被匯出為常數，沒有其他程式使用（看起來是舊版殘留）。
- **兩種接法**：
  1. **CLI 指令（官方推薦）**：AGENTS.md／CLAUDE.md 裡只放短提醒，AI 自己跑 `backlog instructions overview`、`backlog task view 12 --plain`。Claude Code、Codex、Gemini CLI、Cursor 都能用（任何能跑 shell 的 AI）。
  2. **MCP**：`backlog mcp start`（stdio），提供 24 個工具（`task_create`、`task_list`、`task_search`、`task_edit`、`task_view`、`task_archive`、`task_delete`、`task_restore`、`document_*` 8 個、`milestone_*` 5 個、`definition_of_done_defaults_get/upsert`、`get_backlog_instructions`）和 `backlog://workflow/*` 資源。[MANIFESTO.md#L55-L66](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/MANIFESTO.md#L55-L66) 明說 MCP 是「legacy、optional adapter」，新功能先做在 CLI。
- **Claude Code 子代理**：`backlog init` 可選擇安裝 `.claude/agents/project-manager-backlog.md`（[src/agent-instructions.ts#L285-L295](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/agent-instructions.ts#L285-L295)），專門負責拆任務與審查任務格式。
- **Skills**：目前**沒有** SKILL.md。repo 裡 `.claude/skills` 是指向 `../.codex/skills` 的符號連結，但 `.codex/skills` 沒進版控。官方待辦 [BACK-595](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/backlog/tasks/back-595%20-%20Ship-Backlog.md-as-an-Agent-Plugin-with-skill-based-instructions.md)（To Do）計畫把指南做成 Agent Plugin 的 `skills/<name>/SKILL.md`，並要求「技能內容不可與 `src/guidelines` 漂移，要自動產生或單一來源」。
- **能不能換成 Claude**：本來就是原生支援 Claude Code，也同時支援 Codex，兩者可以共用同一個 backlog。

---

## 8. 擴充方式與 API

- **CLI JSON 輸出**（最實用）：`task list`、`task view`、`task <id>`、`draft list`、`decision list`、`decision view`、`search` 都支援 `--json`（有版本號、非互動）。`backlog task list --json --watch` 會持續輸出完整的新清單（見 [overview.md#L19](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/overview.md#L19)、[src/commands/watch-json.ts](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/commands/watch-json.ts)）。你的巡檢腳本靠這個就夠了。
- **常用過濾**：`--status`、`--exclude-status`、`--assignee`、`--unassigned`、`--labels`、`--type`、`--priority`、`--parent`、`--ready`（只列依賴都完成的任務）、`--modified-file`（找動過某檔案的任務）、`--count`、`--max-count/--skip`。
- **狀態回呼**：設定 `onStatusChange`（全域或單一任務），README 的官方範例是狀態變成 In Progress 時背景執行 `claude "Task $TASK_ID ($TASK_TITLE) has been assigned to you. Please implement it."`（[ADVANCED-CONFIG.md#L56](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/ADVANCED-CONFIG.md#L56)）。這是最接近「自動派工」的掛勾。
- **本機 REST API**（網頁看板用）：`/api/tasks`、`/api/task/:id`、`/api/tasks/:id/archive`、`/api/docs`、`/api/decisions`、`/api/milestones`、`/api/config`、`/api/statuses` 等（在 [src/server/index.ts](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/server/index.ts) L425 起）。只綁 127.0.0.1。官方聲明內部 TypeScript 匯出**不是**對外 API（[MANIFESTO.md#L53](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/MANIFESTO.md#L53)）。
- **設定**：狀態欄、優先級、類型、`definition_of_done`、`defaultAssignee`、`task_prefix` 等寫在 `backlog/config.yml` 或根目錄 `backlog.config.yml`（[ADVANCED-CONFIG.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/ADVANCED-CONFIG.md)）。
- **看板匯出**：`backlog board export --readme` 把看板寫進 README 的標記區塊，可當每日報告的一部分。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。最後 commit 2026-10-29；`package.json` 版本 1.55.3；任務編號已到 BACK-798。作者 Alex Gavrilescu（MrLesk），主要靠 AI 代理寫程式並由他審查。
- **測試**：330 個測試檔；CI（[.github/workflows/ci.yml](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/.github/workflows/ci.yml)）跑型別檢查、Biome、跨 OS 測試、互動 TUI 測試、編譯後執行檔冒煙測試、Nix 套件。
- **遙測／隱私**：README 寫「no server, no account, no telemetry」。我 grep `telemetry|posthog|sentry|analytics` 於 `src`（排除測試），沒有找到遙測套件的使用。網頁伺服器只聽本機。
- **已知的坑**：
  1. **只能在 Bun 上跑**：原始碼大量用 Bun API，想把片段直接搬進 Node／瀏覽器專案要改寫讀寫檔與子行程的部分。
  2. **巨型檔案**：`src/cli.ts` 6,252 行、`src/core/backlog.ts` 5,401 行，要找東西請用搜尋，不要整檔讀。
  3. **`onStatusChange` 會執行 shell 指令**：設定檔裡的指令會以 `sh -c` 執行。如果你 clone 別人的專案，裡面的 `backlog/config.yml` 或任務檔表頭帶有這個欄位，你一改狀態就會執行它。用之前先看設定。Windows 上 `sh` 是否可用**未確認**。
  4. **它自己也有說明檔過期**：`.github/copilot-instructions.md` 還叫 Copilot 去讀 `src/guidelines/agent-guidelines.md`（舊版長指南），而 AGENTS.md 已改成「短提醒＋即時指令」。這正是你擔心的「新舊版本衝突」，連作者自己都會遇到，所以巡檢一定要包含「規則檔互相比對」。
  5. **版本標記沒有被比對**：規則區塊有 `backlog.md-instructions-version`，但目前沒有指令會警告「你的 CLAUDE.md 區塊比執行檔舊」。要自己寫巡檢檢查。
  6. **重複偵測只到 ID 層**：兩個標題不同、內容其實一樣的任務，工具不會發現；靠的是指南要求 AI「建立前先 search」。
  7. **跨分支讀取的成本**：BACK-798 的實作筆記記錄冷啟動讀取在測試資料上從約 214 ms 變成 521 ms；大型 repo 可調小 `activeBranchDays` 或關 `checkActiveBranches`。
  8. **MCP 被定位為舊介面**：如果你偏好 MCP，要知道新功能可能先只出現在 CLI。
  9. **不要手改任務檔**：官方規則禁止直接編輯，以免區段標記壞掉；手改後跑 `backlog doctor` 檢查。

---

## 10. 跟其他專案組合的建議

- **Backlog.md（任務與交接）＋ OpenSpec（規格的單一事實來源）**：OpenSpec 管「系統現在應該長怎樣」（specs + 變更提案 + 封存），Backlog.md 管「誰在做哪一件事、做到哪、怎麼驗證」。一個變更提案拆成幾個 Backlog 任務，任務的 `--ref` 指向提案路徑。
- **＋ agents.md 規範**：用 AGENTS.md 當唯一規則檔，`CLAUDE.md` 做符號連結（Backlog.md 的做法），GEMINI.md 同理。
- **＋ anthropics/skills 或 addyosmani/agent-skills 的 SKILL.md 寫法**：Backlog.md 目前缺技能包。你可以把它的 task-creation／task-execution／task-finalization 三份指南改寫成三個 SKILL.md（`description` 寫「當使用者要拆任務／開始做某任務／宣告完成時使用」），Claude 與 Codex 都能觸發。
- **＋ 子代理集合（如 VoltAgent/awesome-claude-code-subagents）**：拿 `project-manager-backlog` 當 PM 角色，再從子代理集合挑「code-reviewer」「test-writer」，每個角色都規定「只能透過 backlog CLI 回報」。
- **＋ Groma.md**（同作者）：若想看「每個任務碰到哪些元件」可以加；對你的小型 JS 專案屬於加分項，不是必要。
- **給你的最小架構（建議）**：
  ```
  你的專案/
  ├── MANIFESTO.md      ← 3～5 條不可違反的原則（例：庫存數字只能由交易單產生）
  ├── AGENTS.md         ← 共用規則（借 Backlog.md 的 AGENTS.md 結構）
  ├── CLAUDE.md -> AGENTS.md
  ├── backlog/          ← backlog init 產生，所有任務與決策
  ├── .claude/agents/   ← project-manager-backlog.md + 你自己的審查角色
  └── scripts/patrol.sh ← 每日巡檢（見第 11 節）
  ```

---

## 11. 規則／角色／巡檢 檢查表

### 共用規則怎麼寫
- **檔案結構：有**。`AGENTS.md`（主）＋ `CLAUDE.md`（符號連結到 AGENTS.md）＋ `MANIFESTO.md`（憲法）＋ `.github/copilot-instructions.md`（舊）。[AGENTS.md#L1-L12](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L1-L12) 要求每次對話先讀 MANIFESTO，衝突時要問人、不准順手改憲法。
- **分層：部分有**。三層概念：①憲法（MANIFESTO）②專案規則（AGENTS.md）③工具流程（`backlog instructions` 即時輸出）。沒有「子資料夾各自一份規則」的設計；也沒有全域（使用者家目錄）規則檔的設計（MCP 可設成 user scope，但那是工具註冊不是規則）。
- **優先順序：有（寫在文字裡）**。[AGENTS.md#L14-L19](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L14-L19)：「實作事實以 package.json、biome.json、workflows 為準；說明與事實不符要回報為過期；現行程式碼不能凌駕已核准的需求、公開契約或憲法。」這段非常值得照抄。
- **讓 Codex 和 Claude 讀同一份：有**。兩招：①`CLAUDE.md` 是 AGENTS.md 的符號連結（[CLAUDE.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/CLAUDE.md)）；②`backlog init`／`backlog agents --update-instructions` 會把**同一段**標記區塊寫進 AGENTS.md、CLAUDE.md、GEMINI.md、Copilot 檔（[src/cli.ts#L5286-L5358](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/cli.ts#L5286-L5358)），區塊內容只是「去跑指令拿最新流程」，所以規則本體只有一份。

### 角色設計
- **角色：有，但很少**。①人類維護者（Alex，負責批准計畫與產品決策）②AI 代理（實作者，assignee 寫 `@codex`／`@claude`）③Claude 子代理 `project-manager-backlog`（拆任務、審查任務格式，[.claude/agents/project-manager-backlog.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/.claude/agents/project-manager-backlog.md)）④審查者：[AGENTS.md#L128-L153](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L128-L153) 規定大改動要做一次「冷審查」（只給任務＋diff＋repo，不給對話歷史，請它說明流程並找可刪的複雜度），再做一次「帶完整上下文的複雜度審查」。架構圖把 AI 寫成一個 actor（[groma/actors/ai-coding-agent.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/groma/actors/ai-coding-agent.md)）。
- **技能（skills）：沒有**（見第 7 節，BACK-595 尚未完成）。
- **可用工具：有**。CLI 指令清單 + MCP 24 個工具；子代理明定「只用 backlog CLI，不准手動建任務、不存在斜線指令」。
- **交接（handoff）：有**。任務檔本身就是交接單；[task-creation.md#L58-L67](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-creation.md#L58-L67)：「寫任務要讓未來的 AI 不看對話也能動手」。執行中用 `--append-notes` 記進度、`--comment --comment-author @名字` 留審查問題。
- **誰向誰負責：有（文字規定）**。計畫有重大產品／架構決策要等人批准（[task-execution.md#L25-L27](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-execution.md#L25-L27)）；範圍外的工作要停下來問（[task-execution.md#L58-L60](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-execution.md#L58-L60)）；後續任務沒經同意不准建立（[task-finalization.md#L20-L22](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-finalization.md#L20-L22)）。

### 防漏
- **任務追蹤：有（核心功能）**。每個任務的 status、assignee、AC 勾選框、DoD 勾選框都在檔案裡；`backlog task list --status "In Progress" --assignee @codex` 就能看誰手上有什麼。
- **完成前驗證：有**。[task-finalization.md#L1-L11](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-finalization.md#L1-L11)：逐條找證據才能 `--check-ac`；「程式碼存在、grep 結果、實作意圖都不算驗證證據」；UI 要實際操作。專案層級 DoD 自動加到每個新任務（本 repo 的 DoD 是型別檢查、Biome、測試三條，見 [backlog/config.yml#L5](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/backlog/config.yml#L5)）。注意：工具**不會強制**勾完才能 Done，是靠指南約束（未在程式碼找到強制檢查，未確認是否有）。
- **交接紀錄：有**。Implementation Notes、Comments、Final Summary、`modified_files`、`references` 欄位。實例：[BACK-798](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/backlog/tasks/back-798%20-%20Correct-most-progressed-status-resolution-across-active-branches.md) 記了誰批准、審過哪些 PR、哪些測試先失敗後通過、效能數字、兩輪審查結果。

### 防重複
- **重複任務：部分有**。①規則面：建立前必須先搜尋（[task-creation.md#L5-L20](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-creation.md#L5-L20)）；②機械面：只偵測**重複 ID**（[src/utils/duplicate-detection.ts](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/utils/duplicate-detection.ts)），`doctor --fix` 可安全改號；③重複的任務用 `backlog task archive` 下架並保留紀錄。
- **重複規則：有（間接）**。標記區塊寫入時會先刪掉舊區塊（含 CLI／MCP 兩種），保證同一檔裡只有一份 Backlog 規則（[src/agent-instructions.ts#L75-L124](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/agent-instructions.ts#L75-L124)）。跨檔案的規則重複比對：沒有。
- **重複角色：沒有**。

### 防新舊版本衝突
- **版本標記：有（但沒有比對）**。規則區塊與子代理檔都嵌入 `backlog.md-instructions-version`（[src/agent-instructions.ts#L57-L73](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/agent-instructions.ts#L57-L73)）。
- **單一事實來源：有（核心原則）**。[MANIFESTO.md#L43-L53](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/MANIFESTO.md#L43-L53)：任務狀態只存在 Markdown；所有修改走產品指令。流程說明只存在執行檔（AI 每次現領）。AGENTS.md 要求「Prefer … one source of truth」。
- **變更提案／封存：有**。決策紀錄可標 `--superseded-by` 指向新決策（[src/core/backlog.ts#L4493-L4530](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/core/backlog.ts#L4493-L4530)）；任務／文件／決策都能 archive（保留 ID、唯讀）再 restore；草稿 → `draft promote` 成正式任務。實務上在任務描述裡寫「此任務取代 BACK-349，其某條驗收已過時」（見 BACK-595）。
- **跨分支衝突：有**。同一任務在不同分支有不同狀態時，依 `most_progressed` 等策略挑一份並標示來源分支，對其他分支的版本設為唯讀（BACK-798）。
- **過期（staleness／drift）偵測：部分有**。AGENTS.md 要求 AI「發現說明與 package.json 等事實不符時回報為過期」；`backlog cleanup` 依天數封存已完成任務。沒有自動的規則漂移偵測。

### 定期巡檢
- **排程：沒有內建**（沒有 cron、heartbeat）。可用掛勾：`onStatusChange`（狀態改變就執行指令）、`.husky/pre-commit`（本 repo 只跑 lint-staged）、CI（`architecture.yml` 每次 push 到 main 更新架構地圖並在每個 PR 留言顯示架構變化）。
- **可直接拿來巡檢的指令**：`backlog doctor`（有問題 exit 1，適合 cron／CI）、`backlog task list --json`、`backlog task list --ready --plain`、`backlog search --json`、`backlog board export`。
- **`doctor` 報告長相**（依 [src/utils/duplicate-detection.ts#L85-L99](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/utils/duplicate-detection.ts#L85-L99) 與 [src/cli.ts#L5841-L6015](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/cli.ts#L5841-L6015) 的輸出字串組出的示意，非實際執行結果）：
  ```
  WARNING: 1 duplicate task ID group affects 2 files.
  Some task views may hide files and ID-based commands are blocked until the collision is repaired.
    task-12:
      - backlog/tasks/task-12 - Import-purchase-orders.md
      - backlog/tasks/task-12 - Fix-stock-rounding.md
  Run 'backlog doctor' to preview a safe, human-readable repair.
  ...
  Run 'backlog doctor --fix' to apply this repair after reviewing the preview.
  ```
- **建議你自己加的每日巡讀腳本**（以下是依它的 CLI 能力設計的建議，非專案內建）：
  ```bash
  # scripts/patrol.sh（每天早上 cron 執行，輸出 reports/patrol-YYYY-MM-DD.md）
  backlog doctor                                         # 重複 ID、循環依賴
  backlog task list --status "In Progress" --json        # 進行中但多天沒更新 → 可能被 AI 漏掉
  backlog task list --status "Done" --json               # 檢查是否有 AC/DoD 未勾就 Done
  backlog task list --unassigned --plain                 # 沒人負責的任務
  diff <(sed -n '/BACKLOG.MD GUIDELINES START/,/END/p' AGENTS.md) \
       <(sed -n '/BACKLOG.MD GUIDELINES START/,/END/p' GEMINI.md)   # 規則區塊是否不同步
  ```
  再讓 Claude 讀這份報告＋整個 repo，用 `backlog task create` 把發現的問題開成任務（必須先 search 防重複）。

### Skill 寫法
- **SKILL.md 格式：沒有**（repo 內無 SKILL.md）。可參考的是 Claude 子代理寫法：YAML 表頭 `name`、`description`（含 3 個 `<example>` 情境＋`<commentary>` 說明為何該呼叫）、`color`，內文寫職責與確切指令（[.claude/agents/project-manager-backlog.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/.claude/agents/project-manager-backlog.md)）。
- **description 觸發寫法**：子代理 description 以「Use this agent when you need to …」開頭，列出具體情境（建立任務、拆任務、審查任務格式），值得借用。
- **資料夾結構／腳本放哪：未確認**（BACK-595 規劃 `skills/<name>/SKILL.md`，尚未實作）。

### 支援哪些工具與安裝方式
- **有**：Claude Code、OpenAI Codex、Gemini CLI、Kiro、Cursor（走 AGENTS.md）、GitHub Copilot（`.github/copilot-instructions.md`）、其他會讀 AGENTS.md 的工具（選單列出 Jules、Amp、Zed、Warp、Aider、RooCode）。
- 安裝：`npm i -g backlog.md`（或 `bun add -g`、`brew install backlog-md`、`nix run github:MrLesk/Backlog.md`）→ `backlog init`。MCP：`claude mcp add backlog --scope user -- backlog mcp start`、`codex mcp add backlog -- backlog mcp start`。

### 可以直接借用到你「基礎架構」的檔案或段落
1. [AGENTS.md#L14-L37](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L14-L37)：事實優先序＋範圍規則（「調查／審查請求只授權分析，不授權實作」這句很好用）。
2. [AGENTS.md#L128-L153](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L128-L153)：完成前自我審查四問＋冷審查流程＋「審查不准發明需求」。
3. [AGENTS.md#L167-L176](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L167-L176)：「保留其他人或其他 AI 未提交的修改，不准還原、重排或 stage」— 多 AI 同時工作必備。
4. [MANIFESTO.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/MANIFESTO.md)：整份當憲法範本。
5. [src/guidelines/cli-agent-nudge.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-agent-nudge.md)：短提醒寫法（`<CRITICAL_INSTRUCTION>` 包住，開場必讀＋各動作前必讀）。
6. [src/guidelines/cli-instructions/task-execution.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-execution.md) 與 [task-finalization.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-finalization.md)：改寫成你的「開工」「結案」兩個 SKILL.md。
7. [.claude/agents/project-manager-backlog.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/.claude/agents/project-manager-backlog.md)：PM 角色。
8. [backlog/config.yml](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/backlog/config.yml)：DoD 預設寫法（把三條換成「firebase emulator 測試通過」「手機畫面實測」「庫存數字對帳」）。

---

## 關鍵字
Backlog.md、backlog CLI、任務管理、看板、Kanban、Markdown 任務、git 任務追蹤、AI 協作、多代理協作、Claude Code、Codex、Gemini CLI、AGENTS.md、CLAUDE.md、符號連結、共用規則、單一事實來源、MANIFESTO、專案憲法、驗收條件、Acceptance Criteria、完成定義、Definition of Done、實作計畫、交接、handoff、子代理、project-manager-backlog、MCP、backlog instructions、doctor、重複 ID、循環依賴、跨分支、檔案鎖、onStatusChange、狀態回呼、決策紀錄、superseded、封存、archive、巡檢、規格驅動開發、spec-driven development、Bun、TypeScript、MIT
