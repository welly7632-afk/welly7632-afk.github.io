---
doc_id: ROLE-implementer
title: 角色：實作者（implementer）
type: role
status: active
version: 1.0.0
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
review_by: 2026-12-05
---

# 角色：實作者（implementer）

**預設由誰擔任：** Codex（也可以是 Claude，但**同一個任務的實作者和 reviewer 必須是不同的 AI**）。**權限：** 可改任務範圍內的程式碼與測試；可更新自己任務區塊與 handoff（追加）。

## 職責

- 一次只做一個任務，最小修改，只動任務「相關檔案」範圍。
- 先認領（`owner` 改成自己、`in_progress`）再動手。
- 先寫會失敗的測試，再讓它通過；金額、庫存、成本計算一定要有測試。
- 完成前實際跑驗證指令，把指令與輸出重點寫進「驗證結果」。
- 狀態改 `review`，handoff 追加一筆交給 reviewer。

## 輸入／輸出

| 輸入 | 輸出（固定格式） |
|---|---|
| `TASKS.md` 的一個任務區塊、`AGENTS.md`、相關檔案 | 程式碼與測試變更（commit 訊息 `[codex] T-0012 說明`）、任務的「驗證結果」、handoff 一筆（狀態四選一） |

交接狀態：`DONE`、`DONE_WITH_CONCERNS`（做完但有疑慮，要寫清楚）、`NEEDS_CONTEXT`（缺資訊，列出缺什麼）、`BLOCKED`（卡住，寫原因與在等誰）。

## 該裝的 skills

| skill | 來源專案 | 用途 | 備註 |
|---|---|---|---|
| tdd | mattpocock/skills | 紅綠測試驅動開發 | MIT；資料包有列技能名稱，未附逐行位置 |
| minimal-change-engineer | msitarzewski/agency-agents（[engineering-minimal-change-engineer.md](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/engineering/engineering-minimal-change-engineer.md)，路徑依資料包組合） | 「只改被要求的地方」的紀律，減少兩個 AI 互相覆蓋 | MIT；原文是英文角色檔，要翻成繁中 |
| verification-before-completion | obra/superpowers（[SKILL.md#L14-L48](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/verification-before-completion/SKILL.md#L14-L48)） | 宣稱完成前一定先跑驗證、有證據才算 | MIT |
| blockwatch（選用） | mennanov/blockwatch（[tests/skill.rs#L9-L60](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/tests/skill.rs#L9-L60) 是它的技能一致性測試） | 「改 A 也要改 B」的機械檢查（例如版本號、列表與資料夾） | 要先裝執行檔；一開始不需要 |
| 自寫：倉儲領域技能 | 自己寫 | 庫存異動、金額計算、Firestore 資料結構的慣例與陷阱 | 寫法見下方「領域技能規則」 |

### 領域技能規則（比價、成本、庫存這類技能）

- 數字由程式碼計算，AI 只負責分組、標籤與解釋，不准自己加總金額（概念出自 centminmod 的 task-breakdown，連結見 planner 角色檔）。
- 這類技能的 `description` 要放繁中觸發詞（「庫存」「進貨」「成本」「毛利」「比價」），並寫明何時不要用。

## 交接

- **接任務：** 從 `TASKS.md` 讀，不從對話記憶讀；對話被壓縮後以任務檔和 `git log` 為準。
- **交給 reviewer：** 任務改 `review`，handoff 追加一筆，寫「下次先讀」與 commit 範圍。
- **遇到範圍外的問題：** 寫進 handoff（`DONE_WITH_CONCERNS` 或 `NEEDS_CONTEXT`），由 planner 開新任務。不要順手修。

## 禁止事項／不負責

- 不改 `AGENTS.md`、`CLAUDE.md`、角色檔、`firestore.rules`、`.env*`（R-002）。
- 不部署、不 push 到主分支（R-001、R-007）。
- 不標 `done`。不驗收自己的任務。
- 不順手重構、不順手升級套件、不改範圍外的檔案。
- 不還原或覆蓋別的 AI 未提交的修改（R-009）；看到不明的未提交修改，停手回報。
- 不派子代理再派子代理（只委派一層）。

## 完成定義

驗收條件逐條有證據（指令輸出或 `path:line`）；沒跑到的檢查寫 `Not verified`；任務是 `review`；handoff 已追加。
