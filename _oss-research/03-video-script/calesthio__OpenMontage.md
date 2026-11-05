# calesthio/OpenMontage — 把 Claude Code 變成「整個影片製作團隊」的開源 agent 影片產線
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：d21f5d4
> GitHub：https://github.com/calesthio/OpenMontage｜⭐ 76348｜授權：AGPL-3.0（另含 Remotion 等第三方元件的獨立授權）｜主要語言：Python｜最近更新：2026-11-03

> 本資料包所有 permalink 都固定在 commit `d21f5d4eaa08422b09c7091757a05affcbabb35b`（https://github.com/calesthio/OpenMontage/tree/d21f5d4eaa08422b09c7091757a05affcbabb35b）。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：OpenMontage 不是一個「按按鈕出影片」的網站，而是一個「給 AI 寫程式助理（Claude Code 最優先）讀的影片製作手冊＋Python 工具箱」。Claude Code 自己當導演：讀 YAML 流程定義 → 讀每個階段的 Markdown 導演指南 → 呼叫 Python 工具（生圖、生影片、TTS、配樂、字幕、合成）→ 每個創意決策停下來問你 → 最後用 Remotion／HyperFrames／FFmpeg 輸出 MP4。

**對你（台灣小電商老闆、自己投廣告）最有用的用法：**
- **商品廣告短影片**：拿你拍好的商品照（hero still），用 Veo／Kling 等「首尾幀圖生影片」讓商品動起來但不變形（README 示範片〈Products Come to Life〉就是這招），再配旁白＋字幕＋音樂，輸出 9:16 給 FB/IG Reels、TikTok、YouTube Shorts。
- **零成本版本**：完全不付費也能做「圖片＋旁白＋字幕＋動畫字卡」影片（Piper 本機 TTS＋Pexels/Pixabay 免費素材＋Remotion 合成）。Remotion 裡甚至有現成的 `ProductReveal` 元件，參數就是「商品圖、品名、價格、標語、結尾 CTA」，非常貼近電商需求。
- **參考別人的爆款**：貼一支你喜歡的 Reel／Short，它會分析節奏、分鏡、開場 hook，提出 2–3 個「你的版本」企劃，並先估好成本。
- **長片切短片**（clip-factory）、**影片翻譯配音**（localization-dub）、**軟體／後台操作錄影解說**（screen-demo，可拿來錄你自己倉儲系統的教學）。
- **短劇**：沒有專門的「短劇／多集劇情」流程；最接近的是 `cinematic`（預告片、品牌片、短篇戲劇剪輯）與 `character-animation`（SVG 卡通角色）。要做真人感短劇需要自己組合 Kling 角色元素／Higgsfield Soul ID 等付費服務，屬「可以但要自己拼」。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **主體授權：GNU AGPL-3.0**（[`LICENSE`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/LICENSE)，README 尾端也寫 [GNU AGPLv3](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/README.md#L761-L763)）。
  - **個人使用**：完全沒問題。下載、修改、自己跑、做出來的影片拿去投廣告都可以。AGPL 管的是「程式碼」，不是你產出的影片。
  - **公司商用**：在公司內部自己跑來產影片也 OK。真正要注意的是：如果你**把它（或改過的版本）包成網站／SaaS 讓別人透過網路使用**，AGPL 要求你把修改後的完整原始碼公開給這些使用者。你若打算把其中的 Python 程式碼「抄進」自己的閉源倉儲系統再對外提供服務，那部分也會被 AGPL 感染——建議只「參考做法、自己重寫」，或只拆 MIT/Apache 的第三方部分。
  - 貢獻規則：不需 CLA（[`CONTRIBUTING.md`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/CONTRIBUTING.md)），代表作者沒有保留「另賣商業授權」的法律工具，至少目前沒看到雙授權。
- **第三方元件各自的授權（重要）**：
  - **Remotion**（合成引擎，`remotion-composer/` 依賴 `remotion@^4.0.484`）有自己的特殊授權；repo 內附的 Remotion skill 也提醒「公司商用可能需要另購授權」（[`.claude/skills/remotion/SKILL.md` L146](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/.claude/skills/remotion/SKILL.md#L146)）。Remotion 官方規定細節（例如員工人數門檻）本資料包**未確認**，商用前請自己看 remotion.dev/license。不想碰的話可改走 HyperFrames（HTML/GSAP）或純 FFmpeg 路線。
  - `ink-theater/` 內含 OFL 字型與 CMU 動作捕捉資料，可商用但要保留標示（[`ink-theater/THIRD_PARTY_NOTICES.md`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/ink-theater/THIRD_PARTY_NOTICES.md)）。
  - `.claude/skills/`、`.agents/skills/` 裡很多是第三方廠商（HeyGen、ElevenLabs、BFL、Vercel 等）的技能包，授權各自不同，本次未逐一確認。
- **閉源／付費版**：程式碼本身沒有付費牆，所有功能都在 repo 裡。但 README 有「Something new is taking shape… join the early users」的招募（[`README.md`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/README.md) 開頭），可能是未來的另一個產品，內容**未確認**。真正要花錢的是各家雲端 API（見第 3 節）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容 | 來源 |
|---|---|---|
| 主要語言 | Python 3.10+（CI 用 3.11） | [`Makefile`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/Makefile)、[`.github/workflows/ci.yml`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/.github/workflows/ci.yml) |
| Python 相依 | pyyaml、pydantic、jsonschema、Pillow、numpy、requests、google-genai、openai、fastapi、uvicorn、watchfiles、websockets | [`requirements.txt`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/requirements.txt) |
| 合成引擎 1 | Remotion（React 18 + TypeScript，Node.js 18+） | [`remotion-composer/package.json`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/remotion-composer/package.json) |
| 合成引擎 2 | HyperFrames（HTML/CSS/GSAP，經 npx 取得，headless Chrome 渲染） | [`Makefile`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/Makefile) setup 段 |
| 後製 | FFmpeg（必裝） | [`tools/video/video_compose.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/video_compose.py#L58-L77) |
| 「前端」 | 只有 Backlot：本機看板（FastAPI＋原生 JS），只綁 127.0.0.1/localhost | [`backlot/server.py` L309-L311](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/backlot/server.py#L309-L311) |
| 資料庫 | **沒有**。所有狀態都是 `projects/<id>/` 底下的 JSON checkpoint、artifact、`events.jsonl` 檔案 | [`lib/checkpoint.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/checkpoint.py) |
| 部署方式 | 本機：`git clone` → `make setup` → 用 Claude Code 打開資料夾直接講需求。不是 Web 服務，不適合放 Firebase。 | [`README.md` Quick Start](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/README.md) |
| GPU | 非必要。有 NVIDIA GPU 才能跑本機生影片（`make install-gpu` 裝 torch） | [`requirements-gpu.txt`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/requirements-gpu.txt) |

**本機 GPU 模型的需求（取自各工具 `resource_profile` 宣告值，非實測）**：WAN 2.x 約 8 GB VRAM／16 GB RAM／40 GB 硬碟（[`tools/video/wan_video.py` L164](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/wan_video.py#L164)）；LTX 本機 12 GB VRAM；Hunyuan 本機 14 GB VRAM；CogVideo 6 GB VRAM；Qwen Image 16 GB VRAM／32 GB RAM；Stable Diffusion 4 GB VRAM。一般筆電沒有獨顯就只能走雲端 API 或免費素材。

**API Key（全部選填，`.env` 設定，見 [`docs/PROVIDERS.md` L33-L109](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/docs/PROVIDERS.md#L33-L109)）與官方文件列的價格（2026 年 10 月文件，實際以廠商為準）**：
- 免費：`PEXELS_API_KEY`、`PIXABAY_API_KEY`、`UNSPLASH_ACCESS_KEY`（素材）；Piper（本機 TTS，免 Key）。
- `GOOGLE_API_KEY`：Google TTS（文件寫每月 100 萬字免費）、Imagen 約 $0.04/張、Veo、Lyria 配樂。
- `FAL_KEY`（fal.ai 一把鑰匙通吃）：FLUX Dev $0.03/張、FLUX Pro $0.05/張、Kling 2.5 Turbo Pro $0.07/秒、Veo 3 $0.40/秒、WAN 2.5 $0.05/秒（[`docs/PROVIDERS.md` L337-L384](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/docs/PROVIDERS.md#L337-L384)）。
- 程式內估價範例：`kling_video` standard 5 秒約 $0.10、pro $0.20、master $0.30（[`tools/video/kling_video.py` L107-L114](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/kling_video.py#L107-L114)）；`veo_video` 走 Google 直連 $0.40/秒，走 fal 含聲音 1080p $0.40/秒、fast 版 $0.20/秒（[`tools/video/veo_video.py` L190-L228](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/veo_video.py#L190-L228)）。
- 其他：ElevenLabs（每月 1 萬字免費）、OpenAI（TTS＋GPT Image）、Kling 官方、Volcengine Ark（Seedance）、Runway（$12/月起）、HeyGen、Suno、xAI Grok、MiniMax、Atlas Cloud、Doubao、DashScope、Azure Speech、fish.audio 等。
- README 示範片自報成本：60 秒動畫短片 $1.33、50 秒直式品牌片約 $4（作者自報，未驗證）。
- **LLM 費用**：OpenMontage 執行時**不呼叫任何 LLM API**（[`docs/ARCHITECTURE.md` L92-L94](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/docs/ARCHITECTURE.md#L92-L94)），腳本／企劃都是你的 Claude Code 寫的，所以 LLM 費用就是你 Claude 訂閱／API 的用量。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：用 `git ls-tree -r --name-only HEAD` 取得完整檔案清單（共 2,209 個檔案），再用 grep／我自己寫的 AST 腳本（不執行 repo 程式碼）統計。

```
OpenMontage/
├── CLAUDE.md                 # 只有一句話：叫 Claude 先讀 AGENT_GUIDE.md
├── AGENT_GUIDE.md            # 真正的 agent 操作規約（720 行）：Rule Zero、決策溝通、成本揭露
├── PROJECT_CONTEXT.md / AGENTS.md / CODEX.md / COPILOT.md / CURSOR.md / .windsurfrules  # 給各家 AI 助理的入口
├── config.yaml               # 預算（預設 $10、單次 >$0.50 要批准）、輸出 1920x1080/30fps/CRF23
├── pipeline_defs/            # 13 個 YAML：12 條正式製作流程 + framework-smoke 測試用
├── skills/                   # 157 個 .md：Layer 2「OpenMontage 怎麼做」
│   ├── pipelines/<流程>/<階段>-director.md   # 每條流程每個階段的導演指南
│   ├── creative/             # 分鏡、說故事、短影音規格、各家生影片 prompt 寫法（veo/sora/seedance…）
│   ├── core/                 # ffmpeg、remotion、hyperframes、字幕對時、whisperx
│   └── meta/                 # 審稿、checkpoint、參考影片分析、配音導演、onboarding
├── .agents/skills/           # 996 個檔案（579 個 .md）：Layer 3 外部技術知識包
├── .claude/skills/           # 49 個技能資料夾（432 個檔案）：Claude Code 直接可用的 Skills
├── .claude/commands/         # 3 個斜線指令：/backlot、/ink-art、/animated-drawing
├── tools/                    # 209 個 .py；AST 統計出 155 個具名 BaseTool 工具
│   ├── base_tool.py          # 所有工具的抽象基底（成本估算、快取、事件記錄）
│   ├── tool_registry.py      # 自動掃描、能力清單、provider_menu
│   ├── cost_tracker.py       # 預算：估價→保留→結算→退款
│   ├── video/                # 生影片（Kling、Veo、Seedance、Sora、Runway、WAN…）、合成、剪接、素材庫
│   │   └── stock_sources/    # 16 個免費素材來源（Pexels、Pixabay、Archive.org、NASA、Wikimedia…）
│   ├── graphics/             # 生圖（FLUX、Imagen、GPT Image、Seedream…）、圖表、程式碼截圖、Manim
│   ├── audio/                # TTS（14 家）、配樂、混音、降噪
│   ├── subtitle/             # SRT/VTT 產生
│   ├── analysis/             # WhisperX 轉錄、場景偵測、抽幀、參考影片分析、yt-dlp 下載
│   ├── avatar/ enhancement/ capture/ character/ publishers/
├── lib/                      # 基礎設施：checkpoint、scoring（7 維度評分）、slideshow_risk、delivery_promise、CLIP 向量
├── schemas/                  # 35 個檔案：artifact／checkpoint／pipeline 的 JSON Schema
├── remotion-composer/        # React/Remotion 合成專案（含 ProductReveal、字幕、圖表元件）
├── backlot/                  # 本機即時看板（FastAPI + 原生 JS）
├── styles/                   # 5 種視覺風格 YAML（ghibli、clean-professional…）
├── ink-theater/              # 手繪墨水風角色動畫（JS）
└── tests/                    # 154 個 .py，grep 到 1,483 個 test_ 函式
```

**工具數統計（AST 依 `capability` 分類）**：video_generation 34、image_generation 30、tts 14、analysis 14、video_post 10、music_generation 6、enhancement 6、character_animation 6、avatar 5，其他零星。README 宣稱「100+ tools」「700+ skill 檔」——我數到 155 個工具；skill 類 .md 合計 1,062 個（skills 157＋.agents 579＋.claude 326），與宣稱相符或更多。

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

1. **Agent 當總指揮（沒有 Python orchestrator）** → [`AGENT_GUIDE.md` L49-L90](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/AGENT_GUIDE.md#L49-L90)、[`docs/ARCHITECTURE.md` L80-L100](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/docs/ARCHITECTURE.md#L80-L100)
   重點：Python 只負責「工具＋存檔」。流程是 `research → proposal → script → scene_plan → assets → edit → compose → publish`，每階段先讀對應的 director skill 再動手。這是整個專案最值得學的設計：**把流程知識寫成 Markdown，讓 Claude 讀**。

2. **流程定義（YAML manifest）** → [`pipeline_defs/cinematic.yaml`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/pipeline_defs/cinematic.yaml)、[`pipeline_defs/animated-explainer.yaml`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/pipeline_defs/animated-explainer.yaml)
   重點：每個 stage 宣告 `skill`、`produces`（產出哪個 artifact）、`tools_available`、`review_focus`、`success_criteria`、`human_approval_default`；並有 `budget_default_usd: 2.00` 等預算上限。

3. **工具基底與自動事件／快取** → [`tools/base_tool.py` L409-L478](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/base_tool.py#L409-L478)、[`L154-L245`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/base_tool.py#L154-L245)
   重點：`__init_subclass__` 自動把每個工具的 `execute()` 包上「快取」＋「Backlot 事件記錄」；每個工具宣告 `capability`、`provider`、`best_for`、`not_good_for`、`fallback_tools`、`resource_profile`、`estimate_cost()`。

4. **供應商評分選擇器（7 維度）** → [`lib/scoring.py` L20-L45](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/scoring.py#L20-L45)、[`L266-L289`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/scoring.py#L266-L289)、[`tools/video/video_selector.py` L368-L380](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/video_selector.py#L368-L380)
   重點：task_fit 30%、output_quality 20%、control 15%、reliability 15%、cost_efficiency 10%、latency 5%、continuity 5%。免費＝成本分 1.0；超預算＝0。

5. **預算控管** → [`tools/cost_tracker.py` L101-L158](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/cost_tracker.py#L101-L158)、[`config.yaml`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/config.yaml)
   重點：每筆花費「估價 → 保留 → 結算／退款」；單次 >$0.50 或第一次使用某付費工具都會丟 `ApprovalRequiredError` 要你同意；`cap` 模式超支直接擋。

6. **商品圖首尾幀生影片** → [`tools/video/veo_video.py` L641-L655](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/veo_video.py#L641-L655)（`first_last_frame_to_video`）、[`tools/video/kling_video.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/kling_video.py)（`image_to_video` 傳 `image_url`）
   重點：把同一張商品圖釘為第一幀／最後一幀，模型只「補中間的動作」，商品外觀不容易走樣。

7. **Remotion 電商元件** → [`remotion-composer/src/components/ProductReveal.tsx` L12-L40](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/remotion-composer/src/components/ProductReveal.tsx#L12-L40)
   重點：props 是 `productImage, productName, price, tagline, closer, accentColor`，spring 動畫放大商品＋價格＋CTA，可直接拿來做「新品上架 15 秒影片」。

8. **字幕** → [`tools/subtitle/subtitle_gen.py` L168-L240](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/subtitle/subtitle_gen.py#L168-L240)、[`remotion-composer/src/components/CaptionOverlay.tsx` L11-L32](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/remotion-composer/src/components/CaptionOverlay.tsx#L11-L32)、FFmpeg 燒字幕 [`video_compose.py` L2713-L2748](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/video_compose.py#L2713-L2748)
   重點：逐字時間碼 → SRT/VTT；Remotion 版是 TikTok 式逐字高亮，並有 `wordSeparator=""` 與 `pageBreakAfter` 專為 CJK（中日韓）設計。

9. **免費實拍素材＋語意檢索** → [`tools/video/corpus_builder.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/corpus_builder.py)、[`tools/video/clip_search.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/clip_search.py)、[`lib/clip_embedder.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/clip_embedder.py)
   重點：從 Pexels／Archive.org 等抓片 → 用 CLIP（ViT-B/32，CPU 可跑）轉向量 → 依每個分鏡的文字描述排序挑片。素材授權字串記在 [`stock_sources/base.py` L67](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/stock_sources/base.py#L67)。

10. **防「投影片感」品質閘門** → [`lib/slideshow_risk.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/slideshow_risk.py)、[`lib/delivery_promise.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/delivery_promise.py)
    重點：合成前評分「重複畫面、裝飾性圖、動態太弱、字體」等，若企劃承諾是「真影片」卻只剩靜態圖就擋下。

11. **分鏡 prompt 組裝** → [`lib/shot_prompt_builder.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/shot_prompt_builder.py)
    重點：5 層（鏡頭／運鏡／主體／光線／風格）把結構化分鏡轉成各家模型適用的 prompt，避免每格都套同一段風格前綴。

12. **Backlot 即時看板** → [`backlot/server.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/backlot/server.py)、[`backlot/state.py` L588](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/backlot/state.py#L588)
    重點：監看 `projects/` 檔案變化 → SSE 推給瀏覽器；分鏡核准頁可看每格素材、prompt、成本。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 「流程 YAML＋階段導演 Markdown」寫法 | [`pipeline_defs/`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/pipeline_defs/cinematic.yaml)、[`skills/pipelines/`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/skills/pipelines/cinematic/script-director.md) | 無（純文字） | 低 | 照抄結構寫你自己的「商品影片 SOP」skill，放進自己 repo 的 `.claude/skills/`，Claude Code 就會照流程做（自己重寫即可避開 AGPL） |
| ProductReveal 商品揭幕動畫 | [`ProductReveal.tsx`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/remotion-composer/src/components/ProductReveal.tsx) | Remotion、React | 低 | 從你的倉儲系統匯出「商品圖、品名、售價」JSON → 當 props 丟給 Remotion render，批次產生上架影片 |
| CaptionOverlay 逐字字幕（含 CJK） | [`CaptionOverlay.tsx`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/remotion-composer/src/components/CaptionOverlay.tsx) | Remotion | 低 | 任何 Remotion 專案直接引用，餵 `{word,startMs,endMs}` 陣列 |
| 成本追蹤器 | [`tools/cost_tracker.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/cost_tracker.py) | 標準函式庫 | 低 | 「估價→保留→結算」模式可套到你自己的 AI 生圖／投廣告預算控管 |
| 7 維度供應商評分 | [`lib/scoring.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/scoring.py) | 無 | 中 | 拿來做「多家 API 自動挑最划算的」，邏輯也能套在比價（多供應商報價加權） |
| BaseTool＋Registry 外掛架構 | [`tools/base_tool.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/base_tool.py)、[`tools/tool_registry.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/tool_registry.py) | pydantic、jsonschema | 中 | 想自己做「AI 工具箱」時的骨架；工具宣告式 metadata 讓 Claude 能自己查能力 |
| 單一供應商呼叫範例（Veo/Kling/TTS） | [`veo_video.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/veo_video.py)、[`google_tts.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/audio/google_tts.py) | requests、google-genai | 低 | 當作 API 參數與輪詢寫法的參考 |
| FFmpeg 字幕燒錄＋ASS 樣式 | [`video_compose.py` L2713-L2941](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/video_compose.py#L2713-L2941) | FFmpeg | 低 | 抽成獨立函式；注意中文字型要改 `font`（預設 Inter 不含中文） |
| 媒體平台規格表 | [`lib/media_profiles.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/media_profiles.py) | 無 | 低 | Shorts／Reels／TikTok 的解析度、長度上限、編碼參數直接沿用 |
| 短影音知識卡 | [`skills/creative/short-form.md`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/skills/creative/short-form.md) | 無 | 低 | 各平台安全區、前 1–2 秒 hook、-14 LUFS 等規格，可直接當廣告素材檢查表 |
| Backlot 看板 | [`backlot/`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/backlot/server.py) | FastAPI、watchfiles | 高 | 綁死它自己的 `projects/` 檔案結構，參考概念就好 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **Claude 支援：原生**。repo 根目錄有 [`CLAUDE.md`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/CLAUDE.md)（導向 AGENT_GUIDE.md）、`.claude/skills/` 49 個技能、`.claude/commands/` 3 個斜線指令（例如 [`/backlot`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/.claude/commands/backlot.md)）、[`.claude/launch.json`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/.claude/launch.json)（啟動 Backlot 於 4750 埠）。Claude Code 打開資料夾就能用，不需要 Anthropic API Key。
- **LLM 不在程式裡**：[`config.yaml`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/config.yaml) 雖寫 `llm.provider: anthropic`，但我 grep 整個非測試 Python 程式碼，`LLMConfig` 只被定義在 [`lib/config_model.py` L28-L32](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/config_model.py#L28-L32)、沒有任何地方讀取或呼叫 LLM——腳本、分鏡、審稿全由 Claude Code 本身完成。
- **Prompt 放哪**：各階段指示在 `skills/pipelines/*/*-director.md`；各家生影片的 prompt 寫法在 [`skills/creative/prompting/`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/skills/creative/prompting/veo-prompting.md)（veo、sora、seedance、ltx、hunyuan、grok）；程式化 prompt 組裝在 `lib/shot_prompt_builder.py`。
- **MCP**：本身沒有提供 MCP server（未在檔案清單中找到）。部分第三方 skill（如 [`.claude/skills/create-video/SKILL.md`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/.claude/skills/create-video/SKILL.md)）宣告 `allowed-tools: mcp__heygen__*`，表示需要你另外接 HeyGen MCP。
- **其他 AI 助理**：也提供 Cursor／Codex／Copilot／Windsurf 入口檔，但 Claude Code 是最完整的。

## 8. 擴充方式與 API

- **新增工具**：在 `tools/<類別>/` 新增一個 `BaseTool` 子類別，宣告 `name`、`capability`、`input_schema`、`estimate_cost()`、`execute()`；`registry.discover()` 會自動掃到（[`tools/tool_registry.py` L118-L135](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/tool_registry.py#L118-L135)）。官方另有 [`skills/meta/capability-extension.md`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/skills/meta/capability-extension.md) 說明。
- **新增流程**：新增 `pipeline_defs/<名稱>.yaml`＋`skills/pipelines/<名稱>/*-director.md`；manifest schema 在 [`schemas/pipelines/pipeline_manifest.schema.json`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/schemas/pipelines/pipeline_manifest.schema.json)。
- **新增風格**：`styles/*.yaml`（5 個範例）。
- **對外 API**：沒有 HTTP API。程式面就是 Python：`registry.provider_menu()`、`registry.support_envelope()`（[`tool_registry.py` L198-L316](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/tool_registry.py#L198-L316)）、`lib.checkpoint.get_next_stage()`（[`L627`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/checkpoint.py#L627)）。
- **發布**：目前只有本機匯出包 `export_bundle`（不會自動上傳 YouTube/FB）（[`tools/publishers/export_bundle.py` L1-L16](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/publishers/export_bundle.py#L1-L16)）。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：極度活躍。2026-03-29 建立、最後 push 2026-11-03（最新 commit：「docs: invite early users from README」）；`docs/provider-refresh-2026-10-23.md` 顯示作者持續跟進各家新模型。
- **測試**：`tests/` 有 154 個 .py，grep 出 1,483 個 `test_` 函式；CI 用 Python 3.11＋FFmpeg 跑 `make install-dev` 後測試（[`ci.yml`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/.github/workflows/ci.yml)）。本次依規定沒有執行測試，通過率**未確認**。
- **遙測**：grep `posthog|sentry|telemetry|analytics|mixpanel`，只在 `base_tool.py` 註解出現「telemetry hints」字樣，沒有找到回傳使用資料的程式碼。Backlot 只綁 localhost 並加 TrustedHost 防 DNS rebinding。
- **資安／隱私**：你的商品圖、腳本會上傳到你選的雲端生成服務（fal.ai、Google、Kling…），各家資料保留政策不同。`.env` 裡一堆 API Key，不要 commit。
- **已知的坑**：
  1. 大量工具 `stability = EXPERIMENTAL`（例如 kling_video、video_compose），API 參數隨廠商改版常變。
  2. 安裝鏈長：Python＋Node＋FFmpeg＋npx HyperFrames＋（選）torch，Windows 上 npm 有已知錯誤（README 有寫解法）。
  3. 「Agent 主導」代表結果品質很依賴 Claude 有沒有照 skill 走；Claude Code 對話 token 用量會很大（每階段都要讀長篇 Markdown）。
  4. 中文支援是「透過參數」而非預設：TTS 預設英文聲音、FFmpeg 字幕預設字型 Inter（不含中文字），做繁中影片要主動指定字型與 voice。
  5. Remotion 商用授權（見第 2 節）。

## 10. 跟其他專案組合的建議

- **＋你自己的倉儲／ERP（Firebase）**：從商品資料庫匯出 JSON（圖、品名、售價、賣點）→ 用 OpenMontage 的 ProductReveal＋CaptionOverlay 批次產「新品上架影片」。這條路最快見效、成本可接近 0。
- **＋MoneyPrinterV2／短影音自動化類專案（同資料夾 `03-video-script/`）**：那類專案擅長「自動上傳、帳號排程」；OpenMontage 擅長「製作品質與流程控管」，可以 OpenMontage 做片、另一個負責發佈。
- **＋HKUDS/ViMax（同資料夾）**：若要做多角色、多場景的劇情短劇，可參考 ViMax 的角色一致性做法，再用 OpenMontage 的 cinematic 流程與合成器收尾（具體可行性未確認）。
- **＋比價／成本計算工具**：`lib/scoring.py` 的加權評分與 `cost_tracker.py` 的預算保留模式，可移植到「多供應商進貨比價」或「廣告素材成本試算」；也能把每支影片的 `cost_log` 匯進你的網頁版試算表做成本報表。
- **建議做法**：把 OpenMontage 當「範本與工具庫」，自己的 repo 只保留需要的 3–5 個工具＋一份精簡的「商品廣告影片」skill，避免 700+ skill 檔把 Claude 的 context 吃光。

## 11. 影片／腳本流程檢查表

- **輸入（主題／商品圖／小說／素材）**：**有**。主題文字、參考影片網址（[`tools/analysis/video_downloader.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/analysis/video_downloader.py) 用 yt-dlp）、本機素材、商品圖（i2v 的 `image_url` / `first_frame_path`）。小說長文改編**沒有專門流程**。
- **腳本**：**有**。由 Claude Code 依 `skills/pipelines/<流程>/script-director.md` 撰寫，輸出符合 [`schemas/artifacts/script.schema.json`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/schemas/artifacts/script.schema.json) 的 JSON；不額外付費（用你的 Claude 額度）。研究階段要求做多次網路搜尋（cinematic 要求至少 8 次）。
- **分鏡**：**有**。`scene_plan` artifact（[`schemas/artifacts/scene_plan.schema.json`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/schemas/artifacts/scene_plan.schema.json)）＋ `lib/shot_prompt_builder.py` 5 層 prompt。
- **畫面－素材庫**：**有**，免費。16 個 stock 來源（[`tools/video/stock_sources/`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/stock_sources/base.py)），Pexels/Pixabay 需免費 Key。
- **畫面－AI 生圖**：**有**，30 個 image_generation 工具；FLUX Dev 約 $0.03/張、Imagen 約 $0.04/張、GPT Image 約 $0.05/張（PROVIDERS.md 列價）；本機 Stable Diffusion 免費需 4 GB VRAM。
- **畫面－AI 生影片**：**有**，34 個 video_generation 工具。Kling（fal）約 $0.10／5 秒起、Veo $0.20–0.40/秒、WAN 2.5 $0.05/秒；本機 WAN/LTX/Hunyuan/CogVideo 免費但要 6–14 GB VRAM。
- **畫面－程式繪製**：**有**。Remotion（React）、HyperFrames（HTML/GSAP）、Manim（數學動畫）、Mermaid 圖表、Three.js／Blender 3D、SVG 角色動畫。免費。
- **配音（TTS）**：**有**，14 個 tts 工具。免費：Piper（本機，預設 `en_US-lessac-medium`，[`piper_tts.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/audio/piper_tts.py)）、Google TTS 免費額度；付費：ElevenLabs、OpenAI、Azure、Doubao、DashScope、fish.audio 等。
- **聲音複製**：**有（付費雲端）**。fish.audio `reference_id`（[`fish_audio_tts.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/audio/fish_audio_tts.py)）、ElevenLabs、HeyGen voice convert；Piper 明確 `voice_cloning: False`。
- **字幕**：**有**。WhisperX 轉錄＋逐字時間碼 → SRT/VTT（`subtitle_gen`）或 Remotion 逐字高亮（`CaptionOverlay`），FFmpeg 燒錄。免費。
- **配樂**：**有**。免費：Pixabay Music、Freesound、自己的 `music_library/`；付費：Suno、ElevenLabs Music、Google Lyria；本機 ACE-Step（ComfyUI，8 GB VRAM）。
- **合成**：**有**。[`video_compose.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/video/video_compose.py) 自動在 Remotion／HyperFrames／FFmpeg 間路由，含合成前驗證與合成後 ffprobe＋抽幀＋音量自我審查。
- **輸出**：**有**。MP4（libx264/AAC），內建 YouTube、Shorts、Reels、TikTok、IG 方形等規格（[`lib/media_profiles.py`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/media_profiles.py)）；`export_bundle` 打包成品＋SEO 文案，不自動上傳。
- **中文（繁中、台灣口音）配音與字幕**：**部分有／台灣口音未確認**。程式碼 grep 不到任何 `zh-TW`、`cmn-TW`、`Taiwan` 字樣；`tts_selector` 只有給 Kling 用的 `voice_language: ["zh","en"]`（[`tts_selector.py` L66-L70](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/audio/tts_selector.py#L66-L70)）。Google TTS 接受任意 BCP-47 `language_code` 與 voice 名稱（[`google_tts.py` L91-L103](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/tools/audio/google_tts.py#L91-L103)），理論上可指定台灣華語聲音，但專案沒有內建或測試。Doubao／DashScope 主打普通話（中國口音）。字幕的 CJK 斷行有處理，但要自己指定中文字型。
- **Claude 怎麼用**：**Claude Code 原生**（CLAUDE.md＋.claude/skills＋.claude/commands），不需要 Anthropic API，也不是 OpenAI 相容介面。
- **能不能在個人電腦跑**：**可以**。無 GPU 也能跑「素材＋Piper＋Remotion」或「雲端 API」路線；本機生影片需 NVIDIA GPU 6–14 GB VRAM（宣告值）；另有 Apple Silicon MPS 說明（[`docs/apple-silicon-mps.md`](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/docs/apple-silicon-mps.md)）。
- **最適合做**：**解說影片（最強）＞ 電商商品影片／廣告素材（很適合，有首尾幀 i2v＋ProductReveal）＞ 品牌／預告片 ＞ 短劇（沒有專門流程，要自己組）**。
- **法律風險**：
  - 版權：免費素材各來源授權不同（Archive.org、Wikimedia 有些需標示），程式有記錄 `license` 欄位但要自己檢查；用 yt-dlp 下載他人影片當「參考」可能違反 YouTube 服務條款，別把原片內容放進成品。
  - 肖像權：avatar／lip-sync／face 相關工具若用真人臉孔需取得同意；別用名人臉做廣告。
  - 平台條款：Meta／TikTok 對 AI 生成內容有標示要求；各生成服務（Kling、Veo 等）對商用輸出各有條款，投廣告前要看清楚。
  - 程式授權：AGPL（第 2 節）＋Remotion 公司授權。

## 關鍵字
OpenMontage、calesthio、AI 影片製作、agentic video、Claude Code、Claude Skills、CLAUDE.md、AGENT_GUIDE、影片產線、pipeline、腳本生成、分鏡、商品影片、電商廣告、廣告素材、短影音、Reels、TikTok、YouTube Shorts、圖生影片、image-to-video、首尾幀、first_last_frame、Veo、Kling、fal.ai、Seedance、Sora、Runway、WAN、FLUX、TTS、配音、聲音複製、ElevenLabs、Piper、Google TTS、字幕、WhisperX、SRT、Remotion、HyperFrames、FFmpeg、ProductReveal、CaptionOverlay、免費素材、Pexels、Pixabay、CLIP、成本控管、cost tracker、供應商評分、Backlot、AGPL-3.0
