# digitalsamba/claude-code-video-toolkit — 用 Claude Code 當導演、從腳本一路做到 MP4 的「AI 影片工作室工具箱」
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：a50da9e
> GitHub：https://github.com/digitalsamba/claude-code-video-toolkit｜⭐ 2435｜授權：MIT（程式碼本身；但它呼叫的 Remotion、AI 模型、付費 API 各有自己的授權）｜主要語言：Python｜最近更新：2026-11-04

掃描方式：`git clone --depth 1 --filter=blob:none`，commit `a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc`；排除圖片／影音／字型後 checkout，全程只讀檔，沒有安裝或執行任何東西。檔案數用 `git ls-tree -r --name-only HEAD | wc -l` 計算：共 859 個檔案。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這不是一個「按一下就出片」的網站，而是一整套放在 Claude Code 裡的「技能（Skills）＋斜線指令＋Python 小工具＋影片範本」。你跟 Claude Code 說想要什麼影片，它會寫腳本、呼叫 TTS 配音、生圖／生影片、配樂、上字幕，最後用 Remotion（React）或 moviepy（Python）合成 MP4。

**對你（台灣小老闆、自己用 Claude 寫倉儲 App、有在投廣告）實際能做的事：**

1. **9:16 直式短影音（Reels／Shorts／TikTok）**：`templates/concept-explainer-short` 加 `tools/video_job.py` 就是「給一份分鏡 JSON → 自動配音、生畫面、上字幕、配樂、品管 → 輸出 MP4」的完整流水線，每支約 0.5～1 美元。很適合拿來做「商品知識型」短片，例如「為什麼這款收納箱不會變形？」。
2. **廣告素材**：Ideogram 4 擅長「圖裡的文字」，可以做標題卡、促銷卡、CTA 卡；LTX-2 可以把商品照片做成 5 秒動態鏡頭（image-to-video）。
3. **你自己倉儲 App 的教學／功能介紹影片**：`synthetic-ui-demo` 技能讓 Claude 讀你 App 的原始碼，把畫面重做成 React，再用程式控制游標和鏡頭「演」操作流程，不必螢幕錄影。這對「給員工看的操作教學」很實用。
4. **配樂／音效**：ACE-Step 生背景音樂（官方雲端 API 免費 key），`sfx.py` 做音效。
5. **把橫式影片切成直式**：`cutdown.py` 純 ffmpeg，把 16:9 影片轉 9:16／1:1／4:5。
6. **短劇**：**不適合**。它沒有角色一致性、多角色對話分鏡、劇本分場的設計，定位是「解說型影片」（作者自己寫的：explainer style video）。

---

## 2. 授權白話

- **工具箱本身：MIT**（`LICENSE` 第 1–3 行：`MIT License / Copyright (c) 2024 Digital Samba`，permalink：https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/LICENSE）。個人用、公司商用、改了閉源都可以，保留版權聲明即可。
- **但是它「接」的東西各自有授權，商用前要逐一確認：**
  - **Remotion（React 影片框架，大部分範本用它）**：repo 內沒有說明 Remotion 的授權（我用 grep 搜 `remotion.*licen` 找不到）。依一般認知 Remotion 是「特殊授權」：個人與小團隊免費、超過一定人數的公司要買公司授權——**未在本 repo 確認，商用前請到 remotion.dev 查最新條款**。純 Python 的 `concept-explainer-short` 範本不用 Remotion，可避開這個問題。
  - **FLUX.2 klein-4B**：Apache-2.0，可商用；**klein-9B 是 FLUX Non-Commercial 授權，只能非商業**（`docker/modal-flux2/app.py` 第 11–14 行寫得很清楚）。
  - **LTX-2.x**：LTX-2 Community License，年營收 1,000 萬美元以下免費、可商用，但**不能移除浮水印／來源標記**（`docker/modal-ltx2/app.py` 第 17–23 行）。
  - **SoulX-FlashHead**（說話頭像）：Apache 2.0（`tools/soulx.py` 開頭說明）。
  - **Ideogram 4**：付費 API，付費方案含商用授權（`tools/ideogram4.py` 第 11–12 行）。
  - **ElevenLabs、60db、acemusic.ai**：各家服務條款，未確認細節。
  - **Qwen3-TTS、ACE-Step 模型授權**：repo 沒寫明，**未確認**。
- **有沒有閉源／付費版才有的功能**：沒有看到。所有程式碼都在 repo 裡；花錢的地方是雲端 GPU（Modal／RunPod）與第三方 API。

---

## 3. 技術棧與執行需求

| 層 | 內容 | 依據 |
|---|---|---|
| 影片合成（主力） | Remotion 4.0.539（React + TypeScript） | `templates/product-demo/package.json` |
| 影片合成（輕量） | moviepy 2 + Pillow + numpy（純 Python） | `pyproject.toml`、`templates/concept-explainer-short/build.py` |
| 工具腳本 | Python ≥3.10，用 `uv` 管理；37 個 `.py` 工具（`ls tools/*.py \| wc -l`） | `pyproject.toml` |
| AI 模型部署 | Modal（`docker/modal-*/app.py`，9 個）或 RunPod（`docker/runpod-*`，7 個，Docker 映像） | `ls docker` |
| 檔案中轉 | Cloudflare R2（S3 相容）；沒設定就丟到公開暫存網站（見第 9 節風險） | `tools/file_transfer.py` |
| 錄影 | Playwright（瀏覽器自動化） | `playwright/scripts/record-demo.ts` |
| 資料庫 | **沒有**。專案狀態存在每個專案的 `project.json`，工作排程存在 `jobs/<id>/` 的 JSON 檔 | `lib/project/types.ts`、`tools/video_job.py` |
| 前端網頁 | **沒有**自己的網頁介面；操作介面就是 Claude Code（或 MCP 用戶端） | — |

**硬體**：本機只需要能跑 Node.js 22+ 與 Python 的一般電腦（README Requirements 段）。AI 模型全部在雲端 GPU 跑：Qwen3-TTS／音樂／放大／SadTalker 用 A10G，LTX-2 與圖片編輯用 **A100-80GB**（`docker/modal-ltx2/app.py` 第 349 行 `gpu="A100-80GB"`）。只有字幕的 whisper 可以本機跑（CPU 也行，會自動選 `base` 模型）。

**API Key 與費用（全部選填，`.env.example` 第 4–5 行：All keys are OPTIONAL）：**

| 項目 | 需要什麼 | 單價（程式內建價目表 `PRICES`，2026-11-01 版） |
|---|---|---|
| 配音 Qwen3-TTS | Modal 帳號＋部署 | 約 $0.01／場景 |
| 配音 ElevenLabs | `ELEVENLABS_API_KEY` | 約 $0.20／1000 字元 |
| 標題卡 Ideogram 4 | `IDEOGRAM_API_KEY` | $0.03／0.06／0.10 一張 |
| AI 影片 LTX-2 | Modal＋HuggingFace token（Gemma 權重需申請） | 約 $0.10／5 秒片段 |
| AI 圖 FLUX.2 | Modal | 約 $0.0075／張 |
| 字幕 | ElevenLabs Scribe（$0.40／小時音訊）或本機 whisper（免費） | |
| 音樂 | acemusic.ai 免費 key／Modal 約 $0.03 | |

價目表位置：https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py#L80-L102 。README 寫 Modal Starter 方案每月有 30 美元免費額度、一般用量每月 1–2 美元（作者說法，未實測）。

---

## 4. 程式架構地圖

```
claude-code-video-toolkit/
├── CLAUDE.md                 # 給 Claude Code 讀的總說明（915 行）——整個工具箱的「大腦」
├── .claude/
│   ├── commands/             # 15 個斜線指令：/video /setup /generate-voiceover /voice-clone /thumbnail /publish …
│   └── skills/               # 13 個技能資料夾（remotion、remotion-official、elevenlabs、ffmpeg、ltx2、ideogram4、
│                             #   acestep、qwen-edit、moviepy、runpod、playwright-recording、frontend-design、synthetic-ui-demo）
├── skills/video-toolkit/SKILL.md  # 給「任何 agent」用的通用技能（OpenClaw／Codex／MCP）
├── tools/                    # 37 個 Python CLI 工具（配音、生圖、生影片、音樂、字幕、QC、上傳…）
│   ├── video_job.py          # ★ 2505 行：brief/spec → MP4 的非同步工作流水線（含預算上限）
│   ├── video_mcp.py          # ★ MCP 伺服器，把 video_job 包成 8 個 MCP 工具
│   ├── voiceover.py          # 配音總入口：elevenlabs / qwen3 / 60db
│   ├── qwen3_tts.py          # Qwen3-TTS（9 個內建聲音、聲音複製、聲音設計）
│   ├── captions.py / align_captions.py  # 逐字時間軸字幕
│   ├── ltx2.py / chain_video.py         # AI 影片、多段接續
│   ├── flux2.py / ideogram4.py / image_edit.py / upscale.py  # 圖片
│   ├── music_gen.py / music.py / sfx.py / addmusic.py        # 聲音
│   ├── soulx.py / sadtalker.py          # 說話頭像
│   ├── qc.py / qc_layout.mjs / sync_timing.py / pacing.py    # 品管與時間對齊
│   ├── cutdown.py            # 橫轉直、剪短
│   ├── cloud_gpu.py / file_transfer.py / config.py           # 雲端 GPU 呼叫、檔案中轉、設定
│   └── youtube_upload.py     # 上傳 YouTube
├── templates/                # 6 個範本：sprint-review(v1/v2)、product-demo、ai-engineering-review、
│                             #   concept-explainer-short（純 Python 9:16）、ds-release-notes
├── lib/
│   ├── components/           # 14 個 Remotion 元件（Captions、Cursor、Stage、NarratorPiP、SplitScreen…）
│   ├── transitions/          # 7 個自製轉場（glitch、rgbSplit、zoomBlur、lightLeak…）
│   ├── theme/                # ThemeProvider
│   └── project/types.ts      # project.json 結構定義（多次工作階段的專案生命週期）
├── brands/                   # 品牌設定（brand.json 顏色字型、voice.json 聲音）
├── docker/                   # modal-*（9 個）與 runpod-*（7 個）模型部署檔
├── examples/                 # 9 個完成品專案
├── playwright/               # 瀏覽器錄影
├── scripts/                  # 移植到 Codex／Kiro 的腳本、版本檢查
└── tests/                    # Python 4 檔 66 個 test 函式、JS 1 檔 7 個 test（grep 'def test' / 'test(' 計算）
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| **一條龍流水線** | [tools/video_job.py#L1647-L1704](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py#L1647-L1704) | `run_pipeline()` 依序跑 voiceover → visuals → captions → music → build → qc → publish，每一步前 `check_budget()` 檢查預算；已產出的檔案會跳過，所以失敗可以 `resume` 只補缺的部分。 |
| **腳本（brief → 分鏡 spec）** | [tools/video_job.py#L733-L788](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py#L733-L788) | 工具本身**不內建 LLM**。`EXPANDER_INSTRUCTIONS` 是寫好的 prompt；`expand_brief()` 把 JSON 從 stdin 丟給環境變數 `VIDEO_JOB_EXPANDER` 指定的指令（文件範例：`claude -p --output-format text`），spec 驗證失敗會帶錯誤訊息再請 LLM 改一次。 |
| **分鏡格式** | [tools/video_job.py#L104-L117](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py#L104-L117) | `FORMATS` 定義 9:16（1080×1920）與 16:9；每個場景的 visual 只有 5 種：`ideogram`、`ltx`、`flux`、`text`、`none`。 |
| **配音** | [tools/video_job.py#L1328-L1384](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py#L1328-L1384) | 每場景寫一個 `.txt`，呼叫 `voiceover.py --scene-dir`，拿回每段秒數存成 `vo_durations.json`——**整支片的時間軸以配音長度為準**（audio-anchored）。 |
| **TTS 聲音清單** | [tools/qwen3_tts.py#L67-L91](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/qwen3_tts.py#L67-L91) | 9 個內建聲音，其中 5 個標示 Chinese（Vivian、Serena、Uncle_Fu、Dylan、Eric）；語氣預設 `warm/professional/excited/storyteller…` 轉成英文 instruct。 |
| **畫面生成** | [tools/video_job.py#L1387-L1462](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py#L1387-L1462) | `_visual_args()` 依 kind 組成 `ideogram4.py`／`ltx2.py`／`flux2.py` 參數；LTX 自動加負面提示詞，prompt 沒寫到人時會加「不要人」。 |
| **字幕** | [tools/captions.py#L57-L134](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/captions.py#L57-L134) | 用 Scribe 或 whisper 拿逐字時間，再用 `difflib.SequenceMatcher` 把「原稿文字」對齊到辨識結果，字幕拼法以腳本為準。 |
| **配樂** | [tools/video_job.py#L1522-L1542](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py#L1522-L1542)、[tools/music_gen.py#L1-L60](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/music_gen.py#L1-L60) | ACE-Step 1.5，預設走 acemusic.ai 官方雲端 API；支援 BPM、調性、歌詞、續寫、重畫片段、分軌；音樂失敗就跳過，影片照樣產出。 |
| **合成（Python）** | [templates/concept-explainer-short/build.py#L353-L456](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/templates/concept-explainer-short/build.py#L353-L456) | moviepy：圖片做 Ken Burns 緩慢縮放、影片片段 boomerang 補長度、場景之間交叉淡化、字幕逐塊貼 PNG、背景音樂循環＋音量 0.16＋尾端淡出，輸出 H.264。 |
| **合成（Remotion）** | [templates/product-demo/src/config/demo-config.ts](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/templates/product-demo/src/config/demo-config.ts) | 改一個 TypeScript 設定檔（標題、痛點、解法、數據、CTA 場景與秒數）就換內容，`npm run render` 出片。 |
| **雲端 GPU 呼叫** | [tools/cloud_gpu.py#L258-L330](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/cloud_gpu.py#L258-L330) | `call_cloud_endpoint(provider, payload, tool_name)` 統一處理 RunPod／Modal 的送出、輪詢、逾時、取消與費用估算。 |
| **MCP 伺服器** | [tools/video_mcp.py#L1-L60](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_mcp.py#L1-L60) | FastMCP stdio，8 個工具：`video_estimate／submit／status／result／resume／list_presets／list／cancel`；檔頭附 `claude mcp add` 指令。 |
| **品管** | [tools/qc.py#L1-L16](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/qc.py#L1-L16) | 檢查缺檔、旁白比場景長／短、語速、LUFS 音量、真峰值；`--layout` 會量字有沒有超出畫面、對比度是否達 WCAG AA。 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 非同步影片工作佇列（預算上限、可續跑、收據） | [tools/video_job.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py) | 純標準函式庫＋子程序呼叫其他工具 | 中 | 把 `run_pipeline` 的 step 換成你自己的函式（它本來就支援 `steps=` 注入）；預算/收據/鎖的設計可直接抄。 |
| brief→spec 的 prompt 與自我修正迴圈 | [tools/video_job.py#L733-L788](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py#L733-L788) | 任何 LLM CLI | 低 | 把 `EXPANDER_INSTRUCTIONS` 翻成中文、改成「商品賣點→分鏡」，用 `claude -p` 當 expander。 |
| 以配音長度驅動時間軸的 moviepy 合成器 | [templates/concept-explainer-short/build.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/templates/concept-explainer-short/build.py) | moviepy、Pillow、numpy、ffmpeg | 低 | 460 行單檔，讀 `scenes.json`＋`config.json`；換中文字型（見第 9 節）即可當你的直式短片產生器。 |
| 統一雲端 GPU 呼叫器 | [tools/cloud_gpu.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/cloud_gpu.py) | requests、Modal 或 RunPod 帳號 | 低 | 任何「送 JSON 給 GPU 端點、等結果」的工具都能共用。 |
| Modal 模型部署檔（TTS／FLUX／LTX／音樂） | [docker/modal-qwen3-tts/app.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/docker/modal-qwen3-tts/app.py)、[docker/modal-ltx2/app.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/docker/modal-ltx2/app.py) | Modal、HuggingFace | 中 | `modal deploy` 後得到一個 HTTPS 端點，其他專案（甚至你 Firebase 的 Cloud Functions）都能 POST 呼叫。 |
| 腳本對齊字幕 | [tools/captions.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/captions.py) | whisper 或 ElevenLabs | 中 | 演算法可用，但中文要改 `norm()` 與斷詞（見第 9 節）。 |
| Remotion 字幕元件（卡拉 OK 高亮） | [lib/components/Captions.tsx](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/lib/components/Captions.tsx) | Remotion | 低 | 吃 `@remotion/captions` 格式 JSON，放進任何 Remotion 專案。 |
| 7 個轉場特效 | [lib/transitions/](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/lib/transitions/README.md) | Remotion | 低 | 直接 import。 |
| 橫轉直／剪短 | [tools/cutdown.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/cutdown.py) | 只要 ffmpeg | 低 | 把既有橫式廣告片轉成 Reels 用，獨立可用。 |
| 合成 UI 示範影片技能 | [.claude/skills/synthetic-ui-demo/SKILL.md](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/.claude/skills/synthetic-ui-demo/SKILL.md) | Remotion、`Stage`／`Cursor` 元件 | 中 | 讓 Claude 讀你倉儲 App 的程式碼，做操作教學影片。 |
| MCP 包裝範例 | [tools/video_mcp.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_mcp.py) | `mcp` 套件 | 低 | 178 行，示範「CLI 工具 → MCP 工具」的最小包法，可套用到你的價格查詢工具。 |

---

## 7. AI／Claude 整合

- **Claude 是「原生」的**：整個專案就是為 Claude Code 設計——`CLAUDE.md`（915 行）、15 個 `.claude/commands/*.md` 斜線指令、13 個 `.claude/skills/` 技能資料夾。Claude 自己就是寫腳本與分鏡的 LLM，工具箱裡**沒有任何 Anthropic API 呼叫**（grep `anthropic` 在 `tools/*.py` 沒有結果）。
- **用到的模型**：TTS＝Qwen3-TTS 1.7B（CustomVoice／Base／VoiceDesign 三個權重，`docker/modal-qwen3-tts/app.py` 第 36–39 行）、ElevenLabs、60db；圖＝FLUX.2 klein、Ideogram 4／4.5、Qwen-Image 編輯；影片＝LTX-2.3（22B，可選 2.5）；音樂＝ACE-Step 1.5；頭像＝SoulX-FlashHead、SadTalker；字幕＝whisper、ElevenLabs Scribe；去浮水印＝ProPainter；放大＝Real-ESRGAN。
- **Prompt 放哪**：brief→spec 的 prompt 在 `tools/video_job.py` 的 `EXPANDER_INSTRUCTIONS`；Ideogram JSON caption 寫法在 `.claude/skills/ideogram4/`；LTX 提示詞指南在 `.claude/skills/ltx2/SKILL.md`；配音語氣預設在 `tools/qwen3_tts.py` `INSTRUCT_PRESETS`。
- **MCP**：有，`tools/video_mcp.py`（需 `uv sync --extra mcp`）。
- **其他 agent**：`skills/video-toolkit/SKILL.md` 給 OpenClaw／Codex／Hermes；`scripts/migrate_to_codex.py`、`migrate_to_kiro.py` 可移植到 Codex 與 Kiro CLI。
- **能不能換成 Claude**：本來就是 Claude。若不用 Claude Code、改用程式呼叫，設 `VIDEO_JOB_EXPANDER='claude -p --output-format text'` 即可（`docs/agent-video-jobs.md` 第 133–136 行）。

---

## 8. 擴充方式與 API

1. **加新範本**：`/template` 指令；每個範本是獨立 Remotion 專案或 Python 專案（`docs/creating-templates.md`）。
2. **加品牌**：`brands/<名稱>/brand.json`（顏色字型）＋`voice.json`（聲音），`/brand` 指令建立。
3. **加新 TTS 供應商**：在 `tools/voiceover.py` 的 `--provider` choices（第 184–188 行）加一個分支，參考 `generate_single_audio_60db()`。社群已有日文 VOICEPEAK 外掛做這件事（README Community add-ons）。
4. **加新 GPU 模型**：寫一個 `docker/modal-<名稱>/app.py`，工具端呼叫 `cloud_gpu.call_cloud_endpoint("modal", payload, "<名稱>")`，端點 URL 放 `.env` 的 `MODAL_<名稱>_ENDPOINT_URL`。
5. **程式介面**：`video_job.py` CLI（estimate／submit／status／result／resume／list／cancel／prune／spec／presets，全部支援 `--json`）、MCP 工具、每支工具都是獨立 CLI 並大多支援 `--json` 輸出。
6. **發布**：`youtube_upload.py`（OAuth）；社群外掛 Upload-Post 可一次發 TikTok／IG／FB／X 等（需該服務帳號，未驗證）。

---

## 9. 程式品質與風險

**維護狀況**：非常活躍。最新 commit 就在掃描當天（2026-11-04），`pyproject.toml` 版本 0.24.0，`_internal/CHANGELOG.md` 最新正式版 2026-11-01（v0.24.0），Unreleased 段已在升 Remotion 4.0.539。有 7 個 GitHub Actions workflow（docker-build、js-tests、lint-python、release、render-baseline、check-versions、sync-remotion-skills）。測試集中在 `video_job.py`（3 個測試檔共 63 個 test 函式），其他 30 多支工具幾乎沒有單元測試；lint 只擋「會當掉」的錯誤，workflow 註解自承約 800 個未使用 import 警告。

**資安／隱私**：
- **檔案會被上傳到公開暫存網站**：沒設定 Cloudflare R2 時，`upload_to_storage()` 會把你的圖片／音檔上傳到 `litterbox.catbox.moe`（保留 24 小時）或 `0x0.st`（保留 30 天）（[tools/file_transfer.py#L128-L170](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/file_transfer.py#L128-L170)）。商品未上市照片、自己的聲音樣本**務必先設定 R2**。
- 遙測：grep `posthog|telemetry|analytics|sentry|mixpanel` 在程式碼中沒有找到追蹤程式（只有範例文字 "ACME ANALYTICS"）。
- RunPod 用的是作者個人帳號 `ghcr.io/conalmullan/video-toolkit-*` 的預建 Docker 映像（`tools/qwen3_tts.py` 第 61 行），等於信任第三方映像；用 Modal 則是自己從 `app.py` 建置，比較可控。

**已知的坑（對中文使用者特別重要，我讀程式碼確認的）**：
1. **字幕對齊不支援中文**：`norm()` 用 `re.sub(r"[^a-z0-9']", "", w.lower())`（[tools/captions.py#L57-L58](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/captions.py#L57-L58)），中文字會全部被清空，腳本對齊會失效；語速計算 `count_words` 用空白切字，中文一句話會被當成一個字（`tools/pacing.py` 第 63–65 行）。
2. **Python 範本沒有中文字型**：`_FONT_CANDIDATES` 只有 Arial／Helvetica／DejaVu（[build.py#L71-L89](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/templates/concept-explainer-short/build.py#L71-L89)），中文標題與字幕會變豆腐方塊；`_wrap()` 也用空白斷行（同檔第 130–141 行），中文長句不會換行。要自己加 Noto Sans TC 並改成逐字斷行。
3. **brief→spec prompt 寫死英文**：`EXPANDER_INSTRUCTIONS` 要求 "plain spoken English"，字數預算 `WORDS_PER_SECOND = 2.4`（英文詞），中文要改成「每秒約 4–5 字」之類（數字為建議，未實測）。
4. LTX-2 需要 A100-80GB 與 Gemma 權重人工審核，第一次部署門檻高；LTX prompt 禁止出現螢幕、介面、人物等（被規則擋掉）。
5. 雲端 GPU 冷啟動會拉高成本（價目表註解提到 LTX 冷啟動 $0.077–0.169）。

---

## 10. 跟其他專案組合的建議

- **＋ 你自己的倉儲／價格資料（Firebase）**：寫一支小腳本，把商品名稱、賣點、價格、商品圖 URL 轉成 `video_job.py` 的 spec JSON（每個賣點一個場景，商品圖用 LTX image-to-video 或直接當 Ken Burns 背景），就能批次產出商品短片。這是本專案對你最直接的價值。
- **＋ 同分類其他資料包**：短劇方面，`chatfire-AI__huobao-drama`、`zenstory-ai__drama-skills`、`HKUDS__ViMax` 比較偏「劇本→分鏡→角色」；可以拿它們的劇本／角色一致性部分，配上本專案的「配音＋字幕＋合成＋預算控管」後段。
- **＋ 台灣中文配音**：本專案 Qwen3-TTS 有中文聲音與聲音複製；若要台灣腔，可用 `/voice-clone` 錄自己（或有授權者）的聲音當參考音（效果未確認）。或參考社群 VOICEPEAK 外掛的作法接入其他中文 TTS。
- **＋ 網頁版試算表類專案**：分鏡表本質上是一張表（場景、旁白、畫面類型、prompt、秒數）。可以用網頁試算表當「分鏡編輯器」，匯出 JSON 給 `video_job.py`。
- **拆法建議**：最划算的組合是「`concept-explainer-short/build.py`（改中文字型）＋ `cloud_gpu.py` ＋ `modal-qwen3-tts` ＋ `video_job.py` 的預算/續跑機制」，其餘 Remotion 範本視需要再加。

---

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有 | 位置與說明 |
|---|---|---|
| 輸入：主題 | 有 | `video_job.py submit --brief "..."`；需要 Claude 或 expander 展開（[L748-L788](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py#L748-L788)）。 |
| 輸入：商品圖 | 有（間接） | `ltx2.py --input photo.jpg` 做 image-to-video（[tools/ltx2.py#L1-L30](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/ltx2.py#L1-L30)）；`build.py` 可直接吃 `images/*.png` 做 Ken Burns。但 `video_job` 的 spec 沒有「自帶圖片」的 visual kind（只有 5 種生成類），自備素材要走範本手動流程。 |
| 輸入：小說 | 沒有 | 沒有長文本分場／角色設定功能。 |
| 輸入：自有素材 | 有 | 範本 `scenes.json` 的 `asset` 欄可放任何圖片／影片；Playwright 錄螢幕。 |
| 腳本 | 有 | Claude Code 依 `/video` 指令寫 `VOICEOVER-SCRIPT.md`；或 `EXPANDER_INSTRUCTIONS`。 |
| 分鏡 | 有 | spec 的 `scenes[]`（每場：旁白 text＋visual）；Remotion 範本用 config 定義場景。 |
| 畫面：素材庫 | 沒有 | 沒有接 Pexels 之類圖庫。 |
| 畫面：AI 生圖 | 有 | FLUX.2（約 $0.0075）、Ideogram 4（$0.03–0.10，圖內文字強）。 |
| 畫面：AI 生影片 | 有 | LTX-2.3，5 秒片段約 $0.10，A100-80GB；`chain_video.py` 以最後一格接續多段。 |
| 畫面：程式繪製 | 有 | Remotion React 元件與轉場、matplotlib 資料圖（`examples/data-viz-chart`）、synthetic-ui-demo。 |
| 配音：TTS | 有 | Qwen3-TTS（約 $0.01／場景）、ElevenLabs（付費）、60db（付費）。 |
| 配音：聲音複製 | 有 | Qwen3-TTS `--ref-audio/--ref-text`、`/voice-clone` 指令、`voice_prosody.py` 讓複製聲音更有起伏。 |
| 字幕 | 有（中文有坑） | `captions.py` 逐字時間軸；中文對齊與斷詞需改（見第 9 節）。 |
| 配樂 | 有 | ACE-Step（acemusic.ai 免費 key，或 Modal 約 $0.03）、ElevenLabs Music、`sfx.py` 音效。 |
| 合成 | 有 | moviepy（`build.py`）或 Remotion（`npm run render`）。 |
| 輸出 | 有 | MP4（H.264＋AAC），可設檔案大小上限；`cutdown.py` 轉 9:16／1:1／4:5；`youtube_upload.py` 上傳。 |
| 品管 | 有 | `qc.py` 音量、時間、語速、版面、對比度。 |
| 成本控管 | 有 | `estimate` 先報價、`--max-usd` 超過就拒絕、收據寫入 `receipts.jsonl`。README 範例：52 秒直式短片約 $0.80、57 秒展示片 $0.47。 |
| 中文（繁中、台灣口音）配音 | 未確認 | Qwen3-TTS 有 5 個 Chinese 內建聲音與 `--language chinese`，但是否台灣腔、繁體輸入效果如何，repo 沒有說明。聲音複製台灣人的參考音是最可能的路。 |
| 中文字幕 | 沒有（需改） | 字型與斷詞只考慮英文。 |
| Claude 怎麼用 | 有（原生） | Claude Code skills＋commands＋CLAUDE.md；MCP 伺服器；`claude -p` 當 expander；沒有直接呼叫 Anthropic API，也不依賴 OpenAI 相容介面。 |
| 個人電腦能不能跑 | 部分 | 合成、字幕（whisper CPU）、cutdown 可本機跑；AI 生成全部要雲端 GPU（A10G／A100-80GB），沒有本機 GPU 一鍵方案（`dewatermark.py` 等少數支援本機 NVIDIA GPU，`docs/optional-components.md` 未細讀）。 |
| 最適合做 | — | **解說影片**＞**廣告素材／電商商品知識短片**＞產品操作教學；**不適合短劇**。 |
| 法律風險 | — | ① FLUX klein-9B 非商用；LTX 不得移除浮水印；Remotion 公司授權需自查。② 聲音複製必須取得本人同意（`voice-clone.md` 中我沒找到 consent 相關字眼）。③ `dewatermark.py` 內建 Sora 浮水印預設（第 108 行），移除 AI 生成標記可能違反 OpenAI 條款與平台的 AI 內容標示規定，**不建議使用**。④ 商品圖丟給公開暫存站有外洩風險。⑤ 上架 Meta／TikTok 廣告要依平台規定標示 AI 生成內容（未在 repo 中確認）。 |

---

## 關鍵字
claude-code-video-toolkit、Claude Code、影片自動化、AI 影片、短影音、直式影片、Reels、Shorts、TikTok、解說影片、商品影片、廣告素材、腳本生成、分鏡、配音、TTS、Qwen3-TTS、ElevenLabs、聲音複製、voice clone、字幕、whisper、配樂、ACE-Step、LTX-2、FLUX.2、Ideogram、Remotion、moviepy、Modal、RunPod、雲端 GPU、MCP、Skills、斜線指令、video_job、預算控管、synthetic UI demo、操作教學影片、Cloudflare R2
