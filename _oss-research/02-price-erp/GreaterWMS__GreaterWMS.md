# GreaterWMS/GreaterWMS — 開源倉儲管理系統（Django REST＋Quasar），入庫→上架→揀貨→出貨→盤點流程完整，附 PDA 掃碼 App

> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：8344f38
> GitHub：https://github.com/GreaterWMS/GreaterWMS｜⭐ 4431｜授權：Apache-2.0｜主要語言：Python｜最近更新：2026-10-26

> 本文所有 permalink 都以 commit `8344f3872155d75acce5c5d5d7d95b5b8e18dfc1` 為準（HEAD 提交訊息為「GreaterWMS_定制化开发 V2.1.54」，提交時間 2026-10-13）。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：一套完整的「倉庫作業流程」開源系統——到貨通知（ASN）→ 卸貨 → 分揀 → 上架到儲位 → 出貨單（DN）→ 自動配儲位揀貨 → 派車 → 簽收（POD），加上循環盤點、庫存 13 種狀態欄位，以及 Zebra / 東集 / iData PDA 掃碼 App。

**對你（自建倉儲點貨系統的台灣小老闆）最有價值的地方：**

1. **借鏡「庫存狀態拆欄位」的資料模型**：它不是只有一個「庫存量」，而是把同一個品項拆成在途（asn_stock）、待卸貨、待分揀、已分揀、在架（onhand）、可訂（can_order）、已訂、待揀、已揀、欠貨（back_order）、損壞、凍結、待檢等欄位（見 §5）。你的點貨系統若要做「缺貨登記／待送清單」，這是很好的欄位設計範本。
2. **借鏡「單據狀態機」**：ASN 有 1→5 五個狀態、DN 有 1→6 狀態，每次狀態前進都同步搬動庫存欄位。你可以把這套流程翻成 Firestore／Apps Script 的狀態轉換規則。
3. **借鏡「依儲位先進先出揀貨＋自動拆欠貨單」**：出貨放行時依儲位庫存建立順序自動配揀貨單，不夠就自動開一張 back order 新單（§5）。
4. **借鏡「運費比價」**：建立 ASN／DN 時，會用「出發城市→目的城市」去查所有物流商的費率表，按 重量×單價 vs 體積×單價 vs 最低收費 取最大值，列出每家物流商的運費（這是本專案唯一真正的「比價」功能）。
5. **借鏡 Excel/CSV 匯入匯出**：後端用 pandas 讀 xlsx/csv 匯入商品／供應商／客戶／運費；用 `djangorestframework-csv` 串流匯出 CSV，欄位標題支援中文。

**不適合拿來做的事**：查網路價格、價格追蹤、供應商報價比較、採購單、會計／毛利報表——這些它都沒有。它也**不是網頁版 Excel**（只是 Quasar `q-table` 列表＋單列編輯，見 §5）。

> 備註：任務背景說你的系統在 Firebase；我在你目前 repo 的 `app.js` 看到的是 GitHub Pages 前端＋`CONFIG.API_URL` 指向 Google Apps Script、掃碼用 `Html5Qrcode`。下面「怎麼接」兩種後端都會提。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：Apache-2.0**（已打開 `LICENSE` 檔確認，README 最後也寫 Apache 2.0）。
- **個人使用**：完全可以，隨便改、隨便部署。
- **公司商用**：可以，包含改了不公開也可以。要做的只有：保留原本的 LICENSE／著作權聲明；如果你改了原始檔要註明有修改；如果有 NOTICE 檔要一起保留（本 repo 未看到 NOTICE 檔）。Apache-2.0 另外附帶專利授權條款。
- **付費／閉源版**：
  - README 頂部宣傳「GreaterWMS 3.0 已用 Bomiot（Rust 核心、外掛市集）重寫」，並導向 bomiot.com 與 `pip install bomiot`。**本 repo 裡的程式碼仍是 2.x 版 Django 架構**（`settings.py` 裡 API 版本寫 `2.1.48`），3.0 的程式不在這個 repo，授權條件**未確認**。
  - README「Contact」寫有客製開發／商務合作聯絡方式；繁中語系檔裡有一個 `app_store: '商用授權'` 字串，但我在 `templates/src` 的 .vue/.js 裡找不到有地方用到它（用 grep 搜 `app_store` 只出現在 i18n 檔）。
  - 結論：**本 repo 的 2.x 功能沒有被鎖在付費版後面**；但官方的新版與客製服務走商業路線。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容（皆已開檔確認） |
|---|---|
| 後端 | Python + Django 4.1.2 + Django REST Framework 3.14、django-filter、drf-spectacular（自動產生 Swagger/Redoc API 文件）、pandas 1.5.1＋openpyxl（Excel 匯入）、djangorestframework-csv（CSV 匯出）、PyJWT、daphne（ASGI 伺服器，含 WebSocket）。版本見 [`requirements.txt`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/requirements.txt) |
| 前端（網頁） | `templates/`：Quasar 1.x（Vue 2）、axios、echarts、dexie（IndexedDB，但只存圖表暫存）、qrcode、vue-print-nb（列印）。見 [`templates/package.json`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/templates/package.json) |
| 前端（手機/PDA） | `app/`：Quasar 2（Vue 3）＋ Vite，打包成 Android App（Cordova 外掛 `intentShim` 接 Zebra DataWedge）。見 [`app/package.json`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/app/package.json) |
| 資料庫 | 預設 SQLite（[`settings.py#L103-L111`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/greaterwms/settings.py#L103-L111)）；README 說也可用 MySQL／PostgreSQL |
| 部署 | `daphne -b 0.0.0.0 -p 8008 greaterwms.asgi:application`；或 `docker-compose.yml`（前端 8080、後端 8008）；前端 API 位址寫在 `templates/public/statics/baseurl.txt`（預設 `http://127.0.0.1:8008`） |
| 硬體／GPU | 不需要 GPU；一台小 VPS 或公司內一台電腦就能跑 |
| API Key／費用 | **不需要任何外部 API Key**，無雲端付費服務；只有主機費 |


## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree` 全檔共 1,172 個；`settings.py` 中 `*.apps.*Config` 的 Django app 共 **30 個**；所有 `*/urls.py` 中 `path(`／`re_path(` 宣告共 **158 行**（含根路由的 include）；排除 migrations 與 `static_new/` 的 Python 共 **15,761 行**（`wc -l`）；網頁版 Vue 頁面 `templates/src/pages/*/*.vue` 共 **76 個**；PDA App 頁面 **20 個**。

```
GreaterWMS/
├─ greaterwms/          # Django 專案設定：settings.py、urls.py（根路由＋Swagger）、asgi.py（HTTP＋WebSocket 分流）
├─ utils/               # 共用：auth.py（token 驗證）、jwt.py、datasolve.py（運費計算、輸入檢查）、throttle.py（限流）、websocket.py（站內訊息）、fbmsg.py（多語錯誤訊息）
├─ goods/               # 商品主檔（含成本 goods_cost、售價 goods_price、尺寸重量、條碼、安全庫存）
├─ goodsunit/ goodsclass/ goodsbrand/ goodscolor/ goodsshape/ goodsspecs/ goodsorigin/  # 商品屬性字典（單位、類別、品牌…）
├─ supplier/ customer/  # 供應商、客戶（只有名稱、城市、地址、聯絡人、等級）
├─ warehouse/           # 倉庫主檔
├─ binset/ binsize/ binproperty/  # 儲位、儲位尺寸、儲位屬性（Normal/Holding/Damage/Inspection）
├─ asn/                 # 入庫：到貨通知 ASN 主檔＋明細、卸貨/分揀/上架 狀態流程、CSV 匯出
├─ dn/                  # 出庫：出貨單 DN、放行配揀、揀貨單、派車、簽收 POD、欠貨單
├─ stock/               # 庫存總表 stocklist（13 種狀態欄位）＋儲位庫存 stockbin、移庫
├─ cyclecount/          # 循環盤點（每日自動清單／手動盤點）、數量異動紀錄 QTYRecorder
├─ payment/             # 物流運費費率表（出發城市、到達城市、每公斤／每立方單價、最低收費、物流商）
├─ capital/             # 固定資產（名稱、數量、金額）
├─ driver/              # 司機、派車紀錄
├─ dashboard/           # 近 14 天入庫金額／出貨金額 echarts 資料
├─ uploadfile/          # Excel/CSV 匯入（初始化＝清空重灌、追加匯入）
├─ scanner/             # 條碼對照表（bar_code → 單據/商品），PDA 掃碼查詢
├─ staff/ userlogin/ userregister/ userprofile/ company/ throttle/  # 員工、登入註冊、多租戶 openid、限流紀錄
├─ templates/           # 網頁版前端（Quasar 1 / Vue 2）原始碼 src/ 與已編譯 dist/spa/
│   └─ src/pages/       # inbound/ outbound/ stock/ goods/ warehouse/ uploadcenter/ downloadcenter/ finance/ dashboard/ …
├─ app/                 # PDA／手機 App（Quasar 2 / Vue 3），ScanAPP.vue 接 Zebra/東集/iData 掃描頭
├─ Dockerfile、docker-compose.yml、supervisord.conf、backend_start.sh、web_start.sh
└─ .github/workflows/   # ci.yml、security.yml、release-drafter.yml
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**(1) 多租戶與登入驗證**
- [`utils/auth.py#L4-L17`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/utils/auth.py#L4-L17)：每個請求讀 header `token`，直接拿去比對 `Users.openid`。也就是說 **openid 就是永久的 API token**，所有資料表都有 `openid` 欄位做租戶隔離。
- [`utils/permission.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/utils/permission.py)：`has_permission` 一律 `return True`——**沒有角色權限控管**，員工類型（Manager/Inbound…）只是標籤。
- 前端 [`templates/src/boot/axios_request.js`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/templates/src/boot/axios_request.js) 把 `token`（openid）、`operator`（員工 id）、`language` 放進每個請求的 header。

**(2) 商品主檔（含價格）**
- [`goods/models.py#L3-L27`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/goods/models.py#L3-L27)：`goods_code`、`goods_desc`、長寬高、`unit_volume`、`goods_weight`、`goods_unit`（單一文字欄位）、`safety_stock`、**`goods_cost`（成本）、`goods_price`（售價）**、`bar_code`。價格都是 FloatField、**沒有幣別欄位**。

**(3) 庫存：一品項多狀態欄位（最值得借鏡）**
- [`stock/models.py#L3-L30`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/stock/models.py#L3-L30)：`StockListModel` 欄位：`goods_qty`（總量）、`onhand_stock`、`can_order_stock`、`ordered_stock`、`inspect_stock`、`hold_stock`、`damage_stock`、`asn_stock`、`dn_stock`、`pre_load_stock`、`pre_sort_stock`、`sorted_stock`、`pick_stock`、`picked_stock`、`back_order_stock`。
- [`stock/models.py#L32-L50`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/stock/models.py#L32-L50)：`StockBinModel` 記「哪個儲位放了多少、已配揀多少、已揀多少」。

**(4) 入庫 ASN 狀態機：1 建單 → 2 已到貨待卸 → 3 待分揀 → 4 已分揀待上架 → 5 完成**
- 建單號：[`asn/views.py#L91-L115`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/asn/views.py#L91-L115)，格式 `ASN`+`YYYYMMDD`+流水號，並在 scanner 表登記條碼（MD5）。
- 加明細＋**運費比價**：[`asn/views.py#L186-L299`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/asn/views.py#L186-L299)。每行計算 重量/1000、體積、成本＝`goods_cost`×數量；接著用「供應商城市→倉庫城市」查 `payment` 費率表，對每家物流商呼叫 `transportation_calculate`，把結果存成 ASN 的 `transportation_fee` JSON。
- 狀態推進：卸貨 [`#L525-L552`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/asn/views.py#L525-L552)（asn_stock→pre_load_stock）、分揀 [`#L587-L610`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/asn/views.py#L587-L610)（→pre_sort_stock）、實收確認 [`#L648-L713`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/asn/views.py#L648-L713)（比對應收 vs 實收，自動算短少 `goods_shortage_qty`／多收 `goods_more_qty`，並同步調整成本）。
- 上架到儲位：[`asn/views.py#L816-L975`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/asn/views.py#L816-L975)。依儲位屬性把數量加到 damage／inspect／hold／can_order 不同欄位；建立 `stockbin` 紀錄、寫一筆 `QTYRecorder` 異動紀錄、順便產生當天的循環盤點清單、把儲位的 `empty_label` 改成非空。

**(5) 出庫 DN：放行時自動配儲位（先進先出）＋自動欠貨單**
- [`dn/views.py#L629-L671`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/dn/views.py#L629-L671)：可揀量 = `onhand - inspect - hold - damage - pick`；儲位庫存以 `bin_property="Normal"`、`order_by('id')` 排序（＝越早上架的儲位紀錄越先揀，近似 FIFO）。逐儲位產生 `PickingListModel` 揀貨單；不夠的數量自動開一張 `DN` 新單號、`back_order_label=True` 的欠貨單（後續段落一路到約 L980）。
- 注意：DN 明細的「成本」實際是拿 `goods_price`（售價）× 數量（[`dn/views.py` 第 220 行附近](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/dn/views.py#L215-L245)），所以 DN 的 total_cost 其實是銷售金額。
- 出貨也做運費比價（倉庫城市→客戶城市）：[`dn/views.py#L248-L273`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/dn/views.py#L248-L273)。
- 派車 `DnDispatchViewSet`：[`dn/views.py#L1817`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/dn/views.py#L1817)；簽收 `DnPODViewSet`：[`#L1907`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/dn/views.py#L1907)。

**(6) 運費計算公式（比價核心，只有 7 行）**
- [`utils/datasolve.py#L109-L115`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/utils/datasolve.py#L109-L115)：`max(重量×每公斤價, 體積×每立方價, 最低收費)`，四捨五入到小數 2 位。費率表結構見 [`payment/models.py#L3-L14`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/payment/models.py#L3-L14)。

**(7) 循環盤點**
- [`cyclecount/models.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/cyclecount/models.py)：`QTYRecorder`（每次數量異動）、`CyclecountModeDayModel`（每日盤點清單，含 `physical_inventory`、`difference`）、`ManualCyclecountModeModel`（手動盤點）。
- [`cyclecount/views.py#L102-L125`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/cyclecount/views.py#L102-L125)：`create` 是一次填實盤數；`update` 是「掃一次加一次」累加實盤數，差異＝實盤－帳面。

**(8) Excel/CSV 匯入匯出（跟「試算表」最相關的部分）**
- 匯入：[`uploadfile/views.py#L53-L75`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/uploadfile/views.py#L53-L75)：依副檔名 `pd.read_csv` / `pd.read_excel`，用中／英文欄位標題對照（[`goods/files.py#L27-L50`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/goods/files.py#L27-L50)），逐欄把 `nan` 補成 `N/A` 或 0。「初始化匯入」會**先清空**舊資料；另有 `*fileadd/` 追加匯入。前端用 Quasar `q-uploader` 直接 POST（[`templates/src/pages/uploadcenter/addupload.vue`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/templates/src/pages/uploadcenter/addupload.vue)）。
- 匯出：[`goods/views.py#L317-L369`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/goods/views.py#L317-L369)：`CSVStreamingRenderer` 串流輸出 CSV，依 `language` header 切換中／英文欄名。ASN、DN、庫存、盤點也各有 `FileDownloadView`。
- 網頁上的「表格」：[`templates/src/pages/goods/goodslist.vue`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/templates/src/pages/goods/goodslist.vue) 用 Quasar `q-table`，點「編輯」後那一整列變成 `q-input`（`props.row.id === editid` 判斷）——**不是儲存格式的試算表**，沒有公式、拖曳填滿、多格選取、複製貼上。
- repo 裡附了一份 SheetJS `templates/src/components/xlsx.full.min.js`（檔頭版本字串 0.17.4，約 952KB），但唯一的引用在 [`initializeupload.vue#L58`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/templates/src/pages/uploadcenter/initializeupload.vue#L58) 是**被註解掉的**，實際沒用到。

**(9) 條碼與 PDA 掃碼**
- [`scanner/models.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/scanner/models.py)：`mode`（ASN/DN/GOODS/BINSET…）、`code`、`bar_code`。所有單據／商品／儲位建立時都寫一筆，掃碼時用 `GET /scanner/list/<bar_code>/` 反查是什麼東西（[`scanner/views.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/scanner/views.py)）。
- PDA App：[`app/src/pages/ScanAPP.vue#L117-L127`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/app/src/pages/ScanAPP.vue#L117-L127) 透過 `window.plugins.intentShim.sendBroadcast` 控制 Zebra DataWedge；東集（seuic）聽 `getcodedata` 事件、iData 聽 `idatadata` 事件（[`#L257-L283`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/app/src/pages/ScanAPP.vue#L257-L283)），統一寫進隱藏 input 再觸發 `input` 事件。

**(10) 儀表板**：[`dashboard/views.py#L88-L89`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/dashboard/views.py#L88-L89) 用 `ExtractMonth/ExtractDay` + `Sum('goods_cost')` 做近 14 天每日入庫金額，直接回 echarts `dataset` 格式。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 庫存多狀態欄位設計 | [stock/models.py#L3-L50](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/stock/models.py#L3-L50) | 無（概念） | 低 | 照欄位清單在 Firestore／Google 試算表開同名欄位；用 Claude Code 把「每個動作加減哪幾欄」寫成 JS 函式 |
| ASN 收貨差異計算（應收/實收/短少/多收） | [asn/views.py#L648-L713](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/asn/views.py#L648-L713) | Django ORM | 低（邏輯簡單，翻寫即可） | 直接對應你的「點貨」：預期數 vs 點到數 → 自動產生缺貨登記 |
| 依儲位 FIFO 配揀＋自動欠貨單 | [dn/views.py#L629-L671](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/dn/views.py#L629-L671) | Django ORM、stockbin | 中（約 350 行巢狀 if，需重寫） | 你的「待送清單」可加：依上架時間挑儲位、不足自動拆一張欠貨單 |
| 運費比價公式 | [utils/datasolve.py#L109-L115](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/utils/datasolve.py#L109-L115)＋[payment/models.py](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/payment/models.py) | 無 | 低 | 改成台灣：黑貓／新竹／7-11 店到店的「材積 vs 重量 vs 起價」表，算出每張單最便宜的物流 |
| 循環盤點（逐次累加實盤＋差異） | [cyclecount/views.py#L102-L125](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/cyclecount/views.py#L102-L125) | Django ORM | 低 | 對應你的「大盤點」：掃一下 +1，顯示 差異＝實盤－帳面 |
| 數量異動流水帳 QTYRecorder | [cyclecount/models.py](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/cyclecount/models.py) | 無 | 低 | 每次加減庫存都 append 一筆（單號、儲位、品項、數量、操作人），方便追帳 |
| Excel 匯入（中英文標題對照＋空值補齊） | [uploadfile/views.py#L53-L75](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/uploadfile/views.py#L53-L75)、[goods/files.py](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/goods/files.py) | pandas、openpyxl | 中 | 前端可改用 SheetJS 在瀏覽器解析，再呼叫你的 API；「標題對照 dict」思路可直接沿用 |
| CSV 串流匯出（中文欄名） | [goods/views.py#L317-L369](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/goods/views.py#L317-L369) | djangorestframework-csv | 低 | 只有 Python 後端才用得上；JS 端改用前端產生 CSV/xlsx |
| PDA 掃描頭整合（Zebra DataWedge／東集／iData） | [app/src/pages/ScanAPP.vue#L61-L283](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/app/src/pages/ScanAPP.vue#L61-L283) | Cordova + intentShim 外掛 | 中 | 若哪天買工業 PDA（硬體掃描鍵）就有參考價值；手機鏡頭掃碼繼續用你現在的 Html5Qrcode |
| 條碼反查表 scanner | [scanner/models.py](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/scanner/models.py) | 無 | 低 | 一張表把「任何條碼」對到「單據/商品/儲位」，掃一下就能自動跳到對的頁面 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **完全沒有 AI 功能**。我用 grep 搜尋 `openai|anthropic|claude|llm|gpt|prompt` 等關鍵字（.py/.js/.vue），沒有 AI 相關程式；也沒有 MCP、Skills 或 prompt 檔。
- **能不能接 Claude**：可以從外部接。它有完整 REST API ＋ drf-spectacular 自動 OpenAPI 文件（`/api/`、`/api/docs/`、`/api/debug/`，見 [`greaterwms/urls.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/greaterwms/urls.py)），可以請 Claude Code 依 OpenAPI 生出一個 MCP server，讓 Claude 用自然語言查庫存、建 ASN。但這需要自己寫。

## 8. 擴充方式與 API

- **REST API**：每個模組都是 DRF `ModelViewSet`，路徑如 `/goods/`、`/asn/list/`、`/asn/detail/`、`/dn/orderrelease/`、`/stock/list/`、`/stock/bin/`、`/cyclecount/`、`/scanner/list/<bar_code>/`。所有 `*/urls.py` 合計 158 行 `path`/`re_path` 宣告。驗證方式：header `token: <openid>`，寫入動作另需 `operator: <員工 id>`。
- **過濾**：每個模組有 `filter.py`（django-filter），支援 `goods_price__gte` 之類的條件查詢（例：[`goods/filter.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/goods/filter.py)）。
- **輸出格式**：預設 JSON，另註冊 CSVRenderer（[`settings.py#L180-L183`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/greaterwms/settings.py#L180-L183)）。
- **WebSocket**：[`utils/websocket.py#L10-L56`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/utils/websocket.py#L10-L56) 只做員工之間傳訊息，連線存在記憶體 dict，沒有庫存變動推播。
- **Webhook**：沒有。要跟你的系統同步只能定時呼叫 API 或匯出 CSV。
- **擴充新模組**：照現有 app 的固定結構（models/serializers/views/urls/filter/files）複製一份即可，模式非常一致，交給 Claude Code 複製最容易。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：GitHub 顯示最近 push 為 2026-10-26；HEAD 提交為 2026-10-13「V2.1.54」。shallow clone 只看得到 1 個提交，**提交頻率未確認**。官方重心已轉向 Bomiot／3.0（README），2.x 看起來以維護為主。
- **測試**：幾乎沒有。所有 `tests.py` 中只有 `dashboard/tests.py` 非空（3 行，僅 import）。CI（`.github/workflows/ci.yml`）有跑 `manage.py check --deploy`、flake8 等，但沒有實際業務測試。
- **資安（自架對外前一定要改）**：
  - [`settings.py#L13-L18`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/greaterwms/settings.py#L13-L18)：`DEBUG = True`、`ALLOWED_HOSTS = ['*']`；SECRET_KEY 每次啟動隨機產生（重啟後 session 失效）。
  - CSRF 中介層被註解（L72）、`CORS_ORIGIN_ALLOW_ALL = True`（L315）。
  - [`utils/jwt.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/utils/jwt.py) JWT 金鑰寫死在原始碼（`JWT_SALT`），有效期 20 年（`settings.py#L356`）。
  - API token 就是永不過期的 openid；權限類別全部放行（見 §5-1）。
  - `/media/` 直接以 `static_serve` 公開（[`greaterwms/urls.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/greaterwms/urls.py)）。
- **隱私／外送資料**：[`templates/src/pages/warehouse/warehouseset.vue#L580-L605`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/templates/src/pages/warehouse/warehouseset.vue#L580-L605) 的「發布倉庫」按鈕會把倉庫資料**連同 openid（＝你的 API token）**POST 到作者的 `https://po.56yhz.com/warehouse/`（使用者主動按才會送）。沒有看到自動遙測；`vueMain.js` 只是 console 印出官網網址。
- **第三方套件**：[`greaterwms/asgi.py#L5-L13`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/greaterwms/asgi.py#L5-L13) 每個 HTTP 請求都會呼叫 `asgihandler` 套件的 `ASGIHandler.asgi_get_handler(scope)`；這個 PyPI 套件內容我沒有讀到（依規定不安裝），**用途未確認**，部署前建議先看它的原始碼。
- **已知的坑**：
  1. **沒有任何資料庫交易**：全專案 grep `atomic`／`select_for_update`／`F(` 零筆；庫存加減都是「讀出來→改→save()」，多人同時操作可能算錯。
  2. 商品「初始化匯入」會執行 `goodsunit.objects.all().delete()` 等（[`uploadfile/views.py#L61-L67`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/uploadfile/views.py#L61-L67)），**沒有加 openid 條件，會刪掉所有租戶的屬性字典**。
  3. [`utils/datasolve.py#L5-L13`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/utils/datasolve.py#L5-L13) 的輸入檢查只要文字裡出現 `script` 或 `select`（不分大小寫）就拒收，例如商品描述寫「Selected」會失敗。
  4. 限流 [`utils/throttle.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/utils/throttle.py) 每個請求都寫一筆資料庫紀錄，SQLite 下效能差。
  5. 數量都是整數（BigIntegerField），**不支援小數數量**（例如 0.5 公斤）。
  6. 時區寫死 `Asia/Shanghai`、預設語言 `zh-hans`（`settings.py#L137-L139`），台灣時區相同（UTC+8）所以時間不受影響。
  7. 新使用者註冊時會自動塞入大量隨機示範資料（中國城市名、隨機手機號）：[`userregister/views.py#L54-L487`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/userregister/views.py#L54-L487)。
  8. 前端網頁版是 Quasar 1 / Vue 2（Vue 2 已停止維護），手機版是 Vue 3，兩套前端程式碼不共用。

## 10. 跟其他專案組合的建議

- **你的點貨系統（主）＋ GreaterWMS（借設計）**：不建議整套搬來用（Python 後端、資安要大改、介面偏大型倉）。建議請 Claude Code 參考 §6 的「庫存多狀態欄位＋ASN 收貨差異＋QTYRecorder 流水帳＋循環盤點累加」四件，翻寫成你現有的 JS＋Apps Script／Firebase。
- **＋ 網頁版 Excel（例如同批次調查的 Univer、Luckysheet、Handsontable／HyperFormula、Glide Data Grid）**：GreaterWMS 的 `q-table` 只能逐列編輯。若你要「像 Excel 一樣直接改庫存表」，可以把 GreaterWMS 的資料模型當欄位定義，前端換成 Glide Data Grid 或 Univer，存檔時呼叫上面的 REST API（或你自己的 API）。
- **＋ InvenTree／jshERP／Odoo（同分類）**：GreaterWMS 偏「倉庫作業」，沒有採購、報價、會計；需要採購單、供應商報價、毛利時，看 jshERP（中文進銷存）或 InvenTree（零件庫存＋供應商價格）。
- **＋ 價格追蹤（changedetection.io、PriceGhost、pricebuddy、Discount-Bandit）**：GreaterWMS 完全不抓網路價格；可以把這些工具抓到的競品價格，寫回自己系統的商品表欄位（例如 `market_price`），跟 `goods_cost`、`goods_price` 一起算毛利。
- **運費比價**：把 `transportation_calculate` 的 3 行公式搬到你的前端，搭配一張「台灣物流商費率」試算表，就是一個實用的出貨運費比價小工具。

## 11. 價格相關功能檢查表

- **商品與價格資料模型（品項、多單位、多幣別／匯率、價目表、客戶別價格）**：
  - 品項：**有**。[`goods/models.py#L3-L27`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/goods/models.py#L3-L27)，單一成本 `goods_cost`＋單一售價 `goods_price`。
  - 多單位：**沒有**。`goods_unit` 只是一個文字欄位（[`goodsunit/models.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/goodsunit/models.py) 只是單位名稱字典），沒有換算比例。
  - 多幣別／匯率：**沒有**，沒有任何幣別欄位。
  - 價目表、客戶別價格：**沒有**；[`customer/models.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/customer/models.py) 只有 `customer_level` 整數，沒有被用在價格計算（grep `customer_level` 只出現在 customer 模組的 models/serializers/filter/files 與 `uploadfile/views.py` 匯入）。
- **進價：多家供應商報價、比價、詢價單（RFQ）、採購單**：**沒有**。供應商只有聯絡資料（[`supplier/models.py`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/supplier/models.py)）；商品的 `goods_supplier` 是單一文字欄位。ASN 可視為「到貨通知」，不是採購單。唯一的「比價」是**物流運費比價**：[`asn/views.py#L246-L266`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/asn/views.py#L246-L266)＋[`utils/datasolve.py#L109-L115`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/utils/datasolve.py#L109-L115)。
- **成本：庫存估值（FIFO／移動平均）、到岸成本（運費、關稅、雜費分攤）、毛利與定價計算**：
  - 庫存估值：**沒有**。成本只是 `goods_cost × 數量`（[`asn/views.py#L210-L212`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/asn/views.py#L210-L212)）；揀貨是依儲位先進先出（數量層面），不是成本層面的 FIFO。
  - 到岸成本：**沒有**。運費只算出來存在 ASN 的 `transportation_fee` JSON，沒有分攤回商品成本；沒有關稅欄位。
  - 毛利與定價：**沒有**。有成本與售價兩欄，但沒有毛利報表；儀表板只統計近 14 天入庫金額／出貨金額（[`dashboard/views.py#L88-L89`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/dashboard/views.py#L88-L89)）。
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知**：**沒有**抓價與價格歷史。商品有 `safety_stock`（安全庫存）欄位，但我**沒有找到**依安全庫存發出補貨通知的程式（grep `safety_stock` 在 .py/.vue 中只出現在 `goods/models.py` 與 `goods/filter.py`，連 serializer 都沒有輸出這個欄位）。
- **庫存／倉儲（入庫、出庫、盤點），以及跟使用者自建倉儲系統串接的方式**：
  - 入庫：**有**，ASN 五段狀態（§5-4）。出庫：**有**，DN＋配揀＋欠貨＋派車＋簽收（§5-5）。盤點：**有**，每日循環盤點＋手動盤點（§5-7）。儲位：**有**（binset，含 Damage/Holding/Inspection 屬性）。
  - 串接方式：**API 有**（REST＋OpenAPI 文件，header `token`）；**Webhook 沒有**；**匯入匯出有**（xlsx/csv 匯入、CSV 匯出）。跟你的 Firebase／Apps Script 系統串接，最實際的做法是：定時用 API 拉 `/stock/list/`，或匯出 CSV 再匯入你的試算表；反向則呼叫 `/asn/list/`＋`/asn/detail/` 建單。
- **台灣在地化：繁中介面、新台幣、台灣稅制／電子發票**：
  - 繁中介面：**有**，[`templates/src/i18n/zh-hant/index.js`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/templates/src/i18n/zh-hant/index.js)（網頁版），PDA 版也有 `app/src/i18n/zh-hant/`；但後端錯誤訊息與匯出 CSV 標題只分 `zh-hans`（簡中）與英文（[`goods/views.py#L346-L354`](https://github.com/GreaterWMS/GreaterWMS/blob/8344f3872155d75acce5c5d5d7d95b5b8e18dfc1/goods/views.py#L346-L354)），選繁中時匯出會是英文欄名。
  - 新台幣：**沒有**幣別概念（金額只是數字，當作新台幣用也行）。
  - 台灣稅制／電子發票：**沒有**。

## 關鍵字

GreaterWMS、倉儲管理系統、WMS、Warehouse Management System、入庫、到貨通知、ASN、出庫、出貨單、DN、揀貨、picking list、欠貨單、back order、上架、儲位、bin location、循環盤點、cycle count、庫存狀態、stock status、條碼、barcode、PDA、Zebra DataWedge、東集、iData、運費比價、freight calculation、Django、Django REST Framework、Quasar、Vue、SQLite、pandas、Excel 匯入、CSV 匯出、OpenAPI、Swagger、多租戶、Apache-2.0、Bomiot、繁體中文介面
