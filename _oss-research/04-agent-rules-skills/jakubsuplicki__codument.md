# jakubsuplicki/codument — 用「文件登記表」管住 AI 改程式碼：文件漂移偵測＋提交前驗證＋對抗式審查的 CLI

> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：d38a1d5
> GitHub：https://github.com/jakubsuplicki/codument｜⭐ 48｜授權：Apache-2.0｜主要語言：TypeScript｜最近更新：2026-10-05

> 本資料包所有路徑、行號都是在 commit `d38a1d592ef6d9a0448265ebf941efde8c08f68b` 上實際打開確認過的。permalink 前綴：
> `https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/`（下文簡寫為 `…/`，點連結即可）。
> 掃描方式：只讀不執行（沒有 `npm install`、沒有跑測試、沒有跑 CLI），所以「實際跑起來的輸出」一律以原始碼推論，標註未確認者即未實測。

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話：** codument 是一支 Node.js 命令列工具＋一套給 Claude Code／Codex 的規則與 skills，核心是 `docs/.registry.json` 這張「哪個程式檔由哪份文件負責」的登記表，然後用**不靠 AI、可重現**的檢查找出「程式改了但文件沒跟著改（doc drift）」「文件沒人管（orphan）」「連結壞掉」「文件太肥」「計畫做完了檢查清單還沒收」等問題，並在 commit 前擋下來。

**對這位使用者最有價值的 5 件事：**

1. **「每日巡讀」的現成骨架。** 你想要的「每天讀一遍專案，看哪個 AI 漏了東西、哪裡新舊版本衝突」，codument 拆成兩半：
   - 機械巡檢（不用 AI、0 費用）：`codument doctor`（文件覆蓋率＋18 種 lint）、`codument audit <範圍>`（回頭掃一段 git 歷史：哪些程式動了但文件沒動）、`codument review --base main`（這條分支累積的漂移）。
   - AI 巡讀：`review-codebase` skill — 依登記表把專案切成一個個 feature，每個 feature 派一個 code-reviewer 子代理人，最後彙整成**固定格式**的報告（方便每天比對）。
2. **一份規則給 GPT（Codex）和 Claude 共用的寫法。** `AGENTS.md` 當「唯一正本」，`CLAUDE.md` 只寫一句「規則在 AGENTS.md」再附上同一段受管區塊；規則用 `<!-- codument:start -->…<!-- codument:end -->` 標記包起來，工具升級時只換標記內的內容，你自己寫在標記外的東西不會被蓋掉。這正是你目前「亂」的解法之一。
3. **角色分工＋交接（handoff）機制。** 8 個流程 skills（立章程 → 拷問需求 → 寫計畫 → 逐步施工 → 審查 → 提交 → 更新文件）＋ 7 個領域 skills ＋ 5 個子代理人（含「對抗式審查員」「對抗式計畫審查員」）。交接靠 `codument work status --json`（存目前做到哪一步、卡在哪個關卡、為什麼暫停、何時可以恢復）。
4. **防新舊版本衝突的核心手法：計畫核准綁雜湊。** 計畫被人核准時，把計畫的「合約段落」算 SHA-256 存進 `docs/.approvals.json`；之後只要有人（或某個 AI）偷改了計畫內容，雜湊對不上就變成 `stale`，必須重新請人核准才能繼續施工。
5. **你的倉儲 App 可以直接套。** 它支援純 JavaScript（以「整個檔案」為單位判斷，不像 TypeScript 能細到函式），而且範例裡就有 `firestore.rules`（Firebase 安全規則）怎麼標成高風險、改了必須簽核的寫法。

**不適合拿來做的：** 它不是試算表、不是比價／ERP、不是影片生成；它完全不呼叫任何 AI API（CLI 本身零網路），AI 部分全靠你的 Claude Code／Codex 依規則去做。

---

## 2. 授權白話

- **授權：Apache-2.0**（[`LICENSE`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/LICENSE)、[`NOTICE`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/NOTICE)；`package.json` 的 `"license": "Apache-2.0"` 一致）。
- **個人使用：** 完全可以，免費、可修改、可在自己的專案裡用，不用公開你的程式碼。
- **公司商用：** 可以商用、可以閉源。要注意：
  1. 若你**再散布**（例如把它改過的版本打包給別人、放進你賣的產品），要附上 Apache-2.0 授權全文與 `NOTICE` 檔，並標明你改過哪些檔案。
  2. Apache-2.0 有**專利授權條款**：若你拿它去告作者專利侵權，你的授權會終止（一般小公司不會碰到）。
  3. 不能用作者名字或「codument」商標替你的產品背書。
  4. 只是「抄規則文字、skill 寫法、設計概念」放進你自己的 `AGENTS.md`，風險極低；若整段複製長篇文字，保險起見在檔案裡註明出處與授權。
- **有沒有付費版／閉源功能：** 在 repo 裡沒看到任何付費牆、授權金鑰檢查或「Pro 版」程式碼；README 有連到官網 codument.studio，但官網有沒有付費服務**未確認**（規則禁止瀏覽其他網站）。
- **小細節：** `skills/frontend-design/SKILL.md` 的 frontmatter 寫 `license: Complete terms in LICENSE.txt`，但該資料夾裡沒有 `LICENSE.txt`（從檔案清單確認）——這個 skill 的來源授權**未確認**，若要借用這一個 skill 請小心。

---

## 3. 技術棧與執行需求

| 項目 | 內容（出處） |
|---|---|
| 語言 | TypeScript，編譯成 ESM（`package.json` `"type": "module"`，`tsup` 打包） |
| 執行環境 | Node.js ≥ 18（`engines`），CI 跑 18／20／22（`.github/workflows/ci.yml`） |
| 執行期依賴 | 只有 5 個：`commander`、`picocolors`、`prompts`、`typescript 6.0.2`（拿來解析 TS 語法樹）、`web-tree-sitter 0.26.10`（解析 Python/Go/Rust/C#/Java/Kotlin，文法檔是打包好的 `.wasm`，放在 `grammars/`） |
| 前端／後端／資料庫 | **都沒有**。純 CLI，狀態全部存在你專案裡的 JSON 檔：`docs/.registry.json`、`docs/.approvals.json`、`.codument-meta.json`、`.codument/events.jsonl`、`.codument/work-state.json` 等 |
| 部署 | `npm install -D codument` → `npx codument init`；或 CI 用 GitHub Actions（附範本） |
| 硬體／GPU | 不需要 |
| API Key | **CLI 不需要任何 API Key**。我用 `grep` 掃 `src/` 找 `fetch(`、`node:https`、`axios` 等網路呼叫，結果是 0 處。AI 的部分由你自己的 Claude Code／Codex 訂閱負擔 |
| 費用 | 工具本身 0 元。AI 費用＝你平常用 Claude Code／Codex 的費用；它甚至有 `codument cost`／`watch` 會讀 `~/.claude/projects/*.jsonl` 與 `~/.codex/sessions` 的本機紀錄，幫你估算每個 feature 花了多少 token（價目表在 [`src/lib/token-cost.ts#L61-L69`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/token-cost.ts#L61-L69)，例如 `sonnet-5` 每百萬 token 輸入 3 美元／輸出 15 美元——這是程式內寫死的估價，不是帳單） |

---

## 4. 程式架構地圖

（計數方式：`git ls-tree` 全部 503 個檔案；`find src -name '*.ts' | wc -l` = 90 個 TS 原始檔；`wc -l src/*.ts src/*/*.ts` 合計 36,516 行。）

```
codument/
├── AGENTS.md                ← 這個 repo 自己的「跨 AI 正本規則」（自己吃自己的狗糧）
├── CLAUDE.md                ← 只寫「規則在 AGENTS.md」＋同一段 codument 受管區塊
├── rules/documentation.md   ← 安裝到 .claude/rules/ 的「路徑觸發規則」：改到原始碼就必須同步文件
├── skills/                  ← 15 個 SKILL.md（安裝時複製到 .claude/skills/ 或 .agents/skills/）
│   ├── establish-charter/ grill-with-docs/ plan-with-docs/ tdd/
│   ├── work-step/ review-work/ commit-work/ update-docs/     ← 8 個「流程」skills
│   └── senior-backend/ senior-architect/ senior-frontend/ frontend-design/
│       motion-craft/ code-reviewer/ review-codebase/           ← 7 個「領域」skills
├── .agents/skills/          ← 上面 skills/ 的 git 追蹤副本（Codex 用）；我用 diff -rq 比過，內容完全相同
├── agents/                  ← 5 個 Claude 子代理人：adversarial-reviewer、adversarial-planner、
│                              code-reviewer、doc-scanner、doc-writer
├── templates/               ← feature.md / concept.md / adr.md / charter.md 文件範本 + ci-codument.yml
├── docs/
│   ├── .registry.json       ← 登記表（本 repo 自己有 24 筆 entry，用 python 讀 JSON 數的）
│   ├── .approvals.json      ← 計畫核准紀錄（綁雜湊）
│   ├── architecture/decisions/ ← 24 份 ADR（架構決策紀錄）
│   ├── features/ (21 份)  concepts/  guides/
│   └── plans/               ← 49 份計畫 + README（每份計畫有 status: draft/approved/shipped）
├── src/
│   ├── cli.ts               ← 所有指令註冊（commander）
│   ├── commands/ (21 檔)    ← init / scan / adopt / update / doctor / review / verify / audit /
│   │                          ack / context / map / steps / work / hooks / watch / cost / feed / report …
│   ├── hooks/check-docs.ts  ← Claude Code PostToolUse hook：AI 改完檔案就提醒「這檔案歸某文件管」
│   └── lib/ (66 檔)
│       ├── registry.ts          ← 登記表資料模型
│       ├── analyze.ts           ← doctor 的核心：覆蓋率＋全部 lint 規則（1,534 行）
│       ├── drift.ts / fingerprint.ts / two-ref.ts ← 逐「函式／符號」比對兩個 git 版本的漂移
│       ├── prose-altitude.ts    ← 偵測「文件只是把程式碼換句話說」的壞味道
│       ├── scaffold.ts / markers.ts / codemod.ts ← 產生 AGENTS.md/CLAUDE.md 受管區塊與三方合併
│       ├── agent-profiles.ts    ← Claude vs Codex 安裝設定檔
│       ├── plan-steps.ts / plan-approval.ts / work-state.ts ← 計畫、核准綁定、交接狀態機
│       ├── review-bundle.ts / review-artifact.ts / review-confirm.ts ← 對抗式審查的資料包與驗證
│       ├── git-hooks.ts         ← pre-commit 受管區塊
│       ├── history-audit.ts     ← 回溯歷史漂移
│       ├── claude-feed.ts / codex-feed.ts / token-cost.ts ← 讀 AI 本機紀錄算成本
│       └── *-adapter.ts         ← TS / Python / Go / Rust / C# / JVM / Vue-Svelte-Astro 語言轉接器
├── tests/                   ← 95 個 *.test.ts；用 grep 數 it(/test( 開頭約 2,075 個測試案例
└── fixtures/benchmarks/     ← 基準測試用的假專案（本次未 checkout 細讀）
```

---

## 5. 核心功能怎麼實作

### 5.1 一份規則、兩種 AI：受管區塊（managed section）
- **位置：** [`src/lib/scaffold.ts#L93-L238`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/scaffold.ts#L93-L238)（`buildManagedSection()` 產生整段工作流程規則）、[`src/lib/scaffold.ts#L240-L264`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/scaffold.ts#L240-L264)（`upsertManagedSection()`）、[`src/lib/markers.ts`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/markers.ts)、[`src/commands/init.ts#L153-L162`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/commands/init.ts#L153-L162)、[`src/commands/init.ts#L318-L323`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/commands/init.ts#L318-L323)
- **重點：**
  - 檔案沒有 → 直接寫入「標記＋內容」；有標記 → 只替換標記之間；有檔案但沒標記 → 附加到檔尾。你手寫的內容永遠在標記外，安全。
  - `AGENTS.md` 寫入的是純規則；`CLAUDE.md` 寫入「## Claude Compatibility：共用規則在 AGENTS.md，以那份為正本」＋**同一段**規則。也就是說 Claude 讀 CLAUDE.md 也能拿到完整規則（不依賴 Claude 會不會去追 AGENTS.md）。
  - 規則內容包含：核心 9 步迴圈、品質標準、「最少程式碼」原則、回覆格式（Response altitude）、意圖路由（什麼情況該叫哪個 skill）、假設關卡、步驟關卡、自動駕駛（autopilot）、暫停／恢復、完成定義（Definition of Done 9 條）、文件結構規範。

### 5.2 升級不蓋掉你改過的東西：三方雜湊合併
- **位置：** [`src/lib/codemod.ts#L175-L218`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/codemod.ts#L175-L218)（`decideMergeStrategy`）、[`src/commands/update.ts#L290-L346`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/commands/update.ts#L290-L346)
- **重點：** `.codument-meta.json` 記錄上次安裝時每個受管檔案的雜湊。升級時比三方：上游新版、你目前的版本、上次記錄。只有上游改 → 直接覆蓋；只有你改 → 跳過；兩邊都改 → 先備份成 `.backup` 再覆蓋；兩邊內容其實一樣 → 什麼都不做（程式註解說以前曾因此產生 21 個無用備份檔，後來修掉）。**這就是「新版 vs 舊版規則衝突」的機械解法**，你自己的規則同步腳本可以照抄。

### 5.3 Claude 改完檔案立刻提醒：PostToolUse hook
- **位置：** [`src/lib/claude-settings.ts#L1-L80`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/claude-settings.ts#L1-L80)、[`src/hooks/check-docs.ts`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/hooks/check-docs.ts)
- **重點：** 在 `.claude/settings.json` 的 `hooks.PostToolUse` 加一條 matcher `Write|Edit|MultiEdit`。Claude 每次寫檔後，hook 從 stdin 讀 `tool_input.file_path`，往上找 `docs/.registry.json`，查這個檔案歸哪個 feature，印出 `⚠️ codument: <檔案> → documented in "<feature>" (<doc>) — docs must be updated in this same task`。設計原則是「出錯就安靜退出、絕不卡住編輯」（找不到程式、登記表壞掉都 `exit 0`）。Codex 設定檔沒有 hooks（`agent-profiles.ts` 裡 `hooks: false`）。

### 5.4 路徑觸發的文件規則
- **位置：** [`rules/documentation.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/rules/documentation.md)、[`src/commands/update.ts#L407-L413`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/commands/update.ts#L407-L413)
- **重點：** frontmatter 的 `paths:` 在安裝時被換成你專案偵測到的原始碼 glob（純 JS 專案會是 `src/**/*.js` 等，沒有 `src/` 就用 `./**/*.js`，見 [`src/lib/detect.ts#L14-L26`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/detect.ts#L14-L26)）。內容規定：改原始碼就必須在同一個任務內查登記表、更新文件；檔案沒登記就建立 feature 文件與登記表項目（附 JSON 範例）；「不准問使用者要不要寫文件，直接做」。

### 5.5 登記表（單一事實來源）
- **位置：** [`src/lib/registry.ts#L11-L39`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/registry.ts#L11-L39)
- **重點：** 每筆 entry：`doc`（主文件）、`type`（feature/concept）、`primary_sources`（擁有的檔案或 glob）、`related_sources`（只會受影響、不負責）、`docs`（其他長期文件）、`depends_on`（依賴哪些 feature）、`risk`（風險標籤）、`status`。另有 `cohesive`、`depends_on_confirmed`、`owned_symbols`（同一檔案多個 feature 分符號擁有）。讀到壞掉的 JSON 會**大聲報錯而不是當成空的**（註解解釋：當成空的會讓後續寫入把整張表蓋掉）。

### 5.6 文件覆蓋率＋巡檢 lint（`codument doctor`）
- **位置：** [`src/lib/analyze.ts#L557-L620`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/analyze.ts#L557-L620)（覆蓋率）、[`src/lib/analyze.ts#L865-L1201`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/analyze.ts#L865-L1201)（lint 主體）、[`src/commands/doctor.ts#L204-L268`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/commands/doctor.ts#L204-L268)（組報告）
- **覆蓋率三項（等權平均）：** ownership（範圍內原始碼有主人的比例）、dependency（成熟 entry 有宣告 `depends_on` 的比例）、risk（有風險標籤的 entry 有沒有文件）。分母為 0 的項目直接排除，不算 0% 也不算 100%。
- **lint 規則（我用 `grep -o 'id: "…"'` 在 analyze.ts 數到 18 種）：** `missing-source`、`unmatched-pattern`、`manifest-owned`、`shadowed-source`（同一 entry 重複宣告）、`generated-leakage`（把建置產物或 gitignore 的檔案登記成原始碼）、`missing-doc`、`thin-doc`（標成 current 但沒有「In plain terms」導讀）、`shipped-scaffolding`（計畫全部打勾了還沒收掉檢查清單）、`empty-depends-on`、`dangling-depends-on`、`high-fanout`（一個檔案被太多 feature 認領）、`unread-owned`、`unmapped-source`（沒人管的原始碼）、`under-decomposed`／`over-decomposed`、`bloated-doc`（文件 > 400 行、單節 > 150 行、已完成項目 > 15 條，見 [`#L278-L282`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/analyze.ts#L278-L282)、[`#L1328-L1390`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/analyze.ts#L1328-L1390)）、`link-rot`（Markdown 連結與 `[[wikilink]]` 指向不存在的檔案，[`#L1270-L1312`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/analyze.ts#L1270-L1312)）、`orphan-doc`（`docs/features|concepts` 底下沒有登記表指向的文件，[`#L1179-L1199`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/analyze.ts#L1179-L1199)）。
- **分級：** `warn`＝要處理的發現；`info`＝只提醒（thin-doc、high-fanout、orphan-doc、prose-altitude 等），不影響「乾淨」判定。`--strict` 只對「這次變更新產生的」發現回傳 exit 1，舊債不擋（避免一開就整片紅）。
- **`--fix`：** 只自動修「機械性」的問題（只會從登記表移除路徑，不新增、不改文件），[`src/commands/doctor.ts#L376-L415`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/commands/doctor.ts#L376-L415)。

### 5.7 「文件只是程式碼翻譯」偵測（prose altitude）
- **位置：** [`src/lib/prose-altitude.ts#L1-L22`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/prose-altitude.ts#L1-L22)（規則說明）、`analyzeProseAltitude` 從 L149 起
- **重點：** 純字串規則、不用 AI：`symbol-mirror`（一行以函式名＋動詞開頭，像「readRegistry reads the registry」）、`line-anchor`（寫 `檔案.js:123` 這種一改就爛的行號）、`path-enumeration`（某節列了一堆檔案路徑）、`fenced-mirror`（程式碼區塊直接貼了函式宣告）。對 AI 寫的文件特別實用——AI 很愛寫這種「看起來有寫、其實沒資訊」的文件。

### 5.8 逐符號漂移判斷（`codument review`）
- **位置：** [`src/lib/drift.ts#L38-L43`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/drift.ts#L38-L43)（`anchorGates`）、[`src/lib/drift.ts#L90-L184`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/drift.ts#L90-L184)（`computeDrift`）
- **重點：** 把每個匯出符號的 token 串做指紋，比對兩個 git 版本。新增／刪除符號、簽章（參數、型別）變了 → 擋下，要求更新文件；只有函式內部實作變、簽章沒變 → 只報告不擋。可以用 `codument ack` 簽「這次改動不需改文件」，簽核綁在 `from→to` 指紋上，下次再改就自動失效；**簽章改變不能用 ack 洗掉**。注意：**純 JavaScript 只做到「整檔」層級**（README 的語言表），也就是你的 App 任何 .js 內容變動都會叫醒對應文件。

### 5.9 計畫核准綁雜湊＋交接狀態機
- **位置：** [`src/lib/plan-approval.ts#L51-L55`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/plan-approval.ts#L51-L55)（`approvalDigest` = SHA-256(路徑, 計畫 ID, 合約內容)）、[`src/lib/plan-approval.ts#L164-L211`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/plan-approval.ts#L164-L211)（`bound / unbound / stale` 判斷）、[`src/lib/work-state.ts#L43-L60`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/work-state.ts#L43-L60)（狀態：active/paused/blocked/superseded/ready/completed；關卡：implement/verify/document/review/commit）、[`src/cli.ts#L66-L94`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/cli.ts#L66-L94)（`work approve/status/start/pause/block/resume/supersede/finish`）
- **重點：** 計畫勾選框 `- [ ]`→`- [x]` 不影響雜湊（只算合約段落），但改 Outcome／限制／驗收標準就會讓核准失效。`work supersede` 明確記錄「哪份計畫取代哪份」，避免兩個 AI 各做各的版本。

### 5.10 pre-commit 與 CI 雙保險
- **位置：** [`src/lib/git-hooks.ts#L36-L60`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/git-hooks.ts#L36-L60)（受管 shell 區塊，`# >>> codument gate >>>`）、[`templates/ci-codument.yml`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/templates/ci-codument.yml)
- **重點：** 本機 hook 跑 `codument verify`，可用 `--no-verify` 或 `CODUMENT_SKIP_GATE=1` 跳過（刻意設計成「跳過是有意識的動作」）；找不到 codument 程式就警告但放行（不讓你整個 repo 無法 commit）。CI 才是最終權威，可設成 GitHub 必要檢查。

### 5.11 對抗式審查（AI 提出、測試決定）
- **位置：** [`agents/adversarial-reviewer.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/agents/adversarial-reviewer.md)、[`agents/adversarial-planner.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/agents/adversarial-planner.md)
- **重點：** 審查員「假設程式是錯的」，不看作者的推理，產出 findings JSON：`invariantsChecked`（必須非空，否則閘門拒收）、`findings[]`（`confirmed` 必須附一個現在會紅燈的測試檔，閘門會重跑；`advisory` 只是提醒）。一個 AI 說有 bug 不算數，**測試紅燈才算數**——這正好解決「多個 AI 互相審查但意見打架」的問題。

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| 受管區塊寫入器（標記之間才改） | [`src/lib/scaffold.ts#L240-L264`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/scaffold.ts#L240-L264)＋[`markers.ts`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/markers.ts) | 只有 Node `fs` | 低 | 25 行，直接改寫成你的 `sync-rules.js`：一份 `rules/shared.md` → 同步寫進 `AGENTS.md` 與 `CLAUDE.md` 的標記區 |
| 三方雜湊合併判斷 | [`src/lib/codemod.ts#L175-L218`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/codemod.ts#L175-L218) | `hashContent`（同檔） | 低 | 用在「規則／skills 從中央範本同步到各專案」時判斷該覆蓋、跳過還是備份 |
| Claude PostToolUse 提醒 hook | [`src/hooks/check-docs.ts`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/hooks/check-docs.ts)＋[`claude-settings.ts#L1-L80`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/claude-settings.ts#L1-L80) | registry、analyze（可簡化掉） | 低～中 | 換成你自己的小腳本：讀一份 `docs/registry.json`，Claude 改到 `public/js/inventory.js` 就提醒「記得更新 docs/features/inventory.md」 |
| 文件連結壞掉檢查 | [`src/lib/analyze.ts#L1270-L1312`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/analyze.ts#L1270-L1312) | `fs`、兩個小 helper | 低 | 每日巡檢腳本的一環，掃 `docs/**/*.md` |
| 文件太肥檢查 | [`src/lib/analyze.ts#L1328-L1390`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/analyze.ts#L1328-L1390) | `largestSection` | 低 | 同上，也可用來掃 `AGENTS.md`／`CLAUDE.md` 本身是否越寫越長 |
| 孤兒文件／沒人管的程式檔 | [`src/lib/analyze.ts#L1112-L1199`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/analyze.ts#L1112-L1199) | 登記表 | 中 | 巡檢「哪個 AI 新增了檔案卻沒登記」「哪份文件已經沒有對應程式（舊版殘留）」 |
| 文件「翻譯程式碼」壞味道偵測 | [`src/lib/prose-altitude.ts`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/prose-altitude.ts) | 純字串 | 低～中 | 掃 AI 生成的文件品質 |
| 計畫核准雜湊 | [`src/lib/plan-approval.ts#L51-L55`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/plan-approval.ts#L51-L55)、[`#L164-L211`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/plan-approval.ts#L164-L211) | `plan-steps.ts`（解析合約段落） | 中 | 概念直接用：你核准的計畫算雜湊存檔；巡檢時發現雜湊變了就標「計畫被改過、需重新核准」 |
| pre-commit 受管區塊 | [`src/lib/git-hooks.ts#L36-L104`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/git-hooks.ts#L36-L104) | 無 | 低 | 改成跑你自己的檢查腳本 |
| Feature 文件範本（5 層） | [`templates/feature.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/templates/feature.md) | 無 | 低 | 直接當你倉儲 App 每個功能的說明書格式 |
| 對抗式審查員子代理人 | [`agents/adversarial-reviewer.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/agents/adversarial-reviewer.md) | Claude Code 子代理人 | 低 | 複製到 `.claude/agents/`；或改寫成給 Codex 用的「審查角色」提示 |
| 全專案巡讀 skill | [`skills/review-codebase/SKILL.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/skills/review-codebase/SKILL.md) | 登記表＋code-reviewer 子代理人 | 低 | 每日巡讀的 AI 部分；報告格式固定，可存成 `reports/YYYY-MM-DD.md` 逐日比對 |
| Codex／Claude 雙設定檔表 | [`src/lib/agent-profiles.ts#L78-L108`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/agent-profiles.ts#L78-L108) | 無 | 低 | 你的同步腳本可以照這張表決定「哪個檔案寫到哪裡」 |

---

## 7. AI／Claude 整合

- **CLI 本身不呼叫任何模型**（`src/` 內 0 處網路呼叫）。設計原則寫在 README 與 ADR 003：「判決路徑上不放模型呼叫」，AI 只負責提出意見，判決由可重現的規則或重跑測試決定。
- **Claude Code：原生支援。** README 徽章標「Claude Code · native」。安裝 `AGENTS.md`＋`CLAUDE.md`、`.claude/skills/`（15 個）、`.claude/agents/`（5 個，frontmatter 寫 `model: sonnet`）、`.claude/rules/documentation.md`（路徑觸發）、`.claude/settings.json`（PostToolUse hook）。
- **Codex／其他讀 AGENTS.md 的工具：可攜。** 只裝 `AGENTS.md`＋`.agents/skills/`；沒有 hooks、沒有子代理人（`agent-profiles.ts` 的 capabilities 寫死 false）。所以「對抗式審查」在 Codex 上會退化成「手動交接」（README 原文說明沒有子代理人時只給 paste-ready 的提示詞，保證較弱）。
- **prompt 放在哪：** 規則本文寫死在 `src/lib/scaffold.ts` 的 `buildManagedSection()`（TypeScript 字串），skills 在 `skills/*/SKILL.md`，子代理人在 `agents/*.md`。
- **MCP：** 沒有看到 MCP server（檔案清單中無相關檔案）。
- **能讀 AI 的本機紀錄算成本：** `claude-feed.ts` 讀 `~/.claude/projects/<slug>/<session>.jsonl`；`codex-feed.ts` 讀 `$CODEX_HOME` 或 `~/.codex/sessions`。只讀本機、不上傳。

---

## 8. 擴充方式與 API

- **CLI 指令**（`src/cli.ts` 用 `grep '.command("'` 列出）：`init`、`scan`、`adopt`、`update`、`doctor`、`verify`、`review`、`audit`、`context`、`ack`、`report`、`demo`、`watch`、`feed`、`cost`、`steps`、`hooks install/status/uninstall`、`map route/check/materialize`、`work approve/status/start/pause/block/resume/supersede/finish`、`run`、`emit`、`tokens`。
- **機器可讀輸出：** 大多數指令有 `--json`；`review --format sarif` 輸出 SARIF 2.1.0 給 GitHub code scanning 標註在 PR 上。
- **程式庫匯出：** `package.json` 的 `exports` 指向 `dist/index.js`（`src/index.ts` 219 行）；可以在自己的 Node 腳本裡 import，但 API 穩定性**未確認**（版本仍是 0.x）。
- **加新語言：** 寫一個 `*-adapter.ts`，必須通過 `tests/adapter-conformance.ts` 的 8 項一致性測試（README 說明）。
- **專案設定：** `.codument-meta.json` 可設 `testCommand`、`exclude` 等。
- **加自己的 skill：** codument 的 `resolveSkills()` 目前寫死清單（[`agent-profiles.ts#L74-L76`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/agent-profiles.ts#L74-L76)），它不會管理你自己的 skills；你自己的 skill 放同資料夾即可，`update` 只碰它受管的檔名。

---

## 9. 程式品質與風險

- **維護狀況：** CHANGELOG 有 21 個版本段落（用 `grep -c '^## \['` 數，含 Unreleased），最新 0.21.0 日期 2026-10-05，7–10 月幾乎每週發版；但 GitHub 只有 48 顆星，**幾乎是單人專案**（NOTICE：Copyright 2026 Jakub Suplicki）。
- **測試：** 95 個測試檔、約 2,075 個 `it(`/`test(`（README 自稱 2120+）；CI 在 Node 18/20/22 跑 lint＋typecheck＋test。測試很重視「文件說的和程式做的一致」：例如 `tests/skill-parity.test.ts` 確保 `skills/` 與 `.agents/skills/` 兩份副本不走樣、`tests/changelog-claims.test.ts` 檢查 CHANGELOG 的數字宣稱、`tests/surface-conformance.ts` 確保每個錯誤狀況都有對應的修復提示。
- **資安／隱私：** 無網路呼叫、無遙測上傳。但 `feed`／`cost` 會讀你家目錄下 Claude／Codex 的對話紀錄（只在本機算 token）。pre-commit hook 會執行 `node_modules/.bin/codument`，等於信任該 npm 套件。
- **已知的坑：**
  1. **非常複雜。** 規則本身（`buildManagedSection`）一大段英文、24 份 ADR、49 份計畫；對一個「想要基礎架構」的使用者來說**整套照搬會太重**，AI 每次開工都要讀很長的規則（耗 token）。
  2. **純 JS 只到整檔層級**：你的 App 任何 `.js` 檔有變動都會要求更新對應文件或簽 ack，可能很吵。
  3. **規則全英文**，而且預設「不加 AI Co-Authored-By trailer、以你的名義 commit」——若你想保留 AI 署名要自己改。
  4. **Codex 端能力較弱**：沒有 hook、沒有子代理人，靠 Codex 自律讀 AGENTS.md。
  5. **版本 0.x、變動快**：CHANGELOG 有「升級後舊審查紀錄需重簽」之類的破壞性變更。
  6. `.claude/skills/` 被 `.gitignore` 排除（skill-parity 測試註解說明），團隊多台電腦要記得各自跑 `codument update`。
  7. Windows 有參數被拆開的已知問題（規則本文有寫繞法：改用 `npx codument` 或 `node node_modules/codument/dist/cli.js`）。

---

## 10. 跟其他專案組合的建議

- **codument ＋ OpenSpec／spec-kit（同分類已有資料包）：** OpenSpec／spec-kit 擅長「變更提案 → 規格 → 封存」，codument 擅長「程式與文件有沒有對上」。建議：規格／提案用 OpenSpec 的資料夾結構，codument 的 `doctor` 與 `review --base main` 當每日機械巡檢。
- **codument ＋ anthropics/skills（官方 skill 格式）：** skill 的寫法以官方為準，codument 的 15 個 skills 當「角色內容」參考（尤其 description 裡的「Use whenever… / Do NOT use for…（use X）」互斥寫法）。
- **codument ＋ 你自己的倉儲 App（最務實的路線）：** 不必安裝整套。拆 4 個小件：
  1. `docs/registry.json`（只要 `doc`、`primary_sources`、`depends_on`、`risk`、`status` 五欄）；
  2. 一支 `scripts/patrol.js`：抄 `unmapped-source`、`orphan-doc`、`link-rot`、`bloated-doc`、`shipped-scaffolding` 五條規則＋「最近 24 小時 git 改了哪些檔，對應文件有沒有一起改」；
  3. `AGENTS.md` 正本＋`CLAUDE.md` 指向它（用受管區塊同步）；
  4. 每天讓 Claude 跑一次類似 `review-codebase` 的巡讀，報告寫到 `reports/patrol-YYYY-MM-DD.md`。
- 若之後想要完整版，再 `npx codument init --agents codex,claude` 一次裝齊。

---

## 11. 規則／角色／巡檢 檢查表

### 共用規則怎麼寫 — **有**
- **檔案結構：** `AGENTS.md`（正本）、`CLAUDE.md`（相容層）、`.claude/rules/documentation.md`（路徑觸發規則）、`docs/charter.md`（專案章程，類似 constitution）、`docs/architecture/decisions/`（ADR）。沒有 `.ruler`。
  位置：[`src/lib/agent-profiles.ts#L78-L108`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/agent-profiles.ts#L78-L108)、[`CLAUDE.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/CLAUDE.md)、[`AGENTS.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/AGENTS.md)
- **分層：** 專案層（AGENTS/CLAUDE.md）＋路徑層（`rules/documentation.md` 的 `paths:`）＋ feature 層（每份 feature 文件的 Invariants）。**全域層（家目錄 `~/.claude/CLAUDE.md`）沒有管理**；子資料夾層級的 AGENTS.md 也沒有（未見相關程式）。
- **優先順序：** 明文寫「AGENTS.md 是 canonical（正本）」，CLAUDE.md 只是相容。標記外是你的、標記內是工具的。
- **GPT 和 Claude 讀同一份：** 兩個檔案寫入**同一段** `buildManagedSection()` 內容（CLAUDE.md 多一段前言）。[`src/commands/init.ts#L153-L162`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/commands/init.ts#L153-L162)

### 角色設計 — **有**
- **流程角色（8 個，[`agent-profiles.ts#L25-L34`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/agent-profiles.ts#L25-L34)）：** `establish-charter`（立章程，一次）→ `grill-with-docs`（拷問需求／假設）→ `plan-with-docs`（寫計畫並停下來等人核准）→ `work-step`（只做下一個未勾步驟）→ `tdd`（紅綠重構）→ `review-work`（審查）→ `commit-work`（提交）→ `update-docs`（補／更新文件）。
- **領域角色（7 個，[`#L41-L49`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/agent-profiles.ts#L41-L49)）：** senior-backend、senior-architect、senior-frontend、frontend-design、motion-craft、code-reviewer、review-codebase。規則明寫「領域 skills 是顧問，不是關卡，不能取代 work-step／review-work」。
- **子代理人（5 個，含工具權限）：** `adversarial-reviewer`（Read/Grep/Glob/Bash/Write，只寫失敗測試、不改實作）、`adversarial-planner`（Read/Grep/Glob/Bash，只提有根據的反對意見、永不擋）、`code-reviewer`（可 Edit，只做非破壞性修正）、`doc-scanner`（唯讀）、`doc-writer`（Read/Write/Edit）。
- **交接：** `work-step` → `review-work` → `commit-work` 三關卡固定順序，「兩個實作步驟之間一定要有審查與提交」寫成絕對規則（`scaffold.ts` Step gates 段落，L174-L185）。
- **誰向誰負責：** 人類核准計畫（唯一不可跳過的關卡）；AI 審查員的意見由「重跑測試」決定是否成立；CI 是最終權威。

### 防漏 — **有**
- **任務追蹤：** 計畫文件內 `## Delivery Plan` 的 `- [ ]` 檢查清單是唯一事實來源；`codument steps --plan <path> --json` 投影成 Claude 的 TodoWrite；`work status` 記錄目前步驟與下一關卡。範例格式：[`skills/plan-with-docs/SKILL.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/skills/plan-with-docs/SKILL.md)（L65-L93）。
- **完成前驗證：** Definition of Done 9 條（`scaffold.ts` L210-L220）＋ `codument verify` 驗證「暫存區的確切內容」，之後只要 staged bytes 變了就要重驗。
- **交接紀錄：** `.codument/work-state.json`（暫停原因、恢復條件、待辦關卡），[`src/lib/work-state.ts#L43-L60`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/work-state.ts#L43-L60)；以及 `.codument/events.jsonl` 事件流。
- **新檔沒登記：** `unmapped-source` lint＋ PostToolUse hook 提醒。

### 防重複 — **部分有**
- **有：** `shadowed-source`（同一 entry 重複宣告已被 glob 涵蓋的檔案）、`high-fanout`（一個檔案被多個 feature 認領，提醒檢查是否真的共用）、`over-decomposed`（feature 只擁有一個 index 檔）、`skill-parity` 測試（兩份 skill 副本必須相同）、`decideMergeStrategy` 的「兩邊內容相同就不產生備份」。
- **沒有：** 沒有語意層級的「兩份文件講同一件事」或「兩條規則互相矛盾」偵測；沒有「重複角色」合併工具。這部分要靠 AI 巡讀（`review-codebase`）或你自己加。

### 防新舊版本衝突 — **有（是本專案強項）**
- **單一事實來源：** `docs/.registry.json`（程式↔文件）、計畫文件的 Delivery Plan（進度）、`docs/.approvals.json`（核准）。
- **版本標記：** 規則受管區塊＋`.codument-meta.json` 的 `version` 與 `fileHashes`；pre-commit 收據綁 codument 版本，版本不同強制重驗。
- **變更提案／封存：** 計畫有 `status: draft → approved → shipped`（[`docs/plans/README.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/docs/plans/README.md)）；完成後「compaction」把檢查清單收掉、保留決策到 `## Decisions`／ADR；`work supersede` 記錄取代關係。
- **過期偵測：** 逐符號 drift（`drift.ts`）、`audit` 回溯歷史、`shipped-scaffolding`、`link-rot`、`orphan-doc`、核准雜湊 `stale`。文件 frontmatter 有 `last_reviewed` 欄位（[`templates/feature.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/templates/feature.md)），但**未看到依日期判斷過期的程式**（只靠內容比對）。

### 定期巡檢 — **部分有（有 hook 與 CI，沒有每日排程）**
- **hook：** Claude PostToolUse（每次寫檔）、git pre-commit（每次提交）。
- **CI：** `templates/ci-codument.yml`，觸發條件只有 `pull_request`。**沒有 cron／每日排程、沒有 heartbeat**——要你自己在 GitHub Actions 加 `on: schedule: - cron: '0 1 * * *'` 跑 `npx codument doctor --json` 與 `npx codument audit HEAD~20..HEAD`（後者參數格式依 README `audit v1.0.0..HEAD` 推得，實際行為未實測）。
- **報告格式範例：**
  - 機械巡檢（`doctor` 人類可讀輸出，依 `printHuman` 與 lint 訊息字串推得）：
    ```
    codument doctor
      Documentation coverage: 82%
      …（ownership / dependency / risk 三行比例）
    inventory: mapped doc does not exist: docs/features/inventory.md
    in-scope source not mapped to any entry: public/js/price-check.js
    docs/features/orders.md: dangling link to ../concepts/sku.md
    docs/features/stock.md: bloated — 512 lines (> 400)
    ```
  - AI 巡讀（`review-codebase` 固定格式）：`# Codebase Review Report` → Date／Features reviewed／Total findings → Critical／High／Medium／Low → Highlights → Recommended Priorities。

### Skill 寫法 — **有**
- **格式：** `skills/<name>/SKILL.md`，YAML frontmatter `name`＋`description`，長篇內容放 `references/*.md`（例如 `skills/senior-frontend/references/react.md`）。沒有 `scripts/` 資料夾——需要執行的事都用 `codument` CLI 指令。
- **description 怎麼寫才會被正確觸發：** 領域 skills 用「做什麼＋涵蓋哪些技術＋Use whenever …＋Do NOT use for …（use 另一個 skill）」的**互斥寫法**，原始碼註解明說「是否觸發由 description 控制，而不是由有沒有安裝」（[`agent-profiles.ts#L36-L40`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/agent-profiles.ts#L36-L40)）。範例：[`skills/senior-backend/SKILL.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/skills/senior-backend/SKILL.md)、[`skills/code-reviewer/SKILL.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/skills/code-reviewer/SKILL.md)。流程 skills 的 description 很短，靠 AGENTS.md 的「Intent routing」段落主動指派（不等使用者點名）。
- **子代理人格式：** `agents/<name>.md`，frontmatter `name`、`description`、`tools`（白名單）、`model`。

### 支援哪些工具與安裝方式 — **有**
- Claude Code（原生）、Codex（可攜）、任何讀 `AGENTS.md` 的工具（徽章寫「any agent」）。Cursor 沒有專屬設定檔（程式中只有 `claude`、`codex` 兩個 profile，其他值會丟錯，[`agent-profiles.ts#L110-L129`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/agent-profiles.ts#L110-L129)）。
- 安裝：`npm install -D codument` → `npx codument init --agents codex,claude` → **開一個新的 AI 對話**（規則只在 session 開始時讀）→ 對 AI 說 `/update-docs` 讓它補文件 → 選用 `codument hooks install --ci`。

### 可以直接借用到使用者「基礎架構」的檔案或段落
1. [`CLAUDE.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/CLAUDE.md) 開頭三行：「共用規則在 AGENTS.md，以那份為正本」的寫法。
2. [`src/lib/scaffold.ts#L93-L238`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/src/lib/scaffold.ts#L93-L238) 裡這幾段最值得翻成中文放進你的 `AGENTS.md`：「Assumption gate（何時該停下來問人）」、「Step gates（實作→審查→提交）」、「Definition of Done」、「Pausing and resuming（交接）」。
3. [`rules/documentation.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/rules/documentation.md)：改程式必同步文件的規則＋登記表 JSON 範例。
4. [`templates/feature.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/templates/feature.md)：5 層文件範本（白話說明／設計取向／不變條件／決策／關鍵檔案）。
5. [`skills/plan-with-docs/SKILL.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/skills/plan-with-docs/SKILL.md) L65-L93 的計畫範本（Status／Outcome／Constraints／Acceptance evidence／Verification）。
6. [`skills/review-codebase/SKILL.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/skills/review-codebase/SKILL.md)：每日 AI 巡讀 skill 的骨架與報告格式。
7. [`agents/adversarial-reviewer.md`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/agents/adversarial-reviewer.md)：讓 GPT 審 Claude（或反過來）時的「獨立審查員」角色，findings JSON 格式可直接當兩個 AI 之間的交接格式。
8. [`templates/ci-codument.yml`](https://github.com/jakubsuplicki/codument/blob/d38a1d592ef6d9a0448265ebf941efde8c08f68b/templates/ci-codument.yml)：改成 `schedule` 觸發就是每日巡檢。

---

## 關鍵字

codument、文件漂移、doc drift、文件覆蓋率、documentation coverage、登記表、registry、單一事實來源、single source of truth、AGENTS.md、CLAUDE.md、受管區塊、managed section、三方合併、Claude Code、Codex、skills、SKILL.md、子代理人、subagent、對抗式審查、adversarial review、計畫核准、plan approval、交接、handoff、work state、PostToolUse hook、pre-commit hook、GitHub Actions、SARIF、巡檢、每日巡讀、孤兒文件、orphan doc、link rot、bloated doc、prose altitude、ADR、Definition of Done、Apache-2.0、TypeScript、tree-sitter
