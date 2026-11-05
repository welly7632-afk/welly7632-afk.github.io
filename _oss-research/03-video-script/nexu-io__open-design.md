# nexu-io/open-design — 讓 Claude Code 等程式代理在本機當「設計師＋剪輯師」的 AI 設計工作區（網頁原型、簡報、生圖、HTML→MP4 動態影片）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：e7a18df
> GitHub：https://github.com/nexu-io/open-design｜⭐ 105898｜授權：Apache-2.0（另含多個第三方授權的範本／素材）｜主要語言：TypeScript｜最近更新：2026-11-04

（以下 `P/` 代表 permalink 前綴 `https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/`，內文連結都是完整網址。這個 repo 含歷史約 3.5GB，本次只 sparse checkout 了 `apps/daemon/src/`、`skills/`、`design-templates/hyperframes/`、`plugins/_official/scenarios/`、兩個影片範本、`plugins/spec/`、根目錄文件與各 `package.json`；`apps/web`（前端 2,512 個檔案）只看了 `package.json`，沒有逐檔讀。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：OpenDesign 本身「不內建 AI 模型」，它是一個本機常駐的 Node.js 服務（daemon）＋ Next.js 網頁／Electron 桌面介面，負責把你電腦上已安裝的程式代理（Claude Code、Codex、Cursor 等 27 種）叫起來，餵給它一大包「設計規範 `DESIGN.md`＋技能 `SKILL.md`＋範本」，讓代理產出單檔 HTML 原型、簡報（可匯出 PPTX／PDF）、圖片、以及用 HTML+GSAP 寫的動態影片（再用 HyperFrames＋FFmpeg 轉成 MP4）。

**對你（台灣電商＋投廣告＋已經在用 Claude 寫 JS 網頁）實際能做什麼：**
- **廣告素材／商品宣傳動態影片（最適合）**：用 HyperFrames 範本（例如 30 秒產品宣傳片 `frame-product-promo-30s`）把「痛點 → 品牌露出 → 賣點流程 → CTA」做成可精準控制文字、價格、Logo 的 MP4。這種「程式繪製」影片的好處是**文字不會糊、價格數字不會被 AI 亂改**，很適合價格促銷、新品上市、比價圖卡類短片。
- **電商商品圖組**：`ecommerce-image-workflow` 技能要求你上傳真實商品照，產出主圖／賣點圖／情境圖三張，並附 `image-manifest.json`（要另外接生圖 API，例如 gpt-image-2、Nano Banana、Seedream）。
- **AI 影片片段**：透過火山引擎（Seedance 2.0）、OpenRouter、fal.ai、xAI Grok、MiniMax 等 API 做文生影片／圖生影片（商品圖當首影格），9:16 直式比例有支援。
- **配音／音效**：MiniMax、ElevenLabs、FishAudio（含聲音複製）、OpenAI TTS 等 API；HyperFrames 文件另有本機 Kokoro TTS＋whisper.cpp 字幕流程。
- **把它當「技能庫」偷學**：169 個 `skills/*/SKILL.md`、115 個設計範本、152 套設計系統、63 個影片範本與 58 個影片 prompt 範本，全部是純文字，可直接搬進你自己的 Claude Code `.claude/skills/` 使用。
- **跟你最在意的「網頁版 Excel」無關**：全 repo 檔名搜尋 `xlsx／spreadsheet／sheet`（排除 stylesheet、spritesheet 等）沒有任何試算表元件；只有「Live dashboard／KPI 牆」類的 HTML 單頁儀表板範本，可以拿來做「價格看板」的外觀，但不是可編輯的表格。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **主程式授權：Apache-2.0**（[LICENSE](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/LICENSE)，根目錄 `package.json` 的 `license` 欄位也是 `Apache-2.0`）。
- **個人使用**：完全可以，自由修改、自由使用。
- **公司商用**：可以商用、可以改了不公開原始碼；義務是保留 LICENSE 與 NOTICE／著作權聲明、修改過的檔案要註明有修改。Apache-2.0 另附專利授權條款（若你告別人專利侵權，你的授權會終止）。
- **要特別注意的「混裝」授權**（重點）：
  - 影片範本 `frame-product-promo-30s` 標示 **MIT**、作者 Nate Herk（[SKILL.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/plugins/_official/video-templates/frame-product-promo-30s/SKILL.md)）。
  - Seedance 短劇 prompt 範本標示 **CC-BY-4.0**（[template.json](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/plugins/_official/video-templates/seedance-2-0-15-second-cinematic-japanese-romance-short-film/template.json)），商用要標示出處。
  - README 寫明 HyperFrames 範本縮圖「© HeyGen」、框架本身 Apache-2.0；`guizang-ppt` 簡報範本「保留原授權」。
  - 設計系統（Stripe、Apple、Nike、Shopify…等 152 套）來自 `VoltAgent/awesome-design-md`（MIT）等，[design-systems/README.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/design-systems/README.md#L129-L142) 明講「只是美學靈感，不是那些品牌的官方資產」——**拿來做你自己品牌的東西時不要照抄別人的商標／Logo**。
  - `skills/` 中很多是「目錄條目」，例如 `ad-creative` 只是指向上游 `coreyhaines31/marketingskills` 的介紹，完整內容要去上游另行安裝、授權依上游而定（[ad-creative/SKILL.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/skills/ad-creative/SKILL.md)）。
- **付費／雲端功能**：有「OpenDesign Cloud／AMR（程式內代號 Vela）」託管服務。`media/models.ts` 中標 `vela/...` 的生圖／生影片模型（如 `vela/gpt-image-2`、`vela/doubao-seedance-2-0-260128`）以及「圖庫搜尋」（`media/stock-search.ts` 註解寫 Company-managed stock search through Vela）都走官方雲端；README 開頭寫 Go 方案首月 $8 美元（促銷）。**開源部分不靠雲端也能用（自備 API Key＝BYOK）**，但雲端的定價、額度程式碼中沒有，未確認。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容（出處） |
|---|---|
| 前端 | Next.js 16 App Router＋React 18＋TypeScript（README Architecture 表）；`apps/web/package.json` 依賴含 `@anthropic-ai/sdk`、`openai`、`@excalidraw/excalidraw`、`lexical`、`three`、`jspdf`、`posthog-js` |
| 後端 daemon | Node 24、Express、SSE 串流、`better-sqlite3`；依賴含 `@modelcontextprotocol/sdk`、`hyperframes`、`gsap`、`@ffmpeg-installer/ffmpeg`、`pptxgenjs`、`pdf-lib`、`node-pty`、`posthog-node`（`apps/daemon/package.json`） |
| 資料庫 | SQLite（`better-sqlite3`），專案檔案存在本機資料夾 |
| 桌面 | Electron（macOS Apple Silicon/Intel、Windows x64 有安裝檔；Linux 目前無官方安裝檔，需從原始碼或 Docker） |
| 部署 | 桌面安裝檔／`pnpm tools-dev run web` 從原始碼跑（Node `~24`、pnpm `10.33.x`）／`deploy/` 下 Docker Compose（預設 `http://127.0.0.1:7456`，需設 `OD_API_TOKEN`）／Sealos 一鍵部署 |
| GPU | **不需要**。AI 都是呼叫外部程式代理或雲端 API；HyperFrames 渲染用無頭瀏覽器逐格截圖＋FFmpeg 編碼，CPU 即可（一般 60–120 秒，程式註解 [media/index.ts L4219-L4229](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L4219-L4229)） |
| 文字／程式 AI | 二選一：(a) 你電腦已登入的 CLI（如 Claude Code，用你的 Claude 訂閱或 API 額度）；(b) BYOK 代理 `POST /api/proxy/{anthropic,openai,azure,google,ollama,...}/stream`，填 `baseUrl＋apiKey＋model` |
| 影像／影片／聲音 API | 各自的 Key：OpenAI、火山引擎 Ark（`ARK_API_KEY`）、MiniMax（`OD_MINIMAX_API_KEY`）、ElevenLabs、FishAudio、fal、OpenRouter、Google（Nano Banana）、xAI 等 |
| 費用 | 程式碼中沒有價目表，**每秒影片／每張圖的實際價格未確認**；開源本身免費，花費全在你選的 API 或訂閱。Stub（假資料）供應商可零成本測流程。 |

注意：在 OpenDesign 裡要把 HyperFrames 轉成 MP4，**預設需要桌面版的 Electron 影格渲染器**；純 daemon（Docker／網頁版）要另外設 `HYPERFRAMES_BROWSER_PATH` 指定瀏覽器，否則會丟錯「desktop frame renderer is unavailable」（[media/index.ts L3948-L3967](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L3948-L3967)）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

檔案數用 `git ls-tree -r --name-only HEAD | cut -d/ -f1 | sort | uniq -c` 計算，總計 14,227 個檔案。

```
open-design/
├── apps/                    (4,599 檔)
│   ├── daemon/              本機服務（Express+SQLite），核心邏輯全在這
│   │   └── src/
│   │       ├── server.ts            主伺服器（18,962 行）
│   │       ├── cli.ts               `od` 指令列（13,002 行；od media / od plugin / od mcp ...）
│   │       ├── mcp.ts               stdio MCP 伺服器（3,601 行，22 個工具）
│   │       ├── runtimes/            27 種程式代理的啟動定義與串流解析
│   │       │   ├── defs/claude.ts   Claude Code 怎麼被呼叫
│   │       │   └── claude-stream.ts 解析 claude stream-json 輸出
│   │       ├── media/               生圖／生影片／TTS 分派器、HyperFrames 渲染
│   │       │   ├── index.ts         generateMedia＋各供應商 render 函式（4,432 行）
│   │       │   ├── models.ts        供應商與模型清單（26 家供應商）
│   │       │   ├── hyperframes-audio.ts  音軌 → FFmpeg 混音
│   │       │   ├── hyperframes-scaffold.ts 空白影片專案骨架
│   │       │   ├── stock-search.ts  雲端圖庫搜尋（Vela）
│   │       │   └── yt-dlp.ts        貼影片連結時自動下載 yt-dlp
│   │       ├── media-adapters/      影片請求格式（Seedance/Wan/Veo/Sora）純函式
│   │       ├── prompts/             系統提示詞組裝（system.ts 2,239 行、media-contract.ts）
│   │       ├── routes/              HTTP API（chat.ts 含 BYOK 代理、media.ts）
│   │       ├── skills.ts            掃描 SKILL.md 的技能註冊表
│   │       ├── collab/ plugins/ design-systems/ live-artifacts/ critique/ ...
│   ├── web/                 Next.js 前端（2,512 檔，本次未逐檔讀）
│   └── desktop/             Electron 外殼
├── skills/                  169 個功能技能（SKILL.md）
├── design-templates/        115 個渲染範本（含 hyperframes/ 影片技能＋字幕、TTS 參考文件）
├── design-systems/          152 套 DESIGN.md 設計系統（部分附 tokens.css、zh-tw 版）
├── plugins/_official/       479 個 open-design.json 外掛（影片範本 63、圖片範本 45、情境 13…）
├── prompt-templates/        106 個 JSON prompt（image 49 檔、video 58 檔，含少數非 json）
├── packages/                contracts（共用型別）、plugin-runtime、sidecar 等
├── deploy/                  Docker Compose
├── e2e/ (389 檔)、tools/、docs/、specs/
└── PRIVACY.md / AGENTS.md / CLAUDE.md
```

（skills 169＝`skills/<名稱>/SKILL.md` 的數量；design-templates 115、design-systems 152、video-templates 63 也都是用同樣方式從檔案清單 `grep -cE` 數出來。README 自稱「100+ skills、151 design systems、277 official plugins」，與我的計數口徑不同。）

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

1. **叫起 Claude Code 當設計代理** → [runtimes/defs/claude.ts L58-L126](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/runtimes/defs/claude.ts#L58-L126)
   - 執行 `claude -p --input-format stream-json --output-format stream-json --verbose`，prompt 從 stdin 送（避開命令列長度上限），用 `--resume`／`--session-id` 延續對話記憶，`--add-dir` 加入允許的資料夾。
   - **固定加 `--permission-mode bypassPermissions`**（L116）：代理在專案資料夾內可不經詢問執行任何指令。
   - 會先跑 `claude -p --help` 偵測版本支援哪些旗標，再決定要不要加 `--include-partial-messages`、`--thinking-display summarized`。
   - 外部 MCP 伺服器會寫進專案 cwd 的 `.mcp.json` 讓 Claude Code 自動載入。

2. **統一媒體生成分派** → [media/index.ts L351](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L351)（`generateMedia`）＋ [routes/media.ts L1291](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/routes/media.ts#L1291)（`POST /api/projects/:id/media/generate`）
   - 代理不是用自訂工具，而是在 shell 執行 `od media generate --surface video --model ... --output xxx.mp4`；daemon 依（surface, model）找供應商、拿 Key、呼叫 API、把檔案寫回專案資料夾。
   - 長任務回傳 `taskId`，代理用 `od media wait <taskId>` 每次最多 25 秒輪詢，避免 shell 工具 30 秒逾時（寫在 [design-templates/hyperframes/SKILL.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/design-templates/hyperframes/SKILL.md)）。
   - 沒整合的供應商會退回 stub（假圖、靜音 wav），回應會標示，避免代理把假資料當真。

3. **模型／供應商清單** → [media/models.ts L33-L221](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/models.ts#L33-L221)
   - 26 家供應商，`integrated: true` 18 家、`false` 8 家（ComfyUI、BFL、Replicate、Google 直連、Kling 直連、Midjourney、Suno、Udio）——用 `grep -c "integrated: true/false"` 數的。
   - **配樂預設 `suno-v5` 但 Suno 標為未整合**，所以「AI 生配樂」實際上不能直接用；Veo／Kling 要經 fal 或 OpenRouter 才可用。
   - 比例 `1:1、16:9、9:16、4:3、3:4`；影片長度 3／5／8／10／15／30 秒（L223-L225）。

4. **Seedance 圖生影片（商品圖 → 影片）** → [media/index.ts L1463-L1594](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L1463-L1594)
   - 在 prompt 尾端自動補 `--resolution 720p --duration N --ratio 9:16` 旗標；有參考圖時加一個 `image_url`（data URL）當首影格；建立任務後輪詢到完成，再下載影片。

5. **HyperFrames：HTML → MP4** → [media/index.ts L3880-L3983](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L3880-L3983)、[encodeHyperFramesMp4 L4146-L4203](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L4146-L4203)、[runHyperFramesRender L4230-L4319](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L4230-L4319)
   - 影片專案＝一個資料夾（`hyperframes.json`、`meta.json`、`index.html`），`index.html` 用 `data-start／data-duration` 標時間、`window.__timelines["main"] = gsap.timeline({paused:true})` 寫動畫。
   - 檢查路徑不能跳出專案資料夾；逐格截圖後用 FFmpeg `libx264 yuv420p +faststart` 編碼，5 分鐘逾時。
   - 骨架產生器 [hyperframes-scaffold.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/hyperframes-scaffold.ts)：1920×1080、從 jsDelivr 載 GSAP 3.14.2。

6. **影片音軌混音（配音＋配樂＋音效）** → [hyperframes-audio.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/hyperframes-audio.ts)
   - 用 cheerio 讀 HTML 裡的 `<audio src data-start data-duration data-volume>`，最多 32 軌；組 FFmpeg `filter_complex`（`atrim → adelay → amix`，結尾自動淡出 ≤0.6 秒，AAC 192k）。**這段 80 行很好拆**。

7. **TTS（以 MiniMax 為例）** → [media/index.ts L2777-L2883](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L2777-L2883)
   - 呼叫 `/t2a_v2`，預設聲音 `male-qn-qingse`（普通話男聲），可帶 `language_boost`；回傳 hex 音訊轉 mp3。

8. **系統提示詞組裝** → [prompts/system.ts L899](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/prompts/system.ts#L899)（`composeSystemPrompt`）＋ [prompts/media-contract.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/prompts/media-contract.ts)
   - 把「設計師角色 → 技能 SKILL.md → DESIGN.md → 媒體合約」疊起來；媒體合約放最後確保優先；失敗時代理只能依 `error.nextStep`（9 種固定值，如 `switch-model`、`retry-later`）決定下一步，不准在回覆中暴露供應商名稱、路徑等內部細節。

9. **BYOK 代理（不用 CLI 也能跑）** → [routes/chat.ts L986-L1030](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/routes/chat.ts#L986-L1030)
   - `POST /api/proxy/anthropic/stream` 直接打 `/messages`（`anthropic-version: 2023-06-01`），先過 `validateExternalApiBaseUrl` 擋內網 IP（SSRF 防護）。

10. **媒體情境流程（討論 → 規劃 → 生成 → 自評迴圈）** → [od-media-generation/SKILL.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/plugins/_official/scenarios/od-media-generation/SKILL.md)
    - `discovery → plan → generate → critique`，critique 分數 ≥4 或 3 輪就停。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| FFmpeg 多音軌混音參數產生器 | [media/hyperframes-audio.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/hyperframes-audio.ts) | cheerio、FFmpeg | 低 | 改成吃 JSON 音軌清單，給任何「配音＋BGM＋音效」合成用 |
| HTML 影格 → MP4 編碼 | [media/index.ts L4146-L4203](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L4146-L4203) | `@ffmpeg-installer/ffmpeg` | 低 | 搭配 Puppeteer 截圖就能做自己的「網頁轉影片」 |
| HyperFrames 影片技能＋字幕／TTS 文件 | [design-templates/hyperframes/](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/design-templates/hyperframes/SKILL.md)、[references/captions.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/design-templates/hyperframes/references/captions.md) | HyperFrames CLI（HeyGen 開源） | 低 | 直接放進 `.claude/skills/hyperframes/`，讓 Claude Code 寫 GSAP 動畫影片 |
| 30 秒產品宣傳片範本 | [frame-product-promo-30s/](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/plugins/_official/video-templates/frame-product-promo-30s/template.json) | HyperFrames、GSAP | 低 | 換文案／商品截圖／Logo 即可產出廣告片（MIT，記得標示作者） |
| 媒體供應商／模型清單 | [media/models.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/models.ts) | 無 | 低 | 當成自己工具的「模型下拉選單」資料來源 |
| 影片請求格式轉換（Seedance/Wan/Veo/Sora） | [media-adapters/video.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media-adapters/video.ts) | 純函式 | 低 | 一份程式碼對多家影片 API 送正確的 body |
| 各供應商 render 函式（Seedance、MiniMax TTS、ElevenLabs、fal 佇列…） | [media/index.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts) | fetch | 中 | 每個函式都是「建任務→輪詢→下載」，抄單一函式到 Firebase Functions 就能用；要移除 `MediaContext` 等內部型別 |
| 電商商品圖組技能 | [skills/ecommerce-image-workflow/SKILL.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/skills/ecommerce-image-workflow/SKILL.md) | 任一生圖 API | 低 | 純 prompt 流程，放進 Claude Code 技能資料夾 |
| Claude Code 無頭呼叫參數 | [runtimes/defs/claude.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/runtimes/defs/claude.ts) | Claude Code CLI | 中 | 自己的 Node 後端要「叫 Claude Code 幹活」時照抄參數組合（但請不要照抄 bypassPermissions） |
| stdio MCP 伺服器樣板 | [mcp.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/mcp.ts) | `@modelcontextprotocol/sdk` | 中 | 學它「MCP 只轉呼叫 HTTP API、自己不存狀態」的寫法，替你的倉儲系統做 MCP |
| 設計系統 DESIGN.md | [design-systems/default/](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/design-systems/default/DESIGN.md) | 無 | 低 | 為你的倉儲 App 寫一份自己的 DESIGN.md，讓 Claude 改 UI 時風格一致 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **Claude 是一等公民（原生）**：三種接法都有。
  1. **OpenDesign 叫 Claude Code**：`runtimes/defs/claude.ts`，備選模型清單含 `sonnet／opus／haiku／fable` 別名與 `claude-opus-5`、`claude-sonnet-5` 等（L6-L18）。
  2. **Claude Code 叫 OpenDesign（MCP）**：`od mcp install claude` 會產生 `claude mcp add-json` 指令；MCP 伺服器提供 22 個工具（用 `grep -n "name: '"` 在 [mcp.ts L365-L846](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/mcp.ts#L365-L846) 數出：`collect_brief`、`list_projects`、`get_file`、`write_file`、`create_artifact`、`list_skills`、`list_plugins`、`start_run`、`get_run`、`cancel_run`…）。其中 `start_run` 會讓 OpenDesign 再起一個代理去做設計。
  3. **Anthropic API 直連（BYOK）**：`/api/proxy/anthropic/stream`。
- **Skills**：`skills/`、`design-templates/` 都是 Agent Skills 的 `SKILL.md` 格式，[skills.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/skills.ts) 掃描 frontmatter 建清單；使用者匯入的技能可覆蓋同名內建技能。
- **Prompt 位置**：`apps/daemon/src/prompts/`（10 個檔案、合計 4,675 行，`wc -l` 計）；影片 prompt 範本在 `prompt-templates/video/` 與 `plugins/_official/video-templates/*/template.json`。
- **影像／影片／聲音模型**：不是 Claude 做的，Claude 只負責寫腳本、HTML 動畫和下指令；實際生成走 OpenAI、Seedance、Veo、Kling、Sora、MiniMax、ElevenLabs 等（見第 5 節第 3 點）。

## 8. 擴充方式與 API

- **外掛**：資料夾＋`SKILL.md`（必要）＋`open-design.json`（上架卡片、inputs、capabilities），規格見 [plugins/spec/SPEC.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/plugins/spec/SPEC.md)；CLI：`od plugin scaffold／validate／install／apply`，全部支援 `--json`。
- **設計系統**：把 `DESIGN.md` 丟進 `design-systems/<品牌>/` 就會被偵測。
- **HTTP API**（daemon，預設只綁 127.0.0.1）：`/api/skills`、`/api/design-templates`、`/api/plugins`、`/api/chat`（SSE）、`/api/projects/:id/files/...`、`/api/projects/:id/media/generate`、`/api/media/tasks/:id/wait`、`/api/proxy/:provider/stream`。媒體生成路由會檢查 `isLocalSameOrigin`，外部網頁不能直接呼叫。
- **新增程式代理**：在 `runtimes/defs/` 加一個 `RuntimeAgentDef`，再到 [runtimes/registry.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/runtimes/registry.ts) 登記；也支援讀本機 profile（`readLocalAgentProfileDefs`）。
- **新增媒體供應商**：在 `media/models.ts` 加供應商與模型，再在 `media/index.ts` 寫對應的 `renderXxx` 函式；註解說前端另有一份 `models.ts` 要手動同步。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護非常活躍**：2026-04-28 建立，半年內 10 萬星；`package.json` 版本 0.25.1；CHANGELOG 寫 0.9.0 版一週 310 個 PR、88 位貢獻者。因為是淺層 clone，提交次數未計算。
- **測試**：檔名符合 `*.test.(ts|tsx|mjs|js)` 的有 3,025 個，另有 `e2e/` 389 個檔案（從檔案清單計數，未執行）。
- **超大型單檔**：`server.ts` 18,962 行、`cli.ts` 13,002 行、`media/index.ts` 4,432 行，要拆東西得自己挖。
- **變動太快**：一天內就可能改 API／欄位，抄程式時請鎖定 commit。
- **資安**：
  - Claude Code 被以 `--permission-mode bypassPermissions` 啟動，代理在專案資料夾內有完整執行權；請只在你信任的資料夾使用，不要把倉儲 App 的正式金鑰放在同一個專案裡。
  - 優點：daemon 預設綁 127.0.0.1、BYOK 代理有 SSRF 防護、HyperFrames 路徑與音軌都限制不能跳出專案資料夾。
  - 第一次貼影片連結會自動從 GitHub 下載 yt-dlp（有固定 SHA-256 校驗，[yt-dlp.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/yt-dlp.ts)）。
- **遙測／隱私**（[PRIVACY.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/PRIVACY.md)）：官方版產品分析**預設開啟（opt-out）**，首次啟動會跳橫幅讓你選「Share／Don't share」；可選擇是否分享「對話與工具內容」（prompt、回覆，有截斷與遮蔽）；另有一個「安全與可靠性遙測」**無法關閉**。送到 PostHog（`analytics.ts` 預設 `https://us.i.posthog.com`）；從原始碼自建、沒有設 `POSTHOG_KEY` 的版本兩者都不送。
- **已知的坑**：Suno 配樂未整合；HyperFrames 渲染在 Docker／純網頁版需另設瀏覽器路徑；Linux 沒有桌面安裝檔；macOS 的 `od` 指令會和系統內建 `/usr/bin/od` 撞名（README 有說明）。

## 10. 跟其他專案組合的建議

- **＋ ViMax／huobao-drama 類「劇本 → 分鏡」專案**：它們負責短劇的故事、角色一致性與分鏡 JSON，OpenDesign 的 `media-adapters/video.ts`＋Seedance render 負責把每一鏡送去生影片，最後用 `hyperframes-audio.ts` 的 FFmpeg 混音把配音、BGM 合起來。
- **＋你自己的倉儲／比價 App（Firebase、純 JS）**：從倉儲資料庫拉「商品名、售價、促銷價、商品圖」→ 填進 `frame-product-promo-30s` 的 HTML → 用 HyperFrames 轉 MP4，就是**批次產生價格促銷短片**的流程，數字 100% 正確（因為是程式畫的，不是 AI 生的）。
- **＋網頁版 Excel 專案（如 Univer、Luckysheet、x-spreadsheet 類）**：OpenDesign 沒有試算表能力；試算表那一塊請從 01-web-excel 分類的資料包挑，OpenDesign 只適合拿來產生「報表／儀表板外觀」的 HTML 或把試算表資料做成動態圖表影片（`frame-data-chart-nyt`、`data-in-motion.md`）。
- **只想要技能，不想裝整套**：把 `design-templates/hyperframes/`、`skills/ecommerce-image-workflow/`、你喜歡的 `design-systems/<x>/DESIGN.md` 複製到自己專案的 `.claude/skills/`，用 Claude Code 直接跑，最輕量。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有／未確認 | 程式碼位置與說明 |
|---|---|---|
| 輸入：主題／文字 brief | 有 | MCP `collect_brief`／`start_run`（[mcp.ts L365](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/mcp.ts#L365)）；情境流程先跑 discovery 問卷。 |
| 輸入：商品圖 | 有 | `generateMedia` 的 `image／images` 參數，Seedance 當首影格（[media/index.ts L1484-L1495](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/index.ts#L1484-L1495)）。 |
| 輸入：小說長文 | 沒有專門流程 | 只能當一般 prompt 給代理，沒有拆章節／角色表的程式。 |
| 輸入：現有影片連結 | 有 | yt-dlp 自動下載（[yt-dlp.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/yt-dlp.ts)）、`skills/youtube-clipper`。 |
| 腳本 | 有（靠 LLM） | 由程式代理（Claude 等）依 SKILL.md 寫；`video-hyperframes` 技能規定「第 1 幀 hook、中間論證、最後 CTA」（[skills/video-hyperframes/SKILL.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/skills/video-hyperframes/SKILL.md)）。 |
| 分鏡 | 部分有 | HyperFrames 以 `data-start／data-duration` 分場；Seedance prompt 範本用「0-4 秒：…」時間碼寫分鏡；沒有獨立的分鏡資料結構。 |
| 畫面：程式繪製 | 有（主力） | HTML＋CSS＋GSAP → MP4（第 5 節第 5 點）。 |
| 畫面：AI 生圖 | 有 | OpenAI gpt-image、Seedream、Nano Banana、MiniMax、fal FLUX、Leonardo 等，需付費 API。 |
| 畫面：AI 生影片 | 有 | Seedance 2.0（火山引擎／OpenRouter／雲端）、Veo 3.x、Kling、Wan、Sora 2（經 fal／OpenRouter）、Grok、MiniMax Hailuo；全是雲端付費，價格未確認。 |
| 畫面：素材庫 | 部分有 | 圖庫搜尋只走官方雲端 Vela（[stock-search.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/stock-search.ts)），開源自架無法單獨使用。 |
| 配音 TTS | 有 | 雲端：MiniMax（預設）、ElevenLabs、FishAudio、SenseAudio、豆包、OpenAI、xAI；本機：HyperFrames 文件寫 Kokoro-82M（CPU、免 Key，需自裝 Python `kokoro-onnx`）（[tts.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/design-templates/hyperframes/references/tts.md)）。 |
| 聲音複製 | 有（雲端） | `models.ts` 中 FishAudio、ElevenLabs、SenseAudio 標 `voice-clone`。 |
| 字幕 | 有 | whisper.cpp 本機轉逐字時間碼，可匯入 SRT／VTT，再用 GSAP 做逐字動態字幕（[captions.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/design-templates/hyperframes/references/captions.md)、[transcript-guide.md](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/design-templates/hyperframes/references/transcript-guide.md)）；這是文件描述，我沒有跑過。 |
| 配樂 | 部分 | 可放自備 mp3（範本附 `warm-pad.mp3` 等音效）；AI 配樂 Suno／Udio／Lyria 在清單中但 Suno、Udio 標未整合；ElevenLabs SFX 可做音效。 |
| 合成 | 有 | FFmpeg 混音＋H.264 編碼（`hyperframes-audio.ts`、`encodeHyperFramesMp4`）。AI 生的多段影片要串接成一支，**沒有看到自動串接程式**（未確認）。 |
| 輸出 | 有 | MP4（HyperFrames）、各供應商原生影片檔；比例含 9:16。 |
| 每步成本 | 未確認 | 程式碼無價目表；文字代理用你的 Claude 訂閱／API，生圖生影片按各家 API 計費。 |
| 繁中／台灣口音配音 | 未確認 | MiniMax 預設普通話男聲，可帶 `language_boost`；Kokoro 只有 `z`（Mandarin）聲音；**沒看到台灣口音選項**。介面有 `zh-TW` 語系檔（`apps/web/src/i18n/locales/zh-TW.ts`），部分設計系統有 `DESIGN-zh-tw.md`。 |
| 繁中字幕 | 有（推論） | 字幕是 HTML 文字，任何中文字型都能顯示；whisper 要設 `--language zh`，文件特別警告不要用 `.en` 模型。輸出是繁體或簡體要另外轉換（未確認）。 |
| Claude 怎麼用 | 原生 | Claude Code CLI（OpenDesign 叫它）、MCP（Claude Code 叫 OpenDesign）、Anthropic API BYOK 三種都有。 |
| 個人電腦能跑嗎 | 可以 | 不需 GPU；需 Node 24 或直接裝桌面版（Mac／Windows）。AI 生影片／生圖全部是雲端 API。 |
| 最適合 | 廣告素材＞電商商品影片＞解說影片＞短劇 | 強項是「品牌一致、文字精準」的動態圖文廣告；短劇只有 Seedance prompt 範本，沒有角色一致性與多鏡串接流程。 |
| 法律風險 | 注意 | 品牌設計系統只是仿風格，別用他牌商標；範本授權混雜（MIT、CC-BY-4.0、HeyGen 縮圖）；Seedance 範本有真人寫實人物，肖像權與平台 AI 標示規範（如 Meta、TikTok 的 AI 生成內容標記）需自行遵守；yt-dlp 下載他人影片有著作權風險。 |

## 關鍵字
OpenDesign、open-design、nexu-io、AI 設計工作區、AI design agent、Claude Code、MCP、Model Context Protocol、Agent Skills、SKILL.md、DESIGN.md、設計系統、design system、HyperFrames、HeyGen、GSAP、HTML 轉影片、HTML to MP4、FFmpeg、動態影片、motion graphics、產品宣傳片、廣告素材、ad creative、電商商品圖、ecommerce product images、Seedance 2.0、Veo、Kling、Sora、MiniMax TTS、ElevenLabs、FishAudio、聲音複製、voice clone、Kokoro TTS、whisper.cpp、字幕、captions、BYOK、本機優先、local-first、Next.js、Electron、Express、SQLite、Apache-2.0、簡報、PPTX、原型、prototype、live dashboard、遙測、PostHog
