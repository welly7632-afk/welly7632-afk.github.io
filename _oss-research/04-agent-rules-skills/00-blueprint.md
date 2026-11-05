# AI 協作基礎架構：共用規則＋角色＋每日巡檢

> 寫於 2026-11-05。只根據本資料夾的 26 份資料包與 [00-summary.md](00-summary.md)，沒有另外 clone 或上網查證。資料包是 2026-11-04 的快照：星數、授權、路徑、旗標可能已經變了，動手前請重新確認。資料包寫「未確認」或彼此說法不同的地方，本文照實標出，不替你選邊。
> 可直接安裝的範本在 [templates/](templates/README.md)：[AGENTS.template.md](templates/AGENTS.template.md)、[CLAUDE.template.md](templates/CLAUDE.template.md)、[docs-conventions.md](templates/docs-conventions.md)、[roles/](templates/roles/)、[skills/daily-patrol/](templates/skills/daily-patrol/SKILL.md)。

## 先講結論

你的感覺是對的：多個 AI（Claude、GPT／Codex）各讀各的規則、各自改檔、沒人記帳，專案一定會亂。這套架構針對四個症狀各擋一道：

| 症狀 | 為什麼會發生 | 這套架構怎麼擋 |
|---|---|---|
| **漏掉** | AI 說做完了但沒證據；換 AI 時沒交接；任務沒人接 | 任務檔要有「驗收條件＋驗證方式」，`done` 沒有「驗證結果」就不算；每次交接在只追加的帳本記一筆；巡檢查 M／T 類 |
| **重複** | 同一條規則被複製到 `CLAUDE.md`、角色檔、文件；兩個角色搶同一件事 | 規則只在 `AGENTS.md` 寫一份，其他地方只放連結；角色檔必有「不負責什麼」；巡檢查 D 類（相同句子、重複 ID、技能副本分岔） |
| **新舊版本衝突** | 新規則出來，舊文件沒人標；AI 看到舊文件照做 | 每份文件有標頭（`status`、版本、更新日、取代了誰）；舊的不刪、標 `superseded` 加橫幅；用 `git` 證據判新舊，不信檔案自己說的；巡檢查 C／S 類 |
| **規則各寫各的** | Claude 讀 `CLAUDE.md`、Codex 讀 `AGENTS.md`，兩份慢慢分岔 | `AGENTS.md` 是唯一正本；`CLAUDE.md` 第一行 `@AGENTS.md`，只放 Claude 專屬補充；巡檢查 C10／C13 |

先講三件事：

1. **沒有現成工具能一次做完。** 資料包裡 26 個專案，沒有一個同時有「共用規則＋角色分工＋每日跨 AI 巡讀」（[00-summary.md](00-summary.md) 第 4-5 節的缺口）。所以這份藍圖是「組合」：規則標準用 AGENTS.md、交接與任務紀律借 Backlog.md／OpenSpec／superpowers、文件版本借 living-docs／pm-review-copilot、巡檢借 docguard／memory-checkup／paperclip／agency-agents，再自己補一個 `daily-patrol` 技能把它們串起來。
2. **三條鐵則：實作者和驗收者是不同的 AI；巡檢員只讀不改；最後由你拍板。** 這三條幾乎每個有角色設計的專案都有（[00-summary.md](00-summary.md) 3-2 節）。
3. **先小後大。** 第 1 天只要 `AGENTS.md`＋`CLAUDE.md`＋任務檔＋交接帳本；角色與巡檢一週內補上；`rulesync`、`OpenSpec`、`Paperclip` 這類較重的東西，等 AI 超過三個或功能規格常打架再說。

---

## 1. 架構總覽

```
                          ┌────────────────────────────┐
                          │  老闆（你）                 │  核准規則、裁決衝突、標 done、部署、廣告預算
                          └──────┬──────────────▲──────┘
                    交辦／裁決    │              │ 每天 5 分鐘：看報告「需要你決定」
                                 ▼              │
 ┌─────────────────────────────────────────┐   │
 │ ① 共用規則（唯一正本）                    │   │
 │    AGENTS.md  ←─ CLAUDE.md（@AGENTS.md） │   │   Codex 直接讀 AGENTS.md
 │    憲法 R-001…、優先順序、工作流程、登記簿 │   │   Claude 讀 CLAUDE.md → 匯入 AGENTS.md
 └────────────────┬────────────────────────┘   │
                  │ 每個 AI 開工先讀                │
                  ▼                                │
 ┌─────────────────────────────────────────┐   │
 │ ② 角色（docs/ai/roles/*.md）              │   │
 │  planner(Claude) → implementer(Codex)    │   │
 │       → reviewer(Claude，唯讀) → 老闆     │   │
 │  doc-keeper(Claude) · content-ads(Claude)│   │
 └────────────────┬────────────────────────┘   │
                  │ 交接靠檔案，不靠聊天紀錄          │
                  ▼                                │
 ┌─────────────────────────────────────────┐   │
 │ ③ 任務與決策紀錄（docs/ai/）              │   │
 │  TASKS.md（待辦）  handoff.md（只追加）    │   │
 │  decisions/DEC-xxxx.md  INDEX.md（文件地圖）│   │
 │  每份文件標頭：版本／更新日／負責角色／status│   │
 └────────────────┬────────────────────────┘   │
                  │ 每天讀（只讀）                  │
                  ▼                                │
 ┌─────────────────────────────────────────┐   │
 │ ④ 每日巡檢 daily-patrol（唯讀）            │   │
 │  機械檢查 mech-check.sh ─▶ Claude 判讀     │   │
 │  ─▶ Codex 複查 ─▶ reports/patrol-日期.md ──┼───┘
 └─────────────────────────────────────────┘
        你點頭之後 → planner 建任務 / doc-keeper 改文件（巡檢本身不動手）
```

### 各部分放哪

| 部分 | 檔案 | 誰維護 | 範本 |
|---|---|---|---|
| ① 共用規則 | `AGENTS.md`、`CLAUDE.md` | doc-keeper（改規則要老闆核准） | [AGENTS.template.md](templates/AGENTS.template.md)、[CLAUDE.template.md](templates/CLAUDE.template.md) |
| ② 角色 | `docs/ai/roles/<角色>.md`（7 個） | doc-keeper | [roles/](templates/roles/owner.md) |
| ③ 任務與決策 | `docs/ai/TASKS.md`、`handoff.md`、`decisions/`、`INDEX.md`、`conventions.md` | planner／各角色／doc-keeper | [docs-conventions.md](templates/docs-conventions.md)、[starter/](templates/starter/INDEX.md) |
| ④ 巡檢 | `.agents/skills/daily-patrol/`、`reports/` | patrol（只寫 `reports/`） | [skills/daily-patrol/](templates/skills/daily-patrol/SKILL.md) |

### 一個任務怎麼接力（Claude 和 Codex 輪流）

1. **老闆** 說需求。
2. **planner（Claude）** 在 `TASKS.md` 開任務：目標、驗收條件、驗證方式、相關檔案。
3. **implementer（Codex）** 先認領（owner 改自己、`in_progress`）→ 最小修改 → 跑驗證 → 寫「驗證結果」→ 狀態 `review` → `handoff.md` 追加一筆（`DONE`／`DONE_WITH_CONCERNS`／`NEEDS_CONTEXT`／`BLOCKED`）。
4. **reviewer（Claude，唯讀）** 只看任務與 diff，逐條對驗收條件找證據 → 在任務「審查」欄寫「通過」或「不通過」。
5. **老闆** 看審查結論，才把任務標 `done`。
6. 當天遇到的規則變動，**doc-keeper** 走「取代」流程更新文件。
7. 隔天早上 **patrol** 巡一遍，抓前面任何一步漏掉的。

要換方向（Claude 實作、Codex 審）也可以，唯一的限制是同一個任務的實作者和驗收者不同。[mattpocock/skills](mattpocock__skills.md) 的資料包也建議「Claude 實作、Codex 審查，或反過來；換手用 handoff」（那是資料包作者依該專案寫的建議，不是 repo 原文）。

### 刻意不做的事

- 不整包安裝任何一個專案：ECC、wshobson 適合度雖然給 5 分，兩份資料包都說「當零件庫挑著用」。VoltAgent 166 個、agency-agents 283 個角色，只挑 5～6 個概念改成中文。
- 現階段不上 [rulesync](dyoshikawa__rulesync.md)／[ruler](intellectronica__ruler.md)：只有 Claude 和 Codex 兩家，`AGENTS.md` 加 `@AGENTS.md` 匯入就夠了。
- 現階段不架 [Paperclip](paperclipai__paperclip.md)：資料包建議「等 AI 數量變多再用它的 routine 與看門狗」。
- 現階段不用 [OpenSpec](Fission-AI__OpenSpec.md)：先用 `TASKS.md`＋`decisions/`；功能規格常互相打架時再引進它的 specs／changes／archive。

---

## 2. 共用規則：放哪、怎麼分層、怎麼讓兩邊讀同一份

### 2-1 一份正本，兩種讀法

**決定：`AGENTS.md` 是唯一正本；`CLAUDE.md` 第一行寫 `@AGENTS.md`，下面只放 Claude 專屬的東西。**

- Codex 原生讀 `AGENTS.md`；[agents.md](agentsmd__agents.md.md) 官網相容清單把 Codex 列在最前面。
- Claude Code 讀 `CLAUDE.md`，用 `@AGENTS.md` 匯入。這個做法 BMAD 會「提議並驗證」（[set-and-maintain-project-context.md#L64-L72](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/existing-codebases/set-and-maintain-project-context.md#L64-L72)），docguard 的 [CLAUDE.md](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/CLAUDE.md) 則是寫「Follow AGENTS.md」。
- **匯入有沒有生效要實測，不要假設。** superpowers 的移植文件提醒不要假設 `@` 一定會展開，要用獨特字串實測（[00-summary.md](00-summary.md) 2-1 節 B 項）。範本的做法：開新對話問「AGENTS.md 的規則 R-001 是什麼？」答不出來就是沒讀到。
- **資料包對 `@` 在 Codex 是否展開是「未確認」**，但這不影響本方案：Codex 直接讀 `AGENTS.md`，不經過 `CLAUDE.md`。

五種做法的比較在 [00-summary.md](00-summary.md) 2-1 節。本方案選 B（匯入）的理由：

| 做法 | 取捨 | 判斷 |
|---|---|---|
| A. symlink | 真的只有一份；但沒地方放 Claude 專屬內容，Windows 上常出問題 | 沒有 Claude 專屬內容時可以用；範本 `CLAUDE.template.md` 的註解有寫 |
| **B. `@AGENTS.md` 匯入** | 可以放 Claude 專屬內容；`@` 展開要實測 | **採用** |
| C. 受管區塊（Backlog、spec-kit 用） | 要靠工具重寫兩個檔案 | 你沒用這些工具，不採用 |
| D. 單一來源資料夾＋產生器（rulesync、ruler） | AI 多時最穩，還能在 CI 擋手改；但多學一個工具 | 超過三個 AI 時再升級 |
| E. 只放 AGENTS.md、不建 CLAUDE.md | 最省事；但 agents.md 官網沒列 Claude Code，資料包之間說法不一致，rulesync 資料包推論可能讓 Claude 讀兩次（未實測） | **不建議** |

> **資料包分歧：** 「沒有 CLAUDE.md 時，Claude Code 會不會讀 AGENTS.md」——rulesync、docguard 資料包說會，agents.md 官網相容清單沒列 Claude Code。本方案不依賴這個行為。

### 2-2 分層與優先順序

| 層 | Claude Code | Codex | 這個專案放什麼 |
|---|---|---|---|
| 個人（全域） | `~/.claude/CLAUDE.md` | `~/.codex/AGENTS.md` | 只放個人偏好（回覆語言、慣用語音輸入的同音字提醒）；**不放專案規則**，否則兩個 AI 的個人層會各寫各的 |
| 專案 | `CLAUDE.md`（匯入 `AGENTS.md`） | `AGENTS.md`（上限 32 KiB） | 唯一正本：憲法、優先順序、工作流程、登記簿 |
| 子資料夾 | 讀到該資料夾檔案時才載入 | 巢狀 `AGENTS.md`，越近越優先 | 例如 `functions/`、`content/` 的局部規則；**只能加嚴，不能放寬**（ECC module-governance：「Local rules cannot waive project-wide constraints」）。因為不少工具只在對話開始時讀一次規則，子資料夾規則可能讀不到，重要的先在根檔寫一行「在 `functions/` 要…」（BMAD，[best-practices.md#L49-L55](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/references/best-practices.md#L49-L55)） |
| 個人覆寫 | `CLAUDE.local.md`（不進 git） | — | 不放規則 |
| 流程與角色 | `.claude/skills/`、`docs/ai/roles/` | `.agents/skills/`、同一份角色檔 | 需要時才載入，平常不佔 context |
| 機械強制 | hooks、CI | hooks（需啟用）、CI | 能用檢查擋的就不要只寫成文字規則（BMAD、openai/skills Surface Map） |

放哪裡的簡單判斷（openai/skills 的 Surface Map，[SKILL.md#L86-L100](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/openai-docs/SKILL.md#L86-L100)）：一次性要求→對話裡講；長期規則→`AGENTS.md`；可重複的流程→skill；要機械強制→hook／CI；要定時跑→排程。

**優先順序**（範本第 0 節）：老闆在這次對話的指示 ＞ 最近的 `AGENTS.md` ＞ 本檔 ＞ `docs/ai/` 中 `active` 的文件 ＞ AI 自己的判斷。依據是 agents.md 的 FAQ（[FAQSection.tsx#L18-L21](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L18-L21)）、superpowers（[using-superpowers#L63-L65](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/using-superpowers/SKILL.md#L63-L65)）與 Backlog.md（實作事實以設定檔為準，文件與事實不符要回報為過期，[AGENTS.md#L14-L19](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L14-L19)）。兩條有效規則互相矛盾時**不准自己挑一條**，停手寫進「待老闆決定」（BMAD：兩條都有效卻矛盾，本身就是缺陷）。

### 2-3 怎麼避免各 AI 各寫一份

做法是「規則＋檢查」兩層，光靠規則一定會破功：

| 措施 | 內容 | 巡檢怎麼抓 |
|---|---|---|
| 一條規則只寫一處 | spec-kit 的核心觀念：「把規則複製到別處就會漂移」（[constitution-sync README#L69-L96](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/presets/constitution-sync/README.md#L69-L96)）。BMAD：同一條規則不可出現在兩個會被載入的檔案 | D1：完全相同的長句；D3：語意重複（AI） |
| `CLAUDE.md` 只匯入、只放 Claude 專屬 | 範本限制 40 行內 | C10：沒有 `@AGENTS.md` 或過長 |
| 不准新增別的規則檔 | `AGENTS.md` 第 8 節「登記簿」列出允許的規則檔；`GEMINI.md`、`.cursorrules`、`AGENTS.override.md`（Codex 會用它取代同層 `AGENTS.md`，容易變隱形分岔，docguard [instruction-scopes.mjs#L9-L21](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/scanners/instruction-scopes.mjs#L9-L21)）出現就報 | C13 |
| AI 的本機設定不當規則來源 | 「未來協作者需要知道的，都寫進 `AGENTS.md`」（blockwatch，[AGENTS.md#L273-L295](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L273-L295)） | C13 |
| 技能只有一份正本 | `.agents/skills/` 為正本，`.claude/skills` 指向它（openai/skills 資料包的保險做法）。Claude 版和 Codex 版技能副本會各自漂移，ECC 資料包明說沒有檢查這件事，所以要自己補 | D6 |
| 刻意分岔要登記 | `AGENTS.md` 登記簿寫「路徑＋原因」，沒登記的分岔一律當漂移 | D6、C13 |
| 每個 AI 留下可辨識的痕跡 | commit 訊息 `[claude] T-0012 …`／`[codex] T-0012 …`（ruler 要求不同 AI 用不同 commit author，[.ruler/AGENTS.md](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/.ruler/AGENTS.md)；範本改用訊息前綴，免設定） | M3：commit 沒有任務編號或沒交接 |

### 2-4 `AGENTS.md` 該寫什麼

依 BMAD 的取捨（[00-summary.md](00-summary.md) 2-4 節）：

- **該寫：** 程式碼表達不了的政策、與預設不同的慣例、**有實際證據的陷阱**、跨元件規則。
- **不該寫：** 目錄樹、技術棧清單、linter 管得了的風格、空話、貼上的程式碼、歷史敘述。
- **長度：** 150 行內、32 KiB 以下。spec-kit 自己的 [AGENTS.md](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/AGENTS.md#L1-L76) 只有 76 行，每段都是「做 X 之前，先讀 Y」。
- **憲法放最上面：** 5～10 條不可違反的事，加編號 `R-001…`、版本號與變更紀錄（spec-kit 憲法的 SemVer＋批准日＋Sync Impact Report 做法，[constitution.md#L96-L104](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L96-L104)）。範本預填了適合你的草稿：AI 不得部署正式環境、不得改 Firebase 規則與金鑰、庫存異動必留紀錄、金額由程式計算（AI 不心算，centminmod 的做法）、不得刪資料、廣告預算只有你能動。**這是範例，要你本人確認。**
- **多 AI 必備三條**（[00-summary.md](00-summary.md) 2-5 節）：交接時重新從磁碟讀檔；不准還原別的 AI 未提交的修改；「調查或審查」只授權分析，不授權實作。範本 R-009、R-010 與工作流程第 1 步已寫入。
- **排程 AI 的守則** 也寫在 `AGENTS.md`（第 6 節），因為不是只有巡檢員會被排程。

### 2-5 什麼時候升級成同步工具

出現第三個 AI 工具（Cursor、Gemini…）時，改用 rulesync 或 ruler：從一個資料夾產生各工具的規則檔，CI 跑 `generate --check` 擋手改（rulesync 的守門組合見 [faq.md#L126-L142](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/faq.md#L126-L142)）。升級時 `AGENTS.md` 的內容可原樣搬進單一來源資料夾，所以現在這樣做不會白費。

---

## 3. 角色表

### 3-1 設計原則（多家一致）

1. **實作者 ≠ 驗收者**，兩者要是不同的 AI。
2. **審查與巡檢角色唯讀**。注意：Codex 的角色權限只是預設值、`allowed-tools` 只是文字建議（openai/skills [differences.md#L30-L34](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L30-L34)、[#L51-L64](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L51-L64)），所以讓 Codex 當審查或複查時，要靠執行時的唯讀沙箱，不能只靠角色說明。
3. **只委派一層**：角色不呼叫角色，由你或規劃角色整合（addyosmani，[orchestration-patterns.md#L282-L339](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/references/orchestration-patterns.md#L282-L339)）。
4. **每個角色都寫兩件事：「不負責什麼」和固定輸出格式**（agency-agents 的「NOT RESPONSIBLE FOR」欄最能防兩個 AI 搶同一件事）。
5. **「沒找到問題」也是有效結果**，但要列出沒檢查到的範圍。
6. **決策權留給人**（BMAD、Backlog、living-docs、majiu 都這樣設計）。

只有 5～6 個 AI 角色，不要把 166／202／283 個角色整包裝進來。

### 3-2 角色一覽

預設分工把「規劃、文件、巡檢、內容」給 Claude（讀全專案 context 大、寫文件穩），「實作」給 Codex；因為實作者和驗收者要不同，所以 reviewer 是 Claude。你可以對調，限制只有不能同一個 AI 做完又驗收。

| 角色 | 預設由誰 | 職責 | 輸入 → 輸出 | 禁止事項 | 角色檔 |
|---|---|---|---|---|---|
| **owner（老闆）** | 你 | 核准規則、裁決衝突、標 `done`／`dropped`、部署、廣告預算 | 巡檢報告、審查結論 → 一句話裁決 | — | [owner.md](templates/roles/owner.md) |
| **planner（規劃）** | Claude | 拆任務，寫驗收條件與驗證方式；把你點頭的巡檢發現轉成任務 | 需求、報告 → `TASKS.md` 區塊 | 不寫程式、不標 done、不裁決衝突 | [planner.md](templates/roles/planner.md) |
| **implementer（實作）** | Codex | 認領→最小修改→跑驗證→交接 | 一個任務 → 程式碼＋驗證結果＋handoff | 不改規則檔與 Firebase 規則、不部署、不順手重構、不自己驗收 | [implementer.md](templates/roles/implementer.md) |
| **reviewer（驗收）** | 與實作者不同的 AI | 逐條對驗收條件找證據；每週資安抽查 | `review` 任務＋diff → 通過／不通過＋證據 | 唯讀；不修程式、不標 done、不發明需求 | [reviewer.md](templates/roles/reviewer.md) |
| **doc-keeper（文件管理）** | Claude | 維護 `AGENTS.md` 與 `docs/ai/`；取代舊文件、更新 INDEX | 你核准的發現、新決策 → 更新後的文件、`DEC-xxxx` | 不自己決定誰贏、不刪檔、不改程式 | [doc-keeper.md](templates/roles/doc-keeper.md) |
| **patrol（每日巡檢）** | Claude（Codex 複查） | 找漏掉、重複、衝突、過期、斷引用、待辦沒人接 | 整個專案＋git 紀錄 → `reports/patrol-日期.md` | **只寫 `reports/`**；不建任務、不修、不發問 | [patrol.md](templates/roles/patrol.md) |
| **content-ads（電商內容與廣告）** | Claude | 商品文案、廣告多版本、影片腳本 | 匯出的商品資料 → `content/` 內容檔（附數字出處表） | 不編數字、不碰廣告後台與預算、不用授權不明素材 | [content-ads.md](templates/roles/content-ads.md) |

> 資安抽查不另設角色，是 reviewer 的每週模式（agency-agents 的 security-ai-generated-code-auditor），省得角色變多。

### 3-3 每個角色該裝的 skills（標明來源）

「裝」的意思是抄進 `.agents/skills/` 或把重點寫進角色檔，**不是整包安裝**。授權：以下專案多為 MIT；Apache-2.0 的（codument、anthropics 的 prompt-audit）散布時要附 NOTICE；BMAD 的名稱是商標。個人使用沒有限制，之後商用再看 [00-summary.md](00-summary.md) 第 8 點。

| 角色 | skill／做法 | 來源專案（資料包） | 位置 | 拿來做什麼 |
|---|---|---|---|---|
| planner | planning-and-task-breakdown | [addyosmani/agent-skills](addyosmani__agent-skills.md) | [SKILL.md#L79-L104](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/planning-and-task-breakdown/SKILL.md#L79-L104) | 拆任務、排順序 |
| planner | define-goal | [openai/skills](openai__skills.md) | [SKILL.md](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/define-goal/SKILL.md) | 把模糊需求寫成可驗收目標 |
| planner | triage／AGENT-BRIEF | [mattpocock/skills](mattpocock__skills.md) | [AGENT-BRIEF.md#L39-L68](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/triage/AGENT-BRIEF.md#L39-L68) | 任務簡報寫到「不看對話也能動手」 |
| planner | propose（選用） | [OpenSpec](Fission-AI__OpenSpec.md) | — | 功能規格常打架時再引進 |
| implementer | tdd | [mattpocock/skills](mattpocock__skills.md) | 資料包只列名稱 | 先寫會失敗的測試 |
| implementer | minimal-change-engineer | [agency-agents](msitarzewski__agency-agents.md) | [engineering-minimal-change-engineer.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/engineering/engineering-minimal-change-engineer.md)（路徑依資料包組合） | 只改被要求的地方，減少互相覆蓋 |
| implementer | verification-before-completion | [superpowers](obra__superpowers.md) | [SKILL.md#L14-L48](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/verification-before-completion/SKILL.md#L14-L48) | 沒跑驗證不准說完成 |
| implementer | 自寫：倉儲領域技能 | centminmod 概念：數字由程式算，AI 不加總 | [task-breakdown/SKILL.md#L34-L39](https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/task-breakdown/SKILL.md#L34-L39) | 庫存、金額、成本、毛利 |
| reviewer | code-review | [mattpocock/skills](mattpocock__skills.md) | [SKILL.md#L15-L89](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/code-review/SKILL.md#L15-L89) | 規範與規格兩軸審查 |
| reviewer | task-reviewer prompt | [superpowers](obra__superpowers.md) | [task-reviewer-prompt.md](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/task-reviewer-prompt.md) | 逐任務審查與回報格式 |
| reviewer | adversarial-reviewer | [codument](jakubsuplicki__codument.md) | [adversarial-reviewer.md](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/agents/adversarial-reviewer.md) | 只寫會失敗的測試，不改程式 |
| reviewer | evidence-collector／security-ai-generated-code-auditor | [agency-agents](msitarzewski__agency-agents.md) | [evidence-collector](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/testing/testing-evidence-collector.md#L19-L37)、[資安](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/security/security-ai-generated-code-auditor.md) | 收證據、每週資安抽查 |
| doc-keeper | bmad-project-context | [BMAD-METHOD](bmad-code-org__BMAD-METHOD.md) | [SKILL.md#L89-L91](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/SKILL.md#L89-L91) | 規則取捨；`Verified <日期> against <SHA>` |
| doc-keeper | living-docs 五條不漂移原則、取代橫幅、ADR | [living-docs-skill](ejklock__living-docs-skill.md) | [spine.md#L1-L22](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/spine.md#L1-L22) | 只抄規則文字，不裝執行檔 |
| doc-keeper | docs-drift-editor、memory-curator | [VoltAgent](VoltAgent__awesome-claude-code-subagents.md) | [memory-curator.md#L41-L51](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L41-L51) | 舊事實標 `closed <日期>, superseded by …` |
| patrol | daily-patrol（自寫） | 本方案 [SKILL.md](templates/skills/daily-patrol/SKILL.md) | — | 主技能 |
| patrol | codebase-archaeologist | [agency-agents](msitarzewski__agency-agents.md) | [檔案](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md) | 多 AI 改同專案的漂移稽核 |
| patrol | doc-maintenance／wiki-lint／issue-triage | [paperclip](paperclipai__paperclip.md) | [doc-maintenance#L34-L60](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/doc-maintenance/SKILL.md#L34-L60) | cursor 增量巡讀、分級、待辦卡住判斷 |
| patrol | prompt-audit | [anthropics/skills](anthropics__skills.md) | [prompt-audit.md#L147](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L147) | 用 git blame 判新舊 |
| patrol | 機械檢查（選用） | [docguard](raccioly__docguard.md)、[blockwatch](mennanov__blockwatch.md) | [agents.mjs#L56-L92](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/commands/agents.mjs#L56-L92) | 範本自帶 `mech-check.sh`；不夠再加這兩個 |
| content-ads | ad-creative | coreyhaines31/marketingskills（[03 資料包](../03-video-script/coreyhaines31__marketingskills.md)） | [SKILL.md#L222-L262](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/SKILL.md#L222-L262) | 廣告 Hook 矩陣、多版本 |
| content-ads | claim 審計概念 | [pm-review-copilot](wikiiizhao__pm-review-copilot.md) | [SKILL.md#L372-L401](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L372-L401) | 每個數字都要有證據狀態 |
| content-ads | 影片腳本與出片工具 | [03-video-script 總結](../03-video-script/00-summary.md) | — | 授權地雷很多，先看那份總結 |

### 3-4 交接怎麼做

- **交接單是檔案，不是對話。** 任務檔寫到「未來的 AI 不看對話也能動手」（Backlog [task-creation.md#L58-L67](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-creation.md#L58-L67)）。
- **交接時重讀，不靠記憶。** 對話被壓縮後以檔案和 `git log` 為準（OpenSpec [instructions.ts#L258-L300](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/commands/workflow/instructions.ts#L258-L300)；superpowers：「你記得的只是摘要」）。
- **帳本只追加。** 狀態四選一 `DONE`／`DONE_WITH_CONCERNS`／`NEEDS_CONTEXT`／`BLOCKED`（superpowers）；欄位用 pm-review-copilot 交接筆記的五欄（發生什麼變化／目前確定為真／阻塞／下一步／下次先讀），再加 commit 範圍（[init_pm_memory.py#L375-L382](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L375-L382)）。
- **先認領再開工**（mattpocock：先 assign 給自己再動手；paperclip 用原子 checkout，搶到同一件事回 409。本範本是人工版：owner 欄）。
- **沒交出去的裁決＝秘密做的決定**（superpowers [final-review.md#L33-L42](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/final-review.md#L33-L42)）：所以每件需要你拍板的事，都要寫成 handoff 的「待老闆決定：」，巡檢會追蹤沒回應的（T6）。
- **誰能把任務推到哪個狀態**（借 BMAD 的狀態寫入權限，簡化版）：implementer 只能到 `review`；`done`、`dropped` 只有你。

### 3-5 誰能改哪些檔

| 檔案 | owner | planner | implementer | reviewer | doc-keeper | patrol | content-ads |
|---|---|---|---|---|---|---|---|
| `AGENTS.md`、`CLAUDE.md` | 核准 | — | — | — | 改（要核准） | — | — |
| `docs/ai/roles/*`、`conventions.md`、`INDEX.md` | 核准 | — | — | — | 改 | — | — |
| `TASKS.md` | done／dropped | 建、改 | 自己的任務（到 review） | 審查欄 | — | — | — |
| `handoff.md` | 決定 | 追加 | 追加 | 追加 | 追加 | — | 追加 |
| `decisions/` | 核准 | — | — | — | 建、取代 | — | — |
| 程式碼、測試 | — | — | 改（任務範圍內） | **唯讀** | — | **唯讀** | — |
| `reports/` | 讀 | 讀 | — | — | — | **寫（唯一）** | — |
| `content/` | 讀 | — | — | 查核 | — | — | 改 |

---

## 4. 文件與版本規範：讓「哪個是新版」一眼可判斷

完整規範在 [docs-conventions.md](templates/docs-conventions.md)，這裡講設計。

### 4-1 一眼判斷的五個訊號

打開任何文件，3 秒內回答「這份是現行嗎」：

1. 看標頭 `status`：只有 `active` 是現行；`superseded`、`archived` 禁止照做；`draft` 還不能當規則。
2. `superseded` 的文件，第一行就有橫幅：`⚠️ 已被 DEC-0007 取代 — 不要照這份做`，並指向新文件。
3. 看 `INDEX.md`：一張表列出所有文件與狀態（巡檢會對照標頭，不一致就報）。
4. 看 `updated` 與 `review_by`：過了 `review_by` 就是「可能過期」，要重新查證。
5. 看 `verified_at`／`verified_against`：這份文件在哪個日期、對照哪個 commit 查證過（BMAD 的 `Verified <日期> against <SHA>`）。

### 4-2 標頭欄位

```yaml
---
doc_id: RULES-AGENTS        # 全專案唯一、永不重用
title: 共用規則（AGENTS.md）
type: rules                 # rules / role / decision / howto / reference / index / ledger / report
status: active              # draft / active / superseded / archived
version: 1.0.0              # 規則用 SemVer；其他用日期或流水號
updated: 2026-11-05         # 最後實質修改日
owner_role: doc-keeper      # 負責維護的角色
supersedes: none            # 這份取代了誰（doc_id）
superseded_by: none         # 被誰取代；status 為 superseded 時不可為 none
verified_at: 2026-11-05     # （選）最後對照事實查證的日期
verified_against: a1b2c3d   # （選）查證當時的 git 短 SHA
review_by: 2026-12-05       # active 的規則／說明必填：最晚複查日
---
```

設計依據：spec-kit 憲法的 SemVer＋批准日＋最後修訂日；pm-review-copilot 的生命週期欄位（`status`、`valid_until`、`superseded_by`，[SKILL.md#L268-L284](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L268-L284)）；living-docs 的 `supersedes`／`superseded_by`（取代必須雙向一致，巡檢 C3 檢查）。

> **限制：** living-docs 的 `supersedes` 是單一值，一對多取代它做不到，作者用 `Deprecated` 代替（見 [living-docs-skill 資料包](ejklock__living-docs-skill.md) 的「防新舊版本衝突」段）。本範本同樣是單一值；真的一對多時，用新文件取代主要的一份，其他標 `archived` 並在變更紀錄說明。

### 4-3 狀態流轉與取代

```
draft ──核准──▶ active ──被新版取代──▶ superseded ──老闆同意封存──▶ archived（搬到 docs/archive/，唯讀）
```

取代的六個步驟（doc-keeper 做、老闆同意後）：新文件標 `supersedes` → 舊文件標 `superseded_by` 並改 `status` → 舊文件加橫幅 → 搜尋整個專案改掉還指向舊文件的引用 → 更新 `INDEX.md` → handoff 追加一筆。**舊的不刪**（living-docs「只取代、不改寫」；VoltAgent memory-curator「舊事實標成 `closed <日期>, superseded by <slug>`」）。

新舊衝突時**怎麼判斷誰新**：看標頭，再用 `git log`／`git blame` 看哪段較新，最後看 `verified_*`。不看檔名、不看檔案時間戳，也不信檔案自己寫的「已取代」（anthropics prompt-audit，[#L147](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L147)）。而且**最新不一定正確**：要先用證據驗證，避免 AI 用錯的新值覆蓋對的舊值（memory-checkup、agency-agents）。

### 4-4 決策紀錄（ADR）

重要決定一件一檔：`docs/ai/decisions/DEC-0001-<slug>.md`，含背景、決定、考慮過的其他做法、後果與驗證。**AI 只能提出，你確認後才算 `active`**（living-docs 規則）；決策不改寫，變了就開新的去取代舊的。第一份決策 [DEC-0001](templates/starter/DEC-0001-use-agents-md.md) 就是「規則正本統一放 AGENTS.md」。

### 4-5 待辦格式

```
### T-0012 | in_progress | owner: codex | updated: 2026-11-05
- 目標 / 驗收條件（可勾選）/ 驗證方式 / 相關檔案 / 來源 / 阻塞 / 驗證結果 / 審查
```

標題行格式固定，巡檢才能機器解析。狀態：`todo`／`in_progress`／`blocked`／`review`／`done`／`dropped`。規則：任務只增不減；發現漏做就**追加**新任務、不改舊任務（spec-kit [converge.md#L73-L83](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/converge.md#L73-L83)）；建任務前先搜尋有沒有重複（Backlog [task-creation.md#L5-L20](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-creation.md#L5-L20)）。任務超過約 30 個且常打架時，再評估換成 Backlog.md（它有 `backlog doctor` 查重複 ID）。

---

## 5. 每日巡檢

### 5-1 檢查哪些（七類，完整清單見 [checks.md](templates/skills/daily-patrol/checks.md)）

分類法借 spec-kit analyze 的六類（重複、模糊、規格不足、違憲、覆蓋缺口、不一致，[analyze.md#L119-L122](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L119-L122)）與 paperclip wiki-lint 的七類，改成你要的六類加一類格式：

| 類別 | 找什麼 | 機械檢查（腳本，免費） | AI 判讀（語意） |
|---|---|---|---|
| **M 漏掉** | `done` 沒有驗證證據；commit 沒交接；決策沒任務；程式改了文件沒改；跳過的檢查被當通過 | M1、M3 | M2、M4–M8 |
| **D 重複** | 同一規則複製；重複 ID；同一責任多處實作；角色或技能職責重疊；技能副本分岔 | D1、D2、D6 | D3–D5 |
| **C 衝突（含新舊版本）** | 兩份現行講法不同；取代關係不一致；舊文件仍被引用；版本號多來源；文件與程式不符；違反憲法；疑似金鑰；未登記的規則檔 | C3、C4、C10–C13 | C1、C2、C5–C9、C14 |
| **S 過期** | 超過 `review_by`；查證後程式又改很多；同一指標多個值；draft／superseded 放太久 | S1、S2、S4、S6 | S3、S5 |
| **R 斷掉的引用** | 路徑不存在；ID 指到不存在的文件；技能 `name` 對不上資料夾；INDEX 列出不存在的檔 | R1、R3、R4、R6 | R2、R5 |
| **T 待辦沒人接** | 沒 owner；`in_progress` 卡超過 3 天；`blocked` 沒原因；NEEDS_CONTEXT／待老闆決定沒人回；實作者＝驗收者 | T1–T3、T6、T7 | T4、T5、T8 |
| **H 標頭與格式** | 標頭缺欄位、狀態值不合法、`<填寫>` 沒填、AGENTS.md 太長（>32 KiB）、INDEX 不一致 | H1–H5 | H6、H7 |

### 5-2 流程：機械 → AI 唯讀 → 另一個 AI 複查 → 你拍板

1. **範圍（步驟 0–1）：** 用 cursor 記住上次巡到哪個 commit，每天只看 `git log 上次..HEAD`；每週一再全掃（paperclip doc-maintenance 的 `.doc-review-cursor` 做法，[SKILL.md#L34-L60](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/doc-maintenance/SKILL.md#L34-L60)）。
2. **機械檢查：** `scripts/mech-check.sh`，輸出每行一個發現。便宜、不會幻覺，所以先跑。
3. **Claude 唯讀判讀：** 語意重複、規則矛盾、文件與程式不符、新舊寫法並存。每條發現照 superpowers 的格式：發現、證據（`path:line`）、信心；沒發現寫 `none found — checked: …`；回報讀了哪些檔、哪些沒讀到（graphify 的覆蓋率回報）。
4. **Codex 複查：** 以 `verify` 模式逐條讀原始碼，判定成立／不成立／無法判定（rulesync 的 opencode-gpt-review：GPT 初審、Claude 逐條查證；centminmod 的 Corroborated／Solo／Disputed 分類）。另一個 AI 複查是為了壓低單一模型的誤報與漏報。
5. **你拍板：** 報告最上面是「需要你決定」；你點頭後，planner 建任務、doc-keeper 改文件。

### 5-3 怎麼判斷（幾條硬規則）

- **證據優先：** 每條發現要有 `path:line` 或指令輸出；沒證據只能放「待你確認」，信心低的最高 MEDIUM。
- **新舊用 git 判斷**（見 4-3）。**只提供事實，不判定誰對**；能用事實確定的才寫「依證據以 X 為準」，不能確定的列進「需要你決定」。
- **同層矛盾才算衝突：** 範圍較窄的規則若自己聲明覆寫上層，不算衝突（prompt-audit）。
- **數字交給腳本：** 行數、筆數、天數不讓 AI 心算。
- **不誤報：** 歷史紀錄（handoff、decisions）不查斷引用；整段複製才算重複，一句話指回正本是對的（prompt-audit：正常運作的重複不是垃圾，[#L182](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L182)）。
- **失敗不能假裝通過：** 任何一塊掃描失敗或略過，整份標 `partial`（rulesync 的做法：任何一塊失敗整份失敗）。

### 5-4 嚴重度

| 嚴重度 | 判斷 | 處理速度 |
|---|---|---|
| **CRITICAL** | 違反憲法 R-xxx；金額／庫存／部署／金鑰相關的現行規則互相矛盾；疑似金鑰進 git | 當天 |
| **HIGH** | `done` 沒證據；兩份現行文件事實不同；`AGENTS.md`／`CLAUDE.md` 斷引用或沒匯入；實作者＝驗收者；舊文件仍被當依據；任務卡 ≥7 天 | 本週 |
| **MEDIUM** | 過期、重複、一般斷引用、卡 ≥3 天、交接缺口 | 兩週 |
| **LOW** | 格式、孤兒文件、超長、draft 放太久 | 有空 |

同一問題連續 3 次巡檢都在就升一級；涉及錢、庫存、部署、金鑰直接升一級；你回覆「不用處理」的標「已知悉」不再計入。

### 5-5 報告格式

存到 `reports/patrol-YYYY-MM-DD.md`，表格欄位固定（借 spec-kit analyze 的報告表，[analyze.md#L162-L198](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L162-L198)）：

| 編號 | 類別 | 嚴重度 | 位置 | 問題 | 建議處理 |
|---|---|---|---|---|---|
| C-01 | 衝突（C2） | CRITICAL | AGENTS.md:42／docs/ai/howto-stock.md:8 | 庫存單位兩份現行文件不同；git blame 顯示後者較新（信心：高） | → 需要你決定 |
| M-01 | 漏掉（M1） | HIGH | docs/ai/TASKS.md:57（T-0012） | 狀態 `done` 但「驗證結果」空白（信心：高） | 退回 `review` 補驗證 |
| D-01 | 重複（D1） | MEDIUM | CLAUDE.md:17／AGENTS.md:31 | 完全相同的規則句子 | 刪 CLAUDE.md 的，只留正本 |

報告段落：標頭摘要（範圍、模式、狀態 complete／partial、各嚴重度數量）→ **需要你決定**（最多 7 項，每項附選項與後果）→ 發現表 → 各類別結果（含 `none found — checked: …`）→ 與上次比較（新發現／已解決／持續 N 天）→ 覆蓋範圍 → 機械檢查原始輸出 → 複查結果。報告骨架見 [SKILL.md](templates/skills/daily-patrol/SKILL.md) 步驟 5，完整範本與填寫規則在同資料夾的 `report-template.md`。

### 5-6 多久跑一次

| 頻率 | 做什麼 | 為什麼 |
|---|---|---|
| **每天早上（台灣 06:17）** | `incremental`：只看新 commit 與變動檔；標頭、INDEX、任務板、交接帳本一律全看（很小） | 資料包裡各家排程多半每週跑一次，沒人做每日跨 AI 巡讀；你的專案有兩個 AI 每天在改，每週一次太慢，漂移會累積 |
| **每週一** | `full`：全部文件、技能；程式碼重複實作抽查（庫存扣減、金額計算、成本毛利）；reviewer 資安抽查 | 語意層的重複比較花 token，一週做一次夠了 |
| **事件觸發** | 大改動後、要部署前，手動叫一次 | — |

### 5-7 怎麼排程

> 下表標明資料包「確認過」與「未確認」的部分。細節與可複製的指令在 [templates/README.md](templates/README.md)。

| 方式 | 怎麼做 | 優點 | 缺點／未確認 |
|---|---|---|---|
| **A. Claude Code 排程任務** | 排程提示詞：「使用 daily-patrol 技能，模式 incremental，只寫 reports/」 | 最簡單，不用自己維護 cron | 資料包只提到「可以用排程任務」（spec-kit、centminmod 資料包），**設定步驟未涵蓋**，依官方文件；`/loop` 只適合人在電腦前（ECC） |
| **B. 系統排程＋指令列** | cron／Windows 工作排程器跑 `claude -p "…"`（ECC 的 autonomous-agent-harness 示範，[#L85-L113](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/autonomous-agent-harness/SKILL.md#L85-L113)）；Codex 複查用 `codex exec`（spec-kit 的 Codex 整合；centminmod 以 `codex exec -s read-only --json` 唯讀執行） | 完全由你控制；兩個 AI 都能接 | 電腦要開機；限制工具的旗標資料包**未涵蓋**，查 `--help` |
| **C. GitHub Actions** | `on: schedule`＋`cron: "17 22 * * *"`（UTC 22:17＝台灣 06:17；blockwatch 的 `trusted-checks.yml` 示範寫法，[#L1-L27](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/.github/workflows/trusted-checks.yml#L1-L27)） | 電腦不用開機；權限可設唯讀 | 範本只放「機械檢查」：AI 部分需要 API 金鑰，資料包沒有可驗證的做法，**不提供**。GitHub 排程只在預設分支跑、長期沒動靜可能被停用（GitHub 一般行為，非資料包內容，請自行確認） |
| **D. Codex 內排程** | openai/skills 的 Surface Map 把「定時跑」歸為 automation | 讓 Codex 做複查 | **設定步驟未涵蓋**，查官方文件 |

建議起手：**B（本機排程）跑完整巡檢＋C（GitHub Actions）跑機械檢查當保險**；等流程穩了再改 A。

### 5-8 「只讀不改、改動要人確認」怎麼落實

分三層，越下面越可靠：

1. **說明層：** `SKILL.md` 讀寫界線、`patrol.md` 角色檔、`AGENTS.md` 第 6 節都寫了「只能寫 `reports/`」。
2. **驗證層：** 巡檢結束前自我檢查 `git status --porcelain` 只多出 `reports/`；**隔天的巡檢會再看一次**（M／C9：有沒有哪個 commit 是排程巡檢留下的）。
3. **執行層（最可靠）：** 排程時用工具權限限制只允許讀取和寫 `reports/`；Codex 用唯讀沙箱（因為 Codex 角色權限只是預設值）。旗標寫法依你的版本。

改動的流程永遠是：**巡檢報告（建議）→ 你點頭 → planner 建任務（來源寫 `patrol-日期#編號`）→ 角色執行 → reviewer 驗收**。巡檢員自己**不建任務、不開 issue、不開 PR**，避免排程 AI 的三個常見風險（資料包 4-5 節）：沒人回答時卡住、開出雜訊 PR、重複開工單。排程 AI 守則（合併 docguard 的 `.jules/RULES.md`、paperclip、mattpocock、rulesync）已寫進範本：不發問、沒發現就安靜、一塊失敗整份失敗、新排程預設暫停到你確認。

### 5-9 已知限制（請先知道）

- **語意層的重複與矛盾沒有確定性工具**，全靠 LLM 判讀，會有誤報與漏報；所以要複查、所以要你拍板。
- **中文支援要自己補：** docguard 的規則抽取只認英文；agency-agents 的重複偵測以英文斷詞；memory-checkup 的數字關鍵字寫死簡體。範本的 `mech-check.sh` 不依賴這些，但語意比對要靠 AI。
- **`mech-check.sh` 是本方案自寫的**，用範例專案測過（乾淨安裝零誤報，故意製造的問題抓得到），**沒有在你的實際專案跑過**。第一週請抽查，誤報多就調 `checks.md` D 部分與腳本排除規則。腳本要 bash／awk／git；macOS 預設的舊版 bash 未實測。
- **任務板與程式碼的落差沒人自動抓：** OpenSpec 不檢查，Backlog 的驗收勾選是否強制「未確認」。目前靠 AI 判讀（M8、reviewer 的證據要求）。
- **日期型過期偵測很少有人做：** 有實作的只有 docguard、majiu（30／90 天）、pm-review-copilot；本範本用 `review_by` 與 `verified_*` 補上，但門檻（30／60 天）是建議值，要依你的節奏調。

---

## 6. 導入步驟

### 第 1 天（約 1～2 小時）：先有一份規則、一個任務板、一本帳

1. 把範本裝進你的倉儲專案（[README](templates/README.md) 的安裝指令）。
2. 打開 `AGENTS.md`：把 R-001 到 R-010 **改成你真的要的規則**，填完所有 `<填寫>`。寫不出來的先留空，不要寫空話（BMAD）。
3. 實測匯入：Claude Code、Codex 各開新對話，問「R-001 是什麼」，兩邊都答對才算完成。
4. 在 `docs/ai/handoff.md` 追加一筆「老闆決定：規則 v1.0.0 核准」（讓規則有核准紀錄）。
5. 手動叫一次 `daily-patrol`（T-0002），看第一份報告長什麼樣。第一次會有一堆 H4（佔位字串）與 T1，正常。
6. 把你舊的規則文件（如果有）整理：對照 `AGENTS.md`，重複的標 `superseded` 並加橫幅，不要刪。

**第 1 天結束時要有：** `AGENTS.md`、`CLAUDE.md`、`docs/ai/` 全部、`reports/` 一份報告。

### 第 1 週：角色與巡檢上線

| 天 | 做什麼 |
|---|---|
| 第 2 天 | 從真實任務開始用：讓 Claude 當 planner 開 3 個真任務（含驗收條件）；Codex 當 implementer 做 1 個；Claude 當 reviewer 驗收；你標 `done`。體會一次完整接力，記下卡住的地方改角色檔 |
| 第 3 天 | 補倉儲領域技能（庫存異動、金額計算、Firestore 結構的慣例與陷阱）：先寫在角色檔，穩定後再抽成技能。技能 description 放繁中觸發詞，並跑 `evals/triggers.json` 實測 |
| 第 4 天 | 設定排程（先暫停）：本機排程跑 `claude -p` 的 incremental；GitHub Actions 跑機械檢查。手動觸發兩次確認報告可讀 |
| 第 5 天 | 加上 Codex 複查（`verify` 模式，唯讀沙箱）；故意製造 3 個問題（`done` 不填驗證結果、複製一條規則到 `CLAUDE.md`、刪掉被引用的文件），確認隔天報告抓得到；然後復原 |
| 第 6–7 天 | 啟用排程；每天花 5 分鐘看「需要你決定」；誤報多就調範本 |

### 第 2～4 週：養成習慣、再決定要不要升級

- 每週看一次「持續未處理」，太久沒人處理的要嘛處理、要嘛你明確回「不用處理」。
- 把 content-ads（商品文案、廣告、影片腳本）的產出也納入任務板與巡檢（數字出處表是否齊全）。
- **升級時機：** 出現第三個 AI 工具 → 用 rulesync／ruler；功能規格常互相打架 → OpenSpec；任務超過約 30 個 → Backlog.md；AI 數量很多、要全自動排程看門狗 → Paperclip。都不是現在要做的事。

---

## 7. 參考來源

### 7-1 哪個點子來自哪個專案

| 點子 | 來源專案（資料包） | 具體位置 |
|---|---|---|
| `AGENTS.md` 檔名標準、最近的檔案優先 | [agents.md](agentsmd__agents.md.md) | [FAQSection.tsx#L18-L21](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L18-L21) |
| `CLAUDE.md` 匯入 AGENTS.md；AGENTS.md 該寫／不該寫 | [BMAD-METHOD](bmad-code-org__BMAD-METHOD.md) | [set-and-maintain-project-context.md#L64-L72](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/existing-codebases/set-and-maintain-project-context.md#L64-L72)、[best-practices.md#L1-L84](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/references/best-practices.md#L1-L84) |
| symlink 共用、事實優先序、不准還原別人修改、調查不等於實作、冷審查 | [Backlog.md](MrLesk__Backlog.md.md) | [CLAUDE.md](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/CLAUDE.md)、[AGENTS.md#L14-L37](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L14-L37)、[#L128-L153](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L128-L153)、[#L167-L176](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L167-L176) |
| 憲法（版本號、批准日、修訂紀錄）；「規則只寫一份」；analyze 六類與報告表；converge 只追加 | [spec-kit](github__spec-kit.md) | [constitution.md#L96-L104](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L96-L104)、[#L112-L119](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/constitution.md#L112-L119)、[constitution-sync README#L69-L96](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/presets/constitution-sync/README.md#L69-L96)、[analyze.md#L162-L198](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L162-L198)、[converge.md#L73-L83](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/converge.md#L73-L83) |
| 取代而不改寫、取代橫幅、五條不漂移原則、重號與索引漂移檢查 | [living-docs-skill](ejklock__living-docs-skill.md) | [spine.md#L1-L22](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/spine.md#L1-L22)、[duplicate_numbers.rs#L12-L35](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/duplicate_numbers.rs#L12-L35)、[index_drift.rs#L13-L36](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/index_drift.rs#L13-L36) |
| 生命週期狀態、新鮮度門檻、交接筆記五欄、風險訊號、claim 審計 | [pm-review-copilot](wikiiizhao__pm-review-copilot.md)（簡體，需轉繁） | [SKILL.md#L268-L284](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L268-L284)、[#L165-L201](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L165-L201)、[#L432-L441](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L432-L441) |
| 只讀健檢流程：過期數字、斷引用、日誌斷檔、孤兒檔；「最新不一定正確」 | [memory-checkup](Thomaszhou22__memory-checkup.md) | [memory_checkup.py#L101-L123](https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L101-L123)、[#L135-L153](https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L135-L153)、[#L155-L171](https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L155-L171)、[SKILL.md#L38-L47](https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md#L38-L47) |
| 規則重複／矛盾偵測、`agents --check`、Freshness、排程 AI 守則 | [docguard](raccioly__docguard.md) | [instruction-audit.mjs#L231-L242](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/scanners/instruction-audit.mjs#L231-L242)、[freshness.mjs#L272-L365](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/validators/freshness.mjs#L272-L365)、[.jules/RULES.md](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/.jules/RULES.md) |
| 版本號單一來源、確定性的 `same-as`／`keep-unique`、每週排程寫法 | [blockwatch](mennanov__blockwatch.md) | [blockwatch.toml#L17-L24](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/blockwatch.toml#L17-L24)、[trusted-checks.yml#L1-L27](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/.github/workflows/trusted-checks.yml#L1-L27) |
| 增量巡讀 cursor、七類分級、待辦卡住判斷 | [paperclip](paperclipai__paperclip.md) | [doc-maintenance#L34-L60](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/doc-maintenance/SKILL.md#L34-L60)、[wiki-lint](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/plugins/plugin-llm-wiki/skills/wiki-lint/SKILL.md)、[issue-triage](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/skills-catalog/catalog/bundled/paperclip-operations/issue-triage/SKILL.md) |
| 巡讀員角色（重複實作、新舊寫法並存、半套修復）、「不負責什麼」欄、證據收集、資安抽查 | [agency-agents](msitarzewski__agency-agents.md) | [codebase-archaeologist](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md)、[#L74-L86](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L74-L86)、[#L162-L172](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L162-L172) |
| 規則新舊用 git blame 判斷、同層才算衝突、正常重複不是垃圾 | [anthropics/skills](anthropics__skills.md) | [prompt-audit.md#L147](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L147)、[#L182](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L182) |
| 角色分工（控制者／實作者／審查者）、完成前驗證、四種交接狀態、description 只寫觸發情境 | [superpowers](obra__superpowers.md) | [final-review.md#L33-L42](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/final-review.md#L33-L42)、[verification-before-completion#L14-L48](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/verification-before-completion/SKILL.md#L14-L48)、[discovery.md#L53-L110](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/writing-skills/references/discovery.md#L53-L110) |
| Claude↔Codex 差異對照、技能路徑、唯讀權限只是預設值、Surface Map | [openai/skills](openai__skills.md) | [differences.md#L9-L93](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/migrate-to-codex/references/differences.md#L9-L93)、[openai-docs SKILL.md#L86-L100](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.system/openai-docs/SKILL.md#L86-L100) |
| 不同 AI 用不同 commit 作者；規則同步工具的升級路徑 | [ruler](intellectronica__ruler.md)、[rulesync](dyoshikawa__rulesync.md) | [.ruler/AGENTS.md](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/.ruler/AGENTS.md)、[faq.md#L126-L142](https://github.com/dyoshikawa/rulesync/blob/d088ccc8f436255115e0e7fb95f9ce0778375a4a/docs/faq.md#L126-L142) |
| 數字由程式計算、Claude 主控＋Codex 唯讀顧問（Corroborated／Solo／Disputed） | [centminmod](centminmod__my-claude-code-setup.md) | [task-breakdown/SKILL.md#L34-L39](https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/task-breakdown/SKILL.md#L34-L39) |
| 技能清單、本機排程教學（`/loop`、cron＋`claude -p`）、模組規則只能加嚴 | [ECC](affaan-m__ECC.md) | [autonomous-agent-harness#L85-L113](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/autonomous-agent-harness/SKILL.md#L85-L113)、[skill-stocktake#L159-L180](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/skill-stocktake/SKILL.md#L159-L180) |
| `doc_gardener` 巡檢骨架（規則檔超長、數字過期、同名分岔） | [wshobson/agents](wshobson__agents.md) | [doc_gardener.py#L669-L848](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L669-L848)、[#L716-L775](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L716-L775) |
| 角色檔範本、memory-curator、docs-drift-editor | [VoltAgent](VoltAgent__awesome-claude-code-subagents.md) | [memory-curator.md#L41-L51](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L41-L51) |
| 對抗式審查、skill-parity 測試 | [codument](jakubsuplicki__codument.md) | [adversarial-reviewer.md](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/agents/adversarial-reviewer.md) |
| 規劃、審查、task-breakdown、handoff、triage 技能 | [addyosmani/agent-skills](addyosmani__agent-skills.md)、[mattpocock/skills](mattpocock__skills.md) | 見 3-3 節表格 |
| 廣告素材與影片腳本 | [03-video-script 總結](../03-video-script/00-summary.md) | — |
| 台灣時間排程、報告「沒檢查到的範圍」、觸發測試 `evals/triggers.json` | blockwatch 資料包示範；graphify 覆蓋率回報；BMAD 觸發測試 | 見 [00-summary.md](00-summary.md) 4-4、5-5 節 |

### 7-2 資料包之間的分歧與「未確認」（本文沒有替你判定）

- **Codex 個人層技能路徑：** `~/.agents/skills/`（superpowers、rulesync、mattpocock）vs `~/.codex/skills`（openai skill-installer、living-docs、pm-review-copilot、paperclip）。本方案只用專案層 `.agents/skills/`（資料包一致）。
- **Codex 手動叫技能的符號：** 多數寫 `$技能名`，addyosmani 寫 `@skill-name`。
- **沒有 CLAUDE.md 時 Claude Code 會不會讀 AGENTS.md：** 見 2-1 節。本方案不依賴。
- **`@AGENTS.md` 在 Codex 會不會展開：** 未確認；不影響本方案。
- **Claude Code 會不會讀 `.agents/skills/`：** openai/skills 資料包寫未確認，所以用 symlink／複製。
- **`description` 能不能寫多行：** ECC 允許 `>`，agency-agents 的 lint 禁止，docguard 範例用多行。範本一律單行（最保險）。
- **Claude Code 排程任務、Codex automation、`claude -p` 限制工具的旗標、GitHub Actions 跑 AI：** 資料包沒有可驗證的設定步驟，範本沒有硬寫，README 已標「未確認」。
- **適合度 5 分的 ECC、wshobson：** 兩份資料包自己都建議不要整包安裝。

### 7-3 授權提醒（目前個人使用沒問題；之後商用再看）

- 本方案的範本是**改寫**的繁中版，不是原文；若你日後把含大段原文的檔案對外散布，要保留各專案的 MIT 版權聲明。
- Apache-2.0 的（codument、anthropics 的 prompt-audit、wshobson 的 conductor／superself）散布時要附 NOTICE 並標註修改。
- BMAD 的產品名稱與網域是商標，不要拿來命名你自己的工具。
- openai/skills 的 Figma 相關技能不要商用；anthropics/skills 的 docx／pdf／pptx／xlsx 是專有授權，不可複製改寫。
- agency-agents 的 `minimal-change-engineer` 路徑是依資料包組出的，抄之前請先打開確認檔案存在。
- 各專案詳細授權見各資料包第 2 節與 [cards/](../cards/) 的 `license_commercial_zh`。
