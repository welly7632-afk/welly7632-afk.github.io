# apitable/apitable — 開源版 Airtable：Canvas 表格＋欄位公式＋OT 即時協作的「視覺化資料庫」平台
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：c9255a7
> GitHub：https://github.com/apitable/apitable｜⭐ 15658｜授權：AGPL-3.0（另有付費「Embedding License」與企業版）｜主要語言：TypeScript｜最近更新：2026-09-06

> 本文所有 permalink 都以 commit `c9255a752a85913e2e6b362ff6c306b0fc3585df` 為準，下文用 `{B}` 代表
> `https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df`
> （例如 `{B}/LICENSING.md` = https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/LICENSING.md ）。表格與檢查表裡的連結都是完整網址，可以直接點。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** APITable 不是「網頁版 Excel」，而是「網頁版 Airtable」——一個以「資料表（datasheet）＝欄位（field）＋紀錄（record）＋視圖（view）」為核心的多人協作資料庫，前端用 Canvas（Konva）畫表格，後端是 Java（Spring Boot）＋ Node（NestJS）＋ MySQL，內建 REST API。

**對你（台灣小老闆、自己用 Claude 寫倉儲網頁、有投廣告）可以拿來做的事：**

1. **直接自架一套「倉庫／商品／訂單」資料庫來用**：建「商品表」「進貨表」「訂單表」，用「關聯欄位（Link）＋查找（LookUp/Rollup）＋公式欄位」算庫存、成本、毛利；有看板、日曆、甘特、表單、相簿等視圖，可以分享表單給員工或廠商填。
2. **當成你現有 Firebase 倉儲網頁的「後台資料庫＋ API」**：開源版自帶 `/fusion/v1/datasheets/:dstId/records` 的 REST API（查、增、改、刪紀錄，支援 `filterByFormula`），你的純 JS 網頁可以直接 `fetch` 讀寫。
3. **廣告／比價資料整理**：把各平台價格、廣告花費貼進去（支援從 Excel／Google 試算表直接複製貼上），用公式欄位算 ROAS、毛利率，再用分享連結給合作夥伴看。
4. **拆零件給自己的工具用（A＋B＋C）**：最值得拆的是 ①「欄位式公式引擎」（lexer → parser → AST → interpreter，82 個函數名）、②「Excel 剪貼簿解析器」（HTML table / TSV 轉二維陣列）、③「拖拉填滿的等差／日期序列偵測」、④「json0 OT 指令＋復原／重做」這套資料變更模型。Canvas 表格本體因為跟 Redux／React／Next.js 綁得很深，**不建議**直接拆。

**不適合的地方（先講清楚）：** 沒有 A1 儲存格參照、沒有合併儲存格、沒有條件格式、沒有樞紐分析；一張表程式碼寫死最多 5 萬列；匯出 .xlsx 只有純文字值。如果你要的是「像 Excel 一樣格子隨便打公式」，這個專案不是那種東西。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：AGPL-3.0**（`{B}/LICENSE`，`packages/core/package.json` 也標 `"license": "AGPL-3.0"`）。
- **個人使用：** 自己裝在自己電腦或自己的伺服器上用，完全沒問題，不用付費。
- **公司商用要注意：**
  - AGPL 的重點是「**透過網路提供服務也算散布**」。如果你**修改了** APITable 原始碼，並讓員工以外的人（客戶、廠商）透過網路使用，就必須把你修改後的完整原始碼用 AGPL 公開。
  - **只是「拿來用、不改程式碼」** 給公司內部用，一般不會觸發公開義務。
  - **把它的程式碼片段（例如公式引擎）抄進你自己的倉儲網頁**：你的網頁整體就會變成 AGPL 衍生作品，若對外提供服務就得開源。所以「拆零件」最安全的做法是：**看懂原理後叫 Claude 用自己的寫法重寫**，不要整段複製。
  - `LICENSING.md` 特別寫：**嵌入頁面若拿掉「Powered by APITable」標誌，你的嵌入程式就必須 AGPL 開源**，否則要買「Advanced Embedding License」（`{B}/LICENSING.md`、`{B}/licenses/LICENSE-EMBEDDING`）。
  - 貢獻程式碼要簽 CLA（公司可以把你的貢獻拿去閉源版用）。
- **閉源／付費版才有的功能（我在程式碼裡實際看到的）：**
  - 前端 `packages/datasheet` 有 **165 行** `from 'enterprise...'` 的 import（我用 `grep -rn "from 'enterprise" src | wc -l` 數的），但 repo 裡 **沒有** `src/modules/enterprise` 資料夾；`webpack.config.js` 第 67 行在非企業版時把 `enterprise` 別名設成 `false`（空模組）：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/webpack.config.js#L67
  - 後端 room-server 有十多個 `*.dynamic.module.ts`，都是「如果 `../enterprise/xxx` 存在就載入企業模組，否則載空模組」：AI（`src/ai/ai.dynamic.module.ts`）、嵌入（`src/embed/embed.dynamic.module.ts`）、時光機、提醒、訂閱、自動化動作、WorkDoc 等。
  - README 明列託管／企業版才有：SSO／SAML、稽核、資料庫備份、ChatGPT／Zapier／Slack／Google Workspace 整合、浮水印。
  - **AI 聊天機器人（AI node / ChatPage / WidgetEmbed）全部在 enterprise 路徑**，開源版沒有。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 技術 | 位置 |
|---|---|---|
| 前端 | Next.js + React 18 + Redux + styled-components + antd 4；表格用 **Konva 8 / react-konva**（Canvas）；匯出用 **exceljs 4.1.1** | `packages/datasheet`（`package.json` 有 194 個 dependencies） |
| 共用核心 | TypeScript：資料模型、公式引擎、OT 指令、Redux store、DataBus | `packages/core`（522 個 .ts 檔、約 10 萬行，我用 find+wc 數的） |
| 協作伺服器 | NestJS 8 + socket.io 4 + TypeORM + ioredis + bull + RabbitMQ；負責 OT 合併、REST API（Fusion API） | `packages/room-server`（約 5.8 萬行） |
| 主後端 | Java 17（GraalVM）+ Spring Boot 3.2.1；帳號、空間、節點樹、匯入 Excel（**EasyExcel 3.3.3**） | `backend-server`（1,622 個 .java、約 17 萬行） |
| DataBus | Rust 編成的 WASM（`packages/databus-wasm-*` 只有編譯好的 `.wasm`，**Rust 原始碼不在這個 repo**）＋ `databus-server` Docker 映像 | `docker-compose.yaml` |
| 資料庫／中介 | MySQL 8.0.32、Redis 7.0.8、RabbitMQ 3.11.9、MinIO（附件檔案） | `.env`、`docker-compose.yaml` |
| 閘道 | OpenResty（Nginx） | `gateway/` |

**部署方式：**
- 官方一鍵：`curl https://apitable.github.io/install.sh | bash`（docker compose，共 10 個服務：web-server、imageproxy-server、backend-server、room-server、databus-server、gateway、minio、redis、mysql、rabbitmq，外加 init-db、init-appdata 兩個初始化容器）。
- 或 all-in-one 映像（pm2 版，官方說只適合測試）。
- **硬體：** README 建議 **4 CPU / 8 GB RAM 以上**；映像只有 amd64，Apple Silicon（arm64）會很慢。**不需要 GPU**。
- **API Key：** 開源版跑起來**不需要任何付費 API Key**。可選的：Sentry DSN、PostHog key（遙測，預設不設就不送）、簡訊／郵件服務。
- **費用估算：** 軟體免費；一台 4 vCPU / 8 GB 的雲端主機每月大約 US$40–80（依廠商而定，未確認實際報價）。`.env` 內預設密碼是 `apitable@com`，**上線前一定要改**。

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

（檔案總數 8,965，用 `git ls-tree -r --name-only HEAD | wc -l` 數的；其中 packages 6,429、backend-server 1,866）

```
apitable/
├── LICENSE / LICENSING.md          AGPL-3.0＋嵌入授權說明
├── docker-compose.yaml / .env      10 個服務的部署設定、映像版本、預設密碼
├── backend-server/                 Java Spring Boot 主後端
│   └── application/src/main/java/com/apitable/
│       ├── workspace/              節點樹（資料夾/資料表）、匯入 Excel/CSV
│       │   ├── service/impl/NodeServiceImpl.java   parseExcel()/parseCsv()
│       │   └── listener/           MultiSheetReadListener、CsvReadListener（EasyExcel 讀檔）
│       ├── shared/config/properties/LimitProperties.java  匯入上限（5 萬列、200 欄、20MB）
│       ├── organization/ space/ user/ auth/ automation/ template/ widget/ …
├── init-db/                        資料庫 migration（Docker 初始化用）
├── gateway/                        OpenResty 反向代理設定
├── packages/
│   ├── core/                       ★ 共用核心（前後端都用）
│   │   └── src/
│   │       ├── formula_parser/     ★ 公式引擎：lexer/ parser/ interpreter/ functions/ evaluate.ts
│   │       ├── compute_manager/    ★ 計算欄位相依圖（ComputeRefManager）＋快取
│   │       ├── engine/ot/          ★ json0 OT 動作定義與 apply（可走 WASM）
│   │       ├── command_manager/    指令執行、UndoManager（最多 50 步）
│   │       ├── commands/datasheet/ 46 個表格指令：貼上、填滿、加列、改欄、排序、篩選…
│   │       ├── model/field/        28 種欄位型別的行為（cellValueToString、驗證…）
│   │       ├── modules/database/store/interfaces/resource/datasheet/datasheet.ts  ★ 資料模型（ISnapshot/IRecord/IMeta/View）
│   │       ├── types/field_types.ts★ FieldType 列舉、各欄位 property
│   │       ├── databus/            資料存取抽象層（可自訂 Loader/Saver）
│   │       ├── sync/               前端協作房間（socket）＋ readme.md
│   │       └── event_manager/      cell_updated / record_created … 事件
│   ├── datasheet/                  ★ Next.js 前端
│   │   ├── pages/                  share/、embed/（企業版）、embed/ai/（企業版）
│   │   └── src/pc/
│   │       ├── components/konva_grid/   ★ Canvas 表格（約 1.6 萬行連同 konva_components）
│   │       ├── components/mobile_grid/  手機版表格
│   │       ├── common/clipboard/        ★ 剪貼簿：html_parser / csv_parser / serializer
│   │       └── utils/catalog.ts         匯出 xlsx/csv（exceljs）
│   ├── room-server/                ★ NestJS 協作伺服器
│   │   └── src/
│   │       ├── database/ot/services/ot.service.ts  OT 轉換、Redis 鎖、revision 檢查
│   │       ├── fusion/             REST API（/fusion/v1、/fusion/v2）
│   │       ├── automation/actions/ 自動化動作：webhook、slack、sms、ruliu
│   │       └── ai/ embed/ …        *.dynamic.module.ts（企業版插槽）
│   ├── widget-sdk/                 小程式（Widget）SDK：useRecords、addRecord、setRecords…
│   ├── components/ icons/          UI 元件庫、圖示
│   ├── api-client/ databus-client/ OpenAPI 產生的 client
│   ├── databus-wasm-web/-nodejs/   編譯好的 WASM（無原始碼）
│   ├── ai-components/              只有設定檔、沒有 src（AI 元件不在開源版）
│   ├── i18n-lang/ l10n/            多語系（含 zh-HK 繁體）
│   └── cypress/                    E2E 測試
```

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

### 5.1 公式引擎（欄位層級，不是儲存格層級）
- **函數清單：** https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/formula_parser/functions/index.ts#L46-L641
  一個 `new Map<string, IFunction>`，每個函數有 `name / func / definition / summary / example`。
- **詞法分析：** https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/formula_parser/lexer/lexer.ts#L22-L82 （`EXPR_GRAMMAR` 正規表示式表，運算子有 `+ - * / % & && || ! = != > >= < <=`）。欄位用 `{欄位名}` 參照。
- **語法分析：** https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/formula_parser/parser/parser.ts#L53-L125 （遞迴下降，`factor()` 中偵測自我參照會丟 `SelfRefError`；第 125 行用 `Functions.get()` 查函數）。
- **直譯器：** https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/formula_parser/interpreter/interpreter.ts#L43-L110 （`visit()` 走訪 AST；第 247 行呼叫函數）。
- **入口與快取：** https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/formula_parser/evaluate.ts#L110-L216 。`ExpCache` 以 `datasheetId+fieldId+expression` 當 key 快取 AST；`evaluate()` 對**每一筆紀錄**跑一次（`resolverWrapper` 依 fieldId 取該列的值）。`expressionTransform()` 把「欄位名」與「欄位 ID」互換，所以改欄位名稱公式不會壞。
- **相依圖／重算：** https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/compute_manager/compute_reference_manager.ts#L33-L63 與 #L225-L254 。`refMap`（A 被誰引用）＋`reRefMap`（反向），`getAllEffectKeysByKey()` 遞迴收集受影響的欄位，用 `Set` 避免循環。
- **重點：** 公式是「整欄共用一條公式」（像 Airtable），**不能**寫 `=A1+B2`，也不能指定某一格。跨表要先建「關聯欄位」再用「LookUp＋彙總函數（rollup：SUM/AVERAGE/COUNT…14 種，見 `types/field_types.ts#L70-L92`）」。

### 5.2 資料模型
- https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/modules/database/store/interfaces/resource/datasheet/datasheet.ts#L49-L160 （`ISnapshot = { meta, recordMap, datasheetId }`、`IMeta = { fieldMap, views }`、`IRecord = { id, data: {fieldId: value}, commentCount, recordMeta… }`）
- 視圖：同檔 #L643-L705（`IViewPropertyBase`：`rows`、`columns`、`filterInfo`、`sortInfo`、`lockInfo`；`IGridViewProperty` 多了 `frozenColumnCount`、`rowHeightLevel`、`groupInfo`、`columnGroups`）。
- 欄位型別：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/types/field_types.ts#L699-L729 （Text、Number、SingleSelect、MultiSelect、DateTime、Attachment、Link、URL、Email、Phone、Checkbox、Rating、Member、LookUp、Formula、Currency、Percent、SingleText、AutoNumber、CreatedTime、LastModifiedTime、CreatedBy、LastModifiedBy、Cascader、OneWayLink、WorkDoc、Button；扣掉 NotSupport 與 DeniedField 共 27 種可用）。
- 存進 MySQL：每筆紀錄一列，`data` 是 JSON 欄：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/room-server/src/database/datasheet/entities/datasheet.record.entity.ts#L26-L75

### 5.3 變更指令、OT、復原／重做
- OT 動作（json0 縮寫：`OI/OD/OR/LI/LD/LM/NA/TI/TD`）：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/engine/ot/interface.ts#L21-L120
- `jot.apply()` 使用 npm 的 `ot-json0`，若開啟 WASM 就改走 Rust 版：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/engine/ot/index.ts#L31-L69
- 指令 → 產出 OT actions → 推進 undo 堆疊：`command_manager/command_manager.ts`；復原：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/command_manager/undo_manager.ts#L30-L60 （上限 50 步）。
- 伺服器端合併：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/room-server/src/database/ot/services/ot.service.ts#L234-L303 （用 Redis 鎖住同一資源、逐一處理，逾時 120 秒）、#L492-L520（`transform()`：用 client 的 baseRevision 跟資料庫 revision 比，抓中間的 changesets 做轉換）。

### 5.4 Canvas 表格
- 說明：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/components/konva_grid/readme.md （Canvas 畫格子；另有 `dom_grid` 疊一層 DOM 放編輯器、右鍵選單）。
- 虛擬捲動：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/components/konva_grid/model/coordinate/coordinate.ts#L168-L260 （`rowMetaDataMap` 記每列位置，`_findNearestCellIndexByBinary` 二分搜尋算出可見的 rowStart/rowStop、columnStart/columnStop，只畫可見範圍）。
- 主元件：`konva_grid_view.tsx`（第 111 行 `KonvaGridView`）、`konva_grid.tsx`（第 46 行）、`utils/drawer.ts`（1,143 行的繪圖工具）。

### 5.5 剪貼簿（從 Excel／Google 試算表貼上）
- https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/common/clipboard/clipboard.ts#L281-L300 ：依序嘗試 `text/datasheet`（自家 JSON）→ `text/html` → `text/plain`。
- HTML：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/common/clipboard/html_parser.ts#L32-L72 （抓 `<table>`，有處理「Excel 帶浮動圖片時會多包一層 table」的情況）。
- TSV：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/common/clipboard/csv_parser.ts#L23-L60 （Tab 分欄、`"` 包儲存格、`\r\n`/`\n` 分列）。
- 貼上後由 `commands/datasheet/paste_set_records.ts`、`paste_set_fields.ts` 寫入，超出範圍會自動加列／加欄（有權限時）。

### 5.6 拖拉填滿
- 偵測序列：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/commands/datasheet/fill_data_to_cells.ts#L58-L134 （數字等差、日期依 日/月/年/時間 差；否則就複製）。
- 滑鼠放開觸發：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/components/konva_grid/hooks/use_grid_mouse_event.ts#L410-L430

### 5.7 匯入／匯出
- 匯出（前端 exceljs）：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/utils/catalog.ts#L225-L345 。每格先 `cellValueToString()` 轉字串，再 `addRows`；CSV 加 BOM（`﻿`），Excel 開中文不會亂碼。
- 匯入（後端 EasyExcel）：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/backend-server/application/src/main/java/com/apitable/workspace/service/impl/NodeServiceImpl.java#L1865-L1897 ；多工作表會各建一張表；欄位一律建成 TEXT 型別（`MultiSheetReadListener.java` 第 196、246、277、296 行），上限 5 萬列／200 欄／20MB（`LimitProperties.java#L48-L74`）。

### 5.8 REST API（Fusion API）
- https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/room-server/src/fusion/fusion.api.controller.ts#L101-L530 ：`GET/POST/PATCH/PUT/DELETE /fusion/v1/datasheets/:dstId/records`、`/fields`、`/views`、附件上傳、建表、建欄、`executeCommand`。認證 `Authorization: Bearer <token>`（`fusion/middleware/api.request.middleware.ts#L29`）。查詢參數有 `viewId`、`filterByFormula`、`fieldKey`（name/id）、`cellFormat`。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度（低／中／高） | 怎麼接到別的專案 |
|---|---|---|---|---|
| 欄位式公式引擎（lexer＋parser＋interpreter＋82 個函數名） | https://github.com/apitable/apitable/tree/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/formula_parser | dayjs/moment-timezone、lodash、i18n `t()`、Redux state（`getCellValue`、`getFieldMap`） | 中 | 留 `lexer/`、`parser/`、`interpreter/`、`functions/`；把 `evaluate.ts` 的 `resolverWrapper` 換成「從你的 JSON 物件依欄位名取值」；`t(Strings.xxx)` 換成固定繁中字串。適合給倉儲網頁做「成本＝{進價}*{數量}+{運費}」這種欄位公式。AGPL：建議讓 Claude 參考後重寫。 |
| 計算欄位相依圖 | https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/compute_manager/compute_reference_manager.ts | formula_parser 的 lexer（取欄位參照） | 低 | 270 行左右，概念很單純：refMap/reRefMap＋遞迴找受影響欄位。可直接用在你自己的公式欄位重算。 |
| Excel／Google 試算表貼上解析 | https://github.com/apitable/apitable/tree/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/common/clipboard | DOM、`string2Segment`（core） | 低 | `csv_parser.ts`（122 行）、`html_parser.ts`（264 行）幾乎是純函數；拿掉 Segment 轉換就能在純 JS 頁面用 `paste` 事件把剪貼簿變二維陣列。**記得自己加 DOMPurify**（見第 9 節）。 |
| 拖拉填滿序列偵測 | https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/commands/datasheet/fill_data_to_cells.ts#L58-L134 | dayjs | 低 | `patternFinder()` 把「已選格的值」→判斷等差／日期序列；改成吃陣列、回傳下一批值即可。 |
| json0 OT 動作＋Undo 堆疊 | https://github.com/apitable/apitable/tree/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/engine/ot 、 https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/command_manager/undo_manager.ts | `ot-json0` | 中 | 學它「每個操作都變成一組可反轉的 json0 動作（OI/OD/LI/LD…）」的設計，在 Firestore 存一份 changeset 紀錄就能做復原與歷史紀錄。直接用 npm `ot-json0`（MIT）比較乾淨。 |
| 伺服器端 OT 合併（revision＋Redis 鎖） | https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/room-server/src/database/ot/services/ot.service.ts#L234-L520 | NestJS、TypeORM、Redis、RabbitMQ | 高 | 只建議當參考：學「client 帶 baseRevision、server 補 transform、revision 不連續就拒絕」的流程。Firebase 使用者用 Firestore transaction 就能達到類似效果。 |
| 匯出 xlsx/csv（exceljs） | https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/utils/catalog.ts#L225-L345 | exceljs、Redux selectors | 低 | 拿「動態 import exceljs → addWorksheet → addRows → writeBuffer → 下載」這 20 行；CSV 加 `﻿` BOM 讓 Excel 正確顯示中文。 |
| Canvas 虛擬捲動座標模型 | https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/components/konva_grid/model/coordinate/coordinate.ts | 無（純 TS 類別） | 中 | `Coordinate` 類別只管「列高／欄寬 → 位置 → 可見範圍」，可搬去自己的 Canvas 表格；繪圖本體（Konva＋Redux）高度耦合，**不建議**整個搬。 |
| Fusion REST API 的資料格式 | https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/room-server/src/fusion/fusion.api.controller.ts | 整套後端 | 高（拆）／低（呼叫） | 不用拆：自架 APITable 後直接當後端 API 呼叫。或模仿它的 `records/fields/views` 介面設計你自己的 Firebase Cloud Functions。 |
| Widget SDK（hooks） | https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/widget-sdk/src/model/datasheet.ts#L319-L621 | React、APITable 執行環境 | 高 | 只能在 APITable 裡面當小程式用（例如寫一個「比價小程式」顯示在表格旁）。 |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **開源版沒有任何 AI 功能程式碼。** 我用 `grep -rniE "openai|anthropic|chatgpt|gpt-4|claude|langchain"` 搜整個 repo（.ts/.tsx/.java/.yaml），只找到：首頁一行行銷文字 `'Custom ChatGPT with Table in 1-Click'`（`home_wrapper.tsx` 第 96 行），以及 CI 的 `openai-pr-reviewer`（只用於 PR 審查）。
- AI 相關的入口全部指向 enterprise：
  - https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/room-server/src/ai/ai.dynamic.module.ts （企業模組不存在時回傳空的 `AiModule`）
  - `packages/datasheet/pages/embed/ai/[...all].tsx` 動態載入 `enterprise/embed/ai`
  - `packages/ai-components` 只有設定檔、沒有 `src`。
- **prompt、模型設定：** 開源版裡沒有（未確認企業版用哪個模型）。
- **MCP／Skills：** 沒有。
- **能不能換成 Claude／自己接：** 可以，但要自己做：
  1. **自動化「Webhook」動作**：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/room-server/src/automation/actions/webhook/index.ts — 可設 method、headers、JSON body，理論上可以直接 POST 到 Claude API（`x-api-key` header）；但把 Claude 回答「寫回表格」需要後續步驟或外部程式，是否能用 magic variable 串接回寫我未確認。
  2. **最實際的做法：** 寫一支小程式（Firebase Cloud Function 或 Claude Code 寫的 Node 腳本）用 Fusion API 讀紀錄 → 呼叫 Claude 產生商品文案／廣告腳本 → 再 `PATCH /fusion/v1/datasheets/:dstId/records` 寫回。這也很適合包成一個 MCP server，讓 Claude 直接查你的庫存表。
- **Claude 支援度：可接**（無原生）。

---

## 8. 擴充方式與 API

1. **REST API（Fusion API v1/v2）**：見 5.8。在個人設定產生 API Token 後用 `Authorization: Bearer`。支援 `filterByFormula`（用同一套公式語法過濾）、`fieldKey=name|id`、`cellFormat=string`。有 `ApiUsageGuard`（用量限制，數值依設定）。
2. **Widget SDK（小程式）**：`packages/widget-sdk`，React hooks：`useRecords`、`useFields`、`useActiveCell`、`useSelection`、`useCloudStorage`…；寫入：`addRecord(s)`、`setRecords`、`deleteRecords`、`addField`、`deleteField`（`model/datasheet.ts#L319-L677`）。開發工具 `@apitable/widget-cli`（`widget-cli init/start/release`）。
3. **DataBus（core 內的資料存取抽象層）**：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/databus/README.md 。實作 `IDataStorageProvider = IDataLoader（loadDatasheetPack）+ IDataSaver（saveOps）` 就能把資料來源換成別的地方——**這是把它接到 Firestore 的理論切入點**（README 自己標 work in progress）。
4. **事件**：`packages/core/src/event_manager/events/datasheet/` 有 `cell_updated`、`record_created`、`record_updated`、`record_deleted`、`field_updated`、`button_clicked` 等，自動化（robot）就是靠這些觸發。
5. **自動化動作**：webhook、slack、sms、ruliu（`room-server/src/automation/actions/`），企業版另有更多。
6. **按鈕欄位（Button）**：FieldType 28，可觸發自動化。

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

**維護狀況（看 commit 紀錄）：**
- 我用 `git fetch --depth 60` 抓近 60 個 commit 的訊息：2026 年只有 **5 個 commit**（1/19 一個修 bug、7/29 兩個功能、9/2 版本號改 1.14.0、9/6 同步）。2025 年大約每月 1–4 個，多為小修（釘釘、Stripe、時區）。
- 很多 commit 訊息是 `sync: hosted cloud`、`Merge branch 'release/1.13.0' of github.com:vikadata/vikadata`——**開源 repo 是從內部閉源 repo 定期同步出來的**，社群開發不活躍。
- 判斷：**低度維護**，能用但別期待新功能或快速修 bug。

**測試：** TS 測試檔 188 個（core 87、room-server 56、widget-sdk 23、cypress 12、datasheet 6、components 4，用檔名 `*.test.ts(x)`/`*.spec.ts(x)` 數的）；Java 測試 119 個。公式引擎有完整單元測試（`formula_parser/__tests__/` 約 3,000 行）。前端 21 萬行只有 6 個單元測試檔，偏少。

**資安／隱私：**
- `.env` 預設密碼 `apitable@com`（MySQL、Redis、MinIO 都是），對外上線前必改。
- 貼上 HTML 時直接 `measureContainer.innerHTML = html`，檔內沒有 sanitize（`html_parser.ts#L32-L33`）。在偵離 DOM 的 `div` 上設 innerHTML，`<img onerror>` 這類屬性在瀏覽器裡仍可能被觸發；**我沒有實際測試**，但你拆這段去用時請加 DOMPurify（前端依賴裡其實就有 `dompurify`）。
- 有欄位權限（`fieldPermissionMap`），公式取值時對無權限欄位會遮蔽。

**遙測：**
- 前端 PostHog：只有設定 `NEXT_PUBLIC_POSTHOG_KEY` 才啟動，且關掉自動擷取（`pages/_app.tsx#L555-L568`）。
- Sentry：前端 `initializer.ts` 沒 DSN 就不啟用；room-server 也是 `enabled: Boolean(!isDevMode && sentryDsn)`。自架預設不送。

**已知的坑：**
1. **一張表最多 5 萬筆**：`core/src/commands/datasheet/add_records.ts` 第 46 行 `const MAX_RECORD_NUM = 50000;`，第 79 行超過就丟錯——跟 README 宣稱的「100k+ rows」不一致。
2. **匯入 Excel 全部變文字欄位**，數字、日期、公式都不保留，要自己再轉欄位型別。
3. **匯出 xlsx 只有字串值**（`cellValueToString`），沒有公式、格式、數字型別。
4. 部署很重（10 個容器、建議 8 GB RAM），arm64 沒有原生映像。
5. DataBus 的 Rust 原始碼與 `databus-server` 不在此 repo，只有 `.wasm` 二進位與 Docker 映像——這部分無法自己審查或修改。
6. 前端 165 處 import 指向不存在的 enterprise 程式，自己改前端時很容易踩到「為什麼這個按鈕沒反應」。
7. 繁中翻譯是 zh-HK（6,037／6,074 個字串有翻），用語偏香港／中國（例如「撤銷」「維格列」），台灣使用者會覺得怪。

---

## 10. 跟其他專案組合的建議

- **如果你要「真的像 Excel」的試算表（A1 公式、合併儲存格、條件格式）**：APITable 不適合，應該看 Univer、Luckysheet/FortuneSheet、x-spreadsheet 這類「儲存格型」引擎，再搭配 HyperFormula（儲存格公式）或 SheetJS（xlsx 讀寫）。
- **如果你要「商品／庫存／訂單資料庫＋多視圖＋API」**：APITable 本身就是一個完整方案，可以跟 NocoDB、Teable、Baserow（同類 Airtable 替代品）比較；APITable 的優勢是 Canvas 表格順、即時協作成熟，缺點是部署重、維護慢、5 萬列上限。
- **A＋B＋C 推薦組合（給你用 Claude Code 自己做）：**
  - A：**表格 UI** 用 MIT 授權的 Canvas 表格（例如本資料夾的 `glideapps__glide-data-grid`）；
  - B：**欄位公式＋相依圖** 參考 APITable 的 `formula_parser` ＋ `compute_reference_manager` 設計，讓 Claude 重寫成無 Redux 依賴的小模組（避免 AGPL）；
  - C：**貼上／填滿／匯出** 參考 APITable 的 `clipboard/`、`fill_data_to_cells.ts`、`catalog.ts` 的 exceljs 匯出寫法；
  - 資料存在你的 **Firestore**：每張表 = 一個 collection，每筆紀錄 = 一個 document，欄位定義存在 `meta` 文件（照 APITable 的 `IMeta`/`IRecord` 結構），變更紀錄存 changeset（照 json0 格式）就能做復原和歷史。
- **跟 AI 影片／腳本工具組合**：把 APITable 當「商品素材庫」（商品名、賣點、圖片附件、價格），再用 Fusion API 把資料餵給 Claude 產生短影音腳本或廣告文案，結果寫回另一張「腳本表」，用看板視圖管理「待拍／已拍／已上架」。

---

## 11. 網頁 Excel 能力檢查表

> 連結前綴同上：`{B}` = https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df

**渲染與效能**
- **渲染方式：有，Canvas（Konva 8 + react-konva）**，外加一層 DOM 放編輯器與選單。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/components/konva_grid/readme.md
- **虛擬捲動：有。** 二分搜尋算可見列／欄範圍，只畫可見區。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/components/konva_grid/model/coordinate/coordinate.ts#L168-L260
- **10 萬列以上：沒有。** 程式碼寫死每表 5 萬筆（`MAX_RECORD_NUM = 50000`）。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/commands/datasheet/add_records.ts#L46-L81 ；README 的「100k+」我無法驗證，且與程式碼矛盾。5 萬列下的實際流暢度未確認（沒有實跑）。

**公式引擎**
- **函數數量：82 個函數名（81 個實作）。** 計算方式：數 `functions/index.ts` 裡 `Functions` Map 的 `['名稱', {` 開頭行（`grep -c "^  \['"` = 82），並按檔內註解分類：數值 19、文字 15、邏輯 12、日期時間 27、陣列 8、紀錄 1；其中 `ISERROR` 與 `IS_ERROR` 指向同一個 `logical.IsError`，所以實作 81 個。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/formula_parser/functions/index.ts#L46-L641 。（另有 LookUp 的 14 種彙總：`types/field_types.ts#L70-L92`。）注意沒有 VLOOKUP、SUMIF、IFERROR 這類 Excel 常用函數（只有 COUNTIF）。
- **解析器：有**，自寫遞迴下降：`lexer/lexer.ts` → `parser/parser.ts` → `interpreter/interpreter.ts`，入口 `evaluate.ts`。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/formula_parser/evaluate.ts#L134-L216
- **依賴圖／重算：有**，以「欄位」為節點，不是以儲存格。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/compute_manager/compute_reference_manager.ts#L225-L254
- **陣列公式：部分有。** 沒有 Excel 式的動態陣列／CSE，但有 `ARRAYCOMPACT / ARRAYUNIQUE / ARRAYJOIN / ARRAYFLATTEN` 處理 LookUp 回來的陣列（`functions/array.ts`）。
- **跨工作表參照：有，但要透過「關聯欄位＋LookUp」**，公式本身不能寫 `Sheet2!A1`。`ILookUpProperty`：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/types/field_types.ts#L108-L119
- **自訂函數：沒有。** `Functions` 是靜態 Map，整個 core/datasheet 找不到 `Functions.set(` 或註冊 API；要加函數只能改原始碼。

**編輯操作**
- **儲存格編輯：有**（每種欄位有專屬編輯器，`src/pc/components/editors/`）。
- **複製貼上：有，可直接從 Excel／Google 試算表貼上**（讀 `text/html` 的 `<table>` 或 `text/plain` 的 TSV）。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/common/clipboard/clipboard.ts#L281-L300 。Google 試算表的特殊 HTML 標記沒有特別處理，走通用 table 解析（實際貼上效果未實測）。
- **拖拉填滿：有**，數字等差、日期序列，其他複製。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/commands/datasheet/fill_data_to_cells.ts#L58-L134
- **復原／重做：有**，上限 50 步，以指令為單位（多人協作時只復原自己的）。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/command_manager/undo_manager.ts#L30-L60

**格式**
- **數字格式：有（以欄位為單位）**：小數位數、千分位、符號與位置；另有貨幣、百分比欄位。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/types/field_types.ts#L247-L286
- **條件格式：沒有。** 搜尋 `conditional format / colorRule` 在 core 與 datasheet 都沒有結果。
- **合併儲存格：沒有。**（資料庫型結構，不可能合併。2026-07 新增的是「欄位標題分組帶 columnGroups」，不是合併儲存格。）
- **凍結窗格：有（只凍結欄）**，`frozenColumnCount`；沒有凍結列（標題列本來就固定）。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/modules/database/store/interfaces/resource/datasheet/datasheet.ts#L696-L705
- **欄寬列高：欄寬有（每欄 `width`），列高只有整個視圖 4 段（`RowHeightLevel`），不能單列調整。** 同檔 #L668-L671。
- **篩選：有**（`filterInfo`，`commands/datasheet/set_view_filter.ts`）。
- **排序：有**（`sortInfo`，`set_sort_info.ts`），另有分組（`set_group.ts`）。
- **資料驗證（下拉選單）：有，用單選／多選欄位實現**（`ISelectFieldProperty.options`，`field_types.ts#L487-L490`）；沒有 Excel 式「任意儲存格驗證規則」。2026-07 新增「主欄位唯一值驗證（僅 SingleText）」。

**圖表、樞紐、附件**
- **圖表：有，但透過「小程式（Widget）」**；圖表小程式本體不在這個 repo（未確認來源），前端有 `recharts` 依賴；儀表板（dashboard）可放小程式。
- **樞紐分析：沒有**（搜尋 `pivot` 無結果）。最接近的是「分組＋統計列（statType）」。
- **圖片／附件：有**，Attachment 欄位，檔案存 MinIO（或 S3 相容儲存）。

**匯入匯出**
- **匯出 .xlsx／.csv：有（開源版）**，前端 **exceljs 4.1.1**；**保真度低**：全部轉成字串，無公式、無格式、無型別。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/datasheet/src/pc/utils/catalog.ts#L225-L345
- **匯入 .xlsx／.xls／.csv：有（開源版）**，後端 **EasyExcel 3.3.3（Alibaba）**；多工作表會建多張表；**全部建成文字欄**；上限 5 萬列、200 欄、20MB。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/backend-server/application/src/main/java/com/apitable/workspace/service/impl/NodeServiceImpl.java#L1865-L1897 、https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/backend-server/application/src/main/java/com/apitable/shared/config/properties/LimitProperties.java#L45-L74

**多人即時協作**
- **有，OT（json0）**：前端 socket.io 送 changeset（帶 baseRevision），room-server 用 Redis 鎖＋transform＋revision 檢查後廣播給同一「房間」。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/sync/readme.md 、https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/room-server/src/database/ot/services/ot.service.ts#L234-L303
- **需要的伺服器**：room-server（Node）＋ Redis ＋ MySQL ＋ RabbitMQ（＋ backend-server 處理登入／權限）。另外有協作者游標（`ENGAGEMENT_CURSOR`）。WorkDoc 文件欄位則用 Yjs（CRDT，`@hocuspocus/provider`、`yjs`）。

**資料模型**
- **有，JSON 快照**：https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/modules/database/store/interfaces/resource/datasheet/datasheet.ts#L49-L160 。簡短範例（依介面整理，ID 為示意）：
```json
{
  "datasheetId": "dstXXXX",
  "meta": {
    "fieldMap": {
      "fldName":  { "id": "fldName",  "name": "商品名稱", "type": 19, "property": {} },
      "fldCost":  { "id": "fldCost",  "name": "進價", "type": 17, "property": { "symbol": "NT$", "precision": 0 } },
      "fldQty":   { "id": "fldQty",   "name": "數量", "type": 2,  "property": { "precision": 0 } },
      "fldTotal": { "id": "fldTotal", "name": "小計", "type": 16,
                    "property": { "datasheetId": "dstXXXX", "expression": "{fldCost}*{fldQty}" } }
    },
    "views": [{ "id": "viwGrid", "name": "全部", "type": 1, "frozenColumnCount": 1,
                "columns": [{ "fieldId": "fldName", "width": 200 }, { "fieldId": "fldCost" }],
                "rows": [{ "recordId": "recA" }] }]
  },
  "recordMap": {
    "recA": { "id": "recA", "data": { "fldName": [{ "type": 1, "text": "保溫杯" }], "fldCost": 180, "fldQty": 20 },
              "commentCount": 0 }
  }
}
```
（文字欄位的值是 Segment 陣列 `[{type,text}]`，這是 `string2Segment` 的格式；公式欄位的值不存，執行時算。`type` 數字對應 `FieldType`：2 Number、16 Formula、17 Currency、19 SingleText。）
- **怎麼存進 Firestore：** 官方沒有支援。可行做法：①最簡單——自架 APITable，你的 Firebase 網頁透過 Fusion API 讀寫，不搬資料；②照上面結構把 `meta` 存成一份 document、每筆 `record` 存成 `records/{recordId}` document（官方 MySQL 也是一筆紀錄一列 JSON：`datasheet.record.entity.ts#L26-L75`）；③進階——實作 DataBus 的 `IDataLoader.loadDatasheetPack` + `IDataSaver.saveOps`（https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/core/src/databus/providers/data.saver.interface.ts#L30-L41 ），把 OT ops 套用到 Firestore（未驗證可行性，工程量大）。

**手機／繁中**
- **手機／觸控：有**，獨立的 `mobile_grid`（DOM 版）、`antd-mobile`、`react-dnd-touch-backend`、`use-long-press`。（`src/pc/components/mobile_grid/`）實際手感未確認。
- **繁體中文介面：有（zh-HK）**，6,037／6,074 個前端字串已翻（我用 Python 讀 `packages/l10n/base/strings.zh-HK.json` 與 `strings.en-US.json` 比對 key 數）；用語偏港／中（「撤銷」「維格列」）。https://github.com/apitable/apitable/blob/c9255a752a85913e2e6b362ff6c306b0fc3585df/packages/l10n/base/language.manifest.json

**嵌入方式**
- **嵌進純 JavaScript 網頁：只能用 iframe，不能當元件 import。** 前端是整個 Next.js 應用，表格元件跟 Redux store、路由、socket 綁在一起，沒有發佈成獨立表格套件。開源版可用「公開分享連結」（`pages/share/[...all].tsx`）放進 iframe；「Embed」程式碼產生器（`WidgetEmbed`）與 `/embed/` 頁面屬於 enterprise。拿掉「Powered by APITable」需付費授權。
- **套件大小：未確認**（沒有建置；前端依賴 194 個，含 antd、konva、tiptap、slate、exceljs 等，可想見很大）。
- **最小可用範例（純 JS：iframe 顯示＋用 Fusion API 讀寫）**：
```html
<!-- 1) 顯示：把 APITable 的「公開分享連結」放進 iframe -->
<iframe src="https://你的apitable網域/share/shrXXXXXXXX"
        style="width:100%;height:600px;border:0"></iframe>

<!-- 2) 讀寫：用 REST API（Token 不要放在公開網頁，正式環境請經由你的 Cloud Function 轉發） -->
<script>
const BASE = 'https://你的apitable網域/fusion/v1';
const DST  = 'dstXXXXXXXX';
const TOKEN = 'uskXXXXXXXX';            // 個人設定產生的 API Token
const H = { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' };

async function listLowStock() {
  const q = encodeURIComponent('{數量} < 10');
  const r = await fetch(`${BASE}/datasheets/${DST}/records?filterByFormula=${q}`, { headers: H });
  return (await r.json()).data.records;      // [{ recordId, fields: { 商品名稱, 數量, ... } }]
}
async function setQty(recordId, qty) {
  await fetch(`${BASE}/datasheets/${DST}/records`, {
    method: 'PATCH', headers: H,
    body: JSON.stringify({ records: [{ recordId, fields: { '數量': qty } }] }),
  });
}
listLowStock().then(rows => console.table(rows.map(x => x.fields)));
</script>
```
（路由、`Bearer`、`filterByFormula`、`fieldKey` 預設 name 都在 room-server 原始碼中確認過；回應 JSON 的 `data.records[].fields` 形狀與 PATCH body 形狀是依 `ros/record.update.ro.ts`、`vos` 命名推斷，未實際呼叫驗證。）

**API／事件**
- **監聽變更：有。** 外部：沒有開源版 outbound webhook 訂閱 API（未確認），但可用「自動化（紀錄建立／更新觸發）＋Webhook 動作」推到你的網址；內部：`event_manager/events/datasheet/cell_updated.ts` 等事件；Widget SDK 的 hooks 會自動隨資料更新重繪。
- **用程式讀寫儲存格：有。** 外部用 Fusion REST API（5.8）；APITable 內部用 Widget SDK `datasheet.setRecords([{ id, valuesMap }])`（`packages/widget-sdk/src/model/datasheet.ts#L494`）。

---

## 關鍵字
APITable、AITable、vika 維格表、Airtable 開源替代、網頁版 Excel、線上試算表、多維表格、視覺化資料庫、低程式碼、Canvas 表格、Konva、虛擬捲動、公式引擎、formula parser、欄位公式、LookUp、Rollup、關聯欄位、相依圖、OT、Operational Transformation、json0、ot-json0、即時協作、socket.io、復原重做、undo redo、拖拉填滿、fill handle、複製貼上、clipboard、Excel 貼上、exceljs、EasyExcel、xlsx 匯入匯出、CSV、REST API、Fusion API、filterByFormula、Widget SDK、小程式、DataBus、WASM、NestJS、Spring Boot、MySQL、Redis、RabbitMQ、MinIO、Docker、自架、AGPL-3.0、企業版、嵌入授權、Firestore、倉儲管理、庫存、ERP、看板、甘特圖、表單、繁體中文、zh-HK
