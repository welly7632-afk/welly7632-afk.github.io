# AI 協作規則・角色・技能：總結（2026-11-04）

> 範圍：本資料夾 26 份資料包（`04-agent-rules-skills/*.md`，不含本檔）與 `cards/*.json` 中 `category` 為 `04-agent-rules-skills` 的卡片。本文只根據這些資料包整理，沒有另外 clone 或上網查證。資料包寫「未確認」或彼此說法不同的地方，本文直接標出來，不替你選邊。程式碼連結都照抄資料包的 permalink（固定在掃描當時的 commit）。資料包裡的「巡讀報告範例」大多是撰寫者依該 repo 格式改寫的建議，不是 repo 原文。

## 先講結論

1. **沒有一個專案能一次做完「共用規則＋角色分工＋每日巡讀」**。實際可行的是三層組合：①一份規則正本（`AGENTS.md`）；②5～6 個職責不重疊的角色，各配幾個 skills；③每日巡讀照「機械檢查先跑 → AI 唯讀巡讀 → 另一個 AI 複查 → 你拍板」的順序。卡片適合度給到 5 的只有 [ECC](affaan-m__ECC.md) 和 [wshobson/agents](wshobson__agents.md)，但兩份資料包都說「當零件庫挑著用，不要整包裝」。
2. **共用規則以 `AGENTS.md` 為唯一正本**。Codex 原生讀它（[agents.md](agentsmd__agents.md.md) 官網相容清單的第一個就是 Codex）。Claude Code 這邊有兩種接法：一是讓 `CLAUDE.md` 只寫 `@AGENTS.md` 加 Claude 專屬補充；二是用 symlink 讓兩個檔名指向同一份。[Backlog.md](MrLesk__Backlog.md.md)、[blockwatch](mennanov__blockwatch.md)、[wshobson/agents](wshobson__agents.md) 以 AGENTS.md 為實體；[mattpocock/skills](mattpocock__skills.md) 方向相反，以 CLAUDE.md 為實體。只用 Claude＋Codex 兩家時這樣就夠了。等工具變多（Cursor、Gemini…），再改用 [rulesync](dyoshikawa__rulesync.md) 或 [ruler](intellectronica__ruler.md)，從一個資料夾產生所有工具的規則檔，並在 CI 跑檢查，擋住有人手改產出檔。
3. **防新舊版本衝突，最有效的是一句話：「規則只寫一份，其他檔案只放指標；複製就會漂移」**（[spec-kit](github__spec-kit.md)、[addyosmani/agent-skills](addyosmani__agent-skills.md)、[agency-agents](msitarzewski__agency-agents.md) 都這樣寫）。其次是兩個習慣：一是舊內容不刪，標成「已被某某取代」（[living-docs-skill](ejklock__living-docs-skill.md)、VoltAgent 的 memory-curator、ADR 的 Superseded 狀態）；二是每份規則標上最後查證的日期或 commit（[BMAD](bmad-code-org__BMAD-METHOD.md) 的 `Verified <日期> against <SHA>`、[openai/skills](openai__skills.md) 的 `Docs last checked`）。
4. **每日巡讀沒有現成品**，市面上找不到「Claude＋Codex 每天讀整個專案」的成套工具。最接近的零件有五個：[docguard](raccioly__docguard.md) 能抓 AGENTS.md／CLAUDE.md 的重複、矛盾與過期指標（但規則抽取只認英文）；[blockwatch](mennanov__blockwatch.md) 做確定性的「A 改了 B 也要改」檢查；[paperclip](paperclipai__paperclip.md) 有夜間 lint 排程和增量巡讀 cursor；[superpowers](obra__superpowers.md) 有分析員報告格式；[anthropics/skills](anthropics__skills.md) 有 prompt-audit 稽核規則。各家排程多半是**每週**跑一次（ECC、rulesync、ruler、blockwatch、wshobson），要每天跑就得自己加排程。組合方式見第 4-6 節。
5. **角色分工有三條鐵則：實作者和驗收者要是不同的 AI；巡讀員只讀不改；最後由你拍板**。有角色設計的專案幾乎都有這三條，例如 [OpenSpec](Fission-AI__OpenSpec.md)、agency-agents、superpowers，以及 rulesync 的「GPT 先審、Claude 逐條查證」。角色挑 5～6 個就好，不要把 166／202／283 個角色整包裝進來。
6. **交接靠檔案，不靠聊天紀錄**。做法是「任務檔＋只能追加的交接帳本」，並規定下一個 AI 開工前要重新從磁碟讀檔（OpenSpec、BMAD、superpowers、Backlog.md 都這樣做）。多個 AI 同時工作時，還要加一條：「不准還原或覆蓋別的 AI 還沒提交的修改」（Backlog.md 的 AGENTS.md）。
7. **Skill 會不會被叫到，取決於 description**。寫法是「Use when…」加上使用者真的會講的話，要放繁中觸發詞（例如「巡讀」「新舊版本」）；**不要在 description 裡摘要流程**。superpowers 實測過：description 一摘要流程，AI 就只照摘要做、不讀本文。專案層的技能，Claude Code 放 `.claude/skills/`，Codex 放 `.agents/skills/`；Codex 個人層的路徑，資料包說法不一致（見第 5 節）。
8. **授權大致安全**，26 個裡多數是 MIT。要注意的有六項：
   - [anthropics/skills](anthropics__skills.md) 的 docx／pdf／pptx／xlsx 是專有授權，不可複製改寫。
   - [openai/skills](openai__skills.md) 的 Figma 相關技能不要商用。
   - BMAD 名稱是商標。
   - [centminmod](centminmod__my-claude-code-setup.md) 附的 Highcharts 商用要另外買授權。
   - Apache-2.0 的專案（graphify、codument、wshobson 部分外掛）散布時要附 NOTICE。
   - OpenSpec CLI 與 paperclip 預設開啟遙測，可以關掉。
9. **繁中支援普遍薄弱**。docguard 的規則抽取、agency-agents 的重複偵測腳本都以英文斷詞；[memory-checkup](Thomaszhou22__memory-checkup.md) 的數字關鍵字寫死簡體（`下载`、`用户`），台灣寫的「下載」「用戶」比對不到；[pm-review-copilot](wikiiizhao__pm-review-copilot.md)、[majiu-management](majiabin2020__majiu-management.md) 則是簡體中文。拿來用時，觸發詞、報告格式與比對邏輯都要改成繁體。

**建議導入順序**：
- 第 1 步：寫 `AGENTS.md`，搭配 `CLAUDE.md`、任務檔、交接帳本。
- 第 2 步：定 5～6 個角色。
- 第 3 步：做 `daily-patrol` skill，先上機械檢查，再加 AI 唯讀報告。
- 之後再視情況加：工具超過兩家就上 rulesync／ruler；功能規格常打架就上 OpenSpec。

最小資料夾結構如下（綜合各資料包，不是任何單一 repo 原文）：

```
你的倉儲專案/
├── AGENTS.md                  ← 唯一規則正本：優先順序、角色、交接、完成定義、禁區
├── CLAUDE.md                  ← 只寫 @AGENTS.md ＋ Claude 專屬補充（或 symlink）
├── docs/ai/
│   ├── TASKS.md               ← 任務：負責 AI、狀態、驗收條件、驗證方式（或改用 Backlog.md）
│   ├── handoff.md             ← 只追加的交接帳本
│   ├── decisions.md           ← 決策：現行／superseded by …
│   └── patrol/YYYY-MM-DD.md   ← 每日巡讀報告
├── .agents/skills/<名稱>/SKILL.md   ← 技能正本（Codex 讀）
├── .claude/skills → .agents/skills  ← 讓 Claude 讀同一份
├── .claude/agents/*.md、.codex/agents/*.toml  ← 角色（同一內容、兩種格式）
└── scripts/patrol/            ← 巡讀用的確定性檢查腳本
```

---

## 1. 26 個專案比較表

「類型」用七類標記：規則標準、規則同步、技能庫、角色庫、開發方法、任務追蹤、巡檢與漂移偵測。「Claude Code」欄取自卡片的 `claude_support`；「Codex」欄依資料包第 11 節的支援說明整理。適合度沿用卡片的 `fit_for_user`（1–5 分）。

### 1-1 規則標準與規則同步

| 專案 | 類型 | Claude Code | Codex | 授權重點 | 適合度 | 對你最有用的部分 |
|---|---|---|---|---|---|---|
| [agents.md](agentsmd__agents.md.md) | 規則標準 | 可接（官網沒列 Claude，要靠 `@AGENTS.md` 或 symlink） | 原生 | 程式碼 MIT、文件 CC BY 4.0；自己寫 AGENTS.md 不受限 | 4 | 檔名標準、「最近的 AGENTS.md 優先」 |
| [rulesync](dyoshikawa__rulesync.md) | 規則同步 | 原生 | 原生 | MIT | 4 | 一份 `.rulesync/` 產生 70 種工具設定；`generate --check` |
| [ruler](intellectronica__ruler.md) | 規則同步 | 原生 | 原生 | MIT | 4 | `.ruler/` 同步 32 種工具；每週文件巡檢 workflow |
| [graphify](Graphify-Labs__graphify.md) | 規則同步＋巡檢與漂移偵測 | 原生 | 原生 | Apache-2.0（附 NOTICE；名稱是商標） | 3 | skillgen 片段單一來源＋`--check`；專案知識圖譜 |

### 1-2 開發方法

| 專案 | 類型 | Claude Code | Codex | 授權重點 | 適合度 | 對你最有用的部分 |
|---|---|---|---|---|---|---|
| [spec-kit](github__spec-kit.md) | 開發方法 | 原生 | 原生 | MIT | 4 | constitution 範本、`analyze` 一致性稽核、AGENTS.md／CLAUDE.md 受管區塊 |
| [OpenSpec](Fission-AI__OpenSpec.md) | 開發方法 | 原生 | 原生（`.agents/skills/`） | MIT；CLI 預設匿名遙測 | 4 | specs／changes／archive 解決新舊衝突；verify 報告 |
| [BMAD-METHOD](bmad-code-org__BMAD-METHOD.md) | 開發方法＋角色庫 | 原生 | 原生（`.agents/skills/`） | MIT；BMad 是商標 | 4 | AGENTS.md 該寫／不該寫、出處行、狀態寫入權限 |
| [superpowers](obra__superpowers.md) | 開發方法＋技能庫 | 原生 | 原生（Codex App／CLI 外掛） | MIT（內附一份 Anthropic 文件，授權未確認） | 4 | 控制者／實作者／審查者分工、完成前驗證、寫 skill 的方法 |

### 1-3 技能庫

| 專案 | 類型 | Claude Code | Codex | 授權重點 | 適合度 | 對你最有用的部分 |
|---|---|---|---|---|---|---|
| [anthropics/skills](anthropics__skills.md) | 技能庫（Anthropic 官方） | 原生 | 未確認 | 混合：14 個 Apache-2.0；docx/pdf/pptx/xlsx 專有 | 4 | skill-creator、prompt-audit 稽核規則 |
| [openai/skills](openai__skills.md) | 技能庫（OpenAI 官方） | 可接 | 原生 | 混合：多數 Apache-2.0；Figma 類別勿商用；README 已宣告 deprecated | 4 | Claude↔Codex 差異對照表、SKILL.md 驗證器 |
| [addyosmani/agent-skills](addyosmani__agent-skills.md) | 技能庫（含 4 角色） | 原生 | 原生（斜線指令與角色在 Codex 不可用） | MIT | 4 | 同一份 `skills/` 供兩家外掛；技能描述相似度檢查 |
| [mattpocock/skills](mattpocock__skills.md) | 技能庫（含角色） | 原生 | 原生 | MIT | 4 | symlink 共用規則、handoff、兩種 description 寫法 |
| [ECC](affaan-m__ECC.md) | 技能庫＋角色庫＋巡檢與漂移偵測 | 原生 | 原生（`.codex/AGENTS.md`） | MIT；付費託管版非必要 | **5** | 規則分層、`audit-docs.py`、skill-stocktake、週排程範本 |
| [centminmod/my-claude-code-setup](centminmod__my-claude-code-setup.md) | 技能庫（Claude 設定與記憶庫範本） | 原生 | 只當被呼叫的顧問 | MIT；附的 Highcharts 商用要付費 | 4 | 記憶庫同步代理、去重封存、Claude 與 Codex 意見比對 |

### 1-4 角色庫

| 專案 | 類型 | Claude Code | Codex | 授權重點 | 適合度 | 對你最有用的部分 |
|---|---|---|---|---|---|---|
| [VoltAgent/awesome-claude-code-subagents](VoltAgent__awesome-claude-code-subagents.md) | 角色庫（166 個） | 原生 | 姊妹 repo 的 `.toml`，內容不同步 | MIT | 4 | memory-curator、docs-drift-editor、ponder-auditor |
| [agency-agents](msitarzewski__agency-agents.md) | 角色庫（283 個） | 原生 | 轉成 TOML | MIT | 4 | Codebase Archaeologist 巡讀員、交接單、「不負責什麼」欄 |
| [wshobson/agents](wshobson__agents.md) | 角色庫＋技能庫＋巡檢與漂移偵測 | 原生 | 原生（技能外掛；角色走產生器） | MIT（conductor、superself 是 Apache-2.0） | **5** | `doc_gardener` 漂移巡檢、team-lead／team-reviewer |

### 1-5 任務追蹤

| 專案 | 類型 | Claude Code | Codex | 授權重點 | 適合度 | 對你最有用的部分 |
|---|---|---|---|---|---|---|
| [Backlog.md](MrLesk__Backlog.md.md) | 任務追蹤 | 原生 | 原生（AGENTS.md 區塊＋MCP） | MIT | 4 | Markdown 任務板、`backlog doctor`、事實優先順序 |
| [paperclip](paperclipai__paperclip.md) | 任務追蹤＋巡檢與漂移偵測 | 原生 | 原生 | MIT；遙測預設開 | 4 | routine 排程（預設暫停）、增量巡讀、wiki-lint 報告 |

### 1-6 巡檢與漂移偵測

| 專案 | 類型 | Claude Code | Codex | 授權重點 | 適合度 | 對你最有用的部分 |
|---|---|---|---|---|---|---|
| [docguard](raccioly__docguard.md) | 巡檢與漂移偵測 | 原生 | 原生（AGENTS.md 鏈、`.agents/skills`） | MIT | 4 | `verify --instructions`、`agents --check`、排程 AI 守則 |
| [blockwatch](mennanov__blockwatch.md) | 巡檢與漂移偵測（確定性） | 原生 | 經 AGENTS.md 的 stub | MIT | 4 | `same-as`／`affects`／`keep-unique` 規則、週排程 |
| [codument](jakubsuplicki__codument.md) | 巡檢與漂移偵測＋開發方法 | 原生 | 可攜（`--agents codex,claude`） | Apache-2.0 | 4 | 文件登記表漂移、實作→審查→提交關卡 |
| [living-docs-skill](ejklock__living-docs-skill.md) | 巡檢與漂移偵測（決策紀錄） | 原生 | 原生（`--harness codex`） | MIT（另含 Apache-2.0 規格檔）；作者說仍是實驗 | 3 | 五條不漂移原則、取代橫幅、重號檢查 |
| [pm-review-copilot](wikiiizhao__pm-review-copilot.md) | 巡檢與漂移偵測（記憶生命週期） | 可接（未確認） | 原生（`~/.codex/skills/`） | MIT；簡體；4 個月未更新 | 4 | 生命週期狀態、過期門檻、交接筆記 |
| [memory-checkup](Thomaszhou22__memory-checkup.md) | 巡檢與漂移偵測（記憶健檢） | 原生 | 未確認 | MIT；1 顆星、已停更 | 3 | 只讀健檢腳本：過期數字、斷引用、日誌斷檔、孤兒檔 |
| [majiu-management](majiabin2020__majiu-management.md) | 巡檢與漂移偵測（工作空間治理） | 可接（未實測） | 未確認 | MIT；簡體；WorkBuddy 專用 | 3 | 台帳狀態機、只讀巡檢報告、「建排程前要人同意」 |

---

## 2. 共用規則怎麼寫：各家做法比較與最佳實踐

### 2-1 讓 Claude 和 Codex 讀同一份：五種做法

| 做法 | 誰在用 | 好處 | 坑 |
|---|---|---|---|
| A. 兩個檔名用 symlink 指向同一份 | 以 AGENTS.md 為實體、CLAUDE.md 為 symlink：Backlog.md（[CLAUDE.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/CLAUDE.md)）、blockwatch（[AGENTS.md#L1-L4](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L1-L4)）、wshobson（[AGENTS.md#L7](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/AGENTS.md#L7)）。方向相反（AGENTS.md 指向 CLAUDE.md）：mattpocock，以及 openai 的轉換器——後者只在 CLAUDE.md 內容中性時才建 symlink（[instructions.py#L24-L57](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/scripts/migrate/instructions.py#L24-L57)） | 真正只有一份 | 沒地方放 Claude 專屬內容；Windows 上 symlink 常出問題 |
| B. `CLAUDE.md` 只寫 `@AGENTS.md`，再加 Claude 補充 | BMAD 會「提議並驗證」這行匯入（[set-and-maintain-project-context.md#L64-L72](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/existing-codebases/set-and-maintain-project-context.md#L64-L72)）；docguard 的 [CLAUDE.md](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/CLAUDE.md) 寫「Follow AGENTS.md」 | 可以放 Claude 專屬內容 | 規則檔裡的 `@` 引用，Codex 會不會展開未確認；superpowers 的移植文件（第 280–286 行）提醒不要假設 `@` 一定會展開，要用獨特字串實測有沒有真的載入 |
| C. 受管區塊：標記之間由工具改寫 | Backlog（[cli.ts#L5286-L5358](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/cli.ts#L5286-L5358)）、spec-kit（[agent-context-config.yml#L8-L24](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/extensions/agent-context/agent-context-config.yml#L8-L24)）、codument（[init.ts#L153-L162](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/commands/init.ts#L153-L162)）、BMAD（[AGENTS.md#L1-L35](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/AGENTS.md#L1-L35)）、graphify（[install.py#L871-L925](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/install.py#L871-L925)） | 標記外歸你、標記內歸工具 | 兩個檔案各有一份區塊內容，要靠工具重寫 |
| D. 單一來源資料夾＋產生器 | rulesync（[claudecode-rule.ts#L66-L77](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/claudecode-rule.ts#L66-L77)、[codexcli-rule.ts#L10-L35](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/codexcli-rule.ts#L10-L35)）、ruler（[README.md#L131-L145](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/README.md#L131-L145)）、docguard `agents --sync`（[agents.mjs#L56-L92](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/commands/agents.mjs#L56-L92)） | 工具再多也只改一處；CI 擋手改 | 多學一個工具；ruler 產生的 `CLAUDE.md` 沒有「Generated」標記 |
| E. 只放 `AGENTS.md`，不建 `CLAUDE.md` | paperclip 根目錄沒有 CLAUDE.md；rulesync 文件說「沒有 CLAUDE.md 時 Claude 會讀 AGENTS.md」（[file-formats.md#L254](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/reference/file-formats.md#L254)），docguard 也這樣記載 | 最省事 | agents.md 官網沒列 Claude Code，這個行為只在兩份資料包裡看到；rulesync 資料包推論此法可能讓 Claude 讀到同一條規則兩次（未實測），**建議仍用 A 或 B** |

### 2-2 分層與優先順序

| 層 | Claude Code | Codex | 備註 |
|---|---|---|---|
| 個人（全域） | `~/.claude/CLAUDE.md`、`~/.claude/rules/` | `~/.codex/AGENTS.md` | rulesync `--global` 會寫到這兩處（[global-mode.md](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/guide/global-mode.md)） |
| 專案 | `CLAUDE.md`、`.claude/rules/*.md`（用 `paths:` 限定路徑） | `AGENTS.md`，有 32 KiB 上限 | 上限見 rulesync（[instruction-budget.ts#L63-L86](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/instruction-budget.ts#L63-L86)）、wshobson（[harnesses.md#L23-L45](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/docs/harnesses.md#L23-L45)） |
| 子資料夾 | 讀到該資料夾的檔案時才載入（centminmod [CLAUDE-template-2.md#L136-L151](https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE-template-2.md#L136-L151)） | 巢狀 `AGENTS.md`，越近越優先；`AGENTS.override.md` 取代同層（docguard 資料包；各工具的載入順序見 [instruction-scopes.mjs#L9-L21](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/scanners/instruction-scopes.mjs#L9-L21)） | BMAD 提醒：不少工具只在 session 開始時讀一次規則，子資料夾規則可能讀不到，所以先在根檔寫「in `src/xxx/`: …」（[best-practices.md#L49-L55](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/references/best-practices.md#L49-L55)） |
| 個人覆寫 | `CLAUDE.local.md`（不進 git） | — | — |

值得照抄的優先順序寫法：
- **agents.md**：使用者在對話中的指示 ＞ 最近的 AGENTS.md ＞ 上層 AGENTS.md（[FAQSection.tsx#L18-L21](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L18-L21)）。
- **superpowers**：使用者指示（含 CLAUDE.md／AGENTS.md）＞ skill ＞ 預設行為（[using-superpowers#L63-L65](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/using-superpowers/SKILL.md#L63-L65)）；執行時規格最高，計畫次之，自己的判斷只拿來補兩者都沒寫的地方（[executing-plans#L32-L37](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/executing-plans/SKILL.md#L32-L37)）。
- **Backlog.md**：實作事實以 package.json 等設定檔為準；說明與事實不符時，要回報為過期；現行程式碼不能凌駕已核准的需求與憲法（[AGENTS.md#L14-L19](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L14-L19)）。
- **ECC**：模組規則只能再加限制，「Local rules cannot waive project-wide constraints」（[module-governance](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/module-governance/SKILL.md)）。
- **BMAD**：兩條都有效、卻互相矛盾的規則，本身就是缺陷，要提出修正，不是挑一條來用。
- **anthropics/skills prompt-audit**：範圍較窄的檔案若說明自己覆寫哪一條，就不算衝突；同一層互相矛盾才算衝突，並用 `git blame` 判斷哪條較新（[prompt-audit.md#L147](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L147)）。

### 2-3 constitution（專案憲法）

- **spec-kit**：憲法有三個配套。一是 SemVer 版本號；二是批准日（Ratified）與最後修訂日（Last Amended），見 [constitution.md#L96-L104](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L96-L104)；三是每次修改都附 Sync Impact Report（[#L112-L119](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L112-L119)）。analyze 指令把違反憲法列為 CRITICAL，並規定「要改的是規格，不是稀釋原則」（[analyze.md#L60](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L60)）。
- **Backlog.md**：[MANIFESTO.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/MANIFESTO.md) 每次對話都要先讀。遇到衝突要問人，不准順手改憲法。
- **living-docs**：[constitution 範本](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/templates/constitution.md#L1-L51)批准後，只能在 Amendment Log 裡追加。

**對你的建議**：倉儲 App 的憲法寫 5～10 條不可違反的事就夠了，例如「AI 不得部署正式環境」「庫存異動一律留紀錄」「金額單位統一」。這幾條放在 AGENTS.md 最上面，並加上版本號與修訂紀錄。

### 2-4 該寫什麼、不該寫什麼

- **BMAD 的取捨原則**：
  - 該寫：程式碼表達不了的政策、與預設不同的慣例、**有實際證據的陷阱**、跨元件規則。
  - 不該寫：目錄樹、技術棧清單、交給 linter 就能管的風格、空話、貼上的程式碼、歷史敘述。
  - 刪規則只有四種理由：過期（附證據）、已改由機械檢查強制、與其他規則衝突且輸了、使用者同意。「最近沒出事」不算理由。
- **長度**：
  - centminmod：「200 行內；刪掉一行不會出錯，就刪掉」（[CLAUDE-template-2.md#L3-L5](https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/CLAUDE-template-2.md#L3-L5)）。
  - wshobson：規則檔只當「地圖」，150 行以內。
  - spec-kit：自己的 [AGENTS.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/AGENTS.md#L1-L76) 只有 76 行，每段都是「做 X 之前，先讀 Y」。
- **寫法**：
  - agents.md 範例採「禁令＋理由＋替代做法」（[AGENTS.md#L1-L43](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/AGENTS.md#L1-L43)）。
  - ruler 要每個 AI 用不同的 commit author（[.ruler/AGENTS.md](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/.ruler/AGENTS.md)），巡讀時一眼就看出是誰改的。
- **什麼放哪裡**：openai/skills 的 Surface Map（[SKILL.md#L86-L100](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/openai-docs/SKILL.md#L86-L100)）是這樣分的：
  - 一次性要求 → 對話裡講。
  - 長期規則 → AGENTS.md。
  - 可重複的流程 → skill。
  - 要機械式強制 → hook。
  - 要定時跑 → 排程（automation）。
  
  BMAD 的說法也一樣：能用 hook／lint／CI 擋的，就不要寫成文字規則。

### 2-5 整理給你的做法

1. **一條規則只寫在一處**：AGENTS.md 當正本，CLAUDE.md 只放 `@AGENTS.md` 與 Claude 專屬補充。同一條規則不要出現在兩個都會被載入的檔案裡（BMAD）。
2. **第一段寫優先順序**，並加一句：「規則互相矛盾時不准自己挑，寫進待決定清單」。
3. **每份規則檔頂端標三樣**：狀態、最後確認日期、對應的 commit。
4. **AI 工具的本機設定不當規則來源**：未來協作者需要知道的，都寫進 AGENTS.md（blockwatch [AGENTS.md#L273-L295](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L273-L295)）。
5. **多 AI 必備的三條規則**：
   - 交接時要重新從磁碟讀檔，即使之前看過（OpenSpec [instructions.ts#L258-L300](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/commands/workflow/instructions.ts#L258-L300)）。
   - 保留其他 AI 還沒提交的修改，不准還原或重排（Backlog [AGENTS.md#L167-L176](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L167-L176)）。
   - 「調查或審查」的請求只授權分析，不授權實作（Backlog [AGENTS.md#L14-L37](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L14-L37)）。
6. **出現第三個 AI 工具時**，才導入 rulesync 或 ruler，並在 CI 加 `generate --check` 或 diff 檢查（rulesync 的守門組合見 [faq.md#L126-L142](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/faq.md#L126-L142)）。

---

## 3. 角色與技能：各家角色對照，以及適合你的角色編制

### 3-1 各家角色清單對照

| 專案 | 角色（摘要） | 最值得抄的設計 |
|---|---|---|
| [superpowers](obra__superpowers.md) | 控制者、實作者、任務審查者、重審者、最終審查者、建造者檢查、7 個分析員 | 控制者不准自己修程式；實作者不准再派子代理；所有裁決都要交給人：「沒交出去的裁決＝秘密做的決定」（[final-review.md#L33-L42](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/final-review.md#L33-L42)） |
| [BMAD](bmad-code-org__BMAD-METHOD.md) | 分析師、PM、PO、架構師、UX、開發者（各有人名） | 狀態寫入權限：`done` 只有使用者或協調器能標，`dropped` 只有 PO 在你同意時能標（[ticket-tree-rules.md](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/tools/ticket-tree-rules.md#L1-L49)） |
| [agency-agents](msitarzewski__agency-agents.md) | 283 個；指揮鏈為 Orchestrator → Producer／Shepherd／Senior PM → 各部門（[nexus-strategy.md#L95-L116](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/strategy/nexus-strategy.md#L95-L116)） | 角色規格書有「NOT RESPONSIBLE FOR」欄（[#L392-L423](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/engineering/engineering-multi-agent-systems-architect.md#L392-L423)），最能防兩個 AI 搶同一件事 |
| [addyosmani](addyosmani__agent-skills.md) | code-reviewer、security-auditor、test-engineer、web-performance-auditor | 角色不呼叫角色，合併在主代理做；列出四種反模式（[orchestration-patterns.md#L282-L339](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/orchestration-patterns.md#L282-L339)）；一個角色只有一種輸出格式 |
| [ECC](affaan-m__ECC.md) | 71 個，例如 planner、architect、code-reviewer、doc-updater、refactor-cleaner | 14 個角色完全沒有寫入工具；有「委派完成契約」（[agents.md#L51-L59](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/rules/common/agents.md#L51-L59)） |
| [VoltAgent](VoltAgent__awesome-claude-code-subagents.md) | 166 個，例如 memory-curator、context-manager、docs-drift-editor、surgeon-reviewer | 新式角色有固定段落（[context-manager.md#L10-L94](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/context-manager.md#L10-L94)）；共用檔盡量只有一個寫入者（[multi-agent-coordinator.md#L29-L50](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/multi-agent-coordinator.md#L29-L50)） |
| [wshobson](wshobson__agents.md) | 202 個，例如 team-lead、team-reviewer、conductor-validator、session-start／end | 隊員的計畫要送 lead 核准（[team-lead.md#L66-L92](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/agent-teams/agents/team-lead.md#L66-L92)）；工具用白名單（[team-reviewer.md#L1-L7](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/agent-teams/agents/team-reviewer.md#L1-L7)） |
| [mattpocock](mattpocock__skills.md) | 訪談者、探索、實作（每張工單一個新 context）、合併、審查（規範與規格各一）、triage | 換工具（Claude 換到 Codex）的時候，就是寫 handoff 的時機 |
| [codument](jakubsuplicki__codument.md) | 8 個流程角色（[agent-profiles.ts#L25-L34](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/agent-profiles.ts#L25-L34)）＋7 個領域顧問＋5 個子代理 | 實作 → 審查 → 提交三關卡，順序固定；領域技能「是顧問、不是關卡」；adversarial-reviewer 只寫失敗的測試 |
| [rulesync](dyoshikawa__rulesync.md) | code-reviewer、security-reviewer、diff-analyzer、pr-handler、pr-merger | [agent-team](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/agent-team/SKILL.md) 迴圈：high＋critical＝0 且 mid≦3 才收工，最多 10 輪；[opencode-gpt-review](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.rulesync/skills/opencode-gpt-review/SKILL.md)：GPT 初審，Claude 逐條查證，分成 Valid／Rejected |
| [anthropics/skills](anthropics__skills.md) | Engineering lead、Concurrency reviewer（唯讀）、Test writer、Web researcher（用便宜模型） | 子代理看不到主對話，所以每個任務要自帶路徑、限制和回報格式（[managed-agents-multiagent.md#L59-L91](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/managed-agents-multiagent.md#L59-L91)） |
| [centminmod](centminmod__my-claude-code-setup.md) | memory-bank-synchronizer、code-searcher、codex-cli（把問題轉給 Codex） | Claude 主控、Codex 當顧問，結果分成 Corroborated／Solo／Disputed |
| [Backlog.md](MrLesk__Backlog.md.md) | 人類維護者、AI 實作者（`@codex`／`@claude`）、PM 子代理 | 「冷審查」只給任務與 diff，不給對話歷史（[AGENTS.md#L128-L153](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L128-L153)） |
| [paperclip](paperclipai__paperclip.md) | CEO→CTO→QA 範本；token-auditor（唯讀） | 角色檔只寫「你是誰」；權限與技能放設定檔；通用流程放技能，不要在每個角色重寫（[baseline-role-guide.md](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip-create-agent/references/baseline-role-guide.md)） |
| OpenSpec、spec-kit | 沒有人設角色：OpenSpec 用流程技能，spec-kit 用「階段」 | OpenSpec 的驗收者「不實作、不封存」；spec-kit 指令有 `handoffs:` 和人工 gate |
| 其餘 10 個 | 沒有角色清單，只有「AI 執行、人拍板」或角色檔格式 | ruler 的 `readonly: true` 在 Codex 會轉成 `sandbox_mode = "read-only"`（[SubagentsProcessor.ts#L435-L476](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/src/core/SubagentsProcessor.ts#L435-L476)） |

### 3-2 多家一致的原則

1. **實作者 ≠ 驗收者**，兩者要是不同的 AI。
2. **審查與巡讀角色唯讀**，工具只給 `Read, Grep, Glob, Bash`。注意 Codex 的角色權限只是預設值，不是硬隔離；`allowed-tools` 在 Codex 也只是文字建議（openai/skills [differences.md#L30-L34](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L30-L34)、[#L51-L64](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L51-L64)）。所以讓 Codex 當審查者時，要靠 sandbox 設定，不能只靠角色說明。
3. **只委派一層**：角色不呼叫角色，結果由你或主控角色整合。
4. **每個角色都寫兩件事**：「不負責什麼」，以及固定的輸出格式。
5. **「沒找到問題」也是有效結果**，但要列出沒檢查到的範圍。
6. **決策權留給人**：BMAD、Backlog、living-docs、majiu 都這樣設計。

### 3-3 給你的角色編制（建議）

| 角色 | 由誰擔任 | 職責 | 該裝的 skills（出處） | 不負責 | 交接方式 |
|---|---|---|---|---|---|
| 老闆（Lead） | 你 | 核准計畫、裁決衝突、決定是否部署 | — | — | 看巡讀報告的「需要你決定」段 |
| 規劃／總管 | Claude | 拆任務，每項寫驗收條件與驗證方式 | planning-and-task-breakdown（addyosmani）、define-goal（openai/skills）、propose（OpenSpec，選用） | 不寫程式 | 任務檔（TASKS.md 或 Backlog.md） |
| 實作者 | Codex（或 Claude） | 一次只做一個任務、最小修改 | tdd（mattpocock）、minimal-change-engineer（agency-agents）、verification-before-completion（superpowers） | 不改規則檔、不順手重構、不部署 | 交接帳本加一行，狀態四選一：DONE／DONE_WITH_CONCERNS／NEEDS_CONTEXT／BLOCKED（superpowers） |
| 驗收／審查者 | 跟實作者不同的 AI | 逐條對照驗收條件找證據 | code-review（mattpocock）、task-reviewer prompt（superpowers）、adversarial-reviewer（codument）、evidence-collector（agency-agents） | 不修程式（唯讀） | 報告先寫判定，每一項附 `檔案:行號` |
| 規則／文件管理員 | Claude | 維護 AGENTS.md 正本；新決策出現時，把舊的標為已取代 | bmad-project-context（BMAD）、living-docs、docs-drift-editor（VoltAgent） | 不自己決定衝突誰贏 | decisions.md |
| 每日巡讀員 | Claude（只讀） | 找漏做、找重複、找新舊衝突 | 自己寫 daily-patrol（見 4-6）；骨架借 codebase-archaeologist（agency-agents）、wiki-lint（paperclip）、prompt-audit（anthropics） | **不改任何檔案** | `docs/ai/patrol/YYYY-MM-DD.md` |
| 資安抽查（每週） | 任一 | 檢查金鑰與 Firebase 規則 | security-ai-generated-code-auditor（agency-agents） | 不修程式 | 報告 |

比價、成本計算這類 skill 要多加一條：「數字由腳本計算，AI 只負責分組與標籤，不准自己加總金額」（centminmod [task-breakdown/SKILL.md#L34-L39](https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/task-breakdown/SKILL.md#L34-L39)）。

### 3-4 交接怎麼做

- **交接單是檔案**，各家形式不同：
  - OpenSpec：`changes/<名稱>/` 下的四個檔。
  - BMAD：plan 檔，帶起始 commit `baseline_revision`。
  - Backlog：任務檔，要寫到「未來的 AI 不看對話也能動手」（[task-creation.md#L58-L67](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-creation.md#L58-L67)）。
- **交接時重讀，不靠記憶**：
  - superpowers：「你記得的只是摘要，brief 裡才有精確數值」。
  - 對話被壓縮之後，以帳本和 git log 為準，不信自己的記憶。
- **帳本只追加**：
  - superpowers 的 `progress.md` 用固定格式，例如 `Task N: complete …`、`fix round R/5`、`parked — Ruling: …`。
  - pm-review-copilot 的交接筆記有五欄：發生什麼變化、目前確定為真、阻塞、下一步、下次先讀哪些檔（[init_pm_memory.py#L375-L382](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L375-L382)）。
- **先認領再開工**：
  - mattpocock：「先 assign 給自己再動手」。
  - paperclip：用原子 checkout，搶到同一件事時回 409。
  - rulesync 資料包建議再加一個 `scribe` 角色，專門更新 TASKS／HANDOFF。

---

## 4. 防漏／防重複／防新舊版本衝突／定期巡檢：各家機制比較與缺口

### 4-1 防漏

| 機制 | 專案 | 位置 |
|---|---|---|
| 「程式碼存在、grep 結果、實作意圖都不算驗證證據」 | Backlog.md | [task-finalization.md#L1-L11](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-finalization.md#L1-L11) |
| 跳過的檢查只能標 `Not verified`，不能算通過 | OpenSpec | [verify SKILL.md#L164-L205](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L164-L205) |
| 宣稱完成前，一定要先跑驗證 | superpowers | [verification-before-completion#L14-L48](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/verification-before-completion/SKILL.md#L14-L48) |
| 每個 skill 結尾必須有 `## Verification` 段（lint 強制） | addyosmani | [skill-lint.js#L75-L81](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/lib/skill-lint.js#L75-L81) |
| 收工狀態檢查：`done` 要有驗證紀錄；`in_progress` 要真的有排程續跑 | paperclip | [SKILL.md#L223-L232](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/SKILL.md#L223-L232) |
| 覆蓋率回報：每個子代理回報讀了哪些檔、各讀幾行 | graphify | [extraction-spec.md#L20-L25](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/references/shared/extraction-spec.md#L20-L25) |
| 實作後再比對規格，沒做完的「追加」成新任務，不改舊任務 | spec-kit | [converge.md#L73-L83](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/converge.md#L73-L83) |
| 每日日誌斷檔偵測（限制：只看最新檔前 5 天） | memory-checkup | [memory_checkup.py#L135-L153](https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L135-L153) |
| `in_progress` 超過 24 小時沒動靜 → 叫醒負責的 AI | paperclip | [issue-triage SKILL.md](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/skills-catalog/catalog/bundled/paperclip-operations/issue-triage/SKILL.md) |

### 4-2 防重複

| 對象 | 誰、怎麼做 | 位置 | 限制 |
|---|---|---|---|
| 規則條文 | docguard：正規化後完全相同就算重複；「never X」對上「always X」就算矛盾；主題相近的配對交給 AI 判斷 | [instruction-audit.mjs#L231-L242](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/scanners/instruction-audit.mjs#L231-L242)（AI 配對在同檔第 426–461 行） | 只認英文 |
| 技能描述 | addyosmani：TF-IDF 相似度 ≥50% 警告、≥75% 擋下 | [run-evals.js#L411-L427](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L411-L427) | — |
| 角色檔 | agency-agents：全庫兩兩比對原創性；同名直接擋下 | [check-agent-originality.sh](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/check-agent-originality.sh)、[convert.sh#L761-L785](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/convert.sh#L761-L785) | 中文要改斷詞 |
| 同名角色的內容分岔 | wshobson：正規化後算 MD5 比對 | [doc_gardener.py#L669-L848](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L669-L848) | 只比雜湊 |
| 清單與 ID | blockwatch：`keep-unique` 防重複、`same-as-paths` 對照實際資料夾 | [keep_unique.rs#L16-L118](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/keep_unique.rs#L16-L118) | 只看同一區塊 |
| 需求 | OpenSpec 擋重名需求；spec-kit 的 analyze 找近似需求 | [specs-apply.ts#L257-L356](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L257-L356)、[analyze.md#L119-L122](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L119-L122) | — |
| 技能盤點（AI 執行） | ECC：跟其他 skill、MEMORY.md、CLAUDE.md 重疊時判定「Merge into X」 | [skill-stocktake#L159-L180](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/skill-stocktake/SKILL.md#L159-L180) | 要花 token |
| 規則稽核（AI 執行） | anthropics：兩個子代理做同一件事就刪一個；但「正常運作的重複不是垃圾」 | [prompt-audit.md#L182](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L182) | 要花 token |
| 產出檔與技能名 | rulesync：同路徑、同名、易混淆名稱（`c0py`／`copy`）都會警告 | [rules-processor.ts#L975-L1006](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/features/rules/rules-processor.ts#L975-L1006)、[confusable-names.ts](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/utils/confusable-names.ts) | 不比對內容語意 |

### 4-3 防新舊版本衝突

| 做法 | 專案 | 位置 |
|---|---|---|
| 各指令每次都讀「活的」憲法；「把規則複製到別處就會漂移」 | spec-kit | [constitution-sync README#L69-L96](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/presets/constitution-sync/README.md#L69-L96) |
| 規則首行寫 `Verified <日期> against <SHA>`；更新時用 `git log --diff-filter=DR` 找出被刪或改名的檔案，證據不在的規則就修改或刪除 | BMAD | [SKILL.md#L89-L91](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/SKILL.md#L89-L91) |
| 提案落後主規格就拒絕合併；兩個變更改到同一處時，「舊的先合、新的覆蓋」 | OpenSpec | [specs-apply.ts#L534-L560](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L534-L560)、[bulk-archive#L112-L145](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-bulk-archive-change/SKILL.md#L112-L145) |
| 只取代、不改寫：舊紀錄標 Superseded，檔案保留，並自動插入「不要照做」橫幅；搭配五條不漂移原則 | living-docs | [spine.md#L1-L22](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/spine.md#L1-L22)（原則） |
| 舊事實標成 `closed <日期>, superseded by <slug>`；兩條矛盾時都附日期列出 | VoltAgent | [memory-curator.md#L41-L51](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L41-L51) |
| 生命週期欄位（status、valid_until、superseded_by…）＋三級新鮮度門檻 | pm-review-copilot | [SKILL.md#L268-L284](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L268-L284)、[#L165-L201](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L165-L201) |
| 用 `git blame` 判斷新舊，不看檔案時間戳，也不信檔案自己寫的「已取代」 | anthropics | [prompt-audit.md#L147](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L147) |
| 「最新不一定正確，要先用證據驗證」 | memory-checkup、agency-agents | [memory_checkup.py#L101-L123](https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L101-L123)、[archaeologist#L162-L172](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L162-L172) |
| 參考文件標「最後查證日期」，過期就重查 | openai/skills | [differences.md#L7](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L7) |
| 產出檔與來源不一致時，指令回傳失敗 | rulesync、ruler、graphify、docguard | [feature-processor.ts#L60-L147](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/src/types/feature-processor.ts#L60-L147)、[README.md#L1077-L1124](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/README.md#L1077-L1124)、[gen.py#L723-L744](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/gen.py#L723-L744)、[agents.mjs#L56-L92](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/commands/agents.mjs#L56-L92) |
| 版本號只有一個來源；技能每次載入才向執行檔取內容，不存副本 | blockwatch | [blockwatch.toml#L17-L24](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/blockwatch.toml#L17-L24)、[docs/agents.md#L53-L70](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/agents.md#L53-L70) |
| 改文件時帶 `baseRevisionId`，別人已經改過就回 409；矛盾時加註 `⚠ contradicted by`，不默默改掉 | paperclip | [issue-documents.md#L45-L58](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/skills/paperclip/references/issue-documents.md#L45-L58)、[AGENTS.md#L77](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/plugins/plugin-llm-wiki/templates/AGENTS.md#L77) |
| 文件之後又有 ≥10 次程式 commit，或比最新程式舊 30 天以上，就提醒複查 | docguard | [freshness.mjs#L272-L365](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/validators/freshness.mjs#L272-L365) |
| 掃描舊名詞，不准再出現 | OpenSpec | [vocabulary-sweep.test.ts#L1-L48](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/test/vocabulary-sweep.test.ts#L1-L48) |
| 版本漂移檢查（`--check`／`--audit`） | superpowers | [bump-version.sh#L116-L152](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/scripts/bump-version.sh#L116-L152) |

### 4-4 定期巡檢

| 專案 | 排程 | 內容 | 位置 |
|---|---|---|---|
| ECC | 每週一 09:00 UTC | 相依套件、npm audit、過期 issue；另外教 `/loop`，以及系統 cron 搭配 `claude -p` | [maintenance.yml#L1-L75](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/.github/workflows/maintenance.yml#L1-L75)、[autonomous-agent-harness#L85-L113](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/autonomous-agent-harness/SKILL.md#L85-L113) |
| rulesync | 每週一 | 專案切塊交給 LLM 掃描，回傳 JSON；任何一塊失敗就整份失敗；只在 high 以上才寄信 | [security-scan.yml](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/.github/workflows/security-scan.yml)、[security-scan-xml.ts#L132-L142](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/scripts/security-scan-xml.ts#L132-L142) |
| ruler | 每週三 17:00 UTC | 把 prompt 送給 Copilot 代理，開 PR 校正 README | [writeme.yml](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/.github/workflows/writeme.yml)、[prompt.md](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/.github/workflows/writeme/prompt.md) |
| blockwatch | 每週一 06:17 UTC | 只跑需要連網的檢查；建議定期全掃描當安全網 | [trusted-checks.yml#L1-L27](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/.github/workflows/trusted-checks.yml#L1-L27) |
| wshobson | 每週一 06:00 UTC | 外掛靜態評分；`doc_gardener` 其實只在 PR／push 時跑 | [eval-report.yml#L19-L21](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/.github/workflows/eval-report.yml#L19-L21) |
| paperclip | 內建 routine＋cron；LLM Wiki 每晚 03:00 UTC 跑 lint，預設暫停 | 用 cursor 記住上次巡到的 commit，只看新增的 | [manifest.ts#L236-L316](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/plugins/plugin-llm-wiki/src/manifest.ts#L236-L316)、[doc-maintenance#L34-L60](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/doc-maintenance/SKILL.md#L34-L60) |
| docguard | 作者用 Google Jules 每週排三次（bug-hunt、test-gaps、docs-drift） | 排程 AI 守則 | [.jules/RULES.md](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/.jules/RULES.md) |
| BMAD | Pulse：記憶型代理依排程醒來，先整理記憶 | 用什麼方式喚醒未確認 | [PULSE-template.md#L1-L28](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-toolsmith/shapes/memory-agent/assets/PULSE-template.md#L1-L28) |
| majiu-management | 每季一次；建立排程前要使用者同意 | 只讀巡檢報告 | [quarterly-inspection.md#L76-L88](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/quarterly-inspection.md#L76-L88) |
| anthropics/skills | Managed Agents 的排程部署（cron＋時區） | API 層級 | [scheduled-deployments.md#L7-L80](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/managed-agents-scheduled-deployments.md#L7-L80) |
| 其餘 16 個 | 沒有內容巡檢的排程（spec-kit、mattpocock 只有關閉過期 issue 的每日 cron） | 只靠 pre-commit、PR 或 SessionStart hook | — |

### 4-5 缺口：沒有任何一家做好的部分

1. **語意層的重複與矛盾抓不到**。「兩份文件用不同字講同一件事」或「規則互相矛盾」，沒有確定性工具能可靠找出來。確定性工具只比對完全相同、雜湊或關鍵字；語意判斷都得交給 LLM，例如 docguard 的配對、prompt-audit、skill-stocktake。
2. **沒有現成的每日、跨 AI 巡讀**。各家大多每週跑一次，或只在 commit、PR 時觸發。
3. **中文支援要自己補**。docguard 的規則抽取、agency-agents 的斷詞都只處理英文，要改程式碼才能用。
4. **Claude 版和 Codex 版的技能副本會各自漂移**。ECC 資料包明說沒有檢查這件事。可以借用的檢查有兩個：codument 的 skill-parity 測試，以及 blockwatch 的 stub 一致性測試（[tests/skill.rs#L9-L60](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/tests/skill.rs#L9-L60)）。
5. **任務清單和實際程式碼的落差沒人自動抓**。OpenSpec 不檢查這點，資料包還舉了實例；Backlog 的驗收條件勾選是否被強制，未確認。目前只能靠 AI 判斷，例如 superpowers 審查者的 Missing 類別、BMAD 的結案檢查、spec-kit 的 converge。
6. **依日期判斷過期的程式很少**。living-docs、codument 有 `last_reviewed` 欄位，但沒有程式依日期判斷；有實作的只有 docguard 的 Freshness、majiu（30／90 天），以及 pm-review-copilot 的門檻。
7. **排程 AI 本身有三個常見風險**：沒人回答時會卡住、會開出雜訊 PR、會重複開工單。對策見 4-6。

### 4-6 建議的每日巡讀做法（組合）

**第 0 步｜決定範圍**：借用 paperclip doc-maintenance 的 cursor 做法。記住上次巡到哪個 commit，每天只看 `git log 上次..HEAD`；每週再全掃一次。

**第 1 步｜機械檢查**（免費、不會幻覺）：
- **規則同步**：檢查 CLAUDE.md 是否仍然等於或引用 AGENTS.md。可用 blockwatch 的 `same-as`、`docguard agents --check` 或 `rulesync generate --check`。
- **規則品質**：用 `docguard verify --instructions` 找重複、矛盾和指向不存在檔案的規則（限英文規則）。
- **任務**：用 `backlog doctor` 查重複 ID 與循環依賴；或用 OpenSpec 的 `validate --all --strict --json` 和 `list --json`，算出哪些任務幾天沒動。
- **版本與數字**：檢查版本號是否只有一個來源（blockwatch，或 superpowers 的 `--check`），以及文件裡寫死的數字（wshobson 的 `STALE_COUNT`）。
- **禁用舊詞**：照 OpenSpec vocabulary-sweep 的寫法，或用 blockwatch 的 `line-pattern-forbidden`。

**第 2 步｜Claude 唯讀巡讀**：
- 分四個面向檢查：漏做、重複、新舊衝突、版本。
- 每條發現照 superpowers 的格式寫：發現、證據（`路徑:行號`）、信心；沒有發現時要寫「none found — checked: …」。
- 判斷新舊照 prompt-audit 的做法：看 git blame，不看時間戳；涉及安全規則的只標記、不修改。
- 回報讀了哪些檔、各讀幾行，讀不完的標成 partial。這是 graphify 的覆蓋率回報做法；VoltAgent 的 ponder-auditor 更嚴格，覆蓋率不到 1.00 就不算完成。

**第 3 步｜Codex 複查**：Codex 逐條讀原始碼，把每條發現分成「成立」或「不成立」。做法借自 rulesync 的 opencode-gpt-review，以及 centminmod 的 Corroborated／Solo／Disputed 分類。

**第 4 步｜你拍板**：報告只提建議，不改檔案；需要你決定的事項獨立成一段。

**排程 AI 守則**（合併 docguard [.jules/RULES.md](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/.jules/RULES.md)、paperclip、mattpocock、rulesync 的做法）：
- 排程任務不准發問。沒人回答時任務會卡死，所以不確定就選保守的做法，或直接結束並寫摘要。
- 沒有發現就保持安靜，不開 PR、不開任務；要開任務之前，先搜尋有沒有重複的。
- 任何一塊掃描失敗，整份報告就算失敗，不能假裝全部通過。
- 新排程預設暫停，你確認後才啟用；同一時間只跑一個；自動觸發一次只加一個。

**觸發方式**有三種選擇：
- **GitHub Actions 排程**：台灣早上 6:17 是 UTC `17 22 * * *`（blockwatch 資料包示範）。
- **電腦排程**：用系統排程執行 `claude -p "使用 daily-patrol skill"` 或 `codex exec`（spec-kit 的 Codex 整合就是用 `codex exec` 非互動執行）。
- **Claude Code 內**：用 `/loop`（ECC 的做法）。

**報告範本**（我的建議，非 repo 原文）：

```markdown
### 每日巡讀 2026-11-05（巡讀：Claude／唯讀；複查：Codex）
範圍：commit a1b2c3d..e4f5a6b（12 個）；機械檢查 4 通過、1 失敗
#### 需要你決定
- [衝突] AGENTS.md L42「庫存以箱計」vs docs/inventory.md L8「以件計」；git blame：docs 較新
#### 漏做
- [高] TASKS.md T12 標完成，但 functions/stock.js 沒有負庫存檢查；Codex 複查：成立
#### 重複
- [中] Firebase 部署步驟同時寫在 AGENTS.md 與 docs/setup.md，內容不同 → 建議只留 docs/setup.md
#### 新舊版本
- none found — checked: AGENTS.md、CLAUDE.md 狀態欄、package.json version
#### 沒檢查到的範圍
- functions/legacy/（只看 diff）
```

---

## 5. Skill 寫法要點

### 5-1 SKILL.md 格式

- **必填欄位**：frontmatter 只有 `name` 和 `description` 是必填，其他都是選填（anthropics [skill-creator](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/skill-creator/SKILL.md#L62-L113)、openai、superpowers 說法一致）。
- **`name` 的規則**：
  - 只用小寫英數字和連字號，長度 1–64 字。
  - **必須等於資料夾名**（ruler [OpenCodeSkills.ts#L96-L121](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/src/core/OpenCodeSkills.ts#L96-L121)）。graphify 就曾因為名稱和資料夾名不同，讓 Claude Code 找不到技能（[platforms.toml#L61-L65](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/platforms.toml#L61-L65)）。
  - superpowers 建議用動詞開頭，例如 `creating-skills` 比 `skill-creation` 好。
- **`description` 的規則**：
  - 上限 1024 字元，各家一致。
  - 實務上建議更短：superpowers 建議 500 字元以內；paperclip 的內建技能用測試強制 40–300 字元（[SKILL.md#L159-L235](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/create-paperclip-bundled-skill/SKILL.md#L159-L235)）。
  - **寫成一行**。agency-agents 的 lint 禁止 `description: >`，因為轉換器會壞掉（[lint-agents.sh#L115-L122](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/lint-agents.sh#L115-L122)）；ECC 則禁止 `|`。最保險的寫法就是單行。
- **本文段落**：
  - superpowers 的順序：Overview → When to Use（含何時不用）→ Core Pattern → Quick Reference → Implementation → Common Mistakes（[discovery.md#L6-L50](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/discovery.md#L6-L50)）。
  - addyosmani 多加兩段（[skill-anatomy.md#L20-L80](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L20-L80)）：Verification，以及 Common Rationalizations 表，專門列出 AI 想跳過步驟時的藉口和對應的反駁。
- **長度上限**：SKILL.md 控制在 500 行內（addyosmani、ECC）；wshobson 的上限是 8KB。

### 5-2 description 寫法（決定會不會被叫到）

1. **用「Use when…」開頭，只寫觸發情境，不摘要流程**。superpowers 實測過：description 寫成「每個任務之間做 code review」時，AI 只審查一次；改成只寫觸發情境後，AI 才會去讀本文，正確做完兩階段審查（[discovery.md#L53-L110](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/discovery.md#L53-L110)）。addyosmani 也用 lint 強制 description 一定要有「Use when／before／after／during」（[skill-lint.js#L57-L70](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/lib/skill-lint.js#L57-L70)）。
2. **放進使用者真的會講的話**。addyosmani 在 code-review 的 description 加了一句「即使程式碼直接貼在對話裡也適用」，觸發率就從 7/27 升到 21/27（[evals/README.md#L65-L73](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/evals/README.md#L65-L73)）。memory-checkup 同時給英文和中文觸發詞。你的技能要放繁中觸發詞，例如「巡讀」「每日檢查」「找重複」「新舊版本」「比價」「成本」。
3. **寫明何時不要用**：
   - anthropics：xlsx 技能有「Do NOT trigger when…」，claude-api 技能有 TRIGGER／SKIP 兩段。
   - spec-kit：code-review 技能寫「Do not use for implementing changes」（[SKILL.md#L1-L5](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/.github/skills/code-review/SKILL.md#L1-L5)）。
   - codument：寫成互斥句型，並註明「技能會不會被觸發，由 description 決定，不是看有沒有安裝」（[agent-profiles.ts#L36-L40](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/agent-profiles.ts#L36-L40)）。
4. **分清楚兩種技能**（mattpocock [invocation.md](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.agents/invocation.md)）：
   - AI 會自動叫的：description 寫給模型看，保留觸發語。
   - 只由你手動叫的：description 寫成一行給人看，並加上 `disable-model-invocation: true`。Claude 的技能清單有額度，技能一多就要把這類藏起來（spec-kit 資料包）。
5. **防止誤觸發**：
   - OpenSpec 每個技能開頭都有「Project check」：如果是 AI 自己挑中這個技能、但專案裡沒有 `openspec/`，就停止使用（[SKILL.md#L15-L25](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L15-L25)）。
   - graphify 在本文寫明「一次性的查詢直接 grep 比較快」（[skill.md#L50-L52](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/skill.md#L50-L52)）。
6. **寫作風格**：
   - 解釋「為什麼」，比全大寫的 MUST 有效（anthropics skill-creator 第 137–139 行）。
   - 不要寫否定句，改寫成正面目標（mattpocock）。
   - 寫「動作」而不寫工具名稱，Codex 才看得懂。superpowers 的說法是「Skills name actions, not tools」（[porting-to-a-new-harness.md#L31-L63](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/docs/porting-to-a-new-harness.md#L31-L63)），wshobson、addyosmani 也這樣要求。

### 5-3 資料夾結構與腳本

```
.agents/skills/daily-patrol/
├── SKILL.md              ← 精簡流程＋路由（什麼情況讀哪個 reference）
├── references/           ← 長資料，需要時才讀（長檔加目錄；只放一層）
├── scripts/              ← 確定性工作：比對、計數、算金額
├── assets/ 或 templates/ ← 報告範本
├── evals/triggers.json   ← 觸發測試（BMAD 格式）
└── agents/openai.yaml    ← Codex 的顯示資訊（Claude 會忽略）
```

- **同一份資訊只放一處**：放 SKILL.md 或 references 其中之一（openai/skills skill-creator）。不建空資料夾（addyosmani）。不引用別的技能資料夾裡的檔案（BMAD）。
- **腳本的寫法**：
  - 在 SKILL.md 裡寫成 `bash scripts/x.sh`，不寫裸路徑，因為有些打包方式會拿掉執行權限（superpowers）。
  - 狀態訊息寫到 stderr，JSON 寫到 stdout（addyosmani [skill-anatomy.md#L138-L147](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/docs/skill-anatomy.md#L138-L147)）。
  - 把腳本當黑盒子用，先跑 `--help`，不要讀原始碼把 context 塞爆（anthropics webapp-testing）。
- **邏輯放在 CLI，skill 只負責編排**。OpenSpec、codument 都這樣做；blockwatch 在技能裡寫 `` !`blockwatch skill` ``，每次載入時才取最新內容；living-docs 則採「薄殼路由」（[SKILL.md#L48-L63](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/SKILL.md#L48-L63)）。好處是 Claude 與 Codex 拿到的永遠是同一版。
- **能不用腳本就不用**：paperclip 提醒，技能只要帶了 `scripts/`，安裝時的信任等級就會提高，所以「能純 Markdown 就純 Markdown」。

### 5-4 Claude Code 與 Codex 的讀取位置

| 項目 | Claude Code | Codex | 出處／備註 |
|---|---|---|---|
| 專案規則 | `CLAUDE.md`、`.claude/rules/*.md` | `AGENTS.md`（巢狀，越近越優先） | openai/skills [differences.md#L9-L93](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L9-L93) |
| 專案技能 | `.claude/skills/<名稱>/SKILL.md` | `.agents/skills/<名稱>/SKILL.md` | [differences.md#L24-L34](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L24-L34)；OpenSpec、rulesync、ruler、spec-kit、BMAD 一致 |
| 個人技能 | `~/.claude/skills/` | **說法不一**：`~/.agents/skills/`（superpowers、rulesync、mattpocock）vs `~/.codex/skills`（openai skill-installer、living-docs、pm-review-copilot、paperclip） | openai/skills 資料包指出 repo 本身就前後不一致；現行官方位置未確認 |
| 角色 | `.claude/agents/*.md` | `.codex/agents/*.toml`（`developer_instructions`、`sandbox_mode`…） | [differences.md#L51-L64](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L51-L64)；Codex 的權限只是預設值 |
| Hook | `.claude/settings.json` | `.codex/hooks.json`，要先開 `[features].codex_hooks = true`；PreToolUse／PostToolUse 只對 shell 指令觸發 | [differences.md#L78-L93](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L78-L93) |
| 只有 Claude 認得的欄位 | `disable-model-invocation`、`model`、`argument-hint`、`paths`、`hooks` 等 | `allowed-tools` 只是建議 | [differences.md#L30-L34](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L30-L34) |
| 只有 Codex 認得的檔案 | — | `agents/openai.yaml`（`display_name`、`short_description`、`default_prompt`） | paperclip、mattpocock、pm-review-copilot |
| 手動叫技能 | `/技能名` | `$技能名`（openai/skills 資料包：「`$skill-name` 是 Codex 的呼叫語法，Claude Code 是 `/skill-name`」；OpenSpec、pm-review-copilot 同） | addyosmani 資料包寫 Codex 用 `@skill-name`，說法不一 |

**建議做法**：技能正本放 `.agents/skills/`，`.claude/skills` 用 symlink 指過去（openai/skills 資料包的保險做法）；或者由 rulesync／ruler 自動產生兩份。在 Windows 上無法用 symlink 時，就用 blockwatch 的 `same-as` 或 codument 的 skill-parity 測試，確認兩份內容相同。另外要注意：mattpocock 資料包提到 Codex 的外掛打包會丟掉 symlink，所以 symlink 只適合在自己的專案資料夾裡用，不要拿來做成外掛發布。

### 5-5 怎麼測試 skill

- **觸發測試**：
  - BMAD 用 `evals/triggers.json`，每筆寫 `{"query": …, "should_trigger": true/false}`，並刻意放進「很像、但不該觸發」的句子。description 的寫法規則見 [craft-description.md#L1-L15](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmod-toolsmith/help/craft-description.md#L1-L15)，格式檢查見 [skill-validator.md#L102-L168](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/tools/skill-validator.md#L102-L168)。
  - anthropics 提醒：簡單一步就能做完的請求，本來就不會觸發 skill，所以測試題要寫得夠複雜。
- **行為測試**：superpowers 的原則是「沒有先失敗的測試，就不寫 skill」（writing-skills SKILL.md 第 163–182、295–305 行）。
  - 每個版本至少測 5 次。
  - 一定要有「不給規則」的對照組；對照組本來就不會出錯的話，這條規則就不用寫。
  - CLAUDE.md 寫得夠不夠強，也有一套壓力測試設計（[CLAUDE_MD_TESTING.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/CLAUDE_MD_TESTING.md)）。

---

## 6. 資料來源

本總結只依據以下 26 份資料包，以及 [`../cards/`](../cards/) 中 `category` 為 `04-agent-rules-skills` 的卡片。permalink 全部照抄資料包；資料包寫「未確認」的地方，本文沒有另外查證。

**規則標準與規則同步**
- [agentsmd__agents.md.md](agentsmd__agents.md.md)
- [dyoshikawa__rulesync.md](dyoshikawa__rulesync.md)
- [intellectronica__ruler.md](intellectronica__ruler.md)
- [Graphify-Labs__graphify.md](Graphify-Labs__graphify.md)

**開發方法**
- [github__spec-kit.md](github__spec-kit.md)
- [Fission-AI__OpenSpec.md](Fission-AI__OpenSpec.md)
- [bmad-code-org__BMAD-METHOD.md](bmad-code-org__BMAD-METHOD.md)
- [obra__superpowers.md](obra__superpowers.md)

**技能庫**
- [anthropics__skills.md](anthropics__skills.md)
- [openai__skills.md](openai__skills.md)
- [addyosmani__agent-skills.md](addyosmani__agent-skills.md)
- [mattpocock__skills.md](mattpocock__skills.md)
- [affaan-m__ECC.md](affaan-m__ECC.md)
- [centminmod__my-claude-code-setup.md](centminmod__my-claude-code-setup.md)

**角色庫**
- [VoltAgent__awesome-claude-code-subagents.md](VoltAgent__awesome-claude-code-subagents.md)
- [msitarzewski__agency-agents.md](msitarzewski__agency-agents.md)
- [wshobson__agents.md](wshobson__agents.md)

**任務追蹤**
- [MrLesk__Backlog.md.md](MrLesk__Backlog.md.md)
- [paperclipai__paperclip.md](paperclipai__paperclip.md)

**巡檢與漂移偵測**
- [raccioly__docguard.md](raccioly__docguard.md)
- [mennanov__blockwatch.md](mennanov__blockwatch.md)
- [jakubsuplicki__codument.md](jakubsuplicki__codument.md)
- [ejklock__living-docs-skill.md](ejklock__living-docs-skill.md)
- [wikiiizhao__pm-review-copilot.md](wikiiizhao__pm-review-copilot.md)
- [Thomaszhou22__memory-checkup.md](Thomaszhou22__memory-checkup.md)
- [majiabin2020__majiu-management.md](majiabin2020__majiu-management.md)

**資料包之間的已知分歧**（本文未替你判定）
- **Codex 個人技能的路徑**：superpowers、rulesync、mattpocock 寫 `~/.agents/skills/`；openai skill-installer、living-docs、pm-review-copilot、paperclip 寫 `~/.codex/skills`。openai/skills 資料包指出，該 repo 自己就前後不一致。
- **Codex 手動叫技能的符號**：多數資料包寫 `$技能名`，addyosmani 資料包寫 `@skill-name`。
- **沒有 CLAUDE.md 時，Claude Code 會不會讀 AGENTS.md**：rulesync、docguard 資料包說會；agents.md 官網的相容清單沒有列出 Claude Code（grep 結果 0 筆）。
- **description 能不能寫成多行**：ECC 允許 `>`，agency-agents 的 lint 禁止 `>`，docguard 的範例用多行。
- **子資料夾規則**：agents.md、ECC、paperclip 都用巢狀 AGENTS.md；BMAD 提醒有些工具在 session 開始後才進入的子資料夾規則可能讀不到，建議先寫在根檔。
- **角色數量**：VoltAgent 的 README 寫 161 或 158 個，資料包實際數到 166 個（見卡片的維護欄）。
- **適合度 5 分**：ECC 與 wshobson 的卡片給了 5 分，但這兩份資料包本身都建議「不要整包安裝」。
