# Dolibarr/dolibarr — 老牌 PHP 開源 ERP／CRM：多供應商進價比價、庫存、毛利，且已內建 Claude MCP 伺服器
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：78e6e8f
> GitHub：https://github.com/Dolibarr/dolibarr｜⭐ 7831｜授權：GPL-3.0-or-later（GPL-3+）｜主要語言：PHP｜最近更新：2026-11-04

（本次掃描的是 `develop` 分支，版本號為 `25.0.0-alpha`，見 `htdocs/version.inc.php` 第 40–41 行 `DOL_MAJOR_VERSION='25'`、`DOL_MINOR_VERSION='0.0-alpha'`。實際要用請改裝穩定版，例如 24.0.x。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

Dolibarr 是一套從 2002 年就在開發的模組化網頁 ERP／CRM（PHP + MySQL/MariaDB/PostgreSQL），涵蓋商品、供應商、詢價單、採購單、報價、訂單、發票、庫存、盤點、毛利、多幣別、會計。對你最有價值的三件事：

1. **多供應商進價＋自動挑最低價**：每個商品可掛 N 家供應商報價（含最小訂購量、折扣、運費欄位、幣別、交期），系統用 `find_min_price_product_fournisseur()` 算出「扣折扣後單價」最低的那一家，補貨頁直接用它建採購單。這套資料模型和演算法很適合你照抄成 Firebase 版。
2. **成本與毛利**：庫存移動平均成本（PMP / 加權平均）在每次入庫時自動重算；毛利率、加價率有獨立函式；還有「動態價格公式」可以用 `#cost_price# * 1.3` 這種公式自動定價，公式變數還能定時從 JSON API 抓（例如匯率、原物料價）。
3. **已內建 AI 模組＋MCP 伺服器**：`htdocs/ai/` 支援 Anthropic Claude（原生 Messages API）、OpenAI、Gemini 等，並提供 MCP 伺服器，後台頁面直接給你 `claude mcp add --transport http ...` 指令。也就是說：你可以把 Dolibarr 架起來當「進價／庫存資料庫」，再讓 Claude Code 或 Claude Desktop 用自然語言去查「某商品哪家供應商最便宜」。

可以拿來做：
- 直接個人架一台當「供應商報價本＋進貨成本帳」，用 Claude 透過 MCP 查價。
- 把它的資料表設計（`llx_product_fournisseur_price` 等）當範本，設計你自己倉儲 App 的 Firestore 結構。
- 用它的 Webhook 把「商品修改」「採購單收貨」事件推到你的 Firebase Cloud Function，兩邊同步。

跟你第 1 優先（網頁版 Excel）**幾乎無關**：Dolibarr 沒有試算表式的格狀編輯器，只有一般清單頁＋CSV/XLSX 匯入匯出（用 PhpSpreadsheet）。跟第 3 優先（AI 影片／腳本）也只有邊緣關係：AI 服務清單裡有列出影片模型（如 `sora-2`、`veo-3.1`），但功能狀態是 `notused`，沒有影片產生流程。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- 授權：GNU GPL 第 3 版「或之後版本」（README 寫 GPL-3+，`COPYING` 是 GPLv3 全文，各檔頭也寫 `either version 3 of the License, or (at your option) any later version`）。AI 模組 README 另註：程式碼 GPLv3+，文件 GFDL。
- **個人使用**：完全自由，架在自己電腦或伺服器上用、改都可以，不用公開任何東西。
- **公司商用**：
  - 公司內部自己架來用（不對外散布軟體）→ 可以，不用開源你的修改。GPL 不是 AGPL，單純「提供網頁服務給員工或客戶使用」不算散布。
  - 如果你**把 Dolibarr 的 PHP 程式碼抄進你自己的產品**再散布（賣給別人、給別人安裝），整個衍生作品要用 GPL 開源。
  - 只「參考演算法、自己用 JavaScript 重寫」（例如最低進價挑選邏輯、加權平均成本公式）→ 公式本身不受著作權保護，一般不構成衍生作品；但不要逐行翻譯大段程式碼。
  - 透過 REST API／Webhook 跟你的 Firebase App 溝通 → 兩邊是獨立程式，你的 App 不需要 GPL。
- 付費版：主程式沒有閉源版。官方市集 DoliStore（`htdocs/admin/system/about.php` 第 151 行有連結）賣第三方付費模組，另有合作夥伴提供付費代管與支援；核心功能都在這個 repo。
- 內含第三方套件各有授權（`COPYRIGHT` 檔列出，例如 Restler、PhpSpreadsheet、TCPDF 等），未逐一確認。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容 |
|---|---|
| 後端 | 純 PHP（無框架，自家 MVC 慣例），最低 PHP 7.1（`htdocs/install/check.php` 第 108 行 `$arrayphpminversionerror = array(7, 1, 0)`），README 徽章寫 ≥7.2 |
| 前端 | 伺服器端產生 HTML＋jQuery（`htdocs/includes/jquery`），非 SPA |
| 資料庫 | MySQL / MariaDB / PostgreSQL；資料表前綴 `llx_`，結構檔在 `htdocs/install/mysql/tables/` |
| REST API | Luracast Restler（`htdocs/api/index.php` 第 113 行載入），內建 Swagger Explorer，認證用 `DOLAPIKEY` header |
| 部署 | Apache/Nginx + PHP + DB；Windows 有 DoliWamp、Debian 有 DoliDeb；Docker 映像在另一個 repo `Dolibarr/dolibarr-docker`（README 指向，本次未複製） |
| 硬體 | 一般 VPS 或家用電腦即可，不需 GPU |
| API Key | 全部選用：AI 功能要自己的 LLM Key（Anthropic、OpenAI、Gemini、Mistral、Groq、DeepSeek、Perplexity、Zhipu、自訂 OpenAI 相容端點）；匯率同步可用免費免 Key 的 Frankfurter 或要 Key 的 currencylayer／apilayer |
| 費用 | 軟體免費；主機費視 VPS 而定；AI 按 token 計費（依你選的模型），未估算具體金額 |

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree -r --name-only HEAD` 共 15,639 個檔案；`.php` 4,718 個，扣掉 `htdocs/includes/`（第三方套件 3,092 檔）後自家 PHP 為 2,763 個；語系 121 種。

```
dolibarr/
├─ htdocs/                      # 網站根目錄（14,568 檔）
│  ├─ product/                  # 商品／服務主模組
│  │  ├─ class/product.class.php        # Product 類別（8,228 行、92 個 public 方法）：售價、成本、庫存
│  │  ├─ class/productcustomerprice.class.php  # 客戶別專屬價格
│  │  ├─ class/api_products.class.php   # 商品 REST API（含 purchase_prices 進價端點）
│  │  ├─ price.php / price_suppliers.php # 售價分頁／供應商進價分頁
│  │  ├─ dynamic_price/                 # 動態價格公式＋定時抓外部數值
│  │  ├─ admin/price_rules.php          # 多價格等級自動推算規則
│  │  ├─ inventory/                     # 盤點
│  │  └─ stock/                         # 倉庫、庫存移動、補貨、指定日期庫存、庫存估值、調撥
│  ├─ fourn/                    # 供應商、採購單、供應商發票
│  │  ├─ class/fournisseur.product.class.php  # ProductFournisseur：進價 CRUD、最低價、價格歷史
│  │  └─ ajax/getSupplierPrices.php           # 下拉選單用的供應商價格清單（可依最低價排序）
│  ├─ supplier_proposal/        # 向供應商詢價（RFQ），結案可回寫進價
│  ├─ comm/propal/              # 對客戶報價單
│  ├─ margin/                   # 毛利報表＋getMarginInfos()
│  ├─ multicurrency/            # 多幣別、匯率同步
│  ├─ ai/                       # AI 模組：LLM 介接、助理、MCP 伺服器、工具
│  ├─ api/                      # REST API 載入器（Restler）
│  ├─ webhook/                  # Webhook 目標設定與歷史
│  ├─ core/lib/price.lib.php    # 行金額計算 calcul_price_total()
│  ├─ core/triggers/            # 事件觸發器（Webhook 也是其中一個）
│  ├─ core/modules/import|export/ # CSV／XLSX 匯入、CSV／TSV／Excel2007 匯出
│  ├─ install/mysql/tables|data/  # 全部資料表結構與初始資料（國家、稅率、幣別）
│  ├─ langs/zh_TW/              # 繁體中文語系（69 個 .lang 檔）
│  └─ includes/                 # 第三方套件（restler、phpoffice、tecnickcom 等）
├─ test/phpunit/                # 173 個 *Test.php
├─ .agents/                     # 給 AI 程式助理的 AGENTS.md 與 11 個 SKILL.md（開發用）
└─ dev/、scripts/、doc/         # 開發工具、命令列腳本、文件
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 供應商進價資料模型**
→ [`llx_product_fournisseur_price.sql#L22-L60`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/install/mysql/tables/llx_product_fournisseur_price.sql#L22-L60)
一列＝「某商品 × 某供應商 × 某最小數量」的報價。重要欄位：`price`（該數量總價未稅）、`quantity`、`unitprice`、`remise_percent`（折扣）、`charges`（運費，需開 `PRODUCT_CHARGES` 才顯示，第 38 行）、`tva_tx`、`delivery_time_days`、`supplier_reputation`、`packaging`（須以此倍數訂購）、`multicurrency_*`（外幣價與匯率）、`barcode`、`status`。同一供應商可以有多列做「量大價優」。

**5.2 自動挑最低進價**
→ [`fournisseur.product.class.php#L970-L1095`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/fourn/class/fournisseur.product.class.php#L970-L1095)
`find_min_price_product_fournisseur($prodid, $qty, $socid)`：SQL 撈出該商品所有「啟用中供應商」且 `quantity <= 需求量` 的報價，在 PHP 迴圈中計算 `unitprice * (1 - remise_percent/100)`，若該報價掛了動態公式就先用 `PriceParser` 算出價格，再取最小值，把供應商、單價、交期、幣別存回物件。重點：比的是**扣折扣後的單位價**，沒有把 `charges`（運費）和交期加權進去——你自己做時可以改成「到岸單價＝單價＋運費/數量」。

**5.3 進價更新與價格歷史**
→ [`fournisseur.product.class.php#L409`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/fourn/class/fournisseur.product.class.php#L409)、[`logPrice` 呼叫 #L618](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/fourn/class/fournisseur.product.class.php#L618)、[`listProductFournisseurPriceLog()` #L1265](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/fourn/class/fournisseur.product.class.php#L1265)
每次修改進價都寫一筆到 `llx_product_fournisseur_price_log`（含外幣價與匯率），商品頁滑鼠移上去的提示框會顯示最近 N 筆（`MAIN_TOOLTIP_PRICELOG_HISTORY_LIMIT`，預設 10，第 1462 行）。售價歷史則由 `Product::_log_price()` 寫進 `llx_product_price`；客戶別價格寫 `llx_product_customer_price_log`。

**5.4 下拉選單依最低價排序**
→ [`fourn/ajax/getSupplierPrices.php#L92-L140`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/fourn/ajax/getSupplierPrices.php#L92-L140)
帶 `bestpricefirst=1` 時排序改為 `pfp.unitprice, s.nom, ...`，回傳 JSON（含 `finalUnitPrice` 已扣折扣）。這是很好拆的「比價清單 API」範本。

**5.5 補貨建議＋一鍵建採購單**
→ [`product/stock/replenish.php#L178-L200`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/stock/replenish.php#L178-L200)、[`#L1044`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/stock/replenish.php#L1044)
依 `desiredstock`（理想庫存）與 `seuil_stock_alerte`（警戒量，可細到每個倉庫）列出要補的商品，每列一個供應商報價下拉選單，勾選後依供應商分組自動產生採購單草稿。

**5.6 向供應商詢價（RFQ）→ 回寫進價**
→ [`supplier_proposal.class.php#L1931-L1966`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/supplier_proposal/class/supplier_proposal.class.php#L1931-L1966)
詢價單結案（接受）時，`updateOrCreatePriceFournisseur()` 逐行呼叫 `update_buyprice()`，把供應商回覆的價格直接寫成正式進價。流程：詢價單 → 接受 → 進價表 → 補貨／採購單。

**5.7 售價：多價格等級、客戶別、數量級距、自動推算**
→ [`Product::getSellPrice()` #L2578-L2680](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/class/product.class.php#L2578-L2680)、[`generateMultiprices()` #L7792](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/class/product.class.php#L7792)
四種模式由常數切換：單一價格、`PRODUIT_MULTIPRICES`（依客戶等級，例如零售／批發／經銷）、`PRODUIT_CUSTOMER_PRICES`（客戶專屬價）、`PRODUIT_CUSTOMER_PRICES_BY_QTY`（數量級距），以及混合模式。`llx_product_pricerules` 存「等級 N = 等級 M ×（1+var_percent）」，改基準價時 `generateMultiprices()` 自動算出其他等級。售價也有 `price_min`（最低售價保護）。

**5.8 動態價格公式＋定時抓外部數值**
→ [`price_parser.class.php#L139-L255`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/dynamic_price/class/price_parser.class.php#L139-L255)、[`price_global_variable_updater.class.php#L477-L585`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/dynamic_price/class/price_global_variable_updater.class.php#L477-L585)
公式用 `EvalMath`（不是 PHP `eval`）計算，可用變數 `#cost_price#`、`#pmp#`、`#weight#`、`#extrafield_xxx#`、`#global_XXX#`。全域變數可設定「更新器」：每 N 分鐘（最少 5 分鐘）GET 一個 JSON URL，用 `VALUE` 參數（逗號分隔的 key 路徑）取值；也支援 SOAP。適合做「匯率／金價／原料價 → 自動調售價」。這不是網頁爬蟲，只能抓 JSON 或 SOAP。

**5.9 行金額計算**
→ [`core/lib/price.lib.php#L90`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/core/lib/price.lib.php#L90)
`calcul_price_total()` 輸入數量、單價（未稅或含稅）、折扣、稅率、地方稅、匯率，回傳 27 個元素的陣列（未稅總額、稅額、含稅總額、外幣版本……）。整個檔案 479 行、只有 1 個函式（`grep -n "^function"` 計數）。

**5.10 加權平均成本（PMP）**
→ [`mouvementstock.class.php#L588-L615`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/stock/class/mouvementstock.class.php#L588-L615)
入庫（type 0 或 3）且單價 > 0 時：`newpmp = (舊量 × 舊PMP + 入庫量 × 入庫價) / (舊量 + 入庫量)`；出庫不改 PMP。這幾行可以原樣翻成 JS 放進你的入庫流程。

**5.11 毛利計算**
→ [`margin/lib/margins.lib.php#L119-L161`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/margin/lib/margins.lib.php#L119-L161)
`getMarginInfos()` 回傳（進價、毛利率＝毛利/進價、利潤率 marque＝毛利/售價）。進價來源可選 PMP、成本價或最佳供應商價（毛利模組設定）。

**5.12 匯率同步**
→ [`multicurrency.class.php#L675-L720`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/multicurrency/class/multicurrency.class.php#L675-L720)
`syncRates()` 支援 currencylayer、apilayer、Frankfurter（免費、免 Key、ECB 匯率）。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 供應商報價資料表設計 | [llx_product_fournisseur_price.sql](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/install/mysql/tables/llx_product_fournisseur_price.sql) | 無 | 低 | 直接轉成 Firestore `supplierPrices` 集合欄位（productId、supplierId、minQty、price、discountPct、shipping、leadDays、currency、fxRate） |
| 最低進價挑選演算法 | [fournisseur.product.class.php#L970-L1095](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/fourn/class/fournisseur.product.class.php#L970-L1095) | DB、PriceParser（選用） | 低 | 用 JS 重寫約 30 行：filter(minQty<=qty) → map(折後單價) → min；建議加上運費分攤 |
| 加權平均成本公式 | [mouvementstock.class.php#L588-L615](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/stock/class/mouvementstock.class.php#L588-L615) | 無 | 低 | 入庫時在 Firestore transaction 裡更新 `avgCost` |
| 毛利／加價率函式 | [margins.lib.php#L119](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/margin/lib/margins.lib.php#L119) | 無 | 低 | 轉成 JS 工具函式，給定價試算頁用 |
| 價格等級自動推算規則 | [product.class.php#L7792](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/class/product.class.php#L7792) | DB | 中 | 概念照搬：零售價 = 成本 × (1+x%)，批發價 = 零售 × (1-y%) |
| 動態價格公式＋JSON 更新器 | [price_parser.class.php](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/dynamic_price/class/price_parser.class.php)、[price_global_variable_updater.class.php](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/dynamic_price/class/price_global_variable_updater.class.php) | EvalMath、getURLContent | 中 | JS 端可用 `mathjs` 之類函式庫取代 EvalMath；更新器改成 Cloud Scheduler 排程函式 |
| 比價清單 JSON 端點 | [getSupplierPrices.php](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/fourn/ajax/getSupplierPrices.php) | Dolibarr 整套 | 中 | 參考其回傳格式，做你自己的「同商品各供應商價格」API |
| 行金額／稅額計算 | [price.lib.php#L90](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/core/lib/price.lib.php#L90) | `$mysoc`、`llx_c_tva` | 中 | 台灣只有 5%／0% 營業稅，簡化後只需未稅↔含稅與四捨五入 |
| Claude 介接器 | [llmadapter.class.php#L204-L242](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/class/llmadapter.class.php#L204-L242) | curl | 低 | 很薄的 Messages API 呼叫，參考即可；JS 端直接用官方 SDK 更好 |
| MCP 伺服器（PHP、Streamable HTTP） | [mcp_server.php](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/server/mcp_server.php)、[mcp_protocol.class.php#L165](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/class/mcp_protocol.class.php#L165) | Dolibarr 認證、使用者權限 | 高 | 不建議拆；直接整套架起來讓 Claude 連。可參考它「寫入前確認」與「白名單工具」的設計 |
| 個資遮罩 PrivacyGuard | [privacy_guard.class.php#L59](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/class/privacy_guard.class.php#L59) | 無（正規表示式） | 低 | 送 LLM 前把 Email／電話等換成代號、回來再還原；JS 可照做 |
| Webhook 觸發器 | [interface_95_modWebhook_WebhookTriggers.class.php#L66-L140](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/core/triggers/interface_95_modWebhook_WebhookTriggers.class.php#L66-L140) | getURLContent | 低（用法） | Dolibarr 事件 → POST JSON 到你的 Cloud Function URL |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **模型清單**：[`ai/lib/ai.lib.php#L69-L196`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/lib/ai.lib.php#L69-L196) 的 `getListOfAIServices()`：ChatGPT、Groq、Mistral、DeepSeek、Perplexity、Zhipu、Custom（OpenAI 相容），以及專用介接器的 **Anthropic（預設 `claude-opus-5`，第 167–179 行）** 與 Google Gemini。Claude 走原生 `x-api-key` + `anthropic-version: 2023-06-01` 的 Messages API（[`llmadapter.class.php#L204-L242`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/class/llmadapter.class.php#L204-L242)）。
- **功能**：[`getListOfAIFeatures()` #L37](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/lib/ai.lib.php#L37)：Email 內文產生、網站頁面產生、翻譯、摘要、拼字檢查、改寫、自訂欄位自動填寫、文件解析（實驗性）。圖片／影片／語音產生狀態是 `notused`。
- **Prompt 位置**：預設系統 prompt 是 [`ai/class/ai.class.php#L64-L71`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/class/ai.class.php#L64-L71) 的常數（`AI_DEFAULT_PROMPT_FOR_EMAIL` 等）；後台 `ai/admin/custom_prompt.php` 可覆寫。
- **AI 助理**：`ai/assistant/`（聊天、意圖解析 `parse_intent.php` 2,059 行、執行工具、PDF 下載），對話存 `llx_ai_chat_conversation`／`llx_ai_chat_message`，每次呼叫記錄在 `llx_ai_request_log`。
- **MCP 伺服器**：[`ai/server/mcp_server.php`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/server/mcp_server.php)，需開 `AI_MCP_ENABLED`（第 60 行），支援 `initialize`、`tools/list`、`tools/call`、`resources/*`、`prompts/*`（`mcp_protocol.class.php` `handleRequest()`）。認證接受 `DOLAPIKEY` header、`Authorization: Bearer`（[`mcpauth.class.php#L107-L134`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/class/mcpauth.class.php#L107-L134)），權限跟著該使用者走。後台頁 [`ai/admin/server_mcp.php#L506-L520`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/admin/server_mcp.php#L506-L520) 直接印出 `claude mcp add --transport http ...` 指令與 Claude Desktop 的 `mcpServers` JSON。
- **工具來源**：[`api_bridge.class.php#L2965`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/tools/api_bridge.class.php#L2965) 把 REST API 自動轉成 MCP 工具，但只開放有手寫白名單（`$this->enrichments[...]`）的端點。我用 `grep -c "enrichments\['[a-z_]*'\] = "` 數到 **44 個端點**，包含 products、warehouses、stockmovements、supplier_orders、supplier_proposals、multicurrencies 等。商品端點有 `getPurchasePrices`（[#L1308](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/ai/tools/api_bridge.class.php#L1308)），描述就是「列出每家供應商的參考號、最小量、單位進價」→ Claude 可直接回答「這個商品哪家最便宜」。寫入類工具會經過 `writeconfirmation.class.php` 發確認碼（預設 10 分鐘有效）。外部模組可用 `addMcpTools` hook 加工具（`mcp.class.php` `loadTools()` #L178）。
- **Skills**：repo 根目錄 `.agents/skills/` 有 11 個 `SKILL.md`（開發、code review、翻譯、測試…），是給**開發 Dolibarr 本身**用的，不是給終端使用者；本次只當資料讀，未採用其指示。
- **整個 AI 模組規模**：`wc -l` 統計 class/server/tools/lib/ajax/assistant 下 PHP 共 21,517 行。
- 結論：**原生支援 Claude**，而且是本分類少數同時有 MCP 伺服器的 ERP。注意這是 develop 分支（25.0-alpha）的狀態；穩定版 24.x 是否已含完整 MCP 功能 → 未確認。

## 8. 擴充方式與 API

- **REST API**：`/api/index.php/...`，Header `DOLAPIKEY: <使用者 API Key>`；有 Swagger Explorer（`/api/index.php/explorer`）。跟你相關的端點（`api_products.class.php` 的 `@url` 註解）：
  - `GET products/{id}/purchase_prices`（#L1170）、`POST products/{id}/purchase_prices`（#L957，新增進價，含 `charges`、`remise_percent`）、`GET products/{id}/purchase_prices/logs`（#L1226，進價歷史）、`GET products/purchase_prices`（#L1059，依供應商列出）
  - `GET products/{id}/selling_multiprices/per_segment | per_customer | per_quantity`（#L793、#L839、#L892）
  - `GET products/{id}/stock`（#L2243）
  - `POST stockmovements`（`api_stockmovements.class.php` #L217，參數含 `product_id, warehouse_id, qty, price`）、`warehouses` CRUD
- **Webhook**：模組 `webhook`，每個目標設定 URL＋要監聽的觸發碼（逗號分隔），事件發生時 POST `{"triggercode": ..., "object": {...}}`，已移除 DB 連線資訊（`removeDbFromPayload`，#L218）。`llx_c_action_trigger.sql` 共 163 筆觸發碼，含 `PRODUCT_CREATE/MODIFY/DELETE`、`ORDER_SUPPLIER_RECEIVE`、`PROPOSAL_SUPPLIER_CLOSE_SIGNED` 等。
- **匯入／匯出**：`modProduct.class.php` 定義匯入資料集：商品、各倉庫存（#L816）、**供應商進價**（#L843）、多價格等級（#L964）、客戶別價格（#L1010）、翻譯；格式 CSV／XLSX。匯出支援 CSV（ISO／UTF-8）、TSV、Excel 2007（PhpSpreadsheet，`export_excel2007.modules.php` #L31）。
- **模組與 Hook**：`htdocs/modulebuilder/` 可產生自訂模組骨架；大量 `executeHooks()`（例如 `getSellPrice`、`doDynamicPrice`）可在不改核心的情況下覆寫價格邏輯。自訂欄位（extrafields）幾乎每張表都有。
- Zapier 模組也在（`htdocs/zapier/`），本次未深讀。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：非常活躍。HEAD commit 時間 2026-11-04（`Fix set_remise_expect to apply local taxes only when applicable (#42317)`），ChangeLog 已在寫 25.0.0，24.0.3 修正清單很長。專案自 2011 年上 GitHub、程式源自 2002 年。
- **測試**：`test/phpunit/` 下 173 個 `*Test.php`，另有約 43 個 hurl 相關檔；CI 有 phpstan、phan、pre-commit（`.github/workflows/`）。
- **遙測**：首頁會發一次匿名 ping 到 `https://ping.dolibarr.org/`（`main.inc.php` 第 4131 行起、`core/lib/functions2.lib.php` 第 3166 行，可由 `MAIN_URL_FOR_PING` 改網址），內容為實例雜湊與版本；可關閉方式未逐一確認。
- **資安**：`SECURITY.md` 有通報流程；歷年 CVE 不少（老牌 PHP 系統通病），務必跟進穩定版更新、不要把 `install/` 留著、API／MCP 只開 HTTPS。
- **AI 隱私**：有 `PrivacyGuard` 遮罩個資、`aiStripPersonalExtrafields()`、寫入確認碼、每次呼叫記錄 log；但資料仍會送到你選的雲端 LLM。
- **已知的坑**：
  - **沒有真正的 FIFO／LIFO**：`llx_product` 有 `fifo`、`lifo` 欄位，但 `productbatch.class.php` 第 527 行註解 `TODO : use product lifo and fifo when product will implement it`；實際只有加權平均（PMP）。
  - 最低進價只比「折後單價」，不含運費 `charges` 與交期。
  - `develop` 是 alpha 版，請用穩定分支架站。
  - 程式風格老派（全域變數 `$conf`、`$db`、`$mysoc` 到處用），拆程式碼時要把這些依賴換掉。
  - 繁中翻譯不完整：用 Python 比對 zh_TW 與 en_US 同名鍵，16,378 個鍵中約 2,541 個（約 15.5%）的值跟英文完全相同（多數是未翻譯）。

## 10. 跟其他專案組合的建議

- **你的 Firebase 倉儲 App（A）＋ Dolibarr（B，當後台）＋ Claude（C）**：Dolibarr 管供應商、進價、採購；你的 App 管出入庫現場作業。用 Webhook（`PRODUCT_MODIFY`、`ORDER_SUPPLIER_RECEIVE`）推到 Cloud Function 同步到 Firestore；反向用 REST `POST stockmovements` 回寫。Claude Code 透過 Dolibarr MCP 問價、建詢價單。
- **只想要比價邏輯、不想多架一套 PHP**：照第 6 節拆「資料表設計＋最低價演算法＋PMP＋毛利」四件，用 JS 在 Firestore 重做，約幾百行。
- **加上網頁價格追蹤**：Dolibarr 沒有爬蟲。可以搭配本分類的 changedetection.io 或 PriceGhost 一類專案抓競品／供應商網頁價格，再透過 `POST products/{id}/purchase_prices` 寫進 Dolibarr，價格歷史就會自動記錄。
- **加上網頁版 Excel**：Dolibarr 清單頁不是試算表；若要「像 Excel 一樣批次改進價」，可另外用網頁試算表元件（其他資料包中的專案）讀寫 Dolibarr REST API。
- 如果要的是更完整、Python 生態的 ERP，可對照同分類的 ERPNext；要更輕量的庫存系統可對照 InvenTree。

## 11. 價格相關功能檢查表

- **商品與價格資料模型**：**有**。
  - 品項：[`llx_product.sql`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/install/mysql/tables/llx_product.sql)（`price`、`price_ttc`、`price_min`、`cost_price` #L50、`pmp` #L94）。
  - 多單位：部分有。`fk_unit`（#L109）記錄單位、`packaging`（#L114）包裝倍數；供應商端也有 `packaging`。是否有「1 箱 = 12 個」的自動換算 → 未確認。
  - 多幣別／匯率：有，[`multicurrency.class.php#L675`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/multicurrency/class/multicurrency.class.php#L675)，進價、售價、單據都有 `multicurrency_*` 欄位。
  - 價目表／客戶別價格：有，多價格等級＋客戶專屬價＋數量級距，[`getSellPrice()`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/class/product.class.php#L2578-L2680)、[`productcustomerprice.class.php`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/class/productcustomerprice.class.php)。
- **進價：多家供應商報價、比價、詢價單（RFQ）、採購單**：**有**。多家報價＋最低價見 [`find_min_price_product_fournisseur()`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/fourn/class/fournisseur.product.class.php#L970-L1095)；RFQ 見 [`supplier_proposal`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/supplier_proposal/class/supplier_proposal.class.php#L1931-L1966)；採購單在 `htdocs/fourn/commande/`，可由補貨頁自動產生。沒有「並排比較多張詢價單」的專用畫面 → 未確認（只看到商品頁的供應商價格清單）。
- **成本：庫存估值、到岸成本、毛利與定價計算**：**部分有**。
  - 移動平均（PMP）：有，[`mouvementstock.class.php#L588-L615`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/stock/class/mouvementstock.class.php#L588-L615)；庫存估值頁 `product/stock/valo.php`、指定日期庫存 `stockatdate.php`。
  - FIFO：**沒有**（欄位存在但未實作，見第 9 節）。
  - 到岸成本：只有供應商報價上的單一 `charges` 欄位（運費，[`#L38`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/install/mysql/tables/llx_product_fournisseur_price.sql#L38)），**沒有**關稅／雜費按比例分攤到入庫成本的功能。
  - 毛利與定價：有，[`getMarginInfos()`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/margin/lib/margins.lib.php#L119-L161)、價格等級自動推算、動態價格公式。
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知**：**部分有**。
  - 抓網頁價格：**沒有**爬蟲；只有動態價格的「全域變數更新器」能定時抓 JSON／SOAP 數值（[`#L477-L585`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/dynamic_price/class/price_global_variable_updater.class.php#L477-L585)）。
  - 價格歷史：有，進價 log、售價 log、客戶價 log（[`listProductFournisseurPriceLog()`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/fourn/class/fournisseur.product.class.php#L1265)）。
  - 降價通知：**沒有**專用功能（可用 Webhook `PRODUCT_MODIFY` 自己做）。補貨：有警戒量＋補貨清單頁（[`replenish.php`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/stock/replenish.php)），主動 Email 通知 → 未確認。
- **庫存／倉儲**：**有**。多倉庫、入庫（採購收貨）、出庫（出貨）、調撥（`product/stock/stocktransfer/`）、批次大量移動（`massstockmove.php`）、批號／效期、盤點（`product/inventory/`，盤點表含 `pmp_real`／`pmp_expected`）。
  - 跟你的 Firebase 串接：REST API（[`api_products.class.php`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/class/api_products.class.php)、[`api_stockmovements.class.php#L217`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/product/stock/class/api_stockmovements.class.php#L217)）、Webhook（[觸發器](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/core/triggers/interface_95_modWebhook_WebhookTriggers.class.php#L66-L140)）、CSV／XLSX 匯入匯出（[`modProduct.class.php#L843`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/core/modules/modProduct.class.php#L843)）。Firestore 沒有現成連接器，要自己寫 Cloud Function。
- **台灣在地化**：**部分有**。
  - 繁中介面：有，[`htdocs/langs/zh_TW/`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/langs/zh_TW/suppliers.lang) 69 個語系檔（例如 `BuyingPriceMin=最優惠的價格`、`SupplierPrices=供應商價格`），約 15% 未翻譯。
  - 新台幣：有，[`llx_c_currencies.sql#L156`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/install/mysql/data/llx_c_currencies.sql#L156) `TWD`。
  - 台灣稅制：只有營業稅率 0% 與 5%（[`llx_c_tva.sql#L350-L351`](https://github.com/Dolibarr/dolibarr/blob/78e6e8fd3455ba634f5324fd4b5e5d3c1542adce/htdocs/install/mysql/data/llx_c_tva.sql#L350-L351)，國家 id 213＝TW）。沒有台灣會計科目表（`install/mysql/data/` 下沒有 `llx_accounting_account_tw.sql`）。
  - 電子發票（財政部 Turnkey／加值中心、統一發票字軌）：**沒有**（在本次取出的目錄（product、fourn、install、margin 等）以 grep 搜尋 `einvoice`、`turnkey`、`電子發票`、`taiwan` 皆無相關程式；全 repo 檔名清單中也沒有台灣相關檔案）。

## 關鍵字

Dolibarr、ERP、CRM、PHP、MySQL、MariaDB、PostgreSQL、GPL-3.0、供應商報價、多供應商比價、最低進價、find_min_price_product_fournisseur、product_fournisseur_price、詢價單、RFQ、supplier_proposal、採購單、補貨、replenish、加權平均成本、PMP、移動平均、毛利計算、getMarginInfos、多價格等級、客戶別價格、數量級距價格、動態價格公式、EvalMath、匯率同步、Frankfurter、多幣別、新台幣、TWD、營業稅 5%、價格歷史、庫存、多倉庫、盤點、批號、REST API、DOLAPIKEY、Webhook、CSV 匯入、XLSX 匯出、PhpSpreadsheet、AI 模組、Claude、Anthropic、MCP 伺服器、claude mcp add、PrivacyGuard、繁體中文、zh_TW
