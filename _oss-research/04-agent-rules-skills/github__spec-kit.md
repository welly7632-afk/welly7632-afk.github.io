# github/spec-kit — GitHub 官方「規格驅動開發」工具包：一份「專案憲法」管住 40 多種 AI 工具，外加一個唯讀的跨文件一致性稽核指令
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：38c40ae
> GitHub：https://github.com/github/spec-kit｜⭐ 147114｜授權：MIT｜主要語言：Python｜最近更新：2026-11-04

（以下 permalink 都固定在 commit `38c40ae25a4f1c025e1a2dd6a450095d17acab47`，為了好讀，下文用 `B/` 代表 `https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/`，點擊時請自行補上；每個連結第一次出現時會寫完整網址。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** Spec Kit 是 GitHub 官方出的 Python CLI（指令名稱 `specify`），它把「先寫規格 → 再寫計畫 → 再拆任務 → 再實作」這套流程，做成一組 Markdown 指令範本（`/speckit.constitution`、`/speckit.specify`、`/speckit.plan`、`/speckit.tasks`、`/speckit.analyze`、`/speckit.implement`…），再自動安裝成 Claude Code、Codex、Cursor、Copilot 等 40 多種 AI 工具各自看得懂的格式（Claude 和 Codex 都是 `SKILL.md` 技能）。

**對你（倉儲系統＋多 AI 協作很亂）最有用的三件事：**

1. **「專案憲法」（constitution）＝你要的「共用規則」單一事實來源。** 一份 `.specify/memory/constitution.md`，每條原則用 MUST／SHOULD 寫、有版本號（SemVer）、批准日、最後修訂日，每次修改都在檔頭留一段「Sync Impact Report」（改了什麼、版本從幾號到幾號、哪些檔案要跟著改）。這個格式可以直接借來當你「GPT 與 Claude 共讀的總規則」。
2. **`/speckit.analyze`＝現成的「巡讀稽核」提示詞。** 它是唯讀的（明文禁止改檔），把文件分成 6 類問題來抓：重複（Duplication）、模糊（Ambiguity）、規格不足（Underspecification）、違反憲法（Constitution Alignment）、覆蓋缺口（Coverage Gaps）、不一致（Inconsistency，含「同一個東西在不同檔案叫不同名字」的術語漂移），每個問題給 CRITICAL／HIGH／MEDIUM／LOW 嚴重度，輸出成固定表格。這幾乎就是你說的「看哪個 AI 漏東西、哪邊重複、哪邊新舊版本衝突」——只是它原本只比對 spec/plan/tasks 三份文件，你要改寫成比對「整個專案的規則檔＋交接紀錄＋程式碼」。
3. **一份規則同時餵給 Claude 和 Codex 的做法。** 它的 `agent-context` 擴充用「`<!-- SPECKIT START -->` … `<!-- SPECKIT END -->`」標記，只改標記之間的區塊，並可設定 `context_files: [AGENTS.md, CLAUDE.md]` 一次同步兩個檔。這正好解決「CLAUDE.md 跟 AGENTS.md 各寫各的、越來越不一樣」的問題。

**不適合的地方（先講清楚）：** Spec Kit 是給「開發新功能」用的流程工具，不是排程器，**本身沒有「每天自動巡讀整個專案」的功能**；`analyze` 也只看「單一功能資料夾」的三份文件。巡讀要你自己用 Claude Code 排程、GitHub Actions cron 或電腦排程去觸發（第 11 節有具體做法）。另外它沒有「角色（PM／工程師／QA）」的設計，它的分工是「指令＝階段」，不是「AI＝角色」。

---

## 2. 授權白話

- **授權：MIT**（[LICENSE](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/LICENSE)，版權人 GitHub, Inc.）。`pyproject.toml` 也標 MIT。
- **個人使用：** 完全自由，可以改、可以把 `analyze.md`、`constitution-template.md` 整段抄進你自己的專案。
- **公司商用：** 也可以，包含拿去做成你自己的內部工具或賣的產品；唯一義務是「散布你修改後的版本時，保留原本的著作權聲明與 MIT 授權文字」。只是自己公司內部用、沒有對外散布，實務上幾乎沒有負擔。
- **有沒有付費版／閉源功能：** 在 repo 裡沒有看到付費版或閉源模組的痕跡（未發現任何授權金鑰檢查）。但要注意：
  - **社群擴充（extensions）是第三方的**，授權各自不同，catalog 裡每一筆都標 `"verified": false`（例如 [memorylint 條目](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/catalog.community.json#L3900-L3933)），要用前個別看授權與程式碼。
  - Spec Kit 本身免費，但它驅動的 AI 工具（Claude Code、Codex）要付各家的訂閱或 API 費用。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | Python ≥ 3.11（README 寫 Python 3.11+）。依賴（`pyproject.toml` 的 `dependencies`）：typer、click、rich、readchar、pyyaml、packaging、pathspec、json5、mcp（2.x）、pydantic（2.x）、lark，共 11 個 |
| 前端 | 無。純命令列工具；文件網站用 docfx（`docs/docfx.json`） |
| 後端／伺服器 | 無常駐伺服器。另有實驗性的 `specify mcp`（只走 stdio 的 MCP 伺服器，所有工具唯讀、不連網，見 [docs/reference/mcp.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/reference/mcp.md#L1-L30)） |
| 資料庫 | 無。所有狀態都是專案裡的 Markdown／YAML／JSON 檔（`.specify/` 資料夾、`specs/` 資料夾） |
| 部署 | 安裝在你自己的電腦：`uv tool install specify-cli`，然後 `specify init my-project --integration claude`（README 第 80–81 行示範的是 copilot）。腳本有 bash、PowerShell、Python 三種版本 |
| 硬體／GPU | 不需要 GPU，一般筆電即可 |
| API Key | Spec Kit 本身不呼叫任何 AI API、不需要 Key。它只是產生指令檔給你的 AI 工具用。費用來自你的 AI 工具：Claude Code（Claude 訂閱或 API）、Codex（ChatGPT 訂閱或 OpenAI API）。若用它的 workflow 功能「自動呼叫 AI CLI」，就是在背景跑 `claude`／`codex exec`，一樣吃你的額度 |

**怎麼數的：** `src/` 底下 `.py` 檔用 `find src -name '*.py' | wc -l` 數得 293 個、`wc -l` 合計約 79,194 行；`tests/` 底下 `.py` 檔從 `git ls-tree` 清單數得 364 個；整個 repo 檔案數 1,014 個。

---

## 4. 程式架構地圖

```
spec-kit/
├── AGENTS.md                      ← repo 自己給 AI 的規則（短、只放「去讀哪份設計文件」的指引）
├── .specify/memory/constitution.md← repo 自己的憲法（真實範例，214 行，含 Sync Impact Report）
├── spec-driven.md                 ← SDD 方法論長文
├── templates/                     ← ★核心：所有 AI 指令與文件範本（純 Markdown）
│   ├── commands/                  ← 9 個核心指令：analyze, checklist, clarify, constitution,
│   │                                 converge, implement, plan, specify, tasks
│   ├── constitution-template.md   ← 憲法空白範本（50 行）
│   ├── spec-template.md / plan-template.md / tasks-template.md / checklist-template.md
├── scripts/{bash,powershell,python}/ ← 指令會呼叫的小腳本（找功能資料夾、檢查前置檔案、解析範本）
├── src/specify_cli/               ← CLI 本體（Python）
│   ├── integrations/              ← 每個 AI 工具一個子資料夾（claude/, codex/, cursor_agent/…）
│   │   └── base.py                ← Markdown／TOML／YAML／Skills 四種輸出格式的基底類別
│   ├── extensions/                ← 擴充系統（含 HookExecutor：before_/after_ 鉤子）
│   ├── presets/                   ← 預設組（覆寫範本、分層優先順序）
│   ├── workflows/                 ← 工作流程引擎（command/prompt/shell/gate/if/while/fan-out…）
│   ├── events/                    ← 把 session_start / pre_tool_use / stop 等事件寫進
│   │                                 .claude/settings.json 或 .codex/config.toml
│   ├── bundles/                   ← 把擴充＋工作流程打包成一包安裝
│   └── mcp_server/                ← 實驗性 MCP 伺服器
├── extensions/                    ← 官方內建擴充：agent-context, assess, bug, git, github, selftest, template
│   └── catalog.community.json     ← 社群擴充清單（186 筆）
├── presets/                       ← 官方預設組：constitution-sync, lean, scaffold, self-test
├── workflows/                     ← 官方工作流程：speckit（完整 SDD）、bugfix、assess
├── bundles/                       ← assess、bugfix 兩個組合包
├── design/                        ← 架構設計文件（integration.md、cli.md、mcp.md…）
├── docs/                          ← 使用文件（integrations/ 底下每個 AI 工具一頁）
└── .github/
    ├── skills/code-review/SKILL.md← repo 自用技能範例
    └── workflows/*.md             ← GitHub Agentic Workflows（bug-assess、pr-assess…，標籤觸發）
```

**數字怎麼來的：** 核心指令 9 個＝`templates/commands/` 檔案數，且與 `src/specify_cli/extensions/__init__.py` 第 59–71 行的 `_FALLBACK_CORE_COMMAND_NAMES` 一致；AI 整合子資料夾用 `ls -d src/specify_cli/integrations/*/` 排除 `catalog` 數得 43 個（含 `generic` 與 `none` 兩個非特定工具的選項，所以實際對應具體 AI 工具的是 41 個）；社群擴充 186 筆是用 Python 讀 `extensions/catalog.community.json` 的 `extensions` 物件長度。

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 專案憲法（建立／修訂） | [templates/commands/constitution.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L75-L146) | 讀範本找出 `[ALL_CAPS]` 佔位符 → 填值 → 版本號按 SemVer 升級（MAJOR＝刪除或重新定義原則；MINOR＝新增原則；PATCH＝措辭修正，L100-L104）→ 在檔頭寫 Sync Impact Report（L112-L119）→ 驗證：沒有殘留佔位符、日期用 YYYY-MM-DD、原則要「可檢驗」不要模糊字（L121-L125）。另有「Scope Guard」（L21-L38）：如果使用者在修憲時順便要求寫程式，**禁止執行**，只能列成「Next Actions」 |
| 憲法空白範本 | [templates/constitution-template.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/constitution-template.md#L1-L50) | 5 條核心原則＋2 個自訂章節＋Governance（治理）＋最後一行 `**Version** | **Ratified** | **Last Amended**` |
| 跨文件一致性稽核 | [templates/commands/analyze.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L52-L251) | 嚴格唯讀（L58）；憲法衝突一律 CRITICAL（L60）；分段載入降低 token（L75-L104）；建需求清單、任務對照（L106-L113）；6 類偵測（L115-L151）；嚴重度規則（L153-L160）；報告格式（L162-L190）；最多 50 筆、重跑要得到一樣的 ID（L117、L243） |
| 收斂（找出還沒做完的） | [templates/commands/converge.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/converge.md#L57-L88) | 實作後比對程式碼與規格，把「還沒做到的」**只用追加**的方式寫成新任務（`## Phase N: Convergence`），禁止改舊任務、禁止重新編號；已全部完成時檔案要「一個 byte 都不能動」 |
| 任務清單 | [templates/tasks-template.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/tasks-template.md#L16-L18) | 格式 `- [ ] T001 [P] [US1] 描述＋檔案路徑`；`[P]`＝可平行、`[US1]`＝屬於哪個使用者故事；`implement` 完成時要改成 `[X]`（[implement.md L169](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/implement.md#L169)） |
| 實作前關卡 | [templates/commands/implement.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/implement.md#L56-L87) | 掃描 `checklists/` 的勾選狀態，有未勾項目就停下來問人是否繼續 |
| 需求品質檢查表 | [templates/commands/checklist.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/checklist.md#L9-L30) | 「英文的單元測試」：檢查表是在測「規格寫得好不好」，不是測程式能不能跑 |
| 釐清問題 | [templates/commands/clarify.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/clarify.md#L129-L138) | 一次最多問 5 題，選擇題或 5 個字以內短答，依「影響 × 不確定度」排序 |
| 規格中的不確定標記 | [templates/commands/specify.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/specify.md#L128-L132) | `[NEEDS CLARIFICATION: 問題]`，最多 3 個，逼 AI 不要自己亂猜 |
| 計畫的憲法關卡 | [templates/plan-template.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/plan-template.md#L39-L43) | `## Constitution Check` 在研究前必須通過、設計後再檢查一次；違規要在 `## Complexity Tracking`（L106-L108）寫理由 |
| 產生 Claude／Codex 技能 | [src/specify_cli/integrations/base.py](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/integrations/base.py#L1730-L1745)（`SkillsIntegration`）＋[L1979-L1989](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/integrations/base.py#L1979-L1989) | 把每個 `templates/commands/*.md` 轉成 `speckit-<名稱>/SKILL.md`，frontmatter 固定有 `name`、`description`、`compatibility`、`metadata.author`、`metadata.source`；遵循 agentskills.io 規格 |
| Claude 專屬處理 | [integrations/claude/__init__.py](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/integrations/claude/__init__.py#L14-L67) | 寫到 `.claude/skills/`；加 `argument-hint`、`user-invocable`、`disable-model-invocation`（[L270-L299](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/integrations/claude/__init__.py#L270-L299)）；事件寫進 `.claude/settings.json` |
| Codex 專屬處理 | [integrations/codex/__init__.py](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/integrations/codex/__init__.py#L16-L67) | 寫到 `.agents/skills/`；非互動執行用 `codex exec "prompt" --model … --json`；事件寫進 `.codex/config.toml` |
| 共用規則檔同步 | [extensions/agent-context/scripts/python/update_agent_context.py](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/agent-context/scripts/python/update_agent_context.py#L259-L296) | `_upsert_section`：找到起訖標記就只換中間，找不到就附加；`_collect_context_files`（L45-L109）支援多檔、拒絕絕對路徑與 `..` |
| 工作流程引擎 | [workflows/speckit/workflow.yml](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/workflows/speckit/workflow.yml#L39-L74) | specify → **人工關卡** → plan → **人工關卡** → tasks → implement；每一步可指定 `integration:`（哪個 AI） |
| 擴充鉤子 | `src/specify_cli/extensions/__init__.py` 的 `HookExecutor`（第 5577 行起） | 每個核心指令開頭／結尾都會讀 `.specify/extensions.yml` 的 `hooks.before_xxx`／`after_xxx`，`optional: false` 的鉤子強制執行 |
| 執行期事件 | [src/specify_cli/events/__init__.py](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/events/__init__.py#L77-L85) | 6 個標準事件：`session_start`、`pre_tool_use`、`post_tool_use`、`session_end`、`user_prompt_submit`、`stop`，翻譯成各 AI 工具的原生 hook |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 一致性稽核提示詞 | [templates/commands/analyze.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md) | 無（純 Markdown） | 低 | 刪掉 hooks 段落（L17-L50、L204-L234）與 `{SCRIPT}`，把「spec/plan/tasks」換成你的檔案清單（AGENTS.md、CLAUDE.md、docs/、handoff 紀錄、程式碼），存成 `.claude/skills/patrol/SKILL.md` 和 `.agents/skills/patrol/SKILL.md` |
| 憲法範本＋修憲流程 | [templates/constitution-template.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/constitution-template.md)、[templates/commands/constitution.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L96-L132) | 無 | 低 | 當成 `docs/RULES.md`（或 `.specify/memory/constitution.md`），AGENTS.md／CLAUDE.md 只寫「先讀這份」 |
| 真實憲法範例 | [.specify/memory/constitution.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/.specify/memory/constitution.md#L1-L32) | 無 | 低 | 參考 Sync Impact Report 寫法、以及 Governance 段（[L194-L214](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/.specify/memory/constitution.md#L194-L214)） |
| 收斂（只追加不改寫） | [templates/commands/converge.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/converge.md#L57-L88) | 無 | 低 | 巡讀後把「漏掉的事」追加到 `TASKS.md`，不讓 AI 改別人的舊紀錄 |
| 任務格式 | [templates/tasks-template.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/tasks-template.md#L16-L54) | 無 | 低 | 一個共用 `TASKS.md`，每列 `- [ ] T012 [P] [倉儲] 描述 (檔案)`，GPT／Claude 都用同一格式勾選 |
| 規則檔區塊同步 | [extensions/agent-context/](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/agent-context/agent-context-config.yml)＋[update_agent_context.py](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/agent-context/scripts/python/update_agent_context.py) | Python 3＋PyYAML | 低～中 | 368 行，可改寫成約 50 行的 Node.js：讀 `RULES-SHARED.md`，塞進 AGENTS.md 與 CLAUDE.md 的 `<!-- SHARED START/END -->` 之間 |
| 各 AI 規則檔預設路徑表 | [agent-context-defaults.json](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/agent-context/agent-context-defaults.json) | 無 | 低 | 一張表告訴你：claude→CLAUDE.md、codex→AGENTS.md、cursor→`.cursor/rules/*.mdc`、copilot→`.github/copilot-instructions.md`、gemini→GEMINI.md… |
| SKILL.md 產生器 | [base.py L1979-L1989](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/integrations/base.py#L1979-L1989) | Python、PyYAML | 中 | 概念：同一份指令原稿 → 同時輸出到 `.claude/skills/` 與 `.agents/skills/`，避免兩邊各改各的 |
| 人工關卡工作流程 | [workflows/speckit/workflow.yml](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/workflows/speckit/workflow.yml) | 需要整個 specify CLI | 高 | 要用就整套安裝；只想借概念就照抄「每個 AI 階段後面一個 gate」 |
| 標籤觸發的 AI 稽核（GitHub） | [.github/workflows/pr-assess.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/.github/workflows/pr-assess.md#L1-L52) | GitHub Agentic Workflows（gh-aw）、Copilot 引擎 | 中 | 「PR 描述 vs 實際改動」比對；frontmatter 示範了最小權限（唯讀）＋只能留一則留言、只能加指定標籤 |
| 技能寫法範例 | [.github/skills/code-review/SKILL.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/.github/skills/code-review/SKILL.md#L1-L5) | 無 | 低 | description 範式：「做什麼＋Use when…＋Do not use for…」 |

---

## 7. AI／Claude 整合

- **用哪些模型：** Spec Kit 自己**不呼叫任何模型**，也沒有內建 prompt 去打 API。它只產生指令／技能檔，由你選的 AI 工具（Claude Code、Codex CLI 等）執行。workflow 的 `command`／`prompt` 步驟可以指定 `integration: claude` 和 `model:`（文件範例寫 `claude-sonnet-4-20250514`，見 [docs/workflows/steps.md L24-L50](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/workflows/steps.md#L24-L50)），背後是直接執行該 AI 的 CLI。
- **Prompt 放在哪：** 全部在 `templates/commands/*.md`（9 個核心指令），擴充的 prompt 在 `extensions/*/commands/*.md`。
- **Skills：** Claude 與 Codex 都是**原生**支援的「技能模式」：
  - Claude：`.claude/skills/speckit-<指令>/SKILL.md`，在 Claude 裡用 `/speckit-specify` 呼叫（[docs/integrations/claude.md L20-L40](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/integrations/claude.md#L20-L40)）。可加 `--integration-options="--no-model-invocation"` 讓核心技能只能手動叫，不佔 Claude 的技能清單額度。
  - Codex：`.agents/skills/speckit-<指令>/SKILL.md`，在 Codex 裡用 `$speckit-specify` 呼叫（[docs/integrations/codex.md L20-L26](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/integrations/codex.md#L20-L26)）。
  - 兩者都標記為 `multi_install_safe = True`，**同一個專案可以同時裝 Claude 和 Codex**（`specify integration install codex`），預設整合記在 `.specify/integration.json`（[docs/integrations/cli.md L491-L515](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/integrations/cli.md#L491-L515)）。
- **MCP：** 有，`specify mcp`（實驗性、只有 stdio、4 個唯讀工具：版本、artifact 清單、artifact 組成、workflow 清單）。這不是給 AI 寫東西用的，是給 AI 查「這個專案裝了哪些指令、範本從哪一層來」。
- **Hooks：** Claude 的 `SessionStart`／`PreToolUse`／`PostToolUse`／`Stop` 等 6 種事件，由擴充在 `extension.yml` 宣告 `events:` 後，Spec Kit 自動寫進 `.claude/settings.json`（[docs/extensions/api.md L791-L816](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/extensions/api.md#L791-L816)）。注意：事件執行的是擴充的**腳本**，不是把 Markdown 送給 AI。
- **能不能換成 Claude：** 不用換，Claude 是第一級支援（`claude` 是內建整合）。結論：**原生**。

---

## 8. 擴充方式與 API

1. **Extensions（擴充）**：`extension.yml` 宣告 `provides.commands`、`hooks`（例如 `after_plan`）、`events`。官方範本在 `extensions/template/`。安裝：`specify extension add <id>`，社群清單 186 筆。
2. **Presets（預設組）**：覆寫任何範本或指令，有分層優先順序（[docs/presets/overview.md L48-L59](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/presets/overview.md#L48-L59)）：
   最高＝專案自己的 `.specify/templates/overrides/` → 已啟用的 presets（數字小的優先）→ extensions → Spec Kit 核心預設。可用 `prepend`／`append`／`wrap` 疊加，不必整份覆蓋（例如 `constitution-sync` 用 `wrap` 把核心指令包在 `{CORE_TEMPLATE}` 裡再追加一段）。
3. **Workflows（工作流程）**：YAML，有 14 種步驟（command、prompt、shell、github、init、slot、gate、if、switch、while、do-while、fan-out、fan-in、workflow，見 [docs/workflows/steps.md L5-L22](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/workflows/steps.md#L5-L22)）。`specify workflow run <id> --input …`。可中斷後 resume。
4. **Bundles（組合包）**：一次裝「擴充＋工作流程」，例如 `specify bundle install bugfix`。
5. **Integrations（新增 AI 工具）**：繼承 `MarkdownIntegration`／`TomlIntegration`／`YamlIntegration`／`SkillsIntegration` 其中一個，設 `key`、`config`、`registrar_config`，註冊到 `INTEGRATION_REGISTRY`。
6. **MCP**：見第 7 節。

---

## 9. 程式品質與風險

- **維護狀況：** 非常活躍。最新 commit 2026-11-04；CHANGELOG 最新版 1.3.0（2026-11-03），前面 1.2.6（11-02）、1.2.5（10-28）、1.2.4（10-27）、1.2.3（10-22）——一週好幾版。GitHub 官方團隊維護，`newsletters/` 每月一期。
- **測試：** `tests/` 有 364 個 `.py` 檔；repo 自己的憲法寫明 CI 在 ubuntu＋windows × Python 3.11/3.12/3.13 矩陣跑 pytest，加上 ruff、markdownlint、CodeQL、ShellCheck（`.github/workflows/test.yml`、`lint.yml`、`codeql.yml` 存在；我沒有逐一打開 test.yml 驗證矩陣內容）。
- **資安／隱私：**
  - Spec Kit 本身不連 AI、不上傳程式碼；MCP 伺服器文件寫明「唯讀、不連網」。
  - **遙測：** 在 `src/` 搜尋 `telemetry|analytics|posthog`，只在 events 模組的註解出現 telemetry 一字（指「使用者自己的 handler 可能做遙測」），沒有找到 Spec Kit 自己回傳資料的程式碼。結論：未發現遙測。
  - **workflow 的 `shell` 步驟用你的權限執行、沒有沙箱**（docs/workflows/steps.md 第 224 行自己寫的警告）。社群擴充全部 `verified: false`，裝之前要看過它的腳本。
- **已知的坑：**
  - **版本變很快**：例如 `constitution` 指令在 0.14.4 之後**不再**自動把憲法同步進其他範本，要裝 `constitution-sync` preset 才恢復（[presets/constitution-sync/README.md L1-L29](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/presets/constitution-sync/README.md#L1-L29)）。網路上舊教學很多已過時。
  - **analyze 報告很長**：Claude 整合的註解說 `/speckit-analyze` 會回 300–500 行報告，曾因 fork 子代理累積上下文導致對話卡死，所以已取消 fork（[claude/__init__.py L25-L36](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/integrations/claude/__init__.py#L25-L36)）。你做每日巡讀時，建議讓巡讀結果寫進檔案、對話裡只回摘要。
  - **agent-context 是選裝**：`specify init` 不會動你的 CLAUDE.md／AGENTS.md，要自己 `specify extension add agent-context`。
  - 它偏重「新功能開發流程」，對你這種「已經在跑的倉儲系統」，要看 `docs/how-to/existing-projects.md` 的導入方式（檔案存在，本次未細讀）。
  - 會在專案裡新增 `.specify/`、`.claude/skills/speckit-*`、`.agents/skills/speckit-*` 等資料夾，若你部署 Firebase Hosting 時直接上傳整個資料夾，要在 `firebase.json` 的 `ignore` 排除它們。

---

## 10. 跟其他專案組合的建議

- **Spec Kit（流程＋稽核格式）＋ 一個「規則同步」工具（如 .ruler 類）＋ 你自己的巡讀技能**：Spec Kit 提供「憲法格式」和「analyze 稽核格式」；同步工具負責把一份共用規則分發到 AGENTS.md／CLAUDE.md；巡讀技能是你把 analyze 改寫成「全專案版」。
- **社群擴充裡跟你需求最接近的（都在 [extensions/catalog.community.json](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/catalog.community.json) 裡，未驗證、未讀原始碼，只是清單描述）：**
  - `memorylint`（L3900）：「稽核 agent 記憶檔的邊界、現實、衝突、冗餘漂移」——幾乎就是「規則檔巡讀」，最值得下一步去看。
  - `multi-model-review`（L3934）：跨模型交接（Codex／Gemini／Claude）做規格撰寫、實作分派、審查。
  - `verify-tasks`（L6818）：抓「打勾了但其實沒做」的假完成。
  - `sync`（L6078）、`reconcile`（L4922）：規格與程式碼漂移偵測與修正。
  - `docguard`（L1864）：文件生命週期登記、漂移驗證、安全封存。
  - `agent-assign`（L151）：把任務分派給不同的 Claude Code 子代理。
  - `orchestrator`（L4331）：跨功能追蹤狀態、偵測平行規格的衝突。
  - `speckit-superpowers-bridge`（L5739）：連接 obra/superpowers 技能庫，描述寫「已驗證 Codex 與 Claude Code」。
- **跟你的試算表／ERP／影片專案的關係**：Spec Kit 不提供任何業務功能，它是「蓋其他東西的施工流程」。建議用法是：以後你要把 A＋B＋C 組合成自己的工具時，先用 `/speckit.constitution` 寫好你的總規則（例如「全部用純 JavaScript」「Firebase 規則不能放寬」「價格計算必須有測試」），再用 specify → plan → tasks → analyze → implement 一步步叫 Claude／Codex 做，中間用 analyze 抓矛盾。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫 — **有**
- **檔案結構：** 共用規則＝`.specify/memory/constitution.md`（[範本](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/constitution-template.md)）；AI 工具的規則檔（CLAUDE.md、AGENTS.md…）只放「受管區塊」，由 [agent-context 擴充](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/agent-context/README.md#L1-L16) 維護。repo 自己的 [AGENTS.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/AGENTS.md#L1-L76) 是很好的「短規則檔」範例：76 行，每段都是「做 X 之前，先讀 Y 文件」，不把細節塞進來。
- **分層：** 範本／指令有四層優先順序（專案 overrides > presets > extensions > 核心）。但「全域（家目錄）／專案／子資料夾」這種**規則檔**分層，Spec Kit **沒有**自己的設計，交給各 AI 工具原生機制。
- **優先順序：** 憲法 Governance 段寫「本憲法在衝突時優先於臨時慣例」，analyze 把違憲列為 CRITICAL，且「要改的是 spec/plan/tasks，不是稀釋原則」（[analyze.md L60](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L60)）。
- **讓 GPT（Codex）和 Claude 讀同一份規則：** 兩條路都有——(a) 兩者的指令都從同一份 `templates/commands/*.md` 產生（只是輸出到不同資料夾）；(b) [agent-context-config.yml](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/agent-context/agent-context-config.yml#L8-L24) 設 `context_files: [AGENTS.md, CLAUDE.md]` 同步兩檔。各工具預設規則檔路徑見 [agent-context-defaults.json](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/agent-context/agent-context-defaults.json)（codex→AGENTS.md、claude→CLAUDE.md）。

### 11.2 角色設計 — **沒有（以「階段」取代「角色」）**
- Spec Kit 沒有定義「PM／工程師／QA」這類 AI 角色或 persona。它的分工是**指令＝階段**：constitution（立法）→ specify（寫需求）→ clarify（釐清）→ plan（設計）→ tasks（拆工）→ analyze（稽核，唯讀）→ implement（施工）→ converge（驗收補漏）→ checklist（需求品質檢查）。
- **交接（handoff）有**：每個指令 frontmatter 有 `handoffs:`，例如 tasks 完成後建議交給 analyze 或 implement（[tasks.md L1-L11](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/tasks.md#L1-L11)）、constitution 交給 specify（[constitution.md L3-L6](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L3-L6)）。
- **誰向誰負責**：靠 workflow 的 `gate` 人工關卡——AI 做完一步，人按 approve／reject（[workflow.yml L46-L62](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/workflows/speckit/workflow.yml#L46-L62)）。repo 的 [docs/guides/agentic-sdlc.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/guides/agentic-sdlc.md#L31-L55) 把工作分成「一般自動化」「AI 自動化」「人工」三種，並強調「交接是人的決定」。
- **不同 AI 擔任不同階段**：可行，workflow 每一步可寫不同 `integration:`（例如 specify 用 claude、review 用 codex）。官方 workflow 沒示範混用，是我依文件推論的用法。
- 角色化的做法要看社群擴充（`agent-assign`、`squad`、`multi-model-review`），未驗證。

### 11.3 防漏 — **有**
- **任務追蹤：** `tasks.md` 勾選清單，ID＋檔案路徑＋所屬故事（[tasks-template.md L16-L54](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/tasks-template.md#L16-L54)）；`github` 擴充可把任務轉成 GitHub Issues（`speckit.github.taskstoissues`）。
- **完成前驗證：** implement 開工前掃 checklists（[implement.md L56-L87](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/implement.md#L56-L87)）；analyze 的「Coverage Gaps」抓「沒有任務的需求」與「沒有需求的任務」；converge 實作後再比對一次，把沒做完的**追加**成新任務（[converge.md L73-L83](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/converge.md#L73-L83)）。
- **交接紀錄：** 有限。每個功能的 spec/plan/tasks 留在 `specs/<功能>/`，憲法每次修改留 Sync Impact Report；但**沒有**專門的「AI 交接日誌」檔。

### 11.4 防重複 — **有（限文件內容）**
- analyze 的「A. Duplication Detection」：找出近乎重複的需求，標出寫得較差的那個建議合併（[analyze.md L119-L122](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L119-L122)）；重複或衝突的需求列為 HIGH。
- 註冊表層級：repo 憲法要求「重複的 key 要大聲失敗，不能默默覆蓋」（[.specify/memory/constitution.md L58-L60](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/.specify/memory/constitution.md#L58-L60)）。
- **重複規則／重複角色**的偵測：核心**沒有**；社群 `memorylint` 宣稱有「redundancy drift」稽核（未驗證）。

### 11.5 防新舊版本衝突 — **有**
- **版本標記：** 憲法有 SemVer 版本＋Ratified＋Last Amended 日期，每次修改要說明升級理由（[constitution.md L96-L104](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L96-L104)）。
- **變更紀錄：** Sync Impact Report（舊版→新版、改名的原則、新增／刪除章節、待辦）（[L112-L119](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L112-L119)）。
- **單一事實來源：** 官方明講「預設模式下，各指令每次執行都重新讀活的憲法，所以沒有東西需要同步、也就不會漂移」；反之「把規則複製到其他檔案（materialize）就會漂移」（[constitution-sync README L19-L29、L69-L96](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/presets/constitution-sync/README.md#L69-L96)）。**這是你最該學的觀念：規則只寫一份，其他檔案只放指標。**
- **舊檔保護：** 解除安裝時，只刪除 SHA-256 雜湊與原始相同（使用者沒改過）的檔案；改過的保留（docs/integrations/cli.md L510-L515）。constitution-sync 也只覆蓋「雜湊證明是未修改生成檔」的憲法。
- **變更提案／封存：** [docs/how-to/evolving-specs.md L60-L124](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/docs/how-to/evolving-specs.md#L60-L124) 提出三種模式：Flow-Forward（舊功能資料夾凍結當歷史，新改動開新資料夾）、Living Spec（spec.md 是合約，先改 spec 再調其他檔）、Flow-Back（實作中的發現回寫到文件）。每種最後都跑 `/speckit.analyze`。核心沒有 archive 指令；社群有 `archive`（L619）、`openspec` 類擴充。
- **過期偵測（staleness／drift）：** analyze 的「Terminology drift」與「Conflicting requirements」；GitHub 層面有 [stale.yml](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/.github/workflows/stale.yml#L1-L22)（每天 UTC 0 點把 60 天沒動的 issue／PR 標成 stale，再 30 天關閉）——但這是 repo 維護用，不是給你的專案。

### 11.6 定期巡檢 — **部分有（零件有，排程沒有）**
- **排程：** Spec Kit 本身**沒有**每日巡讀。repo 唯一的 cron 是上面的 stale.yml。
- **觸發機制可借用：** (1) 執行期事件 `session_start`——每次開 Claude／Codex 對話就執行指定腳本（[events/__init__.py L77-L85](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/events/__init__.py#L77-L85)）；(2) 擴充 hooks `after_plan`、`after_implement` 等；(3) GitHub Agentic Workflow 的標籤觸發稽核（[pr-assess.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/.github/workflows/pr-assess.md#L1-L52)，可改成 `on: schedule`，這是我的推論）。
- **報告格式（analyze 原版，[L162-L198](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L162-L198)）簡短範例：**

```markdown
## Specification Analysis Report
| ID | Category | Severity | Location(s) | Summary | Recommendation |
|----|----------|----------|-------------|---------|----------------|
| A1 | Duplication | HIGH | spec.md:L120-134 | Two similar requirements ... | Merge phrasing; keep clearer version |

**Coverage Summary Table:** | Requirement Key | Has Task? | Task IDs | Notes |
**Metrics:** Total Requirements / Total Tasks / Coverage % / Ambiguity Count / Duplication Count / Critical Issues Count
**Next Actions:** CRITICAL 先解決再 implement；只有 LOW/MEDIUM 可繼續
```

- **改寫成你的「每日巡讀」建議版（我的建議，不是 Spec Kit 原有）：**

```markdown
## 每日巡讀報告 2026-11-05（巡讀者：Claude／唯讀）
| ID | 類別 | 嚴重度 | 位置 | 摘要 | 建議 |
|----|------|--------|------|------|------|
| D1 | 重複 | HIGH | AGENTS.md:L40 / CLAUDE.md:L12 | 兩邊都寫庫存扣帳規則，且數字不同 | 只留 docs/RULES.md，兩檔改成指標 |
| V1 | 新舊衝突 | CRITICAL | docs/RULES.md v1.3 vs CLAUDE.md（引用 v1.1） | Claude 還在照舊版「負庫存允許」 | 更新指標、補 Sync Impact Report |
| G1 | 遺漏 | HIGH | TASKS.md T031 | 標 [X] 但 inventory.js 找不到對應函式 | 追加任務 T045，不改 T031 |
| T1 | 術語漂移 | MEDIUM | stock.js「庫存」/ report.js「存貨」 | 同一欄位兩種叫法 | 在 RULES.md 詞彙表定案 |
**統計：** 規則檔 4 份／任務 52 項／完成率 81%／重複 2／衝突 1／CRITICAL 1
**下一步：** CRITICAL 未解前，GPT 與 Claude 都不准動 inventory.js
```

  觸發方式可以三選一：Claude Code 排程任務（每天早上跑 `/patrol`）、GitHub Actions `schedule: cron`、或電腦排程執行 `claude -p "/patrol"` / `codex exec "$patrol"`（Spec Kit 的 Codex 整合就是用 `codex exec` 非互動執行，見 codex/__init__.py L47-L67）。

### 11.7 Skill 寫法 — **有**
- **SKILL.md 格式：** 由 [base.py L1979-L1989](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/src/specify_cli/integrations/base.py#L1979-L1989) 產生：

```yaml
---
name: "speckit-analyze"
description: "Perform a non-destructive cross-artifact consistency and quality analysis ..."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/analyze.md"
---
```
  Claude 版另外注入 `user-invocable`、`disable-model-invocation`、`argument-hint`（例如 analyze 的提示是「Optional focus areas for analysis」）。
- **description 怎麼寫才會被正確觸發：** 參考 repo 自用的 [code-review SKILL.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/.github/skills/code-review/SKILL.md#L1-L5)：「做什麼（Reviews … for …）＋ Use when reviewing a diff or pull request ＋ Do not use for implementing changes …」——**寫清楚何時用、何時不用**。另一個重點：Claude 的技能描述會佔用技能清單額度，技能太多時用 `disable-model-invocation: true` 把「只該手動叫」的技能藏起來（docs/integrations/claude.md L26-L40）。
- **資料夾結構：** `<工具技能資料夾>/<技能名>/SKILL.md`；Claude＝`.claude/skills/`，Codex＝`.agents/skills/`。
- **腳本放哪：** Spec Kit 把腳本放在專案的 `.specify/scripts/{bash,powershell,python}/`（擴充則放 `.specify/extensions/<id>/scripts/`），指令 frontmatter 的 `scripts: sh/ps/py` 指定要跑哪個，內文用 `{SCRIPT}` 佔位。

### 11.8 支援哪些工具與安裝 — **有**
- 內建整合 43 個（數法見第 4 節），包含 Claude Code（`claude`）、Codex CLI（`codex`）、Cursor（`cursor-agent`）、GitHub Copilot（`copilot`）、Gemini（`gemini`），以及 amp、cline、devin、goose、junie、kilocode、kiro-cli、opencode、qwen、trae、zed 等。另有 `generic`（自訂資料夾）與 `none`。（附註：agent-context 預設表裡有 `windsurf`，但 `src/specify_cli/integrations/` 底下沒有 windsurf 資料夾，是否仍支援 Windsurf：未確認。）
- 安裝：`uv tool install specify-cli` → `specify init <專案> --integration claude` → 現有專案再加 Codex：`specify integration install codex`。

### 11.9 可以直接借用到你「基礎架構」的檔案或段落
1. `templates/constitution-template.md`（整份）→ 你的 `docs/RULES.md` 骨架。
2. `templates/commands/constitution.md` L96-L132（版本規則＋Sync Impact Report＋驗證清單）→ 你的「修改規則 SOP」。
3. `.specify/memory/constitution.md` L1-L32、L194-L214 → Sync Impact Report 與 Governance 實例。
4. `templates/commands/analyze.md` L52-L198、L236-L251 → 你的 `patrol` 巡讀技能主體（改檔案清單即可）。
5. `templates/commands/converge.md` L57-L88 → 「巡讀發現遺漏時只追加、不改舊任務」規則。
6. `templates/tasks-template.md` L16-L54 → 共用 `TASKS.md` 格式。
7. `templates/commands/clarify.md` L129-L138、`specify.md` L128-L132 → 「AI 不確定就標 `[NEEDS CLARIFICATION]`，最多問 5 題」規則。
8. `extensions/agent-context/agent-context-config.yml` ＋ `update_agent_context.py` 的 `_upsert_section` → 一份共用規則同步到 AGENTS.md 與 CLAUDE.md。
9. `AGENTS.md`（整份 76 行）→ 「短規則檔、只放指標」的寫法示範。
10. `.github/skills/code-review/SKILL.md` → description 寫法範本。
11. `presets/constitution-sync/README.md` L69-L96 → 「為什麼複製規則會漂移」的說明，可以貼給 GPT／Claude 當原則。

**建議你的最小基礎架構（綜合以上，我的建議）：**
```
docs/RULES.md            ← 唯一共用規則（憲法格式，有版本號與修訂紀錄）
AGENTS.md                ← Codex 讀；只寫「先讀 docs/RULES.md」＋SHARED 受管區塊
CLAUDE.md                ← Claude 讀；內容同上（受管區塊由腳本同步）
TASKS.md                 ← 共用任務清單（T 編號、[X] 完成、只追加）
docs/handoff/YYYY-MM-DD-<ai>.md ← 每次交接一份短紀錄
docs/patrol/YYYY-MM-DD.md       ← 每日巡讀報告（analyze 格式）
.claude/skills/patrol/SKILL.md 與 .agents/skills/patrol/SKILL.md ← 同一份原稿
```

---

## 關鍵字
Spec Kit、spec-kit、specify-cli、規格驅動開發、Spec-Driven Development、SDD、專案憲法、constitution、共用規則、AGENTS.md、CLAUDE.md、Claude Code、Codex、Cursor、Copilot、SKILL.md、agent skills、技能、一致性分析、analyze、巡讀、巡檢、稽核、重複偵測、duplication、術語漂移、terminology drift、版本衝突、Sync Impact Report、語意化版本、SemVer、單一事實來源、single source of truth、converge、收斂、tasks.md、任務清單、交接、handoff、人工關卡、gate、workflow、hooks、SessionStart、extensions、presets、多 AI 協作、multi-agent、memorylint、agent-context、MIT
