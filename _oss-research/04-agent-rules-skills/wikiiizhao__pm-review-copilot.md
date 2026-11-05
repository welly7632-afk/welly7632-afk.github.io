# wikiiizhao/pm-review-copilot — 給 PM 用的「專案記憶＋過期偵測＋版本漂移審查」Agent Skill（中英雙版，純 Markdown＋3 支 Python 標準庫腳本）
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：4aef011
> GitHub：https://github.com/wikiiizhao/pm-review-copilot｜⭐ 1｜授權：MIT｜主要語言：Python｜最近更新：2026-07-13

> 本資料包所有永久連結以 commit `4aef011a8d6053b2bdc3aa9f8831772bb275846b` 為準。
> 掃描方式：shallow clone 後逐檔閱讀全部 22 個檔案（`git ls-tree -r` 計數），沒有執行任何腳本。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這不是程式框架，而是一份寫得非常完整的 **Agent Skill（SKILL.md 規則書）**，教 AI 把專案的「目前事實／決策／證據／假設／待確認事項／來源快照」分檔存放，並在產出重要文件前先做「新鮮度（過期）檢查」、在審查時用 0–2 分五個維度打分，找出「沒證據的說法、跟舊紀錄衝突、新版偷偷刪掉舊約束」等問題。

**對你（倉儲系統＋廣告＋多 AI 協作）最有用的地方**：

1. **「新舊版本衝突」的解法幾乎可以直接搬**：它定義了記憶條目的 7 種生命週期狀態（`pinned`／`active`／`background`／`archived`／`superseded`／`deprecated`／`needs_review`），每條都有 `superseded_by`、`valid_from`、`valid_until` 欄位。你現在「哪邊是新版本、哪邊是舊版本」分不清楚，正是缺這一套標記。
2. **「單一事實來源」規則**：`CURRENT_STATE.md` 是唯一的「目前有效事實」，其他 AI 想改事實，必須先丟進 `PENDING_UPDATES.md`（候選池），經你確認才升級。這可以防止 GPT 和 Claude 各自改寫規則造成衝突。
3. **衝突優先順序**：當兩份紀錄說法不同時，依序信任 `CURRENT_STATE.md` → `DECISION_LOG.md` → `EVIDENCE_LOG.md` → `RECOVERY_NOTES.md` → `HUMAN_BRIEF.md` → `HYPOTHESIS_LAB.md`。你可以把這個順序寫進自己的 AGENTS.md／CLAUDE.md。
4. **「過期偵測」門檻可直接抄**：24 小時／72 小時／7 天三段門檻、🟢🟡🔴 三種結果、「只讀 5 個檔」的輕量檢查集合 —— 很適合改造成你每天的「巡讀」流程第一步。
5. **交接紀錄（RECOVERY_NOTES.md）＋手動更新日誌（MEMORY_UPDATE_LOG.md）**：每次 AI 做完一輪工作要寫什麼欄位，都有現成模板，能減少「某個 AI 漏做、但沒人知道」的情況。
6. **Diff 審查腳本**：`doc_diff_review.py` 比較新舊兩版文件（例如兩版 AGENTS.md、兩版商品規格），列出新增／刪除行，提醒你檢查「被刪掉的約束」。80 行、只用 Python 標準庫。
7. **標註一致性腳本**：`label_consistency_audit.py` 可拿來比對「GPT 和 Claude 對同一批資料的分類結果是否一致」（例如商品分類、廣告文案標籤），列出完全分歧的樣本優先人工檢查。

**限制先講清楚**：它是 **PM 文件審查導向**，沒有角色分工（沒有「工程師 AI／審查 AI」這類角色設計）、沒有排程、沒有 AGENTS.md／CLAUDE.md 範本、沒有掃描整個程式碼庫找重複的功能。作者還**刻意聲明「不是自動、不是排程、不是背景同步」**。所以它是你基礎架構中「記憶與過期管理」這一塊的好零件，不是整套答案。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權**：MIT（[`LICENSE`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/LICENSE) 已開啟確認，Copyright (c) 2026 wikiiizhao）。
- **個人使用**：完全可以，複製、修改、改成繁體中文都沒問題。
- **公司商用**：可以，包含改寫後放進你自己的內部工具或販售的產品；唯一義務是在你散布的副本中保留原著作權聲明與 MIT 授權文字。若只是內部使用不對外散布，實務上沒有額外負擔。
- **閉源／付費版**：沒有。整個 repo 就是 Markdown 規則＋3 支腳本（各有中英兩份），沒有 SaaS、沒有付費功能、沒有 API 呼叫。
- **上游歸屬說明**：作者在 [`skills/pm-review-copilot-zh/references/source-attribution.md`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/references/source-attribution.md) 寫明設計靈感來自 5 個公開專案（Project Butler、RecallLoom、project-memory-skill、Memory Bank Skill、ProjectMem），並聲明「沒有複製上游原始碼或完整文件」。這 5 個上游的授權我**未確認**；只借用本 repo 的文字與腳本時，依 MIT 即可。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
| --- | --- |
| 前端 | 無 |
| 後端 | 無伺服器；3 支 Python CLI 腳本（`argparse`），只 import 標準庫：`argparse`、`csv`、`difflib`、`collections`、`datetime`、`pathlib`（以 grep 全部 import 行確認） |
| 資料庫 | 無；「資料庫」就是本機 Markdown 檔（`project-memory/`、`work-memory/`） |
| 部署方式 | 把 `skills/pm-review-copilot-zh/` 資料夾複製到 AI 工具的 skills 目錄（README 只示範 Codex：`cp -R skills/pm-review-copilot-zh ~/.codex/skills/`） |
| 硬體／GPU | 不需要 |
| API Key／費用 | 本身不需要任何 API Key；費用只是你原本使用 Claude／ChatGPT（Codex）的訂閱或 token 費用。SKILL.md 本體約 500 行，每次觸發會吃掉一些上下文 token |
| Python 版本 | 腳本使用 `from __future__ import annotations` 與 `list[str]` 型別標註，推估 Python 3.8+ 可跑（**未實測**，依規定未執行） |

---

## 4. 程式架構地圖

檔案數以 `git ls-tree -r --name-only HEAD | wc -l` 計算＝22 個；行數以 `wc -l` 計算，全 repo 共 4,795 行。

```text
pm-review-copilot/
├── README.md                     # 簡體中文主說明（230 行）：趨勢、痛點、核心能力表、安裝、快速開始、設計原則
├── docs/
│   ├── README.en.md              # 英文版說明（230 行）
│   ├── README.ja.md              # 日文版（221 行）
│   └── README.ko.md              # 韓文版（221 行）
├── CHANGELOG.md                  # 0.1.0 → 0.3.0（2026-07-07）變更紀錄
├── CONTRIBUTING.md               # 規定「中英兩版要同步改」「不得描述成自動／排程」
├── LICENSE                       # MIT
├── .gitignore                    # 注意：忽略 project-memory/ 與 pm-memory/
└── skills/
    ├── pm-review-copilot/        # 英文版 skill（輸出英文）
    │   ├── SKILL.md              # 512 行，規則本體
    │   ├── agents/openai.yaml    # Codex 介面顯示名稱、短描述、預設 prompt（4 行）
    │   ├── references/
    │   │   ├── project-memory-templates.md  # 所有記憶檔的完整模板（567 行）
    │   │   └── source-attribution.md        # 上游靈感與再散布注意事項
    │   └── scripts/
    │       ├── init_pm_memory.py            # 建立 project-memory/ 與 work-memory/（546 行）
    │       ├── doc_diff_review.py           # 新舊兩稿 diff 報告（80 行）
    │       └── label_consistency_audit.py   # 多輪標註一致性報告（163 行）
    └── pm-review-copilot-zh/     # 中文版 skill（簡體中文輸出），結構與英文版一一對應
        ├── SKILL.md              # 513 行
        ├── agents/openai.yaml
        ├── references/（同上，中文）
        └── scripts/（同上，中文輸出；label 腳本 162 行）
```

**函式數**（`grep -c "^def "`）：每個語言版本 7 個頂層函式（`init_pm_memory.py` 1 個、`doc_diff_review.py` 2 個、`label_consistency_audit.py` 4 個），兩版合計 14 個。沒有類別。

執行 `init_pm_memory.py` 會產生的檔案（數 `TEMPLATES`／`WORK_TEMPLATES` 兩個 dict 的 key）：`project-memory/` 16 個（含 `.contextignore` 與 `evidence-sources/conversations/README.md`），`work-memory/` 9 個。

---

## 5. 核心功能怎麼實作

以中文版為主（英文版結構相同）。

| 功能 | 程式碼位置 | 實作重點 |
| --- | --- | --- |
| Skill 觸發描述 | [`SKILL.md#L1-L4`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L1-L4) | frontmatter 只有 `name`、`description` 兩欄；description 中英混寫，用「Use when the user explicitly asks…」列出 10 種觸發意圖，最後強制「所有輸出用中文」 |
| 不自動觸發聲明 | [`SKILL.md#L12`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L12) | 明講「不監聽檔案、不定時執行、不在每次回覆後自行審查」 |
| 核心規則 | [`SKILL.md#L14-L29`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L14-L29) | 「廣泛採集，擇優沉澱，異常審查」；假設不得未經證據升級為事實；不准 Agent 靜默替換事實 |
| 場景路由表 | [`SKILL.md#L31-L46`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L31-L46) | 9 種意圖 → 工作流／先讀哪些檔／**可寫哪些檔**／新鮮度要求／輸出格式。「可寫檔案白名單」是防止 AI 亂改的關鍵設計 |
| 記憶目錄結構 | [`SKILL.md#L48-L82`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L48-L82) | 15 個 project-memory 檔＋9 個 work-memory 檔的職責 |
| 讀取順序（少讀原則） | [`SKILL.md#L84-L122`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L84-L122) | 熱路徑只讀 3 檔；恢復專案時 12 步讀取順序；`archived/superseded/deprecated` 預設不讀 |
| 寫入路由 | [`SKILL.md#L124-L148`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L124-L148) | 資訊類型 → 唯一目標檔；第 148 行「不要把同一個完整條目重複寫進多個文件」＝防重複 |
| 提升規則 | [`SKILL.md#L150-L163`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L150-L163) | 假設升級為事實需滿足 4 條件之一；「Agent 過去的總結只能當線索，不能當證據」 |
| 新鮮度檢查 | [`SKILL.md#L165-L201`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L165-L201) | 輸出分一／二／三級；24h／72h／7 天門檻；輕量檢查只讀 5 檔；🟢新鮮／🟡可能過期／🔴已過期或受阻 |
| 來源快照登記 | [`SKILL.md#L203-L222`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L203-L222) | YAML 欄位 `source_id`、`online_url`、`local_snapshot`、`last_synced_at`、`freshness_status: current|unknown|stale`、`max_staleness_hours: 24` |
| 證據出處 | [`SKILL.md#L224-L240`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L224-L240) | `verification_status: verified|needs_review|unverifiable`；對話證據存到 `evidence-sources/conversations/` |
| 生命週期管理 | [`SKILL.md#L252-L302`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L252-L302) | 7 種狀態＋metadata（`superseded_by`、`valid_until`…）；整理流程「先給建議清單→確認後執行→寫 log」；「優先標記和移動，不要直接刪除」 |
| 手動記憶更新 | [`SKILL.md#L325-L350`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L325-L350) | 9 步流程，第 7 步 MEMORY_UPDATE_LOG 有 11 個必填欄位 |
| 審查模式分層 | [`SKILL.md#L352-L362`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L352-L362) | 極速／標準／審計級；「不要把輕量請求靜默升級成長審計」 |
| 審查關卡＋風險評分 | [`SKILL.md#L364-L441`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L364-L441) | 報告格式固定 5 段；Claim 6 類型；5 維度 × 0–2 分；0–2 低、3–5 中、6–10 高；特殊升級規則（記憶衝突＝2 至少算中風險） |
| Diff 審查 | [`SKILL.md#L443-L454`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L443-L454)＋[`scripts/doc_diff_review.py`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/doc_diff_review.py) | `difflib.unified_diff`；新增／刪除各最多列 80 行、統一 diff 最多 300 行 |
| 標註一致性 | [`SKILL.md#L456-L482`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L456-L482)＋[`scripts/label_consistency_audit.py`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/label_consistency_audit.py) | 自動偵測含 `label/tag/class/prediction/标签/分类/预测` 的欄位；計算完全一致率、分歧標籤排行、標籤兩兩替代次數；P1＝全部不同、P2＝部分分歧 |
| 會話結束檢查 | [`SKILL.md#L496-L513`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L496-L513) | 12 題自我檢查清單（事實變了嗎？要寫決策嗎？要更新 HUMAN_BRIEF 嗎？要列入生命週期整理嗎？） |
| 記憶初始化 | [`scripts/init_pm_memory.py#L473-L542`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L473-L542) | 參數 `--path`、`--memory-root`、`--work-root`、`--skip-work-memory`、`--project-name`、`--force`；已存在的檔案預設跳過，不覆蓋 |
| 衝突優先順序（寫在模板內） | [`scripts/init_pm_memory.py#L52-L62`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L52-L62) | CURRENT_STATE > DECISION_LOG > EVIDENCE_LOG > RECOVERY_NOTES > HUMAN_BRIEF > HYPOTHESIS_LAB，「合併衝突前先報告」 |

**評分表範例**（摘自 SKILL.md L416–L422，轉成繁中）：

| 維度 | 0 | 1 | 2 |
| --- | --- | --- | --- |
| 證據缺失 | 有明確證據 | 證據弱或間接 | 聽起來像事實但沒證據 |
| 決策影響 | 僅資訊 | 影響局部 | 影響範圍、上線、資源 |
| 記憶衝突 | 無 | 與 background 有張力 | 與 pinned／active 衝突 |
| 指標風險 | 定義完整 | 缺次要細節 | 缺分母、時間窗、基準 |
| 新鮮度風險 | 來源最新 | 未知或輕微過期 | 已過期或與輸入衝突 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
| --- | --- | --- | --- | --- |
| 記憶生命週期 7 狀態＋metadata | [`SKILL.md#L252-L302`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L252-L302) | 無 | 低 | 直接貼進你的 AGENTS.md「版本與過期」章節；在每份規則／規格檔頂端加 `status:`、`superseded_by:`、`updated_at:` |
| 新鮮度檢查（分級＋門檻＋🟢🟡🔴） | [`SKILL.md#L165-L201`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L165-L201) | 無 | 低 | 改成「每日巡讀」skill 的第一段；把「PRD」換成「倉儲功能規格、廣告素材規範」 |
| 寫入路由＋可寫檔白名單 | [`SKILL.md#L31-L46`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L31-L46)、[`#L124-L148`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L124-L148) | 無 | 低 | 為每個 AI 角色定義「可讀檔／可寫檔」，例如 Codex 只能寫 `src/` 與 `HANDOFF.md`，Claude 審查員只能寫 `REVIEW_LOG.md` |
| 待更新池 PENDING_UPDATES | [`init_pm_memory.py#L180-L202`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L180-L202) | 無 | 低 | 所有 AI 發現「規則可能要改」時只能寫這裡，由你每天確認，防止兩個 AI 互相覆寫規則 |
| 衝突優先順序 | [`init_pm_memory.py#L52-L62`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L52-L62) | 無 | 低 | 寫進共用規則：「當兩份文件矛盾，以 X 為準，並先回報不要自行合併」 |
| 來源登記 SOURCE_REGISTRY | [`init_pm_memory.py#L203-L224`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L203-L224) | 無 | 低 | 登記你的 Google 試算表、Firebase 設定、廣告後台匯出檔：哪個是正本、本機副本何時同步 |
| 交接紀錄 RECOVERY_NOTES＋更新日誌 | [`init_pm_memory.py#L357-L382`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L357-L382) | 無 | 低 | 每個 AI 收工前必寫；巡讀時檢查「今天有改檔但沒寫交接」的情況 |
| 審查報告格式＋5 維評分 | [`SKILL.md#L364-L441`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L364-L441) | 無 | 低 | 當成「審查員 AI」的固定輸出格式；GPT 寫、Claude 用這格式審 |
| `init_pm_memory.py` 初始化腳本 | [`scripts/init_pm_memory.py`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py) | Python 標準庫 | 低 | 改 `TEMPLATES` dict 的檔名與內容，就變成你自己的「AI 協作骨架產生器」 |
| `doc_diff_review.py` | [`scripts/doc_diff_review.py`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/doc_diff_review.py) | Python 標準庫 | 低 | 巡讀時比對 `AGENTS.md` 與 `CLAUDE.md` 或昨天 vs 今天版本；若要用在 JS 專案，`difflib` 可改用 npm `diff` 套件（約 50 行可重寫） |
| `label_consistency_audit.py` | [`scripts/label_consistency_audit.py`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/label_consistency_audit.py) | Python 標準庫 | 低 | 讓 GPT 和 Claude 各自幫商品分類／廣告受眾標籤，把結果放同一 CSV 不同欄，跑出分歧清單 |
| 會話結束 12 題清單 | [`SKILL.md#L496-L513`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L496-L513) | 無 | 低 | 放到每個 AI 角色的「完成前檢查」 |

---

## 7. AI／Claude 整合

- **用哪些模型**：程式碼完全不呼叫任何模型 API。它是「給模型讀的規則書」，模型由你使用的 Agent 工具決定。
- **prompt 放在哪**：主 prompt 就是 [`skills/pm-review-copilot-zh/SKILL.md`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md)；Codex 的介面預設 prompt 在 [`agents/openai.yaml`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/agents/openai.yaml)（`display_name`、`short_description`、`default_prompt` 三欄）。
- **有沒有 MCP／Skills**：沒有 MCP。有 Skills —— 格式為「資料夾＋`SKILL.md`（YAML frontmatter 含 `name`、`description`）＋`scripts/`＋`references/`」，這個結構與 Anthropic Agent Skills 以及 OpenAI Codex skills 的通用格式一致。
- **能不能換成 Claude**：可接。README 只示範 Codex 安裝（`~/.codex/skills/`），**沒有提到 Claude Code**；但依 SKILL.md 格式推斷，複製到 Claude Code 的 `~/.claude/skills/pm-review-copilot-zh/` 或專案內 `.claude/skills/pm-review-copilot-zh/` 應可被辨識（此為依格式推斷，**未實測**）。`agents/openai.yaml` 是 Codex 專屬中繼資料，Claude 會忽略它，不影響。
- **讓 GPT 和 Claude 共用**：同一個資料夾複製兩份（或用 symlink）到 `~/.codex/skills/` 和 `~/.claude/skills/`，兩邊就讀同一份規則；而 `project-memory/` 是放在專案根目錄的純 Markdown，兩個 AI 都能讀寫 —— 這正是「共用記憶」的最簡做法。

---

## 8. 擴充方式與 API

- **沒有程式 API**。擴充方式就是改文字：
  - 改 [`SKILL.md`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md) 的「場景路由表」加新工作流（例如加一列「每日巡讀」）。
  - 改 [`init_pm_memory.py`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py) 的 `TEMPLATES`（L11 起）、`WORK_TEMPLATES`（L397 起）兩個 dict，新增檔案模板；模板用 Python `str.format`，只有 `{project_name}`、`{memory_root}`、`{timestamp}` 三個佔位符，新增內容若含 `{}` 必須寫成 `{{}}`。
  - 腳本 CLI 參數：
    - `init_pm_memory.py --path . --project-name "倉儲系統" [--memory-root project-memory] [--work-root work-memory] [--skip-work-memory] [--force]`
    - `doc_diff_review.py 舊檔 新檔 [--output report.md] [--context 2]`
    - `label_consistency_audit.py input.csv [--id-column id] [--label-columns a,b,c] [--output report.md] [--top-n 50]`
- **貢獻規範**（[`CONTRIBUTING.md`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/CONTRIBUTING.md)）：中英版要同步、不得描述為自動或排程、輸出要聚焦在人的決策點。

---

## 9. 程式品質與風險

- **維護狀況**：單一作者、⭐1；預設分支 HEAD commit 為 2026-07-07「Prepare v0.3.0 release」（`git log -1` 確認，shallow clone 只看得到這一個 commit）；GitHub 顯示最後 push 2026-07-13。到掃描日約 4 個月無更新。版本歷程 0.1.0 → 0.3.0（[`CHANGELOG.md`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/CHANGELOG.md)，中間沒有 0.2.0 紀錄）。
- **測試**：沒有自動化測試檔、沒有 CI 設定（檔案清單中無 `tests/`、`.github/`）。CONTRIBUTING 只要求 `py_compile` 加手動跑初始化腳本。
- **資安／隱私**：腳本只讀寫本機檔案，無網路、無遙測、無外部依賴（grep import 確認）。風險反而在「內容」：`evidence-sources/conversations/` 會存放對話原文片段，若專案推到公開 GitHub（例如你的 `*.github.io`）可能外洩客戶或成本資訊。
- **已知的坑**：
  1. **簡體中文**：中文版輸出是簡體，你需要自己把 SKILL.md 與模板轉繁體（並把「项目」改「專案」、「文档」改「文件」等）。
  2. **`.gitignore` 忽略 `project-memory/`**（[`.gitignore`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/.gitignore)）：這是 repo 本身的設定，但若你照抄，多台電腦／多個 AI 之間就無法透過 git 共享記憶。要共用記憶，請**不要**忽略它（敏感內容另放）。
  3. **規則很長**：SKILL.md 約 513 行，每次觸發都吃上下文；作者用「少讀原則」緩解，但你若再疊多個 skill，要注意總長度。
  4. **純 PM 文件導向**：沒有掃描程式碼、沒有找重複函式、沒有找重複規則的自動化；「重複」只靠一句寫作規則（SKILL.md L148）和生命週期整理時「人工判斷」。
  5. **`label_consistency_audit.py` 小瑕疵**：一列中若「A、B、空白」，因只比較非空值，會被判成「完全分歧（P1）」而不是「部分分歧」（見 [L66-L84 判斷邏輯](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/label_consistency_audit.py#L66-L84)，閱讀推論，未執行）。另外用 `item in complete_disagreements` 判斷優先級是 O(n²)，資料量上萬列時會變慢。
  6. **新鮮度只是規則不是程式**：「上次更新超過 24 小時」完全由 AI 讀 `MEMORY_UPDATE_LOG.md` 自己判斷，沒有腳本去讀檔案修改時間。想要可靠，需要你自己補一支腳本（見第 10 節）。

---

## 10. 跟其他專案組合的建議

你的目標是「GPT（Codex）＋Claude 有秩序地合作＋每日巡讀」。這個 repo 負責 **「記憶分層、單一事實來源、過期與版本漂移」**，建議這樣組合：

| 需求 | 這個 repo 提供 | 需要從別處補 |
| --- | --- | --- |
| 共用規則檔（AGENTS.md／CLAUDE.md） | 沒有 | 用同資料夾其他資料包（例如 openai／anthropics 官方 skills、ECC、spec-kit、OpenSpec）的 AGENTS.md 分層寫法；做法：寫一份 `AGENTS.md` 為正本，`CLAUDE.md` 只放一行 `@AGENTS.md` 引用＋Claude 專屬補充 |
| 角色分工 | 沒有 | 參考 agency-agents／wshobson／BMAD 的角色定義，再把本 repo 的「可讀／可寫檔白名單」套到每個角色 |
| 單一事實來源＋版本標記 | ✅ CURRENT_STATE＋7 狀態生命週期＋superseded_by | — |
| 變更提案 | ✅ PENDING_UPDATES（較輕量） | 若要正式「提案→審核→封存」，參考 OpenSpec 的 `changes/` → `archive/` |
| 過期偵測 | ✅ 規則＋門檻 | 補一支腳本讀 `git log` 或檔案 mtime，自動標出「超過 N 天未更新」的規則檔 |
| 每日巡讀 | ❌（刻意不做） | 用 Claude Code 的排程（cron／scheduled task）或 GitHub Actions 每天跑一次「巡讀 skill」 |

**建議的「每日巡讀」skill 草稿（拿本 repo 的零件拼成）**：

1. 讀 `project-memory/CONTEXT_MANIFEST.md`、`HUMAN_BRIEF.md`、`PENDING_UPDATES.md` 未處理摘要、`SOURCE_REGISTRY.md`、`MEMORY_UPDATE_LOG.md` 最新一筆（＝本 repo 的輕量新鮮度檢查集合）。
2. 跑 `git log --since=yesterday --name-only` 找昨天改過的檔，檢查是否都有對應的 `RECOVERY_NOTES.md` 交接紀錄（防漏）。
3. 對 `AGENTS.md` vs `CLAUDE.md`、以及昨天 vs 今天的規則檔跑 `doc_diff_review.py`，標出被刪掉的約束（防新舊衝突）。
4. 找出狀態為 `active` 但 `valid_until` 已過、或 `superseded_by` 有值卻仍被引用的條目（防舊版本被誤用）。
5. 用本 repo 的報告格式輸出：頂部 `🟡 結論：需要確認 · 人工審查負荷：🟡 中`，接著「必須檢查／衝突／漂移／可以忽略」四表，寫入 `REVIEW_LOG.md`。

---

## 11. 規則／角色／巡檢 檢查表

**共用規則怎麼寫**
- **檔案結構（AGENTS.md／CLAUDE.md／.ruler／constitution／rules）**：沒有。repo 根目錄只有 README、CHANGELOG、CONTRIBUTING、LICENSE、.gitignore（`ls -a` 確認），沒有 AGENTS.md 或 CLAUDE.md。規則全部寫在 [`SKILL.md`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md) 裡。
- **分層（全域／專案／子資料夾）**：部分有。skill 本身裝在使用者層級（`~/.codex/skills/`，見 [`README.md#L87-L97`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/README.md#L87-L97)），記憶放在專案層級 `project-memory/`；另有 `work-memory/` 與專案事實分離。沒有子資料夾層級規則。
- **優先順序**：有（針對記憶內容，不是針對規則檔）。[`init_pm_memory.py#L52-L62`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L52-L62) 定義 6 層衝突優先順序，並要求「合併衝突前先報告」。
- **讓 GPT（Codex）和 Claude 讀同一份規則**：未確認。README 只寫 Codex；但 skill 是通用 SKILL.md 格式、記憶是純 Markdown，理論上兩邊可共用同一資料夾（推論）。README 也說「可接入任何支援自訂指令、技能或專案知識的智能體工作流」（[`README.md#L74-L85`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/README.md#L74-L85)）。

**角色設計**
- **角色／職責**：沒有多 AI 角色。只有「Agent」與「人（PM，審查者與決策者）」兩方；人負責確認升級事實、同意刪除、決定生命週期變更（[`SKILL.md#L286-L302`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L286-L302)）。
- **技能（skills）**：1 個 skill（中英兩版），內含 9 種工作流（路由表）。
- **可用工具**：只有 3 支本地腳本，以及「每個工作流可寫哪些檔」的白名單（[`SKILL.md#L35-L46`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L35-L46)）—— 這是可轉用到角色權限設計的好概念。
- **交接（handoff）**：有。「會話交接」工作流寫 `RECOVERY_NOTES.md`（[`SKILL.md#L46`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L46)），模板欄位：發生什麼變化／目前確定為真／目前阻塞／下一步／下次優先讀取檔案（[`init_pm_memory.py#L375-L382`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L375-L382)）。
- **誰向誰負責**：Agent 向 PM 負責；Agent 不得靜默替換事實、不得未經同意刪除記憶。

**防漏**
- **任務追蹤**：部分有。`HUMAN_BRIEF.md` 有「跟蹤事項」表（事項／狀態／下一步或阻塞／來源）與「必須檢查」清單；`work-memory/REVIEW_BACKLOG.md` 是覆盤候選池（[`init_pm_memory.py#L292-L315`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L292-L315)）。沒有 issue／backlog 系統整合。
- **完成前驗證**：有（清單式）。會話結束 12 題自我檢查（[`SKILL.md#L496-L513`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L496-L513)）；手動更新後必寫 MEMORY_UPDATE_LOG 11 欄（[`SKILL.md#L335-L346`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L335-L346)），其中「因不具長期價值而跳過」欄位讓「沒寫進去的東西」也有紀錄。
- **交接紀錄**：有，見上。

**防重複**
- **重複內容／規則／角色偵測或合併**：部分有，純規則、無自動偵測。寫入路由規定「不要把同一個完整條目重複寫進多個文件，需要導航時用連結或短摘要」（[`SKILL.md#L148`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L148)）；生命週期整理時把「過時、重複、已被替代」的條目列入建議清單（[`SKILL.md#L254`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L254)、[`#L511`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L511)）。沒有腳本比對相似段落。

**防新舊版本衝突**（本 repo 最強項）
- **版本標記**：有。lifecycle metadata 含 `status`、`created_at`、`updated_at`、`valid_from`、`valid_until`、`superseded_by`、`confidence`（[`SKILL.md#L268-L284`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L268-L284)）。
- **單一事實來源**：有。`CURRENT_STATE.md` 是唯一目前事實；`PENDING_UPDATES.md` 明寫「不是事實來源」；在線文件是正本、本機 Markdown 是快照（[`SKILL.md#L203-L222`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L203-L222)）。
- **變更提案／封存**：有（輕量）。候選變化先進 `PENDING_UPDATES.md`，狀態 `unresolved|accepted|rejected|promoted|archived`（[`init_pm_memory.py#L180-L202`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L180-L202)）；`MEMORY_LIFECYCLE.md` 有「替代關係索引」與「歸檔索引」表。
- **過期（staleness／drift）偵測**：有（規則層面）。新鮮度三級門檻（[`SKILL.md#L165-L201`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L165-L201)）；版本漂移由 Diff 審查找「被刪除的約束、被弱化的保留意見、改變的指標定義」（[`SKILL.md#L443-L454`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L443-L454)）；風險訊號含「TBD 被改寫成事實」「舊約束被靜默刪除」（[`SKILL.md#L432-L441`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L432-L441)）。

**定期巡檢**
- **排程／每日巡讀（heartbeat、cron、hook）**：沒有，而且是**刻意不做**（[`SKILL.md#L12`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L12)、[`CONTRIBUTING.md`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/CONTRIBUTING.md) 規定不得描述為自動或排程）。最接近的是「日／週／月覆盤」工作流（[`SKILL.md#L242-L250`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L242-L250)），但需手動觸發。
- **報告格式**：有，固定格式。簡短範例（依 [`SKILL.md#L372-L401`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L372-L401) 改寫成繁中、套用你的情境）：

```markdown
## 審查結論
🟡 結論：需要本地確認 · 人工審查負荷：🟡 中
審查模式：標準審查
一句話總結：Codex 新版出貨規則刪除了「負庫存禁止出貨」約束，需確認。

## 必須檢查
| 優先級 | 位置 | 問題 | 為什麼重要 | 建議動作 |
| P1 | AGENTS.md §出貨 | 舊約束被刪 | 可能造成超賣 | 還原或在 DECISION_LOG 記錄決策 |

## Claim 審計
| 類型 | 位置 | Claim | 證據狀態 | 風險評分 | 風險依據 | 動作 |
| metric | 廣告週報 | ROAS 提升 30% | 無 | 2+2+0+2+1=7 高 | 缺分母與時間窗 | 補資料來源 |

## 記憶衝突 / 與上一版的漂移 / 可以忽略
（略）
```

**Skill 寫法**
- **SKILL.md 格式**：YAML frontmatter（`name`、`description`）＋Markdown 本文（[`SKILL.md#L1-L4`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L1-L4)）。
- **description 怎麼寫才會被正確觸發**：本 repo 的寫法值得學：先一句話列能力關鍵字，再用英文「Use when the user explicitly asks … to initialize, update, compact, archive, or resume … check whether … stale … review … compare … audit …」列出**動詞＋對象**清單，最後加輸出語言限制。中文版 description 特意中英混寫，讓中英文請求都能匹配。並在本文 L12 列出「什麼時候不要用」。
- **資料夾結構**：`SKILL.md`＋`agents/openai.yaml`（Codex UI 中繼資料）＋`references/`（長模板，按需讀取，SKILL.md L492-L494 指示何時讀）＋`scripts/`（確定性工作交給腳本）。
- **腳本放哪**：`scripts/`，SKILL.md 中用相對路徑 `scripts/xxx.py` 呼叫（[`SKILL.md#L484-L488`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L484-L488)）。

**支援哪些工具與安裝方式**
- Codex：有明確說明，`cp -R skills/pm-review-copilot-zh ~/.codex/skills/`，以 `$pm-review-copilot-zh` 呼叫（[`README.md#L87-L105`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/README.md#L87-L105)）。
- Claude Code：未確認（README 沒提；格式相容，推論可放 `~/.claude/skills/` 或 `.claude/skills/`）。
- Cursor／其他：未確認；README 只泛稱「把 SKILL.md 當技能或專案指令載入」。

**可以直接借用到使用者「基礎架構」的檔案或段落**
1. [`skills/pm-review-copilot-zh/SKILL.md#L252-L302`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L252-L302) —— 生命週期 7 狀態＋metadata，貼進 AGENTS.md「版本管理」章節。
2. [`skills/pm-review-copilot-zh/SKILL.md#L165-L201`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L165-L201) —— 新鮮度分級與門檻，作為巡讀 skill 第一段。
3. [`skills/pm-review-copilot-zh/SKILL.md#L124-L163`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L124-L163) —— 寫入路由＋提升規則（防重複、防 AI 亂升級事實）。
4. [`skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L12-L84`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L12-L84) —— CONTEXT_MANIFEST 模板（讀取順序、規範職責、衝突優先順序、忽略清單），可改造成你的 `docs/ai/MANIFEST.md`。
5. [`skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L180-L224`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L180-L224) —— PENDING_UPDATES 與 SOURCE_REGISTRY 模板。
6. [`skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L357-L382`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/init_pm_memory.py#L357-L382) —— MEMORY_UPDATE_LOG 與 RECOVERY_NOTES（交接）模板。
7. [`skills/pm-review-copilot-zh/SKILL.md#L364-L441`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L364-L441) —— 審查報告格式＋5 維評分，作為「審查員」角色的輸出規範。
8. [`skills/pm-review-copilot-zh/scripts/doc_diff_review.py`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/scripts/doc_diff_review.py) —— 巡讀時比對新舊規則檔。
9. [`skills/pm-review-copilot-zh/SKILL.md#L496-L513`](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L496-L513) —— 收工前 12 題檢查清單。

---

## 關鍵字
pm-review-copilot、PM Review Copilot、Agent Skill、SKILL.md、Codex skills、Claude Code skills、專案記憶、project memory、project-memory、記憶生命週期、memory lifecycle、pinned、superseded、deprecated、新鮮度檢查、freshness check、過期偵測、staleness、版本漂移、version drift、diff review、單一事實來源、single source of truth、CURRENT_STATE.md、PENDING_UPDATES.md、待更新池、SOURCE_REGISTRY.md、來源快照、交接紀錄、RECOVERY_NOTES.md、handoff、HUMAN_BRIEF.md、幻覺檢查、hallucination check、Claim 風險評分、claim audit、審查關卡、review gate、標註一致性、label consistency audit、證據出處、evidence provenance、衝突優先順序、每日巡讀、多 AI 協作、MIT、Python 標準庫
