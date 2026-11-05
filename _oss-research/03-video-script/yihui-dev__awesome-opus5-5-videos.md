# yihui-dev/awesome-opus5-5-videos — 703 支「用 Claude Opus 5.5 寫程式做出來的影片」提示詞收藏庫
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：92aee2f
> GitHub：https://github.com/yihui-dev/awesome-opus5-5-videos｜⭐ 13529｜授權：MIT（僅限 repo 本身；收錄的影片與提示詞版權屬各原作者）｜主要語言：-｜最近更新：2026-10-13

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這不是軟體，而是一份「提示詞資料集」——703 則創作者在 X（Twitter）上分享、用 Claude Opus 5.5 生成「以程式碼繪製的動態影片」（HTML／Canvas／SVG／Three.js／Remotion）的提示詞，外加一份結構化的 `data/videos.json`。

**重點觀念**：這裡的影片**不是** AI 影像生成（不是 Sora／Veo 那種「生成真人畫面」），而是讓 Claude **寫一支動畫程式**，再用無頭瀏覽器（Playwright／Chrome）逐格錄製、用 ffmpeg 合成 MP4。所以最適合的是：
- **電商商品介紹／使用說明短片**（直式 9:16、15–30 秒、商品圖＋字幕＋按鈕點擊動畫）。
- **App／網站／倉儲系統的產品宣傳片**（UI 動態展示，例如把您自己的庫存系統畫面做成 15 秒廣告）。
- **廣告素材策略**：有一則把「產品理解 → 廣告角度 → 20 個 hook → 腳本 → 素材」拆成 10 個 Phase 的完整廣告企劃提示詞，可直接改成您自己商品用。
- **節慶／品牌動畫**：例如以台灣黑熊為主角的中秋節手繪動畫（繁中＋英文字幕）。
- **短劇**：只有少數幾則「說故事」型（無對白短片、9:16 小故事、MV），而且都是動畫／插畫風，**不適合真人短劇**。真人短劇請找其他專案。

對您最實際的用法：挑 5–10 則「結構化提示詞」當範本，把商品名稱、賣點、品牌色、商品照替換掉，丟進 Claude Code 生成單一 HTML 動畫，再錄成 MP4 投廣告。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- repo 根目錄 `LICENSE` 是 **MIT**（著作權人 yihui-dev，2026）——[LICENSE](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/LICENSE)。
- **但** README 的 Credits 段明寫：「Every video and prompt belongs to its creator」——每則影片與提示詞屬於原創作者（[README.md#L109-L113](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/README.md#L109-L113)）。也就是說 MIT 只涵蓋整理者自己的編排與 JSON 結構，**不代表 703 則提示詞都被授權成 MIT**。
- **個人使用**：拿提示詞來學、改寫成自己的版本產生自己的影片，實務上沒什麼問題。
- **公司商用**：
  1. 不要整份提示詞原封不動轉賣或包成付費產品；改寫成自己的結構即可（提示詞的「結構與技法」一般難以主張著作權，但長篇原文可能有）。
  2. 影片中的**音樂與素材**要自己確認授權——很多提示詞本身就提醒只用 Mixkit／Pexels 等可商用素材（例：[twoclipping-000267.md#L40-L42](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/twoclipping-000267.md#L40-L42)）。
  3. 有些提示詞模仿 Spotify、Apple 等品牌風格；商用廣告不要用他人商標。
- **付費／閉源**：repo 內沒有程式碼可閉源。「原作與重製並排觀看」的功能在外部網站 skillry.dev（README 大量導流到該站，帶 utm 參數），那是整理者自己的網站，repo 內看不到其實作——未確認是否收費。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

- repo 本身：**沒有任何可執行程式碼**。共 707 個檔案：`README.md`、`LICENSE`、`.gitignore`、`data/videos.json`、`prompts/*.md` ×703（用 `git ls-tree -r --name-only HEAD` 列出後計數）。
- 要「跑」這些提示詞需要：
  - **Claude Opus 5.5**（Claude Code、Claude App 或任何能呼叫該模型的代理工具）。費用依您的 Claude 方案或 API 用量；長提示詞（如 daniel-haida 的 761 行版本）加上多輪渲染迭代，token 消耗可觀，建議用 Claude Code 訂閱方案。
  - 提示詞裡常出現的工具鏈（我用 grep 在 `prompts/` 計數「含該字的檔案數」）：Remotion 98 檔、ffmpeg 43 檔、Playwright 32 檔、HyperFrames 24 檔、ElevenLabs 13 檔、`seek(t)` 純函式時間軸 30 檔。
  - 本機需 Node.js（Remotion／Playwright）、ffmpeg；不需要 GPU（Three.js／WebGL 用一般顯示卡即可）。
  - 選配：TTS 旁白（ElevenLabs、Gemini TTS 等，需各自 API Key）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

```
awesome-opus5-5-videos/
├── README.md            # 精選 100 支（四大分類表格）＋最新 30 則＋使用說明＋Credits；大量 skillry.dev 連結
├── LICENSE              # MIT
├── .gitignore           # 只有 .DS_Store
├── data/
│   └── videos.json      # 703 筆結構化資料（約 813 KB），每筆含完整 prompt 全文
└── prompts/             # 703 個 .md，每則一檔，檔名 = <作者>-<推文 ID 末 6 碼>.md
```

`data/videos.json` 欄位（我用 Python 逐筆統計 key 組合）：`slug`、`author`、`author_url`、`post_url`、`category`、`tech_tags`、`prompt`、`prompt_partial`、`poster_url`、`skillry_url`、`added`、`has_remake`；其中 285 筆另多一個 `title`（10/12 新增的那批）。[data/videos.json](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/data/videos.json)

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

| 功能 | 位置 | 重點 |
|---|---|---|
| 精選展示 | [README.md#L19-L83](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/README.md#L19-L83) | HTML `<table>` 三欄格狀，每格：預覽圖→skillry、作者推文、Prompt 連結、技術標籤 |
| 最新收錄 | [README.md#L84-L99](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/README.md#L84-L99) | 30 則有標題的新提示詞 |
| 使用方法 | [README.md#L101-L107](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/README.md#L101-L107) | 複製 Prompt → 貼到 Opus 5.5 → 要求輸出單一 HTML → 錄影 |
| 機器可讀資料 | `data/videos.json` | 可直接用程式篩選（分類、技術、是否完整提示詞） |
| 單則提示詞 | `prompts/*.md` | 兩種格式：舊 418 則以「# Opus 5.5 video by @作者」開頭並列出 Remake 技術；新 285 則以標題開頭。作者未公開完整提示詞時會加註「The author didn't publish the full prompt」並改放貼文原文 |

沒有任何產生器、爬蟲或建置腳本存在於 repo 中（README 與 JSON 如何產生：未確認）。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 提示詞資料集 JSON | [data/videos.json](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/data/videos.json) | 無 | 低 | 匯入您自己的 Firebase（Firestore）做「提示詞庫」頁面，依 category／tech_tags 篩選，一鍵複製 |
| 電商直式商品說明影片範本（中文） | [prompts/qianqiongge-246969.md#L12-L20](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/qianqiongge-246969.md#L12-L20) | Remotion、Claude Code | 低 | 直接換成您的商品圖資料夾與賣點，產出 1080×1920 15 秒 MP4 |
| 產品發表影片「inputs/direction/structure/build/gotchas」範本 | [prompts/twoclipping-000267.md#L11-L47](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/twoclipping-000267.md#L11-L47) | Playwright、ffmpeg、numpy | 中 | 做成 Claude Code Skill（SKILL.md），每次只換 inputs |
| 食品外送式「商品卡片」15 秒影片 | [prompts/ultimaxbt-549714.md#L12-L52](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/ultimaxbt-549714.md#L12-L52) | Playwright、ffmpeg | 中 | 商品卡片（照片＋名稱＋價格＋評分）結構很適合電商多品項輪播 |
| 10 階段廣告企劃代理提示詞 | [prompts/redpersongpt-284430.md#L48-L277](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/redpersongpt-284430.md#L48-L277) | 只需 Claude | 低 | 改寫產品段落後，產出 persona／20 hook／腳本，接到廣告投放流程 |
| 「真實產品為準、禁止捏造」品牌短片規格 | [prompts/daniel-haida-636937.md](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/daniel-haida-636937.md) | Remotion | 中 | 讓 Claude 先讀您 repo 的 CSS tokens 與截圖，再做倉儲系統宣傳片 |
| 5 場景 30 秒商家說明動畫（極短） | [prompts/alex-prompter-997524.md](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/alex-prompter-997524.md) | 只需瀏覽器 | 低 | 最快上手：一段話就能產出單一 HTML |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **模型**：全部標榜 Claude Opus 5.5，**原生就是 Claude**。部分貼文同時提到 Fable 5.1、Gemini TTS、Seedance（影片生成）、ElevenLabs（配樂／旁白）等輔助工具（如 [prompts/anjmaxx-459455.md](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/anjmaxx-459455.md) 要求用 seedance 生成素材）。
- **Prompt 位置**：`prompts/*.md` 的「## Prompt」區塊內 ```text 圍欄；同樣全文也在 `data/videos.json` 的 `prompt` 欄位。
- **MCP／Skills**：repo 內沒有 MCP server 或 SKILL.md。部分提示詞提到「Remotion 官方 plugin／skill」與 HyperFrames（只是貼文提及，repo 未收錄其內容）。
- 能否換成 Sonnet 等較便宜模型：提示詞本身可通用，但效果是否相同未確認。

## 8. 擴充方式與 API

無 API。擴充方式就是讀 `data/videos.json` 自行加工，例如：
- 篩選 `prompt_partial == false`（完整提示詞，共 496 筆）且 `category` 為 `motion` 或 `explainer`。
- 依 `tech_tags` 找出 `audio`（39 筆）或 `playable`（22 筆）。
- 自己再加欄位（如「適用：電商／廣告／短劇」）建立個人提示詞庫。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：2026-09-27 建立，`added` 日期分佈為 09-26（204）、09-28（102）、09-29（69）、10-08（33）、10-12（295），最後推送 10-13；之後約三週沒更新。屬於「熱潮型」收藏，未來是否持續更新未確認。
- **內容品質落差大**：207 筆標記 `prompt_partial: true`（JSON 統計；以 md 內的「didn't publish the full prompt」字樣計則為 202 檔，差 5 檔原因未確認）——約 3 成只是推文原文（如「Opus 5.5 + Remotion 真厲害」），沒有可複製的提示詞。
- **重複**：同一範本被大量複製（例如「SaaS product launch video」同一段出現在多位作者檔案、twoclipping 的 UI morph `<inputs>` 範本出現在多檔）。
- **導流**：README 幾乎所有連結都帶 `utm_source=github` 導向 skillry.dev，本質上也是該網站的行銷 repo。
- **提示詞注入風險**：這些提示詞常要求 Claude「自主上網找素材、不要問我」（例 [astrothewizard-618782.md](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/astrothewizard-618782.md)）；在 Claude Code 中執行前請先讀過，避免讓代理在您的倉儲系統 repo 內亂改檔案或上傳資料。daniel-haida 那則就特別寫「不要外洩個人／測試／正式環境資料」，這點值得照做。
- **素材授權**：品牌模仿（Spotify、Apple）與音樂來源是商用最大風險。
- 無遙測、無程式碼，所以無傳統資安風險。

## 10. 跟其他專案組合的建議

- **＋ Remotion（或 HyperFrames）**：本 repo 98 檔提到 Remotion，是「Claude 寫 React 影片元件 → 一鍵渲染」的主流做法，建議以 Remotion 作為影片渲染底座。
- **＋ 您的 Firebase 倉儲系統**：從商品資料（名稱、價格、照片 URL）自動產生 `inputs`，批次產出每個商品的 15 秒直式短片 → 這就是「A（商品資料）＋ B（本 repo 的提示詞結構）＋ C（Remotion 渲染）」。
- **＋ 腳本／短劇類專案**：本 repo 的故事型提示詞少，短劇劇本生成、角色一致性請搭配其他專門專案；這裡的「先出分鏡再寫程式」「節拍格線」可以借用。
- **＋ TTS（ElevenLabs、Gemini TTS）**：做中文旁白版廣告。

## 11. 收錄內容整理

### 11.1 總數與怎麼數
- **703 則**：`prompts/` 下 `.md` 檔數（`grep -c '^prompts/'` 檔案清單）＝ `data/videos.json` 陣列長度（Python `len()`）＝ README 自述「703 prompts」，三者一致。
- 有 Skillry 重製版：418（`has_remake` 為 true 的筆數，與 README 一致）。
- 不同作者：616 位（`author` 去重）。
- 提示詞長度：最短 11 字元、中位數 221、最長 15,583 字元。
- 含中日文字的檔案：115 檔（Python 正規式 `[一-鿿぀-ヿ]` 計數）。

### 11.2 分類（JSON `category` 欄位統計）
| 分類 | 數量 | 代表項目 |
|---|---|---|
| motion（動態圖像） | 369 | UI 變形循環（twoclipping-402193）、SaaS 發表影片（moritzkremb-466494）、Spotify 風音樂產品片（brainextends-606193）、台灣黑熊中秋動畫（eric-khun-667455） |
| 3d（3D 場景） | 117 | 直式商品發表＋實拍片段（twoclipping-000267）、外送商品卡片片（ultimaxbt-549714）、1906 舊金山市街重建（alexalbert-274839） |
| explainer（解說） | 116 | 調酒食譜動畫（ror-fly-880547）、光子旅程 60 秒解說（astrothewizard-618782）、商家 5 場景說明（alex-prompter-997524） |
| interactive（互動／遊戲） | 101 | 像素巫師（zacxbt-944604）、App 廣告企劃（redpersongpt-284430）、賽車遊戲（niegramotny-197521） |

技術標籤（`tech_tags`，一則可多個）：canvas 267、svg 183、threejs 131、shader 92、gsap 86、css 57、audio 39、playable 22、particles 17、pixel 15、webgl 9、physics 9、ai-image 6。

### 11.3 對這位使用者最有用的前 10 項
1. **qianqiongge-246969**（中文）— 15 秒直式商品使用說明影片，Remotion 1080×1920 30fps 450 幀；時間切成 0–3 秒商品＋情境、3–9 秒兩步操作、9–13 秒結果、最後 2 秒品名；明確要求「只用提供的商品圖、不補銷售數據、缺素材就停」。**用法**：電商商品頁短影音的最佳起點。
2. **ultimaxbt-549714** — 15 秒「搜尋→送出→商品卡片（照片、名稱、描述、價格、評分）→最佳推薦→下單」連續一鏡到底。**用法**：把「美食」換成您的商品類別，做「幫你挑商品」型廣告。
3. **twoclipping-000267** — 產品＋10–20 支自有直式實拍片段＋音樂 drop，10 小節 120 BPM；含 ffmpeg 抽幀、numpy 分析節拍、Playwright 渲染＋動態模糊、-14 LUFS 響度。**用法**：有實拍開箱影片時做高質感剪輯。
4. **redpersongpt-284430** — 10 個 Phase 的廣告企劃（產品理解→角度→策略含 20 hooks→概念→素材→文案→轉換）。**用法**：投廣告前先產出完整素材企劃，不一定要做動畫。
5. **verbove-268381** — 8–12 個 UI 狀態講產品故事，一次輸出 1:1、16:9、9:16 三種比例。**用法**：同一支廣告同時供 FB 動態、YouTube、Reels 使用。
6. **daniel-haida-636937** — 761 行的品牌短片規格：先檢查真實 repo 與設計 tokens、禁止捏造功能與數據、分段規範（視覺語言、轉場、動態、字體、聲音）。**用法**：為您自己的倉儲 App 做宣傳片時照抄其「REAL PRODUCT ONLY」規則。
7. **alex-prompter-997524** — 一段話：問題→我做什麼→3 步驟→一個證據→品牌名，5 場景 30 秒。**用法**：最快的店家介紹動畫。
8. **ceowinkz-683602** — 15 秒向品牌商推銷自家 Amazon 批發公司。**用法**：B2B 招商、找代理品牌的提案影片。
9. **eric-khun-667455** — 台灣黑熊中秋手繪動畫，要求研究台灣中秋（烤肉、柚子帽）並用繁中＋英文字。**用法**：節慶行銷素材，在地化範例。
10. **jackfriks-338762／kamstudiolabs-100086** — 9:16 小故事動畫（小豬送情書，結尾帶出 App）、45 秒無對白短片。**用法**：短劇型「故事＋結尾置入商品」的極簡提示詞；屬動畫風。

另可參考：brainextends-606193（音樂產品廣告的逐秒 timeline 寫法）、felipemoller-936736（9:16 模擬日常消費場景）、tanabe-fragm-322001（日文：前 25 秒像製作過程、最後揭曉是廣告的「反轉」手法）。

### 11.4 值得學的 prompt 寫法（結構摘錄）
1. **XML 分段骨架**（25 檔以 `<inputs>` 開頭、27 檔含 `<direction>`）：`<inputs>`（先問使用者要什麼素材）→ `<direction>`（風格＋**Banned 清單**）→ `<structure>`（節拍／秒數表）→ `<build>`（技術步驟）→ `<gotchas>` → `<start>`（「先給我分鏡，再寫程式」）。見 [twoclipping-000267.md#L12-L46](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/twoclipping-000267.md#L12-L46)。
2. **時間是純函式**：「Every style is computed from time inside seek(t): no CSS animations, no timers」（30 檔含 `seek(t)`）——確保逐格錄影不會掉幀、可重現。中文版寫成「動效以當前幀號計算，不要用真實時鐘、不要用不固定的隨機數」。
3. **節拍格線**：「120 BPM, something happens on every beat」，用音樂拍點當剪輯點。
4. **先預覽再全渲染**：「First render one frame per beat as a contact sheet」「Probe 20 or more frames before the full render」，以及要求交付指定秒數的靜幀檢查。
5. **禁止捏造**：「Do not invent features」「不補銷售數據」「缺少必要素材時停止並說明」——電商廣告最需要這條，避免 AI 亂寫價格或銷量。
6. **可替換設定分離**：「商品、文字、鏡頭時間分別配置，方便以後替換」——這是做成批次產生器的關鍵。
7. **逐秒 timeline**：brainextends-606193 把 18 秒拆成每 0.8–0.9 秒一段，並有 `<persistent_player>`、`<audio>`、`<implementation_and_validation>` 區塊（[brainextends-606193.md#L11-L173](https://github.com/yihui-dev/awesome-opus5-5-videos/blob/92aee2f586ac0715cb3cbcb6384834f98a33383d/prompts/brainextends-606193.md#L11-L173)）。
8. **角色定位＋分 Phase**：「You are the lead creative strategist, product marketer, direct-response ad writer…」再接 PHASE 1–10，每階段要有明確產出清單。

## 關鍵字
Claude Opus 5.5、提示詞、prompt、動態圖像、motion graphics、產品影片、product launch video、電商短影音、商品說明影片、廣告素材、ad creative、hook、Remotion、HyperFrames、Playwright、ffmpeg、Canvas、SVG、Three.js、GSAP、直式影片、9:16、程式碼生成影片、code-rendered video、分鏡、storyboard、BPM 節拍剪輯、短劇、Skillry、awesome list、videos.json
