# majiabin2020/majiu-management — 一份「工作空間大掃除＋季度巡檢」的單一 Skill：用台帳狀態機與草稿三分法讓 AI 自己收拾專案資料夾
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：86665bb
> GitHub：https://github.com/majiabin2020/majiu-management｜⭐ 8｜授權：MIT｜主要語言：Shell｜最近更新：2026-09-12

（以下所有 permalink 的基底為 `https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/`。整個 repo 只有 6 個檔案，我全部打開讀過：`git ls-tree -r --name-only HEAD` 列出 6 行；`wc -l` 合計 379 行、約 20 KB。原文為簡體中文，本資料包轉述為繁體。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：「馬廄管理法」是寫給騰訊 WorkBuddy（一款 AI 工作助理）用的單一 Skill，把一個工作空間當成馬廄：一個空間只放一類任務（一馬一廄），每個任務一個資料夾，用根目錄的 `STALL_LOG.md` 台帳記錄每個任務「空欄／在廄／出欄」的生命週期，收尾時用「草稿三分法」決定哪些檔案留、哪些刪，並且每季做一次**只讀不動手**的巡檢、出報告等人拍板。

**它不是什麼**：它**沒有**多 AI 角色分工、**沒有**讓 GPT／Claude 共讀一份規則的設計、**沒有**程式碼層級的重複或版本衝突偵測。它是「檔案與記憶的整理紀律」，不是「多代理協作框架」。

**對這位使用者有用的地方**（倉儲 App＋廣告素材＋未來 AI 影片）：

1. **每日巡讀（巡讀）的骨架可以直接抄**：它的「工作流五：季度巡檢」已經寫好「只讀掃描 → 產出固定格式報告 → 存檔到固定位置 → 停下等人拍板」的完整規程與報告模板（見第 11 節）。把頻率從「每季」改成「每天」、把檢查項從「磁碟大戶」換成「各 AI 是否漏做、規則是否重複、新舊版本衝突」，就是你要的每日巡讀。
2. **「台帳」防漏**：`STALL_LOG.md` 是一個極簡的任務登記簿，規定「同時最多一個在廄（進行中）任務」「狀態變更必須即時寫入，不准先做事後補帳」。你讓 Claude 和 Codex 輪流改倉儲 App 時，可以要求兩邊都先讀、再寫同一份台帳，誰漏了一眼就看得到。
3. **「記憶蒸餾」防新舊規則打架**：它規定每 30 天把舊的每日日誌合併進 `MEMORY.md`、控制在 3000 字元內、「衝突的舊規則以新規則為準並刪除過時條目」。這正是你說「哪邊是新版本、哪邊是舊版本」的最低限度處理法，可以套到你的 `CLAUDE.md`／`AGENTS.md`。
4. **「草稿三分法」對 AI 影片／廣告素材特別實用**：文字草稿（腳本、中間 HTML）可以刪但要先留「重生成指引」；AI 生成的圖片影片、人工修過的稿、當天抓的價格資料必須保留壓縮；`node_modules` 直接刪。做電商產品影片時，素材資料夾不會越堆越亂。
5. **「非破壞性鐵律」可以直接當所有 AI 的共用安全條款**：備份先行 → 每批最多 10 個檔案 → 進回收桶不用 `rm` → 出錯就停。

## 2. 授權白話

- **授權**：MIT（`LICENSE` 檔，Copyright (c) 2026 majiabin2020）。https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/LICENSE
- **個人使用**：完全自由，可以複製、修改、翻成繁體、改成 Claude Code／Codex 版本。
- **公司商用**：可以，包括放進公司內部規則或賣的產品裡；唯一義務是在你散布的副本中保留原作者的版權聲明與 MIT 授權文字。不提供任何保證。
- **閉源／付費版**：沒有。整個方法就是這 4 份 Markdown＋1 支 Shell 腳本，沒有隱藏功能。不過它預設執行環境 WorkBuddy 本身是商業產品（本 repo 未說明其收費，**未確認**）。

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 前端／後端／資料庫 | 都沒有。全部是給 AI 讀的 Markdown 規則。 |
| 程式 | 只有 `scripts/workspace_scan.sh`（37 行 Bash），用 `du`、`find`、`sort`、`wc` 做只讀磁碟掃描。 |
| 執行環境 | 原生目標是 WorkBuddy（讀 `.workbuddy/memory/`、`.workbuddy/skills/`、WorkBuddy 的排程「自動化」）。回收桶指令寫死 macOS `osascript`。 |
| 部署方式 | 把整個資料夾複製到 `~/.workbuddy/skills/`（使用者層級）或工作空間的 `.workbuddy/skills/`（專案層級），重啟對話。README 另提「Release zip」，本次未檢查 Releases 頁面，**未確認**是否存在。 |
| 硬體／GPU | 不需要。 |
| API Key 與費用 | 本身不呼叫任何 API。費用只有你使用的 AI（WorkBuddy／Claude Code／Codex）訂閱或 token 費。巡檢一次大約只需讀幾個 Markdown 加一次腳本輸出，token 很少（**未實測**）。 |

## 4. 程式架構地圖

```
majiu-management/                       (repo 根目錄本身就是 skill 資料夾)
├── SKILL.md                             # 99 行。主檔：YAML frontmatter（name / description / agent_created）
│                                        #   + 核心概念表 + 五大工作流 + 草稿三分法 + 記憶蒸餾
├── README.md                            # 93 行。給人看的介紹：解決哪 6 個問題、五大工作流表、安裝方式
├── LICENSE                              # MIT
├── references/                          # 「需要時才讀」的參考文件（Skill 的漸進式揭露）
│   ├── stall-log-template.md            # 41 行。STALL_LOG.md 台帳模板、狀態定義與合法遷移、書寫規範
│   └── quarterly-inspection.md          # 88 行。季度巡檢規程（5 步）、報告模板、排程 RRULE、排程用 prompt 模板
└── scripts/
    └── workspace_scan.sh                # 37 行。只讀掃描：一級條目體積 TOP20、>10MB 檔案 TOP30、
                                         #   根目錄散檔數、node_modules/venv 位置
```

**套用後在使用者工作空間裡會長出的結構**（從 SKILL.md 與 references 推得，不是 repo 內的檔案）：

```
<工作空間>/
├── STALL_LOG.md                 # 馬廄台帳（單一事實來源：目前有哪個任務在進行）
├── _archive/                    # 歸檔區，完成的任務資料夾整包移進來（大檔先 zip）
├── 任務名_20260912/              # 一級資料夾＝一個任務（「欄位」）
│   ├── 输入/  产出/  草稿/        # 二級資料夾（「馬具」），複雜專案可擴成 资料/文档/产出/数据/草稿/沟通
└── .workbuddy/
    ├── memory/MEMORY.md         # 空間規則與經驗（≤3000 字元），每日日誌另存並定期蒸餾
    ├── backups/<日期>/           # 整理前的備份
    └── inspections/YYYY-MM-DD-巡检报告.md   # 巡檢報告存放處
```

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| Skill 觸發描述 | [SKILL.md#L1-L5](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L1-L5) | description 一段寫完：是什麼＋負責哪 5 件事＋列出使用者會講的原話（「启用马厩管理法」「收尾这个任务」「空间巡检」）＋隱含情境（新任務要建資料夾骨架、任務結束要歸檔）＋核心比喻。另有非標準欄位 `agent_created: true`。 |
| 核心概念表 | [SKILL.md#L13-L28](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L13-L28) | 用一張表定義所有術語（馬廄、欄位、馬具、台帳、狀態機、_archive），並規定「語義底線永不改變：原始素材進輸入、結果進產出、過程進草稿」。 |
| 工作流一：初始化 | [SKILL.md#L30-L41](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L30-L41) | 摸底 → 建台帳 → 建 `_archive/` → 規則**增量追加**進 `MEMORY.md`（不覆蓋）→ 詢問是否建排程（拒絕就不再追問）→ 複述確認。安全約束：初始化只新增，不移動、不改名、不刪除。 |
| 工作流二：開任務 | [SKILL.md#L43-L51](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L43-L51) | **先查台帳**，有「在廄」的舊任務就先問要不要收尾；命名 `任務名_年月日`；建二級資料夾；寫台帳。這就是「防漏」的入口檢查。 |
| 工作流三：收尾五步 | [SKILL.md#L53-L61](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L53-L61) | 固定順序：歸位 → 草稿三分法 → 提煉經驗寫進知識庫並更新記憶索引 → 寫「重生成指引」（輸入來源＋執行指令＋關鍵參數）→ 台帳改「出欄」並移入 `_archive/`。 |
| 草稿三分法 | [SKILL.md#L63-L69](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L63-L69) | 配方型（可刪但要先留配方）／資產型（必留、zip）／依賴型（可刪、確認 package.json 在）。設計理念「記憶存配方，磁碟存資產」。 |
| 工作流四：整理優化 | [SKILL.md#L71-L80](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L71-L80) | 先出方案 → 等同意 → 備份到 `.workbuddy/backups/` → 每批 ≤10 檔、每批核對、失敗即停 → 回收桶優先（macOS `osascript`）→ 更新台帳。 |
| 工作流五：巡檢 | [SKILL.md#L82-L89](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L82-L89)、[references/quarterly-inspection.md](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/quarterly-inspection.md) | 純只讀；報告列路徑、大小、閒置時長、建議；「只出報告，不動手」；排程觸發時 prompt 必須含安全底線。 |
| 記憶蒸餾 | [SKILL.md#L91-L93](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L91-L93) | 每 30 天把 >30 天的日誌依主題合併進 `MEMORY.md`、刪掉已蒸餾的舊日誌；`MEMORY.md` ≤3000 字元；衝突時新規則勝出、刪除過時條目。 |
| 台帳狀態機 | [references/stall-log-template.md#L5-L13](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/stall-log-template.md#L5-L13) | 空欄 → 在廄 → 出欄（終態不可改）；同一空間同時最多一個在廄。 |
| 只讀掃描腳本 | [scripts/workspace_scan.sh](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/scripts/workspace_scan.sh) | 4 段輸出（檔頭註解寫「三段」，實際是 4 段，見 L16、L20、L24、L31）：`du -sh` 排序、`find -size +10M`、根目錄散檔／子目錄數、依賴資料夾。SKILL.md 說「直接執行，無需讀入上下文」——省 token 的典型手法。 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 巡檢報告模板（先結論後明細＋「等待拍板」聲明） | [references/quarterly-inspection.md#L45-L74](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/quarterly-inspection.md#L45-L74) | 無 | 低 | 改成你的每日巡讀報告：把「磁碟大戶／冷檔」段落換成「未完成任務」「重複規則」「新舊版本衝突」「各 AI 漏做項目」。存到 `docs/patrol/YYYY-MM-DD.md`。 |
| 排程用自足型 prompt 模板 | [references/quarterly-inspection.md#L76-L88](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/quarterly-inspection.md#L76-L88) | 任一能排程的 AI 工具 | 低 | 重點是「prompt 必須自包含，未來對話看不到現在的內容」＋「禁止動檔、出報告就停」。可以塞進 cron 跑 `claude -p "..."` 或 `codex exec "..."`（這兩個指令是我的建議，不在本 repo 內）。 |
| STALL_LOG 台帳模板＋狀態機 | [references/stall-log-template.md](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/stall-log-template.md) | 無 | 低 | 改名為 `TASKS.md` 或 `STALL_LOG.md` 放專案根目錄，在 `AGENTS.md` 寫「Claude 與 Codex 開工前必讀、狀態變更必即時寫」。可加一欄「負責 AI」。 |
| 非破壞性鐵律 | [SKILL.md#L71-L80](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L71-L80)、[README.md#L46-L48](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/README.md#L46-L48) | 無 | 低 | 原文抄進共用 `AGENTS.md` 的「安全」段。Linux／Windows 需把 `osascript` 換成對應的回收桶做法，或改成「移到 `_trash/日期/`」。 |
| 記憶蒸餾規則 | [SKILL.md#L91-L93](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L91-L93) | 無 | 低 | 套到 `CLAUDE.md`／`AGENTS.md`：設字數上限、「新規則勝出、刪除過時條目」。建議把「刪除舊日誌」改成「移到 `_archive/`」以符合非破壞原則。 |
| 草稿三分法 | [SKILL.md#L63-L69](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L63-L69) | 無 | 低 | 用在 AI 影片／廣告素材資料夾的收尾規則。 |
| 只讀掃描腳本 | [scripts/workspace_scan.sh](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/scripts/workspace_scan.sh) | bash、du、find | 低（但需先修 bug，見第 9 節） | 放到你的 skill 的 `scripts/` 裡，巡讀時由 AI 執行、只讀輸出。可再加一段 `grep` 找重複標題、`git log` 看檔案最後修改日。 |
| SKILL.md 的 description 寫法 | [SKILL.md#L1-L5](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L1-L5) | 無 | 低 | 當作範本：功能＋使用者原話＋隱含情境。 |

## 7. AI／Claude 整合

- **用哪些模型**：repo 沒有指定任何模型，也沒有呼叫 API。它是給「WorkBuddy 裡的 AI」讀的規則。
- **prompt 放在哪**：`SKILL.md`（主規則）、`references/quarterly-inspection.md` 最後的排程 prompt 模板（L76-L88）。
- **MCP／Skills**：沒有 MCP。它本身就是一個 Skill，格式與 Anthropic 的 Agent Skills 相同（資料夾＋`SKILL.md`＋YAML frontmatter 的 `name`／`description`＋`references/`＋`scripts/`）。多了一個 `agent_created: true` 欄位，Claude Code 應該會忽略（**未實測**）。
- **能不能換成 Claude**：**可接**，改動很小：
  1. 把資料夾複製到 `~/.claude/skills/majiu-management/`（全域）或專案的 `.claude/skills/majiu-management/`。
  2. 把文中所有 `.workbuddy/memory/MEMORY.md` 換成 `CLAUDE.md`（或共用的 `AGENTS.md`），`.workbuddy/backups/`、`.workbuddy/inspections/` 換成你自訂的資料夾。
  3. WorkBuddy 的「自動化（RRULE 排程）」在 Claude Code 沒有一模一樣的對應；可用作業系統 cron／Windows 工作排程器呼叫 `claude -p`，或 GitHub Actions 排程。
  4. 把 macOS `osascript` 回收桶指令換掉。
- **Codex（GPT）**：本 repo 完全沒提到 Codex。若你的 Codex 版本支援 SKILL.md 格式的 skills，可放同一份；否則把規則精華寫進 `AGENTS.md` 讓 Codex 讀（**未確認** Codex 版本細節，請以你手上版本為準）。

## 8. 擴充方式與 API

- 沒有 API、沒有外掛機制。擴充方式就是改 Markdown：
  - 新增工作流：在 `SKILL.md` 加一節「工作流六」，並在 description 裡加觸發用語。
  - 新增巡檢項目：在 `references/quarterly-inspection.md` 的「巡檢步驟」加第 6 步，並在報告模板加對應段落。
  - 自訂二級資料夾：SKILL.md L25-L28 已允許依任務類型擴充，只要守住「輸入／產出／草稿」語義。
- 擴充建議（針對你）：加一個「工作流：每日巡讀」，步驟為 讀台帳 → 讀所有規則檔 → 比對重複／矛盾 → 比對文件與程式碼的最後修改日 → 出報告。

## 9. 程式品質與風險

- **維護狀況**：建立日與最後推送日都是 2026-09-12，⭐ 8；淺層 clone 只看得到 1 個 commit（作者 majiabin2020，2026-09-12 13:11 +0800），完整歷史筆數**未確認**。看起來是一次性發布的個人作品，不是持續維護的框架。
- **測試**：無。
- **資安／隱私／遙測**：無網路呼叫、無遙測。腳本只讀。風險主要在「讓 AI 搬檔、刪檔」的流程，但規則已要求備份先行、批次 ≤10、回收桶優先、出錯即停、人拍板。
- **已知的坑**（我讀程式碼發現）：
  1. **腳本可能提早中斷**：[scripts/workspace_scan.sh#L7](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/scripts/workspace_scan.sh#L7) 用 `set -euo pipefail`，而 [L17](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/scripts/workspace_scan.sh#L17) 的 `du -sh "$TARGET"/* "$TARGET"/.workbuddy` 在 `.workbuddy` 不存在時 `du` 會回傳非 0，pipefail 讓整條管線失敗、`set -e` 讓腳本在第 1 段後就結束（`2>/dev/null` 只吞掉訊息不改變結束碼）。在沒有 `.workbuddy` 的 Claude Code 專案裡很可能直接中斷。修法：拿掉 `pipefail` 或在該行後加 `|| true`。（依 Bash 語意推論，**未實際執行**驗證。）
  2. 檔頭註解說「输出三段」，實際有 4 段。
  3. **只支援 macOS 回收桶**（`osascript`），Windows／Linux 要自己改。
  4. **記憶蒸餾會刪除舊日誌**（SKILL.md L93），跟它自己的「非破壞性鐵律」有點矛盾，建議改為移入封存。
  5. 「衝突的舊規則以新規則為準」靠 AI 判斷，沒有版本號或日期標記，AI 可能誤判哪條比較新。
  6. 原文為簡體中文，資料夾名稱 `输入/产出/草稿` 是簡體；SKILL.md L71 有錯字「整厃」（應為「整厩」）。
  7. 「同時最多一個在廄任務」對單人單 AI 合理，但你同時讓 Claude 和 Codex 各做不同事時會太嚴，需要改成「每個 AI／每條工作線各一個」。

## 10. 跟其他專案組合的建議

- **馬廄管理法（本專案）＝「整理與巡檢紀律」**，可搭配：
  - **規則與角色層**：用 `github/spec-kit` 的 constitution 或 `bmad-code-org/BMAD-METHOD` 的角色分工、`Fission-AI/OpenSpec` 的變更提案／封存流程來補「多 AI 角色」與「新舊版本」的缺口（同資料夾已有這些資料包）。
  - **Skill 寫法層**：參考 `anthropics/skills` 的官方 SKILL.md 規格，把本專案改寫成符合規格的 Claude Code skill。
  - **流程紀律層**：`obra/superpowers` 的「完成前驗證」可以補本專案缺少的「做完要自我檢查」。
- **建議組合給你的基礎架構**：
  1. 根目錄 `AGENTS.md`（Codex 與 Claude 共用的單一規則來源）＋ `CLAUDE.md` 只寫一行「請先讀 AGENTS.md」，避免兩份規則各自長大。
  2. 根目錄 `STALL_LOG.md`（借自本專案）記錄每個任務、負責的 AI、狀態、產出位置。
  3. `.claude/skills/daily-patrol/`：以本專案的巡檢規程＋報告模板為底，改成每日、加上「重複／衝突／漏做」檢查。
  4. 規則檔設字數上限與「新規則勝出、過時條目移到封存」（借自本專案的記憶蒸餾）。
  5. 所有動檔動作遵守非破壞性鐵律。

## 11. 規則／角色／巡檢 檢查表

**共用規則怎麼寫**
- 檔案結構：**有（但只限 WorkBuddy）**。規則寫進 `.workbuddy/memory/MEMORY.md`，台帳在根目錄 `STALL_LOG.md`。[SKILL.md#L34-L37](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L34-L37)。沒有 AGENTS.md／CLAUDE.md／.ruler／constitution。
- 分層：**有（兩層）**。Skill 可裝在使用者層級 `~/.workbuddy/skills/` 或專案層級 `.workbuddy/skills/`。[README.md#L50-L54](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/README.md#L50-L54)。子資料夾層級規則：沒有。
- 優先順序：**部分有**。巡檢文件明寫「安全鐵律（優先級最高）」；記憶衝突時「新規則為準」。[references/quarterly-inspection.md#L8-L13](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/quarterly-inspection.md#L8-L13)。全域 vs 專案規則誰優先：沒有。
- 讓 GPT（Codex）和 Claude 讀同一份規則：**沒有**。

**角色設計**
- **沒有**多角色。只有一個 AI 執行五個工作流，人負責「拍板」。可視為兩個角色：AI＝執行與出方案、人＝決策。[README.md#L85-L89](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/README.md#L85-L89)「拍板权永远在人」。交接（handoff）：沒有 AI 之間的交接；只有任務之間靠台帳交接。

**防漏**
- 任務追蹤：**有**。`STALL_LOG.md` 台帳＋狀態機，開新任務前強制查有沒有未收尾任務。[references/stall-log-template.md#L5-L13](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/stall-log-template.md#L5-L13)、[SKILL.md#L47](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L47)。
- 完成前驗證：**部分有**。收尾五步「必須走完、順序固定」；整理時每批核對、失敗即停。但沒有「功能是否真的做對」的測試或驗證步驟。[SKILL.md#L53-L61](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L53-L61)。
- 交接紀錄：**有**。出欄索引要求「產物路徑、經驗條目位置一眼找到，找不到等於沒歸檔」；「不允許先幹活後補帳」。[references/stall-log-template.md#L30-L41](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/stall-log-template.md#L28-L41)。

**防重複**
- **部分有（只在記憶層）**。README 把「重複勞動」列為要解決的問題（[README.md#L14](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/README.md#L14)）；手段是靠歸檔與索引讓人找得到舊產物，以及記憶蒸餾「按主題合併」日誌（[SKILL.md#L93](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L93)）。沒有自動偵測重複檔案、重複規則或重複角色的程式。

**防新舊版本衝突**
- 版本標記：**沒有**（只有資料夾名帶日期 `任務名_年月日`）。
- 單一事實來源：**有（任務狀態）**。`STALL_LOG.md` 是任務狀態的唯一來源；規則的唯一來源是 `MEMORY.md`。
- 變更提案／封存：**部分有**。完成的任務整包移入 `_archive/`；出欄是終態不可再變更。沒有規則變更提案流程。
- 過期（staleness）偵測：**有（簡易版）**。巡檢檢查「在廄超過 30 天無動靜」「`_archive/` 超過 90 天未被引用的冷檔」「`MEMORY.md` 超過 3000 字元或有互相矛盾的條目」「超過 30 天待蒸餾的日誌」。[references/quarterly-inspection.md#L26-L39](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/quarterly-inspection.md#L26-L39)。

**定期巡檢**
- **有**。季度排程，RRULE `FREQ=YEARLY;BYMONTH=1,4,7,10;BYMONTHDAY=1;BYHOUR=9;BYMINUTE=0`，建立前必須取得使用者同意。[references/quarterly-inspection.md#L76-L88](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/references/quarterly-inspection.md#L76-L88)。沒有 hook、沒有 heartbeat；排程依賴 WorkBuddy 的自動化功能。
- 報告格式（原模板轉繁體、縮短）：

```markdown
# 空間巡檢報告 YYYY-MM-DD
## 結論（一句話）
## 一、磁碟大戶 TOP5        | 條目 | 體積 | 性質判斷 | 建議 |
## 二、_archive 冷檔候選（>90 天未引用） | 檔案 | 大小 | 最後修改 | 建議 |
## 三、台帳異常（在廄超 30 天／根目錄野檔案）
## 四、記憶健康（待蒸餾日誌／MEMORY.md 字元數與衝突條目）
## 處置方案（供拍板）方案 A／方案 B
> 本報告為只讀巡檢結果，未對任何檔案做改動。請拍板後執行。
```

- 改成你的「每日巡讀」版本的建議段落：`## 一、未收尾任務（台帳在廄＞1 天）`、`## 二、AI 漏做（台帳寫完成但產出位置不存在）`、`## 三、重複規則（AGENTS.md／CLAUDE.md／skills 中意思相同的段落）`、`## 四、新舊衝突（同主題兩份文件，列出各自最後修改日與建議保留哪份）`、`## 處置方案（等拍板）`。

**Skill 寫法**
- SKILL.md 格式：**有**。YAML frontmatter（`name`、`description`、`agent_created`）＋主文；細節放 `references/`，可執行工具放 `scripts/`，並註明「腳本直接執行，無需讀入上下文」。[SKILL.md#L1-L5](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L1-L5)、[SKILL.md#L95-L99](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/SKILL.md#L95-L99)。
- description 寫法：一句話說明＋列出 5 項職責＋**使用者實際會講的原話**（用引號列出）＋**隱含情境**（「或新任務需要建資料夾骨架、任務結束後需要歸檔檔案時」）＋核心比喻。這種寫法讓 AI 在使用者沒講關鍵字時也能觸發，值得模仿。
- 資料夾結構：根目錄 `SKILL.md`、`references/*.md`、`scripts/*.sh`。

**支援哪些工具與安裝方式**
- 原生：WorkBuddy。安裝＝複製資料夾到 `~/.workbuddy/skills/` 或 `.workbuddy/skills/`，重啟對話。[README.md#L50-L54](https://github.com/majiabin2020/majiu-management/blob/86665bb362462a575d469e06472a13d091c1b09b/README.md#L50-L54)。
- Claude Code：repo 未提及；格式相容，改路徑後放 `.claude/skills/` 即可（見第 7 節，**未實測**）。
- Codex／Cursor：repo 未提及，**未確認**。

**可以直接借用到使用者「基礎架構」的檔案或段落**
1. `references/quarterly-inspection.md` L8-L13（安全鐵律）、L45-L74（報告模板）、L76-L88（自足型排程 prompt）→ 每日巡讀 skill 的骨架。
2. `references/stall-log-template.md` 全文 → 專案根目錄的任務台帳（加「負責 AI」欄）。
3. `SKILL.md` L63-L69（草稿三分法）→ AI 影片／廣告素材資料夾規則。
4. `SKILL.md` L71-L80（非破壞性整理流程）→ 共用 `AGENTS.md` 的安全條款。
5. `SKILL.md` L91-L93（記憶蒸餾）→ `CLAUDE.md`／`AGENTS.md` 的字數上限與「新規則勝出」規則（刪除改成封存）。
6. `SKILL.md` L1-L5 → 自己寫 skill 時的 description 範本。
7. `scripts/workspace_scan.sh` → 修掉 pipefail 問題後當巡讀的只讀掃描工具。

## 關鍵字
馬廄管理法、马厩管理法、majiu-management、WorkBuddy、工作空間治理、workspace governance、Skill、SKILL.md、STALL_LOG、台帳、任務台帳、狀態機、state machine、草稿三分法、重生成指引、記憶蒸餾、memory distillation、MEMORY.md、季度巡檢、每日巡讀、巡檢報告、inspection report、非破壞性、備份先行、回收桶、_archive、封存、過期偵測、staleness、只讀掃描、workspace_scan.sh、Claude Code skills、AGENTS.md、CLAUDE.md、MIT
