#!/usr/bin/env bash
# mech-check.sh — daily-patrol 的機械檢查（只讀）
#
# 不寫任何檔案、不改 git、不連網。需要：bash、awk、grep、find、git（沒有 git 時略過 git 相關檢查並標示）。
# 用法：bash mech-check.sh [--root DIR] [--today YYYY-MM-DD] [--since GIT_REV]
#   --root   專案根目錄（預設：目前所在 git 根目錄，或目前目錄）
#   --today  今天日期（預設：以 Asia/Taipei 計算）
#   --since  只看這個 commit 之後的變更（預設：近 14 天）
#
# 輸出（stdout）：
#   以 "# " 開頭的是資訊行（統計、被略過的檢查）。
#   其餘每個發現一行，欄位以 TAB 分隔：CODE  SEVERITY  LOCATION  MESSAGE
#   CODE 對照 checks.md（H/M/D/C/S/R/T 加數字）。SEVERITY 是 CRITICAL/HIGH/MEDIUM/LOW。
# 結束碼：0 = 有跑完（不論有無發現）；2 = 無法執行（例如找不到專案）。
#
# 這支腳本只做「便宜、確定性」的檢查；語意層的重複與衝突要交給 AI（見 checks.md B 部分）。

export LC_ALL=C
ROOT=""
TODAY=""
SINCE=""
while [ $# -gt 0 ]; do
  case "$1" in
    --root) ROOT="$2"; shift 2 ;;
    --today) TODAY="$2"; shift 2 ;;
    --since) SINCE="$2"; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

if [ -z "$ROOT" ]; then
  ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
fi
cd "$ROOT" 2>/dev/null || { echo "cannot cd to $ROOT" >&2; exit 2; }
[ -z "$TODAY" ] && TODAY=$(TZ=Asia/Taipei date +%F)

HAVE_GIT=0
git rev-parse --git-dir >/dev/null 2>&1 && HAVE_GIT=1

NFIND=0
emit() { # code severity location message
  NFIND=$((NFIND + 1))
  printf '%s\t%s\t%s\t%s\n' "$1" "$2" "$3" "$4"
}
info() { printf '# %s\n' "$*"; }
skipped() { printf '# CHECK-SKIPPED %s: %s\n' "$1" "$2"; }

is_date() { printf '%s' "$1" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'; }
daynum() { # YYYY-MM-DD -> 連續日數（只用來算差）
  local y m d
  y=$((10#${1:0:4})); m=$((10#${1:5:2})); d=$((10#${1:8:2}))
  if [ "$m" -le 2 ]; then y=$((y - 1)); m=$((m + 12)); fi
  echo $((365 * y + y / 4 - y / 100 + y / 400 + (153 * (m - 3) + 2) / 5 + d))
}
TODAY_DN=$(daynum "$TODAY")
age_days() { echo $((TODAY_DN - $(daynum "$1"))); }

fm_get() { # file key -> frontmatter 的值（只支援單行 key: value）
  awk -v k="$2" '
    { sub(/\r$/, "") }
    NR == 1 { if ($0 == "---") { inf = 1; next } else exit }
    inf && $0 == "---" { exit }
    inf && index($0, k ":") == 1 {
      v = substr($0, length(k) + 2)
      sub(/^[ \t]+/, "", v); sub(/[ \t]+$/, "", v)
      sub(/^"/, "", v); sub(/"$/, "", v); sub(/^\047/, "", v); sub(/\047$/, "", v)
      print v; exit
    }' "$1"
}
has_fm() { [ "$(head -n 1 "$1" 2>/dev/null | tr -d '\r')" = "---" ]; }
body_of() { # 去掉 frontmatter 後的內容
  awk '{ sub(/\r$/, "") } NR == 1 && $0 == "---" { inf = 1; next } inf && $0 == "---" { inf = 0; next } !inf { print }' "$1"
}
is_none() { case "$1" in ""|none|None|NONE|-|null) return 0 ;; esac; return 1; }

if [ ! -f AGENTS.md ]; then
  emit H0 HIGH "AGENTS.md" "找不到 AGENTS.md：基礎架構還沒安裝，後續檢查全部略過"
  info "mech-check: findings=$NFIND (aborted)"
  exit 0
fi

# ---------- 收集文件清單 ----------
DOCS=""
add_doc() { DOCS="${DOCS}${1}"$'\n'; }
add_doc AGENTS.md
[ -f CLAUDE.md ] && [ ! -L CLAUDE.md ] && add_doc CLAUDE.md
if [ -d docs/ai ]; then
  while IFS= read -r f; do add_doc "$f"; done < <(find docs/ai -type f -name '*.md' | sort)
fi
NDOCS=$(printf '%s' "$DOCS" | grep -c .)

REQ="doc_id title type status version updated owner_role supersedes superseded_by"
DOCTAB=""
ACTIVE_SCAN=""   # 要檢查「引用了已取代文件」的現行文件

# ---------- H1/H2/S1/S2/S4/S6：標頭與過期 ----------
while IFS= read -r f; do
  [ -z "$f" ] && continue
  if ! has_fm "$f"; then
    emit H1 MEDIUM "$f" "沒有標頭（檔案最前面要有 --- 包起來的 frontmatter）"
    DOCTAB="${DOCTAB}${f}"$'\t\t\t\t'$'\n'
    continue
  fi
  miss=""
  for k in $REQ; do
    v=$(fm_get "$f" "$k")
    [ -z "$v" ] && miss="$miss $k"
  done
  if [ -n "$miss" ]; then
    sev=LOW; case "$f" in AGENTS.md|CLAUDE.md) sev=MEDIUM ;; esac
    emit H1 "$sev" "$f" "標頭缺少欄位：${miss# }"
  fi
  did=$(fm_get "$f" doc_id); st=$(fm_get "$f" status); ty=$(fm_get "$f" type)
  sp=$(fm_get "$f" supersedes); sb=$(fm_get "$f" superseded_by)
  upd=$(fm_get "$f" updated); rb=$(fm_get "$f" review_by)
  DOCTAB="${DOCTAB}${f}"$'\t'"${did}"$'\t'"${st}"$'\t'"${sp}"$'\t'"${sb}"$'\n'
  case "$st" in
    draft|active|superseded|archived|"") ;;
    *) emit H2 MEDIUM "$f" "status 值不合法：$st（只能是 draft／active／superseded／archived）" ;;
  esac
  if [ -n "$upd" ] && ! is_date "$upd"; then emit H1 LOW "$f" "updated 不是 YYYY-MM-DD：$upd"; fi
  if [ "$st" = "active" ]; then
    case "$ty" in
      rules|howto|reference)
        if [ -z "$rb" ]; then
          emit H1 LOW "$f" "active 的 $ty 文件缺少 review_by（最晚複查日）"
        elif ! is_date "$rb"; then
          emit H1 LOW "$f" "review_by 不是 YYYY-MM-DD：$rb"
        fi ;;
    esac
    if [ -n "$rb" ] && is_date "$rb"; then
      d=$(age_days "$rb")
      [ "$d" -gt 0 ] && emit S1 MEDIUM "$f" "已超過 review_by（$rb）$d 天，需要重新查證"
    fi
    case "$ty" in rules|role|howto|reference) ACTIVE_SCAN="${ACTIVE_SCAN}${f}"$'\n' ;; esac
  fi
  if [ "$st" = "draft" ] && is_date "$upd"; then
    d=$(age_days "$upd"); [ "$d" -ge 14 ] && emit S4 LOW "$f" "draft 已 $d 天沒有進展，要定案還是放棄？"
  fi
  if [ "$st" = "superseded" ]; then
    if is_date "$upd"; then
      d=$(age_days "$upd"); [ "$d" -ge 60 ] && emit S6 LOW "$f" "superseded 已 $d 天，是否該請老闆同意封存（archived）？"
    fi
    if ! body_of "$f" | head -n 30 | grep -q '已被'; then
      emit C4 MEDIUM "$f" "status 是 superseded 但開頭沒有「已被 … 取代」橫幅，讀的人可能照做"
    fi
  fi
  va=$(fm_get "$f" verified_at); vg=$(fm_get "$f" verified_against)
  if [ "$st" = "active" ] && [ -n "$va" ] && is_date "$va"; then
    d=$(age_days "$va"); [ "$d" -ge 90 ] && emit S2 LOW "$f" "verified_at 是 $va，距今 $d 天沒有重新對照事實"
  fi
  if [ "$st" = "active" ] && [ -n "$vg" ] && ! is_none "$vg" && [ "$HAVE_GIT" = 1 ]; then
    if printf '%s' "$vg" | grep -q '[<>]'; then
      emit H4 LOW "$f" "verified_against 還是佔位字串：$vg"
    elif git cat-file -e "${vg}^{commit}" 2>/dev/null; then
      n=$(git rev-list --count "${vg}..HEAD" -- . ':!docs' ':!reports' ':!*.md' 2>/dev/null || echo 0)
      [ "${n:-0}" -ge 10 ] && emit S2 MEDIUM "$f" "查證後（$vg）程式又有 $n 次 commit，文件可能已過期"
    else
      emit R3 LOW "$f" "verified_against 找不到這個 commit：$vg"
    fi
  fi
done <<< "$DOCS"

# ---------- C3/R3/D2：取代關係與 doc_id ----------
awk -F'\t' '
  function none(v) { return (v == "" || v == "none" || v == "None" || v == "-" || v == "null") }
  { f[NR] = $1; id[NR] = $2; st[NR] = $3; sp[NR] = $4; sb[NR] = $5; n = NR
    if ($2 != "") { if ($2 in byid) printf "D2\tHIGH\t%s\tdoc_id 重複：%s 也被 %s 使用\n", $1, $2, f[byid[$2]]; else byid[$2] = NR } }
  END {
    for (i = 1; i <= n; i++) {
      if (!none(sb[i])) {
        if (!(sb[i] in byid)) printf "R3\tHIGH\t%s\tsuperseded_by 指向不存在的 doc_id：%s\n", f[i], sb[i]
        else { j = byid[sb[i]]; if (sp[j] != id[i]) printf "C3\tMEDIUM\t%s\t單向取代：%s 的 supersedes 沒有寫 %s\n", f[i], f[j], id[i] }
        if (st[i] != "superseded" && st[i] != "archived") printf "C3\tHIGH\t%s\t寫了 superseded_by 但 status 是 %s：新舊版本可能同時被當成現行\n", f[i], st[i]
      }
      if (st[i] == "superseded" && none(sb[i])) printf "C3\tHIGH\t%s\tstatus 是 superseded 但 superseded_by 是 none：不知道現行版是誰\n", f[i]
      if (!none(sp[i])) {
        if (!(sp[i] in byid)) printf "R3\tHIGH\t%s\tsupersedes 指向不存在的 doc_id：%s\n", f[i], sp[i]
        else { j = byid[sp[i]]
          if (st[j] != "superseded" && st[j] != "archived") printf "C3\tHIGH\t%s\t它宣稱取代 %s，但 %s 的 status 仍是 %s：兩份同時是現行\n", f[i], sp[i], f[j], st[j]
          else if (sb[j] != id[i]) printf "C3\tMEDIUM\t%s\t單向取代：%s 的 superseded_by 不是 %s\n", f[i], f[j], id[i] }
      }
    }
  }' <<< "$DOCTAB" | while IFS=$'\t' read -r c s l m; do emit "$c" "$s" "$l" "$m"; done
# 上面在子 shell 發出，計數另外補：
NFIND=$((NFIND + 0))

# ---------- C4：現行文件仍引用已取代的文件 ----------
SUPERSEDED=$(awk -F'\t' '$3 == "superseded" { print $1 "\t" $2 }' <<< "$DOCTAB")
if [ -n "$SUPERSEDED" ]; then
  while IFS=$'\t' read -r sf sid; do
    [ -z "$sf" ] && continue
    while IFS= read -r af; do
      [ -z "$af" ] && continue
      [ "$af" = "$sf" ] && continue
      hit=$(body_of "$af" | grep -n -F -e "$sf" ${sid:+-e "$sid"} | head -n 1)
      [ -n "$hit" ] && emit C4 MEDIUM "$af:${hit%%:*}" "現行文件仍引用已取代的 $sf（$sid），可能照舊版做事"
    done <<< "$ACTIVE_SCAN"
  done <<< "$SUPERSEDED"
fi

# ---------- H3/H4：AGENTS.md 大小與佔位字串 ----------
sz=$(wc -c < AGENTS.md | tr -d ' ')
ln=$(wc -l < AGENTS.md | tr -d ' ')
[ "$sz" -gt 32768 ] && emit H3 HIGH "AGENTS.md" "檔案 $sz bytes，超過 Codex 的 32 KiB 上限，後面的規則會被截掉"
if [ "$ln" -gt 200 ]; then emit H3 MEDIUM "AGENTS.md" "共 $ln 行，太長（建議 150 行內，細節搬到 docs/ai/）"
elif [ "$ln" -gt 150 ]; then emit H3 LOW "AGENTS.md" "共 $ln 行，超過建議的 150 行"; fi
while IFS= read -r f; do
  [ -z "$f" ] && continue
  c=$(body_of "$f" | grep -c '<填寫')
  if [ "$c" -gt 0 ]; then
    sev=LOW; case "$f" in AGENTS.md|CLAUDE.md) sev=MEDIUM ;; esac
    emit H4 "$sev" "$f" "還有 $c 處 <填寫> 沒填"
  fi
done <<< "$DOCS"

# ---------- C10/D1：CLAUDE.md 與 AGENTS.md ----------
if [ -L CLAUDE.md ]; then
  info "CLAUDE.md 是 symlink，略過匯入檢查"
elif [ -f CLAUDE.md ]; then
  grep -Eq '^@AGENTS\.md[[:space:]]*$' CLAUDE.md || emit C10 HIGH "CLAUDE.md" "沒有單獨一行的 @AGENTS.md，Claude 可能沒讀到共用規則"
  nl=$(body_of CLAUDE.md | grep -v '^[[:space:]]*$' | grep -vc '^<!--\|^-->' )
  [ "$nl" -gt 40 ] && emit C10 MEDIUM "CLAUDE.md" "非空白行有 $nl 行，超過 40：規則可能被複製到這裡（應該放 AGENTS.md）"
else
  emit C10 HIGH "CLAUDE.md" "找不到 CLAUDE.md（也不是 symlink）：Claude Code 不會自動讀 AGENTS.md"
fi

# 完全相同的長句出現在兩個不同檔案（規則被複製）
DUPFILES=""
for f in AGENTS.md CLAUDE.md; do [ -f "$f" ] && [ ! -L "$f" ] && DUPFILES="$DUPFILES $f"; done
if [ -d docs/ai ]; then
  while IFS= read -r f; do
    case "$f" in docs/ai/decisions/*|docs/ai/handoff.md|docs/ai/TASKS.md|docs/ai/INDEX.md) continue ;; esac
    DUPFILES="$DUPFILES $f"
  done < <(find docs/ai -type f -name '*.md' | sort)
fi
# shellcheck disable=SC2086
awk '
  FNR == 1 { fence = 0; fm = 0; if ($0 ~ /^---\r?$/) fm = 1; else fm = 0; next_is_first = 1 }
  { line = $0; sub(/\r$/, "", line) }
  FNR == 1 && fm { next }
  fm { if (line == "---") fm = 0; next }
  line ~ /^[ \t]*```/ { fence = !fence; next }
  fence { next }
  line ~ /^[ \t]*(\||#|>|<!--|-->|---)/ { next }
  line ~ /https?:/ { next }
  {
    t = line
    sub(/^[ \t]*([-*+]|[0-9]+[.)])[ \t]+/, "", t)
    gsub(/[ \t]+/, " ", t); sub(/^ /, "", t); sub(/ $/, "", t)
    if (length(t) < 45) next
    if (t in seen && seenf[t] != FILENAME) {
      sev = "MEDIUM"
      if ((FILENAME == "AGENTS.md" && seenf[t] == "CLAUDE.md") || (FILENAME == "CLAUDE.md" && seenf[t] == "AGENTS.md")) sev = "HIGH"
      printf "D1\t%s\t%s:%d\t與 %s 有完全相同的句子，規則可能被複製（只該留一處）：%s\n", sev, FILENAME, FNR, seenl[t], substr(t, 1, 60)
    } else if (!(t in seen)) { seen[t] = 1; seenf[t] = FILENAME; seenl[t] = FILENAME ":" FNR }
  }' $DUPFILES 2>/dev/null | while IFS=$'\t' read -r c s l m; do emit "$c" "$s" "$l" "$m"; done

# ---------- C13：未登記的規則檔 ----------
for p in GEMINI.md .cursorrules .github/copilot-instructions.md AGENTS.override.md; do
  if [ -e "$p" ]; then
    grep -Fq "允許例外：$p" AGENTS.md || emit C13 MEDIUM "$p" "出現未登記的規則檔：另一份規則會讓 AI 行為分岔（要保留請在 AGENTS.md 登記簿加一行「允許例外：$p」）"
  fi
done
for d in .cursor/rules .claude/rules; do
  if [ -d "$d" ] && [ -n "$(find "$d" -type f 2>/dev/null | head -n 1)" ]; then
    grep -Fq "允許例外：$d" AGENTS.md || emit C13 MEDIUM "$d" "出現未登記的規則資料夾：規則可能與 AGENTS.md 重複或矛盾"
  fi
done
if [ "$HAVE_GIT" = 1 ] && [ -n "$(git ls-files 'CLAUDE.local.md' 2>/dev/null)" ]; then
  emit C13 LOW "CLAUDE.local.md" "個人覆寫檔被放進 git：應該排除（.gitignore）"
fi

# ---------- skills：名稱、鏡像、重複 ----------
SKILLDIRS=""
for base in .agents/skills .claude/skills; do
  [ -d "$base" ] || continue
  for d in "$base"/*/; do
    [ -f "${d}SKILL.md" ] || continue
    SKILLDIRS="${SKILLDIRS}${d%/}"$'\n'
  done
done
while IFS= read -r d; do
  [ -z "$d" ] && continue
  nm=$(fm_get "$d/SKILL.md" name); folder=$(basename "$d")
  desc=$(fm_get "$d/SKILL.md" description)
  if [ -z "$nm" ]; then emit R4 HIGH "$d/SKILL.md" "frontmatter 缺少 name"
  elif [ "$nm" != "$folder" ]; then emit R4 HIGH "$d/SKILL.md" "name（$nm）不等於資料夾名（$folder），Claude Code 可能找不到這個技能"; fi
  if [ -z "$desc" ]; then emit R4 HIGH "$d/SKILL.md" "frontmatter 缺少 description（技能不會被叫到）"
  else
    case "$desc" in ">"*|"|"*) emit R4 LOW "$d/SKILL.md" "description 用了多行寫法，部分轉換器會壞，建議寫成單行" ;; esac
    [ "$(printf '%s' "$desc" | wc -c)" -gt 1024 ] && emit R4 MEDIUM "$d/SKILL.md" "description 超過 1024 字元"
  fi
done <<< "$SKILLDIRS"
if [ -d .agents/skills ] && [ -d .claude/skills ]; then
  if [ -L .claude/skills ] || [ -L .agents/skills ]; then
    info ".claude/skills 與 .agents/skills 其中一個是 symlink：視為同一份"
  else
    out=$(diff -rq .agents/skills .claude/skills 2>&1 | head -n 5)
    [ -n "$out" ] && emit D6 HIGH ".claude/skills vs .agents/skills" "兩份技能內容不一致（已分岔）：$(printf '%s' "$out" | tr '\n' ';' | cut -c1-160)"
  fi
elif [ -d .agents/skills ] || [ -d .claude/skills ]; then
  info "只有一邊有 skills 資料夾（.agents/skills 給 Codex、.claude/skills 給 Claude），請確認另一邊有 symlink 或副本"
fi

# ---------- 任務板：T/M/D/H ----------
TASKS=docs/ai/TASKS.md
NTASKS=0
if [ -f "$TASKS" ]; then
  NTASKS=$(grep -c '^### T-' "$TASKS")
  awk -v today="$TODAY" -v file="$TASKS" '
    function dn(s,   p, y, m, d) { split(s, p, "-"); y = p[1] + 0; m = p[2] + 0; d = p[3] + 0
      if (m <= 2) { y--; m += 12 } return 365*y + int(y/4) - int(y/100) + int(y/400) + int((153*(m-3)+2)/5) + d }
    function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t\r]+$/, "", s); return s }
    function emit(c, sv, msg) { printf "%s\t%s\t%s:%d\t%s %s\n", c, sv, file, hl, id, msg }
    function ne(k) { return (k in has) && has[k] }
    function flush(   age, req, k, i) {
      if (id == "") return
      if (seen[id]++) emit("D2", "HIGH", "任務編號重複")
      if (st !~ /^(todo|in_progress|blocked|review|done|dropped)$/) emit("H2", "MEDIUM", "狀態不合法：" st)
      okd = (upd ~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/)
      if (!okd) emit("H1", "LOW", "標題行的 updated 格式錯誤：" upd)
      age = okd ? dn(today) - dn(upd) : -1
      if (st ~ /^(in_progress|review|blocked)$/ && (own == "" || own == "none")) emit("T1", "HIGH", "狀態是 " st " 但 owner 是 none")
      if (st == "todo" && (own == "" || own == "none") && age >= 7) emit("T1", "MEDIUM", "todo 已 " age " 天沒人認領")
      if (st == "in_progress" && age >= 7) emit("T2", "HIGH", "in_progress 已 " age " 天沒有更新")
      else if (st == "in_progress" && age >= 3) emit("T2", "MEDIUM", "in_progress 已 " age " 天沒有更新")
      if (st == "review" && age >= 3) emit("T2", "MEDIUM", "review 已 " age " 天沒人審")
      if (st == "blocked") {
        if (!ne("阻塞") || val["阻塞"] ~ /^(無|none|None|-)$/) emit("T3", "MEDIUM", "blocked 但沒寫阻塞原因與在等誰")
        if (age >= 3) emit("T3", "MEDIUM", "blocked 已 " age " 天")
      }
      if (st !~ /^(done|dropped)$/) {
        split("目標 驗收條件 驗證方式", req, " ")
        for (i = 1; i <= 3; i++) if (!ne(req[i])) emit("T7", "MEDIUM", "缺少「" req[i] "」，別的 AI 無法不看對話就動手")
      }
      if ((st == "review" || st == "done") && !ne("驗證結果")) emit("M1", "HIGH", "狀態是 " st " 但「驗證結果」是空的：沒有證據不能算完成")
      if (st == "done" && !(ne("審查") && val["審查"] ~ /通過/)) emit("M1", "MEDIUM", "done 但「審查」欄沒有 reviewer 的「通過」紀錄")
      for (k in has) delete has[k]
      for (k in val) delete val[k]
    }
    /^### T-/ {
      flush()
      hl = FNR; n = split($0, h, "|"); id = trim(h[1]); sub(/^### /, "", id)
      st = trim(h[2]); own = trim(h[3]); upd = trim(h[4])
      sub(/^owner:[ \t]*/, "", own); sub(/^updated:[ \t]*/, "", upd)
      if (n < 4) { emit("H1", "MEDIUM", "標題行格式不對（要有 | 狀態 | owner: | updated: ）"); }
      cur = ""; next
    }
    id != "" && /^- (目標|驗收條件|驗證方式|相關檔案|來源|阻塞|驗證結果|審查)：/ {
      line = $0; sub(/\r$/, "", line)
      k = line; sub(/^- /, "", k); sub(/：.*$/, "", k)
      v = line; sub(/^- [^：]*：/, "", v); v = trim(v)
      if (v ~ /^（.*）$/) v = ""
      val[k] = v; has[k] = (v != "" ? 1 : 0); cur = k; next
    }
    id != "" && cur != "" && /^[ \t]+[^ \t]/ { if (!has[cur]) has[cur] = 1; next }
    END { flush() }
  ' "$TASKS" | while IFS=$'\t' read -r c s l m; do emit "$c" "$s" "$l" "$m"; done
else
  skipped "tasks" "找不到 docs/ai/TASKS.md"
fi

# ---------- 規則編號重複（AGENTS.md 的 R-xxx） ----------
grep -n -E '^- R-[0-9]{3}[：:]' AGENTS.md 2>/dev/null | sed -E 's/^([0-9]+):- (R-[0-9]{3}).*/\2 \1/' | sort | awk '
  { if ($1 == prev) printf "D2\tHIGH\tAGENTS.md:%s\t規則編號重複：%s 也出現在第 %s 行\n", $2, $1, prevline; prev = $1; prevline = $2 }' \
  | while IFS=$'\t' read -r c s l m; do emit "$c" "$s" "$l" "$m"; done

# ---------- 交接帳本 ----------
HAND=docs/ai/handoff.md
NHAND=0
if [ -f "$HAND" ]; then
  NHAND=$(grep -c -E '^## [0-9]{4}-[0-9]{2}-[0-9]{2}' "$HAND")
  awk -v today="$TODAY" -v file="$HAND" '
    function dn(s,   p, y, m, d) { split(s, p, "-"); y = p[1] + 0; m = p[2] + 0; d = p[3] + 0
      if (m <= 2) { y--; m += 12 } return 365*y + int(y/4) - int(y/100) + int(y/400) + int((153*(m-3)+2)/5) + d }
    function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t\r]+$/, "", s); return s }
    /^## [0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]/ {
      n++; split($0, h, "|"); date[n] = substr($0, 4, 10); tid[n] = trim(h[3]); stt[n] = trim(h[4]); ln[n] = FNR; next }
    n > 0 && index($0, "待老闆決定：") { if (trim(substr($0, index($0, "待老闆決定：") + length("待老闆決定："))) != "") pend[n] = 1; next }
    n > 0 && index($0, "老闆決定：") { dec[n] = 1; next }
    END {
      for (i = 1; i <= n; i++) {
        age = dn(today) - dn(date[i])
        if (stt[i] == "NEEDS_CONTEXT" || stt[i] == "BLOCKED") {
          answered = 0
          for (j = i + 1; j <= n; j++) if (tid[j] == tid[i]) answered = 1
          if (!answered && age >= 3) printf "T6\t%s\t%s:%d\t%s 的 %s 已 %d 天沒有後續紀錄（沒人回應）\n", (age >= 7 ? "HIGH" : "MEDIUM"), file, ln[i], tid[i], stt[i], age
        }
        if (pend[i]) {
          resolved = 0
          for (j = i + 1; j <= n; j++) if (dec[j] && tid[j] == tid[i]) resolved = 1
          if (!resolved && age >= 3) printf "T6\t%s\t%s:%d\t%s 有「待老闆決定」已 %d 天沒有「老闆決定：」\n", (age >= 7 ? "HIGH" : "MEDIUM"), file, ln[i], tid[i], age
        }
      }
    }' "$HAND" | while IFS=$'\t' read -r c s l m; do emit "$c" "$s" "$l" "$m"; done
else
  skipped "handoff" "找不到 docs/ai/handoff.md"
fi

# ---------- git：交接缺口、秘密、未提交修改 ----------
if [ "$HAVE_GIT" = 1 ]; then
  if [ -n "$SINCE" ] && git cat-file -e "${SINCE}^{commit}" 2>/dev/null; then RANGE=("${SINCE}..HEAD"); else RANGE=(--since="14 days ago"); fi
  if [ -f "$HAND" ]; then
    git log "${RANGE[@]}" --format='%h %s' 2>/dev/null | grep -E '^[0-9a-f]+ \[(claude|codex)\]' | while read -r sha subj; do
      tid=$(printf '%s' "$subj" | grep -oE 'T-[0-9]+' | head -n 1)
      if [ -z "$tid" ]; then
        printf 'M3\tLOW\tcommit %s\tAI 的 commit 沒有任務編號：%s\n' "$sha" "$subj"
      elif ! grep -q "$tid" "$HAND"; then
        printf 'M3\tMEDIUM\tcommit %s\t%s 有 commit 但交接帳本完全沒提到這個任務\n' "$sha" "$tid"
      fi
    done | while IFS=$'\t' read -r c s l m; do emit "$c" "$s" "$l" "$m"; done
    lastc=$(git log -1 --format=%cs 2>/dev/null)
    lasth=$(grep -E '^## [0-9]{4}-[0-9]{2}-[0-9]{2}' "$HAND" | tail -n 1 | cut -c4-13)
    if is_date "${lastc:-x}" && is_date "${lasth:-x}"; then
      gap=$(( $(daynum "$lastc") - $(daynum "$lasth") ))
      [ "$gap" -ge 2 ] && emit M3 MEDIUM "$HAND" "最新 commit 是 $lastc，但最新交接紀錄是 $lasth（落後 $gap 天）：有人做了事沒交接"
    fi
  fi
  hits=$(git grep -n -I -E 'BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY|"private_key"[[:space:]]*:' -- . ':!_oss-research' ':!*.md' 2>/dev/null | cut -d: -f1,2 | head -n 5)
  if [ -n "$hits" ]; then
    while IFS= read -r h; do emit C12 CRITICAL "$h" "疑似私密金鑰進了 git（不顯示內容；請立即由老闆處理並更換金鑰）"; done <<< "$hits"
  fi
  while IFS= read -r p; do
    [ -z "$p" ] && continue
    emit C12 CRITICAL "$p" "疑似憑證檔被 git 追蹤（.env、service account）；請立即由老闆處理"
  done < <(git ls-files 2>/dev/null | grep -E '(^|/)\.env($|\.)|serviceAccount.*\.json$|firebase-adminsdk.*\.json$' | grep -vE '\.(example|sample|template)$' | head -n 5)
  dirty=$(git status --porcelain 2>/dev/null | grep -v ' reports/' | wc -l | tr -d ' ')
  [ "$dirty" -gt 0 ] && info "有 $dirty 個未提交的修改（可能是別的 AI 或人正在做）：巡檢不處理，只記錄，見 git status"
else
  skipped "git" "不是 git 專案：交接缺口、新舊判斷、秘密掃描都略過，報告必須標 partial"
fi

# ---------- 引用是否存在（R1） ----------
is_placeholder() {
  case "$1" in
    *'<'*|*'>'*|*'*'*|*'{'*|*'$'*|*YYYY*|*MM-DD*|*NNNN*|*xxx*|*XXX*|http*|mailto:*|'#'*|/*|'~'*|'') return 0 ;;
  esac
  return 1
}
while IFS= read -r f; do
  [ -z "$f" ] && continue
  case "$f" in docs/ai/handoff.md|docs/ai/TASKS.md|docs/ai/INDEX.md|docs/ai/decisions/*) continue ;; esac
  dir=$(dirname "$f")
  awk '
    /^[ \t]*```/ || /^[ \t]*~~~/ { fence = !fence; next }
    fence { next }
    {
      s = $0
      while (match(s, /\]\([^)]+\)/)) { t = substr(s, RSTART + 2, RLENGTH - 3); s = substr(s, RSTART + RLENGTH); print FNR "\t" t }
      s = $0
      while (match(s, /`[^`]+`/)) { t = substr(s, RSTART + 1, RLENGTH - 2); s = substr(s, RSTART + RLENGTH)
        if (t ~ /\// && t ~ /\.(md|json|js|ts|sh|yml|yaml|toml|html|css|py|txt)$/ && t !~ / /) print FNR "\t" t }
    }' "$f" | while IFS=$'\t' read -r lnum t; do
      t=${t%% *}; t=${t%%#*}; t=${t%%\?*}
      is_placeholder "$t" && continue
      if [ ! -e "$t" ] && [ ! -e "$dir/$t" ]; then
        sev=MEDIUM; case "$f" in AGENTS.md|CLAUDE.md) sev=HIGH ;; esac
        printf 'R1\t%s\t%s:%s\t引用的路徑不存在：%s\n' "$sev" "$f" "$lnum" "$t"
      fi
    done
done <<< "$DOCS" | while IFS=$'\t' read -r c s l m; do emit "$c" "$s" "$l" "$m"; done

# ---------- INDEX 與實際檔案（H5/R6） ----------
INDEX=docs/ai/INDEX.md
if [ -f "$INDEX" ]; then
  LISTED=""
  while IFS=$'\t' read -r ln did path st; do
    [ -z "$path" ] && continue
    LISTED="${LISTED}${path}"$'\n'
    if [ ! -e "$path" ]; then emit R6 MEDIUM "$INDEX:$ln" "INDEX 列出的檔案不存在：$path"; continue; fi
    [ -L "$path" ] && continue
    rid=$(fm_get "$path" doc_id); rst=$(fm_get "$path" status)
    [ -n "$rid" ] && [ "$rid" != "$did" ] && emit H5 MEDIUM "$INDEX:$ln" "doc_id 不一致：INDEX 寫 $did，檔案寫 $rid（$path）"
    [ -n "$rst" ] && [ "$rst" != "$st" ] && emit H5 MEDIUM "$INDEX:$ln" "狀態不一致：INDEX 寫 $st，檔案實際是 $rst（$path）：別人會看錯哪份是現行"
  done < <(awk -F'|' '/^\|/ { for (i = 1; i <= NF; i++) { gsub(/^[ \t`]+|[ \t`]+$/, "", $i) }
      if ($3 ~ /\.md$/) printf "%d\t%s\t%s\t%s\n", FNR, $2, $3, $4 }' "$INDEX")
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    [ "$f" = "$INDEX" ] && continue
    printf '%s' "$LISTED" | grep -Fxq "$f" || emit H5 LOW "$f" "沒有列在 docs/ai/INDEX.md（孤兒文件：沒人知道它是不是現行）"
  done <<< "$DOCS"
else
  skipped "index" "找不到 docs/ai/INDEX.md"
fi

# ---------- 禁用舊詞（C11） ----------
banned=$(grep -E '^- 已淘汰' AGENTS.md | head -n 1 | sed -E 's/^[^：:]*[：:]//')
if [ -n "$banned" ] && ! printf '%s' "$banned" | grep -q '<填寫'; then
  printf '%s' "$banned" | awk '{ n = split($0, a, /[、,，]/); for (i = 1; i <= n; i++) { t = a[i]; p = index(t, "（"); if (p) t = substr(t, 1, p - 1); gsub(/^[ \t]+|[ \t。]+$/, "", t); if (length(t) >= 4) print t } }' |
  while IFS= read -r term; do
    [ -z "$term" ] && continue
    grep -rIn -F --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=reports --exclude-dir=archive --exclude-dir=decisions --exclude=handoff.md --exclude=AGENTS.md -e "$term" . 2>/dev/null | head -n 3 | while IFS= read -r hit; do
      printf 'C11\tMEDIUM\t%s\t已淘汰的舊詞「%s」仍出現\n' "$(printf '%s' "$hit" | cut -d: -f1,2 | sed 's#^\./##')" "$term"
    done
  done | while IFS=$'\t' read -r c s l m; do emit "$c" "$s" "$l" "$m"; done
fi

info "mech-check: today=$TODAY docs=$NDOCS tasks=$NTASKS handoff_entries=$NHAND git=$HAVE_GIT"
info "mech-check: 完成（上面每一行是一個發現；子流程的發現數不含在本行）"
exit 0
