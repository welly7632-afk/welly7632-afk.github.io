# jishenghua/jshERP — 中國開源進銷存＋財務 ERP（Spring Boot＋Vue2），多單位多價格、移動平均成本、單據明細可編輯表格
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：8f5dc08
> GitHub：https://github.com/jishenghua/jshERP｜⭐ 4686｜授權：Apache-2.0｜主要語言：Java｜最近更新：2026-10-21

（以下所有 permalink 都以 `https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/` 開頭，簡寫為 `…/blob/8f5dc08…/`，實際點擊請用完整連結。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 管伊佳 ERP（原名華夏 ERP）是一套「進貨－銷貨－庫存－收付款」的完整中小企業後台，後端 Java Spring Boot＋MySQL＋Redis，前端 Vue 2＋Ant Design Vue（Jeecg-Boot 範本），介面是簡體中文。

對你（台灣小老闆、自己用 Claude 寫了 Firebase 倉儲系統、有在下廣告）最有用的地方：

1. **當作「ERP 資料模型教科書」**：它的資料表設計（商品 × 多單位 × 多屬性 SKU × 四種價格、單據主表／明細表、當前庫存＋當前成本單價）已經在大量中國中小企業實際跑過，你可以直接照抄欄位設計到 Firestore。
2. **查價／定價邏輯可以直接借**：
   - 每個商品條碼存「採購價、零售價、銷售價（批發價）、最低售價」四個價格；開單時依單據類型自動帶價；
   - 「同一客戶上次賣多少就帶多少」（客戶別價格），以及「低於最低售價就擋單」；
   - 移動平均成本（Moving Average Cost）計算，可以拿來算毛利。
3. **網頁版 Excel 相關：** 它沒有完整的試算表引擎，但前端有一個 3,180 行的 **`JEditableTable.vue` 可編輯表格元件**（Excel 式逐格輸入、Enter 跳下一格、最後一格按 Enter 自動新增一列、合計列、拖曳排序、超過 200 列只渲染可視範圍），是「開單明細表」的好範本。
4. **Excel 匯入／匯出**：商品、客戶、供應商、單據明細都可用 `.xls` 範本匯入，報表可以匯出 Excel。
5. 如果只是想「先有一套能用的進銷存」，可以在自己電腦或一台小 VPS 架起來先用（但介面是簡中、預設人民幣思維，見第 11 節）。

**不適合拿來做的：** 抓網路價格、比價爬蟲、價格歷史曲線、降價通知、AI 影片腳本——這些它都沒有。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：Apache-2.0**（根目錄 `LICENSE` 為標準 Apache License 2.0 全文；README 也寫「本系統100%開源，遵守Apache-2.0協議，企業可以商用」）。
  - 個人使用：完全可以，改了也不用公開。
  - 公司商用：可以，也可以拿去改成自己的閉源產品；只要**保留原始版權／授權聲明**、修改過的檔案標註有修改、並附上 Apache-2.0 授權文字。Apache-2.0 也附帶專利授權條款。
  - 前端內含的第三方檔案（例如 `jshERP-web/public/static/translate.js` 來自 xnx3/translate、Jeecg-Boot 範本元件）各自的授權本次**未逐一確認**，商用前要另外查。
- **付費／閉源部分（有，要注意）：**
  - README 推銷「網路版（198 元／年）」雲端 SaaS 與作者淘寶小店的**付費外掛**。
  - 程式碼裡可以看到被外掛擋住的功能：系統設定頁會檢查是否安裝 `workflow`（多級審批）、`stock-check`（盤點）、`produce`（生產任務／委外）外掛才顯示對應選項，見 [SystemConfigList.vue#L335-L358](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/views/system/SystemConfigList.vue#L335-L358)。後端白名單裡還出現 `general-ledger`（總帳憑證 PDF）、`wechat`、`tenant-statistics` 等外掛路徑，見 [LogCostFilter.java#L14-L18](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/filter/LogCostFilter.java#L14-L18)。這些外掛的原始碼**不在這個 repo**。
  - 結論：開源版 = 進銷存＋基本財務（收付款、轉帳、收支）＋報表；盤點、生產、多級審批、總帳等是付費外掛。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容（皆從 `pom.xml`、`package.json`、`application.yml` 讀到） |
|---|---|
| 後端 | Java 8、Spring Boot **2.0.0.RELEASE**、MyBatis＋MyBatis-Plus 3.0.7.1、PageHelper、fastjson 1.2.83、jxl 2.6.12（只讀寫舊版 `.xls`）、itextpdf、Swagger2、springboot-plugin-framework 2.2.1（外掛機制）、aliyun-sdk-oss（可選檔案上傳到阿里雲 OSS） |
| 前端 | Vue 2.7.16、Ant Design Vue 1.5.2、vue-cli 3、axios、viser-vue（圖表）、jQuery 1.12、translate.js（多語系） |
| 資料庫 | MySQL 8.0（建表 SQL：`jshERP-boot/docs/jsh_erp.sql`，32 張表）、Redis 6（存登入 session／token、驗證碼） |
| 部署 | 後端打包成 jar，用 `jshERP-boot/src/main/bin/start.sh` 等腳本啟動，預設 port 9999、路徑 `/jshERP-boot`；前端 build 後由 Nginx 提供，`vue.config.js` 開發時把 `/jshERP-boot` 代理到 `localhost:9999` |
| 硬體 | 一般 CPU 即可，無 GPU 需求；小 VPS（2 核 4GB 左右）應可跑 Java＋MySQL＋Redis（經驗估計，未實測） |
| API Key | **不需要任何 AI 或付費 API Key**。可選：微信小程式登入（`weixinAppid/weixinSecret`，存在平台設定表）、阿里雲 OSS。 |
| 費用 | 自架：只有主機費。作者雲端版 198 元人民幣／年（README）。 |

預設帳密注意：`application.yml` 內 MySQL `root/123456`、Redis 密碼 `1234abcd`；系統預設租戶 `jsh`、超管 `admin`、密碼 `123456`（README）。上線前一定要改。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree` 全部 718 個檔案；`find -name "*.java"` 共 273 個 Java 檔、約 70,904 行（`wc -l`）；前端 `src` 下 242 個 `.vue`，`.vue+.js` 約 71,508 行；後端 Controller 30 個、Service 31 個、MyBatis XML 61 個；`@Get/Post/Put/DeleteMapping` 共 337 個 API。

```
jshERP/
├─ LICENSE                         Apache-2.0
├─ README.md                       介紹、技術框架、付費網路版／外掛說明
├─ jshERP-boot/                    ← 後端 Spring Boot
│  ├─ pom.xml                      相依套件（Spring Boot 2.0.0、MyBatis-Plus、jxl…）
│  ├─ docs/jsh_erp.sql             全新安裝用建表＋初始資料（32 張 jsh_* 表、65 筆選單）
│  ├─ docs/数据库更新记录-…txt      歷年升級 SQL（1,858 行）
│  └─ src/main/
│     ├─ bin/                      start.sh / stop.sh / start.bat 部署腳本
│     ├─ resources/application.yml 連線、port、外掛路徑、上傳目錄
│     ├─ resources/mapper_xml/     61 個 MyBatis SQL（*MapperEx.xml 是手寫的報表／庫存 SQL）
│     └─ java/com/jsh/erp/
│        ├─ ErpApplication.java    進入點
│        ├─ config/                TenantConfig（多租戶 SQL 自動加 tenant_id）、Plugin*、Swagger
│        ├─ filter/LogCostFilter   登入檢查（Redis token）
│        ├─ controller/            30 個 REST Controller（material、depotHead、depotItem、supplier…）
│        ├─ service/               31 個商業邏輯（DepotHeadService 2,026 行、MaterialService 1,539 行、DepotItemService 1,535 行最核心）
│        ├─ datasource/entities|mappers|vo  MyBatis Generator 產生的實體與 Example 類
│        ├─ constants/             單據類型常數（採購、銷售、零售、調撥、組裝…）
│        └─ utils/                 ExcelUtils（jxl）、Tools（MD5、token 解析）、PinYinUtil…
└─ jshERP-web/                     ← 前端 Vue 2（Jeecg-Boot 2.2 範本）
   ├─ public/index.html            載入 translate.js 做多語系
   ├─ public/doc/*.xls             8 個匯入範本（商品、客戶、供應商、單據明細…）
   └─ src/
      ├─ components/jeecg/JEditableTable.vue   ★ 可編輯明細表格（Excel 式輸入）
      ├─ utils/JEditableTableUtil.js            表格欄位型別 FormTypes
      ├─ views/bill/               14 種單據（採購訂單、採購入庫、銷售出庫、零售、調撥、組裝拆卸…）
      │  └─ mixins/BillModalMixin.js ★ 開單時的數量×單價、稅額、折扣計算
      ├─ views/material/           商品、類別、多屬性、批次設價
      ├─ views/report/             14 支報表（進銷存統計、庫存預警、客戶／供應商對帳…）
      ├─ views/financial/          收款、付款、收入、支出、轉帳、預收款
      └─ views/system/             使用者、角色、租戶、倉庫、多單位、系統參數、外掛
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 商品／價格資料模型**
- 商品主檔 `jsh_material`：[jsh_erp.sql#L355-L385](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L355-L385)。名稱、規格、型號、品牌、顏色、重量、保質期、倉位、序號／批號開關、3 個自訂欄位。
- 價格放在 `jsh_material_extend`（每個「條碼＋單位＋SKU」一列）：[jsh_erp.sql#L483-L504](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L483-L504)。欄位 `purchase_decimal`（採購價）、`commodity_decimal`（零售價）、`wholesale_decimal`（銷售價）、`low_decimal`（最低售價）、`default_flag`（預設單位）。
- 多單位 `jsh_unit`：一個基本單位＋最多 3 個副單位與比例（例如 瓶／箱=24）：[jsh_erp.sql#L945-L959](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L945-L959)。換算單價在 [UnitService.java#L249-L262](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/UnitService.java#L249-L262)（副單位單價 = 基本單價 × 比例），總額換算在同檔 L271 起。

**5.2 開單自動帶價（查價核心）**
- [MaterialController.java#L581-L640](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/controller/MaterialController.java#L581-L640) `getMaterialByBarCode`：掃條碼（也支援輸入序號反查條碼）後依單號前綴決定帶哪個價——`LSCK/LSTH` 零售價、`CGDD/CGRK/CGTH` 採購價、`XSDD/XSCK/XSTH` 銷售價；銷售單有客戶時，若沒開「客戶靜態單價」開關，就查**這個客戶最近一次的成交單價**。
- 「最近一次成交價」SQL：[DepotItemMapperEx.xml#L1142-L1151](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/resources/mapper_xml/DepotItemMapperEx.xml#L1142-L1151)，`order by dh.id desc limit 1`；Service 包裝在 [DepotItemService.java#L1477-L1494](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L1477-L1494)。
- 角色價格遮蔽：`RoleService.parseBillPriceByLimit`（L265）、`parseHomePriceByLimit`（L241），可讓店員看不到進價，見 [RoleService.java#L241-L280](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/RoleService.java#L241-L280)。

**5.3 存單與價格防呆**
- 單據主表 `jsh_depot_head`（類型、子類型、客戶／供應商、折扣、訂金、欠款、審核狀態、關聯單號）：[jsh_erp.sql#L133-L176](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L133-L176)；明細表 `jsh_depot_item`（數量、基本數量、單價、採購單價快照、含稅單價、稅率、稅額、價稅合計、批號、效期、序號）：[jsh_erp.sql#L182-L215](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L182-L215)。
- API：`POST /depotHead/addDepotHeadAndDetail`（[DepotHeadController.java#L613-L621](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/controller/DepotHeadController.java#L613-L621)）→ `DepotHeadService.addDepotHeadAndDetail`（L1218）→ `DepotItemService.saveDetials`（[L381 起](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L381)）。
- 低於最低售價直接丟例外擋單：[DepotItemService.java#L562-L570](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L562-L570)。
- 銷售／零售出庫時，把「當時成本」寫進明細 `purchase_unit_price`（開移動平均就用當前平均成本，否則用商品採購價；批號商品用該批入庫價）：[DepotItemService.java#L572-L584](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L572-L584)。這就是日後算毛利的依據。
- 開關「更新單價」時，採購／銷售／零售成交價會回寫商品主檔價格：[DepotItemService.java#L956-L979](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L956-L979)。

**5.4 庫存與移動平均成本**
- 庫存不是累加欄位而是「重算」：期初庫存＋盤點差異＋（入庫＋調入＋組裝入＋拆卸入）－（出庫＋調出＋組裝出＋拆卸出）：[DepotItemService.java#L1055-L1079](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L1055-L1079)。結果快取到 `jsh_material_current_stock`（[jsh_erp.sql#L454-L466](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L454-L466)），由 `updateCurrentStockFun`（L1213）寫入。
- 移動平均成本 `updateCurrentUnitPrice`：把該商品所有單據依時間由舊到新重跑一次；採購入庫（與採購退貨）重新計算「總金額÷總數量」，銷售出庫／退貨與組裝、盤點用當時平均成本進出，最後寫回 `current_unit_price`：[DepotItemService.java#L1137-L1207](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L1137-L1207)。注意每存一張單就全量重算該商品歷史，單據很多時會慢。
- 系統參數開關（負庫存、以銷定購、強審核、更新單價、移動平均價、客戶靜態單價、價格含稅…）：`jsh_system_config` [jsh_erp.sql#L881-L909](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L881-L909)。

**5.5 前端 Excel 式明細表格（網頁版 Excel 相關重點）**
- [JEditableTable.vue](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/components/jeecg/JEditableTable.vue)（3,180 行，`methods` 區用 awk 數出約 99 個方法）：
  - 大量列時的虛擬渲染：超過 200 列只渲染可視範圍附近約 10 列，見 [#L104-L111](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/components/jeecg/JEditableTable.vue#L104-L111)（`rowHeight = 42`，L816）。
  - 欄位 `statistics: true` 自動算合計列：[#L2096-L2121](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/components/jeecg/JEditableTable.vue#L2096-L2121)。
  - Enter 鍵跳下一格，最後一格按 Enter 自動新增一列並聚焦：[#L2807-L2836](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/components/jeecg/JEditableTable.vue#L2807-L2836)（用 jQuery 綁 keydown）。
  - 新增／插入／刪除列、拖曳排序、上下移、`getValues` 時逐格驗證、`setValues` 批次寫值（方法清單在 L1126 起）。
  - 儲存格型別 `FormTypes`（input、inputNumber、select、date、popup、upload、image、slot、hidden…共 19 種）：[JEditableTableUtil.js#L1-L21](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/utils/JEditableTableUtil.js#L1-L21)。
  - **沒有**：公式（=SUM 之類）、儲存格參照、複製貼上多格、凍結窗格、合併儲存格、復原／重做。它是「明細輸入表格」，不是試算表引擎。
- 單據欄位定義範例（倉庫、條碼、數量、單價、金額、稅率、稅額、價稅合計）：[PurchaseInModal.vue#L275-L308](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/views/bill/modules/PurchaseInModal.vue#L275-L308)。
- 數量×單價→金額→稅額→價稅合計的連動計算（區分「價格含稅」與「未稅」）：[BillModalMixin.js#L478-L590](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/views/bill/mixins/BillModalMixin.js#L478-L590)；整單折扣率／折扣金額／其他費用／訂金：同檔 [#L849-L915](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/views/bill/mixins/BillModalMixin.js#L849-L915)。

**5.6 Excel 匯入匯出**
- 商品匯入（只收 `.xls`，單次上限約 1,000 列，27 欄：名稱、規格…副單位、比例、多屬性、四種價格…）：[MaterialService.java#L574-L690](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/MaterialService.java#L574-L690)。
- 共用工具（jxl 匯出單／多工作表、下載）：[ExcelUtils.java](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/utils/ExcelUtils.java)。
- 單據明細匯入：`POST /depotItem/importItemExcel`（[DepotItemController.java#L1096](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/controller/DepotItemController.java#L1096)）。

**5.7 多租戶與登入**
- `TenantConfig` 用 MyBatis-Plus `TenantSqlParser` 對每條 SQL 自動加 `tenant_id = ?`，tenant id 取自 token 底線後的數字：[TenantConfig.java#L26-L68](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/config/TenantConfig.java#L26-L68)、[Tools.java#L619-L628](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/utils/Tools.java#L619-L628)。
- 登入：`POST /user/login` → 產生 `UUID_租戶id` token 存 Redis（3 天滑動過期）；之後每個請求帶 `X-Access-Token` header，由 [LogCostFilter.java#L36-L70](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/filter/LogCostFilter.java#L36-L70) 檢查。驗證碼由平台設定 `checkcode_flag` 控制（[UserService.java#L297-L318](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/UserService.java#L297-L318)）。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度（低／中／高） | 怎麼接到別的專案 |
|---|---|---|---|---|
| 商品×多單位×四價格資料模型 | [jsh_erp.sql#L355-L504](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L355-L504)、[#L945-L959](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L945-L959) | 無（純設計） | 低 | 請 Claude 把 `jsh_material / jsh_material_extend / jsh_unit` 翻成 Firestore collection：`products/{id}/variants/{barcode}` 存四種價格與單位比例 |
| 多單位單價／金額換算 | [UnitService.java#L227-L285](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/UnitService.java#L227-L285) | BigDecimal | 低 | 改寫成 30 行 JS 函式（注意浮點數，建議用整數「分」或 decimal.js） |
| 開單自動帶價＋客戶上次成交價 | [MaterialController.java#L581-L640](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/controller/MaterialController.java#L581-L640)、[DepotItemMapperEx.xml#L1142-L1151](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/resources/mapper_xml/DepotItemMapperEx.xml#L1142-L1151) | MySQL | 低 | Firestore 查詢 `orderItems where customerId==X and barcode==Y orderBy createdAt desc limit 1` |
| 移動平均成本演算法 | [DepotItemService.java#L1137-L1207](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L1137-L1207) | 單據明細資料 | 中 | 移植成 Cloud Function：每次入庫只做增量 `(舊總額+本次金額)/(舊數量+本次數量)`，不要學它每次全量重算 |
| 最低售價防呆＋出庫成本快照 | [DepotItemService.java#L562-L584](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L562-L584) | 無 | 低 | 出貨單存檔時順便存 `costAtSale`，報表就能直接算毛利 |
| 庫存重算公式（含調撥、組裝拆卸、盤點） | [DepotItemService.java#L1055-L1079](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L1055-L1079) | MyBatis SQL | 中 | 當成「對帳用」的離線檢查腳本：定期用所有異動重算，對照 Firebase 裡的即時庫存 |
| JEditableTable 可編輯明細表 | [JEditableTable.vue](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/components/jeecg/JEditableTable.vue)、[JEditableTableUtil.js](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/utils/JEditableTableUtil.js) | Vue 2、Ant Design Vue 1.x、jQuery、vuedraggable | 高（綁 Vue2＋AntD） | 不建議整個搬；挑「Enter 跳格／自動加列」「合計列」「>200 列虛擬渲染」三個點子，請 Claude 用原生 JS 重寫進你的倉儲系統 |
| 數量／單價／稅額連動計算 | [BillModalMixin.js#L478-L590](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/views/bill/mixins/BillModalMixin.js#L478-L590) | 無 | 低 | 抽成 `calcLine({qty, price, taxRate, priceIncludesTax})` 純函式，台灣營業稅 5% 直接套 |
| 商品 Excel 匯入欄位設計 | [MaterialService.java#L574-L690](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/MaterialService.java#L574-L690) | jxl（只吃 .xls） | 中 | 參考欄位順序與驗證規則，前端改用 SheetJS 讀 `.xlsx` 寫進 Firestore |
| 系統參數開關清單 | [jsh_erp.sql#L881-L909](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L881-L909) | 無 | 低 | 當作你系統「設定頁」的需求清單（負庫存、價格含稅、移動平均…） |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **完全沒有 AI 功能**：用 `grep -rniE "openai|anthropic|claude|\bllm\b|chatgpt|\bgpt-"` 搜尋 `jshERP-boot/src` 與 `jshERP-web/src`，結果為 0 筆，後端與前端原始碼都沒有相關呼叫；沒有 prompt 檔、沒有 MCP、沒有 Skills。
- 唯一跟「機器翻譯」有關的是前端 `translate.js` 用 `client.edge`（呼叫 `edge.microsoft.com/translate/translatetext`）做介面多語系，不是生成式 AI。
- **能不能接 Claude：可以接，但要自己做。** 它有 337 個 REST API 與 Swagger 文件（`/jshERP-boot/doc.html`），你可以：
  1. 請 Claude Code 寫一個 MCP server，包裝 `POST /user/login`、`GET /material/getListWithStock`、`GET /material/getMaterialByBarCode`、`POST /depotHead/addDepotHeadAndDetail`，讓 Claude 能「查庫存、查價、開單」。
  2. 或只匯出報表 Excel 給 Claude 分析毛利與滯銷品。

## 8. 擴充方式與 API

- **REST API**：所有功能都是 JSON API，前端呼叫清單在 `jshERP-web/src/api/api.js`；Swagger UI 在 `/jshERP-boot/doc.html`（Swagger2Config）。認證方式：先 `POST /jshERP-boot/user/login`（密碼前端先 MD5，見 `Login.vue` L206），拿回 `token`，之後每個請求 header 帶 `X-Access-Token`。若要給程式呼叫，建議在平台設定把 `checkcode_flag` 關掉，或另做服務帳號。
- **外掛機制**：`springboot-plugin-framework`，外掛 jar 放 `plugins/`，REST 路徑前綴 `/api/plugin/{pluginId}`（[PluginConfiguration.java](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/config/PluginConfiguration.java)）；管理頁可上傳 jar 安裝（`PluginController` `/uploadInstallPluginJar`，限 admin）。官方付費外掛就是走這套。
- **自訂欄位**：商品有 `other_field1~3`，商品屬性（`jsh_material_property`）可改欄位名稱。
- **Webhook：沒有**（grep `webhook` 無結果）。要同步到 Firebase 只能：①定時輪詢 API；②直接讀 MySQL（例如用 Cloud Function 或排程腳本把 `jsh_material_current_stock` 同步到 Firestore）；③Excel 匯出再匯入。
- **排程**：`ErpApplication` 有 `@EnableScheduling`、`@EnableAsync`。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護狀況：活躍。** 2016 年建立，最新 commit 2026-10-21（「优化进销存统计中的查询sql的逻辑」），README 寫有官網、抖音直播、付費雲端版，商業動機明確。
- **測試：幾乎沒有。** `jshERP-boot/src/test` 只有 `resources/generatorConfig.xml`（MyBatis 產生器設定），沒有任何單元測試。
- **框架老舊（重要）：** Spring Boot 2.0.0（2018 年版本，早已停止支援）、Java 8、Vue 2（官方 2023 年底停止維護）、Ant Design Vue 1.5、jQuery 1.12、fastjson 1.x、jxl（只支援 `.xls`）。對外公開上線要自己評估弱點。
- **資安：**
  - 密碼用**不加鹽的 MD5**（前端 MD5 後，後端 `Tools.md5Encryp` 再比對，[Tools.java#L582-L588](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/utils/Tools.java#L582-L588)），資料庫外洩時容易被破解。
  - 預設帳密（DB `root/123456`、Redis `1234abcd`、系統 `admin/123456`）寫在設定與 README。
  - Swagger `/v2/api-docs` 在登入白名單內，API 結構對外可見。
  - 外掛可上傳 jar ＝ admin 帳號被盜即可執行任意程式碼。
  - 登入過濾器有擋 `..`／`%2e` 路徑穿越。
- **隱私／遙測：** 後端沒有看到回報到作者伺服器的程式（grep `http(s)://` 只有微信 API 與 Swagger 說明）。但前端 `translate.js` 切換語言（例如繁體中文）時，會把**畫面文字送到微軟 Edge 翻譯服務**——包含商品名、客戶名等營業資料。外掛管理有 `getMacWithSecret`（回傳主機 MAC 的 MD5），推測用於付費外掛授權綁定（未確認）。
- **已知的坑：**
  - 移動平均成本每存一張單就把該商品全部歷史重跑，資料量大會變慢。
  - 金額計算前端用 JS 浮點 `toFixed(2)`，後端用 BigDecimal，前後端可能有分位差。
  - 「繁體中文」是機器翻譯整頁替換，不是正式的語系檔；報表、單據、欄位名稱的翻譯品質無保證。
  - 單號前綴（`CGRK`、`XSCK`…）是中文拼音縮寫，寫死在程式裡。

## 10. 跟其他專案組合的建議

- **jshERP（資料模型＋價格規則）＋你的 Firebase 倉儲系統**：最務實。不要整套搬，把第 6 節的「四價格＋多單位」「客戶上次成交價」「出庫成本快照」「移動平均成本」移植成 JS，讓你的系統直接有毛利報表。
- **jshERP（開單流程）＋網頁試算表專案（例如 Univer、Luckysheet、x-spreadsheet、Handsontable／AG Grid 之類，另見本研究其他資料包）**：用試算表元件取代 JEditableTable 當「批次開單／批次改價」介面，後端規則沿用 jshERP 的計算邏輯。
- **jshERP（商品主檔與成本）＋比價／價格追蹤爬蟲專案**：jshERP 沒有抓網路價格的功能；可以讓爬蟲把競品價寫進 `other_field1~3` 或新增「競品價」表，再用 `low_decimal` 最低售價當底線做自動定價建議。
- **jshERP API＋Claude（MCP）**：寫一個 MCP server 讓 Claude 查庫存、查客戶歷史價、產生採購建議（搭配庫存預警 `findStockWarningCount`）。
- 若你想要「直接能用、繁中、支援台灣稅制」的完整 ERP，jshERP 不是最佳選擇（見第 11 節），可對照本分類其他資料包（如 Odoo、ERPNext 等）再決定。

## 11. 價格相關功能檢查表

- **商品與價格資料模型 — 有（部分）。**
  - 品項／SKU：有，`jsh_material` ＋ `jsh_material_extend`（每條碼一列，支援多屬性 SKU），[jsh_erp.sql#L355-L504](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L355-L504)。
  - 多單位：有，基本單位＋最多 3 個副單位，[jsh_erp.sql#L945-L959](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L945-L959)。
  - 多幣別／匯率：**沒有**（grep `currency|汇率|币种` 在後端與 SQL 皆無結果）。
  - 價目表：**沒有獨立價目表**，只有每個條碼固定 4 種價格（採購／零售／銷售／最低售價）。
  - 客戶別價格：**有（隱性）**，用「此客戶最後一次成交單價」自動帶入，可用 `customer_static_price_flag` 關閉，[MaterialController.java#L615-L627](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/controller/MaterialController.java#L614-L626)。沒有會員等級價、數量級距價。
- **進價：多家供應商報價、比價、詢價單（RFQ）、採購單 — 部分。**
  - 採購單：有（請購單→採購訂單→採購入庫→採購退貨，前端 `views/bill/PurchaseApplyList.vue`、`PurchaseOrderList.vue`、`PurchaseInList.vue`；單據關聯欄位 `link_number`、`link_apply`，[jsh_erp.sql#L133-L176](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L133-L176)）。
  - 多家供應商報價／比價／RFQ：**沒有**。沒有「商品×供應商報價」表；`jsh_supplier`（[jsh_erp.sql#L779](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L779)）只有聯絡資料、應收應付、稅率。要比價只能自己用「採購明細報表」看不同供應商歷史進價。
- **成本：庫存估值、到岸成本、毛利與定價計算 — 部分。**
  - 庫存估值：有**移動平均**（開關 `move_avg_price_flag`），[DepotItemService.java#L1137-L1207](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L1137-L1207)；沒開則用商品主檔採購價。**沒有 FIFO**。批號商品出庫會用該批入庫價（L582-L584）。
  - 到岸成本分攤：**沒有**。單據主表有 `other_money`（「销售或采购费用合计」）欄位，但移動平均計算只用明細 `all_price`，不會把運費／關稅分攤進商品成本（依 L1137-L1207 程式判斷）。
  - 毛利：出庫明細有存 `purchase_unit_price` 成本快照（[L572-L584](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L572-L584)），但開源版程式中 grep `毛利|利润|profit` 沒有找到毛利報表。定價計算（成本加成）：**沒有**；只有最低售價防呆與批次設定價格（`MaterialModal.vue` 的「採購價／零售價／銷售價／最低售價－批量」按鈕，輸入一個固定價格）。
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知 — 沒有／部分。**
  - 抓網頁價格：**沒有**。
  - 價格歷史：**間接有**，每張單據明細都存當時單價，可用報表或 SQL 查；沒有價格歷史圖表。
  - 降價通知：**沒有**。補貨：有「庫存預警」報表（`jsh_material_initial_stock` 的 `low_safe_stock`／`high_safe_stock`，[jsh_erp.sql#L528-L541](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/docs/jsh_erp.sql#L528-L541)；`DepotItemService.findStockWarningCount` L982），只是報表查詢，沒有主動推播。
- **庫存／倉儲（入庫、出庫、盤點）與 Firebase 串接 — 有（盤點為付費外掛）。**
  - 入庫／出庫／調撥／組裝拆卸：有，14 種單據（`views/bill/`），庫存公式 [DepotItemService.java#L1055-L1079](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-boot/src/main/java/com/jsh/erp/service/DepotItemService.java#L1055-L1079)；多倉庫、序號、批號、效期都有。
  - 盤點：資料常數有「盤點錄入／盤點複盤」，但開啟要裝 `stock-check` 付費外掛（[SystemConfigList.vue#L344-L349](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/views/system/SystemConfigList.vue#L344-L349)）。
  - 與 Firebase 串接：**沒有現成方案**。可用 REST API（token 認證）、`.xls` 匯入匯出，或直接同步 MySQL；**沒有 Webhook**。
- **台灣在地化 — 幾乎沒有。**
  - 繁中介面：只有透過 `translate.js` 機器翻譯（呼叫微軟 Edge 翻譯，語言選單有「繁體中文」，[SettingDrawer.vue](https://github.com/jishenghua/jshERP/blob/8f5dc0877ffb4cf863f6cdd675ecac8fc1ce4ea1/jshERP-web/src/components/setting/SettingDrawer.vue) L93），原始字串全是簡體。
  - 新台幣：**沒有幣別設定**；金額欄位不綁幣別，所以直接當台幣輸入也可以，但介面用語是中國用法。
  - 台灣稅制：只有通用「稅率％」欄位（明細與供應商都有），可填 5%；支援「價格含稅」開關。**沒有**統一編號格式驗證、營業稅申報（401）、**沒有台灣電子發票**（財政部 MIG／加值中心）串接。

## 關鍵字
jshERP、管伊佳ERP、華夏ERP、進銷存、ERP、庫存管理、倉儲、採購、銷售、零售、POS、多單位、多價格、最低售價、客戶別價格、移動平均成本、moving average cost、庫存估值、Spring Boot、MyBatis、MySQL、Redis、Vue 2、Ant Design Vue、Jeecg-Boot、JEditableTable、可編輯表格、editable grid、Excel 匯入匯出、jxl、多租戶、multi-tenant、SaaS、Apache-2.0、REST API、Swagger、外掛、plugin、條碼、序號、批號、庫存預警、translate.js
