# teableio/teable｜深入：後端、公式與即時協作

> 深入分析｜掃描日期：2026-11-04｜commit：f8be01f｜總覽資料包：_oss-research/01-web-excel/teableio__teable.md

本文只「讀」原始碼（shallow clone，commit `f8be01fadb86790d3d3a878bedd10cf949f9a8f8`，分支 develop），沒有安裝、建置或執行任何東西。文中數字都是我自己用 grep／wc／python 數的，數法寫在括號裡；不確定的地方標「未確認」。所有連結都固定在上述 commit。

---

## 重點結論（5–10 點）

1. **後端是一個 NestJS 單體，而且順便把 Next.js 前端也包進來**：同一個 Node 行程、同一個 port（預設 3000）同時提供 `/api`、WebSocket `/socket` 和網頁。中介資料（空間、Base、資料表、欄位、檢視、權限）用 Prisma 管理（64 個 model）；使用者的試算表資料則是「真正的 PostgreSQL 資料表」：每個 Base 一個 schema、每張表一個實體表、每個欄位一個實體欄位，再加上 `__id`、`__version` 等 7 個系統欄位。
2. **正處於「v1 → v2」大改版**：舊路徑（`apps/nestjs-backend` 內的 service＋knex）和新路徑（`packages/v2/*` 共 48 個套件，DDD／CQRS 設計、MIT 授權、與 NestJS 解耦）並存。控制器用 `V2FeatureGuard` 依功能旗標分流，而**新建立的 Base 一律寫入 `v2Enabled: true`**，所以新資料走 v2。要借程式碼，請優先看 v2。
3. **公式引擎＝ANTLR4（antlr4ts）＋沿用 Baserow（MIT）的語法**。公式屬於 Airtable 式「整欄一條公式、逐列計算」，用 `{欄位}` 參照，**不是 Excel 的 A1 儲存格參照**，沒有 VLOOKUP／SUMIF；跨表查值靠 Link＋Lookup／Rollup 欄位。函式數量：v1 81 個、v2 83 個。
4. **儲存格的值不是在 JS 裡算，而是把公式翻成 PostgreSQL SQL 交給資料庫算**。v1 能轉的公式直接做成 `GENERATED ALWAYS AS (...) STORED` 欄位；v2 則把公式編成「運算式圖 → SQL（共用子運算式會變成 MATERIALIZED CTE）」，結果寫回一般欄位，依相依層級用 CTE 鏈批次 `UPDATE`。同一張表同步計算，跨表的連鎖更新經資料庫 outbox＋BullMQ 非同步補算。
5. **即時協作用 ShareDB，但不是傳統 OT**：瀏覽器改格子是走 HTTP `PATCH`，伺服器在交易提交後自己組 json0 op，再透過 ShareDB 的 pub/sub（多台時用 Redis）廣播。`ShareDbAdapter.commit()` 直接丟出「Method not implemented」，op 不落地，衝突處理等於「後寫的蓋掉先寫的」。Presence 用來顯示誰選了哪一格。
6. **AI：社群版只有「接模型」和「AI 幫你寫公式」**：使用 Vercel AI SDK v7，支援 17 種供應商型別（含 Anthropic、Ollama、OpenAI 相容）；`/api/:baseId/ai/generate-stream` 被公式編輯器的 AI 助手呼叫。AI 自動填欄位的端點在本 repo 是空殼（回傳 `taskId: null`），AI Chat／App Builder 依 README 需要完整版部署與付費授權。
7. **API 很完整**：REST `/api/...`（Swagger 在 `/docs`、Redoc 在 `/redocs`，用 Bearer 個人存取權杖），另有 v2 的 oRPC 合約 API `/api/v2`。內建「SQL 查詢」功能在每個 Base 專屬的唯讀 PostgreSQL 角色＋唯讀交易＋逾時限制下執行。
8. **自架最低需求是 Node（engines ≥22，官方映像用 24.22.2）＋PostgreSQL＋Redis**。Redis 不能省（`AppModule` 沒有 Redis URI 會直接丟錯）。附件可放本機、MinIO 或 S3。密鑰不設也能啟動，但會用 repo 裡公開的預設值，對外服務一定要改。
9. **最值得借的三塊**：`packages/formula`（MIT、只依賴 antlr4ts 的公式解析器）、`packages/v2/formula-sql-pg`（公式 → PostgreSQL SQL 翻譯器，附 2,268 筆 SQL 快照測試）、`packages/v2/headless-*`（不含 UI 與登入的無頭引擎，可用嵌入式 PGlite 執行）。即時協作和 Prisma 交易寫法在 `apps/`（AGPL），建議「學做法、自己重寫」。
10. **授權**：`apps/*` 是 AGPL-3.0＋品牌保護條款，`packages/*` 是 MIT。個人自用沒問題；日後若把改過的 `apps/` 程式碼拿來對外提供服務，要注意 AGPL 的原始碼公開義務。

---

## 逐題詳解

固定連結前綴：`https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/`（以下簡稱 B）。

### 一、apps/nestjs-backend 架構（NestJS + Prisma + PostgreSQL）

**1. 整體分層**

- 啟動：`bootstrap.ts` 建立 Nest app，掛上 helmet、50 MB JSON body 上限、Swagger，之後啟動佇列 worker。[bootstrap.ts#L25-L62](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/bootstrap.ts#L25-L62)
- 模組：`app.module.ts` 匯入 auth、space、base、field、record、share、import／export、ai、plugin、v2 等功能模組，最後用 `BullModule.forRootAsync` 連 Redis。[app.module.ts#L67-L157](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/app.module.ts#L67-L157)
- 內嵌前端：`NextService` 在模組初始化時執行 `createServer({ dir: NEXTJS_DIR })`，所以後端也負責輸出 Next.js 頁面（可用 `BACKEND_SKIP_NEXT_START=true` 關掉）。[next.service.ts#L19-L41](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/next/next.service.ts#L19-L41)
- 規模：`src/features/` 底下 55 個功能資料夾（`ls -d src/features/*/`）；不含測試的 TS 檔 1,028 個、約 23.5 萬行（`find src -name '*.ts' -not -name '*.spec.ts'` 後 `wc -l`）。

**2. 資料模型：中介資料 vs. 試算表資料**

中介資料的 schema 在 `packages/db-main-prisma/prisma/postgres/schema.prisma`，共 64 個 model（`grep -c '^model '`）、138 個 migration（`ls migrations | wc -l`）。最該先讀的五個：

| Model | 作用 | 連結 |
|---|---|---|
| `Base` | 一個「資料庫」；有 `v2Enabled` 旗標 | [L218-L240](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/prisma/postgres/schema.prisma#L218-L240) |
| `TableMeta` | 一張表；記錄實體表名 `dbTableName` | [L242-L271](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/prisma/postgres/schema.prisma#L242-L271) |
| `Field` | 欄位；`dbFieldName`、`dbFieldType`、`cellValueType`、`isComputed`、`lookupOptions`、`aiConfig` | [L333-L370](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/prisma/postgres/schema.prisma#L333-L370) |
| `Reference` | 欄位相依圖的邊（fromFieldId → toFieldId） | [L670-L680](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/prisma/postgres/schema.prisma#L670-L680) |
| `ComputedUpdateOutbox` | v2 計算欄位的工作佇列（狀態、重試、plan hash） | [L372-L412](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/prisma/postgres/schema.prisma#L372-L412) |

試算表資料：v2 建實體表時固定先建 7 個系統欄位，之後每個使用者欄位再加一個實體欄位：

```ts
.addColumn('__id', 'text', (col) => col.notNull().unique())
.addColumn('__auto_number', 'serial', (col) => col.primaryKey())
.addColumn('__created_time', 'timestamptz', ...)
.addColumn('__last_modified_time', 'timestamptz')
.addColumn('__created_by', 'text', ...)
.addColumn('__last_modified_by', 'text')
.addColumn('__version', 'integer', (col) => col.notNull());
```

出處：[PostgresTableSchemaRepository.ts#L359-L369](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/schema/repositories/PostgresTableSchemaRepository.ts#L359-L369)。欄位名稱會用 `transliteration` 的 `slugify` 轉成 ASCII（中文名會變成拼音，最長 40 字元）。[naming.ts#L4-L26](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/schema/naming.ts#L4-L26)

- 每個 Base 一個 PostgreSQL schema：`createBase()` 先寫入 `base`（`v2Enabled: true`、`provisionState: pending`），再執行 `dbProvider.createSchema(base.id)`。[base.service.ts#L484-L520](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/base/base.service.ts#L484-L520)
- 只支援 PostgreSQL：`DbProvider` 遇到非 pg 驅動直接丟錯。[db.provider.ts#L14-L24](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/db-provider/db.provider.ts#L14-L24)
- 三種資料庫工具並用：中介資料用 Prisma 6.2.1，v1 用 knex 3.1.0 組 SQL，v2 用 Kysely 0.28.17（版本取自 `apps/nestjs-backend/package.json`）。

**3. 交易＋請求上下文（CLS）的寫法——很值得學**

`PrismaService.$tx()` 把交易 client 存在 `nestjs-cls`（每個請求自己的上下文）裡：巢狀呼叫會自動共用同一筆交易，交易成功後呼叫 `afterTxCb`。下一節的 ShareDB 廣播就是掛在這個 hook 上，確保「資料庫真的寫成功才通知大家」。[prisma.service.ts#L96-L159](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/db-main-prisma/src/prisma.service.ts#L96-L159)

**4. v1／v2 分流**

- 以 `PATCH /api/table/:tableId/record/:recordId` 為例：控制器先看 `cls.get('useV2')`，是就交給 `RecordOpenApiV2Service`，否則走舊 service。[record-open-api.controller.ts#L177-L201](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/record/open-api/record-open-api.controller.ts#L177-L201)
- 判斷順序：`FORCE_V2_ALL` 環境變數 → Base 的 `v2Enabled` → 空間／系統設定的灰度名單。[v2-feature.guard.ts#L99-L111](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/canary/guards/v2-feature.guard.ts#L99-L111)、[canary.service.ts#L150-L165](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/canary/canary.service.ts#L150-L165)。功能旗標共 82 個（數 `packages/openapi/src/admin/setting/update.ts` 中 `v2FeatureSchema` 的 enum 項目）。
- v2 寫入流程：`RecordOpenApiV2Service.updateRecord()` 從「每張表一個」的 DI container 取出 `commandBus`，把 v1 格式轉成 v2 指令。[record-open-api-v2.service.ts#L2601-L2650](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/record/open-api/record-open-api-v2.service.ts#L2601-L2650)；真正寫入在 `UpdateRecordApplicationService`，於 `domainWriteTransaction` 內呼叫 `tableRecordRepository.updateOne()`。[UpdateRecordApplicationService.ts#L346-L380](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/core/src/commands/UpdateRecordApplicationService.ts#L346-L380)
- v2 規模：`packages/v2` 48 個套件；不含測試的 TS 1,883 檔、約 35.9 萬行（排除 `*.spec.ts`、`__tests__`、`e2e`）。`v2-core` 有 70 個 command handler（`ls commands | grep -c 'Handler.ts$'`），執行期依賴只有 7 個（@teable/formula、i18n-keys、v2-di、nanoid、neverthrow、ts-pattern、zod），完全不碰資料庫與 NestJS。

### 二、公式引擎：是不是 ANTLR？怎麼轉成 SQL？

**1. 解析：是 ANTLR4**

- 解析器已從 `packages/core` 拆成獨立套件 `packages/formula`（`@teable/formula`，MIT），唯一的執行期依賴是 `antlr4ts 0.5.0-alpha.4`；重新產生 parser 的指令是 `antlr4ts -visitor -no-listener src/parser/*.g4`。[package.json#L40-L49](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/package.json#L40-L49)
- 語法檔開頭註明部分取自 Baserow（MIT）。[Formula.g4#L1-L25](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/parser/Formula.g4#L1-L25)。整份 parser 規則只有約 50 行：字串／數字／布林常值、括號、負號、`* / %`、`+ -`、比較、`= !=`、`&&`、`||`、`&`（字串串接）、`{欄位}` 參照、`函式名(參數…)`。[Formula.g4#L27-L78](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/parser/Formula.g4#L27-L78)
- 欄位參照的 token 是 `IDENTIFIER_VARIABLE : '{' .*? '}'`，大括號裡存檔時放欄位 ID、編輯時顯示欄位名稱。[FormulaLexer.g4#L94-L96](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/parser/FormulaLexer.g4#L94-L96)；兩者互轉由 `ConversionVisitor` 負責。[conversion.visitor.ts#L6-L37](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/conversion.visitor.ts#L6-L37)
- 進入點 `parseFormula()`：CharStreams → Lexer → TokenStream → `parser.root()`。[parse-formula.ts#L11-L32](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/formula/src/parse-formula.ts#L11-L32)

**2. 有哪些函式**

v1 共 81 個、v2 共 83 個（多了 `SET_LOCALE`、`SET_TIMEZONE`；我用 python 正則數兩邊 `export enum FunctionName` 的項目）。依 v1 分類：數值 19（SUM、ROUND、MOD…）、文字 18（CONCATENATE、REGEXP_REPLACE、TEXTSPLIT…）、邏輯 9（IF、SWITCH、IS_ERROR…）、日期 25（DATETIME_DIFF、WORKDAY、DATETIME_FORMAT…）、陣列／計數 7（COUNTA、ARRAY_JOIN…）、系統 3（RECORD_ID、AUTO_NUMBER、TEXT_ALL）。註冊表：[factory.ts#L84-L177](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/functions/factory.ts#L84-L177)。Rollup 欄位另有 14 種彙總式（`sum({values})` 等）。[rollup-option.schema.ts#L8-L23](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/field/derivate/rollup-option.schema.ts#L8-L23)

> 對你的意義：這是 Airtable 式的「欄位公式」，例如 `{售價} - {成本}` 對每一列都生效；沒有 `B2:B10` 這種範圍，也沒有 VLOOKUP。要做「查價」，得先建 Link 欄位連到價格表，再用 Lookup 取值或 Rollup 彙總。

**3. JS 端的 EvalVisitor 用來做什麼**

`packages/core/src/formula/visitor.ts` 的 `EvalVisitor` 可以在 JS 裡直接算公式（`evaluate()`），但後端主要拿它做**型別推斷**：`FormulaFieldCore.getParsedValueType()` 不傳入資料列，只走一遍語法樹，就能推出結果是數字／文字／日期／布林、是不是多值。[evaluate.ts#L8-L24](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/formula/evaluate.ts#L8-L24)、[formula.field.ts#L69-L77](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/models/field/derivate/formula.field.ts#L69-L77)。每個函式類別都有 `validateParams`／`getReturnType`／`eval` 三個方法，真正的儲存格值則由資料庫算。

**4. 轉成 SQL——v1（舊 Base）**

- `sql-conversion.visitor.ts`（2,493 行）有兩個 visitor：`GeneratedColumnSqlConversionVisitor`（產生「生成欄位」用的 SQL，順便收集相依欄位）和 `SelectColumnSqlConversionVisitor`（查詢時用，可透過 CTE 取 Link／Lookup 的值）。[sql-conversion.visitor.ts#L2077-L2110](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/record/query-builder/sql-conversion.visitor.ts#L2077-L2110)
- `visitFunctionCall` 用 `ts-pattern` 的 `match(fnName)` 把每個函式分派給資料庫方言物件（`formulaQuery.sum(params)` 等）。[sql-conversion.visitor.ts#L505-L545](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/record/query-builder/sql-conversion.visitor.ts#L505-L545)
- PostgreSQL 方言例：生成欄位裡不能用彙總函式，所以 `SUM(a, b)` 被改寫成 `(a) + (b)`。[generated-column-query.postgres.ts#L615-L619](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/db-provider/generated-column-query/postgres/generated-column-query.postgres.ts#L615-L619)
- 建欄位時先問 `GeneratedColumnQuerySupportValidatorPostgres` 能不能做成生成欄位：能就 `${columnType} GENERATED ALWAYS AS (${sql}) STORED`；不能（或是 lookup、多值）就建一般欄位，由應用程式計算後寫回。[create-database-column-field-visitor.postgres.ts#L87-L145](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/db-provider/create-database-column-query/create-database-column-field-visitor.postgres.ts#L87-L145)

**5. 轉成 SQL——v2（新 Base，建議參考這套）**

- 進入點 `FormulaSqlPgTranslator.translateExpressions()`：解析（有快取與「編譯預算」上限）→ `FormulaSqlPgVisitor` 把語法樹轉成可共用節點的「運算式圖」→ `FormulaSqlPgLowering` 逐節點產生帶型別的 SQL → `FormulaSqlPgBindings` 把重複子運算式綁成 MATERIALIZED CTE。輸出不只一段 SQL，而是 `valueSql`、`displayValueSql`、`errorConditionSql`、`errorMessageSql` 四個通道（公式錯誤會變成 `#ERROR` 類的值，而不是讓整句 SQL 失敗）。[FormulaSqlPgTranslator.ts#L147-L180](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/formula-sql-pg/src/FormulaSqlPgTranslator.ts#L147-L180)、[ARCHITECTURE.md#L30-L62](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/formula-sql-pg/ARCHITECTURE.md#L30-L62)
- 函式對照表 `FormulaSqlPgFunctions.ts`（2,821 行）：`NOW` 直接是 `NOW()`；`TODAY` 依公式欄位設定的時區，在 PostgreSQL 內算出當地午夜。[FormulaSqlPgFunctions.ts#L95-L103](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/formula-sql-pg/src/FormulaSqlPgFunctions.ts#L95-L103)
- 一筆真實的快照（測試輸入 `SUM({Number}, 2)`，結果 12）：

```text
"sql": "(("t"."Number")::double precision + (2)::double precision)"
```

出處：[NumericFunctions.spec.ts.snap#L10797-L10816](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/formula-sql-pg/src/__snapshots__/NumericFunctions.spec.ts.snap#L10797-L10816)。12 個快照檔共 2,268 筆（每檔 `grep -c '^exports\['` 加總），等於一份「每個函式 × 每種欄位型別 → SQL」的規格書，自己重寫時可以直接拿來對答案。
- 在 v2，公式欄位是**一般實體欄位**（型別依 cellValueType 決定）＋`ReferenceRule` 相依邊，不是生成欄位；v2 只把 createdTime、autoNumber 等系統欄位做成 `generated always as (__created_time) stored`。[FieldSchemaRulesFactory.ts#L135-L149](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/schema/rules/field/FieldSchemaRulesFactory.ts#L135-L149)、[GeneratedColumnRule.ts#L57-L92](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/schema/rules/field/GeneratedColumnRule.ts#L57-L92)
- 計算順序：`ComputedUpdatePlanner` 依相依邊做拓樸排序並分層，排不進去的欄位再用 DFS 找出循環。[ComputedUpdatePlanner.ts#L790-L800](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/record/computed/ComputedUpdatePlanner.ts#L790-L800)。同一張表的多層公式由 `SameTableBatchQueryBuilder` 組成「level_0 → level_1 → …」的 CTE 鏈，最後一句 `UPDATE` 寫回。[SameTableBatchQueryBuilder.ts#L78-L140](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/record/query-builder/computed/SameTableBatchQueryBuilder.ts#L78-L140)
- 同步或非同步：預設 `HybridWithOutboxStrategy`，`syncPolicy: 'seedTableOnly'`——被修改的那張表內的計算欄位在同一筆交易裡同步算（上限每表 2,000、總計 5,000 筆待算資料），其餘跨表連鎖寫入 `computed_update_outbox`，由 BullMQ 喚醒 worker 處理。文件明講「資料庫 ledger 才是真相，BullMQ 只是喚醒通道」。[HybridWithOutboxStrategy.ts#L119-L129](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/record/computed/strategies/HybridWithOutboxStrategy.ts#L119-L129)、[computed/ARCHITECTURE.md#L1-L10](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/record/computed/ARCHITECTURE.md#L1-L10)。設 `V2_COMPUTED_UPDATE_MODE=sync` 可改成全同步。[v2-container.service.ts#L112-L131](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/v2/v2-container.service.ts#L112-L131)
- 讀取有兩條路：Stored（直接讀預先算好的欄位，最快）和 Computed（查詢時用 LATERAL／CTE 現算）。[StoredTableRecordQueryBuilder.ts#L57-L59](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/record/query-builder/stored/StoredTableRecordQueryBuilder.ts#L57-L59)

### 三、即時協作（ShareDB／OT）

一句話：**寫入走 HTTP，廣播走 ShareDB。**

**1. 資料流（依序）**

1. 連線：`WsGateway` 在同一個 HTTP server 上掛 SockJS（路徑 `/socket`，只開 websocket 與 xhr-streaming），每條連線包成 JSON stream 交給 `shareDb.listen()`。[ws.gateway.ts#L34-L52](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/ws/ws.gateway.ts#L34-L52)、[ws.gateway.ts#L72-L94](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/ws/ws.gateway.ts#L72-L94)、[sockjs-options.ts#L65-L73](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/ws/sockjs-options.ts#L65-L73)
2. ShareDB 設定：`presence: true`；快取設為 redis 時，把 pub/sub 換成自寫的 `RedisPubSub`（用一段 Lua 一次發到多個 channel）。[share-db.service.ts#L61-L77](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.service.ts#L61-L77)、[sharedb-redis.pubsub.ts#L141-L147](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/sharedb-redis.pubsub.ts#L141-L147)
3. 使用者改格子：SDK 的 `Record.updateCell()` 先在本機樂觀更新，再呼叫 `updateRecord()`（HTTP PATCH），失敗就回滾。**前端完全不用 `submitOp`**（在 `packages/sdk/src` 與 `apps/nextjs-app/src` grep `submitOp`，0 筆）。[record.ts#L163-L202](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/model/record/record.ts#L163-L202)
4. 伺服器產生 op（v1）：`BatchService` 讀出每列 `__version`，寫入時設為 `__version + 1`，並把 json0 op（`{ p: ['fields', fieldId], od, oi }`）放進 CLS 的 `tx.rawOpMaps`。[batch.service.ts#L104-L145](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/calculation/batch.service.ts#L104-L145)、[batch.service.ts#L475-L537](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/calculation/batch.service.ts#L475-L537)、[set-record.ts#L15-L43](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/op-builder/record/set-record.ts#L15-L43)
5. 交易提交後廣播：`ShareDbService` 透過 `bindAfterTransaction()`，在提交後取出 `rawOpMaps` → 更新資料表的最後修改時間 → `pubsub.publish([collection, collection.docId], op)` → 轉成內部事件（紀錄歷史、webhook 等）。[share-db.service.ts#L88-L121](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.service.ts#L88-L121)、[share-db.service.ts#L185-L198](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.service.ts#L185-L198)
6. v2 同理：領域事件（例如 `RecordUpdated`）由 32 個 `*RealtimeProjection`（`ls application/projections | grep -c 'RealtimeProjection.ts$'`）轉成 json0 變更，經 `ShareDbRealtimeEngine` → `ShareDbPubSubPublisher` 直接送進同一個 ShareDB pub/sub。[RecordUpdatedRealtimeProjection.ts#L19-L75](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/core/src/application/projections/RecordUpdatedRealtimeProjection.ts#L19-L75)、[ShareDbRealtimeEngine.ts#L22-L70](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-realtime-sharedb/src/ShareDbRealtimeEngine.ts#L22-L70)、[v2-container.service.ts#L523-L524](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/v2/v2-container.service.ts#L523-L524)

**2. 為什麼說「不是傳統 OT」**

```ts
commit() {
  throw new Error('Method not implemented.');
}
```

- 上面是 ShareDB 資料庫轉接器的 `commit()`：[share-db.adapter.ts#L340-L342](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.adapter.ts#L340-L342)。用戶端送來的 op 也只放行 record 類型。[share-db.service.ts#L224-L254](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.service.ts#L224-L254)
- `ops` 資料表在整個 repo 只找到 `deleteMany`（清理用），找不到寫入（grep `ops.create`、`insertInto('ops')` 皆 0 筆）。
- 用戶端版本落後時，`getOps` 不是重播歷史 op，而是讀目前快照，**合成一個「把所有欄位設成現值」的 op** 補上。[share-db.adapter.ts#L522-L598](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.adapter.ts#L522-L598)
- 結論：版本號只用來讓各客戶端的 ShareDB 文件保持一致；伺服器寫入時沒有拿客戶端版本做比對，兩人同時改同一格＝後到的蓋掉先到的（依 `updateRecordsTask` 程式碼判斷，未實測）。

**3. 查詢訂閱（新增列、排序、篩選的即時變化）**

- ShareDB 的 query 訂閱在收到 op 後會重新 poll。Teable 的 `queryPoll` 不直接查資料庫，而是帶著使用者的 cookie **回呼自己的 REST API**（`POST http://localhost:${PORT}/api/table/:tableId/record/socket/doc-ids`、`…/snapshot-bulk`），所以篩選、權限、分享檢視的邏輯全部沿用 HTTP 那套。[record-readonly.service.ts#L28-L88](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/readonly/record-readonly.service.ts#L28-L88)、[readonly.service.ts#L13-L21](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/readonly/readonly.service.ts#L13-L21)
- 效能保護：`pollDebounce`（預設 200ms，把多次 poll 合併成一次）、`skipPoll`（op 改的欄位不影響查詢條件就不 poll）。[share-db.adapter.ts#L100](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.adapter.ts#L100)、[share-db.adapter.ts#L311-L332](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/share-db.adapter.ts#L311-L332)
- WebSocket 開啟 permessage-deflate：註解寫實測格狀資料壓縮約 20 倍、每條連線約 210 KiB 記憶體，設計目標機器是 2 核 4 GiB。[sockjs-options.ts#L7-L47](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/ws/sockjs-options.ts#L7-L47)

**4. Presence（多人游標）與 Undo**

- 前端在 `getCellCollaboratorsChannel(tableId)` 頻道送出 `{ user, activeCellId, borderColor }`，其他人收到後畫出彩色外框。[useCollaborate.ts#L33-L102](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/src/features/app/blocks/view/grid/hooks/useCollaborate.ts#L33-L102)；伺服器的 `connect` middleware 從 cookie 解出使用者，`receive` middleware 逐一授權 presence 頻道。[auth.middleware.ts#L303-L355](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/share-db/auth.middleware.ts#L303-L355)
- Undo／Redo 堆疊存在快取（Redis／SQLite／記憶體），key 為 `operations:undo:${userId}:${tableId}:${windowId}`（每個瀏覽器分頁各自一疊），`.env.example` 的預設是 200 步、24 小時過期。[undo-redo-stack.service.ts#L20-L24](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/undo-redo/stack/undo-redo-stack.service.ts#L20-L24)

### 四、AI 功能

**社群版（本 repo）有的：**

- `POST /api/:baseId/ai/generate-stream`：把 prompt 丟給設定好的模型，用 `streamText(...).pipeTextStreamToResponse(res)` 串流回傳。[ai.controller.ts#L9-L21](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/ai/ai.controller.ts#L9-L21)、[ai.service.ts#L727-L741](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/ai/ai.service.ts#L727-L741)
- 模型設定來源：先找空間層級的 AI Integration（加密存放），找不到就用管理員的實例設定，兩者都沒有就回「AI configuration is not set」。[ai.service.ts#L439-L466](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/ai/ai.service.ts#L439-L466)
- 供應商：`LLMProviderType` 共 17 種（openai、anthropic、google、azure、cohere、mistral、deepseek、qwen、zhipu、lingyiwanwu、xai、togetherai、ollama、amazonBedrock、openRouter、openaiCompatible、aiGateway）。[update.ts#L26-L45](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/openapi/src/admin/setting/update.ts#L26-L45)、[util.ts#L267-L284](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/ai/util.ts#L267-L284)
- 前端用途：公式編輯器的「AI 產生公式」。prompt 範本在 `packages/openapi/src/formula/ai.ts`（MIT）：把所有欄位名稱放進 `<fields>`、所有函式定義放進 `<functions>`，要求模型「只回公式、欄位用 `{}` 包起來」。[ai.ts#L3-L40](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/openapi/src/formula/ai.ts#L3-L40)、[AiPromptContainer.tsx#L28-L32](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/components/editor/formula/components/AiPromptContainer.tsx#L28-L32)

**社群版是空殼的：**

- 欄位 AI 自動填寫 `POST …/field/:fieldId/auto-fill` 直接回 `{ taskId: null }`，`stop-fill` 回 `null`；單格 `auto-fill` 只做權限檢查就回 `{ taskId: '' }`。程式註解提到會由「EE override controller」覆寫。[field-open-api.controller.ts#L284-L298](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/field/open-api/field-open-api.controller.ts#L284-L298)、[record-open-api.controller.ts#L575-L592](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/record/open-api/record-open-api.controller.ts#L575-L592)
- `dockers/README.md` 對照表：Standalone 自架的「AI features (chat, agents)」、App Builder 都是 ❌，要用 teable-deployment 完整版。[dockers/README.md#L5-L12](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/dockers/README.md#L5-L12)

**和 Claude 的關聯：**

- 可以在管理後台把 Anthropic 設成供應商，公式 AI 助手就會用 Claude（依程式碼推論，未實測）。
- OAuth 伺服器支援 RFC 7591 動態註冊，註解直接點名 Claude Code、claude.ai、Cursor 等 MCP 用戶端。[oauth-registration.service.ts#L73-L86](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/oauth/oauth-registration.service.ts#L73-L86)；程式中還內建官方 CLI `@teable/cli` 的 OAuth 設定。[oauth.ts#L96-L101](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/core/src/auth/oauth.ts#L96-L101)。但 MCP 伺服器本體與該 CLI 的原始碼在本 repo 都找不到（grep `/mcp`、`McpServer` 為 0 筆），位置未確認。
- 影片／腳本生成：本 repo 沒有相關程式。

### 五、API

- REST：控制器都掛在 `/api/...` 底下，例如記錄 CRUD 在 `api/table/:tableId/record`。數量：59 個檔案宣告 `@Controller(`；`*.controller.ts` 中的 HTTP 方法裝飾器共 470 個（GET 183、POST 147、PATCH 61、DELETE 44、PUT 35，用 `grep -rhoE '@(Get|Post|Patch|Put|Delete)\('` 計數）。
- 文件：啟動時用 `@teable/openapi` 的 zod 定義產生 OpenAPI，Swagger UI 在 `/docs`、Redoc 在 `/redocs`，每個 operation 都會標註驗證方式（Bearer token／只限 cookie／公開）。[swagger.ts#L77-L110](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/swagger.ts#L77-L110)。`packages/openapi/src` 內 `registerRoute(` 呼叫共 448 處（排除 spec）。
- 驗證：`Authorization: Bearer <個人存取權杖>`。[access-token.strategy.ts#L77-L86](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/auth/strategies/access-token.strategy.ts#L77-L86)。開啟 CORS 時是 `origin: '*'` 但不帶 credentials，也就是只開放給 token 呼叫。[bootstrap.ts#L52-L61](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/bootstrap.ts#L52-L61)
- v2 API：`@Controller('api/v2')` 搭配 oRPC 的 `@Implement(v2Contract…)`；OpenAPI 在 `/api/v2/openapi.json`、文件頁在 `/api/v2/docs`。[v2.controller.ts#L97](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/v2/v2.controller.ts#L97)、[v2-openapi.controller.ts#L61-L87](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/v2/v2-openapi.controller.ts#L61-L87)
- SQL 查詢：替每個 Base 建一個唯讀角色（`NOLOGIN … GRANT SELECT`），執行時 `SET LOCAL ROLE`＋`SET TRANSACTION READ ONLY`＋`SET LOCAL statement_timeout` 三道保險。[base-sql-executor.service.ts#L84-L108](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/base-sql-executor/base-sql-executor.service.ts#L84-L108)、[base-sql-executor.service.ts#L189-L210](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/features/base-sql-executor/base-sql-executor.service.ts#L189-L210)
- 套到你的情境：你現有的 Firebase 倉儲 App 可以用 token 呼叫 `GET /api/table/{tableId}/record` 讀價格表、`PATCH` 回寫庫存，等於把 Teable 當成「有試算表介面的資料庫後台」。

### 六、自架需求

| 項目 | 需求 | 依據 |
|---|---|---|
| Node.js | `engines` 要求 ≥22、pnpm ≥12；官方 Dockerfile 用 `node:24.22.2` | [package.json#L84-L89](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/package.json#L84-L89)、[Dockerfile#L1](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/dockers/teable/Dockerfile#L1) |
| PostgreSQL | 唯一支援的資料庫；範例 compose 用 15.4；v2 文件說 CI 在 16／17 驗證；PG16 以上用原生 `pg_input_is_valid`，舊版用 polyfill | [docker-compose.yaml#L25-L46](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/dockers/examples/standalone/docker-compose.yaml#L25-L46)、[computed/ARCHITECTURE.md#L66](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/adapter-table-repository-postgres/src/record/computed/ARCHITECTURE.md#L66) |
| Redis | **必要**：沒有 URI 時 `AppModule` 丟出「Redis URI is not defined」；`.env.example` 也寫明 computed outbox 需要它 | [app.module.ts#L136-L154](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/app.module.ts#L136-L154)、[.env.example#L46-L49](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/.env.example#L46-L49) |
| 附件 | local（預設，容器內 `/app/.assets`）／MinIO／S3 | [.env.example#L14-L44](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/.env.example#L14-L44) |
| 密鑰 | `SECRET_KEY` 與各組 16 字元 KEY／IV；不設會用公開預設值並在啟動時警告 | [.env.example#L193-L231](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nextjs-app/.env.example#L193-L231) |
| 記憶體 | 每條 WebSocket 連線約 210 KiB；註解以 2 核 4 GiB 為設計目標 | [sockjs-options.ts#L7-L47](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/ws/sockjs-options.ts#L7-L47) |

- 最小部署：`dockers/examples/standalone/` 三個容器（`ghcr.io/teableio/teable:latest`、`postgres:15.4`、`redis:7.2.4`），對外開 3000 port。[docker-compose.yaml#L1-L72](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/dockers/examples/standalone/docker-compose.yaml#L1-L72)、[.env#L1-L41](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/dockers/examples/standalone/.env#L1-L41)。大批更新容易撞到 Prisma 交易預設 5 秒逾時，`.env` 有 `PRISMA_TRANSACTION_TIMEOUT` 可調。
- 不想跑完整產品時：v2 的 `teable-headless` CLI（MIT）只要設 `TEABLE_PGLITE_DIR`（嵌入式 PGlite）或 `TEABLE_DATABASE_URL`，就能起一個 Hono HTTP 伺服器；沒有 UI、沒有登入，身分由 `x-teable-actor` header 傳入。[cli-main.ts#L10-L18](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/headless-cli/src/cli-main.ts#L10-L18)、[headless-runtime/ARCHITECTURE.md#L26-L31](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/headless-runtime/ARCHITECTURE.md#L26-L31)（未實際執行）。瀏覽器版 `container-browser` 也能用 PGlite（預設 `memory://`）跑同一套引擎，但計算 worker 需由宿主手動 drain。[container-browser/ARCHITECTURE.md#L5-L27](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/v2/container-browser/ARCHITECTURE.md#L5-L27)

---

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. `apps/nestjs-backend/src/app.module.ts`：有哪些模組、Redis／BullMQ 怎麼接。
2. `packages/db-main-prisma/prisma/postgres/schema.prisma`：先讀 Base、TableMeta、Field、View、Reference 五個 model，理解「中介資料 vs. 實體表」。
3. `packages/db-main-prisma/src/prisma.service.ts`：`$tx`、`txClient`、`bindAfterTransaction` 三個方法。
4. `apps/nestjs-backend/src/features/record/open-api/record-open-api.controller.ts`：一個 API 從進來到分流 v1／v2 的全程。
5. `packages/formula/src/parser/Formula.g4`＋`FormulaLexer.g4`：約 50 行語法，讀完就懂公式語言能寫什麼。
6. `packages/core/src/formula/functions/numeric.ts`（再看 `text.ts`、`date-time.ts`）：每個函式的參數檢查、回傳型別與 JS 語意。
7. `packages/v2/formula-sql-pg/ARCHITECTURE.md` → `FormulaSqlPgTranslator.ts` → `FormulaSqlPgFunctions.ts`，邊讀邊對照 `__snapshots__/NumericFunctions.spec.ts.snap`。
8. `packages/v2/adapter-table-repository-postgres/src/record/computed/ARCHITECTURE.md` → `ComputedUpdatePlanner.ts`（只看 topoSort 那段）→ `strategies/HybridWithOutboxStrategy.ts`（看預設值）→ `query-builder/computed/SameTableBatchQueryBuilder.ts`（看 CTE 鏈）。
9. 即時（v1）：`ws/ws.gateway.ts` → `share-db/share-db.service.ts` → `share-db/share-db.adapter.ts` → `share-db/readonly/record-readonly.service.ts` → 前端 `packages/sdk/src/model/record/record.ts`。
10. 即時（v2）：`packages/v2/core/src/application/projections/RecordUpdatedRealtimeProjection.ts` → `packages/v2/adapter-realtime-sharedb/src/ShareDbRealtimeEngine.ts`。
11. AI：`features/ai/ai.service.ts`（`getModelInstance`、`generateStream`）、`features/ai/util.ts`、`packages/openapi/src/formula/ai.ts`。

---

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| # | 可借用的部分 | 路徑 | 授權 | 主要依賴 | 難度 | 怎麼接 |
|---|---|---|---|---|---|---|
| 1 | 公式解析器 | `packages/formula` | MIT（保留 Baserow 檔頭） | antlr4ts | 低 | `parseFormula(expr)` 取得語法樹，繼承 `AbstractParseTreeVisitor` 寫自己的 visitor（例如直接對 Firestore 資料在 JS 計算，或翻成你要的 SQL）。package.json 設定為公開發佈，npm 上的實際版本未確認；也可直接複製 `src/`（不含測試約 3,300 行 TS，其中約 2,350 行是 ANTLR 自動產生）。 |
| 2 | JS 函式語意 | `packages/core/src/formula/functions/*.ts` | MIT | dayjs、lodash | 中 | 想在瀏覽器或 Firebase Functions 裡即時算公式，可照這些類別的 `eval()` 重寫；它們綁 `TypedValue`／`FieldCore`，抽出時把參數改成純值即可。 |
| 3 | 公式 → PostgreSQL 翻譯器 | `packages/v2/formula-sql-pg` | MIT | @teable/formula、@teable/v2-core、neverthrow | 中高 | 需要 v2-core 的 `Table`／`Field` 物件與一個 `resolveFieldSql` 回呼。若你的資料改放 PostgreSQL（例如 Supabase），可以整包當「公式欄位編譯器」；不想搬 v2-core，就拿 2,268 筆快照當規格自己重寫。 |
| 4 | 計算欄位排程概念 | `packages/v2/adapter-table-repository-postgres/src/record/computed` | MIT | Kysely、v2-core | 高 | 建議學概念：「Reference 邊表 → 拓樸排序分層 → 同表同步、跨表進 outbox → worker 補算」。直接搬程式碼牽涉太多。 |
| 5 | 無頭引擎 | `packages/v2/headless-runtime`、`headless-http`、`headless-cli`、`container-browser` | MIT（`private: true`，未上 npm） | PGlite、Hono、Kysely | 中 | 在 monorepo 內 build 後執行 `teable-headless`，你的前端（或用 Claude Code 寫的小工具）透過 v2 oRPC client 呼叫；或在瀏覽器用 PGlite（`idb://`）做離線試算表。API 仍在快速變動。 |
| 6 | 即時協作做法 | `apps/nestjs-backend/src/share-db`、`ws` | AGPL-3.0 | sharedb 5.2.2、sockjs、ioredis | 中 | 建議只學做法自己重寫：「HTTP 寫入 → 交易提交後 publish json0 op → 客戶端訂閱 doc／query → presence 顯示游標」。如果繼續用 Firebase，Firestore 的 `onSnapshot` 已經提供同等效果，不一定需要 ShareDB。 |
| 7 | AI 寫公式的 prompt | `packages/openapi/src/formula/ai.ts`＋`func-define.ts` | MIT | 無 | 低 | 改成呼叫 Claude：把你的欄位名稱與函式清單塞進同樣的 `<fields>`／`<functions>` 結構，就能做「用中文描述 → 產生公式」。 |
| 8 | 唯讀 SQL 沙盒 | `features/base-sql-executor` | AGPL-3.0 | knex、PostgreSQL 角色 | 低（概念） | 讓 AI 或使用者跑 SQL 報表時，照抄「唯讀角色＋唯讀交易＋statement_timeout」三道保險的做法即可。 |

組合建議（A＋B＋C 思路）：Teable 擅長「資料庫型試算表」（欄位有型別、跨表關聯、公式在資料庫算、多人即時），不擅長 Excel 式儲存格公式。若要 Excel 手感，可把本研究集中「儲存格式公式引擎」類的專案（例如 handsontable/hyperformula、dream-num/univer，細節見各自資料包）當 B，Teable 的資料層與 API 當 A。

---

## 坑與限制

1. **不是 Excel**：沒有儲存格座標、跨列公式、VLOOKUP／SUMIF，跨表一定要先建 Link 欄位。習慣 Excel 的人會卡在這裡。
2. **v1／v2 雙軌**：兩套公式→SQL、兩套查詢組裝、兩套即時推送。讀程式時先確認走哪條路；舊 Base 可能仍走 v1，新 Base 走 v2。
3. **NOW()／TODAY() 的時間凍結**：v1 若把含 NOW／TODAY 的公式做成生成欄位，值會固定在「欄位建立當下」，驗證器註解寫得很清楚。[generated-column-query-support-validator.postgres.ts#L202-L211](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/apps/nestjs-backend/src/db-provider/generated-column-query/postgres/generated-column-query-support-validator.postgres.ts#L202-L211)。v2 儲存型公式如何隨時間自動刷新，我沒找到明確機制（未確認）。
4. **跨表結果會「晚一點」到**：改了 A 表，B 表的 Lookup／Rollup 要等 outbox worker 算完、再透過 ShareDB 推到畫面；SDK 註解也寫 v2 計算欄位可能尚未更新。[record.ts#L133-L139](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/packages/sdk/src/model/record/record.ts#L133-L139)
5. **協作是後寫覆蓋**：沒有逐字合併，長文字欄位兩人同時改，先存的會被蓋掉。
6. **Redis 一定要有**：單機自架也得多跑一個 Redis 容器。
7. **query poll 會回呼本機 HTTP**：大表、多人同時開啟時，每個 op 都可能觸發多次查詢；官方用 debounce 和 skipPoll 緩解，但負載仍高於單純推送。
8. **AI 功能大多不在原始碼裡**：AI 自動填值、AI Chat、App Builder 不在社群版；想要「AI 幫你寫商品描述、廣告文案、短劇腳本」要自己接 Claude，或購買官方授權。
9. **中文欄位名會變拼音**：實體欄位名經 slugify 轉成 ASCII 並截在 40 字元，直接用 SQL 讀資料表時要查 `field.db_field_name` 對照。
10. **v2 套件都是 `private: true`**：沒發佈到 npm，只能複製原始碼或整個 monorepo 一起 build（pnpm 12、Node 22+），而且改動非常頻繁。
11. **授權與品牌**：AGPL 部分改作後若提供網路服務需公開原始碼；Teable 名稱、Logo 等品牌素材不得修改或移除。[LICENSE#L1-L37](https://github.com/teableio/teable/blob/f8be01fadb86790d3d3a878bedd10cf949f9a8f8/LICENSE#L1-L37)
12. **預設密鑰是公開的**：`SECRET_KEY` 與各組 `*_ENCRYPTION_KEY`／`*_IV` 一定要自己設，否則別人可以偽造權杖或解密資料。
