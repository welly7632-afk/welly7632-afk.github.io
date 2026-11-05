---
doc_id: RULES-CLAUDE
title: Claude 專屬補充（CLAUDE.md）
type: rules
status: active
version: 1.0.0
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
review_by: 2026-12-05
---

@AGENTS.md

<!--
安裝說明（裝好後整段刪掉）：
1. 本檔改名為 CLAUDE.md，放專案根目錄。第一行的 @AGENTS.md 是匯入，不能刪。
2. 這裡只放「只有 Claude Code 才有、AGENTS.md 放了 Codex 也看不懂」的東西。
   同一條規則出現在這裡又出現在 AGENTS.md，daily-patrol 會報重複（D1）。
3. 保持在 40 行內。超過就代表有規則放錯地方，搬回 AGENTS.md。
4. 另一種做法是把 CLAUDE.md 做成指向 AGENTS.md 的 symlink；有 Claude 專屬內容就用本檔，沒有就用 symlink（Windows 的 symlink 容易出問題，見 README）。
-->

## Claude Code 專屬補充

- 技能放在 `.claude/skills/`（它是指向 `.agents/skills/` 的連結，不要在這裡另存一份）。
- 手動叫技能用 `/daily-patrol`；Codex 那邊的叫法不同，以 README 為準。
- 需要平行或隔離的工作，可以用 `.claude/agents/` 的子代理（選用）。子代理看不到主對話，派工時要把路徑、限制、回報格式寫進任務。
- 規劃類工作（planner 角色）先進計畫模式，老闆看過計畫再動手。
- 個人偏好放 `CLAUDE.local.md`（不進 git），不要放進本檔。

## 驗證本檔有被讀到

在新對話問 Claude：「AGENTS.md 的規則編號 R-001 是什麼？」答得出來，代表 `@AGENTS.md` 匯入有生效。答不出來就是匯入失敗，不要假設它有效。
