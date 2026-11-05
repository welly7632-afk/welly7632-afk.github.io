# backtrue/thinkwithblack-skill — 小黑老師整理的 365 個繁中行銷 Skills 方法包（可直接當 Claude Skills 用）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：7095cbc
> GitHub：https://github.com/backtrue/thinkwithblack-skill｜⭐ 255｜授權：MIT（部分附加工具另含上游 MIT 著作權聲明）｜主要語言：Python｜最近更新：2026-11-01

（以下 permalink 前綴簡寫為 `B` = `https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8`，實際連結都已寫成完整網址。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 這不是一個「程式」，而是一套用 Markdown 寫成、給 AI 讀的「行銷 SOP 方法庫」。台灣行銷講師邱煜庭（小黑老師）把課程講義拆成 365 份方法（加 5 份附加實作工具），每份都規定「需要什麼資料 → 怎麼一步步做 → 交付哪些固定欄位 → 怎麼核對」，讓 ChatGPT／Claude／Gemini 照著做，而不是自由發揮。

**對你（台灣小電商老闆、自己下廣告、想做商品影片與短劇）可以拿來做：**

1. **廣告文案**：MK-137「三行式廣告文案」有非常嚴格的字數規格（第一行 14–15 個中文字、CTA 7–8 字），可以直接拿來產 FB／IG 廣告三行文案的 A/B 版本。
2. **商品影片腳本**：MK-279～MK-292 共 14 份是「影片」專區（開場鉤子診斷、Shorts／In-stream／Bumper 版本重組、影片序列設計、YouTube 媒體計畫），MK-284 會交出「逐鏡表：時間、畫面、台詞／字幕、證據、CTA」，就是商品短影片腳本的格式。
3. **素材企劃**：MK-141 功能示範素材、MK-145 直式素材改編、MK-147 廣告素材需求單，可以當拍片前的企劃單。
4. **成本／毛利／價格試算**（和你關心的「價格與成本計算」直接相關）：MK-058～MK-075 一整組（單品貢獻毛利、損平營業額、獲客成本上限、損平 ROAS、折扣後利潤、降價所需增量……），每份都寫清楚公式與變數，可以轉成你倉庫系統裡的試算表欄位與公式。
5. **會員／回購分析**：INF-05-07 回購週期計算、MK-372～MK-387（RFM、只買一次會員、首次回購天數），可以直接拿你倉庫／訂單資料來算。
6. **最重要的是「寫法」**：它示範了一種可複製的 Skill 結構（必要資料 + 方法步驟 + 固定交付欄位 + 核對案例 + 機器可讀的 context-contract.json），你日後自己用 Claude Code 寫「短劇腳本 Skill」或「商品影片 Skill」時可以照抄這個骨架。

**不能做的：** 它本身不會生成影片、不會產圖、不會連你的廣告帳戶；自動化與帳戶串接被作者歸到付費的 thinkwithblack-mcp（見第 2 節）。短劇（劇情型）專用的方法沒有找到，影片相關方法都偏「廣告影片」。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **主授權：MIT**，著作權人 `Copyright (c) 2026 backtrue`（[LICENSE](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/LICENSE)）。每份 `packs/*.md` 結尾都附上同一份 MIT 全文（例如 [packs/mk-280.md#L938-L960](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/packs/mk-280.md#L938-L960)）。
- **個人使用：** 完全可以，下載、修改、丟給 Claude 用都沒問題。
- **公司商用：** 也可以（包含改寫成自家內部 SOP、包進自家工具或販售的產品），唯一義務是**保留著作權聲明與 MIT 授權文字**。不提供任何保證。
- **附加工具另有上游聲明：** `supplements/speak-human-tw/LICENSE` 寫明是改編自 Raymond Hou（雷蒙三十）、nagameTW、Siqi Chen、Wei Jen Lu 等人的 MIT 專案（[supplements/speak-human-tw/LICENSE](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/supplements/speak-human-tw/LICENSE)）；`supplements/speak-human-en/THIRD_PARTY_NOTICES.md` 列出 blader/humanizer 等上游；`extensions/forecast-event-profit/THIRD_PARTY_NOTICES.md` 列出 Alireza Rezvani 的 MIT 聲明。若你要拿這幾份去商用，記得一起保留這些聲明。
- **內容來源提醒：** 每份 SKILL.md 文末的「方法來源」指向作者自己的 Google Docs／簡報課程講義（例如 MK-280 指向「AI × Google Ads Demand Gen・YouTube・PMax 實戰課」）。這些講義本身不在 repo 內，也不在 MIT 範圍內（未確認其授權）。
- **付費版：** [PUBLIC_BOUNDARY.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/PUBLIC_BOUNDARY.md) 說明：免費版＝手動上傳方法包、分析你給的檔案、完成單項工作；**thinkwithblack-mcp（付費）**＝連接廣告帳戶、取得資料、實際修改帳戶／網站、排程監測、跨方法整體診斷。付費 MCP 的程式碼不在這個 repo（未確認是否公開）。
- README 提到 `npx ai-marketing-skills` npm 安裝器（2026-10-21 更新），但**該 npm 套件程式碼不在本 repo**，我沒有檢查，屬未確認。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

（收藏型 repo，簡述）

- **內容：** Markdown（SKILL.md 為 Claude Skills 格式：YAML frontmatter `name` + `description`）＋ JSON（catalog、context-contract）。
- **Python 只是工具鏈：** `scripts/build-free-edition.py`（241 行）把 SKILL.md + 共用規則 + 附錄合併成單檔 `packs/*.md` 並驗證 SHA-256；`scripts/build-english-edition.py`（266 行）產英文版；`tests/` 兩支 unittest；GitHub Actions 只做驗證與打包（[workflow](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/.github/workflows/prepare-thinkwithblack-release.yml)）。
- **每個 skill 附一支 `check-context.py`**（144 行，純標準函式庫，檢查你提供的資料快照是否滿足 context-contract）。我用 md5 比對：361 份 `skills/*/assets/check-context.py` **完全相同**（同一個雜湊）。
- **前端／後端／資料庫／GPU：** 無。
- **API Key／費用：** 本身不需要。費用只有你使用的 AI 對話服務（ChatGPT／Claude／Gemini 訂閱或 API 用量）。一份 pack 約 900–1,000 行（例如 `packs/mk-280.md` 960 行，其中約 800 行是附錄的 JSON 契約與 Python），每次上傳會吃掉不少 token。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

檔案總數：`git ls-tree -r --name-only HEAD` 共 3,076 個檔案。

```
thinkwithblack-skill/
├── README.md              繁中首頁：十大科別、三步使用法、餅乾毛利範例
├── INDEX.md               給 AI 讀的「方法索引」（365 列表格 + 附加實作工具 5 項）
├── START_HERE.md          操作教學
├── PUBLIC_SKILL_RULES.md  所有方法共用的規則（會被合併進每份 pack 開頭）
├── PUBLIC_BOUNDARY.md     免費版 vs 付費 thinkwithblack-mcp 的分工
├── catalog.json           365 筆方法的 id／名稱／描述／來源路徑／SHA-256
├── free-content.json      公開清單（同樣 365 筆，無雜湊）
├── skills/                361 個資料夾：mk-001…mk-450（360 個，有跳號）＋ inf-05-07
│   └── mk-XXX/SKILL.md + assets/context-contract.json + assets/check-context.py
├── extensions/            4 個進階方法（pmax-copy、forecast-event-profit、simplify-member-rules、write-marketing-rollout-plan），有 references/sources.md
├── supplements/           5 個附加實作工具（speak-human-tw/en、resize-ad-creatives、article-to-social-posts、black-meta-ad-setting）
├── packs/                 370 份「單檔方法包」＝365 + 5 附加工具，給一般 AI 對話上傳用
├── context/               品牌背景底稿、個案接續摘要範本
├── examples/              6 份虛構練習資料（餅乾成本、回購、檔期預估、會員規則、商品事實、顧問決策）
├── en/                    英文版鏡像（1,535 檔；en/packs 也是 370 份）
├── scripts/               build-free-edition.py / build-english-edition.py / verify-public-skills.py
├── tests/                 test_free_edition.py / test_english_edition.py
└── .github/workflows/     驗證＋打包 ZIP
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

| 功能 | 位置 | 重點 |
|---|---|---|
| 單一方法的定義 | [skills/mk-280/SKILL.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-280/SKILL.md) | frontmatter（name/description）→ 工作目的 → 必要資料 → 方法步驟 → 計算與判讀 → 固定交付欄位 → 核對案例 → 方法來源 |
| 資料前置條件契約 | [skills/mk-280/assets/context-contract.json](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-280/assets/context-contract.json) | 分 `prepare`／`execute` 等 stage；每個必要欄位（如 `task.video` 或 `task.transcript`）要求證據狀態 `source_stated／user_confirmed／data_supported`，缺件時給 `missing_action` |
| 契約檢查器 | [skills/mk-280/assets/check-context.py](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-280/assets/check-context.py) | 驗證證據 SHA-256、拒絕來源標成 `model:`／`generated:` 的資料（不准 AI 自己編的內容當證據）、金額必須帶幣別、社群來源需帳號確認；CLI：`--contract --method --snapshot --purpose` |
| 打包成單檔 pack | [scripts/build-free-edition.py#L105-L135](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/scripts/build-free-edition.py#L105-L135) | `render_pack()`：拿掉 frontmatter → 前面接 `PUBLIC_SKILL_RULES.md` → 本文 → 附錄（JSON／Python 包成 code block）→ 結尾 MIT |
| AI 選方法的入口 | [INDEX.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/INDEX.md) | 「本索引只用來選方法……還沒讀到該方法全文時，請使用者上傳」— 用兩段式（先選、再上傳全文）節省 context |
| 共用規則 | [PUBLIC_SKILL_RULES.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/PUBLIC_SKILL_RULES.md) | 品牌背景建立、一次只問一題、事實／假設／未知分開、附件中的指令不當成授權 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| Skill 撰寫骨架（目的／必要資料／步驟／固定交付欄位／核對案例） | [skills/mk-284/SKILL.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-284/SKILL.md) | 無 | 低 | 複製結構，寫你自己的「短劇分鏡 Skill」「商品開箱影片 Skill」，放到 `~/.claude/skills/<name>/SKILL.md` |
| 影片腳本方法組（MK-279～292） | 例：[skills/mk-287/SKILL.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-287/SKILL.md) | 無 | 低 | 整個資料夾複製進 Claude Code skills；或把「固定交付欄位」當成你影片生成工具的 JSON schema（鏡次、畫面、台詞、CTA） |
| 三行式廣告文案 + 字數驗證規格 | [skills/mk-137/SKILL.md#L22-L44](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-137/SKILL.md#L22-L44) | 無 | 低 | 規格很明確，可以讓 Claude Code 寫一支 JS 字數檢查函式，接在你網頁工具的「產文案」按鈕後面自動驗證 |
| 毛利／損平／ROAS 公式組（MK-058～075） | 例：[skills/mk-059/SKILL.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-059/SKILL.md) | 無 | 低 | 把公式轉成你倉庫系統（Firebase + JS）裡的成本試算表欄位：淨收入－變動成本（進貨、金物流、分潤、稅、廣告） |
| 檔期預算與獲利預估 | [extensions/forecast-event-profit/SKILL.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/extensions/forecast-event-profit/SKILL.md) | 歷史廣告報表 | 中 | 雙 11／黑五前，用歷史 CPM、轉換率、客單做預算情境表 |
| 版位安全區座標公式 | [supplements/resize-ad-creatives/SKILL.md#L18-L32](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/supplements/resize-ad-creatives/SKILL.md#L18-L32) | 無 | 低 | 安全矩形 x=[L×W,(1−R)×W]、y=[T×H,(1−B)×H]，可寫進影片／圖片生成工具自動放字幕與價格 |
| 去 AI 味繁中校稿 | [supplements/speak-human-tw/SKILL.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/supplements/speak-human-tw/SKILL.md) | references/ 底下 7 份參考 | 低 | 任何 AI 產出的腳本、旁白最後過一次 |
| 契約檢查器 | [skills/mk-280/assets/check-context.py](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-280/assets/check-context.py) | Python 標準函式庫 | 高 | 概念值得學（AI 輸出前先驗證輸入資料來源），但實作壓縮成很長的單行，直接搬不划算 |
| 品牌背景底稿 | [context/MARKETING_CONTEXT.template.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/context/MARKETING_CONTEXT.template.md) | 無 | 低 | 改成你的 CLAUDE.md 或 Firebase 一張「品牌事實」表，所有文案／腳本工具共用 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **模型：** 沒有綁定任何模型、沒有 API 呼叫（我 grep 所有 `.py`，沒有 `requests`／`urllib.request`／`subprocess`／`socket`）。
- **Prompt 位置：** 每份 `skills/*/SKILL.md` 本身就是 prompt；`PUBLIC_SKILL_RULES.md` 是系統層級共用規則；`INDEX.md` 是「路由 prompt」。
- **Claude Skills：** `SKILL.md` 用 Claude Agent Skills 標準格式（`---\nname: mk-280\ndescription: ...\n---`），可**原生**丟進 Claude Code 的 `.claude/skills/`，或在 claude.ai 上傳 `packs/*.md`。
- **MCP：** 本 repo 沒有。付費的 thinkwithblack-mcp 負責帳戶串接（程式碼未確認）。
- **使用方式（README 原文步驟）：** 上傳 `INDEX.md` → 貼起手指示＋你的問題 → AI 告訴你要上傳哪份 `packs/*.md` → 上傳方法包＋你的資料。

## 8. 擴充方式與 API

- 沒有程式 API。依 [CONTRIBUTING.md](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/CONTRIBUTING.md)：維護者先更新方法來源（`skills/<id>/SKILL.md` + `assets/`）與 `free-content.json`，再執行 RELEASE.md 的生成與檢查命令；方法包、索引與 `catalog.json` 都由工具產生（我未執行任何腳本）。
- 個人使用最實際的做法：不要動它的打包流程，直接挑你要的 SKILL.md 複製到自己的 Claude Code 專案 `.claude/skills/`，再依你的商品改寫。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護：** 2026-10-09 建立、2026-11-01 最後推送，catalog 版本 `2026.11.02-free.2`，一個月內多次改版，很活躍；但專案非常新，結構仍可能大改。
- **測試：** 有 CI 驗證（SHA-256 一致性、pack 產生結果與 repo 內一致）與 2 支 unittest；這些只驗「打包正確」，不驗方法內容是否正確。
- **遙測／隱私：** 沒有網路呼叫、沒有遙測。你上傳的訂單資料去哪裡，取決於你用的 AI 服務。
- **已知的坑：**
  1. 一份 pack 約 900+ 行，其中大部分是 JSON 契約與 Python，丟進對話很吃 token；在 Claude Code 裡直接用 `skills/` 版本（只有 SKILL.md，約 70 行）比較省。
  2. 很多 skill 的 SKILL.md 很短（MK-280 只有 73 行、3 個步驟），作者寫明「執行步驟由 ThinkWithBlack 依本方法的工作目的整理」「大綱延伸」——也就是說有些方法是從課程大綱延伸，內容深度不一；MK-137 這種有完整規格的是少數精華。
  3. 編號跳號（MK-045、MK-168～171、MK-188～203 等不存在），不要以為缺檔。
  4. 方法文字中嵌入不少「請上傳 packs/xxx.md」「付費 MCP 處理」等導流語句；自用時可刪掉。
  5. 平台規格（Meta 安全區、Google 影片格式）作者刻意不寫死，要求製作當下查官方，這是優點但代表你仍需自己查。
  6. 沒有劇情型短劇（角色、衝突、反轉）方法。

## 10. 跟其他專案組合的建議

- **＋ AI 影片生成專案（同分類其他 repo）：** 用本 repo 的 MK-284／285／286 產「逐鏡表」→ 把每一鏡的「畫面／台詞／字幕」欄位送進影片生成工具當 prompt；MK-280 再回頭診斷開場鉤子。
- **＋ 網頁版 Excel／試算表元件：** 把 MK-058～075 的公式做成你倉庫系統內「商品成本試算表」的預設欄位與公式（淨收入、變動成本、貢獻毛利、損平 ROAS、獲客成本上限），再用 INF-05-07／MK-374～383 的定義做會員回購報表。
- **＋ 你自己的 Firebase 倉庫系統：** 庫存與售價資料 → MK-254 商品價格一致性檢查、MK-255 商品庫存狀態檢查的檢查邏輯，可以直接改成自動化檢查規則。
- **＋ Claude Code：** 把精選 skills 放進專案 `.claude/skills/`，配合 `context/MARKETING_CONTEXT.template.md` 做成一份品牌事實檔，讓每次寫文案、腳本都引用同一份事實。

## 11. 收錄內容整理

### 11.1 數量（自己數，方法如下）

- `catalog.json` 的 `entries` 用 `python3 -I` 讀取計數＝**365**（`entryCount` 也寫 365）；其中 MK 開頭 360、INF-05-07 1、extensions 4。
- `skills/` 資料夾數＝361（360 個 mk + inf-05-07）；`extensions/` 4 個；`supplements/` 5 個。
- `packs/` 檔案數＝**370**＝365 方法 + 5 份附加實作工具。`en/packs/` 也是 370。
- 檔案中含 `SKILL.md` 的路徑共 740（中英文各一套，含 en/）。
- README 十大科別數字：44＋46＋29＋40＋25＋51＋58＋47＋10＋15＝365（README 自述，與 catalog 相符）。

### 11.2 全部分類與代表項目（依 README 十大科別＋編號區段）

| 科別（份數） | 編號範圍（我依 catalog 整理） | 代表項目 |
|---|---|---|
| 商品定位與顧客研究（44） | MK-001～044 | 商品事實整理、獨特賣點萃取、Persona 候選建立、5W1H 情境展開、顧客口語搜尋句生成 |
| 商品策略、定價與獲利（46） | MK-046～091 | 價格敏感度問卷、單品貢獻毛利計算、損平營業額、損平廣告報酬率、折扣後利潤、引流款／毛利款選品 |
| 年度計畫與促銷活動（29） | MK-092～119 | 年度檔期排程、檔期前置工作倒排、滿額贈門檻、加價購、限時方案真實性檢查、活動成效檢討 |
| 商品頁、廣告文案與素材（40） | MK-120～159 | 銷售頁一句話定位、FABE 廣告文案生成、三行式廣告文案、功能示範素材企劃、直式素材改編、評論拼圖素材 |
| Meta 廣告與再行銷（25） | MK-160～211 | Meta 廣告層級規劃、受眾假說、素材測試分組、加購未購買阻力診斷、Hero Post 評估 |
| Google 廣告與影音行銷（51） | MK-232～292 | 搜尋字詞煉金、Shopping SKU 浪費診斷、Demand Gen 素材測試矩陣、影片開場鉤子診斷、Shorts 版本重組、YouTube 媒體計畫 |
| SEO、AEO、GEO 與 AI 搜尋（58） | MK-308～365 | 搜尋答案矩陣、頁面 Title／H1 檢查、FAQ 模組、AI 搜尋測試題庫、AI 品牌提及判讀 |
| 會員回購、LINE 與 Email（47） | MK-372～416（＋INF-05-07） | RFM 分數計算、首次回購天數、沉睡會員喚醒稿、LINE 三段式歡迎訊息、電子報主旨草稿 |
| 社群內容經營（10） | MK-417～426 | 月份社群主題拆題、長文拆社群短文、熱賣素材再利用選題 |
| 數據追蹤與顧問決策（15） | MK-427～450 | UTM 命名規劃、網站漏斗事件規劃、GSC 搜尋機會篩選、顧問輸出驗收題 |
| extensions（4） | — | PMAX 文案產出與審核、檔期預算與獲利預估、會員規則簡化、書面行銷策略與 rollout |
| 附加實作工具（5，不計入 365） | supplements/ | 說人話繁中去 AI 味、廣告素材多尺寸改版、文章轉多平台貼文、自然英文潤稿、Black 專屬 Meta 投放八步流程 |

（科別與編號範圍的對應是我依名稱與 README 代表項目推斷，跨區邊界未逐一核對 README 的歸類，例如 INF-05-07 實際歸哪一科未確認。）

**影片相關完整清單（14 份，MK-279～292）：** 279 影片媒體任務定義、280 影片開場鉤子診斷、281 影片品牌出現時機檢查、282 影片訊息結構診斷、283 影片行動呼籲檢查、284 Shorts 版本重組、285 In-stream 版本重組、286 Bumper 版本重組、287 影片序列設計、288 YouTube 版位受眾分工、289 YouTube 頻次規劃、290 YouTube 媒體計畫、291 影片觀看品質診斷、292 影片與版位成效拆解。另有 Demand Gen 6 份（MK-272～277）。

### 11.3 對你最有用的前 10 項，以及怎麼用

1. **MK-284 Shorts 版本重組**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-284/SKILL.md)）— 「可從零寫腳本，不需已有成效」，交逐鏡表（時間／畫面／台詞字幕／證據／CTA／缺素材）。直式商品短影片、Reels 腳本首選。
2. **MK-280 影片開場鉤子診斷**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-280/SKILL.md)）— 丟有時間碼的逐字稿，給「替代開場」。短劇前 3 秒也能套用。
3. **MK-287 影片序列設計**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-287/SKILL.md)）— 問題→教育→證據→後續的多支影片規劃，要求「每支都能獨立理解」，可借來規劃系列短劇的每集任務。
4. **MK-137 三行式廣告文案**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-137/SKILL.md)）— 積極／友善／專業三組 A/B 文案，有逐字字數驗證。
5. **MK-141 功能示範素材企劃**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-141/SKILL.md)）— 拍攝鏡頭、示範動作、道具、字幕旁白、待拍清單，就是拍片企劃單。
6. **MK-145 直式素材改編**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-145/SKILL.md)）— 同一支素材改成 Reels／限動版，強調重構而不是裁切。
7. **MK-059 單品貢獻毛利計算**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-059/SKILL.md)）— 搭配 `examples/cookie-costs.md`，算每賣一件扣完廣告還剩多少，可直接變成你系統的成本欄位。
8. **forecast-event-profit 檔期預算與獲利預估**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/extensions/forecast-event-profit/SKILL.md)）— 用歷史 CPM、轉換率、客單估檔期預算與利潤，還有回測步驟。
9. **resize-ad-creatives 廣告素材多尺寸改版**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/supplements/resize-ad-creatives/SKILL.md)）— 安全區座標公式，影片字幕／價格標籤擺位可用。
10. **speak-human-tw 說人話：繁中去 AI 味**（[SKILL](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/supplements/speak-human-tw/SKILL.md)）— AI 寫完的腳本、旁白、貼文最後校稿；有台灣在地化參考 `references/taiwan-localization.md`。

**怎麼用（兩條路）：**
- **claude.ai 對話：** 上傳 `INDEX.md` + 對應 `packs/mk-284.md` + 你的商品資料，說「幫我寫這個商品 30 秒內的 Shorts 腳本」。
- **Claude Code（推薦）：** 把 `skills/mk-284/`、`skills/mk-137/` 等資料夾複製到你專案的 `.claude/skills/`，Claude 會依 `description` 自動挑用；再寫一份品牌事實檔（參考 `context/MARKETING_CONTEXT.template.md`）。

### 11.4 值得學的 prompt／skill 寫法（短摘錄）

1. **固定交付欄位表**（每份都有）——強迫 AI 輸出結構化，且每格都要「填入已提供來源、計算或明確未知」，杜絕亂編：
   ```
   | 順序 | 欄位 | 填寫方式 |
   | 2 | 鏡次及時間 | 填入已提供來源、計算或明確未知 |
   ```
2. **核對案例（像單元測試）**——例如 MK-284-A1「沒有現成影片 → 預期：交逐鏡腳本與製作需求」；MK-287-A2「沒有投放排序功能證據 → 交內容序列，不承諾依序曝光」。替你自己的 Skill 寫 2–3 個邊界案例，品質會穩很多。
3. **可驗證的硬規格**——MK-137：「第一行強制為 14 至 15 個繁體中文字……逐字檢查，未符合時重寫，通過後才交付」「以 Unicode 字元逐字計數，不使用位元組、顯示寬度或 UTF-16 單位」，並附反例「『想換風格，立即挑選你的耳環』有 12 個中文字且含逗號，拒絕交稿」。
4. **不編造的護欄**——影片類開頭一句：「沒有影像或音訊讀取證據時，只提供對應文本範圍的建議；不編造影片內容」。
5. **先確認再寫**——MK-137 先交 3 個 USP 草案、等使用者確認才寫稿，避免一次產一大堆錯方向的文案。
6. **兩段式路由**——INDEX.md 只放一行描述讓 AI 選方法，全文再另外載入，等同手動版的 Claude Skills「description 觸發 → 載入全文」。
7. **證據狀態標記**——`source_stated／brand_claim／user_confirmed／data_supported／hypothesis` 五種，事實與假設分開保存（見 `context/MARKETING_CONTEXT.template.md`）。

## 關鍵字
thinkwithblack、小黑老師、邱煜庭、行銷 Skills、Claude Skills、SKILL.md、Claude Code、方法包、繁體中文、廣告文案、三行式文案、FB 廣告、Meta 廣告、Google Ads、YouTube Shorts、影片腳本、分鏡、開場鉤子、短影音、Reels、素材企劃、單品毛利、貢獻毛利、損平 ROAS、檔期預算、RFM、回購週期、LINE 行銷、電子報、SEO、AEO、GEO、去 AI 味、speak-human、prompt template、marketing skills、ad copy、video script、MIT
