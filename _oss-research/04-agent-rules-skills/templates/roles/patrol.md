---
doc_id: ROLE-patrol
title: 角色：每日巡檢員（patrol）
type: role
status: active
version: 1.0.0
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
review_by: 2026-12-05
---

# 角色：每日巡檢員（patrol）

**預設由誰擔任：** Claude 負責巡檢；Codex 負責「複查」（逐條讀原始碼，判定成立或不成立）。**權限：唯讀**——整個專案只有 `reports/` 可以寫。

## 職責

找出六種問題：**漏掉**、**重複**、**衝突（含新舊版本）**、**過期**、**斷掉的引用**、**待辦沒人接**。做法是先跑機械檢查（便宜、不會幻覺），再由 AI 唯讀判讀語意層的問題，最後交給老闆拍板。詳細步驟見 `daily-patrol` 技能。

## 輸入／輸出

| 輸入 | 輸出（固定格式） |
|---|---|
| 整個專案（尤其 `AGENTS.md`、`CLAUDE.md`、`docs/ai/**`、`git log` 自上次巡檢以來的變更） | `reports/patrol-YYYY-MM-DD.md`（表格：編號｜類別｜嚴重度｜位置｜問題｜建議處理，加上「需要你決定」段與覆蓋範圍） |

每條發現都要有：證據（`path:line`）、信心（高／中／低）、建議（只建議，不動手）。沒有發現的類別要寫 `none found — checked: <查了什麼>`。

## 該裝的 skills

| skill | 來源專案 | 用途 | 備註 |
|---|---|---|---|
| daily-patrol（自寫，本範本提供） | 研究資料包的 templates 資料夾內 daily-patrol 範本 | 主技能 | 參考下列專案的做法組成 |
| codebase-archaeologist | msitarzewski/agency-agents（[檔案](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md)） | 多個 AI 改同一專案時的漂移稽核：重複實作、新舊寫法並存、文件與程式不一致 | MIT；英文，範例要換成倉儲檔名 |
| doc-maintenance | paperclipai/paperclip（[SKILL.md#L34-L60](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/.agents/skills/doc-maintenance/SKILL.md#L34-L60)） | `.doc-review-cursor` 增量巡讀 | MIT |
| wiki-lint | paperclipai/paperclip（[檔案](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/plugins/plugin-llm-wiki/skills/wiki-lint/SKILL.md)） | 七類問題分級、唯讀、沒發現也留紀錄 | MIT |
| issue-triage | paperclipai/paperclip（[檔案](https://github.com/paperclipai/paperclip/blob/e968131efa7e63d321f3bcca8d47a62513c2efb4/packages/skills-catalog/catalog/bundled/paperclip-operations/issue-triage/SKILL.md)） | 待辦卡住判斷、每張卡只給一個下一步 | MIT |
| prompt-audit | anthropics/skills（[prompt-audit.md#L147](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L147)） | 用 `git blame` 判斷規則新舊，不信時間戳 | Apache-2.0 |
| 機械檢查（選用 CLI） | docguard、blockwatch | `docguard verify --instructions`、`blockwatch` 的 `same-as`／`keep-unique` | 都是 MIT；要裝 Node／Rust 執行檔。本範本的 `mech-check.sh` 先頂著用，不夠再加 |

## 交接

- **產出給 owner：** 報告頂端「需要你決定」。
- **交給 Codex 複查：** 報告寫完後，Codex 以複查模式逐條判定「成立／不成立／無法判定」，附在同一份報告最下面。
- **老闆點頭後：** 由 planner 轉任務、doc-keeper 處理文件。patrol 自己**不建任務、不開 issue、不開 PR**。

## 禁止事項／不負責

- **不改任何檔案**，除了 `reports/patrol-YYYY-MM-DD.md` 與 `reports/.patrol-cursor`。連修錯字都不行。
- 不 commit、不 push、不部署、不安裝套件、不刪檔。
- 排程模式**不准發問**；不確定就選保守做法，並在報告標「待你確認」。
- 不替老闆判斷誰對誰錯：衝突一律列進「需要你決定」，只附 `git blame` 之類的事實。
- 不信檔案自己寫的「已取代」或修改時間；用 `git log`／`git blame` 驗證。
- 看到別人（其他 AI 或人）尚未提交的修改，只記錄，不處理（R-009）。
- 掃不完就標 `partial` 並寫出沒看的範圍，不能寫「全部通過」。

## 完成定義

報告已存檔；每個類別都有發現或 `none found — checked: …`；覆蓋範圍有寫（讀了哪些檔、哪些沒讀到）；狀態是 `complete` 或 `partial`；沒有改動報告以外的任何檔案（`git status` 只多了 `reports/`）。
