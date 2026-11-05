# inventree/InvenTree — 開源庫存／採購管理系統，內建「多供應商價格級距＋多幣別＋BOM 成本」自動計價引擎
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：ec5d632
> GitHub：https://github.com/inventree/InvenTree｜⭐ 7813｜授權：MIT（根目錄與 src/frontend 各有一份 MIT LICENSE）｜主要語言：Python｜最近更新：2026-11-04

> 本文所有 permalink 都固定在 commit `ec5d6324f86d350cc516702e75d565a19aa20a5a`。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** InvenTree 是一套用 Django（Python）＋React 寫的自架型庫存／採購／銷售管理系統，最值錢的是它那套「同一個品項可掛多家供應商、每家有數量級距報價、全部自動換算成本位幣、再算出最低／最高成本」的計價引擎。

對你（台灣小電商、自建 Firebase 倉儲系統、投廣告）實際能拿來做的事：

1. **抄「進價比價」的資料模型**：品項（Part）→ 多個供應商品項（SupplierPart，含 SKU、包裝數量、最小訂購倍數、固定手續費）→ 每個供應商品項多個價格級距（SupplierPriceBreak：買 1 個多少、買 100 個多少）。這套結構可以直接搬進你的 Firestore（一個 collection 對一個 model）。
2. **抄「依數量算價」的演算法**：`get_price()` 只有約 80 行，處理了「訂購倍數無條件進位、找出適用的最大級距、換幣別、加上固定費用」，很適合用 Claude Code 翻成 JavaScript 放進你的倉儲系統。
3. **抄「成本快取＋背景重算」的設計**：InvenTree 不在每次打開頁面時算成本，而是存一張 `PartPricing` 快取表，價格一變就丟背景工作重算，並一路往上更新使用它的組合品（BOM）。你如果要做「組合商品／禮盒成本」就用得到。
4. **抄「Excel／CSV 匯入精靈」**：上傳 CSV/XLSX/TSV → 欄位對應 → 每一列先驗證、顯示錯誤、可逐列修正 → 再寫入資料庫。這是你倉儲系統大量匯入商品／進價時最需要的流程。
5. **直接自架起來當「第二套進貨／庫存記帳」**：用 Docker 跑起來，透過 REST API 跟你的 Firebase 系統互相同步（見第 8 節）。不過它偏向「電子零件／製造業」，對電商的蝦皮、momo 訂單、廣告成本沒有任何概念。

**它不是什麼：** 不是網頁版 Excel（表格只能檢視／篩選／排序／分頁，不能像試算表一樣直接打字編輯儲存格）、沒有任何 AI 功能、不會去網路上爬競品價格、沒有台灣稅制／電子發票。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**。根目錄 `LICENSE` 第一行即為「MIT License, Copyright (c) 2017 - InvenTree Developers」，前端 `src/frontend/LICENSE` 也是同一份 MIT。
- **個人使用**：完全自由，可以改、可以只拿其中一段程式碼。
- **公司商用**：也可以，包含改成閉源、包進你自己販售的系統。唯一義務是**在你的程式碼或散布物中保留原本的著作權聲明與 MIT 授權全文**（例如你把 `get_price()` 翻成 JS，就在檔案開頭註明出處與 MIT 授權）。MIT 沒有專利條款，也不保證任何東西（壞了不負責）。
- **閉源／付費版**：本次掃描的程式碼中**沒有看到「企業版才有」的功能鎖**；外掛系統開放給任何人寫。官方是否有付費託管或支援服務：未確認（不在程式碼裡）。
- **注意第三方套件授權**：後端依賴（`src/backend/requirements.in`）有 `weasyprint`（產 PDF）、`django-money`、`tablib` 等，各自授權不同；如果只拿演算法自己重寫就不受影響，若整包散布則需另外檢查（本次未逐一確認）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容（來源） |
|---|---|
| 後端 | Python + Django（`django<6.0`）、Django REST Framework、`django-money`（金額＋幣別欄位）、`django-mptt`（樹狀分類）、`django-q2`（背景工作佇列）、`pint`（單位換算）、`tablib[xls,xlsx,yaml]`（匯入匯出）、`weasyprint`（PDF 報表）、`django-auditlog`（異動紀錄）。來源：[src/backend/requirements.in](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/requirements.in) |
| 前端 | React 19 + TypeScript + Vite、Mantine UI 9（含 `@mantine/charts` 圖表）、`mantine-datatable`（表格）、TanStack Query、Zustand、Lingui（多語系）、CodeMirror、Tiptap。版本 1.7.0。來源：[src/frontend/package.json](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/frontend/package.json) |
| 資料庫 | PostgreSQL／MySQL／SQLite 三選一（`config_template.yaml` 註解列出 mysql、postgresql、sqlite3）；官方 docker-compose 用 `postgres:17` |
| 快取／佇列 | Redis（`redis:7-alpine`，選用）＋ django-q2 背景 worker |
| 部署 | Docker Compose：postgres、redis、inventree-server、inventree-worker、caddy（反向代理）共 5 個服務。來源：[contrib/container/docker-compose.yml](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/contrib/container/docker-compose.yml)；另有 `contrib/installer`、`contrib/packager.io` 安裝套件 |
| 硬體 | 不需要 GPU。一般小型 VPS 或家裡的 NAS／小主機即可（記憶體需求官方數字未確認，經驗上 2GB 以上較穩，屬推估） |
| API Key／費用 | **不需要任何付費 API Key**。匯率預設呼叫免費的 `https://api.frankfurter.app`（見第 5 節）。自架成本＝主機費 |

**注意**：它**不能**跑在 Firebase Hosting 上（需要 Python 伺服器＋資料庫），要另外找主機。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方法：用 `git ls-tree -r --name-only HEAD` 取得完整清單（共 2,359 個檔案），再用 grep 過濾。

```
InvenTree/
├─ src/backend/InvenTree/          # Django 專案（非 migration 的 .py 共 473 個；migration 檔 204 個）
│  ├─ InvenTree/                   # 核心設定與共用工具
│  │  ├─ settings.py               # 全域設定（Sentry、資料庫、DRF 認證…）
│  │  ├─ tasks.py                  # 背景排程：匯率更新、檢查新版本、備份…
│  │  ├─ exchange.py               # 匯率後端：把匯率抓取交給外掛
│  │  ├─ helpers.py                # 匯出格式清單、CSV 公式注入防護
│  │  └─ api_version.py            # API 版本號（目前 570）
│  ├─ part/                        # 品項、分類、BOM、盤點（models.py 3,738 行）
│  │  ├─ stocktake.py              # 盤點快照＋庫存估值
│  │  └─ tasks.py                  # 低庫存通知、價格重算工作
│  ├─ pricing/                     # 計價引擎（PartPricing 快取、銷售／內部價格級距）
│  ├─ company/                     # 公司（客戶/供應商/製造商）、SupplierPart、SupplierPriceBreak
│  ├─ order/                       # 採購單、銷售單、退貨單、調撥單（models.py 4,502 行）
│  ├─ stock/                       # 庫存項目、庫位、出入庫、合併、盤點
│  ├─ build/                       # 生產工單（組裝）
│  ├─ common/                      # 系統設定、幣別工具、PriceBreak 抽象類、Webhook 接收
│  ├─ importer/                    # CSV/XLSX/TSV 匯入精靈（session → 欄位對應 → 逐列驗證）
│  ├─ data_exporter/               # 任何列表 API 一鍵匯出 CSV/XLSX/TSV
│  ├─ plugin/                      # 外掛系統（26 種 mixin）
│  │  ├─ base/supplier/            # 「供應商查價／匯入」外掛介面
│  │  ├─ base/integration/         # CurrencyExchangeMixin、ScheduleMixin、APICallMixin…
│  │  ├─ builtin/integration/      # 內建：匯率外掛、通知外掛
│  │  ├─ builtin/suppliers/        # DigiKey/Mouser/LCSC/TME（目前只做條碼解析）
│  │  └─ samples/                  # 範例外掛（供應商、匯率、事件、排程…）
│  ├─ report/                      # PDF/標籤報表（Django template + WeasyPrint）
│  ├─ audit/                       # 異動稽核紀錄
│  ├─ machine/                     # 標籤印表機等硬體
│  └─ users/                       # 使用者、角色、API Token
├─ src/frontend/                   # React 前端（src/ 下 .ts/.tsx 共 492 個），也發佈成 npm 套件 @inventreedb/ui
│  ├─ src/components/tables/InvenTreeTable.tsx   # 所有列表共用的表格元件（1,408 行）
│  ├─ src/components/importer/                   # 匯入精靈 UI
│  ├─ src/pages/part/pricing/                    # 品項「價格」分頁（8 個面板）
│  └─ src/locales/zh_Hant/                       # 繁體中文翻譯
├─ contrib/container/              # Dockerfile、docker-compose.yml、Caddyfile、nginx.conf
└─ docs/                           # MkDocs 文件
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

### 5.1 價格級距（Price Break）共用基底
- 位置：[common/models.py#L1447-L1497](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/common/models.py#L1447-L1497)
- 重點：抽象類 `PriceBreak` 只有兩個欄位——`quantity`（起訂數量，最小 1）與 `price`（`MoneyField`，金額＋幣別一起存）。`convert_to(currency_code)` 用 django-money 的 `convert_money` 換匯，缺匯率時回傳 None 並記錄 warning。供應商報價、銷售價、內部價都繼承它。

### 5.2 依數量算單價（最值得抄的一段）
- 位置：[common/currency.py#L162-L243](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/common/currency.py#L162-L243)
- 演算法：
  1. 若數量是整數且要遵守訂購倍數 → `quantity = ceil(quantity / multiple) * multiple`。
  2. 掃所有級距，找出「級距數量 ≤ 購買數量」中最大的那一個，換成目標幣別。
  3. 找不到（買太少）就用最小級距的單價。
  4. `總價 = 單價 × 數量 + base_cost（固定手續費）`。
- 小坑：參數 `moq`（最小訂購量）在註解寫明「CURRENTLY NOT IMPLEMENTED」。

### 5.3 供應商品項與供應商報價
- `SupplierPart`：[company/models.py#L682-L1093](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/company/models.py#L682-L1093)。欄位包含 `SKU`、`supplier`、`primary`（主要供應商）、`base_cost`（固定費，如捲盤費）、`packaging`、`pack_quantity`（一包幾個，可帶單位如「30ml」）、`pack_quantity_native`（換算後的基本單位數量）、`multiple`（訂購倍數）、`available` 與 `availability_updated`（供應商現貨量及更新時間）。`get_price = common.currency.get_price` 直接掛上 5.2 的演算法。
- `SupplierPriceBreak`：[company/models.py#L1096-L1138](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/company/models.py#L1096-L1138)，`unique_together = ('part', 'quantity')`。
- 自動觸發重算：[company/models.py#L1141-L1235](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/company/models.py#L1141-L1235) 用 Django `post_save`／`post_delete` signal，報價一改就呼叫 `part.schedule_pricing_update()`。
- 公司本身也有 `currency`（預設幣別）和 `tax_id`（統編欄位，僅文字）：[company/models.py#L258-L272](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/company/models.py#L258-L272)。

### 5.4 成本快取引擎 PartPricing
- 位置：[pricing/models.py#L37-L82](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L37-L82)（說明：「即時算最低／最高價太貴，所以預先算好快取」）
- 每個品項一筆，存 7 組 min/max：BOM 成本、歷史採購成本、內部價、供應商報價、變體成本、整體成本、銷售價／銷售歷史。
- 各子計算：
  - BOM 成本（組合品＝零件成本加總，可選替代料取最低/最高）：[#L327-L408](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L327-L408)
  - 歷史採購成本（只看「已完成」採購單、已收貨的行，單價除以包裝數；可加入手動輸入的庫存單價，並可限制 N 天內）：[#L410-L477](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L410-L477)
  - 供應商報價範圍（所有供應商所有級距取最低/最高，不考慮數量）：[#L508-L544](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L508-L544)
  - 整體成本（綜合上面各項，可用系統設定決定「歷史採購價是否覆蓋供應商報價」「內部價是否優先」，最後套用手動覆寫值）：[#L584-L651](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L584-L651)
  - 銷售價與銷售歷史：[#L653-L708](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L653-L708)
- 排程與連鎖更新：[#L127-L310](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L127-L310)。`scheduled_for_update` 旗標避免重複排程、`MAX_PRICING_DEPTH = 50` 防止無限遞迴、同一請求內用 session cache 去重；只有 min/max 真的變動時才往上通知組合品與樣板品。
- 銷售價級距、內部價級距：[#L854-L911](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L854-L911)（注意：只有「全體客戶共用」的級距，沒有客戶別價格）。
- API：[pricing/api.py#L53-L108](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/api.py#L53-L108)，掛在 `/api/pricing/`（`part/<pk>/`、`sale-price/`、`internal-price/`）。

### 5.5 多幣別與匯率
- 幣別工具：[common/currency.py#L19-L119](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/common/currency.py#L19-L119)。預設本位幣 USD，預設可用幣別 `AUD,CAD,CNY,EUR,GBP,JPY,NZD,USD`（**不含 TWD**，但設定 `CURRENCY_CODES` 可加入任何 ISO 代碼）。改本位幣時會立即更新匯率並在背景重算所有價格。
- 匯率後端：[InvenTree/exchange.py](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/InvenTree/exchange.py) 找設定 `CURRENCY_UPDATE_PLUGIN` 指定的外掛，否則用第一個啟用的匯率外掛。
- 內建匯率外掛：[plugin/builtin/integration/currency_exchange.py#L13-L49](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/plugin/builtin/integration/currency_exchange.py#L13-L49)，打 `https://api.frankfurter.app/latest`。**frankfurter 是否提供 TWD：未確認**（依我所知其資料來源是歐洲央行參考匯率，可能沒有新台幣，實際請自行測試；若沒有就仿照 [sample_currency_exchange.py](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/plugin/samples/integration/sample_currency_exchange.py) 寫一支抓台銀牌告匯率的外掛，約 20 行）。
- 排程：[InvenTree/tasks.py#L1040-L1095](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/InvenTree/tasks.py#L1040-L1095)，依 `CURRENCY_UPDATE_INTERVAL`（預設 1 天）更新。

### 5.6 採購單、折扣與入庫成本
- 訂單總價：[order/models.py#L125-L247](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/order/models.py#L125-L247)。`TotalPriceMixin` 把每行 `數量 × 換匯後單價 × (1 − 折扣%)` 加總，再加上「額外費用行」（ExtraLine，可放運費、手續費，允許負數當折讓）。
- 行折扣欄位：[order/models.py#L2253-L2260](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/order/models.py#L2253-L2260)。
- 收貨：[order/models.py#L1115-L1300](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/order/models.py#L1115-L1300)，第 1264–1277 行把「採購單價 ÷ 包裝數」寫進新庫存項目的 `purchase_price`，可依 `PURCHASEORDER_CONVERT_CURRENCY` 換成本位幣。**ExtraLine 的運費不會分攤進單位成本**（沒有到岸成本分攤）。

### 5.7 庫存、盤點與估值
- 庫存項目單價：[stock/models.py#L1383-L1390](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/stock/models.py#L1383-L1390)。
- 合併庫存時用**加權平均**算新單價：[stock/models.py#L2883-L2903](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/stock/models.py#L2883-L2903)。
- 單筆盤點 `stocktake()`、入庫 `add_stock()`、出庫 `take_stock()`：[stock/models.py#L3290-L3520](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/stock/models.py#L3290-L3520)，會鎖資料列避免併發、寫追蹤紀錄。
- 分配順序可選 FIFO／LIFO／數量／到期日：[stock/models.py#L407-L424](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/stock/models.py#L407-L424)——**這是「先出哪一批貨」，不是 FIFO 成本法**。
- 定期盤點快照＋庫存價值：[part/stocktake.py#L18-L238](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/stocktake.py#L18-L238)。每個品項：有單價的庫存用自己的單價，沒有的用 `PartPricing.overall_min/max`，乘數量後換成本位幣，存成 `PartStocktake`（[part/models.py#L2630-L2679](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/models.py#L2630-L2679)），等於每天一筆「庫存量＋價值」歷史。

### 5.8 低庫存通知
- `minimum_stock`／`maximum_stock` 欄位：[part/models.py#L1267-L1283](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/models.py#L1267-L1283)；判斷：[#L2598-L2600](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/models.py#L2598-L2600)；寄信通知訂閱者：[part/tasks.py#L32-L157](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/tasks.py#L32-L157)。

### 5.9 匯入／匯出（跟「網頁版 Excel」最接近的部分）
- 解析檔案：[importer/operations.py#L14-L66](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/importer/operations.py#L14-L66)，用 tablib 讀 CSV／XLSX／TSV（格式清單見 [InvenTree/helpers.py#L503-L510](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/InvenTree/helpers.py#L503-L510)）。文字檔先試 UTF-8（含 BOM），失敗退回 cp1252——**不支援 Big5**，台灣 Excel 存的 CSV 要先轉 UTF-8 或直接上傳 XLSX。
- 匯入流程模型：[importer/models.py#L32-L1140](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/importer/models.py#L32-L1140)：`DataImportSession`（一次匯入）→ `DataImportColumnMap`（檔案欄位對應到資料庫欄位）→ `DataImportRow`（每一列的資料、錯誤、是否完成），用 DRF serializer 驗證後才寫入；關聯欄位（如供應商名稱）可自動查找對應 ID。
- 前端：[components/importer/ImportDataSelector.tsx](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/frontend/src/components/importer/ImportDataSelector.tsx)（465 行）把每列畫成表格，儲存格錯誤以紅色提示，點選後用**彈出表單**修正（不是直接在格子裡打字）。
- 匯出：[data_exporter/mixins.py#L202-L509](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/data_exporter/mixins.py#L202-L509)，任何掛上 `DataExportViewMixin` 的列表 API 都能直接匯出，且有 CSV 公式注入防護（`escape_export_value`）。

### 5.10 前端表格與價格頁
- 共用表格：[components/tables/InvenTreeTable.tsx](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/frontend/src/components/tables/InvenTreeTable.tsx)（1,408 行），以 `mantine-datatable` 為基礎，伺服器端分頁／排序／篩選、欄位顯示記憶、列動作選單。屬「資料列表」而非試算表。
- 價格頁 8 個面板：[src/frontend/src/pages/part/pricing/](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/frontend/src/pages/part/pricing/PricingOverviewPanel.tsx)（總覽、BOM 圓餅／長條圖、採購歷史長條圖、供應商報價、級距、變體、銷售歷史），圖表用 `@mantine/charts`。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 數量級距算價 `get_price()` | [common/currency.py#L162-L243](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/common/currency.py#L162-L243) | 只用到 decimal、math 與匯率轉換 | 低 | 請 Claude Code 翻成一支純 JS 函式 `getPrice(breaks, qty, multiple, baseCost, rateFn)`，放進 Firebase 倉儲的報價／進貨畫面 |
| 供應商品項＋報價資料模型 | [company/models.py#L682-L1138](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/company/models.py#L682-L1138) | Django ORM | 低（照抄欄位） | 對應 Firestore：`products/{id}/supplierParts/{id}/priceBreaks/{id}`；保留 pack_quantity、multiple、base_cost、availability_updated |
| 成本範圍彙總規則 | [pricing/models.py#L327-L708](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L327-L708) | Django ORM、django-money | 中 | 改寫成 Cloud Functions：當 priceBreaks 或採購單變動時觸發，寫回 `products/{id}.pricing`（min/max 快取） |
| 價格變動連鎖重算＋防遞迴 | [pricing/models.py#L127-L310](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L127-L310) | django-q2 | 中 | 概念移植：`scheduledForUpdate` 旗標＋深度上限＋「值有變才往上傳」，避免組合品成本無限觸發 |
| 訂單總價（折扣＋額外費用行＋換匯） | [order/models.py#L125-L247](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/order/models.py#L125-L247) | django-money | 低 | 直接翻成 JS，套在你的進貨單；可再自己加「運費依金額分攤到每行」補上缺的到岸成本 |
| 庫存估值快照 | [part/stocktake.py#L18-L238](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/stocktake.py#L18-L238) | Django ORM、tablib | 中 | 用 Firebase 排程函式每天寫一筆 `stockSnapshots/{date}`，做庫存價值走勢圖 |
| 匯入精靈（後端流程） | [importer/models.py](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/importer/models.py)、[importer/operations.py](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/importer/operations.py) | tablib、DRF serializer | 高（與 Django 綁很深） | 只抄流程：上傳 → 欄位對應 → 逐列驗證並存錯誤 → 修正 → 寫入；前端可改用 SheetJS 解析、再接 A 專案的網頁試算表元件做「直接在格子裡修正」 |
| 匯率外掛範本 | [currency_exchange.py](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/plugin/builtin/integration/currency_exchange.py) | requests | 低 | 回傳 `{幣別: 匯率}` 的介面很簡單，可改抓台銀匯率，也能當 Firebase 排程函式的範本 |
| 供應商查價外掛介面 | [plugin/base/supplier/mixins.py#L21-L178](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/plugin/base/supplier/mixins.py#L21-L178) | InvenTree 外掛系統 | 中 | 介面設計可借鏡：`get_search_results(term)`、`get_import_data(id)`、`get_pricing_data(data) -> {數量:(價格,幣別)}`；你可以照這個介面寫「1688／淘寶／批發商查價」轉接器 |
| 價格分頁圖表 UI | [pages/part/pricing/](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/frontend/src/pages/part/pricing/BomPricingPanel.tsx) | React、Mantine | 中 | 只適合參考版面配置；你的系統是純 JS，建議看完重寫成 Chart.js 版 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **完全沒有 AI 功能**。以 `anthropic|openai|llm|mcp|model context protocol` 在 .py/.ts/.tsx/.md/.toml/.yaml 全庫搜尋，**0 筆**命中；沒有 prompt 檔、沒有 MCP server、沒有 Skills。
- 根目錄有 `CLAUDE.md`／`AGENTS.md`（各 5 行），內容只是指向貢獻指南，並聲明不接受 AI 自動產生的 issue／PR——這是給貢獻者的規範，不是功能。
- **能不能接 Claude**：可以從外部接。它有完整 REST API（Token 認證），你可以：
  1. 自己寫一支 MCP server 或 Claude Code Skill，包裝 `/api/part/`、`/api/company/part/`（供應商品項）、`/api/pricing/part/<id>/` 等端點，讓 Claude 回答「這個商品哪家最便宜？」「上個月進價多少？」。
  2. 或寫 InvenTree 外掛（`EventMixin` 監聽事件、`ScheduleMixin` 定時）去呼叫 Claude API，例如自動從供應商報價單 PDF 抽出級距價格。
- 結論：claude_support = 「可接」（需自己寫轉接層）。

## 8. 擴充方式與 API

- **REST API**：DRF 實作，`INVENTREE_API_VERSION = 570`（[InvenTree/api_version.py](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/InvenTree/api_version.py)）。認證方式：API Token、Basic Auth、Session、OAuth2（[InvenTree/settings.py#L564-L574](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/InvenTree/settings.py#L564-L574)）；分頁為 limit/offset。
- **外掛系統**：`PluginMixinEnum` 列出 26 種 mixin（[plugin/plugin.py#L61-L88](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/plugin/plugin.py#L61-L88)；計數方式：數該 enum 中除 `BASE` 外的成員），包含 `currencyexchange`、`supplier`、`events`、`schedule`、`urls`、`ui`（在前端加面板）、`exporter`、`validation`、`api_call` 等。範例在 `plugin/samples/`。
- **事件（對外推送）**：寫一支 `EventMixin` 外掛（[plugin/base/event/mixins.py](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/plugin/base/event/mixins.py)），在 `process_event()` 裡用 HTTP POST 打你的 Firebase Cloud Function，就能做到「InvenTree 一入庫、你的系統就同步」。內建沒有「填網址就推送」的出站 Webhook UI（本次未找到，標為未確認）。
- **Webhook（接收）**：`POST /api/webhook/<endpoint>/`（[common/api.py#L112-L183](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/common/api.py#L112-L183)、路由在 [#L2014](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/common/api.py#L2014)），支援 Token／HMAC 驗證（`common/models.py` 的 `VerificationMethod`）。
- **匯入匯出**：所有主要列表可匯出 CSV/XLSX/TSV；匯入精靈支援同樣格式。
- **前端套件**：`src/frontend` 同時發佈為 npm 套件 `@inventreedb/ui`（`lib/` 目錄），給外掛作者寫 UI 用。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：非常活躍。最後 commit 時間 2026-11-04（就是掃描當天），2017 年開始至今約 9 年；有 backport、docker、frontend、migration_tests、translations、scorecard 等 11 個 GitHub Actions workflow（另 1 個 `.disabled`）。
- **測試**：後端 93 個 `test*.py`、約 2,088 個 `def test_` 函式（以 grep `^\s+def test_` 計數）；前端 27 個 Playwright `.spec.ts`。另有 migration 測試與匯入匯出測試 workflow。
- **資安**：預設所有 API 需登入＋角色權限；匯出有 CSV 公式注入防護；有 `SECURITY.md` 與 threat model 文件；有 MFA、SSO（allauth）、稽核紀錄。
- **遙測／對外連線**：
  - Sentry 錯誤回報**預設關閉**（`INVENTREE_SENTRY_ENABLED` 預設 False），但程式內建一組官方 DSN 作為預設值，開啟後錯誤會送到官方 Sentry（[InvenTree/settings.py#L650-L668](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/InvenTree/settings.py#L650-L668)、[InvenTree/sentry.py#L21-L23](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/InvenTree/sentry.py#L21-L23)）。
  - **預設每 7 天會連 `api.github.com` 檢查新版本**（[InvenTree/tasks.py#L953-L987](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/InvenTree/tasks.py#L953-L987)），設定 `INVENTREE_UPDATE_CHECK_INTERVAL=0` 可關閉。
  - 匯率每天連 `api.frankfurter.app`。
  - OpenTelemetry tracing 預設關閉。
- **已知的坑**：
  1. 本位幣預設 USD、預設幣別清單沒有 TWD，要手動改；frankfurter 是否有 TWD 未確認。
  2. CSV 匯入只認 UTF-8／cp1252，Big5 會失敗。
  3. `get_price()` 的 MOQ 參數未實作。
  4. 成本是「範圍（min/max）」而非會計上的單一成本；沒有 FIFO／移動平均成本法、沒有到岸成本分攤。
  5. `PartPricing` 是背景計算，剛改完價格到畫面更新會有延遲（需要 worker 在跑）。
  6. 架構龐大（`order/models.py` 4,502 行、`part/models.py` 3,738 行），整包客製化門檻高，建議「抄設計、不 fork」。
  7. 領域偏電子零件／製造（DigiKey、Mouser、LCSC、TME 條碼外掛、BOM、生產工單），電商通路（蝦皮、momo、Shopify）完全沒有。

## 10. 跟其他專案組合的建議

- **InvenTree（計價資料模型）＋ 網頁試算表專案（01-web-excel 類，如 Univer／Luckysheet／Handsontable 類）**：用試算表元件做「供應商報價批次編輯」畫面——每列一個 SupplierPart、每欄一個數量級距，存檔時拆成 InvenTree 式的 priceBreaks 結構寫進 Firestore；匯入流程照 InvenTree importer 的「欄位對應＋逐列驗證」設計，但錯誤直接在格子上標紅、直接修改。
- **InvenTree（成本）＋ 你的 Firebase 倉儲**：把 5.2 `get_price()`、5.6 訂單總價、5.7 加權平均翻成 JS 模組，再自行補上「運費／關稅依金額比例分攤」與「毛利率＝(售價−成本)/售價」，就是一套適合小電商的成本計算器。
- **InvenTree（供應商外掛介面）＋ 爬價／價格追蹤類專案**：用爬蟲專案抓 1688、批發網價格，輸出成 `{數量: (價格, 幣別)}` 格式，再寫成 InvenTree `SupplierMixin` 外掛或直接寫進 Firestore，價格歷史就用 Firestore 版本紀錄或 InvenTree 的 audit log。
- **InvenTree（API）＋ Claude（MCP）**：若真的要自架 InvenTree，可寫一個小 MCP server 讓 Claude 查「最便宜供應商」「庫存低於安全量的商品」，再交給 03-video-script 類專案產生補貨促銷影片腳本——但這條路成本高，建議先做前兩項。
- **不建議**：直接拿 InvenTree 取代你自建的倉儲系統——它沒有電商通路串接、需要另外養一台 Python 伺服器，而你的系統已經在 Firebase 上運作。

## 11. 價格相關功能檢查表

- **商品與價格資料模型**
  - 品項：**有**。`Part`（[part/models.py](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/models.py#L464)），含 IPN（內部料號）、分類樹、變體、組合品 BOM。
  - 多單位：**有**。`Part.units` 經 `validate_physical_units`（pint）驗證（[#L1285-L1293](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/models.py#L1285-L1293)），供應商端用 `pack_quantity`／`pack_quantity_native` 換算（例：一箱 24 瓶）。
  - 多幣別／匯率：**有**。金額欄位皆為 MoneyField，匯率外掛每日更新（見 5.5）。
  - 價目表：**有（簡易）**。銷售價級距 `PartSellPriceBreak`、內部價級距 `PartInternalPriceBreak`（[pricing/models.py#L854-L911](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L854-L911)），沒有多張價目表或有效期間。
  - 客戶別價格：**沒有**。銷售價級距只綁品項不綁客戶；只能在銷售單行上手動改價或打折。
- **進價**
  - 多家供應商報價：**有**。一個 Part 多個 SupplierPart，各有數量級距（[company/models.py#L682-L1138](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/company/models.py#L682-L1138)）。
  - 比價：**有（範圍式）**。`update_supplier_cost` 取所有供應商最低／最高價（[pricing/models.py#L508-L544](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/pricing/models.py#L508-L544)）；「指定數量下哪家最便宜」需自己對每家呼叫 `get_price(qty)` 比較，沒有現成比價報表（未確認前端是否有此排序功能）。
  - 詢價單（RFQ）：**沒有**。以 `quotation|rfq|request for quot` 搜尋後端無結果。
  - 採購單：**有**。`PurchaseOrder`／`PurchaseOrderLineItem`／`PurchaseOrderExtraLine`，含折扣、幣別、收貨入庫（[order/models.py#L679](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/order/models.py#L679)、[#L1115-L1300](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/order/models.py#L1115-L1300)）。
- **成本**
  - 庫存估值：**部分**。盤點快照用「各庫存項目的進價 × 數量」，沒進價則用成本範圍（[part/stocktake.py#L157-L189](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/stocktake.py#L157-L189)）。合併庫存時用加權平均（[stock/models.py#L2883-L2903](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/stock/models.py#L2883-L2903)）。**沒有 FIFO 成本法／移動平均成本法**（FIFO 只是出貨揀貨順序）。
  - 到岸成本（運費、關稅、雜費分攤）：**沒有**。ExtraLine 只加進訂單總額，不分攤進入庫單價（[order/models.py#L2319-L2361](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/order/models.py#L2319-L2361)）。
  - 毛利與定價計算：**沒有專門功能**。前端價格頁會並列成本範圍與售價範圍（[PricingOverviewPanel.tsx](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/frontend/src/pages/part/pricing/PricingOverviewPanel.tsx)），但沒有毛利率欄位或「成本加成自動定價」——以 `margin|markup` 搜尋 `pricing/`、`part/models.py`、`order/models.py`、`company/models.py`，0 筆命中。
- **價格追蹤**
  - 抓網頁價格：**沒有內建**。只有 `SupplierMixin` 介面讓你自己寫供應商 API 外掛（[plugin/base/supplier/mixins.py#L21-L178](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/plugin/base/supplier/mixins.py#L21-L178)）；內建的 DigiKey 等外掛只做條碼解析（[digikey.py](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/plugin/builtin/suppliers/digikey.py)）。
  - 價格歷史：**有（間接）**。採購歷史與銷售歷史面板（前端 `PurchaseHistoryPanel.tsx`、`SaleHistoryPanel.tsx`）、`SupplierPriceBreak` 有 `InvenTreeAuditMixin` 會進稽核紀錄、`PartStocktake` 每日價值快照。沒有「供應商報價走勢圖」。
  - 降價／補貨通知：**補貨（低庫存）有、降價沒有**。低於 `minimum_stock` 寄通知給訂閱者（[part/tasks.py#L32-L157](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/part/tasks.py#L32-L157)）。
- **庫存／倉儲**
  - 入庫、出庫、盤點：**有**。`add_stock`／`take_stock`／`stocktake`／`move`／`splitStock`／`merge_stock_items`（[stock/models.py#L2775-L3520](https://github.com/inventree/InvenTree/blob/ec5d6324f86d350cc516702e75d565a19aa20a5a/src/backend/InvenTree/stock/models.py#L2775-L3520)），多層庫位樹、序號、批號、效期、調撥單。
  - 與 Firebase 自建倉儲串接：**可行，需自寫**。(1) 你的 Firebase 端用 API Token 呼叫 InvenTree REST API 拉資料；(2) InvenTree 端寫 `EventMixin` 外掛推到 Cloud Function；(3) InvenTree 接收 Webhook `/api/webhook/<endpoint>/`（需寫對應處理）；(4) 最簡單：雙方都用 CSV／XLSX 匯入匯出。
- **台灣在地化**
  - 繁中介面：**有，但不完整**。前端 `zh_Hant/messages.po` 約 2,544 條中 2,102 條已翻（約 82.6%）；後端 `zh_Hant/django.po` 約 2,670 條中 2,306 條（約 86.4%）。計數方式：自寫 Python 腳本逐條解析 msgid／msgstr，msgstr 非空即算已翻（未特別處理複數形式與 fuzzy，屬近似值）。
  - 新台幣：**可設定**。任何 ISO 4217 代碼都可加入 `CURRENCY_CODES` 並設為本位幣；預設清單沒有 TWD；預設匯率來源是否支援 TWD 未確認。
  - 台灣稅制／電子發票：**沒有**。後端全庫搜尋 `tax` 只找到 `Company.tax_id`（統編文字欄位），沒有營業稅計算、沒有發票字軌、沒有財政部電子發票串接。

## 關鍵字
InvenTree、庫存管理、進銷存、ERP、採購單、銷售單、供應商報價、價格級距、數量折扣、比價、成本計算、BOM 成本、組合品成本、多幣別、匯率、新台幣、盤點、庫存估值、加權平均、低庫存通知、CSV 匯入、Excel 匯入、匯入精靈、REST API、Webhook、外掛、Django、React、Mantine、django-money、PartPricing、SupplierPart、SupplierPriceBreak、PriceBreak、get_price、frankfurter、Docker、自架、MIT
