# linyqh/NarratoAI — 把「現成影片」自動變成 AI 解說短片的一站式剪輯工具（Streamlit）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：29a11b6
> GitHub：https://github.com/linyqh/NarratoAI｜⭐ 11713｜授權：MIT｜主要語言：Python｜最近更新：2026-10-24

（所有程式碼連結皆為固定在 commit 29a11b6cdf61b69ba90321fc5babc160e0ca2657 的 permalink。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

NarratoAI 是一個本機執行的 Python 網頁工具（Streamlit，開 `http://127.0.0.1:8501`）：你丟一支或多支**已經存在的影片**（電影、短劇、商品實拍、開箱錄影），它用視覺模型逐幀「看」影片、或用字幕理解劇情，再用文字模型寫出**帶時間戳的解說腳本（JSON）**，接著自動 TTS 配音、依時間戳剪片、合成字幕與配樂，最後輸出 MP4，或匯出**剪映（CapCut 中國版）草稿**讓你再手動微調。

它**不會憑空生成畫面**（沒有 AI 生圖／生影片），重點是「理解既有素材 → 寫稿 → 剪輯」。對你的用途：

- **電商商品影片**：把商品實拍／開箱長片丟進「逐幀分析」模式，自訂 prompt 改成「商品賣點解說」，自動剪成 30–60 秒有配音字幕的短片。可行，但內建 prompt 是「病毒式短影音解說」風格，需要改寫。
- **廣告素材**：同上，一支長素材可以快速切出多個版本（改 prompt、改 TTS 聲音）。
- **短劇**：這是它最強的場景——「短劇解說」「短劇混剪」「影視解說」三種模式，搭配多段 prompt（劇情分析 → 片段規劃 → 文案 → 對畫面 → 修復）。
- **給 A＋B＋C 拆用**：最值得拿的是「OpenAI 相容 LLM 封裝」「prompt 版本管理系統」「12 種 TTS 引擎分派器」「剪映草稿產生器」「FFmpeg 字幕燒錄／遮罩」。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- 授權檔 [LICENSE](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/LICENSE) 是標準 **MIT**（Copyright (c) 2024 linyq）。
- **個人使用**：完全可以，免費。
- **公司商用**：MIT 允許商用、修改、閉源再散布，只要保留原著作權聲明與授權文字。程式本身沒有商用限制。
- **要注意的不是程式授權，而是「素材」與「第三方服務」**：解說的影片／短劇本身有版權；TTS、LLM、Sonilo 配樂等服務各有條款（例如 config 註解說 Sonilo「生成的音樂已獲授權、可商用（以條款為準）」，見 [config.example.toml](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/config.example.toml)）。
- **雲端版／整合包**：README 指出另有雲端託管版 narratoai.cn 與 cutagent.online 下載的「整合包」（含 IndexTTS、OmniVoice 等部署包）。雲端版是否有開源版沒有的功能：**未確認**（repo 內看不到雲端版程式碼）。repo 內的功能沒有被付費牆鎖住的跡象。
- README 本身還放了火山引擎、矽基流動的邀請碼廣告，屬作者贊助行為，與授權無關。

## 3. 技術棧與執行需求

| 項目 | 內容（出處） |
|---|---|
| 語言 | Python ≥ 3.12（[pyproject.toml](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/pyproject.toml)） |
| 前端 | Streamlit 1.56.0，入口 [webui.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/webui.py)；元件在 `webui/components/` |
| 後端 | 同一個 Python 行程；沒有獨立 API 伺服器 |
| 資料庫 | **沒有**。設定存 `config.toml`（純文字 TOML），任務產物存 `storage/` 資料夾 |
| 影音處理 | FFmpeg（必要）、moviepy 2.1.1、pydub、Pillow |
| LLM SDK | `openai>=1.77.0`（主力，OpenAI 相容協定）、`google-generativeai`、`dashscope`（阿里）、選配 `twelvelabs` |
| TTS SDK | `edge-tts`、`azure-cognitiveservices-speech`、`tencentcloud-sdk-python`，其餘走 HTTP |
| 部署 | (1) 官方整合包（Win x64／macOS arm64）；(2) Docker（[Dockerfile](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/Dockerfile)、[docker-compose.yml](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/docker-compose.yml)，埠 8501）；(3) `uv sync` + `uv run streamlit run webui.py` |
| 硬體 | README 建議 4 核 CPU、8 GB RAM，**顯卡非必須**（LLM／視覺都走雲端 API）。若要本機語音複製（IndexTTS、VoxCPM、OmniVoice）或本機 ASR，需另外架對應服務，需求**未確認**（不在本 repo） |

**需要的 API Key 與大概費用**（實際價格以各家官網為準）：
- 視覺模型 + 文字模型：預設指向矽基流動 `https://api.siliconflow.cn/v1`，預設模型 `Qwen/Qwen3.5-122B-A10B`（視覺）、`Pro/zai-org/GLM-5`（文字）。README 宣稱「剪 10 分鐘影片約 0.1 元人民幣」（作者說法，未驗證）。
- 若改用 Claude（經 OpenAI 相容介面）：依 Anthropic 官方價目，Claude Sonnet 5.5 每百萬 token 輸入 $2／輸出 $10，Claude Haiku 5.5 為 $0.10／$0.50。逐幀分析會送大量圖片，成本主要在視覺那段。
- TTS：Edge TTS 免費（非官方用法）；Azure、騰訊、豆包、通義 Qwen3-TTS 依量計費；IndexTTS 等本機引擎免費但要自己架。
- 選配：Tavily（聯網搜劇情）、Sonilo（AI 配樂／音效，上傳成片即計費）、TwelveLabs（影片理解，config 註解稱有免費額度）。

## 4. 程式架構地圖

計數方式：`find . -name '*.py' | wc -l` 得 **150 個 .py 檔**，合計 **46,822 行**（`xargs cat | wc -l`）。

```
webui.py                      ← Streamlit 入口：側欄設定、產生影片按鈕、剪映匯出對話框
webui/
  components/
    script_settings.py        ← 5 種腳本模式的 UI（影視解說／短劇解說／逐幀分析／短劇混剪／自訂腳本）＋語言選單
    audio_settings.py         ← TTS 引擎選擇、參考音色、BGM、Sonilo
    subtitle_settings.py      ← 字幕字型、位置、遮罩（蓋掉原片字幕）
    basic_settings.py         ← LLM 供應商、base_url、API Key 設定
    video_settings.py / system_settings.py / ffmpeg_diagnostics.py
  tools/
    generate_script_docu.py   ← 逐幀分析模式的觸發
    generate_short_summary.py ← 短劇／影視解說模式主流程（含 Tavily、串流預覽）
    generate_script_short.py  ← 短劇混剪
  i18n/zh.json, en.json       ← 介面文字（簡中／英）
app/
  config/                     ← config.toml 載入、預設值、FFmpeg 路徑
  models/schema.py            ← VideoClipParams 等 Pydantic 參數模型
  services/
    task.py                   ← ★ 成片總流程 start_subclip_unified
    llm/                      ← ★ LLM 抽象層：manager、unified_service、openai_compatible_provider、twelvelabs_provider
    llm.py                    ← 舊版 LLM 程式（與 llm/ 套件同名，Python 會優先載入套件 → 實際上是死碼）
    prompts/                  ← ★ prompt 註冊／版本／範本系統，4 類 17 個 prompt 檔
    documentary/              ← 逐幀分析服務（抽幀→視覺模型→彙整→寫稿）
    SDE/ SDP/                 ← 短劇解說（SDE）、短劇混剪（SDP）
    voice.py                  ← ★ 12 種 TTS 引擎分派＋字幕時間軸（3,044 行，全專案最大檔）
    clip_video.py             ← 依時間戳＋OST 類型裁切影片（含硬體加速 fallback）
    merger_video.py           ← 片段串接
    generate_video.py         ← 最終合成：字幕燒錄、遮罩、BGM、音量
    jianying_draft_builder.py ← ★ 產生剪映草稿資料夾（1,677 行）
    sonilo.py                 ← AI 配樂／音效
    fun_asr_subtitle.py       ← Fun-ASR／FireRedASR／百煉語音轉字幕
    subtitle_translator.py / subtitle_corrector.py ← LLM 翻譯／校正字幕
    material.py / video_service.py ← 繼承自 MoneyPrinterTurbo 的 Pexels/Pixabay 素材搜尋（目前主流程未使用）
  utils/
    video_processor.py        ← FFmpeg 抽關鍵幀
    openai_base_url_security.py ← base_url 白名單與 API Key 外洩警告
tests/ + 各處 test_*.py       ← 34 個測試檔、218 個 test 函式（grep '^\s*def test_'）
```

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 成片總流程 | [task.py#L644-L1005](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/task.py#L644-L1005) | 讀腳本 JSON（每段含 `narration`、`OST`、`timestamp`）→ 只對 OST=0/2 做 TTS → `clip_video_unified` 裁切 → 合併音訊與字幕 → 串接 → `merge_materials` 疊字幕／BGM → 可選自動轉錄再燒一次字幕。由 [webui.py#L282](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/webui.py#L282) 呼叫 |
| OST 三態 | 同上＋[short_drama_narration/script_generation.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/prompts/short_drama_narration/script_generation.py) | OST=0 只放解說、OST=1 播原聲（narration 寫「播放原片+序號」）、OST=2 解說＋原聲混合。這是整個專案的核心資料格式，很適合直接沿用 |
| 逐幀分析（視覺理解） | [frame_analysis_service.py#L17-L96](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/documentary/frame_analysis_service.py#L17-L96) | 預設每 3 秒抽 1 幀（`[frames] frame_interval_input`），每批 10 張丟給視覺模型，要求回 JSON `frame_observations`；關鍵幀以影片＋間隔做快取鍵；最後轉成 Markdown 給文字模型寫稿 |
| 抽幀 | [video_processor.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/utils/video_processor.py) | 多層 FFmpeg fallback（硬體加速 → 軟解 → 超相容模式） |
| 寫解說稿 | [generate_narration_script.py#L131-L152](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/generate_narration_script.py#L131-L152) | 新 LLM 架構失敗就退回舊實作；prompt 來自 PromptManager |
| 短劇／影視解說 | [generate_short_summary.py#L463](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/webui/tools/generate_short_summary.py#L463)、[SDE/short_drama_explanation.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/SDE/short_drama_explanation.py) | 字幕 → （可選 Tavily 搜劇情）→ 劇情分析 → 使用者審稿 → `match_narration_copy_to_script` 把文案對回字幕時間戳 → JSON 修復；支援多支影片（`video_id`）與串流顯示模型思考 |
| 短劇混剪 | [step1_subtitle_analyzer_openai.py#L147-L189](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/SDP/utils/step1_subtitle_analyzer_openai.py#L147-L189) | 用 `short_drama_editing/script_generation` prompt，temperature 0.1，挑出 N 個精彩片段 |
| LLM 呼叫 | [openai_compatible_provider.py#L95-L147](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/llm/openai_compatible_provider.py#L95-L147) | 每次請求動態建 `AsyncOpenAI`；圖片轉 base64 JPEG 走 `image_url`；`response_format=json_object` 不支援時自動改成 prompt 約束；`thinking_level` 對應 `reasoning_effort` |
| TTS 分派 | [voice.py#L1271-L1331](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/voice.py#L1271-L1331)、[tts_multiple#L1794](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/voice.py#L1794) | 12 個分支（騰訊、Qwen3、SoulVoice、Azure、Edge、IndexTTS-1.5、IndexTTS-1.5 macOS、IndexTTS-2、OmniVoice、VoxCPM-0.5B、VoxCPM-2B、豆包），每段產生音檔＋字幕檔 |
| 字幕燒錄 | [generate_video.py#L723](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/generate_video.py#L723)、[#L1045](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/generate_video.py#L1045) | 用 FFmpeg `subtitles=` filter（ASS 樣式），另有 drawtext／PNG overlay 備援、原字幕模糊遮罩 |
| 剪映草稿匯出 | [jianying_draft_builder.py#L1518](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/jianying_draft_builder.py#L1518) | 直接寫出剪映草稿 JSON（影片／音訊／文字三軌），素材複製進草稿資料夾 |
| AI 配樂 | [sonilo.py#L104](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/sonilo.py#L104) | 上傳成片給 Sonilo，失敗一律回傳空字串退回隨機 BGM，不中斷任務 |
| 語音轉字幕 | [fun_asr_subtitle.py#L503](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/fun_asr_subtitle.py#L503) | 把 ASR 逐字時間戳切成每段 ≤20 字、≤3.5 秒的 SRT |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 腳本 JSON 格式（OST 0/1/2＋timestamp） | [task.py#L677-L690](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/task.py#L677-L690) | 無 | 低 | 當成你自己「AI 寫稿 → 剪輯」的中介格式，Claude 輸出這個 JSON 即可接上剪輯端 |
| Prompt 版本管理（註冊、版本、參數驗證、`${var}` 範本） | [prompts/manager.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/prompts/manager.py)、[base.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/prompts/base.py)、[registry.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/prompts/registry.py) | 純 Python | 低 | 整個 `prompts/` 資料夾可直接搬；把電商 prompt 註冊成新 category |
| 爆款解說 prompt（黃金三秒、十大鉤子） | [documentary/narration_generation.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/prompts/documentary/narration_generation.py) | 無 | 低 | 改成繁中、改成商品賣點即可當廣告腳本 prompt |
| 短劇多階段 prompt 鏈 | [prompts/short_drama_narration/](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/prompts/short_drama_narration/__init__.py) | 無 | 低 | 「劇情分析→片段規劃→文案→對畫面→修復」五段式，可移植到 Claude Code skill |
| OpenAI 相容 LLM 封裝（文字＋視覺＋串流＋JSON 回退） | [openai_compatible_provider.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/llm/openai_compatible_provider.py) | `openai`、Pillow、loguru | 中 | 需拔掉 `app.config` 相依；或乾脆改寫成 Anthropic SDK 版 |
| 抽幀＋分批視覺分析服務 | [frame_analysis_service.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/documentary/frame_analysis_service.py) | FFmpeg、上面的 LLM 層 | 中 | 商品影片 → 每幀描述 JSON，可餵給任何寫稿模型 |
| TTS 分派器 | [voice.py#L1271-L1331](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/voice.py#L1271-L1331) | 各家 SDK | 中 | 檔案太大（3,044 行），建議只抽 `azure_tts_v1`（Edge）與需要的引擎 |
| 剪映草稿產生器 | [jianying_draft_builder.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/jianying_draft_builder.py) | ffprobe、`VideoClipParams` | 中 | 輸入「腳本＋音檔＋字幕」就能產生可在剪映打開的草稿，適合「AI 粗剪、人工精修」。CapCut 國際版是否相容：未確認 |
| FFmpeg 字幕燒錄＋遮罩 | [generate_video.py#L723-L1045](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/generate_video.py#L723-L1045) | FFmpeg | 中 | 可獨立成「SRT＋影片→成片」小工具 |
| ASR 結果轉 SRT | [fun_asr_subtitle.py#L503](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/fun_asr_subtitle.py#L503) | 無 | 低 | 任何有逐字時間戳的 ASR 都能套用 |
| base_url 安全檢查 | [openai_base_url_security.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/utils/openai_base_url_security.py) | 無 | 低 | 你自己的工具若允許自填 API 端點，可照抄這套白名單警告 |

## 7. AI／Claude 整合

- **模型**：只註冊兩種 provider——`openai`（OpenAI 相容統一介面）與 `twelvelabs`（Pegasus 影片理解，僅視覺），見 [providers/__init__.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/llm/providers/__init__.py)。v0.7.7 起移除 LiteLLM（README 記載）。
- **Prompt 位置**：`app/services/prompts/` 下 4 類（documentary、film_tv_narration、short_drama_editing、short_drama_narration），共 17 個 prompt 檔、2,107 行（`wc -l app/services/prompts/*/*.py`）。逐幀分析的視覺 prompt 則直接寫在 [frame_analysis_service.py#L18-L35](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/documentary/frame_analysis_service.py#L18-L35)。
- **MCP／Skills**：沒有。repo 內 grep `anthropic|claude`（不分大小寫）只在 config 範例的 API Key 網址註解出現一次。
- **能不能換成 Claude**：**可接，但非原生**。做法是把 `text_openai_base_url`／`vision_openai_base_url` 設成 Anthropic 的 OpenAI 相容端點、模型名填 Claude 模型 ID。程式會因為 `api.anthropic.com` 不在白名單而**只顯示警告、不阻擋**（[openai_base_url_security.py#L6](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/utils/openai_base_url_security.py#L6)）。
  - **已知風險**：[`_build_chat_completion_options`](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/llm/openai_compatible_provider.py#L95-L125) **每次都同時送 `temperature` 和 `top_p`**，預設 `max_tokens=65536`。新版 Claude 的原生 API 會拒絕 temperature/top_p；經 OpenAI 相容層時會不會被忽略或報 400，**未確認**，很可能需要改這個函式（拿掉兩個取樣參數、調小 max_tokens）。
  - 比較穩的替代：透過 OpenRouter（在白名單內）呼叫 Claude；或自己寫一個 `AnthropicTextProvider`，用 `LLMServiceManager.register_text_provider('anthropic', ...)` 註冊（擴充點見第 8 節）。
- **另一個方向**：與其讓 NarratoAI 叫 Claude，不如讓 **Claude Code 直接產生它的腳本 JSON**（自訂腳本模式可直接載入），NarratoAI 只負責 TTS＋剪輯。

## 8. 擴充方式與 API

- **新增 LLM 供應商**：實作 `TextModelProvider`／`VisionModelProvider`（[llm/base.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/llm/base.py)），在 [providers/__init__.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/llm/providers/__init__.py) 用 `LLMServiceManager.register_*_provider` 註冊；上層統一呼叫 [unified_service.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/llm/unified_service.py) 的 `generate_text`／`analyze_images`。
- **新增 prompt**：繼承 `TextPrompt`／`ParameterizedPrompt`，在該 category 的 `register_prompts()` 中註冊，透過 `PromptManager.get_prompt(category, name, parameters)` 取用。
- **新增 TTS**：在 [voice.py `tts()`](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/voice.py#L1271) 加一個分支並回傳 `SubMaker`（給字幕時間軸用）。
- **對外 API**：**沒有** REST API；只有 Streamlit 介面。要自動化只能直接 import `app.services.task.start_subclip_unified(task_id, params)`（需自行準備腳本 JSON 與 `VideoClipParams`）。

## 9. 程式品質與風險

- **維護狀況**：活躍。最新 commit 2026-10-25（訊息「更新文档」），README 記錄 2026 年內 0.7.7→0.8.6 多次發版；`project_version` 為 0.8.7，但 `pyproject.toml` 仍寫 0.8.4（版本號不同步）。
- **測試**：34 個測試檔、218 個 test 函式，多為單元測試。CI 只有一個用 DeepSeek 做 PR 程式碼審查的 workflow（[codeReview.yml](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/.github/workflows/codeReview.yml)），**沒看到自動跑測試的 CI**。
- **死碼／技術債**：`app/services/llm.py`（816 行）與 `app/services/llm/` 套件同名，實際被 import 的是套件；檔內還有 Cloudflare、百度等舊供應商。`material.py`（Pexels/Pixabay）只被 `video_service.py` 與 `utils.py` import，主流程不用。`utils.get_current_country()` 會連 ipapi.co，但 grep 找不到呼叫處。
- **資安／隱私**：
  - API Key 以**明文**寫入 `config.toml`（[config.py#L161-L175](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/config/config.py#L161-L175)）。
  - Docker 啟動參數 `--server.address=0.0.0.0`、`--server.enableXsrfProtection=false`（[docker-entrypoint.sh](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/docker-entrypoint.sh)），**沒有登入機制**——只能在自己電腦或內網用，不要直接開到公網。
  - 影片畫面（抽幀）、字幕會上傳到你設定的 LLM 供應商；啟用 Sonilo 會上傳整支成片。
- **遙測**：Docker 版明確關閉 Streamlit 使用統計（`gatherUsageStats=false`）；本機 `uv run` 方式是否關閉：未確認（repo 中沒有 `.streamlit/config.toml`）。程式碼中沒看到自家分析回報。
- **已知的坑**：介面與 prompt 幾乎全是簡體中文；預設 base_url 指向中國矽基流動；FFmpeg 必須自備；SDE 檔尾的範例程式碼寫死 `api.narratoai.cn` 與作者本機路徑（只在 `__main__` 執行，不影響正常使用）。

## 10. 跟其他專案組合的建議

- **NarratoAI（剪輯後段）＋ Claude Code（寫稿前段）**：用 Claude 產生 OST 格式的腳本 JSON → NarratoAI「自訂腳本」模式 → 一鍵成片或匯出剪映草稿。最省力的組合。
- **＋ 會生成畫面的專案**（例如本分類中的短劇生成類專案）：那些負責「從無到有生成鏡頭」，NarratoAI 負責「把鏡頭配音、上字幕、剪成片」。
- **＋ 你的倉儲／商品資料**：可以從你 Firebase 倉儲系統匯出商品名稱、規格、價格，餵給改寫過的 `narration_generation` prompt，批次產生每支商品影片的解說稿。
- **不建議**拿它當「從零生成短劇」的工具——它需要現成影片素材。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有 | 位置與說明 |
|---|---|---|
| 輸入：主題 | 有（輔助） | `video_theme`／短劇名稱，只作為 prompt 參數與 Tavily 搜尋關鍵字（[generate_short_summary.py#L463](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/webui/tools/generate_short_summary.py#L463)） |
| 輸入：商品圖 | 沒有 | 只吃影片＋字幕，不吃靜態圖片 |
| 輸入：小說 | 沒有 | 無小說轉劇本流程 |
| 輸入：影片素材＋字幕 | 有 | 核心輸入，可多支影片；`VIDEO_UPLOAD_TYPES` mp4/mov/avi/flv/mkv（[script_settings.py#L36](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/webui/components/script_settings.py#L36)） |
| 腳本 | 有 | LLM 生成帶時間戳 JSON（第 5 節） |
| 分鏡 | 部分有 | 「片段規劃」prompt（segment_planning）決定用哪幾段原片；沒有傳統分鏡表 |
| 畫面：素材庫 | 未啟用 | `material.py` 有 Pexels/Pixabay 搜尋，但主流程沒用 |
| 畫面：AI 生圖／生影片 | 沒有 | — |
| 畫面：裁切原片 | 有 | [clip_video.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/clip_video.py) |
| 配音 TTS | 有 | 12 種引擎（[voice.py#L1271-L1331](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/voice.py#L1271-L1331)）；Edge 免費、雲端 TTS 依量計費 |
| 聲音複製 | 有（需自架） | IndexTTS-1.5／2、OmniVoice、VoxCPM 走本機 HTTP 服務（[config.example.toml](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/config.example.toml)），需另外下載部署包與 GPU／Apple Silicon，需求未確認 |
| 字幕 | 有 | TTS 自帶時間軸產生 SRT；或 Fun-ASR 轉錄；FFmpeg 燒錄＋原字幕遮罩 |
| 配樂 | 有 | 隨機本機 BGM，或 Sonilo AI 配樂（≤6 分鐘）／音效（≤3 分鐘），付費 |
| 合成 | 有 | [generate_video.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/generate_video.py) FFmpeg |
| 輸出 | 有 | MP4（直式／橫式）＋剪映草稿（[jianying_draft_builder.py#L1518](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/jianying_draft_builder.py#L1518)） |
| 繁中／台灣口音配音 | 有（Edge／Azure） | Edge TTS 列出線上全部音色（[voice.py#L1386-L1407](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/voice.py#L1386-L1407)），內建清單也含 `zh-TW-HsiaoChenNeural`、`zh-TW-HsiaoYuNeural`、`zh-TW-YunJheNeural`。介面預設是 `zh-CN`，要手動選 |
| 繁中字幕／文案 | 需手動 | 語言選單只有「簡體中文（中國）」等 9 種＋「自訂」（[script_settings.py#L38-L49](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/webui/components/script_settings.py#L38-L49)），可在自訂填「繁體中文（台灣）」。但逐幀分析 prompt 寫死「解說文案的語言使用简体中文」（[narration_generation.py](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/app/services/prompts/documentary/narration_generation.py)），要改程式碼。預設字型 SimHei 對繁體字的覆蓋程度：未確認 |
| Claude 怎麼用 | 只能經 OpenAI 相容介面 | 無 Anthropic SDK、無 Claude Code skill／plugin、無 MCP；temperature/top_p 相容性見第 7 節 |
| 個人電腦能不能跑 | 能 | 主程式只要 CPU＋FFmpeg；AI 部分全打雲端 API。本機語音複製才需要 GPU 或 Apple Silicon |
| 最適合 | **解說影片＞短劇解說／混剪＞廣告素材＞電商商品影片** | 電商影片可用但要改 prompt；它不會生成新畫面 |
| 法律風險 | 高（取決於素材） | 影視／短劇解說本質是二次利用他人作品，在台灣屬著作權風險區，平台也常以重複內容／侵權下架。內建參考音色清單包含真人名稱（如「董宇辉」「唐纳德·特朗普」，見 [audio_settings.py#L14-L39](https://github.com/linyqh/NarratoAI/blob/29a11b6cdf61b69ba90321fc5babc160e0ca2657/webui/components/audio_settings.py#L14-L39)），用來複製真人聲音有人格權／聲音權疑慮；音檔本身不在 repo 內，來源未確認。商用請只用自有或授權素材 |

## 關鍵字
NarratoAI、AI 影片解說、影視解說、短劇解說、短劇混剪、自動剪輯、逐幀分析、視覺模型、解說腳本、TTS、語音合成、聲音複製、IndexTTS、Edge TTS、字幕燒錄、剪映草稿、CapCut、FFmpeg、Streamlit、OpenAI 相容、Claude、prompt 管理、Sonilo AI 配樂、Fun-ASR、電商商品影片、AI video narration、auto video editing、short drama recap、film commentary、jianying draft、voice cloning、subtitle burn-in
