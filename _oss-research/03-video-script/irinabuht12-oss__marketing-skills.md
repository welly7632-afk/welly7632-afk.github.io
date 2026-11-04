# irinabuht12-oss/marketing-skills — 49 個給 Claude 用的廣告／SEO 分析 Skills（純 Markdown，附 Ryze 廣告 MCP 導流）
> 資料包｜分類：影片・腳本（AI）｜掃描日期：2026-11-04｜commit：b3bdcd6
> GitHub：https://github.com/irinabuht12-oss/marketing-skills｜⭐ 6805｜授權：README 與 plugin.json 自稱 MIT，但 repo 內沒有 LICENSE 檔｜主要語言：-（全部是 Markdown）｜最近更新：2026-10-27

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 一包 49 個「教 Claude 怎麼分析廣告帳戶」的 Markdown 提示詞（Claude Skills），主題是 Google Ads、Meta Ads、SEO、AI 搜尋能見度；它本身**不會產生影片**，也沒有任何程式碼。

對你（台灣電商老闆、自己下廣告、用 Claude Code 寫倉儲系統）可以這樣用：
- **每週廣告健檢**：把 Meta 廣告管理員／Google Ads 匯出的 CSV 丟給 Claude，叫出 `meta-ads-audit`、`creative-fatigue-detection`、`wasted-spend-finder`，請它列出要停掉的素材、浪費預算的搜尋字詞。
- **素材與腳本**：`content-repurposer` 內建「15–30 秒短影音腳本（Hook→Value→CTA）」格式；`ad-copy-variant-generator` 會根據表現好的廣告產生變體文案。這兩個是跟「廣告影片腳本」最接近的部分，但只到文字腳本，不會生成影片。
- **成本／預算計算**：`ad-spend-allocator` 有 MER、邊際 ROAS 公式與 70-20-10 預算分配；`ab-test-analyzer` 有樣本數與顯著性公式——可以直接拿去寫進你自己的 JavaScript 試算表／儀表板。
- **UTM 與 GA4 事件命名**：`utm-tracking-generator` 可當成你網站和廣告追蹤的命名規範。
- **當作 Skill 寫法範本**：49 份都是同一套結構，最適合拿來學「怎麼寫自己的 Claude Skill」（例如寫一個「台灣電商商品影片腳本」skill）。

## 2. 授權白話

- **實際狀況**：用 `git ls-tree` 列出的 105 個檔案中**沒有 LICENSE 檔**，所以 GitHub 偵測不到授權（顯示「-」）。但 README 的 FAQ 寫「Yes, all 49, MIT licensed, no signup」，`.claude-plugin/plugin.json` 也寫 `"license": "MIT"`。
- **個人使用**：沒問題。作者明確寫免費、MIT，而且內容就是提示詞，自己複製到 `~/.claude/skills/` 使用即可。
- **公司商用**：作者意圖是 MIT，風險低；但因為沒有正式 LICENSE 全文與著作權聲明，嚴格說是「宣稱 MIT」而非標準 MIT。若要改寫後放進自己的商業產品或公開發佈，建議保留出處，必要時寫信 hello@get-ryze.ai 確認。
- **閉源／付費部分**：真正「讀你廣告帳戶即時資料」的是 **Ryze MCP**（`https://connector.get-ryze.ai/mcp`），這是 Ryze AI 公司的**遠端託管服務，原始碼不在這個 repo**。README 說免費；Ryze 其他付費方案、資料保存政策：未確認。這個 repo 本質上是 Ryze 的行銷導流（README 首段就是「Connect Ryze in one click」，最新 commit 訊息是「Tag Ryze links with utm_source=github」）。

## 3. 技術棧與執行需求

- 前端／後端／資料庫：**都沒有**。只有 Markdown（`SKILL.md`）與兩個 JSON 外掛設定檔。
- 執行環境：Claude Code、claude.ai（Pro/Max/Team/Enterprise）、Claude Desktop；README 稱 Cursor、ChatGPT 也能用（skills 是純文字）。
- 硬體／GPU：不需要。
- API Key／費用：只需要你的 Claude 訂閱。若接 Ryze MCP，要用 OAuth 授權你的 Google Ads／Meta Ads／GA4／Search Console 帳號給 Ryze（費用 README 稱免費；長期是否收費：未確認）。不接 MCP 也能用，改貼匯出資料。
- 安裝：`claude plugin marketplace add irinabuht12-oss/marketing-skills` → `claude plugin install marketing-skills@ryze`；或手動 `cp -r skills/* ~/.claude/skills/`。

## 4. 程式架構地圖

```
marketing-skills/
├── .claude-plugin/
│   ├── marketplace.json      # 外掛市集定義（marketplace 名稱 ryze）
│   └── plugin.json           # 外掛定義：skills 路徑 ./skills，並自動註冊 mcpServers.ryze（遠端 http）
├── skills/                   # ★ 真正會被 Claude 載入的 49 個 skill，每個一個資料夾 + SKILL.md
├── Claude skills for Google Ads/   # 36 個 .md：與 skills/ 內容幾乎相同的「閱讀版」（檔名帶編號）
├── Claude skills for Meta Ads/     # 6 個 .md
├── Claude skills for SEO/          # 3 個 .md
├── Claude skills for AI visibility/# 4 個 .md
├── all-marketing-skills.zip  # 打包下載（未解壓檢查）
├── README.md                 # 安裝說明 + Ryze 導流
└── banner.png / ghf-toplight.png
```
說明：四個「Claude skills for …」資料夾共 49 個檔案，與 `skills/` 的 49 個資料夾一對一對應；抽查 `04-meta-creative-fatigue-detection.md` 與 `skills/creative-fatigue-detection/SKILL.md`，差別只在 description 尾端多了「Platform: Meta.」。

## 5. 核心功能怎麼實作

沒有程式碼，「實作」就是 prompt 結構：

| 功能 | 位置 | 實作重點 |
|---|---|---|
| 外掛同時裝 skills + MCP | [plugin.json](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/.claude-plugin/plugin.json) | `"skills": "./skills"` 加 `mcpServers.ryze`（type http）——裝外掛就等於自動接上 Ryze 的遠端 MCP |
| Meta 素材疲勞門檻 | [meta-ads-audit L21-L58](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/meta-ads-audit/SKILL.md#L21-L58) | 頻率 >3-4、CTR 7 天降 15-20%、CPM 兩週升 30-40% 等門檻表；受眾重疊 0-15/15-30/>30% 分級；Advantage+ 與手動的判斷條件 |
| 預算分配公式 | [ad-spend-allocator L20-L58](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/ad-spend-allocator/SKILL.md#L20-L58) | MER、aMER、Channel ROAS、Marginal ROAS 公式；70-20-10；每次只移 10-20%、觀察 7-14 天 |
| A/B 測試統計 | [ab-test-analyzer L21-L49](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/ab-test-analyzer/SKILL.md#L21-L49) | 樣本數公式 n = 2(Zα/2+Zβ)²p(1-p)/δ²、Z 檢定、速查表 |
| 短影音腳本格式 | [content-repurposer L51-L57](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/content-repurposer/SKILL.md#L51-L57)、[L161-L171](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/content-repurposer/SKILL.md#L161-L171) | 15-30 秒、50-150 字、0-3 秒 Hook → Value → CTA，標註秒數段落 |
| 防幻覺規則 | [google-ads-audit L106-L111](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/google-ads-audit/SKILL.md#L106-L111) | 資料不足要先要資料、不可猜轉換價值、異常值（負花費、CTR>100%）不處理、每份結論附信心等級 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 廣告指標公式（MER／邊際 ROAS） | [ad-spend-allocator](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/ad-spend-allocator/SKILL.md#L20-L42) | 無 | 低 | 請 Claude Code 依公式寫成 JS 函式，放進你 Firebase 倉儲系統或網頁版試算表當「廣告成本欄位」 |
| A/B 樣本數與顯著性 | [ab-test-analyzer](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/ab-test-analyzer/SKILL.md#L21-L49) | 無 | 低 | 寫成小工具頁或試算表自訂函式 |
| Meta 素材疲勞門檻表 | [meta-ads-audit](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/meta-ads-audit/SKILL.md#L21-L36) | 廣告匯出資料 | 低 | 匯入 Meta CSV 後用規則自動標紅／黃，當儀表板條件格式 |
| 短影音腳本骨架 | [content-repurposer](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/content-repurposer/SKILL.md#L51-L76) | 無 | 低 | 搬到你自己的「商品影片腳本」skill，再接影片生成專案（如分類 03 其他 repo）把腳本轉畫面 |
| 廣告文案變體邏輯 | [ad-copy-variant-generator](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/ad-copy-variant-generator/SKILL.md) | 廣告成效資料 | 低 | 改寫成繁中版，限制每個變體只改 1–2 個變因 |
| UTM／GA4 命名規範 | [utm-tracking-generator](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/utm-tracking-generator/SKILL.md) | 無 | 低 | 做成你系統內的 UTM 產生器表單 |
| 外掛打包方式 | [plugin.json](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/.claude-plugin/plugin.json)、[marketplace.json](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/.claude-plugin/marketplace.json) | Claude Code | 低 | 照抄結構，把你自己的 skills 做成私人 plugin |

## 7. AI／Claude 整合

- **原生為 Claude 設計**：每個 `SKILL.md` 都有 YAML frontmatter（`name`、`description`、`metadata.platform`），符合 Claude Skills 格式；`.claude-plugin/` 讓它能以 Claude Code plugin 安裝。
- **模型**：沒指定，由你使用的 Claude 決定。
- **Prompt 位置**：全部在 `skills/<name>/SKILL.md`。
- **MCP**：plugin.json 內建 Ryze 遠端 MCP（http）。我自己 grep：49 個 SKILL.md 每一個都有「Data access (Ryze MCP)」段落（49/49）。這段只是安裝說明，skill 本身不依賴 MCP。
- **換成其他模型**：純文字，可貼到任何 LLM，但 description 自動觸發機制只有 Claude Skills 有。

## 8. 擴充方式與 API

- 新增 skill：在 `skills/` 下新增資料夾 + `SKILL.md`（frontmatter 的 `description` 寫清楚何時觸發）。
- 沒有任何 API；資料存取完全靠 Ryze MCP（閉源）或你貼上的匯出檔。
- 若想不經 Ryze、自己接 Meta Marketing API／Google Ads API，需要自行寫 MCP 或腳本：本 repo 沒提供。

## 9. 程式品質與風險

- **維護**：2026-01 建立，最後推送 2026-10-27，持續更新中；但最新 commit 是改導流連結的 UTM 參數，偏行銷維護。
- **內容深淺不一（自己數）**：用 `wc -l skills/*/SKILL.md` 算，**34 個只有 38–41 行**（其中後半約 9 行是 Ryze 安裝說明），內容只有「What it does／How it works／Practical example／What you get back／When to use it」的敘述，沒有門檻、公式或輸出模板；**15 個 115–305 行**才是有實質框架的（見第 11 節）。總行數 4,267。
- **重複**：`landing-page-audit`（廣告與落地頁訊息一致性）與 `landing-page-audit-39`（CRO）主題重疊；`ab-test-analyzer` 與 `ab-test-setup-and-analysis` 也重疊。
- **資安／隱私**：安裝 plugin 會**自動註冊遠端 MCP**，接上後等於把廣告帳號、GA4、Search Console 讀取權交給第三方 Ryze；README 寫寫入需經核准（approval-gated writes），實際權限範圍與資料保存：未確認。個人使用建議**只複製 skills/、不裝 plugin**，先用 CSV 匯出測試。
- **在地化**：基準值（CPM、Advantage+ 預算 $100/day 等）以美國市場為主，台灣市場需自己調整；全英文。
- **沒有測試**（純提示詞，不適用）。`all-marketing-skills.zip` 未解壓檢查。

## 10. 跟其他專案組合的建議

- **＋影片生成專案（分類 03 其他 repo）**：用本 repo 的 `content-repurposer` 腳本骨架 + `ad-copy-variant-generator` 產生文字腳本 → 交給影片生成工具做畫面與配音 → 再用 `creative-fatigue-detection` 的門檻追蹤素材壽命，形成「腳本→影片→成效→換素材」迴圈。
- **＋網頁版試算表（分類 01）**：把 MER／ROAS／A/B 公式做成自訂函式，Meta／Google 匯出的 CSV 匯入試算表後自動計算與條件格式。
- **＋價格／ERP（分類 02）**：把商品成本（來自你的倉儲系統）帶入 ROAS 計算，算出「含廣告成本的真實毛利」與損益兩平 ROAS——這是本 repo 沒有、但你最需要的。
- **＋Skills 集合（分類 04）**：拿本 repo 當 skill 格式範本，自寫繁中版「台灣電商廣告健檢」skill。

## 11. 收錄內容整理

**怎麼數**：`ls skills | wc -l` = 49 個資料夾；四個分類資料夾共 49 個 `.md`（Google Ads 36、Meta Ads 6、SEO 3、AI visibility 4）。編號 01–44 與 49（45–48 不存在），AI visibility 另用 01–04，合計 45＋4＝49。

**分類與全部項目（以 skills/ 名稱列出，每項一句話）**

A. 廣告帳戶健檢（平台級，深度）
- `google-ads-audit`：Google Ads 浪費預算、否定關鍵字、品質分數、結構問題。
- `meta-ads-audit`：Meta 素材疲勞、受眾重疊、Pixel／CAPI 追蹤、Advantage+ 判斷。
- `linkedin-ads-audit`：LinkedIn B2B 廣告基準與名單表單摩擦。
- `reddit-ads-audit`：Reddit 子版目標與素材契合度。

B. 診斷與異常（多為短版）
- `cpa-diagnostics`：CPA 突然升高的拆解原因。
- `anomaly-detection`：CPC 暴衝、CVR 掉落等異常偵測。
- `wasted-spend-finder`：零轉換的字詞／版位／受眾，產出排除清單。
- `pacing-monitor`：月預算花費進度預測。
- `weekly-account-summary`：一週帳戶白話摘要。
- `client-report-narratives`：報表開頭的高階摘要段落。

C. 預算與預測
- `ad-spend-allocator`（深度）：MER、邊際 ROAS、70-20-10。
- `budget-scenario-planner`：加減預算對 CPA／ROAS 的影響模擬。
- `channel-mix-optimizer`：Search／PMax／Meta 開發／再行銷配比。
- `roas-forecasting`：30／60／90 天 ROAS 預測。
- `performance-benchmarking`：與產業基準比較。

D. Google 搜尋專屬
- `search-term-mining`：從搜尋字詞報表挖高意圖新關鍵字。
- `keyword-cannibalization-check`：自家關鍵字互搶。
- `quality-score-breakdown`：品質分數三要素拆解。
- `bid-strategy-recommendations`：出價策略建議。
- `ad-extension-audit`：額外資訊（sitelink 等）稽核。

E. Meta 專屬
- `creative-fatigue-detection`：素材疲勞分級（緊急／警告／健康）。
- `audience-overlap-analysis`：廣告組合受眾重疊。
- `frequency-cap-recommendations`：頻率上限建議。
- `retargeting-window-analysis`：再行銷天數視窗。
- `competitor-creative-analysis`：從 Meta 廣告檔案庫分析對手素材。

F. 結構、分析與追蹤
- `account-structure-review`：帳戶結構過度／不足切分。
- `campaign-naming-convention-builder`：廣告活動命名規則。
- `utm-tracking-generator`（深度）：UTM 與 GA4 事件命名。
- `attribution-model-comparison`：歸因模型比較。
- `conversion-path-analysis`：轉換漏斗流失點。
- `day-hour-performance-breakdown`：星期／時段成效與排程。
- `device-performance-split`：裝置別成效。
- `geo-performance-analysis`：地區成效（國家到郵遞區號）。
- `ab-test-setup-and-analysis`：A/B 測試設計與監控。
- `ab-test-analyzer`（深度）：顯著性與樣本數計算。

G. 文案、內容與研究（深度為主）
- `ad-copy-variant-generator`：依勝出廣告產生變體文案。
- `content-repurposer`（深度）：一篇內容拆成貼文、推文串、Email、廣告 hook、短影音腳本。
- `email-sequence-writer`（深度）：5 天培育信序列與主旨公式。
- `icp-research-assistant`（深度）：B2B 買家人物誌。
- `competitor-teardown`（深度）：對手落地頁 100 分評分。
- `landing-page-audit`：廣告與落地頁訊息一致性。
- `landing-page-audit-39`（深度）：CRO 落地頁十大轉換殺手。

H. SEO
- `e2e-seo-assistant`（深度）：技術 SEO、內容缺口、外鏈、內容簡報。
- `programmatic-seo-builder`（深度）：程式化 SEO 頁面模板、Schema、避免薄內容。
- `programmatic-seo-playbook`（深度）：Zapier、Clay、HeyGen 等 7 種程式化 SEO 打法與評分表。

I. AI 能見度（GEO／AEO）
- `ai-visibility-audit`：品牌在 ChatGPT／Claude／Gemini 等答案中的曝光。
- `citation-source-gap-finder`：AI 引用來源缺口。
- `content-aeo-optimizer`：改寫頁面讓 AI 好引用。
- `brand-answer-monitoring`：追蹤 AI 對品牌的描述是否錯誤。

（深度＝115 行以上，共 15 個：content-repurposer、programmatic-seo-builder、e2e-seo-assistant、email-sequence-writer、icp-research-assistant、utm-tracking-generator、landing-page-audit-39、ab-test-analyzer、reddit-ads-audit、competitor-teardown、linkedin-ads-audit、ad-spend-allocator、meta-ads-audit、google-ads-audit、programmatic-seo-playbook。）

**對你最有用的前 10 項與用法**
1. `content-repurposer`：把商品頁說明丟進去，要它產出 3 支 15–30 秒短影音腳本（Hook→Value→CTA）＋廣告 hook；提示加「用台灣口語、繁體中文」。
2. `ad-copy-variant-generator`：貼上最近 30 天表現最好的 3 則廣告文案與 CTR／CPA，要 8 個只改 1–2 變因的變體。
3. `meta-ads-audit`：每週貼 Meta 廣告管理員匯出，拿門檻表找疲勞素材與重疊受眾。
4. `creative-fatigue-detection`：決定影片素材何時該換、該補拍幾支。
5. `competitor-creative-analysis`：手動抓對手 Meta 廣告檔案庫的素材描述，找對手沒用的切角（例如開箱 UGC）。
6. `ad-spend-allocator`：Google／Meta 預算重分配；公式可寫進你的系統。
7. `wasted-spend-finder`：找出零轉換的關鍵字與版位，直接產否定清單。
8. `landing-page-audit-39`：截圖你的商品頁做 CRO 檢查（手機版摩擦、信任元素）。
9. `ab-test-analyzer`：判斷兩支影片素材的勝負是否真的顯著，避免小樣本誤判。
10. `utm-tracking-generator`：統一所有廣告連結 UTM，讓 GA4 能分清哪支影片帶單。

**值得學的 skill 寫法（短摘錄）**
- **兩種模板**：短版固定 5 段「What it does／How it works／Practical example／What you get back／When to use it」（見 [creative-fatigue-detection L10-L30](https://github.com/irinabuht12-oss/marketing-skills/blob/b3bdcd618a61034509f66e48ac0bb588f8defceb/skills/creative-fatigue-detection/SKILL.md#L10-L30)）；深版為「Process（編號步驟）→ 門檻表／公式 → Output Format（含 Markdown 模板）→ Example（輸入＋完整輸出）→ Guidelines」。
- **門檻寫成表格**：例如 `| Frequency | >3-4 | Refresh creative or expand audience |`，讓 Claude 判斷可重現。
- **分級輸出**：「urgent／warning／healthy」或 🔴🟡🟢，加上 `Confidence Level: [HIGH/MEDIUM/LOW]`。
- **防幻覺守則**：「Never guess at conversion values」「If data is incomplete, state what's missing and request it」。
- **腳本秒數標記**：`**[HOOK - 0-3 sec]**` → `**[VALUE - 4-20 sec]**` → `**[CTA - 21-30 sec]**`，非常適合直接改成你的商品影片腳本 skill。
- **description 寫觸發條件**：「Use when pasting …」「Use when given …」，讓 Claude 自動判斷何時載入。

## 關鍵字
Claude Skills、Claude Code plugin、行銷技能、廣告健檢、Google Ads、Meta Ads、Facebook 廣告、素材疲勞、creative fatigue、受眾重疊、ROAS、MER、邊際 ROAS、預算分配、A/B 測試、統計顯著性、短影音腳本、video script、Hook Value CTA、廣告文案變體、UTM、GA4、SEO、programmatic SEO、AI visibility、GEO、AEO、Ryze MCP、MCP、landing page CRO、marketing skills
