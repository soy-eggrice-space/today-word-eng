'use strict';
// 단어키우기 · 나무와 돌, 친구 도움 카드, 위급상황 도전, 트로피
const TROPHY = [['tr0', '나무 트로피', 100], ['tr1', '동 트로피', 200], ['tr2', '은 트로피', 350], ['tr3', '금 트로피', 500], ['tr5', '보석 트로피', 700], ['tr4', '무지개 트로피', 900], ['tr6', '별빛 트로피', 1200]];
const ENEMY = { dino: ['e_ptero', '큰 익룡'], chara: ['e_cloud', '장난꾸러기 먹구름'], animal: ['e_fox', '꾀돌이 여우'] };
const CARDS = [
  { k: 'k_cheer', n: '응원 카드', p: 15, v: [20, 30, 40], e: v => `처음 ${v}초 동안 점수 두 배` },
  { k: 'k_time', n: '시간 카드', p: 10, v: [10, 15, 20], e: v => `${v}초 더 길게 시작해요` },
  { k: 'k_hint', n: '힌트 카드', p: 10, v: [3, 5, 8], e: v => `처음 ${v}문제는 보기가 두 개만 나와요` },
  { k: 'k_shield', n: '방패 카드', p: 8, v: [1, 2, 3], e: v => `${v}번은 틀려도 점수와 이어 맞히기가 그대로예요` },
  { k: 'k_ice', n: '얼음 카드', p: 12, v: [5, 8, 12], e: v => `30초 남았을 때 ${v}초 동안 시간이 멈춰요` },
  { k: 'k_bolt', n: '번개 카드', p: 12, v: [1, 2, 3], e: v => `틀린 문제 ${v}개를 맞힌 걸로 해 줘요` },
  { k: 'k_big', n: '큰 친구 카드', p: 15, v: [20, 30, 50], e: v => `가장 큰 친구의 단계마다 ${v}점을 더해요` },
  { k: 'k_retry', n: '다시 카드', p: 8, v: [1, 2, 3], e: v => `틀린 문제를 ${v}번 다시 풀 수 있어요` },
  { k: 'k_star', n: '별 카드', p: 10, v: [2, 3, 4], e: v => `이번 판에 받는 별이 ${v}배` },
  { k: 'k_easy', n: '쉬운 문제 카드', p: 10, v: [5, 8, 12], e: v => `처음 ${v}문제는 잘 아는 단어만 나와요` }];
const CARD = {}; CARDS.forEach(c => CARD[c.k] = c);
// 짝꿍 카드: 두 장을 같이 고르면 효과가 더 커져요 (시너지). add는 숫자를 더하고 mul은 곱해요
const SYN = [
  { p: ['k_cheer', 'k_big'], n: '응원받은 큰 친구', mul: { k_big: 1.5 }, e: '큰 친구 점수가 1.5배' },
  { p: ['k_star', 'k_cheer'], n: '반짝 응원', add: { k_cheer: 10 }, e: '응원 시간 +10초' },
  { p: ['k_time', 'k_ice'], n: '꽁꽁 긴 시간', add: { k_ice: 4 }, e: '얼음 시간 +4초' },
  { p: ['k_time', 'k_easy'], n: '느긋한 시작', add: { k_time: 5 }, e: '시작 시간 +5초' },
  { p: ['k_hint', 'k_easy'], n: '술술 풀려요', add: { k_hint: 3 }, e: '보기 두 개 문제 +3' },
  { p: ['k_star', 'k_hint'], n: '별 헤는 힌트', add: { k_star: 1 }, e: '받는 별 +1배' },
  { p: ['k_shield', 'k_bolt'], n: '든든한 번개', add: { k_shield: 1 }, e: '방패 +1번' },
  { p: ['k_big', 'k_shield'], n: '듬직한 방패', add: { k_shield: 1 }, e: '방패 +1번' },
  { p: ['k_retry', 'k_bolt'], n: '한 번 더 번쩍', add: { k_retry: 1 }, e: '다시 풀기 +1번' },
  { p: ['k_ice', 'k_retry'], n: '차분하게 다시', add: { k_ice: 3 }, e: '얼음 시간 +3초' }];
const synOf = ks => SYN.find(s => s.p.every(k => ks.includes(k))) || null;
const synMates = k => SYN.filter(s => s.p.includes(k)).map(s => s.p.find(x => x !== k));
const cardVal = (cards, k, syn) => cards[k] ? Math.round((CARD[k].v[cards[k] - 1] + (syn && syn.add && syn.add[k] || 0)) * (syn && syn.mul && syn.mul[k] || 1)) : 0;
const pips = (g, size) => `<span class="row" style="gap:1px;justify-content:center">${[0, 1, 2].map(i => i < g ? stk('s_star', size || 12, 'pl') : `<span style="width:${(size || 12) * .6}px;height:${(size || 12) * .6}px;margin:${(size || 12) * .2}px;border-radius:50%;border:1.5px dashed var(--sub)"></span>`).join('')}</span>`;
const cardList = () => { const c = vil().cards; return Object.keys(c).filter(x => c[x] > 0).map(x => { const [k, g] = x.split(':'); return { id: x, k, g: +g, n: c[x] }; }).sort((a, b) => CARDS.findIndex(c => c.k === a.k) - CARDS.findIndex(c => c.k === b.k) || b.g - a.g); };
function cardAdd(k, g, n) { const c = vil().cards, id = k + ':' + g; c[id] = (c[id] || 0) + n; if (c[id] <= 0) delete c[id]; }
const cardTile = (x, extra, attrs) => `<button type="button" class="tile kc${extra || ''}" style="padding:9px 2px 10px;gap:2px;border-radius:18px" ${attrs || ''}>${stk(x.k, 54)}${pips(x.g, 12)}<span class="cnt tn">×${x.n}</span></button>`;

// ---------- 나무와 돌 ----------
const GRATE = [0, 1, 2, 3, 4, 6];
const resPill = (k, n) => `<span class="pill" style="height:36px;padding:0 10px 0 4px;background:var(--paper);font-size:16px;gap:2px">${pic(k, 26)}<span class="tn">${n}</span></span>`;
const friends = () => vil().objs.filter(o => o.t === 'f');
function gatherPending() {
  const v = vil(), now = Date.now(), fs = friends(), rate = fs.reduce((a, o) => a + (o.m ? 4 : GRATE[o.lv || 1]), 0);
  if (!v.gatherAt || !rate) { v.gatherAt = now; return null; }
  const h = Math.min(8, (now - v.gatherAt) / 36e5), tot = Math.floor(rate * h);
  if (h < 1 / 6 || tot < 2) return null;
  const wood = Math.ceil(tot * .55);
  return { h, wood, stone: tot - wood, n: fs.length };
}
function gatherCheck() {
  const g = gatherPending(); if (!g) return false;
  const hh = Math.floor(g.h), mm = Math.round((g.h - hh) * 60), tm = (hh ? hh + '시간 ' : '') + (mm ? mm + '분' : '');
  const big = (k, n, nm) => `<div class="tile kc" style="flex:1 1 0;padding:10px 6px 13px;gap:2px">${pic(k, 60)}<span class="d" style="font-size:24px">+${n}</span><span class="sub">${nm}</span></div>`;
  modal(`<div class="d" style="font-size:23px;text-align:center;line-height:1.3">쉬는 동안 친구들이<br>모아 왔어요</div>
<div style="font-size:14px;color:var(--sub2);text-align:center">${tm.trim()} 동안 ${g.n}마리가 일했어요</div>
<div class="row" style="gap:10px">${big('log', g.wood, '나무')}${big('st1', g.stone, '돌')}</div>
<div class="card" style="gap:6px;padding:10px 8px;border-radius:18px"><span style="font-size:13px;color:var(--sub2);text-align:center">많이 자란 친구일수록 한 시간에 더 많이 모아요</span><div class="row" style="gap:0;align-items:flex-end">${[1, 2, 3, 4, 5].map(l => `<div style="flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:1px">${frInner({ k: TH().hero, lv: l }, 30 + l * 3, true)}<span style="font-size:11.5px;color:var(--sub2);white-space:nowrap">${DT.lvn[l - 1].replace(' 친구', '')}</span><span class="d" style="font-size:14px">${GRATE[l]}개</span></div>`).join('')}</div></div>
<div class="hint" style="text-align:center">여덟 시간치까지 쌓여요 · 나무와 돌로 보금자리를 지어요</div>
<button type="button" class="btn" data-a="gatherTake">받기</button>`, { mid: true, sticky: true });
  return true;
}
ACT.gatherTake = () => {
  const g = gatherPending(), v = vil();
  if (g) { v.res.wood += g.wood; v.res.stone += g.stone; }
  v.gatherAt = Date.now(); save(); closeModal(true); vib(20); render();
};
const HOMECOST = [[20, 5], [30, 10], [35, 20], [45, 30]];

// ---------- 카드 합치기 ----------
SCR.cards = {
  view(p) {
    const list = cardList(), sel = list.find(x => x.id === p.sel && x.n >= 3 && x.g < 3);
    const c = sel && CARD[sel.k];
    const head = sel ? `<div class="card" style="align-items:center;gap:8px;background:var(--mainLt)"><div class="row" style="gap:6px">${[0, 1, 2].map(() => `<div style="display:flex;flex-direction:column;align-items:center;gap:3px">${stk(sel.k, 56)}${pips(sel.g, 12)}</div>`).join('')}<span class="d" style="font-size:26px;padding:0 4px 16px">=</span><div style="display:flex;flex-direction:column;align-items:center;gap:3px;position:relative">${stk(sel.k, 86)}${pips(sel.g + 1, 14)}${spark(20, -8, -4, 'twk')}</div></div>
<span class="d" style="font-size:20px">${c.n} ${sel.g + 1}단계</span><span style="font-size:13.5px;color:var(--sub2);text-align:center">${c.e(c.v[sel.g - 1])}<br>→ ${c.e(c.v[sel.g])}</span></div>`
      : `<div class="card" style="flex-direction:row;align-items:center;gap:10px;background:var(--t1)"><span class="row" style="gap:0">${stk('k_cheer', 34)}${stk('k_cheer', 34)}${stk('k_cheer', 34)}</span><span style="font-size:13.5px;line-height:1.45">같은 카드 세 장을 합치면 한 단계 올라가요.<br>3단계까지 있어요</span></div>`;
    const can = list.some(x => x.n >= 3 && x.g < 3);
    return `<div class="scr">${topbar('도움 카드', starPill())}${head}
<div class="hint">카드는 한 번 사면 없어지지 않아요. 위급상황 도전을 시작할 때 두 장을 골라요</div>
${list.length ? `<div class="grid2" style="grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${list.map(x => cardTile(x, x.id === p.sel ? ' on' : (x.n >= 3 && x.g < 3 ? '' : ' dimc'), `data-a="cardSel" data-id="${x.id}"`)).join('')}</div>` : `<div class="card" style="align-items:center;padding:26px 14px;border-style:dashed;background:transparent"><span class="sub">아직 카드가 없어요. 상점에서 살 수 있어요</span></div>`}
${p.info ? `<div class="card" style="padding:10px 12px;gap:2px"><span class="d" style="font-size:16px">${CARD[p.info.k].n} ${p.info.g}단계</span><span class="sub">${CARD[p.info.k].e(CARD[p.info.k].v[p.info.g - 1])}</span></div>` : ''}
<div class="row mta" style="gap:8px"><button type="button" class="btn sec f1" style="font-size:16px" data-a="cardMergeAll" ${can ? '' : 'disabled'}>모두 합치기</button><button type="button" class="btn" style="flex:1.4 1 0" data-a="cardMerge" ${sel ? '' : 'disabled'}>합치기</button></div>
<button type="button" class="btn sec sm" data-a="shopCard">상점에서 카드 사기</button></div>`;
  }
};
ACT.cardSel = d => { const [k, g] = d.id.split(':'); R.p = { sel: d.id, info: { k, g: +g } }; render(); };
ACT.cardMerge = () => { const [k, g] = (R.p.sel || '').split(':'); const c = vil().cards; if (!k || (c[R.p.sel] || 0) < 3 || +g >= 3) return; cardAdd(k, +g, -3); cardAdd(k, +g + 1, 1); save(); vib(25); R.p = { sel: k + ':' + (+g + 1), info: { k, g: +g + 1 } }; render(); toast(`${CARD[k].n}가 ${+g + 1}단계가 됐어요!`); };
ACT.cardMergeAll = () => { let n = 0, again = true; while (again) { again = false; for (const x of cardList()) if (x.n >= 3 && x.g < 3) { cardAdd(x.k, x.g, -3); cardAdd(x.k, x.g + 1, 1); n++; again = true; } } save(); R.p = {}; render(); toast(n ? `카드를 ${n}번 합쳤어요` : '합칠 수 있는 카드가 없어요'); };
ACT.shopCard = () => { V.shopTab = 'card'; go('shop'); };

// ---------- 위급상황 도전 ----------
let CG = null;
const CHAL_NEED = 60;   // 도전이 열리는 만난 단어 수 (모든 단어장을 합쳐서)
const seenAll = o => Object.keys(o.w || {}).reduce((a, k) => a + Object.keys(o.w[k] || {}).length, 0);
const chalOpen = () => { const o = O(); return !!o.inf || seenAll(o) >= CHAL_NEED; };
const CHAL_TIX = [[3, 10], [5, 15], [10, 25]];   // 도전권 묶음: [횟수, 별 값]
const chalFree = () => { const o = O(), c = o.vil.chal; return o.inf ? 3 : Math.max(0, 3 - (c.k === today() ? c.n : 0)); };   // 오늘 그냥 할 수 있는 횟수
const chalTix = () => O().vil.chalT || 0;   // 사 둔 도전권 (날이 바뀌어도 남아요)
const chalLeft = () => chalFree() + (O().inf ? 0 : chalTix());
function trophyHTML() {
  const i = vil().trophy; if (i < 0) return '';
  return `<div class="obj trophy" style="transform:translate(${GTROPHY.x}px,${GTROPHY.y}px);z-index:${GTROPHY.y}"><span class="in" style="left:-36px;top:-72px;width:72px;height:72px">${stk(TROPHY[i][0], 72)}</span><span class="ntag">${TROPHY[i][1]}</span></div>`;
}
function trophyTap() { const v = vil(); toast(`${TROPHY[v.trophy][1]} · 가장 높은 점수 ${v.bestScore}점`); }
const troRow = (sz, score) => `<div class="row" style="gap:0">${TROPHY.map(([k, , n]) => `<div style="flex:1 1 0;display:flex;flex-direction:column;align-items:center;min-width:0;opacity:${score == null || score >= n ? 1 : .45}">${stk(k, sz)}<span class="tn" style="font-size:11px;white-space:nowrap">${n.toLocaleString()}</span></div>`).join('')}</div>`;
function troTrack(score) {
  let pos = 0; const n = TROPHY.length;
  for (let i = 0; i < n; i++) { const a = i ? TROPHY[i - 1][2] : 0, b = TROPHY[i][2]; if (score >= b) pos = (i + 1) / n; else { pos = (i + (score - a) / (b - a)) / n; break; } }
  return `<div style="position:relative;flex:1 1 0;height:10px;border-radius:5px;background:var(--track);margin:16px 14px 0 0"><div style="width:${Math.min(100, pos * 100).toFixed(1)}%;height:100%;border-radius:5px;background:var(--main)"></div>${TROPHY.map(([k, , t], i) => `<span style="position:absolute;left:${((i + 1) / n * 100).toFixed(1)}%;top:-17px;margin-left:-13px;opacity:${score >= t ? 1 : .45}">${stk(k, 26)}</span>`).join('')}</div>`;
}
const troIdx = score => { let i = -1; TROPHY.forEach(([, , n], j) => { if (score >= n) i = j; }); return i; };
SCR.chal = {
  view() {
    const o = O(), [ek, en] = ENEMY[o.theme], fs = friends().slice().sort((a, b) => (b.lv || 1) - (a.lv || 1)).slice(0, 4), left = chalLeft(), free = chalFree(), tix = o.inf ? 0 : chalTix(), open = chalOpen(), seen = seenAll(o);
    const pos = [[14, 104, 66], [82, 128, 56], [138, 144, 50], [22, 46, 46]];
    const ok = open && fs.length && left > 0;
    const tag = (t, c) => `<span class="d" style="padding:2px 11px 4px;border-radius:13px;border:2px solid var(--ink);background:var(${c});font-size:14px;white-space:nowrap">${t}</span>`;
    const fr = DT.themes[o.theme].fr, soon = (ks, bg, dot) => `<div class="card csoon" style="background:var(${bg})"><div class="cs-pic">${ks.map((k, i) => `<span style="left:${i * 36}px;top:${[8, 0, 10][i]}px;transform:rotate(${[-8, 0, 8][i]}deg);z-index:${i === 1 ? 2 : 1}">${stk(k, 60, '', true)}</span>`).join('')}</div><div class="f1" style="display:flex;flex-direction:column;gap:2px;align-items:flex-start"><span class="d cs-t" style="background:var(${dot})">COMING SOON</span><span style="font-size:13.5px;color:var(--sub2)">새 게임을 준비하고 있어요</span></div><span class="cs-sp" style="left:8px;top:6px;width:16px;height:16px">${spark(16, 0, 0)}</span><span class="cs-sp" style="right:12px;top:8px;width:13px;height:13px">${spark(13, 0, 0)}</span></div>`;
    return `<div class="scr" style="gap:10px;background:var(--t3)">
<div class="row" style="gap:8px"><h1 style="white-space:nowrap;margin-right:auto">도전!</h1><button type="button" class="ibtn rd d" style="width:40px;height:40px;font-size:19px" data-a="tutChal" aria-label="도전 안내 다시 보기">?</button><span style="font-size:14px;color:var(--sub2)">${!open ? '아직 잠겨 있어요' : o.inf ? '무한모드 · 계속 할 수 있어요' : free ? `오늘 세 번 중 ${4 - free}번째` : tix ? `도전권 ${tix}장 남았어요` : '오늘은 세 번 다 했어요'}</span></div>
<div class="card" data-tu="tro" style="gap:6px;padding:12px 6px"><span style="font-size:13px;color:var(--sub2);text-align:center">점수가 높을수록 더 멋진 트로피를 받아요${o.vil.bestScore ? ` · 가장 높은 점수 ${o.vil.bestScore}점` : ''}</span>${troRow(34)}</div>
<div class="card cgame" data-tu="team"><div class="row" style="gap:8px;justify-content:flex-start">${tag('위급상황', '--a3')}${open ? tag(left ? '지금 할 수 있어요' : '오늘 세 번 완료', left ? '--y' : '--paper') : `<span class="row d" style="gap:4px;padding:2px 10px 4px;border-radius:13px;border:2px solid var(--ink);background:var(--paper);font-size:14px">${ico(IC.lock, 14, 2.6)}잠김</span>`}</div>
<div class="field" style="${open ? '' : 'filter:saturate(.3);opacity:.75'}"><span style="position:absolute;left:160px;top:4px" class="${open ? 'hop' : ''}">${stk(ek, 150)}</span><span class="d" style="position:absolute;left:142px;top:8px;font-size:36px;transform:rotate(-14deg)">!</span>
${fs.map((f, i) => `<span style="position:absolute;left:${pos[i][0]}px;top:${pos[i][1]}px">${frInner(Object.assign({}, f, { seat: null }), pos[i][2], true)}</span>`).join('')}</div>
<div style="display:flex;flex-direction:column;gap:2px;align-items:center;text-align:center"><span class="d" style="font-size:21px;line-height:1.3">${josa(en, '이', '가')} 나타났어요!</span><span style="font-size:14px;line-height:1.5;color:var(--sub2)">1분 30초 동안 단어를 맞혀서 친구들과 함께 쫓아내요</span></div>
${open ? (fs.length ? '' : '<div class="hint" style="text-align:center">마을에 친구가 있어야 도전할 수 있어요. 알 상자를 열어 봐요</div>') : `<div style="display:flex;flex-direction:column;gap:5px"><div class="row" style="gap:10px"><div class="bar f1" style="height:10px"><i style="width:${Math.min(100, seen / CHAL_NEED * 100).toFixed(0)}%"></i></div><span class="tn" style="font-size:13.5px;white-space:nowrap">${seen} / ${CHAL_NEED}</span></div><span class="sub" style="text-align:center;font-size:13.5px">단어 ${CHAL_NEED}개를 만나면 열려요 · ${CHAL_NEED - seen}개 남았어요</span></div>`}
${open && fs.length && !left ? `<div class="hint" style="text-align:center;font-size:15px;color:var(--ink)">오늘 세 번을 다 했어요.<br>상점에서 도전권을 더 사세요</div><button type="button" class="btn" data-a="chalShop">상점으로 가기</button>` : `<button type="button" class="btn" data-a="chalNext" ${ok ? '' : 'disabled'}>${!open ? `${ico(IC.lock, 18, 2.6)}<span style="margin-left:6px">단어 ${CHAL_NEED}개를 만나면 열려요</span>` : !free && tix ? (cardList().length ? '도전권으로 도전 · 카드 고르기' : '도전권으로 도전') : cardList().length ? '카드 고르기' : '도전 시작'}</button>`}
${open ? `<div class="row" style="gap:8px;font-size:13.5px;color:var(--sub2)"><span>하루 세 번은 그냥 할 수 있어요 · 도전권 ${tix}장</span><button type="button" class="chip ln d" style="height:34px;padding:0 12px;border-radius:17px;border-width:2px;font-size:14px;background:var(--paper);white-space:nowrap" data-a="chalShop">상점에서 사기</button></div>` : ''}</div>
${soon(fr.slice(0, 3), '--t0', '--a0')}${soon(fr.slice(3, 6), '--t2', '--a2')}</div>${tabbar('chal')}`;
  },
  after() { if (chalOpen() && !O().tutC && !window.NO_TUT && !$('#ov')) return tutStart('chal'); afterChecks(); }
};
ACT.tutChal = () => tutStart('chal');
// 도전권: 하루 세 번을 다 한 뒤에 더 하고 싶으면 상점에서 별로 사요
ACT.chalShop = () => { V.shopTab = 'card'; go('shop'); };
ACT.chalBuy = d => { const it = CHAL_TIX.find(x => x[0] === +d.n); if (!it || !pay(it[1])) return; const v = O().vil; v.chalT = (v.chalT || 0) + it[0]; save(); render(); toast(`도전 ${it[0]}회권을 샀어요 · 모두 ${v.chalT}장`); };
ACT.chalNext = () => { if (!chalOpen()) return toast(`단어 ${CHAL_NEED}개를 만나면 열려요`); if (cardList().length) go('chalPick', { sel: [] }); else chalStart([]); };
SCR.chalPick = {
  view(p) {
    const list = cardList(), sel = p.sel, cards = {}; sel.forEach(x => { const [k, g] = x.split(':'); cards[k] = +g; });
    const ks = Object.keys(cards), syn = synOf(ks), nm = k => CARD[k].n.replace(' 카드', '');
    const row = x => { const i = sel.indexOf(x.id), c = CARD[x.k], mates = synMates(x.k), mate = i < 0 && ks.length === 1 && mates.includes(ks[0]);   // 고르기 전에도 설명과 짝꿍이 보여요
      return `<button type="button" class="crow${i >= 0 ? ' on' : ''}${mate ? ' mate' : ''}" data-a="pickCard" data-id="${x.id}">${stk(x.k, 50)}<span class="cbody"><span class="row" style="gap:6px"><span class="d" style="font-size:16.5px">${c.n}</span>${pips(x.g, 12)}<span class="tn" style="font-size:12px;color:var(--sub);margin-left:auto">×${x.n}</span></span><span style="font-size:13px;line-height:1.35;color:var(--sub2)">${c.e(c.v[x.g - 1])}</span><span class="row" style="gap:4px;flex-wrap:wrap;font-size:11.5px;color:var(--sub)">짝꿍${mates.map(m => `<span class="mchip${ks.includes(m) && i >= 0 || mate && m === ks[0] ? ' on' : ''}">${nm(m)}</span>`).join('')}</span></span>${i >= 0 ? `<span class="numb" style="left:-7px;top:-7px">${i + 1}</span>` : mate ? '<span class="synb d">시너지!</span>' : ''}</button>`; };
    const sum = !ks.length ? '<div class="hint" style="color:var(--sub2)">카드를 고르면 합친 효과가 여기에 보여요</div>'
      : ks.map(k => `<div class="row" style="gap:8px;align-items:flex-start">${stk(k, 26)}<span style="font-size:14px;line-height:1.4">${CARD[k].e(cardVal(cards, k, syn))}</span></div>`).join('') + (syn ? `<div class="mixmsg" style="background:var(--stary)">${stk('s_star', 20)}<span><b class="d" style="font-weight:400">시너지 · ${syn.n}</b> ${syn.e}</span></div>` : `<div class="hint" style="color:var(--sub2)">${ks.length < 2 ? '짝꿍 카드를 같이 고르면 시너지가 생겨요' : '이 두 장은 짝꿍이 아니라서 시너지가 없어요'}</div>`);
    return `<div class="scr" style="gap:12px;background:var(--t3)">${topbar('도움 카드 고르기', `<span style="font-size:14px;color:var(--sub2)">${sel.length} / 2장</span>`)}
<div class="hint" style="color:var(--sub2)">서로 다른 카드를 두 장까지 골라요. 때맞춰 알아서 써지고, 쓴 카드는 없어지지 않아요</div>
<div style="display:flex;flex-direction:column;gap:8px">${list.map(row).join('')}</div>
<div class="card" style="gap:7px;padding:12px;position:sticky;bottom:64px;z-index:3;box-shadow:0 -3px 0 rgba(74,65,56,.08)"><h2 style="font-size:16.5px">합친 효과</h2>${sum}</div>
<div class="row" style="gap:8px;position:sticky;bottom:0;z-index:3;background:var(--t3);padding-top:2px"><button type="button" class="btn sec f1" style="font-size:16px" data-a="chalGo" data-none="1">카드 없이 하기</button><button type="button" class="btn" style="flex:1.4 1 0" data-a="chalGo">도전 시작</button></div></div>`;
  }
};
ACT.pickCard = d => {
  const sel = R.p.sel, i = sel.indexOf(d.id);
  if (i >= 0) sel.splice(i, 1);
  else if (sel.some(x => x.split(':')[0] === d.id.split(':')[0])) return toast('같은 카드는 한 장만 고를 수 있어요');
  else if (sel.length >= 2) return toast('두 장까지만 고를 수 있어요');
  else sel.push(d.id);
  render();
};
ACT.chalGo = d => chalStart(d.none ? [] : R.p.sel.slice());
function chalStart(picks) {
  const o = O(), v = o.vil, b = curBook(), m = wmap();
  if (chalLeft() <= 0) return toast('오늘은 세 번 다 했어요. 도전권이 있으면 더 할 수 있어요');
  if (!o.inf) { if (chalFree() > 0) { if (v.chal.k !== today()) v.chal = { k: today(), n: 0 }; v.chal.n++; } else v.chalT = Math.max(0, (v.chalT || 0) - 1); }   // 오늘 세 번을 먼저 쓰고, 그다음은 도전권
  const cards = {}; picks.forEach(x => { const [k, g] = x.split(':'); cards[k] = +g; });
  const syn = synOf(Object.keys(cards)), val = k => cardVal(cards, k, syn);
  let seen = b.words.filter(w => m[w[0]]);
  if (seen.length < 20) seen = seen.concat(b.words.filter(w => !m[w[0]]).slice(0, 20 - seen.length));
  const fs = friends(), maxLv = fs.reduce((a, f) => Math.max(a, f.m ? 5 : f.lv || 1), 1);
  CG = { cards, val, syn, total: (90 + val('k_time')) * 1000, el: 0, last: Date.now(), iceUsed: false, iceUntil: 0, score: 0, n: 0, ok: 0, streak: 0, best: 0, fast: 0, miss: 0, sMiss: 0,
    sBase: 0, sStreak: 0, sFast: 0, sCheer: 0, sBig: val('k_big') * maxLv, sBolt: 0, shield: val('k_shield'), bolt: val('k_bolt'), retry: val('k_retry'), hint: val('k_hint'), easy: val('k_easy'),
    pool: shuffle(seen), easyPool: shuffle(seen.filter(w => m[w[0]] && m[w[0]][0] >= 3)), qi: 0, q: null, lock: false, mark: null, plus: '', say: '영차, 영차!',
    fr: shuffle(fs).slice(0, 5).sort((a, b) => (b.lv || 1) - (a.lv || 1)), fpts: Math.min(40, fs.reduce((a, f) => a + (f.m ? 5 : f.lv || 1), 0)), over: false };
  CG.score = CG.sBig;
  chalQ(); save(); go('chalGame', {}, { reset: true });
}
function chalQ() {
  const g = CG; let w;
  if (g.easy > 0 && g.easyPool.length) { w = g.easyPool[g.qi % g.easyPool.length]; g.easy--; } else { w = g.pool[g.qi % g.pool.length]; if (g.easy > 0) g.easy--; }
  g.qi++;
  const en = Math.random() < .5, c = shuffle([w].concat(others(w, 3, x => en ? x[1] : x[0].toLowerCase())));
  let choices = c.map(x => en ? x[1] : x[0]), ans = c.indexOf(w), dis = [];
  if (g.hint > 0) { g.hint--; dis = shuffle([0, 1, 2, 3].filter(i => i !== ans)).slice(0, 2); }
  g.q = { w, en, choices, ans, dis, t: Date.now() }; g.mark = null; g.lock = false; g.fx = '';
  if (en) speak(w[0], 1);
}
function chalLeftMs() { return Math.max(0, CG.total - CG.el); }
function chalTick() {
  const g = CG; if (!g || g.over || R.name !== 'chalGame') return;
  const now = Date.now(), dt = Math.min(500, now - g.last); g.last = now;   // 앱을 잠깐 나갔다 와도 시간이 한꺼번에 줄지 않아요
  const frozen = g.iceUntil > now;
  if (!frozen && !$('#ov')) g.el += dt;
  const left = chalLeftMs();
  if (!g.iceUsed && g.cards.k_ice && left <= 30000) { g.iceUsed = true; g.iceUntil = now + g.val('k_ice') * 1000; g.say = '얼음! 시간이 멈췄어요'; chalPaint(); }
  const s = Math.ceil(left / 1000), tm = $('#ctime'), bar = $('#cbar');
  if (tm) tm.textContent = Math.floor(s / 60) + ':' + pad2(s % 60);
  if (bar) { bar.style.width = (left / g.total * 100).toFixed(1) + '%'; bar.style.background = frozen ? 'var(--a2)' : 'var(--a3)'; }
  const cs = $('#cst_k_cheer'); if (cs) cs.textContent = g.el < g.val('k_cheer') * 1000 ? `쓰는 중 · ${Math.ceil(g.val('k_cheer') - g.el / 1000)}초` : '다 썼어요';
  const ic = $('#cst_k_ice'); if (ic) ic.textContent = frozen ? '시간이 멈췄어요' : g.iceUsed ? '다 썼어요' : '30초 남으면 써져요';
  if (left <= 0) chalEnd();
}
function chalPaint() { if (R.name === 'chalGame') render(); }
function cardState(k) {
  const g = CG, v = g.val(k);
  return { k_cheer: g.el < v * 1000 ? '쓰는 중 · 점수 두 배' : '다 썼어요', k_time: `${v}초 더 길게`, k_hint: g.hint ? `${g.hint}문제 남았어요` : '다 썼어요', k_shield: g.shield ? `${g.shield}번 남았어요` : '다 썼어요', k_ice: g.iceUsed ? '다 썼어요' : '30초 남으면 써져요',
    k_bolt: g.bolt ? `${g.bolt}번 남았어요` : '다 썼어요', k_big: `+${g.sBig}점 받았어요`, k_retry: g.retry ? `${g.retry}번 남았어요` : '다 썼어요', k_star: `별 ${v}배`, k_easy: g.easy ? `${g.easy}문제 남았어요` : '다 썼어요' }[k];
}
const burst = sz => { let d = ''; for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8, q = i % 2 ? 5.2 : 9.4; d += (i ? 'L' : 'M') + (10 + Math.cos(a) * q).toFixed(1) + ' ' + (10 + Math.sin(a) * q).toFixed(1); } return `<svg width="${sz}" height="${sz}" viewBox="0 0 20 20" aria-hidden="true"><path d="${d}Z" fill="#FFD95A" stroke="${INK}" stroke-width="1.2" stroke-linejoin="round"/><circle cx="10" cy="10" r="2.6" fill="#FFFDF6"/></svg>`; };
SCR.chalGame = {
  view() {
    const g = CG, o = O(), q = g.q, [ek] = ENEMY[o.theme], left = chalLeftMs(), s = Math.ceil(left / 1000), now = Date.now();
    const next = TROPHY.find(t => g.score < t[2]), prev = troIdx(g.score), a = prev >= 0 ? TROPHY[prev][2] : 0, push = next ? (g.score - a) / (next[2] - a) : 1;
    const fx = g.fx || '', frozen = g.iceUntil > now, dbl = g.el < g.val('k_cheer') * 1000;
    const fp = [[10, 30, 108], [112, 4, 86], [190, 50, 74], [58, 134, 70], [150, 140, 62]];   // 왼쪽, 바닥에서, 크기
    const k = clamp((Math.min(window.innerHeight, 1000) - 330) / 514, .58, 1.12);   // 화면 높이에 맞춰 싸움 장면 크기를 조절
    const ch = q.choices.map((c, i) => { const st = g.mark ? (i === q.ans ? ' ok' : i === g.mark.pick ? ' no' : ' off') : (q.dis.includes(i) ? ' off' : '');
      return `<button type="button" class="choice c${i}${st}${q.en ? '' : ' en'}" style="height:60px;font-size:${q.en ? fitKo(c, 19) : fitEnAny(c, 21, 106)}px" data-a="cans" data-i="${i}" ${q.dis.includes(i) ? 'disabled' : ''}><b style="width:26px;height:26px;margin-top:-15px;font-size:14px">${g.mark && i === q.ans ? ico(IC.check, 15, 3.4) : i + 1}</b><span>${esc(c)}</span></button>`; }).join('');
    const act = k => `<div class="cg-card">${stk(k, 34)}<div><span class="row" style="gap:4px"><span class="d" style="font-size:13.5px;white-space:nowrap">${CARD[k].n.replace(' 카드', '')}</span>${pips(g.cards[k], 9)}</span><span id="cst_${k}" style="font-size:11.5px;color:var(--sub2);white-space:nowrap">${cardState(k)}</span></div></div>`;
    const ks = Object.keys(g.cards);
    const shots = fx === 'hit' ? [0, 1, 2, 3, 4].map(i => `<span class="cg-shot s${i}" style="left:${80 + i * 30}px;bottom:${110 + (i % 2) * 60}px;animation-delay:${i * 35}ms">${stk('s_star', 34, 'pl')}</span>`).join('') : '';
    return `<div class="scr cg${fx === 'miss' ? ' shk' : ''}">
<div class="cg-stage${frozen ? ' ice' : ''}">
<span class="cg-sun"></span><span class="cg-ground"></span>${[0, 1, 2, 3, 4].map(i => `<span class="cg-line" style="top:${150 + i * 46}px;left:${[40, 210, 110, 260, 20][i]}px;width:${[70, 50, 90, 60, 40][i]}px;animation-delay:${i * 130}ms"></span>`).join('')}
<div class="cg-top"><button type="button" class="ibtn" style="width:40px;height:40px" data-a="chalQuit" aria-label="그만하기">${ico(IC.x, 20)}</button><div class="cg-time"><div id="cbar" style="width:${(left / g.total * 100).toFixed(1)}%;height:100%;background:var(${frozen ? '--a2' : '--a3'})"></div></div><span id="ctime" class="d tn" style="font-size:24px;min-width:54px;text-align:right">${Math.floor(s / 60)}:${pad2(s % 60)}</span></div>
<div class="cg-hud"><div class="cg-score"><span class="d tn${g.plus ? ' bump' : ''}" style="font-size:40px;line-height:1">${g.score}</span><span style="font-size:12px;color:var(--sub2)">점</span>${g.plus ? `<span class="cg-plus d"${g.plus[0] === '-' ? ' style="background:var(--t3)"' : ''}>${g.plus}</span>` : ''}</div>
<div class="cg-next">${next ? `${stk(next[0], 44)}<span>${next[1]}까지<br><b class="d">${next[2] - g.score}점</b></span>` : `${stk(TROPHY[6][0], 44)}<span>가장 높은<br><b class="d">트로피!</b></span>`}</div></div>
<div class="cg-track">${troTrack(g.score)}</div>
<div class="cg-tags">${g.streak >= 2 ? `<span class="cg-combo d${fx === 'hit' ? ' bump' : ''}">${g.streak}번 이어 맞힘!</span>` : ''}${dbl ? `<span class="cg-dbl d">응원 카드 · 점수 두 배!</span>` : ''}${frozen ? `<span class="cg-dbl d" style="background:var(--t2)">얼음 카드 · 시간이 멈췄어요</span>` : ''}</div>
<div class="cg-foe" style="transform:scale(${k.toFixed(2)})"><span class="cg-en ${fx === 'hit' ? 'hit' : fx === 'miss' ? 'atk' : 'idle'}" style="right:${-14 - push * 30}px">${stk(ek, 214)}</span>
${fx === 'hit' ? `<span class="cg-bang d" style="right:${120 - push * 30}px">${g.plus}</span>` : ''}</div>
<div class="cg-army" style="transform:scale(${k.toFixed(2)})">${g.fr.map((f, i) => `<span class="cg-fr ${fx === 'hit' ? 'dash' : fx === 'miss' ? 'ouch' : 'idle'}" style="left:${fp[i][0] + push * 30}px;bottom:${fp[i][1] + 34}px;animation-delay:${i * 60}ms;z-index:${200 - fp[i][1]}">${frInner(Object.assign({}, f, { seat: null }), fp[i][2], true)}</span>`).join('')}
${shots}${fx ? '' : `<span class="cg-clash c0">${burst(46)}</span><span class="cg-clash c1">${burst(34)}</span><span class="cg-clash c2">${star5(26)}</span><span class="cg-puff p0"></span><span class="cg-puff p1"></span><span class="cg-word w0 d">얍!</span><span class="cg-word w1 d">에잇!</span><span class="cg-word w2 d">쿵!</span>`}
<span class="cg-say d" style="left:${118 + push * 30}px">${g.say}</span></div>
<div class="cg-push"><i style="width:${(8 + push * 84).toFixed(0)}%"></i><b style="left:${(8 + push * 84).toFixed(0)}%">${stk(TH().hero, 26, 'pl')}</b><em>${stk(ek, 24, 'pl')}</em></div>
</div>
<div class="cg-panel">
<div class="cg-q"><span class="d" style="font-size:${q.en ? fitEnAny(q.w[0], 38, 244) : (q.w[1].length > 12 ? 24 : 30)}px;line-height:1.2;text-align:center">${esc(q.en ? q.w[0] : q.w[1])}</span>${q.en ? `<button type="button" class="ibtn rd" style="background:var(--y)" data-a="say" data-t="${esc(q.w[0])}" aria-label="발음 듣기">${ico(IC.spk, 22)}</button>` : ''}</div>
<div class="grid2" style="gap:10px">${ch}</div>
${ks.length ? `<div class="row" style="gap:8px">${ks.map(act).join('')}</div>` : ''}${g.syn ? `<div class="cg-syn d">${stk('s_star', 16)}시너지 · ${g.syn.n} · ${g.syn.e}</div>` : ''}</div></div>`;
  },
  after() { clearInterval(CG.tm); CG.last = Date.now(); CG.tm = setInterval(chalTick, 100); },
  leave() { if (CG) clearInterval(CG.tm); },
  back() { ACT.chalQuit(); return true; }
};
ACT.chalQuit = () => modal(`<h1>도전을 그만할까요?</h1><div class="hint" style="font-size:15px">지금 그만하면 이번 도전은 점수가 남지 않아요.</div><div class="row"><button type="button" class="btn sec f1" data-a="chalQuitYes">그만하기</button><button type="button" class="btn f2" data-a="close">계속하기</button></div>`);
ACT.chalQuitYes = () => { closeModal(true); if (CG) { clearInterval(CG.tm); CG.over = true; } go('vil', {}, { reset: true }); R.stack = [['home', {}]]; };
function chalGain(viaBolt) {
  const g = CG, q = g.q;
  g.streak++; g.best = Math.max(g.best, g.streak); if (g.streak > sv(O(), 'cstreak')) { O().stat = O().stat || {}; O().stat.cstreak = g.streak; }
  const sb = clamp(g.streak - 1, 0, 10), fast = Date.now() - q.t < 3000 ? 5 : 0;
  let pts = 10 + sb + fast;
  if (viaBolt) g.sBolt += pts; else { g.ok++; g.sBase += 10; g.sStreak += sb; g.sFast += fast; if (fast) g.fast++; }
  if (g.el < g.val('k_cheer') * 1000) { g.sCheer += pts; pts *= 2; }
  g.score += pts; g.plus = '+' + pts;
  g.say = pickR(['영차, 영차!', '잘한다!', '조금만 더!', '밀어내자!', '최고야!']);
}
ACT.cans = d => {
  const g = CG, q = g.q, i = +d.i; if (!g || g.lock || g.over || q.dis.includes(i)) return;
  g.n++;
  if (i === q.ans) { chalGain(false); g.fx = 'hit'; vib(12); g.mark = { pick: i }; g.lock = true; render(); return setTimeout(() => { if (CG === g && !g.over) { g.plus = ''; chalQ(); chalPaint(); } }, 420); }
  vib(50); g.plus = ''; chalWrong(q);
  if (g.retry > 0) { g.retry--; q.dis.push(i); g.say = '다시 카드! 한 번 더'; return render(); }
  if (g.bolt > 0) { g.bolt--; chalGain(true); g.fx = 'hit'; g.say = '번개! 맞힌 걸로 해요'; }
  else if (g.shield > 0) { g.shield--; g.fx = 'miss'; g.say = '방패가 지켜 줬어요'; }
  else { const cut = Math.min(CHAL_MISS, g.score); g.score -= cut; g.sMiss += cut; g.miss++; if (cut) g.plus = '-' + cut; g.streak = 0; g.fx = 'miss'; g.say = '괜찮아, 다음 문제!'; }
  g.mark = { pick: i }; g.lock = true; render();
  setTimeout(() => { if (CG === g && !g.over) { g.plus = ''; chalQ(); chalPaint(); } }, 700);
};
// 도전에서 틀린 단어도 오답노트에 (한 문제에 한 번만)
const CHAL_MISS = 3;
function chalWrong(q) {
  if (q.noted) return; q.noted = true;
  const o = O(), w = q.w, d = dayOf(o), wr = o.wr[w[0]] || (o.wr[w[0]] = { n: 0, ok: 0, b: o.book });
  wr.n++; wr.ok = 0; wr.last = d.k; if (!d.wrong.includes(w[0])) d.wrong.push(w[0]);
  const h = histToday(); h.wr = h.wr || {}; if (h.wr[w[0]] || Object.keys(h.wr).length < 40) h.wr[w[0]] = (h.wr[w[0]] || 0) + 1;
}
function chalEnd() {
  const g = CG, o = O(), v = o.vil; if (g.over) return;
  g.over = true; clearInterval(g.tm);
  g.score += g.fpts;
  g.idx = troIdx(g.score); g.newTro = g.idx > v.trophy;
  if (g.newTro) v.trophy = g.idx;
  v.bestScore = Math.max(v.bestScore || 0, g.score);
  g.stars = Math.max(1, Math.floor(g.score / 40)) * (g.val('k_star') || 1); addStars(g.stars);
  if (g.idx >= 0) bump('chalWin');
  save(true); closeModal(true); go('chalWin', {}, { reset: true });
}
SCR.chalWin = {
  view() {
    const g = CG, o = O(), [ek, en] = ENEMY[o.theme], won = g.idx >= 0, left = chalLeft();
    const ln = (t, d, v, bold) => `<div class="row" style="align-items:baseline;gap:8px;font-size:${bold ? 16 : 14.5}px"><span class="${bold ? 'd' : ''}" style="white-space:nowrap">${t}</span><span style="font-size:12.5px;color:var(--sub);margin-right:auto;white-space:nowrap">${d}</span><span class="d tn" style="font-size:${bold ? 22 : 16}px">${v}</span></div>`;
    const cardPts = g.sCheer + g.sBig + g.sBolt, next = TROPHY[g.idx + 1];
    return `<div class="scr" style="gap:10px">
<h1 style="text-align:center;font-size:26px;margin-top:2px">${won ? `${josa(en, '을', '를')} 쫓아냈어요!` : '아쉬워요, 조금만 더!'}</h1>
<div class="field" style="flex:none;height:${won ? 222 : 150}px;background:var(--mainLt);touch-action:auto">${won ? `<span class="hop" style="position:absolute;left:50%;margin-left:-78px;top:10px">${stk(TROPHY[g.idx][0], 156)}</span>${spark(32, 60, 28, 'twk')}${spark(22, 282, 46, 'twk')}${spark(18, 276, 146, 'twk')}${spark(24, 50, 146, 'twk')}<span style="position:absolute;right:8px;top:8px;opacity:.55;transform:rotate(18deg) scaleX(-1)">${stk(ek, 54)}</span><span class="d" style="position:absolute;left:50%;bottom:10px;transform:translateX(-50%);padding:3px 16px 5px;border-radius:16px;border:2px solid var(--ink);background:var(--paper);font-size:20px;white-space:nowrap">${TROPHY[g.idx][1]}</span>`
      : `<span style="position:absolute;left:50%;margin-left:-55px;top:12px">${stk(ek, 110)}</span><span class="chip ln" style="position:absolute;left:50%;bottom:10px;transform:translateX(-50%);background:var(--paper);font-size:13.5px;padding:3px 12px">100점부터 트로피를 받아요</span>`}</div>
<div class="card" style="gap:5px;padding:12px 14px">${ln('맞힌 단어', `${g.ok}개 × 10점`, g.sBase)}${ln('이어서 맞힘', `가장 길게 ${g.best}번`, '+' + g.sStreak)}${ln('빨리 맞힘', `${g.fast}번 × 5점`, '+' + g.sFast)}${g.miss ? ln('틀린 문제', `${g.miss}번 × ${CHAL_MISS}점`, '-' + g.sMiss) : ''}${cardPts ? ln('도움 카드', Object.keys(g.cards).map(k => CARD[k].n.replace(' 카드', '')).join(', '), '+' + cardPts) : ''}${ln('친구들 도움', '많이 자란 친구일수록 커요', '+' + g.fpts)}<div style="border-top:1.5px dashed var(--sub);margin:3px 0"></div>${ln('점수', '', g.score, true)}</div>
<div class="card" style="gap:8px;padding:12px 8px 10px"><div class="row" style="padding-left:14px">${troTrack(g.score)}</div><span style="font-size:13px;color:var(--sub2);text-align:center">${next ? `${next[1]}까지 ${next[2] - g.score}점 남았어요` : '가장 높은 트로피예요!'} · 별 ${g.stars}개를 받았어요</span></div>
${won ? `<div class="hint" style="text-align:center">${g.newTro ? '트로피를 마을 한가운데에 세웠어요' : '마을에는 더 높은 트로피가 서 있어요'}</div>` : ''}
<div class="row mta" style="gap:8px"><button type="button" class="btn sec f1" style="font-size:16px" data-a="chalAgain" ${left ? '' : 'disabled'}>${left ? (o.inf ? '한 번 더' : `한 번 더 · ${left}번 남음`) : '오늘은 끝'}</button><button type="button" class="btn" style="flex:1.2 1 0" data-a="tab" data-t="vil">마을로 가기</button></div></div>`;
  },
  after() { afterChecks(1800); },
  back() { ACT.tab({ t: 'vil' }); return true; }
};
ACT.chalAgain = () => { go('chal', {}, { reset: true }); R.stack = [['home', {}], ['vil', {}]]; };
