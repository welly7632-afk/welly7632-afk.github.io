# daily-patrol 報告範本

巡檢員照這個格式產生 reports/patrol-YYYY-MM-DD.md。同一天重跑，檔名加 -2，不覆蓋。

## 填寫規則
- 檔案開頭要有標頭（frontmatter）：doc_id: REPORT-patrol-日期、type: report、status: active、其餘欄位照 docs/ai/conventions.md；報告是歷史紀錄，不需要 review_by。
- 表格欄位固定：編號｜類別｜嚴重度｜位置｜問題｜建議處理。
- 編號：類別字母加當天序號，例如 D-01、C-02。
- 類別：類別名（代碼），例如 重複（D1），代碼對照 checks.md。
- 嚴重度：CRITICAL／HIGH／MEDIUM／LOW；升降級要在「問題」欄寫原因。
- 位置：path:line 或 commit sha，路徑相對專案根目錄。
- 問題：一到兩句事實與證據，最後括號寫信心（信心：高）；複查後加註「複查：成立」。
- 建議處理：只建議，一個發現一個下一步；需要老闆決定的標「→ 需要你決定」。
- 排序 CRITICAL → LOW。不貼疑似金鑰的內容，只寫位置。

## 範本
```markdown
---
doc_id: REPORT-patrol-2026-11-05
title: 每日巡檢報告 2026-11-05
type: report
status: active
version: 1
updated: 2026-11-05
owner_role: patrol
supersedes: none
superseded_by: none
---
# 每日巡檢報告 2026-11-05
- 巡檢者：Claude／唯讀　複查：Codex／待複查
- 模式：incremental｜full　狀態：complete｜partial（原因）
- 範圍：commit a1b2c3d..e4f5a6b（12 個）；文件 14 份；任務 9 項；交接 5 筆
- 機械檢查：mech-check.sh 執行成功；N 項發現；CHECK-SKIPPED：無
- 未提交的修改：無／有 N 個檔案（只記錄，未處理）
- 數量：CRITICAL 0／HIGH 2／MEDIUM 3／LOW 4（已知悉不計入：N）

## 需要你決定
> 最多 7 項。每項：事實 → 選項 → 各選項後果。
1. **C-01 規則衝突：庫存單位**
   - 事實：AGENTS.md:42 寫「庫存以箱計」；docs/ai/howto-stock.md:8 寫「以件計」。git blame：後者較新。兩份都是 active。
   - 選項 A：以「件」為準 → 改 AGENTS.md（要你核准），doc-keeper 取代舊規則。
   - 選項 B：以「箱」為準 → howto-stock.md 標 superseded。
   - 選項 C：暫不處理 → 兩個 AI 可能用不同單位寫入庫存（風險高）。

## 發現
| 編號 | 類別 | 嚴重度 | 位置 | 問題 | 建議處理 |
|---|---|---|---|---|---|
| C-01 | 衝突（C2） | CRITICAL | AGENTS.md:42／docs/ai/howto-stock.md:8 | 庫存單位兩份現行文件不同（升級原因：涉及庫存）（信心：高） | → 需要你決定 |
| M-01 | 漏掉（M1） | HIGH | docs/ai/TASKS.md:57（T-0012） | 狀態 done 但「驗證結果」空白（信心：高） | 退回 review，由實作者補驗證 |
| D-01 | 重複（D1） | MEDIUM | CLAUDE.md:17／AGENTS.md:31 | 完全相同的規則句子（信心：高） | 刪 CLAUDE.md 的，只留 AGENTS.md |
| T-01 | 待辦沒人接（T2） | MEDIUM | docs/ai/TASKS.md:73（T-0015） | in_progress 已 5 天沒更新（信心：高） | 問 owner 進度，或請老闆決定是否放棄 |
| S-01 | 過期（S1） | MEDIUM | docs/ai/howto-deploy.md | review_by 2026-10-30 已過 6 天（信心：高） | doc-keeper 對照 firebase.json 重新查證後更新 verified_at |
| R-01 | 斷掉的引用（R1） | LOW | docs/ai/roles/planner.md:44 | 引用的 docs/ai/old-guide.md 不存在（信心：高） | 改成 INDEX 裡現行的文件 |

## 各類別結果
> 沒有發現的類別一定要寫 none found — checked: …，說明查了什麼。
- 漏掉（M）：見 M-01。其餘 none found — checked: T-0001..T-0015 的驗證結果、近 14 天 [claude]/[codex] commit 與交接帳本對照、TODO/FIXME 與任務板對照
- 重複（D）：見 D-01。語意重複 none found — checked: AGENTS.md「部署」「庫存」「commit」三個主題與 docs/ai/ 相近段落
- 衝突含新舊版本（C）：見 C-01。取代關係 none found — checked: 所有 supersedes／superseded_by、橫幅、現行文件對舊文件的引用
- 過期（S）：見 S-01。　斷掉的引用（R）：見 R-01。　待辦沒人接（T）：見 T-01。
- 標頭與格式（H）：none found — checked: 14 份文件標頭欄位與 status 值、INDEX 對照、AGENTS.md 大小

## 與上次比較（對照 reports/patrol-2026-11-04.md）
- 新發現：C-01、D-01　已解決：上次的 H-02　持續未處理：S-01（第 3 天，超過 3 次升一級）
- 老闆回覆「不用處理」仍存在的：R-05（已知悉，不再計入）

## 覆蓋範圍
- 讀了：AGENTS.md、CLAUDE.md、docs/ai/ 全部、近 14 天 git log、被改動的 6 個檔案
- 沒讀到（原因）：functions/legacy/（只看 diff；incremental）、程式碼重複實作抽查（只在 full 做）
- 狀態判定：complete｜partial（原因）

## 機械檢查原始輸出
（貼 mech-check.sh 輸出；疑似金鑰只留位置）

## 複查結果
> 由另一個 AI（如 Codex）以 verify 模式追加；巡檢者留空。每條判定附自己讀到的 path:line。
| 編號 | 判定（成立／不成立／無法判定） | 複查者的證據 | 備註 |
|---|---|---|---|
複查新增的發現（標明「複查新增」）：無／表格
```

## 排程模式簡短回覆
```
每日巡檢完成（complete）：reports/patrol-2026-11-05.md
CRITICAL 1／HIGH 1／MEDIUM 3／LOW 4
需要你決定：①庫存單位兩份現行文件不同（AGENTS.md 與 howto-stock.md）
```
沒有 CRITICAL／HIGH 且沒有「需要你決定」時只回一行：每日巡檢完成（complete），無 CRITICAL／HIGH，詳見 reports/patrol-日期.md。
