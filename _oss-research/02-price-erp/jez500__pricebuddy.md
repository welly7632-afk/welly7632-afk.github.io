# jez500/pricebuddy — 自架的多店價格追蹤器：貼網址就抓價、存價格歷史、降價／補貨通知，抓不到時可用 AI（含 Claude）補救

> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：f606128
> GitHub：https://github.com/jez500/pricebuddy｜⭐ 1490｜授權：GPL-3.0（`composer.json` 寫 `GPL-3.0-only`）｜主要語言：PHP｜最近更新：2026-10-24

本次掃描的 commit 完整 SHA：`f606128f5f723b70fe817362954e251c02143745`。另外看了兩個同作者的配套 repo：`jez500/pricebuddy-cli`（commit `966f81f`，Go，Apache-2.0，含 MCP 伺服器）與 `jez500/web-scraper-for-laravel`（commit `5ee50b5`，PHP，MIT，實際的抓網頁引擎）。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 把「商品網址」丟進去，它會依排程去抓標題、價格、圖片、庫存狀態，存成價格歷史，同一個商品可掛多家店的網址互相比價，價格到你設定的門檻就推播。

**對你（台灣小電商老闆）具體可以做的事：**

- **競品監控**：把競爭對手在 momo／PChome／蝦皮／官網的同款商品網址掛進同一個「商品」，每天自動抓價，看誰最便宜、誰缺貨（是否能抓得到台灣各大平台，本次**未實測**，見第 9 節）。
- **進貨價追蹤**：把供應商或批發網站（例如 1688、Amazon、eBay）的商品頁掛進來，降價就通知你，當作「補貨時機」提醒。
- **抓價引擎拆出來用**：它最有價值的是一套「CSS selector／XPath／Regex／JSON path／Schema.org JSON-LD」多策略抓價邏輯＋「抓不到就讓 AI 讀 HTML 補價格」＋「讓 AI agent 自動修好抓價規則」。這三段邏輯可以請 Claude Code 翻成 JavaScript，接到你自己的 Firebase 倉儲系統裡做「進價／競品價」欄位。
- **用 Claude 問價格**：配套的 `pricebuddy-cli` 有 MCP 伺服器，可以在 Claude Desktop 直接問「這個商品現在是不是好價格？」。

**不能做的事：** 它不是 ERP，沒有進銷存、採購單、成本計算、發票；也沒有試算表或影片功能。

---

## 2. 授權白話

- **主專案 GPL-3.0**（[LICENSE](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/LICENSE)、`composer.json` 的 `"license": "GPL-3.0-only"`）。
  - **個人使用**：完全沒問題，自己架、自己改都行。
  - **公司內部使用**：也可以。GPL 只在你「散布」（把程式交給別人、賣給別人、讓別人下載）時才要求你一起公開原始碼。GPL-3.0 不是 AGPL，所以「架在自己伺服器上給員工用」不算散布。
  - **要注意的地方**：如果你把它的 PHP 程式碼「照抄或翻譯」進你自己的倉儲系統，之後又把那套系統**賣給或交給別人**，整套系統就必須以 GPL-3.0 公開原始碼。只學「做法」、自己重寫則不受限。
- **配套 CLI（含 MCP）是 Apache-2.0**、**抓網頁引擎 `web-scraper-for-laravel` 是 MIT**：這兩個商用、閉源整合都很寬鬆，只要保留授權聲明。
- **沒有付費版或閉源功能**：本次在程式碼中沒看到任何 license key、付費牆或「Pro」分支。
- **聯盟行銷碼（affiliate）**：預設會在 Amazon、eBay 的購買連結加上作者的推廣參數，**清單裡包含 `ebay.com.tw`**。不想要就在 `.env` 設 `AFFILIATE_ENABLED=false`（[config/affiliates.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/config/affiliates.php)，處理邏輯在 [AffiliateHelper.php#L43-L56](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Helpers/AffiliateHelper.php#L43-L56)）。

---

## 3. 技術棧與執行需求

| 項目 | 內容（依 `composer.json`、`docker-compose.yml` 確認） |
|---|---|
| 後端 | PHP ^8.4、Laravel ^12、`laravel/ai` ^0.7.2（官方 AI SDK）、`laravel/sanctum`（API Token） |
| 前端／管理介面 | Filament ^3（Laravel 的後台框架，Livewire＋Tailwind），沒有獨立的 React/Vue 前端 |
| 資料庫 | Docker 預設 MySQL 8.2；另有 PostgreSQL 相容的 migration（`2026_09_21_..._on_pgsql.php`） |
| 抓網頁 | 兩種模式：`http`（curl，快）與 `api`（另一個容器 `jez500/seleniumbase-scrapper`，用真實瀏覽器渲染 JavaScript） |
| 部署 | `docker compose up -d`，三個容器：app、database、scraper；預設 `http://localhost:8080`，預設帳密 `admin@example.com / admin`（**務必改**） |
| 排程 | 容器內建 cron：全域預設每天 06:00 抓一次（`0 6 * * *`），另有每分鐘檢查「自訂頻率」商品 |
| 硬體 | 無 GPU 需求。瀏覽器抓取容器（Selenium）比較吃記憶體，實際需求未確認；一般小型 VPS／NAS 即可起步 |
| API Key | **全部選用**。AI 預設關閉；要用就自備 OpenAI／Anthropic（Claude）／Gemini 的 key，或用本機 Ollama（免費） |
| 費用估算 | 只有 AI 會花錢：AI 抽取每次最多送 25,000 字元 HTML（[AiExtractionService.php#L17](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/AiExtractionService.php#L17)），且只在「抓不到價格」時才觸發。用 Claude Haiku 級模型的話，個人量級每月應在數十到數百台幣以內（粗估，未實測）。商品搜尋需自架 SearXNG（免費） |

---

## 4. 程式架構地圖

計數方式：`git ls-tree -r --name-only HEAD | wc -l` 得 729 個檔案；`find app -name '*.php' | wc -l` 得 271 個 PHP 檔，合計 22,569 行（`xargs cat | wc -l`）；`database/migrations` 35 個。

```
pricebuddy/
├── app/
│   ├── Services/                ← 核心商業邏輯（最值得看）
│   │   ├── ScrapeUrl.php        ← 抓價主流程：找店家→抓頁面→依策略取值→404 偵測→重試
│   │   ├── StrategyExtractor.php← 單一欄位依策略（selector/xpath/regex/json/schema.org）取值
│   │   ├── SchemaOrgService.php ← 解析 JSON-LD 與 microdata 的 Product/Offer
│   │   ├── AutoCreateStore.php  ← 第一次遇到新網域時，自動試出可用的抓價規則
│   │   ├── AiService.php        ← AI provider 統一入口（結構化輸出、agent 工具迴圈、熔斷）
│   │   ├── AiExtractionService.php ← 「讓 AI 直接讀 HTML 回傳價格」的 prompt 與 schema
│   │   ├── AiScrapeEnhancer.php ← 抓不到價格時才呼叫 AI 補值（信心值 ≥ 0.6 才採用）
│   │   ├── AiConfigHealer.php   ← AI agent 自動修復店家抓價規則（自我修復）
│   │   ├── Ai/                  ← agent 工具（抓 HTML、測 CSS selector、測 Regex）、密鑰遮蔽
│   │   ├── Insights/            ← 價格洞察：好價分數、百分位、跌價事件、各店對決、季節性
│   │   ├── SearchService.php    ← 透過 SearXNG 搜尋商品並抓價
│   │   ├── MetaExtractionService.php ← POST /api/meta-extraction 的實作（不入庫的即時抓價）
│   │   └── Helpers/             ← 幣別解析（CurrencyHelper）、排程、通知、聯盟碼
│   ├── Models/                  ← Product（商品）、Url（某店的網址）、Price（每次抓到的價格）、Store（店家＋抓價策略）
│   ├── Notifications/Channels/  ← Discord、Telegram、ntfy、Gotify、Apprise 自訂通道
│   ├── Listeners/               ← 新價格產生→判斷是否通知；庫存狀態變化→補貨通知
│   ├── Jobs/                    ← 佇列工作：更新全部價格、單一商品價格、重試
│   ├── Filament/                ← 後台頁面、表單、圖表、REST API（rupadana/filament-api-service）
│   └── Enums/                   ← 抓價策略類型、AI provider、庫存狀態、通知方式
├── config/price_buddy.php       ← 自動建店時嘗試的 selector/regex 清單、AI 熔斷參數
├── config/affiliates.php        ← 聯盟行銷碼設定
├── database/migrations/         ← 資料表定義
├── resources/datasets/currency.json ← 幣別資料（含 TWD／zh_Hant_TW）
├── docs/docs/                   ← 使用文件（VuePress），api.md 有完整 API 說明
├── docker/、docker-compose.yml  ← 部署
├── .ai/skills/                  ← 給 AI 寫程式助手（Claude Code 等）的開發用 Skill 說明
└── tests/                       ← 171 個 *Test.php（Pest/PHPUnit）
```

---

## 5. 核心功能怎麼實作

**(1) 抓價主流程** → [ScrapeUrl.php#L152-L261](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/ScrapeUrl.php#L152-L261)
- 以網址的網域找到 `Store`（[#L334-L343](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/ScrapeUrl.php#L334-L343)），依店家設定選 curl 或瀏覽器模式、帶 cookie、用快取。
- 對 `title / description / price / image / availability` 五個欄位各跑一個策略；沒抓到 title 就重試（預設 3 次，第二次起不用快取）。
- **假 404 防護**（[#L269-L296](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/ScrapeUrl.php#L269-L296)）：頁面標題像「Page not found」時，把價格清空並標為「停售」，避免把「滿 $899 免運」這種橫幅金額誤當成商品價格。這個細節很實用。
- **標題去雜訊**（[#L526-L552](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/ScrapeUrl.php#L526-L552)）：去掉「｜Amazon.com」這類尾巴。

**(2) 五種取值策略** → [StrategyExtractor.php#L19-L53](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/StrategyExtractor.php#L19-L53)、[ScraperStrategyType.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Enums/ScraperStrategyType.php)
- `selector` 支援 `meta[property="og:price:amount"]|content` 這種「選擇器｜屬性」語法，`!` 開頭取原始 HTML（[ScrapeUrl.php#L435-L455](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/ScrapeUrl.php#L435-L455)）。
- 每個策略可設 `prepend / append` 前後綴。Regex 會自動補分隔符號（[#L378-L395](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/ScrapeUrl.php#L378-L395)）。

**(3) Schema.org／JSON-LD 解析** → [SchemaOrgService.php#L18-L62](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/SchemaOrgService.php#L18-L62)
- 找 `@type` 含 Product 的節點，價格依序取 `offers.lowPrice → offers.price → offers.0.price → offers.priceSpecification.price`；JSON-LD 沒有就退回 HTML microdata（[#L101-L136](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/SchemaOrgService.php#L101-L136)）。這段邏輯短、無依賴，最容易翻成 JS。

**(4) 新網域自動建店** → [AutoCreateStore.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/AutoCreateStore.php)＋[config/price_buddy.php#L72-L118](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/config/price_buddy.php#L72-L118)
- 依序嘗試 Schema.org → 一串常見 selector（og meta、`.price`、Amazon 的 `.a-price .a-offscreen`…）→ Regex，第一個抓得到合理值的就寫入店家設定。注意預設 Regex 都是 `$` 符號，對 `NT$`／`$1,299` 的台灣頁面是否適用**未確認**。

**(5) 價格入庫與幣別解析** → [Url.php#L439-L502](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Url.php#L439-L502)、[CurrencyHelper.php#L63-L133](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Helpers/CurrencyHelper.php#L63-L133)
- 抓到的字串先剝掉非數字，再依店家的 locale／幣別用 moneyphp 解析；兩種分隔符號同時出現時「最後一個是小數點」。解析失敗回 `null`，不會誤存成 0 元。
- 寫入時同時算 `unit_price = price / price_factor`（例如 10 入裝 factor=10），可做「單位價格」比較。
- 流程中先呼叫 `AiConfigHealer::heal()` 再呼叫 `AiScrapeEnhancer::enhance()`（[#L448-L453](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Url.php#L448-L453)）。

**(6) 通知判斷** → [Product.php#L761-L804](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Product.php#L761-L804)、[PriceCreatedListener.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Listeners/PriceCreatedListener.php)
- 三種條件：低於目標價、比「第一次抓到的價格」低 N%、或每次變動都通知；同價不重複通知（[Url.php#L545-L562](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Url.php#L545-L562)）。缺貨→有貨另有 `AvailabilityChangedEvent`。
- 通道：Email、站內、Pushover、Gotify、Apprise、Telegram、Discord、ntfy（[NotificationMethods.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Enums/NotificationMethods.php)）。**沒有 LINE**。

**(7) 價格洞察** → [Insights/](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Insights/ProductInsights.php)
- 好價分數 0–10（[DealScoreCalculator.php#L48-L76](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Insights/DealScoreCalculator.php#L48-L76)）：依「目前價格贏過歷史幾成」計分，史低至少 9.5 分，資料少於 14 天標「低信心」；價格從沒變過時不亂喊「好價」。
- 各店對決（[StoreShowdownCalculator.php#L15-L66](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Insights/StoreShowdownCalculator.php#L15-L66)）：逐日統計哪家店最便宜的「勝率」與今天最便宜的是誰。

**(8) 排程** → [ScheduleHelper.php#L38-L56](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Helpers/ScheduleHelper.php#L38-L56)：全域 cron＋每分鐘檢查自訂頻率商品，透過 Laravel 佇列分批（每批 10 個）抓。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| Schema.org／microdata 價格解析 | [SchemaOrgService.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/SchemaOrgService.php) | Symfony DomCrawler | 低 | 請 Claude 翻成 JS（用 `cheerio` 或瀏覽器 DOMParser），放進 Firebase Cloud Function，輸入 HTML 輸出 `{title, price, currency, image, availability}` |
| 多策略取值＋「selector｜屬性」語法 | [StrategyExtractor.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/StrategyExtractor.php)、[ScrapeUrl.php#L360-L455](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/ScrapeUrl.php#L360-L455) | web-scraper-for-laravel（MIT） | 低 | 店家規則存成 Firestore 文件 `{price:{type:'selector',value:'...'}}`，Cloud Function 依規則取值 |
| 自動建店的候選 selector 清單 | [config/price_buddy.php#L72-L118](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/config/price_buddy.php#L72-L118) | 無 | 低 | 直接當資料表用，再補上台灣站常見的 selector 與 `NT$` regex |
| 價格字串解析（千分位／小數點判斷） | [CurrencyHelper.php#L63-L133](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Helpers/CurrencyHelper.php#L63-L133) | moneyphp、PHP intl | 低 | `parseBySeparators()` 純邏輯可直接翻 JS；locale 解析可改用 `Intl.NumberFormat` |
| 假 404／橫幅金額防護 | [ScrapeUrl.php#L57-L74、#L269-L296](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/ScrapeUrl.php#L57-L74) | 無（兩條 regex） | 低 | 抓價後先過這兩條 regex，命中就不寫價格 |
| AI 抽取 prompt＋JSON schema | [AiExtractionService.php#L22-L84](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/AiExtractionService.php#L22-L84) | laravel/ai | 低 | prompt 原文可直接用 Claude API 的 structured output／tool use 重做；HTML 先刪 script/style/meta 再截 25,000 字 |
| AI 自我修復 agent（含 3 個工具） | [AiConfigHealer.php#L49-L92、#L432-L529](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/AiConfigHealer.php#L432-L529)、[Ai/Tools/](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Ai/Tools/TestCssSelectorTool.php)、[HealingContext.php#L110-L161](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Ai/HealingContext.php#L110-L161) | laravel/ai、Cache lock | 中 | 用 Claude tool use 實作 `fetch_page_html / test_css_selector / test_regex` 三個工具，讓 Claude 產出規則、驗證後存回 Firestore；要自己做冷卻（原本 24 小時）與鎖 |
| 好價分數＋各店對決 | [DealScoreCalculator.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Insights/DealScoreCalculator.php)、[StoreShowdownCalculator.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Insights/StoreShowdownCalculator.php) | 無（純計算） | 低 | 輸入「每日價格陣列」即可，適合放到網頁試算表當自訂函式或儀表板 |
| 通知條件判斷 | [Product.php#L761-L804](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Product.php#L761-L804) | Eloquent | 低 | 改寫成 Firestore trigger：新價格文件建立時判斷，再呼叫 LINE Messaging API 或 Telegram 推播 |
| SSRF 防護驗證 | [PublicHttpUrl.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Rules/PublicHttpUrl.php) | 無 | 低 | 自己做「貼網址抓價」功能時，擋掉內網 IP |
| 整個 PriceBuddy 當獨立服務 | REST API（見第 8 節） | Docker | 低 | 不拆程式，直接架起來，你的系統透過 API 讀價格 |

---

## 7. AI／Claude 整合

- **支援的 provider**：OpenAI、**Anthropic（Claude）**、Gemini、Ollama（[AiProvider.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Enums/AiProvider.php)），透過 Laravel 官方 `laravel/ai` SDK；`config/ai.php` 的 anthropic 端點為 `https://api.anthropic.com/v1`。**Claude 是原生支援**，在後台設定頁選 Anthropic、填 key、選模型即可。模型名稱由使用者自填，程式碼沒有寫死特定模型。
- **兩個 AI 功能**（[AiFeature.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Enums/AiFeature.php)），可分別指定不同 provider，且每家店可覆寫：
  1. **Extraction（抽取）**：抓不到價格時，把清理後的 HTML 給 AI，要求回 `name/price/currency/imageUrl/stockStatus/confidence`，信心 < 0.6 就丟棄（[AiScrapeEnhancer.php#L13、#L77](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/AiScrapeEnhancer.php#L77-L83)）。預設每家店關閉，要逐店開啟。prompt 註明移植自另一專案 PriceGhost。
  2. **Healing（自我修復）**：tool-using agent 最多 25 步，自己抓 HTML、測 selector／regex，驗證出 title 和 price 都抓得到才寫回店家規則；失敗後同店 24 小時內不再試；先用另一個商品驗證舊規則是否其實還有效，避免「把 selector 修到別的商品價格上」。
- **prompt 位置**：[AiExtractionService.php#L22-L36](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/AiExtractionService.php#L22-L36)、[AiConfigHealer.php#L49-L92](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/AiConfigHealer.php#L49-L92)；防 prompt injection 的固定句在 [HtmlSafety.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Ai/HtmlSafety.php)。
- **安全細節**：API key 用 Laravel `Crypt` 加密存放、錯誤訊息會遮蔽 key（[AiService.php#L229-L253](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/AiService.php#L229-L253)）；有連續失敗熔斷（預設 3 次、冷卻 300 秒，`config/price_buddy.php`）。
- **MCP**：主專案本身沒有 MCP 伺服器；配套 `jez500/pricebuddy-cli`（Go，Apache-2.0）有 `cmd/pricebuddy-mcp`，支援 stdio 與 streamable HTTP，並提供 Claude Desktop 的 `.mcpb` 一鍵安裝包，用 `PRICEBUDDY_BASE_URL`＋`PRICEBUDDY_API_TOKEN` 連到你的 PriceBuddy。
- **Skills**：`.ai/skills/url-scraping`、`.ai/skills/stores` 是給 Claude Code／Codex 開發這個專案用的說明（`boost.json` 列出 `claude_code`），不是給終端使用者的功能；可以當作「請 Claude 改這套程式」時的背景資料。
- **沒有**：影片、腳本生成、圖片生成相關功能。

---

## 8. 擴充方式與 API

- **REST API**（文件 [docs/docs/api.md](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/docs/docs/api.md)；Token 在後台建立，Sanctum 驗證並可設權限範圍）：
  - `GET/POST /api/products`、`GET/PUT/DELETE /api/products/{id}`、`POST /api/products/{id}/urls`（加網址）、`GET /api/products/{id}?include=insights`（好價分數等）、`GET /api/products?filter[url]=...`（用網址反查）。
  - `GET/POST/PUT /api/stores`（店家與抓價規則）、`/api/tags`、`/api/product-sources`。
  - `POST /api/meta-extraction`（[routes/api.php#L13-L15](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/routes/api.php#L13-L15)）：**丟一個網址回傳 title/price/currency/image，不入庫**，可帶自訂抓價規則測試。這是最適合讓你的 Firebase 系統呼叫的「查價 API」。
- **新增店家不用改程式**：後台表單設定 selector；店家設定可匯出分享／匯入 JSON（`ShareStoreAction`、`ImportStoreAction`）。
- **商品來源（Product Sources）**：設定「某網站的搜尋網址＋抓結果規則」，再用 SearXNG 在 PriceBuddy 內搜尋商品。
- **Webhook**：沒有通用的 outbound webhook。變通法：ntfy 通道會把訊息以純文字 POST 到「伺服器網址／topic」，且伺服器網址可自訂（[NtfyChannel.php#L64-L103](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Notifications/Channels/NtfyChannel.php#L64-L103)），理論上可指向你自己的 Cloud Function 接收降價事件（未實測）。
- **匯出**：主程式沒有 CSV／Excel 匯出；CLI 有 `pricebuddy export` 匯出 JSON／JSONL。
- **瀏覽器擴充**：PriceBuddy Companion（Chrome/Edge），在商品頁直接加入追蹤並修規則（原始碼在另一個 repo，本次未讀）。

---

## 9. 程式品質與風險

- **維護狀況**：單一作者（Jeremy Graham）為主，2025-02 建立、2026-10-24 仍有推送；migration 從 2025-01 到 2026-10 持續增加（35 個），活躍。
- **測試**：`tests/` 下 171 個 `*Test.php`；以 `grep "public function test"` 計 1,195 個 PHPUnit 式測試方法（另有 21 個 Pest `test()/it()`）。CI 跑 Pint、PHPStan、測試，再建 Docker 映像（[.github/workflows/ci.yml](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/.github/workflows/ci.yml)）。品質在個人開源專案中算高。
- **資安**：有 SSRF 防護（擋內網 IP）、AI key 加密、HTML 當不可信資料的 prompt 規則。但**預設帳密 admin/admin、docker-compose 的資料庫密碼寫死**，對外公開前必改。
- **遙測**：程式內沒找到 analytics／Sentry／回報作者伺服器的程式碼（grep `telemetry|analytics|sentry|posthog`）；唯一對外與作者有關的是說明連結與**預設開啟的聯盟碼**。
- **已知的坑**：
  - 價格欄位是 `float`（[create_prices_table](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/database/migrations/2025_01_08_040213_create_prices_table.php)），拿來做會計或成本計算會有浮點誤差；追蹤價格夠用。
  - 介面**只有英文**，repo 內沒有 `lang/` 翻譯檔。
  - 台灣電商（蝦皮、momo、PChome）多為 JavaScript 渲染且有反爬蟲，curl 模式大概抓不到，要用瀏覽器模式（Selenium 容器）或開 AI 修復，**實際成功率未確認**。大量、頻繁抓取也可能違反各平台使用條款，個人低頻使用較安全。
  - 預設 regex 以 `$` 開頭金額為主，台灣頁面可能要自己調。
  - 技術棧是 PHP／Laravel，跟你現有的 JS＋Firebase 不同，直接併入要重寫；最省事的組合方式是「另外架起來、用 API 串」。

---

## 10. 跟其他專案組合的建議

1. **「查價服務」＋你的倉儲系統**：PriceBuddy 用 Docker 架在家用 NAS 或便宜 VPS；你的 Firebase 系統在商品頁加一欄「競品網址」，按按鈕就呼叫 `POST /api/meta-extraction` 回填競品價，或用 `POST /api/products/{id}/urls` 讓它長期追蹤。
2. **只拿「腦袋」重寫成 JS**：用 Claude Code 把 `SchemaOrgService`＋`StrategyExtractor`＋`CurrencyHelper::parseBySeparators`＋假 404 防護＋`AiExtractionService` 的 prompt 翻成一支 Cloud Function（注意第 2 節 GPL 的散布限制；只供自己用沒問題）。
3. **＋網頁版試算表（01-web-excel 類專案）**：把價格歷史（`GET /api/products/{id}?include=insights`）拉進網頁試算表，自己加毛利公式：`(售價 − 進價 − 運費) ÷ 售價`。PriceBuddy 本身沒有成本／毛利欄位。
4. **＋ERP 類專案（例如 Odoo、ERPNext 等）**：ERP 管進銷存與成本，PriceBuddy 只負責「外部價格情報」。
5. **＋Claude**：裝 `pricebuddy-cli` 的 MCP，在 Claude Desktop 問「這週哪些進貨品項降價超過 10%？」；或在自己的工具裡用 Claude 做 Healing 那套 tool-use 迴圈。
6. **＋影片／腳本專案（03 類）**：抓到的商品 title、image、price 可當作電商短影片腳本的素材輸入（需自己串接）。

---

## 11. 價格相關功能檢查表

- **商品與價格資料模型**：**部分有**。
  - 品項：有，`Product` →多個 `Url`（不同店的網址）→多筆 `Price`（[Price.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Price.php)）。
  - 多單位：**有簡易版**，`unit_of_measure`＋每個網址的 `price_factor`，算 `unit_price`（[Url.php#L494-L501](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Url.php#L494-L501)、[add_factor_and_unit_price migration](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/database/migrations/2026_02_12_000000_add_factor_and_unit_price.php)），比價時依單位價格排序（[Product.php#L535-L609](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Product.php#L535-L609)）。
  - 多幣別：每家店可設自己的 locale 與幣別（[Store.php#L263-L276](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Store.php#L263-L276)），但**沒有匯率換算**，不同幣別的店放同一商品會直接比數字。
  - 價目表、客戶別價格：**沒有**。
- **進價：多家供應商報價、比價、詢價單（RFQ）、採購單**：比價**有**（同商品多店網址＋[各店對決](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Insights/StoreShowdownCalculator.php)），但對象是公開網頁價格，不是供應商報價；RFQ、採購單**沒有**。
- **成本：庫存估值（FIFO／移動平均）、到岸成本、毛利與定價計算**：**沒有**。只有價格統計（最高／最低／平均／百分位，[PriceStatsCalculator.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/Insights/PriceStatsCalculator.php)）。
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知**：**有，這是本專案主力**。抓價見 [ScrapeUrl.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Services/ScrapeUrl.php)；歷史圖表見 [PriceHistoryChart.php](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Filament/Resources/ProductResource/Widgets/PriceHistoryChart.php)；降價通知見 [Product.php#L761-L804](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Models/Product.php#L761-L804)；補貨通知由 `AvailabilityChangedEvent`→[StockAlertNotification](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Notifications/StockAlertNotification.php)，六種庫存狀態見 [StockStatus.php#L13-L18](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/app/Enums/StockStatus.php#L13-L18)。
- **庫存／倉儲（入庫、出庫、盤點）**：**沒有**。「庫存」只指對方網站是否有貨。**跟你的 Firebase 倉儲串接**：可用 REST API（Sanctum Bearer Token）讀寫商品與價格、用 `POST /api/meta-extraction` 即時查價；沒有原生 webhook，可用 ntfy 通道自訂伺服器網址當變通 webhook（未實測）；匯出只能靠 CLI 的 JSON／JSONL。
- **台灣在地化**：
  - 繁中介面：**沒有**（無 `lang/` 目錄，介面英文）。
  - 新台幣：**有幣別資料**，`currency.json` 收錄 `TWD`、符號 `NT$`、locale `zh_Hant_TW`（[resources/datasets/currency.json](https://github.com/jez500/pricebuddy/blob/f606128f5f723b70fe817362954e251c02143745/resources/datasets/currency.json)），可在設定選 TWD 顯示與解析。
  - 台灣稅制／電子發票：**沒有**。
  - 台灣電商預設店家規則：**沒有**（唯一跟台灣有關的是聯盟碼清單中的 `ebay.com.tw`）。

---

## 關鍵字

PriceBuddy、價格追蹤、查價、比價、競品監控、降價通知、補貨通知、價格歷史、好價分數、爬蟲、網頁抓價、CSS selector、XPath、Regex、JSON-LD、Schema.org、microdata、AI 抽取、AI 自我修復、Claude、Anthropic、OpenAI、Gemini、Ollama、MCP、Claude Desktop、Laravel、Filament、PHP、MySQL、Docker、自架、self-hosted、price tracker、price history、price alert、web scraping、SearXNG、ntfy、Telegram、Discord、新台幣、TWD、GPL-3.0、REST API、meta-extraction、unit price、單位價格
