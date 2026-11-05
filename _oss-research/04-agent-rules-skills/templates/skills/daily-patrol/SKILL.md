---
name: daily-patrol
description: Use when the user asks for 每日巡檢, 巡讀, 巡一遍整個專案, or to check whether any AI missed something (漏掉), duplicated content (重複), left old-vs-new version conflicts (新舊版本衝突), outdated docs (過期), broken references (斷掉的引用), or tasks nobody owns (待辦沒人接) across AGENTS.md, CLAUDE.md, docs/ai and git history; also when a scheduled run invokes it. Read-only audit that only writes reports/patrol-YYYY-MM-DD.md. Do not use for fixing the findings, editing rules, reviewing a single code change (use the reviewer role), or when the project has no AGENTS.md.
---

# daily-patrol：每日巡檢（只讀）

目標：每天（或需要時）把整個專案巡一遍，找出六類問題，**只出報告，不動手**。報告交給老闆拍板，老闆點頭後才由 planner／doc-keeper 處理。

這份技能只放流程與判斷規則。檢查項目的完整清單在 `checks.md`，報告格式在 `report-template.md`，確定性檢查在 `scripts/mech-check.sh`。需要時才讀，不要一開始全部載入。

## 讀寫界線（先讀完再開始）

1. **唯一可以寫的路徑：** `reports/patrol-YYYY-MM-DD.md` 與 `reports/.patrol-cursor`。其他任何檔案都不能改，連錯字都不行。
2. 不 commit、不 push、不建任務、不開 issue／PR、不安裝套件、不刪檔、不還原別人未提交的修改。
3. **排程或無人值守時不准發問。** 不確定就選最保守的做法，在報告標「待你確認」，必要時結束並寫摘要。
4. **沒有證據就不報。** 每條發現要有 `path:line`（或指令輸出）與信心（高／中／低）。懷疑但查不到證據，只能放在「待你確認」，不能當成發現。
5. **數字交給腳本。** 行數、筆數、天數由 `mech-check.sh` 或指令算，AI 不心算、不估計。
6. **新舊用證據判斷，不看檔案自己說的。** 不信檔名裡的 new／old、不信修改時間，也不信檔案自己寫的「已取代」；用 `git log`、`git blame` 與標頭欄位對照。**最新不一定正確**。
7. **「沒發現」要說明查了什麼。** 格式：`none found — checked: <具體查了哪些檔／哪些規則>`。
8. **掃不完就標 `partial`。** 任何一步失敗或略過，整份報告標 `partial` 並列出沒檢查的範圍，絕不寫「全部通過」。
9. 看到別人尚未提交的修改（`git status` 不乾淨）：只記錄，不處理、不歸咎。

## 模式

| 模式 | 何時 | 範圍 |
|---|---|---|
| `incremental`（預設） | 每天 | 上次巡檢以來有變動的檔案與 commit；標頭／索引／任務板／交接帳本一律全看（它們很小） |
| `full` | 每週一、第一次執行、或老闆要求「全部巡一遍」 | 整個專案所有文件、技能、任務，以及程式碼的重複實作抽查 |
| `verify`（複查） | 另一個 AI（例如 Codex）複查已存在的報告 | 只讀報告與其引用的原始碼，逐條判定「成立／不成立／無法判定」 |

## 步驟

### 步驟 0：專案檢查
- 確認在專案根目錄、`AGENTS.md` 存在。不存在：停止，只寫一份簡短報告「基礎架構尚未安裝」（嚴重度 HIGH），不做其他事。
- 取今天日期：`TZ=Asia/Taipei date +%F`。報告檔名用這個日期。
- 記錄 `git rev-parse --short HEAD` 與 `git status --porcelain`（不乾淨只記錄，見界線第 9 點）。

### 步驟 1：決定範圍
- 讀 `reports/.patrol-cursor`（內容是上次巡檢結束時的 commit 短 SHA）。
- 有 cursor 且 SHA 有效：範圍 = `git log <cursor>..HEAD`；沒有或無效：這次當 `full`，並在報告註明原因。
- 週一或老闆指定：用 `full`。
- 範圍內 commit 太多（超過 100）：仍照做，但把「抽查」限定在 `git diff --stat` 變動最大的 20 個檔案，其餘列為未覆蓋。

### 步驟 2：機械檢查（先跑，便宜又準）
```bash
bash .agents/skills/daily-patrol/scripts/mech-check.sh --since <cursor> --today <今天>
```
（Claude Code 看得到 `.claude/skills/daily-patrol/scripts/mech-check.sh`，兩者是同一份。）

- 輸出每行是 `CODE<TAB>SEVERITY<TAB>LOCATION<TAB>MESSAGE`；`#` 開頭是資訊行，其中 `CHECK-SKIPPED` 代表某一塊沒跑到 → 報告要標 `partial`。
- 把每一行轉成報告表格的一列（編號、類別、嚴重度、位置、問題、建議）。腳本給的嚴重度是預設值，可依 `checks.md` 的升降級規則調整，但要寫原因。
- 沒有 bash 或腳本不能跑：改用 `checks.md` A 部分的手動做法逐項檢查，並在報告註明「機械檢查以手動進行」。

### 步驟 3：AI 唯讀判讀（語意層）
按 `checks.md` B 部分，依序檢查。讀取順序（先小後大）：
1. `AGENTS.md`、`CLAUDE.md`、`docs/ai/INDEX.md`、`docs/ai/conventions.md`
2. `docs/ai/TASKS.md`、`docs/ai/handoff.md`（最新 30 筆）、`docs/ai/decisions/`
3. `docs/ai/roles/*.md` 與 `.agents/skills/*/SKILL.md` 的 `description`
4. 範圍內的 `git log --stat` 與被改到的檔案
5. （`full` 才做）程式碼中「同一個責任有多處實作」的抽查，例如庫存扣減、金額計算、成本毛利

六類問題：漏掉（M）、重複（D）、衝突含新舊版本（C）、過期（S）、斷掉的引用（R）、待辦沒人接（T），外加標頭與格式（H）。

### 步驟 4：判斷新舊與嚴重度
- **兩份文件衝突時：** 先看標頭（`status`、`supersedes`、`superseded_by`），再用 `git log -- <檔案>` 與 `git blame -L` 看哪一段較新，最後看 `verified_at`／`verified_against`。**只提供事實，不判定誰對**：能用事實確定的，在「建議處理」寫「依證據以 X 為準」；不能確定的，列進「需要你決定」。
- **範圍較窄的規則若自己聲明覆寫上層哪一條，不算衝突**；同一層兩條互相矛盾才算衝突。
- 兩條都有效卻互相矛盾，本身就是缺陷，要提出修正，不是挑一條來用。
- 嚴重度依 `checks.md` C 部分。涉及金額、庫存、部署、金鑰、個資的規則衝突，一律升為 CRITICAL。
- 關係到安全規則的，只標記，不給修改建議的內容細節。

### 步驟 5：寫報告
- 依下列骨架產生 `reports/patrol-YYYY-MM-DD.md`（完整範本與填寫規則見 `report-template.md`）。同一天重跑：檔名加 `-2`，不覆蓋舊的。報告開頭要有標頭（`doc_id: REPORT-patrol-日期`、`type: report`、`status: active`，其餘欄位照 `docs/ai/conventions.md`）。

```markdown
# 每日巡檢報告 YYYY-MM-DD
- 巡檢者／複查：Claude 唯讀／待複查　模式：incremental｜full　狀態：complete｜partial（原因）
- 範圍：commit a1b2c3d..e4f5a6b（N 個）；文件 N 份；任務 N 項　機械檢查：N 項發現；CHECK-SKIPPED：無
- 數量：CRITICAL N／HIGH N／MEDIUM N／LOW N

## 需要你決定（最多 7 項；每項：事實 → 選項 → 各選項的後果）
## 發現
| 編號 | 類別 | 嚴重度 | 位置 | 問題 | 建議處理 |
|---|---|---|---|---|---|
| C-01 | 衝突（C2） | CRITICAL | AGENTS.md:42／docs/ai/x.md:8 | 事實與證據（信心：高） | → 需要你決定 |
## 各類別結果（M／D／C／S／R／T／H 各一行：見上表編號，或 none found — checked: …）
## 與上次比較（新發現／已解決／持續 N 天未處理）
## 覆蓋範圍（讀了哪些、沒讀到哪些與原因）
## 機械檢查原始輸出
## 複查結果（留空，由複查模式追加）
```
- 「需要你決定」放最上面，最多 7 項，每項附選項與各自後果。
- 與上一份報告比對：哪些是新發現、哪些已解決、哪些「持續 N 天未處理」。
- 每個類別都要有內容：有發現列表格；沒有就寫 `none found — checked: …`。
- 「覆蓋範圍」寫讀了哪些檔、沒讀到哪些、為什麼；狀態寫 `complete` 或 `partial`。

### 步驟 6：收尾
- 狀態是 `complete` 才更新 `reports/.patrol-cursor`（寫入目前的 `HEAD` 短 SHA）；`partial` 不更新，讓下次補看。
- 用繁體中文回覆老闆三件事：報告路徑、各嚴重度數量、「需要你決定」的項目標題。排程模式下，沒有 CRITICAL／HIGH 且沒有「需要你決定」就只回一行摘要。
- 不要在回覆裡貼整份報告。

## 複查模式（verify）
由與巡檢者不同的 AI 執行（例如 Codex）。
1. 讀最新（或指定）的報告。對每一條發現，自己去讀它引用的 `path:line` 原始碼與 git 紀錄。
2. 判定：`成立`（證據支持）／`不成立`（證據不支持或誤判）／`無法判定`（缺資訊，寫缺什麼）。
3. 不要附和：自己找不到證據就寫不成立。也可以補充巡檢者漏看的發現，標明「複查新增」。
4. 結果以「## 複查結果」一節追加在同一份報告最下面（格式見 `report-template.md`）。**不得改動報告其他部分。**
5. 若執行環境是唯讀沙箱無法寫檔：把「複查結果」整段輸出到標準輸出，由呼叫的腳本接進報告。

## 常見藉口（出現就代表要停手）

| 你想說 | 實際該做 |
|---|---|
| 「這個錯字／斷連結順手修一下比較快」 | 不行。寫進報告建議，等老闆同意後由 doc-keeper 修 |
| 「兩份寫法差不多，應該沒問題」 | 沒讀兩份全文、沒對照證據，不能下這個結論；列「待你確認」 |
| 「新檔案一定比舊檔案對」 | 最新不一定正確。用 git blame 和實際程式碼證明 |
| 「掃描失敗了，但大概沒事」 | 標 `partial`，列出失敗的那一塊 |
| 「沒發現問題，報告不用寫」 | 要寫：`none found — checked: …`，並說明沒檢查到的範圍 |
| 「有問題，我先建個任務／開個 issue」 | 不行。巡檢不建任務；老闆點頭後由 planner 建 |
| 「沒人回答，我先照我的判斷做」 | 排程模式不發問，選最保守的做法，並標「待你確認」 |

## 驗證（交出報告前逐項確認）

- [ ] `git status --porcelain` 只多出 `reports/` 底下的檔案（沒有改到別的東西）
- [ ] 報告每一類（M／D／C／S／R／T／H）都有表格列或 `none found — checked: …`
- [ ] 每條發現有 `path:line` 證據與信心；沒有證據的已移到「待你確認」
- [ ] 所有數字來自 `mech-check.sh` 或指令輸出
- [ ] 「需要你決定」放在最上面，且每項有選項
- [ ] 若有 `CHECK-SKIPPED` 或任何一步失敗，狀態是 `partial`
- [ ] cursor 只在 `complete` 時更新
