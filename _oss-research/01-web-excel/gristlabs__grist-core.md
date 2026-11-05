# gristlabs/grist-core — 「試算表＋關聯式資料庫」混血的自架式網頁試算表伺服器（Python 公式）
> 資料包｜分類：網頁版 Excel／試算表｜掃描日期：2026-11-04｜commit：484236f
> GitHub：https://github.com/gristlabs/grist-core｜⭐ 12046｜授權：Apache-2.0（但預設安裝／預設 Docker 映像檔會附帶非開源的「完整版」擴充）｜主要語言：TypeScript｜最近更新：2026-11-04

本資料包所有程式碼連結都固定在 commit `484236f6abc960ed7dadade5c2b714465492a063`。以下內容是我實際打開檔案讀過才寫的；沒驗證到的一律標「未確認」。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** Grist 是「長得像試算表、骨子裡是資料庫」的完整網頁應用程式：每一欄有名稱和型別，公式用 Python 寫、整欄一起算，整份文件存成一個 SQLite 檔，用 Docker 一行就能自架。

它**不是**一個可以塞進你網頁的「試算表元件」（不像 Handsontable／Univer／Luckysheet 那種 npm 套件），而是一整套伺服器＋前端。對你最有用的用法：

1. **直接當你的「進銷存／比價／成本試算」後台**：在自己電腦或一台小 VPS 跑 `docker run gristlabs/grist-oss`，建「商品」「供應商報價」「庫存異動」「廣告花費」幾張表，用 Reference 欄位串起來，再用 Python 公式算毛利、最低報價、廣告 ROAS。官方模板也有 inventory、invoicing（README L141 之後的 Using Grist 段落）。
2. **當你倉庫 App 的資料來源或報表層**：你的 Firebase 純 JS App 可以透過 Grist REST API（`/api/docs/:docId/tables/:tableId/records`）讀寫資料，或用 webhook 把 Grist 的變更推到 Cloud Functions → Firestore。
3. **拆零件學做法**：DOM 虛擬捲動（`koDomScrolly.js`）、從 Excel／Google 試算表貼上的 HTML 表格解析（`parsePasteHtml`）、Python 依賴圖重算引擎（`depend.py` / `engine.py`）、用 exceljs 串流匯出 xlsx（`workerExporter.ts`）——這些都是你之後用 Claude Code 自己做網頁 Excel 時可以參考的實作。
4. **AI 公式助理可以換成 Claude**：開源版內建 OpenAI 相容的公式助理，README 有寫怎麼透過 OpenRouter 改用 Claude（見第 7 節）。

## 2. 授權白話

- **程式碼授權：Apache-2.0**（[LICENSE.txt](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/LICENSE.txt)、[package.json](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/package.json) `"license": "Apache-2.0"`、[NOTICE.txt](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/NOTICE.txt)）。
- **個人使用：** 完全可以，免費、可修改、可自架，沒有使用人數限制。
- **公司商用：** Apache-2.0 允許商用、修改、閉源再散布；要做的是保留 LICENSE 與 NOTICE 檔、在修改過的檔案註明有改過。Apache-2.0 也包含專利授權。拆出程式碼片段放進你自己的工具也 OK，只要保留版權聲明。
- **⚠ 重要的坑：開源版 vs 完整版（Full edition）**
  - 預設的 `gristlabs/grist` Docker 映像檔**包含非開源的擴充程式**（README「Available Docker images」[L250-L261](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L250-L261)），只在管理面板切成「Full Grist」時才會啟用。想要 100% 開源，請用 **`gristlabs/grist-oss`** 映像檔。
  - 從原始碼安裝時，若沒指定版本，`postinstall` 會**預設下載完整版擴充**（`grist-ee`）：[buildtools/install_edition.sh L28-L42](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/buildtools/install_edition.sh#L28-L42)「No edition selected; defaulting to full edition」。要純開源請先 `yarn run set-community-edition`。
- **付費／完整版才有的功能**（README「Features not in grist-core」[L101-L139](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L101-L139)）：GristConnect、Azure 儲存、稽核日誌串流、進階管理後台、**新版 Grist Assistant（可建表、改格式、改資料的 AI 助理）**、邀請通知信、文件變更／留言通知、Automations（觸發條件寄信／webhook）、OAuth Apps、**內建 MCP 伺服器**、OIDC／SAML 單一登入。README L105 寫明：完整版對個人與年度資金少於 100 萬美元的小組織免費（需啟用金鑰）。開源版本身就有：Python 公式、舊版 AI 公式助理、REST API、webhooks、表單、圖表、摘要表、權限規則、匯入匯出、留言、建議修改等。

## 3. 技術棧與執行需求

| 層 | 內容（依 package.json 與目錄確認） |
|---|---|
| 前端 | TypeScript，自家 UI 框架 **grainjs** ＋ 舊程式碼的 **knockout**、jQuery、Backbone；webpack 打包。圖表用 `plotly.js-basic-dist`、程式碼編輯器 `ace-builds`、行事曆 `@toast-ui/calendar`。不是 React／Vue。 |
| 後端 | Node.js（Dockerfile 用 `node:22-trixie`）＋ Express；WebSocket 用 `engine.io`／`ws`，也支援 HTTP long polling。 |
| 公式引擎 | **Python 3**（`sandbox/grist/`），Docker 用 `python:3.11-slim`；依賴 `astroid`、`asttokens`、`openpyxl 3.0.10`、`sortedcontainers` 等（[sandbox/requirements.txt](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/requirements.txt)）。在沙盒內執行：gVisor／macOS sandbox-exec／**Pyodide（WebAssembly，經 Deno 執行，Windows 也能用）**。 |
| 資料庫 | 每份文件 = 一個 **SQLite** 檔（`.grist`）；使用者／組織等「首頁資料庫」用 TypeORM，可用 SQLite 或 **PostgreSQL**（依賴有 `pg`、`typeorm`）；可選 **Redis**（多伺服器、session）；文件快照可存 **S3／MinIO**（`minio` 套件）。 |
| 部署 | `docker run -p 8484:8484 -v $PWD/persist:/persist -it gristlabs/grist-oss`，開 `http://localhost:8484`。另有 `docker-compose-examples/`（Traefik、Authelia、Keycloak+Postgres+Redis 等範例）。也有 `grist-desktop`（桌面版）、`grist-static`（純瀏覽器、無伺服器）兩個姊妹專案（本次未 clone，未驗證）。 |
| 硬體 | 不需 GPU。每份打開的文件會在伺服器起一個 Python 程序並把資料載入記憶體，所以 RAM 隨文件大小成長；個人用 1–2 GB RAM 的小主機應可（未實測，屬推估）。 |
| API Key／費用 | 核心功能**不需要任何 API Key**，自架費用 = 主機費。AI 公式助理才需要 `ASSISTANT_API_KEY`（OpenAI／OpenRouter／任何 OpenAI 相容端點），費用依你選的模型按 token 計。Google Drive 匯入匯出需要 Google OAuth 設定（選用）。 |

## 4. 程式架構地圖

```
grist-core/                        （共 2,628 個檔案，由 git ls-tree 計算）
├─ app/
│  ├─ client/        前端（581 檔）
│  │  ├─ components/   GridView.ts（表格檢視 2,635 行）、Clipboard.ts、UndoStack.ts、
│  │  │                ChartView.ts、CustomView.ts（自訂 widget iframe）、GristDoc.ts（文件主控）
│  │  ├─ widgets/      各型別儲存格的顯示與編輯器：NumericTextBox、DateEditor、ChoiceEditor、
│  │  │                ReferenceEditor、AttachmentsWidget、ConditionalStyle、FormulaAssistant…
│  │  ├─ lib/          koDomScrolly.js（虛擬捲動）、tableUtil.ts（貼上解析、向下填滿）…
│  │  ├─ models/       DocData、TableData、ColumnFilter、SearchModel…（前端資料模型）
│  │  └─ ui/, ui2018/  頁面、選單、主題、cssVars（手機斷點）
│  ├─ common/        前後端共用：DocActions.ts（動作格式）、schema.ts（中繼資料表）、
│  │                 NumberFormat.ts、SortFunc.ts、ValueParser/Formatter、tsvFormat.ts…
│  ├─ server/        Node 伺服器（212 檔）
│  │  └─ lib/        FlexServer.ts（組裝 Express）、ActiveDoc.ts（打開中的文件）、
│  │                 Sharing.ts（動作序列化）、DocStorage.ts（SQLite）、DocApi.ts（REST API）、
│  │                 NSandbox.ts / SandboxPyodide.ts（Python 沙盒）、ExportXLSX.ts / workerExporter.ts、
│  │                 OpenAIAssistantV1.ts（AI 公式助理）、Telemetry.ts、Triggers.ts（webhooks）
│  ├─ gen-server/    首頁資料庫（使用者、組織、工作區）— TypeORM
│  └─ plugin/        對外 API 型別：grist-plugin-api.ts（自訂 widget 用）、DocApiTypes.ts、GristData.ts
├─ sandbox/
│  ├─ grist/         Python 資料引擎（174 檔）：engine.py、depend.py、codebuilder.py、gencode.py、
│  │                 lookup.py、summary.py、functions/（試算表函數）、imports/（csv/xlsx/json 匯入）
│  └─ pyodide/       WebAssembly 沙盒
├─ stubs/            開源版用的「空殼」：完整版功能（Assistant、Automations、OAuthApps…）在這裡被替換成 stub
├─ assets/locales/   39 種語言（78 檔 = client + server），含 zh_Hant
├─ test/             614 個 TS/JS 測試檔；sandbox/grist 另有 83 個 Python 測試檔
└─ Dockerfile, docker-compose-examples/, buildtools/
```
（檔案數皆由 `git ls-tree -r --name-only HEAD` 結果以前兩層路徑分組、`grep -c` 計數。）

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 表格渲染＋虛擬捲動 | [app/client/lib/koDomScrolly.js L1-L60](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js#L1-L60)、[L149-L170](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js#L149-L170) | **DOM 渲染**。一個很高的空 `scrollDiv` 撐出捲軸，裡面絕對定位的 `blockDiv` 只放看得到的列；列高可變，用 `BinaryIndexedTree`（樹狀陣列）存每列高度，快速由 y 座標找列號。 |
| Grid 主體 | [app/client/components/GridView.ts L143](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L143)、[L1621-L1624](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L1621-L1624) | 呼叫 `koDomScrolly.scrolly(data, …, renderRow)`；欄寬用另一棵 BinaryIndexedTree（[L254-L258](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L254-L258)）。欄位**沒有**做虛擬化（每列會畫出全部可見欄）。 |
| 凍結欄 | [GridView.ts L305-L348](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L305-L348) | `numFrozen`、`frozenWidth`、`frozenOffset` 計算位移，只凍結左側欄。 |
| 公式解析 | [sandbox/grist/codebuilder.py L1-L25](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L1-L25) | 公式就是 Python。把 `$欄名` 用 regex 換成 `rec.欄名`，再用 `asttokens`/`astroid` 包成函式；`IF`、`IFERROR` 等參數做延遲求值。 |
| 產生使用者程式碼 | [sandbox/grist/gencode.py L1-L30](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/gencode.py#L1-L30) | 依文件 schema 動態產生一個 Python module，每張表一個 class、每個公式欄一個方法。 |
| 依賴圖 | [sandbox/grist/depend.py L1-L40](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/depend.py#L1-L40) | 節點 = (表, 欄)，邊帶 Relation 決定「哪幾列」要重算；設計參考 ninja build system。依賴是**執行時自動記錄**屬性存取得到的，不用解析公式。 |
| 重算 | [sandbox/grist/engine.py L747-L764](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L747-L764)、[L1329](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L1329) | `apply_user_actions` → 套用 → `_bring_all_up_to_date` → `_recompute_step` 逐節點只重算被標記的列；處理循環參照（`OrderError`）。 |
| 查表／跨表 | [sandbox/grist/table.py L59, L105](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/table.py#L59-L105)、[functions/lookup.py L130-L152](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/lookup.py#L130-L152) | `Table.lookupRecords(欄=值)`／`lookupOne`，有索引（lookup.py）。`VLOOKUP(表, 欄=值)` 只是 `lookupOne` 的別名——**和 Excel 的 VLOOKUP 參數完全不同**。 |
| 樞紐（摘要表） | [sandbox/grist/summary.py L1-L25](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/summary.py#L1-L25) | 依分組欄自動產生摘要表，數字欄預設 `SUM($group.欄)`。 |
| 文件儲存 | [app/server/lib/DocStorage.ts L1-L7](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocStorage.ts#L1-L7)、[L103-L160](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocStorage.ts#L103-L160) | 一份文件一個 SQLite 檔，使用者表就是 SQLite 表；另有 `_gristsys_Action*`（動作歷史）、`_gristsys_Files`（附件）。 |
| 中繼資料 | [app/common/schema.ts L11-L50](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/schema.ts#L11-L50) | 表、欄、檢視、欄位設定都存成 `_grist_*` 表（SCHEMA_VERSION 47）。條件格式規則存成欄位的 `rules`（隱藏公式欄）。 |
| 多人同步 | [app/server/lib/Sharing.ts L46-L60](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/Sharing.ts#L46-L60) | 伺服器用 `Mutex` 一次處理一個動作，結果（DocAction）廣播給所有連線的瀏覽器。 |
| 復原／重做 | [app/client/components/UndoStack.ts L18-L30](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/UndoStack.ts#L18-L30) | 前端維護動作堆疊，undo 會把反向動作送回伺服器；多人時只撤銷自己的動作。 |

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 可變列高虛擬捲動 | [app/client/lib/koDomScrolly.js](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js) ＋ [app/common/BinaryIndexedTree.js](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/BinaryIndexedTree.js) | knockout、underscore、jQuery | 中 | `BinaryIndexedTree.js` 幾乎無依賴可直接搬；scrolly 本體要把 knockout observable 換成純 JS 狀態。適合你自己寫的純 JS 表格。 |
| 從 Excel／Google 試算表貼上 | [app/client/lib/tableUtil.ts L117-L143](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/tableUtil.ts#L117-L143)、[Clipboard.ts L372-L392](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/Clipboard.ts#L372-L392)、[app/common/tsvFormat.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/tsvFormat.ts) | 只用瀏覽器 DOMParser | **低** | 先讀 `text/html` 用 DOMParser 找 `<table>` 取每格 textContent，失敗再退回 TSV 解碼。三十行內就能改寫成純 JS，直接用在你的倉庫 App。 |
| 複製成 HTML＋純文字 | [Clipboard.ts L233-L260](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/Clipboard.ts#L233-L260) | Clipboard API | 低 | 同時寫 `text/plain`（TSV）與 `text/html`（表格），貼到 Excel 會保留成格子。 |
| 向下填滿 Ctrl+D | [tableUtil.ts L180-L203](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/tableUtil.ts#L180-L203) | 無 | 低 | 取選取範圍第一列的值，產生一個 `BulkUpdateRecord`。 |
| 動作（DocAction）格式 | [app/common/DocActions.ts L17-L52](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/DocActions.ts#L17-L52) | 無 | 低 | `["BulkUpdateRecord", tableId, rowIds, {col:[…]}]` 這種陣列格式很適合當你自己工具的變更紀錄／復原堆疊／同步到 Firestore 的單位。 |
| 數字格式 | [app/common/NumberFormat.ts L33-L90](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/NumberFormat.ts#L33-L90) | `Intl.NumberFormat`、locale-currency | 低 | 用瀏覽器內建 Intl 處理貨幣、百分比、千分位，可直接用 TWD。 |
| 排序比較函數 | [app/common/SortFunc.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/SortFunc.ts) | 少 | 低 | `naturalCompare`、`typedCompare` 處理混型別排序。 |
| xlsx 串流匯出（含樣式） | [app/server/lib/workerExporter.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/workerExporter.ts)、[ExcelFormatter.ts L38-L80](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ExcelFormatter.ts#L38-L80) | exceljs 4.2.1、piscina | 中 | 把欄位型別轉成 Excel numFmt（日期、貨幣、百分比）＋填色字型；可移植到 Firebase Cloud Functions 做「匯出報表」。 |
| Python 公式引擎（依賴圖＋重算） | [sandbox/grist/engine.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py)、[depend.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/depend.py) | Python 3、asttokens、astroid、整個 sandbox/grist | **高** | 和 schema／中繼資料綁很深，不建議拆；比較實際是「學它的增量重算設計」，或整套 Grist 跑起來用 API 接。 |
| 試算表函數庫（Python） | [sandbox/grist/functions/](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/__init__.py) | 純 Python（少數依賴 dateutil、roman） | 中 | 148 個已實作函數，個別函數（例如 date.py 的 `WORKDAY`、`EDATE`）可以單獨抄進你的 Python 後端或請 Claude 轉成 JS。 |
| 條件格式 UI | [app/client/widgets/ConditionalStyle.ts L30](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/widgets/ConditionalStyle.ts#L30) | grainjs、整個 Grist 模型 | 高 | 只適合參考 UI 流程（規則 = 布林公式 + 樣式）。 |
| 自訂 widget 橋接 API | [app/plugin/grist-plugin-api.ts L180, L357-L405, L480](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/grist-plugin-api.ts#L357-L405) | grain-rpc（postMessage） | 低（使用）／中（拆） | 你可以寫一個純 HTML 頁（例如「比價卡片」「出貨單列印」）放進 Grist 當 widget，用 `grist.onRecords()` 拿資料。 |

## 7. AI／Claude 整合

- **開源版有的：舊版「AI 公式助理」**（只會幫你寫公式）。
  - 伺服器端：[app/server/lib/OpenAIAssistantV1.ts L39-L77](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/OpenAIAssistantV1.ts#L39-L77)。預設模型 `gpt-4o-2024-08-06`；讀 `ASSISTANT_CHAT_COMPLETION_ENDPOINT`、`ASSISTANT_API_KEY`／`OPENAI_API_KEY`、`ASSISTANT_MODEL`、`ASSISTANT_LONGER_CONTEXT_MODEL`、`ASSISTANT_MAX_TOKENS`。走 **OpenAI Chat Completions 格式**。
  - Prompt 位置：system prompt 寫在 [OpenAIAssistantV1.ts L320-L335](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/OpenAIAssistantV1.ts#L320-L335)（"You are a helpful assistant for a user of software called Grist…"）；資料結構描述由 Python 產生：[sandbox/grist/formula_prompt.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/formula_prompt.py)（`get_formula_prompt` 把每張表轉成「假的 Python class」給模型看，`convert_completion` 把回覆轉回公式）。
  - REST：`POST /api/docs/:docId/assistant`（[DocApi.ts L1318](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L1318)）。
- **換成 Claude：可以。** README「Using Grist with OpenRouter for Model Agnostic and Claude Support」（[L193-L249](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L193-L249)）：設 `ASSISTANT_CHAT_COMPLETION_ENDPOINT=https://openrouter.ai/api/v1/chat/completions`、`ASSISTANT_API_KEY=<OpenRouter key>`、`ASSISTANT_MODEL=anthropic/claude-…`，且不要設 `OPENAI_API_KEY`。若想直連 Anthropic，需要一個 OpenAI 相容端點（未在本 repo 驗證 Anthropic 官方相容端點的行為）。
- **MCP：開源版沒有內建。** 內建 MCP 伺服器屬完整版（README [L137](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L137)）；core 裡只看到 CORS 標頭預留（[FlexServer.ts L3099-L3102](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/FlexServer.ts#L3099-L3102)）和一個宣傳橫幅 `app/client/components/McpConnectBanner.ts`。README 建議開源版使用者改用社群 MCP 伺服器（透過 REST API），本次未驗證任何社群 MCP 專案。
- **新版 Grist Assistant（能建表、改資料）**：完整版才有；開源版在 `stubs/app/client/ui/assistant/` 只有空殼。
- **自己用 Claude Code 接**：最省事是寫一個小 MCP／腳本呼叫 REST API（第 8 節），讓 Claude 讀寫你的「商品成本表」。
- 沒有影片或腳本生成相關功能。

## 8. 擴充方式與 API

1. **REST API**（[app/server/lib/DocApi.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts)）：用 `Authorization: Bearer <API key>`（[Authorizer.ts L180-L196](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/Authorizer.ts#L180-L196)）。主要端點（以 `grep this._app.(get|post…)` 列出）：
   - `GET/POST/PATCH/PUT /api/docs/:docId/tables/:tableId/records`（讀、新增、修改、upsert）
   - `GET/POST /api/docs/:docId/tables`、`…/columns`（建表、建欄）
   - `GET/POST /api/docs/:docId/sql`（唯讀 SQL 查詢，[L626-L636](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L626-L636)）
   - `POST /api/docs/:docId/apply`（直接送 UserAction 陣列，[L210](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L210)）
   - `GET /api/docs/:docId/download/xlsx`、`/download/csv`（[L1284-L1302](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L1284-L1302)）、附件、快照、fork、比較、提案（suggestions）等
2. **Webhooks**：表格新增／更新時 POST 到你的網址（`eventTypes: ("add" | "update")[]`，[app/common/Triggers.ts L40](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/Triggers.ts#L40)；端點在 DocApi.ts [L1591](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/DocApi.ts#L1591) 之後註冊）。→ 可接 Firebase Cloud Functions 同步到 Firestore。
3. **自訂 widget**：任意網頁放在 iframe，載入伺服器提供的 `/grist-plugin-api.js`（[FlexServer.ts L930-L960](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/FlexServer.ts#L930-L960)），用 `grist.ready()`、`grist.onRecords()`、`grist.onRecord()`、`grist.getTable().update()` 等（[grist-plugin-api.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/grist-plugin-api.ts#L357-L405)）。純 JS 就能寫。
4. **Python 公式裡的 `REQUEST()`**：公式可發 HTTP 請求（[functions/info.py L706](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/info.py#L706)），可拿來抓匯率或比價 API；但**預設關閉**，需 `GRIST_ENABLE_REQUEST_FUNCTION`，README [L455](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L455) 警告有資安風險（SSRF）。
5. **匯入外掛**：`grist.addImporter`（grist-plugin-api.ts L443）；`app/plugin/` 下有 FileParserAPI、ImportSourceAPI 介面。

## 9. 程式品質與風險

- **維護狀況：非常活躍。** 最新 commit 2026-11-04（`Fix build after #2697 and #2699 crossed (#2737)`），版本 1.7.22；有公司（Grist Labs）與法國政府單位（ANCT、DINUM）長期投入。
- **測試：** 614 個 TS/JS 測試檔（含 Selenium 瀏覽器測試 `test/nbrowser`）＋ 83 個 Python 引擎測試檔（以檔名計數）；`.github/workflows/` 有 10 個 CI 設定。本次依規定未執行測試。
- **資安：** 公式是任意 Python，**一定要開沙盒**（Docker 映像預設嘗試 gVisor；`GRIST_SANDBOX_FLAVOR` 可設 gvisor／pyodide／macSandboxExec／unsandboxed，[NSandbox.ts L39, L125](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L125)）。個人在本機用、文件都是自己的，風險低；若開放給外人上傳文件就要確認沙盒有生效（管理面板有健康檢查）。`REQUEST()` 預設關閉是好事。
- **遙測：** 預設 `off`（[Telemetry.ts L379-L403](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/Telemetry.ts#L379-L403)，沒設環境變數也沒偏好時回傳 `"off"`）；若開啟會送到 `https://telemetry.getgrist.com/api/telemetry`（[L74-L75](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/Telemetry.ts#L74-L75)）。版本檢查需 `GRIST_ALLOW_AUTOMATIC_VERSION_CHECKING`（`app/server/lib/updateChecker.ts` L43-L48）。
- **已知的坑：**
  1. 不是 Excel：沒有 A1 儲存格位址、沒有合併儲存格、`VLOOKUP` 參數跟 Excel 不同；`SUMIF`、`INDEX`、`MATCH` 等常用 Excel 函數**只有名稱、未實作**。從 Excel 習慣過來要重新學「欄＝欄位、一欄一個公式」的思維。
  2. 預設 Docker 映像與原始碼安裝會帶入非開源擴充（見第 2 節）。
  3. 每份文件整份載入伺服器記憶體＋瀏覽器記憶體，超大表（百萬列）不適合。
  4. 前端技術較舊（knockout＋grainjs 混用），想拆前端元件到 React/Vue 專案要改寫。
  5. 繁體中文介面翻譯只完成約 45%（見第 11 節）。

## 10. 跟其他專案組合的建議

- **最推薦的用法：「Grist 當後台資料庫＋你自己的純 JS 前端」**。成本表、供應商報價、庫存都放 Grist（有公式、權限、歷史紀錄、xlsx 匯出），你的 Firebase 倉庫 App 只透過 REST API 或 webhook → Cloud Functions 拿資料。這比自己從零做公式引擎省事得多。
- **若你要的是「嵌在自己網頁裡、像 Excel 一樣有 A1 公式的元件」**：Grist 不適合當元件，請搭配 Univer／Luckysheet（試算表 UI）＋ HyperFormula（Excel 相容公式引擎）或 SheetJS（xlsx 讀寫）——同資料夾內已有這些專案的資料包。可以借 Grist 的：貼上解析（tableUtil.ts）、BinaryIndexedTree 虛擬捲動思路、DocAction 變更格式、exceljs 匯出格式對照。
- **比價／成本計算**：在 Grist 建「商品」「平台價格」兩表，用 `Prices.lookupRecords(product=$id)` 加 `min(...)` 算最低價、`$售價 - $成本 - $平台費` 算毛利；搭配摘要表看各平台平均。若要自動抓價，可開 `REQUEST()`（注意資安）或寫外部爬蟲用 REST API 寫入。
- **AI 腳本／影片**：Grist 本身沒有，但可當「腳本素材庫／分鏡表」：一列一個鏡頭，欄位放產品賣點、台詞、提示詞；用 webhook 觸發你的影片生成流程，結果檔案以附件欄存回。
- **與 Claude**：開源版用 OpenRouter 讓公式助理用 Claude；另外自己寫一個極小的 MCP 工具（呼叫 `/records`、`/sql`），讓 Claude Code 直接查你的庫存與成本。

## 11. 網頁 Excel 能力檢查表

**渲染與效能**
- **渲染方式：有（DOM）。** 不是 Canvas/WebGL。[koDomScrolly.js L1-L60](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/koDomScrolly.js#L1-L60)。
- **虛擬捲動：有（只對列）。** 可變列高，BinaryIndexedTree 定位；欄位不虛擬化。[GridView.ts L1621-L1624](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L1621-L1624)。
- **10 萬列以上效能：未確認（未實測）。** 架構上整張表會載入瀏覽器（DocData）與伺服器 Python 記憶體；有 `onDemand` 表選項可讓特定表不載入 Python 引擎（[schema.ts `onDemand`](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/schema.ts#L22-L30)、[OnDemandActions.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/OnDemandActions.ts)），但該表就不能有公式。託管版有每份文件列數上限設定（`baseMaxRowsPerDocument`，[Features.ts L76](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/Features.ts#L76)），自架預設無上限。

**公式引擎**
- **函數數量：已實作 148 個、另有 82 個只宣告未實作。** 怎麼數：用 Python `ast` 解析 `sandbox/grist/functions/` 中被 `__init__.py` 匯入的 9 個模組（date、info、logical、lookup、math、stats、text、schedule、prevnext），計算模組最上層、全大寫名稱的 `def`；有 `@unimplemented` 裝飾器的另計。分佈：math 53、text 28、date 24、info 15、stats 14、logical 7、lookup 3、prevnext 3、schedule 1。未實作者包含 `SUMIF`、`SUMIFS`、`INDEX`、`MATCH`、`HLOOKUP`、`ISBLANK`、多數統計函數（[math.py L805-L813](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/math.py#L805-L813)）。**但公式就是完整 Python**，標準函式庫都能用，加上 `Table.lookupRecords()`、`PREVIOUS/NEXT/RANK`（[prevnext.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/prevnext.py#L1-L45)），實際能力比函數數量強。
- **解析器／依賴圖／重算：有。** 解析：[codebuilder.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L1-L25)；依賴圖：[depend.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/depend.py#L1-L40)；重算：[engine.py L747-L764](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L747-L764)。增量重算到「欄＋列」層級。
- **陣列公式：沒有 Excel 式動態陣列溢出（spill）。** 一個公式欄對每一列各算一次；公式可回傳 list（給 ChoiceList／Reference List／Any 欄）。（依架構判斷，未找到 spill 相關程式碼。）
- **跨工作表參照：有。** 透過 Reference 欄 `$客戶.電話` 或 `Orders.lookupRecords(customer=$id)`；沒有 `Sheet1!A1` 語法。
- **自訂函數：部分。** 公式內可寫多行 Python（含 `def`、`import`）；沒有找到「全文件共用自訂函數模組」的機制（未確認）。

**編輯**
- **儲存格編輯：有。** 依型別有專屬編輯器（`app/client/widgets/*Editor.ts`）。
- **複製貼上：有，可直接從 Excel／Google 試算表貼上。** 先解析 `text/html` 中的 `<table>`、取每格文字；失敗退回 TSV（[Clipboard.ts L372-L392](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/Clipboard.ts#L372-L392)、[tableUtil.ts L117-L143](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/tableUtil.ts#L117-L143)）。只帶值，不帶格式與公式。
- **拖拉填滿：沒有。** 沒找到填滿控點（grep `fill handle`/`autofill` 無相關結果）；只有 **Ctrl/⌘+D 向下填滿**，複製第一列的值、不會遞增序列（[commandList.ts L591-L592](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/commandList.ts#L591-L592)、[tableUtil.ts L180-L203](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/lib/tableUtil.ts#L180-L203)）。
- **復原／重做：有。** [UndoStack.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/UndoStack.ts#L18-L30)，另有完整動作歷史存在 SQLite。

**格式**
- **數字格式：有**（貨幣、百分比、科學記號、小數位、千分位；以 Intl.NumberFormat 實作，[NumberFormat.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/NumberFormat.ts#L33-L90)）。不是 Excel 的格式字串語法。
- **條件格式：有。** 規則 = 布林公式＋文字色／底色／粗體等（[ConditionalStyle.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/widgets/ConditionalStyle.ts#L30)；規則存在欄位 `rules`，[schema.ts L32-L50](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/schema.ts#L32-L50)）。
- **合併儲存格：沒有。**（資料庫式模型；grep `mergeCells` 無結果。）
- **凍結窗格：部分——只能凍結左側欄，不能凍結列**（[GridView.ts L305-L348](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/GridView.ts#L305-L348)）。標題列本來就固定。
- **欄寬列高：欄寬可拖拉調整（存在 `widthDef`）；列高依內容（換行）自動，不能逐列手動設定**（後者依程式結構判斷，未在 UI 程式中找到手動列高）。
- **篩選：有**（[ColumnFilter.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/models/ColumnFilter.ts#L19)，可釘選篩選列）。
- **排序：有**，多欄排序（[SortFunc.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/SortFunc.ts)）。
- **資料驗證（下拉選單）：有**——Choice／Choice List 欄就是下拉選單，Reference 欄是「從另一張表選」；還可設「下拉條件」公式過濾選項（[DropdownCondition.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/DropdownCondition.ts)）。型別不符的值會以錯誤樣式顯示而非直接拒絕。

**圖表、樞紐、附件**
- **圖表：有**，Plotly：bar、pie、donut、line、area、scatter、kaplan_meier 等（[ChartView.ts L57-L65](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/ChartView.ts#L57-L65)、[L611](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/components/ChartView.ts#L611)）。
- **樞紐分析：有（摘要表 Summary tables）**，不是 Excel 樞紐的拖拉介面，但分組＋公式欄更彈性（[summary.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/summary.py#L1-L25)）。
- **圖片／附件：有**，Attachment 欄（`app/client/widgets/AttachmentsWidget.ts`），存在 SQLite 或外部 S3／MinIO。

**匯入匯出（開源版都有）**
- **.xlsx 匯入：有**，Python `openpyxl 3.0.10`，`data_only=True` → **只讀值，Excel 公式不會轉成 Grist 公式**，格式不保留（[import_xls.py L1-L47](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/imports/import_xls.py#L1-L47)）。
- **.xlsx 匯出：有**，Node `exceljs 4.2.1` 串流寫入、在 worker thread 執行；匯出值＋欄位樣式（數字格式、日期格式、填色、字型、對齊），不匯出公式（[workerExporter.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/workerExporter.ts)、[ExcelFormatter.ts L38-L80](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ExcelFormatter.ts#L38-L80)）。
- **.csv：有**（匯入 `sandbox/grist/imports/import_csv.py`；匯出 `/download/csv`、`ExportDSV.ts`）。另支援 JSON 匯入、Google Drive、Airtable 匯入、「增量匯入（依鍵合併）」。

**多人協作**
- **有，即時。** 機制：**伺服器集中序列化**（每份文件一個 Mutex，[Sharing.ts L46-L60](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/Sharing.ts#L46-L60)），動作套用後透過 WebSocket／long polling 廣播。不是 OT、也不是 CRDT；需要一直連著 Grist 伺服器（離線編輯：沒有）。另有游標在場顯示、儲存格留言、「建議修改」流程。

**資料模型與存進 Firestore**
- 儲存格值型別：`number | string | boolean | null | [代碼, ...]`，代碼如 `"L"`(List)、`"D"`(DateTime)、`"R"`(Reference)、`"E"`(錯誤)（[GristData.ts L4-L17, L46](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/GristData.ts#L4-L46)）。
- 變更動作（[DocActions.ts L17-L52](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/DocActions.ts#L17-L52)）：
  ```json
  ["BulkUpdateRecord", "Products", [1, 2], {"Price": [120, 99], "Stock": [30, 5]}]
  ```
- REST API 記錄格式（[DocApiTypes.ts](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/DocApiTypes.ts)）：
  ```json
  {"records": [{"id": 1, "fields": {"Name": "保溫杯", "Cost": 85, "Price": 199, "Supplier": 3}}]}
  ```
  `Supplier: 3` 是 Reference，存對方表的列 id。
- **存進 Firestore：** Grist 自己只寫 SQLite，不能把後端換成 Firestore。做法是 (a) webhook（add/update）→ Cloud Function → 寫入 `products/{id}` 文件，`fields` 直接當 Firestore 欄位；或 (b) 定時用 `GET /records` 全量同步。反方向用 `PATCH /records` 寫回。

**手機／繁中**
- **手機／觸控：部分。** 有窄螢幕版面（`mediaSmall`、`isNarrowScreen()`，[cssVars.ts L242-L255](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/client/ui2018/cssVars.ts#L242-L255)，共 24 個前端檔案使用），可在手機檢視與編輯；但觸控操作體驗未實測（未確認）。
- **繁體中文介面：有，但不完整。** `assets/locales/zh_Hant.client.json` 存在；我用腳本比對英文鍵值：client 端 3,164 個字串中有 1,431 個有繁中翻譯（**約 45%**），server 端 13 個中 12 個；簡中 client 約 64%。未翻的會顯示英文。

**嵌入純 JavaScript 網頁**
- **不能當 npm 元件直接 import**（沒有 `<GristGrid>` 這種東西；前端與伺服器緊密綁定）。可行方式：
  1. **iframe 嵌入**：網址加 `?embed=true`，會自動變成唯讀＋單頁樣式（[gristUrls.ts L620-L630](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/gristUrls.ts#L620-L630)）；要可編輯需文件權限設定（未在程式中逐一驗證）。
  2. **REST API**：自己畫表格。注意瀏覽器跨網域帶 `Authorization` 只有在受信任來源才允許（[FlexServer.ts L3104-L3121](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/FlexServer.ts#L3104-L3121)、[requestUtils.ts L123](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/requestUtils.ts#L123)），而且 API key 不該放在前端——建議經由 Cloud Functions 代理。
  3. 姊妹專案 `grist-static` 可在純靜態網站顯示 Grist 文件（README 所述，本次未驗證）。
- 最小可用範例（iframe ＋ 經自己後端代理讀資料）：
  ```html
  <!doctype html>
  <meta charset="utf-8">
  <h3>庫存表（Grist）</h3>
  <iframe src="http://localhost:8484/o/docs/YOUR_DOC_ID/Inventory?embed=true"
          style="width:100%;height:420px;border:0"></iframe>
  <ul id="low"></ul>
  <script>
    // /api/grist-proxy 是你自己的 Cloud Function，轉呼叫：
    // GET {GRIST}/api/docs/YOUR_DOC_ID/tables/Products/records
    // 並在伺服器端加上 Authorization: Bearer <API key>
    fetch('/api/grist-proxy?table=Products')
      .then(r => r.json())
      .then(({ records }) => {
        const low = records.filter(r => r.fields.Stock < 10);
        document.getElementById('low').innerHTML =
          low.map(r => `<li>${r.fields.Name}：剩 ${r.fields.Stock}</li>`).join('');
      });
  </script>
  ```
- **套件大小：未確認**（本次不允許建置，無法量測 webpack 輸出；它本來就是整套伺服器，不是以 KB 計的元件）。

**API／事件**
- **監聽變更：有。** 伺服器外部用 webhooks（add/update，Triggers.ts）；Grist 內的自訂 widget 用 `grist.onRecords(cb)` / `grist.onRecord(cb)`（[grist-plugin-api.ts L357-L405](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/grist-plugin-api.ts#L357-L405)）。
- **用程式讀寫儲存格：有。** REST `/records`、`/apply`、`/sql`（唯讀）；widget 內 `grist.getTable().update({id, fields})`（[L180](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/plugin/grist-plugin-api.ts#L180)）。沒有 A1 位址，一律用「表＋列 id＋欄 id」。

## 關鍵字
Grist、grist-core、網頁試算表、關聯式試算表、relational spreadsheet、Airtable 替代、自架、self-hosted、Python 公式、Python formulas、依賴圖、dependency graph、增量重算、SQLite、.grist 檔、虛擬捲動、virtual scrolling、BinaryIndexedTree、DOM 渲染、複製貼上 Excel、parsePasteHtml、摘要表、樞紐分析、summary tables、條件格式、conditional formatting、圖表、Plotly、xlsx 匯入匯出、openpyxl、exceljs、REST API、webhooks、自訂 widget、grist-plugin-api、AI 公式助理、OpenRouter、Claude、MCP（完整版）、Docker、gristlabs/grist-oss、gVisor、Pyodide、Apache-2.0、完整版授權、進銷存、庫存管理、成本計算、比價、繁體中文
