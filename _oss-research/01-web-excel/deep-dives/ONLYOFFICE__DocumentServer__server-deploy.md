# ONLYOFFICE/DocumentServer｜深入：伺服器、協作與部署
> 深入分析｜掃描日期：2026-11-04｜commit：c4ad98d｜總覽資料包：_oss-research/01-web-excel/ONLYOFFICE__DocumentServer.md

**本次實際讀過的程式碼版本**（DocumentServer 只是「總目錄」，伺服器與轉檔器都在子專案裡，所以一起 clone 來讀）：

| 專案 | 角色 | 讀取的 commit | 備註 |
|---|---|---|---|
| ONLYOFFICE/DocumentServer | 總目錄（meta repo） | `c4ad98d`（2026-10-26） | 本文主 commit |
| ONLYOFFICE/server | Node.js 後端 | `f037d2c`（與 tag v10.0.0.176 的檔案樹完全相同） | 即 DocumentServer 釘選的版本 |
| ONLYOFFICE/core | x2t 轉檔器（C++） | `ed63e94` | 釘選版本，只取 X2tConverter 等 |
| ONLYOFFICE/web-apps | 嵌入用 `api.js` | `493e500`（tag v10.0.0.176） | 釘選的 `848568f` 無法 fetch |
| ONLYOFFICE/sdkjs | 瀏覽器端協作傳輸 | `c1a29cc`（tag v10.0.0.176） | 釘選的 `6423d2d` 無法 fetch |
| ONLYOFFICE/Docker-DocumentServer | Docker 映像 | `35bee8f`（master，2026-11-03） | 不是子模組 |
| ONLYOFFICE/document-server-integration | 官方整合範例 | `0fdf1dd`（master） | Apache-2.0 |
| ONLYOFFICE/core-fonts | 內建字型 | `7030c66`（釘選版本） | 只看檔名清單 |

---

## 重點結論（5–10 點）

1. **DocumentServer 本身幾乎沒有程式碼。** `git ls-tree` 只有 22 個項目，其中 8 個是子模組連結（core、core-fonts、dictionaries、document-formats、document-templates、sdkjs、server、web-apps）。`.gitmodules` 列了 18 個，但 10 個外掛子模組已不在檔案樹中（[.gitmodules](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/.gitmodules#L1-L18)、[Readme 元件說明](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L50-L61)）。
2. **v9.4 起社群版是「單一行程＋全記憶體」。** 公開的 server 原始碼裡，資料庫、RabbitMQ 的模組都直接改指向記憶體版（例如 [baseConnector.js](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/databaseConnectors/baseConnector.js#L36-L37) 只有一行 `require('./memoryConnector')`）；社群版 Docker 映像也不再安裝 PostgreSQL／Redis／RabbitMQ。官方 9.4.0 更新紀錄明寫「移除 20 份同時開啟文件的限制、合併成單一行程、移除 RabbitMQ 與資料庫依賴」（[CHANGELOG](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L702-L709)）。
3. **網路上「社群版只有 20 個連線」已是舊資訊。** v9.3 的 `license.js` 還是 `connections: LICENSE_CONNECTIONS`（=20）；v9.4 起改成 `LICENSE_CONNECTIONS_OS = 0x7fffffff`（等於不限），改由「記憶體守門員」限制同時可編輯的文件數。但 README 的版本比較表仍寫「建議最多 20 位使用者」。
4. **協作＝socket.io＋鎖＋變更紀錄。** 伺服器端的 socket 訊息處理共 16 種；試算表的鎖分「範圍／物件／工作表」三類，有人插入或刪除列、欄時，伺服器會幫其他人重算鎖的座標。這是做「網頁版 Excel 多人同時編輯」最值得學的設計。
5. **存檔是「事後組裝」，不是即時寫回你的伺服器。** 編輯中的變更只存在 Document Server；最後一人離開（或強制存檔）後，FileConverter 呼叫 x2t 把「原檔＋變更」組回 xlsx，再 POST 到你的 `callbackUrl`（status 2 或 6）。你必須下載 `url` 並回 `{"error":0}`，否則檔案會被收進「forgotten」備援區。
6. **x2t 是可獨立使用的 C++ 命令列工具。** 輸入一個 `params.xml`（來源、目的、格式代碼…），Node 端用 spawn 呼叫；存檔時是在 x2t 內嵌的 JS 引擎（DoctRenderer）裡「重播」變更。社群版的轉檔器直接跑在 DocService 行程內，只有一個工作者。
7. **Docker 部署一行就能跑，但有 4 個必踩點：** JWT 預設開啟且金鑰隨機產生（要用 `JWT_SECRET` 固定）；建議 4GB RAM／雙核／2GB swap；繁體中文只有替代字型（文泉驛正黑、AR PL UKai、Droid Sans Fallback），微軟正黑體等要自己掛；你的網址不能寫 `localhost`（在容器裡指的是容器自己）。
8. **授權是 AGPL-3.0 加上第 7 條附加條款：** 保留署名、修改要註明日期並標示「基於 ONLYOFFICE」、介面要能看到法律聲明並指出 ONLYOFFICE 是原開發者、不授權商標（[LICENSE 附加條款](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/LICENSE#L663-L728)）。官方整合範例 document-server-integration 則是 Apache-2.0。
9. **套用到你的倉儲 App（Firebase）：** Document Server 不能放在 Firebase Hosting，要另一台能跑 Docker 的主機；「幫編輯器設定簽 JWT」與「接收 callback 存檔」一定要在後端（例如 Cloud Functions），金鑰不能出現在前端 JS。

---

## 逐題詳解

### Q1｜ONLYOFFICE/server：DocService 協作

**規模（我自己用 `find … -name '*.js' | xargs cat | wc -l` 計算，不含 tests）：** DocService 35 檔 16,473 行、Common 27 檔 8,921 行、FileConverter 6 檔 2,996 行、Metrics 1 檔 144 行；合計主程式 28,390 行。最大的檔案是 `DocsCoServer.js`（5,034 行）與 `canvasservice.js`（2,388 行）。另有 49 個測試檔。

**整體架構（依程式碼整理）：**

```
你的網頁
 └─ <script src="https://<DS>/web-apps/apps/api/documents/api.js">
     └─ iframe：web-apps 介面 ＋ sdkjs 試算表引擎
          │ socket.io（path /doc/），JWT 放在 handshake.auth
          ▼
DocService（Node.js，設定預設埠 8000）
 ├─ DocsCoServer.js   登入、鎖、變更、廣播、存檔計時、/command
 ├─ canvasservice.js  開檔/存檔任務、呼叫 callback
 ├─ converterservice.js  /converter 轉檔 API
 ├─ 記憶體版：變更紀錄、任務結果、pubsub、任務佇列（社群版）
 └─ embeddedConverter → FileConverter/converter.js
                         └─ spawn x2t（C++）＋ params.xml
你的伺服器
 ├─ document.url ：讓 Document Server 下載原始檔
 └─ callbackUrl  ：接收狀態通知與「存好的檔案網址」
```

- 路由總表在 [server.js](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/server.js#L279-L329)：`/command`、`/converter`、`/converter/from-file`、`/downloadas/:docid`、`/healthcheck`、`/docbuilder`、`/info`、`/internal/cluster/inactive` 等。我用 grep 數 `app.get/post/put/delete/use(` 共 45 處（含 middleware 與錯誤處理器）。
- 啟動順序：`docsCoServer.install()` 掛上 socket.io → `embeddedConverter.start()` 在同一行程啟動轉檔器 → `server.listen()`（[server.js L192-L212](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/server.js#L192-L212)）。
- 社群版判斷：`isMemoryRuntime()` 只要授權類型是開源版（`PACKAGE_TYPE_OS`）就一律回傳 true（[profile.js L53-L64](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/runtime/profile.js#L53-L64)），而公開版 `license.js` 永遠回傳開源版（[license.js L43-L73](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/license.js#L43-L73)）。所以從 GitHub 原始碼建出來的一定是記憶體模式。佐證：[pubsubRabbitMQ.js L37](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/pubsubRabbitMQ.js#L37)、[taskqueueRabbitMQ.js L37](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/taskqueueRabbitMQ.js#L37) 都只是轉指到 Memory 版；[memoryConnector.js 開頭註解](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/databaseConnectors/memoryConnector.js#L35-L45)寫明「沒有 SQL、重啟後不保留」。

**開檔流程：**
1. `api.js` 建立 iframe（[api.js L402-L444](https://github.com/ONLYOFFICE/web-apps/blob/493e500c56ec96ccaa0452ab092cbce23b6dcc2e/apps/api/documents/api.js#L402-L444)、[createIframe](https://github.com/ONLYOFFICE/web-apps/blob/493e500c56ec96ccaa0452ab092cbce23b6dcc2e/apps/api/documents/api.js#L1289-L1311)）。
2. sdkjs 以 socket.io 連線，把設定的 token 放在 `auth.token`（[docscoapi.js L1845-L1870](https://github.com/ONLYOFFICE/sdkjs/blob/c1a29cc83824661d799711be14ef12b6125302f3/common/docscoapi.js#L1845-L1870)）；伺服器在 `io.use` 驗 JWT（[DocsCoServer.js L1961-L1991](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L1961-L1991)）。
3. `auth` 訊息：token 內一定要有 `document.key`、`document.url`；有 callback 就要有 `editorConfig.callbackUrl`；非唯讀要有 `editorConfig.mode`（[validateAuthToken L2792-L2808](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L2792-L2808)）。
4. 第一次開這個 key：建立轉檔任務，輸出檔名固定為 `Editor.bin`（編輯器內部格式），優先權 HIGH（[canvasservice.js L574-L628](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/canvasservice.js#L574-L628)）。轉好後瀏覽器下載 `Editor.bin` 開始編輯。

**編輯流程（鎖＋變更）：** socket 訊息分派在 [L2052-L2140](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L2052-L2140)，我用 grep 數 `case '…'` 共 16 種：auth、message（聊天）、cursor、getLock、saveChanges、isSaveLock、unSaveLock、getMessages、unLockDocument、close、openDocument、clientLog、extendSession、forceSaveStart、rpc、authChangesAck。唯讀使用者送 getLock／saveChanges 會被直接斷線。

- **試算表的鎖**：`getLock` 依編輯器類型選檢查函式（[L3638-L3686](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L3638-L3686)）；文書編輯器直接回 true，試算表走 `_checkLockExcel`（[L3923-L3980](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L3923-L3980)）。鎖的種類定義在 [L269-L289](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L269-L289)。衝突判斷在 `compareExcelBlock`（[L2622-L2665](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L2622-L2665)）：
  - 範圍鎖：兩個矩形（c1,c2,r1,r2）有交集才衝突；
  - 工作表鎖：有人鎖了工作表，其他人就不能再鎖任何工作表（註解寫：避免大家把工作表全刪光）；
  - 物件鎖（圖表、圖片）：同一個 ID 才衝突；
  - 兩個人同時做「插入／刪除列欄」這類結構變更（雙方的鎖都有 subType）一定衝突；但一般範圍鎖不會被別人的「插入列／欄」鎖擋住；
  - 只改屬性（ChangeProperties）的鎖，只有碰到工作表鎖才算衝突。

```js
// DocsCoServer.js L2660-L2665：判斷兩個儲存格範圍是否重疊
function isInterSection(range1, range2) {
  if (range2.c1 > range1.c2 || range2.c2 < range1.c1 || range2.r1 > range1.r2 || range2.r2 < range1.r1) {
    return false;
  }
  return true;
}
```

- **變更**：`saveChanges`（[L3695-L3858](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L3695-L3858)）先取「存檔鎖」，把變更以遞增序號寫入變更紀錄，再透過 pubsub 廣播給同一文件的其他人。試算表會多帶 `excelAdditionalInfo`（插入/刪除了哪些列欄），伺服器據此用 `_recalcLockArray`（[L2544-L2589](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L2544-L2589)）平移其他人的鎖。瀏覽器端送出的格式見 [docscoapi.js L936-L941](https://github.com/ONLYOFFICE/sdkjs/blob/c1a29cc83824661d799711be14ef12b6125302f3/common/docscoapi.js#L936-L941)。
- 相關上限（[default.json L522-L530](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L522-L530)）：單則 WebSocket 訊息 1.5MB、單一文件變更總量 `maxChangesSize` 150MB。

**存檔流程：**
1. 有人斷線時 `closeDocument` 檢查：沒有編輯者且有變更 → `createSaveTimer`；使用者主動關閉或伺服器關機時不等待，否則等 `savetimeoutdelay` 5,000 毫秒（[L2305-L2326](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L2305-L2326)、[L1718-L1760](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L1718-L1760)）。
2. `saveFromChanges` 建立 `sfc` 任務，標記 `fromChanges`（[canvasservice.js L2149-L2215](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/canvasservice.js#L2149-L2215)）。
3. 轉檔器把變更下載到暫存的 `changes` 資料夾，交給 x2t 重播（見 Q2）。
4. `commandSfcCallback`（[L1168-L1522](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/canvasservice.js#L1168-L1522)）組好 callback 內容、POST 給你；HTTP 429 或 5xx 會依 `callbackBackoffOptions` 重試 3 次（[default.json L545-L555](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L545-L555)）；仍失敗或你沒回 `error:0` 就把結果複製到 forgotten。

**Command Service（`POST /command`）：** 我數 `commandHandle` 的 `case` 共 10 個：info、drop（踢人）、saved、forcesave、meta、getForgotten、deleteForgotten、getForgottenList、version、license（[L4775-L4896](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L4775-L4896)）。token 只允許 `c、key、callback、conv、meta、status、userdata、users` 等欄位（[jwtService.js L69](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/jwtService.js#L69)）。

### Q2｜FileConverter 與 core 的 x2t 轉檔

**社群版的轉檔器怎麼跑：**
- `embeddedConverter` 只在記憶體模式啟動；`maxprocesscount` 大於 1 會被忽略，固定「一個行程內訂閱者」（[embeddedConverter.js L66-L90](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/embeddedConverter.js#L66-L90)）。
- 獨立的 `convertermaster` 在記憶體模式下什麼都不做、只保持存活；企業版才會依 CPU 數 × `maxprocesscount` 開工作者，且受授權數上限（[convertermaster.js L44-L69](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/FileConverter/sources/convertermaster.js#L44-L69)）。
- 記憶體任務佇列註解寫明「每個接收者同時最多一個進行中的任務，ack 後才派下一個」（[taskqueueMemory.js L36-L57](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/taskqueueMemory.js#L36-L57)）。由此推論：社群版同一時間只轉一個檔，多人同時開大檔會排隊（推論，未實測）。

**一次轉檔做了什麼（`ExecuteTask`，[converter.js L1217-L1357](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/FileConverter/sources/converter.js#L1217-L1357)）：**
1. 從 `url` 下載原始檔（上限 `maxDownloadBytes` 100MB、逾時 2 分鐘），或從快取取 `Editor.bin`＋changes；
2. 把參數寫成 `params.xml`（[serialize L241-L291](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/FileConverter/sources/converter.js#L241-L291)）：`m_sFileFrom`、`m_sFileTo`、`m_nFormatTo`、CSV 編碼與分隔符號、`m_bFromChanges`、字型與佈景主題路徑、`m_oInputLimits`，以及 `<options>`（是否允許連網、是否允許私有 IP、代理伺服器）；
3. `spawnProcess` 執行 x2t，逾時以佇列的 `visibilityTimeout`（300 秒）為準，逾時就 kill（[L1147-L1215](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/FileConverter/sources/converter.js#L1147-L1215)）；
4. 依結束碼判斷成功、需要密碼、檔案損毀等，再把結果上傳到快取。
- 防「解壓炸彈」：xlsx 解壓後超過 300MB、docx/pptx 超過 50MB 就拒絕（[default.json L613-L642](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L613-L642)；x2t 端檢查在 [checkInputLimits](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/cextracttools.cpp#L952-L976)）。
- Linux 安裝路徑：x2t 在 `/var/www/onlyoffice/documentserver/server/FileConverter/bin/x2t`（[production-linux.json L70-L77](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/production-linux.json#L70-L77)）。

**x2t 本體（core）：**
- 用法：`x2t params.xml`，或 `x2t 來源檔 目的檔`（依副檔名判斷方向）（[main.cpp L80-L97](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/main.cpp#L78-L97)、[L129-L141](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/main.cpp#L129-L141)）。參數說明見 [X2tConverter/README.md](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/README.md#L1-L85)，其中 `m_bCsvAllSheets` 可把每個工作表各輸出一個 CSV（打包成 zip）。
- 記憶體上限：環境變數 `X2T_MEMORY_LIMIT`，預設 `4GiB`（[SystemUtils.h L64-L65](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/DesktopEditor/common/SystemUtils.h#L64-L65)、[main.cpp L99-L116](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/main.cpp#L99-L116)）。
- 試算表分派：`fromSpreadsheet` 中 CSV 直接轉成編輯器格式；xlsx 若是「從變更存檔」，先呼叫 `apply_changes`（[ASCConverters.cpp L1084-L1120](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/ASCConverters.cpp#L1084-L1120)）。
- `apply_changes` 在 x2t 內建立 `CDoctrenderer`（內嵌 JS 引擎，載入 sdkjs），把 `changes` 資料夾裡的變更依序套上去；某一筆出錯時記下錯誤序號、把結果標記為損毀，並以 `<Changes TopItem="序號">` 重跑一次（[getDoctXml L836-L838](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/cextracttools.cpp#L836-L838)；推論是只套用到出錯前為止，doctrenderer 內部未開檔確認），最後把 `changes.zip` 打包給 callback 用（[cextracttools.cpp L867-L928](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/cextracttools.cpp#L867-L928)）。這就是 callback 會出現 status 3（Corrupted）的原因。
- 格式代碼（[OfficeFileFormats.h L85-L100](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/Common/OfficeFileFormats.h#L85-L100)、[L151-L156](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/Common/OfficeFileFormats.h#L151-L156)）：XLSX＝0x0101（257）、XLS＝0x0102、ODS＝0x0103、CSV＝0x0104、XLSB＝0x0108、編輯器內部試算表格式 CANVAS_SPREADSHEET＝0x2002（8194）。

**對外的轉檔 API（不用打開編輯器也能用）：**
- `POST /converter`：JSON `{async, filetype, outputtype, key, title, url}`，回傳 `{fileUrl, fileType, percent, endConvert}` 或 `{error}`（[utils.js L896-L913](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/utils.js#L896-L913)）。
- 10.0 新增 `POST /converter/from-file`：multipart，欄位 `file`（只收 1 個檔）、`params`（JSON 字串）、`token`（[convertUpload.js L69-L93](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/middleware/convertUpload.js#L69-L93)、[convertFromFile.js L50-L62](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/convertFromFile.js#L50-L62)）；token 必須帶 `"operation":"converter"`（[jwtService.js L182-L230](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/jwtService.js#L182-L230)）。
- 可以關掉：`convertServiceEnable`、`docbuilderEnable`（[default.json L324-L359](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L324-L359)）。

### Q3｜Docker 部署需求

**官方建議規格**（[Docker README L54-L61](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/README.md#L54-L61)）：RAM 4GB 以上、雙核 2GHz 以上、swap 至少 2GB、硬碟至少 2GB 可用、64 位元 Linux（核心 3.8+）。版本需求寫 Docker 1.9.0 以上，但同一份 README 第 31 行又要求更新到新版 docker-engine（因為基底映像是 ubuntu:24.04），請以新版為準。

**社群版映像 vs 企業版映像：**
- 社群版 [Dockerfile](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/Dockerfile#L1-L47)：ubuntu:24.04＋官方 `.deb`＋supervisor、cron、certbot；開放 80/443；健康檢查打 `/healthcheck`。**沒有**安裝任何資料庫或訊息佇列。
- 企業版 [Dockerfile.enterprise L14-L48](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/Dockerfile.enterprise#L14-L48) 才會裝 PostgreSQL、Redis、RabbitMQ、MySQL/MSSQL/Oracle 用戶端。入口腳本也只在有版本後綴時才啟用 DB/Redis/RabbitMQ/Admin Panel（[run-document-server.sh L62-L64](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/run-document-server.sh#L62-L64)）。
- 社群版的資料卷只需要日誌、`Data`（憑證）、`/var/lib/onlyoffice`（檔案快取）三個（[README L83-L104](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/README.md#L83-L104)）。

**建議的啟動指令**（整合 README 與 compose 的設定；`--stop-timeout 60` 對應 compose 的 `stop_grace_period: 60s`）：

```bash
docker run -d --name onlyoffice -p 8080:80 \
  -e JWT_SECRET='請換成你自己的長隨機字串' \
  -v ~/onlyoffice/logs:/var/log/onlyoffice \
  -v ~/onlyoffice/data:/var/www/onlyoffice/Data \
  -v ~/onlyoffice/lib:/var/lib/onlyoffice \
  -v ~/onlyoffice/fonts:/usr/share/fonts/truetype/custom \
  --stop-timeout 60 --restart always \
  onlyoffice/documentserver
```

**重要環境變數**（[README L200-L229](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/README.md#L200-L229)、[run-document-server.sh L44-L51](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/run-document-server.sh#L44-L51)）：
- `JWT_ENABLED` 預設 true；`JWT_SECRET` 沒給就隨機產生 32 字元；同一個值會同時寫進 inbox／outbox／session／browser 四組金鑰（[L494-L504](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/run-document-server.sh#L494-L504)）。
- `JWT_HEADER`（預設 Authorization）、`JWT_IN_BODY`（預設 false）。
- `ALLOW_PRIVATE_IP_ADDRESS`（預設 false）、`WOPI_ENABLED`（預設 false）、`IP_FILTER_RULES`。
- `LETS_ENCRYPT_DOMAIN`／`LETS_ENCRYPT_MAIL`：自動申請 HTTPS 憑證。
- `GENERATE_FONTS`（預設 true，啟動時重建字型清單）、`EXAMPLE_ENABLED`（預設 false，內建測試範例）。

**關機要給時間：** 入口腳本攔截 SIGTERM 後會執行 `documentserver-prepare4shutdown`（[run-document-server.sh L153-L159](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/run-document-server.sh#L153-L159)），讓還沒存回去的變更組裝成 forgotten 檔（對應 server 端的 `/internal/cluster/inactive` 與 [shutdown.js](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/shutdown.js#L58-L61)；該腳本本體在安裝套件內，本次未開檔）。

**繁體中文字型：** core-fonts 的檔名清單裡，CJK 相關只有 `arphic-ukai/ukai.ttc`、`wqy-zenhei`、`droid/DroidSansFallbackFull.ttf` 與韓文 Nanum／Noto Sans KR 等（[core-fonts 樹](https://github.com/ONLYOFFICE/core-fonts/tree/7030c6681fb5bbed560675cb42422f91df15d5c9)，只看檔名、未開檔）。Docker 映像另外會裝微軟核心字型並檢查至少 30 個 ttf（[Dockerfile L33-L38](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/Dockerfile#L33-L38)）。若你的 Excel 用「微軟正黑體／新細明體」，要把有合法授權的字型放進 `/usr/share/fonts/truetype/custom`（映像有宣告這個資料卷，[Dockerfile L42](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/Dockerfile#L42)），否則欄寬、列印與 PDF 匯出會跑版。

### Q4｜把 Document Server 嵌進自己的網站（callback 存檔流程＋最小範例）

**三方關係：**
1. 你的後端產生編輯器設定並用 JWT 簽名 → 網頁載入 `api.js`，`new DocsAPI.DocEditor(…)`；
2. Document Server 依 `document.url` 下載原始檔、轉成 `Editor.bin`；
3. 編輯期間有人進出 → POST `callbackUrl`（status 1）；
4. 最後一人離開約 5 秒後 → 組裝 → POST `callbackUrl`（status 2，附 `url`）→ 你下載存檔 → 回 `{"error":0}`。

**callback 的 status（[DocsCoServer.js L241-L250](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L241-L250)）：**

| 值 | 名稱 | 何時送（依程式整理） |
|---|---|---|
| 0 | NotFound | 有定義，本次沒找到送出的路徑（未確認） |
| 1 | Editing | 有「編輯者」連上（唯讀者不送，[endAuth L3372-L3378](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L3372-L3378)），或有人離開但仍有人在編輯（[sendStatusDocument](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L1511-L1578)） |
| 2 | MustSave | 全員離開、組裝成功，附 `url` |
| 3 | Corrupted | 組裝出錯；若有產出仍會附 `url` |
| 4 | Closed | 全員離開且沒有任何變更 |
| 5 | MailMerge | 合併列印 |
| 6 | MustSaveForce | 強制存檔成功（按鈕、`/command forcesave`、計時） |
| 7 | CorruptedForce | 強制存檔出錯 |

**callback 內容欄位**（[OutputSfcData](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/commondefines.js#L841-L858)）：`key、status、url、changesurl、history、users、actions、userdata、lastsave、notmodified、forcesavetype、filetype、formsdataurl、token`。`actions[].type` 0＝離開、1＝進入、2＝按了強制存檔；`forcesavetype` 0＝指令、1＝按鈕、2＝計時、3＝表單（[commondefines.js L1184-L1205](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/commondefines.js#L1184-L1205)）。

**callback 的驗證方式**（[sendServerRequest L900-L930](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L900-L930)、[fillJwtForRequest](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/utils.js#L1403-L1431)）：同時送兩份 token——body 裡的 `token`（內容就是整包資料＋`operation:"callback"`），以及 `Authorization: Bearer …`（內容包在 `payload` 欄位裡）；演算法 HS256，有效 5 分鐘。

**最小範例（Node.js 20＋Express＋jsonwebtoken，我自己寫的示意程式碼，未實際執行）：**

```js
// server.js —— npm i express jsonwebtoken
const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const DS = 'http://192.168.1.10:8080';   // Document Server（瀏覽器連得到）
const APP = 'http://192.168.1.20:3000';  // 你的網站（Document Server 容器連得到，不能寫 localhost）
const SECRET = process.env.JWT_SECRET;   // 與 docker run 的 JWT_SECRET 相同
const DIR = path.join(__dirname, 'files');
const app = express();
app.use('/files', express.static(DIR));  // 讓 Document Server 下載原始檔

app.get('/', (req, res) => {
  const name = 'inventory.xlsx';
  const config = {
    documentType: 'cell',
    document: {
      fileType: 'xlsx', title: name,
      key: 'inv-' + Math.round(fs.statSync(path.join(DIR, name)).mtimeMs), // 每個版本換一個 key
      url: `${APP}/files/${name}`,
    },
    editorConfig: {
      mode: 'edit', lang: 'zh-TW',
      callbackUrl: `${APP}/callback?file=${encodeURIComponent(name)}`,
      user: { id: 'u1', name: '老闆' },
    },
  };
  config.token = jwt.sign(config, SECRET, { algorithm: 'HS256', expiresIn: '1h' });
  res.send(`<!doctype html><meta charset="utf-8">
<div id="ph" style="height:95vh"></div>
<script src="${DS}/web-apps/apps/api/documents/api.js"></script>
<script>new DocsAPI.DocEditor("ph", ${JSON.stringify(config)});</script>`);
});

app.post('/callback', express.json({ limit: '5mb' }), async (req, res) => {
  try {
    const raw = req.body.token || (req.get('Authorization') || '').replace(/^Bearer /, '');
    const v = jwt.verify(raw, SECRET, { algorithms: ['HS256'] });
    const body = v.payload || v;                      // header 版包在 payload 裡
    if ([2, 3, 6, 7].includes(body.status) && body.url) {
      const r = await fetch(body.url);                // 網址有時效，收到就下載
      if (!r.ok) throw new Error('download ' + r.status);
      const name = path.basename(req.query.file);
      const out = [3, 7].includes(body.status) ? name + '.corrupted.xlsx' : name;
      fs.writeFileSync(path.join(DIR, out), Buffer.from(await r.arrayBuffer()));
    }
    res.json({ error: 0 });                           // 一定要回 0，否則進 forgotten
  } catch (e) {
    console.error(e);
    res.json({ error: 1 });
  }
});
app.listen(3000);
```

重點說明：
- `documentType` 試算表用 `'cell'`（[api.js 設定說明 L38-L120](https://github.com/ONLYOFFICE/web-apps/blob/493e500c56ec96ccaa0452ab092cbce23b6dcc2e/apps/api/documents/api.js#L38-L120)）。`customization.autosave`／`forcesave` 與 `coEditing.mode`（`fast` 即時、`strict` 按存檔才同步）見 [L258-L310](https://github.com/ONLYOFFICE/web-apps/blob/493e500c56ec96ccaa0452ab092cbce23b6dcc2e/apps/api/documents/api.js#L258-L310)；可用事件（`onDocumentStateChange`、`onRequestSaveAs`…）見 [L324-L361](https://github.com/ONLYOFFICE/web-apps/blob/493e500c56ec96ccaa0452ab092cbce23b6dcc2e/apps/api/documents/api.js#L324-L361)。
- `key` 只能用英數與 `- . _ =`（[DOC_ID_REGEX](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/constants.js#L38-L41)）。長度上限我在 server 程式碼裡沒找到檢查（未確認）。
- 想「不必等所有人離開」就存回：呼叫 `POST /command`，body 與 token 內容為 `{"c":"forcesave","key":"…"}`，之後會收到 status 6。
- 官方 Node 範例（Apache-2.0）的對應寫法：[app.js `/track` L726-L760](https://github.com/ONLYOFFICE/document-server-integration/blob/0fdf1dd10674b19d61b3c50723018e67493f5086/web/documentserver-example/nodejs/app.js#L726-L760)、[status 分支 L982-L1003](https://github.com/ONLYOFFICE/document-server-integration/blob/0fdf1dd10674b19d61b3c50723018e67493f5086/web/documentserver-example/nodejs/app.js#L982-L1003)。

**換成你的 Firebase 架構（建議做法，未在本專案程式碼中驗證）：** 原始檔放 Cloud Storage，用有時效的簽名網址當 `document.url`；用一支 HTTPS Cloud Function 產生並簽名 config（先確認使用者已登入），另一支 Cloud Function 當 `callbackUrl`：驗 JWT → 下載 `url` → 寫回 Storage → 在 Firestore 記版本號（下次開檔的新 key）。Document Server 本身放在一台 4GB 以上、能跑 Docker 的 VM，並開 HTTPS（Firebase Hosting 是 HTTPS，瀏覽器會擋 HTTP 的 `api.js` 混合內容）。

### Q5｜社群版連線數等限制與 AGPL 授權

**連線數的演變（我 fetch 各版 tag 比對）：**
- v9.0～v9.3：開源版 `connections: constants.LICENSE_CONNECTIONS`（=20）（[v9.3 license.js L51](https://github.com/ONLYOFFICE/server/blob/97ad8af24ec404b82589b53f3427d4bb7e116eb6/Common/sources/license.js#L51)、[v9.3 constants.js L91](https://github.com/ONLYOFFICE/server/blob/97ad8af24ec404b82589b53f3427d4bb7e116eb6/Common/sources/constants.js#L91)）。
- v9.4 起：`connections: constants.LICENSE_CONNECTIONS_OS`（[v9.4 license.js L54](https://github.com/ONLYOFFICE/server/blob/13142e41dfc9e1c337bbe76f0222d4b2ce7efbc8/Common/sources/license.js#L54)），值為 `0x7fffffff`（[v10 constants.js L95-L97](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/constants.js#L95-L97)）。`LICENSE_CONNECTIONS = 20` 現在只用在商業授權過期後的寬限期。
- 仍會跑 `_checkLicenseAuth` 比對連線數（[L4065-L4148](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L4065-L4148)），只是上限極大。

**真正的限制：社群版記憶體守門員（[memoryGuard.js L62-L133](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/runtime/memoryGuard.js#L62-L133)，在 `auth` 時由 [applyCommunityMemoryAdmission L738-L776](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L738-L776) 呼叫）：**
- 每份文件預算＝max(`maxChangesSize`÷4, 20MiB)。預設 150MB → 37.5MiB。
- 可同時編輯的文件數＝floor((V8 heap 上限 − 256MiB) ÷ 每份預算)。我自己代入：heap 上限 2GiB 約 47 份、4GiB 約 102 份。打包版 DocService 實際的 heap 上限是多少，未確認。
- 另外，已用量＋37.5MiB 超過 heap 上限的 90% 也會擋。
- 被擋時不是報錯，而是**強制改成唯讀**（log 會出現 `forced view mode by community memory guard`）。已經有人在編輯的同一份文件、唯讀檢視者都不受限。註解寫明這個政策「刻意不可設定」。

**其他限制一覽（多數來自 [default.json](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L324-L359) 與 [Readme 表格](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L75-L98)）：**

| 項目 | 社群版 |
|---|---|
| 叢集／多台負載平衡 | 不支援（Readme「Clusterization: -」；pubsub、鎖都在單一行程記憶體） |
| 重啟後的編輯狀態 | 不保留（記憶體版）；正常關機會嘗試轉成 forgotten |
| 下載原始檔 | 100MB；上傳暫存 100MB |
| xlsx 解壓後大小 | 300MB |
| callback 逾時 | 10 分鐘，429／5xx 重試 3 次 |
| 閒置連線 | `sessionidle` 1 小時；session 最長 30 天（[expire L444-L466](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L444-L466)） |
| 快取保留 | 24 小時沒人開就清（`expire.files` 86400 秒，[gc.js](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/gc.js#L66-L112)） |
| Admin Panel、白牌、行動版網頁編輯、Document Builder 服務 | Readme 表格標示社群版沒有（但程式碼仍有 `/docbuilder` 路由，社群版能否使用未確認） |

**AGPL 授權，用白話說：**
- 主授權是 AGPL-3.0（[Readme L175-L179](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L175-L179)）。第 13 條（[LICENSE L540-L551](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/LICENSE#L540-L551)）：**如果你修改了程式**，又讓別人透過網路使用，就要讓這些使用者能取得你修改後的完整原始碼。
- 附加條款（[L663-L728](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/LICENSE#L663-L728)）：保留所有版權與授權聲明；修改版要寫明修改日期、標明基於 ONLYOFFICE；介面要有明顯的法律聲明，讓人知道原開發者是 ONLYOFFICE、可能是修改版、去哪裡看授權；不授權使用商標與標誌；插圖、圖示、文件等非程式內容另採 CC BY-SA 4.0。每個原始檔開頭也重申這些條件。
- 對你的情境：
  - 自己用、不改程式 → 沒有額外負擔。
  - 改了 ONLYOFFICE 程式碼，再給員工或客戶用 → 要提供修改後原始碼，並遵守附加條款。
  - 把 ONLYOFFICE 的程式碼複製進你自己的 App → 那部分要跟著 AGPL。
  - 只透過 iframe＋HTTP callback 串接、不改 ONLYOFFICE → 你的網站程式是否受 AGPL 約束，法律上有不同解讀（此為說明，不是法律意見）。
  - 官方整合範例是 Apache-2.0（[LICENSE](https://github.com/ONLYOFFICE/document-server-integration/blob/0fdf1dd10674b19d61b3c50723018e67493f5086/LICENSE#L1-L3)），參考它寫串接程式較安全。

---

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. **DocumentServer** [`.gitmodules`](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/.gitmodules#L1-L18)、[`Readme.md`](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/Readme.md#L50-L98)：先弄懂元件地圖與版本差異；再看 [CHANGELOG 10.0 後端段落](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L152-L178)（JWT 預設開、/converter 不收編輯器 token、DEB 預設埠改 8083）。
2. **server/Common/config** [`default.json`](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/default.json#L476-L520)（token／secret）＋[`production-linux.json`](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/config/production-linux.json#L1-L79)：所有可調參數與實際路徑。
3. **`DocService/sources/server.js`**：路由總表、啟動順序、啟動時的金鑰警告（[L149-L166](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/server.js#L149-L166)）。
4. **`Common/sources/runtime/profile.js` → `license.js` → `memoryGuard.js`**：社群版模式與限制。
5. **`DocService/sources/DocsCoServer.js`**：`install()` → `auth()`（[L2947 起](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L2947-L2960)）→ `getLock`／`_checkLockExcel`／`compareExcelBlock` → `saveChanges` → `closeDocument` → `createSaveTimer` → `sendStatusDocument` → `commandHandle`。
6. **`DocService/sources/canvasservice.js`**：`commandOpen`（產生 Editor.bin）→ `saveFromChanges` → `commandSfcCallback`（callback、重試、forgotten）。
7. **`embeddedConverter.js` → `FileConverter/sources/converter.js`**：`TaskQueueDataConvert.serialize`（params.xml）→ `ExecuteTask` → `spawnProcess`。
8. **core** [`X2tConverter/README.md`](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/README.md#L1-L85) → `src/main.cpp` → `ASCConverters.cpp`（`fromInputParams` [L1742-L1830](https://github.com/ONLYOFFICE/core/blob/ed63e94de814ff1d4ea28cddfaba6939bc9df9ed/X2tConverter/src/ASCConverters.cpp#L1742-L1830)、`fromSpreadsheet`）→ `cextracttools.cpp`（`apply_changes`）。
9. **web-apps** `apps/api/documents/api.js`（設定與事件）＋ **sdkjs** `common/docscoapi.js`（瀏覽器端協作協定）。
10. **Docker-DocumentServer** `Dockerfile` → `run-document-server.sh` → `docker-compose.yml`（[L1-L25](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/docker-compose.yml#L1-L25)）→ `config/supervisor/*.conf`（[ds-docservice.conf](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/config/supervisor/ds-docservice.conf#L1-L11)）。
11. **document-server-integration** `web/documentserver-example/nodejs/app.js` 的 `/track`：官方 callback 寫法。

---

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 可借用的東西 | 位置 | 依賴 | 難度 | 怎麼接到你的專案 |
|---|---|---|---|---|
| A. 整套 Document Server 當「黑盒子服務」 | Docker 映像 | Docker、4GB RAM | 低 | iframe＋JWT＋callback（Q4 範例）；倉儲 App 的「匯入/匯出 Excel、多人一起改庫存表」最快的做法 |
| B. 轉檔 API | `/converter`、`/converter/from-file` | 同上 | 低 | 後端把庫存報表 xlsx 轉 PDF、把廠商的 xls/ods/csv 統一轉成 xlsx |
| C. x2t 命令列單獨使用 | core/X2tConverter | C++、內嵌 JS 引擎、sdkjs、字型；官方編譯說明在 Help Center（本次未讀） | 高 | 自己編譯太重；較實際是在 Docker 映像內直接呼叫既有的 x2t 並自己寫 `params.xml`（AGPL） |
| D. 試算表鎖定演算法 | `compareExcelBlock`、`_checkLockExcel`、`_recalcLockArray` | 無（純 JS） | 中 | 若你用別家前端（如 Univer、x-spreadsheet）自製多人編輯：照「範圍矩形交集＋插刪列欄平移」的概念自己重寫；直接複製則需遵守 AGPL |
| E. 單行程任務佇列／廣播 | `taskqueueMemory.js`（376 行）、`pubsubMemory.js`（158 行） | Node `events` | 低 | 小型服務先不上 RabbitMQ 的寫法：優先權佇列、每個工作者一次一件、逾期進 dead-letter |
| F. Webhook 重試＋備援區 | `commandSfcCallback` | `retry`、`multi-integer-range` | 中 | 你自己的 Webhook：對方沒回成功就存備援、提供「撈回」指令 |
| G. 有時效的簽名下載網址 | [storage-base.js L166-L201](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/storage/storage-base.js#L166-L201) | `crypto` | 低 | md5(到期時間＋路徑＋密鑰)，給 nginx `secure_link` 驗證 |
| H. 官方整合範例 | document-server-integration | Express | 低 | Apache-2.0，可較自由地改寫成你的 Cloud Functions |

**拆出提醒：** `DocService/package.json` 的依賴有 33 個（我用 python 讀 `dependencies` 計算；Common 另有 24 個、FileConverter 9 個），包含 `socket.io@4.8.3`、`express@4.22.2`、`jsonwebtoken@9.0.3`，也仍列著 `pg`、`mysql2`、`oracledb`、`ioredis`（[package.json L14-L48](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/package.json#L14-L48)），但對應的實作檔不在公開樹中；Node 需 20 以上。

---

## 坑與限制

1. **`document.key` 重複使用會開到舊內容。** 存檔成功後該 key 會處於「已更新版本」狀態（5 分鐘內再開會被告知版本已變，[canvasservice.js L186-L223](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/canvasservice.js#L186-L223)）；而快取的 `Editor.bin` 要 24 小時沒人開才清（gc），變更紀錄卻在存檔後就刪了。由此推論：同一個 key 在 5 分鐘後到 24 小時內重開，可能看到存檔前的舊內容（推論，未實測）。**每存一個版本就換 key。**
2. **一定要回 `{"error":0}`**，且 status 1、4 也要回；不然會在編輯器跳「存檔伺服器訂閱錯誤」警告（[onReplySendStatusDocument](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/DocService/sources/DocsCoServer.js#L1591-L1597)），存檔結果則會進 forgotten；可用 `/command` 的 `getForgottenList`／`getForgotten` 撈回。
3. **callback 給的 `url` 有時效**（`storage.fs.urlExpires` 900 秒，演算法會對齊到時間格），收到就下載，不要先排隊。
4. **JWT 金鑰會「自己變」。** 沒設 `JWT_SECRET` 就每次啟動隨機產生；容器重建後你網站簽的 token 全部失效。另外 10.0 起 `/converter`、`/command`、`/docbuilder` 不再接受編輯器設定的 token（[CHANGELOG L170-L173](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L170-L173)）。
5. **私有 IP 會被擋。** 若網址不在 JWT 裡（或 JWT 關閉），預設會阻擋 192.168.x.x、127.0.0.1 等私有網址（[utils.js L332-L400](https://github.com/ONLYOFFICE/server/blob/f037d2c42fab6ef627f323bd8f8f73b4f99b0cd0/Common/sources/utils.js#L332-L400)）。開著 JWT、網址寫在 token 內時可直連。另外容器內的 `localhost` 是容器自己，不是你的電腦。
6. **單一行程＋記憶體保存：** 被 OOM 或 `kill -9` 時，尚未組裝的變更可能遺失；請用 `docker stop` 並保留 60 秒寬限。也不能開兩個容器做負載平衡。
7. **記憶體守門員是「靜默降級」：** 使用者突然只能看不能改，常被誤會是權限問題，記得看 DocService 日誌。
8. **網路舊文章已過時：**「社群版 20 連線」「需要 PostgreSQL／RabbitMQ／Redis」都是 9.3 以前的狀況；但 Docker README 的資料卷說明仍列了 PostgreSQL／RabbitMQ／Redis 路徑（[L73-L79](https://github.com/ONLYOFFICE/Docker-DocumentServer/blob/35bee8f23867fe3668d80a425a9d447474d2d435/README.md#L73-L79)），那是給企業版的。
9. **公開原始碼不是完整產品：** 我抽查 server 的 v8.3.3.23、v9.0、v9.2、v9.3、v9.4、v9.5、v10.0 各 tag，`DocService/sources/databaseConnectors` 都只有 2～3 個檔，沒有 PostgreSQL／MySQL 等連接器實作（v9.3 的 `baseConnector.js` 第 76 行還 `require('./postgreConnector')`，但檔案不存在：[v9.3 baseConnector.js L61-L76](https://github.com/ONLYOFFICE/server/blob/97ad8af24ec404b82589b53f3427d4bb7e116eb6/DocService/sources/databaseConnectors/baseConnector.js#L61-L76)）。想自建叢集得自己補。
10. **子模組釘選版本拿不到：** DocumentServer 釘選的 web-apps `848568f`、sdkjs `6423d2d` 從 GitHub fetch 會回「not our ref」，本次改讀同版號 tag v10.0.0.176；兩者內容可能有細微差異（未確認）。
11. **字型跑版：** 繁中只有替代字型（見 Q3），PDF 匯出與列印最容易出問題。
12. **HTTPS 混合內容：** 你的網站是 HTTPS 時，Document Server 也要 HTTPS（可用 `LETS_ENCRYPT_DOMAIN`）。
13. **埠號差異：** Docker 映像是 80／443；10.0 起 DEB／RPM 安裝的預設埠改成 8083（[CHANGELOG L178](https://github.com/ONLYOFFICE/DocumentServer/blob/c4ad98db9f0dd84a9949566de399fc79698acd46/CHANGELOG.md#L178)）。
14. **轉檔排隊：** 社群版只有一個轉檔工作者（見 Q2），多人同時開大型 xlsx 會互相等待；x2t 預設記憶體上限 4GiB，主機 RAM 太小會被系統砍掉。
