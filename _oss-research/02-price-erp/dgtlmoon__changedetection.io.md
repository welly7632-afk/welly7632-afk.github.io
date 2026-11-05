# dgtlmoon/changedetection.io — 自架的「網頁變動＋商品價格／補貨」監控器，內建 AI 判讀與 MCP 伺服器
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：c32360a
> GitHub：https://github.com/dgtlmoon/changedetection.io｜⭐ 35504｜授權：Apache-2.0（品牌名稱與 Logo 不在授權範圍內）｜主要語言：Python｜最近更新：2026-11-04

> 本資料包所有 permalink 都指向 commit `c32360ae1de94b36d5bbdfc47258b1c0c82f2f67`，下文以 `…/blob/c32360a…/` 代稱時，完整網址前綴是 `https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/`。
> 程式版本：`changedetectionio/__init__.py` 內的 `__version__ = '0.60.10'`。

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 一套用 Python／Flask 寫的自架網頁監控工具。你把網址丟進去，它定時去抓頁面，有變化就透過 Apprise 函式庫支援的大量管道（Discord、Telegram、Slack、Email、自訂 Webhook 等）通知你。另外有一個專門的「單一商品頁補貨＋價格偵測」模式，會記錄每次的價格與庫存狀態，畫成價格走勢圖，也能匯出成 .xlsx。

**對你（台灣小店老闆、自建倉儲系統、有投廣告）實際能做的事：**

1. **盯競品／供應商價格**：把競品商品頁、供應商（例如批發網站）商品頁加進來，選「Re-stock & Price detection」模式，降價、漲價、補貨、缺貨都會通知你。可以設定上下限（低於 X 元才通知）和漲跌幅門檻（超過 5% 才通知）。
2. **價格歷史進 Excel**：每個商品的價格／庫存歷史可以下載成 `price-history-<uuid>.xlsx`（日期、庫存狀態、價格、幣別四欄），直接丟進你的試算表比價。
3. **把價格事件推進你自己的 Firebase 倉儲系統**：通知可以用 `post://` / `posts://`（自訂 HTTP POST）或 `json://` 打到你的 Cloud Function，再寫進 Firestore；或反過來用它的 REST API（`/api/v1/watch`）每天拉一次所有商品的 `price`、`in_stock`、`last_price`。
4. **盯廣告落地頁／競品活動頁的文案變化**：一般文字比對模式就能做，例如競品改了「滿千免運」文字、上了新活動頁。
5. **用 Claude 問「這週哪些競品降價了？」**：它內建 MCP 伺服器（`/mcp/v1`），可以用 `claude mcp add --transport http ...` 接上 Claude Code，直接用自然語言查詢監控結果、新增監控、設定補貨通知規則。
6. **用 Claude 當價格抽取器**：網站沒有結構化資料時，可以設定 LLM（支援 Anthropic Claude，透過 LiteLLM），由 AI 從頁面文字判讀主商品價格與庫存。

**跟你的三大興趣的關聯度：**
- 網頁版 Excel 試算表：**無直接關係**。它沒有試算表 UI，只有 .xlsx 匯入（批次新增監控網址）與 .xlsx 匯出（價格歷史）。
- 查價／比價／成本／ERP：**中高**。它是「價格追蹤」這一塊的現成好工具，但沒有 ERP、進貨、成本、庫存帳的功能。
- AI 影片／腳本：**無**。

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：Apache-2.0**（`LICENSE` 開頭確認為 Apache License 2.0）。
  - 個人使用：完全可以，自架、修改、不公開原始碼都沒問題。
  - 公司商用：也可以，包括改了之後放在公司內部用、甚至包成服務賣。要做的事：保留 `LICENSE`、`NOTICE` 檔案與著作權聲明；如果你修改了檔案並且「散布」（把程式給別人），要在修改的檔案註明有改過。Apache-2.0 也附帶專利授權，對商用相對友善。
- **品牌限制**：`NOTICE` 明寫「changedetection.io 名稱、Logo 及其他品牌素材不在 Apache-2.0 授權內」。你拿程式碼去做自己的工具時，**不要沿用它的名字和 Logo**。
  - 位置：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/NOTICE
- **第三方套件**：`NOTICE` 註明 feedgen 選用 BSD、paho-mqtt 選用 BSD-3-Clause；`requirements.txt` 註解特別說明刻意用 `rapidfuzz`（MIT）取代 GPL 的 `levenshtein`，避免整個專案被 GPL 傳染。依賴清單在 `docs/THIRD-PARTY-LICENSES.md`（未逐一開啟檢查）。
- **付費版**：作者有官方雲端訂閱（README 寫 US$8.99／月），賣點是「同一套開源程式，幫你代管、附 Chrome 與代理伺服器」。README 寫「Visual Selector 需要 Playwright fetcher（包含在訂閱服務中）」——但程式碼本身的 Playwright fetcher 是開源的（`content_fetchers/playwright.py`），自架只要自己另外跑一個瀏覽器容器即可。**沒有發現只有付費版才有的閉源程式碼**（以本 repo 內容判斷；雲端服務端是否有額外功能，未確認）。

## 3. 技術棧與執行需求（前端／後端／資料庫／部署方式／硬體或 GPU／需要哪些 API Key 與大概費用）

| 層 | 內容（依 `requirements.txt`、`Dockerfile`、`setup.py` 確認） |
|---|---|
| 後端 | Python ≥ 3.11（`setup.py` 的 `python_requires`），Flask 3、flask_restful（REST API）、Flask-SocketIO（即時更新 UI）、WTForms、Flask-Babel（多語系） |
| 前端 | 伺服器端 Jinja2 模板＋jQuery 3.6＋手寫 JS（例如價格圖 `static/js/restock-price-graph.js` 是手刻 SVG 折線圖，420 行，沒用圖表函式庫） |
| 資料庫 | **沒有資料庫**。每個監控（watch）一個資料夾：`watch.json`（設定）、`history.txt`（時間戳,檔名 的索引）、每次快照一個 `.txt` 或 Brotli 壓縮的 `.txt.br`；補貨模式設定另存 `restock_diff.json` |
| 抓網頁 | `requests`（快速、不跑 JS）；Playwright／Puppeteer／Selenium（跑 Chrome，要另外起瀏覽器服務，環境變數 `PLAYWRIGHT_DRIVER_URL`，預設 `ws://playwright-chrome:3000`） |
| 解析 | lxml、BeautifulSoup、jsonpath-ng、jq、elementpath（XPath 2/3）、extruct（抓 JSON-LD／microdata／OpenGraph）、price-parser、babel |
| 通知 | Apprise 2.1.0（Discord、Telegram、Slack、Email、MS Teams、自訂 JSON/POST 等） |
| AI | LiteLLM（100+ 供應商，包含 OpenAI、Gemini、Anthropic、Ollama、vLLM、LM Studio）、rank-bm25（長頁面裁切）、mcp-types＋authlib（MCP 伺服器與 OAuth） |
| 部署 | Docker（`docker compose up -d`，對外 port 5000）、或 `pip3 install changedetection.io` 後執行 `changedetection.io -d /資料夾 -p 5000`；有 Windows 與樹莓派（ARM）說明 |

**硬體**：不需要 GPU。只用 requests 模式時一般小主機／NAS 即可；要跑 Chrome（盯 JS 渲染的電商頁，例如蝦皮）就要多給記憶體（README 未給數字，Chrome 本身常吃數百 MB，**實際需求未確認**）。

**API Key 與費用**：
- 本體免費、自架免費。
- LLM（選用）：自備 API Key（設定頁或環境變數 `LLM_MODEL`、`LLM_API_KEY`、`LLM_API_BASE`）。README 宣稱用小模型「每次檢查不到 1 美分」；程式碼裡有月度 token 預算（`token_budget_month`）與每個監控的 token 上限，可以防爆量。實際費用依模型與檢查頻率，**未試算**。
- 代理伺服器（選用）：盯防爬嚴格的網站可能需要，README 推薦 Bright Data／Oxylabs（付費）。
- 不能直接部署在 Firebase Hosting（Firebase 只放靜態檔＋Cloud Functions，這是長駐 Python 伺服器）。要放在 VPS、家用電腦、NAS 或 Cloud Run／Fly.io 之類有持久磁碟的地方（Cloud Run 無持久磁碟，需另掛儲存，**未驗證**）。

## 4. 程式架構地圖（目錄樹，標註每個重要資料夾／檔案的用途）

計數方式：`git ls-tree -r --name-only HEAD` 共 1,278 個檔案；排除 `/tests/` 後的 `.py` 檔 191 個、合計 46,500 行（`xargs cat | wc -l`）；`/tests/` 內 `test_*.py` 201 個。

```
changedetection.py                 # 啟動入口
changedetectionio/
├── __init__.py                    # 版本號、main()、命令列參數
├── flask_app.py                   # Flask app、註冊所有 blueprint、REST API 路由（L974-L1032）、版本檢查執行緒
├── worker.py / worker_pool.py     # 背景抓取工作者，從佇列拿 watch 去 fetch → processor → 存快照 → 通知
├── queuedWatchMetaData.py, custom_queue.py  # 優先佇列
├── processors/                    # ★「怎麼判斷有沒有變」的核心
│   ├── base.py                    # difference_detection_processor 基底類別
│   ├── text_json_diff/            # 預設模式：文字／JSON 比對、篩選器、觸發字
│   ├── restock_diff/              # ★ 補貨＋價格模式
│   │   ├── __init__.py            # Restock 資料結構、parse_currency()（價格字串→數字）
│   │   ├── processor.py           # 抓價格／庫存、判斷要不要通知
│   │   ├── pure_python_extractor.py  # 不用 lxml 的 JSON-LD／OpenGraph／microdata 抽取
│   │   ├── filtered_price.py      # 使用者自選 CSS/XPath 區塊後抽出價格
│   │   ├── difference.py          # 價格歷史、統計（最低／中位數／P25/P75）、.xlsx 匯出
│   │   ├── api.yaml               # REST API 的補貨設定與狀態 schema
│   │   └── plugins/               # llm_restock（AI 抽價）、mcp_tools（MCP 工具）、api_state、default_charts
│   └── image_ssim_diff/           # 截圖比對模式（OpenCV／libvips）
├── content_fetchers/              # 抓網頁：requests.py、playwright.py、puppeteer.py、webdriver_selenium.py
│   └── res/stock-not-in-stock.js  # ★ 在瀏覽器裡掃「已售完／Sold out」等字串判斷缺貨
├── browser_steps/browser_steps.py # 瀏覽器步驟（登入、點擊、輸入、選規格），21 種動作
├── llm/                           # AI：client.py（LiteLLM 包裝）、evaluator.py（意圖判斷、摘要、預算）、prompt_builder.py、model_list.py
├── blueprint/
│   ├── mcp/                       # ★ MCP 伺服器 /mcp/v1、OAuth、存取權杖、27 個核心工具（tools.py）
│   ├── price_data_follower/       # 偵測到頁面有 LD-JSON 價格時，一鍵切換成補貨模式
│   ├── imports/                   # 匯入：網址清單、Distill.io JSON、Wachete xlsx、自訂欄位 xlsx
│   ├── ui/diff.py                 # 歷史頁、/processor-data、/processor-chart、/processor-export.xlsx
│   ├── settings/llm/              # AI 供應商設定頁
│   └── rss/, tags/, backups/, pwa/ ...
├── api/                           # REST API v1（Watch、Tags、Import、Changes、Search、Notifications、SystemInfo）
├── model/Watch.py                 # Watch 資料模型、快照存取（history.txt、Brotli）
├── store/                         # 檔案式資料存放（原子寫入 watch.json）、資料升級腳本 updates.py
├── notification/                  # Apprise 整合、自訂 HTTP 處理器（post:// get:// 等）
├── notification_service.py        # 通知內容變數（diff、triggered_text、llm_summary、restock.price…）
├── conditions/                    # 條件規則（JSON Logic），例如「抽出的數字 < 500」
├── pluggy_interface.py            # 外掛 hook 規格（21 個 @hookspec）
├── example_plugins/               # 外掛範例：fetcher、processor、restock 圖表、UI
├── translations/zh_Hant_TW/       # 繁體中文介面翻譯
└── static/js/restock-price-graph.js # 價格走勢 SVG 圖
docs/api-spec.yaml                 # OpenAPI 規格
```

## 5. 核心功能怎麼實作（功能 → 程式碼位置（permalink）→ 實作重點）

### 5.1 補貨＋價格偵測主流程
- 位置：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/processor.py#L460-L755
- 重點（依序）：
  1. 原始 HTML checksum 沒變、設定也沒改 → 直接跳過（省 CPU 與 AI token）。
  2. 讀取 `restock_diff.json` 設定；如果所屬標籤（群組）有「覆蓋」設定則用群組的。
  3. 先用內建抽取器從結構化資料找 `price`／`availability`／`currency`（見 5.2）。
  4. 找不到或找到多個價格 → 呼叫外掛（含 LLM 抽價，見 5.4）。
  5. 使用者若有自訂 CSS/XPath 篩選器指到價格 → 以使用者指定為準（L593）。
  6. 可用性字串包含 `instock`、`instoreonly`、`limitedavailability`、`onlineonly`、`presale` 就算有貨（L618-L631）。
  7. **「說謊偵測」**：如果瀏覽器 JS 掃描頁面看到「Sold out」類文字，即使結構化資料說有貨也改判缺貨（L677-L685）。
  8. 快照只存一行文字 `In Stock: True - Price: 1290.0`，用 MD5 比對。
  9. 通知判斷（L696-L751）：缺貨→有貨（`in_stock_only`）或任何庫存變化（`all_changes`）；價格變了 → 若在使用者設定的 min～max 區間內就不通知；變動幅度小於 `price_change_threshold_percent` 也不通知。
  10. `last_price` 只在價格真的變動時才更新（L638-L648），用來顯示漲跌箭頭與百分比。

### 5.2 從 HTML 結構化資料抽價格（JSON-LD／OpenGraph／microdata）
- 兩段式：先純 Python（`html.parser`），失敗再用 extruct（lxml），而且在 Linux 上放到子行程跑，避免 lxml 記憶體洩漏（檔案內有一大段註解解釋）。
- 純 Python 版：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/pure_python_extractor.py#L159-L291
- extruct 版：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/processor.py#L317-L391
- 技巧：用 jsonpath `$..(price|Price)`、`$..(availability|Availability)` 在整棵結構裡「找任何叫 price 的欄位」，再去重；多於一個不同價格就丟 `MoreThanOnePriceFound`（所以它只適合「單一商品頁」，不適合分類列表頁）。

### 5.3 價格字串 → 數字（含千分位、小數逗號）
- 位置：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/__init__.py#L17-L92
- `parse_currency()` 處理 `1,299`、`1.299,95`、`39,99`；`get_price_change_percent()` 算漲跌百分比。
- 使用者自選區塊抽價：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/filtered_price.py#L1-L85 —— 只接受「旁邊有幣別符號」的數字；有兩個不同的帶幣別金額（原價＋特價）就報錯要你縮小範圍，避免默默追蹤到原價。台灣頁面常見的「NT$1,290」「$1,290」理論上會被 price-parser 認成帶幣別（**未實測**）。

### 5.4 AI（LLM）抽價與庫存判讀
- 位置：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/plugins/llm_restock.py#L48-L113 （system prompt）
- 重點：頁面先抽 JSON-LD、去掉頁首頁尾等「外框」、轉純文字並裁到 `LLM_RESTOCK_MAX_CONTENT_CHARS`（預設 15,000 字元），要求 LLM 回傳 `{"price", "currency", "availability"}` 純 JSON。prompt 寫得很細：忽略購物車圖示的 $0、忽略「你可能也喜歡」區塊的價格、原價＋特價取特價、選規格前回傳 null。結果以「模型＋完整 prompt」做快取，頁面雜訊變了但內容沒變就不重複花錢。
- 只有內建抽取失敗時才會呼叫（是 fallback，不是每次都花 token）。

### 5.5 瀏覽器端缺貨文字掃描
- 位置：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/content_fetchers/res/stock-not-in-stock.js
- 由 Playwright 在頁面中執行（`content_fetchers/playwright.py` L429：`self.instock_data = await self.page.evaluate(INSTOCK_DATA_JS)`）。
- 內建 114 個多國語「缺貨」字串（以 awk 擷取 `outOfStockTexts` 陣列、計算以引號開頭的行數），**中日韓只有 4 個：`品切れ`、`已售`、`已售完`、`품절`（L109-L112）**。沒有「缺貨」「售完補貨中」「完售」「暫無庫存」等台灣常用字——盯台灣電商時建議自己補。
- 只看「畫面上方 300px～1300px」之間、可見元素的直屬文字，避免誤抓到推薦商品區。

### 5.6 價格歷史、統計與 .xlsx 匯出
- 位置：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/difference.py#L67-L172
- `compute_price_summary()`：最低、最高、平均、中位數、P25／P75，判斷現價是 low／typical／high、是否歷史最低（`all_time_low`）。這段 50 行左右、純 Python 標準庫，**很適合直接搬去你的系統做「現在是不是好價格」判斷**。
- `export_xlsx()`：用 openpyxl 輸出四欄（日期、庫存、價格、幣別），價格存成真正的數字、日期存成真正的日期格式。
- 路由：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/blueprint/ui/diff.py#L537-L610 （`/diff/<uuid>/processor-data`、`/processor-chart`、`/processor-export.xlsx`）

### 5.7 瀏覽器步驟（登入、選規格、點按鈕）
- 位置：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/browser_steps/browser_steps.py#L100-L351
- 21 個 `action_*` 方法（以 `grep -c "async def action_"` 計）：前往網址、點含文字的元素、輸入文字、執行 JS、點座標、下拉選單選項、捲動、等待文字、勾選框、移除元素等。可用來「先選顏色／尺寸再看價格」。

### 5.8 通知與 Webhook
- 自訂 HTTP 通知處理器：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/notification/apprise_plugin/custom_handlers.py#L178-L228 —— `post://`、`posts://` 等網址會轉成真的 HTTP 請求，body 是 JSON 時自動帶 `Content-Type: application/json`；預設擋私有 IP（SSRF 防護），要打內網需設 `ALLOW_IANA_RESTRICTED_ADDRESSES=true`。
- 通知可用的變數：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/notification_service.py#L205-L245 ；補貨模式額外有 `restock.price`、`restock.in_stock`、`restock.last_price`、`restock.previous_price`（https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/__init__.py#L116-L145 ）。通知內容可用 Jinja2 模板自己組 JSON。

### 5.9 文字模式也能「發現價格」
- 一般文字模式偵測到頁面有 LD-JSON 商品資料時會標記 `has_ldjson_price_data`，UI 提示是否切換成價格模式：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/blueprint/price_data_follower/__init__.py
- 條件規則可用「Filters & Triggers 後抽出的數字」比大小（用 price-parser）：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/conditions/default_plugin.py#L58-L83

### 5.10 資料儲存
- 快照寫入：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/model/Watch.py#L782-L840 （超過門檻用 Brotli 壓縮，再把「時間戳,檔名」附加到 `history.txt` 並 fsync）
- 歷史索引讀取：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/model/Watch.py#L560-L600
- 設定原子寫入：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/store/file_saving_datastore.py#L35-L60
- 程式碼自己也註明「@todo - kinda bad, needs to be in its own DB」：價格歷史是從快照文字用正規表達式 `Price:\s*(\d+...)` 解析回來的，不是正式的價格表。

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 價格統計（低／一般／高、歷史最低） `compute_price_summary()` | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/difference.py#L67-L118 | 只有 `statistics` 標準庫 | 低 | 直接請 Claude 改寫成 JavaScript，放進你的倉儲系統，輸入 `[{timestamp, price}]` 就能顯示「目前價格落在歷史第幾百分位」 |
| 價格字串解析 `Restock.parse_currency()` | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/__init__.py#L24-L48 | babel | 低 | 改寫成 JS 函式處理「NT$1,290」「1.299,95 €」等格式 |
| 篩選區塊抽價（含「原價＋特價」防呆） | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/filtered_price.py | price-parser | 低 | 自己寫爬蟲時抽價用；JS 可用正則＋幣別視窗的同樣邏輯 |
| 純 Python 結構化資料抽取（JSON-LD／OG／microdata） | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/pure_python_extractor.py | html.parser、jsonpath-ng | 低～中 | 放進 Cloud Function（Python runtime）當「商品頁→價格／庫存」API；或請 Claude 改寫成 Node.js |
| LLM 抽價 system prompt＋快取策略 | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/plugins/llm_restock.py#L48-L113 | 任何 LLM（可直接用 Claude API） | 低 | prompt 是純文字，可直接搬去你的 Claude API 呼叫；建議加上繁中規則（「缺貨」「售完」「NT$」） |
| 缺貨文字掃描 JS | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/content_fetchers/res/stock-not-in-stock.js | 瀏覽器 DOM | 低 | 可放進 Chrome 擴充功能或 Playwright 腳本；記得補台灣用語 |
| 補貨／價格通知判斷規則（min/max、%門檻、in_stock_only） | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/processor.py#L696-L751 | 無 | 低 | 邏輯約 55 行，可照抄成 JS 用在你自己的價格追蹤 |
| 價格歷史 .xlsx 匯出 | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/difference.py#L121-L159 | openpyxl | 低 | 前端可改用 SheetJS 做同樣的四欄匯出 |
| 手刻 SVG 價格走勢圖（有貨綠、缺貨紅） | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/static/js/restock-price-graph.js | jQuery | 中 | 420 行，無圖表函式庫；拿掉 jQuery 後可放進純 JS 專案 |
| MCP 伺服器（無狀態 HTTP JSON-RPC 手寫版）＋權限格 | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/blueprint/mcp/__init__.py ／ https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/blueprint/mcp/tools.py#L1680-L1786 | Flask、mcp-types、jsonschema | 中 | 想讓自己的倉儲系統也能被 Claude 查詢時，照這個「每個工具＝讀／寫等級＋JSON schema」的寫法做 |
| 自訂 HTTP Webhook 處理器 | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/notification/apprise_plugin/custom_handlers.py#L178-L228 | apprise、requests | 中 | 參考它的 SSRF 防護寫法 |
| 瀏覽器步驟引擎 | https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/browser_steps/browser_steps.py#L100-L351 | Playwright | 中 | 自建爬蟲要「選規格再看價」時可參考動作清單 |
| 整套服務（不拆，直接用） | Docker image `ghcr.io/dgtlmoon/changedetection.io` | Docker | 低 | 用 REST API／Webhook 跟你的 Firebase 系統串（見第 8 節） |

## 7. AI／Claude 整合（用哪些模型、prompt 放在哪、有沒有 MCP／Skills、能不能換成 Claude）

- **模型層**：全部透過 LiteLLM 呼叫（https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/llm/client.py ），模型字串由使用者設定（例如 `anthropic/<模型 ID>`），程式碼沒有寫死任何模型。
- **Claude 原生支援的證據**：
  - 設定頁可列出 Anthropic 模型清單（呼叫 `https://api.anthropic.com` 的 models 端點，加 `anthropic/` 前綴）：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/llm/model_list.py#L116-L123
  - 對 Claude 模型自動加 prompt caching（`cache_control: ephemeral`）：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/llm/evaluator.py#L142-L150
  - `client.py` 內有針對 Claude 新模型不接受 temperature 參數、thinking 參數要放頂層等特別處理（L28-L39、L127-L135）。
- **AI 功能有三個**：
  1. **意圖判斷**（「只有降到 500 元以下才通知」這種自然語言規則）：`llm/evaluator.py` 的 `evaluate_change()`；prompt 在 `llm/prompt_builder.py` 的 `build_eval_system_prompt()`。
  2. **變動摘要**（通知內容變成「價格從 $89.99 降到 $67」）：`summarise_change()`，預設 prompt `DEFAULT_CHANGE_SUMMARY_PROMPT`（evaluator.py L163 起），可在 UI 改寫成繁中。
  3. **AI 抽價／庫存**（見 5.4）。
- **成本控管**：每月全域 token 預算、每個監控每期 token 上限、超過預算的動作設定（`model/LLMSettings.py`）；只有內建抽取失敗才呼叫 AI 抽價，並以 prompt 內容做快取。
- **MCP 伺服器（重點）**：`/mcp/v1`，無狀態 Streamable HTTP，需要 MCP 專用存取權杖（不是 REST API key）；可以 `?readonly=1` 只讀。檔頭註解直接寫了 Claude Code 的接法：
  `claude mcp add --transport http changedetection http://localhost:5000/mcp/v1 --header "Authorization: Bearer YOUR_MCP_TOKEN"`
  - 核心工具 27 個（以 `TOOLS = {` 區塊中 `'名稱': (` 開頭的行計數），例如 `list_watches`、`get_changes`、`get_diff`、`find_change`、`create_watch`、`import_watches`、`recheck_watches`、`add_notification`、`delete_watch`。
  - 補貨模式外掛再加 2 個：`restock_status`（各商品有沒有貨、價格與歷史）、`restock_set_rules`（設定補貨／價格上下限／% 門檻）：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/plugins/mcp_tools.py#L154-L174
  - 權限格：監控、標籤可寫；通知、系統預設只讀（tools.py L1680-L1712）。
  - 有 OAuth（`blueprint/mcp/oauth/`），可能可以給 claude.ai 的遠端連接器用（**未實測**）。
- **Skills**：repo 內沒有 Claude Skills（SKILL.md）檔案（以檔案清單搜尋確認）。
- **結論**：Claude 支援屬於「原生」等級——設定頁選 Anthropic、填 API Key 就能用；MCP 讓 Claude Code 直接操作它。

## 8. 擴充方式與 API

- **REST API v1**（https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/flask_app.py#L974-L1032 ，規格 `docs/api-spec.yaml`）：
  - `POST /api/v1/watch`（新增，`"processor": "restock_diff"` 就是價格模式）、`GET/PUT/DELETE /api/v1/watch/{uuid}`、`GET /api/v1/watch`（列表）
  - `GET /api/v1/watch/{uuid}/history`、`/history/{timestamp}`、`/difference/{from}/{to}`
  - `/api/v1/tags`、`/tag`、`/notifications`、`/search`、`/changes`、`/import`、`/systeminfo`、`/full-spec`
  - 補貨模式在 GET 時多回傳 `in_stock`、`price`、`currency`、`last_price`（https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/plugins/api_state.py ），設定 schema 在 https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/api.yaml#L1-L50
  - 認證：header `x-api-key`，可在設定關閉（https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/api/auth.py ）。
- **外掛系統（pluggy）**：21 個 hook（以 `grep -c "@hookspec"` 計），透過 setuptools entry point `changedetectionio` 載入：自訂抓取器、自訂 processor、抽價覆寫（`get_itemprop_availability_override`）、側邊欄、設定頁籤、MCP 工具（`register_mcp_tools`）、API 狀態欄位等。規格：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/pluggy_interface.py
  - 價格圖也能換：`restock_diff_watchlist_overview_chart`、`restock_diff_watch_history_page_chart`。
  - 範例在 `changedetectionio/example_plugins/`（fetcher、processor wordcounter、restock simple_svg_chart、UI hello_world）。
  - **台灣電商專用抽價外掛**可以照 `llm_restock.py` 檔頭的範例寫：實作 `get_itemprop_availability_override(content, url, llm_intent, text)`，針對蝦皮／momo／PChome 頁面結構回傳 `{'price':..., 'availability':...}`。
- **匯入**：網址清單、Distill.io JSON、Wachete xlsx、自訂欄位對應的 xlsx（https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/blueprint/imports/importer.py#L246-L326 ）——你可以從試算表整批匯入競品網址＋標籤＋篩選器＋檢查間隔。
- **其他**：RSS 輸出、Chrome 擴充功能（獨立 repo，未檢查）、Socket.IO 即時狀態。

## 9. 程式品質與風險（維護狀況、測試、資安／隱私、遙測、已知的坑）

- **維護**：非常活躍。最新 commit 2026-11-04（`UI - Minor dark mode improvements`），版本 0.60.10；GitHub Actions 有測試、容器建置、CodeQL、PyPI 發佈流程（`.github/workflows/` 共 6 個 yml）。
- **測試**：`tests/` 下 201 個 `test_*.py`（檔案清單計數）；CI 會驗證 OpenAPI 規格。
- **程式碼風格**：註解非常詳細（記憶體洩漏原因、bug 編號 `#4493`、`#2707` 都寫在程式裡），對「拿來學／拆」很友善。
- **遙測（要注意）**：預設每天 POST 一次到 `https://changedetection.io/check-ver.php`，送出 `version`、`app_guid`（安裝識別碼）、`watch_count`（監控數量），而且 `session.verify = False`（不驗 TLS 憑證）。關閉方法：環境變數 `DISABLE_VERSION_CHECK=true`。位置：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/flask_app.py#L1613-L1661
- **隱私**：開了 AI 功能，頁面內容與 diff 會送到你選的 AI 供應商（README 免責聲明有寫）。
- **資安**：
  - 預設只綁 `127.0.0.1:5000`（docker-compose），**預設沒有登入密碼**，若要對外開放一定要在設定頁設密碼或放在反向代理後面。
  - REST API key 可在設定關閉，關掉就等於 API 不設防。
  - 有 SSRF 防護（擋私有 IP，12 處引用 `ALLOW_IANA_RESTRICTED_ADDRESSES`）、Jinja2 沙箱（`jinja2_custom/safe_jinja.py`）、正規表達式 ReDoS 逾時。
  - MCP 頁面文字被明確標註為「不可信資料」，提示 AI 不要照做頁面中的指令（prompt injection 防護意識）。
- **已知的坑**：
  - 補貨模式**只適用單一商品頁**；分類頁、搜尋結果頁多個價格會報錯（要改用文字模式＋篩選器）。
  - **台灣電商未內建支援**：程式碼中搜尋 `shopee`、`momo`、`pchome`、`TWD`、`NT$` 皆無結果。蝦皮是重度 JS＋防爬，大概需要 Chrome fetcher＋代理，甚至可能被擋（**未實測**）；momo／PChome 頁面是否有 JSON-LD 價格資料**未確認**，需實際加一個監控看能不能抓到。
  - 缺貨字串庫中文只有 `已售`、`已售完`。
  - 價格歷史存在快照文字中（不是資料庫），大量商品長期累積時查詢效率普通。
  - 只能單一行程對一個資料夾（`file_saving_datastore.py` 註明不支援多行程）。
  - 遵守各網站服務條款、robots.txt 是使用者自己的責任（README 免責聲明）。

## 10. 跟其他專案組合的建議

1. **最省力組合（推薦先做）**：自架 changedetection.io（Docker，家裡電腦或便宜 VPS）→ 通知設 `posts://你的-cloud-function網址`，body 用 Jinja2 模板輸出 `{"uuid":"{{watch_uuid}}","url":"{{watch_url}}","price":"{{restock.price}}","in_stock":"{{restock.in_stock}}"}` → Cloud Function 寫進 Firestore 的 `competitor_prices` 集合 → 你的倉儲系統顯示「競品價 vs 我的售價 vs 我的成本」。（變數名稱以 `notification_service.py` 與 restock `__init__.py` 為準；模板寫法細節未實測。）
2. **定期拉取**：Cloud Scheduler 每天呼叫 `GET /api/v1/watch`，把所有 `restock_diff` 監控的 `price`／`last_price`／`in_stock` 一次同步。
3. **跟「網頁版 Excel」專案組合**：把 `export_xlsx()` 或 API 回傳的價格歷史，餵進你挑選的網頁試算表元件（另一份資料包），做成「價格比較試算表」：每列一個商品、各欄為各家價格，再用公式算毛利。
4. **跟 ERP／成本專案組合**：ERP 管進價、成本、庫存；changedetection.io 只負責「市場價格」這一欄。把 `compute_price_summary()` 改成 JS 放進 ERP，商品頁就能顯示「競品目前在歷史低點」。
5. **跟 Claude 組合**：用 MCP 接 Claude Code，每週問「列出這週降價超過 10% 的競品」；或把 `llm_restock.py` 的 prompt 改成繁中版，拿去你自己的 Claude API 腳本做「貼網址→抽價格」。
6. **跟 AI 影片／腳本專案組合（弱相關）**：競品上新品或改文案時觸發通知 → 交給影片／腳本工具產出對應的廣告素材靈感。這只是概念，本 repo 無相關程式碼。

## 11. 價格相關功能檢查表

- **商品與價格資料模型（品項、多單位、多幣別／匯率、價目表、客戶別價格）**：**部分有**。只有「每個監控一筆」的 `Restock` 結構：`in_stock`、`price`、`currency`、`last_price`（https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/__init__.py#L50-L57 ）。會記錄幣別字串，但**沒有匯率換算、多單位、價目表、客戶別價格**。
- **進價：多家供應商報價、比價、詢價單（RFQ）、採購單**：**沒有**。可以用「標籤（tag）」把同一商品的多家供應商頁面分成一組來人工比價，但沒有比價表、RFQ、採購單功能（以目錄結構與 grep 判斷，無相關模組）。
- **成本：庫存估值（FIFO／移動平均）、到岸成本（運費、關稅、雜費分攤）、毛利與定價計算**：**沒有**。唯一相關的是價格統計（最低／中位數／P25／P75）：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/difference.py#L67-L118
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知**：**有（本專案強項）**。抓價：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/processor.py#L460-L755 ；歷史＋xlsx 匯出：https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/processors/restock_diff/difference.py#L121-L172 ；通知門檻（上下限、%）：同 processor.py L696-L751；AI 抽價 fallback：`plugins/llm_restock.py`。
- **庫存／倉儲（入庫、出庫、盤點），以及跟使用者自建倉儲系統（Firebase）串接的方式（API、Webhook、匯入匯出）**：**倉儲功能沒有**（它的「庫存」是指別人網站有沒有貨，不是你的倉庫）。**串接方式有**：REST API（`x-api-key`）https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/flask_app.py#L974-L1032 ；Webhook（`post://`／`posts://`／`json://`）https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/notification/apprise_plugin/custom_handlers.py#L178-L228 ；xlsx 匯入監控清單、xlsx 匯出價格歷史；RSS；MCP。沒有 Firebase 專用整合。
- **台灣在地化：繁中介面、新台幣、台灣稅制／電子發票**：
  - 繁中介面：**有**。`translations/zh_Hant_TW/LC_MESSAGES/messages.po`，語言選單顯示「繁體中文」（https://github.com/dgtlmoon/changedetection.io/blob/c32360ae1de94b36d5bbdfc47258b1c0c82f2f67/changedetectionio/languages.py#L150 ）。以單行 `msgid/msgstr` 粗略計數 1,290 組，其中 42 組 msgstr 為空（多行字串未計入，僅供參考）。
  - 新台幣：**沒有專門處理**（程式碼搜尋 `TWD`、`NT$` 無結果）；幣別是照網頁結構化資料原樣存，價格解析是通用邏輯，「NT$1,290」能否正確解析**未實測**。
  - 台灣稅制／電子發票：**沒有**。
  - 台灣電商（蝦皮／momo／PChome）：**沒有專門支援**，缺貨字串只有 `已售`、`已售完`（stock-not-in-stock.js L109-L112）。

## 關鍵字
changedetection.io、網頁變動監控、價格追蹤、降價通知、補貨通知、缺貨偵測、競品監控、比價、價格歷史、price tracking、restock alert、website change detection、web monitoring、JSON-LD、OpenGraph、microdata、extruct、Playwright、Browser Steps、Apprise、Webhook、REST API、MCP server、Claude Code、LiteLLM、Anthropic、LLM 抽價、xlsx 匯出、Flask、Python、Docker、自架、Apache-2.0、繁體中文介面、蝦皮、momo、PChome
