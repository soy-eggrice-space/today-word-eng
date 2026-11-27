'use strict';

const Q_DAY = 5, Q_HOLD = 5, Q_GAP = 2 * 3600e3, EGG_HATCH = 80;
const EGG_ST = [0, 5, 12, 20, 30, 40, 50, 60, 70];
const eggStage = n => EGG_ST.filter(x => n >= x).length;
const eggNext = n => { const s = eggStage(n); return s < EGG_ST.length ? EGG_ST[s] : EGG_HATCH; };
const eggWord = s => s <= 1 ? '처음 생긴 알' : s < 5 ? '자라는 중' : s === 5 ? '다 컸어요' : s < 9 ? '금이 가요' : '곧 깨어나요';

const MYS = {
  dino: [['d1', '별빛룡', '별똥별이 쏟아져요'], ['d2', '오로라 익룡', '하늘에 오로라가 일렁여요'], ['d3', '수정뿔 트리케라', '수정 가루가 내려요']],
  animal: [['a1', '꽃잎 여우', '꽃잎이 바람에 흩날려요'], ['a2', '달빛 부엉이', '반딧불이 날아다녀요'], ['a3', '햇살 사슴', '햇살이 비치고 나비가 날아요']],
  chara: [['c1', '꿈구름 고래', '비눗방울이 두둥실 떠올라요'], ['c2', '무지개 유니콘', '무지개가 떴다 사라져요'], ['c3', '별사탕 요정', '별사탕과 하트가 내려요']] };
const MYS_ON = 1;
const MYS_SAY = { d1: ['별 하나 줄까?', '밤하늘에서 왔어', '소원 빌어 봐!'], d2: ['하늘 끝까지 날아 봤어', '내 깃털 예쁘지?'], d3: ['내 뿔은 수정이야', '반짝반짝 빛나지?'],
  a1: ['꽃 냄새 맡아 봐', '꼬리에 꽃이 폈어', '봄바람 불어라!'], a2: ['부엉, 밤이 좋아', '달님이랑 친해'], a3: ['햇살이 따뜻해', '나비야, 이리 와'],
  c1: ['구름 위는 폭신해', '방울 하나 터뜨려 볼래?', '하늘을 헤엄쳐 왔어'], c2: ['무지개 타고 왔어', '소원을 들어줄게'], c3: ['별사탕 먹을래?', '반짝, 마법!'] };
const mysOf = k => { for (const th in MYS) { const r = MYS[th].find(x => x[0] === k); if (r) return r; } return [k, k, '']; };
const mysName = m => '가장 신비한 ' + mysOf(m.k)[1];
const QHALO = '<ellipse cx="60" cy="64" rx="50" ry="46" fill="#FFF3B8" opacity=".55"/><ellipse cx="60" cy="64" rx="40" ry="37" fill="#FFFBE3" opacity=".7"/>';
const mysSVG = (m, size, halo) => `<svg class="stk${m.sh ? ' qshiny' : ''}" viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">${halo ? QHALO : ''}${MYST_ART[m.k] || ''}</svg>`;

const EGGP = 'M61 14C79 15 93 41 92 67C91 89 77 105 59 104C41 103 28 87 28 65C29 40 43 13 61 14Z';
const qpth = (d, fill, sw, st, op) => `<path d="${d}" fill="${fill || 'none'}" stroke="${sw === 0 ? 'none' : st || INK}" stroke-width="${sw == null ? 3 : sw}" stroke-linejoin="round" stroke-linecap="round"${op != null ? ` opacity="${op}"` : ''}/>`;
const qstar = (cx, cy, r, fill) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; d += (i ? 'L' : 'M') + f1(cx + Math.cos(a) * q) + ' ' + f1(cy + Math.sin(a) * q); } return qpth(d + 'Z', fill || '#FFE27A', 1.6); };
let _eggU = 0;
function eggSVG(stage) {
  const g = Math.min(stage, 5), sc = .58 + .105 * (g - 1), cid = 'qec' + (++_eggU);
  let s = `<defs><clipPath id="${cid}"><path d="${EGGP}"/></clipPath></defs>` + qpth(EGGP, '#E6D8FB', 0) + `<g clip-path="url(#${cid})">`
    + qpth('M20 36C44 28 70 44 100 34L100 44C70 54 44 38 20 46Z', '#FFF1B8', 0, null, .9) + qpth('M20 58C40 48 62 70 100 54L100 66C62 82 40 60 20 70Z', '#F9CFE3', 0) + qpth('M20 80C44 72 64 92 100 78L100 88C64 102 44 82 20 92Z', '#CDEFE0', 0)
    + '<ellipse cx="46" cy="42" rx="7" ry="13" fill="#FFFFFF" opacity=".75"/><rect class="qsh" x="30" y="0" width="14" height="120" fill="#FFFFFF" opacity=".55"/></g>'
    + qpth('M40 62C46 54 56 56 55 63C54 70 64 72 70 66', 'none', 2, '#B79BEA') + qpth(EGGP, 'none', 3);
  [[70, 40, 4.5], [46, 48, 3.5], [78, 74, 3.5], [50, 92, 3], [64, 58, 2.6]].slice(0, g).forEach(([x, y, r]) => { s += qstar(x, y, r); });
  ['M60 16L56 28L63 34L57 44', 'M90 60L80 64L84 72L76 78', 'M30 70L40 72L36 82L44 88', 'M64 104L66 94L58 90L62 80'].slice(0, Math.max(0, stage - 5)).forEach(c => { s += `<g class="qck">${qpth(c, 'none', 6, '#FFF3B8', .9)}</g>` + qpth(c, 'none', 2.6) + qpth(c, 'none', 1.2, '#FFE27A'); });
  return `<svg viewBox="0 0 120 120" width="100%" height="100%" aria-hidden="true"><ellipse cx="60" cy="108" rx="${f1(26 * sc + 8)}" ry="5" fill="#000" opacity=".08"/><g transform="translate(${f1(60 - 60 * sc)} ${f1(108 - 108 * sc)}) scale(${f1(sc * 100) / 100})">${s}</g></svg>`;
}

function eggCell(stage, size, cls) {
  const motes = stage >= 2 && size >= 60 ? Array.from({ length: 2 + Math.min(stage, 7) }, (_, k) => `<i style="left:${18 + (k * 37) % 64}%;animation-delay:${(k * .55).toFixed(2)}s"></i>`).join('') : '';
  return `<span class="qeg s${stage} ${cls || ''}" style="width:${size}px;height:${Math.round(size * 1.15)}px;--r:${Math.round(size * .4)}px"><span class="qau"></span>${stage >= 4 ? '<span class="qra"></span>' : ''}<span class="qsv">${eggSVG(stage)}</span>${stage >= 3 && size >= 40 ? '<span class="qob"><i></i><i></i><i></i></span>' : ''}${motes ? `<span class="qmo">${motes}</span>` : ''}</span>`;
}
const eggAt = () => ({ x: gx(MX(392)), y: gy(MY(108)) });
const EGG_SZ = 84;
function eggHTML(stage) {
  const p = eggAt(), h = Math.round(EGG_SZ * 1.15);
  return `<div class="obj qegg" role="button" aria-label="가장 신비한 알" style="transform:translate(${p.x}px,${p.y}px);z-index:${p.y}"><span class="qped"></span><span class="in" style="left:${-EGG_SZ / 2}px;top:${-h - 4}px;width:${EGG_SZ}px;height:${h}px">${eggCell(stage, EGG_SZ)}</span><span class="ntag qrb">가장 신비한 알</span></div>`;
}
const MYS_AT = [[-100, 62], [-205, 66], [-150, 96], [-255, 98], [-60, 100], [-300, 64]];
function mystHTML(list, still) {
  const p = eggAt();
  return (list || []).map((m, i) => { const [dx, dy] = MYS_AT[i % MYS_AT.length], x = p.x + dx, y = p.y + dy + Math.floor(i / MYS_AT.length) * 30;
    return `<div class="obj qmy" data-i="${i}" role="button" aria-label="${mysName(m)}" style="transform:translate(${x}px,${y}px);z-index:${y}"><span class="in${still ? '' : ' qwk'}" style="left:-33px;top:-66px;width:66px;height:66px;animation-delay:${-i * 3.7}s"><span class="qmb" style="animation-delay:${-i * 3.7}s">${mysSVG(m, 66)}</span></span><span class="ntag qrb">${m.sh ? '<i>빛나는</i> ' : ''}${mysName(m)}</span></div>`; }).join('');
}

const qWorld = (v, still) => { qv(v); return eggHTML(eggStage(v.egg.n)) + mystHTML(v.myst, still); };

function qv(v) { v = v || vil(); if (!v.qs) v.qs = []; if (!v.qn) v.qn = 1; if (!v.egg) v.egg = { n: 0, g: 1 }; if (!v.myst) v.myst = []; return v; }
function qday() {
  const o = O(); let d = o.qd;
  if (!d || d.k !== today()) {
    [o.vil].concat((o.towns || []).map(t => t.vil)).forEach(v => { if (v && v.qs) v.qs = v.qs.filter(q => q.st !== 'offer'); });
    d = o.qd = { k: today(), n: 0, done: 0, ty: [], last: 0, first: 0 };
  }
  return d;
}

const SPL = d => d.type === 't3' || d.type === 't4';
const wrN = o => Object.keys(o.wr || {}).filter(e => o.wr[e].b === o.book).length;
const seenN = () => Object.keys(wmap()).length;
const yestWr = () => { const h = O().hist[dfrom(dnum(today()) - 1)]; return (h && h.wr) || {}; };
const posN = p => curBook().words.filter(w => p === '표현' ? isPhrase(w[0]) : w[2] === p).length;
const anySp = o => o.types.t3 || o.types.t4;
const QT = [
  { k: 'day1', g: '오늘 공부', n: '오늘의 단어 끝내기', goal: 1, ev: 'day', say: '오늘 공부 다 하면 나랑 놀자' },
  { k: 'day100', g: '오늘 공부', n: '오늘 공부 다 맞히기', goal: 1, ev: 'day', f: d => d.perfect, say: '오늘은 하나도 안 틀릴 것 같아!' },
  { k: 'cards', g: '오늘 공부', n: '새 단어 카드 넘겨 보기', goal: 10, u: '장', ev: 'card', can: o => o.mode === 'card', say: '새 단어 카드 구경시켜 줄래?' },
  { k: 'nohint', g: '오늘 공부', n: '힌트 없이 오늘 공부 끝내기', goal: 1, ev: 'day', f: d => !d.hint, can: anySp, say: '힌트 없이도 할 수 있지?' },
  { k: 'listen', g: '오늘 공부', n: '단어 소리 듣기', goal: 5, u: '번', ev: 'tts', say: '영어로 어떻게 읽는지 같이 들어 보자' },
  { k: 'ok10', g: '맞히기', n: '단어 맞히기', goal: 10, u: '개', f: d => d.ok, say: '나랑 단어 놀이 하자! 열 개만 맞혀 줘' },
  { k: 'ok20', g: '맞히기', n: '단어 많이 맞히기', goal: 20, u: '개', f: d => d.ok, say: '오늘은 스무 개 도전!' },
  { k: 't1', g: '맞히기', n: '뜻 고르기 맞히기', goal: 8, u: '개', f: d => d.ok && d.type === 't1', can: o => o.types.t1, say: '이 단어들 뜻이 뭐였더라?' },
  { k: 't2', g: '맞히기', n: '단어 고르기 맞히기', goal: 8, u: '개', f: d => d.ok && d.type === 't2', can: o => o.types.t2, say: '뜻을 보고 영어를 찾아 줘' },
  { k: 't5', g: '맞히기', n: '예문 빈칸 맞히기', goal: 5, u: '개', f: d => d.ok && d.type === 't5', can: o => o.types.t5, say: '문장 속 빈칸을 채워 줘' },
  { k: 'run5', g: '맞히기', n: '이어 맞히기', goal: 5, u: '개 연속', run: 1, f: d => !!d.ok, say: '한 번도 안 틀리면 진짜 멋있을 거야' },
  { k: 'run10', g: '맞히기', n: '길게 이어 맞히기', goal: 10, u: '개 연속', run: 1, f: d => !!d.ok, say: '열 개 연속이면 나 깜짝 놀랄 거야' },
  { k: 't3', g: '철자', n: '스펠링 눌러서 쓰기', goal: 5, u: '개', f: d => d.ok && d.type === 't3', can: o => o.types.t3, say: '철자가 헷갈려… 다섯 개만 써 줄래?' },
  { k: 't4', g: '철자', n: '키보드로 쓰기', goal: 3, u: '개', f: d => d.ok && d.type === 't4', can: o => o.types.t4, say: '자판으로 직접 써 볼래?' },
  { k: 'spnh', g: '철자', n: '힌트 없이 철자 맞히기', goal: 5, u: '개', f: d => d.ok && SPL(d) && !d.hint, can: anySp, say: '힌트 없이 쓸 수 있어?' },
  { k: 'splong', g: '철자', n: '긴 단어 철자 맞히기', goal: 3, u: '개', f: d => d.ok && SPL(d) && d.w[0].replace(/[^A-Za-z]/g, '').length > 5, can: anySp, say: '긴 단어도 문제없지?' },
  { k: 'spwr', g: '철자', n: '틀렸던 단어 철자 쓰기', goal: 2, u: '개', f: d => d.ok && SPL(d) && d.wasWr, can: o => anySp(o) && wrN(o) >= 4, say: '지난번에 틀린 단어, 다시 써 보자' },
  { k: 'sprun', g: '철자', n: '철자 이어 맞히기', goal: 3, u: '개 연속', run: 1, f: d => SPL(d) ? !!d.ok : null, can: anySp, say: '세 개 연속으로 써 줘!' },
  { k: 'wrok', g: '복습', n: '오답노트 단어 다시 맞히기', goal: 3, u: '개', f: d => d.ok && d.wasWr, can: o => wrN(o) >= 3, say: '지난번에 틀린 단어, 이번엔 이길 수 있어!' },
  { k: 'wrout', g: '복습', n: '오답노트에서 단어 빼기', goal: 1, u: '개', ev: 'wrOut', can: o => wrN(o) >= 1, say: '오답노트에서 하나만 졸업시켜 줘' },
  { k: 'wrdone', g: '복습', n: '오답노트 다시 풀기 끝내기', goal: 1, ev: 'wrongDone', can: o => wrN(o) >= 1, say: '틀린 단어들을 한 번에 모아서 풀어 보자' },
  { k: 'yest', g: '복습', n: '어제 틀린 단어 맞히기', goal: 2, u: '개', f: d => d.ok && !!yestWr()[d.w[0]], can: () => Object.keys(yestWr()).filter(e => wmap()[e]).length >= 2, say: '어제 틀린 거 기억나?' },
  { k: 'due', g: '복습', n: '복습할 날이 된 단어 맞히기', goal: 5, u: '개', f: d => d.ok && d.due, can: () => { const t = dnum(today()), m = wmap(); return Object.keys(m).filter(e => m[e][2] <= t).length >= 8; }, say: '오래된 단어도 잊지 않았지?' },
  { k: 'verb', g: '품사·표현', n: '동사 맞히기', goal: 5, u: '개', f: d => d.ok && d.w[2] === '동사', can: () => posN('동사') >= 30, say: '움직이는 말을 맞혀 줘' },
  { k: 'adj', g: '품사·표현', n: '형용사 맞히기', goal: 3, u: '개', f: d => d.ok && d.w[2] === '형용사', can: () => posN('형용사') >= 30, say: '어떤지 나타내는 말을 맞혀 줘' },
  { k: 'phr', g: '품사·표현', n: '표현 맞히기', goal: 3, u: '개', f: d => d.ok && isPhrase(d.w[0]), can: () => posN('표현') >= 15, say: '여러 단어로 된 말도 할 수 있어?' },
  { k: 'qm', g: '깜짝', n: '친구가 내는 뜻 문제', goal: 3, u: '문제', quick: 'm', can: () => seenN() >= 8, say: '나 이 단어 뜻을 까먹었어. 알려 줄래?' },
  { k: 'qs', g: '깜짝', n: '친구가 내는 철자 문제', goal: 1, u: '문제', quick: 's', can: () => quickWords('s').length >= 1 && seenN() >= 8, say: '이 단어 어떻게 쓰더라?' },
  { k: 'ql', g: '깜짝', n: '듣고 고르기', goal: 3, u: '문제', quick: 'l', can: () => seenN() >= 8, say: '잘 들어 봐! 무슨 단어야?' },
  { k: 'qr', g: '깜짝', n: '거꾸로 문제', goal: 3, u: '문제', quick: 'r', can: () => seenN() >= 8, say: '이번엔 거꾸로 해 보자. 뜻을 보고 영어를 골라 줘' }];
const QTM = {}; QT.forEach(t => { QTM[t.k] = t; });
const qGoalTxt = q => { const T = QTM[q.k]; return T.goal === 1 && !T.u ? T.n : `${T.n} · ${q.goal}${T.u || '번'}`; };
const qOf = id => { const v = vil(); return v && v.qs ? v.qs.find(q => q.f === id) : null; };
const qStill = o => { const q = qOf(o.id); return !!q && q.st !== 'on'; };

function qEv(ev, d) {
  const o = O(); if (!o || !o.vil || !o.vil.qs) return; d = d || {};
  let fin = 0;
  o.vil.qs.forEach(q => {
    if (q.st !== 'on') return; const T = QTM[q.k]; if (!T || T.quick || (T.ev || 'ans') !== ev) return;
    const r = T.f ? T.f(d) : true;
    if (T.run) { if (r === true) q.n++; else if (r === false) q.n = 0; } else if (r) q.n++;
    if (q.n >= q.goal) { q.n = q.goal; q.st = 'done'; fin++; }
  });
  if (fin) { save(); SND.fx('star'); setTimeout(() => toast(`부탁${fin > 1 ? ` ${fin}개를` : '을'} 다 들어줬어요! 마을에서 친구를 찾아가 봐요`), 60); }
}

function qFix() {
  const v = qv(); let ch = 0;
  v.qs.forEach(q => { const f = getObj(q.f); if (f && f.t === 'f' && !f.fo && !f.seat) return; const c = qFree(), same = c.find(x => f && x.k === f.k) || c[0]; if (same) { q.f = same.id; ch = 1; } else if (q.st === 'offer') { q.drop = 1; ch = 1; } });
  if (ch) { v.qs = v.qs.filter(q => !q.drop); save(); }
}
const qFree = () => vil().objs.filter(o => o.t === 'f' && !o.fo && !o.seat && !qOf(o.id));
function qOffer(n) {
  const o = O(), d = qday(), v = qv(); let add = 0;
  for (let i = 0; i < n; i++) {
    if (d.n >= Q_DAY) break;
    if (v.qs.length >= Q_HOLD) { if (!d.full) { d.full = 1; V.qFull = 1; } break; }
    const fr = qFree(); if (!fr.length) break;
    const ty = QT.filter(t => !d.ty.includes(t.k) && (!t.can || t.can(o)));
    if (!ty.length) break;
    const quick = ty.filter(t => t.quick), T = quick.length && Math.random() < .25 ? pickR(quick) : pickR(ty.filter(t => !t.quick).length ? ty.filter(t => !t.quick) : ty);
    const small = o.per <= 10 && T.goal >= 8 ? Math.round(T.goal * .6) : T.goal;
    const f = pickR(fr);
    v.qs.push({ id: v.qn++, k: T.k, f: f.id, st: 'offer', n: 0, goal: small, day: today() });
    d.n++; d.ty.push(T.k); d.last = Date.now(); add++;
  }
  if (add) save();
  return add;
}

function qTick() {
  const o = O(); if (!o || S.cur < 0) return 0; const d = qday(); qv(); qFix();
  if (!qFree().length) return 0;
  if (!d.first) { d.first = 1; const n = qOffer(2 + rnd(2)); save(); return n; }
  if (R.name === 'vil' && d.last && Date.now() - d.last >= Q_GAP) return qOffer(1);
  return 0;
}

function qPop() { const d = qday(); if (!d.first || d.n >= Q_DAY) return 0; qv(); qFix(); return qOffer(1); }
function qStudyEnd(ss) {
  const o = O(), d = dayOf(o);
  if (ss.kind === 'daily' && d.words >= o.per) qEv('day', { perfect: ss.done >= 5 && ss.ok === ss.done, hint: !!ss.hinted });
  if (ss.kind === 'wrong') qEv('wrongDone');
  V.qCall = qPop();
}
const qCallLine = () => V.qCall ? `<button type="button" class="card kc qcall" data-a="tab" data-t="vil"><span class="qbub">!</span><span class="f1" style="display:flex;flex-direction:column;gap:1px;text-align:left"><span class="d" style="font-size:17px">마을에서 친구가 부르고 있어요</span><span style="font-size:13px;color:var(--sub2)">부탁이 생겼대요</span></span><span class="chip ln d" style="background:var(--y);white-space:nowrap">마을 가기</span></button>` : '';

const QIC = 'M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-7l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2ZM12 8v3.5M12 14h.01';
function qMark(o, h) {
  const q = qOf(o.id); if (!q) return '';
  if (q.st === 'offer') return `<span class="qbub qon" style="top:${-h - 40}px">!</span>`;
  if (q.st === 'done') return `<span class="qbub qok" style="top:${-h - 40}px">완료</span>`;
  return `<span class="qprog tn" style="top:${-h - 22}px">${q.n}/${q.goal}</span>`;
}
function qPill() {
  const v = qv(), n = v.qs.length; if (!n) return '';
  const hot = v.qs.filter(q => q.st !== 'on').length;
  return `<button type="button" class="pill qpill${hot ? ' hot' : ''}" data-a="qList">${ico(QIC, 18, 2.4)}<span class="d">부탁 ${n}</span>${hot ? `<b class="badge2 tn">${hot}</b>` : ''}</button>`;
}

function qTap(f) {
  const q = qOf(f.id); if (!q) return false;
  if (q.st === 'offer') { qOfferModal(q, f); return true; }
  if (q.st === 'done') { qThanks(q, f); return true; }
  if (QTM[q.k].quick) { qqStart(q); return true; }
  return false;
}
const qFace = (f, sz) => f ? frInner(Object.assign({}, f, { seat: null }), sz, true) : stk(TH().hero, sz);
function qOfferModal(q, f) {
  const T = QTM[q.k]; SND.fx('pop');
  modal(`<div class="row" style="gap:12px"><div class="hop" style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;flex:none">${qFace(f, 80)}</div>
<div style="display:flex;flex-direction:column;gap:5px;min-width:0"><span class="row" style="gap:6px"><span class="d" style="font-size:20px">${esc(frName(f))}의 부탁</span><span class="chip" style="background:var(--t1);font-size:12px">${T.g}</span></span>
<span class="card" style="padding:7px 11px;border-radius:14px;font-size:15px;background:var(--stary)">"${esc(T.say)}"</span></div></div>
<div class="card" style="flex-direction:row;align-items:center;gap:10px;padding:10px 12px;background:var(--paper)">${ico(QIC, 22)}<span class="f1" style="font-size:16px">${qGoalTxt(q)}</span></div>
<div class="row" style="gap:8px;align-items:center;font-size:13.5px;color:var(--sub2)"><span style="width:34px;height:40px;flex:none">${eggCell(eggStage(vil().egg.n), 34)}</span><span>${T.quick ? '받으면 바로 문제가 나와요. ' : ''}들어주면 마을 한가운데 가장 신비한 알이 자라요</span></div>
<div class="row" style="gap:8px"><button type="button" class="btn sec f1" data-a="qLater">다음에</button><button type="button" class="btn f2" data-a="qAcc" data-id="${q.id}">도와줄게</button></div>
<div class="hint" style="text-align:center;font-size:12.5px">'다음에'를 누르면 오늘 밤 12시까지 기다려 줘요</div>`, { mid: true });
}
ACT.qLater = () => closeModal(true);
ACT.qAcc = d => {
  const v = qv(), q = v.qs.find(x => x.id === +d.id); if (!q || q.st !== 'offer') return closeModal(true);
  q.st = 'on'; save(); vib(15);
  if (QTM[q.k].quick) return qqStart(q);
  closeModal(true); render(); toast(`좋아요! ${qGoalTxt(q)}`);
};
function qThanks(q, f) {
  SND.fx('star');
  modal(`<div style="display:flex;justify-content:center;position:relative;height:120px"><span class="hop">${qFace(f, 104)}</span>${spark(26, 60, 10, 'twk')}${spark(20, 236, 34, 'twk')}</div>
<div class="d" style="font-size:23px;text-align:center">${pickR(['고마워! 정말 정말 고마워', '덕분에 힘이 났어!', '역시 너밖에 없어!', '와, 진짜 해냈구나!'])}</div>
<div style="font-size:14.5px;color:var(--sub2);text-align:center">${esc(frName(f || { k: TH().hero }))}의 부탁 · ${qGoalTxt(q)}</div>
<div class="row" style="justify-content:center;gap:10px;align-items:center"><span style="width:44px;height:52px">${eggCell(eggStage(vil().egg.n), 44)}</span><span style="font-size:14.5px">고마운 마음이 빛이 되어<br>가장 신비한 알로 날아가요</span></div>
<button type="button" class="btn" data-a="qGive" data-id="${q.id}">알에게 빛 보내기</button>`, { mid: true });
}
ACT.qGive = d => {
  const o = O(), v = qv(), q = v.qs.find(x => x.id === +d.id); if (!q || q.st !== 'done') return closeModal(true);
  const f = getObj(q.f);
  v.qs = v.qs.filter(x => x !== q);
  const from = f ? { x: f.x, y: f.y - objSize(f) * .6 } : null, s0 = eggStage(v.egg.n);
  v.egg.n++; bump('qDone'); if (QTM[q.k].quick) bump('qQuick'); if (v.egg.n === 30) bump('eggBig');
  const dd = qday(); dd.done++; if (dd.done === Q_DAY) bump('qDay5');
  const r = o.qr || (o.qr = { last: '', n: 0 }); if (r.last !== today()) { r.n = r.last === dfrom(dnum(today()) - 1) ? r.n + 1 : 1; r.last = today(); const s = ST(); s.qRun = Math.max(s.qRun || 0, r.n); }
  save(true); closeModal(true);
  V.qAnim = { from, s0 };
  if (R.name === 'vil' && $('#world') && V.mode !== 'mix') qAnimRun(); else { V.mode = 'main'; ACT.tab({ t: 'vil' }); }
};

function qAnimRun() {
  const a = V.qAnim; V.qAnim = null; const f = $('#field'), w = $('#world'); if (!a || !f || !w) return;
  const p = eggAt(), v = qv(), s1 = eggStage(v.egg.n);
  w.style.transition = 'transform .6s ease'; V.cam = { x: p.x * V.z - f.clientWidth / 2, y: (p.y - 40) * V.z - f.clientHeight / 2 }; camApply();
  setTimeout(() => {
    w.style.transition = '';
    const from = a.from || { x: p.x + (f.clientWidth / V.z) * .4, y: p.y - 160 };
    const orb = document.createElement('i'); orb.className = 'qorb'; orb.style.transform = `translate(${from.x}px,${from.y}px)`; w.appendChild(orb);
    void orb.offsetWidth; orb.style.transition = 'transform 1s cubic-bezier(.4,-.3,.5,1)'; orb.style.transform = `translate(${p.x}px,${p.y - 40}px)`;
    setTimeout(() => {
      orb.classList.add('end'); setTimeout(() => orb.remove(), 500);
      const el = $('.qegg', w); if (el) { el.outerHTML = eggHTML(s1); const n2 = $('.qegg', w); n2.classList.add('qbump'); setTimeout(() => n2.classList.remove('qbump'), 700); }
      vib(20); SND.fx(s1 !== a.s0 ? 'title' : 'pop');
      if (v.egg.n >= EGG_HATCH) return setTimeout(qHatch, 700);
      toast(s1 !== a.s0 ? (s1 >= 6 ? '알에 금이 갔어요! 안에서 무언가 움직여요' : s1 === 5 ? '알이 다 컸어요! 이제 곧 금이 가요' : '알이 한 뼘 자랐어요') : `가장 신비한 알 · 부탁 ${v.egg.n}번`);
    }, 1050);
  }, 650);
}

function qHatch() {
  const v = qv(), f = $('#field'), el = $('#world .qegg'); if (!f || v.egg.n < EGG_HATCH || V.qHatching) return;
  V.qHatching = 1;
  const th = O().theme, list = MYS[th] || MYS.dino, open = list.slice(0, MYS_ON), nx = open.find(x => !v.myst.some(m => m.k === x[0] && !m.sh));
  const m = nx ? { k: nx[0], t: Date.now() } : { k: pickR(open)[0], sh: 1, t: Date.now() };
  if (el) el.classList.add('qshake'); SND.fx('hatch'); vib(40);
  setTimeout(() => { const fl = document.createElement('div'); fl.className = 'flash'; f.appendChild(fl); setTimeout(() => fl.remove(), 600); }, 1500);
  setTimeout(() => {
    v.myst.push(m); v.egg = { n: 0, g: (v.egg.g || 1) + 1 }; bump('hatch'); save(true); V.qHatching = 0; render(); SND.fx('win');
    modal(`<div class="qborn"><span class="qra big"></span><span class="qpop">${mysSVG(m, 170, true)}</span></div>
<div style="display:flex;justify-content:center"><span class="d qtag">${m.sh ? '빛나는 ' : ''}${mysName(m)}</span></div>
<div class="d" style="font-size:22px;text-align:center">알에서 깨어났어요!</div>
<div style="font-size:14.5px;line-height:1.55;color:var(--sub2);text-align:center">부탁을 ${EGG_HATCH}번 들어준 덕분이에요.<br>가끔 마을에 멋진 일이 생겨요 · ${mysOf(m.k)[2]}<br>알 자리에는 새 가장 신비한 알이 생겼어요.</div>
<button type="button" class="btn" data-a="qBorn" data-k="${m.k}">마을에서 보기</button>`, { mid: true });
  }, 1750);
}
ACT.qBorn = d => { closeModal(true); setTimeout(() => qFx(d.k), 200); };
function qEggTap() {
  const v = qv(), n = v.egg.n, s = eggStage(n); if (n >= EGG_HATCH) return qHatch();
  const nx = eggNext(n), a = EGG_ST[s - 1] || 0;
  modal(`<div class="row"><h1 class="sp">가장 신비한 알</h1><button type="button" class="ibtn" style="width:40px;height:40px" data-a="close" aria-label="닫기">${ico(IC.x, 20)}</button></div>
<div style="display:flex;justify-content:center;padding:6px 0">${eggCell(s, 118, 'big')}</div>
<div class="d" style="text-align:center;font-size:20px">${eggWord(s)} · 부탁 ${n}번</div>
<div style="display:flex;flex-direction:column;gap:4px"><div class="bar" style="height:10px"><i style="width:${Math.min(100, (n - a) / (nx - a) * 100).toFixed(0)}%"></i></div><span class="sub" style="text-align:center;font-size:13.5px">${s < 9 ? `다음 모습까지 부탁 ${nx - n}번` : `깨어나기까지 부탁 ${EGG_HATCH - n}번`} · ${EGG_HATCH}번이면 깨어나요</span></div>
<div style="font-size:14px;line-height:1.55;color:var(--sub2);text-align:center">마을 친구들의 부탁을 들어줄 때마다 자라요.<br>${s < 5 ? '다 크면 금이 가기 시작해요' : '금이 다 가면 가장 신비한 친구가 깨어나요'}</div>
${v.myst.length ? `<div class="card" style="gap:6px;padding:10px"><span class="d" style="font-size:15px">이 마을의 가장 신비한 친구</span><div class="row" style="gap:6px;flex-wrap:wrap">${v.myst.map(m => `<span style="display:flex;flex-direction:column;align-items:center;font-size:12px">${mysSVG(m, 54, true)}${m.sh ? '빛나는 ' : ''}${mysOf(m.k)[1]}</span>`).join('')}</div></div>` : ''}`, { mid: true });
}
const MYS_DAY = 3;
function qMyTap(i) {
  const v = qv(), m = v.myst[+i]; if (!m) return;
  const c = v.myFx && v.myFx.k === today() ? v.myFx : (v.myFx = { k: today(), n: 0 });
  const el = $(`#world .qmy[data-i="${i}"]`);
  if (c.n >= MYS_DAY) { if (el) toastAt2(el, '오늘은 힘을 다 썼어. 내일 또 보여 줄게'); return; }
  c.n++; save(); if (el) toastAt2(el, pickR(MYS_SAY[m.k] || ['반짝!'])); vib(15); qFx(m.k);
}
function toastAt2(el, t) { const old = $('.sayb', el); if (old) old.remove(); const b = document.createElement('span'); b.className = 'sayb'; b.textContent = t; b.style.top = '-104px'; el.appendChild(b); clearTimeout(el._t); el._t = setTimeout(() => b.remove(), 2600); }

function qParts(k) {
  const R2 = (i, s) => { const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return x - Math.floor(x); }, L = (n, f) => Array.from({ length: n }, (_, i) => f(i));
  const few = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches, N = n => few ? Math.ceil(n / 3) : n, P = (c, s) => ({ c, s });
  const night = P('qnight', '');
  if (k === 'd1') return [night].concat(L(N(14), i => P('qmet', `top:${(3 + R2(i, 1) * 40).toFixed(0)}%;left:${(50 + R2(i, 2) * 55).toFixed(0)}%;animation-delay:${(.3 + i * .42).toFixed(2)}s`)));
  if (k === 'd2') return [night].concat(L(N(3), i => P('qaur a' + i, `top:${8 + i * 11}%;animation-delay:${(i * .3).toFixed(1)}s`)));
  if (k === 'd3') return L(N(36), i => { const z = (7 + R2(i, 5) * 7).toFixed(0); return P('qcry', `left:${(R2(i, 3) * 98).toFixed(0)}%;width:${z}px;height:${z}px;animation-delay:${(R2(i, 4) * 4.4).toFixed(2)}s`); });
  if (k === 'a1') return L(N(34), i => P('qpet', `left:${(8 + R2(i, 6) * 100).toFixed(0)}%;animation-delay:${(R2(i, 7) * 4.6).toFixed(2)}s`));
  if (k === 'a2') return [night].concat(L(N(26), i => P('qfly', `left:${(4 + R2(i, 8) * 92).toFixed(0)}%;top:${(12 + R2(i, 9) * 78).toFixed(0)}%;animation-delay:${(.4 + R2(i, 10) * 4).toFixed(2)}s`)));
  if (k === 'a3') return L(N(5), i => P('qbeam', `left:${(4 + i * 21)}%;animation-delay:${(i * .25).toFixed(2)}s`)).concat(L(N(9), i => P('qbfly', `left:${(8 + R2(i, 11) * 76).toFixed(0)}%;top:${(45 + R2(i, 12) * 40).toFixed(0)}%;animation-delay:${(.5 + R2(i, 13) * 3.5).toFixed(2)}s`)));
  if (k === 'c1') return L(N(30), i => { const z = (12 + R2(i, 14) * 22).toFixed(0); return P('qbb', `left:${(R2(i, 15) * 94).toFixed(0)}%;width:${z}px;height:${z}px;animation-delay:${(R2(i, 16) * 4.6).toFixed(2)}s`); });
  if (k === 'c2') return ['#F29BB5', '#F7C94B', '#A8DD95', '#9ED3E8', '#C9B6F2'].map((col, i) => P('qarc', `top:${10 + i * 3.2}%;width:${92 - i * 8}%;border-width:${few ? 10 : 14}px;border-color:${col};animation-delay:${(i * .1).toFixed(2)}s`));
  if (k === 'c3') return L(N(20), i => P('qcs', `left:${(R2(i, 17) * 96).toFixed(0)}%;animation-delay:${(R2(i, 18) * 4.4).toFixed(2)}s`)).concat(L(N(12), i => P('qhb', `left:${(4 + R2(i, 19) * 90).toFixed(0)}%;animation-delay:${(R2(i, 20) * 4).toFixed(2)}s`)));
  return [];
}
function qFx(k) {
  const f = $('#field'); if (!f) return; const old = $('.qfx', f); if (old) old.remove();
  const L = document.createElement('div'); L.className = 'qfx'; L.innerHTML = qParts(k).map(p => `<i class="${p.c}" style="${p.s}"></i>`).join(''); f.appendChild(L);
  document.querySelectorAll('#world .qmy .qmb').forEach(e => { e.classList.remove('jump'); void e.offsetWidth; e.classList.add('jump'); });
  setTimeout(() => L.remove(), 9500);
}

function qAuto() {
  V.qfxT = null; const o = O(); if (!o || R.name !== 'vil') return; const v = qv();
  if (v.myst.length && $('#field') && !$('#ov') && !document.hidden) { V.qfxI = ((V.qfxI || 0) + 1) % v.myst.length; qFx(v.myst[V.qfxI].k); }
  V.qfxT = setTimeout(qAuto, (180 + rnd(120)) * 1000);
}

function qAfterVil() {
  V.qCall = 0;
  if (V.qLook) { const f = $('#field'), ob = getObj(V.qLook); V.qLook = 0; if (f && ob) { V.cam = { x: ob.x * V.z - f.clientWidth / 2, y: (ob.y - 30) * V.z - f.clientHeight / 2 }; camApply(); } }
  if (V.qOpen) { const q = qv().qs.find(x => x.id === V.qOpen), ob = q && getObj(q.f); V.qOpen = 0; if (ob) { setTimeout(() => { if (R.name === 'vil' && !$('#ov')) qTap(ob); }, 450); return true; } }
  if (!V.qfxT) V.qfxT = setTimeout(qAuto, (180 + rnd(120)) * 1000);
  if (V.qAnim) { setTimeout(qAnimRun, 250); return true; }
  if (qv().egg.n >= EGG_HATCH && V.mode === 'main') { setTimeout(qHatch, 500); return true; }
  if (V.qNew) { V.qNew = 0; const offs = qv().qs.filter(x => x.st === 'offer'), ob = offs[0] && getObj(offs[0].f), f = $('#field'); if (ob && f) { V.cam = { x: ob.x * V.z - f.clientWidth / 2, y: (ob.y - 30) * V.z - f.clientHeight / 2 }; camApply(); } if (offs.length) setTimeout(() => { SND.fx('pop'); toast(`친구 ${offs.length}명이 부탁이 있대요! 머리 위 느낌표를 눌러 봐요`); }, 300); }
  if (V.qFull) { V.qFull = 0; setTimeout(() => toast('하던 부탁부터 도와주자! 부탁은 다섯 개까지 받을 수 있어요'), 300); }
  return false;
}

ACT.qList = () => {
  const v = qv(), d = qday();
  const st = q => q.st === 'offer' ? ['기다려요', '--y'] : q.st === 'done' ? ['다 했어요', '--a2'] : ['하는 중', '--paper'];
  const row = q => { const f = getObj(q.f), [t, c] = st(q);
    return `<div class="qrow"><span style="width:46px;height:46px;flex:none;display:flex;align-items:center;justify-content:center">${qFace(f, 42)}</span><div style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 0"><span class="row" style="gap:5px"><span class="d" style="font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f ? frName(f) : '친구')}</span><span class="chip" style="background:var(${c});font-size:11.5px;padding:1px 8px">${t}</span></span><span style="font-size:13.5px">${qGoalTxt(q)}</span>${q.st === 'on' ? `<div class="row" style="gap:6px"><div class="bar f1" style="height:7px"><i style="width:${(q.n / q.goal * 100).toFixed(0)}%"></i></div><span class="tn" style="font-size:12px">${q.n}/${q.goal}</span></div>` : ''}</div>
<div style="display:flex;flex-direction:column;gap:4px;flex:none">${q.st === 'on' ? `${QTM[q.k].quick ? `<button type="button" class="btn sm" style="height:34px;font-size:13.5px;padding:0 10px" data-a="qQuick" data-id="${q.id}">풀기</button>` : ''}<button type="button" class="btn sec sm" style="height:34px;font-size:13.5px;padding:0 10px" data-a="qDrop" data-id="${q.id}">포기</button>` : `<button type="button" class="btn sm" style="height:34px;font-size:13.5px;padding:0 10px" data-a="qSee" data-id="${q.id}">${q.st === 'done' ? '완료하기' : '보러 가기'}</button>`}</div></div>`; };
  const s = eggStage(v.egg.n);
  modal(`<div class="row"><h1 class="sp">친구들의 부탁</h1><button type="button" class="ibtn" style="width:40px;height:40px" data-a="close" aria-label="닫기">${ico(IC.x, 20)}</button></div>
<span class="sub" style="margin-top:-6px">오늘 뜬 부탁 ${d.n} / ${Q_DAY} · 받은 부탁은 날이 지나도 남아요</span>
${v.qs.length ? `<div style="display:flex;flex-direction:column;gap:8px">${v.qs.map(row).join('')}</div>` : '<div class="hint" style="text-align:center;padding:14px 0">지금은 부탁이 없어요</div>'}
<button type="button" class="card kc" data-a="qEgg" style="flex-direction:row;align-items:center;gap:10px;padding:8px 12px;text-align:left;background:var(--mainPale)"><span style="width:44px;height:52px;flex:none">${eggCell(s, 44)}</span><span class="f1" style="display:flex;flex-direction:column;gap:1px"><span class="d" style="font-size:15.5px">가장 신비한 알 · ${eggWord(s)}</span><span style="font-size:13px;color:var(--sub2)">부탁 ${v.egg.n}번 · ${EGG_HATCH}번이면 깨어나요</span></span></button>`, { mid: true });
};
ACT.qEgg = () => { closeModal(true); qEggTap(); };
ACT.qSee = d => {
  const q = qv().qs.find(x => x.id === +d.id); if (!q) return closeModal(true); const f = getObj(q.f);
  if (q.st === 'done' && (!f || R.name !== 'vil')) { closeModal(true); return qThanks(q, f); }
  closeModal(true); V.qLook = q.f; V.mode = 'main';
  if (R.name === 'vil') { render(); if (f) setTimeout(() => qTap(f), 350); } else { V.qOpen = q.id; ACT.tab({ t: 'vil' }); }
};
ACT.qDrop = d => { const q = qv().qs.find(x => x.id === +d.id); if (!q) return; modal(`<h1>이 부탁을 그만둘까요?</h1><div class="hint" style="font-size:15px">${qGoalTxt(q)}<br>그만둬도 괜찮아요. 아무것도 잃지 않아요.</div><div class="row"><button type="button" class="btn sec f1" data-a="qList">계속할래요</button><button type="button" class="btn f1" data-a="qDropYes" data-id="${q.id}">그만두기</button></div>`, { mid: true }); };
ACT.qDropYes = d => { const v = qv(); v.qs = v.qs.filter(q => q.id !== +d.id); save(); closeModal(true); render(); toast('부탁을 그만뒀어요'); };
ACT.qQuick = d => { const q = qv().qs.find(x => x.id === +d.id); if (q) qqStart(q); };

function qSheetLine(f) {
  const q = qOf(f.id); if (!q || q.st !== 'on') return '';
  return `<div class="card" style="flex-direction:row;align-items:center;gap:8px;padding:8px 12px;border-radius:16px;background:var(--t1)">${ico(QIC, 20)}<div class="f1" style="display:flex;flex-direction:column;gap:3px;min-width:0"><span style="font-size:14px">부탁 · ${qGoalTxt(q)}</span><div class="row" style="gap:6px"><div class="bar f1" style="height:7px"><i style="width:${(q.n / q.goal * 100).toFixed(0)}%"></i></div><span class="tn" style="font-size:12px">${q.n}/${q.goal}</span></div></div><button type="button" class="chip ln" style="background:var(--paper);font-size:12.5px" data-a="qDrop" data-id="${q.id}">포기</button></div>`;
}

function quickWords(kind) { const m = wmap(); return curBook().words.filter(w => m[w[0]] && (kind !== 's' || /^[A-Za-z]{4,12}$/.test(w[0]))); }
function misspell(en) {
  const out = new Set(), lo = en.toLowerCase(), V5 = 'aeiou';
  const ops = [s => { const i = 1 + rnd(s.length - 2); return s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2); },
    s => { const i = 1 + rnd(s.length - 1); return s.slice(0, i) + s[i] + s.slice(i); },
    s => { const i = 1 + rnd(s.length - 1); return s.slice(0, i) + s.slice(i + 1); },
    s => { const idx = [...s].map((c, i) => V5.includes(c) ? i : -1).filter(i => i >= 0); if (!idx.length) return s + 'e'; const i = pickR(idx); return s.slice(0, i) + pickR(V5.replace(s[i], '').split('')) + s.slice(i + 1); }];
  for (let t = 0; t < 60 && out.size < 3; t++) { const x = pickR(ops)(lo); if (x && x !== lo && x.length >= 2) out.add(x); }
  return [...out];
}
function qqMake(q) {
  const T = QTM[q.k], ws = quickWords(T.quick), w = pickR(ws.filter(x => !(q.used || []).includes(x[0])).length ? ws.filter(x => !(q.used || []).includes(x[0])) : ws);
  q.used = (q.used || []).concat(w[0]).slice(-6);
  if (T.quick === 's') { const c = shuffle([w[0].toLowerCase()].concat(misspell(w[0]))); return { w, ch: c, ans: c.indexOf(w[0].toLowerCase()), en: 1 }; }
  if (T.quick === 'm') { const c = shuffle([w].concat(others(w, 3, x => x[1]))); return { w, ch: c.map(x => x[1]), ans: c.indexOf(w) }; }
  const c = shuffle([w].concat(others(w, 3, x => x[0].toLowerCase()))); return { w, ch: c.map(x => x[0]), ans: c.indexOf(w), en: 1 };
}
function qqStart(q) { V.qq = { id: q.id, cur: qqMake(q), miss: 0, wrong: [] }; qqDraw(); }
function qqDraw() {
  const s = V.qq, q = qv().qs.find(x => x.id === s.id); if (!q) return closeModal(true);
  const T = QTM[q.k], f = getObj(q.f), c = s.cur, w = c.w;
  const prompt = T.quick === 'm' ? `<div class="row" style="gap:10px;justify-content:center"><span class="d" style="font-size:${fitEnAny(w[0], 38, 200)}px">${esc(w[0])}</span>${spkBtn(w[0])}</div>`
    : T.quick === 'l' ? `<div style="display:flex;flex-direction:column;align-items:center;gap:6px"><button type="button" class="ibtn rd" style="width:74px;height:74px;background:var(--y)" data-a="say" data-t="${esc(w[0])}" aria-label="다시 듣기">${ico(IC.spk, 38)}</button><span class="sub">다시 들으려면 눌러요</span></div>`
    : `<div class="d" style="font-size:${w[1].length > 12 ? 22 : 28}px;text-align:center">${esc(w[1])}</div>${T.quick === 's' ? `<div class="row" style="gap:8px;justify-content:center"><span class="sub">소리 듣기</span>${spkBtn(w[0])}</div>` : ''}`;
  const body = `<div class="row" style="gap:10px">${qFace(f, 48)}<span class="f1 d" style="font-size:17px">${esc(f ? frName(f) : '친구')}의 깜짝 문제</span><span class="tn sub">${q.n + 1} / ${q.goal}</span></div>
<div class="card" style="align-items:center;gap:8px;padding:18px 12px;border-radius:22px">${prompt}</div>
<div class="grid2">${c.ch.map((x, i) => { const st = c.done ? (i === c.ans ? ' ok' : i === c.pick ? ' no' : ' off') : s.wrong.includes(i) ? ' no off' : ''; return `<button type="button" class="choice c${i}${st}${c.en ? ' en' : ''}" data-a="qqAns" data-i="${i}" ${s.wrong.includes(i) || c.done ? 'disabled' : ''}><b>${c.done && i === c.ans ? ico(IC.check, 17, 3.4) : i + 1}</b><span style="font-size:${c.en ? fitEnAny(x, 21, 106) : fitKo(x, 18)}px">${esc(x)}</span></button>`; }).join('')}</div>
<div class="hint" style="text-align:center;min-height:20px">${s.msg || (T.quick === 's' ? '맞는 철자를 골라 줘요' : T.quick === 'r' ? '뜻을 보고 영어를 골라 줘요' : T.quick === 'l' ? '들리는 단어를 골라 줘요' : '뜻을 골라 줘요')}</div>
<button type="button" class="btn sec sm" data-a="qqStop">나중에 할게요</button>`;
  const w0 = $('#qqw'); if (w0) w0.innerHTML = body; else modal(`<div id="qqw" style="display:flex;flex-direction:column;gap:12px">${body}</div>`, { mid: true });
  if (T.quick === 'l' && !c.said) { c.said = 1; setTimeout(() => speak(w[0], RATE[O().speed]), 250); }
}
ACT.qqAns = d => {
  const s = V.qq; if (!s || s.cur.done) return; const q = qv().qs.find(x => x.id === s.id); if (!q) return closeModal(true); const i = +d.i, c = s.cur;
  if (i === c.ans) {
    c.done = 1; c.pick = i; q.n++; s.msg = pickR(['맞아, 그거야!', '고마워!', '역시!']); vib(15); SND.fx('tap'); speak(c.w[0], RATE[O().speed]); qqDraw();
    setTimeout(() => { if (!$('#qqw')) return; if (q.n >= q.goal) { q.st = 'done'; save(); V.qq = null; closeModal(true); return qThanks(q, getObj(q.f)); } save(); s.cur = qqMake(q); s.wrong = []; s.miss = 0; s.msg = ''; qqDraw(); }, 900);
    return;
  }
  s.miss++; vib(50);
  if (s.miss < 2) { s.wrong.push(i); s.msg = '한 번 더 해 볼까?'; return qqDraw(); }
  c.done = 1; c.pick = i; s.msg = `정답은 ${c.en ? c.ch[c.ans] : c.ch[c.ans]}! 괜찮아, 다음에 다시 물어볼게`; save(); qqDraw();
  setTimeout(() => { if ($('#qqw')) { V.qq = null; closeModal(true); render(); } }, 2200);
};
ACT.qqStop = () => { V.qq = null; save(); closeModal(true); render(); };

function qHomeCard() {
  const v = qv(), on = v.qs.filter(q => q.st !== 'offer'), off = v.qs.filter(q => q.st === 'offer').length, s = eggStage(v.egg.n);
  if (!v.qs.length && !v.egg.n && !v.myst.length) return '';
  const rows = on.slice(0, 3).map(q => { const f = getObj(q.f);
    return `<button type="button" class="qrow kc" data-a="qSee" data-id="${q.id}"><span style="width:38px;height:38px;flex:none;display:flex;align-items:center;justify-content:center">${qFace(f, 36)}</span><span style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1 1 0;text-align:left"><span style="font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${qGoalTxt(q)}</span>${q.st === 'done' ? '<span class="d" style="font-size:13px;color:var(--ink)">다 했어요! 친구를 찾아가 봐요</span>' : `<span class="row" style="gap:6px"><span class="bar f1" style="height:7px"><i style="width:${(q.n / q.goal * 100).toFixed(0)}%"></i></span><span class="tn" style="font-size:12px">${q.n}/${q.goal}</span></span>`}</span>${q.st === 'done' ? '<span class="qbub qok sm">완료</span>' : ico(IC.fwd, 16)}</button>`; }).join('');
  return `<div class="card" style="gap:8px"><div class="row" style="gap:8px">${ttl('친구들의 부탁', '--a1', QIC)}<span class="sp"></span>${on.length > 3 ? `<button type="button" class="chip ln" style="background:var(--paper)" data-a="qList">모두 ${v.qs.length}개</button>` : ''}</div>
${rows}${off ? `<button type="button" class="qrow kc" data-a="tab" data-t="vil" style="background:var(--stary)"><span class="qbub qon sm">!</span><span class="f1" style="font-size:14px;text-align:left">부탁 ${off}개가 기다려요 · 마을에서 받아 주세요</span>${ico(IC.fwd, 16)}</button>` : ''}${!v.qs.length ? '<span class="sub" style="font-size:13.5px">지금은 부탁이 없어요. 공부를 하다 보면 친구들이 또 부탁해요</span>' : ''}
<button type="button" class="row" data-a="qEggH" style="gap:10px;border:0;background:none;padding:2px 0 0;text-align:left"><span style="width:40px;height:46px;flex:none">${eggCell(s, 40)}</span><span class="f1" style="display:flex;flex-direction:column;gap:3px"><span style="font-size:13.5px"><span class="d">가장 신비한 알</span> · ${eggWord(s)}</span><span class="row" style="gap:6px"><span class="bar f1" style="height:7px"><i style="width:${(v.egg.n / EGG_HATCH * 100).toFixed(0)}%;background:#C9B6F2"></i></span><span class="tn" style="font-size:12px">${v.egg.n}/${EGG_HATCH}</span></span></span></button></div>`;
}
ACT.qEggH = () => qEggTap();

function qBefore() { const n = qTick(); if (n) V.qNew = (V.qNew || 0) + n; }

HELP.splice(3, 0, { t: '부탁과 가장 신비한 알', d: '친구 머리 위에 느낌표가 뜨면 눌러서 부탁을 받아요. 부탁은 모두 공부예요.<br>들어줄 때마다 꼭대기 광장의 알이 자라고, 80번이면 가장 신비한 친구가 깨어나요.', a: () => `<span style="position:relative;padding-top:30px">${frInner({ k: TH().hero, lv: 2 }, 62, true)}<span class="qbub qon" style="left:50%;top:0;margin-left:-15px">!</span></span>` + HAR + eggCell(5, 70) });
