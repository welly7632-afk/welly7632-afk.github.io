# coreyhaines31/marketingskills — 給 Claude Code 用的 53 個行銷 Skills 大全（廣告素材、影片腳本、文案、SEO、CRO）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：88c79f6
> GitHub：https://github.com/coreyhaines31/marketingskills｜⭐ 58474｜授權：MIT｜主要語言：JavaScript｜最近更新：2026-10-31

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這是一套「純 Markdown 的行銷知識包」，裝進 Claude Code 之後，Claude 會在你提到「廣告文案」「短影音腳本」「轉換率」「SEO」時，自動套用對應的行銷流程與檢查清單。它不是一個網頁應用程式，沒有試算表、也沒有比價功能。

對你（台灣小店老闆、自己投廣告、想做電商影片與短劇）最直接的用途：

1. **量產廣告素材**：`ad-creative` skill 會先問平台、產品、受眾，再用「3–5 個切角（angle）× 每個切角多種變化」產出標題／描述／主文，還會檢查各平台字數上限，最後可以直接輸出成 CSV 給你上傳到 Meta／Google Ads。
2. **寫短影音／廣告影片腳本**：`social/references/short-form-video.md` 有現成的「Hook（0–3 秒）→ Body → CTA」腳本模板；`ad-creative/references/hook-system.md` 把開場 3 秒拆成「畫面動作＋口白＋字幕」三件事，並教你做「Hook 矩陣」。
3. **選 AI 影片工具與寫影片 prompt**：`video` skill 比較 Veo 3、Runway、Kling、Seedance、Hailuo、Pika、Hunyuan/Wan 等模型，並給出「主體＋動作＋鏡頭＋風格＋情緒」的 prompt 結構；還有 Hyperframes（HTML 做影片）／Remotion（React 做影片）的批次產片方式。
4. **拆解爆款影片剪輯風格**：`video/references/edit-anatomy.md` 教你把一支你喜歡的影片拆成「Beat Sheet（逐拍表）」，再套到自己的素材上 —— 這對做短劇、商品短片很實用。
5. **建立品牌／產品資料檔**：`product-marketing` 會產出一份 `.agents/product-marketing.md`（產品、受眾、痛點、客戶用語、品牌語氣、已測過的廣告心得），之後所有 skill 都先讀它，等於你的「品牌記憶」。
6. **查自己的廣告成效**：`tools/clis/meta-ads.js`、`tiktok-ads.js`、`google-ads.js` 是零依賴的 Node.js 小工具，可以拉廣告活動與成效數據，再丟回 `ad-creative` 做「依成效迭代」。
7. **對你的倉儲／ERP 網頁 App**：這個 repo 本身幫不上庫存或比價，但它「SKILL.md 怎麼寫」的方法，非常適合你拿來替自己的系統寫 Claude Skill（例如「進貨成本計算 skill」「商品上架文案 skill」）。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**（`LICENSE` 第一行就是 `MIT License`，`Copyright (c) 2025 Corey Haines`；`.claude-plugin/plugin.json` 也寫 `"license": "MIT"`）。
- **個人使用**：完全自由，可以直接裝、改、翻成中文。
- **公司商用**：也可以，包含改寫後放進自己公司的工具或產品裡；唯一要求是**保留原作者著作權聲明與 MIT 授權全文**（例如在你的 repo 放一份 LICENSE 或在 skill 檔頭註明出處）。
- **閉源／付費版**：skills 本身沒有付費鎖。但 README 有大量導流：作者的代理商 Conversion Factory、付費課程 AI Marketing Training、自家 AI CMO 產品 Magister，以及 4 家「Verified Partners」（Converly、Ploy、AIsa、Omnia）的整合指南。README 自稱夥伴「不影響核心 skill 的推薦」，但你使用時要知道 `tools/integrations/` 裡有贊助商內容。
- **第三方服務**：skill 裡提到的 HeyGen、Veo、Runway、ElevenLabs 等都是各自收費、各自授權（例如 AI 產出影片能否商用，要看各家條款），與本 repo 的 MIT 無關。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

- **主體**：Markdown（337 個 `.md` 在 `skills/` 下，合計約 61,184 行；用 `find skills -name '*.md' | wc -l` 與 `cat | wc -l` 計算）。沒有前端、後端、資料庫。
- **JavaScript 部分**：`tools/clis/` 有 66 支零依賴 Node.js 18+ CLI（用 `ls tools/clis/*.js | wc -l` 計算），只用內建 `fetch`；另有 `skills/reverse-engineer-marketing/scripts/teardown.mjs`（1,227 行）與 `conversion-tracking` 的 Python 腳本。GitHub 判定主要語言是 JavaScript 就是因為這些 CLI。
- **安裝方式**（README 第 132 行起）：`npx skills add coreyhaines31/marketingskills -a claude-code`，或在互動式 Claude Code 裡 `/plugin marketplace add coreyhaines31/marketingskills` → `/plugin install marketing-skills`。也支援 Codex、Cursor 等。
- **硬體／GPU**：不需要。
- **API Key**：只用 skill 本身完全不用 key（只需要你的 Claude 訂閱）。若要用 CLI 拉數據，才需要各平台的 token，例如 `META_ACCESS_TOKEN`、`META_AD_ACCOUNT_ID`（見 `tools/clis/meta-ads.js` 開頭）。影片／圖片生成的費用來自外部服務（skill 內寫 Kling 約 $0.03/秒、Runway $12–76/月，價格會變，請以官網為準）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

```
marketingskills/
├── .claude-plugin/
│   ├── plugin.json          # Claude Code 外掛描述（版本 2.14.0，skills 指向 ./skills）
│   └── marketplace.json     # 讓 /plugin marketplace add 可以裝
├── .codex-plugin/ .agents/plugins/   # Codex 與通用 agent 的外掛描述
├── skills/                  # ★ 核心：53 個 skill，每個一個資料夾
│   └── <skill-name>/
│       ├── SKILL.md         # 主指令（frontmatter: name / description / metadata.version）
│       ├── references/      # 細節文件，需要時才讀（全 repo 共 283 個檔）
│       ├── evals/evals.json # 測試題：prompt + expected_output（全 repo 共 469 題）
│       ├── assets/          # 模板（如 ad-creative 的審稿頁 HTML、GTM 配方 JSON）
│       └── scripts/         # 少數 skill 附的腳本（teardown.mjs、build_recipe.py）
├── tools/
│   ├── clis/                # 66 支零依賴 Node CLI（Meta/TikTok/Google Ads、GA4、Klaviyo…）
│   ├── integrations/        # 106 份 API 整合指南（含 shopify.md、heygen.md、hyperframes.md）
│   ├── composio/            # 透過 Composio 串工具
│   ├── REGISTRY.md          # 工具索引（728 行）
│   └── SETUP.md / PARTNERS.md
├── tests/clis/              # 136 支 CLI 合約測試（mock fetch，不連網）
├── scripts/                 # 版本檢查、打包 skills 成 zip、同步贊助商區塊
├── VERSIONS.md              # 每個 skill 的版本表，給 agent 比對是否要更新
├── CLAUDE.md = AGENTS.md    # 貢獻者規範（兩檔內容相同，各 11,859 bytes）
└── README.md
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

| 功能 | 位置 | 實作重點 |
|---|---|---|
| Skill 規格與寫作規範 | [CLAUDE.md](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/CLAUDE.md) | `name` 必須等於資料夾名、`description` ≤1024 字元且要寫觸發詞、SKILL.md 控制在 500 行內、細節放 `references/` |
| 共用品牌脈絡 | [skills/product-marketing/SKILL.md#L55-L141](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/product-marketing/SKILL.md#L55-L141) | 14 個區塊（產品、受眾、痛點、競品、客戶用語、品牌語氣、付費廣告、Learnings）；其他 skill 開頭都先讀這份 |
| 影片製作總覽 | [skills/video/SKILL.md#L37-L46](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/video/SKILL.md#L37-L46) | 四種路線：程式化（Hyperframes/Remotion）、AI 生成、AI 虛擬人、剪輯再利用 |
| AI 影片模型比較 | [skills/video/SKILL.md#L115-L152](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/video/SKILL.md#L115-L152) | 模型表＋prompt 公式「subject + action + camera + style + mood」＋常見錯誤（別讓 AI 生字幕） |
| Agent 原生影片流程 | [skills/video/SKILL.md#L287-L309](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/video/SKILL.md#L287-L309) | Agent 寫腳本 → Hyperframes 產模板片／HeyGen MCP 產虛擬人／Veo 產 B-roll → 組片 |
| 廣告素材「有憑據」產出 | [skills/ad-creative/SKILL.md#L75-L99](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/SKILL.md#L75-L99) | `inputs/winning-ads`、`reviews`、`comments` 三個資料夾；沒素材就停下來問，不准憑空編數據 |
| 依成效迭代 | [skills/ad-creative/SKILL.md#L222-L262](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/SKILL.md#L222-L262) | 分析贏家／輸家 → 加碼贏的主題、測 1–2 個新切角 → 寫 Iteration Log |
| 廣告數據 CLI | [tools/clis/meta-ads.js#L90-L125](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/tools/clis/meta-ads.js#L90-L125) | 直接打 Graph API v18.0；`campaigns insights` 抓 impressions/clicks/spend；有 `--dry-run` 只顯示請求 |
| 競品價格歷史 | [skills/reverse-engineer-marketing/scripts/teardown.mjs#L617-L640](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/reverse-engineer-marketing/scripts/teardown.mjs#L617-L640) | 用 Wayback Machine 每月快照，正規表示式抓 `$€£` 價格，列出價格變動的月份 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 短影音腳本模板 | [social/references/short-form-video.md#L79-L108](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/social/references/short-form-video.md#L79-L108) | 無 | 低 | 翻成中文，當成你影片生成專案（如短劇產生器）的「腳本輸出格式」 |
| Hook 三要素＋Hook 矩陣 | [ad-creative/references/hook-system.md#L9-L46](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/references/hook-system.md#L9-L46) | 無 | 低 | 做成 prompt 的一段，要求 Claude 每個 Hook 輸出「畫面／口白／字幕」三欄 |
| 9:16 直式影片安全區規格 | [ad-creative/references/short-form-video-specs.md#L9-L24](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/references/short-form-video-specs.md#L9-L24) | 無 | 低 | 1080×1920、上 220px／下 500px／左右 180px 留白 → 直接寫進 Remotion/Hyperframes 字幕元件的 CSS |
| 爆款剪輯 Beat Sheet | [video/references/edit-anatomy.md#L45-L62](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/video/references/edit-anatomy.md#L45-L62) | 無 | 低 | 當分鏡表格式，餵給影片生成專案的分鏡步驟 |
| AI 影片 prompt 指南 | [video/references/ai-video-prompting.md](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/video/references/ai-video-prompting.md) | 無 | 低 | 鏡頭運動詞彙、風格關鍵字、各模型技巧 → 放進你的分鏡轉 prompt 步驟 |
| 有憑據的廣告產出規則 | [ad-creative/SKILL.md#L75-L99](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/SKILL.md#L75-L99) | 你的評論／廣告截圖 | 低 | 把蝦皮／官網評論存成 `.md` 放 `inputs/reviews/`，每條文案都要標出處 |
| 廣告 CSV 批次輸出格式 | [ad-creative/SKILL.md#L348-L368](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/SKILL.md#L348-L368) | 無 | 低 | 可以讓 Claude 產 CSV，再匯入你自己的網頁試算表元件做編修 |
| 「去 AI 味」黑名單 | [ad-creative/SKILL.md#L299-L316](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/SKILL.md#L299-L316)、[copywriting/references/ai-tells.md](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/copywriting/references/ai-tells.md) | 無 | 中（英文語感需改寫成中文版） | 改寫成中文版禁用句型（例如「不是 X，而是 Y」「告別…」），放進所有文案 prompt |
| 廣告審稿頁 HTML | [ad-creative/assets/creative-review-template.html](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/assets/creative-review-template.html) | 無（單檔、無網路） | 低 | 432 行單一 HTML，資料放在 `<script id="review-data">` 的 JSON；可直接放到你 Firebase Hosting 讓自己挑素材 |
| Meta / TikTok / Google Ads CLI | [tools/clis/meta-ads.js](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/tools/clis/meta-ads.js) | Node 18、平台 token | 中 | 把 `api()` 函式搬進 Firebase Cloud Functions，就能在你自己的後台看廣告花費 |
| 競品價格歷史抓取 | [teardown.mjs#L617-L640](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/reverse-engineer-marketing/scripts/teardown.mjs#L617-L640) | Node 18、Wayback Machine | 中 | 價格正規表示式只認 `$€£`，要加 `NT$`／`元`；適合做「競品歷史售價」參考，不是即時比價 |
| 品牌脈絡檔模板 | [product-marketing/SKILL.md#L55-L141](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/product-marketing/SKILL.md#L55-L141) | 無 | 低 | 為你的店建立一份中文品牌檔，所有影片／文案工具共用 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **原生 Claude Code Skills**：整個 repo 就是 Agent Skills 格式，`.claude-plugin/marketplace.json` 讓它直接成為 Claude Code 外掛；不呼叫任何模型 API，靠 Claude 自己讀 SKILL.md。
- **prompt 放在哪**：每個 `skills/*/SKILL.md` 就是 prompt；第一段通常是角色（例如 video：「You are an expert video producer…」），接著「Before Starting」要先讀 product-marketing 脈絡、再問缺的資訊。
- **MCP**：repo 本身不提供 MCP server，但文件指引你接 HeyGen MCP（虛擬人影片）、Omnia MCP、AIsa MCP 等；`video/SKILL.md` 第 335–342 行有工具整合表。
- **外部 AI 生成**：影片（Veo、Runway、Kling、Seedance、Higgsfield）、圖片（Nano Banana Pro/Gemini、Flux、Ideogram）、語音（ElevenLabs、OpenAI TTS、Cartesia、開源 Voicebox）都只是文件說明，見 `ad-creative/references/generative-tools.md`（609 行）。沒有寫好的串接程式碼。
- **評測**：每個 skill 有 `evals/evals.json`（全 repo 共 469 題，用 `grep -c '"id"'` 加總），格式是 `prompt` + `expected_output`，可以拿來檢查自己改過的中文版 skill 有沒有退步。

## 8. 擴充方式與 API

- **新增 skill**：建 `skills/<name>/SKILL.md`，frontmatter 至少 `name`（小寫、連字號、等於資料夾名）與 `description`（寫清楚「什麼時候用」＋觸發詞）。細節放 `references/`，CI 會檢查每個 references 檔有沒有被 SKILL.md 連到（`scripts/check-versions.mjs`）。
- **版本**：每個 skill 的 `metadata.version` 與 `VERSIONS.md` 表格同步，agent 可比對判斷要不要更新。
- **CLI 擴充**：照 `tools/clis/*.js` 的樣子寫：讀環境變數 token → `parseArgs` → `switch` 子指令 → `api()` 回傳 JSON，支援 `--dry-run` 與 `--timeout-ms`。
- **沒有 HTTP API**：這不是服務，沒有對外 API。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：非常活躍。最後 push 2026-10-31；`VERSIONS.md` 顯示大量 skill 在 2026-10 月更新（例如 ad-creative 2.12.2 於 2026-10-26）；repo 版本 2.14.0。
- **測試**：`tests/clis/` 136 支合約測試（mock fetch）、`validate-skills.sh`、GitHub Actions（regression-tests、validate-skill、check-versions、skill-packaging）。對一個「文件型」repo 來說品質很好。
- **遙測**：在 `tools/clis`、`scripts`、`.github/scripts` 搜尋 `telemetry`、`posthog.capture`、`track(` 沒有命中，未發現遙測。（未逐行審查全部 66 支 CLI。）
- **資安／隱私**：CLI 會把你的廣告帳號 token 放在環境變數並直接打官方 API，`--dry-run` 會把 Authorization 遮成 `***`，設計合理。`teardown.mjs` 會連 web.archive.org、crt.sh 等外部網站。
- **已知的坑**：
  1. 全英文、以美國 B2B SaaS 為主（範例多是「AI 寫作工具」「SaaS 訂閱」），台灣電商要自己改寫例子與平台（蝦皮、LINE、Dcard 未涵蓋）。
  2. `pricing` skill 是「SaaS 訂閱定價策略」，**不是比價或成本計算工具**。
  3. 價格、模型清單會過期（skill 自己也提醒要查官網）。
  4. README 有作者自家產品與贊助商導流。
  5. 53 個 skill 全裝會讓 Claude 判斷觸發時多一些負擔，建議只裝要用的（`--skill ad-creative video social copywriting product-marketing`）。

## 10. 跟其他專案組合的建議

- **＋短劇／影片生成專案**（同資料夾內的 `huobao-drama`、`ViMax`、`NarratoAI`、`claude-code-video-toolkit` 等）：本 repo 提供「前段」—— 品牌脈絡、Hook 矩陣、腳本模板、Beat Sheet、9:16 安全區；那些專案負責「後段」—— 分鏡、生圖、生影片、配音、合成。最划算的組合是：`product-marketing` → `hook-system` → `short-form-video` 腳本 → 交給影片生成工具。
- **＋網頁版試算表專案**：讓 Claude 用 `ad-creative` 輸出 CSV（標題、描述、切角、來源），再匯入你的網頁試算表做篩選、標記「要測／不測」，最後再匯出上傳廣告平台。
- **＋你自己的倉儲 App（Firebase）**：把商品資料（名稱、規格、賣點、評論）匯出成 `.md` 放 `inputs/`，就能做「每個商品自動產 10 個廣告切角＋1 支短影音腳本」。`creative-review-template.html` 可直接部署在你的 Firebase Hosting 當內部審稿頁。
- **＋價格／ERP 專案**：本 repo 幫不上庫存與比價，只有 `teardown.mjs history` 能看競品歷史定價，建議另外找專門的比價／ERP 專案。

## 11. 收錄內容整理

**怎麼數的**：`git ls-tree` 列出全部 817 個檔案；`grep -c '^skills/.*/SKILL.md$'` = **53 個 skill**；`references/` 檔 283 個；`tools/clis/*.js` 66 支；`tools/integrations/` 106 份；evals 469 題。以下分類是我依 README 的分類圖整理成 8 組（README 圖沒涵蓋所有 skill，剩下的我依內容歸類），加總 = 53。

**A. 基礎（1）**
- `product-marketing`：建立產品／受眾／品牌語氣的共用脈絡檔，所有 skill 先讀它。

**B. 文案與內容（9）**
- `copywriting`：寫網頁文案（首頁、商品頁、定價頁）。
- `copy-editing`：修改既有文案、更新舊內容。
- `content-strategy`：規劃要寫哪些主題。
- `social`：社群貼文、排程、社群聆聽；含短影音 Hook 庫與腳本模板。
- `video`：AI 影片、虛擬人、程式化影片製作。
- `image`：AI 生圖、行銷圖片、商品 mockup、OG 圖。
- `emails`：Email 自動化序列。
- `sms`：簡訊／WhatsApp 行銷（棄單、回購）。
- `cold-email`：B2B 陌生開發信。

**C. 付費廣告與量測（6）**
- `ads`：Google／Meta／LinkedIn 等廣告活動策略與健檢。
- `ad-creative`：大量產生、迭代廣告素材（含影片廣告格式）。
- `ab-testing`：A/B 測試設計與樣本數。
- `analytics`：GA4、GTM、事件追蹤、UTM。
- `attribution`：歸因模型、各工具數字對不上時怎麼判讀。
- `conversion-tracking`：轉換追蹤安裝與驗證（附 26 種表單偵測片段與 6 個廣告平台 GTM 配方）。

**D. 轉換率優化 CRO（5）**
- `cro`、`signup`、`onboarding`、`popups`、`paywalls`：分別優化頁面、註冊、新手引導、彈窗、付費牆。

**E. SEO（9）**
- `seo-audit`、`ai-seo`（讓 AI 搜尋引用你）、`site-architecture`、`programmatic-seo`（用資料大量生頁）、`schema`（結構化資料）、`aso`（App 商店優化）、`link-building`、`directory-submissions`、`competitors`（比較頁／替代品頁）。

**F. 成長與留存（8）**
- `referrals`（推薦／聯盟）、`free-tools`（做免費工具導流）、`churn-prevention`、`community-marketing`、`lead-magnets`、`co-marketing`、`influencer-marketing`（網紅／UGC 合作）、`events`（活動、直播講座）。

**G. 銷售與 GTM（8）**
- `revops`、`sales-enablement`（簡報、Demo 腳本、異議處理）、`launch`（新品上市）、`pricing`（SaaS 定價策略）、`offers`（設計優惠組合、保證、稀缺感）、`prospecting`、`competitor-profiling`、`public-relations`。

**H. 策略（7）**
- `marketing-ideas`、`marketing-psychology`（行為心理學）、`customer-research`、`reverse-engineer-marketing`（拆解別人怎麼成長，含 31 個產業手冊）、`marketing-plan`、`marketing-council`（模擬 Ogilvy、Hormozi、Seth Godin 等 12 位行銷大師開會）、`marketing-loops`（讓 agent 定期自動跑的行銷流程）。

### 對你最有用的前 10 項（電商影片、廣告、短劇、腳本）

1. **`ad-creative`**：先放 50–100 則顧客評論到 `inputs/reviews/`，對 Claude 說「幫這個商品做 Meta 廣告 5 個切角」，輸出 CSV。
2. **`ad-creative/references/hook-system.md`**：要 Claude 輸出「客群 × 動機 × 格式」Hook 矩陣，每格寫畫面／口白／字幕。
3. **`social/references/short-form-video.md`**：Hook 庫（好奇、價值、故事、爭議、對比）＋腳本模板，直接做抖音／Reels 腳本。
4. **`ad-creative/references/short-form-video-specs.md`**：13 種創作者格式（反應＋Demo、綠幕、VSL、街訪、ASMR…，各有 S–C 分級）與 9:16 安全區，做商品短片與短劇開場很好用。
5. **`video`**：選工具（Veo／Kling／Seedance／HeyGen）、寫影片 prompt、規劃「腳本 → 模板片 → B-roll → 組片」流程。
6. **`video/references/edit-anatomy.md`**：拆解爆款剪輯成 Beat Sheet 與 3–5 條「招牌手法」，套到自己的片。
7. **`product-marketing`**：先建一次品牌檔，之後所有腳本、文案語氣一致。
8. **`ad-creative/references/static-ad-templates.md`**：靜態圖片廣告模板庫（依 S–F 分級，每則要有標題、內文、畫面描述、出處）。
9. **`offers`**：設計組合包、贈品堆疊、保證、限時限量，適合電商檔期活動。
10. **`marketing-psychology`＋`copywriting/references/ai-tells.md`**：讓文案有說服力又沒有 AI 味（需翻成中文句型）。

### 值得學的 prompt／skill 寫法（短摘錄）

1. **description 就是觸發器**：frontmatter 寫「When the user wants to… Also use when the user mentions 'AI video,' 'Remotion,' 'HeyGen'…」—— 把使用者可能講的字全部列出，Claude 才會自動啟用。你寫中文 skill 時，也要列「腳本、分鏡、短劇、開場」等中文觸發詞。
2. **先讀共用脈絡，再只問缺的**：「If `.agents/product-marketing.md` exists… read it before asking questions… only ask for information not already covered」—— 避免每次重問品牌資訊。
3. **模式分流**：ad-creative 分成 Mode 1 從零產出／Mode 2 依成效迭代／Mode 3 有憑據批次／Mode 4 策略迴圈，每種模式流程不同。
4. **硬性停止條件**：「If `inputs/winning-ads/` or `inputs/reviews/` is empty, stop and ask… Do not generate ungrounded concepts as a fallback.」—— 明確禁止 AI 亂編。
5. **輸出格式寫死**：用 Markdown 表格或 CSV 範例定義欄位（如 Hook 矩陣 `| # | Segment | Motivation | Format | Visual action | Spoken line | Caption |`），Claude 照抄格式最穩定。
6. **SKILL.md 精簡、細節分檔**：主檔 < 500 行，長內容放 `references/` 並在主檔用連結「For detailed prompting guides: See references/…」漸進載入，省 context。
7. **附 evals**：每個 skill 都有 `prompt` + `expected_output` 測試題，改 skill 後可以驗證。
8. **黑名單寫法**：列出「Never write these」具體句型＋一句「為什麼」＋「Still fine」例外，比籠統說「不要有 AI 味」有效。

## 關鍵字
marketingskills、Corey Haines、Claude Code Skills、Agent Skills、SKILL.md、行銷 skill、廣告素材、ad creative、廣告文案、copywriting、短影音腳本、short-form video、Hook、開場三秒、Beat Sheet、分鏡、AI 影片、Veo、Kling、Seedance、HeyGen、Hyperframes、Remotion、9:16 安全區、Meta Ads、TikTok Ads、Google Ads、CSV 批次、品牌脈絡、product-marketing、去 AI 味、ai-tells、SEO、CRO、MIT 授權、電商廣告、短劇開場
