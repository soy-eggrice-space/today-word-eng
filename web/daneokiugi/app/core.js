'use strict';
// 단어키우기 · 공통 도구 (저장, 화면 이동, 그림, 작은 부품)
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

// ---------- 저장 ----------
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
function newVil() { return { objs: [], nid: 1, eggs: 0, merges: 0, rareAt: 25 + rnd(11), mysAt: 125 + rnd(51), found: {}, claimed: {}, seen: {}, bag: {}, gift: '', map2: 1, map3: 1, sc1: 1, res: { wood: 0, stone: 0 }, gatherAt: Date.now(), cards: {}, chal: { k: '', n: 0 }, trophy: -1, bestScore: 0 }; }
// 예전 버전에서 저장한 기록에 새 칸을 채워요
function ens(o) {
  if (!o) return o;
  o.title = o.title || ''; o.titles = o.titles || {}; o.stat = o.stat || {}; o.towns = o.towns || [];
  const v = o.vil; v.res = v.res || { wood: 0, stone: 0 }; v.gatherAt = v.gatherAt || Date.now(); v.cards = v.cards || {}; v.chal = v.chal || { k: '', n: 0 };
  if (v.trophy == null) v.trophy = -1; v.bestScore = v.bestScore || 0;
  if (!v.sc1) { v.sc1 = 1; const T = DT.themes[o.theme], cat = k => (T.homes.concat(T.rides).some(x => x.k === k)); v.objs.forEach(x => { if (x.t === 'i' && /^(L\d_|st\d)/.test(x.k) && !T.lines[x.k]) v.seen['g:' + x.k] = 1; if (x.t === 'f' && x.seat && cat(x.seat)) v.seen['h:' + x.seat] = 1; }); Object.keys(v.bag || {}).forEach(k => { if (cat(k)) v.seen['h:' + k] = 1; }); }   // 마을 완성도에 쓰는 기록
  if (!v.map2) { v.objs.forEach(x => { x.x = Math.round(x.x / 2); x.y = Math.round(x.y / 2); }); v.map2 = 1; }   // 마을 넓이를 4분의 1로 줄였어요
  if (!v.map3) { v.objs.forEach(x => { if (x.t === 'f') delete x.nd; }); v.map3 = 1; }   // 돌계단 둔덕 지도로 바꿨어요: 친구를 새 길 위로
  return o;
}
const ST = () => { const o = O(); return o.stat || (o.stat = {}); };
const bump = (k, n) => { const s = ST(); s[k] = (s[k] || 0) + (n || 1); };
// 긴 단어와 긴 뜻이 칸을 넘지 않게 글자 크기를 길이에 맞춰요 (room: 좁은 화면에서 글자가 쓸 수 있는 너비)
const fitEn = (s, base, room) => Math.max(11, Math.min(base, Math.floor(room / (.6 * s.length))));
// 표현(여러 단어짜리)은 두 줄로 넘어가도 되니 그만큼 크게, 조각 맞추기에서는 단어 단위로 나눠요
const isPhrase = s => /\s/.test(s);
const fitEnAny = (s, base, room) => { if (!isPhrase(s)) return fitEn(s, base, room);
  const t = s.split(/\s+/); let best = s.length;   // 두 줄로 가장 고르게 나눴을 때 긴 줄의 글자 수에 맞춰요
  for (let i = 1; i < t.length; i++) best = Math.min(best, Math.max(t.slice(0, i).join(' ').length, t.slice(i).join(' ').length));
  return Math.max(12, Math.min(base, Math.floor(room / (.62 * best)))); };
const qTok = w => w[0].split(/\s+/).map(t => { t = t.toLowerCase().replace(/^[^a-z0-9']+|[^a-z0-9']+$/g, ''); return t === 'i' ? 'I' : t.indexOf("i'") === 0 ? 'I' + t.slice(1) : t; }).filter(Boolean);
const fitKo = (s, base) => s.length > 12 ? Math.min(base, 15) : s.length > 9 ? Math.min(base, 17) : base;
function defTypes(book) { return book === 'starter' ? { t1: 1, t2: 1, t3: 0, t4: 0, t5: 0 } : { t1: 1, t2: 1, t3: 1, t4: 0, t5: 1 }; }
function newOwner(d) {
  return { name: d.name, stick: d.stick || '', theme: d.theme, book: d.book, used: [d.book], towns: [], per: d.per || 20, mode: d.mode || 'card', types: defTypes(d.book), auto: true, exRead: true, speed: 'slow',
    stars: 0, total: 0, eggBox: 1, itemBox: 1, title: '', titles: {}, stat: {}, w: {}, wr: {}, day: { k: '', q: 0, ok: 0, words: 0, ms: 0, wrong: [] }, streak: 0, best: 0, last: '', hist: {}, vil: newVil() };
}
const histToday = () => { const o = O(), k = today(); return o.hist[k] || (o.hist[k] = { q: 0, ok: 0, st: 0, ms: 0 }); };   // 오늘 기록 칸 (공부를 안 한 날에도 마을 일은 적어 둬요)
function dayOf(o) { const k = today(); if (o.day.k !== k) o.day = { k, q: 0, ok: 0, words: 0, ms: 0, wrong: [] }; return o.day; }

// ---------- 그림 ----------
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

// ---------- 색 ----------
function applyTheme(th) {
  const t = DT.themes[th || 'dino'], c = t.col, st = document.documentElement.style;
  for (const k of ['main', 'mainMid', 'mainLt', 'mainPale', 'bg', 'track', 'field', 'y', 'p', 'pD', 'c']) st.setProperty('--' + k, c[k]);
  c.acc.forEach((v, i) => st.setProperty('--a' + i, v)); c.tint.forEach((v, i) => st.setProperty('--t' + i, v));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72"><path d="${t.motif[0]}" fill="${c.dot}" transform="translate(10 12) scale(.85)"/><path d="${t.motif[1]}" fill="${c.dot}" transform="translate(46 48) scale(.85)"/></svg>`;
  $('#app').style.backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

// ---------- 화면 이동 ----------
const SCR = {}, ACT = {};
const R = { name: '', p: {}, stack: [] };
// 같은 화면을 다시 그릴 때는 보던 자리를 지켜요 (설정에서 단추를 눌러도 맨 위로 안 올라가요)
let _scrOf = '';
function render() {
  const s = SCR[R.name], same = _scrOf === R.name, old = $('.scr'), keep = old && same ? old.scrollTop : 0, inner = {};
  if (same) document.querySelectorAll('#app [data-sc]').forEach(e => { inner[e.dataset.sc] = [e.scrollTop, e.scrollLeft]; });   // 화면 안에서 따로 밀리는 목록(data-sc)도 보던 자리 그대로
  $('#app').classList.toggle('wide', R.name === 'vil');   // 마을은 태블릿처럼 넓은 화면에서 옆으로 길게
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
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const f = ACT[el.dataset.a];
  if (f) f(el.dataset, el, e);
});
ACT.back = () => { window.appBack(); };
ACT.go = d => go(d.s);
ACT.tab = d => { const m = { home: 'home', vil: 'vil', chal: 'chal', wrong: 'wrong', rec: 'rec' }; go(m[d.t], {}, { reset: true }); if (d.t !== 'home') R.stack = [['home', {}]]; };

// ---------- 작은 부품 ----------
function tabbar(on) {
  const items = [['home', '홈', IC.home, '--main', '--mainLt'], ['vil', '마을', IC.vil, '--a0', '--t0'], ['chal'], ['wrong', '오답노트', IC.note, '--a3', '--t3'], ['rec', '기록', IC.chart, '--a2', '--t2']];
  const mid = () => { const left = chalLeft(); return `<button type="button" class="mid${on === 'chal' ? ' on' : ''}" data-a="tab" data-t="chal" aria-label="도전"><span class="midb" style="${(left && chalOpen()) || on === 'chal' ? '' : 'filter:saturate(.45)'}">${stk(ENEMY[O().theme][0], 44)}${!chalOpen() ? `<i class="lk">${ico(IC.lock, 14, 2.6)}</i>` : left ? `<i class="tn">${O().inf ? '∞' : left}</i>` : ''}</span><span class="d">도전!</span></button>`; };   // 가운데 단독 메뉴
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
  const key = opt.key || (/<h1[^>]*>(.*?)<\/h1>/.exec(html) || [])[1] || '', again = key && _lastM && _lastM.key === key && Date.now() - _lastM.at < 1500;   // 같은 창을 곧바로 다시 띄울 때는 보던 자리 그대로, 깜박임 없이
  const d = document.createElement('div'); d.className = 'ov' + (opt.mid ? ' mid' : '') + (again ? ' still' : ''); d.id = 'ov'; d.dataset.key = key;
  d.innerHTML = `<div class="sheet">${html}</div>`;
  if (!opt.sticky) d.addEventListener('click', e => { if (e.target === d) closeModal(); });
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
    if (window.Android) { if (Android.speakRate) Android.speakRate(t, rate || 0.85); else Android.speak(t); }
    else if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(t); u.lang = 'en-US'; u.rate = rate || 0.85; speechSynthesis.cancel(); speechSynthesis.speak(u); }
  } catch (e) {}
}
const RATE = { slow: 0.7, mid: 0.85, fast: 1.0 };
function addStars(n) { const o = O(); o.stars += n; o.total = (o.total || 0) + n; }
function pay(n) { const o = O(); if (o.inf) return true; if (o.stars < n) { toast('별이 모자라요. 단어를 공부하면 별을 받아요'); return false; } o.stars -= n; return true; }
