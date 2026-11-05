# openai/skills — OpenAI 官方的 Codex 技能（Skills）目錄＋「Claude Code 設定搬到 Codex」的對照表與轉換器（已宣告停止維護）
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：49f948f
> GitHub：https://github.com/openai/skills｜⭐ 28518｜授權：混合授權（repo 根目錄沒有 LICENSE；44 個 skill 中 31 個 Apache-2.0、1 個 MIT、4 個 Notion 的 MIT 式授權、2 個 Figma Developer Terms、6 個 figma-* 沒有授權檔）｜主要語言：Python｜最近更新：2026-10-28

> 本資料包所有路徑都是我在 commit `49f948faa9258a0c61caceaf225e179651397431` 實際打開過的檔案。permalink 前綴：
> `https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/`
> 另外我也 clone 了官方建議的接班 repo **openai/plugins**（commit `b767f8fa3be1a22b093127dd59956c91ecffca9d`），只讀了少數檔案，引用時會標明。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這是 OpenAI 給 Codex（GPT 系列的寫程式代理）用的「技能目錄」——每個技能是一個資料夾＋一份 `SKILL.md`，格式和 Claude 的 Agent Skills 幾乎一樣；裡面最有價值的是一個叫 `migrate-to-codex` 的技能，它**把「Claude Code 的設定（CLAUDE.md、skills、subagents、hooks、MCP）要怎麼對應到 Codex」逐項寫成對照表與 Python 轉換器**。

**README 第一行就說這個 repo 已經 deprecated（停止維護）**，新的範例改放在 openai/plugins（[README.md#L1-L2](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/README.md#L1-L2)）。但它仍是目前最乾淨、最小的「Codex 技能長怎樣」教科書，而且 10 月底還有更新。

**對你（要讓 GPT/Codex 和 Claude 一起有秩序地工作）最有用的 5 件事：**

1. **回答你「GPT 跟 Claude 能不能讀同一份規則」**：可以。`migrate-to-codex` 的做法是——如果你的 `CLAUDE.md` 內容是「中性的」（沒有提到 Claude 專屬的 hooks、subagent、permissionMode），就直接把 `AGENTS.md` 做成指向 `CLAUDE.md` 的**符號連結（symlink）**，兩邊讀同一份檔案，不複製（[instructions.py#L17-L57](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/instructions.py#L17-L57)）。這正是「單一事實來源」。
2. **回答你「技能放哪裡兩邊都讀得到」**：Codex 專案技能放 `.agents/skills/<name>/SKILL.md`，Claude Code 放 `.claude/skills/<name>/SKILL.md`；兩者的 `SKILL.md` 格式（YAML 開頭的 `name`＋`description`＋Markdown 內文）相同（[differences.md#L24-L34](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L24-L34)）。所以一份技能可以兩邊共用，只要避開 Claude 專屬的欄位。
3. **回答你「每個 AI 角色要怎麼定義」**：Claude 的 subagent 是 `.claude/agents/*.md`；Codex 的對應是 `.codex/agents/*.toml`（欄位 `name`／`description`／`model`／`model_reasoning_effort`／`sandbox_mode`／`developer_instructions`）。轉換器把兩者的欄位一對一列出來，還寫了哪些權限「在 Codex 只是建議、不是硬限制」（[differences.md#L51-L64](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L51-L64)）。
4. **「巡讀」可以直接偷的機制**：轉換器有 `--scan-only`（盤點）、`--plan`（列出會改什麼）、`--doctor`（健檢報告）、`--validate-target`（驗證 AGENTS.md 是否超過 32KB、技能 frontmatter 是否正確、agent TOML 欄位是否齊全）四種唯讀模式，報告格式是「狀態｜項目｜備註」表格，狀態只有 `Added`／`Check before using`／`Not Added` 三種（[SKILL.md#L51-L67](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/SKILL.md#L51-L67)）。這正好可以改造成你的「每日巡讀報告」格式。
5. **寫技能的官方守則＋驗證器**：`skill-creator` 說明「description 是唯一的觸發依據」「SKILL.md 控制在 500 行內」「資訊只放一個地方，不要 SKILL.md 和 references 各寫一次」；`quick_validate.py` 只有 101 行，檢查 frontmatter 欄位、名稱格式、description 長度 ≤1024 字元——可以直接當你巡讀時「技能格式檢查」的一環。

**它不能做的**：沒有試算表、比價、ERP、影片相關功能（`.curated` 裡有 `speech`、`transcribe`、`imagegen`、`pdf`、`playwright` 等工具型技能，但都是 Codex＋OpenAI API 導向）。沒有排程、沒有每日巡讀的現成技能、沒有任務追蹤 ledger（那個在 openai/plugins 收錄的 superpowers 裡）。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

**重點：repo 根目錄沒有 LICENSE 檔，README 寫「每個技能的授權看該資料夾裡的 `LICENSE.txt`」**（[README.md#L41-L43](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/README.md#L42-L44)）。GitHub 因此顯示「-」。

我的計數方法：對 `skills/.system/*/` 與 `skills/.curated/*/` 共 44 個技能資料夾，逐一讀 `LICENSE.txt` 第一個非空白行並分類；沒有該檔的另外列出。

| 授權 | 數量 | 哪些 |
|---|---|---|
| Apache-2.0 | 31 | 包含 `.system` 的 5 個（skill-creator、skill-installer、plugin-creator、imagegen、openai-docs）以及 migrate-to-codex、define-goal 等大部分 curated |
| MIT | 1 | `vercel-deploy` |
| MIT 式（Copyright Notion Labs） | 4 | `notion-*` 四個 |
| Figma Developer Terms（專有、Beta、可隨時撤回） | 2 | `figma`、`figma-implement-design` |
| **沒有授權檔** | 6 | `figma-code-connect-components`、`figma-create-design-system-rules`、`figma-create-new-file`、`figma-generate-design`、`figma-generate-library`、`figma-use` |

- **個人使用**：你最想借的 `migrate-to-codex`、`skill-creator`、`define-goal` 都是 Apache-2.0，可以自由複製、修改、用在自己的專案。
- **公司商用**：Apache-2.0／MIT 都可以商用，要保留原授權與版權聲明；Apache-2.0 修改過的檔案要註明有修改。**Figma 的 8 個技能不要拿去改寫商用**：2 個明確受 Figma Developer Terms 約束，6 個沒有授權檔（沒有授權＝預設保留所有權利）。
- **閉源／付費**：技能本身沒有付費版，但要「執行」它們需要 Codex（ChatGPT 付費方案或 OpenAI API 計費），`imagegen` 的 CLI 模式、`speech`、`transcribe` 等需要 `OPENAI_API_KEY` 並按用量付費（[imagegen/SKILL.md#L14-L15](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/imagegen/SKILL.md#L14-L15)）。
- 接班的 openai/plugins 裡收錄第三方技能包（例如 superpowers 是 Jesse Vincent 的 MIT 授權，見 [plugins/superpowers/LICENSE](https://github.com/openai/plugins/blob/b767f8fa3be1a22b093127dd59956c91ecffca9d/plugins/superpowers/LICENSE)），授權一樣要逐包看。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

- **這不是一個應用程式，是一堆「給 AI 讀的說明書＋小腳本」**。沒有前端、後端、資料庫、部署。
- 檔案組成（我用 `git ls-tree -r --name-only HEAD` 列出全部 783 個檔案，再依副檔名計數）：`.md` 531、`.yaml` 51、`.py` 42、`.txt` 40、`.svg` 39、`.png` 34、`.js` 11、`.json` 8。其中 `cloudflare-deploy` 一個技能就佔 312 個檔案（大量 references 文件）。
- **技能數量**：`SKILL.md` 共 44 份＝`.system` 5 個＋`.curated` 39 個。README 提到的 `.experimental` 資料夾**在這個 commit 已不存在**（我在完整檔案清單搜尋 `experimental` 只找到 README 與 skill-installer 的文字提及，沒有任何檔案在該路徑下）。
- **腳本語言**：Python 3（`migrate-to-codex` 用到 `tomllib`，需要 Python 3.11+；只用標準函式庫）；`skill-creator/scripts/quick_validate.py` 需要 `PyYAML`（`import yaml`）。少數 Node.js 腳本（`openai-docs/scripts/*.js`、`.mjs`）。
- **硬體／GPU**：不需要。
- **API Key**：只讀格式、拿來改寫自己的規則→不需要。要在 Codex 裡實際用 → 需要 Codex（ChatGPT 方案或 API）。`imagegen` 內建模式不需 key，CLI 模式需 `OPENAI_API_KEY`；`gh-*`、`yeet` 需要 GitHub CLI 登入；`linear`、`notion-*`、`figma-*`、`sentry` 需要對應的 MCP 連線與帳號。費用依各家服務計，本 repo 沒有寫價格（未確認）。

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

```
openai/skills/
├── README.md                    ← 第 1–2 行：已停止維護，改看 openai/plugins；說明安裝方式與授權規則
├── contributing.md              ← 社群守則、資安回報信箱，沒有技術規範
└── skills/
    ├── .system/                 ← 5 個「Codex 內建、自動安裝」的技能
    │   ├── skill-creator/       ← ★ 怎麼寫技能（368 行 SKILL.md）＋ init_skill.py / quick_validate.py / generate_openai_yaml.py
    │   │   └── references/openai_yaml.md ← agents/openai.yaml 欄位說明（UI 名稱、圖示、MCP 依賴）
    │   ├── skill-installer/     ← 從 GitHub 下載技能到 $CODEX_HOME/skills（預設 ~/.codex/skills）
    │   ├── plugin-creator/      ← 產生 .codex-plugin/plugin.json 與 .agents/plugins/marketplace.json
    │   ├── openai-docs/         ← 查 OpenAI 官方文件；內含「AGENTS.md／skill／plugin／hook／automation 各該用在哪」的 Surface Map
    │   └── imagegen/            ← 產圖（內建工具或 OpenAI Image API CLI）
    └── .curated/                ← 39 個「精選、要手動安裝」的技能
        ├── migrate-to-codex/    ← ★★ Claude Code → Codex 轉換器（Python，約 3,000 行）＋ references/differences.md 對照表
        │   ├── scripts/cli.py               ← 主程式：--scan-only / --plan / --doctor / --validate-target / --dry-run
        │   ├── scripts/migrate/instructions.py ← CLAUDE.md → AGENTS.md（symlink 或複製）
        │   ├── scripts/migrate/skills.py    ← .claude/skills、.claude/commands → .agents/skills
        │   ├── scripts/migrate/agents.py    ← .claude/agents/*.md → .codex/agents/*.toml
        │   ├── scripts/migrate/hooks.py     ← settings.json hooks → .codex/hooks.json
        │   ├── scripts/migrate/mcps.py      ← .mcp.json → .codex/config.toml [mcp_servers]
        │   └── scripts/migrate/common.py    ← 模型名稱對照（claude-opus → gpt-5.4 等）、權限模式對照
        ├── define-goal/         ← ★ 把模糊需求改寫成「可量測、可驗證」的目標（99 行，純文字）
        ├── figma-create-design-system-rules/ ← 產生設計規則並寫入 CLAUDE.md / AGENTS.md / .cursor/rules（三家對照表）
        ├── gh-address-comments/ gh-fix-ci/ yeet/ ← GitHub PR 留言處理、CI 修復、一鍵 commit+push+開 PR
        ├── security-ownership-map/ security-threat-model/ security-best-practices/ ← 資安相關（git 歷史分析 bus factor 等）
        ├── linear/ notion-*/ sentry/ ← 透過 MCP 連外部工作系統（任務追蹤、知識庫、錯誤監控）
        ├── playwright/ playwright-interactive/ screenshot/ ← 瀏覽器自動化、截圖
        ├── speech/ transcribe/ pdf/ jupyter-notebook/ ← 語音、轉錄、PDF、筆記本
        ├── *-deploy/ （cloudflare / netlify / render / vercel） ← 部署
        └── 其他：aspnet-core、chatgpt-apps、cli-creator、hatch-pet、winui-app、figma-*（共 8 個 figma 相關）
```

每個技能資料夾的標準形狀（44 個全部都有 `agents/openai.yaml`，我用 `grep -c 'agents/openai.yaml'` 對檔案清單計數＝44）：

```
<skill-name>/
├── SKILL.md            必要：YAML frontmatter（name, description）＋ Markdown 指示
├── agents/openai.yaml  建議：給 Codex UI 用的顯示名稱、短描述、預設 prompt、MCP 依賴
├── scripts/            選用：可執行腳本
├── references/         選用：需要時才讀的長文件
├── assets/             選用：輸出會用到的範本、圖示
└── LICENSE.txt         各自的授權
```

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

### 5.1 技能的三層載入（progressive disclosure）
- 位置：[skill-creator/SKILL.md#L127-L137](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L127-L137)
- 重點：第 1 層只有 `name`＋`description`（約 100 字，永遠在 AI 的上下文裡）；第 2 層 SKILL.md 內文（觸發後才讀，建議 <5k 字、<500 行）；第 3 層 scripts/references/assets（需要時才讀或直接執行）。**這和 Claude Agent Skills 的設計完全一樣**，所以同一份技能兩邊都適用。

### 5.2 description 是唯一的觸發機制
- 位置：[skill-creator/SKILL.md#L67-L72](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L67-L72)、[#L333-L343](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L333-L343)
- 重點：「`name` 和 `description` 是 Codex 唯一用來判斷要不要用這個技能的欄位」；所以「什麼時候用」要寫在 description，不要寫在內文的「When to use」段落（內文是觸發後才讀，寫了也沒用）。範例 description 格式：「做什麼＋Use when … (1)…(2)…」。
- 我的統計：44 個 SKILL.md 的 description 平均 310 字元（用自寫 Python 讀 frontmatter 計算）；其中 33 個含「Use when／use when」字樣。

### 5.3 技能格式驗證器
- 位置：[quick_validate.py#L15-L91](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/scripts/quick_validate.py#L15-L91)
- 重點：檢查 `SKILL.md` 存在、以 `---` 開頭、frontmatter 是 YAML 字典；只允許 `name`、`description`、`license`、`allowed-tools`、`metadata` 五個欄位（[#L40](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/scripts/quick_validate.py#L40)）；name 必須小寫英數＋連字號、≤64 字元、不能有 `--`；description ≤1024 字元且不能有 `<` `>`。
- 注意：skill-creator 內文又說「frontmatter 只放 name 和 description，不要其他欄位」（[SKILL.md#L343](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L343)），但驗證器允許 5 個欄位，而且 repo 內 8 個技能用了 `metadata`——**文件與驗證器的規則不一致**（自己的「新舊版本衝突」範例）。

### 5.4 Claude → Codex 規則檔轉換（AGENTS.md）
- 位置：[instructions.py#L17-L57](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/instructions.py#L17-L57)、[cli.py#L250-L299](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/cli.py#L250-L299)
- 重點：
  1. 依序找 `.claude/CLAUDE.md`（僅全域）、`CLAUDE.md`、`claude.md`、`AGENTS.md`，取第一個存在的。
  2. 如果內容**不含** `/hooks`、`.claude/agents/`、`.claude/settings`、`Subagent`、`subagent`、`permissionMode`、`ExitPlanMode` 這 7 個「Claude 專屬」關鍵字 → `AGENTS.md` 做成 symlink 指向 `CLAUDE.md`（同一份檔案）。
  3. 如果含有 → 複製一份到 `AGENTS.md`，尾巴加上 `## MANUAL MIGRATION REQUIRED` 區塊，報告狀態 `manual_fix_required`。
  4. 驗證時，`AGENTS.md` 超過 32KB 就警告（[instructions.py#L33](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/instructions.py#L33)、[#L60-L81](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/instructions.py#L60-L81)）。

### 5.5 技能與 slash command 轉換
- 位置：[skills.py#L37-L58](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/skills.py#L37-L58)、[#L65-L94](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/skills.py#L65-L94)
- 重點：`.claude/skills/<name>/SKILL.md` → `.agents/skills/<name>/SKILL.md`，並複製 `scripts/`、`references/`、`assets/`；`.claude/commands/*.md` → `.agents/skills/source-command-<name>/SKILL.md`。偵測 `$ARGUMENTS`、`{{var}}`、`` !`cmd` ``、`@file` 這些 Claude 專屬語法並提醒人工改寫。

### 5.6 角色（subagent）轉換
- 位置：[agents.py#L104-L141](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/agents.py#L104-L141)、模型對照 [common.py#L33-L76](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/common.py#L33-L76)
- 重點：Claude agent 的 frontmatter → TOML：`name`、`description`、`model`（`claude-opus*`→`gpt-5.4`、`claude-sonnet*`／`claude-haiku*`→`gpt-5.4-mini`）、`model_reasoning_effort`（Sonnet 自動調高一級）、`sandbox_mode`（只對應 `acceptEdits`→`workspace-write`、`readOnly`→`read-only`）、`developer_instructions`（Claude agent 內文＋把 tools / skills 清單改寫成文字指示）。

### 5.7 健檢與驗證模式
- 位置：[cli.py#L426-L433](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/cli.py#L426-L433)（validate_target）、[cli.py#L730-L800](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/cli.py#L730-L800)（參數）
- 重點：`validate_target` 依序檢查 config.toml 能否解析、技能 frontmatter、agent TOML 必要欄位（name/description/developer_instructions，見 [agents.py#L293-L326](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/agents.py#L293-L326)）、AGENTS.md 大小；有 `error` 就以 exit code 1 結束——適合放進每日排程。
- 規模（自己數）：migrate-to-codex 的 15 個 .py 共 3,212 行（`wc -l`；扣掉 SKILL.md 與 differences.md），頂層 `def` 共 116 個（`grep -c '^def '` 逐檔加總）。

### 5.8 技能安裝
- 位置：[skill-installer/SKILL.md#L43-L50](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-installer/SKILL.md#L43-L50)、[install-skill-from-github.py#L45-L46](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-installer/scripts/install-skill-from-github.py#L45-L46)
- 重點：裝到 `$CODEX_HOME/skills/<name>`（預設 `~/.codex/skills`），已存在就中止，不覆蓋。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| Claude↔Codex 對照表 | [references/differences.md](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md) | 無（純文件） | 低 | 放進你的 `docs/ai-team/` 當「兩家 AI 能力差異」參考；注意它寫「Docs last checked: 2026-04-20」，要自己定期重查 |
| 規則檔 symlink 判斷邏輯 | [instructions.py#L17-L57](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/instructions.py#L17-L57) | Python 標準庫 | 低 | 改寫成巡讀檢查：「CLAUDE.md 裡有沒有出現 Claude 專屬字眼？有的話 AGENTS.md 就不能共用」；Firebase 專案可改用 Node 寫同邏輯（只是字串比對） |
| AGENTS.md 32KB 大小檢查 | [instructions.py#L60-L81](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/instructions.py#L60-L81) | Python 標準庫 | 低 | 每日巡讀時掃全專案所有 AGENTS.md／CLAUDE.md，超過門檻就提醒拆分 |
| SKILL.md 驗證器 | [quick_validate.py](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/scripts/quick_validate.py) | PyYAML | 低 | 對 `.agents/skills/*` 與 `.claude/skills/*` 跑一次，兩邊格式都能檢查 |
| 寫技能守則 | [skill-creator/SKILL.md](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md) | 無 | 低 | 抽出「Core Principles」「What to Not Include」「Frontmatter」三段，寫進你的共用規則「新增技能前必讀」 |
| 健檢報告格式 | [migrate-to-codex/SKILL.md#L51-L67](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/SKILL.md#L51-L67) | 無 | 低 | 直接當巡讀報告的表格規格（三種狀態＋Item＋Notes 必填） |
| 自我修復迴圈 | [migrate-to-codex/SKILL.md#L69-L80](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/SKILL.md#L69-L80) | 無 | 低 | 「plan → dry-run → 執行 → 修 → validate → 重跑直到沒有待修項」可改寫成巡讀後的修正流程 |
| 目標定義技能 | [define-goal/SKILL.md](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/define-goal/SKILL.md) | 無（但 `get_goal`/`create_goal` 是 Codex 專屬工具） | 低 | 把第 5–6 步的工具呼叫換成「寫進 `docs/backlog.md`」，就能在 Claude 也用；Goal Quality Bar 五問可放進派工規則 |
| Surface Map（什麼該寫在哪） | [.system/openai-docs/SKILL.md#L86-L100](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/openai-docs/SKILL.md#L86-L100) | 無 | 低 | 抄進共用規則：「一次性要求→對話；長期規則→AGENTS.md；可重複流程→skill；機械式強制→hook；排程→automation」 |
| 三家規則檔對照 | [figma-create-design-system-rules/SKILL.md#L169-L177](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/figma-create-design-system-rules/SKILL.md#L169-L177) | 無（但此技能無授權檔，只參考概念） | 低 | Claude=`CLAUDE.md`／`.claude/rules/*.md`；Codex=`AGENTS.md`；Cursor=`.cursor/rules/*.mdc` |
| 完整轉換器 | [migrate-to-codex/scripts/](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/cli.py) | Python 3.11+ | 中 | 如果你真的要把整套 `.claude/` 設定複製一份給 Codex，可以整包借用；但它只做單向（Claude→Codex） |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **目標 AI**：Codex（OpenAI）。文中常寫「Codex is already very smart」，所有 SKILL.md 就是 prompt 本身。
- **模型**：`common.py` 寫死 Claude→GPT 對照（`claude-opus`→`gpt-5.4`，`claude-sonnet`／`claude-haiku`→`gpt-5.4-mini`），見 [common.py#L60-L76](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/common.py#L60-L76)。`openai-docs` 的 `references/latest-model.md` 記錄最新模型。
- **MCP**：`agents/openai.yaml` 可宣告 MCP 依賴（`dependencies.tools[].type: "mcp"`），見 [openai_yaml.md#L16-L23](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/references/openai_yaml.md#L16-L23)。linear、notion、figma、sentry 都靠 MCP。
- **Skills 標準**：README 明說遵循「Agent Skills open standard（agentskills.io）」（[README.md#L6-L14](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/README.md#L6-L14)）——和 Claude 用的是同一個標準。
- **能不能換成 Claude？** 可以，大部分技能是純 Markdown：
  - **兩邊共通**：`name`、`description`、內文、`scripts/`、`references/`、`assets/`。
  - **只有 Codex 讀**：`agents/openai.yaml`（Claude 會忽略，放著無害）。
  - **只有 Claude 有效**（Codex 不支援）：`disable-model-invocation`、`model`、`effort`、`argument-hint`、`context`、`agent`、`hooks`、`paths`、`shell`；`allowed-tools` 在 Codex 只是文字建議、不是權限邊界（[differences.md#L30-L34](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L30-L34)）。
  - **要改的字眼**：內文中「Codex」換成中性的「the agent」；`$skill-name` 是 Codex 的呼叫語法（Claude Code 是 `/skill-name`）；Codex 專屬工具（`get_goal`、`create_goal`、`image_gen`、`sandbox_permissions=require_escalated`）要改寫。
- **claude_support 判定：可接**（格式相容，但本 repo 以 Codex 為主，沒有 Claude 安裝指令）。

---

## 8. 擴充方式與 API

1. **新增技能**：照 skill-creator 6 步（理解範例→規劃 scripts/references/assets→`init_skill.py`→編輯→`quick_validate.py`→迭代），見 [skill-creator/SKILL.md#L215-L226](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L215-L226)。命名規則：小寫連字號、動詞開頭、可用工具名當前綴（`gh-address-comments`）、資料夾名＝技能名（[#L228-L234](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L228-L234)）。
2. **UI 中繼資料**：`agents/openai.yaml` 的 `interface.display_name`／`short_description`（25–64 字元）／`default_prompt`（必須包含 `$skill-name`）／圖示／品牌色（[openai_yaml.md#L25-L43](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/references/openai_yaml.md#L25-L43)）。
3. **打包成 plugin**（接班方式）：`.codex-plugin/plugin.json`＋選用 `skills/`、`hooks/`、`.mcp.json`、`.app.json`；目錄註冊在 `<repo>/.agents/plugins/marketplace.json`（[plugin-creator/SKILL.md#L47-L107](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/plugin-creator/SKILL.md#L47-L107)）。實例：[openai/plugins 的 superpowers/plugin.json](https://github.com/openai/plugins/blob/b767f8fa3be1a22b093127dd59956c91ecffca9d/plugins/superpowers/.codex-plugin/plugin.json)（`"skills": "./skills/"`、`"version": "6.3.0"`）。
4. **安裝別人的技能**：`$skill-installer <name>` 或給 GitHub 網址（[README.md#L15-L39](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/README.md#L18-L40)），裝完要重啟 Codex。
5. **沒有程式 API**：不是函式庫，沒有可 import 的 API。

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護狀況**：README 宣告 deprecated；但最後 push 2026-10-28、`.system/openai-docs` 仍在更新，看起來是「凍結中、偶爾同步」。**新東西請看 openai/plugins**（我 clone 時有 62 個 plugin 資料夾、536 份 SKILL.md、64 份 plugin.json，用 `ls-tree` 計數）。
- **測試／CI**：完整檔案清單中沒有 `.github/`、沒有任何測試資料夾或 test 檔（`grep -i test` 只找到文件與無關腳本）。轉換器沒有單元測試。
- **repo 自己就有「重複」與「新舊版本衝突」**（很好的反面教材）：
  1. `openai-docs` **同時存在於 `.system` 和 `.curated`**。`diff` 結果：`.system` 版 SKILL.md 多了一段「API Key Setup」（較新）；但 `.curated` 版 `references/latest-model.md` 已改成 `gpt-image-2`，`.system` 版還寫 `gpt-image-1.5` 是最佳（較舊）——**兩份各有一半是新的**。見 [.system 版 latest-model.md#L19](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/openai-docs/references/latest-model.md#L19) vs [.curated 版 #L19-L20](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/openai-docs/references/latest-model.md#L19-L20)。
  2. 技能安裝位置不一致：skill-installer 裝到 `~/.codex/skills`，migrate-to-codex 與 plugin-creator 用 `.agents/skills`。
  3. README 還在教 `.experimental`，但資料夾已不存在。
  4. skill-creator 說「frontmatter 只放 name、description」，驗證器卻允許 5 個欄位。
  5. 接班 repo openai/plugins 的 README 提到 `plugins/netlify`、`plugins/google-slides`，但檔案清單裡兩者都是 0 個檔案（[openai/plugins README.md#L22](https://github.com/openai/plugins/blob/b767f8fa3be1a22b093127dd59956c91ecffca9d/README.md#L23-L25)）。
- **SKILL.md 超過 500 行建議上限的有 3 個**：`playwright-interactive` 693 行、`hatch-pet` 539 行、`figma-create-design-system-rules` 537 行（`wc -l` 計數）。
- **資安**：skill-installer 會從 GitHub 下載並放進 AI 會讀的資料夾——**任何第三方技能都等於一段會被 AI 執行的 prompt＋腳本**，安裝前要人工讀過。它有 `_safe_extract_zip`、`_validate_relative_path` 防路徑穿越（函式名稱見 install-skill-from-github.py，我只看了函式清單）。`migrate-to-codex` 明訂不改 `.claude/`、不碰 secrets（[SKILL.md#L10](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/SKILL.md#L10)）。
- **遙測**：我讀過的腳本只用 `urllib` 連 GitHub，沒看到遙測碼；未逐檔掃描全部 42 個 .py 的網路行為（未確認）。
- **已知的坑**：Codex 的 hooks 只對 shell 指令觸發 PreToolUse/PostToolUse，Claude 綁在 Edit/Write 上的 hook 要改放 Stop hook（[differences.md#L84-L85](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L84-L85)）；Codex 子代理的權限是「預設值」不是硬隔離（[#L64](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L64)）。

---

## 10. 跟其他專案組合的建議

- **openai/skills（本包）＋ anthropics/skills**：兩家官方的 skill-creator 對照著讀，取交集寫成你的「共用技能寫法」——兩邊都同意：description 決定觸發、SKILL.md 精簡、細節放 references、腳本放 scripts。用本包的 `quick_validate.py` 檢查格式，用 Anthropic 那邊的評測流程檢查觸發效果。
- **本包 migrate-to-codex ＋ 你自己的 `CLAUDE.md`**：最實際的一步——把 `CLAUDE.md` 裡 Claude 專屬內容（hooks、subagent、plan mode）搬到 `.claude/` 設定或另一份檔案，讓 `CLAUDE.md` 變「中性」，再讓 `AGENTS.md` symlink 過去，GPT 和 Claude 從此讀同一份規則。
- **本包的報告格式 ＋ obra/superpowers（openai/plugins 也收錄了它）**：superpowers 的 `subagent-driven-development` 有「ledger（進度帳本）」：每個計畫一個 `progress.md`，第一行寫計畫名稱，每個任務完成寫 `Task <N>: complete`，「上下文被壓縮後，相信 ledger 和 git log，不相信自己的記憶」（[openai/plugins 版 SKILL.md#L124-L160](https://github.com/openai/plugins/blob/b767f8fa3be1a22b093127dd59956c91ecffca9d/plugins/superpowers/skills/subagent-driven-development/SKILL.md#L124-L160)）；`verification-before-completion` 要求「沒有新鮮的驗證證據不准宣稱完成」（[SKILL.md#L1-L30](https://github.com/openai/plugins/blob/b767f8fa3be1a22b093127dd59956c91ecffca9d/plugins/superpowers/skills/verification-before-completion/SKILL.md#L1-L30)）。這兩個補上本包缺的「防漏」。
- **本包的 define-goal ＋ github/spec-kit 或 Fission-AI/OpenSpec**：define-goal 負責把一句話需求變可驗證目標，spec 類工具負責後續的規格與變更提案封存。
- **openai/plugins 的 plugin-eval**：有 `evaluate-skill`、`improve-skill` 技能（只讀了 description，實作未確認），可用來給你自己寫的技能打分數。

---

## 11. 規則／角色／巡檢 檢查表

### 共用規則怎麼寫
- **檔案結構：有**。Codex 讀 `AGENTS.md`、`.codex/config.toml`、`.codex/agents/*.toml`、`.codex/hooks.json`、`.agents/skills/`；Claude 對應 `CLAUDE.md`、`.claude/settings.json`、`.claude/agents/*.md`、`.claude/skills/`、`.mcp.json`。完整對照在 [differences.md#L9-L93](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L9-L93)。沒有 `.ruler`／constitution 之類的設計。
- **分層（全域／專案／子資料夾）：有**。全域 `~/.codex/`（對應 `~/.claude/`），專案 `./.codex/`；「`AGENTS.md`：較近的巢狀檔案適用於它底下的子樹」（[.system/openai-docs/SKILL.md#L91](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/openai-docs/SKILL.md#L91)）。
- **優先順序：部分有**。只有「越近越優先（巢狀 AGENTS.md）」與 Surface Map 的「用最小的範圍」原則；全域 vs 專案衝突怎麼解，本 repo 沒寫（未確認，要看 Codex 官方文件）。
- **讓 GPT 和 Claude 讀同一份規則：有**——`AGENTS.md` → symlink → `CLAUDE.md`，前提是內容中性（[instructions.py#L24-L57](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/instructions.py#L24-L57)）。Windows 上 symlink 需要權限，替代做法是讓 `CLAUDE.md` 只寫一行「請讀 AGENTS.md」（這是我的建議，本 repo 未提）。

### 角色設計
- **有哪些角色：沒有**現成的角色清單（沒有 PM／工程師／審查員之類）。只有「角色檔格式」的對照：Claude `.claude/agents/*.md` ↔ Codex `.codex/agents/*.toml`（[agents.py#L104-L141](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/agents.py#L104-L141)）。
- **職責／技能／工具：格式有**。TOML 欄位 `description`（職責，也是自動分派依據）、`developer_instructions` 內的 `## Skills`（技能清單，用 `$skill-name`）與 `## Tools`（允許／禁止工具），範例見 [differences.md#L124-L148](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L124-L148)。
- **交接（handoff）／誰向誰負責：沒有**。本 repo 沒有交接協定；openai/plugins 裡 superpowers 的 implementer 回報四種狀態 `DONE`／`DONE_WITH_CONCERNS`／`NEEDS_CONTEXT`／`BLOCKED`，由主控者派 reviewer（實作細節屬 obra/superpowers，見該資料包）。

### 防漏
- **任務追蹤：部分有**。`define-goal` 要求每個目標寫清楚「完成條件、驗證證據、範圍、何時停下來問人」（[define-goal/SKILL.md#L20-L27](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/define-goal/SKILL.md#L20-L27)），並在建立前檢查「已有相同目標就沿用，不重建」（[#L41-L45](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/define-goal/SKILL.md#L41-L45)）。migrate-to-codex 要求用內建 TODO 工具、結束前每項都要 `completed`、不能留 `in_progress`（[SKILL.md#L16](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/SKILL.md#L16)）。`linear` 技能可接 Linear 任務系統。
- **完成前驗證：有**。migrate-to-codex 的 self-healing loop：每次修改後跑 `--validate-target`，直到「沒有可處理的待修項」才停（[SKILL.md#L69-L80](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/SKILL.md#L69-L80)）。
- **交接紀錄：部分有**。轉換結果寫到 `.codex/migrate-to-codex-report.txt`（[SKILL.md#L43](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/SKILL.md#L43)）；無法自動處理的地方在產出檔案裡留 `## MANUAL MIGRATION REQUIRED` 區塊——**「把待辦直接寫在檔案裡，讓下一個 AI 看得到」**，這招可以借。

### 防重複
- **重複內容：有（只有原則）**。「資訊只放 SKILL.md 或 references 其中一處，不要兩邊都寫」（[skill-creator/SKILL.md#L104](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L104)）；「不要建 README、CHANGELOG 等多餘文件」（[#L115-L125](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L115-L125)）。
- **重複規則：有**。symlink 策略本身就是「一份規則、兩個入口」，避免 CLAUDE.md 與 AGENTS.md 各寫一份後漸漸不同步。
- **重複角色／技能偵測：沒有**。沒有任何腳本偵測重名或相似技能——而 repo 自己就有 `openai-docs` 重複兩份的問題（見第 9 節）。skill-installer 只會在「同名資料夾已存在」時中止。

### 防新舊版本衝突
- **版本標記：部分有**。`differences.md` 開頭寫「Docs last checked: 2026-04-20，若今天更晚，請先重查官方文件再相信這些對照」（[differences.md#L7](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L7)），SKILL.md 也要求檢查這個日期（[SKILL.md#L26](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/SKILL.md#L26)）——**「每份參考文件標註最後查證日期＋過期就重查」是最簡單有效的防過期機制，強烈建議抄**。plugin.json 有 `version` 欄位；SKILL.md 本身沒有版本欄位。
- **單一事實來源：有**（AGENTS.md symlink）。openai-docs 技能也寫「官方文件與現場可呼叫的能力衝突時，說明衝突並以實際驗證過的為準」（[.system/openai-docs/SKILL.md#L76](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/openai-docs/SKILL.md#L76)）。
- **變更提案／封存：沒有**。
- **過期（staleness／drift）偵測：部分有**。skill-creator 要求「更新技能時檢查 agents/openai.yaml 是否仍與 SKILL.md 一致，過期就重新產生」（[skill-creator/SKILL.md#L80](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L80)）。但沒有自動化檢查。

### 定期巡檢
- **排程／每日巡讀：沒有現成技能**。只有 Surface Map 提到「Automation → 排程檢查、提醒、監控；需要延續同一討論串時用 thread heartbeat」（[.system/openai-docs/SKILL.md#L97](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/openai-docs/SKILL.md#L97)）——代表 Codex 有 automations 功能可排程，但本 repo 沒提供巡讀技能。Hook 方面，Codex 支援 `SessionStart`、`Stop`、`PreToolUse`、`PostToolUse`、`UserPromptSubmit`，需在 config 啟用 `[features].codex_hooks = true`（[differences.md#L78-L93](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L78-L93)）。
- **報告格式：有（可借）**。migrate-to-codex 規定的表格：

```markdown
**warehouse-app**

| Status | Item | Notes |
| --- | --- | --- |
| `Added` | `Skill` daily-patrol | Converted into a Codex skill |
| `Check before using` | `Hook` PreToolUse | Converted, but some Claude hook behavior differs in Codex |
| `Not Added` | `Plugin` team-macros | Plugin needs manual setup |
```
（格式出自 [SKILL.md#L55-L67](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/SKILL.md#L55-L67)；規則：狀態只能三選一、Notes 必填、用字白話。）改成你的巡讀版可以是：`狀態（OK／要確認／衝突）｜項目（類型＋檔名）｜說明`。

### Skill 寫法
- **SKILL.md 格式：有**。YAML frontmatter（`name`、`description` 必填；驗證器另允許 `license`、`allowed-tools`、`metadata`）＋ Markdown 內文（[skill-creator/SKILL.md#L48-L65](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L48-L65)）。
- **description 怎麼寫：有**。「做什麼＋具體觸發情境」，把所有 when-to-use 寫進 description（[#L337-L341](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L337-L341)）。好例子：`security-ownership-map` 同時寫「Trigger only when…」和「Do not trigger for…」（正反條件都寫，減少誤觸發）；`yeet` 寫「Use only when the user explicitly asks…」。
- **資料夾結構：有**。`scripts/`（確定性、重複寫的程式）、`references/`（需要時讀的長文件，>100 行要加目錄，>10k 字要在 SKILL.md 給 grep 關鍵字）、`assets/`（輸出用的範本），references 只能一層深（[#L84-L113](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L84-L113)、[#L210-L213](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L210-L213)）。
- **腳本放哪：有**。`<skill>/scripts/`；寫完必須實際跑過測試（[#L325](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L325)）。自由度原則：易錯的流程給固定腳本（低自由度），需要判斷的給文字說明（高自由度）（[#L36-L46](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/skill-creator/SKILL.md#L36-L46)）。

### 支援哪些工具與安裝方式
- **Codex（CLI／App／IDE）：原生**。`.system` 自動安裝；`.curated` 用 `$skill-installer <name>`，裝到 `~/.codex/skills`，重啟生效。專案層級放 `.agents/skills/`。
- **Claude Code：可接**（未提供安裝說明）。把技能資料夾複製到 `.claude/skills/<name>/` 或 `~/.claude/skills/<name>/` 即可讀；`agents/openai.yaml` 會被忽略。Claude Code 是否也讀 `.agents/skills/`——本 repo 沒寫，**未確認**；保險做法是 `.claude/skills` 用 symlink 指到 `.agents/skills`。
- **Cursor：只有規則檔對照**（`.cursor/rules/*.mdc`，見 figma-create-design-system-rules），沒有技能安裝說明。

### 可以直接借用到你的「基礎架構」的檔案或段落
1. `skills/.curated/migrate-to-codex/references/differences.md` 全文——放 `docs/ai-team/claude-vs-codex.md`，標上查證日期。
2. `skills/.curated/migrate-to-codex/scripts/migrate/instructions.py` 第 24–33、56–57、60–81 行——巡讀腳本的「規則檔是否中性」「規則檔是否過大」兩項檢查。
3. `skills/.system/skill-creator/scripts/quick_validate.py`——巡讀時檢查所有 SKILL.md 格式。
4. `skills/.system/skill-creator/SKILL.md` 第 26–46、115–137、328–343 行——共用規則的「技能寫作守則」。
5. `skills/.system/openai-docs/SKILL.md` 第 86–100 行（Surface Map）——共用規則的「這件事該寫在哪裡」。
6. `skills/.curated/define-goal/SKILL.md` 第 54–78 行（Goal Quality Bar 與好壞範例）——派工給任何 AI 前的檢查。
7. `skills/.curated/migrate-to-codex/SKILL.md` 第 51–80 行——巡讀報告格式＋修到乾淨為止的迴圈。

**依本包內容組出的「最小基礎架構」建議（我的整理，不是 repo 原文）：**

```
你的專案/
├── AGENTS.md                ← 唯一的共用規則（中性寫法，不提 Claude/Codex 專屬功能）
├── CLAUDE.md -> AGENTS.md   ← symlink（或一行「請讀 AGENTS.md」）
├── .agents/skills/          ← 兩家共用技能（SKILL.md 只用 name/description）
│   └── daily-patrol/SKILL.md
├── .claude/skills -> ../.agents/skills   ← 讓 Claude 讀同一批技能
├── .claude/agents/*.md      ← Claude 的角色
├── .codex/agents/*.toml     ← Codex 的角色（可用 migrate-to-codex 從上面產生）
└── docs/ai-team/
    ├── claude-vs-codex.md   ← 借 differences.md，標「最後查證日期」
    ├── backlog.md           ← 任務帳本：每項寫完成條件＋驗證方式（借 define-goal）
    └── patrol/2026-11-04.md ← 每日巡讀報告（借 Status｜Item｜Notes 表格）
```

`daily-patrol` 技能的 description 範例（依 skill-creator 原則寫，正反條件都有）：
```yaml
---
name: daily-patrol
description: Read the whole project once and report missed tasks, duplicated or overlapping rules and docs, and old-vs-new version conflicts between AGENTS.md, skills, agent role files and docs. Use when the user asks for the daily patrol, 巡讀, project audit, or consistency check. Do not use for implementing features or fixing bugs.
---
```
內文檢查項可以直接對應本包的機制：(1) AGENTS.md/CLAUDE.md 是否仍是同一份、是否 >32KB；(2) 所有 SKILL.md 跑 quick_validate；(3) 找同名或 description 高度相似的技能（本包沒有，要自己寫）；(4) 掃「最後查證日期」超過 N 天的參考文件；(5) backlog 中沒有驗證證據卻標完成的項目；(6) 輸出 Status｜Item｜Notes 表格。

---

## 關鍵字
openai/skills、Codex、GPT、Agent Skills、SKILL.md、agents/openai.yaml、AGENTS.md、CLAUDE.md、symlink、單一事實來源、single source of truth、migrate-to-codex、Claude Code 轉 Codex、.agents/skills、.codex/agents、TOML 子代理、subagent、hooks、codex_hooks、MCP、skill-creator、quick_validate、skill-installer、plugin-creator、openai/plugins、plugin.json、marketplace.json、define-goal、目標定義、progressive disclosure、description 觸發、Surface Map、巡讀、每日巡檢、daily patrol、版本衝突、staleness、Docs last checked、重複規則、技能格式驗證、Apache-2.0、deprecated、superpowers、ledger、verification-before-completion
