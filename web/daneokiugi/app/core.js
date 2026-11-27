'use strict';

const DT = window.DATA, BOOKS = window.BOOKS;
const INK = '#4A4138';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rnd = n => Math.floor(Math.random() * n);
const pickR = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad2 = n => String(n).padStart(2, '0');
const dkey = d => { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
const dnum = k => { const [y, m, d] = k.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 864e5); };
const dfrom = n => { const d = new Date(n * 864e5); return d.getUTCFullYear() + '-' + pad2(d.getUTCMonth() + 1) + '-' + pad2(d.getUTCDate()); };
const today = () => dkey();
const vib = ms => { try { window.Android && Android.vibrate(ms); } catch (e) {} };

let S = null;
function load() {
  let raw = null;
  try { raw = window.Android ? Android.loadData() : localStorage.getItem('wk'); } catch (e) {}
  try { const d = raw && JSON.parse(raw); if (d && d.app === 'wk') S = d; } catch (e) {}
  if (!S) S = { app: 'wk', v: 1, cur: -1, owners: [], pass: false };
  S.owners.forEach(ens);
}
let saveT = null;
function save(now) {
  clearTimeout(saveT);
  const f = () => { const j = JSON.stringify(S); try { window.Android ? Android.saveData(j) : localStorage.setItem('wk', j); } catch (e) {} };
  if (now) f(); else saveT = setTimeout(f, 250);
}
const O = () => S.owners[S.cur];
const TH = () => DT.themes[(O() && O().theme) || 'dino'];
function newVil() { return { objs: [], nid: 1, eggs: 0, merges: 0, rareAt: 25 + rnd(11), mysAt: 70 + rnd(31), found: {}, claimed: {}, seen: {}, bag: {}, gift: '', map2: 1, map3: 1, sc1: 1, res: { wood: 0, stone: 0 }, gatherAt: Date.now(), cards: {}, chal: { k: '', n: 0 }, trophy: -1, bestScore: 0 }; }

function ens(o) {
  if (!o) return o;
  o.title = o.title || ''; o.titles = o.titles || {}; o.stat = o.stat || {}; o.towns = o.towns || [];
  const v = o.vil; v.res = v.res || { wood: 0, stone: 0 }; v.gatherAt = v.gatherAt || Date.now(); v.cards = v.cards || {}; v.chal = v.chal || { k: '', n: 0 };
  if (v.mysAt > 100) v.mysAt = 70 + rnd(31);
  if (v.trophy == null) v.trophy = -1; v.bestScore = v.bestScore || 0;
  if (!o.resShared) { o.towns.forEach(tw => { const r = tw.vil && tw.vil.res; if (r) { v.res.wood += r.wood || 0; v.res.stone += r.stone || 0; tw.vil.res = { wood: 0, stone: 0 }; } }); o.resShared = 1; }
  if (!v.sc1) { v.sc1 = 1; const T = DT.themes[o.theme], cat = k => (T.homes.concat(T.rides).some(x => x.k === k)); v.objs.forEach(x => { if (x.t === 'i' && /^(L\d_|st\d)/.test(x.k) && !T.lines[x.k]) v.seen['g:' + x.k] = 1; if (x.t === 'f' && x.seat && cat(x.seat)) v.seen['h:' + x.seat] = 1; }); Object.keys(v.bag || {}).forEach(k => { if (cat(k)) v.seen['h:' + k] = 1; }); }
  if (!v.map2) { v.objs.forEach(x => { x.x = Math.round(x.x / 2); x.y = Math.round(x.y / 2); }); v.map2 = 1; }
  if (!v.map3) { v.objs.forEach(x => { if (x.t === 'f') delete x.nd; }); v.map3 = 1; }
  return o;
}
const ST = () => { const o = O(); return o.stat || (o.stat = {}); };
const bump = (k, n) => { const s = ST(); s[k] = (s[k] || 0) + (n || 1); };

const CONTACT = [['인스타그램', 'https://www.instagram.com/dadada._.family'], ['쓰레드', 'https://www.threads.com/@jeeeeeee._.hhh']];
const contactBtns = () => CONTACT.map(([n], i) => `<button type="button" data-a="maker" data-u="${i}" class="d" style="display:inline-flex;align-items:center;gap:2px;height:24px;margin-left:4px;padding:0 5px 1px 9px;border:1.5px solid var(--ink);border-radius:12px;background:var(--paper);color:var(--ink);font-size:12px;line-height:1;vertical-align:middle">${n}${ico(IC.fwd, 13, 2.6)}</button>`).join('');
const fitEn = (s, base, room) => Math.max(11, Math.min(base, Math.floor(room / (.6 * s.length))));

const isPhrase = s => /\s/.test(s);

const koParts = s => String(s).split(/[,;\/·]/).map(x => x.replace(/\(.*?\)/g, '').replace(/~/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
const _kp = new Map(), kparts = w => { let p = _kp.get(w); if (!p) { p = koParts(w[1]); _kp.set(w, p); } return p; };
const sameSense = (a, b) => a[1] === b[1] || kparts(a).some(p => kparts(b).includes(p));

const normEn = s => String(s == null ? '' : s).normalize('NFKC').toLowerCase().replace(/[^a-z]/g, '');

const cueOf = (ans, oth) => { const ext = oth.filter(o => o.indexOf(ans) === 0), rest = oth.filter(o => o.indexOf(ans) !== 0); let k = 1; while (k < ans.length - 1 && rest.some(o => o.slice(0, k) === ans.slice(0, k))) k++; return { p: ans.slice(0, k), n: ext.length > 0 || rest.some(o => o.slice(0, k) === ans.slice(0, k)) }; };
const cueText = (c, ans) => `<b class="d">${c.p}</b>${roEn(c.p)} 시작하는 ${c.n ? `<b class="d">${ans.length}</b>글자 ` : ''}단어를 써 주세요`;
const roEn = s => (/[mn]$/.test(s) ? '으로' : '로');

function spellDiff(a, b) {
  const n = a.length, m = b.length, D = []; for (let i = 0; i <= n; i++) { D.push([i]); for (let j = 1; j <= m; j++) D[i][j] = i ? Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) : j; }
  const out = []; let i = n, j = m;
  while (i || j) { if (i && j && D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { out.push([a[i - 1], b[j - 1]]); i--; j--; } else if (i && D[i][j] === D[i - 1][j] + 1) { out.push([a[i - 1], '']); i--; } else { out.push(['', b[j - 1]]); j--; } }
  return out.reverse();
}

const diffMine = d => d.map(([x, y]) => x === y ? esc(x) : !x ? '<i class="dm">_</i>' : `<i class="${y ? 'dw' : 'dx'}">${esc(x)}</i>`).join('');
const diffAns = d => d.map(([x, y]) => !y ? '' : x === y ? esc(y) : `<i class="df">${esc(y)}</i>`).join('');
let _enIdx = null;
const altOf = (w, v) => { if (!_enIdx) { _enIdx = {}; BOOKS.forEach(b => b.words.forEach(x => { const k = normEn(x[0]); (_enIdx[k] = _enIdx[k] || []).push(x); })); } return (_enIdx[v] || []).find(x => sameSense(x, w)); };
const fitEnAny = (s, base, room) => { if (!isPhrase(s)) return fitEn(s, base, room);
  const t = s.split(/\s+/); let best = s.length;
  for (let i = 1; i < t.length; i++) best = Math.min(best, Math.max(t.slice(0, i).join(' ').length, t.slice(i).join(' ').length));
  return Math.max(12, Math.min(base, Math.floor(room / (.62 * best)))); };
const qTok = w => w[0].split(/\s+/).map(t => { t = t.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, ''); return t === 'i' ? 'I' : t.indexOf("i'") === 0 ? 'I' + t.slice(1) : t; }).filter(Boolean);
const fitKo = (s, base) => s.length > 12 ? Math.min(base, 15) : s.length > 9 ? Math.min(base, 17) : base;
function defTypes(book) { return book === 'starter' ? { t1: 1, t2: 1, t3: 0, t4: 0, t5: 0 } : { t1: 1, t2: 1, t3: 1, t4: 0, t5: 1 }; }
function newOwner(d) {
  return { name: d.name, stick: d.stick || '', theme: d.theme, book: d.book, used: [d.book], towns: [], per: d.per || 20, mode: d.mode || 'card', types: d.types ? Object.assign(defTypes(d.book), d.types) : defTypes(d.book), typesSet: d.typesSet ? 1 : 0, auto: true, exRead: true, speed: 'slow',
    stars: 0, total: 0, eggBox: 1, itemBox: 1, title: '', titles: {}, stat: {}, w: {}, wr: {}, day: { k: '', q: 0, ok: 0, words: 0, ms: 0, wrong: [] }, streak: 0, best: 0, last: '', hist: {}, vil: newVil() };
}
const histToday = () => { const o = O(), k = today(); return o.hist[k] || (o.hist[k] = { q: 0, ok: 0, st: 0, ms: 0 }); };
function dayOf(o) { const k = today(); if (o.day.k !== k) o.day = { k, q: 0, ok: 0, words: 0, ms: 0, wrong: [] }; return o.day; }

function ico(d, size, w, color) { return `<svg viewBox="0 0 24 24" width="${size || 24}" height="${size || 24}" fill="none" stroke="${color || INK}" stroke-width="${w || 2.4}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:block;flex:none"><path d="${d}"/></svg>`; }
const IC = { cam: 'M4 8h3l2-3h6l2 3h3v11H4ZM12 10.5a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 0 0 0-6.4Z', photo: 'M4 5h16v14H4ZM4 15l4.5-4.5 4 4 2.5-2.5 5 5M15.5 9.2h.01', full: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5', back: 'M15 5l-7 7 7 7', fwd: 'M9 5l7 7-7 7', x: 'M6 6l12 12M18 6L6 18', check: 'M5 12.5l4.5 4.5L19 7.5', plus: 'M12 5v14M5 12h14', minus: 'M5 12h14',
  home: 'M4 11l8-7 8 7M6 10v9h12v-9', vil: 'M12 21v-6M12 15c-4 0-6-3-5-6-1-3 2-6 5-6s6 3 5 6c1 3-1 6-5 6Z', note: 'M6 4h9l3 3v13H6ZM9 10h6M9 14h6', chart: 'M5 20V10M12 20V4M19 20v-7',
  gear: 'M12 8.8a3.2 3.2 0 1 0 0 6.4a3.2 3.2 0 0 0 0-6.4ZM10.4 3h3.2l.5 2.3 1.7.7 2-1.3 2.3 2.3-1.3 2 .7 1.7 2.3.5v3.2l-2.3.5-.7 1.7 1.3 2-2.3 2.3-2-1.3-1.7.7-.5 2.3h-3.2l-.5-2.3-1.7-.7-2 1.3-2.3-2.3 1.3-2-.7-1.7L2.2 13.6v-3.2l2.3-.5.7-1.7-1.3-2 2.3-2.3 2 1.3 1.7-.7Z',
  spk: 'M4 10v4h4l5 4V6L8 10ZM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11', book: 'M5 5c3-1 5-1 7 1c2-2 4-2 7-1v13c-3-1-5-1-7 1c-2-2-4-2-7-1ZM12 6v13',
  star: 'M12 4l2.4 5 5.6.8-4 3.9.9 5.5L12 16.6 7.1 19.2l.9-5.5-4-3.9 5.6-.8Z', lock: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1Z',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.3 1 2.1h5c0-.8.4-1.6 1-2.1A6 6 0 0 0 12 3Z', del: 'M20 6H9l-6 6 6 6h11ZM12 9.5l5 5M17 9.5l-5 5', q: 'M9 9a3 3 0 1 1 4 2.8c-.7.4-1 1-1 1.7M12 17h.01' };
function stk(k, size, cls, smile) { return `<svg class="stk ${cls || ''}" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">${(smile && DT.artH[k]) || DT.art[k] || ''}</svg>`; }
function itm(k, size, cls) { return `<svg class="stk ${cls || ''}" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true"><g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${DT.item[k] || ''}</g></svg>`; }
function pic(k, size, cls) { return k[0] === '@' ? stk(k.slice(1), size, cls) : itm(k, size, cls); }
function mini(body, size) { return `<svg class="stk" viewBox="0 0 32 32" width="${size || 30}" height="${size || 30}" aria-hidden="true"><g stroke="${INK}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`; }
function spark(size, x, y, cls) { return `<svg class="spk ${cls || ''}" viewBox="-12 -12 24 24" width="${size}" height="${size}" style="left:${x}px;top:${y}px" aria-hidden="true"><path d="${DT.spk}" fill="#F9E79A" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/></svg>`; }
function checkStk(size) { return `<svg class="stk" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true"><g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><circle cx="60" cy="60" r="42" fill="var(--a2)"/><path d="M40 62l14 14 27-30" fill="none" stroke="#FFFDF6" stroke-width="16"/><path d="M40 62l14 14 27-30" fill="none" stroke-width="7"/></g></svg>`; }
function josa(w, a, b) { const c = w.charCodeAt(w.length - 1); if (c < 0xAC00 || c > 0xD7A3) return w + b; return w + ((c - 0xAC00) % 28 ? a : b); }
const nameOf = k => DT.names[k] || DT.frn[k] || DT.myn[k] || k;

function applyTheme(th) {
  const t = DT.themes[th || 'dino'], c = t.col, st = document.documentElement.style;
  for (const k of ['main', 'mainMid', 'mainLt', 'mainPale', 'bg', 'track', 'field', 'y', 'p', 'pD', 'c']) st.setProperty('--' + k, c[k]);
  c.acc.forEach((v, i) => st.setProperty('--a' + i, v)); c.tint.forEach((v, i) => st.setProperty('--t' + i, v));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><path d="${t.motif[0]}" fill="${c.dot}" transform="translate(10 12) scale(.85)"/><path d="${t.motif[1]}" fill="${c.dot}" transform="translate(46 48) scale(.85)"/></svg>`;
  $('#app').style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const SCR = {}, ACT = {};
const R = { name: '', p: {}, stack: [] };

let _scrOf = '';
function render() {
  if (window.vSync && S.cur >= 0 && O()) vSync();
  if (window.SND) SND.scene(R.name);
  const s = SCR[R.name], same = _scrOf === R.name, old = $('.scr'), keep = old && same ? old.scrollTop : 0, inner = {};
  if (same) document.querySelectorAll('#app [data-sc]').forEach(e => { inner[e.dataset.sc] = [e.scrollTop, e.scrollLeft]; });
  $('#app').classList.toggle('wide', R.name === 'vil');
  $('#app').innerHTML = s.view(R.p);
  if (keep) { const n = $('.scr'); if (n) n.scrollTop = keep; }
  for (const k in inner) { const e = $(`#app [data-sc="${k}"]`); if (e) { e.scrollTop = inner[k][0]; e.scrollLeft = inner[k][1]; } }
  _scrOf = R.name;
  if (s.after) s.after(R.p);
}
function go(name, p, opt) {
  opt = opt || {};
  const cur = SCR[R.name];
  if (cur && cur.leave) cur.leave();
  if (opt.reset) R.stack = []; else if (!opt.replace && R.name) R.stack.push([R.name, R.p]);
  R.name = name; R.p = p || {}; _scrOf = '';
  render();
  if (name === 'home') setTimeout(() => vxAsk(true), 1200);
}
function back() {
  const cur = SCR[R.name];
  const s = R.stack.pop();
  if (!s) return false;
  if (cur && cur.leave) cur.leave();
  R.name = s[0]; R.p = s[1]; _scrOf = ''; render();
  return true;
}
window.appBack = () => {
  if (closeModal()) return true;
  const s = SCR[R.name];
  if (s && s.back) return s.back() !== false;
  return back();
};

const NOTAP = { openBox: 1, mgOne: 1, mgAll: 1, mergeAll: 1, mixGo: 1, chalGo: 1, cans: 1, setSfx: 1 };
let _inClick = false, _mGuard = 0;
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  if (_mGuard && Date.now() - _mGuard < 420 && el.closest('#ov')) return;
  if (window.SND && !NOTAP[el.dataset.a]) SND.fx('tap');
  const f = ACT[el.dataset.a];
  if (f) { _inClick = true; try { f(el.dataset, el, e); } finally { _inClick = false; } }
});
ACT.back = () => { window.appBack(); };
ACT.go = d => go(d.s);
ACT.tab = d => { const m = { home: 'home', vil: 'vil', chal: 'chal', wrong: 'wrong', rec: 'rec' }; go(m[d.t], {}, { reset: true }); if (d.t !== 'home') R.stack = [['home', {}]]; };

function tabbar(on) {
  const items = [['home', '홈', IC.home, '--main', '--mainLt'], ['vil', '마을', IC.vil, '--a0', '--t0'], ['chal'], ['wrong', '오답노트', IC.note, '--a3', '--t3'], ['rec', '기록', IC.chart, '--a2', '--t2']];
  const mid = () => { const left = chalLeft(); return `<button type="button" class="mid${on === 'chal' ? ' on' : ''}" data-a="tab" data-t="chal" aria-label="도전"><span class="midb" style="${(left && chalOpen()) || on === 'chal' ? '' : 'filter:saturate(.45)'}">${stk(ENEMY[O().theme][0], 44)}${!chalOpen() ? `<i class="lk">${ico(IC.lock, 14, 2.6)}</i>` : left ? `<i class="tn">${O().inf ? '∞' : left}</i>` : ''}</span><span class="d">도전!</span></button>`; };
  return `<div class="tabbar">${items.map(([k, n, ic, sat, tin]) => k === 'chal' ? mid() : `<button type="button" class="${k === on ? 'on' : ''}" data-a="tab" data-t="${k}"><span style="background:var(${k === on ? sat : tin})">${ico(ic, 22)}</span><span>${n}</span></button>`).join('')}</div>`;
}
function topbar(title, right) { return `<div class="row"><button type="button" class="ibtn" data-a="back" aria-label="뒤로">${ico(IC.back)}</button><h1 class="sp">${title}</h1>${right || ''}</div>`; }
function starPill() { return `<div class="pill">${stk('s_star', 26)}<span class="tn" id="stars">${O().inf ? '∞' : O().stars}</span></div>`; }
function seg(act, opts, cur, cls) { return `<div class="seg ${cls || ''}">${opts.map(([v, n]) => `<button type="button" class="${String(v) === String(cur) ? 'on' : ''}" data-a="${act}" data-v="${v}">${n}</button>`).join('')}</div>`; }
function sw(act, on, label) { return `<div class="row"><span class="sp" style="font-size:15.5px">${label}</span><button type="button" class="sw ${on ? 'on' : ''}" role="switch" aria-checked="${!!on}" aria-label="${label}" data-a="${act}"><i></i></button></div>`; }
function ttl(name, col, ic) { return `<span class="row" style="gap:7px"><span class="dot" style="background:var(${col})">${ico(ic, 15, 2.6)}</span><h2>${name}</h2></span>`; }

let toastT = null;
function toast(msg) {
  $$('.toast').forEach(x => x.remove());
  const d = document.createElement('div'); d.className = 'toast'; d.textContent = msg; $('#app').appendChild(d);
  clearTimeout(toastT); toastT = setTimeout(() => d.remove(), 2200);
}
let modalClose = null;
let _lastM = null;
function modal(html, opt) {
  opt = opt || {};
  closeModal(true);
  const key = opt.key || (/<h1[^>]*>(.*?)<\/h1>/.exec(html) || [])[1] || '', again = key && _lastM && _lastM.key === key && Date.now() - _lastM.at < 1500;
  const d = document.createElement('div'); d.className = 'ov' + (opt.mid ? ' mid' : '') + (again ? ' still' : ''); d.id = 'ov'; d.dataset.key = key;
  d.innerHTML = `<div class="sheet">${html}</div>`;
  _mGuard = _inClick ? 0 : Date.now();
  if (!opt.sticky) d.addEventListener('click', e => { if (e.target === d && !(_mGuard && Date.now() - _mGuard < 420)) closeModal(); });
  $('#app').appendChild(d);
  if (again && _lastM.top) d.firstChild.scrollTop = _lastM.top;
  modalClose = opt.onClose || null;
  return d;
}
function closeModal(silent) {
  const d = $('#ov'); if (!d) return false;
  _lastM = { key: d.dataset.key, top: d.firstChild ? d.firstChild.scrollTop : 0, at: Date.now() };
  d.remove(); const f = modalClose; modalClose = null; if (f && !silent) f();
  return true;
}
ACT.close = () => closeModal();

function speak(t, rate) {
  try {
    if (vxPlay(t, rate)) return;
    vxStop();
    if (window.Android) { if (Android.speakRate) Android.speakRate(t, rate || 0.85); else Android.speak(t); }
    else webSpeak(t, rate);
  } catch (e) {}
}

const VX = { ok: false, map: new Map(), have: new Set(), job: null, cb: null, seq: 0, a: null, lru: new Map(), db: null };
const vxNative = () => !!(window.Android && Android.voiceList && Android.voiceGet && Android.voicePlay);
const vxUrl = f => (/^https?:/.test(location.protocol) ? new URL('../voice/', location.href).href : 'https://daneokiugi.pages.dev/voice/') + f;
const vxSt = () => S.vx || (S.vx = { idx: null, asked: {} });
function vxAdd(f, items) { VX.have.add(f); for (const t in items) VX.map.set(t, [f, items[t][0], items[t][1]]); }
function vxRebuild(list) { VX.map.clear(); VX.have.clear(); list.forEach(x => vxAdd(x.f, x.items)); }
const vxDb = () => VX.db || (VX.db = new Promise((res, rej) => { const r = indexedDB.open('dk-voice', 1);
  r.onupgradeneeded = () => { r.result.createObjectStore('head', { keyPath: 'f' }); r.result.createObjectStore('data'); };
  r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
const vxTx = (stores, mode, fn) => vxDb().then(db => new Promise((res, rej) => { const tx = db.transaction(stores, mode); let out; try { out = fn(tx); } catch (e) { return rej(e); }
  tx.oncomplete = () => res(out && 'result' in out ? out.result : undefined); tx.onerror = tx.onabort = () => rej(tx.error); }));
function vxList() {
  if (vxNative()) return Promise.resolve().then(() => JSON.parse(Android.voiceList() || '[]').map(f => { try { return { f, items: JSON.parse(Android.voiceHead(f)).items }; } catch (e) { return null; } }).filter(Boolean));
  return vxTx('head', 'readonly', tx => tx.objectStore('head').getAll());
}
function vxInit() {
  try { VX.ok = vxNative() || (!window.Android && !!window.indexedDB && !!window.fetch); } catch (e) { VX.ok = false; }
  if (!VX.ok) return;
  vxList().then(list => { vxRebuild(list || []); vxRefresh(); }).catch(() => { VX.ok = vxNative(); if (VX.ok) vxRefresh(); });
}
function vxGotIdx(idx) {
  if (!idx || !idx.books) return;
  const st = vxSt(), was = JSON.stringify(st.idx); st.idx = { sig: idx.sig, books: idx.books };
  const want = new Set(); Object.values(idx.books).forEach(b => b.parts.forEach(p => want.add(p[0])));
  [...VX.have].filter(f => !want.has(f)).forEach(f => { VX.have.delete(f); vxDel(f); });
  for (const [t, e] of VX.map) if (!VX.have.has(e[0])) VX.map.delete(t);
  if (JSON.stringify(st.idx) !== was) save();
  if (R && R.name === 'set' && !$('#ov')) render();
  vxAsk(true);
}
window.onVoiceIdx = s => { try { vxGotIdx(JSON.parse(s)); } catch (e) {} };
function vxRefresh() {
  if (!VX.ok) return;
  try { if (vxNative()) { if (Android.voiceIndex) Android.voiceIndex(); return; }
    fetch(vxUrl('index.json'), { cache: 'no-store' }).then(r => r.ok ? r.json() : null).then(vxGotIdx).catch(() => {}); } catch (e) {}
}
function vxBook(id) {
  const st = S && S.vx, b = st && st.idx && st.idx.books && st.idx.books[id]; if (!b || !b.parts || !b.parts.length) return null;
  const miss = b.parts.filter(p => !VX.have.has(p[0]));
  return { parts: b.parts, miss, need: miss.reduce((a, p) => a + p[1], 0), size: b.parts.reduce((a, p) => a + p[1], 0), done: !miss.length, some: miss.length < b.parts.length };
}
const vxMb = n => (n / 1048576).toFixed(n < 10485760 ? 1 : 0);
function vxDel(f) { try { VX.lru.delete(f); if (vxNative()) Android.voiceDel(f); else vxTx(['head', 'data'], 'readwrite', tx => { tx.objectStore('head').delete(f); tx.objectStore('data').delete(f); }).catch(() => {}); } catch (e) {} }
function vxBuf(f) {
  let p = VX.lru.get(f); if (p) { VX.lru.delete(f); VX.lru.set(f, p); return p; }
  p = vxTx('data', 'readonly', tx => tx.objectStore('data').get(f)).then(b => { if (!b) throw 0; return b; });
  VX.lru.set(f, p); if (VX.lru.size > 4) VX.lru.delete(VX.lru.keys().next().value);
  p.catch(() => VX.lru.delete(f)); return p;
}
function vxStop() { VX.seq++; try { if (VX.a) { VX.a.onended = VX.a.onerror = null; VX.a.pause(); VX.a = null; } if (vxNative() && Android.voiceStop) Android.voiceStop(); } catch (e) {} }
function vxPlay(t, rate) {
  if (!VX.ok || !S || S.cur < 0 || !O()) return false;
  const b = vxBook(O().book); if (!b || !b.done) return false;
  const e = VX.map.get(t); if (!e) return false;
  const r = clamp((rate || 0.85) / 0.85, 0.8, 1.2);
  if (window.SND) SND.duck(1.8);
  if (vxNative()) { VX.seq++; VX.last = [t, rate]; try { return !!Android.voicePlay(e[0], e[1], e[2], r); } catch (x) { return false; } }
  vxStop(); const my = VX.seq; try { if (window.speechSynthesis && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel(); } catch (x) {}
  vxBuf(e[0]).then(buf => { if (my !== VX.seq) return;
    const url = URL.createObjectURL(new Blob([buf.slice(e[1], e[1] + e[2])], { type: 'audio/mpeg' })), a = new Audio(url); VX.a = a;
    try { a.playbackRate = r; } catch (x) {}
    const end = () => { URL.revokeObjectURL(url); if (VX.a === a) VX.a = null; }; a.onended = end; a.onerror = end;
    const pr = a.play(); if (pr && pr.catch) pr.catch(() => { end(); if (my === VX.seq) webSpeak(t, rate); });
  }).catch(() => { if (my === VX.seq) webSpeak(t, rate); });
  return true;
}

function vxFetch(f, size, onProg) {
  if (vxNative()) return new Promise((res, rej) => { VX.cb = { f, onProg, res, rej }; try { Android.voiceGet(f); } catch (e) { VX.cb = null; rej(e); } });
  return fetch(vxUrl(f)).then(r => { if (!r.ok) throw 0;
    if (!r.body || !r.body.getReader) return r.arrayBuffer().then(b => new Uint8Array(b));
    const rd = r.body.getReader(), chunks = []; let got = 0;
    const pump = () => rd.read().then(x => { if (VX.job && VX.job.cancel) { try { rd.cancel(); } catch (e) {} throw 0; } if (x.done) { const u = new Uint8Array(got); let o = 0; chunks.forEach(c => { u.set(c, o); o += c.length; }); return u; }
      chunks.push(x.value); got += x.value.length; onProg(got); return pump(); });
    return pump(); })
    .then(u => { const n = new DataView(u.buffer, u.byteOffset, 4).getUint32(0, true), items = JSON.parse(new TextDecoder().decode(u.subarray(4, 4 + n))).items, data = u.slice(4 + n).buffer;
      return vxTx(['head', 'data'], 'readwrite', tx => { tx.objectStore('head').put({ f, items }); tx.objectStore('data').put(data, f); }).then(() => items); });
}
window.onVoiceFail = () => { const l = VX.last; VX.last = null; try { if (l) { if (Android.speakRate) Android.speakRate(l[0], l[1] || 0.85); else Android.speak(l[0]); } } catch (e) {} };
window.onVoiceProg = (f, got) => { const c = VX.cb; if (c && c.f === f) c.onProg(+got); };
window.onVoiceDone = (f, ok) => { const c = VX.cb; if (!c || c.f !== f) return; VX.cb = null; if (!ok) return c.rej(0); try { c.res(JSON.parse(Android.voiceHead(f)).items); } catch (e) { c.rej(e); } };
function vxProg() { const j = VX.job, bar = $('#vxbar'), tx = $('#vxtxt'); if (!j || !bar) return; const g = Math.min(j.total, j.got + (j.cur || 0)); bar.style.width = (g / j.total * 100).toFixed(1) + '%'; tx.textContent = `${vxMb(g)} / ${vxMb(j.total)}MB`; }
function vxGetBook(id) {
  const b = vxBook(id); if (!b || !b.miss.length || VX.job) return;
  const job = VX.job = { id, total: b.need, got: 0, cur: 0, cancel: false }, list = b.miss.slice();
  const fin = how => { VX.job = null; VX.cb = null; if ($('#vxbar')) closeModal(true);
    toast(how === 'ok' ? '다 받았어요! 이제 받은 음성 파일로 읽어 줘요' : how === 'stop' ? '받기를 멈췄어요. 받은 데까지는 저장해 뒀어요' : '받다가 끊겼어요. 받은 데까지는 저장해 뒀어요'); render(); };
  const step = () => { if (job.cancel) return fin('stop'); const p = list.shift(); if (!p) return fin('ok');
    vxFetch(p[0], p[1], n => { job.cur = n; vxProg(); }).then(items => { vxAdd(p[0], items); job.got += p[1]; job.cur = 0; vxProg(); step(); }).catch(() => fin(job.cancel ? 'stop' : 'err')); };
  modal(`<h1>음성 파일 받는 중</h1><div class="bar" style="height:16px;border-radius:8px;border:2px solid var(--ink)"><span id="vxbar" style="width:0;background:var(--main);transition:width .2s"></span></div><div class="tn" id="vxtxt" style="text-align:center;font-size:15px">0 / ${vxMb(job.total)}MB</div><div class="hint">다 받을 때까지 이 화면을 켜 두세요</div><button type="button" class="btn sec" data-a="vxStop">그만 받기</button>`, { sticky: true, mid: true, key: 'vxget' });
  step();
}
function vxAsk(auto) {
  if (!VX.ok || VX.job || !S || S.cur < 0 || !O()) return;
  const id = O().book, b = vxBook(id); if (!b || !b.miss.length) return;
  const st = vxSt(), key = b.parts.map(p => p[0]).join(','); st.asked = st.asked || {};
  if (auto && (st.asked[id] === key || $('#ov') || $('#tut') || !R || (R.name !== 'home' && R.name !== 'set'))) return;
  st.asked[id] = key; save();
  const bk = BOOKS.find(x => x.id === id);
  modal(`<h1>${b.some ? '추가 음성 파일 받기' : '음성 파일 받기'}</h1><div class="hint" style="font-size:15px;line-height:1.55">${b.some ? `'${bk.name}' 단어장에 새로 생긴 낱말·예문의<br>음성 파일을 더 받아요` : `'${bk.name}' 단어장의 낱말과 예문을<br>또렷한 목소리로 읽어 주는 음성 파일이에요.<br>한 번 받아 두면 인터넷 없이도 돼요`}<br><b class="d" style="color:var(--ink)">약 ${vxMb(b.need)}MB</b> · 와이파이에서 받는 걸 권해요</div><div class="hint" style="font-size:14px;line-height:1.5">받지 않기를 누르면<br>내 기기의 내장 음성 목소리가 읽어줘요</div><button type="button" class="btn" data-a="vxGo">받기</button><button type="button" class="btn sec" data-a="vxLater">받지 않기</button>`, { mid: true, key: 'vxask' });
}
function vxCard() {
  if (!VX.ok) return '';
  const o = O(), b = vxBook(o.book), bk = BOOKS.find(x => x.id === o.book); let body;
  if (!b) body = `<div class="hint">인터넷에 연결되어 있으면 받을 수 있어요</div><button type="button" class="btn sec sm" data-a="vxCheck">다시 확인하기</button>`;
  else if (b.done) body = `<div class="row" style="gap:8px"><span class="sp" style="font-size:15.5px">이 단어장은 받아 둔 음성 파일로 읽어요</span><button type="button" class="btn sec sm" style="width:auto;padding:0 14px 3px" data-a="vxDelAsk">지우기</button></div><div class="hint">${vxMb(b.size)}MB를 기기에 저장해 뒀어요</div>`;
  else body = `<button type="button" class="btn sec sm" data-a="vxAsk">${b.some ? '추가 음성 파일 받기' : `'${bk.name}' 음성 파일 받기`} (약 ${vxMb(b.need)}MB)</button><div class="hint">받아 두면 낱말과 예문을 또렷한 목소리로 읽어 줘요<br>인터넷 없이도 되고, 단어장마다 따로 받아요<br>받지 않으면 내 기기의 내장 음성 목소리가 읽어줘요</div>`;
  return `<div class="card"><h2>음성 파일</h2>${body}</div>`;
}
ACT.vxGo = () => { closeModal(true); vxGetBook(O().book); };
ACT.vxLater = () => { closeModal(); toast('내장 음성 목소리로 읽어요 · 설정의 음성 파일에서 언제든 받을 수 있어요'); };
ACT.vxAsk = () => vxAsk(false);
ACT.vxCheck = () => { vxRefresh(); toast('확인하고 있어요'); };
ACT.vxStop = () => { if (VX.job) VX.job.cancel = true; try { if (vxNative() && Android.voiceCancel) Android.voiceCancel(); } catch (e) {} };
ACT.vxDelAsk = () => modal(`<h1>음성 파일 지우기</h1><div class="hint" style="font-size:15px">이 단어장의 음성 파일을 기기에서 지워요.<br>지우면 내 기기의 내장 음성 목소리가 읽어 주고,<br>언제든 다시 받을 수 있어요</div><button type="button" class="btn sec" data-a="vxDelGo">지우기</button><button type="button" class="btn" data-a="close">그대로 두기</button>`, { mid: true });
ACT.vxDelGo = () => { const b = vxBook(O().book); if (b) b.parts.forEach(p => { VX.have.delete(p[0]); vxDel(p[0]); }); for (const [t, e] of VX.map) if (!VX.have.has(e[0])) VX.map.delete(t); vxStop(); closeModal(true); render(); toast('지웠어요'); };

let _utt = null, _noTts = 0;
const enVoice = () => { try { const vs = speechSynthesis.getVoices() || []; return vs.find(v => /^en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null; } catch (e) { return null; } };
function webSpeak(t, rate) {
  if (window.SND) SND.duck(1.8);
  const ss = window.speechSynthesis;
  if (!ss || !window.SpeechSynthesisUtterance) { if (!_noTts++) toast('이 화면에서는 소리를 못 내요. 크롬이나 사파리로 열어 주세요'); return; }
  const u = new SpeechSynthesisUtterance(t), v = enVoice(); u.lang = 'en-US'; if (v) u.voice = v; u.rate = rate || 0.85; _utt = u;
  const say = () => { try { if (ss.paused) ss.resume(); ss.speak(u); } catch (e) {} };
  if (ss.speaking || ss.pending) { ss.cancel(); setTimeout(() => { if (_utt === u) say(); }, 70); } else say();
}
try { if (window.speechSynthesis) speechSynthesis.getVoices(); } catch (e) {}
const RATE = { slow: 0.7, mid: 0.85, fast: 1.0 };
function addStars(n) { const o = O(); o.stars += n; o.total = (o.total || 0) + n; if (n > 0 && window.SND) SND.fx('star'); }
function pay(n) { const o = O(); if (o.inf) return true; if (o.stars < n) { toast('별이 모자라요. 단어를 공부하면 별을 받아요'); return false; } o.stars -= n; return true; }
