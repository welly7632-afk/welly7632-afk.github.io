# clucraft/PriceGhost — 自架的「網頁價格追蹤＋AI 抓價投票」工具，Claude Haiku 原生支援
> 資料包｜分類：查價・比價・ERP｜掃描日期：2026-11-04｜commit：33b9445
> GitHub：https://github.com/clucraft/PriceGhost｜⭐ 1132｜授權：README 寫「MIT」，但沒有 LICENSE 檔（GitHub 偵測為無授權）｜主要語言：TypeScript｜最近更新：2026-02-03

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 貼上任何商品網址，PriceGhost 會用 4 種方法（JSON-LD、各大電商專用規則、通用 CSS、AI）同時抓價，讓它們「投票」選出正確價格，之後定時重抓、記錄價格歷史，降價／到達目標價／補貨時推播通知。

**對你（台灣小老闆、自建倉儲 App、有在下廣告）可以這樣用：**

1. **盯競品價格**：把對手在 momo、PChome、蝦皮、官網的商品頁丟進去，每小時自動抓一次，看到對手降價就收到 Telegram／Discord 通知，方便你調整自己的售價或廣告出價。
   - 注意：它**沒有**台灣電商的專用規則（只針對 Amazon、Walmart、Best Buy 等美國站），台灣網站要靠「JSON-LD／通用 CSS／AI」三招，實際成功率**未確認**（本次沒有執行程式）。
2. **盯供應商／進貨來源價格**：追蹤 1688、AliExpress、淘寶以外的批發網頁價格；AliExpress 有專用規則。
3. **最值得「拆零件」的地方**：
   - `scrapeProductWithVoting()`「多方法投票＋AI 仲裁」的抓價流程，可以搬到你自己的 Firebase Cloud Functions 裡，給你的倉儲 App 加一個「競品價格」欄位。
   - 4 組 Claude prompt（抓價、驗證價格、驗證庫存、多價格仲裁），可以直接改寫成你自己的 Claude 呼叫。
   - 5 種推播通道（Telegram、Discord、Pushover、ntfy、Gotify）的發送函式，每個都只有 20～50 行。
4. **不適合**：它不是 ERP、不是試算表、沒有進貨成本／庫存／毛利計算，也跟 AI 影片無關。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **實際狀況：** 整個 repo 75 個檔案（以 `git ls-tree -r --name-only HEAD` 列出並計數）裡**沒有 `LICENSE` 檔**，`package.json` 也沒有 `license` 欄位；唯一的授權文字是 README 最後的 `## License` 底下一行「MIT」（[README.md#L388-L390](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/README.md#L388-L390)）。所以 GitHub 判定為「沒有授權」。
- **白話解讀：**
  - 作者**明確表達想用 MIT**，但 MIT 授權本來要求「附上完整授權全文＋版權聲明」，這裡兩者都沒有，法律上屬於「意圖清楚、文件不完整」的灰色狀態。嚴格來說，沒有完整授權檔＝預設保留所有權利，不能假設可以自由複製改用。
  - **個人使用：** 自己架起來用、自己研究程式碼，風險很低（作者公開放上 GitHub 且寫了 MIT，就是希望大家用）。
  - **公司商用／把程式碼拆進你自己的產品：** 建議先做其中一件事：(1) 在 GitHub 開 issue 請作者補上 `LICENSE` 檔；或 (2) 只參考「做法」自己重寫（例如投票演算法、prompt 的思路），不要整段複製。若作者補上 MIT，則只要保留版權聲明就可商用、可閉源。
- **付費版／閉源功能：** 沒有。程式碼裡沒有授權金鑰、付費牆或「Pro 版」字樣（`grep -ri licen` 只找到 README 那一處）。唯一的費用是你自己選用的 AI API。
- **第三方服務條款提醒：** 這個工具會用偽裝成 Chrome 的 headers 和 Puppeteer stealth 外掛繞過反爬（Cloudflare），抓別人網站可能違反該網站的使用條款，這與程式碼授權無關，但商用時要自己評估。

---

## 3. 技術棧與執行需求

| 層 | 技術（皆從 `package.json`／`Dockerfile` 讀到） |
|---|---|
| 前端 | React 18 + TypeScript + Vite 5、react-router-dom 6、Recharts 2（價格走勢圖）、axios；有 PWA（`frontend/public/manifest.json`、`sw.js`） |
| 後端 | Node.js 20 + Express 4 + TypeScript（`tsx` 開發） |
| 抓網頁 | axios（一般 HTTP）＋ cheerio（解析 HTML）＋ puppeteer 22 + puppeteer-extra-plugin-stealth（JS 重的網站） |
| AI SDK | `@anthropic-ai/sdk` ^0.24、`openai` ^4.47、`@google/generative-ai` ^0.24；Ollama 用 axios 直接打 `/api/chat` |
| 資料庫 | PostgreSQL（docker-compose 用 `postgres:16-alpine`），用 `pg` 寫原生 SQL，沒有 ORM |
| 排程 | node-cron，每分鐘掃一次「到期該檢查」的商品 |
| 認證 | JWT（7 天有效）＋ bcrypt |
| 部署 | Docker Compose 三個容器：postgres、backend（含系統 chromium）、frontend（nginx 反向代理 `/api`）；GitHub Actions 推映像到 `ghcr.io` |

**執行需求：**
- 一台能跑 Docker 的電腦或 VPS 即可，**不需要 GPU**（除非你選 Ollama 本機模型）。Puppeteer 會開 headless Chromium，記憶體建議 2GB 以上（經驗值，未實測）。
- **它不能跑在 Firebase Hosting 上**：需要常駐的 Node 伺服器＋PostgreSQL＋Chromium。若要跟你的 Firebase App 整合，建議另外開一台小 VPS，或只把抓價邏輯拆到 Cloud Functions（Puppeteer 在 Cloud Functions 上可行但較麻煩）。
- **API Key（全部選填）：** Anthropic、OpenAI、Google Gemini 任選一個，或免費本機 Ollama。README 自稱 Claude Haiku 4.5 每次檢查約 US$0.001（作者說法，未驗證）。AI 送出的 HTML 會先截到 25,000 字元以內（[ai-extractor.ts#L210-L213](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/ai-extractor.ts#L210-L213)），以 Haiku 計價大約每次數千到一萬 token 輸入；追蹤 100 個商品、每小時一次，一個月約 7 萬次呼叫，費用要自己估（開啟「AI 驗證」才會每次都呼叫）。
- **通知：** Telegram Bot Token、Discord Webhook、Pushover、ntfy、Gotify 擇一，都免費或有免費方案。
- 小坑：README 說開 `http://localhost:8089`，但 `docker-compose.yml` 實際把前端對應到 **80 埠**（[docker-compose.yml#L41-L45](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/docker-compose.yml#L41-L45)），以 compose 檔為準。

---

## 4. 程式架構地圖

（行數用 `wc -l` 計算；後端 `backend/src` 共 17 個 `.ts` 檔、7,086 行；前端 `frontend/src` 共 25 個 `.ts/.tsx` 檔、8,426 行）

```
PriceGhost/
├── docker-compose.yml          # postgres + backend + frontend 三容器
├── database/init.sql           # 初版資料表（users、products、price_history、system_settings）
├── backend/
│   ├── Dockerfile              # node:20-slim + 系統 chromium，PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
│   └── src/
│       ├── index.ts            # Express 入口；runMigrations() 啟動時自動加欄位、建表；掛路由；啟動排程
│       ├── config/database.ts  # pg Pool
│       ├── middleware/auth.ts  # JWT 驗證
│       ├── models/index.ts     # 1,034 行：所有 SQL 查詢（user/product/priceHistory/stockStatusHistory/notificationHistory）
│       ├── routes/             # 7 個路由檔，共 38 個端點（grep router.get/post/put/delete 計數）
│       │   ├── products.ts     # 新增商品（觸發投票、回傳候選價格）、修改、刪除、批次暫停
│       │   ├── prices.ts       # 價格歷史、手動重抓、庫存歷史
│       │   ├── settings.ts     # 通知設定＋測試、AI 設定＋測試（13 個端點）
│       │   ├── notifications.ts / profile.ts / auth.ts / admin.ts
│       ├── services/
│       │   ├── scraper.ts      # 2,135 行：核心抓價。10 組網站專用規則＋JSON-LD＋通用 CSS＋投票＋Puppeteer
│       │   ├── ai-extractor.ts # 1,199 行：4 種 prompt × 4 家 AI 供應商
│       │   ├── scheduler.ts    # 每分鐘檢查到期商品、寫價格歷史、觸發通知
│       │   └── notifications.ts# Telegram/Discord/Pushover/ntfy/Gotify 發送
│       └── utils/priceParser.ts# 從文字解析價格與幣別（處理 1.234,56 歐式格式、排除「/mo」分期價）
└── frontend/src/
    ├── api/client.ts           # 所有 API 呼叫（axios）＋型別定義
    ├── pages/                  # Dashboard、ProductDetail、Settings（2,115 行）、NotificationHistory、Login、Register
    └── components/
        ├── PriceSelectionModal.tsx # 「價格候選人」選擇視窗（本專案賣點）
        ├── PriceChart.tsx      # Recharts 價格走勢＋最高/最低/平均
        ├── Sparkline.tsx       # 純 SVG 7 日迷你走勢線
        ├── StockTimeline.tsx   # 庫存狀態時間軸
        └── ProductCard.tsx / NotificationBell.tsx / ...
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| **抓網頁（HTTP → 瀏覽器備援）** | [scraper.ts#L1362-L1437](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L1362-L1437) | Best Buy、Target、Walmart、Costco 直接用 Puppeteer；其他先用 axios 帶完整 Chrome headers，遇到 403 才改用瀏覽器；靜態 HTML 找不到價格也會再用瀏覽器重跑一次。 |
| **Puppeteer 反爬** | [scraper.ts#L250-L316](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L250-L316) | stealth 外掛、移除 `--enable-automation`、模擬滑鼠移動和捲動；偵測 Cloudflare「Just a moment...」標題最多等 20 秒。每次都 launch／close 一個新瀏覽器（較耗資源）。 |
| **方法 1：JSON-LD** | [scraper.ts#L90-L124](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L90-L124) | 讀 `<script type="application/ld+json">` 的 schema.org `offers.price / lowPrice / priceCurrency`，信心值 0.9。**台灣多數電商有 JSON-LD，這招對你最有用**，且幣別會正確帶出 `TWD`。 |
| **方法 2：網站專用規則** | [scraper.ts#L335-L1087](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L335-L1087) | `siteScrapers` 陣列，每組是 `{ match(url), scrape($) }`。我數到 10 組（`grep -c "match: (url)"`）：Amazon、Walmart、Best Buy、Target、eBay、Newegg、Home Depot、Costco、AliExpress、Magento 2。**沒有任何台灣網站**。要加 momo／PChome 就照這個格式加一組。 |
| **方法 3：通用 CSS** | [scraper.ts#L173-L247](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L173-L247)、選擇器清單 [L1089-L1106](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L1089-L1106) | 依序試 `[itemprop="price"]`、`[data-price]`、`.price`、`[class*="price" i]` 等 16 個選擇器，最多取 3 個候選。 |
| **投票與共識** | [scraper.ts#L41-L87](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L41-L87) | 價差 5% 內視為同一組；票數最多的組勝出，同票比平均信心值；「過半」或「第一名比第二名多」就算有共識。 |
| **決策優先順序** | [scraper.ts#L1501-L1742](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L1501-L1742) | ① 使用者確認過的「錨定價格」（15% 內找最接近的候選，用來鎖定多規格商品的某個規格）→ ② 使用者偏好的抽取方法 → ③ 共識 → ④ 無共識時 AI 仲裁 → ⑤ 完全找不到時 AI 純抽取 → ⑥ 只有單一候選時 AI 驗證。AI 判斷有誤會標 `needsReview`。 |
| **新增商品時讓使用者選價** | 後端 [products.ts#L24-L182](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/routes/products.ts#L24-L182)；前端 [PriceSelectionModal.tsx](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/frontend/src/components/PriceSelectionModal.tsx) | 第一次 POST 回 `needsReview: true` 和所有候選價；使用者選完再 POST 一次帶 `selectedPrice/selectedMethod`，存成 `anchor_price` 與 `preferred_extraction_method`。 |
| **價格文字解析** | [priceParser.ts#L34-L102](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/utils/priceParser.ts#L34-L102) | 符號對照只有 `$ € £ ¥ ₹ CHF`；排除「/mo、per month、N payments」等分期價；自動判斷 `1.234,56` 歐式格式。**「NT$1,290」會被當成 USD 1290**（`$` 對應 USD）。 |
| **排程重抓＋通知** | [scheduler.ts#L8-L243](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scheduler.ts#L8-L243) | cron 每分鐘跑；`isRunning` 旗標防重入；商品逐一處理，每個之間隨機等 2～5 秒；下次檢查時間＝間隔 ±5 分鐘抖動（[models/index.ts#L377-L379](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/models/index.ts#L377-L379)）。三種通知：降價超過門檻、跌破目標價（只在「剛跌破」時發一次）、缺貨→有貨。 |
| **庫存狀態偵測** | [scraper.ts#L1969-L2130](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L1969-L2130) | 先看 schema.org `availability`，再掃主內容區的英文關鍵字（sold out、pre-order…）。**沒有中文關鍵字**（grep「售」「缺貨」0 筆），中文網站要靠 JSON-LD 或 AI。 |
| **推播** | [notifications.ts#L340-L420](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/notifications.ts#L340-L420) | 已設定且啟用的通道用 `Promise.allSettled` 並行送出，回傳成功／失敗的通道清單並寫入 `notification_history`。 |
| **資料庫遷移** | [index.ts#L250-L311](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/index.ts#L250-L311)（啟動段）、[database/init.sql](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/database/init.sql) | 沒有遷移工具，啟動時用一連串 `IF NOT EXISTS … ALTER TABLE ADD COLUMN` 補欄位。 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 多方法投票抓價 `scrapeProductWithVoting` | [scraper.ts#L1362-L1746](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L1362-L1746) | axios、cheerio、puppeteer-extra、ai-extractor、models（讀使用者 AI 設定） | 中 | 把 `userId → getAISettings` 改成直接傳 API Key，就變成純函式；放進 Firebase Cloud Function（2nd gen，記憶體開大）或你自己的 Node 小伺服器，結果寫回 Firestore。 |
| 價格投票共識演算法 `findPriceConsensus` | [scraper.ts#L41-L87](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L41-L87) | 無 | 低 | 47 行純函式，可直接改寫成你 App 裡的 plain JavaScript，用來比對多個來源（例如 3 家供應商報價）的「合理價格」。 |
| JSON-LD 價格抽取 | [scraper.ts#L90-L124](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L90-L124)、[L1770-L1862](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L1770-L1862) | cheerio | 低 | 抓台灣電商最穩的一招；配合 cheerio 或瀏覽器原生 `DOMParser` 就能用。 |
| AI 用 HTML 精簡器 `prepareHtmlForAI` | [ai-extractor.ts#L132-L216](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/ai-extractor.ts#L132-L216) | cheerio | 低 | 先抽 JSON-LD 和價格元素放最前面，再刪 script/style、只留商品區塊，截到 25,000 字元。任何「丟網頁給 Claude」的工具都可沿用以省 token。注意它只抓含 `$` 的價格元素，`NT$` 剛好也符合。 |
| 4 組 AI prompt | [ai-extractor.ts#L41-L130](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/ai-extractor.ts#L41-L130)、仲裁 [L948-L970](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/ai-extractor.ts#L948-L970) | 無 | 低 | 抽取／驗證價格／驗證規格庫存／多價格仲裁，各要求回傳 JSON。可翻成中文版並加上「新台幣、含稅價、會員價、滿額折」等台灣情境。 |
| 推播發送函式 | [notifications.ts](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/notifications.ts) | axios | 低 | 每個通道一個函式，可直接搬到你的 Cloud Functions；想加 LINE Notify 替代方案（LINE Messaging API）就照同樣形狀加一個。 |
| 網站專用規則框架 `siteScrapers` | [scraper.ts#L330-L1087](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L330-L1087) | cheerio | 低（框架）／中（寫新規則） | `{match, scrape}` 外掛式結構，適合讓 Claude Code 幫你寫 momo、PChome、蝦皮、露天的規則。 |
| 價格歷史資料表＋排程邏輯 | [init.sql#L59-L133](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/database/init.sql#L59-L133)、[scheduler.ts](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scheduler.ts) | PostgreSQL、node-cron | 中 | 換成 Firestore 集合 `products/{id}/priceHistory`＋Cloud Scheduler 觸發即可。 |
| 7 日迷你走勢 Sparkline | [Sparkline.tsx](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/frontend/src/components/Sparkline.tsx) | React（純 SVG，不需圖表套件） | 低 | 145 行，改成原生 JS 產生 SVG 字串就能放進你的倉儲表格每一列。 |
| 價格選擇視窗 UX | [PriceSelectionModal.tsx](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/frontend/src/components/PriceSelectionModal.tsx) | React | 中 | 主要價值是「讓人確認 AI/爬蟲抓到的價格」這個流程設計，可照抄互動邏輯。 |

---

## 7. AI／Claude 整合

- **供應商與預設模型**（[ai-extractor.ts#L219-L222](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/ai-extractor.ts#L219-L222)）：
  - Anthropic：`claude-haiku-4-5-20251001`（預設，README 最推薦）；CHANGELOG 1.0.5 記載介面可選 Haiku 4.5／Sonnet 4.5／Opus 4.5
  - OpenAI：`gpt-4.1-nano-2025-04-14`
  - Google：`gemini-2.5-flash-lite`
  - Ollama：任意本機模型（README 推薦 Qwen3），送出前先塞 `/nothink` 關閉思考模式、`num_ctx: 16384`（[ai-extractor.ts#L282-L327](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/ai-extractor.ts#L282-L327)），並用 `stripThinkingTags` 移除 `<think>` 區塊。
- **Claude 呼叫方式**：官方 SDK `anthropic.messages.create`，單一 user 訊息＝prompt＋精簡後 HTML，`max_tokens` 依用途 1024／512／256（[ai-extractor.ts#L224-L251](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/ai-extractor.ts#L224-L251)）。沒有用 tool use／structured output，靠 prompt 要求「只回 JSON」再用 regex 撈 JSON 解析（`parseAIResponse` 等，L603-L788）。
- **prompt 位置**：全部是 `ai-extractor.ts` 裡的常數字串：`VERIFICATION_PROMPT`（L41）、`STOCK_STATUS_PROMPT`（L79）、`EXTRACTION_PROMPT`（L113）、`ARBITRATION_PROMPT`（L949）。ai-extractor.ts 共 27 個頂層函式（`grep -c "^async function\|^export async function\|^function"`），基本上是「4 種任務 × 4 家供應商」的重複程式碼。
- **AI 會在 4 個時機被叫**：無候選價時抽取、多候選無共識時仲裁、單一候選時驗證、錨定價格命中時驗證該規格庫存。
- **MCP／Skills：** 沒有。
- **Claude 支援度：原生**。而且 README 自稱整個專案是用 Claude Code（Claude Opus 4.5）開發的（[README.md#L55-L66](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/README.md#L55-L66)）。
- **改進建議**：拆出來時可改用 Claude 的 tool use／JSON schema 輸出取代 regex 解析；把 4 家供應商的重複程式碼收斂成一個 `callLLM(provider, prompt)`。

---

## 8. 擴充方式與 API

- **REST API**：38 個端點（7 個路由檔以 `grep -c "router\.\(get\|post\|put\|delete\)("` 計數：admin 6、auth 3、notifications 4、prices 3、products 6、profile 3、settings 13）＋ `/health`。全部用 `Authorization: Bearer <JWT>`。
  - 你的倉儲 App 可以：`POST /api/auth/login` 取 JWT → `POST /api/products {url}` 新增追蹤 → `GET /api/products` 取得所有商品＋最新價格＋7 日走勢 → `GET /api/products/:id/prices?days=30` 取歷史。
- **沒有 Webhook 對外輸出**：唯一的「對外推送」是 Discord／ntfy／Gotify 通知。若要讓你的 Firebase 收到降價事件，最省事做法是：自架 ntfy 或在 `notifications.ts` 加一個「通用 Webhook」函式，POST 到你的 Cloud Function。
- **沒有匯入／匯出（CSV、Excel）功能**（前後端都沒有相關路由或按鈕；以檔案清單與路由清單比對確認）。
- **擴充點**：
  1. 新網站規則 → 在 `siteScrapers` 陣列加一組。
  2. 新 AI 供應商 → 在 `ai-extractor.ts` 每種任務各加一個函式並在 `try*` 分派處加分支。
  3. 新通知通道 → `notifications.ts` 加函式、`sendNotifications` 加分支、`users` 表加欄位（在 `index.ts` 的 `runMigrations` 加 `ALTER TABLE`）。
- **多使用者**：每人有自己的商品與設定；第一個註冊的使用者自動成為管理員，可關閉公開註冊。

---

## 9. 程式品質與風險

**維護狀況**
- 2026-01-20 建立、1/23 發 1.0.0、1/26 發 1.0.6（CHANGELOG 共 7 個版本），最後 push 2026-02-03。到掃描日已 **9 個月沒有更新**，屬於「短期衝刺後停更」型的個人專案。
- 有 GitHub Actions 自動建 Docker 映像推到 ghcr.io（`.github/workflows/docker-build.yml`）。

**測試**
- **沒有任何測試檔**（`find` 搜 `*.test.*`／`*.spec.*` 結果為 0），也沒有 lint 設定。

**資安／隱私**
- **API Key 明碼存資料庫且明碼回傳前端**：`users` 表的 `anthropic_api_key` 等是 `TEXT` 欄位，`GET /api/settings/ai` 直接把完整 Key 回傳（[settings.ts#L320-L348](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/routes/settings.ts#L320-L348)）。只給自己用問題不大，開放給別人註冊就有風險。
- **SSRF 風險**：新增商品只檢查 `new URL(url)` 格式（[products.ts#L35-L41](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/routes/products.ts#L35-L41)），任何登入者都能讓伺服器去抓內網位址（例如 `http://postgres:5432`、雲端 metadata）。不要把註冊開放給陌生人。
- **預設弱密碼**：docker-compose 的 Postgres 密碼是 `postgres`，且對外開 5432 埠；`JWT_SECRET` 預設字串 `change-this-in-production-use-strong-secret`（[docker-compose.yml](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/docker-compose.yml)）。上線前一定要改，並移除 5432 對外埠。
- `cors()` 全開（[index.ts#L259](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/index.ts#L259)）；JWT 存在前端（7 天有效）。
- 抓到的網頁 HTML 會送到你選的 AI 供應商（Anthropic／OpenAI／Google），這是功能本身的資料流。
- **遙測**：搜尋 analytics／telemetry／sentry／posthog／gtag 皆 0 筆，未發現遙測。

**已知的坑（讀程式碼推斷，未實際執行驗證）**
1. **價格歷史可能每次都新增一筆**：`pg` 預設把 `DECIMAL` 欄位回傳成字串，專案沒設 `setTypeParser`，而排程用 `latestPrice.price !== scrapedData.price.price`（字串 vs 數字）判斷有無變價（[scheduler.ts#L106-L109](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scheduler.ts#L106-L109)），結果應該永遠為「不相等」→ 每次檢查都寫入一筆。降價通知因為降幅＝0 不會誤發，但資料量會隨檢查頻率線性成長。
2. **使用者手動選價時幣別寫死 USD**：`priceHistoryQueries.create(product.id, selectedPrice, 'USD', // TODO …)`（[products.ts#L65-L71](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/routes/products.ts#L65-L71)）。
3. **新台幣顯示錯**：`priceParser` 沒有 TWD；前端 `ProductCard` 和通知訊息的幣別符號只認 EUR/GBP/CHF/JPY/INR，其餘一律顯示 `$`，價格固定 `toFixed(2)`（例如「$1290.00」）。
4. **Magento 規則太寬**：任何以 `.html` 結尾的網址都會被當成 Magento 站（[scraper.ts#L989-L994](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L989-L994)）；PChome 等網址若以 .html 結尾可能誤套規則（影響程度未確認）。
5. 排程是單執行緒逐一處理，每個商品之間還要等 2～5 秒，再加上 Puppeteer 每次啟動整個瀏覽器；追蹤幾百個商品時一輪可能要很久。
6. 兩份 schema 定義（`database/init.sql`、`backend/src/config/init-db.ts`、以及 `index.ts` 的 `runMigrations`）並存，容易不同步。

---

## 10. 跟其他專案組合的建議

- **PriceGhost（抓價大腦）＋ 你自己的 Firebase 倉儲 App（商品主檔）**：在倉儲 App 的商品資料加一欄「競品網址」，用 Cloud Function 呼叫拆出來的 `scrapeProductWithVoting`（或直接呼叫自架 PriceGhost 的 REST API），把最新競品價與 7 日走勢寫回 Firestore，表格裡用 Sparkline 顯示。
- **＋ 網頁版試算表元件（01-web-excel 類專案，例如 Univer、Luckysheet、x-spreadsheet 等，看你挑哪個）**：把「我的成本／我的售價／競品價（PriceGhost）／價差％」做成一張試算表，價差用條件格式上色。PriceGhost 本身完全沒有試算表或匯出功能，這一塊必須靠別的專案補。
- **＋ 同類別的 changedetection.io（dgtlmoon）或 Discount-Bandit（Cybrarist）**：這兩個在本資料夾已有資料包。changedetection.io 擅長「任意網頁區塊變動偵測＋大量通知整合」，PriceGhost 擅長「價格判讀正確性（投票＋AI＋人工確認）」。組合思路：用 PriceGhost 的投票與 prompt 邏輯，搭配另一個專案較成熟的排程／通知架構。
- **＋ ERP（Odoo、ERPNext 等若在清單中）**：PriceGhost 不碰進貨與成本，可把它的競品價格當作 ERP「定價參考」欄位的資料來源。
- **＋ AI 影片／腳本工具（03-video-script）**：可以把「競品剛降價」當作觸發條件，自動產生促銷短片或廣告文案草稿；但這要自己寫串接，PriceGhost 沒有任何影片相關功能。

---

## 11. 價格相關功能檢查表

- **商品與價格資料模型（品項、多單位、多幣別／匯率、價目表、客戶別價格）**：**部分有**。只有「商品＝一個網址」＋價格歷史（`price DECIMAL(10,2)`、`currency VARCHAR(10)`）（[init.sql#L59-L133](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/database/init.sql#L59-L133)）。會記幣別代碼，但**沒有匯率換算、沒有多單位、沒有價目表、沒有客戶別價格**。
- **進價：多家供應商報價、比價、詢價單（RFQ）、採購單**：**沒有**。它追蹤的是單一網址的價格，沒有「同一商品多個來源」的關聯，也沒有 RFQ／採購單。比價只能自己在 Dashboard 用名稱或網站排序目視比較（[Dashboard.tsx](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/frontend/src/pages/Dashboard.tsx) 有依名稱／網站排序）。
- **成本：庫存估值（FIFO／移動平均）、到岸成本（運費、關稅、雜費分攤）、毛利與定價計算**：**沒有**。只有每個商品的歷史最低／最高／平均價統計（[models/index.ts `getStats`](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/models/index.ts#L738-L755)）。
- **價格追蹤：抓網頁價格、價格歷史、降價／補貨通知**：**有（本專案核心）**。抓價見 [scraper.ts#L1362-L1746](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scraper.ts#L1362-L1746)；歷史見 `price_history`、`stock_status_history` 表；降價門檻／目標價／補貨三種通知見 [scheduler.ts#L52-L197](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/services/scheduler.ts#L52-L197)；5 種推播通道。檢查間隔 5 分鐘～24 小時可設。
- **庫存／倉儲（入庫、出庫、盤點），以及跟使用者自建倉儲系統（Firebase）串接的方式**：**沒有倉儲功能**；只有「對方網站有沒有貨」的庫存狀態（`in_stock／out_of_stock／unknown`）。串接方式只能靠 REST API（JWT）或自行新增 Webhook 通知通道；**沒有匯入匯出**、沒有 Firebase 相關程式碼。
- **台灣在地化：繁中介面、新台幣、台灣稅制／電子發票**：**都沒有**。介面全英文、沒有 i18n（grep `i18n`／`zh-` 0 筆）；新台幣不在幣別對照表，`NT$` 會被當成 USD（[priceParser.ts#L7-L20](https://github.com/clucraft/PriceGhost/blob/33b944588d5b5e9689909858da1b9e92c369bd3f/backend/src/utils/priceParser.ts#L7-L20)），只有 JSON-LD 帶 `priceCurrency: TWD` 時資料庫才會存對幣別；庫存關鍵字只有英文；沒有任何台灣電商專用規則；沒有稅制／電子發票。

---

## 關鍵字

PriceGhost、價格追蹤、查價、比價、競品價格監控、降價通知、補貨通知、目標價、價格歷史、爬蟲、網頁抓價、AI 抓價、價格投票、AI 仲裁、Claude Haiku、Anthropic、OpenAI、Gemini、Ollama、Qwen3、JSON-LD、schema.org、cheerio、Puppeteer、stealth、Cloudflare、Telegram、Discord、ntfy、Pushover、Gotify、PostgreSQL、Express、React、Recharts、Sparkline、自架、self-hosted、price tracker、price monitoring、price drop alert、web scraping、TypeScript、Docker
