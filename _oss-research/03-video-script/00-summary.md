# 影片・腳本（AI）：總結與組合建議（2026-11-04）

> 範圍：本資料夾 25 份資料包（`03-video-script/*.md`，不含本檔）與對應的 `cards/*.json`。本文只根據這些資料包整理，沒有另外 clone 或上網查證。資料包寫「未確認」或彼此說法不同的地方，本文會直接標出來，不替你選邊。費用數字都是資料包轉述 README 或作者估算，**不是實測報價**。

## 先講結論

1. **沒有一個專案能一次做完「繁中台灣口音＋電商＋短劇」**。比較實際的做法是三段式：**Claude 寫腳本與分鏡 → 便宜或免費的配音與字幕 → 用程式碼渲染合成**，需要真人或寫實畫面時，才另外接付費的 AI 生影片 API。
2. **電商商品影片（最快見效）**：用 [HyperFrames](heygen-com__hyperframes.md)（Apache-2.0，適合度 5／5）或 [Remotion](remotion-dev__remotion.md) 當合成引擎，把倉儲系統（Firestore）的商品資料匯出成 JSON 批次出片。腳本的 prompt 參考 [ClipForge](xixihhhh__clipforge.md) 與 [小黑老師 MK-284](backtrue__thinkwithblack-skill.md)，配音用 Edge TTS 的 `zh-TW-*` 聲音。只用 HTML 動畫加本機 TTS 的話，每支幾乎 0 元。
3. **想先「裝了就能用」**：[MoneyPrinterTurbo](harry0703__MoneyPrinterTurbo.md)（MIT）有內建 `zh-TW` Edge 聲音，可以用 Claude 訂閱的 `claude` CLI 寫腳本，也能吃自有商品圖。這是門檻最低的一鍵出片工具。
4. **廣告素材多版本 A/B**：[Hypit](hypit-ai__hypit.md)（自訂授權，內部用與接案可以，做 SaaS 要授權）搭配 [marketingskills 的 ad-creative](coreyhaines31__marketingskills.md) Hook 矩陣。拆競品廣告則用 [claude-video](bradautomates__claude-video.md)。
5. **短劇**：劇本、分鏡與一致性規範用 [drama-skills](zenstory-ai__drama-skills.md)（MIT，Claude Code 原生），想要畫布介面就加 [Toonflow](HBAI-Ltd__Toonflow-app.md)（MIT v2.x，原生接 Claude 與 MCP）。畫面靠 Seedance 或 MiniMax 這類付費雲端 API，樣片成本約人民幣 40 元／68 秒。[huobao-drama](chatfire-AI__huobao-drama.md) 是 **CC BY-NC-SA，禁止商用**，只能拿來學概念。
6. **配音**：本機最完整的是 [VoiceStudio](debpalash__VoiceStudio.md)，但**預設的 OmniVoice 權重是 CC-BY-NC（非商用）**，投廣告前一定要換成可商用的引擎。目前只有 Edge TTS 這一條路有現成的台灣口音聲音，而 **Edge TTS 能不能商用，所有資料包都寫「未確認」**。
7. **授權地雷**：AGPL 的有 MoneyPrinterV2、OpenMontage、VoiceStudio、ClipForge；禁止商用的是 huobao-drama；Remotion 公司規模一大就要付費（門檻說法不一，見第 5 節）；Hypit 用自訂授權。**拆零件時只抄 MIT／Apache 的程式碼，AGPL 與 NC 的部分「看懂後請 Claude 重寫」**。
8. **繁中在地化是每個專案都要補的功課**：多數專案預設簡體字型、prompt 寫死「简体中文」、用空白斷字，Whisper 輸出繁簡也不固定。[lemo-opuscar](lemomo-ai__lemo-opuscar.md) 的 DIRECTOR.md 甚至寫死中國地圖規則。詳見第 4 節。

---

## 1. 25 個專案分類比較表

適合度沿用 cards 的 `fit_for_user`（1–5）。「Claude 支援」中，「原生」指附 Claude Code skill、外掛或 MCP，或直接呼叫 Anthropic；「可接」指要經 OpenAI 相容介面或小改程式。

### 1-1 一鍵出片

| 專案 | Claude 支援 | 本機跑 | 大概成本 | 繁中／台灣口音 | 授權（個人／商用） | 適合度 |
|---|---|---|---|---|---|---|
| [MoneyPrinterTurbo](harry0703__MoneyPrinterTurbo.md) | 原生（Anthropic 經 OpenAI 相容端點＋`claude` CLI＋SKILL.md） | 可，4 核 4 GB、免 GPU | 免費路線（Pexels＋Edge＋內建 BGM）幾乎 0 元；AI 生影片按秒計費 | **有** `zh-TW-HsiaoChen/HsiaoYu/YunJhe`；內附字型為商業字型 | MIT／MIT（字型不在 MIT 範圍，Edge 商用未確認） | 4 |
| [ClipForge](xixihhhh__clipforge.md) | 可接（OpenAI 相容 LLM），另有 MCP 30 個工具與 Skill | 可，CPU 加 FFmpeg | 免費路線 0 元；AI 生圖與生影片價格即時讀取，未確認 | 字幕沒有簡轉繁；Edge 台灣音色可傳入，未實測；合規詞庫只針對中國法規 | AGPL：自用可；架站給別人用就要開源 | 4 |
| [MoneyPrinterV2](FujiwaraChoki__MoneyPrinterV2.md) | 可接（要改 `llm_provider.py`） | 可（Ollama＋KittenTTS） | Gemini 生圖付費（有張數爆量問題） | **沒有**（TTS、字型、字幕三處都要換） | AGPL | 2 |

### 1-2 Claude 原生影片工具（程式碼出片、工具箱）

| 專案 | Claude 支援 | 本機跑 | 大概成本 | 繁中／台灣口音 | 授權（個人／商用） | 適合度 |
|---|---|---|---|---|---|---|
| [HyperFrames](heygen-com__hyperframes.md) | 原生（外掛、skills，另有託管 MCP） | 可，Node 22＋FFmpeg，免 GPU | HTML 加本機 Kokoro 0 元；HeyGen 生影片 $0.018／秒、生圖 $0.067／張、數位人 $4.83／分 | 字幕要自備繁中字型；Kokoro 只有普通話，台灣腔大致沒有 | Apache-2.0；Pro 功能與 HeyGen credits 另付；**CLI 遙測預設開啟** | **5** |
| [Remotion](remotion-dev__remotion.md) | 原生（官方外掛＋skills） | 可，CPU 渲染 | 渲染免費；範本用 OpenAI 與 ElevenLabs，付費 | 可用任何中文字型；範本 prompt 強制英文；TikTok 字幕分頁依賴空白 | 個人免費；**員工 4 人以上要買 Company License**，且不能轉賣衍生工具 | 4 |
| [remotion-dev/skills](remotion-dev__skills.md) | 原生（13 個 skills） | 同 Remotion | 0（Remotion 授權另計） | `google-fonts.md` 可載入思源黑體 | skills 沒有授權檔（未確認） | 4 |
| [OpenMontage](calesthio__OpenMontage.md) | 原生（CLAUDE.md、skills、commands） | 可；本機生影片要 6–14 GB VRAM | 免費路線 0 元；Kling 約 $0.10／5 秒起、Veo $0.20–0.40／秒 | 部分；程式中 grep 不到 `zh-TW`；Google TTS 理論上能指定台灣聲音 | AGPL＋Remotion 授權 | 4 |
| [claude-code-video-toolkit](digitalsamba__claude-code-video-toolkit.md) | 原生（skills、commands、MCP） | 合成可在本機；AI 生成要雲端 GPU（Modal、RunPod） | README 範例：52 秒直式片約 $0.80 | 中文字幕要改；Python 範本沒有中文字型；Qwen3-TTS 中文是否台灣腔未確認 | MIT；FLUX klein-9B 非商用、LTX 不得去浮水印 | 4 |
| [Hypit](hypit-ai__hypit.md) | 原生（Skill＋SVML） | 可，建議 16 GB RAM | 18–26 秒約 US$1.07–1.15（README） | 中文逐字字幕 OK，要自備字型；台灣口音未確認；有「顯示／唸法」語法 | **自訂授權**：內部與接案可；SaaS 或轉售要書面授權，不得移除 LOGO | 4 |
| [lemo-opuscar](lemomo-ai__lemo-opuscar.md) | 原生（plugin、skill） | 可；3D 風格要 GPU | 只花 Claude token；TTS、配樂、渲染都免費 | edge-tts 可換 `zh-TW`（未驗證）；**DIRECTOR.md 有中國地圖規則** | MIT；demo 影片 CC BY；edge-tts 商用未確認 | 4 |
| [Open Design](nexu-io__open-design.md) | 原生（CLI、MCP、Anthropic BYOK） | 可，Node 24 或桌面版 | 生成按各家 API，未確認 | 介面有 zh-TW；台灣口音未確認 | Apache-2.0；範本混用 CC-BY；**桌面版遙測預設開** | 4 |
| [video-shotcraft](Vincentwei1021__video-shotcraft.md) | 原生（skill、plugin） | 可，免 GPU | 只花 Claude token；BGM 與音效免費 | 沒有配音；預設字型 `PingFang SC` | Apache-2.0＋Remotion；`bgm-tech-house.mp3` 來源不明，商用前要換 | 3 |

### 1-3 短劇平台

| 專案 | Claude 支援 | 本機跑 | 大概成本 | 繁中／台灣口音 | 授權（個人／商用） | 適合度 |
|---|---|---|---|---|---|---|
| [drama-skills](zenstory-ai__drama-skills.md) | 原生（12 個 skills） | 可，Python＋ffmpeg | 68 秒樣片影片生成約人民幣 40 元 | 字型 SC、文件簡中；語言標籤可設 `zh-Hant-TW` | MIT／MIT | 4 |
| [Toonflow](HBAI-Ltd__Toonflow-app.md) | 原生（Anthropic API、MCP、SKILL） | 可，桌面版免 GPU | 案例：腳本約人民幣 10 元，Seedance 約 120 元／2 分鐘 | 介面有繁中；SKILL 預設輸出簡體；沒有 TTS 與字幕 | MIT（只限 v2.x）；**遙測預設開** | 4 |
| [ViMax](HKUDS__ViMax.md) | 可接（OpenRouter） | 可，免 GPU | 2 分鐘估 USD 20–60（估算） | 沒有專門支援；沒有字幕 | MIT | 3 |
| [huobao-drama](chatfire-AI__huobao-drama.md) | 可接 | 可（只是控制台，全雲端） | 全付費 API，未確認 | 只有簡中，沒有字幕 | **CC BY-NC-SA：禁止商用** | 3 |

### 1-4 配音、剪輯、影片理解

| 專案 | 類型 | Claude 支援 | 本機跑 | 成本 | 繁中／台灣口音 | 授權 | 適合度 |
|---|---|---|---|---|---|---|---|
| [VoiceStudio](debpalash__VoiceStudio.md) | 配音、聲音複製、字幕 | 原生（API、CLI、MCP、SKILL） | 可，建議 6 GB VRAM 或 Apple Silicon | 本機免費 | 普通話可；繁中字幕靠翻譯成 `zh-TW`；台灣腔要用錄音複製 | AGPL；**預設權重 CC-BY-NC** | 4 |
| [video-use](browser-use__video-use.md) | 剪輯（口播、實拍） | 原生（Skill） | 可（轉錄打 ElevenLabs Scribe） | Scribe 按時長計費 | 字幕要改（空白串字、沒有中文字形） | MIT | 4 |
| [NarratoAI](linyqh__NarratoAI.md) | 解說剪輯 | 可接（OpenAI 相容） | 可 | 預設矽基流動，作者稱 10 分鐘約人民幣 0.1 元（未驗證） | Edge `zh-TW` 有；**解說 prompt 寫死「简体中文」** | MIT（素材版權風險高） | 3 |
| [claude-video](bradautomates__claude-video.md) | 看影片、拆解（輸入端） | 原生（plugin） | 可，免 GPU | 本機引擎免費 | 可指定 `zh-TW` 字幕軌；WhisperX 無法指定繁體 | MIT | 4 |

### 1-5 提示詞、素材收藏與行銷 skills

| 專案 | 類型 | 內容 | 繁中 | 授權 | 適合度 |
|---|---|---|---|---|---|
| [awesome-claude-video-skills](zhuyansen__awesome-claude-video-skills.md) | 目錄 | 413 個影片 skill，附安全評級與 16 個實測 | 簡中 README | CC0（收錄專案要個別看授權） | 4 |
| [awesome-opus5-5-videos](yihui-dev__awesome-opus5-5-videos.md) | 提示詞收藏 | 703 則 Opus 5.5 寫程式做動畫的 prompt | 115 檔含中日文 | MIT **不涵蓋 prompt 原文** | 3 |
| [thinkwithblack-skill](backtrue__thinkwithblack-skill.md) | 行銷 skills | 365 個**繁中台灣**行銷方法，含影片 14 份（MK-279～292） | **原生繁中** | MIT | 4 |
| [marketingskills](coreyhaines31__marketingskills.md) | 行銷 skills | 53 個，含 ad-creative、video、social | 英文 | MIT | 4 |
| [marketing-skills（irinabuht12）](irinabuht12-oss__marketing-skills.md) | 廣告健檢 skills | 49 個（Google、Meta 健檢等） | 英文 | 作者稱 MIT，但**沒有 LICENSE 全文** | 3 |

---

## 2. 流程拆解：每一步最好的零件

原則是：**優先拿 MIT 或 Apache 的零件；AGPL 與 NC 的零件標 ⚠，只參考做法、自己重寫**。

### 2-0 前置：拆解競品與爆款（選用但很值得做）

| 零件 | 位置 | 為什麼選它 |
|---|---|---|
| 場景切換抽幀、去重、限量 | [claude-video frames.py#L231-L581](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L231-L581) | MIT；抽出的圖對應鏡頭切點，送給 Claude 的張數有上限，成本可控 |
| 只抓字幕不下載影片 | [claude-video download.py#L96-L162](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/download.py#L96-L162) | 可指定 `sub_lang='zh-TW'`，適合批次收集爆款腳本 |
| 瀏覽器端場景偵測（183 行純 TS） | [Toonflow sceneDetector.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/nodes/frameAnalysisNode/src/sceneDetector.ts) | MIT、沒有外部依賴，可以直接放進你的純 JS 網頁 |
| 對標片鏡長與節奏測量 | [drama-skills breakdown_tool.py](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-breakdown/scripts/breakdown_tool.py) | MIT，量切點與節奏 |

### 2-1 腳本

| 零件 | 位置 | 說明 |
|---|---|---|
| 繁中 Shorts 逐鏡腳本 skill | [thinkwithblack MK-284](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-284/SKILL.md) | 唯一原生繁中台灣用語的影片腳本 skill；輸出欄位固定（時間、畫面、台詞字幕、證據、CTA、缺素材） |
| 三行文案與逐字字數驗證 | [MK-137#L22-L44](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/skills/mk-137/SKILL.md#L22-L44) | 硬規格寫法，例如「第一行 14–15 個繁體中文字」，可以改寫成 JS 檢查函式 |
| 短影音腳本模板、Hook 矩陣 | [short-form-video.md#L79-L108](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/social/references/short-form-video.md#L79-L108)、[hook-system.md#L9-L46](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/references/hook-system.md#L9-L46) | MIT；每個 Hook 都輸出「畫面／口白／字幕」三欄 |
| 帶貨腳本 prompt 組（10 種風格、一次 3 套） | ⚠ [ClipForge prompts.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/prompts.ts) | AGPL：參考結構後自己重寫成繁中版 |
| 用 Claude 訂閱跑純文字生成 | [MoneyPrinterTurbo llm.py#L562-L680](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/llm.py#L562-L680) | MIT；`claude -p --output-format json …` 的呼叫器，任何後端都能移植 |
| 依秒數縮稿 | [VoiceStudio speech_rate.py#L45-L60](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/speech_rate.py#L45-L60)；[Hypit speech-estimate](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/speech-estimate/src/program.ts) | 15 秒講不完時自動提醒（中文就是「字數 ÷ 語速」）；VoiceStudio 是 AGPL，Hypit 是自訂授權，兩者都建議自己重寫 |
| 去 AI 味繁中校稿 | [speak-human-tw](https://github.com/backtrue/thinkwithblack-skill/blob/7095cbc70ec71bfcbc15c512fbec29da166598d8/supplements/speak-human-tw/SKILL.md) | 腳本、旁白定稿前最後過一次 |
| JSON 回覆重試與清理 | ⚠ [ClipForge generator.ts#L147-L330](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/script-engine/generator.ts#L147-L330)；MIT 替代：[ViMax robust_json_parser.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/utils/robust_json_parser.py) | LLM 回 JSON 壞掉時用 |

### 2-2 分鏡

| 零件 | 位置 | 說明 |
|---|---|---|
| 鏡頭資料結構 | [ViMax shot_description.py](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/interfaces/shot_description.py) | MIT、pydantic，可轉成 JSON Schema 讓 Claude 結構化輸出 |
| 分鏡 schema | [OpenMontage scene_plan.schema.json](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/schemas/artifacts/scene_plan.schema.json) | ⚠ AGPL 專案中的 schema，建議只參考欄位 |
| 依音檔組時間軸 | [Remotion timeline.ts#L9-L60](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/template-prompt-to-video/cli/timeline.ts#L9-L60) | `timeline.json` 可以當你的「分鏡表標準格式」 |
| 爆款剪輯 Beat Sheet | [edit-anatomy.md#L45-L62](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/video/references/edit-anatomy.md#L45-L62) | 純文字，當分鏡格式 |
| 短劇分段 → Seedance 提示詞 | [Toonflow workflow/SKILL.md](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/skills/workflow/SKILL.md) | MIT；含商品圖逐段綁定、包裝文字不可改寫；原文簡體 |
| 影片提示詞方言庫（Seedance、MiniMax、Wan） | [drama-skills short-drama-video-prompts](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-video-prompts/SKILL.md) | MIT，直接當 skill 的 references |
| 角色或商品外觀一致性 | [character-consistency-across-shots.md](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/docs/character-consistency-across-shots.md) | 固定一句造型短語，每次原樣貼進提示詞 |
| 分鏡拆解提示詞（時長公式） | ⚠ [huobao agents/index.ts#L76-L122](https://github.com/chatfire-AI/huobao-drama/blob/5ac2a3446855bf8ad0d3f013d1fe22e9b3cbc6ff/backend/src/agents/index.ts#L76-L122) | **NC 授權**，只看概念 |

### 2-3 畫面

| 子類 | 零件 | 位置 | 說明 |
|---|---|---|---|
| 程式繪製、批次 | HyperFrames 批次與變數渲染 | [batchRender.ts#L101-L146](https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/commands/batchRender.ts#L101-L146) | `rows.json` 一列一個商品，直接對應試算表欄位 |
| 程式繪製、批次 | Remotion `renderMedia()` | [render-media.ts](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/renderer/src/render-media.ts) | Node 腳本讀商品資料，用 `inputProps` 批次輸出 |
| 商品揭幕動畫 | ⚠ ProductReveal | [OpenMontage ProductReveal.tsx](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/remotion-composer/src/components/ProductReveal.tsx) | AGPL，參考後重寫 |
| 最輕量的 HTML→MP4 | lemo 逐格渲染器 | [core/render/video.mjs](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/video.mjs) | MIT；頁面只要實作 `window.render(t)`，跟你的純 JS 最合 |
| 實拍、AI 片段包裝 | ClipCard、PageCam | [ClipCard.tsx](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/lib/ClipCard.tsx)、[PageCam.tsx](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/lib/PageCam.tsx) | Apache-2.0；可以替你自己的倉儲 App 做功能介紹片 |
| 商品圖變動態片段 | Ken Burns 縮放 | [MoneyPrinterTurbo video.py#L1974](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/video.py#L1974) | MIT；一張商品圖變成 5 秒片段 |
| 免費素材庫 | Pexels、Pixabay | [material.py#L404-L649](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/material.py#L404-L649) | MIT；只抄 API 呼叫與畫面比例過濾 |
| 商品去背 | BiRefNet | [prep_object.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/styles/briefing-board/demo/kit/tools/prep_object.py) | 模型約 970 MB |
| AI 生影片 adapter | 送任務 → 輪詢 → 下載 | [drama-skills provider_adapters.py](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/provider_adapters.py)（MIT，獨立 CLI）、[Open Design media-adapters/video.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media-adapters/video.ts)（Apache，一套程式對 Seedance、Wan、Veo、Sora）、[Toonflow types.d.ts](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/providers/types.d.ts)（含 `getPrice`、`getBalance` 介面） | 換供應商只要換 adapter |
| 圖生影片運鏡句型 | ⚠ motion-prompt | [ClipForge motion-prompt.ts](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/motion-prompt.ts) | AGPL；「運鏡＋保真＋防閃爍」的句型思路可以學 |

### 2-4 配音

| 零件 | 位置 | 說明 |
|---|---|---|
| Edge TTS（有台灣聲音） | [MoneyPrinterTurbo voice.py#L1337](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/voice.py#L1337)、聲音清單 [azure_voices.json](https://github.com/harry0703/MoneyPrinterTurbo/blob/c8dbf96e9dfee43b30f7c3f440175d6bd4de61de/app/services/data/azure_voices.json) | MIT；`zh-TW-HsiaoChenNeural` 等三個聲音。**商用合規未確認** |
| 中文 TTS 批次與 ASR 校對 | [lemo tts_zh.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/tts/tts_zh.py)、[asr_check.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/tts/asr_check.py) | MIT；把 `--voice` 換成台灣聲音；ASR 的繁簡比對可能誤判（未確認） |
| 本機配音服務（OpenAI 相容） | [VoiceStudio openai_compat.py#L649](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/api/routers/openai_compat.py#L649-L700)、[mcp_server.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/mcp_server.py#L1-L32) | 不拆程式，當服務呼叫；**預設權重非商用** |
| 多角色台詞標記 | [VoiceStudio longform_parser.py](https://github.com/debpalash/VoiceStudio/blob/7a896ed455e116d734f26437393a92cad090aadb/backend/services/longform_parser.py#L1-L16) | Claude 輸出 `[voice:女主]…` 格式，適合短劇 |
| 聲音複製（雲端或 GPU） | [Hypit mimo-speech#L8-L40](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/mimo-speech/src/index.ts#L8-L40)；toolkit 的 Qwen3-TTS [modal-qwen3-tts/app.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/docker/modal-qwen3-tts/app.py) | 「用自己錄的台灣腔樣本複製」是多份資料包共同建議的路，但**效果都未實測** |
| 價格唸法 | Hypit 語法 `<$199\|一百九十九元>`（見 [Hypit 資料包 §11](hypit-ai__hypit.md)） | 解決 TTS 把價格唸錯的問題，可以學來自己實作 |

### 2-5 字幕

| 零件 | 位置 | 說明 |
|---|---|---|
| Remotion 逐字字幕（含 CJK） | ⚠ [OpenMontage CaptionOverlay.tsx](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/remotion-composer/src/components/CaptionOverlay.tsx) | 資料包說有處理 CJK 斷行；AGPL 要重寫；MIT 替代：[toolkit Captions.tsx](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/lib/components/Captions.tsx) |
| 原稿文字搭配辨識時間 | [Hypit align.ts](https://github.com/hypit-ai/hypit/blob/67c15455832cea5eed8198407c488116921f5e6a/packages/narrative-speech-alignment/src/align.ts) | 字幕顯示你的繁中原稿，時間取自 Whisper，**正好避開 Whisper 繁簡不定的問題** |
| SRT 產生（13 行） | [lemo srt.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/srt.py) | MIT，直接複製 |
| SRT／VTT 解析與輸出 | [Remotion captions](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/captions/src/index.ts) | `create-tiktok-style-captions.ts` 依空白分頁，**中文要改** |
| 本機 whisper.cpp | [install-whisper-cpp](https://github.com/remotion-dev/remotion/blob/682cad29c569d7c36c2445e27ec07cb433f06b32/packages/install-whisper-cpp/src/index.ts) | 免費，語言清單含 `zh` |
| 燒錄、切塊 | [video-use render.py#L433-L521](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L433-L521) | MIT；中文要把 `" ".join` 改成 `"".join`、`PUNCT_BREAK` 加全形標點、拿掉 `.upper()` |

### 2-6 配樂與音效

| 零件 | 位置 | 說明 |
|---|---|---|
| 程式合成原創配樂與音效（免版權） | [lemo sfx.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/audio/sfx.py)、[sampler.py](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/audio/sampler.py) | 避開音樂版權最乾淨的做法 |
| CC0 音效搜尋並記錄授權 | [video-shotcraft sfx-source.py](https://github.com/Vincentwei1021/video-shotcraft/blob/1266a3ec4831289c4d893d42dd5102723658039a/assets/scripts/sfx-source.py) | 用爬網頁的方式，Freesound 改版可能失效 |
| 多音軌混音（配音＋BGM＋音效） | [Open Design hyperframes-audio.ts](https://github.com/nexu-io/open-design/blob/e7a18df64d0e5e1161903e93bb5a302229dbeb96/apps/daemon/src/media/hyperframes-audio.ts) | Apache-2.0 |
| 免費 BGM 加旁白閃避 | ⚠ [ClipForge free-bgm.ts#L59](https://github.com/xixihhhh/clipforge/blob/1aab133dd75f4db57c3f62e6da2fdd121c5d509b/src/lib/free-bgm.ts#L59) | AGPL；sidechain 的作法可以學 |

### 2-7 合成、品管、成本控管

| 零件 | 位置 | 說明 |
|---|---|---|
| EDL 剪接、字幕、音量標準化 | [video-use render.py](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py)；音量 [#L527-L627](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py#L527-L627) | MIT；其他工具最後一步都可以輸出 `edl.json` 交給它 |
| 剪輯單轉成片（靜幀運鏡、字幕、兩遍 loudnorm） | [drama-skills edit_tool.py](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/scripts/edit_tool.py)；loudnorm [#L2120-L2147](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/scripts/edit_tool.py#L2120-L2147) | MIT；字型要改成 TC |
| ffmpeg 合成與 −14 LUFS | [lemo mux.sh](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/core/render/mux.sh) | MIT |
| 以配音長度驅動的直式合成器 | [toolkit build.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/templates/concept-explainer-short/build.py) | MIT、460 行單檔；**沒有中文字型** |
| 預算上限、可續跑、收據 | [toolkit video_job.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/video_job.py) | 用 `--max-usd` 擋超支，收據寫進 `receipts.jsonl` |
| 付費 API 前的確認閘門 | [drama-skills production_tool.py](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/production_tool.py)；規則寫法 [Toonflow prompt.ts#L34-L38](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/apps/server/src/agent/runtime/prompt.ts#L34-L38) | 「花錢前先列方案，要明確同意」，防止 AI 亂燒影片額度 |
| 成片品管 | [toolkit qc.py](https://github.com/digitalsamba/claude-code-video-toolkit/blob/a50da9e7e78a162b58a4fb9e1c3a4008e831b8dc/tools/qc.py#L1-L16) | 檢查音量、時間、語速、版面、對比度 |
| 平台規格表 | ⚠ [OpenMontage media_profiles.py](https://github.com/calesthio/OpenMontage/blob/d21f5d4eaa08422b09c7091757a05affcbabb35b/lib/media_profiles.py) | 數字可以照用，程式自己寫；9:16 安全區另見 [short-form-video-specs.md#L9-L24](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/references/short-form-video-specs.md#L9-L24)（上 220px、下 500px、左右 180px） |

---

## 3. 組合管線（A＋B＋C）

### 3-1 電商商品影片（建議第一條做）

```
Firestore 商品（品名／售價／特價／賣點／圖片 URL）
  → 匯出 products.json（自己寫，約幾十行）
  → Claude Code + 自建 skill「product-video」（骨架抄 MK-284 的固定交付欄位）
      輸出 scenes.json：[{秒數, 畫面, 旁白, 字幕, 價格卡}]
  → 字數／秒數檢查（中文字數 ÷ 語速，超過就請 Claude 縮稿）
  → Edge TTS zh-TW 配音（lemo tts_zh.py 換聲音）→ wav
  → Whisper 取時間 + 原稿對齊（Hypit align.ts 的思路）→ SRT
  → HyperFrames：rows.json → render --batch（或 Remotion renderMedia + inputProps）
  → 兩遍 loudnorm（−14 LUFS）→ 9:16 MP4
```

- **用到的零件**：HyperFrames 的 [batchRender.ts](https://github.com/heygen-com/hyperframes/blob/845bd638a7784d0859df047e16c61b8790b9a8bb/packages/cli/src/commands/batchRender.ts#L101-L146)、MK-284 的 skill 骨架、lemo 的 `tts_zh.py`、`srt.py`、`mux.sh`、MoneyPrinterTurbo 的商品圖縮放片段、marketingskills 的 9:16 安全區數字。
- **成本**：只用 HTML 動畫、本機或 Edge TTS、本機渲染的話，**每支約 0 元**，只花 Claude 訂閱額度。想讓商品「動起來」再加圖生影片，參考價是 LTX-2.3 約 $0.10／5 秒（toolkit 資料包）、Kling 約 $0.10／5 秒起（OpenMontage 資料包）；toolkit README 的 52 秒直式片約 $0.80。以上都是資料包轉述，未實測。
- **要自己補的部分**：①繁中字型（思源黑體 TC 或 Noto Sans TC，用 `@font-face` 載入）；②台灣法規違禁詞表（食安法、化粧品衛生安全管理法、藥事法、公平法），可以參考 ClipForge `ad-compliance.ts` 的架構，但詞庫要自己建；③價格唸法規則；④Firestore 匯出腳本；⑤HyperFrames 遙測請關掉（`HYPERFRAMES_NO_TELEMETRY=1`）。
- **注意**：awesome 目錄的實測指出 **HyperFrames 一支 15 秒片做了 23.5 分鐘**（[awesome-claude-video-skills 資料包](zhuyansen__awesome-claude-video-skills.md)），跟 HyperFrames 卡片給的「首選引擎」評價有落差。批次量大時，請先實測單支耗時，或改用 Remotion 比較看看。
- **想先跳過自己組裝**：直接裝 MoneyPrinterTurbo，用 `video_source="local"` 吃商品圖、選 `zh-TW-HsiaoChenNeural`，主題用繁中寫，就能產出繁中腳本。

### 3-2 廣告素材（多版本 A/B）

```
競品廣告網址 → claude-video（抽幀＋逐字稿）→ Claude 歸納 hook／節奏／CTA
  + 你的商品評論（存成 inputs/reviews/*.md）
  → marketingskills ad-creative：Hook 矩陣（客群 × 動機 × 格式，每格寫畫面／口白／字幕）
  → 挑 3–5 個切角
      ├ 純動態圖文：HyperFrames 或 Hypit（SVML）批次出 1:1、9:16、16:9
      └ 有實拍口播或開箱：video-use 依逐字稿選段剪接並燒字幕
  → 廣告審稿頁（marketingskills creative-review-template.html，可放 Firebase Hosting）
  → 上線後：irinabuht12 的 creative-fatigue-detection、ab-test-analyzer 判斷勝負與換片時機
```

- **用到的零件**：[claude-video frames.py](https://github.com/bradautomates/claude-video/blob/03ceb42f7fa2c4439aca01752118044baabffb8f/skills/watch/scripts/frames.py#L231-L581)、[hook-system.md](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/references/hook-system.md#L9-L46)、[有憑據的廣告產出規則](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/SKILL.md#L75-L99)（沒有評論就停下來問，不亂編）、[審稿頁 HTML](https://github.com/coreyhaines31/marketingskills/blob/88c79f6528a9347420e57ceb1fff9a60de651768/skills/ad-creative/assets/creative-review-template.html)、video-use 的 [render.py](https://github.com/browser-use/video-use/blob/43cfc566833548093455c9d4a46bd69913b7e552/helpers/render.py)、[creative-fatigue-detection](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/creative-fatigue-detection/SKILL.md#L10-L30)。
- **成本**：純程式繪製每支 0 元；Hypit 用 AI 生成時，README 範例為 18–26 秒約 US$1.07–1.15；video-use 的 Scribe 轉錄按音訊時長計費（單價未確認）。
- **要自己補的部分**：①把 Hook 矩陣與「去 AI 味黑名單」翻成中文句型；②video-use 的中文字幕修改（見 2-5）；③yt-dlp 下載競品**只做內部分析，不重製畫面與音樂**；④Hypit 若將來要做成給別人用的服務，需要書面授權。

### 3-3 短劇（劇情型廣告、系列短劇）

```
商品賣點或故事點子（或你擁有改編權的原著）
  → drama-skills：/short-drama-develop → /short-drama-write（剧本.md）
     → /short-drama-storyboard（分镜.md）→ /short-drama-video-prompts
     （角色一致性：固定造型短語）
  → [選用] Toonflow 畫布：預覽鏡頭、管理參考圖（MIT，可用 MCP 讓 Claude Code 遙控）
  → 付費確認閘門（production_tool.py）→ Seedance / MiniMax 生成片段
  → 配音：①影片模型原生聲音，或 ②VoiceStudio 多角色（換成可商用權重，或用經授權的台灣人錄音複製）
  → drama-skills edit_tool.py：剪輯、字幕（改 TC 字型）、loudnorm
  → Remotion Overlay（價格卡、倒數卡）疊在最上層 → 成片
```

- **用到的零件**：drama-skills 的 [provider_adapters.py](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/provider_adapters.py)、[production_tool.py](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-produce/scripts/production_tool.py)、[edit_tool.py](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/scripts/edit_tool.py)、[Overlay.tsx](https://github.com/zenstory-ai/drama-skills/blob/c8f90a79032da8dd3deeec2da3abd2b063939fe5/skills/short-drama-edit/assets/remotion/src/Overlay.tsx)；Toonflow 的 [workflow SKILL](https://github.com/HBAI-Ltd/Toonflow-app/blob/ecd5325c7f9b38721491382ee6952fa2318b4693/packages/skills/workflow/SKILL.md)；ViMax 的 [ShotDescription](https://github.com/HKUDS/ViMax/blob/fd4b72e7731be6e5f88486206d25ea59849b0285/interfaces/shot_description.py) 可以當分鏡欄位的參考。
- **成本**：drama-skills README 說 68 秒樣片的影片生成約人民幣 40 元；Toonflow 案例是 Seedance 2.0 約 120 元／2 分鐘，腳本約 10 元；ViMax（Veo 路線）估 2 分鐘 USD 20–60。三者口徑不同，單價都沒有實測，建議先用 15 秒試一支。
- **要自己補的部分**：①全套簡體文件、目錄名與 SC 字型都要繁中化；②**Seedance 預設端點是火山方舟北京區 `ark.cn-beijing.volces.com`**，台灣能不能開通與付款要自己確認；改用 BytePlus 國際版是否相容也未確認；③字幕：Toonflow 與 ViMax 都沒有字幕功能，一定要靠 edit_tool 或 Remotion 補上；④演員或代言角色的肖像授權；⑤投放前標示 AI 生成。

---

## 4. 繁中／台灣在地化問題整理

| 問題 | 出現在哪 | 怎麼處理 |
|---|---|---|
| **字型預設簡體或沒有中文** | drama-skills 固定 `Noto Sans CJK SC`；video-shotcraft `PingFang SC`；HyperFrames 內建只有 `Noto Sans JP`；toolkit Python 範本只有 Arial、Helvetica、DejaVu（會變豆腐方塊）；OpenMontage 字幕預設 Inter；video-use 用 Helvetica；NarratoAI 用 SimHei（繁體覆蓋度未確認） | 統一放一套可商用的 TC 字型（Noto Sans TC 或思源黑體 TC），寫進共用設定 |
| **商業字型混在 repo 裡** | MoneyPrinterTurbo 內附微軟雅黑、華文黑體 `.ttc`，不在 MIT 範圍 | 刪掉，換成 OFL 字型 |
| **prompt 或輸出寫死簡體** | NarratoAI 解說 prompt「解說文案的語言使用简体中文」；Toonflow SKILL 預設輸出簡體；huobao 只有 zh（簡中）；ClipForge 沒有 OpenCC（字幕直接取腳本） | 在 skill 或 CLAUDE.md 寫「一律繁體中文、台灣用語」；最後過 `speak-human-tw` |
| **Whisper 繁簡不固定** | claude-video（WhisperX 只能設 `zh`）、HyperFrames（captions.md：中文一句當一個字、繁簡互換）、lemo `asr_check.py` 逐字比對可能誤判 | 字幕用「原稿文字＋辨識時間」對齊（Hypit 的思路），不要直接用辨識結果 |
| **中文斷句與斷詞** | video-use 用空白串字；Remotion TikTok 字幕依空白分頁；toolkit `_wrap()` 用空白斷行；VoiceStudio `karaoke_ass.py` 要改成逐字切 | 改成「每塊 6–10 個中文字＋全形標點斷句」 |
| **台灣口音 TTS** | 現成有台灣聲音的只有 Edge 的 `zh-TW-HsiaoChenNeural`、`HsiaoYuNeural`、`YunJheNeural`（MoneyPrinterTurbo、NarratoAI 有內建；ClipForge 沒有白名單，理論上能傳入；lemo 可換，但未驗證）。Kokoro 只有普通話；MiniMax、Doubao、DashScope 主打普通話；Qwen3-TTS 是否台灣腔未確認 | 先用 Edge `zh-TW`（但商用合規未確認）；長期可走「授權的台灣人錄音＋聲音複製」，或付費雲端 TTS 的台灣聲音（例如 HyperFrames 資料包提到的 Azure zh-TW，價格未確認） |
| **價格與數字唸法** | 只有 Hypit 有 `<顯示\|唸法>` 語法 | 在你的腳本格式加 `speak` 欄位 |
| **地圖、政治內容規則** | lemo-opuscar [DIRECTOR.md#L140-L148](https://github.com/lemomo-ai/lemo-opuscar/blob/bebbbe1aa92a3cb4bb6f83500e61b23a17d1aa00/DIRECTOR.md#L140-L148) 寫死：依中國標準地圖，台灣與大陸同色，字幕旁白不可把台灣列為國家 | fork 後或在專案 CLAUDE.md 覆寫這一節；出片前檢查任何地圖與國家清單 |
| **廣告法規詞庫是中國版** | ClipForge 的合規詞庫依中國《廣告法》、GB 45438-2025、抖音規則 | 重建台灣版詞庫：食安法、化粧品衛生安全管理法、藥事法、公平交易法 |
| **中國區 API 端點與資料流向** | drama-skills Seedance 預設 `ark.cn-beijing.volces.com`；NarratoAI 預設 `api.siliconflow.cn`；huobao 綁 FireMux（`api.firemux.cn`）；Toonflow 內建 APIMart、優雲智算、秘塔等中國平台，遙測送 `api.toonflow.net`；ViMax 文件提到 yunwu.ai 中轉 | 新品、客戶資料不要放進 prompt；能改端點就改（是否相容國際版都未確認）；付款與發票自行確認 |
| **剪映草稿與 CapCut** | NarratoAI、video-shotcraft 都能匯出剪映草稿 | 台灣多用 CapCut 國際版，**相容性未確認** |
| **在地化範例可以學** | thinkwithblack `speak-human-tw`（含 `taiwan-localization.md`）；awesome-opus5-5 的台灣黑熊中秋 prompt（eric-khun-667455） | 當作 skill 的 references |

---

## 5. 法律與平台風險

### 5-1 程式與模型授權（拆零件前必看）

| 風險 | 專案 | 白話 |
|---|---|---|
| AGPL-3.0 | MoneyPrinterV2、OpenMontage、VoiceStudio、ClipForge | 自己電腦用、產出影片都沒問題；**把改版做成網站給別人用，或把程式碼抄進對外服務，就要公開原始碼**。建議參考後請 Claude 重寫，或當作獨立服務用 HTTP 呼叫 |
| CC BY-NC-SA 4.0 | huobao-drama | **禁止以商業利益為主要目的使用**，用來產店家廣告屬高風險 |
| 自訂授權 | Hypit | 內部用與接案可以；做多人 SaaS 或轉售要書面授權；不得移除 LOGO；出品方可以單方面調整授權 |
| Remotion License | Remotion，以及用到它的 OpenMontage、shotcraft、toolkit、drama-skills | **各資料包說法不一**：[Remotion 資料包](remotion-dev__remotion.md)寫「員工 3 人以下免費，4 人以上要買 Company License，任何人都不可轉賣衍生工具，v5 條款將變更」；shotcraft、OpenMontage、toolkit 資料包則寫「門檻未確認」。以官網 `remotion.dev/docs/license` 為準 |
| 模型權重非商用 | VoiceStudio 預設 OmniVoice（CC-BY-NC，70 筆模型授權紀錄沒有一筆標為可商用）；toolkit 的 FLUX.2 klein-9B | 商用廣告要換引擎（toolkit 預設的 klein-4B 是 Apache-2.0） |
| 浮水印 | LTX-2 不得移除浮水印；toolkit 的 `dewatermark.py` 內建 Sora 浮水印預設 | **不要用去浮水印工具**，可能違反服務條款與平台的 AI 標示規定 |
| 授權不明 | irinabuht12 沒有 LICENSE 全文；remotion-dev/skills 沒有授權檔；awesome-opus5-5 的 MIT 不涵蓋 703 則 prompt 原文；awesome 目錄裡 103 個專案為 NOASSERTION 或沒標授權 | 只拿來學習；要放進商業產品前先問作者 |
| 遙測預設開啟 | HyperFrames CLI、Open Design 桌面版、Toonflow | 依資料包的說明關閉 |

### 5-2 版權（素材、音樂、字型）

- **競品影片**：yt-dlp 下載 YouTube、TikTok、Meta 的影片多半違反平台條款。只做內部「結構分析」，**畫面、配樂、口播一律自己重做**。
- **解說二次創作**：NarratoAI 這類「影視、短劇解說」本質上是利用他人作品，在台灣屬於著作權風險區。
- **音樂**：shotcraft 的 `bgm-tech-house.mp3` 來源不明；Hypit 範例的 BGM 與球員照片來源不明；Freesound、Openverse 的 CC BY 素材要署名。最乾淨的做法是 lemo 的程式合成配樂。
- **改編**：小說改編要有改編權（drama-skills 範例刻意寫「我擁有或獲准改編」）。

### 5-3 肖像權與聲音

- 圖庫人物不可暗示代言你的商品；用 AI 生成的人臉或「素人主播」**冒充真人使用心得**，可能觸及《公平交易法》不實廣告。
- Hypit 範例用了 C 羅、梅西的照片，Seedance 也能拿真人照片當參考：真人一定要取得書面同意。
- **聲音複製一定要本人同意**。NarratoAI 內建的參考音色清單含有真人名稱（如「董宇辉」「唐纳德·特朗普」）；toolkit 的 `voice-clone.md` 資料包作者沒有找到 consent 相關字眼。台灣個資法與人格權都可能涉及。

### 5-4 平台條款與廣告法規

- Meta、TikTok、YouTube 對 AI 生成內容與合成聲音有標示要求（多份資料包都提到，**以各平台最新政策為準**）；huobao 的 Seedance adapter 固定 `watermark:false`，更要自己標示。
- 自動發文：MoneyPrinterV2 用 Selenium 操作帳號，有被限制或停權的風險；Upload-Post 這類代發服務也要看條款。
- 台灣廣告法規（食品、化粧品不得誇大功效、藥事法）**不會因為內容是 AI 生成就豁免**。
- 隱私：claude-video 的 Gemini 引擎會把影片上傳到 Google，倉庫內部畫面請用 `--engine local`；送到中國雲端的資料見第 4 節。

---

## 6. 給 Claude Code 的起手提示詞（可直接複製貼上）

> 用法：在一個新的空資料夾開 Claude Code，貼上其中一段。每段都要求先規劃、再動手，而且花錢的步驟一定要先問你。

### 6-1 建立「商品影片」skill 與最小管線

```
你是我的影片工具工程師。請在這個資料夾建立一個「電商商品直式短影片」最小管線，先規劃、我確認後再寫程式。

背景：
- 我的倉儲系統是純 JavaScript + Firebase（Firestore），商品欄位有：name、price、salePrice、highlights（賣點陣列）、imageUrls。
- 只做我自己用的工具，語言一律「繁體中文、台灣用語」。

要求：
1. 建立 .claude/skills/product-video/SKILL.md：
   - 參考 thinkwithblack MK-284 的寫法：固定交付欄位（秒數、畫面、旁白、字幕、價格卡、缺少的素材）、核對案例、不編造規則（不補銷售數據、缺素材就停下來問）。
   - 輸出 scenes.json（15 或 30 秒，9:16）。
2. 寫 scripts/check_script.js：以 Unicode 字元計算中文字數，用「字數 ÷ 每秒 4 字」估算每段秒數，超過就列出要縮的段落。
3. 配音：用 edge-tts 的 zh-TW-HsiaoChenNeural 產生 wav（如果你不確定 edge-tts 能不能商用，請在 README 標「僅限個人測試」）。
4. 字幕：顯示用原稿文字，時間用 Whisper 結果對齊，輸出 SRT。不要直接用 Whisper 的文字（它可能輸出簡體）。
5. 渲染：先用最簡單的 HTML + 逐格截圖 + ffmpeg（頁面實作 window.render(t)），不要引入 Remotion（授權要另外確認）。
6. 字型：只用 Noto Sans TC 這類 OFL 授權的繁中字型，放在 assets/fonts/。
7. 最後用 ffmpeg 兩遍 loudnorm 做到 -14 LUFS。
8. 只要是會花錢的 API 呼叫，都要先列出預估費用並等我說「確認」。
請先回覆：資料夾結構、每支檔案的用途、需要我安裝的東西。
```

### 6-2 廣告 Hook 矩陣與多版本素材

```
請幫我做一套「廣告素材多版本」流程，全部繁體中文、台灣用語：
1. 我會把顧客評論放進 inputs/reviews/*.md、競品廣告的逐字稿放進 inputs/competitors/*.md。
   如果這兩個資料夾是空的，請停下來問我，不要自己編。
2. 產生 Hook 矩陣表：| # | 客群 | 動機 | 格式 | 畫面動作 | 口白 | 字幕 | 出處（哪一則評論） |
3. 挑 5 個切角，各輸出一份 scenes.json（9:16，前 2 秒要有 hook），並遵守 9:16 安全區：上 220px、下 500px、左右 180px。
4. 自己列一份「中文去 AI 味黑名單」（例如「不是…而是…」「告別…」），全部文案都要過一遍。
5. 加一個「台灣廣告法規檢查」步驟：食品、化粧品不能寫療效，避免「最、第一、保證」等絕對用語；列出可疑句子讓我決定。
6. 產生一個 review.html，讓我在瀏覽器勾選要渲染哪幾支。
先告訴我你打算建立哪些檔案。
```

### 6-3 短劇（劇情型廣告）

```
我想用 Claude Code 做 60 秒內的劇情型商品廣告短劇（系列 3 集）。請：
1. 先寫「故事聖經」：角色表（每個角色一句固定的英文造型短語，之後每次生成都原樣貼上）、場景表、每集任務（問題→教育→證據→行動）。
2. 每集輸出 劇本.md 和 分鏡.md（每鏡：秒數、景別、運鏡、畫面、台詞、角色、凍結關鍵影格提示詞）。
3. 全部使用繁體中文與台灣用語，檔名和資料夾名也用繁體。
4. 價格、促銷文字不要交給影片模型畫（AI 畫字常出錯），改成剪輯時用程式疊加的「價格卡」。
5. 任何呼叫 Seedance、MiniMax 這類付費 API 的步驟，都要先產生 job.json，列出鏡數、秒數、預估費用，我說「確認」才送出；任務 ID 要寫進檔案，方便中斷後續跑。
6. 所有角色都必須是虛構人物；不可以用真人照片或名人的名字當參考。
先給我故事聖經草稿，不要寫程式。
```

### 6-4 拿到開源專案時的「繁中＋授權」體檢

```
請檢查這個專案（只讀不改），用繁體中文回報：
1. 授權：LICENSE 類型；有沒有 AGPL、NC、自訂條款；模型權重與字型各是什麼授權；我把其中一個檔案抄進自己工具會有什麼義務。
2. 繁中問題：預設字型是否為簡體或缺中文；prompt 裡有沒有寫死「简体中文」；字幕斷行是否依空白；TTS 有沒有 zh-TW 聲音。
3. 對外連線：預設 API 端點（特別是 .cn 網域）、遙測是否預設開啟、怎麼關。
4. 政治或在地內容規則：搜尋「地圖、Taiwan、台湾、国家」等字樣，列出可能不適合台灣的規則。
5. 最後列出「值得拆的零件」：檔案路徑、行號、依賴、拆出難度。
```

### 6-5 讓 Claude 和 Codex 一起維護影片工具（呼應你的多 AI 協作需求）

```
這個影片工具會由 Claude Code 和 Codex 輪流修改。請建立：
1. AGENTS.md（給 Codex）和 CLAUDE.md（給 Claude），兩份共用同一份 RULES.md，不要把規則內容複製兩次（CLAUDE.md 可以用 @RULES.md 引用；AGENTS.md 若不支援引用語法，就寫一行「開始工作前先讀 RULES.md」）。規則包括：
   繁體中文、台灣用語；只能用 MIT/Apache/OFL 授權的程式碼和字型；花錢的 API 一律先確認；
   不得使用真人肖像或複製別人的聲音；地圖與國家清單要符合台灣立場。
2. docs/PATROL.md：每日巡讀清單，內容包括：
   - 找出簡體字殘留（字幕、prompt、檔名）
   - 找出重複的 prompt 或 skill（兩份內容幾乎一樣的 Markdown）
   - 找出新舊版本衝突（同一設定在兩處數值不同，例如字型、語速、聲音名稱）
   - 檢查 assets/ 裡每個音樂、字型、圖片都有授權紀錄
   - 列出上次巡讀後新增但沒有測試的腳本
3. scripts/patrol.js：自動跑得到的項目就自動跑，最後輸出 patrol-report.md。
先列出計畫給我看。
```

---

## 7. 資料來源

本總結只依據以下資料包與 [`../cards/`](../cards/) 中 `category` 為 `03-video-script` 的卡片。permalink 全部照抄自資料包；資料包寫「未確認」的地方，本文沒有另外查證。

**一鍵出片**
- [harry0703__MoneyPrinterTurbo.md](harry0703__MoneyPrinterTurbo.md)
- [xixihhhh__clipforge.md](xixihhhh__clipforge.md)
- [FujiwaraChoki__MoneyPrinterV2.md](FujiwaraChoki__MoneyPrinterV2.md)

**Claude 原生影片工具**
- [heygen-com__hyperframes.md](heygen-com__hyperframes.md)
- [remotion-dev__remotion.md](remotion-dev__remotion.md)
- [remotion-dev__skills.md](remotion-dev__skills.md)
- [calesthio__OpenMontage.md](calesthio__OpenMontage.md)
- [digitalsamba__claude-code-video-toolkit.md](digitalsamba__claude-code-video-toolkit.md)
- [hypit-ai__hypit.md](hypit-ai__hypit.md)
- [lemomo-ai__lemo-opuscar.md](lemomo-ai__lemo-opuscar.md)
- [nexu-io__open-design.md](nexu-io__open-design.md)
- [Vincentwei1021__video-shotcraft.md](Vincentwei1021__video-shotcraft.md)

**短劇平台**
- [zenstory-ai__drama-skills.md](zenstory-ai__drama-skills.md)
- [HBAI-Ltd__Toonflow-app.md](HBAI-Ltd__Toonflow-app.md)
- [HKUDS__ViMax.md](HKUDS__ViMax.md)
- [chatfire-AI__huobao-drama.md](chatfire-AI__huobao-drama.md)

**配音、剪輯、影片理解**
- [debpalash__VoiceStudio.md](debpalash__VoiceStudio.md)
- [browser-use__video-use.md](browser-use__video-use.md)
- [linyqh__NarratoAI.md](linyqh__NarratoAI.md)
- [bradautomates__claude-video.md](bradautomates__claude-video.md)

**提示詞、素材收藏與行銷 skills**
- [zhuyansen__awesome-claude-video-skills.md](zhuyansen__awesome-claude-video-skills.md)
- [yihui-dev__awesome-opus5-5-videos.md](yihui-dev__awesome-opus5-5-videos.md)
- [backtrue__thinkwithblack-skill.md](backtrue__thinkwithblack-skill.md)
- [coreyhaines31__marketingskills.md](coreyhaines31__marketingskills.md)
- [irinabuht12-oss__marketing-skills.md](irinabuht12-oss__marketing-skills.md)

**資料包之間的已知分歧（本文未替你判定）**
- Remotion 公司授權的門檻：Remotion 資料包寫「4 人以上付費」，其他資料包寫「未確認」。
- HyperFrames 的評價：卡片給適合度 5，awesome 目錄實測卻是 15 秒片做了 23.5 分鐘。
- Edge TTS 能不能商用：所有提到的資料包都寫「未確認」，ClipForge 資料包稱之為「非官方使用」。
- ClipForge 卡片的 Claude 支援標「可接」，但專案本身附 MCP 與 Skill：這是因為它的 LLM 只吃 OpenAI 相容介面，Claude 要經 OpenRouter 或相容端點才能用。
