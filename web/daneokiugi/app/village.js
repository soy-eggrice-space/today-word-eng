'use strict';
// 단어키우기 · 마을 (돌아다니는 친구, 바닥에 자리 잡는 물건, 상자, 합치기, 조합, 도감, 컬렉션, 상점, 가방)
const WW = GW, WH = GH, MAXF = 12, MAXI = 36;   // 마을은 가로 960 × 세로 660 · 친구 자리 12, 물건 자리 36 (구역마다 다섯에서 일곱 개)
const FSZ = [0, 50, 58, 66, 74, 82], ISZ = 50;
const V = { mode: 'main', sel: [], cam: null, z: 1, timer: null, rt: {}, drag: null, bagTab: 'all', shopTab: 'box' };
const vil = () => O().vil;
const getObj = id => vil().objs.find(o => o.id === +id);
const CAT = {};
function buildCat() {
  for (const x of DT.shop.acc) CAT[x.k] = 'acc';
  for (const x of DT.shop.food) CAT[x.k] = 'food';
  for (const t of Object.values(DT.themes)) { for (const x of t.homes) CAT[x.k] = CAT[x.k] || 'home'; for (const x of t.rides) CAT[x.k] = CAT[x.k] || 'ride'; }
}
const bagCat = k => CAT[k] || 'home';
function bagAdd(k, n) { const v = vil(), b = v.bag; b[k] = (b[k] || 0) + (n || 1); if (b[k] <= 0) delete b[k]; else if (CAT[k] === 'home' || CAT[k] === 'ride') v.seen['h:' + k] = 1; }

// ---------- 친구 그림 ----------
function frName(f) { return f.nm || frSpec(f); }
function frSpec(f) {
  if (f.m) return DT.myn[f.k];
  if (f.hold) { const r = TH().rare.find(r => r.k === f.k && r.hold === f.hold); if (r) return (f.st > 1 ? f.st + '성 ' : '') + r.name; }
  return DT.frn[f.k] || f.k;
}
const star5 = sz => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 2.9 : 6.2; d += (i ? 'L' : 'M') + f1(7 + Math.cos(a) * q) + ' ' + f1(7.5 + Math.sin(a) * q); } return `<svg width="${sz}" height="${sz}" viewBox="0 0 14 14" aria-hidden="true"><path d="${d}Z" fill="#FFD95A" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/></svg>`; };
function frInner(f, size, still) {
  const lv = f.lv || 1;
  let over = '';
  if (f.hold) over += `<span style="position:absolute;left:${size * .6}px;top:${size * .5}px">${stk(f.hold, Math.round(size * .5))}</span>`;
  if (f.st > 1) over += `<span class="stars" style="top:${Math.round(-size * .36)}px">${star5(Math.max(10, Math.round(size * .24))).repeat(f.st)}</span>`;   // 희귀 친구는 합친 만큼 별이 붙어요
  if (lv >= 3 || f.m) over += spark(size * .3, -size * .12, size * .05, 'twk') + spark(size * .22, size * .9, size * .34, 'twk');
  if (lv >= 4) over += `<span style="position:absolute;left:${size * .3}px;top:${-size * .26}px">${stk('s_crown', Math.round(size * .4))}</span>`;
  if (lv === 5 || f.m) over += spark(size * .26, size * .86, -size * .1, 'twk') + spark(size * .2, -size * .14, size * .6, 'twk');
  if (f.acc) over += `<span style="position:absolute;left:${size * .58}px;top:${-size * .1}px;transform:rotate(14deg)">${pic(f.acc, Math.round(size * .42))}</span>`;
  const cls = (lv === 2 && !still ? 'hop ' : '') + (lv === 5 || f.m ? 'glow' : '');
  let h = `<span class="${cls}" style="position:relative;display:block;width:${size}px;height:${size}px">${stk(f.k, size, '', lv >= 2 || f.m)}${over}</span>`;
  if (f.seat) {
    const s2 = Math.round(size * 1.3), fs = size * .7, sc = fs / size;
    h = `<span style="position:relative;display:block;width:${s2}px;height:${s2}px">${pic(f.seat, s2)}<span style="position:absolute;left:${(s2 - size) / 2}px;top:${s2 * .1 - size * (1 - sc) / 2}px;transform:scale(${sc})">${h}</span><span style="position:absolute;left:0;top:0;clip-path:inset(58% 0 0 0)">${pic(f.seat, s2)}</span></span>`;
  }
  return h;
}
// ---------- 물건 크기: 그림의 실제 크기를 재서, 종류에 맞는 크기로 맞춰요 ----------
const _ibox = {};
function itemBox(k) {
  if (_ibox[k]) return _ibox[k];
  let b = { x: 10, y: 10, width: 100, height: 100 };
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 120 120'); svg.style.cssText = 'position:absolute;left:-999px;top:0;width:120px;height:120px;visibility:hidden';
    svg.innerHTML = k[0] === '@' ? DT.art[k.slice(1)] : `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${DT.item[k] || ''}</g>`;
    document.body.appendChild(svg); const r = svg.getBBox(); svg.remove(); if (r.width > 4 && r.height > 4) b = r;
  } catch (e) {}
  return _ibox[k] = { x: b.x - 3, y: b.y - 3, w: b.width + 6, h: b.height + 6 };
}
const XL_NAMES = ['화산', '풍차', '관람차', '성', '헛간', '회전목마', '바람 발전기', '숲', '공룡 우주선', '물레방아', '나무 집', '캠핑장', '돌탑', '트랙터', '무지개 다리', '구름 성', '시간 여행 문', '풍선 탄 헛간', '풍선 탄 돌집', '로켓 트랙터', '왕관 쓴 돌탑', '웃는 화산', '무대'];
const L_RE = /집|움막|텐트|동굴|우물|다리|분수|연못|미끄럼틀|그네|시소|닭장|새집|나무$|나무 |마차|침대|식탁|수레|벌통|전시대|문$|모래밭|밭$|꽃길|울타리|허수아비|벤치|돗자리|더미|태양판|로봇|왕좌|우체통|아치|소파|모닥불|둥지|배$|길$/;
const S_RE = /진주|목걸이|열쇠|편지|안경|왕관$|잼|치즈|빵|우유|주스|쿠키|도넛|컵케이크|찻잔|구두|별 돌|달걀|당근|새싹|폭죽|거울|파이|샌드위치|샐러드|고기|구이|단추/;
// 물건이 마을에서 차지하는 크기(가장 긴 쪽, px): 재료 40 · 묶음 46 · 바구니 52 · 황금 56 · 소품 44 · 보통 58 · 큰 것 72 · 아주 큰 것 88
function itemTier(k) {
  const t = TH(); if (t.base.includes(k)) return 40;
  let m = /^L(\d)_/.exec(k); if (m) return [0, 0, 46, 52, 56][+m[1]] || 52;
  m = /^st(\d)$/.exec(k); if (m) return [0, 40, 48, 64, 74, 86][+m[1]];
  const n = nameOf(k); if (XL_NAMES.includes(n)) return 88; if (L_RE.test(n)) return 72; if (S_RE.test(n)) return 44; return 58;
}
function itemDim(k) { const b = itemBox(k), s = itemTier(k) / Math.max(b.w, b.h); return { w: Math.round(b.w * s), h: Math.round(b.h * s), b }; }
function itemPic(k, cls) { const d = itemDim(k), b = d.b; return `<svg class="stk ${cls || ''}" viewBox="${f1(b.x)} ${f1(b.y)} ${f1(b.w)} ${f1(b.h)}" width="${d.w}" height="${d.h}" aria-hidden="true">${k[0] === '@' ? DT.art[k.slice(1)] : `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${DT.item[k] || ''}</g>`}</svg>`; }
// 집에 있으면 쉬는 표시(쿨쿨), 탈것을 타면 신나는 표시(음표)
const NOTE = sz => `<svg width="${sz}" height="${sz}" viewBox="0 0 14 14" aria-hidden="true"><path d="M5.2 10.6V3.2l6-1.4v7" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="3.6" cy="10.8" rx="2" ry="1.6" fill="${INK}"/><ellipse cx="9.6" cy="9" rx="2" ry="1.6" fill="${INK}"/></svg>`;
const seatMark = (o, h) => CAT[o.seat] === 'home' ? `<span class="zz" style="top:${-h - 4}px"><b>z</b><b>z</b><b>Z</b></span>` : CAT[o.seat] === 'ride' ? `<span class="joy" style="top:${-h - 2}px"><i>${NOTE(15)}</i><i>${NOTE(12)}</i><i>${star5(12)}</i></span>` : '';
function objSize(o) { return o.t === 'f' ? Math.round((o.m ? 70 : FSZ[o.lv || 1]) * (o.seat ? 1.3 : 1)) : itemTier(o.k); }
function objHTML(o, still) {
  const sel = V.sel.indexOf(o.id), isF = o.t === 'f', d = isF ? null : itemDim(o.k), w = isF ? objSize(o) : d.w, h = isF ? w : d.h;
  const inner = isF ? `<span class="flip"><span class="bob" style="display:block">${frInner(o, o.m ? 70 : FSZ[o.lv || 1], still)}</span></span>` : itemPic(o.k);
  let dim = false, can = false;
  if (V.mode === 'merge' && sel < 0) {
    const a = V.sel.length && getObj(V.sel[0]);
    if (a) { dim = a.t === 'f' ? !(isF && (a.hold ? o.hold === a.hold && o.k === a.k && (o.st || 1) === (a.st || 1) : !o.m && !o.hold && o.lv === a.lv)) : o.k !== a.k; can = !dim && V.sel.length < 3 && (a.t === 'f' ? (a.hold ? (a.st || 1) < 5 : a.lv < 5 && !a.m) : !!TH().lines[a.k]); }
    else dim = (V.mk === 'i' ? isF : V.mk === 'f' ? !isF : false) || (isF ? !!(o.m || (o.hold ? (o.st || 1) >= 5 : o.lv >= 5)) : !TH().lines[o.k]);
  } else if (V.mode === 'mix' && sel < 0) dim = !isF ? false : true;
  return `<div class="obj ${isF ? 'fr' : 'it'}${sel >= 0 ? ' sel' : ''}${dim ? ' dim' : ''}${o.fo && sel < 0 ? ' fol' : ''}${can ? ' can' : ''}" data-id="${o.id}" style="transform:translate(${o.x}px,${o.y}px);z-index:${Math.round(o.y)}">${isF ? '' : `<span class="ish" style="left:${-Math.round(w * .44)}px;width:${Math.round(w * .88)}px"></span>`}<span class="in" style="left:${-w / 2}px;top:${-h}px;width:${w}px;height:${h}px">${sel >= 0 ? `<span class="ring"></span><span class="numb">${sel + 1}</span>` : ''}${inner}</span>${isF ? `<span class="ntag">${o.ts ? `<i>${esc(o.ts)}</i> ` : ''}${esc(frName(o))}</span>${still && !o.seat ? '' : seatMark(o, h)}` : ''}</div>`;
}

// ---------- 구역: 마을 바닥을 여섯 구역으로 나누고, 물건은 어울리는 구역에 모여서 놓여요 ----------
const ZONES = {
  dino: { z: [
    { n: '돌밭', base: ['st1', 'crystal'], sets: ['돌 건축', '반짝 보물'] },
    { n: '숲', base: ['pl1', 'leaf', 'berry'], sets: ['숲 가꾸기'] },
    { n: '캠핑 터', base: ['fi1'], sets: ['모닥불 캠핑', '맛있는 저녁'] },
    { n: '발굴 터', base: ['bone', 'fossil', 'foot'], sets: ['화석 발굴단', '공룡 탐험대'] },
    { n: '물가', base: ['clam'], sets: ['물가 마을'] },
    { n: '놀이터', base: [], sets: ['공룡 놀이터', '미래 공룡 마을'], hid: 1 }] },
  chara: { z: [
    { n: '간식 가게', base: ['candy', 'floss'], sets: ['달콤 간식 가게', '티 파티'] },
    { n: '별빛 언덕', base: ['sparkle'], sets: ['반짝 밤하늘', '공주님 성'] },
    { n: '꽃 정원', base: ['@s_flower', 'rainbow'], sets: ['무지개 정원'] },
    { n: '옷장 거리', base: ['@s_ribbon', 'button', 'bead'], sets: ['리본 옷장', '포근한 방'] },
    { n: '음악 광장', base: ['@s_note'], sets: ['음악회', '놀이공원'] },
    { n: '하트 우체국', base: ['@s_heart'], sets: ['하트 우체국'], hid: 1 }] },
  animal: { z: [
    { n: '텃밭', base: ['seed', 'wheat'], sets: ['작은 텃밭', '농장 일꾼'] },
    { n: '농장 마당', base: ['hay', 'egg2'], sets: ['농장 집들', '겨울 준비'] },
    { n: '숲', base: ['log', 'acorn', 'mush'], sets: ['나무 놀이터'] },
    { n: '꽃 언덕', base: ['daisy', 'feather'], sets: ['들꽃 정원', '바람 언덕'] },
    { n: '시냇가', base: ['drop'], sets: ['시냇가'] },
    { n: '소풍 터', base: [], sets: ['숲속 소풍', '아침 식탁'], hid: 1 }] } };
let _zmap = null, _zth = null;
function zoneOf(k) {
  const th = O().theme;
  if (_zth !== th) {
    _zth = th; _zmap = {}; const t = TH(), Z = ZONES[th].z;
    Z.forEach((z, i) => { z.base.forEach(b => { _zmap[b] = i; }); t.sets.forEach(s => { if (z.sets.includes(s.name)) s.recs.forEach(r => { if (_zmap[r.out] == null) _zmap[r.out] = i; }); }); if (z.hid) t.hidden.forEach(s => s.recs.forEach(r => { _zmap[r.out] = i; })); });
    for (const b of t.base) { let k2 = b; while (t.lines[k2]) { k2 = t.lines[k2]; if (_zmap[k2] == null || /^(L\d_|st\d)/.test(k2)) _zmap[k2] = _zmap[b]; } }   // 묶음, 바구니, 황금은 원래 물건과 같은 구역
  }
  return _zmap[k] != null ? _zmap[k] : 5;
}
// 구역마다 뒷줄(큰 물건)과 앞줄(작은 물건). 큰 것은 뒤에 세우고 작은 것은 앞에 놓아서 크기 차이가 자연스럽게 보여요. 넘치면 살짝 겹쳐요
const ZROWS = GZ;
function layoutItems() {
  const items = vil().objs.filter(o => o.t === 'i'), by = ZROWS.map(() => []);
  const byKey = (a, b) => (a.k < b.k ? -1 : a.k > b.k ? 1 : a.id - b.id);
  items.slice().sort(byKey).forEach(o => by[zoneOf(o.k)].push(o));
  // 구역마다 놓을 수 있는 개수(cap)까지. 넘치면 자리가 남은 가장 가까운 구역으로
  by.forEach((L, zi) => { while (L.length > ZROWS[zi].cap) { const o = L.pop(), z = ZROWS.map((r, i) => i).filter(i => by[i].length < ZROWS[i].cap).sort((a, b) => Math.hypot(ZROWS[a].cx - ZROWS[zi].cx, ZROWS[a].yb - ZROWS[zi].yb) - Math.hypot(ZROWS[b].cx - ZROWS[zi].cx, ZROWS[b].yb - ZROWS[zi].yb))[0]; if (z == null) { L.push(o); break; } by[z].push(o); } });
  by.forEach((L, zi) => {
    const R = ZROWS[zi], W = o => itemDim(o.k).w, big = L.slice().sort((a, b) => itemTier(b.k) - itemTier(a.k));
    let back = [], bw = 0;
    for (const o of big) { if (back.length < 3 && itemTier(o.k) >= 64 && (bw + W(o) <= R.w || !back.length)) { back.push(o); bw += W(o) + 4; } }   // 큰 물건은 뒷줄
    let front = L.filter(o => !back.includes(o)); const fw = () => front.reduce((a, o) => a + W(o) + 4, 0);
    while (fw() > R.w && back.length < 4 && front.length > 2) { const o = front.slice().sort((a, b) => itemTier(b.k) - itemTier(a.k) || a.id - b.id)[0]; front = front.filter(x => x !== o); back.push(o); }   // 앞줄이 넘치면 큰 것부터 뒷줄로
    const row = (arr, cx, rw, y) => { arr.sort(byKey); const sum = arr.reduce((a, o) => a + W(o), 0), n = arr.length, gap = n > 1 ? Math.min(10, (rw - sum) / (n - 1)) : 0; let x = cx - (sum + gap * (n - 1)) / 2; arr.forEach((o, i) => { const w = W(o); o.x = Math.round(x + w / 2); o.y = y + ((o.id * 7 + i * 3) % 5) - 2; x += w + gap; }); };
    row(back, R.cx + 8, R.w - 16, R.yb); row(front, R.cx - 4, R.w, R.yf);
  });
}
// ---------- 친구가 다니는 길: 정해진 길목을 따라서만 걸어요 (층 사이는 계단으로만) ----------
const navBusy = () => { const c = {}; vil().objs.forEach(o => { if (o.t === 'f' && o.nd != null) c[o.nd] = (c[o.nd] || 0) + 1; }); return c; };
const navPos = (i, id) => ({ x: NAV.n[i][0] + ((id * 13) % 15) - 7, y: NAV.n[i][1] + ((id * 7) % 7) - 3 });
const navStops = ride => NAV.n.map((p, i) => i).filter(i => !NAV.pass[i] && !!NAV.ride[i] === !!ride);   // 걷는 친구는 마을 길, 탈것을 탄 친구는 탈것 길
// 같은 친구(종류와 단계가 같은 친구)는 무리 지어 같이 다녀요. 무리의 첫 친구가 앞장서고, 나머지는 그 옆에 붙어요
const herdKey = o => CAT[o.seat] === 'home' ? 'x' + o.id : (o.m ? 'm' : o.hold ? 'h' + (o.st || 1) + o.hold : 'p' + (o.lv || 1)) + ':' + o.k + (o.seat ? ':r' : '');
function herds() { const m = {}; vil().objs.forEach(o => { if (o.t === 'f') { const k = herdKey(o); (m[k] = m[k] || []).push(o); } }); return Object.values(m); }
const HERD = [[0, 0], [-27, -8], [26, -6], [-11, -18], [15, -19], [-44, 2], [43, 3], [-30, -25], [34, -26]];
const herdPos = (lead, j, o) => { const k = objSize(o) / 58, h = HERD[j % HERD.length]; return { x: Math.round(lead.x + h[0] * k), y: Math.round(lead.y + h[1] * k) }; };
function navFix() {   // 길 위에 서 있지 않은 친구는 가까운(비어 있는) 길목으로, 무리는 앞장선 친구 옆으로
  const busy = navBusy(); let lot = 0;
  herds().forEach(g => {
    const a = g[0], ride = CAT[a.seat] === 'ride', stops = navStops(ride);
    if (CAT[a.seat] === 'home') { const L = GLOTS[lot % GLOTS.length]; a.nd = null; a.x = gx(L[0]); a.y = gy(L[1]) + (lot >= GLOTS.length ? 12 : 0); delete a.fo; lot++; return; }   // 집에 들어간 친구는 보금자리 줄의 집터에
    if (a.nd == null || !NAV.n[a.nd] || NAV.pass[a.nd] && !V.rt[a.id] || !!NAV.ride[a.nd] !== ride) {
      const d = i => Math.hypot(NAV.n[i][0] - (a.x || PLAZA.x), NAV.n[i][1] - (a.y || PLAZA.y));
      a.nd = stops.slice().sort((p, q) => (busy[p] || 0) - (busy[q] || 0) || (ride ? Math.random() - .5 : d(p) - d(q)))[0]; busy[a.nd] = (busy[a.nd] || 0) + g.length; Object.assign(a, navPos(a.nd, a.id));
    }
    g.forEach((o, j) => { if (j) { o.nd = a.nd; o.fo = 1; Object.assign(o, herdPos(a, j, o)); } else delete o.fo; });   // 이름표는 앞장선 친구만
  });
}
const groundSVG = () => GROUND[O().theme]() + gsigns(ZONES[O().theme].z.map(z => z.n));
// 아직 안 연 상자는 마을 한가운데 꼭대기에 쌓아 둬요. 누르면 열려요
function pileHTML() {
  const o = O(), P = [[0, 0], [30, 2], [15, -22], [-28, 3], [44, -20], [8, -44]];
  const pile = (kind, n, x, y) => n ? `<div class="obj pile" data-k="${kind}" role="button" aria-label="${kind === 'egg' ? '알 상자' : '물건 상자'} ${n}개 열기" style="transform:translate(${x}px,${y}px);z-index:${y + 4}">${P.slice(0, Math.min(n, 6)).map(([a, b], i) => `<span style="position:absolute;left:${a - 21}px;top:${b - 40}px;z-index:${10 - Math.abs(b)}">${itm(kind === 'egg' ? 'eggbox' : 'itembox', 42)}</span>`).join('')}<span class="pcnt d tn">×${o.inf ? '∞' : n}</span></div>` : '';
  return pile('egg', o.eggBox, gx(284), gy(100)) + pile('item', o.itemBox, gx(372), gy(108));
}
// ---------- 자리 수 ----------
const isPlain = o => o.t === 'f' && !o.m && !o.hold && (o.lv || 1) < 5;   // 전설·희귀·미스터리 친구는 자리를 차지하지 않아요
const cntF = () => vil().objs.filter(isPlain).length, cntI = () => vil().objs.filter(o => o.t === 'i').length;
const roomOf = kind => Math.floor(((kind === 'egg' ? MAXF - cntF() : MAXI - cntI())) / 3);
const mergeable = () => { const g = mergeGroups(); return g.F.length + g.I.length; };
function itemSheet(ob) {
  const t = TH(), same = vil().objs.filter(o => o.t === 'i' && o.k === ob.k).length, next = t.lines[ob.k];
  const uses = allRecs().filter(r => !r.same && !r.hid && r.in.includes(ob.k)).length;
  modal(`<div class="row" style="gap:14px"><div style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;flex:none;border-radius:22px;background:var(--field);border:2px solid var(--ink)">${pic(ob.k, 72)}</div>
<div style="display:flex;flex-direction:column;gap:3px;min-width:0"><span class="d" style="font-size:22px;line-height:1.2">${nameOf(ob.k)}</span><span class="sub">마을에 ${same}개 있어요</span>${next ? `<span class="row" style="gap:4px;font-size:13.5px">셋을 합치면 ${pic(next, 26, 'pl')}<b style="font-weight:400" class="d">${nameOf(next)}</b></span>` : ''}${uses ? `<span style="font-size:13px;color:var(--sub)">조합 ${uses}가지에 들어가요</span>` : ''}</div></div>
<div class="row" style="gap:8px">${next && same >= 3 ? `<button type="button" class="btn sm f1" data-a="itMerge">합치기</button>` : ''}${uses ? `<button type="button" class="btn ${next && same >= 3 ? 'sec ' : ''}sm f1" data-a="itMix" data-id="${ob.id}">조합 칸에 올리기</button>` : ''}</div>
<button type="button" class="btn sec sm" style="font-size:15px" data-a="itAway" data-id="${ob.id}">마을에서 치우기</button>`);
}
ACT.itMerge = () => { closeModal(true); mergeAsk('i'); };
ACT.itMix = d => { closeModal(true); V.mode = 'mix'; V.sel = [+d.id]; render(); };
ACT.itAway = d => { const ob = getObj(d.id); if (!ob) return; modal(`<h1>${josa(nameOf(ob.k), '을', '를')} 치울까요?</h1><div class="hint" style="font-size:15px">치운 물건은 돌아오지 않아요. 도감에 올린 기록은 그대로 남아요.</div><div class="row"><button type="button" class="btn sec f1" data-a="close">그대로 둘래요</button><button type="button" class="btn f1" data-a="itAwayYes" data-id="${ob.id}">치우기</button></div>`, { mid: true }); };
ACT.itAwayYes = d => { removeObj(+d.id); save(); closeModal(true); render(); toast('자리가 하나 생겼어요'); };

// ---------- 마을 화면 ----------
function spot(at) {   // 새 친구는 비어 있는 길목에 (화면에 보이는 곳 먼저)
  const busy = navBusy(), f = $('#field'), z = V.z || 1, stops = navStops();
  const vis = ([x, y]) => !f || !V.cam ? (x > GCORE.x && x < GCORE.x + GCORE.w ? 0 : 1) : (x * z > V.cam.x + 20 && x * z < V.cam.x + f.clientWidth - 20 && y * z > V.cam.y + 60 && y * z < V.cam.y + f.clientHeight - 10 ? 0 : 1);
  return stops.sort((a, b) => at ? Math.hypot(NAV.n[a][0] - at.x, NAV.n[a][1] - at.y) - Math.hypot(NAV.n[b][0] - at.x, NAV.n[b][1] - at.y) : (busy[a] || 0) - (busy[b] || 0) || vis(NAV.n[a]) - vis(NAV.n[b]) || Math.random() - .5)[0];
}
function addObj(o, at) {
  const v = vil(); o.id = v.nid++;
  if (o.t === 'i') { o.x = o.y = 0; v.objs.push(o); layoutItems(); return o; }
  const mate = v.objs.find(x => x.t === 'f' && herdKey(x) === herdKey(o));   // 같은 친구가 있으면 그 무리로
  if (mate && mate.nd != null && !NAV.ride[mate.nd]) { o.nd = mate.nd; o.x = mate.x; o.y = mate.y; v.objs.push(o); navFix(); return o; }
  o.nd = spot(at); Object.assign(o, navPos(o.nd, o.id));
  v.objs.push(o); return o;
}
function addFriend(k, lv, extra, at) {
  const v = vil(), o = Object.assign({ t: 'f', k, lv: lv || 1 }, extra || {});
  if (o.m) v.seen['m:' + k] = 1; else { v.seen['f:' + k] = 1; if (o.hold) v.seen['r:' + k + o.hold] = 1; for (let i = 2; i <= o.lv; i++) v.seen['lv' + i + ':' + k] = 1; if (o.lv >= 5) v.seen.lv5 = 1; }
  return addObj(o, at);
}
function removeObj(id) {
  const v = vil(), i = v.objs.findIndex(o => o.id === id); if (i < 0) return;
  const o = v.objs[i]; if (o.acc) bagAdd(o.acc); if (o.seat) bagAdd(o.seat);
  v.objs.splice(i, 1);
}
function actIcons(lab) {
  const Y = '#FFD95A', W = '#FFFDF6';
  const m = {
    merge: ['var(--a0)', s => `<path d="M7 9L16 20M25 9L16 20M16 7V20" fill="none"/><circle cx="7" cy="8" r="3.4" fill="${s}"/><circle cx="16" cy="6" r="3.4" fill="${s}"/><circle cx="25" cy="8" r="3.4" fill="${s}"/><path d="M16 15.5l2.3 4.4 4.9.7-3.6 3.4.9 4.9L16 26.6l-4.5 2.3.9-4.9-3.6-3.4 4.9-.7Z" fill="${Y}"/>`],
    mix: ['var(--a2)', s => `<path d="M12 4h8M13 4v8L6 25a2.4 2.4 0 0 0 2.2 3.5h15.6A2.4 2.4 0 0 0 26 25l-7-13V4Z" fill="${W}"/><path d="M9.5 19h13L26 25a2.4 2.4 0 0 1-2.2 3.5H8.2A2.4 2.4 0 0 1 6 25Z" fill="${s}"/><circle cx="14" cy="23.5" r="1.3" fill="${W}" stroke-width="1.4"/><circle cx="19" cy="21.5" r="1" fill="${W}" stroke-width="1.4"/>`],
    book: ['var(--a3)', s => `<path d="M4 8c4-2 8-2 12 1c4-3 8-3 12-1v17c-4-2-8-2-12 1c-4-3-8-3-12-1Z" fill="${s}"/><path d="M6.5 9.5c3-1 6-.6 9.5 1.7v13c-3.5-2-6.5-2.4-9.5-1.6ZM25.5 9.5c-3-1-6-.6-9.5 1.7v13c3.5-2 6.5-2.4 9.5-1.6Z" fill="${W}" stroke-width="1.6"/><path d="M9 14c1.6-.3 3 0 4.4.7M9 18c1.6-.3 3 0 4.4.7M18.6 14.7c1.4-.7 2.8-1 4.4-.7" fill="none" stroke-width="1.5"/>`],
    shop: ['var(--a1)', s => `<path d="M6 14h20v13H6Z" fill="${W}"/><path d="M4 6h24l1.5 7c0 2-1.6 3.2-3.4 3.2S22.8 15 22.8 13c0 2-1.5 3.2-3.4 3.2S16 15 16 13c0 2-1.5 3.2-3.4 3.2S9.2 15 9.2 13c0 2-1.5 3.2-3.4 3.2S2.5 15 2.5 13Z" fill="${s}"/><path d="M13 27v-6.5h6V27" fill="${Y}"/>`],
    bag: ['var(--main)', s => `<path d="M12 8V6.5a4 4 0 0 1 8 0V8" fill="none"/><path d="M7 12a5 5 0 0 1 5-5h8a5 5 0 0 1 5 5v13a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3Z" fill="${s}"/><path d="M11 18h10v6.5a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 11 24.5Z" fill="${W}"/><path d="M14 18v3h4v-3" fill="${Y}" stroke-width="1.6"/>`] };
  return mini(m[lab][1](m[lab][0]), 32);
}
function boxChip(kind) {
  const o = O(), n = kind === 'egg' ? o.eggBox : o.itemBox;
  return `<button type="button" class="card kc" data-a="openBox" data-k="${kind}" style="flex:1 1 0;flex-direction:row;align-items:center;gap:8px;padding:6px 10px 9px 6px;border-radius:20px;text-align:left;min-width:0;background:${n ? 'var(--stary)' : 'var(--paper)'}">${itm(kind === 'egg' ? 'eggbox' : 'itembox', 44)}<span style="display:flex;flex-direction:column;min-width:0"><span class="d" style="font-size:16px">${kind === 'egg' ? '알 상자' : '물건 상자'}</span><span class="tn" style="font-size:12.5px;color:var(--sub)">${n ? n + '개 · 눌러서 열기' : '공부하면 받아요'}</span></span></button>`;
}
SCR.vil = {
  view() {
    const o = O(), v = o.vil, t = TH(); layoutItems(); navFix();
    const objs = v.objs.slice().sort((a, b) => a.y - b.y).map(objHTML).join('');
    let bottom;
    if (V.mode === 'merge') {
      const k = mergeKind(V.sel), n = V.sel.length, a = n && getObj(V.sel[0]), isF = V.mk !== 'i';
      const pre = a && a.t === 'i' && t.lines[a.k] ? `<div class="mixmsg" style="background:var(--t1)">${pic(a.k, 26, 'pl')}<span>${nameOf(a.k)} 셋 →</span>${pic(t.lines[a.k], 30, 'pl')}<span>${nameOf(t.lines[a.k])} 하나</span></div>`
        : a && a.t === 'f' && a.hold ? `<div class="mixmsg" style="background:var(--t0)"><span>${a.st || 1}성 희귀 친구 셋 → ${(a.st || 1) + 1}성 희귀 친구 하나</span></div>`
        : a && a.t === 'f' && a.lv < 5 && !a.m && !a.hold ? `<div class="mixmsg" style="background:var(--t0)"><span>${lvStep(a.lv)} 친구 셋 → ${lvStep(a.lv + 1)} 친구 하나 · ${esc(josa(frName(a), '이', '가'))} 남아서 자라요</span></div>` : '';
      bottom = `<div class="card" style="gap:8px;padding:12px"><div class="row" style="align-items:baseline"><h2 class="sp">${isF ? '친구 합치기' : '물건 합치기'} · 직접 고르기</h2><span class="sub">${n ? `세 개 중 ${n}개` : '세 개를 골라요'}</span></div>
${pre || `<div class="hint">${n === 3 && !k ? '이 셋은 합칠 수 없어요' : isF ? '같은 단계 친구 세 마리를 눌러요. 처음 고른 친구가 남아서 자라요' : '같은 물건 세 개를 눌러요. 무엇이 되는지 미리 보여 줘요'}</div>`}
<div class="row" style="gap:8px"><button type="button" class="btn sec sm f1" data-a="vMode" data-m="main">그만하기</button><button type="button" class="btn sec sm f1" data-a="mergeAsk">목록으로</button><button type="button" class="btn sm" style="flex:1.3 1 0" data-a="doMerge" ${k ? '' : 'disabled'}>합치기</button></div></div>`;
    } else if (V.mode === 'mix') {
      const mi = mixInfo(), ex = mi.exact, exNew = ex && !v.found[ex.out];
      const slots = [0, 1, 2].map(i => { const ob = getObj(V.sel[i]); return `<button type="button" data-a="mixRm" data-i="${i}" aria-label="${ob ? nameOf(ob.k) + ' 빼기' : '빈 칸'}" ${ob ? '' : 'disabled'} style="width:58px;height:58px;padding:0;border-radius:18px;border:2px ${ob ? 'solid' : 'dashed'} var(--ink);background:var(--paper);display:flex;align-items:center;justify-content:center">${ob ? pic(ob.k, 44) : ''}</button>`; });
      const PL = `<span class="d" style="font-size:20px">+</span>`;
      const res = mi.none ? `<span class="d" style="font-size:24px;color:var(--sub)">×</span>` : ex && !ex.hid ? pic(ex.out, 46, exNew ? 'sil' : '') : ex ? (exNew ? `<span class="twk d" style="font-size:28px">?</span>` : pic(ex.out, 46)) : `<span style="font-size:26px">?</span>`;
      const msg = !mi.n ? `<div class="hint">위에서 물건 세 개를 눌러서 칸에 올려요. 칸을 누르면 다시 빠져요</div>`
        : mi.none ? `<div class="mixmsg" style="background:var(--track)">${ico(IC.x, 16, 3)}<span>${mi.n === 3 ? '이 셋으로는' : '이 물건들로는'} 아무 일도 일어나지 않아요</span></div>`
        : mi.mys && (mi.n === 3 || !mi.known.length) ? `<div class="mixmsg dark2">${spark(18, 0, 0, 'twk st')}<span>${mi.n === 3 ? '어쩐지… 엄청난 일이 일어날 것 같아요!' : '어쩐지… 무슨 일이 일어날 것 같아요'}</span></div>`
        : ex ? `<div class="mixmsg" style="background:var(--mainPale)">${ico(IC.check, 16, 3)}<span>${exNew ? '새 물건이 나올 것 같아요!' : `${josa(ex.name, '을', '를')} 만들 수 있어요`}</span></div>`
        : `<div class="mixmsg" style="background:var(--t1)">${ico(IC.bulb, 16, 2.6)}<span>이 물건이 들어가는 조합이 위에 보여요${mi.mys ? ' · 그런데 어쩐지 다른 일도…' : ''}</span></div>`;
      bottom = `<div class="card" style="gap:8px;padding:12px"><div class="row" style="align-items:baseline"><h2 class="sp">조합 칸</h2><span class="sub">${mi.n} / 3</span></div>
<div class="row" style="justify-content:space-between">${slots[0]}${PL}${slots[1]}${PL}${slots[2]}<span class="d" style="font-size:20px">=</span><span style="width:58px;height:58px;border-radius:18px;border:2px solid var(--ink);background:var(${mi.none ? '--track' : '--y'});display:flex;align-items:center;justify-content:center;position:relative" class="d">${res}</span></div>
${msg}
<button type="button" class="btn sec" data-a="go" data-s="book2" style="gap:8px;background:var(--t3)">${ico(IC.book, 24)}도감 보고 고르기</button>
<div class="row" style="gap:8px"><button type="button" class="btn sec sm f1" data-a="vMode" data-m="main">그만하기</button>${mi.n ? `<button type="button" class="btn sec sm" style="flex:none;padding:0 14px 3px" data-a="mixClear">비우기</button>` : ''}<button type="button" class="btn sm" style="flex:1.3 1 0" data-a="doMix" ${mi.n === 3 && !mi.none ? '' : 'disabled'}>조합하기</button></div></div>`;
    } else {
      const acts = [['merge', '합치기', '--t0', 'mergeAsk'], ['mix', '조합', '--t2', 'vMode'], ['book', '도감', '--t3', 'go'], ['shop', '상점', '--stary', 'go'], ['bag', '가방', '--mainLt', 'go']];
      const mg = mergeable();
      bottom = `<div class="row" style="gap:6px">${acts.map(([k, n, c, a]) => `<button type="button" class="act${k === 'merge' && mg ? ' call' : ''}" style="background:var(${c})" data-a="${a}" data-m="${k}" data-s="${k === 'book' ? 'book2' : k}">${actIcons(k)}<span>${n}</span>${k === 'merge' && mg ? `<b class="badge2 tn">${mg}</b>` : ''}</button>`).join('')}</div>`;
    }
    const note = V.mode === 'main' && !v.objs.length ? '상자를 열어서 마을을 채워요' : '', full = V.mode === 'full';
    if (full) bottom = '';
    const inv = () => {   // 조합할 때는 마을 대신 물건 목록을 크게 보여 줘요
      const cnt = {}, used = {}; v.objs.forEach(x => { if (x.t === 'i') cnt[x.k] = (cnt[x.k] || 0) + 1; }); V.sel.map(getObj).filter(Boolean).forEach(x => { used[x.k] = (used[x.k] || 0) + 1; });
      const ready = allRecs().filter(r => !r.same && (!r.hid || v.found[r.out]) && recIds(r, [])).sort((a, b) => (v.found[a.out] ? 1 : 0) - (v.found[b.out] ? 1 : 0)), hot = {}; ready.forEach(r => r.in.forEach(k => { hot[k] = 1; }));   // 지금 가진 물건으로 만들 수 있는 조합
      const keys = Object.keys(cnt).sort((a, b) => (hot[b] ? 1 : 0) - (hot[a] ? 1 : 0) || zoneOf(a) - zoneOf(b) || itemTier(a) - itemTier(b) || (a < b ? -1 : 1)), n = V.sel.length;
      const dead = k => { if (!n || n >= 3) return false; const ob = v.objs.find(x => x.t === 'i' && x.k === k && !V.sel.includes(x.id)); if (!ob) return false; V.sel.push(ob.id); const none = mixInfo().none; V.sel.pop(); return none; };
      return `<div class="card inv" data-sc="inv">${mixTop()}${!n && ready.length ? `<div class="mixtop" style="background:var(--stary)"><span class="d" style="font-size:13.5px">지금 만들 수 있어요 · 누르면 칸에 올라가요</span><div class="recs">${ready.slice(0, 3).map(recChip).join('')}</div>${ready.length > 3 ? `<span style="font-size:12px;color:var(--sub)">이 밖에 ${ready.length - 3}개가 더 있어요 · 반짝이는 물건이 재료예요</span>` : ''}</div>` : ''}<div class="row" style="align-items:baseline"><h2 class="sp">마을에 있는 물건</h2><span class="sub">눌러서 조합 칸에 올려요</span></div>
${keys.length ? `<div class="invg">${keys.map(k => { const left = cnt[k] - (used[k] || 0), off = left < 1 || n >= 3, dd = !off && dead(k); return `<button type="button" class="tile${dd ? ' dead' : ''}${hot[k] && !dd && !off ? ' hot' : ''}" data-a="mixAdd" data-k="${k}" ${off ? 'disabled' : ''} style="padding:9px 3px 6px;gap:2px;${used[k] ? 'background:var(--mainPale)' : ''}">${pic(k, 46)}<span style="font-size:12px;line-height:1.2">${nameOf(k)}</span><span class="cnt tn">×${left}</span>${hot[k] && !dd && !off ? `<span class="hotb">${star5(13)}</span>` : ''}</button>`; }).join('')}</div>${n && n < 3 ? '<div class="hint">흐린 물건은 지금 고른 것과 섞어도 아무 일도 일어나지 않아요</div>' : ''}` : '<div class="hint" style="text-align:center;padding:24px 0">아직 물건이 없어요. 물건 상자를 열어 보세요</div>'}</div>`;
    };
    const tight = V.mode === 'main' && (roomOf('egg') < 1 || roomOf('item') < 1), mgN = V.mode === 'main' ? mergeable() : 0;
    return `<div class="scr np" style="gap:10px;padding-top:18px">
<div class="row"><button type="button" class="row" data-a="towns" aria-label="내 마을 보기" style="gap:1px;border:0;background:none;padding:0;flex:none;margin-right:5px"><h1 style="white-space:nowrap;font-size:25px">${t.name}</h1><span style="display:flex;flex:none;width:18px;transform:rotate(90deg);opacity:.6">${ico(IC.fwd, 18, 2.6)}</span></button>${pctPill()}<span class="sp"></span>${o.inf ? '<span class="chip ln" style="background:var(--t3)">무한모드</span>' : ''}<button type="button" class="ibtn rd d" style="width:40px;height:40px;font-size:19px" data-a="vHelp" aria-label="도움말">?</button>${starPill()}</div>
${V.mode === 'main' ? `<div class="row" style="gap:6px;justify-content:flex-end">${resPill('log', v.res.wood)}${resPill('st1', v.res.stone)}</div><div class="row" style="gap:8px">${boxChip('egg')}${boxChip('item')}</div>` : ''}
${V.mode === 'mix' ? inv() : `<div class="field${full ? ' full' : ''}" id="field" style="background:linear-gradient(${GTH[o.theme].sky} 0 50%,${GTH[o.theme].top[2]} 50% 100%)"><div class="world" id="world" style="width:${WW}px;height:${WH}px">${groundSVG()}${trophyHTML()}${pileHTML()}${objs}</div>
${full ? `<button type="button" class="ibtn fx" data-a="vMode" data-m="main" aria-label="크게 보기 닫기">${ico(IC.x, 22)}</button><button type="button" class="fbtn" style="left:12px;top:12px" data-a="go" data-s="album">${ico(IC.photo, 20)}앨범${(v.album || []).length ? ` ${v.album.length}` : ''}</button><button type="button" class="fbtn shot" data-a="vShot">${ico(IC.cam, 24)}사진 찍기</button><div class="fhint">친구를 누르면 한마디 해요</div>` : `<button type="button" class="ibtn fx sm" data-a="vFull" aria-label="마을 크게 보기">${ico(IC.full, 20)}</button>`}
${note ? `<div style="position:absolute;left:10px;bottom:10px;padding:4px 12px;border-radius:13px;border:1.5px solid var(--ink);background:var(--paper);font-size:12.5px;z-index:10000;pointer-events:none">${note}</div>` : ''}
${tight || mgN ? `<button type="button" class="nudge${tight ? ' full' : ''}" data-a="mergeAsk">${actIcons('merge')}<span>${tight ? `${roomOf('egg') < 1 ? '친구' : '물건'} 자리가 꽉 찼어요 · 합치면 넓어져요` : `합칠 수 있는 묶음이 ${mgN}개 있어요`}</span>${ico(IC.fwd, 16)}</button>` : ''}
</div>`}
${bottom}
</div>${tabbar('vil')}`;
  },
  after() {
    const f = $('#field'), o = O(), v = o.vil;
    if (!f) { clearInterval(V.timer); return afterChecks(); }   // 조합 화면에는 지도가 없어요
    if (V.zfit == null || V.fw !== f.clientWidth) { V.fw = f.clientWidth; }
    V.fit = f.clientWidth / WW;   // 가장 작게 줄이면 마을 전체가 가로로 다 보여요 (위아래 남는 곳은 하늘과 풀밭 색)
    if (!V.cam || V.owner !== S.cur) { V.owner = S.cur; V.z = V.fit >= .7 ? V.fit : clamp(Math.min(1, f.clientHeight / WH * 1.2), V.fit, ZMAX); V.cam = { x: PLAZA.x * V.z - f.clientWidth / 2, y: PLAZA.y * V.z - f.clientHeight / 2 }; V.rt = {}; }   // 처음에는: 태블릿처럼 넓으면 마을 전체, 폰에서는 한가운데를 크게
    V.z = clamp(V.z, V.fit, ZMAX);
    camApply();
    if ((V.mode === 'main' || V.mode === 'full') && v.gift !== today() && v.objs.length) placeGift();   // 하루 선물은 크게 볼 때도 보여요
    bindField(f);
    clearInterval(V.timer);
    V.timer = setInterval(wander, 600);
    if (V.pop) { const el = $(`.obj[data-id="${V.pop}"]`); if (el) el.classList.add('pop'); V.pop = null; }
    if (!o.tutV && V.mode === 'main' && !window.NO_TUT && !$('#ov')) return tutStart();   // 처음 들어오면 튜토리얼부터
    afterChecks();
  },
  leave() { clearInterval(V.timer); V.timer = null; V.mode = 'main'; V.sel = []; save(); },
  back() { if (V.mode !== 'main') { V.mode = 'main'; V.sel = []; render(); return true; } return back(); }
};
function camApply() {
  const f = $('#field'), w = $('#world'); if (!f || !w) return;
  const s = V.z, cw = f.clientWidth, ch = f.clientHeight;
  const mx = WW * s - cw, my = WH * s - ch;
  V.cam.x = mx > 0 ? clamp(V.cam.x, 0, mx) : mx / 2;
  V.cam.y = my > 0 ? clamp(V.cam.y, 0, my) : my / 2;
  w.style.transform = `translate(${-V.cam.x}px,${-V.cam.y}px) scale(${s})`;
}
const ZMAX = 2.4;
function zoomAt(nz, fx, fy) {
  nz = clamp(nz, V.fit, ZMAX); const old = V.z; if (nz === old) return;
  const wx = (V.cam.x + fx) / old, wy = (V.cam.y + fy) / old;
  V.z = nz; V.cam.x = wx * nz - fx; V.cam.y = wy * nz - fy; camApply();
}
ACT.vMode = d => { V.mode = d.m; V.mk = ''; V.sel = []; _scrOf = ''; render(); };
// ---------- 도움말: 기능마다 예시 카드 한 장씩, 넘기면서 봐요 ----------
const hpic = (k, size) => { const b = itemBox(k), q = size / Math.max(b.w, b.h); return `<svg class="stk" viewBox="${f1(b.x)} ${f1(b.y)} ${f1(b.w)} ${f1(b.h)}" width="${Math.round(b.w * q)}" height="${Math.round(b.h * q)}" aria-hidden="true">${k[0] === '@' ? DT.art[k.slice(1)] : `<g stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${DT.item[k] || ''}</g>`}</svg>`; };
const HELP = [
  { t: '친구 합치기', d: '같은 단계 친구 셋이 모이면 한 단계 자라요. 종류가 달라도 돼요.<br>희귀 친구는 같은 친구 셋이 모이면 별이 하나 늘어요.', a: () => { const t = TH(); return t.fr.slice(0, 3).map(k => frInner({ k, lv: 1 }, 46, true)).join(HPL) + HAR + frInner({ k: t.fr[0], lv: 2 }, 66, true); } },
  { t: '물건 합치기', d: '같은 물건 셋을 합치면 묶음, 바구니, 황금 순서로 커져요.<br>무엇이 되는지 미리 보여 줘요.', a: () => { const t = TH(), k = t.base[0]; return [0, 1, 2].map(() => hpic(k, 44)).join(HPL) + HAR + hpic(t.lines[k], 66); } },
  { t: '조합', d: '서로 다른 물건 셋을 조합 칸에 올리면 새 물건이 나와요.<br>도감에서 조합을 눌러 바로 올릴 수도 있어요.<br>같은 물건을 또 만들면 도감에 별이 늘고, 다섯 번째에는 다이아몬드가 돼요.', a: () => { const r = TH().sets[0].recs[0]; return r.in.map(k => hpic(k, 44)).join(HPL) + `<span class="d" style="font-size:20px">=</span>` + hpic(r.out, 66); } },
  { t: '상자', d: '문제를 맞히다 보면 알 상자와 물건 상자를 하나씩 받아요.<br>상자 하나에서 친구 셋이나 물건 셋이 나와요.', a: () => { const t = TH(); return itm('eggbox', 70) + HAR + t.fr.slice(3, 6).map(k => frInner({ k, lv: 1 }, 42, true)).join(''); } },
  { t: '자리', d: '친구 자리는 열두 개, 물건 자리는 서른여섯 개예요.<br>꽉 차면 합쳐서 자리를 만들어요.', a: () => `<div style="width:210px;display:flex;flex-direction:column;gap:10px">${[['친구', 12, 12], ['물건', 28, 36]].map(([n, a, m]) => `<div style="display:flex;flex-direction:column;gap:3px"><div class="row" style="font-size:14px"><span class="sp">${n} 자리</span><span class="d tn">${a} / ${m}</span></div><div class="bar" style="height:10px"><i style="width:${a / m * 100}%;${a >= m - 2 ? 'background:var(--a3)' : ''}"></i></div></div>`).join('')}</div>` },
  { t: '간식과 꾸미기', d: '간식을 다섯 번 주면 친구가 선물을 줘요.<br>꾸며 주면 친구가 칭호를 얻어요.', a: () => frInner({ k: TH().hero, lv: 3, acc: '@s_crown' }, 76, true) + itm('cookie', 46) + `<span class="row" style="gap:3px">${[1, 1, 1, 0, 0].map(x => `<span style="width:13px;height:13px;border-radius:7px;border:1.5px solid var(--ink);background:var(${x ? '--a3' : '--paper'})"></span>`).join('')}</span>` },
  { t: '나무와 돌', d: '쉬는 동안 친구들이 모아 와요. 많이 자란 친구일수록 더 모아요.<br>보금자리는 나무와 돌로 지어요.', a: () => hpic('log', 56) + HPL + hpic('st1', 56) + HAR + hpic(TH().homes[0].k, 76) },
  { t: '위급상황 도전', d: '하루 세 번, 1분 30초 동안 단어를 맞혀서 천적을 쫓아내요.<br>점수가 높을수록 멋진 트로피를 받아요.', a: () => frInner({ k: TH().hero, lv: 4 }, 66, true) + `<span class="d" style="font-size:22px">!</span>` + stk(ENEMY[O().theme][0], 84) + HAR + stk('tr3', 60) },
  { t: '도움 카드', d: '별로 사고, 써도 없어지지 않아요.<br>도전을 시작할 때 두 장을 고르면 알아서 써져요. 세 장을 합치면 더 세져요.', a: () => [0, 1, 2].map(() => stk('k_cheer', 46)).join('') + HAR + `<span style="display:flex;flex-direction:column;align-items:center;gap:2px">${stk('k_cheer', 64)}${pips(2, 13)}</span>` },
  { t: '칭호', d: '미션을 해내면 칭호를 얻어서 이름 앞에 붙여요.<br>친구도 꾸미거나 자라면 칭호를 얻어요.', a: () => `<span class="row" style="gap:6px">${tchip('꾸준히 하는', 17)}<span class="d" style="font-size:24px">${esc(O().name)}</span></span>` },
  { t: '마을 여러 개', d: '새 단어장을 시작할 때마다 마을을 하나 더 열 수 있어요.<br>지금 마을을 끝까지 키워도 되고, 마을 이름을 눌러 언제든 오갈 수 있어요.', a: () => `<div class="row" style="gap:10px;justify-content:center;align-items:flex-end">${['dino', 'chara', 'animal'].map(k => `<span style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px 10px;border-radius:18px;border:2px solid var(--ink);background:${DT.themes[k].col.mainPale}">${stk(DT.themes[k].fr[0], 46)}<span class="d" style="font-size:12.5px;white-space:nowrap">${DT.themes[k].name}</span></span>`).join('')}</div>` },
  { t: '크게 보기와 앨범', d: '지도의 빈 땅을 누르면 마을이 화면 가득 보여요.<br>친구를 누르면 한마디 하고, 사진을 찍어 앨범에 모을 수 있어요.', a: () => `<div class="row" style="gap:14px;justify-content:center;align-items:flex-end"><div style="position:relative;padding-top:34px">${frInner({ k: TH().hero, lv: 2 }, 70, true)}<span class="sayb" style="top:0">같이 놀자!</span></div><span style="width:64px;height:64px;border-radius:22px;border:2px solid var(--ink);background:var(--stary);display:flex;align-items:center;justify-content:center">${ico(IC.cam, 34)}</span></div>` },
  { t: '하루 선물과 마을 보기', d: '하루에 한 번, 마을에서 반짝이는 곳을 누르면 별을 받아요.<br>손가락으로 밀면 마을 구석구석이 보이고, 두 손가락을 벌리면 크게 보여요.', a: () => `<span style="position:relative;width:70px;height:70px">${spark(40, 14, 14, 'twk')}${spark(22, 46, 2, 'twk')}</span>` + HAR + stk('s_star', 60) }];
const HAR = `<span class="d" style="font-size:22px;flex:none">→</span>`, HPL = `<span class="d" style="font-size:16px;flex:none">+</span>`;
function helpModal(i) {
  V.hp = clamp(i, 0, HELP.length - 1); const h = HELP[V.hp], last = V.hp === HELP.length - 1;
  const body = `<div class="row"><h1 class="sp">마을은 이렇게 키워요</h1><span class="sub tn">${V.hp + 1} / ${HELP.length}</span></div>
<div id="helpc" style="display:flex;flex-direction:column;gap:10px;touch-action:pan-y"><div class="helpart">${h.a()}</div><div class="d" style="font-size:22px;text-align:center">${h.t}</div><div style="font-size:15px;line-height:1.6;text-align:center;min-height:74px">${h.d}</div></div>
<div class="row" style="justify-content:center;gap:6px;flex-wrap:wrap">${HELP.map((x, k) => `<button type="button" data-a="helpAt" data-i="${k}" aria-label="${k + 1}번째 카드" style="width:${k === V.hp ? 22 : 10}px;height:10px;padding:0;border-radius:5px;border:1.5px solid var(--ink);background:var(${k === V.hp ? '--main' : '--paper'})"></button>`).join('')}</div>
<div class="row" style="gap:8px"><button type="button" class="btn sec f1" data-a="helpGo" data-d="-1" ${V.hp ? '' : 'disabled'}>이전</button><button type="button" class="btn" style="flex:1.6 1 0" data-a="helpGo" data-d="1">${last ? '알겠어요' : '다음'}</button></div>
<button type="button" class="btn sec sm" data-a="tutAgain" style="gap:6px">${ico(IC.vil, 20)}마을 튜토리얼 보기</button>`;
  const w = $('#helpw'); if (w) w.innerHTML = body; else modal(`<div id="helpw" style="display:flex;flex-direction:column;gap:14px">${body}</div>`, { mid: true });   // 넘길 때는 창을 다시 띄우지 않고 내용만 바꿔요
  const c = $('#helpc'); if (!c) return; let x0 = null;   // 옆으로 밀어서도 넘겨요
  c.onpointerdown = e => { x0 = e.clientX; }; c.onpointerup = e => { if (x0 == null) return; const dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) ACT.helpGo({ d: dx < 0 ? 1 : -1 }); };
}
ACT.vHelp = () => helpModal(0);
// ---------- 마을 튜토리얼: 처음 마을에 들어오면 한 번. 건너뛸 수 있고, 도움말에서 다시 볼 수 있어요 ----------
const TUTS = { vil: [
  { t: '우리 마을에 온 걸 환영해요!', d: '공부해서 받은 상자로 친구와 물건을 모아 마을을 키워요. 어떻게 하는지 잠깐 알려 줄게요.' },
  { s: '.scr [data-a=openBox]', t: '상자 열기', d: '문제를 맞히다 보면 알 상자와 물건 상자를 하나씩 받아요. 눌러서 열어요. 마을 꼭대기에 쌓인 상자를 눌러도 돼요.' },
  { s: '#field', t: '마을 둘러보기', d: '손가락으로 밀면 구석구석 보이고, 두 손가락을 벌리면 커져요. 빈 땅을 누르면 화면 가득 보이고, 그때 친구를 누르면 한마디 해요.' },
  { s: '.act[data-m=merge]', t: '합치기', d: '같은 단계 친구 셋은 한 단계 자라고, 같은 물건 셋은 더 좋은 물건이 돼요. 자리가 꽉 차면 합쳐서 넓혀요.' },
  { s: '.act[data-m=mix]', t: '조합', d: '물건 세 개를 섞으면 새 물건이 나와요. 도감을 보고 따라 해도 돼요.' },
  { s: '.act[data-m=book], .act[data-m=shop], .act[data-m=bag]', t: '도감 · 상점 · 가방', d: '도감에서 모은 것을 보고, 상점에서 별로 사고, 가방에서 친구에게 간식과 꾸미기, 집, 탈것을 줘요.' },
  { s: '.tabbar [data-t=chal]', t: '도전!', d: '아래 가운데 도전!을 누르면 하루 세 번, 시간 안에 단어를 맞혀 마을을 지켜요. 점수가 높으면 트로피를 받아요.' },
  { s: '.scr [data-a=vHelp]', t: '언제든 다시', d: '여기 물음표를 누르면 도움말과 이 안내를 다시 볼 수 있어요. 이제 마을을 키워 봐요!' }],
  chal: [
  { t: '도전!에 온 걸 환영해요', d: '마을에 말썽꾸러기가 나타났어요! 1분 30초 동안 단어를 맞혀서 쫓아내요. 하루에 세 번 할 수 있고, 더 하고 싶으면 상점에서 도전권을 살 수 있어요.' },
  { s: '.scr [data-tu=tro]', t: '트로피', d: '점수가 높을수록 더 멋진 트로피를 받아서 마을 꼭대기에 세워요. 별도 같이 받아요.' },
  { s: '.scr [data-tu=team]', t: '친구들과 함께', d: '마을에서 가장 많이 자란 친구 넷이 같이 나가요. 친구를 키울수록 든든해요.' },
  { s: '.scr [data-a=chalNext]', t: '도움 카드', d: '상점에서 산 카드는 두 장까지 골라 가요. 짝꿍 카드를 같이 고르면 시너지가 생겨요. 쓴 카드는 없어지지 않아요.' },
  { s: '.scr [data-a=tutChal]', t: '언제든 다시', d: '여기 물음표를 누르면 이 안내를 다시 볼 수 있어요. 이제 도전해 봐요!' }] };
const TUTF = { vil: 'tutV', chal: 'tutC' };
function tutShow(i) {
  V.tut = i; const TUT = TUTS[V.tutK || 'vil'], st = TUT[i], app = $('#app'); { const e0 = st.s && document.querySelector(st.s), sc = $('.scr'); if (e0 && sc && sc.contains(e0)) e0.scrollIntoView({ block: 'center' }); } const ar = app.getBoundingClientRect(); let t = $('#tut');
  if (!t) { t = document.createElement('div'); t.id = 'tut'; app.appendChild(t); }
  const els = st.s ? [...document.querySelectorAll(st.s)] : []; let hole = '', box = null;
  if (els.length) { const rs = els.map(e => e.getBoundingClientRect()), x0 = Math.min(...rs.map(r => r.left)) - ar.left - 6, y0 = Math.min(...rs.map(r => r.top)) - ar.top - 6, x1 = Math.max(...rs.map(r => r.right)) - ar.left + 6, y1 = Math.max(...rs.map(r => r.bottom)) - ar.top + 6; box = { x0, y0, x1, y1 }; hole = `<div class="tut-hole" style="left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px"></div>`; }
  else hole = `<div class="tut-hole" style="left:50%;top:40%;width:0;height:0"></div>`;
  const last = i === TUT.length - 1, W = Math.min(ar.width - 28, 380);
  t.innerHTML = `${hole}<div class="tut-card" style="width:${W}px"><div class="row" style="gap:10px;align-items:flex-start"><span class="hop" style="flex:none">${stk(TH().hero, 54, '', true)}</span><div style="display:flex;flex-direction:column;gap:3px;min-width:0"><span class="d" style="font-size:19px">${st.t}</span><span style="font-size:14.5px;line-height:1.5">${st.d}</span></div></div>
<div class="row" style="gap:8px"><span class="sub tn" style="font-size:13px;margin-right:auto">${i + 1} / ${TUT.length}</span>${last ? '' : '<button type="button" class="btn sec sm" style="height:42px;padding:0 14px 3px;font-size:15px" data-a="tutEnd">건너뛰기</button>'}${i ? '<button type="button" class="btn sec sm" style="height:42px;padding:0 14px 3px;font-size:15px" data-a="tutGo" data-d="-1">이전</button>' : ''}<button type="button" class="btn sm" style="height:42px;padding:0 20px 3px;font-size:16px" data-a="${last ? 'tutEnd' : 'tutGo'}" data-d="1">${last ? '시작하기' : '다음'}</button></div></div>`;
  const c = $('.tut-card', t), h = c.offsetHeight; let top;
  if (!box) top = ar.height * .4;
  else if (box.y1 - box.y0 > ar.height * .5) top = box.y1 - h - 18;         // 지도처럼 큰 것은 그 안 아래쪽에
  else if (box.y1 + h + 14 < ar.height - 8) top = box.y1 + 12;               // 가리키는 것 아래
  else top = box.y0 - h - 12;                                                // 자리가 없으면 위
  c.style.top = Math.max(10, Math.round(top)) + 'px'; c.style.left = Math.round((ar.width - W) / 2) + 'px';
}
function tutStart(k) { V.tutK = k || 'vil'; if (V.tutK === 'vil') { if (R.name !== 'vil') go('vil', {}, { reset: true }); if (V.mode !== 'main') { V.mode = 'main'; V.sel = []; render(); } } else if (R.name !== 'chal') { O().tutC = 1; ACT.tab({ t: 'chal' }); } closeModal(true); tutShow(0); }
ACT.tutGo = d => tutShow(clamp(V.tut + (+d.d), 0, TUTS[V.tutK || 'vil'].length - 1));
ACT.tutEnd = () => { const t = $('#tut'); if (t) t.remove(); O()[TUTF[V.tutK || 'vil']] = 1; save(); afterChecks(); };
ACT.tutAgain = () => { closeModal(true); tutStart(); };
ACT.helpAt = d => helpModal(+d.i);
ACT.helpGo = d => { const n = (V.hp || 0) + (+d.d); if (n >= HELP.length) return closeModal(true); if (n >= 0) helpModal(n); };

// ---------- 돌아다니기 ----------
function wander() {
  if (R.name !== 'vil' || V.drag || $('#ov')) return;
  const now = Date.now(), busy = navBusy();
  for (const g of herds()) {
    const o = g[0], rt = V.rt[o.id] || (V.rt[o.id] = { next: now + rnd(2500) });
    if (now < rt.next) continue;
    if (CAT[o.seat] === 'home' || g.some(x => V.sel.includes(x.id))) { rt.next = now + 3000; continue; }
    const ride = CAT[o.seat] === 'ride';
    let nb = NAV.e[o.nd] || []; const fwd = nb.filter(i => i !== rt.prev); if (fwd.length) nb = fwd;   // 되돌아가기보다 가던 길을 이어서
    const free = nb.filter(i => !busy[i]); if (free.length) nb = free;                                 // 비어 있는 길목 먼저
    if (!nb.length) { rt.next = now + 1500; continue; }
    const to = pickR(nb), from = o.nd, p = navPos(to, o.id), dist = Math.hypot(p.x - o.x, p.y - o.y), dur = Math.max(.4, dist / (ride ? 80 : 30));
    g.forEach((m, j) => {   // 무리는 다 같이 움직여요
      const q = j ? herdPos(p, j, m) : p, el = $(`.obj[data-id="${m.id}"]`), mt = V.rt[m.id] || (V.rt[m.id] = { next: 0 });
      if (el) {
        const fl = $('.flip', el); if (fl && Math.abs(p.x - o.x) > 6) fl.style.transform = p.x < o.x ? 'scaleX(-1)' : 'none';
        el.style.transitionDuration = dur + 's';
        el.style.transform = `translate(${q.x}px,${q.y}px)`; el.style.zIndex = Math.round(Math.max(q.y, m.y));
        el.classList.add('walk');
        clearTimeout(mt.t); mt.t = setTimeout(() => { el.classList.remove('walk'); el.style.zIndex = Math.round(q.y); }, dur * 1000);
      }
      busy[m.nd] = Math.max(0, (busy[m.nd] || 1) - 1); busy[to] = (busy[to] || 0) + 1;
      m.nd = to; m.x = q.x; m.y = q.y;
    });
    rt.prev = from;
    rt.next = now + dur * 1000 + (NAV.pass[to] ? 0 : Math.random() < .45 ? 150 : 1200 + rnd(V.mode === 'main' ? 4200 : 9000));   // 돌계단에서는 멈추지 않고, 가끔은 쉬지 않고 계속 걸어요
  }
}

// ---------- 손가락 ----------
function bindField(f) {
  let st = null, pin = null;
  const pts = new Map();
  const pt = e => ({ x: e.clientX, y: e.clientY });
  const endDrag = s => { s.el.classList.remove('drag'); s.el.style.zIndex = Math.round(V.drag.y); V.drag = null; save(); };
  f.onwheel = e => { e.preventDefault(); const r = f.getBoundingClientRect(); zoomAt(V.z * (e.deltaY < 0 ? 1.12 : 1 / 1.12), e.clientX - r.left, e.clientY - r.top); };
  f.onpointerdown = e => {
    if (e.target.closest('button')) return;
    pts.set(e.pointerId, pt(e));
    if (pts.size === 2) {
      if (st) { clearTimeout(st.t); if (st.drag) endDrag(st); st = null; }
      const [a, b] = [...pts.values()], r = f.getBoundingClientRect();
      pin = { d: Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)), z: V.z, wx: (V.cam.x + (a.x + b.x) / 2 - r.left) / V.z, wy: (V.cam.y + (a.y + b.y) / 2 - r.top) / V.z };
      try { f.setPointerCapture(e.pointerId); } catch (x) {}
      return;
    }
    if (pts.size > 2) return;
    const el = e.target.closest('.obj, .gift');
    if (pin) return;
    st = { p: pt(e), el, id: el && el.dataset.id ? +el.dataset.id : 0, cam: { x: V.cam.x, y: V.cam.y }, moved: false, drag: false, t: null };
    try { f.setPointerCapture(e.pointerId); } catch (x) {}
    const ob = st.id && getObj(st.id);
  };
  f.onpointermove = e => {
    if (pts.has(e.pointerId)) pts.set(e.pointerId, pt(e));
    if (pin && pts.size >= 2) {
      const [a, b] = [...pts.values()], r = f.getBoundingClientRect(), mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      V.z = clamp(pin.z * Math.hypot(a.x - b.x, a.y - b.y) / pin.d, V.fit, ZMAX);
      V.cam.x = pin.wx * V.z - mx; V.cam.y = pin.wy * V.z - my; camApply(); return;
    }
    if (!st) return;
    const p = pt(e), dx = p.x - st.p.x, dy = p.y - st.p.y;
    if (st.drag) {
      const ob = V.drag; ob.x = clamp(st.o0.x + dx / V.z, 24, WW - 24); ob.y = clamp(st.o0.y + dy / V.z, 60, WH - 8);
      st.el.style.transform = `translate(${ob.x}px,${ob.y}px)`; return;
    }
    if (!st.moved && Math.hypot(dx, dy) > 8) { st.moved = true; clearTimeout(st.t); }
    if (st.moved) { V.cam.x = st.cam.x - dx; V.cam.y = st.cam.y - dy; camApply(); }
  };
  f.onpointerup = f.onpointercancel = e => {
    pts.delete(e.pointerId);
    if (pin) { if (pts.size < 2) pin = null; st = null; return; }
    if (!st) return;
    clearTimeout(st.t);
    const s = st; st = null;
    if (s.drag) return endDrag(s);
    if (s.moved || e.type === 'pointercancel') return;
    if (s.el && s.el.classList.contains('gift')) return openGift();
    if (s.el && s.el.classList.contains('trophy')) return trophyTap();
    if (s.el && s.el.classList.contains('pile')) return V.mode === 'main' || V.mode === 'full' ? ACT.openBox({ k: s.el.dataset.k }) : null;
    if (!s.id) { if (V.mode === 'main' && !(s.el && s.el.classList.contains('sgn'))) ACT.vFull(); return; }   // 빈 땅을 누르면 마을을 화면 가득
    const ob = getObj(s.id); if (!ob) return;
    if (V.mode === 'full') { if (ob.t === 'f') frSay(ob); else toastAt(ob, nameOf(ob.k)); return; }
    if (V.mode === 'merge' || V.mode === 'mix') {
      const i = V.sel.indexOf(ob.id);
      if (i >= 0) V.sel.splice(i, 1);
      else if (V.mode === 'mix' && ob.t !== 'i') return toast('조합은 물건끼리만 할 수 있어요');
      else if (V.sel.length < 3) V.sel.push(ob.id);
      else return toast('세 개까지만 고를 수 있어요');
      render();
    } else if (ob.t === 'f') friendSheet(ob);
    else itemSheet(ob);
  };
}

// ---------- 크게 보기: 친구를 누르면 한마디, 사진을 찍어 앨범에 ----------
const FSAY = { all: ['안녕!', '같이 놀자!', '오늘도 공부했어?', '여기 정말 좋아!', '나 좀 봐 봐!', '히히', '쓰담쓰담 해 줘', '같이 걸을래?', '반가워!', '너 멋지다!', '오늘 기분 최고야', '단어 하나만 알려 줘', '심심했는데 잘 왔어', '우리 마을 예쁘지?', '또 놀러 와!', '배고파…', '졸려…', '랄랄라'],
  dino: ['쿵쿵! 내 발소리야', '크아앙! 놀랐지?', '화산 구경 갈래?', '돌멩이 주웠어'], chara: ['반짝반짝!', '간식 먹을 시간이야', '무지개 봤어?', '오늘은 뭐 입지?'], animal: ['햇볕이 따뜻해', '밭에 새싹이 났어', '풀 냄새 좋다', '같이 소풍 가자'],
  baby: ['응애… 아니, 안녕!', '빨리 크고 싶어', '나 아직 작아'], big: ['나 많이 컸지?', '내가 지켜 줄게'], legend: ['내가 바로 전설이야', '여기까지 키워 줘서 고마워', '반짝이는 건 나야'], rare: ['이거 봐, 내 보물이야', '나 만나기 어렵지?', '특별한 날이야'], mys: ['쉿, 나는 비밀이 많아', '어디서 왔는지는 비밀이야'], herd: ['우리는 늘 같이 다녀', '친구랑 있으면 좋아'] };
function frSay(o) {
  const g = herds().find(g => g.includes(o)), pool = FSAY.all.concat(FSAY[O().theme] || [], o.m ? FSAY.mys : o.hold ? FSAY.rare : o.lv >= 5 ? FSAY.legend : o.lv >= 3 ? FSAY.big : o.lv <= 1 ? FSAY.baby : [], g && g.length > 1 ? FSAY.herd : []);
  let t = pickR(pool); if (t === V.lastSay) t = pickR(pool); V.lastSay = t; toastAt(o, t, true); vib(10); bump('says');
}
function toastAt(o, text, hop) {   // 친구나 물건 머리 위에 잠깐 뜨는 말풍선
  const el = $(`.obj[data-id="${o.id}"]`); if (!el) return; const old = $('.sayb', el); if (old) old.remove();
  const b = document.createElement('span'); b.className = 'sayb'; b.textContent = text; b.style.top = -(o.t === 'f' ? objSize(o) : itemDim(o.k).h) - 34 + 'px'; el.appendChild(b); el.classList.add('saying');
  if (hop) { const bob = $('.bob', el); if (bob) { bob.classList.remove('hop1'); void bob.offsetWidth; bob.classList.add('hop1'); } }
  clearTimeout(el._sayT); el._sayT = setTimeout(() => { b.remove(); el.classList.remove('saying'); }, 2600);
}
ACT.vFull = () => { V.mode = 'full'; V.sel = []; render(); };
const ALBUM_MAX = 20;
ACT.vShot = () => {   // 지금 보이는 모습 그대로 담아요 (그림 파일이 아니라 그 순간의 마을 모습을 기억해요)
  const v = vil(), f = $('#field'); if (!f) return; v.album = v.album || [];
  if (v.album.length >= ALBUM_MAX) return toast(`앨범에는 ${ALBUM_MAX}장까지 담을 수 있어요. 앨범에서 지우고 찍어요`);
  const says = {}; document.querySelectorAll('#world .obj .sayb').forEach(b => { says[b.parentNode.dataset.id] = b.textContent; });
  v.album.unshift({ t: Date.now(), r: [Math.round(V.cam.x / V.z), Math.round(V.cam.y / V.z), Math.round(f.clientWidth / V.z), Math.round(f.clientHeight / V.z)], tro: v.trophy, objs: v.objs.map(o => { const c = { t: o.t, k: o.k, id: o.id, x: o.x, y: o.y }; ['lv', 'hold', 'st', 'm', 'acc', 'seat', 'nm', 'name', 'ts', 'fo'].forEach(k => { if (o[k] != null) c[k] = o[k]; }); if (says[o.id]) c.say = says[o.id]; return c; }) });
  bump('shots'); save(); vib(20);
  const fl = document.createElement('div'); fl.className = 'flash'; f.appendChild(fl); setTimeout(() => fl.remove(), 500);
  const btn = $('.fbtn[data-s="album"]'); if (btn) btn.lastChild.textContent = `앨범 ${v.album.length}`;
  toast(`찰칵! 앨범에 담았어요 (${v.album.length}/${ALBUM_MAX})`);
};
let _gbg = {};
function photoHTML(ph, W, big) {   // 앨범 사진 한 장: 찍은 순간의 마을을 그대로 다시 그려요
  const th = O().theme, k = W / ph.r[2], H = Math.round(ph.r[3] * k), T = GTH[th];
  if (!_gbg[th]) { _gbg[th] = 1; const st = document.createElement('style'); st.textContent = `.gbg-${th}{background-image:url("data:image/svg+xml,${encodeURIComponent(GROUND[th]().replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' class="ground"', ''))}");background-size:${WW}px ${WH}px}`; document.head.appendChild(st); }
  const mode = V.mode, sel = V.sel; V.mode = 'main'; V.sel = [];
  const objs = ph.objs.slice().sort((a, b) => a.y - b.y).map(o => objHTML(o, true).replace('</div>', o.say && big ? `<span class="sayb" style="top:${-(o.t === 'f' ? objSize(o) : 40) - 34}px">${esc(o.say)}</span></div>` : '</div>')).join('');
  V.mode = mode; V.sel = sel;
  const tro = ph.tro >= 0 ? `<div class="obj trophy" style="transform:translate(${GTROPHY.x}px,${GTROPHY.y}px);z-index:${GTROPHY.y}"><span class="in" style="left:-36px;top:-72px;width:72px;height:72px">${stk(TROPHY[ph.tro][0], 72)}</span></div>` : '';
  return `<div class="photo${big ? '' : ' mini'}" style="width:${W}px;height:${H}px;background:linear-gradient(${T.sky} 0 50%,${T.top[2]} 50% 100%)"><div class="world gbg-${th}" style="width:${WW}px;height:${WH}px;transform:translate(${-ph.r[0] * k}px,${-ph.r[1] * k}px) scale(${k})">${gsigns(ZONES[th].z.map(z => z.n))}${tro}${objs}</div></div>`;
}
const photoDay = t => { const d = new Date(t); return `${d.getMonth() + 1}월 ${d.getDate()}일`; };
SCR.album = {
  view() {
    const al = vil().album || [], W = Math.min(250, Math.floor((Math.min(window.innerWidth, 560) - 44 - 10) / 2));
    return `<div class="scr">${topbar('마을 앨범', `<span class="sub tn">${al.length} / ${ALBUM_MAX}</span>`)}
${al.length ? `<div class="albg">${al.map((ph, i) => `<button type="button" class="albc" data-a="photoOpen" data-i="${i}">${photoHTML(ph, W)}<span class="tn" style="font-size:12.5px;color:var(--sub2)">${photoDay(ph.t)}</span></button>`).join('')}</div>` : `<div class="card" style="align-items:center;text-align:center;padding:30px 16px;border-style:dashed;background:transparent"><span class="sub">아직 사진이 없어요.<br>마을에서 지도를 눌러 크게 본 다음<br>사진 찍기를 눌러 보세요</span></div>`}
<button type="button" class="btn sec mta" data-a="albumVil">마을에서 사진 찍기</button></div>`;
  }
};
ACT.albumVil = () => { V.mode = 'full'; V.sel = []; go('vil', {}, { reset: true }); R.stack = [['home', {}]]; };
ACT.photoOpen = d => { const al = vil().album || [], ph = al[+d.i]; if (!ph) return; const W = Math.min(window.innerWidth, 560) - 44, k = Math.min(1, (window.innerHeight * .62) / (ph.r[3] * W / ph.r[2])), w = Math.floor(W * k);
  modal(`<div class="row"><h1 class="sp">${photoDay(ph.t)}</h1><button type="button" class="ibtn" style="width:40px;height:40px" data-a="close" aria-label="닫기">${ico(IC.x, 20)}</button></div><div style="display:flex;justify-content:center">${photoHTML(ph, w, true)}</div>
<div class="row" style="gap:8px"><button type="button" class="btn sec sm f1" data-a="photoDel" data-i="${d.i}">이 사진 지우기</button><button type="button" class="btn sm f1" data-a="close">닫기</button></div>`); };
ACT.photoDel = d => { const al = vil().album || []; al.splice(+d.i, 1); save(); closeModal(true); render(); toast('사진을 지웠어요'); };

// ---------- 상자 ----------
function rollEgg() {
  const v = vil(), t = TH();
  v.eggs++;
  if (v.eggs >= v.rareAt) { v.eggs = 0; v.rareAt = 25 + rnd(11); const r = pickR(t.rare); return { k: r.k, hold: r.hold, rare: r }; }
  return { k: pickR(t.fr) };
}
function openBoxes(kind, n) {
  const o = O(), t = TH(), out = [];
  for (let b = 0; b < n; b++) {
    for (let i = 0; i < 3; i++) {
      if (kind === 'egg') { const r = rollEgg(); const ob = addFriend(r.k, 1, r.hold ? { hold: r.hold } : null); if (Math.random() < .2) ftAdd(ob, pickR(FT_RAND)); out.push({ ob, rare: r.rare }); }
      else { const k = pickR(t.base); out.push({ ob: addObj({ t: 'i', k }) }); }
    }
    if (kind === 'egg') o.eggBox--; else o.itemBox--;
  }
  if (o.inf) { if (o.eggBox < 1) o.eggBox = 20; if (o.itemBox < 1) o.itemBox = 20; }
  save();
  return out;
}
ACT.openBox = d => {
  const o = O(), kind = d.k, have = kind === 'egg' ? o.eggBox : o.itemBox;
  if (!have) return toast(`문제를 ${boxLeft()}개 더 맞히면 상자를 받아요. 상점에서 살 수도 있어요`);
  const room = roomOf(kind);
  if (room < 1) { closeModal(true); if (R.name !== 'vil') go('vil'); return mergeAsk(kind === 'egg' ? 'f' : 'i', kind === 'egg' ? '친구 자리가 꽉 찼어요. 합쳐서 자리를 만들면 알 상자를 열 수 있어요' : '물건 자리가 꽉 찼어요. 합치거나 조합해서 자리를 만들면 물건 상자를 열 수 있어요'); }
  const n = Math.min(have, room);   // 자리가 되는 만큼 한꺼번에 열어요
  const art = itm(kind === 'egg' ? 'eggbox' : 'itembox', 150);
  modal(`<div style="height:230px;display:flex;align-items:center;justify-content:center"><span style="animation:shake .25s 3">${art}</span></div>`, { mid: true, sticky: true });
  setTimeout(() => {
    const res = openBoxes(kind, n);
    const rares = res.filter(r => r.rare);
    const cnt = {}; res.forEach(r => { const key = r.ob.k + (r.ob.hold || ''); (cnt[key] = cnt[key] || { r, n: 0 }).n++; });
    const tiles = Object.values(cnt).map(({ r, n }) => `<div class="tile" style="animation:pop .4s ease-out;${r.rare ? 'background:var(--y);border-style:dashed' : ''}">${r.ob.t === 'f' ? frInner(r.ob, 64, true) : pic(r.ob.k, 64)}<span>${r.ob.t === 'f' ? (n === 1 && r.ob.ts ? `<span style="font-size:12px;color:var(--sub2)">${r.ob.ts}</span><br>` : '') + frName(r.ob) : nameOf(r.ob.k)}</span>${n > 1 ? `<span class="cnt tn">×${n}</span>` : ''}</div>`).join('');
    const left = kind === 'egg' ? o.eggBox : o.itemBox, room2 = roomOf(kind);
    modal(`<h1 style="text-align:center">${rares.length ? '희귀 친구가 태어났어요!' : kind === 'egg' ? '친구가 태어났어요!' : '물건이 나왔어요!'}</h1>${n > 1 ? `<div class="sub" style="text-align:center;margin-top:-6px">상자 ${n}개를 한꺼번에 열었어요</div>` : ''}
${rares.map(r => `<div class="card" style="flex-direction:row;align-items:center;background:var(--stary)">${stk('s_star', 30)}<span style="font-size:15px">"${esc(r.rare.say)}"</span></div>`).join('')}
<div class="grid3">${tiles}</div>
<div class="hint" style="text-align:center">${kind === 'egg' ? '친구들은 마을을 돌아다녀요' : '물건은 어울리는 구역에 자리를 잡아요'}</div>
${left && !o.inf ? `<div class="hint" style="text-align:center">상자가 ${left}개 남았어요. 자리가 생기면 마저 열 수 있어요</div>` : ''}
${mergeable() ? `<button type="button" class="btn sm" style="font-size:16px;background:var(--y)" data-a="closeMerge">합칠 수 있는 게 생겼어요 · 합칠까요?</button>` : ''}
<button type="button" class="btn${mergeable() ? ' sec' : ''}" data-a="closeVil">마을에 놓기</button>`, { mid: true, onClose: () => { if (R.name === 'vil') render(); } });
  }, 800);
};
ACT.closeVil = () => { closeModal(true); if (R.name === 'vil') render(); else go('vil', {}, { reset: true }); };
ACT.closeMerge = () => { closeModal(true); V.mode = 'main'; V.sel = []; if (R.name === 'vil') render(); else go('vil'); mergeAsk(); };

// ---------- 도감 별: 이미 만든 물건을 또 만들면 별이 하나씩 늘고, 다섯 번째에는 다이아몬드가 돼요 ----------
const madeN = k => { const v = vil(); return v.found[k] ? Math.max(1, (v.made && v.made[k]) || 1) : 0; };
const madeUp = k => { const v = vil(); v.made = v.made || {}; v.made[k] = (v.found[k] ? Math.max(1, v.made[k] || 1) : 0) + 1; v.found[k] = 1; return v.made[k]; };
const mstar = (sz, on) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? 2.7 : 6; d += (i ? 'L' : 'M') + f1(7 + Math.cos(a) * q) + ' ' + f1(7.4 + Math.sin(a) * q); } return `<svg width="${sz}" height="${sz}" viewBox="0 0 14 14" aria-hidden="true"><path d="${d}Z" fill="${on ? '#FFD95A' : 'none'}" stroke="${INK}" stroke-width="${on ? 1.1 : .9}" stroke-linejoin="round" opacity="${on ? 1 : .35}"/></svg>`; };
const gem = sz => `<svg width="${sz}" height="${sz}" viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 3h9l4 5-8.5 9.5L1.5 8Z" fill="#8FD8FF" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M1.5 8h17M5.5 3l2 5 2.5 9.5 2.5-9.5 2-5M7.5 8l2.5-5 2.5 5" fill="none" stroke="${INK}" stroke-width=".9" stroke-linejoin="round" opacity=".55"/><path d="M5.9 3.8 3.3 7.2h3.6Z" fill="#FFFDF6" opacity=".85"/></svg>`;
const madeRow = (k, sz) => { const n = madeN(k); if (!n) return ''; return n >= 5 ? `<span class="mrow dia" aria-label="다이아몬드">${gem(sz + 5)}</span>` : `<span class="mrow" aria-label="별 ${n}개">${[1, 2, 3, 4, 5].map(i => mstar(sz, i <= n)).join('')}</span>`; };
// ---------- 합치기 ----------
function mergeKind(ids) {
  const os = ids.map(getObj); if (os.length !== 3 || os.some(o => !o)) return null;
  if (os.every(o => o.t === 'f' && !o.m && !o.hold && o.lv === os[0].lv && o.lv < 5)) return 'f';
  if (os.every(o => o.t === 'f' && o.hold && o.hold === os[0].hold && o.k === os[0].k && (o.st || 1) === (os[0].st || 1)) && (os[0].st || 1) < 5) return 'r';   // 같은 희귀 친구 셋 → 별 하나 더
  if (os.every(o => o.t === 'i' && o.k === os[0].k && TH().lines[o.k])) return 'i';
  return null;
}
function mergeDo(ids) {
  const v = vil(), t = TH(), kind = mergeKind(ids); if (!kind) return null;
  const a = getObj(ids[0]); let bonus = null;
  removeObj(ids[1]); removeObj(ids[2]);
  if (kind === 'f') {
    a.lv++; v.seen['lv' + a.lv + ':' + a.k] = 1; if (a.lv >= 5) v.seen.lv5 = 1;
    if (a.lv === 3) ftAdd(a, '듬직한'); if (a.lv === 5) { ftAdd(a, '전설의'); a.ts = '전설의'; }
    v.merges++;
    if (v.merges >= v.mysAt) { v.merges = 0; v.mysAt = 125 + rnd(51); const cand = t.mys.filter(k => !v.seen['m:' + k]); bonus = addFriend(pickR(cand.length ? cand : t.mys), 1, { m: 1 }, { x: a.x, y: a.y }); }
  } else if (kind === 'r') {
    a.st = (a.st || 1) + 1;
  } else {
    a.k = t.lines[a.k]; if (!t.lines[a.k]) { bump('gold'); v.seen['g:' + a.k] = 1; }
    if (allRecs().some(r => r.out === a.k)) madeUp(a.k);
  }
  bump('merge'); { const h = histToday(); h.mg = (h.mg || 0) + 1; }
  return { a, kind, bonus };
}
function mysteryModal(f) {
  modal(`<h1 style="text-align:center">미스터리 친구가 나타났어요!</h1><div style="display:flex;justify-content:center;padding:14px 0">${frInner(f, 130, true)}</div><div class="d" style="text-align:center;font-size:22px">${DT.myn[f.k]}</div><div class="hint" style="text-align:center">합치다 보면 아주 가끔 찾아오는 특별한 친구예요</div><button type="button" class="btn" data-a="close">반가워!</button>`, { mid: true });
}
const mergeMsg = r => r.kind === 'f' ? `${josa(frName(r.a), '이', '가')} ${DT.lvn[r.a.lv - 1]}로 자랐어요!` : r.kind === 'r' ? `${josa(frName(r.a), '이', '가')} 됐어요!` : `${josa(nameOf(r.a.k), '이', '가')} 됐어요!`;
ACT.doMerge = () => {
  const r = mergeDo(V.sel); if (!r) return;
  V.sel = []; V.pop = r.a.id; vib(25); save(); render();
  if (r.bonus) mysteryModal(r.bonus);
  else if (r.kind === 'i') toast(mergeMsg(r));
  else growModal(r);
};
// 직접 골라 합친 친구가 자라면 반응 창을 띄워요
const GROW = ['쑥쑥 컸어!', '나 좀 봐!', '키가 커졌어!', '고마워, 더 힘낼게!', '우아, 달라졌지?'];
function growModal(r) {
  const f = r.a, star = r.kind === 'r';
  modal(`<h1 style="text-align:center">${star ? '별이 하나 늘었어요!' : '친구가 자랐어요!'}</h1>
<div class="react"><span class="sayb" style="position:relative;left:auto;top:auto;transform:none">${pickR(GROW)}</span><div class="who hopbig">${frInner(f, 118, true)}</div>${[10, 28, 70, 88].map((x, i) => `<i class="cf" style="left:${x}%;animation-delay:${i * 110}ms">${i % 2 ? gheartI(16) : star5(17)}</i>`).join('')}</div>
<div class="d" style="font-size:21px;text-align:center">${esc(frName(f))}</div>
<div style="display:flex;justify-content:center"><span class="chip ln d" style="font-size:15px;background:var(--stary);padding:2px 12px 4px">${star ? `${f.st}성 희귀 친구` : `${lvStep(f.lv - 1)} → ${lvStep(f.lv)}`}</span></div>
<div class="hint" style="text-align:center">${star ? '같은 희귀 친구 셋이 모여 더 빛나요' : f.lv >= 5 ? '끝까지 다 자란 전설 친구예요' : '같은 단계 친구 셋이 또 모이면 한 번 더 자라요'}</div>
<button type="button" class="btn" data-a="close">좋아요</button>`, { mid: true, onClose: () => afterChecks(200) });
}
ACT.mergeAll = () => { const a = mergeAllKind('f'), b = mergeAllKind('i'); V.sel = []; save(); render(); if (a.bonus || b.bonus) mysteryModal(a.bonus || b.bonus); else toast(a.n + b.n ? `친구 ${a.n}번, 물건 ${b.n}번 합쳤어요` : '지금은 합칠 수 있는 것이 없어요'); };

// ---------- 조합 ----------
let _recs = null, _recTh = null;
function allRecs() {
  const th = O().theme; if (_recTh === th) return _recs;
  const t = TH(); _recs = []; _recTh = th;
  t.sets.forEach((s, si) => s.recs.forEach(r => _recs.push(Object.assign({ set: si, hid: false, key: r.in.slice().sort().join('|'), same: new Set(r.in).size === 1 }, r))));
  t.hidden.forEach((s, si) => s.recs.forEach(r => _recs.push(Object.assign({ set: si, hid: true, key: r.in.slice().sort().join('|'), same: false }, r))));
  return _recs;
}
ACT.doMix = () => {
  const v = vil(), os = V.sel.map(getObj); if (os.length !== 3) return;
  const key = os.map(o => o.k).sort().join('|');
  const rec = allRecs().find(r => r.key === key && !r.same);
  if (!rec) {
    V.sel = [];
    render();
    return modal(`<h1 style="text-align:center">아무 일도 일어나지 않았어요</h1><div class="row" style="justify-content:center;gap:8px;padding:8px 0">${os.map(o => pic(o.k, 56)).join('')}</div><div class="hint" style="text-align:center;font-size:14.5px">물건은 그대로 마을에 있어요.<br>다른 물건으로 다시 해 봐요</div><button type="button" class="btn" data-a="close">다시 해 볼게요</button>`, { mid: true });
  }
  const first = !v.found[rec.out], at = null;
  os.forEach(o => removeObj(o.id));
  const nw = addObj({ t: 'i', k: rec.out }, at);
  const mn = madeUp(rec.out); if (first) { const h = histToday(); h.nr = h.nr || []; if (h.nr.length < 6) h.nr.push(rec.name); } V.sel = []; V.pop = nw.id; vib(mn === 5 ? 60 : 30); save(); render();
  modal(`<h1 style="text-align:center">${first ? (rec.hid ? '미스터리 물건을 찾았어요!' : '새 물건을 만들었어요!') : mn === 5 ? '다이아몬드를 달았어요!' : '조합 성공!'}</h1>
<div style="display:flex;justify-content:center;padding:10px 0;position:relative"><span class="${mn >= 5 ? 'diapic' : ''}" style="animation:pop .45s ease-out">${pic(rec.out, 130)}</span></div>
<div class="d" style="text-align:center;font-size:22px">${rec.name}</div>
<div style="display:flex;justify-content:center">${madeRow(rec.out, 22)}</div>
<div class="hint" style="text-align:center">${first ? (rec.hid ? '미스터리 도감에 올랐어요' : '조합 도감에 올랐어요') + ' · 또 만들면 별이 늘어요' : mn === 5 ? '다섯 번 만들어서 도감 칸이 반짝반짝 빛나요' : mn < 5 ? `도감에 별이 하나 늘었어요 · ${5 - mn}번 더 만들면 다이아몬드` : `모두 ${mn}번 만들었어요`}</div>
<div class="row" style="gap:8px"><button type="button" class="btn sec f1" data-a="go2" data-s="book2">도감 보기</button><button type="button" class="btn f1" data-a="close">좋아요</button></div>`, { mid: true });
};
ACT.go2 = d => { closeModal(true); go(d.s); };

// ---------- 조합 칸 도우미: 올린 물건으로 무슨 일이 일어날지 미리 알려 줘요 ----------
function mixInfo() {
  const keys = V.sel.map(id => { const o = getObj(id); return o && o.k; }).filter(Boolean), v = vil();
  if (!keys.length) return { n: 0, known: [], mys: false, none: false, exact: null };
  const has = r => { const need = r.in.slice(); return keys.every(k => { const i = need.indexOf(k); if (i < 0) return false; need.splice(i, 1); return true; }); };
  const recs = allRecs().filter(r => !r.same && has(r));
  const can = r => recIds(r, V.sel) ? 0 : 1;
  const known = recs.filter(r => !r.hid || v.found[r.out]).sort((a, b) => can(a) - can(b) || (v.found[a.out] ? 1 : 0) - (v.found[b.out] ? 1 : 0));
  return { n: keys.length, known, mys: recs.some(r => r.hid && !v.found[r.out]), none: !recs.length, exact: keys.length === 3 ? recs[0] || null : null };
}
// 조합 재료 세 개를 마을에 있는 물건에서 찾아요 (이미 올린 것부터). 모자라면 null
function recIds(r, prefer) {
  const pool = vil().objs.filter(o => o.t === 'i'), pre = (prefer || []).map(getObj).filter(Boolean), ids = [];
  for (const k of r.in) { const o = pre.find(o => o.k === k && !ids.includes(o.id)) || pool.find(o => o.k === k && !ids.includes(o.id)); if (!o) return null; ids.push(o.id); }
  return ids;
}
function recChip(r) {
  const v = vil(), on = v.found[r.out], ok = !!recIds(r, V.sel);
  return `<button type="button" class="recchip${ok ? '' : ' no'}" data-a="mixFill" data-out="${r.out}">${r.in.map(k => pic(k, 32, 'pl')).join('<i>+</i>')}<i>=</i>${pic(r.out, 34, on ? 'pl' : 'sil')}<span>${on ? r.name : '?'}</span>${ok ? '' : '<em>재료 모자람</em>'}</button>`;
}
function mixTop() {
  if (V.mode !== 'mix') return '';
  const mi = mixInfo(); if (!mi.n || mi.n === 3 || !mi.known.length) return '';
  return `<div class="mixtop"><span class="d" style="font-size:13.5px">이런 조합이 있어요 · 누르면 칸에 올라가요</span><div class="recs">${mi.known.slice(0, 3).map(recChip).join('')}</div>${mi.known.length > 3 ? `<span style="font-size:12px;color:var(--sub)">이 밖에 ${mi.known.length - 3}개가 더 있어요 · 도감에서 볼 수 있어요</span>` : ''}</div>`;
}
ACT.mixClear = () => { V.sel = []; render(); };
ACT.mixAdd = d => { if (V.sel.length >= 3) return toast('세 개까지만 올릴 수 있어요'); const ob = vil().objs.find(x => x.t === 'i' && x.k === d.k && !V.sel.includes(x.id)); if (ob) { V.sel.push(ob.id); render(); } };
ACT.mixRm = d => { V.sel.splice(+d.i, 1); render(); };
ACT.mixFill = d => {
  const r = allRecs().find(r => r.out === d.out); if (!r) return;
  const ids = recIds(r, V.mode === 'mix' ? V.sel : []);
  if (!ids) { const miss = r.in.filter((k, i) => vil().objs.filter(o => o.t === 'i' && o.k === k).length < r.in.slice(0, i + 1).filter(x => x === k).length); return toast(`마을에 ${josa(nameOf(miss[0] || r.in[0]), '이', '가')} 모자라요`); }
  closeModal(true);
  if (R.name !== 'vil') { go('vil', {}, { reset: true }); R.stack = [['home', {}]]; }
  V.mode = 'mix'; V.sel = ids; render();
};
ACT.recOpen = d => {
  const r = allRecs().find(r => r.out === d.out), v = vil(); if (!r) return;
  const on = v.found[r.out], cnt = k => v.objs.filter(o => o.t === 'i' && o.k === k).length, ok = !!recIds(r, []);
  const mn = madeN(r.out);
  modal(`<div style="display:flex;justify-content:center;padding:4px 0"><span class="${mn >= 5 ? 'diapic' : ''}">${pic(r.out, 110, on ? '' : 'sil')}</span></div><div class="d" style="text-align:center;font-size:22px">${on ? r.name : '아직 못 만든 물건'}</div>
${on ? `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">${madeRow(r.out, 20)}<span style="font-size:12.5px;color:var(--sub2)">${mn >= 5 ? `${mn}번 만들었어요 · 다이아몬드` : `${mn}번 만들었어요 · ${5 - mn}번 더 만들면 다이아몬드`}</span></div>` : ''}
<div class="row" style="gap:8px">${r.in.map(k => { const n = cnt(k); return `<div class="tile" style="flex:1 1 0;padding:8px 4px;gap:2px;${n ? '' : 'border-style:dashed'}">${pic(k, 48, n ? '' : 'sil')}<span style="font-size:13px">${nameOf(k)}</span><span style="font-size:12px;color:${n ? 'var(--sub2)' : '#B5533C'}">${n ? `마을에 ${n}개` : '마을에 없어요'}</span></div>`; }).join('')}</div>
<div class="hint" style="text-align:center">${ok ? '재료가 다 있어요. 조합 칸에 바로 올릴 수 있어요' : '재료가 모자라요. 물건 상자를 열거나 합쳐서 모아요'}</div>
<div class="row" style="gap:8px"><button type="button" class="btn sec f1" data-a="close">닫기</button><button type="button" class="btn" style="flex:1.8 1 0;font-size:17.5px;white-space:nowrap;padding:0 6px 3px" data-a="mixFill" data-out="${r.out}" ${ok ? '' : 'disabled'}>조합 칸에 올리기</button></div>`, { mid: true });
};

// ---------- 합칠까요? (친구 합치기 · 물건 합치기) ----------
function mergeGroups() {
  const v = vil(), t = TH(), F = [], I = [];
  const worth = o => (o.nm ? 4 : 0) + (o.acc ? 2 : 0) + (o.seat ? 2 : 0) + ((o.tt || []).length ? 1 : 0);
  for (let lv = 1; lv < 5; lv++) {
    const fs = v.objs.filter(o => o.t === 'f' && !o.m && !o.hold && o.lv === lv).sort((a, b) => worth(b) - worth(a) || a.id - b.id);
    if (fs.length >= 3) F.push({ lv, n: fs.length, ids: [fs[0].id, fs[fs.length - 1].id, fs[fs.length - 2].id] });   // 이름을 지어 줬거나 꾸민 친구가 남아서 자라요
  }
  const rb = {}; v.objs.forEach(o => { if (o.t === 'f' && o.hold && (o.st || 1) < 5) { const k = o.k + o.hold + (o.st || 1); (rb[k] = rb[k] || []).push(o); } });
  for (const k in rb) if (rb[k].length >= 3) { const fs = rb[k].sort((a, b) => worth(b) - worth(a) || a.id - b.id); F.push({ rare: 1, st: fs[0].st || 1, n: fs.length, ids: [fs[0].id, fs[fs.length - 1].id, fs[fs.length - 2].id] }); }
  const by = {}; v.objs.forEach(o => { if (o.t === 'i' && t.lines[o.k]) (by[o.k] = by[o.k] || []).push(o.id); });
  for (const k in by) if (by[k].length >= 3) I.push({ k, out: t.lines[k], n: by[k].length, ids: by[k].slice(0, 3) });
  return { F, I };
}
function mergeAllKind(kind) { let n = 0, bonus = null; for (;;) { const g = mergeGroups()[kind === 'f' ? 'F' : 'I'][0]; if (!g) break; const r = mergeDo(g.ids); if (!r) break; if (r.bonus) bonus = r.bonus; n++; } return { n, bonus }; }
const lvStep = lv => DT.lvn[lv - 1].replace(' 친구', '') + ' 단계';   // '아기 단계', '어린이 단계' …
function mergeAsk(tab, note) {
  const { F, I } = mergeGroups(); tab = tab || (F.length || !I.length ? 'f' : 'i');
  const AR = `<span class="d" style="font-size:20px;flex:none">→</span>`, PL = `<span class="d" style="font-size:15px;flex:none;margin:0 -2px">+</span>`;
  const row = (left, out, t1, t2, i) => `<div class="card" style="gap:6px;padding:10px 12px;border-radius:20px"><div class="row" style="gap:6px;justify-content:center">${left}${AR}<span class="mgout">${out}</span></div><div class="row" style="gap:8px"><div class="sp" style="display:flex;flex-direction:column;min-width:0"><span class="d" style="font-size:16px">${t1}</span><span style="font-size:12.5px;color:var(--sub)">${t2}</span></div><button type="button" class="btn sm" style="height:42px;padding:0 16px 3px;font-size:16px" data-a="mgOne" data-k="${tab}" data-i="${i}">합치기</button></div></div>`;
  const rows = tab === 'f'
    ? F.map((g, i) => { const os = g.ids.map(getObj); if (g.rare) return row(os.map(o => frInner(Object.assign({}, o, { seat: null }), 40, true)).join(PL), frInner(Object.assign({}, os[0], { seat: null, st: g.st + 1 }), 54, true), `${g.st}성 희귀 친구 셋 → ${g.st + 1}성 희귀 친구 하나`, `${esc(josa(frName(os[0]), '이', '가'))} 별을 하나 더 얻어요 · ${g.n}마리 있어요`, i); return row(os.map(o => frInner(Object.assign({}, o, { seat: null }), 40, true)).join(PL), frInner(Object.assign({}, os[0], { seat: null, lv: g.lv + 1 }), 54, true), `${lvStep(g.lv)} 친구 셋 → ${lvStep(g.lv + 1)} 친구 하나`, `${esc(josa(frName(os[0]), '이', '가'))} 자라요 · ${lvStep(g.lv)} 친구 ${g.n}마리 있어요`, i); }).join('')
    : I.map((g, i) => row([0, 1, 2].map(() => pic(g.k, 40)).join(PL), pic(g.out, 54), `${nameOf(g.k)} 셋 → ${nameOf(g.out)} 하나`, `${nameOf(g.k)} ${g.n}개 있어요`, i)).join('');
  const none = `<div class="card" style="align-items:center;text-align:center;padding:22px 14px;border-style:dashed;background:transparent"><span class="sub">${tab === 'f' ? '지금은 합칠 친구가 없어요.<br>같은 단계 친구 셋이 모이면 합칠 수 있어요' : '지금은 합칠 물건이 없어요.<br>같은 물건 셋이 모이면 합칠 수 있어요'}</span></div>`;
  const cnt = tab === 'f' ? F.length : I.length;
  modal(`<div class="row"><h1 class="sp">합칠까요?</h1><button type="button" class="ibtn" style="width:40px;height:40px" data-a="close" aria-label="닫기">${ico(IC.x, 20)}</button></div>
${note ? `<div class="mixmsg" style="background:var(--t3)">${ico(IC.bulb, 16, 2.6)}<span>${note}</span></div>` : ''}${seg('mgTab', [['f', `친구 (${cntF()}/${MAXF})`], ['i', `물건 (${cntI()}/${MAXI})`]], tab, 'sm')}
<div class="hint">${tab === 'f' ? '같은 단계 친구 셋이 모이면 한 단계 자라요. 종류가 달라도 돼요.<br>희귀 친구는 같은 친구 셋이 모이면 별이 하나 늘어요' : '같은 물건 셋을 합치면 오른쪽 물건이 돼요.<br>합칠 때마다 자리가 두 개씩 생겨요'}</div>
${rows || none}
<div class="row" style="gap:8px"><button type="button" class="btn sec sm f1" style="font-size:15.5px" data-a="mgPick" data-k="${tab}">직접 고르기</button><button type="button" class="btn sm" style="flex:1.5 1 0;font-size:16.5px" data-a="mgAll" data-k="${tab}" ${cnt ? '' : 'disabled'}>${tab === 'f' ? '친구' : '물건'} 모두 합치기</button></div>`);
}
ACT.mergeAsk = () => mergeAsk();
ACT.mgTab = d => { closeModal(true); if (_lastM) _lastM.top = 0; mergeAsk(d.v); };   // 탭을 바꾸면 맨 위부터
ACT.mgOne = d => {
  const g = mergeGroups()[d.k === 'f' ? 'F' : 'I'][+d.i]; if (!g) return;
  const r = mergeDo(g.ids); if (!r) return;
  V.pop = r.a.id; vib(25); save(); closeModal(true); render();
  if (r.bonus) return mysteryModal(r.bonus);
  mergeAsk(d.k);
  toast(mergeMsg(r));
};
ACT.mgAll = d => {
  const r = mergeAllKind(d.k); V.sel = []; save(); vib(25); closeModal(true); render();
  if (r.bonus) return mysteryModal(r.bonus);
  toast(r.n ? `${d.k === 'f' ? '친구' : '물건'}를 ${r.n}번 합쳤어요`.replace('물건를', '물건을') : '지금은 합칠 수 있는 것이 없어요');
};
ACT.mgPick = d => { closeModal(true); V.mode = 'merge'; V.mk = d.k; V.sel = []; render(); };

// ---------- 도감 · 컬렉션 ----------
// ---------- 마을 완성도: 어려운 칸일수록 점수가 커요. 단어장 하나를 끝내면 80%쯤 되도록 맞췄어요 ----------
function vilScore(v, t) {
  v = v || vil(); t = t || TH(); const s = v.seen, c = f => t.fr.filter(f).length, gk = [...new Set(Object.values(t.lines).filter(k => !t.lines[k]))], hk = [...new Set(t.homes.concat(t.rides).map(x => x.k))];
  const rec = t.sets.reduce((a, x) => a + x.recs.filter(r => v.found[r.out]).length, 0), recM = t.sets.reduce((a, x) => a + x.recs.length, 0);
  const hid = t.hidden.reduce((a, x) => a + x.recs.filter(r => v.found[r.out]).length, 0), hidM = t.hidden.reduce((a, x) => a + x.recs.length, 0);
  const lv = [c(k => s['f:' + k]), c(k => s['lv2:' + k]), c(k => s['lv3:' + k]), c(k => s['lv4:' + k]), c(k => s['lv5:' + k])], LW = [1, 1, 2, 3, 5];
  const ra = t.rare.filter(r => s['r:' + r.k + r.hold]).length, my = t.mys.filter(k => s['m:' + k]).length;
  const parts = [
    { n: '조합 도감', pt: rec, max: recM, d: `${rec} / ${recM}개` },
    { n: '미스터리 조합', pt: hid * 2, max: hidM * 2, d: `${hid} / ${hidM}개` },
    { n: '친구 키우기', pt: lv.reduce((a, x, i) => a + x * LW[i], 0), max: t.fr.length * 12, d: `전설까지 키운 친구 ${lv[4]} / ${t.fr.length}종` },
    { n: '특별한 친구', pt: ra * 3 + my * 6, max: t.rare.length * 3 + t.mys.length * 6, d: `희귀 ${ra} / ${t.rare.length} · 미스터리 ${my} / ${t.mys.length}` },
    { n: '황금 물건', pt: gk.filter(k => s['g:' + k]).length * 4, max: gk.length * 4, d: `${gk.filter(k => s['g:' + k]).length} / ${gk.length}개` },
    { n: '집과 탈것', pt: hk.filter(k => s['h:' + k]).length * 2, max: hk.length * 2, d: `${hk.filter(k => s['h:' + k]).length} / ${hk.length}개` }];
  const pt = parts.reduce((a, p) => a + p.pt, 0), max = parts.reduce((a, p) => a + p.max, 0);
  return { parts, pt, max, pct: Math.floor(pt / max * 100) };
}
const pctPill = () => `<button type="button" class="pill kc d tn" data-a="vPct" aria-label="마을 완성도" style="height:30px;padding:0 9px 1px;font-size:14px;background:var(--stary);white-space:nowrap">완성 ${vilScore().pct}%</button>`;
function scoreView() {
  const sc = vilScore(), bg = ['--t0', '--t3', '--t2', '--stary', '--t1', '--mainPale'];
  return `<div class="card" style="gap:10px;padding:16px;border-radius:24px;background:var(--stary)"><div class="row" style="align-items:baseline"><h2 class="sp" style="font-size:21px">마을 완성도</h2><span class="d tn" style="font-size:34px">${sc.pct}%</span></div><div class="bar" style="height:14px"><i style="width:${sc.pct}%"></i></div></div>
${sc.parts.map((p, i) => `<div class="card" style="gap:6px;padding:12px 14px;border-radius:20px;background:var(${bg[i % bg.length]})"><div class="row" style="align-items:baseline;gap:6px"><span class="d sp" style="font-size:18px">${p.n}</span><span style="font-size:13px;color:var(--sub2)">${p.d}</span><span class="d tn" style="font-size:18px;min-width:44px;text-align:right">${Math.floor(p.pt / p.max * 100)}%</span></div><div class="bar" style="height:9px"><i style="width:${Math.min(100, p.pt / p.max * 100)}%"></i></div></div>`).join('')}`;
}
ACT.vPct = () => go('book2', { tab: 'score' });
// ---------- 마을 여러 개: 단어장을 하나 시작할 때마다 마을을 하나 더 열 수 있어요. 별·상자·칭호는 같이 써요 ----------
const townCount = () => 1 + (O().towns || []).length;
const townRoom = () => O().used.length - townCount();
function townReset() { V.cam = null; V.rt = {}; V.sel = []; V.mode = 'main'; V.giftAt = null; _recTh = null; applyTheme(O().theme); save(); }
const townCarry = (from, to) => { to.cards = from.cards || {}; to.chal = from.chal || { k: '', n: 0 }; to.chalT = (to.chalT || 0) + (from.chalT || 0); from.chalT = 0; from.cards = {}; };   // 도움 카드와 오늘 도전 횟수는 주인을 따라가요
function townSwap(i) { const o = O(), tw = o.towns[i]; if (!tw) return; townCarry(o.vil, tw.vil); o.towns[i] = { theme: o.theme, vil: o.vil }; o.theme = tw.theme; o.vil = tw.vil; townReset(); }
function townNew(theme) { const o = O(), nv = newVil(); o.towns = o.towns || []; townCarry(o.vil, nv); o.towns.push({ theme: o.theme, vil: o.vil }); o.theme = theme; o.vil = nv; townReset(); }
function townsModal() {
  const o = O(), room = townRoom();
  const row = (th, v, i) => { const t = DT.themes[th], cur = i < 0, fr = v.objs.filter(x => x.t === 'f').length, it = v.objs.filter(x => x.t === 'i').length;
    return `<div class="card" style="flex-direction:row;align-items:center;gap:10px;padding:10px 12px;border-radius:20px;background:${t.col.mainPale};${cur ? 'box-shadow:0 0 0 3px var(--ink)' : ''}">${stk(t.fr[0], 48)}<span style="display:flex;flex-direction:column;gap:1px;min-width:0;flex:1 1 0"><span class="d" style="font-size:18px">${t.name}</span><span style="font-size:12.5px;color:var(--sub2)">완성 ${vilScore(v, t).pct}% · 친구 ${fr} · 물건 ${it}</span></span>${cur ? '<span class="chip ln" style="background:var(--paper)">지금 여기</span>' : `<button type="button" class="btn sm" style="height:40px;padding:0 14px 3px;font-size:15px" data-a="townGo" data-i="${i}">가기</button>`}</div>`; };
  modal(`<h1>내 마을</h1>${row(o.theme, o.vil, -1)}${o.towns.map((tw, i) => row(tw.theme, tw.vil, i)).join('')}
${room > 0 ? `<button type="button" class="btn" data-a="townPick">새 마을 열기</button>` : `<div class="hint" style="text-align:center">새 단어장을 시작하면 마을을 하나 더 열 수 있어요<br>단어장은 홈의 설정에서 바꿔요</div>`}
<div class="hint" style="text-align:center;color:var(--sub2)">별과 상자, 칭호, 도움 카드는 모든 마을에서 같이 써요</div><button type="button" class="btn sec sm" data-a="close">닫기</button>`);
}
function townPickModal(sel) {
  const o = O(), have = [o.theme].concat(o.towns.map(x => x.theme)); V.tpick = sel || V.tpick || ['dino', 'chara', 'animal'].find(k => !have.includes(k)) || 'dino';
  modal(`<h1>새 마을 열기</h1><div class="hint">마을마다 친구와 물건이 달라요.<br>지금 마을은 그대로 남아 있어서 언제든 돌아올 수 있어요</div>
${['dino', 'chara', 'animal'].map(k => { const t = DT.themes[k]; return `<button type="button" class="card kc" style="flex-direction:row;align-items:center;gap:10px;text-align:left;padding:10px 12px 13px;border-radius:20px;background:${t.col.mainPale};${V.tpick === k ? 'box-shadow:0 0 0 3px var(--ink),0 5px 0 rgba(74,65,56,.22)' : ''}" data-a="townSel" data-k="${k}"><span class="row" style="gap:0">${stk(t.fr[1], 48, '', true)}${stk(t.fr[0], 40)}</span><span style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="d" style="font-size:18px">${t.name}${have.includes(k) ? ' <span style="font-size:12px;color:var(--sub2)">· 이미 있어요</span>' : ''}</span><span style="font-size:12.5px;color:var(--sub2)">${t.mood}</span></span></button>`; }).join('')}
<div class="row" style="gap:8px"><button type="button" class="btn sec f1" data-a="close">나중에</button><button type="button" class="btn" style="flex:1.5 1 0" data-a="townMake">이 마을 열기</button></div>`);
}
ACT.towns = () => townsModal();
ACT.townGo = d => { closeModal(true); townSwap(+d.i); go('vil', {}, { reset: true }); toast(`${TH().name}에 왔어요`); };
ACT.townPick = () => { if (townRoom() < 1) return toast('새 단어장을 시작하면 마을을 하나 더 열 수 있어요'); closeModal(true); V.tpick = null; townPickModal(); };
ACT.townSel = d => { closeModal(true); townPickModal(d.k); };
ACT.townMake = () => { if (townRoom() < 1) return; closeModal(true); townNew(V.tpick); V.tpick = null; go('vil', {}, { reset: true }); toast(`${josa(TH().name, '을', '를')} 열었어요 · 상자를 열어 친구를 맞이해요`); };
function collList() {
  const v = vil(), t = TH(), L = [];
  t.sets.forEach((s, i) => L.push({ id: 's' + i, name: s.name, star: s.star, n: s.recs.filter(r => v.found[r.out]).length, m: 5, pics: s.recs.map(r => [r.out, !!v.found[r.out]]) }));
  L.push({ id: 'fr10', name: '기본 친구 열 마리', star: 80, n: t.fr.filter(k => v.seen['f:' + k]).length, m: 10, pics: t.fr.map(k => ['@' + k, !!v.seen['f:' + k]]), small: 1 });
  L.push({ id: 'lv2', name: '어린이 친구 다섯 마리', star: 60, n: Math.min(5, t.fr.filter(k => v.seen['lv2:' + k]).length), m: 5, pics: t.fr.filter(k => v.seen['lv2:' + k]).concat(t.fr.filter(k => !v.seen['lv2:' + k])).slice(0, 5).map(k => ['@' + k, !!v.seen['lv2:' + k]]) });
  L.push({ id: 'rare', name: '희귀 친구 네 마리', star: 100, n: t.rare.filter(r => v.seen['r:' + r.k + r.hold]).length, m: 4, pics: t.rare.map(r => ['@' + r.k, !!v.seen['r:' + r.k + r.hold]]) });
  L.push({ id: 'lv5', name: '전설 친구 만들기', star: 100, n: v.seen.lv5 ? 1 : 0, m: 1, pics: [['@' + t.hero, !!v.seen.lv5]], text: '친구 한 마리를 5단계까지 키워요' });
  L.push({ id: 'mys', name: '미스터리 친구 세 마리', star: 150, n: t.mys.filter(k => v.seen['m:' + k]).length, m: 3, pics: t.mys.map(k => ['@' + k, !!v.seen['m:' + k]]) });
  const H = t.hidden.map((s, i) => ({ id: 'h' + i, name: s.name, star: 100, n: s.recs.filter(r => v.found[r.out]).length, m: 5, pics: s.recs.map(r => [r.out, !!v.found[r.out]]), hid: 1 }));
  const all = t.hidden.reduce((a, s) => a + s.recs.filter(r => v.found[r.out]).length, 0);
  H.push({ id: 'h4', name: '미스터리 박사', star: 200, n: all, m: 20, pics: [], hid: 1, text: '미스터리 물건 스무 개를 모두 찾아요', need: 10 });
  return { L, H };
}
function collCard(c) {
  const v = vil(), done = v.claimed[c.id], ready = c.n >= c.m && !done;
  if (c.hid && c.n < (c.need || 1)) return `<div class="dark row">${ico(IC.lock, 20, 2.4, '#FFFDF6')}<span class="d" style="font-size:18px">? ? ?</span><span style="font-size:13px;margin-left:auto">무엇을 모으는지는 비밀이에요</span></div>`;
  const th = c.pics.map(([k, on]) => on ? pic(k, c.small ? 28 : 48) : (c.hid ? `<span class="d" style="width:44px;height:44px;border-radius:14px;border:2px dashed var(--ink);display:flex;align-items:center;justify-content:center;font-size:20px">?</span>` : pic(k, c.small ? 28 : 48, 'sil'))).join('');
  return `<div class="card" style="gap:8px;padding:12px;border-radius:22px;${ready ? 'background:var(--y)' : ''}"><div class="row" style="gap:8px"><h2 class="sp">${c.name}</h2><span class="row d" style="gap:2px;padding:1px 9px 1px 4px;border-radius:12px;border:1.5px solid var(--ink);background:var(--paper);font-size:15px">${stk('s_star', 20)}${c.star}</span></div>
<div class="row" style="justify-content:space-between;min-height:${c.small ? 30 : 48}px">${th}${c.text ? `<span class="sub" style="margin-left:8px;margin-right:auto">${c.text}</span>` : ''}</div>
<div class="row"><div class="bar" style="flex:1 1 0;height:8px"><i style="width:${Math.round(c.n / c.m * 100)}%"></i></div><span class="tn" style="font-size:13px">${c.n} / ${c.m}</span></div>
${ready ? `<button type="button" class="btn sm" data-a="claim" data-id="${c.id}" data-n="${c.star}">${stk('s_star', 24)}별 ${c.star}개 받기</button>` : done ? `<div class="row sub" style="justify-content:center;gap:6px">${ico(IC.check, 16, 3)}별 ${c.star}개를 받았어요</div>` : ''}</div>`;
}
ACT.claim = d => { const v = vil(); if (v.claimed[d.id]) return; v.claimed[d.id] = 1; addStars(+d.n); save(); vib(30); render(); toast(`별 ${d.n}개를 받았어요!`); };
SCR.book2 = {
  view(p) {
    const v = vil(), t = TH(), tab = p.tab || 'book';
    const head = topbar(tab === 'book' ? '조합 도감' : tab === 'coll' ? '컬렉션' : '마을 완성도', starPill()) + seg('bkTab', [['book', '조합 도감'], ['coll', '컬렉션'], ['score', '완성도']], tab);
    if (tab === 'score') return `<div class="scr" style="gap:10px">${head}${scoreView()}</div>`;
    if (tab === 'coll') {
      const { L, H } = collList(), rev = H.filter(c => c.n >= (c.need || 1)).length;
      return `<div class="scr" style="gap:12px">${head}${L.map(collCard).join('')}
<div class="row" style="align-items:baseline;padding-top:8px"><span class="d" style="font-size:20px">히든 컬렉션</span><span class="sub">다섯 개 중 ${rev}개를 찾았어요</span></div>${H.map(collCard).join('')}</div>`;
    }
    const tot = t.sets.reduce((a, s) => a + s.recs.filter(r => v.found[r.out]).length, 0);
    const rec = (r, hid) => { const on = v.found[r.out];
      if (hid && !on) return `<div class="tile" style="background:transparent;border-color:#FFFDF6;border-style:dashed;color:#FFFDF6;padding:8px 2px;min-height:86px;justify-content:center"><span class="d" style="font-size:26px">?</span></div>`;
      const dia = madeN(r.out) >= 5;
      return `<button type="button" class="tile${dia ? ' dia' : ''}" data-a="recOpen" data-out="${r.out}" style="padding:8px 2px 6px;gap:2px;${hid && !dia ? 'border-color:#FFFDF6' : ''}${!hid && !dia && recIds(r, []) ? ';box-shadow:0 0 0 3px var(--y)' : ''}">${pic(r.out, 46, on ? '' : 'sil')}${madeRow(r.out, 9)}<span style="font-size:12px;line-height:1.2;color:var(--tx)">${on ? r.name : '?'}</span><span class="row" style="gap:0;justify-content:center">${r.in.map(k => pic(k, 17, 'pl')).join('')}</span></button>`; };
    const sets = t.sets.map(s => `<div class="card" style="gap:8px;padding:12px 10px"><div class="row" style="align-items:baseline"><h2 class="sp">${s.name}</h2><span class="sub tn">${s.recs.filter(r => v.found[r.out]).length} / 5</span></div><div class="grid5">${s.recs.map(r => rec(r)).join('')}</div></div>`).join('');
    const mt = t.hidden.reduce((a, s) => a + s.recs.filter(r => v.found[r.out]).length, 0);
    return `<div class="scr" style="gap:12px">${head}
<div class="hint">조합을 누르면 재료를 조합 칸에 바로 올릴 수 있어요.<br>노란 테두리는 지금 마을에 재료가 다 있는 조합이에요<br>쉰 개 중 ${tot}개를 찾았어요</div>${sets}
<div class="dark" style="display:flex;flex-direction:column;gap:10px"><div class="row" style="align-items:baseline"><span class="d sp" style="font-size:20px">미스터리 도감</span><span class="tn" style="font-size:13.5px">${mt} / 20</span></div><div style="font-size:13.5px;line-height:1.5">엉뚱한 조합으로만 나와요. 힌트는 없어요. 직접 찾아봐요</div><div class="grid5">${t.hidden.map(s => s.recs.map(r => rec(r, true)).join('')).join('')}</div></div></div>`;
  }
};
ACT.bkTab = d => { R.p = { tab: d.v }; _scrOf = ''; render(); };

// ---------- 상점 ----------
const homeCost = (k, i) => ({ st3: [10, 50], c_castle: [10, 50], a_barn: [50, 10] }[k] || HOMECOST[i] || [30, 15]);
SCR.shop = {
  view() {
    const o = O(), t = TH(), tab = V.shopTab, v = vil(), inf = o.inf;
    const tabs = seg('shopTab', [['box', '상자'], ['food', '간식'], ['acc', '꾸미기'], ['card', '도전'], ['home', '집'], ['ride', '탈것']], tab, 'sm');
    const own = k => v.bag[k] ? `<span class="cnt tn">×${v.bag[k]}</span>` : '';
    let body;
    if (tab === 'home') {
      const pr = (k, n, have) => `<span class="price" style="${inf || have >= n ? '' : 'color:#B5533C'}">${pic(k, 22)}${n}</span>`;
      body = `<div class="row" style="gap:6px"><span class="hint" style="margin-right:auto">친구들이 모아 온<br>나무와 돌로 지어요</span>${resPill('log', v.res.wood)}${resPill('st1', v.res.stone)}</div>
<div class="grid2">${t.homes.map((x, i) => { const [w, st] = homeCost(x.k, i), ok = inf || (v.res.wood >= w && v.res.stone >= st);
        return `<button type="button" class="tile kc" style="${ok ? '' : 'opacity:.6'}" data-a="buyHome" data-k="${x.k}" data-i="${i}" data-n="${x.name}">${pic(x.k, 76)}<span style="font-size:15.5px">${x.name}</span><span class="row" style="gap:10px">${pr('log', w, v.res.wood)}${pr('st1', st, v.res.stone)}</span>${own(x.k)}</button>`; }).join('')}</div>
<div class="card" style="flex-direction:row;align-items:center;gap:10px;background:var(--t1)">${frInner({ k: t.hero, lv: 4 }, 46, true)}<span style="font-size:14px;line-height:1.5">나무와 돌은 별로 살 수 없어요.<br>친구를 키우면 더 빨리 모여요</span></div>`;
    } else if (tab === 'card') {
      body = `<div class="row" style="align-items:baseline"><h2 class="sp" style="font-size:18px">도전권</h2><span class="sub">가진 도전권 ${v.chalT || 0}장</span></div><div class="hint" style="margin-top:-4px">도전은 하루 세 번 그냥 할 수 있어요.<br>더 하고 싶을 때 쓰고, 날이 바뀌어도 남아요</div>
<div class="grid3">${CHAL_TIX.map(([n, p]) => `<button type="button" class="tile kc" style="gap:3px;padding:10px 4px 12px${inf || o.stars >= p ? '' : ';opacity:.6'}" data-a="chalBuy" data-n="${n}">${stk(ENEMY[o.theme][0], 50)}<span class="d" style="font-size:15.5px;white-space:nowrap">도전 ${n}회권</span><span class="price">${stk('s_star', 20)}${p}</span></button>`).join('')}</div>
<h2 style="font-size:18px;margin-top:4px">도움 카드</h2><div class="hint" style="margin-top:-4px">위급상황 도전에서 친구들이 도와주는 카드예요.<br>한 번 사면 없어지지 않고, 같은 카드 세 장을 합치면 더 세져요</div>
<div class="grid2">${CARDS.map(c => { const n = [1, 2, 3].reduce((a, g) => a + (v.cards[c.k + ':' + g] || 0), 0);
        return `<button type="button" class="tile kc" style="gap:3px;padding:10px 6px 13px" data-a="buyCard" data-k="${c.k}">${stk(c.k, 66)}<span class="d" style="font-size:15.5px">${c.n}</span><span style="font-size:12px;line-height:1.35;color:var(--sub2);min-height:32px">${c.e(c.v[0])}</span><span class="price">${stk('s_star', 20)}${c.p}</span>${n ? `<span class="cnt tn">×${n}</span>` : ''}</button>`; }).join('')}</div>
<button type="button" class="btn sec" data-a="go" data-s="cards">가진 카드 보기 · 합치기</button>`;
    } else {
      const list = tab === 'ride' ? t.rides : tab === 'box' ? DT.shop.box.map(x => Object.assign({}, x, { price: boxPrice() })) : DT.shop[tab];
      const tip = { box: '별로 상자를 더 살 수 있어요', food: '친구들이 먹는 간식이에요 · 다섯 번 주면 선물을 받아요', acc: '친구에게 달아 주는 꾸미기예요 · 달아 주면 친구가 칭호를 얻어요', ride: '친구들이 타고 다니는 탈것이에요 · 별을 모아서 사요' }[tab];
      body = `<div class="hint">${tip}</div><div class="grid2">${list.map(x => `<button type="button" class="tile kc" data-a="buy" data-k="${x.k}" data-p="${x.price}" data-n="${x.name}">${pic(x.k, 76)}<span style="font-size:15.5px">${x.name}</span><span class="price">${stk('s_star', 20)}${x.price}</span>${own(x.k)}</button>`).join('')}</div>`;
    }
    return `<div class="scr">${topbar('상점', starPill())}${tabs}${body}</div>`;
  },
  after() { afterChecks(); }
};
ACT.shopTab = d => { V.shopTab = d.v; _scrOf = ''; render(); };
ACT.buy = d => {
  const o = O(); if (!pay(d.k.endsWith('box') ? boxPrice() : +d.p)) return;
  if (d.k === 'eggbox') o.eggBox++; else if (d.k === 'itembox') o.itemBox++; else bagAdd(d.k);
  save(); vib(15); render();
  toast(d.k.endsWith('box') ? `${d.n}를 샀어요 · 마을에서 열어요` : `${josa(d.n, '을', '를')} 샀어요 · 가방에 넣었어요`);
};
ACT.buyHome = d => {
  const o = O(), r = vil().res, [w, st] = homeCost(d.k, +d.i);
  if (!o.inf) { if (r.wood < w) return toast('나무가 모자라요. 친구들이 쉬는 동안 모아 와요'); if (r.stone < st) return toast('돌이 모자라요. 친구들이 쉬는 동안 모아 와요'); r.wood -= w; r.stone -= st; }
  bagAdd(d.k); bump('homes'); save(); vib(15); render();
  toast(`${josa(d.n, '을', '를')} 지었어요 · 가방에 넣었어요`);
};
ACT.buyCard = d => {
  const c = CARD[d.k]; if (!pay(c.p)) return;
  cardAdd(c.k, 1, 1); save(); vib(15); render();
  toast(`${josa(c.n, '을', '를')} 샀어요 · 한 번 사면 계속 쓸 수 있어요`);
};

// ---------- 가방 ----------
SCR.bag = {
  view(p) {
    const b = vil().bag, tab = V.bagTab, to = p.to && getObj(p.to);
    const keys = Object.keys(b).filter(k => tab === 'all' || (tab === 'home' ? ['home', 'ride'].includes(bagCat(k)) : bagCat(k) === tab));
    return `<div class="scr">${topbar(to ? frName(to) + ' 꾸미기' : '가방', starPill())}${seg('bagTab', [['all', '전체'], ['acc', '꾸미기'], ['home', '집·탈것'], ['food', '간식']], tab, 'sm')}
${to ? `<div class="card" style="flex-direction:row;align-items:center;gap:14px"><div style="width:110px;height:110px;display:flex;align-items:center;justify-content:center">${frInner(to, 80, true)}</div><div style="display:flex;flex-direction:column;gap:6px;min-width:0"><span class="d" style="font-size:20px">${frName(to)}</span>${to.acc ? `<button type="button" class="btn sec sm" style="height:38px;font-size:14.5px" data-a="unAcc" data-id="${to.id}">꾸미기 벗기</button>` : ''}${to.seat ? `<button type="button" class="btn sec sm" style="height:38px;font-size:14.5px" data-a="unSeat" data-id="${to.id}">${CAT[to.seat] === 'ride' ? '탈것에서 내리기' : '집에서 나오기'}</button>` : ''}</div></div>` : ''}
<div class="hint">${to ? '눌러서 달아 주거나 태워 줘요' : '물건을 누르면 누구에게 줄지 고를 수 있어요'}</div>
${keys.length ? `<div class="grid3">${keys.map(k => `<button type="button" class="tile" data-a="bagUse" data-k="${k}"${to ? ` data-to="${to.id}"` : ''}>${pic(k, 56)}<span style="font-size:13.5px">${nameOf(k)}</span><span class="cnt tn">×${b[k]}</span></button>`).join('')}</div>` : `<div class="card" style="align-items:center;padding:26px 14px;border-style:dashed;background:transparent"><span class="sub">아직 아무것도 없어요</span></div>`}
<button type="button" class="btn sec mta" data-a="go" data-s="shop">상점 가기</button></div>`;
  }
};
ACT.bagTab = d => { V.bagTab = d.v; _scrOf = ''; render(); };
const REACT = { food: ['냠냠! 정말 맛있어', '또 줘, 또!', '배불러… 고마워', '이 맛이야!'], acc: ['어때, 잘 어울려?', '마음에 쏙 들어!', '나 멋지지?', '거울 좀 보여 줘'], home: ['포근해… 여기서 좀 쉴게', '내 집이 생겼어!', '집이 제일 좋아'], ride: ['신난다! 달려 볼게', '슝슝! 빠르다', '꽉 잡아!'] };
function reactModal(f, c, k, msg) {   // 간식이나 꾸미기, 집, 탈것을 받은 친구가 좋아해요
  setTimeout(() => modal(`<div class="react"><span class="sayb" style="position:relative;left:auto;top:auto;transform:none">${pickR(REACT[c])}</span><div class="who hopbig">${frInner(f, 110, true)}</div>${[12, 30, 68, 86].map((x, i) => `<i class="cf" style="left:${x}%;animation-delay:${i * 110}ms">${i % 2 ? gheartI(16) : star5(17)}</i>`).join('')}</div>
<div class="d" style="font-size:20px;text-align:center">${esc(frName(f))}</div><div class="row" style="gap:8px;justify-content:center">${pic(k, 34)}<span style="font-size:15px;line-height:1.45;text-align:center">${msg}</span></div>
<button type="button" class="btn" data-a="close">좋아요</button>`, { mid: true, onClose: () => afterChecks(200) }), 0);
}
function giveTo(f, k) {
  const c = bagCat(k), b = vil().bag; if (!b[k]) return;
  if (c === 'food') { bagAdd(k, -1); return reactModal(f, 'food', k, feed(f)); }
  let nt;
  if (c === 'acc') { if (f.acc) bagAdd(f.acc); f.acc = k; bump('deco'); nt = FT_ACC[k]; } else { if (f.seat) bagAdd(f.seat); f.seat = k; nt = c === 'ride' ? '달리기를 좋아하는' : '집이 제일 좋은'; }
  const got = nt && ftAdd(f, nt);
  bagAdd(k, -1); save(); vib(15);
  reactModal(f, c, k, (c === 'home' ? '보금자리 줄에 집을 지었어요' : c === 'ride' ? '탈것 길에서 신나게 달려요' : `${josa(nameOf(k), '을', '를')} 달아 줬어요`) + (got ? `<br>새 칭호가 생겼어요 · ${nt}` : ''));
}
function feed(f) {
  f.fed = (f.fed || 0) + 1; f.fedAll = (f.fedAll || 0) + 1; bump('feed'); vib(15);
  const got = f.fedAll >= 5 && ftAdd(f, '잘 먹는'); let msg;
  if (f.fed >= 5) { f.fed = 0; const n = 3 + rnd(3); addStars(n); const box = Math.random() < .25; if (box) O().itemBox++; msg = `고맙다고 별 ${n}개${box ? '와 물건 상자' : ''}를 줬어요!`; }
  else msg = got ? '새 칭호가 생겼어요 · 잘 먹는' : `간식을 ${f.fed}번 줬어요 · 다섯 번 주면 선물을 줘요`;
  save(); return msg;
}
ACT.bagUse = d => {
  if (d.to) { const f = getObj(d.to); if (f) giveTo(f, d.k); return render(); }
  const fs = vil().objs.filter(o => o.t === 'f');
  if (!fs.length) return toast('아직 마을에 친구가 없어요. 알 상자를 열어 봐요');
  modal(`<h1>누구에게 줄까요?</h1><div class="row" style="gap:8px">${pic(d.k, 40)}<span>${nameOf(d.k)}</span></div><div class="grid3">${fs.map(f => `<button type="button" class="tile" data-a="giveTo" data-id="${f.id}" data-k="${d.k}">${frInner(Object.assign({}, f, { seat: null }), 56, true)}<span style="font-size:13px">${frName(f)}</span></button>`).join('')}</div><button type="button" class="btn sec" data-a="close">그만하기</button>`);
};
ACT.giveTo = d => { const f = getObj(d.id); closeModal(true); if (f) giveTo(f, d.k); render(); };
ACT.unAcc = d => { const f = getObj(d.id); if (f && f.acc) { bagAdd(f.acc); f.acc = null; save(); } closeModal(true); render(); };
ACT.unSeat = d => { const f = getObj(d.id); if (f && f.seat) { bagAdd(f.seat); f.seat = null; save(); } closeModal(true); render(); };

// ---------- 친구 누르기 ----------
const SAYS = ['오늘도 같이 공부하자!', '단어 많이 알아서 좋겠다', '나랑 놀자!', '간식 먹고 싶어', '우리 마을 멋지지?', '합치면 더 커질 수 있어!'];
function friendSheet(f) {
  const b = vil().bag, foods = Object.keys(b).filter(k => bagCat(k) === 'food');
  const rare = f.hold && TH().rare.find(r => r.k === f.k && r.hold === f.hold), tt = f.tt || [];
  const kind = f.m ? '미스터리 친구' : rare ? '희귀 친구' : `${f.lv}단계 ${DT.lvn[f.lv - 1]}`;
  modal(`<div class="row" style="gap:14px"><div style="width:112px;height:112px;display:flex;align-items:center;justify-content:center;flex:none">${frInner(f, 82, true)}</div>
<div style="display:flex;flex-direction:column;gap:4px;min-width:0">${f.ts ? `<span>${tchip(f.ts, 13, '--t0')}</span>` : ''}<span class="row" style="gap:6px"><span class="d" style="font-size:22px;line-height:1.2">${esc(frName(f))}</span><button type="button" class="chip ln" style="background:var(--paper);font-size:12px" data-a="frRen" data-id="${f.id}">이름 바꾸기</button></span><span class="sub">${f.nm ? frSpec(f) + ' · ' : ''}${kind}</span>
<span class="card" style="padding:6px 10px;border-radius:14px;font-size:14px;background:var(--stary)">"${esc(rare ? rare.say : pickR(SAYS))}"</span></div></div>
<div class="card" style="gap:6px;padding:10px 12px;border-radius:18px"><div class="row" style="align-items:baseline"><span class="d sp" style="font-size:15.5px">칭호</span><span class="sub" style="font-size:12.5px">${tt.length ? '누르면 이름 앞에 붙어요' : ''}</span></div>
${tt.length ? `<div class="row" style="gap:6px;flex-wrap:wrap">${tt.map(t => `<button type="button" class="tchip" style="font-size:13.5px;background:var(${f.ts === t ? '--y' : '--paper'})" data-a="ftSet" data-id="${f.id}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div><span style="font-size:12px;color:var(--sub)">${f.ts ? `'${esc(f.ts)}' · ${ftHow(f.ts)} 얻었어요` : '지금은 칭호를 붙이지 않았어요'}</span>` : `<span style="font-size:13px;color:var(--sub)">아직 칭호가 없어요. 꾸며 주거나 간식을 주면 생겨요</span>`}</div>
<div class="row" style="gap:6px"><span class="sub sp">간식 ${f.fed || 0} / 5</span>${[0, 1, 2, 3, 4].map(i => `<span style="width:14px;height:14px;border-radius:7px;border:1.5px solid var(--ink);background:${i < (f.fed || 0) ? 'var(--a3)' : 'var(--paper)'}"></span>`).join('')}</div>
<div class="row" style="gap:8px"><button type="button" class="btn sec sm f1" data-a="${foods.length ? 'feedF' : 'go2'}" data-s="shop" data-id="${f.id}" data-k="${foods[0] || ''}">${foods.length ? '간식 주기' : '간식 사러 가기'}</button><button type="button" class="btn sm f1" data-a="decoF" data-id="${f.id}">꾸미기</button></div>
${f.acc || f.seat ? `<div class="row" style="gap:8px">${f.acc ? `<button type="button" class="btn sec sm f1" style="font-size:14.5px" data-a="unAcc" data-id="${f.id}">꾸미기 벗기</button>` : ''}${f.seat ? `<button type="button" class="btn sec sm f1" style="font-size:14.5px" data-a="unSeat" data-id="${f.id}">${CAT[f.seat] === 'ride' ? '탈것에서 내리기' : '집에서 나오기'}</button>` : ''}</div>` : ''}`);
}
ACT.ftSet = d => { const f = getObj(d.id); if (!f) return; f.ts = f.ts === d.t ? '' : d.t; save(); render(); friendSheet(f); };
ACT.frRen = d => {
  const f = getObj(d.id); if (!f) return;
  modal(`<h1>이름을 지어 줘요</h1><input class="inp" id="frnm" type="text" maxlength="8" autocomplete="off" value="${esc(f.nm || '')}" placeholder="${esc(frSpec(f))}"><div class="hint">여덟 글자까지 쓸 수 있어요. 비워 두면 원래 이름으로 돌아가요</div>
<div class="row" style="gap:8px"><button type="button" class="btn sec f1" data-a="close">그만하기</button><button type="button" class="btn" style="flex:1.5 1 0" data-a="frRenOk" data-id="${f.id}">이 이름으로</button></div>`, { mid: true });
  const k = $('#frnm'); if (k) k.focus();
};
ACT.frRenOk = d => { const f = getObj(d.id), k = $('#frnm'); if (!f || !k) return; const nm = k.value.trim().slice(0, 8); if (nm) f.nm = nm; else delete f.nm; save(); closeModal(true); render(); friendSheet(f); };
ACT.feedF = d => { const f = getObj(d.id); if (!f) return; bagAdd(d.k, -1); closeModal(true); reactModal(f, 'food', d.k, feed(f)); };
ACT.decoF = d => { closeModal(true); V.bagTab = 'all'; go('bag', { to: +d.id }); };

// ---------- 하루 선물 ----------
function placeGift() {
  const w = $('#world'); if (!w || $('.gift')) return;
  if (!V.giftAt) { const n = NAV.n[pickR(navStops())]; V.giftAt = { x: n[0] + 14, y: n[1] - 8 }; }
  const d = document.createElement('div'); d.className = 'gift'; d.style.cssText = `left:${V.giftAt.x - 24}px;top:${V.giftAt.y - 24}px;width:48px;height:48px`;
  d.innerHTML = O().theme === 'chara' ? `<span class="twk" style="display:block">${stk('s_gift', 48)}</span>` : spark(40, 4, 4, 'twk') + spark(18, 30, -4, 'twk') + spark(14, -4, 30, 'twk');
  w.appendChild(d);
}
function openGift() {
  const v = vil(), n = 5 + rnd(11); v.gift = today(); V.giftAt = null; addStars(n); bump('gift');
  let extra;
  if (Math.random() < .3) { const a = pickR(DT.shop.acc); bagAdd(a.k); extra = a; } else { const a = pickR(DT.shop.food); bagAdd(a.k, 2); extra = { k: a.k, name: a.name + ' 두 개' }; }
  save(); vib(30); render();
  modal(`<h1 style="text-align:center">오늘의 선물을 찾았어요!</h1><div class="row" style="justify-content:center;gap:18px;padding:12px 0"><div class="tile" style="width:120px">${stk('s_star', 64)}<span>별 ${n}개</span></div><div class="tile" style="width:120px">${pic(extra.k, 64)}<span>${extra.name}</span></div></div><div class="hint" style="text-align:center">선물은 하루에 한 번 마을 어딘가에 숨어 있어요</div><button type="button" class="btn" data-a="close">고마워!</button>`, { mid: true });
}

// ---------- 무한모드 (테스트용) ----------
function grownOwner(o) {
  const g = JSON.parse(JSON.stringify(o)), t = DT.themes[g.theme];
  g.inf = 1; g.stars = 9999; g.total = Math.max(g.total || 0, 420); g.eggBox = 20; g.itemBox = 20; g.streak = Math.max(g.streak, 5); g.best = Math.max(g.best || 0, 7);
  const v = g.vil = newVil(); const keep = S.cur; const P = () => ({ x: 34 + rnd(WW - 68), y: 126 + rnd(WH - 146) });
  const add = ob => { ob.id = v.nid++; Object.assign(ob, P()); v.objs.push(ob); };
  const fr = (k, lv, ex) => { add(Object.assign({ t: 'f', k, lv }, ex || {})); v.seen['f:' + k] = 1; for (let i = 2; i <= lv; i++) v.seen['lv' + i + ':' + k] = 1; if (lv >= 5) v.seen.lv5 = 1; };
  t.fr.forEach(k => { v.seen['f:' + k] = 1; }); t.fr.slice(0, 5).forEach(k => { v.seen['lv2:' + k] = 1; });
  t.fr.slice(3, 7).forEach(k => fr(k, 1)); t.fr.slice(0, 2).forEach(k => fr(k, 2)); fr(t.fr[4], 3); fr(t.fr[6], 4); fr(t.hero, 5);
  t.fr.slice(4, 6).forEach(k => { v.seen['lv3:' + k] = 1; });
  const r = t.rare[0]; add({ t: 'f', k: r.k, lv: 1, hold: r.hold }); v.seen['r:' + r.k + r.hold] = 1; v.seen['f:' + r.k] = 1;
  add({ t: 'f', k: t.mys[0], lv: 1, m: 1 }); v.seen['m:' + t.mys[0]] = 1;
  t.base.slice(0, 5).forEach(k => add({ t: 'i', k })); [0, 0].forEach(() => add({ t: 'i', k: t.base[0] })); add({ t: 'i', k: t.lines[t.base[2]] });
  add({ t: 'i', k: t.lines[t.lines[t.base[1]]] });
  let n = 0;
  t.sets.forEach((s, si) => s.recs.forEach((rc, ri) => { if (si < 3 || (si < 6 && ri < 3)) { v.found[rc.out] = 1; } }));
  [[0, 1], [0, 3], [2, 0], [3, 0], [6, 0]].forEach(([si, ri]) => { const rc = t.sets[si].recs[ri]; v.found[rc.out] = 1; add({ t: 'i', k: rc.out }); });
  const h = t.hidden[0].recs[0]; v.found[h.out] = 1; add({ t: 'i', k: h.out });
  DT.shop.acc.forEach(a => v.bag[a.k] = 2); DT.shop.food.forEach(a => v.bag[a.k] = 10); v.bag[t.homes[0].k] = 1; v.bag[t.homes[2].k] = 1; v.bag[t.rides[0].k] = 1; v.bag[t.rides[3].k] = 1;
  v.merges = 0; v.mysAt = 6; v.eggs = 0; v.rareAt = 9;
  const bk = BOOKS.find(b => b.id === g.book), m = g.w[g.book] = g.w[g.book] || {}, td = dnum(today());
  bk.words.slice(0, Math.round(bk.words.length * .45)).forEach((w, i) => { if (!m[w[0]]) { const s = i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1; m[w[0]] = [s, s === 3 ? 3 : s - 1, td + (i % 5)]; } });
  for (let i = 1; i <= 6; i++) if (i !== 3) { const k = dfrom(td - i); g.hist[k] = g.hist[k] || { q: 20, ok: 17, st: 19, ms: 12 * 6e4 }; }
  g.last = g.last || dfrom(td - 1);
  v.res = { wood: 60, stone: 40 }; v.gatherAt = Date.now() - 5 * 36e5; v.trophy = 1; v.bestScore = 240;
  v.cards = { 'k_cheer:1': 3, 'k_time:1': 1, 'k_hint:2': 1, 'k_shield:1': 2, 'k_bolt:1': 1, 'k_big:1': 1 };
  const fs = v.objs.filter(x => x.t === 'f');
  fs.slice(0, 5).forEach((f, i) => ftAdd(f, FT_RAND[i * 2]));
  const top = fs.find(x => x.lv === 5); if (top) { top.acc = '@s_crown'; ftAdd(top, '전설의'); ftAdd(top, FT_ACC['@s_crown']); top.ts = '전설의'; }
  g.stat = Object.assign({}, g.stat, { feed: 148, merge: 297, deco: 29, gift: 39, homes: 9, spell: 296, perfect: 14, wrOut: 78, gold: 4, chalWin: 1 });
  g.titles = g.titles || {}; OT.forEach(x => { if (x.t(g)) g.titles[x.id] = 1; }); if (!g.title) g.title = Object.keys(g.titles)[0] || null;
  return g;
}
function setInf(on) {
  S.keep = S.keep || {};
  if (on) { S.keep[S.cur] = JSON.stringify(O()); S.owners[S.cur] = grownOwner(O()); }
  else if (S.keep[S.cur]) { S.owners[S.cur] = ens(JSON.parse(S.keep[S.cur])); delete S.keep[S.cur]; }
  V.cam = null; V.rt = {}; _recTh = null;
  save(true);
}
