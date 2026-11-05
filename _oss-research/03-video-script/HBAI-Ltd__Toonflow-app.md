# HBAI-Ltd/Toonflow-app — 用「無限畫布＋AI Agent＋可換模型」做短劇／漫劇的本機創作平台，原生支援 Claude 與 MCP
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：ecd5325
> GitHub：https://github.com/HBAI-Ltd/Toonflow-app｜⭐ 20452｜授權：MIT（v2.x 起；舊版曾為 AGPL-3.0 與 Apache-2.0＋附加協議）｜主要語言：Vue（實際程式以 TypeScript 為主）｜最近更新：2026-11-04

（permalink 前綴：`https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/`。下文所有路徑都是我實際打開過的檔案；HEAD commit 時間為 2026-11-02，訊息為「docs: 更新微信交流群二维码」。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** Toonflow 是一個「畫布式」AI 影片工作室：在一張無限畫布上放文字（劇本）、圖片（角色／場景／商品）、影片、音訊節點，用連線把參考素材接到「生圖／生影片」節點，再由內建 AI Agent（可用 Claude）照著一份很長的 Seedance 導演 SKILL 自動寫分段提示詞、建節點、送出生成。

**對你（台灣小老闆、會用 Claude Code、有在投廣告）實際能做的事：**
- **電商商品短影片／廣告素材**：把商品照片放進畫布當「商品參考」，讓 Agent 寫 15 秒內的分段提示詞，送 Seedance 2.0/2.5、Wan3.0、MiniMax-H3 生影片。workflow SKILL 裡有專門處理「商品包裝文字不可被 AI 改寫」「商品圖每段重複綁定」的規則（見第 5 節）。
- **短劇／漫劇**：小說或一句話創意 → 劇本 → 角色／場景／道具資產圖 → 分鏡表 → 分段影片。這是它的本業。
- **用 Claude Code 遙控它**：它內建 MCP 伺服器（`http://127.0.0.1:10588/mcp`），Claude Code 連上後可以讀寫畫布、建節點、觸發生成、管理技能與模型供應商。你可以「在 Claude Code 裡講話，Toonflow 畫布上自動長出節點」。
- **拉片分析競品廣告**：內建「逐帧拉片」節點，本機（不需 GPU、不需 API）就能把一支影片切成鏡頭、輸出每鏡關鍵影格、片段 MP4 和原音軌，可選用 LLM 寫逐鏡說明。很適合拆解別人的爆款廣告。
- **拆零件**：媒體供應商 adapter 介面（含估價 `getPrice`、查餘額 `getBalance`）、FFmpeg 剪輯工具、場景切換偵測器、Seedance 提示詞 SKILL，都可以單獨拿去用。

**不適合：** 它不是試算表、也不是比價／ERP 工具（和你的第 1、2 項興趣無直接關係）；它沒有內建 TTS 配音、沒有字幕燒錄、沒有多片段時間軸剪輯成片（見第 11 節）。

## 2. 授權白話

- **現行授權：MIT**（[LICENSE](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/LICENSE)，Copyright (c) 2026 HBAI-Ltd）。`package.json` 的 `license` 欄也是 `MIT`。
- **個人使用**：完全可以，免費、可改、可自架。
- **公司商用**：MIT 允許商用、修改、閉源再散布，唯一義務是保留著作權與授權聲明。把它的程式碼片段拆進你自己的倉儲管理／影片工具也沒問題，記得在原始碼或「關於」頁保留 MIT 聲明。
- **歷史授權要注意**：README 第 464 行的「不追溯條款」寫明：v1.0.8 以前的版本仍是 **AGPL-3.0**，v1.0.8～v1.1.8 是 **Apache-2.0＋附加協議**。所以**只能從 v2.x（本次掃描的 master）拿程式碼**，不要去翻舊版 release 抄。
- **閉源／付費部分**：程式本身沒有閉源模組，但有一個**官方付費模型平台「Toonflow 帳號」**（`api.toonflow.net`，有登入、錢包、儲值方案、點數消耗、子帳號等 API，見 `apps/server/src/utils/channel/toonflow.ts`）。內建 Agent 的系統提示詞第 29 行寫「未指定供应商则默认使用 Toonflow」，也就是預設會引導你用官方付費模型；你可以完全不登入，只填自己的 API Key。另有合作夥伴「智星雲」提供「官方授權的商用映像檔」（README 4.5 節），屬於代管服務，不影響 MIT。
- **生成內容的版權**：由你使用的模型服務（ByteDance Seedance、OpenAI、Google 等）條款決定，見第 11 節法律風險。

## 3. 技術棧與執行需求

| 項目 | 內容（皆從 package.json／Dockerfile 確認） |
|---|---|
| 執行環境 | **Bun 1.4.3**（`packageManager: bun@1.4.3`），monorepo workspaces：`apps/*`、`packages/*`、`packages/nodes/*`、`packages/tools/*`、`packages/teams/*`、`packages/ext/*` |
| 前端 | Vue 3.5、Vite、Element Plus、TDesign、**@vue-flow/core**（無限畫布）、Tiptap 3（文件編輯器，含 table 擴充）、three.js（3D 導演台）、echarts、dockview-vue、artplayer（播放器） |
| 後端 | Express 5、zod 4、`conf`（JSON 設定檔）、undici、`@earendil-works/pi-ai` / `pi-coding-agent` 0.85.1（Agent 與多家 LLM 協定的 SDK，專案有打 patch） |
| 資料庫 | **沒有資料庫**。設定存在 `data/settings.json`（`conf` 套件，檔案權限 0600，見 [utils/conf/index.ts#L11-L21](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/conf/index.ts#L11-L21)）；專案就是 `data/workspaces/<專案>/` 底下的檔案，畫布是開頭帶 `"toonflowCanvas": true` 的 JSON 檔（[canvasFile.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/web/src/pages/workspace/canvasFile.ts)），生成的媒體放 `assets/generated`。 |
| 桌面／行動 | Electrobun 桌面版（Windows、macOS Apple Silicon，另有 macIntel 相容層）、Android ARM64 APK（手機內建 Bun 後端）、HarmonyOS 相容層（`compat/ohos`） |
| 部署方式 | ① 下載桌面版安裝 ② `docker compose up -d --build`（[compose.yaml](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/compose.yaml) 只綁 `127.0.0.1:3000`，映像內含 FFmpeg） ③ Linux 直接 `bun run build:server && bun run start:server` |
| 硬體／GPU | **不需要 GPU**。所有生圖、生影片都是呼叫雲端 API；FFmpeg 剪輯、拉片在本機 CPU 跑。README 提到也可接本機 ComfyUI 與本機 LLM（那時才需要你自己的 GPU）。 |
| 需要的 API Key | ① 語言模型：任一家 OpenAI Completions／OpenAI Responses／**Anthropic Messages** 相容服務（[utils/ai/index.ts#L27-L39](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/ai/index.ts#L27-L39)） ② 媒體模型：內建 adapter 只有 APIMart、優雲智算 compshare、秘塔 metaso 三家（皆為中國平台）＋DeepSeek 語言模型；其他平台要自己寫／從外掛市集裝 adapter。 |
| 大概費用 | README 的官方案例（第 424–432 行）：2 分鐘成片、約 2 小時製作，Claude Opus 4.6＋GPT Image 2＋Seedance 2.0，**總計約人民幣 130 元**（語言約 10、影片約 120、圖片不到 1）。贊助商自報價：MiniMax H3 768P 約人民幣 0.08～0.09 元／秒、GPT-Image-2 約 0.006 美元／張（廣告文字，未驗證）。**影片才是主要成本**。 |

## 4. 程式架構地圖

（數字為我用 `git ls-tree` 檔案清單與 `wc -l` 自行計算：全倉 1,018 個檔案；`.ts`＋`.vue` 698 個，合計約 93,805 行；`apps/server/src/routes` 下 185 個路由檔；測試檔 0 個。）

```
Toonflow-app/
├─ apps/
│  ├─ server/src/            後端（Express on Bun）
│  │  ├─ index.ts / app.ts / router.ts   啟動、掛路由、啟動 MCP（index.ts L24-L28）
│  │  ├─ agent/runtime/      內建 AI Agent：prompt.ts（系統提示詞）、model.ts（建立模型）、sessions.ts、subAgent.ts、agentTeam.ts
│  │  ├─ agent/tools/        Agent 可用工具（讀寫檔、畫布、媒體生成、FFmpeg、沙盒、瀏覽器、MCP 工具）
│  │  ├─ agent/skills/       讀取 SKILL.md 的技能載入器
│  │  ├─ routes/             185 支 API：ai/media（生成、估價、餘額、任務）、providers、skills、mcp、ffmpeg、workspaces、channel（官方帳號／錢包）…
│  │  └─ utils/
│  │     ├─ ai/              LLM 供應商設定、三種協定、模型列表抓取、context 上限表
│  │     ├─ media/           媒體供應商載入（VM 沙盒）、生成、任務續傳、計價、餘額
│  │     ├─ mcp/             MCP 伺服器：tools.ts、operations.ts、runtime.ts、dxt.ts（匯入 .dxt 擴充）
│  │     ├─ ffmpeg/          工作區內的 FFmpeg 執行
│  │     └─ channel/toonflow.ts  官方付費平台 API 客戶端
│  ├─ web/src/               前端（Vue 3）
│  │  ├─ pages/workspace/panels/canvas/   無限畫布（index.vue 1,441 行、歷史紀錄、對齊、剪貼簿）
│  │  ├─ pages/workspace/panels/document/ Tiptap 文件編輯器、檔案樹
│  │  ├─ components/agent/   對話介面、@ 提及素材、語音輸入
│  │  ├─ components/settings/panels/      語言模型、媒體模型（含「AI 幫你寫 adapter」提示詞）、MCP、外掛市集、隱私
│  │  └─ lib/anonymousData.ts            匿名使用統計（預設開啟，見第 9 節）
│  ├─ desktop/ mobile/ updateServer/     桌面殼、Android、更新伺服器
├─ packages/
│  ├─ providers/             媒體／語言供應商 adapter＋型別定義（types.d.ts）
│  ├─ nodes/                 9 個畫布節點：text、image、video、audio、imageGeneration、videoGeneration、audioGeneration、director3d、frameAnalysis
│  ├─ nodeScaffold/ nodeShared/   節點外掛 SDK 與共用元件（提示詞輸入、參考素材、價格顯示）
│  ├─ tools/                 10 個 Agent 工具外掛：askUser、assetOperator、browser、canvas、ffmpeg、sandbox、skillOperator、webFetch、webSearch、workspace
│  ├─ skills/                內建技能：workflow（1,406 行主流程）、v118workflow（舊版分集流程＋知識庫）、canvas
│  ├─ teams/storyboardTeam/  多 Agent 團隊（導演／編劇／審稿）
│  ├─ mcp/                   MCP 轉接包＋給外部 Agent 的 toonflow SKILL.md
│  ├─ ffmpeg/ asr/ file/ i18n/(21 語，含 zhTw) ext/ (5 個檔案檢視擴充)
├─ Dockerfile, compose.yaml, docs/readme/readmeZhTw.md（有繁中 README）
```

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 三種 LLM 協定（含 Claude） | [apps/server/src/utils/ai/index.ts#L1-L39](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/ai/index.ts#L1-L39)、[#L142-L146](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/ai/index.ts#L142-L146) | 用 `pi-ai` 的 `openAICompletionsApi`／`openAIResponsesApi`／`anthropicMessagesApi`，供應商只要宣告 `apiUrl`、`apiKey`、`protocol`、`models`。推理等級（thinking effort）會依模型自動對應，Anthropic 走 adaptive thinking。 |
| 抓模型列表（含 Anthropic 分頁） | [utils/ai/models.ts#L11-L46](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/ai/models.ts#L11-L46) | `anthropic-messages` 時送 `x-api-key`＋`anthropic-version: 2023-06-01`，用 `after_id` 分頁；其他協定用 Bearer。 |
| Claude 型號 context 上限表 | [utils/ai/modelContextLimits.ts#L53-L70](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/ai/modelContextLimits.ts#L53-L70) | 內建 claude-opus-5、claude-sonnet-5、claude-opus-4-6、sonnet-4-5、haiku-4-5 等的 context window／max tokens。 |
| 內建 Agent | [agent/runtime/model.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/agent/runtime/model.ts)、[agent/runtime/prompt.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/agent/runtime/prompt.ts) | 以 `pi-coding-agent` 的 `ModelRuntime` 動態註冊使用者設定的供應商；系統提示詞（中文）規定：製作任務先讀 `workflow` SKILL、生成前必須給出「對象、數量、模型、規格、完整提示詞、參考」並用 askUser 取得同意（第 34–38 行「消耗算力前的確認」）。 |
| 無限畫布 | [apps/web/src/pages/workspace/panels/canvas/index.vue](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/web/src/pages/workspace/panels/canvas/index.vue)（L143-L165 匯入 Vue Flow） | 建在 `@vue-flow/core` 上（專案有 patch），節點以 UMD 外掛動態載入（`loadNodeComponent.ts`），有復原／重做（`useCanvasHistory.ts`）。 |
| 媒體供應商 adapter | [packages/providers/types.d.ts#L203-L275](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/providers/types.d.ts#L203-L275) | 一個 adapter＝一個 TS 物件：`models[]`（每個模型宣告 mode、可用時長／解析度、是否支援音訊）、`generateImage/Video/Audio`、`resumeTask`（重開程式後續傳長任務）、`getPrice`（只估價不扣費）、`getBalance`。 |
| APIMart 範例 adapter | [packages/providers/src/media/apiMart.ts#L247-L303](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/providers/src/media/apiMart.ts#L247-L303) | 列出 seedance-2.5/2.0/fast/mini、wan3.0、MiniMax-H3、Seedream 5.0、gpt-image-2、Nano banana Pro/2。`videoPrompt()` 把提示詞中的 `{{ref 1}}` 轉成各模型要的「图片1／@图片1／Image 1」標記（L56-L85）。 |
| adapter 執行沙盒 | [apps/server/src/utils/media/provider.ts#L510-L560](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/media/provider.ts#L510-L560) | 把 adapter 原始碼轉譯後丟進 `node:vm` 的 `SourceTextModule`，禁止 import，只給 `this.tool.fetch/media/audio/ffmpeg`。註解明說「VM 只隔離可信供應商」，不是安全沙盒。 |
| 估價 API | [routes/ai/media/price.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/routes/ai/media/price.ts)、[utils/media/generation.ts#L208-L215](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/media/generation.ts#L208-L215) | 生成前先呼叫 adapter 的 `getPrice` 顯示「算力消耗」。注意：我 grep 內建三家媒體 adapter，**都沒有實作 `getPrice`**，所以用自己的 Key 時通常顯示「未知」。 |
| Seedance 導演 SKILL | [packages/skills/workflow/SKILL.md](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/skills/workflow/SKILL.md) | 1,406 行。A0 輸入判定、A0.1 劇情保真鎖、A1.2.1 Seedance 2.5 參考圖綁定（[#L217-L250](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/skills/workflow/SKILL.md#L217-L250)）、A1.3 字幕 vs 商品包裝文字（[#L251-L269](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/skills/workflow/SKILL.md#L251-L269)）、A3 分段與時長預算、A5 站位…直到 A12。Seedance 2.5 最終提示詞固定用 `Objective / Reference binding / Immutable locks / Timeline…` 英文欄位、中文內容。 |
| 分集流程＋知識庫 | [packages/skills/v118workflow/references/storyboardTable.md](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/skills/v118workflow/references/storyboardTable.md) | 分鏡表拆分方法：每片段上限 15 秒、台詞以 4 字／秒估算、超過 20 字拆鏡等。知識庫還有 scriptCraft、shotCraft、imagePromptCraft、videoPromptCraft、visualStyles、narrativeGenres。 |
| 多 Agent 團隊 | [packages/teams/storyboardTeam/team.json](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/teams/storyboardTeam/team.json) | director 委派 writer、reviewer，三者只給 `read`、`ls` 工具。 |
| MCP 伺服器 | [apps/server/src/utils/mcp/tools.ts#L59-L120](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/mcp/tools.ts#L59-L120)、[utils/mcp/operations.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/mcp/operations.ts) | `getAppState`＋7 個介面操作（openProject、writeDocument、updateSettings…）＋31 個管理操作（我用 `grep -o 'name: "…", description'` 數出：節點、工具、技能、媒體供應商、素材、Agent 會話的增刪改查）＋所有 Agent 工具（畫布、生成、FFmpeg…）都轉成 MCP 工具。預設關閉，Bearer 權杖保護，只聽 127.0.0.1。 |
| 給外部 Agent 的 SKILL | [packages/mcp/skills/toonflow/SKILL.md](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/mcp/skills/toonflow/SKILL.md) | 教 Claude Code 之類的外部 Agent：先 `getAppState`、改畫布要帶 `target.connectionId/directory/canvasId`、用 `nodeTools` 呼叫節點函數、不要直接寫畫布 JSON。 |
| 影片剪裁／分離音軌 | [packages/nodes/videoNode/src/videoProcessing.ts#L45-L87](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/videoNode/src/videoProcessing.ts#L45-L87) | 只有 `extractAudio`、`separate`、`trim` 三種動作，重編碼 H.264 CRF18，奇數邊補偶數。 |
| FFmpeg Agent 工具 | [packages/tools/ffmpeg/readme.md](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/tools/ffmpeg/readme.md) | 讓 Agent 以 JSON 描述 fluent-ffmpeg 呼叫（含 `concat`），沒有參數白名單。成片拼接、字幕燒錄理論上可由 Agent 自己下 FFmpeg 指令完成，但不是內建流程。 |
| 逐帧拉片（場景偵測） | [packages/nodes/frameAnalysisNode/src/sceneDetector.ts#L62](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/frameAnalysisNode/src/sceneDetector.ts#L62)、[readme.md](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/frameAnalysisNode/readme.md) | 純前端：每幀縮到 256px，分數＝75% RGB 空間差＋25% 色彩直方圖差，Adaptive 模式用近 1.2 秒中位數當動態門檻。可選 `aiAnalysis.ts` 呼叫 LLM 寫逐鏡說明。 |
| 3D 導演台 | [packages/nodes/director3dNode/readme.md](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/director3dNode/readme.md) | three.js 低多邊形人偶＋LLM 產生動作／運鏡，可匯出關鍵影格 PNG 與 MP4 當參考。 |
| AI 幫你寫 adapter | [apps/web/src/components/settings/panels/mediaModel/providerPrompt.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/web/src/components/settings/panels/mediaModel/providerPrompt.ts) | 一段給「完全不懂程式的使用者」的長提示詞，引導任一 LLM 一步一步問清楚 API 文件後產出 `.ts` adapter。你可以把它貼給 Claude 用來接你想要的影片平台。 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| Seedance 分段提示詞 SKILL | [packages/skills/workflow/SKILL.md](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/skills/workflow/SKILL.md) | 無（純 Markdown） | 低 | 放進 `.claude/skills/` 給 Claude Code 用；刪掉畫布操作段落（canvasExecution）即可只做「劇本 → Seedance 提示詞」。注意它是簡體中文，需要的話請 Claude 轉繁中並加「台灣用語」規則。 |
| 劇本／分鏡／提示詞知識庫 | [packages/skills/v118workflow/references/knowledge/](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/skills/v118workflow/references/knowledge/videoPromptCraft.md)（videoPromptCraft.md 等 7 檔） | 無 | 低 | 當 SKILL 的 references；imagePromptCraft 有「不要字幕、水印」的負面提示範本。 |
| 媒體供應商介面型別 | [packages/providers/types.d.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/providers/types.d.ts) | 無 | 低 | 你自己的影片工具若要接多家生圖／生影片平台，直接沿用這套 `generateVideo + resumeTask + getPrice + getBalance` 介面設計，換平台只換 adapter。 |
| APIMart／compshare adapter | [packages/providers/src/media/apiMart.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/providers/src/media/apiMart.ts) | `this.tool.fetch` 等宿主注入 | 中 | 把 `this.tool.fetch` 換成一般 `fetch`、`inspectImage` 換成你的圖片工具，就能在 Firebase Functions 或 Node 腳本呼叫 Seedance。 |
| LLM 三協定封裝 | [apps/server/src/utils/ai/index.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/ai/index.ts) | `@earendil-works/pi-ai`、zod | 中 | 想讓自己的工具「同一份設定可切 Claude／OpenAI／DeepSeek」可參考；若只用 Claude，直接用 Anthropic 官方 SDK 更簡單。 |
| 場景切換偵測器 | [packages/nodes/frameAnalysisNode/src/sceneDetector.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/frameAnalysisNode/src/sceneDetector.ts) | 無外部依賴（183 行純 TS） | 低 | 在瀏覽器用 `<video>`＋canvas 取幀後餵進去，就能在你的網頁做「競品廣告拆鏡」。 |
| 拉片＋AI 逐鏡說明 | [packages/nodes/frameAnalysisNode/src/videoAnalysis.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/frameAnalysisNode/src/videoAnalysis.ts)、[aiAnalysis.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/frameAnalysisNode/src/aiAnalysis.ts) | nodeScaffold 宿主 API、FFmpeg | 中 | 拆出後要自己補「取幀」與「呼叫 LLM」兩個介面。 |
| 影片剪裁函式 | [packages/nodes/videoNode/src/videoProcessing.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/videoNode/src/videoProcessing.ts) | fluent-ffmpeg 風格介面 | 低 | 87 行，可改成 Node 腳本使用。 |
| MCP 對外工具設計 | [apps/server/src/utils/mcp/tools.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/utils/mcp/tools.ts) | MCP TS SDK v2、Express | 高 | 參考它「target＋args」與「敏感欄位脫敏 `redactSecrets`」的設計，替你的倉儲網頁做 MCP，讓 Claude Code 直接查庫存。 |
| 生成前確認規則 | [agent/runtime/prompt.ts#L34-L38](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/agent/runtime/prompt.ts#L34-L38) | 無 | 低 | 把「花錢前先列方案、要明確同意」這段抄進你自己的 CLAUDE.md，防止 Agent 亂燒影片額度。 |
| adapter 產生提示詞 | [providerPrompt.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/web/src/components/settings/panels/mediaModel/providerPrompt.ts) | 無 | 低 | 改寫成 Claude Code skill：「給我 API 文件，我幫你寫 adapter」。 |

## 7. AI／Claude 整合

- **語言模型**：原生支援 `anthropic-messages` 協定，可直接填 Anthropic API Key 與 `https://api.anthropic.com`，模型列表會自動抓（含分頁）；也支援 OpenAI 兩種協定與 DeepSeek。官方案例就是用 **Claude Opus 4.6** 寫劇本與提示詞。上下文上限表已收錄 claude-opus-5、claude-sonnet-5、claude-fable-5-1 等型號。
- **圖片／影片模型**：Seedance 2.5/2.0/fast/mini、Wan3.0、MiniMax-H3、Doubao Seedream 5.0、gpt-image-2、Gemini 3 Pro Image（Nano banana Pro）、Qwen-Image 3.0 等（見 apiMart.ts 與 compshare.ts 的 `models`）。**Claude 不生圖、不生影片**，只負責劇本、分鏡、提示詞與操作畫布。
- **Prompt 放在哪**：Agent 系統提示詞在 `apps/server/src/agent/runtime/prompt.ts`（可在設定的「開發者 → 系統提示詞」覆寫，`routes/settings/systemPrompt.ts`）；製作方法全在 `packages/skills/*/SKILL.md`；3D 導演台另有 `packages/nodes/director3dNode/src/agentPrompt.ts`。
- **MCP**：雙向。① Toonflow 自己是 **MCP 伺服器**（HTTP `127.0.0.1:10588/mcp`＋stdio 入口 `build/mcp/stdio.js`），Claude Code 可連；② Toonflow 的 Agent 也能當 **MCP 客戶端**，匯入 JSON 或 `.dxt` 擴充（`utils/mcp/servers.ts`、`dxt.ts`）。
- **Skills**：採用與 Claude Code 相同的 `SKILL.md`＋frontmatter（name、description）＋`references/` 格式，可在 app 內安裝、編輯、排序。另支援 A2A（Agent-to-Agent）連外部 Agent。
- **能不能換成 Claude**：可以，而且是一級支援。唯一要改的是：系統提示詞預設會優先挑「Toonflow 官方」供應商，你沒登入就會改用你設定的那家。

## 8. 擴充方式與 API

1. **節點外掛**（`packages/nodeScaffold`）：Vue 單檔元件打包成 UMD，放 `data/nodes/*.umd.js`；有 `useNode`、`nodeInputs`、`nodeAi`、`nodeFfmpeg`、`nodeAsr` 等宿主 API。
2. **工具外掛**（`packages/toolScaffold`）：`.tool.js`，給 Agent 呼叫。
3. **媒體供應商 adapter**：一個 `.ts` 檔，在設定 → 媒體模型匯入，或由 Agent 協助產生。
4. **技能**：`SKILL.md` 資料夾；**團隊**：`team.json`＋成員 md。
5. **檔案檢視擴充**（`packages/extScaffold`，`bun run create:ext` 建立）。
6. **外掛市集**：`api.toonflow.net/console/plugIn`（官方雲端）。
7. **HTTP API**：185 支路由，全在 `/api/*`，**沒有登入驗證**（README 4.4 明寫）；**MCP**：如第 7 節，可視為正式的對外自動化 API。

## 9. 程式品質與風險

- **維護狀況**：非常活躍。建立於 2026-01-29，九個多月衝到 2 萬星；HEAD 為 2026-11-02 的提交，版本 2.0.0 系列（`electrobun.config.ts` 預設 `2.0.0`）。有 GitHub Actions 打包 Windows／macOS／Android（`.github/workflows/debug.yml`、`release.yml`）。程式碼大量帶有 `// ACT:` 設計註解，型別嚴謹（zod 全面驗證）。
- **測試**：檔案清單中**找不到任何測試檔**（搜尋 `.test.`、`.spec.`、`/test/`、`__tests__` 結果為 0）。只有 `typecheck` 腳本。
- **資安**：① Web 與 API **無身分驗證**，伺服器部署一定要只綁 127.0.0.1 或加反向代理認證（compose 已預設綁 127.0.0.1）。② 媒體 adapter 在 `node:vm` 執行，作者自己註明「不是不可信程式碼隔離」，**不要匯入來路不明的 adapter／外掛**。③ Agent 有 sandbox 工具可執行 Bash／Python（`packages/tools/sandbox`），也有 FFmpeg 無白名單工具。④ MCP 預設關閉、有 Bearer 權杖、`getSettings` 會脫敏 API Key，這部分做得不錯。
- **遙測**：[apps/web/src/lib/anonymousData.ts#L146](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/web/src/lib/anonymousData.ts#L146) 每 60 秒 POST 到 `https://api.toonflow.net/web/telemetry/report`，內容是匿名 ID、使用時長、專案數、模型供應商數、畫布節點類型統計、瀏覽器與語言；**不含**劇本內容或 API Key。**預設開啟**（[stores/settings.ts#L87-L92](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/web/src/stores/settings.ts#L87-L92)：`dataCollectionEnabled !== false`），可在設定的隱私頁關閉。另外網路測試會連 `www.baidu.com`、下載功能會用 `dns.alidns.com`。
- **已知的坑**：① 文件、註解、提示詞全是簡體中文。② 內建媒體平台都是中國服務（APIMart 有海外端點 `api.apimart.ai`），台灣付款與發票要自己確認。③ 需要特定 Bun 版本 1.4.3。④ 內建 workflow 會強制走「Seedance 路由」，換別的影片模型要改 SKILL。⑤ 倉庫連歷史約 292 MB，原始碼本身不大（本次稀疏檢出排除媒體後約 24 MB）。

## 10. 跟其他專案組合的建議

- **Toonflow（前段：劇本＋分鏡＋生影片）＋ Remotion／HyperFrames（後段：字幕、價格標、Logo、片尾 CTA 用程式繪製）**：Toonflow 缺「合成成片＋字幕」，正好由程式化影片框架補上。
- **Toonflow ＋ MoneyPrinterTurbo／NarratoAI**：後兩者有 TTS 配音與字幕流程，可以拿來補 Toonflow 缺的配音、字幕（細節以各自資料包為準）。
- **Toonflow vs. huobao-drama**：兩者都是「小說→劇本→分鏡→AI 影片」短劇工具；Toonflow 是 MIT（可商用拆碼），huobao-drama 是 CC BY-NC-SA 4.0（禁止商用）。要拆程式碼優先拿 Toonflow。
- **只想用 Claude Code**：不裝 Toonflow，直接把 `workflow/SKILL.md`＋`v118workflow/references/knowledge/*` 搬進 `.claude/skills/`，再用 APIMart adapter 的邏輯寫一支小腳本送 Seedance，就是最輕量的「Claude 寫提示詞＋雲端生影片」組合。
- **跟你的倉儲 App**：可借鏡 MCP 那一套（target／args、脫敏、預設關閉＋權杖），讓 Claude Code 讀你的商品資料（品名、賣點、照片）後，直接在 Toonflow 畫布建立商品影片節點。

## 11. 影片／腳本流程檢查表

| 步驟 | 狀態 | 程式碼位置與說明 |
|---|---|---|
| 輸入：主題／一句話 | 有 | [workflow/SKILL.md#L15-L30](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/skills/workflow/SKILL.md#L15-L30)：「創意或一句話」補齊人物目標、阻力、結果。 |
| 輸入：小說 | 有 | 同上表格；v118workflow 有 sourceMap／sourceEvents／adaptationStrategy 改編流程。 |
| 輸入：商品圖 | 有（當參考圖） | SKILL A1.2.1 商品圖逐段綁定（L217-L250）、A1.3 包裝文字不可改寫（L251-L269）。沒有專門的「電商模板」。 |
| 腳本 | 有 | 由你選的 LLM（建議 Claude）依 SKILL 寫；`textNode` 存在畫布上。 |
| 分鏡 | 有 | storyboardTable.md（15 秒上限、4 字／秒）、storyboardTeam 多 Agent；3D 導演台可做鏡頭預演。 |
| 畫面：AI 生圖 | 有 | imageGenerationNode＋adapter（gpt-image-2、Seedream 5.0、Nano banana、Qwen-Image）。imageNode 另有局部重繪、打光、多角度、宮格切分。 |
| 畫面：AI 生影片 | 有 | videoGenerationNode＋adapter（Seedance 2.x、Wan3.0、MiniMax-H3），支援首尾幀與多參考（最多 9 圖／3 影片／3 音訊）。 |
| 畫面：素材庫 | 有（本機） | `routes/assets/*` 與 `assetLibraryDialog.vue`，是你自己的素材資料夾，不是線上圖庫。 |
| 畫面：程式繪製 | 沒有 | 只有 3D 導演台的 three.js 預演，不是動態圖文模板。 |
| 配音 TTS | 未確認／不內建 | audioGenerationNode 存在（語言選項只有 `zh-CN`、`en`，[audioSettings.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/audioGenerationNode/src/audioSettings.ts)），但內建三家 adapter 都**沒有** `generateAudio`（grep 確認），要靠官方付費平台或自己寫 adapter。Seedance 等可勾 `generate_audio` 由影片模型直接產生對白與環境音。 |
| 聲音複製 | 未確認 | 程式碼中沒找到；APIMart 有 `seedance2/private-avatar` 素材組上傳（apiMart.ts L133），用途為人物素材，非聲音複製。 |
| 字幕 | 沒有 | SKILL 刻意規定「不讓生成模型產生字幕」，又沒有字幕燒錄功能；`stateAndDelivery.md` 第 75 行承認沒有剪輯工具時只交片段。 |
| 配樂 | 沒有 | videoPromptCraft.md 第 29 行：預設不自行配樂。 |
| 合成 | 部分 | 只有剪裁／分離音軌（videoProcessing.ts）；Agent 的 FFmpeg 工具可下 `concat`，但沒有時間軸剪輯器。 |
| 輸出 | 有（片段） | MP4 存到工作區 `assets/generated`；成片需外部剪輯。 |

- **每步模型與費用**：腳本／分鏡＝Claude 或其他 LLM（官方案例約人民幣 10 元）；圖片＝gpt-image-2 等（案例不到 1 元）；影片＝Seedance 2.0（案例約 120 元／2 分鐘）。全部按量付費，無內建免費模型。
- **繁中、台灣口音**：介面有繁中（`packages/i18n/src/locales/zhTw.json`、繁中 README）；但 SKILL 與 Agent 提示詞預設輸出**簡體中文**，要自己加規則；TTS 無台灣口音選項，影片模型原生音訊的口音未確認。
- **Claude 怎麼用**：三種都行——① app 內直接填 Anthropic API（原生 `anthropic-messages`）；② Claude Code 透過 MCP 遙控 app（附官方 `toonflow` SKILL）；③ 把 SKILL.md 搬進 Claude Code 單獨使用。
- **能否在個人電腦跑**：可以。桌面版 Windows／macOS（Apple Silicon）、甚至 Android 手機；不需 GPU，生成全走雲端 API。一般筆電（8–16GB 記憶體）應可，官方未寫最低規格。
- **最適合做**：**短劇／漫劇**最強（整套方法論）；其次是**電商商品影片與廣告素材**（商品參考綁定、包裝文字保護有寫，但沒有字幕／價格標／CTA，需要後製）；解說影片不適合（無 TTS、無字幕）。
- **法律風險**：① 生成內容權利依各模型平台條款；Seedance 等用真人照片當參考有**肖像權**問題，用藝人或他人商品圖有**商標／著作權**問題。② 拉片節點可以拆解別人的影片，分析供內部參考可以，但不要直接重製畫面。③ 台灣廣告法規（如食品、化妝品誇大療效）不會因為是 AI 生成而豁免。④ 各廣告平台（Meta、Google、TikTok）陸續要求標示 AI 生成內容，請依投放平台規定揭露。⑤ 資料會送到中國雲端平台（APIMart、優雲智算、秘塔）與 `api.toonflow.net` 遙測，商品機密或客戶資料不要放進提示詞。

## 關鍵字
Toonflow、短劇、漫劇、動態漫畫、AI 影片生成、無限畫布、分鏡、劇本、Seedance、Seedance 2.5、Wan3.0、MiniMax-H3、gpt-image-2、Seedream、Claude、Anthropic Messages、MCP、Claude Code、SKILL.md、AI Agent、多 Agent 團隊、A2A、Vue Flow、Vue 3、Bun、Electrobun、FFmpeg、拉片、場景偵測、scene detection、3D 導演台、商品影片、廣告素材、MIT、本機部署、Docker、提示詞工程、prompt、storyboard、short drama、motion comic、infinite canvas
