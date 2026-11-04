# wshobson/agents — 一份 Markdown 原始檔、自動轉成 Claude Code／Codex／Cursor 等 7 種 AI 工具格式的「角色＋技能」外掛市集，附一支現成的「文件漂移巡檢」腳本
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：7e2fb55
> GitHub：https://github.com/wshobson/agents｜⭐ 42187｜授權：MIT（另有 2 個外掛標 Apache-2.0、2 個外部外掛為 Apache-2.0）｜主要語言：Python｜最近更新：2026-11-02

（所有 permalink 固定在 commit `7e2fb559cf4b824b27f1fec49fe88f7511066d26`。HEAD 這個 commit 本身的時間是 2026-10-30，訊息為 `fix: bump changed plugins and require version bumps in CI (#799)`；GitHub 顯示的 2026-11-02 最近推送，可能是其他分支，未確認。）

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** 這是一個「AI 角色（subagent）＋技能（skill）＋斜線指令（command）」的大型外掛市集。作者只用 Claude Code 的 Markdown 格式寫一次，再用 Python 轉接器（adapter）自動轉成 Codex、Cursor、OpenCode、Antigravity、GitHub Copilot、Pi 各自看得懂的格式。我自己數過：本地有 **92 個外掛資料夾、202 個角色、185 個技能、105 個指令**，市集清單另外列了 2 個外部外掛，總共 94 個（計算方式見第 4 節）。

**對你最有價值的不是那 202 個角色，而是這個專案「怎麼管自己」：**

1. **共用規則的寫法（你問的 GPT＋Claude 讀同一份規則）**：根目錄只有一份 `AGENTS.md`，`CLAUDE.md` 是指向它的 symlink（我用 `git ls-files -s` 確認 mode 是 `120000`，也就是 symlink）。Codex、Cursor 等工具直接讀 `AGENTS.md`，Claude Code 讀 `CLAUDE.md`，兩邊讀到的內容一模一樣，從結構上就不會出現「GPT 版規則」和「Claude 版規則」不一致的問題。而且它規定這份檔案只能當「目錄」，上限約 150 行，細節一律放到 `docs/`。
2. **每日巡讀的現成範本**：`tools/doc_gardener.py`（993 行 Python）就是你要的「巡讀整個專案、找漏掉的、重複的、新舊衝突的」腳本。它目前有 9 項檢查：規則檔超長、連結失效、文件裡寫的數量和實際不符、同名角色內容分岔（同一個角色被複製到好幾個地方後，各自改到不一樣），還有產出檔比原始檔舊等等。每一筆發現都附一行 `Fix:` 修正建議。你可以照它的架構，改寫成巡你自己倉儲系統專案的腳本。
3. **防新舊版本衝突的兩個做法**：(a) `grounded-vault` 技能：每頁文件開頭標註 `Fingerprint: git:<commit>` 和 `Monitored: <程式碼路徑>`，只要跑一次 `git diff`、不花任何 AI token，就能知道這頁文件是不是已經過期；過期的文件移到 `archive/`，不直接刪掉。(b) `check_version_bumps.py`：外掛內容有改、版本號卻沒跳，CI 就會擋下來。
4. **角色分工＋交接的現成範本**：`operating-kit` 的 `session-start`／`session-end` 兩個角色，搭配「單一狀態檔（STATE_DOC）」，每次開工先比對狀態檔和實際線上狀態，有落差就大聲喊 `MISMATCH`；收工時只改有變動的欄位。`conductor` 外掛提供 `tracks.md` 工作登記簿，用 `[ ]`／`[~]`／`[x]` 標進度，另外有一個唯讀的 `conductor-validator` 角色檢查登記簿和實際檔案是否一致。`agent-teams` 外掛則提供「一個檔案只能有一個負責人」的分工規則，以及「多位審查者的發現怎麼去重複」的合併規則。
5. **多個 AI 審查時不要互相重複**：它的 Claude 自動審 PR 設定（`.github/workflows/claude-code-review.yml`）明文要求 Claude「先讀其他 bot 的留言，不要重複 `coderabbitai` 或 `chatgpt-codex-connector`（也就是 Codex）已經提過的問題」。這正好就是「GPT 和 Claude 一起審，但不要講重複的話」的做法。

**跟你其他興趣的關係：** 這個專案跟網頁版試算表、比價／ERP、AI 影片沒有直接關係（有 `business-analytics`、`payment-processing`、`content-marketing`、`social-publishing` 等外掛，但都是寫給 AI 看的知識提示，不是可以直接跑的功能）。它是「AI 協作基礎架構」類別的重量級參考。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **根目錄授權是 MIT**（`LICENSE` 第 1–3 行：`MIT License / Copyright (c) 2024 Seth Hobson`）：https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/LICENSE
- **個人使用：** 完全可以。複製、修改、拿去自己的專案都沒問題。
- **公司商用：** MIT 也允許商用、修改、閉源再散布，唯一的條件是保留原作者的版權聲明和授權全文。如果你把它的檔案（例如 `doc_gardener.py` 或某個 SKILL.md）抄進自己的專案，在檔案開頭或專案的 `THIRD_PARTY_NOTICES` 放上 MIT 聲明就好。
- **例外要注意（我逐一檢查了每個外掛的 `plugin.json`）：**
  - 92 個本地外掛中，89 個標 `"license": "MIT"`；**`conductor` 和 `superself` 標 `Apache-2.0`**；`plugin-eval` 沒寫 license 欄位（我把它視為跟隨根目錄的 MIT，但這是推論）。`conductor/README.md` 第 125 行寫明它改編自 `gemini-cli-extensions/conductor`，用 Apache 2.0 授權。Apache-2.0 同樣可以商用，但要保留 NOTICE 和授權聲明，修改過的檔案也要註明有改過。
  - 市集裡 2 個外部外掛 `pensyve`（major7apps）和 `hol-guard`（hashgraph-online），程式碼不在這個 repo 裡，市集清單標的是 Apache-2.0。
- **有沒有付費版或閉源功能：** 在這個 repo 裡沒看到付費牆或閉源功能。`CONTRIBUTING.md` 第 36 行和第 57 行另外有「Commercial content and disclosure」「External and vendor plugins」兩節，規定外部廠商貢獻時必須揭露商業關係。要注意的是，使用這些外掛本身要付費給 AI 工具（Claude Code／Codex 訂閱或 API 費用），那是 AI 工具的費用，不是這個 repo 收的。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 內容格式 | Markdown＋YAML frontmatter（角色、技能、指令全部是 `.md`） |
| 工具程式 | Python（README 第 90 行要求 Python 3.12 以上），套件管理用 `uv`，lint 用 `ruff`，型別檢查用 `ty`，解析 YAML 用 `pyyaml`（`doc_gardener.py` 有 `import yaml`） |
| 前端／後端／資料庫 | **都沒有**。不是網頁服務，也不需要伺服器或資料庫 |
| 部署方式 | 以「外掛市集」的形式安裝到 AI 工具裡：Claude Code 用 `/plugin marketplace add wshobson/agents`，Codex 用 `codex plugin marketplace add wshobson/agents`。OpenCode、Antigravity、Copilot、Pi 要 clone 下來再跑 `make install-<工具>`（README 第 43–106 行） |
| 硬體／GPU | 不需要。唯一例外是附帶的 `tools/yt-design-extractor`（YouTube 截圖 OCR 小工具），選用的 EasyOCR 會裝約 2GB 的 PyTorch CPU 版（Makefile `install-easyocr`），跟主功能無關 |
| API Key | 使用外掛本身**不需要額外的 Key**，用的是你已經登入的 Claude Code／Codex 帳號。`plugin-eval` 的 LLM 評審層會用 `ANTHROPIC_API_KEY`（有設就從 API 帳號計費，沒設就用 Claude Code 登入，見 README 第 143 行）。每週評分報告可以選擇推到 Weights & Biases（`WANDB_API_KEY`，作者自己用） |
| 費用 | repo 本身免費。費用來自 AI 模型：`docs/authoring.md` 第 151–181 行寫 `fable` 等級（Claude Fable 5）「約為 Opus 的 2.6 倍實際成本」。其他實際金額未確認 |

---

## 4. 程式架構地圖

（計算方式：clone 後執行 `git ls-tree -r --name-only HEAD`，總共 1172 個檔案；角色數用 `ls plugins/*/agents/*.md | wc -l`＝202，技能用 `ls plugins/*/skills/*/SKILL.md | wc -l`＝185，指令用 `ls plugins/*/commands/*.md | wc -l`＝105，外掛資料夾用 `ls -d plugins/*/ | wc -l`＝92，市集項目用 Python 讀 `.claude-plugin/marketplace.json` 的 `plugins` 陣列＝94。數字跟 AGENTS.md 宣稱的一致。）

```
wshobson/agents/
├── AGENTS.md                 # 唯一手寫的共用規則檔（84 行，只當「地圖」）
├── CLAUDE.md -> AGENTS.md    # symlink，Claude Code 讀這個，內容 100% 相同
├── ARCHITECTURE.md           # 5 條不變式（單一事實來源、單一規則檔…）
├── README.md                 # 安裝方式（各工具一張表）
├── CONTRIBUTING.md           # 貢獻規則，含商業揭露規定
├── Makefile                  # make generate / validate / garden / test / check-version-bumps
├── .claude-plugin/marketplace.json   # 外掛登記簿（事實來源），94 筆
├── .agents/plugins/marketplace.json  # Codex 用的登記簿（由程式產生後 commit）
├── .cursor-plugin/  .cursor/rules/*.mdc   # Cursor 用（3 份手寫規則 .mdc）
├── plugins/                  # ★ 唯一的原始檔位置（92 個外掛）
│   └── <外掛名>/
│       ├── .claude-plugin/plugin.json   # 名稱、版本、授權
│       ├── .codex-plugin/plugin.json    # 由程式產生
│       ├── agents/<角色>.md             # 角色（subagent）
│       ├── skills/<技能>/SKILL.md (+ references/ assets/)
│       ├── commands/<指令>.md           # 斜線指令
│       └── hooks/ policies/ templates/  # 少數外掛才有
├── tools/
│   ├── adapters/             # 各工具的轉接器
│   │   ├── base.py           # frontmatter 解析、HarnessAdapter 抽象類別
│   │   ├── capabilities.py   # 各工具能力矩陣＋模型對照表 MODEL_ALIASES
│   │   ├── codex.py          # Markdown → Codex TOML、8KB 截斷分割、sandbox 推測
│   │   └── cursor.py opencode.py antigravity.py copilot.py pi.py
│   ├── generate.py           # make generate HARNESS=<x>
│   ├── validate_generated.py # 結構驗證（893 行）
│   ├── doc_gardener.py       # ★ 漂移巡檢（993 行，9 項檢查）
│   ├── check_agent_name_collisions.py   # 角色名稱重複檢查
│   ├── check_version_bumps.py           # 有改內容卻沒升版號就擋
│   └── tests/                # 12 個 test_*.py
├── docs/                     # 詳細文件（authoring.md 撰寫規範、harnesses.md 能力矩陣…）
├── evals/                    # 靜態評分快照
└── .github/workflows/        # validate.yml（每個 PR）、claude-code-review.yml、eval-report.yml（每週一）
```

**模型分配（我自己數 202 個角色的 `model:` 欄位）：** sonnet 70、opus 54、inherit 52、haiku 24、fable 2。有寫 `tools:`（限制可用工具）的角色只有 15 個，其餘預設可以用全部工具。同一個檔名出現在多個外掛的有 30 種，最多的是 `code-reviewer.md`（7 份），但 frontmatter 的 `name` 都加了外掛名前綴（例如 `comprehensive-review-code-reviewer`），避免互相覆蓋。

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置（permalink） | 實作重點 |
|---|---|---|
| 一份規則給所有 AI 讀 | [AGENTS.md#L1-L9](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/AGENTS.md#L1-L9)、[ARCHITECTURE.md#L5-L15](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/ARCHITECTURE.md#L5-L15) | 第 7 行：`AGENTS.md is the canonical context file…Claude Code reads it via CLAUDE.md, a symlink`。不變式 1：原始檔只在 `plugins/`，產出檔一律不准手改；不變式 4：每個檢查都要附修正提示；不變式 5：規則檔約 150 行上限，技能本文約 8KB 上限 |
| 為什麼規則檔要短 | [AGENTS.md#L82-L84](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/AGENTS.md#L82-L84) | 「這份檔是**地圖**，不是百科。」流程細節放在技能裡（需要時才載入），參考資料放在 `docs/`。一份肥大的 AGENTS.md 會擠掉任務本身的空間，也很快就過時 |
| 撰寫規範（跨工具） | [docs/authoring.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/docs/authoring.md) | 第 43–59 行「講動作不要講工具名」（寫「打開檔案」，不要寫「用 Read 工具」，因為 Codex 沒有 Read 這種工具名稱）；第 61–78 行 8KB 上限；第 80–88 行角色名稱要全域唯一；第 90–116 行 `$ARGUMENTS` 要當成資料包起來（防提示注入）；第 183–189 行「每改一次就升版號」 |
| Markdown → Codex 轉換 | [tools/adapters/codex.py#L398-L438](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/adapters/codex.py#L398-L438) | 角色轉成 `.codex/agents/<外掛>__<角色>.toml`；模型別名換成 GPT；`tools:` 只有 Read/Glob/Grep/WebFetch/WebSearch 時給 `sandbox_mode = "read-only"`，否則給 `workspace-write`；名稱撞到 Codex 內建的 `default`／`worker`／`explorer` 會發出警告 |
| 技能超過 8KB 自動切 | [codex.py#L195-L244](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/adapters/codex.py#L195-L244) | 依 `## ` 標題切段（會略過程式碼區塊裡的標題），塞不下的段落搬到 `references/details.md`，並在本文最後加一行指引；以 UTF-8 字元邊界切，中文不會被切爛 |
| Claude 工具名改寫成動作 | [codex.py#L105-L127](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/adapters/codex.py#L105-L127) | 用正規表示式把「the Read tool」之類換成動作動詞 |
| 模型對照表 | [tools/adapters/capabilities.py#L306-L400](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/adapters/capabilities.py#L306-L400) | `opus`→Codex `gpt-5.5`、`sonnet`/`haiku`→`gpt-5.4-mini`、`inherit`→`gpt-5.5`；Copilot 對到 Claude 原生 ID；別名不認得時退回 `inherit` 並發出警告（`resolve_model`，第 371 行起） |
| 漂移巡檢 | [tools/doc_gardener.py#L1-L21](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L1-L21)、[#L919-L929](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L919-L929) | 9 項檢查登記在 `CHECKS` 字典：`stale`、`context`、`frontmatter-yaml`、`links`、`codex-cap`、`marketplace`、`counts`、`agent-divergence`、`arguments`。可以用 `--check <名稱>` 單跑一項，`--strict` 有 warning 也回傳失敗 |
| 發現格式 | [doc_gardener.py#L100-L126](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L100-L126)、[#L932-L989](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L932-L989) | `Finding(kind, severity, path, message, fix)`；輸出時先列「各類型數量摘要」，再依 error→warning→info 排序，最後印總數 |
| 文件數字過期 | [doc_gardener.py#L716-L775](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L716-L775) | 用正規表示式抓 README/AGENTS.md 裡的「94 plugins」「202 agents」，跟實際用 glob 數出來的數字比，不一致就報 `STALE_COUNT`（error） |
| 重複內容分岔 | [doc_gardener.py#L669-L848](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L669-L848) | 同檔名角色先正規化（去掉 `name`/`model`、統一換行），再算 MD5 雜湊；同名但雜湊不同就報 `AGENT_BODY_DIVERGENT`。刻意保留的變體登記在 `INTENTIONAL_AGENT_VARIANTS` 白名單（第 78–94 行），白名單指到不存在的檔案也會報 `STALE_AGENT_VARIANT`，讓白名單本身不會過期 |
| 規則檔超長 | [doc_gardener.py#L44-L47](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L44-L47)、[#L415-L431](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L415-L431) | `AGENTS.md` 上限 150 行、`CLAUDE.md` 上限 200 行，超過就報 `CONTEXT_FILE_OVERSIZED` |
| 角色名稱重複 | [tools/check_agent_name_collisions.py](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/check_agent_name_collisions.py) | 讀出每個角色 frontmatter 的 `name`，重複就失敗；CI 用 `--fail-on-duplicates` 執行（validate.yml 第 111 行） |
| 升版號檢查 | [tools/check_version_bumps.py#L1-L40](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/check_version_bumps.py#L1-L40) | 比對 PR 和基底分支；外掛資料夾裡有檔案變動、`plugin.json` 的版本卻沒升，就失敗。lockfile 例外 |
| CI 品質關卡 | [.github/workflows/validate.yml#L105-L228](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/.github/workflows/validate.yml#L105-L228) | 每個 PR 和每次推上 main 都會跑：名稱唯一、版本升級、重新產生後比對有沒有漂移、`make validate STRICT=1`、`make garden`（有 error 就失敗） |
| Claude 自動審 PR | [.github/workflows/claude-code-review.yml#L88-L180](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/.github/workflows/claude-code-review.yml#L88-L180) | 10 項檢查清單＋回報規則；第 167 行要求不要重複其他 bot 已經提過的問題；`--allowedTools` 只開放 `gh pr comment`／`gh pr diff` 等唯讀加留言的指令 |
| 技能觸發詞檢查 | [plugins/plugin-eval/src/plugin_eval/layers/static.py#L63-L70](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/plugin-eval/src/plugin_eval/layers/static.py#L63-L70)、[#L175-L195](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/plugin-eval/src/plugin_eval/layers/static.py#L175-L195) | description 裡沒有「Use when／used when／Use PROACTIVELY／Trigger when／Auto-loads when」這類句型，就標 `MISSING_TRIGGER` |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| AGENTS.md「地圖式」規則檔＋CLAUDE.md symlink | [AGENTS.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/AGENTS.md) | 無 | 低 | 照它的段落（Map／Working in this repo／Quality gates／Why this file is short）改寫成你倉儲系統的版本；`ln -s AGENTS.md CLAUDE.md`。Windows 上 symlink 不好用的話，改用一個只有一行 `@AGENTS.md` 的 CLAUDE.md（這是 Claude Code 的匯入語法，屬於我的建議，這個 repo 沒有這樣用） |
| 漂移巡檢腳本 | [tools/doc_gardener.py](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py) | Python 3.12、pyyaml、`tools.adapters.base`（`WORKTREE`、`list_plugins`、`parse_frontmatter`） | 中 | 保留 `Finding`／`Report`／`CHECKS`／`main()` 骨架，自己寫 `parse_frontmatter`（約 20 行）；把檢查換成你要的：規則檔行數、文件死連結、「文件裡寫的數字 vs 實際」、同名規則／技能雜湊比對、文件 fingerprint 過期。可以叫 Claude Code「照這個骨架改寫成 Node.js」，因為你的專案是純 JS |
| 角色名稱重複檢查 | [tools/check_agent_name_collisions.py](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/check_agent_name_collisions.py) | 只用標準函式庫 | 低 | 118 行，改掃描路徑就能檢查 `.claude/agents/`、`.codex/agents/` 有沒有同名角色 |
| 升版號檢查 | [tools/check_version_bumps.py](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/check_version_bumps.py) | git | 低～中 | 改成「規則檔／技能有改，版本欄位就要升」，防止新舊版本混用 |
| grounded-vault 文件 fingerprint 規範＋檢查腳本 | [SKILL.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/documentation-standards/skills/grounded-vault/SKILL.md)、[references/details.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/documentation-standards/skills/grounded-vault/references/details.md) | git、Python 標準函式庫 | 低 | 每份說明文件開頭加 `> Fingerprint: git:xxxx`、`> Monitored: app.js, ...`、`> Status: Current`；每天跑 `git diff --stat <sha>..HEAD -- <monitored>`，有輸出就代表文件過期 |
| session-start／session-end 交接角色 | [session-start.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/operating-kit/agents/session-start.md)、[session-end.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/operating-kit/agents/session-end.md) | 無（有 `{{STATE_DOC}}`、`{{LIVE_CHECK}}`、`{{REPO_PATH}}` 佔位符） | 低 | 把 `{{STATE_DOC}}` 換成你的 `STATE.md`，`{{LIVE_CHECK}}` 換成 `firebase hosting:channel:list` 或打一下正式網址；GPT 和 Claude 開工都先跑 session-start |
| conductor 工作登記簿＋驗證角色 | [templates/tracks.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/conductor/templates/tracks.md)、[track-plan.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/conductor/templates/track-plan.md)、[conductor-validator.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/conductor/agents/conductor-validator.md) | 無（Apache-2.0） | 低 | 當成防漏的 backlog：每個任務一個資料夾（spec.md／plan.md／metadata.json），用 `[ ]`／`[~]`／`[x]` 標狀態；validator 檢查「登記簿說進行中，但 plan 裡沒有進行中的任務」這類不一致 |
| 多審查者去重複規則 | [multi-reviewer-patterns/SKILL.md#L41-L62](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/agent-teams/skills/multi-reviewer-patterns/SKILL.md#L41-L62) | 無 | 低 | GPT 和 Claude 各自巡讀後，用這 5 條規則合併：同一 file:line 同一問題就合併、嚴重度取高、建議互相衝突就兩個都列並註明來源 |
| 一檔一負責人規則 | [team-lead.md#L59-L64](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/agent-teams/agents/team-lead.md#L59-L64)、[parallel-feature-development/SKILL.md#L56-L90](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/agent-teams/skills/parallel-feature-development/SKILL.md#L56-L90) | 無 | 低 | 寫進 AGENTS.md：例如 `inventory.js` 歸 Claude、`ads/` 歸 Codex；共用檔由「主管角色」依序修改 |
| PR 自動審查 workflow | [claude-code-review.yml](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/.github/workflows/claude-code-review.yml) | GitHub Actions、`anthropics/claude-code-action`、`CLAUDE_CODE_OAUTH_TOKEN` | 中 | 把提示詞第 88–176 行的檢查清單換成你專案的規則，保留「不重複其他 bot」和「只開放唯讀＋留言工具」 |
| session-guard／ai-debt-detector 技能 | [session-guard](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/skill-forge-essentials/skills/session-guard/SKILL.md)、[ai-debt-detector](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/skill-forge-essentials/skills/ai-debt-detector/SKILL.md) | 無 | 低 | 直接放進 `.claude/skills/`；前者處理長對話「忘記規則」（超過 40 次工具呼叫就重新唸出規則），後者在 AI 說「完成了」之後檢查錯誤處理、虛構的套件、架構漂移 |
| 跨工具轉接器框架 | [tools/adapters/](https://github.com/wshobson/agents/tree/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/adapters) | Python、pyyaml | 高 | 只有在你要「一份技能同時發給 Claude 和 Codex」而且技能很多時才值得用；少量的話手動複製就夠了 |

---

## 7. AI／Claude 整合

- **原生就是 Claude Code 格式。** 原始檔用 Claude Code 的 agent／skill／command frontmatter，模型等級用 `fable`／`opus`／`sonnet`／`haiku`／`inherit`（ARCHITECTURE.md 第 90–101 行：Opus 負責架構、資安、審查；Sonnet 負責文件、測試、除錯；Haiku 負責快速、簡單的工作）。
- **GPT／Codex：** 由 `codex.py` 轉成 TOML 角色，模型對到 `gpt-5.5`／`gpt-5.4-mini`（capabilities.py 第 314–320 行，作者標註最後核對時間是 2026 年 7 月）。Codex 讀 `AGENTS.md`，技能本文超過 8KB 會被截斷，所以轉接器會先切好。
- **Prompt 放在哪：** 全部在 `plugins/<外掛>/agents/*.md`（角色的系統提示）、`skills/*/SKILL.md`、`commands/*.md`。CI 審查的提示詞寫在 `.github/workflows/claude-code-review.yml` 第 56–176 行。
- **MCP：** 能力矩陣（docs/harnesses.md 第 23–45 行）列出 7 種工具都支援 MCP。repo 裡的 `protect-mcp`、`review-agent-governance` 外掛透過 hooks 呼叫 `npx protect-mcp@…`，用 Cedar 政策攔下「AI 未經人類同意就合併 PR、發審查留言、改 CI 設定」。
- **Skills：** 185 個，遵循 Anthropic SKILL.md 規格，也可以用 `gh skill install wshobson/agents <技能名>` 或 `npx skills add wshobson/agents` 單獨安裝（README 第 76–83 行）。
- **Hooks：** 只有 2 個外掛有 `hooks.json`（`review-agent-governance`、`protect-mcp`，我用 `find plugins -name hooks.json` 確認）。
- **agent-teams 外掛只能在 Claude Code 用：** `team-review` 指令第 12 行要求設定 `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`，用的是 TeamCreate／SendMessage 等 Claude Code 實驗功能。
- **能不能換成 Claude：** 不用換，本來就是 Claude 優先。

---

## 8. 擴充方式與 API

- **新增外掛：** 在 `plugins/<名稱>/` 建立 `.claude-plugin/plugin.json`＋`agents/`／`skills/`／`commands/`，在 `.claude-plugin/marketplace.json` 加一筆，然後跑 `make generate-all`。名稱用小寫加連字號，禁止用 `__`（那是轉接器的命名空間分隔符號，見 AGENTS.md 第 26–31 行）。
- **新增工具支援：** 在 `tools/adapters/` 繼承 `HarnessAdapter`（base.py），實作 `emit_plugin`／`emit_global`，再到 `capabilities.py` 補上能力和模型對照。
- **新增巡檢項目：** 在 `doc_gardener.py` 寫一個 `check_xxx(report)` 函式，登記到 `CHECKS` 字典即可，介面非常簡單。
- **CLI：** `make generate HARNESS=<x> [PLUGIN=<p>]`、`make validate [STRICT=1]`、`make garden [STRICT=1]`、`make check-version-bumps [BASE=origin/main]`、`uv run --project plugins/plugin-eval plugin-eval score <技能路徑> --depth quick`（靜態評分不呼叫模型，作者說不到 2 秒）。
- 沒有 HTTP API。

---

## 9. 程式品質與風險

- **維護狀況：** 很活躍。HEAD commit 是 2026-10-30，CI 規則一直在加（例如這次加了版本號檢查）。CI 動作釘死在 commit SHA，並設定 `persist-credentials: false`，資安習慣不錯。
- **測試：** `tools/tests/` 有 12 個 `test_*.py`（我用 `ls tools/tests | grep -c '^test_'` 數的），`plugins/plugin-eval` 有 18 個測試相關 .py 檔。CI 還會實際安裝 OpenCode、Antigravity、Pi 這些工具，跑真實的 CLI 冒煙測試。我沒有執行任何測試（依安全規則只讀不跑）。
- **遙測：** 用 `grep -rniE 'posthog|telemetry|analytics\.|segment\.io|mixpanel'` 掃 `tools/` 和 `plugins/` 的 .py／.json／.sh，只在測試裡找到設定 `DISABLE_TELEMETRY=1`，沒找到主動回傳資料的程式。
- **已知的坑／風險：**
  1. **內容品質參差不齊**：202 個角色大多是「長篇專家人設提示詞」，很多是社群貢獻，`plugin-eval` 的 LLM 評審層作者自己也說「實驗性、沒有經過人工標註驗證」（README 第 143 行）。挑來用之前要自己讀過。
  2. **一次裝太多會塞爆上下文**：每個技能／角色的 description 都會被 AI 拿來判斷要不要觸發，全部安裝的話描述文字很多。這是一般性的推論，我沒有實測 token 數。建議只挑幾個外掛安裝。
  3. **hooks 執行時會用 `npx` 下載 npm 套件**（`evaluate.sh` 第 38 行 `npx protect-mcp@0.31.1`、`sign.sh` 第 18 行 `npx protect-mcp@0.7.4`），有版本鎖定，但還是有供應鏈風險；而且沒放政策檔時會「全部放行」（evaluate.sh 第 14–18 行）。
  4. **模型 ID 會過期**：`capabilities.py` 裡寫死 `gpt-5.5`、`claude-opus-4-8` 這類 ID，需要跟著官方更新。
  5. **agent-teams 依賴 Claude Code 的實驗功能**，Codex 無法使用。
  6. **Codex 8KB 截斷**：從 Codex 原生市集安裝時讀的是原始技能本文，超過 8KB 的部分會被 Codex 直接截掉（docs/harnesses.md 第 111–125 行）。
  7. 提示注入：作者在 authoring.md 第 90–116 行提醒，`$ARGUMENTS` 原樣插入時可能被注入指令，並寫了 `ARGUMENTS_UNFRAMED` 巡檢；但作者也說這「不是安全邊界」。

---

## 10. 跟其他專案組合的建議

- **跟 github/spec-kit 組合**（同資料夾另有資料包）：spec-kit 負責「專案憲法＋規格→計畫→任務」的流程；這個 repo 補上「每日漂移巡檢腳本」「session 開工／收工交接」「多 AI 審查去重複規則」。
- **跟 BMAD-METHOD、msitarzewski/agency-agents 這類「角色庫」組合**：角色可以從那邊挑，但「AGENTS.md 只當地圖、CLAUDE.md symlink、名稱全域唯一、一檔一負責人」這幾條治理規則，建議照這個 repo 的做法。
- **給你的具體「基礎架構」建議（A＋B＋C）：**

```
你的倉儲專案/
├── AGENTS.md            # ≤150 行：專案地圖＋硬規則＋誰負責什麼（仿 wshobson/agents AGENTS.md）
├── CLAUDE.md -> AGENTS.md
├── STATE.md             # 單一事實來源：目前版本、已部署版本、已知問題、下一步（給 session-start/end 用）
├── docs/                # 每份文件開頭有 Fingerprint / Monitored / Status（grounded-vault）
│   └── archive/         # 過期文件搬到這裡，不刪
├── tracks.md            # 工作登記簿 [ ] [~] [x]（conductor）
├── .claude/agents/      # session-start.md、session-end.md、patrol-reviewer.md（唯讀）
├── .claude/skills/      # session-guard、ai-debt-detector、multi-reviewer-patterns
└── tools/patrol.js      # 每日巡讀腳本（仿 doc_gardener.py 改寫成 Node）
```

  每天的流程：(1) 排程跑 `tools/patrol.js`（純程式、不花 token），找出過期文件、死連結、重複規則、數字對不上的地方；(2) 讓 Claude 和 Codex 各自以唯讀角色巡讀一次，輸出統一格式的發現；(3) 用 multi-reviewer-patterns 的合併規則去重複，寫進 `reports/patrol-YYYY-MM-DD.md`；(4) 收工時跑 session-end 更新 STATE.md。

---

## 11. 規則／角色／巡檢 檢查表

**共用規則怎麼寫：有**
- 檔案結構：根目錄只有一份手寫的 `AGENTS.md`，`CLAUDE.md` 是 symlink；Cursor 另外有 3 份 `.cursor/rules/*.mdc`（由 `tools/adapters/cursor_rules/` 手寫後複製過去）。沒有 `.ruler`，也沒有 constitution 檔。[AGENTS.md#L7](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/AGENTS.md#L7)、[ARCHITECTURE.md#L9](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/ARCHITECTURE.md#L9)
- 分層：「規則檔（地圖，≤150 行）→ `docs/`（參考資料，需要時才讀）→ 技能 `SKILL.md`（≤8KB）→ `references/`（更深入的資料）」，是依「漸進揭露」分層，而不是依「全域／專案／子資料夾」分層。子資料夾層級的規則檔：沒有（只有 Cursor 的 `.mdc` 用 `globs` 指定套用到哪些路徑，見 [020-agent-skill-authoring.mdc](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/.cursor/rules/020-agent-skill-authoring.mdc)）。
- 優先順序：沒有明文的優先順序規則；靠「只有一份」來避免衝突。
- GPT 和 Claude 讀同一份規則：**有**，方法就是 symlink。能力矩陣還列出 Codex 的 AGENTS.md 有 32 KiB 硬上限（[docs/harnesses.md#L23-L45](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/docs/harnesses.md#L23-L45)）。

**角色設計：有**
- 202 個角色，依外掛分類。跟巡檢、文件、審查相關、值得看的有：`team-lead`（fable，拆任務、指定檔案負責人、彙整結果）、`team-reviewer`（opus，只負責一個審查面向，輸出 file:line 格式）、`conductor-validator`（opus，唯讀驗證登記簿）、`comprehensive-review-code-reviewer`／`architect-review`（opus）、`docs-architect`（sonnet）、`session-start`／`session-end`／`prod-logs-health-check`（haiku）、`code-review-preshipment`（sonnet，最後給 SHIP／SHIP WITH FIXES／DO NOT SHIP 判定）、`context-manager`（inherit）。
- 可用工具：用 `tools:` 白名單，例如 team-reviewer 是 `Read, Glob, Grep, Bash, TaskList, TaskGet, TaskUpdate, SendMessage`（[team-reviewer.md#L1-L7](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/agent-teams/agents/team-reviewer.md#L1-L7)）。在 Codex 會轉成 sandbox_mode。
- 交接與誰向誰負責：team-lead 的生命週期是 Spawn→Assign→Monitor→Collect→Synthesize→Shutdown→Cleanup；隊員的計畫要送 `plan_approval_request` 給 lead 核准（[team-lead.md#L66-L92](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/agent-teams/agents/team-lead.md#L66-L92)、[team-communication-protocols/SKILL.md#L77-L108](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/agent-teams/skills/team-communication-protocols/SKILL.md#L77-L108)）。

**防漏：有**
- 任務追蹤：conductor 的 `tracks.md`＋每個任務的 `plan.md` 勾選清單，每個階段都有 Verification 區塊和 checkpoint commit（[track-plan.md](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/conductor/templates/track-plan.md)）。
- 完成前驗證：`deploy-with-verification`「線上確認新版在服務流量之前，絕不回報已上線」；`ai-debt-detector` 在 AI 宣稱完成時檢查；full-review 指令要求每個階段把結果寫到 `.full-review/` 檔案，下一階段從檔案讀，不靠對話記憶（[full-review.md#L8-L17](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/comprehensive-review/commands/full-review.md#L8-L17)）。
- 交接紀錄：session-end 只做「針對性修改」，最後回報每個欄位的「舊值→新值」（[session-end.md#L28-L62](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/operating-kit/agents/session-end.md#L28-L62)）。

**防重複：有**
- 重複角色名稱：`check_agent_name_collisions.py` 在 CI 擋下。
- 重複內容分岔：`doc_gardener.py` 的 `agent-divergence` 用雜湊比對同名角色。
- 重複發現：multi-reviewer-patterns 的 5 條合併規則；Claude CI 審查「不重複其他 bot 已經提過的問題」（[claude-code-review.yml#L161-L169](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/.github/workflows/claude-code-review.yml#L161-L169)）。
- Codex 技能和指令同名時，自動在指令後面加 `__command` 後綴（authoring.md 第 135–149 行）。
- 「重複規則」的語意比對（兩段話意思一樣但字不同）：**沒有**，它只做雜湊比對。

**防新舊版本衝突：有**
- 版本標記：每個外掛都有 `plugin.json` 的 `version`，CI 強制升版；`MARKETPLACE_VERSION_MISMATCH` 檢查登記簿和外掛的版本是否一致。
- 單一事實來源：只能改 `plugins/`，產出檔不准手改；CI 會重新產生一次再比對，有差異就失敗（validate.yml 第 207–220 行）。
- 變更提案／封存：新增外掛要先開 proposal issue，而且要在 PR 開之前得到維護者回覆（claude-code-review.yml 的提示詞有寫）；conductor 有 `tracks/_archive/`；grounded-vault 有 `archive/`，文件過期就搬過去並寫明原因。
- 過期偵測：`STALE_ARTIFACT`（產出檔比原始檔舊）、`STALE_COUNT`（文件裡的數字過期）、grounded-vault 的 fingerprint＋`git diff`、session-start 的 `MISMATCH` 比對。

**定期巡檢：部分有**
- 排程：`eval-report.yml` 有 `cron: '0 6 * * 1'`（每週一 06:00 UTC，台灣時間週一下午 2 點）跑全部外掛的靜態評分（[eval-report.yml#L19-L21](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/.github/workflows/eval-report.yml#L19-L21)）。`doc_gardener.py` 的說明寫它是「recurring drift detection」，但實際上是掛在 PR／push 時跑（validate.yml），**沒有每日排程**。heartbeat：沒有。hook：只有前面提到的 2 個治理外掛。
- 報告格式（照 `Finding.render()` 和 `main()` 的格式字串組出來的示意範例，不是實際執行的輸出）：

```
Summary:
  [error  ] STALE_COUNT              1
  [warning] AGENT_BODY_DIVERGENT     1

[error  ] STALE_COUNT              README.md: line 8 says 94 plugins, actual is 95
           Fix: Update the count to 95 (every mention, not just this line).
[warning] AGENT_BODY_DIVERGENT     plugins/a/agents/code-reviewer.md: `code-reviewer.md` has 3 copies in 2 different versions: a+b | c
           Fix: Reconcile the copies. If one is an intentional variant, add its (plugin, agent) pair to INTENTIONAL_AGENT_VARIANTS in tools/doc_gardener.py.

Totals: 1 error(s), 1 warning(s), 0 info.
```

- 驗證角色的報告格式：conductor-validator 的 `Status: PASS | FAIL | WARNINGS`＋勾選清單＋`[CRITICAL]/[WARNING]/[INFO]` 問題列表（[conductor-validator.md#L134-L178](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/conductor/agents/conductor-validator.md#L134-L178)）。

**Skill 寫法：有，而且規範清楚**
- 格式：frontmatter 只要 `name`＋`description`；`name` 必須等於資料夾名稱（agentskills.io 規格）；本文 ≤8KB；細節放在 `references/`，範本放在 `assets/`（[docs/authoring.md#L28-L39](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/docs/authoring.md#L28-L39)、[#L191-L204](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/docs/authoring.md#L191-L204)）。
- description 怎麼寫才會被觸發：一定要有「Use when …／Use this skill when …／Use PROACTIVELY when …／Use after …／Trigger when …／Auto-loads when …」其中一種句型；評分時列出 3 個以上具體情境（用逗號接 when／for／during…）會加分，出現 proactively 也會加分（[static.py#L463-L495](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/plugins/plugin-eval/src/plugin_eval/layers/static.py#L463-L495)）。好的範例：`grounded-vault` 的 description 用「Use when … when … or when …」列了三個情境。
- 腳本放哪：技能本身沒有專門的 `scripts/` 慣例。grounded-vault 把 `check_vault.py` 的完整程式碼寫在 `references/details.md`，讓使用者自己放到 `scripts/`；repo 層級的工具放在 `tools/`。
- 本文寫「動作」不寫「工具名」，這樣 Codex 才看得懂。

**支援哪些工具與安裝方式：有**
- Claude Code：`/plugin marketplace add wshobson/agents` → `/plugin install <外掛>@claude-code-workflows`
- Codex：`codex plugin marketplace add wshobson/agents` → `codex plugin add <外掛>@claude-code-workflows`（只有含技能的外掛；角色要走產生器路線）
- Cursor：加入 `.cursor-plugin` 市集後 `/plugin install`
- OpenCode／Antigravity／Copilot／Pi：clone 後跑 `make install-<工具>`
- 只裝單一技能：`gh skill install wshobson/agents <技能>`（需 GitHub CLI 2.90 以上）、`npx skills add wshobson/agents`
- 出處：[README.md#L12-L106](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/README.md#L12-L106)、[docs/harnesses.md#L111-L145](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/docs/harnesses.md#L111-L145)

**可以直接借用到你「基礎架構」的檔案或段落：**
1. `AGENTS.md`（整份當範本，特別是第 82–84 行「Why this file is short」）
2. `ARCHITECTURE.md` 第 5–15 行（5 條不變式，可以改寫成你的「專案憲法」）
3. `docs/authoring.md` 第 41–59 行（跨 AI 寫法）、第 80–88 行（名稱唯一）、第 90–116 行（輸入當資料）
4. `tools/doc_gardener.py`（巡檢骨架）、`tools/check_agent_name_collisions.py`、`tools/check_version_bumps.py`
5. `plugins/documentation-standards/skills/grounded-vault/`（文件 fingerprint＋archive＋index.md／log.md 範本）
6. `plugins/operating-kit/agents/session-start.md`、`session-end.md`
7. `plugins/conductor/templates/tracks.md`、`track-plan.md`、`track-metadata.json`、`plugins/conductor/agents/conductor-validator.md`
8. `plugins/agent-teams/skills/multi-reviewer-patterns/SKILL.md`、`parallel-feature-development/SKILL.md`（一檔一負責人）
9. `plugins/skill-forge-essentials/skills/session-guard/SKILL.md`、`ai-debt-detector/SKILL.md`
10. `.github/workflows/claude-code-review.yml`（Claude 審 PR，不重複 Codex 已經提過的問題）

---

## 關鍵字
wshobson/agents、claude-code-workflows、多工具外掛市集、multi-harness、plugin marketplace、AGENTS.md、CLAUDE.md symlink、單一事實來源、single source of truth、共用規則、Codex、GPT-5.5、Claude Code、Cursor、OpenCode、Copilot、subagent、角色、SKILL.md、技能、progressive disclosure、漸進揭露、8KB 上限、doc-gardener、漂移偵測、drift detection、巡檢、每日巡讀、STALE_COUNT、AGENT_BODY_DIVERGENT、名稱衝突、版本號升級、check_version_bumps、grounded-vault、fingerprint、archive、session-start、session-end、交接、handoff、conductor、tracks.md、team-lead、檔案負責人、file ownership、multi-reviewer、去重複、deduplication、code review、PR 自動審查、harness engineering、模型分級、MIT
