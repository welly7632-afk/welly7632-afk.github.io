# VoltAgent/awesome-claude-code-subagents — 166 個 Claude Code 角色檔（subagent）的大型目錄，可當「AI 角色職務說明書」範本庫
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：ed74d11
> GitHub：https://github.com/VoltAgent/awesome-claude-code-subagents｜⭐ 26328｜授權：MIT｜主要語言：Shell｜最近更新：2026-11-02

> 本資料包的 permalink 都指向 commit `ed74d115b7fb7026a22a4f816a8e3250f425e3b4`（以下簡寫為 `ed74d11`）。另外也看了同組織的姊妹專案 **VoltAgent/awesome-codex-subagents**（Codex 版，commit `9abe3279a0aa4ee518381af800ca1062398f5433`），因為使用者很在意 GPT／Codex 與 Claude 一起工作。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 這不是一套程式，而是一大包「已經寫好的 AI 角色說明書」：每個 `.md` 檔＝一個 Claude Code 子代理（subagent），開頭用 YAML 寫明「我叫什麼、什麼時候該叫我、我能用哪些工具、用哪個模型」，下面是這個角色的工作守則。

**對你（倉儲／庫存網頁 + 跑廣告 + 想讓 GPT 和 Claude 有秩序地合作）最有用的地方：**

1. **直接解決「每個角色該具備什麼技能」**：專案裡有 166 個角色檔（我用 `ls categories/*/*.md` 扣掉 10 個 README 數出來的），分 10 類。你不用從零想「審查員要會什麼」「文件管理員要會什麼」，挑幾個改成中文、改成你的專案規則就好。
2. **「巡讀」相關的角色已經有現成的守則**（這是你最在意的）：
   - `docs-drift-editor`：程式改了、文件沒跟著改（新舊版本對不上）時，只做最小修改，超過 40% 就不改、留 TODO 給人看。
   - `memory-curator`：AI 的長期記憶怎麼存、**舊決定不刪除而是「關閉」並標註被誰取代**、兩條記憶互相矛盾時要把兩條都列出來給人決定、定期列出「過期／重複／被取代」清單請人批准刪除。這幾乎就是你要的「新版本 vs 舊版本」管理規則。
   - `context-manager`：多個 AI 共用的狀態檔（state.md、decisions.md、task-history.md）要放哪、誰可以寫、怎麼寫；「兩個檔案說法不一致就標記衝突，不要偷偷選一個」。
   - `ponder-auditor`：「100% 覆蓋」的稽核守則 —— 先列出全部要檢查的單位，還有沒檢查到的就不准說完成。這正好是「巡讀整個專案、看看有沒有 AI 漏掉東西」的核心精神。
   - `surgeon-reviewer`：只報真正會出事的問題，分三級（WILL BREAK／WILL COST／WILL ROT），最後給「可以上線／修完再上線／不可上線」的結論。其中 WILL ROT 明確包含「重複的邏輯以後會各自走樣」。
   - `knowledge-synthesizer`、`error-coordinator`：從多個 AI 的工作紀錄（log、對話紀錄）裡找重複出現的問題，每一條都要附證據檔案路徑與行號。
3. **有 Codex（GPT）版的姊妹目錄**：`VoltAgent/awesome-codex-subagents` 用 Codex 原生的 `.toml` 格式寫同名角色（放在 `.codex/agents/`）。你可以讓 Claude 和 Codex 各自擁有「同一個名字、同一個職責」的角色。**但要注意：兩邊內容不是同一份來源**（下面第 11 節會說明），需要你自己維持一份「主版本」。
4. **跟你生意相關的角色**也有：`javascript-pro`（你的網頁是純 JavaScript）、`landing-page-copywriter`（廣告落地頁文案）、`content-marketer`、`seo-specialist`、`data-analyst`、`motion-director`（用程式碼做 60 FPS 產品動畫影片，參考另一個 claude-motion 專案）、`telegram-ads-analyst`（Telegram 頻道廣告，台灣用得少）。

**它「不是」什麼：** 它沒有排程器、沒有每天自動跑的機制、沒有共用規則檔（AGENTS.md）範本、也沒有 SKILL.md 格式的技能。它是「角色的零件庫」，要自己組裝成你的「AI 團隊制度」。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**（[LICENSE](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/LICENSE)，Copyright (c) 2025 VoltAgent）。姊妹專案 Codex 版也是 MIT（Copyright (c) 2026 VoltAgent）。
- **個人使用**：完全可以，複製、修改、翻成中文都行。
- **公司商用**：也可以，包含放進你公司的內部規則、甚至放進要賣的產品。唯一義務是**保留原本的版權聲明與 MIT 授權文字**（例如在你的 `.claude/agents/` 資料夾放一份 `LICENSE-voltagent.txt`）。
- **個別角色的來源**：有 6 個角色檔在最後寫了 `## Source`（我用 `grep -l '## Source'` 數的），表示是從別的開源專案改編，例如 `surgeon-reviewer` 標註來自 LucianFord/agent-pack（MIT）、`ponder-auditor` 來自 Quinnod345/ponder（MIT）。這些原作者的授權本文我沒有去確認（**未確認**），商用前建議看一下原專案。
- **免責聲明**：README 最後明講「所有子代理照現狀提供、維護者沒有稽核其安全性或正確性」（[README.md#L507-L515](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/README.md#L507-L515)）。
- **付費版／閉源功能**：沒有。專案本身不收費；README 上的贊助商（Crawlbase、SerpApi 等）是廣告，不是必要元件。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容 |
|---|---|
| 主體 | 純 Markdown（角色檔）＋ YAML frontmatter；JSON（外掛清單）；Bash（安裝腳本） |
| 前端／後端／資料庫 | 都沒有。這是內容型專案，不需要伺服器。 |
| 執行環境 | 需要 **Claude Code**（Anthropic 的命令列 AI 工具）。角色檔放進 `~/.claude/agents/`（全域）或專案內的 `.claude/agents/`（專案層級）即可被讀到。 |
| 安裝方式 | (1) `claude plugin marketplace add VoltAgent/awesome-claude-code-subagents` 後 `claude plugin install voltagent-meta` 等；(2) 手動複製 .md；(3) 互動式 `install-agents.sh`；(4) 先裝 `agent-installer` 角色，讓 Claude 幫你裝。見 [README.md#L48-L100](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/README.md#L48-L100)。 |
| 安裝腳本需求 | `install-agents.sh` 需要 `curl`，遠端模式會呼叫 GitHub API 與 raw.githubusercontent.com（[install-agents.sh#L20-L28](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/install-agents.sh#L20-L28)）。Windows 要在 Git Bash／WSL 下跑（推論，未實測）。 |
| 硬體／GPU | 不需要。 |
| API Key 與費用 | 不需要額外 API Key；費用就是你的 Claude 訂閱或 Anthropic API 用量。角色檔的 `model` 欄位會決定子代理用哪個模型：我數過 166 個檔案中 `sonnet` 111 個、`inherit`（沿用主對話模型）27 個、`haiku` 19 個、沒寫 9 個、**`opus` 0 個**。用 haiku 的角色較省錢。 |
| 少數角色需要的外部工具 | `content-quality-editor` 要 `npm install -g unslop`、`visual-asset-generator` 要 `npm install -g prompt-to-asset`（有 MCP 與 30+ 圖像模型，可能需要各圖像服務 API Key，未確認）、`ui-ux-tester` 需要 `chrome-mcp`／`computer-use`、`motion-director` 需要 Playwright＋FFmpeg。 |

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

整個 repo 共 201 個檔案（`git ls-tree -r --name-only HEAD | wc -l`）。

```
awesome-claude-code-subagents/
├── .claude-plugin/
│   └── marketplace.json          ← Claude Code「外掛市集」清單：10 個外掛（每類一個）＋版本號
├── .claude/settings.local.json   ← 維護者自己用的 Claude Code 權限設定（允許 python3、git status 等），跟使用者無關
├── .github/workflows/
│   └── enforce-plugin-version-bump.yml ← CI：改了某類別的 .md 卻沒升版本號 → PR 擋下
├── CLAUDE.md                     ← 給 Claude 看的「本 repo 規則」：角色檔格式、工具分配、新增角色要改哪 3 個檔
├── CONTRIBUTING.md               ← 貢獻規則（含版本號規定）
├── README.md                     ← 總目錄＋安裝說明＋格式說明（517 行）
├── install-agents.sh             ← 互動式安裝／移除腳本（583 行 Bash）
├── tools/subagent-catalog/       ← 一組 Claude Code 斜線指令（/subagent-catalog:search 等），用來搜尋本目錄
│   ├── config.sh                 ← 快取（12 小時 TTL）與下載函式
│   ├── search.md / fetch.md / list.md / invalidate.md ← 每個指令一個 .md（有 name/description frontmatter）
│   └── README.md
└── categories/                   ← 本體：10 個類別資料夾
    ├── 01-core-development/      13 個角色（api-designer、frontend-developer…）
    ├── 02-language-specialists/  30 個（javascript-pro、typescript-pro、python-pro…）
    ├── 03-infrastructure/        16 個（devops、docker、cloud…）
    ├── 04-quality-security/      19 個（code-reviewer、surgeon-reviewer、ponder-auditor、qa-expert…）
    ├── 05-data-ai/               13 個（data-analyst、prompt-engineer、llm-architect…）
    ├── 06-developer-experience/  16 個（docs-drift-editor、documentation-engineer、git-workflow-manager…）
    ├── 07-specialized-domains/   17 個（fintech、payment、seo、motion-director…）
    ├── 08-business-product/      19 個（project-manager、backlog-grooming、landing-page-copywriter…）
    ├── 09-meta-orchestration/    12 個（context-manager、memory-curator、agent-organizer、knowledge-synthesizer…）
    └── 10-research-analysis/     11 個（competitive-analyst、market-researcher…）
        每個類別內：
        ├── .claude-plugin/plugin.json ← 該類別外掛的名稱、版本、包含哪些角色檔
        ├── README.md                  ← 類別說明＋「Quick Selection Guide」對照表
        └── <角色名>.md                ← 角色檔
```

（每類數量是我用 `ls categories/<類別>/*.md` 扣掉 README 數的，合計 166。）

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

### 5.1 角色檔格式（最核心）
- 位置：[CLAUDE.md#L25-L52](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/CLAUDE.md#L25-L52)、[README.md#L403-L448](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/README.md#L403-L448)
- 重點：
  ```yaml
  ---
  name: agent-name            # 必須和檔名一致（我檢查 166 個全部一致、沒有重名）
  description: 什麼時候該叫這個角色（Claude Code 會依此自動挑選）
  tools: Read, Write, Edit, Bash, Glob, Grep   # 逗號分隔的工具權限
  model: sonnet               # sonnet / haiku / opus / inherit
  ---
  You are a ...（角色說明、檢查清單、工作流程）
  ```
- 我的統計（用 Python 解析 frontmatter）：166 個檔案都有 `name`／`description`／`tools`，157 個有 `model`。內文平均 227 行，最短 22 行（motion-director）、最長 358 行。
- **工具分配原則**（[CLAUDE.md#L47-L52](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/CLAUDE.md#L47-L52)）：審查／稽核＝只讀（`Read, Grep, Glob`）；研究＝只讀＋上網；寫程式＝讀寫＋Bash；文件＝讀寫＋上網。實際統計：106 個是「Read, Write, Edit, Bash, Glob, Grep」全套，不含 Write 也不含 Edit 的只有 22 個（依 tools 欄位逐一加總） —— 也就是說**很多審查角色其實拿到了寫入權限**，例如 `code-reviewer` 的 tools 是 `Read, Write, Edit, Bash, Glob, Grep`（[code-reviewer.md#L1-L6](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/04-quality-security/code-reviewer.md#L1-L6)），跟自己的規則不一致。你借用時要自己改成只讀。

### 5.2 兩種「世代」的角色寫法
- **舊式（大多數）**：一長串條列檢查清單＋一段虛構的 JSON「通訊協定」，例如向 context-manager 發 `{"requesting_agent": "code-reviewer", "request_type": "get_review_context", ...}`（[code-reviewer.md#L127-L142](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/04-quality-security/code-reviewer.md#L127-L142)）和假的進度數字 `"files_reviewed": 47`（[#L196-L208](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/04-quality-security/code-reviewer.md#L196-L208)）。我用 `grep -l requesting_agent` 數到 **126 個**角色有這種寫法。實際上 Claude Code 的子代理之間**沒有**這種訊息管道。
- **新式（09 類大部分已改寫）**：開頭就有「Scope and honesty rules」，明講「你只有這些工具、沒有訊息匯流排、不准報沒算過的數字」。例如 [agent-organizer.md#L60-L67](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/agent-organizer.md#L60-L67)：「There is no message bus... Coordination happens through: Shared files... The invoking orchestrator」。我用 grep 找到 7 個檔案有「no message bus」字樣，全在 09 類。
- **對你的意義**：要借用就借「新式」的，舊式的 JSON 協定段落請刪掉，否則 AI 會假裝在跟別的 AI 溝通、編造數字。

### 5.3 外掛市集＋版本控管
- [marketplace.json#L1-L10](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/.claude-plugin/marketplace.json#L1-L10) 定義 10 個外掛；每類的 [plugin.json](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/.claude-plugin/plugin.json) 列出包含的角色檔。
- [CONTRIBUTING.md#L46-L56](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/CONTRIBUTING.md#L46-L56)：該類別任何 .md 改了，就要升該類 `plugin.json` 的 `version`，並同步 `marketplace.json`。
- [enforce-plugin-version-bump.yml#L18-L81](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/.github/workflows/enforce-plugin-version-bump.yml#L18-L81)：PR 時用 `git diff` 找出改過的類別，比對新舊版本號；再用 `sed`/`awk` 比對 plugin.json 與 marketplace.json 版本是否一致，不一致就讓 CI 失敗。**這是本 repo 唯一真正「自動防新舊版本衝突」的機制**，值得你抄概念（見第 11 節）。

### 5.4 安裝器
- [install-agents.sh#L104-L115](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/install-agents.sh#L104-L115)：`download_agent()` 直接用 `curl` 從 `main` 分支 raw 網址下載單一 .md 到 `~/.claude/agents/` 或 `.claude/agents/`。沒有固定版本、沒有雜湊驗證。
- `agent-installer` 角色（[agent-installer.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/agent-installer.md)）：用 WebFetch／curl 呼叫同一組 GitHub API，讓 Claude 幫你裝。

### 5.5 搜尋指令（subagent-catalog）
- [config.sh#L7-L10](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/tools/subagent-catalog/config.sh#L7-L10)：快取 12 小時、存在 `~/.claude/cache/subagent-catalog.md`。
- [config.sh#L38-L70](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/tools/subagent-catalog/config.sh#L38-L70)：先下載到 `.tmp` 再 `mv`（原子更新，避免寫一半）、下載失敗時退回舊快取並提示「已過期」。這個「過期就提醒、失敗就用舊的但要說」的模式可以借來做你的巡讀報告。
- [search.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/tools/subagent-catalog/search.md)：斜線指令寫法範例（frontmatter `name`/`description` ＋ `$ARGUMENTS` ＋ 分步驟指示）。注意它裝在 `~/.claude/commands/`，是「指令」不是 SKILL.md 技能。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度（低／中／高） | 怎麼接到別的專案 |
|---|---|---|---|---|
| 記憶／新舊版本管理守則 `memory-curator` | [memory-curator.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md) | 只需 Read/Write/Edit/Glob/Grep | 低 | 複製到 `.claude/agents/`；把 `.claude/memory/` 改成你要的位置（例如 `docs/ai/memory/`），讓 Codex 也讀同一份 |
| 共用狀態檔規劃 `context-manager` | [context-manager.md#L25-L79](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/context-manager.md#L25-L79) | 同上 | 低 | 照它的 `state.md / task-history.md / decisions.md / metadata.json` 結構建資料夾，並在 AGENTS.md 指定「誰可以寫哪個檔」 |
| 文件走樣修正 `docs-drift-editor` | [docs-drift-editor.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/06-developer-experience/docs-drift-editor.md) | Read/Edit/Grep/Glob/Bash；需要上游先找出「哪些文件走樣」 | 低～中 | 當巡讀的「修正手」；上游要另外寫一個「偵測者」（本 repo 沒提供） |
| 全面覆蓋稽核 `ponder-auditor` | [ponder-auditor.md#L10-L25](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/04-quality-security/ponder-auditor.md#L10-L25) | 只讀；可選 `ponder` CLI | 低 | 拿它的「先列清單、覆蓋率 <100% 不准結束」「Skeptic 先試著推翻自己的發現」當巡讀的步驟 |
| 精準審查 `surgeon-reviewer` | [surgeon-reviewer.md#L10-L32](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/04-quality-security/surgeon-reviewer.md#L10-L32) | 只讀＋Bash | 低 | 讓 Codex 寫完、Claude 用這個角色審（或反過來）；三級嚴重度直接當報告格式 |
| 證據式彙整 `knowledge-synthesizer` / `error-coordinator` | [knowledge-synthesizer.md#L35-L72](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/knowledge-synthesizer.md#L35-L72)、[error-coordinator.md#L71-L84](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/error-coordinator.md#L71-L84) | 只讀＋寫 Markdown | 低 | 每週讀所有 AI 的工作紀錄，找「重複犯的錯」，輸出 JSON（pattern/evidence/frequency/confidence） |
| 團隊編組／交接規劃 `agent-organizer`、`multi-agent-coordinator` | [agent-organizer.md#L50-L67](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/agent-organizer.md#L50-L67)、[multi-agent-coordinator.md#L25-L50](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/multi-agent-coordinator.md#L25-L50) | 同上 | 低 | 「每個共用檔只有一個寫入者」「交接點要寫明檔名」這兩條直接寫進你的 AGENTS.md |
| 待辦清理 `backlog-grooming` | [backlog-grooming.md#L9-L24](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/08-business-product/backlog-grooming.md#L9-L24) | 無 | 低 | 「90 天沒動的待辦要做決定」「合併重複的待辦」「Now/Next/Later/Icebox/Won't Do」分類可直接用在你的 TODO.md |
| 版本號強制升級 CI | [enforce-plugin-version-bump.yml](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/.github/workflows/enforce-plugin-version-bump.yml) | GitHub Actions、bash/sed/awk | 中 | 改成「規則檔改了就必須更新 `RULES_VERSION` 與 CHANGELOG」的檢查 |
| 快取＋過期提醒函式 | [config.sh#L38-L70](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/tools/subagent-catalog/config.sh#L38-L70) | bash、curl | 低 | 參考「tmp→mv 原子寫入」「過期 N 小時提醒」寫法 |
| JavaScript 專家 `javascript-pro` | [javascript-pro.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/02-language-specialists/javascript-pro.md) | 全套讀寫 | 低 | 當你倉儲系統的「實作者」角色底稿（舊式寫法，需刪 JSON 協定段） |
| 動畫影片導演 `motion-director` | [motion-director.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/07-specialized-domains/motion-director.md) | Playwright、FFmpeg、Three.js | 中 | 跟「AI 影片／產品動畫」專案組合時當 Claude 的導演角色；本體在外部 claude-motion 專案（未看） |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **原生就是給 Claude Code 的**。prompt＝每個角色 .md 的本文；frontmatter 的 `description` 決定 Claude 何時自動叫它。
- **模型路由**：README 宣稱 `opus` 給架構審查／資安／金融（舉例 security-auditor、architect-reviewer、fintech-engineer）（[README.md#L428-L438](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/README.md#L428-L438)），但我實際查這三個檔都是 `model: inherit`，全 repo 0 個 opus。**文件說法和實際檔案對不上**（剛好是「新舊版本衝突」的活教材）。
- **MCP**：少數角色在 tools 列 MCP 工具，例如 `visual-asset-generator`（`mcp__prompt-to-asset`）、`scientific-literature-researcher`（`mcp__bgpt__search_papers`）、`ui-ux-tester`（`chrome-mcp, computer-use`）。
- **Skills（SKILL.md）**：**沒有**。全 repo 找不到 SKILL.md（`grep -rl SKILL.md` 無結果）。`tools/subagent-catalog/` 雖然自稱 skill，但實際是放在 `~/.claude/commands/` 的斜線指令。
- **Codex／GPT**：本 repo 只支援 Claude Code。Codex 版在姊妹專案 [awesome-codex-subagents](https://github.com/VoltAgent/awesome-codex-subagents/blob/9abe3279a0aa4ee518381af800ca1062398f5433/README.md)：格式為 `.toml`，欄位 `name`、`description`、`model`、`model_reasoning_effort`、`sandbox_mode`（`read-only`／`workspace-write`）、`developer_instructions`，放 `~/.codex/agents/` 或 `.codex/agents/`。實際檔案範例：[context-manager.toml](https://github.com/VoltAgent/awesome-codex-subagents/blob/9abe3279a0aa4ee518381af800ca1062398f5433/categories/09-meta-orchestration/context-manager.toml)。它的 README 格式範例寫 `[instructions] text = """..."""`，但實際檔案用 `developer_instructions = """..."""`，**同樣有文件與檔案不一致**。
- **能不能換成 Claude**：本來就是 Claude。反過來要給 Codex 用，就把 frontmatter 轉成 toml（`tools` 只讀 → `sandbox_mode = "read-only"`，其餘 → `workspace-write`）。

---

## 8. 擴充方式與 API

- **加一個角色**：在對應類別新增 `<name>.md`，並依 [CLAUDE.md#L54-L62](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/CLAUDE.md#L54-L62) 同時更新主 README（按字母順序）、類別 README（Quick Selection Guide 表）；另外依 CONTRIBUTING 要升 plugin.json 版本並加到 `agents` 陣列。
- **存放位置與優先順序**：[README.md#L393-L401](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/README.md#L393-L401)：專案 `.claude/agents/` 優先於全域 `~/.claude/agents/`，同名時專案版覆蓋全域版。
- **自訂**：改 `model` 欄位換模型、在 `tools` 加 MCP 工具名。README 說 tools 留空＝繼承所有工具。
- **加工具（tools/）**：[CONTRIBUTING.md#L58-L72](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/CONTRIBUTING.md#L58-L72)：每個指令一個 .md＋共用 .sh 腳本，description 要寫觸發語句。
- **沒有程式 API**，只有 GitHub API／raw 網址可以抓檔案。

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

**維護狀況：** 很活躍。最新 commit 是 2026-11-02 合併的 PR #335（新增 motion-director）。外掛版本號介於 1.0.1～1.1.3。

**測試：** 沒有任何角色品質測試。唯一 CI 是版本號檢查。

**我自己數出來的「內部不一致」（剛好示範了你擔心的「新舊版本衝突」）：**
1. **角色數量三個說法**：README 徽章寫 161、marketplace.json 描述寫 158、實際檔案 166；README 列表連結 166 個（我用 `grep -o 'categories/[^)]*\.md' README.md | sort -u` 再跟檔案清單 `comm` 比對）。
2. **兩個角色沒被打包進外掛**：`docs-drift-editor`（06 類）與 `motion-director`（07 類）有檔案、README 也有列，但不在各自 `plugin.json` 的 `agents` 陣列裡（我用 Python 比對）。推論：用 `claude plugin install voltagent-dev-exp` 可能拿不到 docs-drift-editor（未實測）。手動複製就沒問題。
3. **README 說有 opus 角色，實際 0 個**。
4. **CLAUDE.md 說審查員只讀，實際 code-reviewer、architect-reviewer 等都有 Write/Edit/Bash**。
5. **`codebase-orchestrator` 的 tools 欄位**列了 `context-manager`、`error-coordinator`、`pied-piper`、`airis-mcp-gateway`、`subagent-catalog:search` 等（[codebase-orchestrator.md#L1-L6](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/codebase-orchestrator.md#L1-L6)），這些是其他角色或外部 MCP 名稱，不是內建工具名，Claude Code 會怎麼處理**未確認**。
6. **126 個角色帶有虛構的 JSON 通訊協定**（見 5.2），容易讓 AI 編造進度數字。
7. **Claude 版與 Codex 版內容不同步**：例如 Codex 版 `context-manager.toml` 的指示（產出精簡 context packet）跟 Claude 版 `context-manager.md`（規劃共用狀態檔）是不同內容；Codex 版沒有 `memory-curator`、`docs-drift-editor`，卻多了 `11-ai-governance-safety`、`13-llmops-evals-observability`（含 `hallucination-investigator`、`prompt-regression-tester`）等類別（我用 `git ls-tree` 列檔確認）。

**資安／隱私：**
- `install-agents.sh` 與 `agent-installer` 直接從 `main` 分支下載，不固定 commit、不驗證雜湊；若上游被改，你下次安裝就拿到新內容。建議：**固定在某個 commit 手動複製**，並把角色檔納入你自己的 git 版控。
- 角色檔就是 prompt，等於讓陌生人寫給你 AI 的指令。README 自己也說「沒有稽核」。借用前每份都要讀過。
- 少數角色要求 `npm install -g` 外部套件（unslop、prompt-to-asset），屬供應鏈風險。
- 遙測：repo 本身沒有任何遙測程式。README 有贊助商追蹤網址（utm 參數）只是連結。

---

## 10. 跟其他專案組合的建議

這個 repo 的強項是「**角色的職務說明**」，弱項是「**共用規則、流程、排程、技能格式**」。所以建議搭配（同資料夾其他資料包）：

- **共用規則與流程骨架**：`github/spec-kit`（constitution＋規格流程）或 `bmad-code-org/BMAD-METHOD`（角色＋交接流程）負責「規則怎麼分層、流程怎麼走」；本 repo 只提供角色檔內容。
- **Skill 格式**：`addyosmani/agent-skills`、`mattpocock/skills` 這類 SKILL.md 專案負責「技能」；本 repo 的角色可以呼叫那些技能。
- **全套 Claude Code 設定**：`affaan-m/ECC` 若有 hooks／指令，可補本 repo 沒有的「自動觸發」。
- **其他角色庫**：`msitarzewski/agency-agents` 偏行銷、業務角色，可和本 repo 的工程角色互補。

**建議的最小組合（給你的倉儲系統＋廣告）：**
1. 一份 `AGENTS.md`（Codex 與 Claude 共讀的主規則）＋ `CLAUDE.md` 只寫一行「請先讀 AGENTS.md」＋ Claude 專屬補充。
2. `.claude/agents/` 放 5～6 個從本 repo 改寫的中文角色（見第 11 節最後的清單），`.codex/agents/` 放對應的 `.toml`。
3. `docs/ai/` 放 context-manager 式的共用狀態檔與 memory-curator 式的記憶檔。
4. 每天用 Claude Code（或 GitHub Actions、你電腦的排程）跑一次「巡讀」角色，產生 `docs/ai/patrol/YYYY-MM-DD.md`。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫 — **部分有**
- **有**：本 repo 自己有一份 [CLAUDE.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/CLAUDE.md)（71 行），示範「給 AI 的 repo 規則」該寫什麼：專案概述、目錄結構、檔案格式、權限分配、改一個東西要同步改哪些檔。可以照這個骨架寫你的。
- **分層**：只有角色層級的「專案 `.claude/agents/` 優先於全域 `~/.claude/agents/`」（[CLAUDE.md#L64-L71](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/CLAUDE.md#L64-L71)）。規則檔本身的全域／專案／子資料夾分層：**沒有**。
- **AGENTS.md／.ruler／constitution**：**沒有**（檔案清單中不存在）。
- **讓 GPT 與 Claude 讀同一份規則**：**沒有**。兩個姊妹 repo 各寫各的，連同名角色內容都不同。你需要自己決定「主版本」（建議：AGENTS.md 為唯一事實來源，CLAUDE.md 只引用它）。

### 11.2 角色設計 — **有（本 repo 的強項）**
- 166 個角色，每個都有 `name`、`description`、`tools`，157 個有 `model`。
- 職責：寫在本文；新式角色有固定段落「Scope and honesty rules／Required inputs／What X actually does／Workflow／Report back／Integration with other agents」（例：[context-manager.md#L10-L94](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/context-manager.md#L10-L94)）。**這個段落結構非常適合當你的「角色模板」**。
- 可用工具：`tools` 欄位；四種權限等級（[README.md#L440-L448](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/README.md#L440-L448)）。
- 交接（handoff）：新式角色明講「透過共用檔案＋呼叫者交接」，並要求計畫中寫明交接檔名（[agent-organizer.md#L50-L67](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/agent-organizer.md#L50-L67)）；`multi-agent-coordinator` 要求「每個共用檔盡量只有一個寫入者」「中途失敗時先寫暫存檔再替換，或只追加不覆寫」（[multi-agent-coordinator.md#L29-L50](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/multi-agent-coordinator.md#L29-L50)）。
- 誰向誰負責：每個角色最後的「Integration with other agents」列出上下游（例：surgeon-reviewer 把 WILL BREAK 交給 debugger、資安問題升級給 security-auditor，[surgeon-reviewer.md#L61-L66](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/04-quality-security/surgeon-reviewer.md#L61-L66)）。但沒有正式的「組織圖」或最終負責人。
- 「Skills」欄位：**沒有**（角色檔沒有 skills 欄位）。

### 11.3 防漏 — **部分有**
- **任務追蹤**：`backlog-grooming` 給待辦健康標準（每項要有負責人、優先序、驗收條件、完成定義；90 天沒動要決定）（[backlog-grooming.md#L9-L16](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/08-business-product/backlog-grooming.md#L9-L16)）；`context-manager` 建議 `task-history.md`（最新在上）。
- **完成前驗證**：`ponder-auditor`「覆蓋率 < 1.00 就是 blocked、不准停」（[ponder-auditor.md#L11](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/04-quality-security/ponder-auditor.md#L11)）；`surgeon-reviewer`「每個疑點先試著推翻，推不翻才報」（[surgeon-reviewer.md#L13](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/04-quality-security/surgeon-reviewer.md#L13)）。
- **交接紀錄**：`docs-drift-editor` 規定輸出 JSON `{edited:[...], skipped:[...]}`（[docs-drift-editor.md#L37-L46](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/06-developer-experience/docs-drift-editor.md#L37-L46)），讓下一棒能讀；`memory-curator` 的回報格式「Recalled／Saved／Prune candidates」（[memory-curator.md#L53-L61](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L53-L61)）。
- **repo 本身的防漏**：CLAUDE.md／CONTRIBUTING 列出「新增角色要同時改 3 個檔」，但沒有自動檢查，所以才會出現第 9 節那些數量對不上的情況。

### 11.4 防重複 — **有守則、沒有自動偵測**
- `memory-curator`：「一條記憶一個事實」「定期列出重複／被取代的條目，一次請使用者批准」（[memory-curator.md#L31-L39](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L31-L39)）。
- `context-manager`：「用 Edit 更新既有條目，不要再寫一條重複的」（[context-manager.md#L75-L79](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/context-manager.md#L75-L79)）。
- `knowledge-synthesizer`：「把幾乎相同的訊號合併成一個 pattern」（[knowledge-synthesizer.md#L48-L56](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/knowledge-synthesizer.md#L48-L56)）。
- `backlog-grooming`：「合併重複的 story」。`surgeon-reviewer`：WILL ROT 包含「重複邏輯會各自走樣」。
- **重複角色偵測**：**沒有**。repo 自己就有疑似重疊角色：`machine-learning-engineer` vs `ml-engineer`、`incident-responder` vs `devops-incident-responder`、`mobile-developer`（01 類）vs `mobile-app-developer`（07 類）、`technical-writer` vs `documentation-engineer`、`code-reviewer` vs `surgeon-reviewer`（後者明講兩者分工）。我只依檔名判斷，內容重疊程度**未確認**。這提醒你：角色挑 5～8 個就好，不要整包裝。

### 11.5 防新舊版本衝突 — **有守則＋一個 CI**
- **版本標記**：外掛層級有 semver（plugin.json / marketplace.json），CI 強制升版與同步（[enforce-plugin-version-bump.yml#L36-L77](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/.github/workflows/enforce-plugin-version-bump.yml#L36-L77)）。角色檔本身**沒有**版本欄位。
- **單一事實來源**：`docs-drift-editor`「diff 是『改了什麼』的唯一事實來源，原頁面是『怎麼寫』的事實來源」（[docs-drift-editor.md#L59-L64](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/06-developer-experience/docs-drift-editor.md#L59-L64)）；`context-manager`「不確定哪個檔是現行版本就直說」（[#L14](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/context-manager.md#L14)）。
- **變更提案／封存**：`memory-curator`「不改寫舊事實，新增一條並把舊的標為 `closed <日期>, superseded by <slug>`」（[memory-curator.md#L35](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L35)、[#L41-L51](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L41-L51)）；「兩條記憶矛盾，兩條都附日期列出來」（[#L17](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L17)）；範例「記憶說用 Redux，但程式碼到處都是 Zustand → 指出矛盾、問哪個是現行、把輸的那條關閉」（[#L66](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L66)）。**這是本 repo 對你最有價值的一段。**
- **過期（drift）偵測**：`docs-drift-editor` 只負責修，明講「不自己偵測 drift」（[#L35](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/06-developer-experience/docs-drift-editor.md#L35)）；偵測者要你自己做。`subagent-catalog` 有「快取超過 12 小時就重抓、抓不到就用舊的並警告」的時間型過期機制。
- **改標題時保留舊錨點**（`<!-- anchor: old-anchor -->`），避免舊連結斷掉（[docs-drift-editor.md#L28](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/06-developer-experience/docs-drift-editor.md#L28)）。

### 11.6 定期巡檢 — **沒有排程；有「修剪要有節奏」的原則**
- heartbeat／cron／hook：**沒有**。repo 內沒有任何 hooks 設定、沒有排程。唯一自動化是 PR 時的 GitHub Actions。
- `memory-curator`：「Prune on a rhythm, not on impulse」——定期列出候選、一次批准（[memory-curator.md#L39](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L39)）；`backlog-grooming` 建議每個 sprint 一次。
- 報告格式：可組合現有角色的輸出。以下是我依 surgeon-reviewer（分級＋結論）、ponder-auditor（覆蓋率）、memory-curator（回報格式）、docs-drift-editor（edited/skipped）拼出來的**每日巡讀報告建議範例**（不是 repo 原文）：

```markdown
# 巡讀報告 2026-11-05（patrol-auditor，Claude）
覆蓋：已檢查 42/42 個檔案（coverage 1.00）；清單見 docs/ai/patrol/inventory.md
結論：SHIP WITH FIXES（2 個 WILL BREAK 需先修）

## WILL BREAK
- js/inventory.js:212 — 扣庫存未檢查負數 — 會出現 -3 件庫存 — 建議加 guard（證據：Codex 昨日 commit a1b2c3）
## 新舊版本衝突
- docs/ai/decisions.md#2026-10-02「單價含稅」vs AGENTS.md L40「單價未稅」→ 兩條都列出，請老闆決定；決定後把輸的那條標 closed
## 重複
- README.md 與 docs/setup.md 各有一份 Firebase 部署步驟（內容不同）→ 建議保留 docs/setup.md，README 改連結
## 漏掉
- TODO.md「條碼列印」標為完成，但 git log 無對應 commit → 退回 In Progress
## 本次未改任何檔案；修正交由 docs-drift-editor / 實作者
```

### 11.7 Skill 寫法 — **沒有 SKILL.md；有可借鏡的 description 寫法**
- SKILL.md 格式、技能資料夾結構：**沒有**。
- **description 怎麼寫才會被正確觸發**（我統計 166 個 description）：102 個用「Use this agent when ...」開頭、59 個用「Use when／Use to ...」開頭、9 個額外列出「Triggers on: '...', '...'」關鍵句（例：[backlog-grooming.md#L3](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/08-business-product/backlog-grooming.md#L3)）。CONTRIBUTING 也要求「description 要包含觸發語句」（[CONTRIBUTING.md#L67-L70](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/CONTRIBUTING.md#L67-L70)）。建議你寫中文角色時用：「在【情境】時使用。觸發語：『巡讀』『每日檢查』『找重複』『新舊版本』」。
- 腳本放哪：tools 範例是「共用 `config.sh` ＋ 每個指令一個 .md，用 `source ~/.claude/commands/subagent-catalog/config.sh` 呼叫」（[search.md](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/tools/subagent-catalog/search.md)）。

### 11.8 支援哪些工具與安裝方式
- **Claude Code：有**（外掛市集、手動複製、install-agents.sh、agent-installer 四種，見第 3 節）。
- **Codex：在姊妹 repo**（`.toml`，`~/.codex/agents/` 或 `.codex/agents/`，[README](https://github.com/VoltAgent/awesome-codex-subagents/blob/9abe3279a0aa4ee518381af800ca1062398f5433/README.md)）。
- **Cursor／Gemini／其他：沒有**（README 只在贊助廣告文字裡提到 Codex、Gemini）。

### 11.9 可以直接借用到你「基礎架構」的檔案或段落
| 你的檔案 | 從哪裡借 | 改什麼 |
|---|---|---|
| `AGENTS.md`（主規則）骨架 | `CLAUDE.md`（本 repo） | 改成你的倉儲系統目錄、Firebase 部署、「改 X 要同步改 Y」清單 |
| `docs/ai/README.md`＋`state.md`／`decisions.md`／`task-history.md` | `categories/09-meta-orchestration/context-manager.md` L35-L61 | 加「每個檔案的唯一寫入者」欄 |
| `docs/ai/memory/MEMORY.md`＋`entries/` | `categories/09-meta-orchestration/memory-curator.md` L41-L51 | 狀態欄用 `active` / `closed 日期, superseded by …` |
| `.claude/agents/patrol-auditor.md`（巡讀員，只讀） | `ponder-auditor.md`（覆蓋率）＋`surgeon-reviewer.md`（分級＋結論） | tools 只給 `Read, Grep, Glob, Bash`；輸出 11.6 的報告格式 |
| `.claude/agents/docs-sync.md`（修文件，限定範圍） | `categories/06-developer-experience/docs-drift-editor.md` | 40% 上限、只改清單內檔案、輸出 edited/skipped JSON |
| `.claude/agents/memory-keeper.md` | `memory-curator.md` 全文 | 翻成中文 |
| `.claude/agents/reviewer.md`（審 Codex 的成果） | `surgeon-reviewer.md` | 確認 tools 無 Write/Edit |
| `.claude/agents/weekly-lessons.md` | `knowledge-synthesizer.md`／`error-coordinator.md` 輸出 schema | 讀 `docs/ai/patrol/*.md` 找重複出現的問題 |
| `TODO.md` 分類 | `backlog-grooming.md` L67-L73 | Now/Next/Later/Icebox/Won't Do |
| `.codex/agents/*.toml` | `awesome-codex-subagents` 的 `context-manager.toml` 格式 | 內容從你的中文 .md 轉過去，以 .md 為主版本 |
| CI：規則檔改了要升版本 | `.github/workflows/enforce-plugin-version-bump.yml` | 檢查 AGENTS.md 改動時 `RULES_VERSION` 有沒有變 |

**一句話總結建議**：把本 repo 當「角色範本庫」，挑 6 個新式角色翻成中文，自己補上 AGENTS.md 主規則和每日巡讀排程；不要整包安裝 166 個。

---

## 關鍵字
Claude Code、subagent、子代理、角色檔、agent 定義、YAML frontmatter、description 觸發、tools 權限、model 路由、sonnet、haiku、inherit、.claude/agents、外掛市集、plugin marketplace、Codex、.codex/agents、toml、sandbox_mode、多代理協作、multi-agent、context-manager、memory-curator、記憶管理、superseded、新舊版本衝突、docs drift、文件走樣、docs-drift-editor、巡讀、巡檢、patrol、稽核、ponder-auditor、surgeon-reviewer、程式碼審查、code review、knowledge-synthesizer、error-coordinator、backlog grooming、待辦清理、防重複、單一事實來源、交接、handoff、版本號、CI、GitHub Actions、MIT 授權、VoltAgent、awesome list
