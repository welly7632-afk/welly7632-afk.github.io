# ruilisi/fortune-sheet — Luckysheet 的 TypeScript＋React 改寫版，MIT 授權的「開箱即用」網頁試算表元件
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：9434660
> GitHub：https://github.com/ruilisi/fortune-sheet｜⭐ 3748｜授權：MIT（內含 fork 自 handsontable/formula-parser 的公式解析器，同為 MIT）｜主要語言：TypeScript｜最近更新：2025-12-15

> 本資料包所有程式碼位置都以 commit `94346608877db4747406707a177c4b8f3bacdbf9`（= tag `v1.0.4`，master HEAD，commit 日期 2025-11-06）為準。GitHub 顯示最近 push 是 2025-12-15，但 master 的最新 commit 是 2025-11-06，推測 12 月的 push 發生在其他分支（遠端共 20 個分支，未逐一檢查）。
> 本次只「讀」程式碼，沒有安裝、建置或執行；所有「效能」「體積」相關的結論都是讀碼推論，標示為未實測。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：FortuneSheet 是把中國開源專案 Luckysheet 整個翻寫成 TypeScript、拿掉 jQuery、改用 React＋immer 管理狀態的網頁試算表元件；Canvas 繪製、有公式、條件格式、篩選排序、資料驗證下拉、凍結、圖片、註解、協作用的 `Op` 事件，授權是寬鬆的 MIT。

**對你（台灣、自己用 Claude 寫倉儲／庫存網頁、Firebase）可以拿來做什麼：**

1. **庫存表／進貨表的「Excel 介面」**：把你倉儲 App 裡的商品清單直接用試算表呈現，讓你可以像 Excel 一樣直接改數量、成本、售價，旁邊用公式算毛利（`=SUMIF`、`=VLOOKUP` 等由 formulajs 提供）。
2. **比價／成本試算頁**：一個工作表放各通路價格、一個工作表算成本，用跨工作表參照（`Sheet2!A1`）串起來。程式碼裡有處理 `工作表名!儲存格` 的邏輯（見第 5 節）。
3. **存進 Firebase**：元件會把「每一次使用者操作」用 `onOp` 吐出 JSON（類似 JSON Patch），你可以把它寫進 Firestore；也可以在 `onChange` 拿整本活頁簿的 JSON 存起來。
4. **繁體中文介面現成**：內建 `zh-TW` 語系檔（`locale/zh_tw.ts`），工具列、右鍵選單、函數說明都有繁中。
5. **當作「拆零件」的來源**：它的格子繪製（`canvas.ts`）、數字格式（`ssf.js`／`format.ts`）、從 Excel 貼上 HTML 表格的解析（`events/paste.ts`）、`Op` 協作協定（`utils/patch.ts`）都可以單獨抽出來參考。

**不適合的地方**：開源版本身「沒有」xlsx 匯入匯出（要另裝第三方外掛 FortuneExcel）、沒有圖表、沒有樞紐分析、沒有真正的動態陣列公式；協作只是「廣播 op」，沒有 OT／CRDT 衝突解決。它是 **React 元件**，要嵌進你的純 JavaScript 網頁得一起載入 React。

---

## 2. 授權白話

- **授權**：根目錄 [`LICENSE`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/LICENSE) 是 MIT，版權人「Suzhou Ruilisi Technology Co., Ltd」（蘇州瑞立思）。`packages/formula-parser/LICENSE` 也是 MIT（版權人 Handsoncode，即 Handsontable 公司；這個子套件是 fork 他們的舊 `formula-parser`）。三個 `package.json`（root、core、react）都寫 `"license": "MIT"`。
- **個人使用**：完全沒問題，可自由使用、修改。
- **公司商用**：MIT 允許商用、修改、閉源再散布，唯一義務是「保留原本的版權聲明與授權全文」（例如放在你的 `THIRD_PARTY_LICENSES` 或網頁的「開源授權」頁）。不需要公開你自己的程式碼。
- **依賴的授權**：core 依賴 `dayjs`、`immer`、`lodash`、`numeral`、`uuid`、`@formulajs/formulajs`；這些在業界普遍為 MIT，但本次沒有下載它們的原始碼核對授權檔，**未確認**。
- **有沒有付費版／閉源功能**：在 repo 內**沒找到**任何付費版、授權金鑰或「Pro 功能」的開關。README 的 badge 寫「maintained by xiemala」（同公司的產品），但沒有看到開源版被刻意閹割的跡象。xlsx 匯入匯出外掛 FortuneExcel 是第三方（`corbe30/fortuneexcel`）的另一個 repo，其授權本次未掃描，**未確認**。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | TypeScript（core、react）；formula-parser 是 JavaScript＋Jison 文法 |
| 前端框架 | React 18（`peerDependencies: react >= 18.2`）。README 的 Roadmap 寫「Support Vue」但沒打勾，repo 內**沒有** Vue 套件 |
| 狀態管理 | `immer`（`produceWithPatches` 產生 patch，用來做復原／重做與協作 op） |
| 繪圖 | HTML5 Canvas 2D（儲存格區、欄列標頭），對話框／工具列／編輯框是 React DOM |
| 公式 | `@fortune-sheet/formula-parser`（fork 自 handsontable/formula-parser，Jison 文法）＋ `@formulajs/formulajs` 提供函數實作 |
| 後端 | **不需要**。純前端元件。協作範例 `backend-demo/` 用 Node.js＋Express＋`ws`（WebSocket）＋MongoDB |
| 資料庫 | 不綁定。範例用 MongoDB；你可以改成 Firebase Firestore／Realtime Database |
| 部署 | 打包成 npm 套件 `@fortune-sheet/react`、`@fortune-sheet/core`（目前版本 1.0.4），用 webpack／Vite 等打包進你的網站，靜態部署（Firebase Hosting 可） |
| 硬體／GPU | 不需要 GPU；一般瀏覽器即可 |
| API Key／費用 | **不需要任何 API Key**，無雲端服務費用。只有你自己若架協作伺服器才有主機費 |
| 建置工具 | lerna monorepo、father-build（rollup）、storybook 當示範；`packages/react/.fatherrc.js` 有設定輸出 UMD（`umd: { minFile: true }`） |

---

## 4. 程式架構地圖

```
fortune-sheet/
├── packages/
│   ├── core/                     # 與框架無關的試算表核心（@fortune-sheet/core）
│   │   └── src/
│   │       ├── canvas.ts         # ★ Canvas 繪製：欄列標頭、儲存格、框線、溢出文字（2700 行）
│   │       ├── context.ts        # 全域狀態 Context（目前工作表、選取、捲動位置、各種快取）
│   │       ├── settings.ts       # ★ 所有設定項＋Hooks 型別＋預設工具列／右鍵選單
│   │       ├── types.ts          # ★ 資料模型：Op、Cell、Sheet、Selection、Presence
│   │       ├── api/              # 程式化 API（getCellValue、setCellValue、insertRowOrColumn…）
│   │       ├── events/           # 鍵盤（keyboard.ts）、滑鼠（mouse.ts 5459 行）、複製（copy.ts）、貼上（paste.ts）
│   │       ├── modules/          # 各功能模組
│   │       │   ├── formula.ts        # ★ 公式輸入、解析、calcChain、重算入口（3556 行）
│   │       │   ├── formulaHelper.ts  # ★ 公式依賴圖與重算順序
│   │       │   ├── cell.ts           # 儲存格更新 updateCell、取值、樣式
│   │       │   ├── format.ts / ssf.js# 數字／日期格式（ssf = SheetJS 的格式化器）
│   │       │   ├── ConditionFormat.ts# 條件格式（色階、資料橫條、圖示集、規則）
│   │       │   ├── dataVerification.ts # 資料驗證（下拉、核取方塊、數字範圍、身分證…）
│   │       │   ├── filter.ts / sort.ts # 篩選、排序
│   │       │   ├── freeze.ts / merge.ts# 凍結窗格、合併儲存格
│   │       │   ├── dropCell.ts       # 拖拉填滿（fill handle，3036 行）
│   │       │   ├── image.ts / comment.ts / hyperlink.ts # 圖片、註解、超連結
│   │       │   ├── searchReplace.ts / splitColumn.ts / locationCondition.ts # 尋找取代、資料剖析、定位條件
│   │       │   ├── protection.ts     # 工作表保護（唯讀列／欄、鎖定儲存格）
│   │       │   ├── screenshot.ts     # 選取範圍截圖
│   │       │   └── mobile.ts         # 觸控捲動
│   │       ├── locale/           # en、zh、zh_tw、es、hi、ru 六種語系，每檔約 1.2 萬行（含函數說明）
│   │       └── utils/patch.ts    # ★ immer patch ↔ Op 互轉（協作／存檔核心）
│   ├── react/                    # React 元件層（@fortune-sheet/react）
│   │   └── src/components/
│   │       ├── Workbook/index.tsx # ★ 最外層元件：初始化資料、undo/redo、emit onOp/onChange
│   │       ├── Workbook/api.ts    # ★ ref 暴露的 43 個 API（含 applyOp）
│   │       ├── Sheet/、SheetOverlay/ # Canvas 容器與上層互動層（選取框、編輯框、捲軸）
│   │       ├── Toolbar/          # 工具列（1517 行，含插入圖片 FileReader）
│   │       ├── ContextMenu/      # 右鍵選單、篩選選單
│   │       ├── FxEditor/         # 公式列＋名稱方塊
│   │       ├── ConditionFormat/、DataVerification/、SearchReplace/、SplitColumn/ … 各功能對話框
│   │       └── SheetTab/、SheetList/、ZoomControl/
│   └── formula-parser/           # fork 的 handsontable/formula-parser（Jison 文法＋運算子）
│       └── src/
│           ├── grammar-parser/grammar-parser.jison # 公式文法
│           ├── parser.js         # Parser 類別：parse、setFunction、callCellValue 事件
│           ├── supported-formulas.js # 支援函數＝formulajs 所有匯出
│           └── evaluate-by-operator/  # 運算子與函數分派
├── backend-demo/                 # 協作伺服器範例：index.js（Express+WebSocket+MongoDB）、op.js（把 Op 轉成 Mongo 更新）
├── stories/                      # Storybook 範例（Features、API、Collabration）
├── docs/                         # VuePress 文件（英文＋簡中）：api.md、op.md、cell.md、sheet.md、config.md
└── CHANGELOG.md、README.md、README-zh.md
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| Canvas 只畫可視範圍 | [`canvas.ts#L511-L650`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/canvas.ts#L511-L650) | `drawMain` 用 `_.sortedIndex(visibledatarow, scrollHeight)` 二分搜尋找出畫面上第一列／最後一列，只迴圈這個範圍呼叫 `cellRender`。`visibledatarow`／`visibledatacolumn` 是「每列底邊累計像素」陣列 |
| 儲存格繪製 | [`canvas.ts#L1792`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/canvas.ts#L1792) | `cellRender` 處理背景、文字對齊、換行、旋轉、條件格式；`cellOverflowRender`（L2307）處理文字溢出到隔壁格 |
| 公式解析 | [`formula-parser/src/parser.js#L1-L80`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/formula-parser/src/parser.js#L1-L80) | Jison 產生的 `GrammarParser`；儲存格／範圍取值透過 `emit("callCellValue")`、`emit("callRangeValue")` 交給外部 |
| 取值與跨工作表 | [`formula.ts#L114-L189`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/formula.ts#L114-L189) | `FormulaCache` 建構時註冊 `callCellValue`／`callRangeValue`；若有 `sheetName` 就用 `getSheetIdByName` 找到別的工作表 → 跨工作表參照有支援。整欄／整列（`A:A`）會轉成 0～資料長度 |
| 公式執行 | [`formula.ts#L1053-L1128`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/formula.ts#L1053-L1128) | `execfunction` 呼叫 parser，結果若是 Date 轉字串；把公式格登記到 `calcChain`。**sparklines 與 dynamicArray 的回傳整段被註解掉了** |
| 依賴圖＋重算 | [`formula.ts#L1214-L1314`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/formula.ts#L1214-L1314)、[`formulaHelper.ts#L196-L324`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/formulaHelper.ts#L196-L324) | `execFunctionGroup` 註解寫得很清楚：1. 取所有公式（calcChain）2. 記錄被改的格 3. `formulaCellInfoMap` 快取每個公式依賴的範圍 4. 建立 parent 關係圖 5. `getFormulaRunList` 深度優先排出受影響公式 6. `executeAffectedFormulas` 依序重算 |
| 輸入儲存格 | [`cell.ts#L683`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/cell.ts#L683) | `updateCell` 判斷是否公式（`=` 開頭）→ `execfunction`；否則依格式 `genarate` 推斷數字／日期 |
| 復原／重做 | [`Workbook/index.tsx#L261-L410`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/Workbook/index.tsx#L261-L410) | 每次狀態變更用 immer `produceWithPatches` 取得 patches＋inversePatches 推入 `undoList`；undo 就 `applyPatches(inversePatches)`。快捷鍵 Ctrl/Cmd+Z、Ctrl+Shift+Z、Ctrl+Y（L606-L630） |
| 協作 Op | [`utils/patch.ts#L166-L240`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/utils/patch.ts#L166-L240)、[`#L379`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/utils/patch.ts#L379) | `patchToOp` 把 immer patch 的 `["luckysheetfile", 索引, ...]` 改成 `{id: 工作表id, path: [...]}`；插入／刪除列欄另產生特殊 op `insertRowCol`／`deleteRowCol`。`opToPatch` 反向轉回 |
| 套用遠端 Op | [`Workbook/api.ts#L44`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/Workbook/api.ts#L44) | `applyOp(ops)`：`opToPatch` 後套 patch，特殊 op 呼叫 `insertRowCol`／`deleteRowCol`／`addSheet` |
| 從 Excel／網頁貼上 | [`events/paste.ts#L1535-L1720`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/events/paste.ts#L1535-L1720) | 讀 `text/html`，有 `<table>` 就丟進暫存 div 解析 `tr/td`、`colspan/rowspan`（轉合併）、`<style>` 的 class 樣式（背景、粗體、斜體、框線、列高）；沒有表格就讀 `text/plain`（以 Tab／換行切） |
| 數字格式 | [`format.ts#L66`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/format.ts#L66)、[`ssf.js`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/ssf.js) | `genarate` 自動判斷輸入型別；`ssf.js`（1917 行）是 SheetJS 的 Excel 格式碼引擎，支援 `#,##0.00`、`yyyy-MM-dd` 之類 |
| 拖拉填滿 | [`dropCell.ts#L2273`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/dropCell.ts#L2273) | `updateDropCell` 處理數列遞增、日期、公式相對參照位移（最新 commit #742 正是修 fill handle 參照錯誤） |
| 初始化資料 | [`Workbook/index.tsx#L143-L180`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/Workbook/index.tsx#L143-L180) | 傳入的稀疏 `celldata` 會被展開成「列數×欄數」的密集二維陣列 `data`（`_.times(lastRowNum, () => _.times(lastColNum, () => null))`） |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整個 Workbook 元件（直接用） | [`packages/react/src/components/Workbook/index.tsx`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/Workbook/index.tsx) | React 18、@fortune-sheet/core | 低 | 不拆，直接 `npm i @fortune-sheet/react`，在你的倉儲 App 開一個頁面掛上去 |
| Op 協作／存檔協定 | [`packages/core/src/utils/patch.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/utils/patch.ts)、[`types.ts#L4-L16`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/types.ts#L4-L16) | immer、lodash | 中 | 參考它「immer patch → 帶 sheet id 的 op」的設計，套到你自己 App 的任何狀態（例如庫存異動紀錄），可直接寫 Firestore |
| MongoDB 版 op 套用器 | [`backend-demo/op.js`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/backend-demo/op.js) | mongodb | 低 | 請 Claude 依此改寫成 Firestore 版（`insertRowCol` 需要把 r/c ≥ 某值的格子全部 +N，Firestore 要用批次寫入） |
| 協作伺服器範例 | [`backend-demo/index.js`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/backend-demo/index.js) | express、ws、mongodb | 低 | 約 120 行，示範 WebSocket 廣播 op 與 presence（顯示其他人游標）。可換成 Firestore `onSnapshot` |
| Excel 數字格式引擎 | [`packages/core/src/modules/ssf.js`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/ssf.js) | 無（獨立 JS） | 低 | 在你的價格表、報表直接用 Excel 格式碼顯示金額。原出處是 SheetJS 的 SSF（Apache-2.0，檔內授權註記本次未逐行確認） |
| Excel HTML 貼上解析 | [`events/paste.ts#L1685-L1960`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/events/paste.ts#L1685-L1960) | lodash、內部 Context | 中 | 抽出「HTML table → 二維陣列＋樣式＋合併」這段，讓你的庫存 App 支援「從 Excel 複製一整塊貼進來批次匯入」 |
| 公式解析器 | [`packages/formula-parser/`](https://github.com/ruilisi/fortune-sheet/tree/94346608877db4747406707a177c4b8f3bacdbf9/packages/formula-parser) | @formulajs/formulajs、tiny-emitter | 低 | 可獨立使用：`new Parser()`、`parser.on("callCellValue", …)`、`parser.setFunction("毛利", fn)`。注意上游 handsontable 已宣告此專案棄用並改推 HyperFormula |
| 公式依賴圖重算 | [`formulaHelper.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/formulaHelper.ts) | 內部 Context、formula.ts | 高 | 跟 Context 綁得很緊，比較適合「看懂思路」而非直接搬 |
| Canvas 格子繪製 | [`packages/core/src/canvas.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/canvas.ts) | Context、format、ConditionFormat | 高 | 想自己寫輕量表格時可參考「visibledatarow 累計陣列＋sortedIndex」的可視範圍算法 |
| 資料驗證（下拉） | [`dataVerification.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/dataVerification.ts)、[`DataVerification/DropdownList.tsx`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/DataVerification/DropdownList.tsx) | Context | 中 | `validateCellData`（L155）的規則判斷邏輯可借來做表單驗證 |
| 繁中函數說明 | [`locale/zh_tw.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/locale/zh_tw.ts) | 無 | 低 | 371 個函數的繁中名稱、說明、參數範例，可直接拿來做你自己的公式提示 |

---

## 7. AI／Claude 整合

- **沒有任何 AI 功能**。在 `packages/core/src`、`packages/react/src` 以 `fetch(`、`XMLHttpRequest`、`axios`、`http(s)://` 搜尋，只找到超連結補 `https://` 與註解中的網址，**沒有呼叫任何外部 API、沒有模型、沒有 prompt、沒有 MCP／Skills**。
- **能不能接 Claude**：可接（需自己做）。可行路線：
  1. **自訂工具列按鈕**：`Settings.customToolbarItems`（[`settings.ts#L150-L157`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/settings.ts#L150-L157)）放一個「AI 整理」按鈕 → 用 ref API `getCellsByRange` 讀選取範圍 → 送到你自己的後端（Firebase Cloud Functions）呼叫 Claude → 用 `setCellValuesByRange` 寫回。**API Key 一定要放後端，不能放前端**。
  2. **AI 自訂函數**：公式解析器的 `Parser.setFunction(name, fn)`（[`parser.js#L134`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/formula-parser/src/parser.js#L134)）支援自訂函數，但 FortuneSheet 沒把 parser 暴露成公開 API（它在 `ctx.formulaCache.parser`），且公式是**同步**計算，無法直接 await Claude；要做 `=AI(...)` 得改 core 原始碼並自行處理非同步回填。
  3. **讓 Claude 產生 Op**：因為 `applyOp` 吃的是簡單 JSON（`{op, id, path, value}`），可以請 Claude 依你的指令產生 op 陣列，再由前端 `applyOp` 套用（例如「把 C 欄所有成本 ×1.05」）。

---

## 8. 擴充方式與 API

- **ref API（共 43 個）**：我把 [`Workbook/api.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/Workbook/api.ts) 中 `generateAPIs` 回傳物件的頂層鍵逐一列出：`applyOp, getCellValue, setCellValue, clearCell, setCellFormat, autoFillCell, freeze, insertRowOrColumn, deleteRowOrColumn, hideRowOrColumn, showRowOrColumn, setRowHeight, setColumnWidth, getRowHeight, getColumnWidth, getSelection, getFlattenRange, getCellsByFlattenRange, getSelectionCoordinates, getCellsByRange, getHtmlByRange, setSelection, setCellValuesByRange, setCellFormatByRange, mergeCells, cancelMerge, getAllSheets, getSheet, addSheet, deleteSheet, updateSheet, activateSheet, setSheetName, setSheetOrder, scroll, addPresences, removePresences, handleUndo, handleRedo, calculateFormula, dataToCelldata, celldataToData, batchCallApis`（41 個＋L323-L324 的 `handleUndo`、`handleRedo`）。文件在 `docs/guide/api.md`。
- **事件**：
  - `onChange(data: Sheet[])`：整本活頁簿任何變動後觸發（[`Workbook/index.tsx#L449`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/Workbook/index.tsx#L449)）。
  - `onOp(ops: Op[])`：每次可復原的操作吐出差異（[`#L182-L193`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/Workbook/index.tsx#L182-L193)）。
  - `hooks`（[`settings.ts#L5-L123`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/settings.ts#L5-L123)）：`beforeUpdateCell`（回傳 false 可阻止寫入，適合做權限）、`afterUpdateCell`、`afterSelectionChange`、`beforePaste`、各種 `before/afterRender*`（可在 Canvas 上自己畫東西，例如庫存不足畫紅點）、`beforeCellMouseDown`、註解與工作表新增／刪除／改名的 before/after。
- **設定**：`Settings`（[`settings.ts#L125-L159`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/settings.ts#L125-L159)）可設 `allowEdit`、`showToolbar`、`showFormulaBar`、`toolbarItems`（挑選要顯示哪些按鈕）、`cellContextMenu`、`lang`、`currency`（預設 `"¥"`，台灣請改 `"NT$"`）、`customToolbarItems`。
- **自訂函數**：見第 7 節，需改原始碼。

---

## 9. 程式品質與風險

- **維護狀況**：我用 `git fetch --deepen=200` 抓了 master 最近 486 個 commit 統計年度：2023 年 225 個、2024 年 190 個、2025 年 71 個 → **活躍度明顯下降**。2025 年的 commit 多是 dependabot 升級、俄文語系、無障礙改善、fill handle 修正。主要維護者 Sanchit Agarwal（168 個 commit）、gazedreamily（64）、zyc9012（44）、Shashank Agarwal（42）。tag v1.0.0～v1.0.4 都存在，v1.0.4 即本次掃描版本。屬於「還有人在修 bug、但沒在加大功能」的狀態。
- **文件過時**：README 自己寫「Some part of Storybook is outdated」「Some topics in documentation is outdated」；`CHANGELOG.md` 停在 v0.5.6，沒記錄 1.x。
- **測試**：自己數檔案數：`packages/core/test` 27 個檔（含 3 個 factories）、`packages/react/test` 1 個、`packages/formula-parser/test` 40 個。CI（`.github/workflows/ci.yml`）在 PR 時跑 `tsc`、`lint`、`jest`。以 core 3 萬多行程式碼來說測試覆蓋偏薄，滑鼠（5459 行）、canvas、公式重算幾乎靠手測。
- **遙測／隱私**：搜尋後沒有任何對外連線、分析或追蹤程式碼。資料完全留在瀏覽器，存哪由你決定。
- **資安**：
  - 貼上時 `ele.innerHTML = txtdata`（[`paste.ts#L1686-L1687`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/events/paste.ts#L1685-L1690)）把剪貼簿 HTML 放進未掛載的 div；在瀏覽器中 `<img onerror>` 這類內容在未掛載元素上仍可能被觸發，**理論上有自我 XSS 風險**（未實測）。core＋react 原始碼中我數到 33 處 `innerHTML =`（`grep -rn "innerHTML\s*="`，排除 locale）。自己用風險不高，做給別人用要加 DOMPurify 之類消毒。
  - 圖片以 base64 Data URL 存在 `sheet.images[].src`（Toolbar 用 `FileReader.readAsDataURL`，[`Toolbar/index.tsx#L865-L885`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/Toolbar/index.tsx#L865-L885)）→ 存 Firestore 會很快撞到單一文件 1 MB 上限。
- **已知的坑**：
  1. **資料是密集二維陣列**：`celldata` 進來後被展開成「列×欄」全部填 `null` 的陣列（第 5 節）。`onChange` 給你的 `data` 也是這種格式。存檔前要用 `dataToCelldata` 轉回稀疏格式。
  2. **Firestore 不能存「陣列裡的陣列」**：`data`（`CellMatrix`）是巢狀陣列，Firestore 不支援，**必須轉成 `celldata`**（物件陣列）或自己改成 `{ "r_c": cell }` map。
  3. **預設右鍵選單有 `chart`、`data`、`cell-format`**（[`settings.ts#L223-L246`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/settings.ts#L223-L246)），但 [`ContextMenu/index.tsx`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/react/src/components/ContextMenu/index.tsx) 裡沒有對應處理分支（我 grep `name === "…"` 只找到 copy／paste／insert／delete／hide／set-height／set-width／clear／sort／orderAZ／orderZA／filter／image／link）→ 這三項不會出現或沒作用。
  4. **貨幣預設 `¥`**，請設定 `currency: "NT$"`。
  5. **所有語系一起打包**：6 個語系檔原始碼合計約 2.46 MB（`ls -l` 加總），會讓 bundle 變大（實際壓縮後大小未確認）。
  6. 公式解析器上游（handsontable/formula-parser）README 已標示 deprecated。
  7. 協作沒有衝突解決（見第 11 節）。

---

## 10. 跟其他專案組合的建議

- **最適合的角色**：「我要一個 React、MIT、繁中、功能夠用、可以自己存 Firebase 的試算表」→ FortuneSheet 是輕量首選之一。比原版 Luckysheet 乾淨（沒 jQuery、不污染 `window`、可多實例）。
- **xlsx 匯入匯出**：搭配第三方 FortuneExcel 外掛（README 連結 `corbe30/fortuneexcel`，本次未掃描），或自己用 SheetJS／ExcelJS 讀 xlsx 後轉成 `celldata`（`{r, c, v: {v, m, ct, bg, bl…}}`）。這個轉換很適合請 Claude Code 寫。
- **公式更強**：若要大量 Excel 相容函數、陣列公式、具名範圍，可考慮把公式層換成 HyperFormula（GPL／商用授權，要注意）或改用 Univer（Apache-2.0，功能更完整但更重）。
- **圖表**：FortuneSheet 沒圖表 → 在旁邊用 ECharts／Chart.js 讀 `getCellsByRange` 的資料自己畫。
- **協作**：要多人同時編輯又不想自己處理衝突，可把 op 改走 Yjs（CRDT）或乾脆用 Firestore「一格一文件」＋最後寫入勝出。
- **你的倉儲 App 組合範例**：庫存清單（Firestore）→ 轉 `celldata` 餵給 FortuneSheet → `hooks.beforeUpdateCell` 限制只能改「數量／成本」欄 → `onOp` 把改動寫回 Firestore 對應商品文件 → 自訂工具列按鈕「AI 估價」呼叫 Cloud Function＋Claude。

---

## 11. 網頁 Excel 能力檢查表

### 渲染與效能
- **渲染方式：有，Canvas 2D**。儲存格與欄列標頭用 Canvas 繪製，對話框等用 React DOM。[`canvas.ts#L111-L160`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/canvas.ts#L111-L160) 有 `drawRowHeader`、`drawColumnHeader`、`drawMain`，並依 `devicePixelRatio` 縮放。
- **虛擬捲動：有**。只繪製可視列欄（[`canvas.ts#L603-L650`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/canvas.ts#L603-L650)），捲軸是自製 `SheetOverlay/ScrollBar`。
- **10 萬列以上效能：未確認（未實測），讀碼判斷有風險**。資料模型是密集二維陣列（10 萬列×60 欄＝600 萬個陣列槽），`visibledatarow` 也是每列一個元素；每次編輯都經 immer `produceWithPatches`，`onChange` 會把整本 `luckysheetfile` 傳出；公式重算 `execFunctionGroup` 會掃過所有公式建圖。數千～一兩萬列應可用，10 萬列以上建議先實測。

### 公式引擎
- **函數數量：未確認實際可計算數；說明清單 371 個**。
  - 怎麼數：函數「實作」來自 [`supported-formulas.js`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/formula-parser/src/supported-formulas.js)：`Object.keys(formulajs)`，也就是 `@formulajs/formulajs`（^2.9.3）的全部匯出；這個套件不在 repo 內，本次不能安裝，所以**實際可算的函數數未確認**。
  - 函數「說明清單」：我用 Python 擷取 [`locale/zh_tw.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/locale/zh_tw.ts#L9) 的 `functionlist` 陣列中縮排 6 格的 `n: "…"`，得到 **371 個不重複函數名**（`en.ts` 為 372 個，多一個 `REMOTE`）。其中 Luckysheet 特有的 `LINESPLINES` 等迷你圖、`DATA_CN_STOCK_*` 股票、`DM_TEXT_*` 斷詞函數，我在 core／formula-parser 原始碼（排除 locale）搜尋不到實作 → 這些會出現在提示裡但大概算不出來（未實測）。
- **解析器位置：有**。Jison 文法 [`grammar-parser.jison`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/formula-parser/src/grammar-parser/grammar-parser.jison)、[`parser.js`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/formula-parser/src/parser.js)。
- **依賴圖／重算：有**。[`formula.ts#L1214-L1314`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/formula.ts#L1214-L1314)＋[`formulaHelper.ts#L241`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/formulaHelper.ts#L241)（`getFormulaRunList`）；只重算受影響的公式。另有 `forceCalculation` 設定可強制全算（註解寫「公式較多會有性能問題，慎用」）。
- **陣列公式（動態陣列溢出）：沒有（實質停用）**。[`formula.ts#L1112-L1124`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/formula.ts#L1112-L1124) 回傳 `dynamicArrayItem` 的程式被整段註解，因此 `cell.ts` 中 `v.length === 4` 的處理永遠不會觸發。`SORT`、`FILTER`、`UNIQUE` 雖在說明清單中，但結果不會溢出到多格（未實測）。
- **跨工作表參照：有**。[`formula.ts#L52-L56`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/formula.ts#L52-L56) 的正則支援 `Sheet1!` 與 `'加引號的名稱'!`，取值時以 `getSheetIdByName` 找工作表（L127-L131）。**注意**：不加引號的工作表名稱只允許 `[A-Za-z0-9_\u00C0-\u02AF]`（L52），**中文工作表名稱要寫成 `'庫存'!A1` 加單引號**，否則可能無法辨識（未實測）。
- **自訂函數：沒有公開 API**。底層 `Parser.setFunction` 存在（[`parser.js#L134`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/formula-parser/src/parser.js#L134)），需透過內部 `ctx.formulaCache.parser` 或改原始碼才用得到。

### 編輯
- **儲存格編輯：有**。`SheetOverlay/InputBox.tsx` 是浮在 Canvas 上的 contentEditable 編輯框，公式列 `FxEditor/`；輸入公式時有函數提示（`SheetOverlay/FormulaHint`、`FormulaSearch`）與範圍選取高亮。
- **複製貼上：有；可從 Excel／Google 試算表貼上（含基本樣式）**。[`paste.ts#L1685-L1960`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/events/paste.ts#L1685-L1960) 解析 HTML 表格的值、合併、背景色、粗斜體、框線、列高；否則退回純文字。**貼上圖片的程式被註解掉**（L2005-L2011 `// imageCtrl.insertImg`）。Google 試算表的 HTML 格式是否完整吃得進去未實測。
- **拖拉填滿：有**。[`dropCell.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/dropCell.ts)（3036 行），含數列、日期、公式參照位移。
- **復原／重做：有**。immer inversePatches，見第 5 節；`handleUndo`／`handleRedo` 也暴露在 ref。

### 格式
- **數字格式：有**。[`ssf.js`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/ssf.js)＋[`format.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/format.ts)；工具列有貨幣、百分比、增減小數位、格式下拉（`FormatSearch` 對話框）。
- **條件格式：有**。[`ConditionFormat.ts#L251`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/ConditionFormat.ts#L251)（`compute`）、`getColorGradation`（色階），UI 在 `react/src/components/ConditionFormat/`。
- **合併儲存格：有**。[`merge.ts#L7`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/merge.ts#L7)，資料存在 `config.merge` 與格子的 `mc`。
- **凍結窗格：有**。[`freeze.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/freeze.ts)，`frozen.type` 支援 row／column／both／rangeRow／rangeColumn／rangeBoth（[`types.ts#L121-L160`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/types.ts#L121-L160)）。
- **欄寬列高：有**。`config.columnlen`／`config.rowlen`，API `setRowHeight`／`setColumnWidth`；也支援隱藏列欄。
- **篩選：有**。[`filter.ts#L207`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/filter.ts#L207)（`createFilter`）；可依值、依顏色篩選，「依條件篩選」在預設選單中被註解掉。
- **排序：有**。[`sort.ts#L118`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/sort.ts#L118)（`sortSelection`）＋ `CustomSort` 對話框（多欄排序）。
- **資料驗證（下拉選單）：有**。[`dataVerification.ts#L69`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/dataVerification.ts#L69)（`getDropdownList`）、L155 `validateCellData`；另有核取方塊、數字／日期範圍、文字長度、身分證（中國格式）等規則。

### 圖表、樞紐、圖片
- **圖表：沒有**。README Roadmap 的 charts 未打勾；右鍵選單的 `chart` 沒有實作分支。
- **樞紐分析：沒有**。Roadmap 未打勾；`pivotTable` 相關程式都是註解或 `TODO`（例如 `selection.ts#L917`）。
- **圖片：有（浮動圖片）**。[`image.ts#L77`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/image.ts#L77)（`insertImage`），可移動縮放，以 base64 存在 `sheet.images`。儲存格內圖片、附件：沒有。
- 另有：註解（comment.ts）、超連結（hyperlink.ts）、尋找取代、資料剖析、定位條件、選取範圍截圖、工作表保護。

### 匯入匯出
- **.xlsx：開源版本體沒有**。在 core／react 原始碼搜尋 `xlsx`／`csv` 只在 locale 字串出現；README 指向第三方外掛 FortuneExcel（未掃描，保真度未確認）。
- **.csv：沒有**。可以自己用 `getCellsByRange`／`getAllSheets` 產生 CSV，或請 Claude 寫一個 20 行的轉換函式。

### 多人即時協作
- **有基本協作，但沒有 OT／CRDT／鎖定**。機制：本地操作 → `onOp` → 你把 op 傳給伺服器 → 伺服器套用到資料庫並 `broadcastToOthers` → 其他人 `applyOp`（[`backend-demo/index.js#L69-L110`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/backend-demo/index.js#L69-L110)、[`stories/Collabration.stories.tsx#L29-L60`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/stories/Collabration.stories.tsx#L29-L60)）。伺服器不做轉換或版本比對，兩人同時改同一格就是「後到的覆蓋」；同時插入列可能造成位置錯亂（未實測）。
- **需要什麼伺服器**：範例是 Node.js＋`ws`＋MongoDB。也有 `addPresences`／`removePresences` 顯示其他人選取位置。改成 Firebase：可用 Firestore 的一個 `ops` 子集合＋`onSnapshot` 取代 WebSocket（需自己寫）。

### 資料模型
- 型別在 [`types.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/types.ts)：`Sheet`（L121）、`Cell`（L39-L60）、`Op`（L4-L16）。格子的欄位用 Luckysheet 縮寫：`v` 原始值、`m` 顯示值、`f` 公式、`ct` 格式（`fa` 格式碼、`t` 型別）、`bg` 背景、`bl` 粗體、`it` 斜體、`fc` 字色、`fs` 字號、`ht/vt` 對齊、`mc` 合併、`ps` 註解、`hl` 超連結。
- 範例（傳入用的稀疏格式）：

```json
[{
  "name": "庫存",
  "id": "sheet-inventory",
  "order": 0,
  "row": 200, "column": 10,
  "celldata": [
    { "r": 0, "c": 0, "v": { "v": "品名", "m": "品名", "bl": 1 } },
    { "r": 0, "c": 1, "v": { "v": "成本", "m": "成本", "bl": 1 } },
    { "r": 1, "c": 0, "v": { "v": "保溫杯", "m": "保溫杯" } },
    { "r": 1, "c": 1, "v": { "v": 120, "m": "120", "ct": { "fa": "#,##0", "t": "n" } } },
    { "r": 1, "c": 2, "v": { "f": "=B2*1.3" } }
  ],
  "config": { "columnlen": { "0": 160 } }
}]
```

- **怎麼存進 Firestore**：
  1. 讀檔時：Firestore 文件 → 上面這種 `celldata` → 傳給 `<Workbook data>`。
  2. 存檔時：`onChange` 收到的每個 sheet 的 `data` 是巢狀陣列，Firestore **不能存陣列中的陣列** → 用 ref 的 `dataToCelldata(sheet.data)`（[`api/common.ts#L9-L23`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/api/common.ts#L9-L23)）轉回 `celldata` 再存，並刪掉 `data` 欄位。
  3. 大表要避開 1 MB 文件上限：一個工作表一份文件，或把 `celldata` 依每 500 列切成多個文件；圖片改存 Cloud Storage、只存網址。
  4. 想省流量：改存 `onOp` 的差異（`path: ["data", r, c, ...]` 很容易對應到 `cells/{r_c}` 文件）。

### 手機與語系
- **手機／觸控：有基本支援**。[`mobile.ts#L11`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/modules/mobile.ts#L11) 處理觸控捲動慣性；`SheetOverlay` 有選取框觸控把手（`luckysheet-cs-touchhandle`）。Changelog v0.5.0 寫「Add support for touch gestures」。實際手機編輯體驗未實測。
- **繁體中文介面：有**。[`locale/index.ts`](https://github.com/ruilisi/fortune-sheet/blob/94346608877db4747406707a177c4b8f3bacdbf9/packages/core/src/locale/index.ts) 對應 `"zh-TW"` → `zh_tw.ts`；`lang` 不設時會讀 `navigator.languages[0]`，台灣瀏覽器多半自動是繁中。

### 嵌入方式
- **能不能嵌進純 JavaScript 網頁：可以，但一定要一起載入 React 18＋ReactDOM**（它就是 React 元件；repo 內沒有 Vue 或原生 JS 版本）。`packages/react/.fatherrc.js` 有輸出 UMD，但 UMD 的檔名與全域變數名稱本次無法從 npm 確認 → 下面用 ES module CDN 的寫法（**未實測**，版本號請固定）：

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortune-sheet/react@1.0.4/dist/index.css">
<div id="sheet" style="width:100%;height:600px"></div>
<script type="module">
  import React from "https://esm.sh/react@18.3.1";
  import { createRoot } from "https://esm.sh/react-dom@18.3.1/client";
  import { Workbook } from "https://esm.sh/@fortune-sheet/react@1.0.4?deps=react@18.3.1,react-dom@18.3.1";

  const ref = React.createRef();
  const data = [{ name: "庫存", celldata: [
    { r: 0, c: 0, v: { v: "品名", m: "品名" } },
    { r: 0, c: 1, v: { v: "成本", m: "成本" } },
  ]}];

  createRoot(document.getElementById("sheet")).render(
    React.createElement(Workbook, {
      ref, data, lang: "zh-TW", currency: "NT$",
      onOp: (ops) => console.log("op", ops),          // 存 Firestore 差異
      onChange: (sheets) => {                           // 存整本
        const plain = sheets.map(s => ({ ...s, celldata: ref.current.dataToCelldata(s.data), data: undefined }));
        console.log(plain);
      },
    })
  );
  // 程式寫入：ref.current.setCellValue(1, 0, "保溫杯");
</script>
```

- **套件大小：未確認**（本次不能下載 npm 套件）。供參考：core 原始碼（不含 locale）約 1.32 MB、react 元件原始碼約 0.54 MB、6 個語系檔約 2.46 MB（皆為未壓縮原始碼的 byte 數，用 `wc -c`／`ls -l` 加總），另加 React（約 45 KB gzip 級別，未確認）、lodash、immer、formulajs。預期壓縮後仍是數百 KB 級，比 Handsontable 社群版、x-spreadsheet 重，比 Univer 輕。

### API／事件
- **監聽變更：有**。`onChange`、`onOp`、`hooks.afterUpdateCell(row, col, oldValue, newValue)`、`hooks.beforeUpdateCell`（可攔截）、`afterSelectionChange`。
- **程式讀寫儲存格：有**。`getCellValue(r, c, {type: "v"|"m"|"f"…})`、`setCellValue`、`setCellValuesByRange`、`getCellsByRange`、`setCellFormat`、`calculateFormula`、`batchCallApis`（一次呼叫多個 API 合成一個 undo 步驟，未實測）。

---

## 關鍵字
fortune-sheet、FortuneSheet、Luckysheet、網頁試算表、網頁版 Excel、線上表格、React 試算表元件、spreadsheet、web spreadsheet、Excel-like、Canvas 渲染、虛擬捲動、公式引擎、formula-parser、formulajs、handsontable formula-parser、依賴圖重算、calcChain、跨工作表參照、條件格式、資料驗證、下拉選單、凍結窗格、合併儲存格、篩選、排序、拖拉填滿、fill handle、復原重做、immer patch、onOp、applyOp、多人協作、collaboration、WebSocket、MongoDB、Firestore、celldata、dataToCelldata、繁體中文 zh-TW、MIT 授權、xlsx 外掛 FortuneExcel、庫存表、成本試算、比價表
