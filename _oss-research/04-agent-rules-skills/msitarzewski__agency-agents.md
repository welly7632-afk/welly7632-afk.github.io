# msitarzewski/agency-agents — 283 個「AI 員工」角色檔＋多代理交接範本，一份 Markdown 同時裝進 Claude Code、Codex 等 17 種工具
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：b37b5bb
> GitHub：https://github.com/msitarzewski/agency-agents｜⭐ 166482｜授權：MIT｜主要語言：Shell｜最近更新：2026-10-25

> 本文所有 permalink 都指向 commit `b37b5bb33b78f2c1d6567d98e25ca818e3259219`，以下簡寫為 `B/`＝`https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/`。實際連結皆為完整網址。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這是一間「用 Markdown 寫成的 AI 代理公司」——每個 `.md` 檔就是一個 AI 角色（身分、職責、紅線規則、交付物、工作流程、成功指標），再用 Shell 腳本把同一份角色檔轉成 Claude Code、Codex、Cursor、Gemini 等工具各自的格式。

**它「是」什麼、「不是」什麼（先講清楚，避免期待落差）**：
- 它**是**一個「角色庫＋多代理交接範本＋品質檢查腳本」。
- 它**不是**一套「共用規則（AGENTS.md / CLAUDE.md）分層管理」的框架——repo 本身根目錄沒有 `AGENTS.md`、`CLAUDE.md`（我用 `git ls-tree` 全檔清單確認過，384 個檔案中沒有這兩個檔）。
- 它也**沒有**排程巡檢（cron / hook / heartbeat）的執行機制；「每日巡讀」只存在於角色描述與營運手冊的文字裡。

**對這位使用者最有用的 6 件事**：
1. **直接拿到「巡讀員」角色**：`specialized/specialized-codebase-archaeologist.md`（程式碼考古學家）就是專門為「多個 AI 工具（Claude、Cursor、Copilot…）在不同 session 改同一個專案」而寫的漂移（drift）稽核員：找重複實作、新舊寫法並存、文件與程式碼不一致、半套修復。這幾乎就是你說的「每天巡讀整個專案，看哪個 AI 漏東西、重複、新舊版本衝突」。
2. **交接（handoff）範本**：`strategy/coordination/handoff-templates.md` 有 7 種標準交接單（一般交接、QA 通過、QA 退件、升級、階段閘門、衝刺交接、事故交接），可以直接當成你 GPT 與 Claude 之間「交接紀錄」的格式。
3. **「做事 AI」與「驗收 AI」分開**：Agents Orchestrator（總指揮）＋ Evidence Collector（逐項驗收）＋ Reality Checker（預設判「NEEDS WORK」的最終把關）＋ Senior Project Manager（把需求拆成 checklist）。這套「Dev↔QA 迴圈，最多重試 3 次再升級」可以直接搬到你的倉儲系統開發流程。
4. **重複內容偵測腳本**：`scripts/check-agent-originality.sh` 用「8 個字的 shingle＋Jaccard 相似度」比對所有角色檔，抓「換個名詞就當新檔」的重複。這段 Python 可以改成掃你的規則檔、文件、筆記。
5. **單一事實來源（single source of truth）＋CI 一致性檢查的寫法**：`divisions.json`、`tools.json`、`strategy/runbooks.json` 各自是唯一權威清單，再由 `check-divisions.sh`、`check-tools.sh`、`check-runbooks.sh` 在 CI 比對「清單 vs 實際檔案 vs 腳本內陣列」，對不上就讓 build 失敗——這正是防「新舊版本衝突」的工程做法。
6. **跟你業務有關的現成角色**：廣告投放 7 個（`paid-media/`：PPC、搜尋字詞、帳戶稽核、追蹤碼 GTM/GA4/CAPI、廣告素材、程式化購買、社群廣告）、Pricing Analyst（定價／成本結構／毛利）、Supply Chain Strategist、Cross-Border E-Commerce、Short-Video Editing Coach、Sales Data Extraction Agent（監看 Excel 抽業績）、AI-Generated Code Security Auditor（專抓 AI 寫的 App 裡寫死的金鑰、Firebase/Supabase 類權限規則破洞）。

**跟你的 4 個興趣的對應**：
- (1) 網頁版 Excel 試算表：**幾乎無關**。只有 `specialized/sales-data-extraction-agent.md`（67 行）是「監看 Excel 檔抽 MTD/YTD 指標」的角色描述，沒有任何試算表程式碼。
- (2) 查價／比價／成本／ERP：有 `specialized-pricing-analyst.md`（243 行，成本結構、競品、價值定價、折扣治理範本）、`supply-chain-strategist.md`、`finance/` 5 個角色。都是**提示詞／方法論**，不是程式。
- (3) AI 影片與腳本：只有行銷面的角色（Short-Video Editing Coach、Douyin/TikTok Strategist、Ad Creative Strategist、Visual Storyteller），**沒有**影片生成程式。
- (4) 多 AI 協作：**高度相關**，本資料包第 11 節詳述。

---

## 2. 授權白話

- **授權**：MIT（`LICENSE` 第 1 行 `MIT License`，`Copyright (c) 2025 AgentLand Contributors`）。README 的 License 段落寫「Use freely, commercially or personally. Attribution appreciated but not required.」
- **個人使用**：完全可以，隨便改、隨便裝。
- **公司商用**：可以，包含改寫後放進你公司內部的 Claude Code／Codex 設定、甚至做成產品。MIT 的唯一法律義務是：**若你「散布」這些檔案（或其實質部分），要附上原本的版權聲明與 MIT 授權文字**。只在自己電腦或公司內部使用、不對外散布，實務上沒有負擔。
- **閉源／付費版**：repo 本身沒有付費功能。README 推薦的桌面 App「Agency Agents」放在另一個 repo（`msitarzewski/agency-agents-app`），我**沒有**打開那個 repo，**其授權與是否收費：未確認**。不用 App 也能用 `scripts/install.sh` 安裝，功能等價（README 原文：「The script-based options below install the same agents」）。
- **注意**：社群翻譯版（如 `jnMetaCode/agency-agents-zh`）是獨立 repo，授權各自不同，未確認。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 前端 | 無（純 Markdown 內容） |
| 後端 | 無伺服器。工具腳本是 Bash（`scripts/*.sh`，相容 macOS 內建 bash 3.2），少量 Python 3（重複偵測、JSON 檢查、Hermes 外掛建置） |
| 資料庫 | 無。三個 JSON 檔當「目錄資料」：`divisions.json`、`tools.json`、`strategy/runbooks.json` |
| 部署方式 | 把 `.md` 複製到 `~/.claude/agents/`（Claude Code 原生，不需轉換）；其他工具先跑 `scripts/convert.sh` 產生格式，再跑 `scripts/install.sh` 複製到各工具目錄 |
| 硬體／GPU | 不需要 |
| API Key | **本身不需要任何 API Key**；角色是給你已經在用的 Claude Code／Codex 等工具讀的提示詞。費用＝你原本的 Claude／ChatGPT 訂閱或 API 用量。只有 4 個角色在 frontmatter 宣告了外部服務（`services:` 欄位，我逐檔計數 4 個） |
| 選配 | MCP 記憶伺服器（`integrations/mcp-memory/`，需自備一個提供 `remember/recall/rollback/search` 工具的 MCP server，repo 不提供實作） |

**Windows 使用者注意**：腳本是 Bash，Windows 要用 WSL 或 Git Bash；或直接手動複製 `.md` 到 `%USERPROFILE%\.claude\agents\`。另有 PowerShell 腳本 `scripts/i18n/localize-agents-zh.ps1` 把名稱／描述轉成簡體中文（只給 Copilot 用）。

---

## 4. 程式架構地圖

（檔案數用 `git ls-tree -r --name-only HEAD` 計算，共 384 個檔案；「角色數」是我寫迴圈數「第一行是 `---` 的 `.md` 檔」，只算 `divisions.json` 列出的 18 個部門資料夾。）

```
agency-agents/
├── README.md                 # 1185 行：角色總表、各工具安裝說明
├── CONTRIBUTING.md           # 480 行：角色檔範本（L87-L155）、PR 規則、防重複規定
├── divisions.json            # 【單一事實來源】18 個部門：label / icon / color
├── tools.json                # 【單一事實來源】17 個支援工具：安裝路徑、格式、偵測方式
├── engineering/   (66 個角色) # 前後端、DB、Prompt Engineer、Multi-Agent Systems Architect、Minimal Change Engineer…
├── specialized/   (59)        # Agents Orchestrator、Codebase Archaeologist、Chief of Staff、Pricing Analyst、MCP Builder…
├── marketing/     (37)        # 社群、SEO、TikTok/抖音/小紅書、跨境電商、短影音剪輯教練…
├── game-development/ (21)    # Unity/Unreal/Godot/Roblox…
├── gis/ (13)  security/ (12)  design/ (10)  sales/ (9)  testing/ (9)
├── paid-media/ (7)            # 廣告投放：PPC、搜尋字詞、稽核、追蹤、素材、程式化、社群廣告
├── project-management/ (7)    # Senior PM、Project Shepherd、Studio Producer、Meeting Notes…
├── product/ (6)  support/ (6)  academic/ (6)  spatial-computing/ (6)
├── finance/ (5)  healthcare/ (3)  research/ (1)
├── strategy/                  # 不是角色，是「協作手冊」
│   ├── nexus-strategy.md      # 1110 行：七階段管線、指揮結構、品質閘門、交接協定
│   ├── QUICKSTART.md          # 可直接貼上的啟動 prompt（Full / Sprint / Micro 三種模式）
│   ├── coordination/
│   │   ├── handoff-templates.md       # 7 種交接單範本 ★
│   │   └── agent-activation-prompts.md# 各角色的啟動 prompt
│   ├── playbooks/phase-0 … phase-6.md # 每階段的作業手冊（含 daily/weekly/monthly 節奏表）
│   ├── runbooks/scenario-*.md         # 4 個情境：MVP、企業功能、行銷活動、事故處理
│   └── runbooks.json                  # 情境→角色名單（機器可讀）
├── examples/                  # 多代理合作範例（含 workflow-with-memory.md）
├── integrations/              # 每個工具一個 README；轉換產物被 .gitignore 排除
│   ├── claude-code/README.md  codex/README.md  cursor/README.md …（共 17 個工具）
│   └── mcp-memory/            # 用 MCP 記憶伺服器讓角色跨 session 記事的寫法
├── scripts/
│   ├── convert.sh   (954 行)  # 一份角色檔 → 17 種工具格式 ★
│   ├── install.sh   (1801 行) # 互動式安裝器（偵測已安裝工具、選部門／角色）
│   ├── lib.sh                 # 共用：讀 frontmatter、slug 化、程式碼區塊判斷
│   ├── lint-agents.sh         # 角色檔格式檢查
│   ├── check-agent-originality.sh # 重複內容偵測 ★
│   ├── check-divisions.sh / check-tools.sh / check-runbooks.sh # 清單一致性檢查 ★
│   ├── test-convert-outputs.sh + convert-outputs.sha256 # 產物雜湊清單，偵測漂移 ★
│   └── test-*.sh（17 支安裝／轉換回歸測試）
└── .github/workflows/         # 6 支 CI：lint、originality、divisions、tools、runbooks、installer
```

所有 18 個部門角色檔合計 **77,353 行**（`find <18 個部門> -name '*.md' | xargs cat | wc -l`）。README 自稱「230+ agents」，我實際數到 **283 個**角色檔——文件數字落後於實際內容，本身就是一個「文件過期」的小例子。

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 角色檔格式（資料模型） | [CONTRIBUTING.md#L87-L155](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/CONTRIBUTING.md#L87-L155) | YAML frontmatter（必填 `name`、`description`、`color`；選填 `emoji`、`vibe`、`services`、`tools`）＋ 固定章節：Identity & Memory／Core Mission／Critical Rules／Technical Deliverables／Workflow Process／Communication Style／Learning & Memory／Success Metrics／Advanced Capabilities |
| 「人格」與「作業」分層 | [CONTRIBUTING.md#L164-L185](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/CONTRIBUTING.md#L164-L185)、[scripts/convert.sh#L360-L486](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L360-L486) | 標題含 identity / communication / style / critical rules 的章節歸「SOUL」（是誰），其餘歸「AGENTS」（做什麼）。轉 OpenClaw 時拆成 `SOUL.md`＋`AGENTS.md`＋`IDENTITY.md` |
| 讀 frontmatter | [scripts/lib.sh#L20-L60](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/lib.sh#L20-L60) | 純 awk 解析 `get_field`、`get_body`、`slugify`、`agent_slug`（slug 由 `name` 產生，convert 與 install 共用同一函式，保證一致） |
| 轉成 Codex 格式 | [scripts/convert.sh#L216-L236](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L216-L236) | 每個角色一個 TOML：`name`、`description`、`developer_instructions`（整份 Markdown 內文）。放到 `~/.codex/agents/` |
| 轉成 Agent Skills（SKILL.md） | [scripts/convert.sh#L133-L157](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L133-L157) | `agency-<slug>/SKILL.md`，frontmatter 只留 `name`＋`description`（Anthropic Agent Skills 標準欄位），內文＝角色。Antigravity、Osaurus、DeepSeek Harness 共用 |
| 轉成 Cursor 規則 | [scripts/convert.sh#L337-L358](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L337-L358) | `.cursor/rules/<slug>.mdc`，`alwaysApply: false`（不會常駐，要點名才用） |
| Aider 只放「目錄」不放全文 | [scripts/convert.sh#L695-L718](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L695-L718) | 註解寫明：全部角色內文約 380 萬字元，常駐會塞爆 context，所以只產出「名稱＋描述＋檔案路徑」索引（約 9 萬字元），需要時再讀全文。**這個「索引常駐、全文按需讀取」的設計非常值得學** |
| 防殘檔／防撞名 | [scripts/convert.sh#L742-L785](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L742-L785) | 重新產生前先清掉舊產物（避免改名後留下舊檔＝新舊並存）；兩個角色 slug 相同就拒絕轉換 |
| 安裝到 Claude Code | [scripts/install.sh#L862-L874](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/install.sh#L862-L874)、[#L385-L418](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/install.sh#L385-L418) | 直接複製原始 `.md` 到 `~/.claude/agents/`；目的地優先序：`--path` ＞ 環境變數（`CLAUDE_CONFIG_DIR` 等）＞ 預設 |
| 安裝到 Codex | [scripts/install.sh#L1181-L1194](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/install.sh#L1181-L1194) | 從 `integrations/codex/agents/*.toml` 複製到 `~/.codex/agents/` |
| 多代理管線（文件） | [strategy/nexus-strategy.md#L29-L127](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/nexus-strategy.md#L29-L127) | 七階段（探索→策略→骨架→開發→強化→上線→營運），每階段之間有品質閘門；三種規模 Full / Sprint / Micro |
| Dev↔QA 迴圈 | [strategy/nexus-strategy.md#L291-L332](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/nexus-strategy.md#L291-L332)、[specialized/agents-orchestrator.md#L110-L168](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/agents-orchestrator.md#L110-L168) | 一次只做一個任務；QA 通過才進下一個；失敗帶著具體回饋退回，最多 3 次，之後寫升級報告 |
| 重複偵測 | [scripts/check-agent-originality.sh#L57-L82](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/check-agent-originality.sh#L57-L82) | 先把國名／平台名換成空白（避免「把抖音換成 TikTok」就騙過），再比 8 字 shingle 的 Jaccard；≥20% 警告、≥40% 失敗 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 漂移稽核員（巡讀員）角色 | [specialized/specialized-codebase-archaeologist.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md) | 無 | 低 | 複製到 `.claude/agents/`；或把內文貼進 Codex 的 `~/.codex/agents/*.toml`。改寫成中文版，把範例（orderService.js）換成你的倉儲檔名（庫存數量、單價、成本） |
| 7 種交接單範本 | [strategy/coordination/handoff-templates.md#L7-L203](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/coordination/handoff-templates.md#L7-L203) | 無 | 低 | 放進你的專案 `docs/handoff/TEMPLATE.md`，在 `AGENTS.md`／`CLAUDE.md` 規定「交棒前必須填這份」 |
| 重複內容偵測 Python | [scripts/check-agent-originality.sh#L43-L179](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/check-agent-originality.sh#L43-L179) | python3 標準庫 | 低～中 | 把 heredoc 中的 Python 抽成獨立檔；`AGENT_DIRS` 改成你的 `docs/`、`rules/`；中文需改分詞（原版 `[^a-z0-9 ]` 會把中文全部濾掉，必須改成以字元切 n-gram） |
| 清單一致性檢查（單一事實來源） | [scripts/check-divisions.sh#L1-L32](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/check-divisions.sh#L1-L32)、[scripts/check-runbooks.sh#L1-L22](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/check-runbooks.sh#L1-L22) | bash、python3 | 中 | 概念直接套：例如「Firestore collection 清單」放一份 `collections.json`，CI 比對程式碼裡實際用到的 collection 名稱，對不上就報錯 |
| 產物雜湊清單（漂移偵測） | [scripts/test-convert-outputs.sh#L1-L45](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/test-convert-outputs.sh#L1-L45)、`scripts/convert-outputs.sha256` | python3 | 中 | 對「規則檔、共用設定」各算一個 SHA-256 存成清單；每日巡讀時重算，有變就列出「誰變了、是否有對應的變更紀錄」 |
| 一份規則→多工具格式 | [scripts/convert.sh#L133-L358](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L133-L358)、[scripts/lib.sh#L20-L60](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/lib.sh#L20-L60) | bash、awk | 中 | 你的角色只寫一次（`roles/*.md`），用類似腳本產生 `.claude/agents/*.md`（Claude）與 `.codex/agents/*.toml`（Codex），避免兩邊各改各的 |
| 總指揮＋驗收角色組 | [specialized/agents-orchestrator.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/agents-orchestrator.md)、[testing/testing-reality-checker.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/testing/testing-reality-checker.md)、[testing/testing-evidence-collector.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/testing/testing-evidence-collector.md)、[project-management/project-manager-senior.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/project-management/project-manager-senior.md) | 無（但內文寫死 Laravel、`qa-playwright-capture.sh`） | 中 | 要改寫：把 Laravel/FluxUI 換成「純 JS＋Firebase」；那支截圖腳本 repo 裡**不存在**，要自己寫或換成 Playwright 指令 |
| 多代理架構檢查表 | [engineering/engineering-multi-agent-systems-architect.md#L392-L423](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/engineering/engineering-multi-agent-systems-architect.md#L392-L423)、[#L561-L600](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/engineering/engineering-multi-agent-systems-architect.md#L561-L600) | 無 | 低 | 「角色定義範本」（接收什麼／負責什麼／**不負責什麼**／產出什麼／可用工具）直接當你每個 AI 角色的規格書格式 |
| 文件連動更新（Chief of Staff） | [specialized/specialized-chief-of-staff.md#L68-L78](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-chief-of-staff.md#L68-L78)、[#L154-L198](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-chief-of-staff.md#L154-L198) | 無 | 低 | 「一個決策改了，就找出所有引用它的文件一起改」＋每日站會、每週結算中的「文件同步檢查」 |
| 每日紀錄格式（ZK Steward） | [specialized/zk-steward.md#L59-L86](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/zk-steward.md#L59-L86) | 無 | 低 | 每個 AI 收工前寫一筆「意圖／變更／未結事項（Open loops）」，巡讀員隔天從未結事項開始查 |
| 廣告帳戶稽核角色 | [paid-media/paid-media-auditor.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/paid-media/paid-media-auditor.md)、[paid-media/paid-media-tracking-specialist.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/paid-media/paid-media-tracking-specialist.md) | 無（有 Google Ads MCP 時可自動抓資料） | 低 | 你投廣告時的「季度健檢」角色。注意：檔案只有 71 行，宣稱「200+ 檢查點」但清單本身**不在檔案裡** |
| 定價分析角色 | [specialized/specialized-pricing-analyst.md#L38-L186](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-pricing-analyst.md#L38-L186) | 無 | 低 | 成本結構、競品、價值定價、折扣治理範本；搭配你的庫存成本資料用 |
| AI 寫的程式碼資安稽核 | [security/security-ai-generated-code-auditor.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/security/security-ai-generated-code-auditor.md) | 無 | 低 | 定期掃你的 Firebase 專案：前端寫死的金鑰、規則（Security Rules）漏洞 |

---

## 7. AI／Claude 整合

- **用哪些模型**：不綁模型。角色檔沒有 `model:` 欄位（我逐檔掃 283 個角色的 frontmatter，`model:` 出現 0 次），由你使用的工具決定模型。
- **prompt 放在哪**：每個角色 `.md` 的內文就是 system prompt；「啟動 prompt」在 [strategy/coordination/agent-activation-prompts.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/coordination/agent-activation-prompts.md) 與 [strategy/QUICKSTART.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/QUICKSTART.md)。
- **Claude Code**：原生支援（[integrations/claude-code/README.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/integrations/claude-code/README.md) 寫「The Agency was built for Claude Code. No conversion needed」）。角色檔格式就是 Claude Code subagent 格式（frontmatter＋Markdown）。有 17 個角色帶 `tools:` 欄位限制可用工具（例如 [project-management-meeting-notes-specialist.md#L4](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/project-management/project-management-meeting-notes-specialist.md#L4) 只給 `Read, Write, Edit`；廣告類多給 `WebFetch, WebSearch, Read, Write, Edit, Bash`）。其餘 266 個沒限制，會繼承主對話所有工具。
- **Codex（GPT）**：轉成 TOML 自訂代理（見第 5 節），[integrations/codex/README.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/integrations/codex/README.md)。轉換時 `tools:` 限制**不會**帶過去（README 寫只保留 `name`、`description`、`developer_instructions`）。
- **Skills**：轉換成 Anthropic Agent Skills 標準的 `SKILL.md` 只發生在 Antigravity / Osaurus / DeepSeek Harness 三個目標；**Claude Code 版是 subagent，不是 Skill**。若你想在 Claude Code 當 Skill 用，可以照 `convert_antigravity()` 的格式自己產生 `.claude/skills/agency-<slug>/SKILL.md`（推論，未實測）。
- **MCP**：只有「記憶」的接法說明（[integrations/mcp-memory/README.md#L34-L57](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/integrations/mcp-memory/README.md#L34-L57)）：在角色檔加一段「Memory Integration」，叫它開工時 `recall`、做決定時 `remember`（以角色名＋專案名當標籤）、交接時 `remember` 給下一位、失敗時 `rollback`。repo 不附 MCP 伺服器實作；`setup.sh` 只是印說明。另有 MCP Builder 角色教你寫 MCP server。
- **能不能換成 Claude**：本來就是為 Claude 寫的，`claude_support` = 原生。

---

## 8. 擴充方式與 API

- **新增角色**：在部門資料夾放一個符合範本的 `.md`；跑 `lint-agents.sh`（格式）與 `check-agent-originality.sh`（重複），CI 也會自動跑（[.github/workflows/lint-agents.yml#L67-L73](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/.github/workflows/lint-agents.yml#L67-L73)）。
- **新增部門**：建資料夾＋在 `divisions.json` 加一筆＋把名字加進 `convert.sh` 與 `lint-agents.sh` 的 `AGENT_DIRS`，`check-divisions.sh` 會告訴你哪裡還沒改（[CONTRIBUTING.md#L34-L49](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/CONTRIBUTING.md#L34-L49)）。
- **新增工具（例如你自訂的 AI 工具）**：照 [CONTRIBUTING.md#L236-L268](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/CONTRIBUTING.md#L236-L268) 的 8 步清單：`tools.json` 加一筆 → `convert_<tool>()` → `install_<tool>()` → `.gitignore` → README → 跑三支檢查。
- **只裝部分角色**：`./scripts/install.sh --tool claude-code --division engineering,security`、`--agent frontend-developer,ui-designer`、`--agents-file team.txt`、`--dry-run`（[README.md#L95-L112](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/README.md#L95-L112)）。
- **機器可讀 API**：沒有 HTTP API；三個 JSON（`divisions.json`、`tools.json`、`strategy/runbooks.json`）就是給 App 與其他工具讀的「資料介面」。

---

## 9. 程式品質與風險

**維護狀況**：非常活躍。HEAD commit 是 2026-10-24 合併的 PR #1177（新增 Electrical Engineer）。CI 有 6 支 workflow，安裝器在 Ubuntu 與 macOS 雙平台測（[.github/workflows/test-install.yml](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/.github/workflows/test-install.yml)）。`scripts/` 下有 22 支 `test-*` 回歸測試（`ls scripts/test-*` 計數：21 支 `.sh`＋1 支 `.py`）。因為是淺層 clone，**總 commit 數與貢獻者數：未確認**。

**測試範圍**：測的是「轉換與安裝不出錯」（YAML/TOML 能解析、描述來回一致、每個工具剛好一份輸出、不覆蓋使用者的 symlink），**不測角色內容的品質**——角色寫得好不好沒有任何自動評估。

**資安／隱私**：
- 角色是純文字 prompt，無遙測、無網路呼叫（我沒有在角色檔或腳本中看到上傳行為；`install.sh` 只複製檔案）。
- `SECURITY.md` 明講「Contributors should review scripts for unintended behavior before running」——請**先讀再跑** `install.sh`，它會寫入你的 `~/.claude/agents/` 等目錄。
- 角色內含大量 `bash` 範例指令（例如 Reality Checker 的 `grep -r ... .`、`ls -la`），AI 可能照著執行；在 Claude Code 中建議保留權限確認。

**已知的坑（我實際看到的）**：
1. **角色之間的名稱與路徑不一致（正是你擔心的「新舊版本衝突」）**：
   - Agents Orchestrator 叫下屬「ArchitectUX」「EvidenceQA」（[agents-orchestrator.md#L67-L90](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/agents-orchestrator.md#L67-L90)），但實際角色名是「UX Architect」「Evidence Collector」。
   - Orchestrator 要求任務清單存在 `project-tasks/[project]-tasklist.md`（L60-L64），Senior PM 卻寫存到 `ai/memory-bank/tasks/[project-slug]-tasklist.md`（[project-manager-senior.md#L22-L30](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/project-management/project-manager-senior.md#L22-L30)），兩邊對不上。
   - Senior PM 結尾說「詳細說明在 `ai/agents/pm.md`」（L135），repo 裡沒有這個檔。
   - Evidence Collector、Reality Checker、Senior PM 都要求跑 `./qa-playwright-capture.sh`，repo 全檔清單中**沒有**這支腳本。
   - `install.sh` 註解寫「73 of 279」（[install.sh#L352](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/install.sh#L352)），實際已 283 個；README 寫「230+」。
   → **教訓**：連 16 萬星的專案，角色檔之間都會漂移；所以你一定需要巡讀員＋單一事實來源。
2. **技術棧偏 Laravel／PHP**：PM、Orchestrator、Reality Checker 的範例寫死 Laravel、Livewire、FluxUI、`resources/views/`，要改成你的純 JS＋Firebase。
3. **安裝全部 283 個會很雜**：Claude Code 會在選代理時看到一大串；OpenCode 有 119 個上限（README 有寫）。建議只挑 10～15 個。
4. **角色是「方法論提示詞」，不是保證**：例如廣告稽核的「200+ 檢查點」並未列在檔案中，AI 會自己想像；重要判斷仍要人覆核。
5. **檔名撞名**：Claude Code／Copilot 用原始檔名，Gemini/OpenCode/Qwen 用 slug，同一個 `--path` 混裝會互相覆蓋（install.sh L341-L357 註解有說明，安裝器會擋）。

---

## 10. 跟其他專案組合的建議

- **角色（本專案）＋ 共用規則框架**：本專案缺「AGENTS.md / CLAUDE.md 分層規則」。建議另外搭配一個專門處理「一份規則同步給 Claude 與 Codex」的工具（同分類其他資料包，如 ruler 類、spec-kit 類），本專案只負責提供「角色」與「交接單」。
- **角色＋任務追蹤**：本專案的 Senior PM 用 Markdown checklist（`### [ ] Task N`，Orchestrator 用 `grep -c "^### \[ \]"` 數未完成任務），很陽春。可接 GitHub Issues 或一個 `TASKS.md`。
- **角色＋記憶**：照 `integrations/mcp-memory` 的寫法，接任何有 `remember/recall` 的 MCP 記憶伺服器，讓 Claude 與 Codex 透過同一個記憶庫交接（兩邊都支援 MCP 時才可行；Codex 端是否能共用同一台 MCP 伺服器：未確認）。
- **對你的業務**：Pricing Analyst＋Supply Chain Strategist 可當你「比價／成本計算」功能的需求分析顧問；Paid Media 七人組當廣告帳戶健檢；Short-Video Editing Coach＋Ad Creative Strategist 當影片腳本的審稿人——但真正的試算表、比價、影片生成程式碼要從其他專案拿。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫 —— **沒有**（只有角色檔，沒有分層規則系統）
- 根目錄沒有 `AGENTS.md`／`CLAUDE.md`／`.ruler`／constitution（全檔清單確認）。`AGENTS.md` 只出現在「轉給 OpenClaw 時，每個角色各自產生一份」的情境（[scripts/convert.sh#L360-L486](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L360-L486)）。
- **分層**：只有「使用者層 vs 專案層」兩種安裝位置（`tools.json` 的 `scope.user / scope.project`），例如 Claude Code 使用者層 `~/.claude/agents/`、專案層 `.claude/agents/`（[tools.json](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/tools.json)）。沒有子資料夾層級規則。
- **優先順序**：只有安裝路徑的優先序 `--path` ＞ 環境變數 ＞ 預設（[install.sh#L385-L418](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/install.sh#L385-L418)）；規則衝突的優先序：沒有。
- **讓 GPT（Codex）和 Claude 讀同一份**：**有，但對象是角色而非規則**——同一份 `.md` 原樣給 Claude，轉成 TOML 給 Codex（`developer_instructions` = 原文）。這個「單一來源＋轉換器」模式可直接套用到你的共用規則。

### 11.2 角色設計 —— **有**（本專案最強項）
- **角色數**：283 個、18 個部門（第 4 節計數方法）。
- **每個角色的職責與技能**：固定章節（[CONTRIBUTING.md#L87-L155](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/CONTRIBUTING.md#L87-L155)）。「技能」寫在 Core Mission / Technical Deliverables / Advanced Capabilities，不是獨立 skills 資料夾。
- **可用工具**：17 個角色用 `tools:` 限制（逐檔計數），其餘未限制。
- **交接（handoff）**：**有**，7 種範本（[handoff-templates.md#L347-L357](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/coordination/handoff-templates.md#L347-L357) 是「哪種情況用哪張單」的對照表）；高頻交接對（[nexus-strategy.md#L576-L595](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/nexus-strategy.md#L576-L595)）。
- **誰向誰負責**：**有**，指揮結構圖（[nexus-strategy.md#L95-L116](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/nexus-strategy.md#L95-L116)）：Agents Orchestrator → Studio Producer（組合）／Project Shepherd（執行）／Senior PM（拆任務）→ 各部門。QA 失敗 3 次升級給 Orchestrator 或 Studio Producer。
- **「不負責什麼」**：Multi-Agent Systems Architect 的角色定義範本有 `NOT RESPONSIBLE FOR` 欄（[#L392-L423](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/engineering/engineering-multi-agent-systems-architect.md#L392-L423)）——這是避免兩個 AI 搶做同一件事最有效的一欄。

**建議給你的最小角色編制（從本專案挑，5～6 個就夠）**：

| 你的角色 | 借用哪個檔 | 主要用哪個 AI | 職責 | 不負責 |
|---|---|---|---|---|
| 總管／任務拆解 | `project-management/project-manager-senior.md`＋`specialized/agents-orchestrator.md` | Claude | 把需求拆成 `TASKS.md` checklist、分派、追蹤 | 不寫程式 |
| 實作者 | `engineering/engineering-frontend-developer.md`＋`engineering/engineering-minimal-change-engineer.md` | Codex 或 Claude | 一次只做一個任務、最小改動 | 不順手重構、不改規則檔 |
| 驗收者 | `testing/testing-evidence-collector.md` | 跟實作者「不同」的那個 AI | 對照驗收條件逐項驗證、附證據 | 不修程式 |
| 最終把關 | `testing/testing-reality-checker.md` | Claude | 預設 NEEDS WORK，上線前把關 | 不修程式 |
| 每日巡讀員 | `specialized/specialized-codebase-archaeologist.md`＋`specialized/specialized-chief-of-staff.md`（文件同步段） | Claude（讀全專案 context 大） | 找漏、找重複、找新舊衝突，更新漂移登記表 | **不改任何程式碼**，只產出報告 |
| 資安抽查（每週） | `security/security-ai-generated-code-auditor.md` | 任一 | 金鑰、Firebase 規則、注入點 | 不改程式 |

### 11.3 防漏 —— **有（文件層級）**
- **任務追蹤**：Senior PM 的 checklist 格式 `### [ ] Task N`＋每項驗收條件＋要改的檔案（[project-manager-senior.md#L53-L103](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/project-management/project-manager-senior.md#L53-L103)）。Orchestrator 用 `grep "^### \[x\]"` 確認全部完成才進整合（[agents-orchestrator.md#L98-L108](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/agents-orchestrator.md#L98-L108)）。
- **完成前驗證**：Evidence Collector「Zero Is Valid，但要列出沒測到的範圍」（[testing-evidence-collector.md#L19-L37](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/testing/testing-evidence-collector.md#L19-L37)）；Reality Checker「把前一位給的滿分視為紅旗」（[testing-reality-checker.md#L39-L50](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/testing/testing-reality-checker.md#L39-L50)）。
- **交接紀錄**：標準交接單含「目前狀態、相關檔案、驗收條件、需要的證據」（[handoff-templates.md#L7-L45](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/coordination/handoff-templates.md#L7-L45)）；跨工具／跨日交接 5 點格式（[specialized-chief-of-staff.md#L186-L191](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-chief-of-staff.md#L186-L191)）；每日 Open loops（[zk-steward.md#L78-L86](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/zk-steward.md#L78-L86)）。
- **自動化**：沒有。全靠 AI 遵守文字。

### 11.4 防重複 —— **有（角色檔層級有自動化；程式碼層級靠角色）**
- **自動**：`check-agent-originality.sh`（[全檔](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/check-agent-originality.sh)）——不帶參數＝全庫兩兩比對（稽核模式）；帶檔名＝只比新檔（CI 模式）。腳本註解說現有角色庫兩兩最高相似度約 1.5%，所以門檻設 20%/40% 很安全。
- **撞名**：`check_agent_slug_collisions()` 拒絕兩個角色同名（[convert.sh#L761-L785](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L761-L785)）。
- **政策**：「Near-duplicate re-skins」一律關 PR（[CONTRIBUTING.md#L313](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/CONTRIBUTING.md#L313)）。
- **程式碼裡的重複實作**：Codebase Archaeologist 的「View 3: By Responsibility」——同一個責任（例如「庫存扣減」）列出所有實作處、是否一致；**且規定先確認「本來就該一樣」才算重複**（[specialized-codebase-archaeologist.md#L74-L86](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L74-L86)、[#L145-L152](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L145-L152)）。
- **合併**：沒有自動合併工具。

### 11.5 防新舊版本衝突 —— **部分有**
- **單一事實來源**：**有**。`divisions.json`、`tools.json`、`runbooks.json` 的 `_note` 都寫明自己是 source of truth；三支 check 腳本在 CI 每個 PR 都跑、**刻意不設路徑過濾**，確保「改了 A 沒改 B」一定被抓（[check-divisions.yml](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/.github/workflows/check-divisions.yml)、[check-runbooks.yml](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/.github/workflows/check-runbooks.yml)）。`lint-agents.sh` 的顏色清單是「從 convert.sh 讀出來」而不是複製一份，註解直接說明理由：複製的清單會悄悄過期（[lint-agents.sh#L42-L53](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/lint-agents.sh#L42-L53)）。**「不要複製清單，要從權威來源讀」是你可以立刻採用的原則。**
- **漂移偵測**：**有**。`convert-outputs.sha256` 每個角色一行雜湊，改一個角色只動自己那行；PR 時「只報告不擋」、推到 main 時「嚴格擋」（[test-convert-outputs.sh#L21-L45](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/test-convert-outputs.sh#L21-L45)）。
- **程式碼新舊寫法並存**：Codebase Archaeologist 的「View 2: By File Era」（哪個時期用哪種寫法、哪些檔沒遷移）＋規則「不要因為最新就假設正確」「半套修復＝新的 bug」（[#L60-L72](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L60-L72)、[#L162-L172](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L162-L172)）。
- **文件與程式不一致**：Archaeologist Step 7「把文件當成對程式碼的宣稱，逐條驗證」；Chief of Staff「文件連動更新圖」（[#L68-L78](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-chief-of-staff.md#L68-L78)）；Technical Writer「deprecate old docs, never delete」。
- **舊產物清除**：轉換前先刪舊輸出，避免改名後新舊檔並存（[convert.sh#L742-L759](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L742-L759)）。
- **版本標記**：角色檔**沒有**版本欄位；只有 Workflow Architect 的規格範本有 `**Version**: 0.1`。
- **變更提案／封存**：**沒有** OpenSpec 式的 proposal/archive 流程；只有「大改先開 Discussion」的社群規定（[CONTRIBUTING.md#L302-L313](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/CONTRIBUTING.md#L302-L313)）。Archaeologist 規定「發現永不刪除，只能標 Won't Fix 並寫理由」——等於一種封存。

### 11.6 定期巡檢 —— **沒有自動排程；有節奏表與報告格式**
- **排程／heartbeat／cron／hook**：**沒有**。repo 內的 6 支 CI 只在 PR / push 時觸發，沒有 `schedule:`（我讀過全部 6 支 workflow 的 `on:` 區塊）。
- **節奏設計（文字）**：Phase 6 營運手冊有 Daily / Weekly / Bi-weekly / Monthly 表（[phase-6-operate.md#L20-L60](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/playbooks/phase-6-operate.md#L20-L60)）；開發期每日狀態格式（[phase-3-build.md#L147-L162](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/playbooks/phase-3-build.md#L147-L162)）；Chief of Staff 每日站會、每週結算（含「文件同步檢查」）、每月流程稽核（[#L154-L198](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-chief-of-staff.md#L154-L198)）。
- **巡讀報告格式**：Codebase Archaeologist 的四視圖登記表＋單筆發現格式（[#L39-L110](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L39-L110)、[#L174-L217](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L174-L217)），建議存成 `docs/drift-audit/REGISTRY.md`＋`FINDING-*.md`（[#L326-L337](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L326-L337)）。

**簡短範例（依原格式改寫成你的倉儲情境，示意用）**：
```markdown
# 每日巡讀報告 2026-11-04（巡讀員：Claude／Codebase Archaeologist）

## 今日新發現
FILE(S): js/inventory.js, js/order.js
TYPE: 邏輯不一致（fallback 順序相反）
PATTERN FOUND: inventory.js 用 `qty ?? 0`，order.js 用 `0 || qty`
RISK: 庫存為 0 時兩邊判斷不同，可能出現負庫存
SEVERITY: Critical（資料／金額）
LIKELY ORIGIN: 不同 session 各自實作，沒有共用 helper
SUGGESTED FIX DIRECTION: 抽成 utils/stock.js 單一函式

## 登記表狀態（View 4：依風險）
- Critical：1 Open
- Moderate：2 Open（日期格式 UTC vs 本地；單價「元」vs「分」）
- Cosmetic：3

## 昨日標「Fixed」的複查
- FINDING-price-unit：只改了 order.js，report.js 仍用舊單位 → 改回 Open（半套修復）

## 文件 vs 程式
- README「出貨流程」仍寫同步處理，實際 shipping.js 已改成佇列 → 需更新文件
```

**要變成「每天自動」，你得自己加**（本專案沒有）：例如 Claude Code 的排程／GitHub Actions `schedule:` cron，每天叫 Claude 以 Codebase Archaeologist 身分讀全專案、更新 `docs/drift-audit/REGISTRY.md`、開一個 Issue。

### 11.7 Skill 寫法 —— **部分有（只在轉換器裡）**
- **SKILL.md 格式**：資料夾 `agency-<slug>/` 內放 `SKILL.md`，frontmatter 只有 `name`、`description`，內文＝角色全文（[convert.sh#L133-L157](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L133-L157)）。沒有 `scripts/`、`references/` 子資料夾的示範。
- **description 怎麼寫才會被觸發**：repo 沒有專門教學。從角色檔可歸納的寫法：一句話說「專長＋適用情境」，例如 Codebase Archaeologist 的 description 直接寫出「多 session、多工具、漂移、重複、文件不一致」等觸發詞。README 總表的「When to Use」欄也是觸發條件的好素材。另外 `lint-agents.sh` 禁止多行折疊 YAML（`description: >`），因為轉換器會出錯（[lint-agents.sh#L115-L122](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/lint-agents.sh#L115-L122)）——**description 請寫成單行**。
- **腳本放哪**：角色檔內不放可執行程式（`SECURITY.md`：「Never add executable code inside agent Markdown files」）；工具腳本統一在 `scripts/`。

### 11.8 支援哪些工具與安裝方式 —— **有**
`tools.json` 列 17 個（我數 JSON 的 `tools` 鍵）：Claude Code、Codex、Gemini CLI、GitHub Copilot、Qwen Code、Cursor、OpenCode、Osaurus、Aider、Antigravity、Kimi、OpenClaw、Windsurf、Hermes、Mistral Vibe、ZCode、DeepSeek Harness。

```bash
# Claude Code（不需轉換）
./scripts/install.sh --tool claude-code --agent agents-orchestrator,codebase-archaeologist
# 或手動：cp specialized/specialized-codebase-archaeologist.md ~/.claude/agents/
# Codex（先轉換）
./scripts/convert.sh --tool codex && ./scripts/install.sh --tool codex
# Cursor（專案層）
cd 你的專案 && /path/to/agency-agents/scripts/install.sh --tool cursor
```
（指令摘自 README，本次掃描未執行。`--agent` 可吃 slug、顯示名稱或去掉 `.md` 的檔名。）

### 11.9 可以直接借用到你「基礎架構」的檔案或段落
1. `specialized/specialized-codebase-archaeologist.md` 全檔 → 你的「每日巡讀員」角色（改中文、換成你的檔名範例）。
2. `strategy/coordination/handoff-templates.md` 第 1（標準交接）、3（QA 退件）、4（升級）節 → `docs/handoff/` 範本。
3. `engineering/engineering-multi-agent-systems-architect.md` L392-L423「Agent Role Definition Template」→ 每個 AI 角色的規格書格式（含「不負責什麼」「可用工具」）。
4. `specialized/specialized-chief-of-staff.md` L68-L78（文件連動更新）、L162-L170（每週結算含文件同步檢查）、L186-L191（跨工具交接 5 點）。
5. `specialized/zk-steward.md` L78-L86「Daily Log Entry：Intent / Changes / Open loops」→ 每個 AI 收工前必寫。
6. `strategy/nexus-strategy.md` L46-L55「Core Principles」（尤其 Single Source of Truth：一份規格、一份任務清單、一份架構文件；最多重試 3 次）→ 寫進你的 `AGENTS.md` 開頭。
7. `scripts/check-agent-originality.sh` L43-L179 → 改成掃你的規則與文件的重複偵測（中文需改分詞）。
8. `scripts/lint-agents.sh` L42-L53 的「從權威來源讀清單，不要複製」寫法 → 你的規則：「Firestore 欄位名稱只能從 `schema.json` 讀」。
9. `engineering/engineering-minimal-change-engineer.md` → 給實作 AI 的「只改被要求的地方」紀律，減少兩個 AI 互相覆蓋。
10. `integrations/mcp-memory/README.md` L37-L57「Memory Integration」段落 → 若你要讓 Claude 與 Codex 共用記憶。

---

## 關鍵字
agency-agents、The Agency、AI 代理公司、AI 角色庫、subagent、子代理、角色檔、Claude Code agents、Codex 自訂代理、developer_instructions、SKILL.md、Agent Skills、Cursor rules、多代理協作、multi-agent、NEXUS、Agents Orchestrator、總指揮、交接範本、handoff template、Dev↔QA 迴圈、品質閘門、quality gate、Reality Checker、Evidence Collector、Codebase Archaeologist、程式碼考古、漂移偵測、drift detection、重複偵測、shingle、Jaccard、單一事實來源、single source of truth、巡讀、每日巡檢、drift registry、文件與程式不一致、Chief of Staff、Daily Log、Open loops、MCP 記憶、廣告投放稽核、Paid Media Auditor、Pricing Analyst、定價分析、MIT 授權
