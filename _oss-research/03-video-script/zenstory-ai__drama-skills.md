# zenstory-ai/drama-skills — 裝進 Claude Code 的 12 個 AI 短劇／漫劇 skill：從原著到成片的「文件驅動」產線
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：c8f90a7
> GitHub：https://github.com/zenstory-ai/drama-skills｜⭐ 3777｜授權：MIT｜主要語言：Python｜最近更新：2026-11-04

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 這不是一個 App，而是一包「給 Claude Code 讀的工作手冊＋Python 小工具」：Claude 依照 12 個 skill 寫出劇本、視覺設定、分鏡、圖片提示詞、影片提示詞五份 Markdown，再經你「看過預覽、親手確認」後才呼叫 Seedance / MiniMax / GPT Image 2 生成素材，最後用 ffmpeg 剪成有字幕的直式成片。

**對你（台灣小商家、會用 Claude Code、有在投廣告）可以怎麼用：**

1. **直接拿來做短劇／劇情型廣告**：例如「店長被奧客刁難→亮出產品解決問題」這種 30–90 秒劇情廣告。`/short-drama` 初始化 9:16 專案 → `/short-drama-write` 寫一集 → `/short-drama-storyboard` 分鏡 → `/short-drama-video-prompts` 產生可直接貼到 Seedance／海螺（MiniMax）網頁的提示詞。**就算你完全不接 API，只用它產生提示詞再自己貼到即梦／海螺網頁生成，也很好用**。
2. **電商商品影片（靜態圖＋運鏡＋配音＋字幕）**：剪輯 skill 支援「靜幀段」：一張商品圖可以設定 `推近 10%`、`左移` 等 Ken Burns 運鏡，搭配配音檔、逐字字幕、音效與「卡片」樣式的畫面文字（例如 `本月 訂單 128`）。這套剪輯規格（`剪輯單.md`）很適合改造成「商品圖→直式短片」產生器。
3. **借用它的「先預覽、再確認、才花錢」生產閘門**：你以後自己做 AI 影片工具時，這段程式碼（job 指紋＋一次性確認碼＋任務 ID 落盤防重複扣款）可以整段搬。
4. **借用它的分鏡／提示詞寫作知識**：`skills/*/references/` 裡約 140 份 Markdown 是工作室實戰蒸餾出的寫法（Seedance 2.0/2.5、MiniMax H3、Wan 3.0 方言、對白估時、角色跨鏡一致性的「連續性鎖」），可以直接當成你自己 Claude skill 的素材。

**不適合的：** 不是試算表／ERP／比價工具；也不是「丟一張商品圖自動出整支廣告」的一鍵工具——它的設計哲學是人一步步確認。

## 2. 授權白話

- **授權：MIT**（`LICENSE` 第一行即 `MIT License`，Copyright 2026 drama-skills contributors；每個 `SKILL.md` frontmatter 也標 `license: MIT`）。
- **個人使用：** 完全自由，可安裝、修改、拆零件。
- **公司商用：** 也可以，包括改寫後放進你自己的內部工具或販售的產品；唯一義務是保留原著作權聲明與 MIT 授權全文。
- **有沒有閉源／付費版功能？** 有一個「維護者專用」skill `maintainers/skills/short-drama-knowhow` 在公開樹中但不隨安裝發佈；另外依專案內的決策筆記，部分工藝知識的來源（私有專案鏈、詞表）放在倉庫外。**公開的 12 個 skill 功能完整，沒有付費鎖**。同組織另有商業產品 zenstory.ai（小說寫作平台），但本 repo 不依賴它。
- **要注意的不是程式授權，而是生成內容**：Seedance、MiniMax、OpenAI 各自的服務條款、生成影片的版權與肖像權，見第 11 節。

## 3. 技術棧與執行需求

| 層 | 內容 |
|---|---|
| 「前端」 | 沒有傳統前端；主介面就是 Claude Code / Codex 對話。另附一個**本機 Dashboard**（純 JavaScript `app.js` 2,111 行＋CSS），由 Python 內建 HTTP server 提供，只綁 127.0.0.1 |
| 後端 | 20 個 Python 腳本、共 20,461 行（`cat skills/*/scripts/*.py \| wc -l` 統計），**全部只用 Python 標準函式庫**（我用 grep 檢查 import，沒有第三方套件），需 Python 3.9+ |
| 資料庫 | 無。一切都是專案資料夾裡的 Markdown／JSON／JSONL 檔（`剧集/EP001/剧本.md` 等），狀態放 `.short-drama/` |
| 剪輯 | 需要系統安裝 `ffmpeg`／`ffprobe`；選用的字幕／面板疊層用 Remotion（Node + React 19，`@remotion/cli 4.0.418`），只有選 `--subtitles remotion` 或用「畫面文字」時才需要 `npm install` |
| 安裝 | `npx skills add zenstory-ai/drama-skills -y -g`，或 git clone 後把 `skills/*` symlink 到 `~/.claude/skills/` |
| 硬體／GPU | **不需要 GPU**。寫作由 Claude 本身完成，生成媒體全部走雲端 API |
| API Key（只在生產階段需要，選用） | `ARK_API_KEY`＋`SEEDANCE_MODEL`（火山方舟 Seedance，預設網址是 `ark.cn-beijing.volces.com`）；`MINIMAX_API_KEY`＋`MINIMAX_VIDEO_MODEL` 等（MiniMax H3 影片／語音／音樂，`api.minimax.io`）；`OPENAI_API_KEY`（GPT Image 2） |
| 費用 | 工具本身免費。README 自述：68 秒、20 鏡的樣片「視頻生成成本約 40 元」（人民幣，僅影片生成）。各模型單價 repo 內**未記載**→ 未確認；Claude Code 本身的訂閱／API 費另計 |

## 4. 程式架構地圖

```
drama-skills/
├── skills/                         ← 真正會被安裝的 12 個 skill（每個都能單獨安裝）
│   ├── short-drama/                ← 總路由：初始化、Look Development、Dashboard、匯出交付包
│   │   ├── SKILL.md
│   │   ├── references/             ← 五份創作文件規格、制作形態卡（水墨、Q 版、3D…6 張）
│   │   ├── assets/dashboard/       ← 本機創作台前端 app.js / index.html / styles.css
│   │   ├── assets/project-template/short-drama.json ← 專案設定檔範本
│   │   └── scripts/
│   │       ├── project_tool.py          (2,668 行) 初始化／接受決策／export 交付包
│   │       ├── creator_markdown_check.py(2,060 行) 五份文件交叉引用檢查器
│   │       ├── creator_views.py         (999 行)  把 Markdown 解析成 Dashboard 結構
│   │       └── dashboard_server.py      (2,131 行) 只綁 loopback 的 HTTP server
│   ├── short-drama-novel-analyze/  ← 長篇小說：章節索引、快評、改編價值   scripts/novel_index.py
│   ├── short-drama-develop/        ← 故事引擎、分集地圖、15 張題材卡（打臉、重生、系統流…）scripts/episode_intake.py
│   ├── short-drama-write/          ← 單集劇本   scripts/screenplay_index.py、duration_estimate.py（對白時長估算）
│   ├── short-drama-assets/         ← 人物／造型／場景／道具／聲音方向、連續性鎖（純 Markdown）
│   ├── short-drama-image-prompts/  ← 角色三視圖、場景板、道具板提示詞（純 Markdown）
│   ├── short-drama-storyboard/     ← 鏡頭、凍結關鍵幀、打戲、燈光（純 Markdown）
│   ├── short-drama-video-prompts/  ← Seedance 2.0/2.5、MiniMax H3、Wan 3.0 方言（純 Markdown）
│   ├── short-drama-produce/        ← 確認後生產
│   │   ├── scripts/production_tool.py   (2,334 行) prepare/confirm/run/collect/audit
│   │   └── scripts/provider_adapters.py (1,753 行) Seedance、GPT Image 2、MiniMax 影片/語音/音樂
│   ├── short-drama-edit/           ← 剪輯成片
│   │   ├── scripts/edit_tool.py         (3,218 行) check/render/verify，ffmpeg
│   │   └── assets/remotion/             字幕、系統面板、任務面板、卡片疊層（TSX）
│   ├── short-drama-breakdown/      ← 對標劇測量：切點偵測、鏡長、對白密度   scripts/breakdown_tool.py
│   └── short-drama-review/         ← 審查 rubric（純 Markdown）
├── maintainers/skills/short-drama-knowhow/ ← 維護者專用，不隨安裝
├── examples/creator-first/EP001/   ← 公開完整樣例《让你管账号》五份文件
├── examples/golden-project/        ← 回歸測試夾具（多集）
├── evaluations/                    ← 內容品質閘門、模型行為探測紀錄、完整實跑
├── docs/                           ← 教學：Seedance 提示詞、三視圖、跨鏡一致性、9 個開源工具比較
├── tests/                          ← 32 個測試檔、757 個 test_ 函式（grep "def test_" 加總）
└── .github/workflows/              ← CI（Python 3.9/3.10/3.14 + Chromium 測 Dashboard）、發佈到 ClawHub
```

計數方式：skill 數＝`ls skills | wc -l` = 12；`find skills -name '*.md' | wc -l` = 147 份 Markdown（含 12 份 SKILL.md）；README 徽章寫「Skills 11」但正文寫十二個，是 breakdown skill 新增後徽章未更新。

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 技能路由 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama/SKILL.md#L17-L34 | 一張表把「使用者要做什麼」對應到哪個 skill、寫進哪份文件（`剧本.md`、`视觉设定.md`、`分镜.md`、`图片提示词.md`、`视频提示词.md`） |
| 五份文件交叉檢查 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama/scripts/creator_markdown_check.py | 檢查分鏡提到的人物是否有視覺依據、分鏡時長與影片提示詞時長是否一致、連續性鎖短語有沒有原樣出現；錯誤訊息直接指出鏡號 |
| 生產預覽＋一次性確認碼 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/production_tool.py#L1278-L1319 | `prepare` 對 job 內容算指紋，產生 `CONFIRM <job_id> <指紋前12碼>`；`confirm` 必須逐字吻合才寫入收據 |
| 執行生產（防重複扣款） | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/production_tool.py#L1718-L1843 | 確認收據只能消費一次；輸入檔先複製成私有快照；adapter 以 argv（不經 shell）＋ JSON stdin 呼叫；`collect`（L1854）與 `audit`（L2029）處理中斷後取回 |
| 供應商參數編譯 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/provider_adapters.py#L317-L888 | `compile_seedance_payload`(L317)、`compile_minimax_h3_payload`(L505)、`compile_gpt_image_2_payload`(L679)、`compile_minimax_speech_payload`(L768)、`compile_minimax_music_payload`(L839)；純函式不做 I/O，方便測試 |
| 參考圖語意附加 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/provider_adapters.py#L214-L300 | 每張參考圖自動在提示詞尾附「參考 @圖片1（女主定妝照），允許控制：身份、造型；不得控制：構圖、動作」，中英文自動切換 |
| Seedance 任務提交＋任務 ID 落盤 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/provider_adapters.py#L1268-L1306 | 本機參考圖轉 base64 data URI 直接送，不需自架上傳服務；拿到 task id 先寫檔再輪詢（註解：「Billed from here on」） |
| 剪輯渲染 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/scripts/edit_tool.py#L1477-L1695 | 依 `剪辑单.md` 逐段裁切／靜幀運鏡 → 拼接 → 混音效 → 燒字幕（ASS）或 Remotion 疊層 → 兩遍 loudnorm |
| 兩遍響度標準化 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/scripts/edit_tool.py#L2120-L2147 | EBU R128：先測 `input_i/tp/lra` 再線性校正，TP=-1.5、LRA=11 |
| 字幕字型 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/scripts/edit_tool.py#L45-L48 | ffmpeg 路線固定 `Noto Sans CJK SC`；Remotion 路線用 `@fontsource/noto-sans-sc` |
| Remotion 疊層 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/assets/remotion/src/font.ts | 字型沒載入就中止渲染（不讓字幕掉到預設字型）；面板元件在 `src/screen/*.tsx` |
| 本機 Dashboard | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama/scripts/dashboard_server.py#L1895-L1910 | 強制只綁 IPv4 loopback；前端 https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama/assets/dashboard/app.js 全部字串先 escape、相容 CSP，編輯原文時帶版本號避免覆蓋 |
| 對白時長估算 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-write/scripts/duration_estimate.py | 只用專案自己宣告的語速換算，沒宣告就只回報字數不猜秒數；README FAQ 提到 H3 中文小樣本約 4.1 字／秒 |
| 小說章節索引 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-novel-analyze/scripts/novel_index.py | 一次切好章節邊界並綁定內容雜湊，後續各階段共用同一切法 |
| 對標劇測量 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-breakdown/scripts/breakdown_tool.py | 以畫面差異門檻偵測切點、算鏡長、出 contact sheet，可掛 SRT 算對白密度 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 生產確認閘門（prepare/confirm/run/collect/audit） | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/production_tool.py | Python 標準庫 | 中 | 抽掉「creator-first Markdown 來源比對」那段（L787–L1011），留下 job 指紋、確認碼、快照、任務 ID 落盤，就是任何「呼叫付費 AI API 前先確認」的通用模組 |
| 多供應商 adapter | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/provider_adapters.py | 標準庫 urllib | 低 | 獨立 CLI：`python3 provider_adapters.py seedance < job.json`；可直接拿來從你的 Firebase 後台（Cloud Functions 若用 Python）或本機腳本呼叫 Seedance／MiniMax／GPT Image 2 |
| 剪輯單→成片渲染器 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/scripts/edit_tool.py | ffmpeg、（選用）Remotion | 中 | 做「商品圖＋配音＋字幕→直式短片」：用靜幀段＋運鏡＋配音行＋字幕行＋卡片樣式畫面文字；字型要改成繁中（見第 9 節） |
| Remotion 面板元件（卡片、系統面板、任務面板、角標、倒數） | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/assets/remotion/src/Overlay.tsx | React 19、Remotion 4 | 低 | 直接搬進任何 Remotion 專案當廣告字卡／價格卡；`src/screen/tokens.ts` 改色票即可 |
| 兩遍 loudnorm 函式 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/scripts/edit_tool.py#L2120-L2147 | ffmpeg | 低 | 30 行，抄進任何影片流程讓各平台音量一致 |
| 影片提示詞方言庫 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-video-prompts/SKILL.md | 無（Markdown） | 低 | `references/seedance-2.0.md`、`seedance-2.5.md`、`minimax-h3.md`、`wan-3.0.md` 直接放進你自己的 Claude skill 當參考 |
| 角色一致性「連續性鎖」寫法 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/docs/character-consistency-across-shots.md | 無 | 低 | 同一商品／代言角色跨多支廣告保持外觀：固定一句英文造型短語每次原樣貼進提示詞 |
| 本機 Dashboard（純 JS） | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama/assets/dashboard/app.js | 搭配 dashboard_server.py | 高 | 和你現有的純 JS 倉儲網頁同技術；但它強綁短劇文件結構，較適合參考其 escape／CSP／樂觀鎖寫法而非整包搬 |
| 對標劇測量工具 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-breakdown/scripts/breakdown_tool.py | ffmpeg/ffprobe | 低 | 量競品廣告的鏡長、切點與節奏，做「爆款廣告節奏分析」 |

## 7. AI／Claude 整合

- **Claude 支援：原生。** 每個 skill 都是標準 Agent Skill（`SKILL.md` ＋ frontmatter），Claude Code 中以 `/short-drama`、`/short-drama-write` 等呼叫；Codex 另有 `agents/openai.yaml`。**寫作用的模型就是 Claude 本身**，repo 內沒有任何呼叫 Anthropic API 的程式碼，也不需要 Anthropic API Key（用你的 Claude Code 方案即可）。
- **Prompt 放在哪：** 全部在 `skills/<名稱>/SKILL.md` 與 `skills/<名稱>/references/*.md`（共 147 份 Markdown，約 1.3 MB；最大的是 develop 274 KB、video-prompts 206 KB、storyboard 149 KB，以 `find … -exec cat {} + | wc -c` 統計）。
- **MCP：** 沒有 MCP server。
- **生成模型（生產階段）：**
  - 影片：Seedance（2.0／2.5，模型 ID 須自行設定）、MiniMax H3；Wan 3.0 **只有提示詞方言，沒有內建 adapter**。
  - 圖片：GPT Image 2（`gpt-image-2`，固定寫在程式常數 L30）。
  - 語音：MiniMax Speech（`/t2a_v2`，預置音色，**不做聲音複製**）。
  - 音樂：MiniMax `music-3.0`。
- **能不能換：** adapter 是外部 argv 程式＋JSON stdin/stdout 協定（見 `references/adapter-contract.md`），你可以自己寫一支 adapter 接即夢、可灵、Veo 或本機 ComfyUI，不必改主流程。

## 8. 擴充方式與 API

- **新增生成供應商：** 在專案外的 adapter config JSON 加一個 profile（`command` 是 argv 陣列、`timeout_seconds` 1–3600），adapter 從 stdin 讀 job、在 stdout 回 `{"outputs":[{"target":…,"source":…}],"provider_job_id":…}`。憑證只能放環境變數，job 內有疑似密鑰的 key 會被拒。
- **新增影片模型提示詞方言：** 在 `short-drama-video-prompts/references/` 加一份方言檔，並在 `short-drama.json` 的 `production_profile.choices` 宣告 `target_video_model`、原生時長、生成模式、是否同軌出聲。
- **新增題材：** `short-drama-develop/references/genre-cards/` 已有 15 張題材卡（打臉、重生、系統流、職場、豪門婚戀…），照格式加一張即可。
- **CLI 介面：** `project_tool.py init/export`、`creator_markdown_check.py [--partial]`、`production_tool.py prepare|confirm|run|status|collect|audit`、`edit_tool.py check|render|verify`、`breakdown_tool.py measure|transcript|plan|profile`。
- **沒有 HTTP API 給外部呼叫**；Dashboard 的 `/api/*` 只對 localhost，且不提供生產按鈕。

## 9. 程式品質與風險

- **維護狀況：** 非常活躍。2026-07-16 建立，CHANGELOG 有 26 個版本標題（含 Unreleased），目前 `VERSION` = 0.10.2（2026-11-03）。`.agents/notes/` 有 59 份設計決策紀錄（以檔案清單 grep 計數）（含被否決的方案），工程紀律很好。
- **測試：** 32 個測試檔、757 個 `test_` 函式；CI 跑 Python 3.9／3.10／3.14，另有 Chromium 跑 Dashboard 瀏覽器回歸，Windows 也有獨立回歸。（我沒有執行任何測試，以上為靜態計數。）
- **資安／隱私：** Dashboard 只綁 127.0.0.1；adapter 以 argv 呼叫不經 shell；供應商錯誤內文與憑證不回顯；憑證不寫入專案。我在 `skills/*/scripts/*.py` grep 網址，只出現四個供應商 base URL，**沒有發現遙測／回報程式**。
- **已知的坑：**
  1. **字型是簡體**：ffmpeg 字幕固定 `Noto Sans CJK SC`、Remotion 用 `noto-sans-sc`。繁中字大多能顯示，但字形是大陸規範（例如「骨」「戶」寫法），做台灣廣告要改成 `Noto Sans CJK TC` 或思源黑體 TC。
  2. **全套文件、目錄名、錯誤訊息都是簡體中文**（`剧集/`、`剧本.md`、`分镜.md`）；語言標籤可設 `zh-Hant-TW`（`tests/test_output_language.py` 有測），但 skill 本身沒有任何繁中或台灣口音的專門指引（grep「繁体／台湾／zh-TW」在 skills/ 內零筆）。
  3. **Seedance 預設端點是火山方舟北京區**（`ark.cn-beijing.volces.com`），台灣使用者開通與付款方式需自行確認；可用 `SEEDANCE_BASE_URL` 改端點（是否相容 BytePlus 國際版 → 未確認）。
  4. **配樂混音沒有自動化**：剪輯工具能放「環境聲」循環、音效、配音，但時間線配樂的進出、ducking 要「外部工具執行」（`references/sound-and-subtitles.md` 明寫 `声音` 行不驅動混音）。
  5. **續接段（用上一段實際影片延長）目前不能透過內建流程提交**，只能每段獨立起始幀或在外部工具送。
  6. 流程嚴謹但**很吃 Claude 的 context 與時間**：一集 20 鏡的樣例，分鏡與影片提示詞文件各約 39 KB。
  7. 內建 MiniMax 語音只用預置音色，沒有台灣腔音色清單，需要自己到 MiniMax 查（未確認是否有台灣腔）。

## 10. 跟其他專案組合的建議

- **＋ 你自己的倉儲／商品資料（Firebase）**：把商品名稱、賣點、價格匯出成文字，交給 `/short-drama-develop` 或 `/short-drama-write` 當「原著」，產生系列劇情廣告；價格／促銷資訊放進剪輯單的「卡片」畫面文字（模型寫不好字，由 render 疊上去，正好避開 AI 影片亂碼字的問題）。
- **＋ huobao-drama 或 ViMax（同分類其他資料包）**：它們有圖形介面與自動化生成，本專案提供「寫得好的提示詞與一致性規範」。實務上可以用本專案產出 `视频提示词.md`，再貼到有 UI 的工具或即夢網頁去抽卡。注意 huobao-drama 是 CC BY-NC-SA（禁商用）。
- **＋ TTS 專案（例如支援繁中／台灣腔的開源 TTS）**：本專案的配音只接 MiniMax 預置音色；剪輯單的 `配音 N：` 行吃任何音檔，所以可以外接其他 TTS 產生的 wav，直接進剪輯流程。
- **＋ Remotion 範本類專案**：本專案的 `assets/remotion/src/screen/` 面板元件可和其他 Remotion 商品影片範本合併，做價格卡、倒數促銷卡。
- **同組織的 `video-recap-skills`**（README 提及：影片轉中文解說、可匯出剪映草稿）可能更適合「解說型」影片——本次未讀，未確認。

## 11. 影片／腳本流程檢查表

| 步驟 | 有／沒有／未確認 | 位置與說明 |
|---|---|---|
| 輸入：主題／點子 | 有 | `/short-drama-develop`、`/short-drama-write` 可從一句點子開始。https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama/SKILL.md |
| 輸入：小說／長篇原著 | 有 | https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-novel-analyze/scripts/novel_index.py 章節索引＋抽樣快評 |
| 輸入：商品圖／素材 | 部分 | 可把現有圖片放進專案綁成 `REF-*` 參考圖或作為靜幀段來源；沒有「商品圖→自動腳本」的專門流程 |
| 腳本 | 有 | `short-drama-write` → `剧本.md`；對白時長估算 `duration_estimate.py` |
| 分鏡 | 有 | `short-drama-storyboard` → `分镜.md`（起點、終點、運鏡理由、凍結關鍵幀提示詞） |
| 畫面：AI 生圖 | 有（付費 API） | GPT Image 2 adapter，https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/references/providers/gpt-image-2.md |
| 畫面：AI 生影片 | 有（付費 API） | Seedance、MiniMax H3 adapter；Wan 3.0 只有提示詞。https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/references/providers/seedance.md |
| 畫面：素材庫 | 沒有 | 無圖庫串接 |
| 畫面：程式繪製 | 部分 | Remotion 只畫字幕與面板疊層，不畫主畫面 |
| 配音 TTS | 有（付費 API） | MiniMax Speech 預置音色，https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/references/providers/minimax-speech.md ；H3 影片可同軌生成對白聲音 |
| 聲音複製 | 沒有 | adapter 明寫「不做声音克隆」；資產 skill 只描述如何挑選／驗收授權的克隆結果 |
| 字幕 | 有 | 逐字取自 `剧本.md`、ASS 燒錄或 Remotion；可標黃重點詞。https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/SKILL.md#L59-L116 |
| 配樂 | 部分 | 生成：MiniMax `music-3.0`（https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/references/providers/minimax-music.md ）；混音進時間線需外部工具，剪輯工具只有環境聲循環與音效 |
| 合成 | 有 | `edit_tool.py render`（ffmpeg 裁切、靜幀運鏡、自動接色、音效、字幕、兩遍 loudnorm） |
| 輸出 | 有 | `制作成果/成片/`；`project_tool.py export` 打包含清單與校驗和的交付目錄 |
| 成本 | 部分 | README：68 秒樣片影片生成約 40 元人民幣；各模型單價未記載（未確認） |
| 繁中／台灣口音配音與字幕 | 沒有專門支援 | 語言標籤可設 `zh-Hant-TW`，但字型為 SC、文件全簡中、無台灣腔音色指引 |
| Claude 怎麼用 | Claude Code skill（原生） | `npx skills add zenstory-ai/drama-skills -y -g`，`/short-drama` 呼叫；不呼叫 Anthropic API、不需 OpenAI 相容介面來寫作 |
| 個人電腦能跑嗎 | 可以 | 不需 GPU；Python 3.9＋ffmpeg 即可，生成全走雲端 API |
| 最適合做 | 短劇／漫劇 ＞ 劇情型廣告 ＞ 電商商品影片（靜幀＋配音） ＞ 解說影片 | 設計目標就是多集短劇與漫劇（含水墨、Q 版、3D 等 6 種制作形態卡） |
| 法律風險 | 需注意 | 改編小說須有改編權（README 範例刻意寫「我拥有或获准改编」）；AI 生成人物若像真人有肖像權風險；Seedance／MiniMax／OpenAI 各自的服務條款與商用規定需自行確認（未確認）；在 Meta／TikTok 投放 AI 生成廣告時需留意平台的 AI 標示規定 |

## 關鍵字

drama-skills、zenstory、AI 短劇、漫劇、微短劇、短劇劇本、分鏡、分鏡腳本、凍結關鍵幀、影片提示詞、圖片提示詞、角色一致性、連續性鎖、角色三視圖、Claude Code skill、Agent Skills、Codex、Seedance 2.0、Seedance 2.5、MiniMax H3、海螺、Wan 3.0、GPT Image 2、MiniMax Speech、MiniMax Music、TTS、ffmpeg、loudnorm、Remotion、字幕燒錄、小說改編、對標拆解、生產確認閘門、劇情廣告、電商短影片、short drama、micro-drama、storyboard、video prompt、MIT
