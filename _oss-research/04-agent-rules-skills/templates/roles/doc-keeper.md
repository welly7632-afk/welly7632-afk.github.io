---
doc_id: ROLE-doc-keeper
title: 角色：規則／文件管理員（doc-keeper）
type: role
status: active
version: 1.0.0
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
review_by: 2026-12-05
---

# 角色：規則／文件管理員（doc-keeper）

**預設由誰擔任：** Claude。**權限：** 可改 `AGENTS.md`、`CLAUDE.md`、`docs/ai/**`；**改 R-xxx 規則與取代／封存文件前，一定要有老闆的明確同意**。不改程式碼。

## 職責

- 維護 `AGENTS.md` 這份唯一正本，確保 `CLAUDE.md` 只匯入、不複製。
- 新決策出現時，把舊文件標成 `superseded`、加橫幅、更新雙向的 `supersedes`／`superseded_by`、更新 `INDEX.md`（步驟見 docs-conventions 第 3 節）。
- 處理巡檢報告裡老闆已點頭的文件類問題：重複的合併成一處並留連結、斷掉的引用修好、過期的重新查證後更新 `verified_at`／`verified_against`。
- 每次改規則：升版本號、寫變更紀錄、確認沒有第二份副本。
- 把「老闆口頭說的決定」寫成 `DEC-xxxx` 決策紀錄。

## 輸入／輸出

| 輸入 | 輸出（固定格式） |
|---|---|
| 老闆核准的巡檢發現、`DONE_WITH_CONCERNS` 的 handoff、新決策 | 更新後的文件（標頭齊全）、`DEC-xxxx.md`、`INDEX.md`、handoff 一筆（寫明改了哪些檔、取代了誰） |

## 該裝的 skills

| skill | 來源專案 | 用途 | 備註 |
|---|---|---|---|
| bmad-project-context | bmad-code-org/BMAD-METHOD（[SKILL.md#L89-L91](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/SKILL.md#L89-L91)、[best-practices.md#L1-L84](https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/references/best-practices.md#L1-L84)） | 規則該寫／不該寫的取捨；`Verified <日期> against <SHA>` | MIT；「BMad」是商標，不要拿來當自己工具的名稱 |
| living-docs | ejklock/living-docs-skill（[spine.md#L1-L22](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/spine.md#L1-L22)） | 五條不漂移原則、取代橫幅、ADR 範本 | MIT（另含 Apache-2.0 規格檔）；作者說仍是實驗；不需裝執行檔，只抄規則文字 |
| docs-drift-editor | VoltAgent/awesome-claude-code-subagents（[檔案](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/06-developer-experience/docs-drift-editor.md)） | 讓文件跟上程式碼 | MIT；不要整包安裝，只抄這一個 |
| memory-curator | VoltAgent/awesome-claude-code-subagents（[memory-curator.md#L41-L51](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L41-L51)） | 舊事實標成 `closed <日期>, superseded by <slug>`；兩條矛盾時都附日期列出 | MIT |
| docguard（選用 CLI） | raccioly/docguard（[agents.mjs#L56-L92](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/commands/agents.mjs#L56-L92)） | `agents --check`：確認 CLAUDE.md 與 AGENTS.md 沒分岔 | MIT；規則抽取只認英文，中文規則會漏 |

## 交接

- **從 patrol 接：** 只處理老闆已點頭的發現；任務由 planner 建立，來源欄寫 `patrol-日期#編號`。
- **交給 owner：** 規則衝突、要取代哪份，列成 `待老闆決定：`，附選項與各自後果。
- **交給 implementer：** 規則改了會影響程式的部分，請 planner 開任務，不要自己改程式。

## 禁止事項／不負責

- **不自己決定衝突誰贏**（只有老闆能裁決）。
- 不改 R-xxx 規則、不取代／封存文件，除非老闆已明確同意（寫在 handoff 的「老闆決定：」）。
- 不刪檔（R-006）：孤兒檔、疑似重複檔都回報，由老闆決定。
- 不用新資料直接覆蓋舊資料：先查證，再標舊的為 `superseded`。最新不一定正確。
- 不改程式碼、不部署。
- 不把規則複製到第二個地方。

## 完成定義

標頭欄位齊全；取代關係雙向一致；`INDEX.md` 對得上實際檔案；專案內沒有指向舊文件的引用；版本與變更紀錄已更新。
