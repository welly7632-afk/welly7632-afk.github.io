# remotion-dev/skills — Remotion 官方 Agent Skills：讓 Claude Code 用 React 程式碼「寫」出影片
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：c7cb2fd
> GitHub：https://github.com/remotion-dev/skills｜⭐ 6335｜授權：repo 內無 LICENSE 檔（GitHub 未偵測）；實際使用的 Remotion 本體為 Remotion 自訂授權｜主要語言：TypeScript｜最近更新：2026-11-02

SHA 全碼：`c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271`

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

這是 Remotion 團隊官方維護的「Agent Skills 包」：一組 `SKILL.md` + 參考文件，裝進 Claude Code（或 Codex、Cursor）之後，Claude 就知道怎麼「用 React／TypeScript 程式碼寫影片」、怎麼開 Remotion Studio 預覽、怎麼渲染出 MP4、怎麼加字幕、AI 配音、轉場、特效。它本身**不是一個影片生成 App**，而是給 AI 的「操作手冊」。

對你（台灣電商＋投廣告＋想做短劇）可以拿來：
- **商品宣傳短影片／廣告素材**：跟 Claude Code 說 `/remotion-create 幫我做一支 15 秒直式商品廣告，用這三張商品圖`，Claude 會建專案、寫動畫、開預覽。
- **批量產生廣告變體**：用 `parameters.md`（Zod schema 參數化）把「商品名、價格、主色、圖片」變成參數，同一個模板換資料就產出 N 支影片——這點跟你倉儲 App 的商品資料最好接。
- **短劇／口播影片後製**：`remotion-captions`（Whisper 本機轉字幕＋字幕顯示）、`voiceover.md`（ElevenLabs TTS 配音並自動依音檔長度決定影片長度）、`silence-detection.md`（自動剪掉靜音段）、`transitions.md`（場景轉場）。
- **做成自己的網頁工具**：`remotion-saas` 告訴你怎麼用 `<Player>` 把影片預覽嵌進網頁，以及在 Lambda／Vercel／Node 伺服器渲染——將來可以在你自己的 Firebase 後台加一個「一鍵出商品影片」按鈕（但渲染需要另外的伺服器，見第 3 節）。

與試算表（網頁版 Excel）、比價／ERP 無直接關係。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **這個 repo 本身**：我在 checkout 的檔案清單中找不到 `LICENSE` 檔（`git ls-tree` 共 299 個檔案，無任何 LICENSE／COPYING），GitHub 也顯示「-」。`package.json` 標註 `"private": true`，`repository.url` 指向 `remotion-dev/remotion` monorepo 的 `packages/skills`——也就是說這個 repo 是從主 monorepo 同步出來的鏡像。正式授權條款：**未確認**（沒有檔案就是「保留所有權利」的預設狀態，但官方明確鼓勵 `npx skills add` 安裝使用）。
- **真正要注意的是 Remotion 本體的授權**：skills 只是說明書，產出的影片專案會依賴 `remotion`、`@remotion/*` 套件，這些受 Remotion 自訂授權規範。repo 內 `remotion-license` skill 只放了連結（License、License FAQ、Terms，購買處 remotion.pro），條文本身不在 repo 中。依 Remotion 官方一向的說法（請自行到 remotion.dev/docs/license 核對最新版）：個人、非營利、以及小規模公司可免費使用；超過門檻的公司需購買 Company License。具體門檻人數在本 repo 內**未確認**。
- **個人使用**：可以放心用。
- **公司商用**：你是小商家，大機率在免費範圍內，但要用 Remotion 做商業廣告前，請到官方 License FAQ 確認員工人數門檻；若將來做成 SaaS 給別人用（`remotion-saas`），更要確認。
- **付費／閉源部分**：skills 本身沒有付費版。但流程會碰到付費第三方服務：ElevenLabs（配音）、Mapbox／MapTiler（地圖金鑰）、AWS Lambda／Vercel（雲端渲染）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

（收藏型 repo，簡述）
- **repo 本身**：Markdown 為主（74 個不重複 `.md`），外加 5 支 TypeScript 維護腳本（`scripts/`，給 Remotion 團隊同步用，使用者不需要跑）。
- **用它產生的影片專案**：Node.js + React + TypeScript（Remotion 4.x，skills 版本標 `4.0.540`），由 `npx create-video@latest --yes --blank --no-tailwind` 建立。無資料庫。
- **預覽**：`npx remotion studio`（本機瀏覽器）。**渲染**：`npx remotion render`（內建下載 headless 瀏覽器＋FFmpeg）。
- **硬體**：一般電腦即可渲染；只有 `@remotion/whisper-webgpu` 轉字幕需要相容 GPU（`transcribe-captions.md` 寫明「A compatible GPU is required. ONNX Runtime does not work on Linux arm64」）。
- **API Key**：Claude Code 本身（Claude 訂閱或 API 費用）；選用：`ELEVENLABS_API_KEY`（配音）、Mapbox／MapTiler key（地圖）、AWS 金鑰 `REMOTION_AWS_ACCESS_KEY_ID`（Lambda 渲染）。費用金額 repo 內未寫，**未確認**。
- **你的 Firebase 環境**：Firebase Hosting 只能放 `<Player>` 預覽頁；伺服器端渲染需要能跑 headless Chrome 的環境（Cloud Run／Lambda／自己的電腦），Firebase Functions 能否跑 **未確認**。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

```
README.md                         安裝方式＋13 個 skill 清單（由 sync-readme.ts 產生）
package.json                      @remotion/skills，private，version 4.0.540
scripts/
  sync-agent-skills.ts            在 monorepo 內建 .agents/skills、.claude/skills 的 symlink
  prepare-embedded-skills.ts      把各 skill 的 SKILL.md 改名為 REFERENCE.md、移除跨 skill 連結
  sync-embedded-skills.ts         把 12 個子 skill 複製進 remotion-best-practices/
  sync-readme.ts / validate-links.ts   產生 README、檢查連結
skills/
  remotion-best-practices/        「路由器」skill：SKILL.md + 內嵌全部 12 個子 skill（REFERENCE.md）
  remotion-create/                建立新專案／新影片（+ video-layout.md 版面規則、tailwind.md）
  remotion-markup/                最大宗：33 個主題檔（動畫、音訊、字型、特效、轉場、配音…）
    remotion-maps/                地圖 skill 的內嵌副本
  remotion-studio/                開 Studio 預覽
  remotion-render/                渲染影片／靜態圖、透明背景影片
  remotion-captions/              轉字幕、匯入 SRT、顯示字幕
  remotion-interactivity/         讓程式碼結構可在 Studio 中被拖拉編輯
  remotion-maps/                  地圖動畫：static-map / mapbox / maplibre / maptiler / cesium 五種技法
  remotion-multimedia/            Mediabunny 讀影音長度、尺寸
  remotion-saas/                  把 Remotion 做成網頁 App（Player、雲端渲染）
  remotion-docs/                  用 Algolia 搜官方文件、抓 .md 版
  remotion-license/               授權連結
  remotion-upgrade/               升級 Remotion 與 skills
  每個 skill 都有 agents/openai.yaml（給 Codex 的顯示名稱、預設 prompt）與 assets/remotion-icon.svg
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

| 功能 | 位置 | 實作重點 |
|---|---|---|
| 技能路由 | [skills/remotion-best-practices/SKILL.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-best-practices/SKILL.md) | 依使用者意圖（建立影片、寫 markup、地圖、字幕、SaaS、授權、升級）指向對應的 `REFERENCE.md`；並規定「除非使用者明確要求，否則不要渲染，先開 Studio 預覽」 |
| 建專案 | [skills/remotion-create/SKILL.md#L10-L39](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-create/SKILL.md#L10-L39) | 先檢查資料夾是否為空（只刪 `.DS_Store` 這類系統檔，`.env`、`.git` 不可動），再 `npx create-video@latest --yes --blank --no-tailwind` |
| 動畫寫法規則 | [skills/remotion-markup/SKILL.md#L16-L98](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-markup/SKILL.md#L16-L98) | 一律 `useCurrentFrame()` + `interpolate()`，禁止 CSS transition／Tailwind 動畫（渲染不正確）；`fps` 取自 `useVideoConfig()`；`interpolate` 寫在 style 裡方便 Studio 編輯 |
| 特效清單 | [skills/remotion-markup/SKILL.md#L183-L223](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-markup/SKILL.md#L183-L223) | `@remotion/effects` 內建 76 種效果（數 SKILL.md 第 217–223 行中不重複的 `xxx()` 名稱；色調、模糊、光暈、扭曲、材質、像素化），可直接掛在 `<Video>` 的 `effects` |
| AI 配音 | [skills/remotion-markup/voiceover.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-markup/voiceover.md) | 每個場景呼叫 ElevenLabs `eleven_multilingual_v2` 產 MP3 存到 `public/`，再用 `calculateMetadata` 依音檔長度算影片總長 |
| 字幕 | [skills/remotion-captions/SKILL.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-captions/SKILL.md)、`transcribe-captions.md`、`display-captions.md` | 統一用 `Caption` JSON 型別（text/startMs/endMs）；Whisper WebGPU 本機轉錄；顯示用官方 Basic Captions 元件，字幕陣列要「內嵌」在 prop 裡才能在 Studio 編輯 |
| 參數化影片 | [skills/remotion-markup/parameters.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-markup/parameters.md) | Zod schema 定義 props，Root 傳給 `<Composition schema=...>` |
| 多場景／轉場 | [skills/remotion-markup/multi-scene-video.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-markup/multi-scene-video.md)、`transitions.md` | 獨立起點用 `Track`；相鄰場景用 `TransitionSeries`，轉場會縮短總長需扣除重疊 |
| 渲染 | [skills/remotion-render/SKILL.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-render/SKILL.md) | `npx remotion render`、`npx remotion still`、`--frames=0,30,90` 抽圖檢查 |
| 雲端渲染 | [skills/remotion-saas/rendering.md#L28-L49](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-saas/rendering.md#L28-L49) | Lambda 9 步驟設定清單；提醒「不要叫使用者把金鑰貼到對話裡」，正式上線前處理限流、驗證、成本控制 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整包 skills | [skills/](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/) | Claude Code | 低 | `npx skills add remotion-dev/skills` 或 `gh skill install remotion-dev/skills`，或手動複製到專案 `.claude/skills/` |
| 影片版面規則 | [skills/remotion-create/video-layout.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-create/video-layout.md) | 無 | 低 | 9 行規則（安全邊界 80/100px、標題 ≥84px、輔助字 ≥44px），可直接抄進你自己的「商品影片」skill |
| 配音＋自動長度 | [skills/remotion-markup/voiceover.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-markup/voiceover.md) | ElevenLabs、Remotion | 中 | 把 ElevenLabs 換成其他 TTS；腳本由 Claude 寫，再配音→影片長度自動對齊，適合短劇／口播 |
| 字幕流程 | [skills/remotion-captions/](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-captions/) | `@remotion/captions`、whisper-webgpu、GPU | 中 | `Caption` JSON 格式可當你所有影片工具的共用字幕格式；也可匯入 SRT |
| 參數化模板 | [skills/remotion-markup/parameters.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-markup/parameters.md) | Zod | 低 | 從倉儲 App（Firebase）匯出商品 JSON → 當 props 批量渲染廣告 |
| 靜音偵測 | [skills/remotion-markup/silence-detection.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-markup/silence-detection.md) | FFmpeg | 低 | `loudnorm` 量測＋`silencedetect` 自動門檻，任何口播剪輯工具都能用 |
| 音效清單 | [skills/remotion-markup/sfx.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-markup/sfx.md) | 網路 | 低 | remotion.media 上的 whoosh、ding、shutter 等現成音效 URL（版權條件**未確認**） |
| SaaS 架構指引 | [skills/remotion-saas/rendering.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-saas/rendering.md) | AWS／Vercel | 高 | 做「後台一鍵出影片」時的選型參考 |
| 文件查詢 skill 寫法 | [skills/remotion-docs/SKILL.md](https://github.com/remotion-dev/skills/blob/c7cb2fdcacd134fb2ccb9b7a44f9ffa44e467271/skills/remotion-docs/SKILL.md) | Algolia 公開 key | 低 | 「搜尋 → 取 .md → 依最新文件實作」的模式可套到任何框架 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **本身就是 Agent Skills 格式**（`SKILL.md` + YAML frontmatter `name`/`description`/`version`），README 點名支援 Claude Code、Codex、Kimi Code、Cursor ——**Claude 原生支援**，不需替換。
- `scripts/sync-agent-skills.ts` 在主 monorepo 中把 skills 連到 `.agents/skills` 與 `.claude/skills`，顯示 Remotion 團隊自己就用 Claude Code 開發。
- 每個 skill 的 `agents/openai.yaml` 是給 OpenAI Codex 的介面設定（顯示名、`default_prompt` 如 `$remotion-best-practices: Make a promo video for my product`）。
- 影片內的 AI：ElevenLabs（配音）、Whisper（字幕，本機 GPU）。**沒有**內建生成畫面／生成影片的 AI（如文生影片），畫面全部是 React 程式碼＋你的素材。
- `remotion-best-practices/SKILL.md` 提到 Studio 支援 WebMCP tools；本 repo 未附 MCP 伺服器。
- 我用 `grep -i claude` 搜 skills 內 Markdown，沒有任何專屬 Claude 的指令，內容與模型無關。

## 8. 擴充方式與 API

- 新增自己的 skill：仿照資料夾結構 `skills/<name>/SKILL.md` + 子主題 `.md`，主檔只放「何時讀哪個檔」，細節拆檔（漸進式載入）。
- 升級：`npx remotion upgrade` 會一起更新專案內的 skills；或 `npx skills update remotion-best-practices ... --yes`（`remotion-upgrade/SKILL.md` 列出全部 13 個名稱）。
- Remotion 端 API：`<Composition>`、`calculateMetadata`、`<Player>`、`@remotion/renderer`、`@remotion/lambda`——skills 都只給連結，以官方文件 `.md` 版為準。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：極活躍。2026-01 建立，最近推送 2026-11-02，版本號跟 Remotion 主版本同步（4.0.540），由官方 monorepo 自動同步。
- **測試**：有 `validate-links.ts` 檢查連結；沒有對 skill 效果的自動評測（**未確認**主 monorepo 是否有）。
- **重複內容**：`remotion-best-practices/` 內含其他 12 個 skill 的副本（144 個檔案），`remotion-markup/remotion-maps/` 又是地圖 skill 副本（32 個檔案）。安裝全部時 token 不會全載入（漸進式），但改寫時要知道哪份是正本。
- **資安／隱私**：`remotion-docs` 內含 Algolia 的公開搜尋 key（唯讀搜尋用，屬正常）；skills 會讓 Claude 執行 `npx` 安裝、下載瀏覽器與 Whisper 模型；配音腳本會把文字送到 ElevenLabs。repo 本身無遙測程式碼。
- **已知的坑**：CSS／Tailwind 動畫渲染不正確；Whisper 需 GPU；Lambda 函式綁定 Remotion 版本，升級要重新部署；新 AWS 帳號可能要申請併發上限；中文字型需另外用 Google Fonts／本機字型載入（skills 有 `google-fonts.md`、`local-fonts.md`，但沒有針對中文的特別說明）。
- **授權**：最大風險是 Remotion 本體的公司授權門檻，見第 2 節。

## 10. 跟其他專案組合的建議

- **＋ 你的倉儲 App（Firebase）**：匯出商品 JSON（名稱、售價、圖片 URL）→ Remotion 參數化模板（`parameters.md`）→ 批量出 9:16 廣告影片。最簡單的 A+B。
- **＋ 腳本生成類專案**（同資料夾的 `coreyhaines31__marketingskills`、`irinabuht12-oss__marketing-skills`）：先用行銷 skill 讓 Claude 寫廣告腳本／分鏡，再交給 `/remotion-create` 實作畫面＋`voiceover.md` 配音。
- **＋ `digitalsamba__claude-code-video-toolkit`、`heygen-com__hyperframes`、`calesthio__OpenMontage`**：同類「Claude 寫程式出影片」路線，可比較取長補短；Remotion 的強項是官方維護、Studio 可視化編輯。
- **＋ MoneyPrinterTurbo／huobao-drama 類**：那些負責「素材生成（文生圖／圖生影片）」，Remotion 負責「排版、字幕、品牌片頭片尾」的最後組裝。
- **＋ 短劇**：把劇本拆成場景 → 每場一個 `TransitionSeries.Sequence` → 每場配音＋字幕（captions + voiceover），用 Studio 微調。

## 11. 收錄內容整理

**怎麼數**：用 `git ls-tree -r --name-only HEAD` 取得全部 299 個檔案，其中 `skills/` 下 291 個。扣掉 `skills/remotion-best-practices/remotion-*/`（144 個，經 `diff -rq` 確認為其他 skill 的副本，只差在 SKILL.md 改名為 REFERENCE.md 與連結文字）以及 `skills/remotion-markup/remotion-maps/`（32 個，地圖 skill 的近似副本，`static-map/TECHNIQUE.md` 有少量差異）後，不重複內容 115 個檔案、其中 74 個 `.md`。頂層 skill 共 **13 個**（`ls skills/`）。

### 13 個 skills（每項一句話）
1. `remotion-best-practices`：總路由，不確定用哪個就用它（113 行）。
2. `remotion-create`：建立新專案與影片構圖、版面規則（75 行＋2 子檔）。
3. `remotion-markup`：寫 Remotion React 的全部最佳實務（328 行＋33 個主題檔）。
4. `remotion-studio`：開 Studio 預覽並保持開著讓使用者即時看。
5. `remotion-render`：渲染 MP4／靜態圖／指定影格、透明影片。
6. `remotion-maps`：地圖動畫，五種技法（static-map、Mapbox、MapLibre、MapTiler、CesiumJS）。
7. `remotion-captions`：轉錄、匯入 SRT、顯示字幕。
8. `remotion-saas`：Player 嵌入、Lambda／Vercel／Node／Cloudflare 渲染、SaaS 範本。
9. `remotion-interactivity`：讓程式碼可在 Studio 拖拉編輯（schema 欄位類型表）（332 行）。
10. `remotion-docs`：Algolia 搜官方文件＋抓 `.md`。
11. `remotion-license`：授權連結。
12. `remotion-upgrade`：升級 Remotion 與 skills。
13. `remotion-multimedia`：Mediabunny 讀影音長度、影片尺寸。

### `remotion-markup` 33 個主題檔（依類別）
- 結構：`compositions`、`connected-compositions`、`multi-scene-video`、`sequencing`、`timing`、`timing-props`、`calculate-metadata`、`parameters`、`video-editing`
- 媒體：`embedding-videos`、`audio`、`images`、`gifs`、`lottie`、`3d`、`html-in-canvas`
- 聲音：`voiceover`、`sfx`、`audio-visualization`、`silence-detection`、`ffmpeg`
- 視覺：`effects`、`color-correction`、`light-leaks`、`motion-blur`、`transitions`、`text-highlights`、`cropping`
- 文字／量測：`google-fonts`、`local-fonts`、`arabic-text`、`measuring-text`、`measuring-dom-nodes`
（計數方式：`ls skills/remotion-markup/*.md` 共 34 檔，扣掉 SKILL.md 為 33 個主題檔。）

### 對你最有用的前 10 項＆怎麼用
1. **`remotion-create`**：`/remotion-create 做一支 15 秒 1080x1920 商品廣告，主打 XX 收納箱，價格 NT$399`。
2. **`video-layout.md`**：要求 Claude 遵守安全邊界與字級，手機看得清楚。
3. **`parameters.md`**：把商品名／價格／圖片變參數，一個模板產出全部商品影片。
4. **`voiceover.md`**：中文口播用 `eleven_multilingual_v2`，影片長度自動跟配音對齊。
5. **`remotion-captions`**：自動上字幕（Whisper），短影音必備；已有 SRT 可直接匯入。
6. **`transitions.md`**＋**`light-leaks.md`**：場景轉場、漏光效果，廣告質感。
7. **`text-highlights.md`**：價格／賣點用手繪圈選、螢光筆效果強調。
8. **`sfx.md`**：whoosh、ding、shutter 等現成音效直接掛。
9. **`silence-detection.md`**：口播／短劇素材自動剪掉空白。
10. **`remotion-render`**：`npx remotion render`；先用 `--frames` 抽幾張圖檢查。

（加分：`google-fonts.md` 載入思源黑體等中文字型；`remotion-saas` 等你想做成後台按鈕時再看。）

### 值得學的 prompt／skill 寫法
- **路由器模式**：`remotion-best-practices/SKILL.md` 只寫「情境 → 載入哪個檔」，例：「If the user asks to make, create, or build a new video… load [Create a new Remotion video]」。主檔短、細節延後載入，省 token。
- **預設行為限制**：「Don't render the video by default unless they are very explicit… E.g. "Render the video", "Export", "Give me the MP4".」——明確列出觸發字，避免 AI 自作主張。
- **保護使用者修改**：多個 skill 開頭都有「Preserve user changes… don't overwrite it, assume it was intentional or ask for confirmation.」
- **👍／👎 對照範例**：`remotion-markup/SKILL.md` 用正反兩段程式碼說明偏好寫法，比純文字規則有效。
- **安全提醒內建**：`rendering.md`「never ask the user to paste secrets into chat」。
- **選擇題式技法**：`remotion-maps/SKILL.md`「Choose exactly one technique… then load only that technique's TECHNIQUE.md」，每個技法資料夾可獨立刪除。
- **具體數字取代形容詞**：`video-layout.md` 直接給「Main headline: 84px」而非「字要大」。

這些寫法很適合你將來寫自己的「倉儲商品影片 skill」或「試算表操作 skill」。

## 關鍵字
Remotion、Agent Skills、Claude Code、SKILL.md、React 影片、程式碼生成影片、商品影片、廣告素材、短影音、短劇、字幕、Whisper、AI 配音、ElevenLabs、TTS、轉場、TransitionSeries、Remotion Studio、渲染、Lambda、Player、參數化影片、Zod、批量影片、地圖動畫、video generation、captions、voiceover、programmatic video
