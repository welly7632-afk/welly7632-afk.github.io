# lemomo-ai/lemo-opuscar — 給 Claude Code 用的「程式碼拍片」風格庫：66 種影片風格 prompt＋逐格渲染工具鏈，不用任何影片生成模型
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：bebbbe1
> GitHub：https://github.com/lemomo-ai/lemo-opuscar｜⭐ 12152｜授權：MIT（程式碼與文件）＋ CC BY 4.0（demo 影片與截圖）｜主要語言：JavaScript｜最近更新：2026-10-31

> 本資料包的 permalink 都指向 commit `bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00`。掃描方式：shallow + blobless clone，sparse checkout 排除圖片／影音／字型／`.bin`，只讀不執行。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這不是「AI 影片生成器」，而是一套讓 Claude Code 當導演、**用網頁程式碼（Canvas 2D／WebGL／three.js）一格一格畫出整支影片**的工作方法＋工具箱；配音用 TTS、配樂用免費取樣音色庫＋程式合成、最後用 ffmpeg 合成 MP4。

對你（台灣小老闆、會用 Claude 寫 JS、跑廣告）可以拿來做：

1. **商品廣告／開箱短片**：`glass-product`（玻璃質感產品）、`teardown`（產品拆解）、`dark-keynote`（暗色科技發布）、`one-line`（一筆畫極簡廣告）、`rubber-hose`（1930s 卡通，標註適合 Food & drink／Retro ads）、`halftone-dossier`（標註 Pet content／Social shorts）、`papercut-red`（紅色窗花剪紙，適合過年檔期）。
2. **使用教學／商品說明影片**：`midcentury-toon`（50s 扁平卡通，用途寫 Set-up guides／How-to）、`living-screencast`（軟體操作教學）、`iso-infographic`（流程說明）。
3. **數據／價格比較類素材**：`dataviz`、`data-physical`、`news-package`（裡面有「price board」報價板畫面）、`caption-news`（靜音也看得懂的大字幕社群短片，有 9:16 直式排版規則）。
4. **短劇／角色劇情**：`scifi-toon`（有角色對白與對嘴 lip sync）、`cel-anime-80s`、`crayon-book`、`ink-wash`（武俠）、`shadow-puppet`（皮影戲）。
5. **最值得「拆」的是工具鏈本身**：`window.render(t)` 網頁 → 無頭 Chrome 逐格截圖 → ffmpeg 的渲染器、edge-tts 中文配音、Whisper 語音校對、SRT 字幕、−14 LUFS 響度標準化。這些可以直接接到你自己的倉儲 App（例如把庫存/價格資料自動做成每日商品短片）。

限制先講：每支片要 Claude 跑 30–60 分鐘、吃不少 token；風格是為 Claude Opus 5.5 調校的；**不能用真人或實拍來生成畫面**（除了「剪輯與紀實」類可用你自己的素材剪）。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

依 [README.md#L382-L392](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/README.md#L382-L392) 與 [LICENSE](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/LICENSE)：

- **程式碼與文件（含 66 份 STYLE.md 風格 prompt）**：MIT（Copyright 2026 LemoLab）。個人、公司、商用、修改、閉源再利用都可以，保留授權聲明即可。
- **官方 demo 影片與截圖**：CC BY 4.0，可商用但要標註 LemoLab＋連結。
- **你用它做出來的影片**：歸你，不需標註。
- **例外**：三支 demo 的配音不在 CC BY 範圍內（Game Show 用 macOS `say`、Paper-cut Lightbox 用 Microsoft Edge TTS、Broadcast News Package 用豆包 TTS），不要拿去重用。
- **第三方素材**：各 demo 的 `CREDITS` 各自授權；取樣音色庫授權列在 `core/audio/INSTRUMENTS.md`，`sampler.py credits()` 會幫你產生標註文字。
- **商用要注意的真正坑**：中文配音預設用 edge-tts（呼叫微軟線上服務），[core/tts/tts_zh.py#L1-L12](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/tts/tts_zh.py#L1-L12) 自己就寫「商用前請自行確認微軟條款」。公司廣告建議改用自己錄音、或有商用授權的 TTS。
- **沒有閉源或付費版**：沒有看到任何付費功能或 Pro 版。另有「plugin directory edition」（不含 demo 原始碼）見 `tools/directory/README.md`，內容一樣是 MIT。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容（已驗證） |
|---|---|
| 畫面 | 每支片是一個 `index.html`，純 JS（ES modules），Canvas 2D 為主；3D 用 three.js r170（`package.json` 依賴 `three ^0.170.0`）；後製用 WebGL2 shader |
| 渲染 | Node 20+、`playwright-core` 開 headless Chromium 逐格截 JPEG，pipe 給 ffmpeg（libx264） |
| 聲音 | Python 3.11+：numpy／scipy／soundfile／soxr（核心）；kokoro-onnx（英文離線 TTS）、edge-tts（中文線上 TTS）、faster-whisper（語音校對）；numba（撥弦物理模擬） |
| 後端／資料庫 | **無**。沒有伺服器程式、沒有資料庫；只有本機 127.0.0.1 的靜態檔伺服器供渲染用 |
| 部署 | 本機 CLI 工作流；作者的展示站用 GitHub Pages（`.github/workflows/pages.yml`）發佈 |
| 系統需求 | Node 20+、**ffmpeg 7+**（Ubuntu 24.04 內建 6.1 太舊）、Python 3.11+ 或 uv；在 macOS Apple Silicon 開發，Linux 應可，Windows 要 WSL；3D／shader 風格需要 GPU（[TECHNIQUE.md#L15-L31](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/TECHNIQUE.md#L15-L31)） |
| 磁碟 | 核心約 350 MB；語音層約 0.55 GB＋Whisper 模型（英 145 MB／中 480 MB）；音樂層約 140 MB；取樣音色庫每套 70–400 MB，全部約 1.4 GB |
| API Key | **不需要任何付費 API Key**。只需要 Claude Code（訂閱或 API 計費）。選用：`DOUBAO_API_KEY`（只在 news-package demo 的豆包 TTS 工具）、Codex CLI（只在 news-package 生插圖的選用工具） |
| 費用 | 主要成本是 Claude token：README 說一支片 30–60 分鐘、「a fair amount of tokens」，具體金額**未確認**。TTS／配樂／渲染都免費（edge-tts 為免費線上服務，但條款風險見上） |

輸出預設 1920×1080、24 fps；直式用 `--size 1080x1920`（[core/render/page.mjs#L17-L23](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/page.mjs#L17-L23)）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree -r --name-only HEAD` 共 2,478 個檔案；以副檔名計 `.js` 470、`.mjs` 79、`.py` 336、`.sh` 109、`.html` 78、`.json` 439、`.md` 185。`core/` 共用工具 2,212 行（`cat | wc -l`）；`styles/*/demo` 的 js/mjs/py/sh（排除 vendor 與 .min.js）約 126,399 行。

```
lemo-opuscar/
├─ README.md / README.zh-CN.md   使用說明、66 種風格縮圖、授權
├─ AGENTS.md (CLAUDE.md 只寫 @AGENTS.md)  給 Claude 的總指令：開場、選風格、工作流程
├─ DIRECTOR.md       導演方法：故事、treatment、分鏡、聲音、節奏、運鏡、交付、版權紅線、地圖規則
├─ TECHNIQUE.md      製作方法：render(t) 合約、TTS、配樂、混音、字幕、3D
├─ MY-STYLES.md      「把風格改成自己的／從空白做新風格」流程，存到 ~/lemo-my-styles/
├─ MAINTAINING.md    作者新增官方風格的流程
├─ core/             ★ 共用工具（最值得拆）
│  ├─ lib.js         決定性亂數 mulberry/hash、easing、monotone 插值、track 關鍵影格
│  ├─ render/        video.mjs 逐格渲染、still.mjs 預覽、events.mjs、readcheck.mjs 閱讀時間檢查、
│  │                 page.mjs/serve.mjs/browser.mjs 無頭瀏覽器、mux.sh 合成＋響度、srt.py 字幕、sheet.py 縮圖表、slot.mjs 併發限制
│  ├─ tts/           tts.py (Kokoro 離線)、tts_zh.py (edge-tts 中文)、asr_check.py (Whisper 校對)
│  ├─ audio/         sfx.py 程式合成音效、sampler.py 取樣器、pluck.py 撥弦物理模擬、INSTRUMENTS.md
│  ├─ three/post.js  three.js 景深/GTAO/bloom/調色/2× 超取樣
│  ├─ post/crt.js    CRT/VHS 後製 shader
│  ├─ fonts/         幾套 OFL 字型子集（中文 ZCOOL 只有約 200 字）
│  └─ assets/polyhaven/  CC0 模型與材質
├─ styles/<slug>/    66 種風格＋_template
│  ├─ STYLE.md       ★ 風格 prompt（固定 11 節）
│  ├─ DEMO.md        作者那支 demo 怎麼做的
│  ├─ style.json     名稱、分類、用途標籤、片長
│  ├─ <slug>.srt     demo 字幕
│  └─ demo/          demo 完整原始碼＋build.sh＋CREDITS
├─ plugin/           Claude Code plugin：skills/lemo-opuscar/SKILL.md＋scripts/setup.sh
├─ .claude-plugin/marketplace.json  plugin marketplace 定義（名稱 lemolab）
├─ styleboard/       作品展示站產生器（build.py、catalog.json、HTML 模板）
├─ tools/            fetch.sh 下載大型素材（從 GitHub Release）、publish/release 腳本、directory/ 外掛目錄版
└─ requirements*.txt / package.json  依賴分層
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 畫面＝時間的函式（整個專案的核心合約）**
→ [TECHNIQUE.md#L33-L43](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/TECHNIQUE.md#L33-L43)、[core/README.md#L18-L28](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/README.md#L18-L28)
重點：頁面只要提供 `window.DUR`、`window.render(t)`、`window.READY`，選用 `window.EV`（音效事件）與 `window.TEXTS(t)`（畫面上所有文字與位置）。規定**決定性**：不准 `Date.now()`、不准無種子 `Math.random()`、不准依賴上一格狀態，所以任一格可單獨、平行渲染。

**5.2 逐格渲染器**
→ [core/render/video.mjs#L39-L72](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/video.mjs#L39-L72)
重點：把總格數切給 N 個 worker（預設 3，最多 6），每個 worker 開一個 Chromium，`page.evaluate(t => window.render(t))` 後 `page.screenshot({type:'jpeg', quality:95})`，直接 pipe 進 ffmpeg（`-c:v mjpeg` 輸入、libx264 crf 14），最後 concat 無損合併。有 `.lock` 檔避免兩個渲染寫同一輸出。

**5.3 無頭瀏覽器頁面載入與錯誤處理**
→ [core/render/page.mjs#L25-L61](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/page.mjs#L25-L61)、[core/render/serve.mjs](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/serve.mjs)
重點：頁面 JS 錯誤或 script 404 直接中止（不產生壞片）；等 `window.READY` 最多 180 秒；靜態伺服器只聽 127.0.0.1、擋 DNS rebinding、檔案路徑不可跳出根目錄；專案在 library 外時掛載到 `/@film/`。

**5.4 中文配音（edge-tts）**
→ [core/tts/tts_zh.py#L63-L103](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/tts/tts_zh.py#L63-L103)
重點：`lines.json` 每行可設 `voice`／`rate`／`pitch`／`say`（念的字可跟字幕不同，例如數字念法）；以 sha1 快取 mp3、先寫 `.part` 再改名；ffmpeg 轉 24 kHz 單聲道並裁頭尾靜音，輸出 `<id>.wav`＋`dur.json`。預設聲音 `zh-CN-XiaoxiaoNeural`。

**5.5 語音校對（Whisper）**
→ [core/tts/asr_check.py#L70-L146](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/tts/asr_check.py#L70-L146)
重點：把每句 TTS 用 faster-whisper 轉回文字比對；中文按字元相似度（預設 ≥0.92），數字依「值」比對（十九＝19、一万九千＝1.9万），還會輸出逐字時間戳 `words.json` 供字幕對齊。

**5.6 配樂與音效**
→ [core/audio/sampler.py#L562-L640](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/audio/sampler.py#L562-L640)（`note`／`hit`／`chord`／`render`）、[core/audio/pluck.py#L90](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/audio/pluck.py#L90)（撥弦樂器預設，古琴、琵琶等）、[core/audio/sfx.py#L117-L139](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/audio/sfx.py#L117-L139)（壓縮、限幅、`add()` 混音）
重點：樂譜寫成事件 `(時間, 樂器, 音高, 長度, 力度, 聲像)`；取樣不夠長會無縫延長；音效（click、whoosh、ding…）全用濾波器＋包絡程式合成，由 `window.EV` 驅動，精準落在影格上。

**5.7 合成與響度**
→ [core/render/mux.sh](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/mux.sh)（註解 L1-L20）
重點：兩段式 `loudnorm` 到 −14 LUFS／TP −1.2 dB（社群平台常見標準），可加 ffmpeg 顆粒；音訊損毀或被截斷會拒絕輸出。

**5.8 字幕**
→ [core/render/srt.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/srt.py)（13 行）、[core/render/readcheck.mjs](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/readcheck.mjs)
重點：`[{t0,t1,text}]` → `.srt`，重疊自動裁切；字幕另外「燒」在畫面裡（字幕設計屬於風格）。readcheck 檢查每段文字停留夠久：中文字數 ÷ 4.5 ＋ 1.5 秒。

**5.9 一支完整片的範例：玻璃質感產品**
→ [styles/glass-product/demo/build.sh](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/glass-product/demo/build.sh)、[story.js](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/glass-product/demo/story.js)、[product.js#L142-L150](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/glass-product/demo/product.js#L142-L150)
重點：`story.js` 一個檔案定義 BPM、所有鏡頭切點、旁白時間、音效事件（音樂、畫面、混音共用同一時間軸）；`build.sh` 六步：配音→校對→配樂→事件匯出＋混音→渲染→合成＋字幕＋自檢。`explode()` 是爆炸圖動畫（零件沿軸展開、各帶決定性傾角）。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 逐格渲染器（HTML→MP4） | [core/render/video.mjs](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/video.mjs)＋page/serve/browser.mjs | Node、playwright-core、ffmpeg | 低 | 你的 JS 頁面只要實作 `window.render(t)`，就能把倉儲/價格資料做成影片；4 個 .mjs 檔一起複製即可 |
| 動畫小工具庫 | [core/lib.js](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/lib.js) | 無 | 低 | 44 行純 ES module，easing／彈簧／關鍵影格插值，也能用在你的網頁 App 動效 |
| 中文 TTS 批次 | [core/tts/tts_zh.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/tts/tts_zh.py) | edge-tts、numpy、soundfile、ffmpeg | 低 | 換 `--voice` 成台灣語音即可（見 §11）；輸出格式通用 |
| TTS 語音校對 | [core/tts/asr_check.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/tts/asr_check.py) | faster-whisper | 中 | 任何 TTS 管線都可接，順便取得逐字時間碼做字幕 |
| 合成＋響度標準化 | [core/render/mux.sh](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/mux.sh) | ffmpeg 7+ | 低 | 任何影片工具最後一步都可用，確保投放平台音量一致 |
| SRT 產生 | [core/render/srt.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/srt.py) | 無 | 低 | 13 行，直接複製 |
| 程式合成音效 | [core/audio/sfx.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/audio/sfx.py) | numpy、scipy | 低 | 免版權音效（點擊、咻、叮），廣告短片很好用 |
| 取樣器＋撥弦 | [core/audio/sampler.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/audio/sampler.py)、[pluck.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/audio/pluck.py) | numpy、soxr、numba、音色庫下載 | 中 | 讓 Claude 寫原創配樂避開音樂版權；音色庫要另外 `tools/fetch.sh` |
| 商品照去背工具 | [styles/briefing-board/demo/kit/tools/prep_object.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/briefing-board/demo/kit/tools/prep_object.py) | BiRefNet ONNX（~970 MB）、onnxruntime、Pillow | 中 | 商品照→去背 PNG＋統一調色，可接電商上架或影片素材 |
| three.js 玻璃商品棚 | [styles/glass-product/demo/](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/glass-product/demo/build.sh)（studio.js、product.js） | three r170、GPU | 高 | 換掉 `product.js` 幾何就能放你的商品模型；需要 3D 基礎 |
| 風格 prompt 範本 | [styles/_template/STYLE.md](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/_template/STYLE.md) | 無 | 低 | 用同樣 11 節結構寫你自己的「品牌影片風格書」 |
| 導演 SOP | [DIRECTOR.md](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/DIRECTOR.md) | 無 | 低 | 可直接當成其他 AI 影片工具的腳本/分鏡 prompt（注意 §13 地圖規則，見 §9） |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **Claude 是唯一的「大腦」**：程式裡**沒有**呼叫 Anthropic 或 OpenAI API（我 grep `api.anthropic`、`api.openai`、`ANTHROPIC_API_KEY`、`OPENAI_API_KEY` 在 .py/.js/.mjs/.sh 裡都沒有結果）。所有「AI」都是 Claude Code 本身讀文件、寫 JS／Python、執行工具。
- **Claude Code plugin＋skill（原生）**：[plugin/skills/lemo-opuscar/SKILL.md](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/plugin/skills/lemo-opuscar/SKILL.md)，安裝：`claude plugin marketplace add lemomo-ai/lemo-opuscar` → `claude plugin install lemo-opuscar@lemolab`（[README.md#L56-L99](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/README.md#L56-L99)）。skill 會跑 [scripts/setup.sh](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/plugin/skills/lemo-opuscar/scripts/setup.sh) 把 library sparse clone 到 `~/lemo-opuscar`，再交給 `AGENTS.md`。
- **Prompt 放哪**：三層——`AGENTS.md`（流程，[L65-L79](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/AGENTS.md#L65-L79)）、`DIRECTOR.md`（導演方法，treatment 八項見 [L43-L54](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/DIRECTOR.md#L43-L54)）、`styles/<slug>/STYLE.md`（風格本身）。
- **STYLE.md 結構**（固定 11 節，見 [_template](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/_template/STYLE.md)）：1 本質與不是什麼／2 材質與渲染／3 色彩邏輯／4 字體與字幕／5 動態質感／6 運鏡文法（表格）／7 聲音調色盤／8 原生招式（每招附「適合內容」）／9 媒材陷阱／10 Engine（指向 demo 程式）／11 變化空間。66 份 STYLE.md 大小 10.7 KB（swiss-motion）到 30.6 KB（transit-map），合計約 932 KB（`wc -c`）。範例：[glass-product/STYLE.md](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/glass-product/STYLE.md)。
- **MCP**：沒有。
- **其他模型**：README 明說風格為 Opus 5.5 調校，其他模型可能做不好。其他 agent 可把 `plugin/skills/lemo-opuscar/` 複製到自己的 skills 資料夾。唯一碰到其他 AI 的地方：news-package 的選用工具 [gen_image.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/news-package/demo/tools/gen_image.py)（透過 Codex CLI 生插圖）與 [tts_doubao.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/news-package/demo/tools/tts_doubao.py)（豆包 TTS），都是選用。

## 8. 擴充方式與 API

- **新增自己的風格**：照 [MY-STYLES.md](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/MY-STYLES.md) 流程，Claude 一題一題問（品牌色、logo、直式尺寸 1080×1920 或 1080×1440…）→ 摘要確認 → 先渲一張 style frame（與原風格左右對照）→ 15–30 秒 demo → 存到 `~/lemo-my-styles/<slug>/`（style.json、STYLE.md、CHANGES.md、DEMO.md、demo/）。適合做「你的品牌專屬影片風格」。
- **頁面合約就是 API**：`window.render(t)`／`DUR`／`READY`／`EV`／`TEXTS`；CLI 參數 `--size WxH`、`--q 'content=content_alt.json'`（同一引擎換內容渲第二版，見 [TECHNIQUE.md#L80](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/TECHNIQUE.md#L80)）。
- **content.json 型「場景風格」**：`hologram-hud`、`midcentury-toon` 等 demo 從 `demo/content.json` 讀文字（有 `content_alt.json` 範例）。官方說換 content.json 只是技術測試、不是正式出片方法，但對你來說，**這就是做「範本化商品說明片」最直接的入口**。
- **環境變數**：`LEMO_OPUSCAR_HOME`、`PLAYWRIGHT_CHROME`、`LEMO_ANGLE`、`RENDER_SLOTS`、`WHISPER_MODEL`、`HF_ENDPOINT`（[core/README.md#L68-L78](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/README.md#L68-L78)）。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：2026-09-26 建立，最近 push 2026-10-31，README 有 10-16、10-22、10-29 三次新增風格公告，作者很活躍；但專案才一個多月，介面可能還會變。單一作者（Lemomo／LemoLab）。
- **測試**：沒有自動化測試套件，CI 只有發佈展示站（pages.yml）。有 10 個 `test.js`／`tests.js`／`test.html`（例如 `styles/ink-wash/demo/test.js`），但看內容是渲染角色姿勢/表情的「測試畫面模式」，不是單元測試。品質靠工具內建自檢（readcheck、asr_check、mux 響度檢查、DIRECTOR §11 交付檢查表）。
- **程式碼品質**：`core/` 錯誤訊息非常完整（每個失敗都說原因與解法）、寫檔用 `.part`→rename 防半檔、渲染有 lock。demo 程式碼量大（約 12.6 萬行）且各自為政，拆的時候要挑。
- **資安／隱私**：本機伺服器只綁 127.0.0.1 並擋 DNS rebinding；沒看到遙測或分析程式碼（grep `analytics`／`gtag`／`telemetry` 無結果）。edge-tts 會把旁白文字送到微軟；Whisper/HF 模型首次會下載。plugin 每次使用會 `git fetch` + `reset --hard` 更新 `~/lemo-opuscar`（只影響它自己管理的那份 clone）。
- **⚠ 對台灣使用者特別要注意**：[DIRECTOR.md#L140-L148](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/DIRECTOR.md#L140-L148)（§13 地圖）寫死要求：畫到中國時要依中國標準地圖、「Taiwan and the mainland are one country, in the same colour」、字幕與旁白中台灣不能被列為國家。Claude 照這份指令出片時會套用這些規則。若你的影片會出現地圖或國家清單，建議在自己的 fork 或專案 CLAUDE.md 改寫這一節。
- **已知的坑**：ffmpeg 6.x 會讓 mux 失敗；Kokoro 需要短路徑（<160 bytes）；3D 在沒有 GPU 的 Linux 會掉到軟體渲染很慢；內建中文字型只有約 200 字，繁體要自己下載 Noto Sans TC 子集（TECHNIQUE.md 範例寫的是 Noto Sans SC）；`glass-product` 規定商品必須是「虛構的」（[STYLE.md#L10](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/glass-product/STYLE.md#L10)），拍自家商品要用 MY-STYLES 改一份。

## 10. 跟其他專案組合的建議

- **＋你的倉儲 App（Firebase、純 JS）**：最有價值的組合。把 `core/render/` 的渲染器搬到一台本機或雲端機，寫一個讀 Firestore 商品/價格資料的 `index.html`（實作 `render(t)`），就能自動產「今日新品」「價格比較」「庫存出清」短片。可參考 `news-package` 的報價板、`dataviz` 的數字動畫。
- **＋網頁版 Excel 類專案**：試算表當「腳本／分鏡表」：每列一個鏡頭（秒數、旁白、畫面文字、商品 ID），匯出 JSON 給 `story.js`／`lines.json`／`cues.json`，等於做出非工程師也能編的影片範本。
- **＋AI 生圖／生影片專案**：本專案刻意不用生成模型；若要真人感或實拍感，可把 AI 生成的商品圖當素材，用 `prep_object.py` 去背後放進 Canvas 場景，再用這裡的配音/配樂/字幕/響度管線收尾。
- **＋其他短劇生成專案**：別人負責長篇故事與分集，這裡的 `scifi-toon` 對嘴（[voice.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/scifi-toon/demo/voice.py) 以 RMS＋頻譜重心算每 1/24 秒的嘴型）與 DIRECTOR.md 的分鏡方法可補畫面與節奏。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有 | 位置與說明 |
|---|---|---|
| 輸入：主題 | 有 | 直接對 Claude 說主題＋風格（[README.md#L85-L99](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/README.md#L85-L99)）；Claude 只問一次：素材、語言、要不要先看分鏡 |
| 輸入：商品圖／自有素材 | 有（部分） | 可提供 logo、照片、影片、聲音（[DIRECTOR.md#L22-L24](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/DIRECTOR.md#L22-L24)）；「剪輯與紀實」8 種風格以真實素材剪；`teardown` 要 CAD 檔；去背工具見 §6 |
| 輸入：小說 | 沒有 | 沒有長文本拆集功能，預設片長 30–60 秒 |
| 腳本 | 有 | Claude 寫 `TREATMENT.md`：三個候選結構、logline、benchmark、鏡頭表、逐秒 beat sheet、cue map、音效表、字幕設計（[DIRECTOR.md#L43-L54](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/DIRECTOR.md#L43-L54)） |
| 分鏡 | 有（選用） | 6–9 個關鍵鏡頭用真實程式渲染後拼成一張（`sheet.py`），使用者確認才繼續（DIRECTOR.md §5） |
| 畫面：素材庫 | 沒有 | 明確不用 stock footage；只有少量 CC0 Poly Haven 模型/HDRI |
| 畫面：AI 生圖 | 沒有（核心） | 只有 news-package 的選用 Codex 生插圖工具 |
| 畫面：AI 生影片 | 沒有 | 「no video model」是專案賣點 |
| 畫面：程式繪製 | 有 | 全部：Canvas 2D／WebGL2／three.js，[video.mjs](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/video.mjs) 逐格截圖 |
| 配音 TTS | 有 | 英文 Kokoro 離線免費；中文 edge-tts 線上免費（[tts_zh.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/tts/tts_zh.py)）；Kokoro 也能離線念中文但較平 |
| 聲音複製 | 沒有 | 沒有 voice clone；可直接用你自己的錄音 |
| 字幕 | 有 | 燒錄字幕＋`.srt`（[srt.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/srt.py)），readcheck 檢查閱讀時間 |
| 配樂 | 有 | 原創配樂：取樣音色庫（VSCO 2 CE、VCSL、FreePats、Karoryfer、Salamander）＋撥弦物理模擬＋numpy 合成，全免費 |
| 音效 | 有 | `sfx.py` 程式合成，依 `window.EV` 對齊影格 |
| 合成 | 有 | `mux.sh`：ffmpeg、兩段式 loudnorm −14 LUFS |
| 輸出 | 有 | MP4（預設 1920×1080／24 fps，可 `--size 1080x1920` 直式）、poster.jpg、.srt、CREDITS、可一鍵重建的 build.sh |

**每步成本**：腳本/分鏡/畫面程式＝Claude token（每支片 30–60 分鐘，金額未確認）；TTS、Whisper、配樂、渲染、合成＝免費（本機運算）；edge-tts 免費但屬微軟線上服務。

**中文（繁中、台灣口音）**：程式本身支援任何 edge-tts 聲音（`--voice` 或每句 `voice` 欄位），repo 內實際用到的只有 `zh-CN-XiaoxiaoNeural`（23 次）與 `zh-CN-YunxiNeural`（1 次），**全 repo 找不到 `zh-TW`**。edge-tts 的台灣聲音（如 `zh-TW-HsiaoChenNeural`）可用 `python -m edge_tts --list-voices` 查，但本次**未驗證**。另外 `asr_check.py` 中文是逐字比對，Whisper 輸出簡體或繁體不一定跟你的繁中腳本一致，可能誤判，**未確認**，必要時用每句的 `asr` 欄位覆寫。字型要自備繁中子集。

**Claude 怎麼用**：原生 Claude Code plugin＋skill（`/lemo-opuscar:lemo-opuscar`）；不需要 Anthropic API Key 以外的東西，也沒有 OpenAI 相容介面。

**個人電腦能不能跑**：可以，全部在本機跑（TTS 中文除外要連網）。2D 風格一般電腦即可；3D/shader 風格（依關鍵字粗估約 16 種 demo 用到 three.js）要 GPU；作者在 Apple Silicon Mac 開發。Windows 要 WSL。記憶體需求**未確認**。

**最適合做**：解說影片 ★★★★★（Evidence Films、whiteboard、dataviz 等是強項）＞ 廣告素材／品牌形象片 ★★★★（風格化、有質感，但不是寫實商品照）＞ 電商商品影片 ★★★（要寫實商品外觀時不如實拍或 AI 生圖；適合「概念式」開箱、規格說明、節慶檔期）＞ 短劇 ★★（有角色對白與對嘴，但每支只有 30–60 秒，做連續劇成本高）。

**法律風險**：
- 版權：專案強制只用 CC0／CC BY／OFL 素材並產生 `CREDITS`（[TECHNIQUE.md#L143-L149](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/TECHNIQUE.md#L143-L149)），音樂原創，風險相對低。
- 肖像權／商標：DIRECTOR.md §12 禁止使用非你所有的品牌、角色、作品（[L134-L138](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/DIRECTOR.md#L134-L138)）；畫面全為程式繪製，不涉及真人肖像。
- 平台條款：edge-tts 商用條款需自行確認；三支 demo 的配音不可重用。
- 政治敏感：地圖規則（§9 已說明）在台灣投放廣告時可能造成爭議，出片前要檢查。

## 關鍵字
lemo-opuscar、Lemomo、LemoLab、Claude Code plugin、Claude Code skill、Claude Opus 5.5、程式碼生成影片、code-rendered video、影片風格庫、film style prompt、STYLE.md、風格 prompt、AI 導演、headless Chrome 逐格渲染、Playwright、three.js、Canvas 2D、WebGL2、ffmpeg、loudnorm −14 LUFS、edge-tts、Kokoro TTS、faster-whisper、語音校對、SRT 字幕、原創配樂、取樣器 sampler、程式合成音效、商品廣告影片、產品拆解 teardown、玻璃質感產品 glass product、解說影片 explainer、資料視覺化影片、短劇、對嘴 lip sync、直式短影音 1080x1920、MIT、CC BY 4.0
