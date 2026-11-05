---
doc_id: RULES-AGENTS
title: 共用規則（AGENTS.md）
type: rules
status: active
version: 1.0.0
updated: 2026-11-05
owner_role: doc-keeper
supersedes: none
superseded_by: none
verified_at: 2026-11-05
verified_against: <填寫：git rev-parse --short HEAD>
review_by: 2026-12-05
---

<!--
安裝說明（裝好後整段刪掉）：
1. 本檔改名為 AGENTS.md，放專案根目錄。這是全專案「唯一的規則正本」，Codex 與 Claude 都讀它。
2. 把所有 <填寫> 換成真實內容；沒填完 daily-patrol 會每天提醒你（檢查 H4）。
3. 規則只寫在這裡。CLAUDE.md 只放 @AGENTS.md 與 Claude 專屬補充，不准複製本檔的規則。
4. 本檔控制在 150 行內、32 KiB 以下（Codex 有 32 KiB 上限）。放不下的細節放 docs/ai/，這裡只放「做 X 之前先讀 Y」。
-->

# 專案共用規則

這個檔案是所有 AI（Claude、Codex）和人共同遵守的唯一規則。回覆一律用繁體中文（台灣用語）；程式碼、檔名、指令用英文。

## 0. 優先順序與衝突處理

1. 老闆在這次對話裡的明確指示
2. 離你要改的檔案最近的 `AGENTS.md`（子資料夾的規則只能加嚴，不能放寬本檔）
3. 本檔
4. `docs/ai/` 底下 `status: active` 的文件
5. 你自己的判斷（只用來補以上都沒寫的地方）

實作事實以設定檔為準（`package.json`、`firebase.json`、`firestore.rules` 等）。文件說法和設定檔不符，要回報成「過期」，不要照文件做。

兩條有效規則互相矛盾時，**不准自己挑一條**：停手，寫進 `docs/ai/handoff.md` 的「待老闆決定」，等老闆裁決。

## 1. 不可違反的事（憲法）

> 範例規則，請依實際情況改。編號只增不減，不重用；廢止的規則留著並標「已廢止」。

- R-001：AI 不得部署到正式環境（`firebase deploy`、改 Hosting／Functions／正式 Firestore 資料），部署只有老闆能下。
- R-002：AI 不得修改 `firestore.rules`、`storage.rules`、`.env*`、金鑰與憑證；要改一律開任務等老闆核准。
- R-003：任何金鑰、密碼、客戶個資不得寫進程式碼、文件或對話紀錄。
- R-004：庫存數量的任何異動都必須留下紀錄（誰、何時、前後數量、原因），不得直接覆寫數字。
- R-005：金額與成本計算一律由程式碼計算；AI 不得自己心算或估算後把數字寫進文件。幣別為新台幣，金額單位為 <填寫：元／分>。
- R-006：不得刪除資料或檔案來「清理」；舊內容標成 `superseded`，要不要刪由老闆決定。
- R-007：AI 不得自行 `git commit`／`git push` 到 <填寫：main>；<填寫：所有變更都先開分支，老闆看過才合併>。
- R-008：廣告預算、出價、上線與下線由老闆操作；AI 只產出建議與素材。
- R-009：不得還原或覆蓋別的 AI 尚未提交的修改；看到不明的未提交修改，先停手並回報。
- R-010：調查、審查、評估類的請求只授權分析，不授權動手實作。

## 2. 專案地圖（最少資訊，細節看各文件）

- 技術棧：<填寫：純 JavaScript、Firebase Hosting、Firestore、Cloud Functions…>
- 主要程式資料夾：<填寫：public/、functions/…>
- 執行與驗證指令：<填寫：npm test、firebase emulators:start…>。完成前必須實際跑過並貼出結果。
- 舊系統／轉址頁：<填寫：哪些已停用，只能讀不能改>
- 詞彙定案（同一個東西只用一種叫法）：<填寫：庫存／存貨 → 統一「庫存」>
- 已淘汰、不准再出現的舊詞或舊流程：<填寫：例如「舊版出貨流程」>（daily-patrol 會搜尋）

## 3. 工作流程（每個 AI 都一樣）

1. 開工前**重新從磁碟讀**：`docs/ai/TASKS.md`、`docs/ai/handoff.md` 最新 5 筆、你的角色檔。不要靠對話記憶；對話被壓縮後以檔案和 `git log` 為準。
2. 先認領再動手：把任務的 `owner` 改成自己、狀態改 `in_progress`，才開始改檔。
3. 一次只做一個任務，只改任務範圍內的檔案；範圍外的發現寫進 handoff，不要順手修。
4. 完成前驗證：跑驗證指令，把結果寫進任務的「驗證結果」。程式碼存在、grep 到字串、「我覺得可以」都不算證據。沒跑到的檢查寫「Not verified」，不能當通過。
5. 交接：在 `docs/ai/handoff.md` 最下面**追加**一筆（只追加、不改舊的），狀態四選一：`DONE`、`DONE_WITH_CONCERNS`、`NEEDS_CONTEXT`、`BLOCKED`。
6. 實作者不能驗收自己的任務。`done` 只有老闆能標；驗收者只能給「通過／不通過」的結論。
7. commit 訊息格式：`[claude|codex] T-0012 簡短說明`，方便巡檢看出是誰改的。

## 4. 角色

一次只扮演一個角色。開工先讀 `docs/ai/roles/<角色>.md`。

| 角色 | 預設由誰 | 一句話 |
|---|---|---|
| owner | 老闆（人） | 核准、裁決衝突、決定部署 |
| planner | Claude | 拆任務、寫驗收條件，不寫程式 |
| implementer | Codex（或 Claude） | 照任務最小修改並驗證 |
| reviewer | 與實作者不同的 AI | 唯讀，逐條對驗收條件找證據 |
| doc-keeper | Claude | 維護本檔與 docs/ai/，舊的標 superseded |
| patrol | Claude 唯讀（Codex 複查） | 每天巡檢，只出報告 |
| content-ads | Claude | 商品文案、廣告素材、影片腳本 |

## 5. 文件規則（細節見 `docs/ai/conventions.md`）

- 每份 `docs/ai/` 文件頂端都要有標頭（版本、更新日、負責角色、status）。`status: superseded` 的文件**不是現行規則**，禁止照做。
- 一條規則、一個事實只寫一處，其他地方放連結。複製就會漂移。
- 新資訊和舊資訊矛盾時，不要用新的直接覆蓋：先查證據，再把舊的標成 `superseded` 並寫明被誰取代。「最新」不一定正確。
- 孤兒檔、疑似重複的檔案不要自己刪，回報給老闆。
- 文件裡不寫死會變動的數字（版本、筆數、價格）；改成指向單一來源。

## 6. 排程與自動執行的 AI

- 不准發問（沒人會回答）。不確定就選最保守的做法，或結束並寫摘要。
- 沒有發現就保持安靜，不開任務、不開 PR。
- 掃描中任何一塊失敗，整份報告就標 `partial`，不能假裝全部通過。
- 巡檢（patrol）只能寫 `reports/` 底下的報告，不改其他任何檔案。

## 7. 需要老闆先核准的事

改超過 <填寫：3> 個檔案、改資料模型、改任何 R-xxx 規則、刪檔、改 CI／部署設定、安裝新套件、碰金額或庫存計算邏輯。

## 8. 登記簿（daily-patrol 會讀這一節）

- 允許存在的規則／指令檔：`AGENTS.md`、`CLAUDE.md`、`docs/ai/roles/*.md`、`.agents/skills/*/SKILL.md`。出現其他規則檔（`GEMINI.md`、`.cursorrules`、`.github/copilot-instructions.md`、`AGENTS.override.md`、內容重複的 `.claude/rules/*.md`）就是漂移，不要自己新增。
- 刻意讓兩份內容不同的檔案（路徑＋原因）：目前沒有。
- 單一來源登記（這些數字／事實只能在左邊那處改，其他地方只能指向它）：<填寫：App 版本號 → package.json；商品單位 → docs/ai/…>

## 變更紀錄

| 版本 | 日期 | 改了什麼 | 為什麼 | 核准 |
|---|---|---|---|---|
| 1.0.0 | 2026-11-05 | 建立 | 初版 | 老闆 |
