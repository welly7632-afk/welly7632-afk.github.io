# 給 Claude 的專案說明

這個 repo 是使用者的 GitHub Pages 網站（舊倉儲系統的轉址頁、`label/`、`voice.html`）。
另外放了一份**開源專案研究資料包**：`_oss-research/`（2026-11-04 掃描，87 個專案）。
GitHub Pages 不會發布 `_oss-research/` 和 `.claude/`，不影響網站。

## 使用者
- 台灣的小老闆，用繁體中文（台灣用語）回答。
- 自己用 Claude 做了倉儲系統（純 JavaScript，新版放在 Firebase Hosting），也有投廣告。
- 目前是**個人使用**這些開源專案；之後想挑 A、B、C 幾個專案的優點組合起來，用 Claude Code 做自己的工具。
- 常用語音輸入，會有同音錯字：「城市碼」＝程式碼、「Cloud」＝Claude、「最高薪」＝最高星、「巡讀」＝巡檢整個專案。

## 資料包怎麼用（重要）
使用者提到下列主題時，**主動**先查 `_oss-research/index.json`（`keyword_map` 與各專案的 `one_liner_zh`），
告訴使用者「資料包裡有相關的專案」，列出專案名、一句話、資料包路徑，再回答問題：

| 主題（關鍵字） | 資料夾 | 先看 |
|---|---|---|
| 網頁版 Excel、試算表、表格、公式、匯入匯出 Excel、Airtable | `01-web-excel/` | `00-comparison.md`、`00-build-blueprint.md`、`deep-dives/` |
| 查價、比價、對價、報價、成本、到岸成本、毛利、進銷存、ERP、庫存、倉儲 | `02-price-erp/` | `00-summary.md` |
| 影片、短影音、短劇、漫劇、腳本、文案、配音、字幕、廣告素材、用 Claude 做影片 | `03-video-script/` | `00-summary.md` |
| 多個 AI 協作、共用規則、AGENTS.md、CLAUDE.md、角色、skills、每日巡檢、漏掉／重複／新舊版本衝突 | `04-agent-rules-skills/` | `00-summary.md`、`00-blueprint.md`、`templates/` |

- 想「組合 A＋B＋C」：先讀該類的 `00-` 總結，再讀個別資料包第 6 節（值得拆出來用的部分）。
- 每個專案的摘要在 `_oss-research/cards/<owner>__<repo>.json`。
- 資料包是 2026-11-04 的快照：星數、授權、程式碼位置可能已經變了，引用時提醒使用者，動手前重新確認。
- 使用者目前個人使用；若提到公司商用，提醒授權限制（資料包第 2 節、card 的 `license_commercial_zh`）。
