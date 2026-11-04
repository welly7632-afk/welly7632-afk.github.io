# dream-num/univer｜深入：架構、外掛系統與嵌入方式
> 深入分析｜掃描日期：2026-11-04｜commit：c13b042｜總覽資料包：_oss-research/01-web-excel/dream-num__univer.md

完整 commit：`c13b042d18c80c8348fbe52da445d68435febbca`（`dev` 分支，根 `package.json` 版本 1.3.1）。以下所有連結都釘在這個 commit；行號是我實際打開檔案核對過的。「推論」「未確認」會明確標出。

---

## 重點結論（5–10 點）

1. **Univer 是用外掛「組裝」出來的試算表 SDK。** `@univerjs/core` 只有骨架：依賴注入容器、指令系統、資料模型、生命週期。試算表邏輯、公式、Canvas 繪製、工具列 UI 全部都是外掛。這個 commit 的 `packages/` 有 60 個套件，非測試檔裡有 85 個 `extends Plugin` 類別（用 `grep -rn "extends Plugin\b"` 計數）。
2. **外掛就是一個掛在 redi 注入器上的類別。** 類別上有 `pluginName`、`type` 兩個靜態欄位。建構子第 1 個參數放設定，其餘參數由裝飾器注入。`@DependentOn` 會做拓樸排序，缺少的依賴會被自動補註冊。試算表類外掛要等「第一本活頁簿建立」時才會真正實例化。
3. **所有資料變更都走 Command → Mutation。** Command 負責商業邏輯，會產生正向和反向兩組 Mutation。Mutation 是唯一會改 snapshot 的東西，也是同步到 Web Worker 或協作端的最小單位。Operation 只改不存檔的 UI 狀態。復原／重做其實就是重放 Mutation 陣列，**接 Firestore 就是掛在這裡**。
4. **資料模型是純 JSON。** `IWorkbookData` 由三塊組成：集中樣式表 `styles`、稀疏矩陣 `sheets[sheetId].cellData[列][欄]`，以及 `resources`（篩選、註解、資料驗證等外掛資料，各自序列化成字串）。`fWorkbook.save()` 會把外掛資料一起打包。
5. **Facade API（`univerAPI`）是用 mixin 拼出來的。** 每個套件的 `/facade` 子路徑被 import 時，會呼叫 `FUniver.extend(...)` 把方法掛上去。忘了 import，就會遇到「`createWorkbook` 不是函式」。Facade 方法底層仍是執行指令，所以照樣可以復原，也照樣會觸發事件。
6. **可以用純 JavaScript 嵌入。** 你不用寫任何 React，但 React、ReactDOM、rxjs 仍是執行期必裝的 peer dependency。最穩的做法是「Vite + 原生 JS」打包後放上 Firebase Hosting。不經打包的 UMD `<script>` 版本也有（全域名如 `UniverCore`），但有幾處細節本次無法驗證。
7. **最小組合。** 依 `@DependentOn` 推得的技術下限是 9 個 npm 套件、7 個外掛（未實測）。README 建議的實用最小組合是 13 個套件、11 個外掛（含公式計算與數字格式）。實際 bundle 大小本次無法建置驗證（未確認）。原始碼（不含測試、語系、斷字表）約 47 萬行、17.4 MB，屬於「數 MB 級」的大型前端依賴，不是輕量元件（推估）。
8. **Firestore 要自己接。** 本 repo 完全沒有 Firebase 程式碼（`grep -rli "firebase\|firestore"` 0 筆）。建議做法：監聽 Mutation，去抖動後呼叫 `save()`，把整本存成一個 JSON 字串欄位；其他裝置用 `onSnapshot` 整本重新載入。repo 裡 `network` 的 WebSocket 範例和 `rpc` 的 Worker 同步控制器，就是「逐筆 Mutation 同步」的現成樣板。真正的多人同時編輯（衝突解決）屬於 Univer Pro。
9. **授權。** 本 repo 是 Apache-2.0，個人或商業用途都可以。README 列出的即時協作、xlsx 匯入匯出、列印、圖表、樞紐分析等功能屬於 Univer Pro 商業授權，不在這個 repo（[README.md#L292](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md#L292)）。

---

## 逐題詳解（每個問題一節，附 permalink 與必要的短程式碼摘錄）

### 一、外掛系統與依賴注入（redi）怎麼運作

**整體分層**（依原始碼整理的示意圖，由上到下是呼叫方向）：

```
你的網頁 JS ──► univerAPI（Facade：FUniver → FWorkbook → FWorksheet → FRange）
                      │ executeCommand(id, params)
                      ▼
             ICommandService ── Command ──► Mutation（改 snapshot，可同步）
                      │                     Operation（只改 UI 狀態）
                      │                     └─► IUndoRedoService（存反向 Mutation）
                      ▼
             資料模型 Workbook／Worksheet（IWorkbookData JSON）
                      ▲
   外掛：sheets（邏輯）｜sheets-ui（React 介面＋Canvas 繪製模組）｜sheets-formula｜numfmt…
                      ▲
   core：redi Injector、PluginService、LifecycleService、ConfigService、LocaleService
```

**1-1 入口：`new Univer()` 先建根注入器**

[univer.ts#L272-L304](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/univer.ts#L272-L304) 的 `createUniverInjector()` 會把 19 個核心服務放進根 `Injector`（我逐行數的：7 個具體類別，加 12 個「介面 token → 實作」）。例如：

- `ICommandService`（指令）
- `IUndoRedoService`（復原）
- `IConfigService`（設定）
- `IUniverInstanceService`（管理多本活頁簿／文件）
- `PluginService`（外掛管理）
- `LifecycleService`（生命週期）

如果傳入 `parentInjector`，會改用 `createChild()` 建立子注入器，所以同一頁可以跑多個彼此隔離的 Univer。

**1-2 外掛長什麼樣**

基底類別在 [plugin.service.ts#L31-L74](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L31-L74)。實際例子是試算表核心外掛 [sheets/src/plugin.ts#L76-L100](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/plugin.ts#L76-L100)：

```ts
@DependentOn(UniverFormulaEnginePlugin)
export class UniverSheetsPlugin extends Plugin {
    static override pluginName = 'SHEET_PLUGIN';
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config: Partial<IUniverSheetsConfig> = defaultPluginConfig, // ← registerPlugin 的第 2 個參數
        @Inject(Injector) override readonly _injector: Injector,                       // ← redi 注入
        @IConfigService private readonly _configService: IConfigService                 // ← token 本身就是裝飾器
    ) { /* ... */ }
```

- 外掛在 `_initDependencies()` 裡用 `registerDependencies()` 一次登記約 30 個服務／控制器（[L120-L179](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/plugin.ts#L120-L179)），再在 `onStarting/onReady/onRendered` 用 `touchDependencies()` 依序「摸一下」，強迫它們實例化（[L181-L216](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/plugin.ts#L181-L216)）。
- 為什麼要摸？因為登記進去的東西要等第一次被 `get` 才會建立（[di.ts#L68-L79](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/common/di.ts#L68-L79) 的註解寫明「ensure they are instantiated」）。而控制器是在**建構子裡**註冊指令的。例如 `BasicWorksheetController` 的建構子先註冊 27 個跟公式有關的 Mutation／Operation，再註冊另外 136 個指令（逐行計數，[basic-worksheet.controller.ts#L188-L399](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/controllers/basic-worksheet.controller.ts#L188-L399)）。

**1-3 註冊之後，什麼時候真的載入？**

- `registerPlugin()`（[plugin.service.ts#L149-L165](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L149-L165)）先檢查 type、名稱、版本、是否重複，再放進登記表。
- `type` 為 `UNIVER_UNKNOWN` 的外掛當下就實例化。這類包括 UI、繪製引擎、公式引擎、網路、RPC；Docs 與 Docs UI 的 `type` 那行在原始碼裡被註解掉，所以也算 UNKNOWN。
- `UNIVER_SHEET` 類外掛（Sheets、Sheets UI、公式、數字格式）先暫存。等 [univer.ts#L201-L229](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/univer.ts#L201-L229) 第一次建立該類型的活頁簿時，才呼叫 `startPluginsForType()` 一起載入。
- 已經有活頁簿之後才註冊的外掛，會在 4 ms 後補載入（[L221-L229](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L221-L229)）。所以「先開表、需要時再 `import()` 某功能外掛」是可行的。

**1-4 `@DependentOn` 與拓樸排序**

- 裝飾器只是把依賴清單掛在類別上（[L103-L119](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L103-L119)）。
- `_loadFromPlugins()` 用深度優先搜尋排好順序，讓被依賴的先建立。沒註冊的依賴會以預設設定自動補註冊（[L231-L292](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L231-L292)）。
- 限制：UNKNOWN 型別的外掛不能依賴特定型別的外掛，違反會直接丟錯（L261-L266）。

**1-5 生命週期四階段**

[lifecycle.ts#L20-L41](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/lifecycle/lifecycle.ts#L20-L41) 定義了四個階段：

| 階段 | 何時到達 | 依據 |
|---|---|---|
| Starting | 建立 Univer 時 | lifecycle.service.ts |
| Ready | 第一個單元（活頁簿／文件）建立 | [univer.ts#L231-L236](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/univer.ts#L231-L236) |
| Rendered | Ready 後 300 ms，UI 完成首次繪製 | [ui-shared.controller.ts#L69-L97](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/ui/src/controllers/ui/ui-shared.controller.ts#L69-L97) |
| Steady | 再過 `STEADY_TIMEOUT = 3000` ms | 同檔 L23 |

- 晚註冊的外掛會把已經過去的階段補跑一遍（[plugin.service.ts#L294-L309](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L294-L309)）。
- 用 grep 查，只有 UI 外掛會把階段推到 Rendered／Steady。因此在 Node 無介面模式下，`onRendered/onSteady` 推論不會被呼叫（未實測）。

**1-6 redi 用法速查**（次數是非測試檔的 grep 計數）

| 寫法 | 意思 | 本 repo 例子／次數 |
|---|---|---|
| `createIdentifier<T>('core.log.service')` | 建立「介面 token」，token 本身就能當參數裝飾器 | 約 105 處 |
| `@Inject(SomeClass)` | 以類別當 token 注入 | 外掛建構子普遍使用 |
| `@Optional(Token)` | 沒登記就給 `undefined` | 36 處 |
| `[Token, { useClass }]`／`{ useFactory }`／`{ useValue }` | 介面→實作／工廠／現成值 | useFactory 11、useValue 1 |
| `lazy: true` | 延遲建立 | 19 處 |
| `injector.createInstance(Ctor, 設定)` | 前面的參數手動傳，其餘注入 | 外掛設定就是這樣傳進去（[L330-L338](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L330-L338)） |
| `injector.invoke(fn, ...)` | 把 `accessor` 塞給函式當第 1 個參數 | 指令 handler 就是這樣執行 |
| `injector.createChild()` | 子注入器 | univer.ts L297、[render-unit.ts#L120](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/render-manager/render-unit.ts#L120) |

redi 本身是外部套件 `@wendellhu/redi`，被 core 釘在 1.1.3（`packages/core/package.json`），不在這個 repo。上表只依 Univer 的用法整理，redi 內部實作細節**未逐行確認**。

**1-7 用 override 換掉核心服務**

[plugin-override.ts#L21-L43](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin-override.ts#L21-L43) 的規則：`new Univer({ override: [[IUndoRedoService, null]] })` 會移除該服務，`[[ILogService, { useClass: MyLog }]]` 會替換成你的實作。`createUniver({ collaboration: true })` 就是靠這招移除 3 個服務（[preset.ts#L51-L55](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/src/preset.ts#L51-L55)）。

**1-8 繪製層有自己的子注入器**

每個活頁簿的繪製單元都會 `createChild()`。外掛用 `registerRenderModule(UNIVER_SHEET, …)` 登記「每本表各一份」的繪製控制器（[sheets-ui/src/plugin.ts#L266-L277](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/plugin.ts#L266-L277)）。`docs/FIX_MEMORY_LEAK.md` 也建議：跟「目前這本表」有關的訂閱要寫成繪製模組，不要放在根單例，否則容易記憶體洩漏。

### 二、Command／Mutation／Operation 指令系統

**2-1 三種型別**（[command.service.ts#L37-L55](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L37-L55)）

| 型別 | 值 | 改 snapshot？ | 復原 | 同步 | 例子 |
|---|---|---|---|---|---|
| COMMAND | 0 | 不直接改，負責編排 | 自己 `pushUndoRedo` | 不送 | `sheet.command.set-range-values` |
| OPERATION | 1 | 否（捲動、選取、作用中工作表） | 否 | 否 | `sheet.operation.set-worksheet-active` |
| MUTATION | 2 | **是** | 被 Command 收進復原／重做陣列 | **是**（官方註解：協作衝突解決的最小單位） | `sheet.mutation.set-range-values` |

全 repo 非測試檔數量（grep `type: CommandType.X` 與 `type = CommandType.X`）：COMMAND 432、MUTATION 129、OPERATION 115。單看 `sheets` 套件，以檔名後綴計數是 62 個 `.command.ts`、48 個 `.mutation.ts`、4 個 `.operation.ts`。指令 id 的命名規則是 `<業務>.<command|mutation|operation>.<名稱>`（[NAMING_CONVENTION.md#L113-L152](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/docs/NAMING_CONVENTION.md#L113-L152)）。

**2-2 執行流程**（[executeCommand L416-L475](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L416-L475)）

1. 從登記表找出指令。
2. 如果是 Mutation，自動把觸發它的 Command id 寫進 `params.trigger`（[L576-L601](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L576-L601)）。
3. 呼叫「執行前」監聽者。Facade 的 `BeforeCommandExecute` 事件可以在這一步取消指令。
4. `this._injector.invoke(command.handler, params, options)` 執行（[L607-L632](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L607-L632)）。handler 拿到 `accessor`，用 `accessor.get(服務)` 取得任何服務。
5. 呼叫「執行後」監聽者。Mutation 另外通知協作監聽者。

`syncExecuteCommand` 是同步版本，handler 若回傳 Promise 會直接丟錯。

**2-3 實例：改一格的值**

- **Command**（[set-range-values.command.ts#L52-L161](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/commands/set-range-values.command.ts#L52-L161)）依序做五件事：
  1. 算出 redo 參數。
  2. 用 `SetRangeValuesUndoMutationFactory` 讀目前內容，產生 undo 參數。
  3. 執行 Mutation（L116）。
  4. 讓攔截器追加其他外掛的連動 Mutation，以及自動列高（L119-L129）。
  5. 把兩組陣列推進復原堆疊（L149-L154）。
- **Mutation**（[set-range-values.mutation.ts#L156-L199](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/mutations/set-range-values.mutation.ts#L156-L199)）只動資料矩陣，不碰 UI。

```ts
export const SetRangeValuesMutation: IMutation<ISetRangeValuesMutationParams, boolean> = {
    id: 'sheet.mutation.set-range-values',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const workbook = accessor.get(IUniverInstanceService).getUnit<Workbook>(params.unitId);
        // ... 逐格 cellMatrix.setValue(row, col, merged) 或 realDeleteValue
    },
};
```

- **Operation**（[set-worksheet-active.operation.ts#L25-L43](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/operations/set-worksheet-active.operation.ts#L25-L43)）只做 `workbook.setActiveSheet()`。

官方要求 Mutation 寫在「邏輯外掛」裡、不讀 UI 狀態，讓它在 Node 和瀏覽器都能跑（[ISOMORPHIC.md#L31-L34](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/docs/ISOMORPHIC.md#L31-L34)）。

**2-4 復原／重做 = 重放 Mutation**

[undoredo.service.ts#L128-L175](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/undoredo/undoredo.service.ts#L128-L175) 的 Undo 就是 `sequenceExecute(element.undoMutations)`。堆疊依活頁簿分開，預設保留 50 步，可用 `new Univer({ undoRedoHistoryLimit })` 調整（univer.ts L106-L111）。

**2-5 執行選項旗標**（[L186-L199](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L186-L199)）

- `onlyLocal`：只在本機執行、不同步。共 47 處 `onlyLocal: true`，大多是公式計算結果回填。
- `fromCollab`：這筆來自遠端。
- `fromChangeset`：這筆來自歷史重放。
- `syncOnly`：只送出、不在本機執行。

同步到 Firestore 時，靠前兩個旗標過濾，避免「回音」。

**2-6 攔截器：別人的指令也能加料**

`SheetInterceptorService.interceptCommand()`（[sheet-interceptor.service.ts#L181](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/sheet-interceptor/sheet-interceptor.service.ts#L181)）讓外掛在別人的 Command 執行時，追加自己的 Mutation。例如註解外掛會在刪列時一併搬移註解，而且仍然可以一起復原。

**2-7 Web Worker 也靠 Mutation 同步**

`UniverSheetsCoreWorkerPreset` 會在 Worker 裡只載入跟公式有關的 Mutation（[worker.ts#L31-L42](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/worker.ts#L31-L42)）。主執行緒的 [data-sync-primary.controller.ts#L143-L182](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/rpc/src/controllers/data-sync/data-sync-primary.controller.ts#L143-L182) 的做法是：建立活頁簿時先送整份 snapshot，之後每個 Mutation 逐筆轉送，並跳過從對方回來的那筆。**這和第七節的 Firestore 做法是同一個模式。**

### 三、資料模型 IWorkbookData（JSON 長相，附範例）

**3-1 結構**

介面定義：[typedef.ts#L32-L98](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/typedef.ts#L32-L98)（活頁簿）、[L123-L193](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/typedef.ts#L123-L193)（工作表）、[L290-L343](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/typedef.ts#L290-L343)（儲存格）。

| 層級 | 重要欄位 |
|---|---|
| 活頁簿 | `id`、`name`、`appVersion`、`locale`、`styles`（樣式表）、`sheetOrder`、`sheets`、`resources`、`custom` |
| 工作表 | `id`、`name`、`rowCount`、`columnCount`、`freeze`、`mergeData`、`cellData`、`rowData`（`h` 列高、`hd` 隱藏）、`columnData`（`w` 欄寬）、`hidden`、`showGridlines` |
| 儲存格 `ICellData` | `v` 值、`t` 型別（1 字串、2 數字、3 布林、4 強制文字）、`f` 公式、`si` 共用公式 id、`s` 樣式 id 或樣式物件、`p` 富文字、`custom` 自訂欄位 |
| 樣式 `IStyleData` | `bl` 粗體、`it` 斜體、`fs` 字級、`ff` 字型、`cl` 字色、`bg` 底色、`bd` 框線、`ht`／`vt` 對齊（置中都是 2）、`tb` 換行、`n.pattern` 數字格式（[i-style-data.ts#L257-L354](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/types/interfaces/i-style-data.ts#L257-L354)） |

`cellData` 的型別是 `{ [列]: { [欄]: T } }` 稀疏物件，不是二維陣列（[object-matrix.ts#L24-L30](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/object-matrix.ts#L24-L30)）。空白格完全不佔空間。

**3-2 範例：一張庫存成本表**

列、欄都從 0 開始。`resources` 的格式取自 repo 的示範資料（[create-sheet-fixture.ts#L794-L805](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/examples/src/sheets/create-sheet-fixture.ts#L794-L805)）。

```json
{
  "id": "inventory-main",
  "name": "庫存與成本",
  "appVersion": "1.3.1",
  "locale": "zhTW",
  "styles": {
    "hdr": { "bl": 1, "bg": { "rgb": "#DBEAFE" }, "ht": 2, "vt": 2 },
    "twd": { "n": { "pattern": "#,##0" } }
  },
  "sheetOrder": ["stock"],
  "sheets": {
    "stock": {
      "id": "stock",
      "name": "庫存",
      "rowCount": 200,
      "columnCount": 8,
      "freeze": { "xSplit": 0, "ySplit": 1, "startRow": 1, "startColumn": 0 },
      "columnData": { "1": { "w": 160 } },
      "rowData": { "0": { "h": 30 } },
      "mergeData": [],
      "cellData": {
        "0": { "0": { "v": "SKU", "s": "hdr" }, "1": { "v": "品名", "s": "hdr" },
               "2": { "v": "成本", "s": "hdr" }, "3": { "v": "售價", "s": "hdr" }, "4": { "v": "毛利率", "s": "hdr" } },
        "1": { "0": { "v": "A001" }, "1": { "v": "保溫杯" },
               "2": { "v": 180, "t": 2, "s": "twd" }, "3": { "v": 390, "t": 2, "s": "twd" },
               "4": { "f": "=(D2-C2)/D2" } }
      }
    }
  },
  "resources": [
    { "name": "SHEET_FILTER_PLUGIN",
      "data": "{\"stock\":{\"ref\":{\"startRow\":0,\"endRow\":199,\"startColumn\":0,\"endColumn\":4},\"filterColumns\":[],\"cachedFilteredOut\":[]}}" }
  ]
}
```

**3-3 沒給的欄位怎麼補**

- 工作表預設 1000 列 × 20 欄、列高 24、欄寬 88（[sheet-snapshot-utils.ts#L23-L81](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/sheet-snapshot-utils.ts#L23-L81)）。
- 活頁簿的 `locale` 預設是 `zhCN`（[empty-snapshot.ts#L22-L40](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/empty-snapshot.ts#L22-L40)），這個欄位影響哪些行為未確認。
- 沒有工作表時，會自動建一張 id 隨機的工作表（[workbook.ts#L462-L494](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/workbook.ts#L462-L494)）。
- 沒給 `id` 時，會隨機產生 6 碼（同檔 L111-L113）。**要存進資料庫，一定要自己給固定 id。**

**3-4 resources：外掛資料怎麼進出 snapshot**

- 每個外掛向 `IResourceManagerService` 登記一組 `toJson/parseJson/onLoad/onUnLoad`（[type.ts#L22-L34](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/resource-manager/type.ts#L22-L34)）。最好讀的範本是註解外掛（[sheets-note-resource.controller.ts#L85-L112](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-note/src/controllers/sheets-note-resource.controller.ts#L85-L112)）。
- `fWorkbook.save()`（[f-workbook.ts#L182-L185](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-workbook.ts#L182-L185)）會深拷貝 snapshot，再**用「目前有登記的外掛」重建 `resources`**（[resource-loader.service.ts#L164-L173](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/resource-loader/resource-loader.service.ts#L164-L173)、[resource-manager.service.ts#L56-L71](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/resource-manager/resource-manager.service.ts#L56-L71)）。

### 四、Facade API

- **建立**：`FUniver.newAPI(univer)` 用注入器建出 `univerAPI`（[f-univer.ts#L86-L89](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/facade/f-univer.ts#L86-L89)）。
- **mixin 機制**：`FUniver.extend(來源類別)` 會把方法複製到原型上，`_initialize` 則收集成初始化函式，在 `FUniver` 建構時執行（[L101-L121](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/facade/f-univer.ts#L101-L121)、[L163-L168](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/facade/f-univer.ts#L163-L168)）。`FWorkbook`、`FRange` 走的是同樣機制（[f-base.ts#L104-L131](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/facade/f-base.ts#L104-L131)）。試算表套件在檔尾執行 `FUniver.extend(FUniverSheetsMixin)`，並用 TypeScript `declare module` 補上型別（[sheets/src/facade/f-univer.ts#L744-L747](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-univer.ts#L744-L747)）。
- **規模**：`src/facade` 目錄有 28 個；`X.extend(` 呼叫有 75 處，其中 FUniver 19、FEnum 12、FWorksheet 11、FRange 11、FEventName 11、FWorkbook 8。
- **推論（依 L163-L168）：facade 的 import 要寫在 `newAPI` 之前。** 太晚才 import，方法雖然掛得上去，但那個套件 `_initialize` 裡綁的事件不會在既有的 `univerAPI` 生效。
- **每次取物件都是新的包裝**：`getActiveWorkbook()` 每次都 `createInstance(FWorkbook, …)` 建一個新物件（[L167-L174](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-univer.ts#L167-L174)），不要用 `===` 比較。
- **底層仍是指令**：`FRange.setValue()` 執行的就是 `SetRangeValuesCommand`（[f-range.ts#L1351-L1366](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-range.ts#L1351-L1366)）。所以用 API 寫入的資料可以復原，也會觸發事件。

常用寫法（方法皆已在原始碼確認存在）：

```js
const wb = univerAPI.createWorkbook({ id: 'inventory-main', name: '庫存' });
const ws = wb.getActiveSheet();
ws.getRange('A1:C2').setValues([['品名', '成本', '售價'], ['保溫杯', 180, 390]]);
ws.getRange('D2').setValue({ f: '=(C2-B2)/C2' });
console.log(ws.getRange('A1:D2').getValues());
univerAPI.addEvent(univerAPI.Event.CommandExecuted, (e) => console.log(e.id, e.type));
// 自訂公式函數（與「查價／成本計算」直接相關），另有 registerAsyncFunction 可做非同步查詢
univerAPI.getFormula().registerFunction('MARGIN', (cost, price) => (price - cost) / price, '毛利率');
// 工具列加按鈕
univerAPI.createMenu({ id: 'my-save', title: '存到雲端', tooltip: '立即存檔', action: () => save() })
  .appendTo('ribbon.start.others');
```

上面用到的方法出處：`registerFunction`／`registerAsyncFunction` 見 [f-formula.ts#L148](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/facade/f-formula.ts#L148)、[L232](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/facade/f-formula.ts#L232)；`createMenu` 見 [ui/src/facade/f-univer.ts#L210](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/ui/src/facade/f-univer.ts#L210)；`addEvent` 見 [core f-univer.ts#L615-L618](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/facade/f-univer.ts#L615-L618)。

事件數量：核心 9 個，試算表套件再加 20 個。把所有 `f-event.ts` 的 `override get X()` 去重後共 100 個名稱。

### 五、用純 JavaScript（不經 React／Vue）把 Univer 嵌進既有網頁

**5-1 先知道三件事**

- **UI 本身是 React 畫的**：Workbench 透過 `react-dom/client` 的 `createRoot` 掛進容器（[Workbench.tsx#L56-L63](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/ui/src/views/workbench/Workbench.tsx#L56-L63)、[design/src/helper/react-dom.ts#L17-L36](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/design/src/helper/react-dom.ts#L17-L36)）。你的程式不用寫 React，但 `react`、`react-dom`、`rxjs` 是 peer dependency，必須安裝（見各套件 `package.json`）。
- **容器可以給 id 字串或 DOM 元素**（[ui.controller.ts#L22-L62](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/ui/src/controllers/ui/ui.controller.ts#L22-L62)）。**id 打錯不會報錯**：程式會自己建一個沒掛到頁面上的 `div`（[ui-desktop.controller.ts#L68-L110](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/ui/src/controllers/ui/ui-desktop.controller.ts#L68-L110)），結果就是白畫面。容器也一定要有高度。
- **CSS 對宿主頁面算友善**：Tailwind 類別一律加 `univer-` 前綴，並關閉 preflight 全域重設（[tailwind.config.ts#L76-L84](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tailwind/tailwind.config.ts#L76-L84)），不容易弄亂你原本的版面。

**5-2 方案 A（推薦）：Vite + 原生 JS，Plugin 模式完整最小範例**

改寫自 [README.md#L143-L264](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md#L143-L264)，換成繁中語系。

```bash
npm create vite@latest my-sheet -- --template vanilla && cd my-sheet
npm i react react-dom rxjs @univerjs/core @univerjs/design @univerjs/docs @univerjs/docs-ui \
  @univerjs/engine-formula @univerjs/engine-render @univerjs/sheets @univerjs/sheets-ui \
  @univerjs/sheets-formula @univerjs/sheets-formula-ui @univerjs/sheets-numfmt @univerjs/sheets-numfmt-ui @univerjs/ui
# 所有 @univerjs/* 必須同一個版本號
```

`index.html`：

```html
<!doctype html>
<html lang="zh-Hant-TW">
  <head><meta charset="UTF-8" /><title>庫存試算表</title></head>
  <body>
    <nav>（你原本的選單）</nav>
    <div id="sheet" style="height: calc(100vh - 48px)"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

`main.js`：

```js
import { LocaleType, mergeLocales, Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
// 繁中語系（每個套件都有 locale/zh-TW）
import DesignZhTW from '@univerjs/design/locale/zh-TW';
import UIZhTW from '@univerjs/ui/locale/zh-TW';
import DocsUIZhTW from '@univerjs/docs-ui/locale/zh-TW';
import SheetsZhTW from '@univerjs/sheets/locale/zh-TW';
import SheetsUIZhTW from '@univerjs/sheets-ui/locale/zh-TW';
import SheetsFormulaZhTW from '@univerjs/sheets-formula/locale/zh-TW';
import SheetsFormulaUIZhTW from '@univerjs/sheets-formula-ui/locale/zh-TW';
import SheetsNumfmtUIZhTW from '@univerjs/sheets-numfmt-ui/locale/zh-TW';
import EngineFormulaZhTW from '@univerjs/engine-formula/locale/zh-TW'; // 函數說明，README 範例漏了這個
// 樣式
import '@univerjs/design/lib/index.css';
import '@univerjs/ui/lib/index.css';
import '@univerjs/docs-ui/lib/index.css';
import '@univerjs/sheets-ui/lib/index.css';
import '@univerjs/sheets-formula-ui/lib/index.css';
import '@univerjs/sheets-numfmt-ui/lib/index.css';
// Facade：純副作用 import，一定要在 newAPI 之前
import '@univerjs/engine-formula/facade';
import '@univerjs/ui/facade';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-ui/facade';
import '@univerjs/sheets-formula/facade';
import '@univerjs/sheets-numfmt/facade';

const univer = new Univer({
  locale: LocaleType.ZH_TW,
  locales: { [LocaleType.ZH_TW]: mergeLocales(DesignZhTW, UIZhTW, DocsUIZhTW, SheetsZhTW,
    SheetsUIZhTW, SheetsFormulaZhTW, SheetsFormulaUIZhTW, SheetsNumfmtUIZhTW, EngineFormulaZhTW) },
});
// 順序：被依賴的先註冊
univer.registerPlugin(UniverRenderEnginePlugin);
univer.registerPlugin(UniverFormulaEnginePlugin);
univer.registerPlugin(UniverUIPlugin, { container: 'sheet' });
univer.registerPlugin(UniverDocsPlugin);
univer.registerPlugin(UniverDocsUIPlugin);
univer.registerPlugin(UniverSheetsPlugin);
univer.registerPlugin(UniverSheetsUIPlugin);
univer.registerPlugin(UniverSheetsFormulaPlugin);
univer.registerPlugin(UniverSheetsFormulaUIPlugin);
univer.registerPlugin(UniverSheetsNumfmtPlugin);
univer.registerPlugin(UniverSheetsNumfmtUIPlugin);

const univerAPI = FUniver.newAPI(univer);
univerAPI.createWorkbook({ id: 'inventory-main', name: '庫存' });
window.univerAPI = univerAPI; // 讓你原本的程式也能呼叫
// 離開頁面或切換 SPA 路由時：univer.dispose()
```

做法說明：

- `npm run build` 會產出 `dist/`，Firebase Hosting 的 `public` 指向 `dist` 即可。
- `EngineFormulaZhTW` 為什麼要加：函數說明用的是 `engine-formula.functionList.*` 這組鍵；找不到翻譯時，`t()` 會直接回傳鍵名（[locale.service.ts#L83-L96](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/locale/locale.service.ts#L83-L96)），畫面上就會看到一串英文鍵。

**5-3 方案 B：Preset 模式（最短）**

`createUniver` 本身也是 `new Univer` 加上逐一 `registerPlugin`（[preset.ts#L48-L104](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/src/preset.ts#L48-L104)）。`UniverSheetsCorePreset` 內含上面那套外掛，另外加了網路外掛，並在設定 `workerURL` 時改用 Worker 跑公式（[preset-sheets-core/src/preset.ts#L87-L169](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/preset.ts#L87-L169)）。preset 的語系檔是建置時把各依賴的語系合併產生的（`common/shared/preset-build/locale.ts`），所以函數說明已經包含在內。

```js
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import sheetsCoreZhTW from '@univerjs/preset-sheets-core/locales/zh-TW';
import '@univerjs/preset-sheets-core/lib/index.css';

const { univer, univerAPI } = createUniver({
  locale: LocaleType.ZH_TW,
  locales: { [LocaleType.ZH_TW]: mergeLocales(sheetsCoreZhTW) },
  presets: [UniverSheetsCorePreset({ container: 'sheet' })],
});
univerAPI.createWorkbook({ id: 'inventory-main' });
```

**5-4 方案 C：不打包，直接用 `<script>`（UMD）**

- 每個套件都會產出 `lib/umd/index.js`、`lib/umd/facade.js` 和 `lib/umd/locale/zh-TW.js`（[constants.ts#L3-L7](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/constants.ts#L3-L7)、[umd.ts#L101-L133](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/configs/umd.ts#L101-L133)）。
- 全域名的規則（[umd.ts#L25-L34](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/configs/umd.ts#L25-L34)、[L83-L96](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/configs/umd.ts#L83-L96)）：`@univerjs/sheets-ui` 對應 `UniverSheetsUi`，它的 facade 是 `UniverSheetsUiFacade`，語系是 `UniverSheetsUiZhTW`。用法類似 `const { Univer } = UniverCore;`。
- 要先載入的外部全域有 `React`、`ReactDOM`、`rxjs`，以及**全域名就叫 `'@wendellhu/redi'`** 的 redi（[peer-deps.ts#L1-L47](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/data/peer-deps.ts#L1-L47)）。
- preset 套件在這個版本只建 ESM／CJS（[preset-build/index.ts#L107](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/preset-build/index.ts#L107)），所以 UMD 只能走 Plugin 模式。
- **以下未確認**：npm 上實際的檔案、redi 的 UMD 路徑、語系 UMD 的 default 匯出形狀。另外，React 19 已不提供 UMD 版（外部常識），這條路要搭配 React 18。

結論：能用打包就用方案 A。esm.sh 這類 ESM CDN 可能讓同一套件被載入兩份；版本不一致時，[plugin.service.ts#L200-L212](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L200-L212) 只會記錄錯誤、不會擋下來。因此不建議（推論）。

### 六、最小可用套件組合與 bundle 大小

| 組合 | npm 套件 | 外掛 | 說明 |
|---|---|---|---|
| 技術下限（未實測） | core、design、engine-render、engine-formula、ui、docs、docs-ui、sheets、sheets-ui（9 個） | 7 | `sheets-ui` 的 `@DependentOn` 一定會拉進 Docs、公式引擎、繪製、Sheets、Docs UI（[sheets-ui/src/plugin.ts#L130-L141](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/plugin.ts#L130-L141)）。少了 `sheets-formula` 就沒有觸發計算的控制器，公式推論不會計算 |
| 實用最小（README） | 上面 9 個 + sheets-formula、sheets-formula-ui、sheets-numfmt、sheets-numfmt-ui（13 個） | 11 | [README.md#L153](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md#L153) |
| Preset | `@univerjs/presets` + `@univerjs/preset-sheets-core` | 12～13 | 多了網路外掛；設定 workerURL 時再多 RPC |

除此之外還會自動帶進的內部套件有 `themes`、`protocol`、`rpc`、`drawing`、`telemetry`、`icons`。第三方依賴包括 `@wendellhu/redi`、`lodash-es`、`decimal.js`、`@floating-ui/dom`、`franc-min`、7 個 `@radix-ui/*`、`cmdk`、`sonner` 等（取自各 `package.json`）。`protocol` 依賴的 `@grpc/grpc-js` 會被裝進 `node_modules`，但原始碼裡只有 `import type`，推論不會進瀏覽器 bundle。

**大小：本次無法建置，實際 bundle 未確認。** 以下是原始碼量級。量法：自寫 Python，統計 `src` 下非測試的 `.ts/.tsx`，排除 `locale/` 與斷字表 `patterns/`。

| 套件 | 行數 | 原始碼 | gzip 後 |
|---|---|---|---|
| engine-formula | 103,615 | 3.7 MB | 413 KB |
| sheets-ui | 64,782 | 2.6 MB | 507 KB |
| engine-render | 62,784 | 2.2 MB | 426 KB |
| docs-ui | 55,684 | 2.0 MB | 345 KB |
| core | 49,600 | 1.6 MB | 313 KB |
| sheets | 48,453 | 1.8 MB | 233 KB |
| **README 13 套件＋5 個內部依賴，合計** | **470,142** | **17.4 MB** | **2.7 MB** |
| 技術下限 9 套件＋內部依賴，合計 | 445,912 | 16.5 MB | 2.6 MB |

- 公式和數字格式的四個外掛只多了約 2.4 萬行，體積主要在引擎與 UI。
- `engine-render` 有 78 個斷字表檔（4.7 MB），除英文外都用動態 import 拆成獨立 chunk（[hyphen.ts#L24-L27](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/docs/layout/hyphenation/hyphen.ts#L24-L27) 的註解；載入表在建置時才產生）。
- 自己量的方法：`npm run build` 後看 `dist/assets/*.js` 的大小；或在本 repo 執行 `pnpm build && pnpm analyze:build`，它會輸出 `artifacts/package-sizes.json`，含 raw、gzip、brotli 三種數字（[build-analysis.mts#L385-L394](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/scripts/build-analysis.mts#L385-L394)）。

### 七、存進 Firebase Firestore，並在變更時同步

**7-1 掛鉤點**

官方 WebSocket 範例的過濾條件，正好可以照搬到 Firestore（[network/src/facade/f-univer.ts#L69-L77](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/network/src/facade/f-univer.ts#L69-L77)）：

```js
univerAPI.addEvent(univerAPI.Event.CommandExecuted, ({ id, type, params, options }) => {
  if (type !== univerAPI.Enum.CommandType.MUTATION || options?.fromCollab || options?.onlyLocal
      || id === 'doc.mutation.rich-text-editing') return;   // 只同步「本機產生、會存檔」的 Mutation
  /* 送出 { id, params } */
});
```

**7-2 方案 A（推薦給個人或少數裝置）：整本存檔，遠端改了就整本重載**

```js
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';

const db = getFirestore(initializeApp(firebaseConfig));
const WB_ID = 'inventory-main';                 // 固定 id（不給的話 Univer 會隨機產生）
const ref = doc(db, 'workbooks', WB_ID);
const CLIENT = crypto.randomUUID();             // 用來辨識「是不是自己寫的」

export async function openWorkbook(univerAPI) {
  const snap = await getDoc(ref);
  const data = snap.exists() ? JSON.parse(snap.data().json) : { id: WB_ID, name: '庫存' };
  univerAPI.createWorkbook(data);

  let timer = null;
  async function save() {
    const json = JSON.stringify(univerAPI.getWorkbook(WB_ID).save());
    const bytes = new TextEncoder().encode(json).length;   // 中文一字約 3 bytes
    if (bytes > 900_000) console.warn('接近 Firestore 單一文件 1 MiB 上限', bytes);
    await setDoc(ref, { json, by: CLIENT, at: serverTimestamp() });
  }

  // ① 本機有 Mutation → 停手 1.5 秒後存檔
  univerAPI.addEvent(univerAPI.Event.CommandExecuted, ({ type, options }) => {
    if (type !== univerAPI.Enum.CommandType.MUTATION) return;
    if (options?.onlyLocal || options?.fromCollab) return;
    clearTimeout(timer);
    timer = setTimeout(save, 1500);
  });

  // ② 別台裝置存檔 → 整本重載（游標與復原堆疊會重置）
  let first = true;
  onSnapshot(ref, (s) => {
    if (first) { first = false; return; }               // 第一次回呼是目前內容，略過
    if (!s.exists() || s.metadata.hasPendingWrites) return;
    const d = s.data();
    if (d.by === CLIENT) return;
    clearTimeout(timer);
    univerAPI.disposeUnit(WB_ID);
    univerAPI.createWorkbook(JSON.parse(d.json));
  });
  return { save };                                      // 可接到 createMenu 的「存到雲端」按鈕
}
```

- **為什麼存成一個 JSON 字串欄位**：可以避開 Firestore 的幾個限制：不支援陣列裡直接放陣列、不接受 `undefined`，大型 map 還會讓索引項目暴增。
- **文件大小**：單一文件上限 1 MiB，單一文件的持續寫入建議約每秒 1 次（以上為 Firebase 官方限制，非本 repo 內容）。
- **表太大怎麼辦**：拆成 `workbooks/{id}`（只放 styles、sheetOrder、resources）加 `workbooks/{id}/sheets/{sheetId}`（每張表一份文件），用 `writeBatch` 一起寫；或把 JSON 放 Cloud Storage，Firestore 只記版本號。
- **安全規則**：至少限制 `request.auth.uid` 必須是你本人。
- **衝突**：兩台裝置同時改時是「後寫的贏」。想偵測衝突，可以在文件加 `rev` 欄位，用 `runTransaction` 比對後再寫。

**7-3 方案 B（進階）：逐筆 Mutation 日誌，接近即時**

做法是把 7-1 的 `{ id, params: JSON.stringify(params), by, at }` 用 `addDoc` 寫進 `workbooks/{id}/ops`。對方用 `onSnapshot(query(ops, orderBy('at')))` 收到新增的那筆，再呼叫 `univerAPI.syncExecuteCommand(op.id, JSON.parse(op.params), { fromCollab: true })` 套用。帶上 `fromCollab` 就不會被自己的監聽器再送一次。這正是 repo 內 Worker 同步的模式（2-7 節）。

風險要先講清楚：

- 沒有 OT／衝突轉換，兩人同時改同一區可能分歧。
- 初次載入要用「snapshot＋之後的 ops」，ops 也要定期壓縮。
- 只要漏掉一筆，兩端就會不一致。

真正的多人協作伺服器屬於 Univer Pro（README L292）。

---

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. `README.md` L143-L264：Plugin／Preset 兩種組裝法的全貌。
2. `packages/core/src/univer.ts`：根注入器有哪 19 個服務，以及「第一本表才載入外掛」的機制。
3. `packages/core/src/common/di.ts`：Univer 從 redi 轉出口了哪些 API。
4. `packages/core/src/services/plugin/plugin.service.ts`：註冊、拓樸排序、生命週期補跑。
5. `packages/core/src/services/lifecycle/lifecycle.ts` ＋ `packages/ui/src/controllers/ui/ui-shared.controller.ts`：四個階段由誰、在何時推進。
6. `packages/sheets-note/src/`（`plugin.ts` → `controllers/` → `commands/` → `facade/`）：**最小、最完整的外掛範本**，整個外掛不到 15 個檔案。
7. `packages/core/src/services/command/command.service.ts`：指令型別、執行流程、旗標。
8. `packages/sheets/src/commands/commands/set-range-values.command.ts` ＋ `mutations/set-range-values.mutation.ts`：典型的 Command → Mutation → 復原。
9. `packages/core/src/services/undoredo/undoredo.service.ts`：復原堆疊。
10. `packages/core/src/sheets/typedef.ts`、`sheet-snapshot-utils.ts`、`workbook.ts`：資料模型與預設值。
11. `packages/core/src/services/resource-manager/` ＋ `resource-loader/`：外掛資料怎麼進出 snapshot。
12. `packages/core/src/facade/f-univer.ts`、`f-base.ts` ＋ `packages/sheets/src/facade/f-univer.ts`、`f-workbook.ts`、`f-range.ts`：Facade 的 mixin 機制。
13. `packages/network/src/facade/f-univer.ts` L69-L77 ＋ `packages/rpc/src/controllers/data-sync/data-sync-primary.controller.ts`：同步樣板。
14. `presets/src/preset.ts` ＋ `presets/packages/preset-sheets-core/src/preset.ts`：preset 實際組了什麼。
15. `examples/src/sheets/mount.ts`：官方開發用工作台怎麼掛載。
16. `common/shared/tsdown/configs/umd.ts`：UMD 全域名怎麼來的。

---

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 想借的東西 | 位置 | 依賴 | 難度 | 怎麼接 |
|---|---|---|---|---|
| 整個試算表當元件 | 第五節範例 | React／ReactDOM／rxjs ＋ 13 個 `@univerjs/*` | 低 | 照方案 A 打包，用 `window.univerAPI` 和你的庫存 App 互通；不要拆原始碼，直接用 npm 套件 |
| Command／Mutation／Undo 思想 | `core/src/services/command/`、`undoredo/` | 概念上不需要任何依賴 | 中 | 你的庫存 App 把每次寫入改成 `{id, params}`，同時產生反向那筆。好處是一次拿到復原、操作日誌和 Firestore 同步 |
| 稀疏矩陣 `ObjectMatrix` | `core/src/shared/object-matrix.ts`（821 行） | 只依賴 `Tools` 與型別 | 低 | 可直接 `import { ObjectMatrix } from '@univerjs/core'`；要獨立抄檔，得一併帶走 `tools.ts` 的相關函式 |
| 依賴注入 | `@wendellhu/redi`（獨立 npm 套件） | 無 | 中 | 需要 TypeScript 參數裝飾器；純 JS 寫法未確認 |
| 自訂公式函數查價 | `registerAsyncFunction`（f-formula.ts L232） | 公式外掛 | 低 | 例如寫一個 `=查價("A001")`，在函數裡讀 Firestore 的價格表，直接用在毛利或成本試算 |
| 外掛資料存進 snapshot | `registerPluginResource`（以 sheets-note 為範本） | TS 外掛 | 中 | 把「供應商、批號」這類不屬於儲存格的資料，存成自己的 `SHEET_xxx_PLUGIN` resource |
| Facade mixin 模式 | `f-univer.ts` L101-L121 | 無 | 低 | 想替自己的工具做「一個入口物件、各模組往上掛方法」時可以參考 |
| 無介面公式引擎 | `engine-formula` ＋ `ISOMORPHIC.md` | core、rpc、decimal.js | 中高 | 在 Cloud Functions（Node）跑同一套公式，用來批次算成本；細節要另外驗證 |

**自己寫外掛的最小範本（TypeScript）**

照 sheets-note 的結構簡化，用到的 API 都在上文出處確認過；整段沒有實際編譯過。需要 TypeScript 並開啟參數裝飾器。

```ts
import type { IAccessor, IMutation } from '@univerjs/core';
import { CommandType, ICommandService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';

// Mutation：只改資料、參數可序列化（id 依命名規則 <業務>.mutation.<名稱>）
export const MarkCostCheckedMutation: IMutation<{ unitId: string; subUnitId: string; row: number }> = {
    id: 'sheet.mutation.mark-cost-checked',
    type: CommandType.MUTATION,
    handler: (accessor: IAccessor, params) => {
        /* 用 accessor.get(IUniverInstanceService) 取活頁簿再改資料 */
        return true;
    },
};

export class UniverCostCheckPlugin extends Plugin {
    static override pluginName = 'SHEET_COST_CHECK_PLUGIN';     // <業務>_<名稱>_PLUGIN
    static override type = UniverInstanceType.UNIVER_SHEET;     // 第一本表建立時才載入

    constructor(
        private readonly _config: Record<string, unknown> = {},
        @Inject(Injector) override readonly _injector: Injector,
        @ICommandService private readonly _commandService: ICommandService
    ) { super(); }

    override onStarting(): void {
        this.disposeWithMe(this._commandService.registerCommand(MarkCostCheckedMutation));
    }
}
// 使用：univer.registerPlugin(UniverCostCheckPlugin)；之後 univerAPI.executeCommand('sheet.mutation.mark-cost-checked', {...})
```

---

## 坑與限制

1. **版本必須完全一致**：版本不符只記錄錯誤、不擋下來（[plugin.service.ts#L200-L212](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L200-L212)），出錯時很難追。
2. **註冊順序會出錯**：某外掛已被別的外掛自動補註冊，你再手動註冊一次會丟「duplicated plugin name」（[L214-L216](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/plugin/plugin.service.ts#L214-L216)）。被依賴者一律先註冊。
3. **漏 import facade**：`univerAPI.createWorkbook` 會是 `undefined`。facade 太晚 import，事件綁定也不會生效（推論）。
4. **沒給 `locales` 會直接丟錯**：錯誤訊息是 `[LocaleService]: Locale not initialized`（[locale.service.ts#L84](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/locale/locale.service.ts#L84)）。少一包語系，畫面就會出現英文鍵名。
5. **容器沒高度或 id 打錯，會白畫面而且不報錯**（5-1 節）。
6. **你傳入的 snapshot 會被就地修改**：`Tools.commonExtend` 只做淺拷貝（[tools.ts#L377-L393](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/tools.ts#L377-L393)），`ObjectMatrix` 直接引用原物件（[object-matrix.ts#L818-L820](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/object-matrix.ts#L818-L820)）。要保留原始資料，請先 `structuredClone(data)` 再傳。
7. **用較少外掛的頁面存檔會丟資料**：`save()` 只輸出目前有登記的外掛資料（3-4 節）。例如甲頁有篩選外掛、乙頁沒有，乙頁存檔後篩選設定就消失了。拼裝「A＋B＋C」時，每個會存檔的頁面外掛組合要一致。
8. **Firestore 單一文件 1 MiB 上限**：大表要分拆（7-2 節）。
9. **`IPresetOptions.lazy` 目前沒有作用**：型別有定義（[preset.ts#L33-L35](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/src/preset.ts#L33-L35)），但 `createUniver` 取 preset 時直接丟掉了選項（L68-L70）。
10. **文件與版本不同步**：`docs/API_STABILITY.md` 第 5 行仍寫「pre-1.0」，`CHANGELOG.md` 最新一筆是 1.0.0-beta.2，但套件版本已經是 1.3.1。升級前要自己比對 API。
11. **Pro 功能不在這裡**：xlsx 匯入匯出、即時協作、列印、圖表、樞紐分析都要商業授權。純開源版要讀 Excel 檔，得另外搭 SheetJS 之類的工具，自己轉成 `IWorkbookData`。
12. **瀏覽器需求**：需要 `Intl.Segmenter`，舊瀏覽器要加 polyfill；編譯目標是 Chrome 88（[README.md#L283](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md#L283)、[constants.ts#L10](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/constants.ts#L10)）。
13. **生命週期依賴 UI 計時器**：Rendered 在 Ready 之後 300 ms、Steady 再 3 秒。要在「表格完全就緒」後才執行的程式，請用 `univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, …)` 判斷階段，不要自己寫死 `setTimeout`。
