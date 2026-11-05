# AI 協作基礎架構範本：安裝說明

這個資料夾是「一份共用規則 + 角色 + 每日巡檢」的可直接安裝範本。設計說明與引用依據在上一層的 [00-blueprint.md](../00-blueprint.md)；各專案的原始資料在 [00-summary.md](../00-summary.md) 與同資料夾的資料包。

> 範本的寫法借自開源專案（出處見 blueprint 第 7 節）。**資料包是 2026-11-04 的快照**，Codex／Claude Code 的路徑、旗標可能已變；本檔標「未確認」的地方，動手前請以你安裝的版本（`--help`、官方文件）為準。

## 檔案與安裝位置對照

| 範本檔案 | 裝到你專案的哪裡 | 改名 |
|---|---|---|
| `AGENTS.template.md` | 專案根目錄 | 改名 `AGENTS.md` |
| `CLAUDE.template.md` | 專案根目錄 | 改名 `CLAUDE.md` |
| `docs-conventions.md` | `docs/ai/conventions.md` | 改名 |
| `roles/*.md`（7 個） | `docs/ai/roles/` | 不改名 |
| `starter/INDEX.md`、`starter/TASKS.md`、`starter/handoff.md` | `docs/ai/` | 不改名 |
| `starter/DEC-0001-use-agents-md.md` | `docs/ai/decisions/` | 不改名 |
| `skills/daily-patrol/`（整個資料夾） | `.agents/skills/daily-patrol/` | 不改名 |
| （要自己建立） | `.claude/skills` → 指向 `.agents/skills`；`reports/`（巡檢報告） | — |

裝完的結構：

```
你的專案/
├── AGENTS.md                      ← 唯一規則正本（Codex 與 Claude 都讀）
├── CLAUDE.md                      ← 第一行 @AGENTS.md ＋ Claude 專屬補充
├── docs/ai/  INDEX.md  conventions.md  TASKS.md  handoff.md
│   ├── roles/      owner planner implementer reviewer doc-keeper patrol content-ads
│   └── decisions/  DEC-0001-use-agents-md.md
├── .agents/skills/daily-patrol/   ← 技能正本（SKILL.md、checks.md、report-template.md、scripts/、evals/）
├── .claude/skills → .agents/skills
└── reports/                       ← 巡檢報告（巡檢員唯一可以寫的地方）
```

## 安裝步驟（在你的專案根目錄執行；把 `$PACK` 換成這個範本資料夾的路徑）

```bash
PACK=/path/to/_oss-research/04-agent-rules-skills/templates

cp $PACK/AGENTS.template.md AGENTS.md
cp $PACK/CLAUDE.template.md CLAUDE.md
mkdir -p docs/ai/roles docs/ai/decisions .agents/skills reports
cp $PACK/docs-conventions.md docs/ai/conventions.md
cp $PACK/roles/*.md docs/ai/roles/
cp $PACK/starter/INDEX.md $PACK/starter/TASKS.md $PACK/starter/handoff.md docs/ai/
cp $PACK/starter/DEC-0001-use-agents-md.md docs/ai/decisions/
cp -r $PACK/skills/daily-patrol .agents/skills/

# 讓 Claude Code 讀同一份技能（macOS／Linux／Git Bash 或 WSL）
mkdir -p .claude && ln -s ../.agents/skills .claude/skills
```

然後：

1. 打開 `AGENTS.md`，把所有 `<填寫…>` 換成真實內容，並刪掉最上面的「安裝說明」註解；`CLAUDE.md` 也刪掉註解。`verified_against` 填 `git rev-parse --short HEAD`。
2. **你本人確認 R-001 到 R-010**（這是你的憲法，範例不一定符合你的做法），在 `docs/ai/handoff.md` 追加一筆「老闆決定：規則 v1.0.0 核准」。
3. 把 `docs/ai/INDEX.md` 和各檔案標頭的日期改成今天。
4. `.gitignore` 加：`CLAUDE.local.md`、`reports/.patrol-cursor`（cursor 是本機狀態）。報告要不要進 git 由你決定；巡檢員自己不會 commit。
5. 跑一次機械檢查，看看輸出（第一次會有一些 H4 佔位字串提醒，正常）：

```bash
bash .agents/skills/daily-patrol/scripts/mech-check.sh
```

需要 bash、awk、grep、find；有 git 時才會做交接缺口、秘密掃描與新舊判斷（沒有 git 會印 `CHECK-SKIPPED`）。Windows 請用 Git Bash 或 WSL。這支腳本是本範本自寫的，已用範例專案實測過常見情況，但**沒有在你的實際專案上跑過**；第一週請抽查它的發現是否正確。

### Windows 或不能用 symlink

`ln -s` 在 Windows 上常出問題（資料包 5-4 節也提醒 symlink 不適合拿來發布外掛）。替代做法：

- 用複製：`cp -r .agents/skills .claude/skills`。之後改技能要兩邊都改；`mech-check.sh` 的 D6 會在兩邊分岔時報 HIGH，就是為這個情況準備的。
- 或只把技能放 `.claude/skills/`，Codex 那邊也複製一份到 `.agents/skills/`。

## 在 Claude Code 怎麼放、怎麼叫

| 項目 | 位置／做法 |
|---|---|
| 規則 | 專案根目錄的 `CLAUDE.md`（第一行 `@AGENTS.md` 匯入）。**驗證有沒有讀到：** 開新對話問「AGENTS.md 的規則 R-001 是什麼？」答不出來就是匯入沒生效 |
| 技能 | `.claude/skills/<名稱>/SKILL.md`（專案層）；`~/.claude/skills/`（個人層） |
| 手動叫技能 | `/daily-patrol` |
| 角色 | 最簡單的做法：開對話時貼 `roles/owner.md` 裡的「起手式」，讓 AI 先讀 `AGENTS.md` 和自己的角色檔。進階：把角色檔複製到 `.claude/agents/<角色>.md`，在標頭另加 Claude 子代理需要的欄位（`name`、`description`、`tools`；`reviewer`、`patrol` 的 `tools` 只給 Read、Grep、Glob 與唯讀 Bash）。子代理看不到主對話，派工時要把路徑、限制與回報格式寫進去 |
| 排程 | 見下方「怎麼排程」 |

## 在 Codex 怎麼放、怎麼叫

| 項目 | 位置／做法 | 確認程度 |
|---|---|---|
| 規則 | 專案根目錄的 `AGENTS.md`，Codex 原生讀取；越靠近檔案的 `AGENTS.md` 越優先；**上限 32 KiB**（所以 AGENTS.md 要精簡） | 資料包一致（agents.md、rulesync、wshobson） |
| 專案層技能 | `.agents/skills/<名稱>/SKILL.md` | 資料包一致（openai/skills、OpenSpec、rulesync、ruler、spec-kit、BMAD） |
| 個人層技能 | **未確認。** 資料包有兩種說法：`~/.agents/skills/`（superpowers、rulesync、mattpocock）與 `~/.codex/skills`（openai 的 skill-installer、living-docs、pm-review-copilot、paperclip）。openai/skills 資料包指出該 repo 自己也前後不一致。本範本只用專案層，避開這個問題 | 未確認 |
| 手動叫技能 | 多數資料包寫 `$daily-patrol`；addyosmani 資料包寫 `@skill-name` | 說法不一，未確認，以 Codex 實際介面為準 |
| 角色 | 最簡單的做法同上（貼起手式）。進階：`.codex/agents/<角色>.toml`，欄位如 `developer_instructions`（放角色檔內文）、`sandbox_mode`（唯讀角色設 `read-only`）；其他欄位名稱未確認。**Codex 的角色權限只是預設值，不是硬隔離**，所以讓 Codex 當 reviewer／patrol 複查時，要在執行指令時指定唯讀沙箱 | 欄位名稱部分未確認 |
| `allowed-tools` | 在 Codex 只是文字建議，不會強制 | 資料包（openai/skills differences.md） |
| 隨附資訊檔 | `agents/openai.yaml`（`display_name`、`short_description`、`default_prompt`）是 Codex 的顯示資訊，Claude 會忽略；本範本沒附，需要再加 | 資料包 |

Claude Code 會不會也讀 `.agents/skills/`，openai/skills 資料包寫「未確認」，所以用 symlink 或複製讓 `.claude/skills` 也有一份。

## 怎麼排程

巡檢是兩段：①機械檢查（免費、不會幻覺）②AI 唯讀判讀＋另一個 AI 複查。建議頻率：**每天早上一次 incremental，每週一次 full**；進行大改動、要部署前再手動跑一次。台灣時間每天 06:17 = UTC 22:17。

守則（所有排程方式都要遵守，來自 docguard 的 `.jules/RULES.md`、paperclip、rulesync）：
- **新的排程先暫停，手動跑過兩三次、你確認報告有用，再啟用。**
- 排程裡的 AI 不准發問；沒有發現就安靜；任何一塊失敗整份標 `partial`。
- 同一時間只跑一個；只開唯讀權限。

### 方式 1：Claude Code 的排程任務（建議：最簡單）

Claude Code 有排程任務功能（資料包 spec-kit、centminmod 只提到「可以用排程任務每天跑」，**設定步驟資料包沒涵蓋，請依官方文件**）。排程提示詞：

```
使用 daily-patrol 技能，模式 incremental（週一用 full）。只寫 reports/ 底下的報告，不改其他檔案。
不要發問；不確定就標「待你確認」。完成後只回報報告路徑、各嚴重度數量與「需要你決定」的標題。
```

在 Claude Code 對話中也可以用 `/loop`（ECC 的 autonomous-agent-harness 教的做法，適合你人在電腦前、盯著跑；關電腦就停）。

### 方式 2：電腦的系統排程 + 指令列

macOS／Linux 用 cron，Windows 用「工作排程器」。ECC 的資料包示範用 `cd 專案 && claude -p "…"`；spec-kit 的 Codex 整合用 `codex exec` 非互動執行。

```bash
# crontab -e（台灣時間 06:17 每天；電腦要開著且已登入）
17 6 * * * cd /path/to/專案 && claude -p "使用 daily-patrol 技能，模式 incremental。只寫 reports/，不改其他檔案，不要發問。" >> /tmp/patrol.log 2>&1
```

- 限制工具與權限的旗標（例如只允許 Read／Grep／Glob／唯讀 Bash 加上寫 `reports/`）：**資料包沒涵蓋，請查 `claude --help`**。原則是「除了 reports/ 以外都不能寫」。
- Codex 複查（centminmod 的做法是以 `codex exec -s read-only --json` 唯讀沙箱執行；唯讀沙箱不能寫檔，所以讓它把「複查結果」印到標準輸出，再由你或腳本接到報告最下面）：

```bash
codex exec -s read-only "使用 daily-patrol 技能的 verify 模式，複查 reports/patrol-$(TZ=Asia/Taipei date +%F).md，只輸出『複查結果』一節。" > /tmp/verify.md
```

（旗標以 `codex exec --help` 為準；資料包只確認 `codex exec`、`-s read-only` 與 `--json` 這幾個。）

### 方式 3：GitHub Actions（只跑機械檢查最安全）

blockwatch 的資料包示範過排程寫法（`on: schedule` + `workflow_dispatch`）。下面這份只跑 `mech-check.sh`、不需要任何 API 金鑰、權限唯讀，把輸出存成可下載的檔案：

```yaml
# .github/workflows/daily-patrol.yml
name: daily patrol (mechanical)
on:
  schedule:
    - cron: "17 22 * * *"   # UTC 22:17 = 台灣 06:17
  workflow_dispatch:
permissions:
  contents: read
jobs:
  mech-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0     # 需要完整 git 紀錄，交接缺口與新舊判斷才算得出來
      - name: run mech-check
        run: bash .agents/skills/daily-patrol/scripts/mech-check.sh > patrol-mech.tsv
      - uses: actions/upload-artifact@v4
        with:
          name: patrol-mech
          path: patrol-mech.tsv
```

- 要讓 AI 在 Actions 裡跑完整巡檢，需要 API 金鑰存成 repo secret，並用官方的執行方式；**資料包沒有可驗證的做法（centminmod 只示範 `@claude` 留言觸發），本範本不提供**。建議先用方式 1 或 2 跑 AI 判讀。
- GitHub 的排程 workflow 只會在預設分支執行；公開 repo 長時間沒有動靜時，GitHub 可能自動停用排程（這是 GitHub 的一般行為，不是資料包內容，請自行確認現況）。

### 方式 4：在 Codex 內排程

openai/skills 資料包的 Surface Map 把「要定時跑」歸為 Codex 的 automation（排程）。**具體設定步驟資料包沒有涵蓋，請查 Codex 官方文件**；做法同方式 1：提示詞用 `verify` 模式，並設定唯讀。

## 裝完後的驗證清單

- [ ] 在 Claude Code 與 Codex 各開新對話，問「AGENTS.md 的規則 R-001 是什麼？」，兩邊都答得出來
- [ ] `bash .agents/skills/daily-patrol/scripts/mech-check.sh` 可以跑完，結尾有 `# mech-check: …`
- [ ] 手動叫一次 daily-patrol，產生 `reports/patrol-日期.md`，且 `git status` 只多出 `reports/` 底下的檔案
- [ ] 用 `skills/daily-patrol/evals/triggers.json` 的句子各實測一次，記下命中率；沒被叫到的句子，回頭改 `SKILL.md` 的 `description`
- [ ] 故意製造三個問題（把一個任務標 done 但不填驗證結果、複製一條規則到 CLAUDE.md、刪掉某份被引用的文件），確認隔天的報告抓得到，再復原

## 日常維護

- 改規則：一律走 doc-keeper，升版本、寫變更紀錄、老闆核准（見 `docs/ai/conventions.md`）。
- 新增角色或技能：先想清楚跟既有的有沒有職責重疊（巡檢 D4 會檢查）；技能的 `name` 要等於資料夾名。
- 每個月看一次巡檢報告的「持續未處理」，太久沒人處理的問題，要嘛處理、要嘛請老闆明確回覆「不用處理」。
- 巡檢誤報太多就改 `checks.md` 的 D 部分與 `mech-check.sh` 的排除規則，不要放著不管（誤報多了，真問題也會被忽略）。
