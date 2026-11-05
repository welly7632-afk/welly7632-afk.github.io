# remotion-dev/remotion — 用 React 程式碼「寫」出影片的框架（影片界的前端框架，官方附 Claude Code 外掛與 Skills）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：682cad2
> GitHub：https://github.com/remotion-dev/remotion｜⭐ 70673｜授權：自訂授權（Remotion License：個人／3 人以下營利公司／非營利免費，其餘需購買 Company License）｜主要語言：TypeScript｜最近更新：2026-11-04

> 本資料包以 sparse checkout 讀取：`README.md`、`LICENSE.md`、`packages/core/src`、`packages/renderer/src`、`packages/cli/src`、`packages/player/src`、`packages/skills`、`packages/claude-code-plugin`、`packages/agent-plugin`、`packages/captions/src`、`packages/elevenlabs/src`、`packages/openai-whisper/src`、`packages/install-whisper-cpp/src`、`packages/licensing/src`、`packages/template-prompt-to-video`、`packages/template-prompt-to-motion-graphics`。其他套件（studio、lambda、web-renderer、transitions、media 等）只看過檔案清單，內容標為「未確認」。版本號：`packages/core/package.json` 為 `4.0.540`。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Remotion 讓你用 React（HTML/CSS/JS）寫一個「元件」，它用無頭 Chrome 一格一格截圖，再用 ffmpeg 合成 MP4——影片＝程式碼，所以可以讓 Claude 直接寫、改、批次產出。

**它不是什麼**：它**不是**「輸入主題→自動吐出短劇」的一鍵 AI 工具，也不會自己生圖、生影片、配音。它是「合成與渲染引擎」，AI 的部分要你（或 Claude）自己接。

**對你（台灣電商＋投廣告）最實用的用法**：
1. **商品廣告素材批次產生**：做一個「商品卡」範本（商品圖＋價格＋賣點文字＋動畫），把倉儲 App（Firebase）裡的商品資料當 `inputProps` 丟進去，一次渲染 50 支不同商品的 9:16 / 1:1 / 16:9 廣告。這是 Remotion 最強項（資料驅動影片）。
2. **讓 Claude Code 直接幫你寫影片**：官方有 Claude Code 外掛與 13 個 Agent Skills（見第 7 節），你在 Claude Code 說「幫我做一支 15 秒的折扣倒數影片」，它就照官方最佳實務寫 React 元件，`npx remotion studio` 預覽、`npx remotion render` 輸出。
3. **價格／數據動畫**：把比價或成本資料做成動態長條圖、價格跳動數字（官方範例 `gold-price-chart.ts`、`histogram.ts`），可用在社群貼文或廣告。
4. **字幕＋配音的解說影片**：搭配 ElevenLabs（或其他 TTS）＋ Whisper 轉字幕，做抖音風逐字跳動字幕。
5. **嵌進你自己的網頁 App**：`@remotion/player` 可以把影片當 React 元件嵌進網頁即時預覽（但你的倉儲 App 是純 JS，不是 React，需要額外包一層，見第 6 節）。

**跟「網頁版 Excel」的關係**：無直接關係。Remotion 沒有試算表元件；唯一關聯是可以把試算表資料（CSV/JSON）餵給影片範本做批次產出。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

授權檔：[LICENSE.md](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/LICENSE.md)。這**不是** MIT/Apache 這種開源授權，是「原始碼公開＋分級收費」的自訂授權（GitHub 因此判定為 NOASSERTION；`packages/core/package.json` 寫 `"license": "SEE LICENSE IN LICENSE.md"`）。

- **免費（Free License）適用對象**（原文逐條）：個人；**員工 3 人以下**的營利組織；非營利組織；評估期（尚未商業使用）。
- **免費者可以做的事**：非商業**或商業**用途地「製作影片與圖片」，也可以修改原始碼以符合自己需求。→ 你個人用、或你的公司員工 ≤3 人，拿來做商品廣告影片**可以**，且可以商用。
- **禁止**：複製或修改 Remotion 程式碼，拿去**販售、出租、授權、再授權你自己的 Remotion 衍生版**。→ 你不能把它包成「影片產生器 SaaS」或改名賣給別人當工具（就算你是免費資格也不行）。
- **公司超過 3 人**：要買 Company License（價格在 remotion.pro，本次未查網站，**金額未確認**）。LICENSE.md 開頭也註明 Remotion 5.0 授權會「些微改變」（連到 PR #3750，內容未確認）。
- **授權金鑰與用量回報**：`renderMedia()` 有 `licenseKey` 選項；若傳入（包括字串 `"free-license"`），渲染完成後會 POST 到 `https://www.remotion.pro/api/track/register-usage-point` 回報一次用量；不傳（`null`）就不回報。見 [render-media.ts#L974-L998](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts#L974-L998) 與 [register-usage-event.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/licensing/src/register-usage-event.ts)。程式碼中 v5 旗標開啟後，未傳 `licenseKey` 會出現警告「If you qualify for the Free License, pass "free-license"」（[render-media.ts#L1179-L1187](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts#L1179-L1187)）。
- **Player 的網域黑名單**：`@remotion/player` 會把 `window.location.hostname` 做 SHA-256 比對內建黑名單（[license-blacklist.tsx](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/player/src/license-blacklist.tsx)），命中會顯示紅色警示框；未傳 `acknowledgeRemotionLicense` 會在 console 印授權提醒（[use-remotion-license-acknowledge.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/player/src/use-remotion-license-acknowledge.ts)）。
- **付費／閉源功能**：README 的「Commercial」區列出 Store（remotion.pro/store）與「Editor Starter」（付費的影片編輯器起始範本，本 repo 內未見原始碼，**未確認**內容）。官方 Claude Code 外掛本身標 MIT（`packages/claude-code-plugin/.claude-plugin/plugin.json`），但它只包 Skills 文件，使用 Remotion 本體仍受上述授權約束。
- **範本授權**：`template-prompt-to-video/package.json` 寫 `"license": "UNLICENSED"`（私有），README 指回 Remotion 授權。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容 |
|---|---|
| 語言 | TypeScript（monorepo，以 bun / turbo 管理；根目錄有 `bun.lock`、`turbo.json`、`go.work`） |
| 影片描述 | React（範本用 React 19.3.1）＋ Remotion 元件（`Composition`、`Sequence`、`AbsoluteFill`…） |
| 渲染 | Node.js ＋ 自帶的 Puppeteer 分支（`packages/renderer/src/browser/` 下 40 多個檔案，是 Remotion 自己維護的精簡版）控制 Chrome Headless Shell 截圖 → ffmpeg 編碼 |
| ffmpeg | 不用你自己裝：`@remotion/renderer` 依賴 7 個平台的 `@remotion/compositor-*` 套件（darwin-arm64/x64、linux-x64/arm64 gnu/musl、win32-x64），內含 ffmpeg/ffprobe 執行檔（[renderer package.json](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/package.json)、[call-ffmpeg.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/call-ffmpeg.ts)） |
| Chrome | 第一次渲染會從 `storage.googleapis.com/chrome-for-testing-public/` 下載 Chrome Headless Shell（[get-chrome-download-url.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/browser/get-chrome-download-url.ts)） |
| 資料庫 | 無。影片資料就是 props（JSON） |
| 部署 | 本機 CLI；Node.js SSR API；AWS Lambda（`packages/lambda`）、Google Cloud Run（`packages/cloudrun`）、Vercel（`packages/vercel`）；瀏覽器端渲染（`packages/web-renderer`，內容未讀）。雲端方案的費用**未確認** |
| Node 版本 | 範本要求 `^20.19.0 || ^22.13.0 || >=24` |
| 硬體 | 純 CPU 即可。預設並行數 = `min(8, max(1, CPU 核心數/2))`（[get-concurrency.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/get-concurrency.ts)）。GPU 非必要（CLI 有 `gpu` 指令可檢測，[cli/src/gpu.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/cli/src/gpu.ts)）；但 Whisper WebGPU 轉字幕需要相容 GPU |
| API Key | **核心不需要任何 API Key**。只有選配的 AI 範本才要：`OPENAI_API_KEY`、`ELEVENLABS_API_KEY`（prompt-to-video），`OPENAI_API_KEY`＋`REMOTION_AWS_*`（prompt-to-motion-graphics） |
| 費用 | 本機渲染：免費（電費）。AI 部分依你接的服務計價（OpenAI、ElevenLabs 計價本次未查，**未確認**） |

**一般電腦能不能跑**：可以。一台 8 核、16GB 記憶體的筆電渲染 1080p 短影片沒問題（實際速度取決於畫面複雜度，**未實測**）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree -r --name-only HEAD` 全部 14,511 個檔案；`packages/*/package.json` 共 131 個套件；以 `.test.ts/.test.tsx` 結尾的測試檔 1,101 個。

```
remotion/
├─ README.md / LICENSE.md          # 介紹、自訂授權
├─ AGENTS.md / .agents/skills/     # 給 AI 代理開發 Remotion 本身用（非給使用者）
├─ packages/
│  ├─ core/        (remotion)      # 核心：Composition、Sequence、interpolate、spring、useCurrentFrame…（src 下 324 個 .ts/.tsx）
│  ├─ renderer/    (@remotion/renderer) # Node 端渲染：開 Chrome、逐格截圖、呼叫 ffmpeg（src 下 313 個 .ts）
│  │   ├─ render-media.ts          # 主流程 renderMedia()
│  │   ├─ render-frames.ts         # 平行分頁截圖
│  │   ├─ seek-to-frame.ts         # 叫頁面跳到第 N 格
│  │   ├─ stitch-frames-to-video.ts# 用 ffmpeg 縫合
│  │   └─ browser/                 # 內建 Puppeteer 分支
│  ├─ cli/         (@remotion/cli) # `npx remotion render/still/studio/skills/...`（src 下 131 個檔）
│  ├─ player/      (@remotion/player)  # 在網頁中嵌入可播放的影片元件（src 下 62 個檔）
│  ├─ studio/ studio-server/       # 預覽與編輯介面（未讀）
│  ├─ bundler/                     # 用 webpack 打包影片專案（未讀）
│  ├─ lambda/ cloudrun/ vercel/    # 雲端分散式渲染（未讀）
│  ├─ web-renderer/ webcodecs/ media-parser/ # 瀏覽器端渲染與媒體處理（未讀）
│  ├─ captions/                    # 字幕型別、SRT/VTT 解析、TikTok 式字幕分頁
│  ├─ elevenlabs/ openai-whisper/ install-whisper-cpp/ whisper-web/ whisper-webgpu/ # 各種語音轉文字結果→字幕
│  ├─ transitions/ shapes/ lottie/ three/ gif/ google-fonts/ sfx/ light-leaks/ motion-blur/ # 特效與素材套件（未讀）
│  ├─ licensing/                   # 用量回報（向 remotion.pro）
│  ├─ skills/                      # 13 個官方 Agent Skills（給 Claude Code / Codex / Cursor）
│  ├─ claude-code-plugin/          # 把 skills 打包成 Claude Code 外掛
│  ├─ agent-plugin/ codex-plugin/ kimi-code-plugin/ # 給其他 AI 編碼代理的版本
│  ├─ template-*/                  # 30 多個起始範本（tiktok、audiogram、prompt-to-video、prompt-to-motion-graphics…）
│  └─ docs/                        # 官網文件原始檔（2,342 個檔）
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**(1) 影片＝註冊一個 Composition**
- [Composition.tsx#L116-L230](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/Composition.tsx#L116-L230)：`<Composition id width height fps durationInFrames component defaultProps schema calculateMetadata>`。`schema` 用 zod 定義可編輯參數；`calculateMetadata`（型別在 [L47-L76](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/Composition.tsx#L47-L76)）可在渲染前動態決定長度/尺寸，例如依配音長度自動調整影片秒數。
- 入口用 [register-root.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/register-root.ts) 的 `registerRoot()`。

**(2) 時間軸核心：useCurrentFrame**
- [use-current-frame.ts#L25-L45](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/use-current-frame.ts#L25-L45)：回傳「目前第幾格」，若在 `<Sequence>` 內，會減掉 `cumulatedFrom + relativeFrom` 再乘 `playbackRate`，所以每個片段的元件都從 0 開始算。這是整個 Remotion 的心臟：畫面＝f(frame)。

**(3) Sequence：剪輯片段、巢狀時間偏移**
- [Sequence.tsx#L181-L230](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/Sequence.tsx#L181-L230)（props 型別）與 [L281-L283](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/Sequence.tsx#L281-L283)（累加父層偏移）、[L437-L443](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/Sequence.tsx#L437-L443)（premount：提前載入下一段素材避免黑畫面）。整檔 1,335 行（`wc -l`），另支援 loop、freeze、premount/postmount。

**(4) interpolate／spring：動畫數學**
- [interpolate.ts#L583-L625](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/interpolate.ts#L583-L625)：把 frame 映射到數值，`extrapolateLeft/Right` 支援 `extend / clamp / wrap / identity`；公開多載從 [L1277](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/interpolate.ts#L1277) 開始（共 8 個 `export function interpolate` 多載，`grep -n` 計數）。
- [spring/index.ts#L13](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/spring/index.ts#L13)：物理彈簧動畫。
- 重點：**不能用 CSS transition / animation**，因為渲染是一格一格截圖，所有動畫都要由 frame 計算（官方 skill 也明文規定，見 [remotion-markup/SKILL.md](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/skills/skills/remotion-markup/SKILL.md)）。

**(5) 渲染流程（Chrome ＋ ffmpeg）**
1. `renderMedia()` 公開入口 [render-media.ts#L1088](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts#L1088)，內部 `internalRenderMediaRaw` 從 [L237](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts#L237) 開始。
2. 決定並行數與是否「平行編碼」（邊截圖邊丟給 ffmpeg）：[L381-L470](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts#L381-L470)，必要時先 `prespawnFfmpeg`（[L576](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts#L576)）。
3. 呼叫 `internalRenderFrames` 逐格截圖並估算剩餘時間：[L705-L760](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts#L705-L760)；多分頁平行在 [render-frames.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-frames.ts)。
4. 每格：在頁面執行 `window.remotion_setFrame(f, c, a)`，等 `delayRender` 全部解除、`document.fonts.ready` 後才截圖：[seek-to-frame.ts#L195-L215](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/seek-to-frame.ts#L195-L215)、[take-frame.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/take-frame.ts)。
5. 縫合影像＋混音：[stitch-frames-to-video.ts#L656](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/stitch-frames-to-video.ts#L656)。
- **等待非同步素材**：[delay-render.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/core/src/delay-render.ts) 的 `delayRender()/continueRender()`——要抓 Firebase 商品資料或圖片時必用，否則會截到空白畫面。

**(6) CLI**
- [cli/src/index.ts#L124-L200](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/cli/src/index.ts#L124-L200)：指令分派 `studio / bundle / compositions / lambda / cloudrun / render / still / ffmpeg / gpu / ffprobe / upgrade / add / skills / benchmark…`。渲染流程在 [render-flows/render.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/cli/src/render-flows/render.ts)（L735 呼叫 `internalRenderMedia`）。

**(7) Player（網頁內嵌預覽）**
- [Player.tsx#L153](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/player/src/Player.tsx#L153)：`<Player component compositionWidth compositionHeight durationInFrames fps inputProps controls>`，不需渲染就能在瀏覽器即時播放，改 `inputProps` 立刻更新畫面。

**(8) 字幕**
- [captions/src/caption.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/captions/src/caption.ts)：統一的 `Caption {text,startMs,endMs,...}` 格式；`parseSrt / parseVtt / serializeSrt` 匯入匯出。
- [create-tiktok-style-captions.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/captions/src/create-tiktok-style-captions.ts)：把逐字時間戳合成「一頁一頁」的抖音字幕。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| `renderMedia()` 伺服器端渲染 | [render-media.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts) | `@remotion/renderer`、`@remotion/bundler`、Chrome、compositor 執行檔 | 低（直接當 npm 套件用，不用拆） | 寫一支 Node 腳本：讀 Firebase 商品 → `bundle()` → `selectComposition()` → `renderMedia({inputProps})`，批次輸出廣告影片 |
| `<Player>` 網頁預覽 | [Player.tsx](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/player/src/Player.tsx) | React、`remotion` | 中（你的 App 是純 JS，需用 Vite 打包一個 React 小 bundle 再掛到某個 `<div>`） | 在倉儲 App 的商品頁加「預覽廣告影片」按鈕，改價格即時看效果 |
| TikTok 式字幕分頁 | [create-tiktok-style-captions.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/captions/src/create-tiktok-style-captions.ts) | 無（純函式） | 低 | 可以整段複製到其他影片專案（如 MoneyPrinter 類）當字幕分頁邏輯；中文需自行改分頁規則（見第 9 節） |
| SRT/VTT 解析與輸出 | [captions/src/](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/captions/src/index.ts) | 無 | 低 | 匯入剪映／其他工具產生的 SRT，或輸出給 YouTube |
| ElevenLabs 時間戳→字幕 | [elevenlabs/src/](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/elevenlabs/src/index.ts) | 無 | 低 | 配音同時拿到逐字字幕時間 |
| OpenAI Whisper API→字幕 | [openai-whisper/src/](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/openai-whisper/src/index.ts) | 無 | 低 | 把 verbose JSON 轉成 `Caption[]` |
| 本機 whisper.cpp 安裝與轉錄 | [install-whisper-cpp/src/](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/install-whisper-cpp/src/index.ts) | whisper.cpp（會下載編譯） | 中 | 免費本機轉字幕，語言列表含 `'zh'`（[languages.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/install-whisper-cpp/src/languages.ts)） |
| 主題→腳本→圖→配音→時間軸 CLI | [template-prompt-to-video/cli/service.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/service.ts)、[timeline.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/timeline.ts) | OpenAI、ElevenLabs | 低 | 把 `openaiStructuredCompletion` 換成 Anthropic API 即可；`timeline.json` 格式可作為你自己的「分鏡表」標準 |
| 文字→動畫程式碼（LLM 產生 React 再即時編譯） | [route.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-motion-graphics/src/app/api/generate/route.ts)、[compiler.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-motion-graphics/src/remotion/compiler.ts) | Next.js、Vercel AI SDK、`@babel/standalone` | 中 | 做一個「輸入一句話→出動畫」的內部工具；`createOpenAI` 換成 `@ai-sdk/anthropic` |
| 官方 Agent Skills | [packages/skills/skills/](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/skills/README.md) | 無（Markdown） | 低 | 直接裝進 Claude Code；也可當你自己影片 skill 的範本 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

**Remotion 核心本身不呼叫任何 AI**。AI 整合分三層：

**(A) 官方 Claude Code 外掛＋Agent Skills（原生支援 Claude）**
- [claude-code-plugin/.claude-plugin/plugin.json](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/claude-code-plugin/.claude-plugin/plugin.json)：外掛名 `remotion`，版本 4.0.540，MIT；[marketplace.json](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/claude-code-plugin/.claude-plugin/marketplace.json) 指向 GitHub `remotion-dev/claude-code-plugin`（發佈用鏡像 repo）。
- [build.mts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/claude-code-plugin/build.mts)：把 `packages/skills/skills/` 底下所有資料夾複製成外掛的 skills。
- Skills 共 13 個資料夾（`ls packages/skills/skills`）：`remotion-best-practices`（總入口）、`remotion-create`、`remotion-markup`、`remotion-studio`、`remotion-render`、`remotion-captions`、`remotion-multimedia`、`remotion-interactivity`、`remotion-maps`、`remotion-saas`、`remotion-docs`、`remotion-upgrade`、`remotion-license`；內含 74 個 `.md` 檔（`find -name '*.md' | wc -l`）。
- 安裝方式（README 原文）：`npx skills add remotion-dev/skills` 或 `gh skill install remotion-dev/skills`；CLI 也內建 `npx remotion skills add/update`（[cli/src/skills.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/cli/src/skills.ts)，實際是呼叫 `npx skills@1.7.0`）。
- 重要規則樣本：[remotion-markup/SKILL.md](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/skills/skills/remotion-markup/SKILL.md)（用 `useCurrentFrame()+interpolate()`，禁止 CSS 動畫）、[voiceover.md](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/skills/skills/remotion-markup/voiceover.md)（ElevenLabs `eleven_multilingual_v2` 逐場景配音＋`calculateMetadata` 依音檔長度設定影片長度）、[transcribe-captions.md](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/skills/skills/remotion-captions/transcribe-captions.md)（`@remotion/whisper-webgpu` 本機 GPU 轉字幕）。
- 另有 `agent-plugin`（Cursor/Codex）、`codex-plugin`、`kimi-code-plugin` 版本。**MCP 伺服器：本次讀取範圍內未看到**（未確認是否在其他套件）。

**(B) 範本 `template-prompt-to-video`（只接 OpenAI＋ElevenLabs）**
- 腳本：`gpt-4.1` 結構化輸出（[service.ts#L13-L56](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/service.ts#L13-L56)）。
- 生圖：`dall-e-3`，尺寸 1024×1792 直式（[service.ts#L62-L111](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/service.ts#L62-L111)，常數在 `src/lib/constants.ts`）。
- Prompt：`getGenerateStoryPrompt`（8–10 句故事，**強制翻成英文**）與 `getGenerateImageDescriptionPrompt`（5–8 張圖描述）在 [service.ts#L114-L150](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/service.ts#L114-L150)。
- 配音：ElevenLabs `convertWithTimestamps`，voiceId 寫死 `21m00Tcm4TlvDq8ikWAM`（[service.ts#L153-L175](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/service.ts#L153-L175)）。
- **換成 Claude**：腳本與分鏡描述這兩步改呼叫 Anthropic Messages API 很容易（只有一個 `fetch`）；生圖 Claude 不支援，需保留 OpenAI 或換其他生圖服務。

**(C) 範本 `template-prompt-to-motion-graphics`（Next.js 網頁，接 OpenAI）**
- [route.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-motion-graphics/src/app/api/generate/route.ts)：`VALIDATION_PROMPT`（L11，先判斷是不是動畫需求）→ 用 `generateObject` 偵測要注入哪些 skill（L359）→ `SYSTEM_PROMPT`（L39）＋skill 內容 `streamText` 產生 React 程式碼（L615）；預設模型字串 `gpt-5.2`（L300）。用 Vercel AI SDK，所以把 `createOpenAI` 換 `createAnthropic` 即可接 Claude（**未實測**）。
- [compiler.ts#L80-L120](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-motion-graphics/src/remotion/compiler.ts#L80-L120)：用 `@babel/standalone` 在瀏覽器把 LLM 產的程式碼轉譯，再 `new Function` 注入 Remotion API 執行——**等於執行 AI 產生的任意 JS**，只適合自己用。
- 內建小型 skills（`src/skills/*.md`：typography、charts、transitions、social-media…）。

**結論**：`claude_support` 判為「原生」——官方直接維護 Claude Code 外掛與 Skills；但範本內的「自動生成腳本」是 OpenAI，需自己改。

## 8. 擴充方式與 API

- **元件即擴充**：任何 React 元件、CSS、Canvas、SVG、Three.js（`@remotion/three`）、Lottie、Google Fonts 都能放進影片。
- **參數化**：`<Composition schema={zodSchema} defaultProps>` → Studio 會出現可編輯表單；CLI 用 `--props='{"price":399}'` 或 JSON 檔傳入（`cli/src/get-input-props.ts`）。
- **Node.js API**：`@remotion/renderer` 匯出 `renderMedia`、`renderStill`（[render-still.ts#L513](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-still.ts#L513)，可做商品圖／縮圖）、`renderFrames`、`stitchFramesToVideo`、`getCompositions`、`selectComposition`、`ensureBrowser`、`openBrowser`。
- **擴充套件**：`npx remotion add <套件>`（CLI `add` 指令）。
- **雲端**：Lambda／Cloud Run／Vercel Sandbox（未讀程式碼）。
- **網頁內嵌**：`@remotion/player`、`Thumbnail`。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：非常活躍。最後推送 2026-11-04（掃描當天），版本 4.0.540，131 個子套件，1,101 個測試檔（從檔案清單計數）；文件約 2,342 個檔。
- **遙測／對外連線**：
  - 渲染用量回報只在傳入 `licenseKey` 時發生（CLI 需 `--license-key rm_sec_...`，[get-license-key.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/cli/src/get-license-key.ts)；回報點 [render.ts#L697-L703](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/cli/src/render-flows/render.ts#L697-L703)）。預設不傳就不回報。
  - 首次渲染會下載 Chrome Headless Shell（Google CDN）。
  - Player 會雜湊你的網域比對黑名單（只在本機比對，未見上傳）。
- **資安**：prompt-to-motion-graphics 會執行 LLM 產生的程式碼（`new Function`），不要部署成公開服務。
- **已知的坑**：
  1. **不能用 CSS 動畫／transition、Tailwind 動畫類別**，全部要改用 frame 計算。
  2. 非同步資料（Firebase、圖片）必須 `delayRender()`，否則截到空白；逾時會失敗。
  3. **中文字幕分頁問題**：`createTikTokStyleCaptions` 只在 token「以空白開頭」時才換頁（[L66-L82](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/captions/src/create-tiktok-style-captions.ts#L66-L82)），中文沒有空白，整段會擠成一頁——要自己在 token 加 `pageBreakAfter` 或改分頁規則。
  4. prompt-to-video 的故事 prompt 寫死「translated into English」，中文要改 prompt；ElevenLabs voiceId 寫死英文女聲。
  5. 平行渲染吃記憶體，預設最多 8 個 Chrome 分頁。
  6. 授權：員工一旦超過 3 人就需要付費；v5 授權條款將變更（細節未確認）。
  7. 範本 README 寫原始碼位於 `packages/template-ai-video`，但實際資料夾是 `packages/template-prompt-to-video`（文件與目錄不一致）。

## 10. 跟其他專案組合的建議

- **Remotion（合成引擎）＋ MoneyPrinterTurbo / ViMax / huobao-drama（腳本與素材生成）**：讓那些專案負責「主題→腳本→分鏡→生圖/素材→配音」，最後輸出一份 `timeline.json`，交給 Remotion 用 React 範本做出品牌一致、可精準控制的畫面與字幕。Remotion 的 `timeline.json` 結構（elements／text／audio，見 [timeline.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/timeline.ts)）可當共同中介格式。
- **Remotion ＋ 你的倉儲 App（Firebase）**：寫一支 Node 腳本，從 Firestore 讀商品（名稱、售價、成本、圖片 URL），批次 `renderMedia` 出廣告影片；或用 `renderStill` 出商品主圖、價格標籤圖。
- **Remotion ＋ 網頁版 Excel 類專案**：試算表當「影片排程表」——每一列＝一支影片（商品、文案、價格、尺寸），按一鍵批次渲染。
- **Remotion ＋ Claude Code skills（digitalsamba/claude-code-video-toolkit、marketingskills 等）**：Remotion skills 管「怎麼寫影片程式」，行銷 skills 管「文案怎麼寫」，兩者一起裝進 Claude Code。
- **與 heygen-com/hyperframes 比較**：兩者都是「HTML/程式碼→影片」，Remotion 生態最大、文件最多，但有授權門檻。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有／未確認 | 程式碼位置與說明 |
|---|---|---|
| 輸入（主題） | 有（範本） | [cli.ts#L87](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/cli.ts#L87) `generateStory`：輸入標題＋主題。核心本身只吃 props |
| 輸入（商品圖／素材） | 有（手動） | 放 `public/` 用 `staticFile()`，或 URL＋`<Img>`；沒有自動抓商品頁功能 |
| 輸入（小說） | 沒有 | 無長文拆章節功能 |
| 腳本 | 有（範本，OpenAI） | [service.ts#L114-L123](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/service.ts#L114-L123)，gpt-4.1，8–10 句 |
| 分鏡 | 有（範本） | [service.ts#L125-L150](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/service.ts#L125-L150) 產 5–8 張圖描述；[timeline.ts#L9-L60](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/timeline.ts#L9-L60) 依音檔時間組時間軸 |
| 畫面：素材庫 | 沒有 | 無 Pexels 等素材庫串接 |
| 畫面：AI 生圖 | 有（範本） | dall-e-3（付費），[service.ts#L62-L111](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/service.ts#L62-L111) |
| 畫面：AI 生影片 | 沒有 | 未見串接任何文生影片模型 |
| 畫面：程式繪製 | 有（核心強項） | React/CSS/SVG/Canvas/Three.js；prompt-to-motion-graphics 讓 LLM 直接寫動畫程式 |
| 配音 TTS | 有（範本／skill） | ElevenLabs（付費），[service.ts#L153-L175](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/service.ts#L153-L175)；skill 說可換任何能產音檔的 TTS |
| 聲音複製 | 未確認 | 程式只用 voiceId；ElevenLabs 帳號本身是否可複製聲音不在本 repo |
| 字幕 | 有 | [captions](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/captions/src/index.ts)、[Subtitle.tsx](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/src/components/Subtitle.tsx)；Whisper（本機 whisper.cpp 免費／OpenAI API 付費／WebGPU 本機） |
| 配樂 | 有（手動） | `<Audio>` 元件（`@remotion/media`）＋音量曲線；`sfx` 套件提供音效（未讀）。無 AI 配樂 |
| 合成 | 有（核心） | Chrome 截圖＋ffmpeg，[render-media.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts) |
| 輸出 | 有 | `validCodecs` 列有 h264（預設）、h265、vp8、vp9、av1、prores、h264-mkv、h264-ts、gif，以及 mp3／aac／wav 純音訊（[codec.ts#L1-L19](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/codec.ts#L1-L19)）；靜態圖用 `renderStill`；可任意尺寸（9:16、1:1） |

- **每步模型與成本**：腳本 gpt-4.1、生圖 dall-e-3、配音 ElevenLabs `eleven_multilingual_v2`（skill）或預設模型（範本）；渲染本機免費。各服務實際單價**未確認**（本次未查官網）。
- **中文（繁中、台灣口音）配音與字幕**：Remotion 可顯示任何中文字型（Google Fonts 套件、或本機字型）；whisper.cpp 支援 `zh`。但 (1) 範本 prompt 強制英文，要改；(2) TikTok 字幕分頁依賴空白，中文要自行處理；(3) 台灣口音取決於你選的 TTS 聲音，本 repo 無台灣口音設定——**未確認**。
- **Claude 怎麼用**：**Claude Code 外掛＋Skills（原生）**最推薦；Anthropic API 需自行把範本的 OpenAI 呼叫換掉（腳本步驟容易換，生圖不能換成 Claude）；motion-graphics 範本走 Vercel AI SDK，換 Anthropic provider 即可。
- **個人電腦能不能跑**：可以，CPU 即可渲染；只有 whisper-webgpu 需要 GPU。AI 生圖／配音走雲端 API。
- **最適合做**：**電商商品影片、廣告素材（資料驅動批次產出）** ＞ 解說影片／數據動畫 ＞ 短劇（短劇需要大量 AI 生圖/生影片與角色一致性，Remotion 只負責剪輯合成，不是主力）。
- **法律風險**：(1) Remotion 授權：員工 >3 人需付費、不可轉賣衍生工具；(2) dall-e-3／ElevenLabs 產出物的商用條款依各平台規定（未確認）；(3) 字型授權——Google Fonts 多為 OFL 可商用，自備字型要自己確認；(4) 商品圖、背景音樂、名人肖像需自行確認版權；(5) 投放 Meta/TikTok 廣告時，AI 生成內容可能需依平台規範標示（未確認各平台現行規定）。

## 關鍵字
Remotion、React 影片、程式化影片、programmatic video、video as code、Composition、Sequence、interpolate、spring、useCurrentFrame、delayRender、renderMedia、renderStill、Remotion Player、Remotion Studio、Remotion Lambda、Chrome Headless、Puppeteer、ffmpeg、批次產生影片、電商廣告影片、商品影片、動態字幕、TikTok 字幕、SRT、Whisper、whisper.cpp、ElevenLabs、TTS 配音、OpenAI、DALL-E 3、prompt-to-video、prompt-to-motion-graphics、Claude Code plugin、Agent Skills、remotion-best-practices、Vercel AI SDK、自訂授權、Company License、3 人以下免費、影片・腳本
