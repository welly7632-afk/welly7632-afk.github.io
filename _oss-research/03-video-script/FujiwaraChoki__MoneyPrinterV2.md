# FujiwaraChoki/MoneyPrinterV2 — 用本機 Ollama＋Gemini 生圖＋KittenTTS 自動做 YouTube Shorts 並用 Selenium 上傳的 Python 命令列工具

> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：a734fa9
> GitHub：https://github.com/FujiwaraChoki/MoneyPrinterV2｜⭐ 32295｜授權：AGPL-3.0｜主要語言：Python｜最近更新：2026-09-15

（以下 permalink 前綴皆為 `https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/`，簡寫為 `…/blob/a734fa9/`；表格與清單中仍給完整網址。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：一個純命令列（CLI）的 Python 小工具，把「主題 → LLM 寫 4 句腳本 → Gemini 生直式圖片 → KittenTTS 英文配音 → Whisper 自動字幕 → 隨機背景音樂 → MoviePy 合成 9:16 短影片 → 用 Selenium 開 Firefox 自動上傳 YouTube Shorts」整條串起來；另外附 X（Twitter）自動發文、Amazon 聯盟行銷文案、Google Maps 抓店家＋冷郵件外展。

**對你（台灣小老闆、自己做倉儲網頁、跑廣告）有用的地方：**
- **當作「最小可行的短影片流水線」範本**：整個影片流程集中在一個 909 行的檔案 `src/classes/YouTube.py`，非常好讀，適合拿來給 Claude Code 當「骨架」，再換成你要的元件（Claude 寫腳本、繁中 TTS、商品實拍圖）。
- **可拆的小零件**：Gemini（Nano Banana）生圖的 REST 呼叫、faster-whisper 產生 SRT 字幕、MoviePy 把圖＋聲音＋字幕＋配樂合成、Post Bridge 跨平台（TikTok／Instagram）發佈 API 客戶端。
- **不適合直接拿來做的**：電商商品影片（它不吃商品圖，只會讓 AI 憑空生圖）、短劇（只有 4 句旁白，沒有角色／分鏡／對白）、繁中影片（預設 TTS 只有英文聲音，字型與字幕斷句也未針對中文）。
- **跟你的試算表／比價／ERP 需求無關**：本專案沒有任何試算表、價格或庫存功能（唯一和「商品」有關的是 `AFM.py` 抓 Amazon 商品標題寫推銷文）。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：GNU AGPL-3.0**（已開啟 `LICENSE` 確認第一行為 "GNU AFFERO GENERAL PUBLIC LICENSE Version 3"；README 也寫 `Affero General Public License v3.0`）。
- **個人使用**：在自己電腦上跑、改程式碼都沒問題，不需公開任何東西。
- **公司商用**：可以商用，但 AGPL 是「強傳染＋網路條款」：
  - 若你把它（或改過的版本、或把它的程式碼片段複製進你自己的工具）**散布給別人**，或**做成網站／SaaS 讓別人透過網路使用**，就必須用 AGPL-3.0 公開你整個衍生作品的原始碼。
  - 只在公司內部自己跑、產出的「影片」本身不受 AGPL 約束（授權約束的是程式碼，不是輸出檔）。
  - **想拆零件放進你自己的 Firebase 網頁工具**：最安全的做法是「看懂思路、請 Claude 重新寫」，不要直接複製貼上整段程式碼，否則你的工具可能被要求整包 AGPL 開源。
- **付費版／閉源功能**：repo 內沒有看到付費版或閉源模組。但流程依賴的外部服務要另外付費或有條款：Gemini 生圖 API、AssemblyAI（可選）、Post Bridge（可選，文件連結帶有 `?atp=MoneyPrinter` 推薦參數，見 `docs/PostBridge.md`）。
- **第三方元件授權**：KittenTTS 模型、faster-whisper、gosom/google-maps-scraper（Outreach 會下載後自行編譯）各有各的授權，本次未逐一確認（未確認）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容（皆來自 `requirements.txt`、`config.example.json`、原始碼） |
|---|---|
| 語言 | Python 3.12（`.python-version` 寫 `3.12`） |
| 前端 | **沒有**。純終端機選單（`prettytable`、`termcolor`） |
| 後端 | 無伺服器，單機 CLI：`python src/main.py` |
| 資料庫 | **沒有**。帳號、影片紀錄存在 `.mp/youtube.json`、`.mp/twitter.json` 等 JSON 檔（`src/cache.py`） |
| LLM | **只支援本機 Ollama**（`ollama` 套件，`src/llm_provider.py`） |
| 生圖 | Google Gemini 圖像 API，預設模型 `gemini-3.1-flash-image-preview`（專案稱 Nano Banana 2），預設比例 9:16 |
| 配音 | KittenTTS `KittenML/kitten-tts-mini-0.8`，本機 CPU 推論 |
| 字幕 | 本機 `faster-whisper`（預設 `base`、`int8`），或 AssemblyAI 雲端 |
| 影片合成 | `moviepy`（使用 1.x 的 `moviepy.editor` API）＋ ImageMagick（`TextClip` 字幕需要） |
| 自動化上傳 | Selenium + Firefox（geckodriver 由 `webdriver_manager` 自動下載），需要事先登入好的 Firefox profile |
| 排程 | `schedule` 套件＋`src/cron.py`（但見第 9 節：內建排程實際不會觸發） |
| 外展 | Go 語言（編譯 Google Maps 爬蟲）、`yagmail` 透過 SMTP 寄信 |

**硬體**：沒有 GPU 也能跑。Ollama 小模型（如文件舉例 `llama3.2:3b`）在 8–16 GB RAM 筆電可跑；faster-whisper `base` 用 CPU 即可；KittenTTS 是輕量 CPU 模型。若要用較大的 Ollama 模型或 `large-v3` Whisper，建議有 GPU（未實測）。

**API Key 與費用（概估，費率未在 repo 中，皆為「未確認」需自行查官方價目）**：
- `nanobanana2_api_key`（或環境變數 `GEMINI_API_KEY`）：**必要**，每支影片要生多張圖，見第 9 節「圖片數量」的坑——費用可能比你想像的高。
- `assembly_ai_api_key`：選用（預設用本機 Whisper，免費）。
- Post Bridge `api_key`：選用，付費 SaaS。
- Ollama、KittenTTS、faster-whisper：免費（本機運算）。
- Email SMTP 帳密：只有 Outreach 功能需要。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree -r --name-only HEAD` 共 44 個檔案；Python 檔 22 個（`src/` 16、`tests/` 5、`scripts/` 1）；`wc -l` 計算 `src/` 共 3,697 行、`tests/` 共 602 行；`grep -rh "^\s*def " src | wc -l` 得 122 個函式定義（含 `main.py` 內兩個巢狀 `job()`）。

```
MoneyPrinterV2/
├── src/
│   ├── main.py                    (517 行) 終端機主選單：YouTube／Twitter／聯盟行銷／外展；啟動時選 Ollama 模型
│   ├── cron.py                    (100 行) 給排程用的無互動入口：python src/cron.py youtube <帳號UUID> <模型>
│   ├── llm_provider.py            (63 行) ★ 唯一的 LLM 介面：Ollama chat，generate_text(prompt)
│   ├── config.py                  (405 行) 33 個 getter，每次呼叫都重新讀 config.json；equalize_subtitles()
│   ├── cache.py                   (193 行) .mp/*.json 帳號、影片、商品紀錄的讀寫
│   ├── post_bridge_integration.py (222 行) YouTube 上傳成功後轉發 TikTok／IG 的流程
│   ├── utils.py                   (159 行) 下載背景音樂 zip、隨機選歌、清暫存、kill firefox
│   ├── constants.py               (55 行) 選單文字、YouTube Studio／X 的 DOM 選擇器
│   ├── status.py / art.py         彩色輸出、ASCII banner
│   └── classes/
│       ├── YouTube.py             (909 行，23 個 def) ★ 影片生成全流程＋Selenium 上傳
│       ├── Tts.py                 (18 行) KittenTTS 包裝
│       ├── Twitter.py             (225 行) Selenium 發 X 貼文＋LLM 產生貼文
│       ├── AFM.py                 (176 行) 抓 Amazon 商品標題 → LLM 寫推銷文 → 發到 X
│       ├── Outreach.py            (293 行) 下載編譯 Google Maps 爬蟲 → 抓 email → SMTP 群發
│       └── PostBridge.py          (279 行) Post Bridge REST API 客戶端（含重試）
├── tests/                         5 個檔、19 個 test 函式（grep -c "def test"），主要測 config 與 Post Bridge
├── scripts/
│   ├── setup_local.sh             本機環境設定（含挑 Ollama 模型）
│   ├── preflight_local.py         檢查 ImageMagick、Ollama 是否就緒
│   └── upload_video.sh            互動選帳號後呼叫 cron.py（有 bug，見第 9 節）
├── docs/                          Configuration、YouTube、TwitterBot、AffiliateMarketing、PostBridge、Roadmap
├── fonts/bold_font.ttf            字幕字型（未確認是否含中文字形）
├── config.example.json            全部設定範本
├── CLAUDE.md / AGENTS.md          給 AI 編碼助理的說明（內容部分過時：說「沒有測試」，但 tests/ 存在）
└── requirements.txt               19 行相依套件，**幾乎全部沒鎖版本**
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 一鍵產生短影片（主流程）**
- 位置：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L671-L717
- 重點：`generate_video()` 依序呼叫 `generate_topic()`（或使用者自訂主題 `set_topic()`）→ `generate_script()` → `generate_metadata()` → `generate_prompts()` → 逐一 `generate_image()` → `generate_script_to_speech()` → `combine()`。完全線性、無重試佇列、無中間結果存檔。

**5.2 主題與腳本（LLM）**
- 主題：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L134-L150 —— 用頻道 niche 叫 LLM 產生一句話題。
- 腳本：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L152-L198 —— prompt 要求「{N} 句、不要 markdown、用指定語言」，N 來自 `script_sentence_length`（預設 4）。超過 5,000 字就遞迴重來（沒有次數上限）。
- 標題／描述：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L200-L222 —— 標題超過 100 字元也是無上限遞迴重試。

**5.3 圖片提示詞與生圖**
- 提示詞：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L224-L295 —— 要求 LLM 回傳 JSON 陣列；解析失敗就用 regex 抓 `[...]`，再失敗就遞迴重試。
- 生圖：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L319-L378 —— 直接 `requests.post` 到 `{base}/models/{model}:generateContent`，header `x-goog-api-key`，`responseModalities: ["IMAGE"]`、`imageConfig.aspectRatio`，從 `candidates[].content.parts[].inlineData` 取 base64 存成 PNG（`_persist_image`，L297-L317）。這段約 60 行，**是全專案最乾淨、最好拆的零件**。

**5.4 配音（TTS）**
- https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/Tts.py （全檔 18 行）—— `KittenTTS("KittenML/kitten-tts-mini-0.8")`，24 kHz，聲音由 `tts_voice` 設定（Bella、Jasper、Luna、Bruno、Rosie、Hugo、Kiki、Leo，均為英文聲音）。
- 呼叫端：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L392-L414 —— 送 TTS 前用 `re.sub(r"[^\w\s.?!]", "", script)` 清掉符號：中文字會保留（Python 3 的 `\w` 含中文），但**全形標點「，。！？」會被刪光**。

**5.5 字幕**
- 分派：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L444-L463
- 本機 Whisper：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L505-L550 —— `WhisperModel(...).transcribe(audio, vad_filter=True)`，自己把 segment 組成 SRT（時間格式化在 L488-L503）。
- AssemblyAI：L465-L486，`export_subtitles_srt()`。
- 斷行：`config.equalize_subtitles()` 用 `srt_equalizer` 每段最多 10 字元（https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/config.py#L286-L297）。注意：字幕是「把配音再聽寫一次」得到的，不是直接用腳本原文，所以可能有錯字。

**5.6 合成**
- https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L552-L647
- 重點：每張圖顯示「配音長度 ÷ 圖片數」秒；依比例中心裁切成 9:16 再 resize 1080×1920，循環補滿到配音長度；`concatenate_videoclips` 串起來；字幕用 `TextClip`（黃字黑邊、100 號字、置中）；背景音樂音量 ×0.1 與配音 `CompositeAudioClip` 混音；`write_videofile` 輸出 MP4。**沒有轉場、沒有 Ken Burns 推拉、沒有素材影片**（fadein 那行被註解掉）。

**5.7 自動上傳 YouTube（Selenium）**
- https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L734-L884
- 選擇器常數：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/constants.py
- 重點：用已登入的 Firefox profile 開 `youtube.com/upload`，對 `ytcp-uploads-file-picker` 的 input 送檔案路徑，填標題描述、勾「是否為兒童影片」、按三次 next、點第 3 個 radio（註解寫 unlisted）、按 done，再到 Studio 抓最新影片網址。**全靠 `time.sleep` 與固定 DOM id，不是 YouTube Data API**；外層 `except:` 吞掉所有錯誤只回傳 False。

**5.8 跨平台轉發（Post Bridge）**
- 客戶端：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/PostBridge.py#L88-L176 —— 先 `POST /media/create-upload-url` 拿簽名網址、`PUT` 上傳、再 `POST /posts` 指定社群帳號。
- 流程：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/post_bridge_integration.py#L126-L222 —— 只在 YouTube 上傳成功後才觸發；非互動模式需在設定檔寫死 `account_ids`。

**5.9 X 自動發文、聯盟行銷、冷郵件外展**
- X：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/Twitter.py#L73-L141 （Selenium 打開 `x.com/compose/post`，多組 selector 備援）；貼文生成 L198-L225（2 句、超過 260 字元截斷）。
- 聯盟行銷：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/AFM.py#L91-L150 —— 抓 Amazon `#productTitle`、`#feature-bullets`，LLM 寫推銷文＋附連結。
- 外展：https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/Outreach.py#L199-L293 —— 下載 gosom/google-maps-scraper v0.9.7 原始碼 zip、`go build`、依 niche 抓商家、對商家網站用 regex 撈第一個 email、用 SMTP 批次寄 HTML 信。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| Gemini（Nano Banana）生圖 REST 呼叫 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L319-L378 | `requests`、Gemini API Key | 低 | 改成獨立函式 `gen_image(prompt, ratio) -> bytes`；也可用 JS `fetch` 在 Firebase Cloud Functions 重寫（API Key 不要放前端）。若要做商品圖，可在 `parts` 加入商品照片 inlineData 做「以圖生圖」（本 repo 沒做，需自行驗證）。 |
| faster-whisper → SRT | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L488-L550 | `faster-whisper` | 低 | 純函式，輸入音檔輸出 SRT；中文可加 `language="zh"`、再用 OpenCC 轉繁體（需自加）。 |
| 圖片＋配音＋字幕＋配樂合成 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L552-L647 | MoviePy 1.x、ImageMagick、字型檔 | 中 | 適合當「投影片式商品短片」的最小範本；但 MoviePy 版本相依很脆弱，若新專案建議改用 FFmpeg 指令或 Remotion／HyperFrames 一類的程式化影片工具。 |
| 4 段 LLM prompt（主題／腳本／標題描述／生圖提示詞） | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L134-L295 | 任一 LLM | 低 | 直接當 prompt 範本改寫成繁中、電商導向（加商品賣點、價格、CTA），改用 Claude 並要求 JSON 結構化輸出。 |
| LLM 單一入口 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/llm_provider.py | `ollama` | 低 | 只有一個 `generate_text(prompt)`，換成 Anthropic SDK 只要改這個檔（見第 7 節）。 |
| Post Bridge 客戶端 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/PostBridge.py | `requests`、Post Bridge 付費帳號 | 低 | 已有單元測試（`tests/test_post_bridge_client.py`），可整包搬去做「一支影片發 TikTok＋IG」。 |
| Selenium 上傳 YouTube | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L734-L884 | Selenium、Firefox、已登入 profile | 高（且不建議） | DOM 一改就壞、違反平台自動化規範風險；正式用請改 YouTube Data API v3 的 `videos.insert`。 |
| JSON 檔帳號／紀錄存取 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/cache.py | 無 | 低 | 思路可參考，但你已經有 Firebase，直接存 Firestore 更好。 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **文字模型**：只有 Ollama 本機模型（`src/llm_provider.py` 用 `ollama.Client(host=...).chat()`），沒有 OpenAI、沒有 Anthropic、沒有 OpenAI 相容介面設定。README 致謝 gpt4free，但以 `grep -rni "g4f|gpt4free" src requirements.txt scripts` 搜尋無結果，目前程式碼並未使用。`scripts/setup_local.sh` 會寫入 `llm_provider: local_ollama`，但 `src/` 並沒有讀這個欄位（`config.py` 33 個函式中無此 getter）。
- **圖像模型**：Google Gemini `gemini-3.1-flash-image-preview`。
- **語音**：KittenTTS mini 0.8（本機）。**語音辨識**：faster-whisper 或 AssemblyAI。
- **prompt 位置**：全部硬寫在 Python f-string 中——YouTube 4 段在 `YouTube.py` L141–L257、X 貼文在 `Twitter.py` L205–L208、聯盟行銷在 `AFM.py` L139–L145。沒有獨立 prompt 檔、沒有範本系統。
- **MCP／Claude Code Skills／plugin**：**沒有**。repo 裡的 `CLAUDE.md`、`AGENTS.md` 只是給 AI 編碼助理看的專案說明，不是 Skill。
- **換成 Claude 的難度：低**。因為所有呼叫都經過 `generate_text(prompt, model_name=None)` 一個函式，只要把 `llm_provider.py` 改成呼叫 Anthropic Messages API（`anthropic` Python SDK 的 `client.messages.create(model=..., max_tokens=..., messages=[...])`，回傳取 `content[0].text`），再拿掉 `main.py` 啟動時「列出 Ollama 模型」那段（https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/main.py#L480-L513）與 `cron.py` 必填第三個參數的檢查即可。建議同時要求 Claude 以 JSON 回傳圖片提示詞，取代目前脆弱的 regex 解析。
- **Claude 支援等級**：可接（需自行改程式，不是原生）。

## 8. 擴充方式與 API

- **沒有外掛系統、沒有 HTTP API、沒有 Web UI**。擴充方式就是直接改 Python 類別。
- **非互動入口**：`python src/cron.py youtube <帳號UUID> <ollama模型>`（https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/cron.py#L31-L39）——這是唯一能被外部排程（例如系統 crontab、Windows 工作排程器）呼叫的介面。
- **自訂主題**：`YouTube.generate_video(tts, topic="...")`（選單第 2 項「Upload Short with custom topic」）。若要做「從你的 Firebase 倉儲系統抓熱賣品 → 自動出影片」，可在外面寫腳本 import `YouTube` 類別並傳入 topic。
- **設定**：全部在 `config.json`；`GEMINI_API_KEY`、`POST_BRIDGE_API_KEY` 可用環境變數。
- **想加新平台**：照 `Twitter.py` 的模式寫新類別＋在 `constants.py` 加選單、`main.py` 加分支；或走 Post Bridge 的 `platforms`（目前 v1 只支援 `tiktok`、`instagram`）。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

**維護狀況**：最後一次 commit 為 2026-09-16（+0200），GitHub 顯示最近 push 2026-09-15；star 3.2 萬、作者個人專案。因採淺層 clone，commit 總數與 issue 處理速度未確認。Roadmap 中「Subtitles for Shorts」等項目仍未勾選（實際上字幕已實作，文件過時）。

**測試**：`tests/` 5 檔 19 個測試函式，集中在 config、自訂主題、Post Bridge；影片合成與 Selenium 上傳**沒有測試**。沒有 CI 設定檔（`.github/` 只有 `FUNDING.yml`）。

**遙測**：以 `grep -rn "telemetry|analytics|posthog|sentry" src` 搜尋無結果，未發現遙測。

**資安／隱私**：
- `config.json` 明文存 Gmail 帳號密碼、各種 API Key（已在 `.gitignore`，但仍是明文）。
- Firefox profile 內含你的 YouTube／X 登入 cookie，程式以該 profile 全權操作帳號。
- Outreach 會從網路下載 Go 原始碼並 `go mod download`、`go build` 後執行（供應鏈風險，版本由設定檔 URL 決定）。
- `utils.close_running_selenium_instances()` 會 `pkill firefox`／`taskkill /f /im firefox.exe`，會把你平常在用的 Firefox 一起關掉。
- 解壓 zip 時有檢查 `..` 與絕對路徑（`utils.py`、`Outreach.py`），算有基本防護。

**已知的坑（皆為本次讀程式碼確認）**：
1. **內建「CRON Job」不會執行**：`main.py` 用 `schedule.every()...do(job)` 註冊工作，但整個 `src/` 以 `grep run_pending` 搜不到任何 `schedule.run_pending()`，排程永遠不會觸發。要排程請用系統 crontab 直接呼叫 `cron.py`。
2. **YouTube 選單「Thrice a day」沒實作**：L234–L244 只處理 1、2，選 3 直接 `break`。
3. **`scripts/upload_video.sh` 必失敗**：它呼叫 `cron.py youtube $id` 沒帶模型參數，而 `cron.py` L35–L39 沒有模型就 `sys.exit(1)`。
4. **圖片數量可能爆量**：`generate_prompts()` 的 `n_prompts = len(self.script) / 3`（L231）是「腳本**字元數**÷3」，4 句英文約 300 字元就會要求約 100 個提示詞（還是小數，例如 "100.0"），每一個都會呼叫一次 Gemini 生圖——**直接影響 API 費用與時間**。實際張數取決於 LLM 回傳多少個，建議改成固定 4–8 張。
5. **生圖全失敗會當掉**：失敗的圖不會加進 `self.images`，若全部失敗，`combine()` L563 `max_duration / len(self.images)` 會除以零。
6. **多處無上限遞迴重試**（腳本 >5000 字、標題 >100 字元、提示詞解析失敗），小模型容易卡死或 RecursionError。
7. **MoviePy 版本相依**：程式用 `from moviepy.editor import *`、`set_fps`／`set_audio` 等 1.x API，但 `requirements.txt` 的 `moviepy` 沒鎖版本；MoviePy 2.x 已移除 `moviepy.editor` 並改名這些方法（此為 MoviePy 上游的已知變更，非本 repo 內容），新環境直接 `pip install` 很可能匯入失敗，需手動鎖 `moviepy<2`。
8. **AFM 推銷文 prompt 帶進的是物件字串**：`features` 是 `find_elements` 回傳的 WebElement 清單，`str(self.features)` 會變成物件描述而非商品特色文字（AFM.py L105、L141）。
9. **Outreach 收件人取值疑似錯誤**：`set_email_for_website()` 把 email 寫回 CSV 檔，但後面用的是寫入前讀出的 `item.split(",")[-1]`（L238、L267），新抓到的 email 不會出現在 `item` 中；是否實際能寄出取決於爬蟲輸出最後一欄（未確認）。
10. `YouTube.get_videos()` 在快取檔不存在時寫入 `{"videos": []}`，下一行卻讀 `["accounts"]`（L893–L904），會 KeyError（通常 `get_accounts` 已先建立檔案，所以平常不易觸發）。
11. `CLAUDE.md` 說「沒有測試」與實際不符，若交給 Claude Code 改，要提醒它以程式碼為準。

## 10. 跟其他專案組合的建議

- **它的定位 = 「最短、最好讀的教學級流水線」**，不是成品。建議組合方式：
  - **A（腳本）**：用 Claude（Anthropic API 或 Claude Code）取代 Ollama，prompt 改成繁中電商導向；可參考同分類資料包中的 `zenstory-ai__drama-skills`（短劇腳本 Skill）、`digitalsamba__claude-code-video-toolkit`（Claude Code 影片工具組）做法。
  - **B（畫面）**：電商影片優先用「你自己的商品實拍圖」＋本專案 5.6 的裁切合成邏輯；需要 AI 圖時拿本專案的 Gemini REST 片段；要更精緻的程式化排版動畫則改用 `heygen-com__hyperframes` 一類 HTML→影片方案。
  - **C（配音／字幕）**：KittenTTS 換成支援繁中的 TTS（例如 Edge TTS 的 zh-TW 聲音、或雲端 TTS），字幕直接用腳本原文對齊，不必再跑 Whisper 聽寫；中文可參考 `linyqh__NarratoAI`、以及 README 推薦的中文社群版 harry0703/MoneyPrinterTurbo（本次未掃描，未確認細節）。
  - **D（發佈）**：Post Bridge 客戶端可留著；YouTube 上傳改用官方 Data API。
- **和你的倉儲網頁連動**：寫一個小腳本從 Firestore 撈「本週熱賣／新品」→ 組 topic（品名＋賣點＋價格）→ 呼叫改造後的流程 → 產出 MP4 給廣告用。這部分本專案沒有，需要自建。
- 授權提醒：AGPL 程式碼若要進到你會給員工以外的人用的網頁工具，建議「參考思路重寫」而非複製。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有 | 程式碼位置 | 說明 |
|---|---|---|---|
| 輸入：主題 | 有 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L649-L691 | 頻道 niche 讓 LLM 想主題，或使用者自訂一句主題。 |
| 輸入：商品圖／小說／素材 | 沒有 | — | 不吃任何圖片、文章或影片素材；AFM 只抓 Amazon 標題做推文，不做影片。 |
| 腳本 | 有 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L152-L198 | 預設 4 句旁白，無鉤子／CTA 結構。 |
| 分鏡 | 沒有（只有圖片提示詞清單） | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L224-L295 | 提示詞與句子沒有一一對應，圖片平均分配時間。 |
| 畫面：AI 生圖 | 有 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L319-L390 | Gemini 圖像 API，付費。 |
| 畫面：素材庫／AI 生影片／程式繪製 | 沒有 | — | 無 Pexels 素材、無 AI 影片模型、無動畫。 |
| 配音（TTS） | 有 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/Tts.py | KittenTTS 本機免費，8 個英文聲音。 |
| 聲音複製 | 沒有 | — | — |
| 字幕 | 有 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L444-L550 | Whisper 本機（免費）或 AssemblyAI（付費），燒錄進畫面。 |
| 配樂 | 有 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/utils.py#L65-L159 | 從 `zip_url` 下載音樂 zip，隨機選一首、音量 10%；預設網址清單是空的，要自己準備音樂。 |
| 合成 | 有 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L552-L647 | MoviePy 1.x＋ImageMagick，1080×1920、30fps。 |
| 輸出／發佈 | 有 | https://github.com/FujiwaraChoki/MoneyPrinterV2/blob/a734fa924adb9ffe5ab8472aa5526e469e42a8b5/src/classes/YouTube.py#L734-L884 | MP4 存在 `.mp/`；可 Selenium 上傳 YouTube、Post Bridge 轉發 TikTok／IG。 |

- **各步驟模型與成本**：腳本＝Ollama 本機（免費、吃電腦資源）；生圖＝Gemini `gemini-3.1-flash-image-preview`（付費，單價未確認；注意第 9 節第 4 點的張數爆量問題）；配音＝KittenTTS（免費）；字幕＝faster-whisper（免費）或 AssemblyAI（付費，單價未確認）；發佈＝Selenium（免費）／Post Bridge（付費訂閱，價格未確認）。
- **中文（繁中、台灣口音）配音與字幕**：**沒有**。腳本語言可由帳號 `language` 指定為中文，LLM 可以寫中文；但 KittenTTS 聲音皆為英文名稱、此 repo 內沒有任何中文聲音設定（是否能唸中文未確認，高機率不行）；`generate_script_to_speech` 會刪掉全形標點；`srt_equalizer` 以 10 字元斷行對中文的效果未確認；`fonts/bold_font.ttf` 是否含中文字形未確認（若不含會顯示方框）。Whisper 可辨識中文，但預設輸出簡體或繁體不固定。結論：要做台灣中文影片，TTS、字型、字幕三處都要換。
- **Claude 怎麼用**：沒有 Claude Code skill／plugin、沒有 Anthropic API、也沒有 OpenAI 相容介面；只能改 `src/llm_provider.py` 自己接 Anthropic SDK（改動很小，見第 7 節）。或者直接把這個 repo 交給 Claude Code，讓它照第 6 節表格重寫成你的版本。
- **能不能在個人電腦跑**：可以，而且是設計成本機跑：Ollama 小模型＋KittenTTS＋Whisper `base` 都可只用 CPU（建議 16 GB RAM 較順，未實測）；唯一必須上雲的是 Gemini 生圖（也可自行換成本機 Stable Diffusion，本 repo 未提供）。需要另外安裝 ImageMagick、Firefox、（外展才需要）Go。
- **最適合做**：「解說／知識型」的無臉 YouTube Shorts（旁白＋AI 圖輪播＋字幕）。電商商品影片：不適合（不吃商品圖）；廣告素材：只能當範本改；短劇：不適合（沒有角色、對白、分鏡、一致性控制）。
- **法律風險**：
  - **平台條款**：用 Selenium 操作 YouTube／X 帳號、大量自動發文，可能違反平台的自動化與垃圾內容政策，帳號有被限制或停權風險；YouTube 對「大量重複、低品質 AI 內容」的營利資格審查也會影響。
  - **個資與反垃圾郵件**：Outreach 從 Google Maps 抓商家、爬網站 email 再群發，在台灣可能觸及《個人資料保護法》蒐集與利用的規範，在其他國家可能觸犯反垃圾郵件法（如美國 CAN-SPAM、歐盟 GDPR）；也可能違反 Google Maps 服務條款。
  - **聯盟行銷**：Amazon 頁面爬取與聯盟揭露規範需自行遵守。
  - **版權**：背景音樂 zip 由你自己提供，若用未授權音樂會被平台偵測；AI 生成圖的著作權歸屬與商標／肖像（若提示詞含名人或品牌）需自行判斷。

## 關鍵字
MoneyPrinterV2、MPV2、MoneyPrinter、FujiwaraChoki、YouTube Shorts 自動化、短影片自動生成、AI 影片流水線、Ollama、本機 LLM、Gemini 生圖、Nano Banana、gemini-3.1-flash-image-preview、KittenTTS、文字轉語音、TTS、faster-whisper、Whisper 字幕、AssemblyAI、SRT、MoviePy、ImageMagick、Selenium、Firefox 自動化、Twitter bot、X 自動發文、聯盟行銷、Affiliate Marketing、Amazon、冷郵件外展、cold outreach、Google Maps scraper、Post Bridge、TikTok、Instagram、跨平台發佈、AGPL-3.0、Python、CLI、無臉頻道、faceless channel
