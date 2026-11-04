# frappe/erpnext — 全功能開源 ERP，進銷存、比價、到岸成本、庫存估值一次到位
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：99ee596
> GitHub：https://github.com/frappe/erpnext｜⭐ 40922｜授權：GPL-3.0（底層框架 Frappe 為 MIT）｜主要語言：Python｜最近更新：2026-11-04

本次掃描範圍：erpnext `develop` 分支 commit `99ee596275abf0f99a74e2792ad4abf194aff16f`（版本字串 `17.0.0-dev`，見 `erpnext/__init__.py`）。另外為了確認 API、MCP、試算表元件，額外讀了同組織的兩個 companion repo：
- frappe/frappe（框架）commit `16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0`
- frappe/datatable（試算表式表格元件）commit `5e2aa9221ff19d3926a7a2c987244688a649759b`

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** ERPNext 是用 Python + Frappe 框架寫的完整 ERP（會計、採購、銷售、庫存、製造），對你最有價值的不是「整套裝起來用」，而是裡面幾塊**已經被全世界幾萬家公司驗證過的成本與價格演算法**。

對你（台灣小老闆、自建 Firebase 倉儲系統、有在下廣告）可以這樣用：

1. **當「演算法教科書」抄邏輯**：FIFO／移動平均庫存估值、到岸成本（運費、關稅分攤到每個品項）、多家供應商報價比價、價格規則（折扣／加成）、毛利計算——這幾段程式碼都很短、純計算，可以請 Claude Code 翻成 JavaScript 放進你的 Firebase 倉儲系統。
2. **個人自架一套當「後台帳本」**：用 Docker 在自己電腦或一台小 VPS 跑起來，拿來做採購比價、進貨成本、毛利報表；你的 Firebase 系統透過 REST API 或 Webhook 跟它同步。
3. **網頁版 Excel 的參考**：Frappe 的「Report View」就是一個可以直接在格子裡改資料、存回資料庫的網頁表格（底層是 MIT 授權的 `frappe-datatable`），而且支援從 Excel／CSV／Google Sheets 匯入匯出——這是你最在意的主題，第 5、6 節有細節。
4. **讓 Claude 直接操作 ERP**：Frappe 框架的 develop 版已內建 MCP 伺服器端點（`/api/v2/mcp`），Claude 可以直接查品項、建採購單（見第 7 節）。

不適合的地方：沒有抓網頁價格／降價通知、沒有台灣電子發票、沒有任何 AI 影片或腳本功能。

## 2. 授權白話

- **ERPNext 本體：GPL-3.0**（`license.txt` 是 GNU GPL v3 全文，`package.json` 與 `erpnext/hooks.py` 第 8 行 `app_license = "GNU General Public License (v3)"`）。
- **底層 Frappe 框架：MIT**（frappe/frappe 的 `LICENSE` 開頭是 The MIT License，`package.json` 也寫 `"license": "MIT"`）。
- **frappe-datatable 表格元件：MIT**（frappe/datatable 的 `LICENSE`）。

**個人使用：** 完全沒問題，裝起來自己用、改程式碼都可以，不用公開任何東西。

**公司商用要注意：**
- 公司內部自己用（不把軟體散布給別人）：GPL 不要求你公開修改後的程式碼。
- 如果你把**含有 ERPNext 程式碼**的軟體賣給或發給別人（例如做成產品給其他店家用），整個衍生作品必須以 GPL-3.0 開源。這是你「A+B+C 組合」時最要小心的：**把 ERPNext 的 Python 程式碼原封不動複製進你的專案，你的專案就會被 GPL 傳染**。比較安全的做法是「看懂演算法後用自己的話重寫」（演算法本身不受著作權保護，但逐行翻譯仍可能被視為衍生作品，商用前建議諮詢律師），或只透過 API 跟它溝通（獨立程式之間用網路 API 溝通，一般不被視為衍生作品）。
- Frappe 框架和 datatable 是 MIT，可以比較自由地拆用，只要保留版權聲明。
- **商標**：`TRADEMARK_POLICY.md` 規定不能把「ERPNext」名稱或 logo 用在你的產品名、公司名、網域，也不能用在廣告（含 AdWords）。你在下廣告，這點要注意。
- **付費版：** 在程式碼裡沒看到「閉源／企業版才有」的功能開關；官方的營利模式是 Frappe Cloud 代管與支援服務（README 有推薦）。是否有其他付費插件：未確認。

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 後端 | Python ≥ 3.14（erpnext `pyproject.toml` 的 `requires-python = ">=3.14"`；Frappe 是 `>=3.14,<3.15`），依賴 Frappe 框架 `>=17.0.0-dev,<18.0.0` |
| 主要 Python 依賴 | `rapidfuzz`、`holidays`、`googlemaps`、`plaid-python`、`mt-940`（銀行對帳單）、`pdfplumber`（PDF 對帳單解析）——見 `pyproject.toml` |
| 資料庫 | MariaDB（主要）與 PostgreSQL（CI 有 `server-tests-mariadb.yml` 與 `server-tests-postgres.yml` 兩套測試），另需 Redis（Frappe `pyproject.toml` 有 `redis`、`hiredis`） |
| 前端 | Frappe Desk（jQuery + Frappe 自家 JS 元件 + Vue 3），表格用 `frappe-datatable 1.22.0`、圖表 `frappe-charts`（見 Frappe `package.json`）。ERPNext 另有兩個新式前端：`banking/`（React 19 + TanStack Table + Tailwind 的銀行對帳 App）、`islands/`（Vue 的專案成本儀表板） |
| 部署 | 官方推薦 Docker（`frappe_docker` 的 `pwd.yml`，埠 8080，帳號 Administrator / admin，README 說這只是試用）；正式環境用 `bench` 工具或 Frappe Cloud 代管 |
| 硬體 | 不需要 GPU。官方最低規格在本 repo 未寫明（未確認）；經驗上 MariaDB + Redis + Python worker + Node 建置，建議至少 2 核 4GB RAM |
| API Key | 都是選用：匯率（預設 frankfurter.dev 免費；也可選 exchangerate.host 需金鑰）、Google Maps（配送路線）、Plaid（銀行串接，台灣不適用）、YouTube（`python-youtube`，影片欄位用） |
| 費用 | 自架軟體 0 元；VPS 大約每月 US$10–20（估計值，未在 repo 驗證）；Frappe Cloud 代管價格未確認 |

## 4. 程式架構地圖

（數字為我用 `git ls-tree -r --name-only HEAD` 取得 5,952 個檔案路徑後，用 `cut -d/ -f1-2 | sort | uniq -c` 統計）

```
erpnext/                      ← 整個 ERP 應用（Frappe app）
├── hooks.py                  ← 應用設定：文件事件、排程（每日自動補貨、匯率重估）
├── accounts/   (1,476 檔)    ← 會計：總帳、發票、付款、價格規則 pricing_rule、毛利報表
├── stock/      (829 檔)      ← 庫存：品項 item、價目 item_price、倉庫、出入庫、盤點、到岸成本、估值
│   ├── valuation.py          ← FIFO / LIFO 佇列演算法（純 Python，276 行）
│   ├── stock_ledger.py       ← 庫存帳核心、移動平均計算、重算（3,286 行）
│   ├── get_item_details.py   ← 下單時自動帶出價格、匯率、單位換算、毛利（2,100 行）
│   └── reorder_item.py       ← 低於安全庫存自動開請購單
├── buying/     (224 檔)      ← 採購：詢價單 RFQ、供應商報價、採購單、供應商評分
│   └── report/supplier_quotation_comparison/ ← 供應商報價比價報表
├── selling/    (325 檔)      ← 銷售：報價、訂單、客戶別價格報表
├── setup/      (267 檔)      ← 公司、幣別、匯率 currency_exchange、安裝精靈（含各國稅率）
├── manufacturing/ (437 檔)   ← BOM、工單（你暫時用不到）
├── controllers/              ← 買賣共用邏輯（buying_controller.py 算進貨估價）
├── regional/                 ← 各國在地化：義大利、阿聯、南非、美國、澳洲、土耳其（沒有台灣）
├── locale/                   ← 翻譯 .po 檔，含 zh_TW.po
├── patches/    (510 檔)      ← 資料庫升級腳本
└── public/、templates/、www/ ← 前端資源與網站頁面
banking/src/  (141 檔)        ← React + TypeScript 銀行對帳 App（含 CSV/PDF 對帳單匯入）
islands/src/  (20 檔)         ← Vue 專案成本儀表板
```

模組規模（用 `erpnext/<模組>/doctype/<名稱>/<名稱>.json` 的檔名模式計數）：全部 536 個 DocType（資料表），其中 accounts 191、stock 78、manufacturing 51、setup 40、selling 20、buying 19；報表 196 份（同樣以 `report/<名稱>/<名稱>.json` 計數）。

## 5. 核心功能怎麼實作

> 下列 permalink 前綴：`E = https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f`

**5.1 供應商報價比價（你最可能直接抄的一塊）**
- 位置：[supplier_quotation_comparison.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/report/supplier_quotation_comparison/supplier_quotation_comparison.py)（342 行）
- `get_data()`（[#L33-L98](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/report/supplier_quotation_comparison/supplier_quotation_comparison.py#L33-L98)）：把「供應商報價單」與明細 join，抓數量、單價、幣別、換算係數、交期（`lead_time_days`）、有效期限（`valid_till`），可用品項、供應商、RFQ、是否過期篩選。
- `get_price_per_stock_unit()`（[#L181-L184](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/report/supplier_quotation_comparison/supplier_quotation_comparison.py#L181-L184)）：**關鍵**——把不同供應商的不同包裝單位（箱、打、個）一律換算成「每個庫存單位的本幣價格」才比較，避免「一箱 500 vs 一個 5 元」比錯。
- `flag_cheapest_quotes()`（[#L173-L178](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/report/supplier_quotation_comparison/supplier_quotation_comparison.py#L173-L178)）：每個品項找最低單價並標記。
- `set_default_supplier()`（[#L334-L342](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/report/supplier_quotation_comparison/supplier_quotation_comparison.py#L334-L342)）：一鍵把最便宜的供應商設成該品項預設供應商。

**5.2 詢價流程 RFQ → 報價 → 採購單 → 入庫**
- RFQ 寄信給多家供應商、供應商可從入口網站自己填報價：[request_for_quotation.py#L200-L215](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/doctype/request_for_quotation/request_for_quotation.py#L200-L215)（`send_to_supplier`）。
- RFQ 轉供應商報價：[request_for_quotation/mapper.py#L17-L56](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/doctype/request_for_quotation/mapper.py#L17-L56)；供應商入口網站送出報價 `create_supplier_quotation`：[#L60](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/doctype/request_for_quotation/mapper.py#L60)。
- 報價轉採購單：[supplier_quotation/mapper.py#L17](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/doctype/supplier_quotation/mapper.py#L17)；採購單轉入庫單：[purchase_order/mapper.py#L31](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/doctype/purchase_order/mapper.py#L31)。
- 這些「A 單轉 B 單」都用 Frappe 的 `get_mapped_doc` 欄位對照表，模式很好學。

**5.3 到岸成本（運費、關稅、雜費分攤）**
- 位置：[landed_cost_voucher.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/landed_cost_voucher/landed_cost_voucher.py)（910 行）
- 分攤方式三選一：依數量 `Qty`、依金額 `Amount`、手動（第 52 行 `distribute_charges_based_on`）。
- `set_applicable_charges_on_item()` + `distribute_charges()`（[#L340-L371](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/landed_cost_voucher/landed_cost_voucher.py#L340-L371)）：總費用 ÷ 總數量（或總金額）= 每單位費用，再乘回每個品項。
- `absorb_rounding_difference()`（[#L703-L713](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/landed_cost_voucher/landed_cost_voucher.py#L703-L713)）：四捨五入差額從最後一筆往回吸收，確保分攤後加總剛好等於總費用——自己寫時最容易漏掉的細節。
- `update_landed_cost()`（[#L513-L556](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/landed_cost_voucher/landed_cost_voucher.py#L513-L556)）：分攤完後「先取消再重過」入庫單的庫存帳與總帳，並重算之後所有出庫成本。
- 進貨單本身的稅費也會算進估價：[buying_controller.py#L723](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/controllers/buying_controller.py#L723)（`update_valuation_rate`）。

**5.4 庫存估值 FIFO／移動平均／LIFO／標準成本**
- 品項可選 `FIFO`、`Moving Average`、`LIFO`、`Standard Cost`：[item.json#L397-L401](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/item/item.json#L397-L401)。
- FIFO 佇列：[valuation.py#L55-L160](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/valuation.py#L55-L160)。資料結構只是 `[[數量, 單價], ...]`，`add_stock` 進貨推到尾端（同價合併），`remove_stock` 從頭端吃掉；還處理了負庫存。**只依賴 `frappe.utils.flt`（一個安全轉浮點數函式），幾乎可以直接翻成 JS。**
- 移動平均：[stock_ledger.py#L2129-L2167](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/stock_ledger.py#L2129-L2167)（`get_moving_average_values`）：新單價 =（原庫存量×原單價 + 進貨量×進貨價）÷ 新庫存量。
- FIFO/LIFO 選擇：[stock_ledger.py#L2177-L2180](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/stock_ledger.py#L2177-L2180)。

**5.5 價格資料模型與自動帶價**
- 價目表 Price List 欄位：`currency`、`buying`、`selling`、`price_not_uom_dependent`、`countries`（我讀 `price_list.json` 列出）。
- 品項價格 Item Price 欄位：`item_code`、`uom`、`packing_unit`、`price_list`、`customer`、`supplier`、`currency`、`price_list_rate`、`valid_from`、`valid_upto`、`batch_no`…（讀 `item_price.json`），而且 `track_changes: 1`（[item_price.json#L270](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/item_price/item_price.json#L270)）——每次改價 Frappe 會留版本紀錄。
- 查價順序：[get_item_details.py#L1399-L1466](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/get_item_details.py#L1399-L1466)（`get_item_price` + `apply_item_price_party_filter` + `apply_item_price_order`）：客戶專屬價優先於一般價、有效日期內、批號優先、最新生效日優先。
- 帶價＋換匯：[get_item_details.py#L1225-L1272](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/get_item_details.py#L1225-L1272)：沒價目時，採購單會回退到「最近一次進價」。
- 單筆毛利：[get_item_details.py#L2027-L2031](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/get_item_details.py#L2027-L2031)：`(售價 − 估值成本) × 數量`。

**5.6 價格規則（折扣、加成、滿額贈）**
- [pricing_rule.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/doctype/pricing_rule/pricing_rule.py)（1,018 行）＋ [utils.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/doctype/pricing_rule/utils.py)（966 行）。
- 可套用在：品項／品項群組／品牌／整張單；對象：客戶、客群、地區、通路、活動、供應商；方式：指定單價、折扣 %、折扣金額、加成 % 或金額、贈品；優先序 1–20（讀 `pricing_rule.json` 的 Select 選項列出）。
- 折扣計算：[pricing_rule.py#L731-L788](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/doctype/pricing_rule/pricing_rule.py#L731-L788)；加成：[#L791-L811](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/doctype/pricing_rule/pricing_rule.py#L791-L811)；優先序排序：[utils.py#L84-L101](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/doctype/pricing_rule/utils.py#L84-L101)。

**5.7 匯率**
- [setup/utils.py#L100-L160](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/setup/utils.py#L100-L160)（`get_exchange_rate`）：先查手動輸入的匯率表 → 查反向匯率取倒數 → 盯住匯率 → 最後打外部 API 並快取。
- 外部來源可選 `frankfurter.dev`、`exchangerate.host`、`Custom`：[currency_exchange_settings.py#L35](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/doctype/currency_exchange_settings/currency_exchange_settings.py#L35)。

**5.8 網頁版 Excel（Frappe 層，你最在意的部分）**
> 前綴：`F = https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0`，`DT = https://github.com/frappe/datatable/blob/5e2aa9221ff19d3926a7a2c987244688a649759b`
- **Report View 可直接在格子改資料**：[report_view.js#L307-L316](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/public/js/frappe/views/reports/report_view.js#L307-L316) 建立 `new DataTable(...)`，傳入 `getEditor`、`inlineFilters: true`、`checkboxColumn: true`；編輯器在 [#L692](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/public/js/frappe/views/reports/report_view.js#L692)（`get_editing_object`，直接用 Frappe 的表單控制項當格子編輯器，所以下拉選單、日期、連結欄位都能用），存檔在 [#L756-L770](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/public/js/frappe/views/reports/report_view.js#L756-L770)（`set_control_value` → `frappe.db.set_value` 單格寫回資料庫）。
- **frappe-datatable 元件**（MIT，src 共 4,266 行，用 `wc -l src/*.js` 計）：[cellmanager.js#L434](https://github.com/frappe/datatable/blob/5e2aa9221ff19d3926a7a2c987244688a649759b/src/cellmanager.js#L434)（`activateEditing` 雙擊或 Enter 進入編輯）、[#L344](https://github.com/frappe/datatable/blob/5e2aa9221ff19d3926a7a2c987244688a649759b/src/cellmanager.js#L344)（`_selectArea` 拖選範圍）、[#L580](https://github.com/frappe/datatable/blob/5e2aa9221ff19d3926a7a2c987244688a649759b/src/cellmanager.js#L580)（`copyCellContents` 複製範圍到剪貼簿）、[#L149](https://github.com/frappe/datatable/blob/5e2aa9221ff19d3926a7a2c987244688a649759b/src/cellmanager.js#L149)（`pasteFromClipboard` 貼上）。預設選項在 [defaults.js](https://github.com/frappe/datatable/blob/5e2aa9221ff19d3926a7a2c987244688a649759b/src/defaults.js)：欄位排序、凍結欄、移除欄、`columnTotal` 合計 hook、`treeView` 樹狀、虛擬捲動（`clusterize`，依賴 `hyperlist`）。**沒有公式引擎**——它是「可編輯資料表」，不是真正的 Excel（沒有 `=SUM(A1:A5)`）。
- **Excel／CSV／Google Sheets 匯入匯出**：[data_import/importer.py#L19-L25](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/core/doctype/data_import/importer.py#L19-L25)（`read_xlsx_file_from_attached_file`、`get_csv_content_from_google_sheets`）、[exporter.py#L9-L10](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/core/doctype/data_import/exporter.py#L9-L10)（`build_xlsx_response`，用 openpyxl）。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| FIFO／LIFO 估值佇列 | [erpnext/stock/valuation.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/valuation.py) | 只有 `frappe.utils.flt` | 低 | 請 Claude 翻成 JS 類別，每個品項＋倉庫存一個 `[[qty, rate]]` 陣列在 Firestore；出庫時呼叫 `removeStock` 得到成本。GPL 注意：建議重寫而非逐行複製 |
| 移動平均公式 | [stock_ledger.py#L2129-L2167](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/stock_ledger.py#L2129-L2167) | 無（純公式） | 低 | 一個 20 行函式，放在 Firebase Cloud Function 的入庫觸發器 |
| 到岸成本分攤＋尾差吸收 | [landed_cost_voucher.py#L340-L371](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/landed_cost_voucher/landed_cost_voucher.py#L340-L371)、[#L703-L713](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/landed_cost_voucher/landed_cost_voucher.py#L703-L713) | 無 | 低 | 做一個「進口費用分攤」網頁小工具：貼上品項清單＋運費關稅，輸出每件到岸成本 |
| 供應商報價比價邏輯 | [supplier_quotation_comparison.py#L101-L184](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/report/supplier_quotation_comparison/supplier_quotation_comparison.py#L101-L184) | 資料查詢依賴 Frappe ORM，計算部分無依賴 | 低～中 | 把「換算成每庫存單位本幣價→標最低」這段搬進你的比價試算表 |
| 品項價格查找順序 | [get_item_details.py#L1399-L1466](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/get_item_details.py#L1399-L1466) | Frappe query builder（pypika） | 中 | 照它的排序規則（客戶價 > 一般價、有效期、最新生效）寫 Firestore 查詢 |
| 價格規則引擎 | [accounts/doctype/pricing_rule/](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/doctype/pricing_rule/pricing_rule.py) | 深度依賴 Frappe 文件模型 | 高 | 只建議參考資料欄位設計（適用對象、優先序、折扣類型）自己簡化實作 |
| 自動補貨 | [erpnext/stock/reorder_item.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/reorder_item.py) | Frappe ORM、排程 | 中 | 改成 Firebase 排程函式：每天比對預計庫存 vs 安全庫存，發 LINE／Email 通知 |
| 可編輯網頁表格 frappe-datatable | [frappe/datatable src/](https://github.com/frappe/datatable/blob/5e2aa9221ff19d3926a7a2c987244688a649759b/src/datatable.js) | `hyperlist`、`lodash`、`sortablejs`；MIT | 低 | 純 JS、不需框架，可直接 npm 引入你的 Firebase 網頁；用 `getEditor` 自訂格子編輯器，存檔時寫 Firestore |
| Report View 的「格子改了就寫回 DB」模式 | [report_view.js#L692-L770](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/public/js/frappe/views/reports/report_view.js#L692-L770) | Frappe 前端 | 中 | 只抄設計：每個格子編輯完→單欄位更新→重新整理該列 |
| Excel／Google Sheets 匯入 | [frappe data_import/importer.py](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/core/doctype/data_import/importer.py) | openpyxl、Frappe | 高 | 不建議拆；參考它的「匯入預覽→欄位對應→逐列驗證」流程 |
| 台灣會計科目表 | [tw_chart_of_accounts.json](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/doctype/account/chart_of_accounts/verified/tw_chart_of_accounts.json) | 無（JSON） | 低 | 1,353 行繁中科目樹（含科目代號），可直接當你記帳功能的科目下拉選單資料 |

## 7. AI／Claude 整合

- **ERPNext 本體：沒有任何 AI 功能。** 我用 `grep -rniE '\b(openai|anthropic|claude|gpt|chatgpt|ai_model|mcp)\b'` 搜 `.py/.ts/.tsx/.js/.json`，0 筆；沒有 prompt 檔、沒有 Skills。
- **Frappe 框架（develop）內建 MCP 伺服器**——這是重點：
  - 端點：`/api/v2/mcp`（[frappe/api/v2.py#L678](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/api/v2.py#L678)），要在 System Settings 開啟 `enable_mcp`，否則回 404（[frappe/mcp/__init__.py](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/mcp/__init__.py)）。
  - 只接受已登入的「系統使用者」、只支援 POST、JSON 回應、無 session 狀態（[transport.py#L29-L60](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/mcp/transport.py#L29-L60)）。
  - 工具：`list_documents`、`get_document`、`count_documents`、`create_document`、`update_document`、`delete_document`（[tools/documents.py](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/mcp/tools/documents.py)）、`call_method`、`call_document_method`（[tools/methods.py](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/mcp/tools/methods.py)）、`search_doctypes`、`get_doctype_schema`、`search_methods`、`get_method_schema`（[tools/discover.py](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/mcp/tools/discover.py)）。
  - 網站管理員可在 System Settings 填 `agent_instructions` 加給 AI 的說明（[protocol.py](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/mcp/protocol.py)）。
  - **能不能用 Claude：可以**，Claude Code／Claude Desktop 以遠端 HTTP MCP 連線，帶 API Key（Frappe 的 `token api_key:api_secret` 驗證方式，未在本次實測）。之後你可以直接對 Claude 說「幫我查 A 品項三家供應商最新報價並開採購單」。
  - 注意：這是 Frappe develop（v17 開發中）才有，穩定版 v15/v16 是否有：未確認。`call_method` 被標記為 `destructiveHint: True`，建議給 Claude 一個權限受限的帳號。

## 8. 擴充方式與 API

- **REST API v1**：`/api/resource/<doctype>`（GET 列表、POST 新增、PUT 更新、DELETE 刪除）、`/api/method/<path>` 呼叫白名單函式（[frappe/api/v1.py#L153-L159](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/api/v1.py#L153-L159)）；另有 `/api/v2/...` 與 `/api/v2/discovery` 自動探索。ERPNext 裡標了 `@frappe.whitelist` 可被 API 呼叫的函式共 863 個（`grep -rn '@frappe.whitelist' erpnext --include=*.py | wc -l`）。
- **Webhook**：任何資料表的新增／更新／送出／取消都可觸發 HTTP POST，支援 JSON 或表單格式、條件式觸發、失敗重試，並可用 HMAC-SHA256 簽章（[webhook.py#L363-L376](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/integrations/doctype/webhook/webhook.py#L363-L376)）。→ 可以把「入庫單送出」推到你的 Firebase Cloud Function。
- **自訂 App**：Frappe 的擴充方式是寫一個獨立 app，在 `hooks.py` 掛 `doc_events`、`scheduler_events`（參考 [erpnext/hooks.py#L415](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/hooks.py#L415) 與 [#L515](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/hooks.py#L515)），不需改 ERPNext 原始碼。
- **不寫程式也能擴充**：Custom Field、Custom Script、Server Script、Print Format、Report Builder（Frappe 內建功能，本次未逐一開檔驗證）。

## 9. 程式品質與風險

- **維護狀況：非常活躍。** 最後推送 2026-11-04（就是掃描當天），40,922 星；`.github/workflows/` 有 23 個 workflow，MariaDB 和 PostgreSQL 各一套伺服器測試；翻譯透過 Crowdin 每日同步。
- **測試：** 以 `/test_*.py` 檔名計數，全 repo 有 581 個測試檔（Python 檔共 3,130 個，含 patches）。
- **遙測：** Frappe 有 Pulse 遙測（[frappe/utils/telemetry/pulse/client.py](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/utils/telemetry/pulse/client.py)），**只有在網站設定裡有 `pulse_api_key` 且 System Settings 開啟 `enable_telemetry`（非 developer mode）時才送出**。ERPNext 安裝精靈會送出公司規模、產業、國家、語言等問卷答案（[setup_wizard.py#L51-L75](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/setup/setup_wizard/setup_wizard.py#L51-L75)）。自架時預設是否有 `pulse_api_key`：未確認（官方 Docker 映像未檢查）。
- **資安：** 外部匯率 API 只允許系統使用者觸發（`setup/utils.py` 第 156–160 行）；webhook 支援簽章；MCP 需登入且限制來源（`check_origin`）。
- **已知的坑：**
  1. **非常重**：MariaDB + Redis + Python worker + 排程 + Node 建置，對一人小公司的維運負擔大；升級大版本常要跑大量 patch（`erpnext/patches/` 有 510 個檔）。
  2. **Python 3.14 起跳**（develop 分支），舊主機可能不能跑；個人試用建議直接 Docker 用穩定版。
  3. **庫存重算（repost）**：回溯修改舊單據會觸發背景重算後面所有估值（`stock_ledger.py` 的 `repost_future_sle`），資料量大時很慢。
  4. **學習曲線**：ERP 概念多（DocType、送出 docstatus、科目、成本中心），新手設定錯會讓報表全錯。
  5. **GPL 傳染**（見第 2 節）。

## 10. 跟其他專案組合的建議

- **ERPNext（成本／比價演算法）＋ 你自己的 Firebase 倉儲**：最務實。拆第 6 節「低」難度的 4 個元件（FIFO、移動平均、到岸成本、報價比價）用 JS 重寫，放在 Cloud Functions。你不用養一套 ERP。
- **＋ frappe-datatable（MIT）當網頁試算表介面**：輕量、純 JS，跟你的「純 JavaScript + Firebase」技術棧最對味；缺公式的話再配一個有公式引擎的試算表專案（例如同系列資料包裡的網頁版 Excel 專案，取其公式引擎）。
- **＋ 價格追蹤專案（如本分類的 changedetection.io、PriceGhost、Discount-Bandit、pricebuddy）**：ERPNext 不會抓網頁價格；讓它們抓到競品／供應商網頁價格後，用 ERPNext REST API 寫入 `Item Price`（`track_changes` 會自動留歷史），或寫入你自己的 Firestore。
- **＋ Claude（MCP）**：如果你真的自架 ERPNext develop 版，開 `enable_mcp`，讓 Claude Code 直接查庫存、比價、開採購單；廣告素材／影片腳本則交給 AI 影片類專案，ERPNext 只提供商品資料（品名、價格、庫存）給它們。
- **跟 Odoo、InvenTree、jshERP 比**：Odoo 社群版是 LGPL 但很多模組在付費企業版；InvenTree 偏零件庫存（MIT）；jshERP 是中文進銷存（較輕）。ERPNext 的優勢是「全部功能都開源」與成本演算法最完整。

## 11. 價格相關功能檢查表

- **商品與價格資料模型：有。** 品項（`item.json`，`uoms` 多單位換算表第 453 行、`has_variants` 規格變體、`barcodes` 條碼）；多幣別與匯率（[currency_exchange.json](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/setup/doctype/currency_exchange/currency_exchange.json) 欄位 `date`、`from_currency`、`to_currency`、`exchange_rate`、`for_buying`、`for_selling`）；價目表（[price_list.json](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/price_list/price_list.json)）；客戶別／供應商別價格（[item_price.json](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/item_price/item_price.json) 的 `customer`、`supplier` 欄位）；另有「客戶別品項價格」報表 [customer_wise_item_price.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/selling/report/customer_wise_item_price/customer_wise_item_price.py)。
- **進價（多家報價、比價、RFQ、採購單）：有。** RFQ [request_for_quotation.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/doctype/request_for_quotation/request_for_quotation.py)（可寄信、供應商入口網站自填）；比價 [supplier_quotation_comparison.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/report/supplier_quotation_comparison/supplier_quotation_comparison.py)（換算單位、標最低價、圖表）；採購單 `buying/doctype/purchase_order/`；另有供應商評分卡 `supplier_scorecard`、最近進價 [buying/utils.py#L14-L50](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/utils.py#L14-L50)。
- **成本（估值、到岸成本、毛利）：有。** FIFO／移動平均／LIFO／標準成本 [valuation.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/valuation.py)；到岸成本 [landed_cost_voucher.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/landed_cost_voucher/landed_cost_voucher.py)（費用明細可填幣別與匯率）；毛利報表 [gross_profit.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/report/gross_profit/gross_profit.py)（1,474 行，`GrossProfitGenerator` 在第 515 行，含退貨、組合商品、代發貨）；定價可用價格規則的「加成 %」。
- **價格追蹤（抓網頁價格、歷史、降價／補貨通知）：部分。** 抓網頁價格：**沒有**（`grep 'BeautifulSoup|scrape'` 只命中無關檔案）。價格歷史：Item Price 開了 `track_changes`，可在版本紀錄看改價；另有「品項採購歷史」報表 [item_wise_purchase_history.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/buying/report/item_wise_purchase_history/item_wise_purchase_history.py)。降價通知：沒有。補貨通知：**有**，每日排程 [reorder_item.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/reorder_item.py) 低於安全庫存自動開請購單並寄 Email（第 213、312 行）。
- **庫存／倉儲：有，且很完整。** 出入庫 `stock_entry`（13 種用途：領料、收料、調撥、組裝拆解等，讀 `stock_entry.json` 的 `purpose` 選項）、盤點 [stock_reconciliation.py](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/stock/doctype/stock_reconciliation/stock_reconciliation.py)、批號序號、54 份庫存報表。**跟 Firebase 串接**：REST API（`/api/resource/Item`、`/api/resource/Stock Entry`）、Webhook（送出單據即推送到你的 Cloud Function，HMAC 簽章）、Data Import（Excel／CSV／Google Sheets 匯入匯出），或 MCP。官方沒有現成 Firebase 連接器。
- **台灣在地化：部分。**
  - 繁中介面：有，[zh_TW.po](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/locale/zh_TW.po)；我用 Python 解析 `.po` 檔計算：12,371 個字串條目中約 11,000 個有譯文（約 89%，含檔頭條目，誤差 ±1）。用語是否道地未逐條檢查。
  - 新台幣：有，Frappe 的 [country_info.json#L2637](https://github.com/frappe/frappe/blob/16ad0668c6878c03dd754e9dd8b8ce1ee29dd7b0/frappe/geo/country_info.json#L2637)：`"currency": "TWD"`、日期格式 `yyyy-mm-dd`、千分位 `#,###.##`、國碼 +886。
  - 稅制：只有安裝精靈預設「Taiwan Tax／VAT 5%」（[country_wise_tax.json#L4978-L4983](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/setup/setup_wizard/data/country_wise_tax.json#L4978-L4983)），加上繁中台灣會計科目表 [tw_chart_of_accounts.json](https://github.com/frappe/erpnext/blob/99ee596275abf0f99a74e2792ad4abf194aff16f/erpnext/accounts/doctype/account/chart_of_accounts/verified/tw_chart_of_accounts.json)。
  - 台灣電子發票（財政部 MIG、Turnkey、載具）：**沒有**。`erpnext/regional/` 只有義大利、阿聯、南非、美國、澳洲、土耳其；義大利的 e-invoice XML 可當做「如何寫一個國家電子發票模組」的範例（`erpnext/regional/italy/`）。社群是否有台灣電子發票 app：未確認。

## 關鍵字
ERPNext、Frappe、ERP、進銷存、開源 ERP、採購比價、供應商報價比較、詢價單、RFQ、Supplier Quotation Comparison、到岸成本、Landed Cost Voucher、運費分攤、關稅分攤、庫存估值、FIFO、先進先出、移動平均、Moving Average、LIFO、價目表、Price List、Item Price、價格規則、Pricing Rule、毛利、Gross Profit、多幣別、匯率、多單位、自動補貨、安全庫存、盤點、Stock Reconciliation、REST API、Webhook、MCP、Claude、frappe-datatable、網頁試算表、可編輯表格、Report View、Excel 匯入匯出、Google Sheets、繁體中文、新台幣、TWD、台灣會計科目、GPL-3.0、MariaDB、Python
