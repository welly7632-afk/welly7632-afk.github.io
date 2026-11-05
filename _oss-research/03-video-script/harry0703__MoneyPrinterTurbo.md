# harry0703/MoneyPrinterTurbo — 輸入一個主題，自動產生「腳本＋配音＋字幕＋素材剪輯＋配樂」的短影片產線
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：c8dbf96
> GitHub：https://github.com/harry0703/MoneyPrinterTurbo｜⭐ 138727｜授權：MIT｜主要語言：Python｜最近更新：2026-11-04

> 本資料包所有程式碼位置都以 commit `c8dbf96e9dfee43b30f7c3f440175d6bd4de61de` 為準（最新 commit 時間 2026-11-04 10:11 +0800）。行號為本次掃描時實際開檔確認。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 給它一個主題（例如「保溫杯冬天怎麼選」），它會用 LLM 寫旁白腳本 → 產生素材搜尋關鍵字 → 去 Pexels/Pixabay 抓免費影片（或用你自己上傳的商品圖／影片、或付費 AI 文生影片）→ Edge TTS 免費配音 → 自動字幕 → 配樂 → MoviePy/FFmpeg 合成 9:16 / 16:9 / 1:1 成片，還能一鍵發到 TikTok／IG／YouTube Shorts。

**對你（台灣小電商、自己下廣告）最實用的用法：**
1. **商品解說／種草短影片量產**：把商品照片與實拍片段丟進「本地素材」（`video_source = "local"`），自己寫或讓 Claude 寫腳本，選台灣口音的 Edge 配音 `zh-TW-HsiaoChenNeural`，一次產多支（`video_count`）不同剪輯順序的版本，拿去做廣告 A/B 測試。
2. **知識型／導購型內容**：例如「三招判斷行動電源真假」這類，素材用 Pexels 免費畫面即可，成本幾乎只有 LLM 寫腳本的費用。
3. **用 Claude 訂閱寫腳本**：它內建 `claude_code` Provider，直接呼叫你電腦上已登入的 `claude` CLI（Pro/Max/Team 訂閱），不用另外申請 Anthropic API Key。
4. **批量**：CLI 支援 `--batch-file` 讀 JSON/JSONL 清單，一行一個商品，就能整批生成；也有 REST API 可以讓你的倉儲 Firebase 網頁按一個按鈕送出生成任務。
5. **拆零件**：它的 TTS 多供應商封裝、字幕對齊、MoviePy 合成、上傳到社群平台的程式碼都很完整，可以單獨拆來接你的工具。

**不太適合：** 有角色、有劇情連貫性的「短劇」。它沒有分鏡／角色一致性的設計，畫面是「關鍵字找素材」拼接，偏「旁白＋B-roll」型影片。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**（`LICENSE` 開頭為 `MIT License / Copyright (c) 2024 Harry`，已開檔確認）。
- **個人使用：** 完全可以，隨便改、隨便用。
- **公司商用：** MIT 允許商用、修改、閉源再散布，唯一義務是保留原著作權與授權聲明。若你把它的程式碼拆進自己的工具，在原始碼或「關於」頁保留 MIT 聲明即可。
- **要特別注意的不是程式碼授權，而是「附帶的東西」：**
  - **字型**：repo 內附 `resource/fonts/MicrosoftYaHeiBold.ttc`、`MicrosoftYaHeiNormal.ttc`、`STHeitiLight.ttc`、`STHeitiMedium.ttc`（從檔案清單確認）。微軟雅黑、華文黑體都是商業字型，**MIT 不涵蓋這些字型的授權**。商用影片建議換成可商用字型（例如 Noto Sans TC 的 .ttf 版），燒進字幕的字型要有授權。
  - **素材**：Pexels／Pixabay 素材依各平台授權；AI 生成影片依各供應商條款。
  - **第三方服務條款**：Edge TTS 是走微軟 Edge 線上朗讀服務（`edge_tts` 套件），非官方商用 API，商用是否合規「未確認」，正式廣告建議改用付費的 Azure Speech（程式已支援）。
- **閉源／付費版：** 程式碼本身沒有「Pro 版才有」的鎖。但 README 有大量贊助商與推廣連結（火山引擎、APIMart、秘塔、OfoxAI、勝算雲、錄咖等），LLM 供應商清單裡也有帶推廣參數的註冊連結（例如 `app/models/llm_provider.py` 的 `fluxionai` 註冊網址帶 `promo=MONEYPRINTERTURBO`）。另外 README 提到「錄咖」提供基於本專案的線上版，那是第三方服務，不是本 repo 的一部分。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容（依 `requirements.txt`、`pyproject.toml` 確認） |
|---|---|
| 語言 | Python ≥ 3.11（`pyproject.toml` `requires-python = ">=3.11"`，版本 1.3.9） |
| 前端 | Streamlit WebUI（`webui/Main.py`，單檔 9,506 行），`streamlit==1.66.1` |
| 後端 API | FastAPI 0.136.3 + uvicorn，路由前綴 `/api/v1` |
| 影片處理 | `moviepy==2.2.1`、`imageio-ffmpeg`、FFmpeg、`pydub` |
| 配音 | `edge_tts==7.3.1`（免費）、`azure-cognitiveservices-speech`、`google-genai`、`dashscope` 等 |
| 字幕 | 預設用 Edge TTS 的字詞時間戳；可選 `faster-whisper==1.1.0` 本機轉錄 |
| LLM SDK | `openai==2.24.0`（大多數供應商走 OpenAI 相容）、`litellm`、`google-genai`、`dashscope` |
| 資料庫 | 沒有傳統資料庫。任務狀態預設存記憶體，可選 Redis（`config.example.toml` 第 628–635 行 `enable_redis`、`max_concurrent_tasks = 5`）；成品存 `storage/tasks/<task-id>/` |
| 部署 | 本機 `uv`／pip（PyPI 套件名 `mpt`）、Windows 一鍵包、Docker（`docker-compose.yml`、`.gpu`、`.claude` 變體）、Google Colab |

**硬體（README「配置要求」段）：** 最低 4 核 CPU／4 GB RAM，GPU 非必須；推薦 6–8 核、8 GB RAM、4 GB 顯存。只用雲端 LLM＋Edge TTS＋線上素材時，主要吃 CPU（MoviePy 合成）。開 `faster-whisper large-v3` 做字幕才需要較強 CPU/GPU。

**API Key 與費用（最省方案）：**
- **LLM（必要，寫腳本＋關鍵字）**：任選一家。用 `claude_code` 走你既有的 Claude 訂閱＝不額外付費；用 Anthropic API 則按 token 計費，一支短片腳本只有幾百字，成本很低（實際金額依當時價格，未確認）。
- **Pexels / Pixabay API Key**：免費申請（`config.example.toml` 第 111、114 行 `pexels_api_keys`、`pixabay_api_keys`）。用自己的商品素材則不需要。
- **配音**：Edge TTS 免費、免 Key。
- **選配付費**：AI 文生影片（秘塔 MiniMax、火山 Seedance、WaveSpeed、OFox、MuAPI、Infistar、Jalapeno、LoomLoom）、AI 文生圖（OpenAI 相容圖片 API／Codex 圖片）、AI 配樂（ElevenLabs Music、Sonilo）、付費 TTS（Azure、ElevenLabs、MiniMax、Fish Audio…）、社群上傳（Upload-Post）、TwelveLabs 素材語意排序。README 自述價格例：秘塔 MiniMax H3「768P 0.09 元人民幣/秒」——這是贊助商文案，未獨立確認。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：用 `git ls-tree` 列出全部 472 個檔案；`find app webui -name "*.py" | wc -l` 得 71 個 Python 檔、合計 39,935 行；`ls app/services/*.py | wc -l` 得 35 個 service 模組。

```
MoneyPrinterTurbo/
├── main.py                     # 啟動 FastAPI API 伺服器
├── cli.py                      # 1,828 行：無瀏覽器 CLI，含 --stop-at 分段、--batch-file 批量
├── config.example.toml         # 所有設定與 API Key 範本（首次啟動複製成 config.toml）
├── app/
│   ├── asgi.py                 # FastAPI app、CORS、x-api-key 驗證、靜態檔
│   ├── router.py               # 掛 ping、v1/video、v1/llm 路由
│   ├── config/config.py        # 讀寫 config.toml（含 WebUI 非阻塞存檔）
│   ├── controllers/v1/
│   │   ├── video.py            # /videos /subtitle /audio /tasks /musics /video_materials /stream /download
│   │   └── llm.py              # /scripts /terms /social-metadata
│   ├── controllers/manager/    # 任務佇列：memory_manager / redis_manager
│   ├── models/
│   │   ├── schema.py           # VideoParams 等 Pydantic 模型（所有參數的唯一來源）
│   │   └── llm_provider.py     # 43 個 LLM 供應商註冊表（含 anthropic、claude_code）
│   ├── services/
│   │   ├── task.py             # 2,038 行：整條產線編排 _run_pipeline
│   │   ├── llm.py              # 1,440 行：腳本、關鍵字、社群文案 prompt 與各家 LLM 轉接
│   │   ├── material.py         # 3,348 行：Pexels/Pixabay/Coverr 搜尋下載＋各 AI 影片/圖片來源
│   │   ├── voice.py            # 3,939 行：12 家 TTS＋字幕時間軸
│   │   ├── subtitle.py         # Whisper 轉字幕＋用腳本校正字幕
│   │   ├── video.py            # 2,123 行：MoviePy 拼接、轉場、字幕燒錄、BGM 混音
│   │   ├── bgm.py              # 背景音樂上傳、驗證、列表
│   │   ├── material_upload.py  # 本地素材上傳驗證
│   │   ├── material_cache.py   # 線上素材搜尋結果磁碟快取
│   │   ├── upload_post.py      # 發佈到 TikTok/IG/YouTube Shorts（Upload-Post API）
│   │   ├── video_project.py    # 可編輯的「分場景」專案：只重算改過的場景
│   │   ├── twelvelabs.py       # 選配：素材語意重排／影片理解
│   │   ├── volcengine_seedance.py, metaso_minimax.py, muapi.py, ofox.py,
│   │   │   infistar_video.py, jalapeno_video.py, loomloom.py  # 付費 AI 影片來源
│   │   ├── elevenlabs_music.py, sonilo.py   # AI 配樂
│   │   └── codex_*.py, chatgpt_*.py, kimi_code_oauth.py      # 訂閱制 OAuth 登入
│   └── utils/                  # 檔案安全、日誌、字幕讀寫
├── webui/
│   ├── Main.py                 # Streamlit 介面（9,506 行）
│   ├── i18n/*.json             # 14 種介面語言（只有簡中 zh.json，沒有繁中）
│   └── settings_providers.py   # 設定頁供應商分組
├── docs/
│   ├── skill/SKILL.md + mpt_agent.py   # 給 AI Agent（含 Claude Code）用的 Skill
│   ├── video-projects.md       # 分場景專案說明
│   └── local-image-server/     # 自架文生圖伺服器範例
├── resource/fonts/             # 4 個中文字型 .ttc（商業字型，見授權段）
├── Dockerfile / Dockerfile.gpu / Dockerfile.claude（內含 claude CLI）
└── test/services/              # 256 個測試檔
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 產線總指揮** → [`app/services/task.py#L1549-L1984`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/task.py#L1549-L1984)
- `_run_pipeline()` 依序呼叫 `generation_progress.stage("script")`（L1726）→ `"terms"`（L1752）→ `"audio"`（L1774）→ `"subtitle"`（L1829）→ `"materials"`（L1852）→ `"rendering"`（L1888），最後 `_schedule_cross_post`（L1960）。`stop_at` 參數可在任何階段停下，方便你只要腳本或只要配音。
- 支援的素材來源寫死在 [`task.py#L102-L106`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/task.py#L102-L106)：共 14 種（pexels、pixabay、coverr、local、wavespeed、volcengine_seedance、ofox、metaso_minimax、muapi、loomloom、openai_image、codex_image、infistar、jalapeno）。

**5.2 腳本生成** → [`app/services/llm.py#L56-L71`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L56-L71)（預設 system prompt）、[`llm.py#L875-L1007`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L875-L1007)
- prompt 是英文規則：「不要 markdown、不要開場白、照指定段落數、用影片主題的語言回答」。`build_script_prompt()` 把「規則」與「主題／段落數／語言／額外需求」分開組合，所以你可以用 `custom_system_prompt`（上限 8000 字）整個換掉規則，又不會漏掉主題。
- `format_response()` 會刪 `*`、標題 `#`、`[]`、`()` 內文字——**注意：你腳本裡括號內的商品規格會被刪掉**。

**5.3 素材關鍵字** → [`llm.py#L1040-L1190`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L1040-L1190)
- 讓 LLM 輸出 JSON 陣列的英文搜尋詞；`match_script_order=True` 時關鍵字依旁白順序排列，讓畫面跟著講稿走。

**5.4 素材取得** → [`app/services/material.py`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/material.py)
- Pexels `search_videos_pexels`（L404）、Pixabay（L507）、Coverr（L649）、總入口 `download_videos`（L2361）、OpenAI 相容文生圖 `generate_images_openai`（L1801，圖片再轉成有縮放動態的影片片段）。
- **用自己的商品素材**：`task.get_video_materials()` 在 `video_source == "local"` 時走 [`video.preprocess_video()`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L2035)，路徑被限制在 `storage/local_videos` 內（防路徑穿越）；圖片會用 [`render_image_zoom_video`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L1974) 做 Ken Burns 縮放。上傳驗證在 [`material_upload.py#L296`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/material_upload.py#L296)。

**5.5 配音 TTS** → [`app/services/voice.py#L1159-L1212`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/voice.py#L1159-L1212)
- `tts()` 先移除 emoji（避免 Edge 念出 emoji 名稱），支援「停頓標籤」分段合成（僅 Edge）。我數 `def is_*_voice` 共 12 個判斷函式，對應 Azure v1(Edge)/v2、SiliconFlow、Gemini、MiMo、MiniMax、ElevenLabs、Chatterbox、Kokoro、Fish Audio、VoxCPM、no-voice。
- 聲音複製：`voxcpm_tts()`（L3259）可帶參考音檔 `voxcpm_reference_audio`；Fish Audio／ElevenLabs 可用你在該平台建立的聲音 ID（雲端付費）。

**5.6 字幕** → [`voice.py#L3768`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/voice.py#L3768)（`create_subtitle`，用 TTS 回傳的字詞時間戳逐句對齊腳本）；[`subtitle.py#L61`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/subtitle.py#L61)（Whisper 轉錄）與 [`subtitle.py#L230`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/subtitle.py#L230)（用 Levenshtein 相似度把 Whisper 結果校正回原腳本文字）。`config.example.toml` L575–578：`subtitle_provider = "edge"`，Whisper 只有明確選擇才載入。

**5.7 合成** → [`video.py#L976`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L976)（`combine_videos`：依旁白長度剪片段、random/sequential 排列、轉場、cover/contain 填滿）、[`video.py#L1605-L1974`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L1605-L1974)（`generate_video`：TextClip 燒字幕、描邊、圓角底色、彈簧動畫、CompositeAudioClip 混 BGM，BGM 失敗時仍輸出只有旁白的影片）。字型被強制限制在 `resource/fonts` 內。

**5.8 批量** → `VideoParams.video_count`（[`schema.py#L96-L170`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/models/schema.py#L96-L170)）同一腳本產多支不同剪輯；[`task.generate_final_videos`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/task.py#L1010) 在 `video_count > 1` 時會分配素材避免多支片重複用同一段。不同主題批量用 [`cli.py#L1365`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/cli.py#L1365)（`_build_batch_tasks`，每行 JSON 可覆寫任一 VideoParams 欄位）。

**5.9 社群發佈** → [`upload_post.py`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/upload_post.py)（Upload-Post API 發 TikTok/IG/YouTube Shorts）＋ [`llm.py#L1291`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L1291)（LLM 產生標題、文案、hashtag 的 JSON）。

**5.10 分場景重算** → [`video_project.py#L171`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video_project.py#L171)（`stage_graph`）、[`docs/video-projects.md`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/docs/video-projects.md)：用 `episode.json` 描述各場景的畫面/配音，改一個場景只重新渲染那段（SHA-256 比對快取）。很適合做「同一支商品影片換開頭」。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| LLM 供應商註冊表 | [llm_provider.py#L31-L55](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/models/llm_provider.py#L31-L55) | 純 dataclass | 低 | 照抄「供應商 = 資料」設計，你的工具也能一個下拉選單切 Claude/OpenAI/Gemini |
| Claude Code CLI 呼叫器 | [llm.py#L562-L680](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L562-L680)、[#L168-L181](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L168-L181) | 本機 `claude` CLI ≥ 2.1.260 | 低 | `claude -p --output-format json --system-prompt … --tools "" --safe-mode`，用訂閱跑純文字生成；可移植到任何 Python/Node 後端 |
| 腳本／關鍵字 prompt | [llm.py#L56-L71](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L56-L71)、[#L1040-L1190](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L1040-L1190) | 無 | 低 | 改成繁中電商話術版本，丟進你自己的 Claude 流程 |
| Pexels/Pixabay 搜尋下載 | [material.py#L404-L649](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/material.py#L404-L649) | requests | 中 | 會牽到 config、快取、MaterialInfo；建議只抄 API 呼叫與畫幅過濾 |
| 多家 TTS 封裝 | [voice.py#L1159-L1212](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/voice.py#L1159-L1212)、Edge [#L1337](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/voice.py#L1337) | edge_tts、pydub、ffmpeg | 中 | 檔案 3,939 行很大，只取 Edge＋你要的一家即可 |
| 字幕對齊 | [voice.py#L3768-L3824](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/voice.py#L3768-L3824)、[subtitle.py#L230](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/subtitle.py#L230) | edge_tts SubMaker／faster-whisper | 中 | 產出標準 SRT，可給任何剪輯工具用 |
| MoviePy 合成器 | [video.py#L976](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L976)、[#L1605-L1974](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L1605-L1974) | moviepy 2.2.1、ffmpeg、VideoParams | 中 | 輸入「片段清單＋音檔＋SRT」→ MP4；需把 VideoParams 換成你的參數 |
| 圖片轉動態片段 | [video.py#L1974-L2034](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L1974) | moviepy | 低 | 商品圖直接變 5 秒縮放片段，很適合電商 |
| 分場景專案 | [video_project.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video_project.py) | 只要 ffmpeg，無額外套件 | 低 | 945 行獨立 CLI，JSON 描述場景，適合當你自己工具的渲染層 |
| 社群文案＋上架 | [llm.py#L1291](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L1291)、[upload_post.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/upload_post.py) | requests、Upload-Post 帳號 | 低 | 生成標題/hashtag JSON 後 POST 上架 |
| REST API | [controllers/v1/video.py#L214-L235](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/controllers/v1/video.py#L214) | FastAPI | 低（整個當服務用） | 你的 Firebase 網頁 `fetch('/api/v1/videos')` 送任務、輪詢 `/api/v1/tasks/{id}` |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **供應商數量：** 數 `app/models/llm_provider.py` 中縮排 4 格的 `LLMProviderSpec(` 共 **43 個**，預設是 `moonshot`（Kimi）。
- **Claude 有三種接法（都已在程式中）：**
  1. **Anthropic API**：[llm_provider.py#L304-L310](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/models/llm_provider.py#L304-L310)，`default_model="claude-sonnet-5"`、`default_base_url="https://api.anthropic.com/v1/"`。沒有指定 adapter，所以走預設的 `openai_compatible`（用 `openai` SDK 打 Anthropic 的 OpenAI 相容端點），不是官方 `anthropic` SDK；requirements 裡也沒有 `anthropic` 套件。
  2. **Claude 訂閱（Claude Code CLI）**：[llm_provider.py#L589-L604](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/models/llm_provider.py#L589-L604)、實作 [llm.py#L562-L680](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L562-L680)。以 headless `claude -p` 呼叫、換掉系統提示為「簡潔文案寫手」、關閉所有工具與 CLAUDE.md/skills/MCP（`--safe-mode`），並清掉會干擾的 `ANTHROPIC_*` 環境變數，確保走訂閱登入。Docker 版用 [`Dockerfile.claude`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/Dockerfile.claude) 安裝 `@anthropic-ai/claude-code@2.1.260`，並以 `CLAUDE_CODE_OAUTH_TOKEN`（`claude setup-token` 產生）認證，見 [`docker-compose.claude.yml`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/docker-compose.claude.yml)。
  3. **透過聚合閘道**（OpenRouter、LiteLLM、OneAPI 等）也能選 Claude 模型。
- **Skill：** [`docs/skill/SKILL.md`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/docs/skill/SKILL.md)（name: `moneyprinterturbo-video`）＋ [`mpt_agent.py`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/docs/skill/mpt_agent.py)：讓 Claude Code 這類 Agent 自動下載專案、用 `uv` 裝依賴、產片並回傳 MP4 路徑。預設產中文 9:16、Pexels 素材、Edge 配音。⚠️ 這份 Skill 明文要求 Agent「安裝與生成前不要問使用者確認」，安裝時會下載並執行程式，裝之前請自己確認。
- **MCP：** 沒有找到 MCP 伺服器（`grep -i mcp` 只出現在 claude_code 關閉 MCP 的註解）。
- **其他 AI 用途的 prompt 位置：** 腳本 `llm.py` L56–71、關鍵字 L1040 起、社群文案 L1291 起、文生圖風格模板 `openai_image_prompt_template`（[material.py#L1479](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/material.py#L1479)）。

## 8. 擴充方式與 API

- **REST API**（`app/router.py` 掛載，前綴 `/api/v1`；啟動後 `/docs` 有 Swagger）：`POST /videos`（整支）、`POST /subtitle`、`POST /audio`、`GET /tasks`、`GET/DELETE /tasks/{id}`、`GET/POST /musics`、`GET/POST /video_materials`、`GET /stream/...`、`GET /download/...`；LLM 部分 `controllers/v1/llm.py` 有 `POST /scripts`（產腳本）、`POST /terms`（產關鍵字）、`POST /social-metadata`（產社群文案）。
- **驗證**：`config.toml` 的 `api_key` 設定後，所有請求需帶 `x-api-key` 標頭（[`asgi.py#L28-L40`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/asgi.py#L28-L40)）。
- **CLI**：`uv run python cli.py --video-subject "…"`；`--stop-at script|terms|audio|subtitle|materials|video`；`--batch-file tasks.jsonl`（[`cli.py#L253`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/cli.py#L253) 說明文字）。成功時 stdout 印一個 JSON，方便別的程式串接。
- **加新 LLM**：若是 OpenAI 相容，只要在註冊表加一個 `LLMProviderSpec`；非相容則在 `llm._generate_response()` 加 `adapter ==` 分支（目前有 azure、qwen、gemini、cloudflare_ai_gateway、litellm、openai_codex/chatgpt、claude_code、kimi_code、modelscope）。
- **加新素材來源**：加到 `task._SUPPORTED_VIDEO_SOURCES` 並在 `material.py` 實作 `_download_videos_xxx_on_demand`。
- **加字型**：丟進 `resource/fonts/`；WebUI 只掃 `.ttf`／`.ttc`（[`webui/Main.py#L1900-L1911`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/webui/Main.py#L1900-L1911)），`.otf` 不會出現。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護：** 非常活躍，最新 commit 就在掃描當天（2026-11-04）。版本 1.3.9。
- **測試：** `test/services/` 有 256 個 `test_*.py`；`grep -c "def test_"` 加總得 2,185 個測試函式。CI（`.github/workflows/ci.yml`）在 Python 3.11 與 3.13 跑測試並帶 Redis 服務；另有 `security.yml` 與 `docs/security/trivy-2026-10-29.md` 掃描報告。
- **資安：**
  - `config.example.toml` 預設 `listen_host = "0.0.0.0"`、`api_key = ""`——API 預設對整個區網開放且無驗證。個人電腦使用請改成 `127.0.0.1` 或設定 `api_key`。
  - 有不少防護：本地素材與字型限制在指定資料夾（防路徑穿越）、日誌會遮蔽 `api_key=` 等參數、claude_code 只記錄被移除的環境變數名稱不記值。
  - API Key 以明文存在 `config.toml`。
- **遙測：** Streamlit `gatherUsageStats = false`（`webui/.streamlit/config.toml`）。`version_checker.py` 會連 `api.github.com/repos/harry0703/MoneyPrinterTurbo/releases/latest` 檢查新版。腳本內容會送到你選的 LLM 供應商，素材關鍵字送到 Pexels/Pixabay。
- **已知的坑：**
  1. WebUI 介面語言只有簡體中文（`webui/i18n/zh.json`），沒有繁中介面。
  2. 腳本清理會刪掉 `()`、`[]` 內文字（llm.py `format_response`），商品型號寫在括號裡會消失。
  3. 線上素材是「英文關鍵字找圖庫」，畫面跟你的商品無關，電商用一定要用 local 素材或 AI 生成。
  4. `webui/Main.py` 9,506 行單檔，要改介面很吃力；拆零件比改 UI 划算。
  5. 付費 AI 影片來源為按秒計費，失敗重試已刻意避免重複扣款，但仍要自己盯帳單。
  6. 內附字型為商業字型（見第 2 節）。

## 10. 跟其他專案組合的建議

- **A（本專案）負責「旁白型短片產線」＋渲染層**：用 `video_project.py` 或 `video.generate_video()` 當最終合成器。
- **B：更強的腳本／分鏡專案**（例如同資料夾內的 `linyqh__NarratoAI`、`chatfire-AI__huobao-drama`、`zenstory-ai__drama-skills`）負責短劇劇本與分鏡，再把每場景的畫面＋旁白丟給 A 的 `episode.json` 渲染。
- **C：你的倉儲 Web App（Firebase）**：從商品資料（品名、賣點、價格、商品圖 URL）自動組成 JSONL，呼叫 A 的 `cli.py --batch-file` 或 `/api/v1/videos`，一鍵為新品產影片。
- **Claude 端**：腳本改由你自己的 Claude Code skill 產出繁中台灣口吻文案（直接塞 `video_script` 參數，跳過 A 的腳本階段），A 只負責配音、字幕、剪輯。
- **網頁版試算表（你最在意的主題）**：本專案與試算表無關；但「批量清單」可以用試算表維護（每列一個商品＝JSONL 一行），由試算表匯出後餵給 `--batch-file`。

## 11. 影片／腳本流程檢查表

| 步驟 | 狀態 | 位置 | 說明 |
|---|---|---|---|
| 輸入：主題 | 有 | [schema.py#L96-L170](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/models/schema.py#L96-L170) | `video_subject`，或直接給 `video_script` 跳過 LLM |
| 輸入：商品圖／自有素材 | 有 | [video.py#L2035](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L2035) | `video_source="local"`，圖片自動轉縮放動態片段；但不會「看圖寫腳本」（沒有視覺理解生成腳本） |
| 輸入：小說 | 沒有 | — | 沒有長文拆章節功能 |
| 腳本 | 有 | [llm.py#L875-L1007](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L875-L1007) | LLM 生成，1–10 段；可自訂 system prompt；另有 LoomLoom 多候選腳本後端 |
| 分鏡 | 部分 | [llm.py#L1040](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L1040)、[video_project.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video_project.py) | 只有「依旁白順序的關鍵字」與手寫 `episode.json` 場景，沒有 AI 分鏡表 |
| 畫面：素材庫 | 有 | [material.py#L404-L787](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/material.py#L404-L787) | Pexels、Pixabay（免費 Key）、Coverr |
| 畫面：AI 生圖 | 有 | [material.py#L1801](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/material.py#L1801) | OpenAI 相容圖片 API、Codex 圖片（ChatGPT 訂閱）；按張計費 |
| 畫面：AI 生影片 | 有 | [task.py#L102-L106](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/task.py#L102-L106) | Seedance、秘塔 MiniMax、WaveSpeed、OFox、MuAPI、Infistar、Jalapeno、LoomLoom；按秒付費 |
| 畫面：程式繪製 | 沒有 | — | 沒有 HTML/Canvas/Remotion 類程式動畫 |
| 配音 TTS | 有 | [voice.py#L1159](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/voice.py#L1159) | 12 種判斷函式；Edge 免費；Kokoro/Chatterbox 可自架本機 |
| 聲音複製 | 有（雲端） | [voice.py#L3259](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/voice.py#L3259) | VoxCPM 參考音檔；Fish Audio／ElevenLabs 用平台聲音 ID |
| 字幕 | 有 | [voice.py#L3768](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/voice.py#L3768) | Edge 時間戳或 Whisper；可調字型、顏色、描邊、底色、動畫 |
| 配樂 | 有 | [bgm.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/bgm.py) | 隨機內建（`resource/songs/` 內 29 個檔案）／上傳／AI 配樂（ElevenLabs Music、Sonilo，付費） |
| 合成 | 有 | [video.py#L1605](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L1605) | MoviePy＋FFmpeg，libx264 為主，失敗自動換編碼器 |
| 輸出 | 有 | [upload_post.py](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/upload_post.py) | MP4 存 `storage/tasks/<id>/final-N.mp4`；可自動發 TikTok/IG/YT Shorts |

- **每步成本（最省組合）：** 腳本＝Claude 訂閱（0 額外）或 API 按 token；素材＝Pexels 免費；配音＝Edge 免費；字幕＝免費；配樂＝內建免費；合成＝本機 CPU。整支片幾乎 0 元。升級到 AI 生影片時成本主要在「每秒影片費用」（各家不同，未確認實價）。
- **繁中／台灣口音：** 有。Edge 聲音清單 [`app/services/data/azure_voices.json`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/data/azure_voices.json) 含 `zh-TW-HsiaoChenNeural`（女）、`zh-TW-HsiaoYuNeural`（女）、`zh-TW-YunJheNeural`（男）；影片語言清單 [`webui/Main.py#L1876-L1890`](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/webui/Main.py#L1876) 含 `zh-TW`。腳本 prompt 規定「用主題的語言回答」，主題用繁中寫即可得繁中腳本；字幕直接用腳本文字。內附字型對所有繁中字元的覆蓋度未確認（程式有 `subtitle_font_supports_text` 會檢查），建議自行放入繁中 .ttf 字型。
- **Claude 怎麼用：** Anthropic API（經 OpenAI 相容端點）＋ Claude 訂閱（`claude` CLI headless）＋ 一份 Agent Skill（`docs/skill/SKILL.md`）。不是只能接 OpenAI。
- **個人電腦能不能跑：** 可以。只呼叫雲端 LLM/TTS 時 4 核 4 GB RAM、無 GPU 就能跑；Whisper large-v3 或大量批次才需要較好的 CPU/GPU。AI 生影片全是雲端 API，不在本機跑模型。
- **最適合：** ① 解說／知識型影片 ② 電商商品影片（搭配自有素材）③ 廣告素材多版本 A/B。**短劇不適合**（沒有角色、對白、多人配音、鏡頭一致性）。
- **法律風險：** 字型授權（微軟雅黑／華文黑體為商業字型）、Pexels/Pixabay 素材雖可商用但不可暗示人物代言你的商品（肖像權）、Edge TTS 商用合規性未確認、AI 生成影片的版權依供應商條款、自動發佈到平台需遵守 TikTok/Meta/YouTube 的 AI 內容標示規定；廣告投放時，圖庫中出現的人物、商標要自行檢查。

## 關鍵字
MoneyPrinterTurbo、短影片自動生成、AI 短影音、文字轉影片、text-to-video、腳本生成、script generation、Edge TTS、配音、字幕、SRT、faster-whisper、MoviePy、FFmpeg、Pexels、Pixabay、商品影片、電商影片、廣告素材、批量生成、batch video、Claude Code、Anthropic、claude -p、Streamlit、FastAPI、Upload-Post、TikTok、YouTube Shorts、Seedance、AI 配樂、聲音複製、voice cloning、zh-TW、台灣配音、MIT
