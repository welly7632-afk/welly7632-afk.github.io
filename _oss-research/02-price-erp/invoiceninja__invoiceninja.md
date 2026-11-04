# invoiceninja/invoiceninja — 老牌 Laravel 報價單／發票／採購單／簡易庫存系統（含完整 REST API）
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：15ea35e
> GitHub：https://github.com/invoiceninja/invoiceninja｜⭐ 10487｜授權：Elastic License 2.0（ELv2，source-available，非 OSI 開源）｜主要語言：PHP｜最近更新：2026-11-02

> 掃描範圍說明：主程式庫只做 sparse checkout（`app/`、`routes/`、`config/`、`database/migrations/`、`composer.json`、`README.md`、`LICENSE`、`lang/zh_TW/`、`openapi/`、`.github/`）。管理後台前端在另一個 repo `invoiceninja/ui`（React），只讀了檔案清單與 1–2 個檔案，commit `34098c4`。所有數字都是我自己用 `find`／`grep -c`／`wc -l` 數出來的，數法寫在旁邊。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：從 2013 年做到現在的「接案／小公司開單系統」，後端 Laravel 12（PHP 8.2+），功能是 **客戶、商品、報價單（Quote）→ 發票（Invoice）→ 收款、供應商、採購單（Purchase Order）、費用、專案工時、簡易庫存＋低庫存通知、報表**，另有給客戶看的 Client Portal、給供應商看的 Vendor Portal，以及 iOS／Android／桌面 App。

**對你（台灣小老闆、自建 Firebase 倉儲、投廣告）實際能用的地方：**

1. **直接自架當「報價單＋出貨單＋採購單」工具**：它的報價單轉發票、發票扣庫存、採購單收貨加庫存、採購單轉費用（成本）這條鏈是完整的，個人用夠了。
2. **抄它的「金額計算引擎」**：`InvoiceItemSum`／`InvoiceSum` 這組類別處理「單價×數量 → 行折扣（%或金額）→ 三層稅 → 含稅／未稅價 → 小計／總計／四捨五入精度」，是寫報價單最容易出錯的部分。翻成 JavaScript 放進你的 Firebase 系統很划算。
3. **抄它的「資料模型」**：商品（product_key／cost 進價／price 售價／in_stock_quantity 庫存／低庫存門檻）＋ 單據明細 `InvoiceItem`（含 `product_cost` 欄位，用來算毛利）。
4. **當成你倉儲系統的「下游開單模組」**：它有 174 條 OpenAPI 路徑（`grep -c "^  /api/v1" openapi/api-docs.yaml`）和 65 種 Webhook 事件，你的 Firebase 系統可以用 `X-API-TOKEN` 呼叫它建商品、開報價單；它在商品／採購單變動時 POST 回你的 Cloud Function。
5. **跟「網頁版 Excel」的關係**：它**不是**試算表。最接近的是 React 前端裡的「單據明細表格」（可拖曳排序的可編輯表格）＋後端 CSV／XLSX 匯出匯入。要做 Excel 式編輯，得另外找試算表元件。

**不適合的地方**：沒有比價、沒有抓網頁價格、沒有多供應商報價、沒有 FIFO／平均成本、沒有台灣電子發票（只支援歐洲的 Peppol／ZUGFeRD／FatturaPA／Verifactu 等）。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權是 Elastic License 2.0（ELv2）**（[LICENSE](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/LICENSE)；`composer.json` 寫 `"license": "Elastic License"`；GitHub 偵測成 NOASSERTION 是因為 ELv2 不在 SPDX 常見清單裡）。它是「原始碼公開」（source-available），**不是** OSI 定義的開源。
- **個人使用**：可以自架、可以改、可以複製程式碼。沒問題。
- **公司內部商用**（自己公司拿來開單、記帳）：**可以**，ELv2 不限制內部商用，也不用付費。
- **三條紅線**：
  1. **不能把它（或它的大部分功能）當成託管服務／SaaS 提供給第三方**。例如你做一個「開發票雲端服務」讓別的店家註冊使用 → 違約。
  2. **不能移除、停用或繞過 license key 功能**。這裡指的是白牌（white label）：README 第 18 行寫明「所有 Pro／Enterprise 功能都在原始碼裡，另有每年 40 美元白牌授權，移除客戶端畫面的 Invoice Ninja 品牌」（[README.md#L18](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/README.md#L18)）。你**不可以**自己改程式拿掉 "Created by Invoice Ninja"。
  3. 修改後再散布要保留版權聲明，並標註「已修改」。
- **付費版才有的功能**：自架版幾乎全開。我讀了 `Account::hasFeature()`（[app/Models/Account.php#L250-L290](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Models/Account.php#L250-L290)）：報表、API、自訂設計、Email 範本等在 `$self_host` 時都回傳 `true`；只有 `FEATURE_WHITE_LABEL`／`FEATURE_REMOVE_CREATED_BY` 註解寫明「自架也需要方案」。
- **「拆程式碼」到你的工具**：ELv2 允許製作衍生作品，但衍生作品同樣受上面三條限制。**只自己公司內部用 → OK；以後要做成 SaaS 賣給別人 → 不要直接複製它的程式碼**，改成「看懂邏輯、用 Claude 重寫」比較安全（計算公式本身不受著作權保護，但逐行翻譯有爭議風險）。
- 前端 `invoiceninja/ui` 也是 ELv2（我看了該 repo 的 LICENSE 開頭）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容（來源） |
|---|---|
| 後端 | PHP `^8.2`～`^8.5`、Laravel `^12`、Livewire 3（Client Portal 用）、Laravel Octane、Fractal（API 輸出轉換）、Twig（PDF 範本）（[composer.json](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/composer.json)） |
| 管理後台前端 | 另一個 repo `invoiceninja/ui`：React 18 ＋ Vite ＋ TypeScript ＋ Tailwind ＋ jotai。CI 會 clone 它再打包進 `public/`（`.github/workflows/react_release.yml` 第 78 行 `git clone .../invoiceninja/ui.git`） |
| 資料庫 | MySQL／MariaDB（`phpunit.yml` CI 用 mysql）；選用 Redis（predis）、Elasticsearch（`elastic/`、`laravel/scout` 做全文搜尋） |
| PDF | 預設 `snappdf`（無頭 Chromium），可改 Gotenberg 或官方託管 PDF 服務（[app/Services/Pdf/PdfService.php#L350-L360](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/Pdf/PdfService.php#L350-L360)） |
| 部署 | Docker 映像、一般 VPS、Cloudron、Softaculous、YunoHost 等（README） |
| 硬體 | 不需 GPU。一般 2 vCPU／2–4GB RAM 的 VPS 應可跑（官方未在讀到的檔案中寫明，屬經驗值，**未確認**）；Chromium 產 PDF 較吃記憶體 |
| 選用 API Key | `OPENEXCHANGE_APP_ID`（openexchangerates.org 匯率，有免費方案）；`MINDEE_API_KEY`（收據／發票 OCR，[config/services.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/config/services.php) 第 61–66 行，預設每日 100、每月 250 次上限）；金流（Stripe、PayPal 等 24 個金流驅動資料夾，`ls app/PaymentDrivers` 數目錄）；寄信（Postmark／Mailgun／Brevo／SMTP） |
| 費用 | 軟體本身免費；VPS 約每月 5–20 美元；白牌每年 40 美元（選用）；OCR、匯率依各家方案 |

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

數量來源：`find app -name '*.php' | wc -l` = **2559** 個 PHP 檔；`find app/Http/Controllers -name '*Controller.php' | wc -l` = **175** 個 Controller；`ls database/migrations | wc -l` = **317** 支 migration；`routes/api.php` 裡 `Route::` 出現 **319** 次、其中 `Route::resource` **34** 個。

```
invoiceninja/ (v5-stable, VERSION.txt = 5.13.49)
├── app/
│   ├── Models/            77 個檔案：Product、Invoice、Quote、PurchaseOrder、Vendor、Expense、Currency、Webhook…
│   ├── Helpers/Invoice/   ★ 金額計算引擎：InvoiceItemSum(580 行)、InvoiceSum(487 行)、含稅版 *Inclusive、ProRata
│   ├── DataMapper/        JSON 欄位結構：InvoiceItem（單據明細）、CompanySettings、Tax/<國家>/Rule（自動稅率）
│   ├── Services/          領域服務：Invoice/、Quote/（ConvertQuote 報價轉發票）、PurchaseOrder/（收貨入庫、轉費用）
│   │                      Pdf/、Template/（Twig 範本）、EDocument/（歐洲電子發票＋Mindee OCR）、Report/、Quickbooks/
│   ├── Jobs/              佇列工作：Inventory/AdjustProductInventory（扣庫存）、Util/UpdateExchangeRates（匯率）、
│   │                      Util/WebhookSingle（送 Webhook）、Util/VersionCheck
│   ├── Http/Controllers/  175 個 Controller（API＋Client/Vendor Portal）；Requests/ 驗證；Middleware/TokenAuth
│   ├── Transformers/      API 輸出（Fractal），例如 ProductTransformer
│   ├── Import/            CSV 與競品匯入：Csv、Freshbooks、Invoice2Go、Invoicely、Wave、Zoho、QBBackup
│   ├── Export/CSV/        21 個匯出類別（ProductSalesExport 含毛利）
│   ├── Filters/           API 查詢參數（ProductFilters 可用 product_key 篩選）
│   ├── PaymentDrivers/    24 個金流驅動資料夾
│   └── Livewire/          Client Portal／Billing Portal 畫面
├── routes/                api.php(568 行)、client.php、vendor.php、web.php…
├── config/ninja.php       主要設定（Sentry DSN、匯率 Key、PDF 產生器、license_key）
├── database/migrations/   317 支資料表遷移
├── lang/zh_TW/texts.php   繁中翻譯（6523 行）
└── openapi/api-docs.yaml  OpenAPI 規格（174 條 /api/v1 路徑）
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**(1) 商品資料模型**
→ [app/Models/Product.php#L78-L112](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Models/Product.php#L78-L112)
→ 原始資料表 [database/migrations/2014_10_13_000000_create_users_table.php#L896-L929](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/database/migrations/2014_10_13_000000_create_users_table.php#L896-L929)
- 欄位：`product_key`（品號）、`notes`（品名描述）、`cost`（進價）、`price`（售價）、`quantity`（預設數量）、三組 `tax_name/tax_rate`、`custom_value1~4`、`vendor_id`（**只能掛一個供應商**）、`in_stock_quantity`、`stock_notification_threshold`、`max_quantity`、`product_image`。
- 金額欄位 `decimal(16,4)`。商品類型常數 1~10（實體、服務、數位、運費、免稅…），主要給歐洲電子發票稅別對照用。

**(2) 單據明細＋金額計算（報價單／發票／採購單共用）**
→ 明細結構 [app/DataMapper/InvoiceItem.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/DataMapper/InvoiceItem.php)：`quantity`、`cost`（**注意：在明細裡 `cost` 是「單價」**）、`product_cost`（進價，算毛利用）、`discount`／`is_amount_discount`、`tax_rate1~3`、`line_total`、`gross_line_total`、`type_id`（1 商品、2 服務、5 滯納金、6 費用…）、`unit_code`（預設 `C62`）。
→ 計算流程 [app/Helpers/Invoice/InvoiceItemSum.php#L174-L266](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Helpers/Invoice/InvoiceItemSum.php#L174-L266)：每一行 `cleanLineItem → sumLineItem(單價×數量) → setDiscount(百分比或金額) → calcTaxes → push(依幣別 precision 四捨五入後累加小計)`。
→ 自動稅率：`shouldCalculateTax()`（同檔 L199-L228）依公司國別載入 `App\DataMapper\Tax\<國碼>\Rule`；`ls app/DataMapper/Tax` 有 AD、AT、AU、DE、GB、US、SG 等約 30 個國家，**沒有 TW**，所以台灣只能手動設 5% 稅率。
→ 單據總計 [app/Helpers/Invoice/InvoiceSum.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Helpers/Invoice/InvoiceSum.php)：`build()` 依序算明細、整張折扣、自訂附加費、稅、餘額、部分付款；`roundRappen()` 是瑞士 0.05 進位。

**(3) 報價單 → 發票（並扣庫存）**
→ [app/Services/Quote/ConvertQuote.php#L44-L83](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/Quote/ConvertQuote.php#L44-L83)：複製報價單 → 建立發票 → `->adjustInventory()` → 報價單狀態改 `STATUS_CONVERTED` → 複製附件。

**(4) 庫存扣減與低庫存通知**
→ [app/Services/Invoice/InvoiceService.php#L686-L693](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/Invoice/InvoiceService.php#L686-L693)：公司有開 `track_inventory` 才扣。
→ [app/Jobs/Inventory/AdjustProductInventory.php#L112-L176](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Jobs/Inventory/AdjustProductInventory.php#L112-L176)：用 `product_key` 找商品，`in_stock_quantity -= 數量`；編輯發票時先把舊明細加回（`existingInventoryAdjustment`）；低於商品門檻或公司門檻就寄信給使用者。刪除／還原發票有對應的加回／扣回。

**(5) 採購單：收貨入庫、轉費用**
→ 動作入口 [app/Http/Controllers/PurchaseOrderController.php#L662-L735](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Http/Controllers/PurchaseOrderController.php#L662-L735)（`add_to_inventory`、`expense`、`mark_sent`、`cancel`…）
→ 入庫 [app/Services/PurchaseOrder/PurchaseOrderInventory.php#L22-L53](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/PurchaseOrder/PurchaseOrderInventory.php#L22-L53)：找不到商品就自動建立；`in_stock_quantity += 數量`；狀態改 `STATUS_RECEIVED`。**不會更新商品進價，也沒有平均成本計算。**
→ 轉費用 [app/Services/PurchaseOrder/PurchaseOrderExpense.php#L30-L75](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/PurchaseOrder/PurchaseOrderExpense.php#L30-L75)：把採購單金額（扣稅或含稅）變成一筆 Expense，幣別取供應商幣別。
→ 從發票反向開採購單 [app/Factory/CloneInvoiceToPurchaseOrderFactory.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Factory/CloneInvoiceToPurchaseOrderFactory.php)：把明細單價換成 `product_cost`（進價）——「客人下單 → 一鍵向供應商叫貨」。

**(6) 毛利報表**
→ [app/Export/CSV/ProductSalesExport.php#L233-L278](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Export/CSV/ProductSalesExport.php#L233-L278)：每行算 `markup`（加成率％）、`net_total`、`profit = price − discount − cost`，並乘以發票匯率。欄位命名有點繞（程式裡 `price` 由 `product_cost × exchange_rate` 而來），拆出來用前要對照實際報表結果驗證。
→ 損益表 [app/Services/Report/ProfitLoss.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/Report/ProfitLoss.php)：收入（依發票或依收款）對比費用分類。

**(7) 匯率**
→ [app/Jobs/Util/UpdateExchangeRates.php#L39-L89](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Jobs/Util/UpdateExchangeRates.php#L39-L89)：從 openexchangerates.org 抓「1 美元兌各幣」，寫入 `currencies.exchange_rate`。
→ [app/Libraries/Currency/Conversion/CurrencyApi.php#L20-L68](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Libraries/Currency/Conversion/CurrencyApi.php#L20-L68)：A 幣 → 美元 → B 幣的換算，只有「最新匯率」，沒有歷史匯率表。

**(8) Webhook**
→ 事件常數 [app/Models/Webhook.php#L150-L168](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Models/Webhook.php#L150-L168)（商品 50–54、採購單 55–59）；全部 65 個 `EVENT_` 常數（`grep -c 'const EVENT_'`）。
→ 發送 [app/Jobs/Util/WebhookSingle.php#L87-L140](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Jobs/Util/WebhookSingle.php#L87-L140)：用該實體的 Transformer 轉成 JSON，以設定的 HTTP 方法送到 `target_url`，可加自訂 headers，10 秒連線／30 秒逾時，有退避重試。**沒有看到 HMAC 簽章**，驗證要靠自訂 header 帶密鑰。

**(9) PDF／範本**：`app/Services/Pdf/`（PdfBuilder、JsonDesignService）＋`app/Services/Template/TemplateService.php`（Twig）。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 明細金額計算（折扣／多稅率／精度） | [InvoiceItemSum.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Helpers/Invoice/InvoiceItemSum.php)、[InvoiceSum.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Helpers/Invoice/InvoiceSum.php) | Laravel Collection、Eloquent 模型、Tax Rule | 中 | 讓 Claude 改寫成純 JS 函式 `calcLines(items, {precision, inclusive})`，放進你的 Firebase 前端與 Cloud Function 共用；含稅版另看 `InvoiceItemSumInclusive.php` |
| 單據明細 JSON 結構 | [app/DataMapper/InvoiceItem.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/DataMapper/InvoiceItem.php) | 無 | 低 | 直接照抄欄位當 Firestore 文件裡的 `lineItems[]` 結構（記得加 `product_cost` 才算得出毛利） |
| 發票扣庫存／編輯回補邏輯 | [AdjustProductInventory.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Jobs/Inventory/AdjustProductInventory.php) | Eloquent、Mailer | 低 | 改寫成 Firestore transaction（它本身沒有鎖，改寫時正好用 transaction 補強） |
| 採購單收貨入庫 | [PurchaseOrderInventory.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/PurchaseOrder/PurchaseOrderInventory.php) | Eloquent | 低 | 同上；建議自行加上「移動平均成本」更新 |
| 毛利／加成率計算 | [ProductSalesExport.php#L262-L278](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Export/CSV/ProductSalesExport.php#L262-L278) | 無 | 低 | 抄公式 `markup = (售價 − 折扣 − 成本) / 成本 × 100`，放進你的廣告 ROAS／定價試算 |
| 匯率換算 | [CurrencyApi.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Libraries/Currency/Conversion/CurrencyApi.php)、[UpdateExchangeRates.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Jobs/Util/UpdateExchangeRates.php) | openexchangerates API Key | 低 | 寫一支排程 Cloud Function 每天抓一次存到 Firestore，進口商品（人民幣／美元）換算台幣成本 |
| Webhook 發送器 | [WebhookSingle.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Jobs/Util/WebhookSingle.php) | Guzzle、Laravel Queue | 中 | 參考「事件編號＋自訂 header＋重試退避」的設計，給你自己的系統對外通知用 |
| 商品 CSV 匯入欄位對照 | [app/Import/Definitions/ProductMap.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Import/Definitions/ProductMap.php) | 無 | 低 | 21 個可匯入欄位的清單，可當你倉儲系統匯入格式的參考 |
| 可拖曳排序的明細表格（前端） | [invoiceninja/ui: ProductsTable.tsx](https://github.com/invoiceninja/ui/blob/34098c42ebc6acbcae3b35b314067d0429a51600/src/pages/invoices/common/components/ProductsTable.tsx) | React、`@hello-pangea/dnd`、jotai、專案內部元件 | 中 | 213 行，只看了 import 與結構；若你要在純 JS 頁面做明細編輯，可參考它的「拖曳排序＋欄位寬度」做法，但完整 Excel 式體驗請搭配試算表專案 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **沒有任何 LLM 整合**。我在 `app/`、`config/`、`routes/` 用 `grep -rniE '\b(openai|anthropic|claude)\b'` 搜尋，除了 XSD／XSLT 驗證檔與網域黑名單資料外沒有命中；也沒有 prompt 檔、MCP、Skills。
- 唯一的「AI 類」功能是 **Mindee OCR**：上傳收據／發票圖片或 PDF 自動變成一筆費用（[app/Services/EDocument/Imports/MindeeEDocument.php#L52-L57](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/EDocument/Imports/MindeeEDocument.php#L52-L57)、[ParseEDocument.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/EDocument/Imports/ParseEDocument.php) 第 72–78 行依副檔名分派）。
- **能不能換成 Claude**：可以。把 `MindeeEDocument::run()` 換成「送圖片給 Claude 的 vision，要求回傳 JSON（供應商、日期、金額、稅額、明細）」即可，介面只要回傳一個 `Expense`。對你更實用的做法是：在你自己的 Firebase 系統做「拍進貨單 → Claude 解析 → 呼叫 Invoice Ninja API 建採購單／費用」。
- 開發依賴有 `laravel/boost`（require-dev），那是 Laravel 給 AI 寫程式助手用的工具包，不是產品功能。

## 8. 擴充方式與 API

- **REST API**：`/api/v1/*`，認證用 header `X-API-TOKEN`（[app/Http/Middleware/TokenAuth.php#L33-L44](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Http/Middleware/TokenAuth.php#L33-L44)）。商品 CRUD＋`products/bulk`（[routes/api.php#L350-L352](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/routes/api.php#L350-L352)），採購單 CRUD＋`purchase_orders/{id}/{action}`（[routes/api.php#L358-L363](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/routes/api.php#L358-L363)），Webhook 管理（[routes/api.php#L490-L492](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/routes/api.php#L490-L492)），報表 `reports/*`（每分鐘限 20 次）。
- **查詢**：`ProductFilters` 支援 `filter`（關鍵字）、`product_key`、`sort`（[app/Filters/ProductFilters.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Filters/ProductFilters.php)）。
- **API 回傳的商品欄位**：見 [app/Transformers/ProductTransformer.php#L68-L101](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Transformers/ProductTransformer.php#L68-L101)（含 `in_stock_quantity`、`cost`、`price`、`tags`）。
- **OpenAPI 規格**：[openapi/api-docs.yaml](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/openapi/api-docs.yaml)，可直接丟給 Claude Code 生成 JS 呼叫程式。
- **匯入／匯出**：CSV 匯入（含 Freshbooks、Wave、Zoho、Invoice2Go、Invoicely、QuickBooks 備份），`/api/v1/export` 全公司 JSON 匯出、21 個 CSV 報表類別，`CsvToXlsxConverter` 可轉 XLSX（用 phpspreadsheet）。
- **QuickBooks 雙向同步**：`app/Services/Quickbooks/`（商品同步會帶 `PurchaseCost`）。
- **模組**：用 `nwidart/laravel-modules`，`modules_statuses.json` 有 `Admin: true`、`Accounting: false`，但模組原始碼不在這個 repo（**未確認**內容）。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：非常活躍。最新 commit 2026-10-18（`git log -1`），GitHub 顯示最近 push 2026-11-02；`VERSION.txt` = 5.13.49。核心兩位作者從 2013 年維護至今。
- **測試**：`tests/` 共 860 個檔（從檔案清單數）：Feature 371、Unit 301、Integration 62、e2e 83；CI 在 PHP 8.2～8.5 × MySQL 跑 PHPUnit。另有 phpstan 設定。
- **遙測／隱私（重要）**：`config/ninja.php` 第 55 行 `sentry_dsn` **預設值就是官方的 Sentry 伺服器** `sentry2.invoicing.co`（[config/ninja.php#L55](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/config/ninja.php#L55)），也就是說自架時若沒在 `.env` 設 `SENTRY_LARAVEL_DSN=` 清空，錯誤報告會送到官方（`send_default_pii` 預設 false）。`VersionCheck` 會連 `pdf.invoicing.co` 查版本；`beacon` 預設關閉。
- **已知的坑**：
  1. `in_stock_quantity` 在資料表是 **integer**（[migration 2022_05_31_101504#L31](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/database/migrations/2022_05_31_101504_inventory_management_schema.php#L31)），小數數量（例如 0.5 公斤）會被截斷。
  2. 庫存以 `product_key` 字串比對，改品號會讓扣庫存失效；扣庫存是讀出來改完再存，沒有資料列鎖。
  3. 只有一個倉庫的概念，沒有多倉、沒有批號／效期、沒有盤點單。
  4. 明細欄位 `cost` 其實是「單價」、`product_cost` 才是進價，拆程式碼時很容易搞混。
  5. 台幣 TWD 的 `precision` 在種子資料是 2 位小數（`database/seeders/CurrenciesSeeder.php` 第 85 行，用 `git show` 讀取），台灣習慣整數，需要自己調整。
  6. 專案很大（約 4GB 歷史），Laravel 經驗不足的話自架升級要小心；README 建議用 tag 版本而非分支。

## 10. 跟其他專案組合的建議

- **你的 Firebase 倉儲系統（主）＋ Invoice Ninja（開單／對外單據）**：商品主檔與庫存留在你自己的系統；Invoice Ninja 只負責報價單、發票 PDF、收款、採購單寄給供應商。用 API 同步商品（`product_key` 當共同鍵），用 Webhook `EVENT_UPDATE_PURCHASE_ORDER`／`EVENT_CREATE_INVOICE` 回寫你的系統。記得關掉 Invoice Ninja 的 `track_inventory`，避免兩邊都扣庫存。
- **＋ 網頁版 Excel 專案（例如 01-web-excel 類別裡的試算表元件）**：用試算表元件做「大量報價／批次改價」畫面，再呼叫 `products/bulk` 或逐筆 `PUT /api/v1/products/{id}` 回寫。
- **＋ 價格追蹤專案（如 changedetection.io、PriceGhost、pricebuddy）**：那些負責抓競品價格，Invoice Ninja 沒有這塊；把抓到的價格寫進 `custom_value1~4` 或你自己的資料庫。
- **＋ 完整 ERP（如 ERPNext、InvenTree、aureuserp）**：若需要多倉、FIFO、多供應商價目表，那些比 Invoice Ninja 強；Invoice Ninja 的優勢是單據外觀、客戶入口與金流串接成熟。
- **＋ Claude**：用 Claude 做「進貨單拍照 OCR → 建採購單」、「依成本＋目標毛利自動算報價」，再透過 API 寫進 Invoice Ninja。

## 11. 價格相關功能檢查表

- **商品與價格資料模型**：**有（基本）**。單一 `cost`／`price`、三層稅率、自訂欄位 4 個（[Product.php#L89-L112](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Models/Product.php#L89-L112)）。多幣別／匯率：**有**（每個客戶／供應商有幣別，單據有 `exchange_rate`，[UpdateExchangeRates.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Jobs/Util/UpdateExchangeRates.php)）。多單位：**沒有**（明細只有 `unit_code` 預設 `C62`，主要給電子發票用，沒有換算）。價目表／客戶別價格／數量級距：**沒有**（`grep -rniE 'price_?list|tier_?price'` 在 app 內沒有相關結果）。
- **進價（供應商報價、比價、RFQ、採購單）**：採購單 **有**（[PurchaseOrderController.php#L662-L735](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Http/Controllers/PurchaseOrderController.php#L662-L735)，有供應商入口可接受採購單）；從發票／報價單一鍵轉採購單 **有**。多家供應商報價、比價、RFQ：**沒有**（商品只有一個 `vendor_id`）。
- **成本（FIFO／移動平均、到岸成本、毛利定價）**：FIFO／移動平均 **沒有**（收貨入庫不更新成本，[PurchaseOrderInventory.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Services/PurchaseOrder/PurchaseOrderInventory.php)）；到岸成本分攤 **沒有**（`grep -i landed` 無相關結果）；毛利／加成率 **有（報表層）**（[ProductSalesExport.php#L262-L278](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Export/CSV/ProductSalesExport.php#L262-L278)），沒有「依目標毛利自動定價」。
- **價格追蹤（抓網頁價格、價格歷史、降價通知）**：**沒有**。只有「低庫存通知」（[AdjustProductInventory.php#L131-L135](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Jobs/Inventory/AdjustProductInventory.php#L131-L135)），不是補貨或降價通知。
- **庫存／倉儲**：入庫（採購單收貨）**有**、出庫（發票扣庫存）**有**、盤點 **沒有**、多倉 **沒有**。與你的 Firebase 串接：**有 API**（`X-API-TOKEN`，174 條路徑）、**有 Webhook**（65 種事件，含商品與採購單）、**有 CSV 匯入匯出**（[ProductMap.php](https://github.com/invoiceninja/invoiceninja/blob/15ea35ea63f367eba33c04b7acd9ab1227853537/app/Import/Definitions/ProductMap.php) 21 欄）。
- **台灣在地化**：繁中介面 **有**——`lang/zh_TW/texts.php` 6411 個 key，對照英文 6447 個 key 只缺 36 個（我用自寫 Python 以正規表達式比對 `'key' => 'value'` 行數）；其中 277 個值和英文一模一樣（未翻譯）。不過這是後端語系（Client Portal、Email、PDF）；React 管理後台的繁中翻譯在 `invoiceninja/ui`，**未確認**完整度。新台幣 **有**（TWD、符號 `NT$`，precision 預設 2）。台灣稅制自動計算 **沒有**（`app/DataMapper/Tax/` 無 TW）。台灣電子發票（財政部 MIG／加值中心）**沒有**，`app/Services/EDocument/Standards/` 只有歐洲格式（Peppol、ZUGFeRD、FatturaPA、Facturae、Verifactu、羅馬尼亞、法國）。

## 關鍵字
Invoice Ninja、invoiceninja、報價單、發票、請款單、採購單、供應商入口、客戶入口、庫存扣減、低庫存通知、毛利報表、加成率、匯率換算、多幣別、新台幣、Webhook、REST API、X-API-TOKEN、OpenAPI、Laravel、PHP、React、Elastic License 2.0、ELv2、source-available、白牌授權、Mindee OCR、收據辨識、電子發票、Peppol、ZUGFeRD、QuickBooks 同步、CSV 匯入、XLSX 匯出、quote、invoice、purchase order、inventory、stock notification、profit margin、markup、exchange rate、self-hosted、Sentry 遙測
