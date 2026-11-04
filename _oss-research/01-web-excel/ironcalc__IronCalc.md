# ironcalc/IronCalc — 用 Rust 寫、可編成 WebAssembly 在瀏覽器裡跑的開源 Excel 公式引擎（附 Canvas 試算表介面）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：bec55e1
> GitHub：https://github.com/ironcalc/IronCalc｜⭐ 4247｜授權：MIT 或 Apache-2.0 雙授權（任選其一）｜主要語言：Rust｜最近更新：2026-11-04

> 本文所有 permalink 都指向 commit `bec55e1e9ba33be147166cd52ed968a89f650a04`，以下簡寫為 `…/blob/bec55e1…/`，實際連結皆為完整 SHA。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** IronCalc 是一顆「跟 Excel 算得一樣」的試算表計算引擎（Rust），編成 WebAssembly 之後，在純前端網頁裡就能做公式計算、讀寫 .xlsx，另外附一套 React＋Canvas 的網頁試算表介面。

**對你（台灣電商／倉儲老闆、自己用 Claude 寫純 JS＋Firebase 倉儲系統）最實際的用法：**

1. **把「Excel 公式」搬進你的倉儲網頁。** 你現在的倉儲系統若要做「成本＝進價×匯率＋運費／數量」「毛利率」「安全庫存」這類計算，可以讓使用者直接打 Excel 公式（`=SUMIFS`、`=XLOOKUP`、`=ROUND`…），交給 `@ironcalc/wasm` 算。不用自己寫公式解析器。
2. **報價／比價試算表（價格查詢、成本計算）。** 建一個「商品成本計算」範本：A 欄品名、B 欄進價、C 欄運費、D 欄 `=B2*1.05+C2`…，存成 `.ic`（IronCalc 二進位格式）或 `.xlsx`，嵌進網頁讓自己或員工填。
3. **匯入供應商給的 .xlsx 報價單 → 算完 → 寫回 Firestore。** `@ironcalc/wasm-xlsx` 套件可在瀏覽器直接 `Model.fromXlsx(bytes, …)` 讀 Excel 檔，不需要伺服器。
4. **嵌入現成的網頁試算表。** 官方有 `embed.js`（iframe），一行 `<script>` 就能在任何網頁放一張可編輯的試算表；或用 `@ironcalc/workbook` React 元件。
5. **Python／Node.js 後端批次運算。** 例如每天晚上用 Python 讀廣告報表 xlsx、算 ROAS、輸出新的 xlsx（`pip install ironcalc`）。

**不適合拿來做的事：** 它目前**沒有**圖表、樞紐分析、篩選／排序介面、資料驗證（下拉選單）、多人即時協作伺服器，也**沒有繁體中文介面**。如果你要的是「功能齊全的線上 Google 試算表替代品」，它還不夠；但如果你要的是「一顆可靠、好嵌入、授權寬鬆的 Excel 公式引擎」，它是目前最乾淨的選擇之一。

---

## 2. 授權白話

- **授權：MIT OR Apache-2.0（雙授權，你可以任選一個遵守）。** 見根目錄 [`LICENSE-MIT`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/LICENSE-MIT)、[`LICENSE-Apache-2.0`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/LICENSE-Apache-2.0)，各子套件 `Cargo.toml`／`package.json` 也都寫 `"MIT OR Apache-2.0"`（例如 [`base/Cargo.toml`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/Cargo.toml)、[`webapp/IronCalc/package.json`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/package.json)）。GitHub 只偵測到 Apache-2.0，實際是雙授權。
- **個人使用：** 完全自由，改、拆、組合都可以。
- **公司商用：** 可以，包括閉源商用、做成 SaaS 收費都可以。只要在發佈的程式（含打包進網頁的 JS／wasm）保留版權與授權聲明即可。選 Apache-2.0 還多一層專利授權保障。
- **第三方資料要注意：** 引擎內建的地區格式資料（日期、數字格式）來自 Unicode CLDR，採 Unicode License v3，說明在 [`base/THIRD-PARTY-NOTICES.md`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/THIRD-PARTY-NOTICES.md)；字型 Inter／Mozilla Headline 為 SIL OFL 1.1。npm 套件會附 `THIRD-PARTY-NOTICES.md`，商用發佈時一併保留即可。
- **有沒有閉源／付費版功能？** 在這個 repo 裡**沒有看到**任何「企業版才有」的開關或付費功能程式碼。官方網站 app.ironcalc.com 就是 `webapp/app.ironcalc.com/` 這份程式碼。README 寫的是「歡迎企業把 MIT/Apache 的試算表整合進自己的 SaaS」。是否另有商業服務：未確認（不在 repo 內）。

---

## 3. 技術棧與執行需求

| 層 | 內容 | 位置 |
|---|---|---|
| 計算引擎 | Rust（edition 2021），crate `ironcalc_base` v0.9.1；依賴 `serde`、`chrono`、`bitcode`（二進位序列化）、`csv`、`statrs`（統計分佈）、`regex`／`regex-lite` | [`base/Cargo.toml`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/Cargo.toml) |
| xlsx 讀寫 | Rust crate `ironcalc`；用 `zip` + `quick-xml` 自己解析／產生 OOXML | [`xlsx/Cargo.toml`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/xlsx/Cargo.toml) |
| 瀏覽器綁定 | `wasm-bindgen` + `wasm-pack --target web`，產出兩個 npm 套件：`@ironcalc/wasm`（只有引擎）與 `@ironcalc/wasm-xlsx`（多了 xlsx 匯入匯出） | [`bindings/wasm/Makefile`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/Makefile)、[`bindings/wasm/README.md`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/README.md) |
| Node.js 綁定 | napi-rs，npm `@ironcalc/nodejs` | [`bindings/nodejs/package.json`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/nodejs/package.json) |
| Python 綁定 | PyO3/maturin，`pip install ironcalc` | [`bindings/python/README.md`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/python/README.md) |
| 前端介面 | React 18/19 + TypeScript + Vite，Canvas 2D 繪製；`i18next`、`lucide-react` 為 peer 依賴；npm `@ironcalc/workbook` | [`webapp/IronCalc/package.json`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/package.json) |
| 官方網站後端（選用） | Rust Rocket + SQLite，只做「上傳 xlsx 轉 .ic」「下載 xlsx」「分享連結存檔」 | [`webapp/app.ironcalc.com/server/src/main.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/app.ironcalc.com/server/src/main.rs) |
| 本機儲存 | 官方網站前端把活頁簿存在瀏覽器 IndexedDB（偏好設定在 localStorage） | [`storage.ts`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/app.ironcalc.com/frontend/src/components/storage.ts) |
| 部署 | `Dockerfile` + `docker-compose.yml`（README：`docker compose up --build` 後開 `localhost:2080`）、Caddy 反向代理 | 根目錄、[`webapp/app.ironcalc.com/Caddyfile`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/app.ironcalc.com/Caddyfile) |

**執行需求白話：**
- **只用公式引擎（最推薦你的用法）：** 純前端，`npm install @ironcalc/wasm` 或從 CDN 載入，不需要伺服器、不需要資料庫、不需要 GPU。可直接放在 Firebase Hosting。
- **自己從原始碼編譯：** 需要 Rust 工具鏈、`wasm-pack`、Node/pnpm、Python（Makefile 會呼叫 python 腳本修 package.json）。一般用 npm 上的成品即可。
- **API Key／費用：** 完全不需要任何 API Key，沒有雲端費用。
- **wasm 檔案大小：** 未確認（本次只讀程式碼，沒有編譯；repo 內沒有記錄成品大小）。Makefile 註解說 xlsx 功能被拆到另一個套件，是為了「不需要匯入匯出的專案不用多付這份程式碼的體積」。

---

## 4. 程式架構地圖

```
IronCalc/
├── Cargo.toml                 # Rust workspace：base、xlsx、bindings/{wasm,python,nodejs}
├── base/                      # ★ 核心計算引擎 crate「ironcalc_base」（純 Rust，可編 wasm）
│   ├── examples/              # hello_world.rs、formulas_and_errors.rs
│   └── src/
│       ├── model.rs           # Model：活頁簿、set_user_input、to_bytes/from_bytes（4,233 行）
│       ├── evaluation.rs      # ★ 整本活頁簿的重算演算法（循環參照、動態陣列 spill、防爆堆疊）
│       ├── expressions/
│       │   ├── lexer/         # 公式斷詞（支援地區化、結構化參照 Table[Col]、spill 運算子 #）
│       │   └── parser/        # 公式解析成 AST（Node）、LAMBDA、公式搬移／平移、stringify
│       ├── functions/         # ★ 497 個 Excel 函數實作，依類別分資料夾
│       │   ├── mod.rs         # Function 列舉、名稱對照、evaluate_function 分派
│       │   ├── statistical/ financial/ engineering/ text/ logical/ lookup_and_reference/ …
│       │   ├── xlookup.rs  spill_functions.rs(SORT/FILTER/UNIQUE)  database.rs  subtotal.rs
│       ├── formatter/         # Excel 數字格式（"#,##0.00"、日期、條件格式碼）解析與輸出
│       ├── sheet_data/        # 儲存格的記憶體結構：以 1,024 列為一塊（chunk）的稀疏儲存
│       ├── conditional_formatting.rs + cf_types.rs  # 條件格式（色階、資料橫條、圖示集…）
│       ├── merged_cells.rs  cut_paste.rs  links.rs(超連結)  styles.rs  themes.rs
│       ├── language/ locale/  # 函數名翻譯（en/de/fr/it/es）、地區格式（CLDR）
│       ├── tz/                # 時區：瀏覽器用 Intl、桌面用 chrono-tz
│       ├── user_model/        # ★ 「使用者層」API：復原／重做、diff 佇列、剪貼簿、自動填滿、UI 狀態
│       └── test/              # 300 個 Rust 測試檔
├── xlsx/                      # crate「ironcalc」：.xlsx 匯入（import/）與匯出（export/）
│   ├── src/bin/xlsx_2_icalc.rs# 命令列：xlsx 轉 .ic
│   ├── examples/              # deep_chain.rs（100 萬列公式鏈）等範例
│   └── tests/calc_tests/      # 依函數類別放的 Excel 檔，對照 Excel 計算結果（約 225 個 xlsx）
├── bindings/
│   ├── wasm/                  # ★ 瀏覽器綁定：src/lib.rs（約 130 個 JS 方法）、types.ts（TS 型別）
│   ├── nodejs/                # Node.js 原生模組
│   └── python/                # Python 套件與範例（collaboration.py、csv_import.py…）
├── webapp/
│   ├── IronCalc/              # ★ React 試算表元件 @ironcalc/workbook
│   │   └── src/components/
│   │       ├── WorksheetCanvas/   # ★ Canvas 繪製（worksheetCanvas.ts 3,059 行、frameCells.ts）
│   │       ├── Workbook/          # 外框、鍵盤、複製貼上、對外動作 WorkbookActions
│   │       ├── Worksheet/         # 滑鼠／觸控（usePointer.ts）、右鍵選單
│   │       ├── Editor/ FormulaBar/ FormulaHelper/  # 儲存格編輯、公式列、函數提示（functions.json）
│   │       ├── Toolbar/ FormatMenu/ BorderPicker/ ColorPicker/
│   │       └── RightDrawer/       # 條件格式、命名範圍、命名樣式、佈景主題、地區設定
│   ├── app.ironcalc.com/      # 官方網站：frontend（IndexedDB 存檔、範本）＋ server（Rocket+SQLite）
│   └── embed.ironcalc.com/    # 嵌入版：embed.ts（iframe + postMessage）
├── generate_language/ generate_locale/   # 產生 language.bin / locales.bin 的工具
└── docs/                      # 文件網站（docs.ironcalc.com 的原始檔，含各函數說明）
```

---

## 5. 核心功能怎麼實作

### 5.1 公式解析（Lexer → Parser → AST）
- 位置：[`base/src/expressions/parser/mod.rs#L145`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/expressions/parser/mod.rs#L145)（`pub enum Node`）、[`#L271-L349`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/expressions/parser/mod.rs#L271-L349)（`Parser` 與 `parse()`）、lexer 在 [`base/src/expressions/lexer/mod.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/expressions/lexer/mod.rs)。
- 重點：手寫遞迴下降解析器（沒有用 parser generator）。支援跨工作表參照 `Sheet1!A1`、命名範圍、結構化參照（表格 `Table1[欄]`）、動態陣列 spill 運算子 `A1#`、隱含交集 `@`、LAMBDA／LET。lexer 支援地區化（例如德文用 `;` 當參數分隔、`,` 當小數點），測試在 `lexer/test/test_locale.rs`。
- 另有 `move_formula.rs`、`displace.rs` 處理「插入／刪除列欄、剪下貼上時公式參照自動調整」。

### 5.2 函數庫（497 個）
- 位置：[`base/src/functions/mod.rs#L29`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/functions/mod.rs#L29)（`pub enum Function`）、[`#L1620`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/functions/mod.rs#L1620)（`into_iter() -> IntoIter<Function, 497>`）、[`#L2313`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/functions/mod.rs#L2313)（`evaluate_function` 分派）。
- **怎麼數的：** 我把 `pub enum Function {` 到 `}` 之間的內容取出，排除註解與空行，數「大寫開頭、逗號結尾」的列舉成員，得到 **497**；程式碼裡 `into_iter()` 的陣列長度型別也寫死 `497`，兩者一致。按原始碼中的分類註解統計：

| 類別 | 數量 | 代表函數 |
|---|---|---|
| 邏輯 | 19 | IF、IFS、SWITCH、LET、LAMBDA、MAP、REDUCE、SCAN、BYROW |
| 數學與三角 | 82 | SUM、SUMIFS、SUMPRODUCT、ROUND、MROUND |
| 資訊 | 22 | ISNUMBER、ISBLANK、ERROR.TYPE |
| 查閱與參照 | 32 | VLOOKUP、XLOOKUP、XMATCH、INDEX、MATCH、OFFSET、INDIRECT、HSTACK、TAKE |
| 動態陣列 | 2 | SEQUENCE、RANDARRAY |
| 文字 | 46 | TEXT、TEXTSPLIT、CONCAT、REGEXEXTRACT/REPLACE/TEST |
| 統計 | 105 | AVERAGEIFS、PERCENTILE、NORM.DIST、T.TEST、LINEST、FORECAST |
| 相容舊名（包裝＋別名） | 37 | NORMDIST、STDEVP、PERCENTILE（舊版）… |
| 日期時間 | 25 | DATE、EDATE、EOMONTH、NETWORKDAYS 類、DATEDIF |
| 財務 | 55 | PMT、NPV、IRR、XIRR、折舊、債券 |
| 工程 | 55 | BESSEL、進位轉換、位元運算、複數、CONVERT（原始碼把 SUBTOTAL 也排在「工程：其他」底下） |
| 資料庫 | 17（其中 5 個 CORREL/RSQ/INTERCEPT/SLOPE/STEYX 實為統計函數，只是排在最後） | DSUM、DAVERAGE、DCOUNT |

  → 扣掉 37 個為了相容舊 Excel 檔的「舊名」，獨立的現代函數約 **460 個**。前端函數說明檔 [`functions.json`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/FormulaHelper/functions.json) 有 492 個鍵（我用 Python `len(json)` 數的）。
- **Excel 相容度怎麼保證：** [`xlsx/tests/calc_tests/`](https://github.com/ironcalc/IronCalc/tree/bec55e1e9ba33be147166cd52ed968a89f650a04/xlsx/tests/calc_tests) 依類別放了約 225 個在 Excel 裡算好的 .xlsx（我從檔案清單按資料夾數：統計 50、數學 34、財務 29、文字 22、查閱 21、日期 20…），`build.rs` 會自動為每個檔產生測試，比對 IronCalc 算出來的值與 Excel 存的快取值。這是相容度的主要證據；實際相容百分比未確認。

### 5.3 重算引擎（依賴圖／循環參照）
- 位置：[`base/src/evaluation.rs#L1-L40`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/evaluation.rs#L1-L40)（演算法說明）、[`#L519-L555`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/evaluation.rs#L519-L555)（`Model::evaluate`）。
- 重點：**沒有預先建好的依賴圖做「只算受影響的格子」**。每次 `evaluate()` 是「整本活頁簿全部公式重算」：用遞迴從上往下算，碰到正在算的格子就判定循環參照（顯示 `#CIRC!`）。動態陣列（SORT、FILTER 會溢出到旁邊格子）若被提前讀到，會「放棄這一輪、把該陣列排到讀它的格子前面再重來」，並記住順序，下次一次算完。遞迴太深時會「展開再重播」，避免堆疊爆掉（`xlsx/examples/deep_chain.rs` 示範 100 萬列連鎖公式）。
- 自己的 hash 函數（`KeyHasher`）是為了效能，註解說預設 hasher 佔了五分之一的計算時間。
- **重要：** 使用者層 `set_user_input` 每改一格就呼叫一次完整重算（[`user_model/common.rs#L436-L470`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/common.rs#L436-L470)、[`#L2315-L2319`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/common.rs#L2315-L2319) `evaluate_if_not_paused`）。大量寫入時請先 `pauseEvaluation()`、寫完再 `resumeEvaluation()` + `evaluate()`。

### 5.4 儲存格資料結構
- 位置：[`base/src/types.rs#L113-L123`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/types.rs#L113-L123)（`Workbook`）、[`#L227-L246`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/types.rs#L227-L246)（`Worksheet`）、[`#L352`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/types.rs#L352)（`enum Cell`）、[`base/src/sheet_data/chunks.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/sheet_data/chunks.rs)。
- 重點：格式跟 Excel 內部很像——字串放共用字串表（`shared_strings`），每格只存 `si`（字串索引）與 `s`（樣式索引）；公式格存公式索引 `f` 與計算結果。列以 1,024 列為一塊按需配置（稀疏），所以 104 萬列 × 16,384 欄的上限不會吃光記憶體（[`constants.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/constants.rs) 的 `LAST_ROW = 1_048_576`、`LAST_COLUMN = 16_384`）。
- 存檔：`to_bytes()` = `bitcode::encode(&workbook)`（[`model.rs#L3572-L3574`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/model.rs#L3572-L3574)），是**二進位**，不是 JSON。

### 5.5 使用者層：復原／重做、協作 diff
- 位置：[`base/src/user_model/history.rs#L25`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/history.rs#L25)（`enum Diff`，約 47 種操作）、[`common.rs#L334-L430`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/common.rs#L334-L430)（undo/redo、`flush_send_queue`、`apply_external_diffs`）。
- 重點：每個動作都記成「舊值／新值」的 diff list，用來復原重做，同時放進 `send_queue`。`flushSendQueue()` 把佇列編成 bytes 拿出來，另一端 `applyExternalDiffs(bytes)` 套用 → 兩份 model 保持同步。這就是官方說的「協作機制」（範例 [`bindings/python/docs/examples/collaboration.py`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/python/docs/examples/collaboration.py)）。**但它不是 OT 也不是 CRDT**，沒有衝突合併邏輯，也沒有附任何同步伺服器。

### 5.6 剪貼簿、自動填滿
- 複製貼上（engine）：[`base/src/user_model/clipboard.rs#L135`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/clipboard.rs#L135)（copy）、[`#L188`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/clipboard.rs#L188)（內部貼上，含公式平移）、[`#L699-L710`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/clipboard.rs#L699-L710)（`paste_csv_string`，用 `csv` crate、分隔符是 Tab）。
- 前端：[`Workbook.tsx#L863-L944`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/Workbook/Workbook.tsx#L863-L944)：依序找 `application/json`（同一個 app 內複製）→ `text/plain`（從 Excel／Google 試算表貼過來的 TSV）→ 其他（`text/html` 標註「NOT IMPLEMENTED」）。
- 自動填滿：[`autofill.rs#L354`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/autofill.rs#L354)（`auto_fill_rows`）、[`#L533`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/autofill.rs#L533)（`auto_fill_columns`），搭配 [`sequence_detector.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/sequence_detector.rs)（806 行）偵測 1,2,3／星期／月份等序列。

### 5.7 Canvas 繪製
- 位置：[`worksheetCanvas.ts#L458-L475`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/WorksheetCanvas/worksheetCanvas.ts#L458-L475)（`setContext`，依 `devicePixelRatio` 放大避免模糊）、[`#L564`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/WorksheetCanvas/worksheetCanvas.ts#L564)（`getVisibleCells`）、[`#L2794`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/WorksheetCanvas/worksheetCanvas.ts#L2794)（`renderSheet`）、[`frameCells.ts#L1-L15`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/WorksheetCanvas/frameCells.ts#L1-L15)。
- 重點：只畫看得到的格子；每一格不是逐一跨 wasm 呼叫，而是一次用 `getCellsBlock()`（[`cells_block.rs#L85`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/cells_block.rs#L85)）抓整個可見區塊的文字＋去重後的樣式，減少 JS↔wasm 往返。凍結窗格分成四個 pane 畫。

### 5.8 xlsx 匯入匯出
- 匯入：[`xlsx/src/import/mod.rs#L171`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/xlsx/src/import/mod.rs#L171)（`load_from_xlsx_bytes`）；匯出：[`xlsx/src/export/mod.rs#L64-L76`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/xlsx/src/export/mod.rs#L64-L76)（`save_to_xlsx`、`save_xlsx_to_writer`）。
- 瀏覽器版：[`bindings/wasm/src/lib.rs#L160-L176`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/src/lib.rs#L160-L176)（`Model.fromXlsx`）、[`#L1091-L1097`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/src/lib.rs#L1091-L1097)（`toXlsx`），只在 `@ironcalc/wasm-xlsx` 套件中提供。
- 匯出時寫入：sharedStrings、styles、workbook、theme、各 worksheet、metadata（動態陣列用）。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| **公式引擎（整包 wasm）** | [`bindings/wasm/src/lib.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/src/lib.rs) | 無（npm `@ironcalc/wasm` 現成） | **低** | 直接 `import init, { Model }`，當你倉儲系統的「公式計算服務」；介面自己畫（或接 Glide Data Grid／AG Grid 等表格元件） |
| xlsx 讀寫（瀏覽器） | 同上 `fromXlsx` / `toXlsx` | npm `@ironcalc/wasm-xlsx` | **低** | 匯入供應商報價單、匯出對帳表；取代 SheetJS 的「讀寫＋算公式」部分 |
| 差異同步（diff 佇列） | [`user_model/common.rs#L404-L430`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/common.rs#L404-L430) | 引擎內建 | **中** | `flushSendQueue()` 的 bytes 寫進 Firestore 子集合，其他裝置 `onSnapshot` 收到後 `applyExternalDiffs()`；要自己處理順序與衝突 |
| Canvas 試算表 UI（React） | [`webapp/IronCalc/`](https://github.com/ironcalc/IronCalc/tree/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc) | React、i18next、lucide-react | **中** | 有 React 的專案直接 `<IronCalc model={model} />`；純 JS 專案改用 embed（iframe）或自己包一層 React root |
| iframe 嵌入器 | [`webapp/embed.ironcalc.com/src/embed.ts`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/embed.ironcalc.com/src/embed.ts) | 官方或自架的 embed 頁 | **低**（只顯示）／**中**（要回傳資料需改 App.tsx 加訊息） | 純 JS 網頁一行 `<script>` 就能放；要「存回 Firebase」得自己在 iframe 端加 `postMessage` 回傳 `toBytes()` |
| Excel 數字格式器 | [`base/src/formatter/`](https://github.com/ironcalc/IronCalc/tree/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/formatter) | 純 Rust | **中**（要自己編 wasm） | 想讓自家系統顯示 `#,##0.00`、`yyyy/mm/dd` 跟 Excel 一致時參考／移植 |
| 序列偵測（拖拉填滿） | [`base/src/user_model/sequence_detector.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/sequence_detector.rs) | 純 Rust | **中** | 邏輯可讓 Claude 翻成 JS，用在你自己的表格 |
| IndexedDB 多活頁簿存檔 | [`webapp/app.ironcalc.com/frontend/src/components/storage.ts#L567-L578`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/app.ironcalc.com/frontend/src/components/storage.ts#L567-L578) | 瀏覽器 IndexedDB | **低** | 參考「每秒檢查 diff 佇列、有變更才存」的自動存檔做法，改寫成存 Firestore |
| xlsx→.ic 轉檔伺服器 | [`webapp/app.ironcalc.com/server/src/main.rs#L106-L122`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/app.ironcalc.com/server/src/main.rs#L106-L122) | Rocket、SQLite | **低**（但你用 wasm-xlsx 就不需要） | 可改成 Cloud Run 上的轉檔 API |
| Python 批次報表 | [`bindings/python/`](https://github.com/ironcalc/IronCalc/tree/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/python) | `pip install ironcalc` | **低** | 每日排程：讀廣告後台匯出的 xlsx → 計算 → 輸出有公式的 xlsx |

---

## 7. AI／Claude 整合

- **沒有任何 AI 功能。** 我在 `.rs/.ts/.tsx/.py/.json/.md/.toml` 檔中搜尋 `openai`、`anthropic`、`claude`、`llm`、`mcp`，結果為零。沒有 prompt、沒有 MCP server、沒有 Skills。
- **能不能接 Claude？可以，而且很適合當「Claude 的計算工具」。** 建議做法：
  1. 用 Node.js 綁定（`@ironcalc/nodejs`）或 Python 綁定寫一個小型 MCP server，提供 `set_cell`、`get_cell`、`evaluate`、`export_xlsx` 這幾個工具，讓 Claude 寫公式、由 IronCalc 算出正確數字（避免 LLM 算術出錯）。
  2. 在你的倉儲網頁裡：Claude（透過你自己的後端呼叫 API）產生公式字串 → 前端 `model.setUserInput(0, row, col, "=...")` → `getFormattedCellValue` 顯示結果。
  3. 函數說明 JSON [`functions.json`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/FormulaHelper/functions.json) 可以拿來當 Claude 的系統提示詞參考，讓它只用 IronCalc 支援的函數。
- 與 AI 影片／腳本生成無關。

---

## 8. 擴充方式與 API

**8.1 瀏覽器 JS API（`Model`，約 130 個方法，完整清單在 [`bindings/wasm/src/lib.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/src/lib.rs)、型別在 [`types.ts`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/types.ts)）。** 常用：
- 建立：`new Model(name, locale, timezone, language)`（[`lib.rs#L134-L148`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/src/lib.rs#L134-L148)）、`Model.fromBytes(bytes, lang)`、`Model.fromXlsx(...)`
- 讀寫格：`setUserInput(sheet, row, col, text)`（[`#L588`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/src/lib.rs#L588)）、`getCellContent`（原始輸入／公式）、`getFormattedCellValue`（顯示值，[`#L616`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/src/lib.rs#L616)）、`getCellType`、`setUserArrayFormula`
- 計算控制：`pauseEvaluation`、`resumeEvaluation`、`evaluate`
- 結構：`insertRows/Columns`、`deleteRows/Columns`、`moveRows/Columns`、`newSheet`、`renameSheet`、`setFrozenRowsCount`…
- 樣式：`updateRangeStyle(area, "font.b", "true")`、`"num_fmt"`、`"fill.color"`、`"alignment.horizontal"`（路徑字串對照在 [`common.rs#L104-L151`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/common.rs#L104-L151)）
- 其他：`mergeCells`、`addConditionalFormatting`、`newDefinedName`、`setCellLink`、`copyToClipboard`／`pasteFromClipboard`／`pasteCsvText`、`undo`／`redo`、`toBytes`、`toXlsx`、`flushSendQueue`／`applyExternalDiffs`
- 座標慣例：**工作表從 0 開始、列與欄從 1 開始**。

**8.2 React 元件對外介面：** [`IronCalc.tsx`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/IronCalc.tsx) 接收 `model`、`themeVariables`、`canEdit`（false＝唯讀、隱藏工具列）；透過 ref 取得 `IronCalcHandle.workbook`（[`workbookActions.ts`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/Workbook/workbookActions.ts)），可程式呼叫 `undo/copy/paste/toggleBold/setNumberFormat/insertRowsAbove/downloadSelectionAsPng/refresh` 等。

**8.3 嵌入 API：** `IronCalcEmbed.mount(target, { workbookBytes, theme, style, src })` 與 `IronCalcEmbed.setTheme(iframe, theme)`（[`embed.ts`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/embed.ironcalc.com/src/embed.ts)）。目前**只有「送進去」的訊息**，沒有「資料改了通知外面」或「把檔案傳出來」的訊息（見 [`embed App.tsx`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/embed.ironcalc.com/src/App.tsx) 的訊息型別）。

**8.4 自訂函數：** **沒有**註冊 JS／Rust 自訂函數的外掛 API。替代方案：(a) 用 `LAMBDA` 搭配命名範圍定義自己的函數（引擎支援 LAMBDA／LET）；(b) fork 後在 `functions/mod.rs` 的 enum、名稱對照、`evaluate_function` 三處加一個函數（要自己編 wasm）。

---

## 9. 程式品質與風險

- **維護狀況：** 最新 commit 就在掃描當天（2026-11-04，訊息 `fix(CONCAT): update number_to_text doctest…`）。版本 0.9.1，尚未 1.0（`base/src/lib.rs` 文件註明 1.0 前建議用 git 依賴）。README 自承「社群還不大、正在徵求協作者」。主要作者 Nicolás Hatcher。因為是淺層 clone，提交頻率與貢獻者人數未確認。
- **測試：** Rust 測試很密——`base/src/test/` 有 300 個測試檔，`base/src` + `xlsx` 中 `#[test]` 共 2,936 個（`grep '#\[test\]' | wc -l`）；另有約 225 個 Excel 對照檔。CI（[`build-test.yaml`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/.github/workflows/build-test.yaml)）跑 lint、Rust 測試，還會在 `wasm32-wasip2` 目標上跑引擎測試；有 codecov。前端有 vitest 與 Canvas 截圖比對測試（`tests/worksheetCanvas/`）。
- **資安／隱私：** 引擎純本地運算、不連網。官方網站前端存 IndexedDB；只有「上傳 xlsx」「下載 xlsx」「分享」會打到官方伺服器（[`rpc.ts`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/app.ironcalc.com/frontend/src/components/rpc.ts)），分享的檔案以雜湊存進 SQLite（任何拿到連結的人都能讀）。若你要放敏感成本資料，請用 `@ironcalc/wasm-xlsx` 在瀏覽器本地轉檔，不要走官方伺服器。
- **遙測：** 在 webapp 原始碼中搜尋 `analytics/gtag/plausible/posthog/sentry`，沒有找到。
- **已知的坑：**
  1. **wasm README 範例的建構子是錯的。** [`README.pkg.md`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/README.pkg.md) 與 [`test.html`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/test.html) 寫 `new Model('en', 'UTC')`，但實際建構子需要 4 個參數 `(name, locale, timezone, language)`。請以本資料包範例為準。
  2. **每次輸入都整本重算**，沒有增量重算。數萬個公式的活頁簿逐格寫入會慢；批次寫入一定要 `pauseEvaluation()`。
  3. **貼上 Excel 只吃純文字（TSV）**，格式、框線、顏色不會一起過來；`text/html` 貼上未實作。
  4. **嵌入版拿不到使用者改過的資料**（沒有回傳訊息），要存回 Firebase 必須改 embed 的 App.tsx 或改用 React 元件／自己的 UI。
  5. **不支援的 Excel 內容在匯入後會遺失**：圖表、樞紐分析表、資料驗證、圖片。我在 `xlsx/src/import/` 搜尋 `drawing/chart/pivot/dataValidation` 都沒有結果；註解（comments）會被讀入，但匯出程式中沒看到寫回 worksheet 註解的程式碼（未完全確認）。
  6. **語系只有 en、en-GB、de、es、fr、it**（[`generate_locale/locales_list.json`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/generate_locale/locales_list.json)），沒有 zh-TW；日期格式中的月份／星期名稱不會是中文。儲存格內容打中文沒問題（Unicode）。
  7. 0.x 版本，API 仍可能變動。

---

## 10. 跟其他專案組合的建議

- **IronCalc（公式引擎）＋ 你自己的純 JS 表格 UI 或 Glide Data Grid／AG Grid（畫面）＋ Firestore（存資料）：** 這是最符合你現況的組合。表格元件負責顯示與編輯，IronCalc 負責算公式與讀寫 xlsx，Firestore 存每列商品資料（JSON）。好處是倉儲資料仍是你熟悉的 Firestore 文件，只有「計算欄位」交給 IronCalc。
- **IronCalc ＋ SheetJS：** SheetJS 社群版擅長「讀各種格式（xls、csv、ods）」但不算公式；IronCalc 擅長算公式＋xlsx。可用 SheetJS 讀舊 .xls → 轉成值寫進 IronCalc → 計算 → `toXlsx` 輸出。
- **IronCalc vs Univer／Luckysheet：** 若你需要「圖表、篩選、資料驗證、協作」這些完整 Google 試算表級的功能，Univer 比較完整（但體積大、部分功能在付費版）；IronCalc 的強項是「公式相容度、Rust 品質、授權最寬鬆」。可以考慮 **Univer 當介面＋IronCalc 當後端驗算／批次計算**，或反過來只在需要時用 IronCalc。
- **IronCalc ＋ Claude：** 包成 MCP 工具，讓 Claude 在幫你做「報價單、成本試算、廣告 ROAS 報表」時，數字由引擎算、Claude 只負責寫公式和解讀結果。

---

## 11. 網頁 Excel 能力檢查表

**渲染與效能**
- **渲染方式：有，Canvas 2D。** [`worksheetCanvas.ts#L458-L475`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/WorksheetCanvas/worksheetCanvas.ts#L458-L475)：`canvas.getContext("2d")`，依 devicePixelRatio 放大。編輯器、選單是 DOM（React）。
- **虛擬捲動：有。** 只計算／繪製可見格（[`getVisibleCells` #L564](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/WorksheetCanvas/worksheetCanvas.ts#L564)），並以 `getCellsBlock` 一次抓整塊資料（[`frameCells.ts`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/WorksheetCanvas/frameCells.ts)）。
- **10 萬列以上效能：未確認（未實測）。** 儲存結構是 1,024 列一塊的稀疏陣列（[`sheet_data/chunks.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/sheet_data/chunks.rs)），繪製只畫可見範圍，所以「顯示大量資料」理論上沒問題；但每次編輯都全量重算（見 5.3），公式很多時編輯會變慢。`xlsx/examples/deep_chain.rs` 示範 100 萬列連鎖公式不會爆堆疊，但沒有公開數字。

**公式引擎**
- **函數數量：有，497 個（含 37 個舊版相容名稱，現代函數約 460 個）。** 計算方式見 5.2；[`functions/mod.rs#L29`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/functions/mod.rs#L29)。
- **解析器：有，** [`expressions/parser/mod.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/expressions/parser/mod.rs)（手寫遞迴下降）。
- **依賴圖／重算：有重算，但沒有增量依賴圖。** [`evaluation.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/evaluation.rs) 每次整本遞迴重算，偵測循環參照（`#CIRC!`）、處理動態陣列順序。
- **陣列公式：有。** 舊式 CSE 陣列公式（`setUserArrayFormula`）與動態陣列 spill（SORT、FILTER、UNIQUE、SEQUENCE、TEXTSPLIT…，[`spill_functions.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/functions/spill_functions.rs)）；`getCellArrayStructure` 回報某格是陣列錨點或子格。
- **跨工作表參照：有。** README 範例 `=SUM(Sheet1!A1:CV100)`；parser 的 `ReferenceKind { sheet_name, … }`（[`parser/mod.rs#L145-L150`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/expressions/parser/mod.rs#L145-L150)）。跨「檔案」的外部參照：未確認。
- **自訂函數：沒有外掛 API；可用 LAMBDA＋命名範圍替代。** LAMBDA 實作在 [`functions/logical/lambda.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/functions/logical/lambda.rs)。

**編輯操作**
- **儲存格編輯：有。** [`Editor/Editor.tsx`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/Editor/Editor.tsx)、公式列 [`FormulaBar.tsx`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/FormulaBar/FormulaBar.tsx)、函數自動完成 [`formulaCompletion.ts`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/FormulaHelper/formulaCompletion.ts)。
- **複製貼上：有（從 Excel／Google 試算表只貼得進純文字值）。** [`Workbook.tsx#L863-L944`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/Workbook/Workbook.tsx#L863-L944)：外部來源走 `text/plain` → `pasteCsvText`（Tab 分隔）；同一 app 內走 `application/json`，公式與樣式都保留。`text/html` 未實作。
- **拖拉填滿：有。** [`autofill.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/autofill.rs)＋序列偵測。
- **復原／重做：有。** [`user_model/history.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/history.rs)（diff list 堆疊）。

**格式**
- **數字格式：有。** Excel 格式碼解析器 [`base/src/formatter/`](https://github.com/ironcalc/IronCalc/tree/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/formatter)，UI [`FormatMenu/`](https://github.com/ironcalc/IronCalc/tree/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/FormatMenu)（含自訂格式）。
- **條件格式：有。** 引擎 [`conditional_formatting.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/conditional_formatting.rs)（1,758 行）；UI 有一般規則、色階、資料橫條、圖示集（[`RightDrawer/ConditionalFormatting/`](https://github.com/ironcalc/IronCalc/tree/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/RightDrawer/ConditionalFormatting)）；Canvas 繪製在 [`cfRenderer.ts`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/WorksheetCanvas/cfRenderer.ts)；xlsx 也會匯入匯出。
- **合併儲存格：有。** [`user_model/merged_cells.rs#L21`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/merged_cells.rs#L21)（合併、置中合併、跨欄合併、向下合併、取消）。
- **凍結窗格：有。** `setFrozenRowsCount/ColumnsCount`；Canvas 分 pane 繪製。
- **欄寬列高：有。** `setColumnsWidth`、`setRowsHeight`、隱藏列欄；輸入多行文字時會自動加高列（[`common.rs#L436-L470`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/common.rs#L436-L470)）。
- **篩選：沒有（UI）。** 搜尋 `autoFilter` 只在 xlsx 表格匯入時出現；只能用 `=FILTER()` 函數。
- **排序：沒有（UI）。** 只有 `=SORT()`／`=SORTBY()` 函數。
- **資料驗證（下拉選單）：沒有。** 全 repo 原始碼搜尋 `dataValidation/data_validation` 為零。
- 另有：框線、字型、顏色、佈景主題、命名樣式、超連結、網格線開關、深色模式。

**圖表／樞紐／圖片**
- **圖表：沒有。**（搜尋 `chart` 只出現在條件格式的資料橫條 UI。）
- **樞紐分析：沒有。**
- **圖片／附件：沒有。** 只有「把選取範圍下載成 PNG」（`downloadSelectionAsPng`）。

**匯入匯出**
- **.xlsx：開源版有。** 自己用 `zip`＋`quick-xml` 實作，不靠第三方試算表函式庫。瀏覽器用 `@ironcalc/wasm-xlsx` 的 `fromXlsx/toXlsx`；保真度：值、公式、樣式、合併、凍結、條件格式、命名範圍、表格、超連結會處理；圖表、樞紐、資料驗證、圖片會遺失。約 225 個 Excel 對照檔確保公式結果一致。
- **.csv：部分有。** 引擎可 `pasteCsvText`（Tab 分隔）匯入文字；Python 範例 [`csv_import.py`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/python/docs/examples/csv_import.py) 示範用 `paste_csv_string` 讀 CSV。沒有看到「匯出 .csv 檔」的 API；複製時會產生 `csv` 文字（[`Workbook.tsx` onCopy](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/Workbook/Workbook.tsx#L946-L984)）。
- **原生格式 .ic：** bitcode 二進位，`toBytes/fromBytes`。

**多人即時協作**
- **沒有現成的即時協作；只有同步零件。** `flushSendQueue()`／`applyExternalDiffs()` 交換 diff（[`common.rs#L404-L430`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/user_model/common.rs#L404-L430)）。不是 OT、不是 CRDT、沒有鎖定機制、沒有附同步伺服器；同時改同一格時誰後到誰贏、順序要自己保證。官方網站的「分享」只是把檔案存一份快照到 SQLite（[`server/src/main.rs#L77-L97`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/app.ironcalc.com/server/src/main.rs#L77-L97)）。

**資料模型與存進 Firestore**
- **內部不是 JSON，是 bitcode 二進位。** 結構（Rust 型別，[`types.rs#L113-L123`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/types.rs#L113-L123)）用 JSON 表示大約像這樣：
  ```json
  {
    "name": "成本試算",
    "shared_strings": ["品名", "進價", "保溫杯"],
    "worksheets": [{
      "name": "Sheet1", "frozen_rows": 1,
      "sheet_data": { "1": { "1": {"t":"SharedString","si":0,"s":0}, "2": {"t":"SharedString","si":1,"s":0} },
                      "2": { "1": {"t":"SharedString","si":2,"s":0}, "2": {"t":"NumberCell","v":120,"s":0},
                             "3": {"t":"CellFormula","f":0,"s":1} } },
      "shared_formulas": ["=B2*1.05"]
    }],
    "styles": {"…": "…"}, "settings": {"tz": "Asia/Taipei", "locale": "en"}
  }
  ```
  （示意，欄位名取自 `types.rs`，實際 bytes 無法直接讀成 JSON。）
- **存進 Firestore 的建議做法：**
  1. **整本存：** `model.toBytes()` → `Uint8Array` → Firestore `Bytes` 欄位（單一文件上限 1 MiB；大的放 Firebase Storage，Firestore 只放路徑與更新時間）。讀回用 `Model.fromBytes(bytes, "en")`。
  2. **要能查詢的欄位另外存：** 用 `getCellContent`／`getFormattedCellValue` 迴圈把需要的欄位（品名、成本、毛利）抄成一般 Firestore 文件，方便你的倉儲系統搜尋。
  3. **自動存檔：** 照官方網站的做法，每秒呼叫一次 `flushSendQueue()`，長度不是 1（空佇列編碼後長度為 1）就存一次（[`App.tsx#L176-L195`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/app.ironcalc.com/frontend/src/App.tsx#L176-L195)）。

**手機／觸控、繁體中文**
- **手機／觸控：有。** [`usePointer.ts#L50-L60`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/components/Worksheet/usePointer.ts#L50-L60)：手指拖動＝平移、點一下＝選取、長按後拖＝框選；官方網站另有 [`MobileMenu.tsx`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/app.ironcalc.com/frontend/src/components/Navigation/MobileMenu.tsx)。實際手機體驗未實測。
- **繁體中文介面：沒有。** UI 語系檔只有 de/en/es/fr/it（[`webapp/IronCalc/src/locale/`](https://github.com/ironcalc/IronCalc/tree/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/locale)），函數名翻譯也只有這 5 種（[`generate_language/src/languages.json`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/generate_language/src/languages.json)）。自己加 `zh_tw.json`（`en_us.json` 約 400 多個字串）可行，屬於低難度工作；地區格式（zh-TW 日期）需要重新產生 `locales.bin`，難度中。時區 `Asia/Taipei` 在瀏覽器版可用（用 `Intl.DateTimeFormat` 驗證，[`tz/browser_tz.rs`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/base/src/tz/browser_tz.rs)）。

**嵌入純 JavaScript 網頁（不用 React／Vue）**
- **有兩條路：**
  - **(A) 只要公式引擎（推薦你用）**——`@ironcalc/wasm` 是 `wasm-pack --target web` 產物，主檔 `wasm.js`（由 [`Makefile`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/bindings/wasm/Makefile) 與 `test.html` 的 `./pkg/wasm.js` 推得）：
    ```html
    <!doctype html>
    <meta charset="utf-8">
    <table id="t"></table>
    <script type="module">
      // CDN 路徑與 npm 上的實際版本號未實測，請先確認 @ironcalc/wasm 最新版
      import init, { Model } from "https://cdn.jsdelivr.net/npm/@ironcalc/wasm@0.9.1/wasm.js";
      await init();
      const m = new Model("成本試算", "en", "Asia/Taipei", "en"); // 4 個參數！
      m.pauseEvaluation();                        // 批次寫入先暫停重算
      m.setUserInput(0, 1, 1, "進價");  m.setUserInput(0, 1, 2, "120");
      m.setUserInput(0, 2, 1, "運費");  m.setUserInput(0, 2, 2, "15");
      m.setUserInput(0, 3, 1, "成本");  m.setUserInput(0, 3, 2, "=ROUND(B1*1.05+B2,0)");
      m.setUserInput(0, 4, 1, "售價");  m.setUserInput(0, 4, 2, "=B3/(1-0.35)");
      m.resumeEvaluation(); m.evaluate();
      for (let r = 1; r <= 4; r++) {
        document.getElementById("t").insertAdjacentHTML("beforeend",
          `<tr><td>${m.getFormattedCellValue(0, r, 1)}</td><td>${m.getFormattedCellValue(0, r, 2)}</td></tr>`);
      }
      // 存檔：const bytes = m.toBytes();  → Firestore Bytes / Storage
    </script>
    ```
  - **(B) 要完整試算表畫面**——iframe 嵌入（[`embed.ironcalc.com/README.md`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/embed.ironcalc.com/README.md)、[`example.html`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/embed.ironcalc.com/example.html)）：
    ```html
    <script src="https://embed.ironcalc.com/embed.js"></script>
    <div id="sheet"></div>
    <script>
      IronCalcEmbed.mount("#sheet", { theme: "light", style: { width: "100%", height: "600px" } });
    </script>
    ```
    限制：用的是官方網域的 iframe，**拿不到編輯後的資料**；要存回 Firebase 須自架 `embed.ironcalc.com` 並修改 App.tsx 增加回傳訊息。
- **套件大小：未確認。** 沒有編譯；`@ironcalc/workbook` 還需要 React、i18next、lucide-react 這些 peer 依賴。

**API／事件**
- **用程式讀寫儲存格：有。** `setUserInput`／`getCellContent`／`getFormattedCellValue`／`getCellsBlock`（見第 8 節）。
- **監聽變更：沒有事件回呼。** 替代做法是輪詢 `flushSendQueue()`（官方網站每秒一次），或在你自己的 UI 中呼叫 `setUserInput` 時順便觸發你的邏輯。React 元件也沒有 `onChange` 屬性（[`IronCalc.tsx`](https://github.com/ironcalc/IronCalc/blob/bec55e1e9ba33be147166cd52ed968a89f650a04/webapp/IronCalc/src/IronCalc.tsx) 只接收 `model/themeVariables/rootContainer/canEdit`）。

---

## 關鍵字
IronCalc、網頁版 Excel、試算表引擎、公式引擎、Excel 公式相容、WebAssembly、wasm、Rust、瀏覽器計算、xlsx 匯入匯出、xlsx 讀寫、Canvas 試算表、虛擬捲動、動態陣列、XLOOKUP、LAMBDA、條件格式、凍結窗格、合併儲存格、復原重做、diff 同步、協作、IndexedDB、Firestore、嵌入試算表、iframe embed、React 試算表元件、Python 試算表、Node.js 試算表、成本計算、報價單、MIT、Apache-2.0、spreadsheet engine、formula engine、Excel compatible、web spreadsheet、wasm spreadsheet、xlsx parser、ironcalc_base、@ironcalc/wasm、@ironcalc/wasm-xlsx、@ironcalc/workbook
