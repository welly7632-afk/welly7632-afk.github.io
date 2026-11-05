# dream-num/univer｜深入：開源版 vs Pro 邊界、協作與 AI

> 深入分析｜掃描日期：2026-11-04｜commit：c13b042｜總覽資料包：_oss-research/01-web-excel/dream-num__univer.md
>
> 主 repo 完整 SHA：`c13b042d18c80c8348fbe52da445d68435febbca`（dev 分支，套件版本 1.3.1）。為了回答「協作伺服器、MCP、univer-workspace 用到哪些」，另外唯讀掃了同組織的 4 個伴隨 repo：`univer-workspace`@`852f1cb`、`univer-mcp`@`52bb1a2`、`univer-mcp-start-kit`@`0dbbaa5`、`univer-sdk-skills`@`60e9cbb`。也用 `git ls-remote` 試了 `dream-num/univer-pro`，GitHub 直接要求登入，代表 Pro 原始碼不是公開 repo。全程沒有安裝或執行任何程式碼。

## 重點結論（5–10 點）

1. **一句話分界**：GitHub 上的 Univer 是「單機就能用的網頁試算表核心」。開源版有條件式格式、資料驗證、篩選、排序、表格、公式、數值格式、附註／討論串註解、超連結、圖片、尋找與取代。**xlsx 匯入匯出、多人即時協作、編輯歷史、列印、圖表、樞紐分析表、走勢圖、大綱群組、形狀、伺服器端計算**則全部在閉源的 `@univerjs-pro/*`。官方 README 的對照表，和我用程式碼、依賴清單交叉比對的結果一致。
2. **開源部分的規模（我自己數的）**：`packages/` 有 60 個資料夾，其中 58 個有 `package.json`。另外 2 個（`slides`、`slides-ui`）只剩一句 README：「已搬到 `@univerjs-pro/...`」。`presets/` 有 15 個 preset，加上 1 個 `@univerjs/presets` 入口。這 74 個 `package.json` 全部是 Apache-2.0、版本 1.3.1。
3. **Pro 的實際形態是「混淆過的閉源程式＋授權金鑰＋免費額度」**：共用建置工具只要看到套件名稱以 `@univerjs-pro/` 開頭，就自動開啟 javascript-obfuscator 混淆。univer-workspace 的文件寫明，沒有授權時協作與匯出會降到免費額度：1 個協作節點、3 個編輯連線、每月 10 次匯出。換句話說，你拿到的 Pro 程式碼看不懂也改不了。
4. **套件名稱會騙人**：`@univerjs/preset-sheets-advanced`、`@univerjs/preset-sheets-collaboration` 雖然掛 `@univerjs/` 前綴，在開源 repo 裡卻找不到任何一處引用（0 筆），實際上是 Pro 那邊發佈的「進階」「協作」預設組合。要判斷某個套件是不是開源，得看它在不在這個 repo 裡，不能只看 npm 名稱。
5. **協作是「插座在開源、電器在 Pro」**：開源核心已經把協作需要的掛載點都做好了，包括 Command／Operation／Mutation 三層、`onMutationExecutedForCollab`、`fromCollab`／`onlyLocal`／`syncOnly` 旗標、大型變更的 `__splitChunk__`，以及 `@univerjs/protocol` 裡的 `IChangeset`、`ICollaMsg` 型別。真正「把 mutation 打包送出、做 OT 衝突轉換、配版本號、存進資料庫」的部分，則是 Pro 的 collaboration-client 和 collaboration-service／endpoint／transport-node／database-sqlite。
6. **只用開源也能做「陽春同步」**：`univerAPI.createSocket()` 的官方說明裡就附了範例：監聽 `CommandExecuted`，用 WebSocket 廣播 mutation，對方收到後以 `fromCollab: true` 執行。問題是沒有 OT，兩個人同時插入列又同時改值，畫面就可能不一致。比較適合「一人編輯、多人觀看」，或「每人負責不同工作表」的情境。
7. **AI／MCP 的部分**：主 repo 裡沒有任何 MCP 程式碼（我在 packages／presets／common／examples／tests 的 .ts/.tsx 搜尋 `mcp`，0 個檔案）。官方的 univer-mcp repo 只有 README 和 LICENSE 兩個檔案，MCP 伺服器其實是雲端的 `mcp.univer.ai`，要先申請 API key；瀏覽器端的橋接外掛 `@univerjs-pro/mcp`、`@univerjs-pro/sheets-mcp` 也是 Pro。開源版能借的有四樣：Node.js 無頭執行＋Facade API（可以自己寫 MCP 給 Claude 呼叫）、`action-recorder` 指令錄製 JSON、`RichTextBuilder` 的「agent-friendly」別名，以及 Apache-2.0 的 univer-sdk-skills（4 個 Skill，Claude Code 可以直接裝）。
8. **univer-workspace 不等於全開源**：這個 repo 本身是 Apache-2.0，但用腳本統計它所有 `package.json`，合計依賴 106 個不同的 `@univerjs-pro/*` 套件。內建的開發授權只認 localhost、127.0.0.1、app 三個網域，而且每 90 天輪換一次。拿它當「Pro 怎麼組裝」的參考實作很有價值，但不能當成可以免費自架上線的產品。
9. **給你的建議（個人使用、倉儲＋廣告）**：開源版拿來當「網頁版 Excel 編輯元件」綽綽有餘，存檔用 `fWorkbook.save()` 取得 JSON 存進 Firebase 就好。xlsx 用 SheetJS 自己轉換，圖表用浮動 DOM 掛 ECharts，協作先做「單人編輯＋鎖定」。真的需要 xlsx 高保真、列印、樞紐分析時，再去申請 Pro 試用。

## 逐題詳解（每個問題一節，附 permalink 與必要的短程式碼摘錄）

### Q1. xlsx、協作、列印、樞紐、圖表、條件式格式、資料驗證、篩選排序：哪些開源、哪些要 Pro 或伺服器？

#### 1-1 官方自己畫的線

README 的「Open Source and Pro」一節，Sheets 那一列寫得很直白：開源＝核心編輯、公式、數值格式、篩選／排序、資料驗證、條件式格式、附註、表格、超連結、評論、繪圖、尋找取代；Pro＝協作、編輯歷史、匯入匯出、列印、圖表、樞紐分析表、走勢圖、大綱、形狀、儲存格內圖形、資料連接器、範圍預處理、增強公式引擎。同一節也定下原則：開源套件要能獨立在 Apache-2.0 下使用，用公開 API 不需要 Pro。

- 邊界表與原則：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md?plain=1#L301-L323
- 「What You Can Build」表另外點名執行層：協作客戶端／伺服器、SSR、計算委派、伺服器端計算都是 Pro：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md?plain=1#L288-L299
- `DREAMNUM.md` 也重申本 repo「不擁有 Pro 的協作、匯入匯出、伺服器與企業功能」：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/DREAMNUM.md?plain=1#L15

#### 1-2 功能對照表（三種證據交叉比對）

證據有三種：①開源 repo 裡有沒有這個套件或 Facade 方法；②univer-workspace 實際依賴的 Pro 套件名稱（統計方法見 Q4）；③開源程式碼替 Pro 預留的掛載點。

| 功能 | 開源？ | 開源裡的證據 | Pro 套件（`@univerjs-pro/` 後的名稱） | 開源預留的掛載點 |
|---|---|---|---|---|
| xlsx 匯入匯出 | 否 | 只有 JSON 快照 `FWorkbook.save()`；剪貼簿能辨識從 Excel 貼過來的 HTML | `exchange-client`、`sheets-exchange-client`、`exchange-node` | 超連結的 `_xlsxHyperlinkTooltip` 欄位；權限對照表認得 `docs-exchange-client.operation.export-doc` |
| 多人即時協作 | 否（只有掛載點） | mutation 旗標、協定型別 | `collaboration`、`collaboration-client(-ui)` 等，共 18 個 | `onMutationExecutedForCollab` |
| 編輯歷史／版本 | 否 | 只有本機的 `LocalUndoRedoService`（復原／取消復原） | `edit-history(-ui)`、`sheets-history(-ui)` | — |
| 列印 | 否（只有掛鉤） | `SheetPrintInterceptorService`、`CanvasRenderMode.Printing` | `sheets-print` | 列印範圍、列印元件攔截點 |
| 圖表 | 否 | 繪圖層有 `ObjectType.CHART` 的外框設定；浮動 DOM | `engine-chart`、`chart-ui`、`sheets-chart(-ui)` | `addFloatDomToRange()` |
| 樞紐分析表 | 否 | 權限點 `WorksheetPivotTablePermission` | `sheets-pivot(-ui)` | `interceptRanges()` |
| 走勢圖／大綱群組／形狀 | 否 | — | `sheets-sparkline(-ui)`、`sheets-outline(-ui)`、`sheets-shape(-ui)` | — |
| 伺服器端計算、增強公式 | 否 | 開源有完整公式引擎＋Web Worker | `engine-formula`、`engine-formula-rust`、`range-preprocess` | 協定 `IComputeRequest` |
| 條件式格式（Excel 的「設定格式化的條件」） | 是 | `sheets-conditional-formatting(-ui)`；`FWorksheet.newConditionalFormattingRule()` | — | — |
| 資料驗證 | 是 | `data-validation`、`sheets-data-validation(-ui)`；`univerAPI.newDataValidation()` | — | — |
| 篩選 | 是 | `sheets-filter(-ui)`；`FRange.createFilter()` | — | 協作時可選擇要不要同步篩選 |
| 排序 | 是 | `sheets-sort(-ui)`；`FRange.sort()` | — | — |
| 表格、附註、討論串註解、超連結、尋找取代、數值格式 | 是 | 對應的 `sheets-*` 套件都在 | — | 協作時評論改走 Pro 的遠端資料來源 |
| 圖片（浮動／放進儲存格） | 是 | `sheet.command.insert-float-image`、`sheet.command.insert-cell-image` | — | — |
| 保護範圍／權限 | 一半 | 前端權限點是開源的，但預設的 `AuthzIoLocalService` 是 mock | 伺服器端權限在 Pro | `IAuthzIoService` 可替換 |
| Slides 簡報 | 否 | `packages/slides` 只剩「已搬家」的 README | `slides`、`slides-ui` | — |
| MCP 橋接 | 否 | — | `mcp`、`mcp-ui`、`sheets-mcp`（見 start kit） | — |

各列的 permalink：

- 條件式格式：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-conditional-formatting/src/facade/f-worksheet.ts#L78-L103
- 資料驗證：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-data-validation/src/facade/f-univer.ts#L76-L82 、https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-data-validation/src/facade/f-range.ts#L58-L118
- 篩選：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-filter/src/facade/f-range.ts#L48-L92
- 排序：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-sort/src/facade/f-range.ts#L48-L52
- 圖片：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/commands/commands/insert-image.command.ts#L27-L55
- 列印攔截點：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/print-interceptor.service.ts#L76-L113 ；列印繪製模式（註解寫「為了產生高 DPI 的 PDF」）：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/canvas.ts#L31-L36
- 圖表外框：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/services/sheet-chart-render-object.config.ts#L24-L31 、https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/services/canvas-float-dom-manager.service.ts#L1278-L1286
- 樞紐的掛載點（註解直接寫「目前主要給樞紐分析表用」）：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/sheet-interceptor/sheet-interceptor.service.ts#L282-L309 ；權限點：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/permission/permission-point/worksheet/pivot-table.ts#L21-L30
- 開源程式碼裡出現的 Pro 指令 ID（`docs.operation.print`、`docs-exchange-client.operation.export-doc`）：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/docs/src/controllers/doc-permission.controller.ts#L295-L304
- 從名稱看，應是 xlsx 匯入時留下的欄位：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-hyper-link/src/facade/f-range.ts#L209
- 權限 mock（註解：「不要在正式環境使用，這只是最小版本」）：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/authz-io/authz-io-local.service.ts#L52-L55
- Slides 搬家：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/slides/README.md?plain=1#L1-L3

補充：README 把「in-cell graphics（儲存格內圖形）」列為 Pro，具體指什麼**未確認**；不過「把圖片放進儲存格」這件事本身是開源的（上面的 `insert-cell-image`）。

#### 1-3 Pro 套件長什麼樣：混淆、授權、免費額度

- **混淆**：共用建置工具只看套件名稱前綴就決定要不要混淆：

```ts
// common/shared/tsdown/index.ts L55
const enableObfuscation = context.packageJson.name.startsWith('@univerjs-pro/');
```

https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/index.ts#L52-L55 ；混淆外掛本體：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/plugins/output-obfuscator.ts#L10-L41

- **同步方向**：每次 push 到 `dev`，就用 `repository-dispatch` 通知 `dream-num/univer-pro` 跟進。也就是說，Pro 是疊在開源版上面的另一個私有 repo：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/.github/workflows/dispatch-sync-univer-pro.yml#L1-L24
- **授權服務協定**：`ILicenseService` 除了 `GetLicense`，還有 `StartFormulaTask`／`ReleaseFormulaTask`，代表伺服器端公式計算有「名額」概念：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/protocol/src/ts/universer/v1/license.ts#L93-L105
- **免費額度**：univer-workspace 文件寫「沒有授權時兩個 SDK 都跑免費額度（一個協作節點、三個編輯連線、每月十次匯出）」：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/README.md?plain=1#L293-L298 。這是官方文件的說法，Pro 程式碼經過混淆，我沒辦法從程式碼驗證。
- **SDK 1.3 的變化**：伺服器端的協作與匯出都要 license 加 license key 才能解除額度限制。而且 exchange client「只提供 headless service 與 Facade，不再內建匯入／匯出選單、進度提示、匯出格式對話框」。所以就算買了 Pro，匯入匯出的按鈕 UI 也得自己做，workspace 就是自己重做了一套：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/docs/architecture.md?plain=1#L301-L306
- **試用**：start kit 的註解寫「要用不受限的商業功能，可以到 univer.ai/license 申請 30 天試用授權」：https://github.com/dream-num/univer-mcp-start-kit/blob/0dbbaa5dded316016b5f88738b61063075a4c5c8/src/setup-univer.ts#L84-L91
- **未確認**：npm 上 `@univerjs-pro/*` 的授權條款全文。我只能連 GitHub，讀不到 npm。

#### 1-4 `@univerjs/` 開頭不等於開源

univer-workspace 的 `apps/workspace/package.json` 依賴了 `@univerjs/preset-sheets-advanced` 和 `@univerjs/preset-sheets-collaboration`（https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/package.json#L159-L160），但我在開源 repo 全文搜尋這兩個名稱，0 筆。workspace 依賴的 `@univerjs/*` 一共 75 個，其中 66 個在開源 repo 裡。不在的 9 個是：2 個 Pro preset、6 個 workspace 自己的內部套件，以及 `@univerjs/icons`（放在另一個 repo `univer-icons`）。

### Q2. 協作機制：mutation 怎麼傳、協作伺服器在哪裡

#### 2-1 三層指令：只有 MUTATION 會上網

```ts
// packages/core/src/services/command/command.service.ts L37-L55（節錄）
export enum CommandType {
    COMMAND = 0,   // 業務意圖，例如「刪除列」，會產生多個 mutation
    OPERATION = 1, // 不存進快照的變更（捲動位置、側欄狀態），不做衝突處理
    MUTATION = 2,  // 存進快照的變更；原註解：要做協作時，它是衝突處理的最小單位
}
```

https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L37-L55

白話說：使用者按「刪除第 5 列」是一個 COMMAND，它會產生「刪列」「改公式參照」等幾個 MUTATION，再加上一組反向 MUTATION 拿來復原。協作時只需要把 MUTATION 傳給別人。

#### 2-2 開源核心預留的協作掛載點

- 執行旗標 `IExecutionOptions`：`onlyLocal`（只在本機套用、不同步）、`fromCollab`（來自其他協作者）、`fromChangeset`（載入快照時）、`syncOnly`（只送進 changeset、本機稍後才執行）：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L186-L199
- 專門給協作用的監聽器 `onMutationExecutedForCollab`。一般監聽器碰到 `syncOnly` 時不會被通知，協作監聽器會：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L253-L270 、https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L448-L459
- `__splitChunk__`：大量資料（複製工作表、貼上大範圍）會被切成多個 changeset 分批送，避免單次封包太大：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/command/command.service.ts#L107-L122 。實際用例是複製大工作表時先用 `syncOnly` 把全部 mutation 送進 changeset，本機則趁閒置時間慢慢套用：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/commands/commands/copy-worksheet.command.ts#L303-L316
- 公式結果用 `onlyLocal: true` 套用。也就是每台電腦自己算公式，網路上只傳「輸入的變更」，不傳計算結果：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/controllers/calculate-result-apply.controller.ts#L99-L107
- 「個人視角」可以選擇不同步：凍結窗格預設會同步，可以用 `univerAPI.setFreezeSync(false)` 關掉。關掉後，別人插入列時本機會自己修正凍結位置：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/controllers/freeze-sync.controller.ts#L28-L100 、https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-univer.ts#L148-L157 。篩選也有 `enableSyncSwitch`：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-filter/src/config/config.ts#L21-L28

#### 2-3 協定型別（`@univerjs/protocol` 是 Apache-2.0，描述的卻是 Pro 伺服器）

```ts
// packages/protocol/src/ts/univer/changeset.ts（節錄）
export interface IMutation { id: string; data: string }      // data＝序列化後的參數
export interface IChangeset {
    unitID: string; type: UniverType;
    baseRev: number; revision: number;                         // 基於哪個版本、變成哪個版本
    userID: string; mutations: IMutation[]; memberID: string;
    sid?: string; reqId?: number;                              // 同一編輯階段內遞增的請求序號
}
```

https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/protocol/src/ts/univer/changeset.ts#L19-L59

- 協作訊息 `ICollaMsg` 的事件種類有：加入、離開、新 changeset、確認（ack）、拒絕（rej）、要求重送、游標更新、Live Share、權限拒絕、評論更新、執行 uniscript 等：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/protocol/src/ts/univer/colla-msg.ts#L21-L56
- 伺服器端服務（型別裡用到 `@grpc/grpc-js` 的 `Metadata`，可以推論伺服器內部是 gRPC）：
  - 套用 changeset（含 `fastForward`）：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/protocol/src/ts/univerpro/v1/apply.ts#L88-L109
  - 伺服器端計算 `IComputeRequest`：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/protocol/src/ts/univerpro/v1/ssc.ts#L62-L81
  - 伺服器端渲染成 PNG：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/protocol/src/ts/univerpro/v1/ssr.ts#L20-L33
  - 快照服務（`SaveChangeset`、`GetUnitOnRev`、`ForkUnit`…）：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/protocol/src/ts/universer/v1/snapshot.ts#L379-L420

依照這些型別和 workspace 的用法，可以推出下面的流程。Pro 客戶端的內部細節是混淆過的，所以這是推論：

```
使用者操作 → COMMAND → 產生 MUTATION（本機先套用）
 → onMutationExecutedForCollab（Pro 協作客戶端在這裡收集）
 → 打包成 Changeset{baseRev, mutations:[{id, data}], memberID, sid, reqId}
 → 經 WebSocket 送到協作伺服器 → 伺服器做 OT、排序、配 revision、寫資料庫
 → 自己收到 csAckEvent；其他人收到 newCsEvent → 以 fromCollab:true 執行同一批 mutation
 → 游標另外用 updateCursorEvent 廣播
```

#### 2-4 開啟協作時，核心會拔掉三個本機服務

```ts
// presets/src/preset.ts L51-L55
if (collaboration) {
    override.push([IUndoRedoService, null]);   // 本機復原
    override.push([IAuthzIoService, null]);    // 本機權限 mock
    override.push([IMentionIOService, null]);  // 本機 @提及
}
```

https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/src/preset.ts#L37-L61 ；預設注入的本機服務清單：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/univer.ts#L272-L304

意思是開了協作以後，復原、權限、@提及都改由 Pro 的伺服器版本提供。如果只寫 `collaboration: true` 卻沒裝 Pro，照程式邏輯這三個服務會不存在，推論會出錯（**未實測**）。

#### 2-5 Pro 協作伺服器怎麼組（以 univer-workspace 為例）

- 伺服器用了這幾個類別：`UniverCollabEndpoint`、`UniverCommentEndpoint`、`UniverHistoryEndpoint`、`UniverCollabWorktreeEndpoint`、`createNodeTransport`，全部來自 `@univerjs-pro/collaboration-*`：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/server/src/integrations/univer/collaboration-gateway.ts#L1-L38 、https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/server/src/integrations/univer/collaboration-gateway.ts#L95-L105
- README 講得很明確：snapshot、revision、OT、即時協作、Worktree 協定都歸「Univer Collaboration SDK」（Pro）：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/README.md?plain=1#L191-L203 ；架構文件也寫「OT、房間建立和傳輸仍是 SDK 的責任」：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/docs/architecture.md?plain=1#L384
- 資料庫用 SQLite adapter（`collaboration-database-sqlite` 等），changeset 套用與快照產生放在 worker 執行緒池裡跑：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/docs/architecture.md?plain=1#L240-L243
- 前端的組法：開源 preset 全部用上，再疊兩個 Pro preset：

```ts
// apps/workspace/web/src/features/editor/units/sheet/sheet-presets.ts L145-L159（節錄）
UniverSheetsAdvancedPreset({ license: license ?? "", universerEndpoint, print: { enforceWatermark: true } }),
...(collaborationEnabled ? [UniverSheetsCollaborationPreset({ univerContainerId: container.id, universerEndpoint })] : []),
```

https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/units/sheet/sheet-presets.ts#L98-L161 （注意 `print.enforceWatermark: true`，列印會強制加浮水印。）

#### 2-6 只靠開源，能做到多少？

- 官方 doc string 裡就有 DIY 範例：

```ts
// packages/network/src/facade/f-univer.ts L69-L77（doc string 節錄）
univerAPI.addEvent(univerAPI.Event.CommandExecuted, ({ id, type, params, options }) => {
  if (type !== univerAPI.Enum.CommandType.MUTATION || options?.fromCollab || options?.onlyLocal || id === 'doc.mutation.rich-text-editing') return;
  ws.send(JSON.stringify({ command: { id, type, params }, options: { fromCollab: true } }));
});
// 收到後：univerAPI.executeCommand(id, params, options)
```

https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/network/src/facade/f-univer.ts#L31-L97

- 官方寫好的「單向複寫」範本：主執行緒把 mutation 同步到 Web Worker，並用 `fromSync` 防止來回打轉：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/rpc/src/controllers/data-sync/data-sync-primary.controller.ts#L164-L181 、https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/rpc/src/services/remote-instance/remote-instance.service.ts#L121-L129
- 文件（Docs）的 OT 是開源的：`JSONX.transform` 底層用 ot-json1，註解還提到 `TextXPro`：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/docs/data-model/json-x/json-x.ts#L71-L82 。**試算表 mutation 的轉換函式我在開源 repo 裡找不到**（搜尋 `transformMutation`、`operational transform`，0 筆）。
- 還缺這些：OT 衝突轉換、版本號與斷線補送、伺服器端存檔、游標顯示、伺服器端權限驗證。

### Q3. MCP／AI agent 整合

#### 3-1 主 repo 本身

- 沒有 MCP 程式碼（0 個檔案）。README 的 AI 段落也承認：即時編輯、共享版本、Worktree 都需要對應的 Web SDK 與協作能力，「套件與授權依功能而異」：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md?plain=1#L133-L141
- **無頭模式（不開瀏覽器）**：只要 3 個外掛（公式引擎、Sheets、Sheets 公式；篩選可選）加上 `FUniver.newAPI`，就能在 Node.js 讀寫儲存格、計算公式。這是讓 AI 操作試算表最乾淨的入口：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/tests/formula-integration/src/__testing__/univer.ts#L1-L42
- **指令錄製／重播**：只錄事先登記過的 COMMAND／OPERATION，不收 MUTATION（登記 MUTATION 會直接丟錯）。完成後下載成 `recorded-commands.json`，重播時可以用工作表「名稱」對應：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/action-recorder/src/services/action-recorder.service.ts#L56-L125 、https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/action-recorder/src/services/replay.service.ts#L63-L111
- **給 AI 用的 API 設計**：`RichTextBuilder` 提供 `bold`、`color` 等「Agent-friendly」別名，取代 `bl`、`cl` 這類縮寫：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/docs/data-model/rich-text-builder.ts#L113-L166

#### 3-2 univer-mcp：其實是雲端服務

- 整個 repo 只有 2 個檔案（README、MIT LICENSE），README 自己標註「早期開發」：https://github.com/dream-num/univer-mcp/blob/52bb1a2aa5f2341c59373a8a461b3738bca5dd00/README.md?plain=1#L10-L12
- 架構是：MCP host（Cursor、Claude Code…）→ Univer MCP Server → mcp-bridge（一個 Univer 外掛）→ 瀏覽器裡的 Univer：https://github.com/dream-num/univer-mcp/blob/52bb1a2aa5f2341c59373a8a461b3738bca5dd00/README.md?plain=1#L38-L47
- 要先去 console.univer.ai 申請 API key，連線網址是 `https://mcp.univer.ai/mcp/`；README 也附了 Claude Code 的 `claude mcp add ...` 指令：https://github.com/dream-num/univer-mcp/blob/52bb1a2aa5f2341c59373a8a461b3738bca5dd00/README.md?plain=1#L51-L99 。也就是說，試算表內容會經過官方雲端。

#### 3-3 univer-mcp-start-kit：橋接外掛是 Pro，版本也舊了

依賴 `@univerjs-pro/mcp`、`@univerjs-pro/mcp-ui`、`@univerjs-pro/sheets-mcp`，版本是 0.10.8，現在的開源版已經到 1.3.1。它還依賴 `@univerjs/sheets-zen-editor`，這個套件在現行開源 repo 裡已經沒有了：https://github.com/dream-num/univer-mcp-start-kit/blob/0dbbaa5dded316016b5f88738b61063075a4c5c8/package.json#L14-L21 、https://github.com/dream-num/univer-mcp-start-kit/blob/0dbbaa5dded316016b5f88738b61063075a4c5c8/src/setup-univer.ts#L103-L111 。在 1.3.1 上還能不能用：**未確認**。

#### 3-4 給 Claude 用的兩套官方工具

- **univer-workspace CLI（`uvw`）＋ Skill**：README 寫「搭配 Claude、Codex、Kimi Work 等既有 agent」使用：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/README.md?plain=1#L148-L155 。能力包括 Facade 編輯、PNG/PDF 渲染、Office 匯入匯出、Worktree 審閱：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/README.md?plain=1#L45-L58 。但它依賴 59 個 Pro 套件，匯入匯出還要 `UNIVER_LICENSE_KEY`：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/cli/README.md?plain=1#L129-L132
- **univer-sdk-skills**（Apache-2.0，共 44 個檔案）：裡面有 4 個 Skill：`univer-integrate`、`univer-pro-integrate`、`univer-node-backend`、`univer-plugin-dev`，可以讓 Claude Code 寫 Univer 程式時少走彎路：https://github.com/dream-num/univer-sdk-skills/blob/60e9cbbdbbde9594ad61bad58ad9fbb4d5e17112/README.md?plain=1#L5-L32 。我只讀了 README 和檔名，Skill 內容沒有逐一驗證。

#### 3-5 只用開源接 Claude 的路線（建議）

```
Claude（Claude Code／Claude Desktop）
  ⇄ 你自己寫的小型 MCP 伺服器（Node.js）
      └ new Univer() + 公式／Sheets 外掛（無 UI，參考 tests/formula-integration）
      └ 工具：read_range、write_range、add_filter、add_cf_rule、save_snapshot
  ⇄ Firebase（存 IWorkbookData JSON）
瀏覽器端：同一份 JSON 用 UniverSheetsCorePreset 顯示給人看
```

難度中等，全部 Apache-2.0。對 Claude 來說，讀寫範圍、加篩選、加條件式格式都是開源的 Facade 方法，資料也不會經過第三方雲端。

### Q4. univer-workspace 用到哪些？

**統計方法**：用 Python 讀取 workspace 裡全部 15 個 `package.json`，把 dependencies、devDependencies、peer、optional 取聯集後分類。

- **Pro 套件：106 個（不重複）**。依名稱分類：協作 18、編輯歷史 12、文件進階（callout／code／column／latex／list／quote／table）14、圖表 11、Boards 8、形狀 7、Slides 6、匯入匯出 6、列印 4、Bases 4、公式／計算 3、樞紐 2、走勢圖 2、大綱 2、嵌入 2、手寫 ink 2、license 1、其他 2。各子專案：`apps/workspace` 99 個、DSH 外掛 77 個、`apps/cli` 59 個。Pro 依賴區段：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/package.json#L38-L136
- **開源套件**：開源 repo 的 74 個套件中，用了 66 個。沒用到的 8 個是 `action-recorder`、`docs-toc(-ui)`、`rpc-node`、`telemetry`、`ui-adapter-vue3`、`ui-adapter-web-component`、`watermark`。
- **授權**：瀏覽器、伺服器、CLI、DSH 外掛等 5 處各放一份開發授權：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/scripts/update-univer-license.mjs#L9-L44 。檔頭寫明授權網域只有 localhost、app、127.0.0.1，到期日 2027-02-03（我沒有複製授權字串本身）：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/web/src/features/editor/features/license.ts#L1-L6 。伺服器端讀取 `UNIVER_LICENSE` 和 `UNIVER_LICENSE_KEY` 時必須成對設定：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/server/src/integrations/univer/univer-license.ts#L3-L31 ；README 授權段落：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/README.md?plain=1#L283-L295
- **結論**：workspace 是很好的 Pro 組裝教材，前端 preset、伺服器 gateway、SQLite 資料庫、license 處理都看得到。但部署到自己的網域就需要正式授權，否則只有免費額度。

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. `README.md` L288–L323：先看官方的邊界表。
2. `examples/src/sheets/mount.ts` L73–L100：開源版「全功能」就是這 11 個 preset。`pnpm dev` 開出來的工作台，就是開源版能做的全部：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/examples/src/sheets/mount.ts#L73-L100
3. `presets/packages/preset-sheets-core/src/preset.ts` L84–L168：核心外掛清單和註冊順序：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/presets/packages/preset-sheets-core/src/preset.ts#L84-L168
4. `presets/src/preset.ts`：`createUniver` 怎麼合併 preset、`collaboration` 開關拔掉哪些服務。
5. `packages/core/src/services/command/command.service.ts`：三層指令、執行旗標、兩種監聽器。
6. `packages/core/src/univer.ts` L272–L304：哪些服務是「本機預設、可被替換」。
7. `packages/sheets/src/controllers/freeze-sync.controller.ts`、`calculate-result-apply.controller.ts`：看「考慮到協作」的程式實際怎麼寫。
8. `packages/protocol/src/ts/univer/changeset.ts` → `colla-msg.ts` → `univerpro/v1/*.ts` → `universer/v1/snapshot.ts`：協定由淺到深。
9. `packages/network/src/facade/f-univer.ts`：DIY WebSocket 同步範例。
10. `packages/rpc/src/controllers/data-sync/` 與 `services/remote-instance/`：mutation 複寫範本。
11. `packages/core/src/facade/f-base.ts` L26–L45：Facade 的 mixin 機制，開源套件用 `FUniver.extend()` 把方法掛到 `univerAPI` 上。Pro 應該也是同一套機制（推測）：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/facade/f-base.ts#L26-L45
12. `tests/formula-integration/src/__testing__/univer.ts`：無頭模式的最小組合。
13. univer-workspace：`sheet-presets.ts` → `collaboration-gateway.ts` → `apps/workspace/docs/architecture.md`，看 Pro 怎麼組起來。

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 借什麼 | 授權 | 依賴 | 難度 | 怎麼接到你的專案 |
|---|---|---|---|---|
| 開源試算表編輯器（preset 組合） | Apache-2.0 | `@univerjs/presets` 加各 preset；UI 用 React 18/19（Univer 自帶）；preset 只輸出 ESM/CJS、沒有 UMD，需要 Vite 之類的打包工具 | 低 | 用 Vite 打包成一支 JS，放進你的純 JS 倉儲頁面；`createUniver` 掛到 `<div id="app">`；存檔用 `fWorkbook.save()` 寫進 Firestore |
| 快照格式 `IWorkbookData` | Apache-2.0 | 無 | 低 | 外掛資料（條件式格式、資料驗證）放在 `resources` 欄位，整包存起來就能保留 |
| xlsx 進出（自己做） | 看 SheetJS 授權 | SheetJS | 中 | 讀 xlsx → 轉成 `cellData`／`styles` → `createWorkbook`，匯出則反過來；或直接從 Excel 複製、Ctrl+V 貼上 |
| 圖表（自己做） | — | ECharts／Chart.js | 中 | `univerAPI.registerComponent()` 加上 `fWorksheet.addFloatDomToRange()`；資料用 `getRange().getValues()` 讀，監聽 `CommandExecuted` 更新 |
| 陽春協作 | Apache-2.0 | WebSocket 或 Firestore | 中高 | 照 network facade 範例做；Firestore 版就是每個 mutation 寫一筆文件（附 clientId、序號），其他人 `onSnapshot` 後以 `fromCollab: true` 執行。一定要加編輯鎖 |
| 指令／mutation／復原架構 | Apache-2.0 | `@univerjs/core` | 中 | 你自己的倉儲 app 可以照抄「Command 產生 Mutation，加一組反向 Mutation 當復原」的模式，順便做成操作稽核紀錄 |
| 協定型別 | Apache-2.0 | 無 | 低 | 設計自己的同步格式時，參考 `IChangeset` 的 `baseRev`／`revision`／`mutations` |
| 無頭 Univer＋Claude MCP | Apache-2.0 | Node ≥ 18.17 | 中 | 見 Q3-5 |
| 指令錄製重播 | Apache-2.0 | `@univerjs/ui` | 低 | 錄下 COMMAND JSON 當「巨集」，也可以讓 Claude 產生同格式的 JSON 交給 `replayCommands()` 執行 |
| univer-sdk-skills | Apache-2.0 | Claude Code | 低 | `npx skills add dream-num/univer-sdk-skills --skill univer-integrate` |

最小整合草稿：依 README 的 Preset Mode 範例（https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md?plain=1#L227-L264 ）改寫成繁中介面加 Firebase 存檔。**我沒有實際執行過**。33 個有語系資料夾的套件都附 `zh-TW.ts`，preset 的 `locales/*` 則是建置時才產生：

```js
import { createUniver, LocaleType, mergeLocales } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import zhTW from '@univerjs/preset-sheets-core/locales/zh-TW'
import '@univerjs/preset-sheets-core/lib/index.css'

const { univerAPI } = createUniver({
  locale: LocaleType.ZH_TW,
  locales: { [LocaleType.ZH_TW]: mergeLocales(zhTW) },
  presets: [UniverSheetsCorePreset({ container: 'app' })],
})
const wb = univerAPI.createWorkbook(savedSnapshot ?? {})   // 從 Firestore 讀回的 IWorkbookData
// 存檔：JSON.stringify(wb.save()) 寫進 Firestore；單一文件上限 1 MiB，大檔改放 Cloud Storage
```

對應位置：preset 不輸出 UMD（https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/preset-build/index.ts#L107-L120 ），個別套件才有 UMD（https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/common/shared/tsdown/index.ts#L72-L86 ）；存檔 `save()`：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/facade/f-workbook.ts#L171-L185 ；快照型別：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/typedef.ts#L29-L89 ；`resources`：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/services/resource-manager/type.ts#L22-L46 ；Excel 貼上辨識：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/utils.ts#L97-L112 （Windows 用右鍵選單貼上時會跳提示建議改用快速鍵，但仍會盡量貼上：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/clipboard.service.ts#L425-L438 ）；浮動 DOM：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/facade/f-worksheet.ts#L185-L240 ；事件裡帶 `options`：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/facade/f-event.ts#L81-L90 ；Skill 安裝指令：https://github.com/dream-num/univer-sdk-skills/blob/60e9cbbdbbde9594ad61bad58ad9fbb4d5e17112/README.md?plain=1#L61-L76

## 坑與限制

- **名稱陷阱**：`@univerjs/preset-sheets-advanced`／`-collaboration` 不是開源的。照網路教學 `npm install` 下去，你的專案就已經混進了需要授權的 Pro 程式。
- **Pro 看不到、改不了**：混淆過的程式碼出了 bug 只能等官方修。免費額度（1 節點、3 連線、每月 10 次匯出）是 workspace 文件的說法，正式條款**未確認**。
- **workspace 的內建授權只能在本機用**：只認 localhost／127.0.0.1／app，每 90 天輪換；網域不在名單上，協作端點會回 403（code 9018）：https://github.com/dream-num/univer-workspace/blob/852f1cbe3ed6e0e90fef782924c4e519abd8ddf0/apps/workspace/README.md?plain=1#L286-L291
- **`collaboration: true` 不能單獨開**：它只會拔掉本機服務，不會幫你接上任何伺服器。
- **權限只是前端裝飾**：開源預設的 `AuthzIoLocalService` 是 mock，保護範圍只擋得住一般操作，擋不住懂技術的人。你的 Firebase 一定要用 Security Rules 把關。
- **試算表沒有開源 OT**：Docs 有 ot-json1，Sheets 沒有。DIY 同步時，兩人同時插入或刪除列，資料可能錯位。
- **列印只有掛鉤**：開源版沒有列印按鈕和分頁設定。替代方案：自己把範圍轉成 HTML 表格再交給瀏覽器列印（效果**未確認**），或買 Pro。
- **Pro 1.3 的匯入匯出沒有 UI**：買了也要自己做按鈕和進度提示（見 1-3）。
- **版本要對齊**：所有 `@univerjs/*` 必須同一版本，`@univerjs-pro/*` 也要跟著對齊：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md?plain=1#L276
- **MCP 的限制**：官方 MCP 走雲端、要 API key、標示為早期開發；start kit 停在 0.10.8，用到的 `sheets-zen-editor` 在現行開源 repo 已不存在。
- **CHANGELOG 沒跟上**：`CHANGELOG.md` 最新一筆是 1.0.0-beta.2（2026-08-22），套件卻已經是 1.3.1。之後的變更要去 GitHub Releases 看（**未確認**那裡有完整紀錄）。
- **執行環境**：開發本 monorepo 要 Node ≥ 22.18、pnpm ≥ 11；無頭模式要 Node ≥ 18.17；瀏覽器需要 `Intl.Segmenter`，舊瀏覽器要加 polyfill：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/README.md?plain=1#L280-L286
- **遙測**：開源版只有 `ITelemetryService` 介面，而且是 `@Optional` 注入，沒有實作就什麼都不送：https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/telemetry/src/services/telemetry.service.ts#L19-L22 。Pro 會不會回傳資料：**未確認**。
