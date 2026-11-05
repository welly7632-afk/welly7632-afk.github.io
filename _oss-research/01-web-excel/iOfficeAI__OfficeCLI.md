# iOfficeAI/OfficeCLI — 給 AI agent 用的「命令列版 Office」：讀寫 .xlsx／.docx／.pptx、內建公式引擎與 HTML 預覽
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：c56512c
> GitHub：https://github.com/iOfficeAI/OfficeCLI｜⭐ 33035｜授權：Apache-2.0｜主要語言：C#｜最近更新：2026-10-30

> 本資料包的程式碼位置都指向 commit `c56512c8c7b76fe284f09940e4cd492470099d3e`。永久連結前綴：
> `https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/`
> 以下若只寫 `src/...`，請自行加上這個前綴；重點段落有附完整 permalink。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：OfficeCLI 是一支用 C#（.NET 10）寫的單一執行檔命令列工具，讓 Claude 這類 AI agent 用 `officecli add/set/get/query/view` 這些指令直接建立、讀取、修改真正的 Excel（.xlsx）、Word、PowerPoint 檔案。它**不是**可以嵌進網頁讓人編輯的試算表元件，而是「後端／本機的試算表引擎＋渲染器」。

**先講清楚定位**（因為你最在意網頁版 Excel）：
- 它的「網頁」部分只有兩種：`officecli view x.xlsx html` 產生一個**靜態 HTML 預覽檔**；`officecli watch x.xlsx` 開一個**本機 localhost 預覽伺服器**，雙擊儲存格可以改值（很陽春，沒有複製貼上、沒有復原）。
- 真正強的是：**內建 Excel 公式引擎（我自己數到 461 個函數名稱）**、**樞紐分析表**、**圖表**、**條件格式**、**範本套版 `merge`**、**MCP Server 可直接接 Claude Code**。

**對你（台灣小老闆、自建倉儲 App、跑廣告）具體能做的事**：
1. **讓 Claude 自動產出 Excel 報表**：庫存月報、廣告成效表、進銷存彙總。你跟 Claude Code 說「把這份 CSV 做成有樞紐分析和圖表的 Excel」，Claude 透過 OfficeCLI 的 MCP 工具直接產出 .xlsx，公式會即時算好值。
2. **報價單／成本試算範本**：先做一份含 `{{客戶}}`、`{{品項}}` 的 Excel 範本，之後用 `officecli merge 範本.xlsx 輸出.xlsx --data data.json` 一次產生 N 份報價單或出貨單，不用每次花 token 重新排版。
3. **把倉儲 App 的資料匯出成「真的」Excel**：Firebase 匯出 CSV → `officecli import` 進 .xlsx → 加格式、凍結窗格、篩選、圖表 → 給會計或廠商。
4. **讀取廠商報價 Excel 做比價**：`officecli query 報價.xlsx "row[單價>100]" --json` 用類 CSS 選擇器撈列，轉成 JSON 再進你的系統。
5. **廣告簡報**：PowerPoint 部分可以讓 Claude 做商品提案／廣告企劃簡報（但它**不做影片**，跟 AI 影片生成無關）。
6. **拆零件**：公式引擎（C#）的「函數清單與實作」可以當作你自己做 JS 試算表時的對照表；HTML 預覽的 `<table>` 渲染方式（凍結窗格用 `position:sticky`）也值得參考。

---

## 2. 授權白話

- **主程式授權：Apache-2.0**（[LICENSE](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/LICENSE)，原始檔表頭 `SPDX-License-Identifier: Apache-2.0`）。
- **NOTICE 檔要保留**：[NOTICE](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/NOTICE) 明寫「再散布（無論是否修改）必須保留這份 notice」。
- **第三方元件**（[THIRD-PARTY-NOTICES.txt](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/THIRD-PARTY-NOTICES.txt)）：DocumentFormat.OpenXml 3.4.1（MIT）、System.CommandLine（MIT）、.NET Runtime（MIT），都很寬鬆。

**個人使用**：完全沒問題，免費、可改、可自己編譯。

**公司商用**：可以。Apache-2.0 允許商用、修改、閉源整合；要做的事：①散布時附上 LICENSE 與 NOTICE；②改過的檔案要標註有修改；③不能用 OfficeCLI 的商標名義宣傳。Apache-2.0 還附帶專利授權條款（如果你告別人專利侵權，授權會終止）。

**有沒有閉源／私有版才有的功能？——有跡象，要注意：**
- Excel HTML 預覽的**虛擬捲動（大量列時只渲染看得到的部分）**是在一個**沒有公開的私有檔案**實作。原始碼註解直接寫「Private ExcelHandler.HtmlPreview.Virt.cs implements OnRenderTbody…When no private implementation exists… the default static rendering runs」，見 [`ExcelHandler.HtmlPreview.cs#L774-L788`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs#L774-L788) 與 [`#L1097-L1108`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs#L1097-L1108)（還提到一支沒公開的 `watch-overlay-virt.js`）。Word 預覽也有類似的 `partial void` 掛鉤。
- 外掛協定文件明說外掛可以是「Proprietary implementations that need to stay out of the Apache-licensed main repo」、「Can a plugin be closed-source / commercial? Yes」，還有 `tier: basic/pro/enterprise`、`license_expired` 錯誤碼（[`plugins/plugin-protocol.md#L1-L25`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/plugins/plugin-protocol.md#L1-L25)）。例如 PDF 匯出、.doc／.hwpx 讀取都走外掛。
- **是否收費：未確認**。程式碼裡看不到價格或付費機制，只看到「私有實作」與「商業外掛」的預留位置。GitHub Releases 的官方執行檔是否含私有虛擬捲動：**未確認**（公開的 `.github/workflows/build.yml` 是用公開原始碼編譯）。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言／框架 | C#、.NET 10（`net10.0`），`PublishSingleFile + SelfContained + PublishTrimmed`，見 [`officecli.csproj#L1-L25`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/officecli.csproj#L1-L25) |
| 依賴套件 | 只有兩個 NuGet：`DocumentFormat.OpenXml 3.4.1`（微軟官方 OOXML SDK，負責 .xlsx 讀寫）、`System.CommandLine`（CLI 解析） |
| 前端 | 沒有前端框架。HTML 預覽是 C# 用 `StringBuilder` 拼出來的 HTML＋內嵌 `preview.js`／`preview.css`／`watch-overlay.js`／`watch-sse-core.js`（`src/officecli/Resources/`） |
| 後端 | 本身就是 CLI；另有三種常駐模式：① resident（named pipe 常駐，降延遲）② `watch`（本機 HTTP＋SSE 預覽伺服器，只綁 `IPAddress.Loopback`）③ `mcp`（stdio JSON-RPC 的 MCP Server） |
| 資料庫 | 無。資料就是 .xlsx 檔本身；設定檔在 `~/.officecli/config.json` |
| 部署 | 下載單一執行檔（mac arm64/x64、Linux x64/arm64/Alpine、Windows x64/arm64），或 `npm install -g @officecli/officecli`、`brew`、`scoop`。也有 Node／Python 薄 SDK（`sdk/node`、`sdk/python`） |
| 硬體／GPU | 不需要 GPU。一般筆電即可 |
| 截圖（PNG） | 需要系統上有 Chrome／Edge／Chromium（或 Playwright CLI、Firefox）——它是「呼叫外部瀏覽器 headless 截圖」，沒有內嵌瀏覽器，見 [`Core/HtmlScreenshot.cs#L9-L13`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/HtmlScreenshot.cs#L9-L13) |
| API Key／費用 | **OfficeCLI 本身不需要任何 API Key、不呼叫任何 LLM**，0 元。費用只來自你用的 AI（例如 Claude Code 訂閱或 Claude API 用量） |
| 網路存取 | 每日背景檢查更新（`d.officecli.ai`，退回 GitHub）；數學公式／3D／Mermaid 預覽會從 `d.officecli.ai` 或 `cdn.jsdelivr.net` 抓 KaTeX、three.js、mermaid（`Core/KatexAssets.cs`、`Core/ThreeAssets.cs`、`Core/Diagram/MermaidImageRenderer.cs`） |
| 自己編譯 | 需 .NET 10 SDK，`./build.sh`（本次掃描**沒有執行**任何建置） |

**放到你的 Firebase 架構**：Firebase Hosting 只放靜態檔，跑不了這支執行檔。要在雲端用，得放到 **Cloud Run（Linux x64 容器）** 或 Cloud Functions 第二代（自帶執行檔）；最簡單是**在你自己電腦上搭配 Claude Code 用**。執行檔大小：**未確認**（沒有下載 release）。

---

## 4. 程式架構地圖

規模（自己數的）：`src/officecli` 底下 369 個 `.cs` 檔、約 28.3 萬行（`find -name '*.cs' | xargs cat | wc -l`）；其中 Excel 相關（`Handlers/ExcelHandler.cs` + `Handlers/Excel/`）49+1 個檔、約 4.0 萬行；公式引擎（`Core/Formula/` 扣掉 LaTeX 用的 `FormulaParser.cs`）約 8,048 行。**公開 repo 裡沒有任何測試檔**（檔名清單 grep `test` 為 0）。

```
OfficeCLI/
├── README.md / README_zh.md …        # 說明（英／簡中／日／韓）
├── SKILL.md                          # 給 AI agent 讀的總技能檔（與 skills/officecli/SKILL.md 同內容規模 417 行）
├── LICENSE / NOTICE / THIRD-PARTY-NOTICES.txt
├── build.sh / install.sh / install.ps1
├── plugins/plugin-protocol.md        # 外掛協定（dump-reader / exporter / format-handler，可閉源）
├── schemas/help/{xlsx,docx,pptx}/    # 每種元素的屬性 schema（JSON），內嵌進執行檔供 `officecli help` 使用；xlsx 有 41 個檔
├── skills/                           # 給 Claude Code 等 agent 的 Skill 檔
│   ├── officecli-xlsx/SKILL.md       # ★ Excel 寫作規範（497 行）
│   ├── officecli-data-dashboard/     # ★ CSV → 儀表板 Excel
│   ├── officecli-financial-model/    # ★ 財務模型（DCF、損益、敏感度）
│   ├── officecli-docx / -pptx / -pitch-deck / -academic-paper / -word-form
│   └── morph-ppt / morph-ppt-3d      # PPT 動畫風格範本
├── sdk/node/  sdk/python/            # 薄 SDK：透過 named pipe 跟常駐程序溝通
├── npm/                              # npm 包裝：下載對應平台的原生執行檔
├── examples/                         # 範例腳本與輸出檔（本次未 checkout 二進位檔）
└── src/officecli/
    ├── Program.cs                    # 進入點
    ├── CommandBuilder.*.cs           # 每個 CLI 指令一個檔（Add/Set/GetQuery/View/Batch/Import/Dump/Watch/Mark…）
    ├── McpServer.cs                  # ★ MCP Server（stdio JSON-RPC，只暴露一個工具 "officecli"）
    ├── McpInstaller.cs               # ★ `officecli mcp claude` 自動註冊到 Claude Code
    ├── ResidentServer.cs / ResidentClient.cs   # 常駐模式（named pipe）
    ├── Handlers/
    │   ├── ExcelHandler.cs           # ★ Excel 處理器主體（開檔、快取、存檔）
    │   ├── Excel/                    # ★ 49 個 partial 檔：Add.* / Set.* / Query.* / Remove / HtmlPreview.* / Import / Slicer / DumpSupport / FormulaCache …
    │   ├── Word/  Pptx/              # Word、PPT 處理器
    │   └── Rendering/                # 渲染器介面
    ├── Core/
    │   ├── Formula/                  # ★ Excel 公式引擎（FormulaEvaluator.*.cs）；FormulaParser.cs 其實是 LaTeX↔OMML 數學式轉換
    │   ├── Chart/                    # 圖表建立與 SVG 渲染（ChartSvgRenderer）
    │   ├── PivotTableHelper.*.cs     # ★ 樞紐分析表（7 個檔）
    │   ├── Watch/                    # ★ watch 預覽伺服器（WatchServer.cs 3,054 行）
    │   ├── Plugins/                  # 外掛載入與程序管理
    │   ├── TemplateMerger.cs         # ★ {{key}} 範本套版
    │   ├── FormulaRefShifter.cs      # 插入/刪除列欄時改寫公式參照
    │   ├── HtmlScreenshot.cs         # 呼叫外部 Chrome 截圖
    │   ├── UpdateChecker.cs          # 自動更新
    │   ├── SsrfGuard.cs / DocumentLimits.cs / WorksheetBloatFilter.cs  # 安全與防爆
    │   └── LocaleFontRegistry.cs     # 各語系預設字型（zh-TW → 新細明體）
    └── Resources/                    # preview.js/css、watch-overlay.js、watch-sse-core.js、圖表樣式 XML
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 開啟／存檔 .xlsx | [`Handlers/ExcelHandler.cs#L12-L50`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/ExcelHandler.cs#L12-L50) | 用 OpenXML SDK 的 `SpreadsheetDocument` 直接操作 XML DOM；有「列索引快取」與「共用字串索引快取」，註解記錄 4 萬列從 21.5 秒降到 0.8 秒（issue #435）。沒修改就不重寫檔（保持位元組不變） |
| 巨量空儲存格防爆 | [`Core/WorksheetBloatFilter.cs#L10-L17`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/WorksheetBloatFilter.cs#L10-L17) | 開檔時濾掉數百萬個無值無樣式的 `<c>`，避免 11MB 檔吃掉數 GB 記憶體 |
| `add` 支援的元素 | [`ExcelHandler.Add.cs#L65-L162`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Add.cs#L65-L162) | 一個大 `switch`：sheet、row、cell、namedrange、comment、validation、autofilter、cf／databar／colorscale／iconset、ole、picture、shape、table、chart、series、pivottable、slicer、col、pagebreak、sparkline… |
| 公式引擎入口 | [`FormulaEvaluator.cs#L322-L340`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/FormulaEvaluator.cs#L322-L340) | `TryEvaluateFull(formula)`：先去掉 `_xlfn.` 前綴再算 |
| 公式解析 | [`FormulaEvaluator.cs#L690-L1072`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/FormulaEvaluator.cs#L690-L1072) | 手寫**遞迴下降解析器**，邊解析邊求值（沒有獨立 AST）：比較→串接→加減→乘除→次方→一元→函數呼叫；`LET`／`LAMBDA` 特別處理 |
| 函數分派 | [`FormulaEvaluator.Functions.cs#L11-L456`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/FormulaEvaluator.Functions.cs#L11-L456) | 一個 C# `switch` 運算式把函數名稱對到實作；先做錯誤傳遞與「純量函數自動對陣列展開（spill）」 |
| 跨工作表與快取 | [`FormulaEvaluator.cs#L194-L233`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/FormulaEvaluator.cs#L194-L233) | `FormulaEvalSession`：跨表子評估器、儲存格結果 memo、循環參照 memo、範圍 memo |
| 重算策略 | [`ExcelHandler.FormulaCache.cs#L12-L43`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.FormulaCache.cs#L12-L43) | **重要**：註解明說「NO cross-cell dependency graph」——公式只在寫入該儲存格時算一次；存檔時掃描，若自己算的值與快取不同就清掉快取並設 `fullCalcOnLoad`，讓 Excel 開檔重算 |
| 插列刪列改寫公式 | [`Core/FormulaRefShifter.cs#L9-L20`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/FormulaRefShifter.cs#L9-L20) | 插入就 +1、刪除就 −1，刪到的參照變 `#REF!` |
| 數字格式 | [`ExcelHandler.HtmlPreview.cs#L3270-L3279`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs#L3270-L3279)、[`ExcelDataFormatter.cs#L10-L40`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelDataFormatter.cs#L10-L40) | 自己實作 Excel 格式碼（`#,##0`、日期、百分比、分數）；`TEXT()` 函數也共用這套 |
| HTML 預覽 | [`ExcelHandler.HtmlPreview.cs#L146-L154`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs#L146-L154) | `ViewAsHtml()` 產生自帶資源的單一 HTML：多工作表分頁、格式、合併、欄寬列高、凍結窗格、條件格式、資料橫條、圖示集、走勢圖、圖表 SVG、樞紐表 |
| 凍結窗格（預覽） | [`ExcelHandler.HtmlPreview.cs#L617-L654`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs#L617-L654) | 用 `<table>` + CSS `position:sticky` 計算累積 left/top 偏移 |
| 凍結／合併（寫入） | [`ExcelHandler.Set.Sheet.cs#L277-L352`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Set.Sheet.cs#L277-L352) | `freeze=B2` 寫 `<pane>`；`merge=A1:D1,B3:B5` 拆成多個 `<mergeCell>` |
| 排序 | [`ExcelHandler.Set.Ranges.cs#L53`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Set.Ranges.cs#L53) | `set … --prop sort=…` 真的重排資料（多鍵），受保護工作表會拒絕 |
| CSV 匯入 | [`ExcelHandler.Import.cs#L13-L26`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Import.cs#L13-L26) | CSV／TSV、可指定分隔字元、小數點符號、起始儲存格；`--header` 自動加篩選＋凍結首列 |
| 樞紐分析表 | [`Core/PivotTableHelper.cs#L10-L14`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/PivotTableHelper.cs#L10-L14) | 真的寫出 OOXML PivotCache＋PivotTable，Excel 開檔就有彙總結果 |
| 圖表 SVG | [`Core/Chart/ChartSvgRenderer.cs#L11-L17`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Chart/ChartSvgRenderer.cs#L11-L17) | 圖表在預覽裡用自寫的 SVG 畫（含直方圖、漏斗、樹狀圖、旭日、箱型圖） |
| 範本套版 | [`Core/TemplateMerger.cs#L15-L18`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/TemplateMerger.cs#L15-L18) | 替換 `{{key}}`，三種格式都支援 |
| 批次＋原子回滾 | [`Core/BatchExecutor.cs#L8-L15`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/BatchExecutor.cs#L8-L15)、[`Core/ElementRollback.cs#L8-L15`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/ElementRollback.cs#L8-L15) | `batch` 預設全有或全無：任一筆失敗整批回滾 |
| 常駐寫回策略 | [`Core/ResidentFlushPolicy.cs#L5-L12`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/ResidentFlushPolicy.cs#L5-L12) | `OFFICECLI_RESIDENT_FLUSH=each/auto/…`；預設閒置 2–10 秒才寫檔，**別的程式讀檔前要先 `officecli save`** |
| 即時預覽＋雙擊編輯 | [`Core/Watch/WatchServer.cs#L137`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Watch/WatchServer.cs#L137)、[`Resources/watch-overlay.js#L700-L760`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Resources/watch-overlay.js#L700-L760) | 綁 loopback 的 TCP 伺服器＋SSE 推送；雙擊 `<td data-path>` 跳出 `<input>`，Enter 後 `POST /api/send`，伺服器再**另開子程序**執行 `officecli set` |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| **整支 CLI 當「Excel 產生器」** | [README.md](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/README.md) | 單一執行檔 | 低 | 不拆，直接呼叫。Node 用 `child_process` 或 `@officecli/sdk`；Claude Code 用 MCP。最實際的用法 |
| **MCP Server（單一工具設計）** | [`McpServer.cs#L215-L225`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/McpServer.cs#L215-L225)、[`#L565-L604`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/McpServer.cs#L565-L604) | 無（手寫 JSON-RPC） | 低（參考設計） | 「整個 CLI 包成一個 MCP 工具、參數只有 `command` 字串」的作法，很適合你把自己的倉儲 App API 也包成給 Claude 用的 MCP |
| **Excel 公式引擎** | [`Core/Formula/`](https://github.com/iOfficeAI/OfficeCLI/tree/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula) | C#、OpenXML SDK 的 `SheetData` | 高 | 綁 OpenXML 的 `Cell`／`SheetData`；要在瀏覽器用得改寫成 JS（或用 Blazor/WASM，未驗證）。比較實際的是**當函數清單與邊界情況的參考**，JS 端直接用 HyperFormula 之類 |
| **數字格式引擎** | [`ExcelHandler.HtmlPreview.cs#L3270-L3279`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs#L3270-L3279)、[`ExcelDataFormatter.cs`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelDataFormatter.cs) | 純 C# 字串處理 | 中 | 可讓 Claude 翻成 JS，用在你的網頁表格顯示 `#,##0.00`、日期格式 |
| **xlsx → HTML 靜態預覽** | [`ExcelHandler.HtmlPreview.cs`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs)（4,294 行） | CLI 整體 | 低（用 CLI）／高（拆碼） | 雲端跑 `officecli view x.xlsx html -o out.html`，把 HTML 存 Firebase Storage，網頁用 `<iframe>` 顯示「報表預覽」 |
| **watch 雙擊編輯前端** | [`Resources/watch-overlay.js#L700-L760`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Resources/watch-overlay.js#L700-L760) | 原生 JS、`fetch` | 低 | 60 行的「雙擊 td → input → Enter 送出」寫法，可直接抄到你的倉儲 App 表格 |
| **範本套版 `merge`** | [`Core/TemplateMerger.cs`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/TemplateMerger.cs) | CLI | 低 | 報價單、出貨單、對帳單：Firestore 資料 → JSON → `merge` → .xlsx |
| **樞紐分析表產生** | [`Core/PivotTableHelper.cs`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/PivotTableHelper.cs) 等 7 檔 | OpenXML SDK | 中（用 CLI 為低） | 月銷售依通路×品類彙總，直接產生 Excel 原生樞紐表 |
| **Skill 檔（Excel 寫作規範）** | [`skills/officecli-xlsx/SKILL.md`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/skills/officecli-xlsx/SKILL.md)、[`officecli-financial-model`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/skills/officecli-financial-model/SKILL.md)、[`officecli-data-dashboard`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/skills/officecli-data-dashboard/SKILL.md) | 無 | 低 | 規則像「零公式錯誤」「能用公式就不要寫死數字」「先 help 再猜屬性」，可改寫成你自己的 Claude Skill（例如「成本試算表規範」） |
| **安全的本機預覽伺服器** | [`WatchServer.cs#L2096-L2121`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Watch/WatchServer.cs#L2096-L2121) | .NET | 中 | Host／Origin 檢查防 DNS rebinding、CSRF 的寫法可參考 |

---

## 7. AI／Claude 整合

- **OfficeCLI 本身不呼叫任何 AI 模型、沒有 prompt、沒有 API Key**。它是被 AI 呼叫的「工具」。
- **MCP（原生支援 Claude）**：
  - `officecli mcp claude` 會優先用官方 `claude mcp add -s user` 註冊；沒有 `claude` 指令時才直接寫 `~/.claude.json`，見 [`McpInstaller.cs#L179-L215`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/McpInstaller.cs#L179-L215)。也支援 cursor、vscode、lmstudio、opencode。
  - MCP Server 只暴露**一個工具 `officecli`**，參數是 `command`（字串或 argv 陣列），內部丟給同一套 CLI 解析器跑，見 [`McpServer.cs#L14-L19`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/McpServer.cs#L14-L19)、[`#L215-L225`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/McpServer.cs#L215-L225)。協定版本 `2024-11-05`。
  - 工具描述裡內建「交付前檢查」：`validate` → `view issues` → `view screenshot` 看圖自我修正 → `save`（[`McpServer.cs#L555-L604`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/McpServer.cs#L555-L604)）。截圖會以 image content 回傳給 Claude，形成「渲染→看→修」迴圈。
- **Skills**：`officecli install`（或 `skills`）會把內嵌的 SKILL.md 複製到偵測到的 agent 目錄，Claude Code 目標是 `~/.claude/skills`（[`Core/SkillInstaller.cs#L26`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/SkillInstaller.cs#L26)）。每次升級版本後還會**自動刷新**已安裝的 skill（UpdateChecker 內）。
- **Prompt 放哪**：其實就是 `skills/*/SKILL.md`（給 agent 的操作規範）與 `McpServer.cs` 裡的 `ToolDescription` 常數。
- **能不能換成 Claude**：本來就是為 Claude Code 等 agent 設計，`claude_support = 原生`。
- **讓 Claude 自動產報表的實際流程**（你最可能用到）：
  1. `officecli mcp claude`（一次性）
  2. 在 Claude Code 說：「讀 `inventory.csv`，做一份 `庫存月報.xlsx`：明細表＋依倉別的樞紐表＋缺貨標紅＋長條圖」
  3. Claude 會呼叫：`create` → `import … --header` → `add … --type pivottable` → `add … --type cf` → `add … --type chart` → `view … screenshot` 自檢 → `save`
- 補充：它沒有影片／腳本生成能力；對「AI 短劇、商品影片」這條線**無幫助**（PPT 動畫除外）。

---

## 8. 擴充方式與 API

1. **CLI（主要 API）**：三層設計（README「Three-Layer Architecture」）
   - L1 讀：`view text|annotated|outline|stats|issues|html|svg|screenshot`
   - L2 DOM：`get`、`query`（類 CSS 選擇器，如 `row[Salary>5000 and Region=EMEA]`）、`set`、`add`、`remove`、`move`、`swap`
   - L3 原始 XML：`raw`、`raw-set --xpath`、`add-part`、`validate`
   - 路徑定址：`/Sheet1/A1`、`/Sheet1/row[3]`、`/Sheet1/col[B]`，1 起算。
   - 每個指令都有 `--json`，錯誤回結構化 `code`／`suggestion`。
2. **batch JSON**：`[{"command":"set","path":"/Sheet1/A1","props":{"value":"品名"}}]`，可從 stdin、`--input` 或 `--commands`；`dump` 可把現有 xlsx 反向轉成同格式 JSON（round-trip）。
3. **Node／Python SDK**：透過 named pipe 跟常駐程序講話，不用每次開新程序，見 [`sdk/node/index.js#L1-L36`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/sdk/node/index.js#L1-L36)（`@officecli/sdk` 0.1.2，Node ≥ 18，依賴 `@officecli/officecli` 原生執行檔）。
4. **in-process**：`BatchExecutor` 供直接連結 C# 組件的宿主使用。
5. **外掛**（[`plugins/plugin-protocol.md`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/plugins/plugin-protocol.md)）：三種 kind——`dump-reader`（外部格式→officecli 指令 JSONL）、`exporter`（例如 PDF）、`format-handler`。外掛是獨立程序，可閉源。
6. **watch HTTP API**（只限 localhost）：`POST /api/send`、`/api/batch`、`/api/selection`、`/api/switch`、SSE 更新流（[`WatchServer.cs#L1918-L1975`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Watch/WatchServer.cs#L1918-L1975)）。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。2026-03 建立、2026-10-30 仍在推送、版本號 `1.0.160`（csproj）。程式碼註解密集、大量引用 issue 編號（#149、#435、#456 等），看得出一直在修真實使用者回報的效能與相容性問題。作者標示 `goworm`。
- **測試**：**公開 repo 沒有測試專案**（檔案清單 0 個含 test 的路徑），但註解多次提到 `FuzzPivotRound2Tests`、「officeshot golden-diff」→ 測試應該在私有 repo。CI 只有建置／發佈與 SDK smoke（`.github/workflows/`）。對你的意思：要拆程式碼回去改，沒有測試可以保護你。
- **公式正確性**：註解坦白說公式結果「尚未有任何函數通過與真 Excel 的逐位元比對」（`FormulaCacheL1Allowlist` 是空的），因此存檔時寧可清掉快取讓 Excel 重算。**用來產報表 OK，但不要把它算的數字當會計最終值**，最終以 Excel／Google 試算表開檔重算為準。
- **沒有依賴圖**：改了來源資料，之前寫好的公式不會自動重算（例如先寫 `SUMIFS` 再 `import` 資料）。存檔時會把可疑快取清掉。
- **遙測／隱私**：
  - 每天一次背景更新檢查，向 `d.officecli.ai`（專案自營 Cloudflare 鏡像）或 GitHub 發請求；User-Agent 帶版本號與是否在容器中，註解寫明用來做「版本分布」統計（[`UpdateChecker.cs#L133-L137`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/UpdateChecker.cs#L133-L137)、[`#L600-L612`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/UpdateChecker.cs#L600-L612)）。沒看到上傳文件內容。
  - **預設會自動下載並替換執行檔**（下載後比對 SHA256SUMS，但沒有簽章驗證，見 `#L208-L220`）。關閉：`officecli config autoUpdate false` 或環境變數 `OFFICECLI_SKIP_UPDATE=1`。
  - 修改過的文件會在 `docProps/custom.xml` 寫入 OfficeCLI 稽核標記（`ExcelHandler.cs` 的 `Modified` 註解），給客戶的檔案會帶這個痕跡。
- **資安**：有認真做防護——解壓縮炸彈上限 2GiB／10 萬個 entry、遞迴深度 256、正規表示式逾時（[`Core/DocumentLimits.cs`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/DocumentLimits.cs)）；遠端圖片走 `SsrfGuard`；watch 伺服器只綁 loopback 並檢查 Host／Origin；repo 內附 `.oss-scanner/threat_model.md`。
- **已知的坑**：
  - 常駐模式延遲寫檔：用 Python／Excel 讀之前要 `officecli save`。
  - 殼層引號：路徑有 `[]`、格式有 `$`，要用單引號；跨工作表公式建議用 batch heredoc（xlsx SKILL 自己寫的）。
  - HTML 預覽開源版**最多 5,000 列**、合併範圍裁到 5,000 列×200 欄（`#L483-L487`、`#L1126-L1128`）。
  - 截圖需要本機有 Chrome 系瀏覽器。
  - `System.CommandLine` 用的是 preview 版本。

---

## 10. 跟其他專案組合的建議

1. **OfficeCLI（後端產檔）＋ 網頁表格元件（前端編輯）**：前端用 Univer、Luckysheet／Handsontable、Glide Data Grid 這類 JS 元件讓人在瀏覽器裡編輯；資料存 Firestore；需要「正式 Excel 檔」時，再丟給 Cloud Run 上的 OfficeCLI 產生含樞紐表／圖表／條件格式的 .xlsx。OfficeCLI 補的是**JS 函式庫很難做好的「Excel 原生樞紐表、圖表、條件格式寫出」**。
2. **OfficeCLI ＋ HyperFormula（JS 公式引擎）**：網頁即時算用 HyperFormula（有依賴圖）；OfficeCLI 的 461 個函數清單可以拿來檢查 HyperFormula 缺哪些函數。
3. **OfficeCLI ＋ SheetJS**：SheetJS 在瀏覽器讀 Excel（廠商報價單上傳就解析），OfficeCLI 在後端寫漂亮的輸出檔。
4. **OfficeCLI ＋ Claude Code ＋ 你的倉儲 App**：最省事。把倉儲 App 的 Firestore 匯出腳本寫好，之後每月對 Claude 說一句話就產出月報；報價單用 `merge` 範本。
5. **比價／成本計算**：做一份「成本試算範本.xlsx」（含 `XLOOKUP`、`SUMIFS`、毛利率公式），用 `batch` 把各供應商報價寫進去，公式值當場算出 → `get --json` 取回結果顯示在你的網頁。

---

## 11. 網頁 Excel 能力檢查表

> 前提：OfficeCLI 不是網頁試算表元件。以下「有」多半指「在 .xlsx 檔裡能寫出來／讀出來」，網頁端只有靜態 HTML 預覽與 localhost watch 的陽春編輯。

### 渲染方式、虛擬捲動、效能
- **渲染方式：DOM（HTML `<table>`）**。C# 伺服端拼出 `<table>`／`<tr>`／`<td>`，凍結窗格用 `position:sticky`，圖表是內嵌 SVG。[`ExcelHandler.HtmlPreview.cs#L617-L654`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs#L617-L654)。沒有 Canvas／WebGL。
- **虛擬捲動：開源版沒有（私有實作才有）**。[`#L774-L788`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs#L774-L788) 的 `partial void OnRenderTbody` 由私有檔 `ExcelHandler.HtmlPreview.Virt.cs` 實作；開源版編譯時這個呼叫會被移除，改為全部靜態輸出。是否付費：未確認。
- **10 萬列以上：預覽沒有（上限 5,000 列）**；`GetHtmlRowCap()` 預設 5000，[`#L783-L788`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.HtmlPreview.cs#L783-L788)。**檔案層面**有針對大檔優化（列索引、共用字串索引、範圍 memo，註解提到 4 萬列 0.8 秒），但 10 萬列實際速度：未確認（未執行）。

### 公式引擎
- **函數數量：461 個函數名稱**（另有 `LET`、`LAMBDA` 在解析器另外處理，合計 463）。
  - **怎麼數**：用自己寫的 Python（放在 clone 外面）讀 [`FormulaEvaluator.Functions.cs#L36-L456`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/FormulaEvaluator.Functions.cs#L36-L456) 這一個 `name switch {…}` 主分派區塊，抓所有後面接 `=>` 或 `or "…"` 的大寫字串常值，去重後得 461。這個數字**包含新舊別名**（例如 `NORM_DIST` 與 `NORMDIST`、`STDEV_S` 與 `STDEV` 各算一個；名稱中的 `.` 在內部寫成 `_`）。README 宣稱「350+」，和我的數字吻合（去掉別名後大約落在這個量級，精確去別名數未確認）。
  - 抽查有：`SUM`、`SUMIFS`、`COUNTIFS`、`VLOOKUP`、`XLOOKUP`、`INDEX`、`MATCH`、`IFS`、`TEXT`、`NPV`、`IRR`、`XIRR`、`PMT`、`FILTER`、`SORT`、`UNIQUE`、`SEQUENCE`、`MAP`、`REDUCE`、`TEXTSPLIT`、`REGEXEXTRACT`、`OFFSET`、`INDIRECT`。
- **解析器：有（手寫遞迴下降，邊解析邊求值）**。[`FormulaEvaluator.cs#L690-L1072`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/FormulaEvaluator.cs#L690-L1072)。注意：同資料夾的 `FormulaParser.cs` 是 LaTeX 數學式轉 Word 方程式用的，不是 Excel 公式。
- **依賴圖／重算：沒有依賴圖**。官方註解原文「has NO cross-cell dependency graph」，[`ExcelHandler.FormulaCache.cs#L12-L43`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.FormulaCache.cs#L12-L43)。採「拉取式」求值：算某格時遞迴去算它參照的格子，配 session memo 與循環偵測（[`FormulaEvaluator.cs#L194-L233`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/FormulaEvaluator.cs#L194-L233)）；寫入時算一次，存檔時掃一遍修快取。
- **陣列公式／動態陣列：有**。`FormulaResult` 有 `ArrayValue`／`RangeValue`（[`FormulaEvaluator.cs#L15-L46`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/FormulaEvaluator.cs#L15-L46)），spill 實作在 `FormulaEvaluator.Spill.cs`／`SpillLambda.cs`，寫檔時自動補 `_xlfn.` 前綴（[`ModernFunctionQualifier.cs#L8-L14`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/ModernFunctionQualifier.cs#L8-L14)）；陣列常值 `{1,2;3,4}` 由 `ParseArrayConstant`（`FormulaEvaluator.cs#L938`）處理。
- **跨工作表參照：有**。`FormulaEvalSession.SheetEvaluators` 為每個工作表開子評估器；`OFFSET`／`INDIRECT` 以未解參照 `RefArg` 傳遞（[`FormulaEvaluator.References.cs#L9-L13`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Formula/FormulaEvaluator.References.cs#L9-L13)）。
- **自訂函數：有限度**。可用 `LAMBDA`／`LET` 與「定義名稱」（README：defined-name formula bodies inlined at parse）；**沒有**讓你用 C#／JS 註冊新函數的外掛 API（要改 `switch` 原始碼）。

### 編輯操作
- **儲存格編輯：有（CLI 為主；網頁僅 watch 雙擊）**。[`watch-overlay.js#L700-L760`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Resources/watch-overlay.js#L700-L760)：雙擊→`<input>`→Enter／失焦送 `POST /api/send`，Esc 取消；有公式時顯示公式。
- **複製貼上（從 Excel／Google 試算表貼上）：沒有**。前端 JS grep `paste`／`clipboard` 皆無結果。
- **拖拉填滿：沒有**（網頁只有拖選範圍與拖移圖表位置）。
- **復原／重做：沒有**。前端無 undo；替代品是 `batch` 原子回滾（失敗整批還原），以及你自己用 git 版控 .xlsx。

### 格式
- **數字格式：有**（寫入 `numFmt`；預覽用自製格式引擎，見第 5 節）。
- **條件格式：有**。`add --type cf|databar|colorscale|iconset|formulacf|cellis|topn|aboveaverage|duplicatevalues|containstext…`（[`ExcelHandler.Add.cs#L87-L159`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Add.cs#L87-L159)）；預覽會畫出顏色、資料橫條、圖示集。
- **合併儲存格：有**（[`ExcelHandler.Set.Sheet.cs#L334-L352`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Set.Sheet.cs#L334-L352)；預覽用 `rowspan/colspan`）。
- **凍結窗格：有**（`freeze=B2`，[`#L277-L333`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Set.Sheet.cs#L277-L333)；預覽用 sticky）。
- **欄寬列高：有**（`col`、`row` 元素；預覽讀 `GetColumnWidths`、列高）。
- **篩選：有（寫入 autoFilter；預覽只顯示下拉箭頭圖示，不能真的在網頁篩）**（`ExcelHandler.Add.cs#L84`；預覽 `BuildAutoFilterHeaderCells`）。
- **排序：有（直接重排檔案資料）**（[`ExcelHandler.Set.Ranges.cs#L53`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Set.Ranges.cs#L53)）。
- **資料驗證（下拉選單）：有（寫進檔案）**。`add --type validation --prop type=list --prop formula1==StatusList`（[`ExcelHandler.Add.cs#L80-L82`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Add.cs#L80-L82)；用法見 xlsx SKILL）。網頁預覽是否出現可點的下拉選單：未確認。

### 圖表、樞紐、圖片
- **圖表：有**。原生 Excel 圖表寫入＋預覽 SVG（含 pareto、箱型圖、瀑布、K 線、走勢圖），[`ChartSvgRenderer.cs#L11-L17`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/Chart/ChartSvgRenderer.cs#L11-L17)。watch 中可拖曳改位置。
- **樞紐分析：有（強項）**。多欄位、10 種彙總、日期群組、計算欄位、Top-N、交叉分析篩選器（slicer），[`PivotTableHelper.cs`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/PivotTableHelper.cs)。
- **圖片／附件：有**。PNG/JPG/GIF/SVG、儲存格內圖片（richValue）、OLE 內嵌物件（`ExcelHandler.Add.cs#L106-L116`）。

### 匯入匯出
- **.xlsx 讀寫：有（開源版，核心功能）**，函式庫是微軟 **DocumentFormat.OpenXml 3.4.1**。保真度：因為是直接改 OOXML 而非轉換格式，沒動到的部分會原樣保留；未修改時檔案位元組不變（`ExcelHandler.cs` 註解）。還有 `validate` 對照 OpenXML schema 檢查。
- **.csv 匯入：有**（`import`，支援 TSV、自訂分隔符、小數點逗號）。**.csv 匯出：沒有專用指令**——可用 `view text`（每列 tab 分隔，但前面帶 `[/Sheet1/row[N]]` 路徑字首）或 `get --json` 自行轉。
- **其他**：`.doc`、`.hwpx` 讀取與 PDF 匯出需外掛（外掛本體不在此 repo）。

### 多人協作
- **沒有**。無 OT／CRDT。單一檔案只有一個寫入者（常駐程序或直接寫檔）；watch 用 SSE 讓多個瀏覽器分頁同步看到「重新整理後」的畫面，但這是預覽廣播，不是協作編輯。

### 資料模型與存進 Firestore
- **資料模型**：檔案本身就是 OOXML；對外的 JSON 是 `DocumentNode`（[`Core/DocumentNode.cs#L12-L29`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/DocumentNode.cs#L12-L29)）：`path`、`type`、`text`、`preview`、`style`、`childCount`、`format{}`、`children[]`。儲存格節點由 [`CellToNode`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Handlers/Excel/ExcelHandler.Helpers.Node.cs#L295-L380) 產生，`format` 裡有 `type`、`formula`、`cachedValue`、`evaluated` 等。
  ```json
  {
    "path": "/庫存/E2",
    "type": "cell",
    "text": "12500",
    "preview": "E2",
    "format": { "type": "Number", "formula": "C2*D2", "evaluated": true }
  }
  ```
  （欄位名稱取自原始碼；實際輸出未執行驗證，`formula` 是否帶 `=`：未確認。README 範例另有 `tag/attributes` 形狀，以實際 `--json` 輸出為準。）
- **存進 Firestore**：建議存「批次指令」而不是存 xlsx。`officecli dump book.xlsx /庫存 -o sheet.json` 會得到 `[{"command":"set","path":"/庫存/A1","props":{"value":"品名"}}, …]` 這種可重播 JSON；你可以存一份 `sheets/{id}` 文件（`cells: {A1: {...}}`），需要時組回 batch 陣列餵 `officecli batch new.xlsx --input x.json` 重建。大型表要注意 Firestore 單一文件 1 MiB 上限，可每 500 列分一個子文件。

### 手機／觸控、繁體中文
- **手機／觸控：沒有特別支援**（前端 JS 無 touch／pointer 事件處理；靜態 HTML 在手機上可捲動瀏覽）。
- **繁體中文介面：沒有**（CLI 與預覽 UI 皆英文；README 有簡中版）。**繁中內容沒問題**：zh-TW／zh-Hant 預設東亞字型為「新細明體」（[`Core/LocaleFontRegistry.cs#L41-L42`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Core/LocaleFontRegistry.cs#L41-L42)）。

### 嵌入純 JavaScript 網頁
- **不能直接當 JS 元件嵌入**（它是原生執行檔，不是 npm 前端套件）。可行做法是「後端產 HTML → 前端 iframe 顯示」。最小範例（示意，未實測）：

  後端（Cloud Run／本機 Node，需先 `npm i @officecli/officecli`）：
  ```js
  // server.js — 把 Firestore 匯出的列寫成 xlsx，再輸出 HTML 預覽
  const { execFileSync } = require('child_process');
  const fs = require('fs');
  const express = require('express');
  const app = express();
  app.use(express.json());
  app.post('/report', (req, res) => {
    const rows = req.body.rows;             // [["品名","數量","單價"],["A",3,100],...]
    const csv = rows.map(r => r.join(',')).join('\n');
    fs.writeFileSync('/tmp/in.csv', csv);
    const x = '/tmp/report.xlsx';
    execFileSync('officecli', ['create', x, '--force']);
    execFileSync('officecli', ['import', x, '/Sheet1', '/tmp/in.csv', '--header']);
    execFileSync('officecli', ['view', x, 'html', '-o', '/tmp/report.html']);
    execFileSync('officecli', ['close', x]);
    res.type('html').send(fs.readFileSync('/tmp/report.html'));
  });
  app.listen(8080);
  ```
  前端（純 JS）：
  ```html
  <iframe id="pv" style="width:100%;height:600px;border:0"></iframe>
  <script>
    fetch('/report', { method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ rows: [['品名','數量','單價'],['A',3,100]] }) })
      .then(r => r.text()).then(html => { document.getElementById('pv').srcdoc = html; });
  </script>
  ```
  （`create --force`、`import … --header`、`view … html -o` 取自 README 與 CommandBuilder 選項；`--force` 用法取自 SDK 註解。）
- **套件大小**：前端 0 KB（只有產生的 HTML，內嵌 `preview.js` 212 行＋`preview.css` 274 行）；後端執行檔大小未確認。

### API／事件
- **用程式讀寫儲存格：有**。`get /Sheet1/A1 --json`、`set /Sheet1/A1 --prop value=…`、`batch`、Node／Python SDK 的 `doc.send({command:'set', path:'/Sheet1/A1', props:{text:'Hello'}})`。
- **監聽變更：部分**。watch 伺服器在每次 officecli 修改後透過 SSE 推 `update` 事件給瀏覽器（[`watch-overlay.js`](https://github.com/iOfficeAI/OfficeCLI/blob/c56512c8c7b76fe284f09940e4cd492470099d3e/src/officecli/Resources/watch-overlay.js) 尾段 `es.addEventListener('update', …)`），也會同步「使用者在網頁選取了哪些格」（`/api/selection`，可讓 agent 用 `get selected` 讀）。**但外部程式（例如 Excel）改檔不會被偵測**（watch 指令說明原文：external edits are not detected）。沒有給你自己網頁用的 onChange 回呼 API。

---

## 關鍵字
OfficeCLI、iOfficeAI、AionUi、AI agent、Office 自動化、命令列、CLI、Excel、xlsx、試算表、報表自動產生、Word、docx、PowerPoint、pptx、OpenXML、DocumentFormat.OpenXml、C#、.NET 10、單一執行檔、MCP、Model Context Protocol、Claude Code、Skills、SKILL.md、公式引擎、formula engine、動態陣列、XLOOKUP、SUMIFS、樞紐分析表、pivot table、條件格式、conditional formatting、圖表、SVG、HTML 預覽、截圖、headless Chrome、watch、即時預覽、範本套版、template merge、dump、batch、resident mode、named pipe、Node SDK、Python SDK、報價單、成本試算、庫存報表、Firebase、Cloud Run、Apache-2.0、私有虛擬捲動、無依賴圖
