# ejklock/living-docs-skill — 把專案「決策紀錄」當活系統管理的 Agent Skill＋Rust 檢查器（一事一處、只取代不改寫、索引不漂移）
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：8b67559
> GitHub：https://github.com/ejklock/living-docs-skill｜⭐ 14｜授權：MIT（另含 Apache-2.0 的第三方 OKF 規格檔，GitHub 因此顯示 NOASSERTION）｜主要語言：Rust｜最近更新：2026-10-27

> 本文所有 permalink 都固定在 commit `8b675599125d4d7e07fbd4f50956c1a003019d60`。
> 我只用 git 讀原始碼與文件，**沒有安裝、沒有編譯、沒有執行**任何東西；凡是「輸出長什麼樣」都是從程式碼裡的列印字串推回來的。
> 注意：GitHub 上的專案簡介還寫著「BDRs」，但作者已經在 [ADR 0057](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/adr/0057-refocus-living-docs-on-a-decision-log-delete-bdr-cut-peripheral-verbs-and-check-advisories-and-consolidate-the-rule-corpus.md) 把 BDR 這個文件類型刪掉了——這本身就是「簡介沒跟著改」的新舊版本衝突小例子。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：Living Docs 是一組給 AI 編碼代理（Claude Code、Codex、OpenCode、Pi，以及間接支援 Cursor／Copilot）讀的 **Skill（SKILL.md）**，加上一支 **Rust 寫的單一執行檔 `living-docs`**。Skill 教 AI「什麼事該寫成哪一種文件、文件怎麼退休」；CLI 負責所有「有唯一正確答案」的機械動作（編號、frontmatter、索引、取代連結）並且當**守門員**（`check`），在 commit 時把手寫錯誤、索引漂移、重號、過期決策擋下來。整個工具裡**沒有呼叫任何 LLM**。

它的核心是一句話（spine）：
> **每一個知識只有一個家、那個家一定被索引到、重要決策一定跟著它的紀錄一起出貨。**

**對你（倉儲 App＋多 AI 協作）最有用的地方：**

| 你的痛點 | Living Docs 的對應做法 | 能直接用嗎 |
|---|---|---|
| GPT 跟 Claude 各自寫文件，內容重複、互相打架 | 規則「One home per fact（一事一處）」：每個決策／需求只寫在一個檔案，其他地方只放連結 | 規則可直接抄；**但「內容語意重複」沒有自動偵測**（曾做過，已刪除，見第 9 節） |
| 不知道哪份是新版、哪份是舊版 | 「Supersede, never rewrite（只取代、不改寫）」：舊決策標 `Superseded`/`Deprecated`，檔案最上面自動寫一行「**SUPERSEDED — do not act on this record**」橫幅；`living-docs read` 只列出「現在有效」的紀錄，舊的只算數量不顯示 | **可以，這是本專案最強的部分** |
| AI 漏改索引、漏登記、檔案變孤兒 | 「Indexed or it doesn't exist」：每個檔案必須被 `index.md` 連到；`check` 會抓孤兒檔、斷連結、索引跟重新產生的不一致 | 可以（需要裝 CLI） |
| 兩個 AI 平行開同一號的文件（例如都建了 issue 0012） | `check` 的「重號」違規＋`living-docs set <path> number next` 一鍵改號並修所有連結 | 可以 |
| 決策寫了「提案中」，但工作早就做完，沒人回頭改狀態 | `LIVENESS stale-proposed` 提醒：ADR 還是 `Proposed`，但它連到的 issue 已經 `closed` | 可以，但只有 ADR→Issue 這一種 |
| 依賴的上游文件被取代了，下游沒跟著改 | `MOVED-SOURCE` 提醒：某紀錄連到的文件已被取代／棄用，提醒你去複查 | 可以 |
| AI 每次開工前不知道該讀哪些規則 | Claude Code 的 `SessionStart` hook 在每次開工時自動塞一行「寫作契約」；`read --contract` 只給 AI 看每份紀錄的「合約段落」，省 token | Claude Code 可直接用；Codex 只有 pre-commit 閘門 |

**它沒有的**：沒有「角色」（PM／工程師／審查員）設計、沒有多代理交接流程、沒有排程巡檢、沒有 AGENTS.md↔CLAUDE.md 同步、沒有 MCP。它是一個「**文件與決策的單一事實來源＋守門員**」元件，適合當你多 AI 架構裡的「**底層紀律層**」，要搭配別的專案（例如角色型的 BMAD、superpowers、規則同步型的 docguard／ruler）一起用。

---

## 2. 授權白話

- **授權檔實際內容**：[`LICENSE`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/LICENSE#L1-L27) 前 21 行是標準 **MIT**（© 2026 Evaldo Klock），後面多加了一段說明「`reference/` 與 `skills/okf-knowledge-format/reference/` 底下的第三方內容適用其原本授權」。GitHub 的自動判斷因為這段附加文字而顯示 `NOASSERTION`，**實際上就是 MIT**。
- **第三方內容**：[`ATTRIBUTION.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/ATTRIBUTION.md) 與 [`NOTICE`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/NOTICE) 說明：OKF（Open Knowledge Format）規格 `skills/okf-knowledge-format/reference/SPEC.md` 是從 GoogleCloudPlatform/knowledge-catalog **原文照搬**，屬 **Apache-2.0**；部分 Rust 邏輯（路徑解析、frontmatter、索引排序）是從該 Python 實作移植過來，也在 NOTICE 裡註明。
- **個人使用**：完全自由，可改、可拆、可放進自己的工具，不用付費、不用帳號。
- **公司商用**：可以，包括拆進閉源工具。要做的只有：保留 MIT 著作權聲明；如果你連 OKF 規格檔或移植的那幾段一起帶走，另外保留 Apache-2.0 的 NOTICE。沒有擔保。
- **付費版／閉源功能**：沒有。全部功能都在這個 repo。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | Rust（工具鏈固定 1.96.0，見 `rust-toolchain.toml`），Cargo workspace 三個 crate：`living-docs-core`（領域邏輯，無 I/O）、`fs-store`（讀寫 .md 檔）、`cli`（指令列前端） |
| 主要套件 | 核心：`serde_yaml`（frontmatter）、`pulldown-cmark`（解析連結）、`regex`、`merman-core`（純 Rust 驗證 Mermaid 圖，不需 Docker）、`unicode-normalization`；CLI：`clap`、`rust-embed`（把 skills 文件**編進執行檔**） |
| 前端／後端／資料庫 | 都沒有。曾經有 SQLite/ParadeDB 讀模型、Web 介面（Axum）、公開匯出，已在 [ADR 0059](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/adr/0059-cut-living-docs-to-the-authoring-core-remove-the-database-read-model-web-front-public-export-migrate-json-authoring-and-the-write-gate-hook.md) 全部砍掉。唯一的「資料庫」就是 git 裡的 `docs/**/*.md` |
| 部署 | 不需部署。在你自己電腦上放一支 `living-docs` 執行檔即可 |
| 安裝方式 | ① `./install.sh`（從 GitHub Release 下載預先編好的執行檔並驗 sha256，失敗才退回 `cargo build`）② `npm install -g living-docs` / `npx living-docs`（npm 包裝，postinstall 一樣是下載同一支執行檔，見 [`npm/scripts/postinstall.js`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/npm/scripts/postinstall.js)）③ 自己 `cargo build --release` |
| 硬體／GPU | 不需要 GPU；README 稱 5,000 筆紀錄 `check` 約 1 秒、`read` 約 0.2 秒（未實測） |
| API Key／費用 | **不需要任何 API Key，零費用**。工具本身不連網、不呼叫 AI（我查過三個 crate 的相依套件，沒有任何 HTTP 用戶端；NOTICE 也明說刻意拿掉上游呼叫 Gemini 的那段）。你付的只是 Claude／Codex 本來的訂閱費 |
| 你的 Firebase 純 JS 專案能用嗎 | 能。它跟你的程式語言無關，只管 `docs/` 資料夾裡的 Markdown |

---

## 4. 程式架構地圖

檔案統計方式：`git ls-tree -r --name-only HEAD` 共 **526 個檔案**；`find -name '*.rs'` 共 **199 個 Rust 檔、33,892 行**（`wc -l` 含測試）；`grep -rn '#\[test\]'` 共 **1,235 個**單元測試標記；`cli/tests/` 下有 **71 個**整合測試檔。

```
living-docs-skill/
├── skills/                         ← 給 AI 讀的 Skill（會被編進執行檔）
│   ├── living-docs/
│   │   ├── SKILL.md                ← 觸發用的「薄殼」：只有 description＋任務→主題路由表
│   │   ├── rules/                  ← 12 個規則主題（spine、procedure、check、doc-trail、adr/prd/issue/constitution 慣例、架構圖、semantic-index、size-targets、okf-format）
│   │   ├── templates/              ← 8 個範本（adr、issue、prd、constitution、research、architecture-view、context-index、claude-hard-rules）
│   │   ├── hooks/                  ← session-context.sh（Claude Code 開工提示）、pre-commit（文件閘門）
│   │   └── tests/                  ← 11 組「惡意／邊界」測試資料夾，守住解析器
│   ├── okf-knowledge-format/       ← OKF 格式規範（SPEC.md 為 Google 原文，Apache-2.0）
│   └── research-artifacts/         ← 研究筆記的格式與「來源紀律」
├── living-docs-core/src/           ← 領域核心（無 I/O）
│   ├── doc_type.rs + doc_type/sections.rs  ← ★ 文件類型「登錄表」：每型的目錄、狀態詞彙、必填段落、是否需 owner
│   ├── check/                      ← ★ 守門員：每個檔案一種檢查（liveness、duplicate_numbers、index_drift、moved_source、placeholder、supersede_links、callout…）
│   ├── commands/effective*         ← ★ `read` 指令：只輸出「現行有效」紀錄、收合取代鏈
│   ├── commands/supersede/         ← 取代：雙向連結＋舊檔橫幅＋重建索引
│   ├── commands/{new,set,index,fmt}← 新增、設定欄位、重建索引、修 frontmatter
│   └── callout.rs                  ← 「SUPERSEDED / DEPRECATED」橫幅的唯一字串來源
├── fs-store/src/lib.rs             ← 檔案系統存取，拒絕寫出 bundle 以外的路徑
├── cli/src/                        ← clap 指令列；skill.rs（內嵌 skills）、skill_install.rs（各 AI 工具的安裝路徑）、hooks.rs（裝 hook）
├── docs/                           ← 作者用自己的工具管理自己（dogfooding）：74 ADR、105 issue、1 PRD、4 research、constitution
├── examples/linkly/docs/           ← 一個虛構短網址服務的完整範例（constitution→PRD→ADR→issue→架構圖）
├── CLAUDE.md                       ← 本 repo 給 AI 的硬規則（無 AGENTS.md）
├── .claude/settings.json           ← SessionStart hook 設定
├── .githooks/pre-commit            ← 本 repo 自己的文件閘門（比分發版多「只檢查本次改動」模式）
├── .github/workflows/ci.yml        ← CI：版本一致、檔案大小上限、fmt/clippy/test、living-docs check
└── scripts/                        ← 檔案大小 ratchet、版本一致性、發版資產檢查
```

自我管理的紀錄數（我用 `grep -h '^status:'` 逐檔統計）：
- ADR 74 份：Accepted 35、Deprecated 33、Superseded 6
- Issue 105 份：closed 79、done 10、open 16
- PRD 1 份（Deprecated）、Research 4 份（Accepted 2、Draft 2）

> 這個數字本身就說明一件事：作者在 2026-09-11 同一天寫了 0049–0056 一串 ADR，隔天用 ADR 0057 一次「棄用」九份。工具有能力把「舊決策」標記清楚，但**規則本身變動很快**，README 開頭也直說「這是實驗，會不斷改，請釘版本」。

---

## 5. 核心功能怎麼實作

**(1) 文件類型登錄表（單一事實來源的程式碼版）**
- 位置：[`living-docs-core/src/doc_type.rs#L39-L75`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/doc_type.rs#L39-L75)（`DocTypeSpec` 結構）、[`#L121-L217`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/doc_type.rs#L121-L217)（ADR、PRD、Issue、Research、View 各一列）、[`doc_type/sections.rs#L15-L65`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/doc_type/sections.rs#L15-L65)
- 重點：每種文件一列，寫死目錄、狀態詞彙（ADR：`Proposed/Accepted/Deprecated`；Issue：`open/in-progress/closed`）、終止狀態、是否需要 owner、必填段落（ADR 必須有 Context／Decision／Consequences；Issue 必須有 Scope／Acceptance）。`Superseded` 刻意不在任何詞彙裡，**只能透過 `supersede` 指令產生**，避免 AI 手動改狀態卻忘了接連結。這是 [ADR 0026](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/adr/0026-a-single-doctype-registry-replaces-nine-hand-synced-enumerations-and-research-and-constitution-enter-as-rows.md) 的決定：原本九個地方各自手寫一份清單、互相不同步，所以收斂成一張表。

**(2) `check`：守門員總管**
- 位置：[`living-docs-core/src/check/mod.rs#L67-L104`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/mod.rs#L67-L104)
- 重點：依序跑 20 個檢查：換行符一致、根索引存在、frontmatter 與 `type`、目錄索引成員、從根索引可達、**索引漂移**、連結有效、取代鏈完整、**單向取代連結**、**重號**、**退休橫幅**、**MOVED-SOURCE**、owner、標題與 frontmatter 一致、frontmatter 標準格式、Mermaid、篇幅、必填段落、**未填的 `{{PLACEHOLDER}}`**、**LIVENESS**。分成「違規」（exit 1，擋 commit）與「建議」（不影響 exit code，當待辦）。建議種類寫在 [`check/kinds.rs#L11-L39`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/kinds.rs#L11-L39)：`size`、`owner`、`heading`、`liveness`、`moved-source`。

**(3) 防新舊版本衝突：取代＋橫幅＋只讀現行**
- `supersede`：[`commands/supersede/mod.rs#L24-L58`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/commands/supersede/mod.rs#L24-L58)——解析新舊兩筆、拒絕自己取代自己、雙向寫 `supersedes`/`superseded_by`、在舊檔寫橫幅、重建兩邊的索引。
- 橫幅文字：[`callout.rs#L13-L40`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/callout.rs#L13-L40)，固定為 `> **SUPERSEDED — do not act on this record.** Replaced by [NNNN](...). Run \`living-docs read\` for what is in force.`；`check/callout.rs` 檢查「退休的一定有橫幅、現行的一定沒有」。
- `read`：[`commands/effective.rs#L1-L95`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/commands/effective.rs#L1-L95)、[`#L155-L160`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/commands/effective.rs#L155-L160)（`is_in_force`：只要不是 superseded／deprecated 就算現行）、輸出格式 [`effective/render.rs#L8-L35`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/commands/effective/render.rs#L8-L35)：開頭一行「已隱藏 N 筆退休紀錄：只是歷史，不要照做」，接著每筆一行 `- [ADR 0057] 標題 — 描述 (取代鏈)`。`--topic` 用關鍵字過濾、`--contract` 只印合約層段落、`--links-to`／`--impact` 列出誰依賴這筆紀錄（改之前先看影響範圍）。

**(4) 過期偵測（staleness／drift）**
- `LIVENESS stale-proposed`：[`check/liveness.rs#L14-L99`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/liveness.rs#L14-L99)——ADR 還在初始狀態 `Proposed`，但它連到的 Issue 已經 closed/done/Superseded → 提醒「決策該定案或取代」。
- `MOVED-SOURCE`：[`check/moved_source.rs#L1-L80`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/moved_source.rs#L1-L80)——某紀錄連到的文件狀態「移動」了（被取代或棄用），提醒去複查；只要在本文裡改連到新版，提醒就自動消失（「承認的方式就是更新連結」，不需要另外的註記語法）。
- 索引漂移：[`check/index_drift.rs#L13-L36`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/index_drift.rs#L13-L36)——把 `index.md` 跟「如果現在重建會長怎樣」比對，不一致就失敗並告訴你跑 `living-docs index <type>`。

**(5) 防重複（編號層級）**
- [`check/duplicate_numbers.rs#L12-L35`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/duplicate_numbers.rs#L12-L35)：同一類型兩個檔案用同一個 NNNN（兩個分支／兩個 AI 各自開新檔）→ 違規，訊息直接告訴你「保留一個，其他的跑 `living-docs set <path> number next`」。工具**不替你決定誰要改號**。
- 合併衝突：`install hooks` 會在 `.gitattributes` 加 `docs/**/index.md merge=union`，兩邊各加一列時 git 直接合併，之後再由索引漂移檢查抓出重複列（[ADR 0070](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/adr/0070-type-indexes-merge-with-the-git-union-driver-and-check-fails-on-an-index-that-differs-from-its-regeneration.md)）。

**(6) 防漏：範本空格＋必填段落**
- [`check/placeholder.rs#L14-L31`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/placeholder.rs#L14-L31)：`new` 產生的範本每段是 `{{SLOT: 提示}}`，AI 沒填完就 commit → 違規。這招很適合你：**範本裡的提示會隨填寫消失**，不會殘留在文件裡。
- 必填段落由登錄表定義（見 (1)），`check/sections.rs` 執行。

**(7) Skill 內容從執行檔提供**
- [`cli/src/skill.rs#L6-L11`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/cli/src/skill.rs#L6-L11)：用 `rust-embed` 把整個 `skills/` 編進執行檔；`living-docs guide <topic>` 取出某主題規則。安裝到 AI 工具時只放「薄殼」SKILL.md（[`cli/src/skill_install.rs#L26-L44`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/cli/src/skill_install.rs#L26-L44)），細節要 AI 自己呼叫 `guide`。好處：規則只有一份、跟執行檔版本綁死，不會有「A 電腦的 skill 是舊版」的問題。

**(8) Hook 安裝**
- [`cli/src/hooks.rs#L11-L51`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/cli/src/hooks.rs#L11-L51)：把 `session-context.sh` 寫到 `.living-docs/hooks/`、把 `SessionStart` 寫進 `.claude/settings.json`、把 pre-commit 寫到 `.githooks/` 並設定 `core.hooksPath`。作者刻意**不做「寫入前攔截」的 hook**，理由是「攔截只會教 AI 跟攔截談判，而不是用 CLI」（README「Arm enforcement」段落）。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 五條「不漂移」規則（spine） | [`skills/living-docs/rules/spine.md#L1-L22`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/spine.md#L1-L22) | 無 | 低 | 翻成中文直接貼進你的 `AGENTS.md` 最上面，Claude 與 Codex 共用 |
| CLAUDE.md 硬規則範本 | [`skills/living-docs/templates/claude-hard-rules.md#L1-L111`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/templates/claude-hard-rules.md#L1-L111) | 規則 10 依賴 CLI | 低 | 保留規則 1、3、4、5、9；規則 7「全部用英文」改成你的語言政策；規則 10 若不裝 CLI 就刪掉 |
| 文件類型「一題一型」表＋洩漏表 | [`skills/living-docs/rules/doc-trail.md#L18-L43`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/doc-trail.md#L18-L43) | 無 | 低 | 讓所有 AI 對「這該寫成決策還是任務」有同一個答案，大幅減少重複文件 |
| 每次任務的維護迴圈＋既有專案導入流程 | [`skills/living-docs/rules/procedure.md#L50-L66`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/procedure.md#L50-L66) | 部分步驟依賴 CLI | 低 | 「先列候選決策、逐一請使用者確認、才寫 ADR」這段非常適合你的倉儲 App 補文件 |
| 完成前檢查清單 | [`skills/living-docs/rules/check.md#L41-L60`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/check.md#L41-L60) | 無 | 低 | 改成你的「交件前 checklist」放進每個 AI 的規則 |
| ADR／Issue／Constitution 範本 | [`templates/adr.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/templates/adr.md)、[`templates/issue.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/templates/issue.md)、[`templates/constitution.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/templates/constitution.md) | 無 | 低 | `{{SLOT: 提示}}` 寫法可沿用；你的「定價規則」「庫存計算方式」就適合寫成 ADR |
| Issue「先寫在 repo、再貼到追蹤器」流程 | [`rules/issue-workflow.md#L5-L32`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/issue-workflow.md#L5-L32) | 選用 `gh` | 低 | 讓 GPT 與 Claude 的任務都落在同一個 `docs/issues/`，不再各記各的 |
| SessionStart 開工提示 hook | [`skills/living-docs/hooks/session-context.sh#L1-L39`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/hooks/session-context.sh#L1-L39)＋[`.claude/settings.json`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/.claude/settings.json) | bash、Claude Code | 低 | 把最後那行 `printf` 換成你自己的「每次開工必讀三件事」 |
| pre-commit 文件閘門（含「只檢查本次改動」） | [`.githooks/pre-commit#L1-L41`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/.githooks/pre-commit#L1-L41) | bash、git、living-docs | 低 | 換成跑你自己的檢查腳本；`LIVING_DOCS_CHECK_CHANGED_ONLY=1` 的作法適合舊專案慢慢還債 |
| 整支 `living-docs` CLI | Release 執行檔／`npm i -g living-docs` | 無（單一執行檔） | 低（直接用）／高（改 Rust） | 直接當你專案 `docs/` 的守門員；不必懂 Rust |
| 取代＋橫幅＋只讀現行（邏輯） | [`commands/supersede/mod.rs#L24-L58`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/commands/supersede/mod.rs#L24-L58)、[`callout.rs`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/callout.rs#L13-L40)、[`effective.rs#L155-L160`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/commands/effective.rs#L155-L160) | Rust | 中 | 想用 JS 重寫成你自己的小工具時，照這三段的規則抄邏輯即可（frontmatter 讀 `status`、退休就在頂部插橫幅、列表時略過） |
| 過期偵測兩種規則 | [`check/liveness.rs`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/liveness.rs#L14-L99)、[`check/moved_source.rs`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/moved_source.rs#L1-L80) | Rust | 中 | 規則很簡單，可用 Node.js 50～100 行重寫並放進每日巡檢 |
| 文件類型登錄表設計 | [`doc_type.rs#L39-L217`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/doc_type.rs#L39-L217) | Rust | 中 | 設計思路可借：用一張 JSON 表定義「每種文件放哪、有哪些狀態、哪些段落必填」，所有腳本都讀這張表 |

---

## 7. AI／Claude 整合

- **用哪些模型**：無。工具本身不呼叫任何模型（[`NOTICE`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/NOTICE) 說明刻意刪掉上游呼叫 `gemini-flash-latest` 的那段；我檢查 Cargo 相依也沒有 HTTP 套件）。判斷性的內容（為什麼、選了什麼、拒絕了什麼）由 Claude／Codex 寫，機械性的由 CLI 做——這條「確定性分界線」寫在 [`CLAUDE.md#L43-L47`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/CLAUDE.md#L43-L47)。
- **Prompt 放在哪**：三個 Skill 的 `SKILL.md`（只是路由表）＋ `skills/*/rules/*.md`（真正的規則）＋ `templates/`。安裝後 AI 透過 `living-docs guide <topic>` 讀。
- **Skills**：有三個——`living-docs`、`okf-knowledge-format`、`research-artifacts`。格式是標準 Agent Skills（frontmatter `name`／`description`／`version`／`metadata`）。
- **Hooks**：Claude Code 的 `SessionStart`（開工時注入一行規則）；所有工具共用的 git `pre-commit`。
- **MCP**：沒有。曾有 [issue 0027](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/issues/0027-mcp-front-expose-the-ten-authoring-verbs-as-mcp-tools-over-the-md-tree.md) 提案做 MCP 伺服器，狀態 `closed`；我在 Rust 原始碼裡 grep 不到任何 MCP 實作。
- **能不能換成 Claude**：本來就是以 Claude Code 為第一優先設計（有 `.claude/settings.json` hook）；Codex 也原生支援（`~/.codex/skills`）。**同一份規則給兩個 AI 讀**的方式是：兩邊都裝同一版 `living-docs` 執行檔，skill 內容來自同一個執行檔。
- **搭配建議的其他 skill**：作者建議搭 Matt Pocock 的 `grill-me`（重大決策前先拷問）、`to-prd`／`to-issues`，以及 `deep-research`（研究蒐集）——只引用、不打包。

---

## 8. 擴充方式與 API

- **CLI 是唯一介面**，10 個動詞：`new`、`set`、`supersede`、`index`、`check`、`fmt`、`read`、`guide`、`install`、`uninstall`（另有 `completions`）。[ADR 0060](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/adr/0060-the-cli-surface-is-a-contract-ten-intention-named-verbs-one-output-mode-per-stream-documented-exit-codes-and-help-written-for-an-agent.md) 把它定為「合約」：終端機輸出人看的文字，**管線（pipe）輸出就自動變成一行 JSON**，退出碼固定 `0` 成功、`1` 檢查失敗、`2` 用法錯誤。這對你很重要：**你寫的巡檢腳本可以直接 `living-docs check docs --json` 拿到結構化結果**。
- `check` 的 JSON 結構（從 [`check/report.rs`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/report.rs) 推得）：`{"bundle":"docs","docs":42,"violations":[{"file":"…","message":"…"}],"advisories":[{"file":"…","kind":"liveness","message":"…"}],"ok":false}`。
- 新增文件類型：要改 Rust 的登錄表 `doc_type.rs` 再重編；不支援用設定檔自訂類型。
- 文字輸入：本文用 `--body PATH|-`、欄位用 `set <ref> <key> --from PATH|-`，**散文一律從檔案或 stdin 進來，不從指令參數**（[`procedure.md#L18-L23`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/procedure.md#L18-L23)），避免 shell 跳脫字元把內容弄壞。
- 程式內部是六角架構：`DocStore` 介面 + `fs-store` 實作，理論上能換儲存後端（以前有資料庫版，已刪）。

---

## 9. 程式品質與風險

**品質優點**
- 測試量大：1,235 個 `#[test]`、71 個整合測試檔、11 組惡意解析器測試資料。CI（[`.github/workflows/ci.yml#L39-L55`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/.github/workflows/ci.yml#L39-L55)）跑版本一致性、300 行檔案上限、`cargo fmt`、`clippy -D warnings`、測試、`living-docs check`。
- 程式紀律嚴格：每個函式 ≤30 行、每個檔案 ≤300 行（[`CLAUDE.md#L49-L65`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/CLAUDE.md#L49-L65)）。
- 作者自己吃自己的狗糧：每個決策都有 ADR，每個 bug 都有 issue，可追溯性極好。
- 沒有遙測、不連網（`install.sh`／npm 安裝時會從 GitHub Release 下載執行檔，這是唯一的網路行為）。

**風險與已知的坑**
1. **非常不穩定**：README 第 5 行明說「這是實驗，會不斷改，動詞和格式可能沒有過渡期就改掉」。光是 2026-09～10 就砍掉了 BDR、資料庫、Web、匯出、搜尋、寫入攔截 hook。**一定要釘版本**（`LIVING_DOCS_VERSION=v0.25.2 ./install.sh`）。
2. **單人專案**：⭐14，作者只有一位（Evaldo Klock），長期維護沒有保證。
3. **規則文字本身也有新舊衝突（open issue）**：例如 [issue 0077](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/issues/0077-the-procedure-and-hard-rules-guides-say-fmt-unwraps-hard-wrapped-prose-but-fmt-is-frontmatter-only.md)：`procedure.md` 與 `claude-hard-rules.md` 還寫「`fmt` 會把硬換行的段落接起來」，但 `fmt` 早已改成只動 frontmatter。我看到的 [`procedure.md#L29-L31`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/procedure.md#L29-L31) 確實還是舊說法。另外 [issue 0079](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/issues/0079-read-lists-closed-and-done-issues-although-the-guides-say-it-shows-active-records-only.md)：`read` 會列出 closed 的 issue，跟說明不符（`is_in_force` 只排除 superseded／deprecated，與程式碼一致）。目前 open issue 共 16 個。
4. **「內容語意重複」不檢查**：`check` 只能抓「重號」「索引重複列」，不會發現「兩份不同編號的文件在講同一件事」。[ADR 0055](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/adr/0055-semantic-refusal-triggers-become-instruments-or-advisory-diagram-and-duplicate-checks-and-no-prose-only-hard-stops.md) 曾設計 Jaccard 相似度的 `DUPLICATE` 檢查與 `DIAGRAM` 檢查，隔天被 [ADR 0057](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/adr/0057-refocus-living-docs-on-a-decision-log-delete-bdr-cut-peripheral-verbs-and-check-advisories-and-consolidate-the-rule-corpus.md) 移除。[`rules/check.md#L11-L13`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/check.md#L11-L13) 也明講「一事一處」的語意沒有可靠的判斷器，交給審查者。**你的每日巡讀要自己補這塊（可以讓 Claude 來判斷）**。
5. **只管 `docs/`，不管 AGENTS.md／CLAUDE.md 本身**：它不會檢查你兩份規則檔有沒有互相矛盾。
6. **中文標題會變成空檔名（實際的坑）**：規則要求內部文件全部用英文（硬規則 7）。更重要的是程式面：檔名 slug 由 [`living-docs-core/src/paths.rs#L65-L85`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/paths.rs#L65-L85) 的 `slugify` 產生，**只保留 ASCII 英數字**，其他字元都當分隔符；[issue 0057](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/issues/0057-new-seeds-owner-from-git-config-when-owner-is-absent-and-slugs-transliterate-accented-letters.md) 只補了歐洲重音字母轉寫。依程式碼推論，`living-docs new adr "定價公式"` 會產生 `0001-.md` 這種沒有名字的檔案（未實測）。**對策**：標題用「英文＋中文」，例如 `"pricing-formula 定價公式"`，檔名取英文、內文寫中文。
7. **Windows**：`cli/src/hooks.rs` 用了 `std::os::unix::fs::PermissionsExt`，hook 安裝是 Unix 寫法；Windows 是否能編譯／使用**未確認**。
8. **對非工程師有門檻**：需要會用終端機、git commit。

---

## 10. 跟其他專案組合的建議

1. **Living Docs（紀錄層）＋ 規則同步工具（規則層）**：用 ruler／docguard 這類工具讓 `AGENTS.md` 成為唯一規則來源、產生 `CLAUDE.md`；用 Living Docs 管「決策與任務」。兩者分工清楚：一個管「AI 該怎麼做事」，一個管「專案做過什麼決定」。
2. **＋ 角色型框架（BMAD-METHOD、superpowers、agency-agents、wshobson/agents）**：這些提供 PM／架構師／開發／審查角色；把 Living Docs 的「doc trail」當作角色之間的交接物：PM 產 PRD、架構師產 ADR、開發吃 issue、審查跑 `living-docs check`＋讀 `read --contract`。
3. **＋ OpenSpec／spec-kit**：它們偏「變更提案→封存」流程，Living Docs 偏「決策紀錄不可改寫」。如果只選一套，你的情況（多 AI、怕新舊衝突）兩者都可；Living Docs 的優勢是**有真正的程式守門員**，缺點是不穩定。
4. **＋ Matt Pocock skills（`grill-me`）**：作者官方推薦的搭配，重大決策前先讓 AI 反問你。
5. **建議的最小可行組合（給你的倉儲 App）**：
   - `AGENTS.md`（唯一規則）→ 頂部放 Living Docs 五條 spine（中文化）＋文件類型一題一型表
   - `CLAUDE.md` 只寫一行 `@AGENTS.md` 或由同步工具產生
   - `docs/constitution.md`（倉儲 App 永不改變的原則，例如「庫存只能由進出貨單改變」）
   - `docs/adr/`（定價公式、Firebase 資料結構、權限設計這類「改了很貴」的決定）
   - `docs/issues/`（每件工作，GPT 與 Claude 都在這裡開單、驗收、結案）
   - 每日巡檢：`living-docs check docs --json` ＋ 讓 Claude 讀 `living-docs read --contract` 找語意重複（工具不做的那塊）

---

## 11. 規則／角色／巡檢 檢查表

### 共用規則怎麼寫
- **檔案結構：有（部分）**。
  - 本 repo 用 `CLAUDE.md` 當專案硬規則（[`CLAUDE.md#L1-L107`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/CLAUDE.md#L1-L107)），**沒有 AGENTS.md**（檔案清單裡沒有）。
  - 給使用者專案的規則範本：[`templates/claude-hard-rules.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/templates/claude-hard-rules.md#L1-L111)，10 條硬規則，可貼進 CLAUDE.md／AGENTS.md。
  - 有 **constitution**（專案憲法）概念：[`templates/constitution.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/templates/constitution.md#L1-L51)，必填 Product／Scope Boundaries／Non-negotiables，批准後只能在 Amendment Log 追加。
  - 沒有 `.ruler` 或 `rules/` 資料夾階層給使用者專案。
- **分層（全域／專案／子資料夾）：有（只限 skill 安裝位置）**。`install skills` 預設裝到全域（`~/.claude/skills`、`~/.codex/skills`…），加 `--project` 裝到專案內（[`skill_install.rs#L88-L117`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/cli/src/skill_install.rs#L88-L117)）。規則內容本身沒有子資料夾分層設計。
- **優先順序：有（一句話）**。CLAUDE.md 開頭：「這些是硬規則，覆蓋預設行為；規則與方便衝突時規則贏」（[`CLAUDE.md#L3-L5`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/CLAUDE.md#L3-L5)）。文件之間的優先順序由 doc trail 決定：constitution → PRD → ADR → issue → code（[`doc-trail.md#L5-L14`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/doc-trail.md#L5-L14)），而「現行 vs 歷史」由 `status` 決定。
- **讓 GPT（Codex）和 Claude 讀同一份規則：有**。兩者都原生讀 `SKILL.md`，用同一支執行檔的 `install skills --harness claude` / `--harness codex` 安裝（[`skill_install.rs#L14-L24`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/cli/src/skill_install.rs#L14-L24)），詳細規則都由 `living-docs guide` 從同一個執行檔吐出，**不會有兩份副本**。Pi 則在 `AGENTS.md` 加一段指標；Cursor／Copilot 把 `living-docs guide --plain` 輸出貼進 `.cursor/rules/*.mdc` 或 `.github/instructions/*.instructions.md`（[README#L199-L231](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/README.md#L199-L231)）——後者是手動複製，會有過期風險。

### 角色設計
- **沒有**。全 repo 沒有 PM／架構師／審查員之類的角色定義、沒有 subagent 檔、沒有交接（handoff）流程、沒有「誰向誰負責」。唯一接近「角色」的是**人與 AI 的分工**：AI 只能「提出」決策，**使用者擁有決策**，ADR 必須先經使用者確認（[`procedure.md#L50-L58`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/procedure.md#L50-L58)、[`#L63`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/procedure.md#L63)），以及**CLI 與 AI 的分工**（機械的歸 CLI、判斷的歸 AI）。frontmatter 的 `owner` 欄位（ADR 必填）可以當「誰負責這個決策」用（[`doc_type.rs#L60-L64`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/doc_type.rs#L60-L64)）。

### 防漏
- **任務追蹤：有**。`docs/issues/NNNN-slug.md`，狀態 `open／in-progress／closed`，必填 Scope 與 Acceptance；**先寫在 repo、再貼到 GitHub Issues**，兩邊本文必須一字不差，衝突時 repo 為準（[`issue-workflow.md#L5-L11`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/issue-workflow.md#L5-L11)）。結案要寫 Outcome（[`#L28-L30`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/issue-workflow.md#L28-L30)）。
- **完成前驗證：有**。程式層：`check` 擋未填的 `{{SLOT}}`、缺必填段落、孤兒檔、斷連結（見第 5 節）。規則層：14 項完成前 checklist（[`rules/check.md#L41-L60`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/check.md#L41-L60)）。ADR 範本有 Verification 段落，要寫「可檢查的條件」與「違反時會失敗的測試」（[`templates/adr.md#L32-L38`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/templates/adr.md#L32-L38)）。
- **交接紀錄：部分有**。沒有專門的 handoff 檔，但 issue 的 Plan／Outcome 段落、ADR 的 Follow-ups（「後續是要開的 issue，不是延後的決定」）具有交接功能。規則還明講「不要說『之後再補文件』」（spine 第 5 條）。

### 防重複
- **重號：有**（程式碼）。[`check/duplicate_numbers.rs#L12-L35`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/duplicate_numbers.rs#L12-L35)＋`set <path> number next`。
- **索引重複列：有**（程式碼）。[`check/index_drift.rs`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/index_drift.rs#L13-L36)。
- **內容語意重複：沒有**（規則有、程式無）。規則：「一事一處，用連結不要複製」（[`spine.md#L9-L10`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/spine.md#L9-L10)）、「拆大文件時每個概念只落地一次，最後做完整性比對」（[`semantic-index.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/semantic-index.md)）、「洩漏表」告訴 AI 什麼內容不該寫在哪（[`doc-trail.md#L32-L43`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/doc-trail.md#L32-L43)）。程式偵測曾有、已刪（ADR 0055→0057）。
- **重複規則／重複角色：沒有**。

### 防新舊版本衝突
- **版本標記：有**。frontmatter `status`＋`supersedes`／`superseded_by`＋`timestamp`；各型的狀態詞彙寫死在登錄表。Skill 自己也有 `version: "0.25.2"`，CI 檢查 `VERSION` 檔與每個 SKILL.md 一致（`scripts/check-version.sh`）。
- **單一事實來源：有**。repo 裡的 `docs/` 是唯一來源，追蹤器／wiki 只是鏡像（spine 第 1 條）；程式碼面的文件類型定義也收斂到一張登錄表。
- **變更提案／封存：有**。只取代不改寫：舊紀錄設 `Superseded` 或 `Deprecated`，**檔案保留**、本文開頭自動插入「不要照做」橫幅；新紀錄設 `supersedes`。一對多取代目前做不到（`supersedes` 是單一值），作者用 `Deprecated` 代替（ADR 0057 Follow-ups）。
- **過期偵測：有（範圍有限）**。`LIVENESS stale-proposed`、`MOVED-SOURCE`、索引漂移、單向取代連結檢查（`check/supersede_links.rs`）。**沒有**「多少天沒更新就提醒」的時間型過期偵測；也**沒有**比對「程式碼改了但文件沒改」的 drift 偵測（spine 第 5 條只靠規則與審查）。

### 定期巡檢
- **排程／每日巡讀：沒有**。沒有 cron、heartbeat、GitHub Actions 排程（CI 只在 push／PR 時跑）。檢查時機只有兩個：**commit 時**（pre-commit hook）與 **CI**。另有 Claude Code `SessionStart` hook，在每次開工時提醒規則（[`session-context.sh#L37`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/hooks/session-context.sh#L37)）。
- **報告格式：有（`check` 的文字輸出）**。從 [`cli/src/commands/check/render.rs#L12-L119`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/cli/src/commands/check/render.rs#L12-L119) 推得的樣子（路徑與數字是我舉例）：

```
Living Docs lint — bundle: docs

  issues/0012-add-barcode.md                  records share the number 0012: issues/0012-add-barcode.md, issues/0012-fix-stock.md — keep one and run `living-docs set <path> number next` on each of the others
  adr/index.md                                index differs from its regeneration — run `living-docs index adr`

  2 LIVENESS advisories: 0003, 0007
  1 MOVED-SOURCE advisory: 0010
  run with --advisories to list each one

FAIL — 2 violation(s) across 42 docs.
```

- **你可以怎麼自己補成「每日巡讀」**（我的建議，非本專案提供）：用 Claude Code 的排程或系統 cron 每天跑 ① `living-docs check docs --json` → 存成 `reports/YYYY-MM-DD.json`；② `living-docs read --contract` → 交給 Claude，請它找「兩份現行紀錄在講同一件事」「ADR 與 constitution 互相矛盾」「issue 已 closed 但 ADR 還是 Proposed」；③ 輸出一份中文巡檢報告（違規／建議／疑似重複／疑似衝突 四段）。

### Skill 寫法
- **SKILL.md 格式：有，而且是很好的範例**。[`skills/living-docs/SKILL.md#L1-L9`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/SKILL.md#L1-L9)：frontmatter 有 `name`、`description`、`version`、`metadata.type/layer/tags`。
- **description 怎麼寫才會被觸發**：它的 description 是「先講它做什麼（一長句列出所有文件類型與原則），再用 **"Use when …"** 列出觸發情境（建立／維護文件、寫 ADR/PRD/constitution/issue/research、畫架構圖、執行不漂移規則）」。另外兩個 skill 也是同樣句型，research-artifacts 還在 description 寫明「跟 deep-research、living-docs 搭配」，幫助 AI 判斷要不要一起載入。
- **「薄殼路由」設計**（[ADR 0017](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/docs/adr/0017-skill-md-stubs-are-pure-routers-the-spine-and-all-detail-move-to-cli-topics.md)）：SKILL.md 本身不放規則，只放「什麼任務 → 讀哪個主題」（[`SKILL.md#L48-L63`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/SKILL.md#L48-L63)），細節按需載入，ADR 0057 稱每次寫作載入的規則從 4–6k token 降到 2k 以下（未實測）。這招對你很有用：**你的每個 AI 角色 skill 都可以只放路由表，細節分檔**。
- **資料夾結構**：`SKILL.md` ＋ `rules/`（一主題一檔）＋ `templates/`（範本）＋ `hooks/`（腳本）＋ `tests/fixtures/`（測試資料）。OKF skill 另有 `reference/`（外部規格原文）與 `scripts/update-spec.sh`（更新外部規格）。
- **腳本放哪**：skill 內的 `hooks/`、`scripts/`；但本專案真正的邏輯都在 Rust 執行檔裡，skill 只是文字。

### 支援哪些工具與安裝方式
- **Claude Code：原生**（`living-docs install skills --harness claude [--project]` → `~/.claude/skills` 或 `.claude/skills`；加 `install hooks` 得到 SessionStart＋pre-commit）。
- **Codex：原生**（`--harness codex` → `~/.codex/skills` 或 `.codex/skills`；只有 pre-commit 閘門，沒有開工提示 hook）。
- **OpenCode：原生**（也會讀 `.claude/skills`）；**Pi**：skills 目錄＋在 `AGENTS.md` 加指標。
- **Cursor／GitHub Copilot：手動**（貼 `guide --plain` 輸出）。
- 先決條件：裝好 `living-docs` 執行檔（`./install.sh` 或 `npm i -g living-docs`）。

### 可以直接借用到你「基礎架構」的檔案或段落
1. [`skills/living-docs/rules/spine.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/spine.md#L1-L22) — 五條不漂移原則，翻成中文放 `AGENTS.md` 開頭。
2. [`skills/living-docs/rules/doc-trail.md#L18-L57`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/doc-trail.md#L18-L57) — 「一題一型」表、洩漏表、文件地圖（哪種文件放哪、可不可改）。
3. [`skills/living-docs/templates/claude-hard-rules.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/templates/claude-hard-rules.md#L1-L111) — 共用規則骨架（記得改規則 7 的語言）。
4. [`skills/living-docs/rules/procedure.md#L50-L66`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/procedure.md#L50-L66) — 既有專案導入五步驟＋每次任務維護迴圈。
5. [`skills/living-docs/rules/check.md#L41-L60`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/check.md#L41-L60) — 完成前 checklist。
6. [`skills/living-docs/rules/issue-workflow.md`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/rules/issue-workflow.md#L1-L43) — 任務單流程（GPT 與 Claude 共用同一個任務夾）。
7. `skills/living-docs/templates/{adr,issue,constitution}.md` — 三個範本（含 `{{SLOT: 提示}}` 寫法）。
8. [`skills/living-docs/hooks/session-context.sh`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/skills/living-docs/hooks/session-context.sh#L1-L39)＋[`.claude/settings.json`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/.claude/settings.json) — Claude Code 開工提示範例。
9. [`.githooks/pre-commit`](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/.githooks/pre-commit#L1-L41) — commit 前文件閘門（含只檢查本次改動模式）。
10. [`examples/linkly/docs/`](https://github.com/ejklock/living-docs-skill/tree/8b675599125d4d7e07fbd4f50956c1a003019d60/examples/linkly/docs) — 一個完整、可通過檢查的範例專案文件夾，可照它的形狀建你的 `docs/`。

---

## 關鍵字
Living Docs、活文件、living documentation、決策紀錄、ADR、Architecture Decision Record、MADR、PRD、constitution、專案憲法、issue 流程、docs-first、文件即程式碼、docs-as-code、一事一處、one home per fact、單一事實來源、SSOT、supersede、取代不改寫、Deprecated、退休橫幅、新舊版本衝突、過期偵測、staleness、drift、stale-proposed、MOVED-SOURCE、索引漂移、index drift、重號偵測、孤兒檔、pre-commit hook、SessionStart hook、Agent Skills、SKILL.md、薄殼路由、progressive disclosure、Claude Code、Codex、OpenCode、Cursor、GitHub Copilot、OKF、Open Knowledge Format、Mermaid、Rust CLI、確定性檢查器、多 AI 協作、共用規則、巡檢、每日巡讀
