# HKUDS/ViMax — 一句話點子 → 故事 → 分鏡 → 關鍵影格 → AI 影片的多代理「導演／編劇／製片」框架
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：fd4b72e
> GitHub：https://github.com/HKUDS/ViMax｜⭐ 12853｜授權：MIT｜主要語言：Python｜最近更新：2026-09-30

（以下 `P/` 代表 permalink 前綴 `https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/`，表格與內文的連結都是完整網址。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：香港大學 HKUDS 實驗室的研究型專案，用一串 LLM「代理」（編劇、分鏡師、攝影機規劃、參考圖挑選、畫面評審）把一句點子／一段劇本／一部小說，拆成多場景、多鏡頭，先用 AI 生圖做每一鏡的「首影格／尾影格」，再呼叫 Google Veo／Seedance 等影片模型逐鏡生成，最後用 moviepy 串成一支影片。

**對你（台灣電商＋投廣告＋想做短劇）實際能用在哪：**
- **短劇／故事型廣告的「前期企劃」**：最有價值的是它的「點子 → 故事 → 分場劇本 → 分鏡 → 每鏡畫面描述（含首尾影格、運鏡、對白／音效）」這一整串 prompt 與資料結構。你可以只跑文字規劃部分（不花影片錢），拿到一份結構化的短劇分鏡 JSON，再自己拿去任何影片工具生成。
- **角色一致性的作法可以照抄**：它先為每個角色生「正面／側面／背面」三視圖，之後每一鏡都把相關角色圖當參考圖餵給生圖模型，再讓視覺 LLM 從 2 張候選圖挑最像的一張。這套思路換成「商品三視圖」就能用在電商商品影片（**推論、未實測**）。
- **不適合直接拿來做的**：直式 9:16 短影音（程式強制橫式，見第 9 節）、需要中文配音／字幕／配樂的成品（完全沒有 TTS、字幕、BGM 模組）、直接上傳商品圖就出廣告（沒有這個流程）。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**（[LICENSE](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/LICENSE)，著作權行只寫 `Copyright (c) 2025`，沒有寫權利人名稱）。
- **個人使用**：完全可以，自由修改。
- **公司商用**：可以商用、可以改了不開源，唯一義務是在你的程式碼或發行物中保留原 MIT 授權聲明。
- **沒有閉源／付費版**：程式碼中沒看到任何付費牆或「Pro 版才有」的功能。真正要付錢的是你接的雲端 API（LLM、生圖、生影片），見第 3 節。
- **注意**：MIT 只管「程式碼」；AI 生成的影片能不能商用，要看你用的模型服務條款（Google Veo、OpenRouter、ByteDance Seedance、yunwu.ai 中轉站各自不同），這部分 ViMax 管不到。README 提到的論文（arXiv 2606.07649）與 demo 影片不在 MIT 範圍內說明，**未確認**。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容（出處） |
|---|---|
| 後端核心 | Python ≥ 3.12，`uv` 管理套件；依賴 `langchain`、`langchain-openai`、`openai`、`google-genai`、`moviepy`、`opencv-python`、`scenedetect`、`faiss-cpu`、`pillow`、`tenacity`（[pyproject.toml](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pyproject.toml)） |
| 互動介面 1 | 終端機 TUI（`ui/src/cli.tsx`，TypeScript/Node） |
| 互動介面 2 | Web UI：React 18 + Vite，Node 18+ 自寫 HTTP 伺服器 `web/server.mjs`，預設只綁 `127.0.0.1:4173`，用 `spawn` 啟動 `main_agent.py --jsonl` 子行程溝通（[web/server.mjs#L21](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/web/server.mjs#L21)、[#L152](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/web/server.mjs#L152)） |
| 資料庫 | **沒有資料庫**。所有中間產物都是檔案：`.working_dir/<session>/…` 下的 JSON、PNG、MP4；session 索引在 `.vimax/sessions.json`；小說流程用本機 FAISS 向量索引 |
| 部署 | 本機或自己的 Linux 主機；沒有 Dockerfile、沒有雲端部署設定（從檔案清單確認） |
| GPU | **不需要**。所有生圖／生影片都是呼叫雲端 API，本機只做剪接（moviepy/ffmpeg）與場景切割（scenedetect） |

**需要的 API Key（三組，可共用同一把）**：
1. **LLM（文字＋視覺）**：預設 `gpt-5.5` 經 `https://yunwu.ai/v1`（[agent_runtime/config.py#L11-L20](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agent_runtime/config.py#L11-L20)）；舊版腳本設定檔預設 `google/gemini-2.5-flash-lite` 經 OpenRouter（[configs/idea2video.yaml](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/configs/idea2video.yaml)）；也有 MiniMax 預設組（[utils/provider_presets.py#L19-L31](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/utils/provider_presets.py#L19-L31)）。**需支援看圖**（挑候選圖用）。
2. **生圖**：Gemini 2.5/3.1 Flash Image（Nano Banana）、Doubao Seedream 4.0、OpenRouter 的 `openai/gpt-image-2`。
3. **生影片**：Google Veo 3.1（預設 `veo-3.1-generate-preview`，1080p、16:9、每鏡 8 秒，[tools/video_generator_veo_google_api.py#L13-L49](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/tools/video_generator_veo_google_api.py#L13-L49)）、OpenRouter（預設 `google/veo-3.1-lite`、720p、`generate_audio=True`）、Doubao Seedance 1.0 lite、yunwu 中轉的 Omni／Veo。
4. 小說流程另需 Embedding（預設 `text-embedding-3-small`）與 Reranker（`BAAI/bge-reranker-v2-m3`，經 SiliconFlow 類的 `/rerank` 介面）。

**大概費用（估算，價格未在程式碼內，請以各家官方價目為準）**：成本幾乎全在影片。一場 15 鏡 × 8 秒 = 120 秒；若用 Veo 3.1 標準版（約 USD 0.4／秒含聲音）約 USD 48；Veo 3.1 Fast（約 USD 0.15／秒）約 USD 18；再加上「換機位」時額外生成的過場影片（見第 5 節）。生圖每鏡預設 2 張候選、變化大的鏡頭還要尾影格，每個角色 3 張定裝照，單張約 USD 0.04（Nano Banana 量級）。LLM 費用相對小。**換算台幣：一支 2 分鐘短劇的影片費用大約 NT$600～1,600 起跳**（估算）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree` 全部 188 個檔案；用 `find … -name '*.py' | wc -l` 數到 94 個 Python 檔、共 14,294 行（含 tests）；各資料夾行數用 `cat | wc -l` 統計（.py/.ts/.tsx/.mjs）。

```
ViMax/
├── main_idea2video.py        # 直接跑「點子→影片」：在檔案裡改 idea / user_requirement / style
├── main_script2video.py      # 直接跑「劇本→影片」
├── main_agent.py             # 代理對話模式入口（TUI / Web UI 都透過它）
├── vimax                     # bash 啟動腳本：vimax tui / vimax web
├── configs/                  # YAML：LLM、生圖、生影片的 class_path、API key、速率限制
├── pipelines/   (4 檔, 2,254 行)
│   ├── idea2video_pipeline.py    # 故事→角色→定裝照→分場劇本→每場呼叫 Script2Video→串接
│   ├── script2video_pipeline.py  # 核心：分鏡→鏡頭拆解→攝影機樹→首尾影格→逐鏡影片→串接
│   └── novel2movie_pipeline.py   # 小說：切塊壓縮→事件抽取→RAG 檢索→場景抽取→角色合併→出圖出片
├── agents/      (14 檔, 2,695 行)  # 每個「職位」一個類別，prompt 直接寫在檔案頂端
│   ├── screenwriter.py            # 編劇：點子→故事；故事→分場劇本
│   ├── storyboard_artist.py       # 分鏡師：劇本→鏡頭清單；鏡頭→首/尾影格＋運鏡＋聲音描述
│   ├── camera_image_generator.py  # 攝影機樹、過場影片、用場景偵測抽新機位畫面
│   ├── character_extractor.py / character_portraits_generator.py  # 抽角色、生三視圖
│   ├── reference_image_selector.py  # 為每張影格挑參考圖＋改寫生圖 prompt
│   ├── best_image_selector.py     # 視覺 LLM 從多張候選圖挑最一致的
│   ├── novel_compressor.py / event_extractor.py / scene_extractor.py / global_information_planner.py  # 小說流程
│   └── script_planner.py / script_enhancer.py  # 有程式但沒被任何流程呼叫（只在 tests 出現）
├── tools/       (15 檔, 1,697 行)  # 各家生圖/生影片 API 包裝，全部符合同一個 Protocol
├── interfaces/  (10 檔, 598 行)    # Pydantic 資料模型：Character、Shot、Camera、Scene、Event…
├── utils/       (10 檔, 469 行)    # 速率限制、重試、容錯 JSON 解析、影片下載/串接
├── agent_runtime/ (12 檔, 2,707 行) # 自寫的代理迴圈：工具註冊、上下文壓縮、session、LLM 用戶端
├── prompts/agent.md, workflow.md   # 代理模式的系統提示詞（工作流程 DAG 規則）
├── web/         (20 檔, 3,125 行)  # React Web UI + Node 伺服器
├── ui/          (8 檔, 892 行)     # 終端機 TUI
├── tests/       (26 檔, 3,652 行)  # pytest，數到 205 個 test 函式
└── vimax_benchmark/ (36 個 JSON)    # 論文用的測試題目（Type A/B/C 情境）
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 Idea2Video 主流程** → [pipelines/idea2video_pipeline.py#L227-L278](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/idea2video_pipeline.py#L227-L278)
`develop_story` → `extract_characters` → `generate_character_portraits` → `write_script_based_on_story`（回傳「每場一段」的 list）→ 每場各開一個 `Script2VideoPipeline` → `concatenate_video_files`。每一步都先檢查 `working_dir` 裡有沒有現成檔案（story.txt、characters.json、script.json…），**有就跳過**，所以中斷後可續跑，也可以手動改 JSON 再重跑後半段。

**5.2 編劇 prompt** → [agents/screenwriter.py#L14-L58](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/screenwriter.py#L14-L58)（點子→故事）、[#L73-L105](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/screenwriter.py#L73-L105)（故事→分場劇本）。規則包含「輸出語言跟輸入一致」「Show, don't tell」「所有描述要可拍攝」。用 LangChain `PydanticOutputParser` 強制 JSON，並用 tenacity 重試 3 次（[#L141-L165](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/screenwriter.py#L141-L165)）。

**5.3 分鏡** → [agents/storyboard_artist.py#L15-L71](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/storyboard_artist.py#L15-L71)。要求每鏡寫出角色在畫面中的位置、面向、焦點身體部位；每鏡最多一句台詞；盡量重用既有機位。輸出結構見 [interfaces/shot_description.py#L91-L165](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/interfaces/shot_description.py#L91-L165)：`ff_desc`（首影格）、`lf_desc`（尾影格）、`variation_type`（small/medium/large 變化程度）、`motion_desc`（動作運鏡）、`audio_desc`（例：`[Speaker] Alice (Happy): Hello`、`[Sound Effect] …`）。**這份 schema 是整個專案最值得拿走的東西之一。**

**5.4 攝影機樹＋過場影片（連戲的關鍵技巧）** → prompt 在 [agents/camera_image_generator.py#L20-L66](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/camera_image_generator.py#L20-L66)，執行在 [#L184-L233](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/camera_image_generator.py#L184-L233)。LLM 先把同一場的鏡頭分組成「機位」，建一棵「父機位包含子機位內容」的樹。子機位的第一張畫面不是憑空生，而是：用父機位首影格叫影片模型生一段「cut to」過場影片 → 用 `scenedetect` 偵測切點 → 取第二段的第一格當新機位畫面 → 再交給生圖模型修正缺漏元素。這樣背景、人物站位比較連貫，但**每多一個機位就多花一次影片生成費**。呼叫端見 [pipelines/script2video_pipeline.py#L332-L420](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/script2video_pipeline.py#L332-L420)。

**5.5 多候選圖＋視覺 LLM 評審** → [pipelines/script2video_pipeline.py#L535-L660](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/script2video_pipeline.py#L535-L660)＋評審 prompt [agents/best_image_selector.py#L15-L56](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/best_image_selector.py#L15-L56)。同時生 N 張（預設 2），用請求內容 SHA-256 指紋做快取、`selection.json` 記錄狀態（原子寫入 .tmp → replace），再把參考圖＋候選圖 base64 丟給視覺 LLM 依「角色一致、空間一致、符合描述」選一張。

**5.6 逐鏡生影片** → [pipelines/script2video_pipeline.py#L504-L533](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/script2video_pipeline.py#L504-L533)。用 `asyncio.Event` 等首（必要時尾）影格完成，prompt = `motion_desc + "\n" + audio_desc`，交給影片模型。**聲音（對白、音效）完全靠影片模型本身生成**（Veo 3.x／OpenRouter `generate_audio`）。

**5.7 串接輸出** → [pipelines/script2video_pipeline.py#L312-L329](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/script2video_pipeline.py#L312-L329)、[utils/video.py#L26-L44](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/utils/video.py#L26-L44)：moviepy `concatenate_videoclips` 直接硬接，libx264 輸出，沒有轉場特效、字幕、配樂。

**5.8 小說改編** → [pipelines/novel2movie_pipeline.py#L73-L170](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/novel2movie_pipeline.py#L73-L170)：切塊→並行壓縮（Semaphore 5）→逐一抽「事件」→ 原文 512 字切塊建 FAISS → 檢索每個事件相關段落 → 抽場景 → 跨場景合併角色。適合把長篇網文改編成多集短劇的「前期拆解」。

**5.9 代理對話模式** → 三個專用工具 `vimax_narrative_planning`／`vimax_novel_planning`／`vimax_render_video`（[agent_runtime/vimax_adapters.py#L44-L95](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agent_runtime/vimax_adapters.py#L44-L95)），加上讀寫檔、todo、記憶、`view_image`、可選的 `run_shell`（[agent_runtime/tools.py#L391-L403](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agent_runtime/tools.py#L391-L403)）。設計上「先規劃文字、使用者確認、再花錢算圖」，並支援 `revision_target` 局部修改。系統提示見 [prompts/workflow.md](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/prompts/workflow.md)。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 鏡頭資料結構 ShotDescription | [interfaces/shot_description.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/interfaces/shot_description.py) | pydantic | 低 | 直接當你自己「短劇分鏡表」的欄位設計；也可轉成 JSON Schema 給 Claude 的 tool use 輸出 |
| 編劇／分鏡 prompt 組 | [agents/screenwriter.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/screenwriter.py)、[agents/storyboard_artist.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/storyboard_artist.py) | 只是字串 | 低 | 複製 prompt 改成「電商廣告 15 秒／30 秒」版本，放進 Claude Code skill 或你的 Firebase 後台 |
| 生圖／生影片統一介面 | [tools/protocols.py#L14-L35](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/tools/protocols.py#L14-L35)、[tools/render_backend.py#L29-L62](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/tools/render_backend.py#L29-L62) | 無 | 低 | 用 YAML 的 `class_path` 動態載入供應商，照抄就能做「換模型不改程式」 |
| Veo／OpenRouter 影片呼叫 | [tools/video_generator_veo_google_api.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/tools/video_generator_veo_google_api.py)、[tools/video_generator_openrouter_api.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/tools/video_generator_openrouter_api.py) | google-genai / aiohttp | 低 | 單檔可獨立用；含 429 重試、輪詢、首尾影格處理（Veo 公開 API 不支援首尾影格時會退回只用首影格） |
| 多候選＋視覺評審 | [pipelines/script2video_pipeline.py#L535-L660](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/script2video_pipeline.py#L535-L660)、[agents/best_image_selector.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/best_image_selector.py) | langchain、PIL | 中 | 改成「商品主圖生 4 張→Claude 看圖挑最像實品的」；要拿掉 `width <= height` 的橫式限制 |
| 角色三視圖生成 | [agents/character_portraits_generator.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/character_portraits_generator.py) | 任一 ImageGenerator | 低 | 換成「商品三視圖」prompt；或直接把你自己的商品照片寫進 `character_portraits_registry.json`（流程會優先讀現成檔，**推論、未實測**） |
| 攝影機樹＋場景偵測抽格 | [agents/camera_image_generator.py#L184-L233](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/camera_image_generator.py#L184-L233) | scenedetect、moviepy、ffmpeg | 中 | 研究連戲技巧時參考；成本高，電商短片通常用不到 |
| 速率限制器 | [utils/rate_limiter.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/utils/rate_limiter.py) | asyncio | 低 | 每分鐘／每日上限，防止 API 爆量燒錢 |
| 容錯 JSON 解析 | [utils/robust_json_parser.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/utils/robust_json_parser.py) | langchain | 低 | 去除尾逗號後再 Pydantic 解析，任何 LLM 結構化輸出都可用 |
| 小說→事件→場景（RAG） | [pipelines/novel2movie_pipeline.py#L73-L170](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/novel2movie_pipeline.py#L73-L170) | langchain、faiss、embedding API | 高 | 想把長篇故事拆成多集短劇時參考流程，不建議整段搬 |
| Web UI 會話／檔案上傳 | [web/server.mjs](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/web/server.mjs)、[web/config-store.mjs](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/web/config-store.mjs) | Node、React | 中 | 「本機 Node 伺服器 spawn Python 子行程、JSONL 串流事件」的模式可借用；API key 寫檔時用 0600 權限、讀取時遮蔽 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **模型**：LLM 預設 GPT-5.5（經 yunwu.ai 中轉）或 Gemini 2.5 Flash Lite（經 OpenRouter）或 MiniMax M3；生圖 Gemini Flash Image／Seedream 4.0／GPT Image 2；生影片 Veo 3.1／Veo 3.1 lite／Seedance 1.0 lite／Omni。
- **prompt 位置**：各代理 prompt 寫死在 `agents/*.py` 檔案頂端的字串常數；代理模式系統提示在 `prompts/agent.md`、`prompts/workflow.md`，由 `agent_runtime/prompts.py` 組裝。
- **MCP／Skills**：**沒有**。程式碼中搜尋 `anthropic`、`claude`、`mcp` 皆無結果（`grep -rni`）。README 路線圖把「Skill-based workflow extensions」列為未完成。
- **能不能換成 Claude（可接，非原生）**：
  - 代理迴圈用 `AsyncOpenAI` 的 Chat Completions 格式（[agent_runtime/llm.py#L43-L92](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agent_runtime/llm.py#L43-L92)），只能接「OpenAI 相容」端點。
  - 最簡單：`llm.base_url` 設成 `https://openrouter.ai/api/v1`，`model` 設成 OpenRouter 上的 Claude 模型名稱即可；Claude 支援看圖，挑候選圖的功能也能用（**未實測**）。
  - 或用 Anthropic 官方的 OpenAI SDK 相容端點（**未實測**，工具呼叫與圖片格式細節可能有差）。
  - 原生 Anthropic SDK：需自己在 `agent_runtime/llm.py` 加一個 Claude 用戶端，並在 `pyproject.toml` 加 `langchain-anthropic`（目前沒有），讓 `init_chat_model(model_provider="anthropic")` 能用。工作量約半天到一天。
- **用 Claude Code 驅動**：也可以完全不用它的代理迴圈，讓 Claude Code 讀 `prompts/workflow.md` 的 DAG，直接呼叫 `Script2VideoPipeline` 的分段方法（`plan_text_artifacts` 只產文字、不花圖片錢，[pipelines/script2video_pipeline.py#L116-L130](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/script2video_pipeline.py#L116-L130)）。

## 8. 擴充方式與 API

- **加新生圖／影片供應商**：寫一個類別實作 `generate_single_image(prompt, reference_image_paths, **kwargs)` 或 `generate_single_video(...)`，回傳 `ImageOutput`／`VideoOutput`；在 YAML 的 `class_path` 填 `tools.YourClass` 即可（腳本模式）。代理模式則是在 [agent_runtime/vimax_adapters.py#L562-L604](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agent_runtime/vimax_adapters.py#L562-L604) 依 `base_url` 是否含 `openrouter.ai`／`yunwu.ai` 自動挑類別，其他網址會直接報錯，要自己加分支。
- **加新 LLM 供應商預設**：在 `PROVIDER_PRESETS` 加一筆（[utils/provider_presets.py#L19-L87](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/utils/provider_presets.py#L19-L87)），一律轉成 OpenAI 相容。
- **加代理工具**：`ToolSpec(name, description, handler, schema)` 註冊進 `ToolRegistry`（[agent_runtime/tools.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agent_runtime/tools.py)），會自動轉成 OpenAI function-calling 格式。
- **本機 HTTP API（Web UI 用）**：`GET /api/sessions`、`GET|PUT /api/config`、`GET /api/artifacts`、`POST /api/uploads`、`POST /api/agent/start`、`POST /api/messages`、`POST /api/agent/stop`、`GET /api/events`（SSE 事件流）（[web/server.mjs#L36-L111](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/web/server.mjs#L36-L111)）。沒有身分驗證，只靠綁 127.0.0.1 保護。
- **設定優先順序**：環境變數（`VIMAX_LLM_API_KEY` 等）> `configs/agent.local.yaml` > 程式預設值（[agent_runtime/config.py#L37-L47](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agent_runtime/config.py#L37-L47)）。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：最後 commit 2026-09-30（「restore concurrent keyframe generation and VLM selection」），README 新聞到 v1.2.0（2026-07-20 Web UI）。淺層 clone 無法看完整 commit 歷史，提交頻率**未確認**。學術實驗室專案，有論文背書，但交流群是微信／飛書（[Communication.md](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/Communication.md) 未細讀）。
- **測試**：26 個 pytest 檔、205 個 `def test` 函式（`grep -c "def test" tests/*.py` 加總）；前端另有 33 個測試案例（grep `it(`/`test(` 計數）。沒有 CI 設定（檔案清單沒有 `.github/`）。測試名稱如 `test_hang_guards`、`test_crash_regressions`、`test_wrong_output_guards` 表示曾大量修過卡住與崩潰問題。
- **遙測**：沒有外部遙測。`tool_executor.py` 裡的 `telemetry` 只是寫進本機 session log 的耗時紀錄。
- **資安／隱私**：
  - 預設 LLM／生圖走 **yunwu.ai（第三方 API 中轉站）**，你的提示詞、角色照片、API key 都會經過它。建議改成官方 Google／OpenRouter。
  - Web UI 無登入，`VIMAX_WEB_HOST` 若改成 `0.0.0.0` 會讓區網任何人都能操作並花你的 API 額度。
  - `run_shell` 工具預設關閉（`VIMAX_ENABLE_RUN_SHELL=1` 才開），用黑名單字串過濾（[agent_runtime/tools.py#L361-L389](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agent_runtime/tools.py#L361-L389)），黑名單容易被繞過，**不要開**。
  - API key 存在 `configs/agent.local.yaml`（Web UI 寫入時用 0600 權限）。[.gitignore](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/.gitignore) 已忽略 `configs/*.local.yaml`、`.env`、`.working_dir/`、`.vimax/`，不會被誤推上 git；但舊版 `configs/idea2video.yaml` 等設定檔是直接填 `api_key:` 而且**有被 git 追蹤**，填了金鑰別 commit。
- **已知的坑（從程式碼確認）**：
  1. **強制橫式 16:9**：角色圖 prompt 寫明「wide 16:9 landscape canvas」，候選圖 `width <= height` 直接丟錯（[pipelines/script2video_pipeline.py#L600-L606](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/script2video_pipeline.py#L600-L606)、[tools/image_orientation.py#L9-L27](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/tools/image_orientation.py#L9-L27)）。做 IG Reels／抖音／蝦皮直式短影音要改好幾處。
  2. Veo 公開 Gemini API 不支援首尾影格，會自動退回只用首影格，鏡頭結尾不一定對得上。
  3. README 宣稱的 **AutoCameo（上傳照片入鏡）在程式碼裡找不到對應實作**（`grep -rni cameo` 只出現在 README）。
  4. `agents/script_planner.py`、`script_enhancer.py` 沒被任何流程使用。
  5. 每鏡固定 8 秒（Veo）或 5／10 秒（Seedance），無法依台詞長度自動調整。
  6. 舊的 `main_*.py` 用 `print` 大量 emoji 輸出，Windows 終端可能亂碼（**推論**）。

## 10. 跟其他專案組合的建議

- **ViMax（企劃＋分鏡＋連戲）＋ 有 TTS／字幕／BGM 的剪輯型專案（例如 MoneyPrinterTurbo 類）**：用 ViMax 的 `plan_text_artifacts` 產出分鏡 JSON，取出 `audio_desc` 裡的 `[Speaker]` 台詞送進繁中 TTS（例如 Azure 台灣腔 `zh-TW` 語音），再用另一個專案做字幕與配樂；影片模型只生畫面（OpenRouter 有 `VIMAX_OPENROUTER_GENERATE_AUDIO=false` 可關聲音）。
- **電商商品影片**：拿 ViMax 的「三視圖＋參考圖＋視覺評審」三件套，把角色換成商品；搭配你倉儲系統裡的商品資料（名稱、賣點、價格）自動組 `idea` 與 `user_requirement`。要先改掉橫式限制。
- **短劇**：ViMax 的編劇＋分鏡 prompt 很完整，但要加一層「台灣口語台詞潤稿」（建議用 Claude），並把 `user_requirement` 寫成「直式、每集 60 秒、3 場內、每鏡 1 句台詞」。
- **和你的 Firebase 倉儲 App**：不建議直接嵌入（Python＋大量檔案輸出，不適合 Firebase Functions 長時間跑）。比較實際的是在自己電腦跑 ViMax，Firebase 只存商品資料與成品影片連結。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有／未確認 | 程式碼位置 | 說明 |
|---|---|---|---|
| 輸入：主題／點子 | 有 | [pipelines/idea2video_pipeline.py#L227-L246](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/idea2video_pipeline.py#L227-L246) | `idea` + `user_requirement` + `style` |
| 輸入：劇本 | 有 | [main_script2video.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/main_script2video.py) | 好萊塢劇本格式文字 |
| 輸入：小說 | 有 | [pipelines/novel2movie_pipeline.py#L73-L170](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/novel2movie_pipeline.py#L73-L170) | 需另設 embedding＋reranker |
| 輸入：商品圖／自有素材 | 沒有（官方流程） | [web/server.mjs#L71](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/web/server.mjs#L71) | Web UI 可上傳檔案到 session，但沒有「以上傳圖當角色／商品參考」的流程；AutoCameo 找不到程式碼 |
| 腳本 | 有 | [agents/screenwriter.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/screenwriter.py) | LLM 生成故事與分場劇本 |
| 分鏡 | 有 | [agents/storyboard_artist.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/storyboard_artist.py) | 鏡頭清單＋首尾影格＋運鏡＋聲音描述 |
| 畫面：AI 生圖 | 有 | [agents/camera_image_generator.py#L236-L253](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/agents/camera_image_generator.py#L236-L253) | 關鍵影格，付費（約 USD 0.04／張量級，估算） |
| 畫面：AI 生影片 | 有 | [pipelines/script2video_pipeline.py#L504-L533](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/pipelines/script2video_pipeline.py#L504-L533) | 圖生影片，主要成本（Veo 3.1 約 USD 0.15～0.4／秒，估算） |
| 畫面：素材庫／程式繪製 | 沒有 | — | 沒有 Pexels 類素材庫，也沒有 Remotion／程式動畫 |
| 配音（TTS／聲音複製） | 沒有 | [interfaces/shot_description.py#L157-L165](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/interfaces/shot_description.py#L157-L165) | 只把台詞寫進 `audio_desc` 交給影片模型「順便」生聲音；`speaker`／`line`／`emotion` 欄位已被註解掉 |
| 字幕 | 沒有 | — | `grep -i "subtitle\|srt"` 無結果 |
| 配樂 | 沒有 | — | 無 BGM 模組；音效同樣依賴影片模型 |
| 合成 | 有（陽春） | [utils/video.py#L26-L44](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/utils/video.py#L26-L44) | moviepy 直接串接，無轉場、無混音 |
| 輸出 | 有 | 同上 | `final_video.mp4`，libx264，16:9 |

- **每步模型與費用**：LLM（GPT-5.5／Gemini Flash Lite／MiniMax，付費、便宜）→ 生圖（Gemini Flash Image／Seedream／GPT Image 2，付費）→ 生影片（Veo 3.1／Seedance，付費且最貴）。一支 2 分鐘短片估計 USD 20～60（估算，未實測）。
- **中文（繁中、台灣口音）配音與字幕**：**沒有專門支援**。prompt 規定「輸出語言跟輸入一致」，所以輸入繁中會得到繁中劇本與分鏡（**推論**，模型偶爾可能混入簡體）。對白聲音由 Veo 等模型生成，能否講中文、能否是台灣口音**未確認且無法在程式中控制**。字幕完全沒有。
- **Claude 怎麼用**：沒有 Claude Code skill／plugin，也沒有 Anthropic SDK；只能透過 OpenAI 相容介面（OpenRouter 最簡單）接 Claude，見第 7 節。
- **能不能在個人電腦跑**：可以，筆電即可，不需 GPU（全部雲端 API）。需要 Python 3.12、uv、ffmpeg（moviepy／scenedetect 用，**ffmpeg 安裝需求是推論**）、Web UI 另需 Node 18+。磁碟要預留空間存每鏡 PNG／MP4 與過場影片。
- **最適合做**：**短劇／故事型影片**（多角色、多場景、對白）＞ 解說影片 ＞ 廣告素材 ＞ 電商商品影片（最不適合：沒有商品圖輸入、強制橫式、沒有字幕與價格資訊疊字）。
- **法律風險**：(1) 生成影片的商用權依各模型條款（Google、ByteDance、OpenRouter 轉接的上游）；(2) 若把真人照片當角色參考（README 宣稱的 Cameo 用法），需取得本人同意，涉及台灣肖像權／個資法；(3) 小說改編功能若餵入他人網文，屬改作，需原著作權人授權；(4) 投放 Meta／Google 廣告時，多數平台要求標示 AI 生成內容（**以各平台最新政策為準**）；(5) 透過 yunwu.ai 中轉站傳送資料的隱私與條款風險。

## 關鍵字
ViMax、HKUDS、香港大學、AI 影片生成、多代理、Agentic Video Generation、Idea2Video、Script2Video、Novel2Video、點子轉影片、劇本轉影片、小說改編、短劇、分鏡、storyboard、攝影機樹、camera tree、關鍵影格、首尾影格、角色一致性、三視圖、character consistency、視覺評審、VLM selection、Google Veo 3.1、Seedance、Nano Banana、Gemini Flash Image、GPT Image 2、OpenRouter、yunwu.ai、MiniMax、LangChain、moviepy、scenedetect、FAISS、RAG、Python、React Web UI、TUI、MIT 授權、無 TTS、無字幕、16:9 橫式、OpenAI 相容、Claude 可接
