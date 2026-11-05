# obra/superpowers — 最多人用的 AI 寫程式「紀律技能包」：15 個 skill 把「先問清楚→寫計畫→分派子代理→雙重審查→有證據才算完成」串成一條流程，Claude Code 與 Codex 都能裝
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：22f0b46
> GitHub：https://github.com/obra/superpowers｜⭐ 312273｜授權：MIT｜主要語言：Shell｜最近更新：2026-11-03

（以下 permalink 全部固定在 commit `22f0b463e7a5e579904dd6211a520321035526f7`。為了好讀，下文用 `B/` 代表 `https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/`；每個檔案第一次出現時給完整網址，之後用 `B/路徑#L行號`，點擊前請自行把 `B/` 換回完整前綴。所有行號都是我在這個 commit 上逐檔 `cat -n` 對過的。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** Superpowers 是 Jesse Vincent（Prime Radiant 公司）做的一套「給 AI 寫程式代理用的方法論」，本體就是 15 個 `SKILL.md` 技能檔＋一個開機時自動注入的「總開關」技能（`using-superpowers`），讓 Claude Code、Codex、Cursor、Gemini CLI 等十幾種工具在動手前先查技能、照流程走。它不是一個應用程式，沒有介面、沒有資料庫，幾乎全是 Markdown 規則＋少量 Bash 小腳本。

**對你（倉儲系統、多 AI 協作很亂）最有用的五件事：**

1. **「防漏」做得最徹底的範本：`verification-before-completion`。** 一條鐵律「NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE」（沒有剛跑過的驗證證據，就不准說完成），加上一張「哪種宣稱需要哪種證據」對照表——其中一列直接寫「Agent completed → 要看 VCS diff，不能只信 agent 說 success」。這正是你擔心「某個 AI 說做好了但其實漏了」的解藥，整份 120 行可以原封不動借用。
2. **「交接紀錄」的現成格式：ledger（進度帳本）。** `executing-plans` 和 `subagent-driven-development` 都要求每個計畫有一個 `progress.md` 帳本，第一行寫「這本帳屬於哪個計畫」，每完成一個任務追加一行 `Task N: complete (commits a..b, tests: … → …)`，每個「我自己做的決定」都要寫成 `Ruling: 決定 — 理由 — 錯了的代價`。還附了一支 `task-done` 腳本：**測試沒通過就不寫入帳本**。這解決「換一個 AI 接手（或對話被壓縮）就忘了做到哪」的問題，GPT 和 Claude 可以讀同一本帳。
3. **角色分工的現成提示詞：控制者（controller）／實作者（implementer）／任務審查者（task reviewer）／最終審查者（final reviewer）／建造者檢查（builder check）。** 每個角色有自己的提示詞範本、回報格式（DONE／DONE_WITH_CONCERNS／BLOCKED／NEEDS_CONTEXT）、能不能再叫子代理（實作者與審查者都「不准」再叫，避免重複審查）、用哪一級模型（便宜／中階／最強）。
4. **怎麼寫好 skill 的「教科書」：`writing-skills`。** 核心觀念是「寫 skill 就是對文件做 TDD」：先讓 AI 在沒有 skill 的情況下犯錯（RED）、記下牠找的藉口，再寫 skill（GREEN），再堵漏洞（REFACTOR）。還有一個非常實用的發現：**`description` 只能寫「什麼時候用」，不能摘要流程**，否則 AI 會照 description 做、不去讀 skill 本文。
5. **最接近「巡讀」的東西：`diagnosing-superpowers`。** 它會派 7 個「分析員」子代理平行讀對話紀錄，各管一個面向：技能時間軸、計畫遵循度、**重複工作（repeated-work）**、卡關、品質證據、**指令衝突（request-conflicts，含「使用者說的」和 CLAUDE.md／AGENTS.md 衝突）**、成本時間；每條發現都要附 `檔案:行號`，沒附就丟掉。雖然它是「事後診斷一次對話」而不是「每天巡整個專案」，但這套「分面向平行分析＋一定要附證據＋固定報告模板」的骨架，正好可以改成你的每日巡讀 skill（第 11 節有具體改法）。

**不適合／要先知道的地方：**
- **它沒有「每天排程巡讀整個專案」的功能**（我用 `grep -rniE "cron|heartbeat|schedul|daily|nightly"` 搜過 skills／hooks／scripts，只有測試文件 `docs/testing.md` 提到「nightly」是指他們自己的評測，不是給使用者的巡檢）。
- **它沒有「重複規則偵測」或「新舊版本衝突偵測」的通用工具**；唯一的版本漂移偵測是給它自己 12 個設定檔用的 `bump-version.sh --check/--audit`（概念可借）。
- **角色是「軟體開發流程」角色**（實作、審查），不是「行銷／客服／採購」這種業務角色；它也明文說「領域專用的 skill 不收進核心，請自己做外掛」。
- 它的口氣很強硬（大寫 MUST、紅旗表、藉口對照表），這是作者刻意調校的；你借用時可以照抄，但要知道它很「吃 token」：`using-superpowers` 會在每次開新對話、`/clear`、壓縮後都被注入一次。

---

## 2. 授權白話

- **授權：MIT**（[LICENSE](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/LICENSE)，「Copyright (c) 2025 Jesse Vincent」）。`.codex-plugin/plugin.json`、`.claude-plugin/plugin.json`、`.cursor-plugin/plugin.json` 的 `license` 欄位也都寫 MIT。
- **個人使用：** 完全自由。可以安裝、修改、把任何 `SKILL.md` 或提示詞範本整段複製到你自己的 `.claude/skills/` 或 `~/.agents/skills/`。
- **公司商用：** 可以，包含拿去做公司內部工具、甚至改寫後賣；義務只有「散布（給別人）時保留原著作權聲明與 MIT 授權全文」。只在自己公司內部用、不對外散布，實務上幾乎沒有負擔。
- **要注意的一個小點（未確認）：** `skills/writing-skills/references/anthropic-best-practices.md`（1150 行）內容是 Anthropic 官方「Skill authoring best practices」文件的副本（開頭就是該文件標題與連結到 platform.claude.com）。這份文件本身的版權歸屬是否被 MIT 涵蓋，repo 裡沒有另外說明——**個人參考沒問題，若要對外散布你改寫的版本，建議不要整份帶走這個檔**。
- **有沒有閉源或付費版：** repo 裡沒有授權金鑰、沒有付費才開的功能。README 的「Commercial Services」段寫「企業用戶需要商業支援、額外工具或費用管理可聯絡 sales@primeradiant.com」（[README.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/README.md)），那是另外賣的服務，內容不在 repo 裡（未確認具體是什麼）。
- **遙測（和授權無關但要知道）：** 「視覺腦力激盪」的小網頁預設會從 primeradiant.com 載入 logo，網址帶 Superpowers 版本號，用來估算使用人數；設環境變數 `SUPERPOWERS_DISABLE_TELEMETRY=1`（或 Claude Code 的 `DISABLE_TELEMETRY`、`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC`）就關掉。程式碼在 [skills/brainstorming/scripts/server.cjs#L106-L112](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/brainstorming/scripts/server.cjs#L106-L112)。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 前端 | 無（只有選用的「視覺腦力激盪」小頁面：`skills/brainstorming/scripts/frame-template.html` ＋ `helper.js`，由本機 Node 伺服器提供） |
| 後端 | 無常駐後端。`server.cjs` 是腦力激盪時才啟動的本機零依賴 Node 伺服器（選用） |
| 資料庫 | 無。所有狀態都是檔案：設計文件 `docs/superpowers/specs/*.md`、計畫 `docs/superpowers/plans/*.md`、帳本 `.superpowers/sdd/<計畫名>/progress.md`（被 git 忽略） |
| 主要「程式」 | 15 個 `SKILL.md`（Markdown＋YAML 開頭）＋提示詞範本＋Bash 小腳本（`task-brief`、`review-package`、`sdd-workspace`、`task-start`、`task-done`） |
| 各工具接線 | Claude Code／Cursor／Copilot CLI：Bash 的 SessionStart hook；OpenCode：JS 外掛（`.opencode/plugins/superpowers.js`，405 行）；Pi：TS 擴充（`.pi/extensions/superpowers.ts`，116 行）；Hermes：Python（`.hermes-plugin/__init__.py`，127 行）；Gemini：`GEMINI.md` 用 `@` 引入；Codex：原生技能探索，不用 hook |
| 部署方式 | 不用部署。在 AI 工具裡用外掛市集安裝即可（見第 11 節最後） |
| 硬體／GPU | 不需要 GPU。任何能跑 Claude Code 或 Codex 的電腦都行；Windows 透過 `hooks/run-hook.cmd`（cmd 與 bash 雙語腳本）支援 |
| API Key | **Superpowers 本身不呼叫任何 AI、不需要 API Key。** 費用全部來自你用的 Claude Code／Codex 訂閱或 API 用量 |
| 大概費用 | 外掛免費。但要知道它的流程很「花 token」：`subagent-driven-development` 每個任務會開一個實作子代理＋一個審查子代理，最後再一個最強模型做全分支審查。它自己也承認（`executing-plans` 第 12-18 行）：子代理模式「每個任務都付一份新上下文」，inline 模式較便宜。對你這種小專案，建議先用 inline（`executing-plans`） |

**維護者自用的工具需求（你不用跑）：** `scripts/bump-version.sh` 需要 `jq`、`yq`；`scripts/sync-to-codex-plugin.sh` 需要 `rsync`、`gh`、`python3`。

---

## 4. 程式架構地圖

整個 repo 共 236 個檔案（`git ls-tree -r --name-only HEAD | wc -l`）。其中 `skills/` 80 個、`tests/` 79 個、`docs/superpowers/specs/` 22 個設計文件（用 grep 算的）。

```
superpowers/
├── AGENTS.md                     # 給「想對這個 repo 發 PR 的 AI」看的貢獻規則（不是給使用者專案用的）
├── GEMINI.md                     # 只有 2 行：@ 引入 using-superpowers 與 gemini-tools 對照表
├── README.md                     # 16 種工具的安裝方式、基本流程 7 步、遙測說明
├── RELEASE-NOTES.md              # 很詳細的版本說明（v7.0.2 在 2026-11-03）
├── LICENSE                       # MIT
├── package.json                  # version 7.0.2；給 OpenCode／Pi 用的套件入口
├── index.js                      # OpenCode V2 目錄式外掛入口（只是 re-export）
├── gemini-extension.json         # Gemini 擴充：contextFileName = GEMINI.md
├── .version-bump.json            # ★「版本號單一事實來源」：列出 12 個要同步的設定檔＋稽核排除清單
├── .claude-plugin/               # Claude Code 外掛描述＋開發用 marketplace
├── .codex-plugin/plugin.json     # Codex 外掛描述（hooks: {} 刻意留空）
├── .agents/plugins/marketplace.json  # Codex 市集格式
├── .cursor-plugin/ .devin-plugin/ .kimi-plugin/ .antigravity-plugin/ .muse-plugin/ .hermes-plugin/
├── .opencode/  .pi/              # 各工具的接線程式
├── hooks/
│   ├── hooks.json                # Claude Code SessionStart hook（startup|clear|compact 都觸發）
│   ├── hooks-cursor.json         # Cursor 版
│   ├── session-start             # ★ 讀 using-superpowers/SKILL.md、轉成 JSON 注入上下文（90 行 Bash）
│   └── run-hook.cmd              # Windows／Unix 雙語啟動器
├── skills/                       # ★ 本體：15 個技能，所有工具共用同一份
│   ├── using-superpowers/        #   總開關：「有 1% 可能適用就必須先叫 skill」＋各工具對照表 references/*.md
│   ├── brainstorming/            #   先問清楚、寫設計文件、設計核准前不准動手（含視覺腦力激盪伺服器）
│   ├── writing-plans/            #   把設計拆成 2–5 分鐘的小任務、每步有指令與預期輸出
│   ├── executing-plans/          #   自己一個人照計畫做（便宜）＋scripts/task-start、task-done
│   ├── subagent-driven-development/ # 每任務派新子代理＋審查（最徹底）；提示詞範本＋references/＋scripts/
│   ├── dispatching-parallel-agents/ # 互不相干的工作平行派出去
│   ├── test-driven-development/  #   紅綠重構鐵律
│   ├── systematic-debugging/     #   四階段找根因
│   ├── verification-before-completion/ # ★ 有證據才准說完成
│   ├── requesting-code-review/   #   派審查子代理＋code-reviewer.md 範本
│   ├── receiving-code-review/    #   收到審查意見怎麼回（不准「你說得完全對！」）
│   ├── using-git-worktrees/      #   隔離工作區
│   ├── finishing-a-development-branch/ # 合併／PR／保留／丟棄四選一
│   ├── diagnosing-superpowers/   # ★ 事後診斷：7 面向分析員提示詞＋報告模板
│   └── writing-skills/           # ★ 怎麼寫 skill：SKILL.md＋references/（description 寫法、測試方法、說服心理學…）
├── docs/
│   ├── porting-to-a-new-harness.md # ★ 一份 skill 怎麼接到不同 AI 工具的完整說明（附錄 A 是對照表）
│   ├── testing.md
│   ├── plans/                    # 舊的計畫（4 份）
│   └── superpowers/specs/        # 他們自己用 brainstorming 產生的設計文件（22 份，檔名 YYYY-MM-DD-主題-design.md）
├── scripts/
│   ├── bump-version.sh           # ★ 版本號一次改 12 處＋漂移偵測＋全 repo 搜漏
│   ├── lint-shell.sh / package-codex-plugin.sh / sync-to-codex-plugin.sh / render-antigravity-logo.sh
└── tests/                        # 外掛基礎設施測試（各工具接線、hook、腳本、skill 大小上限等）
    ├── skill-size/test-skill-size.sh        # ★ 每個 SKILL.md 必須 < 20000 bytes
    ├── skill-layout/test-no-dev-files-in-skills.sh # ★ skill 資料夾內不准放測試情境檔
    └── explicit-skill-requests/prompts/*.txt  # 「使用者明確點名 skill」時有沒有觸發的測試提示
```

**數字（我自己算的）：** 15 個 skill（`ls skills/*/SKILL.md | wc -l`）；15 個 SKILL.md 共 143,103 bytes（`wc -c`），最大的是 `subagent-driven-development/SKILL.md` 19,740 bytes、`executing-plans` 18,364、`writing-skills` 16,738——都卡在自家 20,000 上限以下。`RELEASE-NOTES.md` 有 57 個二級標題（`grep -c "^## "`，大多數是版本號）。

---

## 5. 核心功能怎麼實作

### 5.1 「開機注入總開關」——讓 AI 每次對話都記得要查 skill
- **位置：** [hooks/hooks.json#L1-L18](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/hooks/hooks.json#L1-L18)（`matcher: "startup|clear|compact"`）→ [hooks/session-start#L49](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/hooks/session-start#L49)、`B/hooks/session-start#L76-L88`
- **重點：** 不是只在開新對話時注入，**`/clear` 和「對話壓縮後」也重新注入**——這是防止 AI 壓縮後「忘了規則」的關鍵設計。腳本把 `skills/using-superpowers/SKILL.md` 全文包在 `<EXTREMELY_IMPORTANT>` 標籤裡，依環境變數判斷是 Cursor（`additional_context`）、Claude Code（`hookSpecificOutput.additionalContext`）還是 Copilot（`additionalContext`），只輸出對應欄位（註解第 55-56 行說明 Claude Code 會同時讀兩個欄位不去重，所以只能輸出一個）。
- **Codex 例外：** Codex 不用 hook，靠「原生技能探索」。`.codex-plugin/plugin.json` 刻意寫 `"hooks": {}`（[.codex-plugin/plugin.json#L23-L24](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/.codex-plugin/plugin.json#L23-L24)），因為 RELEASE-NOTES 說「Codex 自己就能可靠觸發 skill，加 hook 反而體驗變差」（[RELEASE-NOTES.md#L309](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/RELEASE-NOTES.md#L309)）。

### 5.2 總開關的規則本身
- **位置：** [skills/using-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/using-superpowers/SKILL.md)（全檔 65 行）
- **重點：**
  - `#L6-L8`：`<SUBAGENT-STOP>` 「如果你是被派出去做特定任務的子代理，忽略這個 skill」——避免子代理也跑一次完整流程（多 AI 協作很重要的細節）。
  - `#L10-L16`：「即使只有 1% 可能適用，也必須叫 skill」。
  - `#L26-L31`：多個 skill 都適用時，「流程型」先（brainstorming、debugging），「實作型」後。
  - `#L33-L50`：紅旗表（「這只是簡單問題」「我先看一下檔案」→ 都是藉口）。
  - `#L52-L61`：各工具的對照表在 `references/<工具>-tools.md`。
  - `#L63-L65`：**優先順序：使用者指示（CLAUDE.md、AGENTS.md、GEMINI.md、直接要求）> skill > 預設行為**。

### 5.3 七步主流程（brainstorming → worktree → plans → 執行 → TDD → 審查 → 收尾）
- **位置：** README「The Basic Workflow」段；各 skill 用「REQUIRED SUB-SKILL」互相指名下一棒。
- **brainstorming**（[skills/brainstorming/SKILL.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/brainstorming/SKILL.md)）：`#L26-L32` 動手前必須依序：列出方案讓人選→寫設計文件→取得核准→叫 writing-plans。`#L209-L227` 依規模分「小改動短設計／專案完整設計」。`#L245-L246` 設計文件存 `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` 並 commit。`#L250-L267` **建造者檢查**：派一個全新子代理假裝是要照文件動工的工程師，把它的問題分三堆（已答過／小事我決定／只有使用者能答）。`#L269-L283` `<HARD-GATE>`：設計沒核准前不准寫程式、不准裝套件。
- **writing-plans**（[skills/writing-plans/SKILL.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-plans/SKILL.md)）：`#L16-L17` 計畫存 `docs/superpowers/plans/YYYY-MM-DD-<feature>.md`。`#L52-L90` 計畫檔頭必備：Goal、Architecture、Tech Stack、**Spec 路徑**、**Global Constraints（全域限制，逐字從規格抄）**、**Review Focus（規格沒寫但最可能出事的 5 種輸入）**。`#L92-L138` 每個任務列 Files（新增／修改到第幾行／測試檔）、**Interfaces（吃什麼、產出什麼）**、checkbox 步驟、每步「Run: 指令／Expected: 預期輸出」。`#L163-L177` 自我檢查 5 項：規格覆蓋、步驟掃描、**型別一致（第 3 任務叫 `clearLayers()` 第 7 任務叫 `clearFullLayers()` 就是 bug）**、Review Focus、比例。
- **executing-plans** vs **subagent-driven-development**：見 5.4、5.5。

### 5.4 inline 執行＋帳本（最適合你先用的模式）
- **位置：** [skills/executing-plans/SKILL.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/executing-plans/SKILL.md)、[skills/executing-plans/scripts/task-done](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/executing-plans/scripts/task-done)
- **重點：**
  - `#L32-L43`：**「裁決，不是卡住」**——遇到衝突自己決定，寫成 `Ruling: 決定 — 理由 — 錯了的代價` 進帳本；**只有 4 種情況要停下來問人**：不可逆／破壞性操作、資安敏感、工作區以外的副作用（合併、推到共用分支、發布）、計畫爛到每條路都是猜。
  - `#L108-L148`：帳本在 `<repo>/.superpowers/sdd/<計畫名>/progress.md`，第一行 `# SDD ledger — plan: <計畫路徑>`；**第一行不是你的計畫就不准動**；壓縮後「相信帳本和 `git log`，不要相信自己的記憶」；inline 與子代理模式共用同一帳本格式，**中途可換執行者**。
  - `#L209-L222` 完成契約：計畫列的測試都存在且這次跑過、讀過輸出；每個 Expected 都對過；每個偏離都有 Ruling。
  - `task-done` `#L42-L54`（腳本內第 42-54 行）：跑測試，**失敗就輸出「Task N NOT recorded」並結束**；成功才追加 `Task N: complete (commits base..head, tests: 指令 → 最後一行輸出)`。
  - `#L236-L291` 最後一定要一個「新上下文、最強模型」的審查者看整個分支；沒有子代理工具就自己審，但帳本要寫 `Final review: self-review (no subagent tool)` 並告知使用者「作者自審比較弱」。
  - `#L293-L306` 收尾：把所有 `Ruling:` 和 `minor (deferred)` 一行不漏列給使用者。

### 5.5 子代理驅動開發（多 AI 分工的核心）
- **位置：** [skills/subagent-driven-development/SKILL.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/SKILL.md) ＋ `implementer-prompt.md`、`task-reviewer-prompt.md`、`re-review-prompt.md` ＋ `references/` 7 份 ＋ `scripts/` 4 支
- **重點：**
  - `#L140-L175` **模型分級**：機械性任務用便宜模型、整合判斷用標準、架構與最終審查用最強；**派子代理一定要明寫模型**，否則會繼承主對話最貴的模型。「回合數比單價重要」：最便宜的模型常多花 2-3 倍回合，反而更貴。
  - `#L198-L237` 派任務：先用 `scripts/task-brief` 把該任務原文抽成檔案（**brief 是唯一需求來源**，數值、字串、簽名只出現在 brief 裡）；**不准把前面任務的摘要貼進去**（真實案例 42k 字元的派工有 99% 是歷史）；**實作者不准再派子代理**；**不准平行派多個實作者**（會衝突）。
  - `#L239-L247` 四種回報狀態。
  - `#L253-L295` 審查：用 `scripts/review-package` 把 diff 打包成檔案給審查者；審查者要同時給「規格符合」與「程式品質」兩個判定；**控制者不准預先叫審查者「這個別標」**。
  - [references/fix-loop.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/fix-loop.md)：修正迴圈最多 5 輪（1-3 輪叫回原實作者、4-5 輪換更強模型的新實作者），第 5 輪後「斷路器」：每個未解問題由控制者裁決並進帳本，**禁止默默丟掉**。
  - [references/preflight.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/preflight.md)：開工前掃計畫衝突，輸出成表格（每對共用檔案／介面的任務一列、每個任務自身是否自相矛盾一列）。
  - [scripts/sdd-workspace#L1-L33](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/scripts/sdd-workspace#L1-L33)：註解直接寫「**過期的帳本被誤認為目前進度，會讓控制者跳過整串任務**——每個計畫一個資料夾，從結構上消除這種失敗」，並用 `plan-path` 標記檔防止兩個同名計畫互蓋；`.superpowers/sdd/.gitignore` 內容 `*` 讓這些暫存檔不進 git。

### 5.6 審查兩端
- **requesting-code-review**（[SKILL.md#L12-L46](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/requesting-code-review/SKILL.md#L12-L46)）：何時必須審（每任務後、大功能後、合併前）、Critical 立刻修、Important 前進前修、Minor 記下。範本 [code-reviewer.md#L160-L198](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/requesting-code-review/code-reviewer.md#L160-L198) 有完整輸出範例（Strengths／Issues 分級＋檔案:行號／Recommendations／Assessment）。
- **receiving-code-review**（[SKILL.md#L14-L38](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/receiving-code-review/SKILL.md#L14-L38)）：讀→重述→對照程式碼查證→評估→回應→一次一項實作；禁止「你說得完全對！」這種表演式回應。**這個對你很實用：GPT 審 Claude、Claude 審 GPT 時，被審的一方要先查證再改，不是照單全收。**
- **task-reviewer-prompt.md**（[#L64-L71](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/task-reviewer-prompt.md#L64-L71)）：「不要相信實作者的報告」，連「依 YAGNI 刻意保持簡單」這種理由都只是自評，不能降低問題嚴重度。`#L94-L113`：規格比對分三類 **Missing（漏做）／Extra（多做）／Misunderstood（做錯方向）**。

### 5.7 驗證鐵律
- **位置：** [skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/verification-before-completion/SKILL.md)
- `#L14-L20` 鐵律；`#L22-L36` 五步閘門（找出能證明的指令→完整執行→讀完整輸出看 exit code→確認→才宣稱，「跳任何一步＝說謊」）；`#L38-L48` 宣稱 vs 證據表；`#L50-L59` 紅旗（用「應該」「大概」、還沒驗證就說「完成！」、相信 agent 的成功回報）；`#L100-L104` **委派給 agent 的工作：看 diff、驗證變更、回報實際狀態**。

### 5.8 寫 skill 的方法
- **位置：** [skills/writing-skills/SKILL.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/SKILL.md)、[references/discovery.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/discovery.md)、[references/CLAUDE_MD_TESTING.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/CLAUDE_MD_TESTING.md)、[references/bulletproofing.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/bulletproofing.md)
- 詳見第 11 節「Skill 寫法」。

### 5.9 事後診斷（最接近巡讀）
- **位置：** [skills/diagnosing-superpowers/SKILL.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/diagnosing-superpowers/SKILL.md)
- `#L19-L70` 七步流程：問題釐清（一次問一個）→ 定位對話檔 → **平行派 7 個分析員**（每人一份 `prompts/*.md`）→ 依 `templates/report.md` 寫報告 → （選用）搜 GitHub issue → （選用）去識別化打包 → （選用）找相似對話。
- `#L86-L109` 硬規則：唯讀、絕不改對話檔；只有人類打的字才算「使用者指示」，hook 輸出與工具結果不算；未經同意不建 issue、不打包。
- 分析員共用格式 [prompts/analyst-common.md#L23-L38](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/diagnosing-superpowers/prompts/analyst-common.md#L23-L38)：每條 `finding／evidence: 路徑:行號 — "引文"／turns／confidence`，最後 `Checked:` 寫查了什麼；**沒有 `路徑:行號` 的發現一律丟掉**。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 完成前驗證鐵律 | [skills/verification-before-completion/SKILL.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/verification-before-completion/SKILL.md) | 無 | 低 | 整個資料夾複製到 `.claude/skills/` 和 `.agents/skills/`（Codex），兩邊同一份；或把第 14-48 行抄進共用 AGENTS.md 的「完成定義」段 |
| 進度帳本格式＋只在測試通過才記錄的腳本 | [skills/executing-plans/SKILL.md#L108-L148](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/executing-plans/SKILL.md#L108-L148)、[scripts/task-done](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/executing-plans/scripts/task-done) | bash、git；`task-done` 會呼叫 `sdd-repo`、`sdd-workspace` | 中 | 你的專案是純 JS＋Firebase，沒有正式測試指令也能用：把 `-- <test command>` 換成 `node scripts/check.js` 之類的檢查。或不跑腳本，只借格式：`docs/ai/ledger.md` 每行 `Task N: complete (commit, 驗證: 指令 → 結果)`、`Ruling: … — … — …`，規定 GPT 與 Claude 都只能追加 |
| 「裁決」規則＋4 種必停情況 | [skills/executing-plans/SKILL.md#L32-L43](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/executing-plans/SKILL.md#L32-L43) | 無 | 低 | 抄進 AGENTS.md 的「什麼時候要問老闆」段；對「改 Firebase 正式資料、刪庫存資料、發布網站」特別有用 |
| 計畫範本（含 Global Constraints、Review Focus、Interfaces） | [skills/writing-plans/SKILL.md#L52-L138](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-plans/SKILL.md#L52-L138) | 無 | 低 | 當作「交接單」範本：GPT 寫計畫、Claude 執行（或反過來），Interfaces 欄讓兩邊用同一個函式名 |
| 實作者／審查者提示詞 | [implementer-prompt.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/implementer-prompt.md)、[task-reviewer-prompt.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/task-reviewer-prompt.md) | 需要能派子代理的工具（Claude Code 的 Agent；Codex 要開 `multi_agent`） | 低 | 直接當「角色卡」：實作者（四種狀態回報、不准自己叫審查者）、審查者（不信報告、Missing/Extra/Misunderstood） |
| 修正迴圈上限＋斷路器 | [references/fix-loop.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/fix-loop.md) | 同上 | 低 | 防止兩個 AI 互相改來改去無限循環：最多 5 輪，之後由主控裁決並記錄 |
| 計畫專屬工作區（防舊帳本被誤讀） | [scripts/sdd-workspace](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/scripts/sdd-workspace) | bash、git | 中 | 想法比程式重要：每個工作一個資料夾＋一個「這資料夾屬於誰」的標記檔 |
| diff 打包給審查者 | [scripts/review-package](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/scripts/review-package) | bash、git | 低 | 巡讀時「昨天到今天改了什麼」：`git log --oneline` ＋ `git diff --stat` ＋ `git diff -U10` 寫成一個檔案給巡讀 AI 讀 |
| 7 面向分析員＋報告模板 | [skills/diagnosing-superpowers/prompts/](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/diagnosing-superpowers/prompts/analyst-common.md)、[templates/report.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/diagnosing-superpowers/templates/report.md) | 需要子代理；原本讀的是對話紀錄 | 中 | 改寫成「每日巡讀」：把讀對話紀錄換成讀專案檔案＋git log＋ledger；保留 repeated-work、request-conflicts、plan-adherence 三個面向，新增「新舊版本」面向（第 11 節） |
| 版本號單一來源＋漂移稽核 | [.version-bump.json](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/.version-bump.json)、[scripts/bump-version.sh#L116-L226](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/scripts/bump-version.sh#L116-L226) | bash、jq（yaml 要 yq） | 低 | 你的系統若在多個地方寫版本號或「規則版本」（AGENTS.md、CLAUDE.md、package.json、網頁頁尾），用同樣的 JSON 清單＋`--check` 抓不一致、`--audit` 抓還留著舊版本字串的檔案 |
| skill 大小上限檢查 | [tests/skill-size/test-skill-size.sh](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/tests/skill-size/test-skill-size.sh) | bash | 低 | 改成檢查你的 AGENTS.md／CLAUDE.md 有沒有長到失控（理由見第 9 節：Claude Code 壓縮後只保留每個 skill 前 20,000 字元） |
| 跨工具接線說明 | [docs/porting-to-a-new-harness.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/docs/porting-to-a-new-harness.md) | 無 | 低（閱讀） | 想同時讓 Claude Code、Codex、Gemini 吃同一份規則時的參考書 |

---

## 7. AI／Claude 整合

- **用哪些模型：** 不綁任何模型。skill 只描述「動作」（叫 skill、讀檔、派子代理、建 todo），**不寫死工具名稱**；各工具的實際工具名放在對照表（[docs/porting-to-a-new-harness.md#L31-L56](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/docs/porting-to-a-new-harness.md#L31-L56)）。模型選擇只用「便宜／標準／最強」三級描述（SDD `#L140-L175`）。
- **prompt 放在哪：** 全部是檔案，沒有寫在程式碼裡：
  - 主規則：`skills/*/SKILL.md`
  - 子代理提示詞：`skills/subagent-driven-development/implementer-prompt.md`、`task-reviewer-prompt.md`、`re-review-prompt.md`；`skills/requesting-code-review/code-reviewer.md`；`skills/brainstorming/builder-check-prompt.md`；`skills/diagnosing-superpowers/prompts/*.md`（11 份）
  - 各工具對照：`skills/using-superpowers/references/{antigravity,claude-code,codex,gemini,hermes,muse,pi}-tools.md`（7 份，`ls` 算的）
- **有沒有 MCP／Skills：** 沒有 MCP 伺服器。**就是 Skills 本身**，遵守 agentskills.io 規格（frontmatter 只有 `name` 和 `description`）。
- **Claude 支援：原生。** Claude Code 是「參考工具」（[claude-code-tools.md#L1-L7](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/using-superpowers/references/claude-code-tools.md#L1-L7)：skills 用的就是 Claude Code 的詞彙 `Agent`、todos、`Skill`）。也在 Anthropic 官方外掛市集上架。`claude-code-tools.md#L9-L29` 還教一招省錢法：主對話（最貴）只派一個中階模型的「協調者子代理」，讓它在下一層跑完整個 SDD 流程，最後原封不動轉交「Rulings I made」清單。
- **Codex（GPT）支援：原生。** 官方 Codex 外掛市集上架；Codex 用原生技能探索。要用子代理需在 `~/.codex/config.toml` 開 `[features] multi_agent = true`（[codex-tools.md#L1-L15](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/using-superpowers/references/codex-tools.md#L1-L15)）；建議設 `[agents] default_subagent_model` 當保底，避免子代理默默用到最貴模型（`#L62-L79`）。派子代理要用 `spawn_agent {fork_turns: "none"}` 給乾淨上下文。
- **同一份 skill 給 GPT 和 Claude：** `writing-skills/SKILL.md#L12` 寫明「Codex、Copilot CLI、Gemini CLI 都認得 `~/.agents/skills/` 這個跨工具位置」；Claude Code 的個人 skill 在 `~/.claude/skills/`。也就是說，**同一個 skill 資料夾，放（或連結）到這兩個地方，Claude 和 GPT 就讀同一份**。

---

## 8. 擴充方式與 API

- **沒有程式 API。** 擴充就是「加 skill 資料夾」。
- **自己加 skill：** 放在個人 skill 目錄（Claude Code `~/.claude/skills/`；Codex／Gemini／Copilot 共用 `~/.agents/skills/`）或專案目錄，格式見第 11 節。官方 `AGENTS.md` 說核心「一般不收新 skill」、領域專用的應自己做獨立外掛（[AGENTS.md#L62-L64](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/AGENTS.md#L62-L64)）——所以你的「巡讀」「庫存規則」skill 應該是你自己的外掛或專案內 skill，不是改它的檔。
- **跨 skill 引用：** 用 `**REQUIRED SUB-SKILL:** Use superpowers:xxx` 這種寫法，**不要用 `@檔案路徑`**，因為 `@` 會立刻把整個檔案載入、浪費上下文（[discovery.md#L191-L201](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/discovery.md#L191-L201)）。
- **使用者的規則勝過 skill：** `using-superpowers#L63-L65`。所以你可以在專案 AGENTS.md／CLAUDE.md 寫「計畫改存 `docs/ai/plans/`」，它的 skill 會讓步（writing-plans `#L17`、brainstorming `#L247-L248` 都寫了「使用者偏好覆蓋預設位置」）。
- **接到新的 AI 工具：** 照 `docs/porting-to-a-new-harness.md` 三種形狀：A Shell hook、B 程式外掛、C 指示檔（[#L263-L300](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/docs/porting-to-a-new-harness.md#L263-L300)）。附錄 A（`#L798-L812`）是目前所有工具的接線對照表。驗收測試：開新對話送「Let's make a react todo list」，要自動觸發 brainstorming 才算接成功（[AGENTS.md#L78-L97](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/AGENTS.md#L78-L97)）。

---

## 9. 程式品質與風險

- **維護狀況：非常活躍。** 最新 commit 2026-11-03（`git log -1`）；`RELEASE-NOTES.md` 第 3 行 v7.0.2（2026-11-03）、往前 v7.0.1（10-21）、v7.0.0（10-09）、v6.4.2（09-25）……大約每 2-3 週一版。發版說明會寫具體數字（例如 brainstorming 多餘問題從 41 降到 23，盲測 33 次對話）。PR 拒絕率自稱 94%（`AGENTS.md#L7`），維護者把關嚴格。
- **測試：** `tests/` 79 個檔，主要測「外掛基礎設施」（各工具的 hook、manifest、腳本、Windows 相容）。**skill 行為本身的評測不在這個 repo**，在另一個 repo `prime-radiant-inc/superpowers-evals`（README 與 AGENTS.md 都這樣寫，我沒有 clone 它，內容未確認）。
- **資安／隱私：**
  - 會在每次開對話、`/clear`、壓縮後執行 `hooks/session-start`（Bash）；腳本只讀一個檔案、輸出 JSON，刻意不開子行程（`#L13-L15` 註解），我讀過全檔沒看到網路存取。
  - 遙測只在選用的視覺腦力激盪頁面載入 logo 時發生，可用環境變數關（見第 2 節）。
  - `diagnosing-superpowers` 讀的是你本機的對話紀錄，打包分享前有去識別化步驟並要求人工逐檔檢查（`SKILL.md#L55-L66`）。
- **已知的坑：**
  1. **很花 token。** 總開關每次都注入；SDD 每任務 2 個以上子代理。作者自己在 v6.1.0 為此壓縮過總開關（RELEASE-NOTES 第 299 行「Lower Per-Session Token Cost」）。
  2. **壓縮截斷。** `tests/skill-size/test-skill-size.sh#L1-L8` 註解：Claude Code 壓縮後，每個已叫用的 skill 只重新附上前 20,000 字元，後面的內容就消失了。**你的 CLAUDE.md／skill 太長，後半段在長對話後可能等於沒寫**——這也是「AI 會漏東西」的原因之一。
  3. **測試情境檔被當真。** `tests/skill-layout/test-no-dev-files-in-skills.sh#L4-L8`：skill 資料夾裡如果放了「This is a real scenario. You must choose and act」這種壓力測試檔，AI 會把它當成真的指令。**你的 skills 資料夾裡不要混放範例對話或測試腳本。**
  4. **強硬語氣有副作用。** `writing-skills#L248-L263` 自己就承認：「禁止式」規則對「輸出形狀不對」的問題會反效果，要用「正面配方」。照抄紅旗表到不適合的地方，可能讓 AI 過度僵化。
  5. **Codex 沒有 hook 注入**，依賴 Codex 自己挑 skill；在 Codex 上「1% 也要叫 skill」這條總規則的效果可能不如 Claude Code（未確認，repo 只說「Codex 自己就能可靠觸發」）。
  6. **流程是為「git＋測試」的軟體專案設計的。** 你若沒有自動測試，`task-done`、TDD、`verification` 裡的「跑測試」要換成你自己的檢查方式（例如手動清單、或簡單的 node 檢查腳本），否則 AI 會卡住或亂編。

---

## 10. 跟其他專案組合的建議

（這一節是我的建議，不是 repo 內容。）

1. **Superpowers（流程與防漏）＋ github/spec-kit（共用規則與一致性稽核）：** Spec Kit 的「專案憲法（有版本號、修訂紀錄）」＋ `/speckit.analyze` 的「重複／模糊／不一致」分類，補上 Superpowers 缺的「防重複、防新舊衝突」；Superpowers 的 verification＋ledger＋Ruling 補上 Spec Kit 偏弱的「完成證據」與「交接紀錄」。
2. **Superpowers ＋ 角色庫型專案（例如 msitarzewski/agency-agents、bmad-code-org/BMAD-METHOD）：** 那些專案有大量「業務角色」（PM、行銷、QA），Superpowers 只有開發角色。可以用 BMAD 類的角色定義＋Superpowers 的「回報四狀態、不准自己叫審查者、模型分級、5 輪斷路器」當角色之間的交接協議。
3. **你的倉儲系統（純 JS＋Firebase）實際接法：**
   - 先只裝 `verification-before-completion`、`writing-plans`、`executing-plans`、`receiving-code-review` 四個（用 Claude Code 外掛裝全套也行，但先只「實際使用」這四個流程）。
   - Firestore 規則、價格計算、庫存扣帳這種「錯了很貴」的地方，在 writing-plans 的 **Global Constraints** 寫死（例如「庫存不可為負」「金額用整數分」），並在 **Review Focus** 列出「同時兩人出貨」「匯入 Excel 有空白列」等最可能出事的輸入。
   - 以後做「網頁版 Excel」「比價」「AI 影片」等 A＋B＋C 組合時，每個新功能都走 brainstorming → 設計文件 → 計畫 → 執行，設計文件與計畫都進 git，就是你的「單一事實來源」。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫

- **檔案結構（AGENTS.md／CLAUDE.md／.ruler／constitution／rules）：部分有。**
  - repo 根目錄的 [AGENTS.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/AGENTS.md) 是「給要對這個 repo 發 PR 的 AI 看的」貢獻規則，不是給使用者專案的範本；但它的寫法值得學：第 3-20 行一開頭就是「If You Are an AI Agent — Stop. Read this section before doing anything.」，列 6 個發 PR 前必做的檢查，任何一項不過就不准做。
  - [GEMINI.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/GEMINI.md) 只有 2 行 `@./skills/using-superpowers/SKILL.md`、`@./skills/using-superpowers/references/gemini-tools.md`——**「規則檔只當目錄，真正內容放在共用檔案」的最小範例**。
  - 沒有 `.ruler`、沒有 constitution 檔、沒有 `CLAUDE.md`（`ls-tree` 裡沒有）。
- **分層（全域／專案／子資料夾）：有（間接）。** 個人 skill：`~/.claude/skills/`（Claude）、`~/.agents/skills/`（Codex／Gemini／Copilot 共用）；外掛層：透過市集安裝的 superpowers；專案層：使用者的 CLAUDE.md／AGENTS.md。沒有「子資料夾規則」的設計（未發現）。
- **優先順序：有，而且寫得很清楚。** [using-superpowers/SKILL.md#L63-L65](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/using-superpowers/SKILL.md#L63-L65)：「使用者指示（CLAUDE.md、AGENTS.md、GEMINI.md 等、直接要求）> skill > 預設行為；只有使用者明說才可跳過 skill 流程」。執行計畫時的衝突裁決順序：**規格（spec）是最高權威，計畫是它的論證，自己的判斷補兩者都沒說的**（[executing-plans/SKILL.md#L32-L37](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/executing-plans/SKILL.md#L32-L37)）。
- **怎麼讓 GPT（Codex）和 Claude 讀同一份規則：有。** 做法是「**skill 內容只寫一份、不寫工具名稱，每個工具只加一層薄薄的接線＋對照表**」（[docs/porting-to-a-new-harness.md#L31-L63](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/docs/porting-to-a-new-harness.md#L31-L63)，第 59 行「Skills name actions, not tools」）。Claude Code 用 hook 注入、Codex 用原生技能探索、Gemini 用 `GEMINI.md` 的 `@` 引入，**內容都指向同一個 `skills/using-superpowers/SKILL.md`**。同一頁 `#L65-L80` 還有第二條原則：**不准去改使用者家目錄的全域設定檔**，所有東西都透過工具自己的安裝機制送進去。

  👉 **借用到你的架構：** 建一個 `ai-rules/` 資料夾放「真正的規則」，`AGENTS.md`（Codex 讀）和 `CLAUDE.md`（Claude 讀）都只有幾行「請先讀 ai-rules/xxx.md」，或 CLAUDE.md 用 `@ai-rules/core.md` 引入（Claude Code 支援 `@` 引入；Codex 是否展開 `@` 未確認——porting 文件 `#L280-L286` 也提醒「不要相信 `@` 一定會展開，要用獨特標記字串測試」）。

### 11.2 角色設計

- **有。** 雖然沒有一個「角色清單檔」，但各 skill 裡定義了下列角色（我逐一從檔案整理）：

| 角色 | 職責 | 用的 skill／範本 | 可用工具／限制 | 交接方式 | 向誰負責 |
|---|---|---|---|---|---|
| 人類夥伴（your human partner） | 核准設計、選執行方式、看 Rulings 清單 | — | — | 讀設計文件、計畫、最終訊息 | — |
| 控制者（controller，主對話） | 派工、處理回報、裁決、維護帳本；**不准自己修程式**（fix-loop `#L56-L57`） | subagent-driven-development | 子代理工具、todo、帳本 | 寫 brief 檔、review package 檔 | 人類 |
| 實作者（implementer） | 實作一個任務、TDD、commit、自審、寫報告 | implementer-prompt.md | **不准再派子代理**（`#L50-L60`） | 報告檔＋15 行內摘要＋四種狀態 | 控制者 |
| 任務審查者（task reviewer） | 讀 diff 給「規格符合」＋「品質」兩個判定 | task-reviewer-prompt.md | 唯讀、不准改工作樹、不准再派子代理、不重跑整套測試 | 報告以判定開頭，每項附 檔案:行號 | 控制者 |
| 重審者（re-reviewer） | 只看修正 diff，每個問題標 ADDRESSED／NOT ADDRESSED | re-review-prompt.md | 範圍限縮，不能擴大 | 同上 | 控制者 |
| 最終審查者（final reviewer） | 整個分支一次審，最強模型 | requesting-code-review/code-reviewer.md | 讀 review package、帳本裡的 Ruling 與 deferred minor | Strengths／Issues 分級／Assessment | 控制者→人類 |
| 建造者檢查（builder check） | 假裝要照設計文件動工的工程師，提出問題 | brainstorming/builder-check-prompt.md | 新上下文子代理 | 問題分三堆 | 寫設計的 AI |
| 分析員（analyst ×7） | 各看一個面向找問題 | diagnosing-superpowers/prompts/*.md | 唯讀、必附 路徑:行號 | 固定格式 findings＋Checked | 診斷主控 |
| 平行代理（parallel agent） | 處理互不相干的一塊問題 | dispatching-parallel-agents | 範圍限定、要寫清楚回傳什麼（`#L87-L113`） | 摘要回報 | 派工者 |

- **技能（skills）分配：** 實作者被要求載入 test-driven-development；所有角色宣稱完成時受 verification-before-completion 約束；審查端用 requesting／receiving-code-review。
- **模型分配：** SDD `#L140-L175`（便宜／標準／最強＋第 4-5 輪修正升級）。
- **誰向誰負責：** 子代理→控制者→人類；控制者最後必須把所有 `Ruling:` 一條不漏交給人類（[references/final-review.md#L33-L42](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/final-review.md#L33-L42)：「沒交出去的裁決＝秘密做的決定」）。

### 11.3 防漏

- **任務追蹤（backlog／issue／checklist）：有。** 計畫檔每步是 `- [ ]` checkbox（writing-plans `#L59`、`#L108-L132`）；叫用 skill 時「有 checklist 就每項建一個 todo」（using-superpowers `#L24`）；writing-skills 的 checklist 也要求每項建 todo（`#L349`）。
- **完成前驗證：有，而且是核心。** [verification-before-completion#L14-L48](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/verification-before-completion/SKILL.md#L14-L48)；executing-plans 的完成契約（`#L209-L222`）；`task-done` 腳本測試失敗就不記錄；審查者「不要相信實作者的報告」。
- **交接紀錄：有。** 帳本 `progress.md`（`Task N: complete …`、`Task N: fix round R/5 …`、`Task N: parked — … — Ruling: …`、`Task N: minor (deferred): …`），格式散見 executing-plans `#L139-L140`、`#L231`，fix-loop `#L9-L11`、`#L54`、`#L64`。實作者報告檔（implementer-prompt `#L128-L153`）。
- **漏做偵測：有。** 審查者的 **Missing** 類別（task-reviewer-prompt `#L98-L99`）；batch 任務時「清單裡列的檔案 diff 裡沒動到＝Missing」（`#L105-L109`）；writing-plans 自我檢查「規格每一段都找得到對應任務嗎」（`#L167`）。

### 11.4 防重複

- **重複內容／重複工作偵測：部分有。** [diagnosing-superpowers/prompts/repeated-work.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/diagnosing-superpowers/prompts/repeated-work.md)：把每個工具呼叫抽成 `(行, 回合, 工具, key)`，依 key 分組，讀取／搜尋 ≥3 次、編輯 ≥2 次、同樣 shell 指令 ≥2 次、同描述子代理 ≥2 次就列出；再判斷中間有沒有變化（編輯後重讀不算、壓縮後重讀算壓縮造成的）；還找「重新推導已經做過的決定」。**對象是對話紀錄，不是專案檔案**。
- **重複角色：有（防止）。** 實作者與審查者都「不准自己再叫審查者」——真實案例中「worker 自己叫的審查者，全部和控制者派的審查重複」（SDD `#L225-L230`、`#L339`）。最終審查發現問題時「派一個修正者處理整份清單，不是每個問題一個」（final-review `#L18-L21`）。
- **重複程式碼：有（審查項目）。** 審查者把「邏輯區塊逐字重複」列為 Important（task-reviewer-prompt `#L148-L150`）；preflight 也檢查「計畫明文要求、但審查標準視為缺陷的東西（例如逐字重複的邏輯）」。
- **重複規則的偵測或合併：沒有。** 沒看到掃描多個規則檔找重複條文的工具。writing-skills 只有原則：「不要重複已在其他 skill 寫過的東西，用交叉引用」（discovery `#L146-L172`）。
- **重複 PR：有（只針對它自己的 repo）。** AGENTS.md `#L14`「發 PR 前搜尋開著與關掉的 PR，有重複就停」。

### 11.5 防新舊版本衝突

- **版本標記：有（只針對它自己的設定檔）。** `.version-bump.json` 列 12 個檔案的版本欄位（[#L1-L27](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/.version-bump.json#L1-L27)）。
- **單一事實來源：有。**
  - 版本號：`.version-bump.json` ＋ `bump-version.sh`。
  - 規則內容：`skills/` 是所有工具共用的唯一來源（porting `#L37-L41`）。
  - 需求：「brief 是唯一需求來源，數值只出現在 brief」（SDD `#L203-L215`）；「規格是最高權威」。
  - 工作區位置：`sdd-workspace` 是唯一決定工作區路徑的地方，「讓 task-brief 和 review-package 不會漂移到不同資料夾」（`#L27-L28`）。
- **變更提案／封存：有（他們自己的開發方式）。** 每個改動先寫設計文件 `docs/superpowers/specs/YYYY-MM-DD-主題-design.md`（22 份）並 commit；完成後工作區刪除，「git 歷史就是紀錄」（executing-plans `#L302-L304`）。沒有正式的「封存（archive）資料夾」機制。
- **過期（staleness／drift）偵測：有兩種。**
  1. **舊帳本誤讀防護：** 帳本第一行寫計畫路徑，不符就當成別人的、不碰（[references/resuming.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/resuming.md)）；工作區用 `plan-path` 標記檔（`sdd-workspace#L77-L98`）。
  2. **版本漂移：** `bump-version.sh --check`（[#L116-L152](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/scripts/bump-version.sh#L116-L152)）列出每個檔案的版本，不一致就印「DRIFT DETECTED」；`--audit`（`#L154-L226`）用目前版本字串 grep 全 repo，找出「含版本號但沒登記」的檔案。
- **「記憶 vs 現況」：** using-superpowers 紅旗表「I remember this skill → Skills evolve. Read current version.」（`#L46`）；executing-plans「你記得的是摘要，brief 才有精確值，每次都要重讀」（`#L176-L178`）；「壓縮後相信帳本和 git log，不信自己記憶」。
- **沒有：** 跨文件的「同一件事兩份文件說法不同」偵測（術語漂移、規則矛盾）。最接近的是 writing-plans 的「型別一致性」自我檢查（`#L171`）和 request-conflicts 分析員（使用者指令 vs CLAUDE.md／AGENTS.md）。

### 11.6 定期巡檢

- **排程或每日巡讀（heartbeat、cron、hook）：沒有。** 唯一的 hook 是 SessionStart 注入規則（`hooks/hooks.json`），不是巡檢。`docs/testing.md` 第 37 行提到「nightly」是他們自己的評測規劃。
- **最接近的現成材料：** `diagnosing-superpowers`（手動觸發，事後診斷一次對話）。
- **報告格式（原版）：** [templates/report.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/diagnosing-superpowers/templates/report.md) 共 9 節：1 問題陳述、2 判定（每句附 `path:line`、標信心高中低）、3 環境、4 檢查過的對話、5 時間軸表、6 發現（7 個面向各一小節，沒發現要寫「none found — checked: 查了什麼」）、7 superpowers 相關性、8 覆蓋說明（沒讀的範圍與原因）、9 相似對話。每條發現的格式：

```
- finding: <一句話>
  evidence: <path:line> — "<短引文>"
  turns: <first>–<last>
  confidence: high | medium | low
```

- **👉 改成你的「每日巡讀」skill（我的建議，非 repo 內容）：**

```
skills/daily-patrol/
  SKILL.md            # description: Use when the daily project patrol is due, or when asked to check
                      #   the whole project for missed work, duplicated content, or old-vs-new conflicts
  prompts/
    analyst-common.md # 照抄 superpowers 的回報格式：finding / evidence: 路徑:行號 / confidence；沒證據就丟
    missed-work.md    # 改寫自 plan-adherence.md：比對 docs/ai/plans/*.md 的 - [ ] 與 ledger 的 complete 行、git log
    duplicates.md     # 改寫自 repeated-work.md：對象換成「專案檔案」——同義規則、重複函式、重複頁面
    conflicts.md      # 改寫自 request-conflicts.md：AGENTS.md vs CLAUDE.md vs ai-rules/*.md 條文互相矛盾
    versions.md       # 新增：借 bump-version.sh --check/--audit 的想法，列出版本字串、日期、「已廢止」標記不一致處
  templates/report.md # 精簡版 9 節報告，存 docs/ai/patrol/YYYY-MM-DD.md
```

簡短報告範例：

```markdown
# 巡讀報告 2026-11-05
## 1. 判定（信心：中）
- 昨天 Codex 完成的 Task 4「出貨扣庫存」，ledger 有 complete，但計畫 Task 4 的 Step 3 checkbox 未勾、diff 沒動到 functions/stock.js。
## 2. 發現
### 漏做
- finding: Task 4 宣稱完成但缺少負庫存檢查
  evidence: docs/ai/plans/2026-11-03-shipping.md:88 — "- [ ] Step 3: reject when stock < qty"
  confidence: high
### 重複
- finding: 「價格四捨五入」規則同時寫在 CLAUDE.md:40 與 ai-rules/pricing.md:12，小數位數不同
  evidence: CLAUDE.md:40 — "round to 1 decimal"；ai-rules/pricing.md:12 — "整數元"
  confidence: high
### 新舊版本
- none found — checked: AGENTS.md、CLAUDE.md、ai-rules/*.md 的「版本:」欄位；package.json version
## 3. 沒檢查到的範圍
- functions/legacy/（超過 2000 行，只讀了 git diff）
```

觸發方式（repo 外，未在 superpowers 裡驗證）：Claude Code 的排程任務、GitHub Actions `schedule:`（cron），或電腦的工作排程器每天叫一次 `claude -p "use daily-patrol skill"`；巡讀 AI **只寫報告、不改檔**（借 diagnosing 的「Read-only」硬規則 `SKILL.md#L90`）。

### 11.7 Skill 寫法

- **SKILL.md 格式：有。** [discovery.md#L6-L50](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/discovery.md#L6-L50)：YAML frontmatter 只要 `name`、`description`（合計上限 1024 字元）；`name` 只用英數與連字號，動詞開頭（`creating-skills` 優於 `skill-creation`）；本文建議段落：Overview（核心原則 1-2 句）→ When to Use（含何時不用）→ Core Pattern → Quick Reference → Implementation → Common Mistakes。
- **description 怎麼寫才會被正確觸發：有，這是全 repo 最有價值的一段。** [discovery.md#L53-L110](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/discovery.md#L53-L110)：
  - 以「Use when…」開頭、第三人稱、只寫**觸發條件與症狀**，**絕對不要摘要流程**。
  - 實測理由：description 寫「每個任務之間做 code review」時，AI 只做了一次審查（skill 本文其實要兩次）；改成「Use when executing implementation plans with independent tasks」後，AI 才去讀本文、正確做兩階段審查（`#L67-L69`）。
  - 描述「問題」而非「技術細節」：寫「race conditions、時好時壞」，不要寫「setTimeout」（除非 skill 本身就綁那個技術）。
  - 放 AI 會搜的字：錯誤訊息、症狀、同義詞、工具名。
  - 長度盡量 < 500 字元；常被載入的 skill 本文 < 200 字、其他 < 500 字（`#L130-L133`）。
- **資料夾結構：有。** [writing-skills/SKILL.md#L72-L91](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/SKILL.md#L72-L91)、`#L134-L161`：扁平命名空間；只有「100 行以上的參考資料」或「可重用工具」才拆檔；三種型態：自足型（只有 SKILL.md）、附工具型（SKILL.md＋example.ts）、重參考型（SKILL.md＋大參考檔＋`scripts/`）。實際 repo 慣例是 `references/`（需要時才讀）、`scripts/`、`prompts/`、`templates/`。
- **腳本放哪：** `scripts/` 子資料夾；**在 SKILL.md 裡要寫成 `bash scripts/tool.sh`、`node scripts/tool.js`，不要寫裸路徑**，因為有些外掛打包會把執行權限拿掉（`#L161`）。
- **測試 skill 的方法（RED-GREEN-REFACTOR）：有。** `#L163-L182` 鐵律「NO SKILL WITHOUT A FAILING TEST FIRST」，連「只是加一段」也要測；`#L184-L231` 四種 skill（紀律、技巧、模式、參考）各自怎麼測；`#L295-L305` **微測試**：每個版本至少 5 次、一定要有「不給規則」的對照組、對照組沒出錯就不要寫規則、人工讀每一個命中結果。
- **用什麼形式寫規則：有。** `#L248-L263`「依失敗類型選形式」——知道規則但壓力下違反→禁止＋藉口表＋紅旗；輸出形狀不對→正面配方（直接說輸出長什麼樣）；漏掉某個元素→在範本裡放必填欄位；行為依條件而定→用可觀察的條件句。**不要加「除非重要」這種但書**（會重開談判）。
- **怎麼讓 CLAUDE.md 真的讓 AI 去查 skill：有實驗設計。** [CLAUDE_MD_TESTING.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/CLAUDE_MD_TESTING.md)：4 種壓力情境（時間壓力、沉沒成本、權威、熟悉感）× 4 種 CLAUDE.md 寫法（溫和建議／指令式／強調式 XML／流程式），預期結果：溫和建議在壓力下會被跳過、強調式最服從但可能太僵。

### 11.8 支援哪些工具與安裝方式

README 列出 16 種（我數 README 第 10-25 行 Table of Contents 的工具項目）。和你有關的：

| 工具 | 安裝 | 規則怎麼送進去 |
|---|---|---|
| **Claude Code** | `/plugin install superpowers@claude-plugins-official`（官方市集）；或 `/plugin marketplace add obra/superpowers-marketplace` 再 `/plugin install superpowers@superpowers-marketplace` | SessionStart hook 注入 |
| **Codex App** | 側欄 Plugins → Coding 區 → Superpowers 按 `+` | 原生技能探索 |
| **Codex CLI** | `/plugins` → 搜 `superpowers` → Install Plugin；要用子代理需開 `multi_agent = true` | 原生技能探索 |
| Cursor | `/add-plugin superpowers` | hook（`hooks-cursor.json`） |
| Gemini CLI | `gemini extensions install https://github.com/obra/superpowers` | `GEMINI.md` `@` 引入 |
| GitHub Copilot CLI | `copilot plugin marketplace add obra/superpowers-marketplace` → `copilot plugin install superpowers@superpowers-marketplace` | 共用 Claude Code hook |
| 其他 | Antigravity、Devin CLI、Factory Droid、Grok Build CLI、Kimi Code、OpenCode、Pi、Qwen Code、Hermes Agent、Muse | 見 README 與 porting 附錄 A |

README 也明說：「同時用多個工具，要在每個工具分別安裝」。

### 11.9 可以直接借用到你「基礎架構」的檔案或段落

| 用途 | 借哪裡 | 放到你的哪裡 |
|---|---|---|
| 完成定義（防漏） | `skills/verification-before-completion/SKILL.md` 全檔 | `ai-rules/verification.md`，AGENTS.md 與 CLAUDE.md 都引用 |
| 何時必須停下來問老闆 | `skills/executing-plans/SKILL.md#L32-L43` | `ai-rules/core.md`「停止條件」段 |
| 規則優先順序 | `skills/using-superpowers/SKILL.md#L63-L65` | `ai-rules/core.md` 開頭 |
| 交接帳本格式 | `skills/executing-plans/SKILL.md#L108-L148`、`#L224-L234` | `docs/ai/ledger.md`（只准追加） |
| 計畫／交接單範本 | `skills/writing-plans/SKILL.md#L52-L138` | `docs/ai/templates/plan.md` |
| 實作者角色卡 | `skills/subagent-driven-development/implementer-prompt.md` | `ai-rules/roles/implementer.md` |
| 審查者角色卡 | `skills/subagent-driven-development/task-reviewer-prompt.md` | `ai-rules/roles/reviewer.md`（GPT 審 Claude 或反之） |
| 收到審查意見怎麼回 | `skills/receiving-code-review/SKILL.md#L14-L57` | `ai-rules/roles/implementer.md` 附錄 |
| 修正迴圈上限 | `skills/subagent-driven-development/references/fix-loop.md` | `ai-rules/review-loop.md` |
| 巡讀分析員骨架 | `skills/diagnosing-superpowers/prompts/analyst-common.md`、`repeated-work.md`、`request-conflicts.md`、`plan-adherence.md`、`templates/report.md` | `skills/daily-patrol/`（見 11.6） |
| 版本漂移稽核 | `.version-bump.json`＋`scripts/bump-version.sh` 的 `--check/--audit` | `scripts/check-versions.sh`，巡讀時順便跑 |
| 規則檔長度上限 | `tests/skill-size/test-skill-size.sh` | 檢查 AGENTS.md、CLAUDE.md、每個 SKILL.md |
| 寫 skill 的方法 | `skills/writing-skills/SKILL.md`、`references/discovery.md` | 要新增任何 skill 前先讀（可直接安裝 superpowers 讓 AI 自動套用） |
| 「規則檔只當目錄」的範例 | `GEMINI.md`（2 行 `@` 引入） | 你的 CLAUDE.md 寫法參考 |

---

## 關鍵字

obra/superpowers、Superpowers、Jesse Vincent、Prime Radiant、agentic skills framework、AI 協作規則、技能框架、SKILL.md、using-superpowers、bootstrap、SessionStart hook、開機注入、brainstorming、腦力激盪、設計文件、design doc、writing-plans、實作計畫、executing-plans、subagent-driven-development、SDD、子代理、subagent、controller、implementer、task reviewer、final review、角色分工、模型分級、model selection、verification-before-completion、完成前驗證、防漏、evidence before claims、ledger、進度帳本、交接紀錄、Ruling、裁決紀錄、fix loop、斷路器、preflight、計畫衝突掃描、requesting-code-review、receiving-code-review、程式碼審查、test-driven-development、TDD、systematic-debugging、根因分析、dispatching-parallel-agents、平行代理、using-git-worktrees、finishing-a-development-branch、diagnosing-superpowers、事後診斷、巡讀、patrol、repeated-work、重複工作偵測、request-conflicts、指令衝突、plan-adherence、writing-skills、怎麼寫 skill、description 觸發、Use when、Skill Discovery Optimization、RED-GREEN-REFACTOR、pressure scenario、壓力測試、rationalization table、藉口對照表、red flags、紅旗表、bump-version、版本漂移、drift detection、單一事實來源、single source of truth、AGENTS.md、CLAUDE.md、GEMINI.md、~/.agents/skills、~/.claude/skills、Claude Code plugin、Codex plugin、multi_agent、Cursor、Gemini CLI、Copilot CLI、OpenCode、MIT 授權
