# Thomaszhou22/memory-checkup — 一個「只讀不改」的 AI 記憶庫健檢 Skill：抓過期數字、斷掉的檔案引用、每日紀錄斷檔、沒人引用的孤兒檔
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：79ca4ee
> GitHub：https://github.com/Thomaszhou22/memory-checkup｜⭐ 1｜授權：MIT｜主要語言：Python｜最近更新：2026-09-07

> 本資料包所有路徑都在 commit `79ca4ee0eab32a59eed6fe8ba37b4f21244ba290` 上親自開檔、逐行讀過。整個 repo 只有 6 個檔案（用 `git ls-tree -r --name-only HEAD` 列出）：`.gitignore`、`LICENSE`、`README.md`、`README_CN.md`、`SKILL.md`、`scripts/memory_checkup.py`，合計 432 行（`wc -l` 計算），其中真正的程式只有 `scripts/memory_checkup.py` 222 行。因為小，我把每一行都讀完了，下面的判斷（包含幾個 bug）都來自實際閱讀程式碼，**沒有執行過**（依安全規則不執行 repo 內任何東西）。
>
> 以下 permalink 前綴：`https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/`

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：一個給 Claude Code／OpenClaw 用的 Skill（`SKILL.md`＋一支 222 行、只用 Python 標準函式庫的腳本），掃描 AI 的長期記憶檔（`MEMORY.md`、`USER.md`、`AGENTS.md`、`HEARTBEAT.md` 與 `memory/*.md`），找出四種「漂移」：**同一個數字新舊版本並存**、**引用的檔案已經不存在**、**每日紀錄斷了幾天**、**沒有被任何檔案引用的孤兒檔**。腳本只產生報告，修改交給 AI 在「先跟人或真實資料確認」之後逐檔處理。

**對你最有價值的地方**（你提到「每天巡讀整個專案，看哪個 AI 漏東西、哪裡重複、哪邊新版哪邊舊版衝突」）：

1. **它是目前看到最接近「每日巡讀」概念的現成小工具**，而且小到你可以一個下午讀完、改成自己的版本。它的設計哲學值得直接抄進你的規則：
   - 巡檢工具**只讀不改**（「會無監督改記憶的審計工具，本身就是它該審計的對象」，見 README Design notes）。
   - 每個「過期」標記是**問題，不是判決**——AI 必須先查真實來源（打 API、數檔案、問老闆）才能改。
   - 舊數字不一定刪，可以**標註「舊口徑已作廢」**保留歷史。
   - 孤兒檔**不准 AI 自己刪**，只能列給人決定。
2. **四種檢查剛好對應你的三個痛點**：
   - 「新舊版本衝突」→ Stale numbers（同一指標出現多個數值，以最新日期檔案的值為準，其餘列為過期）。
   - 「AI 漏東西」→ Stale entries（每日紀錄缺了某幾天，代表某個 AI 的每日交接/日誌任務可能掛了）。
   - 「引用錯亂／檔案搬家沒同步」→ Dangling references（文件裡提到的 `scripts/…py`、`memory/…md` 路徑已不存在）。
   - 「重複／沒人管的文件」→ Orphans（沒有任何其他檔案提到它的文件，可能是被遺忘的舊版或重複稿）。
3. **可以變成你倉儲 app 專案的「文件健檢」**：把它的 `DEFAULT_PATTERNS` 換成你在意的數字（例如「安全庫存 50 件」「運費 60 元」「Firebase 方案」「版本 v1.3」），掃描範圍從 `memory/` 改成你的 `docs/`、`AGENTS.md`、`CLAUDE.md`，就能每天抓出「Claude 寫的文件說運費 60，Codex 寫的說 80」這類衝突。

**要先講清楚的限制**：它不是多 AI 協作框架，沒有角色設計、沒有任務追蹤、沒有 GPT/Codex 專屬設定、沒有排程檔；數字辨識只認**簡體中文**關鍵字（`下载`、`用户`、`网站`），台灣用的繁體「下載」「用戶」「網站」**不會被抓到**（詳見第 9 節）。它適合當「巡讀腳本的起點與設計範本」，不是拿來就能用的成品。

---

## 2. 授權白話

- **授權**：MIT（`LICENSE` 第 1 行 `MIT License`、第 3 行 `Copyright (c) 2026 Thomaszhou22`，GitHub 也偵測為 MIT）。
  permalink：https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/LICENSE
- **個人使用**：完全自由，可以複製、修改、合併到你自己的工具裡。
- **公司商用**：也可以，包含改寫後放進公司內部工具或賣的產品；唯一要求是**在你的程式碼或文件中保留原本的版權聲明與 MIT 授權全文**（例如在你改寫的 `patrol.py` 開頭註明「部分改寫自 Thomaszhou22/memory-checkup，MIT License」並附上 LICENSE）。MIT 不提供任何保證，出錯作者不負責。
- **閉源／付費版**：沒有。repo 裡沒有任何付費功能、雲端服務或遙測，整個專案就是這 6 個檔案。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | Python 3（程式內用了 `str` 型別標註與 f-string，至少需要 Python 3.6；精確最低版本未確認） |
| 相依套件 | **只用標準函式庫**：`argparse`、`datetime`、`json`、`os`、`re`、`sys`、`pathlib`（見 `scripts/memory_checkup.py#L23-L29`）。不需要 `pip install` 任何東西 |
| 前端／後端／資料庫 | 都沒有。是命令列腳本，讀本機 Markdown 檔，輸出文字或 JSON |
| 部署方式 | 複製或軟連結整個資料夾到 Claude Code／OpenClaw 的 skills 目錄（README「Using as an OpenClaw / Claude Code skill」段） |
| 硬體／GPU | 不需要，任何能跑 Python 的電腦都行 |
| API Key／費用 | 腳本本身**不呼叫任何 AI 或網路 API，0 元**。費用只發生在你讓 Claude/Codex 讀報告並修檔時消耗的 token |
| 執行指令 | `python3 scripts/memory_checkup.py --memory-dir <工作區根目錄> [--json]`（`SKILL.md#L23-L29`、腳本 `#L176-L181`） |

permalink：
- https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L23-L29
- https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md#L23-L36

---

## 4. 程式架構地圖

```
memory-checkup/
├── .gitignore                 # 忽略 __pycache__/、*.pyc、.DS_Store（3 行）
├── LICENSE                    # MIT（21 行）
├── README.md                  # 英文說明：檢查項目、快速開始、設計理念、實測、限制（74 行）
├── README_CN.md               # 簡體中文版說明（55 行，內容與英文版大致相同，少了 File structure 段）
├── SKILL.md                   # ★ 給 AI 讀的技能說明：frontmatter 觸發條件＋5 步驟流程（57 行）
└── scripts/
    └── memory_checkup.py      # ★ 只讀的稽核腳本（222 行）
```

`scripts/memory_checkup.py` 內部結構（我用 `grep -nE '^\s*def '` 數出 **6 個頂層函式＋2 個巢狀函式**，共 8 個）：

| 行號 | 名稱 | 用途 |
|---|---|---|
| L31-L36 | `DEFAULT_PATTERNS` | 要追蹤的指標清單：`downloads`、`stars`、`users` 三組正規表示式 |
| L38-L39 | `DATE_RE`、`PATH_RE` | 從檔名抓 `YYYY-MM-DD` 日期；從內文抓檔案路徑 |
| L42 | `parse_date_from_name()` | 檔名轉日期，失敗回傳 `None` |
| L52 | `_line_context_ok()` | 用同一行的上下文過濾誤判（星數那行必須有 github；用戶數那行必須有「网站/site/website」且不含「受试」） |
| L63 | `norm_num()` | 去掉千分位逗號轉整數 |
| L67 | `load_files()` | 決定掃描範圍：根目錄 4 個固定檔名＋`memory/*.md`（不遞迴） |
| L82 | `audit()` | 主邏輯：四種檢查都在這裡 |
| L109 | `latest_date()`（巢狀於 `audit`） | 某數值出現過的檔案中，最新的日期 |
| L176 | `main()` | 參數解析與報告輸出 |
| L198 | `show()`（巢狀於 `main`） | 每類問題印前 20 筆 |

---

## 5. 核心功能怎麼實作

### 5.1 掃描範圍：哪些檔案會被讀
- 位置：https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L67-L79
- 重點：
  - 只讀根目錄 `MEMORY.md`、`USER.md`、`AGENTS.md`、`HEARTBEAT.md` 四個固定檔名（L71），加上 `memory/` 底下一層的 `*.md`（L77 用 `glob("*.md")`，**不含子資料夾**）。
  - **不會讀 `CLAUDE.md`**，也不會讀 `docs/`、`skills/`、專案原始碼。這是刻意的「範圍紀律」（README L49），但對你來說代表：要巡讀 `CLAUDE.md` 和專案文件，必須自己把檔名加進 L71 的 tuple 或改 L77 的 glob。
  - 以 UTF-8 讀取、錯誤字元用替換（`errors="replace"`），不會因為亂碼而當掉。

### 5.2 過期數字（新舊版本衝突）偵測
- 位置：https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L87-L123 （規則表在 #L31-L36）
- 演算法：
  1. 逐檔逐行，對每個指標跑正規表示式，例如下載數 `([\d,]{3,7})\+?\s*(?:downloads|下载)`（L33）；符合且上下文檢查通過，就記下（數值、檔名、行號）。
  2. 同一指標若出現 **2 個以上不同數值**，就排序：主鍵是「這個數值出現過的檔案中最新的檔名日期」，次鍵是數值大小，由大到小（L113-L115）。沒有日期的檔案（例如 `MEMORY.md`）一律當成 1970-01-01。
  3. 排第一的當「current」，其他每個數值都產生一筆 `stale_numbers`，附上 current 與 stale 各自出現在哪些檔案（L118-L123）。
- 實作重點／你要知道的行為：
  - **只看「同一指標名稱」，不看「是哪個東西的指標」**。如果記憶裡同時寫「A 專案 120 GitHub stars」和「B 專案 45 GitHub stars」，它會判定其中一個「過期」——這是誤報。所以 SKILL.md 才強調 Step 3「改之前先驗證」。
  - **沒有日期的總表（`MEMORY.md`）永遠排最後**。換句話說，如果你把「單一事實來源」放在 `MEMORY.md`，而某天的日誌裡寫了一個不同的數字（即使是在回顧舊數字），腳本會反過來說 `MEMORY.md` 過期。改寫時建議把「總表」設為最高優先，而不是最低。
  - 每個 pattern 的第三欄 `True`（註解叫 tolerance）在程式裡**從未被使用**。
  - 腳本開頭 docstring 說有第 2 種檢查「Contradictions（矛盾且沒有作廢註記）」，`issues` 字典也有 `contradictions` 這個鍵（L84），但**全檔沒有任何地方往裡面放資料**，所以永遠是空清單；「已作廢」註記也沒有被辨識的邏輯。

### 5.3 斷掉的檔案引用（Dangling references）
- 位置：https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L125-L133 （路徑規則 #L39）
- 演算法：用 `PATH_RE` 在全文找「路徑中含有 `output/`、`skills/`、`scripts/`、`memory/` 其中一段，且副檔名是 `.py/.md/.docx/.json/.ts/.tsx/.js`」的字串，然後依序試三個位置是否存在：工作區的**上一層**＋路徑、工作區＋路徑、目前執行目錄＋路徑（L131）。三個都不存在就列為斷掉的引用。
- 你要知道的：
  - 只抓含那四個資料夾名的路徑；你的專案若是 `src/inventory.js`、`public/app.js`、`functions/index.js` 都**不會被檢查**。改寫時要把 `(?:output|skills|scripts|memory)` 換成你的資料夾名，副檔名加上 `.html`、`.css`。
  - `~/` 開頭的路徑不會展開，一律會被判定為不存在。
  - 第三個候選 `Path(ref)` 是相對「你在哪個目錄執行指令」，所以結果會隨執行位置不同而改變。
  - L127 的 `base` 變數宣告了但沒用到。

### 5.4 每日紀錄斷檔（Stale entries）
- 位置：https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L135-L153
- 演算法：從所有檔名帶日期的檔案中找出最新日期 `newest`，往回看 1～5 天，哪一天沒有檔案就列一筆，訊息格式 `no memory file dated {day}; newest entry is {newest}`。
- **重要缺陷**：它只跟「最新那份檔案」比，**不跟今天比**。`audit()` 雖然收了 `today` 參數（L82、L184），但函式內完全沒用到。結果是：如果每日紀錄任務 30 天前整個停掉，最新檔案是 30 天前、那之前 5 天都齊全，**腳本會回報 0 問題**——恰好漏掉最嚴重的「整個停擺」。README 說的「dead daily flushes」其實只抓得到「最近有斷斷續續缺幾天」。改寫時一定要加一條：`(today - newest).days > 1` 就警告。

### 5.5 孤兒檔（Orphans，沒人引用的文件）
- 位置：https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L155-L171
- 演算法：排除 `MEMORY.md`、`USER.md` 與檔名帶日期的日誌，其餘檔案若「完整檔名」或「去掉副檔名的名稱」**沒有出現在任何其他檔案的內文中**，就列為孤兒。
- 你要知道的：用的是純字串包含比對，檔名很短（例如 `api.md` → `api`）幾乎一定會被當成「有被引用」；反過來 `AGENTS.md`、`HEARTBEAT.md` 若沒被其他檔提到，會被列為孤兒。

### 5.6 報告輸出
- 位置：https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L176-L218
- 兩種格式：
  - 預設人看的文字版：標題列 → 問題總數 → 每類 `## 類別 (數量)` 列前 20 筆 → 最後一句建議修正流程。
  - `--json`：完整的 `{"files_scanned": N, "issues": {...}}`，方便接到其他程式（README 說可接 cron 或 gateway hook）。
- 注意：文字版**沒有印出 `contradictions`**（反正永遠是空的）；`--verbose` 參數有宣告但沒用；`main()` 沒有回傳值，所以**不論有沒有問題，結束碼都是 0**——如果你要在排程或 GitHub Actions 裡用「有問題就失敗／通知」，必須改成有問題時 `return 1`。

### 5.7 SKILL.md 的 AI 工作流程（這是真正的「規則」部分）
- 位置：https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md
- 五步驟：
  1. **找到記憶庫**（L19-L21）：根目錄要有 `MEMORY.md` 或 `memory/`。
  2. **跑稽核腳本**（L23-L36）。
  3. **改之前先驗證**（L38-L40）：每個過期數字都要跟使用者或「真實證據」確認（打 API、數檔案），「不能因為最新就假設正確」。
  4. **修正**（L42-L47）：更新或標註為已作廢（範例 `旧口径 4,600+ 已作废`）；修或刪斷掉的引用；**孤兒檔不准刪，列給使用者決定**；改完重跑直到 0 問題。
  5. **回報**（L49-L51）：用使用者的語言總結「掃了幾個檔、各類問題幾筆、修了什麼、什麼需要使用者決定」。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整個 SKILL.md 五步驟流程（只讀稽核→驗證→修→重跑→回報） | https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md#L17-L51 | 無 | 低 | 直接改寫成你的 `skills/daily-patrol/SKILL.md`；把「記憶」換成「專案文件」，Step 3 的真實證據換成「讀 Firebase 實際資料／看程式碼實際值」 |
| SKILL.md frontmatter 觸發描述寫法 | https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md#L1-L4 | 無 | 低 | 照「Use when …（列多個情境）…, when the user says "…", "…"」的句型寫，加入繁中觸發詞如「巡讀」「健檢文件」「檢查新舊版本」 |
| 指標規則表 `DEFAULT_PATTERNS`＋上下文過濾 `_line_context_ok` | https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L31-L60 | Python `re` | 低 | 換成你的指標：`("shipping_fee", r"運費\s*(\d+)\s*元", …)`、`("safety_stock", r"安全庫存\s*(\d+)", …)`；上下文過濾可要求同行出現「蝦皮／官網」等以免混淆 |
| 新舊數值排名邏輯（同指標多值→以最新日期為準） | https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L101-L123 | 標準庫 | 低～中 | 拿來偵測「Claude 的文件和 Codex 的文件寫了不同數字」；建議把日期來源從「檔名」改成 `git log -1 --format=%cs -- <檔案>`（最後修改日），並讓 `AGENTS.md`/總表優先 |
| 斷掉的路徑引用檢查 | https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L125-L133 | 標準庫 | 低 | 改 `PATH_RE` 的資料夾名與副檔名，就能抓「規則檔說要改 `js/stock.js`，但檔案早就改名」 |
| 每日紀錄斷檔檢查 | https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L135-L153 | 標準庫 | 低 | 用在你的 `logs/2026-11-04-claude.md`、`logs/2026-11-04-codex.md` 交接日誌；**務必補上跟 today 比較** |
| 孤兒檔檢查 | https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L155-L171 | 標準庫 | 低 | 找出「沒被 `AGENTS.md` 或索引檔提到的文件」→ 通常是 AI 自己多生的重複說明檔 |
| JSON 報告結構 | https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L84-L85 | 無 | 低 | 讓巡讀報告固定成 JSON，之後可在你的 Firebase 網頁做一個「巡讀儀表板」 |

---

## 7. AI／Claude 整合

- **用哪些模型**：腳本本身**不呼叫任何模型**。AI 的角色是「讀 SKILL.md → 執行腳本 → 解讀報告 → 驗證 → 修檔」，任何能跑 shell 指令的 coding agent 都可以。
- **prompt 放在哪**：唯一的「prompt」就是 `SKILL.md`（frontmatter 的 `description` 決定什麼時候觸發，本文是流程）。腳本最後一行輸出的建議句（L218 `Suggested fix flow: confirm the current value with the user, then update stale mentions or mark them superseded.`）也算是給 AI 的提示。
- **MCP**：沒有。
- **Skills**：有，就是標準的 Claude Code Skill 格式（`SKILL.md` 有 `name`、`description` frontmatter，附 `scripts/` 資料夾）。README 寫「Copy or symlink this folder into your skills directory」，支援 OpenClaw 與 Claude Code。
- **能不能換成 Claude**：本來就是為 Claude Code／OpenClaw 寫的，**Claude 原生支援**。
- **Codex（GPT）能不能用**：repo 沒有提到 Codex、沒有 `AGENTS.md`、沒有 `agents/openai.yaml` 之類的設定（未確認 Codex 是否能直接讀這個 SKILL.md 格式）。但因為核心只是一支 Python 腳本，你可以在自己專案的 `AGENTS.md` 寫一句「每天開工前先執行 `python3 tools/patrol.py --json` 並依報告處理」，Codex 和 Claude 就能跑同一支腳本、看同一份報告。

---

## 8. 擴充方式與 API

- **加新的追蹤指標**：README 與 SKILL.md 都明說擴充 `DEFAULT_PATTERNS`（L31-L36）。格式 `(標籤, 含一個數字群組的正規表示式, 容差旗標)`；第三欄目前沒作用。新指標若怕誤判，在 `_line_context_ok()`（L52-L60）加一個 `if label == "...": return 條件`。
- **改掃描範圍**：改 `load_files()`（L67-L79）。
- **當函式庫用**：`audit(memory_dir: Path, today: dt.date)` 回傳 dict，可以 `import` 後在你自己的程式呼叫（L82、L173）。
- **CLI 參數**：`--memory-dir`（預設 `.`）、`--json`、`--verbose`（無作用）（L177-L181）。
- **沒有** plugin 機制、設定檔、HTTP API、hook 設定檔。

---

## 9. 程式品質與風險

**維護狀況**：repo 建立於 2026-09-07，最後一個 commit 是 2026-09-08 07:52（+0800）的「Split Chinese docs into README_CN.md with language switcher」（我用 `git log -1` 只看得到淺複製的最新一筆，完整歷史未確認）。1 顆星，是個人作者的小型一次性專案，之後近兩個月沒有更新，不要期待後續維護。

**測試**：repo 內**沒有任何測試檔、沒有範例記憶庫、沒有 CI**。README「Real-world validation」說在 130 個記憶檔的實際工作區驗證過，但沒有附資料，**未確認**。

**資安／隱私／遙測**：只讀本機檔案、不連網、不寫檔、無遙測——從程式碼逐行確認（全檔沒有 `open(..., "w")`、`write`、`requests`、`urllib`、`subprocess`）。風險很低。

**已知的坑（我讀程式碼發現的，未實際執行）**：
1. **繁體中文抓不到**：關鍵字寫死簡體 `下载`（L33）、`用户`（L35）、`网站`／`受试`（L59）。台灣寫的「下載」「用戶」「網站」完全不會被比對到；只有 `星` 繁簡同字。你要用就必須改成 `(?:downloads|下载|下載)` 這類寫法。
2. **「每日紀錄整個停掉」反而抓不到**：如 5.4 所述，`today` 沒被使用。
3. **`contradictions` 永遠是空的**：docstring 承諾的第 2 種檢查沒實作，也沒有辨識「已作廢」註記的邏輯；若作廢註記仍寫成「4,600+ 下载（已作废）」這種「數字＋關鍵字」結構，下次巡讀還是會被抓出來，跟 SKILL.md「改完重跑直到 0 問題」互相矛盾。
4. **不分主體的數字比較**：不同專案、不同商品的同類數字會互相判定過期（誤報）。
5. **無日期的總表永遠被當最舊**：與「單一事實來源放總表」的常見做法相反。
6. **結束碼永遠是 0**：排程無法用結束碼判斷有沒有問題。
7. **Windows 主控台編碼**：文字版會印 emoji（L190、L194、L196）。在台灣 Windows（cp950）把輸出導向檔案時，Python 可能丟 `UnicodeEncodeError`（未實測；用 `--json` 或設定 `PYTHONIOENCODING=utf-8` 可避開）。
8. 數字長度上限：下載數最多 7 個字元（含逗號），`1.2k downloads`、`1.2萬` 這類寫法抓不到。
9. 小瑕疵：未使用的變數 `base`（L127）、未使用的 `--verbose`、`os` 有 import 但沒用到（L26）。

---

## 10. 跟其他專案組合的建議

這個 repo 只解決「巡檢」這一塊，正好補其他規則框架的缺口：

- **＋ 共用規則檔方案（例如本分類的 mattpocock/skills 用 `AGENTS.md` symlink 到 `CLAUDE.md`）**：先用那套確保 GPT 與 Claude 讀同一份規則，再用本專案的思路每天巡檢「規則檔與專案文件之間有沒有數字或路徑不一致」。
- **＋ 規格／變更提案工具（例如本分類的 OpenSpec、spec-kit）**：它們負責「變更要先寫提案、完成後封存」，本專案負責「封存之後還有沒有舊數字殘留在別的檔案」。
- **建議你的基礎架構巡讀腳本 = 本專案骨架 ＋ 以下改造**（全部是我的建議，不是 repo 內容）：
  1. 掃描範圍：`AGENTS.md`、`CLAUDE.md`、`docs/**/*.md`、`logs/*.md`。
  2. 指標表：你的商業數字（運費、安全庫存、價格規則、Firebase collection 名稱、版本號）＋繁體關鍵字。
  3. 日期來源：用 git 最後修改日，總表／`AGENTS.md` 設最高優先。
  4. 新增「跟 today 比」的停擺警告、「同一段文字出現在兩個檔案」的重複偵測（可用每段 hash 比對）。
  5. 有問題回傳結束碼 1，JSON 報告寫到 `reports/patrol-YYYY-MM-DD.json`。
  6. 排程：用 Claude Code 排程任務或 GitHub Actions 每天跑一次，報告丟給其中一個 AI（例如指定 Claude 為「巡檢員」角色）依 SKILL.md 五步驟處理，另一個 AI（Codex）負責修程式碼。

---

## 11. 規則／角色／巡檢 檢查表

### 共用規則怎麼寫 —— **沒有**
- repo 沒有 `AGENTS.md`、`CLAUDE.md`、`.ruler`、constitution 或 rules 資料夾（6 個檔案已全列）。
- 唯一相關：腳本會把**你的** `AGENTS.md`、`HEARTBEAT.md` 當作記憶檔一起掃描（https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L71），代表作者把「共用規則檔」視為需要一致性稽核的對象。沒有分層、優先順序、GPT/Claude 共讀的設計。

### 角色設計 —— **沒有**
- 沒有定義多個角色。SKILL.md 隱含一個「稽核者」角色：只跑只讀腳本、驗證、逐檔修、回報；並明訂「孤兒檔交給使用者決定」——也就是**人是最終裁決者**（https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md#L42-L47）。沒有 handoff、沒有工具權限設定。

### 防漏 —— **部分有**
- 有：「每日紀錄斷檔」檢查（腳本 #L135-L153）可發現某個 AI 的每日日誌/交接沒寫。限制：只看最新檔前 5 天、不跟今天比。
- 有：「改完重跑直到 0 問題」的完成前驗證（https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md#L47）。
- 沒有：backlog、issue、checklist、交接紀錄格式。

### 防重複 —— **部分有（間接）**
- 有：孤兒檔偵測（腳本 #L155-L171），沒人引用的檔案常是重複或遺忘的版本。
- 沒有：重複段落／重複規則／重複角色的內容比對或合併機制。

### 防新舊版本衝突 —— **有（核心功能）**
- 過期數字偵測（https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L101-L123）：同一指標多個數值，以最新日期檔案為準。
- 作廢標註慣例：「旧口径 4,600+ 已作废」保留歷史而不刪（SKILL.md L44）。
- 「最新不一定正確，先用真實證據驗證」（SKILL.md L38-L40）——這條是防止 AI 用錯誤新值覆蓋正確舊值的關鍵規則。
- 沒有：版本標記（版本號欄位）、明確的單一事實來源設定、變更提案／封存流程。「矛盾」檢查宣告了但未實作。

### 定期巡檢 —— **概念有，排程設定沒有**
- SKILL.md「When to run」第 4 點：Periodically, alongside daily memory flushes（https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md#L10-L15）；README 說 `--json` 可接 cron 或 gateway hook。
- 沒有附 cron 設定、hook 設定或 heartbeat 範本；`HEARTBEAT.md` 只是被列為掃描對象。
- **報告格式**（依 `main()` L190-L218 的 print 格式推導出的示意，非實際執行結果；檔名與數字是我虛構的例子）：

```
🧠 Memory Checkup — 42 files scanned in /path/to/workspace
⚠️ 4 issue(s) found:

## Stale numbers (1)
  - downloads: current=5200 (in memory/2026-11-03.md) but stale=4600 still appears in MEMORY.md, memory/apply-essay.md

## Dangling references (1)
  - memory/2026-10-30.md references missing path: scripts/old_sync.py

## Stale entries (gaps near newest) (1)
  - no memory file dated 2026-11-01; newest entry is 2026-11-03

## Orphan files (1)
  - never referenced elsewhere: memory/draft-notes.md

Suggested fix flow: confirm the current value with the user, then update stale mentions or mark them superseded.
```

  AI 最後依 SKILL.md Step 5 用使用者語言回報：掃了幾個檔、各類幾筆、修了什麼、哪些需要你決定。

### Skill 寫法 —— **有，可當範本**
- 檔案：`SKILL.md` 放根目錄，腳本放 `scripts/`（https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md#L1-L4）。
- frontmatter 只有 `name` 與 `description` 兩欄。`description` 的寫法值得學：先一句說做什麼，再用 **「Use when …」列出 6 種觸發情境**（記憶有過期數字、檔案互相矛盾、指標變了要同步文件、每日紀錄斷了、引用的檔案不存在、使用者說特定關鍵字），最後一種是「憑記憶回答感覺有風險時」——讓 AI 在**沒被叫到時也會主動用**。觸發詞同時給英文與中文（"check my memory"、"memory audit"、"体检记忆"）。你寫自己的 skill 時要加**繁體**觸發詞（「巡讀」「健檢」「檢查新舊版本」）。
- 本文結構：When to run → Procedure（Step 1-5）→ Notes（工具限制與擴充點）。並明說「腳本只讀，所有修改由 agent 在驗證後逐檔進行」。

### 支援哪些工具與安裝方式
- README 明寫：**OpenClaw、Claude Code**（「Using as an OpenClaw / Claude Code skill」）。安裝＝複製或軟連結整個資料夾到 skills 目錄（README 未寫出具體路徑；Claude Code 個人 skills 一般放 `~/.claude/skills/<name>/`、專案層放 `.claude/skills/<name>/`，這是 Claude Code 的慣例，非本 repo 內容）。
- Codex／Cursor：repo 未提及（未確認）；腳本可由任何 agent 透過 shell 執行。
- 單純命令列：`python3 memory-checkup/scripts/memory_checkup.py --memory-dir /path/to/agent/workspace`。

### 可以直接借用到使用者「基礎架構」的檔案或段落
1. `SKILL.md` 全文（https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/SKILL.md）→ 改寫成 `skills/daily-patrol/SKILL.md`。
2. `SKILL.md#L38-L47`（驗證再改、作廢標註、孤兒不刪）→ 直接抄進你的 `AGENTS.md` 的「文件維護規則」段。
3. `README.md#L45-L51`（Design notes：只讀、新值優先但需核驗、範圍克制、上下文過濾）→ 當你巡讀工具的設計原則。
   https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/README.md#L45-L51
4. `scripts/memory_checkup.py` 整支（222 行、無依賴）→ 當 `tools/patrol.py` 的起點，依第 9 節的坑逐一修正。

---

## 關鍵字
memory-checkup、記憶健檢、記憶稽核、每日巡讀、巡檢、文件一致性、過期數字、新舊版本衝突、單一事實來源、斷掉的引用、孤兒檔、每日紀錄斷檔、只讀稽核、作廢標註、memory audit、consistency check、stale numbers、dangling references、orphan files、daily flush、drift detection、MEMORY.md、SKILL.md、Claude Code skill、OpenClaw、AGENTS.md、HEARTBEAT.md、Python 標準函式庫、MIT
