# chatfire-AI/huobao-drama — 「小說／一段文字 → 劇本 → 角色場景道具圖 → 分鏡 → AI 影片 → FFmpeg 拼接」的 AI 短劇一條龍工作台
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：5ac2a34
> GitHub：https://github.com/chatfire-AI/huobao-drama｜⭐ 16997｜授權：CC BY-NC-SA 4.0（GitHub 偵測為 NOASSERTION，實際 LICENSE 檔為 CC BY-NC-SA 4.0 全文）｜主要語言：TypeScript｜最近更新：2026-11-01

（以下所有 permalink 的前綴為 `https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/`，表格中為了易讀有時只寫路徑，但每個路徑都是我實際打開過的檔案。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：一個 Node.js（Hono）＋ Nuxt 3 的本機／桌面版短劇工作台，用 4 個 Mastra AI Agent 把小說改寫成劇本、抽出角色／場景／道具、拆分鏡並寫影片提示詞，再呼叫雲端 AI 生圖（GPT-Image／Gemini／Seedream）與生影片（Seedance 2.0／Wan 3.0／MiniMax H3），最後用 FFmpeg 把每個分鏡影片接成一集。

**對你（台灣小老闆、自己用 Claude 寫倉儲系統、有在投廣告）實際能用在：**
- **短劇／劇情式廣告**：把「產品故事」寫成一段短文 → 改寫成分場劇本 → 拆成 8–15 秒一段的分鏡 → 批次生影片 → 拼成 30–90 秒的劇情廣告。這是它最強的用途。
- **商品角色一致性**：它的「道具（prop）」概念＝劇情關鍵物件，可以把你的商品當道具，先生成一張「白底單品圖」當參考圖，之後每個分鏡都用 `@商品名` 掛參考圖，讓商品外觀在每段影片一致（見第 5 節）。
- **拆零件**：多家影片 API 的轉接層（adapter）、「建任務 → 輪詢 → 下載落地 → 中斷復原」的任務引擎、FFmpeg 拼接、`@角色名`／`#角色名` 提及（mention）輸入框，都可以拆到你自己的工具裡（第 6 節）。
- **不適合**：純「商品圖 → 15 秒帶貨短影片」的快速流程（它沒有商品圖直出影片的捷徑、沒有 TTS、沒有字幕、沒有配樂）；也和試算表、比價、ERP 完全無關。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **實際授權**：根目錄 `LICENSE`（438 行）是 Creative Commons **Attribution-NonCommercial-ShareAlike 4.0 International** 全文；`backend/package.json` 也寫 `"license": "CC BY-NC-SA-4.0"`；README 徽章同樣標 CC BY-NC-SA 4.0。GitHub 顯示 NOASSERTION 是因為 CC 授權不是它預設辨識的軟體授權。
  - [LICENSE](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/LICENSE)
- **個人使用**：可以。自己在電腦上跑、改程式碼、自己研究都沒問題（需保留署名）。
- **公司商用**：**NC（NonCommercial）＝不得用於「主要為商業利益或金錢報酬」的用途**。你是商家，用它來產出店裡的廣告影片、賣貨的短劇，很可能被認定為商業用途 → 嚴格來說**不行**，除非取得作者另外授權。CC 授權沒有針對「軟體輸出物」特別說明，所以「用它生成的影片能不能商用」本身是灰色地帶；保守做法是：**商用前寫信問 chatfire 拿商業授權，或只參考概念、自己用 Claude Code 重寫**。
- **SA（相同方式分享）**：你若改它的程式碼再散布，必須同樣用 CC BY-NC-SA 4.0 公開。**直接複製它的程式碼片段進你的倉儲系統**，在法律上會讓那部分沾染 NC 限制——想 A＋B＋C 組合商用時，這個專案的程式碼建議「看懂後自己重寫」，不要直接貼。
- **閉源／付費版**：程式碼本身沒有看到「付費才解鎖」的開關。但它和作者自家的 API 閘道 **FireMux（api.firemux.cn / .com）** 綁得很緊：設定頁有「火寶快捷配置」一鍵把文字／圖片／影片 7 組設定都指到 FireMux（[frontend/app/pages/settings.vue#L723](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/frontend/app/pages/settings.vue#L723) 與 #L774-L786），影片任務也會讀 `X-Firemux-Task-Id` 回應標頭做任務復原（[backend/src/services/generation.ts#L302-L303](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/generation.ts#L302-L303)）。這是它的商業模式：軟體免費、賣 API 額度。你也可以不用 FireMux，自己填官方 OpenAI／Gemini／火山引擎／阿里雲／MiniMax 的 Key。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 技術（皆從 package.json／程式碼確認） |
|---|---|
| 前端 | Nuxt 3（`ssr: false`，純 SPA）＋ Vue 3 ＋ vue-i18n ＋ lucide-vue-next ＋ driver.js（導覽教學）＋ vue-sonner（toast）；無 UI 框架、純 CSS（`frontend/package.json`、`frontend/nuxt.config.ts`） |
| 後端 | Node.js 20+、Hono 4（HTTP）、`tsx` 直接跑 TS、Mastra `@mastra/core` 1.17（Agent 框架）、Vercel AI SDK `@ai-sdk/openai`＋`@ai-sdk/google`、zod 4、pino 日誌、sharp（縮圖）、fluent-ffmpeg＋ffmpeg-static／ffprobe-static |
| 資料庫 | SQLite（better-sqlite3，WAL）＋ Drizzle ORM；我數 `backend/src/db/schema.ts` 裡 `sqliteTable(` 出現 18 次＝18 張表：dramas、episodes、characters、episode_characters、episode_scenes、episode_props、scenes、storyboards、storyboard_characters、storyboard_props、ai_service_configs、ai_service_providers、style_presets、sys_task、video_merges、props、assets、app_settings。可從舊版 MySQL 自動匯入。 |
| 桌面版 | Electron 37.x ＋ electron-builder（macOS dmg／Windows NSIS），內建自動更新器（sha256 校驗） |
| 部署 | ① 桌面安裝包（官方推薦）② 開發模式：後端 `:5679`＋前端 `:3013` ③ 單服務：前端 `nuxt generate` 後由後端供靜態檔 ④ Docker（`Dockerfile` 三階段＋`docker-compose.yml` 附 Watchtower 自動更新） |
| 硬體／GPU | **完全不需要 GPU**。所有生圖、生影片、LLM 都是呼叫雲端 API；本機只跑 Node、SQLite 和 FFmpeg（拼接時用 libx264 重新編碼，CPU 即可）。一般筆電就能跑。 |
| 必要 API Key | 三類各至少一個：**文字**（openai 相容／gemini／volcengine）、**圖片**（OpenAI gpt-image-2／Gemini 3 image／火山 Seedream）、**影片**（火山 Seedance 2.0／阿里雲百炼 Wan 3.0／MiniMax H3）。Key 存在 SQLite 的 `ai_service_configs` 表，不放環境變數。 |
| 費用 | **程式碼與 README 中沒有任何價格資訊 → 實際單價「未確認」**。結構上可以確定：文字模型便宜（每集幾次 Agent 呼叫）、圖片按張計（每個角色／場景／道具 1 張參考圖）、**影片是大宗**：每個分鏡段落 8–15 秒（[agents/index.ts#L80](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L80)），一集若 1 分鐘約 5 段，就是 5 次付費影片任務；失敗重試也會再計費。 |

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree -r --name-only HEAD` 共 288 個檔案；其中 `.ts/.vue/.mjs/.js` 共 155 個（含測試）；`backend/src/` 64 個檔案；測試檔 backend 22／frontend 13／desktop 4 個。最大的檔案（`wc -l`）：`frontend/app/views/drama/episode.vue` 6,239 行、`settings.vue` 1,839 行、`detail.vue` 1,635 行、`backend/src/services/generation.ts` 704 行。

```
huobao-drama/
├─ backend/                       後端（Hono + Mastra + Drizzle + SQLite）
│  ├─ src/index.ts                入口：掛路由、CORS、靜態檔、啟動時復原中斷任務
│  ├─ src/agents/
│  │  ├─ index.ts                 ★4 個 Agent 註冊、預設系統提示詞、getModel()（文字模型工廠＋請求補丁）
│  │  ├─ prompts.ts / skills.ts   從 workspace/ 讀 prompt 檔與 SKILL.md（可在 UI 線上編輯）
│  │  ├─ language.ts              內容語言指令（zh/en/ja/ko）
│  │  ├─ voice-reference-instructions.ts  #角色名 音色引用規則（注入提示詞）
│  │  └─ tools/                   Agent 工具：script / extract / storyboard / image-prompt
│  ├─ src/services/
│  │  ├─ ai.ts                    讀 DB 中的 AI 服務設定、官方供應商白名單
│  │  ├─ generation.ts            ★統一圖片／影片任務引擎（建任務→送出→輪詢→下載→回寫→復原）
│  │  ├─ adapters/                ★各家生圖／生影片 API 轉接層（registry + 6 個 adapter）
│  │  ├─ ffmpeg-merge.ts          ★整集拼接（concat + 重新編碼）
│  │  ├─ final-prompt.ts / video-prompts.ts / extraction.ts  批次跑 Agent 的背景工作
│  │  ├─ character-voice-references.ts / reference-audio.ts  角色音色參考音檔處理
│  │  ├─ style-preset.ts          畫風預設（英文提示詞前綴）
│  │  ├─ video-download.ts        下載上游影片並落地
│  │  └─ server-update.ts         版本檢查（讀 chatfire 的 latest.json）
│  ├─ src/routes/                 REST API（/api/v1/dramas、episodes、storyboards、tasks、merge、ai-configs、skills…共 18 個路由檔）
│  ├─ src/db/                     schema.ts（Drizzle）、sqlite-schema.ts（DDL）、MySQL 匯入
│  ├─ src/utils/                  ffmpeg 路徑、儲存、縮圖、影片封面、任務日誌
│  ├─ workspace/prompts/          4 個 Agent 的系統提示詞（中/英/日/韓各一份，共 16 檔）
│  ├─ workspace/skills/           Agent Skills（SKILL.md 格式，28 檔＝7 個技能 × 4 語言）
│  └─ tests/                      22 個結構性測試（多為 regex 檢查原始碼）
├─ frontend/                      Nuxt 3 SPA
│  ├─ app/pages/index.vue         專案列表
│  ├─ app/pages/settings.vue      AI 服務設定、FireMux 快捷配置、畫風、Agent/Skill 編輯
│  ├─ app/views/drama/detail.vue  劇集列表
│  ├─ app/views/drama/episode.vue ★單集工作台（劇本→資產→分鏡→影片→拼接，6,239 行）
│  ├─ app/components/MentionTextarea.vue  @／# 提及輸入框
│  ├─ app/utils/prompt-mentions.js         提及解析與高亮
│  └─ app/locales/                介面語言 zh（簡中）/en/ja/ko
├─ desktop/                       Electron 主行程、更新器、打包腳本
├─ Dockerfile / docker-compose.yml
└─ docs/video-delivery-implementation.md
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5-1 文字模型工廠（所有 Agent 共用）**
→ [backend/src/agents/index.ts#L295-L337](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L295-L337)
- 從 DB 取「啟用中、優先權最高」的文字設定；provider 為 `gemini` 用 `createGoogleGenerativeAI`，其餘一律 `createOpenAI(...).chat(model)`（OpenAI 相容）。
- 用自訂 `fetch` 疊三層補丁：①關閉 thinking（非官方端點才注入 `thinking:{type:'disabled'}`、`enable_thinking:false`、`reasoning_effort:'none'`，#L172-L224）②強制溫度（#L234-L253）③把 `max_tokens` 拉到 16384 避免工具呼叫被截斷（#L268-L293）。這套「中轉站相容補丁」很實用，可直接借鏡。

**5-2 四個 Agent 與預設提示詞**
→ [backend/src/agents/index.ts#L24-L153](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L24-L153)、註冊 [#L379-L392](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L379-L392)
- `script_rewriter`：小說 → 格式化劇本（`## S編號 | 內景/外景 · 地點 | 時間段`，每場 30–60 秒）。
- `extractor`：抽角色（appearance 樣貌＋styling 妝造）、場景（prompt＋lighting）、道具（嚴格「三問」篩選，每集 0–3 個），並與既有資料**去重合併**。
- `storyboard_breaker`：一個分鏡＝一個影片任務＝8–15 秒、內含 2–4 個子鏡頭；時長公式「劇本字數 ÷ 500 字/分鐘」、台詞下限「字數 ÷ 4.5 字/秒 + 2 秒」；`video_prompt` 每 3 秒一行。
- `prompt_generator`：寫角色三視圖／場景／道具白底圖的最終提示詞，以及分鏡影片提示詞。
- 系統提示詞＝`workspace/prompts/<type>.md`（缺檔用程式內預設）＋該 Agent 的 SKILL.md 全文＋音色規則＋語言指令（[#L352-L365](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L352-L365)）。

**5-3 Agent 工具（讀寫資料庫）**
- 劇本：[backend/src/agents/tools/script-tools.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/tools/script-tools.ts)（`read_episode_script`、`save_script`）
- 抽取去重：[extract-tools.ts#L172-L245](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/tools/extract-tools.ts#L172-L245)（`save_dedup_characters`，同名合併）
- 分鏡：[storyboard-tools.ts#L116](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/tools/storyboard-tools.ts#L116)（`read_storyboard_context`）、[#L262](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/tools/storyboard-tools.ts#L262)（`save_storyboards`，每批 ≤8 段、第一批 `replace_existing`）
- 圖片提示詞：[image-prompt-tools.ts#L59-L60](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/tools/image-prompt-tools.ts#L59-L60)：存檔時自動把畫風前綴（[style-preset.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/style-preset.ts)）接到最前面。

**5-4 統一生成任務引擎（圖片＋影片）**
→ [backend/src/services/generation.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/generation.ts)
- `generateImage` #L76、`generateVideo` #L114 → `createTask` 寫入 `sys_task` → `processTask`（[#L219-L300](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/generation.ts#L219-L300)）用 adapter 組請求 → 同步完成或 `pollTask`（#L379，圖片 5 秒×120 次、影片 10 秒×300 次，#L31-L34）→ 下載到本機 `data/static` → 回寫角色／場景／分鏡表。
- **斷線復原**：服務重啟時 `resumeInterruptedTasks`（[#L585-L596](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/generation.ts#L585-L596)）會對已拿到上游 taskId 的影片任務繼續查詢，避免「錢花了、影片沒拿到」。這段設計很成熟。

**5-5 供應商轉接層（Adapter 模式）**
→ 介面 [adapters/types.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/types.ts)、註冊表 [adapters/registry.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/registry.ts)
- 每家只實作 `buildGenerateRequest / parseGenerateResponse / buildPollRequest / parsePollResponse / extractXxxUrl` 五個方法。
- 火山 Seedance 2.0：[volcengine-video.ts#L40-L93](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/volcengine-video.ts#L40-L93)，只收 `doubao-seedance-2-0*`，多模態參考（圖 ≤9、影片 ≤3、音訊 ≤3），`generate_audio` 讓模型**直接生成含對白聲音的影片**，4–15 秒，480p/720p。
- 阿里 Wan 3.0：[aliyun-wan-video.ts#L94-L160](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/aliyun-wan-video.ts#L94-L160)，把內部 `@圖片N` 轉成官方 `圖N`。
- MiniMax H3：[minimax-video.ts#L52-L125](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/minimax-video.ts#L52-L125)。
- 圖片：[openai-image.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/openai-image.ts)（預設 `gpt-image-2`，有參考圖時改走 `/v1/images/edits` multipart）、[gemini-image.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/gemini-image.ts)（預設 `gemini-3-pro-image`，回傳 base64）、[volcengine-image.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/volcengine-image.ts)（預設 `doubao-seedream-5-0-260128`）。

**5-6 參考圖一致性：`@名字` → `@圖片N名字`**
→ [frontend/app/views/drama/episode.vue#L3298-L3311](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/frontend/app/views/drama/episode.vue#L3298-L3311)（`resolveVideoPromptRefs`）、送出 [#L3366-L3383](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/frontend/app/views/drama/episode.vue#L3366-L3383)（`genVid`）
- 分鏡綁定的角色／場景／道具圖依序成為 `reference_image_urls`，提示詞裡的 `@林小雨` 被換成 `@圖片1林小雨`，讓影片模型知道「哪張圖是誰」。這就是你要讓「商品外觀固定」時要抄的核心技巧。

**5-7 角色音色（#角色名）**
→ [backend/src/services/character-voice-references.ts#L7-L37](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/character-voice-references.ts#L7-L37)、[reference-audio.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/reference-audio.ts)、規則 [voice-reference-instructions.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/voice-reference-instructions.ts)
- 使用者為角色上傳 MP3/WAV/M4A/AAC 音檔（≤20MB），提示詞裡 `#林小雨輕聲說：「…」` 會轉成「林小雨（音色參考音訊1）」，音檔當 `reference_audio` 一起送給 Seedance／MiniMax，**由影片模型直接講出台詞**。不是傳統 TTS。

**5-8 整集拼接**
→ [backend/src/services/ffmpeg-merge.ts#L26-L148](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/ffmpeg-merge.ts#L26-L148)
- 依鏡號排序、可只拼勾選的鏡頭、先檢查 ffmpeg 與檔案存在；`concat` demuxer＋`libx264 crf 23`＋`aac 48k/192k`＋`+faststart`，最後抽封面。**沒有轉場、沒有字幕燒錄、沒有配樂混音**。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

> ⚠ 授權提醒：此專案為 CC BY-NC-SA 4.0。商用組合時建議「讀懂設計，請 Claude Code 依同樣概念重寫」，不要直接複製貼上。

| 元件 | 位置（permalink） | 依賴 | 拆出難度（低／中／高） | 怎麼接到別的專案 |
|---|---|---|---|---|
| 影片／圖片 Adapter 介面＋註冊表 | [adapters/types.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/types.ts)、[registry.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/registry.ts) | 無（純 TS 型別） | 低 | 當作你自己「多家 AI 影片 API」的統一介面；換掉某家只需新增一個 class |
| Seedance 2.0 影片 adapter | [volcengine-video.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/volcengine-video.ts) | `url.ts` | 低 | 可改寫成 Firebase Cloud Function：送任務、存 taskId 到 Firestore、排程輪詢 |
| Wan 3.0／MiniMax H3 adapter | [aliyun-wan-video.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/aliyun-wan-video.ts)、[minimax-video.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/minimax-video.ts) | `url.ts` | 低 | 同上，作為備援供應商 |
| 任務引擎（建任務→輪詢→下載→復原） | [generation.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/generation.ts) | Drizzle `sys_task`、storage、task-logger | 中 | 把 SQLite 換成 Firestore 集合 `tasks`，`runBackground` 換成 Cloud Tasks／排程；`resumeInterruptedTasks` 的復原邏輯一定要保留 |
| 中轉站相容的 LLM fetch 補丁 | [agents/index.ts#L172-L337](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L172-L337) | `@ai-sdk/openai`、`@ai-sdk/google` | 低 | 任何用 Vercel AI SDK 的專案都可套：關 thinking、固定溫度、拉高 max_tokens |
| 分鏡拆解提示詞（時長公式、3 秒一行） | [agents/index.ts#L76-L122](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L76-L122)、`backend/workspace/skills/storyboard-breaker/SKILL.md` | 無 | 低 | 直接改成 Claude Code skill 或 Claude API system prompt，用來寫廣告分鏡 |
| 角色三視圖／道具白底圖提示詞規範 | [skills/prompt-generator/character-prompt/SKILL.md](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/workspace/skills/prompt-generator/character-prompt/SKILL.md)、`prop-prompt/SKILL.md` | 無 | 低 | 拿來做「商品白底參考圖」與「代言人設定圖」 |
| `@名字`→`@圖片N` 參考圖映射 | [episode.vue#L3298-L3311](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/frontend/app/views/drama/episode.vue#L3298-L3311) | 無 | 低 | 純字串函式，可直接移到你的前端 |
| `#角色名` 音色引用解析 | [character-voice-references.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/character-voice-references.ts) | Drizzle（第二個函式） | 低（`resolveVoiceMentions` 是純函式） | 讓同一個代言人聲音在所有影片一致 |
| @／# 提及輸入框 | [MentionTextarea.vue](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/frontend/app/components/MentionTextarea.vue)、[prompt-mentions.js](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/frontend/app/utils/prompt-mentions.js) | Vue 3 | 中（若你是純 JS 需改寫成原生） | 你的倉儲系統若要在備註欄 @ 商品／@ 供應商，可借用高亮與下拉邏輯 |
| FFmpeg 拼接 | [ffmpeg-merge.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/ffmpeg-merge.ts) | fluent-ffmpeg、ffmpeg-static | 低 | 本機 Node 腳本即可；Firebase Functions 上跑 FFmpeg 可行但受記憶體／時間限制 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **用到的模型（設定頁預設清單，[settings.vue#L759-L786](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/frontend/app/pages/settings.vue#L759-L786)）**：文字 `gemini-3.8-flash`、`gemini-3.1-pro-preview`、`deepseek-v4-pro`、`gpt-5.6-terra` 等；圖片 `gpt-image-2`、`gemini-3-pro-image`、`gemini-3.1-flash-image`；影片 `doubao-seedance-2-0-*`（mini／fast／標準）、`wan3.0-video(-prime)`、`MiniMax-H3`。
- **官方供應商白名單**：[backend/src/services/ai.ts#L32-L36](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/ai.ts#L32-L36)：text 只認 `openai / gemini / volcengine` 三種 provider 名稱。**沒有 anthropic provider，程式碼內完全沒有 Anthropic SDK。**
- **Prompt 放哪**：程式內預設在 `backend/src/agents/index.ts`；實際生效的是 `backend/workspace/prompts/*.md`（frontmatter 只有 `name`、`model`）與 `backend/workspace/skills/**/SKILL.md`，可在設定頁「Agents」分頁線上編輯（`routes/skills.ts`、`agents/prompts.ts`）。
- **Skills**：用的是 Mastra 的 Workspace＋Agent Skills（SKILL.md、目錄名小寫加連字號），格式跟 Claude Code skill 很像，**可以幾乎原封不動搬成 Claude Code skills**（但注意授權）。**沒有 MCP server**。
- **換成 Claude 的兩條路**：
  1. **不改程式（未實測）**：設定一筆 provider=`openai`、Base URL=`https://api.anthropic.com`（程式會補成 `/v1`，[ai.ts#L43-L48](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/ai.ts#L43-L48)），走 Anthropic 的 OpenAI 相容端點，模型填 Claude 模型 ID。風險：它會對非官方主機注入 `thinking/enable_thinking/reasoning_effort` 參數，建議設環境變數 `AI_DISABLE_THINKING=false`；設定頁的連線測試會用 Bearer 打 `/v1/models`（[routes/aiConfigs.ts#L64-L70](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/routes/aiConfigs.ts#L64-L70)），可能測試失敗但實際可用——皆**未確認**。也可透過 OpenRouter 之類的 OpenAI 相容中轉站接 Claude。
  2. **改程式（建議，約 20 行）**：`npm i @ai-sdk/anthropic`，在 `getModel()`（[agents/index.ts#L322-L336](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L322-L336)）加 `if (providerName === 'anthropic') return createAnthropic({apiKey, baseURL})(modelName)`，並把 `'anthropic'` 加進 `officialProviders.text`。Mastra 原生支援 AI SDK 模型，工具呼叫（tool calling）可直接運作。
- **結論**：claude_support＝「可接」（文字部分）；圖片與影片仍需其他家。

## 8. 擴充方式與 API

- **REST API**：全部在 `/api/v1/*`（[backend/src/index.ts#L51-L71](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/index.ts#L51-L71)）：`dramas`、`episodes`、`storyboards`、`scenes`、`characters`、`props`、`tasks`（`POST /tasks` 建圖片／影片任務）、`merge`、`agent/:type/chat`（[routes/agent.ts#L32-L108](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/routes/agent.ts#L32-L108)，非串流、`maxSteps: 20`）、`ai-configs`、`skills`、`settings`、`storage`、`server-update`。前端呼叫封裝在 [frontend/app/composables/useApi.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/frontend/app/composables/useApi.ts)。→ 你可以寫腳本直接打 API 批次建專案、跑 Agent、生影片，不必點 UI。
- **新增影片供應商**：實作 `VideoProviderAdapter` → 加到 `registry.ts` → 加進 `ai.ts` 的 `officialProviders.video` → 前端 `settings.vue` 的 `providers` 陣列與 `providerPresets`。
- **新增 Agent／改流程**：在 `DEFAULT_PROMPTS` 與 `AGENT_TOOLS` 加一筆、在 `skills.ts` 的 `AGENT_SKILL_MAP` 加 skill 目錄。
- **改提示詞**：不必改程式，直接在設定頁編輯 `workspace/prompts` 與 `workspace/skills`（桌面版存在 userData 可寫副本）。
- **畫風**：`style_presets` 表，英文提示詞前綴，設定頁可管理。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：2026-01-05 建立，最近一次 push 2026-11-01，16,997 顆星，README 指向 v4.0.5 桌面安裝包，維護相當活躍。（淺層 clone 只有 1 個 commit，無法統計提交頻率與貢獻者數 → 未確認。）
- **測試**：39 個測試檔，但我抽看的 `backend/tests/remove-audio-tts-structure.test.mjs` 是用 regex 檢查原始碼「有沒有某字串」的結構測試，不是行為測試；行為正確性的保障有限。
- **架構風險**：`episode.vue` 單檔 6,239 行，前端邏輯高度集中，要改 UI 很吃力。
- **資安（重要）**：
  - **API 沒有任何登入驗證**；`GET /api/v1/ai-configs` 會把 `api_key` 原文回傳（`withParsedFields` 只是轉 snake_case，[routes/aiConfigs.ts#L21-L27](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/routes/aiConfigs.ts#L21-L27)、[#L119-L126](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/routes/aiConfigs.ts#L119-L126)）。CORS 只限 localhost，但 CORS 擋不住直接 curl。**絕對不要把伺服器版直接開在公網**，否則任何人都能拿走你的 Key、燒你的額度。
  - Skill 編輯 API 可寫入 workspace 目錄（Mastra `LocalFilesystem` 有 jail 到 workspace，[agents/skills.ts#L24-L28](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/skills.ts#L24-L28)），本機用沒問題。
  - Docker compose 預設 `WATCHTOWER_TOKEN: please-change-me` 且掛載 `/var/run/docker.sock`，若照抄上公網要改。
- **隱私／對外連線**：沒有找到 analytics／telemetry 套件（grep `telemetry|analytics|sentry|posthog|umami|gtag` 無結果）。對外連線只有：你設定的 AI 供應商、版本檢查（`installer.chatfire.site` 與 GitHub 的 `latest.json`，[server-update.ts#L16-L21](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/server-update.ts#L16-L21)）。若用 FireMux 快捷配置，你的劇本與圖片會經過作者的閘道。
- **已知的坑**：
  - 桌面安裝包**未簽章**，macOS 會顯示「已損壞」、Windows SmartScreen 會擋（README 有說明）。
  - Seedance 引用本機參考素材時需要 `PUBLIC_BASE_URL` 公網網址，桌面版沒有 → 該情境會報錯（README 自述）；Wan 3.0 的參考音檔也需要公網 URL（[reference-audio.ts#L17-L23](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/reference-audio.ts#L17-L23)）。
  - Seedance adapter 固定 `watermark: false`、解析度最高 720p（[volcengine-video.ts#L79-L81](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/adapters/volcengine-video.ts#L79-L81)）。
  - 介面語言只有簡中／英／日／韓；內容語言也是這四種（[agents/language.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/language.ts)），**沒有繁體中文**，提示詞與 SKILL 都是簡中寫成。
  - README 宣稱「FFmpeg 單鏡頭合成與字幕處理」，但現行程式只看到 concat 拼接；DB 有 `subtitle_url`、`bgm_prompt` 欄位（[db/schema.ts#L125-L134](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/db/schema.ts#L125-L134)）卻沒有產生字幕或配樂的程式（grep `subtitle|srt|字幕|tts|bgm` 在 `backend/src`、`frontend/app` 只有欄位定義）。
  - 舊版的 TTS（MiniMax TTS）、配音分派 Agent 已被**刻意移除**，有測試在守護「不得再出現」（`remove-audio-tts-structure.test.mjs`）。

## 10. 跟其他專案組合的建議

- **A（本專案）負責「劇本 → 分鏡 → 影片提示詞」與「影片任務管理」**；它最有價值的是 4 個 Agent 的提示詞設計和 adapter／任務引擎。
- **B 補「配音＋字幕」**：找有 TTS（例如支援台灣華語的雲端 TTS）與自動字幕（Whisper 類）的專案，產出 SRT 後用 FFmpeg `subtitles` 濾鏡燒入；這正是本專案缺的。
- **C 補「電商商品影片模板」**：找以商品圖＋賣點文字生成直式廣告的專案（程式繪製／模板式，如 Remotion 類），用來做大量 SKU 的短影片；本專案則留給「劇情型廣告」。
- **跟你的倉儲系統接**：把 Firestore 的商品資料（名稱、賣點、商品圖 URL）用 `POST /api/v1/dramas`＋`episodes` 帶入當「原始內容」，商品圖上傳成道具圖，自動跑 extractor → storyboard_breaker → 批次生影片。所有東西都在本機跑，Firebase 只要提供資料。
- **把 Agent 改成 Claude Code skills**：`workspace/skills/*/SKILL.md` 的結構與 Claude Code skill 相容度高，可以請 Claude Code 依同樣邏輯為「台灣電商廣告」重寫一套繁中 skill（自己寫、不複製原文，避開 NC/SA）。

## 11. 影片／腳本流程檢查表

| 項目 | 有／沒有／未確認 | 程式碼位置與說明 |
|---|---|---|
| 輸入：主題／一句話 | 有（間接） | 原始內容欄可以只放一句話，再跑 `script_rewriter`；但提示詞是設計給「小說改編」（[agents/index.ts#L25-L41](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L25-L41)）。 |
| 輸入：小說／長文 | 有 | 主要用法，`read_episode_script` → 改寫 → `save_script`（[script-tools.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/tools/script-tools.ts)）。 |
| 輸入：商品圖／素材 | 有（手動） | 可手動上傳角色／場景／道具圖當參考圖（[episode.vue#L3336-L3364](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/frontend/app/views/drama/episode.vue#L3336-L3364)）；沒有「丟商品圖自動出影片」的捷徑。 |
| 腳本 | 有 | `script_rewriter` Agent，輸出分場格式劇本。 |
| 分鏡 | 有 | `storyboard_breaker`，8–15 秒一段、含時長公式與台詞下限（[agents/index.ts#L76-L122](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L76-L122)）。 |
| 畫面：素材庫 | 有（自有素材） | `assets` 表與資產管理；沒有連外部圖庫（Pexels 之類）——grep 無相關程式。 |
| 畫面：AI 生圖 | 有 | OpenAI／Gemini／火山 Seedream adapter；角色三視圖、場景、道具白底圖。 |
| 畫面：AI 生影片 | 有 | Seedance 2.0／Wan 3.0／MiniMax H3，多模態參考圖。 |
| 畫面：程式繪製（模板動畫） | 沒有 | 無 Remotion／Canvas 模板類程式。 |
| 配音：TTS | 沒有 | 已移除（`backend/tests/remove-audio-tts-structure.test.mjs`）；改由影片模型 `generate_audio` 直接生成含對白的聲音。 |
| 配音：聲音複製 | 有（透過影片模型） | 上傳角色音檔當 `reference_audio`，Seedance／MiniMax 依音色說台詞（[character-voice-references.ts](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/character-voice-references.ts)）。效果取決於上游模型，未實測。 |
| 字幕 | 沒有 | 只有 DB 欄位 `subtitle_url`，無產生或燒錄程式。 |
| 配樂 | 沒有 | 只有 `bgm_prompt` 欄位，無生成或混音程式。 |
| 合成 | 有 | FFmpeg concat＋重新編碼（[ffmpeg-merge.ts#L88-L148](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/services/ffmpeg-merge.ts#L88-L148)），無轉場。 |
| 輸出 | 有 | MP4（H.264＋AAC），16:9 或 9:16（建專案時決定），可線上播放與下載。 |
| 各步驟模型／付費 | 有列出模型，費用未確認 | 文字：Gemini／OpenAI 相容（含 DeepSeek）／火山；圖片：gpt-image-2／Gemini 3 image／Seedream 5；影片：Seedance 2.0／Wan 3.0／MiniMax H3。**全部是付費雲端 API**，程式碼內無價格；影片任務是主要成本。 |
| 中文（繁中、台灣口音）配音與字幕 | 沒有（需自行處理） | 內容語言只有 zh（簡中）/en/ja/ko；可要求文字模型輸出繁中但提示詞與 SKILL 為簡中。台灣口音只能靠上傳台灣口音的參考音檔給影片模型，效果未確認；無字幕功能。 |
| Claude 怎麼用 | 可接（OpenAI 相容介面或小改程式） | 無 Anthropic SDK、無 MCP；有 SKILL.md 格式的 Agent Skills（Mastra），可轉成 Claude Code skills。詳見第 7 節。 |
| 個人電腦能跑嗎 | 可以，但只是「控制台」 | 不需 GPU，Node 20＋FFmpeg 即可；所有 AI 都呼叫雲端 API，不能離線生成。 |
| 最適合做 | **短劇 ＞ 劇情型廣告素材** ＞ 解說影片 ＞ 電商商品影片 | 為多角色、多場景、角色一致性設計；做單一商品的快節奏帶貨短片太重。 |
| 法律風險 | 需注意 | ①本專案 CC BY-NC-SA：商用受限。②改編小說需有版權。③生成「像某明星」的角色或上傳他人聲音當音色＝肖像權／聲音權風險。④Seedance adapter 關閉浮水印（`watermark:false`），但抖音、TikTok、YouTube、Meta 廣告都要求標示 AI 生成內容，請自行標註。⑤用 FireMux 或中國供應商時，內容會傳到境外伺服器，商業機密（新品）要小心。 |

## 關鍵字
火寶短劇、huobao-drama、chatfire、AI 短劇、短劇生成、劇本改寫、小說改編、分鏡、storyboard、影片提示詞、video prompt、角色一致性、三視圖、參考圖、Seedance 2.0、Wan 3.0、MiniMax H3、gpt-image-2、Gemini 3 image、Seedream、Mastra、Agent Skills、SKILL.md、Hono、Nuxt 3、Drizzle、SQLite、Electron、FFmpeg 拼接、音色參考、聲音複製、FireMux、CC BY-NC-SA 4.0、非商用授權、OpenAI 相容、Claude 可接、劇情廣告
