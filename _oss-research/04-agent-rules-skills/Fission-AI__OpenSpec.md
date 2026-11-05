# Fission-AI/OpenSpec — 用「現行規格 + 變更提案 + 封存」讓多個 AI 不再新舊打架的規格驅動 CLI
> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：2bd5bc3
> GitHub：https://github.com/Fission-AI/OpenSpec｜⭐ 73913｜授權：MIT｜主要語言：TypeScript｜最近更新：2026-11-04

> 本資料包所有程式碼位置都以 commit `2bd5bc3be964404657439f538857fcdf550f7398` 為準。以下簡稱 `B` = `https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398`，但每個連結都寫成完整網址，可以直接點。
> 版本：`package.json` 寫的是 `1.16.0`（[package.json](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/package.json)）。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：OpenSpec 是一支裝在電腦上的指令列工具（CLI，`openspec`），它在你的專案裡建一個 `openspec/` 資料夾，把「系統現在應該怎麼運作」寫成 `specs/`（單一事實來源），把「打算怎麼改」寫成 `changes/<變更名>/`（提案、規格差異、設計、任務清單），做完後用 `archive` 把差異合併回 `specs/`、把整個提案搬進 `changes/archive/YYYY-MM-DD-<名稱>/` 封存。再替 Claude Code、Codex、Cursor 等 50 種 AI 工具各自產生同一套 SKILL.md／斜線指令，讓不同 AI 都照同一套流程、讀同一份規格。

**你最在意的「多個 AI 有秩序地合作」，它能解決的部分：**

| 你的痛點 | OpenSpec 給的解法 | 解得多完整 |
|---|---|---|
| 哪份是新版、哪份是舊版，AI 講的互相衝突 | `openspec/specs/` 是唯一的「現在真相」；任何修改都必須寫成 `changes/` 裡的差異（ADDED／MODIFIED／REMOVED／RENAMED），封存時由程式合併，合併前會檢查衝突 | 很完整（這是它的核心） |
| GPT（Codex）和 Claude 各講各的規則 | 兩邊裝的 skill 都去呼叫同一支 `openspec instructions` 指令，指令會把同一份 `openspec/config.yaml` 的 `context` 與 `rules` 注入給 AI | 完整（但只限「規劃與實作流程」，不是通用的 AGENTS.md） |
| AI 做一半漏東西 | `tasks.md` 勾選框由程式計數；封存時有未完成任務會擋下；`/opsx:verify` 產出 CRITICAL／WARNING／SUGGESTION 報告 | 中上 |
| 重複內容 | 同名需求重複 ADDED、大小寫或空白不同的「近似重名」會被擋；批次封存時偵測兩個變更改同一份規格 | 中（只管規格內的需求，不管一般文件） |
| 每天巡讀整個專案 | **沒有內建排程**。但有很多可以拿來組裝巡檢的零件：`openspec validate --all --strict --json`、`openspec status --all --json`、`openspec doctor --json`、`openspec update` 的「skill 版本漂移」偵測 | 需要自己組 |
| 每個 AI 角色該有什麼技能 | 沒有「角色／人格」設計，只有 12 個「流程技能」（探索、提案、實作、驗證、同步、封存…）。可以自己把技能分配給角色 | 需要自己設計 |

**對你倉儲／庫存網頁 App（純 JavaScript + Firebase）的具體用法：**
1. 在專案根目錄跑 `openspec init --tools claude,codex`，Claude 會拿到 `.claude/skills/openspec-*/SKILL.md` 和 `/opsx:*` 指令，Codex 會拿到 `.agents/skills/openspec-*/SKILL.md`（用 `$openspec-propose` 呼叫）。
2. 在 `openspec/config.yaml` 的 `context:` 寫你的技術限制（純 JS、不要引入框架、Firebase Firestore 結構、手機也要能用…），在 `rules:` 針對 specs／design／tasks 各寫幾條規則。
3. 每次要加功能（例如「進貨單匯入 Excel」「成本計算加運費」），讓其中一個 AI 跑 `/opsx:propose`，你看完計畫再讓另一個 AI 跑 `/opsx:apply` 實作，第三方用 `/opsx:verify` 驗收，最後 `/opsx:archive`。
4. 半年後誰要改「庫存扣減規則」，AI 會先讀 `openspec/specs/inventory/spec.md` 這份現行真相，而不是翻聊天紀錄或舊文件。

**重要更正（跟任務提示不同）**：提示說「它產生的 AGENTS.md 指令」——**目前版本已經不產生 AGENTS.md**。舊版會產生 `openspec/AGENTS.md` 並在 `CLAUDE.md`／`AGENTS.md` 插入 `<!-- OPENSPEC:START -->…<!-- OPENSPEC:END -->` 標記區塊；新版改成「每個工具一套 SKILL.md + `openspec/config.yaml` 注入」，升級時會**刪除** `openspec/AGENTS.md`、**只移除**你 CLAUDE.md／AGENTS.md 裡的標記區塊、保留你自己寫的內容。證據：
- [src/core/templates/index.ts#L1-L8](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/templates/index.ts#L1-L8)：註解寫「The old config file templates (AGENTS.md, project.md, claude-template, etc.) have been removed」。
- [src/core/legacy-cleanup.ts#L19-L28](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/legacy-cleanup.ts#L19-L28)：列出舊版會寫入標記的檔案 `CLAUDE.md`、`AGENTS.md`、`QWEN.md`…
- [docs/migration-guide.md#L9-L45](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/migration-guide.md#L9-L45)：「Configuration：`CLAUDE.md` with markers + `project.md` → Clean config in `openspec/config.yaml`」。
- 這個 repo 自己根目錄的 [AGENTS.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/AGENTS.md) 是 **0 位元組的空檔**（`git ls-tree` 顯示 blob `e69de29…`，即空檔）。

所以：**你自己的通用規則（AGENTS.md／CLAUDE.md）還是要自己寫**；OpenSpec 負責的是「規格與變更」這一層的單一事實來源。

---

## 2. 授權白話（個人使用？公司商用要注意什麼？有沒有閉源或付費版才有的功能？）

- **授權：MIT**（[LICENSE](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/LICENSE)，「Copyright (c) 2024 OpenSpec Contributors」；`package.json` 也寫 `"license": "MIT"`）。
- **個人使用**：完全自由，可以用、改、複製、拆零件。
- **公司商用**：也可以，包括放進你自己的商業工具、改名重新包裝、閉源。唯一義務是**在你散布的程式裡保留 MIT 授權聲明與著作權聲明**。如果你只是複製它的 SKILL.md 文字或 schema.yaml 指示到你自己的專案，建議在檔案開頭註明「改寫自 Fission-AI/OpenSpec（MIT）」，並附 LICENSE 文字。
- **SKILL.md 本身也標 MIT**：產生出來的每個 skill 前置資料都有 `license: MIT`（見 [skills/openspec-verify-change/SKILL.md#L1-L10](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L1-L10)）。
- **付費版／閉源功能**：在這個 repo 裡**沒有看到**付費功能開關或閉源模組。所有指令都在 `src/` 裡。README 有提到 `openspec.dev` 網站與「Stores（團隊共用規格庫，beta）」，但 Stores 的程式碼也在 `src/core/store/` 內、走 git，不需要帳號。是否未來有商業雲端服務：**未確認**。
- **遙測**：預設會送匿名使用統計（見第 9 節），不影響授權，但商用時要知道。

---

## 3. 技術棧與執行需求

| 項目 | 內容 | 依據 |
|---|---|---|
| 語言 | TypeScript（編譯成 ESM JavaScript） | [package.json](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/package.json) `"type": "module"` |
| 執行環境 | Node.js ≥ 22.12.0（npm 安裝時）；或官方「獨立二進位檔」不需要 Node | `engines.node`；CHANGELOG 1.16.0 說明 |
| 主要套件 | `commander`（指令列）、`zod`（設定驗證）、`yaml`、`@inquirer/prompts`（互動選單）、`chalk`／`ora`（終端機樣式）、`diff`、`picomatch`／`tinyglobby` | `dependencies` |
| 前端 | **無**。只有終端機介面；`openspec view` 是在終端機畫的「儀表板」（[src/cli/index.ts#L518-L519](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/cli/index.ts#L518-L519)、[src/core/view.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/view.ts)） | |
| 後端／伺服器 | **無**。全部是讀寫本機的 Markdown／YAML 檔 | |
| 資料庫 | **無**。資料就是 `openspec/` 底下的 `.md` 與 `.yaml`，用 git 版本控制 | [docs/team-workflow.md#L7-L13](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/team-workflow.md#L7-L13)「OpenSpec doesn't touch git」 |
| 部署 | 不用部署。安裝方式：`curl -fsSL https://openspec.dev/cli/install.sh \| sh`（mac／Linux）、PowerShell `irm https://openspec.dev/cli/install.ps1 \| iex`、`npm install -g @fission-ai/openspec@latest`、`brew install openspec` | [README.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/README.md) Quick Start |
| 硬體／GPU | 不需要 GPU，一般筆電即可 | |
| API Key | **OpenSpec 本身不呼叫任何 AI 模型、不需要 API Key**。AI 部分由你原本在用的 Claude Code／Codex 負責，費用就是你原本的 Claude／ChatGPT 訂閱或 API 用量 | `src/` 內沒有任何模型 SDK 依賴（`dependencies` 清單中無 openai／anthropic 套件） |
| 費用 | CLI 免費。README 建議用「高推理模型」（原文：Codex 5.5、Opus 4.7）做規劃與實作，這會吃比較多 token | README「Usage Notes」 |
| 網路連線 | 遙測送到 `https://edge.openspec.dev`；版本檢查會查 `https://registry.npmjs.org` | [src/telemetry/index.ts#L32](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/telemetry/index.ts#L32)、[src/core/version-check.ts#L17](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/version-check.ts#L17) |

**跟你的 Firebase 專案的關係**：完全不衝突。OpenSpec 只在你的專案多一個 `openspec/` 資料夾與各 AI 工具的設定資料夾（`.claude/`、`.agents/`），不會碰到 Firebase 設定，也不會被部署到網站上（建議在 `firebase.json` 的 `hosting.ignore` 加上 `openspec/**`、`.claude/**`、`.agents/**`，這是我的建議，非 OpenSpec 文件內容）。

---

## 4. 程式架構地圖

（數字由我自己用 `git ls-tree -r --name-only HEAD` 產生的清單計算：全 repo 共 1,312 個檔案；`src/` 下 216 個 `.ts` 檔、合計 51,803 行（`find src -name '*.ts' | xargs cat | wc -l`）；`test/` 下 234 個 `*.test.ts`、合計約 89,876 行。）

```
OpenSpec/
├── AGENTS.md                      ← 空檔（0 bytes），repo 本身的根規則刻意留空
├── README.md / README_OLD.md      ← 新版說明／舊版（含 AGENTS.md 流程）說明
├── package.json                   ← CLI 名稱 openspec，Node ≥22.12
├── bin/openspec.js                ← 指令進入點
├── schemas/spec-driven/           ← ★預設工作流程「schema」：產出物順序＋給 AI 的寫作指示
│   ├── schema.yaml                ←   proposal → specs → design → tasks → apply 的依賴圖與 prompt
│   └── templates/                 ←   proposal.md / spec.md / design.md / tasks.md 範本
├── skills/                        ← ★12 個 openspec-*/SKILL.md（從 src 範本產生，給 skills.sh 用）
├── src/
│   ├── cli/index.ts               ← 所有子指令註冊（init/update/list/view/validate/archive/status/instructions…）
│   ├── commands/                  ← 各子指令實作（validate.ts、workflow/instructions.ts、workflow/status.ts…）
│   ├── core/
│   │   ├── config.ts              ← ★支援的 AI 工具清單（50 項）與 skill 資料夾位置
│   │   ├── init.ts / update.ts    ← 安裝／更新 skills 與指令到各 AI 工具
│   │   ├── archive.ts             ← ★封存：驗證→檢查任務→合併規格→搬到 archive/
│   │   ├── specs-apply.ts         ← ★差異合併引擎（ADDED/MODIFIED/REMOVED/RENAMED、衝突偵測）
│   │   ├── validation/            ← ★validate 規則（SHALL/MUST、場景、長度、skip_specs…）
│   │   ├── parsers/               ← Markdown／需求區塊解析
│   │   ├── artifact-graph/        ← 產出物依賴圖、組合給 AI 的 instructions
│   │   ├── project-config.ts      ← ★讀 openspec/config.yaml（context / rules / operations）
│   │   ├── templates/workflows/   ← 12 個工作流程 skill 的原始文字（TypeScript 字串）
│   │   ├── command-generation/    ← 34 個工具轉接器，把同一份指令轉成各工具格式
│   │   ├── shared/                ← skill 產生、工具偵測、generatedBy 版本戳記
│   │   ├── legacy-cleanup.ts      ← 舊版 AGENTS.md／標記區塊清除
│   │   ├── profile-sync-drift.ts  ← 偵測「已安裝 skill」與「設定想要的」是否漂移
│   │   ├── change-metadata/       ← 每個變更的 .openspec.yaml 欄位定義
│   │   └── store/                 ← Stores（跨 repo 共用規格庫，beta）
│   ├── telemetry/                 ← 匿名遙測
│   └── utils/task-progress.ts     ← tasks.md 勾選框計數
├── openspec/                      ← ★這個 repo 用自己管理自己（最好的範例）
│   ├── config.yaml                ←   專案 context 與 rules 實例
│   ├── specs/                     ←   44 個現行規格（每個一個資料夾）
│   ├── changes/                   ←   3 個進行中的變更
│   ├── changes/archive/           ←   108 個已封存變更（2025-01-11 起到 2026-10-19）
│   └── work/AGENTS.md             ←   子資料夾層級的 AI 規則
├── test/AGENTS.md                 ← 子資料夾層級的 AI 規則（測試怎麼寫）
├── .agents/skills/                ← 維護者自己用的 4 個 skill（發版、寫文件、驗證文件）
├── docs/ / docs-lab/              ← 使用者文件（docs-lab 是新版文件草稿）
└── website/                       ← openspec.dev 網站（Next.js）
```

---

## 5. 核心功能怎麼實作

### 5.1 「現行真相 vs 變更提案」的資料夾設計
- 概念圖：[docs/concepts.md#L26-L50](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/concepts.md#L26-L50)。`specs/` = Source of truth；`changes/` = 每個變更一個資料夾，包含產出物與差異。
- 封存前後的樣子：[docs/concepts.md#L505-L560](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/concepts.md#L505-L560)。
- **重點**：AI 永遠不直接改 `specs/`，而是在 `changes/xxx/specs/<能力>/spec.md` 寫差異；所以兩個 AI 同時規劃不同功能也不會互相覆蓋，衝突只會在封存時、而且是在同一條需求上出現。

### 5.2 規格格式（給 AI 寫、程式能解析）
- 需求寫成 `### Requirement: <名稱>`，內文必須含 SHALL 或 MUST；每條需求至少一個 `#### Scenario:`（一定要 4 個 #），用 **WHEN**／**THEN**。
- 差異區段：`## ADDED Requirements`、`## MODIFIED Requirements`（必須貼完整的新版內容）、`## REMOVED Requirements`（要寫 **Reason** 與 **Migration**）、`## RENAMED Requirements`（`FROM:`／`TO:`）。
- 這些寫作規則直接寫在給 AI 的 prompt 裡：[schemas/spec-driven/schema.yaml#L50-L160](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/schemas/spec-driven/schema.yaml#L50-L160)。

### 5.3 差異合併引擎（防新舊版本衝突的關鍵）
位置：[src/core/specs-apply.ts#L167-L600](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L167-L600)，函式 `buildUpdatedSpec`。
- **合併前檢查**（[L257-L356](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L257-L356)）：同一區段重複的需求名稱、同一條需求同時出現在 MODIFIED 與 REMOVED、ADDED 與 RENAMED TO 撞名…全部直接報錯拒絕。
- **套用順序固定**：RENAMED → REMOVED → MODIFIED → ADDED（[L446](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L446)）。
- **過期提案偵測**（最值得學）：MODIFIED 時，如果現行規格裡某個場景在你的修改版裡不見了，就拒絕並提示「Refresh the change spec before archiving to avoid dropping scenarios」（[L534-L560](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L534-L560)）。白話：**別的 AI 已經在主規格加了新場景，你手上的舊提案沒跟上，系統不讓你用舊版蓋掉新版。**
- **近似重名偵測**：ADDED 一條只跟既有需求差大小寫或空白的名稱，會被當成「重複寫了一次」而拒絕，要求改用 MODIFIED（[L565-L590](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L565-L590)）。
- **已同步的重複套用 = 無動作**：內容完全一樣的 ADDED／MODIFIED、已經不存在的 REMOVED 都視為「早已同步」而跳過，不會重複寫入（同段註解 early-sync pattern）。

### 5.4 封存流程
位置：[src/core/archive.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/archive.ts) 的 `ArchiveCommand.execute`（L1296 起）。
1. 驗證（可用 `--no-validate` 跳過，但要確認，並印出時間戳警告）：[L1454-L1610](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/archive.ts#L1454-L1610)。
2. 數 `tasks.md` 未完成任務，有的話要你確認或加 `--yes`；JSON 模式直接回 `archive_tasks_incomplete` 錯誤碼：[L1615-L1650](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/archive.ts#L1615-L1650)。
3. 決定封存名稱 `YYYY-MM-DD-<名稱>`（已經有日期前綴就不重複加）：[L1655-L1665](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/archive.ts#L1655-L1665)。
4. 合併規格（5.3）→ 再驗證合併後的規格 → 搬資料夾。若某能力的最後一條需求被移除，必須在 `.openspec.yaml` 宣告 `retire_capabilities: true` 才會刪掉整份規格（[src/core/change-metadata/schema.ts#L24-L60](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/change-metadata/schema.ts#L24-L60)）。

### 5.5 validate 驗證指令
- 指令選項：[src/cli/index.ts#L641-L651](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/cli/index.ts#L641-L651)：`--all`、`--changes`、`--specs`、`--archived`（「檢查已封存變更的任務都完成，用於 pre-commit」）、`--strict`、`--json`、`--concurrency`。
- 規則常數：[src/core/validation/constants.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/validation/constants.ts)：Why 段落 50–1000 字元、Purpose ≥50 字元、需求內文 ≤500 字元、單一變更超過 10 個差異建議拆開、需求一定要有 SHALL/MUST 與至少一個場景、`skip_specs` 與實際檔案衝突…
- 驗證器類別：[src/core/validation/validator.ts#L51-L180](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/validation/validator.ts#L51-L180)（`validateSpec`、`validateChange`、`validateChangeDeltaSpecs`）。
- JSON 輸出格式（方便你寫巡檢腳本）：[docs/agent-contract.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/agent-contract.md) §4.3：`{ items:[{id,type,valid,issues:[{level,path,message}]}], summary:{totals:{items,passed,failed}} }`，有失敗時結束碼為 1。

### 5.6 共用規則注入（GPT 和 Claude 讀同一份）
- 設定檔欄位定義：[src/core/project-config.ts#L34-L63](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/project-config.ts#L34-L63)：`schema`（必填）、`context`（每次都注入）、`rules`（依產出物分：proposal／specs／design／tasks）、`operations.apply／archive.guidance`（實作與封存時的建議）。`context` 上限 50KB（[L248](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/project-config.ts#L248)）。
- 注入方式：AI 執行 skill 時會呼叫 `openspec instructions <產出物>`，程式把 `<project_context>`、`<rules>`、`<dependencies>`、`<template>` 包成一段給 AI：[src/commands/workflow/instructions.ts#L258-L285](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/commands/workflow/instructions.ts#L258-L285)。注意每段都附「Do NOT include this in your output」。
- 官方解釋與範例：[docs-lab/customize/project-config.md#L1-L80](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs-lab/customize/project-config.md#L1-L80)。重點一句：「rules 只會加在內建指示之上，不會取代」、「規則要短，太長反而讓輸出變差」。
- 實例：[openspec/config.yaml](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/openspec/config.yaml)（他們自己的跨平台路徑規則）。

### 5.7 產出物依賴圖（流程順序）
- [schemas/spec-driven/schema.yaml](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/schemas/spec-driven/schema.yaml)：`proposal`（requires: []）→ `specs` → `design`（L164）→ `tasks`（L199）→ `apply: requires [tasks], tracks: tasks.md`（[L268-L273](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/schemas/spec-driven/schema.yaml#L268-L273)）。
- `openspec status --change <名> --json` 會告訴 AI 哪個產出物 `ready`／`blocked`／`done`，第一個 ready 就是下一步（agent-contract §4.4）。這讓「下一個接手的 AI」不用猜進度。

### 5.8 多工具安裝
- 工具清單：[src/core/config.ts#L41-L107](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/config.ts#L41-L107)。我用 `grep -c "available: true" src/core/config.ts` 數到 **50 項**（含一個通用 `agents` 目標）。Claude Code 的 skill 放 `.claude/skills/`（L53）；Codex 放 `.agents/skills/`（L57，舊路徑 `.codex` 會遷移）。
- 斜線指令轉接器：`src/core/command-generation/adapters/` 有 34 個工具檔（不含 index.ts，用 `ls | grep -vc index` 數）。Claude 版範例：[adapters/claude.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/command-generation/adapters/claude.ts)，產生 `.claude/commands/opsx/<id>.md`。
- Codex 只用 skill、不產生 prompt 檔：[docs/supported-tools.md#L12](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/supported-tools.md#L12)；各工具呼叫寫法對照：[L32-L41](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/supported-tools.md#L32-L41)（Claude 用 `/opsx:propose`，Codex 用 `$openspec-propose`）。

### 5.9 Skill 版本戳記與漂移偵測（防「AI 拿到舊版指示」）
- 產生 skill 時在前置資料寫 `generatedBy: "<OpenSpec 版本>"`：[src/core/shared/skill-generation.ts#L160-L195](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/shared/skill-generation.ts#L160-L195)。
- 偵測時讀回這個版本，判斷 `needsUpdate`：[src/core/shared/tool-detection.ts#L75-L88](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/shared/tool-detection.ts#L75-L88)。
- 「已安裝的流程」與「設定要的流程」不一致：[src/core/profile-sync-drift.ts#L236-L260](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/profile-sync-drift.ts#L236-L260)。`openspec update` 會修正。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| specs／changes／archive 資料夾慣例 | [docs/concepts.md#L26-L50](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/concepts.md#L26-L50) | 無（純慣例） | 低 | 直接在你的專案建 `openspec/specs/`、`openspec/changes/`；就算不裝 CLI，也可以只拿這個資料夾規則寫進 AGENTS.md |
| 四段式提案範本 | [schemas/spec-driven/templates/](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/schemas/spec-driven/templates/tasks.md) | 無 | 低 | 複製 proposal／spec／design／tasks 四個 .md 當你的 AI 交接單格式 |
| 給 AI 的寫作 prompt | [schemas/spec-driven/schema.yaml](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/schemas/spec-driven/schema.yaml) | 無 | 低 | 每個 `instruction:` 區塊可整段搬到你的 skill；特別是 specs 的「規格是行為契約不是實作計畫」那段 |
| 差異合併引擎 | [src/core/specs-apply.ts#L167-L600](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L167-L600) | `src/core/parsers/*`、`utils/*`、chalk | 高 | 想在你自己的 Node 工具內做「規格合併」才需要；多數情況直接呼叫 `openspec archive --json` 比較省事 |
| 驗證規則表 | [src/core/validation/constants.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/validation/constants.ts) | 無 | 低 | 把門檻（Why ≥50 字、需求 ≤500 字、≤10 差異）改寫成你的巡檢規則或 lint |
| tasks.md 勾選框計數 | [src/utils/task-progress.ts#L55](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/utils/task-progress.ts#L55) | 無 | 低 | `TASK_LINE_PATTERN` 正規表示式可直接用在你的「AI 漏做清單」巡檢（支援縮排與 `1.` 編號清單） |
| config.yaml context／rules 注入 | [src/core/project-config.ts#L34-L63](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/project-config.ts#L34-L63)、[instructions.ts#L258-L285](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/commands/workflow/instructions.ts#L258-L285) | zod、yaml | 中 | 你可以做一個「規則 YAML → 注入每個 AI 的 prompt」的小工具，同一份 YAML 給 GPT 和 Claude |
| 12 個流程 SKILL.md | [skills/](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/README.md) | 需要 `openspec` CLI | 低 | `npx skills add Fission-AI/OpenSpec` 或 `openspec init` 安裝；也可以當寫 skill 的範本 |
| 驗收報告格式 | [skills/openspec-verify-change/SKILL.md#L164-L205](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L164-L205) | 無 | 低 | 你的每日巡檢報告可直接沿用 Completeness／Correctness／Coherence + CRITICAL／WARNING／SUGGESTION |
| 多變更衝突偵測（prompt） | [skills/openspec-bulk-archive-change/SKILL.md#L112-L145](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-bulk-archive-change/SKILL.md#L112-L145) | 無 | 低 | 「以檔案路徑為 key 建表，2 個以上變更碰同一份 → 衝突 → 去程式碼找證據決定誰算數」可直接改成你巡檢 AI 的步驟 |
| 新鮮上下文審稿員 | [.agents/skills/verify-openspec-docs/SKILL.md#L17-L49](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/.agents/skills/verify-openspec-docs/SKILL.md#L17-L49) | 支援子代理的 AI | 低 | 每日巡讀時開「沒看過寫作過程」的子代理，專抓事實錯誤與「重複解釋別頁已有的主題」 |
| 舊用語掃描測試 | [test/vocabulary-sweep.test.ts#L1-L48](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/test/vocabulary-sweep.test.ts#L1-L48) | vitest | 低 | 把「已淘汰的舊名詞」做成禁字表，巡檢時掃整個 repo，抓舊版殘留 |
| 文件與程式對帳測試 | [test/skills-docs-claims.test.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/test/skills-docs-claims.test.ts) | vitest | 低 | 文件裡寫的關鍵句用測試鎖住，文件被改舊就會失敗 |
| generatedBy 版本戳記 | [skill-generation.ts#L160-L195](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/shared/skill-generation.ts#L160-L195) | 無 | 低 | 你自己的每個 SKILL.md／規則檔都加 `metadata.version` 與 `generatedBy`，巡檢時比對 |
| 舊標記區塊清除 | [src/core/legacy-cleanup.ts#L563-L620](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/legacy-cleanup.ts#L563-L620) | utils/file-system | 中 | 用 `<!-- XXX:START -->…<!-- XXX:END -->` 管理「工具自動寫入 AGENTS.md 的區塊」，只動區塊、不動人寫的內容 |

---

## 7. AI／Claude 整合

- **用哪些模型**：OpenSpec 本身不呼叫模型；它產生檔案讓你的 AI 工具去讀。README 建議高推理模型（原文寫 Codex 5.5、Opus 4.7）。
- **prompt 放在哪**：
  - 工作流程 skill 原文：`src/core/templates/workflows/*.ts`（12 個工作流程 + feedback、project-root、store-selection 共用片段，我數到該資料夾 15 個 .ts 檔），編譯後輸出成 [skills/*/SKILL.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/README.md)。README 註明「不要手改，改範本後重新產生，`skillssh-parity.test.ts` 會檢查是否漂移」。
  - 產出物寫作指示：[schemas/spec-driven/schema.yaml](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/schemas/spec-driven/schema.yaml)。
  - 專案自訂：你的 `openspec/config.yaml`。
- **有沒有 MCP**：在 `src/` 裡沒有看到 MCP 伺服器實作（`dependencies` 也沒有 MCP SDK）。整合方式是「SKILL.md + 斜線指令 + CLI 的 `--json` 輸出」。
- **Skills**：有，遵循 Agent Skills 格式（`name`、`description`、`allowed-tools`、`license`、`compatibility`、`metadata`）。12 個 skill 名稱見 [src/core/config.ts#L3-L16](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/config.ts#L3-L16)。Claude 的斜線指令限制只能跑 `openspec` 指令（`allowed-tools: Bash(openspec:*)`）。
- **能不能換成 Claude**：本來就是 Claude 原生支援（Claude Code 是清單內正式工具，`--tools claude`）。也能同時裝 Codex：`openspec init --tools claude,codex`。
- **預設安裝的流程（core profile）**：`propose`、`explore`、`apply`、`update`、`sync`、`archive`（[src/core/profiles.ts#L14](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/profiles.ts#L14)）。要 `verify`、`bulk-archive`、`onboard`、`new`、`continue`、`ff` 需執行 `openspec config profile` 選擴充版再 `openspec update`。**你要做巡檢，記得把 `verify` 打開。**
- **維護者自己給 Codex 的 skill 介面設定**：[.agents/skills/release-openspec/agents/openai.yaml](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/.agents/skills/release-openspec/agents/openai.yaml)（`display_name`、`short_description`、`default_prompt: "Use $release-openspec …"`）——這是「同一個 skill 資料夾同時給 Codex 用」的寫法範例。

---

## 8. 擴充方式與 API

1. **專案設定** `openspec/config.yaml`：`context`、`rules.<產出物>`、`operations.apply/archive.guidance`（見 5.6）。
2. **自訂 schema**：`openspec schema init <名稱>` 或 `openspec schema fork spec-driven <新名稱>`，在 `openspec/schemas/<名>/schema.yaml` 改產出物、順序、範本（指令註冊於 [src/cli/commands/schema.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/cli/commands/schema.ts)）。例如你可以做一個「ad-campaign」schema：brief → 腳本 → 素材清單 → 上線檢查表。
3. **每個變更的中繼資料** `.openspec.yaml`：`schema`、`created`、`goal`、`affected_areas`、`skip_specs`、`retire_capabilities`（[change-metadata/schema.ts#L24-L60](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/change-metadata/schema.ts#L24-L60)）。
4. **機器可讀 API = CLI 的 `--json`**：完整欄位定義在 [docs/agent-contract.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/agent-contract.md)。巡檢腳本最常用：`list --json`、`list --specs --json`、`status --all --json`、`validate --all --json`、`doctor --json`、`show <spec> --type spec --json`。stdout 永遠只有一個 JSON 文件，錯誤統一用 `{severity, code, message, target?, fix?}` 格式。
5. **Stores（beta）**：把規劃放在獨立 git repo，多個程式 repo 共用（`openspec store setup/register/list/doctor`）。你如果有「倉儲 App」與「廣告工具」兩個 repo 但想共用一份商品／價格規則，可以考慮；beta 階段，先別急。
6. **新增 AI 工具**：在 `AI_TOOLS` 加一筆，必要時在 `command-generation/adapters/` 加轉接器。或直接用通用目標 `--tools agents`（寫到 `.agents/skills/`，[config.ts#L96-L107](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/config.ts#L96-L107)）。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。最後一個 commit 時間 2026-11-02（`git log -1`）；CHANGELOG 有 57 個 `## ` 版本標題；`openspec/changes/archive/` 有 108 個已封存變更，最新是 2026-10-19。版本 1.16.0。
- **測試**：234 個測試檔、約 9 萬行，比原始碼（約 5.2 萬行）還多；有跨平台（Windows 路徑）專門規範（[test/AGENTS.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/test/AGENTS.md)）。我沒有執行測試（安全規則禁止），通過與否：未確認。
- **CI**：`.github/workflows/` 有 ci、binaries、release-prepare、security；security 每週一排程跑（[security.yml#L13-L15](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/.github/workflows/security.yml#L13-L15)）。
- **遙測（隱私）**：預設開啟。只送指令名稱、版本、`surface: 'cli'`，並明確 `$ip: null`；第一次會先顯示告知，告知前不送（[src/telemetry/index.ts#L163-L190](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/telemetry/index.ts#L163-L190)）。關閉：`openspec config set telemetry.enabled false`，或環境變數 `OPENSPEC_TELEMETRY=0`／`DO_NOT_TRACK=1`；CI 環境自動關閉（[L78-L100](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/telemetry/index.ts#L78-L100)）。
- **已知的坑**：
  1. **場景一定要 `####`（4 個 #）**，寫成 3 個或用條列會「靜默失敗」（schema.yaml 原文寫 CRITICAL）。
  2. **MODIFIED 要貼完整需求**，只貼改動那幾行，封存時會遺失細節；漏貼場景會被擋。
  3. **追蹤狀態也會過期**：例如 [openspec/changes/add-tool-command-surface-capabilities/tasks.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/openspec/changes/add-tool-command-surface-capabilities/tasks.md) 建立於 2026-02-19，33 個任務全部未勾（我用 `grep -c "\- \[ \]"` 與 `grep -c "\- \[x\]"` 數），但 [src/core/command-surface.ts#L5-L34](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/command-surface.ts#L5-L34) 已經有 `skills-invocable` 這個能力類型（值的命名也與提案的 `adapter` 不同，程式是 `adapter-backed`）。是否已完整實作：未確認。**重點是 OpenSpec 不會自動發現「任務清單和程式碼脫節」，這正是你需要每日巡檢補上的。**
  4. **中文規格可以寫，但 SHALL／MUST 要保留英文**：驗證器檢查需求內有沒有 SHALL 或 MUST。官方多語系指南建議用 `openspec init --language "…"` 把語言指示寫進 `config.yaml` 的 context，並明說「保留 OpenSpec 結構標題與 SHALL/MUST 關鍵字為英文」（[docs/multi-language.md#L1-L57](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/multi-language.md#L1-L57)，指南內有「Chinese (Simplified)」範例；繁體中文可照抄改字）。
  5. 套件需要 Node 22.12+（1.16.0 起）；舊 Node 請用獨立二進位檔安裝。
  6. Stores 是 beta。
  7. `.gitignore` 把 `.claude/`、`CLAUDE.md`、`.codex/`、`.cursor/` 忽略（[.gitignore#L144-L168](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/.gitignore#L144-L168)）——這是**他們 repo 自己**的選擇，不代表你要照做；你的專案若要讓 Claude 在雲端／其他電腦拿到同樣 skill，應該把 `.claude/skills/` 提交進 git。

---

## 10. 跟其他專案組合的建議

（同分類其他資料包已在 `_oss-research/04-agent-rules-skills/` 內：github__spec-kit、bmad-code-org__BMAD-METHOD、msitarzewski__agency-agents、addyosmani__agent-skills、mattpocock__skills、affaan-m__ECC。以下組合是我的建議，各專案細節請看各自資料包。）

1. **OpenSpec（規格層）＋ 你自己的 AGENTS.md（規則層）**：最小可行架構。AGENTS.md 寫通用規則（語言、程式風格、禁止事項、誰負責什麼）；OpenSpec 管「功能長怎樣、改了什麼」。CLAUDE.md 只放一行指向 AGENTS.md（Claude Code 支援在 CLAUDE.md 用 `@AGENTS.md` 匯入，這是 Claude Code 的功能，非 OpenSpec 文件所述），避免兩份規則各自演化。
2. **OpenSpec ＋ BMAD／agency-agents（角色層）**：OpenSpec 沒有角色；把 BMAD 那類「PM／架構師／開發／QA」角色對應到 OpenSpec 技能：PM→`explore`＋`propose`、開發→`apply`、QA→`verify`、文件管理員→`sync`＋`archive`。
3. **OpenSpec vs spec-kit**：README 自己的比較說 spec-kit「徹底但重、階段關卡嚴格、Python 安裝」，OpenSpec 較輕（[README.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/README.md)「How we compare」）。二選一即可，不建議同一專案同時用兩套規格系統，否則就會出現你最怕的「兩份真相」。
4. **OpenSpec ＋ 巡檢 skill（自己寫）**：用第 11 節的範例，結合 `openspec validate/status/list --json` 與 verify-openspec-docs 的「新鮮上下文審稿員」寫法。
5. **對你的其他興趣**：試算表、比價、影片腳本專案都可以各自當成 OpenSpec 的一個「能力（capability）」來寫規格，例如 `specs/price-compare/spec.md`、`specs/ad-video-script/spec.md`，讓之後拼裝 A+B+C 時每塊的行為都有明確契約。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫
- **AGENTS.md／CLAUDE.md 產生：沒有（新版）**。舊版有，新版移除並提供清除（[legacy-cleanup.ts#L19-L28](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/legacy-cleanup.ts#L19-L28)、[migration-guide.md#L9-L45](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/migration-guide.md#L9-L45)）。理由（migration-guide 原意）：舊的 `project.md` 是被動的，AI 可能讀也可能不讀；新的 `config.yaml` 是**每次規劃請求都主動注入**，可靠度較高。
- **集中規則檔：有** — `openspec/config.yaml`（`context` 全域注入、`rules` 依產出物、`operations` 依操作）。[project-config.ts#L34-L63](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/project-config.ts#L34-L63)。
- **分層（全域／專案／子資料夾）：部分有**。
  - 全域：`openspec config` 管的使用者全域設定（profile、遙測、defaultStore；位置可用 `openspec config path` 查，實際路徑未確認），不放 AI 規則。
  - 專案：`openspec/config.yaml`。
  - 子資料夾：OpenSpec 不管；但這個 repo 自己示範了**根目錄 AGENTS.md 留空、在 [test/AGENTS.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/test/AGENTS.md) 與 [openspec/work/AGENTS.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/openspec/work/AGENTS.md) 放子資料夾規則**的分層做法（Codex 會讀巢狀 AGENTS.md，這是 Codex 的行為，非本 repo 文件所述）。
- **優先順序：有（限 OpenSpec 注入內容）** — 注入順序是 context → 參考規格 → rules → 依賴檔 → 範本；文件說使用者規則「加在內建之上、不取代」（[project-config.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs-lab/customize/project-config.md#L1-L80)）。`operations.guidance` 則明訂為「建議性、與內建流程衝突時不採用」（agent-contract §4.6）。
- **讓 GPT（Codex）和 Claude 讀同一份：有** — 兩邊的 skill 都呼叫同一個 CLI、讀同一份 `config.yaml` 與 `specs/`；不需要把規則複製兩份。[docs/supported-tools.md#L32-L41](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/supported-tools.md#L32-L41)。

### 11.2 角色設計
- **角色／人格：沒有**。沒有「PM／QA」這類 persona 檔。
- **流程技能（可當角色職責）：有，12 個**（[config.ts#L3-L16](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/config.ts#L3-L16)）。我建議的對應（我的整理）：

| 建議角色 | 用哪些 OpenSpec 技能 | 職責 | 適合給誰 |
|---|---|---|---|
| 規劃者 | `openspec-explore`、`openspec-propose`（或 new／continue／ff） | 先讀現行 specs、寫 proposal／delta specs／design／tasks；**不寫程式**（explore 明確是「先想再做」） | GPT／Codex 或 Claude 擇一 |
| 實作者 | `openspec-apply-change`、`openspec-update-change` | 照 tasks.md 逐條實作、做完打勾；遇到阻礙暫停（schema `apply.instruction`） | Claude Code |
| 驗收者 | `openspec-verify-change` | 產出驗收報告，**不實作、不封存**（verify skill 第 3 步原文） | 跟實作者**不同**的那個 AI |
| 檔案管理員 | `openspec-sync-specs`、`openspec-archive-change`、`openspec-bulk-archive-change` | 把差異合併進主規格、處理多變更衝突、封存 | 你本人確認後交給任一 AI |
| 新手導覽 | `openspec-onboard` | 帶你走一次完整流程 | 第一次用時 |

- **交接（handoff）：有（以檔案為交接單）** — 交接物就是 `changes/<名>/` 四個檔；`openspec status --json` 告訴下一個 AI 哪一步 ready；`instructions` 輸出會要求「重新從磁碟讀依賴檔，即使你之前看過——可能已被修改」（[instructions.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/commands/workflow/instructions.ts#L258-L300)）。這句對多 AI 協作很重要，建議也寫進你的 AGENTS.md。
- **誰向誰負責：沒有明文**。團隊文件只建議「一個變更一個負責人」（[team-workflow.md#L59-L64](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/team-workflow.md#L59-L64)）。

### 11.3 防漏
- **任務追蹤：有** — `tasks.md` 勾選框，`apply.tracks: tasks.md`；計數規則見 [task-progress.ts#L55](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/utils/task-progress.ts#L55)。
- **完成前驗證：有** — 封存時檢查未完成任務（[archive.ts#L1615-L1650](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/archive.ts#L1615-L1650)）；`/opsx:verify` 逐條需求找程式碼證據，未實作列 CRITICAL；`openspec validate --archived` 檢查已封存的變更任務是否都完成（可放 pre-commit）。
- **交接紀錄：有** — 封存資料夾 `archive/YYYY-MM-DD-<名>/` 保留完整 proposal／design／tasks／delta，等於永久交接紀錄。
- **「不能說成已驗證」原則：有** — verify skill 規定跳過的檢查只能標 `Not verified (<原因>)`，「Never score a skipped check as passing」（[verify SKILL.md#L164-L205](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L164-L205)）。這條很適合放進你所有 AI 的共用規則。

### 11.4 防重複
- **重複需求：有** — 同區段重名、跨區段衝突、大小寫／空白近似重名都擋（[specs-apply.ts#L257-L356](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L257-L356)、[L565-L590](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L565-L590)）。
- **重複能力（capability）：有（靠 prompt）** — proposal 指示要先跑 `openspec list --specs` 盤點，「Reuse an existing capability's exact path instead of introducing a near-duplicate name」（[schema.yaml#L19-L35](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/schemas/spec-driven/schema.yaml#L19-L35)）。
- **重複規則：沒有自動偵測**。
- **重複文件內容：有（維護者自用 skill）** — verify-openspec-docs 審稿員要「Flag anything that re-explains a topic whose canonical home is another page」（[verify-openspec-docs SKILL.md#L17-L49](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/.agents/skills/verify-openspec-docs/SKILL.md#L17-L49)）。
- **重複角色：沒有**（沒有角色概念）。
- **重複 skill 安裝：有** — Codex、Zed 與通用目標共用 `.agents/skills/` 時只保留一棵樹（[supported-tools.md#L150-L202](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/supported-tools.md#L150-L202)）。

### 11.5 防新舊版本衝突
- **單一事實來源：有** — `openspec/specs/`（[concepts.md#L26-L50](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/concepts.md#L26-L50)）。
- **變更提案／封存：有** — `changes/` → `archive/YYYY-MM-DD-*`（5.4）。
- **過期偵測：部分有**：
  - 提案落後主規格（場景遺失）→ 拒絕合併（[specs-apply.ts#L534-L560](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/specs-apply.ts#L534-L560)）。
  - 兩個變更改同一份規格 → bulk-archive 偵測並依程式碼證據決定、都實作則「舊的先、新的覆蓋」（[bulk-archive SKILL.md#L112-L145](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-bulk-archive-change/SKILL.md#L112-L145)）。
  - AI 指示檔（skill）版本過舊 → `generatedBy` 戳記 + `openspec update`（5.9）。
  - Purpose 仍是佔位字 `TBD - created by archiving change …` → validate 警告（[constants.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/validation/constants.ts)）。
  - 已淘汰用語 → repo 內測試掃描（[vocabulary-sweep.test.ts](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/test/vocabulary-sweep.test.ts#L1-L48)）。
  - **任務清單 vs 實際程式碼脫節：沒有**（見第 9 節第 3 點的實例）。
- **版本標記：有** — 規格本身沒有版本號，但靠 git 歷史＋封存日期；每個變更 `.openspec.yaml` 有 `created: YYYY-MM-DD`；`validate --json` 輸出有 `version: "1.0"`。

### 11.6 定期巡檢
- **內建排程／heartbeat／cron：沒有**。我搜尋 `docs/`、`docs-lab/` 的 cron／schedule／heartbeat，只找到團隊文件一句「封存可以是 scheduled cleanup」（[team-workflow.md#L53](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/team-workflow.md#L53)），沒有實作。repo 唯一的排程是 security.yml 每週安全掃描。
- **可組裝的巡檢零件：有**（全部有 `--json`）：
  - `openspec validate --all --strict --json` → 所有規格與變更的格式問題
  - `openspec status --all --json` → 每個進行中變更卡在哪一步
  - `openspec list --json` → 每個變更 `completedTasks/totalTasks`、`lastModified`（可算「幾天沒動」）
  - `openspec doctor --json` → 結構健康
  - `/opsx:verify <變更>` → 逐條需求對程式碼
- **報告格式：有（verify）**。以下是我依 verify 格式改寫、給你每日巡讀用的**範例**（不是 OpenSpec 內建輸出）：

```markdown
## 每日巡讀報告：2026-11-04

### 摘要
| 面向 | 狀態 |
|---|---|
| 完整性 | 3 個進行中變更；add-barcode-scan 7/10 任務；price-calc 0/12（已 21 天未動） |
| 正確性 | validate --strict：44 規格通過，1 變更失敗 |
| 一致性 | 2 個變更同時修改 specs/inventory（衝突） |

### CRITICAL（封存前必修）
- price-calc：tasks 全未勾，但 src/cost.js 已有運費計算 → 確認是否已實作、補勾或更新提案
- inventory 規格衝突：add-barcode-scan 與 fix-stock-deduct 都 MODIFIED「Requirement: Stock deduction」

### WARNING
- specs/report/spec.md Purpose 仍是 TBD 佔位字

### SUGGESTION
- AGENTS.md 與 docs/setup.md 重複說明 Firebase 部署步驟，保留一處

### 未驗證
- 廣告腳本模組：無規格，無法比對（Not verified：no spec）
```

- **hook：沒有提供**。（可自行用 Claude Code 的 hook 或 git pre-commit 呼叫 `openspec validate --archived`；這是建議，非 OpenSpec 內建。）

### 11.7 Skill 寫法
- **SKILL.md 格式：有** — 前置資料：`name`、`description`、`allowed-tools`、`license`、`compatibility`、`metadata.author/version`，產生時再加 `metadata.generatedBy`（[skill-generation.ts#L160-L195](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/shared/skill-generation.ts#L160-L195)；實例 [verify SKILL.md#L1-L10](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L1-L10)）。
- **description 怎麼寫才會被觸發：有一致的寫法** — 三段式：「做什麼」＋「Use when the user wants to …」＋「Also use when the user says "openspec verify" or "opsx verify"」。12 個 skill 全部是這個句型（我抽看 verify、explore、sync-specs、apply、propose、bulk-archive 六個確認）。維護者自用的 release skill 則把觸發情境列得更細（「Also use when asked whether an open release PR is complete…」）。
- **防誤觸發：有** — 每個 skill 開頭都有「Project check」：若是 AI 自己挑中這個 skill、但專案沒有 `openspec/`，就「停止使用 OpenSpec、照一般方式回答，不要提安裝」（[verify SKILL.md#L15-L25](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L15-L25)）。這個「auto-selected vs explicit」分流寫法非常值得抄。
- **資料夾結構：有** — `<工具資料夾>/skills/openspec-<名>/SKILL.md`；維護者 skill 示範附屬檔：`references/release-notes.md`、`agents/openai.yaml`、`full-process.md`、`writing.md`。
- **腳本放哪：沒有** — OpenSpec 的 skill 不附腳本，全部改呼叫 `openspec` CLI（`allowed-tools: Bash(openspec:*)`）。這是「把可重現邏輯放進 CLI、skill 只負責編排」的設計。
- **skill 由程式產生、禁止手改、測試防漂移：有** — [skills/README.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/README.md)。

### 11.8 支援哪些工具與安裝方式
- **Claude Code：有（原生）** — `.claude/skills/openspec-*/SKILL.md` ＋ `.claude/commands/opsx/<id>.md`，用 `/opsx:propose`。
- **Codex：有（只用 skill）** — `.agents/skills/openspec-*/SKILL.md`，用 `$openspec-propose`。
- **Cursor、GitHub Copilot、Gemini CLI、Cline、Kiro、OpenCode、Amazon Q、Devin（原 Windsurf）…：有** — 共 50 項（[config.ts#L41-L107](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/src/core/config.ts#L41-L107)），不在清單的用 `--tools agents`。
- **安裝**：`curl -fsSL https://openspec.dev/cli/install.sh | sh` 或 `npm i -g @fission-ai/openspec@latest` → 在專案 `openspec init`（互動選工具，或 `--tools claude,codex`）→ 升級後跑 `openspec update` 重新產生 skill。只要 skill 不要 CLI 骨架：`npx skills add Fission-AI/OpenSpec`（[skills/README.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/README.md)）。

### 11.9 可以直接借用到你「基礎架構」的檔案或段落
1. [openspec/config.yaml](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/openspec/config.yaml) — 照格式改成你的：`context` 寫「純 JavaScript、Firebase、繁體中文 UI、手機優先」，`rules.tasks` 寫「每個任務結尾要能在瀏覽器手動驗證的步驟」。
2. [schemas/spec-driven/templates/](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/schemas/spec-driven/templates/tasks.md) 四個範本 — 當 AI 之間的交接單。
3. [skills/openspec-verify-change/SKILL.md#L164-L205](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L164-L205) — 每日巡讀報告格式。
4. [skills/openspec-bulk-archive-change/SKILL.md#L112-L145](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-bulk-archive-change/SKILL.md#L112-L145) — 多 AI 改同一處的衝突判定步驟。
5. [.agents/skills/verify-openspec-docs/SKILL.md#L17-L49](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/.agents/skills/verify-openspec-docs/SKILL.md#L17-L49) — 新鮮上下文審稿員 prompt（抓錯誤、抓重複、要求每個事實附「怎麼驗證的」、兩輪不收斂就停）。
6. [openspec/work/AGENTS.md](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/openspec/work/AGENTS.md) — 子資料夾規則範例；最後那五個問題（What does the human want? What does the agent need to know? Where does the work live? What changes on disk? How does the user know it worked?）可直接當你每張任務單的檢查問題。
7. [test/vocabulary-sweep.test.ts#L1-L48](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/test/vocabulary-sweep.test.ts#L1-L48) — 舊名詞禁字掃描，改成你巡檢腳本的一步（例：舊欄位名 `qty_old` 不准再出現）。
8. [skills/openspec-verify-change/SKILL.md#L15-L25](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L15-L25) — skill 防誤觸發段落寫法。
9. [docs/team-workflow.md#L13-L66](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/docs/team-workflow.md#L13-L66) — 「一個變更一個負責人」「衝突只會出現在 specs/，當成 git 告訴你兩個變更對行為有分歧」的團隊規則，把「人」換成「AI」幾乎可以原封不動用。

**給你的最小起步架構（我的建議，綜合上面）：**
```
你的專案/
├── AGENTS.md                 ← 通用規則（GPT 與 Claude 共用；寫：角色分工、交接要重讀檔案、未驗證不准說已完成）
├── CLAUDE.md                 ← 只放一行 @AGENTS.md
├── openspec/
│   ├── config.yaml           ← 技術棧 context + 每種產出物 rules
│   ├── specs/<能力>/spec.md  ← 唯一現行真相（庫存、進貨、成本計算…）
│   └── changes/              ← 進行中提案；做完封存到 archive/
├── .claude/skills/openspec-* ← openspec init 產生
├── .agents/skills/openspec-* ← openspec init 產生（Codex）
└── .agents/skills/daily-patrol/SKILL.md ← 你自己寫：跑 validate/status/list --json + verify 格式報告
```

---

## 關鍵字
OpenSpec、Fission-AI、規格驅動開發、spec-driven development、SDD、單一事實來源、single source of truth、變更提案、change proposal、delta spec、差異規格、ADDED／MODIFIED／REMOVED／RENAMED、封存、archive、openspec validate、驗證、openspec/config.yaml、context、rules、AGENTS.md、CLAUDE.md、SKILL.md、Agent Skills、Claude Code、Codex、$openspec-propose、/opsx:propose、/opsx:apply、/opsx:verify、/opsx:archive、bulk-archive、衝突偵測、過期偵測、staleness、drift、generatedBy、tasks.md、任務追蹤、驗收報告、每日巡讀、巡檢、多 AI 協作、角色分工、交接、handoff、新鮮上下文審稿、vocabulary sweep、MIT 授權、TypeScript CLI、Node.js
