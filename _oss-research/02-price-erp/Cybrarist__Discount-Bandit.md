# Cybrarist/Discount-Bandit — 自架、多使用者的電商「降價追蹤＋通知」系統（Laravel／Filament）
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：7a58522
> GitHub：https://github.com/Cybrarist/Discount-Bandit｜⭐ 762｜授權：未明確授權（儲存庫沒有 LICENSE 檔；composer.json 寫的 MIT 是 Laravel 範本預設值）｜主要語言：PHP｜最近更新：2026-10-26

（以下所有 permalink 都指向 commit `7a58522f431ff22e772cbe76274bb8fe79590770`，路徑都是我實際打開過的檔案。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：貼上商品網址（Amazon、AliExpress、eBay、Costco、Walmart…或任何自訂商店），系統每 5 分鐘輪流去抓價格、存每日價格歷史，價格符合你設的條件（低於目標價、跌幅 X%、X 天內最低、有貨）就透過 ntfy／Telegram／Gotify／Apprise／RSS 通知你。

對你（台灣小老闆、自己用 Claude 寫倉儲系統、有在下廣告）實際能做的事：
- **監看競品／進貨來源價格**：把競爭對手或上游供應商的商品頁丟進去，對方降價、缺貨或補貨時手機收到通知，可以拿來調整自己的售價或廣告出價。
- **一個「商品」掛多個網址比價**：同一個 Product 可以連多條 Link（不同商店），在後台並排看各店價格和歷史折線圖——這就是「跨店比價」的雛形。
- **最值得抄的是「自訂商店爬蟲」設計**：不用寫程式，只要填 CSS selector 或 schema.org（JSON-LD）的 key 路徑就能新增一家商店。這套思路可以直接搬到你自己的 JavaScript／Firebase 工具，用來抓蝦皮、momo、PChome 等台灣網站（本專案本身**沒有**任何台灣電商的內建爬蟲，只有 Costco Taiwan）。
- **不適合**：當 ERP、算成本、管庫存——它完全沒有進貨、庫存、毛利模組（見第 11 節）。也沒有任何 AI 功能，跟影片／腳本生成無關。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **實際狀況**：我列出整個儲存庫的檔案清單（`git ls-tree -r --name-only HEAD`，共 639 個檔案）並搜尋 `licen`，**找不到任何 LICENSE／COPYING 檔**。GitHub 也沒有偵測到授權。
- `composer.json` 裡有一行 `"license": "MIT"`，但同一個檔案的 `"name"` 還是 `"laravel/laravel"`、描述是 `"The skeleton application for the Laravel framework."`——這是建立 Laravel 專案時範本自帶的欄位，**不能當成作者對本專案的授權聲明**（[composer.json](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/composer.json)）。
- **白話結論**：
  - **個人使用**：自己下載、自己架來追價格，實務上風險很低（GitHub 服務條款允許他人檢視與 fork 公開儲存庫）。
  - **公司商用／改寫後散布／拿程式碼放進你要賣的產品**：法律上沒有授權＝預設「保留所有權利」，嚴格說你**沒有**取得複製、修改、再散布的權利。如果要把它的程式碼直接搬進你的商業工具，建議先在 GitHub Issue 或作者的 Discord 請作者補上授權。比較安全的做法是**只學它的設計思路（selector／schema 設定格式、通知條件邏輯），自己用 Claude 重寫**。
  - 第三方套件（Laravel、Filament 等）各有自己的授權（多為 MIT），與本專案本身的授權問題是分開的。
- **付費／閉源版**：程式碼中沒看到付費牆或「Pro 版」功能開關。`.github/FUNDING.yml` 只有 GitHub Sponsors 贊助連結。官方有 Docker 映像 `cybrarist/discount-bandit:v4`（[docker-compose.yaml](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/docker-compose.yaml)）。另有一個「社群商店」儲存庫 `Cybrarist/Discount-Bandit-Community-Stores`，用來下載別人做好的商店設定（[config/settings.php](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/config/settings.php)），我沒有去讀那個儲存庫，它的授權未確認。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容（來源） |
|---|---|
| 後端 | PHP **8.4 以上**、Laravel 12、Laravel Octane（[composer.json](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/composer.json)）。程式碼用到 PHP 8.4 才有的 `Dom\HTMLDocument` 與 `private(set)` 語法。 |
| 前端／後台 | Filament 4（Livewire＋Tailwind）做的管理後台；圖表用 `leandrocfe/filament-apex-charts`（ApexCharts）。沒有獨立的前台網站。 |
| 爬蟲 | 兩種：Laravel HTTP client 直接抓（`SimpleCrawler`）＋ `chrome-php/chrome` 控制無頭 Chromium（`ChromiumCrawler`）。 |
| 資料庫 | 預設 SQLite，也可用 MySQL（[.env.example](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/.env.example)）。佇列用 database driver。 |
| 部署 | 官方建議 Docker：映像基底 `dunglas/frankenphp:1.13.2-php8.4-trixie`，內含 chromium、supervisor（[Dockerfile](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/Dockerfile)）。對外 8080 埠，SQLite 檔掛在 volume。 |
| API／登入 | Laravel Sanctum token、Filament Breezy（2FA、Session 管理）、登入紀錄（authentication-log）。 |
| 硬體 | 不需要 GPU。但要跑 Chromium，記憶體建議至少 1–2 GB（我的估計，程式碼中只看到 Chromium 參數 `--js-flags=--max-old-space-size=256` 與同時最多 4 個分頁）。 |
| API Key | **唯一可選的外部 Key**：`EXCHANGE_RATE_API_KEY`（exchangerate-api.com，用來每天更新匯率，[GetExchangePriceTodayCommand.php#L30-L54](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Console/Commands/GetExchangePriceTodayCommand.php#L30-L54)）。該服務有免費方案（額度與價格以官網為準，未確認）。通知用的 Telegram Bot、ntfy、Gotify、Apprise 都是免費或可自架。**沒有任何 AI API 費用。** |
| 重要提醒 | 它不能跑在 Firebase Hosting 上（需要常駐 PHP＋排程＋Chromium），要放在 NAS、家用電腦 Docker、或一台小 VPS。 |

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

```
Discount-Bandit/
├── app/
│   ├── Classes/
│   │   ├── StoreTemplate.php          ← 內建商店爬蟲的抽象父類別（9 步驟管線）
│   │   ├── CustomStoreTemplate.php    ← 「自訂商店」通用爬蟲（用 DB 裡的 selector／schema key 設定）
│   │   ├── Crawler/SimpleCrawler.php  ← HTTP 直接抓 HTML
│   │   ├── Crawler/ChromiumCrawler.php← 無頭 Chromium，共用一個瀏覽器＋檔案鎖控制併發
│   │   └── Stores/*.php               ← 27 個內建商店（Amazon、Aliexpress、Ebay、Costco、Walmart…）
│   ├── Services/
│   │   ├── SchemaParser.php           ← 從頁面抽 schema.org Product／ProductGroup（JSON-LD 與 microdata）
│   │   ├── NotificationService.php    ← 判斷「該不該通知」的所有條件
│   │   ├── URLParserService.php       ← 網址 → 商店＋商品 key；展開短網址
│   │   └── PriceHistoryService.php    ← 產生價格歷史圖表資料
│   ├── Jobs/CrawlProductJob.php       ← 依商店名稱分派到對應爬蟲類別
│   ├── Notifications/ProductDiscounted.php ← 降價通知內容與通道選擇
│   ├── NotificationsChannels/         ← ntfy、Gotify、Apprise 自寫通道
│   ├── Casts/MoneyCast.php            ← 金額 ×1000 存整數
│   ├── Console/Commands/              ← 匯率更新、清孤兒連結、刪除長期缺貨連結等排程指令
│   ├── Filament/                      ← 後台：Products、Links、Stores、Currencies、NotificationSettings、Users…（8 個 Resource 資料夾）
│   ├── Http/Controllers/              ← API 控制器（不少是空殼，見第 8 節）
│   └── Models/                        ← Product、Link、LinkHistory、Store、Currency、NotificationSetting、User…
├── database/migrations/               ← 資料表定義（26 個 migration）
├── database/seeders/StoreSeeder.php   ← 預設商店清單（90 筆，含各國 Amazon／Costco 等）
├── routes/console.php                 ← 排程（每 5 分鐘派爬蟲工作）
├── routes/api.php / web.php           ← REST API 與簽章臨時連結
├── tests/                             ← 14 個測試檔、50 個 test 方法
├── Dockerfile / docker-compose.yaml   ← 部署
└── .claude/ .cursor/ .agents/ .mcp.json ← 作者給 AI 編碼工具用的設定（Laravel Boost），與執行功能無關
```
計數方式：商店類別用 `ls app/Classes/Stores | wc -l`（27）；種子商店數用 `grep -c "'name' =>" database/seeders/StoreSeeder.php`（90）；migration 用檔案清單計數；測試方法用 `grep -rn "public function test" tests | wc -l`（50）。

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 排程派工**
→ [routes/console.php#L8-L44](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/routes/console.php#L8-L44)
重點：依 `CRON`（預設 `*/5 * * * *`）執行；每次先**清空整個 jobs 表**，再對每家「啟用中」的商店取最久沒更新的 60 條連結，依商店 slug 分到各自的佇列，並以 `index × 5 秒` 錯開，避免同一網站被打太快。每天另跑匯率更新、刪孤兒連結、刪長期缺貨連結。

**5.2 分派到對應爬蟲**
→ [app/Jobs/CrawlProductJob.php#L57-L85](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Jobs/CrawlProductJob.php#L57-L85)
重點：用 `match(true)` 比對**商店名稱字串**（例如名稱含 `Amazon` 就用 Amazon 類別），都沒對到就走 `CustomStoreTemplate`。

**5.3 爬蟲管線（範本方法模式）**
→ [app/Classes/StoreTemplate.php#L61-L99](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/StoreTemplate.php#L61-L99)
重點：建構子依序跑 9 步：before_crawl → crawl_product → 偵測被當機器人 → 整理 DOM → 抓名稱／圖片／評論／評分／賣家 → 抓價格／二手價／庫存／運費／新舊 → 補商品資料 → 判斷通知 → 寫價格歷史。**每一步各自 try/catch**，一步失敗只記 log，不會中斷後面的步驟。子類別只要實作 10 個抽象方法（[#L246-L277](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/StoreTemplate.php#L246-L277)）。

**5.4 Amazon 抓價**
→ [app/Classes/Stores/Amazon.php#L28-L60](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Stores/Amazon.php#L28-L60)、[#L135-L157](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Stores/Amazon.php#L135-L157)
重點：amazon.de／amazon.ca 用 Chromium，其餘用 HTTP＋隨機 User-Agent；網址模板 `https://www.[domain]/dp/[ASIN]?[referral]`；價格由 `span.a-price-whole` 與 `span.a-price-fraction` 兩段拼起來，selector 有 5 組備援。

**5.5 AliExpress 抓價**
→ [app/Classes/Stores/Aliexpress.php#L107-L133](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Stores/Aliexpress.php#L107-L133)
重點：一律用 Chromium；優先讀 JSON-LD 的 `offers.price` 與 `priceCurrency`，沒有才用 `span[class^='price-default--current']`；偵測到的幣別再除以匯率換回美元基準。

**5.6 eBay**：[app/Classes/Stores/Ebay.php](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Stores/Ebay.php) 用 Chromium，主要讀 `schema['product']['offers']`（價格、庫存、`shippingDetails.shippingRate.value` 運費）。

**5.7 兩種抓取器**
→ [SimpleCrawler.php#L25-L37](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Crawler/SimpleCrawler.php#L25-L37)：Laravel `Http` 加 header 後抓回字串，用 `Dom\HTMLDocument::createFromString` 解析。
→ [ChromiumCrawler.php#L72-L143](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Crawler/ChromiumCrawler.php#L72-L143)：把瀏覽器 WebSocket 位址存在 `/tmp/chrome-php-demo-socket`，所有工作共用同一個 Chromium；用 `flock` 檔案鎖避免重複開瀏覽器，再用「計數檔＋鎖」做成**最多 4 個分頁的號誌**，等超過 30 秒就放棄。啟動參數含 `stealth`、`--disable-blink-features=AutomationControlled` 等反偵測設定（[#L35-L70](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Crawler/ChromiumCrawler.php#L35-L70)）。

**5.8 schema.org 解析（通吃大多數電商）**
→ [app/Services/SchemaParser.php#L21-L105](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/SchemaParser.php#L21-L105)
重點：先找 `<script type="application/ld+json">` 中 `@type` 為 `ProductGroup`、再找 `Product`；都沒有就退回 HTML microdata（`[itemType$="schema.org/Product"]` 裡的 `meta[itemprop=...]`）。這個 100 行左右的類別是整個專案最容易移植的部分。

**5.9 自訂商店（不用寫程式新增網站）**
→ [app/Classes/CustomStoreTemplate.php#L123-L133](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/CustomStoreTemplate.php#L123-L133)（選抓取方式）、[#L354-L378](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/CustomStoreTemplate.php#L354-L378)（價格）、[#L383-L421](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/CustomStoreTemplate.php#L383-L421)（庫存判斷）、[#L489-L541](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/CustomStoreTemplate.php#L489-L541)（路徑搜尋）
重點：`stores.custom_settings` 存一份 JSON 設定：每個欄位可給 `*_schema_key`（如 `offers.0.price`）或 `*_selectors`（CSS selector）。庫存可設「找到這個元素＝有貨／缺貨」或「元素文字等於某值」。`search_for_custom_keys_and_get_values` 支援 `*` 萬用字元與 `[sku=網址參數]` 篩選，可從多規格商品的 JSON 裡挑出網址指定的那個規格價格。

**5.10 自動猜 selector（Smart Setup）**
→ [app/Http/Controllers/Actions/NewStoreSmartSetupAction.php#L51-L143](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Http/Controllers/Actions/NewStoreSmartSetupAction.php#L51-L143)
重點：用 Chromium 開一個商品頁，試一串常見 schema 路徑（`price`、`offers.price`、`offers.0.price`…）與常見 meta（`og:title`、`og:image`），把找得到的列出來給使用者選。由後台新增商店表單呼叫（`app/Filament/Resources/Stores/Schemas/StoreForm.php` 第 113 行）。

**5.11 價格字串正規化**
→ [app/Helpers/GeneralHelper.php#L19-L38](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Helpers/GeneralHelper.php#L19-L38)
重點：處理 `1.234,56`（歐式）與 `1,234.56`（美式）；只有逗號時，逗號後剛好 2 位當小數點，否則當千分位。

**5.12 通知條件判斷**
→ [app/Services/NotificationService.php#L22-L124](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/NotificationService.php#L22-L124)
重點：先把價格換算成使用者的幣別（`使用者幣別匯率 / 商店幣別匯率`）。不通知的情況：沒價格、價格沒變、要求官方賣家但不是、商品被「暫停提醒」。符合以下任一就通知：任何價格變動、有貨、X 天內最低價、`(價格＋固定額外費用)＋價格×額外費用%` ≤ 目標價、跌幅 ≥ X%。理由會組成文字放進通知。

**5.13 通知送出**
→ [app/Notifications/ProductDiscounted.php#L78-L110](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Notifications/ProductDiscounted.php#L78-L110)、[app/NotificationsChannels/Ntfy.php#L16-L50](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/NotificationsChannels/Ntfy.php#L16-L50)
重點：依使用者設定啟用 ntfy、Telegram、Gotify、Apprise；開啟 RSS 時寫入 `rss_feed_items`。通知裡附 15 分鐘有效的簽章網址與「今天不要再提醒」連結（[routes/web.php#L9-L21](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/routes/web.php#L9-L21)）。

**5.14 價格歷史**
→ [StoreTemplate.php#L219-L235](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/StoreTemplate.php#L219-L235)、[PriceHistoryService.php#L12-L33](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/PriceHistoryService.php#L12-L33)
重點：`link_histories` 一條連結一天一筆，只保留**當日最低價**；圖表把同一商品下所有連結各畫一條線。金額經 [MoneyCast](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Casts/MoneyCast.php#L15-L28) ×1000 存成整數。

**5.15 多使用者**
→ [app/Models/Scopes/UserOwnedScope.php#L15-L21](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Models/Scopes/UserOwnedScope.php#L15-L21)、[LinkScope.php#L17-L29](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Models/Scopes/LinkScope.php#L17-L29)
重點：Product／Category／NotificationSetting 用全域 scope 依 `user_id` 隔離；Link 是**多人共用**（同一個商品網址只抓一次），透過 `link_product` 樞紐表記錄誰在追。

**5.16 網址解析與短網址**
→ [app/Services/URLParserService.php#L32-L58](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/URLParserService.php#L32-L58)、[#L103-L144](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/URLParserService.php#L103-L144)、[#L146-L167](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/URLParserService.php#L146-L167)
重點：短網址（如 a.co）用 `Http::pool` 平行追 Location 轉址；再用 `get_{網域第一段}_key()` 動態呼叫各店的 key 擷取方法（例：Amazon 取 `/dp/` 後的 ASIN，[#L212-L223](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/URLParserService.php#L212-L223)）；沒有專屬方法就把整段 path＋query 當 key。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| schema.org 商品資料解析 | [SchemaParser.php](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/SchemaParser.php) | PHP 8.4 `Dom\HTMLDocument`、`Str` | 低 | 邏輯很短，請 Claude 改寫成 JS（`cheerio` 或瀏覽器 `DOMParser`），放進 Firebase Cloud Functions，就能抓多數有 JSON-LD 的台灣電商頁。 |
| 自訂商店設定格式（selector／schema key） | [CustomStoreTemplate.php#L354-L541](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/CustomStoreTemplate.php#L354-L541)、[AddStoreToDiscountJob.php#L28-L80](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Jobs/AddStoreToDiscountJob.php#L28-L80)（JSON 欄位全貌） | Laravel `Arr`／`Str` | 中 | 把設定格式照抄成 Firestore 一份 `stores/{domain}` 文件，爬蟲讀設定決定要用 selector 還是 JSON 路徑，新增網站不用改程式。 |
| 自動猜 selector | [NewStoreSmartSetupAction.php#L69-L205](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Http/Controllers/Actions/NewStoreSmartSetupAction.php#L69-L205) | ChromiumCrawler、SchemaParser | 低 | 候選路徑清單直接搬；也可改成「把 HTML 丟給 Claude 請它回傳 selector」的 AI 版本。 |
| 價格字串正規化 | [GeneralHelper.php#L19-L38](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Helpers/GeneralHelper.php#L19-L38) | 無 | 低 | 20 行純函式，翻成 JS 即可；台灣價格常見 `NT$1,299`，剛好適用。 |
| 通知條件引擎 | [NotificationService.php#L42-L124](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/NotificationService.php#L42-L124) | Eloquent 模型、LinkHistory | 中 | 把條件（目標價、跌幅%、X 天最低、額外成本%）抽成純函式，輸入新舊價格＋歷史最低價，輸出理由陣列；可接 LINE Notify 替代品或 Telegram。 |
| Chromium 共用＋併發號誌 | [ChromiumCrawler.php#L72-L182](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Crawler/ChromiumCrawler.php#L72-L182) | chrome-php、檔案鎖 | 中 | 思路可搬到 Node＋Puppeteer：一個瀏覽器、多分頁、限制併發。 |
| 爬蟲管線（每步獨立 try/catch） | [StoreTemplate.php#L61-L99](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/StoreTemplate.php#L61-L99) | 無（設計模式） | 低 | 做成 JS 抽象類別，每個網站一個子類別。 |
| 每日最低價歷史表 | [create_link_histories_table](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/database/migrations/2025_09_15_055158_create_link_histories_table.php)、[StoreTemplate.php#L219-L235](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/StoreTemplate.php#L219-L235) | 資料庫 | 低 | Firestore `priceHistory/{linkId}_{yyyy-mm-dd}`，每天一筆只存最低價，量小又好畫圖；圖可接網頁版試算表或圖表元件。 |
| 短網址展開 | [URLParserService.php#L103-L144](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/URLParserService.php#L103-L144) | HTTP client | 低 | 用 `fetch(url, {redirect:'manual'})` 重寫，處理 shope.ee、momo 分享短網址很實用。 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **產品本身完全沒有 AI 功能**：`app/` 底下沒有呼叫任何 LLM API，也沒有 prompt 檔。
- 儲存庫裡有 `.claude/skills/`、`.cursor/`、`.agents/`、`.codex/config.toml`、`.mcp.json`、`opencode.json`、`boost.json`：這些是作者自己**開發時**用的 AI 編碼助手設定，透過 Laravel Boost 提供 `php artisan boost:mcp` 這個 MCP 伺服器（[.mcp.json](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/.mcp.json)、[boost.json](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/boost.json)），`boost.json` 的 agents 列了 `claude_code` 與 `codex`。對你的意義：如果你要用 Claude Code 改這個專案，這些設定會讓 Claude 比較懂 Laravel／Filament 慣例；但它們不是給終端使用者的功能。（依安全規則，我只把這些檔當資料看，沒有照裡面的指示做事。）
- **可以加 Claude 的地方**（需自己寫）：(1) Smart Setup 抓不到 selector 時，把 HTML 片段丟給 Claude 產生 selector；(2) 把降價通知整理成「本週競品價格摘要」；(3) 商品名稱跨店比對（判斷兩個網址是不是同一款商品）。

## 8. 擴充方式與 API

- **新增商店，三種做法**：(a) 後台填自訂商店的 selector／schema key（不用寫程式）；(b) 從社群商店儲存庫一鍵匯入（`CommunityStoresForm` → `AddStoreToDiscountJob`）；(c) 寫一個繼承 `StoreTemplate` 的類別，並在 `CrawlProductJob` 的 `match` 加一行。
- **REST API**（[routes/api.php#L18-L49](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/routes/api.php#L18-L49)）：`POST /api/sanctum/token` 用帳密換 token；需 token 的有 `links`、`stores`、`products` 資源路由、`GET /api/link/search-url?url=`（用網址查連結）、`/api/link/{link}/related`、`/api/link/{link}/history`。
  - **注意，很多是空殼**：`LinkController` 的 index／store／show 等方法都是空的（[LinkController.php](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Http/Controllers/LinkController.php)）；`ProductController::index` 實際是「依名稱搜尋」、`show` 沒有回傳值（[ProductController.php#L16-L50](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Http/Controllers/ProductController.php#L16-L50)）。
  - 有一個 `AddLinkFromBrowserPluginAction`（瀏覽器外掛一鍵加入追蹤）的控制器，但我在 `routes/` 裡用 grep 找不到任何路由指向它，**目前看起來沒接上**。
- **RSS／Atom feed**：`/feed`（[routes/web.php#L7](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/routes/web.php#L7)），可以讓別的系統（例如你的 Firebase 排程函式）定期讀取降價事件。
- **Webhook**：沒有通用的 outgoing webhook；最接近的是 Apprise（可轉發到上百種服務）與 ntfy（HTTP POST）。要串你的系統，最簡單是自架 ntfy 或讀 RSS。
- **匯入**：`app/Filament/Forms/ImportForm.php` 是從舊版 Discount Bandit 資料庫搬資料用的，不是 CSV／Excel 匯入。沒有看到 CSV／Excel 匯出功能。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：很活躍。最新 commit 為 2026-10-23「Merge branch 'v4.0.5'」，migration 檔有 2026-09、2026-10 的新增（列表模式、索引、短網址主機），Docker 映像標籤 v4。
- **測試**：14 個測試檔、50 個 test 方法，涵蓋網址 key 解析、通知、幣別換算、Chromium 鎖、商店種子；沒有針對各商店抓價的線上測試（本來也很難做）。
- **爬蟲的本質風險**：所有內建商店都靠 CSS selector，網站改版就失效；Amazon 等會擋機器人。ChromiumCrawler 開了 `--disable-web-security`、`--ignore-certificate-errors`、`--no-sandbox`（[#L35-L70](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Crawler/ChromiumCrawler.php#L35-L70)），建議放在隔離的容器裡跑。爬取電商網站是否違反對方服務條款，要自行評估。
- **遙測／隱私**：用 grep 搜 `telemetry|analytics|sentry|posthog`，`app/` 與 `config/` 沒有結果；未發現回傳使用者資料給作者的程式碼。會對外連線的有：商品網站、exchangerate-api.com、GitHub（社群商店）、你設定的通知服務。
- **我讀程式碼時發現的坑**（都是靜態閱讀，未實際執行驗證）：
  1. **Costco Taiwan 的幣別被設成 USD**（[StoreSeeder.php#L372-L378](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/database/seeders/StoreSeeder.php#L372-L378)），對台灣使用者會讓價格換算錯誤，要手動改成 TWD。
  2. **匯率欄位是 `unsignedInteger`**（[create_currencies_table](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/database/migrations/2025_05_29_115221_create_currencies_table.php)），而 API 回傳的是小數（例如 EUR 約 0.9）。若用 MySQL，小數會被捨入成整數；SQLite 因型別親和性可能保留小數（未實測）。匯率若變成 0，`NotificationService` 第 34 行的除法會出錯，該則通知被 try/catch 吞掉。
  3. 通知設定裡的 **`is_shipping_included`（含運費）與商品的 `max_notifications_daily`（每日通知上限）有欄位、有表單，但 `NotificationService` 沒有用到**（用 grep 在 `app/` 搜尋確認），等於沒作用。
  4. Amazon 被判定為機器人時，本來要改抓「其他賣家」網址，但程式呼叫 `prepare_url($this->link)` 時**沒傳 `alternative` 參數**，實際仍是原網址（[Amazon.php#L184-L214](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/Stores/Amazon.php#L184-L214)）。
  5. `UserOwnedScope` 用 `Auth::user()->role === 'admin'` 比對字串，但 `User` 模型把 `role` cast 成 `RoleEnum`，比對可能永遠不成立（管理員也只看到自己的資料）；`LinkScope` 則正確用 enum 比對。
  6. 排程每次都 `DB::table('jobs')->truncate()`（[routes/console.php#L19](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/routes/console.php#L19)），如果有別的佇列工作也放在同一張表會被清掉。
  7. Smart Setup 會把抓到的 HTML 存成工作目錄下的 `custom.html`（[NewStoreSmartSetupAction.php#L63](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Http/Controllers/Actions/NewStoreSmartSetupAction.php#L63)），像是除錯殘留。
  8. 金額以「×1000 的 unsigned int」儲存，上限約 4,294,967 元（單位依商店幣別），台幣一般商品夠用，但高單價品項（例如 500 萬以上的設備）會溢位。
  9. `/api/sanctum/token` 是帳密換 token 的端點，我沒有在 `routes/api.php` 看到限流中介層；`bootstrap/app.php` 是否有全域限流未確認。若對外公開，建議前面加反向代理限流。

## 10. 跟其他專案組合的建議

- **最佳定位：「價格情報來源」**。用它（或依它思路重寫的 JS 版）負責抓價＋歷史＋通知，再把結果送進你的倉儲系統或網頁版試算表：
  - **＋網頁版 Excel（例如 Univer、Luckysheet／FortuneSheet、x-spreadsheet 這類專案）**：把 `link_histories` 匯出成「商品 × 日期」的價格矩陣，在試算表裡做競品價格表、設條件格式（低於我方售價就標紅）。本專案沒有匯出功能，要自己寫一支讀 SQLite 或打 API 的小腳本。
  - **＋ERP／進銷存專案（例如 ERPNext、Odoo、InvenTree 這類）**：本專案沒有進價、成本、庫存；可把「供應商網頁價格」當成參考進價寫進 ERP 的供應商報價單。
  - **＋你的 Firebase 倉儲系統**：建議路線是**不要直接架 Laravel**，而是請 Claude Code 參考第 6 節的元件，在 Cloud Functions（排程）裡用 Node 重做：SchemaParser → 價格正規化 → 每日最低價寫 Firestore → 條件判斷 → 推播。若要省事先用原專案，就用 Docker 架在 NAS，再讓 Firebase 端定時讀它的 RSS feed。
- 台灣電商（蝦皮、momo、PChome、Yahoo 購物）都不在內建清單，需要用「自訂商店」設定；有 JSON-LD 的頁面最容易，蝦皮這類重度 JS／反爬網站可能要 Chromium 模式而且不保證成功（未實測）。

## 11. 價格相關功能檢查表

- **商品與價格資料模型**：**部分有**。
  - 品項：有 `products`（使用者自己的商品）與 `links`（某商店的某網址），多對多關聯（[create_links_table](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/database/migrations/2025_08_28_052633_create_links_table.php)：price、used_price、highest_price、lowest_price、shipping_price、seller、condition、is_official、is_in_stock）。
  - 多單位：**沒有**（無單位／換算欄位）。
  - 多幣別／匯率：**有**。`currencies` 表＋每日 exchangerate-api 更新，商店綁幣別、使用者可設偏好幣別，通知時換算（[NotificationService.php#L34-L38](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/NotificationService.php#L34-L38)）。但有第 9 節第 2 點的整數匯率疑慮。
  - 價目表、客戶別價格：**沒有**（這是追蹤別人價格的工具，不是自己的報價系統）。
- **進價：多家供應商報價、比價、RFQ、採購單**：**部分有（只有比價）**。一個商品可掛多家商店連結並排比較、看歷史圖（[PriceHistoryService.php#L12-L33](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/PriceHistoryService.php#L12-L33)）；**沒有** RFQ、詢價單、採購單。
- **成本：庫存估值、到岸成本、毛利與定價**：**沒有**。唯一相關的是通知設定的「額外費用金額＋額外費用%」，在判斷目標價時把價格加上去（[NotificationService.php#L65-L69](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/NotificationService.php#L65-L69)），可以粗略模擬「加上運費／關稅後是否划算」，但不是到岸成本分攤。沒有 FIFO／移動平均、沒有毛利計算。
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知**：**有，這是核心**。27 個內建商店類別＋自訂商店（[CustomStoreTemplate.php](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/CustomStoreTemplate.php)）；每日最低價歷史（[StoreTemplate.php#L219-L235](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Classes/StoreTemplate.php#L219-L235)）；通知條件含目標價、跌幅%、X 天最低、任何變動、有貨（[NotificationService.php#L42-L74](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/app/Services/NotificationService.php#L42-L74)）；另有「缺貨 X 天自動移除連結」排程（`app/Console/Commands/DeleteLinksFromProductsThatAreOutOfStockForXDaysCommand.php`）。
- **庫存／倉儲（入庫、出庫、盤點）與 Firebase 串接**：**沒有**庫存模組（`is_in_stock` 指的是「對方商店有沒有貨」）。串接方式：Sanctum REST API（但多數端點未實作，見第 8 節）、RSS feed `/feed`、ntfy／Apprise 推播；沒有 Webhook、沒有 CSV／Excel 匯入匯出。
- **台灣在地化**：
  - 繁中介面：**沒有**。`lang/` 下只有第三方套件的翻譯（`lang/vendor/authentication-log`、`lang/vendor/filament-log-viewer`），專案自己的字串是寫死的英文；`.env.example` 預設 `APP_LOCALE=en`。Filament 框架本身的按鈕可能有 zh_TW 翻譯，但未確認。
  - 新台幣：**有幣別**，`CurrencySeeder` 含 `TWD`／`NT$`（[CurrencySeeder.php](https://github.com/Cybrarist/Discount-Bandit/blob/7a58522f431ff22e772cbe76274bb8fe79590770/database/seeders/CurrencySeeder.php)）；但 Costco Taiwan 被綁成 USD（第 9 節第 1 點）。
  - 台灣稅制／電子發票：**沒有**。
  - 台灣電商內建爬蟲：只有 Costco Taiwan（costco.com.tw），沒有蝦皮、momo、PChome。

## 關鍵字
Discount Bandit、價格追蹤、降價通知、比價、競品價格監控、補貨通知、價格歷史、爬蟲、網頁抓價、自訂商店、CSS selector、schema.org、JSON-LD、無頭瀏覽器、Chromium、chrome-php、Amazon、AliExpress、eBay、Costco Taiwan、多使用者、自架、Docker、Laravel、Filament、PHP 8.4、SQLite、ntfy、Telegram、Gotify、Apprise、RSS、匯率、多幣別、price tracker、price drop alert、web scraping、self-hosted、未明確授權
