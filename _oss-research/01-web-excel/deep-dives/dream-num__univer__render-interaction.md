# dream-num/univer｜深入：渲染引擎與互動

> 深入分析｜掃描日期：2026-11-04｜commit：c13b042｜總覽資料包：_oss-research/01-web-excel/dream-num__univer.md

閱讀說明：

- 本篇只看「畫面怎麼畫出來、使用者怎麼跟它互動」。看的是 `dev` 分支 commit `c13b042d18c80c8348fbe52da445d68435febbca`（2026-11-04），`@univerjs/engine-render` 與 `@univerjs/sheets-ui` 版本都是 `1.3.1`。
- 授權：整個 repo 是 Apache-2.0（`LICENSE`、`packages/engine-render/package.json` 的 `license` 欄位）。個人或商用都可以，散布修改版時要保留授權聲明、註明有改過哪些地方。README 寫明 xlsx 匯入匯出、列印、圖表、樞紐分析、「in-cell graphics」等屬於另外收費的 Univer Pro，**不在這個 repo**。
- 規模（用 `find ... | xargs cat | wc -l` 自己算，排除 `__tests__`、`*.spec.ts`、語系檔、斷字字典）：`engine-render/src` 有 164 個檔、62,784 行，其中試算表專用的 `components/sheets` 只有 6,741 行，文件排版 `components/docs` 佔 33,379 行；`sheets-ui/src` 有 305 個檔、64,782 行。
- 所有連結都固定在上述 commit。我沒有執行任何程式，凡是「效能多快」「手機順不順」這類需要實測的，都標「未實測」或「未確認」。

---

## 重點結論（5–10 點）

1. **只有一張真正的 `<canvas>`，上面疊「邏輯圖層」**。每個活頁簿是一個 `RenderUnit`，裡面一個 `Engine`（管那張畫布）加一個 `Scene`。`Scene` 裡分 `Layer`（試算表用了 0、1、10、11、12 五層），主表格層和欄名列號層各自開了「離屏快取畫布」；內容區的 `Viewport` 還各有一張快取畫布。儲存格編輯器、浮動按鈕、下拉選單則是疊在畫布上方的 HTML。
2. **虛擬捲動 = 只畫看得到的格子**。列高、欄寬先算成「累積陣列」，再用二分搜尋把可視矩形換成「第幾列到第幾列、第幾欄到第幾欄」。主視窗四周多畫 100px 緩衝，樣式快取也只算這個範圍。
3. **捲動有三層加速**：滾輪位移先累積、下一幀才送一次指令；視窗快取畫布「整塊位移，只補畫新露出的條帶」；沒有合併儲存格時，連主畫布也直接搬移像素。拖捲軸跳很遠、而且畫一幀很貴時，會先只畫捲軸，手停 64ms 後才補細節。
4. **縮放 = `scene.scale()` 後強制整片重畫**，不是把點陣圖放大，所以字永遠是清楚的。範圍 10%～400%，以「工作表」為單位存在 `zoomRatio`。正在編輯儲存格時不准縮放。
5. **手機是另一組外掛**。官方範例把 16 個外掛加 UI 換成 `*MobileUIPlugin`；手機版自己處理觸控捲動（仿 iOS 慣性）、雙指縮放（縮放時手指中心的格子不動）、長按選單；**手機版關掉了拖拉填滿把手，編輯改在公式列**。
6. **儲存格編輯器其實是一份迷你 Univer 文件**：React 元件 `EditorContainer` 絕對定位蓋在儲存格上，裡面是另一個 Doc 單元、另一個 `Engine` 與畫布；鍵盤、注音輸入法、貼上全部打進一個 1×1 像素的隱藏 `contenteditable`。
7. **複製貼上走 HTML**：自己複製出去的表格帶 `data-copy-id`，貼回來時直接從記憶體快取（最多 10 筆）拿原始資料；外部 HTML（Excel、Word、Google 試算表）由 `HtmlToUSMService` 解析 `<table>`、`<style>` 與 Excel 專有的 `mso-number-format`。
8. **拖拉填滿分兩半**：`sheets-ui` 管右下角小方塊的拖曳與預覽，`packages/sheets` 的 `AutoFillService` 管「要填什麼」（8 條內建規則、公式規則、各外掛的 hook）。中文序列只認簡體寫法（例如「周一」「腊月」），台灣常寫的「週一」不會自動遞增。
9. **自訂儲存格畫法有 4 條官方路線**：`customRender`（可點擊，例如核取方塊）、`SheetExtension`（整片自己畫，例如資料橫條）、Float DOM（放真正的 React 按鈕）、儲存格內圖片。
10. **借用建議**：`engine-render` 跟 `@univerjs/core` 的相依性注入、Registry、rxjs 綁得很深，不適合單獨拆出來；最務實的是「整套嵌入 + 寫外掛」，或把演算法（累積陣列＋二分搜尋、搬移像素式捲動、Excel HTML 解析、自動填滿規則）照抄到自己的專案。

---

## 逐題詳解（每個問題一節，附 permalink 與必要的短程式碼摘錄）

### 1. engine-render 的 Canvas 分層架構

**整體結構（我依程式碼整理）**：

```
RenderManagerService（一個 Univer 一個）
 └─ RenderUnit（每個活頁簿 / 文件一個，有自己的 DI 子容器）
     ├─ Engine ── 唯一一張 <canvas>：DPR、requestAnimationFrame 迴圈、原生滑鼠/觸控事件
     └─ Scene ── InputManager（把事件分給畫面上的物件）
         ├─ Layer 0   主表格 Spreadsheet（開離屏快取）
         ├─ Layer 1   選取框 SelectionControl
         ├─ Layer 10  欄名、列號、凍結線（開離屏快取）
         ├─ Layer 11  欄名列號上的選取高亮
         ├─ Layer 12  「取消隱藏」小按鈕
         └─ Viewport × 9（各自裁切、各自捲動；內容區 4 個有自己的快取畫布）
```

- **RenderManagerService / RenderUnit**：`createRender()` 為每個文件單元 new 一個 `Engine` 與 `Scene`，再把該類型登記過的「render module」用 DI 建出來（[render-manager.service.ts L153-L173](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/render-manager/render-manager.service.ts#L153-L173)、[L237-L286](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/render-manager/render-manager.service.ts#L237-L286)；介面見 [render-unit.ts L38-L74](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/render-manager/render-unit.ts#L38-L74)）。我用腳本數過：桌機版 `sheets-ui` 登記 5 個基礎模組 + 25 個 render 模組（右鍵選單開啟時再 +1），見 [plugin.ts L266-L325](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/plugin.ts#L266-L325)。**「選取、捲動、縮放、編輯、剪貼簿」每一個都是一個獨立模組**，這是 Univer 好拆、好擴充的關鍵。
- **Engine**：建立畫布時設 `z-index: 8`、`tabIndex=1`、`touch-action: none`（[canvas.ts L58-L104](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/canvas.ts#L58-L104)）；`setSize()` 把實際像素設成「CSS 尺寸 × 裝置像素比」再 `setTransform(dpr…)`，所以 Retina 螢幕也清楚（[canvas.ts L141-L160](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/canvas.ts#L141-L160)）。渲染迴圈是標準 RAF：只要還有工作就排下一幀（[engine.ts L415-L462](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/engine.ts#L415-L462)）；試算表在 `SheetRenderController` 把 `scene.render()` 掛進迴圈，RenderUnit 被停用（`deactivate()`）時停掉（[sheet.render-controller.ts L92-L101](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts#L92-L101)）。螢幕 DPR 改變（拖到另一台螢幕、瀏覽器縮放）用 `matchMedia` 偵測後重設尺寸（[engine.ts L1015-L1033](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/engine.ts#L1015-L1033)）。
- **Scene.render()**：先看有沒有任何圖層「髒了」，沒有就直接 return；有的話依 zIndex 排序逐層畫（[scene.ts L1013-L1070](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/scene.ts#L1013-L1070)）。
- **Layer**：可以 `enableCache()` 開一張離屏畫布；沒變就直接把快取 `drawImage` 貼回去（[layer.ts L304-L345](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/layer.ts#L304-L345)）。試算表開了主表格層與欄名列號層：

```ts
// packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts L253-L259
scene.addObjects([spreadsheet], SHEET_COMPONENT_MAIN_LAYER_INDEX);
scene.addObjects(
    [spreadsheetRowHeader, spreadsheetColumnHeader, SpreadsheetLeftTopPlaceholder],
    SHEET_COMPONENT_HEADER_LAYER_INDEX
);

scene.enableLayerCache(SHEET_COMPONENT_MAIN_LAYER_INDEX, SHEET_COMPONENT_HEADER_LAYER_INDEX);
```

  （[permalink](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts#L229-L260)；圖層編號常數見 [keys.ts L34-L42](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/common/keys.ts#L34-L42)）

- **Viewport**：每個視窗區先 `clip()` 裁出自己的矩形，再套「縮放 × 捲動位移」矩陣去畫物件（[viewport.ts L756-L811](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/viewport.ts#L756-L811)）；`calcViewportInfo()` 算出「可視範圍、比上一幀多出來的條帶、快取範圍」給下游用（[viewport.ts L857-L951](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/viewport.ts#L857-L951)）。
- **Spreadsheet 本身不直接畫格子，而是依序呼叫 SheetExtension**。我把 repo 裡 12 個 `extends SheetExtension`（`grep` 計數，排除測試）整理出主表格的上下順序（數字小的先畫、在下面）：

| zIndex | 擴充 | 位置 |
|---|---|---|
| 21 | 儲存格底色 Background | engine-render |
| 25 / 80 | 權限保護標示（可檢視時 25、不可檢視時 80） | sheets-ui |
| 34 / 35 | 條件式格式設定：資料橫條 / 圖示集 | sheets-conditional-formatting |
| 45 | 文字 Font（也負責儲存格內圖片） | engine-render |
| 50 | 框線 Border | engine-render |
| 55 | `customRender`（核取方塊、下拉箭頭等） | engine-render |
| 60 | 角落小三角 Marker（評論、備註、驗證錯誤都靠它） | engine-render |

  格線是在「背景類」擴充之後、其他擴充之前畫的（[spreadsheet.ts L341-L417](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L341-L417)）。常數見 [constants.ts L19-L31](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/constants.ts#L19-L31)。

- **點擊命中測試是幾何計算**：`Scene.pick()` 從最上層物件往下問 `isHit()`（就是座標在不在矩形內），不是常見的「隱藏色彩畫布」技巧；`HitCanvas` 類別雖然存在，但 repo 內沒有任何地方使用（[scene.ts L1281-L1360](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/scene.ts#L1281-L1360)）。
- **1px 線條不糊的秘訣**：`UniverRenderingContext` 包了一層 `rectByPrecision()`、`lineToByPrecision()` 等方法，先把座標乘上目前縮放、四捨五入到整數像素再除回去（[context.ts L904-L912](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/context.ts#L904-L912)、[tools.ts L255-L257](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/basics/tools.ts#L255-L257)）。自己寫 Canvas 表格時很值得照抄。

### 2. 虛擬捲動與大量資料效能

**9 個視窗區**（凍結窗格就是靠它；程式碼註解原圖，[sheet.render-controller.ts L342-L352](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts#L342-L352)）：

```
+-----------------+--------------------+-------------------+
|  VIEW_LEFT_TOP  |  VIEW_COLUMN_LEFT  | VIEW_COLUMN_RIGHT |
+-----------------+--------------------+-------------------+
|  VIEW_ROW_TOP   | VIEW_MAIN_LEFT_TOP |   VIEW_MAIN_TOP   |
+-----------------+--------------------+-------------------+
| VIEW_ROW_BOTTOM |   VIEW_MAIN_LEFT   |     VIEW_MAIN     |
+-----------------+--------------------+-------------------+
```

沒凍結時只啟用 `VIEW_MAIN`、列號 `VIEW_ROW_BOTTOM`、欄名 `VIEW_COLUMN_RIGHT` 與左上角 `VIEW_LEFT_TOP` 四個，其餘五個建立時是 `active: false`；主視窗 `allowCache: true`、`bufferEdgeX/Y = 100`（[sheet.render-controller.ts L262-L340](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts#L262-L340)）。

**「只畫看得到的」四步驟**：

1. **累積陣列**：每列高度依序加總成 `rowHeightAccumulation`，隱藏列、被篩選掉的列高度算 0（[core sheet-skeleton.ts L400-L447](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/sheet-skeleton.ts#L400-L447)）。這一步每次重建骨架都是「列數」等級的成本。
2. **矩形換列欄**：把可視矩形（含 100px 緩衝，[viewport.ts L1411-L1421](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/viewport.ts#L1411-L1421)）丟給 `_getRangeByViewBounding()`，裡面用 `searchArray()` 找起訖列欄（[sheet.render-skeleton.ts L1272-L1328](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/sheet.render-skeleton.ts#L1272-L1328)）。`searchArray` 在陣列很短或目標靠近頭尾時用線性搜尋，其他情況用二分搜尋（[array-search.ts L143-L162](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/shared/array-search.ts#L143-L162)）。點擊時反過來「座標→儲存格」也是同一套（[core sheet-skeleton.ts L904-L929](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/sheets/sheet-skeleton.ts#L904-L929)）。
3. **樣式快取只算可視範圍**：`setStylesCache()` 只替可視範圍的格子算背景、框線、字型；為了「文字溢出到隔壁格」，左右最多多看 20 欄，碰到非空白格就停；在螢幕上不到 4px 高的列乾脆不排字（[sheet.render-skeleton.ts L524-L650](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/sheet.render-skeleton.ts#L524-L650)）。
4. **畫字分快慢兩條路**：沒有換行、刪除線、底線的純文字走 `Text.drawPlainWith()` 快速路徑；有富文字的格子才建一份小型文件排版（[font.ts L385-L390](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/extensions/font.ts#L385-L390)、[L622-L665](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/extensions/font.ts#L622-L665)）。

**捲動的三層加速**：

- **第一層：滾輪合併**。`SheetsScrollRenderController` 不是每個 wheel 事件就捲一次，而是把位移累積起來，等下一個 `requestAnimationFrame` 才送一次 `SetScrollRelativeCommand`；垂直量是水平量 2 倍以上就鎖定單軸（[scroll.render-controller.ts L70-L161](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/scroll.render-controller.ts#L70-L161)）。
- **第二層：視窗快取畫布位移**。`renderByViewports()` 判斷：資料髒了、或一次捲動超過快取大小 → 整張重畫；否則只是捲動 → `paintNewAreaForScrolling()`：

```ts
// packages/engine-render/src/components/sheets/spreadsheet.ts L539-L546
const shouldRefreshCache = isDirty || isForceDirty || isScrollJumpOutsideCache || shouldRefreshForMergeRepairArea || (shouldCacheUpdate && diffX !== 0);
if (diffBounds.length === 0 || (diffX === 0 && diffY === 0) || shouldRefreshCache) {
    if (shouldRefreshCache) {
        this.addRenderTagToScene('scrolling', false);
        this.refreshCacheCanvas(viewportInfo, { cacheCanvas, cacheCtx, mainCtx, topOrigin, leftOrigin, bufferEdgeX, bufferEdgeY });
    }
} else if (diffBounds.length !== 0 || diffX !== 0 || diffY !== 0) {
    // scrolling && no dirty
```

  （[renderByViewports L517-L573](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L517-L573)）。`paintNewAreaForScrolling()` 先用 `globalCompositeOperation='copy'` 把舊快取整塊平移到另一張備用畫布（兩張輪流用），再只對「新露出的條帶」`clip()` 後重畫（[L626-L690](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L626-L690)）。註解特別提到要 clip，否則文字會重疊畫兩次、在 Windows 上出現鋸齒。

- **第三層：主畫布直接搬像素**。只要沒有合併儲存格、畫面上沒有其他東西是髒的，就走 `makeDirtyForScrolling()`（[scroll.render-controller.ts L163-L185](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/scroll.render-controller.ts#L163-L185)），`Scene.render()` 會呼叫 `scrollAndClearCanvas()` 把整張主畫布的像素平移，各圖層只補畫露出來的區域（[scene.ts L1038-L1056](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/scene.ts#L1038-L1056)、[layer.ts L47-L94](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/layer.ts#L47-L94)）。

**其他效能細節**：

- 拖捲軸一口氣跳很遠、而且估計畫一幀要超過 max(32ms, 兩個影格) 時，只更新捲軸，等手停 64ms 再畫內容（常數在 [scene.ts L42-L46](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/scene.ts#L42-L46)）。
- 改資料（任何 mutation）時，`_markUnitDirty()` 先呼叫 `spreadsheet.makeDirty()`，而它會把**所有**視窗都標髒；後面雖然算出改動範圍、呼叫 `setDirtyArea()`，但 `Spreadsheet` 裡的 `_dirtyBounds` 只被寫入，沒有任何繪圖程式讀它（`grep` 只出現在宣告與兩次賦值）。所以實際上「改一格 = 可視範圍（含 100px 緩衝）整片重畫」，成本跟畫面上的格數成正比，不跟總資料量成正比（[sheet.render-controller.ts L453-L491](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts#L453-L491)、[spreadsheet.ts L504-L515](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L504-L515)）。
- 自動列高放在 `requestIdleCallback` 裡分批算，不卡畫面（[auto-height.service.ts L179-L205](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/auto-height.service.ts#L179-L205)）。
- 每個擴充每幀花幾毫秒都有記錄，可以送到遙測服務當 `sheet_render_cost`（[sheet.render-controller.ts L108-L227](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts#L108-L227)）。
- 試算表渲染全在主執行緒；`engine-render/worker` 匯出的只有文件排版（[worker.ts](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/worker.ts#L17-L19)）。
- README 只說「High-performance」，沒有公布幾十萬列、百萬格的實測數字。**實際上限未實測。**

### 3. 縮放

- **觸發**：`SheetsZoomRenderController` 聽 `onMouseWheel$`，只在 `ctrlKey` 按著時處理；如果儲存格或公式列編輯器開著就直接忽略（[zoom.render-controller.ts L55-L88](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/zoom.render-controller.ts#L55-L88)）。
- **算下一個倍率**：`getNextWheelZoomRatio()` 先把滾輪量統一成像素（行模式 ×16、頁模式 ×800），每像素 0.008，單次最多 ±0.14（100% 以下最多 ±0.07），四捨五入到 0.01，再夾在 0.1～4（[zoom.ts L20-L64](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/basics/zoom.ts#L20-L64)）。
- **套用**：`SetZoomRatioCommand` → `SetZoomRatioOperation`（Operation 不會進復原堆疊）→ 骨架更新後 `_updateViewZoom()` 呼叫 `scene.scale(z, z)` 加 `spreadsheet.makeForceDirty()`，也就是**整片向量重畫**（[zoom.render-controller.ts L112-L118](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/zoom.render-controller.ts#L112-L118)、[set-zoom-ratio.command.ts L39-L90](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/commands/commands/set-zoom-ratio.command.ts#L39-L90)）。快捷鍵 Ctrl/⌘ + `=`、`-`（每次 ±20%）與 Ctrl/⌘ + `0`（回到 100%）走 `ChangeZoomRatioCommand`，用 `SHEET_ZOOM_RANGE = [10, 400]` 限制（[view.shortcut.ts L23-L72](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/shortcuts/view.shortcut.ts#L23-L72)、[keys.ts L17](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/common/keys.ts#L17)）；右下角縮放滑桿 `ZoomSlider` 下限同樣是 10，並提供 50、75、100、125、150、175、200、400 的快速選項（[ZoomSlider.tsx L33](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/views/sheet-slider/ZoomSlider.tsx#L33)、[L85-L91](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/views/sheet-slider/ZoomSlider.tsx#L85-L91)）。
- **程式呼叫**：Facade 的 `fWorksheet.zoom(ratio)` 一樣夾在 0.1～4，`getZoom()` 讀回（[f-worksheet.ts L368-L381](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/facade/f-worksheet.ts#L368-L381)）。
- 縮放倍率存在每張工作表自己的 `zoomRatio`，切換工作表會各自套用。

### 4. 手機觸控

**怎麼切成手機版**：官方範例 `examples/src/sheets/mount.ts` 準備了一個對照表，`device === 'mobile'` 時把 16 個外掛換成同名的 `*MobileUIPlugin`，`UniverUIPlugin` 也換成 `UniverMobileUIPlugin`（[mount.ts L53-L71](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/examples/src/sheets/mount.ts#L53-L71)、[L99](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/examples/src/sheets/mount.ts#L99)；替換函式 [mount-example.ts L43-L51](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/examples/src/mount-example.ts#L43-L51)）。也就是說**同一份資料、同一個引擎，只是 UI 外掛換一套**。

**引擎層共用的觸控基礎**：

- 畫布設 `touch-action: none`，瀏覽器不會自己捲頁面或縮放（[canvas.ts L84-L86](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/canvas.ts#L84-L86)）。
- 統一用 Pointer Events；`pointerType` 是 touch 或 pen 就標成 `DeviceType.Touch`（[engine.ts L1005-L1013](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/engine.ts#L1005-L1013)）。
- 觸控時如果手指同時壓到好幾個小控制點，挑「距離最近」的那個，避免手指太粗點錯（[scene.ts L1303-L1321](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/scene.ts#L1303-L1321)）。
- 長按 500ms、雙擊 500ms、觸控雙擊容許移動 10px 等門檻集中在 [scene.input-manager.ts L28-L44](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/scene.input-manager.ts#L28-L44)。

**手機版專屬模組**（[mobile-plugin.ts L262-L322](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/mobile-plugin.ts#L262-L322)；我數過是 6 個基礎 + 23 個模組，右鍵選單開啟時再 +2）：

- **捲動與縮放** `MobileSheetsScrollRenderController`：直接在畫布掛原生 `touchstart/touchmove/touchend/touchcancel`（`passive: false` 才能 `preventDefault`，[L998-L1002](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/mobile/mobile-scroll.render-controller.ts#L998-L1002)）。慣性參數都寫成常數：每毫秒減速 0.992、最小速度 0.22、最大速度 12、240ms 內滑超過 30px 算「甩」、移動 8px 後鎖定方向、保留最近 5 筆速度做加權平均（[L314-L360](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/mobile/mobile-scroll.render-controller.ts#L314-L360)）。雙指縮放的核心公式只有一行：

```ts
// mobile-scroll.render-controller.ts L645-L646（canvasPos = (sheetPos - scrollPos) * zoom 反推）
newViewportScrollX = pinchSheetPos.x - pinchCanvasX / newZoomRatio;
newViewportScrollY = pinchSheetPos.y - pinchCanvasY / newZoomRatio;
```

  手指中心底下那一格在縮放過程中會一直停在手指下（[applyZoomWithFocus L620-L692](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/mobile/mobile-scroll.render-controller.ts#L620-L692)）。
- **長按選單**：500ms、移動不超過 10px（[mobile-contextmenu.render-controller.ts L49-L50](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/mobile/mobile-contextmenu.render-controller.ts#L49-L50)）。
- **選取**：`MobileSheetsSelectionRenderService`，用左上、右下兩個圓形把手拉大選取範圍；**建立選取框時明確傳 `enableAutoFill: false`**（[mobile-selection-shape.ts L51](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/selection/mobile-selection-shape.ts#L51)），而且手機外掛沒登記 `AutoFillRenderController`。
- **編輯**：註解寫明「Mobile edits in the formula bar」（[mobile-cell-edit.render-controller.ts L48-L53](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/mobile/mobile-cell-edit.render-controller.ts#L48-L53)）。

### 5. sheets-ui：選取

- **入口**：`SheetSelectionRenderService._initEventListeners()` 分別聽主表格、列號、欄名、左上角的 `onPointerDown$`，轉成「一般 / 整列 / 整欄 / 全選」四種選取（[selection-render.service.ts L113-L185](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/selection/selection-render.service.ts#L113-L185)）。
- **按下去之後**：`_onPointerDown()` 把滑鼠座標換成視窗座標 → 用骨架的 `getCellByOffset()` 找到格子 → 建立或更新選取框 → 暫停其他物件事件、`setCapture()` 鎖住指標、掛上移動與放開的監聽；拖到邊緣時由 `ScrollTimer` 自動捲動（[L376-L455](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/selection/selection-render.service.ts#L376-L455)）。
- **選取框長什麼樣**：`SelectionControl` 全是 `Rect` 組成的 `Group`：4 條邊框、4 塊半透明底色（上、下、左、右四塊圍住「目前格」，所以目前格保持白底，[L971-L1044](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/selection/selection-control.ts#L971-L1044)）、1 個填滿把手、8 個調整大小的小方塊，再加欄名列號的高亮群組（[selection-control.ts L183-L274](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/selection/selection-control.ts#L183-L274)）。它放在 Layer 1，而主表格在 Layer 0 且有快取，所以**移動選取框不需要重畫格子**。
- 對外事件：Facade 提供 `SelectionMoveStart / SelectionMoving / SelectionMoveEnd / SelectionChanged` 等；我數了 `f-event.ts` 的 getter，共 32 種 UI 事件（[f-event.ts L767-L893](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/facade/f-event.ts#L767-L893)）。

### 6. sheets-ui：儲存格編輯器

```
雙擊格子 / 直接打字
  └─ SetCellEditVisibleOperation
      └─ EditorContainer（React，絕對定位到儲存格的 left/top/width/height）
          └─ FormulaEditor（editorId = DOCS_NORMAL_EDITOR_UNIT_ID_KEY）
              └─ 另一個 Doc 單元 + 另一個 Engine/畫布 ── 畫出游標、選字、富文字
鍵盤 / 注音輸入法 / 貼上 ─► 1×1 像素隱藏 contenteditable（docs-ui）
Enter / 點別格 ─► _submitEdit() ─► SetRangeValuesCommand
```

- **開啟**：雙擊走 `spreadsheet.onDblclick$`（[desktop-cell-edit.render-controller.ts L103-L123](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/desktop-cell-edit.render-controller.ts#L103-L123)）；「選好格子直接打字」則是聽隱藏輸入框的 `onInputBefore$`，只要試算表有焦點、編輯器還沒開，就以 Keyboard 模式開編輯器（[L146-L192](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/render-controllers/desktop-cell-edit.render-controller.ts#L146-L192)）。
- **外框與位置**：`EditorContainer` 是一般 React 元件，畫出外框與「A1」位址小標籤（[EditorContainer.tsx L659-L737](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/views/editor-container/EditorContainer.tsx#L659-L737)）。裡面的編輯器由 docs-ui 的 `EditorService` 建立一個 Doc 單元並 `render.engine.mount(container)`（[editor-manager.service.ts L296-L310](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/docs-ui/src/services/editor/editor-manager.service.ts#L296-L310)）。所以**儲存格內的粗體、顏色、換行，其實是 Univer 文件編輯器的能力**。
- **隱藏輸入框**：`DocSelectionRenderService._initDOM()` 建一個 `position: fixed` 容器，裡面 1×1 像素、`overflow:hidden` 的 `contenteditable` div，文字顏色與游標都透明（[doc-selection-render.service.ts L987-L1046](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/docs-ui/src/services/selection/doc-selection-render.service.ts#L987-L1046)）。所有 `keydown`、`input`、`compositionstart/end`（注音、倉頡選字）、`paste` 都從這裡收（[L1613-L1621](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/docs-ui/src/services/selection/doc-selection-render.service.ts#L1613-L1621)）。
- **寫回**：`_submitEdit()` 把文件內容轉成儲存格資料（判斷是不是公式、是不是富文字）→ 拿掉跟欄列樣式重複的部分 → 經過 `onWriteCell` 攔截器（例如數字格式）→ 跟原值一樣就不寫 → `SetRangeValuesCommand` → 若 `onValidateCell` 驗證失敗就用 `redoUndoId` 整筆回滾（[editing.render-controller.ts L810-L890](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/editor/editing.render-controller.ts#L810-L890)）。

### 7. 複製貼上（含從 Excel 貼上 HTML）

**貼上的兩個入口**：

```
Ctrl+V ─► 隱藏 contenteditable 的 paste 事件
        ─► ClipboardController._pasteWithDoc() 讀 text/html、text/plain、檔案
        ─► SheetPasteShortKeyCommand ─► SheetClipboardService.legacyPaste()
選單「貼上」─► SheetPasteCommand ─► navigator.clipboard.read() ─► SheetClipboardService.paste()
                      │
   HTML 有 data-copy-id 且在快取裡 ─► _pasteInternal()（直接用複製當下的原始矩陣）
   否則 ─────────────────────────► _pasteExternal() ─► HtmlToUSMService.convert() ─► _pasteUSM()（各 hook 產生 mutations）
```

（[clipboard.controller.ts L163-L216](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/clipboard/clipboard.controller.ts#L163-L216)、[clipboard.command.ts L82-L146](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/commands/commands/clipboard.command.ts#L82-L146)、[clipboard.service.ts L403-L494](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/clipboard.service.ts#L403-L494)、[L794-L819](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/clipboard.service.ts#L794-L819)）

- 純文字裡有 Tab 或換行（從記事本、LINE 複製的表格）會先用 `convertTextToTable()` 轉成 `<table>` 再走 HTML 路線（[clipboard.service.ts L484-L490](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/clipboard.service.ts#L484-L490)）。
- 在 Windows 上用「選單貼上」貼 Excel 內容，會跳通知「偵測到 Excel 內容，請使用快速鍵貼上」（[clipboard.service.ts L424-L439](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/clipboard.service.ts#L424-L439)、[zh-TW.ts L245-L248](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/locale/zh-TW.ts#L245-L248)）。原因程式碼沒寫，我推測是非同步剪貼簿 API 讀到的 HTML 被瀏覽器清理過、少了 Excel 的 `<style>`（未確認）。

**Excel HTML 的解析細節**（`HtmlToUSMService.convert()`，[converter.ts L145-L286](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/html-to-usm/converter.ts#L145-L286)）：

1. 先挑貼上外掛：內建 Univer、Word（HTML 含 `word` 或 `mso` 就算，所以 Excel 也會命中）、Lark 三個（[clipboard.service.ts L189-L191](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/clipboard.service.ts#L189-L191)、[plugin-word.ts L23-L27](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/html-to-usm/paste-plugins/plugin-word.ts#L23-L27)）。
2. **在瀏覽器解析 CSS 之前**，先用正規表示式從 `<style>` 原文抓出 `mso-number-format`，因為瀏覽器會丟掉 `mso-*` 屬性；像 `Percent` 這種具名格式不是合法的格式字串就跳過（[L292-L318](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/html-to-usm/converter.ts#L292-L318)）。
3. 把 Excel 舊式的 `windowtext` 顏色換掉，再把 `<style>` 塞進一個 Shadow DOM 讓瀏覽器解析，建立「選擇器 → 樣式」對照表。
4. `_parseTableByHtml()` 逐列逐格處理：`rowSpan/colSpan` 轉合併儲存格；相鄰兩格都有框線時去掉重複的一邊；如果格子的 class 對到某個 `mso-number-format`，就把顯示文字（例如 `1,234.57`）還原成數字並套上格式；處理 Excel 用來塞空白的 `mso-spacerun`（[L483-L601](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/html-to-usm/converter.ts#L483-L601)）。
5. 判斷「是不是 Excel」另有 `htmlIsFromExcel()`，看 `xl` 開頭的 class、Office 命名空間、`ProgId="Excel.Sheet"` 等特徵（[utils.ts L97-L118](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/utils.ts#L97-L118)）。

**複製出去**（[copy() L321-L381](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/clipboard.service.ts#L321-L381)）：先產生 `<google-sheets-html-origin><table data-copy-id="…">`（[convertor.ts L138](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/usm-to-html/convertor.ts#L138)），再由 `wrapHtmlForExcel()` 包上 Office 命名空間與 `ProgId=Excel.Sheet`，讓 Excel 也認得（[L153-L157](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/clipboard.service.ts#L153-L157)）；同時寫入 `text/plain` 與自訂的 `web application/x-univer-sheets-formula`（保留公式）。原始矩陣放進最多 10 筆的 LRU 快取（[copy-content-cache.ts L23-L42](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/clipboard/copy-content-cache.ts#L23-L42)）。瀏覽器層用 `navigator.clipboard.write()`，不支援時退回 `document.execCommand('copy')`（[clipboard-interface.service.ts L188-L220](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/ui/src/services/clipboard/clipboard-interface.service.ts#L188-L220)）。

**擴充點**：`addClipboardHook()` 讓外掛在複製、貼上時加料（資料驗證、條件式格式、圖片都靠它）；`HtmlToUSMService.use()` 可以加自己的貼上外掛；Facade 有 `BeforeClipboardPaste` 事件可攔截或取消。

### 8. 拖拉填滿

```
選取框右下角 Rect（fillControl）
  ─► SelectionShapeExtension：按下 → 拖曳中算目標範圍、畫預覽框 → 放開
  ─► control.selectionFilled$ ─► AutoFillRenderController
  ─► AutoFillCommand（packages/sheets）─► AutoFillService：規則 + hooks ─► mutations
雙擊填滿把手 ─► detectAutoFillRange()：看左邊（或右邊）相鄰欄有資料到第幾列
```

- 把手本體：[selection-control.ts L226-L229](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/selection/selection-control.ts#L226-L229)。拖曳邏輯：`_initialAutoFill()`、`_autoFillMoving()`、`_autoFillForPointerdown()`（[selection-shape-extension.ts L598-L921](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/selection/selection-shape-extension.ts#L598-L921)）。拖曳中也會經過權限檢查的攔截器。
- 送出指令與雙擊：[auto-fill-ui.controller.ts L226-L340](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/auto-fill-ui.controller.ts#L226-L340)。
- **規則**：`rules.ts` 匯出 8 條（日期 1100、數字 1000、「文字+數字」900、中文數字 830、「周X」820、「星期X」810、循環序列 800、其他 0），數字越大越先比對；公式規則由 `sheets-formula` 另外 `registerRule()`（[rules.ts L41-L447](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/rules.ts#L41-L447)、[formula-auto-fill.controller.ts L59](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-formula/src/controllers/formula-auto-fill.controller.ts#L59)）。填法有 `COPY / SERIES / ONLY_FORMAT / NO_FORMAT` 四種，填完會出現選單讓使用者切換（[type.ts L27-L50](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/type.ts#L27-L50)）。
- **Hook**：資料驗證、條件式格式、超連結、儲存格圖片、權限都用 `addHook()` 參一腳（[type.ts L59-L89](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/type.ts#L59-L89)、[auto-fill.service.ts L309-L337](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/auto-fill.service.ts#L309-L337)）。
- **台灣在地的坑**：循環序列表裡有 `腊月`、`子时`、`亥时` 這類簡體字（`一月`、`春季` 這種兩岸同形的沒問題），「周X」也只認「周一」寫法；「星期一」兩岸寫法相同所以可以（[tools.ts L216-L260](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/tools.ts#L216-L260)、[L610-L635](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/tools.ts#L610-L635)）。想要「週一、週二」或「一月份」之類，自己 `registerRule()` 一條即可，介面只有 `match / isContinue / applyFunctions / priority` 四個欄位（[type.ts L117-L123](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets/src/services/auto-fill/type.ts#L117-L123)）。

### 9. 自訂儲存格渲染（顯示圖片或按鈕）怎麼做

| 路線 | 適合 | 會不會跟著捲動、縮放 | 可點擊 | 需要的外掛 |
|---|---|---|---|---|
| A. `customRender` | 每格的小圖示、核取方塊、狀態燈號 | 會（畫在畫布上） | 可（`isHit` + `onPointerDown`） | sheets-ui |
| B. `SheetExtension` | 大範圍的圖形，如資料橫條、熱度圖 | 會 | 要自己處理 | engine-render |
| C. Float DOM | 真正的 HTML/React 按鈕、輸入框、小圖表 | 會（DOM 跟著定位） | 原生 DOM 事件 | sheets-drawing-ui |
| D. 儲存格內圖片 | 商品圖、QR code | 會 | 無自訂點擊（雙擊也不會開編輯器） | sheets-drawing-ui |

**A. `customRender`**（最推薦先試）：

- 介面只有 `drawWith / isHit / onPointerDown / onPointerEnter / onPointerLeave / zIndex`（[i-cell-custom-render.ts L25-L48](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/core/src/types/interfaces/i-cell-custom-render.ts#L25-L48)）。
- 畫的人是 zIndex 55 的 `Custom` 擴充：逐格看 `cellData.customRender`，有就依序呼叫 `drawWith(ctx, info…)`，合併儲存格只畫一次（[custom.ts L33-L111](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/extensions/custom.ts#L33-L111)）。
- 點擊交給 `CellCustomRenderController`：按下時先算出是哪一格、問 `isHit()`，再檢查工作表與儲存格的編輯權限才呼叫 `onPointerDown`；滑過則每 30ms 節流一次觸發 enter/leave（[cell-custom-render.controller.ts L164-L222](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/controllers/cell-custom-render.controller.ts#L164-L222)）。
- 官方範本：資料驗證的核取方塊 `CheckboxRender`，`drawWith` 算位置畫勾勾、`isHit` 判斷點到勾勾、`onPointerDown` 送 `SetRangeValuesCommand` 切換值（[checkbox-widget.ts L134-L253](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-data-validation-ui/src/views/widgets/checkbox-widget.ts#L134-L253)）；它是透過攔截器把自己塞進 `cell.customRender`（[dv-render.controller.ts L223-L226](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-data-validation-ui/src/controllers/dv-render.controller.ts#L223-L226)）。
- 應用程式開發者的捷徑是 Facade 的 `univerAPI.registerCellCustomRender()`（[f-univer.ts L1162-L1178](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/facade/f-univer.ts#L1162-L1178)）。下面是依上述介面寫的**示意，未實測**（低庫存紅點，點了把數量歸零）：

```ts
// 示意（未實測）：第 3 欄（col = 2）數量小於 10 時畫紅點
const lowStockDot = {
  drawWith(ctx, info) {
    if (info.col !== 2 || Number(info.data?.v ?? 0) >= 10) return;
    const { startY, endX, endY } = info.primaryWithCoord;
    ctx.beginPath();
    ctx.arc(endX - 8, (startY + endY) / 2, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#e53935';
    ctx.fill();
  },
  isHit(pos, info) {
    const { startY, endX, endY } = info.primaryWithCoord;
    return info.col === 2 && pos.x >= endX - 14 && pos.x <= endX && pos.y >= startY && pos.y <= endY;
  },
  onPointerDown(info) { /* 例如用 Facade 把該格設成 0，或打開查價視窗 */ },
};
const disposable = univerAPI.registerCellCustomRender([lowStockDot]);
```

**B. `SheetExtension`**：繼承它、設 `uKey` 與 `Z_INDEX`、實作 `draw(ctx, scale, skeleton, diffRanges)`，再用 `univerAPI.registerSheetMainExtension(unitId, ext)` 掛上（[f-univer.ts L1152-L1160](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/facade/f-univer.ts#L1152-L1160)）；或像條件式格式那樣 `SpreadsheetExtensionRegistry.add()` 全域登記（之後建立的每個表格都會帶）。最好的範本是資料橫條 `DataBar`：攔截器先把計算結果掛在 `cell.dataBar`，擴充只負責「看到這個欄位就畫」（[data-bar.render.ts L36-L105](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-conditional-formatting/src/render/data-bar.render.ts#L36-L105)、[L196](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-conditional-formatting/src/render/data-bar.render.ts#L196)）。注意：同一個 `uKey` 會覆蓋舊的（`Map.set`，[component.ts L31-L55](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/component.ts#L31-L55)）。

**C. Float DOM**（想要「真的按鈕」選這個）：先 `univerAPI.registerComponent('FloatButton', 元件)`，再 `fWorksheet.addFloatDomToRange(fRange, { componentKey: 'FloatButton' }, { width: 100, height: 30, marginX: '100%', marginY: '100%' }, 'id')`；JSDoc 裡就有完整的「浮動按鈕」範例（[sheets-drawing-ui f-worksheet.ts L234-L328](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/facade/f-worksheet.ts#L234-L328)）。另有 `addFloatDomToPosition()`、`addFloatDomToColumnHeader()`（欄名上放按鈕，[L229](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/facade/f-worksheet.ts#L229)、[L393](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/facade/f-worksheet.ts#L393)）。背後的定位服務 `SheetCanvasFloatDomManagerService` 有 2,532 行，處理捲動、凍結、縮放時的位置換算。

**D. 儲存格內圖片**：`fRange.insertCellImageAsync(網址或 File)`（[sheets-drawing-ui f-range.ts L56](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/facade/f-range.ts#L56)、[L87-L106](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-drawing-ui/src/facade/f-range.ts#L87-L106)）。圖片其實存在該格的富文字文件 `p.drawings` 裡，由 Font 擴充的 `_renderImages()` 畫出來，載入完成才觸發重畫，失敗時畫備用圖示（[font.ts L464-L515](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/extensions/font.ts#L464-L515)）。

**補充**：只是想在格子旁邊彈出小視窗（例如查價結果），用 `fRange.attachPopup()` 或 `CanvasPopManagerService.attachPopupToCell()` 就好（[sheets-ui f-range.ts L127](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/facade/f-range.ts#L127)、[canvas-pop-manager.service.ts L543](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/services/canvas-pop-manager.service.ts#L543)）。

---

## 程式碼導讀路線（想自己讀的人：依序看哪些檔案、每個看什麼）

1. `packages/sheets-ui/src/plugin.ts`：看 `_registerRenderBasics()` 與 `_registerRenderModules()` 兩張清單，先知道「功能 = 模組」的全貌。
2. `packages/engine-render/src/render-manager/render-manager.service.ts`：看 `createRender()`，理解一個活頁簿怎麼得到 Engine + Scene。
3. `packages/engine-render/src/engine.ts` 與 `canvas.ts`：看畫布建立、DPR、RAF 迴圈、事件綁定。
4. `packages/engine-render/src/scene.ts`：`render()`（含捲動快路徑）與 `pick()`。
5. `packages/engine-render/src/layer.ts`：`render()` 與 `scrollAndClearCanvas()`。
6. `packages/engine-render/src/viewport.ts`：`calcViewportInfo()`、`render()`、`expandBounds()`。
7. `packages/sheets-ui/src/controllers/render-controllers/sheet.render-controller.ts`：試算表怎麼擺圖層、建 9 個視窗區、資料改動時標髒。
8. `packages/engine-render/src/components/sheets/spreadsheet.ts`：`draw()`、`renderByViewports()`、`paintNewAreaForScrolling()`，這是效能核心。
9. `packages/engine-render/src/components/sheets/sheet.render-skeleton.ts` + `packages/core/src/sheets/sheet-skeleton.ts`：累積陣列、可視範圍、樣式快取、座標換格子。
10. `packages/engine-render/src/components/sheets/extensions/`：`font.ts`（最長，778 行）、`custom.ts`（111 行，最短的擴充實作，適合當寫擴充的範本）。
11. `packages/sheets-ui/src/controllers/render-controllers/scroll.render-controller.ts`、`zoom.render-controller.ts`、`mobile/mobile-scroll.render-controller.ts`：捲動、縮放、觸控。
12. `packages/sheets-ui/src/services/selection/`：`selection-render.service.ts` → `selection-control.ts` → `selection-shape-extension.ts`（填滿把手）。
13. `packages/sheets-ui/src/views/editor-container/EditorContainer.tsx` → `controllers/editor/editing.render-controller.ts` → `packages/docs-ui/src/services/selection/doc-selection-render.service.ts`：編輯器三件套。
14. `packages/sheets-ui/src/services/clipboard/`：`clipboard.service.ts` → `html-to-usm/converter.ts`（Excel 解析）→ `usm-to-html/convertor.ts`。
15. `packages/sheets/src/services/auto-fill/`：`rules.ts`、`tools.ts`、`auto-fill.service.ts`。
16. `packages/sheets-data-validation-ui/src/views/widgets/checkbox-widget.ts` 與 `packages/sheets-conditional-formatting/src/render/data-bar.render.ts`：兩種自訂渲染的最佳範本。

---

## 可以借用的部分與拆出方法（依賴、難度、怎麼接到別的專案）

| 想借的東西 | 主要位置 | 依賴 | 難度 | 建議做法 |
|---|---|---|---|---|
| 整套試算表（最實際） | `presets/packages/preset-sheets-core` 等 15 個 preset | React、rxjs、整組 `@univerjs/*`（版本要一致） | 低 | 照 `examples/src/sheets/mount.ts` 用 `createUniver()` + preset 嵌入；用 Facade API 讀寫格子，再自己同步到 Firebase |
| 自訂儲存格畫法 | `registerCellCustomRender`、`registerSheetMainExtension` | sheets-ui、engine-render | 低～中 | 寫成自己的外掛或在初始化後呼叫 |
| 真正的 HTML 按鈕 | `addFloatDomToRange` | sheets-drawing-ui、React 元件 | 低 | 用 `registerComponent` 註冊元件 |
| 虛擬捲動演算法 | 累積陣列 + `searchArray`、`bufferEdge`、`scrollAndClearCanvas`、`clipBlitRectToBounds` | 純演算法 | 中 | 照抄到自己的 Canvas 表格；`clipBlitRectToBounds` 能順便修好 Safari 18 以前的 `drawImage` 問題 |
| 1px 清晰線條 | `fixLineWidthByScale`、`*ByPrecision` | 無 | 低 | 直接抄 |
| Excel HTML 貼上解析 | `html-to-usm/converter.ts` | core 的 `ObjectMatrix`、`numfmt`、`IDocumentBody`；瀏覽器 DOM | 中 | 抄 `_parseMsoNumfmtFromCssText()` 與 `_parseTableByHtml()` 的邏輯，輸出改成自己的二維陣列 |
| 自動填滿規則 | `packages/sheets/src/services/auto-fill/rules.ts`、`tools.ts` | core 型別、`numfmt` | 低～中 | 大多是純函式，可移植；順便補上繁體序列 |
| 手機慣性與雙指縮放 | `mobile-scroll.render-controller.ts` | 只用原生 touch 事件 | 中 | 抄常數與「縮放中心不動」公式 |
| 單獨使用 engine-render | `packages/engine-render` | `@univerjs/core`（DI、Registry、Disposable…）、rxjs、`@floating-ui/dom`、`franc-min` | 高 | 不建議；它不是通用 Canvas 函式庫，骨架與擴充都綁 Univer 資料模型 |

**接到你現在的倉儲 / 庫存網頁（純 JavaScript + Firebase）的建議路線**：

1. 先用 preset 把整個試算表嵌進一個頁面（各套件 README 的表格有列 UMD 全域名稱，例如 `packages/engine-render/README.md` 寫 `UniverEngineRender`，代表應該可以不用打包工具、直接 `<script>` 引入；但我沒有實測 CDN 用法，**未確認**）。
2. 用 Facade 事件（`SheetEditEnded`、`ClipboardPasted` 等）抓到使用者改了什麼，再寫回 Firestore；反方向用 Facade 寫格子。
3. 庫存警示用路線 A 的 `customRender` 畫燈號；「查價」「下單」按鈕用路線 C 的 Float DOM；商品圖用路線 D。
4. 介面語系 repo 內已有 `zh-TW`（`sheets-ui/src/locale/zh-TW.ts`），可直接用。
5. 之後若要把 A、B、C 三個專案的優點合併，建議以 Univer 當「畫面與互動層」，把別的專案的公式引擎或資料庫邏輯接在 Facade 之後，而不是反過來拆 Univer 的渲染引擎。

---

## 坑與限制

1. **渲染迴圈一直在跑**：只要表格是作用中，RAF 每幀都會呼叫 `scene.render()`，靠「沒變就 return」省電。桌機無感，手機長時間開著是否耗電**未實測**。
2. **合併儲存格會讓捲動變慢一級**：`_canUseScrollFastPath()` 要求 `getMergeData().length === 0`，只要有一個合併儲存格，就不走「主畫布直接搬像素」那條最快的路（仍有視窗快取那一層）。
3. **字型快取可能只增不減**：`_clearCacheOutOfVisibleRange()` 寫好了（離可視範圍超過 100 列/欄就清掉），但呼叫處被註解掉（[sheet.render-skeleton.ts L498-L552](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/sheet.render-skeleton.ts#L498-L552)）。大表來回捲動後的記憶體影響**未確認**。
4. **累積陣列是 O(列數)**：每次骨架重算都會重建整條列高累積陣列；十萬列以上的工作表改列高、篩選時會不會卡**未實測**。
5. **Safari 18 以前的 `drawImage` 行為不同**：程式碼用 `clipBlitRectToBounds()` 自己裁切來繞過，註解寫明舊版 Safari 會讓凍結窗格內容消失（[spreadsheet.ts L214-L266](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/engine-render/src/components/sheets/spreadsheet.ts#L214-L266)）。自己抄捲動演算法時別漏掉。
6. **`registerCellCustomRender()` 的兩個陷阱**：它對「所有非空白」儲存格都掛同一組渲染器，要在 `drawWith` 裡自己判斷欄列；而且只在 `!cell.customRender` 時才掛，所以**已經有資料驗證核取方塊或下拉選單的格子，你的渲染器不會出現**。要共存就自己寫攔截器、把陣列「合併」而不是「覆蓋」。
7. **`registerSheetMainExtension()` 註冊當下不會自動重畫**（只有 dispose 時才 `makeDirty`）。依程式碼推論，註冊後可能要呼叫 `fWorksheet.refreshCanvas()` 才看得到（未實測）。
8. **編輯中不能縮放**：Ctrl+滾輪會被忽略，`SetZoomRatioCommand`、`ChangeZoomRatioCommand`（快捷鍵、滑桿都靠這兩個）在編輯器開著時直接回傳 false。
9. **手機版限制**：沒有拖拉填滿；儲存格內編輯改到公式列；手機外掛同時登記了桌機與手機兩個捲動控制器，原始碼自己留了 `TODO: Should not register these two Controllers at the same time`（[mobile-plugin.ts L281-L283](https://github.com/dream-num/univer/blob/c13b042d18c80c8348fbe52da445d68435febbca/packages/sheets-ui/src/mobile-plugin.ts#L281-L283)）。另外 `packages/ui` 的 `MobileCanvasGesture` 有匯出，但 repo 內沒有任何外掛使用（`grep` 只在 `index.ts` 與測試出現）。
10. **貼上相關**：Windows 用選單貼 Excel 內容會被提示改用快捷鍵；Excel 的具名數字格式（如 `Percent`）會被略過、改用顯示文字推斷；`convertTextToTable()` 直接把文字塞進 `<td>` 沒有跳脫 `<`、`&`，含這些字元的純文字表格可能被誤當 HTML（依程式碼推論，未實測；解析是在獨立文件裡進行並移除 `script/iframe`，不至於執行腳本）。
11. **自動填滿的中文序列是簡體**：「週一」「臘月」「子時」不會遞增，要自己補規則。
12. **Pro 功能不在 repo**：xlsx 匯入匯出、列印、圖表、樞紐分析、走勢圖、in-cell graphics、協作都屬 Univer Pro（README 對照表）。如果你的需求是「上傳 Excel 檔直接打開」，開源版要另外找 SheetJS 之類的解析器把資料轉成 Univer 格式。
13. **試算表渲染沒有用 Web Worker**：大量格子的排字、量測都在主執行緒；Worker 只用在文件排版。
14. **「局部重畫」只做了一半**：如上所述，資料改動會讓整個可視區重畫，`setDirtyArea()` 目前沒有作用。照抄這套架構時，若想做到只重畫被改的那幾格，要自己把 `_dirtyBounds` 接到 `renderByViewports()` 裡。
