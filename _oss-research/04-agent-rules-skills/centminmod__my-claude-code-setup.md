# centminmod/my-claude-code-setup — 以 Claude 為主的「CLAUDE.md＋記憶庫（memory bank）」起手範本：3 種 CLAUDE.md 寫法、記憶庫同步子代理、記憶庫去重／封存指令、開發歷程索引，外加「Claude 叫 Codex 當第二意見」的雙 AI 比對技能
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：7d5c374
> GitHub：https://github.com/centminmod/my-claude-code-setup｜⭐ 2713｜授權：MIT（但內含的 Highcharts 圖表檔是「非商業授權」，見第 2 節）｜主要語言：Python｜最近更新：2026-10-08

（以下 permalink 全部固定在 commit `7d5c3743942606a9c5756de47ecdb41e2317c8b6`。所有行號都是我在這個 commit 上用 `cat -n`／`grep -n` 逐一對過的；沒打開過的檔案不會引用。為了好讀，文中用 `B/` 代表 `https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/`，表格與第 11 節的重點位置則寫完整網址。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 這是澳洲開發者 George Liu（eva2000）把自己每天在用的 Claude Code 設定整包公開：根目錄的 `CLAUDE.md` 只放專案說明，行為規則抽到 `.claude/rules/core-rules.md`，專案知識則拆成 `CLAUDE-activeContext.md`、`CLAUDE-patterns.md`、`CLAUDE-decisions.md` 等「記憶庫」檔案按需讀取，再配上 6 個子代理、14 個斜線指令（不含測試範例）、7 個 skill。**它不是應用程式，沒有網頁介面、沒有資料庫**，是一份可以直接複製到你專案裡的「設定資料夾＋寫法範本」。

**對你最有用的地方（依你的 4 個興趣排序）：**

1. **多 AI 協作／防漏／防重複／防新舊衝突（你最在意的）** — 這個專案是這一類裡「記憶庫怎麼分檔、什麼時候讀、什麼時候更新、怎麼去重封存」寫得最具體的範本之一，幾個檔案可以幾乎原封不動搬進你的倉儲系統專案：
   - `core-rules.md`（29 行的行為規則，含「完成前要驗證、說清楚沒驗證到什麼」）。
   - `memory-bank-synchronizer` 子代理（把記憶庫文件跟實際程式碼比對，**技術內容改成現況、規劃與歷史一律保留**）— 這就是你想要的「巡讀」的核心角色雛形。
   - `/cleanup-context` 指令（找重複檔、合併成 `-comprehensive` 檔、把舊的搬到 `archive/`，並建議每月／每季做一次）— 這是「防重複＋防新舊版本混在一起」的現成做法。
   - `CLAUDE-history-template.md`（`CLAUDE-history.md` 索引＋`history/` 一事一檔＋`.counter` 流水號，每次記錄時順便檢查 README／CLAUDE.md／AGENTS.md 有沒有過期）— 這是「交接紀錄＋漂移檢查」。
   - `consult-codex` skill（Claude 同時派 Codex 和自己的 code-searcher 去查同一個問題，最後產出「兩邊都同意／只有一邊說／互相矛盾」三欄比對表）— 這是你「GPT 和 Claude 互相抓漏」最直接可借的流程。
2. **AI 影片／腳本** — `ai-image-creator` skill 能生成商品圖（有 `product_hero`、`social_media`、`marketing_banner` 等 11 類提示詞公式），也能「分析一支影片 → 產生文字描述給影片提示詞用」（`--analyze-video`，**只分析不生成影片**）。可當電商廣告素材流程的一小段。
3. **網頁試算表、比價／ERP** — **沒有**相關功能。它的 `session-metrics` 是算「Claude Code 自己花了多少 token／多少錢」，不是商品比價。但它「把 JSONL 紀錄轉成 HTML 儀表板＋CSV」的做法，對你想追蹤 AI 使用成本有參考價值。

**直接結論：** 拿它當你「AI 協作基礎架構」的 Claude 端骨架很合適；但它**不是**「GPT 和 Claude 讀同一份規則」的設計（它反而讓每個工具各讀各的，見第 11 節），所以要搭配 OpenSpec／AGENTS.md 類專案補齊 Codex 那一邊。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **主授權：MIT**（`B/LICENSE`，Copyright (c) 2025 George Liu (eva2000)）。白話：個人、公司都可以免費用、改、拿去商用，唯一要求是保留原本的版權聲明與授權文字。
- **要特別注意的例外：** `session-metrics` skill 裡內附的 Highcharts 圖表程式庫是 **Highcharts 非商業授權**（`.claude/skills/session-metrics/scripts/vendor/charts/highcharts/v12/LICENSE.txt` 第 1–15 行寫明「個人、學校、非營利免費；商用需向 Highsoft AS 購買授權」）。你如果只是自己看報表沒問題；若把產生的報表放進對外販售的產品，要改用 `--chart-lib none`、`uplot` 或 `chartjs`（後兩者是 MIT）。
- **閉源／付費版：** 程式碼本身沒有付費版。但它引用了兩個**不在這個 repo 裡**的 skill：`consult-panel`（`consult-codex/SKILL.md` 第 216 行提到）和 `ai-image-test-run`（`model-benchmarks.md` 開頭提到）。我在完整檔案清單（134 個檔）裡找不到它們，所以這兩個功能「未確認是否公開」。
- **外部服務是付費的：** Claude Code 本身需要 Claude 付費方案（README 寫 Pro 20 美元／Max 100 或 200 美元每月）；Codex 需要 OpenAI 帳號；圖片生成走 OpenRouter 等按量計費。README 裡還有 Z.AI（GLM 模型）的推薦碼連結，那是作者的推廣碼，不是必須。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 前端 | 無（只有 `session-metrics` 產生的靜態 HTML 報表） |
| 後端 | 無伺服器。所有東西都是 Claude Code 讀的 Markdown 設定，加上幾支 Python 腳本 |
| 資料庫 | 無。記憶庫就是專案根目錄的 `CLAUDE-*.md` 純文字檔＋Claude Code 內建的 auto memory（`~/.claude/projects/.../memory/`） |
| 語言 | Markdown（91 個 `.md`）＋ Python（23 個 `.py`，共 31,460 行、576 個 `def`；用 `git ls-files '*.py' \| xargs cat \| wc -l` 和 `grep -c "^\s*def "` 自己數的）。Python 幾乎全部屬於 `session-metrics`、`audit-session-metrics`、`ai-image-creator` 三個 skill |
| 部署 | 不用部署。把 `.claude/` 資料夾和 `CLAUDE*.md` 複製到你的專案根目錄即可 |
| 硬體／GPU | 不需要 GPU |
| 需要的工具 | Claude Code（必要）；`rg`、`fd`、`jq`（規則要求用它們）；`uv`（跑 Python skill）；Codex CLI（只有 `consult-codex` 需要）；macOS 的 `terminal-notifier`（只有 Stop 通知 hook 需要，Windows／Linux 可以刪掉） |
| API Key 與費用 | Claude Code 用你的 Claude 訂閱；`consult-codex` 用你的 Codex/OpenAI 訂閱；`ai-image-creator` 需要 OpenRouter 或 Google AI Studio 金鑰（環境變數名稱見 `generate-image.py` 第 390–399 行，例如 `AI_IMG_CREATOR_CF_ACCOUNT_ID`），按張計費；`session-metrics` 平常**完全本機、不連網**，只有 `count-tokens` 比較模式會呼叫 `https://api.anthropic.com/v1/messages/count_tokens`（`session_metrics_compare.py` 第 3560 行）並需要 `ANTHROPIC_API_KEY` |

---

## 4. 程式架構地圖

完整檔案清單共 134 個檔（`git ls-tree -r --name-only HEAD | wc -l`）。重要部分：

```
my-claude-code-setup/
├── CLAUDE.md                     ← 本專案自己的 CLAUDE.md（Template 3 格式，98 行）：只放專案說明＋記憶庫目錄＋各層規則表
├── CLAUDE-template-1.md          ← 範本1：精簡、規則內嵌（101 行）
├── CLAUDE-template-2.md          ← 範本2：記憶庫為主、雙記憶比較表（153 行）
├── CLAUDE-template-3.md          ← 範本3：漸進揭露，規則外移到 .claude/rules/（105 行）
├── CLAUDE-migrate-to-new-template.md ← 給 AI 讀的「舊 CLAUDE.md 搬到新範本」提示詞（209 行）
├── CLAUDE-history-template.md    ← 開發歷程索引＋一事一檔的規則區塊（188 行）
├── CLAUDE-cloudflare*.md / CLAUDE-convex.md ← 平台參考文件（按需讀取的「知識包」，最大 4,153 行）
├── AGENTS.md                     ← 注意：這裡只是 rg/fd/jq 工具速查表，不是共用規則
├── GEMINI.md                     ← 給 Gemini CLI 的規則，第 10 行要它「忽略 CLAUDE.md」
├── .clinerules                   ← 給 Cline：只有一句「讀 @CLAUDE.md」
├── .worktreeinclude              ← 開 git worktree 時要一併複製的 .env 等檔
├── README.md / README-v2~v4.md   ← 同一份說明寫成 4 種風格（共 6,060 行）
├── CHANGELOG.md                  ← 根目錄更新紀錄（已明顯停更）
└── .claude/
    ├── rules/core-rules.md       ← 行為規則（每次開場自動載入）
    ├── settings.json             ← 模型 sonnet＋Stop 通知 hook
    ├── settings.local.json       ← 權限白名單、預設 plan 模式、環境變數
    ├── agents/                   ← 6 個子代理（角色）
    │   ├── memory-bank-synchronizer.md ← 記憶庫 vs 程式碼同步（巡讀角色）
    │   ├── code-searcher.md      ← 程式碼搜尋／鑑識，要求 file:line 與「先試著推翻再回報」
    │   ├── codex-cli.md          ← 呼叫 OpenAI Codex CLI 的傳話代理（haiku 模型）
    │   ├── zai-cli.md            ← 呼叫 z.ai GLM 的傳話代理
    │   ├── ux-design-expert.md   ← UX/UI 設計
    │   └── get-current-datetime.md ← 只負責回傳現在時間
    ├── commands/                 ← 14 個斜線指令（另有 6 個 prompt injection 測試範例）
    │   ├── anthropic/update-memory-bank.md ← 一句話：「更新 CLAUDE.md 和記憶庫」
    │   ├── cleanup/cleanup-context.md      ← 記憶庫去重、合併、封存
    │   ├── anthropic/convert-to-todowrite-tasklist-prompt.md ← 把長提示改寫成 TodoWrite 任務清單
    │   ├── security/ refactor/ documentation/ architecture/ promptengineering/ ccusage/
    ├── skills/                   ← 7 個 skill
    │   ├── consult-codex/        ← Codex＋Claude 雙 AI 比對（394 行）
    │   ├── consult-zai/          ← GLM＋Claude 雙 AI 比對
    │   ├── claude-docs-consultant/ ← 按需查 Claude Code 官方文件（關鍵字→檔名路由表）
    │   ├── ai-image-creator/     ← AI 生圖／圖片分析／影片分析
    │   ├── session-metrics/      ← Claude Code 用量與費用報表（大部分 Python 在這）
    │   ├── audit-session-metrics/ ← 讀上面的報表找浪費，含 CLAUDE.md 重複規則檢查
    │   └── task-breakdown/       ← 把一次對話的請求歸納成「任務」並判斷值不值得
    ├── hooks/unified_notifier.py ← 桌面通知＋語音播報（寫死作者的 Mac 路徑）
    └── mcp/chrome-devtools.json  ← Chrome DevTools MCP 設定
```

---

## 5. 核心功能怎麼實作

**(1) 三層式規則＋記憶庫（核心概念）**
- 位置：`B/CLAUDE.md#L37-L94`、`B/CLAUDE-template-2.md#L70-L117`
- 重點：分成「主記憶」（專案根目錄的 `CLAUDE-*.md`，走 git、團隊共享、**不自動載入，按需讀**）與「影子記憶」（Claude Code 原生 auto memory，機器本地、每次自動載入前 200 行）。每個記憶檔都有「什麼時候讀」：`CLAUDE-activeContext.md` 開場就讀、`CLAUDE-patterns.md` 實作前讀、`CLAUDE-decisions.md` 做設計決定前讀、`CLAUDE-troubleshooting.md` 除錯時讀、`CLAUDE-config-variables.md` 動設定時讀。`CLAUDE.md#L78-L92` 的「Context Layers」表列出 9 層（專案、核心規則、auto memory、路徑規則、使用者全域規則、skills、`CLAUDE.local.md`、記憶庫），標明哪些載入、哪些共享、哪些在 CLAUDE.md 被清掉後還活著。
- 刻意**不用** `@檔名` 自動匯入記憶檔，以省 context（`B/CLAUDE-migrate-to-new-template.md#L104-L110`）。

**(2) 行為規則外移**
- 位置：`B/.claude/rules/core-rules.md#L1-L29`
- 重點：5 組規則——查證與準確（沒讀過的程式不准猜）、範圍紀律（只做被要求的事）、驗證與安全（宣告完成前重新核對需求、跑測試、說清楚改了什麼與**沒驗證到什麼**；刪檔／force push 前先問）、效率、記憶韌性（更新記憶庫時同步到 auto memory，並維護 `memory/MEMORY.md` 索引）。

**(3) 記憶庫同步子代理（巡讀角色雛形）**
- 位置：`B/.claude/agents/memory-bank-synchronizer.md#L7-L87`
- 重點：6 項職責（模式、架構決策、規格、進度、範例程式碼、交叉引用路徑），**第 23–45 行的保留規則**是亮點：待辦清單、路線圖、歷史成就、除錯紀錄、決策理由「永遠不刪」。第 64–69 行的決策樹：技術描述→改成現況；規劃／歷史→保留並在報告中標示「已保留」。第 71–85 行規定回報格式（技術更新／保留的策略內容／準確度改善）。

**(4) 記憶庫去重、合併、封存**
- 位置：`B/.claude/commands/cleanup/cleanup-context.md#L52-L112`（四階段）、`#L221-L235`（定期排程建議）
- 重點：階段 1 刪掉標記 REMOVED／DEPRECATED 的檔；階段 2 把同主題多檔合併成 `CLAUDE-<主題>-comprehensive.md`，然後更新 CLAUDE.md 引用；階段 3 精簡 CLAUDE.md 中與記憶庫重複的內容；階段 4 建 `archive/` 與 `archive/README.md` 索引。合併後的檔頭格式要求 `Last Updated`、`Status`、`Coverage`（`#L239-L259`）。

**(5) 開發歷程（交接紀錄＋漂移檢查）**
- 位置：`B/CLAUDE-history-template.md#L27-L120`
- 重點：`CLAUDE-history.md` 只當索引（一列一事），內容放 `history/YYYY-MM-DD_NNN_類別_slug.md`；10 種類別（code-change、decision、bug-fix…）；用 `history/.counter` 避免檔名撞號；**第 96–100、112 行要求每次寫紀錄時順便檢查 README、架構文件、CLAUDE.md／AGENTS.md 是否已過期**。第 59–66 行明列「不要記」的雜訊（改錯字、純格式…），避免紀錄本身變成重複垃圾。

**(6) Claude＋Codex 雙 AI 比對**
- 位置：`B/.claude/skills/consult-codex/SKILL.md#L24-L395`
- 重點：先用一行重述問題（`#L30-L37`）→ 包成要求 `file:line` 引用與「Citations Index」的結構化提示（`#L40-L71`）→ 寫檔後**分兩則訊息**派工，避免檔案還沒寫好 Codex 就啟動（`#L152`）→ Codex 以 `codex exec -s read-only --json` 唯讀沙箱執行（`#L184-L197`），有 1200 秒逾時保護（`#L154`）→ 同時派 Claude 的 code-searcher → 輸出比對表、一致程度（High／Partial／Disagreement）、依佐證分「Corroborated／Solo／Disputed」（`#L342-L395`）。`#L158-L165` 特別寫：模型由 Codex 自己的設定檔決定、報告只寫「Codex」不寫版本號，因為曾發生「文件寫 A 版、實際跑 B 版」的錯置。

**(7) 規則檔健檢（找重複規則）**
- 位置：`B/.claude/skills/audit-session-metrics/references/detailed-audit.md#L70-L86`、`#L171-L177`
- 重點：詳細模式會依序讀 `~/.claude/CLAUDE.md`、`./CLAUDE.md`、子資料夾 CLAUDE.md、各層 settings，產出 `claudemd_oversize`（超過約 2000 token）、`claudemd_duplication`（同一條規則同時出現在全域與專案 CLAUDE.md）、`mcp_unused` 等發現。

**(8) 其他**：`code-searcher` 的「回報前先試著推翻自己」（`B/.claude/agents/code-searcher.md#L28`）；`claude-docs-consultant` 的「關鍵字→文件檔名」路由表（`B/.claude/skills/claude-docs-consultant/SKILL.md`，完整表在 `references/docs-index.md`）；`ai-image-creator` 的商品圖公式（`B/.claude/skills/ai-image-creator/references/prompt-categories.md#L7-L25`）。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 核心行為規則 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/rules/core-rules.md | 無 | 低 | 直接複製；同一段文字也貼進 `AGENTS.md` 給 Codex 讀，或讓兩邊都引用同一檔 |
| CLAUDE.md 範本 3（專案說明＋記憶庫目錄） | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE-template-3.md | core-rules.md | 低 | 填入你的 Firebase 專案資訊；把「Build, Test & Verify」換成你的部署／測試指令 |
| 記憶庫檔案組（activeContext／patterns／decisions／troubleshooting／config-variables） | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE-template-2.md#L77-L104 | 無（repo 只給檔名與用途，**沒附內容範本**） | 低 | 自己建這 5 個檔；建議檔名改成工具中立（例如 `docs/ai/active-context.md`）讓 Codex 也讀 |
| 記憶庫同步子代理 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/agents/memory-bank-synchronizer.md | Claude Code 子代理機制 | 低 | 放到 `.claude/agents/`；當作每日巡讀的「執行者」；Codex 端可把同一段 prompt 存成 `.agents/skills/` 或直接 `codex exec` 餵入 |
| 去重／封存流程 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/commands/cleanup/cleanup-context.md | 無 | 低 | 放到 `.claude/commands/`；每週或每月跑一次 |
| 開發歷程索引 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE-history-template.md | 無 | 低 | 把第 27–120 行的區塊貼進共用規則；兩個 AI 都依這格式寫交接紀錄 |
| 雙 AI 比對 skill | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/consult-codex/SKILL.md | Codex CLI、`jq`、`timeout`、code-searcher 子代理 | 中 | 複製 skill＋`code-searcher.md`；可把「問題」換成「今天的巡讀清單」，讓 Codex 與 Claude 各巡一次再比對 |
| 規則重複／過大檢查標準 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/audit-session-metrics/references/detailed-audit.md#L70-L86 | 原本依賴 session-metrics 匯出；只借「規則」部分則無依賴 | 中 | 把 `claudemd_oversize`／`claudemd_duplication` 判斷標準抄進你的巡讀清單 |
| 程式碼搜尋角色 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/agents/code-searcher.md | 無 | 低 | 當「審查員」角色；第 26–28 行「找不到問題也是有效結果」「先推翻再回報」很適合貼進任何審查角色 |
| 歷史雜訊排除＋git worktree 平行開發 | README `#L296-L475`（https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/README.md#L296-L475） | git | 低 | 用 `cx`（Codex）／`clx`（Claude）兩個 shell 函式讓兩個 AI 各在獨立資料夾改程式，避免互踩 |
| AI 商品圖＋影片分析 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/ai-image-creator/SKILL.md | `uv`、OpenRouter 等 API Key | 中 | 給電商素材流程用；影片只能「分析成文字」不能生成 |
| Claude 用量／費用報表 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/session-metrics/SKILL.md | Python 標準函式庫、`uv` | 中 | 追蹤每天 AI 花費；對外商用記得換掉 Highcharts |

---

## 7. AI／Claude 整合

- **原生 Claude Code**：所有規則、子代理、skill、hook 都是 Claude Code 格式。`settings.json` 預設模型 `sonnet`；`settings.local.json#L97` 預設 `plan` 模式（先規劃、經同意才動手）。子代理用 frontmatter 指定模型，例如 `codex-cli.md` 用 `haiku`（只當傳話筒）、`code-searcher.md` 用 `sonnet`。
- **prompt 放哪**：子代理 prompt 在 `.claude/agents/*.md`，指令在 `.claude/commands/**/*.md`，skill 在 `.claude/skills/*/SKILL.md`（長內容拆到 `references/`，腳本放 `scripts/`）。
- **跟 GPT／Codex 的關係**：**Claude 是主、Codex 是被叫來的顧問**。`codex-cli.md` 用 `codex -p readonly exec "..." --json` 唯讀執行（`B/.claude/agents/codex-cli.md#L19-L46`）；`consult-codex` 做雙方比對。repo 裡**沒有** `.codex/` 設定、沒有給 Codex 讀的共用規則檔。
- **其他模型**：z.ai GLM（`zai-cli`、`consult-zai`）、Gemini CLI（`GEMINI.md`＋Gemini MCP 權限）、圖片模型經 OpenRouter。
- **MCP**：`.claude/mcp/chrome-devtools.json`（`npx -y chrome-devtools-mcp@latest`）；README 第 103–112 行列出作者另裝的 Gemini CLI、Cloudflare Docs、Context7、Chrome DevTools、Notion、OpenTelemetry 用量 MCP。
- **能不能換成 Claude**：本來就是 Claude。

---

## 8. 擴充方式與 API

- **加規則**：在 `.claude/rules/` 加新 `.md`；`CLAUDE.md#L86` 提到可做「路徑範圍規則」（只在讀到特定路徑時載入），`#L92` 建議用符號連結 `ln -s ~/shared-rules .claude/rules/shared` 讓多個專案共用同一份規則。
- **加角色**：在 `.claude/agents/` 加一個含 `name`、`description`、`tools`、`model`、`color` frontmatter 的 `.md`。
- **加 skill**：`.claude/skills/<名稱>/SKILL.md`＋`references/`＋`scripts/`；也可以用作者的外掛市集安裝（README 第 945 行：`/plugin marketplace add centminmod/claude-plugins` → `/plugin install session-metrics@centminmod`）。
- **加 hook**：在 `settings.json` 的 `hooks` 底下設定（目前只有 Stop 事件）。
- **CI**：README 第 799–877 行給了 GitHub Actions 範例（`anthropics/claude-code-action@v1`，在 issue／PR 留言 `@claude` 觸發）。注意它是「被提及才跑」，**不是排程**。
- **程式 API**：`session-metrics.py`、`generate-image.py` 都是 CLI，沒有函式庫 API。

---

## 9. 程式品質與風險

- **維護狀況**：活躍。最後推送 2026-10-08；`session-metrics/CHANGELOG.md` 從 v1.0.0（2026-04-17）到 v1.91.0（2026-10-08）共 137 個版本標題（`grep -c "^## v"` 數的）。但根目錄 `CHANGELOG.md` 只有 2025-07 與一筆 2026-04 紀錄，**明顯停更**。
- **測試**：repo 裡**沒有測試檔**（檔名含 test 的只有一個提示詞指令與 6 個 prompt injection 範例，以及 model-compare 的 fixture 文件）；`session_metrics_compare.py` 的註解提到測試會注入 mock，但測試本身不在這個 repo。
- **文件內部新舊不一致（正好是你要防的問題，這個 repo 自己就有）**：
  - README 第 900 行寫 consult-codex 用 GPT-5.2、`codex-cli.md` 第 3 行也寫 GPT-5.2，但 `consult-codex/SKILL.md#L158-L165` 說實際模型由設定檔決定（作者機器上是 `gpt-5.6-sol`），並記錄「曾在七個地方寫錯版本」。
  - README 第 888 行與 `zai-cli.md` 寫 GLM 4.7，`consult-zai/SKILL.md` 第 3 行寫 GLM 5.2。
  - 範本說記憶庫是「git-shared、team-shared」（`CLAUDE-template-2.md#L74`），同一檔又說「commit 時排除 CLAUDE.md 與 CLAUDE-*.md」（`#L104`）。而且 repo 本身**沒有 `.gitignore`**（檔案清單中找不到）。採用時要自己決定：記憶庫到底進不進 git。（我建議：你的是私人專案，**要**進 git，才有版本可回溯。）
  - `AGENTS.md` 還在 repo 裡，但遷移指南第 109 行說「AGENTS.md 已不再需要」。
- **資安**：`settings.local.json` 白名單很寬（`Bash(curl:*)`、`Bash(python:*)`、`Bash(pip install:*)`、`WebSearch` 等），而且 `Bash(mkdir:*)` 在第 33 與第 69 行重複。直接照抄等於讓 AI 不經詢問就能下載與執行程式，建議縮減。
- **隱私／遙測**：沒有看到遙測程式；`session-metrics` 標榜本機解析（README 第 935 行），只有 count-tokens 模式會連 Anthropic API。z.ai 路線會把程式碼送到新加坡的服務（README 第 539–545 行）。
- **已知的坑**：`unified_notifier.py` 第 22 行寫死作者的 macOS 路徑；Stop hook 需要 macOS 的 `terminal-notifier`；`consult-codex` 依賴 `jq`、`timeout`，在 Windows 要自己處理；引用的 `consult-panel`、`ai-image-test-run` 不在 repo；README 有 4 個版本共 6,060 行，內容大量重複，更新時容易漏改其中幾份。

---

## 10. 跟其他專案組合的建議

1. **本專案（Claude 端骨架）＋ OpenSpec／spec-kit（變更提案與封存）**：本專案只有「記憶庫」沒有「變更提案」。用 OpenSpec 的 `changes/` → `archive/` 流程管「新版本 vs 舊版本」，用本專案的記憶庫管「目前狀態與決策」。
2. **本專案＋ obra/superpowers 或 addyosmani/agent-skills（技能紀律）**：本專案的 skill 偏工具（生圖、算錢），缺「寫計畫→實作→審查→驗證」的工作流 skill，可從那兩個補。
3. **讓 GPT 與 Claude 讀同一份規則**：本專案是「各讀各的」（`GEMINI.md#L10` 要 Gemini 忽略 CLAUDE.md，`CLAUDE.md#L29` 要 Claude 忽略 GEMINI.md；只有 Cline 透過 `.clinerules` 指回 CLAUDE.md）。建議你反過來：**以 `AGENTS.md` 為單一事實來源**（Codex 原生讀它），`CLAUDE.md` 第一行寫「先讀 AGENTS.md」，然後只放 Claude 專屬的部分——這就是 `.clinerules` 的同一招，只是方向反過來。
4. **建議的「每日巡讀」組法（以下是我依本專案零件組出的建議，repo 本身沒有排程）**：
   - 排程：Claude Code 的排程任務／`/loop`，或 GitHub Actions 加 `schedule: cron`（README 範例只有 `@claude` 觸發，要自己加）。
   - 步驟：① `memory-bank-synchronizer` 比對記憶庫與程式碼 → ② 依 `cleanup-context` 的「階段 1、2」只列出重複與過期候選（不直接刪）→ ③ 依 `detailed-audit` 的標準檢查規則檔過大／重複 → ④ 用 `consult-codex` 的格式讓 Codex 也巡一次，列出 Corroborated／Solo／Disputed → ⑤ 依 `CLAUDE-history-template` 寫一筆 `history/` 紀錄。
5. **電商影片**：`ai-image-creator` 只做圖與影片分析，影片生成要另找第 03 類專案；可用它的 `--analyze-video` 把競品廣告轉成文字，再交給腳本生成工具。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫
- **檔案結構：有。** `CLAUDE.md`（專案說明）＋`.claude/rules/core-rules.md`（行為規則）＋`CLAUDE-*.md`（記憶庫）＋`CLAUDE.local.md`（個人覆寫，gitignore）＋`~/.claude/rules/*.md`（使用者全域）。另有 `AGENTS.md`、`GEMINI.md`、`.clinerules`。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE.md#L78-L94
- **分層（全域／專案／子資料夾）：有。** 同一張表列出全域使用者規則、專案規則、路徑範圍規則；`CLAUDE-template-2.md#L149` 說明子資料夾 CLAUDE.md「在 Claude 讀到該資料夾檔案時才重新載入」。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE-template-2.md#L136-L151
- **優先順序：未確認。** 表格只寫「載入時機」與「誰看得到」，沒有明文寫「衝突時誰優先」。
- **GPT（Codex）和 Claude 讀同一份規則：沒有。** 本專案讓各工具分開：`GEMINI.md#L10`「Ignore CLAUDE.md」，`CLAUDE.md#L29`「Ignore GEMINI.md」；`AGENTS.md` 只是工具速查，且遷移指南說它已不需要。唯一的「共讀」是 `.clinerules` 一句「Read and use @CLAUDE.md」。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.clinerules ／ https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/GEMINI.md#L10 ／ https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE-migrate-to-new-template.md#L109
- **規則長度控管：有。** 每個範本開頭都寫「Keep under 200 lines. If removing a line wouldn't cause mistakes, cut it」，並建議用 HTML 註解寫給人看的說明（執行時會被移除、不佔 token）。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE-template-2.md#L3-L5

### 11.2 角色設計
- **有，6 個子代理：**

| 角色 | 職責 | 工具／模型 | 檔案 |
|---|---|---|---|
| memory-bank-synchronizer | 記憶庫與程式碼同步、保留規劃與歷史 | 未限制工具 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/agents/memory-bank-synchronizer.md |
| code-searcher | 找程式碼、鑑識、資安追蹤，回報 file:line＋信心＋嚴重度 | sonnet | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/agents/code-searcher.md |
| codex-cli | 把問題轉給 Codex、只回原始輸出 | Bash／haiku | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/agents/codex-cli.md |
| zai-cli | 把問題轉給 GLM | Bash／haiku | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/agents/zai-cli.md |
| ux-design-expert | UX／UI／Tailwind／Highcharts 設計 | 未限制 | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/agents/ux-design-expert.md |
| get-current-datetime | 回傳布里斯本時間（讓紀錄有正確日期） | Bash, Read, Write | https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/agents/get-current-datetime.md |

- **交接（handoff）：部分有。** `consult-codex` 定義「主控 Claude → Codex＋code-searcher → 主控彙整」的派工與回收格式（`#L84-L395`），並要求 code-searcher「自己做，不准再分派子代理」（`#L216`）。但沒有「規劃者→實作者→審查者」這種開發流程的交接。
- **誰向誰負責：** 只有一層：主對話向使用者負責，子代理向主對話回報。沒有角色階層圖。

### 11.3 防漏
- **任務追蹤：部分有。** 沒有 backlog／issue 檔；記憶庫的 `CLAUDE-activeContext.md` 放「目前狀態與目標」，同步代理要保留 `CLAUDE-todo-list.md`（`memory-bank-synchronizer.md#L25-L26`，但 repo 沒給這個檔的範本）。`convert-to-todowrite-tasklist-prompt.md` 教你把長提示拆成 TodoWrite 任務清單。
- **完成前驗證：有。** `core-rules.md#L16-L19`：「Before declaring done: re-check requirements, run tests and lint, state what changed and what you could not verify」。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/rules/core-rules.md#L16-L19
- **交接紀錄：有。** `CLAUDE-history-template.md` 的 What／Why／Details／Outcome 四欄格式。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE-history-template.md#L70-L100

### 11.4 防重複
- **重複檔案／內容合併：有（人工觸發）。** `cleanup-context.md` 階段 2「同主題多檔→合併成 `-comprehensive`」，階段 3「CLAUDE.md 中與記憶庫重複的內容刪掉」。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/commands/cleanup/cleanup-context.md#L67-L98
- **重複規則偵測：有（限全域 vs 專案 CLAUDE.md）。** `detailed-audit.md` 的 `claudemd_duplication`。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/audit-session-metrics/references/detailed-audit.md#L171-L174
- **重複角色偵測：沒有。**
- **紀錄本身不重複：有。** 歷程範本規定改錯字、格式調整等不記、相關小改批次合成一筆。

### 11.5 防新舊版本衝突
- **單一事實來源：部分有。** 每類知識只有一個檔（patterns、decisions…），`cleanup-context` 要求合併後「每個主題在 CLAUDE.md 只留一個引用」（`#L150-L154`）。但 Claude 主記憶與 auto memory 是「刻意雙份」，兩份要靠人或 AI 手動同步，本身就有不一致的可能。
- **版本／日期標記：有（在合併檔）。** 合併檔頭 `Last Updated`、`Status`、`Coverage`（`cleanup-context.md#L239-L259`）；歷程檔名含日期與流水號。
- **變更提案／封存：只有封存。** `archive/` 目錄＋`archive/README.md` 索引（`cleanup-context.md#L100-L112`）；沒有「變更提案」流程。
- **過期（staleness／drift）偵測：有（由 AI 執行，非自動程式）。** `memory-bank-synchronizer` 逐條比對「文件說的 vs 程式碼實際」，並檢查交叉引用的檔案路徑是否還存在（`#L21`）；歷程範本要求每次記錄都問「這次改動有沒有讓文件過期」（`#L112`、`#L119`）。

### 11.6 定期巡檢
- **排程／每日巡讀：沒有。** 全 repo 搜 `cron`、`heartbeat`、`/loop`，只出現在 Convex 參考文件和官方文件路由表裡（`docs-index.md` 第 12–13 行指向官方的 scheduled tasks 文件），沒有實際排程設定。唯一的 hook 是 Stop 時發桌面通知（`settings.json`）。
- **建議頻率：有（文字建議）。** `cleanup-context.md#L223-L228`：每月找過期檔、每季找可合併的、每半年全面整理、大階段完成後加做一次；`#L230-L235` 列出「該重整」的警訊。
- **報告格式：有（同步代理）。** 以下是依 `memory-bank-synchronizer.md#L71-L85` 的欄位寫成的簡短範例（內容是我舉的例子）：

```
## 記憶庫同步報告 2026-11-04
### 技術更新
- CLAUDE-patterns.md：庫存扣減改為 Firestore transaction（原寫 batch）
- CLAUDE-config-variables.md：移除已刪除的 LOW_STOCK_LIMIT
### 已保留的策略內容
- CLAUDE-todo-list.md：盤點功能 Phase 2 規劃（保留）
- CLAUDE-activeContext.md：10/28 工作紀錄（保留）
### 準確度改善
- 修正 3 個已改名的檔案路徑
```

### 11.7 Skill 寫法
- **SKILL.md 格式：有。** frontmatter 至少有 `name`、`description`；進階欄位有 `allowed-tools`、`compatibility`、`metadata.tags`（`ai-image-creator/SKILL.md` 第 1–8 行）、`effort: low|medium`（`audit-session-metrics`、`session-metrics`）、`metadata.version`（`claude-docs-consultant`）。
- **description 怎麼寫才會被觸發：有範例。** 寫法是「做什麼＋何時用＋使用者可能說的原話」，例如 `session-metrics` 列出「how much have we spent」「show me token usage」等觸發句，並明寫**哪些情況不要觸發**（compare 模式只在第一個參數是字面 `compare` 時才走）。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/session-metrics/SKILL.md
- **資料夾結構：有。** `SKILL.md`（流程）＋`references/`（長篇參考，按需讀）＋`scripts/`（Python 腳本）＋`tmp/`（`.gitkeep`）。`claude-docs-consultant` 示範「SKILL.md 放常用路由、完整表放 references」的漸進揭露。
- **分工原則（值得抄）：有。** `task-breakdown/SKILL.md#L34-L39`：「數字由腳本負責，AI 只負責分組與標籤，不准自己加總金額」。這對你的比價、成本計算 skill 很重要。https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/task-breakdown/SKILL.md#L34-L39

### 11.8 支援哪些工具與安裝方式
- **Claude Code：原生。** 安裝＝把檔案複製到專案根目錄，第一次開 Claude Code 時跑 `/init`（README 第 23–25 行）；`session-metrics` 也可走外掛市集。
- **Codex：只當被呼叫的顧問**（需自行安裝 Codex CLI）；README 第 296–340 行提供 `cx()` 用 worktree 開 Codex 的 shell 函式。
- **Gemini CLI：** 有 `GEMINI.md`。**Cline：** 有 `.clinerules`。**Cursor：沒有。**
- **舊專案遷移：有。** 把 `CLAUDE-migrate-to-new-template.md` 當提示詞丟給 Claude。

### 11.9 可以直接借用到你「基礎架構」的檔案或段落
1. `.claude/rules/core-rules.md` 全文 → 改寫成你的 `AGENTS.md` 共通規則段（Codex、Claude 共讀）。
2. `CLAUDE-template-3.md` → 你的 `CLAUDE.md`，第一段改成「先讀 AGENTS.md」。
3. `CLAUDE-template-2.md#L77-L104` 的記憶庫檔案表＋讀取時機 → 你的 `docs/ai/` 目錄規劃。
4. `.claude/agents/memory-bank-synchronizer.md` → 每日巡讀的執行角色（保留規則第 23–45 行一定要留）。
5. `.claude/commands/cleanup/cleanup-context.md` → 每週／每月去重封存。
6. `CLAUDE-history-template.md#L27-L120` → 兩個 AI 共用的交接紀錄格式。
7. `.claude/skills/consult-codex/SKILL.md#L342-L395` 的比對表＋Corroborated／Solo／Disputed → 巡讀報告的「兩個 AI 意見比對」區塊。
8. `.claude/agents/code-searcher.md#L26-L28` → 任何審查角色都加上「找不到問題是有效結果」「先推翻再回報」。
9. `detailed-audit.md#L171-L174` 的 `claudemd_oversize`／`claudemd_duplication` → 巡讀清單中的「規則檔健檢」兩項。
10. `README.md#L450-L475` 的 `.worktreeinclude` → 讓兩個 AI 在不同 worktree 工作時也拿得到 `.env`（你的 Firebase 金鑰）。

---

## 關鍵字
centminmod、my-claude-code-setup、George Liu、CLAUDE.md、記憶庫、memory bank、auto memory、雙記憶、dual memory、漸進揭露、progressive disclosure、core-rules.md、.claude/rules、路徑範圍規則、CLAUDE-activeContext.md、CLAUDE-patterns.md、CLAUDE-decisions.md、ADR、memory-bank-synchronizer、記憶庫同步、cleanup-context、去重、封存、archive、comprehensive、CLAUDE-history、開發歷程、交接紀錄、漂移、drift、consult-codex、雙 AI 比對、Codex CLI、code-searcher、子代理、subagents、斜線指令、slash commands、SKILL.md、skills、hooks、git worktree、.worktreeinclude、GEMINI.md、.clinerules、AGENTS.md、claudemd_duplication、session-metrics、用量報表、ai-image-creator、商品圖、影片分析、巡讀、巡檢、MIT、Highcharts 非商業授權
