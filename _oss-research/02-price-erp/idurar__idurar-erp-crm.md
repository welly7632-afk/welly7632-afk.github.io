# idurar/idurar-erp-crm — MERN 架構的極簡開源「客戶＋發票＋收款」系統（報價、稅率、儀表板已在 2025-07 從開源版拿掉）
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：e935dec
> GitHub：https://github.com/idurar/idurar-erp-crm｜⭐ 8939｜授權：AGPL-3.0（LICENSE 檔）；但 `backend/package.json` 寫 "Fair-code License"、README 寫「可免費個人或商業使用」，三處說法不一致｜主要語言：JavaScript｜最近更新：2026-08-14

（以下 permalink 以 `https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/` 開頭。另外會引用兩個「舊版本」快照：`51eecb0cd2aa143eacfa8260234a13c4ecd551e9`（2025-04-12，報價／稅率／付款方式還在的最後一版）與 `d7b2215a17bb2b52acfdab8f1646685d13df9a00`（2024-05-23，商品／採購／出貨模型還在的版本）。）

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** IDURAR 是 Node.js／Express＋MongoDB＋React（Ant Design＋Redux）寫的小型 ERP/CRM，但目前開源版實際上只剩「客戶管理、開發票、記錄收款、產生 PDF、系統設定」五塊；Star 很多，功能很薄。

對你（台灣小老闆、已有自建 Firebase 倉儲系統、有在下廣告）實際能拿來做的：

1. **學「開單明細列」的寫法**：發票表單用 Ant Design `Form.List` 做「一列一個品項、可新增／刪除列、數量×單價自動算小計、合計＋稅額＋總額」，用 `currency.js` 避免浮點誤差。這是做「報價單／出貨單／估價單」最小可用的範本，比較像「迷你版網頁 Excel 明細表」。
2. **學「一個 Model 檔就自動長出整套 REST API」的設計**：後端會掃描 `models/appModels/*.js`，自動為每個模型產生 `create/read/update/delete/list/listAll/search/filter/summary` 九支 API。想做自己的小後台（例如供應商報價表、比價表）可以照這個模式。
3. **學「發票 → 部分收款 → 自動判斷 paid／partially／unpaid」的收款邏輯**，以及用 Pug 樣板＋`html-pdf` 產生 PDF 發票。
4. 如果只是想要「一套英文介面、可自己架的開發票小工具」，它可以用，但請先讀第 9 節的「目前 HEAD 版本前端可能根本跑不起來」。

**不適合：** 網頁版 Excel（沒有試算表引擎、沒有可編輯格狀表）、查價／比價／價格追蹤（完全沒有）、庫存／倉儲（開源版沒有）、AI 影片或腳本（沒有任何 AI 呼叫）、台灣電子發票（沒有）。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **正式授權以 LICENSE 檔為準：GNU AGPL-3.0**（[LICENSE](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/LICENSE)）。README 末段也寫「Released under the GNU Affero General Public License v3.0」。但 [backend/package.json](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/package.json) 的 `"license"` 欄位寫 `"Fair-code License"`，README 前段又自稱 Open "Fair-Code" Source。這種不一致代表作者心態偏向「開源引流＋賣雲端版」，引用時以 AGPL 為準最保險。
- **個人使用：** 自己架、自己用、改程式碼都沒問題，不用公開任何東西。
- **公司商用：**
  - 只在公司內部用、不改程式：風險低。
  - 改了程式，並且讓「外部的人」（客戶、經銷商）透過網路使用：AGPL 要求你把**修改後的完整原始碼**提供給這些使用者。
  - 把它的程式碼片段**複製進你自己的系統**（例如你的 Firebase 倉儲 App）再對外提供：整個衍生作品原則上要跟著 AGPL 開源。如果想保持閉源，建議只「參考設計、自己重寫」，不要整段貼上。
- **付費版才有的功能（程式碼中可以直接看到）：**
  - 寄送發票 Email：[invoiceController/sendMail.js#L5-L11](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/appControllers/invoiceController/sendMail.js#L5-L11) 直接回傳 `'Please Upgrade to Premium  Version to have full features'`。
  - 報價轉發票：舊版 [quoteController/convertQuoteToInvoice.js](https://github.com/idurar/idurar-erp-crm/blob/51eecb0cd2aa143eacfa8260234a13c4ecd551e9/backend/src/controllers/appControllers/quoteController/convertQuoteToInvoice.js) 同樣只回「請升級」。
  - 頂部固定有「Try Entreprise Version」按鈕，連到 `https://entreprise.idurarapp.com`（[UpgradeButton.jsx#L24-L26](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/apps/Header/UpgradeButton.jsx#L24-L26)）；README 推廣雲端版 `cloud.idurarapp.com`。
  - 用 git 歷史查證：2024-05-23 commit `cd1430b`「remove languages」拿掉所有翻譯；2025-07-27 commit `3518aee`「init update」刪除了 Quote、Taxes、PaymentMode 三個模型與 Dashboard／Quote／Taxes／PaymentMode 頁面（我用 `git show --name-status 3518aee` 列出 24 個變更檔案確認）。也就是說，**愈新的開源版功能愈少**，完整功能留在付費雲端版。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容（來源） |
|---|---|
| 後端 | Node.js 20（`engines` 指定 20.9.0；[server.js#L7-L11](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/server.js#L5-L9) 低於 20 直接結束）、Express 4、Mongoose 8、Joi 驗證、jsonwebtoken、bcryptjs、`currency.js`、Pug＋`html-pdf`（PDF）、`@aws-sdk/client-s3`（DigitalOcean Spaces 上傳）、`resend`（寄密碼重設信） |
| 前端 | React 18、Vite 5、Ant Design 5＋`@ant-design/pro-layout`、Redux Toolkit、axios、dayjs、react-quill（[frontend/package.json](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/package.json)） |
| 資料庫 | MongoDB（本機或 MongoDB Atlas 免費方案即可） |
| 部署 | 前後端分開：後端 `npm run setup` 建初始資料後 `npm run dev`（port 8888）；前端 `npm run dev`（Vite）。沒有 Dockerfile（檔案清單中搜尋不到）。 |
| 硬體／GPU | 不需要 GPU；一般 VPS 或自己電腦即可。 |
| API Key | 必填：`DATABASE`（MongoDB 連線字串）、`JWT_SECRET`。選填：`RESEND_API`（忘記密碼信）、`DO_SPACES_KEY/SECRET/URL`（雲端圖檔）。`.env` 範本裡有 `OPENAI_API_KEY`，但只在 [server.js#L19](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/server.js#L19) 讀進變數後完全沒用到。 |
| 費用 | 軟體免費；MongoDB Atlas 免費層＋一台小主機（約每月 US$5 上下）即可，未使用任何付費 AI。 |

注意：`html-pdf` 是以 PhantomJS 為基礎的舊套件，`.env` 裡還得放 `OPENSSL_CONF='/dev/null'` 才能跑（[backend/.env](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/.env)），部署到新版 Linux 容易出問題。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree -r --name-only HEAD` 共 460 個檔案；其中 `backend/src/**/*.js` 101 個、`frontend/src/**/*.{js,jsx}` 226 個（`grep -c` 計算）；兩者合計 22,289 行（`wc -l`）。另有 `features/` 42 個多語系行銷說明 md，與程式無關。測試檔：0 個（檔名搜尋 test/spec 無結果）。

```
backend/
  .env                         # 環境變數範本（含 JWT_SECRET 佔位字）
  src/server.js                # 進入點：連 MongoDB、載入所有 model、啟動 Express(8888)
  src/app.js                   # 掛路由：/api(登入)、/api(核心+ERP, 需 JWT)、/download(PDF)、/public(檔案)
  src/models/appModels/        # 業務模型：Client.js、Invoice.js、Payment.js（只剩 3 個）
  src/models/coreModels/       # Admin、AdminPassword、Setting、Upload
  src/models/utils/index.js    # 掃描 appModels → 產生 routesList（自動路由的核心）
  src/controllers/appControllers/       # 自訂控制器：client、invoice、payment
  src/controllers/middlewaresControllers/createCRUDController/  # 通用 CRUD 九件套
  src/controllers/middlewaresControllers/createAuthMiddleware/  # 登入、JWT 驗證、忘記密碼
  src/controllers/pdfController/index.js  # Pug → HTML → html-pdf
  src/pdf/*.pug                # Invoice / Quote / Offer / Payment 的 PDF 樣板
  src/routes/appRoutes/appApi.js          # 依 routesList 自動註冊 ERP 路由
  src/routes/coreRoutes/                  # admin、setting、auth、download、public
  src/settings/useMoney.js     # 後端金額格式化（PDF 用）
  src/setup/setup.js + defaultSettings/*.json  # 初始化管理員與預設設定
  src/utils/currencyList.js, countryList.js
frontend/
  src/router/routes.jsx        # 前端路由（目前引用了不存在的 Quote/Taxes/PaymentMode 元件）
  src/modules/ErpPanelModule/  # 「單據型」通用畫面：列表、建立、編輯、閱讀、刪除、ItemRow
  src/modules/InvoiceModule/   # 發票表單、收款畫面
  src/modules/CrudModule/      # 「主檔型」通用畫面（客戶等），配合 DynamicForm
  src/forms/DynamicForm/       # 以 fields 設定檔自動產生表單
  src/components/DataTable/    # Ant Design Table 包裝的分頁列表
  src/request/request.js       # axios 包裝，17 個 API 方法
  src/redux/ , src/context/    # 狀態管理（crud、erp、settings、auth）
  src/settings/useMoney.jsx    # 前端金額格式化
  src/utils/calculate.js       # currency.js 加減乘除
  src/locale/                  # 只剩 en_us；translate() 實際上不查表
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

**5.1 自動產生 REST API（最值得學的設計）**
- [models/utils/index.js#L1-L49](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/models/utils/index.js#L1-L49)：用 `globSync('./src/models/appModels/**/*.js')` 掃出模型檔名，轉成 `{entity, modelName, controllerName}`。
- [controllers/appControllers/index.js#L1-L38](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/appControllers/index.js#L1-L38)：若 `appControllers/<name>Controller/` 資料夾存在就用自訂控制器，否則用 `createCRUDController(modelName)` 自動產生。
- [routes/appRoutes/appApi.js#L8-L26](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/routes/appRoutes/appApi.js#L8-L26)：每個 entity 掛 `/create`、`/read/:id`、`/update/:id`、`/delete/:id`、`/search`、`/list`、`/listAll`、`/filter`、`/summary` 九支路由。
- 通用 CRUD：[createCRUDController/index.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/middlewaresControllers/createCRUDController/index.js)。刪除是軟刪除（`removed: true`，見 [remove.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/middlewaresControllers/createCRUDController/remove.js)）。分頁列表支援 `q`＋`fields` 正則搜尋與 `filter/equal` 篩選，2026-02 補上「equal 不可是物件」以防 MongoDB 運算子注入（[paginatedList.js#L18-L29](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/middlewaresControllers/createCRUDController/paginatedList.js#L18-L29)）。

**5.2 發票資料模型與金額計算**
- 模型 [Invoice.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/models/appModels/Invoice.js#L51-L95)：`items[]` 只有 `itemName / description / quantity / price / total`，`product` 參照、品項折扣、品項稅率都被註解掉；表頭有 `taxRate / subTotal / taxTotal / total / currency / credit / discount / paymentStatus / status / recurring / converted`。
- 建立：[invoiceController/create.js#L29-L45](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/appControllers/invoiceController/create.js#L29-L45)：伺服器端重算每列 `quantity × price`、加總 subTotal、`taxTotal = subTotal × taxRate/100`、`total = subTotal + taxTotal`（不信任前端傳來的金額，這點正確）。之後 `increaseBySettingKey('last_invoice_number')` 遞增發票號。
- 更新：[update.js#L45-L68](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/appControllers/invoiceController/update.js#L45-L68)：同樣重算，並依既有 `credit`（已收金額）判斷付款狀態，且禁止改幣別。
- Joi 驗證：[schemaValidate.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/appControllers/invoiceController/schemaValidate.js)。
- 精準小數：前端 [utils/calculate.js#L1-L18](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/utils/calculate.js#L1-L18) 與後端 [helpers.js#L47-L60](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/helpers.js#L47-L60) 是同一份 `currency.js` 包裝（預設 2 位小數）。

**5.3 開單明細列（最接近「網頁 Excel」的部分）**
- [InvoiceForm.jsx#L193-L212](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/modules/InvoiceModule/Forms/InvoiceForm.jsx#L193-L212)：`Form.List name="items"`，每列渲染 `ItemRow`，底部「Add field」按鈕新增列；第一次載入時自動點一下新增按鈕（L60-L64）。
- [ItemRow.jsx#L48-L52](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/modules/ErpPanelModule/ItemRow.jsx#L48-L52)：數量或單價改變時用 `calculate.multiply` 算該列小計；欄位為品名／描述／數量／單價／小計（唯讀）＋刪除圖示。
- 表尾合計 [InvoiceForm.jsx#L54-L58](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/modules/InvoiceModule/Forms/InvoiceForm.jsx#L54-L58)。
- 侷限：沒有鍵盤方向鍵移動、沒有複製貼上多格、沒有公式、沒有凍結欄。只能算「表單裡的明細列」，不是試算表。

**5.4 收款與付款狀態**
- [paymentController/create.js#L30-L77](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/appControllers/paymentController/create.js#L30-L77)：可收上限 = `total − discount − credit`；收款後對發票 `$push payment`、`$inc credit`，並設 `paid／partially／unpaid`。注意：建立 Payment 與更新 Invoice 是兩次獨立寫入，沒有交易（transaction）。

**5.5 PDF 產生**
- [pdfController/index.js#L15-L79](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/pdfController/index.js#L15-L79)：讀設定（幣別符號、千分位、小數位、日期格式）→ `pug.renderFile('src/pdf/Invoice.pug')` → `html-pdf` 輸出 A4。樣板見 [Invoice.pug](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/pdf/Invoice.pug)（326 行）。
- 下載路由 [coreDownloadRouter.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/routes/coreRoutes/coreDownloadRouter.js) 與 [downloadPdf.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/handlers/downloadHandler/downloadPdf.js)：依網址 `/download/invoice/invoice-<id>.pdf` 即時產生。

**5.6 設定系統（鍵值表）**
- 所有設定存在 `Setting` 集合，以 `settingCategory／settingKey／settingValue` 儲存；預設值在 [defaultSettings/*.json](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/setup/defaultSettings/moneyFormatSettings.json)（幣別預設 USD、符號 `$`、小數 2 位）。前端金額格式化在 [useMoney.jsx#L15-L36](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/settings/useMoney.jsx#L15-L36)。

**5.7 設定檔驅動的 CRUD 頁面**
- 客戶頁只有 [Customer/config.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/pages/Customer/config.js)（欄位與型別）＋ [Customer/index.jsx](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/pages/Customer/index.jsx)，交給 `CrudModule`＋[DynamicForm](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/forms/DynamicForm/index.jsx) 自動產生表單（支援 string、textarea、number、phone、email、url、boolean、date、select、tag、array、country、async、currency、color 等型別），列表由 [DataTable.jsx](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/components/DataTable/DataTable.jsx) 依同一份 fields 產生欄位（`dataForTable`）。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 自動路由產生器（模型檔 → 9 支 API） | [models/utils/index.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/models/utils/index.js)、[appApi.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/routes/appRoutes/appApi.js)、[createCRUDController/](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/middlewaresControllers/createCRUDController/index.js) | Express、Mongoose、glob | 中 | 概念可移植到 Firebase Cloud Functions：用一份 collection 清單動態註冊 HTTPS endpoint，Firestore 取代 Mongoose。建議參考設計後自己重寫（AGPL）。 |
| 開單明細列（Form.List＋ItemRow） | [InvoiceForm.jsx](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/modules/InvoiceModule/Forms/InvoiceForm.jsx)、[ItemRow.jsx](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/modules/ErpPanelModule/ItemRow.jsx) | React、antd、currency.js | 中（你的 App 是純 JS，需改寫成原生 DOM 或換成 React） | 做「報價單／進貨單」的明細輸入；要更像 Excel 時，換成 01-web-excel 分類裡的可編輯表格元件。 |
| 金額精算工具 | [utils/calculate.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/utils/calculate.js) | currency.js | 低 | 直接在你的倉儲 App 引入 `currency.js`（MIT），照這 4 個函式包裝，避免 0.1+0.2 誤差。 |
| 部分收款／付款狀態邏輯 | [paymentController/create.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/appControllers/paymentController/create.js) | Mongoose | 低 | 在 Firestore 用 transaction 重寫（原版缺交易，順手補上）。 |
| Pug → PDF 發票 | [pdfController/index.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/pdfController/index.js)、[Invoice.pug](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/pdf/Invoice.pug) | pug、html-pdf（PhantomJS，已過時） | 中 | 樣板可留，產 PDF 改用 Puppeteer／Playwright 或前端 `window.print()`。 |
| 鍵值設定表 | [defaultSettings/](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/setup/defaultSettings/financeSettings.json)、[settingController/](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/coreControllers/settingController/index.js) | Mongoose | 低 | Firestore 一個 `settings` collection 即可，發票號遞增改用 transaction。 |
| 設定檔驅動表單 | [DynamicForm/index.jsx](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/forms/DynamicForm/index.jsx) | React、antd | 中 | 用 JSON 描述欄位就生出新增／編輯表單，適合快速做「供應商」「商品」主檔頁。 |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **沒有任何 AI 功能。** `backend/package.json` 列了 `openai` 套件，`.env` 有 `OPENAI_API_KEY` 註解範本，但全專案 `grep -rn "openai"` 只在 [server.js#L19](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/server.js#L19) 讀進變數，沒有任何呼叫。沒有 prompt 檔、沒有 MCP、沒有 Skills。
- **能不能接 Claude：** 可以自己接。因為 API 是乾淨的 REST＋Bearer JWT，最簡單的做法是寫一個 MCP 伺服器包裝 `/api/client/*`、`/api/invoice/*`、`/api/payment/*`，讓 Claude 幫你「依對話建發票」「查未收款發票」。但本身沒有現成程式碼。
- README 提到的 [llms.txt](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/llms.txt) 只是維護者的個人履歷摘要（給 AI／招募者看），與功能無關。

## 8. 擴充方式與 API

- **新增一種單據／主檔**：在 `backend/src/models/appModels/` 放一個 Mongoose 模型（例如 `Supplier.js`），重啟後自動有 `/api/supplier/create…summary` 九支 API；需要特殊邏輯再建 `appControllers/supplierController/index.js` 覆寫。前端則複製 `pages/Customer/` 改 `config.js`。
- **API 一覽**（皆需 `Authorization: Bearer <token>`，見 [isValidAuthToken.js#L11-L12](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/middlewaresControllers/createAuthMiddleware/isValidAuthToken.js#L11-L12)）：`POST /api/login` 取得 token（記住我時效 365 天，否則 24 小時）；`/api/{client|invoice|payment}/{create,read/:id,update/:id,delete/:id,list,listAll,search,filter,summary}`；`/api/setting/*`；`/api/admin/*`；`GET /download/invoice/invoice-<id>.pdf`。
- 前端呼叫層 [request.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/request/request.js)：我用 `grep -nE "^\s+[a-zA-Z]+: async"` 數出 17 個方法（create、createAndUpload、read、update、updateAndUpload、delete、filter、search、list、listAll、post、get、patch、upload、summary、mail、convert）。
- **沒有** Webhook、沒有 CSV／Excel 匯入匯出（上傳過濾器允許 csv/xlsx 檔類型，但沒有任何解析或匯入程式）、沒有外掛系統。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護狀況：** 完整歷史共 1,646 個 commit（`git rev-list --count HEAD`）。2025-08 之後的 commit 幾乎只改 README／MAINTAINERS／llms.txt；2026-03-16 合併了 4 個社群修正 PR（logo 上傳、搜尋重複呼叫、保留 JWT、MongoDB 查詢注入）。實質功能開發已停，專案目前更像維護者的作品集與雲端版引流。
- **HEAD 版前端很可能無法啟動（重要）：** [routes.jsx#L72-L116](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/router/routes.jsx#L72-L116) 仍使用 `<Quote />`、`<QuoteCreate />`、`<QuoteRead />`、`<QuoteUpdate />`、`<PaymentMode />`、`<Taxes />`，但這些變數在 2025-07 的 `3518aee` 已刪除匯入、`pages/Quote` 等資料夾也不存在。依 ES module 規則，模組載入時就會丟 `ReferenceError`。（我沒有執行程式，依原始碼判斷；若要能跑，建議改用 `51eecb0` 這個版本。）
- **初始化腳本也會壞：** [setup.js#L54-L67](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/setup/setup.js#L54-L67) 仍 `require` 已刪除的 `PaymentMode`、`Taxes` 模型；管理員與設定會先建好，之後在這裡出錯。`package.json` 的 `upgrade` 指令指向不存在的 `src/setup/upgrade.js`。
- **發票表單的稅率欄：** [InvoiceForm.jsx#L241-L259](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/modules/InvoiceModule/Forms/InvoiceForm.jsx#L241-L259) 原本是會向 `/taxes` 撈選項的 `SelectAsync`，被改成沒有 `options` 的普通 `Select`，但仍是必填；依程式碼推斷使用者選不到稅率、表單送不出去（未實際執行，列為未確認）。
- **預設帳密：** setup 建立 `admin@admin.com / admin123`（[setup.js#L18-L26](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/setup/setup.js#L18-L26)），上線前一定要改。`.env` 被提交進版控且 `JWT_SECRET` 是固定佔位字，若沒改，任何人都能偽造 token。
- **PDF 下載不需登入：** [app.js#L42](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/app.js#L42) 的 `/download` 沒掛 `isValidAuthToken`，知道發票 ObjectId 的人就能下載 PDF（含客戶資料）。
- **CORS：** [app.js#L21-L26](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/app.js#L21-L26) `origin: true, credentials: true`，任何網域都能帶憑證呼叫。
- **其他：** `express-rate-limit` 有裝但沒用（`grep rateLimit` 無結果），登入沒有防暴力破解；`search`／`list` 直接把使用者輸入丟進 `new RegExp()`（可能 ReDoS）；[filter.js#L9-L14](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/controllers/middlewaresControllers/createCRUDController/filter.js#L9-L14) 沒有跟 paginatedList 一樣的注入防護；收款與發票更新沒有交易；`summary.js` 用 `countAllDocs.length` 判斷數字，永遠走「Collection is Empty」分支。
- **測試：** 0 個測試檔。
- **遙測：** 沒有分析／追蹤碼（`index.html` 只有主程式 script）；但 [redux/store.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/redux/store.js) 等處會在瀏覽器 console 印廣告訊息，頂部有升級按鈕。
- **翻譯函式其實不翻譯：** [useLanguage.jsx#L1-L57](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/locale/useLanguage.jsx#L1-L49) 查表那行被註解掉，只把 key 轉成首字大寫，還會把每個 key 寫進 `localStorage('lang')`。

## 10. 跟其他專案組合的建議

- **不要拿它當主系統。** 同分類中 `frappe/erpnext`、`inventree/InvenTree`、`jishenghua/jshERP`、`GreaterWMS` 在商品、庫存、採購、成本方面都完整得多；IDURAR 只適合當「小型 MERN 範例」。
- **可以取的「A」：** 自動路由產生器的「概念」＋發票明細列與收款狀態邏輯，用來在你的 Firebase 倉儲 App 加一個「出貨單／請款單」模組。
- **搭配「B」（網頁 Excel）：** 把 ItemRow 換成 01-web-excel 分類的可編輯表格（例如 Handsontable 類、Univer、x-spreadsheet 類元件），得到真正能貼上、拖曳、公式的明細表。
- **搭配「C」（查價／比價）：** 價格追蹤請用 `dgtlmoon/changedetection.io`、`jez500/pricebuddy` 等；把抓到的供應商價格寫進你自己的 Firestore「供應商報價」collection，再用 IDURAR 式的明細列開單。
- **想看它「功能還在時」的樣子：** `51eecb0`（報價、稅率、付款方式、儀表板）或 `d7b2215`（另有 Product、ProductCategory、Purchase、Order、Shipment、Expense、Lead 等模型；但 Purchase／Product 參照的 `Supplier` 模型在該版也不存在，用 `git ls-tree` 確認）。

## 11. 價格相關功能檢查表

- **商品與價格資料模型：沒有（HEAD）。** 發票品項只有自由輸入的 `itemName/price`，`product` 參照被註解（[Invoice.js#L51-L95](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/models/appModels/Invoice.js#L51-L95)）。無多單位、無價目表、無客戶別價格。幣別只是單據上的字串欄位 `currency`，沒有匯率換算。舊版 [Product.js](https://github.com/idurar/idurar-erp-crm/blob/d7b2215a17bb2b52acfdab8f1646685d13df9a00/backend/src/models/appModels/Product.js) 有 `price / priceBeforeTax / taxRate / currency / suppliers[]`，但已移除。
- **進價（多家供應商報價、比價、RFQ、採購單）：沒有（HEAD）。** 舊版有 [Purchase.js](https://github.com/idurar/idurar-erp-crm/blob/d7b2215a17bb2b52acfdab8f1646685d13df9a00/backend/src/models/appModels/Purchase.js) 採購單模型（供應商、品項、單價、稅），但無比價、無 RFQ，且已刪除。HEAD 的「報價」指的是「對客戶的銷售報價單（Quote）」，也已在 2025-07 刪除（舊版 [Quote.js](https://github.com/idurar/idurar-erp-crm/blob/51eecb0cd2aa143eacfa8260234a13c4ecd551e9/backend/src/models/appModels/Quote.js)）。
- **成本（FIFO／移動平均、到岸成本、毛利定價）：沒有。** 全專案沒有成本、毛利欄位或計算。
- **價格追蹤（抓網頁價格、價格歷史、降價／補貨通知）：沒有。**
- **庫存／倉儲：沒有。** 只殘留未被使用的 [InventoryForm.jsx](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/forms/InventoryForm.jsx)（品名／數量／單價三欄）與 [generateUniqueNumber.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/backend/src/middlewares/inventory/generateUniqueNumber.js)，沒有對應模型與路由。**與你的 Firebase 倉儲串接**：只能走 REST API——在 Cloud Function 先 `POST /api/login` 取 JWT，再 `POST /api/invoice/create` 建發票；無 Webhook、無匯入匯出，回寫 Firebase 需自己輪詢 `/api/invoice/list`。
- **台灣在地化：沒有。** 介面只有英文（[translation.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/locale/translation/translation.js) 只有 `en_us`；歷史上曾有 `zh_cn`，2024-05 的 `cd1430b` 刪除，從未有 `zh_tw`）。新台幣：幣別清單有 `TWD`（[currencyList.js](https://github.com/idurar/idurar-erp-crm/blob/e935dec13cf8b6082a7e7fc4736669e5151a80a3/frontend/src/utils/currencyList.js)），可在 Money Format 設定把符號改為 `NT$`、小數位改 0。台灣稅制（5% 營業稅、統一編號欄位）與電子發票（財政部大平台、載具、字軌）：沒有。

## 關鍵字
IDURAR、idurar-erp-crm、開源 ERP、CRM、發票系統、收款管理、報價單（已移除）、MERN、Node.js、Express、MongoDB、Mongoose、React、Ant Design、Redux、Form.List、明細列、currency.js、金額精算、自動 CRUD 路由、REST API、JWT、Pug PDF、html-pdf、AGPL-3.0、Fair-code、開源閹割版、付費雲端版、invoice、payment、quote、open source ERP CRM、Node React invoicing
