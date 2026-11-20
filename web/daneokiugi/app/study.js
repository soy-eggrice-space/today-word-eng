'use strict';
// 단어키우기 · 공부 (단어 카드, 시험, 결과, 오답노트, 기록)
let SS = null;
const CH = 1000;   // 단어 카드를 전부 본 다음에 시험을 한꺼번에 봐요
const curBook = () => BOOKS.find(b => b.id === O().book);
const wmap = () => { const o = O(); return o.w[o.book] || (o.w[o.book] = {}); };
function counts() {
  const m = wmap(), b = curBook(); let a = 0, c = 0, e = 0;
  for (const w of b.words) { const s = m[w[0]]; if (!s) continue; if (s[0] >= 3) a++; else if (s[0] === 2) c++; else e++; }
  return { done: a, mid: c, seen: e, none: b.words.length - a - c - e, total: b.words.length };
}
// 밸런스: 단어장 하나를 끝냈을 때 마을이 80%쯤 되도록, 상자 간격과 상자 값을 단어장 크기에 맞춰요 (design/balance.js로 맞춘 값)
// 왕초보 200개 → 맞힌 문제 4개마다 · 별 3개 / 500개 → 10개마다 · 별 7개 / 1000개 → 20개마다 · 별 14개
const boxEvery = () => Math.max(3, Math.round(curBook().words.length / 50));
const boxPrice = () => Math.max(3, Math.round(curBook().words.length / 70));
const boxLeft = () => Math.max(1, boxEvery() - (O().boxc || 0));
// 새 단어는 마을마다 다르게 섞은 순서로, 복습은 때가 된 단어부터 (오답노트 단어 먼저) 섞어서 내요
function hashS(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const REVIEW = { starter: .5 };   // 왕초보는 복습 절반, 나머지는 복습 40%
function pickWords(n) {
  const o = O(), b = curBook(), m = wmap(), t = dnum(today());
  if (!o.seed) o.seed = 1 + rnd(1e9);
  const ord = w => hashS(o.seed + ':' + w[0]);
  const due = b.words.filter(w => m[w[0]] && m[w[0]][0] < 3 && m[w[0]][2] <= t).sort((x, y) => (o.wr[y[0]] ? 1 : 0) - (o.wr[x[0]] ? 1 : 0) || m[x[0]][2] - m[y[0]][2] || ord(x) - ord(y));
  const old = b.words.filter(w => m[w[0]] && m[w[0]][0] >= 3 && m[w[0]][2] <= t).sort((x, y) => m[x[0]][2] - m[y[0]][2] || ord(x) - ord(y));
  const fresh = b.words.filter(w => !m[w[0]]).sort((x, y) => ord(x) - ord(y));
  const want = Math.round(n * (REVIEW[o.book] || .4)), nold = Math.min(old.length, Math.max(1, Math.round(n * .1)));
  let rev = due.slice(0, Math.max(0, want - nold)); rev = rev.concat(old.slice(0, want - rev.length));
  if (rev.length < want) rev = rev.concat(due.slice(rev.length).filter(w => !rev.includes(w)).slice(0, want - rev.length));
  let list = rev.concat(fresh.slice(0, n - rev.length));
  if (list.length < n) list = list.concat(due.concat(old).filter(w => !list.includes(w)).slice(0, n - list.length));
  if (list.length < n) { const rest = b.words.filter(w => !list.includes(w)).sort((x, y) => (m[x[0]] ? m[x[0]][2] : 0) - (m[y[0]] ? m[y[0]][2] : 0) || ord(x) - ord(y)); list = list.concat(rest.slice(0, n - list.length)); }
  return shuffle(list);
}
function startSession(kind, list) {
  const o = O(), d = dayOf(o);
  // 하다가 그만둔 공부가 있으면 남은 단어부터, 이미 본 카드는 건너뛰고 이어서 해요
  const rs = !list && kind === 'daily' && o.resume && o.resume.k === d.k && o.resume.b === o.book ? o.resume : null;
  const left = rs ? rs.words.map(e => curBook().words.find(w => w[0] === e)).filter(Boolean) : [];
  const words = list || (left.length ? left : pickWords(d.words >= o.per ? 10 : Math.max(5, o.per - d.words)));
  if (!words.length) return toast('공부할 단어가 없어요');
  SS = { seen: {}, ans: {}, skip: left.length ? Object.assign({}, ...rs.seen.map(e => ({ [e]: 1 }))) : {}, kind, words, head: left.length ? Math.min(rs.head || 0, left.length) : 0, chunk: 0, ci: 0, order: [], qi: 0, total: words.length, done: 0, ok: 0, stars: 0, box: 0, wrong: [], retry: false, t0: Date.now(), q: null, card: o.mode === 'card' && kind === 'daily' };
  enterChunk();
}
// 이어서 할 때는 하다 만 묶음의 남은 단어(head개)가 첫 묶음이 돼요
const chunkAt = i => { const h = SS.head || 0; if (!h) return SS.words.slice(i * CH, i * CH + CH); return i === 0 ? SS.words.slice(0, h) : SS.words.slice(h + (i - 1) * CH, h + i * CH); };
const chunkWords = () => chunkAt(SS.chunk);
const cardWords = () => chunkWords().filter(w => !SS.skip[w[0]]);
function enterChunk() { SS.ci = 0; if (SS.card && cardWords().length) return go('card', {}, { reset: true }); beginQuiz(); if (R.name === 'quiz') render(); else go('quiz', {}, { reset: true }); }
function beginQuiz() { SS.order = shuffle(chunkWords()); SS.qi = 0; makeQ(); }
function others(w, n, f) {
  const b = curBook(), out = [], seen = new Set([f(w)]);
  const pool = shuffle(b.words.filter(x => x[2] === w[2])).concat(shuffle(b.words));
  for (const x of pool) { const v = f(x); if (seen.has(v)) continue; seen.add(v); out.push(x); if (out.length >= n) break; }
  return out;
}
function makeQ() {
  const o = O(), w = SS.order[SS.qi], en = w[0];
  const spell = /^[A-Za-z]{2,12}$/.test(en);
  let types = Object.keys(o.types).filter(k => o.types[k]).filter(k => (k !== 't5' || w[3]) && ((k !== 't3' && k !== 't4') || spell));
  if (SS.retry || !types.length) types = ['t1'];
  const type = pickR(types), q = { w, type, done: false };
  if (type === 't1') { const c = shuffle([w].concat(others(w, 3, x => x[1]))); q.choices = c.map(x => x[1]); q.ans = c.indexOf(w); }
  else if (type === 't2' || type === 't5') {
    let ot = others(w, 6, x => x[0].toLowerCase());
    if (type === 't5') ot = ot.filter(x => !new RegExp('(^|[^A-Za-z])' + x[0] + '([^A-Za-z]|$)', 'i').test(w[3]));
    const c = shuffle([w].concat(ot.slice(0, 3))); q.choices = c.map(x => x[0]); q.ans = c.indexOf(w);
    if (type === 't5') q.blank = w[3].replace(new RegExp('(^|[^A-Za-z])(' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![A-Za-z])', en === 'I' ? '' : 'i'), '$1____');
  } else if (type === 't3') {
    const ls = en.toLowerCase().split(''), extra = shuffle('abcdefghijklmnopqrstuvwxyz'.split('').filter(c => !ls.includes(c))).slice(0, ls.length < 5 ? 2 : 3);
    q.tiles = shuffle(ls.concat(extra)); q.pick = ls.map(() => null); q.fix = {}; q.hint = false;   // pick[칸] = 고른 글자 조각, fix = 힌트로 채운 칸
  } else { q.hint = false; q.val = ''; }
  SS.q = q;
}
function record(w, ok, gain) {
  const o = O(), m = wmap(), d = dayOf(o), t = dnum(d.k), isNew = !m[w[0]], s = m[w[0]] || [1, 0, t], wasDone = s[0] >= 3; let wrOut = 0, box = 0;
  if (!d.q) { o.streak = o.last === dfrom(t - 1) ? o.streak + 1 : (o.last === d.k ? o.streak : 1); o.last = d.k; o.best = Math.max(o.best || 0, o.streak); }
  d.q++; SS.done++; if (!SS.retry) SS.ans[w[0]] = 1;
  if (SS.kind === 'daily' && !SS.retry) d.words++;
  if (ok) {
    d.ok++; SS.ok++; s[1] = Math.min(3, s[1] + 1); s[0] = s[1] >= 3 ? 3 : 2; s[2] = t + (o.book === 'starter' ? [1, 2, 4] : [1, 3, 7])[s[1] - 1];
    addStars(gain); SS.stars += gain;
    o.boxc = (o.boxc || 0) + 1; if (o.boxc >= boxEvery()) { o.boxc = 0; o.eggBox++; o.itemBox++; SS.box++; box = 1; }   // 맞힌 문제가 모이면 상자 묶음
    const wr = o.wr[w[0]]; if (wr) { wr.ok = (wr.ok || 0) + 1; if (wr.ok >= 3) { delete o.wr[w[0]]; bump('wrOut'); wrOut = 1; } }
    if (SS.q && (SS.q.type === 't3' || SS.q.type === 't4')) bump('spell');
  } else {
    s[1] = 0; s[0] = Math.max(1, Math.min(s[0], 2)); s[2] = t + 1;
    const wr = o.wr[w[0]] || (o.wr[w[0]] = { n: 0, ok: 0, b: o.book }); wr.n++; wr.ok = 0; wr.last = d.k;
    if (!d.wrong.includes(w[0])) d.wrong.push(w[0]);
    if (!SS.retry && !SS.wrong.includes(w)) SS.wrong.push(w);
  }
  m[w[0]] = s;
  const h = o.hist[d.k] || (o.hist[d.k] = { q: 0, ok: 0, st: 0, ms: 0 }); h.q = d.q; h.ok = d.ok; if (ok) h.st += gain;
  // 부모 리포트에 쓰는 하루 기록: 새로 본 단어, 복습한 단어, 유형별 정답, 틀린 단어, 공부한 시각
  const now = new Date(), mn = now.getHours() * 60 + now.getMinutes(), ty = SS.q && SS.q.type; d.sw = d.sw || {};
  if (h.t0 == null) h.t0 = mn; h.t1 = mn; h.b = o.book;
  if (!d.sw[w[0]]) { d.sw[w[0]] = 1; if (isNew) h.nw = (h.nw || 0) + 1; else h.rv = (h.rv || 0) + 1; }
  if (ty) { h.ty = h.ty || {}; const a = h.ty[ty] || (h.ty[ty] = [0, 0]); a[0]++; if (ok) a[1]++; }
  if (!ok) { h.wr = h.wr || {}; if (h.wr[w[0]] || Object.keys(h.wr).length < 40) h.wr[w[0]] = (h.wr[w[0]] || 0) + 1; }
  if (!wasDone && s[0] >= 3) h.pf = (h.pf || 0) + 1; if (wrOut) h.wo = (h.wo || 0) + 1; if (box) h.bx = (h.bx || 0) + 1;
  save();
}
function finalize(ok, gain) {
  const q = SS.q; if (q.done) return;
  q.done = true; q.ok = ok; q.gain = ok ? gain : 0;
  record(q.w, ok, gain); vib(ok ? 15 : 60);
  render(); speak(q.w[0], RATE[O().speed]);
}
function nextQ() {
  SS.qi++;
  if (SS.qi < SS.order.length) { makeQ(); return render(); }
  if (!SS.retry) {
    SS.chunk++;
    if (chunkWords().length) return enterChunk();
    if (SS.wrong.length) { SS.retry = true; SS.order = SS.wrong.slice(); SS.total += SS.order.length; SS.wrong = []; SS.qi = 0; makeQ(); toast('틀린 단어를 한 번 더 풀어요'); return render(); }
  }
  finishSession();
}
function finishSession() {
  const o = O(), d = dayOf(o), ms = Date.now() - SS.t0;
  d.ms += ms; const h = o.hist[d.k]; if (h) h.ms = d.ms;
  if (SS.kind === 'daily') delete o.resume;
  if (SS.kind === 'daily' && SS.done >= 5 && new Date().getHours() < 8) bump('early');
  if (SS.kind === 'daily' && SS.done >= 5 && SS.ok === SS.done) bump('perfect');
  save(true); go('result', {}, { reset: true });
}
function quitAsk() {
  modal(`<h1>그만할까요?</h1><div class="hint" style="font-size:15px">지금까지 푼 문제와 별은 그대로 남아요.</div><div class="row"><button type="button" class="btn sec f1" data-a="quitYes">그만하기</button><button type="button" class="btn f2" data-a="close">계속 공부하기</button></div>`);
  return true;
}
ACT.quit = quitAsk;
ACT.quitYes = () => { closeModal(true);
  if (SS && SS.kind === 'daily' && !SS.retry) { const o = O(), rest = SS.words.filter(w => !SS.ans[w[0]]).map(w => w[0]); if (rest.length) o.resume = { k: dayOf(o).k, b: o.book, words: rest, head: chunkWords().filter(w => !SS.ans[w[0]]).length, seen: Object.keys(Object.assign({}, SS.skip, SS.seen)) }; else delete o.resume; }
  if (SS && SS.done) { const o = O(), d = dayOf(o); d.ms += Date.now() - SS.t0; if (o.hist[d.k]) o.hist[d.k].ms = d.ms; } SS = null; save(); go('home', {}, { reset: true }); };
function studyTop() { return `<div class="row" style="gap:12px"><button type="button" class="ibtn" data-a="quit" aria-label="그만하기">${ico(IC.x)}</button><div class="bar" style="flex:1 1 0"><i style="width:${Math.round(SS.done / SS.total * 100)}%"></i></div><div class="tn" style="font-size:14.5px;color:var(--sub)">${Math.min(SS.done + 1, SS.total)} / ${SS.total}</div></div>`; }
const spkBtn = (en, big) => `<button type="button" class="ibtn rd" style="width:48px;height:48px;background:var(--y)" data-a="say" data-t="${esc(en)}" aria-label="발음 듣기">${ico(IC.spk, 24)}</button>`;
ACT.say = d => speak(d.t, RATE[O().speed]);

// 예문 속의 그 단어는 형광펜으로 칠하고 글자색도 바꿔요
const hlEx = w => esc(w[3]).replace(new RegExp('(^|[^A-Za-z])(' + w[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')(?![A-Za-z])', w[0] === 'I' ? '' : 'i'), '$1<mark class="hl">$2</mark>');

// ---------- 단어 카드 ----------
let cardT = [];
const clearCardT = () => { cardT.forEach(clearTimeout); cardT = []; };
SCR.card = {
  view() {
    const o = O(), cw = cardWords(), w = cw[SS.ci];
    return `<div class="scr">${studyTop()}
<div class="row" style="justify-content:space-between"><div class="sub" style="font-size:14.5px">단어 카드 · ${SS.ci + 1} / ${cw.length}</div><button type="button" class="chip ln d" style="height:40px;padding:0 14px;border-radius:20px;border-width:2px;font-size:15px;background:var(${o.auto ? '--main' : '--paper'})" data-a="autoTog">${o.auto ? '자동 넘기기 켜짐' : '자동 넘기기 꺼짐'}</button></div>
<div class="card" style="flex:1 1 0;min-height:0;border-radius:32px;box-shadow:0 5px 0 rgba(74,65,56,.16);padding:24px 20px;align-items:center;gap:12px;justify-content:center">
<span class="chip" style="background:var(--t0)">${w[2]}</span>
<div class="row" style="gap:12px;margin-top:6px"><div class="d" style="font-size:${w[0].length > 9 ? 38 : 50}px;line-height:1.15">${esc(w[0])}</div>${spkBtn(w[0])}</div>
<div style="font-size:26px;text-align:center">${esc(w[1])}</div>
${w[3] ? `<button type="button" data-a="say" data-t="${esc(w[3])}" style="margin-top:22px;width:100%;border:0;background:var(--mainPale);border-radius:20px;padding:14px 16px;display:flex;flex-direction:column;gap:4px;text-align:left"><span style="font-size:19px;line-height:1.5">${hlEx(w)}</span><span style="font-size:15px;line-height:1.4;color:var(--sub)">${esc(w[4])}</span></button>` : ''}
</div>
<div class="row" style="gap:12px"><button type="button" class="btn sec f1" data-a="cardGo" data-d="-1" ${SS.ci ? '' : 'disabled'}>이전</button><button type="button" class="btn f2" data-a="cardGo" data-d="1">${SS.ci + 1 < cw.length ? '다음' : '시험 보기'}</button></div>
${SS.ci + 1 < cw.length ? `<button type="button" class="btn sec sm" data-a="cardSkip" style="align-self:center;gap:6px;padding:0 18px">카드 그만 보고 바로 시험 보기</button>` : ''}</div>`;
  },
  after() {
    clearCardT();
    const o = O(), w = cardWords()[SS.ci], m = wmap(), r = RATE[o.speed];
    SS.seen[w[0]] = 1;
    if (!m[w[0]]) { m[w[0]] = [1, 0, dnum(today())]; save(); }
    speak(w[0], r);
    if (!o.auto) return;
    cardT.push(setTimeout(() => speak(w[0], r), 1700));
    const ex = o.exRead && w[3];
    if (ex) cardT.push(setTimeout(() => speak(w[3], r), 3400));
    cardT.push(setTimeout(() => ACT.cardGo({ d: '1' }), ex ? 3400 + 2600 + w[3].length * 60 : 3600));
  },
  leave: clearCardT,
  back: quitAsk
};
ACT.autoTog = () => { const o = O(); o.auto = !o.auto; save(); render(); };
ACT.cardSkip = () => { clearCardT(); beginQuiz(); go('quiz', {}, { reset: true }); };
ACT.cardGo = d => {
  clearCardT();
  const n = SS.ci + (+d.d), cw = cardWords();
  if (n < 0) return;
  if (n >= cw.length) { beginQuiz(); return go('quiz', {}, { reset: true }); }
  SS.ci = n; render();
};

// ---------- 시험 ----------
// 마을 친구 다섯 마리가 아래에서 응원해요
function cheerRow(q, hasFb) {
  if (q.type === 't4' && !q.done) return '';
  if (!SS.cheer) SS.cheer = shuffle(friends()).slice(0, 4).map(f => f.id);
  const fs = SS.cheer.map(getObj).filter(Boolean); if (!fs.length) return '';
  if (!q.say) q.say = pickR(['힘내!', '할 수 있어!', '천천히 해도 돼', '같이 하자!', '우리가 응원해', '잘하고 있어!', '파이팅!']);
  if (q.done && !q.say2) q.say2 = q.ok ? pickR(['잘했어!', '최고야!', '와, 멋지다!', '역시!', '대단해!']) : pickR(['괜찮아!', '다음엔 맞힐 거야', '같이 기억하자', '틀려도 괜찮아']);
  const st = q.done ? (q.ok ? ' yay' : ' aw') : '', bits = q.done && q.ok ? [8, 24, 41, 59, 76, 92].map((x, i) => `<i class="cf" style="left:${x}%;animation-delay:${i * 90}ms">${i % 2 ? gheartI(13) : star5(15)}</i>`).join('') : '';
  const flag = (side, c) => `<span class="cflag ${side}"><svg width="26" height="34" viewBox="0 0 26 34" aria-hidden="true"><path d="M4 2v30" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M5 3h17l-5 6 5 6H5Z" fill="var(${c})" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/></svg></span>`;
  return `<div class="cheer${st}${hasFb ? '' : ' mta'}"><span class="say">${q.done ? q.say2 : q.say}</span><div class="crew">${bits}${flag('l', '--main')}${fs.map((f, i) => `<span style="animation-delay:${i * 120}ms">${frInner(Object.assign({}, f, { seat: null, hold: null, st: 0 }), 50 + Math.min(4, f.m ? 3 : f.lv || 1) * 3, true)}</span>`).join('')}${flag('r', '--y')}</div></div>`;
}
const gheartI = sz => `<svg width="${sz}" height="${sz}" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 12.2C2.6 9 1.2 6.6 1.6 4.4 2 2.4 4.6 1.6 7 4.2 9.4 1.6 12 2.4 12.4 4.4 12.8 6.6 11.4 9 7 12.2Z" fill="#FF9DB0" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
SCR.quiz = {
  view() {
    const o = O(), q = SS.q, w = q.w, t = q.type;
    const head = { t1: '뜻을 골라 보세요', t2: '영어 단어를 골라 보세요', t3: '글자를 눌러 단어를 만들어요', t4: '영어 단어를 써 보세요', t5: '빈칸에 들어갈 단어를 골라요' }[t];
    let prompt, body;
    if (t === 't1') prompt = `<div class="row" style="gap:12px"><div class="d" style="font-size:${w[0].length > 9 ? 36 : 48}px;line-height:1.2">${esc(w[0])}</div>${spkBtn(w[0])}</div>`;
    else if (t === 't5') prompt = `<div class="d" style="font-size:24px;line-height:1.45;text-align:center">${q.done ? hlEx(w) : esc(q.blank)}</div><div style="font-size:15px;color:var(--sub);text-align:center">${esc(w[4])}</div>`;
    else prompt = `<div class="d" style="font-size:${w[1].length > 12 ? 26 : 34}px;line-height:1.25;text-align:center">${esc(w[1])}</div>${t === 't2' ? '' : `<div class="row" style="gap:8px"><span class="sub">소리 듣기</span>${spkBtn(w[0])}</div>`}`;
    if (q.choices) {
      body = `<div class="grid2">${q.choices.map((c, i) => { const st = !q.done ? '' : i === q.ans ? ' ok' : i === q.pick ? ' no' : ' off'; const mark = q.done && i === q.ans ? ico(IC.check, 17, 3.4) : q.done && i === q.pick ? ico(IC.x, 15, 3.4) : i + 1;
        return `<button type="button" class="choice c${i}${st}${t === 't1' ? '' : ' en'}" data-a="ans" data-i="${i}"><b>${mark}</b><span${t !== 't1' && c.length > 9 ? ` style="font-size:${c.length > 12 ? 15 : 18}px"` : ''}>${esc(c)}</span></button>`; }).join('')}</div>`;
    } else if (t === 't3') {
      const ls = w[0].toLowerCase().split('');
      const mine = q.pick.some((v, i) => v != null && !q.fix[i]);
      body = `<div class="row" style="justify-content:center;gap:6px;flex-wrap:wrap;min-height:48px">${ls.map((_, i) => `<span class="slot${q.fix[i] && !q.done ? ' fix' : ''}">${q.done ? ls[i] : (q.pick[i] != null ? q.tiles[q.pick[i]] : '')}</span>`).join('')}</div>
<div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap">${q.tiles.map((c, i) => `<button type="button" class="lt${q.pick.includes(i) ? ' used' : ''}" data-a="lt" data-i="${i}" ${q.done || q.pick.includes(i) ? 'disabled' : ''}>${c}</button>`).join('')}</div>
<div class="row" style="gap:10px"><button type="button" class="btn sec sm" style="gap:6px;flex:.8 1 0" data-a="ltHint" ${q.hint || q.done ? 'disabled' : ''}>${ico(IC.bulb, 20)}힌트</button><button type="button" class="btn sec sm" style="gap:6px;flex:1.2 1 0;background:var(--t3);white-space:nowrap;font-size:16px;padding:0 8px 3px" data-a="ltDel" ${q.done || !mine ? 'disabled' : ''}>${ico(IC.del, 22)}한 글자 지우기</button></div>
${q.hint && !q.done ? '<div class="hint" style="text-align:center">노란 칸은 힌트로 채운 글자예요</div>' : ''}`;
    } else {
      body = `<input class="inp" id="kb" type="text" autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="text" value="${esc(q.done ? w[0] : q.val)}" ${q.done ? 'readonly' : ''} placeholder="${q.hint ? '_ '.repeat(w[0].length).trim() : '여기에 써요'}">
<div class="row" style="gap:10px"><button type="button" class="btn sec sm" style="gap:6px" data-a="kbHint" ${q.hint || q.done ? 'disabled' : ''}>${ico(IC.bulb, 20)}글자 수 힌트</button><button type="button" class="btn sm f1" data-a="kbOk" ${q.done ? 'disabled' : ''}>다 썼어요</button></div>
<div class="hint" style="text-align:center">${q.hint ? `${w[0].length}글자예요 · 힌트를 보고 맞히면 별 한 개` : '힌트 없이 맞히면 별 두 개'}</div>`;
    }
    const fb = q.done ? `<div class="card mta" style="background:var(${q.ok ? '--mainPale' : '--p'})"><div class="row">${stk(TH().hero, 52, '', q.ok)}<div style="display:flex;flex-direction:column;gap:2px;min-width:0"><span class="d" style="font-size:21px">${q.ok ? `맞았어요! 별 +${q.gain}` : '괜찮아요, 이렇게 기억해요'}</span><span style="font-size:14.5px;color:var(--sub2)">${esc(w[0])} · ${esc(w[1])}${q.ok ? '' : ' · 오답노트에 담았어요'}</span></div></div>${!q.ok && w[3] ? `<button type="button" data-a="say" data-t="${esc(w[3])}" style="border:0;background:var(--paper);border-radius:16px;padding:10px 14px;display:flex;flex-direction:column;gap:2px;text-align:left"><span style="font-size:16.5px;line-height:1.5">${hlEx(w)}</span><span style="font-size:13.5px;line-height:1.4;color:var(--sub)">${esc(w[4])}</span></button>` : ''}<button type="button" class="btn" data-a="nextQ">다음</button></div>` : '';
    return `<div class="scr">${studyTop()}
<div class="card" style="margin-top:4px;border-radius:28px;padding:${t === 't5' ? 22 : 28}px 18px;align-items:center;gap:10px"><div class="sub" style="font-size:14.5px">${SS.retry ? '한 번 더 · ' : SS.kind === 'wrong' ? '오답노트 · ' : ''}${head}</div>${prompt}</div>
${body}${fb}${cheerRow(q, !!fb)}</div>`;
  },
  after() { const k = $('#kb'); if (k && !SS.q.done) { k.focus(); k.oninput = () => { SS.q.val = k.value; }; k.onkeydown = e => { if (e.key === 'Enter') ACT.kbOk(); }; } },
  back: quitAsk
};
ACT.ans = d => { const q = SS.q; if (q.done) return; q.pick = +d.i; finalize(q.pick === q.ans, 1); };
const ltCheck = () => { const q = SS.q, en = q.w[0].toLowerCase(); if (q.pick.every(v => v != null)) return finalize(q.pick.map(i => q.tiles[i]).join('') === en, 1); render(); };
ACT.lt = d => { const q = SS.q; if (q.done) return; const at = q.pick.indexOf(null); if (at < 0 || q.pick.includes(+d.i)) return; q.pick[at] = +d.i; ltCheck(); };   // 비어 있는 첫 칸에 들어가요
ACT.ltDel = () => { const q = SS.q; if (q.done) return; for (let i = q.pick.length - 1; i >= 0; i--) if (q.pick[i] != null && !q.fix[i]) { q.pick[i] = null; break; } render(); };   // 내가 넣은 글자를 뒤에서부터 하나씩
ACT.ltHint = () => {   // 아직 맞지 않은 칸 가운데 두세 칸을 골라 채워 줘요
  const q = SS.q; if (q.done || q.hint) return; const en = q.w[0].toLowerCase().split('');
  const open = shuffle(en.map((c, i) => i).filter(i => q.pick[i] == null || q.tiles[q.pick[i]] !== en[i])), n = Math.min(open.length, Math.max(1, en.length - 1), en.length <= 4 ? 2 : 3);
  open.slice(0, n).forEach(i => { q.pick[i] = null; let t = q.tiles.findIndex((c, j) => c === en[i] && !q.pick.includes(j)); if (t < 0) { t = q.tiles.findIndex((c, j) => c === en[i] && !q.fix[q.pick.indexOf(j)]); q.pick[q.pick.indexOf(t)] = null; } q.pick[i] = t; q.fix[i] = 1; });
  q.hint = true; ltCheck();
};
ACT.kbHint = () => { SS.q.hint = true; render(); };
ACT.kbOk = () => { const q = SS.q; if (q.done) return; const v = ($('#kb').value || '').trim().toLowerCase(); if (!v) return toast('단어를 써 주세요'); finalize(v === q.w[0].toLowerCase(), q.hint ? 1 : 2); };
ACT.nextQ = nextQ;

// ---------- 결과 ----------
SCR.result = {
  view() {
    const o = O(), d = dayOf(o), nw = d.wrong.length, left = boxLeft(), every = boxEvery();
    const box = (k, n) => `<div class="row" style="background:var(--paper);border:2px solid var(--ink);border-radius:20px;padding:8px 12px 8px 8px">${itm(k, 64)}<div style="display:flex;flex-direction:column;gap:2px"><span class="d" style="font-size:19px">${n} ${SS.box}개</span><span class="sub">맞힌 문제 ${every}개마다 하나씩 받았어요</span></div></div>`;
    return `<div class="scr" style="gap:16px">
<div style="margin-top:8px;text-align:center"><h1 style="font-size:30px">${SS.kind === 'wrong' ? '다시 풀기 끝!' : '오늘 공부 끝!'}</h1><div class="sub" style="font-size:15px;margin-top:4px">${SS.box ? '오늘 한 일만큼 상자를 받았어요' : `${left}문제만 더 맞히면 상자를 받아요`}</div></div>
<div style="border-radius:28px;border:2px solid var(--ink);background:var(--mainLt);padding:14px;display:flex;flex-direction:column;gap:10px">
${SS.box ? box('eggbox', '알 상자') + box('itembox', '물건 상자') : `<div class="row" style="justify-content:center;gap:10px;padding:6px 0">${itm('eggbox', 64, 'sil')}${itm('itembox', 64, 'sil')}</div>`}
<div style="font-size:13.5px;color:var(--sub2);text-align:center">맞힌 문제 ${every}개마다 알 상자와 물건 상자를 하나씩 받아요 · 다음 상자까지 ${left}개</div></div>
<div class="row" style="gap:10px"><div class="stat" style="background:var(--t2)"><span class="top">${checkStk(38)}</span><b class="tn">${SS.ok} / ${SS.done}</b><span>맞힌 문제</span></div><div class="stat" style="background:var(--stary)"><span class="top">${stk('s_star', 38)}</span><b class="tn">+${SS.stars}</b><span>모은 별</span></div><div class="stat" style="background:var(--t0)"><span class="top">${stk('s_bolt', 38)}</span><b class="tn">${o.streak}일</b><span>이어서 공부</span></div></div>
<div class="sub" style="font-size:14.5px;text-align:center">${nw ? `오늘 틀린 단어 ${nw}개는 오답노트에 담았어요` : '오늘은 틀린 단어가 없어요'}</div>
<button type="button" class="btn mta" data-a="tab" data-t="vil">${o.eggBox + o.itemBox ? '마을에서 상자 열기' : '마을 보러 가기'}</button>
<button type="button" class="btn sec sm" data-a="tab" data-t="home">홈으로</button></div>`;
  },
  after() { afterChecks(); },
  back() { go('home', {}, { reset: true }); return true; }
};

// ---------- 오답노트 ----------
function wrongLists() {
  const o = O(), d = dayOf(o), b = curBook(), idx = {}; b.words.forEach(w => idx[w[0]] = w);
  const todayL = d.wrong.filter(e => idx[e] && o.wr[e]).map(e => idx[e]);
  const often = Object.keys(o.wr).filter(e => o.wr[e].b === o.book && idx[e]).sort((x, y) => o.wr[y].n - o.wr[x].n).map(e => idx[e]);
  return { todayL, often };
}
SCR.wrong = {
  view() {
    const o = O(), { todayL, often } = wrongLists();
    const row = (w, txt, first) => `<div class="wrow"><div style="display:flex;flex-direction:column;gap:1px;min-width:0;margin-right:auto"><span class="d" style="font-size:21px;line-height:1.2">${esc(w[0])}</span><span style="font-size:14.5px;color:var(--sub)">${esc(w[1])}</span></div><span class="badge tn" style="background:var(${first ? '--mainPale' : '--p'})">${txt}</span><button type="button" class="ibtn rd" style="background:var(--y)" data-a="say" data-t="${esc(w[0])}" aria-label="발음 듣기">${ico(IC.spk, 22)}</button></div>`;
    const empty = t => `<div class="card" style="align-items:center;padding:20px;border-style:dashed;background:transparent"><span class="sub">${t}</span></div>`;
    return `<div class="scr np"><h1>오답노트</h1>
<div class="card" style="background:var(--t3)"><div class="row">${stk(TH().hero, 52)}<div style="display:flex;flex-direction:column;gap:2px"><span class="d" style="font-size:19px">틀린 단어 다시 풀어요</span><span class="sub" style="color:var(--sub2)">세 번 이어서 맞히면 오답노트에서 빠져요</span></div></div>
<div class="row" style="gap:8px"><button type="button" class="btn sec sm f1" style="font-size:15px" data-a="wrongGo" data-k="today" ${todayL.length ? '' : 'disabled'}>오늘 틀린 단어</button><button type="button" class="btn sm f1" style="font-size:15px" data-a="wrongGo" data-k="often" ${often.length ? '' : 'disabled'}>자주 틀린 단어</button></div></div>
<div class="row" style="align-items:baseline">${ttl('오늘 틀린 단어', '--a0', IC.note)}<span class="sub tn" style="margin-left:auto">${todayL.length}개</span></div>
${todayL.length ? todayL.map(w => row(w, o.wr[w[0]].n > 1 ? `전에도 ${o.wr[w[0]].n - 1}번 틀렸어요` : '오늘 처음 틀렸어요', o.wr[w[0]].n <= 1)).join('') : empty('오늘은 틀린 단어가 없어요')}
<div class="row" style="align-items:baseline;margin-top:6px">${ttl('자주 틀린 단어', '--a3', IC.q)}<span class="sub tn" style="margin-left:auto">${often.length}개</span></div>
${often.length ? often.slice(0, 30).map(w => row(w, `총 ${o.wr[w[0]].n}번 틀림`)).join('') : empty('틀린 단어가 생기면 여기에 모여요')}
</div>${tabbar('wrong')}`;
  }
};
ACT.wrongGo = d => { const { todayL, often } = wrongLists(); const l = d.k === 'today' ? todayL : shuffle(often).slice(0, 10); startSession('wrong', shuffle(l)); };

// ---------- 기록 ----------
SCR.rec = {
  view() {
    const o = O(), t = dnum(today()), wd = (new Date().getDay() + 6) % 7, names = ['월', '화', '수', '목', '금', '토', '일'];
    let n = 0;
    const st = names.map((d, i) => { const k = dfrom(t - wd + i), on = o.hist[k] && o.hist[k].q > 0; if (on) n++;
      return `<div style="flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:4px"><span style="width:40px;height:40px;border-radius:20px;border:2px ${on ? 'solid' : 'dashed'} var(--ink);background:var(${on ? '--mainLt' : '--paper'});display:flex;align-items:center;justify-content:center;${i === wd ? 'box-shadow:0 0 0 3px var(--y)' : ''}">${on ? stk('s_star', 26) : ''}</span><span style="font-size:13px;color:var(--sub2)">${d}</span></div>`; }).join('');
    const seen = Object.values(o.w).reduce((a, m) => a + Object.keys(m).length, 0);
    const bd = [['s_sprout', '첫 공부', Object.keys(o.hist).length > 0, '--t2'], ['s_bolt', '5일 이어서', (o.best || 0) >= 5, '--t0'], ['s_star', '별 100개', (o.total || 0) >= 100, '--stary'], ['s_crown', '7일 이어서', (o.best || 0) >= 7, '--t3'], ['study', '단어 500개', seen >= 500, '--t2'], ['s_rocket', '전설 친구', !!o.vil.seen.lv5, '--t0']];
    const d = dayOf(o);
    return `<div class="scr np"><h1>기록</h1>
<div class="card" style="flex-direction:row;align-items:center;gap:14px"><div style="width:90px;height:90px;display:flex;align-items:center;justify-content:center">${frInner({ k: TH().hero, lv: 2 }, 80)}</div><div style="display:flex;flex-direction:column;gap:4px"><span class="d" style="font-size:24px;line-height:1.2">${o.streak ? `${o.streak}일째<br>이어서 공부했어요` : '오늘부터<br>시작해 볼까요?'}</span><span class="sub">${d.q ? '내일도 하면 ' + (o.streak + 1) + '일째예요' : '오늘 공부하면 도장을 찍어요'}</span></div></div>
<button type="button" class="card kc" data-a="go" data-s="titles" style="flex-direction:row;align-items:center;gap:8px;text-align:left">${ttl('칭호', '--a0', IC.star)}<span class="sp" style="min-width:0">${tchip(ownerTitle(o), 13.5) || '<span class="sub">아직 붙인 칭호가 없어요</span>'}</span><span class="sub tn" style="white-space:nowrap">${OT.length}개 중 ${OT.filter(x => o.titles[x.id]).length}개</span>${ico(IC.fwd, 18)}</button>
<div class="card">${ttl('이번 주 도장', '--a1', IC.check)}<div style="display:flex">${st}</div><span class="sub">이번 주에 ${n}번 공부했어요</span></div>
<div class="card"><div class="row" style="align-items:baseline">${ttl('칭찬 배지', '--a3', IC.star)}<span class="sub tn" style="margin-left:auto">6개 중 ${bd.filter(b => b[2]).length}개</span></div><div class="grid3">${bd.map(([k, nm, got, c]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;background:${got ? `var(${c})` : 'var(--paper)'};border:${got ? '0' : '1.5px dashed var(--sub)'};border-radius:16px;padding:10px 2px 8px">${stk(k, 46, got ? '' : 'sil')}<span style="font-size:13px;color:var(${got ? '--tx' : '--sub'})">${nm}</span></div>`).join('')}</div></div>
<div class="row" style="gap:8px"><div class="tile" style="flex:1 1 0;background:var(--t2)"><b class="d tn" style="font-weight:400;font-size:20px">${d.q}</b><span class="sub">오늘 푼 문제</span></div><div class="tile" style="flex:1 1 0;background:var(--stary)"><b class="d tn" style="font-weight:400;font-size:20px">${o.total || 0}</b><span class="sub">모두 모은 별</span></div><div class="tile" style="flex:1 1 0;background:var(--t0)"><b class="d tn" style="font-weight:400;font-size:20px">${seen}</b><span class="sub">만난 단어</span></div></div>
<button type="button" class="btn sec" data-a="report">부모 리포트 자세히 보기</button>
</div>${tabbar('rec')}`;
  },
  after() { afterChecks(); }
};
