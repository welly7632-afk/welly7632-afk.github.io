# debpalash/VoiceStudio — 本機跑的 ElevenLabs 替代品：聲音複製、聲音設計、影片翻譯配音、逐字稿、有聲書一站完成
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：7a896ed
> GitHub：https://github.com/debpalash/VoiceStudio｜⭐ 100711｜授權：AGPL-3.0-only（程式）＋各模型權重另有授權（預設模型權重為 CC-BY-NC 非商用）｜主要語言：Python｜最近更新：2026-11-04

（本文所有 permalink 以 `P/` 代表 `https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/`，下方實際連結都已展開。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：一個裝在自己電腦（Windows／Mac／Linux／Docker，甚至手機）上的「AI 配音工作室」，把文字變語音、用一小段錄音複製聲音、用文字描述「設計」一個新聲音，還能把整支影片聽寫→翻譯→重新配音→燒字幕輸出。

**它不是**：不會幫你寫腳本、不會產生畫面、不會剪輯成商品影片。它是整條影片流程裡「配音＋字幕」那一段，而且做得非常深。

對這位使用者（台灣電商＋廣告＋想做短劇）實際可以拿來：
1. **商品影片／廣告旁白**：在其他工具（Claude 寫腳本、MoneyPrinterTurbo 之類組畫面）產出腳本後，丟進 VoiceStudio 的本機 API（相容 OpenAI `POST /v1/audio/speech`）生成配音，不用付 ElevenLabs 月費。
2. **用自己（或已授權員工）的聲音做固定品牌旁白**：錄 10–20 秒乾淨音檔建立 voice profile，之後每支廣告都用同一個聲音。
3. **把外國商品影片翻成中文配音**：Dub 功能可從檔案或網址（內建 yt-dlp 下載）→ Whisper 聽寫 → 翻譯（可接 Claude）→ 依原時間軸配音 → 匯出 MP4（可燒入字幕、卡拉 OK 逐字亮字幕）／SRT／VTT／ASS。
4. **短劇多角色配音**：長文標記語法 `[voice:角色名]`、`[pause]`、`# 章節`，可一次把多角色台詞依角色換聲音輸出；也能從影片中自動分出說話者並各自複製聲音。
5. **讓 Claude Code 直接呼叫配音**：內建 MCP 伺服器（`/mcp`），Claude Code 可以 `generate_speech`、`clone_voice`、`transcribe`，適合以後做「Claude 寫腳本→自動配音」的自動化。
6. **口述記帳／倉庫備忘**：附浮動聽寫小工具（dictation），可以講話直接轉文字貼到你的倉儲網頁 App。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

這個專案有**三層授權**，要分開看：

| 層級 | 授權 | 白話 |
|---|---|---|
| App 本體（`electron/`、`backend/`、`native/`、`scripts/`） | **AGPL-3.0-only** | 自己用、公司內部用、商用都可以免費；但如果你**修改後讓別人透過網路使用**（例如做成網站給客戶用），就必須把你修改後的完整原始碼也用 AGPL 公開。 |
| 內附 `omnivoice/` Python 套件（模型程式碼） | Apache-2.0 | 寬鬆，可閉源商用。 |
| **模型權重**（真正會發聲的檔案，執行時從 Hugging Face 下載） | 每個模型不同 | 預設模型 `k2-fsa/OmniVoice` 的權重是 **CC-BY-NC（非商用）**，其 audio tokenizer 還另有 Boson Higgs Audio 2 與 Meta Llama 3 社群授權條款。 |

依據：[LICENSE-NOTICE.md](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/LICENSE-NOTICE.md)、[backend/config/model_licenses.json](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/config/model_licenses.json#L7-L19)。

我用 Python 讀 `model_licenses.json` 計數：共 **70 筆**模型授權紀錄，**0 筆**被標為 `commercial_use: true`；5 筆確認為非商用（noncommercial），其餘 65 筆是「尚未審查（unreviewed）」。專案自己也寫明「未審查不代表可商用」。

- **個人使用**：沒問題，App 免費，模型權重個人非商業用途也 OK。
- **公司商用（拿去做電商廣告、賣的商品影片）要注意**：
  1. App 本身 AGPL 允許商用，但**預設模型 OmniVoice 權重是非商用授權**——用它產出的廣告配音若拿去商業投放，授權上站不住。台灣常被提到的 Breeze-TTS-2（audio.cpp 套件）也被標為研究／非商用訊號。
  2. 若要商用，要自己去 Model Manager 挑權重授權是 Apache-2.0 的引擎（例如模型目錄中 audio.cpp 的 dots.tts 註記為「Apache-2.0 weights」，見 [models.yaml#L71-L80](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/config/models.yaml#L71-L80)），並自己到 Hugging Face 核對最新條款——**未確認**哪一個中文效果好又可商用。
  3. 聲音複製一定要有聲音本人同意（README「Clone a voice only with its owner's permission」）。
- **付費版／閉源功能**：LICENSE-NOTICE 提到 **VoiceStudio Pro**（付費，含「Pro features」）與**商業授權**（想閉源嵌入自家產品時買）；README 也連到 VoiceStudio Cloud（app.voicestudio.sh）。程式碼裡有 `cloud_account.py`、`cloud_sync/`、Electron `account/` 等帳號／雲端同步模組。Pro 具體包含哪些功能在原始碼中**未確認**（只看到 `model_licenses.py`、`sonitranslate.py` 等檔案出現相關字眼，未逐一追）。
- 貢獻者需簽 CLA，把貢獻授權給維護公司 Yupcha Softwares Private Limited（這代表公司保有改授權的彈性）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

- **後端**：Python ≥3.11、FastAPI（[backend/main.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/main.py)），PyTorch ≥2.4、transformers ≥5.10、WhisperX／faster-whisper（聽寫）、pyannote（分說話者）、pedalboard（音效）、ffmpeg（imageio-ffmpeg），見 [pyproject.toml](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/pyproject.toml#L35-L80)。預設埠 3900。
- **資料庫**：SQLite＋Alembic migration（`alembic.ini`、`backend/migrations/versions/` 共 18 個檔案，依檔案清單計數）。
- **前端**：Electron 桌面 App（也能當網頁版），React＋Vite＋Tailwind＋TanStack（router/query/table）＋zustand＋wavesurfer.js＋@xyflow/react（工作流程畫布），見 [electron/package.json](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/electron/package.json)。UI 有 22 種語系檔，包含 `zh-TW.json`（繁中介面）。
- **行動版**：`mobile/android`（Kotlin/Gradle）、`mobile/ios`，標為 Preview、裝置上離線跑。
- **部署**：安裝檔（DMG／EXE／DEB／AppImage／Snap／AUR／Homebrew）、Docker（GHCR，CPU／CUDA／ROCm）、Nix。
- **硬體**：
  - 預設引擎 OmniVoice 宣告最低 **6 GB VRAM**（[tts_backend.py#L1794](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/tts_backend.py#L1786-L1794)，註解寫 4 GB 卡會慢到以分鐘計）；也能純 CPU 跑，只是慢（CPU 預設逾時 600 秒）。
  - 支援 NVIDIA CUDA、AMD ROCm、Apple Silicon（MPS/MLX）、Vulkan（GGUF 引擎）。
  - GPU 併發數：每 5 GB 空閒 VRAM 一個 worker、最多 4（[docs/performance.md#L98](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/docs/performance.md#L98)）。
  - 模型下載量：OmniVoice 2.4 GB（必要）、Whisper large-v3 約 2.9 GB、NLLB 翻譯 2.4 GB、CosyVoice3 9.8 GB 等（[models.yaml](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/config/models.yaml#L46-L60)）。建議 16 GB RAM 以上；官方 [benchmarks.md](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/docs/benchmarks.md) 目前「沒有任何實測數據列」。
- **API Key**：配音本身**不需要任何 API Key、零費用**。只有「翻譯／改寫／對時長」這些 LLM 功能可選擇性接雲端：OpenAI、Anthropic、Gemini、DeepSeek、Groq…或本機 Ollama／LM Studio（免費）。翻譯也可用 DeepL／Google／Microsoft／Amazon（各需金鑰）或本機 Argos／NLLB（免費）。pyannote 分說話者需要 Hugging Face token（免費，但要同意 repo 條款）。費用：本機全免費；接 Claude 翻譯一支 3 分鐘影片大約數十段 × 2 次呼叫（reflect＋adapt），用 Sonnet 等級估計台幣個位數到數十元（**估算，未實測**）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

檔案數以 `git ls-tree -r --name-only HEAD | wc -l` 計：**4,877 個檔案**；`backend/` 下 `.py` 共 417 個（`find backend -name '*.py'`），排除 tests 後約 13 萬行（`cat | wc -l`）。

```
VoiceStudio/
├── backend/                     FastAPI 後端（AGPL）
│   ├── main.py                  啟動、掛載所有 router、/mcp
│   ├── mcp_server.py            MCP 伺服器（給 Claude Code / Claude Desktop）
│   ├── mcp_shim/                stdio ↔ HTTP 的 MCP 轉接
│   ├── api/routers/             44 個 router 檔：generation（/generate）、openai_compat（/v1/audio/*）、
│   │                            dub_core / dub_translate / dub_generate / dub_export（影片配音四段）、
│   │                            audiobook、stories、tts_stream（WebSocket）、personas、profiles…
│   ├── services/                商業邏輯：tts_backend（引擎抽象＋註冊表，4,978 行）、dub_pipeline、
│   │                            translator（電影級翻譯）、speech_rate（對時長）、llm_providers / llm_transport /
│   │                            llm_skills（LLM 接入）、karaoke_ass、video_retime、audiobook、watermark…
│   ├── engines/                 18 個子目錄：各 TTS 引擎的 sidecar（indextts、cosyvoice_gguf、audiocpp、
│   │                            supertonic3、whisper_cpp…），多半在獨立 venv / 子行程跑
│   ├── core/                    設定、驗證、遙測（analytics.py）、GPU 偵測、工作佇列
│   ├── config/models.yaml       模型目錄（452 行）＋ model_licenses.json（70 筆授權紀錄）
│   └── migrations/              Alembic（SQLite）
├── omnivoice/                   預設 TTS 模型原始碼（Apache-2.0，小米 Han Zhu）：models/、training/、eval/、utils/
├── electron/                    桌面／網頁前端（React）：src/main（Electron 主行程）、src/shared/pages（18 個頁面 JSX）、
│                                src/shared/i18n/locales（22 語系）
├── mobile/                      Android / iOS 版
├── native/desktop-bridge/       Rust：全域快捷鍵、聽寫輸出、資料夾監控
├── skills/voicestudio/          給 AI 代理用的 SKILL.md（Claude Code 等可安裝）
├── docs/                        249 個文件（安裝、引擎、MCP、API 驗證、工作流程）
├── tests/                       Python 測試（約 806 個 test_*.py）
└── deploy/                      Dockerfile、docker-compose
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 TTS 引擎抽象層**
→ [backend/services/tts_backend.py#L230-L300](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/tts_backend.py#L230-L300)、註冊表 [#L3785-L3903](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/tts_backend.py#L3785-L3903)
- `TTSBackend(ABC)`：每個引擎實作 `sample_rate`、`supported_languages`、`is_available()`、`generate()`，並宣告能力旗標（`supports_voice_design`、`supports_emotion`、`inline_tags` 如 `[laughter]`）。
- 我用 regex 解析兩個註冊表字典：直接註冊 **8 個**（omnivoice、cosyvoice、kittentts、mlx-audio、voxcpm2、moss-tts-nano、gpt-sovits、sherpa-onnx）＋延遲載入 **11 個**（indextts2、omnivoice-gguf、supertonic3、moss-tts-v15、dots-tts、omnivoice-subprocess、pockettts、confucius4-tts、audiocpp、audiocpp-dots、cosyvoice-gguf），合計 **19 個 TTS 引擎 id**。
- 依賴衝突的引擎（各自 pin 不同 transformers 版本）放進獨立 venv 子行程，避免互相打架——這是很值得學的設計。

**5.2 預設模型 OmniVoice（聲音複製＋聲音設計）**
→ [backend/services/tts_backend.py#L1772-L1797](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/tts_backend.py#L1772-L1797)、模型本體 [omnivoice/models/omnivoice.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/omnivoice/models/omnivoice.py)（2,113 行，`generate()` 在 L844、`create_voice_clone_prompt()` 在 L971）
- 參考音檔最長 20 秒，會自動挑「語音最多的 15 秒」視窗；沒附逐字稿時用 ASR 自動補。
- 聲音設計用標籤詞彙：性別、年齡、音高、耳語、英語口音、**中文方言**（河南話、四川話、東北話等 12 種，**沒有台灣腔／台語**），見 [omnivoice/utils/voice_design.py#L31-L45](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/omnivoice/utils/voice_design.py#L31-L45)。

**5.3 646 種語言**
→ [omnivoice/utils/lang_map.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/omnivoice/utils/lang_map.py#L417)
- 我用 regex 數 `LANG_NAME_TO_ID` 的條目：**646 筆**，與宣稱一致。包含 `"chinese": "zh"`、`"cantonese": "yue"`、`"min nan chinese": "nan"`（閩南語）。是否真能講出可用的台語，**未確認**（僅有代碼對應）。

**5.4 影片翻譯配音（Dub）四段式**
- 匯入：[dub_core.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/dub_core.py#L816)（`/dub/upload`、`/dub/ingest-url`、`/dub/import-srt`）；下載用 yt-dlp：[dub_pipeline.py#L1145](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/dub_pipeline.py#L1145)；SSE 進度的 `ingest_pipeline` 在 [#L1457](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/dub_pipeline.py#L1457-L1470)，含 Demucs 人聲／背景分離。
- 翻譯：[dub_translate.py#L458](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/dub_translate.py#L458)；NLLB 對照表有 `zh-TW → zho_Hant`（[#L54-L55](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/dub_translate.py#L54-L55)）；雲端翻譯 [translation_apis.py#L40-L97](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/translation_apis.py#L40-L97) 對 DeepL 用 `ZH-HANT`、微軟用 `zh-Hant`。
- 「電影級翻譯」：直譯 → LLM 批評（REFLECT）→ LLM 改寫（ADAPT），prompt 在 [translator.py#L47-L67](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/translator.py#L47-L67)。
- 對時長：[speech_rate.py#L45](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/speech_rate.py#L45-L60) 用每秒字數估時（中文 6 字／秒），太長就叫 LLM 縮句，最多 3 次。
- 生成：[dub_generate.py#L484](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/dub_generate.py#L484)。
- 輸出：[dub_export.py#L693-L705](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/dub_export.py#L693-L705) 的 `burn_subs`、`dual`（雙語字幕）、`karaoke` 參數；SRT／VTT／ASS 下載在 [#L1999-L2150](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/dub_export.py#L1999-L2150)；還能匯出分軌 stems、MP3。
- 畫面配合配音變速：[video_retime.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/video_retime.py#L1-L25)（ffmpeg `setpts` 分段變速，太多段就分批再 concat）。

**5.5 有聲書／長文多角色**
→ [backend/services/audiobook.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/audiobook.py#L1-L20)、[longform_parser.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/longform_parser.py#L1-L16)
- 語法：`# 章節`、`[voice:名字]`、`[pause …]`、`[slow]/[fast]/[emphasis]/[spell]`；輸出含章節的 m4b。Python 與 JS 各有一份 parser，用同一份測試語料保證一致。

**5.6 從影片自動複製每個說話者的聲音**
→ [speaker_clone.py#L68](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/speaker_clone.py#L68)（`extract_speaker_clones`）。

**5.7 浮水印**
→ [watermark.py#L1-L19](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/watermark.py#L1-L19)：Meta AudioSeal 隱形浮水印＋可選的可聽提示音、影片 logo。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| OpenAI 相容 TTS API（整個 App 當服務用） | [openai_compat.py#L649](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/openai_compat.py#L649-L700) | 跑起整個後端 | 低（不拆，直接呼叫） | 任何支援「OpenAI TTS」的影片工具（MoneyPrinterTurbo 類）把 base_url 指到 `http://localhost:3900/v1` 即可 |
| MCP 配音工具 | [mcp_server.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/mcp_server.py#L1-L32) | mcp SDK、後端 | 低 | Claude Code `.mcp.json` 填 `http://localhost:3900/mcp/` |
| LLM 供應商註冊表（30+ 家，含 Anthropic 與 Claude Code CLI） | [llm_providers.py#L186-L226](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/llm_providers.py#L186-L226)、[llm_transport.py#L78-L121](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/llm_transport.py#L78-L121) | openai、litellm | 中 | 抽成你自己工具的「切換 AI 供應商」模組；env → 設定 → 預設的三層解析很實用 |
| 電影級翻譯 3 步 prompt | [translator.py#L47-L67](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/translator.py#L47-L67) | 任一 LLM | 低 | 直接複製兩段 prompt，用 Claude 把外文商品文案翻成台灣口吻 |
| 依時長縮句 | [speech_rate.py#L45-L60](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/speech_rate.py#L45-L60) | LLM | 低 | 廣告 15 秒／30 秒限制時，先估時再請 Claude 縮稿 |
| 卡拉 OK 逐字字幕 ASS 產生器 | [karaoke_ass.py#L199](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/karaoke_ass.py#L199) | 純 Python、無外部依賴 | 低 | 搭 ffmpeg `ass=` 燒字幕；**注意中文需自行改切字**（見 §9） |
| 長文切塊＋交叉淡化 | [chunked_tts.py#L138](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/chunked_tts.py#L138) | numpy | 低 | 任何 TTS 都會遇到長文斷句問題，可直接借用 |
| 長文多角色標記語法 | [longform_parser.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/longform_parser.py#L1-L16) | 純 Python（另有 JS 版） | 低 | 短劇腳本格式：Claude 輸出 `[voice:女主]…`，直接送進來 |
| 影片依配音變速 | [video_retime.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/video_retime.py#L1-L25) | ffmpeg | 中 | 配音比原片長時讓畫面慢放對齊 |
| SRT 寬鬆解析器 | [srt_parser.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/srt_parser.py) | 純 Python | 低 | 匯入各種不標準 SRT |
| TTS 引擎抽象＋子行程隔離 | [tts_backend.py#L230-L300](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/tts_backend.py#L230-L300) | torch 等 | 高 | 學架構即可，整包拆太重 |

（拆出程式碼若要放進給別人用的網站，記得 AGPL 義務；`omnivoice/` 是 Apache-2.0 比較自由。）

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **語音模型**：預設 k2-fsa/OmniVoice；可選 VoxCPM2、CosyVoice 3、IndexTTS 2.5、GPT-SoVITS、Kokoro、Dia、Qwen3-TTS（Mac）、Breeze-TTS-2（audio.cpp）、dots.tts 等（見 §5.1 的 19 個 id）。聽寫用 Whisper large-v3／Turbo、Parakeet、sherpa-onnx 中英雙語串流模型。翻譯可本機 NLLB-200／Argos。
- **Claude 支援：原生**。
  - Anthropic API：供應商 `anthropic`，預設模型 `claude-sonnet-4-6`，讀 `ANTHROPIC_API_KEY`，透過 LiteLLM 呼叫（[llm_providers.py#L186-L188](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/llm_providers.py#L186-L188)、[llm_transport.py#L95-L121](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/llm_transport.py#L95-L121)）。
  - **Claude Code CLI 當 LLM**：供應商 `claude-code`（[#L225-L226](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/llm_providers.py#L225-L226)），後端經 Electron 本機橋接（[llm_cli.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/llm_cli.py#L19-L42)）呼叫 `claude -p --output-format stream-json …`（[electron/src/main/repair-agents.ts#L270-L299](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/electron/src/main/repair-agents.ts#L270-L299)）。也就是說**用你的 Claude 訂閱就能跑翻譯，不一定要 API Key**（需桌面版 Electron 在跑）。
  - 哪些功能會用 LLM：6 個「LLM Skills」可個別開關、各自指定供應商：`dub_translation`、`cinematic_translation`、`slot_fitting`、`glossary_extract`、`direction_parse`、`dictation_refinement`（[llm_skills.py#L1-L37](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/llm_skills.py#L1-L37)）。
- **Prompt 位置**：翻譯 [translator.py#L47-L67](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/translator.py#L47-L67)；導演指令解析（「讓第 14 段更急促驚訝」→ 標籤）[director.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/director.py#L1-L15)；縮句在 `speech_rate.py`。
- **MCP**：9 個工具 — `generate_speech`、`list_voices`、`list_personalities`、`list_languages`、`transcribe`、`check_health`、`clone_voice`、`describe_voice`、`design_voice`（我數 `mcp_server.py` 中 `@mcp.tool()` 共 9 處）；另有資源 `voice://{id}`、`history://recent`。掛在後端 `/mcp`（Streamable HTTP），stdio 用 `python -m backend.mcp_shim`（範本 [docs/mcp.json](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/docs/mcp.json)）。可設 `OMNIVOICE_MCP_OUTPUT_MODE=files` 讓音檔不塞進 Claude 上下文。
- **Skills**：[skills/voicestudio/SKILL.md](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/skills/voicestudio/SKILL.md)（87 行），可 `npx skills add debpalash/VoiceStudio --skill voicestudio` 裝到 Claude Code。

## 8. 擴充方式與 API

- **REST**：`POST /generate`（表單：text、language、ref_audio、instruct、speed、seed…，[generation.py#L1825-L1840](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/generation.py#L1825-L1840)）；`/history`；`/audiobook`、`/longform/render`；`/dub/*` 一整套。完整規格看執行中的 `/openapi.json`。
- **OpenAI 相容**（prefix `/v1`，[openai_compat.py#L150](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/openai_compat.py#L150)）：`/v1/audio/speech`、`/v1/audio/transcriptions`、`/v1/audio/translations`、`/v1/models`、`/v1/audio/voices`。OpenAI 的 `instructions` 會轉成 `instruct`。
- **串流**：WebSocket `/ws/tts`（[tts_stream.py#L307](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/tts_stream.py#L307)）。
- **工作流程畫布**：Electron 內 `#/workflows`，步驟有 Start／Audio、Speak、Convert、Transcribe、Translate、Normalize、Condition、End，每次最多 50 筆、每段腳本 2 萬字（[docs/electron-workflows.md](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/docs/electron-workflows.md)）。適合「一次把 50 支商品旁白丟進去」。
- **新增引擎**：繼承 `TTSBackend`、在 `_REGISTRY`／`_LAZY_REGISTRY` 註冊、`models.yaml` 加模型，且 CI 要求同步加 `model_licenses.json` 紀錄。
- **驗證**：預設**只聽 localhost、不驗證**；對外開放要設 `OMNIVOICE_API_KEY` 或分享 PIN（[docs/api-auth.md](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/docs/api-auth.md)）。
- 其他：watch folder（Rust native bridge）、Twilio 電話（`telephony_twilio.py`）、Pipecat 範例（`examples/agentic/pipecat_minimal.py`）。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：非常活躍（最後 commit 2026-11-04，版本 0.5.7），CI 工作流 29 個（數 `.github/workflows/` 檔案）、`changelog.d/` 223 個片段。註解大量引用 issue 編號（#1226、#3422…），看得出持續修 bug。
- **測試**：依檔案清單計數，`tests/` 下約 806 個 `test_*.py`、`backend/tests/` 54 個、前端 `.test.ts/tsx/mjs` 470 個。我**沒有執行**任何測試。
- **遙測**：PostHog，**預設關閉、需使用者明確同意**，屬性白名單、不送例外堆疊（[analytics.py#L1-L58](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/core/analytics.py#L1-L58)）；`OMNIVOICE_ANALYTICS_DISABLED=1` 強制關閉。前端也有 `posthog-js` 依賴。
- **資安**：本機不驗證是設計使然；若用 Docker 或分享到區網一定要設 API key。管理路由（`/system/*`、`/api/settings/*`）只允許 loopback 或 API key。LLM SDK 請求強制 HTTPS、禁止 redirect。
- **已知的坑（我讀程式碼看到的）**：
  1. **繁中／台灣腔沒有特別處理**：語言變體表只有葡萄牙文分巴西／葡萄牙（[language_variants.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/core/language_variants.py#L22-L31)）；後端 Python 沒有用 OpenCC 做簡繁轉換；聲音設計的方言標籤全是中國大陸方言。台灣腔只能靠「用台灣人錄音來複製聲音」達成。
  2. **卡拉 OK 字幕對中文會失效**：翻譯後的字幕用「空白切詞」平均分配時間（[karaoke_ass.py#L85-L99](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/karaoke_ass.py#L85-L99)），中文沒有空白 → 整句一次亮。
  3. 中文語速估計固定 6 字／秒，台灣廣告常用的快節奏旁白可能被誤判要縮句。
  4. 「VoiceStudio is free and has no paid cloud behind it」（README 贊助段）與 README 頂端連到 VoiceStudio Cloud／Pro 並存，商業化方向在變動。
  5. 依賴非常重（torch、transformers ≥5.10、pyannote <4、setuptools <80 等釘版本），自己從原始碼裝容易踩坑；建議用官方安裝檔。
  6. 預設模型權重非商用（§2）。
  7. 影片場景分析 [video_context.py#L95-L110](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/video_context.py#L95-L110) 只是用亮度／色彩統計猜情緒，不是 AI 視覺。

## 10. 跟其他專案組合的建議

- **最佳定位：當「配音引擎服務」**，不要當影片產生器。組法：
  - **A（腳本）**：Claude Code／Anthropic API 寫商品腳本或短劇台詞，輸出 `[voice:角色]` 標記格式。
  - **B（畫面＋合成）**：MoneyPrinterTurbo、OpenMontage、hyperframes 這類負責素材、剪輯、合成。只要它們支援 OpenAI TTS，就把 TTS base_url 換成 `http://localhost:3900/v1`、model 填 VoiceStudio 的引擎、voice 填 profile id。
  - **C（本專案）**：配音、聲音複製、字幕檔（SRT/ASS），以及外國影片在地化。
- 給 Claude Code 的整合：裝 MCP（`/mcp/`）＋ `voicestudio` skill，讓 Claude 寫完腳本直接呼叫 `generate_speech`，產出音檔再丟 ffmpeg。
- 你的倉儲 App（Firebase、純 JS）：可用聽寫功能口述盤點；或在 App 加一個按鈕呼叫本機 `/v1/audio/speech` 唸出揀貨單（僅限同一台電腦／區網，且要設 API key）。
- 商用影片：組合時把 TTS 換成權重可商用的引擎，或改用付費雲端 TTS；VoiceStudio 留做內部試聽、腳本對稿用。
- 可直接搬走的小零件：`translator.py` 兩段 prompt、`speech_rate.py` 估時縮句、`longform_parser.py` 標記語法、`chunked_tts.py` 斷句、`karaoke_ass.py`（中文需改用逐字切）。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有／未確認 | 程式碼位置與說明 |
|---|---|---|
| 輸入（主題／商品圖／小說／素材） | **部分有** | 輸入是「文字／長文／EPUB」或「影片／音檔／網址」：[longform_parser.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/longform_parser.py#L1-L16)、[dub_core.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/dub_core.py#L816)。不吃商品圖或主題。 |
| 腳本 | **沒有**（只有翻譯改寫） | 不會從主題寫腳本；只有翻譯的 REFLECT/ADAPT 改寫與縮句：[translator.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/translator.py#L47-L67)。 |
| 分鏡 | **沒有** | 無分鏡模組。 |
| 畫面（素材庫／AI 生圖／AI 生影片／程式繪製） | **沒有** | 只沿用原影片畫面並可依配音變速：[video_retime.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/video_retime.py#L1-L25)。 |
| 配音（TTS／聲音複製） | **有（核心強項）** | 19 個引擎、聲音複製＋設計：[tts_backend.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/tts_backend.py#L3785-L3903)。本機免費。 |
| 字幕 | **有** | SRT／VTT／ASS 匯出、燒入、雙語、卡拉 OK：[dub_export.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/dub_export.py#L693-L705)。 |
| 配樂 | **沒有**（只保留原片背景） | 用 Demucs 分離原片背景音再混回：[dub_background.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/dub_background.py)；不會加新配樂。 |
| 合成 | **有（限配音版影片）** | ffmpeg 混音＋mux 成 MP4：`dub_export.py`、[dub_mix.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/dub_mix.py)。 |
| 輸出 | **有** | MP4、WAV、MP3、Ogg/Opus、m4b 有聲書（[stories.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/stories.py#L1-L30)）、分軌 stems。 |
| 每步模型／費用 | 有 | TTS：OmniVoice 等本機（免費、需 6 GB VRAM 較順）；ASR：Whisper 本機（免費）；翻譯：NLLB／Argos 本機免費，或 DeepL／Google／LLM（付費依用量）；LLM 改寫：Claude Sonnet／Ollama 等。 |
| 中文（繁中、台灣口音）配音與字幕 | **部分** | 普通話配音可；繁中字幕靠翻譯目標設 `zh-TW`（[translation_apis.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/translation_apis.py#L40-L97)、[dub_translate.py#L54](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/dub_translate.py#L54-L55)）；**台灣腔無內建選項**，需用台灣人錄音複製；台語（nan）只有語言代碼，效果未確認；繁中 UI 有。 |
| Claude 怎麼用 | **有（原生）** | Anthropic API（LiteLLM）、Claude Code CLI 當翻譯引擎、MCP 伺服器、SKILL.md：[llm_providers.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/llm_providers.py#L186-L226)、[mcp_server.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/mcp_server.py#L1-L32)。 |
| 能不能在個人電腦跑 | **可以** | 全本機；6 GB+ VRAM 的 NVIDIA 或 Apple Silicon 最順，純 CPU 可用但慢；Mac 需 13.3+ Apple Silicon（Intel Mac 只能當遙控 UI）。 |
| 最適合做 | — | **解說影片／外語影片在地化配音**＞短劇多角色配音＞電商商品影片旁白＞廣告素材（受模型非商用授權限制）。 |
| 法律風險 | — | ①預設模型權重 CC-BY-NC 非商用；②複製他人聲音需本人同意（台灣個資法、肖像／聲音人格權）；③用 yt-dlp 下載他人影片再配音有著作權問題、也可能違反 YouTube 條款；④各平台（Meta、TikTok、YouTube）對 AI 合成聲音有揭露要求；AudioSeal 浮水印可協助標示。 |

## 關鍵字
VoiceStudio、OmniVoice、ElevenLabs 替代、本機 TTS、文字轉語音、聲音複製、voice cloning、聲音設計、voice design、影片翻譯配音、video dubbing、AI 配音、字幕、SRT、ASS、卡拉 OK 字幕、燒字幕、Whisper、WhisperX、聽寫、dictation、逐字稿、transcription、有聲書、audiobook、多角色配音、短劇配音、MCP、Claude Code、Anthropic、OpenAI 相容 API、/v1/audio/speech、FastAPI、Electron、React、CosyVoice、IndexTTS、VoxCPM2、GPT-SoVITS、Breeze-TTS、NLLB、Demucs、AGPL-3.0、CC-BY-NC、非商用模型、GPU、CUDA、Apple Silicon、繁體中文、台灣口音
