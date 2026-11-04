# xixihhhh/clipforge — 一張商品圖自動出「帶貨短影片」的開源本機工作室（腳本＋素材＋配音＋字幕＋FFmpeg 合成）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：1aab133
> GitHub：https://github.com/xixihhhh/clipforge｜⭐ 1193｜授權：AGPL-3.0-only｜主要語言：TypeScript｜最近更新：2026-10-26

> 掃描方式：淺層 clone（depth 1）後只「讀」程式碼，沒有安裝、建置或執行任何東西。最新 commit 為 2026-10-26「fix: 修复桌面持久化、数据库锁、HTTP 页面和兼容视频接口 (#40)」，版本 `0.9.12`。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：在自己電腦（或 Docker）跑的 Next.js 網頁工具，丟一張商品圖或一個商品網址，它會用 LLM 寫 3 套帶貨腳本 → 每個分鏡自動配畫面（免費圖庫或付費 AI 生圖／圖生影片）→ 微軟 Edge 免費配音 → 燒字幕＋BGM → 用 FFmpeg 合成 9:16 直式短影片，並附上標題、hashtag、文案。

**對你（台灣小店老闆、自己下廣告）可以做的事：**
- **蝦皮／IG Reels／FB 廣告素材量產**：免費路線（免費圖庫＋Edge 配音＋本機 FFmpeg）0 元就能出片；平台規格表已經內建 Instagram Reels、YouTube Shorts、TikTok（但沒有蝦皮專屬規格，用 9:16 1080×1920 即可）。
- **商品網址 → 腳本**：貼商品頁網址，程式會解析 JSON-LD／OpenGraph 抓標題、價格（有 `TWD: "NT$"` 對應）與前 3 張圖。能不能抓蝦皮頁面：**未確認**（蝦皮多為前端渲染，伺服器端拿到的 HTML 不一定有 JSON-LD）。
- **短劇帶貨**：內建 10 種腳本風格（情景短劇、反轉劇場、街頭採訪…），對話式腳本會自動分角色、各配一個免費音色。
- **讓 Claude 直接操作**：附 MCP Server（30 個工具）＋ 2 個 Claude Code Skill，可以在 Claude Code 裡說「幫這個商品網址出一支 25 秒影片」。
- **拆零件**：腳本 prompt（中文、很完整）、FFmpeg 合成器、Edge 免費 TTS、SRT/VTT 字幕匯出、免費圖庫聚合搜尋、廣告違禁詞掃描，都是相對獨立的 TypeScript 模組，很適合拆來接你自己的 Firebase 倉儲 App。

**不能做的**：沒有查供應商、比價、成本／毛利計算（掃過全 `src/`，`供应商` 只出現在「AI 模型供應商鑑權失敗」的錯誤訊息裡）。也沒有自動上架或自動發布到任何平台（README 明說不做）。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權**：根目錄 `LICENSE` 是 GNU AGPL v3 全文；`package.json` 寫 `"license": "AGPL-3.0-only"`；`NOTICE` 加註「修改或再發布（含以網路服務形式提供）須公開原始碼、繼續以 AGPL-3.0 發布，並保留本版權署名」。`mcp/` 子套件也是 AGPL-3.0（`mcp/LICENSE`、`mcp/package.json`）。
- **個人使用**：完全 OK。自己電腦裝、自己出片、拿影片去賣東西都沒問題。**用它產生的影片不是「程式碼的衍生作品」**，影片本身不受 AGPL 約束（README FAQ 也說可商用、無浮水印）。
- **公司商用要注意**：
  1. 公司內部自己用、不對外提供服務 → 一般沒有公開原始碼義務。
  2. **把它改一改、架成網站給客人／加盟店用** → AGPL 第 13 條：要把你修改後的完整原始碼提供給這些使用者。
  3. **把它的程式碼片段複製進你自己的倉儲 App** → 你的 App 整體會被 AGPL「傳染」，若對外提供（就算只是網頁）就要開源。想避免的話：只「參考做法」自己重寫，或把 ClipForge 當獨立服務、用 HTTP API 呼叫（界線較清楚，但仍建議找律師確認）。
- **閉源／付費版**：程式碼裡沒看到付費解鎖、授權碼或 Pro 版功能。所有功能都在 repo 內。付費的只有第三方 AI 服務（生圖、生影片、付費 TTS、LLM）。README 的 Atlas Cloud 連結帶推薦碼 `?ref=JPM683`（作者推薦連結，非強制）。
- **素材授權**：免費圖庫素材各有授權（CC-BY 需要署名），程式有「素材授權清單」功能可產出署名（`/api/project/[id]/credits`）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容（依 `package.json`） |
|---|---|
| 前端 | Next.js 16.2.1（App Router）、React 19.2.4、Tailwind 4、shadcn／@base-ui、zustand 狀態、motion 動畫 |
| 後端 | 同一個 Next.js 的 API routes（`src/app/api/**/route.ts`，用 `find` 數到 **72 個** route 檔） |
| 資料庫 | SQLite（`better-sqlite3`）＋ Drizzle ORM；`drizzle/` 有 20 個 migration（0000–0019）；資料檔在 `<資料夾>/sqlite.db` |
| 影片 | `ffmpeg-static`＋`fluent-ffmpeg`，自己組 filter_complex；Docker 版改用系統 ffmpeg 並檢查有 `drawtext` 濾鏡 |
| 本機語音辨識 | `@huggingface/transformers` 4.2.0 跑 Whisper tiny/base/small（ONNX，瀏覽器 WebGPU 或 WASM） |
| LLM | `openai` SDK（OpenAI 相容協定） |
| MCP | `@modelcontextprotocol/sdk` |
| 桌面版 | Electron 42 打包（mac dmg／win nsis／linux AppImage） |
| 測試 | vitest（`src` 底下 `*.test.ts` 用 `find` 數到 139 個）、Playwright 風格 `e2e/smoke.spec.ts` |

**部署方式**：
- Docker 一行：`docker run -d -p 3000:3000 -v clipforge-data:/data ghcr.io/xixihhhh/clipforge`（README）。
- 本機：Node ≥ 20、pnpm ≥ 10，`pnpm dev`。
- 桌面版：Electron 安裝檔（Release 頁）。
- **不能直接放 Firebase Hosting**：它需要 Node 伺服器常駐＋FFmpeg＋寫本機檔案＋SQLite，比較適合自己電腦或一台 VPS。

**硬體／GPU**：免費路線不需要 GPU，FFmpeg 用 CPU 編碼（預設 x264 CRF 18，合成逾時 10 分鐘）。AI 生圖／生影片全部是雲端 API，本機不跑生成模型。唯一本機 AI 是 Whisper 轉寫（瀏覽器端）與可選的 Ollama 本地 LLM（README 建議 7B 以上 instruct 模型）。

**API Key 與費用**：
- **0 Key 也能出片**：Openverse 圖片＋Wikimedia 影片＋Edge TTS＋本機 FFmpeg（但「AI 寫腳本」需要一把 LLM Key；或用 Ollama 本地、或自己貼腳本）。
- LLM 預設清單（`src/lib/llm-presets.ts`）：Atlas Cloud、OpenRouter、DeepSeek、Kimi、智譜 GLM、MiniMax、豆包、OpenAI、Ollama、Pollinations。**沒有 Anthropic／Claude 預設**。
- 生圖／生影片：Atlas Cloud、fal.ai、Replicate、火山引擎、阿里百煉、硅基流動、OpenAI（`src/lib/providers/`）。價格程式碼沒寫死，Atlas 會從官方目錄即時讀 `base_price`（`atlas-catalog.ts`）。README 只說「API 调用费 几元/条（人民幣）」——**實際每支多少錢未確認**，取決於你選的模型與秒數。
- 付費 TTS：OpenAI 相容 `/audio/speech`、Atlas、MiniMax、fal.ai。
- 圖庫 Key（免費申請）：Pexels、Pixabay、Coverr、Jamendo（音樂）、Freesound（音效）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

（用 `git ls-tree` 數：全 repo 643 個檔；`src/` 下非測試的 `.ts/.tsx` 共 331 個、合計 65,705 行，用 `wc -l` 計）

```
clipforge/
├─ src/
│  ├─ app/                       Next.js 頁面＋API
│  │  ├─ api/                    72 個 route.ts（後端）
│  │  │  ├─ llm/script           產生腳本（串流）
│  │  │  ├─ ingest/product       貼商品網址 → 抓標題/價/圖
│  │  │  ├─ ai/image, ai/video   呼叫雲端生圖、圖生影片（兩階段任務、可續查）
│  │  │  ├─ stock/search         免費圖庫聚合搜尋
│  │  │  ├─ tts, tts/free        付費 TTS / Edge 免費 TTS
│  │  │  └─ project/[id]/…       compose 合成、stock-fill 自動配畫面、subtitle 匯出、
│  │  │                          script-judge 毒舌判官、gate 發布門禁、qc 質檢、cover 封面、
│  │  │                          export-platform 多平台匯出、storyboard-grid 九宮格…
│  │  ├─ project/new, project/[id]/script|assets|video|export   主要流程頁
│  │  ├─ batch/                  批量出片
│  │  ├─ products/               商品庫
│  │  └─ settings/               API Key 設定頁（1,411 行）
│  ├─ lib/
│  │  ├─ script-engine/          ★ 腳本引擎：prompts.ts（1,136 行 prompt）、generator.ts、
│  │  │                          hook-patterns、translate、templates/（美妝/食品/家居/服飾/3C）
│  │  ├─ video-composer/         ★ FFmpeg 合成器 composer.ts（964 行）＋封面、片尾卡、卡拉OK字幕、轉場、運鏡、QC
│  │  ├─ providers/              ★ AI 供應商轉接層（7 家生成平台）＋ 10 個素材來源（含本機素材）
│  │  ├─ db/                     Drizzle schema（19 張表）
│  │  ├─ ad-templates.ts         391 款廣告成片模板（5,885 行純資料）
│  │  ├─ ad-compliance.ts        中國《廣告法》違禁詞掃描
│  │  ├─ edge-tts.ts / tts.ts    免費 / 付費配音
│  │  ├─ motion-prompt.ts        圖生影片運鏡提示詞引擎（含商品保真約束）
│  │  ├─ product-ingest.ts       商品頁 HTML 解析
│  │  ├─ subtitle-export.ts      SRT / VTT
│  │  ├─ stores/                 zustand（設定、商品庫、品牌）—— API Key 存瀏覽器 localStorage
│  │  └─ i18n/                   簡中 / 英文介面字串
│  └─ proxy.ts                   /api 的 CORS（只允許 localhost）
├─ mcp/clipforge-mcp.mjs         MCP Server（1,441 行、30 個工具，stdio）
├─ bin/clipforge.mjs             CLI（833 行）
├─ skills/                       clipforge-video、script-judges 兩個 Agent Skill
├─ .claude-plugin/marketplace.json  Claude Code plugin 市集設定
├─ remotion/                     選用：Remotion 動態字卡（不在主建置內）
├─ integrations/infinite-canvas/ 無限畫布外掛節點（未細讀）
├─ electron/                     桌面版殼
├─ drizzle/                      SQLite migration
└─ Dockerfile                    兩階段建置，執行階段裝 ffmpeg
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**(1) 腳本產生（最有價值的部分）**
- 系統 prompt「顶级电商短视频编导」：[src/lib/script-engine/prompts.ts#L14-L41](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/prompts.ts#L14-L41) — AIDA、黃金 3 秒、口語化、商品鏡頭優先用原圖。
- 輸出 JSON 格式與分鏡規則：[prompts.ts#L545-L626](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/prompts.ts#L545-L626) — 每鏡有 `type`（hook/pain_point/product_reveal/demo/social_proof/cta）、`duration`、`voiceover`（約 3 字/秒）、英文生圖 `prompt`、`searchTerms`（給圖庫搜尋）、`characterId`；另有「AI 影片模型拍不出的動作」四禁令、分鏡三硬規則，這段非常實用。
- 商品圖分析 prompt：[prompts.ts#L628](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/prompts.ts#L628)；組 user prompt：[prompts.ts#L726](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/prompts.ts#L726)。
- 呼叫 LLM：[src/lib/script-engine/generator.ts#L338-L362](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/generator.ts#L338-L362) — OpenAI SDK、`temperature 0.8`、`max_tokens 16000`，`completeWithJsonRetry` 解析失敗會把錯誤回丟給模型重試一次；也會檢查弱模型回傳空台詞。
- 圖片視覺分析：[generator.ts#L546-L580](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/generator.ts#L546-L580) — `image_url` 多圖、`detail: "high"`，賣點限 3 條、每條 ≤15 字。

**(2) 商品網址匯入**
- [src/lib/product-ingest.ts#L1-L21](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/product-ingest.ts#L1-L21)（優先序 JSON-LD > OpenGraph > Twitter Card > title；含 `TWD: "NT$"`）、[parseProductFromHtml #L147](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/product-ingest.ts#L147)。
- API：[src/app/api/ingest/product/route.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/app/api/ingest/product/route.ts) — 經 `safeFetch`（SSRF 防護）抓 HTML，上限 3MB、15 秒逾時，下載前 3 張圖。

**(3) 「鎖定商品原圖不變形」**
- 實際做法有兩層：①腳本把商品鏡頭標成 `visualSource: "product_image"`，這種鏡頭直接用原圖、自動配圖時跳過（[stock-fill/route.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/app/api/project/%5Bid%5D/stock-fill/route.ts) 第 150 行）；②要做成動態時，原圖當圖生影片的「首幀」，再加保真約束句（[src/lib/motion-prompt.ts#L154-L158](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/motion-prompt.ts#L154-L158)：「商品的外观、包装、颜色、logo 与文字必须保持完全不变」）。**說白了是 prompt＋首幀約束，不是演算法保證**，最終仍看影片模型表現。
- 圖生影片 API：[src/app/api/ai/video/route.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/app/api/ai/video/route.ts) — 首幀／尾幀／最多 9 張參考圖；**提交後馬上把任務 ID 寫進 `ai_tasks` 表**，輪詢中斷也能續查，避免重複付費（這個設計值得學）。

**(4) 自動配畫面（免費圖庫）**
- 聚合搜尋：[src/lib/providers/stock-registry.ts#L149](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/providers/stock-registry.ts#L149)；評分選片：[src/lib/stock-matcher.ts#L105-L135](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/stock-matcher.ts#L105-L135)；同一實體的分鏡優先用同作者素材：[stock-matcher.ts#L201](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/stock-matcher.ts#L201)。

**(5) 配音**
- 免費：[src/lib/edge-tts.ts#L1-L31](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/edge-tts.ts#L1-L31) — 用 Node 內建 WebSocket 直連微軟 Edge「大聲朗讀」服務（非官方 API，會因 Edge 版本更新回 403，可用 `EDGE_TTS_VERSION` 環境變數修），還能拿到逐字時間戳（做卡拉 OK 字幕）。
- 付費：[src/lib/tts.ts#L1-L12](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/tts.ts#L1-L12)、分派 [#L164-L175](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/tts.ts#L164-L175)；有熔斷器、內容快取（同文字同音色不重複計費）。

**(6) 合成**
- [src/lib/video-composer/composer.ts#L321-L377](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/video-composer/composer.ts#L321-L377)（ComposeConfig：解析度、BGM 音量/淡出/閃避、字幕、價格貼、商品卡）、[composeVideo #L927-L964](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/video-composer/composer.ts#L927-L964) — filtergraph 寫成檔案再用 `execFile` 執行（避開 Windows 指令長度限制）；中文字型偵測 [#L20-L35](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/video-composer/composer.ts#L20-L35)。
- 合成 API 內的配音選擇：[compose/route.ts#L185-L195](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/app/api/project/%5Bid%5D/compose/route.ts#L185-L195) — 沒付費 TTS 就用 `freeTts.voice`（直接傳給 Edge，**沒有白名單檢查**）。

**(7) 合規／發佈包**
- 廣告法違禁詞：[src/lib/ad-compliance.ts#L70-L100](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/ad-compliance.ts#L70-L100)（四類：絕對化用語、醫療/虛假功效、需認證宣稱、虛假緊迫；只警告不阻擋）。
- AIGC 隱式中繼資料：[src/lib/compliance-metadata.ts#L32-L60](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/compliance-metadata.ts#L32-L55)。
- 標題／hashtag／留言話術：[src/lib/publish-pack.ts#L222](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/publish-pack.ts#L222)。

**(8) 毒舌判官**：[src/lib/script-judge.ts#L30](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-judge.ts#L30) — 程式裡其實是 **5 位**（pace 節奏／voice 口語／idea 創意／structure 結構／visual 畫面），README 寫 4 位；一次 LLM 呼叫產出所有判詞＋等長改寫（[buildJudgePrompt #L113](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-judge.ts#L113)）。

**(9) 九宮格分鏡**：[src/lib/storyboard-grid.ts#L38-L60](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/storyboard-grid.ts#L38-L60) — 把 ≤9 個分鏡寫進一張 3×3 圖的 prompt，一次生圖再切格，讓人物/服裝/光線一致。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 帶貨腳本 prompt 組 | [prompts.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/prompts.ts) | templates、hook-patterns、camera-presets（純資料） | 低 | 直接把 SYSTEM_PROMPT＋OUTPUT_FORMAT 改成繁中／台灣用語，丟給 Claude；輸出 JSON 可直接存 Firestore |
| LLM JSON 重試＋清理 | [generator.ts#L147-L330](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/generator.ts#L147-L330) | openai SDK | 低 | `extractJSON`／`completeWithJsonRetry` 可通用於任何「要 LLM 回 JSON」的地方 |
| 商品頁解析 | [product-ingest.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/product-ingest.ts) | 無（純函式） | 低 | 給倉儲 App「貼網址帶入商品名/價/圖」；搭 [ssrf-guard.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/ssrf-guard.ts) 放 Cloud Functions |
| Edge 免費 TTS | [edge-tts.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/edge-tts.ts) | Node 內建 WebSocket＋crypto、tts-cache | 低～中 | 改音色為 `zh-TW-*` 就有台灣腔；只能在 Node 端跑（瀏覽器不行） |
| SRT/VTT 匯出 | [subtitle-export.ts#L34-L98](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/subtitle-export.ts#L34-L98) | 無 | 低 | 分鏡 → 字幕檔，給 CapCut／剪映再修 |
| FFmpeg 合成器 | [composer.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/video-composer/composer.ts) | ffmpeg 執行檔、transitions、motions、safe-zone、compliance-metadata | 中 | 需要有 FFmpeg 的機器（本機或 VPS），Firebase Functions 不適合長時間轉檔 |
| 圖生影片運鏡 prompt | [motion-prompt.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/motion-prompt.ts) | presenters、emotion-acting（純資料） | 低 | 任何 i2v 服務（Kling、Seedance、Veo）都能用這套「運鏡＋保真＋防閃爍」句型 |
| AI 供應商轉接層 | [providers/types.ts#L214-L276](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/providers/types.ts#L214-L276)、[providers/index.ts#L101](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/providers/index.ts#L101) | 各家 HTTP API | 中 | `AIProvider` 介面（generateImage/generateVideo/submitVideoTask/waitForTask）可當你自己的抽象層 |
| 付費任務先落庫 | [ai/video/route.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/app/api/ai/video/route.ts) | DB 表 ai_tasks | 中 | 「先存任務 ID 再輪詢」的模式，避免重複扣款 |
| 免費圖庫聚合 | [stock-registry.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/providers/stock-registry.ts)、[stock-matcher.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/stock-matcher.ts) | 各圖庫 API | 中 | 廣告 B-roll 自動找片 |
| 違禁詞掃描 | [ad-compliance.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/ad-compliance.ts) | 無 | 低 | 架構可沿用，但詞庫要換成台灣法規（食安法、化粧品衛生安全管理法、藥事法、公平法） |
| 391 款廣告模板 | [ad-templates.ts#L69](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/ad-templates.ts#L69) | camera/look/caption presets | 低 | 純資料，可當你自己廣告素材的「配方庫」靈感 |
| 平台規格表 | [platform-specs.ts#L24-L37](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/platform-specs.ts#L24-L37) | 無 | 低 | 加一行蝦皮／FB 規格即可 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **LLM**：全部走 OpenAI 相容協定（`openai` SDK，`baseURL` 可填任何端點）。預設清單見 [src/lib/llm-presets.ts#L25-L39](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/llm-presets.ts#L25-L39)（DeepSeek v4、Kimi、GLM、豆包、OpenAI gpt-5.4、Ollama、Pollinations…）。在 `src/` 全文搜尋 `anthropic|claude`（不分大小寫）**0 筆**：沒有原生 Anthropic SDK。
- **換成 Claude**：可接，但需自己設定、未實測。兩條路：①在設定頁填 OpenRouter（預設已有）並選 Claude 模型；②填 Anthropic 官方的 OpenAI 相容端點。注意：`response_format: json_object` 只對網址符合 `deepseek|openai.com|moonshot|bigmodel.cn|atlascloud|siliconflow|dashscope` 的端點送出（[src/lib/llm-error.ts#L157-L161](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/llm-error.ts#L157-L161)），「關閉思考」參數只對 Pollinations／智譜送出（[generator.ts#L99-L135](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/generator.ts#L99-L135)），所以 OpenRouter 或 Anthropic 端點會收到乾淨的標準參數，相容性應該不錯，但仍需實測；腳本 `max_tokens: 16000` 也要確認模型上限。
- **Prompt 位置**：腳本 `src/lib/script-engine/prompts.ts`、判官 `src/lib/script-judge.ts`、九宮格 `src/lib/storyboard-grid.ts`、運鏡 `src/lib/motion-prompt.ts`、翻譯 `src/lib/script-engine/translate.ts`、發佈文案 `src/lib/publish-pack.ts`。全部是簡體中文＋部分英文。
- **MCP**：[mcp/clipforge-mcp.mjs](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/mcp/clipforge-mcp.mjs) — stdio，是「本機 ClipForge HTTP API 的薄包裝」（必須先把 ClipForge 跑起來）。用 `grep -c '    name: "clipforge_'` 數到 **30 個工具**，例如 `clipforge_create_video`、`clipforge_ingest_product`、`clipforge_product_script`、`clipforge_compose`、`clipforge_gate`、`clipforge_contact_sheet`、`clipforge_export_subtitle`。LLM Key 用環境變數 `CLIPFORGE_LLM_BASE_URL / _API_KEY / _MODEL` 傳入。
- **Claude Code Skills／Plugin**：[skills/clipforge-video/SKILL.md](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/skills/clipforge-video/SKILL.md)（教 agent 走整條出片流程＋11 條硬規則：合成是非同步要輪詢、交付前要跑 gate、要看縮圖表…）、[skills/script-judges/SKILL.md](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/skills/script-judges/SKILL.md)（純文字判官 skill，不需要 ClipForge 也能用）；[.claude-plugin/marketplace.json](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/.claude-plugin/marketplace.json) 讓 `/plugin marketplace add xixihhhh/clipforge` 一次裝 skill＋MCP。注意 marketplace 裡的 MCP 是用 `npx` 從 GitHub Release 下載 tgz 執行（版本 0.9.7 / mcp 0.1.6，比主程式 0.9.12 舊）。
- **生圖／生影片模型**（README 表格＋providers 目錄）：GPT Image 2、Seedream 5.0、Nano Banana 2、FLUX、Seedance 2.5/2.0、Kling、Veo 3.1、Hailuo、Vidu、萬相等。Atlas Cloud 可動態抓 200+ 影片模型。

## 8. 擴充方式與 API

- **HTTP API**：72 個 route，核心流程 `POST /api/ingest/product` → `POST /api/llm/script` → `POST /api/project/[id]/stock-fill` → `POST /api/project/[id]/compose`（再 `GET` 輪詢）→ `GET /api/project/[id]/subtitle?format=srt|vtt`。
- **CLI**：[bin/clipforge.mjs](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/bin/clipforge.mjs)（`create --topic`、`import --file`、`dub --lang`、`cover`、`qc`、`gate`、`credits`…），README 示範接 cron 做「每日自動出一支草稿」。
- **加 AI 供應商**：實作 `AIProvider` 介面後用 `registerCustomProvider()`（[providers/index.ts#L101-L136](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/providers/index.ts#L101-L136)）。
- **加音色**：在 [src/lib/tts-voices.ts#L9-L27](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/tts-voices.ts#L9-L27) 加 `zh-TW-*` 項目即可出現在介面上。
- **加平台規格**：`PLATFORM_SPECS`（見上）。
- **CORS**：[src/proxy.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/proxy.ts) 只放行 localhost，要讓你的網頁 App 跨網域呼叫，可設 `CLIPFORGE_CORS_ORIGINS`。
- **資料庫**：[src/lib/db/schema.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/db/schema.ts) 用 `grep -c sqliteTable(` 數到 19 張表（projects、scripts、assets、ai_tasks、compositions、products、publish_metrics…）。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：2026-03-23 建立、2026-10-26 最後推送、版本 0.9.12，有 CI（lint＋vitest＋build，`.github/workflows/ci.yml`）、Docker 映像發佈、Release 流程。單人作者（xixihhhh）專案，更新頻繁但 bus factor = 1。
- **測試**：139 個 `*.test.ts`（find 計數），涵蓋 SSRF、路徑、TTS、字幕、合成指令等純函式。測試沒執行，品質未實測。
- **資安**：
  - **API 沒有登入／驗證機制**（在 `src` 搜 `password`、`ACCESS_TOKEN` 無相關結果；CORS 只是瀏覽器層防護）。Docker 預設 `HOSTNAME=0.0.0.0`。**千萬不要直接公開到網路上**，只在自己電腦或內網用。
  - API Key 存在瀏覽器 localStorage（桌面版存 JSON 檔），每次呼叫隨請求送到後端（[persistent-storage.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/stores/persistent-storage.ts)、[ai/video/route.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/app/api/ai/video/route.ts) 的 `apiKey` 參數）。
  - 有做 SSRF 防護（[ssrf-guard.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/ssrf-guard.ts)）與檔案路徑穿越檢查（[files route](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/app/api/files/%5B...path%5D/route.ts) 第 21–26 行）。
- **遙測**：在 `src`、`electron` 搜 posthog/sentry/gtag/umami/plausible/telemetry，只命中 Atlas 供應商目錄相關檔案（字串層級），**沒看到第三方分析 SDK**。素材與資料都在本機。
- **已知的坑**：
  - Edge TTS 是非官方介面，微軟換版本就會 403（程式註解自己承認）。
  - 全部介面、prompt、合規規則都以**中國大陸平台與法規**為準（抖音規則、GB 45438-2025、《廣告法》），台灣用要重寫詞庫與 prompt 用語。
  - 字幕直接用腳本台詞，腳本是簡體就是簡體字幕；**沒有簡轉繁**（搜 opencc／繁体 0 筆）。
  - README 與程式不一致：判官 4 位 vs 程式 5 位；plugin 內 MCP 版本落後。
  - 「商品保真」本質是 prompt＋首幀，影片模型仍可能改字、改 logo。
  - 主程式 65,705 行、功能極多，整套改造成本高；建議只拆零件。

## 10. 跟其他專案組合的建議

- **A（你的倉儲 App, Firebase）＋ ClipForge 零件**：在商品頁加一顆「產生短影片腳本」按鈕 → 用 Cloud Functions 呼叫 Claude，prompt 採用 `prompts.ts` 的結構（改繁中）→ 腳本 JSON 存 Firestore。影片合成交給一台裝 ClipForge 的電腦，經 HTTP API 或 MCP 觸發。這樣你的 App 程式碼不碰 AGPL 程式碼本體（僅呼叫服務），授權界線較清楚。
- **＋ 短劇類專案（例如同分類的 huobao-drama、ViMax）**：ClipForge 強在「商品＋帶貨＋合成＋合規」；長篇短劇分集、角色一致性管理可能別的專案更完整，可以把 ClipForge 的 `composer.ts`、`edge-tts.ts` 當最後一哩合成器。
- **＋ 網頁試算表專案**：ClipForge 的 batch（批量出片）頁可以改成「從試算表一列一商品」匯入：商品名、價格、賣點欄位 → 呼叫 `/api/ingest/product` 或直接建 project。
- **＋ 價格／ERP 類專案**：ClipForge 沒有成本計算，但 `products` 表與 `publish_metrics`（回填播放/成交）可以跟你的進貨成本表接起來，算「每支影片帶來的毛利」。

## 11. 影片／腳本流程檢查表

| 項目 | 有／沒有／未確認 | 程式碼位置與說明 |
|---|---|---|
| 輸入：主題 | 有 | [prompts.ts#L905](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/prompts.ts#L905) `TOPIC_SYSTEM_PROMPT`，5 種旁白風格 |
| 輸入：商品圖／商品網址 | 有 | `analyzeProduct`（[generator.ts#L546](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/generator.ts#L546)）、`product-ingest.ts` |
| 輸入：自帶腳本 | 有 | `src/app/api/project/[id]/import-script`、CLI `import --file`（README） |
| 輸入：小說 | 沒有 | 沒有長文本分集功能 |
| 腳本 | 有 | `prompts.ts`＋`generator.ts`，一次 3 套、10 種風格 |
| 分鏡 | 有 | 腳本 JSON 本身就是分鏡（5–8 鏡、15–30 秒）；九宮格 `storyboard-grid.ts` |
| 畫面：素材庫 | 有 | `StockSourceId` 共 10 種（pexels、pixabay、openverse、wikimedia、local、nasa、archive、coverr、jamendo、freesound，見 `src/lib/providers/stock-types.ts` 第 10–20 行），Openverse／Wikimedia 免 Key |
| 畫面：AI 生圖 | 有（付費） | `src/app/api/ai/image`，7 家供應商 |
| 畫面：AI 生影片 | 有（付費） | [ai/video/route.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/app/api/ai/video/route.ts)，首尾幀＋參考圖 |
| 畫面：程式繪製 | 有 | FFmpeg 靜圖運鏡（`motions.ts`）、字卡、封面、片尾卡；選用 Remotion 動態字卡（`remotion/`，需另裝約 300MB） |
| 配音：TTS | 有 | Edge 免費（[edge-tts.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/edge-tts.ts)）＋ 4 種付費（[tts.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/tts.ts)） |
| 配音：聲音複製 | 未確認 | 沒看到自有聲音複製流程；MiniMax／fal 付費 TTS 是否可用自訂 voice_id 未查 |
| 字幕 | 有 | drawtext 燒錄＋卡拉 OK（ASS）＋ SRT/VTT 匯出（`subtitle-export.ts`） |
| 配樂 | 有 | [free-bgm.ts#L59](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/free-bgm.ts#L59)：Jamendo（需 Key）或 Wikimedia 免 Key，旁白閃避（sidechain） |
| 合成 | 有 | [composer.ts#L927](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/video-composer/composer.ts#L927)，H.264、CRF 18、720p/1080p、9:16/16:9/1:1 |
| 輸出 | 有 | 多平台匯出（`platform-specs.ts`）、封面、GIF 預覽、小紅書圖卡、OTIO 時間軸 |
| 每步模型與成本 | 部分 | 腳本：任意 OpenAI 相容 LLM（約幾毛錢台幣，未實測）；素材/配音/合成：免費路線 0 元；AI 生圖/影片：依模型按次或按秒計，程式從 Atlas 目錄即時讀價格，**具體金額未確認** |
| 繁中字幕 | 沒有（需改） | 無簡轉繁；用繁中 LLM prompt 產出繁中台詞即可解（字幕取自台詞） |
| 台灣口音配音 | 可改、未實測 | 介面清單只有 `zh-CN` 五個音色（[tts-voices.ts#L9-L27](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/tts-voices.ts#L9-L27)）；但合成 API 直接把 `freeTts.voice` 傳給 Edge、沒白名單（[compose/route.ts#L185-L195](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/app/api/project/%5Bid%5D/compose/route.ts#L185-L195)），傳 Edge 的台灣音色名稱理論上可用 |
| Claude 怎麼用 | 有 MCP＋Skill；LLM 只能接 OpenAI 相容介面 | `mcp/clipforge-mcp.mjs`（30 工具）、`skills/`、`.claude-plugin/`；無 Anthropic SDK |
| 個人電腦能跑嗎 | 能 | CPU 即可（FFmpeg）；Whisper 轉寫在瀏覽器（WebGPU/WASM）；AI 生成全靠雲端 API；GPU／記憶體需求官方未列，未確認 |
| 最適合做 | 電商商品影片＞廣告素材＞帶貨短劇＞解說影片 | 主場景就是「一張商品圖 → 帶貨短片」；短劇是帶貨情境劇，不是長篇連續劇 |
| 法律風險 | 有需注意 | ①CC 素材要署名（程式有 credits 清單）；②AI 生成人臉／「素人主播」不可冒充真人使用心得（台灣《公平交易法》不實廣告、《食品安全衛生管理法》《化粧品衛生安全管理法》功效宣稱限制，程式內建詞庫只針對中國法規）；③Edge TTS 屬非官方使用，微軟條款風險未確認；④各平台（Meta、蝦皮、TikTok）對 AI 生成內容的標示要求要自行確認；⑤用別人的商品頁圖片可能涉及著作權 |

## 關鍵字
ClipForge、带货剪手、daihuo-jianshou、帶貨短影片、電商短影片、商品圖轉影片、AI 腳本、種草腳本、分鏡、圖生影片、image-to-video、i2v、Seedance、Kling、GPT Image 2、商品保真、Edge TTS、免費配音、台灣口音、繁中字幕、SRT、FFmpeg、影片合成、免費圖庫、Openverse、Pexels、BGM、MCP、Claude Code Skill、plugin、OpenAI 相容、OpenRouter、Next.js、SQLite、Drizzle、Electron、Docker、AGPL-3.0、廣告違禁詞、AIGC 標示、短劇帶貨、批量出片、蝦皮、Instagram Reels、TikTok Shop、抖音
