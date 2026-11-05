# raccioly/docguard — 專門「巡檢 AI 規則與文件有沒有過期、重複、互相矛盾」的本機 CLI（附 MCP、Skills、CI 閘門）
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：24f3998
> GitHub：https://github.com/raccioly/docguard｜⭐ 32｜授權：MIT｜主要語言：JavaScript｜最近更新：2026-11-04

> 本文所有 permalink 都固定在 commit `24f3998a0f9ed91fc27e04e9d2667edf9f7449e9`，以下用 `P/` 代表
> `https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/`。
> 我只閱讀原始碼與文件，沒有安裝、沒有執行任何指令，所以「實際跑起來的輸出」都是從程式碼裡的列印字串推回來的。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：DocGuard 是一個 Node.js 命令列工具（npm 套件名 `docguard-cli`，指令 `docguard`），把「文件／AI 規則檔」當成單一事實來源，然後用固定規則（不靠 AI）去檢查：文件有沒有跟程式碼脫節（drift）、AGENTS.md 和 CLAUDE.md 有沒有重複或互相打架、規則裡提到的檔案是不是已經不存在、哪些文件太久沒人看過、哪些舊規格該「退休」不要再餵給 AI。

**你最在意的「每天巡讀整個專案，抓 AI 漏掉、重複、新舊版本衝突」——這是我目前看過最貼近這個需求的工具之一**，具體可以這樣用：

| 你的痛點 | DocGuard 對應功能 | 是否需要 AI |
|---|---|---|
| GPT（Codex）跟 Claude 各讀各的規則，越改越不一致 | `docguard agents --sync`：以 `AGENTS.md` 為唯一來源，自動產生 `CLAUDE.md`、Cursor、Copilot 等檔案並打上雜湊標記；`docguard agents --check` 在 CI 裡發現「CLAUDE.md 已過期」就回傳 exit 2 | 不需要 |
| 規則重複寫兩次、後來只改了一邊 | `docguard verify --instructions`：找出完全重複的規則、「never X / always X」直接相反的規則、指向不存在檔案的規則、引用不存在指令的規則；另外把「主題相近」的規則配對，交給 AI 判斷是否實質衝突 | 確定性部分不需要；配對判斷交給 Claude/GPT |
| 不知道 Claude 跟 Codex 進到某個資料夾時到底讀了哪些規則 | `docguard rules --for <路徑>`：逐一列出 Codex／Claude Code／Cursor／Copilot／OpenHands 會載入哪些規則檔、原因、位元組數 | 不需要 |
| 舊版文件、舊規格還在資料夾裡，AI 誤以為是現行規則 | 文件標 `Status: superseded / deprecated / archived / obsolete`；`docguard retire --plan` 找出已完成或被取代的規劃文件，`retire` 把它移出工作目錄並在 `.docguard-archive.json` 記錄如何從 Git 還原 | 不需要 |
| 文件很久沒人確認過 | 文件頂端放 `<!-- docguard:last-reviewed 2026-11-03 -->`；Freshness 驗證器在「之後又有 ≥10 次程式碼 commit」或「比最新程式碼舊 30 天以上」時提醒該複查（FRS002／FRS003） | 不需要 |
| AI 改了程式但沒改文件 | `guard` 的 36 個驗證器（API 路由、環境變數、資料模型、版本號、數字宣稱……）＋ Claude Code 的 PostToolUse「提醒 hook」 | 不需要 |
| 想要「排程巡邏」的範本 | 專案自己用 Google Jules 做每週三個排程 AI 例行任務（bug-hunt／test-gaps／docs-drift），有完整的規則檔、preflight（決定今天要不要做事）、PR 去重複、自動關閉雜訊 PR | 範本本身值得抄 |

**對你最實際的建議**：不一定要全盤採用它的 CDD（Canonical-Driven Development）方法論（需要建立 `docs-canonical/` 一整套文件，對倉儲管理小專案偏重），但以下三件事可以馬上拿來用：
1. `AGENTS.md` 當唯一來源 → `CLAUDE.md` 只寫「Follow AGENTS.md」（這個 repo 自己就是這樣做的）。
2. 每天跑一次 `docguard verify --instructions` + `docguard guard` 當巡檢報告。
3. 抄 `.jules/RULES.md` 的「排程 AI 規則」寫法，改成你自己的每日巡讀規則。

⚠️ **最大的坑（我讀程式碼發現的）**：規則抽取只認英文。`verify --instructions` 判斷一行是不是「規則」要看到英文的 `must / never / always / do not / should / only…`，正規化時還會把所有非 `a-z0-9` 字元刪掉——**中文寫的規則會整個被忽略**（詳見第 9 節）。如果你的 AGENTS.md 是中文，要嘛關鍵規則用英文寫一行，要嘛自己改這段程式。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**（`P/LICENSE`，Copyright (c) 2026 Ricardo Accioly；`package.json` 的 `"license": "MIT"` 一致）。
- **個人使用**：完全自由，可以改、可以拆程式碼。
- **公司商用**：也可以，包括把程式碼拆進你自己的閉源工具。唯一義務是在你散布的副本裡保留原本的著作權聲明與 MIT 授權全文。沒有擔保。
- **子資料夾授權**：`extensions/spec-kit-docguard/LICENSE` 另有一份 LICENSE 檔（未逐字比對內容，未確認是否與根目錄相同）。
- **付費版／閉源功能**：沒有看到。`PRIVACY.md` 明說沒有帳號、沒有 API Key、沒有伺服器端元件。README 有「Enterprise Adoption」「AI Skills (Enterprise)」字樣，但那只是功能名稱，程式碼都在 repo 裡，不是付費牆。
- **它會碰到的第三方**：選用的 GitHub Spec Kit（`specify` CLI，另一個專案，有自己的授權）、Google Jules（只有作者自己的維護流程用）。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | JavaScript ES Modules（`.mjs`），`"type": "module"` |
| 執行環境 | Node.js ≥ 18（`package.json` `engines`）；CI 矩陣測 18／20／22／24（`P/.github/workflows/ci.yml` 第 23 行） |
| 依賴 | **只有一個**：`@babel/parser` 7.29.11（精確鎖版，載入失敗會退回正規表示式模式）。沒有 dev dependencies，測試用內建 `node:test` |
| 前端／後端／資料庫 | 都沒有。純 CLI＋選用的 MCP 伺服器（stdio 或本機 HTTP） |
| 狀態儲存 | 專案內的純文字檔：`.docguard.json`（設定）、`.docguard/`（修正紀錄、分數歷史、快取）、`.docguard-archive.json`（退休文件紀錄）、`.docguard-specs.json`（規格登錄） |
| 安裝方式 | `npx docguard-cli <指令>`、`npm i -g docguard-cli`、`pip install docguard-cli`（只是包一層 npx，仍需 Node）、Homebrew、Docker 映像（MCP 伺服器）、pre-commit、GitHub Action（`action.yml`）、Spec Kit 擴充 |
| 硬體／GPU | 不需要 GPU；一般筆電即可 |
| API Key 與費用 | **不需要任何 API Key，工具本身零費用**。它不呼叫任何 LLM；需要「判斷」的部分會輸出成任務清單，讓你已經在用的 Claude Code／Codex 去做（那部分的費用就是你原本的訂閱或 token 費） |
| 網路 | 核心不連網（`PRIVACY.md`）。例外：`docguard upgrade` 會查 npm registry；`upgrade --pr`、`impact --prs` 會呼叫你本機的 `gh` CLI。我 grep `cli/` 裡的 `fetch(`／`https.request`，只有 `cli/commands/upgrade.mjs` 真的發請求（`cli/scanners/frontend.mjs` 的命中是註解／偵測字串） |
| Git | 很多檢查（Freshness、退休、規則載入）要讀 Git 歷史；CI 範本特別要求 `fetch-depth: 0` |

---

## 4. 程式架構地圖

計數方式：`git ls-tree -r --name-only HEAD | wc -l` = 1,379 個檔案；`ls cli/commands | wc -l` = 40；`ls cli/validators | wc -l` = 36；`ls cli/scanners | wc -l` = 73；`find cli -name '*.mjs' | xargs cat | wc -l` = 74,426 行；`ls tests/*.test.mjs | wc -l` = 297 個測試檔；`specs/` 底下 357 個檔案（規格文件，本次未展開閱讀）。

```
docguard/
├── cli/
│   ├── docguard.mjs              ← 進入點，switch(command) 分派到各指令（約 L1021–L1181）
│   ├── commands/   (40 檔)       ← 每個子指令一支：guard / diagnose / fix / agents / rules / verify /
│   │                               retire / memory / hooks / mcp / ci / specs / impact / watch …
│   ├── validators/ (36 檔)       ← guard 跑的驗證器，每個都是 (projectDir, config) → 結果，互不 import
│   │     freshness.mjs           ← 文件過期偵測（last-reviewed、commit 數、天數）
│   │     path-scoped-rules.mjs   ← AI 規則檔的範圍 glob／指向檔案是否還存在／載入量超標
│   │     drift.mjs               ← 程式碼裡的 // DRIFT: 必須在 DRIFT-LOG.md 登記
│   │     document-lifecycle.mjs  ← 文件狀態（superseded…）與完成訊號
│   │     metrics-consistency.mjs ← 文件裡寫死的數字是否和實際一致
│   │     suppressions.mjs        ← 忽略規則是否過期、有沒有寫理由
│   ├── scanners/   (73 檔)       ← 讀程式碼／文件抽出事實
│   │     instruction-audit.mjs   ← ★ AGENTS.md / CLAUDE.md 重複、矛盾、死連結
│   │     instruction-scopes.mjs  ← ★ 各家 AI 工具（Codex/Claude/Cursor/Copilot/OpenHands）載入規則的模型
│   │     agent-instructions.mjs  ← AGENTS.md 鏈長度（Codex 預設 32 KiB 上限）
│   │     lifecycle-status.mjs    ← 解析文件頂端 Status:
│   │     spec-registry.mjs       ← 規格登錄、規格重疊相似度
│   │     routes / schemas / env … ← 各語言路由、資料模型、環境變數掃描
│   ├── writers/                  ← SARIF、JUnit、歷史紀錄、機械式修正寫入（交易式寫檔）
│   ├── shared-ir.mjs             ← ★ 81 行、零 import 的 TF-IDF + cosine 相似度
│   └── findings.mjs              ← 統一的 finding 格式（code/severity/disposition/confidence…）
├── extensions/spec-kit-docguard/ ← Spec Kit 擴充：commands/*.md、skills/*/SKILL.md、bash 腳本、workflow 範本
├── .agent/skills/ .claude/skills/ .agents/skills/ ← 這個 repo 自己裝的技能（docguard-* 與 speckit-*）
├── commands/                     ← 4 個斜線指令 /docguard.guard|review|fix|score
├── templates/                    ← AGENTS.md、DRIFT-LOG.md、ADR、ARCHITECTURE… 等 18 種文件範本＋CI 範本
├── .jules/                       ← ★ 排程 AI（Google Jules）例行任務的規則、preflight、routines
├── .github/scripts/jules-*.mjs   ← 排程 AI 的 PR 分流／去重複政策
├── .specify/                     ← Spec Kit 設定，含 constitution.md（專案憲法）
├── docs/ docs-canonical/         ← 使用文件與本專案自己的「正典文件」
├── AGENTS.md / CLAUDE.md         ← ★ 「CLAUDE.md 只說請照 AGENTS.md」的實例
├── benchmarks/                   ← 偵測精準度與「給 AI 的 context 有沒有用」的實驗
└── tests/                        ← 297 個 node:test 測試檔
```

---

## 5. 核心功能怎麼實作

### 5.1 AI 規則檔互相打架的偵測（`verify --instructions`）
- 位置：`P/cli/scanners/instruction-audit.mjs`（475 行）、輸出在 `P/cli/commands/verify.mjs#L215-L292`
- 重點：
  - 只讀**根目錄**的 `AGENTS.md`、`CLAUDE.md`（`INSTRUCTION_FILES`，`P/cli/scanners/instruction-audit.mjs#L48-L52`）。帶有 `docguard:agents-sync` 標記的檔案會跳過（因為它是 AGENTS.md 的自動複本，比下去全部都會是重複）。
  - 「規則」的判定：清單項目或句子裡有 `must|never|always|do not|don't|should|require|forbid|only`（`SIGNAL_RE`，L52）；跳過程式碼區塊、表格、HTML 註解（L87-L118）。
  - 正規化：轉小寫、去標點、只留 `a-z0-9`（L60-L68）。
  - **確定性發現**（L231-L321）：
    1. 重複：正規化後完全相同（不論在同檔或跨檔）。
    2. 直接相反：把 never/always/must/do/not 等極性字去掉後內容相同，但否定詞個數奇偶不同 → 例如「never use tabs」vs「always use tabs」。
    3. 過期指標：規則裡用反引號寫的檔案路徑在 repo 裡找不到（只寫檔名時會掃整個 repo 找唯一同名檔，多個同名就回報「模糊」）。
    4. 過期指令：反引號裡的 `docguard <cmd>` 不是現存指令。
  - **交給 AI 判斷的任務**（L426-L461）：兩條規則共享 ≥2 個有意義字根（有簡單 stemmer 和停用字表）就配成一對，**跨檔的配對優先**（AGENTS vs CLAUDE 分歧是最常見的漂移），最多 40 對，每對附一段英文指令：「判斷這兩條規則實務上是否矛盾；若矛盾說明哪條該贏、為什麼、改哪個檔；若只是重複說刪哪一份」。
  - 這個「確定性先做、需要判斷的再丟給 AI」的分工，正是你要的每日巡讀架構。

### 5.2 單一事實來源：AGENTS.md → 其他 AI 規則檔（`agents --sync / --check`）
- 位置：`P/cli/commands/agents.mjs`
- 重點：
  - 目標清單 `AGENT_TARGETS`（`#L22-L54`）：cursor→`.cursor/rules/cdd.mdc`、copilot→`.github/copilot-instructions.md`、cline→`.clinerules`、windsurf→`.windsurfrules`、claude→`CLAUDE.md`、gemini→`.gemini/settings.json`。**沒有 Codex**——因為 Codex 本來就直接讀 `AGENTS.md`。
  - 產生的檔案會加 `<!-- docguard:agents-sync source=AGENTS.md hash=<sha256 前 16 碼> -->` 和「Do not edit — regenerate」（`#L56-L92`）；JSON 用 `_docguardSync` 欄位；Cursor `.mdc` 的標記放在 frontmatter 之後。
  - `--check`（`#L227-L252`）：比對每個複本記錄的雜湊與目前 AGENTS.md 的雜湊，不同就印「is stale」並 `process.exitCode = 2`。**沒有標記的檔案視為你手寫的，不檢查也不覆蓋**（除非 `--force`，會先備份 `.bak`）。
  - 產生的 `CLAUDE.md`（`#L338-L357`）＝ CDD 區塊＋「Pre-Implementation Checklist」（看了哪些文件、既有模式、方案、要改哪些檔、風險等級）＋整份 AGENTS.md。

### 5.3 「這個資料夾 AI 到底讀了哪些規則？」（`rules --for`）
- 位置：`P/cli/scanners/instruction-scopes.mjs`（392 行）、`P/cli/commands/rules.mjs#L22-L45`
- 重點：在註解裡寫明了各家載入規則（作者註記 2026-09-30 對照各家官方文件，`#L9-L21`）：
  - **Codex**：每層資料夾的 `AGENTS.override.md` 或 `AGENTS.md`，從根目錄串到葉節點。
  - **Claude Code**：每層的 `CLAUDE.md`／`CLAUDE.local.md`（**只有整條路徑上都沒有 CLAUDE 檔時才讀 AGENTS.md**）、`.claude/rules/**.md`（用 `paths:` 限定範圍）、skills（`paths:`）。
  - **Cursor**：`.cursor/rules/**.mdc`（`.md` 會被忽略）、`alwaysApply` 或 `globs:`。
  - **Copilot**：`.github/copilot-instructions.md`、`.github/instructions/**.instructions.md`（`applyTo:`）、最近的 AGENTS.md。
  - **OpenHands**：`.agents/skills`、`.openhands/skills` 的 SKILL.md。
  - 還會跟著 Claude 的 `@path` import 最多 5 層（`#L95-L113`），把實際載入的位元組算進去。
- 這段對你「讓 GPT 和 Claude 讀同一份規則」非常有價值：**Claude Code 有 CLAUDE.md 時不會自動讀 AGENTS.md**，所以 CLAUDE.md 要嘛 `@AGENTS.md` import，要嘛像本 repo 一樣寫「Follow AGENTS.md」，要嘛用 `agents --sync` 產生。

### 5.4 規則檔指向失效／載入過量（Path-Scoped-Rules 驗證器）
- 位置：`P/cli/validators/path-scoped-rules.mjs`（L1-L19 列出代碼）、`P/cli/scanners/agent-instructions.mjs#L1-L18`
- PSR001 範圍 glob 一個檔都對不到（規則永遠不會載入）；PSR002 規則指向的路徑不存在（包含「做 X 請讀 docs/x.md」這種路由表）；PSR003 某路徑載入的規則超過預算；PSR004 範圍語法 AI 工具或 DocGuard 讀不懂。預算預設 32,768 bytes——依據是 Codex 的 `project_doc_max_bytes` 預設 32 KiB，**超過的部分會被靜默丟掉，而且被丟的是最深層、最具體的那幾份**。

### 5.5 過期偵測（Freshness）
- 位置：`P/cli/validators/freshness.mjs`
- `readLastReviewedDate`（`#L93-L106`）讀 `<!-- docguard:last-reviewed YYYY-MM-DD -->`，代表「人看過、確認仍正確，即使沒改內容」。
- 門檻（`#L272-L273`）：`REVIEW_THRESHOLD_DAYS = 30`、`WARNING_THRESHOLD_COMMITS = 10`。
- FRS002（`#L340-L348`）：上次複查後 ≥10 次程式碼 commit；FRS003：比最新程式碼早 30 天以上；FRS004：CHANGELOG 超過 7 天沒跟上；FRS005：最近新增 `// DRIFT:` 註解但 DRIFT-LOG 沒更新。
- 特別設計：這些都標成 `escalate`（「該複查了」，不是「文件錯了」），README 明講「為了讓警告消失而亂改文件是破壞訊號」。

### 5.6 新舊版本：文件生命週期與退休
- `P/cli/scanners/lifecycle-status.mjs#L10-L16`：讀文件前 40 行的 `Status:`，`archived / deprecated / obsolete / superseded` 視為已退休。
- `P/cli/scanners/document-lifecycle.mjs`：tasks 清單全打勾（`- [x]` 且沒有 `- [ ]`）會被當成「可能已完成」的訊號，但只是建議。
- `P/cli/commands/retire.mjs`（L1-L8 說明設計意圖）：「歷史文件離開工作目錄，AI 就不會把它當成現行意圖；Git 仍保存內容」，在 `.docguard-archive.json`（L27）記錄原因與還原方式。

### 5.7 規格重疊（防重複）
- `P/cli/scanners/spec-registry.mjs#L783-L795`：用 Jaccard（字詞集合交集／聯集）算新草稿與舊規格的需求文字相似度，`#L867-L871` 取 ≥0.25 列為「僅供審查的語意重疊」。只抓英文字（`[a-z][a-z0-9_-]{3,}`）。
- `P/cli/shared-ir.mjs`：81 行、零依賴的 TF-IDF＋cosine，用在需求↔測試的追溯。

### 5.8 兩個 PR（兩個 AI）同時改同一份文件
- `P/cli/commands/impact.mjs#L90-L125`（`computeDocConflicts`）：透過 `gh` 拉開啟中的 PR，計算每個 PR 影響哪些正典文件，兩個 PR 碰到同一份文件就標「合併順序風險」。對「Claude 開一支分支、Codex 開另一支」很實用。

### 5.9 Claude Code 即時提醒 hook
- `P/cli/commands/hooks.mjs#L609-L614`：在 `.claude/settings.json` 加 `PostToolUse`，matcher `Edit|Write|MultiEdit`，執行 `docguard nudge-hook`。AI 改了正典文件就提醒跑 `guard --changed-only`，改了文件有提到的程式碼就提醒跑 `impact`。每個檔案 30 分鐘最多提醒一次；`.claude/settings.json` 不是合法 JSON 時拒絕修改；只增刪自己那一筆。

### 5.10 MCP 伺服器
- `P/cli/commands/mcp.mjs#L87-L224`：我數到 12 個工具（`grep -n "name: 'docguard_"`）：`docguard_guard / score / explain / verify_evidence / verify_claims / report / docs_for_path / doc_structure / read_section / task_context / anchors / diagnose`。唯讀。`claude mcp add docguard -- npx -y docguard-cli mcp` 即可接到 Claude Code。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 規則重複／矛盾／死連結偵測 | `P/cli/scanners/instruction-audit.mjs` | Node 內建 fs/path；`../shared-html-comments.mjs`、`../shared-ignore.mjs` | 中 | 抽出 `extractInstructionRules`、`findDeterministicFindings`、`buildInstructionAuditTasks` 三個函式；**要改 `SIGNAL_RE` 加中文（必須、禁止、不要、一律、只能、絕不）與 `normalizeRule` 保留中文字**，再把 `INSTRUCTION_FILES` 擴充成掃全部子資料夾與 `.claude/skills/**/SKILL.md` |
| AGENTS.md → CLAUDE.md 雜湊同步 | `P/cli/commands/agents.mjs#L56-L92` 與 `#L227-L252` | `node:crypto` | 低 | 40 行就能重寫：讀 AGENTS.md → sha256 前 16 碼 → 寫入標記；`--check` 比對雜湊。適合放進你的每日巡讀腳本 |
| 各家 AI 載入規則的模型 | `P/cli/scanners/instruction-scopes.mjs#L9-L59` | `./frontmatter.mjs`、`../shared-ignore.mjs` | 中 | 就算不用程式碼，註解本身就是一份「Codex／Claude／Cursor／Copilot 各讀哪裡」的對照表，可直接寫進你的架構文件 |
| last-reviewed 過期判斷 | `P/cli/validators/freshness.mjs#L93-L106`、`#L272-L365` | `git` 指令 | 低 | 只取「讀 HTML 註解日期＋算之後幾次 commit」這一段；你的倉儲 app 每份規則文件頂端加日期即可 |
| 文件狀態解析 | `P/cli/scanners/lifecycle-status.mjs` | 無 | 低 | 16 行；拿來在巡讀時把 superseded 文件排除或警告 |
| TF-IDF 相似度 | `P/cli/shared-ir.mjs` | 無 | 低 | 拿來偵測「兩份文件／兩條規則講同一件事」；中文需自己改成 2-gram 斷詞再丟進去 |
| PR 間文件衝突 | `P/cli/commands/impact.mjs#L90-L125` | `gh` CLI | 中 | 多 AI 各開分支時，每日巡讀列出「哪兩個分支同時動了同一份規則／文件」 |
| Claude PostToolUse 提醒 hook | `P/cli/commands/hooks.mjs#L609-L614` | 無 | 低 | 照抄 JSON 結構，把 command 換成你自己的檢查腳本 |
| 排程 AI 例行任務規則 | `P/.jules/RULES.md`、`P/.jules/routines/docs-drift.md`、`P/.jules/README.md` | 無（是文件） | 低 | 改寫成 Codex／Claude 每日巡讀的規則：preflight 決定做不做、沒發現就不開 PR、一次只處理一個目標、不准問問題（沒人回答）、PR 格式三段（Evidence／What changed／Dropped） |
| Preflight（今天要不要做事） | `P/.jules/preflight.mjs`、`P/.github/scripts/jules-policy.mjs` | GitHub API | 中 | 概念可借：輸出 `GO <目標>` 或 `STOP: 原因`，避免排程 AI 每天產生重複或空 PR |
| SKILL.md 範本 | `P/extensions/spec-kit-docguard/skills/docguard-guard/SKILL.md` | 無 | 低 | frontmatter（name／description／compatibility／metadata.version）＋「先 triage disposition 再看 severity」的寫法 |
| AGENTS.md／DRIFT-LOG 範本 | `P/templates/AGENTS.md.template`、`P/templates/DRIFT-LOG.md.template` | 無 | 低 | 直接複製改中文 |

---

## 7. AI／Claude 整合

- **用哪些模型**：工具本身**不呼叫任何模型**（`PRIVACY.md`：「deterministic core makes no network calls」）。需要判斷的地方產生任務／prompt，交給你的 AI agent。
- **prompt 放在哪**：
  - 規則矛盾判斷的指令字串：`P/cli/scanners/instruction-audit.mjs#L449-L460`。
  - `diagnose`／`fix --format prompt` 產生修文件的 prompt（在 `cli/commands/diagnose.mjs`、`fix.mjs`，未逐行閱讀）。
  - 技能（behavior protocol）：`P/extensions/spec-kit-docguard/skills/*/SKILL.md`，5 個：guard（233 行）、fix（265 行）、review（232 行）、score（204 行）、sync（144 行）。
  - 斜線指令：`commands/docguard.{guard,review,fix,score}.md`。
- **MCP**：有，12 個唯讀工具（見 5.10）；還有 Claude Desktop 的 `.mcpb` 套件、官方 MCP registry 登錄（`server.json`）。
- **Skills**：有，安裝位置依 AI 工具而定（`P/docs/reference/agents.md` 第 125-129、140-149 行）：Claude Code → `.claude/skills/`；Codex → `.agents/skills/`；Cursor → `.cursor/skills/`；generic → `.agent/skills/`。
- **能不能換成 Claude**：本來就是「原生」支援 Claude Code（MCP、skills、PostToolUse hook、CLAUDE.md 產生）；同時原生支援 Codex（`.agents/skills`、AGENTS.md 鏈、32 KiB 預算）。這個 repo 自己的 `.specify/integration.json` 就同時裝了 `claude` 與 `codex` 兩個整合——**正是你要的「GPT＋Claude 共用一套規則」的實例**。

---

## 8. 擴充方式與 API

- **設定檔 `.docguard.json`**（實例 `P/.docguard.json`）：`requiredFiles`（含 `agentFile: ["AGENTS.md","CLAUDE.md"]`）、`validators` 開關、`severity` 與 `findingSeverity`（單一代碼升降級）、`ownership`（每個程式碼路徑由哪份文件哪個章節負責——很像「誰對哪塊負責」的角色表）、`specFirst`（改到某些路徑必須對應規格）。Schema：`schemas/docguard-config.schema.json`。
- **機器可讀輸出**：`--format json`（finding 有穩定代碼如 `FRS002`、`PSR002`）、`--format sarif`（GitHub Code Scanning）、`--format junit`。
- **忽略**：`.docguardignore` 支援 `# reason` 與 `expires:` 到期日，到期自動失效（Suppressions 驗證器）——防止「暫時忽略」變成永久。
- **基準線**：`guard --update-baseline` 凍結現有問題，之後只擋新問題，適合舊專案導入。
- **新增驗證器**：`cli/validators/*.mjs` 每個是 `(projectDir, config)` 的純函式且不得互相 import（`P/.specify/memory/constitution.md` 原則 IV）。要加自己的檢查（例如中文規則重複）可以照這個介面寫，但需改 `guard.mjs` 的註冊（我看到 `guard.mjs` 有 36 行 `import { validate…`，未細讀註冊表）。
- **Spec Kit hooks**：`before_specify`、`before_tasks`、`after_implement` 等（README「Workflow Hooks」）。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。2026-03-13 建立，到 2026-11-04 `CHANGELOG.md` 有 104 個版本標題（`grep -c '^## \['`，含 Unreleased），最新 0.46.0 是 2026-11-04 當天；10 月就出了 0.43–0.45 多個版本。看起來主要是一位作者（Ricardo Accioly）＋排程 AI（Jules）＋ Dependabot；淺層 clone 看不到貢獻者數，**未確認**。星數只有 32，社群小。
- **測試**：297 個測試檔，CI 跑 Node 18/20/22/24；專案用自己檢查自己（dogfooding）。
- **誠實度高**：README 引用研究指出「repo context 檔案不一定提升 AI 成功率」，自己的 agent-context benchmark（`benchmarks/agent-context/results/README-v3.md`）也老實寫「symbol map 沒有帶來預定的效益，所以維持選用」。finding 有 `evidence.status: measured / not-measured`，承認多數代碼的準確度沒被量測過。
- **資安／隱私**：無遙測、無帳號；MCP HTTP 預設只綁 loopback，非 loopback 要 `--api-key`；`specify` 呼叫改成陣列參數防命令注入（`P/cli/ensure-skills.mjs` 的 `safeSpawnSpecify` 註解提到 issue #190）。供應鏈：1 個鎖版依賴、npm provenance。
- **已知的坑**：
  1. **中文規則抓不到**（重要）：`SIGNAL_RE` 只認英文情態詞（`P/cli/scanners/instruction-audit.mjs#L52`），`normalizeRule` 用 `.replace(/[^a-z0-9\s]/g, ' ')` 把中文全部刪掉（`#L60-L68`）。所以中文寫的「一律使用…／禁止…」不會被當成規則；就算被當成規則，正規化後也只剩英文殘字，會產生錯誤的「重複」。規格重疊（`spec-registry.mjs#L783`）也只看英文字。
  2. `verify --instructions` 只看**根目錄**的 AGENTS.md 和 CLAUDE.md，不看子資料夾、`.claude/rules`、SKILL.md（子資料夾與 skills 的「死連結」則由 Path-Scoped-Rules 驗證器處理，但不做重複／矛盾判斷）。
  3. 方法論很重：完整採用要有 `docs-canonical/ARCHITECTURE.md、DATA-MODEL.md、SECURITY.md、TEST-SPEC.md、ENVIRONMENT.md`、`CHANGELOG.md`、`DRIFT-LOG.md`。對單人小專案，建議用 `--profile starter`（README 旗標表有列，但我沒讀 `docs/profiles.md` 的細節，starter 具體少哪些檢查**未確認**）或只用個別指令。
  4. Firebase：只在 `cli/scanners/integrations.mjs` 第 33 行被辨識為「Database 整合」；Firestore 集合、Cloud Functions 路由**不會**被當成 API／資料模型掃描（我沒找到相關 scanner）。你的倉儲 app 的資料模型文件檢查效果會打折。
  5. 指令很多（40 個 command 檔）、版本更新快，`docs` 與 CLI 偶有差距——作者自己就排了每週 docs-drift 例行任務在修。
  6. 退休（`retire`）會**刪除工作目錄裡的檔案**（靠 Git 保留），要從 repo 根目錄執行；先用 `--plan` 看清單。

---

## 10. 跟其他專案組合的建議

- **DocGuard（巡檢、抓過期／重複／矛盾）＋ GitHub Spec Kit（規格流程、constitution）**：本來就是官方社群擴充，一起用最順。Spec Kit 負責「寫規格」，DocGuard 負責「驗規格、防漂移」。
- **DocGuard ＋ OpenSpec 或 BMAD 一類的角色／流程框架**：那些負責定義「PM／架構師／開發／QA」角色與交接，DocGuard 負責每天檢查它們產生的文件有沒有過期或互打。DocGuard **本身沒有角色系統**。
- **DocGuard ＋ obra/superpowers、anthropics/skills 一類的技能庫**：技能庫提供 SKILL.md 寫法與行為協定；DocGuard 的 Path-Scoped-Rules 驗證器可以檢查這些 SKILL.md 指向的檔案是否還在、Claude 載入量有沒有爆。
- **給你的最小組合（建議）**：
  1. `AGENTS.md`（唯一規則來源，中英並列關鍵規則）＋ `CLAUDE.md`（一行 `@AGENTS.md` 或「Follow AGENTS.md」）。
  2. 每份規則／文件頂端：`Status: current|superseded` 與 `<!-- docguard:last-reviewed YYYY-MM-DD -->`。
  3. GitHub Actions 每日排程：`docguard verify --instructions --format json`、`docguard agents --check`、`docguard guard --format json` → 結果交給 Claude Code（或 Codex）做「配對判斷」並寫成一份巡讀報告／PR。
  4. 規則參照 `.jules/RULES.md` 改寫成你的「巡讀 AI 守則」。
  5. 中文規則偵測：自己把 instruction-audit.mjs 的兩個正規表示式改成支援中文（拆出難度「中」）。

---

## 11. 規則／角色／巡檢 檢查表

**共用規則怎麼寫**
- 檔案結構（AGENTS.md／CLAUDE.md／rules／constitution）：**有**。`AGENTS.md` 為權威，`CLAUDE.md` 只轉指（`P/CLAUDE.md` 第 1-8 行：「Follow `AGENTS.md`. It is the authoritative workflow and evidence contract」）；另有 Spec Kit 的 `P/.specify/memory/constitution.md`（專案憲法，原則 I–IV 等）。範本 `P/templates/AGENTS.md.template`。
- 分層（全域／專案／子資料夾）：**有（偵測與說明層面）**。`P/cli/scanners/instruction-scopes.mjs#L9-L21` 寫清楚各工具「根→葉」的載入順序、Claude 的 `CLAUDE.local.md`、`.claude/rules` 的 `paths:`。使用者家目錄的全域規則（`~/.claude/CLAUDE.md`）被刻意略過（`#L128`：`~` 與 `/` 開頭視為使用者自己的檔）。
- 優先順序：**有（部分）**。Codex：`AGENTS.override.md` 取代同層 `AGENTS.md`；Claude：有 CLAUDE 檔就不讀 AGENTS.md；本 repo CLAUDE.md 寫明「記憶內容只是 context，不是權威；與 docs-canonical/ 和 AGENTS.md 衝突時以後者為準」。`findingSeverity` 優先於 validator severity（README）。
- 怎麼讓 GPT（Codex）和 Claude 讀同一份規則：**有**。三種做法：(a) `docguard agents --sync` 從 AGENTS.md 產生 CLAUDE.md 並用雜湊檢查是否過期（`P/cli/commands/agents.mjs#L56-L92`）；(b) CLAUDE.md 轉指 AGENTS.md；(c) Spec Kit 同時裝 claude 與 codex 整合，技能分別放 `.claude/skills/` 與 `.agents/skills/`（`P/.specify/integration.json`）。

**角色設計**
- 角色／職責：**沒有**（DocGuard 不定義 PM／開發／QA 等 AI 角色）。最接近的是 `.docguard.json` 的 `ownership`：每個程式碼路徑由哪份文件哪個章節「負責」（`P/.docguard.json`），以及 Doc-Ownership 驗證器檢查無人負責或兩個同等負責人。
- 技能（skills）：**有**，5 個 docguard-* 技能（guard／fix／review／score／sync），`P/extensions/spec-kit-docguard/skills/`。
- 可用工具：**有**，12 個 MCP 工具（`P/cli/commands/mcp.mjs#L87-L224`）。
- 交接（handoff）：**部分**。`docguard-guard` 技能說可「chain to docguard-fix」（SKILL.md description）；Spec Kit hooks 在 specify 前 brief、tasks 前 preflight、implement 後 guard。排程 AI 的 PR 有固定三段格式（Evidence／What changed／Dropped，`P/.jules/RULES.md` §3）。
- 誰向誰負責：**部分**。`.jules/README.md`：Jules PR 先被 triage workflow 分流，只有「新增測試檔」能自動合併，其餘一律等維護者審查；`.github/CODEOWNERS` 存在（未讀內容）。

**防漏**
- 任務追蹤：**有**。TODO-Tracking 驗證器抓未追蹤的 TODO/FIXME 與 skip 的測試；Spec Kit 的 `tasks.md` T-ID；文件生命週期把「tasks 全打勾」當完成訊號（`P/cli/scanners/document-lifecycle.mjs`）。
- 完成前驗證：**有**。AGENTS.md 工作流第 7 步「Verify with `docguard guard` — all checks must pass」；`specs complete` 需要證據；Traceability 驗證器檢查需求 ID 有對應測試。
- 交接紀錄：**有**。`DRIFT-LOG.md`（`// DRIFT:` 必須登記，`P/templates/DRIFT-LOG.md.template`）、`CHANGELOG.md`、`.docguard/fixed.json`（機械修正稽核紀錄，`fix --history`）。

**防重複**
- 重複規則：**有**（英文）。`P/cli/scanners/instruction-audit.mjs#L231-L242` 正規化後完全相同即報重複；`#L426-L461` 主題相近配對交 AI 判斷。
- 重複內容／規格：**部分**。`specs preflight` 用 Jaccard ≥0.25 報「語意重疊」（`P/cli/scanners/spec-registry.mjs#L783-L795`）；Agent-Readability 報同一文件內重複標題。沒有「兩份文件段落重複」的全專案偵測。
- 重複角色：**沒有**。
- 防止自動複本被誤判為重複：**有**，帶 `docguard:agents-sync` 標記的檔案跳過（`#L92`）。

**防新舊版本衝突**
- 版本標記：**有**。文件 `Status:`（`P/cli/scanners/lifecycle-status.mjs`）；技能 SKILL.md 有 `metadata.version` 與 `<!-- docguard:version: 0.46.0 -->`；Metadata-Sync 驗證器檢查文件間版本號一致；AGENTS.md 刻意不寫版本號（「see package.json (single source of truth — do not hardcode here)」）。
- 單一事實來源：**有**。AGENTS.md 為規則來源、package.json 為版本來源、docs-canonical 為設計意圖來源；Metrics-Consistency 抓「文件裡寫死的數字」與實際不符。
- 變更提案／封存：**有**。`retire --plan / --check` 與 `.docguard-archive.json`（`P/cli/commands/retire.mjs`）；Decision-Records 驗證器檢查 ADR 的 supersession 是否單向、是否懸空。
- 過期偵測（staleness／drift）：**有**。Freshness（`P/cli/validators/freshness.mjs#L272-L365`）、Reference-Existence（文件裡的程式符號在上次更新時存在、現在消失）、Diff-Suspicion、`agents --check` 雜湊比對、Suppressions 到期。

**定期巡檢**
- 排程／每日巡讀：**部分**。DocGuard 本身沒有內建 cron；給使用者的 CI 範本 `P/templates/ci/github-actions.yml` 只在 push／PR 觸發（你要自己加 `schedule:`）。`CI-RECIPES.md` Recipe 3 建議「排程產生 diff、先查是否已有修復 PR、只有真的有事才開新 PR、乾淨就安靜」。另有 `watch`（即時）、pre-commit hook、Claude PostToolUse 提醒 hook（`P/cli/commands/hooks.mjs#L609-L614`）。
- 作者自己的排程 AI：**有**，值得照抄。`P/.jules/README.md`：bug-hunt（週一）、test-gaps（週三）、docs-drift（週五）；`P/.jules/RULES.md`：preflight 先決定 GO/STOP、沒發現就不開 PR、一個 PR ≤10 檔、**排程任務不准問問題（沒人回答會卡死），遇到不確定選「較保守的選項」或結束並寫摘要**、紅燈先不要修。
- 報告格式（依 `P/cli/commands/verify.mjs#L240-L291` 的列印字串推回的範例）：
  ```
  🔬 DocGuard Verify — instruction audit
     my-warehouse · duplicate / contradictory / stale rules in AGENTS.md + CLAUDE.md
    14 rule(s) extracted from AGENTS.md + CLAUDE.md
    3 deterministic finding(s):
      ⚠ duplicate rule — AGENTS.md:12 ≡ CLAUDE.md:30: "Never commit without explicit approval"
      ⚠ negation conflict — AGENTS.md:20 ⇄ CLAUDE.md:41: "Always use tabs" vs "Never use tabs"
      ⚠ stale pointer — AGENTS.md:33: docs/old-inventory.md does not exist
    1 rule pair(s) for the agent to judge:
    AGENTS.md:8 ↔ CLAUDE.md:15 (shared: firebase, deploy)
  ```
  JSON 版有 `ruleCount / findingCount / findings / taskCount / tasks / howToVerify`（`#L224-L237`），適合交給 Claude 做第二階段判斷。

**Skill 寫法**
- SKILL.md 格式：**有**。`P/extensions/spec-kit-docguard/skills/docguard-guard/SKILL.md#L1-L12`：YAML frontmatter `name`、`description`（多行）、`compatibility`（需要什麼才能跑）、`metadata`（author／version／source），之後 `<!-- docguard:version -->`、「Running DocGuard」、「User Input `$ARGUMENTS`」、「Goal」、步驟。
- description 怎麼寫：**有範例**。先講做什麼，再講「Use as a quality gate before commits or after implementation phases」這種觸發時機（guard 技能）；review 技能寫明「read-only」與「Modeled after speckit-analyze」。沒有另外寫觸發準確度的測試（未確認）。
- 資料夾結構：**有**。`skills/<name>/SKILL.md`；Path-Scoped-Rules 驗證器把技能內的 `scripts/`、`references/`、`assets/` 相對路徑視為技能自己的資料夾（`P/cli/validators/path-scoped-rules.mjs` 的 `SKILL_DIRS_RE`）。
- 腳本放哪：**有**。擴充的 bash 腳本在 `extensions/spec-kit-docguard/scripts/bash/`（check-docs、suggest-fix、init-doc，都支援 `--json`）。

**支援哪些工具與安裝方式**
- **有**。Claude Code（MCP、skills、CLAUDE.md、hook）、Codex（AGENTS.md 鏈、`.agents/skills`）、Cursor、GitHub Copilot、OpenHands、Windsurf、Cline、Gemini CLI、Kiro（README 表格）。安裝：`npx docguard-cli init`、`claude mcp add docguard -- npx -y docguard-cli mcp`、`docguard hooks --claude`、`docguard init --with agents,hooks,ci`。

**可以直接借用到你「基礎架構」的檔案或段落**
1. `P/CLAUDE.md` — 「CLAUDE.md 只指向 AGENTS.md，記憶只是 context 不是權威」的寫法。
2. `P/AGENTS.md` 的「Workflow」7 步與「Consuming Guard Output」段 — 「先看 disposition：act 直接修、escalate 要人判斷」的分級觀念，可直接移植到你的巡讀報告。
3. `P/templates/AGENTS.md.template#L74-L93` — Workflow Rules 與 File Change Rules（改 >3 個檔要核准、改資料模型要更新 DATA-MODEL.md、沒核准不 commit）。
4. `P/templates/DRIFT-LOG.md.template` — 「刻意偏離規格」的登記表。
5. `P/.jules/RULES.md` 全文 — 排程巡讀 AI 的守則（GO/STOP、無發現不開 PR、不准發問、保守選項、PR 三段格式、禁止修改清單）。
6. `P/.jules/routines/docs-drift.md` — 「什麼算 drift、什麼不算」的清單寫法，可改成「什麼算規則衝突、什麼只是措辭不同」。
7. `P/cli/scanners/instruction-scopes.mjs#L9-L21` — 各 AI 工具載入規則的對照表。
8. `P/extensions/spec-kit-docguard/skills/docguard-guard/SKILL.md` — SKILL.md 範本。

---

## 關鍵字
DocGuard、docguard-cli、Canonical-Driven Development、CDD、規格驅動開發、Spec-Driven Development、Spec Kit、AGENTS.md、CLAUDE.md、AGENTS.override.md、規則同步、agents --sync、規則重複偵測、規則矛盾、instruction audit、verify --instructions、drift、文件漂移、過期偵測、staleness、freshness、last-reviewed、單一事實來源、single source of truth、文件退休、retire、superseded、DRIFT-LOG、每日巡檢、巡讀、排程 AI、Google Jules、preflight、PostToolUse hook、Claude Code、Codex、Cursor、Copilot、OpenHands、MCP、SKILL.md、技能、path-scoped rules、32 KiB 規則預算、多 AI 協作、MIT
