# zhuyansen/awesome-claude-video-skills — 讓 Claude Code／Codex 做影片的 413 個開源 skill 與工具包索引（含安全評級與實測）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：68919a0
> GitHub：https://github.com/zhuyansen/awesome-claude-video-skills｜⭐ 1556｜授權：CC0 1.0（清單本身）；收錄的各專案各自授權｜主要語言：-｜最近更新：2026-11-03

> 本資料包所有 permalink 都以 commit `68919a02567555301c17d8b2ab1254f0b9a4bc7c` 為準。下文簡稱：
> - `R` = https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md
> - `J` = https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/data/skills.json

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 這是一份「哪些開源 skill／外掛／MCP 能讓 Claude Code 做影片」的分類目錄，不是程式本身；最有價值的是它的 `data/skills.json`（413 筆、每筆有星數、類型、安全評級、授權、語言），以及一次 16 個 skill 的同條件實測。

注意：GitHub 上的 repo 描述寫「180 repos」，但這個 commit 的 README 與 JSON 實際都是 **413 個**（描述已過時）。

對你（台灣小老闆、要做電商產品影片／廣告／短劇）可以這樣用：
1. **找「電商廣告影片」工具的起點**：直接看「產品宣傳與演示」（77 個）與「短影音與口播」（51 個）兩類，裡面有「給網址→產出廣告影片」「靜態廣告圖→影片廣告」「一個模板批量做 A/B 測試廣告」這類跟投廣告直接相關的 skill（見第 11 節前 10 名）。
2. **短劇／腳本**：「劇本與學習」（10 個）是前期：編劇 skill、爆款影片拉片、參考影片→劇本→分鏡→分段生成提示詞。
3. **挑工具前先看實測**：作者讓 Claude Code（Opus 5.5）用 16 個 skill 做同一支 15 秒宣傳片，列出耗時、有沒有聲音、成品是否跟「不裝 skill」差不多（[R#L75-L102](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L75-L102)）。結論之一很實用：**簡單宣傳片不裝 skill 的 Claude Code 也能 4.4 分鐘做出合格成片**，skill 的價值在風格、流程、處理既有素材。
4. **拿 JSON 自己做「工具挑選表」**：`data/skills.json` 是乾淨的結構化資料，可以直接匯入你自己的 Firebase 倉儲 App 或網頁版試算表，用篩選／排序挑工具（見第 6 節）。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **清單本身：CC0 1.0（公眾領域）**。[LICENSE](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/LICENSE) 寫明「清單的挑選、分組與為它寫的文字」以 CC0 釋出；GitHub 偵測為 NOASSERTION 只是因為檔案不是標準 CC0 全文，而是一段短聲明＋連結。
  - 個人使用：完全自由，複製、改寫、做成你自己的工具表都可以。
  - 公司商用：清單文字與 `skills.json` 的分類結構也可自由用；但**各 repo 名稱與描述屬於原作者**（LICENSE 第二段明講），大量照抄描述做成商業產品時建議改寫。
- **預覽圖** `assets/previews/`（254 個檔案，自己從檔案清單數 `assets/previews/` 開頭的行數）：是各專案 README 圖片的縮小版，**版權仍屬原作者**，只收寬鬆授權專案（[NOTICE.md](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/assets/previews/NOTICE.md)）。不要拿去當你的素材。
- **被收錄的 413 個專案授權分布**（我用 Python 統計 `skills.json` 的 `license` 欄位）：MIT 273、NOASSERTION（自訂或未標）54、未填（null）49、Apache-2.0 25、AGPL-3.0 9、MIT-0 2、CC-BY-SA-4.0 1。
  - 要商用時特別注意 **AGPL-3.0**（例：OpenMontage、OpenChatCut、guizang-product-video-skill、static-to-video-ad、mortiflix-oss）：做成網路服務給別人用就要開源你的修改。
  - **NOASSERTION／null 共 103 個**：等於「沒說清楚」，預設不可商用改作，要用前自己去看該 repo。
- 付費／閉源：清單本身無付費版。但它引導到的線上頁 agentskillshub.top（每 8 小時更新、可篩選）不在此 repo 內，其程式碼與條款「未確認」。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

- 這個 repo **沒有任何可執行程式碼**。全部檔案共 259 個（`git ls-tree -r` 計數）：`README.md`、`README.zh-CN.md`（各 680 行）、`data/skills.json`（約 152 KB）、`assets/previews/`（254 個：250 張圖＋`index.json`＋`NOTICE.md`…以檔名計）、`LICENSE`、1 個 issue 範本。
- 不需要伺服器、資料庫、GPU、API Key。
- 資料由外部服務 Agent Skills Hub 產生：`skills.json` 的 `source` 為 `https://agentskillshub.top/best/claude-video-skills/`，`generated: 2026-11-03`。產生腳本與評級模型**不在本 repo**（README 說是「決策模型逐個讀 README 回答」，[R#L65-L72](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L65-L72)）。實測腳本連到另一個 repo `zhuyansen/agent-skills-hub` 的 `ops/video-runs/RESULTS.md`，我未開啟，「未確認」。
- 被收錄工具的費用要各自看。實測那支宣傳片「沒有一個用到付費模型」，機器上也沒有影片／圖像／語音模型金鑰（[R#L77-L79](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L77-L79)）——代表純程式碼動畫類（Remotion、HyperFrames）只要 Claude 訂閱就能出片；需要真人／寫實畫面的才要 Veo、MiniMax、HeyGen、ElevenLabs 等付費 API。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

```
awesome-claude-video-skills/
├── README.md                 英文版清單（680 行）
├── README.zh-CN.md           簡中版清單（680 行，結構同英文版）
│     L9-25   「到底裝哪個」三個推薦
│     L27-48  10 類的預覽卡片
│     L65-72  收錄標準
│     L75-102 16 個 skill 端到端實測表
│     L107-115 README 寫明用 Claude Opus 5.5 做的 4 個專案
│     L119-668 10 個分類表格（倉庫｜星數｜做什麼｜安全評級）
│     L669-  相關合集、推薦方式
├── data/skills.json          機器可讀版本：generated、source、kinds[10]、skills[413]
├── assets/previews/
│     ├── *.jpg / *.gif       250 張 README 預覽縮圖（他人版權）
│     ├── index.json          每張圖的原始網址、alt、分數、bytes
│     └── NOTICE.md           每張圖的來源與授權表
├── .github/ISSUE_TEMPLATE/add-a-repo.yml   投稿表單（URL＋類型下拉）
└── LICENSE                   CC0 聲明
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

| 功能 | 位置 | 重點 |
|---|---|---|
| 分類定義（10 類，中英） | [J#L4-L65](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/data/skills.json#L4-L65) | `kinds[]` 每筆 `id/icon/en/zh`：general、promo、explainer、editing、shorts、avatar、story、motion、craft、music |
| 每筆收錄資料 | `J` 的 `skills[]`（例：[J#L318](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/data/skills.json#L318)） | 8 個欄位：`repo_full_name`、`path`（monorepo 子目錄，只有 1 筆非 null：`EverMind-AI/Raven` 的 `skills/git-story-film`）、`stars`、`description`、`kind`、`security_grade`（safe/caution）、`language`、`license` |
| 收錄門檻 | [R#L65-L72](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L65-L72) | 要做影片、要給 agent 用、要有 README；50 星以上只看切題，50 星以下另看 README 品質且至少 5 星（點名 Opus 5.5 例外）；由模型判斷 |
| 實測方法 | [R#L75-L102](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L75-L102) | 同一需求（15 秒、1920x1080、30fps、五句固定文案）、用完即刪沙箱、四項客觀檢查：能播放／時長尺寸正確／每秒抽 2 幀都讀得到文案／畫面在動 |
| 投稿流程 | [add-a-repo.yml](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/.github/ISSUE_TEMPLATE/add-a-repo.yml) | GitHub issue 表單；README 好壞決定能否上榜 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 413 筆影片工具結構化資料 | [data/skills.json](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/data/skills.json) | 無（純 JSON） | 低 | `fetch()` 後丟進網頁版試算表元件（例如你在研究的 Univer／Luckysheet 類）或 Firestore 一個 collection，做「工具挑選表」：依類型、星數、授權、安全評級篩選 |
| 10 類影片分類法（中英對照＋icon） | [J#L4-L65](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/data/skills.json#L4-L65) | 無 | 低 | 直接當你自己「影片素材／腳本庫」的分類欄位下拉選單 |
| skill 評測框架（四項客觀檢查） | [R#L75-L79](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L75-L79) | ffprobe／抽幀＋OCR（需自己寫） | 中 | 你用 Claude 批量產廣告片時，用同樣四項做自動驗收（尺寸、秒數、字幕讀得到、不是靜止畫面） |
| 收錄門檻規則 | [R#L65-L72](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L65-L72) | 無 | 低 | 當你自己篩選開源專案的檢查清單 |
| 預覽圖索引 | [assets/previews/index.json](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/assets/previews/index.json) | 無 | 低 | 做工具卡片牆時當縮圖網址來源（圖本身是他人版權，只連結原圖） |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- 本 repo 沒有 prompt、沒有 SKILL.md、沒有 MCP 伺服器。
- 但整份清單的主題就是「給 Claude Code／Codex 用的 skill、外掛、MCP」，收錄項目幾乎都**原生支援 Claude Code**。實測用的就是 Claude Code＋Claude Opus 5.5（[R#L77](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L77)）。
- 特別一節「用 Claude Opus 5.5 做出來的」（[R#L107-L115](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L107-L115)）：lemo-opuscar（11.5k）、PDoomVideo（2.8k）、ClaudeAnimationBase（2.5k）、functional-emotions-video（73）。
- 評級與分類由 Agent Skills Hub 的「決策模型」讀 README 完成，用哪個模型「未確認」。

## 8. 擴充方式與 API

- 沒有 API。擴充方式只有「開 issue 投稿」（[add-a-repo.yml](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/.github/ISSUE_TEMPLATE/add-a-repo.yml)），需填 GitHub URL 與類型。
- 你自己用的話，最實際的「API」就是 raw 讀 `data/skills.json`；每日自動更新（最新 commit 訊息為 `Daily update 2026-11-03`），可以定期拉一次比對新上榜工具。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：建立於 2026-09-27，最後推送 2026-11-03，commit 訊息顯示有每日自動更新；淺層 clone 看不到完整歷史，更新頻率細節「未確認」。
- **描述與內容不一致**：repo 描述寫 180 個，實際 413 個；實測表裡的星數是 2026-10-11 測試當時的數字（例：hyperframes 表內 60,291，JSON 內 78,124），跟分類表不同，引用時注意。
- **安全評級只看 README 與安裝步驟**（[R#L665](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L665)），**不是程式碼審計**。413 個中 401 個 safe、12 個 caution（例：howseen-ai/claude-motion-design、wshuyi/remotion-video-skill、ops120/video-recap-skills-plus、zz41354899/mografy）。「safe」不代表可以放心給它跑任意指令；安裝任何 skill 前仍要自己看它會執行什麼。
- **品質參差**：264 個（64%）不到 50 星，31 個 ≥1000 星、117 個 ≥100 星（自己用 Python 數 `stars` 欄位）。很多是 2026 年 10 月 Opus 5.5 影片熱潮後的新 repo，存活率未知；也有不少是同一套 152 張鏡頭配方卡的分支（video-shotcraft 系列至少 4 個：kingselyjoe、JohnChow90、syklayou-glitch、ChenShuo2004）。
- **分類是模型判的**，邊界上會歸錯（README 自己承認）。
- **研究名單比對**：你研究名單中的 MoneyPrinterTurbo、Toonflow、huobao-drama、ViMax、NarratoAI、drama-skills、video-use、open-design、VoiceStudio、claude-video、remotion 主程式**都不在這份清單**（用 grep `repo_full_name` 確認）；只有 hyperframes、OpenMontage、remotion-dev/skills、lemo-opuscar、claude-code-video-toolkit、hypit、video-clipforge、video-shotcraft 系列在內。所以它偏「Claude Code skill／純程式碼動畫」，不涵蓋完整的 AI 短劇平台。

## 10. 跟其他專案組合的建議

- **「挑工具」階段**：把 `skills.json` 匯進你的網頁版試算表，加欄位「我的評分／試用結果／能不能商用」，就是一張自己的選型表。
- **電商廣告片組合（A＋B＋C 範例）**：
  - A：`leosssvip-dot/remotion-ad-video-skill` 或 `iart-ai/ad-video-skills`（網址／模板→批量廣告）
  - B：`wyuzhi/qisi-video-remix` 或 `sharon-laicc/viral-video-decomposer`（拆別人的爆款→腳本與分鏡）
  - C：remotion-dev/skills 或 hyperframes（實際渲染，已在研究名單）
  - 驗收：借用本清單的四項檢查做自動 QA。
- **短劇組合**：`jtydhr88/screenwriting-skills`（編劇）＋ `Yuuhann1999/agent-storyboard`（MCP 分鏡工作台）＋ 你研究名單中的 huobao-drama／Toonflow（本清單未收，做真正的 AI 短劇生成）。
- **跟試算表的交集**：`wocha-xiaoli/video-shot-analysis-feishu` 把拉片結果寫進飛書多維表格（Base），證明「影片分析→表格」的流程可行；你可以讓 Claude 把同樣結構寫進自己的網頁試算表或 Firestore。
- 與 `yihui-dev/awesome-opus5-5-videos`（已有資料包）互補：那邊收作品，這邊收工具；README 也推薦 `opusvideo/awesome-claude-video`（收作品）。

## 11. 收錄內容整理

### 11.1 總數與怎麼數
- **413 個 repo**：用 `python3 -I` 讀 `data/skills.json`，`len(skills)` = 413，`repo_full_name+path` 去重後仍 413。README 中以 `| [` 開頭的表格列共 417 列 = 413 ＋「Opus 5.5 做出來的」表 4 列（其中重複的 4 個也出現在分類表）。
- 依 `kind` 計數：

| 類型 | 數量 | 代表項目（⭐ 為 JSON 中星數） |
|---|---:|---|
| 🧱 框架與通用工具包 general | 72 | heygen-com/hyperframes ⭐78,124；calesthio/OpenMontage ⭐75,736；hypit-ai/hypit ⭐27,695；remotion-dev/skills ⭐6,224；NarratorAI-Studio/narrator-ai-cli-skill ⭐3,089；digitalsamba/claude-code-video-toolkit ⭐2,425；iart-ai/motion-skills ⭐1,178 |
| 📣 產品宣傳與演示 promo | 77 | feitangyuan/onetake ⭐3,673；echris6/motion-video-kit ⭐1,341；Tejashmakwana/motionmaxxing ⭐1,309；op7418/guizang-product-video-skill ⭐898（AGPL）；Avijit07x/cursorcam ⭐91（自動點網頁錄 demo） |
| 🎓 講解科普 explainer | 73 | EverMind-AI/Raven（skills/git-story-film）⭐6,015；Alisa0808/vox-director ⭐2,596；adithya-s-k/manim_skill ⭐1,252；vincentsch/explainroo ⭐784（實測最快 2 分鐘） |
| ✂️ 剪輯與後期 editing | 53 | FireRedTeam/FireRed-OpenStoryline ⭐3,625；0xsline/OpenChatCut ⭐2,881（AGPL）；JimLiu/baocut ⭐1,660；hetpatel-11/Adobe_Premiere_Pro_MCP ⭐809；zenstory-ai/video-recap-skills ⭐602 |
| 📱 短影音與口播 shorts | 51 | adunext/adu-motion-video ⭐702；Yuuhann1999/agent-storyboard ⭐384；hassancs91/claude-faceless-shorts-creator ⭐297；ymybxx/SoloMCN ⭐75 |
| 🧑‍💼 數位人 avatar | 9 | cclank/lanshu-create-ai-presenter-video ⭐2,901；heygen-com/skills ⭐535；Upload-Post/avatar-mix ⭐137 |
| 📖 故事與動畫 story | 25 | lemomo-ai/lemo-opuscar ⭐11,530；JohnHeibel/ClaudeAnimationBase ⭐2,496；gnipbao/story-to-handdrawn-video ⭐2,358；edenfunf/reelmimic ⭐1,746 |
| 🎞 動效與 Logo motion | 26 | diffusionstudio/lottie ⭐5,679；nolangz/pixel2motion ⭐2,575；pyang5166/gbro-collage-broll ⭐1,625 |
| 📝 劇本與學習 craft | 10 | jtydhr88/screenwriting-skills ⭐1,947；eternityspring/reelbench-skills ⭐1,197；gnipbao/minimax-h3-video-reverse-skill ⭐298；wyuzhi/qisi-video-remix ⭐188 |
| 🎵 音樂影片 music | 17 | JohnHeibel/PDoomVideo ⭐2,813；EGSECDA/vocaloid-style-mv-pipeline ⭐242；10291124jcjc-dotcom/ancient-rap-battle ⭐203 |

- 主要語言（JSON `language`）：Python 156、JavaScript 102、TypeScript 84、HTML 38、未標 19、Shell 7、其他 7。
- 技術路線歸納（從描述歸納，非逐一驗證）：大宗是 **Remotion（React→MP4）** 與 **HyperFrames（HTML＋GSAP→MP4）** 的「純程式碼動畫」；少數接生成式模型（Veo/Google Flow、MiniMax H3、HeyGen、ElevenLabs、Kokoro 本機 TTS、Whisper）；剪輯類多用 ffmpeg＋Whisper，或接 Premiere／After Effects／剪映草稿。

### 11.2 實測結論（[R#L9-L25](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L9-L25)、[R#L81-L101](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L81-L101)）
- 16 個全部通過四項檢查；耗時 2.0～23.5 分鐘；9 個有加聲音；6 個看起來接近「不裝 skill」、10 個有自己風格。
- 推薦：最快出片 **explainroo**（2.0 分鐘，有聲音）；要一鏡到底創意 **onetake**（8.5 分鐘）；要用 Remotion 做自己的設計 **remotion-dev/skills**（4.5 分鐘，但風格要自己給）。
- 坑：**hyperframes 這支 15 秒片做了 23.5 分鐘**；motion-graphics（Barty-Bart）是為真人素材設計，沒素材時不適合。

### 11.3 對你最有用、且不在研究名單裡的項目（電商影片／廣告／短劇／腳本）

前 10 名（⭐ 為 `skills.json` 星數；行號為簡中 README）：

1. **LordVayron/video-factory** ⭐62・MIT（[R#L156](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L156)）— agent 可安裝運行的影片工作室：**UGC 廣告、微短劇**、情境喜劇等，走 APIMart＋Kie 等付費生成 API。怎麼用：同時覆蓋你「廣告」和「短劇」兩個需求，最值得先看它的流程設計。
2. **leosssvip-dot/remotion-ad-video-skill** ⭐110・MIT（[R#L234](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L234)）— 給商品頁網址→產生 Remotion 廣告影片專案，**不需要影片生成模型**。怎麼用：把你的商品頁丟給它，零額外 API 費。
3. **iart-ai/ad-video-skills** ⭐20・MIT（[R#L257](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L257)）— 一個動態模板**批量做成品牌一致、可 A/B 測試的廣告素材**與用戶證言短片。怎麼用：投放時一次產多個版本測 CTR。
4. **Maartenlouis/remotion-ads** ⭐67・MIT（[R#L472](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L472)）— Instagram Reels 與輪播廣告。怎麼用：IG／FB 廣告素材。
5. **holy-templar/static-to-video-ad** ⭐6・AGPL-3.0（[R#L281](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L281)）— 把**現有靜態廣告圖變成影片廣告**（需 MaxFusion AI MCP）。怎麼用：舊圖素材再利用；商用注意 AGPL。
6. **edenfunf/reelmimic** ⭐1,746・MIT（[R#L547](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L547)）— 給一支你喜歡的影片，產出**同風格新影片**，Claude Code 規劃、製作並一起審片。怎麼用：模仿同業爆款廣告的節奏與風格。
7. **wyuzhi/qisi-video-remix** ⭐188・MIT（[R#L626](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L626)）— 參考影片 → 劇本 → 分鏡 → **分段生成提示詞**。怎麼用：短劇／廣告腳本前期，產出可直接餵給 Veo／可靈類模型的提示詞。
8. **jtydhr88/screenwriting-skills** ⭐1,947・MIT（[R#L623](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L623)）— 26 個編劇、電視劇寫作與戲劇構作 skill。怎麼用：寫短劇劇本與人物弧線。
9. **Yuuhann1999/agent-storyboard** ⭐384・MIT（[R#L463](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L463)）— 本機優先的分鏡工作台，Claude Code **透過 MCP** 寫分鏡、生成圖片／影片素材與配音並自動回填。怎麼用：短劇分鏡管理；MCP 介面可以學來接你自己的工具。
10. **sharon-laicc/viral-video-decomposer** ⭐9・MIT（[R#L632](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L632)）— 拆解爆款短影音：鏡頭級拉片、爆款機制、AI 生產藍圖與生成 brief。怎麼用：研究競品廣告。

再加 10 個備選：
- **beatra-ai/viral-video-remake-skill** ⭐6・MIT-0（[R#L503](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L503)）— 爆款短影音拆成 hook／節拍再重做，MIT-0 最寬鬆。
- **gnipbao/minimax-h3-video-reverse-skill** ⭐298・MIT（[R#L625](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L625)）— 從參考影片反推首幀與動態提示詞（MiniMax H3）。
- **cclank/lanshu-create-ai-presenter-video** ⭐2,901・MIT（[R#L521](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L521)）— 不綁服務商的數位人口播，用腳本＋一張**經授權**的人像。適合商品介紹口播。
- **Upload-Post/avatar-mix** ⭐137・MIT（[R#L523](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L523)）— HeyGen 數位人＋動態背景＋Hormozi 式字幕，並發布到社群。
- **Mr-funny/hbg-life-simulation** ⭐150・MIT（[R#L554](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L554)）— 中文敘事短片，**統一漫畫 IP 角色**、Edge TTS、同步字幕、成片 QA；短劇角色一致性可參考。
- **zenstory-ai/video-recap-skills** ⭐602・MIT（[R#L401](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L401)）— 影片→中文解說成片，可**匯出剪映草稿**繼續手修。
- **FireRedTeam/FireRed-OpenStoryline** ⭐3,625・Apache-2.0（[R#L395](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L395)）— 自然語言導演式剪輯 agent，可重用 Style Skills；商用授權友善。
- **ymybxx/SoloMCN** ⭐75・MIT（[R#L471](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L471)）— 從熱榜選題到抖音／小紅書／B 站／YouTube 發布的短影音團隊化流程。
- **threeaus/creator-style-kit** ⭐54・MIT（[R#L476](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L476)）— 18 套 9:16 直式影片風格（字體、配色、動效、音效）。
- **wocha-xiaoli/video-shot-analysis-feishu** ⭐44・MIT（[R#L628](https://github.com/zhuyansen/awesome-claude-video-skills/blob/68919a02567555301c17d8b2ab1254f0b9a4bc7c/README.zh-CN.md#L628)）— 拉片結果寫進飛書多維表格：**影片分析＋試算表**的交集，對你的兩個興趣都有參考價值。

（以上項目我只讀了本清單的描述，沒有 clone 各 repo；功能細節、實際品質與授權條文都屬「未確認」，用前請個別建資料包。）

### 11.4 值得學的寫法（從清單本身與條目描述歸納）
本 repo 不含 prompt 或 SKILL.md，所以以下是「清單層級」可學的結構：
- **可客觀驗收的評測規格**：固定需求（秒數、解析度、fps、固定文案）＋ 4 個可自動判定的檢查（能播放／時長尺寸／每秒 2 幀 OCR 讀得到每句／畫面在動），「好不好看不打分，成片放出來讓人自己看」。你讓 Claude 批量產廣告片時，可照這個寫 QA 步驟。
- **收錄門檻寫成可判定的條件**（要做影片、要給 agent 用、有 README、星數分層門檻），交給模型逐條回答，而不是憑感覺。
- 條目描述中反覆出現、值得在你自己的 skill 中採用的設計（依描述，未逐一驗證）：
  - 「**先給三個方案和預覽，確認後再逐幀渲染**」（Kianzzz/xilo-opus-video）、「**三閘門審批**」（pyang5166/gbro-collage-broll）、「**七個階段關卡**」（unclejobs-ai/motion-video-skill）＝分階段讓人確認，避免一次燒掉大量 token／API 費。
  - 「**鏡頭配方卡**」（video-shotcraft 系列的 152 張）＝把鏡頭語言寫成可檢索的卡片庫。
  - 「**critic loop／甲乙環**」（echris6/motion-video-kit、Zane-0x5a/remotion-director）＝另開一個審片 agent 給意見再修。
  - 「**把 Opus 做一次的成果蒸餾成配方，讓便宜模型照做**」（JuneYaooo/cheap-claude-video、8533502-dev/deepseek-opus-motion-skill、Finderchangchang/promo-video-skill）＝降低長期成本的思路。

## 關鍵字
awesome-claude-video-skills、Claude Code 影片、Claude skill、Agent Skills、Codex、影片生成、電商廣告影片、產品宣傳片、短影音、Reels、TikTok、抖音、短劇、微短劇、劇本、分鏡、拉片、爆款復刻、Remotion、HyperFrames、GSAP、MCP、數位人、AI avatar、口播、剪輯、字幕、剪映草稿、A/B 測試廣告、UGC ads、Opus 5.5、安全評級、Agent Skills Hub、skills.json、CC0、video skills directory
