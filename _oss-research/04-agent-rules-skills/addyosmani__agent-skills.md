# addyosmani/agent-skills — 把資深工程師「從規格到上線」的流程寫成 25 個 AI Skill，Claude Code 與 Codex 共用同一份
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：301b02b
> GitHub：https://github.com/addyosmani/agent-skills｜⭐ 113212｜授權：MIT｜主要語言：JavaScript｜最近更新：2026-11-01

（本資料包所有程式碼位置都以 commit `301b02b12bff98e4688e6984af6556802322bbde` 為準；行號以該 commit 為準。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這是 Google 工程主管 Addy Osmani 整理的「AI 寫程式工作流程包」——25 個 `SKILL.md`（每個都是一套有步驟、有驗收條件的流程）、4 個審查角色（persona）、9 個斜線指令，同一個 `skills/` 資料夾同時給 Claude Code、Codex（GPT）、Gemini CLI、Cursor 等工具讀。

**對你（倉儲／庫存 Web App + 多 AI 協作）最有用的地方**：

1. **「共用規則」的範本**：它示範了 `AGENTS.md`（給 Codex 等工具）與 `CLAUDE.md`（給 Claude Code）怎麼分工、怎麼互相「指向單一事實來源」而不是各寫一份（見第 11 節）。你目前覺得亂，最直接可以抄的就是這套「規則檔只寫指標，細節放一個地方」的寫法。
2. **「角色」怎麼切**：它明確規定三層——Skill（怎麼做）／Persona（誰來看）／Command（什麼時候做），並且**禁止「角色呼叫角色」**、禁止做一個「總管路由角色」。這可以直接解決「好幾個 AI 互相轉述、越傳越走樣」的問題。
3. **「防漏」**：`tasks/plan.md` + `tasks/todo.md` 的任務格式（每項都有驗收條件、驗證指令、依賴關係、可能動到的檔案），加上 Definition of Done（完成定義）清單，以及「換對話前要寫下的 5 件事」交接清單。
4. **「防重複／防新舊衝突」的機器檢查**：倉庫裡有一組純 Node.js、零相依的驗證腳本——用 TF-IDF 餘弦相似度抓「兩個 skill 描述太像」（重複角色／重複規則）、比對 5 個設定檔版本號是否一致、比對 3 個工具資料夾的指令是否同步、檢查文件連結是否斷掉。這些腳本**正好是你每日巡讀（巡讀）工具的好底子**。
5. **跨模型互審**：`doubt-driven-development` 技能寫好了「Claude 寫完 → 用 `codex exec --sandbox read-only` 讓 GPT 以唯讀模式對抗式審查」的流程，以及結果怎麼分類合併，非常貼近你「GPT 和 Claude 有秩序合作」的需求。

**不適合的地方**：它沒有試算表、比價、ERP、影片相關內容；也**沒有排程式的每日巡讀**（沒有 cron／heartbeat），巡讀需要你自己用它的腳本組出來（第 10、11 節有具體建議）。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**（根目錄 [`LICENSE`](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/LICENSE) 第一行即 `MIT License`，`Copyright (c) 2025 Addy Osmani`；`.claude-plugin/plugin.json`、`.codex-plugin/plugin.json` 的 `license` 欄位也都是 `MIT`）。
- **個人使用**：完全自由，可複製、修改、塞進你自己的 `CLAUDE.md`／`AGENTS.md`／`.claude/skills/`。
- **公司商用**：也可以，包括改寫後放進公司內部專案或賣的產品裡。唯一義務是：**如果你散布（給別人）含有它大段內容的檔案，要保留原本的版權聲明與 MIT 授權文字**。只在自己公司內部使用、不對外散布，實務上幾乎沒有負擔。建議做法：在你借用的 skill 檔案底部加一行 `Adapted from addyosmani/agent-skills (MIT)`。
- **閉源／付費版**：本倉庫內沒看到任何付費功能或閉源模組。README 提到官網 `skills.addy.ie` 有互動教學（`docs/getting-started.md` 第 5–8 行），那是網站內容，不影響授權；是否有付費內容**未確認**。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 主體 | **Markdown 文件**（25 個 `SKILL.md`，合計 7,335 行；我用 `cat skills/*/SKILL.md \| wc -l` 計算） |
| 輔助程式 | Node.js 腳本（`scripts/` 底下 17 個 `.js` 檔，其中 9 個是 `*-test.js` 測試檔），全部只用 Node 內建模組（`fs`、`path`、`child_process`），**零外部相依**；CI 用 Node 24（`.github/workflows/test-plugin-install.yml` 第 17–20 行） |
| Hooks | Bash 腳本（`hooks/*.sh`），部分需要 `jq`、`curl` |
| 前端／後端／資料庫 | **沒有**。這不是應用程式，是「給 AI 讀的流程文件 + 驗證工具」 |
| 部署方式 | 以「外掛（plugin）」安裝到 AI 工具裡，或直接複製資料夾 |
| 硬體／GPU | 不需要 |
| API Key 與費用 | 本身不呼叫任何 API。費用只來自你原本就在用的 Claude Code／Codex 訂閱。唯一會花 token 的是選用的 Tier 3 行為評測（`node scripts/run-evals.js --behavioral <skill>`，會呼叫無頭 `claude -p`，見 `evals/README.md` 第 24–35 行），以及 `claude plugin eval`；兩者都不在 CI 裡跑 |

**安裝（只列我在 README 看到的指令，未實際執行）**：
- Claude Code：`/plugin marketplace add addyosmani/agent-skills` → `/plugin install agent-skills@addy-agent-skills`（[README.md#L72-L100](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/README.md#L72-L100)）
- Codex（v0.122+）：`codex plugin marketplace add addyosmani/agent-skills` → `codex plugin add agent-skills@agent-skills`（[README.md#L178-L190](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/README.md#L178-L190)）
- 任何工具：`npx skills add addyosmani/agent-skills`（或 `--skill code-review-and-quality` 只裝一個）（[README.md#L46-L68](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/README.md#L46-L68)）。注意：單裝一個 skill 時，不會帶到根目錄的 `references/` 共用清單（README 第 63–68 行明講，議題 #361 追蹤中）。

---

## 4. 程式架構地圖

（檔案總數 240，我用 `git ls-tree -r --name-only HEAD | wc -l` 計算；各類數量用 `grep -c` 對檔案清單計算。）

```
agent-skills/
├── skills/                      ← 核心：25 個技能，每個一個資料夾 + SKILL.md（跨工具共用）
│   ├── using-agent-skills/      ← 「元技能」：決策樹，決定該用哪個技能 + 6 條永遠適用的行為規範
│   ├── context-engineering/     ← 規則檔（CLAUDE.md 等）怎麼寫、換對話時怎麼交接
│   ├── planning-and-task-breakdown/ ← tasks/plan.md、tasks/todo.md 任務格式
│   ├── constraint-driven-development/ ← CONSTRAINTS.md 品質門檻 + 偵測 AI「偷偷降低標準」
│   │   ├── references/floor-guard.md   ← 參考實作（diff 掃描）
│   │   └── scripts/quality-gate.mjs    ← 讀 semgrep / axe 報告判斷是否擋下
│   ├── doubt-driven-development/ ← 對抗式審查 + 跨模型（Codex/Gemini）第二意見
│   ├── code-review-and-quality/  ← 五軸審查、嚴重度標籤、多模型審查模式
│   ├── documentation-and-adrs/   ← ADR（架構決策紀錄）含 Superseded 狀態
│   ├── deprecation-and-migration/ ← 淘汰舊系統、殭屍程式碼
│   ├── idea-refine/  (含 scripts/idea-refine.sh 與 3 個補充 md)
│   ├── performance-optimization/ security-and-hardening/ (各含 references/)
│   └── …其餘 15 個（interview-me、spec-driven、TDD、frontend-ui、api-design、debugging、git、ci-cd、shipping…）
├── agents/                      ← 4 個角色（persona）：code-reviewer / security-auditor / test-engineer / web-performance-auditor
├── references/                  ← 7 份跨技能共用清單（definition-of-done、orchestration-patterns、security、performance…）
├── .claude/
│   ├── commands/                ← 9 個 Claude Code 斜線指令（/spec /plan /build /test /review /ship …）
│   └── rules/skills-contributing.md ← 用 paths: 限定只在改 skills/** 時生效的規則
├── .gemini/commands/            ← 同 9 個指令的 Gemini TOML 版
├── commands/                    ← 同 9 個指令的 Antigravity TOML 版
├── .claude-plugin/              ← Claude Code 外掛 manifest + marketplace
├── .codex-plugin/plugin.json    ← Codex 外掛 manifest（指向同一個 ./skills/）
├── .agents/plugins/marketplace.json ← Codex marketplace 登記
├── .opencode/skills             ← 符號連結 → ../skills/（OpenCode 用，不複製檔案）
├── plugin.json                  ← 根 manifest（版本號的「單一事實來源」）
├── hooks/                       ← session-start（注入元技能）、sdd-cache（文件快取）、simplify-ignore
├── scripts/                     ← 驗證工具：skill-lint、版本一致、指令同步、連結、產出路徑、評測
├── evals/                       ← 25 個 cases/*.json（觸發測試）+ fixtures + 9 個 plugin 評測案例
├── docs/                        ← 17 份文件：各工具安裝、skill 格式規格、角色說明、導入指南、比較
├── AGENTS.md / CLAUDE.md        ← 只給「維護這個倉庫」的 AI 用，作者明講不要複製到你的專案
└── .github/workflows/test-plugin-install.yml ← CI：每次 push 跑全部驗證
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 技能自動路由（決定用哪個 skill） | [skills/using-agent-skills/SKILL.md#L12-L43](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/using-agent-skills/SKILL.md#L12-L43) | 一張 ASCII 決策樹：「不知道要什麼→interview-me」「有規格要拆任務→planning…」。另有 6 條永遠適用的行為（第 45–114 行）：講出假設、遇到矛盾就停下來問、該反駁就反駁、保持簡單、只動被要求的範圍、沒證據不算完成 |
| 技能格式規格 | [docs/skill-anatomy.md#L20-L42](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L20-L42) | frontmatter 只有 `name` + `description`；description 要「第三人稱說做什麼 + Use when 觸發條件」，≤1024 字元，**不要把流程步驟寫進 description**（AI 會照摘要做而不讀全文） |
| 角色（persona） | [agents/code-reviewer.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/agents/code-reviewer.md)、[docs/agents.md#L12-L22](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/agents.md#L12-L22) | 每個 persona 是一份系統提示：單一角色、單一輸出格式，結尾必有 `## Composition`（何時直接叫、由誰叫、不可被其他 persona 叫）——見 [agents/test-engineer.md#L91-L95](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/agents/test-engineer.md#L91-L95) |
| 平行審查 + 合併（/ship） | [.claude/commands/ship.md#L10-L73](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/commands/ship.md#L10-L73) | 同一回合同時派出 3 個子代理（code-reviewer、security-auditor、test-engineer），主代理合併、去重、輸出 GO/NO-GO + 回滾計畫；有 Critical 預設 NO-GO |
| 自動跑完整計畫（/build auto） | [.claude/commands/build.md#L28-L43](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/commands/build.md#L28-L43) | 先檢查有沒有 `SPEC.md`、`git status` 是否乾淨，只問一次核准，之後每個任務 紅→綠→迴歸→build→commit→打勾；遇到付款、刪除、權限、不可逆操作一定停下來問 |
| 規則檔／交接 | [skills/context-engineering/SKILL.md#L20-L78](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/context-engineering/SKILL.md#L20-L78)、[#L123-L137](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/context-engineering/SKILL.md#L123-L137) | 5 層情境（規則檔→規格→相關原始碼→錯誤輸出→對話紀錄）；換新對話前要寫下 5 件事（範圍與決策、目前任務狀態、改了哪些檔、驗證指令與結果、未解問題） |
| 品質門檻與「防 AI 偷降標準」 | [skills/constraint-driven-development/SKILL.md#L93-L141](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/constraint-driven-development/SKILL.md#L93-L141)、[#L209-L231](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/constraint-driven-development/SKILL.md#L209-L231) | `CONSTRAINTS.md`：Floor（底線）、有數字的門檻、只量測不強制、**例外表（含負責人與到期日）**；在 diff 裡抓 5 種「降標準」動作：門檻被調低、測試被 skip/刪除、加了 `eslint-disable`、留下空 `catch`/stub、例外表多一列 |
| 跨模型互審 | [skills/doubt-driven-development/SKILL.md#L114-L168](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/doubt-driven-development/SKILL.md#L114-L168) | 單模型審完後**必須詢問**使用者要不要找 Codex/Gemini 第二意見；只傳「成品 + 契約」，**不傳自己的結論**；用 stdin 傳 prompt、`codex exec --sandbox read-only`；非互動情境（排程、CI）一律跳過並要明講 |
| 結果合併分類 | [同檔 #L170-L193](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/doubt-driven-development/SKILL.md#L170-L193) | 審查意見依序分成：契約寫錯／有效且要改／有效但接受取捨／雜訊；最多 3 輪就停，交給人決定 |
| 技能靜態檢查 | [scripts/lib/skill-lint.js#L349-L486](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/lib/skill-lint.js#L349-L486) | 檢查 frontmatter、名稱=資料夾名、description 有沒有「Use when」、必要章節、超過 500 行警告、引用不存在的 skill 警告；豁免清單寫在驗證器裡（第 83–89 行），**不能讓檔案自己宣告豁免** |
| 重複偵測（描述撞車） | [scripts/run-evals.js#L136-L183](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L136-L183)、[#L411-L427](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L411-L427) | 每個 skill 的 name（加權 2 倍）+ description 做 TF-IDF 向量，兩兩算餘弦相似度：≥0.5 警告「overlap」、≥0.75 直接錯誤「collision」（門檻在第 59–60 行） |
| 版本一致性 | [scripts/validate-versions.js#L7-L32](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-versions.js#L7-L32) | 以 `plugin.json` 的 version 為準，比對其他 4 個 manifest，不一樣就失敗 |
| 多工具指令同步 | [scripts/validate-commands.js#L1-L20](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-commands.js#L1-L20) | `.claude/commands`、`.gemini/commands`、`commands/` 三處：每個指令都要存在、`description` 一字不差 |
| 產出路徑漂移 | [scripts/validate-artifact-paths.js#L1-L40](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-artifact-paths.js#L1-L40) | 只允許 `SPEC.md`、`docs/SPEC.md`、`tasks/plan.md`、`tasks/todo.md`；防止有人把 /spec 輸出位置改了但 /build 還在讀舊位置 |
| 斷鏈檢查 | [scripts/validate-reference-links.js#L1-L36](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-reference-links.js#L1-L36) | 所有 `references/*.md` 連結必須真的存在，連 `#錨點` 都要對到標題 |
| 觸發準確度評測 | [evals/README.md#L14-L22](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/evals/README.md#L14-L22)、[#L75-L117](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/evals/README.md#L75-L117) | 三層：結構（免費）／觸發與路由（免費、CI）／行為（花 token、手動）。每個 skill 至少 3 個「應觸發」、2 個「不應觸發」prompt |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 元技能決策樹 + 6 條行為規範 | [skills/using-agent-skills/SKILL.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/using-agent-skills/SKILL.md) | 無 | 低 | 把第 45–129 行「Core Operating Behaviors + Failure Modes」翻成中文，放進你的共用規則檔；決策樹改成你自己的角色（庫存開發、廣告文案、巡讀員…） |
| SKILL.md 格式規格 | [docs/skill-anatomy.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md) | 無 | 低 | 當你自己寫 skill 的模板與規範 |
| 角色三層模型與禁止事項 | [docs/agents.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/agents.md)、[references/orchestration-patterns.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/orchestration-patterns.md) | 無 | 低 | 直接採用「Skill/Persona/Command」三層與 4 個反模式（第 282–339 行）作為你多 AI 協作的憲法 |
| 平行審查合併指令 | [.claude/commands/ship.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/commands/ship.md) | Claude Code 子代理 | 低 | 改成你的「每日巡讀」：3 個唯讀角色平行讀專案 → 主代理合併去重 → 輸出固定格式報告 |
| 任務格式 + 不可覆寫未完成計畫 | [skills/planning-and-task-breakdown/SKILL.md#L79-L164](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/planning-and-task-breakdown/SKILL.md#L79-L164) | 無 | 低 | 讓 Claude 和 Codex 共用同一份 `tasks/todo.md`，防漏、防兩個 AI 互相蓋掉計畫 |
| 完成定義清單 | [references/definition-of-done.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/definition-of-done.md) | 無 | 低 | 改成適合 Firebase + 純 JS 的版本（例如「部署到預覽頻道後手動點過」） |
| CONSTRAINTS.md 範本 + 5 種降標準偵測 | [skills/constraint-driven-development/SKILL.md#L93-L240](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/constraint-driven-development/SKILL.md#L93-L240)、[references/floor-guard.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/constraint-driven-development/references/floor-guard.md) | git、Node | 中 | 例外表的「Expires 到期日」欄位可直接當「過期規則偵測」；floor-guard 參考碼需依你的專案調整 |
| 跨模型審查流程 | [skills/doubt-driven-development/SKILL.md#L87-L193](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/doubt-driven-development/SKILL.md#L87-L193) | Codex CLI、Claude Code | 低 | 直接當「Claude 寫、GPT 審」的標準作業 |
| skill-lint 靜態檢查器 | [scripts/lib/skill-lint.js](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/lib/skill-lint.js)、[scripts/validate-skills.js](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-skills.js) | Node（無外部套件） | 低 | 複製兩檔，把 `SKILLS_DIR` 指到你的 `.claude/skills`，`REQUIRED_SECTIONS` 改成你要的章節 |
| TF-IDF 重複偵測 | [scripts/run-evals.js#L59-L183](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L59-L183)、[#L411-L427](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L411-L427) | Node | 中 | 抽出 `tokenize/termFreq/buildCorpus/cosine` 約 120 行，改成對「規則檔每個段落」或「每份文件」兩兩比對，就是重複內容偵測器（注意：英文詞幹規則，中文需改成字元 n-gram 斷詞） |
| 版本一致檢查 | [scripts/validate-versions.js](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-versions.js) | Node | 低 | 34 行，改 `manifestPaths` 清單即可用來檢查你 App 的 `package.json`／`version.js`／`CHANGELOG` 版本是否一致 |
| 多份同義檔案同步檢查 | [scripts/validate-commands.js](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-commands.js) | Node | 中 | 概念可用於「CLAUDE.md 與 AGENTS.md 的某些段落必須一樣」 |
| SessionStart 注入 hook | [hooks/session-start.sh](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/hooks/session-start.sh) | bash、jq | 低 | 讓每次開新對話自動注入你的「今日巡讀摘要」或共用規則；輸出格式是標準 `hookSpecificOutput` JSON，Claude Code 與 Codex CLI 都接受（檔案註解第 10–12 行） |
| CI 工作流 | [.github/workflows/test-plugin-install.yml](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.github/workflows/test-plugin-install.yml) | GitHub Actions | 低 | 你的巡讀腳本做好後，照這個樣子每次 push 自動跑 |

---

## 7. AI／Claude 整合

- **用哪些模型**：Skill 本身不綁模型（`docs/skill-anatomy.md` 第 159–170 行「Write the Procedure, Not the Workaround」明確要求不要為特定模型寫特例）。評測紀錄裡提到他們用 Claude Code + 固定的 Claude 模型版本做行為評測（`evals/README.md` 第 65–73 行）。
- **Prompt 放在哪**：全部是 Markdown——`skills/*/SKILL.md`（流程）、`agents/*.md`（角色系統提示）、`.claude/commands/*.md`（指令）。Tier 3 評測時，`run-evals.js` 用 `--append-system-prompt "Follow this skill exactly:\n\n<SKILL.md>"` 把技能塞給無頭 `claude`（[scripts/run-evals.js#L627-L651](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L627-L651) 附近）。
- **Skills**：有，是本專案主體，符合 agentskills.io 規格（frontmatter 頂層只允許 `name`、`description`、`license`、`compatibility`、`metadata`、`allowed-tools`，見 [scripts/lib/skill-lint.js#L38-L52](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/lib/skill-lint.js#L38-L52)）。
- **MCP**：本倉庫沒有自帶 MCP 伺服器；`context-engineering` 推薦 Context7、Chrome DevTools、GitHub 等 MCP（[SKILL.md#L241-L251](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/context-engineering/SKILL.md#L241-L251)），`browser-testing-with-devtools` 依賴 Chrome DevTools MCP。
- **能不能換成 Claude**：本來就是 **Claude Code 原生**（`.claude-plugin/` 外掛、`.claude/commands/`、`agents/` 會被自動當成子代理）。同時也是 **Codex 原生**（`.codex-plugin/plugin.json` 指向同一個 `./skills/`）。
- **GPT（Codex）與 Claude 讀同一份**：關鍵設計是「技能只有一份」——Claude 透過 `.claude-plugin/plugin.json` 的 `"skills": "./skills"`，Codex 透過 `.codex-plugin/plugin.json` 的 `"skills": "./skills/"`，OpenCode 透過 `.opencode/skills` 符號連結。`docs/codex-setup.md` 第 3、33 行：「同一個根目錄 `skills/` 被 Claude Code 與 Codex 共用，沒有檔案被複製」。
- **重要提醒**（[docs/codex-setup.md#L27](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/codex-setup.md#L27)、[docs/getting-started.md#L43-L47](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/getting-started.md#L43-L47)）：Claude Code 和 Codex 都會自己依 description 挑 skill，**不要再把 `using-agent-skills` 全文貼進 `AGENTS.md`／`CLAUDE.md`**，否則等於有兩個路由器互搶。

---

## 8. 擴充方式與 API

- **新增 skill**：建 `skills/<小寫-連字號>/SKILL.md`，名稱必須等於資料夾名；需要腳本才加 `scripts/`，需要長參考資料（>100 行）才加 `references/`（[docs/skill-anatomy.md#L5-L18](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L5-L18)、[#L107-L116](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L107-L116)）。每加一個 skill 要同時加 `evals/cases/<name>.json`（≥3 正例、≥2 反例、≥1 行為評測），否則 CI 失敗（[evals/README.md#L115-L117](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/evals/README.md#L115-L117)）。
- **新增 persona**：`agents/<role>.md`，frontmatter 同格式，結尾必有 `## Composition`，並登記到 `docs/agents.md` 表格（[docs/agents.md#L117-L123](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/agents.md#L117-L123)）；驗證器會檢查 `name` = 檔名、Composition 必須是最後一節（[scripts/lib/skill-lint.js#L554-L586](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/lib/skill-lint.js#L554-L586)）。
- **各工具專屬設定**（模型、工具白名單、回合上限）：不要寫在 SKILL.md 頂層，要放在 `metadata` 底下或另外的轉接檔（例如 `.gemini/agents/*.md`），並建議用腳本從單一設定檔「產生」各工具版本，而不是手動維護多份（[docs/advanced-per-agent-configuration.md#L9-L22](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/advanced-per-agent-configuration.md#L9-L22)、[#L58-L66](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/advanced-per-agent-configuration.md#L58-L66)；文件自己註明這個產生器「尚未實作，只是提案」，第 70 行）。
- **Claude Code 專屬欄位**：`context: fork`（在隔離子代理跑）、`allowed-tools`（預先核准，不是限制）、`disallowed-tools`（真正的限制）——只放在你自己的本地副本（同檔第 24–32 行）。plugin 子代理可用欄位清單在 [references/orchestration-patterns.md#L162-L166](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/orchestration-patterns.md#L162-L166)（可用 `model` 分角色選模型）。
- **Hooks**：`hooks/SDD-CACHE.md` 示範 `PreToolUse`／`PostToolUse` 綁在 `WebFetch` 上的 `.claude/settings.json` 寫法（第 12–45 行）。
- **沒有程式 API**：它不是函式庫，沒有可 import 的 SDK；可重用的是 `scripts/lib/skill-lint.js` 匯出的 `lintSkill`、`lintPersona`、`parseFrontmatter`、`frontmatterYamlErrors`（第 628 行起的 `module.exports`）。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。最新 commit 時間 2026-11-01（`Merge #736: validate review findings against code and baseline`），三位維護者（README 第 396–404 行）。PR 編號已到 #736 以上，代表貢獻量大。
- **測試**：有完整 CI（`.github/workflows/test-plugin-install.yml`）：skill lint、版本一致、指令同步、產出路徑、連結、觸發評測（rank-1 準確率門檻 95%，第 38 行）、hook 回歸測試，並在 macOS／Windows 也跑（第 82–127 行），最後實際用 `claude plugin install` 測安裝（第 154–174 行）。我**沒有執行**任何測試，只讀程式碼。
- **資安／隱私**：
  - 沒看到任何遙測或回傳資料的程式碼（我 grep 了 `scripts/` 與 `hooks/`，網路存取只出現在 `hooks/sdd-cache-pre.sh` 對你原本要抓的文件網址發 `curl -sI` 重新驗證快取）。
  - Tier 3 評測用 `--permission-mode acceptEdits` 並預先核准 `Bash,WebFetch,WebSearch` 等工具（[scripts/run-evals.js#L47-L51](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L47-L51)），雖然是在拋棄式工作區，但仍會花 token、能跑指令——只在你了解的情況下手動跑。
  - 跨模型審查明確要求唯讀沙箱、prompt 走 stdin，避免審查內容裡的指令被執行（doubt-driven 第 153 行）。
  - `context-engineering` 有「信任等級」：設定檔、外部文件裡像指令的文字要當資料而非命令（第 98–103 行）——這點對你多 AI 互讀彼此輸出時很重要。
- **已知的坑**：
  1. 單裝一個 skill（`npx skills add … --skill`）時 `references/` 不會一起帶走，連結會失效（議題 #361）。
  2. `AGENTS.md`／`CLAUDE.md` 只是「維護此倉庫用」，作者明講不要複製到你的專案（`docs/getting-started.md` 第 56–59 行）。
  3. 觸發是機率性的：評測紀錄顯示同一句話有時觸發、有時不觸發，而且 Claude Code 版本更新後數字會變（`evals/README.md` 第 65、71 行）。所以「重要流程」不要只靠自動觸發，要用斜線指令明確叫。
  4. 全部是英文，且以一般 Web 工程（TypeScript、npm test）為例；你的 Firebase + 純 JS 專案要改寫指令與完成定義。
  5. 9 個斜線指令目前設定 `disable-model-invocation: true`（例：`.claude/commands/build.md` 第 3 行），只能由人手動呼叫。
  6. TF-IDF 斷詞與詞幹規則是針對英文寫的（`run-evals.js` 第 71–127 行），直接拿來比對中文內容效果會很差。

---

## 10. 跟其他專案組合的建議

針對你的「多 AI 有秩序協作 + 每日巡讀」，建議的 A＋B＋C 組法（這是我的建議，不是此倉庫的內容）：

1. **規則層（取自本倉庫）**：
   - 根目錄放一份 `AGENTS.md` 當**唯一共用規則**（Codex 讀它），`CLAUDE.md` 只寫一行「請先讀 `AGENTS.md`」再加 Claude 專屬補充。這跟本倉庫「CONTRIBUTING.md 是單一事實來源，其他檔只連結不重述」的做法一致（[CLAUDE.md#L37-L39](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/CLAUDE.md#L37-L39)、[AGENTS.md#L92](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/AGENTS.md#L92)）。
   - 技能放 `.claude/skills/`（或專案的 `skills/`），Codex 端用外掛或符號連結指向同一處——照它 `.opencode/skills → ../skills/` 的作法。
2. **角色層**：Claude =「實作者」（`/build`）、GPT/Codex =「唯讀審查者」（照 doubt-driven 的 `codex exec --sandbox read-only`）、另設「巡讀員」persona。遵守「角色不呼叫角色、人或指令才是指揮者」。
3. **任務層**：全部 AI 共用 `tasks/todo.md`，並採用「未完成計畫不可覆寫，要先問」規則。
4. **巡讀層（你需要自己組）**：把本倉庫的腳本概念組合成一支 `scripts/patrol.js`：
   - 重複偵測：改寫 `run-evals.js` 的 TF-IDF 餘弦（中文改字元 2-gram），比對所有規則／文件段落。
   - 版本衝突：改寫 `validate-versions.js`，比對 App 版本號、`CHANGELOG`、規則檔的 `Last reviewed` 日期。
   - 斷鏈：改寫 `validate-reference-links.js`。
   - 過期：解析 `CONSTRAINTS.md` 例外表的 `Expires` 欄位，過期就報。
   - 降標準：floor-guard 掃 diff。
   - 再用 Claude Code 的排程或 GitHub Actions `schedule:` 每天跑一次，輸出報告到 `reports/patrol-YYYY-MM-DD.md`，並用 `hooks/session-start.sh` 的方式在隔天開新對話時注入摘要。
5. **可搭配的其他專案**（本倉庫 `docs/comparison.md` 第 15–27 行提到）：`obra/superpowers`（子代理執行 + 任務審查、git worktree 隔離）與 `mattpocock/skills`（grill-me 需求訪談、issue tracker 串接）。若你還找到專門做規則同步的工具（例如把一份規則同步成 AGENTS.md／CLAUDE.md／.cursor/rules 的工具），可以接在「規則層」前面，本倉庫則提供角色與流程內容。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫

| 項目 | 狀態 | 位置與說明 |
|---|---|---|
| 檔案結構（AGENTS.md／CLAUDE.md／rules） | **有** | [AGENTS.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/AGENTS.md)（92 行）、[CLAUDE.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/CLAUDE.md)（60 行）、[.claude/rules/skills-contributing.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/rules/skills-contributing.md)。兩份規則檔開頭都有 **Scope 宣告**（AGENTS.md 第 5 行、CLAUDE.md 第 5 行）說明「這份只管哪裡」——很值得學。 |
| 分層（全域／專案／子資料夾） | **有（部分）** | `.claude/rules/skills-contributing.md` 第 1–5 行用 `paths: ["skills/**"]` 讓規則只在動到 `skills/` 時生效（子資料夾層）。全域層：`/ship` 說明 `.claude/agents/` 或 `~/.claude/agents/` 的同名 persona 會**優先於**外掛版本（[ship.md#L27](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/commands/ship.md#L27)）。沒有一張完整的「全域→專案→子資料夾」優先順序表，**未確認**更多。 |
| 優先順序 | **有（規則間）** | `using-agent-skills` 第 63–73 行：規格與現有程式碼衝突時「停下來問哪個優先」，不要自己挑；`context-engineering` 第 257–277 行有 `CONFUSION:` 回報範本。doubt-driven 第 112 行：對抗式 prompt 優先於 persona 預設格式。 |
| GPT（Codex）與 Claude 讀同一份 | **有** | 技能只有一份 `skills/`：[.claude-plugin/plugin.json](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude-plugin/plugin.json)（`"skills": "./skills"`）與 [.codex-plugin/plugin.json](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.codex-plugin/plugin.json)（`"skills": "./skills/"`）指向同一處；[docs/codex-setup.md#L29-L35](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/codex-setup.md#L29-L35) 說明。規則檔方面，`CONSTRAINTS.md` 範本要求在 `AGENTS.md` 和 `CLAUDE.md` 各加同一行「先讀 CONSTRAINTS.md」（[constraint-driven SKILL.md#L140](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/constraint-driven-development/SKILL.md#L140)）——也就是「規則放一份，兩個入口檔都指向它」。 |
| 規則不重述、只連結 | **有** | [AGENTS.md#L88-L92](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/AGENTS.md#L88-L92)、[CLAUDE.md#L37-L39](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/CLAUDE.md#L37-L39)：「CONTRIBUTING.md 是單一事實來源；不要在這裡或別處重述它的清單，連結過去」。 |

### 11.2 角色設計

| 項目 | 狀態 | 位置與說明 |
|---|---|---|
| 有哪些角色 | **有** | 4 個：`code-reviewer`（資深 Staff 工程師，五軸審查）、`security-auditor`（資安）、`test-engineer`（QA）、`web-performance-auditor`（網站效能）。[docs/agents.md#L5-L10](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/agents.md#L5-L10) |
| 職責與輸出格式 | **有** | 每個 persona 檔有審查框架與固定報告模板，例：[agents/code-reviewer.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/agents/code-reviewer.md)。「一個角色只有一個輸出格式，要第二個角色就另開檔」（[docs/agents.md#L99-L104](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/agents.md#L99-L104)）。 |
| 技能（skills） | **有** | persona 可以呼叫 skill（「誰」用「怎麼做」），三層定義在 [AGENTS.md#L70-L84](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/AGENTS.md#L70-L84)。 |
| 可用工具 | **有（說明）** | plugin 子代理可用 `tools`／`disallowedTools`／`model`／`maxTurns`／`skills` 等欄位（[orchestration-patterns.md#L162-L166](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/orchestration-patterns.md#L162-L166)）；但 4 個 persona 本身的 frontmatter 只寫了 `name`、`description`（我看了 code-reviewer.md 第 1–4 行）。 |
| 交接（handoff） | **有** | 換對話交接 5 項清單（[context-engineering#L123-L137](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/context-engineering/SKILL.md#L123-L137)）；跨 session 以檔案為準、不靠聊天紀錄（[docs/getting-started.md#L179-L200](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/getting-started.md#L179-L200)），內含兩段可直接複製的交接 prompt。 |
| 誰向誰負責 | **有** | 「使用者或斜線指令是指揮者；persona 不呼叫 persona；合併在主代理做」（[orchestration-patterns.md#L1-L5](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/orchestration-patterns.md#L1-L5)、[#L282-L339](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/orchestration-patterns.md#L282-L339) 四個反模式：路由角色、角色呼叫角色、會轉述的順序總管、深層角色樹）。persona 若發現別的問題，只能在報告裡「建議」後續審查。 |

### 11.3 防漏

| 項目 | 狀態 | 位置與說明 |
|---|---|---|
| 任務追蹤 | **有** | `tasks/plan.md` + `tasks/todo.md`，每個任務含驗收條件、驗證指令、依賴、可能動到的檔案、規模（[planning SKILL.md#L79-L104](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/planning-and-task-breakdown/SKILL.md#L79-L104)）；也可改用 GitHub Issues／Linear，但「不要兩邊都寫」（第 157–164 行）。 |
| 不可覆寫未完成計畫 | **有** | 同檔第 150–155 行：已有未勾選任務且是不同工作 → 停下來問，可能別的對話正在做。對多 AI 並行很關鍵。 |
| 完成前驗證 | **有** | 每個 skill 結尾必有 `## Verification`（lint 強制，[skill-lint.js#L75-L81](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/lib/skill-lint.js#L75-L81)）；全專案的 [definition-of-done.md#L17-L51](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/definition-of-done.md#L17-L51)；審查時「驗證作者的驗證」（code-review 第 197–207 行）。 |
| 交接紀錄 | **有** | 見 11.2；`/build auto` 每個任務獨立 commit + 更新任務狀態，作為可重啟的邊界（[build.md#L36](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/commands/build.md#L36)）。 |

### 11.4 防重複

| 項目 | 狀態 | 位置與說明 |
|---|---|---|
| 重複角色／重複技能偵測 | **有（自動）** | TF-IDF 餘弦相似度兩兩比對 skill 描述，≥50% 警告、≥75% 擋下（[run-evals.js#L411-L427](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L411-L427)）。 |
| 重複規則 | **有（規範）** | 「Never: Duplicate content between skills — reference other skills instead」（[CLAUDE.md#L60](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/CLAUDE.md#L60)）；跨技能共用清單集中在 `references/`，理由是「複製會隨時間漂移」（[skill-anatomy.md#L118-L126](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L118-L126)）。 |
| 新增前先查重 | **有** | `.claude/rules/skills-contributing.md`：新增 skill 前先搜目錄、查開放中的 PR，「優先擴充既有 skill，不要加近似重複」。 |
| 合併重複意見 | **有** | `/ship` 合併階段「Resolve duplicates between reviewers」（[ship.md#L33](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/commands/ship.md#L33)）。 |
| 重複程式碼／死碼 | **有** | code-review 的 Dead Code Hygiene：列出→**先問再刪**（第 235–251 行）；DoD「No duplicated business logic」。 |

### 11.5 防新舊版本衝突

| 項目 | 狀態 | 位置與說明 |
|---|---|---|
| 版本標記 | **有** | 5 個 manifest 統一版本 `0.6.15`，以 `plugin.json` 為準，CI 檢查（[validate-versions.js](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-versions.js)）。 |
| 單一事實來源 | **有** | 多處明示：skill 格式→`docs/skill-anatomy.md`；貢獻流程→`CONTRIBUTING.md`；各工具設定→`advanced-per-agent-configuration.md`（第 7 行「supersedes the earlier approach」）；產出路徑→`ARTIFACT_ALLOWLIST`。 |
| 變更提案／封存 | **有** | ADR 狀態 `Proposed | Accepted | Superseded by ADR-XXX | Deprecated`，**不刪舊 ADR**，新決策寫新 ADR 並註明取代哪一份（[documentation-and-adrs#L46-L56](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/documentation-and-adrs/SKILL.md#L46-L56)、[#L93-L100](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/documentation-and-adrs/SKILL.md#L93-L100)）；淘汰流程與殭屍程式碼（deprecation-and-migration 第 67–118、197–207 行）。 |
| 過期（staleness／drift）偵測 | **有（部分）** | 自動：3 個工具資料夾指令描述同步（`validate-commands.js`）、產出路徑漂移（`validate-artifact-paths.js`）、連結與錨點失效（`validate-reference-links.js`）。半自動：`CONSTRAINTS.md` 的 `Last reviewed` 日期與例外表 `Expires` 欄位（範本，**沒有腳本自動檢查到期**）。文件規範：DoD 要求「文件用現況描述，不寫變更歷史」（第 45 行）。網路文件：sdd-cache 每次重用都向來源伺服器重新驗證（`hooks/SDD-CACHE.md` 第 7–9 行）。 |

### 11.6 定期巡檢

| 項目 | 狀態 | 說明 |
|---|---|---|
| 排程／每日巡讀（cron、heartbeat） | **沒有** | 我 grep 了 `cron|schedule|daily|nightly|heartbeat`，只出現在「非互動情境要跳過互動步驟」等說明（例 doubt-driven 第 163 行、interview-me 第 36 行），沒有任何排程設定。CI 只在 `push`／`pull_request`／手動觸發時跑（workflow 第 3–6 行）。 |
| Hook | **有（非巡檢用）** | `hooks/session-start.sh`：開新對話注入元技能；作者註明**預設不接上**，只給沒有原生 skill 路由的工具用（第 5–8 行）。 |
| 報告格式 | **有（可借用）** | `/ship` 的 `## Ship Decision: GO | NO-GO` 模板（Blockers／Recommended fixes／Acknowledged risks／Rollback plan／Specialist reports），見 [ship.md#L44-L65](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/commands/ship.md#L44-L65)；code-review 的嚴重度標籤 Critical／(必改)／Nit／Optional／FYI（第 183–191 行）。 |

**依它的格式改寫成「每日巡讀報告」的簡短範例（我的建議，非倉庫原文）**：

```markdown
## 巡讀報告 2026-11-05：需處理 | 正常
### Critical（今天要修）
- [重複] AGENTS.md §出貨流程 ↔ docs/出貨.md 相似度 82%，兩邊規則不一致（扣庫存時機）
### 必改
- [新舊衝突] app/version.js = 1.4.2，CHANGELOG 最新 = 1.4.0
- [漏] tasks/todo.md Task 7 已勾選，但驗證欄「預覽頻道手動測試」沒有紀錄
### FYI
- [過期] CONSTRAINTS.md 例外 W1 已於 2026-11-01 到期
### 各巡讀員原始報告
- Claude（規則一致性）… / Codex（唯讀程式審查）…
```

### 11.7 Skill 寫法

| 項目 | 狀態 | 位置與說明 |
|---|---|---|
| SKILL.md 格式 | **有** | frontmatter `name`（=資料夾名、小寫連字號）+ `description`（≤1024 字元）；建議章節：Overview／When to Use／Process／Common Rationalizations／Red Flags／Verification（[skill-anatomy.md#L20-L80](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L20-L80)）。特色是 **Common Rationalizations 表**——列出 AI 想跳過步驟時的藉口和反駁。 |
| description 怎麼寫才會被正確觸發 | **有** | 「第三人稱說做什麼 + Use when…」，**不要寫流程摘要**（[skill-anatomy.md#L42](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L42)）；lint 用正規表達式檢查一定要有正向「Use when/before/after/during」（[skill-lint.js#L57-L70](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/lib/skill-lint.js#L57-L70)）。實測經驗（[evals/README.md#L65-L73](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/evals/README.md#L65-L73)）：加一句「即使程式碼直接貼在對話裡也適用」，code-review 的觸發率從 7/27 升到 21/27——**明確點名使用者實際會講的那句話**最有效。範例：[code-review-and-quality SKILL.md 第 3 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/code-review-and-quality/SKILL.md#L3)。 |
| 資料夾結構 | **有** | `SKILL.md` 必要；`scripts/`、`references/` 選用，**不要建空資料夾**；超過 100 行才拆補充檔；SKILL.md 控制在 500 行內（[skill-anatomy.md#L107-L136](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L107-L136)）。 |
| 腳本放哪 | **有** | `skills/<name>/scripts/`；bash 腳本規範：`set -e`、狀態訊息寫 stderr、機器可讀 JSON 寫 stdout、清理暫存檔（[skill-anatomy.md#L138-L147](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L138-L147)）；範例 [skills/idea-refine/scripts/idea-refine.sh](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/idea-refine/scripts/idea-refine.sh)。「用腳本比內嵌程式碼省 context」（第 135 行）。 |
| 寫給多模型的原則 | **有** | 「寫程序，不寫特定模型的權宜之計」：若某步驟必須點名某模型才說得通，就不該放進 skill（第 159–170 行）——對 GPT＋Claude 共用 skill 非常重要。 |

### 11.8 支援哪些工具與安裝方式

| 工具 | 狀態 | 方式（出處） |
|---|---|---|
| Claude Code | **有（原生外掛，推薦）** | `/plugin marketplace add addyosmani/agent-skills`；本地 `claude --plugin-dir`（README 第 72–100 行） |
| Codex | **有（原生外掛）** | `codex plugin marketplace add …` + `codex plugin add agent-skills@agent-skills`；用 `@skill-name` 呼叫；斜線指令與 persona 在 Codex 不可用（[docs/codex-setup.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/codex-setup.md)） |
| Cursor | **有** | skills 放 `.cursor/skills/`、短規則放 `.cursor/rules/*.mdc`，不要把整個 skill 貼進 rules（README 第 102–107 行） |
| Gemini CLI／Antigravity | **有** | `gemini skills install … --path skills`；`agy plugin install …` |
| OpenCode／Copilot／Copilot CLI／Windsurf／Kiro／Command Code | **有** | 各有 `docs/*-setup.md`；通用：`npx skills add addyosmani/agent-skills` |

### 11.9 可以直接借用到你「基礎架構」的檔案或段落

1. [skills/using-agent-skills/SKILL.md 第 45–129 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/using-agent-skills/SKILL.md#L45-L129) → 翻譯成你共用規則的「所有 AI 都要遵守的行為」。
2. [references/orchestration-patterns.md 第 1–115、282–357 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/orchestration-patterns.md#L1-L115) → 你的「多 AI 分工憲法」。
3. [docs/agents.md 第 99–123 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/agents.md#L99-L123) → 新增角色的 4 條規則與流程。
4. [.claude/commands/ship.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/commands/ship.md) → 改成 `/patrol` 每日巡讀指令（平行派出唯讀角色 + 合併 + 固定報告）。
5. [skills/planning-and-task-breakdown/SKILL.md 第 79–164 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/planning-and-task-breakdown/SKILL.md#L79-L164) → 共用 `tasks/todo.md` 格式 + 不可覆寫規則。
6. [skills/context-engineering/SKILL.md 第 38–78、123–137 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/context-engineering/SKILL.md#L38-L78) → `CLAUDE.md` 範本（技術棧／指令／慣例／邊界）+ 交接清單。
7. [references/definition-of-done.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/definition-of-done.md) → 改成 Firebase 版完成定義。
8. [skills/constraint-driven-development/SKILL.md 第 93–141 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/constraint-driven-development/SKILL.md#L93-L141) → `CONSTRAINTS.md`（含 Last reviewed、例外到期日）。
9. [skills/doubt-driven-development/SKILL.md 第 87–193 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/doubt-driven-development/SKILL.md#L87-L193) → 「Claude 寫、Codex 唯讀審」標準流程。
10. [skills/documentation-and-adrs/SKILL.md 第 46–100 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/documentation-and-adrs/SKILL.md#L46-L100) → 決策紀錄 + Superseded 機制，解決「哪邊新、哪邊舊」。
11. [scripts/lib/skill-lint.js](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/lib/skill-lint.js)、[scripts/run-evals.js 第 59–183、411–427 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L59-L183)、[scripts/validate-versions.js](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-versions.js)、[scripts/validate-reference-links.js](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/validate-reference-links.js) → 巡讀腳本的底子。
12. [hooks/session-start.sh](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/hooks/session-start.sh) → 開新對話時注入「昨日巡讀摘要」。
13. [.claude/rules/skills-contributing.md](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/.claude/rules/skills-contributing.md) → 用 `paths:` 限定範圍的規則寫法範例。
14. [docs/adoption-guide.md 第 73–116 行](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/adoption-guide.md#L73-L116) → 既有專案（你的倉儲 App）怎麼分 4 階段導入，避免一次全開。

---

## 關鍵字

agent-skills、Addy Osmani、SKILL.md、AGENTS.md、CLAUDE.md、Claude Code 外掛、Codex 外掛、Codex plugin、Claude Code plugin、共用規則、單一事實來源、single source of truth、角色、persona、子代理、subagent、Agent Teams、斜線指令、slash command、平行審查、fan-out、merge、/ship、/build auto、元技能、meta-skill、技能路由、skill routing、description 觸發、trigger eval、TF-IDF、餘弦相似度、重複偵測、routing collision、版本一致、validate-versions、指令同步、漂移偵測、drift、過期、staleness、ADR、Superseded、Definition of Done、完成定義、CONSTRAINTS.md、品質門檻、floor guard、防 AI 降標準、跨模型審查、cross-model review、doubt-driven development、對抗式審查、tasks/todo.md、任務追蹤、交接、handoff、context engineering、SessionStart hook、巡讀、巡檢、patrol、多 AI 協作、GPT、Claude、MIT
