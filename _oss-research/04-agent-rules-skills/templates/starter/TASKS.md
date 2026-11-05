---
doc_id: LEDGER-TASKS
title: 任務板
type: ledger
status: active
version: 1
updated: 2026-11-05
owner_role: planner
supersedes: none
superseded_by: none
---

# 任務板

> 格式與狀態規則見 `docs/ai/conventions.md` 第 7 節。標題行格式固定：`### T-編號 | 狀態 | owner: 誰 | updated: 日期`。
> 任務只增不減（放棄的標 `dropped`）。發現漏做就追加新任務，不改舊任務的內容。

### T-0001 | todo | owner: none | updated: 2026-11-05
- 目標：把 AGENTS.md 裡所有 <填寫> 換成真實內容，並讓老闆確認 R-001 到 R-010
- 驗收條件：
  - [ ] AGENTS.md 沒有殘留的佔位字串（daily-patrol 的 H4 檢查不再報）
  - [ ] 老闆在 handoff 寫下「老闆決定：規則 v1.0.0 核准」
- 驗證方式：執行 daily-patrol 的 mech-check.sh，確認沒有 H4；人工看過 AGENTS.md
- 相關檔案：AGENTS.md、docs/ai/handoff.md
- 來源：導入基礎架構（第 1 天）
- 阻塞：無
- 驗證結果：（做完才填）
- 審查：（reviewer 填）

### T-0002 | todo | owner: none | updated: 2026-11-05
- 目標：手動跑第一次 daily-patrol，把報告交給老闆看
- 驗收條件：
  - [ ] reports 資料夾產生一份 patrol-日期.md，狀態是 complete 或 partial（並說明原因）
  - [ ] 報告「需要你決定」段老闆看過，每項有回覆
- 驗證方式：打開報告檢查；`git status` 只多出 reports 底下的檔案
- 相關檔案：reports 資料夾、.agents/skills/daily-patrol
- 來源：導入基礎架構（第 1 天）
- 阻塞：無
- 驗證結果：（做完才填）
- 審查：（reviewer 填）
