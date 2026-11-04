# bmad-code-org/BMAD-METHOD — 用「角色＋技能（Skills）＋單一工單樹」讓 Claude／Codex 有紀律地協作開發的敏捷方法論

> 資料包｜分類：AI 協作規則・角色・技能｜掃描日期：2026-11-04｜commit：022be93
> GitHub：https://github.com/bmad-code-org/BMAD-METHOD｜⭐ 54994｜授權：MIT（程式碼）＋商標另行保留（BMad 名稱與 logo 不在 MIT 範圍內）｜主要語言：Python｜最近更新：2026-11-03

> 本次掃描的是 `main` 分支（commit `022be9314e4facd16826104a9f8033e1c5ed4fdc`，2026-11-02 提交）。**main 目前是 V7 預覽 alpha 版**，穩定版 v6.12 在另一個 `V6.12` 分支（本資料包沒有掃描 V6.12）。提示中提到的「Scrum Master、QA」角色在 V7 已被移除（見第 4、11 節），以下一律以 V7 實際內容為準。

固定 permalink 前綴（下文簡寫為 `B/`）：
`https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/`

---

## 1. 一句話＆可以拿來做什麼（針對這位使用者）

**一句話**：BMAD-METHOD 是一套「把 AI 開發流程寫成可安裝技能（SKILL.md）」的方法論，內建 6 個具名角色（分析師、PM、產品負責人 PO、架構師、UX、開發者）、一棵存在 repo 裡的工單樹（initiative → epic → story），以及一個專門維護 `AGENTS.md` 的技能，同一套檔案可裝進 Claude Code 與 Codex。

對你（倉儲／庫存 Web App ＋ 想讓 GPT 與 Claude 有秩序協作）最有用的地方：

1. **共用規則怎麼寫，有現成「標準答案」**：`bmad-project-context` 技能專門建立／接手／更新／稽核 repo 的 `AGENTS.md`，並把 `CLAUDE.md` 縮成一行 `@AGENTS.md`，讓 Claude 與 Codex 讀同一份規則。它附一份「什麼該寫、什麼不該寫、什麼時候才能刪」的準則（best-practices.md），非常適合拿來整理你現在「有點亂」的規則檔。
2. **防新舊版本衝突的做法很具體**：每份規則區塊都帶「Verified 日期＋commit SHA」的出處行；refresh 時用 `git log --diff-filter=DR` 比對被刪／改名的檔案，自動找出過期規則；兩條互相矛盾的規則被明確定義為「缺陷」。
3. **防漏、防重複有機制**：PO（Sofia）的 VALIDATE 檢查清單會檢查「每條需求都有人負責」「沒有無法解釋的重疊」「每個跨 epic 的決策只有一個家」；`tickets.py status` 會報出 `drift`（工單檔與計畫不一致）、`order_conflict`、循環依賴；retrospective 會產出「重複程式碼地圖（Duplication map）」。
4. **每日巡讀可以照它的零件組出來**：BMAD 本身沒有「每天巡檢整個專案」的內建排程，但它有 (a) 記憶型代理的 **Pulse**（排程喚醒、先整理記憶：合併重複、以新事實覆蓋舊事實、把要提醒的事放進 pending），(b) project-context 的 **audit**，(c) PO 的 **validate**。把這三者組成一個你自己的 `daily-patrol` 技能，就是你要的巡讀（第 11 節有範例）。
5. **讓 GPT 和 Claude 互相審查**：開發流程的 code review 步驟在沒有子代理時，會把審查 prompt 寫成獨立檔案，並明講「請在另一個 session（最好是不同的 LLM）執行後貼回結果」——正好是「Claude 寫、Codex 審」或反過來的官方做法。

不適合的地方：它是給「軟體開發」用的方法，和試算表、比價、影片生成無直接關係；V7 還在 alpha，常有破壞性變更。

---

## 2. 授權白話

- **程式碼授權：MIT**。`LICENSE` 前半是標準 MIT 條文（版權人 BMad Code, LLC，2025）。GitHub 顯示 `NOASSERTION`，原因是 LICENSE 檔尾端另外附加了一段「TRADEMARK NOTICE」，讓自動偵測認不出來；實際仍是 MIT。來源：`B/LICENSE`（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/LICENSE#L1-L29）
- **個人使用**：完全免費，可以修改、複製、把 SKILL.md 拆出來用。README 明講「free and open source, with no paywalled workflows or gated community」（`B/README.md#L71`）。
- **公司商用**：MIT 允許商用、修改、再散布，只要保留版權與授權聲明。但 **「BMad」「BMAD-METHOD」「BMad Method」等名稱與 logo 是商標，不在 MIT 授權內**（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/TRADEMARK.md#L18-L49）。你若做成自己的工具或販售，產品名稱不可含 BMad；可以寫「compatible with BMad Method」。
- **有沒有閉源／付費版**：本 repo 中沒有看到付費功能。生態系有其他官方模組（Builder、Test Architect、Loop、Game Dev 等，README L86-L97 列出），在其他 repo，本次未掃描，授權未確認。
- **你自己的 AI 工具費用**：BMAD 不收費，但需要你有 Claude Code 或 Codex 等工具的使用權，費用依各家方案（本 repo 未列價格，未確認）。

---

## 3. 技術棧與執行需求

| 項目 | 內容 |
|---|---|
| 核心內容 | 大量 Markdown 指令檔（SKILL.md、workflow.md、step-*.md、references/*.md）＋ TOML 設定（customize.toml、bmod.toml）。我用 `git ls-tree` 數：全 repo 626 個檔案，其中 `.md` 358 個 |
| 腳本 | Python 3.11+（`pyproject.toml` 的 `requires-python = ">=3.11"`），每支腳本用 PEP 723 內嵌依賴，以 `uv run` 執行。我數到 `.py` 共 96 支（其中名稱為 `test_*.py` 的測試 45 支） |
| 前端／後端／資料庫 | 無。沒有伺服器、沒有資料庫；狀態全部是 repo 內的 Markdown／TOML 檔（工單樹存在 `_bmad-output/`） |
| 文件網站 | `docs-site/` 是 Astro + Starlight（`docs-site/package.json`），只用來產生 docs.bmad-method.org |
| 安裝 | V7：`npx skills add bmad-code-org/BMAD-METHOD --skill '*'`（需要 Node.js/npm、Git、uv），然後在 AI 工具裡叫 `bmad` 技能執行 `bmad setup`。穩定版 v6.12：`npx bmad-method install`（Node 20.12+、Python 3.10+） — 來源 https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/start/install-bmad.md#L12-L40 |
| 硬體／GPU | 不需要 |
| API Key | 不需要 BMAD 自己的 Key；模型呼叫全由你的 AI 工具（Claude Code、Codex、Cursor…）負責。若用 GitHub／Jira／Linear 當工單庫，需要對應 CLI 或連線（例如 GitHub Issues 需 `gh` CLI 2.94+，見 `skills/bmad-agent-po/config/github-ticketing.toml`） |
| 網路 | `bmad setup` 檢查更新時會從 `raw.githubusercontent.com` 讀取各模組的 `bmod.toml`（`skills/bmad/scripts/setup.py#L1925-L1942`）；其餘腳本未見網路呼叫 |

---

## 4. 程式架構地圖

```
BMAD-METHOD/ (main = V7 preview)
├── AGENTS.md              # 本 repo 自己的代理規則，正是 bmad-project-context 產生的「受管區塊」示範
├── LICENSE / TRADEMARK.md # MIT ＋ 商標規範
├── action.yml             # GitHub Action：驗證別人 repo 的 skills/*/bmod.toml
├── pyproject.toml / uv.lock
├── tools/                 # 開發本 repo 用的工具（不會安裝給使用者）
│   ├── ticket-tree-rules.md   # ★ 所有讀寫工單樹的技能共同遵守的規則（單一事實來源）
│   ├── skill-validator.md     # ★ SKILL.md 撰寫規則目錄（SKILL-01..08、PATH、STEP、REF…）
│   ├── validate_skills.py     # 確定性驗證 12 條規則
│   ├── validate_file_refs.py  # 檢查技能間的檔案引用沒有斷鏈
│   └── tests/
├── docs/                  # 使用者文件（start/plan/build/customize/existing-codebases/toolsmith/reference）
├── docs-site/             # Astro 文件網站
└── skills/                # ★ 真正要安裝的 33 個技能資料夾（ls 計數）
    ├── bmad/                  # 中樞：說明、setup、遷移；scripts/ 有 render_skill、resolve_customization、memlog、roster…
    ├── bmod-method/           # 「method」模組紀錄：bmod.toml、roster.toml（角色名單）、retired.toml（改名／移除清單）、help/*.md
    ├── bmod-core-tools/       # 「core-tools」模組紀錄與說明
    ├── bmod-toolsmith/        # 技能製作模組的說明（craft-description 等）
    ├── bmad-agent-analyst/    # Mary 分析師
    ├── bmad-agent-pm/         # John 產品經理（PRD）
    ├── bmad-agent-po/         # Sofia 產品負責人：工單、切分、看板、驗證、重新規劃；scripts/tickets.py
    ├── bmad-agent-architect/  # Winston 架構師
    ├── bmad-agent-ux-designer/# Sally UX
    ├── bmad-agent-dev/        # Amelia 開發者
    ├── bmad-build/ bmad-build-auto/   # 開發流程（互動版／無人值守版），含審查鏡頭 review-prompts/
    ├── bmad-code-review/      # 程式碼審查（三段：收集→審查→分類去重→分派）
    ├── bmad-retrospective/    # epic 回顧：重複地圖、模式偏離、規格對帳
    ├── bmad-project-context/  # ★ 建立／接手／更新／稽核 AGENTS.md
    ├── bmad-prd/ bmad-ux/ bmad-architecture/ bmad-product-brief/ bmad-prfaq/   # 規劃文件產生器
    ├── bmad-party-mode/       # 多角色圓桌討論（session／subagent／agent-team 模式）
    ├── bmad-review/           # 文件與程式的多鏡頭審查（結構、文字、對抗式…）
    ├── bmad-shard-pro/        # 把超長文件切成可查的分片
    ├── bmad-toolsmith/        # 「Smithy」技能工匠：shapes/（7 種技能形狀模板，含 memory-agent 的 PULSE）
    ├── bmad-eval/             # 技能觸發測試與評測（支援 claude / codex CLI）
    └── 其他：advanced-elicitation、brainstorming、deep-recon、forge-idea、ingest、walkthrough、qa-generate-e2e-tests、customize
```

計數方法：`git ls-tree -r --name-only HEAD` 取得檔案清單；`ls -d skills/*/ | wc -l` = 33；位於 `skills/<名稱>/SKILL.md` 的檔案 = 33；`customize.toml` = 27 個。

**V7 移除的角色**：`skills/bmod-method/retired.toml` 的 `removed` 清單包含 `bmad-agent-sm`（Scrum Master）、`bmad-agent-qa`（QA）、`bmad-agent-quick-flow-solo-dev` 以及大量 v6 的 `bmad-bmm-*` 技能（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmod-method/retired.toml#L1-L40）。SM 的職責併入 PO（Sofia），QA 併入開發者的 `QA` 選單與 code review。技術文件撰寫者 Paige「暫停中」（`docs/reference/skills-and-agents.md#L59`）。

---

## 5. 核心功能怎麼實作

| 功能 | 程式碼位置 | 實作重點 |
|---|---|---|
| 角色（代理）定義 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-pm/SKILL.md#L19-L75 | 每個角色就是一個 SKILL.md：啟動時先跑 `resolve_customization.py` 合併三層設定 → 執行 prepend 步驟 → 扮演人設 → 載入 `persistent_facts` → 讀設定 → 打招呼（每則訊息前綴圖示）→ append 步驟 → 顯示選單（代碼／說明／對應技能），等使用者選擇 |
| 角色可調部分 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-pm/customize.toml#L1-L59 | 名字與職稱寫死；`role`、`identity`、`communication_style`、`principles`、`persistent_facts`（可用 `file:` 載入你的規則檔）、`menu` 可被團隊／個人覆寫 |
| 三層設定合併（預設→團隊→個人） | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad/scripts/config_utils.py#L55-L116 | `customize.toml` → `_bmad/custom/<skill>.toml` → `_bmad/custom/<skill>.user.toml`。規則：純量後者覆蓋；表格深度合併；帶 `code`/`id` 的表格陣列按鍵替換或追加；其他陣列一律追加 |
| 角色名單 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmod-method/roster.toml#L11-L70 | 6 位成員（code、skill、name、icon、title、persona）＋ 一個 `product-team` 群組（含場景描述，`memory = true`），party mode 用它來開圓桌 |
| 工單樹與狀態 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/tools/ticket-tree-rules.md#L1-L49 | 樹在 `{output_folder}/{active_initiative}`；每個容器有 `tickets/tickets.toml`；狀態只寫在 plan 的 frontmatter；**誰能寫哪個狀態**有表格（`done` 只有使用者或協調器能標，`dropped` 只有 PO 能標，沒有技能能把工單推過 `built`） |
| 工單樹腳本 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/scripts/tickets.py#L1-L34 | 1885 行（`wc -l`）。指令 `next`、`status`、`find`、`pull`、`mark`、`mirror`、`move`；輸出單一 JSON；會報 `drift`、`unpinned_after`、`undeclared_after`、`order_conflict`、循環依賴與 `problems` |
| drift 偵測 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/scripts/tickets.py#L536-L543 | 若工單檔的 `after`／`hitl` 與 `tickets.toml` 裡的登錄不同，該列就帶 `drift`（兩個值都列出） |
| 需求變更（Replan） | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/references/replan.md#L1-L15 | 五步：說明變更（需求變還是做法變）→ 重新推導需求（保留 id）→ 重新切分 → 丟棄不再需要的 → 在每個受影響容器的 Notes 寫一行帶日期的 `Decision:`。「不另開提案檔」、「不改寫已完成的東西」、「進行中的工單不改其 plan」 |
| 一致性檢查清單 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/references/validate-checks.md#L1-L67 | 分 Ticket／Set／Tree／Dependencies／Closure 五段；由「全新上下文的子代理」執行；結果分成 fix（機械修正）／suggest（附理由）／ask（問使用者） |
| 規則檔維護 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/SKILL.md#L1-L127 | 五種意圖 setup／adopt／refresh／record／audit；用「ledger（帳本）」追蹤每條既有規則的去向：retain／rewrite／relocate／automate／delete；寫入前一定先給使用者看完整區塊；從不 commit |
| 開發流程 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-build/workflow.md#L12-L31 | 「Ready for Development」標準（可執行、有序、可測 Given/When/Then、無 TBD、無矛盾）；一個 plan 只做一個使用者目標，建議 900–1600 tokens |
| 多鏡頭審查 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-build/customize.toml#L93-L186 | quick 一個鏡頭；thorough 四個：blind-hunter、edge-case-hunter、verification-gap、intent-alignment，平行跑子代理，審查者「只看不改」 |
| 跨模型審查 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-build/step-04-review.md#L47 | 沒有子代理時，把每個鏡頭的完整 prompt 寫成檔案，HALT，請人「在另一個 session（最好是不同 LLM）」跑完貼回 |
| 審查結果去重 | `skills/bmad-code-review/step-03-triage.md`（L22、L77-L92，以 grep 確認） | 先逐條判定、不要提早合併；判定後才按「根本原因」去重，每個合併後的 finding 記得來源，編號 F1、F2… |
| 記憶日誌 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad/scripts/memlog.py#L1-L35 | `.memlog.md` 只能追加、按時間排序、沒有「完成」旗標；用 OS 的 O_APPEND 確保多個程序同時寫不會互相蓋掉 |
| 記憶型代理＋排程 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/toolsmith/agents-with-memory.md#L23-L82 | 代理的「聖所」在 `_bmad/memory/<skill>/`；`wake.py` 啟動時印出身分檔與記憶地圖；Pulse 讓它在無人時排程醒來先整理記憶再做 PULSE.md 的任務 |

---

## 6. 值得拆出來用的部分（給 A＋B＋C 組合用）

| 元件 | 位置（permalink） | 依賴 | 拆出難度 | 怎麼接到別的專案 |
|---|---|---|---|---|
| AGENTS.md 撰寫準則 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/references/best-practices.md#L1-L84 | 無（純文字） | 低 | 直接放進你的 repo（例如 `docs/agent-rules-guide.md`），當作「寫規則前先讀」的準則；或給 Claude 讀後幫你整理現有 CLAUDE.md |
| AGENTS.md 區塊範本（含出處行） | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/references/template.md#L1-L55 | 無 | 低 | 照 6 段（Orientation／Policy／Where things are／Running and verifying／Conventions／Known pitfalls）＋ `<!-- bmad:context -->` 標記寫你倉儲 App 的規則 |
| bmad-project-context 整個技能 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/SKILL.md | 第 1 步呼叫 `_bmad/scripts/resolve_customization.py`；找不到時會退回讀 customize.toml | 低～中 | 複製資料夾到 `.claude/skills/` 與 `.agents/skills/`；刪掉 On Activation 第 1、2 步的 `uv run` 就能獨立運作 |
| 一致性檢查清單 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/references/validate-checks.md | Jinja 佔位（`{% if workflow.checks.* %}`）可刪 | 低 | 改寫成你的「功能清單／需求清單」檢查：每項需求有負責人、無重疊、每個共用決策只有一個家 |
| Replan 流程 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/references/replan.md | 依賴 spec.md／slice.md／board.md 的概念 | 低 | 只取五個步驟＋「Decision: 日期＋理由」寫法，當成你的「需求變更 SOP」 |
| 工單 frontmatter 與 Notes 格式 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/assets/ticket-template.md#L1-L73 | 無 | 低 | `sources:`、`companions:`、`after:`、`refined:` 欄位＋ `Decision:`／`Source conflict:` 兩種註記，直接拿來當你的任務單格式 |
| tickets.toml 範本 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/assets/tickets-template.toml#L1-L35 | 無 | 低 | id 永不重用、`after` 只寫真正前置條件、`verify` 寫「非開發者也能跑的驗收」 |
| tickets.py（工單樹查詢器） | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/scripts/tickets.py | Python 3.11 標準函式庫（tomllib）；需照 ticket-tree-rules 的資料夾結構 | 中 | 若你採用相同目錄結構，可讓巡讀技能每天跑 `tickets.py status` 抓 drift／循環／順序衝突 |
| 三層設定合併 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad/scripts/config_utils.py#L55-L116 | Python 標準函式庫 | 低 | 約 60 行，可直接移植成 JS（你的 App 是 JS）做「預設→店家→個人」設定合併 |
| memlog（只追加日誌） | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad/scripts/memlog.py | 標準函式庫 | 低 | 當成「AI 交接日誌」：每個 AI 做完事 `append` 一行，不准改舊行，新一行自動取代舊決策 |
| 記憶型代理形狀（含 PULSE） | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-toolsmith/shapes/memory-agent/assets/PULSE-template.md | 模板內有 `{pulse-*}` 佔位，要自己填 | 中 | 做你的「巡讀員」代理：PULSE.md 填每日巡檢任務，HOW-I-REMEMBER 的 tending 規則負責合併重複與更新過期 |
| 審查鏡頭 prompt | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-build/review-prompts/verification-gap.md | 無 | 低 | 給 Codex 當「審查員」的 prompt：專抓沒測到、測試過期（stale-verification）的地方 |
| Retrospective 彙總視角 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-retrospective/references/aggregate-views.md#L7-L17 | `git_evidence.py`（可選） | 低 | 每週巡檢加入「重複地圖、模式偏離、規格對帳」三項 |
| SKILL.md 驗證規則 | https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/tools/skill-validator.md#L102-L170 | 無（validate_skills.py 需 pyyaml） | 低 | 你自己寫技能時的自我檢查表 |

---

## 7. AI／Claude 整合

- **用哪些模型**：BMAD 本身不呼叫任何模型 API，全靠你使用的 AI 程式工具。文件列出的安裝目標：Claude Code 用 `.claude/skills/`；Cursor、Windsurf、Codex、Auggie、Amp 等多數工具用 `.agents/skills/`；Cline 用 `.cline/skills/` 等（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/reference/skills-and-agents.md#L31-L38）。
- **prompt 放在哪**：全部是 `skills/<技能>/` 裡的 Markdown。V7 有兩種技能：一般技能（SKILL.md 直接寫指令）和「rendered skill」——SKILL.md 只叫你跑 `render_skill.py`，它用 Jinja2 把 workflow.md 及各步驟檔依照設定渲染成快照再執行（例如 `bmad-agent-po/SKILL.md`、`bmad-retrospective/SKILL.md`）。
- **Skills**：完全以 Agent Skills 規格為核心（`tools/skill-validator.md` 第 3 行明寫依 agentskills.io 規格）。
- **Claude 專屬功能**：party mode 的 `agent-team` 模式標明「Claude Code only」，不支援時退回 subagent，再退回單一 session（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-party-mode/references/mode-agent-team.md#L1-L5）。
- **Codex 支援**：README 寫有 Codex plugin marketplace（`codex plugin marketplace add bmad-code-org/bmad-plugins`），但安裝文件明說這個 marketplace「還沒為 V7 重建」，目前請用 Skills CLI（`docs/start/install-bmad.md#L53-L71`）。評測工具 `bmad-eval` 的 harness 範例同時給了 `codex exec` 與 `claude -p` 兩種命令（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-eval/references/harness.md#L13-L24）。
- **MCP**：本身沒有 MCP 伺服器；project-context 的 `external_sources` 可放 `tool:name` 指向 MCP 知識庫（`skills/bmad-project-context/customize.toml`）。
- **能不能換成 Claude**：本來就是原生支援 Claude Code。

---

## 8. 擴充方式與 API

1. **不改原檔，用覆寫檔客製**：`_bmad/custom/<skill>.toml`（團隊、要 commit）與 `<skill>.user.toml`（個人、應 gitignore）。可以加 `persistent_facts = ["file:{project-root}/docs/倉儲規則.md"]` 讓每個角色都先讀你的規則，或用 `activation_steps_prepend` 在啟動前跑檢查。
2. **團隊層級的分工**（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/customize/adopt-bmad-across-a-team.md#L244-L253）：
   - IDE session 檔（`CLAUDE.md`／`AGENTS.md`）→ 每個 session 都會讀，放短而通用的規則
   - 角色客製 → 該角色派出的每個流程
   - 流程客製 → 單次流程的輸出格式、範本
   - 中央設定 → 角色名單與共用路徑
3. **自己做技能**：`bmad-toolsmith`（Smithy）有 7 種形狀：plain-skill、script-utility、rendered-skill、agent、rendered-agent、memory-agent、single/multi-skill-module（`skills/bmad-toolsmith/shapes/`）。
4. **工單庫外掛**：PO 支援 repo（預設）、GitHub Issues、Jira、Linear、Notion、Trello（`skills/bmad-agent-po/config/*-ticketing.toml`，我數到 6 個）。
5. **模組化發佈**：每個模組有 `bmod.toml`（版本、包含的技能、必要技能），改名或移除的技能列在 `retired.toml`，`bmad setup` 會提示刪除舊技能並搬移客製檔。
6. **腳本介面**：`tickets.py`、`memlog.py`、`resolve_config.py` 等都輸出 JSON，可被你自己的巡讀腳本呼叫。

---

## 9. 程式品質與風險

- **維護狀況**：非常活躍。最新 commit 2026-11-02；CHANGELOG 有 59 個 `## ` 版本標題（grep 計數），v6.12.0 於 2026-09-03 發佈，V7 預計 2026 年 11 月中正式版（README L18）。
- **測試與 CI**：pre-commit 跑 ruff、rumdl（Markdown lint）、yamllint、`validate_file_refs.py --strict`、`validate_skills.py --strict`、`validate_manifests.py`、pytest（`.pre-commit-config.yaml#L34-L55`）；GitHub Actions 在 ubuntu 與 windows 都跑（`.github/workflows/quality.yaml`）。repo 規則明講「不為 LLM 輸出寫自動測試」（`AGENTS.md#L33`）。
- **資安**：安裝文件主動說明掃描器會把部分技能標為中／高風險，原因是：技能會 `uv run` 專案內 `_bmad/scripts/` 的 Python、`_bmad/custom/` 可以加啟動步驟、會讀別人寫的工單／PR 文字（提示注入風險）（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/start/install-bmad.md#L42-L51）。**你只該放自己信任的客製檔。**
- **隱私**：記憶型代理的聖所可能存個資，文件提醒先決定 `_bmad/memory/` 要不要進版控（`docs/toolsmith/agents-with-memory.md` 末段）。
- **遙測**：在 `skills/` 與 `tools/` 內 grep `telemetry|posthog|analytics` 未發現遙測程式；唯一網路行為是 setup 檢查更新。
- **已知的坑**：
  1. **V7 alpha 變動大**：技能名稱常改（retired.toml 已列出 40 個以上的舊名稱），網路上的教學多是 v4～v6（有 SM、QA、dev-story、create-story 等），跟 main 對不上。
  2. **重量級**：完整流程（brief → PRD → UX → architecture → PO 切分 → build → review → retro）對一人小店太重；建議只取局部。
  3. **需要 uv＋Python 3.11**：Windows 使用者要先裝 uv。
  4. **技能之間刻意複製而非共用**：例如 `references/deletion-check.md` 在 bmad-build、bmad-build-auto、bmad-code-review 三份 md5 完全相同；`claims-check.md` 則 build 與 code-review 兩版文字已不同（我用 `md5sum` 與 `diff` 比對）。`tools/ticket-tree-rules.md` 也明寫「沒有技能載入這份檔；規則變了要手動改每個技能」。這是為了讓技能能獨立安裝的取捨，但也代表「同一規則多份副本」的漂移風險要靠人維護——你自己設計時要注意。
  5. **Codex marketplace 尚未支援 V7**（見第 7 節）。

---

## 10. 跟其他專案組合的建議

- **你的基礎架構建議（只取 BMAD 的精華，不整套搬）**：
  1. `AGENTS.md`：用 bmad-project-context 的 6 段範本寫，帶出處行（Verified 日期＋commit）。
  2. `CLAUDE.md`：只放一行 `@AGENTS.md`（加上真的只屬於 Claude 的少數規則），讓 Claude 和 Codex 讀同一份；這正是 project-context 在 adoption 時的建議（`SKILL.md#L97`）。
  3. `.claude/skills/` 與 `.agents/skills/` 放同一組技能（可以用一個資料夾＋同步腳本，或兩邊各裝一次）。
  4. `docs/decisions/adr-<主題>.md`：每個重要決策一份，AGENTS.md 只寫「何時去看」不抄內容（`skills/bmod-method/help/preparing-a-repo-for-agents.md#L25-L32`）。
  5. 任務單：用 BMAD 的 ticket frontmatter＋`Decision:`／`Source conflict:` 註記，或直接用 GitHub Issues。
  6. 每日巡讀技能：見第 11 節「定期巡檢」。
- **與其他 04 類專案搭配**：若別的專案提供「單一規則檔同步到多個工具」（例如 .ruler 類工具）或排程／hook 框架，可以用它們負責「分發與排程」，BMAD 負責「規則內容該怎麼寫、怎麼稽核、需求變更怎麼處理」。（其他專案的具體能力請以各自資料包為準，此處未確認。）
- **與你的 Firebase 倉儲 App**：BMAD 與語言無關。可以把你的 Firestore 欄位規則、庫存計算規則寫進 AGENTS.md 的「Conventions that differ from defaults」，例如「數量一律整數、金額用整數分」這種跨檔案規則（best-practices.md 的 Cross-component rules 一節，L18）。

---

## 11. 規則／角色／巡檢 檢查表

### 11.1 共用規則怎麼寫 —— **有**

- **檔案結構**：以 `AGENTS.md` 為主檔，規則放在 `<!-- bmad:context -->` … `<!-- /bmad:context -->` 標記之間，標記外的內容永不被自動改寫；本 repo 自己的 AGENTS.md 就是範例（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/AGENTS.md#L1-L35）。區塊固定 6 段（template.md L1-L14）。
- **讓 GPT（Codex）和 Claude 讀同一份**：針對讀不同檔名的工具（例如 Claude Code 的 `CLAUDE.md`），技能會「提議並驗證」一行 `@AGENTS.md` 匯入（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/existing-codebases/set-and-maintain-project-context.md#L64-L72）；並且「同一條規則不可出現在兩個會被載入的檔案裡」（SKILL.md L97）。
- **分層（全域／專案／子資料夾）**：
  - 全域：「跨所有專案重複的規則、個人偏好」放使用者的全域代理設定（best-practices.md L65-L69）。
  - 專案：repo 根目錄 AGENTS.md，要 commit。
  - 子資料夾：只有在「規則只屬於該子樹、份量夠多、能明顯縮小根檔、**每個在用的工具都驗證過會載入**、使用者同意」時才拆子 AGENTS.md；否則在根檔寫「in `src/importer/`: …」這種帶路徑的行。原因：多個工具在 session 開始時只建一次規則鏈，之後才進入的子資料夾規則會被看不到（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/references/best-practices.md#L49-L55）。
- **優先順序**：BMAD 技能的設定是「預設 → 團隊 → 個人」後者勝（config_utils.py L77-L116）。AGENTS.md 層面沒有複雜的優先序，而是「兩條互相矛盾的有效規則本身就是缺陷」，要提出修正（SKILL.md L74）。
- **什麼該寫（Admit）**：程式碼表達不了的政策、設定檔說不清的執行方式、與預設不同的慣例、**有實際觀察證據**的陷阱、跨元件規則、必要的工具版本、入口指標。偏好「禁止＋給替代方案」的寫法（best-practices.md L11-L22）。
- **什麼不該寫（Exclude）**：目錄樹、技術棧清單、有趣但不需要的東西、能交給 linter 的風格規則、空話、照抄的命令清單、貼上的程式碼、願景、歷史敘述（L24-L35）。

### 11.2 角色設計 —— **有**

| 角色 | 技能 | 職責（role） | 選單（skills） | 向誰交接 |
|---|---|---|---|---|
| Mary 分析師 | `bmad-agent-analyst` | 投入專案前的發想、研究、分析 | BP 腦力激盪、MR/DR/TR/TS/CR/UV 各類研究（都轉給 `bmad-deep-recon`）、CB 產品簡報、WB PRFAQ、PC 專案規則（`bmad-project-context`） | 簡報／研究 → PM、PO |
| John 產品經理 | `bmad-agent-pm` | 把產品願景變成經驗證的 PRD，「交給 Sofia 提煉成需求」 | PRD（`bmad-prd`） | PRD → PO |
| Sofia 產品負責人 | `bmad-agent-po` | 擁有 backlog：每張工單要什麼、怎麼切、怎樣算完成、計畫碰到現實時改什麼 | SPEC、TICKETS、REFINE、BOARD、VALIDATE、REPLAN、STORE | 工單 → 架構師／UX／開發者 |
| Winston 架構師 | `bmad-agent-architect` | 把工單需求轉成架構決策 | CA 架構骨幹（`bmad-architecture`） | 架構 → 開發者 |
| Sally UX | `bmad-agent-ux-designer` | 把使用者需求轉成 UX 規格 | CU（`bmad-ux`） | UX → 架構／開發 |
| Amelia 開發者 | `bmad-agent-dev` | 測試先行實作已核准的 story | BD 實作（`bmad-build`）、QA 產生 E2E 測試、CR 程式碼審查、ER epic 回顧 | 完成到 `built` → 使用者標 `done` |

來源：各角色 `customize.toml` 的 `role` 與 `[[agent.menu]]`（例如 https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-agent-po/customize.toml#L23-L70 ），總表見 `docs/reference/skills-and-agents.md#L46-L60`。

- **可用工具**：角色本身不限制工具；權限來自你的 AI 工具。審查鏡頭則明確限制「只檢視、不改碼、不跑測試、不叫其他技能、不再開子代理」（bmad-build/customize.toml L117 等）。
- **誰向誰負責**：狀態寫入權限是最清楚的「責任表」：`draft`～`built` 由 build 技能寫；`blocked` 由無人值守 build 寫並附原因；`done` 只有使用者或協調器；`dropped` 只有 PO 在使用者同意時（ticket-tree-rules.md L31-L39）。
- **交接媒介**：不是聊天記錄，而是檔案——plan 檔（frontmatter 帶 `ticket`、`baseline_revision`、`status`）、epic 檔、`.memlog.md`。開發流程甚至規定派工給子代理時「plan 就是唯一事實來源」，不要在派工訊息另外夾帶規則（`skills/bmad-build/step-03-implement.md` L31，以 grep 確認）。

### 11.3 防漏 —— **有**

- **任務追蹤**：工單樹（initiative／epic／story）＋ `tickets.toml`；`tickets.py next` 把工單分成 ready_to_refine／ready_to_start／in_progress／blocked，blocked 會列出 `waiting_on`、`blocked_reason` 或待回答的 `unknown`。
- **完成前驗證**：Ready for Development 標準（workflow.md L12-L21）；每個 entry 必須有「非開發者也能執行的 `verify`」（validate-checks.md L9）；Closure 檢查要求「用實作證據核對 Done when，而不是看子工單狀態」（L61-L63）；verification-gap 鏡頭專抓沒被測到或測試已過期的變更。
- **交接紀錄**：plan 的 `baseline_revision` 記錄起始 commit，code review 從那裡算 diff，並在 plan 末尾追加帶日期的 `## Code Review` 區塊；被延後的問題寫進 `deferred-work.md`（ticket-tree-rules.md L41-L49）。
- **觀察到 AI 犯錯就記下來**：project-context 的 `record` 意圖——錯一次記為 note，重複或代價高才變成規則；能機械防止的改提議 hook／lint／CI（SKILL.md L107-L111）。

### 11.4 防重複 —— **部分有**

- **規則重複**：同一條規則不得出現在兩個會被載入的檔案；重複（逐字或換句話說）只留一份（project-context SKILL.md L97）。
- **需求／工單重疊**：Tree 檢查「沒有無法解釋的重疊」「多個 epic 共用的決策只能有一個家」；Dependencies 檢查「沒有依賴關係的項目不能共用同一段程式碼、設定、schema」，否則要加 `after` 或合併（validate-checks.md L35-L59）。
- **程式碼重複**：retrospective 的 Duplication map——「兩個 session 各自寫了幾乎一樣的邏輯，或第二個 session 不知道已有 helper 又重寫一次」（aggregate-views.md L10）；並建議每個 epic 結束做一次重構（preparing-a-repo-for-agents.md L34-L40）。
- **審查結果去重**：code-review triage 依根本原因合併 findings（step-03-triage.md L77-L92）。
- **記憶重複**：記憶型代理的 tending 會「把同一主題的兩個檔合併成一個」（HOW-I-REMEMBER-template.md L31）。
- **重複角色偵測**：**沒有**自動偵測；是靠 `retired.toml` 人工維護改名與移除。
- **限制**：BMAD 自己的技能之間就有刻意複製的檔案（見第 9 節），沒有自動檢查副本是否一致。

### 11.5 防新舊版本衝突 —— **有**

- **版本標記**：AGENTS.md 區塊第一行就是 `Verified <日期> against <SHA>`（template.md L18，AGENTS.md L2）；模組版本在 `bmod.toml`（例如 `version = "6.13.0-next"`）。
- **過期（drift）偵測**：refresh 時讀出處行，對自該 SHA 以來被刪除或改名的檔案跑 `git log --diff-filter=DR --name-only`，證據不在了的規則就更新或移除（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-project-context/SKILL.md#L89-L91）；`tickets.py` 的 `drift` 欄位抓工單檔與登錄不一致。
- **單一事實來源**：需求行只能由 SPEC 推導，手動變更要寫進 memlog；「較晚的 memlog 項目取代較早的」；新資料或來源與 memlog 不一致時，**每一處不一致都要問使用者**是修正（新增 memlog 再重推）還是忽略（寫 `Decision:`），絕不默默決定（`skills/bmad-agent-po/references/spec.md` L17、L35，以 grep 確認）。程式碼與需求矛盾時寫 `Source conflict:`（slice.md L17）。
- **變更提案／封存**：Replan 不開提案檔，而是在受影響容器寫 `Decision:`；已完成或丟棄的工單「就是紀錄」，不會被改成新範本（ticket-tree-rules.md L38）；過時的規劃文件可封存，但不能刪除仍有效的 plan（artifact-lifetime.md L7）。
- **刪規則的門檻**：只有四種理由能刪：已過期或錯誤（附證據）、已被機械檢查強制、有害或與其他規則衝突且輸了、使用者逐條同意。「最近沒出事」不是理由（best-practices.md L71-L84）。
- **技能版本**：`retired.toml` 列出 renamed／removed，`bmad setup` 會提示移除舊技能並搬移客製檔（setup.md L51-L55）。

### 11.6 定期巡檢 —— **部分有（有排程概念，但沒有現成的「每日巡讀整個專案」）**

- **有的**：記憶型代理的 **Pulse**——「代理在無人時依排程醒來，先整理記憶，再做 PULSE.md 列出的任務」（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/docs/toolsmith/agents-with-memory.md#L80-L82）。PULSE.md 範本有「預設頻率、安靜時段、任務路由表、State（最後檢查時間、待辦）」（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmad-toolsmith/shapes/memory-agent/assets/PULSE-template.md#L1-L28）。整理（tending）四動作：消化 raw、合併重複檔、以新事實覆蓋被新 session 推翻的舊事實、把要提醒的放進 `memory/pending.md`，最後寫日期到 `memory/.tended`（HOW-I-REMEMBER-template.md L29-L31）。
- **沒有的**：repo 裡沒有 cron 設定、hook 或 GitHub Action 去「每天」觸發；Pulse 要靠你的工具或系統排程以 `--pulse` 喚醒（具體如何呼叫，repo 只寫「invoked with --pulse」，未確認各工具的實際指令）。CI 只在 push／PR 時跑驗證，不是每日巡檢。
- **報告格式**：BMAD 沒有每日巡檢報告範本。最接近的是 project-context audit 的報告順序：「無法驗證或過期的 → 缺少的 → 已經好的 → ledger（每筆搬移、自動化、刪除逐條列）」（best-practices.md L84），以及 PO validate 的 fix／suggest／ask 三分類。

**依 BMAD 零件組出來的每日巡讀報告範例**（這是我依上述規則整理的建議格式，不是 repo 原有檔案）：

```markdown
# 每日巡讀 2026-11-05（對照 commit a1b2c3d）
## 1. 過期／無法驗證（project-context audit）
- AGENTS.md「庫存匯入在 src/import.js」→ 檔案已於 9f3e… 改名為 src/importer/index.js（git log --diff-filter=DR）。建議：rewrite
## 2. 新舊衝突（Source conflict）
- CLAUDE.md 說「單價存小數」，AGENTS.md 說「金額一律整數分」→ 兩條有效規則矛盾。ask：保留哪條？
## 3. 重複
- 規則「不要直接寫 Firestore」同時出現在 AGENTS.md 與 .cursor/rules/db.md → 只留 AGENTS.md，另一處刪除（理由：重複載入）
- src/utils/price.js 與 src/pages/cost.js 各有一份計算毛利的函式（duplication map）→ 開一張 refactor 工單
## 4. 漏掉的
- 工單 2.3「盤點差異報表」狀態 built 已 3 天，沒有 verify 結果 → 請人執行驗收
- deferred-work.md 新增 2 筆，尚未排入 backlog
## 5. 決策紀錄
- Decision (2026-11-05): …（使用者回覆後補）
```

### 11.7 Skill 寫法 —— **有，而且很完整**

- **SKILL.md 格式**：YAML frontmatter 必須有 `name`（須與資料夾同名）與 `description`，之後必須有內文（SKILL-01～08，https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/tools/skill-validator.md#L102-L168）。
- **description 怎麼寫才會被觸發**：description 是技能「唯一的觸發依據」，路由器只看它；寫法是「5～8 字第三人稱摘要」＋「Use when the user says …」加上使用者真的會打的引號句；一種情境一句、不要堆同義詞；描述使用者的問題而非工具症狀；跟兄弟技能搶請求時加「Not for …」；角色型技能例外，要列出所有內建能力的觸發句；只被點名呼叫的技能可加 `disable-model-invocation: true`；上限 1024 字元（https://github.com/bmad-code-org/BMAD-METHOD/blob/022be9314e4facd16826104a9f8033e1c5ed4fdc/skills/bmod-toolsmith/help/craft-description.md#L1-L15 ；SKILL-06 見 skill-validator.md L143-L150）。PO 的 description 就是「角色＋一長串觸發句」的範例（bmad-agent-po/SKILL.md L3）。
- **觸發測試**：`evals/triggers.json`，每筆 `{"query": ..., "should_trigger": true/false}`，刻意放「近似但不該觸發」的句子（例：`skills/bmad-shard-pro/evals/triggers.json`）。
- **資料夾結構**：`SKILL.md`、`references/`（按需讀的參考）、`assets/`（範本）、`scripts/`（腳本與 `scripts/tests/`）、`evals/`、`customize.toml`、`bmod.toml`；步驟型技能用 `step-NN-*.md` 或 `steps/`（skill-validator.md 的 Skill Layouts 一節）。
- **腳本放哪、怎麼叫**：放 `scripts/`，以 `uv run {skill-root}/scripts/xxx.py` 呼叫（PATH-06）；不可直接引用別的技能資料夾裡的檔案（PATH-05），共用資源要放到技能外的設定路徑。
- **寫作哲學**：「技能是每次都會被完整讀取的 prompt，長度與模糊每次都要付費；不要為罕見情況加指令」「與其模稜兩可不如刪掉」（本 repo AGENTS.md L27-L33）。

### 11.8 支援哪些工具與安裝方式 —— **有**

- Claude Code（`.claude/skills/`）、Codex、Cursor、Windsurf、Auggie、Amp（`.agents/skills/`）、Cline、IBM Bob、Antigravity、AdaL 等（skills-and-agents.md L31-L38）。
- 安裝：`npx skills add bmad-code-org/BMAD-METHOD --skill '*'` → 在工具中呼叫 `bmad` 執行 `bmad setup`；更新再跑一次 `bmad setup`。Claude Code 的 `/plugin marketplace add bmad-code-org/bmad-plugins` 與 Codex 的 `codex plugin marketplace add …` 目前仍是 V7 前的舊版（install-bmad.md L53-L71）。
- 穩定版 v6.12：`npx bmad-method install`（不在本次掃描範圍）。

### 11.9 可以直接借用到你「基礎架構」的檔案或段落

1. `skills/bmad-project-context/references/best-practices.md` — 整份：規則該寫／不該寫／刪除四理由／分層與載入。
2. `skills/bmad-project-context/references/template.md` — AGENTS.md 六段範本＋出處行範例。
3. `skills/bmad-project-context/SKILL.md` — 整個技能（refresh、record、audit 三段尤其適合做巡讀）。
4. `AGENTS.md`（repo 根目錄）— 一份實際在用、35 行的受管區塊範例。
5. `skills/bmad-agent-po/references/validate-checks.md` — 一致性檢查清單。
6. `skills/bmad-agent-po/references/replan.md` — 需求變更 SOP。
7. `skills/bmad-agent-po/assets/ticket-template.md`、`assets/tickets-template.toml` — 任務單格式（`Decision:`／`Source conflict:`）。
8. `tools/ticket-tree-rules.md` — 「誰能寫哪個狀態」的責任表寫法。
9. `skills/bmad-toolsmith/shapes/memory-agent/assets/PULSE-template.md` 與 `HOW-I-REMEMBER-template.md` — 巡讀員的排程與記憶整理規則。
10. `skills/bmad-retrospective/references/aggregate-views.md` — 重複地圖、模式偏離、規格對帳。
11. `skills/bmad-build/review-prompts/verification-gap.md`、`edge-case-hunter.md` — 給 Codex 的審查員 prompt。
12. `skills/bmod-toolsmith/help/craft-description.md`、`tools/skill-validator.md` — 寫技能的 description 與格式檢查。
13. `skills/bmad/scripts/memlog.py` — 只追加的 AI 交接日誌。
14. `docs/customize/adopt-bmad-across-a-team.md` L244-L253 — 四層規則各自負責什麼的表格。

---

## 關鍵字

BMAD-METHOD、BMad Method、敏捷 AI 開發、AI 協作、多代理、角色設計、產品負責人、Product Owner、架構師、開發者代理、AGENTS.md、CLAUDE.md、@AGENTS.md 匯入、共用規則、專案規則、規則分層、SKILL.md、Agent Skills、技能描述、description 觸發、trigger eval、customize.toml、三層設定合併、工單樹、ticket tree、tickets.toml、backlog、需求變更、replan、Decision 紀錄、Source conflict、單一事實來源、drift 偵測、過期規則、staleness、git log --diff-filter、一致性檢查、checklist、validate、重複偵測、duplication map、code review、跨模型審查、Claude Code、Codex、Cursor、memory agent、Pulse、排程巡檢、每日巡讀、memlog、只追加日誌、retrospective、MIT、商標
