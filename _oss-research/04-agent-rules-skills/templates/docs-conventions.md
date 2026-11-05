---
doc_id: CONV-DOCS
title: 文件與版本規範
type: rules
status: active
version: 1.0.0
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
review_by: 2026-12-05
---

<!-- 安裝：複製到 docs/ai/conventions.md。這份規範的目的只有一個：讓人和 AI 打開任何文件，3 秒內知道「這份是不是現行版」。 -->

# 文件與版本規範

## 1. 三條底線

1. **看標頭，不看檔名、不看修改時間。** `status: active` 才是現行；`superseded`、`archived` 一律不准照做。
2. **舊的不刪，標成已取代。** 取代關係寫在兩份文件上（舊的寫 `superseded_by`，新的寫 `supersedes`），舊檔頂端放橫幅。
3. **一個事實只寫一處。** 別處用連結，不要複製。要複製就代表會漂移。

## 2. 標頭欄位（YAML frontmatter）

放在每份 `docs/ai/` 文件、`AGENTS.md`、`CLAUDE.md` 的最前面。只用簡單的 `key: value`（不要多行、不要巢狀），因為巡檢的 `mech-check.sh` 用文字比對讀它。

| 欄位 | 必填 | 寫什麼 |
|---|---|---|
| `doc_id` | 是 | 全專案唯一、永不重用。規則 `RULES-xxx`、角色 `ROLE-xxx`、決策 `DEC-0001`、規範 `CONV-xxx`、說明 `DOC-xxx` |
| `title` | 是 | 文件名稱 |
| `type` | 是 | `rules`／`role`／`decision`／`howto`／`reference`／`index`／`ledger`（任務板、交接帳本） |
| `status` | 是 | `draft`／`active`／`superseded`／`archived`（見第 3 節） |
| `version` | 是 | 規則與規範用 SemVer（見第 4 節）；其他文件用 `YYYY-MM-DD` 或 `1`、`2`… |
| `updated` | 是 | 最後一次實質修改的日期 `YYYY-MM-DD`（改錯字不用更新） |
| `owner_role` | 是 | 負責維護的角色：`owner`／`planner`／`implementer`／`reviewer`／`doc-keeper`／`patrol`／`content-ads` |
| `supersedes` | 是 | 這份取代了誰（填 `doc_id`），沒有就寫 `none` |
| `superseded_by` | 是 | 被誰取代，沒有就寫 `none`；`status: superseded` 時不可為 `none` |
| `verified_at` | 選 | 最後一次「對照事實查證過」的日期 |
| `verified_against` | 選 | 查證當時的 git 短 SHA（`git rev-parse --short HEAD`） |
| `review_by` | `active` 的 `rules`／`howto`／`reference` 必填 | 最晚複查日。過了就算過期（巡檢 S1）。建議規則 30 天、說明 60 天 |

`verified_at`／`verified_against` 的意思是「我在這個日期、這個 commit 時，確認過文件寫的和程式碼相符」。程式碼之後被改了，這兩個欄位就是巡檢判斷「文件可能過期」的依據。

## 3. 狀態與流轉

```
draft ──核准──▶ active ──被新版取代──▶ superseded ──老闆同意封存──▶ archived
   └──不採用──▶ archived（寫明原因）
```

| 狀態 | 意思 | 誰能改 |
|---|---|---|
| `draft` | 草稿，還不能當規則用；超過 14 天沒進展巡檢會提醒（S4） | 負責角色 |
| `active` | 現行版。同一個主題**同一時間只能有一份** `active` | 負責角色；規則類要老闆核准 |
| `superseded` | 已被取代。保留原檔、頂端加橫幅，**禁止照做** | doc-keeper（老闆同意後） |
| `archived` | 封存，搬到 `docs/archive/`，唯讀，只留歷史 | doc-keeper（老闆同意後） |

### 取代一份文件的步驟（doc-keeper 做，老闆同意後）

1. 新文件：`status: active`，`supersedes: <舊 doc_id>`，`version` 重新起算或升版。
2. 舊文件：`status: superseded`，`superseded_by: <新 doc_id>`，`updated` 改今天。
3. 舊文件正文最上面加橫幅（格式固定，巡檢會找「已被」兩個字）：

```markdown
> ⚠️ **已被 DEC-0007 取代（2026-11-05）— 不要照這份做。** 現行版請看 `docs/ai/decisions/DEC-0007-xxx.md`。本檔只留作歷史。
```

4. 搜尋整個專案還有誰引用舊文件，改成指向新文件（`grep -rn "舊doc_id或路徑" .`）。
5. 更新 `docs/ai/INDEX.md` 的狀態欄。
6. 在 handoff 追加一筆，說明誰取代了誰、為什麼。

## 4. 版本號（規則與規範類）

用 `MAJOR.MINOR.PATCH`：

- **MAJOR**：刪除規則、或規則意思改變到會讓舊做法變成違規。
- **MINOR**：新增規則或新章節。
- **PATCH**：措辭、錯字、補範例，意思不變。

每次改版本，同一個 commit 內：改 `version` 與 `updated`、在文件底部「變更紀錄」加一列（版本、日期、改了什麼、為什麼、誰核准）。改 `AGENTS.md` 的 R-xxx 規則一律要老闆核准。

## 5. 文件地圖：`docs/ai/INDEX.md`

這是「有哪些文件、哪個是現行」的一覽表。巡檢會拿它對照實際檔案（H5）：少列、多列都會報。新增或取代文件時一起更新。

```markdown
---
doc_id: DOC-INDEX
title: 文件地圖
type: index
status: active
version: 1
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
review_by: 2026-12-05
---
# 文件地圖

| doc_id | 路徑 | 狀態 | 負責 | 一句話 |
|---|---|---|---|---|
| RULES-AGENTS | AGENTS.md | active | doc-keeper | 全專案唯一規則正本 |
| RULES-CLAUDE | CLAUDE.md | active | doc-keeper | 只放 @AGENTS.md 與 Claude 專屬補充 |
| CONV-DOCS | docs/ai/conventions.md | active | doc-keeper | 本規範 |
| ROLE-planner | docs/ai/roles/planner.md | active | doc-keeper | 規劃角色 |
| DEC-0001 | docs/ai/decisions/DEC-0001-use-agents-md.md | active | doc-keeper | 規則正本用 AGENTS.md |
```

## 6. 決策紀錄（ADR）

重要決定（規則怎麼定、用哪個做法、為什麼不用另一個）一件一檔：`docs/ai/decisions/DEC-0001-<slug>.md`。AI 只能「提出」，**老闆確認後才算 `active`**。決策不改寫，變了就開新的去取代舊的。

```markdown
---
doc_id: DEC-0001
title: 規則正本統一放 AGENTS.md
type: decision
status: active
version: 1
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
decided_by: owner
decided_at: 2026-11-05
---
# DEC-0001 規則正本統一放 AGENTS.md

## 背景
Claude 與 Codex 各有一份規則，內容開始不一樣。

## 決定
規則只寫在 AGENTS.md；CLAUDE.md 只匯入它並放 Claude 專屬補充。

## 考慮過的其他做法
- 兩份各自維護：會漂移，已經發生過。
- 用同步工具產生：目前只有兩個 AI，太重；等 AI 超過三個再評估。

## 後果與驗證
- daily-patrol 的 C10、D1 會檢查 CLAUDE.md 是否仍匯入 AGENTS.md、有沒有複製規則。
- 追加工作：開 T 任務檢查現有 CLAUDE.md 內容並搬移（後續是要開的任務，不是延後的決定）。
```

決策狀態對照：`proposed`＝`draft`、`accepted`＝`active`、被取代＝`superseded`、否決或作廢＝`archived`（並在「背景」寫明原因）。

## 7. 待辦格式：`docs/ai/TASKS.md`

一個任務一個區塊，**標題行格式固定**（巡檢和腳本靠它解析）：

```
### T-0012 | in_progress | owner: codex | updated: 2026-11-05
```

| 欄位 | 值 |
|---|---|
| ID | `T-` 加四位數，只增不減，不重用（task 被放棄也保留） |
| 狀態 | `todo`／`in_progress`／`blocked`／`review`／`done`／`dropped` |
| owner | `claude`／`codex`／`owner`（老闆）／`none`；`todo` 以外不可為 `none` |
| updated | 最後一次動這個任務的日期 |

區塊內固定欄位（缺哪個，巡檢報哪個）：

```markdown
### T-0012 | in_progress | owner: codex | updated: 2026-11-05
- 目標：庫存扣減改成交易寫入，並留下異動紀錄
- 驗收條件：
  - [ ] 出貨 5 件，庫存少 5 件，且 stockLogs 多一筆
  - [ ] 庫存不足時拒絕出貨並顯示原因
- 驗證方式：npm test；用模擬器手動出貨一次
- 相關檔案：functions/stock.js、docs/ai/decisions/DEC-0003-stock-log.md
- 來源：DEC-0003（或 patrol-2026-11-05#D-01）
- 阻塞：無
- 驗證結果：（做完才填：指令、輸出重點、`path:line`）
- 審查：（reviewer 填：通過／不通過＋理由＋證據）
```

狀態轉換與寫入權限（借 BMAD 的做法，簡化給一人公司）：

| 轉換 | 誰能做 |
|---|---|
| `todo` → `in_progress` | 認領的 AI（同時填 owner） |
| `in_progress` → `review` | implementer（必須先填「驗證結果」） |
| `review` → `in_progress` | reviewer 判不通過、或 implementer 補做 |
| `review` → `done` | **只有老闆**（依 reviewer 的通過結論） |
| 任何 → `blocked` | 任何人，但「阻塞」欄必須寫原因與在等誰 |
| 任何 → `dropped` | **只有老闆**，並寫原因 |

規則：

- 發現漏做時，**追加新任務**，不要回頭改舊任務的內容（舊任務保留當歷史）。
- 建任務前先搜尋有沒有重複的（`grep -n "關鍵字" docs/ai/TASKS.md`）。
- 任務要寫到「不看對話也能動手」。
- 巡檢發現的問題，等老闆點頭後由 planner 轉成任務，`來源` 欄寫 `patrol-日期#編號`。
- 任務超過約 30 個且常打架時，再評估換成 Backlog.md 之類的工具；現階段一個 Markdown 檔夠用。

## 8. 交接帳本：`docs/ai/handoff.md`

**只追加、不修改、不刪除。** 一筆一個標題行，欄位固定：

```markdown
## 2026-11-05 14:30 | codex → claude(reviewer) | T-0012 | DONE_WITH_CONCERNS
- 發生什麼變化：改了 functions/stock.js（L40-L88），新增 stockLogs 寫入
- 目前確定為真：npm test 通過 12/12（輸出已貼在 T-0012 驗證結果）
- 目前阻塞：無
- 疑慮／待老闆決定：負庫存要不要允許？規則沒寫（已列待決定）
- 下一步：reviewer 對照 T-0012 驗收條件逐條查證
- 下次先讀：docs/ai/TASKS.md#T-0012、functions/stock.js
- commit 範圍：a1b2c3d..e4f5a6b
```

狀態四選一：`DONE`／`DONE_WITH_CONCERNS`／`NEEDS_CONTEXT`／`BLOCKED`。`NEEDS_CONTEXT` 與 `BLOCKED` 超過 3 天沒人回應，巡檢會報（T6）。

「待老闆決定」事項的格式：在 handoff 的筆內用 `待老闆決定：` 開頭一行，老闆回覆後在**新的一筆**寫 `老闆決定：…`（不回頭改舊的）。

## 9. 命名與目錄

```
AGENTS.md  CLAUDE.md
docs/ai/INDEX.md  conventions.md  TASKS.md  handoff.md
docs/ai/roles/<role>.md
docs/ai/decisions/DEC-0001-<slug>.md
docs/archive/            ← archived 文件
reports/patrol-YYYY-MM-DD.md   ← 巡檢報告（巡檢唯一可以寫的地方）
.agents/skills/<name>/SKILL.md ← 技能正本；.claude/skills 指向它
```

- 檔名全小寫英數加連字號；技能的 `name` 必須等於資料夾名。
- 日期一律 `YYYY-MM-DD`，時區 Asia/Taipei。
- 文件裡引用其他文件用相對路徑或 `doc_id`，不要寫「上一份」「舊版」這種會失效的說法。

## 10. 例外：刻意讓兩份內容不同

有時候刻意讓某兩份檔案不一樣（例如 Claude 版技能比 Codex 版多一行 Claude 專屬欄位）。這種情況要在 `AGENTS.md` 的「刻意分岔清單」登記路徑與原因；沒登記的分岔，巡檢一律當成漂移（D6）。
