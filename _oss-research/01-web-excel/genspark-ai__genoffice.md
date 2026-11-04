# genspark-ai/genoffice — 桌面版開源 AI Office（試算表核心＝Univer 開源版＋自製 Rust .xlsx 引擎＋IronCalc 重算）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：4b55db9
> GitHub：https://github.com/genspark-ai/genoffice｜⭐ 11717｜授權：Apache-2.0（`ee/` 目錄另有企業授權，目前是空的）｜主要語言：TypeScript｜最近更新：2026-11-04

> 先講結論：**GenOffice 不是網頁版 Excel**，它是 Electron 桌面程式（macOS／Windows／Linux），沒有可以直接嵌進網頁的版本。它的試算表畫面其實是開源的 **Univer**（`@univerjs/*` 0.25.1，Apache-2.0），再加上一個自己寫的 Rust 程式負責讀寫 .xlsx、用 **IronCalc**（Rust 公式引擎）做大檔重算。對你最有價值的是三件事：(1) 它示範了「怎麼只用 Univer 免費版、避開 Pro 付費套件」；(2) 一整套「AI 讀寫試算表」的工具設計、提示詞與 56 種操作的 JSON 指令格式；(3) 自帶 `genoffice` 命令列與 MCP 伺服器，Claude Code 可以直接幫你產生、修改真正的 .xlsx。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：免費開源的桌面 Office（Word／Excel／PowerPoint／PDF／Markdown／HTML），每個編輯器旁邊都有 AI 助手，Claude 可以直接改你的 .xlsx，而且改完 Excel 打得開、公式是活的。

**你可以怎麼用：**

1. **個人直接當工具用（今天就能用）**：下載安裝版，在設定裡填 Claude API Key（或登入 Genspark），打開你的進貨價／售價 .xlsx，直接用中文問「幫我加一張彙總表，依供應商算平均進價和毛利率」——AI 會寫真正的 `SUMIF`／樞紐分析表進去，可以一鍵復原。
2. **讓 Claude Code 批次產報表**：安裝 GenOffice 後執行 `claude mcp add --transport stdio genoffice -- genoffice mcp`，Claude Code 就能用 `sheet_read`／`sheet_apply`／`create_xlsx` 這些工具，把你倉儲系統匯出的 JSON 轉成有格式、有公式、有圖表的 Excel（例如每週庫存報表、廣告成效報表）。
3. **拆零件做自己的網頁試算表**：你自己的倉儲系統是純 JavaScript＋Firebase，要做「網頁版 Excel」的話，真正要接的是 **Univer**；GenOffice 是一份「Univer 在真實產品裡怎麼用」的範本——怎麼組 preset、怎麼避開付費套件、怎麼掛自訂函數、怎麼監聽事件、怎麼處理 Big5 CSV。
4. **抄 AI 試算表助手的設計**：`apps/sheets/src/renderer/ai/` 裡有完整的工具定義（`get_workbook_context`、`read_range`、`aggregate_range`、`propose_operations`…）和系統提示詞，可以直接改寫成你自己網頁上的「AI 幫我整理庫存表」功能。
5. **比價／成本計算**：專案本身沒有比價或 ERP 功能，但「AI 讀表 → 寫公式 → 回讀計算結果驗證」的流程，正好適合做成本試算、毛利計算表的自動化。

---

## 2. 授權白話

- **主體：Apache-2.0**（[LICENSE](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/LICENSE)，根目錄 `package.json` 也寫 `"license": "Apache-2.0"`）。
  - **個人使用**：完全自由，可以改、可以自己編譯。
  - **公司商用**：也可以，包含拿程式碼改成自己的產品、閉源販售。要做的事：保留 LICENSE 與 [NOTICE](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/NOTICE)（版權人 Mainfunc, Inc.）、修改過的檔案要註明有改。Apache-2.0 也附專利授權，比 MIT 更安心。不能用「GenOffice／Genspark」商標冒充官方。
- **`ee/` 目錄：GenOffice Enterprise License（非開源）**（[ee/LICENSE](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/ee/LICENSE)）：只准開發測試，正式使用要簽企業合約。但 [ee/README.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/ee/README.md) 寫明「目前除了說明和授權檔以外是空的」，預留給未來的私有部署、離線授權驗證。我列出 `ee/` 底下確實只有 `README.md` 與 `LICENSE` 兩個檔。**現在沒有任何功能被鎖在付費版**；README FAQ 也說 app 本身沒有付費層。
- **依賴的授權重點**：
  - Univer 開源版（`@univerjs/*`）是 Apache-2.0。Univer 另有 `@univerjs-pro/*` 付費套件（圖表、樞紐、協作、匯入匯出等），GenOffice **刻意不裝** —— 見 [create-univer.ts#L1-L8](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/create-univer.ts#L1-L8)：註解說 `@univerjs/presets` 總包會間接拉進 27 個授權為 "None" 的 Pro 套件，所以他們只裝個別的 `@univerjs/preset-sheets-*` 並自己重寫 `createUniver`。**這一招你自己做網頁試算表時一定要學**。
  - 圖表也因此是自己畫的 SVG（[docs/architecture.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/docs/architecture.md) 寫「avoids the license-gated Univer Pro chart package」）。
  - Rust 端依賴 `ironcalc`、`calamine`、`quick-xml`、`zip` 等（[Cargo.toml](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/native/xlsx-engine/Cargo.toml)），CI 有 `Check dependency licenses`、`Check Rust dependency licenses` 兩步驟（[ci.yml](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/.github/workflows/ci.yml)）。IronCalc 本身的授權我沒在本 repo 內看到原文：**未確認**（印象中是 MIT/Apache 雙授權，請自行查證）。
- **AI 呼叫費用另計**：程式免費，但 AI 用的是你自己的 API Key（或 Genspark 帳號額度）。

---

## 3. 技術棧與執行需求

| 層 | 內容 |
|---|---|
| 外殼 | Electron 43（`apps/sheets/package.json` devDependencies `electron ^43.8.3`），七個 Electron app：docs、sheets、slides、pdf、markdown、html，加一個分頁外殼 `apps/shell` |
| 前端 | React 19、TypeScript、Vite 7／electron-vite |
| 試算表畫面 | Univer 0.25.1：`@univerjs/core`、`engine-render`、`preset-sheets-core`、`-conditional-formatting`、`-data-validation`、`-drawing`、`-filter`、`-find-replace`、`-note`、`-sort`、`-table`（[apps/sheets/package.json#L37-L51](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/package.json#L37-L51)） |
| .xlsx 讀寫 | Rust sidecar `xlsx-sidecar`（`apps/sheets/native/xlsx-engine`），stdin/stdout 一行一個 JSON 溝通；加上純 TS 套件 `@genoffice/xlsx-gateway`（jszip＋zod＋numfmt） |
| 公式重算 | 編輯中：Univer 公式引擎（瀏覽器內）；大檔備援：IronCalc 0.9.1（Rust） |
| 舊格式 | `calamine` 讀 .xls／.ods 轉成 .xlsx |
| 檔案搜尋 | 本機 SQLite 全文索引（README 說明，支援中日韓斷詞） |
| 資料庫 | **沒有伺服器資料庫**，檔案就是你硬碟上的 .xlsx |
| 部署 | 桌面安裝檔（dmg／exe／deb／rpm／AppImage）；`packaging/docker` 只是「批次轉 PDF」用的無頭映像，不是網頁版 |

**硬體**：一般電腦即可，不需要 GPU。大檔重算時 IronCalc 每格約 460 bytes 記憶體（[univer-sync.ts#L2564-L2577](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/univer-sync.ts#L2564-L2577) 註解：200 萬格約 1GB，超過 64MB 或 200 萬格就不重算，改顯示檔案內快取值）。

**自己編譯**：Node ≥ 22.12、npm ≥ 10、Rust（cargo）。`npm install && npm run dev`。一般人建議直接下載 Releases 安裝版。

**API Key 與費用**（[providers.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/ai-provider/src/providers.ts)，我數 `id: '…'` 共 31 個供應商項目）：
- 免設定：登入 Genspark 帳號，模型走 Genspark 代理（`anthropic: 'https://www.genspark.ai/api/anthropic'`，[providers.ts#L13](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/ai-provider/src/providers.ts#L13)），費用依 Genspark 方案（本 repo 內無價格：**未確認**）。
- 自帶 Key：Claude、OpenAI、Gemini、DeepSeek、Kimi、GLM、Qwen、OpenRouter…及任何 OpenAI 相容端點（含本機模型）。費用＝各家 API 按 token 計價。試算表 AI 一次任務常會多輪工具呼叫，大表格成本會明顯上升（系統提示詞特別寫了 "Bulk-job economy" 提醒模型省 token）。
- 網路搜尋、生圖：另外設定（Serper、Tavily、Parallel 免 Key 版等）。

---

## 4. 程式架構地圖

整個 repo 共 6,310 個檔案（`git ls-tree -r` 計數）。試算表相關集中在下面標 ★ 的地方。

```
genoffice/
├─ apps/
│  ├─ sheets/                ★ 試算表 app（813 個檔）
│  │  ├─ docs/               ★ architecture.md（信任邊界、串流讀檔）、compatibility.md（.xlsx 相容性清單，最值得讀）
│  │  ├─ native/xlsx-engine/ ★ Rust sidecar：串流讀 .xlsx、外部連結、尋找、IronCalc 重算、.xls/.ods 轉換
│  │  │  └─ src/ protocol.rs（指令列舉）、recalc.rs（IronCalc）、worksheet.rs、stream_patch.rs（存檔時只改動到的部分）
│  │  ├─ src/main/           Electron 主程序：存檔、PDF 匯出、sidecar 客戶端、加密活頁簿
│  │  ├─ src/preload/        安全橋接（renderer 不能碰檔案系統）
│  │  └─ src/renderer/       ★ 畫面（364 個 .ts/.tsx、約 16 萬行）
│  │     ├─ App.tsx          6,444 行主元件；L2162 建立 Univer
│  │     ├─ create-univer.ts ★ 不含 Pro 套件的 createUniver
│  │     ├─ univer-sync.ts   ★ 快照→Univer、串流視窗、重算排程
│  │     ├─ op-executor.ts   ★ 把 AI 的 JSON 指令套用到 Univer
│  │     ├─ mcp-bridge.ts    外部 MCP 指令→即時活頁簿
│  │     ├─ ai/              ★ AI 面板：tools.ts（工具定義）、prompts/base.md＋guides/*.md、redact*.ts（隱藏敏感儲存格）
│  │     ├─ i18n/            介面字串（含 zh-TW.ts）
│  │     ├─ *Dialog.tsx      各種 Excel 對話框：樞紐、格式化儲存格、選擇性貼上、目標搜尋、合併彙算…
│  │     └─ WorkbookVisuals.tsx  自畫 SVG 圖表／走勢圖（5,196 行）
│  ├─ docs/ slides/ pdf/ markdown/ html/   其他編輯器
│  └─ shell/                 分頁外殼、設定頁、MCP HTTP 伺服器
├─ packages/
│  ├─ xlsx-gateway/          ★ 純 TS：.xlsx 精準修補、CSV 匯入、活頁簿 DSL（56 種操作）、樞紐引擎、圖表資料
│  ├─ agent-core/            ★ 通用 AI 代理迴圈（工具呼叫、上下文壓縮、技能）
│  ├─ ai-provider/           ★ 多家模型轉接：protocols/anthropic.ts、openai-compatible.ts、gemini.ts…
│  ├─ cli/                   ★ `genoffice` 命令列＋MCP 伺服器（src/mcp/）
│  ├─ docx-engine/ pptx-*/ pdf2docx/ …     Word／簡報／PDF 引擎
│  └─ i18n/                  語系清單（含 'zh-TW'）
├─ skills/genoffice/         給 Claude Code 等用的 agent skill
├─ skills/recommended/       內建技能範本（budget-planner、expense-report、sales-forecast、kpi-dashboard…）
├─ ee/                       企業授權保留目錄（目前空）
├─ e2e/                      Playwright 端對端測試
└─ packaging/                docker（批次轉檔）、flatpak、nix
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 建立試算表畫面 | [App.tsx#L2162-L2214](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/App.tsx#L2162-L2214) | `createUniver({ presets: [UniverSheetsCorePreset({ header:true, toolbar:false, formulaBar:true, … }), UniverSheetsDrawingPreset(), …ConditionalFormatting, Filter, DataValidation, Note, FindReplace, Sort, Table] })`；關掉 Univer 自己的工具列，改用自製 Ribbon |
| 不含 Pro 的組裝器 | [create-univer.ts#L26-L57](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/create-univer.ts#L26-L57) | 30 行就重現官方 `createUniver`：逐一 `registerPlugin`，回傳 `{ univer, univerAPI: FUniver.newAPI(univer) }` |
| 載入資料 | [univer-sync.ts#L247-L330](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/univer-sync.ts#L247-L330) | 把自己的 `WorkbookSnapshot` 轉成 Univer 的 `cellData[row][col] = { v } / { f }`，呼叫 `univerAPI.createWorkbook(...)` |
| 大檔串流 | [lib.rs#L59](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/native/xlsx-engine/src/lib.rs#L59)、[architecture.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/docs/architecture.md) | Rust 把工作表 XML 切成每 256 列一塊的暫存索引；Univer 只放「目前看到的範圍＋緩衝」，捲動才向 sidecar 要資料，記憶體不隨檔案大小成長 |
| Sidecar 協定 | [protocol.rs#L30-L90](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/native/xlsx-engine/src/protocol.rs#L30-L90)、[main.rs](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/native/xlsx-engine/src/main.rs) | `Open`、`ReadRange`、`ReadMedia`、`ReadFormulaCells`、`FindCells`、`Cancel`、`ConvertWorkbook`…；stdin 一行 JSON、stdout 一行回應 |
| 公式重算（備援） | [recalc.rs#L1-L30](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/native/xlsx-engine/src/recalc.rs#L1-L30)、[univer-sync.ts#L2583-L2600](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/univer-sync.ts#L2583-L2600) | 大檔先試「closure 模式」（只把公式和它引用的格子載入 Univer 計算，[formula-closure.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/formula-closure.ts)）；不行才交給 IronCalc，在 Rust 端常駐模型、只套用變更，600ms 去抖動 |
| 「這個函數引擎會不會算」 | [function-registry-probe.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/function-registry-probe.ts) | 檔案裡的公式若用到 Univer 不支援的函數，就保留 Excel 存的快取值，避免被 `IFERROR` 吞掉變成錯的數字 |
| 精準存檔（不破壞原檔） | [compatibility.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/docs/compatibility.md)、`packages/xlsx-gateway/src/gateway/xlsx-gateway.ts`（3,507 行） | 編輯被記成「操作日誌」，存檔時只重寫被改到的 XML 片段，其餘 ZIP 項目逐位元組保留並用 SHA-256／CRC 驗證；做不到就「fail closed」拒絕存檔，不會默默弄壞檔案 |
| AI 工具 | [tools.ts#L276-L534](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/ai/tools.ts#L276-L534) | 13 個工具：`get_workbook_context`、`read_range`（單次上限 2,000 格，[#L262](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/ai/tools.ts#L262)）、`aggregate_range`（一次最多 100 萬格統計）、`load_guide`、`read_formats`、`read_sheet_features`、`read_cells`、`find_cells`、`select_range`、`trace_precedents`、`trace_dependents`、`propose_operations`、`create_document` |
| AI 操作 DSL | `packages/xlsx-gateway/src/domain/workbook-dsl.ts`（2,349 行） | zod 定義、我用 `grep "op: z.literal('…')"` 去重數到 **56 種**操作：set_cell、set_formula、fill_range、format_range、sort_range、add_chart、add_pivot、add_table、set_data_validation、add_conditional_format、set_freeze、insert_rows…；整批全有或全無、可一鍵復原 |
| 樞紐分析 | `packages/xlsx-gateway/src/domain/pivot-engine.ts`（980 行）、[PivotDialog.tsx](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/PivotDialog.tsx) | 純 TS 自己算加總／計數／平均／最大／最小、%總計、排名等；存檔寫入原生 pivot 零件並設 `refreshOnLoad`，Excel 打開就是活的樞紐表 |
| 圖表 | [WorkbookVisuals.tsx#L547](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/WorkbookVisuals.tsx#L547) | 自畫 SVG（直條、橫條、折線、面積、圓餅、甜甜圈、散佈、組合、走勢圖），疊在 Univer 浮動物件層上 |
| CSV 匯入 | [csv-import.ts#L1-L30](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/xlsx-gateway/src/gateway/csv-import.ts#L1-L30)、[data-tools-actions.ts#L59-L66](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/data-tools-actions.ts#L59-L66) | 自動判斷分隔符號；非 UTF-8 時依介面語言猜編碼，**繁中介面用 `big5`**（台灣 Excel 存的 CSV 不會亂碼）；數字開頭 0 保留成文字 |
| AI 隱私遮罩 | [ai/redact.ts#L1-L20](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/ai/redact.ts#L1-L20) | 選一段儲存格「對 AI 隱藏」，AI 只看到佔位名稱；連 `aggregate_range` 加總都會排除，避免用「總和－其他」反推出來 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 無 Pro 的 Univer 組裝器 | [create-univer.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/create-univer.ts) | `@univerjs/core` | 低 | 直接複製到你的網頁專案，搭配個別 `@univerjs/preset-sheets-*` 安裝，確保不會誤裝付費套件 |
| AI 試算表工具定義＋系統提示詞 | [ai/tools.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/ai/tools.ts)、[prompts/base.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/ai/prompts/base.md)、`prompts/guides/*.md`（11 份：charts、pivot、formatting…） | 無（是文字與 JSON schema） | 低 | 改成 Claude API 的 `tools` 參數；在你的網頁裡實作 `read_range`／`propose_operations` 兩個就能跑出最小可用的 AI 助手 |
| 活頁簿操作 DSL（56 種） | `packages/xlsx-gateway/src/domain/workbook-dsl.ts` | zod、同套件 `cell-address.ts` 等 | 中 | domain 目錄是純 TS（我 grep 只有 `gateway/xlsx-gateway.ts`、`gateway/xlsx-package-io.ts` 用到 `node:fs`），可在瀏覽器驗證 AI 輸出；執行端要自己對接 Univer facade |
| 樞紐分析引擎 | `packages/xlsx-gateway/src/domain/pivot-engine.ts`＋`pivot-*.ts` | 同套件 | 中 | 輸入二維陣列，輸出彙總格；可給 Firestore 匯出資料做「依供應商／月份彙總」 |
| CSV 匯入（含 Big5 偵測） | [csv-import.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/xlsx-gateway/src/gateway/csv-import.ts) | jszip、`TextDecoder` | 低 | 解析部分在瀏覽器即可用；拿來匯入蝦皮／廠商報價 CSV |
| 剪貼簿 TSV 修正 | [clipboard-tsv.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/clipboard-tsv.ts) | Univer `ISheetClipboardService` | 低 | 修正 Univer 複製出去的布林值、換行，讓貼到 Excel 正確 |
| 自訂函數範例 | [cell-function.ts#L108-L125](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/cell-function.ts#L108-L125)、[rate-function.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/rate-function.ts)、[ifs-empty-set.ts#L74-L88](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/ifs-empty-set.ts#L74-L88) | `@univerjs/engine-formula` | 低 | 照這個寫法註冊你自己的 `=查價("SKU")`、`=毛利率()` 之類函數 |
| 通用 AI 代理迴圈 | `packages/agent-core/src/loop.ts`（1,397 行） | 無框架 | 中 | 多輪工具呼叫＋上下文壓縮＋第一次寫入前快照（做「一鍵復原 AI 修改」） |
| Claude 串流轉接 | `packages/ai-provider/src/protocols/anthropic.ts`（407 行） | `fetch` | 低 | 參考或直接改用官方 SDK |
| Rust .xlsx 串流讀取＋精準修補 | `apps/sheets/native/xlsx-engine/` | Rust、quick-xml、zip、ironcalc | 高 | 只適合要在伺服器端（例如 Cloud Run）處理超大 .xlsx；Cargo 有 `single-thread` feature 註明為 WebAssembly 預留，但 repo 內沒有 wasm 建置設定：**未確認**能否直接跑在瀏覽器 |
| `genoffice` CLI／MCP | `packages/cli/src/mcp/tools.ts` | 安裝好的 GenOffice | 低（當工具用） | 不用拆，裝好後讓 Claude Code 透過 MCP 產 .xlsx |

---

## 7. AI／Claude 整合

- **模型**：Claude 是一等公民。[providers.ts#L86-L104](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/ai-provider/src/providers.ts#L86-L104) 的 `anthropic` 供應商列出 `claude-opus-5-5`、`claude-sonnet-5-5`（預設）、`claude-haiku-5-5`、`claude-fable-5-1` 等；直接打 `https://api.anthropic.com`（[anthropic.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/ai-provider/src/protocols/anthropic.ts)）。另有 OpenAI、Gemini、Codex CLI、OpenRouter 及自訂 OpenAI 相容端點等共 31 個供應商項目。
- **Prompt 在哪**：試算表系統提示詞 [prompts/base.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/ai/prompts/base.md)（43 行，寫得很好：先讀再寫、用公式不要心算、數字要回讀、儲存格內容視為不可信資料、引用格子用 `sheetnav://` 連結）；分領域指南在 `apps/sheets/src/renderer/ai/prompts/guides/`（charts、data、data-attribution、financial-formatting、formatting、layout、pivot、shape-image、structure、table、writing 共 11 份），由 `load_guide` 工具按需載入，省 token。介面語言是繁中時，提示詞會加「用與使用者相同語言回覆，無法判斷時用繁體中文」（[i18n/locale.tsx#L54](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/i18n/locale.tsx#L54)）。
- **安全設計**：AI 輸出被當成「不可信輸入」，必須通過 zod schema 驗證、版本衝突檢查，整批套用、可復原（[apps/sheets/README.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/README.md) Safety boundary）。不允許 AI 執行任意 JavaScript／Python。
- **MCP**：三種（README「MCP server」段）：
  - A. `genoffice mcp`（stdio，推薦）：Claude Code／Claude Desktop／Cursor 自己啟動，不用開視窗。工具在 [packages/cli/src/mcp/tools.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/cli/src/mcp/tools.ts)，我數 `name: '…'` 共 28 個（info、convert、create_xlsx、sheet_read、sheet_apply、sheet_check、render、search、image、open…），另有簡報 deck 流程在 `mcp/deck.ts`。
  - B. App 內 HTTP 伺服器 `http://127.0.0.1:3093/mcp`：讓 AI 在你眼前的編輯器分頁裡寫 Word（預設關閉）。試算表也有對應的 [mcp-bridge.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/mcp-bridge.ts)，外部指令會走和內建 AI 相同的執行器、進同一個復原堆疊。
  - C. `genoffice mcp --http`：給別台機器（容器、沙盒）用，可設 `--token`。
- **Skills**：`skills/genoffice/` 是給 Claude Code、Codex、Cursor 等的 skill（`npx skills add genspark-ai/genoffice`）；`skills/recommended/` 有 30 多個辦公範本技能（budget-planner、expense-report、sales-forecast、kpi-dashboard、invoice-tax-checklist…），也可匯入自己的 `SKILL.md`。
- **能不能換成 Claude**：本來就支援，設定頁選 Claude、貼 `sk-ant-…` Key 即可。

---

## 8. 擴充方式與 API

- **命令列**（[packages/cli/README.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/cli/README.md)）：
  ```bash
  genoffice create --type xlsx --from table.json --out sales.xlsx   # "=SUM(B2:B9)" 會是活公式
  genoffice sheet read book.xlsx --sheet Data --range A1:D20 --json
  genoffice sheet apply book.xlsx --ops ops.json --dry-run        # 56 種 DSL 操作
  genoffice sheet check book.xlsx --json                          # 找公式錯誤、斷掉的參照、### 欄寬
  genoffice convert book.xlsx --to csv --sheet Data
  ```
  寫入公式後會用 sidecar 計算並存入快取值，所以別的程式讀到的是數字不是空白。
- **ops.json 長這樣**（依 base.md 與 pivot guide 的欄位說明）：
  ```json
  [
    {"op":"set_range","sheetId":"…","range":"A1:C1","values":[["SKU","進價","售價"]]},
    {"op":"set_formula","sheetId":"…","address":"D2","formula":"=(C2-B2)/C2"},
    {"op":"add_pivot","sheetId":"…","sourceRange":"A1:F1000","targetCell":"H1","rowFields":["供應商"],"values":[{"field":"進價","agg":"average"}]}
  ]
  ```
  （`set_range`／`set_formula` 的確切欄位名稱我沒逐一核對 schema，以 `genoffice guide sheets` 輸出為準：部分**未確認**。）
- **在程式內擴充**：
  - 自訂函數：繼承 Univer `BaseFunction`，`functionService.registerExecutors(...)`（見第 6 節三個範例）。
  - 新增 AI 工具：在 `ai/tools.ts` 加定義、在 `App.tsx` 的 handler 物件（約 L2120 起的 `readCells`、`findCells`、`tracePrecedents`…）加實作。
  - 監聽事件：App 用 Univer facade `univerAPI.addEvent(univerAPI.Event.Scroll / SheetZoomChanged / SheetEditStarted / SheetEditEnded …)`（[App.tsx#L2535-L2612](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/App.tsx#L2535-L2612)），以及 `api.onCommandExecuted(...)`（[App.tsx#L1943](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/App.tsx#L1943)）。
- **沒有** HTTP REST API、外掛市集或網頁 SDK。

---

## 9. 程式品質與風險

- **維護狀況**：2026-07-31 建立，3 個月 1.1 萬顆星，最後推送就是掃描當天，非常活躍。Docker 檔寫的 release 版本是 0.11.0（[packaging/docker/Dockerfile](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packaging/docker/Dockerfile)）——**版本號仍是 0.x，API 和檔案結構隨時會變**。背後是 Genspark（Mainfunc, Inc.）公司。
- **測試**：檔案清單中 `*.test.ts(x)` 共 2,096 個，其中 `apps/sheets/tests/` 369 個；Rust `tests.rs` 5,063 行；另有 Playwright e2e 與視覺基準圖。CI 跑授權檢查、格式、主題色、字型度量等十多項檢查。品質明顯是工程團隊等級。
- **程式量很大**：試算表 renderer 單一 `App.tsx` 6,444 行、`univer-sync.ts` 數千行，處處是「修 Univer 某個 bug」的補丁檔（`*-fix.ts`）。拆零件時要有心理準備：**很多程式碼是在跟 Univer 0.25.1 的行為搏鬥，換 Univer 版本可能失效**。
- **遙測**：[PRIVACY.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/PRIVACY.md)：官方安裝版**預設開啟** Google Analytics 4 匿名統計（啟動、開檔副檔名、新檔類型、登入點擊、版本、作業系統、國家代碼），不傳文件內容與檔名；可在「設定 → 一般」關閉。自己從原始碼編譯則不會送。
- **AI 隱私**：文件內容只有在你用 AI 時才會送到你選的模型供應商；若用「Genspark 登入」則經過 Genspark 代理伺服器。成本／價格表等商業機密可用「對 AI 隱藏」功能，但 README 明講 CLI、MCP 不受此保護。
- **已知的坑**（摘自 [compatibility.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/docs/compatibility.md)）：VBA／Power Query／Power Pivot 只保留不執行；欄移動被擋；部分條件格式、資料驗證的 x14 擴充規則存檔會 fail closed；排序／篩選只在整份載入的活頁簿可用；儲存格保護不在編輯器內強制；大綱群組不能復原。
- **介面語言註解矛盾**：[univer-locales.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/univer-locales.ts) 檔頭註解說 zh-TW 沒有 Univer 語系包，但同檔 [#L216-L229](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/univer-locales.ts#L216-L229) 已經載入 `@univerjs/preset-sheets-*/locales/zh-TW`——以程式碼為準，Univer 部分應該是繁中。

---

## 10. 跟其他專案組合的建議

1. **你的倉儲網頁＋Univer（見同目錄 `dream-num__univer.md`）＋GenOffice 的 AI 設計**：
   網頁試算表本體用 Univer 開源 preset（照抄 `create-univer.ts` 避開 Pro）；資料存 Firestore；AI 側邊欄照 GenOffice 的 `tools.ts`＋`base.md` 改寫成呼叫 Claude API（透過 Firebase Cloud Functions 代打，避免 Key 外洩）。這是「A＋B＋C」最實際的組合。
2. **公式引擎**：Univer 自帶的公式引擎在瀏覽器內算；如果想要在伺服器（Cloud Functions）也算同一份公式，可考慮 HyperFormula（同目錄 `handsontable__hyperformula.md`，注意它是 GPL／商業雙授權）或 IronCalc（GenOffice 的做法）。
3. **報表產出**：日常「每週庫存／廣告報表」不必做進網頁——讓 Claude Code 透過 `genoffice mcp` 直接產 .xlsx，最省工。
4. **影片／腳本**：GenOffice 沒有影片生成。HTML app 和 Slides 可以生成產品介紹頁、簡報，但電商短影音要另找專案；不過它的「AI 先出設計 brief 再生成」流程（README 第 5 節）可以借鏡到腳本生成。
5. **比價／成本**：GenOffice 沒有爬價功能。可用它的 `search` 工具（Parallel／Tavily 等）抓網路資料、`data-attribution` 指南規範「每個數字要有來源」，再寫進比價表。

---

## 11. 網頁 Excel 能力檢查表

> 前提：以下是 **GenOffice Sheets 桌面版**的能力。網頁可嵌入性要看底層 Univer。

**渲染方式／虛擬捲動／10 萬列效能**
- 渲染：**有，Canvas**。App.tsx 註解「Univer paints the grid on canvas」（[App.tsx#L2147-L2150](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/App.tsx#L2147-L2150)）；圖表另用 DOM／SVG 浮動層。
- 虛擬捲動：**有**。Univer 只畫可視範圍，GenOffice 更進一步只「載入」可視範圍＋緩衝（[architecture.md](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/docs/architecture.md) Large workbook reads）。
- 10 萬列以上：**有（桌面版）**。Rust 每 256 列切塊串流；全格上限 1,048,576 列（[grid-bounds.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/xlsx-gateway/src/shared/grid-bounds.ts)）；有 `benchmark:large` 腳本。但實際秒數 repo 內沒有公開數據：**未確認**。注意這靠 Rust sidecar，純網頁版拿不到這套串流。

**公式引擎**
- 函數數量：**未確認**。函數全部來自 `@univerjs/engine-formula`（不在本 repo，未安裝 node_modules 無法自己數）。本 repo 自己註冊／覆寫的 executor 我用 `grep registerExecutors` 數到 4 個：`CELL`（[cell-function.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/cell-function.ts)）、`RATE`（[rate-function.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/rate-function.ts)）、`MINIFS`、`MAXIFS`（[ifs-empty-set.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/ifs-empty-set.ts)）。插入函數對話框的分類有 15 類（[function-catalog.ts#L20-L36](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/function-catalog.ts#L20-L36)）。
- 解析器與依賴圖／重算：**有，但在 Univer 內部**（`LexerTreeBuilder` 等，見 [paste-special.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/paste-special.ts) import）。GenOffice 自己做的是「closure 分析」（[formula-closure.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/formula-closure.ts)：算出公式＋所引用格子的集合）與 IronCalc 備援（[recalc.rs](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/native/xlsx-engine/src/recalc.rs)）；另有 `trace_precedents`／`trace_dependents` 追蹤。
- 陣列公式：**有（至少讀檔／重算側）**。recalc.rs 處理 `SpillValue`，註解提到「dynamic or CSE array formula」的溢出儲存格；編輯器端行為依 Univer：細節**未確認**。
- 跨工作表參照：**有**。compatibility.md 列為 V1 支援，改名工作表時會改寫所有 `Sheet!A1` 參照。
- 自訂函數：**有**，`functionService.registerExecutors`（見上）。

**編輯操作**
- 儲存格編輯：**有**（Univer 編輯器＋公式列）。
- 複製貼上：**有**。基本貼上由 Univer `ISheetClipboardService` 處理；GenOffice 修正輸出 TSV（[clipboard-tsv.ts#L1-L8](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/clipboard-tsv.ts#L1-L8)），並實作「選擇性貼上」（運算、略過空白、轉置、貼上連結，[paste-special.ts#L1-L18](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/paste-special.ts#L1-L18)），會讀 `text/html` 剪貼簿。從 Excel／Google 試算表貼上「保留格式」的效果：**未確認**（依 Univer 實作）。
- 拖拉填滿：**有**（Univer auto-fill，另有 `ctrl-drag-fill.ts`、`FillSeriesDialog.tsx` 數列對話框、AI `fill_range` 一次最多 20 萬格）。
- 復原／重做：**有**。Univer `IUndoRedoService`（App.tsx 訂閱 `undoRedoStatus$`），AI 每批修改一個復原點。

**格式**
- 數字格式：**有**（完整 ECMA-376 內建格式表＋自訂格式，Format Cells ⌘1）。
- 條件格式：**有**（Univer 條件格式 preset；色階、資料橫條、圖示集、前 10 名、公式等，compatibility.md 有完整清單）。
- 合併儲存格：**有**。凍結窗格：**有**（`set_freeze`）。欄寬列高：**有**（含自動調整）。
- 篩選、排序：**有**（Univer filter／sort preset，存回 `<autoFilter>`；限整份載入的活頁簿）。另有進階篩選對話框。
- 資料驗證（下拉選單）：**有**（Univer data-validation preset，清單、跨表清單參照、核取方塊）。

**圖表／樞紐／圖片**
- 圖表：**有（自製 SVG）**，直條、橫條、折線、面積、圓餅、甜甜圈、散佈、組合；可改標題、類型、顏色、資料範圍。沒有用 Univer Pro 圖表。
- 樞紐分析：**有（自製）**，`pivot-engine.ts`＋存成原生 pivot，另有交叉分析篩選器（SlicerPanel）、時間軸。
- 圖片／附件：**有**。浮動圖片、儲存格內圖片（Excel rich value，`richdata.rs`、`cell_images.rs`）；附件檔：**沒有**。

**匯入匯出**
- .xlsx：**有，開源版就有，而且是重點**。不靠 SheetJS／ExcelJS，自寫 Rust 串流讀取＋TS 精準修補；保真度很高——未改動的 ZIP 項目逐位元組保留，做不到就拒絕存檔。另可開 .xls、.ods、加密 .xlsx。
- .csv：**有**，匯入自動偵測 Big5；匯出 UTF-8 BOM、CRLF（CLI `convert --to csv`）。
- PDF：**有**（匯出）。

**多人即時協作**
- **沒有**。我在 `apps/sheets/src` grep `collaborat|crdt|yjs` 只命中 create-univer.ts 的註解「collaboration mode intentionally omitted」。Univer 的協作屬於 Pro 付費功能。

**資料模型與存進 Firestore**
- GenOffice 自己的快照型別（[workbook.types.ts](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/packages/xlsx-gateway/src/domain/workbook.types.ts)）：
  ```json
  { "revision": 3,
    "sheets": [{ "id": "s1", "name": "庫存",
      "cells": { "A1": {"value":"SKU"}, "B2": {"value":120}, "D2": {"value":0.35, "formula":"=(C2-B2)/C2"} },
      "styles": { "A1": {"bold": true, "fillColor": "#FFF2CC"} },
      "merges": ["A10:C10"], "colWidths": {"A": 120} }] }
  ```
- 交給 Univer 的格式（[univer-sync.ts#L281-L320](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/univer-sync.ts#L281-L320)）：`{ id, name, sheetOrder:[...], sheets:{ s1:{ id, name, rowCount, columnCount, cellData:{ 0:{ 0:{v:"SKU"} }, 1:{ 3:{f:"=(C2-B2)/C2"} } } } } }`。
- 存 Firestore：GenOffice **沒有**任何資料庫存法（它存 .xlsx 檔）。建議做法：每個工作表一份文件、`cellData` 依列分塊（Firestore 單文件上限 1MB），或只存你自己的 `cells` 物件格式；變更用事件監聽後做差異寫入。屬建議，非本 repo 內容。

**手機／觸控、繁體中文**
- 手機／觸控：**沒有**。只有桌面版（macOS 11+、Windows 10+、Linux）。
- 繁中介面：**有**。`packages/i18n` 語系清單含 `'zh-TW'`，`apps/sheets/src/renderer/i18n/app/zh-TW.ts` 存在，Univer 也載入 zh-TW 語系包（見第 9 節）；README 有 `docs/i18n/README.zh-TW.md`；中文字型下載清單含 Noto Sans TC／Noto Serif TC。

**嵌入方式（純 JavaScript 網頁）**
- GenOffice 本身：**沒有**，無法嵌入網頁。
- 底層 Univer：**可以**用在純 JS 網頁（你的程式不需要寫 React，但 Univer 內部需要 React／ReactDOM／RxJS 作為相依）。以下是依 GenOffice 用法（`createUniver`＋`UniverSheetsCorePreset`＋`univerAPI.createWorkbook`）改寫的最小範例，採 npm＋Vite 打包；**未在本 repo 實測**，Univer 版本請鎖定 0.25.1 與 GenOffice 一致：
  ```js
  // npm i @univerjs/core@0.25.1 @univerjs/preset-sheets-core@0.25.1 react react-dom rxjs
  import { LocaleType, mergeLocales } from '@univerjs/core'
  import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
  import zhTW from '@univerjs/preset-sheets-core/locales/zh-TW'
  import '@univerjs/preset-sheets-core/lib/index.css'
  import { createUniver } from './create-univer.js' // 從 GenOffice 複製、去掉型別

  const { univerAPI } = createUniver({
    locale: LocaleType.ZH_TW,
    locales: { [LocaleType.ZH_TW]: mergeLocales(zhTW) },
    presets: [UniverSheetsCorePreset({ container: 'app' })],
  })
  univerAPI.createWorkbook({
    id: 'stock', name: '庫存', sheetOrder: ['s1'],
    sheets: { s1: { id: 's1', name: '庫存', rowCount: 1000, columnCount: 26,
      cellData: { 0: { 0: { v: 'SKU' }, 1: { v: '進價' }, 2: { v: '售價' }, 3: { v: '毛利率' } },
                  1: { 0: { v: 'A001' }, 1: { v: 120 }, 2: { v: 199 }, 3: { f: '=(C2-B2)/C2' } } } } },
  })
  const sheet = univerAPI.getActiveWorkbook().getActiveSheet()
  sheet.getRange('A3').setValue('A002')                // 程式寫入
  univerAPI.addEvent(univerAPI.Event.SheetEditEnded, () => {
    console.log(sheet.getRange('D2').getValue())      // 程式讀取
  })
  ```
  HTML 只要 `<div id="app" style="height:600px"></div>`。套件大小：**未確認**（本 repo 沒有打包產物可量）。

**API／事件**
- 監聽變更：**有**（Univer `addEvent`、`onCommandExecuted`，GenOffice 在 App.tsx 使用 Scroll、SheetZoomChanged、SheetEditStarted、SheetEditEnded 等）。
- 程式讀寫儲存格：**有**（Univer facade：`worksheet.getRange('A1').setValue / setFormula / clearContent`，見 [univer-sync.ts#L231-L245](https://github.com/genspark-ai/genoffice/blob/4b55db9ed1994575a695160ffc6cfd0bfc866211/apps/sheets/src/renderer/univer-sync.ts#L231-L245) `syncUniver`）；檔案層級則有 `genoffice sheet read/apply` CLI 與 MCP。

---

## 關鍵字

GenOffice、genspark、Genspark、AI Office、AI 試算表、網頁版 Excel、桌面版 Excel 替代、Univer、univerjs、Univer 開源版、Univer Pro 避開、IronCalc、calamine、Rust xlsx、xlsx sidecar、xlsx-gateway、.xlsx 精準存檔、byte-preserving、Electron、React、TypeScript、Canvas 渲染、虛擬捲動、大檔串流、公式引擎、自訂函數、registerExecutors、樞紐分析、pivot table、條件格式、資料驗證、下拉選單、SVG 圖表、CSV Big5、繁體中文、Claude、Anthropic、MCP、genoffice mcp、Claude Code、agent skill、SKILL.md、AI 工具定義、propose_operations、workbook DSL、AI 隱私遮罩、redaction、Apache-2.0、企業授權 ee、Google Analytics 遙測
