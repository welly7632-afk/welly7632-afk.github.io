# daily-patrol 檢查清單

這份是 `SKILL.md` 的細節。需要時才讀：A 部分對應 `scripts/mech-check.sh`；B 部分是 AI 要做的語意判讀；C 部分是嚴重度規則；D 部分教你避免誤報；E 部分是手動替代指令。

**代碼規則：** 第一個字母是類別，數字是項目。報告表格的「類別」欄填 `類別名（代碼）`，例如 `重複（D1）`。

| 字母 | 類別 | 老闆在意的事 |
|---|---|---|
| M | 漏掉 | AI 說做完了，但其實沒做／沒證據／沒交接 |
| D | 重複 | 同一條規則、同一個 ID、同一個責任出現兩次以上 |
| C | 衝突（含新舊版本） | 兩份「現行」講法不同，或舊版被當成新版 |
| S | 過期 | 文件沒人複查、對不上現在的程式 |
| R | 斷掉的引用 | 指到不存在的檔、ID、技能 |
| T | 待辦沒人接 | 任務沒人負責、卡住、沒人審 |
| H | 標頭與格式 | 讓「哪份是新版」變得看不出來的格式問題 |

---

## A. 機械檢查（`mech-check.sh` 會跑；便宜、不會幻覺）

「來源」欄是這個做法借自哪個開源專案（附原始碼位置）；沒附連結的是本範本自訂。

| 代碼 | 檢查什麼 | 怎麼判斷 | 預設嚴重度 | 來源 |
|---|---|---|---|---|
| H1 | 標頭缺欄位／`updated`、`review_by` 日期格式錯 | frontmatter 必填欄位：`doc_id title type status version updated owner_role supersedes superseded_by`；`active` 的 rules／howto／reference 還要 `review_by` | LOW（AGENTS.md／CLAUDE.md 缺欄位 MEDIUM） | spec-kit 憲法版本與日期欄；pm-review-copilot 生命週期欄位（[SKILL.md#L268-L284](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L268-L284)） |
| H2 | `status` 值不合法 | 只能是 draft／active／superseded／archived；任務狀態只能是 todo／in_progress／blocked／review／done／dropped | MEDIUM | living-docs 各型別狀態詞彙寫死 |
| H3 | AGENTS.md 太長 | >32768 bytes HIGH（Codex 上限）；>200 行 MEDIUM；>150 行 LOW | 依左 | rulesync、wshobson（[doc_gardener.py#L415-L431](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L415-L431)） |
| H4 | 殘留 `<填寫>` 佔位字串 | 計數；`verified_against` 還是佔位字串也算 | MEDIUM（AGENTS.md／CLAUDE.md）／LOW | living-docs 的 `{{SLOT}}` 未填檢查 |
| H5 | INDEX 與實際檔案／標頭不一致 | INDEX 的 doc_id、status 與檔案標頭不同 → MEDIUM；`docs/ai` 有檔案沒列進 INDEX → LOW | MEDIUM／LOW | living-docs 索引漂移（[index_drift.rs#L13-L36](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/index_drift.rs#L13-L36)）；blockwatch `same-as-paths` |
| M1 | 任務 `review`／`done` 但「驗證結果」空白；`done` 但「審查」沒有「通過」 | 解析 TASKS.md 區塊欄位（`（…）` 括號佔位視為空） | HIGH／MEDIUM | Backlog 完成前驗證（[task-finalization.md#L1-L11](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/src/guidelines/cli-instructions/task-finalization.md#L1-L11)）；OpenSpec verify 的 Not verified |
| M3 | 有 AI 的 commit 但交接帳本沒提到該任務；最新 commit 比最新交接新 ≥2 天；AI commit 沒有 `T-編號` | commit 訊息以 `[claude]`／`[codex]` 開頭；對照 handoff.md | MEDIUM／LOW | memory-checkup 日誌斷檔偵測（[memory_checkup.py#L135-L153](https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L135-L153)，限制：它只看最新檔前 5 天） |
| D1 | 完全相同的長句出現在兩個檔案 | 正規化（去項目符號、壓縮空白）後 ≥45 bytes 的句子；排除表格、標題、程式碼區塊、決策紀錄、交接、任務、INDEX；AGENTS.md↔CLAUDE.md 重複升 HIGH | MEDIUM／HIGH | docguard（[instruction-audit.mjs#L231-L242](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/scanners/instruction-audit.mjs#L231-L242)）；BMAD「同一條規則不可出現在兩個會被載入的檔案」 |
| D2 | 重複 ID：`doc_id`、`T-` 任務編號、AGENTS.md 的 `R-` 規則編號 | 計數同一 ID 出現次數 >1 | HIGH | Backlog doctor；living-docs（[duplicate_numbers.rs#L12-L35](https://github.com/ejklock/living-docs-skill/blob/8b675599125d4d7e07fbd4f50956c1a003019d60/living-docs-core/src/check/duplicate_numbers.rs#L12-L35)）；blockwatch `keep-unique` |
| D6 | `.claude/skills` 與 `.agents/skills` 內容分岔 | 兩邊都是實體資料夾時 `diff -rq`；任一邊是 symlink 視為同一份 | HIGH | wshobson（[doc_gardener.py#L669-L848](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L669-L848)）；codument skill-parity 測試；blockwatch 技能一致性測試（[tests/skill.rs#L9-L60](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/tests/skill.rs#L9-L60)） |
| C3 | 取代關係不一致 | 寫了 `superseded_by` 但 `status` 不是 superseded／archived（HIGH）；`status: superseded` 但 `superseded_by: none`（HIGH）；A 說被 B 取代、B 沒寫 `supersedes: A`（MEDIUM）；B 宣稱取代 A 但 A 仍 active（HIGH：兩份同時現行） | HIGH／MEDIUM | living-docs `supersede_links`；docguard Decision-Records（supersession 是否單向、懸空） |
| C4 | `superseded` 文件開頭沒有「已被 … 取代」橫幅；或現行文件（rules／role／howto／reference）仍引用已取代的文件路徑或 doc_id | 開頭 30 行找「已被」；其餘 grep 路徑與 doc_id | MEDIUM | living-docs 自動橫幅；VoltAgent memory-curator（[memory-curator.md#L41-L51](https://github.com/VoltAgent/awesome-claude-code-subagents/blob/ed74d115b7fb7026a22a4f816a8e3250f425e3b4/categories/09-meta-orchestration/memory-curator.md#L41-L51)） |
| C10 | CLAUDE.md 沒有單獨一行 `@AGENTS.md`（且不是 symlink）；或 CLAUDE.md 非空行 >40 | 文字比對 | HIGH／MEDIUM | docguard `agents --check`（[agents.mjs#L56-L92](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/commands/agents.mjs#L56-L92)）；blockwatch `same-as` |
| C11 | 已淘汰舊詞仍出現 | 讀 AGENTS.md「已淘汰、不准再出現的舊詞」那一行，逐詞 grep（排除 reports、archive、decisions、handoff） | MEDIUM | OpenSpec 禁用舊詞掃描（[vocabulary-sweep.test.ts#L1-L48](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/test/vocabulary-sweep.test.ts#L1-L48)）；blockwatch `line-pattern-forbidden` |
| C12 | 疑似私密金鑰或憑證檔進了 git | `BEGIN … PRIVATE KEY`、`"private_key":`、被追蹤的 `.env*`／`serviceAccount*.json`／`*firebase-adminsdk*.json`；**只報位置，不印內容** | CRITICAL | 本範本自訂（對應 R-003） |
| C13 | 出現未登記的規則檔 | `GEMINI.md`、`.cursorrules`、`.github/copilot-instructions.md`、`AGENTS.override.md`、`.cursor/rules`、`.claude/rules` 存在，且 AGENTS.md 沒有「允許例外：路徑」 | MEDIUM | blockwatch（[AGENTS.md#L273-L295](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/AGENTS.md#L273-L295)）；docguard instruction-scopes（`AGENTS.override.md` 取代同層規則，容易變成隱形分岔） |
| S1 | 超過 `review_by` | 今天 > `review_by` 的 active 文件 | MEDIUM | pm-review-copilot 新鮮度門檻（[SKILL.md#L165-L201](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L165-L201)）；majiu-management 30／90 天 |
| S2 | 查證後程式又變了很多 | `verified_against` 之後，非文件檔有 ≥10 次 commit → MEDIUM；`verified_at` 距今 ≥90 天 → LOW；`verified_against` 查不到 commit → R3 | MEDIUM／LOW | docguard Freshness（≥10 次 commit 或 ≥30 天，[freshness.mjs#L272-L365](https://github.com/raccioly/docguard/blob/24f3998a0f9ed91fc27e04e9d2667edf9f7449e9/cli/validators/freshness.mjs#L272-L365)）；BMAD `Verified <日期> against <SHA>` |
| S4 | `draft` ≥14 天沒進展 | `updated` 距今天數 | LOW | 概念借自 living-docs 的 stale-proposed 提醒（它不是依天數判斷，天數門檻是本範本自訂） |
| S6 | `superseded` ≥60 天還沒封存 | `updated` 距今天數；建議問老闆是否 archived | LOW | 本範本自訂 |
| R1 | 文件裡引用的路徑／連結不存在 | 抽取 `[](相對路徑)` 與行內程式碼裡含 `/` 且副檔名常見的路徑；排除程式碼區塊、網址、含 `<`／`*`／`YYYY`／`xxx` 的佔位；排除 handoff、TASKS、INDEX、decisions（歷史紀錄）；AGENTS.md／CLAUDE.md 中的升 HIGH | MEDIUM／HIGH | docguard stale pointer；memory-checkup dangling references |
| R3 | `supersedes`／`superseded_by`／`verified_against` 指向不存在的對象 | 對照所有 `doc_id` 與 git commit | HIGH／LOW | living-docs；docguard |
| R4 | 技能 `name` ≠ 資料夾名／缺 `name`／缺 `description`／description 超過 1024 字元／用多行寫法 | 讀每個 `SKILL.md` frontmatter | HIGH／MEDIUM／LOW | ruler（[OpenCodeSkills.ts#L96-L121](https://github.com/intellectronica/ruler/blob/5e551e60952fb1c81c6c5ad6f5fe8b7a412bda87/src/core/OpenCodeSkills.ts#L96-L121)）；graphify 曾因名稱與資料夾不同讓 Claude Code 找不到技能；agency-agents lint（[lint-agents.sh#L115-L122](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/scripts/lint-agents.sh#L115-L122)） |
| R6 | INDEX 列出的檔案不存在 | 檢查路徑 | MEDIUM | living-docs 索引漂移 |
| T1 | 任務沒有 owner | `in_progress`／`review`／`blocked` 且 owner 是 none → HIGH；`todo` 且 owner none ≥7 天 → MEDIUM | HIGH／MEDIUM | paperclip issue-triage；Backlog 未指派清單 |
| T2 | 任務卡住太久 | `in_progress` ≥3 天 MEDIUM、≥7 天 HIGH；`review` ≥3 天沒人審 MEDIUM | MEDIUM／HIGH | paperclip issue-triage（`in_progress` 24 小時沒動靜就叫醒；每日巡檢改成 3 天比較不吵） |
| T3 | `blocked` 沒寫原因，或已 ≥3 天 | 欄位「阻塞」為空或「無」 | MEDIUM | 本範本自訂 |
| T6 | 交接 `NEEDS_CONTEXT`／`BLOCKED` 或「待老闆決定」超過 3 天沒有後續（≥7 天升 HIGH） | 解析 handoff.md：同一個 T 編號後面沒有新紀錄；「待老闆決定：」之後沒有同任務的「老闆決定：」 | MEDIUM／HIGH | superpowers「沒交出去的裁決＝秘密做的決定」（[final-review.md#L33-L42](https://github.com/obra/superpowers/blob/22f0b463e7a5e579904dd6211a520321035526f7/skills/subagent-driven-development/references/final-review.md#L33-L42)） |
| T7 | 非 done／dropped 的任務缺「目標」「驗收條件」「驗證方式」 | 欄位是否存在且非空 | MEDIUM | Backlog 任務簡報要求；spec-kit tasks 範本 |

`mech-check.sh` 還會印兩種資訊行：`# CHECK-SKIPPED …`（某一塊沒跑，報告要標 `partial`）與 `# 有 N 個未提交的修改`（只記錄，不處理）。

---

## B. AI 唯讀判讀（語意層，腳本做不到）

每一項都要附證據；做完一項就在報告對應類別填結果（發現或 `none found — checked: …`）。

### B-M 漏掉
| 代碼 | 檢查什麼 | 做法 |
|---|---|---|
| M8 | 「驗證結果」是否真的是證據 | 驗證結果只寫「已測試」「看起來正常」「grep 到了」就不算；要有指令與輸出重點或 `path:line`。（M1 只檢查有沒有填，這裡檢查填的內容） |
| M2 | 決策或規則要求的事，沒有任何任務在做 | 讀 `decisions/` 的「後果與驗證」與 AGENTS.md 的新規則，對照 TASKS.md；找「沒有任務的需求」與「沒有需求的任務」（spec-kit analyze Coverage Gaps） |
| M4 | 程式改了，相關文件沒跟著改 | 看範圍內 commit 改了哪些檔，哪些文件講到這些檔（grep 檔名或函式名），文件的 `updated` 是否早於 commit。倉儲系統重點：庫存、金額、成本、匯入匯出、權限規則 |
| M5 | 程式裡的 `TODO`／`FIXME` 沒對應任務 | `git grep -n -E 'TODO|FIXME'`，與 TASKS.md 對照（docguard TODO-Tracking） |
| M6 | 角色該做的事沒做 | 有 `review` 狀態的任務卻沒有 reviewer 的 handoff；有 CRITICAL 巡檢發現卻過了 7 天沒任務也沒老闆回覆 |
| M7 | 跳過的檢查被默默當成通過 | 任務或 handoff 寫「略過」「之後再測」卻標 done；應為 `Not verified`（OpenSpec verify，[SKILL.md#L164-L205](https://github.com/Fission-AI/OpenSpec/blob/2bd5bc3be964404657439f538857fcdf550f7398/skills/openspec-verify-change/SKILL.md#L164-L205)） |

### B-D 重複
| 代碼 | 檢查什麼 | 做法 |
|---|---|---|
| D3 | 語意重複：不同字講同一件事（規則、流程、定義） | 先用 grep 找主題相近的段落（例如「部署」「庫存扣減」「commit」），再讀兩段原文判斷。docguard 把主題相近的配對交給 AI 判斷，prompt-audit 與 skill-stocktake 也是；**先確認「本來就該一樣」才算重複** |
| D4 | 角色或技能職責重疊 | 兩個角色檔都寫了同一項職責（agency-agents 用「不負責什麼」欄防止搶事）；兩個技能的 `description` 觸發情境高度相似（addyosmani 用 TF-IDF 相似度 ≥50% 警告，[run-evals.js#L411-L427](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/scripts/run-evals.js#L411-L427)） |
| D5 | 程式裡同一個責任有多處實作 | 以「責任」分組：庫存扣減、金額四捨五入、成本與毛利計算、匯入匯出欄位對照。同一責任若出現多處實作，逐一比對是否一致（agency-agents Archaeologist 的責任視圖，[#L74-L86](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L74-L86)）。只在 `full` 模式抽查 |

### B-C 衝突（含新舊版本）
| 代碼 | 檢查什麼 | 做法 |
|---|---|---|
| C1 | 規則互相矛盾 | 找 always／never、必須／不得、同一個數值寫成不同值。`mech-check` 不會抓（docguard 的矛盾偵測只認英文）。範圍較窄的規則聲明覆寫上層，不算衝突；同一層矛盾才算 |
| C2 | 兩份 active 文件對同一事實說法不同 | 以 INDEX 與 `AGENTS.md` 的「單一來源登記」為準對照；另外抽查：單位（件／箱）、幣別、稅別、庫存定義、狀態名稱 |
| C5 | 版本號或數字有多個來源 | 檢查 AGENTS.md 的「單一來源登記」：其他地方是否寫死了同樣的數字（blockwatch [blockwatch.toml#L17-L24](https://github.com/mennanov/blockwatch/blob/5c4e4510c43b7a853327b614f21c21b8f05f8104/blockwatch.toml#L17-L24)；wshobson `STALE_COUNT` [doc_gardener.py#L716-L775](https://github.com/wshobson/agents/blob/7e2fb559cf4b824b27f1fec49fe88f7511066d26/tools/doc_gardener.py#L716-L775)） |
| C6 | 文件寫的和程式不符 | 把文件當成對程式碼的「宣稱」，逐條驗證：旗標、路徑、預設值、流程步驟、「即將推出」其實已上線或取消（paperclip doc-maintenance 的漂移定義；Archaeologist 的 Step 7） |
| C7 | 違反憲法（R-xxx） | 範圍內 commit／diff 是否碰了 R-001 到 R-010 禁止的事（部署設定、規則檔、金額計算、庫存直接覆寫、commit 到主分支）。違反一律 CRITICAL（spec-kit analyze：違憲一律最嚴重，要改的是被檢查的東西，不是稀釋原則，[analyze.md#L60](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L60)） |
| C8 | 新舊寫法並存／半套遷移 | 同一件事有兩種寫法同時存在，且有些檔案還沒遷移。**不要因為較新就假設正確；半套修復＝新的 bug**（Archaeologist [#L60-L72](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L60-L72)、[#L162-L172](https://github.com/msitarzewski/agency-agents/blob/b37b5bb33b78f2c1d6567d98e25ca818e3259219/specialized/specialized-codebase-archaeologist.md#L162-L172)） |
| C9 | 兩個 AI 互相覆蓋的跡象 | `git log` 裡同一個檔案短時間內被不同 AI 來回改；commit 把別人剛加的內容還原；`git status` 有他人未提交修改（Backlog：[AGENTS.md#L167-L176](https://github.com/MrLesk/Backlog.md/blob/3a296c0f6f949b31e458b849b9617702c56c1023/AGENTS.md#L167-L176) 不准還原別人的修改） |
| C14 | 規則被悄悄弱化或刪除 | 範圍內 commit 有沒有刪掉 `R-xxx` 或把「不得」改成「盡量」；`TBD` 被改寫成事實；舊約束被靜默刪除（pm-review-copilot 風險訊號，[SKILL.md#L432-L441](https://github.com/wikiiizhao/pm-review-copilot/blob/4aef011a8d6053b2bdc3aa9f8831772bb275846b/skills/pm-review-copilot-zh/SKILL.md#L432-L441)）。AGENTS.md 的任何規則變更若沒有對應的版本升級與老闆核准紀錄，就是 HIGH |

### B-S 過期
| 代碼 | 檢查什麼 | 做法 |
|---|---|---|
| S3 | 同一個指標出現多個值 | 價格、庫存基準、費率、廣告成效等：找同一指標的不同數值；**最新不一定正確，要用證據（資料來源、程式、老闆的說明）確認哪個才是現行**，再建議把另一個標成已取代（memory-checkup [#L101-L123](https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L101-L123)） |
| S5 | 文件整體上跟不上專案 | 專案已經換了做法（例如搬到新版倉儲系統），但舊流程文件仍是 active |

### B-R 斷掉的引用
| 代碼 | 檢查什麼 | 做法 |
|---|---|---|
| R2 | 連結的錨點（`#章節`）不存在、引用的任務／決策編號不存在 | 抽查 AGENTS.md 與角色檔引用的 `T-`、`DEC-`、`R-` 編號 |
| R5 | `docs/ai` 以外的孤兒文件 | 專案根目錄與 `docs/` 底下沒人引用、也不在 INDEX 的 `.md`。**只回報，不建議自行刪除，由老闆決定**（memory-checkup 孤兒檔，[#L155-L171](https://github.com/Thomaszhou22/memory-checkup/blob/79ca4ee0eab32a59eed6fe8ba37b4f21244ba290/scripts/memory_checkup.py#L155-L171)） |

### B-T 待辦
| 代碼 | 檢查什麼 | 做法 |
|---|---|---|
| T4 | 實作者和驗收者是同一個 AI | 任務的 owner 與審查欄的 reviewer／handoff 的簽名相同 → HIGH（superpowers：實作者與審查者要分開） |
| T5 | 父子或前後任務狀態不一致 | 子任務全完成但父任務仍 `in_progress`；`來源` 指向的任務已 `dropped` 卻仍在進行（paperclip issue-triage） |
| T8 | 任務沒有被巡檢發現的後續 | 上一份報告老闆已回「照建議做」的項目，過了 3 天仍沒有對應任務 |

### B-H 標頭與格式
| 代碼 | 檢查什麼 | 做法 |
|---|---|---|
| H6 | 技能 description 寫得不會被叫到 | 開頭有沒有「Use when…」、有沒有繁中觸發詞、有沒有寫何時不要用；有沒有把流程摘要寫進 description |
| H7 | 角色檔缺「不負責什麼」或固定輸出格式 | 對照 `docs/ai/roles/*.md` 的必備段落：職責、輸入／輸出、skills、交接、禁止事項、完成定義 |

---

## C. 嚴重度規則

| 嚴重度 | 判斷標準 | 預期處理速度 |
|---|---|---|
| **CRITICAL** | ①違反 R-xxx 憲法；②金額、庫存、部署、金鑰、個資相關的兩條現行規則互相矛盾；③疑似金鑰或憑證進了 git；④AI 動了「需老闆先核准」的東西且沒有紀錄 | 當天處理，排程模式下要主動推播給老闆（若有設定通知） |
| **HIGH** | ①done 沒有證據；②兩份 active 文件事實不同；③AGENTS.md／CLAUDE.md 有斷引用或 CLAUDE.md 沒匯入 AGENTS.md；④同一任務實作者＝驗收者；⑤被取代文件仍被現行文件當依據；⑥任務卡住 ≥7 天；⑦技能副本分岔、name 錯 | 本週內 |
| **MEDIUM** | 過期、重複、非核心文件的斷引用、卡住 ≥3 天、交接缺口、未登記規則檔 | 兩週內 |
| **LOW** | 格式、孤兒、超長、draft 放太久、建議封存 | 有空再說 |

### 升降級
- **升一級：** 同一個問題連續 3 次巡檢都在（報告寫「持續 N 天未處理」）；涉及金額、庫存、部署、金鑰。
- **降一級：** 位置在 `docs/archive/`、`decisions/`、`handoff.md`（歷史紀錄）；老闆已在報告回覆「不用處理」（保留記錄，標 `已知悉`，不再列入計數）。
- 升降級都要在「問題」欄寫原因，不能默默調整。
- **信心** 低的發現，嚴重度最高只能 MEDIUM，並放進「待你確認」。

---

## D. 避免誤報

- **刻意讓兩份內容不同：** AGENTS.md「登記簿」有登記（或 `允許例外：路徑`）的，不報。沒登記的一律當漂移。
- **正常運作的重複不是垃圾：** 一個規則在角色檔裡用一句話指回 AGENTS.md（含連結）是對的；整段複製才是重複（anthropics prompt-audit：[#L182](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L182)）。
- **歷史紀錄不查斷引用：** `handoff.md`、`decisions/`、`reports/`、`docs/archive/` 提到後來被刪掉的檔案是正常的。
- **範本與範例：** 程式碼區塊裡的路徑、含 `<…>`／`YYYY`／`xxx` 的佔位，不算斷引用。
- **新建專案的第一週：** 任務多半 `todo` 且 owner 為 none，T1 在 7 天後才會報；前 7 天的 H4（佔位字串）是預期內，報告用 LOW 帶過即可。
- **別人的錯不要亂修：** 發現不是這次範圍造成的違規，只報告，不處理（blockwatch skill 的「Otherwise leave it, and tell the user」）。
- **安全相關：** 發現疑似金鑰時，報告只寫位置與檔名，**不要把疑似金鑰的內容貼進報告或回覆**。

---

## E. 沒有 bash 時的手動替代指令

```bash
# H1 標頭：列出沒有 frontmatter 的文件
for f in AGENTS.md CLAUDE.md $(find docs/ai -name '*.md'); do head -n1 "$f" | grep -q '^---$' || echo "$f"; done
# H3 AGENTS.md 大小與行數
wc -c AGENTS.md; wc -l AGENTS.md
# H4 佔位字串
grep -rn '<填寫' AGENTS.md CLAUDE.md docs/ai
# D2 重複任務編號／規則編號
grep -o '^### T-[0-9]*' docs/ai/TASKS.md | sort | uniq -d
grep -o '^- R-[0-9]*' AGENTS.md | sort | uniq -d
# C10 CLAUDE.md 是否匯入
grep -n '^@AGENTS.md' CLAUDE.md
# D6 技能副本
diff -rq .agents/skills .claude/skills
# S1 過期：看每份文件的 review_by
grep -rn '^review_by:' AGENTS.md docs/ai
# T2 任務板：列出進行中的任務標題行
grep -n '^### T-.*| in_progress |' docs/ai/TASKS.md
# M3 AI 的 commit
git log --since="14 days ago" --format='%h %cs %s' | grep -E '\[(claude|codex)\]'
# C12 疑似金鑰（只看位置）
git grep -l -I -E 'BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|"private_key"'
```

---

## F. 來源對照（想看原作法時）

| 想了解 | 看哪個專案 |
|---|---|
| 分類方式（重複、模糊、規格不足、違憲、覆蓋缺口、不一致）與報告表格欄位 | github/spec-kit 的 analyze（[analyze.md#L119-L122](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L119-L122)、報告格式 [#L162-L198](https://github.com/github/spec-kit/blob/38c40ae25a4f1c025e1a2dd6a450095d17acab47/templates/commands/analyze.md#L162-L198)） |
| 過期數字、斷引用、日誌斷檔、孤兒檔 | Thomaszhou22/memory-checkup（只讀、改完重跑到 0 問題；注意數字關鍵字寫死簡體，繁中要改） |
| 規則重複、矛盾、過期指標、文件新鮮度 | raccioly/docguard |
| 增量巡讀（cursor）、七類問題分級、卡住判斷 | paperclipai/paperclip（doc-maintenance、wiki-lint、issue-triage） |
| 版本單一來源、確定性的「A 改了 B 也要改」 | mennanov/blockwatch |
| 取代關係、重號、索引漂移 | ejklock/living-docs-skill |
| 巡讀員角色：重複實作、新舊寫法並存、文件與程式不一致 | msitarzewski/agency-agents 的 Codebase Archaeologist |
| 生命週期狀態、新鮮度、風險訊號 | wikiiizhao/pm-review-copilot |
| 規則新舊用 git blame 判斷；同層才算衝突 | anthropics/skills 的 prompt-audit（[#L147](https://github.com/anthropics/skills/blob/ca45fc496a3436251f191354091d557da31c15b5/skills/claude-api/shared/prompt-audit.md#L147)） |
| 技能盤點、合併建議 | affaan-m/ECC 的 skill-stocktake（[#L159-L180](https://github.com/affaan-m/ECC/blob/b38be6a7f6350964d59328b52f0624e1d1d552d1/skills/skill-stocktake/SKILL.md#L159-L180)） |
