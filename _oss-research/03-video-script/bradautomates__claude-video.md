# bradautomates/claude-video — 讓 Claude Code「看懂」任何影片的 /watch 技能（下載→抽幀→字幕／轉錄→交給 Claude）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：03ceb42
> GitHub：https://github.com/bradautomates/claude-video｜⭐ 19856｜授權：MIT｜主要語言：Python｜最近更新：2026-09-25

> 本次掃描方式：淺層 clone（`--depth 1`），commit `03ceb42f7fa2c4439aca01752118044baabffb8f`（版本標記 0.3.2，2026-09-25 釋出）。實際打開閱讀了 `skills/watch/SKILL.md`、`skills/watch/scripts/` 下全部 10 支 Python 檔、`hooks/`、外掛 manifest、`README.md`、`CHANGELOG.md`、`LICENSE`、兩個 GitHub Actions workflow。沒有執行任何程式。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這是一個裝進 Claude Code 的「看影片」技能——你丟一個影片網址（YouTube／TikTok／IG 等 yt-dlp 支援的站）或本機檔案，它用 `yt-dlp` 下載、用 `ffmpeg` 依場景切換抽出有時間戳的截圖、優先抓平台原生字幕（沒有字幕才用 WhisperX／Groq／OpenAI 轉錄），最後輸出一份 Markdown 報告，讓 Claude 自己用 Read 工具逐張看圖，回答你對影片的問題。另有「Gemini 引擎」：有 `GEMINI_API_KEY` 時改成整支影片丟給 Google Gemini 看，Claude 只負責轉述。

**它不是「生成影片」的工具，而是「看懂影片」的工具。** 對你（台灣小商家、自己下廣告、想做電商影片／短劇）的實際用途：

1. **拆解競品廣告**：把競品在 FB／IG／TikTok／YouTube 上的廣告網址丟給 `/watch`，問 Claude「前 3 秒用什麼鉤子？每個鏡頭幾秒？字卡寫什麼？CTA 在第幾秒？」——它會給你帶時間戳的分鏡表。
2. **拆爆款腳本**：抓爆款短影音的字幕＋關鍵畫面，請 Claude 整理成「鉤子→痛點→商品展示→社會證明→CTA」的腳本結構，再改寫成你自己商品的版本。
3. **檢查自己做好的影片**：生成完的商品影片丟回 `/watch`，請 Claude 檢查字幕錯字、畫面是否有破圖、節奏是否太慢。
4. **教學影片轉 SOP**：把 YouTube 上的 Firebase／倉儲系統教學影片轉成步驟文件（可用 `--resolution 1024` 讓螢幕上的程式碼更清楚）。
5. **當 A＋B＋C 組合中的「輸入端」**：它是最乾淨、純標準函式庫的「影片→結構化素材（幀＋逐字稿）」模組，可以接在任何 AI 剪輯／腳本生成專案前面當「參考影片分析器」。

---

## 2. 授權白話

- **授權：MIT**（`LICENSE` 第 1–3 行：`MIT License` / `Copyright (c) 2026 Bradley Bonanno`；`SKILL.md` frontmatter 與 `.claude-plugin/plugin.json` 也標 `"license": "MIT"`）。
- **個人使用**：完全自由，可以改、可以拆、可以混進自己的工具。
- **公司商用**：可以，包括閉源商用。唯一義務是在你散布的程式中保留原著作權聲明與 MIT 授權文字。
- **閉源／付費版功能**：倉庫內沒有看到任何付費牆、授權金鑰檢查或「Pro 版才有」的程式碼（全部 10 支腳本都讀過）。
- **要注意的是「第三方」而不是這個專案本身**：
  - `yt-dlp` 下載影片本身是否違反 YouTube／TikTok／Meta 的服務條款，是**你**的責任（見第 11 節法律風險）。
  - Gemini 引擎會把影片上傳到 Google（受 Google API 條款約束）；Groq／OpenAI 轉錄會把音訊上傳到對方。
  - WhisperX（3.8.6）、PyTorch 等依賴有各自授權，安裝時才下載，不在本倉庫內；其授權本次未確認。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 前端 | 無。介面就是 Claude Code（或 Codex、Cursor 等 Agent Skills 宿主）的對話框，指令 `/watch`（外掛模式下顯示為 `/watch:watch`） |
| 後端 | Python 3.10+ 腳本，**只用標準函式庫**（我把 `skills/watch/scripts/*.py` 的 import 全部列出，沒有任何第三方套件；HTTP 用 `urllib`，multipart 手刻） |
| 外部執行檔 | `ffmpeg`、`ffprobe`、`yt-dlp`（`setup.py` 第 19 行 `REQUIRED_BINARIES`）。YouTube 另需 Deno／EJS（yt-dlp 的 JS 挑戰解算） |
| 資料庫 | 無。設定存在 `~/.config/watch/.env`（POSIX 權限 0600） |
| 部署方式 | Claude Code 外掛市集（`/plugin marketplace add bradautomates/claude-video` → `/plugin install watch@claude-video`）、Codex 外掛、`npx skills add`，或直接把 `skills/watch/` 整個資料夾複製到技能目錄 |
| 硬體／GPU | 預設路徑（字幕＋抽幀）**不需要 GPU**，一般筆電即可。選本機 WhisperX 時：至少 3 GB 磁碟、8 GB RAM；預設 `small` 模型、CPU、int8；`large-v3` 約 2.9 GB 模型、約 6 GB 峰值記憶體（README 的參考量測）。CUDA 可設定但作者標註「未測試」 |
| 支援平台 | Claude Code（桌面版 Code 分頁、VS Code、終端機）、Codex、其他本機 Agent。**不支援** Claude Chat、Cowork（README「Chat, Cowork, and browser apps」一節） |

**API Key 與費用**（下列模型名都是程式碼裡寫死的預設值；價格本次沒有查證官網，一律標「未確認」）：

| 用途 | Key | 程式碼中的模型 | 費用 |
|---|---|---|---|
| Gemini 引擎（整支影片給 Google 看） | `GEMINI_API_KEY` | `gemini-3.7-flash`（`config.py` 第 17 行，可用 `WATCH_GEMINI_MODEL` 改） | README 說可用 AI Studio 的免費 key；免費額度與付費價格未確認 |
| 雲端轉錄（無字幕時） | `GROQ_API_KEY` | `whisper-large-v3`（`whisper.py` 第 31–32 行） | 未確認 |
| 雲端轉錄（無字幕時） | `OPENAI_API_KEY` | `whisper-1`（`whisper.py` 第 34–35 行） | 未確認 |
| 本機轉錄 | 不需要 | WhisperX 3.8.6 `small`（可改 `large-v3`） | 免費，耗本機 CPU |
| 讓 Claude 看圖 | 不需要額外 key | 用你 Claude Code 訂閱／帳號本身的多模態能力 | 吃你的 Claude 用量；`balanced` 最多 100 張 512px 圖，`token-burner` 不設上限 |

**最省錢的組合**：`--engine local` ＋ `--whisper none`（只用平台字幕）或 `whisperx`，完全不用額外 API Key。

---

## 4. 程式架構地圖

（檔案數：`git ls-tree -r --name-only HEAD` 共 51 個檔案；行數用 `wc -l` 計算）

```
claude-video/
├── .claude-plugin/
│   ├── plugin.json          # Claude Code 外掛描述（名稱 watch、版本 0.3.2、MIT）
│   └── marketplace.json     # 讓整個 repo 變成一個外掛市集 claude-video
├── .codex-plugin/plugin.json  # Codex 外掛描述（同一個 skills/ 目錄）
├── .agents/plugins/marketplace.json  # 其他 Agent 宿主用的市集描述
├── hooks/
│   ├── hooks.json           # SessionStart hook：每次開 session 跑 check-setup.sh（5 秒逾時）
│   └── scripts/check-setup.sh  # 只呼叫 setup.py --check，失敗就印一行提示，永遠 exit 0
├── skills/watch/            # ★ 真正的技能本體（可整包複製走）
│   ├── SKILL.md             # 168 行：給 Claude 的操作說明（首次設定問答、旗標表、安全規則）
│   └── scripts/             # 合計 2,789 行 Python
│       ├── watch.py         # 430 行：主程式／指揮者，產出 Markdown 報告
│       ├── download.py      # 207 行：yt-dlp 包裝（字幕挑選、720p 下載、cookie）
│       ├── frames.py        # 758 行：ffprobe／ffmpeg 抽幀（場景、關鍵幀、等距、指定時間點、去重）
│       ├── transcribe.py    # 113 行：WebVTT 解析、時間範圍過濾、逐字稿格式化
│       ├── whisper.py       # 425 行：抽音訊、切塊、Groq/OpenAI Whisper 上傳與重試
│       ├── local_whisperx.py# 147 行：以子行程呼叫本機 WhisperX（不把 Torch 載入主程式）
│       ├── gemini.py        # 162 行：Gemini Files API 上傳＋Interactions API 問答
│       ├── config.py        # 174 行：.env 解析、key 查找順序、原子寫入
│       ├── setup.py         # 338 行：相依檢查、首次設定、WhisperX 受管安裝（uv + Python 3.12）
│       ├── runtime.py       #  35 行：subprocess 與 UTF-8 輸出小工具
│       └── build-skill.sh   # 打包成 dist/watch.skill（zip）
├── tests/                   # 17 個檔案，188 個 test 函式（grep "def test_" 計數）
├── .github/workflows/       # tests.yml（Linux/macOS/Windows 矩陣）、release.yml（打 tag 自動發佈 .skill）
├── README.md / CHANGELOG.md / AGENTS.md / CLAUDE.md
└── dev-sync.sh              # 開發用：把工作目錄同步到本機已安裝的外掛快取
```

函式數：`grep -c "^def \|^    def "` 於 `skills/watch/scripts/*.py`，共 115 個（含巢狀函式）：frames 24、setup 21、download 15、whisper 14、config 11、gemini 10、local_whisperx 8、transcribe 7、runtime 3、watch 2。

---

## 5. 核心功能怎麼實作

Permalink 前綴：`https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/`

### 5.1 主流程（watch.py）
- 位置：[watch.py#L94-L422](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L94-L422)
- 重點：
  1. 解析旗標 → 讀設定（CLI → 環境變數 → `~/.config/watch/.env` → 預設）→ 決定引擎（[L164-L166](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L164-L166)），有 Gemini key 且引擎 auto 就走 Gemini。
  2. 本機引擎：URL 先只抓 metadata＋字幕（[L183-L195](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L183-L195)）；如果是 `transcript` 模式且已有字幕，**完全不下載影片**（[L197-L209](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L197-L209)）。
  3. 抽幀：指定時間點（cue）先佔預算，其餘依 detail 選 `extract_keyframes` 或 `extract_scene_or_uniform`（[L240-L264](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L240-L264)）。
  4. 沒字幕且有音軌才轉錄（[L266-L293](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L266-L293)）。
  5. 把結果印成 Markdown 報告到 stdout：`# watch: video report`、`## Frames`（每張圖路徑＋`t=MM:SS`＋原因）、`## Transcript`、`## Unavailable evidence`（[L299-L420](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L299-L420)）。**Claude 接著用 Read 工具一張張打開 JPEG**——這就是「讓 Claude 看影片」的全部祕密：沒有任何 Anthropic API 呼叫，靠的是 Claude Code 本身能讀圖。

### 5.2 下載與字幕挑選（download.py）
- yt-dlp 共用參數：[download.py#L39-L45](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L39-L45)（`--no-playlist`，輸出固定 `video.%(ext)s`）。
- 字幕挑選演算法：[download.py#L96-L131](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L96-L131)。先人工字幕、再自動字幕；YouTube 的 `-orig` 軌視為原始語言；語言未知時偏好英文；每次只下載**一條**字幕軌，並標註來源（original／unknown／requested translation）。
- 只抓字幕不下載影片：[download.py#L134-L162](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L134-L162)（先 `--skip-download --write-info-json`，再 `--load-info-json` 只拿選中的那一軌、轉 VTT）。
- 下載影片：[download.py#L165-L196](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L165-L196)。格式 `bv*[height<=720]+ba/b[height<=720]/bv+ba/b`（**最高 720p**，第 172 行），8 線程分段下載，用 `--print-to-file after_move:%(filepath)j` 取得最終檔案路徑並驗證不是 `.part`。
- 錯誤提示（403／429／登入／憑證）：[download.py#L48-L66](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L48-L66)。
- Cookie（要看需要登入的影片時）：[download.py#L29-L36](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L29-L36)，只有使用者明確指定 `--cookies` 或 `--cookies-from-browser` 才用。

### 5.3 抽幀（frames.py）——最值得拆的部分
- 常數：[frames.py#L23-L42](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L23-L42)：`MAX_FPS=2.0`、`SCENE_THRESHOLD=0.20`、`SCENE_MIN_FRAMES=8`、`KEYFRAME_MIN=4`、最大高度 1998px、去重縮圖 16×16、門檻 2.0。
- 依影片長度自動決定張數：[frames.py#L158-L195](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L158-L195)。全片：≤30 秒約每秒 1 張（最少 12）、≤60 秒 40 張、≤3 分 60 張、≤10 分 80 張、更長用上限；指定區間（focus）時更密，≤5 秒會到每秒 6 張的目標再被 2 fps 上限夾住。
- 場景切換抽幀：[frames.py#L231-L286](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L231-L286)，核心是 ffmpeg 濾鏡 `select='eq(n\,0)+gt(scene\,0.20)',scale=...,showinfo`，再從 `showinfo` 的 `pts_time` 讀回真實時間戳。
- 場景優先、靜態影片退回等距：[frames.py#L517-L581](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L517-L581)。少於 8 個場景就判定為「講者或螢幕錄影」改等距取樣。
- 只解碼關鍵幀（最快）：[frames.py#L584-L683](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L584-L683)，用 `-skip_frame nokey`。
- 等距取樣（真的取原始幀而非 fps 濾鏡重算）：[frames.py#L198-L228](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L198-L228)。
- 指定時間點截圖（「講者說『看這裡』」用）：[frames.py#L330-L394](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L330-L394)。
- 近似重複畫面去除：[frames.py#L419-L514](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L419-L514)。一次 ffmpeg 把所有 JPEG 縮成 16×16 RGB raw bytes，算平均每通道差，≤2.0 就丟掉——純標準函式庫，不需 OpenCV／Pillow。
- 影片資訊：[frames.py#L85-L113](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L85-L113)（ffprobe JSON）。
- FFmpeg 新舊版相容（`-fps_mode` vs `-vsync`）：[frames.py#L116-L129](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L116-L129)。

### 5.4 字幕解析與逐字稿（transcribe.py）
- WebVTT 解析：[transcribe.py#L52-L94](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/transcribe.py#L52-L94)，去 HTML 標籤、處理 YouTube 自動字幕「滾動重複」問題（只合併同顯示設定且重疊的重複）。
- 輸出格式 `[MM:SS] 文字`：[transcribe.py#L105-L106](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/transcribe.py#L105-L106)。

### 5.5 語音轉錄（whisper.py / local_whisperx.py）
- 抽音訊成單聲道 16kHz 64kbps MP3（約 480 kB／分鐘）：[whisper.py#L72-L96](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/whisper.py#L72-L96)。
- 超過 24,000,000 bytes 自動切塊並把時間戳位移回原片：[whisper.py#L43-L69](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/whisper.py#L43-L69)、[L276-L333](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/whisper.py#L276-L333)。
- 手刻 multipart＋重試（4 次、429 退避、特製 User-Agent 繞 Cloudflare WAF）：[whisper.py#L141-L250](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/whisper.py#L141-L250)。
- 本機 WhisperX 以子行程呼叫（`--no_align --vad_method silero`，關閉 pyannote 遙測）：[local_whisperx.py#L55-L68](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/local_whisperx.py#L55-L68)、[L132-L147](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/local_whisperx.py#L132-L147)。
- 受管安裝（uv → Python 3.12 venv → CPU 版 torch 2.8.0 → whisperx 3.8.6 → 2 秒靜音暖機）：[setup.py#L266-L312](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/setup.py#L266-L312)。

### 5.6 Gemini 引擎（gemini.py）
- YouTube 網址直接把 URI 給 Gemini；其他來源先下載再走 Files API 的 resumable upload（串流上傳、輪詢 PROCESSING→ACTIVE），問完就刪：[gemini.py#L119-L162](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/gemini.py#L119-L162)。
- 呼叫 `POST /v1beta/interactions`，`processing` 為 `agentic`（整片）或 `static`＋`start_offset/end_offset`（指定區間）：[gemini.py#L86-L116](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/gemini.py#L86-L116)。
- Prompt：[gemini.py#L33-L37](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/gemini.py#L33-L37)（預設問題＋「每個論點附 MM:SS、分開看到與聽到、不知道就說」）。
- 主程式中的 Gemini 分支：[watch.py#L33-L91](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L33-L91)。**刻意不做靜默降級**：Gemini 失敗不會自動改走本機。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 場景切換抽幀＋去重＋縮到上限 | [frames.py#L231-L581](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L231-L581) | ffmpeg、`runtime.py` | 低 | 整支 `frames.py`＋`runtime.py` 複製走即可；呼叫 `extract_scene_or_uniform(video, out_dir, fps, target)` 拿到 `[{path, timestamp_seconds, reason}]`。可用來替競品廣告自動產生「分鏡表縮圖」，或替自己的 AI 剪輯專案做品質檢查 |
| 依長度自動決定截圖數 | [frames.py#L158-L195](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L158-L195) | 無 | 低 | 兩個純函式，直接抄。控制送給 Claude 的圖片數量＝控制成本 |
| 16×16 RGB 去重 | [frames.py#L419-L514](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L419-L514) | ffmpeg | 低 | 任何「一堆截圖要去掉幾乎一樣的」場合都能用，例如商品圖庫去重 |
| yt-dlp 字幕挑選（只抓一軌、標來源） | [download.py#L96-L162](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L96-L162) | yt-dlp | 低 | 想做「批次抓爆款影片字幕→Claude 歸納腳本公式」時，直接用 `fetch_captions(url, dir, sub_lang='zh-TW')`，不用下載影片，速度快 |
| VTT 解析＋去滾動重複 | [transcribe.py#L52-L106](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/transcribe.py#L52-L106) | 無 | 低 | 純 Python；也可以反過來參考它的結構，寫你自己影片的字幕輸出 |
| Whisper 雲端轉錄＋切塊 | [whisper.py#L43-L410](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/whisper.py#L43-L410) | ffmpeg、`config.py`、`transcribe.py` | 中 | 改 `GROQ_ENDPOINT`／`OPENAI_ENDPOINT` 常數即可接任何 OpenAI 相容的 `/audio/transcriptions`；若要加 `language=zh` 或 `prompt` 參數，改 `_post_whisper` 的 `fields` |
| Gemini 影片問答（標準函式庫版） | [gemini.py](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/gemini.py) | 只有 `runtime.diagnostic` | 低 | 162 行就能把影片上傳 Google 並問問題，適合需要「聽懂音樂、配音語氣」的分析；問題換成「列出每個鏡頭秒數、字卡、配樂情緒」即可產生分鏡表 |
| Markdown 報告格式（給 LLM 讀的證據包） | [watch.py#L299-L420](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L299-L420) | — | 低 | 學它的格式：每張圖附時間戳與挑選原因、逐字稿 `[MM:SS]`、明列「缺什麼證據」，可以套在你自己的任何「讓 Claude 讀素材」工具 |
| .env 設定讀寫（原子寫入、不外洩值） | [config.py](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/config.py) | 無 | 低 | 自己寫 Claude Code skill 需要存 API key 時可直接沿用 |
| Claude Code 外掛骨架 | [.claude-plugin/plugin.json](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/.claude-plugin/plugin.json)、[marketplace.json](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/.claude-plugin/marketplace.json)、[hooks/hooks.json](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/hooks/hooks.json) | — | 低 | 想把你自己的倉儲／價格工具包成 Claude Code 外掛時，這是很乾淨的範本（一個 repo 同時是市集＋外掛＋Codex 外掛） |

---

## 7. AI／Claude 整合

- **Claude 的角色**：Claude 不是被 API 呼叫，而是「操作者」。`SKILL.md` 告訴 Claude：先跑 `setup.py --json` 檢查環境 → 首次使用時用 `AskUserQuestion` 問使用者要哪個引擎／細節等級／轉錄方式 → 跑 `watch.py "<URL>" --question "<原問題>"` → **用 Read 工具讀報告列出的每張圖**（[SKILL.md#L87-L128](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/SKILL.md#L87-L128)）。frontmatter 宣告 `allowed-tools: Bash, Read, AskUserQuestion`（[SKILL.md#L1-L8](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/SKILL.md#L1-L8)）。
- **用到的模型**：Claude（你 Claude Code 當下用的模型，負責看圖＋回答）；Google `gemini-3.7-flash`（選用）；Groq `whisper-large-v3`、OpenAI `whisper-1`（選用）；本機 WhisperX `small`（選用）。
- **Prompt 放在哪**：給 Claude 的指示全在 `SKILL.md`；給 Gemini 的唯一 prompt 在 [gemini.py#L33-L37](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/gemini.py#L33-L37)。
- **MCP**：沒有。**Skills**：有，就是 `skills/watch/`，符合 Agent Skills 格式，可上傳成 `.skill`（`build-skill.sh`）。**Hooks**：一個 SessionStart hook 做相依性檢查。
- **能不能換成 Claude**：本來就是為 Claude Code 設計的（`claude_support = 原生`）。Gemini 引擎是「讓 Google 看影片、Claude 轉述」；如果你只想用 Claude，`--engine local` 即可，所有視覺判斷都由 Claude 做。若想改成「用 Anthropic API 自動批次分析」（不經過 Claude Code 對話），需自己寫一層：把報告中的圖片 base64 + 逐字稿塞進 Messages API 的 image/text content——倉庫內**沒有**這段程式碼。
- **提示注入防護**：SKILL.md 明確要求把影片畫面、字幕、標題都當「不可信證據」，不可當成指令（[SKILL.md#L128](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/SKILL.md#L128)）。拆競品廣告時這點很重要，畫面上的文字可能含惡意指令。

---

## 8. 擴充方式與 API

- **CLI 旗標**（完整列表在 [watch.py#L95-L147](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L95-L147)）：`--engine auto|gemini|local`、`--question`、`--detail transcript|efficient|balanced|token-burner`、`--start/--end`、`--timestamps T1,T2`、`--max-frames`、`--resolution`（預設 512）、`--fps`（≤2）、`--no-dedup`、`--whisper groq|openai|whisperx`、`--no-whisper`、`--sub-lang`、`--cookies`／`--cookies-from-browser`、`--out-dir`。
- **環境變數／.env**（[config.py#L132-L160](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/config.py#L132-L160)）：`WATCH_ENGINE`、`WATCH_DETAIL`、`WATCH_WHISPER_BACKEND`、`WATCH_GEMINI_MODEL`、`WATCH_GEMINI_TIMEOUT`、`WATCH_SUB_LANG`、`WATCH_COOKIES_FILE`、`WATCH_COOKIES_FROM_BROWSER`、`WATCH_WHISPERX_*`（BIN／MODEL／DEVICE／COMPUTE_TYPE／BATCH_SIZE／LANGUAGE／TIMEOUT）。
- **每支腳本都能單獨當 CLI 用**（各檔 `if __name__ == '__main__'`）：`download.py <url> <dir>`、`frames.py <video> <dir> [--fps ...]`、`transcribe.py <vtt>`、`whisper.py <video> [audio_out] --backend ...`——方便你在自己的流程裡只用其中一段。
- **輸出介面**：stdout 的 Markdown 報告＋工作目錄下的 `frames/frame_NNNN.jpg`、`frames/cue_NNNN.jpg`、`download/run-*/video.*`。沒有 JSON 輸出模式（除了個別子腳本的 `__main__`），要接進別的程式可直接 import 函式，或改 `watch.py` 加一個 JSON 輸出。
- **加新的轉錄服務**：在 `whisper._transcribe_file`（[whisper.py#L336-L344](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/whisper.py#L336-L344)）加一個分支，並在 `config.BACKENDS` 與 `load_api_key` 加入對應 key。
- **沒有** HTTP 伺服器、REST API、網頁介面。

---

## 9. 程式品質與風險

- **維護狀況**：2026-04-24 建立，最近一次推送 2026-09-25（版本 0.3.2）。CHANGELOG 有 0.2.0（2026-06-29）→ 0.3.0／0.3.1／0.3.2（同日 2026-09-25）。單一作者（Bradley Bonanno）。掃描當天距最後更新約 40 天。淺層 clone 看不到完整 commit 歷史，貢獻者人數未確認。
- **測試**：17 個測試檔、188 個 `test_` 函式（`grep -c "def test_"` 計數）；CI 在 Ubuntu 22.04（Python 3.10）、Ubuntu／macOS／Windows（Python 3.12）上用真的 ffmpeg 跑，不碰線上 API（`.github/workflows/tests.yml`）。發佈只在測試通過後打包（`release.yml`）。以單人小專案來說品質相當高：錯誤訊息都會遮蔽 API key、設定檔原子寫入、下載檔路徑驗證防止讀到上次殘留檔案。
- **資安／隱私**：
  - Gemini 引擎：**影片會上傳到 Google**（YouTube 則送網址）；README 與 SKILL.md 都有清楚揭露，上傳後會呼叫 DELETE，刪不掉則 48 小時後自動過期（[gemini.py#L156-L162](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/gemini.py#L155-L162)）。**重點陷阱**：`engine=auto` 時只要偵測到 `GEMINI_API_KEY`（環境變數 → `~/.config/watch/.env` → **目前資料夾的 `.env`**）就會自動走 Gemini。如果你的專案資料夾 `.env` 剛好有 `GEMINI_API_KEY`，私人影片可能被上傳——要分析內部影片請固定加 `--engine local` 或在設定寫 `WATCH_ENGINE=local`。
  - Groq／OpenAI：只上傳抽出的音訊。
  - Cookie：只在明確指定時使用；SKILL.md 禁止 Claude 自動去讀瀏覽器 session。
  - `setup.py` 安裝 WhisperX 時會從網路下載 uv 安裝腳本（`curl https://astral.sh/uv/install.sh`，Windows 用 `irm ... | iex`，[setup.py#L239-L263](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/setup.py#L239-L263)），以及 PyPI／PyTorch／Hugging Face 模型——這是「下載並執行外部程式」，選 WhisperX 前要有心理準備。macOS 上缺 ffmpeg／yt-dlp 時會自動 `brew install`。
- **遙測**：專案本身沒有任何分析／遙測程式碼（grep `telemetry|analytics|posthog|sentry` 只命中「關閉 pyannote 遙測」的說明）。WhisperX 子行程設定 `PYANNOTE_METRICS_ENABLED=0`（[local_whisperx.py#L65-L68](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/local_whisperx.py#L65-L68)）。
- **已知的坑**：
  1. 只支援**最新版 yt-dlp**；YouTube、TikTok 常改版，403 就要更新 yt-dlp。
  2. 下載畫質上限 720p（拆廣告夠用，但小字可能看不清，用 `--resolution 1024`）。
  3. 長影片（>10 分鐘）在 `balanced` 下最多 100 張，覆蓋很稀疏；用 `--start/--end` 聚焦。
  4. 不支援 Claude Chat、Cowork、Claude Code 網頁版的 `/plugin` 安裝器；雲端環境多數網站會擋 yt-dlp。
  5. WhisperX 只驗證過 Apple Silicon macOS；Linux／Windows／Intel Mac／CUDA 作者標「未測試」。
  6. `WATCH_WHISPERX_LANGUAGE` 只接受兩個小寫字母（[local_whisperx.py#L36-L37](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/local_whisperx.py#L36-L37)），中文只能填 `zh`，無法指定繁體或台灣腔。
  7. 雲端 Whisper 請求沒有帶 `language` 參數（[whisper.py#L180-L184](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/whisper.py#L180-L184)），中文語音的繁簡輸出結果未確認。
  8. `token-burner` 模式不設上限，超過 250 張只會警告，可能大量消耗 Claude 用量。

---

## 10. 跟其他專案組合的建議

- **＋ AI 影片生成專案（如 MoneyPrinterTurbo、NarratoAI、OpenMontage、huobao-drama 等，同分類已有資料包）**：
  - 流程：`/watch` 拆競品爆款 → Claude 產出「腳本公式＋分鏡表（秒數、畫面、字卡、口播）」→ 餵給生成專案當腳本輸入 → 生成後再用 `/watch` 回頭檢查成片（字幕錯字、節奏、黑畫面）。這是「分析→生成→驗收」閉環，本專案負責頭尾。
- **＋ Remotion／hyperframes（程式繪製影片）**：用 `/watch` 得到的分鏡時間軸直接轉成 Remotion 的 `<Sequence from={...}>` 設定，讓 Claude 依競品節奏生成你自己商品的模板影片。
- **＋ 你的倉儲／商品資料（Firebase）**：把商品名稱、賣點、價格從你的系統匯出，連同 `/watch` 的爆款結構一起給 Claude，讓它批次產出每個商品的 15 秒腳本。
- **＋ 網頁版 Excel（01-web-excel 分類）**：把 `/watch` 的報告轉成表格（欄位：時間、畫面描述、字卡、口播、鏡頭長度、鉤子類型），存進網頁試算表，累積成「競品廣告資料庫」，再用公式統計「前 3 秒用哪種鉤子最多」。只需要在 `watch.py` 加一個 JSON／CSV 輸出（倉庫目前沒有）。
- **＋ Claude Code skills 類專案（04-agent-rules-skills 分類、marketingskills 等）**：搭配行銷文案 skill，`/watch` 負責「看」，文案 skill 負責「寫」。
- **不建議**拿它來當生成工具；它沒有任何 TTS、配樂、合成功能。

---

## 11. 影片／腳本流程檢查表

**定位提醒：這是「影片理解（輸入端）」工具，不是「影片生成」工具。** 以下大多數生成步驟都是「沒有」。

| 步驟 | 狀態 | 程式碼位置／說明 |
|---|---|---|
| 輸入：影片網址／本機影片 | 有 | [download.py#L199-L200](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L199-L200)：URL 走 yt-dlp，否則當本機檔。支援的網站＝yt-dlp 支援的網站（外掛關鍵字列 youtube、vimeo、tiktok） |
| 輸入：主題／商品圖／小說 | 沒有 | 不接受文字主題或商品圖當輸入 |
| 腳本 | 沒有（但可「反推」腳本） | 不生成腳本；但輸出帶時間戳的逐字稿＋畫面，Claude 可據此拆解出既有影片的腳本結構（[watch.py#L376-L411](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L376-L411)） |
| 分鏡 | 沒有（但可「反推」分鏡） | 場景切換抽幀天然對應「鏡頭切換點」（[frames.py#L231-L286](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L231-L286)），每張圖附 `t=MM:SS`，可直接整理成競品分鏡表 |
| 畫面（素材庫／AI 生圖／AI 生影片／程式繪製） | 沒有 | 只從既有影片截圖（JPEG，寬 512px 預設） |
| 配音（TTS／聲音複製） | 沒有 | 只有語音轉文字（反方向），沒有文字轉語音 |
| 字幕 | 有（讀取，不是產生燒錄） | 讀平台原生字幕 [download.py#L96-L162](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L96-L162)；沒有就轉錄 [whisper.py#L347-L410](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/whisper.py#L347-L410)。不會輸出 SRT 檔或燒字幕進影片 |
| 配樂 | 沒有 | 本機引擎完全不分析音樂；Gemini 引擎會「聽」整支影片含聲音（README），但只輸出文字回答 |
| 合成 | 沒有 | — |
| 輸出 | 有（分析報告） | Markdown 報告＋JPEG 截圖（[watch.py#L299-L420](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L299-L420)），不輸出影片 |

**每步用的模型／服務與成本**
- 下載：yt-dlp（免費）。抽幀：ffmpeg（免費、本機）。
- 字幕：平台原生字幕（免費）。
- 轉錄：WhisperX `small`（免費、本機 CPU）／Groq `whisper-large-v3`（付費或免費額度，金額未確認）／OpenAI `whisper-1`（付費，金額未確認）。
- 看圖：Claude（用你 Claude Code 的額度；圖越多越貴，`efficient` 50 張、`balanced` 100 張）。
- Gemini 引擎：`gemini-3.7-flash`（README 稱可用免費 key；額度與價格未確認；報告會列出 `Gemini tokens` 方便你估算，[watch.py#L75-L76](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/watch.py#L75-L76)）。

**中文（繁中、台灣口音）配音與字幕**
- 字幕讀取：可用 `--sub-lang zh-TW` 或 `--sub-lang zh-Hant` 指定（必須和平台提供的字幕 key 完全相符，[download.py#L104-L108](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L104-L108)）；預設 `auto` 會挑原始語言軌，語言未知時偏好英文。
- 轉錄：WhisperX 只能設 `WATCH_WHISPERX_LANGUAGE=zh`，無法指定繁體；README 建議非英語可改 `large-v3`。台灣口音準確度、繁簡輸出：**未確認**（沒有實際執行）。
- 配音：沒有。
- 實務建議：轉錄出簡體也沒關係，交給 Claude 分析時直接要求「以繁體中文、台灣用語回答」即可。

**Claude 怎麼用**
- **Claude Code skill／plugin（原生）**：`/plugin marketplace add bradautomates/claude-video` → `/plugin install watch@claude-video` → `/watch:watch <網址> 問題`。
- 沒有直接呼叫 Anthropic API；也不需要 OpenAI 相容介面（OpenAI 只用在可選的 Whisper 轉錄）。

**能不能在個人電腦跑**
- 可以，而且主要就是設計給個人電腦。基本路徑只需 Python 3.10+、ffmpeg、yt-dlp，**不需 GPU**。
- 本機 WhisperX：≥8 GB RAM、≥3 GB 磁碟，CPU 即可（Apple M5 Pro 上 69 秒英文音訊約 9.6 秒轉完，README 參考數據）。Windows 用 `winget` 裝 ffmpeg／yt-dlp／Deno。

**最適合做哪一種**
- 最適合：**廣告素材分析**（拆競品廣告鉤子、節奏、CTA）＞**電商商品影片**的參考與驗收＞**解說影片**轉文字 SOP＞**短劇**（可拆劇情節奏與分鏡，但長片覆蓋稀疏，要分段用 `--start/--end`）。
- 不能直接「做」上述任何一種影片。

**法律風險**
- **版權／平台條款**：用 yt-dlp 下載 YouTube、TikTok、Meta 影片多半違反平台服務條款；下載後僅供內部分析、不重新發布，風險較低，但仍不是零風險。**絕對不要把競品影片的畫面、配樂、口播直接拿去用**——拆的是「結構與手法」，要自己重拍／重寫。
- **肖像權**：截圖中的人物（網紅、模特兒）不可用在你的廣告素材中。
- **隱私**：Gemini 引擎會把影片上傳 Google；涉及客戶、員工、倉庫內部畫面的影片請用 `--engine local`。
- **Cookie**：用自己帳號的 cookie 抓需登入的影片，可能導致帳號被平台限制。
- 本專案本身（MIT）沒有額外法律限制。

---

## 關鍵字

claude-video、/watch、watch skill、Claude Code 外掛、Claude Code plugin、Agent Skills、影片理解、video understanding、看影片、拆解競品廣告、爆款腳本分析、廣告素材分析、分鏡反推、yt-dlp、ffmpeg、ffprobe、場景切換抽幀、scene detection、keyframe、關鍵幀、frame dedup、截圖去重、WebVTT、字幕解析、逐字稿、transcript、Whisper、WhisperX、Groq whisper-large-v3、OpenAI whisper-1、Gemini、gemini-3.7-flash、Gemini Files API、多模態、multimodal、YouTube、TikTok、Instagram、Python 標準函式庫、MIT 授權、Bradley Bonanno、bradautomates
