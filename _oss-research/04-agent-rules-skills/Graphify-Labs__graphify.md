# Graphify-Labs/graphify — 把整個專案（程式碼＋文件）變成可查詢的知識圖譜，並示範「一份來源產生多家 AI 規則、CI 擋漂移」
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：59b5ab1
> GitHub：https://github.com/Graphify-Labs/graphify｜⭐ 142273｜授權：Apache-2.0（早期部分程式碼另保留 MIT）｜主要語言：Python｜最近更新：2026-11-03

> 本資料包所有程式碼位置都以 commit `59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0`（預設分支 `v8`）為準，每個連結都是完整 permalink，可以直接點。
> 版本：`pyproject.toml` 寫 `version = "0.9.102"`，PyPI 套件名是 **`graphifyy`（兩個 y）**（[pyproject.toml#L6-L11](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/pyproject.toml#L6-L11)）。
> 我只做「讀」：沒有安裝、沒有執行任何程式。下面寫「有」的功能，是讀程式碼確認存在；實際跑起來的效果屬於「未確認」。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：graphify 是一個裝在電腦上的 Python 指令列工具＋一份給 AI 用的 `/graphify` 技能（skill）。它把一個資料夾（程式碼、Markdown 文件、SQL schema、設定檔、PDF、圖片、影片）解析成「知識圖譜」：每個函式、類別、文件標題都是一個節點，呼叫／匯入／引用都是一條邊，然後產出三個檔案——`graph.html`（可點的互動圖）、`GRAPH_REPORT.md`（重點報告）、`graph.json`（完整圖，可以一直查）。之後 AI 不必每次重新 grep 整個專案，而是先下 `graphify query "問題"` 拿一小塊相關子圖。

**先講結論：它「不是」一個專門做「每日巡讀、抓漏、抓重複、抓新舊衝突」的 skill。** 它沒有角色設計、沒有任務清單、沒有偵測兩份文件互相矛盾的功能。但對你的需求，它有三塊很有價值：

1. **巡讀的「地圖」**：你的倉儲／庫存系統是純 JavaScript（Firebase），graphify 用 tree-sitter 解析 JS 是本機、免費、不送出任何程式碼（[pyproject.toml#L14-L54](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/pyproject.toml#L14-L54) 依賴 `tree-sitter-javascript`）。報告裡的「Knowledge Gaps（孤立節點）」「Ambiguous Edges（不確定的關係）」「Surprising Connections（意外的跨模組關聯）」「Import Cycles」可以當作每日巡檢報告的骨架。
2. **「一份規則來源 → 自動產生給 Claude、Codex、Cursor…的版本，並用 CI 擋住手改與漂移」**：這是整個 repo 最值得你抄的設計（`tools/skillgen/`）。你現在覺得「每個 AI 的規則檔各寫各的、越來越亂、不知道哪份是新的」，graphify 自己就遇到一模一樣的問題（要支援 16 種 AI 平台），它的解法是：人只改 `fragments/`（片段），由產生器組出各平台的 SKILL.md 與 CLAUDE.md／AGENTS.md 區塊，`--check` 在 pre-commit 與 CI 逐位元組比對，誰手改產出檔就直接失敗。
3. **防止「文件說的」跟「程式碼實際的」不一致**：它用一個測試去解析 `ARCHITECTURE.md` 的表格，逐一確認文件寫到的函式真的存在（`tests/test_architecture_doc.py`）。這個點子你可以直接搬去管你的 CLAUDE.md／AGENTS.md：「規則檔裡提到的檔案、函式、指令，每天自動檢查還在不在」。

**對你可以做的具體事情**
- 在你的倉儲 app 專案跑 `graphify . --code-only`（只分析程式碼、不花 API 費），讓 Claude 和 Codex 查同一張圖，減少兩個 AI 各自「以為」程式長什麼樣。
- 每天巡檢時讀 `GRAPH_REPORT.md` 的「Graph Freshness（圖是哪個 commit 建的）」「Knowledge Gaps」「Ambiguous Edges」三段，當成「AI 可能漏接、可能重做」的線索。
- 照 `tools/skillgen/` 的做法，把你自己的共用規則拆成片段，產生 `CLAUDE.md` 和 `AGENTS.md`，CI 檢查兩者不漂移。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權**：`Apache-2.0`（[LICENSE](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/LICENSE)）。另外 [NOTICE](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/NOTICE) 寫明：專案改授權前，以 MIT 貢獻的部分「仍可依 MIT 使用」，原文保留在 [LICENSE-MIT](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/LICENSE-MIT)。`pyproject.toml` 把三個檔案都列為 `license-files`。
- **個人使用**：完全可以，免費，想怎麼用、改都行。
- **公司商用**：Apache-2.0 允許商用、修改、閉源再散布。要做的事：(1) 散布（給別人）時附上 LICENSE 和 NOTICE；(2) 你改過的檔案要標示「有修改」；(3) Apache-2.0 有專利授權條款，若你對它提專利訴訟，授權會終止。只在自己公司內部用、不對外散布，幾乎沒有負擔。
- **商標**：README 最後說 "graphify" 名稱和 logo 是 Graphify Labs 的商標，你若做衍生工具名字裡有 graphify，要註明非官方（[README.md#L524-L526](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/README.md#L524-L526)）。
- **付費版**：有。README 多處推 **Graphify Cloud**（14 天試用，付費），宣稱的功能有：多 repo／monorepo 一張圖、formal verification（形式驗證架構規則）、SDLC 全流程 code review、Sentry／Jira 連接器、背景持續更新（[README.md#L485-L494](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/README.md#L485-L494)）。這些**不在**這個 repo 裡（我沒找到對應程式碼），開源版本是「每個資料夾手動或 hook 觸發重建」。開源版裡也有 `graphify global` 與 `merge-graphs` 可以把多張圖合併（[graphify/cli.py#L3308](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L3308)、[#L3896](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L3896)），但沒有 Cloud 的「持續」與連接器。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | Python ≥ 3.10（[pyproject.toml#L13](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/pyproject.toml#L13)） |
| 核心套件 | `networkx`（圖）、`numpy`、`rapidfuzz`（字串相似度）、`pyyaml`、`tree-sitter` + 約 25 種語言文法（必裝），其他語言為選配 |
| 前端 | 沒有網站；輸出靜態 `graph.html`（瀏覽器開即可）與 Mermaid call-flow HTML |
| 後端／伺服器 | 不需要。選配 `mcp` 可起 MCP stdio／HTTP 伺服器給 AI 查圖（[graphify/serve.py#L3237](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/serve.py#L3237)） |
| 資料庫 | 不需要。圖存在 `graphify-out/graph.json`；選配可推到 Neo4j 或 FalkorDB |
| 部署 | `uv tool install graphifyy` 或 `pipx install graphifyy`，再 `graphify install` 把技能註冊進你的 AI 工具（[README.md#L53-L54](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/README.md#L53-L54)） |
| 硬體／GPU | 不需要 GPU。影片轉文字用 faster-whisper（本機 CPU 可跑，較慢） |
| API Key | **只分析程式碼：不需要任何 Key**（AST 本機解析）。文件／PDF／圖片的「語意萃取」才要 LLM：在 Claude Code 裡用 `/graphify` 時直接用你當下的 Claude 對話模型；指令列 `graphify extract` 則依序自動偵測 `GEMINI_API_KEY` → `MOONSHOT_API_KEY` → `ANTHROPIC_API_KEY` → `OPENAI_API_KEY` → `DEEPSEEK_API_KEY` → Azure → Bedrock → Ollama（[graphify/llm.py#L3522-L3540](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/llm.py#L3522-L3540)）。也有 `claude-cli` 後端：用本機 `claude` 指令、走你的 Claude 訂閱，不用另外的 API Key（[graphify/llm.py#L248](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/llm.py#L248)） |
| 大概費用 | 程式碼部分 0 元。程式內建的價格表（用來估算成本，不代表官方現價）：Claude 預設 `claude-sonnet-4-6`，每百萬 token 輸入 3 美元／輸出 15 美元；OpenAI 預設 `gpt-4.1-mini` 0.40／1.60；Gemini 預設 `gemini-3-flash-preview` 0.50／3.00（[graphify/llm.py#L141-L200](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/llm.py#L141-L200)）。文件量大的專案第一次建圖會花「幾分鐘、數萬 token」（skill 自己這樣警告），之後 `--update` 只重跑有改的檔 |

> 注意：Kimi（`MOONSHOT_API_KEY`）會把文件送到中國的 Moonshot 伺服器（README Privacy 段落明寫）。若你的文件有供應商報價、成本這類敏感資料，建議設 `GRAPHIFY_BACKEND=none`（只做程式碼圖）或用 Claude／本機 Ollama。

---

## 4. 程式架構地圖（目錄樹）

計數方式：`git ls-tree -r --name-only HEAD` 共 1,170 個檔；`find graphify -name '*.py'` 有 97 個 Python 檔、合計 95,070 行（`wc -l`）；`tests/` 有 521 個測試檔、`grep -c "def test_"` 加總 7,730 個測試函式。

```
graphify/  (repo 根)
├── AGENTS.md                  # 本 repo 給 AI 的規則（很短，3 條）
├── ARCHITECTURE.md            # 模組表；被 tests/test_architecture_doc.py 自動驗證不能跟程式碼脫節 ★
├── CHANGELOG.md / RELEASING.md / CONTRIBUTING.md / SECURITY.md
├── .pre-commit-config.yaml    # 本機 commit 前跑 skillgen --check ★
├── .github/
│   ├── workflows/ci.yml       # skillgen-check job：5 個防漂移檢查 ★
│   ├── workflows/release-graph.yml  # 每次發版用自己建自己的圖（AST-only）
│   └── PULL_REQUEST_TEMPLATE.md     # 「Verification & Invariants」驗證清單 ★
├── tools/skillgen/            # ★★ 單一事實來源 → 產生各平台技能檔（不隨套件發佈）
│   ├── gen.py                 # 產生器 + --check/--bless/--audit-coverage 等驗證
│   ├── platforms.toml         # 16 個平台各自的差異設定（description、派工方式、shell）
│   ├── fragments/             # 人只改這裡（34 個片段檔）
│   │   ├── core/core.md       # 共用技能本體模板（709 行，含 @@SLOT@@ 插槽）
│   │   ├── always-on/*.md     # 6 種「永遠載入」規則區塊（CLAUDE.md / AGENTS.md / GEMINI.md…）
│   │   ├── dispatch/*.md      # 各平台怎麼派子代理（Claude Agent tool、Codex spawn_agent…）
│   │   ├── references/shared/ # 按需載入的參考文件（extraction-spec、update、hooks…）
│   │   └── shell/ extra/ query-stub/
│   └── expected/              # 134 個「已核可快照」，--check 逐位元組比對
├── graphify/                  # Python 套件本體
│   ├── skill.md, skill-codex.md, skill-*.md   # 產出的各平台 SKILL.md（勿手改）
│   ├── skills/<平台>/references/*.md          # 產出的參考文件 sidecar
│   ├── always_on/*.md         # 產出的 6 種永遠載入規則區塊
│   ├── __main__.py / cli.py   # 指令入口（cli.py 5,767 行）
│   ├── install.py             # 把技能與規則寫進 ~/.claude、AGENTS.md、.codex/hooks.json…（2,953 行）
│   ├── hooks.py               # git post-commit/checkout/merge/rewrite 自動重建
│   ├── watch.py               # 監看資料夾、needs_update 旗標、check_update
│   ├── detect.py → extract.py → build.py → cluster.py → analyze.py → report.py → export.py  # 主管線
│   ├── extractors/            # 各語言萃取器（markdown.py、sql.py、yaml_config.py、json_config.py…）
│   ├── markdown_resolution.py # 文件中 `Widget`、`render()` 這類程式碼引用 → 連到真正的程式節點
│   ├── dedup.py               # 實體去重（MinHash/LSH + Jaro-Winkler + union-find）
│   ├── diagnostics.py         # 圖健康檢查（懸空邊、缺端點、自迴圈）
│   ├── reflect.py             # 「工作記憶」：把問答結果評為 useful/dead_end/corrected，產出 LESSONS.md
│   ├── llm.py                 # 各家 LLM 後端（Claude/OpenAI/Gemini/…）
│   ├── serve.py               # MCP 伺服器（query_graph、shortest_path…）
│   ├── prs.py                 # PR 儀表板、--conflicts 找可能衝突的 PR
│   └── security.py            # URL/路徑/標籤消毒、檔案大小上限
├── tests/                     # 521 個測試檔
├── worked/                    # 實際跑過的範例輸出（GRAPH_REPORT.md、graph.json）
└── docs/                      # how-it-works、superpowers/specs|plans（設計稿與計畫）、32 國語言 README（含 README.zh-TW.md）
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 主管線 | [ARCHITECTURE.md#L5-L33](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/ARCHITECTURE.md#L5-L33) | `detect()` → `extract()` → `build()` → `cluster()` → 分析 → `report.generate()` → `export.to_*()`，各階段用 dict 與 NetworkX 圖傳遞 |
| 檔案偵測 | [graphify/detect.py#L2093](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/detect.py#L2093) | 遵守 `.gitignore`、`.graphifyignore`、`--exclude`；把檔案分成 code／document／paper／image／video |
| 程式碼萃取（本機、確定性） | [graphify/extract.py#L10037](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/extract.py#L10037) | tree-sitter AST，`calls`/`imports`/`inherits` 跨檔解析，不用 LLM。邊標記 `EXTRACTED`（原文明寫）或 `INFERRED`（推得） |
| Markdown 文件結構 | [graphify/extractors/markdown.py#L412-L440](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/extractors/markdown.py#L412-L440) | 每個檔一個 `page` 節點、每個標題一個 `heading` 節點；`[文字](./other.md)`、`[[wikilink]]` 變成 `references` 邊。連到不存在的文件的連結「保持懸空」（[#L540-L566](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/extractors/markdown.py#L540-L566)） |
| 文件引用程式碼 | [graphify/markdown_resolution.py#L1-L46](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/markdown_resolution.py#L1-L46) | 文件裡反引號寫的 `` `Widget.render()` ``，全部檔案萃取完後才去找真正定義的節點；名稱有歧義就「不猜、不連」 |
| 語意萃取（文件／PDF／圖片） | [tools/skillgen/fragments/references/shared/extraction-spec.md#L20-L60](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/references/shared/extraction-spec.md#L20-L60) | 平行子代理各讀一批檔，回傳 JSON。要求回報 `coverage`（每個檔實際讀了幾行），讀不完的檔會被標 partial、下次 `--update` 重讀；兩個概念「解決同一問題但沒有互相引用」時加 `semantically_similar_to` 邊（信心 0.6–0.95） |
| 實體去重 | [graphify/dedup.py#L1124-L1160](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/dedup.py#L1124-L1160) | 正規化 → 熵門檻 → MinHash/LSH 分桶 → Jaro-Winkler 驗證 → 同社群加分 → union-find 合併；可選 `--dedup-llm` 讓 LLM 判斷模稜兩可的配對。禁止跨 repo 合併 |
| 新舊目錄優先序 | [graphify/dedup.py#L383-L425](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/dedup.py#L383-L425) | ID 撞名時，路徑在 `in-progress/active/current/wip` 的勝過 `archive/old/done/backup/bak/graveyard` 的——「新版優先於封存版」 |
| 分群 | [graphify/cluster.py#L233](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cluster.py#L233) | Leiden（選配）或 networkx Louvain，把圖分成子系統 |
| 分析 | [graphify/analyze.py#L116](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/analyze.py#L116)、[#L155](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/analyze.py#L155)、[#L637](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/analyze.py#L637) | `god_nodes`（最多連線的核心）、`surprising_connections`（跨群意外關聯）、`graph_diff`（兩次快照比：新增／移除的節點與邊）、`find_import_cycles` |
| 報告 | [graphify/report.py#L223-L230](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/report.py#L223-L230)、[#L330-L392](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/report.py#L330-L392) | 「Graph Freshness」寫出建圖的 commit；「Ambiguous Edges - Review These」；「Knowledge Gaps」列孤立節點與過薄的群；AMBIGUOUS 比例 > 20% 會警告 |
| 健康檢查 | [tools/skillgen/fragments/core/core.md#L462-L486](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/core/core.md#L462-L486)、[graphify/diagnostics.py#L156](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/diagnostics.py#L156) | 唯讀檢查懸空端點、缺端點、自迴圈、被壓扁的重複邊；有問題印 `GRAPH HEALTH WARNING`，但不中止 |
| 查詢 | [graphify/cli.py#L1770](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L1770)、[#L2186](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L2186)、[#L2378](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L2378) | `query`（BFS/DFS 子圖、token 預算）、`path A B`（最短路徑）、`explain X`；名稱有多個候選時拒答並列出候選（exit code 3） |
| 工作記憶／教訓 | [graphify/reflect.py#L1-L25](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/reflect.py#L1-L25)、[graphify/cli.py#L2098-L2140](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L2098-L2140) | `graphify save-result --outcome useful|dead_end|corrected` 存問答；`graphify reflect` 彙整成 `graphify-out/reflections/LESSONS.md`（偏好來源、已知死路、被糾正的答案），有時間衰減；程式碼變了的教訓標為過期（[reflect.py#L868-L882](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/reflect.py#L868-L882)） |
| 自動重建 | [graphify/hooks.py#L1116-L1155](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/hooks.py#L1116-L1155) | `graphify hook install` 裝 post-commit／post-checkout／post-merge／post-rewrite 四個 git hook，加上 graph.json 的 merge driver |
| 文件變更待處理旗標 | [graphify/watch.py#L3381-L3404](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/watch.py#L3381-L3404) | 程式碼變了自動重建；文件變了（需 LLM）只寫 `graphify-out/needs_update` 旗標；`check_update()` 註明「cron-safe」，給排程用 |
| AI 讀檔前攔截 | [graphify/install.py#L559-L595](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/install.py#L559-L595)、[graphify/cli.py#L1269-L1290](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L1269-L1290) | 在 Claude Code 裝 `PreToolUse` hook（matcher `Bash|Grep`、`Read|Glob`，timeout 10 秒），圖是新的就提醒 AI 先查圖；`--strict` 會擋掉每個 session 第一次直接 Read／Grep；出錯一律放行（fail open） |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| **規則片段產生器 + 防漂移檢查** | [tools/skillgen/gen.py#L1-L22](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/gen.py#L1-L22)、[check()#L723-L744](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/gen.py#L723-L744) | Python 標準庫 + `tomllib` | 中（1,634 行，大半是 graphify 專用的歷史驗證；核心 render/check 約 200 行可抽） | 抄「fragments/ → render → 寫出 CLAUDE.md、AGENTS.md → `--check` 比對 → `--bless` 更新快照」這個流程，用 Claude Code 重寫成 50～100 行的小腳本 |
| 平台差異設定檔 | [tools/skillgen/platforms.toml#L1-L56](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/platforms.toml#L1-L56) | 無 | 低 | 照格式寫你自己的 `[platform.claude]`、`[platform.codex]`：輸出路徑、description、各自差異片段 |
| 共用 skill 模板＋插槽 | [tools/skillgen/gen.py#L546-L588](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/gen.py#L546-L588) | 無 | 低 | `@@INSTALL@@`、`@@DISPATCH@@` 這種插槽替換；有未填插槽就報錯（防漏） |
| 冪等寫入共用規則檔的區段 | [graphify/install.py#L871-L925](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/install.py#L871-L925) | 無 | 低（約 50 行純函式） | 你的工具要往 CLAUDE.md／AGENTS.md 塞一段時，用「找完全相同的 `## 標題` 行 → 取代到下個 `## `，找不到就附加」，不會重複塞、不會誤刪人手寫的段落 |
| pre-commit + CI 防漂移 | [.pre-commit-config.yaml#L1-L16](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/.pre-commit-config.yaml#L1-L16)、[.github/workflows/ci.yml#L11-L47](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/.github/workflows/ci.yml#L11-L47) | pre-commit、GitHub Actions | 低 | 直接照抄結構，把指令換成你的檢查腳本 |
| 「文件不能跟程式碼脫節」測試 | [tests/test_architecture_doc.py#L1-L60](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tests/test_architecture_doc.py#L1-L60) | pytest | 低 | 改成 JS 版：解析你 CLAUDE.md 裡提到的檔案路徑／函式名，檢查 repo 裡真的存在；連「解析器至少要抓到 N 個」都要驗，避免檢查變空殼 |
| 技能版本戳記與自動更新 | [graphify/install.py#L150-L182](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/install.py#L150-L182)、[graphify/__main__.py#L266-L352](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/__main__.py#L266-L352) | 無 | 低 | 每份安裝出去的 skill 旁放 `.graphify_version`；版本比套件舊就自動更新、比較新就不降級、被手改過就保留 `.bak` |
| 新舊路徑優先序 | [graphify/dedup.py#L383-L425](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/dedup.py#L383-L425) | 無 | 低 | 巡檢時兩份同名文件衝突：`active/current` 勝 `archive/old/done` |
| 實體去重管線 | [graphify/dedup.py#L1124](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/dedup.py#L1124)、[graphify/_minhash.py](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/_minhash.py) | numpy、rapidfuzz | 中 | 可拿來找「名字很像的商品／SKU」或「標題很像的規則段落」；但它與圖的節點格式綁很緊 |
| 圖報告產生器 | [graphify/report.py#L330-L392](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/report.py#L330-L392) | networkx | 中 | 報告段落格式（Freshness／Ambiguous／Gaps／Suggested Questions）可當你每日巡檢報告的模板 |
| 工作記憶 reflect | [graphify/reflect.py](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/reflect.py) | 無 LLM，純 Python | 中 | 「哪些答案有用／死路／被糾正」的記帳格式，可借給你的多 AI 交接紀錄 |
| 整個 graphify CLI（不拆） | `uv tool install graphifyy` | Python 3.10+ | 低（當外部工具用） | 在你的專案根目錄 `graphify . --code-only`，然後把 always-on 規則塞進 CLAUDE.md/AGENTS.md |

---

## 7. AI／Claude 整合

- **Claude 支援：原生。** 預設平台就是 Claude Code：`graphify install` 把 SKILL.md 寫到 `~/.claude/skills/graphify/SKILL.md`，在 `~/.claude/CLAUDE.md` 登記，並在設定檔加 `PreToolUse` hook（[graphify/install.py#L1032-L1090](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/install.py#L1032-L1090)）。
- **Codex 支援：有。** `graphify install --platform codex` 寫 AGENTS.md 區段＋ `.codex/hooks.json`（那個 hook 故意是空動作，因為 Codex Desktop 不接受 PreToolUse 的 additionalContext，指引改靠 AGENTS.md）（[graphify/install.py#L1991-L2035](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/install.py#L1991-L2035)、[graphify/cli.py#L3159-L3163](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L3159-L3163)）。Codex 要平行萃取需在 `~/.codex/config.toml` 開 `multi_agent = true`；Codex 裡指令是 `$graphify` 不是 `/graphify`。
- **Prompt 放哪**：技能本體模板在 [tools/skillgen/fragments/core/core.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/core/core.md)，子代理萃取 prompt 在 [extraction-spec.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/references/shared/extraction-spec.md)，Codex 派工寫法在 [dispatch/codex-agenttask.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/dispatch/codex-agenttask.md)（用 `spawn_agent(agent_type="worker", …)` → `wait_agent` → `close_agent`，任一子代理失敗就停，不合併殘缺結果）。
- **永遠載入的規則**：6 份，在 [graphify/always_on/](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/always_on/claude-md.md)（claude-md、agents-md、gemini-md、antigravity-rules、kiro-steering、vscode-instructions）。Claude 與 Codex 兩份幾乎相同，差別只在 AGENTS.md 版多一行「使用者打 `/graphify` 時先用技能」以及「圖檔被 hook 改髒是正常的」。
- **MCP**：有。`graphify . --mcp` 或 `serve`，工具有 `query_graph`、`get_node`、`get_neighbors`、`get_community`、`god_nodes`、`graph_stats`、`shortest_path`、`list_prs`、`get_pr_impact`、`triage_prs`，另有 `graphify://report` 等資源（[graphify/serve.py#L2696-L2830](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/serve.py#L2696-L2830)、[#L3109-L3114](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/serve.py#L3109-L3114)）。
- **LLM 後端可換**：Claude（`ANTHROPIC_API_KEY`，可用 `ANTHROPIC_MODEL` 換型號，支援 prompt caching，`GRAPHIFY_CLAUDE_PROMPT_CACHE=0` 可關）、claude-cli（訂閱）、OpenAI、Gemini、DeepSeek、Kimi、Azure、Bedrock、Ollama（[graphify/llm.py#L141-L260](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/llm.py#L141-L260)）。`graphify prs --triage` 用「Opus」排序 PR 審查順序（[graphify/prs.py#L1-L14](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/prs.py#L1-L14)，需要 `gh` CLI）。

---

## 8. 擴充方式與 API

- **當 Python 函式庫用**：`from graphify.extract import extract`；`extract(paths, root=...)` 吃「路徑清單」，一定要傳 `root`（[ARCHITECTURE.md#L42-L52](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/ARCHITECTURE.md#L42-L52)）。
- **讀 `graph.json`**：任何語言都能讀（node-link JSON，含 `schema_version`、`graphify_version`）。你可以用 JS 寫自己的巡檢腳本讀它。
- **新增語言萃取器**：`graphify/extractors/` 一語言一檔，`ARCHITECTURE.md` 有「怎麼加語言」段落、`extractors/MIGRATION.md` 說明搬遷。
- **專案設定**：根目錄 `.graphifyrc`（`language.inc=php`、`query_budget=4000`、`viz_node_limit=0`…），`.graphifyignore` 排除檔案。
- **新增 AI 平台**：在 `tools/skillgen/platforms.toml` 加一個 `[platform.xxx]`，選 dispatch／shell 片段，跑產生器。
- **匯出**：HTML、Obsidian vault、wiki（每個社群一篇 + `index.md`）、SVG、GraphML、Neo4j/FalkorDB Cypher、callflow HTML（[graphify/cli.py#L3524](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L3524)）。
- **Office／試算表**：選配 `office` 支援 `.docx`、`.xlsx`；`google` 透過 googleworkspace CLI（`gws`）把 Google 雲端硬碟桌面版的 `.gsheet`／`.gdoc` 捷徑檔匯出成 Markdown 再分析（[graphify/google_workspace.py](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/google_workspace.py)）。這只是把試算表內容「讀進圖」，不是試算表編輯器。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。CHANGELOG 最新 `0.9.102 (2026-11-03)` 一版就有十幾條修正，多數附 issue 編號與外部貢獻者（[CHANGELOG.md#L5-L25](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/CHANGELOG.md#L5-L25)）。issue 編號已到 #4900 以上。README 顯示是 Y Combinator S26 公司。
- **測試**：521 個測試檔、7,730 個 `def test_`（我用 grep 計數）；CI 另有 skillgen 防漂移 job。
- **程式碼體量大**：`extract.py` 一檔 12,138 行、`cli.py` 5,767 行。整包拆來改難度高，建議「當外部工具用 + 抄設計」，不要直接改它的核心。
- **隱私**：程式碼本機處理；文件／PDF／圖片在語意萃取時會送到你設定的 LLM。README 寫「No telemetry」，我在 `graphify/*.py` 找 `pypi.org`、`urlopen`、`requests.get` 只在 `security.py` 的安全下載函式看到網路呼叫，沒看到回傳使用資料的程式碼（但沒逐行審計全部 95,070 行，屬「大致確認」）。
- **文件與程式碼不一致的實例（正好是你在意的「新舊版本衝突」）**：README Privacy 段說每次 query 都會記錄到 `~/.cache/graphify-queries.log`，要設 `GRAPHIFY_QUERY_LOG_DISABLE=1` 才關；但程式碼 [graphify/querylog.py#L15-L31](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/querylog.py#L15-L31) 註明「Opt-in only (#1797)」，預設是**關閉**。以程式碼為準。這說明它的 doc-drift 測試只守 ARCHITECTURE.md 的表格，沒守 README。
- **會改你的設定檔**：`graphify install` 會寫 `~/.claude/CLAUDE.md`、Claude 設定的 hooks、`.codex/hooks.json`、AGENTS.md、git hooks。有 `graphify uninstall`（`--purge` 連 `graphify-out/` 一起刪）。如果你已有自己的 CLAUDE.md／AGENTS.md，它是用「`## graphify` 標題區段」冪等替換，不會覆蓋其他段落。
- **strict 模式會擋 AI 讀檔**：`--strict` 會拒絕每個 session 第一次直接 Read／Grep，對新手可能造成 AI 卡住的困惑；預設不開。
- **假套件風險**：官方是 `graphifyy`（雙 y），README 特別警告其他 `graphify*` 套件非官方。
- **付費導流**：README 多處推 Graphify Cloud，開源版沒有「持續背景更新、多 repo、formal verification」。
- **大型 graph.json diff**：每次重建整檔重寫，commit 進 git 會有很大的 diff（always-on 規則還特別告訴 AI 不要把它當成問題）。

---

## 10. 跟其他專案組合的建議

針對你「多個 AI 有秩序地合作 + 每日巡讀」的目標，graphify 適合當「地圖層＋規則產生器範本」，不適合當流程主體：

1. **規則層：skillgen 的做法 + 你自己的 CLAUDE.md／AGENTS.md**  
   建一個 `ai-rules/fragments/`：`core.md`（共同規則）、`claude.md`（Claude 專屬差異）、`codex.md`（Codex 專屬差異）、`roles/*.md`（角色）。寫一支小腳本產生根目錄的 `CLAUDE.md` 和 `AGENTS.md`，CI／pre-commit 跑 `--check`。這樣兩個 AI 讀的是「同一個來源、不同包裝」，不會出現一份新一份舊。
2. **規格／新舊版本層：搭配 OpenSpec（同分類已有資料包 `Fission-AI__OpenSpec.md`）**  
   OpenSpec 管「現行規格 specs/」＋「變更提案 changes/」＋「封存 archive/」，這是 graphify 沒有的版本治理。graphify 的 `_lifecycle_penalty` 正好也認 `archive/`、`done/` 目錄為舊版，兩者觀念一致。
3. **流程／角色層：搭配 obra/superpowers、BMAD-METHOD 或 agency-agents（同分類資料包）**  
   graphify 沒有角色；角色、交接、完成前驗證要從那些專案拿。graphify 自己的 `docs/superpowers/specs/…-design.md` 與 `plans/…` 就是用 superpowers 風格寫的設計稿與計畫，表示兩者可以共存。
4. **巡檢層：graphify 當「每日巡讀的眼睛」**  
   每天（cron、GitHub Actions 排程或 Claude Code 排程任務）：
   - `graphify update .`（只重跑有改的程式碼，免 API 費）
   - `graphify check-update .`（看有沒有待處理的文件變更旗標）
   - 讀 `GRAPH_REPORT.md` 的 Freshness／Knowledge Gaps／Ambiguous／Import Cycles
   - 再交給一個「巡檢員」AI 角色：比對 `graph_diff` 的新增／移除節點、找 `semantically_similar_to` 邊（可能重複實作）、檢查規則檔提到的路徑是否存在（仿 `test_architecture_doc.py`）。
   「兩份文件內容互相矛盾」這件事 graphify 不會抓，要另外寫一個讓 Claude 讀「同一主題、不同檔」並比對的步驟。
5. **你的試算表、比價、影片主題**：graphify 幫不上產品功能，只能幫你在 A＋B＋C 拼裝時「先建圖看懂別人的專案」：例如對某個試算表開源專案跑 `graphify https://github.com/<owner>/<repo>`，用 `graphify query "公式計算在哪裡"` 找程式位置，比直接讀快。

---

## 11. 規則／角色／巡檢 檢查表

### 共用規則怎麼寫 —— **有（以「給 AI 的工具規則」而言）**
- **檔案結構**：6 種永遠載入規則區塊，各寫到對應檔：Claude → `CLAUDE.md`；Codex/OpenCode/Trae 等 → `AGENTS.md`；Gemini → `GEMINI.md`；VS Code Copilot → `.github/copilot-instructions.md`；Cursor → `.cursor/rules/`（`alwaysApply`）；Kiro → steering（`inclusion: always`）；Antigravity → rules（`trigger: always_on`）。來源見 [graphify/always_on/agents-md.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/always_on/agents-md.md)、[claude-md.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/always_on/claude-md.md)、[kiro-steering.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/always_on/kiro-steering.md)、[antigravity-rules.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/always_on/antigravity-rules.md)。
- **分層**：有「全域」與「專案」兩層。全域裝在 `~/.claude/skills/…` 並在 `~/.claude/CLAUDE.md` 登記；`--project` 裝在專案的 `.claude/skills/graphify/SKILL.md` 或 `.agents/skills/graphify/SKILL.md`，並印出 `git add` 提示讓你 commit 進 repo（[README.md#L204-L215](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/README.md#L204-L215)）。沒有子資料夾層。
- **優先順序**：**沒有**通用優先順序。README 明說 CLI 技能指引與 MCP 指引「都不建立通用優先規則」，若兩者都用，要你自己選一個主要查詢路徑，**不要把兩段無條件規則都抄進 AGENTS.md**（[README.md#L317-L326](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/README.md#L317-L326)）——這句話本身就是防重複規則的好建議。
- **讓 GPT（Codex）與 Claude 讀同一份規則**：做法是「同一組片段 → 產生 claude-md 與 agents-md 兩份內容幾乎相同的區塊」，再用 [`_replace_or_append_section`](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/install.py#L871-L925) 冪等寫入。規則還要求「把這條規則放進每一個探索程式碼的子代理 prompt」，避免子代理漏讀。

### 角色設計 —— **沒有**
- 沒有 PM／工程師／審查員這類角色定義。唯一的「角色」是語意萃取時平行派出的子代理：Claude 用 Agent tool 的 `general-purpose`、Codex 用 `spawn_agent(agent_type="worker")`、Pi 用 `delegate` agent（[tools/skillgen/gen.py#L56-L58](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/gen.py#L56-L58)、[dispatch/codex-agenttask.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/dispatch/codex-agenttask.md)）。
- **交接**有一個值得借的形式：子代理回傳固定 JSON schema，主代理先驗證全部結果，「任何一個失敗就停，不合併殘缺結果、不寫快取」。這是「交接要能被驗收」的範例。

### 防漏 —— **部分有**
- **coverage 回報**：每個子代理要回報每個檔案讀了幾行；讀不完的檔標 partial、下次重讀，「缺項跟完整讀取無法區分」所以必須明報（[extraction-spec.md#L20-L25](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/references/shared/extraction-spec.md#L20-L25)）。這招很適合搬到你的巡讀：要求每個 AI 回報「我讀了哪些檔、各讀幾行」。
- **完成前驗證**：Honesty Rules「不准捏造關係，不確定就標 AMBIGUOUS」「不准跳過語料量警告」「一定要顯示 token 成本」（[core.md#L703-L709](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/core/core.md#L703-L709)）；健康檢查 Step 4.5；空結果不得覆蓋好的 graph.json（shrink guard）。
- **PR 驗證清單**：「重現問題、找出要保護的不變條件、最小修正、加回歸測試、PR 描述與最終實作同步、明列限制」（[.github/PULL_REQUEST_TEMPLATE.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/.github/PULL_REQUEST_TEMPLATE.md)）。
- **任務追蹤（backlog）**：**沒有**。只有 GitHub issue 範本。
- **交接紀錄**：部分——`save-result` + `reflect` 的 LESSONS.md 記錄「有用／死路／被糾正」，下一個 session 可先讀。

### 防重複 —— **部分有**
- **重複規則**：有。skillgen 讓 16 個平台共用一份 core 與 references，避免同一段規則被複製 16 次後各自改歪；`--schema-singleton` 確保某段列舉在所有產出檔中逐字相同（[ci.yml#L40-L41](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/.github/workflows/ci.yml#L40-L41)）。
- **重複內容／實作**：部分。`dedup.py` 合併名稱近似的節點；萃取 prompt 要求標 `semantically_similar_to`（「兩個函式都在驗證使用者輸入但互不呼叫」就是範例）（[extraction-spec.md#L48-L52](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/references/shared/extraction-spec.md#L48-L52)）。0.9.102 的 changelog 也提到查詢流程會提示 AI「找出重新實作 hub 而不是呼叫它的程式碼」。但**沒有**一份「重複段落清單」報告。
- **重複角色**：不適用（沒有角色）。

### 防新舊版本衝突 —— **有（針對它自己的規則與技能），沒有（針對文件內容互相矛盾）**
- **單一事實來源**：`tools/skillgen/fragments/` 是唯一可手改處，產出檔加上 `expected/` 快照雙重比對（[gen.py#L723-L744](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/gen.py#L723-L744)）。產出檔不寫時間戳或版本，保證可重現。
- **版本標記**：每個安裝出去的 skill 旁有 `.graphify_version`，套件升級後第一次執行自動更新舊版、不降級、手改過的留 `.bak`（[__main__.py#L266-L352](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/__main__.py#L266-L352)）。
- **漂移偵測**：`--check`、`--audit-coverage`（每個平台的舊版標題都必須在新版找到）、`--monolith-roundtrip`、`--always-on-roundtrip`，CI 與 pre-commit 都跑。文件對程式碼：`tests/test_architecture_doc.py`。
- **過期偵測**：報告寫「Built from commit」讓你比對 `git rev-parse HEAD`；`_stale_graph_sources` 移除已刪或已排除檔案留下的節點（[cli.py#L476-L500](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/cli.py#L476-L500)）；LESSONS 中來源程式碼內容雜湊變了就標過期。
- **新舊目錄**：`archive/old/done/backup` 低於 `active/current/in-progress`（[dedup.py#L383-L425](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/dedup.py#L383-L425)）。
- **變更提案／封存流程**：**沒有**（`docs/superpowers/specs`、`plans` 只是兩份設計稿，不是機制）。
- **兩份文件互相矛盾的偵測**：**沒有**。我 grep `contradict`、`conflicts_with`，只在合併邏輯註解中出現，沒有矛盾偵測功能或關係類型。

### 定期巡檢 —— **部分有（有觸發機制，沒有內建每日排程）**
- **hook**：git 四種 hook 自動重建（[hooks.py#L1116-L1155](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/hooks.py#L1116-L1155)）；Claude Code PreToolUse hook 在 AI 讀檔前提醒。
- **watch**：`graphify watch` 監看檔案變化。
- **cron**：`check_update()` 註明「cron-safe：永遠回傳 True，不讓 cron 誤報」（[watch.py#L3381-L3393](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/watch.py#L3381-L3393)），但 repo 裡**沒有**附 cron 設定；GitHub Actions 也沒有 `schedule:`（我 grep `cron`、`schedule:` 在 `.github/workflows/` 都是 0 筆），只有發版時建圖的 [release-graph.yml](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/.github/workflows/release-graph.yml)。
- **報告格式**（摘自 [worked/rsl-siege-manager/GRAPH_REPORT.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/worked/rsl-siege-manager/GRAPH_REPORT.md)，節錄）：
```
# Graph Report - .  (2026-05-13)
## Summary
- 1886 nodes · 3876 edges · 141 communities (89 shown, 52 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 393 edges (avg confidence: 0.62)
## Graph Freshness
- Built from commit: `6085fd66`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
## Knowledge Gaps
- **752 isolated node(s):** `initial schema  Revision ID: 0001 ...` (+747 more)
  These have ≤1 connection - possible missing edges or undocumented components.
## Suggested Questions
- **Are the 17 inferred relationships involving `SiegeMember` ... actually correct?**
```
  你可以照這個架構定你自己的「每日巡檢報告」：摘要 → 新鮮度（基於哪個 commit）→ 待人工確認 → 缺口 → 建議追問。

### Skill 寫法 —— **有，而且有幾個細節很實用**
- **SKILL.md 格式**：YAML frontmatter 只有 `name` 和 `description`（[graphify/skill.md#L1-L4](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/skill.md#L1-L4)）。
- **name 必須等於資料夾名**：platforms.toml 註解記錄，曾經 Windows 版取名 `graphify-windows` 導致 Claude Code 找不到技能（#1635）（[platforms.toml#L61-L65](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/platforms.toml#L61-L65)）。
- **description 怎麼寫才會被觸發**：先寫「什麼時候用」再寫「它做什麼」：「Use for any question about a codebase, its architecture, file relationships, or project content — especially when graphify-out/ exists, where the question should be treated as a graphify query first. Turns any input … into a persistent knowledge graph…」。且 description「每個平台逐字保留」，不讓產生器亂改（[platforms.toml#L19-L20](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/platforms.toml#L19-L20)）。
- **何時「不要」用**：技能本文明寫「若只是一次性查『X 定義在哪』，直接 grep 比建圖快且免費」（[graphify/skill.md#L50-L52](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/skill.md#L50-L52)），避免技能被過度觸發。
- **資料夾結構**：`SKILL.md`（精簡核心）＋ `references/*.md`（按需載入，例如 extraction-spec 只在有文件要萃取時才讀）。腳本：不附 scripts/ 資料夾，所有動作呼叫已安裝的 `graphify` CLI 或 `python -c`（用 `graphify-out/.graphify_python` 記住正確的直譯器）。

### 支援哪些工具與安裝方式 —— **有**
- `platforms.toml` 有 16 個平台設定（我 grep `^\[platform\.` 計數）：claude、codex、windows、opencode、kilo、copilot、claw、droid、amp、agents、trae、kiro、pi、vscode、aider、devin。README 安裝表另列 Cursor、Gemini CLI、CodeBuddy、Hermes、Kimi Code、Google Antigravity、Trae CN（[README.md#L225-L250](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/README.md#L225-L250)）。
- 安裝：`uv tool install graphifyy` → `graphify install`（Claude Code）／`graphify install --platform codex`／`graphify cursor install`；專案範圍加 `--project`；`--platform agents` 寫到跨框架的 `~/.agents/skills/`。

### 可以直接借用到使用者「基礎架構」的檔案或段落
1. [tools/skillgen/platforms.toml#L1-L56](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/platforms.toml#L1-L56) —— 「各 AI 只寫差異」的設定格式。
2. [tools/skillgen/gen.py#L723-L744](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/gen.py#L723-L744) —— `check()`：比對產出檔與快照，訊息直接告訴你要跑哪個指令修。
3. [.pre-commit-config.yaml](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/.pre-commit-config.yaml) ＋ [ci.yml#L11-L47](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/.github/workflows/ci.yml#L11-L47) —— 本機與雲端兩道防漂移關卡。
4. [graphify/install.py#L871-L925](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/install.py#L871-L925) —— 往共用規則檔塞「自己負責的區段」而不破壞別人段落。
5. [tests/test_architecture_doc.py](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tests/test_architecture_doc.py) —— 文件提到的東西必須真的存在。
6. [graphify/always_on/agents-md.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/always_on/agents-md.md) —— 規則句型範本：「何時先查」「何時才讀原始檔」「改完要做什麼」「什麼情況可以跳過」「哪些 diff 是正常的、不要報」。
7. [extraction-spec.md#L20-L31](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/references/shared/extraction-spec.md#L20-L31) —— coverage 回報＋ EXTRACTED／INFERRED／AMBIGUOUS 三級信心，適合當巡檢 AI 的回報規範。
8. [core.md#L703-L709](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/tools/skillgen/fragments/core/core.md#L703-L709) —— Honesty Rules 短條列。
9. [.github/PULL_REQUEST_TEMPLATE.md](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/.github/PULL_REQUEST_TEMPLATE.md) —— 「Verification & Invariants」完成前驗證清單。
10. [graphify/report.py#L330-L392](https://github.com/Graphify-Labs/graphify/blob/59b5ab1151e031fb42e39cfc9a50bf96f2d57ae0/graphify/report.py#L330-L392) —— 巡檢報告「待確認／缺口」段落寫法。

**給你的最小落地建議（用 Claude Code 照做即可）**
```
ai-rules/
  fragments/core.md        # 共同規則（語言、資料庫、Firebase 部署禁區、完成前驗證）
  fragments/claude.md      # Claude 差異
  fragments/codex.md       # Codex 差異
  platforms.toml           # 各平台輸出到 CLAUDE.md / AGENTS.md
  gen.js  --check          # 仿 skillgen：產生 + 比對，pre-commit 與 GitHub Actions 都跑
patrol/
  daily.sh                 # graphify update . ; graphify check-update . ; 讀 GRAPH_REPORT.md
  check-rule-refs.js       # 仿 test_architecture_doc：規則檔提到的路徑/函式要存在
  REPORT.md                # 摘要 / 新鮮度 / 待確認 / 缺口 / 疑似重複 / 新舊衝突
```

---

## 關鍵字
graphify、graphifyy、知識圖譜、knowledge graph、程式碼地圖、codebase map、tree-sitter、AST、Claude Code skill、Codex、AGENTS.md、CLAUDE.md、always-on 規則、skillgen、單一事實來源、single source of truth、規則漂移、drift check、pre-commit、CI 防漂移、文件與程式碼同步、doc drift test、PreToolUse hook、git hook、巡檢、每日巡讀、GRAPH_REPORT、Knowledge Gaps、AMBIGUOUS、去重、dedup、MinHash、semantically_similar_to、新舊版本、archive 優先序、版本戳記、MCP server、工作記憶、LESSONS.md、Apache-2.0、Graphify Cloud
