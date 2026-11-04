# gristlabs/grist-core｜深入：Python 資料引擎與公式
> 深入分析｜掃描日期：2026-11-04｜commit：484236f｜總覽資料包：_oss-research/01-web-excel/gristlabs__grist-core.md

> 範圍：`sandbox/grist/`（Python 資料引擎＋`functions/` 函數庫）、`sandbox/gvisor/`、`sandbox/pyodide/`，以及 Node 端啟動沙盒的 `app/server/lib/NSandbox.ts`、`SandboxPyodide.ts`、`ICreate.ts`、`ActiveDoc.ts` 相關段落。為了確認「引擎能不能直接在瀏覽器跑」，另外讀了同組織的 `gristlabs/grist-static`（commit `e4aa836`）兩個檔案。grist-core 的連結全部固定在 commit `484236f6abc960ed7dadade5c2b714465492a063`。我只讀程式碼，沒有安裝、建置或執行任何東西；沒實際跑過的行為標「未實測」，沒把握的標「未確認」。授權：Apache-2.0（[LICENSE.txt](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/LICENSE.txt#L1-L3)），個人或商用都能改、能抄，保留授權聲明與 NOTICE 即可。

---

## 重點結論（5–10 點）

1. **Grist 的公式是「一整欄共用一個 Python 函式」，不是 Excel 的「每格一條公式」。** 每個公式欄會被產生成 `def 欄名(rec, table): ...`，對每一列各呼叫一次；`$Price` 只是 `rec.Price` 的簡寫。沒有 `A1`、`B2:C9` 這種儲存格位址，所以 INDEX、MATCH、OFFSET、INDIRECT、ROW、COLUMN 全是空殼。對進銷存這種「一張表放一種東西」的資料很順手；要「長得像 Excel 的格子」就不是它的強項。
2. **每開一份文件，就起一個 Python 行程。** Node 端的 `ActiveDoc` 把 SQLite 裡的資料整份讀進 Python 記憶體（on-demand 表格除外），雙方用 Python `marshal` 格式透過管線做 RPC；Python 算完回傳 DocActions，Node 再寫回 SQLite、廣播給瀏覽器。瀏覽器本身從來不跑公式。
3. **程式碼產生（codegen）**：引擎讀 `_grist_Tables`、`_grist_Tables_column` 兩張中繼資料表 → 產生一整個 Python 模組（每張表一個 class、每個公式欄一個函式）→ `compile()`＋`exec()` 載入。任何欄位或公式的異動都會重產整個模組，但會用 `(table_id, col_id, formula)` 快取已轉譯好的公式本體。
4. **依賴追蹤是「執行時動態收集」，而且精準到「列」。** 公式每讀一次欄位，就經由 property 呼叫 `_use_node()`，在依賴圖上加一條邊；邊上掛一個 Relation 物件，負責回答「對方哪幾列變了，我這邊哪幾列要重算」（同列、參照、lookup、多段組合）。完全不用先解析公式就知道依賴。
5. **重算策略**：改資料時只「標髒」，等整批動作套完才統一計算；計算時不遞迴，碰到「需要的格子還沒算好」就丟 `OrderError`，由外層迴圈把工作重新排序；用「鎖定格」偵測循環參照。公式錯誤以 `RaisedException` 存進格子，被別人讀到時變成 `CellError` 往外傳。`IF`、`IFERROR`、`ISERR`、`ISERROR`、`PEEK` 的參數會自動被包成 `lambda`，只算用得到的那邊。
6. **沙盒：grist-core 預設是 `unsandboxed`（直接用主機 Python 跑使用者公式，等於沒防護）。** 可用 `GRIST_SANDBOX_FLAVOR` 改成 `gvisor`（網路 none、根目錄唯讀、行程數上限 8）、`pyodide`（WebAssembly 版 Python 跑在 Deno 裡，載完套件就撤銷讀寫權限）、`macSandboxExec`、`docker`，或 `sandboxed`（依序自動試 gvisor → macSandboxExec → pyodide）。
7. **函數數量（我用 AST 靜態解析自己數的）：9 個模組共匯出 230 個大寫名稱；82 個掛 `@unimplemented`，其中 81 個本體只有 `raise NotImplementedError()`，另 1 個 `REQUEST` 其實能用、只是 beta 期間刻意藏起來。實際可用 148＋REQUEST＝149 個。** 其中 21 個是 Grist 自創或語意與 Excel 不同。**完全沒有** COUNTIF、COUNTIFS、XLOOKUP、FILTER、IFS、SWITCH、TEXTJOIN 與 PMT／NPV／IRR 等財務函數；SUMIF、SUMIFS、MATCH、INDEX、HLOOKUP、TEXT、LARGE、SMALL、PERCENTILE 只是空殼。替代方式是直接寫 Python。
8. **引擎可以單獨拿出來用。** 官方測試就是「不開 Node、純 Python」在驅動：`engine.Engine()` → `load_empty()` → `apply_user_actions([...])`。核心約 1.2 萬行、函數庫約 4,900 行，直接相依 12 個 PyPI 套件。姊妹專案 grist-static 更已經把整個引擎包成 wheel，放進瀏覽器的 Web Worker 用 Pyodide 跑——對「Firebase 靜態主機、不想養伺服器」的你特別有參考價值。
9. **跟 Claude 的關聯**：引擎內建 `get_formula_prompt()`，會把文件結構翻成「Python class 型別定義＋待補完的函式簽名」交給 LLM 填；README 有一節說明用 OpenRouter 把 AI 公式助手接到 Claude。這招「把試算表結構翻成型別化 stub 再請 AI 補完」可以直接借到你自己的倉儲 App。

---

## 逐題詳解（每個問題一節，附 permalink 與必要的短程式碼摘錄）

### 1. sandbox/grist 的 Python 引擎：它是什麼、怎麼被呼叫

```
瀏覽器（使用者改一格）
  │ WebSocket 送 UserAction，例如 ["UpdateRecord","Products",5,{"Cost":120}]
  ▼
Node：ActiveDoc.ts ── pyCall("apply_user_actions") ──► NSandbox.ts
  │                 marshal 編碼，經管線（fd 3/4 或 stdin/stdout）
  ▼
Python：main.py → Engine.apply_user_actions()
  ├ useractions.py：把 UserAction 拆成 DocActions（純資料／結構變更）
  ├ docactions.py ：改記憶體裡的欄資料，並把受影響的公式格「標髒」
  └ _bring_all_up_to_date()：把所有髒格算完，結果併入要存檔的 actions
  ▼
Node：寫進 SQLite（.grist 檔）＋ 廣播給所有開著這份文件的分頁
```

- **開檔流程**：`_loadTables()` 以每次 3 張表的並行度呼叫 Python 的 `load_table`（[ActiveDoc.ts L3123-L3133](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ActiveDoc.ts#L3123-L3133)），接著呼叫 `initialize`，最後套用一個叫 `Calculate` 的空動作，觸發全部公式計算（[L3182-L3195](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ActiveDoc.ts#L3182-L3195)）。官方文件也直說「資料整份載入記憶體並不理想，但目前就是這樣」（[overview.md L40-L48](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/documentation/overview.md#L40-L48)）。
- **每次開檔都會重算全部公式**（依程式碼推論、未實測）：`load_table()` → `add_records()` 最後會呼叫 `invalidate_records()`（[engine.py L327-L380](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L327-L380)），所以所有公式格都被標髒；值沒變的不會再送出變更。大文件的開檔時間大致跟「公式欄數 × 列數」成正比。
- **RPC 格式**：Python 端 `Sandbox` 類別（[sandbox.py L47-L153](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/sandbox.py#L47-L153)）每則訊息是 `marshal(msgCode)`＋`marshal(body)`，`CALL=None`、`DATA=True`、`EXC=False`。呼叫是雙向的：例如 `REQUEST()` 公式會反過來呼叫 Node 的 `request`。`get_default_sandbox()`（[L157-L166](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/sandbox.py#L157-L166)）依環境變數 `PIPE_MODE` 選擇管線模式。Node 端對應 `pyCall()`（[NSandbox.ts L250-L265](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L250-L265)）、`_sendData()`（[L418-L437](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L418-L437)）、`_onSandboxMsg()`（[L481-L513](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L481-L513)）；JS 版的 marshal 實作在 `app/common/marshal.ts`（509 行）。
- **Python 對 Node 開放的方法**全部列在 `main.py` 的 `run()`（[L63-L264](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/main.py#L63-L264)）：`apply_user_actions`、`fetch_table`、`autocomplete`、`get_formula_error`、`get_formula_prompt`、`evaluate_formula`、`create_migrations`、`parse_predicate_formula` 等。
- **User actions 共 43 種**（我數 `useractions.py` 裡 `@useraction` 裝飾器的出現次數），例如 `AddRecord`、`BulkUpdateRecord`、`ModifyColumn`、`CreateViewSection`。`Calculate` 與 `UpdateCurrentTime` 是兩個「只為了觸發重算」的空動作（[useractions.py L422-L436](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/useractions.py#L422-L436)）。
- **主流程**（[engine.py L1329-L1393](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L1329-L1393)）：

```python
for user_action in user_actions:
  self.out_actions.retValues.append(self._apply_one_user_action(user_action))
...
self._maybe_update_trigger_dependencies()
self._bring_all_up_to_date()            # 整批動作套完才統一重算
while self.docmodel.apply_auto_removes():
  self._bring_all_up_to_date()
```

  任何一步丟例外，就用 `_undo_to_checkpoint()` 把整批動作全部倒回（[L1360-L1376](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L1360-L1376)），所以「一批動作」是全有或全無。

### 2. Python 公式：從輸入框到 Python 函式

**(a) 轉譯：`codebuilder._do_make_formula_body()`**（[codebuilder.py L98-L204](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L98-L204)）
- 先把 `$foo` 暫時換成單一識別字 `DOLLARfoo` 讓 Python 能解析，再依 AST 只替換真正的名稱（字串、註解裡的 `$` 不動），最後變成 `rec.foo`（[L116-L150](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L116-L150)）。
- `IF` 的第 2、3 個參數，以及 `IFERROR`、`ISERR`、`ISERROR`、`PEEK` 的第 1 個參數，會被包成 `lambda: (...)`（清單在 [L18-L25](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L18-L25)，包裝在 [L152-L160](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L152-L160)），模仿 Excel：沒走到的分支出錯也不影響結果。
- 最後一行是運算式就自動補 `return`；最後一行是 `=` 指派又沒有 return，會報「你是不是想用 `==`」（[L162-L183](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L162-L183)）。
- 語法錯誤不會拖垮整個模組：它會產生一個「執行時才丟 SyntaxError」的函式，並把錯誤位置換算回使用者原文（[L248-L281](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L248-L281)）。

**(b) 產生模組：`gencode.GenCode`**
- 公式欄 → `def colId(rec, table):`，有指定型別時加上 `@grist.formulaType(...)` 裝飾器（[gencode.py L72-L99](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/gencode.py#L72-L99)）。
- 資料欄若掛了「觸發公式」（trigger formula，例如建立時間、最後修改者），則產生 `_default_colId(rec, table, value, user)`，多了 `value`（目前值）與 `user`（誰改的）兩個參數（[L102-L113](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/gencode.py#L102-L113)）。
- `make_module()`（[L162-L191](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/gencode.py#L162-L191)）把所有表串成一個模組，開頭固定是 `from functions import *` 與 `import datetime, math, re`，再交給 `exec_module_text()` 做 `compile`＋`exec`（[L210-L216](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/gencode.py#L210-L216)）。所以公式裡可以直接用所有大寫函數、`datetime`，也能直接用其他表名（例如 `Sales.lookupRecords(...)`）。
- 產出長什麼樣子，可直接看官方範例 [usercode.py L15-L67](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/usercode.py#L15-L67)。套到你的倉儲情境（示意，格式比照 usercode.py）：

```python
@grist.UserTable
class Products:
  Name = grist.Text()
  Cost = grist.Numeric()

  @grist.formulaType(grist.Numeric())
  def Stock(rec, table):   # 使用者輸入：sum(Purchases.lookupRecords(Product=$id).Qty) - sum(Sales.lookupRecords(Product=$id).Qty)
    return sum(Purchases.lookupRecords(Product=rec.id).Qty) - sum(Sales.lookupRecords(Product=rec.id).Qty)
```

**(c) 型別**：公式結果會經過 `col.convert(value)` 轉成欄位型別；轉不過去的值不算錯誤，而是存成 AltText（原樣字串）。型別裝飾器在 [usertypes.py L74-L82](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/usertypes.py#L74-L82)。

**(d) 改名自動更新公式**：`parse_grist_names()`（[codebuilder.py L525-L606](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/codebuilder.py#L525-L606)）用 astroid 做型別推論，找出公式裡所有表名、欄名（包括 lookup 的關鍵字參數與 `order_by` 字串）。這是整個引擎唯一用到「靜態分析」的地方；依賴追蹤並不靠它。

**(e) 觸發公式何時重算**：`recalcWhen` 有三種——DEFAULT（新增列，或 `recalcDeps` 列出的欄變動時）、NEVER、MANUAL_UPDATES（[schema.py L391-L399](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/schema.py#L391-L399)）。依賴邊由 `_maybe_update_trigger_dependencies()` 建立（[engine.py L1233-L1263](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L1233-L1263)），用的是特製的 `SingleRowsIdentityRelation`：欄位改名或改型別時不會把整欄觸發公式全部重算（[relation.py L69-L79](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/relation.py#L69-L79)）。拿來「凍結下單當時的售價」很好用。

### 3. 依賴追蹤：引擎怎麼知道「誰用到誰」

- **圖的結構**：`Node = (table_id, col_id)`，代表一整欄；`Edge = (out_node, in_node, relation)`，意思是「out 依賴 in」（[depend.py L24-L43](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/depend.py#L24-L43)）。`Graph` 同時維護「誰依賴我」與「我依賴誰」兩張索引（[L62-L122](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/depend.py#L62-L122)）。檔頭註解說明設計參考了 ninja 建置系統。
- **邊是怎麼來的**：`_add_field_to_record_classes()` 為每張表的 Record 類別裝上「每欄一個 property」（[table.py L721-L741](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/table.py#L721-L741)），這是全引擎最熱的路徑：

```python
@property
def record_field(rec):
  use_node(node, rec._source_relation, (rec._row_id,))   # 記下依賴；對方若是髒的就先算
  value = col_obj.get_cell_value(rec._row_id)
```

  `Engine._use_node()`（[engine.py L523-L543](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L523-L543)）在「目前正在算公式欄」時加一條邊（用 `_recompute_edge_set` 去重複），然後若被讀的欄還有髒列就先把它算好。邊只會在計算過程中「增加」；只有整欄失效（改結構、重新載入）時才清空重建。
- **列層級對應（Relation）**（[relation.py L15-L157](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/relation.py#L15-L157)）：
  - `IdentityRelation`：同一列的欄位互相引用。
  - `ReferenceRelation`：經過參照欄，例如 `$Product.Cost`；它維護「被指向的列 → 哪些列指向它」的反向索引，第一次用到才建（[L109-L157](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/relation.py#L109-L157)）。商品成本一改，只有指向這個商品的那幾列會重算。
  - `ComposedRelation`：多段串接，例如 `$school.address.zip`（[L82-L106](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/relation.py#L82-L106)）。
  - lookup 專用的 `_LookupRelation`（在 lookup.py），以「查詢鍵值」為單位通知。
- **lookup 索引**：`Table.lookup_records()`（[table.py L493-L533](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/table.py#L493-L533)）透過 `_get_lookup_map()`（[L538-L556](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/table.py#L538-L556)）建立隱藏欄 `#lookup#Email`。它同時像資料庫索引、也像公式欄（依賴被查詢的欄，該欄一變就更新索引並通知受影響的鍵）；帶 `order_by` 時另建 `#lookup#Email#Date` 排序版。以參照欄當鍵的 lookup 直接沿用參照欄的反向索引。整套設計的說明在 [lookup.py 檔頭 L1-L50](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/lookup.py#L1-L50)，本體 `LookupMapColumn` 在 [L88-L194](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/lookup.py#L88-L194)。
- **三個特殊依賴**：
  - 讀不存在的欄會依賴 `_new_columns_node`，之後補建同名欄位時，原本報錯的公式會自動恢復（[table.py L675-L677](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/table.py#L675-L677)、[engine.py L1288-L1294](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L1288-L1294)）。
  - `NOW()` 依賴虛擬節點 `#now`（[engine.py L1296-L1311](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L1296-L1311)、[date.py L528-L538](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/date.py#L528-L538)）；Node 大約每小時送一次 `UpdateCurrentTime`（[ActiveDoc.ts L223-L224](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ActiveDoc.ts#L223-L224)），所以 `NOW()`、`TODAY()` 最多會晚一小時才更新。
  - `PEEK(...)` 暫時關掉依賴記錄（[info.py L540-L557](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/info.py#L540-L557)），用來打破刻意的循環。

### 4. 重算：標髒、排序、循環參照、錯誤

- **標髒**：`Graph.invalidate_deps()`（[depend.py L124-L164](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/depend.py#L124-L164)）用迴圈（不是遞迴，註解說遞迴曾經爆過堆疊）沿著每條邊的 relation 算出受影響的列，寫進 `recompute_map`；若是 `ALL_ROWS`（整欄失效）就順便清掉該欄的依賴，待會重算時重建。資料變更的入口例如 `BulkUpdateRecord`（[docactions.py L94-L125](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/docactions.py#L94-L125)）：寫值、記 undo、呼叫 `invalidate_records()`。
- **計算**：`_bring_all_up_to_date()`（[engine.py L648-L663](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L648-L663)）→ `_update_loop()`（[L571-L639](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L571-L639)）。工作項目依欄名排序，`#lookup` 索引永遠排最前面（[L641-L646](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L641-L646)）。`_recompute_step()`（[L764-L920](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L764-L920)）一次把同一欄的髒列照列號順序算完；巢狀讀到別的髒格時不往下遞迴，而是丟 `OrderError`（[L48-L67](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L48-L67)），外層迴圈把「被需要的格子」推到堆疊頂端先算，再回頭重試。
- **循環參照**：重排時把「等待中的格子」加進 `_locked_cells`；同一格又被要求時直接丟 `CircularRefError("Circular Reference")`。另有進度檢查，算不出任何新格子就丟 `data engine not making progress`，避免死迴圈。
- **算一格**：`_recompute_one_cell()`（[L959-L1031](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L959-L1031)）呼叫 `col.method(record, table.user_table)`，用不帶型別的 `except:` 接住所有例外（MemoryError 除外），把公式執行中產生的副作用倒回，再包成 `RaisedException`。
- **錯誤的傳遞**：`RaisedException` 編碼成 `["E", "ValueError", "foo"]` 存進格子（[objtypes.py L261-L273](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/objtypes.py#L261-L273)）；別的公式讀到時，`get_cell_value()` 會丟出 `CellError`，訊息像「ValueError in referenced cell Products[3].Cost」（[column.py L144-L169](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/column.py#L144-L169)、[objtypes.py L354-L369](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/objtypes.py#L354-L369)）。
- **結果會存檔**：只有值真的改變的格子才記進 `_changes_map`，最後由 `flush_calc_changes()` 併入 stored actions（[action_obj.py L41-L49](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/action_obj.py#L41-L49)），Node 會寫進 SQLite。所以 `.grist` 檔裡的公式欄也有值，其他程式直接讀 SQLite 就看得到計算結果。
- **改公式時**：`ModifyColumn` 會把該欄從 schema 拿掉、重產一次模組、再放回去、再重產一次（[docactions.py L210-L244](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/docactions.py#L210-L244)），強迫建立新的欄物件並重算整欄。

### 5. 沙盒：gVisor／Pyodide／其他

所有 flavor 列在 `spawners`（[NSandbox.ts L524-L539](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L524-L539)）；grist-core 的預設寫死為 `createSandbox("unsandboxed", options)`（[ICreate.ts L196-L198](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ICreate.ts#L196-L198)），可用 `GRIST_SANDBOX_FLAVOR` 覆蓋（[createSandbox L1357-L1369](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L1357-L1369)）。

| flavor | 隔離方式 | 程式位置 | 重點 |
|---|---|---|---|
| `unsandboxed`（預設） | 無，直接 spawn 主機 Python | [NSandbox.ts L801-L834](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L801-L834) | 註解直說「offers no protection to the host」：公式能 `import os` 讀寫主機檔案、連網 |
| `gvisor` | Google gVisor 的 `runsc`（使用者空間核心）＋OCI 設定 | [NSandbox.ts L909-L1007](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L909-L1007)、[gvisor/run.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/gvisor/run.py#L81-L139) | 根目錄唯讀、多數目錄蓋上空 tmpfs、pid／network 等命名空間隔離、`RLIMIT_NPROC` 預設 8（防 fork 炸彈）、可用 `GVISOR_LIMIT_MEMORY` 限記憶體；`runsc ... -network none`（[run.py L248-L257](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/gvisor/run.py#L248-L257)）；支援 checkpoint／restore 加快啟動；可量測 CPU／記憶體並節流 |
| `pyodide` | Python 編譯成 WebAssembly，由 Deno 執行 | [NSandbox.ts L836-L900](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L836-L900)、[SandboxPyodide.ts L29-L122](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/SandboxPyodide.ts#L29-L122)、[pipe.js](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/pyodide/pipe.js#L158-L190) | Deno 只開放特定目錄讀、快取目錄寫；載完套件就 `Deno.permissions.revoke` 撤銷寫入與大部分讀取權限再跑使用者程式碼；`setTimeout` 在非管理模式下直接丟錯。設 `GRIST_PYODIDE_SKIP_DENO=1` 會改用 Node 跑，註解直說較不安全。版本：pyodide 0.28.1、deno 2.6.3（[worker/package.json](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/pyodide/worker/package.json#L6-L9)） |
| `macSandboxExec` | macOS 的 `sandbox-exec`，profile 以 `(deny default)` 起頭 | [NSandbox.ts L1068 起](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L1068-L1090) | 只限 macOS，預設拒絕一切（含網路） |
| `docker` | 每份文件一個容器 | [NSandbox.ts L1015-L1058](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L1015-L1058) | `--network none`、程式碼唯讀掛載；無法做行程節流 |
| `sandboxed` | 自動挑選 | [NSandbox.ts L785-L792](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/NSandbox.ts#L785-L792) | 有 runsc 用 gvisor，否則 sandbox-exec，否則 pyodide |

- 官方 Docker 映像檔裡**已經內建** runsc 與 pyodide 素材（[Dockerfile L63-L67、L83-L91、L134-L135](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/Dockerfile#L63-L135)），但沒有預設啟用；README 要你自己加 `--env GRIST_SANDBOX_FLAVOR=gvisor`（[README L185](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L185-L187)），開發模式的選項見 [README L319-L331](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L319-L331)。
- 沒有「單一公式逾時」機制。Node 端只保證「有動作卡住時，文件最多保持開啟 5 分鐘」，註解明說是為了防公式無窮迴圈（[ActiveDoc.ts L240-L244](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ActiveDoc.ts#L240-L244)）。
- 給你的建議：個人自用、只開自己做的文件，用預設也還好；只要會匯入別人的範本或開放別人編輯公式，至少設 `pyodide`（任何作業系統都能用），Linux 主機上用 `gvisor` 最穩。

### 6. 資料模型：表格／欄／參照

- **中繼資料**：`schema.py` 定義 24 張 `_grist_*` 中繼資料表（我數 `AddTable(` 出現 24 次），`SCHEMA_VERSION = 47`（[L16](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/schema.py#L16)）。產生程式碼只需要其中兩張：`_grist_Tables`（[L47-L65](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/schema.py#L47-L65)：tableId、summarySourceTable、onDemand、locked…）與 `_grist_Tables_column`（[L68-L105](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/schema.py#L68-L105)：colId、type、isFormula、formula、visibleCol、displayCol、reverseCol、recalcWhen、recalcDeps、rules…）。引擎就是靠這兩張表「自我描述」，見 `load_meta_tables()`（[engine.py L309-L325](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L309-L325)）。
- **儲存方式**：每一欄是一個以列號（row_id）為索引的 Python list（[column.py L57-L246](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/column.py#L57-L246)）；第 0 列永遠是「全預設值的空記錄」；`id` 欄大於 0 才算活著（[table.py L190-L209](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/table.py#L190-L209)）。
- **欄位型別**：Text、Numeric、Int、Bool、Date、DateTime、Choice、ChoiceList、Ref、RefList、Attachments、Any，另有內部用的 Id、ManualSortPos、PositionNumber；預設值表在 [usertypes.py L35-L52](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/usertypes.py#L35-L52)，型別對應到哪個 Column 類別在 [column.py L771-L784](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/column.py#L771-L784)。日期存成「Unix 秒數」浮點數，給公式時才轉成 `date`／`datetime`（[column.py L293-L319](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/column.py#L293-L319)）。對外 API 的格式整理在 [grist-data-format.md L23-L50](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/documentation/grist-data-format.md#L23-L50)。
- **參照**：Ref 存目標列的 id（0 代表空），RefList 存 id 清單（[column.py L609-L753](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/column.py#L609-L753)）。公式裡 `$Product` 拿到 Record，`$Product.Cost` 可以一路串下去；RefList 拿到 RecordSet。雙向參照（`reverseCol`）會在寫入時自動算出另一邊的調整（[column.py L556-L572](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/column.py#L556-L572)）。
- **Record／RecordSet**（[records.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/records.py#L10-L119)）：Record 很輕，只有 `_row_id` 與 `_source_relation`。RecordSet 可 `len()`、可迴圈，`rs.Qty` 會回傳一整串值；`find.lt／le／gt／ge／eq` 可在排序好的結果上做二分搜尋（[L246-L307](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/records.py#L246-L307)）——「查某日期當時的進價」一行就寫完。
- **彙總表（相當於樞紐分析）**：命名規則 `Products_summary_Category`（[summary.py L80-L87](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/summary.py#L80-L87)），提供 `$group` 欄；數字欄的預設公式是 `SUM($group.X)`（[L20-L23](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/summary.py#L20-L23)）。來源表會多一個隱藏的 `#summary#...` 輔助欄維護分組（[summary_helper.py L9-L22](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/summary_helper.py#L9-L22)）。
- **隱藏欄**：`#` 開頭的欄（lookup 索引、彙總輔助）是虛擬欄，永遠不會離開沙盒；`gristHelper_` 開頭的欄不顯示給使用者（[column.py L31-L42](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/column.py#L31-L42)）。
- **存取規則／下拉選單條件不在沙盒裡執行**：它們長得像 Python，但只是由 Python 解析成樹（[predicate_formula.py L18-L36](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/predicate_formula.py#L18-L36)），再由 Node 編譯成 JS 函式（[PredicateFormula.ts L1-L10](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/common/PredicateFormula.ts#L1-L10)）。

### 7. Excel 相容函數：數量與位置（自己數）

**怎麼數的**：`functions/__init__.py` 用 `from .xxx import *` 匯入 9 個模組，再匯出所有「不以底線開頭的大寫名稱」（[L1-L13](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/__init__.py#L1-L13)）。我寫了一支只用 `ast.parse` 的腳本（不 import、不執行專案程式碼），逐檔找頂層大寫 `def`，`schedule.py` 依其 `__all__` 只算 `SCHEDULE`；再檢查是否掛 `@unimplemented`——這個裝飾器只是設定 `func.unimplemented = True`，讓自動完成與說明文件把它藏起來（[unimplemented.py L1-L11](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/unimplemented.py#L1-L11)）。接著逐一檢查函式本體：81 個只有一行 `raise`，`REQUEST` 有完整實作（[info.py L701-L735](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/info.py#L701-L735)，註解說是 beta 期間故意標成未實作）。沒掛裝飾器的 148 個中，沒有「偷偷只丟例外」的空殼。

| 模組（檔案） | 名稱數 | 可用 | 空殼 | 空殼名單 |
|---|---|---|---|---|
| [date.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/date.py#L1-L986) | 24 | 24 | 0 | — |
| [info.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/info.py#L1-L802) | 19 | 15＋REQUEST | 3 | CELL、ISBLANK、TYPE |
| [logical.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/logical.py#L1-L165) | 7 | 7 | 0 | — |
| [lookup.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/lookup.py#L1-L211) | 17 | 3 | 14 | ADDRESS、CHOOSE、COLUMN、COLUMNS、GETPIVOTDATA、HLOOKUP、HYPERLINK、INDEX、INDIRECT、LOOKUP、MATCH、OFFSET、ROW、ROWS |
| [math.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/math.py#L1-L900) | 57 | 53 | 4 | SUBTOTAL、SUMIF、SUMIFS、SUMSQ |
| [stats.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/stats.py#L1-L696) | 73 | 14 | 59 | LARGE、SMALL、PERCENTILE、QUARTILE、CORREL、FORECAST、MODE、VAR、AVERAGEIF(S)… 等 59 個 |
| [text.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/text.py#L1-L757) | 29 | 28 | 1 | TEXT |
| [schedule.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/schedule.py#L1-L333) | 1 | 1 | 0 | — |
| [prevnext.py](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/prevnext.py#L1-L70) | 3 | 3 | 0 | — |
| **合計** | **230** | **148＋1** | **81** | |

**148 個可用函數的來源分類**（依函數名稱與 docstring 自行判斷，沒有逐一比對 Excel 的實際行為）：
- **與 Excel 同名、語意大致相同：122 個**。日期 19（DATE、DATEDIF、EDATE、EOMONTH、NETWORKDAYS、WEEKDAY、YEARFRAC…）、資訊 9（ISERROR、ISNUMBER、ISTEXT、N、NA…）、邏輯 7（IF、IFERROR、AND、OR、NOT、TRUE、FALSE）、數學 51（SUM、ROUND、ROUNDUP、ROUNDDOWN、MROUND、CEILING、FLOOR、MOD、SUMPRODUCT、RAND、ROMAN…）、統計 13（AVERAGE、COUNT、COUNTA、MAX、MIN、MEDIAN、STDEV…）、文字 23（LEFT、MID、RIGHT、LEN、FIND、SEARCH、SUBSTITUTE、TRIM、VALUE、CONCAT…）。
- **與 Google 試算表同名：5 個**——ISEMAIL、ISURL、REGEXEXTRACT、REGEXMATCH、REGEXREPLACE。
- **Grist 自創或語意與 Excel 不同：21 個**（另加 REQUEST）——DATEADD、DTIME、XL_TO_DATE、DATE_TO_XL、MOONPHASE、ISREF（判斷是否為表格記錄）、ISREFLIST、PEEK、RECORD、CONTAINS、SELF_HYPERLINK、**VLOOKUP（寫法是 `VLOOKUP(表, 欄=值)`，等於 `lookupOne`，見 [lookup.py L130-L151](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/lookup.py#L130-L151)）**、NUM、UUID、AVERAGE_WEIGHTED、PHONE_FORMAT、TASTEME（彩蛋）、SCHEDULE、PREVIOUS、NEXT、RANK（排的是記錄名次，不是 Excel 的 `RANK(數值, 範圍)`，見 [prevnext.py L1-L70](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/prevnext.py#L1-L70)）。

**完全不存在**（我逐一 grep `def 名稱(` 確認）：COUNTIF、COUNTIFS、COUNTBLANK、XLOOKUP、FILTER、SORT、UNIQUE、IFS、SWITCH、TEXTJOIN、PMT、NPV、IRR、FV、PV、RATE。

**品質**：9 個模組的 docstring 裡共有 782 行 `>>>` 範例（我用 grep 數），`test_functions.py` 把它們全部轉成單元測試（[L29-L41](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/test_functions.py#L29-L41)），每個函數怎麼用、會回什麼，看 docstring 最準。

**你在 Excel 的習慣寫法，在 Grist 改寫成 Python**（以常見電商／倉儲需求示意，未實測）：

| 需求 | Excel | Grist 公式 |
|---|---|---|
| 某商品總銷量 | `=SUMIF(銷售!B:B,A2,銷售!C:C)` | `sum(Sales.lookupRecords(Product=$id).Qty)` |
| 已出貨訂單數 | `=COUNTIF(訂單!C:C,"已出貨")` | `len(Orders.lookupRecords(Status="已出貨"))` |
| 依 SKU 查售價 | `=XLOOKUP(A2,商品!A:A,商品!C:C)` | `Products.lookupOne(SKU=$SKU).Price` |
| 查「下單當天適用」的進價 | 很難寫 | `Costs.lookupRecords(Product=$Product, order_by="Start").find.le($Date).Cost` |
| 加權平均成本 | `=SUMPRODUCT(...)/SUM(...)` | `AVERAGE_WEIGHTED((p.UnitCost, p.Qty) for p in Purchases.lookupRecords(Product=$id))`（[stats.py L76-L97](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/functions/stats.py#L76-L97)） |
| 千分位格式 | `=TEXT(A2,"#,##0")` | `"{:,.0f}".format($Amount)` |
| 多條件分級 | `=IFS(...)` | 多行 Python `if／elif／else` |
| 呼叫外部 API 取匯率、比價 | 無 | `REQUEST(url).json()`（beta，需設 `GRIST_ENABLE_REQUEST_FUNCTION`，見 [outgoingRequests.ts L26-L28](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/outgoingRequests.ts#L26-L28)） |

---

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. [documentation/overview.md L36-L60](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/documentation/overview.md#L36-L60)：先搞懂「開檔 → 載入 → User Action → Doc Action」的大流程。
2. `sandbox/grist/usercode.py`（68 行）：產生出來的程式碼長什麼樣子，看完就懂 `rec`、`table`、`@grist.UserTable`。
3. `main.py` → `sandbox.py`：入口與管線 RPC，各 200 行內。
4. `engine.py`：依序看類別說明 L108-L139 → `apply_user_actions` L1329 → `_use_node` L523 → `_update_loop` L571 → `_recompute_step` L764 → `_recompute_one_cell` L959。
5. `depend.py`（164 行）＋`relation.py`（157 行）：依賴圖與列對應，是最值得精讀的兩個小檔。
6. `table.py`：`UserTable`（公式看得到的 API）、`lookup_records`、`_add_field_to_record_classes`。
7. `column.py`：欄資料怎麼存、型別轉換、參照欄的反向索引。
8. `records.py`：Record、RecordSet、`find.*`。
9. `lookup.py`：先讀檔頭 L1-L50 的長註解，再看 `LookupMapColumn`。
10. `codebuilder.py`＋`gencode.py`：公式轉譯與模組產生。
11. `docactions.py`（301 行）細讀；`useractions.py`（2,716 行）只要瀏覽方法名稱。
12. `functions/*.py`：挑你要的函數看 docstring 與 `>>>` 範例。
13. Node 端：`NSandbox.ts` 的 `spawners` L524 與各 flavor 函式 → `SandboxPyodide.ts` → `sandbox/pyodide/pipe.js` → `sandbox/gvisor/run.py`。
14. [test_engine.py L28-L48、L317-L380](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/test_engine.py#L317-L380)：怎麼用純 Python 驅動引擎，想自己拆出來用時最實用。

---

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 可借用的部分 | 檔案 | 相依 | 難度 | 怎麼接 |
|---|---|---|---|---|
| A. 依賴圖＋列層級重算 | `depend.py`＋`relation.py`＋`lookupset.py`（共 368 行） | 只有 `sortedcontainers` | 低 | 最推薦。請 Claude Code 照這三個檔改寫成 JS，放進你的 Firebase 倉儲 App：每個「計算欄」是一個 Node，Firestore 文件一變就 `invalidate`，只重算受影響的列 |
| B. 整個引擎嵌進 Python 後端 | `sandbox/grist/` 整包＋`requirements.txt`（19 個釘版套件） | astroid、asttokens、friendly-traceback、python-dateutil、sortedcontainers、phonenumberslite、roman、chardet、openpyxl… | 中高 | 照測試的寫法驅動（見下方範例），可放在 Cloud Run 之類的 Python 服務；要自己組 AddTable／AddColumn 動作，結果用 `fetch_table()` 取回 |
| C. 引擎直接在瀏覽器跑 | grist-core 的 [bundle_as_wheel.sh](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/bundle_as_wheel.sh#L1-L17) 打包 wheel；grist-static 的 [webworker.js L23-L68](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/pipe/webworker.js#L23-L68) 與 [create.ts L60-L96](https://github.com/gristlabs/grist-static/blob/e4aa8369de0229edba33058c9afe1c56e3a7adca/ext/app/server/lib/create.ts#L60-L96) | Pyodide＋上述套件的 wheel | 中 | grist-static 在 Web Worker 裡 `loadPyodide()`、載入 `grist-1.0-py3-none-any.whl`，把 `sandbox.run` 換成空函式，主執行緒用 `postMessage({type:'call', name, args})` 呼叫引擎；整個介面只有 `ISandbox`（[ISandbox.ts L25-L32](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/app/server/lib/ISandbox.ts#L25-L32)）的 5 個方法。適合 Firebase Hosting 這種純靜態主機；首次載入 Pyodide 的下載量與速度未實測 |
| D. 公式轉譯器 | `codebuilder.py`＋`gencode.py`＋`textbuilder.py` | asttokens、astroid、friendly-traceback | 中 | 想讓使用者「用 `$欄位` 寫 Python 公式」時直接搬；`$` 換 `rec.`、自動補 return、lazy IF、語法錯誤定位都現成 |
| E. 函數庫 | `functions/*.py` | 多數只用標準庫＋dateutil | 低 | 純函式可單檔抄（例如日期類的 DATEDIF、EOMONTH、NETWORKDAYS）；注意 `NOW`、`PEEK`、`REQUEST` 會透過 `docmodel.global_docmodel` 碰引擎，抽出時要改成 stub |
| F. AI 公式提示產生器 | [formula_prompt.py L155-L166](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/formula_prompt.py#L155-L166)（全檔 270 行） | asttokens | 低 | 把你的 Firestore 結構翻成「class 商品: 名稱: str、成本: float…＋`def 毛利(rec: 商品) -> float:`」再請 Claude 補完；`convert_completion()` 示範如何從回覆的 markdown 抽出程式碼。Grist 本身接 Claude 的設定見 [README L193-L246](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/README.md#L193-L246) |
| G. 安全的條件運算式 | `predicate_formula.py`（165 行）＋`PredicateFormula.ts`（337 行） | 無特殊相依 | 低 | 讓使用者寫「Python 語法的簡單條件」（例如折扣規則），解析成 JSON 樹後在 JS 端求值，不必執行任意程式碼 |

**路線 B 的最小範例**（改寫自 [test_engine.py L43-L48](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/test_engine.py#L43-L48) 與 `test_lookup_find.py` 的 AddTable 用法；需在 `sandbox/grist` 為 PYTHONPATH、裝好 requirements 的 Python 3.11 下執行，未實測）：

```python
import engine, useractions
eng = engine.Engine()
eng.load_empty()
def ua(*a):
    return eng.apply_user_actions([useractions.from_repr(list(a))])

ua("AddTable", "Products", [dict(id="Name", type="Text"), dict(id="Cost", type="Numeric")])
ua("AddTable", "Sales", [dict(id="Product", type="Ref:Products"), dict(id="Qty", type="Numeric")])
ua("AddColumn", "Products", "Sold",
   dict(isFormula=True, formula="sum(Sales.lookupRecords(Product=$id).Qty)"))
ua("AddRecord", "Products", None, dict(Name="杯子", Cost=80))
ua("AddRecord", "Sales", None, dict(Product=1, Qty=3))
print(eng.fetch_table("Products"))   # 預期 Sold 欄為 3（未實測）
```

**授權提醒**：grist-core 與 grist-static 都是 Apache-2.0。抄程式碼進你的專案，保留原檔授權標頭並附上 LICENSE／NOTICE 即可；改寫成 JS 屬於衍生作品，同樣建議在檔頭註明出處。

---

## 坑與限制

1. **不是儲存格式試算表**：沒有 A1 位址、沒有跨格範圍；匯入 .xlsx 時用 `openpyxl.load_workbook(..., data_only=True)`（[import_xls.py L42-L49](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/imports/import_xls.py#L42-L49)），**Excel 公式不會被匯入，只留下最後算好的值**。
2. **函數覆蓋面窄**：可用 149 個；同批 Univer 深入資料包自數的可用函數是 511 個。COUNTIF、XLOOKUP、財務函數都沒有，只能改寫成 Python。
3. **全記憶體模型**：所有非 on-demand 表格都整份載入 Python，同一份資料在瀏覽器分頁裡還有一份；每次開檔都會重算全部公式（推論）。程式註解也提到列號太稀疏時很浪費記憶體（[engine.py L94-L97](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L94-L97)）。
4. **預設沒有沙盒**：grist-core 預設 `unsandboxed`，公式就是任意 Python。分享文件前務必設定 `GRIST_SANDBOX_FLAVOR`。
5. **無單一公式逾時**：寫出無窮迴圈會卡住整份文件，只能等 Node 端 5 分鐘的上限或重開文件。
6. **一個行程只能有一個引擎**：`docmodel.global_docmodel` 是模組層級的全域變數（[docmodel.py L182-L194](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/docmodel.py#L182-L194)），`NOW`、`PEEK`、`REQUEST` 都透過它找引擎；想在同一個 Python 行程同時開多份文件，或在多執行緒伺服器裡共用，都會出事。
7. **時間函數不即時**：`NOW()`／`TODAY()` 大約一小時才更新一次；要固定某個時間點請用觸發公式。
8. **REQUEST 仍是 beta**：預設關閉；回應依參數雜湊快取，而且公式會跟著時間節點每小時重抓一次（[engine.py L922-L957](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/sandbox/grist/engine.py#L922-L957)），拿來做比價要注意呼叫次數。
9. **改名自動更新有盲點**：靠 astroid 推論，像 `getattr(rec, "Col" + x)` 這種動態寫法不會被改到（依原理推論，未實測）。
10. **改結構的成本**：每次改公式或改欄位都會重產整個模組（`ModifyColumn` 還產兩次），欄位很多的大文件改結構時可能有感延遲（推論，未實測）。
11. **各 flavor 的 Python 版本不同**：Docker 映像檔用 Python 3.11（[Dockerfile L73-L74](https://github.com/gristlabs/grist-core/blob/484236f6abc960ed7dadade5c2b714465492a063/Dockerfile#L73-L74)），pyodide 0.28.1 內附的 Python 版本我沒查證；同一條公式在不同 flavor 下行為是否完全一致，未確認。
