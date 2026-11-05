# Vincentwei1021/video-shotcraft — 給 Claude Code 用的「程式碼畫出來」產品宣傳片技能包（Remotion＋124 張鏡頭配方卡＋瀏覽器剪輯台）

> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：1266a3e
> GitHub：https://github.com/Vincentwei1021/video-shotcraft｜⭐ 16909｜授權：Apache-2.0（程式碼與文件）；底層渲染引擎 Remotion 另有自己的授權｜主要語言：TypeScript｜最近更新：2026-10-29

（以下 permalink 皆指向 commit `1266a3ec4831289c4d893d42dd5102723658039a`，簡寫為 `…/blob/1266a3e…`，實際連結為完整 SHA。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：這不是「AI 生影片」模型，而是一套讓 Claude Code（或 Codex）照著寫 Remotion（React 寫影片）程式碼的「技能包＋素材庫」：先用無頭瀏覽器截你網頁的真實畫面，再從 124 張調好參數的鏡頭配方卡挑運鏡，逐幀用程式畫出 1920×1080、30fps 的產品宣傳片，配上 Freesound 音效與 BGM 卡拍，最後還能在瀏覽器裡用類似剪映的「Motion Workbench」再微調、匯出 MP4 或剪映草稿。

**對你（台灣小老闆、自己用 Claude 做倉儲網頁、有在投廣告）實際能做的事：**

1. **幫你自己的倉儲／進銷存網頁做一支功能介紹片**：這正是它最擅長的情境——把 Firebase 上的網頁跑起來、截圖、做 30–40 秒有運鏡的「產品發表會風」影片。可以拿來當官網首頁影片、招募合作夥伴、或教學。
2. **電商廣告素材（部分可用）**：它的鏡頭卡是通用動態語彙（標題飛入、數字滾動、聚光燈特寫、前後對比滑桿、價格卡片堆疊等）。`assets/lib/ClipCard.tsx` 可把你拍的商品 mp4 包成「卡片主角」套進這些運鏡；工作台也有 `image-clip`/`video-clip` 卡。但**沒有**內建商品圖去背、AI 生圖、AI 生影片、配音，商品影片要你自己準備素材。
3. **短劇：不適合**。沒有劇本／分鏡生成、角色、配音、字幕同步口白的流程（作者另有姊妹專案 video-talkcraft 處理「腳本＋配音」，本次未掃描，未確認）。
4. **最值得拆的零件**：瀏覽器版多軌時間軸剪輯器（`workbench/`，React＋Zustand＋Remotion Player，可匯出 MP4）、網頁截圖三件套腳本、2.5D 頁面運鏡元件 `PageCam`、Freesound 音效搜尋下載 CLI、剪映草稿匯出、Upload-Post 多平台發布腳本。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **本專案程式碼與文件：Apache-2.0**（[LICENSE](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/LICENSE)；`.claude-plugin/plugin.json` 也標 `"license": "Apache-2.0"`）。白話：個人、公司都可以免費用、改、商用、閉源再包裝；要保留著作權與授權聲明，改過的檔案要註明有修改；附專利授權條款。
- **最大的坑在底層 Remotion**：template 與 workbench 都依賴 `remotion` 4.0.484（[template/package.json](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/template/package.json)、[workbench/package.json](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/package.json)）。本專案 README 與 SKILL.md 自己也寫：「Remotion 有獨立授權，個人與小團隊免費、公司可能需要付費」（[SKILL.md#L201-L203](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/SKILL.md#L201-L203)）。Remotion 的授權原文本次依規定沒有去官網查，**實際員工人數門檻與價格「未確認」**——就我所知是以公司規模（員工數）判定，小型營利公司可能免費，超過門檻要買公司授權；你公司要正式用在廣告前請自己到 remotion.dev 確認。
- **音樂／音效**：BGM 5 首來自 Mixkit（[assets/audio/ATTRIBUTION.md](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/audio/ATTRIBUTION.md)），其中 `bgm-tech-house.mp3` 作者自己註明「無法逐曲反查，商用前複核」。新影片音效從 Freesound 下載，預設只抓 CC0，選 `--license by` 時才允許 CC BY（要署名）。模板歷史音效的 ATTRIBUTION 也寫「未能反查的素材不能據此認定已核驗授權」。
- **鏡頭手法來源**：[references/shots/ATTRIBUTION.md](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/shots/ATTRIBUTION.md#L1-L20) 說明部分卡片手法研究自 ClickUp、Notion 等官方宣傳片與抖音創作者作品，聲稱「全部從零重寫、不含原素材」，並坦承「公開發布不等於授權」。用動態手法本身風險低，但不要去模仿別人整體的品牌畫面。
- **閉源／付費版**：沒有看到任何閉源模組或付費解鎖功能。唯一要付費的外部服務是**選用**的 Upload-Post（社群一鍵發布，要 API key），以及你自己的 Claude／Codex 訂閱。README 的贊助商（APIMart、PackyCode 等 API 轉售平台）只是廣告，程式碼沒有串接它們（以 `rg` 搜尋程式碼確認）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容（依據） |
|---|---|
| 主體 | 不是一個 App，而是 **Claude Code / Codex 的 skill**：根目錄 `SKILL.md`（Claude Code 讀 frontmatter）＋ `agents/openai.yaml`（Codex UI 用）＋ `.claude-plugin/plugin.json` |
| 影片引擎 | Remotion 4.0.484、React 19.2.7、TypeScript；部分鏡頭用 three.js 0.185 / `@react-three/fiber` / `@remotion/three`、`@remotion/motion-blur` |
| 瀏覽器剪輯台 | `workbench/`：Vite 6＋React 19＋Zustand 5＋`@remotion/player`＋zod 4；本機 dev server 埠 5198；匯出時由 Vite 中介層 spawn Remotion CLI |
| 截圖 | Puppeteer（`capture-template.mjs` 唯一依賴） |
| 音訊工具 | Python 標準庫 CLI（`sfx-source.py`）＋ ffmpeg/ffprobe；節拍分析要 `uv` 臨時跑 librosa＋scipy |
| 剪映匯出 | Python＋`pyJianYingDraft`（需 venv） |
| 社群發布 | Python 標準庫呼叫 `https://api.upload-post.com` |
| 資料庫 | 無。工作台專案存在瀏覽器 `localStorage`（key `shotcraft-workbench-project-v1`），可匯出入 JSON |
| 部署 | 全部本機跑；Gallery 範例展示是 GitHub Pages 靜態站 |
| 硬體 | **不需要 GPU**。Remotion 用無頭 Chrome 逐幀截圖渲染，吃 CPU。README 寫在 2 核 Linux 要加 `--concurrency=1` 才能渲；作者主要在 macOS 測試 |
| API Key | 核心流程**零 API key**（Freesound 是爬公開網頁、不用 key）。選用：`UPLOAD_POST_API_KEY`、`UPLOAD_POST_USER` |
| 費用 | 主要成本是 Claude Code 的使用量（一支片要讀大量卡片與 demo、反覆渲染與終檢子代理，token 不少，實際金額未確認）；Remotion 公司授權（視規模）；Upload-Post（選用，價格未確認） |

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

```text
video-shotcraft/  (git ls-tree 共 1,218 個檔案)
├── SKILL.md                    # 技能入口：三種製作模式、9 條核心理念、何時讀哪份文件（286 行）
├── .claude-plugin/plugin.json  # Claude Code plugin 描述（skills: "./"）
├── agents/openai.yaml          # Codex 技能 UI 中繼資料
├── references/                 # 給 AI 讀的「製作方法論」（prompt 本體）
│   ├── pipeline.md             # 八階段流水線（382 行）
│   ├── guided-free-creation.md # 共同創作模式的確認節點
│   ├── shots/<10 類>/*.md      # 124 張鏡頭配方卡（意圖／動作階段／參數表／已知坑／參考實作）
│   ├── sequences/              # 全片骨架範本（promo-energy-arc.md）
│   ├── aesthetic-rules.md      # 視覺 QA 準則
│   ├── final-review.md         # 獨立終檢清單
│   ├── music-beat-sync.md      # BGM 節拍分析與卡拍方法
│   ├── sound-design.md / sfx-sourcing.md
│   ├── workbench.md            # 成片接入工作台的契約
│   ├── jianying-export.md      # 剪映草稿匯出流程
│   └── publish-upload-post.md  # 社群發布流程
├── demos/                      # 每張卡的 Remotion 實作：152 個 .tsx（另 _legacy/ 68 個舊版）
│   ├── _fixtures/              # Look/Polish/Brand 等共用視覺件
│   └── _textures/              # 示範用網頁貼圖
├── assets/
│   ├── lib/                    # 可複製的元件：PageCam、ClipCard、Caption、DigitRoll、FlashCut、FlatPanel、VerticalTicker、helpers/
│   ├── scripts/                # capture-template.mjs、sfx-source.py、smoke-render-demos.py…
│   └── audio/bgm/              # 5 首 BGM
├── template/                   # Ink Press 完整可渲染模板片（36.2 秒、10 個鏡頭）＋主題調色
├── workbench/                  # 剪映風瀏覽器剪輯台（Vite＋Remotion Player）
├── gallery/                    # 鏡頭卡靜態畫廊＋api/library.json 索引
├── jianying-export/            # 剪映 Mac（實測）/Windows（未實測）草稿安裝
├── publish/                    # Upload-Post 發布腳本＋離線單元測試
├── shot-polish/                # 作者內部「鏡頭改版」工作紀錄（notes/、final-notes/ 共 366 檔）
└── videos/readme-workflow/     # README 動圖，用 HeyGen HyperFrames 0.8.149 做
```

計數方式：`git ls-tree -r --name-only HEAD | wc -l` = 1,218；鏡頭卡 = `references/shots/**/*.md` 125 檔扣掉 `ATTRIBUTION.md` = 124（與 `gallery/api/library.json` 的 `stats.cardCount: 124`、`styleCount: 150` 一致）；demo = `demos/` 非底線開頭分類資料夾下的 `.tsx` 數。

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5-1 技能分流與三種模式**
→ [SKILL.md#L13-L66](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/SKILL.md#L13-L66)
重點：先判斷是「只處理音效」還是「整支宣傳片」；整片分成①直接套 Ink Press 模板、②AI 自主創作、③共同創作（逐關卡讓使用者確認產品簡報→視覺方向→鏡頭對應→分鏡）。整個「AI」其實就是這份 Markdown 指揮 Claude 寫程式。

**5-2 擷取真實網頁截圖（三件套）**
→ [assets/scripts/capture-template.mjs#L30-L97](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/scripts/capture-template.mjs#L30-L97)（CONFIG）、[#L108-L210](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/scripts/capture-template.mjs#L108-L210)（通用邏輯）
重點：Puppeteer 以 1920×1080、`deviceScaleFactor: 2` 截全頁 2x 圖；依 CSS 選擇器逐元素截透明底 PNG；把每個元素在整頁座標系的 `{x,y,w,h}` 寫進 `layout.json`；可選「點某個 tab 後再截」與「隱藏元素截空底板」（給飛入鏡頭用）。截前等 `document.fonts.ready`＋600ms。檔頭明寫紅線：先灌假資料，不能截真實客戶資料。

**5-3 2.5D 頁面運鏡 PageCam**
→ [assets/lib/PageCam.tsx#L29-L80](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/lib/PageCam.tsx#L29-L80)
重點：關鍵幀 `{frame, cx, cy, zoom, rotX?, rotY?, rotZ?, persp?}`，以 Remotion `interpolate`＋bezier 緩動在關鍵幀間插值；沒有任何 3D 欄位時退化為平面平移縮放（像素級相同）；children 用頁面 CSS px 定位，與 `layout.json` 同座標系，可疊加高亮、游標等。

**5-4 鏡頭配方卡＋demo 原始碼**
→ 範例卡 [references/shots/data/before-after-slider-scrub.md](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/shots/data/before-after-slider-scrub.md)；索引 [gallery/api/library.json](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/gallery/api/library.json)
重點：每張卡 frontmatter 有「一句話／適用／時長／能量／標籤」，內文有動作階段幀表、參數表（含「調節手感」）、已知坑、參考實作路徑。SKILL.md 規定 AI 必須讀準確 demo TSX，「已知坑」參數不得降檔。10 類：opening、camera、transition、typography、ui-entrance、interaction、data、effects、rhythm、outro。

**5-5 模板片與「單一事實來源」時間表**
→ [template/src/aifl/Main.tsx#L15-L26](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/template/src/aifl/Main.tsx#L15-L26)（`AIFL_SHOTS`）、[#L57-L64](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/template/src/aifl/Main.tsx#L57-L64)（`CAPTIONS`）、[#L70](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/template/src/aifl/Main.tsx#L70)（`SFX` 音效釘幀表）
重點：10 個鏡頭共 1085 幀（36.2 秒），字卡、字幕、閃切、音效全部是 export 出來的資料表，渲染與工作台都從同一份表讀，不會兩邊不同步。音效表格式 `{from, src, volume}`。

**5-6 節拍同步（卡拍）**
→ [references/music-beat-sync.md#L29-L48](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/music-beat-sync.md#L29-L48)
重點：**這部分是方法論文件裡的 Python 範例，不是 repo 內可執行的模組**。做法：librosa `beat_track` 拿 beat 時間序列→最小平方擬合等距網格求真 BPM／相位（殘差 ≤±15ms 才算可信）→ 用帶通濾波分 kick（40–160Hz）／snare／hihat→ 時間軸用 `beatF(n)` 拍號寫→渲染後抽音軌回測切點誤差 ≤3 幀。

**5-7 Freesound 音效搜尋／下載／量測**
→ [assets/scripts/sfx-source.py#L79-L117](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/scripts/sfx-source.py#L79-L117)、[#L173-L194](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/scripts/sfx-source.py#L173-L194)、[#L223-L272](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/scripts/sfx-source.py#L223-L272)
重點：用 `urllib` 抓 freesound.org 搜尋頁 HTML 並以 `HTMLParser` 解析（不用 API key），本地再檢查一次授權（只收 CC0 / CC-BY-x.x）；下載的是 MP3 預覽；用 ffmpeg 轉 48kHz float，10ms 視窗算峰值 dBFS、RMS、能量峰時間、有效起訖點，寫 `audio-manifest.json` 與 `FREESOUND-CREDITS.md`、SHA 雜湊。

**5-8 逐幀 QA 與獨立終檢**
→ [references/pipeline.md#L199-L248](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/pipeline.md#L199-L248)、[references/final-review.md](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/final-review.md)
重點：每鏡頭預寫 2 個驗收幀號，`npx remotion still` 出靜幀給 Claude 自己看圖；每輪整片重渲＋ffmpeg 抽幀；交付前**一定**派乾淨上下文的子代理依 final-review 清單逐條出帶幀號證據的報告。禁止 `Date.now()`/`Math.random()`，亂數用 `mulberry32` 固定種子（[assets/lib/helpers/rand.ts](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/lib/helpers/rand.ts)）。

**5-9 Motion Workbench 瀏覽器剪輯台**
- 資料模型 Project→Track→Clip：[workbench/src/types.ts#L1-L47](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/src/types.ts#L1-L47)（clip 有 start、duration、inOffset、speed、opacity、scale、x、y、props）
- 狀態與存檔：[workbench/src/store.ts#L15-L28](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/src/store.ts#L15-L28)（Zustand＋localStorage，含 undo/redo）
- 時間重映射與合成：[workbench/src/preview/Composition.tsx#L11-L70](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/src/preview/Composition.tsx#L11-L70)（用 `<Freeze frame={inOffset + frame*speed}>` 做變速／裁入；影音卡改走原生 trimBefore/playbackRate）
- 屬性面板 schema：[workbench/src/cards/types.ts#L3-L36](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/src/cards/types.ts#L3-L36)；轉 zod 給 Remotion Studio：[workbench/src/remotion/zodFromCard.ts#L5-L30](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/src/remotion/zodFromCard.ts#L5-L30)
- 一鍵匯出 MP4：[workbench/vite.config.ts#L27-L180](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/vite.config.ts#L27-L180)（`POST /api/export` 把工程 JSON 寫成 props 檔→spawn `remotion render`→解析 `Rendered a/b` 回報進度；同時只允許一個渲染）
- 成片拆軌清單：[template/src/workbench.ts](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/template/src/workbench.ts)（每個鏡頭給 component/props/schema，動畫時值刻意不開放）

**5-10 剪映草稿匯出** → [jianying-export/mac_draft.py#L1-L17](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/jianying-export/mac_draft.py#L1-L17)、[references/jianying-export.md#L1-L40](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/jianying-export.md#L1-L40)
重點：先渲一版無字幕無音效的底片，依鏡頭切段；字幕變剪映原生文字軌、SFX/BGM 變音訊軌；鏡頭內動效無法拆、只能烘焙。Mac 剪映專業版 11.2 實測，Windows 未實測。

**5-11 社群發布** → [publish/upload_post.py#L1-L40](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/publish/upload_post.py#L1-L40)
重點：一次上傳分發到 TikTok／IG／YouTube／FB／X／Threads 等；有 dry-run、Idempotency-Key 防重複發布、結果 `unknown` 時禁止重跑只能查狀態。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 瀏覽器多軌剪輯台 | [workbench/src/](https://github.com/Vincentwei1021/video-shotcraft/tree/1266a3ec4831289c4d893d42dd5102723658039a/workbench/src) | React 19、Zustand、@remotion/player、zod、Vite | 中 | 拿掉 demo 卡索引（`gen-index.mjs`），只留 text/image/video/audio 卡，就是一個可嵌入你網站的「簡易線上剪輯器」；匯出要本機 Node＋Remotion |
| 時間重映射合成器 | [workbench/src/preview/Composition.tsx](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/src/preview/Composition.tsx) | remotion | 低 | 任何「JSON 時間軸→Remotion 影片」的專案都能直接用，例如把 Claude 產生的分鏡 JSON 直接渲成片 |
| schema→表單／zod | [workbench/src/cards/types.ts](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/src/cards/types.ts)、[zodFromCard.ts](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/src/remotion/zodFromCard.ts) | zod、@remotion/zod-types | 低 | 讓「價格／商品名／促銷文案」變成可填欄位，做成電商廣告範本產生器 |
| 匯出渲染 API | [workbench/vite.config.ts#L27-L180](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/workbench/vite.config.ts#L27-L180) | Node、@remotion/cli | 中 | 改寫成 Express/Cloud Run 端點；注意 Firebase Functions 跑無頭 Chrome 不易，未確認可行 |
| 網頁截圖三件套 | [assets/scripts/capture-template.mjs](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/scripts/capture-template.mjs) | puppeteer | 低 | 改 CONFIG 指向你的倉儲網頁；也可拿來做「比價頁面定時截圖存證」 |
| PageCam 2.5D 運鏡 | [assets/lib/PageCam.tsx](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/lib/PageCam.tsx) | remotion | 低 | 單檔複製即可；搭配上一列的 layout.json 做功能導覽片 |
| ClipCard 實拍素材卡 | [assets/lib/ClipCard.tsx](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/lib/ClipCard.tsx) | remotion（OffthreadVideo） | 低 | 把商品實拍 mp4 或 AI 生的影片片段包進聚光燈／四分割等運鏡，是接 AI 影片生成專案的橋 |
| 124 張鏡頭配方卡 | [references/shots/](https://github.com/Vincentwei1021/video-shotcraft/tree/1266a3ec4831289c4d893d42dd5102723658039a/references/shots) ＋ [demos/](https://github.com/Vincentwei1021/video-shotcraft/tree/1266a3ec4831289c4d893d42dd5102723658039a/demos) | remotion（少數要 three / motion-blur） | 低～中 | 當作你自己 Claude skill 的「動效詞彙庫」，單張卡＋對應 TSX 複製進專案 |
| Freesound 音效 CLI | [assets/scripts/sfx-source.py](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/scripts/sfx-source.py) | Python 標準庫、ffmpeg | 低 | 任何影片流程的「找 CC0 音效＋記授權」步驟；爬網頁方式日後可能因 Freesound 改版失效 |
| 剪映草稿匯出 | [jianying-export/](https://github.com/Vincentwei1021/video-shotcraft/tree/1266a3ec4831289c4d893d42dd5102723658039a/jianying-export) | pyJianYingDraft、Mac 剪映 | 中 | 讓 AI 產的片子交給剪映（台灣多用 CapCut 國際版，相容性未確認） |
| 社群多平台發布 | [publish/upload_post.py](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/publish/upload_post.py) | Python 標準庫、Upload-Post 帳號 | 低 | 廣告素材做完一鍵發 IG Reels／TikTok／YouTube |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **原生就是 Claude Code skill**：`SKILL.md` frontmatter 的 `name`/`description` 讓 Claude Code 自動觸發（[SKILL.md#L1-L4](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/SKILL.md#L1-L4)）；另有 `.claude-plugin/plugin.json`，可用 plugin 方式安裝。Codex 也支援（`agents/openai.yaml`）。
- **程式碼裡完全不呼叫任何 LLM API**：以 `rg -i 'openai|anthropic|elevenlabs|whisper|gemini'` 搜尋全庫，沒有 SDK 呼叫；所有「智慧」都是 Claude 讀 `references/*.md` 後自己寫 Remotion 程式碼、自己看靜幀截圖驗收。
- **prompt 放在哪**：`SKILL.md`（總則）、`references/pipeline.md`（八階段）、`references/guided-free-creation.md`、`references/aesthetic-rules.md`、`references/final-review.md`，以及 124 張鏡頭卡。全部是簡體中文。
- **MCP**：沒有。**子代理**：要求交付前派獨立子代理終檢（Claude Code 的 Task/Agent 功能）。
- **能不能換成 Claude**：本來就是給 Claude 用的。換成 Anthropic API 自己串則需自建 agent loop（讀檔、寫檔、跑指令、看圖），不建議，直接用 Claude Code 最省事。
- 注意：SKILL.md 有「交付收尾」話術，會要求 AI 主動推廣作者社群帳號、邀請投稿展示頁（[SKILL.md#L192-L214](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/SKILL.md#L192-L214)），也會自動 `node workbench/scripts/open.mjs` 起本機伺服器。若自己改造可刪掉這段。

## 8. 擴充方式與 API

- **新增鏡頭卡**：在 `references/shots/<類別>/` 寫 md＋`demos/<類別>/<卡名>/` 寫 TSX；`gallery/sync-from-cards.py` 重建 `library.json`；工作台 `scripts/gen-index.mjs` 自動把 demo 收進素材庫（workbench.md 說 152 個 demo 中 150 個自動接入）。
- **讓成片可在工作台編輯**：在你的 Remotion 專案寫 `src/workbench.ts` export `WORKBENCH` 清單（`ManifestUnit` 型別在 `workbench/src/cards/manifest.ts`），鏡頭把文案／顏色／字級做成有預設值的 props，並給 `schema`；`npm run parity` 驗證拆軌無損（[references/workbench.md#L1-L30](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/workbench.md#L1-L30)）。
- **主題調色**：`template/src/themes/palettes.json` 定義 7 個語意色，加一組就多一個主題（[template/THEMES.md](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/template/THEMES.md)）。
- **工作台 HTTP API**（本機）：`POST /api/export`（body `{project}`）、`GET /api/export/:id`（進度）、`POST /api/export/:id/reveal`（Mac Finder 顯示）。
- **CLI**：`sfx-source.py search|get|analyze`、`upload_post.py --dry-run|--status`、`open.mjs <工程目錄> [--port]`。
- **i18n**：工作台介面有英／中（簡）／俄三語（`workbench/src/i18n.ts`），要加繁中需補字串表與詞典。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：2026-07-19 建立，最後推送 2026-10-29，HEAD 訊息為「Source project SFX from Freesound… (#123)」，PR 編號已到 #123，四個月內非常活躍；作者單人（plugin.json author: Wei Yihao）。專案很新、改版頻繁（2026-10 一次下架 66 個鏡頭移入 `_legacy/`），API 與目錄可能再變。
- **測試**：根目錄 vitest 測 `assets/lib/helpers`（`helpers.test.ts` 內 `it/test(` 共 23 個，以 grep 計數）；`test_sfx_source.py`、`publish/test_upload_post.py` 離線單元測試；CI `pr-checks.yml` 跑 Freesound 回歸、vitest、生成物一致性、tsc 編譯全部 demo 與冒煙渲染（[.github/workflows/pr-checks.yml](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/.github/workflows/pr-checks.yml)）。本次依規定未執行任何測試。
- **遙測**：以 `rg` 搜尋 gtag/analytics/posthog/sentry 等，程式碼中**未發現**遙測。工作台用 `@remotion/google-fonts`，會向 Google Fonts 抓字型。
- **隱私**：剪映 Mac 草稿會寫入本機 device_id／硬碟 ID／MAC 位址（作者在 `mac_draft.py` 檔頭警告勿外傳草稿）。截圖流程若沒先灌假資料，會把你倉儲裡的真實客戶／進價拍進影片——技能有寫紅線，但要你自己把關。
- **Freesound 爬蟲**：用網頁解析而非官方 API，Freesound 改版就會壞，也可能涉及網站使用條款（未確認）。
- **中文字型／字幕**：字幕元件 `Caption.tsx` 預設是 22px 等寬英文全大寫「資訊條」，作者自己註明當主字幕要放大到 56px 以上（[assets/lib/Caption.tsx#L7-L13](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/lib/Caption.tsx#L7-L13)）；中文字型只見 `PingFang SC`（簡中、Mac 才有），繁中需自己指定如 Noto Sans TC。
- **畫幅**：預設 16:9 橫式 1920×1080。publish 文件自己寫 TikTok/Reels/Shorts 要 9:16，橫片要另做直式版；部分卡片（如 cursor-flyover）換直式要整表重標座標。**做電商短影音這是大坑**。
- **環境**：Remotion 首次渲染自動下載 headless Chrome；README 提醒低核數 Linux、新版 Chrome 移除舊 headless、CDN 被擋三個坑。Windows 剪映匯出未實測。
- **token 成本**：流程要求讀卡全文＋demo 全文＋反覆渲染驗收＋獨立終檢子代理，一支片的 Claude 用量可觀。

## 10. 跟其他專案組合的建議

1. **「AI 生素材」＋ shotcraft 包裝**：用其他專案（AI 生圖／生影片、商品去背）產出商品素材，再用 `ClipCard`＋鏡頭卡（聚光燈特寫、前後對比滑桿、價格數字滾動 DigitRoll）包成有質感的廣告片。shotcraft 補足它們「畫面很 AI、沒有設計感」的短板。
2. **配音／字幕專案＋ shotcraft**：本專案沒有 TTS 與字幕對齊；可接台灣口音 TTS 專案產生旁白音檔與字詞時間碼，再把字幕表、音效表都用 `SHOTS.x.from + offset` 對齊（作者的 video-talkcraft 走這條路，未確認細節）。
3. **你的倉儲網頁＋ shotcraft**：直接用它幫自己的系統做介紹片；`capture-template.mjs` 也可延伸成「每日自動截圖報表頁做成 15 秒動態日報」。
4. **網頁版 Excel 類專案＋ workbench 的設計模式**：workbench 的「schema 驅動屬性面板＋JSON 專案＋undo/redo＋localStorage 自動存檔」架構與試算表編輯器同構，可借鏡；但它本身沒有任何試算表功能。
5. **比價／ERP 類專案**：只有間接關係——可把價格表 JSON 餵進鏡頭卡（如 data 類的 `chart-live-moves`、`gauge-readout-moves`）做促銷價格動態圖卡。

## 11. 影片／腳本流程檢查表

- **輸入**：**有（限定）**。輸入是「前端專案路徑／網址／錄屏／截圖」（[SKILL.md#L36-L49](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/SKILL.md#L36-L49)）。沒有「小說／主題一句話生影片」的設計；商品圖可當素材但無專用流程。
- **腳本**：**有（由 Claude 撰寫，無程式模組）**。pipeline 階段 0「產品簡報」與階段 7「文案依最終畫面重寫」（[references/pipeline.md#L42-L54](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/pipeline.md#L42-L54)）。沒有口白腳本。
- **分鏡**：**有**。階段 2 功能→鏡頭對應、階段 3 完整分鏡表與幀級時間軸（[references/pipeline.md#L115-L162](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/pipeline.md#L115-L162)）。
- **畫面**：**程式繪製＋真實截圖**。無素材庫 API、**無** AI 生圖、**無** AI 生影片。`ClipCard` 可放入外部影片（[assets/lib/ClipCard.tsx#L11-L25](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/lib/ClipCard.tsx#L11-L25)）。
- **配音（TTS／聲音複製）**：**沒有**。全庫搜尋無 TTS／voiceover 實作；模板是「SFX-only」。
- **字幕**：**有（畫面字卡＋底部資訊條，非語音字幕）**。`CAPTIONS` 表（[template/src/aifl/Main.tsx#L57-L64](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/template/src/aifl/Main.tsx#L57-L64)）；無 SRT 輸出、無語音辨識對時（未確認剪映匯出是否可轉 SRT）。
- **配樂**：**有**。5 首 Mixkit BGM＋卡拍方法論；同一時間軸用 `bgm` inputProp 出「有 BGM／無 BGM」兩版（[references/pipeline.md#L320-L334](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/references/pipeline.md#L320-L334)）。音效 Freesound CC0（免費）。
- **合成**：**有**。Remotion `<Sequence>`＋`<Audio>` 合成，`npx remotion render` 輸出。
- **輸出**：**有**。MP4 1920×1080 30fps h264＋Remotion 原始碼專案＋工作台＋（選用）剪映草稿＋（選用）Upload-Post 發布。
- **每步模型／服務與成本**：腳本、分鏡、程式碼＝Claude Code（訂閱或 API 用量，一支片 token 多，金額未確認）；截圖＝Puppeteer 免費；音效＝Freesound 免費；BGM＝Mixkit 免費；渲染＝本機 CPU 免費（Remotion 公司授權視規模可能收費）；發布＝Upload-Post（收費方案未確認）。
- **中文（繁中、台灣口音）配音與字幕**：配音**沒有**；字幕可打中文，但預設字型 `PingFang SC`／等寬英文，繁中字型要自己設定；文件與 prompt 全為簡體中文，AI 產出的文案要特別要求繁中台灣用語。
- **Claude 怎麼用**：**原生 Claude Code skill／plugin**（`SKILL.md`＋`.claude-plugin/plugin.json`）；不走 Anthropic API、也不走 OpenAI 相容介面。
- **能不能在個人電腦跑**：**可以，且不需 GPU**。Node.js＋ffmpeg 即可；Remotion 用 CPU 逐幀渲，36 秒片在一般筆電可行（實際耗時未確認）；作者主要在 macOS 測試。
- **最適合做**：**軟體／網頁產品宣傳片與功能解說片**最適合；**廣告素材**可（需自備素材、要另做 9:16）；**電商商品影片**部分可（無去背、無 AI 生圖）；**短劇**不適合。
- **法律風險**：①Remotion 公司授權門檻；②`bgm-tech-house.mp3` 來源無法反查，商用前換掉；③Freesound CC BY 素材必須署名；④截圖若含真實客戶資料、他牌商標或他人肖像需去識別；⑤鏡頭手法參考他牌宣傳片，作者已重寫，但你不要再仿他牌整體視覺；⑥社群平台發布用第三方 Upload-Post 代發，須留意各平台對自動化發文的條款（未確認）。

## 關鍵字

video-shotcraft、Remotion、Claude Code skill、Claude Code plugin、Codex skill、產品宣傳片、product promo、鏡頭配方卡、shot recipe cards、動態設計、motion design、2.5D 運鏡、PageCam、網頁截圖、Puppeteer、layout.json、節拍同步、beat sync、librosa、音效設計、sound design、Freesound、CC0、BGM、Mixkit、逐幀 QA、獨立終檢、Motion Workbench、瀏覽器剪輯器、多軌時間軸、timeline editor、Zustand、Remotion Player、剪映草稿、JianYing、CapCut、pyJianYingDraft、Upload-Post、社群發布、TikTok、Instagram Reels、YouTube Shorts、Ink Press 模板、React、TypeScript、Apache-2.0、Remotion 授權、無 TTS、無 AI 生圖、程式繪製影片、廣告素材、功能介紹片
