# affaan-m/ECC — 給 Claude Code／Codex 用的「規則＋角色＋技能＋hook」大全套，附文件治理與一致性檢查工具
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：b38be6a
> GitHub：https://github.com/affaan-m/ECC｜⭐ 297007｜授權：MIT｜主要語言：JavaScript｜最近更新：2026-11-02

> 閱讀說明：以下所有數字都是我在 commit `b38be6a7f6350964d59328b52f0624e1d1d552d1` 上自己數的（方法寫在括號裡）。permalink 都指向這個 commit，只列我實際打開過的檔案。整個 repo 是「唯讀」掃描，沒有安裝、沒有執行任何腳本。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：ECC（Everything Claude Code）是一套「把 AI 寫程式的團隊規範打包好」的開源外掛：共用規則（rules）、71 個角色（agents）、314 個技能（skills）、98 個斜線指令（commands）、一整組 hook，同時支援 Claude Code、Codex（GPT）、Cursor、OpenCode 等工具。

**數量怎麼數的**：`ls agents/*.md | wc -l` = 71；`ls skills/*/SKILL.md | wc -l` = 314；`ls commands/*.md | wc -l` = 98；`find rules -name '*.md' | wc -l` = 122（22 個子資料夾，`common/` 有 10 個檔）；`find tests -name '*.test.js' | wc -l` = 456。

**對你（倉儲管理系統＋投廣告＋想讓 GPT 和 Claude 有秩序地合作）最有用的地方**：

1. **共用規則的「分層」範本**：`rules/common/`（全語言通用）＋`rules/web/`、`rules/typescript/`（特定技術覆寫通用），加上「特定規則優先於通用規則」的明文優先順序。你可以照抄這個骨架，做出「全公司通用 → 倉儲系統專案 → 某個子模組」三層。
2. **一份 AGENTS.md 同時餵 Claude 和 Codex**：根目錄 `AGENTS.md` 是兩邊共讀的主規則，`CLAUDE.md` 只放 Claude 專屬補充，`.codex/AGENTS.md` 只放 Codex 專屬補充（還寫了「Claude Code vs Codex 差異表」）。這就是你要的「GPT 和 Claude 讀同一份規則」的實作方式。
3. **你最在意的「每日巡讀」— ECC 沒有現成一鍵版，但零件很齊**：
   - `living-docs-governance` 技能：把專案文件分成「憲法／地圖／狀態／歷史」四種角色，**每個事實只有一個正本**，其他地方只放連結 → 直接對治「同一件事寫在好幾個地方、新舊版本衝突」。
   - `docs-governance` 技能內附的 `audit-docs.py`：唯讀的確定性稽核，能抓「已刪除的檔案又被 AI 復活」、「ADR 被取代但沒寫繼任者」、「沒人連結的孤兒文件」、「失效連結」。
   - `skill-stocktake` 技能：盤點所有 skill，判定 Keep／Improve／Update／Retire／Merge into X，**專門抓重複技能**。
   - `rules-distill` 技能：從多個 skill 中找出重複出現的原則，提升成 rules，並檢查是否「已經寫過但換了說法」。
   - `scripts/ci/catalog.js`：自動比對「README／AGENTS.md 宣稱有幾個 agent/skill」與實際檔案數，對不上就讓 CI 失敗 → 抓「文件數字過期」。
   - `.github/workflows/maintenance.yml`：每週一排程跑稽核的 GitHub Actions 範例；`autonomous-agent-harness` 技能則教你用 cron／`/loop`／`claude -p` 做每日排程。
4. **角色（agent）定義格式**：每個角色一個 Markdown 檔，frontmatter 寫 `name / description / tools / model`。例如 planner 只給 `Read, Grep, Glob`（不能改檔），code-reviewer 有固定的嚴重度輸出格式。你可以直接借 planner／code-reviewer／doc-updater／refactor-cleaner 當你的「規劃者／審查者／文件員／清理員」。
5. **跨模型分工原則**：`/multi-plan`、`/multi-execute` 裡寫的「Code Sovereignty（程式碼主權）」— 外部模型（Codex 等）**沒有檔案寫入權**，所有修改都由 Claude 執行。這是讓兩個 AI 不互相覆蓋的最簡單規則。
6. **附帶的商務技能（次要）**：`inventory-demand-planning`（安全庫存、再訂購點、ABC/XYZ 分類，跟你的倉儲直接相關）、`marketing-campaign`（廣告文案＋短影音腳本）、`video-editing`／`remotion-video-creation`／`fal-ai-media`（AI 影片）、`data-scraper-agent`（定時抓價格等公開資料）。

---

## 2. 授權白話

- **授權**：MIT（`LICENSE` 第 1–3 行：`MIT License / Copyright (c) 2026 Affaan Mustafa`；`package.json` 的 `"license": "MIT"` 一致）。
- **個人使用**：完全可以。複製、修改、拿規則和技能檔改成你自己的版本都沒問題。
- **公司商用**：MIT 允許商用、改寫、閉源再散布，唯一義務是**保留原版權聲明與授權文字**（例如你把 `living-docs-governance/SKILL.md` 改寫進自己公司的規範包，最好在檔頭或 `LICENSE`／`NOTICE` 註明來源）。
- **例外要注意**：`skills/context-and-decisions/` 資料夾裡有自己的 `LICENSE` 檔（我只看到檔案存在，內容未逐字確認是否不同於 MIT → **未確認**）；`skills/story-lifecycle`、`dev-team` 的 frontmatter 標註 `inspired-by: bmad-method`，屬於社群貢獻，概念借用不影響 MIT，但若要大量照抄，建議再看一次原檔。
- **有沒有付費版**：有。README 寫 **「ECC Pro + GitHub App … Private repos from $19/seat/mo」**，以及 「OSS stays free. This repo is MIT-licensed forever. ECC Pro is the hosted GitHub App for private repos」（README 第 81–106 行附近）。付費版提供的是**託管服務**：私有 repo 分析、PR 觸發稽核、AgentShield 掃描、團隊用量。**這個 repo 裡的規則、角色、技能、腳本本身都是開源的，不需要付費就能用**。你個人用不需要 Pro。

---

## 3. 技術棧與執行需求

| 項目 | 內容（出處） |
|---|---|
| 語言 | 主要是 Node.js（CommonJS JavaScript），部分 Python（例如 `docs-governance/scripts/audit-docs.py`、`continuous-learning-v2/scripts/instinct-cli.py`）、Bash |
| Node 版本 | `package.json` → `"engines": {"node": ">=18"}` |
| 執行期相依套件 | 只有 5 個：`@iarna/toml`、`ajv`、`js-yaml`、`sql.js`、`zod`（`package.json` dependencies） |
| 資料庫 | 本機 SQLite（用 `sql.js`，純 WASM，不用裝資料庫伺服器），給 `scripts/work-items.js` 存工作項目、`ecc status` 用 |
| 前端／後端 | 沒有網頁前後端，本體是「一堆 Markdown＋JSON 設定＋Node 腳本」，被 Claude Code／Codex 讀取 |
| 部署方式 | 安裝到你的 AI 工具裡：Claude Code 用 `/plugin marketplace add https://github.com/affaan-m/ECC` → `/plugin install ecc@ecc`；或 `npx ecc-universal@2.2.3 setup`；Codex 用 `codex plugin marketplace add affaan-m/ECC` → `codex plugin add ecc@ecc`（README「Install ECC」「Codex App and CLI」段） |
| 硬體／GPU | 不需要 GPU，一般筆電即可 |
| API Key 與費用 | ECC 本身免費。費用來自你本來就在用的 Claude Code／Codex 訂閱或 API 用量。**注意**：`continuous-learning-v2` 的觀察者迴圈會額外呼叫 `claude --model haiku`（`skills/continuous-learning-v2/agents/observer-loop.sh` 第 391–399 行），會多吃用量；MCP 範例設定（GitHub、Context7、Exa、Supabase、Playwright…）有些需要各自的 API Key（例如 Exa），費用依各服務而定（未逐一確認價格） |

---

## 4. 程式架構地圖

（只標我打開過或用 `ls` 確認過的部分；`docs/` 有 1540 個檔、`docker/` 333 個檔，我沒有全部 checkout。）

```
ECC/
├── AGENTS.md              ★ 共用主規則（Claude 與 Codex 都讀）：核心原則、71 個角色表、何時自動派角色、安全/風格/測試/Git 規則
├── CLAUDE.md              ★ 只給 Claude Code 的補充：測試指令、架構、檔案格式約定、Prompt Defense Baseline
├── SOUL.md                專案身分/價值觀短文（17 行）
├── VERSION                2.2.3
├── rules/                 ★ 共用規則（分層）
│   ├── README.md          ★ 分層說明＋「特定語言覆寫通用」的優先順序
│   ├── common/            10 檔：agents / code-review / coding-style / development-workflow / git-workflow / hooks / patterns / performance / security / testing
│   ├── web/、typescript/、python/、golang/ …（共 22 個子資料夾）每檔開頭寫「This file extends ../common/xxx.md」
├── agents/                ★ 71 個角色檔（Markdown + YAML frontmatter：name/description/tools/model）
├── skills/                ★ 314 個技能（每個一個資料夾，內含 SKILL.md，可選 scripts/ references/ templates/ hooks/）
├── commands/              98 個斜線指令（官方說法：legacy 相容層，新流程以 skills 為主）
├── hooks/
│   ├── hooks.json         ★ Claude Code hook 設定（PreToolUse/PostToolUse/SessionStart/Stop/SessionEnd…）
│   ├── codex-hooks.json   Codex 版 hook 子集
│   └── README.md          hook 設定檔（ECC_HOOK_PROFILE=minimal|standard|strict、ECC_DISABLED_HOOKS）
├── scripts/
│   ├── ci/                ★ 一致性檢查：catalog.js（數量 vs 文件）、validate-agents/skills/rules/hooks/commands、validate-skill-host-compat（Claude 版與 Codex 版技能是否漂移）、audit-closed-references
│   ├── hooks/             hook 實作（doc-file-warning、config-protection、governance-capture、session-start…）
│   ├── lib/skill-evolution/  技能版本快照、健康度、來源（provenance）
│   ├── harness-audit.js   ★ 確定性的「AI 工作環境健檢」評分（12 類）
│   ├── skills-health.js   技能使用成功率儀表板
│   ├── work-items.js      工作項目（backlog）存 SQLite
│   └── sync-ecc-to-codex.sh  舊版：把 ECC 複製合併到 ~/.codex（已標示 deprecated）
├── .codex/
│   ├── AGENTS.md          ★ Codex 專屬補充（模型建議、技能位置、與 Claude Code 差異表）
│   ├── config.toml        ★ Codex 多代理設定（[features] multi_agent = true、[agents.reviewer] …）
│   └── agents/            explorer.toml / reviewer.toml / docs-researcher.toml（Codex 角色）
├── .agents/skills/        47 個「Codex 用」技能副本，每個含 agents/openai.yaml
├── .cursor/rules/、.cursor/skills/   Cursor 用的扁平化規則副本（common-agents.md …）
├── .claude/               本 repo 自用的 Claude 設定（rules、team、workflows…）
├── manifests/             安裝模組/設定檔清單（install-profiles.json 等）
├── mcp-configs/           MCP 伺服器設定範本
├── .github/workflows/     CI；maintenance.yml（每週排程）、monthly-metrics.yml、supply-chain-watch.yml
├── docs/zh-TW/            繁體中文翻譯（但只翻了 12 個 agent、16 個 skill，明顯落後英文版）
└── tests/                 456 個 *.test.js
```

---

## 5. 核心功能怎麼實作

P = `https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1`

| 功能 | 程式碼位置（permalink） | 實作重點 |
|---|---|---|
| 共用主規則 | [P/AGENTS.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/AGENTS.md) | 222 行。第 7–13 行 5 條核心原則；第 15–87 行角色總表；第 89–113 行「不用使用者開口就自動派角色」的觸發條件；第 163–173 行開發流程（第 168–172 行「知識要放對地方、不要重複寫」）；第 175–179 行「skills/ 是正本，commands/ 只是相容層」 |
| Claude 專屬補充 | [P/CLAUDE.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/CLAUDE.md) | 88 行，只放 Claude 需要的東西；第 9–16 行 Prompt Defense Baseline（防提示詞注入）；第 59–66 行各類檔案格式；第 78–88 行「改哪種檔案就用哪個 skill」對照表 |
| Codex 專屬補充 | [P/.codex/AGENTS.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/.codex/AGENTS.md#L1-L108) | 第 3 行明寫「This supplements the root AGENTS.md」；第 69–73 行「對外動作預設唯讀、要使用者同意」；第 75–87 行 Codex 多代理角色；第 89–99 行 Claude Code vs Codex 差異表（Codex 只讀 AGENTS.md，不讀 CLAUDE.md） |
| Codex 角色設定 | [P/.codex/agents/reviewer.toml](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/.codex/agents/reviewer.toml) | `sandbox_mode = "read-only"` ＋ `developer_instructions`；在 `.codex/config.toml` 以 `[agents.reviewer] config_file = "agents/reviewer.toml"` 掛上 |
| 規則分層＋優先順序 | [P/rules/README.md#L128-L145](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/README.md#L128-L145) | 「language-specific rules take precedence」，像 CSS 權重；通用規則中可能被覆寫的段落要標 `> **Language note**` |
| 規則如何指定適用檔案 | [P/rules/typescript/coding-style.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/typescript/coding-style.md#L1-L10) | frontmatter `paths: ["**/*.ts","**/*.js",...]`，只在動到對應檔案時套用；正文第一行「This file extends common/coding-style.md」 |
| 角色派工與「委派完成契約」 | [P/rules/common/agents.md#L51-L68](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/common/agents.md#L51-L68) | 「你派出去的子代理，你要負責收回結果」「不准回『等待背景代理』就結束」；並列出多視角審查角色：事實審查、資深工程師、資安、**一致性審查（Consistency reviewer）、重複檢查（Redundancy checker）** |
| 角色定義範例 | [P/agents/planner.md#L1-L30](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/agents/planner.md#L1-L30)、[P/agents/code-reviewer.md#L259-L300](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/agents/code-reviewer.md#L259-L300) | planner：`tools: Read, Grep, Glob`、`model: opus`；code-reviewer：固定的 `[CRITICAL] / File / Issue / Fix` 格式＋嚴重度總表＋Approve/Warning/Block 判準 |
| 文件治理（四角色、單一正本） | [P/skills/living-docs-governance/SKILL.md#L46-L98](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/living-docs-governance/SKILL.md#L46-L98) | 憲法／地圖／狀態／歷史，「one canonical owner per fact」；文件與程式碼衝突時以可機器驗證的證據為準，**並記錄衝突，不要默默挑一個**（第 75–82 行） |
| 確定性文件稽核 | [P/skills/docs-governance/scripts/audit-docs.py](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/docs-governance/scripts/audit-docs.py#L21-L45) | 770 行 Python，預設角色檔名第 21–34 行；`check_status_resurrection`（第 332–359 行，刪除區的檔案又出現 → fail）；`check_adr_lifecycle`（第 522–575 行，ADR 狀態只能 proposed/accepted/deprecated/superseded，superseded 必須寫繼任者）；`check_orphans`（第 648–671 行，沒被任何文件提到的 docs → warn）。exit 0=過、1=有可證明的錯、2=參數錯 |
| 技能盤點（抓重複） | [P/skills/skill-stocktake/SKILL.md#L159-L215](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/skill-stocktake/SKILL.md#L159-L215) | Quick Scan（只看改過的）／Full Stocktake；每 20 個技能交給一個子代理；判定 Keep/Improve/Update/Retire/Merge into X；`reason` 必須寫清楚證據（有好/壞範例）；刪除前一定要使用者確認 |
| 規則蒸餾（抓重複原則） | [P/skills/rules-distill/SKILL.md#L57-L120](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/rules-distill/SKILL.md#L57-L120) | 「腳本確定性收集＋LLM 判斷」；只在 2 個以上技能出現的原則才升級為規則；判定 Append/Revise/New Section/New File/Already Covered/Too Specific；Revise 要給 before/after |
| 文件數字過期偵測 | [P/scripts/ci/catalog.js#L52-L64](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/ci/catalog.js#L52-L64) | 實際數 `agents/*.md`、`commands/*.md`、`skills/*/SKILL.md`，再用正規表示式解析 README／AGENTS.md／zh-CN 文件裡的數字；`--write` 可自動修正；CI 在 `.github/workflows/ci.yml` 第 322–323 行執行 |
| 技能格式驗證 | [P/scripts/ci/validate-skills.js#L1-L25](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/ci/validate-skills.js#L1-L25) | 必須有 SKILL.md、frontmatter 要有 name/description、description 不可用 `|` 多行區塊 |
| Claude/Codex 技能副本漂移 | [P/scripts/ci/validate-skill-host-compat.js#L1-L25](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/ci/validate-skill-host-compat.js#L1-L25) | 檢查 Codex 副本有沒有用到 Claude 專用變數（`${CLAUDE_PLUGIN_ROOT}` 等）、frontmatter 白名單、`openai.yaml` 列的技能是否存在 —— **但不比對內文是否同步**（見第 9 節） |
| AI 環境健檢評分 | [P/scripts/harness-audit.js#L12-L27](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/harness-audit.js#L12-L27)、[P/commands/harness-audit.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/commands/harness-audit.md#L17-L78) | 12 類評分（工具覆蓋、Context 效率、品質關卡、記憶、Eval、資安、成本、GitHub…），rubric 版本 `2026-05-19`；能偵測「這是 ECC 本身還是使用 ECC 的專案」，對使用者專案有 `consumer-instructions`、`consumer-memory-notes` 等檢查 |
| 技能版本與健康度 | [P/scripts/lib/skill-evolution/versioning.js#L1-L60](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/lib/skill-evolution/versioning.js#L1-L60) | 每個 skill 旁邊建 `.versions/`（快照）與 `.evolution/{observations,inspections,amendments}.jsonl`；有 `createVersion`、`rollbackTo`（第 342–348 行起）；`health.js` 算 7 天/30 天成功率與待審修正 |
| 團隊 Kanban／交接 | [P/skills/team-agent-orchestration/SKILL.md#L19-L111](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/team-agent-orchestration/SKILL.md#L19-L111) | 每張卡：owner、state、branch、acceptance、merge_gate、handoff；欄位 Backlog→Ready→Running→Review→Blocked→Merged→Archived；「一張卡一個 owner、不重疊寫入」 |
| 工作項目 CLI | [P/scripts/work-items.js#L1-L40](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/work-items.js#L1-L40) | `list / show / upsert / close / claim --owner / sync-github`，存本機 SQLite |
| Hook 自動化 | [P/hooks/hooks.json](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/hooks/hooks.json) | 我用 Python 解析數到 27 組 matcher：PreToolUse 10、UserPromptSubmit 1、PreCompact 1、SessionStart 2、PostToolUse 2、PostToolUseFailure 2、Stop 8、SessionEnd 1。每個 hook 經 `run-with-flags.js` 依 profile（minimal/standard/strict）開關 |
| 防亂開筆記檔 | [P/scripts/hooks/doc-file-warning.js#L20-L40](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/hooks/doc-file-warning.js#L20-L40) | AI 要在結構化資料夾外寫 `NOTES.md / TODO.md / SCRATCH.md / DRAFT.md / WIP.md…` 時出警告（只警告不擋） |
| 防 AI 改 lint 設定作弊 | [P/scripts/hooks/config-protection.js#L1-L30](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/hooks/config-protection.js#L1-L30) | 修改既有的 eslint/prettier 等設定檔會被 exit 2 擋下，逼 AI 修程式而不是改規則 |
| 學習／記憶（instincts） | [P/skills/continuous-learning-v2/SKILL.md#L45-L75](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/continuous-learning-v2/SKILL.md#L45-L75) | hook 觀察 session → 產生小顆「本能」（trigger／action／confidence 0–1／scope：project 或 global）；同一本能在 2 個以上專案、平均信心 ≥0.8 才升為全域（第 300–315 行）；`/prune` 刪除 30 天沒被採用的待審本能 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 主規則骨架（AGENTS.md 結構） | [AGENTS.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/AGENTS.md) | 無 | 低 | 只取「核心原則／角色表／自動派工觸發／知識放哪裡／Git 規則」五段的結構，內容換成你的倉儲系統（Firebase、純 JS）。刪掉 80% 覆蓋率、TDD 強制等對小專案過重的條文 |
| Claude/Codex 補充檔分工 | [CLAUDE.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/CLAUDE.md)、[.codex/AGENTS.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/.codex/AGENTS.md) | 無 | 低 | 你的 `CLAUDE.md` 第一行寫「先讀 AGENTS.md，本檔只放 Claude 專屬」；Codex 只吃 AGENTS.md，所以共用內容一律寫在 AGENTS.md |
| 規則分層＋優先順序 | [rules/README.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/README.md)、[rules/common/](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/common/agents.md) | 無 | 低 | 建 `rules/common/`＋`rules/web/`（Firebase/前端）；每個子檔開頭寫「extends ../common/xxx.md」；明寫「特定優先於通用」 |
| 四角色文件治理 | [skills/living-docs-governance/SKILL.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/living-docs-governance/SKILL.md) | 無 | 低 | 整份複製到你的 `.claude/skills/`；照第 110–140 行的模板，在你的專案建「狀態檔＋刪除區（delete-zone）＋歷史紀錄」，從此 AI 不會把刪掉的舊功能又生回來 |
| 文件稽核腳本 | [skills/docs-governance/scripts/audit-docs.py](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/docs-governance/scripts/audit-docs.py)（＋同資料夾 `markdown_links.py`、`module_audit.py`） | Python 3、git | 中 | 三支檔案一起拷；用 `.governance/docs-map.json` 指到你自己的檔名（例如 constitution=AGENTS.md、status=docs/STATUS.md）；每日巡讀第一步先跑 `--scope full`，有 fail 才叫 AI 處理 |
| 技能盤點流程 | [skills/skill-stocktake/](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/skill-stocktake/SKILL.md) | Bash、Node、jq | 中 | 每週/每月跑一次，抓重複或過期的 skill；結果存 `results.json`，下次只看有變的（Quick Scan） |
| 規則蒸餾 prompt | [skills/rules-distill/SKILL.md#L66-L120](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/rules-distill/SKILL.md#L66-L120) | 無（純 prompt） | 低 | 把那段子代理 prompt 改成「掃描 AGENTS.md、CLAUDE.md、各 skill，找重複或互相矛盾的規則」，就是一個「規則重複/衝突偵測」巡檢 |
| 數量對帳 CI | [scripts/ci/catalog.js](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/ci/catalog.js) | Node | 中 | 概念借用即可：寫一支小腳本比對「文件宣稱的功能/欄位/版本號」與實際程式碼（例如 Firestore collection 名稱清單），不一致就報錯 |
| 角色檔格式 | [agents/planner.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/agents/planner.md)、[agents/code-reviewer.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/agents/code-reviewer.md)、[agents/doc-updater.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/agents/doc-updater.md)、[agents/refactor-cleaner.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/agents/refactor-cleaner.md) | Claude Code 子代理機制 | 低 | 放到 `.claude/agents/`；用 `tools:` 限制權限（審查者不給 Write/Edit） |
| Codex 角色 TOML | [.codex/agents/reviewer.toml](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/.codex/agents/reviewer.toml) | Codex CLI（`multi_agent` 實驗功能） | 低 | 讓 GPT 當「唯讀審查員」，跟 Claude 的寫入角色分開 |
| Kanban 卡片 schema | [skills/team-agent-orchestration/SKILL.md#L29-L60](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/team-agent-orchestration/SKILL.md#L29-L60) | 無 | 低 | 用一個 `docs/BOARD.md` 或 JSON 檔記錄每張卡的 owner（claude／codex）、狀態、驗收條件、handoff 檔路徑 |
| 驗證報告格式 | [skills/verification-loop/SKILL.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/verification-loop/SKILL.md) | 無 | 低 | 「完成前驗證」的固定報告格式（Build/Types/Lint/Tests/Security/Diff → READY/NOT READY） |
| 防亂開檔 hook | [scripts/hooks/doc-file-warning.js](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/scripts/hooks/doc-file-warning.js) | Node、Claude Code hooks | 中 | 依賴 ECC 的 `pretooluse-visible-output`，要改寫成獨立腳本；效果是減少 AI 到處生 TODO.md／NOTES.md |
| 庫存需求規劃技能 | [skills/inventory-demand-planning/SKILL.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/inventory-demand-planning/SKILL.md) | 無 | 低 | 拷貝給 Claude 當倉儲系統「安全庫存／再訂購點」功能的領域知識（我只讀了 description，內文未細讀） |

---

## 7. AI／Claude 整合

- **Claude 支援：原生**。這本來就是 Claude Code 外掛（`.claude-plugin/`、plugin slug `ecc@ecc`）。
- **用哪些模型**：角色檔 frontmatter 的 `model:` 我數過（`grep -h "^model:" agents/*.md | sort | uniq -c`）：sonnet 61、haiku 6、opus 4。opus 用在 planner、architect 這類需要深思的角色；haiku 用在 doc-updater 這類便宜工作。Codex 端 `.codex/AGENTS.md` 第 11–18 行建議 GPT-6 Luna medium（日常）／GPT-6 Sol high（架構、除錯、資安）；`.codex/agents/reviewer.toml` 寫 `model = "gpt-6-sol"`。
- **Prompt 放在哪**：全部是 Markdown 檔——`agents/*.md`（角色 system prompt）、`skills/*/SKILL.md`、`commands/*.md`、`rules/**/*.md`、`AGENTS.md`、`CLAUDE.md`。沒有寫死在 JS 裡的大 prompt（觀察者迴圈例外，在 `continuous-learning-v2/agents/observer-loop.sh`）。
- **MCP**：`mcp-configs/` 有範本；`.codex/config.toml` 預設開 GitHub、Context7、Exa、Memory、Playwright、Sequential Thinking（`.codex/AGENTS.md` 第 51–67 行）。還有自己的 `ecc-memory-mcp`（`package.json` bin）。
- **Skills**：314 個 Claude 技能；Codex 有 47 個副本放在 `.agents/skills/`，每個附 `agents/openai.yaml`（`display_name`、`default_prompt`、`allow_implicit_invocation`）。
- **GPT＋Claude 一起用的具體設計**：
  1. 同一份 `AGENTS.md`（兩邊都讀）＋各自的補充檔。
  2. `/multi-plan`、`/multi-execute`：Claude 當主控，呼叫 Codex／Antigravity 產出計畫；**Code Sovereignty：外部模型零寫入權，所有修改由 Claude 做**（`commands/multi-plan.md` 第 19 行、`commands/multi-execute.md` 第 18 行）。注意：這兩個指令需要外部 `ccg-workflow` 執行環境，不在 ECC 基本安裝內（`commands/multi-plan.md` 第 9 行）。
  3. `council-multi-model` 技能：Claude 內部四角議事產出決策草稿後，**經使用者同意**才送給 OpenAI Codex 做「挑毛病」審查；外部轉接器不可用時要明確標示「external review absent」。
- **能不能換成 Claude**：本來就是以 Claude 為主，不用換。

---

## 8. 擴充方式與 API

- **新增規則**：在 `rules/<領域>/` 建檔，開頭 `> This file extends [common/xxx.md](../common/xxx.md)`，必要時加 `paths:` frontmatter 限定檔案類型（`rules/README.md` 第 109–126 行）。**注意 Claude Code 外掛無法自動散布 rules**，要自己複製到 `~/.claude/rules/ecc/` 或專案的 `.claude/rules/ecc/`（README「Claude Code details」段、`rules/README.md` 第 58–100 行），而且**不要把 common 與語言資料夾攤平**，同名檔會互相覆蓋。
- **新增角色**：`agents/<name>.md`，frontmatter 必填 `tools`、`model`（`scripts/ci/validate-agents.js` 第 10 行 `REQUIRED_FIELDS = ['model', 'tools']`）。
- **新增技能**：`skills/<name>/SKILL.md`，模板在 `CONTRIBUTING.md` 第 96–139 行；檢查清單第 163–175 行（500 行內、最多 800；必須有 When to Activate、Anti-Patterns；name 要和資料夾同名；description 不能用 `|`）。要給 Codex 用，另外在 `.agents/skills/<name>/` 放副本＋`agents/openai.yaml`。
- **新增 hook**：改 `hooks/hooks.json`，用 `scripts/hooks/run-with-flags.js <id> <script> <profiles>` 包起來，就能被 `ECC_HOOK_PROFILE`／`ECC_DISABLED_HOOKS` 控制。
- **CLI**：`ecc`（`scripts/ecc.js`）、`ecc-install`、`ecc-control-pane`、`ecc-memory-mcp`、`ecc-plan-canvas`（`package.json` bin）；`npx ecc-universal@2.2.3 setup`／`install --guided`／`doctor`／`consult`。
- **安裝管理**：`manifests/install-profiles.json`、`install-modules.json`、`install-components.json` 定義可安裝的模組組合（我只列檔名，內容未細讀）。

---

## 9. 程式品質與風險

**維護狀況**：非常活躍。HEAD 最後一個 commit 是 2026-10-29 的 PR #3809 合併；VERSION 2.2.3；456 個測試檔；CI 有 15 個 workflow（`ls .github/workflows`）。README 自己承認是「a single maintainer ships weekly across 7 harnesses」→ **單人維護、改版很快**，對你來說代表東西多但變動頻繁。

**測試／品質關卡**：`npm test` 會先跑 unicode 安全檢查、validate-agents/commands/rules/skills/skill-host-compat/hooks、install manifests、catalog 對帳，再跑 `tests/run-all.js`（`package.json` scripts.test）。

**我實際找到的「文件漂移」案例（剛好示範你擔心的問題，連作者自己的 repo 都有）**：
1. **角色數量不一致**：`AGENTS.md` 寫 71 個 agents（正確），但 [`rules/common/agents.md` 第 26 行](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/common/agents.md#L26) 寫「full roster of 69 agents」。原因：`catalog.js` 只檢查 README、AGENTS.md、SOUL.md、zh-CN 文件等，沒有檢查 rules 資料夾。
2. **規則樹狀圖過期**：`rules/README.md` 第 8–30 行的樹狀圖只列 12 個子資料夾，實際有 22 個（`ls -d rules/*/ | wc -l`）。
3. **Claude 版與 Codex 版技能內容不同步**：`.agents/skills/` 47 個資料夾中，46 個在 `skills/` 有同名正本，我用 `cmp` 比對：只有 6 個完全相同、40 個不同、1 個（`ecc-conventions`）只存在 Codex 端。例如 `tdd-workflow` 正本 590 行、Codex 副本 467 行，副本少了整段「Plan Handoff」。`validate-skill-host-compat.js` 只檢查名稱與 frontmatter，不比對內文 → 這正是「哪邊是新版、哪邊是舊版」的典型陷阱。
4. **繁體中文翻譯落後**：`docs/zh-TW/` 只有 12 個 agent、16 個 skill 的翻譯（從檔案清單數 `docs/zh-TW/agents/*`、`docs/zh-TW/skills/*/SKILL.md`），英文版是 71／314。

**資安／隱私**：
- 正面：每個角色檔與 CLAUDE.md 都有「Prompt Defense Baseline」；`.codex/AGENTS.md` 規定對外動作（發文、push、合併、付費工作）要使用者明確同意；README 說「ECC never uploads diagnostics automatically」；有 supply-chain-watch（每 6 小時）與 IOC 掃描腳本。
- 注意：hooks 很多（27 組），每次工具呼叫都會跑 Node 腳本，`observe-runner.js` 會在本機記錄工具呼叫觀察資料；`continuous-learning-v2` 會用 `claude --model haiku` 背景分析 → 吃用量、也會把 session 內容交給模型分析。可用 `ECC_HOOK_PROFILE=minimal` 或 `ECC_DISABLED_HOOKS` 關掉。
- 遙測：程式碼中我用 `grep -rn "telemetry|posthog|analytics|sentry" scripts src` 沒找到自動上傳的遙測程式（只在 `operator-readiness-dashboard.js` 的文字敘述裡出現「telemetry」字樣，指的是 ECC-Tools 託管服務）。→ 本機版**未發現**遙測，但託管的 GitHub App 是另一回事（未確認）。
- README 特別警告只從官方來源安裝（第 70 行），有第三方重新上傳的惡意版本。

**已知的坑**：
- **不要重複安裝**：README「Pick one path only」— 同一工具裝兩次會重複 skills/commands/hooks（Claude 外掛＋手動全裝 ✗；Codex sync＋Codex 外掛 ✗）。
- **量太大**：314 個技能全裝會吃 context；作者自己做了 `agent-sort` 技能（分 DAILY／LIBRARY）和「Low-context / no-hooks path」。你應該**只挑 10–20 個**。
- **規則偏重大型軟體團隊**：80% 測試覆蓋率、強制 TDD、immutability 等，對「一個人＋Firebase 純 JS」的倉儲系統過重，直接照抄會讓 AI 一直要求寫測試、拖慢速度。
- 很多指令的 bash 段落是很長的一行 `node -e` 解析外掛路徑（例如 `commands/skill-health.md`），可讀性差、在你自己的專案裡不必照抄。

---

## 10. 跟其他專案組合的建議

- **ECC（骨架與巡檢工具） ＋ 你自己的薄規則**：不要整包裝。建議只拿：`AGENTS.md` 結構、`rules/README.md` 分層法、`living-docs-governance`、`docs-governance/audit-docs.py`、`skill-stocktake`、`rules-distill` 的 prompt、`verification-loop` 報告格式、planner／code-reviewer／doc-updater／refactor-cleaner 四個角色。
- **＋ 同分類的其他專案**（本資料包系列中「04-agent-rules-skills」的其他 repo）：若有專門做「一份規則同步到多個 AI 工具」的工具（例如 .ruler 類型），可以用它來產生 `CLAUDE.md`／`AGENTS.md`／`.cursor/rules`，取代 ECC 這種「手動維護多份副本」的做法 —— 因為 ECC 自己的 Claude／Codex 副本已經漂移（第 9 節第 3 點）。
- **＋ 你的倉儲系統（Firebase）**：把 `inventory-demand-planning` 技能當領域知識；`data-scraper-agent` 的「排程抓價格＋存 Sheets/Supabase」概念可以接到價格比對需求（第 2 類興趣）。
- **＋ AI 影片（第 3 類興趣）**：`video-editing`、`remotion-video-creation`、`fal-ai-media`、`marketing-campaign` 四個技能可以直接給 Claude Code 當腳本與影片製作的工作流程說明（都是 Markdown 指南，實際生成要靠 fal.ai／Remotion 等外部工具與它們的費用）。

**建議你的「基礎架構」（借用 ECC 的概念，縮小到一個人的規模）**：

```
你的專案/
├── AGENTS.md            # 憲法：共用規則（Claude 與 Codex 都讀），≤150 行，只放規則與「去哪找」連結
├── CLAUDE.md            # 第一行：「先讀 AGENTS.md」；只放 Claude 專屬（skills 對照、hook 說明）
├── docs/
│   ├── MAP.md           # 地圖：哪個功能在哪個檔、誰負責（Claude 寫程式／Codex 審查）
│   ├── STATUS.md        # 狀態：目前進行中、卡住的事、## Deletion Zone（刪除區）
│   ├── LOG.md           # 歷史：## [2026-11-04] removal | 移除舊版庫存匯出，改用 src/export/
│   └── adr/             # 重大決定（例：為什麼用 Firestore 不用 Realtime DB）
├── .governance/docs-map.json   # 告訴 audit-docs.py 你的檔名
├── .claude/
│   ├── agents/          # planner.md、code-reviewer.md、doc-updater.md（從 ECC 改寫）
│   └── skills/          # living-docs-governance、verification-loop、daily-patrol（自寫）
└── .codex/agents/reviewer.toml # GPT 唯讀審查員
```

---

## 11. 規則／角色／巡檢 檢查表

**共用規則怎麼寫：有**
- 檔案結構：根目錄 `AGENTS.md`（共用）＋`CLAUDE.md`（Claude 補充）＋`.codex/AGENTS.md`（Codex 補充）＋`rules/`（分層規則）＋`SOUL.md`（身分）。[AGENTS.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/AGENTS.md)、[.codex/AGENTS.md#L1-L9](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/.codex/AGENTS.md#L1-L9)。沒有 `.ruler` 或 constitution 專用檔（但 `living-docs-governance` 把 AGENTS.md/CLAUDE.md 定義為「constitution 角色」）。
- 分層：全域（`~/.claude/rules/ecc/`）／專案（`.claude/rules/ecc/`）／依檔案類型（`paths:` frontmatter）；子資料夾層級用 `module-governance` 技能：模組自己的 `AGENTS.md` 只放額外限制，「Local rules cannot waive project-wide constraints」。[rules/README.md#L58-L100](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/README.md#L58-L100)、[skills/module-governance/SKILL.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/module-governance/SKILL.md)
- 優先順序：特定語言／領域規則 > common 規則。[rules/README.md#L128-L139](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/README.md#L128-L139)
- GPT 與 Claude 讀同一份：Codex 只讀 AGENTS.md、Claude 讀 CLAUDE.md＋AGENTS.md，所以共用內容放 AGENTS.md。[.codex/AGENTS.md#L89-L99](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/.codex/AGENTS.md#L89-L99)。Cursor 用另一份扁平副本 `.cursor/rules/common-*.md`（副本需手動同步）。

**角色設計：有**
- 71 個角色；frontmatter 定義工具與模型。我數過：14 個角色的 `tools:` 完全沒有 Write/Edit/Bash（純唯讀），43 個沒有 Write/Edit（不能改檔）。核心角色與觸發時機：planner（複雜功能）、architect（架構決策）、tdd-guide（新功能/修 bug）、code-reviewer（剛改完程式）、security-reviewer（敏感程式）、doc-updater（文件/codemap）、refactor-cleaner（死碼、重複程式）、loop-operator（自動迴圈監控）、harness-optimizer（AI 環境調校）、agent-evaluator（5 軸評分 AI 產出）。[AGENTS.md#L89-L113](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/AGENTS.md#L89-L113)
- 技能：Workflow Surface Policy 規定 skills 是正本；CLAUDE.md 第 78–88 行有「檔案 → 技能」對照；「派子代理時要把對應 skill 的慣例寫進 prompt」（CLAUDE.md 第 88 行）。
- 交接（handoff）：`orch-pipeline` 說「規劃文件就是交接，不留隱藏狀態」（`skills/orch-pipeline/SKILL.md` 第 106–113 行）；`team-agent-orchestration` 每張卡要有 `handoff` 路徑。
- 誰向誰負責：「Delegation Completion Contract」— 派工者要收回並整合結果；團隊模式「一張卡一個 owner、一個 integrator 解衝突」。[rules/common/agents.md#L51-L59](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/common/agents.md#L51-L59)、[team-agent-orchestration#L64-L72](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/team-agent-orchestration/SKILL.md#L64-L72)

**防漏：有**
- 任務追蹤：`scripts/work-items.js`（SQLite backlog，可 `claim --owner`、`sync-github`）；`story-lifecycle` 技能（純檔案的 epic → story → sprint）；Kanban 卡片 schema。
- 完成前驗證：`verification-loop`（六階段 PASS/FAIL 報告）；`delivery-gate`（Stop hook，檢查沒過不准宣告完成）；code-reviewer 的 Approve/Warning/Block。[skills/verification-loop/SKILL.md](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/verification-loop/SKILL.md)
- 交接紀錄：Stop hook 有 `session-end.js`、`evaluate-session.js`；`/save-session`、`/resume-session`、`/checkpoint` 指令（只看到檔名，內文未細讀）。

**防重複：有（以盤點流程為主，非全自動）**
- `skill-stocktake`：檢查「與其他 skill 重疊」「與 MEMORY.md / CLAUDE.md 重疊」，判定 Merge into X。[#L159-L180](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/skill-stocktake/SKILL.md#L159-L180)
- `rules-distill`：「Already Covered（即使用不同字眼）」判定，避免同一原則寫兩次。
- `config-gc`：掃 `~/.claude` 裡多餘、過期、孤兒的 skills/memory/hooks/MCP，逐一確認刪除。
- AGENTS.md 第 168–172 行：「如果這次任務已產生相關文件，就不要在別處重複同樣資訊」；`doc-file-warning` hook 擋隨手亂開的 TODO/NOTES 檔。
- 重複角色偵測：**沒有**專門工具（只有 `agent-sort` 依專案挑選角色）。

**防新舊版本衝突：有**
- 單一事實來源：`living-docs-governance`「one canonical owner per fact」；`docs-governance` 的角色契約（`references/artifact-role-contract.md`）定義每種文件「擁有什麼、不擁有什麼」。
- 版本標記：`VERSION` 檔；rubric 版本（`RUBRIC_VERSION = '2026-05-19'`）；技能版本快照 `.versions/` ＋ `rollbackTo`；instinct 的 confidence。
- 變更提案／封存：ADR 狀態 proposed/accepted/deprecated/superseded，superseded 必須指名繼任者（audit-docs.py 會檢查）；`PROJECT_LOG.archive.md` 歷史封存角色；skill-stocktake 排除 `.trash` 封存資料夾。
- 過期偵測：`catalog.js`（數量過期）、`audit-docs.py` 的刪除區復活檢查、孤兒文件、ADR 索引；`skill-stocktake` 的「Freshness of technical references」；`comment-analyzer` 角色（註解是否過時）；`maintenance.yml` 的 `actions/stale`（30 天無動靜的 issue/PR）。
- 限制：Claude 版／Codex 版技能內文漂移沒有被檢查（見第 9 節）。

**定期巡檢：部分有**
- 排程：`.github/workflows/maintenance.yml` 每週一 09:00 UTC（`cron: '0 9 * * 1'`）跑相依套件檢查、npm audit、stale、已關閉 issue 引用稽核。[maintenance.yml#L1-L75](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/.github/workflows/maintenance.yml#L1-L75)；`monthly-metrics.yml` 每月；`supply-chain-watch.yml` 每 6 小時。
- 每日巡讀的「做法教學」：`autonomous-agent-harness` 技能第 85–113 行：互動 session 內用 `/loop 30m ...`；要關掉電腦也能跑就用作業系統 cron 或 GitHub Actions 呼叫 `cd 專案 && claude -p "..."`，並提供 `0 9 * * 1-5` 每日 standup 等範本。[#L85-L113](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/autonomous-agent-harness/SKILL.md#L85-L113)
- Hook 層：SessionStart（載入上次狀態）、Stop（8 個收尾檢查）、PreCompact。
- **沒有**現成的「每天讀整個專案、找 AI 遺漏/重複/新舊衝突」單一指令 → 要自己組合（下面範例）。
- 報告格式範例（ECC 現成）：
  ```
  Harness Audit (repo, repo): 71/80
  - Quality Gates: 10/10
  - GitHub Integration: 2/10
  Top 3 Actions:
  1) [GitHub Integration] Add at least one workflow under .github/workflows/.
  ```
  （出自 `commands/harness-audit.md` 第 67–78 行）以及 skill-stocktake 的 `Skill | 7d use | Verdict | Reason` 表。
- **建議你組合的每日巡讀報告**（借 ECC 零件，自行撰寫）：
  ```
  每日巡讀 2026-11-05
  [機械檢查] audit-docs.py --scope full → 1 fail：刪除區 `src/oldExport.js` 又被建立
  [規則重複] AGENTS.md §庫存 與 CLAUDE.md §Firestore 重複描述欄位命名 → 建議：保留 AGENTS.md，CLAUDE.md 改為連結
  [新舊衝突] docs/STATUS.md 說「匯出用 CSV」，src/export/ 實作為 XLSX → 以程式碼為準，記入 LOG.md
  [遺漏] BOARD.md 卡片 #12（Codex 審查）狀態 Review 已 3 天無 handoff
  結論：NOT CLEAN（1 fail / 3 warn）｜下一步：誰、做什麼
  ```

**Skill 寫法：有（很完整）**
- 格式：`skills/<name>/SKILL.md`，frontmatter `name`（須等於資料夾名）、`description`（單行或 `>` 摺疊，不可用 `|`）、可選 `metadata.origin`、`license`、`tools`。[CONTRIBUTING.md 第 96–175 行](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/CONTRIBUTING.md)
- description 怎麼寫才會被觸發：ECC 的寫法是「做什麼＋**Use when …**＋觸發關鍵字」，甚至加中文觸發詞，例如 `living-docs-governance` 的 description 結尾「中文触发：文档治理、活文档、项目状态追踪、防文档漂移…」（第 3 行）；`harness-audit`、`skill-health` 的 description 還寫了「什麼情況該用別的技能」（例如「for a security-specific audit use the security-scan command」）來避免誤觸發。
- 資料夾結構：`SKILL.md` ＋ `scripts/`（如 `skill-stocktake/scripts/scan.sh`）＋ `references/`（如 `docs-governance/references/artifact-role-contract.md`）＋ `templates/`、`hooks/`；Codex 副本另加 `agents/openai.yaml`。
- 正文段落：When to Activate／How It Works／Examples／Anti-Patterns／Related Skills；建議 500 行內、最多 800。

**支援工具與安裝：有**
- Claude Code（原生外掛 `ecc@ecc`）、Codex（原生外掛或舊 sync 腳本）、Kimi Code（guided）、Cursor、OpenCode、Gemini、Qwen、Zed、CodeBuddy、Qoder、Antigravity、Hermes、OpenClaw 等（README「Install ECC」與「Other agents and editors」段）。
- 安裝：`npx ecc-universal@2.2.3 setup`（Claude）、`npx ecc-universal@2.2.3 install --guided --harness claude --harness codex`（多工具）、`codex plugin marketplace add affaan-m/ECC`。rules 必須手動複製。

**可以直接借用到你「基礎架構」的檔案或段落**
1. `AGENTS.md` 第 7–13、89–113、163–179 行（原則、自動派工、知識放置、正本政策）
2. `CLAUDE.md` 第 1–16、78–88 行（Claude 補充檔寫法、Prompt Defense、檔案→技能對照）
3. `.codex/AGENTS.md` 第 69–73、89–99 行（對外動作要同意、Claude/Codex 差異）
4. `rules/README.md` 第 102–145 行（Rules vs Skills、優先順序）
5. `rules/common/agents.md` 第 51–68 行（委派完成契約、一致性／重複檢查角色）
6. `skills/living-docs-governance/SKILL.md` 全文（四角色＋刪除區＋歷史格式）
7. `skills/docs-governance/scripts/audit-docs.py`＋`markdown_links.py`＋`module_audit.py`＋`references/artifact-role-contract.md`
8. `skills/skill-stocktake/SKILL.md` 第 159–215 行（判定標準與 reason 寫法）
9. `skills/rules-distill/SKILL.md` 第 66–120 行（子代理 prompt）
10. `skills/team-agent-orchestration/SKILL.md` 第 19–111 行（owner／Kanban／失敗模式）
11. `skills/verification-loop/SKILL.md` 的 Output Format
12. `agents/planner.md`、`agents/code-reviewer.md`、`agents/doc-updater.md`、`agents/refactor-cleaner.md`、`.codex/agents/reviewer.toml`
13. `.github/workflows/maintenance.yml`（每週排程 GitHub Actions 範本）

---

## 關鍵字
ECC、Everything Claude Code、AGENTS.md、CLAUDE.md、共用規則、規則分層、rules、common rules、優先順序、角色、agents、subagent、planner、code-reviewer、doc-updater、技能、skills、SKILL.md、description 觸發、hooks、Codex、GPT、多代理協作、multi-agent、Code Sovereignty、文件治理、living docs、單一事實來源、single source of truth、canonical owner、刪除區、deletion zone、ADR、superseded、文件漂移、drift、staleness、重複偵測、skill-stocktake、rules-distill、config-gc、catalog 對帳、harness-audit、巡檢、每日巡讀、cron、GitHub Actions、verification-loop、Kanban、handoff、交接、instincts、continuous learning、MIT
