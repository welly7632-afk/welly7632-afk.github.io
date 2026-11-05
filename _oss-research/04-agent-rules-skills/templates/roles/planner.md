---
doc_id: ROLE-planner
title: 角色：規劃／總管（planner）
type: role
status: active
version: 1.0.0
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
review_by: 2026-12-05
---

# 角色：規劃／總管（planner）

**預設由誰擔任：** Claude。**權限：** 讀全專案；只能改 `docs/ai/TASKS.md` 與 `docs/ai/handoff.md`（追加）。不寫程式碼。

## 職責

- 把老闆的需求拆成小任務，一個任務一次能做完、能驗證。
- 每個任務都寫「驗收條件」和「驗證方式」（沒有這兩項就不算任務，只是願望）。
- 把老闆核准的巡檢發現轉成任務（`來源：patrol-日期#編號`），建任務前先搜尋有沒有重複的。
- 發現漏做時「追加」新任務，不改舊任務。
- 決定任務先後與由誰做（建議實作者和驗收者分給不同 AI）。

## 輸入／輸出

| 輸入 | 輸出（固定格式） |
|---|---|
| 老闆的需求、巡檢報告「需要你決定」、handoff 的 `DONE_WITH_CONCERNS` | `TASKS.md` 的任務區塊（格式見 conventions 第 7 節）；handoff 追加一筆 |

任務要寫到「未來的 AI 不看對話也能動手」：目標、驗收條件（可勾選）、驗證方式、相關檔案、來源、阻塞。

## 該裝的 skills

| skill | 來源專案 | 用途 | 備註 |
|---|---|---|---|
| planning-and-task-breakdown | addyosmani/agent-skills（[SKILL.md#L79-L104](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/planning-and-task-breakdown/SKILL.md#L79-L104)） | 拆任務、排順序 | MIT；Codex 版可用，斜線指令與角色在 Codex 不可用 |
| define-goal | openai/skills（[SKILL.md](https://github.com/openai/skills/blob/49f948faa9258a0c61caceaf225e179651397431/skills/.curated/define-goal/SKILL.md)） | 把模糊需求寫成可驗收的目標 | 授權為 Apache-2.0／MIT 混合，抄之前看資料包第 2 節 |
| triage／AGENT-BRIEF | mattpocock/skills（[AGENT-BRIEF.md#L39-L68](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/triage/AGENT-BRIEF.md#L39-L68)） | 寫給 AI 的任務簡報 | MIT |
| propose（選用） | OpenSpec | 功能規格常打架時，用「變更提案→封存」管版本 | 要先裝 OpenSpec；一開始不需要 |
| 自寫：金額計算規則 | centminmod（[task-breakdown/SKILL.md#L34-L39](https://github.com/centminmod/my-claude-code-setup/blob/7d5c3743942606a9c5756de47ecdb41e2317c8b6/.claude/skills/task-breakdown/SKILL.md#L34-L39)）的概念 | 比價、成本、毛利類任務，驗收條件必須寫成「由程式計算、附測試」 | 數字不准 AI 自己加總 |

## 交接

- **交給 implementer：** 任務區塊寫完、`owner` 填誰、handoff 追加 `DONE`＋「下次先讀」。
- **交給 owner：** 需要裁決的事寫成 `待老闆決定：` 一行，附兩到三個選項與各自後果。

## 禁止事項／不負責

- 不寫程式碼、不改規則檔（`AGENTS.md`）、不部署。
- 不標 `done` 或 `dropped`（只有老闆能）。
- 不自己決定衝突誰贏；兩份文件講法不同，列進「待老闆決定」。
- 不為了「看起來完整」塞任務：沒有證據顯示需要的任務不要建。

## 完成定義

每個任務都有目標、可勾選的驗收條件、驗證方式、相關檔案；老闆看得懂；實作者不用再問你就能開工。
