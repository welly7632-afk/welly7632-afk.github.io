# YunaiV/ruoyi-vue-pro — 中國最大型的 Java 開源後台「全家桶」，內含一套精簡但完整的進銷存 ERP

> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：42528bf
> GitHub：https://github.com/YunaiV/ruoyi-vue-pro｜⭐ 40231｜授權：MIT｜主要語言：Java｜最近更新：2026-11-04

（下文的 permalink 前綴：後端 `https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/`；前端在另一個 repo `https://github.com/yudaocode/yudao-ui-admin-vue3/blob/3931a87177744dc28fc14aa80ae3f76ecebfb2fa/`。前端 repo 不在 YunaiV 底下，是作者另一個組織 yudaocode，本 repo 的 `yudao-ui/yudao-ui-admin-vue3/README.md` 有指過去。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Spring Boot + Vue3 的企業後台框架，把 ERP（進銷存）、WMS、MES、CRM、FMS（財務）、商城、AI 大模型等 20 個業務模組全部開源放在同一個 repo；其中 `yudao-module-erp` 是一套「商品→採購→入庫→銷售→出庫→收付款」的標準進銷存。

**對你（台灣小老闆、自建 Firebase 倉儲 App、會下廣告）實際能做的事：**

1. **當「進銷存資料模型範本」**：直接照抄它的資料表設計（商品、單位、倉庫、庫存、庫存流水、採購單／入庫單／退貨單、銷售單／出庫單、收付款單），轉成你 Firestore 的 collection 結構。它把「單據審核 → 寫流水 → 更新庫存」這條鏈寫得很乾淨，是最值得抄的部分。
2. **當「價格計算規則」參考**：採購／銷售明細的「單價 × 數量 → 稅額 → 折扣 → 其他費用（運費）」計算邏輯，前端（Vue）和後端（Java）各寫一份，你可以直接翻成 JavaScript。
3. **報表／類 Excel 需求**：它整合了 **UReport2**（類 Excel 的網頁報表設計器）與 **積木報表 JimuReport**，可以拖拉出列印用報表。**但注意：這不是可以自由編輯儲存格的網頁版 Excel**（詳見第 5、6 節）。
4. **個人試用**：如果你想看「完整 ERP 長什麼樣」，可以本機架起來玩；但它是 Java 生態，跟你目前的純 JS + Firebase 差很多，**不建議直接拿來取代你的系統**。
5. **AI**：內建 AI 模組支援 Anthropic Claude（Spring AI），另有 `ai1` 模組支援 MCP 與 SKILL.md 技能；但它的 AI 是聊天／寫作／繪圖／音樂，**沒有影片生成或短劇腳本**功能。

## 2. 授權白話

- **授權：MIT**（根目錄 `LICENSE`，我有打開確認：「The MIT License (MIT) Copyright (c) 2021 ruoyi-vue-pro」）。前端 `yudao-ui-admin-vue3` 也是 MIT（`Copyright (c) 2021-present Archer`）。
- **個人使用**：完全可以，免費、可改、可不公開原始碼。
- **公司商用**：MIT 允許商用、改作、閉源再發佈；唯一義務是在散佈的副本中保留原授權聲明（README 自稱「不用保留類作者、Copyright 信息」，這句話比 MIT 原文寬鬆，**以 LICENSE 檔為準**，建議還是保留）。
- **有沒有付費版／閉源功能**：README 寫「現在、未來都不會有商業版本，所有程式碼全部開源」。repo 內 ERP／WMS／MES／FMS 等模組的程式碼確實都在。**但要注意兩個「第三方」元件**：
  - **積木報表 JimuReport**（`org.jeecgframework.jimureport:jimureport-spring-boot-starter`，版本 2.3.4，見 `yudao-dependencies/pom.xml#L88-L89`）：它是 JEECG 公司的 Maven 套件，**原始碼不在這個 repo**；據我的背景知識它是「免費但核心不開源、另有商業版」，**本次未在 repo 內驗證其授權**，商用前請自行確認。
  - **UReport2**（`cn.iocoder.ureport2:ureport2-spring-boot-starter` 2.0.1）：作者自己 fork 發佈的版本，原版 UReport2 為 Apache-2.0；此 fork 的授權**未確認**。
- 文件站 doc.iocoder.cn 部分進階文件據悉需付費（知識星球），這點**未確認**，也不影響程式碼本身的授權。

## 3. 技術棧與執行需求

| 項目 | 內容（皆從 repo 讀到） |
|---|---|
| 後端 | Java；`master` 分支 = **JDK 8 + Spring Boot 2.7.18**（`pom.xml` 的 `<java.version>1.8`、`<spring.boot.version>2.7.18`）；另有 `master-jdk17`（Spring Boot 3.5）、`master-jdk25` 分支（README 說明，本次未 clone） |
| ORM／資料庫 | MyBatis Plus 3.5.17、Druid；預設 **MySQL**，`sql/` 目錄另提供 Oracle、PostgreSQL、SQL Server、達夢、人大金倉、openGauss、瀚高、OceanBase 腳本 |
| 快取 | **Redis（必要）**＋Redisson；ERP 單號產生器就靠 Redis 自增 |
| 前端 | Vue 3.5.34 + Element Plus 2.13.7 + Vite 8 + TypeScript 6（`yudao-ui-admin-vue3/package.json`），另有 vben（Ant Design Vue）、Vue2、uni-app 版本 |
| Excel 讀寫 | Apache **Fesod** 2.1.0-incubating（前身 EasyExcel／FastExcel），封裝在 `yudao-spring-boot-starter-excel` |
| 報表 | 積木報表 2.3.4、JimuBI 2.3.2、UReport2 2.0.1、GoView 大屏 |
| AI | Spring AI 1.1.8、Spring AI Alibaba、TinyFlow；向量庫 Qdrant／Redis／Milvus |
| 部署 | `script/docker-compose/docker-compose.yml`、`script/shell/deploy.sh`、Jenkins 範例（我只讀檔名與目錄，**未執行**） |
| 硬體 | 沒有 GPU 需求。Java + MySQL + Redis，個人試玩建議至少 4 GB RAM（經驗值，**未實測**） |
| API Key | ERP 本身**不需要任何 API Key**。AI 模組才需要：`yudao-server/src/main/resources/application.yaml` 列了 OpenAI、Anthropic、DeepSeek、通義、Gemini、豆包…等約 20 組 `api-key`，全部預設 `sk-xxxx` 佔位，費用依各家模型計價 |

**哪些模組要另外啟用（重要的坑）**：根目錄 `pom.xml#L10-L36` 中，除了 `system`、`infra` 之外，**`erp`、`wms`、`mall`、`crm`、`mes`、`fms`、`report`、`ai`… 全部被註解掉**；`yudao-server/pom.xml` 的相依也全部註解。要用 ERP 必須兩邊都取消註解再編譯。另外 `sql/mysql/ruoyi-vue-pro.sql` 我數過只有 48 個 `CREATE TABLE`（32 個 `system_`、11 個 `infra_`、5 個 `yudao_`），**ERP 的 `erp_*` 建表 SQL 不在 repo 內**（全 repo `grep 'CREATE TABLE.*erp_'` 0 筆，只有字典資料），需依官方文件另外取得——這是試用時最容易卡住的地方。

## 4. 程式架構地圖

```
ruoyi-vue-pro/
├── pom.xml                      # 父 POM；<modules> 決定啟用哪些模組（多數預設註解）
├── yudao-dependencies/pom.xml   # 所有第三方版本（Spring、MyBatis、Fesod、JimuReport、UReport2…）
├── yudao-framework/             # 共用框架 starter：web、security、mybatis、redis、excel、多租戶、資料權限、MQ、job…
│   ├── yudao-common/…/MoneyUtils.java          # 金額計算工具（乘、百分比、分↔元）
│   └── yudao-spring-boot-starter-excel/        # Excel 匯入匯出封裝（Fesod）＋下拉選單、字典轉換
├── yudao-server/                # 真正啟動的 Spring Boot 主程式；application.yaml 在這
├── yudao-module-system/         # 使用者、角色、選單、租戶、字典、簡訊、郵件…
├── yudao-module-infra/          # 程式碼產生器（含「ERP 模式」主子表範本）、檔案、API 日誌、WebSocket
├── yudao-module-erp/            # ★ 進銷存（216 個 Java 檔，0 個測試）
│   └── src/main/java/cn/iocoder/yudao/module/erp/
│       ├── controller/admin/{product,purchase,sale,stock,finance,statistics}/  # 23 個 Controller
│       ├── service/…            # 業務邏輯（審核、扣庫存、算金額）
│       ├── dal/dataobject/…     # 33 個資料表對應 DO
│       ├── dal/redis/no/ErpNoRedisDAO.java       # 單號產生器 CGDD20261104000001
│       └── enums/stock/ErpStockRecordBizTypeEnum.java  # 20 種庫存異動類型
├── yudao-module-wms/            # 倉儲管理（SKU 有成本價／售價、收貨／出貨／移庫／盤點單）
├── yudao-module-mes/            # 製造執行（1153 個 Java 檔，最大模組；含批次 FIFO 領料）
├── yudao-module-fms/            # 財務：科目、憑證、多幣別匯率、三大報表（含 Aviator 公式）
├── yudao-module-mall/           # 商城：product（SKU 價格／市價／成本價）、trade（價格計算器鏈）、promotion
├── yudao-module-crm/、hrm/、oa/、pms/、im/、iot/、bpm/、pay/、mp/、member/
├── yudao-module-report/         # UReport2、積木報表、GoView 大屏整合
├── yudao-module-ai/             # AI：聊天、寫作、心智圖、繪圖、音樂、知識庫、工作流
├── yudao-module-ai1-springai/   # AI Agent：多供應商、MCP、SKILL.md、RAG、SSE 串流
├── sql/                         # 各資料庫初始化 SQL（只含 system/infra）
└── script/                      # docker-compose、deploy.sh、jenkins、seata、sharding 範例
```

計數方式：`find yudao-module-erp -name '*.java' | wc -l` = 216；`ls controller/admin/*/*Controller.java | wc -l` = 23；`grep -rhoE '@(Get|Post|Put|Delete)Mapping' controller | wc -l` = 146 個 HTTP 端點；ERP 主程式碼 18,685 行（`xargs cat | wc -l`）；DO 數量逐目錄加總 5+3+7+7+11 = 33。

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 商品主檔與三種價格 | [ErpProductDO.java#L50-L84](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/dal/dataobject/product/ErpProductDO.java#L50-L84) | 一個商品只有**一個**單位 `unitId`，價格欄位只有 `purchasePrice`（採購價）、`salePrice`（售價）、`minPrice`（最低價），全部 `BigDecimal`、單位「元」。沒有多幣別、沒有價目表 |
| 採購單金額計算 | [ErpPurchaseOrderServiceImpl.java#L113-L169](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/purchase/ErpPurchaseOrderServiceImpl.java#L113-L169) | 明細：`totalPrice = productPrice × count`、`taxPrice = totalPrice × taxPercent%`；表頭：合計＋稅 − 折扣（`discountPercent`）。單位自動帶商品的 `unitId` |
| 採購入庫（含運費等其他費用） | [ErpPurchaseInServiceImpl.java#L134-L205](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/purchase/ErpPurchaseInServiceImpl.java#L134-L205) | `totalPrice = 商品金額 + 稅 − 折扣 + otherPrice`；**審核通過**才逐筆呼叫 `createStockRecord` 加庫存，反審核則寫負數流水；已付款不可反審核；入庫數不可超過採購單數量 |
| 庫存流水＋即時庫存 | [ErpStockRecordServiceImpl.java#L41-L51](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/stock/ErpStockRecordServiceImpl.java#L41-L51)、[ErpStockServiceImpl.java#L27-L87](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/stock/ErpStockServiceImpl.java#L27-L87) | 所有單據都走同一個入口：先 `updateStockCountIncrement`（以 SQL 條件更新防止負庫存，`NEGATIVE_STOCK_COUNT_ENABLE=false` 寫死）再插一筆流水並記下異動後結餘 `totalCount`。**庫存表 `ErpStockDO` 只有 productId／warehouseId／count，沒有金額** |
| 異動類型 | [ErpStockRecordBizTypeEnum.java](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/enums/stock/ErpStockRecordBizTypeEnum.java) | 10 種業務×（正向／作廢）= 20 種：其他入出庫、調撥、盤盈盤虧、銷售出庫／退貨、採購入庫／退貨 |
| 盤點 | [ErpStockCheckServiceImpl.java#L120-L140](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/stock/ErpStockCheckServiceImpl.java#L120-L140) | 盤點明細有 `stockCount`（帳面）、`actualCount`（實盤）、`count`（差異）；差異 > 0 寫「盤盈入庫」，< 0 寫「盤虧出庫」 |
| 單號產生 | [ErpNoRedisDAO.java#L80-L94](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/dal/redis/no/ErpNoRedisDAO.java#L80-L94) | `前綴 + yyyyMMdd + 6 位 Redis 自增`，key 過期 1 天。前綴如 CGDD（採購訂單）、XSCK（銷售出庫） |
| 統計（首頁採購／銷售額） | [ErpSaleStatisticsMapper.xml](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/resources/mapper/statistics/ErpSaleStatisticsMapper.xml) | 只算「已審核出庫金額 − 退貨金額」，**沒有毛利／成本**（ERP 全模組 `grep -i 'profit\|毛利\|costPrice'` 0 筆） |
| 匯出 Excel | [ExcelUtils.java#L55-L102](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-framework/yudao-spring-boot-starter-excel/src/main/java/cn/iocoder/yudao/framework/excel/core/util/ExcelUtils.java#L55-L102) | 用 VO 上的 `@ExcelProperty` 註解定義欄位；ERP 有 20 處 `ExcelUtils.write`（每種單據都可匯出 .xls），**但 ERP 沒有任何 `ExcelUtils.read`（不能匯入）** |
| 前端明細表（像試算表的輸入列） | [PurchaseOrderItemForm.vue#L11-L136](https://github.com/yudaocode/yudao-ui-admin-vue3/blob/3931a87177744dc28fc14aa80ae3f76ecebfb2fa/src/views/erp/purchase/order/components/PurchaseOrderItemForm.vue#L11-L136)、[同檔 #L175-L262](https://github.com/yudaocode/yudao-ui-admin-vue3/blob/3931a87177744dc28fc14aa80ae3f76ecebfb2fa/src/views/erp/purchase/order/components/PurchaseOrderItemForm.vue#L175-L262) | `el-table` + 每格 `el-input`，`watch(deep)` 即時重算金額／稅額，`show-summary` 底部合計列；選商品時自動帶入採購價、條碼、單位，並呼叫 API 顯示目前庫存 |
| 網頁報表設計器（UReport2） | [UReport2Configuration.java](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-report/src/main/java/cn/iocoder/yudao/module/report/framework/ureport2/config/UReport2Configuration.java)、[UReport2DatabaseReportProvider.java](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-report/src/main/java/cn/iocoder/yudao/module/report/framework/ureport2/core/provider/UReport2DatabaseReportProvider.java)、前端 [UReportFrame.vue](https://github.com/yudaocode/yudao-ui-admin-vue3/blob/3931a87177744dc28fc14aa80ae3f76ecebfb2fa/src/views/report/ureport/UReportFrame.vue) | UReport2 自帶類 Excel 的格子式設計器（`/ureport/designer`），本專案只補三件事：模板存資料庫（`report_ureport_file`、前綴 `db:`）、按租戶隔離＋Redis 版本號讓多台伺服器快取失效、`/ureport/*` 的權限過濾器。前端用 **iframe** 嵌入 |
| 積木報表 | [JmReportConfiguration.java](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-report/src/main/java/cn/iocoder/yudao/module/report/framework/jmreport/config/JmReportConfiguration.java)、前端 [jmreport/index.vue](https://github.com/yudaocode/yudao-ui-admin-vue3/blob/3931a87177744dc28fc14aa80ae3f76ecebfb2fa/src/views/report/jmreport/index.vue) | 只實作 token 驗證介面 `JmReportTokenServiceI`，設計器本體在第三方 jar 裡；同樣是 iframe `/jmreport/list?token=…` |

**關於「網頁版 Excel」的結論（你最在意的主題）**：這個專案**沒有**自己寫的網頁試算表元件（前端 package.json 我查過沒有 Univer、Luckysheet、vxe-table、exceljs、xlsx 等套件）。它提供的是：①**報表設計器**（UReport2／積木，都是「設計列印格式＋綁 SQL 資料集」，不是讓使用者自由輸入資料的 Excel）；②**Excel 檔匯入匯出**（Fesod）；③**表單式明細表**（el-table 每格放 input）。如果你要的是「在網頁上像 Excel 一樣編輯資料」，應該去看 01-web-excel 分類的專案，這裡只適合拿「明細表即時計算＋底部合計」那段邏輯。

## 6. 值得拆出來用的部分

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 進銷存資料模型（33 張表） | [dal/dataobject/](https://github.com/YunaiV/ruoyi-vue-pro/tree/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/dal/dataobject) | 無（純欄位） | 低 | 把每個 DO 的欄位＋中文註解丟給 Claude Code，轉成 Firestore collection／TypeScript interface；表頭＋明細（`xxx` / `xxxItem`）結構可照搬 |
| 「單據審核→寫流水→改庫存」流程 | [ErpPurchaseInServiceImpl.java#L171-L205](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/purchase/ErpPurchaseInServiceImpl.java#L171-L205) + [ErpStockRecordServiceImpl.java#L41-L51](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/stock/ErpStockRecordServiceImpl.java#L41-L51) | Spring 交易、MyBatis | 中 | 在 Firebase 用 `runTransaction` 實作：讀庫存→檢查不為負→`increment`→寫一筆 `stockRecords`（含 bizType、bizNo、異動後結餘）。作廢一律寫反向流水而不是刪除 |
| 20 種庫存異動類型表 | [ErpStockRecordBizTypeEnum.java](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/enums/stock/ErpStockRecordBizTypeEnum.java) | 無 | 低 | 直接翻成 JS 常數物件 |
| 單據金額計算（稅、折扣、其他費用） | [ErpPurchaseInServiceImpl.java#L134-L145](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/purchase/ErpPurchaseInServiceImpl.java#L134-L145)、[MoneyUtils.java#L142-L164](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-framework/yudao-common/src/main/java/cn/iocoder/yudao/framework/common/util/number/MoneyUtils.java#L142-L164) | BigDecimal | 低 | JS 端用整數「分」或 decimal.js 避免浮點誤差；新台幣可直接四捨五入到元 |
| 明細表即時計算＋合計列（Vue） | [PurchaseOrderItemForm.vue#L175-L213](https://github.com/yudaocode/yudao-ui-admin-vue3/blob/3931a87177744dc28fc14aa80ae3f76ecebfb2fa/src/views/erp/purchase/order/components/PurchaseOrderItemForm.vue#L175-L213) | Vue3、Element Plus | 低 | 你是純 JS：把 `watch` 那段改成 input 事件重算，`getSummaries` 改成表尾 `<tfoot>` |
| 盤點差異→盤盈盤虧 | [ErpStockCheckServiceImpl.java#L120-L140](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/stock/ErpStockCheckServiceImpl.java#L120-L140) | 同上 | 低 | 盤點頁讓手機掃條碼輸入實盤數，送出時算差異寫流水 |
| 單號產生規則 | [ErpNoRedisDAO.java#L80-L94](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/dal/redis/no/ErpNoRedisDAO.java#L80-L94) | Redis | 低 | Firestore 用 `counters/{prefix_yyyyMMdd}` 文件＋`increment(1)` |
| 商城價格計算器鏈（優惠→運費→積分） | [TradePriceCalculator.java](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-mall/yudao-module-trade/src/main/java/cn/iocoder/yudao/module/trade/service/price/calculator/TradePriceCalculator.java) | Spring 注入、商城其他模組 | 中 | 只抄「每個計算器有順序常數、依序修改同一個 result」的設計，自己寫定價／促銷試算 |
| Excel 匯出匯入工具 | [ExcelUtils.java#L55-L140](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-framework/yudao-spring-boot-starter-excel/src/main/java/cn/iocoder/yudao/framework/excel/core/util/ExcelUtils.java#L55-L140) | Java + Fesod | 高（換語言） | JS 專案改用 SheetJS／exceljs；可抄「下載範本→匯入→回傳成功／失敗清單」的流程，參考 [MesMdItemController.java#L145](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-mes/src/main/java/cn/iocoder/yudao/module/mes/controller/admin/md/item/MesMdItemController.java#L145) |
| UReport2 模板存資料庫＋快取失效 | [UReport2DatabaseReportProvider.java](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-report/src/main/java/cn/iocoder/yudao/module/report/framework/ureport2/core/provider/UReport2DatabaseReportProvider.java) | UReport2、Java 後端 | 高 | 只有在你另外架 Java 伺服器時才用得到；純 Firebase 無法接 |
| 財務報表公式引擎（Aviator） | [FmsCashFlowStatementServiceImpl.java#L460-L490](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-fms/src/main/java/cn/iocoder/yudao/module/fms/service/report/FmsCashFlowStatementServiceImpl.java#L460-L490) | Aviator | 中 | 「把儲存格代號替換成變數再丟給運算式引擎」的思路，可在 JS 用 expr-eval／hot-formula-parser 重現 |

## 7. AI／Claude 整合

- **支援模型**：`AiPlatformEnum` 列了 21 個平台，含 **Anthropic（Claude）**（[AiPlatformEnum.java#L37](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai/enums/model/AiPlatformEnum.java#L37)）、OpenAI、Gemini、DeepSeek、通義、豆包、Midjourney、Stable Diffusion、Suno 等。Claude 透過 Spring AI 的 `AnthropicChatModel` 建立（[AiModelFactoryImpl.java#L483-L490](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai/framework/ai/core/model/AiModelFactoryImpl.java#L483-L490)），設定在 [application.yaml#L176-L178](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-server/src/main/resources/application.yaml#L176-L178)（`ANTHROPIC_API_KEY`）。
- **Prompt 放哪**：寫作功能的 prompt 範本寫死在 [AiWriteTypeEnum.java#L18-L19](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai/enums/write/AiWriteTypeEnum.java#L18-L19)（「請撰寫一篇關於 [{}] 的文章…語氣…長度…」）；角色系統提示存在資料庫 `AiChatRoleDO.systemMessage`，見 [AiWriteServiceImpl.java#L64-L85](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-ai/src/main/java/cn/iocoder/yudao/module/ai/service/write/AiWriteServiceImpl.java#L64-L85)。
- **MCP**：`application.yaml#L194-L209` 有 MCP server／client 設定，**預設 `enabled: false`**，server 只是「一個 MCP 示例服務」。`ai1` 模組（[pom 描述](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-ai1-springai/pom.xml)）支援遠端／本地 MCP。
- **Skills**：`ai1` 模組會把資料庫裡的 **SKILL.md 技能**展開到伺服器目錄並提供 Shell、FileSystem 工具（[Ai1SkillToolFactory.java](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-ai1-springai/src/main/java/cn/iocoder/yudao/module/ai1/harness/skill/Ai1SkillToolFactory.java)），程式碼註解自己寫「會在伺服器上執行命令…不可信部署需自行評估」。`ai1` 的對話模型只走 OpenAI 相容協定（[Ai1LlmModelFactory.java](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-ai1-springai/src/main/java/cn/iocoder/yudao/module/ai1/harness/llm/Ai1LlmModelFactory.java)），要接 Claude 需透過相容端點（**未確認** Anthropic 官方相容端點在此是否可用）。
- **ERP × AI**：ERP 模組完全沒有 AI 功能；也**沒有影片生成、短劇腳本**。
- **JDK 版本疑慮**：Spring AI 1.x 一般需要 JDK 17，而 `master` 是 JDK 8；根 `pom.xml` 也特別註明「請參考文件完成 AI 模組的啟動」。在 master 上能否直接編譯 AI 模組**未確認**，想用 AI 建議改看 `master-jdk17` 分支。

## 8. 擴充方式與 API

- **REST API**：每個 Controller 都是 `/admin-api/erp/...`（例如 `/erp/product`、`/erp/stock/get-count`、`/erp/purchase-order/...`），用 `@PreAuthorize("@ss.hasPermission('erp:product:create')")` 控權限；Swagger／Knife4j 自動產生文件。你的 Firebase App 若要串接，可呼叫這些 API（需先登入取得 token）。
- **程式碼產生器**：infra 模組可從資料表一鍵產生 Java＋Vue＋SQL，內建「主子表（ERP 模式）」範本（[CodegenTemplateTypeEnum.java#L22](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-infra/src/main/java/cn/iocoder/yudao/module/infra/enums/codegen/CodegenTemplateTypeEnum.java#L22)），新增單據類型很快。
- **Webhook**：ERP 沒有 Webhook（`grep -i webhook` 只在 IM、IoT 模組出現）；BPM 工作流有「觸發節點」可發 HTTP 請求（README 描述，未讀程式碼）。
- **匯入匯出**：ERP 只能匯出 .xls，不能匯入；要匯入需參考 MES／CRM 的寫法自己加。
- **多租戶**：內建 SaaS 多租戶，若日後想把你的倉儲系統賣給其他店家，這套架構可參考。

## 9. 程式品質與風險

- **維護狀況**：非常活躍。最新 commit 2026-11-03（「切換 UReport2 正式發布版本」），GitHub 最近推送 2026-11-04；`.github/workflows/maven.yml` 有 CI。
- **測試**：README 宣稱「所有功能都通過單元測試保證」，但我用 `find . -name '*Test.java' -path '*src/test*'` 數：IoT 89、HRM 51、BPM 46…**ERP 0 個、WMS 11 個、CRM 6 個**。ERP 沒有測試。
- **已知的坑**：
  - 模組預設全部關閉、ERP 建表 SQL 不在 repo（第 3 節）。
  - [ErpStockCheckController.java#L122](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/controller/admin/stock/ErpStockCheckController.java#L122)：盤點單匯出檔名寫成「库存调拨单.xls」（複製貼上錯誤）。
  - 允許負庫存的開關寫死在程式（[ErpStockServiceImpl.java#L27-L32](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/stock/ErpStockServiceImpl.java#L27-L32)，TODO 註解說之後做成設定）。
  - 一商品一單位，無單位換算（箱／個）。
- **資安／隱私**：
  - 前端報表 iframe 把 **refresh token 放在網址參數**（`/jmreport/list?token=…`、`/ureport/designer?token=…`），會出現在伺服器日誌與瀏覽紀錄。
  - `ai1` 的 SKILL 工具可在伺服器執行 Shell。
  - `application.yaml#L362` 有一組快遞鳥（kd-niao）`api-key` 明碼寫在設定檔（應是作者的示範帳號）。
- **遙測**：前端 `.env#L20` 預設 `VITE_APP_BAIDU_CODE`，[src/plugins/tongji/index.ts](https://github.com/yudaocode/yudao-ui-admin-vue3/blob/3931a87177744dc28fc14aa80ae3f76ecebfb2fa/src/plugins/tongji/index.ts) 會載入 `hm.baidu.com/hm.js` 並回報每次換頁網址。**自用前請把這行清空。** 後端未發現遙測。
- **語言**：介面、註解、錯誤訊息全是簡體中文；前端 locales 只有 `zh-CN.ts`、`en.ts`。

## 10. 跟其他專案組合的建議

- **A（你的 Firebase 倉儲 App）＋ B（本專案的 ERP 資料模型與流程）**：最划算的用法。不要部署它，而是讓 Claude Code 讀 `yudao-module-erp/dal/dataobject` 和 `service/purchase`、`service/stock`，產生對應的 Firestore schema 與 Cloud Functions（審核→流水→庫存）。
- **＋ C（網頁試算表專案，例如 Univer／Luckysheet／Handsontable 類）**：用 C 做「像 Excel 的批次編輯採購明細／盤點表」，存檔時套用本專案的金額計算與流水規則。
- **成本／毛利**：本專案的 ERP 沒有成本估值，若需要「進價歷史、移動平均成本、毛利」，要自己在流水上加 `unitCost`，或參考 WMS 的 `costPrice`／商城 SKU 的 `costPrice` 欄位設計，再找其他專注成本計算的專案（例如 Odoo、ERPNext 類）。
- **AI 影片**：本專案幫不上，請看 03-video-script 分類。

## 11. 價格相關功能檢查表

- **商品與價格資料模型**：**有（基本）**。[ErpProductDO.java#L50-L84](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/dal/dataobject/product/ErpProductDO.java#L50-L84) 有採購價／售價／最低價。**多單位：沒有**（單一 `unitId`）。**多幣別／匯率：ERP 沒有**；FMS 財務模組有 [FmsCurrencyDO.java#L39-L45](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-fms/src/main/java/cn/iocoder/yudao/module/fms/dal/dataobject/config/FmsCurrencyDO.java#L39-L45)（幣別、匯率、本位幣），但只用於會計憑證。**價目表、客戶別價格：沒有**（[ErpCustomerDO](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/dal/dataobject/sale/ErpCustomerDO.java) 只有聯絡資料、稅號、稅率、銀行）。商城 SKU 另有售價／市價／成本價（[ProductSkuDO.java#L48-L58](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-mall/yudao-module-product/src/main/java/cn/iocoder/yudao/module/product/dal/dataobject/sku/ProductSkuDO.java#L48-L58)，單位「分」）。
- **進價：多家供應商報價、比價、RFQ**：**沒有**。全 repo `grep '询价|RFQ|报价单|quotation'` 0 筆。**採購單：有**（[ErpPurchaseOrderServiceImpl.java#L113-L169](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-erp/src/main/java/cn/iocoder/yudao/module/erp/service/purchase/ErpPurchaseOrderServiceImpl.java#L113-L169)），一張單對一家供應商，含稅率、折扣、訂金。
- **成本：庫存估值（FIFO／移動平均）**：**沒有**。`ErpStockDO` 只存數量；`grep '移动平均|movingAverage'` 0 筆。MES 有「批次 FIFO 領料」（[MesWmItemConsumeServiceImpl.java#L116-L140](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-mes/src/main/java/cn/iocoder/yudao/module/mes/service/wm/itemconsume/MesWmItemConsumeServiceImpl.java#L116-L140)）但那是分配數量，不是成本估值。**到岸成本分攤：沒有**；入庫單只有一個表頭 `otherPrice`（其他費用）加進總額，**不會分攤到每個品項成本**。**毛利與定價計算：沒有**（ERP 統計只算銷售額）。
- **價格追蹤（抓網頁價格、價格歷史、降價／補貨通知）**：**沒有**。沒有爬蟲或價格歷史表；只能從歷史採購單間接查某商品過去的進價。
- **庫存／倉儲**：**有**。入庫（採購入庫、其他入庫）、出庫（銷售出庫、其他出庫）、調撥、盤點、庫存流水都齊全（第 5 節）。另有獨立 WMS 模組（[WmsItemSkuDO.java#L73-L79](https://github.com/YunaiV/ruoyi-vue-pro/blob/42528bff6de57761430db057e628f7c5c979d676/yudao-module-wms/src/main/java/cn/iocoder/yudao/module/wms/dal/dataobject/md/item/WmsItemSkuDO.java#L73-L79) SKU 有成本價、售價、長寬高、毛淨重）。**跟你的 Firebase 串接**：只能透過它的 REST API（需登入 token）或 Excel 匯出；**沒有 Webhook、沒有 ERP 匯入功能**。實務上建議「抄模型」而非「串接系統」。
- **台灣在地化**：**沒有**。介面簡體中文、無繁中語系檔（前端只有 zh-CN／en）、金額單位寫「元」但無幣別概念（新台幣可直接當元用）、稅率是自由輸入的百分比（可填 5%），**沒有台灣電子發票、統一編號驗證、營業稅申報格式**。全 repo 與台灣相關的字串只有 HRM 的「台湾通行证」證件類型。

## 關鍵字

ruoyi-vue-pro、芋道、yudao、RuoYi、進銷存、ERP、WMS、MES、FMS、CRM、採購單、採購入庫、銷售出庫、庫存流水、盤點、盤盈盤虧、調撥、單號產生器、稅額計算、折扣、其他費用、Spring Boot、MyBatis Plus、Vue3、Element Plus、Redis、MySQL、多租戶、程式碼產生器、UReport2、積木報表、JimuReport、報表設計器、Excel 匯出、Fesod、EasyExcel、Spring AI、Anthropic、Claude、MCP、SKILL.md、inventory、stock ledger、purchase order、price calculation、report designer、multi-tenant、MIT
