# odoo/odoo — 全功能開源 ERP（進銷存＋會計＋價目表＋到岸成本），內建網頁版試算表引擎 o-spreadsheet
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：6211e5f
> GitHub：https://github.com/odoo/odoo｜⭐ 55539｜授權：LGPL-3.0（社群版；企業版另行收費、不在此 repo）｜主要語言：Python｜最近更新：2026-11-04

> 掃描方式：`git clone --depth 1 --filter=blob:none`，分支 `20.0`，commit `6211e5f4ddecb74c211cca59c8bc8323da5f96b7`。只 sparse checkout 了 product / purchase / purchase_requisition / purchase_alternative / purchase_stock / sale_margin / stock(models) / stock_account / stock_landed_costs / account/models / l10n_tw / l10n_tw_edi_ecpay / spreadsheet / rpc / api_doc / base_import / base_automation 等目錄；其餘模組只看檔案清單（`git ls-tree`）。另外因為使用者最在意網頁版 Excel，額外淺層 clone 了同組織的 companion repo **odoo/o-spreadsheet**（分支 20.0，commit `01aeeba88a48688b6243d800e8c4cd9d4f236ffd`，正好就是 odoo 內嵌那份打包檔標示的 hash `01aeeba88`）。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Odoo 是全世界最大的開源 ERP 之一，把「商品／價目表／採購詢價／比價／庫存／成本估值／到岸成本／會計／台灣電子發票」全部做在同一個 Python＋PostgreSQL 系統裡；它也內建了一套獨立可拆的**網頁版試算表引擎 o-spreadsheet**。

這位使用者可以拿它做：

1. **當「價格與成本邏輯的教科書」**：你自建的倉儲系統（Firebase＋純 JS）如果要加「客戶別價格、數量折扣、依成本加成定價、多幣別」，Odoo 的價目表規則（`product.pricelist.item`）幾乎就是業界標準答案，可以直接請 Claude Code 把它的計算順序翻成 JavaScript。
2. **進貨比價**：「替代詢價單（Alternative RFQ）」模組會把同一張需求發給多家供應商，再逐品項比「總價最低、單價最低、交期最早」，演算法只有約 50 行，非常好搬。
3. **到岸成本分攤**：進口貨的運費、關稅、報關雜費，可按「數量／重量／材積／目前成本／平均」五種方式分攤到每個品項，算出真正的進貨成本。這段（約 75 行）是很適合拆到自家系統的「成本計算機」。
4. **網頁版 Excel**：Odoo 內嵌的 o-spreadsheet（LGPL-3.0、TypeScript、npm 套件 `@odoo/o-spreadsheet`）有 335 個公式函數、即時多人協作、xlsx 匯入匯出，可以**不裝 Odoo**、單獨嵌進你的 Firebase 網頁。這是本資料包對「網頁版 Excel」最重要的發現。
5. **台灣在地化**：有台灣會計科目、5% 營業稅、401/403/404 申報表格式、以及透過**綠界 ECPay** 開立電子發票（含手機條碼、自然人憑證、悠遊卡、一卡通載具、捐贈碼）的模組。
6. **直接自架來用**：個人或小公司可以裝社群版，用它的「採購＋庫存＋銷售＋會計」跑整套流程，再用 JSON-2 API 或 Webhook 跟你自己的 Firebase 系統互通。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- GitHub 偵測為 NOASSERTION，是因為 `LICENSE` 檔開頭先寫了一段說明再附全文。實際內容：「Odoo is published under the GNU LESSER GENERAL PUBLIC LICENSE, Version 3 (LGPLv3)」（[LICENSE](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/LICENSE)）；`odoo/release.py` 也寫 `license = 'LGPL-3'`（[release.py#L35](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/odoo/release.py#L35)）；各模組 `__manifest__.py` 也都標 `'license': 'LGPL-3'`。
- **個人使用**：完全可以，自架、修改都不用付費、不用公開程式碼。
- **公司商用**：可以免費商用。LGPL 的重點是：如果你**修改了 Odoo 本身的檔案並散布給別人**（例如賣給客戶、讓別人下載），被修改的那部分要以 LGPL 公開；只在自己公司內部用、或寫獨立的外掛模組通常不受影響。把 Odoo 的程式碼「抄進」你自己的專案（例如把 Python 翻成 JS）屬於衍生作品，嚴格講該部分也應以 LGPL 釋出——個人用無妨，未來若要對外販售，建議只參考「演算法思路」自己重寫，或把搬過來的部分獨立成 LGPL 的檔案。
- **o-spreadsheet**：同樣 LGPL-3.0-or-later（`package.json` 的 `license` 欄位），以 npm 套件形式引用屬於「連結使用」，商用相對安全。
- **付費版（Odoo Enterprise）**：不在此 repo。從檔案清單可確認社群版**沒有** `spreadsheet_edition`、`documents_spreadsheet`、`currency_rate_live`（自動抓匯率）等模組（以 `grep` 檔案清單計數為 0）。也就是說：社群版有試算表「引擎」與「儀表板檢視」（`spreadsheet`、`spreadsheet_dashboard_*`），但「在 Odoo 裡新建／編輯試算表文件」的完整應用一般認知是企業版功能（此點本次未從企業版原始碼驗證，屬未確認）。另外社群版也沒有 AI 模組（見第 7 節）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容（來源） |
|---|---|
| 後端 | Python，版本限制 `MIN_PY_VERSION = (3, 12)`、`MAX_PY_VERSION = (3, 14)`（[release.py#L39-L40](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/odoo/release.py#L39-L40)）；自家 ORM（`odoo.models`、`fields`） |
| 資料庫 | PostgreSQL（`requirements.txt` 指定 `psycopg2==2.9.9/2.9.10`） |
| 前端 | 自家框架 OWL（`addons/web/static/lib/owl`）、Bootstrap、Chart.js、luxon 等（看 `addons/web/static/lib/` 目錄清單） |
| 試算表 | o-spreadsheet（TypeScript，打包成 `addons/spreadsheet/static/src/o_spreadsheet/o_spreadsheet.js`，約 3.2 MB，版本 20.0.6） |
| Excel 讀寫（後端） | `openpyxl`、`xlrd`、`XlsxWriter`（requirements.txt） |
| PDF 報表 | `reportlab`（requirements.txt）；wkhtmltopdf 是否必要：未確認 |
| 部署 | `odoo-bin` 啟動；repo 內有 `setup/debinstall.sh`、`setup/docker/` 打包腳本。Odoo 官方另有 Odoo.sh / 線上 SaaS（付費，不在 repo 內） |
| 硬體 | 一般 VPS 即可（2 核 4GB 起跳是常見做法，屬經驗值未在 repo 驗證），**不需要 GPU** |
| API Key | 核心功能不需要任何 AI Key。台灣電子發票需要**綠界 ECPay 的 MerchantID／HashKey／HashIV**（[res_company.py#L10-L12](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw_edi_ecpay/models/res_company.py#L10-L12)），費用依綠界方案 |
| 費用 | 社群版軟體 0 元；成本只有伺服器（每月約幾百到一千多台幣的 VPS）。注意它比你現在的 Firebase 架構重很多，需要自己維運 PostgreSQL |

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

整個 repo 有 50,847 個檔案（`git ls-tree -r --name-only HEAD | wc -l`）；`addons/` 底下有 646 個模組（數 `addons/*/__manifest__.py`），其中 233 個是 `l10n_*` 各國在地化模組；全 addons 下的測試 Python 檔共 2,508 個（數 `addons/*/tests/*.py`）。

```
odoo/                       （repo 根目錄，分支 20.0）
├── odoo-bin                啟動程式
├── requirements.txt        Python 依賴（psycopg2、openpyxl、xlrd…）
├── odoo/                   核心框架：ORM、HTTP、服務
│   ├── release.py          版本 20.0、授權 LGPL-3、Python 3.12–3.14
│   ├── tools/config.py     設定檔（含遙測 publisher_warranty_url）
│   └── addons/base/        最底層模組：res.currency 匯率換算、ir.actions（Webhook 動作）…
├── addons/                 646 個業務模組
│   ├── product/            商品、變體、單位、價目表（pricelist）、供應商報價（supplierinfo）
│   ├── purchase/           詢價單 RFQ → 採購單 PO、從供應商報價帶入單價
│   ├── purchase_alternative/  ★多家供應商替代詢價、逐品項比價
│   ├── purchase_requisition/  採購協議：長期合約（blanket order）、採購範本
│   ├── purchase_stock/     採購 × 庫存：補貨規則自動產生 RFQ
│   ├── sale/、sale_margin/ 銷售單、毛利與毛利率（可反推售價）
│   ├── product_margin/     商品別平均進價／售價／毛利分析
│   ├── stock/              倉庫、儲位、調撥單（入出庫）、盤點（stock.quant）、補貨點
│   ├── stock_account/      ★庫存估值：標準成本／移動平均 AVCO／FIFO
│   ├── stock_landed_costs/ ★到岸成本分攤（運費、關稅…）
│   ├── account/            會計、稅、發票、幣別
│   ├── l10n_tw/            ★台灣會計科目、5% 營業稅、401/403/404 申報表、TWD、城市資料
│   ├── l10n_tw_edi_ecpay*/ ★綠界電子發票（含 POS、銷售、電商版本共 4 個模組）
│   ├── spreadsheet/        ★o-spreadsheet 引擎＋Odoo 專用公式（ODOO.PIVOT、ODOO.LIST、ODOO.CURRENCY.RATE）
│   ├── spreadsheet_dashboard*/  用試算表做的各種儀表板（銷售、庫存估值…）
│   ├── rpc/                XML-RPC、JSON-RPC、JSON-2 API 端點
│   ├── api_doc/            /doc 線上 API 文件頁
│   ├── base_import/        CSV／xls／xlsx／ods 匯入
│   ├── base_automation/    自動化規則，包含「收到 Webhook 時觸發」
│   └── web/                前端框架與第三方函式庫
└── setup/
    ├── docker/、debinstall.sh  打包腳本
    └── sandboxing/         ★給開發者用的 AI 程式助理沙箱設定（bwrap-claude.sh、firejail/claude.profile）
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5-1 價目表規則（最值得學）**
- 規則欄位：[product_pricelist_item.py#L88-L155](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist_item.py#L88-L155)。`base` 決定起算基準：售價 `list_price`／成本 `standard_price`／另一張價目表 `pricelist`；`compute_price` 有 `discount`、`markup`、`fixed` 三種；另有 `price_round`（四捨五入到倍數，可做「結尾 .99」）、`price_surcharge`（加減固定金額）、`price_min_margin`／`price_max_margin`（最低／最高毛利保護）、`min_quantity`（數量門檻）、`uom_id`（指定包裝單位）。
- 套用條件：[`_is_applicable_for` #L488-L544](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist_item.py#L488-L544)，依序檢查單位、最小數量、適用範圍（全部／商品分類含子分類／商品／變體）。
- 計算公式：[`_compute_price` #L546-L606](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist_item.py#L546-L606)：價格 = 基準價 ×(1−折扣%) → 進位 → ＋附加費 → 夾在 [基準價＋最低毛利, 基準價＋最高毛利] 之間。基準價計算與換匯在 [`_compute_base_price`／`_convert_price` #L608-L652](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist_item.py#L608-L652)，支援「價目表套價目表」的遞迴（另有 `_check_pricelist_recursion` 防無限迴圈）。
- 找規則：[`_compute_price_rule` #L159-L206](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist.py#L159-L206) 與 [`_get_applicable_rules_domain` #L295-L352](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist.py#L295-L352)：先用資料庫查詢粗篩（日期、商品、數量），再逐條精篩。
- 客戶別價格：[`_get_partner_pricelist_multi` #L421-L460](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist.py#L421-L460)：客戶指定的價目表 → 依國家群組 → 預設。

**5-2 供應商報價與自動選供應商**
- 資料表 `product.supplierinfo`：供應商、供應商料號、最小數量、單價、折扣、幣別、有效期間、交期天數（[product_supplierinfo.py#L14-L58](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_supplierinfo.py#L14-L58)）。
- 選擇邏輯：[`_get_filtered_sellers`／`_select_seller` product_product.py#L1270-L1323](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_product.py#L1270-L1323)。**坑**：它先依 `sequence` 取「第一家供應商」，只在該供應商的多筆報價中挑折後價最低（換算公司幣別）——並不是跨所有供應商自動挑最便宜。跨供應商比價要用 5-3。
- 採購單行自動帶價：[`_compute_price_unit_and_date_planned_and_name` purchase_order_line.py#L545-L590](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase/models/purchase_order_line.py#L545-L590)，沒有供應商報價時改用成本價並換匯。
- 採購單狀態：`draft`(RFQ) → `sent` → `to approve` → `purchase` → `cancel`（[purchase_order.py#L108-L114](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase/models/purchase_order.py#L108-L114)）。

**5-3 替代詢價單比價（purchase_alternative）**
- 模組說明：「compare product lines across RFQs… selecting the best combination of lead time, OTD and/or total amount」（[__manifest__.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase_alternative/__manifest__.py)）。
- 比價畫面：[`action_compare_alternative_lines` #L96-L111](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase_alternative/models/purchase.py#L96-L111) 把所有替代 RFQ 的明細依商品分組列出。
- 演算法：[`get_tender_best_lines` #L113-L163](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase_alternative/models/purchase.py#L113-L163)：對每個商品找出「公司幣別小計最低」「換算成基本單位後單價最低」「預計到貨日最早」三組最佳行，平手全部保留。幣別統一用 `price_total_cc = price_subtotal / currency_rate`（[#L176-L181](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase_alternative/models/purchase.py#L176-L181)）。`action_choose`（#L198 起）選定後把其他家同品項數量清零。

**5-4 庫存估值**
- 成本法選項：`standard`、`average`（[account/models/product.py#L52-L57](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/account/models/product.py#L52-L57)），`stock_account` 再加入 `fifo`（[stock_account/models/product.py#L21-L23](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_account/models/product.py#L21-L23)）。
- 移動平均重算：[`_run_avco` #L375 起](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_account/models/product.py#L375-L420)；FIFO：[`_run_fifo` #L509 起](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_account/models/product.py#L509-L540)、`_get_fifo_stack`（#L657）。v20 的做法是「從最後一次手動調價點開始重播入出庫異動」，可算任意日期的估值。
- 成本調整歷史：`product.value` 記錄每次手動改成本的舊／新單價、使用者、時間（[product_value.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_account/models/product_value.py)）。

**5-5 到岸成本**
- 分攤方式 `SPLIT_METHOD`：equal、by_quantity、by_current_cost_price、by_weight、by_volume（[stock_landed_cost.py#L10-L16](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_landed_costs/models/stock_landed_cost.py#L10-L16)）。
- 計算：[`get_valuation_lines` #L168-L243](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_landed_costs/models/stock_landed_cost.py#L168-L243)：先彙總入庫品項的數量／重量／材積／原成本，再按比例分攤，每行四捨五入，**最後一行吸收尾差**，確保分攤總額等於費用總額。可只分攤到指定商品（`apply_on_product_ids`）。
- 從供應商帳單一鍵產生到岸成本：`button_create_landed_costs`（[stock_landed_costs/models/account_move.py#L21](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_landed_costs/models/account_move.py#L21)），商品勾選 `landed_cost_ok` 即視為費用類。

**5-6 毛利與反推售價**
- [sale_margin/models/sale_order_line.py#L42-L103](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/sale_margin/models/sale_order_line.py#L42-L103)：成本取商品 `standard_price` 換單位與幣別；毛利 = 小計 − 成本×數量；**改毛利率時反推售價**：`price = cost / ((1 − margin%) × discount)`。

**5-7 網頁版 Excel：o-spreadsheet**
- Odoo 端只放打包好的檔案：[o_spreadsheet.js](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/spreadsheet/static/src/o_spreadsheet/o_spreadsheet.js)（3,238,354 bytes，標頭寫明「generated by o-spreadsheet build tools… @see https://github.com/odoo/o-spreadsheet… @version 20.0.6」）。依賴只有 OWL。
- 原始碼在 companion repo：`Model` 類別 [src/model.ts#L92](https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/model.ts#L92)；即時協作 [src/collaborative/session.ts](https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/collaborative/session.ts)（加上 `ot/` 操作轉換、`revisions.ts`）；公式函數在 `src/functions/module_*.ts`。
- **函數數量**：以 `grep -E '^export const [A-Z0-9_]+(: AddFunctionDescription)? = \{'` 數 15 個 `module_*.ts`，共 **335 個**（統計 65、數學 61、財務 49、日期 32、文字 28、陣列 23、查找 20〔含 VLOOKUP、XLOOKUP、INDEX、MATCH、PIVOT〕、運算子 16、資料庫 12、資訊 11、邏輯 11、篩選 4 等）。查找類見 [module_lookup.ts#L589-L680](https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/functions/module_lookup.ts#L589-L680)。
- xlsx：companion repo 檔案清單有 `src/xlsx/xlsx_reader.ts`、`src/xlsx/conversion/*`（格式、條件格式、資料驗證、公式、表格轉換）與 `src/xlsx/functions/*`（匯出）——本次只看清單、未開檔。
- Odoo 擴充公式範例：[currency/formulas.js](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/spreadsheet/static/src/currency/formulas.js) 用 `functionRegistry.add("ODOO.CURRENCY.RATE", {...})` 註冊自訂函數；另有 `ODOO.LIST`、`ODOO.LIST.VALUE`（[list_functions.js#L100-L102](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/spreadsheet/static/src/list/list_functions.js#L100-L102)）、`ODOO.FILTER.VALUE`（[pivot_functions.js#L100-L102](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/spreadsheet/static/src/pivot/pivot_functions.js#L100-L102)）。→ 你可以用同樣方式註冊 `FIREBASE.STOCK("SKU001")` 這類函數，讓試算表直接讀你的庫存。
- 儲存格式：試算表以 JSON 存在 `spreadsheet_binary_data` 欄位（[spreadsheet_mixin.py#L25-L31](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/spreadsheet/models/spreadsheet_mixin.py#L25-L31)），上傳 xlsx 時也會辨識（#L34 起 `_check_spreadsheet_data`）。這種「整份 JSON 存一個欄位」的設計很適合放進 Firestore 文件或 Storage。

**5-8 台灣電子發票（綠界）**
- [utils.py `call_ecpay_api` #L51](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw_edi_ecpay/utils.py#L51)：正式／測試網址 `einvoice.ecpay.com.tw` / `einvoice-stage.ecpay.com.tw`（#L16-L17），資料先 URL encode 再 AES-CBC 加密、base64，回應反向解密。B2B／B2C 走不同路徑。
- 發票欄位：載具類型（綠界載具、自然人憑證、手機條碼、悠遊卡、一卡通）、捐贈碼、通關方式、零稅率原因、折讓（[account_move.py#L35-L166](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw_edi_ecpay/models/account_move.py#L35-L166)）；開立、作廢、折讓、列印分別在 `_l10n_tw_edi_send`（#L700）、`_l10n_tw_edi_run_invoice_invalid`（#L762）、`_l10n_tw_edi_issue_allowance`（#L802）、`_l10n_tw_edi_print_invoice`（#L841）。外幣發票自動換成新台幣（`_l10n_tw_edi_convert_currency_to_twd` #L371）。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| o-spreadsheet 網頁試算表 | [odoo/o-spreadsheet src/model.ts](https://github.com/odoo/o-spreadsheet/blob/01aeeba88a48688b6243d800e8c4cd9d4f236ffd/src/model.ts) | `@odoo/owl`、bootstrap、rbush（package.json） | 低～中 | 本身就是獨立 npm 套件 `@odoo/o-spreadsheet`，可嵌進純 JS 頁面；用 `functionRegistry.add` 加自訂函數讀 Firebase；資料存 JSON |
| 價目表計算引擎 | [product_pricelist_item.py#L546-L652](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist_item.py#L546-L652) | ORM、uom、currency | 中 | 請 Claude 翻成純 JS 函式 `computePrice(rule, product, qty, uom)`；規則表放 Firestore collection |
| 多家報價比價 | [purchase_alternative/models/purchase.py#L113-L163](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase_alternative/models/purchase.py#L113-L163) | 只用到明細的小計、數量、單位、到貨日 | 低 | 純演算法，50 行即可改寫成 JS；輸入「各供應商報價陣列」輸出最佳價／最佳單價／最快交期 |
| 到岸成本分攤 | [stock_landed_cost.py#L168-L243](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_landed_costs/models/stock_landed_cost.py#L168-L243) | 只需數量／重量／材積／原成本 | 低 | 做成「進口成本計算機」頁面；記得保留最後一行吸收尾差的作法 |
| 毛利反推售價 | [sale_order_line.py#L60-L103](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/sale_margin/models/sale_order_line.py#L60-L103) | 無 | 低 | 幾行公式，可放進你的商品編輯頁 |
| 供應商報價資料模型 | [product_supplierinfo.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_supplierinfo.py) | 無 | 低 | 當 Firestore schema 參考（供應商、料號、最小量、價、幣別、期間、交期） |
| FIFO／移動平均估值 | [stock_account/models/product.py#L375-L657](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_account/models/product.py#L375-L657) | stock.move、ORM、會計 | 高 | 邏輯綁很深，建議只參考「重播異動」思路自行實作 |
| 綠界電子發票串接 | [l10n_tw_edi_ecpay/utils.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw_edi_ecpay/utils.py) ＋ [account_move.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw_edi_ecpay/models/account_move.py) | `cryptography`、`requests` | 中 | 加解密部分可搬到 Firebase Cloud Functions（Node 用 `crypto` AES-128-CBC）；欄位對照可照抄 |
| 台灣會計科目／稅別 | [l10n_tw/data/template/account.tax-tw.csv](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw/data/template/account.tax-tw.csv) | 無 | 低 | CSV 直接當資料參考（三聯式／二聯式／收銀機發票 5% 稅別） |
| Excel／ODS 匯入解析 | [base_import/models/base_import.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/base_import/models/base_import.py) | xlrd、openpyxl、odf | 中 | 參考欄位自動對應（suggested mapping）設計 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **社群版沒有任何 AI 功能**：在完整檔案清單中搜尋 `openai|chatgpt|llm|anthropic|claude|generative` 等關鍵字，除了國旗圖 `ai.png` 與下面的沙箱設定外沒有命中；沒有 `ai` 模組、沒有 MCP、沒有 prompt 檔。Odoo 的 AI 功能（若有）應在企業版或線上服務中，本次未確認。
- **跟 Claude 有關的只有開發工具**：`setup/sandboxing/` 提供用 bubblewrap／Firejail 把 Claude Code 等 AI 程式助理關在沙箱裡的腳本（[README](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/setup/sandboxing/README.md)，含 `bwrap/bwrap-claude.sh`、`firejail/claude.profile`），代表 Odoo 官方開發者自己在用 Claude Code。o-spreadsheet repo 根目錄也有一份 `CLAUDE.md`（給開發者用的說明，本次視為資料未依其指示行動）。
- **能不能接 Claude**：可以，而且很自然——
  1. 用 JSON-2 API（第 8 節）讓 Claude（或你寫的 MCP server）以 API Key 呼叫 `product.product/search_read`、`purchase.order/create` 等，就能「用自然語言查庫存、開詢價單」。
  2. 在 o-spreadsheet 用 `functionRegistry.add` 註冊 `CLAUDE("幫我寫商品標題", A2)` 這種公式，透過你的後端呼叫 Claude API。o-spreadsheet README 也有「Connecting to an external API」章節。

## 8. 擴充方式與 API

- **模組化擴充**：每個功能就是一個含 `__manifest__.py` 的資料夾，用 `_inherit` 覆寫模型方法（例：l10n_tw 用 `@template('tw')` 擴充會計範本，[template_tw.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw/models/template_tw.py)）。
- **JSON-2 API（推薦）**：`POST /json/2/<model>/<method>`，`auth='bearer'`（API Key），參數 `ids`、`context` 與方法參數（[rpc/controllers/json2.py#L48-L80](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/rpc/controllers/json2.py#L48-L80)）。任何模型的公開方法都能呼叫。
- **舊版 XML-RPC／JSON-RPC**：`/xmlrpc/2/<service>`、`/jsonrpc`（[xmlrpc.py#L139-L158](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/rpc/controllers/xmlrpc.py#L139-L158)、[jsonrpc.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/rpc/controllers/jsonrpc.py)）。
- **線上 API 文件**：`/doc`、`/doc/<model>.json`（[api_doc.py#L39-L53](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/api_doc/controllers/api_doc.py#L39-L53)），會列出每個模型的欄位與方法。
- **Webhook 進**：自動化規則 trigger `on_webhook`，網址 `<base_url>/web/hook/<uuid>`（[base_automation.py#L272-L278](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/base_automation/models/base_automation.py#L272-L278)），執行在 `_execute_webhook`（#L594）。
- **Webhook 出**：伺服器動作 `state='webhook'`「Send Webhook Notification」，可選要送出的欄位（[ir_actions.py#L596、#L687-L693](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/odoo/addons/base/models/ir_actions.py#L687-L693)）。→ 例如「入庫驗收完成」就 POST 到你的 Firebase Cloud Function。
- **匯入匯出**：支援 CSV、xls、xlsx、ods（[base_import.py#L44-L49](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/base_import/models/base_import.py#L44-L49)），價目表與供應商報價都有匯入範本（`get_import_templates`）。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：極活躍，掃描當天仍有 push；官方公司 Odoo S.A. 維護，一年一個大版本（目前預設分支 20.0）。
- **測試**：addons 底下共 2,508 個測試 Python 檔；本次看的模組：account 81、sale 37、stock 32、product 17、purchase 13（數 `addons/<模組>/tests/` 下檔案）。台灣電子發票也有 `tests/test_edi.py`。
- **遙測（要注意）**：`mail` 模組的 `publisher_warranty` 會定期把資料 POST 到 `http://services.odoo.com/publisher-warranty/`（預設網址見 `odoo/tools/config.py` 第 243 行），內容包含資料庫 UUID、名稱、使用者數、活躍使用者數、已安裝應用、網址、語言，以及**公司名稱、Email、電話**（[mail/models/update.py#L25-L70](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/mail/models/update.py#L25-L70)）。在意隱私可在設定檔改 `publisher_warranty_url` 或停用相關排程。
- **資安**：ECPay 金鑰欄位限 `base.group_system` 才能讀；綠界折讓同意回呼路由是 `auth="public", csrf=False`（[controllers/main.py#L11](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw_edi_ecpay/controllers/main.py#L11)），靠 `access_token` 驗證。JSON-2 API 任何公開方法都能叫，API Key 權限要控管好。
- **已知的坑**：
  1. `_select_seller` 不是跨供應商挑最便宜（見 5-2）。
  2. 社群版沒有自動抓匯率（`currency_rate_live` 不在 repo），匯率要手動輸入或自己寫排程。
  3. 系統很重，646 個模組、版本間 API 常變（例如 v20 的 `Domain` 物件、估值重寫），升級成本高。
  4. o-spreadsheet 在 Odoo 裡是 3.2 MB 的打包檔，要改請改 companion repo 原始碼。
  5. 台灣電子發票只支援綠界一家（以檔案清單 `l10n_tw_edi_*` 確認），用其他加值中心要自己寫。

## 10. 跟其他專案組合的建議

- **你的 Firebase 倉儲 ＋ o-spreadsheet**：最推薦。把 o-spreadsheet 當「網頁版 Excel」嵌進現有網頁，自訂 `STOCK()`、`COST()`、`PRICE()` 等公式直接讀 Firestore，就有能算公式、能匯出 xlsx、能多人協作的報表頁，而且不用安裝 Odoo。可以和其他網頁試算表專案（如 Univer、Luckysheet、x-spreadsheet 類）放在一起比較：o-spreadsheet 的優勢是 LGPL、有樞紐分析、有協作與 xlsx。
- **你的 Firebase ＋ Odoo 演算法（翻成 JS）**：把「價目表規則」「多家比價」「到岸成本」「毛利反推」四塊改寫成 JS 模組，資料結構照 Odoo 的欄位設計，就能在你的系統內加上 ERP 等級的查價／比價／成本功能。
- **Odoo 自架當後台 ＋ 你的前台**：若之後業務變複雜（會計、電子發票），可以讓 Odoo 當主系統，你的 Firebase 頁面透過 JSON-2 API 讀寫、用 Webhook 同步。
- **＋ AI 影片／腳本專案**：Odoo 本身沒有 AI；可以把 Odoo 商品資料（名稱、規格、價格、圖片）透過 API 餵給另一個「用 Claude 產生商品影片腳本」的專案，當作電商廣告素材的資料來源。
- **＋ 價格追蹤爬蟲專案**：Odoo 沒有抓網頁價格；可用其他爬蟲專案抓競品價格，寫回 Odoo 的 `product.supplierinfo` 或你的 Firestore，再套 Odoo 式的比價邏輯。

## 11. 價格相關功能檢查表

- **商品與價格資料模型**：**有**。商品／變體、單位（`uom`，價目表規則可指定包裝單位）、多幣別換算 `res.currency._convert`（[res_currency.py#L356](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/odoo/addons/base/models/res_currency.py#L356)）、價目表（[product_pricelist_item.py#L88-L155](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist_item.py#L88-L155)）、客戶別價格（[product_pricelist.py#L421-L460](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_pricelist.py#L421-L460)）。匯率需手動維護（社群版無自動匯率模組）。
- **進價：多家供應商報價、比價、詢價單、採購單**：**有**。供應商報價表（[product_supplierinfo.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product/models/product_supplierinfo.py)）、RFQ→PO 狀態流程（[purchase_order.py#L108-L114](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase/models/purchase_order.py#L108-L114)）、替代詢價逐品項比價（[purchase_alternative/models/purchase.py#L113-L163](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase_alternative/models/purchase.py#L113-L163)）、長期合約價（blanket order 確認後自動建立供應商報價，[purchase_requisition.py#L317-L330](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/purchase_requisition/models/purchase_requisition.py#L317-L330)）。
- **成本：庫存估值、到岸成本、毛利與定價**：**有**。標準／AVCO／FIFO（[stock_account/models/product.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_account/models/product.py)）；到岸成本五種分攤（[stock_landed_cost.py#L10-L16](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_landed_costs/models/stock_landed_cost.py#L10-L16)）；銷售毛利與反推售價（[sale_margin](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/sale_margin/models/sale_order_line.py#L60-L103)）；價目表可「以成本為基準加成＋最低毛利保護」定價；商品毛利分析報表 `product_margin`（[product_product.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/product_margin/models/product_product.py)）。
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知**：**抓網頁價格：沒有**（在 product、purchase、purchase_alternative、sale、stock、stock_account 內 `grep "requests.get|requests.post"` 無結果）。**價格歷史：部分有**——成本調整歷史 `product.value`（[product_value.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock_account/models/product_value.py)），售價變動是否有歷史表：未確認。**降價通知：沒有**。**補貨**：有補貨點規則 `stock_orderpoint.py`（自動產生 RFQ），屬補貨建議而非對外通知；電商「到貨通知」是否存在：未確認。
- **庫存／倉儲＋與 Firebase 串接**：**有**。入出庫調撥單驗收 `button_validate`（[stock_picking.py#L1197](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock/models/stock_picking.py#L1197)）、盤點 `inventory_quantity`／`action_apply_inventory`（[stock_quant.py#L473](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/stock/models/stock_quant.py#L473)）。串接 Firebase：JSON-2 API（[json2.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/rpc/controllers/json2.py#L48-L80)）讀寫；進出 Webhook（[base_automation.py#L278](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/base_automation/models/base_automation.py#L272-L278)、[ir_actions.py#L687](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/odoo/addons/base/models/ir_actions.py#L687-L693)）；CSV／xlsx 匯入匯出（[base_import.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/base_import/models/base_import.py#L44-L49)）。
- **台灣在地化**：**有**。繁中介面：全 repo 共 399 個 `i18n/zh_TW.po`（數檔案清單），product、purchase、stock、sale、stock_landed_costs、purchase_alternative、spreadsheet、l10n_tw_edi_ecpay 都有。新台幣：`base.TWD` 設定（[res_currency_data.xml](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw/data/res_currency_data.xml)）。台灣稅制：5% 營業稅（三聯式、二聯式、收銀機發票等稅別，[account.tax-tw.csv](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw/data/template/account.tax-tw.csv)）、401／403／404 申報表（[l10n_tw __manifest__.py](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw/__manifest__.py)）、台灣城市資料 `res.city.csv`（372 行）。電子發票：**有**，透過綠界 ECPay（[l10n_tw_edi_ecpay](https://github.com/odoo/odoo/blob/6211e5f4ddecb74c211cca59c8bc8323da5f96b7/addons/l10n_tw_edi_ecpay/__manifest__.py)），另有 POS、銷售、電商三個延伸模組（`l10n_tw_edi_ecpay_pos`、`_sale`、`_website_sale`，看檔案清單）。

## 關鍵字
Odoo、ERP、開源 ERP、進銷存、價目表、pricelist、客戶別價格、數量折扣、供應商報價、supplierinfo、詢價單、RFQ、採購單、purchase order、替代詢價、比價、purchase_alternative、call for tender、到岸成本、landed costs、運費分攤、關稅、庫存估值、FIFO、移動平均、AVCO、毛利、margin、定價、盤點、倉儲、多幣別、匯率、JSON-2 API、XML-RPC、Webhook、xlsx 匯入、網頁版 Excel、試算表、o-spreadsheet、樞紐分析、即時協作、台灣在地化、l10n_tw、營業稅、401 申報、電子發票、綠界、ECPay、載具、LGPL-3.0、Python、PostgreSQL、OWL
