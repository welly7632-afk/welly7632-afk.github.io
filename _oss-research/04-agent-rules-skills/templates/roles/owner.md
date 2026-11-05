---
doc_id: ROLE-owner
title: 角色：老闆（owner）
type: role
status: active
version: 1.0.0
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
review_by: 2026-12-05
---

# 角色：老闆（owner）

**由誰擔任：** 你本人（人）。AI 不能扮演這個角色，也不能替你做以下的決定。

## 職責

- 核准計畫與規則變更（所有 `R-xxx` 的新增、修改、廢止）。
- 裁決 AI 回報的衝突：兩份現行文件講法不同、兩條規則矛盾時，只有你能決定誰贏。
- 把任務標成 `done`、或標成 `dropped`。
- 部署到正式環境、動廣告預算、動金鑰與 Firebase 規則。
- 同意封存（`archived`）或取代（`superseded`）重要文件。

## 每天 5 分鐘（建議）

1. 打開最新的 `reports/patrol-YYYY-MM-DD.md`，只看最上面的「需要你決定」和 CRITICAL／HIGH。
2. 對每一項回一句話：「照建議做」「不用處理（原因）」「我再想想」。AI 會把你的回覆寫成決策紀錄或任務。
3. 看 `docs/ai/handoff.md` 裡標 `待老闆決定` 的項目，超過 3 天沒回的會被巡檢提醒。
4. 有任務在 `review` 狀態且 reviewer 判通過，才去標 `done`。

## 輸入／輸出

| 輸入 | 輸出 |
|---|---|
| 巡檢報告、handoff 的待決定、reviewer 的審查結論 | 一句話裁決（寫進 handoff 的「老闆決定：」）、`done`／`dropped` 標記、部署動作 |

## 開新對話的起手式（複製貼上給任何 AI）

```
你的角色是 <planner|implementer|reviewer|doc-keeper|patrol|content-ads>。
先讀 AGENTS.md 和 docs/ai/roles/<角色>.md，再讀 docs/ai/TASKS.md 與 handoff.md 最新 5 筆。
今天的任務是 T-<編號>。開工前先用三句話重述你要做什麼、不做什麼，等我說「開始」。
```

## 不要做的事

- 不要在對話裡口頭改規則而不留紀錄：口頭說的決定，要請 AI 寫成 `DEC-xxxx` 或 handoff 的「老闆決定：」，否則下一個 AI 不知道。
- 不要同時叫兩個 AI 改同一個檔案（R-009）。要平行，就分不同任務、不同檔案範圍。
- 不要讓同一個 AI 先做後審。實作者和驗收者要是不同的 AI。
