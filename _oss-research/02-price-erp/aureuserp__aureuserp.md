# aureuserp/aureuserp — 用 Laravel＋Filament 重寫的「輕量版 Odoo」開源 ERP
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：9b076df
> GitHub：https://github.com/aureuserp/aureuserp｜⭐ 12166｜授權：MIT｜主要語言：PHP｜最近更新：2026-11-04

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Webkul 公司做的全功能 ERP，後端 Laravel 13、後台 UI 用 FilamentPHP 5（Livewire），資料模型和流程幾乎是把 Odoo 的商品／價目表／採購／庫存／會計邏輯「翻譯成 PHP」，模組化成 30 個外掛（plugin）。

**對你（台灣小老闆、自建 Firebase 倉儲系統、投廣告）實際能做的事：**

1. **拿來當「定價引擎」的參考答案**：`PriceListResolver` 這支 334 行的 PHP 檔，完整實作了「價目表規則」：依數量級距、商品分類、單一商品／變體、有效期間，做「固定價／打折％／公式（折扣＋四捨五入到整數位＋加價＋最低／最高毛利）」。你自己的倉儲系統若要做「批發價、VIP 價、檔期價、成本加成定價」，直接請 Claude Code 把這支翻成 JavaScript 放進 Firebase Cloud Functions 最划算。
2. **供應商報價表（Vendor Price List）＋多級距進價**：每個商品可以掛多家供應商，各自有最低訂購量、單價、折扣、幣別、有效期間、交期天數 → 採購單會自動帶入價格。這套資料表設計可以直接抄。
3. **單機試跑一套完整 ERP**：如果你想先「體驗」完整的進銷存＋會計流程長什麼樣子（詢價單 RFQ → 採購單 → 入庫 → 帳單 → 付款），可以在自己電腦用 SQLite／MySQL 架起來玩，看 UI 流程再決定自己的系統要做到哪。
4. **REST API 做雙向同步**：products、inventories、purchases、sales、partners、accounts 等 10 個外掛有 `/admin/api/v1/...` 的 Sanctum Token API，理論上可以讓你的 Firebase 系統呼叫它同步商品、庫存數量。
5. **不適合**：它**沒有**抓網頁價格、沒有價格歷史曲線、沒有降價通知、**沒有繁體中文介面**、**沒有台灣電子發票**、**沒有 FIFO／移動平均庫存估值**、**沒有到岸成本分攤**。這些要從別的專案（例如 changedetection.io、PriceBuddy、ERPNext、Odoo）補。

## 2. 授權白話

- **授權**：MIT（`LICENSE` 檔與 `composer.json` 的 `"license": "MIT"` 一致；版權人寫 Webkul Software）。
  - 檔案：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/LICENSE
- **個人使用**：完全沒問題，可自由修改、自架。
- **公司商用**：MIT 是最寬鬆的授權之一，可以商用、可以閉源改作、可以拿片段程式碼放進你自己的產品，**唯一義務是保留原版權聲明與授權文字**（例如你把 `PriceListResolver` 翻成 JS，就在檔頭註明「改寫自 AureusERP，MIT License, Copyright Webkul」）。
- **注意依賴的授權**：Laravel、Filament、Livewire 都是 MIT；`composer.json` 裡的 `khaled.alshamaa/ar-php`、`maatwebsite/excel` 等第三方套件我沒有逐一確認授權（未確認），若要整包商業散佈請另外檢查。
- **閉源／付費版功能**：程式碼本身沒有看到「企業版才解鎖」的開關。README 有推銷官方的「AureusERP Cloud Hosting」付費代管服務，但那是服務不是功能閹割。另有 Webkul 生態系其他付費擴充（未確認，本 repo 內看不到）。

## 3. 技術棧與執行需求

| 項目 | 內容（依 `composer.json`／`package.json`／README） |
|---|---|
| 後端 | PHP ^8.3、Laravel ^13.0、Livewire ^4.0、FilamentPHP ^5.0、Sanctum（API Token）、Spatie Query Builder、Filament Shield（角色權限） |
| 前端 | Filament 後台（Blade＋Livewire＋Alpine）、TailwindCSS 4、Vite；POS 收銀機正在改寫成 Vue 3（`docs/superpowers/plans/2026-10-09-pos-fully-vuejs.md`） |
| 資料庫 | README 寫 MySQL 8.0+／MariaDB 10.6+／PostgreSQL 16+；`.env.example` 預設 `DB_CONNECTION=mysql`；`composer.json` 的 post-create 腳本會建 `database/database.sqlite`（SQLite 是否完整支援：未確認）。CI（`.github/workflows/pest_tests.yml`）用 MySQL 8 和 Postgres 16 兩種跑測試 |
| 其他套件 | `barryvdh/laravel-dompdf`（PDF 報價單／採購單）、`maatwebsite/excel`（會計報表匯出 Excel）、`milon/barcode`（條碼）、`knuckleswtf/scribe`（自動產生 API 文件，網址 `/api/docs`）、`nativephp/mobile`＋`aureuserp/nativephp-remote`（包成手機 App 殼） |
| 部署 | `php artisan erp:install` 一鍵安裝（遷移資料庫、種子資料、建角色權限、建管理員）；或 `docker-compose.yml`（Laravel Sail：app＋MySQL＋Redis＋Mailpit）；`docker/production/` 有 Nginx＋PHP-FPM＋supervisord 的正式環境 Dockerfile |
| 硬體／GPU | 不需要 GPU。一般 2 vCPU／2–4 GB RAM 的 VPS 應可跑（官方未給數字，屬推估）。**不能跑在 Firebase Hosting 上**（需要 PHP 伺服器＋關聯式資料庫） |
| API Key／費用 | 核心功能**不需要任何付費 API Key**。選用：寄信要 SMTP；SMS 用 Msg91（印度簡訊商）；網站外掛會從 db-ip.com 下載免費 IP 國別資料。沒有 AI API 費用 |

## 4. 程式架構地圖

檔案數用 `git ls-tree -r --name-only HEAD` 列出後以 `grep -c` 計算：全 repo 11,626 個檔案、11,161 個 `.php`、456 個 migration、310 個測試 PHP 檔；`plugins/webkul/` 下 30 個外掛。

```
aureuserp/
├── app/                      # 很薄：User model、三個 Filament Panel（Admin／Customer／POS）
│   └── Providers/Filament/   # AdminPanelProvider.php 等，決定後台掛哪些外掛
├── config/                   # Laravel 設定；scribe.php（API 文件）、nativephp-remote.php
├── routes/api.php            # 幾乎是空的，API 路由都在各外掛自己的 routes/api.php
├── docker/production/        # 正式環境 Dockerfile、nginx.conf、php.ini
├── tests/e2e-pw/             # Playwright 端對端測試（TypeScript）
├── plugins/webkul/           # ★ 真正的程式碼都在這裡，每個資料夾是一個 composer 套件
│   ├── support/              # 共用核心：Currency、CurrencyRate、UOM、Company、helpers、Repeater 表格元件
│   ├── security/             # 使用者、角色、API 登入（AuthController）、currencies.json 幣別資料
│   ├── products/             # ★ 商品、變體、屬性、分類、包裝、價目表（PriceList/PriceRuleItem）、供應商報價（ProductSupplier）
│   ├── purchases/            # ★ 詢價單 RFQ、採購單、採購協議（Blanket Order）、供應商價目表 UI、帳單
│   ├── sales/                # ★ 報價單、銷售單、毛利計算、價格設定
│   ├── inventories/          # ★ 倉庫、儲位、路線、入庫／出庫／調撥／代發（Dropship）、批號、盤點、報廢、補貨點
│   ├── accounts/             # ★ 稅（TaxComputer、TaxFormulaEvaluator）、傳票、應收應付、付款、對帳
│   ├── accounting/           # 會計報表（損益、資產負債、總帳、帳齡），可匯出 Excel
│   ├── invoices/             # 發票介面（套 accounts 的模型）
│   ├── partners/ contacts/   # 客戶／供應商主檔（含預設價目表 price_list_id）
│   ├── point-of-sale/        # POS 收銀（970 個檔案，正改 Vue）
│   ├── manufacturing/        # BOM、工單
│   ├── crm/ website/ blogs/  # CRM、前台網站
│   ├── fields/               # 自訂欄位（不改程式就加欄位）
│   ├── table-views/          # 使用者儲存的表格篩選檢視
│   ├── chatter/              # 每筆紀錄的留言＋欄位變更紀錄（價格改動會被記下）
│   └── plugin-manager/       # erp:install 指令、外掛安裝、安裝回報（見第 9 節）
└── lang/                     # ar、en、es、fr、pt_BR（無中文）
```

## 5. 核心功能怎麼實作

以下 permalink 全部以 commit `9b076df06a902cce5a14866650547ed13ffa140a` 為準。

### 5.1 價目表引擎（最值得看）
- 位置：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/src/Services/PriceListResolver.php#L18-L334
- 實作重點：
  - `resolve()`（#L55-L73）：輸入「價目表、商品、數量、單位、幣別、日期、公司」，回傳 `ResolvedPrice`（最終價、命中規則、基準價）。
  - `compute()`（#L75-L119）：先找規則；找不到就用商品售價。找到就依 `PriceRuleType` 計算：`FIXED` 固定價、`PERCENTAGE` 打折、`FORMULA` 公式。
  - `applyFormula()`（#L121-L155）：**這段就是「成本加成定價」**：基準是成本（`STANDARD_PRICE`）時用 `price_markup` 加成，否則用 `price_discount` 折扣；再 `price_round` 四捨五入到指定位數（例如進位到 10 元）、加 `price_surcharge` 固定加價、再用 `price_min_margin`／`price_max_margin` 限制在基準價±金額範圍內。
  - `basePriceFor()`（#L157-L196）：規則的基準可以是「另一張價目表」，最多遞迴 5 層（`MAX_BASE_DEPTH`）並防循環。
  - `candidateRules()`＋`rulePrecedence()`（#L275-L301）：用 SQL 撈出有效期間內、符合商品／分類的規則，再依「變體 > 商品 > 分類 > 全域」、最低數量大者優先排序。
- 規則資料欄位：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/src/Models/PriceRuleItem.php#L26-L49 ；套用判斷 `isApplicableFor()`：同檔 #L177-L189。
- 列舉：`PriceRuleType`（percentage／formula／fixed）、`PriceRuleBase`（list_price／standard_price／price_rules）、`PriceRuleApplyTo`（variant／product／category／global），在 `plugins/webkul/products/src/Enums/`。

### 5.2 客戶別價格
- 客戶主檔加上預設價目表欄位：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/database/migrations/2026_09_15_000100_add_price_list_id_to_partners_partners_table.php
- 銷售報價單用 `PriceListResolver` 算單價：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/sales/src/Filament/Clusters/Orders/Resources/QuotationResource/Schemas/QuotationForm.php#L1278-L1295 （註解寫明「銷售價只看售價＋價目表，供應商價格屬於採購」）。

### 5.3 供應商報價／進價
- 資料表欄位（供應商、最低量、價格、折扣後價格、幣別、有效期、交期 `delay`、供應商料號）：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/src/Models/ProductSupplier.php#L28-L45
- 挑選供應商價格：`Product::getSeller()`／`getFilteredSellers()`／`prepareSellers()`：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/src/Models/Product.php#L319-L442 。依日期、單位換算後的數量、最低訂購量過濾；**注意**：#L352-L356 只保留「排序第一的那家供應商」的各級距，再挑最便宜那筆 → 這是「指定主供應商後取最佳級距」，**不是跨供應商比價**（邏輯與 Odoo 相同）。
- 採購單帶價：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/purchases/src/Filament/Admin/Clusters/Orders/Resources/OrderResource/Schemas/OrderForm.php#L873-L905 ：有供應商報價就用報價並換匯；沒有就用商品 `cost`，再沒有用售價。

### 5.4 詢價單（RFQ）→ 採購單流程
- https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/purchases/src/Services/OrderWorkflow.php#L28-L123
  - `sendRequestForQuotation()`：產生 RFQ PDF（dompdf）→ 寄給選定的多個供應商 Email → 狀態改 `SENT` → 附到 chatter。
  - `confirm()`：超過設定金額（`order_validation_amount`）要主管核准（`TO_APPROVE`），否則直接成立並 `planForOrder()` 自動產生入庫單。
- 供應商點信中連結回覆接受／拒絕：`routes/web.php` 的簽章網址＋ https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/purchases/src/Livewire/RespondQuotation.php#L16-L43 （只記「已確認收到／拒絕」，**不能讓供應商在線上填回報價**）。
- 採購協議（`RequisitionType`：blanket_order 總括合約、purchase_template 範本）：`plugins/webkul/purchases/src/Models/Requisition.php`，API 在 `plugins/webkul/purchases/routes/api.php`。

### 5.5 毛利計算
- https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/sales/src/Filament/Clusters/Orders/Resources/QuotationResource/Schemas/QuotationForm.php#L1527-L1545 ：`(折扣後售價 − 成本) × 數量`，毛利率 = 單位毛利 ÷ 折扣後售價。整張單加總在同檔 #L1476-L1525。需在銷售設定開 `enable_margin`。

### 5.6 匯率與單位換算
- 匯率換算：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/support/src/Models/Currency.php#L72-L121 ：查「日期 ≤ 指定日」最新一筆 `CurrencyRate`。**坑：找不到匯率時預設 1.0**（#L120），沒輸入匯率時 USD→TWD 會變 1:1 而不報錯。匯率要手動輸入或用 API 寫入（`CurrencyRateController`），**沒有自動抓匯率排程**（用 grep 搜 `CurrencyRate::create` 只找到 API controller）。
- 單位換算：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/support/src/Models/UOM.php#L100-L153 （`computeQuantity`、`computePrice`，以 factor 換算，同類別才能換，例如「箱↔個」）。

### 5.7 庫存
- 庫存數量表（含盤點欄位 `counted_quantity`、`inventory_quantity_set`）：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/inventories/src/Models/ProductQuantity.php#L33-L57
- 出庫揀貨順序（FIFO／LIFO 是「先拿哪一批」，**不是成本估值**）：同檔 #L450-L470。
- 入庫／出庫／調撥／代發的狀態機：`plugins/webkul/inventories/src/Services/`（TransferWorkflow、MoveConfirmer、MoveReserver、BackorderCreator 等 16 支）。

### 5.8 稅
- 稅額計算 `TaxComputer`（464 行）＋公式稅 `TaxFormulaEvaluator`（262 行，自己寫的 tokenizer／parser，只允許 min／max 函式，**沒有用 PHP `eval`**）：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/accounts/src/Models/Tax.php#L159-L177 。台灣 5% 營業稅可用一般百分比稅設定（含稅／未稅都支援），但沒有預設的台灣稅表。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 價目表規則引擎 | [PriceListResolver.php](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/src/Services/PriceListResolver.php) ＋ [PriceRuleItem.php](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/src/Models/PriceRuleItem.php) | Eloquent、Currency、UOM | 低（當作規格翻寫） | 請 Claude Code 翻成純 JS 函式 `resolvePrice(rules, product, qty, date)`，規則存 Firestore `priceRules` 集合，放 Cloud Functions 或前端都行 |
| 成本加成公式 | 同上 `applyFormula()` #L121-L155 | 無 | 低 | 30 行內，可直接做成你倉儲系統「建議售價」按鈕：成本 × (1+加成%) → 進位到 10 元 → 加固定費 → 夾在最低／最高毛利之間 |
| 供應商報價表結構＋取價邏輯 | [ProductSupplier.php](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/src/Models/ProductSupplier.php#L28-L45)、[Product.php#L319-L442](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/src/Models/Product.php#L319-L442) | Partner、Currency、UOM | 低～中 | 抄欄位到 Firestore `vendorPrices`；建議**改成跨供應商比價**（拿掉 #L352-L356 只取第一家的限制），就是一個「進貨比價表」 |
| 毛利計算 | [QuotationForm.php#L1527-L1545](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/sales/src/Filament/Clusters/Orders/Resources/QuotationResource/Schemas/QuotationForm.php#L1527-L1545) | 無 | 低 | 純數學，直接翻 JS；可搭配廣告費（ROAS）再扣一次變成「含廣告毛利」 |
| 匯率／單位換算 | [Currency.php#L72-L121](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/support/src/Models/Currency.php#L72-L121)、[UOM.php#L100-L153](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/support/src/Models/UOM.php#L100-L153) | rates 資料表 | 低 | 「依日期取最近匯率」＋「同類單位 factor 換算」兩個小函式；記得把「無匯率回傳 1」改成報錯 |
| 稅公式解析器 | [TaxFormulaEvaluator.php](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/accounts/src/Services/TaxFormulaEvaluator.php) | 無 | 中 | 安全的四則運算解析器（不用 eval），可改成讓使用者在試算表欄位輸入簡單公式（例如 `price_unit * 0.05`） |
| 採購審核＋RFQ 寄送流程 | [OrderWorkflow.php](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/purchases/src/Services/OrderWorkflow.php) | Mail、dompdf、Chatter | 中 | 參考狀態機（draft→sent→to_approve→purchase→done），在 Firebase 用 Cloud Functions＋SendGrid 實作 |
| 可欄位管理的明細表格元件 | [support/.../Repeater.php](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/support/src/Filament/Forms/Components/Repeater.php) | Filament 5、Livewire | 高 | 訂單明細「像試算表一樣」的欄位顯示／隱藏、欄位加總（`getSummaryForColumn`）。綁死 Filament，只適合參考 UI 構想，不適合拆 |
| 庫存 REST API 設計 | [inventories/routes/api.php](https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/inventories/routes/api.php) | Sanctum | 中 | 參考端點命名（receipts/{id}/validate、quantities/{id}/apply）設計你自己系統的 API |

## 7. AI／Claude 整合

- **執行時期沒有任何 AI 功能**：用 `grep -rliE "openai|anthropic|gemini|llm|Prism"` 搜 `plugins/`、`app/`、`config/`、`composer.json`，沒有命中。沒有 AI 自動填商品描述、沒有 AI 定價。
- **開發用的 AI 工具**：`composer.json` 的 require-dev 有 `laravel/boost`，它在 `composer.lock` 裡依賴 `laravel/mcp`（Laravel Boost 是給 Claude Code、Cursor 等 AI 編碼工具用的 MCP 伺服器，提供資料庫結構、文件查詢）。repo 根目錄有 `AGENTS.md`（Boost 產生的 AI 編碼規範，但裡面寫的版本是 Laravel v11／Filament v4，**已過時**，跟 composer.json 的 13／5 不符）、`.github/copilot-instructions.md`、`docs/superpowers/plans/`（用 superpowers 這個 Claude Code 技能包寫的實作計畫）→ 代表官方團隊自己在用 AI 代理寫程式。
- **能不能換成／接上 Claude**：可以自己接。最簡單的方式是用它的 REST API（第 8 節）＋自己寫一個 MCP server，讓 Claude 能查商品、價目表、庫存；或在 Laravel 裡用 Anthropic PHP SDK 加一個 Filament Action（例如「AI 產生商品描述」）。官方沒有現成的。
- **結論**：`claude_support = 可接`。

## 8. 擴充方式與 API

- **REST API**：10 個外掛有 `routes/api.php`（accounts、inventories、partners、point-of-sale、products、projects、purchases、sales、security、support），全部掛在 `/admin/api/v1/...`，用 Laravel Sanctum Bearer Token。
  - 取得 Token：`POST /admin/api/v1/login`（email＋password），有每 IP＋帳號 5 次的限流：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/security/src/Http/Controllers/API/V1/AuthController.php#L31-L70
  - 商品 API（含 `price-lists`）：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/routes/api.php
  - 採購 API（含 `vendor-price-lists`、purchase-orders confirm／cancel）：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/purchases/routes/api.php
  - API 文件由 Scribe 自動產生，安裝後在 `/api/docs`（Scalar 主題；設定見 `config/scribe.php`）。
- **Webhook**：用 grep 搜 `webhook` 在 plugins／app 的 PHP 程式碼中**沒有找到**。若要「ERP 有變動就通知 Firebase」，要自己掛 Laravel Event Listener（例如 purchases 有 `OrderConfirmed` 等事件，在 `plugins/webkul/purchases/src/Events/`）再呼叫 Firebase HTTPS Function。
- **匯入匯出**：Filament 匯入器只在 CRM（`LeadRecordImporter`）；會計報表可匯出 Excel（`plugins/webkul/accounting/src/Filament/Clusters/Reporting/Pages/Exports/`）。**商品／庫存的 CSV 匯入匯出未找到**（grep `extends Importer|extends Exporter` 只命中 CRM），要自己寫或走 API。
- **自訂外掛**：每個外掛是獨立 composer 套件（`plugins/*/*/composer.json` 由 `wikimedia/composer-merge-plugin` 合併），有 `XxxPlugin.php`（註冊 Filament 資源）、`XxxServiceProvider.php`、`php artisan <plugin>:install` 指令。
- **自訂欄位**：`fields` 外掛＋`HasCustomFields` trait（Product 有用），可在後台幫商品加欄位不用改程式。

## 9. 程式品質與風險

- **維護狀況**：非常活躍。最後 push 2026-11-04（掃描當天）；CHANGELOG 最新是 v1.8.0（新增 CRM、主題自訂等）；2025-01 建立、不到兩年 12k 星。背後是印度公司 Webkul（也做 Bagisto、Krayin CRM）。
- **測試**：310 個測試 PHP 檔（Pest），我數的興趣模組：products 20、inventories 41、purchases 16、sales 20、accounts 48（`grep -E "^plugins/webkul/<名稱>/tests/.*\.php$"` 計數）；另有 Playwright E2E（`tests/e2e-pw/`）。CI 同時跑 MySQL 與 PostgreSQL。
- **⚠ 安裝時回傳資料（遙測）**：`php artisan erp:install` 結束時會觸發 `aureus.installed` 事件，把**網站網址、第一個使用者的 email 與名字** POST 到 `https://updates.aureuserp.com/api/updates`：
  https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/plugin-manager/src/Listeners/Installer.php#L16-L45 （事件在 `plugins/webkul/plugin-manager/src/Console/Commands/InstallERP.php` 第 91 行發出）。在意隱私的話，安裝前把 `PluginManagerServiceProvider.php` 第 42 行的 `Event::listen` 註解掉。
- **其他對外連線**：website 外掛排程下載 db-ip.com IP 資料；sales／crm 的 Msg91 簡訊服務（印度）。
- **已知的坑**：
  1. **無匯率時靜默當 1:1**（Currency.php #L120）。
  2. **API 盤點套用直接覆寫數量**：`QuantityController::apply()` 把 `quantity` 直接設成盤點數，沒有建立庫存異動紀錄（https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/inventories/src/Http/Controllers/API/V1/QuantityController.php#L165-L201 ；它有查盤點調整儲位但只當檢查用）。後台 UI 是否也如此：未確認。
  3. **補貨（Replenishment）頁面被關掉**：`canAccess()` 直接 `return false`（https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/inventories/src/Filament/Clusters/Operations/Resources/ReplenishmentResource.php#L23-L28 ），CHANGELOG 也寫「未完成」。
  4. `AGENTS.md` 版本資訊過時，用 Claude Code 改它時要提醒 Claude 以 `composer.json` 為準。
  5. 商品 `cost`（成本）是**手動欄位**，進貨入庫不會自動更新成本（grep `'cost' =>`／`->cost =` 只找到表單、API 驗證與種子資料）。
  6. `.env.example` 預設 `APP_DEBUG=true`、`APP_TIMEZONE=UTC`、`APP_CURRENCY=USD`，正式上線要改（台灣用 `Asia/Taipei`、`TWD`）。
- **資安**：登入有限流；RFQ 回覆網址用 Laravel `signed` 簽章；角色權限用 Filament Shield。沒有做完整資安稽核（未確認）。

## 10. 跟其他專案組合的建議

- **你的 Firebase 倉儲系統（A）＋ AureusERP 的定價邏輯（B）＋ 價格追蹤專案（C）**：
  - A 保持主系統；把 B 的 `PriceListResolver`、`applyFormula`、`calculateMargin`、`ProductSupplier` 結構翻成 JS 放進 A，就得到「客戶別價格＋批發級距＋成本加成建議售價＋毛利率」。
  - C 選 changedetection.io 或 PriceBuddy／Discount-Bandit 抓競品或供應商網頁價格，結果寫回 A 的 `vendorPrices`，再用改過的「跨供應商比價」邏輯挑最便宜。
- **想要完整 ERP 而不是自己寫**：AureusERP 與 Odoo／ERPNext 功能相近但更輕、程式更好讀（Laravel）；但 Odoo（有 FIFO/AVCO 庫存估值與 stock_landed_costs 到岸成本模組）和 ERPNext（有庫存估值與 Landed Cost Voucher）在「成本」這塊比它完整（這兩點依一般認知，未在本 repo 驗證，請對照它們各自的資料包）。台灣在地化三者都弱。
- **試算表需求**：AureusERP 沒有網頁版 Excel；只有 Filament 表格＋明細 Repeater 可切換欄位、加總。若要「網頁 Excel 改價格」，建議另外用 Univer／Luckysheet／Handsontable 類專案做前端，透過本專案 API 或你自己的 Firestore 讀寫價目表。
- **AI 影片／腳本**：本專案無關。可以反過來，用它的商品 API 當資料源，餵商品名稱／賣點給 Claude 產生廣告腳本。

## 11. 價格相關功能檢查表

- **商品與價格資料模型** — **有**
  - 品項／變體：`Product`（`price` 售價、`cost` 成本、`uom_id`／`uom_po_id` 銷售／採購單位、`parent_id` 變體）https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/products/src/Models/Product.php#L43-L86
  - 多單位：有，UOM 類別＋factor 換算（UOM.php #L100-L153）。
  - 多幣別／匯率：有，`Currency`＋`CurrencyRate`，依日期取匯率；需手動維護匯率。
  - 價目表：有，`PriceList`＋`PriceRuleItem`＋`PriceListResolver`（5.1）。
  - 客戶別價格：有，客戶主檔 `price_list_id`（5.2）。
- **進價：多家供應商報價、比價、詢價單、採購單** — **部分有**
  - 多家供應商報價：有（`ProductSupplier`，5.3）。
  - 比價：**沒有獨立比價畫面**；`getSeller()` 只在第一優先供應商內取最佳級距（Product.php #L352-L356）。用 grep 搜 `alternative|comparison` 在 purchases/src 沒有命中（Odoo 的「替代 RFQ 比較」未移植）。
  - 詢價單 RFQ：有，可一次寄多家供應商（OrderWorkflow.php #L28-L75），但供應商只能「接受／拒絕」不能線上回填價格。
  - 採購單：有，含金額門檻核准（#L87-L101）、自動產生入庫單、帳單。
- **成本：庫存估值、到岸成本、毛利與定價** — **大部分沒有**
  - 庫存估值 FIFO／移動平均：**沒有**。grep `fifo|average|valuation|landed` 在非語系、非測試的 PHP 只找到出庫揀貨順序（ProductQuantity.php #L450-L470）與報表平均，沒有估值層。`Move` 有 `price_unit` 欄位但沒有拿來算庫存價值。
  - 到岸成本（運費、關稅分攤）：**沒有**（同上 grep 無 landed）。
  - 毛利：有（QuotationForm.php #L1527-L1545）。
  - 定價計算：有，價目表公式（成本加成、進位、加價、毛利上下限）（PriceListResolver.php #L121-L155）。
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知** — **沒有（僅欄位變更紀錄）**
  - 抓網頁價格：沒有（對外 HTTP 只有安裝回報、Msg91、db-ip）。
  - 價格歷史：只有 chatter 的欄位異動紀錄，`price`／`cost` 列在 `getLogAttributeLabels()`（Product.php #L88-L112），可看到誰在何時改價，但沒有曲線或報表。
  - 降價通知：沒有。補貨：有「補貨點」模型 `OrderPoint`（最低／最高量）https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/inventories/src/Models/OrderPoint.php#L24-L39 ，但補貨畫面目前被停用（第 9 節）。
- **庫存／倉儲＋與 Firebase 串接** — **有（倉儲完整；串接要自己寫）**
  - 入庫、出庫、調撥、代發、退貨、報廢、批號、包裹、儲位上架規則：有（inventories 外掛，1,279 個檔案）。
  - 盤點：有（`counted_quantity` → `apply`），API 版直接覆寫數量（第 9 節坑 2）。
  - 串接方式：REST API（Sanctum Token）可從 Firebase Cloud Functions 呼叫 `/admin/api/v1/inventories/quantities`、`/products/products`；**沒有 Webhook**；**沒有商品／庫存 CSV 匯入匯出**（未找到）。建議做法：Cloud Functions 排程每 N 分鐘拉 API 同步，或在 Laravel 加 Event Listener 主動 POST 到 Firebase。
- **台灣在地化** — **沒有**
  - 繁中介面：沒有。語系只有 ar、en、es、fr、pt_BR（`grep -c "/lang/zh"` 結果 0）。
  - 新台幣：幣別資料有 TWD（符號 NT$、小數位 0、預設停用），要手動啟用：https://github.com/aureuserp/aureuserp/blob/9b076df06a902cce5a14866650547ed13ffa140a/plugins/webkul/security/src/Data/currencies.json#L1217-L1225
  - 台灣稅制：可手動建 5% 營業稅；沒有台灣會計科目表或稅表預設。
  - 電子發票（財政部 MIG／加值中心）：沒有。

## 關鍵字
AureusERP、aureuserp、Webkul、開源 ERP、Laravel、FilamentPHP、Livewire、PHP、MySQL、PostgreSQL、價目表、price list、pricelist rule、定價規則、成本加成、markup、毛利、margin、供應商報價、vendor price list、ProductSupplier、詢價單、RFQ、採購單、purchase order、採購協議、blanket order、庫存、inventory、倉儲、warehouse、盤點、補貨點、reorder point、多幣別、匯率、currency rate、單位換算、UOM、稅額計算、REST API、Sanctum、Scribe、Odoo 替代、MIT 授權、安裝遙測
