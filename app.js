/* 倉儲系統前端 SPA v6 */
'use strict';

var CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbxYHC2d-kraHlPhvJQPe6PG04GuTUWZ3xjKuDEE2tn8a-hlnqIpxDk34UxM_H_kIHJO/exec',
  POLL_MS: 60000,
  AUTH_RECHECK_MS: 3600000,
  BULK_TTL: 21600000,
  LINKS: {
    labelPrint: 'https://bestx0114-dev.github.io/label-print/',
    secondDel: 'https://bestx0114-dev.github.io/second-storage-del/'
  }
};
var SHORTAGE_HANDLE = ['不足需聊', '不足等到貨', '需找', '缺先出', '不出', '已找到貨', '同意換貨'];

/* ===================== 共用狀態 ===================== */
var store = {
  products: [], ts: 0, v: '',
  staff: [], links: [], staffPw: {}, configured: true, counts: {},
  picking: null, picking346: null, bigcount: null, shortage: null, shortInv: null,
  rel: null,
  recCache: { pick: null, pick346: null, bigcount: null },
  purchaseIdx: {}, salesIdx: {},
  dataTs: {},
  user: localStorage.getItem('user') || '',
  token: localStorage.getItem('token') || '',
  ip: '',
  pending: 0,
  pollTimer: null, authTimer: null
};

function lsGet(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

function saveCache() { lsSet('cache_products', { ts: store.ts, v: store.v, products: store.products }); }
function loadCache() {
  var c = lsGet('cache_products');
  if (c && c.products) { store.products = c.products; store.ts = c.ts; store.v = c.v || ''; }
  var s = lsGet('cache_staff'); if (s) { store.staff = s.staff || []; store.staffPw = s.staffPw || {}; store.links = s.links || []; }
  var p = lsGet('cache_picking'); if (p) store.picking = p;
  var p3 = lsGet('cache_picking346'); if (p3) store.picking346 = p3;
  var si = lsGet('cache_shortInv'); if (si) store.shortInv = si;
  var pi = lsGet('cache_purchaseIdx'); if (pi && Date.now() - pi.t < CONFIG.BULK_TTL) store.purchaseIdx = pi.idx || {};
  var sa = lsGet('cache_salesIdx'); if (sa && Date.now() - sa.t < CONFIG.BULK_TTL) store.salesIdx = sa.idx || {};
}

/* ===================== API ===================== */
function apiGet(query) { return fetch(CONFIG.API_URL + '?action=' + query).then(function (r) { return r.json(); }); }
function apiPost(body) {
  body.user = store.user; body.ip = store.ip; body.token = store.token;
  return fetch(CONFIG.API_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
}
function refreshProducts(silent, force) {
  var q = 'products' + (store.v && !force ? '&v=' + encodeURIComponent(store.v) : '');
  return apiGet(q).then(function (d) {
    if (d.ok && d.unchanged) { store.ts = Date.now(); updateSyncInfo(); return; }
    if (d.ok) { store.products = d.products; store.ts = d.ts; store.v = d.v || ''; saveCache(); updateSyncInfo(); rerenderActive(); }
    else if (!silent) toast('同步失敗: ' + d.error, 'err');
  }).catch(function () { if (!silent) toast('無法連線後端', 'err'); });
}
function loadData(key, force) {
  var age = Date.now() - (store.dataTs[key] || 0);
  if (store[key] && !force && age < 45000) return Promise.resolve(store[key]);
  var action = key === 'rel' ? 'reldata' : key;
  return apiGet(action).then(function (d) {
    if (d.ok) {
      store[key] = key === 'rel' ? d : d.rows;
      store.dataTs[key] = Date.now();
      if (key === 'picking') lsSet('cache_picking', d.rows);
      if (key === 'picking346') lsSet('cache_picking346', d.rows);
      if (key === 'shortInv') lsSet('cache_shortInv', d.rows);
    }
    return store[key];
  }).catch(function () { return store[key]; });
}
function loadRecords(kind, force) {
  var age = Date.now() - (store.dataTs['rec_' + kind] || 0);
  if (store.recCache[kind] && !force && age < 45000) return Promise.resolve(store.recCache[kind]);
  return apiGet('allRecords&kind=' + kind).then(function (d) {
    if (d.ok) { store.recCache[kind] = d.byKey; store.dataTs['rec_' + kind] = Date.now(); }
    return store.recCache[kind];
  }).catch(function () { return store.recCache[kind]; });
}
function loadBulk() {
  var pi = lsGet('cache_purchaseIdx');
  if (!pi || Date.now() - pi.t >= CONFIG.BULK_TTL) {
    apiGet('purchaseAll').then(function (d) { if (d.ok) { store.purchaseIdx = d.idx || {}; lsSet('cache_purchaseIdx', { t: Date.now(), idx: d.idx }); } }).catch(function () {});
  }
  var sa = lsGet('cache_salesIdx');
  if (!sa || Date.now() - sa.t >= CONFIG.BULK_TTL) {
    apiGet('salesAll').then(function (d) { if (d.ok) { store.salesIdx = d.idx || {}; lsSet('cache_salesIdx', { t: Date.now(), idx: d.idx }); } }).catch(function () {});
  }
}
function preloadAll() {
  loadData('picking'); loadData('picking346'); loadData('bigcount'); loadData('shortage'); loadData('shortInv'); loadData('rel');
  loadRecords('pick'); loadRecords('pick346'); loadRecords('bigcount');
  loadBulk();
}
function manualSync() {
  toast('同步中…', '', 1200);
  Promise.all([
    refreshProducts(true, true),
    loadData('picking', true), loadData('picking346', true), loadData('bigcount', true),
    loadData('shortage', true), loadData('shortInv', true), loadData('rel', true),
    loadRecords('pick', true), loadRecords('pick346', true), loadRecords('bigcount', true),
    apiGet('purchaseAll').then(function (d) { if (d.ok) { store.purchaseIdx = d.idx || {}; lsSet('cache_purchaseIdx', { t: Date.now(), idx: d.idx }); } }).catch(function () {}),
    apiGet('salesAll').then(function (d) { if (d.ok) { store.salesIdx = d.idx || {}; lsSet('cache_salesIdx', { t: Date.now(), idx: d.idx }); } }).catch(function () {}),
    apiGet('meta').then(applyMeta).catch(function () {})
  ]).then(function () { toast('同步完成', 'ok'); rerenderActive(); });
}
function startPolling() {
  if (store.pollTimer) clearInterval(store.pollTimer);
  store.pollTimer = setInterval(function () {
    if (document.hidden) return;
    refreshProducts(true);
    apiGet('meta').then(applyMeta).catch(function () {});
    var path = (location.hash.slice(1) || '/storage').split('?')[0];
    if (path === '/orders' || path === '/order-detail') loadData('picking', true).then(rerenderActive);
    if (path === '/pick346') loadData('picking346', true).then(rerenderActive);
    if (path === '/bigcount') loadData('bigcount', true).then(rerenderActive);
    if (path === '/shortage') loadData('shortage', true).then(rerenderActive);
    if (path === '/short-inv') loadData('shortInv', true).then(rerenderActive);
  }, CONFIG.POLL_MS);
}
function startAuthRecheck() {
  if (store.authTimer) clearInterval(store.authTimer);
  store.authTimer = setInterval(function () {
    if (!store.user) return;
    fetchIp().then(function () {
      apiPost({ action: 'authcheck', name: store.user }).then(function (d) {
        if (d.ok) return;
        toast(d.companyOnly ? '此帳號僅限公司網路使用,已登出' : '已離開公司網路,請重新以密碼登入', 'err', 5000);
        store.user = ''; localStorage.removeItem('user'); updateSyncInfo(); location.hash = '#/settings';
      });
    });
  }, CONFIG.AUTH_RECHECK_MS);
}
function fetchIp() {
  return fetch('https://api.ipify.org?format=json').then(function (r) { return r.json(); })
    .then(function (d) { store.ip = d.ip; }).catch(function () { store.ip = ''; });
}

/* ===================== UI 工具 ===================== */
function $(sel) { return document.querySelector(sel); }
function toast(msg, cls, ms) {
  var t = $('#toast'); t.textContent = msg; t.className = cls || '';
  clearTimeout(t._h); t._h = setTimeout(function () { t.className = 'hidden'; }, ms || 2600);
}
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fmtDate(v) {
  if (!v) return ''; var d = new Date(v); if (isNaN(d.getTime())) return String(v);
  return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
}
function updateSyncInfo() {
  var d = store.ts ? new Date(store.ts) : null;
  var pend = store.pending > 0 ? ' · 待同步 ' + store.pending : '';
  $('#syncInfo').textContent = (d ? '資料時間 ' + d.toLocaleTimeString() + ' · ' + store.products.length + ' 品項' : '尚未同步') + pend;
  $('#userBadge').textContent = store.user || '未登入';
  $('#topTime').textContent = d ? '更新 ' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) : '';
  updateNavCounts();
}
function updateNavCounts() {
  var c = store.counts || {};
  [['bigcount', c.bigcount], ['shortage', c.shortage], ['count', c.count], ['reloc', c.reloc]].forEach(function (x) {
    var el = document.getElementById('c_' + x[0]);
    if (el) el.textContent = (x[1] == null ? '' : ' ' + x[1]);
  });
}
function applyMeta(d) {
  if (!d || !d.ok) return;
  store.staff = d.staff || store.staff; store.links = d.links || store.links;
  store.configured = d.configured !== false; store.counts = d.counts || store.counts;
  lsSet('cache_staff', { staff: store.staff, staffPw: store.staffPw, links: store.links });
  updateNavCounts();
  var path = (location.hash.slice(1) || '').split('?')[0];
  if (path === '/settings') pageSettings();
  if (path === '/home') pageHome();
}
function autoUpper(input) {
  input.addEventListener('input', function () {
    var pos = input.selectionStart; input.value = input.value.toUpperCase();
    try { input.setSelectionRange(pos, pos); } catch (e) {}
  });
}
function statusColor(s) { if (/未點/.test(s)) return '#c62828'; if (/異常|點貨中/.test(s)) return '#e68a00'; if (/已點/.test(s)) return '#2e7d32'; return '#888'; }
function pickupColor(s) {
  if (/中華郵政|新竹物流|新竹貨運/.test(s)) return '#1a6fd4';
  if (/7-ELEVEN|全家|萊爾富/.test(s)) return '#2e7d32';
  if (/隔日到/.test(s)) return '#8e24aa';
  if (/店到家宅配|蝦皮店到店/.test(s)) return '#e68a00';
  return '#555';
}

/* ===================== 鏡頭掃描 ===================== */
var scanner = null, scanCooldown = { code: '', t: 0 };
function openScanner(onResult, continuous) {
  $('#scanBox').classList.remove('hidden');
  scanner = new Html5Qrcode('scanReader');
  scanner.start({ facingMode: 'environment' },
    { fps: 15, qrbox: { width: 240, height: 180 }, disableFlip: true, experimentalFeatures: { useBarCodeDetectorIfSupported: true } },
    function (text) {
      text = String(text).trim(); var now = Date.now();
      if (text === scanCooldown.code && now - scanCooldown.t < 1500) return;
      scanCooldown = { code: text, t: now };
      if (navigator.vibrate) navigator.vibrate(55);
      if (continuous) onResult(text); else { closeScanner(); onResult(text); }
    }, function () {}
  ).catch(function (err) { closeScanner(); toast('無法開啟鏡頭:' + err, 'err'); });
}
function closeScanner() {
  $('#scanBox').classList.add('hidden');
  if (scanner) { var s = scanner; scanner = null; s.stop().then(function () { s.clear(); }).catch(function () {}); }
}
document.getElementById('scanClose').onclick = closeScanner;

/* ===================== 路由 ===================== */
var routes = {}, currentRender = null;
function rerenderActive() { if (currentRender) currentRender(); }
function router() {
  closeDrawer(); closeScanner();
  var hash = location.hash.slice(1) || '/storage';
  var path = hash.split('?')[0], params = {};
  (hash.split('?')[1] || '').split('&').forEach(function (kv) { var p = kv.split('='); if (p[0]) params[p[0]] = decodeURIComponent(p[1] || ''); });
  if (!store.user && path !== '/settings') { location.hash = '#/settings'; return; }
  currentRender = null;
  (routes[path] || pageStorage)(params);
}
function go(path, q) { location.hash = '#' + path + (q ? '?' + q : ''); }
function findProduct(sku) { for (var i = 0; i < store.products.length; i++) if (store.products[i].sku === sku) return store.products[i]; return null; }

document.getElementById('app').addEventListener('click', function (e) {
  var del = e.target.closest('[data-del]');
  if (del) { handleSecondDelete(del.getAttribute('data-del')); e.stopPropagation(); return; }
  var btn = e.target.closest('button[data-act]');
  if (btn) { var card = e.target.closest('[data-sku]'); if (card) go('/' + btn.getAttribute('data-act'), 'sku=' + encodeURIComponent(card.getAttribute('data-sku'))); return; }
  var nav = e.target.closest('[data-nav]');
  if (nav) location.hash = '#' + nav.getAttribute('data-nav');
});

/* ===================== 樂觀送出 ===================== */
function submitBg(body, okMsg, patch, noBack) {
  if (patch) { try { patch(); } catch (e) {} }
  store.pending++; updateSyncInfo();
  if (!noBack) history.back();
  toast('已送出,背景同步中…', '', 1400);
  apiPost(body).then(function (d) {
    store.pending--; updateSyncInfo();
    if (d.ok) {
      toast(okMsg, 'ok'); refreshProducts(true); loadData('rel', true);
      if (body.action === 'pickSave') { loadRecords('pick', true); loadData('picking', true); }
      if (body.action === 'pick346Save') { loadRecords('pick346', true); loadData('picking346', true); }
      if (body.action === 'bigcountSave' || body.action === 'bigcountAdd') { loadRecords('bigcount', true); loadData('bigcount', true); }
      apiGet('meta').then(applyMeta).catch(function () {});
    } else if (d.needPassword) { toast('⚠ 寫入被拒:請重新登入', 'err', 6000); }
    else { toast('⚠ 寫入失敗:' + (d.error || '') + '(請重新操作一次)', 'err', 6000); refreshProducts(true); }
  }).catch(function () { store.pending--; updateSyncInfo(); toast('⚠ 網路失敗,這筆沒有寫入,請重新操作', 'err', 6000); });
}

/* ===================== 通用元件 ===================== */
function searchBarHtml(id, extra) {
  return '<div class="searchbar"><input id="q_' + id + '" placeholder="輸入或掃描…" autocomplete="off">' +
    '<button id="scan_' + id + '" aria-label="掃描">📷</button><button id="clear_' + id + '" aria-label="清除">✕</button></div>' + (extra || '');
}
function bindSearch(id, onChange) {
  var q = $('#q_' + id);
  q.addEventListener('input', function () { onChange(q.value); });
  $('#clear_' + id).onclick = function () { q.value = ''; onChange(''); };
  $('#scan_' + id).onclick = function () { openScanner(function (text) { q.value = text; onChange(text); }); };
  return q;
}
function sortBarHtml(id, options, state) {
  return '<div class="filterbar" id="sort_' + id + '">' + options.map(function (o) {
    var on = state.key === o[0];
    return '<button class="chip' + (on ? ' on' : '') + '" data-sort="' + o[0] + '">' + o[1] + (on ? (state.asc ? ' ↑' : ' ↓') : '') + '</button>';
  }).join('') + '</div>';
}
function bindSortBar(id, state, onChange) {
  $('#sort_' + id).addEventListener('click', function (e) {
    var b = e.target.closest('button[data-sort]'); if (!b) return;
    var key = b.getAttribute('data-sort');
    if (state.key === key) state.asc = !state.asc; else { state.key = key; state.asc = true; }
    this.querySelectorAll('button').forEach(function (x) {
      var k = x.getAttribute('data-sort'); x.classList.toggle('on', k === state.key);
      x.textContent = x.textContent.replace(/ [↑↓]$/, '') + (k === state.key ? (state.asc ? ' ↑' : ' ↓') : '');
    });
    onChange();
  });
}
function sortItems(items, key, asc) {
  items.sort(function (a, b) {
    var va = a[key], vb = b[key], r;
    if (typeof va === 'number' && typeof vb === 'number') r = va - vb;
    else r = String(va || '').localeCompare(String(vb || ''), 'zh-Hant');
    return asc ? r : -r;
  });
  return items;
}
function tabBarHtml(id, tabs, active) {
  return '<div class="tabbar" id="tab_' + id + '">' + tabs.map(function (t) { return '<button class="' + (t[0] === active ? 'on' : '') + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>';
}
function bindTabBar(id, onChange) {
  $('#tab_' + id).addEventListener('click', function (e) {
    var b = e.target.closest('button[data-tab]'); if (!b) return;
    this.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); });
    b.classList.add('on'); onChange(b.getAttribute('data-tab'));
  });
}

/* ===================== 首頁 ===================== */
function pageHome() {
  $('#pageTitle').textContent = '首頁';
  var mods = [['#/storage', '🔍 儲位查詢'], ['#/orders', '📦 一般點貨(訂貨表)'], ['#/pick346', '📦 346點貨'],
    ['#/bigcount', '📋 盤點作業'], ['#/shortage', '❗ 缺貨單'], ['#/second-list', '🏬 第二庫存清單'], ['#/short-inv', '📝 缺貨登記']];
  var html = '<div class="form"><h2>功能</h2><div class="person-grid">' +
    mods.map(function (m) { return '<button data-nav="' + m[0].slice(1) + '">' + m[1] + '</button>'; }).join('') + '</div></div>';
  html += '<div class="form" style="margin-top:10px"><h2>連結</h2><div class="person-grid">' +
    store.links.map(function (l) { return '<button onclick="window.open(\'' + esc(l.url) + '\',\'_blank\')">🔗 ' + esc(l.name) + '</button>'; }).join('') + '</div></div>';
  $('#app').innerHTML = html;
}

/* ===================== 儲位查詢 ===================== */
var searchState = { term: '', field: 'all', onlySecond: false, sort: { key: 'loc', asc: true } };
var FIELD_OPTIONS = [['all', '全部欄位'], ['sku', '貨號'], ['name', '品名'], ['loc', '動態儲位'], ['secondLoc', '第二儲位'], ['barcode', '條碼'], ['vendor', '廠商']];
var SORT_OPTIONS = [['loc', '動態儲位'], ['qty', '庫存量'], ['name', '品名'], ['vendor', '廠商'], ['sku', '貨號']];
function pageStorage() {
  $('#pageTitle').textContent = '儲位查詢';
  $('#app').innerHTML =
    '<div class="searchbar"><input id="q" placeholder="輸入或掃描…" value="' + esc(searchState.term) + '" autocomplete="off">' +
    '<button id="scanBtn" aria-label="掃描">📷</button><button id="clearBtn" aria-label="清除">✕</button></div>' +
    '<div class="filterbar"><select id="field">' + FIELD_OPTIONS.map(function (o) { return '<option value="' + o[0] + '"' + (searchState.field === o[0] ? ' selected' : '') + '>' + o[1] + '</option>'; }).join('') + '</select>' +
    '<button class="chip' + (searchState.onlySecond ? ' on' : '') + '" id="chipSecond">有第二庫存</button></div>' +
    sortBarHtml('st', SORT_OPTIONS, searchState.sort) + '<div id="list"></div>';
  var q = $('#q');
  q.addEventListener('input', function () { searchState.term = q.value; renderList(); });
  $('#clearBtn').onclick = function () { searchState.term = ''; q.value = ''; renderList(); q.focus(); };
  $('#scanBtn').onclick = function () { openScanner(function (text) { searchState.term = text; q.value = text; renderList(); }); };
  $('#field').onchange = function () { searchState.field = this.value; renderList(); };
  $('#chipSecond').onclick = function () { searchState.onlySecond = !searchState.onlySecond; this.classList.toggle('on', searchState.onlySecond); renderList(); };
  bindSortBar('st', searchState.sort, renderList);
  currentRender = renderList; renderList();
}
function matchProduct(p, term, field) {
  if (!term) return true;
  if (field === 'all') return p.sku.indexOf(term) >= 0 || p.barcode.indexOf(term) >= 0 || p.name.indexOf(term) >= 0 || p.loc.indexOf(term) >= 0 || p.secondLoc.indexOf(term) >= 0 || p.vendor.indexOf(term) >= 0;
  return String(p[field] || '').indexOf(term) >= 0;
}
function productCard(p, withBtns) {
  var second = p.secondLoc ? ' <span class="second">(庫: ' + esc(p.secondLoc) + ')</span>' : '';
  var h = '<div class="card" data-sku="' + esc(p.sku) + '" data-nav="/detail?sku=' + encodeURIComponent(p.sku) + '">' +
    '<div class="locline"><span class="loc">➜ ' + esc(p.loc || '—') + second + '</span><span class="qty">' + p.qty + '</span></div>' +
    '<div class="name">' + esc(p.name) + '</div>' +
    '<div class="sku">' + esc(p.sku) + (p.spec1 ? ' · ' + esc(p.spec1) : '') + '</div>' +
    '<div class="sales">30天月銷: ' + p.sale30 + ' / 90天月銷: ' + p.sale90 + '</div>';
  if (withBtns) h += '<div class="btns"><button data-act="relocate">✈ 改儲位</button><button data-act="second">✔ 第二庫存</button><button data-act="count">📋 盤點</button></div>';
  return h + '</div>';
}
function renderList() {
  var box = $('#list'); if (!box) return;
  var termU = searchState.term.trim().toUpperCase(), termRaw = searchState.term.trim();
  var items = store.products.filter(function (p) {
    if (searchState.onlySecond && !p.secondLoc) return false;
    return matchProduct(p, termU, searchState.field) || matchProduct(p, termRaw, searchState.field);
  });
  if (searchState.sort.key) items = sortItems(items.slice(), searchState.sort.key, searchState.sort.asc);
  items = items.slice(0, 50);
  box.innerHTML = items.length ? items.map(function (p) { return productCard(p, true); }).join('') : '<div class="empty">' + (store.products.length ? '沒有符合的品項' : '資料載入中…') + '</div>';
}

/* 加到盤點表(共用):寫入 條碼查詢.點貨表 A 欄 */
function addToBigcount(sku, btn) {
  if (btn) { btn.disabled = true; btn.textContent = '加入中…'; }
  var p = findProduct(sku);
  if (store.bigcount && !store.bigcount.some(function (r) { return r.sku === sku; }))
    store.bigcount.push({ sku: sku, name: p ? p.name : sku, barcode: p ? p.barcode : '', stock: p ? p.qty : 0, doneQty: null, user: '', loc: p ? p.loc : '', status: '未點' });
  apiPost({ action: 'bigcountAdd', sku: sku }).then(function (d) {
    if (d.ok || d.dup) { if (btn) btn.textContent = '已在盤點表 ✓'; toast('已加到盤點表:' + sku, 'ok'); loadData('bigcount', true); apiGet('meta').then(applyMeta); }
    else { if (btn) { btn.disabled = false; btn.textContent = '＋加到盤點表'; } toast('⚠ ' + (d.error || '加入失敗'), 'err', 4000); }
  }).catch(function () { if (btn) { btn.disabled = false; btn.textContent = '＋加到盤點表'; } toast('⚠ 網路失敗', 'err'); });
}

/* ===================== 商品明細(全預載,即時) ===================== */
function pageDetail(params) {
  var p = findProduct(params.sku || '');
  if (!p) { toast('找不到品項', 'err'); location.hash = '#/storage'; return; }
  $('#pageTitle').textContent = '商品明細';
  var kv = [['條碼', p.barcode], ['商品選項貨號', p.sku], ['原儲位', p.origLoc],
    ['目前動態儲位', p.loc + (p.secondLoc ? ' (庫: ' + p.secondLoc + ')' : '')], ['TMS品名', p.name],
    ['規格一', p.spec1], ['規格二', p.spec2], ['庫存量', p.qty], ['30天銷量', p.sale30],
    ['90天內30天平均銷售', p.sale90], ['庫存天數', Math.round(p.stockDays * 10) / 10], ['裝箱量', p.boxQty], ['廠商', p.vendor]];
  $('#app').innerHTML =
    '<div class="backrow"><button onclick="history.back()">← 返回</button></div>' + productCard(p, true) +
    '<div class="detail"><h3>對應表資料</h3><div class="kv">' + kv.map(function (r) { return '<div class="k">' + esc(r[0]) + '</div><div class="v">' + esc(r[1]) + '</div>'; }).join('') + '</div></div>' +
    '<div class="detail"><h3>第二庫存登記</h3><div id="secondBox"></div></div>' +
    '<div class="detail"><h3>改儲位紀錄(點擊可修改)</h3><div id="relocBox"></div></div>' +
    '<div class="detail"><h3>盤點紀錄(點擊可修改)</h3><div id="countBox"></div></div>' +
    '<div class="detail"><h3>進貨明細(近 15 筆)</h3><div class="scrollx" id="purchaseBox"></div></div>' +
    '<div class="actions"><button class="primary" id="toBigBtn">＋加到盤點表</button></div>';
  $('#toBigBtn').onclick = function () { addToBigcount(p.sku, this); };
  function renderRel() {
    var rel = store.rel || { relocs: [], seconds: [], counts: [] };
    var sec = rel.seconds.filter(function (r) { return r['貨號'] === p.sku; });
    $('#secondBox').innerHTML = sec.length ? sec.map(function (r) {
      return '<div class="reccard"><div class="recmain"><b>' + esc(r['第二儲位']) + '</b> · ' + esc(r['登記人']) + ' · ' + fmtDate(r['登記時間']) + (r['備註'] ? ' · ' + esc(r['備註']) : '') + '</div><button class="delbtn" data-del="' + esc(r['貨號']) + '">🗑 刪除</button></div>';
    }).join('') : '<div class="empty" style="padding:8px 0">無登記</div>';
    var rl = rel.relocs.filter(function (r) { return r['貨號'] === p.sku; });
    $('#relocBox').innerHTML = rl.length ? rl.map(function (r) {
      return '<div class="reccard" data-nav="/relocate?sku=' + encodeURIComponent(p.sku) + '"><div class="recmain">' + esc(r['舊儲位']) + ' → <b>' + esc(r['新儲位']) + '</b> · ' + esc(r['點貨人']) + ' · ' + fmtDate(r['點貨時間']) + (r['備註'] ? ' · ' + esc(r['備註']) : '') + '</div><span class="editmark">✏️</span></div>';
    }).join('') : '<div class="empty" style="padding:8px 0">無紀錄</div>';
    var ct = rel.counts.filter(function (r) { return r['商品選項貨號'] === p.sku; });
    $('#countBox').innerHTML = ct.length ? ct.map(function (r) {
      return '<div class="reccard" data-nav="/count-edit?id=' + encodeURIComponent(r['ID']) + '&sku=' + encodeURIComponent(p.sku) + '"><div class="recmain">盤點 <b>' + esc(r['盤點數量']) + '</b>(當時庫存 ' + esc(r['紀錄時庫存量']) + ')· ' + esc(r['盤點人員']) + ' · ' + fmtDate(r['盤點時間']) + (r['備註'] ? ' · ' + esc(r['備註']) : '') + '</div><span class="editmark">✏️</span></div>';
    }).join('') : '<div class="empty" style="padding:8px 0">無紀錄</div>';
  }
  renderRel();
  if (!store.rel) loadData('rel').then(renderRel);
  var pur = store.purchaseIdx[p.sku];
  if (pur) { $('#purchaseBox').innerHTML = recTable(pur, ['進貨日期', '進貨單號', '數量', '單價', '廠商']); }
  else {
    $('#purchaseBox').innerHTML = '<div class="empty" style="padding:10px 0">載入中…</div>';
    apiGet('detail&sku=' + encodeURIComponent(p.sku)).then(function (d) {
      if (!d.ok) return; store.purchaseIdx[p.sku] = d.purchases;
      var el = $('#purchaseBox'); if (el) el.innerHTML = recTable(d.purchases, ['進貨日期', '進貨單號', '數量', '單價', '廠商']);
    }).catch(function () { var el = $('#purchaseBox'); if (el) el.textContent = '無法連線後端'; });
  }
}
function recTable(rows, cols) {
  if (!rows || !rows.length) return '<div class="empty" style="padding:10px 0">無紀錄</div>';
  var h = '<table class="rectable"><tr>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>';
  h += rows.map(function (r) { return '<tr>' + cols.map(function (c) { return '<td>' + esc(r[c]) + '</td>'; }).join('') + '</tr>'; }).join('');
  return h + '</table>';
}

/* ===================== 改儲位 ===================== */
function pageRelocate(params) {
  var p = findProduct(params.sku || '');
  if (!p) { toast('找不到品項', 'err'); location.hash = '#/storage'; return; }
  $('#pageTitle').textContent = '改儲位';
  $('#app').innerHTML =
    '<div class="form"><h2>✈ 改儲位</h2>' +
    '<label>貨號</label><input class="ro" readonly value="' + esc(p.sku) + '">' +
    '<label>品名</label><input class="ro" readonly value="' + esc(p.name) + '">' +
    '<label>舊儲位(目前)</label><input class="ro" readonly value="' + esc(p.loc) + '">' +
    '<label>新儲位 *(預設同原儲位,改附近直接修改)</label>' +
    '<div class="inputrow"><input id="newLoc" autocomplete="off" value="' + esc(p.loc) + '"><button id="scanLoc" aria-label="掃描">📷</button></div>' +
    '<label>備註</label><input id="note"><div class="err" id="formErr"></div>' +
    '<div class="actions"><button onclick="history.back()">取消</button><button class="primary" id="saveBtn">儲存</button></div></div>';
  var locInput = $('#newLoc'); autoUpper(locInput);
  $('#scanLoc').onclick = function () { openScanner(function (text) { locInput.value = text.toUpperCase(); }); };
  $('#saveBtn').onclick = function () {
    var newLoc = locInput.value.trim().toUpperCase();
    if (!newLoc) { $('#formErr').textContent = '請輸入新儲位'; return; }
    if (newLoc === p.loc) { $('#formErr').textContent = '新儲位與目前相同,請修改後再儲存'; return; }
    var clash = store.products.find(function (x) { return x.loc === newLoc && x.sku !== p.sku; });
    if (clash) { $('#formErr').textContent = '此儲位已被其他商品佔用,請重新輸入!(' + clash.name + ')'; return; }
    var oldLoc = p.loc;
    submitBg({ action: 'relocate', sku: p.sku, newLoc: newLoc, note: $('#note').value }, '改儲位成功:' + oldLoc + ' → ' + newLoc, function () { p.loc = newLoc; saveCache(); });
  };
  locInput.focus();
  try { locInput.setSelectionRange(locInput.value.length, locInput.value.length); } catch (e) {}
}

/* ===================== 盤點(單品) ===================== */
function countFormHtml(p, qty0, note0, title) {
  return '<div class="form"><h2>📋 ' + title + '</h2>' +
    '<label>貨號</label><input class="ro" readonly value="' + esc(p.sku) + '">' +
    '<label>品名</label><input class="ro" readonly value="' + esc(p.name) + '">' +
    '<label>目前庫存量</label><input class="ro" readonly value="' + p.qty + '">' +
    '<label>盤點數量 *</label><div class="stepper"><button id="minus">−</button><input id="qty" type="number" inputmode="numeric" value="' + qty0 + '"><button id="plus">＋</button></div>' +
    '<label>標籤</label><div class="toggle"><button id="plToggle">🏷️ 要印標籤(預設不印)</button></div>' +
    '<label>備註(要印儲位貼、多找到的等等寫這裡)</label><input id="note" value="' + esc(note0 || '') + '"><div class="err" id="formErr"></div>' +
    '<div class="actions"><button onclick="history.back()">取消</button><button class="primary" id="saveBtn">儲存</button></div></div>';
}
function bindCountForm(onSave) {
  var printLabel = '';
  $('#minus').onclick = function () { var q = $('#qty'); q.value = Math.max(0, Number(q.value) - 1); };
  $('#plus').onclick = function () { var q = $('#qty'); q.value = Number(q.value) + 1; };
  $('#plToggle').onclick = function () {
    if (printLabel) { printLabel = ''; this.classList.remove('on'); this.textContent = '🏷️ 要印標籤(預設不印)'; }
    else { printLabel = '是'; this.classList.add('on'); this.textContent = '🏷️ 會印標籤 ✓'; }
  };
  $('#saveBtn').onclick = function () { var qty = Number($('#qty').value); if (isNaN(qty) || qty < 0) { $('#formErr').textContent = '請輸入正確數量'; return; } onSave(qty, $('#note').value, printLabel); };
}
function pageCount(params) {
  var p = findProduct(params.sku || '');
  if (!p) { toast('找不到品項', 'err'); location.hash = '#/storage'; return; }
  $('#pageTitle').textContent = '盤點';
  $('#app').innerHTML = countFormHtml(p, p.qty, '', '盤點');
  bindCountForm(function (qty, note, printLabel) { submitBg({ action: 'count', sku: p.sku, qty: qty, note: note, printLabel: printLabel }, '盤點已送出:' + p.sku + ' × ' + qty, null); });
}
function pageCountEdit(params) {
  var p = findProduct(params.sku || '') || { sku: params.sku, name: '', qty: '' };
  var rel = store.rel || { counts: [] };
  var rec = rel.counts.find(function (r) { return r['ID'] === params.id; });
  $('#pageTitle').textContent = '修改盤點紀錄';
  $('#app').innerHTML = countFormHtml(p, rec ? rec['盤點數量'] : 0, rec ? rec['備註'] : '', '修改盤點紀錄');
  bindCountForm(function (qty, note) { submitBg({ action: 'countUpdate', id: params.id, qty: qty, note: note }, '盤點紀錄已更新:' + p.sku + ' × ' + qty, null); });
}

/* ===================== 登記第二庫存 ===================== */
function pageSecond(params) {
  var p = findProduct(params.sku || '');
  if (!p) { toast('找不到品項', 'err'); location.hash = '#/storage'; return; }
  $('#pageTitle').textContent = '第二庫存';
  var already = p.secondLoc, printCount = 1, nums = '';
  for (var i = 0; i <= 9; i++) nums += '<button data-n="' + i + '"' + (i === 1 ? ' class="on"' : '') + '>' + i + '</button>';
  $('#app').innerHTML =
    '<div class="form"><h2>✔ 登記第二庫存區</h2>' +
    '<label>貨號</label><input class="ro" readonly value="' + esc(p.sku) + '">' +
    '<label>品名</label><input class="ro" readonly value="' + esc(p.name) + '">' +
    '<label>原儲位</label><input class="ro" readonly value="' + esc(p.origLoc) + '">' +
    '<label>第二儲位 *(可掃櫃位 QR code)</label>' +
    '<div class="inputrow"><input id="loc" autocomplete="off" placeholder="例 3C25A 或 4A-02" value="' + esc((p.origLoc || '').slice(0, 5)) + '"><button id="scanLoc" aria-label="掃描">📷</button></div>' +
    '<label>需列印張數</label><div class="numgrid" id="numGrid">' + nums + '</div>' +
    '<label>備註</label><input id="note">' +
    '<div class="err" id="formErr">' + (already ? '⚠ 此貨號已登記過第二儲位(' + esc(already) + ')。<div style="margin-top:8px"><button class="delbtn" data-del="' + esc(p.sku) + '">🗑 刪除舊的第二庫存(' + esc(already) + ')</button></div>' : '') + '</div>' +
    '<div class="actions"><button onclick="history.back()">取消</button><button class="primary" id="saveBtn">儲存</button></div></div>';
  var locInput = $('#loc'); autoUpper(locInput);
  $('#scanLoc').onclick = function () { openScanner(function (text) { locInput.value = text.toUpperCase(); }); };
  $('#numGrid').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-n]'); if (!b) return;
    printCount = Number(b.getAttribute('data-n'));
    this.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
  });
  $('#saveBtn').onclick = function () {
    var loc = locInput.value.trim().toUpperCase();
    if (!loc) { $('#formErr').textContent = '請輸入第二儲位'; return; }
    if (findProduct(p.sku).secondLoc) { $('#formErr').innerHTML = '⚠ 此貨號已登記過第二儲位,請先刪除舊的。'; return; }
    submitBg({ action: 'second', sku: p.sku, loc: loc, printCount: String(printCount), note: $('#note').value }, '第二庫存登記成功:' + loc, function () { p.secondLoc = loc; saveCache(); });
    if (printCount > 0) setTimeout(function () { if (confirm('要開啟標籤列印頁面嗎?')) window.open(CONFIG.LINKS.labelPrint, '_blank'); }, 350);
  };
  locInput.focus();
}

/* ===================== 第二庫存刪除 ===================== */
function handleSecondDelete(sku) {
  var p = findProduct(sku);
  var label = p ? p.name + '(庫: ' + p.secondLoc + ')' : sku;
  if (!confirm('確定刪除第二庫存?\n' + label)) return;
  store.pending++; updateSyncInfo();
  if (p) { p.secondLoc = ''; saveCache(); }
  rerenderActive();
  var scanItem = secondScan.items.find(function (i) { return i.sku === sku; });
  if (scanItem) { scanItem.deleted = true; renderScanPanel(); }
  apiPost({ action: 'secondDelete', sku: sku }).then(function (d) {
    store.pending--; updateSyncInfo();
    if (d.ok) { toast('已刪除第二庫存:' + sku, 'ok'); loadData('rel', true); }
    else toast('⚠ 刪除失敗:' + (d.error || ''), 'err', 5000);
  }).catch(function () { store.pending--; updateSyncInfo(); toast('⚠ 網路失敗,刪除未完成', 'err', 5000); });
}

/* ===================== 第二庫存清單 ===================== */
var secondState = { term: '', sort: { key: 'secondLoc', asc: true } };
var secondScan = { items: [] };
function pageSecondList() {
  $('#pageTitle').textContent = '第二庫存清單';
  $('#app').innerHTML = searchBarHtml('sl',
    sortBarHtml('sl', [['secondLoc', '第二儲位'], ['loc', '目前儲位'], ['qty', '庫存量'], ['name', '品名']], secondState.sort) +
    '<div class="filterbar"><button class="chip" id="multiScanBtn">📷 連續掃描刪除</button></div>') + '<div id="scanPanel"></div><div id="list2"></div>';
  bindSearch('sl', function (v) { secondState.term = v; renderSecondList(); });
  $('#q_sl').value = secondState.term;
  bindSortBar('sl', secondState.sort, renderSecondList);
  $('#multiScanBtn').onclick = startMultiScan;
  currentRender = function () { renderScanPanel(); renderSecondList(); };
  renderScanPanel(); renderSecondList();
}
function startMultiScan() {
  openScanner(function (code) {
    var p = store.products.find(function (x) { return x.secondLoc && (x.sku === code || x.barcode === code); });
    if (!p) { var any = store.products.find(function (x) { return x.sku === code || x.barcode === code; }); toast(any ? any.sku + ' 沒有第二庫存登記' : '找不到:' + code, 'err', 1500); return; }
    if (secondScan.items.some(function (i) { return i.sku === p.sku; })) { toast(p.sku + ' 已在清單中', '', 1000); return; }
    secondScan.items.push({ sku: p.sku, name: p.name, secondLoc: p.secondLoc, deleted: false });
    toast('已掃入:' + p.sku, 'ok', 1000); renderScanPanel();
  }, true);
}
function renderScanPanel() {
  var box = $('#scanPanel'); if (!box) return;
  if (!secondScan.items.length) { box.innerHTML = ''; return; }
  var undone = secondScan.items.filter(function (i) { return !i.deleted; });
  box.innerHTML = '<div class="detail"><h3>已掃描 ' + secondScan.items.length + ' 筆' +
    (undone.length ? ' <button class="chip" id="delAllBtn" style="margin-left:8px">全部刪除(' + undone.length + ')</button>' : '') +
    ' <button class="chip" id="clearScanBtn" style="margin-left:4px">清空清單</button></h3>' +
    secondScan.items.map(function (i) {
      return '<div class="secitem"><div class="secmain"' + (i.deleted ? ' style="text-decoration:line-through;color:#999"' : '') + '><span class="seclocbig">庫: ' + esc(i.secondLoc) + '</span><span class="secname">' + esc(i.name) + ' · ' + esc(i.sku) + '</span></div>' +
        (i.deleted ? '<span style="color:#2e7d32;font-size:14px">已刪 ✓</span>' : '<button class="delbtn big" data-del="' + esc(i.sku) + '">🗑 刪除</button>') + '</div>';
    }).join('') + '</div>';
  var da = $('#delAllBtn');
  if (da) da.onclick = function () {
    var skus = secondScan.items.filter(function (i) { return !i.deleted; }).map(function (i) { return i.sku; });
    if (!skus.length || !confirm('確定刪除這 ' + skus.length + ' 筆第二庫存?')) return;
    skus.forEach(function (sku) { var p = findProduct(sku); if (p) p.secondLoc = ''; var it = secondScan.items.find(function (i) { return i.sku === sku; }); if (it) it.deleted = true; });
    saveCache(); renderScanPanel(); renderSecondList();
    store.pending++; updateSyncInfo();
    apiPost({ action: 'secondDelete', skus: skus }).then(function (d) {
      store.pending--; updateSyncInfo();
      if (d.ok) { toast('已批次刪除 ' + d.deleted + ' 筆', 'ok'); loadData('rel', true); }
      else toast('⚠ 批次刪除失敗:' + (d.error || ''), 'err', 5000);
    }).catch(function () { store.pending--; updateSyncInfo(); toast('⚠ 網路失敗', 'err', 5000); });
  };
  var cs = $('#clearScanBtn'); if (cs) cs.onclick = function () { secondScan.items = []; renderScanPanel(); };
}
function renderSecondList() {
  var box = $('#list2'); if (!box) return;
  var term = secondState.term.trim().toUpperCase();
  var items = store.products.filter(function (p) { return p.secondLoc; });
  if (term) items = items.filter(function (p) { return p.sku.toUpperCase().indexOf(term) >= 0 || p.name.toUpperCase().indexOf(term) >= 0 || p.loc.toUpperCase().indexOf(term) >= 0 || p.secondLoc.toUpperCase().indexOf(term) >= 0 || p.barcode.indexOf(term) >= 0; });
  items = sortItems(items.slice(), secondState.sort.key, secondState.sort.asc);
  box.innerHTML = items.length ? items.map(function (p) {
    return '<div class="card seccard" data-sku="' + esc(p.sku) + '" data-nav="/detail?sku=' + encodeURIComponent(p.sku) + '"><div class="secrow">' +
      '<div class="secleft"><span class="loc">庫: ' + esc(p.secondLoc) + '</span><span class="name">' + esc(p.name) + '</span><span class="sku">' + esc(p.sku) + ' · 原儲位 ' + esc(p.loc) + '</span></div>' +
      '<div class="secright"><span class="qty">' + p.qty + '</span><button class="delbtn big" data-del="' + esc(p.sku) + '">🗑 刪除</button></div></div></div>';
  }).join('') : '<div class="empty">' + (store.products.length ? '沒有符合的第二庫存' : '資料載入中…') + '</div>';
}

/* ===================== 點貨共用 ===================== */
function pickCard(it, navAttr, showBox) {
  var lines;
  if (showBox) lines = '訂貨量: ' + it.orderQty + ' / 箱數: ' + (it.boxQty || 0) + ' / 實到: ' + (it.doneQty == null ? '' : it.doneQty) + ' / 點貨人: ' + (it.user || '') + (it.note ? ' / 備註: ' + it.note : '');
  else if (it.isBig) lines = '庫存: ' + it.stock + ' / 盤點量: ' + (it.doneQty == null ? '' : it.doneQty) + (it.user ? ' · ' + it.user : '');
  else lines = '訂貨量: ' + it.orderQty + ' / 已點數量: ' + (it.doneQty == null ? '' : it.doneQty) + (it.user ? ' · ' + it.user : '');
  var right = showBox ? ('箱 ' + (it.boxQty || 0)) : esc(it.loc);
  return '<div class="card" style="border-left:4px solid ' + statusColor(it.status) + ';border-radius:0 10px 10px 0" ' + navAttr + '>' +
    '<div class="locline"><span class="name" style="color:' + statusColor(it.status) + ';font-weight:bold">' + esc(it.name) + '</span><span class="sku">' + right + '</span></div>' +
    '<div class="sku">' + esc(it.subline || it.sku) + '</div><div class="sales">' + esc(lines) + '</div></div>';
}
function pickForm(opts) {
  var it = opts.it, existKind = opts.kind, existKey = opts.key;
  $('#pageTitle').textContent = opts.title;
  var unit = (it.boxQty && it.orderQty) ? (it.orderQty / it.boxQty) : 0;
  var showBox = opts.showBox && it.boxQty > 0;
  var refLabel = existKind === 'bigcount' ? '庫存' : '訂貨量';
  var refVal = existKind === 'bigcount' ? it.stock : it.orderQty;
  $('#app').innerHTML =
    '<div class="form"><h2>' + esc(opts.title) + '</h2>' +
    '<label>貨號</label><input class="ro" readonly value="' + esc(it.sku) + '">' +
    '<label>品名</label><input class="ro" readonly value="' + esc(it.name) + '">' +
    '<label>' + refLabel + '</label><input class="ro" readonly value="' + refVal + (it.boxQty ? ' (箱數 ' + it.boxQty + ')' : '') + '">' +
    (it.doneQty != null ? '<label>目前' + (existKind === 'bigcount' ? '盤點量' : '已點數量') + '</label><input class="ro" readonly value="' + it.doneQty + '">' : '') +
    '<div id="existBox"></div>' +
    (showBox ? '<label>本次箱數(與數量連動)</label><div class="stepper"><button id="bminus">−</button><input id="boxQty" type="number" inputmode="numeric" value="' + (it.boxQty || 0) + '"><button id="bplus">＋</button></div>' : '') +
    '<label>本次' + (existKind === 'bigcount' ? '盤點量' : '數量') + ' *</label><div class="stepper"><button id="minus">−</button><input id="qty" type="number" inputmode="numeric" value="' + opts.defaultQty + '"><button id="plus">＋</button></div>' +
    (opts.dims ? '<label>尺寸/重量(選填,不填免)</label><div class="dimrow"><input id="d0" type="number" inputmode="decimal" placeholder="長cm"><input id="d1" type="number" inputmode="decimal" placeholder="寬cm"><input id="d2" type="number" inputmode="decimal" placeholder="高cm"><input id="d3" type="number" inputmode="decimal" placeholder="重量g"></div>' : '') +
    '<label>備註(瑕疵、規格送錯、多送等寫這裡)</label><input id="note"><div class="err" id="formErr"></div>' +
    '<div class="actions"><button onclick="history.back()">取消</button><button class="primary" id="saveBtn">儲存(新增一筆)</button></div></div>';
  var qtyEl = $('#qty');
  $('#minus').onclick = function () { qtyEl.value = Math.max(0, Number(qtyEl.value) - 1); syncBox(); };
  $('#plus').onclick = function () { qtyEl.value = Number(qtyEl.value) + 1; syncBox(); };
  qtyEl.addEventListener('input', syncBox);
  function syncBox() { if (showBox && unit) { var b = $('#boxQty'); if (b) b.value = Math.round(Number(qtyEl.value) / unit * 100) / 100; } }
  if (showBox) {
    var boxEl = $('#boxQty');
    function fromBox() { qtyEl.value = Math.round(Number(boxEl.value) * unit); }
    $('#bminus').onclick = function () { boxEl.value = Math.max(0, Number(boxEl.value) - 1); fromBox(); };
    $('#bplus').onclick = function () { boxEl.value = Number(boxEl.value) + 1; fromBox(); };
    boxEl.addEventListener('input', fromBox);
  }
  var editRecId = null;
  $('#saveBtn').onclick = function () {
    var qty = Number(qtyEl.value); if (isNaN(qty) || qty < 0) { $('#formErr').textContent = '請輸入正確數量'; return; }
    var dims = opts.dims ? ['d0', 'd1', 'd2', 'd3'].map(function (id) { var v = $('#' + id).value.trim(); return v === '' ? '' : Number(v); }) : null;
    opts.onSave(qty, $('#note').value, editRecId, dims);
  };
  var recs = (store.recCache[existKind] || {})[existKey];
  function renderExist() {
    var list = (store.recCache[existKind] || {})[existKey] || [];
    var box = $('#existBox'); if (!box) return;
    if (!list.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<label>已有 ' + list.length + ' 筆紀錄 — 點「修改」改舊資料,或直接輸入新增新的一筆</label>' +
      list.map(function (r) { return '<div class="reccard"><div class="recmain">× <b>' + r.qty + '</b> · ' + esc(r.user) + ' · ' + fmtDate(r.time) + (r.note ? ' · ' + esc(r.note) : '') + '</div><button class="chip" data-rec="' + esc(r.recId) + '" data-qty="' + r.qty + '" data-note="' + esc(r.note) + '">✏️ 修改</button></div>'; }).join('');
    box.onclick = function (e) {
      var b = e.target.closest('button[data-rec]'); if (!b) return;
      editRecId = b.getAttribute('data-rec'); qtyEl.value = b.getAttribute('data-qty'); $('#note').value = b.getAttribute('data-note'); syncBox();
      $('#saveBtn').textContent = '儲存(修改這筆紀錄)';
      box.querySelectorAll('button[data-rec]').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on');
      $('#formErr').innerHTML = '正在修改既有紀錄。<button class="chip" id="cancelEdit">改回新增新的一筆</button>';
      $('#cancelEdit').onclick = function () { editRecId = null; $('#saveBtn').textContent = '儲存(新增一筆)'; $('#formErr').textContent = ''; box.querySelectorAll('button[data-rec]').forEach(function (x) { x.classList.remove('on'); }); };
    };
  }
  renderExist();
  if (!recs) loadRecords(existKind).then(renderExist);
}
/* 合併點貨人:不同人各自保留、用逗號分隔;時間覆蓋成最新 */
function mergeUser(existing, me) {
  var parts = String(existing || '').split(/[,，]/).map(function (s) { return s.trim(); }).filter(Boolean);
  if (parts.indexOf(me) < 0) parts.push(me);
  return parts.join(',');
}
function applyPickPatch(it, qty, isEdit, oldQty) {
  if (isEdit) it.doneQty = (it.doneQty || 0) - oldQty + qty; else it.doneQty = (it.doneQty || 0) + qty;
  it.user = mergeUser(it.user, store.user);
  if (/1-|2-|3-/.test(it.status)) it.status = it.doneQty >= it.orderQty ? '3-已點完' : '2-數量異常(需確認並告知主管)';
}

/* ===================== 一般點貨 ===================== */
var ordersOpen = {};
function pageOrders() {
  $('#pageTitle').textContent = '訂貨表';
  $('#app').innerHTML = '<div id="list"></div>';
  currentRender = renderOrders; renderOrders();
  loadData('picking').then(renderOrders);
}
function renderOrders() {
  var box = $('#list'); if (!box || (location.hash.slice(1) || '').split('?')[0] !== '/orders') return;
  var rows = store.picking; if (!rows) { box.innerHTML = '<div class="empty">載入中…</div>'; return; }
  var groups = {};
  rows.forEach(function (r) { var g = groups[r.group] = groups[r.group] || { name: r.group, vendor: r.vendorCode, date: r.orderDate, total: 0, done: 0 }; g.total++; if (r.status === '3-已點完') g.done++; });
  var vendors = {};
  Object.keys(groups).forEach(function (k) { var v = groups[k].vendor || '(無廠商)'; (vendors[v] = vendors[v] || []).push(groups[k]); });
  box.innerHTML = Object.keys(vendors).sort().map(function (v) {
    var single = vendors[v].length === 1, open = single || ordersOpen[v];
    var head = '<div class="detail"><h3 class="folder" data-vendor="' + esc(v) + '">' + (single ? '' : (open ? '▼ ' : '▶ ')) + esc(v) + '(' + vendors[v].length + ' 張單)</h3>';
    var body = open ? vendors[v].map(function (g) {
      var pct = g.total ? Math.round(g.done / g.total * 100) : 0, color = pct === 100 ? '#2e7d32' : (pct > 0 ? '#e68a00' : '#c62828');
      return '<div class="card" data-nav="/order-detail?g=' + encodeURIComponent(g.name) + '"><div class="locline"><span class="name">📁 ' + esc(g.name || '(未分組)') + '</span><span style="color:' + color + ';font-weight:bold">' + g.done + '/' + g.total + '</span></div><div class="sku">' + esc(fmtDate(g.date)) + '</div></div>';
    }).join('') : '';
    return head + body + '</div>';
  }).join('') || '<div class="empty">目前沒有訂貨資料</div>';
  box.querySelectorAll('h3.folder').forEach(function (h) { h.onclick = function () { var v = this.getAttribute('data-vendor'); ordersOpen[v] = !ordersOpen[v]; renderOrders(); }; });
}
function pageOrderDetail(params) {
  var g = params.g || '';
  $('#pageTitle').textContent = '訂貨明細';
  $('#app').innerHTML = '<div class="backrow"><button onclick="history.back()">← 返回訂貨表</button></div>' + searchBarHtml('od') + '<div id="list"></div>';
  var term = '';
  bindSearch('od', function (v) { term = v.toUpperCase(); render(); });
  function render() {
    var box = $('#list'); if (!box) return;
    var rows = (store.picking || []).filter(function (r) { return r.group === g; });
    if (term) rows = rows.filter(function (r) { return r.sku.toUpperCase().indexOf(term) >= 0 || r.name.toUpperCase().indexOf(term) >= 0 || r.barcode.indexOf(term) >= 0 || r.loc.toUpperCase().indexOf(term) >= 0; });
    if (!rows.length) { box.innerHTML = '<div class="empty">載入中或無資料…</div>'; return; }
    var groups = {};
    rows.forEach(function (r) { (groups[r.status] = groups[r.status] || []).push(r); });
    box.innerHTML = Object.keys(groups).sort().map(function (s) {
      return '<div class="detail"><h3 style="color:' + statusColor(s) + '">' + esc(s) + '(' + groups[s].length + ')</h3>' +
        groups[s].map(function (it) { var c = Object.assign({}, it); c.subline = it.barcode + (it.loc ? ' · ' + it.loc : ''); return pickCard(c, 'data-nav="/pick?id=' + encodeURIComponent(it.id) + '"'); }).join('') + '</div>';
    }).join('');
  }
  currentRender = render; render();
  loadData('picking').then(render);
}
function pagePick(params) {
  var it = (store.picking || []).find(function (r) { return r.id === params.id; });
  if (!it) { toast('找不到品項', 'err'); history.back(); return; }
  var remain = Math.max(0, it.orderQty - (it.doneQty || 0));
  pickForm({ title: '點貨', it: it, defaultQty: remain || it.orderQty, kind: 'pick', key: it.id,
    onSave: function (qty, note, recId) { submitBg({ action: 'pickSave', id: it.id, qty: qty, note: note, recId: recId }, (recId ? '已修改點貨紀錄:' : '點貨已送出:') + it.sku + ' × ' + qty, function () { applyPickPatch(it, qty, !!recId, recId ? qty : 0); }); } });
}

/* ===================== 346點貨 ===================== */
var p346Tab = '未點';
function pagePick346List() {
  $('#pageTitle').textContent = '346點貨';
  $('#app').innerHTML = searchBarHtml('p346', tabBarHtml('p346', [['未點', '未點'], ['點貨中', '點貨中'], ['已點', '已點完']], p346Tab)) + '<div id="list"></div>';
  var term = '';
  bindSearch('p346', function (v) { term = v.toUpperCase(); render(); });
  bindTabBar('p346', function (t) { p346Tab = t; render(); });
  function render() {
    var box = $('#list'); if (!box) return;
    var rows = store.picking346; if (!rows) { box.innerHTML = '<div class="empty">載入中…</div>'; return; }
    rows = rows.filter(function (r) { return (r.status || '未點') === p346Tab; });
    if (term) rows = rows.filter(function (r) { return r.sku.toUpperCase().indexOf(term) >= 0 || r.name.toUpperCase().indexOf(term) >= 0 || r.loc.toUpperCase().indexOf(term) >= 0; });
    box.innerHTML = rows.length ? rows.map(function (it) { var c = Object.assign({}, it); c.subline = it.spec1 || it.loc; return pickCard(c, 'data-nav="/pick346form?sku=' + encodeURIComponent(it.sku) + '"', true); }).join('') : '<div class="empty">此分頁沒有品項</div>';
  }
  currentRender = render; render();
  loadData('picking346').then(render);
}
function pagePick346Form(params) {
  var it = (store.picking346 || []).find(function (r) { return r.sku === params.sku; });
  if (!it) { toast('找不到品項', 'err'); history.back(); return; }
  var remain = Math.max(0, it.orderQty - (it.doneQty || 0));
  pickForm({ title: '346點貨', it: it, defaultQty: remain || it.orderQty, kind: 'pick346', key: it.sku, showBox: true,
    onSave: function (qty, note, recId) { submitBg({ action: 'pick346Save', sku: it.sku, qty: qty, note: note, recId: recId }, (recId ? '已修改點貨紀錄:' : '346點貨已送出:') + it.sku + ' × ' + qty, function () { applyPickPatch(it, qty, !!recId, recId ? qty : 0); if (it.status === '未點') it.status = '點貨中'; }); } });
}

/* ===================== 盤點作業(盤點表) ===================== */
var bigTab = '待點', bigSort = { key: 'loc', asc: true }, bigDelMode = false, bigDelSel = {};
function pageBigcount() {
  $('#pageTitle').textContent = '盤點作業';
  $('#app').innerHTML = searchBarHtml('bc',
    tabBarHtml('bc', [['待點', '待點清單'], ['已點', '已點清單']], bigTab) +
    '<div class="filterbar"><button class="chip" id="bcScan">📷 連續掃描加入</button>' +
    '<button class="chip' + (bigDelMode ? ' on' : '') + '" id="bcDelMode">🗑 刪除模式</button>' +
    '<button class="chip" id="bcDelDo" style="display:none">刪除已選</button></div>' +
    sortBarHtml('bc', [['loc', '儲位'], ['stock', '庫存'], ['name', '品名'], ['sku', '貨號']], bigSort)) + '<div id="list"></div>';
  var term = '';
  bindSearch('bc', function (v) { term = v.toUpperCase(); render(); });
  bindTabBar('bc', function (t) { bigTab = t; render(); });
  bindSortBar('bc', bigSort, render);
  $('#bcScan').onclick = startBigScan;
  $('#bcDelMode').onclick = function () {
    bigDelMode = !bigDelMode; bigDelSel = {};
    this.classList.toggle('on', bigDelMode);
    $('#bcDelDo').style.display = bigDelMode ? '' : 'none';
    render();
  };
  $('#bcDelDo').onclick = function () {
    var skus = Object.keys(bigDelSel).filter(function (k) { return bigDelSel[k]; });
    if (!skus.length) { toast('請先勾選要刪除的品項', 'err'); return; }
    if (!confirm('確定從盤點表刪除這 ' + skus.length + ' 筆?')) return;
    if (store.bigcount) store.bigcount = store.bigcount.filter(function (r) { return skus.indexOf(r.sku) < 0; });
    bigDelSel = {}; render();
    store.pending++; updateSyncInfo();
    apiPost({ action: 'bigcountDelete', skus: skus }).then(function (d) {
      store.pending--; updateSyncInfo();
      if (d.ok) { toast('已刪除 ' + d.deleted + ' 筆', 'ok'); loadData('bigcount', true).then(rerenderActive); apiGet('meta').then(applyMeta); }
      else toast('⚠ 刪除失敗:' + (d.error || ''), 'err', 5000);
    }).catch(function () { store.pending--; updateSyncInfo(); toast('⚠ 網路失敗', 'err'); });
  };
  function render() {
    var box = $('#list'); if (!box) return;
    var rows = store.bigcount; if (!rows) { box.innerHTML = '<div class="empty">載入中…</div>'; return; }
    var mapped = rows.map(function (r) { var o = {}; for (var k in r) o[k] = r[k]; o.isBig = true; o.status = r.status || (r.doneQty == null ? '未點' : '已點'); return o; })
      .filter(function (r) { return bigTab === '待點' ? r.status !== '已點' : r.status === '已點'; });
    if (term) mapped = mapped.filter(function (r) { return r.sku.toUpperCase().indexOf(term) >= 0 || r.name.toUpperCase().indexOf(term) >= 0 || r.loc.toUpperCase().indexOf(term) >= 0 || (r.barcode || '').indexOf(term) >= 0; });
    mapped = sortItems(mapped, bigSort.key, bigSort.asc);
    if (!mapped.length) { box.innerHTML = '<div class="empty">此分頁沒有品項</div>'; return; }
    box.innerHTML = mapped.map(function (it) {
      var c = Object.assign({}, it); c.subline = it.sku + (it.loc ? ' · ' + it.loc : '');
      if (bigDelMode) {
        var chk = bigDelSel[it.sku] ? '☑' : '☐';
        return '<div class="card delrow' + (bigDelSel[it.sku] ? ' sel' : '') + '" data-delsku="' + esc(it.sku) + '">' +
          '<div class="locline"><span class="name" style="color:' + statusColor(it.status) + ';font-weight:bold">' + chk + ' ' + esc(it.name) + '</span><span class="sku">' + esc(it.loc) + '</span></div>' +
          '<div class="sku">' + esc(it.sku) + '</div><div class="sales">庫存: ' + it.stock + ' / 盤點量: ' + (it.doneQty == null ? '' : it.doneQty) + '</div></div>';
      }
      return pickCard(c, 'data-nav="/bigcountform?sku=' + encodeURIComponent(it.sku) + '"');
    }).join('');
    if (bigDelMode) box.querySelectorAll('.delrow').forEach(function (el) {
      el.onclick = function () { var sku = this.getAttribute('data-delsku'); bigDelSel[sku] = !bigDelSel[sku]; render(); };
    });
  }
  currentRender = render; render();
  loadData('bigcount').then(render);
}
function startBigScan() {
  openScanner(function (code) {
    var p = store.products.find(function (x) { return x.sku === code || x.barcode === code; });
    var sku = p ? p.sku : code;
    if ((store.bigcount || []).some(function (r) { return r.sku === sku; })) { toast(sku + ' 已在盤點表', '', 1200); return; }
    if (store.bigcount) store.bigcount.push({ sku: sku, name: p ? p.name : '(掃描新增)', barcode: p ? p.barcode : code, stock: p ? p.qty : 0, doneQty: null, user: '', loc: p ? p.loc : '', status: '未點' });
    rerenderActive();
    apiPost({ action: 'bigcountAdd', sku: sku }).then(function (d) {
      if (d.ok) { toast('已加入盤點表:' + sku, 'ok', 1200); loadData('bigcount', true).then(rerenderActive); }
      else if (d.dup) toast(sku + ' 已在盤點表', '', 1200);
      else toast('⚠ 加入失敗:' + (d.error || ''), 'err', 4000);
    }).catch(function () { toast('⚠ 網路失敗', 'err', 3000); });
  }, true);
}
function pageBigcountForm(params) {
  var it = (store.bigcount || []).find(function (r) { return r.sku === params.sku; });
  if (!it) { toast('找不到品項', 'err'); history.back(); return; }
  pickForm({ title: '盤點作業', it: it, defaultQty: it.doneQty != null ? it.doneQty : it.stock, kind: 'bigcount', key: it.sku, dims: true,
    onSave: function (qty, note, recId, dims) { submitBg({ action: 'bigcountSave', sku: it.sku, qty: qty, note: note, recId: recId, dims: dims }, (recId ? '已修改盤點紀錄:' : '盤點已送出:') + it.sku + ' × ' + qty, function () { it.doneQty = qty; it.user = mergeUser(it.user, store.user); it.status = '已點'; }); } });
}

/* ===================== 缺貨單 ===================== */
function shortageHandleSelect(id, val) {
  return '<select id="' + id + '"><option value="">(未設定)</option>' + SHORTAGE_HANDLE.map(function (o) { return '<option' + (o === val ? ' selected' : '') + '>' + o + '</option>'; }).join('') + '</select>';
}
function pageShortage() {
  $('#pageTitle').textContent = '缺貨單(未結案)';
  $('#app').innerHTML = searchBarHtml('sh', '<div class="filterbar"><button class="chip on" data-nav="/shortage-add">＋ 新增缺貨</button></div>') + '<div id="list"></div>';
  var term = '';
  bindSearch('sh', function (v) { term = v.toUpperCase(); render(); });
  function render() {
    var box = $('#list'); if (!box) return;
    var rows = store.shortage; if (!rows) { box.innerHTML = '<div class="empty">載入中…</div>'; return; }
    if (term) rows = rows.filter(function (r) { return r.sku.toUpperCase().indexOf(term) >= 0 || r.name.toUpperCase().indexOf(term) >= 0 || r.orderNo.toUpperCase().indexOf(term) >= 0; });
    box.innerHTML = rows.length ? rows.map(function (r) {
      var c = pickupColor(r.pickup);
      return '<div class="card" style="border-left:4px solid ' + c + ';border-radius:0 10px 10px 0" data-nav="/shortage-edit?id=' + encodeURIComponent(r.id) + '">' +
        '<div class="locline"><span style="color:' + c + ';font-weight:bold">' + esc(r.orderNo || '(無單號)') + '</span><span style="color:' + c + ';font-size:13px">' + esc(r.pickup) + ' ✏️</span></div>' +
        '<div class="name">' + esc(r.name) + (r.spec2 ? ' · ' + esc(r.spec2) : '') + '</div><div class="sku">' + esc(r.sku) + ' · 儲位 ' + esc(r.loc) + '</div>' +
        '<div class="sales">缺貨數量: <b>' + r.shortQty + '</b> · 龍宮庫存: ' + r.qty + (r.status ? ' · 處理: ' + esc(r.status) : '') + (r.note ? ' · ' + esc(r.note) : '') + '</div></div>';
    }).join('') : '<div class="empty">沒有未結案的缺貨單 🎉</div>';
  }
  currentRender = render; render();
  loadData('shortage').then(render);
}
function pageShortageAdd() {
  $('#pageTitle').textContent = '新增缺貨';
  $('#app').innerHTML =
    '<div class="form"><h2>＋ 新增缺貨</h2>' +
    '<label>銷貨單號 *(可掃描)</label><div class="inputrow"><input id="orderNo" autocomplete="off" inputmode="numeric"><button id="scanNo" aria-label="掃描">📷</button></div>' +
    '<div class="filterbar"><button class="chip" id="loadItems">查詢此單的商品</button></div><div id="itemBox"></div>' +
    '<label>商品貨號 *(從上方選或自行輸入/掃描)</label><div class="inputrow"><input id="sku" autocomplete="off"><button id="scanSku" aria-label="掃描">📷</button></div>' +
    '<label id="qtyLabel">缺貨數量 *</label><div class="stepper"><button id="minus">−</button><input id="qty" type="number" inputmode="numeric" value="1"><button id="plus">＋</button></div>' +
    '<label>處理狀況</label>' + shortageHandleSelect('handle', '') +
    '<label>備註</label><input id="note"><div class="err" id="formErr"></div>' +
    '<div class="actions"><button onclick="history.back()">取消</button><button class="primary" id="saveBtn">儲存</button></div></div>';
  var pickup = '', orderQtyCap = 0;
  $('#scanNo').onclick = function () { openScanner(function (t) { $('#orderNo').value = t; loadItems(); }); };
  $('#scanSku').onclick = function () { openScanner(function (t) { $('#sku').value = t; }); };
  $('#minus').onclick = function () { var q = $('#qty'); q.value = Math.max(1, Number(q.value) - 1); };
  $('#plus').onclick = function () { var q = $('#qty'); var n = Number(q.value) + 1; if (orderQtyCap && n > orderQtyCap) { toast('缺貨數量不能超過下單數量 ' + orderQtyCap, 'err', 2000); return; } q.value = n; };
  $('#qty').addEventListener('input', function () { if (orderQtyCap && Number(this.value) > orderQtyCap) { this.value = orderQtyCap; toast('缺貨數量上限 ' + orderQtyCap, 'err', 1500); } });
  function loadItems() {
    var no = $('#orderNo').value.trim(); if (!no) return;
    var items = store.salesIdx[no];
    if (items) { showItems(items); return; }
    $('#itemBox').innerHTML = '<div class="empty" style="padding:8px 0">查詢中…</div>';
    apiGet('orderItems&no=' + encodeURIComponent(no)).then(function (d) {
      if (!d.ok) { $('#itemBox').innerHTML = '<div class="err">' + esc(d.error || '查詢失敗') + '</div>'; return; }
      store.salesIdx[no] = d.items; showItems(d.items);
    }).catch(function () { $('#itemBox').innerHTML = '<div class="err">無法連線</div>'; });
  }
  function showItems(items) {
    $('#itemBox').innerHTML = items.length ? '<label>此單商品(點選帶入)</label>' + items.map(function (i) {
      return '<div class="reccard" data-pick-sku="' + esc(i.sku) + '" data-pickup="' + esc(i.pickup) + '" data-qty="' + i.qty + '"><div class="recmain"><b>' + esc(i.sku) + '</b> ' + esc(i.name) + ' × ' + i.qty + ' · ' + esc(i.pickup) + '</div></div>';
    }).join('') : '<div class="empty" style="padding:8px 0">此單號查不到商品</div>';
  }
  $('#loadItems').onclick = loadItems;
  $('#orderNo').addEventListener('keydown', function (e) { if (e.key === 'Enter') loadItems(); });
  $('#itemBox').addEventListener('click', function (e) {
    var r = e.target.closest('[data-pick-sku]'); if (!r) return;
    $('#sku').value = r.getAttribute('data-pick-sku'); pickup = r.getAttribute('data-pickup');
    orderQtyCap = Number(r.getAttribute('data-qty')) || 0;
    $('#qty').value = orderQtyCap || 1;
    $('#qtyLabel').textContent = '缺貨數量 *(下單 ' + orderQtyCap + ',上限 ' + orderQtyCap + ')';
    this.querySelectorAll('.reccard').forEach(function (x) { x.style.background = ''; }); r.style.background = '#efe9f5';
  });
  $('#saveBtn').onclick = function () {
    var sku = $('#sku').value.trim(), qty = Number($('#qty').value);
    if (!sku || isNaN(qty) || qty <= 0) { $('#formErr').textContent = '請輸入貨號與數量'; return; }
    if (orderQtyCap && qty > orderQtyCap) { $('#formErr').textContent = '缺貨數量不能超過下單數量 ' + orderQtyCap; return; }
    var p = findProduct(sku);
    submitBg({ action: 'shortageAdd', orderNo: $('#orderNo').value.trim(), sku: sku, shortQty: qty, note: $('#note').value, pickup: pickup, loc: p ? p.loc : '', status: $('#handle').value },
      '缺貨已登記:' + sku + ' × ' + qty, function () {
        if (store.shortage) store.shortage.push({ id: 'tmp', orderNo: $('#orderNo').value.trim(), sku: sku, name: p ? p.name : '', spec2: p ? p.spec2 : '', loc: p ? p.loc : '', qty: p ? p.qty : 0, shortQty: qty, pickup: pickup, status: $('#handle').value, note: $('#note').value });
      });
  };
}
function pageShortageEdit(params) {
  var r = (store.shortage || []).find(function (x) { return x.id === params.id; });
  if (!r) { toast('找不到紀錄', 'err'); history.back(); return; }
  $('#pageTitle').textContent = '修改缺貨';
  var closed = false;
  var inBig = (store.bigcount || []).some(function (b) { return b.sku === r.sku; });
  $('#app').innerHTML =
    '<div class="form"><h2>✏️ 修改缺貨</h2>' +
    '<label>銷貨單號</label><input class="ro" readonly value="' + esc(r.orderNo) + '">' +
    '<label>品名(點擊看商品明細)</label>' +
    '<div class="inputrow"><button class="linkbtn" id="toProduct">' + esc(r.sku + ' ' + r.name) + '</button>' +
    '<button id="toBig" class="chip"' + (inBig ? ' disabled' : '') + '>' + (inBig ? '已在盤點表' : '＋盤點表') + '</button></div>' +
    '<label>缺貨數量</label><div class="stepper"><button id="minus">−</button><input id="qty" type="number" inputmode="numeric" value="' + r.shortQty + '"><button id="plus">＋</button></div>' +
    '<label>處理狀況</label>' + shortageHandleSelect('status', r.status) +
    '<label>備註</label><input id="note" value="' + esc(r.note) + '">' +
    '<label>是否結案</label><div class="toggle"><button id="clYes">結案</button><button id="clNo" class="on">未結案</button></div>' +
    '<div class="err" id="formErr"></div>' +
    '<div class="actions"><button onclick="history.back()">取消</button><button class="primary" id="saveBtn">儲存</button></div></div>';
  $('#toProduct').onclick = function () { if (findProduct(r.sku)) go('/detail', 'sku=' + encodeURIComponent(r.sku)); else toast('主檔查無此貨號', 'err'); };
  $('#toBig').onclick = function () {
    var self = this;
    if (self.disabled) return;
    self.disabled = true; self.textContent = '加入中…';
    apiPost({ action: 'bigcountAdd', sku: r.sku }).then(function (d) {
      if (d.ok || d.dup) { self.textContent = '已在盤點表'; toast('已加到盤點表:' + r.sku, 'ok'); loadData('bigcount', true); }
      else { self.disabled = false; self.textContent = '＋盤點表'; toast('⚠ ' + (d.error || '加入失敗'), 'err', 4000); }
    }).catch(function () { self.disabled = false; self.textContent = '＋盤點表'; toast('⚠ 網路失敗', 'err'); });
  };
  $('#minus').onclick = function () { var q = $('#qty'); q.value = Math.max(0, Number(q.value) - 1); };
  $('#plus').onclick = function () { var q = $('#qty'); q.value = Number(q.value) + 1; };
  $('#clYes').onclick = function () { closed = true; this.classList.add('on'); $('#clNo').classList.remove('on'); };
  $('#clNo').onclick = function () { closed = false; this.classList.add('on'); $('#clYes').classList.remove('on'); };
  $('#saveBtn').onclick = function () {
    submitBg({ action: 'shortageUpdate', id: r.id, shortQty: Number($('#qty').value), status: $('#status').value, note: $('#note').value, closed: closed }, '缺貨單已更新',
      function () { r.shortQty = Number($('#qty').value); r.status = $('#status').value; r.note = $('#note').value; if (closed && store.shortage) store.shortage = store.shortage.filter(function (x) { return x.id !== r.id; }); });
  };
}

/* ===================== 缺貨登記(短庫存 po 清單) ===================== */
var shortInvState = { term: '', font: Number(localStorage.getItem('si_font') || 11) };
/* 條件式格式(照抄缺貨登記分頁):單月>300洋紅/<5紅;三月>單月×2紅/<單月×0.3青 */
function siColor(field, r) {
  if (field === 'sale1') { if (r.sale1 > 300) return '#ff66ff'; if (r.sale1 < 5) return '#e69999'; }
  if (field === 'sale3') { if (r.sale3 > r.sale1 * 2) return '#e69999'; if (r.sale3 < r.sale1 * 0.3) return '#99ffff'; }
  return '';
}
function pageShortInv() {
  $('#pageTitle').textContent = '缺貨登記';
  $('#app').innerHTML =
    '<div class="sibar"><input id="q_si" placeholder="輸入或掃描…" autocomplete="off"><button id="scan_si">📷</button><button id="clear_si">✕</button>' +
    '<button class="chip" id="fontMinus">A−</button><button class="chip" id="fontPlus">A＋</button></div>' +
    '<div id="siList" class="siwrap"></div>';
  var q = $('#q_si'); q.value = shortInvState.term;
  q.addEventListener('input', function () { shortInvState.term = q.value; renderShortInv(); });
  $('#clear_si').onclick = function () { q.value = ''; shortInvState.term = ''; renderShortInv(); };
  $('#scan_si').onclick = function () { openScanner(function (t) { q.value = t; shortInvState.term = t; renderShortInv(); }); };
  $('#fontMinus').onclick = function () { shortInvState.font = Math.max(8, shortInvState.font - 2); localStorage.setItem('si_font', shortInvState.font); renderShortInv(); };
  $('#fontPlus').onclick = function () { shortInvState.font = Math.min(22, shortInvState.font + 2); localStorage.setItem('si_font', shortInvState.font); renderShortInv(); };
  currentRender = renderShortInv; renderShortInv();
  loadData('shortInv').then(renderShortInv);
}
function renderShortInv() {
  var box = $('#siList'); if (!box) return;
  var rows = store.shortInv; if (!rows) { box.innerHTML = '<div class="empty">載入中…</div>'; return; }
  var term = shortInvState.term.trim().toUpperCase();
  if (term) rows = rows.filter(function (r) { return r.sku.toUpperCase().indexOf(term) >= 0 || r.name.toUpperCase().indexOf(term) >= 0 || (r.barcode || '').indexOf(term) >= 0; });
  var f = shortInvState.font;
  var html = '<table class="sitable" style="font-size:' + f + 'px"><thead><tr><th>產品名稱</th><th>條碼</th><th>總庫存</th><th>單月</th><th>三月</th><th>備註</th></tr></thead><tbody>';
  html += rows.map(function (r, i) {
    var mark = r.mark ? ' <span style="color:' + (r.mark === '廠商缺貨' ? '#c62828' : '#e68a00') + '">[' + esc(r.mark) + ']</span>' : '';
    var c1 = siColor('sale1', r), c3 = siColor('sale3', r);
    return '<tr data-row="' + r.row + '" class="' + (i % 2 ? 'zd' : 'zl') + '"><td class="siname">' + esc(r.name) + mark + '</td><td>' + esc(r.barcode) + '</td><td>' + r.totalStock + '</td>' +
      '<td' + (c1 ? ' style="background:' + c1 + '"' : '') + '>' + r.sale1 + '</td>' +
      '<td' + (c3 ? ' style="background:' + c3 + '"' : '') + '>' + r.sale3 + '</td><td>' + esc(r.note) + '</td></tr>';
  }).join('') + '</tbody></table>';
  box.innerHTML = rows.length ? html : '<div class="empty">沒有符合的缺貨登記</div>';
  box.querySelectorAll('tr[data-row]').forEach(function (tr) { tr.onclick = function () { go('/short-inv-detail', 'row=' + tr.getAttribute('data-row')); }; });
}
function pageShortInvDetail(params) {
  var r = (store.shortInv || []).find(function (x) { return String(x.row) === String(params.row); });
  if (!r) { toast('找不到', 'err'); history.back(); return; }
  $('#pageTitle').textContent = '缺貨登記明細';
  var kv = [['日期', r.date], ['廠代', r.vendorCode], ['產品代號', r.sku], ['產品名稱', r.name], ['規格1', r.spec1],
    ['條碼', r.barcode], ['龍宮庫存', r.lgStock], ['儲位1', r.loc1], ['儲位2', r.loc2], ['總庫存', r.totalStock],
    ['單月銷量', r.sale1], ['三月銷量', r.sale3], ['配貨數量', r.allocQty], ['儲位', r.loc], ['備註', r.note], ['處理方式', r.handle], ['目前標記', r.mark]];
  $('#app').innerHTML =
    '<div class="backrow"><button onclick="history.back()">← 返回</button></div>' +
    '<div class="detail"><h3>' + esc(r.name) + '</h3>' +
    '<div class="toggle" style="margin-bottom:10px"><button id="mkVendor"' + (r.mark === '廠商缺貨' ? ' class="on"' : '') + '>廠商缺貨</button><button id="mkHold"' + (r.mark === '先不拿' ? ' class="on"' : '') + '>先不拿</button></div>' +
    (findProduct(r.sku) ? '<button class="linkbtn" id="toProduct" style="margin-bottom:10px">看商品明細 →</button>' : '') +
    '<div class="kv">' + kv.map(function (x) { return '<div class="k">' + esc(x[0]) + '</div><div class="v">' + esc(x[1]) + '</div>'; }).join('') + '</div></div>';
  var tp = $('#toProduct'); if (tp) tp.onclick = function () { go('/detail', 'sku=' + encodeURIComponent(r.sku)); };
  function mark(val) {
    r.mark = r.mark === val ? '' : val;
    $('#mkVendor').classList.toggle('on', r.mark === '廠商缺貨');
    $('#mkHold').classList.toggle('on', r.mark === '先不拿');
    store.pending++; updateSyncInfo();
    apiPost({ action: 'shortInvMark', row: r.row, mark: r.mark }).then(function (d) {
      store.pending--; updateSyncInfo();
      toast(d.ok ? ('已標記:' + (r.mark || '清除')) : ('⚠ ' + (d.error || '失敗')), d.ok ? 'ok' : 'err');
    }).catch(function () { store.pending--; updateSyncInfo(); toast('⚠ 網路失敗', 'err'); });
  }
  $('#mkVendor').onclick = function () { mark('廠商缺貨'); };
  $('#mkHold').onclick = function () { mark('先不拿'); };
}

/* ===================== 紀錄清單 ===================== */
function pageRecords(params) {
  var type = params.type === 'reloc' ? 'reloc' : 'count';
  $('#pageTitle').textContent = type === 'reloc' ? '改儲位紀錄' : '盤點紀錄';
  $('#app').innerHTML = '<div id="recList"><div class="empty">載入中…</div></div>';
  function render() {
    var rel = store.rel, box = $('#recList'); if (!box) return;
    if (!rel) { box.innerHTML = '<div class="empty">載入中…</div>'; return; }
    if (type === 'reloc') {
      box.innerHTML = rel.relocs.length ? rel.relocs.map(function (r) {
        return '<div class="card" data-nav="/relocate?sku=' + encodeURIComponent(r['貨號']) + '"><div class="locline"><span class="loc">' + esc(r['舊儲位']) + ' → ' + esc(r['新儲位']) + '</span><span class="sku">✏️ ' + fmtDate(r['點貨時間']) + '</span></div><div class="name">' + esc(r['品名']) + '</div><div class="sku">' + esc(r['貨號']) + ' · ' + esc(r['點貨人']) + (r['備註'] ? ' · ' + esc(r['備註']) : '') + '</div></div>';
      }).join('') : '<div class="empty">無紀錄</div>';
    } else {
      box.innerHTML = rel.counts.length ? rel.counts.map(function (r) {
        return '<div class="card" data-nav="/count-edit?id=' + encodeURIComponent(r['ID']) + '&sku=' + encodeURIComponent(r['商品選項貨號']) + '"><div class="locline"><span class="loc">盤點 ' + esc(r['盤點數量']) + '(當時庫存 ' + esc(r['紀錄時庫存量']) + ')</span><span class="sku">✏️ ' + fmtDate(r['盤點時間']) + '</span></div><div class="name">' + esc(r['商品名稱']) + '</div><div class="sku">' + esc(r['商品選項貨號']) + ' · ' + esc(r['盤點人員']) + (r['備註'] ? ' · ' + esc(r['備註']) : '') + '</div></div>';
      }).join('') : '<div class="empty">無紀錄</div>';
    }
  }
  currentRender = render; render();
  loadData('rel', true).then(render);
}

/* ===================== 設定 ===================== */
function pageSettings() {
  $('#pageTitle').textContent = '設定';
  var isAdmin = store.user === '0107韋力';
  var html = '<div class="form"><h2>登入人員</h2><div class="person-grid" id="grid">';
  html += store.staff.length ? store.staff.map(function (s) { var lock = store.staffPw[s] ? ' 🔒' : ''; return '<button class="' + (s === store.user ? 'me' : '') + '" data-name="' + esc(s) + '">' + esc(s) + lock + '</button>'; }).join('') : '<div class="empty">人員清單載入中…</div>';
  html += '</div><div class="err" id="formErr"></div>';
  if (store.user) html += '<div class="actions"><button id="logoutBtn">登出(清除人員)</button></div>';
  html += '</div>';
  html += '<div class="form" style="margin-top:10px"><h2>同步</h2><div id="syncDetail" style="font-size:14px;color:#666;margin-bottom:10px"></div><div class="actions"><button id="syncBtn">🔄 手動同步(全部資料)</button></div></div>';
  if (isAdmin && !store.configured) {
    html += '<div class="form" style="margin-top:10px"><h2>首次設定(僅 0107 韋力需要)</h2>' +
      '<label>公司固定 IP(目前偵測到:' + esc(store.ip || '偵測中…') + ')</label><input id="setupIp" value="' + esc(store.ip) + '">' +
      '<label>主管密碼</label><input id="setupPw" type="password"><div class="err" id="setupErr"></div>' +
      '<div class="actions"><button id="setupBtn">建立設定</button></div></div>';
  }
  if (isAdmin && store.configured) {
    html += '<div class="form" style="margin-top:10px"><h2>公司 IP 管理(僅 0107)</h2>' +
      '<div style="font-size:13px;color:#666;margin-bottom:8px">你目前的 IP:<b>' + esc(store.ip || '偵測中') + '</b></div>' +
      '<div id="ipList" class="empty" style="padding:6px 0">載入中…</div>' +
      '<div class="actions"><button id="ipAddCur">＋ 把目前 IP 加入</button></div>' +
      '<div class="inputrow" style="margin-top:8px"><input id="ipManual" placeholder="手動輸入 IP"><button id="ipAddManual" class="chip">加入</button></div></div>';
  }
  $('#app').innerHTML = html;
  if (isAdmin && store.configured) initIpManage();
  $('#syncDetail').textContent = $('#syncInfo').textContent;
  $('#syncBtn').onclick = manualSync;
  $('#grid').addEventListener('click', function (e) { var name = e.target.getAttribute && e.target.getAttribute('data-name'); if (name) selectUser(name); });
  var lb = $('#logoutBtn'); if (lb) lb.onclick = function () { store.user = ''; localStorage.removeItem('user'); updateSyncInfo(); pageSettings(); };
  var sb = $('#setupBtn');
  if (sb) sb.onclick = function () {
    var ip = $('#setupIp').value.trim(), pw = $('#setupPw').value;
    if (!ip || pw.length < 4) { $('#setupErr').textContent = 'IP 或密碼格式不正確(密碼至少 4 碼)'; return; }
    apiPost({ action: 'setup', companyIp: ip, password: pw }).then(function (d) { if (d.ok) { toast('設定完成', 'ok'); store.configured = true; pageSettings(); } else $('#setupErr').textContent = d.error || '設定失敗'; }).catch(function () { $('#setupErr').textContent = '無法連線後端'; });
  };
}
function initIpManage() {
  function refresh(ips) {
    var box = $('#ipList'); if (!box) return;
    box.className = '';
    box.innerHTML = ips.length ? ips.map(function (ip) {
      return '<div class="reccard"><div class="recmain">' + esc(ip) + (ip === store.ip ? ' <span style="color:#2e7d32">(目前)</span>' : '') + '</div><button class="delbtn" data-ip="' + esc(ip) + '">移除</button></div>';
    }).join('') : '<div class="empty" style="padding:6px 0">尚無 IP,請把目前 IP 加入</div>';
    box.querySelectorAll('button[data-ip]').forEach(function (b) {
      b.onclick = function () {
        var ip = b.getAttribute('data-ip');
        if (!confirm('確定移除 IP:' + ip + '?移除後該網段將無法免密碼使用')) return;
        apiPost({ action: 'ipManage', op: 'remove', value: ip }).then(function (d) { if (d.ok) { toast('已移除', 'ok'); refresh(d.ips); } else toast(d.error || '失敗', 'err'); });
      };
    });
  }
  apiPost({ action: 'ipManage', op: 'list' }).then(function (d) { if (d.ok) refresh(d.ips); else { var b = $('#ipList'); if (b) b.textContent = d.error || '載入失敗'; } });
  $('#ipAddCur').onclick = function () { apiPost({ action: 'ipManage', op: 'addCurrent' }).then(function (d) { if (d.ok) { toast('已加入目前 IP', 'ok'); refresh(d.ips); } else toast(d.error || '失敗', 'err'); }); };
  $('#ipAddManual').onclick = function () { var ip = $('#ipManual').value.trim(); if (!ip) return; apiPost({ action: 'ipManage', op: 'add', value: ip }).then(function (d) { if (d.ok) { toast('已加入', 'ok'); $('#ipManual').value = ''; refresh(d.ips); } else toast(d.error || '失敗', 'err'); }); };
}
function selectUser(name) {
  apiPost({ action: 'authcheck', name: name }).then(function (d) {
    if (d.ok) { finishLogin(name); return; }
    if (d.companyOnly) { toast('「' + name + '」僅限公司網路使用。如需回家使用,請 0107 到登入管理表為此人設定密碼。', 'err', 6000); return; }
    if (d.needPassword) {
      var pw = prompt('「' + name + '」不在公司網路,請輸入個人密碼:'); if (pw === null) return;
      apiPost({ action: 'loginUser', name: name, password: pw }).then(function (r) { if (r.ok) { store.token = r.token; localStorage.setItem('token', r.token); finishLogin(name); } else toast(r.error || '密碼錯誤', 'err', 4000); });
    }
  }).catch(function () { toast('無法連線後端', 'err'); });
}
function finishLogin(name) { store.user = name; localStorage.setItem('user', name); updateSyncInfo(); toast('已登入:' + name, 'ok'); location.hash = '#/storage'; }

/* ===================== 選單 ===================== */
function closeDrawer() { $('#drawer').classList.add('hidden'); $('#overlay').classList.add('hidden'); }
$('#menuBtn').onclick = function () { $('#drawer').classList.toggle('hidden'); $('#overlay').classList.toggle('hidden'); };
$('#overlay').onclick = closeDrawer;
$('#userBadge').onclick = function () { location.hash = '#/settings'; };
var syncNow = document.getElementById('syncNowBtn');
if (syncNow) syncNow.onclick = function () { closeDrawer(); manualSync(); };

/* ===================== 路由表 & 啟動 ===================== */
routes['/home'] = pageHome; routes['/storage'] = pageStorage; routes['/detail'] = pageDetail;
routes['/relocate'] = pageRelocate; routes['/count'] = pageCount; routes['/count-edit'] = pageCountEdit;
routes['/second'] = pageSecond; routes['/second-list'] = pageSecondList;
routes['/orders'] = pageOrders; routes['/order-detail'] = pageOrderDetail; routes['/pick'] = pagePick;
routes['/pick346'] = pagePick346List; routes['/pick346form'] = pagePick346Form;
routes['/bigcount'] = pageBigcount; routes['/bigcountform'] = pageBigcountForm;
routes['/shortage'] = pageShortage; routes['/shortage-add'] = pageShortageAdd; routes['/shortage-edit'] = pageShortageEdit;
routes['/short-inv'] = pageShortInv; routes['/short-inv-detail'] = pageShortInvDetail;
routes['/records'] = pageRecords; routes['/settings'] = pageSettings;

window.addEventListener('hashchange', router);
loadCache(); updateSyncInfo(); router();
fetchIp().then(function () {
  apiGet('meta').then(applyMeta).catch(function () {});
  apiPost({ action: 'staffAuth' }).then(function (d) { if (d.ok) { store.staffPw = d.staffPw || {}; lsSet('cache_staff', { staff: store.staff, staffPw: store.staffPw, links: store.links }); if ((location.hash.slice(1) || '').split('?')[0] === '/settings') pageSettings(); } }).catch(function () {});
  refreshProducts(true).then(preloadAll);
  startPolling(); startAuthRecheck();
});
