# dyoshikawa/rulesync — 一份 `.rulesync/` 規則來源，自動產生 Claude Code、Codex 等 70 種 AI 工具設定的 CLI
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：d088ccc
> GitHub：https://github.com/dyoshikawa/rulesync｜⭐ 1583｜授權：MIT｜主要語言：TypeScript｜最近更新：2026-11-04

（下文所有 permalink 都固定在 commit `d088ccc8f436255115e0e7fb95f9ce0778375a4a`。為了易讀，連結文字只寫路徑。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** rulesync 是一支 Node.js 命令列工具。你只要在 `.rulesync/` 資料夾維護「一份」規則（rules）、角色（subagents）、技能（skills）、指令（commands）、MCP、hooks、權限，它就會幫你翻譯成 Claude Code 的 `CLAUDE.md`／`.claude/…`、Codex CLI 的 `AGENTS.md`／`.codex/…`／`.agents/skills/…`，以及 Cursor、Copilot、Gemini 系列等大約 70 種工具各自要的檔案格式。

**對你最有用的地方（你目前的痛點是「GPT 跟 Claude 各讀各的規則、越寫越亂」）：**

1. **單一事實來源（Single Source of Truth）**：規則只在 `.rulesync/rules/*.md` 寫一次，`rulesync generate` 一次產出 `CLAUDE.md`＋`.claude/rules/*.md`（給 Claude）和 `AGENTS.md`（給 Codex）。以後不會發生「CLAUDE.md 改了，AGENTS.md 忘了改」這種新舊版本衝突。
2. **把現有的亂掉的設定收回來**：`rulesync import --targets claudecode` 會把你現在的 `CLAUDE.md`、`.claude/agents`、`.claude/skills` 反向匯入成 `.rulesync/` 格式，等於幫你整理一次。
3. **角色（subagent）也能一份寫兩邊用**：同一個 `.rulesync/subagents/code-reviewer.md` 會變成 Claude 的 `.claude/agents/code-reviewer.md` 和 Codex 的 `.codex/agents/code-reviewer.toml`。
4. **「巡讀」的機械部分它有現成工具**：`rulesync generate --check`（產出檔是否跟來源一致，不一致就失敗）、`rulesync doctor --strict`（設定檔拼錯、目標衝突、Codex `AGENTS.md` 超過 32 KiB 被默默截斷）可以直接放進每天的 GitHub Actions 排程。
5. **它自己的 repo 就是一個很好的「多 AI 協作」範本**：`.rulesync/` 裡有 5 份規則、5 個角色、44 個技能（我用 `ls .rulesync/skills | wc -l` 數的），包括「Implementer＋Reviewer 迴圈直到沒有 high 問題」的 `agent-team`、「叫 GPT 透過 OpenCode 做 review，再由 Claude 查證哪些是幻覺」的 `opencode-gpt-review`，還有每週用 LLM 掃整個 repo 並寄信的排程工作流程。這些都可以照抄成你倉儲系統的版本。

**它不做的事（要先講清楚）：** 它不會幫你判斷「兩條規則內容講的是同一件事」或「這條規則講的跟程式碼現況矛盾」。語意上的重複／衝突偵測要你自己加一個 LLM 巡讀步驟（第 11 節給了做法）。

---

## 2. 授權白話

- **授權：MIT**（[LICENSE](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/LICENSE)，`package.json` 的 `"license": "MIT"` 也一致）。
- **個人使用**：完全自由，安裝、修改、拿程式碼片段來用都可以。
- **公司商用**：也可以，包括放進公司內部工具或做成產品；唯一義務是在你散佈的程式裡保留原本的著作權聲明和 MIT 授權文字。
- **注意：repo 裡有一個例外檔案**：`.rulesync/skills/skill-creator/` 附了 [LICENSE.txt](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/skill-creator/LICENSE.txt)，內容是 **Apache License 2.0**（看起來是從 Anthropic 的 skill-creator 搬來的）。如果你照抄這個 skill，要遵守 Apache-2.0（保留 LICENSE、標註修改）。
- **閉源／付費版**：沒有看到。沒有 Pro 版、沒有雲端服務、沒有登入。FAQ 明講「沒有 GUI 或網頁儀表板」（[docs/faq.md#L144-L151](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/faq.md#L144-L151)）。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | TypeScript（ESM），`package.json` 版本 `43.6.0` |
| 執行環境 | Node.js `>=22.22.0`（`package.json` 的 `engines`）；或者用官方單一執行檔（Linux／macOS／Windows x64，不需要 Node），也可以用 Homebrew tap |
| 主要相依套件 | `commander`（CLI）、`zod`（schema 驗證）、`gray-matter`（Markdown frontmatter）、`js-yaml`／`smol-toml`／`jsonc-parser`（YAML、TOML、JSONC 讀寫）、`globby`、`chokidar`（`--watch`）、`@modelcontextprotocol/sdk`（MCP 伺服器）、`@octokit/rest`（從 GitHub 抓 skills）、`minisearch`（`rulesync docs --search`）、`@toon-format/toon`（TOON 格式清單） |
| 前端／後端／資料庫 | 都沒有。它就是一支本機 CLI，加一個可以選用的 stdio MCP 伺服器 |
| 部署 | 不用部署。`npm install -g rulesync`，或者 `npx rulesync` |
| 硬體／GPU | 不需要 |
| API Key | **CLI 本身不呼叫任何 LLM，所以不用 API Key、也不花錢。** 只有 `fetch`／`install` 抓私有 GitHub repo 時需要 `GITHUB_TOKEN`（或 `gh auth token`） |
| 會連網的地方 | `fetch`／`install`／`add`（GitHub、git、npm registry）、`update`（GitHub Releases）、`release-notes`。`src/` 裡沒有看到遙測程式（見第 9 節） |
| repo 自己的 CI 用到的付費服務（你不需要） | 每週安全掃描用 OpenRouter（`OPENROUTER_API_KEY`）呼叫 LLM，再用 Resend（`RESEND_API_KEY`）寄信。費用要看你選的模型，**未確認** |

安裝方式（摘自 [README.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/README.md)）：

```bash
npm install -g rulesync            # 或 brew tap dyoshikawa/rulesync https://github.com/dyoshikawa/rulesync && brew install rulesync
rulesync init                      # 建立 rulesync.jsonc 與 .rulesync/ 範例
rulesync import --targets claudecode   # 把現有 CLAUDE.md 等匯入
rulesync generate --targets "*" --features "*"
```

---

## 4. 程式架構地圖

檔案數是我從 `git ls-tree -r --name-only HEAD` 的完整清單（1,565 個檔案）用 `grep`／`wc -l` 數出來的：`src/` 底下非測試的 `.ts` 有 731 個、`*.test.ts`／`*.spec.ts` 有 636 個，`src/e2e/` 有 28 個檔案。

```
rulesync/
├── README.md                 ← 支援工具矩陣（由腳本自動產生，CI 會檢查有沒有漂移）
├── rulesync.jsonc            ← 這個 repo 自己的設定：targets 用物件寫法，分別設定 copilot/claudecode/opencode/codexcli/takt
├── .rulesync/                ← ★ 這個 repo 自己的「單一事實來源」（最值得參考的範本）
│   ├── rules/                ← 5 份規則：overview.md（root）、coding-guidelines.md、testing-guidelines.md、feature-change-guidelines.md、github-actions-security.md
│   ├── subagents/            ← 5 個角色：code-reviewer、security-reviewer、diff-analyzer、pr-handler、pr-merger
│   ├── skills/               ← 44 個技能（agent-team、review-pr、goal-pr、triage-issues、opencode-gpt-review、create-scrap-issue…）
│   ├── hooks.json            ← sessionStart 跑 git pull && pnpm i
│   ├── mcp.json / permissions.jsonc
├── skills/rulesync/SKILL.md  ← 官方發佈的「教 AI 用 rulesync」技能（rulesync fetch dyoshikawa/rulesync 會裝這個）
├── docs/                     ← VitePress 文件站。reference/file-formats.md（2,400 行，所有 frontmatter 規格）、reference/cli-commands.md、guide/*
├── scripts/                  ← 開發用腳本：security-scan-*.ts（LLM 安全巡檢）、generate-repomix-xml.ts、generate-supported-tools-tables.ts…
├── .github/workflows/        ← 13 個 workflow，其中 4 個有 cron 排程（security-scan、auto-close-stale-prs、ci-failure-reminder、auto-close-maintainer-scrap-issues）
└── src/
    ├── cli/                  ← commander 程式進入點（index.ts、program.ts、commands/*）
    ├── lib/                  ← 各子命令的核心：generate.ts(1,817 行)、import.ts、convert.ts、doctor.ts(1,060 行)、fetch.ts、install.ts、sources-lock.ts、orphan-sweep.ts、watch.ts…
    ├── features/             ← ★ 每個「功能 × 工具」一個轉換器（986 個檔案）
    │   ├── rules/            ← 77 個非測試 .ts：claudecode-rule.ts、codexcli-rule.ts、agentsmd-rule.ts…、rules-processor.ts(2,405 行)、tool-rule-factories.ts(1,411 行)、instruction-budget.ts
    │   ├── subagents/  skills/  commands/  hooks/  mcp/  permissions/  ignore/  checks/
    ├── types/                ← FeatureProcessor 抽象類別、AiFile、ToolTarget 等共用型別
    ├── constants/            ← 每個工具的路徑常數（claudecode-paths.ts、codexcli-paths.ts…）
    ├── config/               ← rulesync.jsonc ＋ rulesync.local.jsonc ＋ CLI 參數的合併
    ├── mcp/                  ← MCP 伺服器（只暴露 1 個 rulesyncTool）
    ├── utils/                ← frontmatter、檔案、比對、confusable-names（長得像的技能名稱偵測）…
    └── index.ts              ← 程式化 API：generate()、importFromTool()、convertFromTool()
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 規則來源格式（frontmatter schema） | [src/features/rules/rulesync-rule.ts#L34-L60](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/rulesync-rule.ts#L34-L60) | 用 zod 定義 `root`、`localRoot`、`targets`（預設 `["*"]`）、`description`、`globs`、`agentsmd.subprojectPath`，再加上每個工具自己的區段（`claudecode.paths`、`cursor`…） |
| 產生流程（generate） | [src/lib/generate.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/lib/generate.ts)（`generate` 在 L898；各功能的 `generate*Core` 在 L1283-L1817） | 每個 feature 用一個 Processor：讀 `.rulesync` → 轉成各工具的檔案 → 寫入 → 清掉孤兒檔（orphan sweep） |
| 共用的處理器骨架 | [src/types/feature-processor.ts#L26-L147](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/types/feature-processor.ts#L26-L147) | 抽象方法：`loadRulesyncFiles`、`loadToolFiles`、`convertRulesyncFilesToToolFiles`、`convertToolFilesToRulesyncFiles`（雙向轉換）。`writeAiFiles` 會先比對內容是否「等價」（JSON／YAML／TOML 會解析後再比），一樣就不寫；dry-run 只印 `[DRY RUN] Would write` |
| 內容等價比對 | [src/utils/content-equivalence.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/utils/content-equivalence.ts) | 結構化格式解析後做 deep equal，避免只差空白就判定「有變更」→ `--check` 才不會誤報 |
| Codex 規則輸出 | [src/features/rules/codexcli-rule.ts#L10-L35](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/codexcli-rule.ts#L10-L35) | Codex 只讀 `AGENTS.md` 家族，所以非 root 規則會「摺疊（fold）」進根目錄的 `AGENTS.md`；有 `agentsmd.subprojectPath` 的規則則輸出成子資料夾的 `AGENTS.md` |
| Claude 規則輸出 | [src/features/rules/claudecode-rule.ts#L66-L77](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/claudecode-rule.ts#L66-L77) | root 規則 → `CLAUDE.md`；非 root 規則 → `.claude/rules/*.md`（frontmatter 只有 `paths`）；`localRoot` → `CLAUDE.local.md` |
| 工具設定表（工廠） | [src/features/rules/tool-rule-factories.ts#L475-L600](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/tool-rule-factories.ts#L475-L600) | 每個工具一筆 meta：`collisionPolicy: "fold"`（Codex）、`localRootMode`、`projectInstructionBudget`（Codex 的 32 KiB 上限）等 |
| 多份規則合併／路徑衝突 | [src/features/rules/rules-processor.ts#L355-L407](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/rules-processor.ts#L355-L407)、[#L887-L973](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/rules-processor.ts#L887-L973)、[#L975-L1006](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/rules-processor.ts#L975-L1006) | 依輸出路徑分組；可以摺疊的就依來源順序串接，不能安全合併又牽涉 root 規則就直接 throw；兩個來源寫到同一路徑（大小寫不分）時會警告「last one wins」 |
| 「請另外參考這些規則」清單 | [src/features/rules/rules-processor.ts#L2334-L2405](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/rules-processor.ts#L2334-L2405) | 不會自動載入子規則的工具，會在 root 檔裡產生 `@路徑 description applyTo` 清單（也有 TOON 格式），讓 AI 自己去讀 |
| Codex 指令檔大小預算 | [src/features/rules/instruction-budget.ts#L63-L86](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/instruction-budget.ts#L63-L86) | Codex 會把 root→cwd 路徑上的 `AGENTS.md` 串起來，到 `project_doc_max_bytes`（預設 32 KiB）就**默默截斷**。rulesync 在 generate 和 doctor 都會量大小並警告，這等於一種「防漏」 |
| Codex 角色輸出 | [src/features/subagents/codexcli-subagent.ts#L19-L45](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/subagents/codexcli-subagent.ts#L19-L45) | Markdown 角色 → `.codex/agents/<name>.toml`，內文放進 `developer_instructions`，另有 `model`、`model_reasoning_effort`、`sandbox_mode` |
| 模擬技能（給沒有原生 skills 的工具） | [src/features/skills/skills-processor.ts#L1654-L1674](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/skills/skills-processor.ts#L1654-L1674) | 在 root 規則檔附一段「Simulated Skills」＋技能清單（TOON），叫 AI 需要時自己去讀 SKILL.md |
| 技能／角色撞名警告 | [src/lib/generate.ts#L762-L831](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/lib/generate.ts#L762-L831) | 某個工具的 skills 跟 subagents 寫在同一個資料夾，又有同名的時候會警告（後寫的會覆蓋前面的） |
| doctor 診斷 | [src/lib/doctor.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/lib/doctor.ts)（Levenshtein「你是不是要打…」在 L78-L132、衝突目標在 L353、Codex 預算在 L873） | 唯讀檢查設定檔：JSONC 語法錯誤、拼錯的 key、未知工具或功能、已棄用功能、互斥目標、`$schema`、Codex `AGENTS.md` 大小 |
| 外部技能來源＋鎖檔 | [docs/guide/declarative-sources.md#L254-L284](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/declarative-sources.md#L254-L284)、[src/lib/sources-lock.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/lib/sources-lock.ts) | `rulesync.lock` 記錄 commit SHA 和每個技能的 sha256 integrity；`install --frozen`（CI 用）、`install --outdated`（檢查是否落後） |
| 長得像的名稱偵測 | [src/utils/confusable-names.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/utils/confusable-names.ts) | `fetch` 外部技能時，把 `c0py`／`copy`、西里爾字母假冒的名稱標成 `[!]`。用途是資安，不是內容去重 |
| MCP 伺服器 | [src/mcp/server.ts#L1-L29](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/mcp/server.ts#L1-L29)、[src/mcp/tools.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/mcp/tools.ts) | 只註冊 1 個 `rulesyncTool`，用 `feature`＋`operation` 參數分派，tool 定義不到 1k token |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 直接當工具用（最推薦） | [README.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/README.md) | Node 22+ 或單一執行檔 | 低 | 不用拆。在你倉儲 App 的 repo 根目錄 `rulesync init`，targets 只留 `claudecode`、`codexcli` |
| 規則 frontmatter 規格 | [docs/reference/file-formats.md#L21-L115](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/file-formats.md#L21-L115) | 無 | 低 | 就算不用 rulesync，也可以照這套 `root/targets/description/globs` 欄位寫你自己的規則檔 |
| 角色範本（5 個） | [.rulesync/subagents/](https://github.com/dyoshikawa/rulesync/tree/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/subagents) | 無 | 低 | 改寫成「庫存邏輯審查員」「Firebase 安全審查員」 |
| Implementer＋Reviewer 迴圈技能 | [.rulesync/skills/agent-team/SKILL.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/agent-team/SKILL.md) | Claude Code 的 Agent/Task 工具 | 低 | 把 `pnpm cicheck` 換成你的檢查指令，嚴重度門檻照抄 |
| GPT 交叉審查＋Claude 查證 | [.rulesync/skills/opencode-gpt-review/SKILL.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/opencode-gpt-review/SKILL.md) | OpenCode＋GitHub Copilot 帳號 | 中 | 把 `opencode run --model …` 換成 `codex exec "…"`，流程就變成 Codex 先審、Claude 再驗證 |
| 每週 LLM 全專案巡檢 | [scripts/generate-repomix-xml.ts#L32-L65](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/scripts/generate-repomix-xml.ts#L32-L65)、[scripts/security-scan-xml.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/scripts/security-scan-xml.ts)、[scripts/security-scan-lib.ts#L12-L40](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/scripts/security-scan-lib.ts#L12-L40)、[.github/workflows/security-scan.yml](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.github/workflows/security-scan.yml) | repomix、@openrouter/sdk（或換成 Anthropic SDK）、resend、zod | 中 | **這是你「每日巡讀」最好的骨架**：用 repomix 依資料夾切成多份 XML → 每份丟 LLM，要求回傳 JSON schema → 只在有 high 以上問題時寄信。把 prompt 從資安改成「重複／衝突／遺漏」即可 |
| 自動關閉過期筆記 issue | [.github/workflows/auto-close-maintainer-scrap-issues.yml](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.github/workflows/auto-close-maintainer-scrap-issues.yml) | actions/github-script | 低 | 帶 `maintainer-scrap` 標籤、30 天沒更新的 issue 就關掉，防止過期待辦堆積 |
| Codex AGENTS.md 大小預算檢查 | [src/features/rules/instruction-budget.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/instruction-budget.ts) | 無外部依賴（純函式） | 低 | 173 行。可以單獨拿來寫一個「AGENTS.md 超過 32 KiB 就報警」的小腳本 |
| 內容等價比對 | [src/utils/content-equivalence.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/utils/content-equivalence.ts) | jsonc-parser、smol-toml、js-yaml | 低 | 做「設定檔有沒有真的改」的判斷 |
| 設定檔診斷（拼錯 key 時提示「你是不是要打…」） | [src/lib/doctor.ts#L78-L132](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/lib/doctor.ts#L78-L132) | 無 | 低 | Levenshtein＋建議名稱。可以搬到你倉儲 App 的設定檢查 |
| 程式化 API | [src/index.ts#L73](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/index.ts#L73) | npm 套件 rulesync | 低 | 在 Node 腳本裡 `import { generate } from "rulesync"`，做成你自己的「一鍵同步」按鈕 |
| 整個轉換引擎 | `src/features/**` | 很多內部模組 | 高 | 不建議拆。直接用 CLI 或 npm API 就好 |

---

## 7. AI／Claude 整合

- **CLI 本身不呼叫任何模型**，純粹做檔案轉換，所以「能不能換成 Claude」這個問題不存在。它是**產生給 Claude 和 Codex 讀的設定檔**。
- **Claude Code 支援程度：原生、最完整**。支援矩陣裡 Claude Code 的 rules／ignore／mcp／commands／subagents／skills／hooks／permissions 都打勾，大多也支援全域模式 🌏（[docs/reference/supported-tools.md#L13](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/supported-tools.md#L13)）。另外還有 `claudecode-plugin` 目標，可以打包成 Claude Code plugin。
- **Codex CLI 支援程度：原生**。rules、mcp、subagents、skills、hooks、permissions 都有；commands 只有全域模式，而且 Codex 官方已經把 custom prompts 標為棄用、建議改用 skills（[docs/reference/supported-tools.md#L17](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/supported-tools.md#L17)）。
- **Skills（SKILL.md）**：來源放在 `.rulesync/skills/<name>/SKILL.md`。Claude 的輸出是 `.claude/skills/<name>/`；Codex 的輸出是 `.agents/skills/<name>/`（[src/constants/codexcli-paths.ts#L7](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/constants/codexcli-paths.ts#L7)），外加 `agents/openai.yaml` 附檔（UI 名稱、`allow_implicit_invocation` 等）。
- **MCP**：(1) 你的 MCP 伺服器設定寫在 `.rulesync/mcp.jsonc`，會轉成 Claude 的 `.mcp.json` 和 Codex 的 `.codex/config.toml` 的 `[mcp_servers.*]`；(2) rulesync 自己也是一個 MCP 伺服器（`rulesync mcp`），讓 AI 自己讀寫 `.rulesync/` 並執行 generate、doctor（[docs/reference/mcp-server.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/mcp-server.md)）。
- **prompt 放在哪**：這個 repo 給 AI 看的「提示詞」就是 `.rulesync/rules/*.md`、`.rulesync/subagents/*.md`、`.rulesync/skills/*/SKILL.md`。唯一真的呼叫 LLM 的是 CI 腳本 `scripts/security-scan-xml.ts`，它用 OpenRouter，模型和 prompt 都放在 GitHub secrets（`SECURITY_SCAN_MODEL`、`SECURITY_SCAN_PROMPT`），所以 repo 裡看不到實際 prompt。要改成 Claude 的話，把 OpenRouter 的 model 設成 Anthropic 模型，或改用 Anthropic SDK 即可。
- **回答語言**：`rulesync.jsonc` 設 `"language": "zh-TW"` 時，Claude 會在 `.claude/settings.local.json` 寫入 language 設定，其他工具則在 root 規則檔尾端加一段「一律用指定語言回答」（[docs/guide/configuration.md#L274-L297](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/configuration.md#L274-L297)）。很適合你：讓 Claude 和 Codex 都用繁體中文回答。

---

## 8. 擴充方式與 API

- **CLI 子命令**（[docs/reference/cli-commands.md#L3-L107](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/cli-commands.md#L3-L107)）：`init`、`generate`（`--dry-run`、`--check`、`--watch`、`--global`、`--delete`、`--retire-targets`）、`import`、`convert`、`fetch`、`add`、`install`（`--update`、`--frozen`、`--outdated`）、`gitignore`、`doctor`、`docs`、`release-notes`、`update`、`mcp`。全域參數 `--json` 會輸出機器可讀的 JSON。
- **程式化 API**：`generate()`、`importFromTool()`、`convertFromTool()`（[src/index.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/index.ts)、[docs/api/programmatic-api.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/api/programmatic-api.md)）。
- **設定分層**：CLI 參數 ＞ `rulesync.local.jsonc`（不進 git，個人用）＞ `rulesync.jsonc` ＞ 預設值（[docs/guide/configuration.md#L299-L321](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/configuration.md#L299-L321)）。
- **多個來源樹疊加**：`--input-roots .rulesync .rulesync.local`，後面的覆蓋前面的同名檔（[docs/guide/separate-input-root.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/separate-input-root.md)）。
- **共用規則庫**：`sources` 加上 `rulesync install`，可以從另一個 GitHub repo 拉規則和技能進 `.rulesync/*/.curated/`。本地的同名檔案優先（[docs/guide/declarative-sources.md#L378-L387](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/declarative-sources.md#L378-L387)）。如果你以後有好幾個 repo（倉儲 App、廣告工具、影片腳本工具），可以建一個 `my-ai-standards` repo 集中放共用規則。
- **新增支援工具**：要寫 `src/features/<feature>/<tool>-<feature>.ts`，並在對應的 factory 註冊。repo 自己的指引在 [.rulesync/rules/feature-change-guidelines.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/rules/feature-change-guidelines.md)。

---

## 9. 程式品質與風險

- **維護狀況：非常活躍**。版本號已經到 `43.6.0`（major 版號很高，代表破壞性變更常常發生），最後 push 是 2026-11-04（就是掃描當天）。它會追蹤各工具上游的變動，例如 Continue／Roo Code 停止維護、Kiro 拆成 CLI 和 IDE 兩個目標、Tabnine 改版，README 都有寫遷移說明。repo 還有一個專門追上游更新的技能 `research-tool-updates`。
- **治理**：單一 Owner（dyoshikawa）有最終決定權（[GOVERNANCE.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/GOVERNANCE.md)），屬於典型的個人主導專案，有 bus factor 風險。
- **測試**：測試檔 636 個，跟實作同資料夾擺放（co-location）；`src/e2e/` 有 28 個 e2e 檔案。CI 會檢查格式、oxlint、型別、測試、文件同步、拼字（cspell）、secretlint。我**沒有執行**測試，覆蓋率未確認。
- **資安**：
  - 很多地方有防寫出專案外的設計：`refusesWriteOutsideRoot`、不經由 symlink 寫到外面、拒絕 `__proto__` 這類 key。
  - `fetch` 外部技能時會標出長得像的名稱，防冒名技能。
  - 文件警告：在**不信任的 repo** 跑 MCP 伺服器，可能因為被 commit 進去的 symlink 讀寫專案外的檔案（[docs/reference/mcp-server.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/mcp-server.md) 的 WARNING 段落）。
  - **注意**：它的 `rulesync init` 會在 Codex 區塊預設 `base_permission_profile: ":danger-full-access"`（[docs/reference/file-formats.md#L1941](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/file-formats.md#L1941)），這個 repo 自己的 [.codex/config.toml](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.codex/config.toml) 也是這樣設。你用的時候建議改成 `:workspace`。
- **遙測**：我在 `src/` 用 `grep -rniE 'telemetry|posthog|analytics|sentry'` 搜尋，命中的都是「替 Claude Code 等工具設定權限時列出的環境變數名稱」（例如 `src/features/permissions/claudecode-permissions.ts`），**沒有看到 rulesync 自己回傳使用資料的程式**。會連網的只有 GitHub API、git、npm registry（fetch／install／update／release-notes）。
- **已知的坑**：
  1. **多個目標寫同一個檔案時，後面的贏**。`AGENTS.md` 同時被 `codexcli`、`agentsmd`、`opencode` 等寫入，排序錯了，Codex 摺疊進去的規則會被覆蓋掉（[docs/guide/configuration.md#L327-L371](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/configuration.md#L327-L371)）。**`codexcli` 要放在最後**。
  2. **Codex 32 KiB 上限**：規則寫太多會被默默截斷（rulesync 會警告）。
  3. **產生出來的檔案要不要 commit**：這個 repo 自己把 `AGENTS.md`、`CLAUDE.md`、`.claude/rules/` 放進 `.gitignore`（[.gitignore#L297-L305](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.gitignore#L297-L305)），靠 `prepare` script 產生。但 FAQ 說一般建議 commit，用 `.gitattributes linguist-generated` 把 diff 摺起來（[docs/faq.md#L107-L124](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/faq.md#L107-L124)）。你如果用網頁版 Claude 或 Codex cloud（它們不會先跑 generate），**一定要 commit 產生出來的檔案**。
  4. `--delete` 會刪掉它管理範圍內、你手動改過的產生檔。**永遠只改 `.rulesync/`，不要直接改 `CLAUDE.md`／`AGENTS.md`**。
  5. 已棄用的 `ignore` 功能請改用 `permissions`。
  6. 版本更新很頻繁，建議在 `package.json` 鎖定版本，或者用 `npx rulesync@43.6.0`。

---

## 10. 跟其他專案組合的建議

- **rulesync（同步層）＋ 規格／任務管理專案（流程層）**：rulesync 只管「把規則送到每個 AI 手上」，不管「工作流程」。可以搭配同資料夾的 [github__spec-kit.md](./github__spec-kit.md) 或 [Fission-AI__OpenSpec.md](./Fission-AI__OpenSpec.md) 做「變更提案 → 封存」，再用 rulesync 把它們的指令和技能同步給 Claude 和 Codex。
- **rulesync ＋ anthropics/skills（技能庫）**：`rulesync add anthropics/skills --skills skill-creator` 會把官方技能拉進來並鎖版本（[docs/reference/cli-commands.md#L54-L60](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/cli-commands.md#L54-L60)），同時給 Claude 和 Codex 用。可參考 [anthropics__skills.md](./anthropics__skills.md)。
- **rulesync vs Ruler**：兩者定位相近（都是把一份規則同步到多個工具）。這個 repo 的文件裡**沒有提到 Ruler**（我在 `docs/` 和 `README.md` 用 `grep -rniw ruler` 搜尋，0 筆），所以兩者的差異**未確認**，請另外看 [intellectronica__ruler.md](./intellectronica__ruler.md)。就本 repo 能確認的範圍：rulesync 涵蓋的功能種類很廣（rules／ignore／mcp／commands／subagents／skills／hooks／permissions／checks 共 9 種），支援矩陣列了 70 個目標（README AI 工具表 68 列＋開放標準 2 列，我用 awk＋grep 數的），還有反向 `import`、`convert`、鎖檔和 MCP 伺服器。
- **rulesync ＋ repomix ＋ LLM（巡讀）**：照它的 `security-scan` 做法，把專案打包成 XML 給 Claude 審查，見第 11 節的範例。
- **跟你的業務專案（倉儲、比價、試算表、影片腳本）**：rulesync 不碰業務邏輯，只放在各個 repo 根目錄當「AI 規則中控台」。之後你用 Claude Code 組合 A＋B＋C 時，可以把每個子模組的規則寫成 `globs: ["inventory/**"]`＋`agentsmd.subprojectPath: "auto"`，Codex 就會在子資料夾讀到專屬的 `AGENTS.md`。

---

## 11. 規則／角色／巡檢 檢查表

### 11-1 共用規則怎麼寫 —— **有（這是它的核心）**

- **檔案結構**：
  - 來源：`.rulesync/rules/*.md`（一份 `root: true` 的總覽＋多份 `root: false` 的主題規則）、`rulesync.jsonc`（要產生給誰）、`rulesync.local.jsonc`（個人設定，不進 git）。
  - 產出（Claude）：`CLAUDE.md`、`.claude/rules/*.md`（帶 `paths:`）、`CLAUDE.local.md`。
  - 產出（Codex）：`AGENTS.md`（非 root 規則全部摺疊進來）、`<子資料夾>/AGENTS.md`（有 `subprojectPath` 的規則）。
  - 程式碼位置：[claudecode-rule.ts#L66-L77](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/claudecode-rule.ts#L66-L77)、[codexcli-rule.ts#L10-L35](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/codexcli-rule.ts#L10-L35)。
- **分層**：
  - 全域：`--global` 或在 `~/.aiglobal/rulesync.jsonc` 設 `"global": true`，會寫到 `~/.claude/CLAUDE.md`、`~/.codex/AGENTS.md`、`~/.agents/skills/`（[docs/guide/global-mode.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/global-mode.md)）。
  - 專案：預設模式。
  - 子資料夾：`globs` 搭配 `agentsmd.subprojectPath`（或 `"auto"`）。
  - 個人：`localRoot: true` → `CLAUDE.local.md`。
- **優先順序**：
  - 設定：CLI ＞ local.jsonc ＞ jsonc ＞ 預設。
  - 同一工具有多份 root 規則時，依檔名字典序串接，所以可以用 `10-`、`20-` 前綴控制順序（[file-formats.md#L108](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/file-formats.md#L117)）。
  - 本地規則優先於 `.curated/`（外部來源）。
  - 工具專屬欄位優先於通用欄位（[feature-change-guidelines.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/rules/feature-change-guidelines.md)）。
  - 多個目標寫同一檔時，最後一個贏。
- **怎麼讓 GPT（Codex）和 Claude 讀同一份規則**，有兩條路：
  - **A（建議）**：`targets: ["claudecode", "codexcli"]`。同一份 `.rulesync/rules/` 會產生 `CLAUDE.md`＋`.claude/rules/` 和 `AGENTS.md` 兩套，內容同源。
  - **B**：`claudecode` 的 rules 設 `"includeRoot": false`，不產生 `CLAUDE.md`，讓 Claude Code 直接讀 `AGENTS.md`（Claude 在沒有 `CLAUDE.md` 時會讀 `AGENTS.md`，[file-formats.md#L254](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/file-formats.md#L254)）。但 Codex 會把非 root 規則摺疊進 `AGENTS.md`，Claude 又會另外讀 `.claude/rules/*.md`，**依程式邏輯推論同一條規則 Claude 可能讀到兩次（我沒有實測）**。所以建議用 A。

**給你的最小範本（直接可用）：**

```jsonc
// rulesync.jsonc
{
  "$schema": "https://github.com/dyoshikawa/rulesync/releases/latest/download/config-schema.json",
  "targets": ["claudecode", "codexcli"],          // codexcli 放最後，確保它擁有 AGENTS.md
  "features": ["rules", "subagents", "skills", "mcp", "hooks"],
  "language": "zh-TW",
  "delete": true
}
```

```md
<!-- .rulesync/rules/00-overview.md -->
---
root: true
targets: ["*"]
description: "倉儲庫存 Web App 總覽與共同守則"
---
# 專案總覽
- 純 JavaScript + Firebase（Firestore/Hosting）。不得引入框架。
- 規則唯一來源是 .rulesync/；不要直接改 CLAUDE.md / AGENTS.md。
- 每次完成任務：更新 docs/TASKS.md 勾選、在 docs/HANDOFF.md 追加一筆交接。
```

```md
<!-- .rulesync/rules/inventory-domain.md -->
---
root: false
targets: ["*"]
description: "修改庫存數量、進出貨、成本計算時必讀"
globs: ["src/inventory/**/*.js"]
---
- 庫存異動一律寫 transaction log，不可直接覆寫數量欄位……
```

### 11-2 角色設計 —— **有（以 subagents＋skills 的形式提供，但沒有「組織圖」）**

- 這個 repo 自己的 5 個角色（[.rulesync/subagents/](https://github.com/dyoshikawa/rulesync/tree/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/subagents)）：
  - `code-reviewer`：DRY、測試、遵守 coding-guidelines。
  - `security-reviewer`：只在使用者明確呼叫時才執行；同時要遵守 github-actions-security 規則。
  - `diff-analyzer`：比對 `origin/main...HEAD`，摘要目前進度。
  - `pr-handler`：commit、push、開 PR。
  - `pr-merger`：一次只能 merge 一個 PR。
- **職責／可用工具**：角色 frontmatter 可以設 `claudecode.tools`、`disallowedTools`、`permissionMode`、`maxTurns`、`skills`、`isolation: worktree`、`memory`（[file-formats.md#L709-L760](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/file-formats.md#L709-L760)）。Codex 那邊轉成 `.codex/agents/*.toml` 的 `developer_instructions`、`sandbox_mode`、`model_reasoning_effort`。
- **交接（handoff）／誰向誰負責**：沒有獨立的設定欄位，是寫在 skill 流程裡。例如 [review-pr](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/review-pr/SKILL.md) 會平行呼叫 code-reviewer 和 security-reviewer，再由主代理彙整並標上 low／mid／high／critical 嚴重度與編號。[agent-team](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/agent-team/SKILL.md) 定義 Implementer → Reviewer 的迴圈：出場條件是 high＋critical＝0 而且 mid≦3，最多 10 輪；Implementer 必須逐條回應前一輪的 finding（修掉，或寫明拒絕的理由），最後也**不會自動 commit**。
- **跨模型角色**：[opencode-gpt-review](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/opencode-gpt-review/SKILL.md) 讓 GPT 做第一輪審查，Claude 逐條讀原始碼查證，把結果分成 Valid／Rejected（幻覺）。**這就是你要的「GPT＋Claude 分工」實例**。
- 建議你的角色配置（參考上述範本改寫）：`implementer`（Codex 或 Claude）、`reviewer`（另一個模型）、`data-guardian`（Firestore 規則與資料結構）、`patroller`（每日巡讀，只讀不改）、`scribe`（更新 TASKS／HANDOFF／CHANGELOG）。

### 11-3 防漏 —— **部分有**

- **任務追蹤**：沒有內建 backlog 功能。這個 repo 靠 GitHub Issues 加技能：`create-scrap-issue`（把零碎發現整理成「背景／細節／下一步」三段的 issue）、`triage-issues`（只用既有的標籤，不自創）、`batch-all-issues`、`goal-issues-and-release`。過期的筆記 issue 每天由 cron 自動關閉（[auto-close-maintainer-scrap-issues.yml](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.github/workflows/auto-close-maintainer-scrap-issues.yml)，30 天）。
- **完成前驗證**：有。`agent-team` 要求 Implementer 在回報前跑 `pnpm cicheck`；[goal-pr](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/goal-pr/SKILL.md) 要求 0 個 mid 以上 finding、GitHub Actions 全綠才能 merge。
- **規則被截斷的遺漏**：有。Codex `AGENTS.md` 超過 32 KiB 會警告（[instruction-budget.ts#L63-L86](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/instruction-budget.ts#L63-L86)）。
- **交接紀錄**：沒有內建格式（未看到 handoff 檔案規範），要自己在 rule 裡規定。

### 11-4 防重複 —— **部分有（只偵測「檔案或名稱層級」的重複，不偵測「內容語意」的重複）**

- 兩條規則輸出到同一路徑（大小寫不分）→ 警告（[rules-processor.ts#L975-L1006](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/rules-processor.ts#L975-L1006)）。
- 技能和角色同名、而且寫到同一資料夾 → 警告（[generate.ts#L762-L831](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/lib/generate.ts#L762-L831)）。
- 兩個角色宣告同一個 `name` → 都會產生，並警告「工具可能只載入其中一個」（[file-formats.md#L709-L729](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/file-formats.md#L709-L729)）。
- 外部技能名稱長得像（`c0py`／`copy`）→ 標 `[!]`（[confusable-names.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/utils/confusable-names.ts)）。
- 重新 import 已產生的檔案時，會剝掉自動加入的語言區塊，避免重複（[configuration.md#L274-L297](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/configuration.md#L274-L297)）；也會警告「摺疊後再匯入可能造成重複」（`warnForFoldImportDuplicationRisk`，[rules-processor.ts#L1676](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/rules-processor.ts#L1676)）。
- **「兩條規則講同一件事」或「規則互相矛盾」：沒有**，要靠第 11-6 節的 LLM 巡讀。

### 11-5 防新舊版本衝突 —— **有（這是它第二強的地方）**

- **單一事實來源**：只改 `.rulesync/`，產出檔一律由 generate 覆寫。
- **漂移偵測**：`rulesync generate --check` 會在產出檔和來源不一致時以 exit 1 結束（CI 用）；比對用的是結構化等價比較（[feature-processor.ts#L60-L147](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/types/feature-processor.ts#L60-L147)）。
- **孤兒檔清理**：`--delete` 會刪掉來源已經刪除、但還留著的舊產出檔；`--retire-targets cursor --features rules,mcp` 可以把不再使用的工具輸出整批清掉（[cli-commands.md#L150-L200](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/cli-commands.md#L150-L200)）。
- **外部來源版本鎖定**：`rulesync.lock` 記錄 commit SHA＋sha256。`install --frozen` 在 CI 遇到鎖檔不一致會失敗，`install --outdated` 回報哪些來源已經落後（exit 1）（[declarative-sources.md#L254-L284](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/declarative-sources.md#L254-L284)）。
- **官方建議的 CI 守門組合**：`rulesync doctor --strict && rulesync install --frozen && rulesync generate --check`（[docs/faq.md#L126-L142](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/faq.md#L126-L142)）。
- **變更提案／封存**：沒有（要搭配 OpenSpec 或 spec-kit 這類工具）。
- **規則內容本身的版本標記（例如 `version: 2`、`last_reviewed`）**：沒有。frontmatter 沒有這些欄位，但 schema 是寬鬆的，自己加欄位不會報錯；是否會被保留到輸出檔，**未確認**。

### 11-6 定期巡檢 —— **有範例（在 repo 自己的 CI 裡），但不是 rulesync 的產品功能**

- `.github/workflows/` 有 4 個 cron 排程：
  - [security-scan.yml](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.github/workflows/security-scan.yml)（`0 0 * * 1`，每週一）：repomix 把專案切成「全專案、每個 src 子資料夾、每個 feature、設定檔」多份 XML，每份丟 LLM，要求回傳 JSON（severity／reason／filePath／line），只在有 high 以上問題時寄 email，並先附一段 AI 總結；任何一份掃描失敗就讓整個 job 失敗，「不完整的掃描不能假裝是綠燈」（[security-scan-xml.ts#L132-L142](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/scripts/security-scan-xml.ts#L132-L142)）。
  - `ci-failure-reminder.yml`（每天 01:00 UTC）、`auto-close-stale-prs.yml`（每天 02:00 UTC）、`auto-close-maintainer-scrap-issues.yml`（每天 00:00 UTC）。
- **Hook**：`.rulesync/hooks.json` 用 `sessionStart` 跑 `git pull && pnpm i`，確保每次開工都是最新版本（[.rulesync/hooks.json](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/hooks.json)）。hooks 可以用 `sessionStart`／`preToolUse`／`postToolUse`／`stop` 等事件，一份設定同時轉給 Claude 和 Codex（[file-formats.md#L294-L340](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/file-formats.md#L294-L340)）。
- **給你的「每日巡讀」設計（依這個 repo 的做法改寫）**：
  1. 機械檢查（免費）：`npx rulesync doctor --strict && npx rulesync generate --check`。
  2. LLM 巡讀（要付費）：用 repomix 把 `.rulesync/`、`docs/`、`src/` 分別打包，交給 Claude（或用 `codex exec`），prompt 要求輸出 JSON：`{findings:[{type:"missing|duplicate|conflict|stale", severity, files:[...], evidence, suggestion}]}`。
  3. 交叉驗證：比照 `opencode-gpt-review`，由另一個模型逐條讀原始碼，判斷 Valid／Rejected。
  4. 只在有 high 以上問題時開 issue 或寄信。
- **報告格式範例**（仿照 review-pr 的嚴重度＋編號格式，以及 security-scan 的 JSON 欄位）：

```md
# 每日巡讀報告 2026-11-05
- 機械檢查：doctor ✅｜generate --check ❌（AGENTS.md 與 .rulesync 不一致）
- 嚴重度統計：critical 0｜high 1｜mid 2｜low 3

#1 [high][conflict] .rulesync/rules/inventory-domain.md L12 說「出貨即扣庫存」，
   但 src/inventory/ship.js L40 在「出貨確認」才扣 → 建議以程式現況為準修改規則
#2 [mid][duplicate] coding-style.md 與 00-overview.md 都規定命名方式，內容不一致（camelCase vs snake_case）
#3 [mid][stale] docs/HANDOFF.md 最後一筆停在 10/28，之後有 6 個 commit 沒有交接紀錄
```

### 11-7 Skill 寫法 —— **有（完整規格）**

- **格式**：`.rulesync/skills/<name>/SKILL.md`，frontmatter 要有 `name`、`description`、`targets`，選填 `claudecode.allowed-tools`、`when_to_use`、`context: fork`、`agent`、`paths`、`disable-model-invocation`、`user-invocable`、`scheduled-task`；`codexcli.short-description`、`interface`、`policy.allow_implicit_invocation`、`dependencies`（[file-formats.md#L1053-L1160](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/file-formats.md#L1053-L1160)）。
- **description 怎麼寫才會被觸發**：repo 裡寫得好的範例是「做什麼＋Use when…＋Triggers on: "…"」，例如 [review-pr](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/review-pr/SKILL.md) 的 `Use when the user wants to review a PR… Triggers on: "review PR", "check this PR"`，以及官方 [skills/rulesync/SKILL.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/skills/rulesync/SKILL.md) 的 `Use when syncing AI rules, running rulesync commands…`。[skill-creator](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/skill-creator/SKILL.md) 強調「Concise is Key」，以及依任務脆弱度選擇高／中／低自由度。
- **資料夾結構**：`SKILL.md`＋`references/*.md`（例如 `playwright-cli/references/`、`rulesync-feature-research/references/` 每個工具一份）。腳本可以放在技能資料夾內，會原樣複製；`fetch` 會保留執行權限（[cli-commands.md#L583](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/cli-commands.md#L583)）。
- **輸出位置**：Claude 是 `.claude/skills/<name>/`，Codex 是 `.agents/skills/<name>/`＋`agents/openai.yaml`。
- 技能名稱不可以跟角色同名（同資料夾的工具會被覆蓋，見 11-4）。

### 11-8 支援哪些工具與安裝方式 —— **有**

- 支援矩陣 70 個目標：Claude Code（含 plugin）、Codex CLI、GitHub Copilot／Copilot CLI、Cursor、Gemini 系列（Antigravity IDE／CLI）、OpenCode、Cline、Kiro、Junie、Goose、Kilo、Qwen Code、Devin、Zed、Warp、AGENTS.md 標準、Agent Skills 標準等（[README.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/README.md)、[docs/reference/supported-tools.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/supported-tools.md)）。
- 安裝：`npm i -g rulesync`／`npx rulesync`／Homebrew tap／`curl … install.sh | bash` 單一執行檔／Windows `.exe`（[docs/getting-started/installation.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/getting-started/installation.md)，有 SHA256 和 `gh attestation verify` 驗證）。
- 讓 AI 自己學會用 rulesync：`rulesync fetch dyoshikawa/rulesync` 會裝官方技能；或者把 `rulesync mcp` 掛進 Claude 或 Codex 的 MCP 設定。

### 11-9 可以直接借用到你「基礎架構」的檔案或段落

| 用途 | 路徑 |
|---|---|
| 設定檔範本（物件形式 targets、每個工具分開開關功能） | [rulesync.jsonc](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/rulesync.jsonc) |
| root 總覽規則範本 | [.rulesync/rules/overview.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/rules/overview.md) |
| 帶 globs＋subprojectPath 的主題規則範本 | [.rulesync/rules/github-actions-security.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/rules/github-actions-security.md) |
| 審查角色 ×2 | [.rulesync/subagents/code-reviewer.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/subagents/code-reviewer.md)、[security-reviewer.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/subagents/security-reviewer.md) |
| 實作／審查迴圈 | [.rulesync/skills/agent-team/SKILL.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/agent-team/SKILL.md) |
| GPT 審查＋Claude 查證 | [.rulesync/skills/opencode-gpt-review/SKILL.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/opencode-gpt-review/SKILL.md) |
| 審查到合併的完整閉環 | [.rulesync/skills/goal-pr/SKILL.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/goal-pr/SKILL.md) |
| 零碎發現 → issue | [.rulesync/skills/create-scrap-issue/SKILL.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/create-scrap-issue/SKILL.md) |
| 追上游工具更新（防過時） | [.rulesync/skills/research-tool-updates/SKILL.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/research-tool-updates/SKILL.md) |
| 每週 LLM 巡檢工作流程＋腳本 | [.github/workflows/security-scan.yml](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.github/workflows/security-scan.yml)、[scripts/security-scan-xml.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/scripts/security-scan-xml.ts)、[scripts/generate-repomix-xml.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/scripts/generate-repomix-xml.ts) |
| 過期待辦自動關閉 | [.github/workflows/auto-close-maintainer-scrap-issues.yml](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.github/workflows/auto-close-maintainer-scrap-issues.yml) |
| 開工自動同步的 hook | [.rulesync/hooks.json](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/hooks.json) |
| CI 守門三連（doctor、install --frozen、generate --check） | [docs/faq.md#L126-L142](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/faq.md#L126-L142) |

**建議導入步驟（約半天）：**
1. 在倉儲 App 的 repo 跑 `npx rulesync init`，再跑 `npx rulesync import --targets claudecode`，把現在的 CLAUDE.md 收進來。
2. 整理 `.rulesync/rules/`：拆成 `00-overview.md`（root）加上 3～6 份主題規則，每份寫清楚 `description` 和 `globs`。
3. 照上面的範本設定 `rulesync.jsonc`（targets 寫 `claudecode`、`codexcli`，`language: zh-TW`），然後跑 `npx rulesync generate`，把產出檔 commit 進去。
4. 從 rulesync 的範本改寫 2 個角色（reviewer、patroller）和 2 個技能（agent-team、cross-model-review）。
5. 在 GitHub Actions 加每日 cron：`doctor --strict`、`generate --check`，再加上 LLM 巡讀腳本。

---

## 關鍵字

rulesync、規則同步、單一事實來源、Single Source of Truth、AGENTS.md、CLAUDE.md、.claude/rules、.rulesync、rulesync.jsonc、Codex CLI、Claude Code、GPT 與 Claude 協作、subagents、子代理、角色、skills、SKILL.md、Agent Skills、MCP、hooks、permissions、generate --check、漂移偵測、drift、doctor、rulesync.lock、鎖檔、project_doc_max_bytes、32 KiB 截斷、global mode、全域規則、import、convert、agent-team、Implementer Reviewer 迴圈、opencode-gpt-review、交叉審查、repomix、每日巡讀、排程巡檢、cron、GitHub Actions、security-scan、OpenRouter、Resend、maintainer-scrap、MIT 授權、TypeScript、Node.js CLI
