# nocodb/nocodb｜深入：後端、資料模型與公式
> 深入分析｜掃描日期：2026-11-04｜commit：5f2e381｜總覽資料包：_oss-research/01-web-excel/nocodb__nocodb.md

完整 commit：`5f2e38194e0bda13d8818a412bd4d723fd944cb8`（develop 分支，2026-11-04）。以下 permalink 都指向這個 commit。
本文只讀 `packages/nocodb`（後端）、`packages/nocodb-sdk`（共用函式庫與 API 用戶端）、`packages/nocodb-sdk-v2`、`docker-compose/`、`LICENSE.md`。前端 `packages/nc-gui` 沒有讀。
我沒有執行任何程式碼，只用 git 與文字搜尋閱讀。數字（函式數量等）都是我用 grep 或 `ls-tree` 自己數的，方法寫在句子裡。

## 重點結論（5–10 點）

1. **後端是 NestJS + Express + knex。** 入口 `main.ts` 開 Express，`Noco.init()` 再用 `NestFactory.create(AppModule)` 啟動 Nest（`main.ts` L17-L21、`Noco.ts` L165-L170）。`packages/nocodb/package.json` 版本 0.301.3，要求 Node 24 以上。
2. **「元資料」和「你的資料」分兩處放。** NocoDB 自己的設定（表、欄位、檢視、權限、webhook）存在「meta 資料庫」，預設 SQLite 檔 `noco.db`，用 `NC_DB` 可改成 Postgres 或 MySQL。你要接的既有業務資料庫是另一個「資料來源（Source）」，用 knex 直接連線讀寫。
3. **接既有資料庫（CE 程式碼）支援 Postgres、MySQL/MariaDB、SQLite。** 建連線的工廠 `SqlClientFactory` 只處理 mysql、sqlite3、pg（另有 TiDB、Vitess、Yugabyte 變體）。程式碼裡另有 MSSQL、Oracle、Snowflake、Databricks 的痕跡，但 SQL 函式對照表 `mssql.ts`、`oracle.ts` 在這個 commit 只是空物件，我判斷這些屬於付費版或半成品，未確認。
4. **公式不存值，每次讀取時即時轉成 SQL。** 公式欄位（Formula）是「虛擬欄位」，資料庫裡沒有對應的實體欄位。讀資料時，後端把公式解析樹轉成 `SELECT (...) AS 欄位名` 的一段 SQL。好處是永遠最新、可以排序篩選；代價是公式複雜時會拖慢整張表的查詢。
5. **公式引擎分兩半。** 「解析＋型別檢查」在 `nocodb-sdk`（前後端共用，用 `nc-jsep` 解析器），「轉 SQL」在 `packages/nocodb/src/db/formulav2/` 與 `db/functionMappings/`（每種資料庫一份函式對照）。我數到 `formulas.ts` 內有 70 個函式定義。
6. **REST API 有三代並存。** v1（`/api/v1/db/data/...`）、v2（`/api/v2/tables/:modelId/records`）、v3（`/api/v3/data/:baseName/:modelId/records`），另有每個 base 自動產生的 Swagger（`/api/v2/meta/bases/:baseId/swagger.json`）。新程式建議用 v2 或 v3。
7. **權限是「角色 → 權限名單」的靜態對照表。** 每個 controller 方法用 `@Acl('dataUpdate')` 這種標註，`utils/acl.ts` 決定哪個角色擁有哪些權限名。基礎角色：owner、creator、editor、commenter、viewer、no-access、app-user。**欄位層級權限在 CE 是空殼**（`Permission.list` 直接回傳空陣列）。
8. **Webhook 只在「透過 NocoDB 寫入」時觸發。** 觸發點在 `BaseModelSqlv2` 的 `handleHooks('after.insert' / 'after.update' …)`。用別的程式直接寫資料庫不會觸發（這是我依程式位置的推論）。送出走工作佇列，沒有 Redis 時用記憶體佇列（並行數 2）。
9. **授權是 Sustainable Use License v1.0，不是開放原始碼授權。** 自己公司內部使用、非商業或個人使用可以；對外散布只能免費且非商業。把它改成產品賣給別人、或當成對外服務提供，不在授權範圍。細節見「逐題詳解」第 9 題。
10. **給「拆零件」的建議：值得借的是想法與公式對照表的寫法，不建議直接把程式碼抄進自己的商用產品。** 程式碼本身與授權綁得很緊（nocodb-sdk 也是同一授權），耦合 meta 模型、快取、knex 擴充很深。

## 逐題詳解

### 1. packages/nocodb 架構

**頂層目錄。** 我用 `git ls-tree` 數 `packages/nocodb/src` 底下各資料夾的檔案數（只計入本次檔案清單）：`meta` 259（含 88 個 v2 遷移檔）、`db` 189、`services` 185、`helpers` 158、`modules` 141、`models` 97、`controllers` 80、`utils` 70、`plugins` 62。整個 `packages/nocodb` 共 1477 個檔案，`packages/nc-gui`（前端）2825 個，`packages/nocodb-sdk` 332 個。

**啟動流程。**
- `main.ts`：建 Express，設 CORS，監聽 `PORT`（預設 8080），再呼叫 `Noco.init()`（[main.ts L5-L23](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/main.ts#L5-L23)）。
- `Noco.init()`：`NestFactory.create(AppModule)`、接 Redis 版 Socket.IO、初始化整合（Integration）、`nestApp.init()`（[Noco.ts L165-L249](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/Noco.ts#L165-L249)）。
- `AppModule` 匯入 `AuthModule、OAuthModule、NocoModule、JobsModule` 等，並掛全域 middleware 與 guard（[app.module.ts L28-L97](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/app.module.ts#L28-L97)）。`NocoModule` 是真正註冊所有 controller 與 service 的地方。
- meta 資料庫與設定在 `InitMetaServiceProvider` 初始化：讀環境變數、建 `NcConfig`、建 `MetaService`、跑升級遷移（[init-meta-service.provider.ts L28-L120](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/providers/init-meta-service.provider.ts#L28-L120)）。該檔也有升級保護：從太舊的版本升級會直接丟錯，要求先升到 0.207.3。

**分層。** 一般請求路徑：`controllers/*.controller.ts`（路由＋`@Acl`）→ `services/*.service.ts`（商業邏輯）→ `models/*.ts`（讀寫 meta 資料庫、有快取）＋ `db/BaseModelSqlv2.ts`（對「你的資料」組 SQL）。

**EE（付費版）分流。** `utils/constants.ts` 裡 `isEE = false`、`isCloud = false`（寫死在 CE 程式碼）。很多類別在 CE 是「空殼」，例如 `Permission.list()` 回傳 `[]`。閱讀時看到 `Noco.isEE()` 判斷就是這類分流。

### 2. 怎麼接既有資料庫（Postgres／MySQL／SQLite）

分兩件事，不要混淆：

**(a) NocoDB 自己的 meta 資料庫。** 由環境變數決定，優先順序是 `NC_DB`（網址式）、`NC_DB_JSON`、`NC_DB_JSON_FILE`；都沒設就用 SQLite 檔 `noco.db`（[NcConfig.ts L104-L116](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/nc-config/NcConfig.ts#L104-L116)）。`DATABASE_URL`、`NC_DATABASE_URL` 也會被轉成 `NC_DB`（[helpers.ts L17-L28](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/nc-config/helpers.ts#L17-L28)）。範例（來自 README）：`NC_DB="pg://host:5432?u=root&p=password&d=d1"`。

**(b) 你的業務資料庫（外部 Source）。**
- 使用者在介面新增資料來源，後端 `SourcesService.baseCreate()` 接手：先驗證設定、**刪掉請求裡的 `is_meta`/`is_local`**（避免把來源指到 NocoDB 自己的 meta 庫，這是程式碼註解說明的資安修補）、建一筆 Integration 存連線設定、建 Source、再執行 `populateMeta()`（[sources.service.ts L206-L330](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/services/sources.service.ts#L206-L330)）。
- `populateMeta()` 用 `sqlClient.tableList()` 與 `relationListAll()` 讀出既有表與外鍵，轉成 NocoDB 的 Model／Column，同時跳過一份內建忽略名單（含 `nc_evolutions`、`xc_knex_migrations` 等）（[populateMeta.ts L24-L47、L238-L300](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/helpers/populateMeta.ts#L238-L300)）。之後資料庫結構有變動，可以用「Meta Sync」工作（`MetaDiffsService`）比對差異再同步。
- 驅動：`SqlClientFactory.create()` 依 `client` 值回傳 `PgClient / MysqlClient / SqliteClient`，另有 `TidbClient、VitessClient、YugabyteClient`（[SqlClientFactory.ts L10-L36](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/sql-client/lib/SqlClientFactory.ts#L10-L36)）。連線物件由 `NcConnectionMgrv2` 管理，用 LRU 快取（預設最多 500 條）。
- **寫入副作用（重要）。** 建立來源時會呼叫 `syncBaseMigration()`（內部是 `KnexMigratorv2`），程式裡對 `nc_evolutions` 資料表做 `selectAll` 與 `insert`（[KnexMigratorv2.ts L606-L610](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/sql-migrator/lib/KnexMigratorv2.ts#L606-L610)）。也就是**可能在你的業務資料庫裡新增 `nc_evolutions` 這張表**。我沒有逐行確認建表那一步，所以請先在測試庫試，並給 NocoDB 一個權限受限的帳號（若只想讀，可能無法完整使用）。
- **內網位址預設被擋。** 外部資料庫連線在連線當下檢查解析後的 IP，`private、loopback、linkLocal` 等範圍預設拒絕（[dbSsrfLookup.ts L24-L36](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/helpers/dbSsrfLookup.ts#L24-L36)）。自架時若資料庫在區網或同一台機器，要設 `NC_ALLOW_LOCAL_EXTERNAL_DBS=true`（或 `NC_DISABLE_SSRF_PROTECTION=true`）（[ssrf.ts L22-L59](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/ssrf.ts#L22-L59)）。這很容易讓人卡住。
- 另有 `NC_CONNECT_TO_EXTERNAL_DB_DISABLED` 可禁止建外部來源（`Noco.ts` L83-L89 讓 `NC_MINIMAL_DBS=true` 連動開啟它；`bases.service.ts` L347 會檢查）。

### 3. 欄位型別

**UI 型別（UITypes）。** `nocodb-sdk` 的 `UITypes` 列舉我數到 46 個成員（數 `UITypes.ts` L14-L60 內含 `= '` 的行）：`ID、LinkToAnotherRecord、Lookup、SingleLineText、LongText、Attachment、Checkbox、MultiSelect、SingleSelect、Date、Year、Time、PhoneNumber、Email、URL、Number、Decimal、Currency、Percent、Duration、Rating、Colour、Formula、Rollup、Count、DateTime、CreatedTime、LastModifiedTime、AutoNumber、Geometry、JSON、SpecificDBType、Barcode、QrCode、Button、Links、User、CreatedBy、LastModifiedBy、Order、UUID` 等（[UITypes.ts L14-L60](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/UITypes.ts#L14-L60)）。

**虛擬欄位。** 下列型別在資料庫沒有實體欄位，由 `isVirtualCol()` 判斷：`LinkToAnotherRecord、Formula、QrCode、Barcode、Rollup、Lookup、Links、CreatedTime、LastModifiedTime、CreatedBy、LastModifiedBy、Button`（[UITypes.ts L374-L393](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/UITypes.ts#L374-L393)）。

**UI 型別 ↔ 資料庫型別。** 每種資料庫一個 `*Ui.ts`（`PgUi、MysqlUi、SqliteUi`，另有 `MssqlUi、OracleUi、SnowflakeUi、DatabricksUi`）：
- 建新欄位：`getDataTypeForUiType()`。以 Postgres 為例，`SingleLineText→text`、`Checkbox→bool`、`Number→bigint`、`Decimal→decimal`、`Currency→decimal`、`Percent→double precision`、`Rating→smallint`、`SingleSelect→text`、`MultiSelect→text`（[PgUi.ts L1872-L1972](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/sqlUi/PgUi.ts#L1872-L1972)）。**單選與多選在資料庫裡其實是 text**，選項清單存在 meta 庫（`nc_col_select_options_v2`）。
- 接既有表時反向推：`getUIType()` 先把資料庫型別歸成抽象型別，再對應成 UI 型別：整數→Number、布林→Checkbox、浮點→Decimal、date→Date、datetime→CreatedTime（注意：不是 DateTime）、字串→SingleLineText、text→LongText、blob→Attachment、enum→SingleSelect、set→MultiSelect、json→LongText（[PgUi.ts L1841-L1870](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/sqlUi/PgUi.ts#L1841-L1870)）。使用者可事後在介面改欄位 UI 型別。

**meta 資料庫的表。** `MetaTable` 列舉定義表名，我數 `globals.ts` 內該列舉含 `= '` 的行為 209 個（含 EE 預留，不是 CE 都用到）。與資料模型最相關的：`nc_bases_v2`（專案）、`nc_sources_v2`（資料來源）、`nc_models_v2`（表）、`nc_columns_v2`（欄位）、`nc_col_relations_v2`（連結）、`nc_col_select_options_v2`、`nc_col_lookup_v2`、`nc_col_rollup_v2`、`nc_col_formula_v2`、`nc_filter_exp_v2`、`nc_sort_v2`、`nc_hooks_v2`、`nc_api_tokens`、`nc_base_users_v2`（[globals.ts L1-L91](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/globals.ts#L1-L91)）。檢視各有 `*_view_v2` 與 `*_view_columns_v2`（grid、form、gallery、kanban、calendar、map 等）。

**Column 模型。** `models/Column.ts`（2543 行）欄位含 `title`（顯示名）、`column_name`（實際欄位名）、`uidt`（UI 型別）、`dt`（資料庫型別）、`pk、rqd、unique、cdf（預設值）、meta` 等（[Column.ts L29-L82](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/models/Column.ts#L29-L82)）。「標題」與「資料庫實際欄位名」分開存，這是它能對既有資料庫改中文顯示名而不動資料庫的原因。

### 4. 公式引擎（解析與轉 SQL 的位置）

整條管線如下：

```
使用者輸入  IF({數量}>10, {單價}*0.9, {單價})
  ① 把 {欄位名} 換成 {欄位ID}      nocodb-sdk/src/lib/formulaHelpers.ts
  ② nc-jsep 解析成語法樹            nocodb-sdk/src/lib/formula/jsepInstances.ts + hooks.ts
  ③ 驗證函式名/參數/型別，標註 dataType   nocodb-sdk/src/lib/formula/validate-extract-tree.ts
  ④ 存「公式字串」+「已驗證的語法樹 parsed_tree」到 nc_col_formula_v2
  ⑤ 讀資料時：語法樹 → knex.raw 片段 → 嵌入 SELECT   nocodb/src/db/formulav2/*
  ⑥ 各資料庫用自己的函式對照表改寫函式名/語法      nocodb/src/db/functionMappings/*
```

**① 欄位名換 ID。** 儲存前，後端用 `substituteColumnAliasWithIdInFormula()` 把 `{標題}` 換成 `{欄位ID}`，比對順序是 id、title、column_name（[formulaHelpers.ts L15-L45](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formulaHelpers.ts#L15-L45)）。這樣改欄位名不會弄壞公式。

**② 解析。** 用的是 `nc-jsep`（jsep 的分支，JavaScript 運算式解析器）。`formulaJsep` 裝了兩個外掛：`jsepCurlyHook`（把 `{欄位}` 當一個識別字）與 `jsepEqualsHook`（把 Airtable 風格的單一 `=` 當成 `==`）（[jsepInstances.ts L8-L11](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/jsepInstances.ts#L8-L11)、[hooks.ts L41-L106](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/hooks.ts#L41-L106)）。

**③ 函式表與驗證。** `formulas.ts` 是一個 `Record<string, FormulaMeta>`，每個函式寫明參數數量、型別、說明、範例、回傳型別（[formulas.ts L32-L66](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/formulas.ts#L32-L66)）。我用 grep 數頂層鍵 `^  [A-Z_0-9]*: {` 得 70 個，包括：算術 `ADD AVG ABS CEILING FLOOR ROUND ROUNDUP ROUNDDOWN MOD POWER SQRT LOG EXP INT EVEN ODD MIN MAX`；文字 `CONCAT TRIM UPPER LOWER LEN LEFT RIGHT MID SUBSTR REPLACE SEARCH REPEAT URL URLENCODE REGEX_MATCH REGEX_EXTRACT REGEX_REPLACE MD5 SHA256 SHA512`；日期 `NOW DATEADD DATESTR DATETIME_FORMAT DATETIME_DIFF DAY MONTH YEAR HOUR WEEKDAY WEEKNUM`；邏輯 `IF SWITCH AND OR XOR ISBLANK ISNOTBLANK TRUE FALSE BLANK`；陣列／彙總 `ARRAYUNIQUE ARRAYSORT ARRAYCOMPACT ARRAYSLICE COUNT COUNTA COUNTALL`；其他 `RECORD_ID VALUE JSON_EXTRACT LAST_MODIFIED_TIME`。驗證主函式是 `validateFormulaAndExtractTreeWithType()`（[validate-extract-tree.ts L753-L778](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/validate-extract-tree.ts#L753-L778)）。它會檢查函式名是否存在、**該資料庫是否不支援**（呼叫 `sqlUI.getUnsupportedFnList()`，[L814](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/formula/validate-extract-tree.ts#L814)）、參數個數、型別，並偵測循環參照。

不支援名單實例：SQLite 不支援 `XOR、REGEX_*、VALUE、COUNT、COUNTA、DATESTR、ARRAY*、MD5、SHA*`（[SqliteUi.ts L1022-L1040](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/sqlUi/SqliteUi.ts#L1022-L1040)）；MySQL 不支援 `COUNT、COUNTA、DATESTR、ARRAY*`（[MysqlUi.ts L1478-L1486](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/sqlUi/MysqlUi.ts#L1478-L1486)）；Postgres 的不支援清單是空陣列（[PgUi.ts L2311-L2313](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb-sdk/src/lib/sqlUi/PgUi.ts#L2311-L2313)）。**Postgres 的公式功能最完整。**

**④ 儲存。** `columns.service.ts` 的 Formula 分支先驗證，再用 `formulaQueryBuilderv2` 加 `validateFormula: true` 實際跑一次，失敗就把錯誤訊息存進欄位而不是整個失敗（[columns.service.ts L4625-L4700](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/services/columns.service.ts#L4625-L4700)）。`FormulaColumn` 模型存 `formula`、`formula_raw`、`error`、`parsed_tree`（[FormulaColumn.ts L8-L58](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/models/FormulaColumn.ts#L8-L58)），`parsed_tree` 欄位是後來用遷移 `nc_038` 加的 text 欄位。

**⑤ 轉 SQL。** 核心是 `db/formulav2/formulaQueryBuilderv2.ts`（1034 行）。
- 先把表中每個欄位建成「別名→SQL 片段」的對照（`aliasToColumn`）：普通欄位變成 `"表"."欄位"`、Formula／Button 遞迴展開、User 類欄位把 user id 換成 email 等（[L117-L476](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/formulav2/formulaQueryBuilderv2.ts#L117-L476)）。
- 再用遞迴函式 `fn()` 走語法樹：`CallExpression` 交給 `callExpressionBuilder`，`Literal` 變成 `knex.raw('?', [值])`（有綁定參數，不是字串拼接），`Identifier` 查對照表，`BinaryExpression`、`UnaryExpression` 各有處理（[L481-L594](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/formulav2/formulaQueryBuilderv2.ts#L481-L594)）。
- `callExpressionBuilder` 在 `parsed-tree-builder.ts`，例如 `ADD/SUM` 被改寫成「`COALESCE(第一個,0) + 其餘`」，避免 NULL 使整個結果變 NULL（[parsed-tree-builder.ts L46-L100](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/formulav2/parsed-tree-builder.ts#L46-L100)）。這對「成本、毛利」類公式有實用價值。
- 讀資料時由 `select-object.ts` 把結果嵌進查詢，`<公式SQL> as <欄位別名>`；若建公式失敗，就選 `'ERR'` 當值（[select-object.ts L412-L441](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/BaseModelSqlv2/select-object.ts#L412-L441)），入口是 `BaseModelSqlv2.getSelectQueryBuilderForFormula()`（[BaseModelSqlv2.ts L1746-L1782](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/BaseModelSqlv2.ts#L1746-L1782)）。
- 排序與篩選同樣走這套（`formula.general.handler.ts` 的 `applySort` 重新呼叫 `formulaQueryBuilderv2`，[L39-L78](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/field-handler/handlers/formula/formula.general.handler.ts#L39-L78)）。

**⑥ 各資料庫改寫。** `mapFunctionName()` 依連線的 `clientType()` 選對應表（mysql、pg、sqlite、databricks、mssql、oracle），表裡的值可以是字串（單純改名，例如 pg 的 `LEN→length`、`MIN→least`）或函式（自己組 SQL）（[mapFunctionName.ts L74-L108](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/mapFunctionName.ts#L74-L108)）。檔案規模（我用 `wc -l` 數）：`pg.ts` 890 行、`sqlite.ts` 396 行、`mysql.ts` 320 行、共用 `commonFns.ts` 898 行；`mssql.ts` 與 `oracle.ts` 各 3 行，內容是空物件。範例：Postgres 的 `DATEADD` 組成 `(日期)::DATE + (數量 || '單位')::interval`，單位必須在白名單（`day、week、month、year、hour、minute、second`）內（[pg.ts L216-L250](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/functionMappings/pg.ts#L216-L250)）。

**資安補丁值得學。** 已存的語法樹被重用時會再驗一次函式名白名單，因為函式名最後會原樣放進 `knex.raw`（註解引用 GHSA-frqc）（[assertParsedTreeFunctions.ts L1-L84](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/formulav2/assertParsedTreeFunctions.ts#L1-L84)）。你自己做公式引擎時，「使用者輸入的函式名不能直接拼進 SQL」是必修課。

**公式驗證的實跑。** 建公式時會用 `SELECT 公式 FROM 表` 實際跑一次（可限定 1 筆），錯誤才存下來；成功再清掉舊錯誤（[formulaQueryBuilderv2.ts L914-L950](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/formulav2/formulaQueryBuilderv2.ts#L914-L950)）。

**「公式轉成實際欄位」。** 目錄 `services/formula-column-type-changer/` 有 pg、mysql、sqlite、mssql、oracle 各自的 `*-data-migration.ts`，名稱暗示可以把公式欄位轉成一般欄位並搬資料；我只看了檔名，沒有開啟內容，細節未確認。

### 5. REST API／SDK

**三代路由。**
- v1：`/api/v1/db/data/:orgs/:baseName/:tableName`（[data-alias.controller.ts L31-L32](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/controllers/data-alias.controller.ts#L31-L32)）。另有 `find-one、groupby、count、:rowId/exist`。
- v2：`GET/POST/PATCH/DELETE /api/v2/tables/:modelId/records`，另有 `/count`、`/aggregate`、`/bulk/datalist`、`/:rowId`、`/:rowId/move`、`/links/:columnId/records/:rowId`（[data-table.controller.ts L30-L240](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/controllers/data-table.controller.ts#L30-L240)）。`:modelId` 是 meta 裡的表 ID，不是資料庫表名。
- v3：`/api/v3/data/:baseName/:modelId/records`，含 `records/upsert`、`links/:columnId/:rowId`、欄位檔案上傳（[constants/controllers.ts L1-L3](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/constants/controllers.ts#L1-L3)、[data-v3.controller.ts L85-L317](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/controllers/v3/data-v3.controller.ts#L85-L317)）。v3 的 meta 路由（建表、欄位、篩選、排序）在 `controllers/v3/*`。
- 每個 base 自動產生 OpenAPI：`GET /api/v2/meta/bases/:baseId/swagger.json`，並有 `/swagger`、`/redoc` 網頁（[api-docs.controller.ts L25-L100](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/controllers/api-docs/api-docs.controller.ts#L25-L100)）。這份 JSON 很適合直接餵給 Claude Code 讓它寫呼叫程式。
- 我用 grep 數 `controllers/` 底下 `@Controller/@Get/@Post/@Patch/@Delete/@Put` 標註共 375 行（含子資料夾），代表 meta 與資料端點很多，不必一一讀。

**速率限制。** `DataApiLimiterGuard` 是「直接放行」的空殼，註解明說要在反向代理或 WAF 層做限流（[data-api-limiter.guard.ts L1-L16](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/guards/data-api-limiter.guard.ts#L1-L16)）。對外開放時要自己在 Nginx／Cloudflare 擋。

**SDK。**
- `packages/nocodb-sdk`（npm 名 `nocodb-sdk`，版本 0.301.3）：前後端共用。包含自動產生的 `Api.ts`（約 20123 行，我用 `wc -l` 數 `git show` 輸出）、`UITypes`、公式引擎、`sqlUi`。它的 `package.json` 授權欄位也是 `Sustainable Use License`。
- `packages/nocodb-sdk-v2`：較小，`Api.ts` 3542 行，另有 `sdk/nocodb.ts、workspace.ts、base.ts`。它的 workspace 概念偏向雲端版，是否適用 CE 未確認。
- 也可以不用 SDK，用任何語言以 HTTP 呼叫；對台灣小老闆自建工具，較省事的做法是 HTTP＋API token（見第 7 題）。

### 6. Webhook

- **設定 API：** `POST/GET /api/v2/meta/tables/:tableId/hooks`、`PATCH/DELETE /api/v2/meta/hooks/:hookId`、`POST .../hooks/test`、`GET .../hooks/:hookId/logs`、手動觸發 `POST /api/v2/meta/hooks/:hookId/trigger/:rowId`（[hooks.controller.ts](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/controllers/hooks.controller.ts#L31-L170)）。
- **事件與操作：** 事件 `after / before / manual / view / field / comment`；操作 `insert、update、delete、trigger` 等；還有 `trigger_fields`（只在特定欄位變動時觸發）、篩選條件、`retries`、`retry_interval`、`timeout` 欄位（型別定義在 SDK 的 `HookType`，`Api.ts` 約 L6945-L7010）。
- **觸發點：** 寫入資料時 `BaseModelSqlv2` 呼叫 `handleHooks('after.insert' …)`（[BaseModelSqlv2.ts L5943](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/BaseModelSqlv2.ts#L5943)、[L6434](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/db/BaseModelSqlv2.ts#L6434)）→ `HookHandlerService.handleHooks()` 查出該表符合事件的 hook，對每個啟用中的 hook 丟一個 `HandleWebhook` 工作（[hook-handler.service.ts L41-L180](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/services/hook-handler.service.ts#L41-L180)）。同一個函式還順便處理 Form 表單提交時寄 email 通知。
- **送出：** `webhook-handler.processor.ts` 取出工作後呼叫 `invokeWebhook()`（[webhook-handler.processor.ts L1-L50](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/modules/jobs/jobs/webhook-handler/webhook-handler.processor.ts#L1-L50)），內部用 axios 發出 HTTP 請求，timeout 寫死 30 秒，請求與回應大小有上限（[webhook-invoker.ts L160-L190](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/webhook-invoker.ts#L160-L190)）。標頭與內文用 Handlebars 範本（`parseBody()`，[webhookHelpers.ts L52-L64](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/helpers/webhookHelpers.ts#L52-L64)）帶入資料。
- **佇列：** 有 Redis 就走 Redis（bull）；沒有則用記憶體 `p-queue`，並行數預設 2（[fallback-queue.service.ts L28-L50](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/modules/jobs/fallback/fallback-queue.service.ts#L28-L50)）。記憶體佇列在重啟時工作會消失（推論）。
- **未確認：** 設定裡有 `retries`、`retry_interval`，但我在 `webhook-invoker.ts`、`webhookHelpers.ts` 用 grep 找不到使用它們的重試邏輯（只找到 timeout 相關字樣），所以**不要假設 CE 會自動重送**。
- **安全預設：** webhook 目標若是內網位址，預設被 SSRF 保護擋下；自架要打自己內網服務時設 `NC_ALLOW_LOCAL_HOOKS=true`（[ssrf.ts L33-L38](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/ssrf.ts#L33-L38)）。

### 7. 權限

**驗證（你是誰）。** 全域 `GlobalGuard` 依序嘗試：`xc-auth` 標頭或 `nc_token` cookie（JWT，登入後給的）→ `xc-token` 標頭或 `Authorization: Bearer`（API token）→ OAuth token → `xc-shared-base-id`（公開分享連結）→ 都失敗就當 guest（[global.guard.ts L10-L100](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/guards/global/global.guard.ts#L10-L100)）。API token 取得見 `getApiTokenFromHeader`（[apiHelpers.ts L97-L117](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/helpers/apiHelpers.ts#L97-L117)）。token 會檢查是否啟用、是否過期、以及是否限定某個 base（[authtoken.strategy.ts L18-L58](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/strategies/authtoken.strategy/authtoken.strategy.ts#L18-L58)）。建立 base 專屬 token 的 API：`POST /api/v2/meta/bases/:baseId/api-tokens`。

**授權（你能做什麼）。** 每個端點標 `@Acl('權限名')`（[extract-ids.middleware.ts L1469-L1500](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/middlewares/extract-ids/extract-ids.middleware.ts#L1469-L1500)，可再設 `blockApiTokenAccess` 等選項）。`utils/acl.ts`（1215 行）把角色對應到權限名：
- 角色階層：base 層 `app-user < viewer < commenter < editor < creator < owner`（[acl.ts L9-L28](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/acl.ts#L9-L28)）；超級管理員 `super` 擁有 `'*'`（[L374](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/acl.ts#L374)）。
- `editor` 才有 `dataUpdate、dataDelete、dataInsert、dataUpsert`；`viewer` 只能看（[acl.ts L583-L610](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/utils/acl.ts#L583-L610)）。
- 另有「某角色不可見某張表」的 `nc_disabled_models_for_role_v2`（`ModelRoleVisibility`）。
- **欄位／記錄層級權限（Permission 模型）在 CE 是空殼**，`list()` 直接回傳空陣列（[Permission.ts L33-L40](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/packages/nocodb/src/models/Permission.ts#L33-L40)）。要「業務員只能看自己的客戶」這類列級權限，CE 做不到（以這份程式碼判斷）。

### 8. 自架需求

- **最小：** 一個容器就能跑，SQLite 存 meta，資料夾掛 `/usr/app/data`（README 範例）。這是試玩用。
- **建議正式配置：** Postgres 當 meta ＋ Redis ＋ NocoDB 主程式，另可開獨立 worker 容器（`NC_WORKER_CONTAINER=true`，且此時 `NC_REDIS_URL` 是必填，否則啟動丟錯，見 `Noco.ts` L197-L202）。官方範例 `docker-compose/1_Auto_Upstall/docker-compose.yml` 有 `nocodb`、`worker`、`db`（postgres:17.10）、`redis` 四個服務（[docker-compose.yml L11-L70](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/docker-compose/1_Auto_Upstall/docker-compose.yml#L11-L70)）。
- **重要環境變數（我實際在程式碼看到的）：** `NC_DB`、`NC_AUTH_JWT_SECRET`（JWT 密鑰，沒設會自動產生存 meta）、`NC_REDIS_URL`、`NC_SITE_URL`、`NC_ADMIN_EMAIL`＋`NC_ADMIN_PASSWORD`（預先建管理員）、`NC_DISABLE_TELE`（關遙測）、`NC_ALLOW_LOCAL_EXTERNAL_DBS`／`NC_ALLOW_LOCAL_HOOKS`（見上）。
- **Node 版本：** 後端要求 Node 24 以上（`package.json` engines）。
- **資源：** 我沒有量測記憶體與 CPU，未確認。

### 9. Sustainable Use License 對個人與公司的影響

授權全文在 `LICENSE.md`（2026-01-29 更新），開頭說明 master 與 develop 分支內容適用 SUL，其他分支「不授權」（[LICENSE.md L1-L10](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/LICENSE.md#L1-L10)）。關鍵條文是「限制」一節：

> You may use or modify the software only for your own internal business purposes or for non-commercial or personal use. You may distribute the software or provide it to others only if you do so free of charge for non-commercial purposes.（[LICENSE.md L25-L27](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/LICENSE.md#L25-L27)）

白話整理（**不是法律意見**，要做商業決定請找專業人士）：

| 情境 | 依條文判斷 |
|---|---|
| 你個人自架，記自己的資料 | 可以（個人使用） |
| 你自己公司內部用它管倉儲、報價 | 可以（自己的內部商業用途） |
| 修改它的程式碼給自己公司用 | 可以（但修改版要附明顯修改聲明，並保留授權與版權標示） |
| 把改過的版本免費、非商業地分享給別人 | 條文允許，但要附上授權條款 |
| 收費提供給客戶使用（SaaS、代管、賣安裝服務） | 超出「內部使用」與「免費非商業散布」，**不在授權範圍**（未見另外授權） |
| 把其中的程式碼抄進你要賣的軟體 | 同上，風險高 |
| 公司自用，但關係企業（集團）共用 | 條文把「你的公司」定義成包含受同一控制的組織（[L57](https://github.com/nocodb/nocodb/blob/5f2e38194e0bda13d8818a412bd4d723fd944cb8/LICENSE.md#L57)），集團內部使用大致仍算內部，但邊界要請專業判斷 |

其他重點：
- 違反後授權自動終止；收到通知後 30 天內停止違規可以恢復（Termination 一節）。
- 專利授權：你若對它提專利侵權主張，專利授權立即終止。
- `packages/nocodb-sdk/LICENSE.md`（2026-01-09 版）與 `packages/nc-gui/LICENSE.md` 也有授權檔；SDK 的 `package.json` 也標 SUL。也就是**連 SDK 都不是 MIT／Apache 類寬鬆授權**，不能當「可自由嵌入」的函式庫。
- 這個 repo 對外常被稱為「開源」，但 SUL 不符合 OSI 對開源的定義；要不要把成果對外販售，請以此為準。

## 程式碼導讀路線

想自己讀，建議依序：

1. `packages/nocodb/src/main.ts` → `Noco.ts`（`init()`）→ `app.module.ts`：搞懂啟動。約 30 分鐘。
2. `utils/nc-config/NcConfig.ts`、`helpers.ts`、`constants.ts`：環境變數如何變成 meta 資料庫設定。
3. `utils/globals.ts`（`MetaTable`）、`models/Column.ts`、`models/Model.ts`、`models/Source.ts`：資料模型長什麼樣。
4. `helpers/populateMeta.ts` ＋ `services/sources.service.ts`：外部資料庫如何被「吃進來」。
5. `nocodb-sdk/src/lib/UITypes.ts` ＋ `sqlUi/PgUi.ts`：欄位型別對應。
6. 公式：`nocodb-sdk/src/lib/formula/formulas.ts` → `validate-extract-tree.ts` → `nocodb/src/db/formulav2/formulaQueryBuilderv2.ts` → `parsed-tree-builder.ts` → `db/functionMappings/pg.ts`。這條線是最值得細讀的。
7. `controllers/data-table.controller.ts` → `services/data-table.service.ts` → `services/datas.service.ts` → `db/BaseModelSqlv2.ts`（11238 行，只讀 `dataList`、`insert`、`updateByPk` 即可）：一個 API 請求如何走到 SQL。
8. `guards/global/global.guard.ts` → `middlewares/extract-ids/extract-ids.middleware.ts`（`Acl`）→ `utils/acl.ts`：權限。
9. `services/hook-handler.service.ts` → `utils/webhook-invoker.ts`：webhook。

## 可以借用的部分與拆出方法

先重申授權：**若只是自己內部使用，可以讀、改、用；若想包進要賣或對外收費的產品，授權不允許。** 下列「借用」以「借想法、自己重寫」為主。

| 想借的東西 | 位置 | 依賴 | 難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 公式語法樹解析＋型別檢查 | `nocodb-sdk/src/lib/formula/*` | `nc-jsep`、`UITypes`、`sqlUi` | 中 | 純 TypeScript，沒有 Nest／資料庫依賴，是最容易獨立出來的一塊。但它綁 NocoDB 的 `ColumnType`、`getMeta` 介面，要寫一層轉接。**授權仍是 SUL**，個人／內部可，商品化不行。 |
| 「語法樹 → 各資料庫 SQL」 | `db/formulav2/*`、`db/functionMappings/*` | knex 與 NocoDB 的 `CustomKnex` 擴充、`Model/Column` 模型、快取 | 高 | 與 meta 模型、`aliasToColumn` 緊耦合。建議只借「函式對照表」的寫法（字串改名＋函式組 SQL），用自己的語法樹重寫。 |
| 「公式即時轉 SQL、不存值」的設計 | 同上 | 無 | 想法本身 | 直接借概念：儲存公式字串＋已驗證語法樹，讀時嵌進 SELECT。倉儲系統的「毛利＝售價−成本」可照做。 |
| 把既有資料庫「吃進來」 | `helpers/populateMeta.ts`、`db/sql-client/lib/*` | knex、各驅動 | 中 | 讀表／外鍵、推斷欄位型別這套流程可參考；自己用 `information_schema` 重寫也不難。 |
| UI 型別↔資料庫型別對照 | `nocodb-sdk/src/lib/sqlUi/*` | 無（純函式） | 低 | 當作「對照表資料」參考。 |
| 權限靜態對照表＋`@Acl` 標註 | `utils/acl.ts`、`Acl` 裝飾器 | NestJS | 低～中 | 做法簡單可複製：權限名列在一張表、角色用 include/exclude 組合。 |
| Webhook 管線 | `hook-handler.service.ts`、`webhook-invoker.ts`、`ssrf.ts` | Nest、bull／p-queue | 中 | SSRF 保護（連線當下檢查解析後 IP）寫得細，值得學。 |
| 自動產生 OpenAPI | `services/api-docs/*` | 未開啟 | 未確認 | 想要「資料表一建好就有 API 文件」可看這裡；我沒有讀實作。 |

與 Claude Code 搭配的做法：把 `swagger.json`（每個 base 一份）丟給 Claude，請它寫呼叫腳本；要重做公式，把 `formulas.ts` 與 `functionMappings/pg.ts` 當「規格範例」貼給 Claude，請它依你的資料模型重寫，而不是複製檔案。

## 坑與限制

1. **授權不是開源授權。** 做商品或收費服務前務必先確認；SDK 也同一授權（見第 9 題）。
2. **內網資料庫連不上。** 預設 SSRF 保護會擋私有位址，要設 `NC_ALLOW_LOCAL_EXTERNAL_DBS=true`。同理 webhook 打內網要 `NC_ALLOW_LOCAL_HOOKS=true`。
3. **可能在你的資料庫放 `nc_evolutions`。** 建立外部來源時有遷移流程碰這張表（見第 2 題），請先在測試庫試。
4. **公式跟資料庫綁。** 同一個公式在 Postgres 能用，在 SQLite／MySQL 可能因不支援函式被拒絕（見第 4 題名單）。搬家時要重驗。
5. **公式在讀取時算。** 大表加上多層公式、Lookup、Rollup，查詢會變慢；排序、篩選公式欄位也是現場算。
6. **欄位層級權限在 CE 沒有。** 要做「每個人只看自己的資料列」需另外在外部資料庫做檢視（View）或自己加一層。
7. **Webhook 重試未確認。** 欄位存在但我沒找到重試邏輯；沒有 Redis 時工作在記憶體，重啟會遺失（推論）。直接改資料庫（不經 NocoDB）不會觸發 webhook（推論）。
8. **API 沒有內建限流。** 對外開放必須在代理層擋（見第 5 題）。
9. **版本演進快。** 版本號 0.301.3，路由有 v1／v2／v3 並存、升級有舊版限制（需先到 0.207.3）。API 與資料庫遷移可能再變，動手前請重新確認。
10. **單一檔案很大。** `BaseModelSqlv2.ts` 11238 行，`columns.service.ts` 9990 行（皆為 `wc -l` 實數），`acl.ts` 1215 行，閱讀請用搜尋，不要從頭讀。
11. **我沒讀的部分。** 前端 `nc-gui`、EE 專屬模組、`plugins/`（儲存、通知外掛）、Swagger 產生器實作、`formula-column-type-changer` 內容、記憶體與效能數據，皆未確認。
12. **資料包是快照。** 星數、授權文字、程式碼位置在 2026-11-04 之後可能已變。
