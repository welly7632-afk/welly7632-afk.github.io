# mattpocock/skills — 一套「讓 AI 照工程紀律做事」的 Skills 範本庫，同時示範 Claude 與 Codex 共用一份規則
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：4ae2317
> GitHub：https://github.com/mattpocock/skills｜⭐ 312707｜授權：MIT｜主要語言：Shell｜最近更新：2026-11-04

> 本資料包所有路徑都在 commit `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d` 上親自開檔確認。以下簡稱 permalink 前綴 `B` = `https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d`，但每個連結仍寫完整網址方便點擊。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這不是一個「程式」，而是 39 份寫給 AI 看的工作手冊（`SKILL.md`），外加一份示範用的共用規則檔（`CLAUDE.md`，`AGENTS.md` 是指向它的捷徑），作者用它讓 Claude Code、Codex、Copilot、Gemini 等不同 AI 照同一套工程流程做事：先訪談釐清需求 → 寫規格 → 拆工單 → 測試驅動實作 → 雙軸審查 → 事後檢討（retro）。

**對你（倉儲／庫存 web app 老闆、同時用 GPT/Codex 與 Claude）最有價值的地方：**

1. **「一份規則，兩個 AI 都讀」的最簡單做法**：repo 根目錄的 `AGENTS.md` 是 symlink（捷徑）指向 `CLAUDE.md`（我用 `git ls-tree` 確認 `AGENTS.md` 的 mode 是 `120000` 即 symlink）。Codex 讀 `AGENTS.md`、Claude Code 讀 `CLAUDE.md`，實際上是同一份檔案，永遠不會出現「兩份規則版本不一致」。這正好解決你「哪邊新版、哪邊舊版」的痛點。
2. **每個 skill 同時給 Claude 與 Codex 兩份設定**：`SKILL.md`（Claude Code 讀的 frontmatter）＋ `agents/openai.yaml`（Codex 的顯示名稱與「能不能被 AI 自動觸發」設定），而且規則要求兩邊同步。你可以照抄這個結構，讓你寫的每個 skill 兩個 AI 都能用。
3. **角色分工的範本**：實作者（implementer）、審查者（reviewer，分「標準」與「規格」兩軸）、合併者（merger）、探索者（exploration subagent）、研究員（research）、總管（chief-of-staff）、分診（triage）。每個角色怎麼交接、誰檢查誰都寫清楚了。
4. **防漏／防重複／防新舊衝突的現成做法**：工單用「blocking edges（誰擋住誰）」排出可做的 frontier；`.out-of-scope/` 資料夾記錄「已經拒絕過的需求」防止重複討論；ADR（架構決策紀錄）＋`Status: superseded by ADR-NNNN` 標記舊決策；chief-of-staff 的 wiki 規定「每句話都要附日期或 commit，舊的標 superseded 而不是改寫」，外加定期 **Lint**（找矛盾、孤兒頁、被新資料推翻的說法）。這幾乎就是你要的「每日巡讀」的骨架。
5. **怎麼寫好規則檔本身的方法論**：`writing-for-agents` skill 把「規則檔要短、一個意思只放一個地方（single source of truth）、刪掉 AI 本來就會做的無效指令（no-op）、避免沉積（sediment，舊規則越堆越多）」寫成可操作的準則——這是你現在「覺得很亂」最根本的藥。

**不適合的部分**：試算表、比價、ERP、AI 影片都完全沒有涉及；`setup-ts-deep-modules`、`migrate-to-shoehorn` 是 TypeScript 專用，你用純 JavaScript 用不到。

---

## 2. 授權白話

- **授權：MIT**（親自打開 `LICENSE` 確認：「Copyright (c) 2026 Matt Pocock」，標準 MIT 全文）。https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/LICENSE
- **個人使用**：完全自由。複製、修改、翻成中文、改成你自己的 skill 都可以。
- **公司商用**：也可以，包含放進公司內部專案、包進付費產品。唯一義務是：若你「散布」含有它大量內容的檔案，要保留原著作權聲明與 MIT 授權文字（最簡單：在你改寫的 skill 資料夾放一份 `LICENSE` 或在檔頭註明出處）。無擔保條款：出問題作者不負責。
- **有沒有閉源／付費版**：repo 內沒有看到付費版功能。README 有導流到作者的電子報（aihero.dev），文件頁面發佈在 `aihero.dev/skills-<name>`，但 skill 內容全部在 repo 裡。
- **注意**：`skills/engineering/pr/SKILL.md` 的 frontmatter 註明部分內容致謝 Humanlayer 的 Dex Horthy（`show-me` skill），repo 另有 `skills/engineering/pr/CREDITS.md`（未開讀全文，其授權條款「未確認」）。若你要商用這一份，建議先看 CREDITS.md。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 前端／後端／資料庫 | **都沒有**。內容 = Markdown（`SKILL.md`、參考文件）＋ YAML（`agents/openai.yaml`）＋ JSON（plugin manifest）。 |
| 程式碼 | 只有少量 Shell 與一支 Node 腳本：`scripts/link-skills.sh`（把 skills 用 symlink 掛到 `~/.claude/skills` 與 `~/.agents/skills`）、`scripts/list-skills.sh`、`scripts/sync-plugin-version.mjs`（同步版本號）、`skills/engineering/wizard/template.sh`（223 行，互動式 bash 精靈範本）、`skills/engineering/diagnosing-bugs/scripts/hitl-loop.template.sh`（44 行）、`skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh`（25 行，需要 `jq`）。 |
| 版本管理 | `package.json` 只有 devDependencies `@changesets/cli`、`@changesets/changelog-github`（維護者發版用，一般使用者不需要裝）。 |
| 部署方式 | 不需部署。用各 AI 工具的 plugin 安裝指令或 `npx skills@latest add` 複製到你的專案。 |
| 硬體／GPU | 不需要。 |
| API Key | repo 本身不需要。你需要的是你本來就在用的 AI 工具訂閱（Claude Code、Codex 等）。`triage`／`to-tickets` 若選 GitHub 作為工單系統，需要已登入的 `gh` CLI。 |
| 費用 | repo 免費；實際花費 = 你的 AI 工具用量。部分 skill（`implement-spec`、`code-review`、`chief-of-staff`）會開多個 subagent 平行跑，**token 用量會明顯增加**，具體金額「未確認」。 |

---

## 4. 程式架構地圖

（由 `git ls-tree -r --name-only HEAD` 取得，共 184 個檔案）

```
mattpocock/skills/
├── CLAUDE.md                  ← 給 AI 看的「維護本 repo 的規則」（33 行）
├── AGENTS.md -> CLAUDE.md     ← symlink：Codex 等讀 AGENTS.md，其實讀到同一份
├── README.md                  ← 安裝方式、每個 skill 一行說明、User/Model-invoked 分類
├── GLOSSARY.md                ← 本 repo 自己的領域詞彙表（示範格式）
├── SCOPE.md / CONTRIBUTING.md ← 收 issue 的標準（必須是真實失敗、符合哲學）
├── CHANGELOG.md               ← 9 個版本段落（1.0.0 → 1.3.2）
├── .agents/                   ← 給維護者 AI 的「被指向才讀」的參考文件
│   ├── invocation.md          ← User-invoked vs Model-invoked 規則（最重要）
│   ├── install-block.md       ← 安裝說明的「唯一正本」，其他地方只能照抄
│   ├── writing-docs.md        ← 人看的文件頁怎麼寫
│   └── adr/0001…, 0002…       ← 架構決策紀錄
├── .out-of-scope/             ← 9 份「已拒絕的提案」與理由（防重複討論）
├── .changeset/                ← 待發佈的變更說明（每個變更一個 md）
├── .claude-plugin/
│   ├── plugin.json            ← Claude Code／Codex／Copilot plugin 清單（列出 27 個 skill 路徑）
│   └── marketplace.json       ← 讓 repo 本身成為 plugin marketplace
├── .github/workflows/         ← release.yml、triage-label.yml、needs-info.yml（每日 cron）
├── docs/
│   ├── agents/triage-labels.md         ← setup skill 產出的設定範例
│   ├── engineering/*.md (21) / productivity/*.md (7)  ← 給人看的說明頁（engineering 多出的 1 頁是已於 v1.3.0 移除的 skill 封存頁 resolving-merge-conflicts，開頭標 `> **Archived.**`）
├── scripts/                   ← link-skills.sh、list-skills.sh、sync-plugin-version.mjs
└── skills/
    ├── engineering/  (20 個 skill) ← 寫程式日常流程，「主推」
    ├── productivity/ (7 個 skill)  ← 非程式的工作流程，「主推」
    ├── in-progress/  (8 個 skill)  ← Beta，不進 plugin
    ├── misc/         (4 個 skill)  ← 凍結不維護
    └── deprecated/   (0 個，只有 README)
```

**計數方式**：`find skills -name SKILL.md | awk -F/ '{print $2}' | uniq -c` → engineering 20、in-progress 8、misc 4、productivity 7，共 39。`grep -l "disable-model-invocation: true"` 命中 24 個（User-invoked），其餘 15 個是 Model-invoked。`find skills -name openai.yaml` 共 38 個（只有 `in-progress/software-factory` 缺）。

**每個 skill 資料夾的標準結構**（以 `triage` 為例）：
```
skills/engineering/triage/
├── SKILL.md            ← 主檔：frontmatter + 步驟
├── AGENT-BRIEF.md      ← 被指向才讀的參考（progressive disclosure）
├── OUT-OF-SCOPE.md
└── agents/openai.yaml  ← Codex UI 名稱 + 是否允許隱式觸發
```

### 全部 39 個 skill 一覽（U = 只能人打指令觸發；M = AI 可自動觸發）

**engineering（主推，20）**
| skill | 類型 | 用途 |
|---|---|---|
| ask-matt | U | 路由器：問「現在該用哪個 skill」 |
| grill-with-docs | U | 訪談釐清需求，同時更新 `GLOSSARY.md` 與 ADR |
| triage | U | issue 分診狀態機（needs-triage/needs-info/ready-for-agent/ready-for-human/wontfix） |
| improve-codebase-architecture | U | 掃描程式碼找「加深模組」機會，產出 HTML 報告（建議每幾天跑一次） |
| setup-matt-pocock-skills | U | 每個專案跑一次：設定工單系統、標籤、文件位置 |
| to-spec | U | 把對話整理成規格發到工單系統 |
| to-tickets | U | 把規格拆成 tracer-bullet 工單，標註 blocked by |
| implement | U | 依工單實作 → 呼叫 tdd → 呼叫 code-review → commit |
| implement-spec | U | 整份規格平行實作（多個 implementer subagent + merger subagent） |
| wayfinder | U | 超大工作：在工單系統畫「決策地圖」，一次解一張 |
| retro | U | 事後檢討：改善 AI 的「環境」（規則、檢查、導航） |
| prototype | M | 丟棄式原型回答設計問題 |
| diagnosing-bugs | M | 難 bug 診斷流程（先做出會變紅的回饋迴圈） |
| research | M | 背景代理查一手資料，寫成附出處的 Markdown |
| tdd | M | 紅綠測試驅動開發 |
| domain-modeling | M | 建立／修正領域詞彙與 ADR |
| codebase-design | M | 深模組設計詞彙 |
| code-review | M | 兩軸審查：Standards（規範）+ Spec（規格），兩個 subagent 平行 |
| pr | M | PR 內文格式 |
| wizard | M | 產生 bash 精靈引導人類做只有人能做的步驟（設定金鑰等） |

**productivity（主推，7）**：grill-me（U，無狀態訪談）、handoff（U，交接文件）、teach（U，多回合教學）、to-questionnaire（U，給別人填的問卷）、wait-what（U，聽不懂時要 AI 重講）、grilling（M，訪談核心）、writing-for-agents（M，寫給 AI 的文件怎麼寫）。

**in-progress（Beta，8）**：chief-of-staff、claude-handoff、loop-me、setup-ts-deep-modules、software-factory、writing-beats、writing-fragments、writing-shape（皆 U）。

**misc（凍結，4）**：git-guardrails-claude-code、migrate-to-shoehorn、scaffold-exercises、setup-pre-commit（皆 M）。

---

## 5. 核心功能怎麼實作

> 這個 repo 的「程式」就是提示詞（prompt）。以下「實作」= 該 skill 用什麼文字結構讓 AI 穩定照做。

### 5.1 共用規則：一份檔、兩個名字
- 位置：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/CLAUDE.md （`AGENTS.md` 為 symlink）
- 重點：整份只有 33 行，**幾乎全是「導航指標」**：bucket 規則、`README` 必須同步、安裝文字只能照抄 `.agents/install-block.md`、invocation 規則看 `.agents/invocation.md`、每個派 subagent 的 skill 要「以全新 context 啟動」（因為 Codex 預設會 fork 父對話）。細節都放在被指向的檔案裡，不塞進主規則。
- 這與 `retro` 的原則一致：「`CLAUDE.md`/`AGENTS.md` 會被推進每個 agent 的 context，應極度節制，通常只放導航指標」（https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/retro/SKILL.md#L37-L44）。

### 5.2 讓 Claude 與 Codex 都能用同一個 skill
- 位置：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.agents/invocation.md
- Claude 端：`SKILL.md` frontmatter 加 `disable-model-invocation: true` → 只有人打 `/名稱` 才觸發。
- Codex 端：同資料夾 `agents/openai.yaml` 寫 `policy: allow_implicit_invocation: false`，並用 `interface.display_name`／`short_description` 給 Codex 的選單顯示。範例：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/retro/agents/openai.yaml
- 規則：「兩邊要同步：一個 skill 要嘛在兩個工具都是 user-invoked，要嘛都不是」。
- skill 之間的呼叫一律寫成「Call the Skill tool with "grilling"」，不用 `../other-skill/FILE.md` 相對路徑、也不寫 `/grilling`（因為斜線語法每個工具不同，寫 Skill tool 對各家都通用）。

### 5.3 主流程：idea → ship（路由器 ask-matt）
- 位置：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/ask-matt/SKILL.md#L15-L40
- `grill-with-docs` → （需要時 `prototype`，用 `handoff` 進出）→ `to-spec` → `to-tickets` → `implement`（每張工單 `/clear` 一次）或 `implement-spec`（平行）→ `tdd` + `code-review` → `pr` → `retro`。
- 「Context hygiene」：步驟 1–3 要在同一個 context 視窗內完成，接近約 150k token 的「smart zone」上限時在階段邊界 `/compact`。
- 階段邊界五選一決策樹（Continue／clear／handoff／Subagent／compact）：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/ask-matt/PHASE-BOUNDARIES.md

### 5.4 拆工單＋防漏：blocking edges 與 frontier
- 位置：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/to-tickets/SKILL.md#L25-L103
- 每張工單是「垂直切片」（從資料到 UI 到測試一條完整路徑），大小以「一個全新 context 視窗裝得下」為準；每張寫 **Blocked by**；所有 blocker 都完成的工單構成 **frontier**（可以立刻做的）。
- 本地 Markdown 版模板（L69-L82）：`# NN: 標題` / `What to build` / `Blocked by` / `Status: ready-for-agent` / 驗收 checkbox。
- 本地工單系統規則：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/setup-matt-pocock-skills/issue-tracker-local.md —— `.scratch/<feature>/spec.md`、`.scratch/<feature>/issues/01-xxx.md`，每檔頂端 `Status:`，留言附在 `## Comments` 底下，**一張一檔、絕不合併成一個大檔**。

### 5.5 平行實作與角色交接：implement-spec
- 位置：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/implement-spec/SKILL.md#L7-L42
- 角色：**exploration subagent**（先探索，筆記存在 repo 外讓其他 subagent 讀）→ 每張工單一個全新 **implementer subagent**（各自 worktree、各自 branch、呼叫 `tdd`、回報前先合併 integration branch 最新版）→ **merger subagent** 合併 → frontier 變了就再派新 implementer → 全部完成後跑 `code-review` → 再派一個全新 implementer 修審查意見 → 清理 worktree。
- 溝通規則：「subagent 之間溝通要稀疏，主要透過 **context pointers**（指向規格、工單、研究筆記、commit），不要複製已經能用指標找到的資訊」。這是防「重複內容」的核心原則。

### 5.6 兩軸審查：code-review
- 位置：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/code-review/SKILL.md#L15-L89
- 固定比較點（commit/branch）→ 找規格來源（commit 訊息中的 issue、`.scratch/`）→ 找規範來源（`CODING_STANDARDS.md`、`CONTRIBUTING.md` 必列）＋ 12 個 Fowler code smell 基準（其中 **Duplicated Code** 就是抓重複）→ **兩個 subagent 平行**：Standards（違反哪條規範）、Spec（漏做什麼、多做什麼 scope creep、做錯什麼）→ 各 400 字內 → 分兩節呈現，**刻意不合併排名**，避免一軸掩蓋另一軸。

### 5.7 分診與防重複：triage + .out-of-scope
- 位置：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/triage/SKILL.md#L68-L86
- 步驟 1 強制兩項檢查：(a) **redundancy**：依「領域概念」（不是只比字面）搜尋程式碼是否已實作；(b) **prior rejection**：讀 `.out-of-scope/*.md` 比對是否以前拒絕過。
- `.out-of-scope/` 規則：一個「概念」一個檔（不是一個 issue 一個檔），新的同類請求只追加到 `Prior requests` 清單：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/triage/OUT-OF-SCOPE.md#L17-L98
- 交給 AI 的工單要寫 **Agent Brief**（目前行為／期望行為／關鍵介面／驗收條件／不在範圍），刻意**不寫檔案路徑和行號**（會過期）：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/triage/AGENT-BRIEF.md#L9-L68

### 5.8 防新舊版本衝突：ADR、GLOSSARY、wiki 的「寫歷史不寫現在」
- ADR 格式（`Status: proposed | accepted | deprecated | superseded by ADR-NNNN`）：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/domain-modeling/ADR-FORMAT.md#L17-L23
- 詞彙表格式（每個詞附 `_Avoid_:` 禁用同義詞，防止不同 AI 用不同名稱指同一件事）：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/domain-modeling/GLOSSARY-FORMAT.md
- 衝突時要「明講」：「_Contradicts ADR-0007, but worth reopening because…_」：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/setup-matt-pocock-skills/domain.md#L47-L51
- chief-of-staff wiki：每句加日期、程式相關的說法要附 commit、改變時「新增一條並標舊的 superseded，不改寫舊的」：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/chief-of-staff/SKILL.md#L26-L47

### 5.9 寫規則檔的方法論：writing-for-agents
- 位置：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/writing-for-agents/SKILL.md
- **Context pointer**（L10-L18）：skill 的 description 和 AGENTS.md 裡一行「看某檔」是同一種東西，用字決定 AI 何時去讀。
- **兩種負擔**（L20-L27）：context load（常駐 token）vs cognitive load（人要記得有哪些文件）。
- **資訊階層**（L29-L43）：步驟 → 檔內參考 → 拆出去的參考（progressive disclosure）；**sprawl**（太長）是失敗模式。
- **完成條件**（L45-L52）：每個步驟要有清楚且「要求夠高」的完成條件，防止 AI 提早宣布完成。
- **Pruning**（L76-L81）：single source of truth、環境本身就是事實來源（`package.json` 等不要在規則裡重抄）、**sediment**（舊規則沉積）、逐句找 **no-op**。
- Skill 專用細節（invocation 選擇、router skill）：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/writing-for-agents/SKILL-MECHANICS.md

### 5.10 事後檢討：retro
- 位置：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/retro/SKILL.md#L9-L35
- 7 類檢查：Navigation、Automated checks（沒有 pre-commit 也沒有 CI 本身就是問題）、Coding standards（機械性錯誤做成自動檢查，判斷性的才寫進 `CODING_STANDARDS.md`）、Global AGENTS.md（太大就移出去）、Tool economy、No-ops、Information access。依嚴重度排序呈現。
- 重要分工觀念：**實作 agent context 壓力最大，審查 agent 最小，所以「執行規範」要交給審查 agent**，而不是塞進每次都載入的 AGENTS.md。

---

## 6. 值得拆出來用的部分

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| AGENTS.md→CLAUDE.md symlink 模式 | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/CLAUDE.md | 無（Windows 要開發者模式或改用「AGENTS.md 只寫一行：請讀 CLAUDE.md」） | 低 | 在你倉儲 app 根目錄 `ln -s CLAUDE.md AGENTS.md`；所有共用規則只改 CLAUDE.md |
| User/Model-invoked 雙設定 | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.agents/invocation.md | Claude Code、Codex | 低 | 你寫的每個 skill 都放 `SKILL.md` + `agents/openai.yaml`，照此表同步 |
| writing-for-agents（寫規則的準則） | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/writing-for-agents/SKILL.md | 無 | 低 | 直接安裝成 skill；每次改 CLAUDE.md 前讓 AI 先讀 |
| retro（環境檢討） | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/retro/SKILL.md | writing-for-agents | 低 | 每天收工前跑一次；當作「巡讀」的一半 |
| chief-of-staff 的 wiki 規則（Ingest/Query/Lint、寫歷史） | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/chief-of-staff/SKILL.md#L26-L47 | 無（Beta） | 低 | 建 `wiki/index.md`；把 Lint 那段改寫成你的每日巡讀 skill |
| code-review 兩軸審查 | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/code-review/SKILL.md | git、能開 subagent 的工具 | 中 | 讓 Claude 寫、Codex 審（或反過來），兩軸報告分開看 |
| 本地 Markdown 工單系統 | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/setup-matt-pocock-skills/issue-tracker-local.md | 無 | 低 | 不用 GitHub Issues 也能做任務追蹤；兩個 AI 都讀 `.scratch/` |
| to-tickets 工單模板＋blocking edges | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/to-tickets/SKILL.md#L69-L103 | 工單系統 | 低 | 每個新功能先拆票再分派給 GPT/Claude |
| Agent Brief 模板 | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/triage/AGENT-BRIEF.md#L39-L68 | 無 | 低 | 你交代任務給任一 AI 時套這個格式 |
| `.out-of-scope/` 拒絕紀錄 | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/triage/OUT-OF-SCOPE.md | 無 | 低 | 「不做的功能」寫下來，AI 再提案時先比對 |
| ADR + GLOSSARY 格式 | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/domain-modeling/ADR-FORMAT.md 、https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/domain-modeling/GLOSSARY-FORMAT.md | 無 | 低 | 「SKU／品號／料號」到底叫什麼，寫進 GLOSSARY 的 `_Avoid_` |
| handoff 交接 | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/handoff/SKILL.md | 無 | 低 | Claude 做到一半換 Codex 時用（PHASE-BOUNDARIES 明說換工具就是用 handoff 的時機） |
| git 危險指令攔截 hook | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh | Claude Code hooks、`jq` | 低 | 防止 AI 誤 `git push`／`reset --hard`；注意只對 Claude Code 有效 |
| software-factory 範例任務（含每日／每夜排程） | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/software-factory/EXAMPLE-TASKS.md | 排程器（GitHub Actions 等） | 中 | 參考「Ratchet（每日一檔）」「Architecture（每夜掃描）」「Retro（每十個 PR 一次）」設計你的巡檢 |
| 每日 cron 的 GitHub Action 範例 | https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.github/workflows/needs-info.yml | GitHub Actions | 低 | 只是關閉過期 issue 的範例；可仿照 cron 寫法排你的巡檢 |

---

## 7. AI／Claude 整合

- **用哪些模型**：skill 本身不綁模型；README 說「They work with any model」。內容使用 Claude Code 的 Skill tool／subagent／`/clear`／`/compact` 等概念，也明確照顧 Codex（`agents/openai.yaml`、「Codex 預設 fork 父對話所以要指定全新 context」）。
- **prompt 放在哪**：每個 `skills/<bucket>/<name>/SKILL.md` 就是 prompt；長的參考資料拆到同資料夾的 `*.md`（例如 `triage/AGENT-BRIEF.md`、`improve-codebase-architecture/HTML-REPORT.md`）。
- **MCP**：repo 沒有 MCP server。`software-factory/RUNNERS.md` 只是介紹市面上的執行環境（含 Claude Code cloud 的排程任務），屬於調查文件。
- **Skills**：本 repo 就是 Agent Skills 標準格式，Claude Code 是一級支援（**原生**）。另外有一個 Claude 專屬的 Beta skill `claude-handoff`，用 `claude --bg --name ... -- "$(cat 摘要檔)"` 把工作交給背景 Claude 代理：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/claude-handoff/SKILL.md
- **Claude Code hook**：`git-guardrails-claude-code` 示範 `PreToolUse` hook（matcher `Bash`）擋危險 git 指令。
- **能不能換成 Claude**：本來就是以 Claude Code 為主、Codex 為輔設計的，不需要換。

---

## 8. 擴充方式與 API

- **加自己的 skill**：在 `skills/<bucket>/<name>/` 放 `SKILL.md`（frontmatter：`name`、`description`、選用 `disable-model-invocation`、`argument-hint`、`metadata`）＋ `agents/openai.yaml`。若要用作者的 plugin 機制發佈，還要把路徑加進 `.claude-plugin/plugin.json` 的 `skills` 陣列（https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.claude-plugin/plugin.json ）。
- **Plugin／Marketplace**：`.claude-plugin/plugin.json` + `marketplace.json` 讓整個 repo 成為一個 plugin，Claude Code、Codex、Copilot 都讀這兩個檔（見 ADR 0002 的 2026-10-07 更新：Codex 會在沒有 `.codex-plugin/` 時退回讀 `.claude-plugin/`）：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.agents/adr/0002-ship-as-a-claude-code-plugin.md#L43-L51
- **本地開發**：`scripts/link-skills.sh` 把 skills 以 symlink 掛到 `~/.claude/skills` 與 `~/.agents/skills`（後者給 Codex 等），`git pull` 即更新：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/scripts/link-skills.sh
- **每專案設定**：`/setup-matt-pocock-skills` 在你的專案寫入 `docs/agents/issue-tracker.md`、`docs/agents/domain.md`、`docs/agents/triage-labels.md`，並在 CLAUDE.md（或 AGENTS.md，**已有哪個就改哪個，絕不另建第二份**）加一個 `## Agent skills` 區塊（已存在就原地更新，不重複附加）：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/setup-matt-pocock-skills/SKILL.md#L74-L106
- **不接受新 skill 貢獻**：作者明確關閉新 skill 提案（`.out-of-scope/new-skills.md`），建議 fork 或用 skills.sh 拿到可編輯副本自己改。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。CHANGELOG 有 9 個版本段落（`grep -c '^## '`），最新 1.3.2 一個版本內就列了約 20 條修正，多數引用真實 issue 編號。有 changesets 發版流程與 3 個 GitHub Actions。
- **測試**：沒有自動化測試（prompt 庫本身難測）；有 `claude plugin validate . --strict` 的人工驗證規則（寫在 CLAUDE.md）與 `npm run check-plugin-version` 檢查版本同步。
- **資安／隱私**：
  - `handoff`、`claude-handoff`、`diagnosing-bugs` 都要求遮蔽 API key、密碼、個資。
  - `wizard` 會產生把值寫入 `.env` 與 GitHub secrets 的腳本，使用時注意 `.env` 不要進 git。
  - `improve-codebase-architecture` 產生的 HTML 報告從 CDN 載入 Tailwind 與 Mermaid（寫在 OS 暫存資料夾，不進 repo）。
  - GitHub 工單模板特別提醒「只把 issue 開在使用者自己的 repo，不要開到 mattpocock/skills」，因為曾有人的 AI 把自己專案的工單誤發到作者 repo（CHANGELOG 1.3.2 提到 #541–#550）。
- **遙測**：未發現任何遙測或回傳資料的程式（repo 幾乎沒有可執行程式碼；`grep -ril 'analytics|telemetry|posthog|segment'` 只命中 `software-factory/OBSERVABILITY-PLATFORMS.md`，那是介紹可觀測性產品的調查文件，不是遙測程式）。
- **已知的坑**：
  1. **名稱撞到內建指令**：`/code-review`、`/research`、`/prototype` 會和 Claude Code／Copilot 內建指令撞名，作者不改名，請用 `/mattpocock-skills:code-review` 這種命名空間呼叫（`.out-of-scope/harness-name-collisions.md`）。
  2. **plugin 與 skills.sh 只能二選一**，兩個都裝會讓每個 skill 出現兩次（`.agents/install-block.md`）。
  3. **Codex 會丟掉 symlink**（ADR 0002），所以若你用 symlink 共用 skill 給 Codex 的 plugin 安裝，會變空的；但 repo 根目錄的 `AGENTS.md` symlink 是給 Codex 直接在專案中讀，不受此限（是否在 Windows 上正常運作「未確認」）。
  4. 小瑕疵：`in-progress/software-factory` 沒有 `agents/openai.yaml`，違反 repo 自己「每個 skill 都要有」的規則（我用迴圈檢查 39 個資料夾得出）。
  5. 不會自動防止 subagent 無限遞迴（作者認為那是工具的責任：`.out-of-scope/subagent-recursion.md`）。
  6. 大量 skill 預設搭配 GitHub Issues 與 `gh` CLI；若你不用 GitHub，記得在 setup 選「Local markdown」。

---

## 10. 跟其他專案組合的建議

- **A（本 repo）提供「流程與寫法」**：規則檔寫法、skill 格式、角色交接、retro、兩軸審查、工單模板。
- **B：需要「多 AI 規則同步工具」時**（同類別中如 `.ruler` 一類的規則同步工具，非本 repo 內容，需另查證）：本 repo 只用一個 symlink 解決，對你這種兩個 AI、一個專案的規模其實已經夠用。
- **C：需要「排程巡檢執行器」時**：本 repo 只給概念（chief-of-staff 的 Lint、software-factory 的每日 Ratchet／每夜 Architecture 任務），**沒有現成可跑的每日巡讀程式**。可搭配 GitHub Actions 的 cron（參考本 repo `needs-info.yml` 的 `schedule: cron`）或 Claude Code 的排程功能、Codex 的自動化，去觸發你自己寫的「巡讀 skill」。
- **給你的建議組合（倉儲 app）**：
  1. 專案根目錄：`CLAUDE.md`（短，只放導航）＋ `AGENTS.md -> CLAUDE.md`。
  2. `GLOSSARY.md`：庫存領域詞彙（品項、SKU、批號、庫位、出入庫單、盤點……）與 `_Avoid_` 同義詞。
  3. `docs/adr/`：重要決策（為何用 Firebase、為何用純 JS）。
  4. `.scratch/<功能>/issues/NN-*.md`：任務追蹤，兩個 AI 都從這裡領工單。
  5. `.out-of-scope/`：決定不做的功能。
  6. `wiki/index.md` + 每日巡讀 skill（改寫自 chief-of-staff 的 Lint + retro）。
  7. 分工：Claude 實作（implement + tdd），Codex 審查（code-review 兩軸），或反之；換手時用 handoff。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫
- **檔案結構：有。** 根目錄 `CLAUDE.md` + `AGENTS.md`（symlink）＋ `.agents/`（被指向才讀的參考）＋ `docs/agents/`（setup 產生的專案設定）。https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/CLAUDE.md 。沒有 `.ruler`、constitution、`rules/` 資料夾。
- **分層（全域／專案／子資料夾）：部分有。** 全域：`link-skills.sh` 安裝到 `~/.claude/skills`、`~/.agents/skills`；`git-guardrails` 區分專案 `.claude/settings.json` 與全域 `~/.claude/settings.json`；`retro` 提到「repo 或使用者全域範圍」的 AGENTS.md。子資料夾層：domain docs 的 multi-context 版（`src/<context>/GLOSSARY.md`、`src/<context>/docs/adr/`）。沒有子資料夾層級的 AGENTS.md 範例。
- **優先順序：部分有。** code-review 明定「repo 文件化的規範永遠勝過內建 smell 基準」（https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/code-review/SKILL.md#L38-L41 ）；ADR 衝突要明講不可靜默覆蓋。全域 vs 專案 AGENTS.md 的覆蓋順序「未確認」（repo 未說明，屬於各工具行為）。
- **讓 GPT（Codex）和 Claude 讀同一份規則：有。** `AGENTS.md -> CLAUDE.md` symlink；每個 skill 的 `SKILL.md` + `agents/openai.yaml` 雙設定；`setup-matt-pocock-skills` 規定「已有 CLAUDE.md 就改它，絕不再建 AGENTS.md（反之亦然）」，避免兩份分歧。

### 11.2 角色設計
- **有。** 角色與職責：

| 角色 | 職責 | 用的 skill／工具 | 交接方式 | 向誰負責 |
|---|---|---|---|---|
| 人類（maintainer） | 做所有決策、觸發 user-invoked skill | ask-matt 路由 | — | — |
| Grilling 訪談者 | 一輪一輪問問題，每題附建議答案；查事實自己來，決策交給人 | grilling、domain-modeling | 產出 GLOSSARY/ADR | 人類 |
| Exploration subagent | 先探索程式碼與文件，筆記寫在 repo 外 | — | 筆記路徑（context pointer） | implement-spec 主控 |
| Implementer subagent | 每張工單一個、全新 context、各自 worktree、跑 tdd | tdd | branch + 回報 | implement-spec 主控 |
| Merger subagent | 把完成的 branch 合進 integration branch | git | — | 主控 |
| Reviewer（Standards / Spec 兩個） | 各自只看 diff + 規範或規格，400 字內 | code-review | 報告 | 主控／人類 |
| Research（背景） | 查一手資料、寫附出處 Markdown | research | 檔案路徑 | 呼叫者 |
| Triage | issue 狀態機、驗證、寫 agent brief | triage | `ready-for-agent` 標籤＋brief | 人類 |
| Chief of staff（Beta） | 長期目標的負責人（DRI），所有工作派給 subagent，維護 wiki，對 1/5 subagent 做 retro | retro、to-spec、to-tickets、implement-spec | wiki + context pointers | 人類 |

  主要出處：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/implement-spec/SKILL.md 、https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/chief-of-staff/SKILL.md 、https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/grilling/SKILL.md
- **可用工具限制：部分有。** user-invoked skill 只能由人觸發；skill 不能呼叫另一個 user-invoked skill（chief-of-staff 改用「讀相對路徑 SKILL.md」繞過）。檔案系統／指令權限分配「沒有」（作者認為屬工具責任）。
- **交接（handoff）：有。** `handoff` 寫到 OS 暫存資料夾、列「建議下個 agent 用哪些 skill」、不重抄已有文件只放路徑、遮蔽機密。PHASE-BOUNDARIES 明說「換工具（Claude → Codex）」就是用 handoff 的時機。

### 11.3 防漏
- **任務追蹤：有。** 工單（本地 `.scratch/` 或 GitHub/GitLab Issues）＋ blocking edges ＋ frontier；wayfinder 的「決策地圖」還有 **Not yet specified**（看得到但還說不清的事項，防止被遺忘）與 **Out of scope** 兩區。https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/wayfinder/SKILL.md#L27-L101
- **完成前驗證：有。** 每張工單有驗收 checkbox；`implement` 要求常跑型別檢查與單檔測試、最後跑全套測試、再呼叫 code-review 才 commit；grilling「frontier 為空且使用者確認」才算完成；writing-for-agents 要求每個步驟有清楚、高要求的 completion criterion。
- **交接紀錄：有。** handoff 文件、triage 的 `## Triage Notes`（已確立／待補）、wayfinder 每張票關閉時寫 resolution comment 並在地圖追加一行 context pointer、wiki 的 Ingest。
- **防「AI 認領同一件事」：有。** wayfinder「先 assign 給自己再開工」；本地版 `Status: claimed`；software-factory 每個任務必答「什麼機制防止兩個 run 做同一件事？」。

### 11.4 防重複
- **重複內容：有（以原則與審查為主）。** writing-for-agents 的 single source of truth／duplication 定義；handoff、implement-spec、chief-of-staff 都規定「已在其他文件的內容只放指標、不要重抄」；code-review 的 **Duplicated Code** smell；`.agents/install-block.md` 是安裝文字的唯一正本，其他地方只能照抄。
- **重複規則：有（人工）。** retro 的 **No-ops** 與 **Global AGENTS.md** 類別找出無效或該移走的指令；CLAUDE.md 規定 README、bucket README、plugin.json 三處要一致。**沒有自動化偵測腳本**。
- **重複需求／重複功能：有。** triage 的 redundancy 檢查（依概念搜尋現有實作）＋ `.out-of-scope/` 一概念一檔。
- **重複角色：沒有**專門偵測；但 `.out-of-scope/new-skills.md` 的原則「能用現有 skill 組合出來就不新增」等於防止角色／skill 膨脹。

### 11.5 防新舊版本衝突
- **版本標記：有。** `package.json` 與 `plugin.json` 版本號由 `sync-plugin-version.mjs` 同步（`--check` 模式可檢查不一致）；changesets 管變更；ADR `Status: superseded by ADR-NNNN`；teach 的 learning record `Status: superseded by LR-NNNN`。
- **單一事實來源：有。** 見 11.4；另外「環境本身就是事實來源」，規則檔不要抄 `package.json` 內容（抄了就是會過期的快取）。
- **變更提案／封存：有。** `.changeset/*.md` 每個變更一份說明；被移除的主推 skill 文件頁保留並加 `> **Archived.**` 註記（`.agents/writing-docs.md`）；`.out-of-scope/` 封存被拒提案。
- **過期偵測（staleness／drift）：部分有。** chief-of-staff wiki 的 **Lint**：「定期找矛盾、孤兒頁、缺連結、被新資料推翻的說法，並建議排程」；writing-for-agents 的 **sediment** 概念；Agent Brief 與工單刻意不寫檔案路徑／行號以避免過期；CLAUDE.md 要求 ask-matt 路由「一個沒提到的新 skill 或還在指向的舊 skill，就是會說謊的路由器」，每次改 skill 都要重讀更新。**沒有自動 drift 偵測程式**。

### 11.6 定期巡檢
- **有概念、沒有現成的每日巡讀程式。**
  - chief-of-staff：「Harness-permitting, you will suggest recurring schedules」＋ wiki Lint「Suggest this as a schedule」（https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/chief-of-staff/SKILL.md#L14-L38 ）。
  - software-factory 範例任務：**Ratchet**（每日一次、一次處理一個檔案）、**Architecture**（每夜掃描近期變更，開一張票）、**Retro**（每 10 個合併的 PR 抽 1 個檢討）、**Fix**（工廠自己的 run 失敗時）。並強調「先慢慢來」：每次只加一個自動觸發、先節流、每個迴圈最多重試幾次就交給人。（https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/software-factory/EXAMPLE-TASKS.md#L42-L80 、https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/in-progress/software-factory/SKILL.md#L54-L62 ）
  - README 建議 `improve-codebase-architecture`「每幾天跑一次」。
  - 真正在跑的排程：`.github/workflows/needs-info.yml`，`cron: "30 1 * * *"` 每日一次，只關閉 14 天沒回覆的 `needs-info` issue。
  - heartbeat、hook 型巡檢：沒有（唯一的 hook 是擋 git 指令）。
- **報告格式**：repo 中最接近的有三種——retro「依嚴重度排序的改善候選」、code-review「`## Standards` / `## Spec` 兩節 + 一行總結」、improve-codebase-architecture「HTML 卡片：Files／Problem／Solution／Benefits／Before-After 圖／建議強度（Strong / Worth exploring / Speculative）」。
- **簡短範例**（以下是我依這三種格式＋wiki Lint 組合給你的建議格式，**不是 repo 原文**）：

```markdown
# 每日巡讀報告 2026-11-04（commit abc1234）
## 漏（Missing）
- [高] .scratch/inventory-import/issues/03-csv-parse.md 狀態 claimed 已 3 天，無 commit 對應
## 重複（Duplicated）
- [中] CLAUDE.md 第 12 行與 docs/agents/firebase.md 都寫了部署指令 → 保留後者，CLAUDE.md 改成指標
## 新舊衝突（Stale / Contradiction）
- [高] docs/adr/0003-use-firestore.md（accepted）vs wiki/storage.md 2026-10-20 說「改用 Realtime DB」→ 需人類裁決，若改則 ADR 標 superseded
## 無效指令（No-op）
- [低] AGENTS.md「請仔細寫程式」→ 建議刪除
## 一行總結：漏 1、重複 1、衝突 1、no-op 1；最嚴重：ADR 與 wiki 衝突
```

### 11.7 Skill 寫法
- **SKILL.md 格式：有。** YAML frontmatter：`name`、`description`、選用 `disable-model-invocation: true`、`argument-hint`、`metadata`（如 credits）。內文分「步驟」與「參考」。
- **description 怎麼寫才會被正確觸發：有，且是本 repo 最精華的部分。**
  - Model-invoked：description 是「給模型看的」，要保留豐富觸發語「Use when the user wants…, mentions…, asks for…」。例：`tdd` 的「Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.」
  - User-invoked：description 是「給人看的」一行摘要，**刪掉觸發清單**（因為 AI 不會自動觸發，寫了只是浪費）。例：`retro` 的「Conduct a retrospective on a coding session.」
  - 原則：關鍵字放最前（front-load the leading word）、一個情境一個觸發詞（同義詞合併）、description 常駐 context 所以要比內文更精簡；判斷要不要做成 model-invoked 的標準是「模型自己會不會有用地主動拿來用？」。出處：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.agents/invocation.md 、https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/writing-for-agents/SKILL.md#L10-L18
  - 避免否定式指令（「不要想大象」反而讓 AI 想到），改寫成正面目標（L74）。
- **資料夾結構：有。** `skills/<bucket>/<name>/SKILL.md` + 同層參考檔（大寫檔名如 `AGENT-BRIEF.md`）+ `agents/openai.yaml`；共用參考放在擁有它的 skill 內，其他 skill 透過 Skill tool 呼叫取得，不跨資料夾連結。
- **腳本放哪：有。** skill 內的 `scripts/`（例：`diagnosing-bugs/scripts/hitl-loop.template.sh`、`git-guardrails-claude-code/scripts/block-dangerous-git.sh`）或同層 `template.sh`（wizard）；repo 維護腳本放根目錄 `scripts/`。

### 11.8 支援哪些工具與安裝方式
- **有**（https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.agents/install-block.md ）：
  - Claude Code：`claude plugin install mattpocock-skills@claude-plugins-official`（自動更新）
  - Codex：`codex plugin marketplace add mattpocock/skills` → `codex plugin add mattpocock-skills@mattpocock`（啟動時自動更新）
  - GitHub Copilot CLI／VS Code：`copilot plugin marketplace add mattpocock/skills` → `copilot plugin install mattpocock-skills@mattpocock`，需在 `~/.copilot/settings.json` 一次性設 `autoUpdate`
  - Gemini CLI：`gemini skills install https://github.com/mattpocock/skills.git --path skills/engineering`（與 productivity 各一次，手動更新）
  - Cursor、OpenCode、Devin、Windsurf、Amp、Pi 等：`npx skills@latest add mattpocock/skills -a <agent>`（拿到可編輯副本，手動更新）
  - 注意：plugin 裝法只給主推的 27 個（`plugin.json` 的 `skills` 陣列，我親自數過 27 筆）；Beta 的 chief-of-staff 等要用 `npx skills@latest add mattpocock/skills --skill=<name>` 單獨裝。
  - **對你的建議**：因為你要「改成自己的版本」，用 `npx skills@latest add` 拿可編輯副本比較適合；不要同時裝 plugin。

### 11.9 可以直接借用到你「基礎架構」的檔案或段落
1. `CLAUDE.md` 全文結構（只放導航指標的寫法）＋ `AGENTS.md` symlink：https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/CLAUDE.md
2. `.agents/invocation.md`（Claude/Codex 雙設定規則）
3. `skills/productivity/writing-for-agents/SKILL.md` + `SKILL-MECHANICS.md`（整份照裝）
4. `skills/engineering/retro/SKILL.md`（每日收工檢討的骨架，L15-L23 七類檢查）
5. `skills/in-progress/chief-of-staff/SKILL.md` L26-L47（wiki 的 Ingest／Query／Lint 與「寫歷史不寫現在」四條規則）→ 改寫成你的「每日巡讀」skill 主體
6. `skills/engineering/setup-matt-pocock-skills/issue-tracker-local.md`（本地工單規則）
7. `skills/engineering/to-tickets/SKILL.md` L69-L82（本地工單模板）
8. `skills/engineering/triage/AGENT-BRIEF.md` L39-L68（派任務給 AI 的模板）
9. `skills/engineering/triage/OUT-OF-SCOPE.md`（拒絕清單機制）
10. `skills/engineering/domain-modeling/ADR-FORMAT.md`、`GLOSSARY-FORMAT.md`
11. `skills/engineering/code-review/SKILL.md`（讓第二個 AI 當審查者）
12. `skills/productivity/handoff/SKILL.md`（Claude ↔ Codex 換手）
13. `skills/engineering/ask-matt/PHASE-BOUNDARIES.md`（何時 clear／compact／handoff）
14. `skills/in-progress/software-factory/EXAMPLE-TASKS.md`（排程任務設計靈感）
15. `skills/misc/git-guardrails-claude-code/`（防 AI 誤推送）

---

## 關鍵字
mattpocock/skills、Matt Pocock、Agent Skills、SKILL.md、AGENTS.md、CLAUDE.md、symlink、共用規則、單一事實來源、single source of truth、Claude Code、Codex、GitHub Copilot、Gemini CLI、skills.sh、plugin marketplace、agents/openai.yaml、disable-model-invocation、allow_implicit_invocation、user-invoked、model-invoked、description 觸發、writing-for-agents、context pointer、progressive disclosure、no-op、sediment、retro、事後檢討、code-review、兩軸審查、subagent、implementer、merger、chief-of-staff、wiki lint、巡讀、巡檢、定期檢查、handoff、交接、triage、分診、to-tickets、blocking edges、frontier、工單、任務追蹤、.out-of-scope、防重複、ADR、superseded、GLOSSARY、領域詞彙、新舊版本衝突、drift、staleness、software factory、cron、GitHub Actions、TDD、測試驅動、MIT 授權
