# mennanov/blockwatch — 把「這裡改了、那裡也要跟著改」寫成規則的跨檔案漂移檢查器（確定性、不靠 AI）

> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：5c4e451
> GitHub：https://github.com/mennanov/blockwatch｜⭐ 30｜授權：MIT｜主要語言：Rust｜最近更新：2026-11-04

本資料包所有 permalink 的前綴都是 `https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/`，以下簡寫為 `B/`（點進去時請把 `B/` 換成完整前綴；文中重要連結已寫完整網址）。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：blockwatch 是一支命令列工具（單一執行檔），你在程式碼、設定檔、文件的「註解」裡用 `<block ...>` 標籤圈出一段內容並寫上規則（例如「這段要跟 README 那段一模一樣」「這個清單不能重複」「改這段就一定要改那段」），之後每次 commit 或每天排程跑一次，只要有地方「漂移」（一邊改了、另一邊沒改，或新舊版本對不上），它就失敗並告訴你哪兩處不一致。**判斷是確定性的（字串／正規表示式比對），不靠 AI**，只有選用的 `check-ai` 驗證器才會呼叫模型。

**對你（多 AI 協作 + 每日巡讀）最有價值的地方**：

1. **「每日巡讀」裡最便宜、最可靠的第一關**：AI 巡讀會漏、會幻覺，blockwatch 不會。把「必須一致的事實」（版本號、角色清單、技能資料夾清單、共用規則段落、Firestore 欄位清單 vs 文件）用標籤綁起來，每天跑一次 `blockwatch`，零成本、幾秒鐘、結果固定。AI 巡讀員再去處理 blockwatch 抓不到的語意問題。
2. **AGENTS.md / CLAUDE.md 的「單一事實來源」範本**：這個 repo 自己就是範例——`AGENTS.md` 是唯一規則檔，`CLAUDE.md` 只是指向它的 symlink（git mode `120000`，我用 `git ls-tree HEAD AGENTS.md CLAUDE.md` 確認），讓 Codex 和 Claude 讀到同一份。
3. **防「新舊版本衝突」**：`same-as` 驗證器會在兩處內容不同時直接報錯（例如 `package.json` 的版本 vs 你 JS 程式裡的 `APP_VERSION` 常數 vs 說明文件），不需要 diff。
4. **防「重複」**：`keep-unique` 讓一個清單（規則編號、角色名、SKU 規則、價格表品項代號）不能出現重複行；`same-as-paths` 讓「文件裡列的技能清單」必須等於「實際存在的 skills 資料夾」。
5. **防「漏改」**：`affects` 讓「改了 A 段就必須同時改 B 段」（例如改了庫存資料結構，文件那段也得改），需要搭配 git diff。
6. **一份寫得很好的 Skill 範例**：`src/skill.md`（679 行）＋只有 14 行的「stub」SKILL.md，示範了「技能本體跟著工具版本走、專案裡只存一個會呼叫指令的小檔」這種防止技能過期的寫法——這正好解決你「哪個是新版、哪個是舊版」的問題。
7. 它支援 JavaScript、HTML、CSS、JSON、Markdown、YAML（你的倉儲系統是純 JS + Firebase，全部都在支援範圍內）。

**它不是什麼**：它不是多 AI 角色框架，沒有角色、交接、任務追蹤的設計；也不會「讀懂」文件內容去找語意上的重複（那要靠 AI 巡讀或 `check-ai`）。它是你基礎架構裡的「規則守門員／漂移偵測器」零件。

---

## 2. 授權白話

- **授權：MIT**（`LICENSE` 檔，Copyright (c) 2025 Renat；`Cargo.toml` 第 8 行也寫 `license = "MIT"`）。
  - [LICENSE](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/LICENSE)
- **個人使用**：完全自由，可以安裝、修改、放進自己的專案。
- **公司商用**：可以，包含閉源商用。唯一義務：如果你「散布」它的程式碼或修改版（例如把它的原始碼複製進你要賣的產品），要保留原本的版權聲明與 MIT 授權全文。只是在自己的 CI／電腦上執行它，沒有任何義務。
- **閉源／付費版功能**：在 repo 中沒看到付費版、企業版或功能閘門。唯一「要花錢」的是你自己選擇開啟的 `check-ai`（呼叫你自己的 OpenAI 相容 API，費用付給模型供應商）。
- **注意**：PyPI 上同名的 `blockwatch` 是**別的專案**，Python 安裝要用 `blockwatch-cli`（README 第 120–139 行、`pypi/pyproject.toml` 第 6–7 行都有說明）。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 語言 | Rust（edition 2024），單一 CLI 執行檔 |
| 主要套件 | `clap`（命令列）、`tree-sitter` + 各語言 grammar（找註解）、`markdown`（Markdown/MDX）、`toml_edit`、`regex`、`globset`／`ignore`（走訪檔案、遵守 `.gitignore`）、`mlua`（內嵌 Lua 5.4，給 `check-lua`）、`async-openai` + `tokio`（給 `check-ai`）。見 [Cargo.toml](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/Cargo.toml) |
| 前端／後端／資料庫 | 都沒有。純本機命令列工具，讀檔、輸出 JSON |
| 部署方式 | (1) 本機執行；(2) git pre-commit hook（`.pre-commit-hooks.yaml`）；(3) GitHub Actions：`mennanov/blockwatch-action@v1` |
| 安裝 | macOS/Linux：`brew install mennanov/blockwatch/blockwatch`；**Windows：** `powershell -ExecutionPolicy Bypass -c "irm https://github.com/mennanov/blockwatch/releases/latest/download/blockwatch-installer.ps1 \| iex"`；Python：`pipx install blockwatch-cli`；Rust：`cargo install blockwatch`（README 第 120–139 行） |
| 預編譯平台 | `dist-workspace.toml` 第 13 行：macOS（Intel/ARM）、Linux（x86_64/ARM64）、Windows x86_64 |
| 硬體／GPU | 不需要 GPU，一般筆電即可 |
| API Key | 預設**不需要**。只有用 `check-ai` 才需要 `BLOCKWATCH_AI_API_KEY`（可選 `BLOCKWATCH_AI_MODEL`、`BLOCKWATCH_AI_API_URL`）。預設模型 `gpt-5.4-nano`、預設網址 `https://api.openai.com/v1` |
| 費用 | 工具本身免費。`check-ai` 每個 block 一次 API 呼叫；nano 級模型單價本 repo 未寫，**未確認**。官方建議 hook 裡加 `--only-changed`，避免每次 commit 把所有 `check-ai` block 都送去模型 |
| 目前版本 | `Cargo.toml` 第 3 行 `version = "0.16.7"`；CHANGELOG 最新條目 `## [0.16.7] - 2026-11-04` |

---

## 4. 程式架構地圖

（我用 `git ls-tree -r --name-only HEAD` 列出全部檔案：共 324 個，其中 199 個在 `tests/`。`src/` 下所有 `.rs` 合計 48,254 行，指令：`find src -name '*.rs' | xargs cat | wc -l`。）

```
blockwatch/
├── AGENTS.md                 # 給所有 AI 的唯一規則檔（309 行）★ 值得借鏡
├── CLAUDE.md -> AGENTS.md    # symlink，讓 Claude Code 讀到同一份 ★
├── .agents/
│   ├── .claude-plugin/plugin.json      # Claude Code plugin 描述
│   └── skills/blockwatch/SKILL.md      # 14 行的 stub 技能 ★
├── .claude-plugin/marketplace.json     # 讓 /plugin marketplace add 可以安裝
├── blockwatch.toml           # 本專案自己的規則設定（用 [[block]] 綁檔案）★
├── .pre-commit-hooks.yaml    # 給別人用的 pre-commit hook 定義
├── .github/workflows/
│   ├── blockwatch.yml        # PR／push 時自我檢查
│   ├── trusted-checks.yml    # 每週一排程跑「需要網路」的檢查 ★ 巡檢範本
│   ├── rust.yml              # fmt / clippy / doc / test / coverage
│   └── release.yml, pypi.yml, codeql.yml, markdownlint.yml
├── scripts/
│   ├── check_language_count.lua        # check-lua 範例：README 宣稱語言數 = 清單項數
│   └── check_latest_gpt_nano_model.lua # check-lua 範例：預設模型是否為最新 nano
├── docs/
│   ├── agents.md             # 各 AI 工具的技能安裝位置 ★
│   ├── ci.md                 # hook / Actions / 只檢查變更 / 安全沙箱
│   ├── cli.md                # 所有參數、設定檔、報告格式、抑制違規（1000 行）
│   ├── symbols.md            # file#/path 指到 JSON key、Markdown 章節、JS 常數…
│   └── validators/*.md       # 8 個驗證器各自說明
├── src/
│   ├── main.rs               # 只呼叫 blockwatch::run
│   ├── cli.rs                # 整條流程（解析參數→找 repo 根→讀 diff→設定→走訪→驗證→輸出）
│   ├── flags.rs / settings.rs / config.rs   # 參數、設定合併、blockwatch.toml
│   ├── tag_parser.rs         # 解析 <block ...> 標籤（winnow）
│   ├── block_parser.rs       # 把註解變成 Block
│   ├── virtual_blocks.rs     # blockwatch.toml 裡 [[block]] 宣告的「虛擬區塊」
│   ├── diff_parser.rs        # 解析 unified diff
│   ├── language_parsers/     # 39 個語言模組 + mod.rs（ls 計數）
│   ├── symbols/              # file#/path 符號解析
│   ├── validators/           # affects, same_as, keep_sorted, keep_unique,
│   │                         # line_pattern, line_count, check_ai, check_lua
│   ├── report.rs / sarif.rs / explain.rs    # --verbosity 報告、SARIF、explain 指令
│   └── skill.md              # 給 AI 的完整技能本體（679 行）★
├── tests/                    # 20 個整合測試檔 + testdata
└── fuzz/                     # 模糊測試
```

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 整體流程 | [src/cli.rs#L41](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/cli.rs#L41)（`run`）；流程說明見 [AGENTS.md#L152-L271](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L152-L271) | 9 步：參數 → 找 repo 根並限制只能讀 repo 內檔案 → 讀 diff（只有 `--diff` 才讀 stdin）→ 合併 `blockwatch.toml` 與參數 → 走訪檔案（遵守 `.gitignore`）→ 各語言 parser 找註解並轉成 Block → 偵測每個 Block 需要哪些驗證器 → 執行 → 輸出 JSON／SARIF 到 stderr |
| 標籤解析 | [src/tag_parser.rs#L35-L113](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/tag_parser.rs#L35-L113)、[L207-L302](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/tag_parser.rs#L207-L302) | 用 winnow 解析類 HTML 的 `<block attr="...">`、`</block>`；反引號內的標籤文字不算（`code_span_len`）；看起來像標籤但格式錯誤會報 `MalformedTag`（exit 2），避免規則「靜悄悄失效」 |
| 註解 → 區塊 | [src/block_parser.rs#L12-L33](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/block_parser.rs#L12-L33) | 只看註解節點，所以標籤不會影響程式本身；支援巢狀與相鄰註解合併 |
| 語言註冊 | [src/language_parsers/mod.rs#L58-L80](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/language_parsers/mod.rs#L58-L80)（`LanguageParser` trait）、[L197](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/language_parsers/mod.rs#L197)（`language_parsers()`） | 大多用 tree-sitter；Markdown/MDX 用 `markdown` crate。加新語言 = 加一個模組 + 在這個函式註冊 |
| 驗證器註冊表 | [src/validators/mod.rs#L75-L89](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/mod.rs#L75-L89) | 8 個驗證器的 enum；**這段本身就有 `same-as` 標籤**，綁到 README 和 docs 的驗證器表格——作者用自己的工具防止文件漂移 |
| `same-as`（防新舊版本衝突的核心） | [src/validators/same_as.rs#L46-L80](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/same_as.rs#L46-L80) | 從 block 抽出「值」（每行，或 `same-as-pattern` 的 `value` 群組），跟目標比對；模式有 `sequence`／`set`／`single`／`subset`；格式有 `numeric`、`identifier`（`PreExistingFailure` = `pre-existing-failure`）、`flat`。**不需要 diff，全掃描就會抓到** |
| `same-as-paths` | 說明：[docs/validators/same-as.md#L181-L211](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/validators/same-as.md#L181-L211) | 文件中的清單必須等於某個 glob 實際找到的路徑（例如 `services/*/`），少列、多列都報錯。注意：被 `.gitignore` 排除的檔案不會被列出 |
| `affects`（防漏改） | [src/validators/affects.rs#L43-L80](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/affects.rs#L43-L80) | 只有在 diff 碰到 A 區塊而沒碰到目標 B 時報錯；單向，要雙向就兩邊都加；目標不存在（懸空參照）時即使沒改也會報 |
| `keep-unique`（防重複） | [src/validators/keep_unique.rs#L16-L118](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/keep_unique.rs#L16-L118) | 逐行（或依 regex 的 `value` 群組）找重複，報在第二次出現的那行 |
| `keep-sorted` | [src/validators/keep_sorted.rs#L55-L200](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/keep_sorted.rs#L55-L200) | 升／降冪、文字或數字排序 |
| `check-ai`（AI 語意檢查） | [src/validators/check_ai.rs#L22-L39](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/check_ai.rs#L22-L39)（system prompt、預設模型、環境變數）、[L257-L265](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/check_ai.rs#L257-L265)（user prompt、判定 OK）、[L304-L322](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/check_ai.rs#L304-L322)（`OpenAiClient::from_env`） | 每個 block 一次 chat completion，模型只要回 `OK`（或 `OK.`，不分大小寫）就算通過，否則把模型回覆當錯誤訊息；多個 block 用 Tokio 並行 |
| `check-lua`（自訂程式檢查） | [src/validators/check_lua.rs](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/check_lua.rs)（`BLOCKWATCH_LUA_MODE` 在第 23 行） | 腳本定義 `validate(ctx, content)`，回 `nil` 通過、回字串就是錯誤；`sandboxed`（預設，不能碰檔案/OS）、`safe`、`unsafe` 三種權限 |
| 設定檔虛擬區塊 | [src/virtual_blocks.rs#L20-L48](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/virtual_blocks.rs#L20-L48) | 不能（或不該）放註解的檔案（`package.json`、prompt 檔、AI 規則檔）可以在 `blockwatch.toml` 用 `[[block]]` 宣告：指向一個符號、一段 regex 匹配文字或整個檔案 |
| 技能輸出 | [src/cli.rs#L63-L69](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/cli.rs#L63-L69) | `blockwatch skill` 把編譯進執行檔的 `src/skill.md` 印出，並把 `{{version}}` 換成目前版本——技能永遠跟工具同版 |
| 違規輸出 | [src/cli.rs#L391-L403](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/cli.rs#L391-L403) | 依檔案分組的 JSON（LSP 診斷格式）寫到 stderr；`--format sarif` 給 GitHub code scanning |

**標記語法速覽**（摘自 README 第 43–80 行與 `src/skill.md`）：

```js
// app.js（JavaScript 用 // 註解）
// <block name="stock-statuses" same-as="docs/庫存規則.md:stock-statuses" same-as-pattern="'(?P<value>[a-z_]+)'">
const STATUSES = ['in_stock', 'reserved', 'shipped'];
// </block>
```

```markdown
<!-- docs/庫存規則.md（Markdown 用 HTML 註解） -->
<!-- <block name="stock-statuses" same-as-pattern="`(?P<value>[a-z_]+)`"> -->
- `in_stock`：在庫
- `reserved`：已保留
- `shipped`：已出貨
<!-- </block> -->
```

如果有人（或某個 AI）在程式碼加了 `returned` 但沒更新文件，執行 `blockwatch` 就會失敗，訊息像 README 範例那樣列出兩邊的值：`... disagrees with ...: [...] != [...]`。（上面是我依 README 語法改寫的例子，**未實際執行**。）

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

> 這個專案最值得「拿來用」的不是 Rust 程式碼，而是**整支工具本身（直接安裝執行檔）＋它的規則檔／技能檔寫法**。你用 Claude Code 組自己的工具時，建議把 blockwatch 當外部指令呼叫，而不是改寫它。

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 整支 CLI（當「漂移檢查器」零件） | [README.md#L120-L139](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/README.md#L120-L139) | 預編譯執行檔，無 | 低 | 安裝後在你的專案根目錄執行 `blockwatch`；在 Claude Code hook、GitHub Actions 或每日巡讀腳本中呼叫，解析 stderr 的 JSON |
| AGENTS.md + CLAUDE.md symlink 模式 | [AGENTS.md#L1-L4](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L1-L4) | git（Windows 需開啟 symlink 支援） | 低 | `ln -s AGENTS.md CLAUDE.md`；Windows 若不便用 symlink，改用下面第 11 節的 `same-as` 整檔比對 |
| AGENTS.md 的規則分類骨架 | [AGENTS.md#L31-L123](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L31-L123) | 無 | 低 | 照它的分段：寫作風格／讀改程式／何時問人類／寫註解／寫測試／commit 規則，換成你的倉儲系統內容 |
| 「產品 vs 指引」分界段落 | [AGENTS.md#L273-L295](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L273-L295) | 無 | 低 | 明講「哪些檔案是給 AI 的規則、哪些是產品本身」「各 AI 的本機設定資料夾不進 git，需要共享的一律寫進 AGENTS.md」——直接解決規則散落問題 |
| Stub 技能寫法 | [.agents/skills/blockwatch/SKILL.md](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/.agents/skills/blockwatch/SKILL.md) | Claude Code 的 `!` 指令前處理 | 低 | 你的技能若由某支腳本產生，專案內只放 stub，用 ``!`你的指令` `` 動態載入最新版，避免存到過期副本 |
| 技能「一致性測試」 | [tests/skill.rs#L9-L60](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/tests/skill.rs#L9-L60) | Rust 測試 | 中 | 概念可借：寫個小測試確認「stub 的 description = 本體的 description」「stub 內容 = 安裝說明中的範例」。用 JS 也能寫 |
| 每週排程巡檢 workflow | [.github/workflows/trusted-checks.yml#L1-L27](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/.github/workflows/trusted-checks.yml#L1-L27) | GitHub Actions | 低 | 把 cron 改成每天，就是「每日巡讀第一關」的雛形 |
| `blockwatch.toml` 的 `[[block]]` 範例 | [blockwatch.toml#L1-L53](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/blockwatch.toml#L1-L53) | 無 | 低 | 抄「版本號必須在 5 個檔案一致」（L17-L24）與「被跳過的檢查必須出現在排程 workflow」（L4-L12）兩段 |
| check-ai 的 prompt 設計 | [src/validators/check_ai.rs#L22-L25](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/check_ai.rs#L22-L25) | 任何 LLM | 低 | 「CONDITION + BLOCK，通過只回 OK，否則回一句可執行的錯誤」這種二元判官 prompt，可直接用在你自己的 AI 巡讀員 |
| check-lua 腳本範例 | [scripts/check_language_count.lua#L1-L19](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/scripts/check_language_count.lua#L1-L19) | blockwatch 內建 Lua | 低 | 例：檢查「規則檔宣稱有 N 個角色」與角色清單實際項數一致 |
| 標籤解析器 | [src/tag_parser.rs](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/tag_parser.rs) | Rust + winnow | 高 | 不建議拆；要在 JS 重做，可參考它「反引號內不算標籤」「疑似標籤但格式錯就報錯」兩個設計 |
| `same-as` 比對邏輯 | [src/validators/same_as.rs](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/same_as.rs) | Rust，2,983 行（`wc -l`） | 高 | 不建議拆；直接用執行檔 |

---

## 7. AI／Claude 整合

- **用哪些模型**：只有 `check-ai` 驗證器呼叫模型。透過 `async-openai` 走 OpenAI Chat Completions 格式，預設模型 `gpt-5.4-nano`（[check_ai.rs#L27-L31](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/check_ai.rs#L27-L31)）。作者甚至用一個每週排程的 `check-lua` 腳本去 models.dev 查「OpenAI 最新的 nano 模型是不是還是這個」（[scripts/check_latest_gpt_nano_model.lua](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/scripts/check_latest_gpt_nano_model.lua)）——這是「偵測設定過期」的好範例。
- **prompt 放在哪**：system prompt 是 `DEFAULT_SYSTEM_PROMPT` 常數（[L22-L25](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/check_ai.rs#L22-L25)），user prompt 由 `user_prompt()` 組成 `CONDITION:\n...\n\nBLOCK (formatting preserved):\n...`（[L257-L259](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/check_ai.rs#L257-L259)）。條件文字寫在每個 block 的 `check-ai="..."` 屬性裡。
- **能不能換成 Claude**：`BLOCKWATCH_AI_API_URL` 可以指向「任何 OpenAI 相容端點」（[docs/validators/check-ai.md#L42-L57](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/validators/check-ai.md#L42-L57)），網址是 base（程式自己會加 `/chat/completions`）。所以可以接 Anthropic 的 OpenAI 相容端點或 OpenRouter 之類的轉接服務，再把 `BLOCKWATCH_AI_MODEL` 設成 Claude 模型名。**本 repo 沒有 Anthropic 的範例或測試，Claude 是否能正確回 `OK`、端點網址細節都屬未確認**，請自行小量試跑。→ 整體分類：Claude Code 的技能／plugin 為「原生」支援；`check-ai` 改用 Claude 模型屬「可接」。
- **MCP**：沒有 MCP server（`git ls-tree` 檔案清單中沒有 MCP 相關檔案）。
- **Skills**：有，而且是本專案的「AI 整合」主軸：
  - 技能本體：[src/skill.md](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/skill.md)（教 AI：何時該加 block、哪種情況用哪個驗證器、怎麼放標籤、改到有 block 的檔案時的 6 條必守規則、怎麼驗證、怎麼接 hook/CI、怎麼安裝技能）。
  - Claude Code plugin：`.claude-plugin/marketplace.json` + `.agents/.claude-plugin/plugin.json` + `.agents/skills/blockwatch/SKILL.md`，安裝：`/plugin marketplace add mennanov/blockwatch` → `/plugin install blockwatch@blockwatch`（README 第 141–152 行）。
  - 其他工具：[docs/agents.md#L53-L70](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/agents.md#L53-L70) 列了 Cursor（`.cursor/rules/blockwatch.mdc`）、GitHub Copilot（`.github/copilot-instructions.md`）、Codex／通用（`AGENTS.md`，只加 description + 一句「Then run `blockwatch skill` and follow what it prints.」）。
- **隱私提醒**（[check-ai.md#L59-L73](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/validators/check-ai.md#L59-L73)）：block 內容會送到第三方；內容可做 prompt injection 騙模型回 OK；結果不可重現。官方建議剛導入時用 `severity="warning"`。

---

## 8. 擴充方式與 API

- **沒有程式 API／函式庫**：AGENTS.md 明講「blockwatch 是程式，不是函式庫」，`lib.rs` 只有 `run` 與 `count_rust_blocks`（給 `main.rs` 與 fuzz 用）是 `pub`（[AGENTS.md#L58-L73](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L58-L73)）。對外介面就是 CLI。
- **CLI 子指令**：`blockwatch`（檢查）、`blockwatch list`（所有 block 以 JSON 列出，適合做「規則盤點」）、`blockwatch explain FILE:NAME`（看某條規則實際抽到哪些值，防止「規則通過但其實寫錯」）、`blockwatch skill`（印技能）。
- **機器可讀輸出**：違規 → stderr JSON（或 `--format sarif`）；報告 → stdout（`--verbosity summary|full`）。Exit code：0 通過、1 有 error 違規、2 無法完成檢查（[docs/cli.md#L987-L997](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/cli.md#L987-L997)）。你的巡讀腳本可以用 exit code 分辨「規則被破壞」和「工具本身出錯」。
- **自訂規則**：
  1. `check-lua`：寫 Lua 腳本做任意判斷（例如「價格表每項成本 < 售價」）。
  2. `check-ai`：寫自然語言條件。
  3. `blockwatch.toml` 的 `[[block]]`：對不能加註解的檔案加規則，`target` 可用 glob（例如 `plugins/*/package.json#/version`）。
- **符號參照 `file#/path`**（[docs/symbols.md](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/symbols.md)）：可以直接指到 JSON key（`package.json#/version`）、**Markdown 章節**（`AGENTS.md#/AGENTS.md/共用規則`，最上層 `#` 標題也是路徑的一部分，見 [L216-L257](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/symbols.md#L216-L257)）、**JS/TS 的 const、function、class**（[L520-L560](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/symbols.md#L520-L560)）。注意：`module.exports`、解構賦值不是符號。
- **抑制違規**：`--suppress 檔案:區塊名:驗證器:雜湊`，或從 commit message 讀（`blockwatch-commit-msg` hook，`--suppress-from`）。被抑制的仍會被報告，只是不影響 exit code（[docs/cli.md#L472-L512](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/cli.md#L472-L512)）。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。CHANGELOG 有 41 個版本標題（`grep -c '^## \['`），最新 0.16.7 與 0.16.6 都是 2026-11-04、0.16.5/0.16.4 是 2026-11-03；最近一次 push 也是掃描當天。但 ⭐ 只有 30，基本上是單人作者（Renat Mennanov）專案，**巴士因子＝1**。
- **測試**：20 個整合測試檔（`ls tests/*.rs`），`src/` 與 `tests/` 中含 `#[test]` 或 `#[tokio::test]` 的行共 1,330 行（`grep -rc` 加總，約等於測試函式數）。CI 跑 `cargo fmt --check`、`clippy -D warnings`、doc、doc test、`cargo llvm-cov`（[rust.yml](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/.github/workflows/rust.yml)），另有 fuzz 與 CodeQL。AGENTS.md 甚至要求 AI 對新測試做 mutation testing。我沒有執行任何測試（依規定只讀不跑）。
- **資安／隱私**：
  - 所有檔案讀取經過 `FileSystemImpl`，限制在 repo 內，屬性中的路徑無法讀到 repo 外（AGENTS.md 架構第 2 點）。
  - `check-lua` 預設 `sandboxed`（無 OS／檔案存取）；官方提供「fork PR 用 sandboxed、可信任才 safe」的 workflow 範本（[docs/ci.md#L267-L300](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/ci.md#L267-L300)）。
  - `check-ai` 會把內容送到外部 API（見第 7 節）。
- **遙測**：我在 `src/` 用 grep 搜 `http|reqwest|telemetry`，命中處只有註解網址、測試資料字串，**沒看到遙測或回傳使用資料的程式**；唯一的網路程式是 `check-ai` 的 `async-openai`（以及 Lua 腳本若在 `safe/unsafe` 模式自行呼叫 curl）。
- **已知的坑**（README「Known Limitations」[L300-L309](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/README.md#L300-L309) + 我讀文件整理）：
  1. **刪掉 block 就等於刪掉規則，而且不會警告**。如果某個 AI 把標籤刪了，規則就沒了——必須靠 skill.md 的「Never delete tags」規則與人工 review（或用 `blockwatch list` 每天比對 block 數量，見第 11 節）。
  2. 有 block 的檔案必須是 UTF-8；UTF-16 會被跳過。中文內容用 UTF-8 沒問題，但中文 Markdown 標題當路徑是否完全正常**未實測**。
  3. 不支援的副檔名會被**靜默跳過**，「什麼都沒讀」看起來跟「全部通過」一樣 → 一定要加 `--verbosity summary` 看實際讀了幾個檔。
  4. `affects` 只在有 diff 時才會觸發；每日全掃描（無 diff）只能抓 `same-as`、`keep-unique` 等，抓不到 `affects`。
  5. 預設成功時**什麼都不印**；`same-as-paths` 不列 `.gitignore` 排除的路徑（很多人會把 `.claude/` 加進 .gitignore，這樣技能資料夾就比對不到）。
  6. 在 Markdown 的 `<!-- -->` 註解裡提到標籤文字會被當成真的標籤；要用反引號包起來。
  7. Windows 上 git symlink 預設可能變成純文字檔（這是 git 的通用行為，非本 repo 說明）。

---

## 10. 跟其他專案組合的建議

- **blockwatch（確定性守門）＋ 規則／技能框架（如同分類中的 OpenSpec、spec-kit、BMAD、anthropics/skills 等）**：框架負責「角色、流程、技能內容」，blockwatch 負責「這些檔案之間不准互相矛盾」。例：規格檔裡的需求編號清單 `same-as` 任務清單、技能索引 `same-as-paths` 技能資料夾。
- **blockwatch（第一關）＋ AI 巡讀員（第二關）**：每天先跑 `blockwatch --verbosity summary` 與 `blockwatch list`，把結果 JSON 丟給 Claude 或 Codex 巡讀員；巡讀員只需專注「語意重複、說法矛盾、哪份是最新」這類 blockwatch 做不到的事，而且可以把它發現的「應該要一致」的地方**轉成新的 blockwatch 規則**——規則越來越多，AI 巡讀要看的就越少、成本越低。
- **跟你的倉儲 App（JS + Firebase）**：
  - `firebase.json`、`firestore.rules`（無法加註解或不想加的檔案）用 `[[block]]` + `target-pattern` 或整檔 target。
  - 庫存狀態 enum、SKU 格式（`line-pattern='^[A-Z]{3}-\d{4}$'`）、倉位代碼清單（`keep-unique` + `keep-sorted`）。
  - 試算表專案（分類 01）的欄位定義 ↔ 匯入匯出程式的欄位清單，用 `same-as` 綁起來。
- **跟價格／ERP 專案（分類 02）**：成本計算公式常數（匯率、運費、手續費率）在程式與說明文件各寫一次時，用 `same-as` 搭配 `same-as-format="numeric"`。
- **跟影片腳本專案（分類 03）**：prompt 檔不能加註解時，用 `[[block]] target='prompts/xxx.md' target-pattern=...` 規範「品牌名」「禁用詞」（`line-pattern-forbidden`）。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫 —— **有（以單檔 + symlink 的形式）**
- 位置：[AGENTS.md#L1-L4](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L1-L4)、[CLAUDE.md](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/CLAUDE.md)（symlink）。
- 檔案結構：只有一份 `AGENTS.md`（「Every agent reads the same file」），`CLAUDE.md` 是 symlink。**沒有** `.ruler`、constitution、`rules/` 資料夾。
- 分層：**只有專案層**。沒有全域／子資料夾分層設計。不過 `same-as-paths` 的檔案 glob（例如 `crates/*/AGENTS.md`，見 [same-as.md#L181-L211](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/validators/same-as.md#L181-L211)）可以用來檢查「每個子資料夾都有自己的 AGENTS.md」。
- 優先順序：沒有寫衝突時的優先順序規則（未提供）。
- GPT（Codex）與 Claude 讀同一份：**有**，靠 symlink。docs/cli.md [L36-L45](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/cli.md#L36-L45) 還特別說明 blockwatch 遇到 symlink 只報一次（以 AGENTS.md 為準）。
- 另一個值得學的點：[AGENTS.md#L273-L295](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L273-L295) 規定 `.claude/`、`.cursor/`、`.gemini/`、`.windsurf/`、`.aider*` 等各 AI 本機設定**不進 git**，「未來的協作者需要知道的，都寫進這個檔案」——這就是單一事實來源原則。

### 11.2 角色設計 —— **沒有**
- 沒有定義多個 AI 角色、職責、交接或回報關係。AGENTS.md 只有「AI agent」與「human」兩方：AI 不准自己 commit（「A human reviews every change first」），遇到不清楚、或影響 UX／安全／效能的變更必須先問人並列出選項（[AGENTS.md#L75-L123](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L75-L123)）。這可直接當你所有角色共用的「人類把關」條款。
- 建議用法：把「巡讀員」「實作者」「文件維護者」等角色的 skill 都加上 blockwatch 技能（它的 description 會在「改到有 block 的檔案」時觸發），由 blockwatch 當所有角色共同遵守的機械規則。

### 11.3 防漏 —— **部分有**
- 任務追蹤（backlog／issue）：**沒有**。
- 完成前驗證：**有**。skill.md「Maintaining blocks」第 6 條與「Running and verifying」要求改完一定跑 `git diff --patch | blockwatch --diff`，失敗就修到通過；寫完規則要跑 `blockwatch explain` 確認抽到的值正確（[src/skill.md#L534-L594](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/skill.md#L534-L594)）。AGENTS.md 測試段要求「先寫會失敗的測試、mutation test、最後跑覆蓋率」才算完成（[L99-L115](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L99-L115)）。
- 防漏改：**有**，`affects` 驗證器（改 A 必改 B）。
- 交接紀錄：**沒有**專門設計；只有 CHANGELOG 規則（使用者可見的變更要在同一個 commit 寫進 `## [Unreleased]`，[AGENTS.md#L297-L309](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L297-L309)）。
- 另有一條很實用的「別人的錯不要亂修」規則：驗證時看到不是自己改壞的違規，「Otherwise leave it, and tell the user about it」（skill.md 同段）。

### 11.4 防重複 —— **有（限同一區塊內的逐行重複）**
- `keep-unique`：[keep_unique.rs#L16-L118](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/validators/keep_unique.rs#L16-L118)。可對「規則編號」「角色名」「技能名」清單用 regex 抽出 ID 判重。
- `same-as-paths`：讓「文件中的清單」= 實際資料夾，防止多列（已刪的舊技能還寫在索引）或少列。
- **限制**：它**不會**偵測「兩個檔案用不同文字講同一件事」這種語意重複，也不會合併重複規則。那一塊要交給 AI 巡讀（可以用 `check-ai`，但 `check-ai` 一次只看一個 block，看不到別的檔案）。

### 11.5 防新舊版本衝突 —— **有（這是它最強的地方）**
- 版本標記／單一事實來源：[blockwatch.toml#L17-L24](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/blockwatch.toml#L17-L24)——`Cargo.toml` 的版本號是唯一來源，README、docs/ci.md 兩處、docs/cli.md、setup.py 都必須包含同一版本（`same-as-mode = 'subset'`）。
- 技能防過期：技能本體編進執行檔，專案只放 stub，stub 每次載入都跑 `blockwatch skill`；文件明說「Don't save the output … A saved copy goes stale when blockwatch is upgraded」（[docs/agents.md#L53-L70](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/agents.md#L53-L70)）。
- 設定過期偵測：`latest-model` block + Lua 腳本每週檢查預設模型是否仍是最新（見第 7 節）。
- 「跳過的檢查不會被遺忘」：[blockwatch.toml#L4-L12](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/blockwatch.toml#L4-L12) 用 `same-as` 強制「設定中被 skip 的 block 清單」= 「排程 workflow 中 only_blocks 的清單」。
- 變更提案／封存：**沒有**（不是 spec 流程工具）。
- 漂移（drift）偵測：**有**，`same-as` 全掃描即可、不需 diff。

### 11.6 定期巡檢 —— **有（每週排程範本）**
- [.github/workflows/trusted-checks.yml#L1-L27](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/.github/workflows/trusted-checks.yml#L1-L27)：`cron: "17 6 * * 1"`（每週一 06:17 UTC）＋ `workflow_dispatch` 手動觸發，只跑需要網路的那個 block。註解說明為何用排程而非每個 PR：「結果可能在沒有 commit 的情況下改變」。
- skill.md 也建議「在 main 上定期跑一次不帶 diff 的全掃描作為安全網」（[src/skill.md#L596-L653](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/skill.md#L596-L653)）。
- hook：`.pre-commit-hooks.yaml` 提供 `blockwatch` 與 `blockwatch-commit-msg` 兩個 hook（[L1-L20](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/.pre-commit-hooks.yaml#L1-L20)）。
- **報告格式**（[docs/cli.md#L804-L830](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/cli.md#L804-L830)、[L870-L900](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/docs/cli.md#L870-L900)）：

  stdout 一行摘要：
  ```text
  blockwatch: mode=all, 34/240 files, 61 blocks (3 unchecked, 2 need --diff), 73 checks, 0 violations
  ```
  stderr 違規 JSON（節錄）：
  ```json
  {
    "fileA.py": [
      {
        "address": "fileA.py:a:affects:1d7a4c02",
        "code": "affects",
        "message": "Block fileA.py:a at line 1 is modified, but fileB.py:b is not",
        "severity": 1
      }
    ]
  }
  ```
- **改成你的「每日巡讀第一關」**（依官方範本改寫，台灣時間每天 06:17 = UTC 22:17；`blockwatch-action` 是否接受 `--verbosity` 參數**未確認**，只確認有 `only_blocks`、`only_changed` 兩個 input）：
  ```yaml
  # .github/workflows/daily-patrol.yml
  name: daily patrol
  on:
    schedule:
      - cron: "17 22 * * *"
    workflow_dispatch:
  permissions: { contents: read }
  jobs:
    blockwatch:
      runs-on: ubuntu-latest
      steps:
        - uses: mennanov/blockwatch-action@v1
  ```
  不想用 GitHub Actions 的話，在本機或 Claude Code 排程任務中執行：
  ```shell
  blockwatch --verbosity summary 2> patrol-violations.json
  blockwatch list > patrol-blocks.json   # 存下來，隔天比對 block 數有沒有變少（防「刪標籤＝刪規則」）
  ```
  然後讓 AI 巡讀員讀這兩個檔案＋`git log --since=yesterday`，產出中文日報。

### 11.7 Skill 寫法 —— **有（很好的範本）**
- SKILL.md 格式（[.agents/skills/blockwatch/SKILL.md](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/.agents/skills/blockwatch/SKILL.md)，14 行）：
  ```markdown
  ---
  name: blockwatch
  description: Use when a change touches something that another place must match, such as an enum and its docs, ... Also use it when a file you edit holds `<block ...>` tags, or `blockwatch.toml` points at it.
  allowed-tools: Bash(blockwatch skill)
  ---
  # blockwatch skill
  `blockwatch skill` prints the skill for the installed version:
  !`blockwatch skill`
  If its output is not shown above, run `blockwatch skill` ... If `blockwatch` is not installed, run `uvx --from blockwatch-cli blockwatch skill` instead.
  ```
- **description 怎麼寫才會被正確觸發**：以「Use when …」開頭，列**具體情境**（enum 與文件、常數與設定、兩個檔案寫同一個版本號、必須排序或不重複的清單），再加一個**看得到的檔案特徵**觸發點（檔案裡有 `<block` 標籤、或 `blockwatch.toml` 指到它）。不是寫「這是一個 linter」這種功能描述。
- `allowed-tools: Bash(blockwatch skill)` 只開放一條指令；``!`blockwatch skill` `` 讓 Claude Code 載入技能時就執行指令、把輸出嵌入（動態技能）。
- 技能本體結構（[src/skill.md](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/skill.md)）：使用時機（三種情境）→ 邊寫邊加 → 新專案流程 → **情境對照表「看到什麼 → 加什麼 → 為什麼」**（[L50-L71](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/src/skill.md#L50-L71)）→ 語法參考表 → 編輯時必守規則 → 驗證指令 → 接 CI → 安裝方式。開頭還有一句「When in doubt, leave it out」防止 AI 過度加規則。
- 資料夾結構：`.agents/skills/<name>/SKILL.md`（plugin 用）、使用者專案則建議 `.claude/skills/blockwatch/SKILL.md`。腳本：本技能不帶腳本，邏輯在執行檔裡。
- 技能一致性由測試保護：[tests/skill.rs#L9-L60](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/tests/skill.rs#L9-L60)（stub 的 description 必須等於本體；技能內不能含 block 標籤）。

### 11.8 支援的工具與安裝方式
| 工具 | 安裝 |
|---|---|
| Claude Code | `/plugin marketplace add mennanov/blockwatch` → `/plugin install blockwatch@blockwatch`；或手動放 `.claude/skills/blockwatch/SKILL.md` |
| Codex／通用 | 在 `AGENTS.md` 加 stub 的 description +「Then run `blockwatch skill` and follow what it prints.」 |
| Cursor | `.cursor/rules/blockwatch.mdc` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| 一句話安裝 | 把 README [L29-L37](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/README.md#L29-L37) 的 prompt 貼給任一 AI，它會自己安裝技能並幫專案加 block |

前提：本機要先裝好 `blockwatch` 執行檔（第 3 節）。

### 11.9 可以直接借用到你「基礎架構」的檔案或段落
1. `AGENTS.md` 整體骨架 + `CLAUDE.md` symlink（[AGENTS.md](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md)）：特別是 L31-L123「Rules for agents」與 L273-L295「哪些是產品、哪些是指引」。
2. `.agents/skills/blockwatch/SKILL.md`：當你所有角色的共用技能。
3. `blockwatch.toml` L4-L24：版本號單一來源、跳過清單與排程清單互綁。
4. `.github/workflows/trusted-checks.yml`：改成每日巡讀。
5. `src/validators/check_ai.rs` L22-L25：二元判官 prompt，可給你的 AI 巡讀員。
6. 以下是我依官方語法為你設計的起步規則（**皆未實際執行，請先用 `blockwatch explain` 驗證**）：

```toml
# blockwatch.toml（放在專案根目錄）
ignore = ['node_modules/**', 'dist/**']

# (A) Windows 不方便用 symlink 時：CLAUDE.md 必須與 AGENTS.md 逐行相同（整檔 target，無 pattern 時逐行比對非空行）
[[block]]
target = 'CLAUDE.md'
same-as = 'AGENTS.md'

# (B) App 版本號單一來源：package.json → 前端常數 → 說明文件
[[block]]
target = 'package.json#/version'
same-as = 'public/js/version.js#/APP_VERSION, docs/CHANGELOG.md:current-version'
same-as-mode = 'subset'
```

```markdown
<!-- AGENTS.md 中的角色／技能索引：必須等於實際的技能資料夾，不能重複 -->
<!-- <block name="skills-index" same-as-paths=".claude/skills/*/" same-as-pattern="(?P<value>\.claude/skills/[\w-]+/)" same-as-mode="set" keep-unique> -->
- `.claude/skills/daily-patrol/`：巡讀員
- `.claude/skills/inventory-dev/`：倉儲功能開發
- `.claude/skills/price-check/`：比價／成本計算
<!-- </block> -->

<!-- 共用規則編號不可重複 -->
<!-- <block name="rule-ids" keep-unique="^- (?P<value>R-\d{3})"> -->
- R-001：任何 AI 不得自行 commit，由人類審核
- R-002：改到含 `<block>` 的檔案，完成前必跑 `git diff --patch | blockwatch --diff`
<!-- </block> -->

<!-- 已廢棄的舊流程字眼不准再出現 -->
<!-- <block name="current-flow" line-pattern-forbidden="舊版出貨流程|v1 匯入"> -->
...
<!-- </block> -->
```
注意：`.claude/` 若被 `.gitignore` 排除，`same-as-paths` 會列不到（第 9 節坑 5）；且官方說明 `keep-unique` 搭配 regex 時是對 `value` 群組判重。

---

## 關鍵字
blockwatch、跨檔案漂移檢查、drift detection、cross-file sync、確定性檢查、deterministic linter、單一事實來源、single source of truth、AGENTS.md、CLAUDE.md、symlink、共用規則、AI 協作、每日巡讀、定期巡檢、scheduled check、GitHub Actions cron、pre-commit hook、same-as、affects、keep-unique、keep-sorted、line-pattern-forbidden、check-ai、check-lua、Lua 沙箱、SKILL.md、skill stub、Claude Code plugin、Codex、Cursor、Copilot、版本衝突、防重複、防漏改、blockwatch.toml、虛擬區塊、symbols、Markdown 章節參照、SARIF、Rust CLI、MIT 授權
