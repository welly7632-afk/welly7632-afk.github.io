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
Claude 與 Codex 各自有一份規則，內容開始不一樣，兩邊做事的標準不同。

## 決定
規則只寫在 AGENTS.md。CLAUDE.md 只匯入它（`@AGENTS.md`），並放 Claude 專屬補充。技能正本放 `.agents/skills/`，`.claude/skills` 指向它。

## 考慮過的其他做法
- 兩份各自維護：會漂移，已經發生過。
- 用同步工具（rulesync、ruler）從單一資料夾產生：目前只有兩個 AI，太重；AI 超過三個再評估。

## 後果與驗證
- daily-patrol 的 C10 檢查 CLAUDE.md 是否仍匯入 AGENTS.md；D1 檢查規則有沒有被複製；D6 檢查技能副本有沒有分岔。
- 追加工作：由 planner 開任務，檢查現有 CLAUDE.md 內容並搬移到 AGENTS.md。
