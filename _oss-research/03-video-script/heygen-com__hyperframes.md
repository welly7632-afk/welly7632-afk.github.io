# heygen-com/hyperframes — 用 HTML 寫影片、無頭 Chrome 逐幀渲染成 MP4，內建 Claude Code 外掛的「程式化影片引擎」

> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：845bd63
> GitHub：https://github.com/heygen-com/hyperframes｜⭐ 78761｜授權：Apache-2.0｜主要語言：TypeScript｜最近更新：2026-11-04

（以下 permalink 的前綴都是 `https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/`，下文以 `…/路徑` 縮寫時請自行補上。所有引用都是本次實際打開過的檔案。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：HyperFrames 是 HeyGen 開源的「HTML → 影片」框架：你（或 Claude Code）寫一個 `index.html`，用 `data-start`／`data-duration` 標時間、用 GSAP／CSS／Lottie／Three.js 做動畫，CLI 用無頭 Chrome 逐幀「拉時間軸 → 截圖」，再用 FFmpeg 編成 MP4，同樣的輸入一定得到同樣的影片。

**對你（台灣小老闆、自己用 Claude 寫倉儲網頁、會投廣告）最實用的用途：**

1. **商品廣告／商品介紹短片**：用 Claude Code 外掛 `/hyperframes` 直接說「幫我做 15 秒 9:16 的商品廣告，有價格標、logo、背景音樂」，它會寫 HTML 專案、開預覽、渲染 MP4。官方文件有完整的「貼網址 → 產生產品發表影片」流程（`docs/guides/product-launch-video.mdx`）。
2. **用資料批次產生大量廣告素材**：`hyperframes render --batch rows.json --output "renders/{name}.mp4"`，一列一支影片，每列帶不同變數（商品名、價格、圖片）。這可以直接接你倉儲系統匯出的 JSON——**這是本專案對你最有價值的功能**。
3. **價格／數據動畫**：內建 `data-chart`、`bar-chart-race` 等積木，可做「本月熱銷排行」「價格比較」動畫圖表。
4. **字幕**：內建 20 種左右的字幕樣式積木（卡拉 OK 逐字、霓虹、彈跳等），加上本機語音轉文字（whisper.cpp／Parakeet）。
5. **在你的網頁裡嵌播放器**：`<hyperframes-player>` Web Component，可嵌進 Firebase 網站預覽影片範本。

**不適合**：它**不是**「輸入小說 → 自動出短劇」的一鍵流水線；腳本和分鏡是靠 Claude（或其他 coding agent）照 skill 規範寫出來的。AI 生圖／生影片／數位人／高品質配音都要走 HeyGen 付費 credits，或自己裝本機模型。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **主授權：Apache-2.0**（根目錄 `LICENSE`，已打開確認；`plugin.json`、`.claude-plugin/marketplace.json`、`packages/cli/package.json` 也標 Apache-2.0）。README 明寫「no per-render fees or commercial-use thresholds」——不像 Remotion 有公司規模門檻。
- **個人使用**：完全可以，免費、可改、可私用。
- **公司商用**：可以，也可以把程式碼拆進你自己的閉源產品；要保留 LICENSE／NOTICE 與著作權聲明、修改過的檔案要註明有修改；Apache-2.0 有專利授權條款，反告專利者授權終止。
- **注意：部分子套件的 `package.json` 沒有填 `license` 欄位**（我用 python 讀了 15 個 `packages/*/package.json`，只有 `@hyperframes/cli` 有寫 `Apache-2.0`），但它們在同一個 repo 根授權之下，實務上視為 Apache-2.0。
- **閉源／付費的部分（不在這個 repo 裡或要付費）**：
  - **桌面 App（Mac／Windows／Linux 的 HyperFrames Studio app）**：repo 裡搜不到 Electron 或 Tauri 相關檔案（我在完整檔案清單 9,657 個路徑中 grep `electron|tauri` 得 0 筆），只有網頁版編輯器 `packages/studio`。桌面 App 是官網下載的二進位檔，原始碼未確認公開。
  - **HyperFrames Pro**：`/reverse-any-video`（把任何影片反向重建成可編輯專案）和 `/style-sampling`（5 種現成系列風格，含「財經講解」中文主持人範本）明寫是 Pro 付費功能，伺服器會檢查方案（`skills/style-sampling/SKILL.md`、`skills/reverse-any-video/SKILL.md` 第 12 行）。
  - **HeyGen 媒體**：AI 生圖、生影片、數位人、對嘴、HeyGen 配音、音樂生成都走 HeyGen 帳號與 credits。
  - **託管 MCP**：`server.json` 指向 `https://mcp.heygen.com/mcp/hyperframes/`，是 HeyGen 的雲端服務（beta），不是開源伺服器。
- **素材授權另計**：用 HeyGen 音樂庫、Openverse（CC BY 需標註）的素材，依各自條款。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容（已查證） |
|---|---|
| 語言 | TypeScript（monorepo，Bun workspaces，`package.json` 的 `workspaces: ["packages/*"]`） |
| 影片作者格式 | 純 HTML＋CSS＋JS，`data-*` 屬性標時間；動畫可用 GSAP、CSS、WAAPI、Anime.js、Lottie、Three.js、D3、Mapbox／Leaflet／MapLibre／Google Maps、TypeGPU |
| 渲染引擎 | `puppeteer-core` 控制 Chrome（`@hyperframes/engine`），Chrome BeginFrame API 或 `Page.captureScreenshot` 截圖；FFmpeg 編碼（libx264／libx265／libvpx-vp9、ProRes、PNG 序列、GIF） |
| 網頁編輯器 | `packages/studio`：React 19、Vite、Tailwind 4、CodeMirror 6、dockview、zustand、mediabunny、`@mcp-b/global`（WebMCP） |
| 渲染 HTTP 伺服器 | `packages/producer/src/server.ts`：Hono，`POST /render`、`POST /render/stream`（SSE 進度）等 |
| 資料庫 | 無（專案就是資料夾；`assets/` 放素材，ledger 紀錄在專案內） |
| 雲端渲染 | `@hyperframes/aws-lambda`（Lambda＋CDK）、`@hyperframes/gcp-cloud-run`（Cloud Run＋Workflows＋Terraform）、`examples/k8s-jobs` |
| 本機語音 | Kokoro TTS（ONNX，需 Python 3.10+、`kokoro-onnx`）、whisper.cpp／Parakeet 轉字幕、u2net 去背 |

**執行需求**：Node.js 22+、FFmpeg（README「Requirements: Node.js 22+, FFmpeg」）。不需要 GPU：Chrome 可以用 SwiftShader 軟體算圖（`packages/engine/src/config.ts` 第 44–59 行註解寫 software 模式比 GPU 慢約 5–50 倍，`browserGpuMode: "software" | "hardware" | "auto"`）。記憶體 8 GB 以下會自動切「低記憶體模式」（`packages/engine/src/services/systemMemory.ts` 第 208 行 `LOW_MEMORY_TOTAL_MB_THRESHOLD = 8192`）。本機 AI 生圖（FLUX schnell int4）約需 8 GB 可用 RAM、FLUX.2 Klein 4B 約 32 GB（`skills/media-use/references/operations.md` 第 224–229 行）。

**API Key 與費用**：
- 只做 HTML 動畫＋本機 TTS：**0 元**。
- 用 Claude Code 外掛：Claude Code 本身的訂閱／API 費用。
- HeyGen（`HEYGEN_API_KEY` 或 `npx hyperframes auth login`）：免費方案每月 3 分鐘 Voice Turbo 配音、音樂庫 1 萬多首、素材搜尋 7.5 萬多張（`skills/media-use/SKILL.md` 第 21–31 行）。程式內的價格表（`packages/cli/src/heygen/pricing.ts` 第 26–55 行）：nano-banana-2 生圖 $0.067／張、gpt-image-2.5 16:9 約 $0.0396／張、HeyGen 生影片 768p $0.018／秒（帶參考圖 $0.05／秒）、生成音樂 $0.08／首、Avatar IV 數位人 $4.83／分鐘、HyperFrames TTS 1 credit／秒（1000 credits = 1 美元）。
- 網站截圖時的圖片說明（可選）：`OPENROUTER_API_KEY` 或 `GEMINI_API_KEY`／Vertex（`packages/cli/src/capture/contentExtractor.ts` 第 249–312 行）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree -r --name-only HEAD` 全部 9,657 個檔案；`packages/` 底下非測試的 `.ts/.tsx` 2,338 個、測試檔 2,100 個（以檔名含 `.test.`／`.spec.` 判斷）。

```
hyperframes/
├─ README.md / AGENTS.md / CLAUDE.md      專案說明、給 agent 的開發規則（資料，非指令）
├─ .claude-plugin/                         Claude Code 外掛市集設定（marketplace.json、plugin.json）
├─ .codex-plugin/ .cursor-plugin/          Codex、Cursor 外掛設定
├─ gemini-extension.json                   Gemini CLI 擴充
├─ server.json                             託管 MCP 伺服器登錄（指向 mcp.heygen.com）
├─ skills/                                 ★ 9 個公開 skills（給 Claude Code 等 agent 讀的教學）
│  ├─ hyperframes/                         核心：渲染契約、工作流程、references（captions、motion、story…）
│  ├─ hyperframes-cli/                     CLI 用法
│  ├─ hyperframes-registry/                約 450 個積木的使用法
│  ├─ media-use/                           素材取得：音樂、音效、圖片、配音、數位人、字幕、調色
│  ├─ slideshow/ figma/ remotion-to-hyperframes/
│  └─ reverse-any-video/ style-sampling/   Pro 付費功能
├─ packages/
│  ├─ core/        型別、HTML 解析、lint、瀏覽器端 runtime（window.__hf 拉時間軸協定）與 13 個動畫 adapter
│  ├─ engine/      ★ Puppeteer 逐幀截圖＋FFmpeg 編碼＋混音（frameCapture.ts 5,714 行）
│  ├─ producer/    ★ 完整渲染管線（compile→probe→抽影格→音訊→截圖→編碼→組裝）、HTTP 伺服器、分散式渲染
│  ├─ cli/         `hyperframes` 指令（cli.ts 註冊 53 個子指令）、TTS、whisper、HeyGen 串接、網站擷取、遙測
│  ├─ studio/      網頁版影片編輯器（React＋CodeMirror＋時間軸）
│  ├─ studio-server/ 編輯器後端 API
│  ├─ player/      `<hyperframes-player>` 嵌入式播放器 Web Component
│  ├─ sdk/         無頭、框架中立的「合成編輯引擎」
│  ├─ shader-transitions/ WebGL 轉場
│  ├─ lint/ parsers/ inspector/
│  ├─ aws-lambda/ gcp-cloud-run/  雲端分散式渲染
│  └─ sdk-playground/
├─ registry/
│  ├─ blocks/      210 個區塊（我用 ls -d registry/blocks/*/ 計數）
│  ├─ components/  238 個元件（同法計數）
│  └─ examples/    8 個範例（含 product-promo）
├─ docs/           Mintlify 文件（guides 41 檔、studio-app 11 檔…）
└─ examples/       aws-lambda、gcp-cloud-run、k8s-jobs 部署範例
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 HTML 時間軸 → 可「拉」的頁面（瀏覽器端 runtime）**
- 位置：https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/core/src/runtime/init.ts#L5044-L5068
- 重點：runtime 註冊 13 個「確定性 adapter」（frame source、WAAPI、CSS、Anime.js、Lottie、Three、Mapbox、Leaflet、Google Maps、MapLibre、D3、TypeGPU、GSAP），對外暴露 `window.__hf = { duration, seek }`（同檔第 623 行起）。渲染時不是「播放」，而是對每一幀呼叫 `seek(t)`，讓所有動畫庫停在該時間點。CSS 動畫的做法可看 https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/core/src/runtime/adapters/css.ts#L1-L60 ：用 `document.getAnimations()` 抓到 CSSAnimation，再改 delay／currentTime 讓它停在指定時間。

**5.2 逐幀截圖（引擎）**
- 位置：https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/engine/src/services/frameCapture.ts#L1-L9 、`createCaptureSession` 在 #L1430 、等待頁面就緒 `pollHfReady` 在 https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/engine/src/services/frameCapture.ts#L1918-L1980
- 重點：Puppeteer 開檔案伺服器 URL → 等 `window.__hf.seek` 可用且 `duration > 0` → 用 Chrome 的 BeginFrame（Linux/Docker）或 `Page.captureScreenshot`（後備）截圖。還有「靜態幀去重」（`computeStaticFrameSet`，畫面沒變就不重截）、平行 worker（`parallelCoordinator.ts`）、影片元素的影格是另外用 FFmpeg 抽出再注入（`videoFrameExtractor.ts`、`videoFrameInjector.ts`），確保 `<video>` 每幀精準。

**5.3 六階段渲染管線**
- 位置：https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/producer/src/services/renderOrchestrator.ts#L1-L30 ；入口 `executeRenderJob` 在 #L3014
- 重點：compile → probe（用瀏覽器量長度）→ extract videos → audio → capture → encode → assemble，每階段一個檔案（`packages/producer/src/services/render/stages/`），try/finally 清理 Chrome 與 ffmpeg 子程序。

**5.4 FFmpeg 編碼**
- 位置：https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/engine/src/services/streamingEncoder.ts#L365-L369
- 重點：截圖以串流方式 pipe 進 ffmpeg，h264→`libx264`、h265→`libx265`，以 `-crf` 控品質；VP9（WebM）在 #L408。`chunkEncoder.ts` 處理分段＋GPU 編碼、HDR（僅 h265）。

**5.5 混音**
- 位置：`packages/engine/src/services/audioMixer.ts`（1,974 行，已打開看過 volume 自動化相關段落）
- 重點：每個 `<audio>`／有聲 `<video>` 依 `data-start`、`data-volume` 與音量關鍵幀組成 FFmpeg filter（`volume=...:eval=frame`）。

**5.6 變數＋批次渲染（電商最重要）**
- 位置：https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/commands/render.ts#L58-L66 、#L339-L370 ；批次邏輯 https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/commands/batchRender.ts#L101-L146 （`parseBatchRows`、`resolveOutputTemplate`），`prepareBatchRender` #L244 、`runBatchRender` #L374
- 重點：HTML 根節點宣告 `data-composition-variables`（變數 schema），`--variables` 傳 JSON 覆蓋預設值；`--batch rows.json` 每列一支，輸出路徑可用 `{name}` 模板，產生 manifest 記錄每列 pending/running/completed/failed。積木 `registry/blocks/product-turntable/product-turntable.html` 第 9 行就示範了變數宣告。

**5.7 渲染 HTTP API**
- 位置：https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/producer/src/server.ts#L1-L14 、路由 #L958-L963
- 重點：可以把它放在 Cloud Run，讓你的 Firebase 網頁按按鈕就送出渲染工作，用 SSE 回報進度、`GET /outputs/:token` 下載 MP4。

**5.8 本機 TTS（Kokoro）**
- 位置：https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/tts/manager.ts#L10-L35 、預設聲音清單 #L66-L89 ；中文語言碼轉換 https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/tts/synthesize.ts#L109-L114
- 重點：自動下載 kokoro-v1.0.onnx 與 voices bin；支援 `zh`，精選清單只有一個中文女聲 `zf_xiaobei`（Kokoro 的中文是普通話，**不是台灣腔**），也可指定其他 Kokoro voice id。

**5.9 HeyGen 媒體生成與報價**
- 位置：類型定義 https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/heygen/generate.ts#L33 （image／video／lipsync／avatar／cutout／voice／music）、挑聲音 #L595-L623 、價格 https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/heygen/pricing.ts#L26-L55
- 重點：付費前先算價；`--voice Chinese` 會查 HeyGen 公開聲音清單取第一個中文聲音，並把選擇記在專案裡讓重跑結果一致。

**5.10 網站擷取（做產品影片的素材來源）**
- 位置：`packages/cli/src/capture/`（打開過 `contentExtractor.ts`）
- 重點：`npx hyperframes capture <url>` 擷取網站的截圖、字型、色票、圖示、Lottie，變成可編輯元件；圖片說明可選用 OpenRouter／Gemini／Vertex。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整個 CLI 當黑盒子 | https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/cli.ts#L133-L191 | Node 22、FFmpeg、Chrome | 低 | 不拆：`npx hyperframes render --batch` 直接當你的影片產生器，你的倉儲系統只要輸出 JSON |
| 批次＋變數渲染 | https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/commands/batchRender.ts#L101-L146 | CLI utils | 低 | 學它的 rows.json＋manifest 設計，從 Firestore 匯出商品 → rows.json |
| 渲染 HTTP 伺服器 | https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/producer/src/server.ts#L1-L14 | Hono、producer、Chrome、FFmpeg | 中 | 部署到 Cloud Run（同 GCP 家族，跟 Firebase 好接），前端 fetch `/render/stream` |
| 逐幀截圖引擎 | https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/engine/src/services/frameCapture.ts#L1430 | puppeteer-core、@hyperframes/core | 高 | 檔案極大（5,714 行），建議整包用 `@hyperframes/engine` 而不是複製 |
| 瀏覽器 runtime＋動畫 adapter | https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/core/src/runtime/init.ts#L5044-L5068 | 無（瀏覽器端） | 中 | 想讓別的專案（如短劇工具）也能「HTML 出片」，就讓頁面實作 `window.__hf = {duration, seek}` 協定 |
| CSS 動畫 seek adapter | https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/core/src/runtime/adapters/css.ts#L1-L60 | 無 | 低 | 235 行，可單獨學習「讓 CSS 動畫停在任意時間」的技巧 |
| 嵌入式播放器 | `packages/player/src/hyperframes-player.ts` | core runtime | 中 | 在你的 Firebase 網站嵌 `<hyperframes-player>` 預覽廣告範本 |
| Kokoro 本機 TTS 封裝 | https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/tts/manager.ts#L10-L35 | Python 3.10+、kokoro-onnx | 低 | 免費配音：可抽出給短劇工具用（但只有普通話） |
| whisper 轉字幕 | `packages/cli/src/whisper/`（打開過 `modelForLanguage.ts`） | whisper.cpp／Parakeet | 中 | 配音後自動生字幕時間軸 |
| HeyGen 報價表 | https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/heygen/pricing.ts#L26-L55 | 無 | 低 | 你做「AI 影片成本試算」時可直接參考單價邏輯 |
| 積木庫（字幕、圖表、商品旋轉台） | `registry/components/caption-*`、`registry/blocks/data-chart`、`registry/blocks/product-turntable` | GSAP／Three.js | 低 | `npx hyperframes add data-chart` 加進專案，或直接複製 HTML |
| Claude Code skills | `skills/hyperframes/SKILL.md`、`skills/media-use/SKILL.md` | Claude Code | 低 | 參考它寫 skill 的方式（契約＋工作流程＋references 分層），用在你自己的倉儲工具 skill |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **Claude 是「第一級公民」**：README 第一個 Quick Start 就是 `claude plugin marketplace add heygen-com/hyperframes` → `claude plugin install hyperframes@hyperframes`；`.claude-plugin/marketplace.json` 定義兩個外掛：`hyperframes`（全部 skills）與舊版 `core-skills`（4 個核心 skills）。文件 `docs/guides/with-claude-code.mdx` 有完整教學。
- **HyperFrames 本身沒有呼叫 Claude API**：它的設計是「agent（Claude Code／Codex／Cursor／Gemini CLI）讀 skill → 寫 HTML → 呼叫 CLI」。我在 `packages/*/src` 非測試檔 grep `anthropic|claude-opus|claude-sonnet|ANTHROPIC_API_KEY`，命中的只有遙測辨識 agent 類型（`telemetry/agent_runtime.ts`）等，沒有直接呼叫 Anthropic API 的程式。
- **「prompt」在哪**：就是 skills 的 Markdown：`skills/hyperframes/SKILL.md`（12 條渲染契約，例如不能用 `Date.now()`、未設種子的 `Math.random()`、`repeat: -1`），`skills/hyperframes/references/`（story.md、spec.md、captions.md、film.md、motion.md、types/launch.md、types/vertical.md 等）。
- **外部 AI 模型**：
  - HeyGen：生圖（nano-banana-2、gpt-image-2.5）、生影片（heygen-video-1）、Avatar IV 數位人、lipsync、voice、music。
  - 網站擷取圖片說明：OpenRouter（預設 `google/gemini-3.1-flash-lite`）、Gemini、Vertex。**沒有 Anthropic 選項**；OpenRouter 是 OpenAI 相容介面，理論上可以設定 `HYPERFRAMES_OPENROUTER_MODEL` 換成 OpenRouter 上的 Claude 模型（未實測）。
  - 本機：Kokoro TTS、whisper.cpp／Parakeet、u2net 去背、mflux（FLUX）、ltx-2-mlx（影片）。
- **MCP**：(1) 託管 MCP `https://mcp.heygen.com/mcp/hyperframes/`（`server.json`，beta，可在 Claude.ai 聊天裡直接做影片、雲端渲染）；(2) 網頁編輯器用 `@mcp-b/global` 提供 WebMCP（`docs/guides/webmcp.mdx`）。
- **能不能換成 Claude**：本來就是為 Claude Code 等 agent 設計，**原生支援**。

## 8. 擴充方式與 API

- **CLI（53 個子指令）**：我解析 `packages/cli/src/cli.ts` 第 133 行 `commandLoaders` 物件得 53 個：`init add catalog media-use play present publish open catch-up render lint check beats audio normalize-audio inspect keyframes layout info compositions timeline history benchmark browser remove-background transcribe usage models tts docs doctor clean upgrade update skills feedback telemetry events validate snapshot grade-compare compare diff measure reverse billing templates capture lambda cloudrun cloud auth figma`。CLI 預設非互動、多數支援 `--json`，適合給 agent 或你的腳本呼叫。
- **自訂動畫 adapter**：實作 `RuntimeDeterministicAdapter`（`packages/core/src/runtime/types`），參考 `adapters/css.ts`、`adapters/gsap.ts`（575 行）。
- **積木 registry**：`registry-item.json`（schema `https://hyperframes.heygen.com/schema/registry-item.json`）＋ HTML，`npx hyperframes add <name>` 安裝；可自建積木。
- **變數**：`data-composition-variables`、`data-var-text`、`data-var-src`、CSS `var(--id)`；頁內用 `window.__hyperframes.getVariables()` 讀。
- **程式 API**：`@hyperframes/producer` 的 `executeRenderJob`、`@hyperframes/engine`、`@hyperframes/sdk`（無頭合成編輯引擎）、`@hyperframes/aws-lambda`／`gcp-cloud-run` 的 client SDK。
- **HTTP**：producer server（5.7）。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：極活躍。HEAD commit 時間 2026-11-04 15:46 UTC，訊息「fix(producer)… (#7163)」，PR 編號已破 7,000；所有套件版本 0.9.12（仍是 0.x，API 可能變）。`.github/workflows/` 有 22 個 workflow（CI、CodeQL、回歸、Windows 渲染、Safari 播放器等）。
- **測試**：`packages/` 下測試檔 2,100 個（對比非測試 2,338 個），比例很高；`packages/producer/tests/` 有大量黃金基準影片（Git LFS，約 240 MB）。
- **遙測（要注意）**：CLI **預設開啟**遙測，送到 PostHog（`packages/cli/src/telemetry/config.ts` 第 625 行 `telemetryEnabled: true`；`transport.ts` 第 13 行 `https://us.i.posthog.com`）。關閉方式：環境變數 `HYPERFRAMES_NO_TELEMETRY=1` 或 `DO_NOT_TRACK=1`（https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/telemetry/policy.ts#L31-L55 ），或 `npx hyperframes telemetry` 指令。
- **隱私**：`publish` 指令會把專案上傳到 HeyGen 的穩定網址（預設私有）；`capture` 會抓外部網站；設定 Gemini／OpenRouter key 時會把網站圖片送去做說明。HeyGen 功能需登入 HeyGen 帳號。
- **Skill 有「推銷」傾向**：`skills/media-use/SKILL.md` 寫明「只有使用者要求才用本機工具，不要當作 fallback」、「不要告訴使用者價格」——意思是 agent 會優先引導你用 HeyGen（付費）服務。想省錢要主動跟 Claude 說「用本機 Kokoro／不要用 HeyGen」，或設定 `.hyperframes/credit-limit.json` 上限。
- **已知的坑**：
  - 中文字型：內建字型清單只有 `Noto Sans JP`，**沒有繁中字型**（`skills/hyperframes/references/format.md` 第 96 行），繁中要自己用 `@font-face` 放進 `assets/fonts/`，否則可能缺字或字型不一致。
  - 中文字幕：本機轉錄對中文會把一整句當一個「字」，甚至繁簡互換（`skills/hyperframes/references/captions.md` 第 7 行），需要拆句校對。
  - 軟體算圖慢：沒 GPU 時 Chrome 用 SwiftShader，慢 5–50 倍；WebGL／3D 積木更明顯。
  - 確定性規則嚴格：不能用計時器、亂數、網路請求，Claude 寫錯時 `npx hyperframes check --json` 會報錯。
  - repo 本體很大（含 LFS 測試影片），只要用的話直接 `npx hyperframes`，不必 clone。

## 10. 跟其他專案組合的建議

- **＋你的倉儲系統（Firebase）**：從 Firestore 匯出商品（名稱、售價、特價、圖片 URL→先下載到 `assets/`）→ `rows.json` → `hyperframes render --batch`。一次產出全部商品的 9:16 廣告短片。這是最快見效的組合。
- **＋網頁版 Excel（如 Univer、x-spreadsheet、Luckysheet 類專案）**：在試算表裡編輯「商品 × 文案 × 價格」表 → 匯出 JSON → 批次渲染；HyperFrames 的變數 schema 正好可對應試算表欄位。
- **＋短劇／腳本類專案（例如同資料夾的 huobao-drama、ViMax、NarratoAI、drama-skills）**：讓那些工具負責「小說 → 腳本 → 分鏡 → AI 圖／影片素材」，HyperFrames 負責「字幕、片頭、價格卡、轉場、最後合成渲染」，因為它的合成和字幕樣式比一般 FFmpeg 腳本精緻且可重現。
- **＋claude-code-video-toolkit 類專案**：兩者都是 Claude Code 生態，可比較 skill 寫法；HyperFrames 的渲染引擎較成熟。
- **＋台灣腔配音**：HyperFrames 本機 TTS 只有普通話 Kokoro；台灣腔建議另接 Azure TTS（zh-TW 聲音）或其他 TTS 專案產出 mp3，再放進 `<audio>`。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有／未確認 | 程式碼位置與說明 |
|---|---|---|
| 輸入：主題／商品網址 | 有 | `npx hyperframes capture <url>`（`packages/cli/src/capture/`），把網站畫面、色票、字型抓成素材；也可直接文字描述給 Claude。 |
| 輸入：商品圖／素材 | 有 | `media-use resolve --from` 匯入本機素材（`skills/media-use/SKILL.md`）；`remove-background` 去背。 |
| 輸入：小說 | 沒有 | 沒有小說拆章／角色抽取的專用程式；只能靠 Claude 自己讀稿。 |
| 腳本 | 有（靠 agent） | `skills/hyperframes/references/story.md`、`spec.md`：讓 agent 先寫三種故事線、再寫 SPEC.md；本身不呼叫 LLM。 |
| 分鏡 | 有（靠 agent） | `skills/hyperframes/references/storyboard.md`、`storyboard-format.md`；桌面 App 有「Start with a storyboard」先審靜態分鏡（`docs/guides/product-launch-video.mdx`）。 |
| 畫面：程式繪製 | 有（核心強項） | HTML／CSS／GSAP／Three.js，13 個 adapter（https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/core/src/runtime/init.ts#L5044-L5068 ）。 |
| 畫面：素材庫 | 有 | HeyGen 素材搜尋（需登入，免費方案可用）、logo 從 theSVG／favicon。 |
| 畫面：AI 生圖 | 有（付費或本機） | HeyGen nano-banana-2 $0.067／張；本機 mflux FLUX（約 8 GB RAM 起）。`packages/cli/src/heygen/pricing.ts#L26-L55`。 |
| 畫面：AI 生影片 | 有（付費或本機） | heygen-video-1 768p $0.018／秒；本機 ltx-2-mlx（Apple Silicon）。 |
| 數位人／對嘴 | 有（付費） | Avatar IV $4.83／分鐘、lipsync（`generate.ts#L33`）。 |
| 配音 TTS | 有 | 免費：Kokoro 本機（`tts/manager.ts#L10-L35`）；HeyGen Voice Turbo 免費每月 3 分鐘。 |
| 聲音複製 | 有（付費） | `skills/media-use/SKILL.md` 表格寫「cloning」屬 HeyGen 付費。 |
| 字幕 | 有 | whisper.cpp／Parakeet 本機轉錄＋約 20 個字幕樣式元件（`registry/components/caption-*`、`per-word-*`）。 |
| 配樂 | 有 | HeyGen 1 萬多首音樂庫（登入免費）、生成音樂 $0.08／首、本機 MusicGen；音效有 Openverse（CC BY）。 |
| 合成 | 有 | `packages/producer/src/services/renderOrchestrator.ts#L1-L30` 六階段；混音 `audioMixer.ts`。 |
| 輸出 | 有 | MP4（h264／h265）、WebM（VP9）、MOV ProRes、PNG 序列、GIF、HDR；4K（`docs/guides/4k-rendering.mdx`）。 |
| 繁中／台灣口音配音 | 未確認／大致沒有 | Kokoro 只有普通話 `zf_xiaobei`；HeyGen 用 `--voice Chinese` 取第一個中文聲音（`generate.ts#L595-L623`），是否有台灣腔聲音要在 HeyGen 聲音庫查，程式內未見 zh-TW 選項。 |
| 繁中字幕 | 有，但要自己補字型 | 內建字型無繁中（`format.md` 第 96 行），需 `@font-face`；中文轉錄需手動斷句（`captions.md` 第 7 行）。 |
| Claude 怎麼用 | 原生（Claude Code plugin＋skills） | `.claude-plugin/marketplace.json`；也有託管 MCP 可在 Claude.ai 用（`server.json`）。不直接呼叫 Anthropic API。 |
| 個人電腦能不能跑 | 能 | Node 22＋FFmpeg 即可；無 GPU 也能跑（慢）；8 GB 以下自動低記憶體模式。AI 生成類才需雲端或大 RAM。 |
| 最適合做 | 電商商品影片、廣告素材（★★★★★）、解說影片（★★★★）、短劇（★★，缺角色一致性與分鏡生圖流水線） | 產品發表、社群直式短片、數據圖表、字幕卡都是官方主打（README「What You Can Build」）。 |
| 每步成本概估 | 有 | 只用 HTML＋本機工具：0 元（只有電費）；加 HeyGen：配音約 1 credit／秒（≈ $0.001／秒）、生圖 $0.04–0.07／張、生影片 $0.018–0.05／秒、數位人 $4.83／分。 |
| 法律風險 | — | 程式碼 Apache-2.0 可商用；擷取別人的網站畫面做廣告有著作權／商標風險，只擷取自己的網站；數位人與聲音複製要有本人同意（肖像權）；`/style-sampling` 的規範也寫「不要用創作者的臉、聲音、片段、logo」；Openverse 音效需標註 CC BY；投 Meta／TikTok 廣告時，AI 生成內容可能需依平台政策標示。 |

## 關鍵字

HyperFrames、heygen、HTML 轉影片、HTML to video、程式化影片、programmatic video、無頭瀏覽器、headless Chrome、Puppeteer、FFmpeg、逐幀渲染、deterministic rendering、GSAP、Lottie、Three.js、Remotion 替代、Claude Code 外掛、Claude Code plugin、skills、MCP、批次渲染、batch render、商品影片、產品廣告、電商廣告素材、字幕、captions、Kokoro TTS、whisper、HeyGen、數位人、avatar、AI 配音、Cloud Run、AWS Lambda、Apache-2.0
