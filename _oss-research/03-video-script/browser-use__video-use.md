# browser-use/video-use — 把「剪片」變成 Claude Code 的 Skill：丟一資料夾原始素材，聊天就剪出 final.mp4

> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：43cfc56
> GitHub：https://github.com/browser-use/video-use｜⭐ 30532｜授權：MIT｜主要語言：Python｜最近更新：2026-10-08

（以下 permalink 的前綴都是 `https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/`。所有引用的檔案都是本次實際打開讀過的。行號以該 commit 為準。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：video-use 不是一個 App，而是一份給 Claude Code（或 Codex 等 coding agent）讀的 **Skill 說明書（`SKILL.md`）＋ 6 支 Python／ffmpeg 小工具**。它的核心想法是「LLM 不看影片，而是讀影片」：先用 ElevenLabs Scribe 把每支素材轉成「逐字＋時間戳」逐字稿，壓成一份約十幾 KB 的文字檔給 Claude 讀，由 Claude 決定要留哪幾段，寫成 `edl.json`（剪輯決策清單），再由 `render.py` 用 ffmpeg 一次剪好、調色、加字幕、音量標準化，最後 Claude 自己看「膠卷縮圖＋波形圖」檢查剪接點有沒有問題。

**對你（台灣小老闆、會投廣告）最實用的用途：**
- **口播廣告／開箱影片自動粗剪**：你對著手機講 5 次商品介紹，丟進資料夾跟 Claude 說「挑每段講最好的那次，剪成 30 秒直式廣告」，它會挑最佳 take、剪掉「呃、嗯」與停頓、補 30ms 淡入淡出避免爆音。
- **直播／長影片切短片**：把直播錄影的逐字稿交給 Claude 找亮點段落，剪成多支 Reels／Shorts 素材。
- **自動燒字幕＋音量標準化**：`render.py` 內建 -14 LUFS（社群平台標準音量）與字幕燒錄，適合大量產出投放素材。
- **學它的「設計模式」**：把影片轉成「可被 LLM 閱讀的文字＋按需截圖」這招，可以直接移植到你自己的工具（例如：商品影片素材庫、客服錄音整理）。

**它做不到的**：不會幫你從零生成腳本、不會 AI 生圖／生影片、主流程沒有 TTS 配音、沒有配樂生成。你必須**先有實拍素材**。

## 2. 授權白話

- **授權**：MIT（`LICENSE`，Copyright (c) 2026 Browser Use）。檔案：https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/LICENSE
- **個人使用**：完全自由，可以改、可以拆零件進你自己的工具。
- **公司商用**：也可以，包括放進要賣的產品或 SaaS；唯一義務是保留原本的版權聲明與 MIT 授權文字。不需公開你的原始碼。
- **閉源／付費版**：README 提到「Cloud-hosted video-use is coming」並導向 video-use.com 的等候名單（https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/README.md ）。repo 內**沒有**任何被鎖住或需付費解鎖的程式碼；雲端版會有什麼額外功能 **未確認**。
- **注意**：真正要花錢的是外部服務（ElevenLabs Scribe 轉錄、你的 Claude 訂閱／API），而這些服務的條款與 MIT 無關，要另外看。若用到 vendored 的 Manim／HyperFrames／Remotion，各自有自己的授權（Remotion 公司商用有自己的授權規則，**本 repo 內未說明，未確認**，用之前要查）。

## 3. 技術棧與執行需求

| 項目 | 內容 | 依據 |
|---|---|---|
| 語言 | Python ≥ 3.10 | `pyproject.toml` |
| Python 套件 | `requests`、`librosa`、`matplotlib`、`pillow`、`numpy`；選用 `manim` | https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/pyproject.toml |
| 必要外部程式 | `ffmpeg` + `ffprobe`（≥ 4.x）；選用 `yt-dlp` | `install.md` |
| 動畫引擎（選用、用到才裝） | HyperFrames（Node.js 22+）、Remotion（Node）、Manim（需 LaTeX）、或純 PIL | `SKILL.md` L201-L218 |
| 前端 | 無（`poster.html` 只是一張說明海報，用 Tailwind CDN） | `poster.html` |
| 後端／資料庫 | 無。所有狀態都是 `<影片資料夾>/edit/` 下的檔案（JSON、Markdown、mp4） | `SKILL.md` L37-L56 |
| 部署方式 | 本機 clone，symlink 到 `~/.claude/skills/video-use`，在素材資料夾開 `claude` | `install.md` L70-L88 |
| GPU | **不需要**。轉錄在雲端（ElevenLabs），剪接是 ffmpeg CPU 編碼（libx264） | `helpers/render.py` |
| API Key | **只需要 `ELEVENLABS_API_KEY`**（`.env.example` 只有這一行） | https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/.env.example |
| LLM | 不需另外的 API Key：「大腦」就是你正在用的 Claude Code／Codex 本身 | `README.md` |

**費用估計**：
- ElevenLabs Scribe：按音訊長度計費；repo 內**沒有寫價格（未確認）**，請以 ElevenLabs 官網為準。程式有兩個省錢設計：轉錄結果快取（同一檔案不重轉，`helpers/transcribe.py` L145-L148），以及上傳前偵測音軌是否「全靜音」，靜音就不上傳（L163-L173）。
- Claude：用你的 Claude Code 訂閱額度。因為只讀文字逐字稿＋少數 PNG，token 用量相對小（README 宣稱「12KB text + a handful of PNGs」，這是作者說法，未實測）。
- 動畫若走 HyperFrames／Remotion 會用到 Node 與無頭瀏覽器，耗本機 CPU，不額外收費。

## 4. 程式架構地圖

repo 很小：`git ls-tree -r HEAD` 共 **36 個檔案**；其中 Python 檔 9 支（helpers 6 支、tests 3 支）。helpers 6 支合計 **2,141 行**（`wc -l` 計算），頂層函式共 **47 個**（`grep -c "^def "` 計算：render.py 19、transcribe.py 8、timeline_view.py 7、pack_transcripts.py 6、grade.py 5、transcribe_batch.py 2）。

```
video-use/
├── SKILL.md                 ← ★ 整個專案的「大腦」：給 Claude 讀的剪輯規則、12 條硬規則、流程、EDL 格式（342 行）
├── install.md               ← 給 agent 讀的安裝腳本式說明（clone、ffmpeg、symlink、API key）
├── README.md                ← 介紹與設計理念
├── .env.example             ← 只有 ELEVENLABS_API_KEY=
├── pyproject.toml           ← 依賴清單（無 console script，helpers 直接 python 執行）
├── poster.html              ← 「LLM 怎麼理解影片」說明海報（靜態 HTML）
├── helpers/                 ← ★ 實際幹活的 6 支工具
│   ├── transcribe.py        ← 單檔：ffmpeg 抽音 → ElevenLabs Scribe → transcripts/<名>.json
│   ├── transcribe_batch.py  ← 整個資料夾 4 執行緒平行轉錄
│   ├── pack_transcripts.py  ← 逐字 JSON → 片語級 takes_packed.md（Claude 主要閱讀的檔案）
│   ├── timeline_view.py     ← 指定時間區間 → 膠卷縮圖＋波形＋字詞標籤 PNG（給 Claude「看」）
│   ├── render.py            ← EDL → 分段抽取＋調色＋淡入淡出 → 無損串接 → 疊動畫 → 字幕 → 音量標準化
│   └── grade.py             ← 調色預設與「自動微調色」（分析亮度／對比／飽和度）
├── skills/manim-video/      ← 內附的 Manim 動畫子 Skill（SKILL.md + 14 份 references + setup.sh）
├── tests/                   ← 3 支 unittest，共 26 個測試方法，只測 render.py
└── static/                  ← banner 與示意圖（未下載）
```

執行時產生的資料夾（不在 repo，在你的素材資料夾下）：`edit/project.md`（跨次記憶）、`takes_packed.md`、`edl.json`、`transcripts/`、`animations/slot_<id>/`、`clips_graded/`、`master.srt`、`verify/`、`preview.mp4`、`final.mp4`（`SKILL.md` L41-L56）。

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 讀 API Key | [transcribe.py#L36-L49](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe.py#L36-L49) | 先找 repo 根目錄 `.env`、再找目前目錄 `.env`、最後環境變數 |
| 抽音訊 | [transcribe.py#L74-L81](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe.py#L74-L81) | ffmpeg 轉單聲道 16kHz PCM WAV；`--audio-track` 可選音軌（OBS 錄影常見麥克風在第 2 軌） |
| 呼叫 Scribe | [transcribe.py#L84-L113](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe.py#L84-L113) | `model_id=scribe_v1`、`diarize=true`（分辨講者）、`tag_audio_events=true`（笑聲、掌聲）、`timestamps_granularity=word`；可帶 `language_code`、`num_speakers` |
| 靜音防呆 | [transcribe.py#L163-L173](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe.py#L163-L173) | 峰值 < -60 dBFS 就拒絕上傳，避免花錢轉錄空白音軌 |
| 平行轉錄 | [transcribe_batch.py#L78-L114](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe_batch.py#L78-L114) | 先篩掉已快取，再用 `ThreadPoolExecutor`（預設 4 workers）平行跑 |
| 逐字稿壓縮成片語 | [pack_transcripts.py#L38-L122](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/pack_transcripts.py#L38-L122) | 遇到靜音 ≥ 0.5 秒或換講者就斷句，每行前面加 `[start-end]`；這就是 Claude 選段的依據 |
| Markdown 輸出 | [pack_transcripts.py#L137-L162](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/pack_transcripts.py#L137-L162) | `## 檔名 (duration, N phrases)` + 每行 `[002.52-005.36] S0 文字` |
| 視覺檢查圖 | [timeline_view.py#L184-L330](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/timeline_view.py#L184-L330) | ffmpeg 抽 N 張縮圖 → PIL 拼成膠卷；下方畫 RMS 波形（[L68-L112](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/timeline_view.py#L68-L112)）、≥0.4 秒靜音區塗藍（[L135-L148](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/timeline_view.py#L135-L148)）、字詞標籤 |
| 分段抽取（剪接核心） | [render.py#L248-L314](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L248-L314) | 每段 `-ss` 快速定位、縮放到 1080p（直式自動以高度縮放）、套調色、加 30ms `afade` 淡入淡出（L285-L286）；品質分 final CRF20／preview CRF22／draft 720p CRF28 |
| HDR 轉 SDR | [render.py#L123-L146](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L123-L146) | 偵測 iPhone HLG／PQ，自動加 `zscale+tonemap`，避免上傳後顏色爆掉——**iPhone 拍商品很實用** |
| 直式偵測 | [render.py#L149-L186](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L149-L186) | 讀 ffprobe 的旋轉 side data 判斷直／橫 |
| 統一幀率 | [render.py#L341-L352](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L341-L352) | 全片用同一幀率（預設第一支素材的），才能無損串接 |
| 無損串接 | [render.py#L385-L401](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L385-L401) | ffmpeg concat demuxer + `-c copy`，不重新編碼 |
| 字幕切塊 | [render.py#L433-L465](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L433-L465) | 每塊約 2 字詞，遇標點／停頓 ≥0.3 秒斷，太短（<0.35 秒）就長到 3 字詞 |
| 產生 master.srt | [render.py#L468-L521](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L468-L521) | 依 EDL 把原素材時間換算成成片時間（`word.start - seg_start + seg_offset`），全部轉大寫 |
| 疊動畫＋字幕最後上 | [render.py#L633-L706](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L633-L706) | 每個 overlay 用 `setpts=PTS-STARTPTS+T/TB` 對齊時間、`enable=between(t,…)` 控制顯示區間；`subtitles` 濾鏡永遠最後，避免被動畫蓋住 |
| 字幕樣式 | [render.py#L52-L57](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L52-L57) | Helvetica 18 粗體、白字黑邊、`MarginV=90`（註解說明這是為了避開 TikTok／Reels 底部 UI） |
| 音量標準化 | [render.py#L527-L627](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L527-L627) | 兩階段 `loudnorm`：-14 LUFS、-1 dBTP、LRA 11（各社群平台標準） |
| 調色 | [grade.py#L38-L63](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/grade.py#L38-L63)、[L178-L271](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/grade.py#L178-L271) | 4 個預設（subtle／neutral_punch／warm_cinematic／none）；`auto` 模式用 `signalstats` 取樣亮度、對比、飽和度，產生上限 ±8% 的微調 `eq=` 濾鏡 |
| 剪輯決策（AI 部分） | [SKILL.md#L83-L104](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L83-L104)、[L127-L164](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L127-L164) | 沒有程式碼——由 Claude 依 SKILL.md 流程：盤點 → 預掃口誤 → 問你需求 → 提 4–8 句策略等你確認 → 派「剪輯子代理」輸出 EDL → 預覽 → 自我檢查（最多 3 輪） |
| 跨次記憶 | [SKILL.md#L309-L322](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L309-L322) | 每次結束在 `edit/project.md` 追加「策略／決策／理由／待辦」，下次開場先讀 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| Scribe 轉錄＋快取＋靜音防呆 | [helpers/transcribe.py](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe.py) | requests、ffmpeg、ElevenLabs Key | 低 | 整支複製即可。想換成 OpenAI Whisper API 或 Google STT，只要改 `call_scribe()` 並把回傳轉成同樣的 `words[]{type,text,start,end,speaker_id}` 格式 |
| 逐字稿 → LLM 可讀片語檔 | [helpers/pack_transcripts.py#L38-L162](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/pack_transcripts.py#L38-L162) | 純 Python | 低 | 任何「讓 Claude 讀錄音／影片內容」的工具都可用（客服錄音、直播稿）。中文建議把 L73 的 `" ".join` 改成不加空白 |
| EDL 渲染器 | [helpers/render.py](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py) | ffmpeg、grade.py（可選） | 低～中 | 其他會生成腳本／素材的專案（如 TTS＋素材拼貼型）最後一步都可以改輸出成這份 `edl.json`，交給它剪＋燒字幕＋標準化音量 |
| 30ms 淡入淡出＋無損串接模式 | [render.py#L248-L401](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L248-L401) | ffmpeg | 低 | 直接抄 ffmpeg 參數，是避免「剪接爆音」與「重複編碼」的標準作法 |
| 社群音量標準化 | [render.py#L527-L627](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L527-L627) | ffmpeg | 低 | 任何產片工具最後加一步，投廣告素材音量一致 |
| iPhone HDR → SDR | [render.py#L123-L146](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L123-L146) | ffmpeg（需含 zscale/libzimg） | 低 | 手機拍商品上傳前先過這段 |
| 字幕時間換算＋切塊 | [render.py#L433-L521](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L433-L521) | 純 Python | 中（中文要改） | 需加中文全形標點到 `PUNCT_BREAK`、拿掉空白與 `.upper()`、依字數而非詞數切塊 |
| 膠卷＋波形檢查圖 | [helpers/timeline_view.py](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/timeline_view.py) | ffmpeg、numpy、Pillow | 低 | 讓 Claude「看」影片任一段的低成本方式；中文要在 `FONT_CANDIDATES`（L154-L160）加入 CJK 字型 |
| 自動微調色 | [grade.py#L78-L271](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/grade.py#L78-L271) | ffmpeg | 低 | 商品影片批次「修到乾淨但不過度」 |
| Skill 寫法（硬規則＋流程＋子代理 brief） | [SKILL.md](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md) | Claude Code | 低 | 當範本寫你自己的 Skill（例如「倉儲盤點 Skill」）：「硬規則只寫正確性、其餘給自由」「先提策略等確認」「派平行子代理」「project.md 記憶」 |

## 7. AI／Claude 整合

- **模型**：
  - 語音轉文字：ElevenLabs **`scribe_v1`**（寫死在 [transcribe.py#L91](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe.py#L91)）。
  - 剪輯判斷：**執行它的 agent 本身**（Claude Code、Codex、Hermes、Openclaw，見 README）。程式裡**沒有**任何 Anthropic／OpenAI API 呼叫（用 `grep -rn "http"` 掃 `*.py`，唯一網址就是 Scribe）。
- **Prompt 放在哪**：全部在 Markdown：
  - [SKILL.md](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md)：12 條硬規則（[L18-L33](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L18-L33)）、流程、剪輯子代理 brief（[L127-L164](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L127-L164)，含「科技發表：HOOK → PROBLEM → SOLUTION → BENEFIT → EXAMPLE → CTA」等結構範本）、動畫子代理 brief 的 10 個要點（L257-L270）、評論子代理（「roast, not praise」，L101）。
  - [install.md](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/install.md)：給 agent 的安裝流程（含 frontmatter `name: video-use-install`）。
  - [skills/manim-video/SKILL.md](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/skills/manim-video/SKILL.md)：Manim 動畫子 Skill。
- **Skills**：有，**原生 Claude Code Skill**（`SKILL.md` 有 `name`／`description` frontmatter，安裝方式是 `ln -sfn ~/Developer/video-use ~/.claude/skills/video-use`，見 [install.md#L70-L88](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/install.md#L70-L88)）。
- **MCP**：沒有。
- **子代理**：SKILL.md 明確要求用 Claude Code 的 `Agent` 工具平行派子代理做動畫、剪輯選段、評論。
- **能不能換成 Claude**：本來就是為 Claude Code 寫的（pyproject 描述「Conversation-driven video editor skill for Claude Code」）。若想脫離 Claude Code、做成你自己的網頁服務，需要自己用 Anthropic API 重寫「讀 takes_packed.md → 產出 EDL JSON」這一步（SKILL.md 的子代理 brief 可直接當 system prompt）。

## 8. 擴充方式與 API

- **EDL JSON 就是 API**（格式見 [SKILL.md#L286-L307](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L286-L307)）：`sources`（素材路徑）、`ranges`（source／start／end／beat／reason）、`grade`（預設名、原始 ffmpeg 濾鏡或 `auto`）、`overlays`（動畫檔＋起始時間＋長度）、`subtitles`、`total_duration_s`。任何程式只要寫出這個 JSON，就能叫 `render.py` 出片。
- **CLI**：每支 helper 都是 `argparse` CLI，例如 `render.py <edl.json> -o out.mp4 --preview|--draft --build-subtitles --no-loudnorm --fps 30`（[render.py#L712-L797](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L712-L797)）。
- **調色擴充**：在 `PRESETS` dict 加一筆，或 `--filter '<任意 ffmpeg 濾鏡>'`。
- **字幕樣式**：改 `SUB_FORCE_STYLE` 常數（libass force_style 語法）。
- **動畫**：任何能輸出 mp4／webm 的工具都能當 overlay；官方建議 HyperFrames（HTML/GSAP）、Remotion（React）、Manim、PIL。
- **沒有** Python 套件化（`py-modules = []`、無 console script），也沒有 HTTP API／Web UI。

## 9. 程式品質與風險

- **維護狀況**：2026-04-12 建立，最後 push 2026-10-08（最新 commit #222，表示至少有兩百多個 PR／issue 編號），版本號仍是 `0.1.0`。由 Browser Use 公司維護，星數 3 萬多，活躍。
- **測試**：`tests/` 3 支檔、**26 個測試方法**（`grep -c "    def test_"`：captions 10、fps 10、orientation 6），只覆蓋 `render.py` 的字幕切塊、幀率、直式判斷；轉錄、打包、調色、timeline 沒有測試。repo 內沒有 CI 設定檔（檔案清單中無 `.github/`）。
- **隱私**：你的素材**音訊會上傳到 ElevenLabs**。影像本身不上傳，但 Claude 會讀逐字稿與截圖 PNG（送到 Anthropic）。客戶肖像、內部資料要留意。
- **遙測**：Python 程式內沒有遙測或分析碼（以 grep `http|telemetry|posthog|analytics` 確認，只有 Scribe 網址）。`poster.html` 會從 CDN 載 Tailwind 與 Google Fonts，但它只是海報，不參與流程。
- **資安**：這是讓 agent 在你電腦上自動跑 shell 指令的 Skill；`install.md` 會叫 agent 跑 `brew install`、`npx --yes hyperframes`、`npx create-video@latest`——**執行時從 npm 下載套件**，有供應鏈風險。建議 Claude Code 權限設成每次確認。
- **已知的坑（本次閱讀發現）**：
  1. **文件與程式不一致**：SKILL.md 說字幕 `MarginV=35`（[L188-L194](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L188-L194)），但 `render.py` 實際是 `MarginV=90`（L56）。以程式為準。
  2. **中文字幕**：`build_master_srt` 用空白串字並 `.upper()`（[render.py#L503-L507](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L503-L507)），`PUNCT_BREAK` 只有半形 `.,!?;:`（L407），中文全形「，。！？」不會斷句；字型寫死 Helvetica，沒有中文字形，要靠系統 fontconfig 自動替代（能否正確顯示**未確認**，建議改成 `Noto Sans TC` 或 `PingFang TC`）。
  3. **timeline_view 字型無 CJK**（L154-L160 只有 Menlo／Helvetica／DejaVu Mono），中文字詞標籤可能變方框，Claude 在檢查圖上看不到中文字。
  4. `librosa` 列為必要依賴，但程式碼完全沒 import（grep 只出現在註解），白白多裝一個大套件。
  5. `timeline_view.py --edl` 尚未實作（L355-L356）。
  6. `build_master_srt` 用 `transcripts/<source>.json` 找逐字稿，若當初用 `--audio-track 1` 轉錄（檔名會變 `.track1.json`），字幕會找不到而跳過（[transcribe.py#L116-L125](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe.py#L116-L125) vs render.py L487）。
  7. 品質高度依賴 LLM 照 SKILL.md 做事；「自我檢查」是 Claude 看圖判斷，不是程式自動驗證。

## 10. 跟其他專案組合的建議

- **video-use ＋ heygen-com/hyperframes**（同批已掃）：video-use 本身就把 HyperFrames 列為首選動畫引擎（`SKILL.md` L209、L214）。組合後：實拍口播 → video-use 剪 → HyperFrames 做價格標籤、商品特點卡、CTA 動畫疊上去。這是最自然的組合。
- **video-use ＋ TTS／素材拼貼型專案**（如同批的 MoneyPrinterTurbo、NarratoAI 等，細節請看各自資料包）：那些專案負責「主題 → 腳本 → 配音 → 素材」，最後一步改成輸出 `edl.json`，用 video-use 的 `render.py` 做無損剪接、字幕、音量標準化。
- **你自己的 Firebase 倉儲 App ＋ video-use**：把商品資料（名稱、價格、規格）匯出成 JSON → 給 Claude 當「商品脈絡」（剪輯子代理 brief 裡的 `Product/narrative context`）→ 自動在影片疊上正確價格卡。video-use 是本機 Python＋ffmpeg，不能直接在瀏覽器跑；網頁端只適合做「上傳素材、看 EDL、按出片」的介面，出片要在本機或伺服器。
- **借用設計模式**：「把媒體轉成 LLM 可讀的壓縮文字＋按需截圖」可用在任何 A+B+C 工具，例如把直播錄影轉成「商品 Q&A 清單」。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有 | 程式碼位置與說明 |
|---|---|---|
| 輸入 | **有（只接受實拍／現成影片）** | [transcribe_batch.py#L26-L34](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe_batch.py#L26-L34)：掃資料夾 mp4/mov/mkv/avi/m4v；`yt-dlp` 可抓線上影片（install.md）。不接受「主題」「商品圖」「小說」當輸入。 |
| 腳本 | **沒有（生成）**；有「從現有素材選段」 | 沒有生成腳本的程式。Claude 依 [SKILL.md#L127-L164](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L127-L164) 從逐字稿挑段落、按 HOOK→CTA 等結構重排。 |
| 分鏡 | **部分** | EDL 的 `ranges[].beat` 就是段落級分鏡（[SKILL.md#L286-L307](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L286-L307)）；沒有畫面級分鏡圖。 |
| 畫面 | **有：實拍素材＋程式繪製動畫**；沒有 AI 生圖／生影片、沒有素材庫 | 動畫用 HyperFrames／Remotion／Manim／PIL（[SKILL.md#L201-L218](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L201-L218)），由子代理現寫程式。 |
| 配音（TTS／聲音複製） | **主流程沒有** | 主流程無 TTS。只有 Manim 子 Skill 的參考文件提到 `manim-voiceover`（ElevenLabs、gTTS、Azure），見 [rendering.md#L134-L175](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/skills/manim-video/references/rendering.md#L134-L175)；那是文件範例，非本專案程式。 |
| 字幕 | **有** | Scribe 逐字時間戳 → [render.py#L433-L521](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L433-L521) 產 SRT → [L676-L680](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L676-L680) 燒進影片。 |
| 配樂／音效 | **只有規則，沒有程式** | [SKILL.md#L272-L280](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/SKILL.md#L272-L280)：音效少而準、人聲下壓音樂 -12～-15 dB、最終 -14 LUFS；實際混音由 Claude 臨場寫 ffmpeg 指令。音樂來源需自備。 |
| 合成 | **有** | [render.py#L633-L706](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L633-L706)：底片＋動畫疊加＋字幕最後。 |
| 輸出 | **有** | H.264 / AAC 48kHz MP4、`+faststart`；預設 1080p，直式自動以高 1920 縮放（[render.py#L270-L274](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L270-L274)）；兩階段音量標準化。 |

**每一步的模型／服務與費用**：轉錄＝ElevenLabs Scribe `scribe_v1`（付費，按音訊時長，單價未確認）；判斷＝Claude Code（你的訂閱）；剪接／調色／字幕／音量＝本機 ffmpeg（免費）；動畫＝HyperFrames／Remotion／Manim／PIL（本機、免費，Remotion 商用授權另計，未確認）。

**中文（繁中、台灣口音）配音與字幕**：
- 配音：主流程**沒有**。
- 轉錄：Scribe 支援自動偵測語言、可傳 `--language`（[transcribe.py#L201-L207](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe.py#L201-L206)）；對台灣口音國語的準確度、輸出是繁體還是簡體 **未確認**（repo 沒有任何中文測試或繁簡轉換）。若輸出簡體，需自行加 OpenCC 轉換。
- 字幕：**能跑但要改**——空白串字、全形標點不斷句、Helvetica 無中文字形（詳見第 9 節第 2 點）。改法：`PUNCT_BREAK` 加「，。！？、；：」，`" ".join` 改 `"".join`，拿掉 `.upper()`，`SUB_FORCE_STYLE` 換中文字型，切塊改成每塊 6–10 個中文字。

**Claude 怎麼用**：**原生 Claude Code Skill**（symlink 到 `~/.claude/skills/`），不呼叫 Anthropic API、也不需要 OpenAI 相容介面。

**能不能在個人電腦跑**：可以。不需 GPU；需要 ffmpeg、Python 3.10+、網路（呼叫 Scribe）。4K 素材會被縮到 1080p 再編碼，一般筆電即可，速度取決於 CPU。記憶體需求 repo 未寫（**未確認**），程式有刻意分塊讀 WAV 以免兩小時素材吃掉數百 MB（[transcribe.py#L62-L71](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/transcribe.py#L62-L71)）。

**最適合做**：**廣告素材（口播型）**與**解說影片／教學**最適合；**電商商品影片**適合「有人講解的開箱／示範」，不適合「只有商品圖、沒有實拍」；**短劇**不適合（沒有劇本生成、角色、AI 生影片）。

**法律風險**：
- 素材是你自己拍的，版權風險低；`yt-dlp` 抓別人的影片來剪會有版權與平台條款問題。
- 出現在畫面中的人（員工、客人）有肖像權，投放廣告前要取得同意。
- 音訊上傳 ElevenLabs、截圖送 Anthropic，涉及個資時要注意兩家的資料使用條款。
- 配樂、音效若用網路素材，要確認授權可用於商業廣告。

## 關鍵字

video-use、browser-use、Claude Code Skill、SKILL.md、AI 剪片、自動剪輯、口播剪輯、剪掉贅字、filler words、ElevenLabs Scribe、語音轉文字、逐字稿、word-level timestamps、講者辨識、diarization、EDL、edit decision list、ffmpeg、無損串接、concat demuxer、燒字幕、SRT、libass、調色、color grading、HDR 轉 SDR、tonemap、loudnorm、-14 LUFS、音量標準化、timeline_view、膠卷縮圖、波形、HyperFrames、Remotion、Manim、子代理、parallel sub-agents、直式影片、Reels、Shorts、廣告素材、開箱影片、MIT 授權、Python
