# agentsmd/agents.md — AGENTS.md 開放格式的官方網站 repo：讓 Codex、Cursor、Gemini 等 AI 讀同一份「給 AI 看的 README」

> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：d001185
> GitHub：https://github.com/agentsmd/agents.md｜⭐ 25318｜授權：MIT（程式碼）；依專案章程，文件類內容採 CC BY 4.0｜主要語言：TypeScript｜最近更新：2026-09-10

> 先講結論：這個 repo **不是工具、也沒有規格書檔案**，它是 https://agents.md 這個網站本身的原始碼（Next.js，共 62 個檔案）。「AGENTS.md 格式」的全部官方內容，其實就寫在網站元件裡的幾段文字：建議放哪些段落、巢狀檔案怎麼決定優先順序、衝突時誰贏、哪些工具支援。它是你「多 AI 共用規則」的**地基標準（檔名＋放置位置＋優先順序）**，但角色、技能、巡讀、防重複、防新舊衝突**一樣都沒有**，要靠同資料夾其他專案（ruler、spec-kit、OpenSpec、docguard 等）補上。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：AGENTS.md 就是「寫給 AI 看的 README」：在專案根目錄放一個 Markdown 檔，把建置指令、測試方法、程式碼風格、注意事項寫進去，Codex、Cursor、Gemini CLI、Copilot 等 23 個工具都會讀它。

**對你（倉儲／庫存 Web App＋廣告＋多 AI 協作）的實際用途：**

1. **當「唯一事實來源」(single source of truth) 的檔名標準**：你現在 GPT/Codex 跟 Claude 各講各的，最根本的修法就是：所有共用規則只寫在 `AGENTS.md` 一份，Codex 會原生讀取（官網把 Codex 列為相容工具第一位），Claude Code 則用 `CLAUDE.md` 匯入同一份（做法見第 7、11 節）。
2. **用「巢狀 AGENTS.md」分層**：例如根目錄放全專案規則，`functions/`（Firebase Cloud Functions）放後端專屬規則，`public/js/inventory/` 放庫存模組規則。官方規則是「離被編輯的檔案最近的那一份優先」。
3. **拿官方建議的段落當骨架**：專案概觀、建置與測試指令、程式碼風格、測試說明、資安注意事項，再加上提交訊息／PR 規範、部署步驟（見第 5 節）。
4. **把「完成前要跑哪些檢查」寫進去**：官方 FAQ 明講：只要你在 AGENTS.md 列出測試指令，AI 會嘗試執行並在結束前修好失敗。這是最便宜的「防漏」機制。
5. **它自己的 `AGENTS.md`（43 行）是一份很好的小範本**：示範「禁止 AI 做某件事＋理由＋替代做法」的寫法（例如不准在 AI 對話中跑 `npm run build`）。

它**不能**幫你做：角色分工、Skills、交接紀錄、每日巡讀、重複內容偵測、版本衝突偵測。這些要靠第 10 節列的組合。

---

## 2. 授權白話

| 項目 | 內容 | 出處 |
|---|---|---|
| 程式碼授權 | MIT，`Copyright (c) 2025 OpenAI` | [LICENSE#L1-L3](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/LICENSE#L1-L3) |
| 文件授權 | 專案章程第 7.b.iv 條：「Documentation will be received and made available by the Project under the Creative Commons Attribution 4.0」 | [Technical_Charter.pdf](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/Technical_Charter.pdf)（第 7 頁，我用 `pdftotext` 轉文字後閱讀） |
| 新貢獻 | 章程 7.b.i–iii：新程式碼一律 MIT，且需 DCO 簽署 | 同上（第 6–7 頁） |
| 治理 | 章程於 **2025 年 12 月 8 日**通過；專案改由 Linux Foundation 旗下 Agentic AI Foundation (AAIF) 託管 | 同上第 1 頁；網站文字見 [components/AboutSection.tsx#L21-L25](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/AboutSection.tsx#L21-L25) |

- **個人使用**：完全沒問題。其實你「寫一份自己的 AGENTS.md」根本不涉及這個 repo 的授權——檔名慣例不受著作權保護，你寫的內容是你自己的。
- **公司商用**：如果只是在自家專案放 AGENTS.md，無任何限制。若要**整段複製官網的範例文字**放進你要販售或公開的教材，依 CC BY 4.0 要標註出處；複製網站程式碼則保留 MIT 授權聲明即可。
- **商標**：章程提到專案名稱由 LF Projects 授權使用（第 6 頁附近有 trademark usage 字樣），若你要做一個商業產品並以「AGENTS.md」為品牌名稱，要另看 LF Projects 的政策——細節**未確認**（我沒有連到外部網站）。
- **閉源／付費版**：沒有。這是一個開放格式，沒有付費功能。

---

## 3. 技術棧與執行需求

| 層 | 內容 | 出處 |
|---|---|---|
| 前端 | Next.js 16.1.0（Pages Router，`pages/` 目錄）、React 19.2.3、Tailwind CSS 4.1.11 | [package.json#L11-L18](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/package.json#L11-L18) |
| 後端 | 無獨立後端；只有 `getStaticProps` 在建置／重新驗證時呼叫 GitHub API 抓 4 個範例 repo 的貢獻者頭像 | [pages/index.tsx#L47-L160](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/pages/index.tsx#L47-L160) |
| 資料庫 | 無 | — |
| 部署 | Vercel（`@vercel/analytics`、`.gitignore` 有 `.vercel`）；網站在 https://agents.md | [pages/_app.tsx#L4](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/pages/_app.tsx#L4)、[README.md#L35-L49](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/README.md#L35-L49) |
| 套件管理 | pnpm 9.15.1 | [package.json#L26](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/package.json#L26) |
| 硬體／GPU | 不需要 | — |
| API Key | 選填 `GH_AUTH_TOKEN`（GitHub token，只為了避免 GitHub API 每小時 60 次的未驗證限制） | [pages/index.tsx#L87-L94](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/pages/index.tsx#L87-L94) |
| 費用 | 0 元。**你根本不需要跑這個網站**——要用 AGENTS.md，只要在自己的專案新增一個 Markdown 檔 | — |

---

## 4. 程式架構地圖

計數方式：`git ls-tree -r --name-only HEAD | wc -l` = 62 個檔案；文字檔（排除圖片、PDF、lockfile）用 `wc -l` 合計 1,888 行；`.tsx` 檔 19 個；`public/logos/` 下 svg 27 個。

```
agents.md/
├── README.md                 # 49 行；含一份「Sample AGENTS.md」範例（L10-L33）＋本機跑網站方法
├── AGENTS.md                 # 43 行；這個 repo 自己給 AI 的規則（Next.js 開發守則）← 很好的小範本
├── LICENSE                   # MIT, Copyright (c) 2025 OpenAI
├── Technical_Charter.pdf     # 7 頁；Linux Foundation 專案章程（治理、角色、授權）
├── package.json              # Next.js / React / Tailwind 依賴
├── pages/
│   ├── index.tsx             # 首頁組裝各區塊＋getStaticProps 抓 GitHub 貢獻者
│   ├── _app.tsx              # <head> meta＋Vercel Analytics
│   └── _document.tsx         # HTML 外框
├── components/
│   ├── Hero.tsx              # 首頁大標＋精簡版 AGENTS.md 範例（「used by over 60k open-source projects」）
│   ├── WhySection.tsx        # 為什麼要和 README 分開（設計理念）
│   ├── CompatibilitySection.tsx  # ★ 支援工具清單（23 個）＋跑馬燈 UI
│   ├── ExamplesSection.tsx   # 範例區（完整版 AGENTS.md 範例＋範例 repo 卡片）
│   ├── ExampleListSection.tsx    # 4 個範例 repo：openai/codex、apache/airflow、temporalio/sdk-java、PlutoLang/Pluto
│   ├── HowToUseSection.tsx   # ★ 官方「怎麼寫」4 步驟＋巢狀規則
│   ├── FAQSection.tsx        # ★ 官方 FAQ：必填欄位、衝突處理、測試指令、遷移、Aider/Gemini 設定
│   ├── CodeExample.tsx       # ★ 兩份範例 AGENTS.md 字串＋簡易 Markdown 上色＋複製按鈕
│   ├── AboutSection.tsx      # 起源（Codex、Amp、Jules、Cursor、Factory 共同推動）＋AAIF 託管
│   ├── Section.tsx / Footer.tsx / icons/*.tsx   # 版面元件
├── public/logos/*.svg        # 27 個工具 logo
└── styles/globals.css        # Tailwind＋跑馬燈動畫
```

★ = 真正承載「格式規範」的檔案。**這個 repo 裡沒有 `SPEC.md`、沒有 JSON Schema、沒有版本號**——規範全是網站上的散文。

---

## 5. 核心功能怎麼實作

這裡的「功能」其實就是「格式規則」。以下逐條列出規則原文位置與白話說明。

| 規則／功能 | 位置（permalink） | 重點 |
|---|---|---|
| 放哪裡 | [HowToUseSection.tsx#L7-L13](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx#L7-L13) | 放在 repo 根目錄；可以叫 AI 幫你起草。 |
| 建議段落 | [HowToUseSection.tsx#L16-L28](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx#L16-L28) | Project overview、Build and test commands、Code style guidelines、Testing instructions、Security considerations。 |
| 額外內容 | [HowToUseSection.tsx#L31-L33](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx#L31-L33) | 提交訊息／PR 規範、資安陷阱、大型資料集、部署步驟——「你會告訴新同事的事都可以放」。 |
| 巢狀檔案 | [HowToUseSection.tsx#L35-L40](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx#L35-L40) | 每個子專案放自己的 AGENTS.md；AI 自動讀「目錄樹中最近的那一份」，最近者優先。舉例：OpenAI 主 repo 當時有 88 份 AGENTS.md。 |
| 必填欄位 | [FAQSection.tsx#L13-L16](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L13-L16) | **沒有**。就是普通 Markdown，標題隨你取。 |
| 衝突時誰贏 | [FAQSection.tsx#L18-L21](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L18-L21) | 「離被編輯檔案最近的 AGENTS.md 優先；使用者在對話中的明確指示凌駕一切。」這是整個格式**唯一**的優先順序規則。 |
| 測試指令會不會自動跑 | [FAQSection.tsx#L23-L26](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L23-L26) | 會（只要你有列）。AI 會嘗試執行檢查，並在完成前修好失敗。 |
| 可以改嗎 | [FAQSection.tsx#L28-L30](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L28-L30) | 「當作活文件 (living documentation)」。注意：官方**沒有**說怎麼管版本。 |
| 舊檔遷移 | [FAQSection.tsx#L32-L48](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L32-L48) | `mv AGENT.md AGENTS.md && ln -s AGENTS.md AGENT.md`——**用符號連結讓舊檔名指向新檔**。這招同樣可以用在 `CLAUDE.md`。 |
| Aider 設定 | [FAQSection.tsx#L50-L66](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L50-L66) | `.aider.conf.yml` 寫 `read: AGENTS.md`。 |
| Gemini CLI 設定 | [FAQSection.tsx#L68-L88](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L68-L88) | `.gemini/settings.json` 寫 `{"context": {"fileName": "AGENTS.md"}}`。 |
| 為什麼和 README 分開 | [WhySection.tsx#L17-L25](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/WhySection.tsx#L17-L25) | README 給人看；AGENTS.md 放 AI 需要但會讓 README 變亂的細節（建置步驟、測試、慣例）。 |
| 精簡範例 | [CodeExample.tsx#L22-L32](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/CodeExample.tsx#L22-L32) | Setup commands＋Code style 兩段，共 11 行。 |
| 完整範例 | [CodeExample.tsx#L34-L61](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/CodeExample.tsx#L34-L61)（同內容也在 [README.md#L10-L33](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/README.md#L10-L33)） | Dev environment tips／Testing instructions／PR instructions 三段，每條都是「一個可以直接執行的指令＋何時用」。 |
| 支援工具清單 | [CompatibilitySection.tsx#L14-L141](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/CompatibilitySection.tsx#L14-L141) | 一個 `agents: AgentEntry[]` 陣列，23 筆（`grep -c 'name: "'` 計數），見第 11 節。 |
| 範例 repo 貢獻者 | [pages/index.tsx#L47-L160](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/pages/index.tsx#L47-L160) | 對 4 個 repo 呼叫 `api.github.com/repos/{name}/contributors`，用 `Link` header 的 `rel="last"` 頁碼推算總人數；記憶體快取 12 小時、ISR 每 24 小時重新產生。 |

**這個 repo 自己的 AGENTS.md 寫法重點**（[AGENTS.md#L1-L43](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/AGENTS.md#L1-L43)）：
- 開頭一句說明「專案是什麼、在哪」。
- 用編號標題分成：1. 用開發伺服器不要 build（[#L8-L15](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/AGENTS.md#L8-L15)）、2. 依賴同步、3. 程式碼慣例、4. 指令速查表（[#L30-L37](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/AGENTS.md#L30-L37)）。
- 每條禁令都附**理由**（build 會讓 `.next` 變成 production 資產、熱更新失效）和**替代做法**——這樣 AI 比較不會「自作聰明」繞過。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 官方建議段落清單（5＋4 項） | [HowToUseSection.tsx#L16-L33](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx#L16-L33) | 無 | 低 | 直接當你 AGENTS.md 的章節骨架（見第 11 節範本）。 |
| 巢狀＋衝突規則 | [HowToUseSection.tsx#L35-L40](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx#L35-L40)、[FAQSection.tsx#L18-L21](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L18-L21) | 無 | 低 | 抄進你根目錄 AGENTS.md 的「規則優先順序」段，讓 Claude 也照同一套順序判斷（Claude Code 有自己的讀取機制，寫明可避免它自行推斷）。 |
| 完整範例 AGENTS.md | [README.md#L10-L33](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/README.md#L10-L33) | 無 | 低 | 改成你的指令（例如 `firebase emulators:start`、`firebase deploy --only hosting`）。 |
| 「禁令＋理由＋替代」寫法範本 | [AGENTS.md#L8-L15](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/AGENTS.md#L8-L15) | 無 | 低 | 用在「不准直接 `firebase deploy` 到正式環境」「不准改 `firestore.rules` 除非…」這類規則。 |
| 符號連結遷移法 | [FAQSection.tsx#L32-L48](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L32-L48) | 檔案系統支援 symlink | 低 | `ln -s AGENTS.md CLAUDE.md`，讓 Claude 讀到同一份（Windows 需開發人員模式或改用匯入法）。 |
| 支援工具清單（含各家設定文件網址） | [CompatibilitySection.tsx#L14-L141](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/CompatibilitySection.tsx#L14-L141) | 無 | 低 | 當「哪些工具會自動讀」的參考表；各家 `url` 欄位多半直接指向設定說明頁（例如 opencode、Zed、Warp 的 rules 頁）。 |
| 簡易 Markdown 上色＋複製按鈕 | [CodeExample.tsx#L66-L144](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/CodeExample.tsx#L66-L144) | React | 低 | 若你在倉儲系統裡要做「規則檢視頁」，`parseMarkdown`（只處理標題、清單、行內程式碼）可改寫成純 JS 函式；`navigator.clipboard.writeText` 複製按鈕可直接借。 |
| GitHub 貢獻者數抓取＋快取 | [pages/index.tsx#L40-L160](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/pages/index.tsx#L40-L160) | `fetch`、選填 GitHub token | 中 | 與你的需求關聯低；但「記憶體快取＋時間窗」的寫法可用在價格查詢 API 降低呼叫次數。 |

---

## 7. AI／Claude 整合

- **用哪些模型**：無。這個 repo 不呼叫任何 AI 模型、沒有 prompt 檔、沒有 MCP、沒有 Skills。
- **prompt 放在哪**：唯一能算「prompt」的就是 AGENTS.md 本身（[AGENTS.md](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/AGENTS.md)）——它是給 Codex CLI 讀的（第 3 行直接寫「e.g. the Codex CLI」）。
- **Claude 有沒有被列入？** 我用 `grep -rni 'claude\|anthropic'` 搜過全部 `.tsx` 與 `.md`，**0 筆**。也就是說，在這個 commit，官網相容清單**沒有 Claude Code**。
- **能不能換成 Claude／怎麼讓 Claude 讀同一份？** 可以，兩種做法（以下來自 Claude Code 的一般使用方式，**不是本 repo 內容**，本次未連網驗證最新文件）：
  1. **匯入法（推薦）**：在根目錄 `CLAUDE.md` 只寫
     ```markdown
     @AGENTS.md

     ## Claude 專屬補充（只放 Claude 才有的東西，例如 Skills、subagent 名稱）
     ```
     這樣共用規則只有 AGENTS.md 一份，Claude 專屬的再另外補，不會兩邊各寫一套。
  2. **符號連結法**：比照官方 FAQ 的遷移招式 `ln -s AGENTS.md CLAUDE.md`。缺點是沒地方放 Claude 專屬內容，而且 Windows 上 symlink 常出問題。
- **GPT／Codex 那邊**：Codex 是官網列的第一個相容工具（[CompatibilitySection.tsx#L15-L20](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/CompatibilitySection.tsx#L15-L20)），原生讀 AGENTS.md，不用設定。Codex 是否另有全域 `~/.codex/AGENTS.md` 或 override 檔：**本 repo 未提及，未確認**。
- **ChatGPT 網頁版（非 Codex）**：不會自動讀檔，你得手動貼上或上傳 AGENTS.md。

---

## 8. 擴充方式與 API

- **格式本身沒有 API、沒有外掛機制、沒有 schema**，擴充方式只有「自己加 Markdown 段落」與「在子資料夾再放一份 AGENTS.md」。
- 官方明講沒有必填欄位（[FAQSection.tsx#L13-L16](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L13-L16)），所以你可以自行約定欄位，例如在檔案頂部加：
  ```markdown
  <!-- 狀態：現行｜最後確認：2026-11-04｜負責人：Claude（規則維護） -->
  ```
  這不是官方規格，是你自己的慣例，但能讓巡讀時判斷新舊（見第 11 節）。
- 若要把網站上的工具清單當資料用：在 `CompatibilitySection.tsx` 的 `agents` 陣列新增一筆 `{ name, url, from?, imageSrc? }`（型別見 [#L5-L12](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/CompatibilitySection.tsx#L5-L12)）。

---

## 9. 程式品質與風險

- **維護狀況**：最後一個 commit 是 2026-09-10「Rename agents-md_Charter.pdf to Technical_Charter.pdf」（shallow clone 只看得到這一筆，更早歷史未確認）。由 Linux Foundation 旗下 AAIF 託管，屬「標準組織型」專案，網站本身改動不頻繁是正常的。
- **測試／CI**：檔案清單中**沒有任何測試檔、沒有 `.github/` 資料夾**（62 個檔案逐一看過）。`package.json` 只有 `dev / build / start / lint` 四個 script。
- **章程與 repo 不一致**：章程多次提到要在 `CONTRIBUTING` 檔列出維護者名單與投票方式，但 repo 中**沒有 CONTRIBUTING 檔**。
- **遙測**：網站掛了 Vercel Analytics（[_app.tsx#L22](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/pages/_app.tsx#L22)），只影響瀏覽官網的人；你在自己專案使用 AGENTS.md 格式**完全沒有遙測**。
- **資安**：`GH_AUTH_TOKEN` 只從環境變數讀、有條件加入 header，寫法正確（[pages/index.tsx#L87-L94](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/pages/index.tsx#L87-L94)）。
- **格式本身的坑（對你最重要）**：
  1. **沒有版本號、沒有規格書**：各工具「怎麼讀」由各家自己決定，例如是否會讀上層目錄、會不會合併多份、最大長度多少，網站都沒寫——**未確認**。
  2. **「最近的優先」只講了覆蓋，沒講合併**：子資料夾 AGENTS.md 是「完全取代」還是「疊加」上層規則？官網沒說清楚。保險做法：子資料夾檔案開頭寫「本檔補充根目錄 AGENTS.md，衝突時以本檔為準」。
  3. **Claude Code 不在相容清單**：一定要靠 `CLAUDE.md` 匯入或 symlink，不然 Claude 不會自動讀到。
  4. **「活文件」沒人管就會過期**：官方鼓勵持續修改，但沒有任何過期偵測機制——這正是你說的「新舊版本衝突」問題來源。

---

## 10. 跟其他專案組合的建議

AGENTS.md 只解決「檔名與放置位置」這一層。你要的整套架構，可以這樣疊（都是本資料夾已有資料包的專案）：

| 你的需求 | 用 AGENTS.md 做 | 再疊加 |
|---|---|---|
| GPT 與 Claude 讀同一份規則 | 根目錄唯一一份 AGENTS.md＋CLAUDE.md 匯入 | `intellectronica/ruler`（一份 `.ruler/` 自動產生 CLAUDE.md、AGENTS.md 等）——工具多於 2 個時再用 |
| 角色與技能 | 在 AGENTS.md 寫「角色分工」段 | `anthropics/skills`（SKILL.md 原廠寫法）、`openai/skills`（Codex 技能格式）、`obra/superpowers`（完成前驗證紀律）、`msitarzewski/agency-agents`（角色檔範本） |
| 防新舊衝突 | 規則只放一處 | `Fission-AI/OpenSpec`（現行規格＋變更提案＋封存）、`github/spec-kit`（專案憲法＋跨文件一致性稽核） |
| 每日巡讀、防重複、防過期 | 在 AGENTS.md 寫巡讀規則 | `raccioly/docguard`（巡檢規則文件過期／重複／矛盾）、`Thomaszhou22/memory-checkup`（只讀健檢 Skill）、`mennanov/blockwatch`（「改這裡也要改那裡」的確定性檢查） |
| 任務追蹤與交接 | 在 AGENTS.md 指定交接紀錄檔位置 | `bmad-code-org/BMAD-METHOD`（單一工單樹）、`paperclipai/paperclip`（排程巡檢、工單） |

**最小可行組合（建議先做這個）**：`AGENTS.md`（本專案）＋`CLAUDE.md` 匯入＋一個 Claude Skill「每日巡讀」（寫法參考 `anthropics/skills`、`memory-checkup`）＋一份 `docs/ai/handoff.md` 交接紀錄。等穩定了再考慮 OpenSpec 或 docguard。

---

## 11. 規則／角色／巡檢 檢查表

### 共用規則怎麼寫 —— **有（這是本專案唯一的強項）**
- **檔案結構**：只有 `AGENTS.md` 一種檔名；沒有 `.ruler/`、`constitution`、`rules/` 資料夾概念。[HowToUseSection.tsx#L7-L13](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx#L7-L13)
- **分層**：專案根目錄＋子資料夾（巢狀）。**全域（使用者家目錄）層：本 repo 未提及**。[HowToUseSection.tsx#L35-L40](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx#L35-L40)
- **優先順序**：使用者對話指示 ＞ 最近的 AGENTS.md ＞ 上層 AGENTS.md。[FAQSection.tsx#L18-L21](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L18-L21)
- **讓 GPT（Codex）和 Claude 讀同一份**：Codex 原生支援；Claude 本 repo **沒有**說明，需自行用 `CLAUDE.md` 的 `@AGENTS.md` 匯入或 symlink（見第 7 節）。

### 角色設計 —— **沒有**
格式本身沒有角色概念。唯一出現「角色」的是**人類治理章程**（Contributor → Maintainer → Core Maintainer → Lead Core Maintainer，由 TSC 多數決升降；Lead 在無共識時拍板）——見 [Technical_Charter.pdf](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/Technical_Charter.pdf) 第 1–3 頁。這個「分層＋無共識時誰拍板」的結構倒是可以借來設計 AI 角色：例如「Codex＝實作者、Claude＝審查者、你＝Lead（衝突時最終決定）」。

### 防漏 —— **部分有**
- 完成前驗證：**有**（間接）。FAQ 說列出的測試指令 AI 會執行並修到通過。[FAQSection.tsx#L23-L26](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L23-L26)；範例「Fix any test or type errors until the whole suite is green」「Add or update tests for the code you change, even if nobody asked」見 [README.md#L21-L28](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/README.md#L21-L28)。
- 任務追蹤（backlog／issue／checklist）：**沒有**。
- 交接紀錄：**沒有**。

### 防重複 —— **沒有**
沒有任何重複內容／規則／角色偵測。唯一間接手段是「只用一個檔名」＋「symlink 讓舊檔名指向新檔」（[FAQSection.tsx#L32-L48](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L32-L48)），避免 `AGENT.md` 與 `AGENTS.md` 兩份並存。

### 防新舊版本衝突 —— **沒有**
- 版本標記：沒有（格式無版本號，檔案也沒有日期欄位慣例）。
- 單一事實來源：理念上有（「a dedicated, predictable place」，[WhySection.tsx#L26-L55](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/WhySection.tsx#L26-L55)），但沒有強制機制。
- 變更提案／封存、過期偵測：沒有。只說「Treat AGENTS.md as living documentation」（[FAQSection.tsx#L28-L30](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L28-L30)）。

### 定期巡檢 —— **沒有**
沒有 heartbeat、cron、hook、巡讀報告。以下是**我依你的需求設計的建議**（非本 repo 內容），可以放進你的 AGENTS.md 讓兩個 AI 都看得到：

```markdown
## 每日巡讀（Daily Patrol）
- 誰做：Claude（審查角色）每天第一次開工時執行；Codex 不執行巡讀，只處理巡讀報告中指派給它的項目。
- 讀什麼：AGENTS.md、所有子資料夾 AGENTS.md、CLAUDE.md、docs/**、docs/ai/handoff.md 最近 7 天紀錄、git log 最近 24 小時。
- 找什麼：
  1. 漏：handoff.md 中「未完成」超過 2 天的項目；程式碼中 TODO/FIXME 新增但沒登記的。
  2. 重複：兩份文件描述同一件事（同一指令、同一欄位定義、同一規則）。
  3. 新舊衝突：同一主題兩處寫法不同；文件頂部「最後確認」超過 30 天；文件提到但程式碼已不存在的檔案／函式。
- 只讀不改：巡讀只產生報告，不直接修改；修改需另開任務。
- 報告位置：docs/ai/patrol/YYYY-MM-DD.md
```

報告範例：

```markdown
# 巡讀報告 2026-11-04（Claude）
## 漏
- [ ] handoff.md 11/01「庫存調撥 API 加權限檢查」標記進行中已 3 天，負責：Codex
## 重複
- [ ] 「出貨單編號規則」同時寫在 AGENTS.md#程式碼風格 與 docs/shipping.md，內容一致 → 建議只留 docs/shipping.md，AGENTS.md 改成連結
## 新舊衝突
- [ ] AGENTS.md 寫部署指令 `firebase deploy`；functions/AGENTS.md 寫 `firebase deploy --only functions` → 以子資料夾為準（最近優先），但請確認根目錄是否過期
- [ ] docs/price-calc.md 最後確認 2026-08-02（超過 30 天）
## 需要老闆決定
- 無
```

### Skill 寫法 —— **沒有**
本 repo 沒有 SKILL.md、沒有 description 觸發寫法、沒有腳本資料夾。請參考同資料夾 `anthropics__skills.md`、`openai__skills.md` 資料包。

### 支援哪些工具與安裝方式 —— **有**
相容清單（[CompatibilitySection.tsx#L14-L141](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/CompatibilitySection.tsx#L14-L141)，共 23 筆）：Codex（OpenAI）、Amp、Jules（Google）、Cursor、Factory、RooCode、Aider、Gemini CLI（Google）、goose、Kilo Code、opencode、Phoenix、Zed、Semgrep、Warp、Copilot coding agent（GitHub）、VS Code、Ona、Devin（Cognition）、Windsurf（Cognition）、UiPath Autopilot & Coded Agents、Augment Code、Junie（JetBrains）。
- 安裝：不用安裝，放檔案就好。需要額外設定的只有官網寫明的兩個：Aider（`read: AGENTS.md`）、Gemini CLI（`context.fileName`），見第 5 節。
- **Claude Code：不在清單**，需 `CLAUDE.md` 匯入。

### 可以直接借用到你「基礎架構」的檔案或段落
1. [README.md#L10-L33](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/README.md#L10-L33) —— 完整範例，改成你的 Firebase 指令。
2. [AGENTS.md#L1-L43](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/AGENTS.md#L1-L43) —— 「禁令＋理由＋替代做法」與指令速查表格式。
3. [HowToUseSection.tsx#L16-L40](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/HowToUseSection.tsx#L16-L40) —— 段落清單與巢狀規則。
4. [FAQSection.tsx#L18-L48](https://github.com/agentsmd/agents.md/blob/d001185d792eb6402a58e4cbef1c228b309ec25d/components/FAQSection.tsx#L18-L48) —— 衝突優先順序、測試指令、symlink 遷移。

**依上述官方骨架，給你倉儲 App 的 AGENTS.md 起手式**（我寫的建議範本，請依實際指令修改）：

```markdown
<!-- 狀態：現行｜最後確認：2026-11-04｜規則維護：Claude｜最終決定：老闆 -->
# AGENTS.md（Codex 直接讀；Claude 經由 CLAUDE.md 的 @AGENTS.md 匯入）

## 0. 規則優先順序
老闆在對話中的指示 ＞ 離被改檔案最近的 AGENTS.md ＞ 本檔。發現兩處規則矛盾時，不要自己挑，寫進 docs/ai/handoff.md 的「待決定」。

## 1. 專案概觀
倉儲／庫存管理 Web App。純 JavaScript（無框架），部署在 Firebase Hosting，資料在 Firestore。

## 2. 指令
- 本機測試：`firebase emulators:start`
- 部署：只有老闆可以執行 `firebase deploy`；AI 不得部署到正式環境（理由：會直接影響出貨作業）。

## 3. 程式碼風格
- （填你的命名規則、檔案放置規則）

## 4. 完成前檢查
- 跑過本機模擬器並手動測試受影響頁面；列出你測了哪些頁面。
- 改到 Firestore 欄位時，同步更新 docs/data-model.md。

## 5. 資安
- 不得把 API Key、Firebase 服務帳號金鑰寫進程式碼或提交。
- 修改 firestore.rules 前必須先在 handoff.md 說明原因。

## 6. 角色分工
- Codex（GPT）：實作者。依任務改程式碼，完成後寫交接。
- Claude：審查者＋規則維護者＋每日巡讀。不與 Codex 同時改同一檔案。
- 老闆：Lead，衝突時最終決定。

## 7. 交接
每次結束工作，在 docs/ai/handoff.md 追加：日期｜誰｜做了什麼｜沒做完什麼｜改了哪些檔案｜需要誰接手。

## 8. 文件新舊規則
- 每份規則／說明文件頂部要有「狀態：現行／已封存」與「最後確認」日期。
- 同一件事只寫一處，其他地方用連結。過期文件移到 docs/archive/，不要刪除。

## 9. 每日巡讀
（貼上前面的 Daily Patrol 段落）
```

---

## 關鍵字
AGENTS.md、agents.md、給 AI 看的 README、README for agents、共用規則、shared rules、單一事實來源、single source of truth、巢狀規則、nested AGENTS.md、優先順序、precedence、CLAUDE.md 匯入、@AGENTS.md import、符號連結、symlink、Codex、OpenAI Codex、Claude Code、Cursor、Gemini CLI、Aider、GitHub Copilot coding agent、Jules、Amp、Factory、Agentic AI Foundation、AAIF、Linux Foundation、技術章程、Technical Charter、MIT、CC BY 4.0、活文件、living documentation、多 AI 協作、每日巡讀、daily patrol、交接紀錄、handoff、角色分工、Next.js
