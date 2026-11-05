# storytold/gridcraft — 純 Rust 寫的「仿 Excel 桌面＋瀏覽器（WebAssembly）」試算表，內建 MCP 讓 Claude 直接操作

> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：632e4a1
> GitHub：https://github.com/storytold/gridcraft｜⭐ 7139｜授權：MIT OR Apache-2.0（雙授權，任選其一；GitHub 只偵測到 Apache-2.0）｜主要語言：Rust｜最近更新：2026-11-04

固定連結前綴（下文所有 permalink 都以此 commit 為準）：
`https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/`

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 一套「長得像 Excel、用 Rust 從零寫的完整試算表應用程式」，同一份程式碼可以編成 Windows／macOS／Linux 桌面版，也可以編成瀏覽器裡跑的 WebAssembly 版，並且內建 MCP 伺服器與命令列工具，讓 Claude 可以「直接讀寫儲存格、下公式、做圖表、存 .xlsx」。

**對你（台灣小老闆、自己用 Claude 寫倉儲網頁）最實際的用法：**

1. **給 Claude 一個「真的會算 Excel 公式」的工具（最推薦）**：`claude mcp add gridcraft -- gridcraft-cli mcp`，就能讓 Claude Code 開你的庫存／報價 .xlsx，讀範圍、寫數值、套公式、排序、篩選、插圖表、另存新檔。適合「每週把廣告後台匯出的 CSV 丟給 Claude，叫它整理成有公式、有樞紐、有圖表的 xlsx」。
2. **命令列算公式**：`gridcraft-cli eval '=XLOOKUP(...)' --in 報價.xlsx`、`gridcraft-cli convert book.xlsx data.csv`、`convert book.xlsx out.json`，可以當成你自己批次腳本裡的「Excel 計算引擎」（例如成本試算、毛利計算）。
3. **把整個試算表用 `<iframe>` 嵌進你的 Firebase 網頁**：編出靜態網站（純 HTML＋JS＋.wasm），放到 Firebase Hosting，用 `postMessage` 把 .xlsx 檔案丟進去開、使用者按「儲存」時把 .xlsx 位元組丟回給你的頁面，你再存到 Firebase Storage。**注意：這是「整個 App 嵌進來」，不是一個可以逐格用 JavaScript 讀寫的元件**（見第 11 節）。
4. **拆零件研究**：它的公式引擎（約 515 個函數）、依賴圖重算、xlsx 讀寫、數字格式、圖表排版都是獨立的 Rust crate，邏輯清楚、註解很多，是「叫 Claude 參考它的做法、移植到 JavaScript」的好教材。

**不適合的用法：** 想在你現有的純 JS 倉儲頁面裡「嵌一個小表格元件、用 JS 監聽每格變更、直接存 Firestore」——GridCraft 目前不提供這種 JS API，那類需求請看 Univer、Luckysheet、Handsontable／HyperFormula 等。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **實際授權：MIT 或 Apache-2.0 雙授權，你任選一個遵守即可。** 證據：根目錄 `Cargo.toml` 第 9 行 `license = "MIT OR Apache-2.0"`（[Cargo.toml#L9](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/Cargo.toml#L9)），以及 `LICENSE-MIT`、`LICENSE-APACHE`、`NOTICE` 三個檔案。GitHub 頁面只顯示 Apache-2.0，是因為它只偵測到其中一個檔案。
- **個人使用：** 完全沒問題，免費、可修改。
- **公司商用：** 也可以，包含改成閉源、包進自己的產品、收費都行。要做的事只有：保留版權聲明與授權條文（選 Apache-2.0 時還要保留 `NOTICE`、標示你改過哪些檔案）。
- **商標要注意：** README 與 `NOTICE` 說明 `docs/brand/` 裡的 ArtCraft 名稱、標誌是商標，**不在開源授權內**，若你 fork 改版要拿掉那些標誌，也不要用「ArtCraft」名義對外。
- **付費版／閉源功能：** 在程式碼裡沒有看到任何付費牆、授權金鑰、「Pro 版」開關；README 寫「No subscription, no licence server, no telemetry」。開發團隊 ArtCraft 另有商業的 AI 影像產品，但 GridCraft 本身沒有發現付費版專屬功能。
- **第三方依賴：** 主要是 egui（MIT/Apache）、quick-xml、zip、serde 等常見 Rust 套件；還依賴團隊自己的 `storytold/craft-libs`、fork 的 `storytold/egui`、`storytold/winit`（git 依賴，見 Cargo.toml）。這些我**沒有逐一檢查授權**（未確認），商用前建議看一下 `ATTRIBUTION.md`。

---

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 項目 | 內容 |
|---|---|
| 語言 | Rust 2024 edition，最低 Rust 1.95（[Cargo.toml](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/Cargo.toml)），全專案 `unsafe_code = "forbid"` |
| 前端／UI | **egui 0.37**（即時模式 GUI）＋ eframe；桌面用 wgpu（DirectX 12／Vulkan／Metal／OpenGL），網頁用 **WebGPU，不支援時退回 WebGL2**，整個畫面畫在一個 `<canvas>` 上 |
| 後端 | **沒有伺服器端**。網頁版是純靜態檔（index.html＋JS 膠水＋.wasm），見 [packaging/web/README.md](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/packaging/web/README.md) |
| 資料庫 | 沒有。檔案就是 .xlsx（原生格式），也可另存 .csv／.tsv／.json（除錯用）／.html |
| 檔案格式函式庫 | **自己寫的**（`crates/xlsx`，只用 `quick-xml` + `zip` + `aes/sha1/sha2` 解密），不是用 calamine 或 umya |
| 部署 | 桌面：GitHub Releases 有簽章安裝檔（msi、dmg、AppImage、deb、rpm、flatpak、FreeBSD）；網頁：`trunk build --release` 產出靜態網站，或直接下載 Release 裡的 `gridcraft-web-<ver>.zip`，丟到 Firebase Hosting／Netlify／任何靜態主機 |
| 硬體／GPU | 一般電腦即可，需要能跑 WebGPU 或 WebGL2 的瀏覽器；Windows 舊電腦 DX12 起不來時會自動改 OpenGL（README 有說明） |
| API Key／費用 | **不需要任何 API Key，零費用**。MCP 是本機 stdio，接 Claude Code 時只用你自己的 Claude 訂閱 |
| 網路連線 | 桌面版啟動時會做一次「檢查更新」（`craft-update`，[updates_ui.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/updates_ui.rs#L1)）；沒看到遙測 |
| 自己編譯需求 | Rust 工具鏈 + `wasm32-unknown-unknown` target + trunk（網頁版）。**本次依規定沒有執行任何建置**，wasm 實際大小未確認 |

---

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

規模（我自己數的）：檔案總數 779（`git ls-tree -r`）；`.rs` 檔 635 個、共 **230,350 行**（`find -name '*.rs' | xargs wc -l`），其中路徑或檔名含 `test` 的約 70,600 行；`#[test]` 標記 3,372 個（`grep -rc '#\[test\]'` 加總）。專案 2026-10-07 才建立，一個月寫出 23 萬行，而且 `docs/gaps.md` 的工時估計是用「Opus 5.5 agent-hours」計算——**這明顯是大量由 AI 代理撰寫的專案**（見第 9 節風險）。

各 crate 行數（`find <dir> -name '*.rs' | xargs cat | wc -l`）：

```
gridcraft/
├── Cargo.toml                 工作區設定、授權 MIT OR Apache-2.0、所有依賴版本
├── README.md / ROADMAP.md     介紹、路線圖（自評「alpha，約 50% 可用於實際工作」）
├── AGENTS.md / CLAUDE.md      給 AI 代理的開發規則（本次視為資料，未遵循）
├── crates/
│   ├── core/       2,043 行   L0：儲存格位址 A1、Value 型別、錯誤值、日期序號、輸入解析
│   ├── numfmt/     3,171 行   L0：Excel 數字格式碼 `#,##0.00;[Red](...)`、TEXT()（僅 en-US）
│   ├── formula/    3,029 行   L1：公式 lexer / parser / printer / 參照位移（複製公式時 A1→A2）
│   ├── functions/ 17,245 行   L1：工作表函數庫（數學、統計、文字、日期、查找、財務、工程、資料庫）
│   ├── model/      5,494 行   L2：Workbook / Sheet / Cell、copy-on-write 儲存、樣式、表格、圖表、樞紐資料結構
│   ├── calc/       6,889 行   L2：依賴圖、重算、求值器、動態陣列溢出（spill）、LET/LAMBDA
│   ├── xlsx/      29,940 行   L2：XLSX 讀寫、CSV、.xls/.xlsb/.ods 匯入、密碼解密、樞紐與圖表 XML
│   ├── chart/      4,947 行   L3：與 UI 無關的圖表排版（輸出繪圖指令），走勢圖
│   ├── math/       1,709 行   方程式（LaTeX → 版面）
│   ├── pdf/        1,657 行   PDF 匯出
│   ├── engine/    64,645 行   L5：Session、指令系統（約 269 個指令 id）、復原、剪貼簿、填滿、排序、篩選、樞紐、規劃求解、巨集、檔案 I/O
│   ├── mcp/        1,972 行   L6：MCP 伺服器（22 個工具）
│   └── ui-egui/   79,448 行   L6：整個 Excel 外觀：格線繪製、功能區、公式列、對話框、19 種介面語言
├── apps/
│   ├── gridcraft/      2,519 行  桌面 App 進入點（含 TCP 控制通道）
│   ├── gridcraft-cli/  2,899 行  命令列：eval / convert / cat / run / mcp …
│   └── gridcraft-web/    854 行  瀏覽器版殼層：canvas、拖放、localStorage 偏好、iframe postMessage 橋接
├── packaging/web/             靜態網站打包與主機設定說明（nginx、_headers、iframe 嵌入）
├── docs/                      26 份文件：architecture、mcp、cli、control-protocol、gaps、各種 parity 清單
└── xtask/          1,889 行   CI 工具（格式、clippy、測試、分層檢查、wasm 建置）
```

分層是強制的（README Architecture 表格）：上層可以用下層，下層不能依賴 UI。**這對你很重要：`core + formula + functions + model + calc + xlsx` 完全不碰 UI，可以單獨拿出來用。**

---

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

### 5.1 公式解析
- 位置：[crates/formula/src/parser.rs#L27](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/formula/src/parser.rs#L27)（`pub fn parse`）、AST 定義 [crates/formula/src/ast.rs#L192-L212](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/formula/src/ast.rs#L192-L212)
- 重點：手寫遞迴下降 parser，AST 節點包含 `Ref`（含跨工作表）、`Name`（定義名稱／表格名／LET 參數）、`Struct`（結構化表格參照 `Table1[欄]`）、`Array`（陣列常數 `{1,2;3,4}`）、`Invoke`（`LAMBDA(x,x+1)(2)`）。`walk` 用顯式堆疊避免超長公式遞迴爆堆疊。另有 `adjust.rs` 處理複製／插入列時的參照位移、`input.rs` 處理西班牙文分號語法。

### 5.2 函數註冊與呼叫
- 位置：巨集 `f!` [crates/functions/src/lib.rs#L24-L63](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/functions/src/lib.rs#L24-L63)、註冊表 [lib.rs#L203-L231](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/functions/src/lib.rs#L203-L231)
- 重點：每個函數是一個 `FnSpec { name, min_args, max_args, category, volatile, scalar_args, signature, description, imp }`，`imp` 是普通 Rust 函數。`scalar_args` 讓引擎自動做「陣列提升」（傳範圍給只吃純量的參數時逐元素計算），這就是 Excel 365 動態陣列的行為。查名稱時會去掉 `_xlfn.`／`_xlws.` 前綴（xlsx 檔裡的新函數寫法）。
- 需要參照、惰性求值或隱藏列資訊的「特殊形式」由計算引擎自己處理：[crates/calc/src/eval/call.rs#L10-L130](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/eval/call.rs#L10-L130)（IF、IFS、CHOOSE、OFFSET、INDIRECT、INDEX、XLOOKUP、LET、LAMBDA、MAP/REDUCE/SCAN/BYROW/BYCOL/MAKEARRAY、GROUPBY/PIVOTBY、SUBTOTAL/AGGREGATE、TEXT…）。

### 5.3 依賴圖與增量重算
- 位置：[crates/calc/src/recalc.rs#L1-L11](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/recalc.rs#L1-L11)（設計說明）、`recalc_all`／`cells_changed` [recalc.rs#L191-L230](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/recalc.rs#L191-L230)、區間索引 [crates/calc/src/recalc/graph.rs#L43-L66](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/recalc/graph.rs#L43-L66)
- 重點：
  - 每個公式格記下它的「前驅範圍」；反向索引回答「誰讀了這格？」——單格放 hash map，範圍放「每欄一棵列區間樹」（超過 64 欄寬的範圍放每張表一棵），查詢 O(log n + k)。
  - 編輯後算出「所有受影響的公式」的遞移閉包，依拓撲順序重算；OFFSET/INDIRECT 這類動態參照用「隨需求值」當保險。
  - 循環參照用 Tarjan 強連通分量偵測，預設回 `#CIRC!`；開啟反覆運算時會迭代到收斂。
  - **單執行緒**（calc crate 沒有 rayon 依賴，`docs/gaps.md` 也承認「recalc is single-threaded」）。

### 5.4 資料模型與復原（Undo）
- 位置：[crates/model/src/store.rs#L1-L30](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/store.rs#L1-L30)、[crates/model/src/cell.rs#L62-L71](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/cell.rs#L62-L71)、[crates/core/src/value.rs#L166-L177](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/core/src/value.rs#L166-L177)
- 重點：儲存格以「64 列一個 band、每個 band 包在 `Arc` 裡」的稀疏結構存放；複製整本活頁簿只複製指標，修改某格只複製那一個 band（copy-on-write）。因此**復原快照幾乎免費**：每個指令執行前存一份 `wb.clone()`，見 [crates/engine/src/lib.rs#L667-L700](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/lib.rs#L667-L700)（`Session::execute`：執行前記下 `before`，指令 panic 時還原活頁簿與歷史）。

### 5.5 指令系統（所有操作都是指令）
- 位置：[crates/engine/src/lib.rs#L1-L5](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/lib.rs#L1-L5)、`crates/engine/src/cmd/` 整個資料夾
- 重點：每個功能區按鈕、選單、對話框都是 `cell.set`、`home.bold`、`data.sortAscending` 這類「指令 id + JSON 參數」。UI、CLI、控制通道、MCP、巨集全部走 `Session::execute`。我用正規式 `cmd!\(\s*"(id)"` 掃 engine crate，得到 **269 個不重複指令 id**（UI crate 另有一些，未計）。

### 5.6 剪貼簿（從 Excel 貼上）
- 位置：[crates/engine/src/clip_html.rs#L1-L8](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/clip_html.rs#L1-L8)、[crates/engine/src/cmd/edit/clipboard.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cmd/edit/clipboard.rs)、選擇性貼上 [paste_special.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cmd/edit/paste_special.rs)
- 重點：貼上以 Tab 分隔文字為主，再讀剪貼簿 HTML 的 `x:num="10000"`（Excel／Excel 網頁版）或 `sdval`（LibreOffice）屬性，把顯示成「NT$10,000」的格子還原成數字。**桌面版**有接 HTML 讀取（[apps/gridcraft/src/main.rs#L166](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/apps/gridcraft/src/main.rs#L166)）；**網頁版** `web.rs` 沒有設定 `paste_html`（[services.rs#L24-L30](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/services.rs#L24-L30) 定義了這個掛鉤），所以網頁版貼上只靠純文字。

### 5.7 填滿、排序、篩選、驗證、條件格式
- 填滿（數字、日期、星期、月份、自訂清單、快速填入 Flash Fill）：[crates/engine/src/fill.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/fill.rs)
- 排序／篩選：[cmd/data/sort.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cmd/data/sort.rs)、[cmd/data/filter.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cmd/data/filter.rs)
- 資料驗證：[cmd/data/validation.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cmd/data/validation.rs)
- 條件格式求值（樣式、資料橫條、色階、圖示集）：[crates/engine/src/cf.rs#L1-L2](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cf.rs#L1-L2)

### 5.8 檔案讀寫
- 進入點：[crates/engine/src/io.rs#L1](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/io.rs#L1)、儲存分派 [io.rs#L480-L516](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/io.rs#L480-L516)；XLSX [crates/xlsx/src/lib.rs#L87](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/xlsx/src/lib.rs#L87)（`read_xlsx`）、[#L156](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/xlsx/src/lib.rs#L156)（`write_xlsx`）；CSV [crates/xlsx/src/csv.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/xlsx/src/csv.rs)
- 重點：可存 .xlsx（含 .xlsm 巨集版）、.csv、.tsv、.json、.html；.xls／.xlsb／.ods／.slk **只能匯入**。xlsx 還有「pass-through」：不認得的部分（自訂 XML、外部連結、ActiveX 等）盡量原樣保留。

### 5.9 畫面（格線）繪製
- 位置：[crates/ui-egui/src/grid/geo.rs#L1-L30](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/grid/geo.rs#L1-L30)（每幀的幾何，自訂列高欄寬用前綴和索引）、`row_at` [geo.rs#L193](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/grid/geo.rs#L193)、儲存格繪製 `grid/cell_paint.rs`、`grid/quadrant.rs`
- 重點：egui 即時模式，每一幀只算畫面上看得到的列／欄；凍結窗格把畫面切成象限；由右至左工作表用鏡像處理。

### 5.10 MCP／CLI／控制通道
- 位置：[crates/mcp/src/lib.rs#L1-L12](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/mcp/src/lib.rs#L1-L12)、工具定義 [crates/mcp/src/tools.rs#L114](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/mcp/src/tools.rs#L114)、說明 [docs/mcp.md](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/mcp.md)、[docs/cli.md#L25-L34](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/cli.md#L25-L34)
- 重點：手寫的 stdio JSON-RPC 2.0（不靠 async runtime）。兩種後端：Headless（程序內直接開一個引擎 Session，沒有視窗）或 Remote（連到正在執行、用 `--control 7979` 開啟的桌面 App，有 token 驗證）。詳見第 7 節。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度（低／中／高） | 怎麼接到別的專案 |
|---|---|---|---|---|
| MCP 伺服器（給 Claude 操作試算表） | [crates/mcp/src/tools.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/mcp/src/tools.rs) | gridcraft-engine | 低（直接用執行檔） | 不用拆：下載 Release 的 `gridcraft-cli`，`claude mcp add gridcraft -- gridcraft-cli mcp --in 庫存.xlsx`。也可當「MCP 工具設計範本」，讓 Claude 照它的 22 個工具清單幫你的倉儲系統寫 MCP |
| CLI 公式計算／格式轉換 | [docs/cli.md#L25-L34](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/cli.md#L25-L34) | 執行檔 | 低 | 在 Node／Python 腳本裡呼叫 `gridcraft-cli eval`、`convert x.xlsx y.json/csv`、`run --cmd ... --out`，當成批次報表產生器 |
| 整個網頁版試算表（iframe） | [apps/gridcraft-web/src/host.rs#L1-L14](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/apps/gridcraft-web/src/host.rs#L1-L14) | 靜態網站 | 低～中 | 放 Firebase Hosting 同網域子路徑，`<iframe src=".../?host=parent&chrome=none">`，用 `postMessage` 收送 .xlsx 位元組（範例見第 11 節） |
| 公式 parser＋AST | [crates/formula/src/parser.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/formula/src/parser.rs) | gridcraft-core | 中 | 純 Rust 無 UI，可編成 wasm 給 JS 用（需自己寫 wasm-bindgen 包裝）；或當成移植到 JS 的參考 |
| 函數庫（約 491 個註冊函數） | [crates/functions/src/lib.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/functions/src/lib.rs) | gridcraft-core、regex | 中 | 每個函數是獨立純函數，可單獨抄某幾個（例如財務 `financial/tvm.rs` 的 PMT/NPV/IRR、`lookup.rs` 的 VLOOKUP 比對規則）到你的成本計算工具 |
| 依賴圖＋增量重算 | [crates/calc/src/recalc.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/recalc.rs)、[recalc/graph.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/recalc/graph.rs) | core、formula、functions、model、numfmt | 高 | 與 model 綁很緊；比較適合「學它的區間樹反向索引設計」再用 JS 自己實作 |
| copy-on-write 稀疏儲存格 | [crates/model/src/store.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/store.rs) | serde | 低（概念） | 64 列一個 band 的做法很好移植到 JS（用 Map＋結構共享），讓你的倉儲表也有便宜的復原 |
| XLSX 讀寫 | [crates/xlsx/src/lib.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/xlsx/src/lib.rs) | core、formula、math、model、quick-xml、zip | 中～高 | 需要連 model 一起帶走；若只要在 JS 讀寫 xlsx，SheetJS／ExcelJS 更省事 |
| 數字格式引擎 | [crates/numfmt/src/lib.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/numfmt/src/lib.rs) | 幾乎無 | 低～中 | 獨立 crate，可編 wasm 讓 JS 呼叫 `#,##0.00` 格式化；注意只支援 en-US |
| 剪貼簿 HTML 解析（保留 Excel 數值） | [crates/engine/src/clip_html.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/clip_html.rs) | 無 | 低 | 讀 `x:num` 屬性的技巧很適合直接用 JS 重寫，用在你的倉儲頁「從 Excel 貼上進貨單」 |
| 圖表排版（輸出繪圖指令） | [crates/chart/src/lib.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/chart/src/lib.rs) | core、model | 中 | 它輸出與 UI 無關的 `Prim` 清單，可改輸出 SVG（engine 裡已有 `chart_svg.rs`） |
| 宣告式巨集（JSON 指令清單） | [docs/macros.md](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/macros.md) | engine | 中（概念） | 「巨集＝JSON 步驟清單、整串算一個 undo、出錯整串回滾」的設計，很適合抄給你的倉儲系統做「批次操作」 |

---

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **內建 AI 模型：沒有。** 程式碼裡沒有呼叫任何 LLM API、沒有 prompt 檔、沒有 API Key 設定。它的定位是「讓外部 AI 代理來操作它」。
- **MCP：有，原生，而且文件直接寫 Claude Code 的接法**（[docs/mcp.md](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/mcp.md)）：
  ```sh
  claude mcp add gridcraft -- gridcraft-cli mcp                       # 無視窗
  claude mcp add gridcraft-app -- gridcraft-cli mcp --connect 7979    # 操作你正在看的桌面視窗
  ```
  Claude Desktop／`.mcp.json` 用 `{"command":"gridcraft-cli","args":["mcp"]}`。協定版本 `2025-06-18`，也相容 `2025-03-26`、`2024-11-05`。
- **MCP 工具（我從 tools.rs 數出 22 個）：** `execute_command`、`list_windows`、`list_commands`、`inspect_workbook`、`read_range`、`write_range`、`set_cell`、`get_cell`、`evaluate_formula`、`select`、`format_range`、`insert_chart`、`create_table`、`sort_range`、`filter`、`open_workbook`、`save_workbook`、`new_workbook`、`undo`、`redo`、`screenshot`、`list_functions`。其中 `execute_command` 可以呼叫全部約 269 個引擎指令（樞紐、條件格式、規劃求解等都能叫）。另有 MCP resources（指令清單、函數清單、活頁簿 URI）。
- **Skills：** 沒有發現 Claude Skills 檔。
- **Python 儲存格：** 可以存 Excel 的 `PY()` 儲存格與快取結果，但**不會執行 Python**，新改的程式碼顯示 `#BLOCKED!`（[crates/engine/src/cmd/python.rs#L1-L3](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cmd/python.rs#L1-L3)）。
- **能不能換成 Claude：** 本來就沒綁任何模型，Claude 是第一順位的使用者。結論：`claude_support = 原生`（原生支援 Claude Code 透過 MCP 操作）。
- **給你的實用情境：** 「Claude，打開 `進貨成本.xlsx`，在 F 欄加 `=D2*E2*(1+稅率)`，依供應商做樞紐、插一個長條圖，另存 `本月成本分析.xlsx`」——Claude 透過 MCP 一步步做，每一步都可以 `undo`。

---

## 8. 擴充方式與 API

1. **指令（command）API**：`Session::execute(id, json)`，是最主要的擴充點；CLI `gridcraft-cli commands --json` 可列出每個指令和參數說明。
2. **控制通道（桌面 App）**：`gridcraft --control 7979` 開一個 127.0.0.1 TCP JSON-lines 通道（有 token），可以送真實的滑鼠鍵盤事件、開對話框、截圖。CLI：`gridcraft-cli send 7979 engine.execute '{"command":"home.bold","params":{"range":"A1:C1"}}'`（[docs/cli.md#L34](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/cli.md#L34)）。
3. **巨集**：JSON 宣告式步驟（不是 VBA），可迴圈、條件判斷，整串一個 undo、錯誤時整串回滾（[docs/macros.md](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/macros.md)）。
4. **新增工作表函數**：在 `crates/functions/src/<類別>.rs` 的 `specs()` 加一個 `f!(...)` 再重新編譯。**沒有執行期註冊自訂函數的 API**：`lookup()` 註解明寫 `_xludf.`（使用者自訂函數）「never found」（[functions/src/lib.rs#L233-L234](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/functions/src/lib.rs#L233-L234)）。工作表內可用 `LAMBDA` + 定義名稱做自訂函數。
5. **網頁版 iframe 橋接**：只有 5 種訊息（`gridcraft:ready / open / save / dirty / failed`），**只能整本開、整本存**，沒有逐格 API。
6. **UI 可替換**：引擎不依賴 egui，理論上可以自己寫別的前端（例如 DOM），但工程量很大。

---

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

**優點**
- 更新非常頻繁：最新 commit 2026-11-03（`#3312`），PR／issue 編號已到 3000 以上，一個月內。
- 規範嚴格：`unsafe_code = "forbid"`、多數 crate `deny(unwrap_used, panic…)`、clippy 認知複雜度 deny、SonarCloud 掃描、CodeRabbit 審查、CI 有 Windows ARM64／FreeBSD／Nix。
- 測試很多：3,372 個 `#[test]`；函數庫有「所有函數餵各種惡意輸入都不能 panic」的測試（[functions/src/lib.rs#L317](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/functions/src/lib.rs#L317) `hostile_inputs_never_panic`）。
- 指令 panic 會被攔下並還原活頁簿（engine `execute`）。
- 無遙測（README），不需要帳號。

**風險／已知的坑**
1. **自評 alpha、約 50% 可用於實際工作**（[ROADMAP.md#L1-L3](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/ROADMAP.md#L1-L3)）。
2. **XLSX 輸出尚未在真實 Excel 驗證**，可能出現「Excel 要修復檔案」的提示（[docs/gaps.md#L19-L26](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/gaps.md#L19-L26)）。正式資料請先備份。
3. **大檔案**：約 100 MB 的 xlsx 開不了、重算單執行緒、10 萬個相依格的編輯約 0.4 秒（[docs/gaps.md#L28-L34](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/gaps.md#L28-L34)）。
4. **中文**：介面翻譯只有**簡體中文**（`zh.rs`，470 行，[i18n/zh.rs#L1](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/i18n/zh.rs#L1)），沒有繁體；中日韓字型靠系統字型 fallback，gaps.md 第 5 條說中文顯示「awaits confirmation」、PDF 匯出只用 14 種標準字型（**中文 PDF 很可能不行**）。
5. **大量 AI 生成的程式碼**：一個月 23 萬行，文件以「Opus 5.5 agent-hours」估工時。品質規範雖嚴，但長期由誰維護、程式碼是否有人逐行審過，都是風險；星數衝很快不代表成熟。
6. **依賴團隊自己 fork 的 egui／winit 與 craft-libs**（git rev 釘死），要自己編譯時比一般 crates.io 專案麻煩。
7. **網頁版**：整個 App 是一個 canvas，SEO／無障礙／瀏覽器內建翻譯都不適用；網頁版貼上不讀 HTML（從 Excel 貼上帶格式的數字可能變文字）；剪貼簿與 WebGPU 需要 HTTPS。
8. **沒有多人協作**（[docs/gaps.md#L144-L146](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/gaps.md#L144-L146)），**沒有手機版版面**（[docs/gaps.md#L178-L179](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/gaps.md#L178-L179)）。
9. 桌面版啟動時會連網檢查更新（`craft-update`）；控制通道只聽 127.0.0.1 且需 token，風險低，但不要把 7979 port 對外開放。
10. 加密 xlsx 可解密開啟（`crypto.rs`），macro 檔（.xlsm）的 VBA 只保留不執行。

---

## 10. 跟其他專案組合的建議

- **GridCraft（MCP／CLI）＋你的 Firebase 倉儲系統**：倉儲系統負責日常進出貨（Firestore），每月由 Claude Code 用 Firestore 匯出的 CSV → 透過 GridCraft MCP 做成「有公式、有樞紐、有圖表」的 xlsx 報表給會計。這是**最快見效、零授權風險**的組合。
- **網頁內嵌表格**：若要在倉儲頁面裡直接編輯表格並存回 Firestore，建議用 **Univer（Apache-2.0）或 Handsontable＋HyperFormula** 這類「JS 元件＋事件 API」的方案；GridCraft 目前只能 iframe 整本開存。
- **公式計算**：JS 端要算 Excel 公式 → HyperFormula（注意 GPL／商業授權）或 Univer 的公式引擎；GridCraft 的 `functions` crate 可當「行為參考答案」（例如比對 VLOOKUP 精確比對、15 位有效數字比較這些細節），讓 Claude 對照修正你的 JS 實作。
- **xlsx 讀寫**：前端用 SheetJS／ExcelJS；後端或批次用 `gridcraft-cli convert`。
- **成本／報價計算（你的第 2 個興趣）**：GridCraft 的財務函數（`financial/tvm.rs` PMT/NPV/IRR、折舊、債券）與規劃求解（`engine/src/cmd/solver/`，Simplex LP、GRG 非線性、演化法）可以讓 Claude 幫你做「最低成本採購組合」這類試算，直接在 xlsx 裡完成。
- **A＋B＋C 的建議分工**：A＝Univer（網頁內嵌編輯）、B＝SheetJS（前端 xlsx 匯入匯出）、C＝GridCraft（Claude 用 MCP 做後台報表與檢查公式）。

---

## 11. 網頁 Excel 能力檢查表

> 說明：以下「有」代表我在程式碼或文件中找到對應實作；GridCraft 沒有付費版，所以不會出現「付費版才有」。它的 alpha 程度高，「有」不等於「跟 Excel 一樣穩」。

### 渲染方式、虛擬捲動、大量資料
- **渲染方式：Canvas（WebGPU，退回 WebGL2）**——有。整個 App 畫在 `<canvas id="gridcraft_canvas">`（[apps/gridcraft-web/index.html](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/apps/gridcraft-web/index.html)），描述見 [apps/gridcraft-web/src/main.rs#L1-L16](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/apps/gridcraft-web/src/main.rs#L1-L16)。不是 DOM 表格。
- **虛擬捲動**——有。egui 每幀只排版可見區，自訂列高欄寬用前綴和索引快速換算座標（[grid/geo.rs#L27-L29](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/grid/geo.rs#L27-L29)、[#L193](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/grid/geo.rs#L193)）。工作表上限 1,048,576 列 × 16,384 欄（與 Excel 相同，`crates/core/src/addr.rs` 第 10–11 行）。
- **10 萬列以上效能**——未確認（未實測）。官方自承大檔與重算是短板：100 MB xlsx 開不了、單執行緒重算、10 萬相依格編輯約 0.4 秒（[docs/gaps.md#L28-L34](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/gaps.md#L28-L34)）。稀疏儲存＋copy-on-write 對「10 萬列純資料」應該還好。

### 公式引擎
- **函數數量：約 515 個（我自己數的）。** 數法：用 Python 正規式 `\bf!\(\s*(?:volatile;\s*)?"([A-Z0-9._]+)"` 掃 `crates/functions/src/**/*.rs`（排除檔名含 tests 的檔案），得到 492 個不重複名稱，扣掉 `lift.rs` 測試用的 `ADD2` = **491 個註冊函數**（分佈：stat 137、math 87、financial 56、engineering 54、text 48、info 38、date 25、dynamic 19、database 12、lookup 11、ets 4）。再把 [calc/src/eval/call.rs#L10-L130](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/eval/call.rs#L10-L130) 中由引擎直接處理、但不在註冊表的名稱比對出來，有 24 個（ROW、COLUMN、OFFSET、INDIRECT、LET、LAMBDA、MAP、REDUCE、SCAN、BYROW、BYCOL、MAKEARRAY、SUBTOTAL、AGGREGATE、TEXT、CELL、SHEET、SHEETS、AREAS、ISREF、ISFORMULA、FORMULATEXT、ISOMITTED、TRIMRANGE），合計約 **515**。官方文件自稱 513／523 名稱涵蓋、504 個可正常運作（[ROADMAP.md](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/ROADMAP.md)），與我的數字吻合。
- **解析器位置**——有：[crates/formula/src/parser.rs#L27](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/formula/src/parser.rs#L27)。
- **依賴圖／重算位置**——有：[crates/calc/src/recalc.rs#L1-L11](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/recalc.rs#L1-L11)、[recalc/graph.rs#L43-L66](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/recalc/graph.rs#L43-L66)。增量重算＋拓撲排序＋循環偵測，可開反覆運算。
- **陣列公式**——有。動態陣列溢出（Sheet 的 `spill`／`spill_ranges`，[model/src/sheet.rs#L104-L107](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/sheet.rs#L104-L107)），也支援舊式 Ctrl+Shift+Enter 陣列公式（[model/src/cell.rs#L13-L27](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/cell.rs#L13-L27)），以及 FILTER、SORT、UNIQUE、GROUPBY、PIVOTBY 等。
- **跨工作表參照**——有。依賴圖的鍵是 `(工作表索引, CellRef)`（[recalc/graph.rs#L35](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/calc/src/recalc/graph.rs#L35)），也支援 SHEET／SHEETS 與外部活頁簿連結（`engine/src/links.rs`）。
- **自訂函數**——部分有：工作表內可用 `LAMBDA`＋定義名稱；**沒有**讓 JS 或外掛在執行期註冊函數的 API（`_xludf.` 一律找不到，[functions/src/lib.rs#L233-L234](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/functions/src/lib.rs#L233-L234)）；要加只能改 Rust 原始碼重編。

### 編輯
- **儲存格編輯**——有（格內編輯＋公式列，公式輸入時參照上色、點選模式），`crates/ui-egui/src/grid/editor.rs`、`formula_bar.rs`。
- **複製貼上（從 Excel／Google 試算表）**——有，但桌面與網頁不同。以 Tab 分隔文字貼上（Google 試算表與 Excel 都會放這種格式）；桌面版另讀 HTML 的 `x:num` 保留數值（[clip_html.rs#L1-L8](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/clip_html.rs#L1-L8)）。網頁版未接 `paste_html`（[services.rs#L24-L30](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/services.rs#L24-L30)），格式化過的數字可能貼成文字。網頁版複製會寫入 HTML＋純文字（`web.rs` 第 247–269 行）。Google 試算表 HTML 的特殊屬性：未確認。
- **拖拉填滿**——有：數字、日期、星期、月份、自訂清單、Flash Fill（[engine/src/fill.rs#L1-L2](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/fill.rs#L1-L2)）。
- **復原／重做**——有：copy-on-write 快照（[model/src/store.rs#L1-L4](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/store.rs#L1-L4)、[engine/src/lib.rs#L667-L700](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/lib.rs#L667-L700)），可多步、可分組（巨集整串一步）。

### 格式
（Sheet 結構欄位見 [model/src/sheet.rs#L89-L167](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/sheet.rs#L89-L167)）
- **數字格式**——有：完整 Excel 格式碼語言（[numfmt/src/lib.rs#L1-L2](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/numfmt/src/lib.rs#L1-L2)），但**只有 en-US**（日期、千分位不會依台灣地區變化；可自己寫格式碼如 `yyyy/mm/dd`、`"NT$"#,##0`）。
- **條件格式**——有：規則樣式、資料橫條、色階、圖示集（[engine/src/cf.rs#L1-L2](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cf.rs#L1-L2)）。
- **合併儲存格**——有：`merges`（sheet.rs 第 113 行）。
- **凍結窗格**——有：`freeze`（sheet.rs 第 115 行）。
- **欄寬列高**——有：`cols`／`rows` 的 `LineInfo`、預設寬高（sheet.rs 第 108–112 行），自動調整欄寬（README 存取鍵 `H O I`）。
- **篩選**——有：AutoFilter、進階篩選、交叉分析篩選器（[cmd/data/filter.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cmd/data/filter.rs)、`cmd/whatif/advanced_filter.rs`、`cmd/slicer.rs`）。
- **排序**——有：[cmd/data/sort.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cmd/data/sort.rs)。
- **資料驗證（下拉選單）**——有：[cmd/data/validation.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/cmd/data/validation.rs)，`ValidationKind` 有 Any／Whole／Decimal／List／Date／Time／TextLength／Custom（[model/src/features.rs#L256-L266](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/features.rs#L256-L266)），List 即下拉選單；下拉箭頭的畫面互動我沒逐行確認。

### 圖表、樞紐、圖片
- **圖表**——有：`ChartKind` 列舉包含群組／堆疊直條、橫條、折線、圓餅、環圈、面積、散佈、泡泡、雷達、直方圖、瀑布、漏斗、矩形樹狀、放射環、盒鬚圖等（[model/src/features.rs#L404-L429](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/features.rs#L404-L429)；README 稱 17 種類型）、走勢圖、圖表資料表。官方承認圖表模型偏淺（座標軸刻度、誤差線、單點格式缺）。
- **樞紐分析**——有：欄位清單、篩選、版面、日期分組、值顯示方式、存讀 xlsx（`crates/engine/src/pivot/`、`cmd/pivot/`、`crates/xlsx/src/pivot/`）。PivotTable 在真 Excel 中的相容性官方標示「未驗證」。
- **圖片／附件**——有：浮動圖片、形狀、文字方塊、**儲存格內圖片**（[model/src/cell.rs#L52-L60](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/cell.rs#L52-L60)，PNG/JPEG，JSON 裡用 base64）。一般檔案附件：沒有。

### 匯入匯出
- **.xlsx**——有，開源版即有，**自己寫的讀寫器**（quick-xml＋zip），含樣式、主題、公式、表格、條件格式、驗證、註解、超連結、圖表、圖片、走勢圖、樞紐、列印設定、加密檔解密（[xlsx/src/lib.rs#L87](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/xlsx/src/lib.rs#L87)、[#L156](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/xlsx/src/lib.rs#L156)）。**保真度：中等、未經 Excel 實證**——官方 gaps.md 第 1、3、4 條：沒在真實檔案語料與 Excel 中驗證、交叉分析篩選器快取／時間軸／Power Pivot 存檔會掉、圖表選項會掉。
- **.csv／.tsv**——有：RFC 4180、自動判斷日期順序、保留讀入時的分隔符（[xlsx/src/csv.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/xlsx/src/csv.rs)、[engine/src/io.rs#L511-L513](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/io.rs#L511-L513)）。
- 其他：.xls／.xlsb／.ods／.slk 只能匯入；.json（整本活頁簿序列化，官方標註為除錯用）、.html、PDF 可匯出。

### 多人即時協作
- **沒有。** 沒有 OT／CRDT／鎖定／WebSocket（我用 `crdt|websocket|collaborat|yjs|automerge` 搜全部程式碼只在文件出現），gaps.md 第 16 條明寫「No co-authoring」（[docs/gaps.md#L144-L146](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/docs/gaps.md#L144-L146)）。

### 資料模型（JSON）與存進自己的資料庫
- Workbook／Sheet／Cell 全部 `serde` 可序列化（[model/src/workbook.rs#L199-L206](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/model/src/workbook.rs#L199-L206)），存成 `.json` 走 [engine/src/macros/mod.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/macros/mod.rs) 的 `json_bytes`（`serde_json::to_vec_pretty`）。依原始碼推導的形狀（`Value` 用 `#[serde(tag="t", content="v")]`、CellStore 是 band→row→col 巢狀 map；**未實際執行驗證**）：
  ```json
  {
    "sheets": [{
      "name": "庫存",
      "cells": { "bands": { "0": { "rows": {
        "1": {
          "0": { "value": {"t":"Text","v":"A001 白T"}, "formula": null, "style": 0 },
          "1": { "value": {"t":"Number","v":120},     "formula": null, "style": 3 },
          "2": { "value": {"t":"Number","v":36000},
                 "formula": {"text":"B2*300","array":null}, "style": 3 }
        }}}}, "len": 3 },
      "merges": [], "freeze": [1, 0], "validations": [], "cond_formats": []
    }],
    "names": [], "styles": { "...": "..." }
  }
  ```
- **存進 Firestore 的建議：** 不建議直接存這份 JSON（巢狀深、含全部樣式，容易超過 Firestore 單一文件 1 MB 上限）。實務做法：(1) 網頁 iframe 收到 `gridcraft:save` 的 .xlsx 位元組 → 存 **Firebase Storage**，Firestore 只放檔名／版本／更新時間；(2) 若要把資料列進 Firestore，用 `gridcraft-cli convert book.xlsx out.csv` 或 MCP `read_range` 取值後再自己寫入。
- 另外注意：網頁版不能在瀏覽器裡直接拿到這份 JSON（iframe 橋接只回傳 xlsx 位元組）。

### 手機／觸控、繁體中文
- **手機／觸控**——部分：單指拖曳會平移畫面（[grid/show.rs#L103-L108](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/grid/show.rs#L103-L108)），但**沒有手機版版面**（gaps.md 第 23 條）。手機上能開，但是桌機 Excel 介面縮小版，不好用。
- **繁體中文介面**——沒有。介面語言 19 種＋英文，中文只有「简体中文」（[i18n.rs#L1-L8](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/i18n.rs#L1-L8)、[i18n/zh.rs](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/ui-egui/src/i18n/zh.rs)，470 行翻譯，未翻的字回退英文）。要繁中可以叫 Claude 照 `zh.rs` 加一個 `zh_tw.rs`。儲存格裡打繁體字：靠系統 CJK 字型，官方說「待確認」。

### 嵌入方式（純 JavaScript 網頁可用嗎？）
- **可以，但只能用 `<iframe>` 嵌整個 App；不是 npm 套件、沒有 JS 元件 API、也不需要 React／Vue。** 依據：[packaging/web/README.md#L53-L76](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/packaging/web/README.md#L53-L76)、[apps/gridcraft-web/src/host.rs#L1-L14](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/apps/gridcraft-web/src/host.rs#L1-L14)。`?host=parent` 只在**同網域**（same-origin）的父頁面生效。
- 最小可用範例（把 Release 的 `gridcraft-web-<ver>.zip` 解壓到 Firebase Hosting 的 `/gridcraft/`，這頁放在同網域；依 host.rs 的訊息格式撰寫，**未實際執行測試**）：
  ```html
  <iframe id="gc" src="/gridcraft/?host=parent&chrome=none&author=Welly"
          style="width:100%;height:720px;border:0"
          allow="clipboard-read; clipboard-write"></iframe>
  <script>
  const gc = document.getElementById('gc');
  window.addEventListener('message', async (e) => {
    if (e.origin !== location.origin || e.source !== gc.contentWindow) return;
    const m = e.data;
    if (m.type === 'gridcraft:ready') {                 // App 準備好了，送檔案進去
      const buf = await (await fetch('/files/inventory.xlsx')).arrayBuffer();
      gc.contentWindow.postMessage({ type: 'gridcraft:open', name: 'inventory.xlsx', bytes: buf },
                                   location.origin, [buf]);
    } else if (m.type === 'gridcraft:save') {           // 使用者按儲存：拿到 .xlsx 位元組
      const blob = new Blob([m.bytes]);                 // 例如上傳到 Firebase Storage
      console.log('saved', m.name, blob.size);
    } else if (m.type === 'gridcraft:dirty') {
      document.title = m.dirty ? '* 未儲存' : '庫存表';
    } else if (m.type === 'gridcraft:failed') {
      alert('試算表啟動失敗：' + m.error);
    }
  });
  </script>
  ```
- **套件大小**——未確認（依規定沒有建置；Release zip 未下載）。官方只說 .wasm 經 gzip／Brotli 約縮為三分之一。以 23 萬行 Rust＋egui＋wgpu 推測會是數 MB 等級，首次載入偏重，**僅為推測**。
- 主機設定：`.wasm` 要用 `application/wasm` MIME、建議開壓縮、WebGPU 與剪貼簿需 HTTPS（Firebase Hosting 預設符合）。

### API／事件（能否監聽變更、用程式讀寫儲存格）
- **瀏覽器 JS 端**——幾乎沒有：只有「已就緒／開檔／存檔／是否有未存變更／啟動失敗」5 種訊息；**不能監聽單一儲存格變更、不能用 JS 讀寫某一格**。
- **Rust 端**——有：`Session::execute("cell.set", {...})` 讀寫任何東西（[engine/src/lib.rs#L667](https://github.com/storytold/gridcraft/blob/632e4a1bc51ee86b3f0a55e95ee78def391aab30/crates/engine/src/lib.rs#L667)）；有錄製器 `start_recording`／`stop_recording` 可記錄執行過的指令（lib.rs 第 1042–1052 行），但沒有看到對外的「變更事件訂閱」介面（未確認）。
- **AI／腳本端**——有：MCP `read_range`／`write_range`／`set_cell`／`get_cell`，以及桌面版 TCP 控制通道。若真要在網頁裡逐格讀寫，就得自己改 `host.rs` 新增訊息類型（Rust，難度中）。

---

## 關鍵字
GridCraft、storytold、ArtCraft、網頁版 Excel、試算表、線上試算表、Rust、WebAssembly、wasm、egui、WebGPU、WebGL2、Canvas 渲染、公式引擎、formula engine、依賴圖、dependency graph、增量重算、動態陣列、dynamic arrays、LAMBDA、LET、XLOOKUP、xlsx 讀寫、CSV 匯入匯出、樞紐分析、pivot table、條件格式、資料驗證、圖表、走勢圖、規劃求解、Solver、MCP、Model Context Protocol、Claude Code、AI 代理操作試算表、CLI、iframe 嵌入、postMessage、copy-on-write、復原重做、MIT、Apache-2.0、alpha、簡體中文介面、無多人協作、成本計算、報表自動化
