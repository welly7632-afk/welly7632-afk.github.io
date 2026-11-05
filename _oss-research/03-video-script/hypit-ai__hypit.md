# hypit-ai/hypit — 給 Claude Code 用的「爆款影片複製」影片編排引擎（SVML 標記語言＋本機渲染＋多家生成模型串接）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：67c1545
> GitHub：https://github.com/hypit-ai/hypit｜⭐ 27938｜授權：自訂授權「Hypit Open Source License」（修改版 Apache-2.0＋附加條件）｜主要語言：TypeScript｜最近更新：2026-11-04

> 本文所有 permalink 都以 commit `67c15455832cea5eed8198407c488116921f5e6a` 為準，只列我實際打開過的檔案。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** Hypit 不是一個「按一下就出片」的網頁 App，而是一套讓 Claude Code（或 Codex）當「導演」的影片製作系統——它提供一個 Claude Code Skill（`skills/hypit/`）、一種 XML 風格的影片描述語言 **SVML**、一個 `hypit` 命令列工具，以及一個本機執行環境（Runtime），把「AI 生圖 → AI 生影片（含人物說話）→ 配音 → 逐字對時 → 卡拉 OK 字幕 → 動畫圖卡 → 用無頭 Chromium 逐格渲染 → FFmpeg 合成」整條流程串起來。

**對你（台灣小老闆、會投廣告、用 Claude 寫 JS）具體能做的事：**
1. **廣告素材量產**：README 直接寫「從 Meta Ad Library 複製一支跑得好的廣告，換成你的商品，同一天出 50 個開頭（hook）版本」（[README.md#L173](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/README.md#L173)）。因為影片被寫成 SVML 原始碼，「換商品、換價格、換 CTA、換語言」等於改幾行文字再重跑。
2. **電商商品短影音／蝦皮、TikTok Shop 帶貨影片**：README 的「TikTok Shop and affiliate videos」用法（[README.md#L175](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/README.md#L175)）；Podcast 範例本身就是「主持人把商品（肌酸）遞給來賓」的置入廣告格式。
3. **AI 虛擬主播／口播（UGC 風格）**：用 GPT Image 2 生一張主持人照，用 Fish Audio 設計聲音，再用 Seedance 2 讓這張照片「開口講你的台詞」，自動對齊字幕。
4. **短劇**：Skill 內有專門的短劇製作指引（[short-drama.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/playbooks/formats/short-drama.md)），但它是「導演知識」而不是自動分集生成器。
5. **不花模型費的「程式繪製」影片**：例如排行榜、比價表動畫、商品規格比較卡，完全用 HTML/CSS/JS 畫，本機渲染成 MP4，不必叫任何付費生成 API（README 說明：「a workflow can compile captions, motion graphics and code-rendered visuals into a finished video without calling a generation model」）。這點對你「做價格比較表動畫」特別有用。

**誠實提醒：** 它的強項是「編排＋渲染＋對時」，**沒有內建 LLM 寫腳本**——寫腳本、看參考影片、決定分鏡全部是 Claude Code 透過 Skill 指引在做。也**沒有真正的換臉（deepfake）演算法**，README 說的「swap the face」實際做法是用新的人物照當參考圖，請 Seedance 重新生成整段演出（見第 5 節）。

---

## 2. 授權白話

GitHub 顯示 `NOASSERTION`，因為它不是標準授權。我讀了完整的 [LICENSE（26 行）](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE)：是「**修改版 Apache 2.0＋附加條件**」，性質跟 Dify、FastGPT 那類「開源但限制 SaaS 轉售」的授權很像。

| 情境 | 可不可以 | 依據 |
|---|---|---|
| 個人自己用、在自己電腦跑 | ✅ 可以 | [LICENSE#L13](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE#L13) 明列「obtaining Hypit and running it yourself on your own infrastructure」 |
| 公司內部用來做自家商品廣告、甚至幫客戶接案做影片 | ✅ 可以，不需商業授權 | [LICENSE#L5](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE#L5)、[#L13](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE#L13)（「including commercial work and work performed for your clients」） |
| 做成網站讓**別人**註冊帳號自己產影片（多租戶 SaaS） | ❌ 需向 Hypit.AI 取得書面商業授權 | [LICENSE#L7-L8](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE#L7-L8)：兩個以上外部單位各有 workspace 即算多租戶，**不管收不收費** |
| 把 Hypit 或改寫版**賣掉**、打包進付費產品給第三方 | ❌ 需商業授權 | [LICENSE#L10](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE#L10) |
| Fork、修改後公開原始碼 | ✅ 可以，但必須沿用同一授權、不得用於商業牟利 | [LICENSE#L11](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE#L11) |
| 移除 CLI、執行報告、manifest 上的 Hypit 名稱／LOGO | ❌ 不行（若這些介面有給使用者看到） | [LICENSE#L15](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE#L15) |
| 產出的影片、音訊、圖片 | ✅ 屬於你，商用無限制（但第三方模型服務另有條款） | [LICENSE#L22](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE#L22) |

**特別注意：**
- [LICENSE#L19](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/LICENSE#L19)：「出品方可隨時把授權調得更嚴或更鬆」——未來版本授權可能改變，若要長期依賴請記下你用的 commit。
- **拆程式碼到你自己的工具**：如果你只是給自己公司內部用，屬於「為自己組織使用」，可以；但如果之後把含有 Hypit 程式碼的工具賣給別人或做成多人 SaaS，就踩到 (a)(b) 條款。要拆的話，比較安全的做法是「看懂思路後自己重寫」，而不是整段複製。
- **有沒有付費版功能**：程式碼本身沒有看到「付費才解鎖」的開關。但官方推薦的 **HypiHub**（`https://hypit.ai/v1`）是付費的雲端模型代理服務（見 [provider-hypihub/src/provider.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-hypihub/src/provider.ts)），README 也明說「Hypit 免費，Coding Agent 與模型服務各自收費」。

---

## 3. 技術棧與執行需求

| 層 | 內容 | 我怎麼確認的 |
|---|---|---|
| 語言 | TypeScript（ESM），Node.js **≥ 22.15**，pnpm 10.33 monorepo | 根目錄 [package.json](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/package.json) `engines`、`packageManager` |
| 套件數 | `packages/` 底下 **86 個**子套件 | `ls packages | wc -l` |
| 程式量 | `packages/*/src/` 下 717 個 `.ts`、約 102,726 行；另有 11 個 `.py`、1 個 `.css` | `find packages -path '*/src/*' -name '*.ts' \| xargs cat \| wc -l` |
| 影片描述語言 | 自訂 XML：`.svml`（作品）、`.svs`（樣式 Recipe）、`.svrun`（執行目標） | [examples/ranking-football/reference.svml](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml) |
| 渲染 | `puppeteer-core` 25.10 驅動無頭 Chromium 逐格截圖（PNG）→ 管線餵給 **FFmpeg** `libx264` 編碼 | [provider-html-local/src/capture.ts#L139-L150](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/capture.ts#L139-L150) |
| 圖片處理 | `sharp` 0.35；本機 OpenCV（Python） | `packages/media-local/package.json`、[provider-image-opencv-local/runtime/README.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-image-opencv-local/runtime/README.md) |
| 狀態資料庫 | Node 內建 `node:sqlite`（`DatabaseSync`），存工作佇列、結果 | [runtime-local/src/sqlite-state.ts#L3](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/runtime-local/src/sqlite-state.ts#L3) |
| 語音對時 | 本機 WhisperX 3.8.6（Python 3.10–3.13，用 `uv` 管理），或走 HypiHub 雲端轉錄 | [provider-whisperx-local/runtime/pyproject.toml](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-whisperx-local/runtime/pyproject.toml) |
| 下載參考影片 | yt-dlp（固定版本的 Python 依賴） | [yt-dlp/src/download.ts#L1-L11](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/yt-dlp/src/download.ts#L1-L11) |
| 預覽／編輯介面 | **Studio**：Vite 8 ＋ 原生 TypeScript DOM（沒有 React/Vue），有時間軸、留言、參數調整、多語系 | `packages/studio/src/ui/*.ts`；`grep` 全庫沒有 `from "react"` |
| 金鑰儲存 | macOS Keychain（`/usr/bin/security`）、Windows Credential、或檔案 | [credential-store-local/src/os.ts#L21-L45](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/credential-store-local/src/os.ts#L21-L45) |
| 部署方式 | 本機 CLI（`npx skills add hypit-ai/hypit -g` 安裝 Skill，再由 Agent 安裝 `@hypit/hypit` npm 套件）。**不是**網站、不是 Docker 服務 | [README.md#L62](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/README.md#L62) |

**硬體：**
- 生成全部走雲端 API 時，**不需要 GPU**。
- 渲染吃 CPU 與記憶體：程式預設每個 Chromium 估 1.5 GB，最多用「一半記憶體／1.5 GB」與「CPU 核心數−2」中較小者（[concurrency.ts#L9-L14](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/concurrency.ts#L9-L14)）。16 GB 筆電大約可開 5 個瀏覽器並行；README 範例用了 64 個 Chromium（伺服器級機器）。
- 本機 WhisperX：CPU 可跑但慢，有 GPU 會快很多（GPU 需求程式碼內未明列 → **未確認**）。

**需要哪些 API Key 與大概費用：**
- 最省事：一個 **HypiHub** 帳號（OAuth 登入 `hypit auth login hypihub.default`），一次涵蓋生圖、生影片、TTS、轉錄。
- 或自備（BYOK）：TokenDance、HiAPI、Pollo、BeatAPI、Monid 都有官方 Provider 套件（[docs/guide/service-partners.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/docs/guide/service-partners.md)）。**沒有直接打 OpenAI／字節官方 API 的 Provider**，要的話得自己寫（有範本，見第 8 節）。
- 費用參考：README 三個範例分別寫 **$1.15（20 秒排行榜）、$1.07（18 秒 Podcast）、$1.09（26 秒街訪）**（README 範例說明 [README.md#L95](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/README.md#L95)、#L117、#L139；整段見 [README.md#L95-L139](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/README.md#L95-L139)）。換算約每支 30–40 元台幣的模型費，**另加 Claude Code 本身的訂閱／API 費**。實際單價由各服務決定，可用 `hypit pricing <run>` 查。

---

## 4. 程式架構地圖

```
hypit/
├── bin/hypit.mjs                 # CLI 進入點（hypit check / plan / pricing / build / auth / doctor …）
├── skills/hypit/                 # ★ Claude Code / Codex Skill（核心賣點）
│   ├── SKILL.md                  # 328 行，「你是導演兼製片」的總指引＋問題→參考文件對照表
│   ├── agents/openai.yaml        # Codex 用的 Skill 介面描述
│   └── references/               # 69 份子文件
│       ├── creation/             # Brief、腳本與時間、參考影片分析、改編（換人/換台詞）
│       ├── environment/          # 模型與 Provider 選擇、Profile、本機工具
│       ├── playbooks/craft/      # 生圖/生影片/配音/字幕/B-roll/混音 的「導演經驗」
│       ├── playbooks/formats/    # 口播、排行榜、短劇、雙人 Podcast、街訪、產品解說…
│       └── production/           # SVML 語法、時間軸、渲染、Studio 操作
├── .claude/skills/hypit → ../../skills/hypit   # 符號連結，clone 後 Claude Code 直接讀得到
├── packages/                     # 86 個子套件
│   ├── markup/ compiler/ kernel/ executor/ runtime/   # SVML 解析 → 圖（graph）編譯 → 執行
│   ├── runtime-local/            # 本機 Runtime：SQLite 佇列、worker 程序、憑證、排程
│   ├── cli/                      # 命令列
│   ├── studio/ studio-companion/ # 網頁版預覽＋時間軸編輯＋留言（Vite）
│   ├── script/ narrative*/       # 腳本語法（<HOST>台詞 || 斷句 @{標記}）與語意時間
│   ├── speech-estimate/          # 用字數估算台詞秒數（中文 5.25 字/秒）
│   ├── whisperx/ provider-whisperx-local/ narrative-speech-alignment/  # 逐字對時
│   ├── caption/ caption-fine/ narrative-caption/      # 字幕（含卡拉 OK 逐字亮起）
│   ├── ranking/ comment-sticker/ interview-emoji-reveal/ depth-stack/  # 現成動畫元件
│   ├── visual-track/ audio-track/ timeline*/ spatial/ film/            # 軌道、時間軸、畫布、最終合成
│   ├── html-program/ html-video/ html-document/ provider-html-local/   # HTML→逐格截圖→MP4
│   ├── media/ media-local/ media-operations/ image-operations/         # FFmpeg/sharp 媒體處理
│   ├── generation/               # 「模型」抽象層（port 表、請求驗證、wire mapping）
│   ├── seedance/ minimax-h3/ grok-imagine/ pixverse/                    # 影片模型定義
│   ├── gpt-image/ nano-banana/ seedream/ wan/                           # 圖片模型定義
│   ├── fishaudio-speech/ mimo-speech/ elevenlabs-speech/                # 語音模型定義
│   ├── volcengine-matting/       # 人像去背（影片）
│   ├── *-kits/                   # Prompt Kit（gpt-image-kits、seedance-kits）
│   ├── provider-hypihub/         # 官方雲端服務
│   ├── provider-{tokendance,hiapi,pollo,beatapi,monid}/  # 第三方 API 聚合商
│   ├── credential-store-*/       # 金鑰儲存
│   └── yt-dlp/ browser-capture/  # 下載影片、錄網頁
├── examples/                     # 排行榜、Podcast、街訪、複雜解說片、最小元件、自寫 Provider 範本
├── docs/ (+ docs/zh/)            # VitePress 文件（英文＋簡中）
└── LICENSE / CONTRIBUTING*.md
```

---

## 5. 核心功能怎麼實作

### 5.1 用 SVML 描述整支影片
- 位置：[examples/ranking-football/reference.svml](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml)（356 行）
- 重點：
  - 開頭 `<import>` 各種套件（[L3-L26](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml#L3-L26)）。
  - `<script>` 寫台詞，`<HOST>` 是角色、`||` 是斷句、`@{hair-gel}…@{/hair-gel}` 標記「講到這段時要出現 B-roll」、`<D | Dee>` 是「畫面顯示 D、唸成 Dee」（[L31-L38](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml#L31-L38)）。
  - `<gpt:Image>` 生主持人照、`<fish:VoiceDesign>` 設計聲音（[L67-L72](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml#L67-L72)）。
  - `<seedance:ReferenceVideo>` 拿主持人照＋聲音參考，生成 10 秒會講話的 720p 直式影片（[L163-L174](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml#L163-L174)）。
  - `<whisperx:Alignment>` 把生成影片的語音對回腳本每個字（[L224-L227](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml#L224-L227)）。
  - `<caption-fine:Caption>` 字幕、`<film:Film>` 最後合成（[L337-L351](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml#L337-L351)）。
- 關鍵設計：**時間錨定在「字」而不是「秒」**。換台詞或換語言後，B-roll、字幕、排行榜動畫會跟著新的實際發音時間自動重排——這就是「一次做好、100 個變體」的原理。

### 5.2 模型定義（輸入規格當成資料表）
- Seedance：[packages/seedance/src/index.ts#L14-L84](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/seedance/src/index.ts#L14-L84)。支援 `seedance-2 / 2-fast / 2-mini / 2.5`；最多 9（2.5 為 30）張參考圖、3（10）段參考影片、3（10）段參考音訊；首幀／尾幀；長度 4–15 秒；`requires` 寫出互斥規則（例如參考圖與首幀不能同時用）。
- 語音：[fishaudio-speech/src/index.ts#L8-L45](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/fishaudio-speech/src/index.ts#L8-L45)（`voice-design-1` 用文字描述設計聲音、`voice-clone` 用參考音檔複製聲音）；[mimo-speech/src/index.ts#L8-L40](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/mimo-speech/src/index.ts#L8-L40)（小米 MiMo v2.5 TTS）；[elevenlabs-speech/src/index.ts#L8-L33](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/elevenlabs-speech/src/index.ts#L8-L33)（`eleven_ttv_v3`，文字上限 1000 字）。
- MiniMax H3 影片：[minimax-h3/src/index.ts#L19-L50](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/minimax-h3/src/index.ts#L19-L50)。
- 共同機制：`defineExactModelModule()`（[generation/src/model.ts#L442](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/generation/src/model.ts#L442)）——「模型」只描述輸入輸出，「Provider」負責怎麼打 API，兩者分離，所以同一個 Seedance 可以走 HypiHub、TokenDance 或你自己的 API。

### 5.3 雲端 Provider（HypiHub）
- [provider-hypihub/src/routes.ts#L58-L99](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-hypihub/src/routes.ts#L58-L99)：依模型類型分派到 `images`／`image_edits`／`videos`／`audio_speech`／`transcriptions`。
- [provider-hypihub/src/mapping.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-hypihub/src/mapping.ts)：HypiHub 支援的模型清單（Seedance、PixVerse、火山去背、GPT Image 2、Seedream 5 lite、MiniMax H3、Grok Imagine、MiMo TTS、Fish Audio、ElevenLabs）。
- 參考媒體會先**上傳到 hypit.ai**（[upload.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-hypihub/src/upload.ts)）——隱私上要知道素材會離開你的電腦。

### 5.4 本機渲染（HTML → MP4）
- [provider-html-local/src/capture.ts#L34-L60](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/capture.ts#L34-L60)：把整段影格切成小批次，分給多個 Chromium 並行截圖。
- [capture.ts#L139-L150](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/capture.ts#L139-L150)：PNG 透過 `image2pipe` 直接餵 FFmpeg，`libx264`，品質 draft/standard/high 對應 CRF 28/23/18，並統一 BT.709 色彩。
- [concurrency.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/concurrency.ts)：依 CPU／記憶體自動決定開幾個瀏覽器，還會邊跑邊量吞吐量調整。

### 5.5 語音對時與字幕
- 本機 WhisperX 服務：只做「16kHz WAV → faster-whisper 辨識 → WhisperX 對齊 → 每個字的時間」（[provider-whisperx-local/runtime/README.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-whisperx-local/runtime/README.md)）。
- 腳本字詞 vs 辨識結果的對齊：動態規劃＋編輯距離（[narrative-speech-alignment/src/align.ts#L1-L40](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/narrative-speech-alignment/src/align.ts#L1-L40)），所以**字幕顯示的是你寫的腳本原文**（繁體就是繁體），WhisperX 只提供時間，不改字（[script-and-time.md#L112-L119](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/creation/script-and-time.md#L112-L119)）。
- 卡拉 OK 字幕繪製：[caption-fine/src/render.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/caption-fine/src/render.ts)（1,162 行，含 easeOutBack/Bounce/Elastic 等動畫曲線、底線、模糊陰影）。

### 5.6 台詞長度估算
- [speech-estimate/src/program.ts#L11-L21](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/speech-estimate/src/program.ts#L11-L21)：每秒語速表（中文 slow 4.2／normal 5.25／fast 6.56 字）；[#L171-L185](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/speech-estimate/src/program.ts#L171-L185) 計算秒數。用來決定要跟 Seedance 要求幾秒的影片，避免台詞講不完或多付錢。

### 5.7 現成動畫元件
- 排行榜 TierBoard：[ranking/src/render.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/ranking/src/render.ts)（697 行）——S/A/B/C/D 分級板，項目在講到時「掉落」入位並配音效。
- 留言貼紙：[comment-sticker/src/program.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/comment-sticker/src/program.ts)（610 行）。

### 5.8 Studio 網頁編輯器
- 時間軸 UI：[studio/src/ui/timeline.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/studio/src/ui/timeline.ts)（857 行，`createTimeline` 在 L81）。
- 多語系：[studio/src/ui/i18n.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/studio/src/ui/i18n.ts)（讀 `/__studio/locales`，依瀏覽器語言切換）。
- 時間標記留言：[studio/src/feedback-store.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/studio/src/feedback-store.ts)。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 台詞秒數估算 | [speech-estimate/src/program.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/speech-estimate/src/program.ts) | `cmu-pronouncing-dictionary`（英文用，中文不需要） | 低 | 中文部分只是「算漢字數 ÷ 語速」，幾十行就能改寫成純 JS，放進你的廣告腳本產生器，自動提示「這段 15 秒講不完」 |
| HTML 逐格截圖 → FFmpeg 影片 | [provider-html-local/src/capture.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/capture.ts)、[concurrency.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/concurrency.ts) | puppeteer-core、FFmpeg、Node | 中 | 核心思路（固定時間點 seek 頁面 → 截 PNG → `ffmpeg -f image2pipe`）可以抽出來，把你倉儲 App 的「價格比較表／庫存排行」網頁直接錄成廣告影片 |
| FFmpeg 編碼參數（BT.709、faststart） | [capture.ts#L144-L150](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/capture.ts#L144-L150) | FFmpeg | 低 | 直接抄指令列參數，避免瀏覽器截圖轉影片後顏色偏掉 |
| 自寫 API Provider 範本（非同步 start/poll/collect） | [examples/provider-package/packages/provider-videos/src/provider.ts#L75-L181](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/provider-package/packages/provider-videos/src/provider.ts#L75-L181) | 只用 `fetch` | 低～中 | 很乾淨的「上傳參考檔 → 送任務 → 輪詢 → 下載結果」模板，可改寫成你自己串任何影片 API 的 JS 模組 |
| 模型輸入規格表（port table） | [seedance/src/index.ts#L33-L84](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/seedance/src/index.ts#L33-L84) | `@hypit/generation` | 中 | 不一定要拆程式，但這份表等於 Seedance 2/2.5 參數速查表，拿去寫自己的表單驗證很方便 |
| 腳本↔辨識字詞對齊 | [narrative-speech-alignment/src/align.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/narrative-speech-alignment/src/align.ts) | `@hypit/narrative`、`@hypit/speech-evidence` 型別 | 中 | 讓「字幕顯示原稿、時間用辨識結果」，可接任何 Whisper 輸出 |
| 卡拉 OK 字幕樣式 | [caption-fine/src/render.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/caption-fine/src/render.ts) | Hypit 的 visual 宣告型別 | 高 | 跟 Hypit 的視覺樹深度綁定，建議只參考動畫曲線與樣式參數，自己用 CSS 重做 |
| 排行榜動畫 | [ranking/src/render.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/ranking/src/render.ts) | Hypit 元件系統 | 高 | 可當「比價排行／熱銷排行」影片的設計參考 |
| 金鑰存系統鑰匙圈 | [credential-store-local/src/os.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/credential-store-local/src/os.ts) | Node `child_process` | 低 | 你自己的 Node 小工具若要存 API Key，可照這種方式不把金鑰寫進檔案 |
| Claude Code Skill 寫法 | [skills/hypit/SKILL.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/SKILL.md) | 無 | 低 | 很值得參考「SKILL.md 只放總綱＋對照表，細節分散到 references/」的結構，做你自己的「倉儲/廣告 Skill」 |
| 生圖/生影片/配音導演經驗 | [skills/hypit/references/playbooks/craft/](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/playbooks/craft/image-direction.md) | 無 | 低 | 純文字知識，可直接當你的 prompt 寫作參考（注意授權仍適用） |

---

## 7. AI／Claude 整合

- **Claude 是「大腦」，Hypit 是「手腳」**：全庫 `packages/` 用 `grep -i "anthropic\|claude"` 沒有任何呼叫 Claude API 的程式；也沒有 OpenAI chat completions 呼叫。腳本撰寫、參考影片解讀、分鏡決策全由 Claude Code 依 Skill 完成。
- **Claude Code Skill（原生支援）**：`npx skills add hypit-ai/hypit -g` 安裝；repo 內 `.claude/skills/hypit` 是指向 `skills/hypit` 的符號連結（`git ls-tree` 確認 mode 120000），`.codex/skills/hypit` 同理給 Codex。用法：`/hypit Clone this video: /path/to/video.mp4 …`。
- **Skill 內容重點**：[SKILL.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/SKILL.md)（328 行）要求 Agent：付費前先跟使用者確認帳號與預算（[L220-L224](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/SKILL.md#L220-L224)）、金鑰只透過 `hypit auth` 管理、交付前要「自己看過、聽過成品」。
- **Prompt 放在哪**：
  - 生圖 Prompt Kit：`packages/gpt-image-kits/`（如 `phone-ugc-v1`），生影片口播 Kit：`packages/seedance-kits/kits/`。
  - 範例內的具體 prompt 寫在 `.svml` 的 `<text:Value>`（[reference.svml#L40-L61](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml#L40-L61)）。
  - 導演知識：`skills/hypit/references/playbooks/craft/image-direction.md`、`video-direction.md`、`voice-direction.md`。
- **MCP**：沒有 MCP server（未在檔案清單中找到）。
- **用到的生成模型**：影片 Seedance 2／2.5、MiniMax H3、Grok Imagine、PixVerse v6/C1；圖片 GPT Image 2、Nano Banana 2/Pro、Seedream 5 lite、Wan 2.7；語音 Fish Audio（設計/複製）、小米 MiMo v2.5 TTS（設計/複製）、ElevenLabs `eleven_ttv_v3`；去背 火山引擎人像去背；對時 WhisperX。
- **能不能換成 Claude**：它本來就是設計給 Claude Code 用的，不需要換。但 Claude 不會生圖／生影片／生語音，這部分仍要付費給上述模型服務。
- 附帶一提：repo 的 GitHub Actions 議題分析用 `deepseek-flash`（`.github/workflows/repository-analysis.yml`），與使用者端無關。

---

## 8. 擴充方式與 API

1. **自寫元件（Author Package）**：用 TS 或純 JS 寫畫面元件。`examples/complex-explainer/packages/*/src/*.js` 全是 `.js`，表示**純 JavaScript 也能寫元件**，對你很友善。最小範本：`examples/minimal-author-package/`。
2. **自寫 Provider（串任何 API）**：照 [examples/provider-package/.../provider-videos/src/provider.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/provider-package/packages/provider-videos/src/provider.ts) 實作 `start / poll / collect`，再在 `hypit.runtime.json` 用 `bindings` 把某個模型指到你的 Endpoint（說明見 [model-and-provider.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/environment/model-and-provider.md)）。
3. **Runtime Profile**：`hypit.runtime.json` 宣告憑證儲存、各 Endpoint 與並行數（範例：`examples/ranking-football/hypit.runtime.json`，HypiHub 並行 4、HTML 渲染 workers 2）。
4. **CLI 指令**：`version / check / plan / pricing / build / builds / history / inspect / get / logs / status / activity / cancel / result / auth / doctor`（[cli/src/command.ts#L10-L28](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/cli/src/command.ts#L10-L28)），外加插件提供的 `studio`、`estimate`、`download` 等。
5. **程式化 API**：根 `package.json` 的 `exports` 匯出 `./compiler`、`./runtime`、`./markup`、`./endpoint/http` 等 29 個進入點，可在 Node 程式裡直接呼叫。
6. **沒有 HTTP REST 伺服器給外部系統呼叫**（Studio 有本機伺服器，但用途是預覽/編輯）。要從你的 Firebase 倉儲 App 觸發出片，得自己寫一層 Node 腳本呼叫 `hypit build`。

---

## 9. 程式品質與風險

**維護狀況**
- 2026-07-29 建立，3 個多月衝到約 2.8 萬星；掃描當天（2026-11-04）仍有推送，版本 `@hypit/hypit` 0.3.1（根 package.json），已有 0.3 / 0.3.1 遷移指南——**API 仍在快速變動**。
- 因為是 shallow clone，總 commit 數**未確認**。

**測試與 CI**
- 檔案清單中 `*.test.ts|*.test.mjs` 共 217 個（其中 `packages/` 下 210 個），另有 2 個 Python `test_*.py`（用 `grep -cE` 對 `ls-tree` 清單計數）。
- CI 在 Ubuntu＋Windows 雙平台跑（[.github/workflows/ci.yml](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/.github/workflows/ci.yml)），Actions 版本用 commit SHA 釘選，品質意識高。
- 程式碼註解非常詳盡、型別嚴謹；但抽象層很多（Model / Provider / Endpoint / Profile / Run / Build / Candidate…），**學習曲線陡**。

**資安／隱私**
- 遙測：`grep -i "telemetry|analytics|posthog|sentry"` 於 `packages/` 無結果；唯一看到的對外檢查是 CLI 向 npm registry 查最新版本（[cli/src/version.ts#L76](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/cli/src/version.ts#L76)）。
- 走 HypiHub 或第三方聚合商時，你的商品圖、人像、聲音樣本會上傳到對方伺服器。
- 金鑰存在系統鑰匙圈，CLI 設計上避免把金鑰貼進對話（[model-and-provider.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/environment/model-and-provider.md) 的 OAuth 流程說明）。
- Skill 讓 Agent 可以執行 `npm install`、下載模型、跑背景程序；使用時建議開在獨立資料夾。

**已知的坑**
- 需要 Node 22.15+、FFmpeg、Chromium（自動下載）、Python（WhisperX/OpenCV/yt-dlp 用 uv 管理）——Windows 上初次環境準備可能耗時。
- 渲染很吃記憶體（每個 Chromium 估 1.5 GB）。
- 範例素材使用真實球員照片，且範例 README 自己承認「原專案的球員圖片沒有來源紀錄」（[examples/ranking-football/README.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/README.md)）——不要照抄素材做法。
- 中文字型預設偏簡體（Noto Sans SC），繁中要自己裝 Noto Sans TC 類套件（[fonts-and-text.md#L29-L35](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/production/fonts-and-text.md#L29-L35)）。
- 授權可由出品方單方面調整（見第 2 節）。

---

## 10. 跟其他專案組合的建議

- **Hypit ＋ 你的倉儲 App（Firebase）**：從 Firestore 匯出商品名稱、價格、規格成 JSON → 用 Claude Code 生成 SVML（套「排行榜」或「Podcast 置入」格式）→ `hypit build` 批次出片。這是最直接的「每天一個 SKU 一支影片」做法。
- **Hypit（渲染/字幕/對時） ＋ 專門的短劇專案（如 huobao-drama、Toonflow、ViMax 等劇本→分鏡工具）**：那些專案擅長「小說→分集→分鏡」，Hypit 擅長「把素材精準合成、字幕對字」。可以讓短劇工具產出分鏡與素材，Hypit 負責最後合成。
- **Hypit ＋ 台灣口音 TTS**：Hypit 內建的 TTS 是 Fish Audio／MiMo／ElevenLabs，有「聲音複製」可以用你自己錄的台灣腔樣本；若另有專案提供更好的繁中 TTS，可照第 8 節寫一個 Provider 接進來。
- **Hypit 的 HTML→MP4 渲染 ＋ 網頁版試算表專案**：把試算表的比價結果畫成 HTML 表格動畫，再用 Hypit 的渲染路線出片——不必付任何生成費用。
- **純學習用途**：Hypit 的 `skills/hypit/` 是目前很完整的「大型 Claude Code Skill 寫法範例」，你之後要做自己的 Skill（例如「倉儲盤點 Skill」「廣告文案 Skill」）可以參考它的分層架構。

---

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有／未確認 | 程式碼位置 | 說明 |
|---|---|---|---|
| 輸入：參考影片 | 有 | [yt-dlp/src/download.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/yt-dlp/src/download.ts) | 支援本機檔或 TikTok/YouTube/IG/B 站連結（yt-dlp）；Agent 會抽幀成格狀圖並轉錄來解讀 |
| 輸入：主題文字 | 有 | [SKILL.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/SKILL.md) | 「Make a ranking video that puts X in S tier」這種一句話需求即可 |
| 輸入：商品圖／素材 | 有 | [reference.svml#L77-L87](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml#L77-L87) | `<asset:Image>`／`<asset:Audio>` 引入自有素材；也能當 Seedance 參考圖 |
| 輸入：小說 | 沒有 | — | 沒有長篇小說拆集功能 |
| 腳本 | 有（由 Claude 寫） | [script/src/parser.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/script/src/parser.ts) | Hypit 只負責腳本語法解析，內容由 Claude Code 撰寫 |
| 分鏡 | 有（間接） | [short-drama.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/playbooks/formats/short-drama.md) | 沒有獨立「分鏡表」產物；分鏡以 Segment、關鍵圖、`@{}` 標記的形式寫在 SVML |
| 畫面：素材庫 | 沒有 | — | 不含圖庫／影片庫搜尋（如 Pexels） |
| 畫面：AI 生圖 | 有 | [gpt-image/src/index.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/gpt-image/src/index.ts) | GPT Image 2、Nano Banana、Seedream 5 lite、Wan 2.7（付費 API） |
| 畫面：AI 生影片 | 有 | [seedance/src/index.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/seedance/src/index.ts) | Seedance 2/2.5（可帶聲音、參考人物照）、MiniMax H3、Grok Imagine、PixVerse（付費 API） |
| 畫面：程式繪製 | 有 | [provider-html-local/src/capture.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/capture.ts) | HTML/CSS/JS 動畫，本機 Chromium 逐格渲染，免模型費 |
| 換臉 | 沒有（真正的 face swap） | [model-and-provider.md](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/environment/model-and-provider.md) | 全庫搜尋 `faceswap/deepfake` 無實作；「換主持人」是換參考圖後重新生成整段影片 |
| 配音 TTS | 有 | [fishaudio-speech/src/index.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/fishaudio-speech/src/index.ts) | Fish Audio、MiMo、ElevenLabs；也可由 Seedance 直接生成帶聲音的演出 |
| 聲音複製 | 有 | [mimo-speech/src/index.ts#L8-L40](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/mimo-speech/src/index.ts#L8-L40) | `voice-clone`、`mimo-v2.5-tts-voiceclone` 需提供參考音檔 |
| 字幕 | 有 | [caption-fine/src/render.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/caption-fine/src/render.ts) | 逐字對時、卡拉 OK、跟著頭部移動的字幕（需人臉框資料） |
| 配樂 | 有（自備） | [reference.svml](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/examples/ranking-football/reference.svml) | 用 `<audio:Clip>` 放自備音樂，可設增益、淡入淡出；**沒有 AI 生成音樂** |
| 合成 | 有 | [film/src/](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/film/src/program.ts) | `<film:Film>` 疊合視覺軌與音軌 |
| 輸出 | 有 | [capture.ts#L144-L150](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/provider-html-local/src/capture.ts#L144-L150) | H.264 MP4（faststart）；畫布尺寸、幀率可自訂（範例 720×1280、30fps） |

**每一步的成本：** Claude Code（你的訂閱或 API 費）＋生圖／生影片／TTS（HypiHub 或聚合商計價，README 範例每支 18–26 秒約 US$1.07–1.15）＋本機渲染與 WhisperX（免費，耗電與時間）。詳細單價各服務不同，程式內沒有寫死 → 用 `hypit pricing` 查。

**中文（繁中、台灣口音）：**
- 字幕：支援中文逐字（漢字為單位）高亮，字幕顯示原稿字元，繁體 OK（[captions.md#L71-L85](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/playbooks/craft/captions.md#L71-L85)、[script-and-time.md#L112-L119](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/skills/hypit/references/creation/script-and-time.md#L112-L119)）；字型需自行加裝繁中字型套件。
- 唸法控制：`<¥19.9|十九块九>` 這種「顯示 vs 唸法」語法，對價格唸法很好用（例：`<$199|一百九十九元>`）。
- 台灣口音：**未確認**。沒有專門的台灣腔模型；可用 Fish Audio／MiMo 的聲音複製，餵你自己錄的台灣腔樣本試試。
- 對時：WhisperX 用 `zh` 語言代碼（[whisperx/src/types.ts#L6-L11](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/whisperx/src/types.ts#L6-L11)）。

**Claude 怎麼用：** Claude Code Skill（原生）。不透過 Anthropic API 程式呼叫，也不需要 OpenAI 相容介面；Claude Code 直接讀 Skill、寫 SVML、跑 `hypit` 指令。

**能不能在個人電腦跑：** 可以。生成全走雲端 API 時不需 GPU；建議 16 GB 以上記憶體（渲染用 Chromium）。本機 WhisperX 可選，CPU 可跑但較慢。

**最適合做：** ① **廣告素材（多版本 hook 測試）** 最強；② 電商帶貨短影片（排行榜、Podcast 置入、街訪格式）；③ 解說影片（純程式繪製、免模型費）；④ 短劇可做但需要大量導演工作，不是一鍵出片。

**法律風險：**
- **版權**：「複製爆款影片」是複製「結構與節奏」，若直接重用原片畫面、音樂、文案則可能侵權；範例中的背景音樂與球員照片來源不明，不宜沿用。
- **肖像權**：用真實人物照片當參考生成影片（範例就用了 C 羅、梅西照片），在台灣可能涉及肖像權與《民法》人格權；廣告若讓人誤認代言更有《公平交易法》、不實廣告風險。AI 生成的「虛擬主持人」較安全。
- **平台條款**：Meta、TikTok 要求標示 AI 生成內容；用 yt-dlp 下載 YouTube/TikTok 影片可能違反平台服務條款。
- **第三方模型條款**：LICENSE 第 3 條提醒，產出內容另受模型服務商條款約束。
- **Hypit 授權**：若將來把它包成多人使用的服務或賣給別人，需商業授權。

---

## 關鍵字
Hypit、hypit-ai、爆款影片複製、viral video clone、AI 影片、AI video、SVML、Claude Code Skill、Codex、短影音、廣告素材、ad creative、hook 變體、電商影片、TikTok Shop、UGC、口播、Podcast 剪輯、街訪、排行榜影片、tier list、短劇、short drama、Seedance、Seedance 2.5、GPT Image 2、Nano Banana、MiniMax H3、Grok Imagine、PixVerse、Fish Audio、MiMo TTS、ElevenLabs、聲音複製、voice clone、WhisperX、逐字字幕、卡拉 OK 字幕、karaoke caption、puppeteer、headless Chromium、FFmpeg、HTML 轉影片、程式繪製影片、motion graphics、HypiHub、TokenDance、HiAPI、Pollo、BeatAPI、Monid、BYOK、修改版 Apache 授權、多租戶限制、肖像權、TypeScript、Node.js
