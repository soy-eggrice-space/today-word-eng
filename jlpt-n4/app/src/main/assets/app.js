/* ================= 공!부!해! N4 — 앱 본체 ================= */
'use strict';
const HAS = typeof window.Android !== 'undefined';
const IV = [0, 1, 2, 4, 7, 15, 30], MASTER = 5;
const AREAS = ['moji', 'bunpou', 'dokkai', 'choukai'];
const AREA_KO = { moji: '문자·어휘', bunpou: '문법', dokkai: '독해', choukai: '청해', kiso: '기초' };
const TYPE = {
  imi: { ko: '뜻 고르기', jp: '意味', area: 'kiso', inst: '이 단어의 뜻은?' },
  imi2: { ko: '단어 고르기', jp: '単語', area: 'kiso', inst: '이 뜻에 맞는 일본어는?' },
  yomi: { ko: '한자 읽기', jp: '漢字読み', area: 'moji', inst: '밑줄 친 말은 히라가나로 어떻게 쓰나요?', jinst: '＿＿のことばはひらがなでどう書きますか。' },
  hyouki: { ko: '표기', jp: '表記', area: 'moji', inst: '밑줄 친 말은 한자로 어떻게 쓰나요?', jinst: '＿＿のことばはどう書きますか。' },
  bunmyaku: { ko: '문맥 규정', jp: '文脈規定', area: 'moji', inst: '（　）에 들어갈 가장 알맞은 말은?', jinst: '（　）に何を入れますか。' },
  para: { ko: '바꿔 말하기', jp: '言い換え類義', area: 'moji', inst: '밑줄 친 문장과 거의 같은 뜻의 문장은?', jinst: '＿＿の文とだいたい同じ意味の文があります。' },
  usage: { ko: '용법', jp: '用法', area: 'moji', inst: '이 말을 가장 바르게 쓴 문장은?', jinst: 'つぎのことばの使い方で一番いいものを選んでください。' },
  gram: { ko: '문법 형식', jp: '文の文法1', area: 'bunpou', inst: '（　）에 들어갈 가장 알맞은 것은?', jinst: '（　）に何を入れますか。' },
  star: { ko: '문장 배열 ★', jp: '文の文法2', area: 'bunpou', inst: '바르게 배열했을 때 ★에 들어갈 것은?', jinst: '★に入るものはどれですか。' },
  bunshou: { ko: '글의 문법', jp: '文章の文法', area: 'bunpou', inst: '글을 읽고 （ ）에 들어갈 것을 고르세요.', jinst: '（　）に何を入れますか。' },
  short: { ko: '단문 독해', jp: '内容理解（短文）', area: 'dokkai', inst: '글을 읽고 질문에 답하세요.' },
  mid: { ko: '중문 독해', jp: '内容理解（中文）', area: 'dokkai', inst: '글을 읽고 질문에 답하세요.' },
  info: { ko: '정보 검색', jp: '情報検索', area: 'dokkai', inst: '안내문을 보고 질문에 답하세요.' },
  kadai: { ko: '과제 이해', jp: '課題理解', area: 'choukai', inst: '듣고 알맞은 답을 고르세요.' },
  point: { ko: '포인트 이해', jp: 'ポイント理解', area: 'choukai', inst: '듣고 알맞은 답을 고르세요.' },
  hatsuwa: { ko: '발화 표현', jp: '発話表現', area: 'choukai', inst: '상황에 맞는 말을 1~3 중에서 고르세요.' },
  sokuji: { ko: '즉시 응답', jp: '即時応答', area: 'choukai', inst: '말을 듣고 알맞은 대답을 1~3 중에서 고르세요.' },
  kanji: { ko: '한자 뜻', jp: '漢字', area: 'kiso', inst: '이 한자의 뜻(훈음)은?' },
  kana: { ko: '가나', jp: 'かな', area: 'kiso', inst: '' },
  conj: { ko: '활용 드릴', jp: '活用', area: 'kiso', inst: '' },
  counter: { ko: '조수사 읽기', jp: '助数詞', area: 'kiso', inst: '읽는 법으로 맞는 것은?' },
};
const $ = s => document.querySelector(s);
const app = () => $('#app');
const fm = () => (S && S.set && S.set.furi) || 'all';

/* ---------- 저장 ---------- */
let S = null, saveT = 0;
function defState() {
  return {
    v: 1, name: '', avatar: { sp: 'mallang', col: '#F5E2A6', eyes: 'oval', mouth: 'cat', cheek: 'pink', acc: '' },
    created: Date.now(), exam: '2026-12-06', target: 120, kanaLv: 0, examLv: 4, stageSet: '',
    plan: { v: 20, g: 2, rev: 100, r: 1, l: 3, kana: 15 },
    set: { furi: 'all', rate: 0.9, vib: true, mute: false, rlEarly: false, mockDay: null, mockTime: '20:00', notiMock: true, notiDaily: true, dailyTime: '21:00' },
    it: {}, area: { moji: { ft: 0, fc: 0, r: [] }, bunpou: { ft: 0, fc: 0, r: [] }, dokkai: { ft: 0, fc: 0, r: [] }, choukai: { ft: 0, fc: 0, r: [] } },
    ty: {}, tg: {}, days: {}, mocks: [], pred: {}, streak: 0, lastDay: '', bad: {}, kana: {}, perfect: 0, setupDone: false, ach: { acc: { bow: 1 }, sp: {} },
  };
}
function loadState() {
  let raw = null;
  try { if (HAS && Android.loadData) raw = Android.loadData(); } catch (e) { }
  if (!raw) try { raw = localStorage.getItem('n4'); } catch (e) { }
  let s = null;
  try { s = raw ? JSON.parse(raw) : null; } catch (e) { s = null; }
  const d = defState();
  if (!s) return d;
  for (const k in d) if (s[k] === undefined) s[k] = d[k];
  for (const k of ['plan', 'set', 'avatar']) s[k] = Object.assign({}, d[k], s[k]);
  AREAS.forEach(a => { if (!s.area[a]) s.area[a] = { ft: 0, fc: 0, r: [] }; });
  return s;
}
function save(now) {
  clearTimeout(saveT);
  const f = () => { const j = JSON.stringify(S); try { if (HAS) Android.saveData(j); } catch (e) { } try { localStorage.setItem('n4', j); } catch (e) { } };
  if (now) f(); else saveT = setTimeout(f, 300);
}

/* ---------- 날짜 ---------- */
const pad = n => String(n).padStart(2, '0');
function dstr(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function dnum(s) { const d = s ? new Date(s + 'T00:00:00') : new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5); }
const today = () => dnum();
function daysLeft() { return dnum(S.exam) - today(); }
function touchStreak() {
  const t = dstr();
  if (S.lastDay === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1);
  S.streak = S.lastDay === dstr(y) ? S.streak + 1 : 1;
  S.lastDay = t;
}

/* ---------- 기기 기능 ---------- */
function vib(ms) { if (!S.set.vib) return; try { if (HAS) Android.vibrate(ms); else navigator.vibrate && navigator.vibrate(ms); } catch (e) { } }
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(el._t); el._t = setTimeout(() => el.classList.remove('show'), 2200); }
let MODAL = null;
function modal(html, opt) {
  closeModal();
  const m = document.createElement('div'); m.className = 'modal';
  m.innerHTML = `<div class="mbox ${opt && opt.left ? 'l' : ''}">${html}</div>`; markJa(m);
  m.addEventListener('click', e => { if (e.target === m && !(opt && opt.sticky)) closeModal(); });
  document.body.appendChild(m); MODAL = m; return m;
}
// 일본어 부분은 일본식 한자 글꼴로 (한국식 한자 모양과 조금 달라요)
const JA_SEL = '.jp,.j,.jw,.qtext,.qbig,.qsub,.passage,.choices,ruby,.ex,.tbl,.kgrid';
function markJa(root) { try { root.querySelectorAll(JA_SEL).forEach(e => { e.lang = 'ja'; }); } catch (e) { } }
function closeModal() { if (MODAL) { MODAL.remove(); MODAL = null; } }
function burst(n) {
  const b = $('#burst'); const em = ['🌸', '⭐', '🎉', '💛', '✨', '🍡'];
  for (let i = 0; i < (n || 24); i++) {
    const s = document.createElement('span'); s.textContent = pick(em);
    s.style.left = rnd(100) + 'vw'; s.style.fontSize = (16 + rnd(18)) + 'px'; s.style.setProperty('--dx', (rnd(120) - 60) + 'px');
    s.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; s.style.animationDelay = Math.random() * .4 + 's';
    b.appendChild(s); setTimeout(() => s.remove(), 3800);
  }
}

/* ---------- 음성 ---------- */
let JA_VOICE = null;
function jaVoice() {
  if (JA_VOICE) return JA_VOICE;
  try { JA_VOICE = (speechSynthesis.getVoices() || []).find(v => /ja/i.test(v.lang)) || null; } catch (e) { }
  return JA_VOICE;
}
const TTS = {
  q: [], cb: null, n: 0, cur: null, tm: 0, playing: false,
  play(parts, onEnd) {
    this.stop(); this.q = parts.slice(); this.cb = onEnd || null; this.playing = true; this.next();
  },
  next() {
    if (!this.playing) return;
    const p = this.q.shift();
    if (!p) { this.playing = false; const cb = this.cb; this.cb = null; if (cb) cb(); return; }
    if (p.pause) { this.tm = setTimeout(() => this.next(), p.pause); return; }
    const id = 'u' + (++this.n); this.cur = id;
    const pitch = p.spk === 'M' ? 0.78 : p.spk === 'F' ? 1.25 : 1.0;
    const rate = Math.max(.5, Math.min(1.4, (S && S.set.rate) || .9));
    const text = p.t;
    try {
      if (HAS && Android.speakTo) { Android.speakTo(text, 'ja-JP', pitch, rate, id); return; }
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text); u.lang = 'ja-JP'; u.pitch = pitch; u.rate = rate;
        const v = jaVoice(); if (v) u.voice = v;
        u.onend = u.onerror = () => this.done(id);
        speechSynthesis.speak(u);
        this.tm = setTimeout(() => this.done(id), 2500 + text.length * 260);
        return;
      }
    } catch (e) { }
    this.tm = setTimeout(() => this.done(id), 400 + text.length * 110);
  },
  done(id) { if (id !== this.cur) return; this.cur = null; clearTimeout(this.tm); this.tm = setTimeout(() => this.next(), 380); },
  stop() {
    this.playing = false; this.q = []; this.cb = null; this.cur = null; clearTimeout(this.tm);
    try { if (HAS && Android.stopTts) Android.stopTts(); } catch (e) { }
    try { if (!HAS && window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { }
  },
  say(t, spk) { this.play([{ t, spk: spk || 'N' }]); },
};
window.__ttsDone = id => TTS.done(id);
function hasJa() { try { if (HAS && Android.hasLang) return Android.hasLang('ja-JP') >= 0; } catch (e) { } return true; }

/* ---------- 데이터 준비 ---------- */
let VOC = [], VBY = {}, GRAM = [], GBY = {}, KAN = [], PARA = [], USE = [], BUN = [], READ = [], LIS = [], CATS = {}, ITEM = {};
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
function prep() {
  initKanjiLevels(); initConf();
  DATA.cats.forEach(c => CATS[c.id] = c);
  VOC = DATA.vocab.map((a, i) => ({ i, w: a[0], r: a[1], m: a[2], lv: a[3], p: a[4], ex: a[5], tr: a[6], c: a[7], s: a[8] }));
  VOC.forEach(v => {
    v.key = 'v:' + v.w + '|' + v.r; v.kind = 'v';
    const t = v.ex.match(/［(.*?)］/); v.tgt = t ? t[1] : v.w;
    v.hasK = KJ1.test(surf(v.tgt));
    v.an = analyze(v, v.tgt);
    v.disp = align(v.w.replace('〜', ''), v.r);
    VBY[v.key] = v; ITEM[v.key] = v;
  });
  GRAM = DATA.grammar.map(g => Object.assign({ key: 'g:' + g.id, kind: 'g' }, g));
  GRAM.forEach(g => { GBY[g.id] = g; ITEM[g.key] = g; });
  KAN = DATA.kanji.map(k => ({ k: k[0], on: k[1], kun: k[2], ko: k[3], lv: k[4], ex: k[5], grp: k[6], key: 'k:' + k[0], kind: 'k' }));
  KAN.forEach(k => ITEM[k.key] = k);
  PARA = DATA.para.map((a, i) => ({ a, key: 'p:' + hash(a[0]), kind: 'p', d: (DATA.paraD || [])[i] || 0 })); PARA.forEach(x => ITEM[x.key] = x);
  USE = DATA.usage.map((a, i) => ({ a, key: 'u:' + a[0], kind: 'u', d: (DATA.usageD || [])[i] || 0 })); USE.forEach(x => ITEM[x.key] = x);
  const pc = PARA.map(x => x.d).sort((a, b) => a - b)[Math.floor(PARA.length * .45)] || 0;
  PARA.forEach(x => { x.e = x.d <= pc ? 1 : 0; });
  BUN = DATA.bunshou.map(b => Object.assign({ key: 'b:' + b.id, kind: 'b', type: 'bunshou' }, b)); BUN.forEach(x => ITEM[x.key] = x);
  READ = DATA.reading.map(b => Object.assign({ key: 'r:' + b.id, kind: 'r' }, b)); READ.forEach(x => ITEM[x.key] = x);
  LIS = DATA.listen.map(b => Object.assign({ key: 'l:' + b.id, kind: 'l' }, b)); LIS.forEach(x => ITEM[x.key] = x);
}
const isN = v => v && v.lv; // helper

/* ---------- 기록 · 복습 ---------- */
function itemOf(k) { return S.it[k]; }
function lvOf(k) { const it = S.it[k]; return it ? it.l : -1; }
function record(q, ok, extraTag, opt) {
  if (!q || !q.key) return;
  const it = S.it[q.key] || (S.it[q.key] = { l: 0, d: today(), c: 0, w: 0 });
  const first = !it.c && !it.w;
  if (ok) {
    it.c++;
    if (it.wr) { it.need = (it.need || 2) - 1; if (it.need <= 0) { delete it.wr; delete it.need; } }
    it.l = Math.min(6, it.l + (it.wr ? 0 : 1));
    it.d = today() + IV[it.l];
  } else {
    it.w++; it.wr = 1; it.need = 2; it.l = Math.max(0, it.l - 2); it.d = today();
  }
  it.t = today();
  const area = (TYPE[q.type] || {}).area;
  if (AREAS.includes(area)) {
    const A = S.area[area];
    if (first) { A.ft++; if (ok) A.fc++; }
    A.r.push(ok ? 1 : 0); if (A.r.length > 80) A.r.shift();
  }
  const T = S.ty[q.type] || (S.ty[q.type] = { c: 0, t: 0 }); T.t++; if (ok) T.c++;
  const tags = (q.tags || []).slice(); if (extraTag) tags.push(extraTag);
  tags.forEach(t => {
    const g = S.tg[t] || (S.tg[t] = { w: 0, c: 0, last: 0 });
    if (ok) g.c++; else { g.w++; g.last = today(); }
  });
  const D = S.days[dstr()] || (S.days[dstr()] = { n: 0, c: 0 });
  D.n++; if (ok) D.c++;
  if (!(opt && opt.mock)) touchStreak();
  save();
}
function recordMulti(q, ok) { // 문단형(여러 문항이 하나의 아이템)
  record(q, ok);
}
function dueKeys() {
  const td = today();
  return Object.keys(S.it).filter(k => ITEM[k] && S.it[k].d <= td && !S.bad[k]).sort((a, b) => S.it[a].d - S.it[b].d || S.it[a].l - S.it[b].l);
}
function wrongKeys() { return Object.keys(S.it).filter(k => ITEM[k] && S.it[k].wr && !S.bad[k]); }
function mastered(list) { return list.filter(x => lvOf(x.key) >= MASTER).length; }
function learned(list) { return list.filter(x => lvOf(x.key) >= 2).length; }
function seen(list) { return list.filter(x => S.it[x.key]).length; }

/* ---------- 예상 점수 ---------- */
function mLv(m) { return m.lv || 4; }
function lastMock(lv) { for (let i = S.mocks.length - 1; i >= 0; i--) if (!lv || mLv(S.mocks[i]) === lv) return S.mocks[i]; return null; }
function passLine(lv) { return (lv || S.examLv) === 5 ? 80 : 90; }

/* ---------- 학습 단계: 가나 → N5 → N4 ---------- */
const STAGE_KO = { kana: '가나', n5: 'N5 기초', n4: 'N4 실전' };
function n5Prog() {
  const v5 = VOC.filter(v => v.lv === 5), g5 = GRAM.filter(g => g.lv === 5);
  return { vn: learned(v5), vt: v5.length, gn: learned(g5), gt: g5.length, v: learned(v5) / v5.length, g: learned(g5) / g5.length };
}
function n4Prog() {
  const v4 = VOC.filter(v => v.lv === 4), g4 = GRAM.filter(g => g.lv === 4);
  return { vn: learned(v4), vt: v4.length, gn: learned(g4), gt: g4.length };
}
const N4_GATE = .7, RL_GATE = .3; // N5 단어·문법 70% → N4 단계 / 30% → 독해·청해 시작
function stage() {
  if (S.stageSet === 'n4' || S.stageSet === 'n5') return needKana() ? 'kana' : S.stageSet;
  if (needKana()) return 'kana';
  const p = n5Prog();
  return p.v >= N4_GATE && p.g >= N4_GATE ? 'n4' : 'n5';
}
function rlOpen() {
  if (S.set.rlEarly) return true;
  const st = stage();
  if (st === 'kana') return false;
  if (st === 'n4') return true;
  const p = n5Prog(); return p.v >= RL_GATE && p.g >= RL_GATE;
}
function stageLv() { return stage() === 'n4' ? 4 : 5; } // 지금 단계에 맞는 모의고사 급
/* 지금 단계에 맞는 것만 (이미 공부한 것은 그대로 복습) */
function stageVoc(list) { return stage() === 'n4' ? list : list.filter(x => x.lv === 5 || S.it[x.key]); }
function easyFirst(list) { return list.slice().sort((a, b) => (a.d || 0) - (b.d || 0)); }
function coverage(a) {
  const V = S.examLv === 5 ? VOC.filter(v => v.lv === 5) : VOC, G = S.examLv === 5 ? GRAM.filter(g => g.lv === 5) : GRAM;
  const cv = learned(V) / V.length, cg = learned(G) / G.length;
  if (a === 'moji') return cv; if (a === 'bunpou') return cg;
  return (cv + cg) / 2;
}
function areaEst(a) {
  const A = S.area[a], p0 = .28;
  let num = p0 * .5, den = .5;
  const m = lastMock(S.examLv);
  if (m && m.sec[a] && m.sec[a][1]) {
    const days = (Date.now() - m.ts) / 864e5, w = 4 * Math.exp(-days / 30);
    num += w * m.sec[a][0] / m.sec[a][1]; den += w;
  }
  const n = A.r.length;
  if (n || A.ft) {
    const pk = n ? A.r.reduce((x, y) => x + y, 0) / n : .7;
    const pu = (A.fc + p0 * 6) / (A.ft + 6);
    const cov = coverage(a);
    const pe = cov * pk + (1 - cov) * pu;
    const w = Math.min(1, (n + A.ft) / 40) * 3;
    num += w * pe; den += w;
  }
  return Math.max(0, Math.min(1, num / den));
}
function predict() {
  const e = {}; AREAS.forEach(a => e[a] = areaEst(a));
  const lk = 120 * (.38 * e.moji + .37 * e.bunpou + .25 * e.dokkai), ls = 60 * e.choukai;
  const total = Math.round(lk) + Math.round(ls);
  const n = AREAS.reduce((s, a) => s + S.area[a].r.length, 0);
  return { e, lk: Math.round(lk), ls: Math.round(ls), total, sure: !!lastMock(S.examLv) || n >= 120 };
}
function snapPred() { const p = predict(); S.pred[dstr()] = p.total; return p; }
const CHANCE = 45; // 4지선다를 모두 찍었을 때 기대 점수
function hasData() { return !!lastMock(S.examLv) || AREAS.reduce((s, a) => s + S.area[a].r.length, 0) >= 20; }
function readiness() { const p = predict(); const pct = hasData() ? Math.max(0, Math.min(100, Math.round((p.total - CHANCE) / (S.target - CHANCE) * 100))) : 0; return { p, pct }; }
function passInfo(lk, ls, lv) { const total = lk + ls; return { total, pass: total >= passLine(lv) && lk >= 38 && ls >= 19 }; }

/* ---------- 문제 만들기 ---------- */
const VOC_Q_TYPES = ['yomi', 'hyouki', 'bunmyaku'];
function vocabFB(v) {
  return `<div class="row"><div class="jw">${rubyHTML(v.disp, 'all')}</div><button class="iconbtn" onclick="TTS.say('${esc(k2h(v.r))}')">🔊</button></div>
  <div class="ko">${esc(v.m)} <span class="tag">N${v.lv}</span> <span class="tag k">${esc(POS_KO[v.p] || '')}</span></div>
  <div class="ex">${sentHTML(v.ex, 'all', 'u')}</div><div class="tr">${esc(v.tr)}</div>`;
}
const POS_KO = { n: '명사', vs: '명사(する)', v5: '1그룹 동사', v1: '2그룹 동사', vk: '3그룹 동사(来る)', vsi: '3그룹 동사(する)', 'adj-i': 'い형용사', 'adj-na': 'な형용사', adv: '부사', conj: '접속사', pron: '대명사', ctr: '조수사', exp: '표현', int: '감탄사' };
function qVocab(v, type) {
  const fbh = () => vocabFB(v);
  const base = { key: v.key, item: v, tags: ['cat:' + v.c], fb: fbh, speak: speech(v.ex) };
  if (type === 'imi' || type === 'imi2') {
    const g = VGROUP(v.p);
    const pool = shuffle(VOC.filter(x => x !== v && x.m !== v.m && (VGROUP(x.p) === g || Math.random() < .15)));
    const wr = [];
    for (const x of pool) { if (!wr.some(y => y.m === x.m) && surf(x.w) !== surf(v.w)) wr.push(x); if (wr.length === 3) break; }
    if (type === 'imi') return Object.assign(base, {
      type, html: `<div class="qbig">${rubyHTML(v.disp, 'all')}</div><div class="qsub">${esc(POS_KO[v.p] || '')}</div>`,
      opts: shuffle([{ h: esc(v.m), ok: 1 }].concat(wr.map(x => ({ h: esc(x.m) })))), ko: true, sayFirst: k2h(v.r),
    });
    return Object.assign(base, {
      type, html: `<div class="qbig" style="font-family:var(--fd);font-size:30px">${esc(v.m)}</div><div class="qsub">${esc(POS_KO[v.p] || '')}</div>`,
      opts: shuffle([{ h: rubyHTML(v.disp, 'all'), ok: 1 }].concat(wr.map(x => ({ h: rubyHTML(x.disp, 'all') })))),
    });
  }
  if (type === 'yomi') {
    if (!v.hasK) return null;
    const right = k2h(yomi(v.tgt));
    const bad = new Set(VOC.filter(x => surf(x.w) === surf(v.w)).map(x => k2h(x.r)));
    const L = right.length, last = right.slice(-1);
    const okO = o => Math.abs(o.length - L) <= 1 && o.slice(-1) === last;
    const others = shuffle(VOC.filter(x => x !== v && x.hasK && x.c === v.c && surf(x.tgt)[0] === surf(v.tgt)[0]).map(x => k2h(yomi(x.tgt))).filter(okO))
      .concat(shuffle(VOC.filter(x => x !== v && x.hasK && x.c === v.c).map(x => k2h(yomi(x.tgt))).filter(okO)))
      .concat(shuffle(VOC.filter(x => x !== v && x.hasK && x.p === v.p).map(x => k2h(yomi(x.tgt))).filter(okO)).slice(0, 30));
    const ds = readingDistractors(right, bad, readMask(v.tgt), others); if (!ds) return null;
    return Object.assign(base, {
      type, html: `<div class="qtext">${sentHTML(v.ex, fm(), 'uk')}</div>`,
      opts: shuffle([{ h: esc(right), ok: 1 }].concat(ds.map(([s, t]) => ({ h: esc(s), tag: 'kana:' + t })))),
    });
  }
  if (type === 'hyouki') {
    if (!v.hasK) return null;
    const right = surf(v.tgt), rr = k2h(yomi(v.tgt));
    const bad = new Set(VOC.filter(x => x !== v && (k2h(yomi(x.tgt)) === rr || k2h(x.r) === rr)).flatMap(x => [surf(x.tgt), x.w]));
    const ds = writingDistractors(right, bad); if (!ds) return null;
    return Object.assign(base, {
      type, html: `<div class="qtext">${sentHTML(v.ex, fm(), 'kana')}</div>`,
      opts: shuffle([{ h: esc(right), ok: 1 }].concat(ds.map(s => ({ h: esc(s), tag: 'hyouki' })))),
    });
  }
  if (type === 'bunmyaku') {
    if (!v.an || ['pron', 'ctr', 'exp', 'int', 'vsi'].includes(v.p)) return null;
    const g = VGROUP(v.p);
    const pool = shuffle(VOC.filter(x => x !== v && VGROUP(x.p) === g && x.m !== v.m && k2h(x.r) !== k2h(v.r) && !x.w.includes('〜') && x.s !== 'keigo' && !(x.c === v.c && x.s === v.s)));
    pool.sort((a, b) => (a.c === v.c) - (b.c === v.c) || Math.abs(a.lv - v.lv) - Math.abs(b.lv - v.lv));
    const ds = [], ts = surf(v.tgt);
    for (const x of pool.slice(0, 40).sort(() => Math.random() - .5)) {
      const f = conjLike(x, v.an);
      if (f && surf(f) !== ts && !ds.some(d => surf(d) === surf(f))) ds.push(f);
      if (ds.length === 3) break;
    }
    if (ds.length < 3) return null;
    return Object.assign(base, {
      type, html: `<div class="qtext">${sentHTML(v.ex, fm(), 'blank')}</div>`,
      opts: shuffle([{ h: rubyHTML(v.tgt, fm()), ok: 1 }].concat(ds.map(s => ({ h: rubyHTML(s, fm()) })))),
    });
  }
  return null;
}
function qVocabAuto(v, exam) {
  const lv = lvOf(v.key);
  let order;
  if (!exam && lv < 2) order = shuffle(['imi', 'imi', 'yomi', 'imi2']);
  else order = shuffle(VOC_Q_TYPES).concat(['imi']);
  for (const t of order) { const q = qVocab(v, t); if (q) return q; }
  return qVocab(v, 'imi');
}
function gramFB(g, extra) {
  return `<div class="jw" style="font-size:18px">${esc(g.p)} <span class="tag">N${g.lv}</span></div><div class="ko">${esc(g.m)}</div>
  ${extra ? `<div class="tip">💡 ${esc(extra)}</div>` : ''}
  ${g.warn && g.warn.length ? `<div class="tip">⚠️ ${esc(g.warn[0])}</div>` : ''}
  <div class="acts"><button class="btn sm w" onclick="openConcept('g:${g.id}')">📘 개념 보기</button></div>`;
}
function qGram(g, i) {
  const a = g.q[i]; if (!a) return null;
  return {
    type: 'gram', key: g.key, item: g, tags: ['g:' + g.id], html: `<div class="qtext">${blankHTML(a[0], fm())}</div>`,
    opts: shuffle(a.slice(1, 5).map((o, j) => ({ h: rubyHTML(o, fm()), ok: j === 0 ? 1 : 0 }))),
    fb: () => `<div class="ex">${blankHTML(a[0], 'all').replace('<span class="blank">（　　　）</span>', '<b><u>' + rubyHTML(a[1], 'all') + '</u></b>')}</div>` + gramFB(g, a[5]),
    speak: speech(a[0].replace('（　）', a[1])),
  };
}
function qStar(g, i) {
  const s = g.s[i]; if (!s) return null;
  const [a, ch, b, k, tr] = s;
  const slots = [1, 2, 3, 4].map(n => n === k ? '<span class="s">★</span>' : '<span>＿</span>').join('');
  const full = a + ch.join('') + b;
  const nums = shuffle([0, 1, 2, 3]);
  return {
    type: 'star', key: g.key, item: g, tags: ['g:' + g.id, 'type:star'],
    html: `<div class="qtext">${rubyHTML(a, fm())}<span class="star4">${slots}</span>${rubyHTML(b, fm())}</div>`,
    opts: nums.map(j => ({ h: rubyHTML(ch[j], fm()), ok: j === k - 1 ? 1 : 0 })),
    fb: () => `<div class="ex">${rubyHTML(a, 'all')}<b>${ch.map((c, j) => j === k - 1 ? `<u>${rubyHTML(c, 'all')}</u>` : rubyHTML(c, 'all')).join(' ')}</b>${rubyHTML(b, 'all')}</div>
      <div class="tr">정답 순서: ${ch.map((c, j) => (j + 1) + '.' + esc(surf(c))).join(' → ')}<br>${esc(tr)}</div>` + gramFB(g),
    speak: speech(full),
  };
}
function qGramAuto(g, exam) {
  const n = g.q.length, m = g.s.length;
  if (m && (exam ? Math.random() < .25 : Math.random() < .3)) return qStar(g, rnd(m));
  return qGram(g, rnd(n));
}
function qPara(x) {
  const a = x.a;
  return {
    type: 'para', key: x.key, item: x, tags: ['type:para'], html: `<div class="qtext">${sentHTML(a[0], fm(), 'u')}</div>`,
    opts: shuffle(a.slice(1, 5).map((o, j) => ({ h: rubyHTML(o, fm()), ok: j === 0 ? 1 : 0 }))),
    fb: () => `<div class="ex">${sentHTML(a[0], 'all', 'u')}</div><div class="tr">${esc(a[5])}</div><div class="ex">✅ ${rubyHTML(a[1], 'all')}</div>`,
    speak: speech(a[0]),
  };
}
function qUsage(x) {
  const a = x.a;
  return {
    type: 'usage', key: x.key, item: x, tags: ['type:usage'], html: `<div class="qbig">${esc(a[0])}</div><div class="qsub jp">${esc(a[1])}</div>`,
    opts: shuffle(a.slice(2, 6).map((o, j) => ({ h: sentHTML(o, fm(), 'u'), ok: j === 0 ? 1 : 0 }))),
    fb: () => `<div class="ex">✅ ${sentHTML(a[2], 'all', 'u')}</div><div class="tr">${esc(a[6])}</div>`,
    speak: speech(a[2]),
  };
}
function passageHTML(lines, mode, hl) {
  return lines.map(l => `<p>${rubyHTML(l, mode).replace(/（([１２３４５])）/g, (m, d) => hl && hl === d ? `<b style="background:#F8E6B3;border-radius:4px;padding:0 2px">（${d}）</b>` : `<b>（${d}）</b>`)}</p>`).join('');
}
function qBunshou(b) {
  return b.q.map((a, i) => {
    const d = '１２３４５'[i];
    return {
      type: 'bunshou', key: b.key, item: b, group: b.key, gi: i, gn: b.q.length, tags: ['type:bunshou'],
      passage: () => passageHTML(b.t, fm(), d), title: b.title,
      html: `<div class="inst">（${d}）에 들어갈 것은?</div>`,
      opts: shuffle(a.slice(1, 5).map((o, j) => ({ h: rubyHTML(o, fm()), ok: j === 0 ? 1 : 0 }))),
      fb: () => `<div class="ko">✅ （${d}） ${rubyHTML(a[1], 'all')}</div>${a[5] ? `<div class="tip">💡 ${esc(a[5])}</div>` : ''}${i === b.q.length - 1 ? `<div class="tr">${esc(b.tr)}</div>` : ''}`,
    };
  });
}
function qRead(b) {
  return b.q.map((a, i) => ({
    type: b.type, key: b.key, item: b, group: b.key, gi: i, gn: b.q.length, tags: ['type:' + b.type],
    passage: () => passageHTML(b.t, fm()), title: b.title,
    html: `<div class="qtext" style="font-size:17px">${rubyHTML(a[0], fm())}</div>`,
    opts: shuffle(a.slice(1, 5).map((o, j) => ({ h: rubyHTML(o, fm()), ok: j === 0 ? 1 : 0 }))),
    fb: () => `<div class="ko">✅ ${rubyHTML(a[1], 'all')}</div><div class="tr">📖 ${esc(b.tr)}</div>`,
  }));
}
const NUMJ = ['いち', 'に', 'さん'];
function listenParts(b) {
  const P = [];
  if (b.type === 'kadai' || b.type === 'point') {
    P.push({ t: speech(b.sc), spk: 'N' }, { pause: 700 });
    b.lines.forEach(([s, t]) => P.push({ t: speech(t), spk: s }));
    P.push({ pause: 700 }, { t: speech(b.qq), spk: 'N' });
  } else if (b.type === 'hatsuwa') {
    P.push({ t: speech(b.sc.split('|')[0].replace(/^\S+\s/, '')), spk: 'N' }, { t: speech(b.qq), spk: 'N' }, { pause: 500 });
    b.a.forEach((x, i) => P.push({ t: NUMJ[i], spk: 'N' }, { t: speech(x), spk: 'F' }, { pause: 300 }));
  } else {
    const [s, t] = b.lines[0];
    P.push({ t: speech(t), spk: s }, { pause: 600 });
    b.a.forEach((x, i) => P.push({ t: NUMJ[i], spk: 'N' }, { t: speech(x), spk: s === 'M' ? 'F' : 'M' }, { pause: 300 }));
  }
  return P;
}
function scriptHTML(b) {
  let h = '<div class="script">';
  if (b.sc) h += `<div class="l"><span class="s N">N</span><div>${rubyHTML(b.sc.split('|')[0], 'all')}</div></div>`;
  (b.lines || []).forEach(([s, t]) => h += `<div class="l"><span class="s ${s}">${s === 'M' ? '男' : s === 'F' ? '女' : 'N'}</span><div>${rubyHTML(t, 'all')}</div></div>`);
  if (b.qq) h += `<div class="l"><span class="s N">Q</span><div>${rubyHTML(b.qq, 'all')}</div></div>`;
  if (b.a) b.a.forEach((x, i) => h += `<div class="l"><span class="s">${i + 1}</span><div>${rubyHTML(x, 'all')}${i === 0 ? ' ✅' : ''}</div></div>`);
  return h + '</div>';
}
function qListen(b) {
  const parts = listenParts(b);
  const q = {
    type: b.type, key: b.key, item: b, tags: ['type:' + b.type], audio: parts, listen: true,
    fb: () => `<div class="row"><b style="font-size:15px">📜 대본</b><span class="sp"></span><button class="btn sm w" onclick="TTS.play(CUR_Q.audio)">🔊 다시 듣기</button></div>${scriptHTML(b)}<div class="tr">${esc(b.tr)}</div>`,
  };
  if (b.type === 'kadai' || b.type === 'point') {
    q.opts = shuffle(b.o.map((o, j) => ({ h: rubyHTML(o, fm()), ok: j === 0 ? 1 : 0 })));
    q.html = `<div class="inst" style="margin-bottom:6px">${rubyHTML(b.sc, fm())}</div>`;
    q.muteHTML = () => `<div class="passage">${scriptHTML(Object.assign({}, b, { a: null }))}</div>`;
  } else {
    const order = shuffle([0, 1, 2]);
    q.order = order;
    q.audio = listenPartsOrdered(b, order);
    q.opts = order.map((j, i) => ({ h: String(i + 1), ok: j === 0 ? 1 : 0, txt: b.a[j] }));
    q.row3 = true;
    if (b.type === 'hatsuwa') {
      const [jp, ko] = b.sc.split('|'); const em = (jp.match(/^\S+/) || [''])[0];
      q.html = `<div class="scene"><div class="em">${em}</div><div class="jp">${rubyHTML(jp.replace(/^\S+\s/, ''), fm())}</div><div class="small" style="margin-top:4px">${esc(ko || '')}</div><div class="jp" style="margin-top:6px">➡️ ${rubyHTML(b.qq, fm())}</div></div>`;
    } else q.html = `<div class="scene"><div class="em">💬</div><div class="small">상대의 말을 듣고 알맞은 대답을 고르세요</div></div>`;
    q.muteHTML = () => `<div class="passage">${b.lines ? b.lines.map(([s, t]) => `<p><b>${s === 'M' ? '男' : '女'}:</b> ${rubyHTML(t, fm())}</p>`).join('') : ''}${order.map((j, i) => `<p><b>${i + 1}.</b> ${rubyHTML(b.a[j], fm())}</p>`).join('')}</div>`;
    q.fb = () => `<div class="row"><b style="font-size:15px">📜 대본</b><span class="sp"></span><button class="btn sm w" onclick="TTS.play(CUR_Q.audio)">🔊 다시 듣기</button></div>
      <div class="script">${b.sc ? `<div class="l"><span class="s N">N</span><div>${rubyHTML(b.sc.split('|')[0], 'all')}</div></div>` : ''}${(b.lines || []).map(([s, t]) => `<div class="l"><span class="s ${s}">${s === 'M' ? '男' : '女'}</span><div>${rubyHTML(t, 'all')}</div></div>`).join('')}
      ${order.map((j, i) => `<div class="l"><span class="s">${i + 1}</span><div>${rubyHTML(b.a[j], 'all')}${j === 0 ? ' ✅' : ''}</div></div>`).join('')}</div><div class="tr">${esc(b.tr)}</div>`;
  }
  return q;
}
function listenPartsOrdered(b, order) {
  const P = [];
  if (b.type === 'hatsuwa') {
    P.push({ t: speech(b.sc.split('|')[0].replace(/^\S+\s/, '')), spk: 'N' }, { t: speech(b.qq), spk: 'N' }, { pause: 500 });
    order.forEach((j, i) => P.push({ t: NUMJ[i], spk: 'N' }, { t: speech(b.a[j]), spk: 'F' }, { pause: 300 }));
  } else {
    const [s, t] = b.lines[0];
    P.push({ t: speech(t), spk: s }, { pause: 600 });
    order.forEach((j, i) => P.push({ t: NUMJ[i], spk: 'N' }, { t: speech(b.a[j]), spk: s === 'M' ? 'F' : 'M' }, { pause: 300 }));
  }
  return P;
}
function qKanji(k) {
  const pool = shuffle(KAN.filter(x => x !== k && x.ko !== k.ko)).slice(0, 3);
  return {
    type: 'kanji', key: k.key, item: k, tags: [], html: `<div class="qbig" style="font-size:64px">${esc(k.k)}</div>`,
    opts: shuffle([{ h: esc(k.ko), ok: 1 }].concat(pool.map(x => ({ h: esc(x.ko) })))), ko: true,
    fb: () => kanjiFB(k),
  };
}
function kanjiFB(k) {
  return `<div class="row"><div class="jw" style="font-size:34px">${esc(k.k)}</div><div class="ko">${esc(k.ko)} <span class="tag">N${k.lv}</span></div></div>
  <div class="ko">음독: <span class="jp">${esc(k.on)}</span> · 훈독: <span class="jp">${esc(k.kun)}</span></div><div class="ex">${rubyHTML(k.ex, 'all')}</div>`;
}
function qKana(set, kata, mode) {
  const kq = kanaQuestion(set, mode, kata);
  const lab = x => `${x[1]} · ${x[2]}`;
  const key = 'kana:' + (kata ? 'k' : 'h') + kq.it[0];
  const ch = kq.ch;
  const fb = () => `<div class="row"><div class="jw" style="font-size:40px">${esc(ch)}</div><div class="ko">${esc(lab(kq.it))}</div><span class="sp"></span><button class="iconbtn" onclick="TTS.say('${esc(kq.it[0])}')">🔊</button></div>`;
  if (mode === 'read') return { type: 'kana', key, kanaKey: key, html: `<div class="qbig kana">${esc(ch)}</div>`, opts: shuffle([{ h: esc(lab(kq.it)), ok: 1 }].concat(kq.wrong.map(x => ({ h: esc(lab(x)) })))), ko: true, fb, say: kq.it[0] };
  if (mode === 'listen') return { type: 'kana', key, kanaKey: key, html: `<div class="listen"><div class="wave">🔊</div><div class="small">소리를 듣고 맞는 글자를 고르세요</div></div>`, opts: shuffle([{ h: esc(ch), ok: 1 }].concat(kq.wrong.map(x => ({ h: esc(kata ? h2k(x[0]) : x[0]) })))), audio: [{ t: kq.it[0], spk: 'N' }], fb, big: true };
  return { type: 'kana', key, kanaKey: key, html: `<div class="qbig" style="font-family:var(--fe)">${esc(lab(kq.it))}</div>`, opts: shuffle([{ h: esc(ch), ok: 1 }].concat(kq.wrong.map(x => ({ h: esc(kata ? h2k(x[0]) : x[0]) })))), fb, big: true };
}
function qConj(key) {
  const verbs = VOC.filter(v => ['v5', 'v1', 'vk'].includes(v.p) && !v.w.includes('〜') && v.s !== 'keigo');
  const d = drillQuestion(verbs, key); if (!d) return null;
  const f = DRILL_FORMS[key];
  return {
    type: 'conj', key: 'c:' + key, tags: ['conj:' + key],
    html: `<div class="qbig" style="font-size:34px">${rubyHTML(d.wd.disp, 'all')}</div><div class="qsub">${esc(d.wd.m)} · ${esc(POS_KO[d.wd.p])}</div><div class="qsub" style="font-size:17px;color:var(--ink)">👉 <b>${esc(f.ko)}</b>은?</div>`,
    opts: shuffle([{ h: esc(d.right), ok: 1 }].concat(d.wrong.map(x => ({ h: esc(x) })))),
    fb: () => `<div class="jw">${rubyHTML(d.wd.disp, 'all')} → <b>${esc(d.right)}</b></div><div class="tip">💡 ${esc(conjTip(d.wd, key))}</div><div class="acts"><button class="btn sm w" onclick="openConcept('conj')">📘 활용 규칙 보기</button></div>`,
    noSrs: true,
  };
}
function conjTip(wd, key) {
  const g = wd.p === 'v5' ? '1그룹(5단)' : wd.p === 'v1' ? '2그룹(1단)' : '3그룹(불규칙)';
  const T = {
    masu: { v5: 'う단 → い단 + ます', v1: 'る를 빼고 + ます', vk: '来る → 来(き)ます' },
    te: { v5: 'う·つ·る→って / む·ぶ·ぬ→んで / く→いて / ぐ→いで / す→して (行く→行って)', v1: 'る → て', vk: '来る → 来(き)て' },
    ta: { v5: 'て형의 て를 た로 (って→った, んで→んだ…)', v1: 'る → た', vk: '来る → 来(き)た' },
    nai: { v5: 'う단 → あ단 + ない (う로 끝나면 わ: 買う→買わない)', v1: 'る → ない', vk: '来る → 来(こ)ない' },
    pot: { v5: 'う단 → え단 + る', v1: 'る → られる', vk: '来る → 来(こ)られる' },
    vol: { v5: 'う단 → お단 + う', v1: 'る → よう', vk: '来る → 来(こ)よう' },
    ba: { v5: 'う단 → え단 + ば', v1: 'る → れば', vk: '来る → 来(く)れば' },
    imp: { v5: 'う단 → え단', v1: 'る → ろ', vk: '来る → 来(こ)い' },
    pass: { v5: 'う단 → あ단 + れる', v1: 'る → られる', vk: '来る → 来(こ)られる' },
    caus: { v5: 'う단 → あ단 + せる', v1: 'る → させる', vk: '来る → 来(こ)させる' },
  };
  return g + ': ' + ((T[key] || {})[wd.p] || '');
}
function qCounter() {
  const c = counterQuestion();
  return {
    type: 'counter', key: 'cnt', tags: ['cnt'], html: `<div class="qbig" style="font-size:52px">${esc(c.disp)}</div><div class="qsub">${esc(c.ko)}</div>`,
    opts: shuffle([{ h: esc(c.right), ok: 1 }].concat(c.wrong.map(x => ({ h: esc(x) })))),
    fb: () => `<div class="jw">${esc(c.disp)} = <b>${esc(c.right)}</b></div><div class="tip">1~10: ${c.table.slice(1).map((r, i) => (i + 1) + ' ' + r).join(' · ')}</div>`,
    noSrs: true, speak: c.right,
  };
}
/* 아이템 → 문제 (passage류는 배열) */
function questionsFor(key, exam) {
  const it = ITEM[key]; if (!it) return [];
  switch (it.kind) {
    case 'v': { const q = qVocabAuto(it, exam); return q ? [q] : []; }
    case 'g': { const q = qGramAuto(it, exam); return q ? [q] : []; }
    case 'k': return [qKanji(it)];
    case 'p': return [qPara(it)];
    case 'u': return [qUsage(it)];
    case 'b': return qBunshou(it);
    case 'r': return qRead(it);
    case 'l': return [qListen(it)];
  }
  return [];
}

/* ---------- 오늘의 학습 ---------- */
// N5 단계: N5만 / N4 단계: 남은 N5와 N4를 번갈아 (N4가 늦게 시작되지 않게)
function lvOrder(list) {
  const a = list.filter(x => x.lv === 5), b = list.filter(x => x.lv !== 5);
  if (stage() !== 'n4') return a.length ? a : b;
  const out = []; for (let i = 0; i < Math.max(a.length, b.length); i++) { if (a[i]) out.push(a[i]); if (b[i]) out.push(b[i]); }
  return out;
}
function newVocab(n) { return lvOrder(VOC.filter(v => !S.it[v.key] && !S.bad[v.key]).sort((a, b) => a.i - b.i)).slice(0, n); }
function newGram(n) { return lvOrder(GRAM.filter(g => !S.it[g.key])).slice(0, n); }
function pickUnseen(list, n) { const un = list.filter(x => !S.it[x.key]); return (un.length ? un : shuffle(list)).slice(0, n); }
function kanaMastery() {
  const keys = KANA_ALL.map(x => 'kana:h' + x[0]).concat(KANA_ALL.map(x => 'kana:k' + x[0]));
  const ok = keys.filter(k => (S.kana[k] || 0) >= 2).length;
  return ok / keys.length;
}
function needKana() { return S.kanaLv < 2 && kanaMastery() < .85; }
/* 가나 집중 기간에는 새 단어·문법 양을 줄여요 */
function effPlan() {
  const P = Object.assign({}, S.plan);
  if (needKana()) {
    const km = kanaMastery();
    if (S.kanaLv === 0 && km < .5) { P.v = Math.min(P.v, 5); P.g = 0; P.r = 0; P.l = 0; }
    else { P.v = Math.min(P.v, 10); P.g = Math.min(P.g, 1); P.r = Math.min(P.r, 1); P.l = Math.min(P.l, 1); }
  } else P.kana = 0;
  // 기초가 쌓이기 전에는 독해·청해를 넣지 않아요 (쌓이면 쉬운 것부터)
  if (!rlOpen()) { P.r = 0; P.l = 0; }
  else if (stage() !== 'n4' && !S.set.rlEarly) { P.r = Math.min(P.r, 1); P.l = Math.min(P.l, 2); }
  return P;
}
function todayLeft() {
  const D = S.days[dstr()] || {}, P = effPlan();
  const due = dueKeys().filter(k => !k.startsWith('kana')).length;
  return {
    kana: Math.max(0, P.kana - (D.nk || 0)), v: Math.max(0, P.v - (D.nv || 0)), g: Math.max(0, P.g - (D.ng || 0)),
    rev: Math.min(due, Math.max(0, P.rev - (D.rv || 0))), r: Math.max(0, P.r - (D.nr || 0)), l: Math.max(0, P.l - (D.nl || 0)),
  };
}
function buildToday() {
  const L = todayLeft();
  const cap = { kana: 15, v: 10, g: 1, rev: 20, r: 1, l: 2 };
  const n = {}; Object.keys(cap).forEach(k => n[k] = Math.min(L[k], cap[k]));
  const steps = [];
  if (n.kana) {
    const kata = kanaMastery() > .45 || S.kanaLv === 1;
    for (let i = 0; i < n.kana; i++) steps.push({ kind: 'make', cnt: 'nk', make: () => qKana(i % 3 === 2 ? KANA_DAKU.concat(KANA_YOON) : KANA_BASIC, kata && i % 2 === 1, pick(['read', 'read', 'write', 'listen'])) });
  }
  const ng = newGram(n.g), nv = newVocab(n.v);
  const fresh = new Set(ng.map(g => g.key).concat(nv.map(v => v.key)));
  const due = dueKeys().filter(k => !k.startsWith('kana') && !fresh.has(k)).slice(0, n.rev);
  const core = [];
  ng.forEach(g => { core.push({ kind: 'gcard', g }); core.push({ kind: 'item', key: g.key }); if (g.q.length > 1) core.push({ kind: 'item', key: g.key }); });
  for (let i = 0; i < nv.length; i += 5) {
    const chunk = nv.slice(i, i + 5);
    chunk.forEach(v => core.push({ kind: 'flash', v }));
    shuffle(chunk).forEach(v => core.push({ kind: 'item', key: v.key }));
  }
  let ri = 0;
  core.forEach((st, i) => { steps.push(st); if (i % 3 === 2 && ri < due.length) steps.push({ kind: 'item', key: due[ri++], cnt: 'rv' }); });
  while (ri < due.length) steps.push({ kind: 'item', key: due[ri++], cnt: 'rv' });
  pickUnseen(easyFirst(READ.filter(r => r.type === 'short').concat(BUN)), n.r).forEach(r => steps.push({ kind: 'item', key: r.key, cnt: 'nr' }));
  pickUnseen(easyFirst(LIS), n.l).forEach(l => steps.push({ kind: 'item', key: l.key, cnt: 'nl' }));
  return steps;
}
function todayRemainSteps() { const L = todayLeft(); return L.kana + L.v * 2 + L.g * 3 + L.rev + L.r * 3 + L.l; }
function todayStatus() {
  const D = S.days[dstr()] || { n: 0, c: 0 };
  const L = todayLeft();
  const left = todayRemainSteps();
  const done = left === 0;
  if (done && D.n && !D.plan) { D.plan = 1; S.days[dstr()] = D; save(); }
  return { D, L, left, done, rounds: Math.ceil(left / 30) };
}

/* ---------- 세션 ---------- */
let SES = null, CUR_Q = null;
function startSession(steps, opt) {
  if (!steps.length) { toast('지금 풀 문제가 없어요'); return; }
  SES = { steps, i: 0, ok: 0, n: 0, wrongs: [], opt: opt || {}, t0: Date.now(), before: predict().total, built: {}, requeued: {} };
  go('session');
}
function curStep() { return SES && SES.steps[SES.i]; }
function buildStep(st) {
  if (st.q) return st.q;
  if (st.kind === 'make') { st.q = st.make(); return st.q; }
  if (st.kind === 'item') {
    const qs = questionsFor(st.key, SES.opt.exam);
    if (!qs.length) return null;
    if (qs.length > 1) { // 문단: 뒤에 이어 붙이기
      const rest = qs.slice(1).map(q => ({ kind: 'q', q }));
      SES.steps.splice(SES.i + 1, 0, ...rest);
    }
    st.q = qs[0]; return st.q;
  }
  return st.q || null;
}
function sessionHTML() {
  const st = curStep();
  if (!st) return summaryHTML();
  const total = SES.steps.length;
  const head = `<div class="qhead"><button class="back" onclick="quitSession()">✕</button><div class="bar"><i style="width:${Math.round(SES.i / total * 100)}%"></i></div><b>${SES.i + 1}/${total}</b></div>`;
  if (st.kind === 'flash') return head + flashHTML(st.v);
  if (st.kind === 'gcard') return head + gcardHTML(st.g, true);
  let q = buildStep(st);
  if (!q) { SES.steps.splice(SES.i, 1); return sessionHTML(); }
  CUR_Q = q;
  return head + quizHTML(q, st);
}
function flashHTML(v) {
  setTimeout(() => TTS.say(k2h(v.r)), 200);
  return `<div class="card flash"><div class="row" style="justify-content:space-between"><span class="tag">새 단어 · N${v.lv}</span><span class="tag k">${esc(POS_KO[v.p] || '')}</span></div>
  <div class="w">${rubyHTML(v.disp, 'all')}</div><div class="r">${esc(v.r)}</div><div class="m">${esc(v.m)}</div>
  <div class="ex">${sentHTML(v.ex, 'all', 'u')}<div class="tr">${esc(v.tr)}</div></div>
  <div class="acts"><button class="btn w" onclick="TTS.say('${esc(k2h(v.r))}')">🔊 단어</button><button class="btn w" onclick="TTS.say(speech(VBY['${esc(v.key)}'].ex))">🔊 예문</button></div></div>
  <div class="acts"><button class="btn full" onclick="flashNext('${esc(v.key)}')">외웠어요! 다음 ▶</button></div>`;
}
function flashNext(key) {
  const D = S.days[dstr()] || (S.days[dstr()] = { n: 0, c: 0 }); D.nv = (D.nv || 0) + 1;
  if (!S.it[key]) S.it[key] = { l: 0, d: today(), c: 0, w: 0 };
  save(); nextStep();
}
function gcardHTML(g, inSession) {
  return `<div class="card gcard"><div class="row" style="justify-content:space-between"><span class="tag">${inSession ? '새 문법' : '문법'} · N${g.lv}</span><span class="tag l">${esc(g.tag)}</span></div>
  <div class="pt" style="margin-top:8px">${esc(g.p)}</div><div class="mn">${esc(g.m)}</div>
  ${g.con.map(c => `<div class="con">${esc(c)}</div>`).join('')}
  <div class="nt">${g.note.map(n => `<div>• ${rubyHTML(n, 'all')}</div>`).join('')}</div>
  ${g.warn.map(w => `<div class="wr">⚠️ ${rubyHTML(w, 'all')}</div>`).join('')}
  <div class="exs">${g.ex.map(e => `<div><div class="j">${rubyHTML(e[0], 'all')}</div><div class="k">${esc(e[1])}</div></div>`).join('')}</div>
  <div class="acts"><button class="btn sm w" onclick="TTS.play(GBY['${g.id}'].ex.map(e=>({t:speech(e[0]),spk:'F'})))">🔊 예문 듣기</button></div></div>
  ${inSession ? `<div class="acts"><button class="btn full" onclick="gcardNext('${g.id}')">이해했어요! 문제 풀기 ▶</button></div>` : ''}`;
}
function gcardNext(id) {
  const D = S.days[dstr()] || (S.days[dstr()] = { n: 0, c: 0 }); D.ng = (D.ng || 0) + 1;
  const g = GBY[id]; if (!S.it[g.key]) S.it[g.key] = { l: 0, d: today(), c: 0, w: 0 };
  save(); nextStep();
}
function typeChip(q) {
  const T = TYPE[q.type] || {};
  return `<div class="qtype"><span class="tag">${esc(T.jp || '')}</span><span class="tag k">${esc(T.ko || '')}</span>${q.gn > 1 ? `<span class="tag m">${q.gi + 1}/${q.gn}</span>` : ''}</div>`;
}
function quizHTML(q, st, mock) {
  const T = TYPE[q.type] || {};
  let h = typeChip(q);
  const inst = q.type === 'kana' ? '' : (T.inst || '');
  if (inst) h += `<div class="inst" style="margin-bottom:8px">${esc(inst)}${T.jinst && S.set.furi !== 'all' ? `<br><span class="jp">${esc(T.jinst)}</span>` : ''}</div>`;
  if (q.passage) h += `<div class="passage" id="psg">${q.title ? `<div class="small" style="margin-bottom:4px">${esc(q.title)}</div>` : ''}${q.passage()}</div>`;
  const muted = q.listen && (S.set.mute || (SES && SES.mute));
  if (q.listen) {
    const qh = mock && (q.type === 'kadai' || q.type === 'point') ? '' : q.html;
    if (muted) h += `<div class="card prompt" style="margin-top:8px">${q.html}${q.muteHTML()}</div>`;
    else h += `<div class="card prompt" style="margin-top:8px"><div class="listen"><button class="bigsay iconbtn" style="width:78px;height:78px;font-size:34px;margin:0 auto" onclick="playQ()">🔊</button><div class="small" id="lstate" style="margin-top:6px">잘 들어 보세요</div></div>${qh}
      ${mock ? '' : `<button class="unknown" onclick="muteListen()">🎧 지금 소리를 못 들어요</button>`}</div>`;
  } else {
    h += `<div class="card prompt" style="${q.passage ? 'margin-top:10px;padding:12px' : ''}">${q.html}${q.say || q.speak ? `` : ''}</div>`;
  }
  const answered = q._ans != null;
  h += `<div class="choices ${q.row3 ? 'row3' : ''}">` + q.opts.map((o, i) => {
    let cls = 'choice' + (q.ko ? ' ko' : '');
    if (answered && !mock) { if (o.ok) cls += ' ok'; else if (q._ans === i) cls += ' no'; else cls += ' dim'; }
    if (mock && q._ans === i) cls += ' sel';
    return `<button class="${cls}" onclick="answer(${i})"${answered && !mock ? ' disabled' : ''}>${q.row3 ? '' : `<span class="no_">${i + 1}</span>`}<span>${o.h}</span></button>`;
  }).join('') + '</div>';
  if (!answered && !mock) h += `<button class="unknown" onclick="answer(-1)">🤔 모르겠어요</button>`;
  if (answered && !mock) h += feedbackHTML(q);
  return h;
}
function feedbackHTML(q) {
  const ok = q._ok;
  const say = q.speak || (q.item && q.item.ex) ? `<button class="iconbtn" onclick="speakCur()">🔊</button>` : '';
  return `<div class="fb ${ok ? 'ok' : 'no'}"><div class="row"><div class="verdict">${ok ? pick(['정답! 🎉', '맞았어요! ✨', '좋아요! 💛', '완벽해요! 🌸']) : (q._ans === -1 ? '괜찮아요, 같이 봐요 📘' : '아쉬워요 😢 정답을 확인해요')}</div><span class="sp"></span>${say}</div>
  ${q.fb ? q.fb() : ''}
  <div class="acts">${q.key && !q.noSrs ? `<button class="btn sm w" onclick="reportBad()">🚩 문제 이상해요</button>` : ''}<button class="btn" onclick="nextStep()">다음 ▶</button></div></div>`;
}
function speakCur() {
  const q = CUR_Q; if (!q) return;
  if (q.listen) { TTS.play(q.audio); return; }
  if (q.speak) TTS.say(q.speak); else if (q.say) TTS.say(q.say);
}
function playQ() {
  const q = CUR_Q; if (!q || !q.audio || !VIEW) return;
  if (VIEW.name === 'mock' && (!M || M.phase !== 'q' || M.secs[M.si].qs[M.qi] !== q)) return;
  if (VIEW.name === 'session' && (!SES || !curStep() || curStep().q !== q)) return;
  if (!['mock', 'session'].includes(VIEW.name)) return;
  if (VIEW && VIEW.name === 'mock') { if (q._played) { toast('실제 시험처럼 한 번만 들을 수 있어요'); return; } q._played = 1; }
  const el = $('#lstate'); if (el) el.textContent = '듣는 중… 🎧';
  const w = document.querySelector('.listen .bigsay'); if (w) w.classList.add('wave', 'on');
  TTS.play(q.audio, () => { const e2 = $('#lstate'); if (e2) e2.textContent = '답을 고르세요 (🔊 다시 듣기 가능)'; const w2 = document.querySelector('.listen .bigsay'); if (w2) w2.classList.remove('on'); });
}
function muteListen() {
  modal(`<div class="mt">🎧 소리를 못 듣는 상황이에요?</div><div class="md">이번 학습에서는 청해 문제를 <b>대본 읽기</b>로 바꿔서 풀게요. (점수 예측에는 덜 반영돼요)</div>
  <div class="acts"><button class="btn w" onclick="closeModal()">아니요</button><button class="btn" onclick="SES.mute=true;closeModal();TTS.stop();render()">대본으로 풀기</button></div>`);
}
function answer(i) {
  const q = CUR_Q; if (!q) return;
  if (VIEW && VIEW.name === 'mock') { mockAnswer(i); return; }
  if (q._ans != null) return;
  TTS.stop();
  q._ans = i; const o = q.opts[i]; q._ok = !!(o && o.ok);
  SES.n++; if (q._ok) SES.ok++; else { SES.wrongs.push(q); vib(60); }
  if (q.type === 'kana') { const k = q.kanaKey; S.kana[k] = q._ok ? Math.min(5, (S.kana[k] || 0) + 1) : 0; save(); }
  else if (!q.noSrs) record(q, q._ok, o && !q._ok ? o.tag : null, { muted: q.listen && SES.mute });
  else { // 드릴: 태그만
    const tags = q.tags || [];
    tags.forEach(t => { const g = S.tg[t] || (S.tg[t] = { w: 0, c: 0, last: 0 }); if (q._ok) g.c++; else { g.w++; g.last = today(); } });
    const D = S.days[dstr()] || (S.days[dstr()] = { n: 0, c: 0 }); D.n++; if (q._ok) D.c++; touchStreak(); save();
  }
  // 오늘의 학습 진행량
  const st = curStep();
  if (SES.opt.today && st && st.cnt && !st.counted && !(q.gi > 0)) {
    st.counted = 1; const D = S.days[dstr()] || (S.days[dstr()] = { n: 0, c: 0 }); D[st.cnt] = (D[st.cnt] || 0) + 1; save();
  }
  // 틀리면 같은 아이템을 조금 뒤에 한 번 더
  if (!q._ok && st && st.kind === 'item' && !SES.requeued[st.key] && !q.group && !SES.opt.noRequeue) {
    SES.requeued[st.key] = 1;
    SES.steps.splice(Math.min(SES.steps.length, SES.i + 4), 0, { kind: 'item', key: st.key });
  }
  if (q.type === 'kana' && !q._ok && st && st.kind === 'make' && !st.re) SES.steps.splice(Math.min(SES.steps.length, SES.i + 3), 0, { kind: 'make', make: st.make, re: 1 });
  render(true);
  setTimeout(() => { const f = document.querySelector('.fb'); if (f) f.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 60);
  if (q._ok && (q.speak || q.say) && !q.listen && q.type !== 'gram') setTimeout(speakCur, 250);
}
function reportBad() {
  const q = CUR_Q; if (!q || !q.key) return;
  modal(`<div class="mt">🚩 이 문제가 이상한가요?</div><div class="md">정답이 두 개 같거나 어색하면 알려 주세요. 이 문제는 앞으로 나오지 않게 할게요.</div>
  <div class="acts"><button class="btn w" onclick="closeModal()">취소</button><button class="btn p" onclick="S.bad[CUR_Q.key]=1;save();closeModal();toast('빼 둘게요. 고마워요!')">빼 주세요</button></div>`);
}
function nextStep() {
  TTS.stop();
  SES.i++;
  render();
  window.scrollTo(0, 0);
  const st = curStep();
  if (st && st.q && st.q.listen && !(S.set.mute || SES.mute)) setTimeout(playQ, 400);
  else if (st && st.kind === 'item') { const q = buildStep(st); render(); if (q && q.listen && !(S.set.mute || SES.mute)) setTimeout(playQ, 400); else if (q && q.type === 'kana' && q.audio) setTimeout(() => TTS.play(q.audio), 300); }
  else if (st && st.kind === 'make') { const q = buildStep(st); render(); if (q && q.audio) setTimeout(() => TTS.play(q.audio), 300); }
}
function quitSession() {
  if (SES && SES.i < SES.steps.length && SES.n > 0) {
    modal(`<div class="mt">그만할까요?</div><div class="md">지금까지 푼 ${SES.n}문제는 저장됐어요.</div><div class="acts"><button class="btn w" onclick="closeModal()">계속하기</button><button class="btn" onclick="closeModal();SES.i=SES.steps.length;render()">결과 보기</button></div>`);
  } else { TTS.stop(); SES = null; back(); }
}
function summaryHTML() {
  TTS.stop();
  const pct = SES.n ? Math.round(SES.ok / SES.n * 100) : 0;
  if (!SES.done) {
    SES.done = true;
    const D = S.days[dstr()] || (S.days[dstr()] = { n: 0, c: 0 });
    if (SES.opt.today && todayRemainSteps() === 0) D.plan = 1;
    D.min = (D.min || 0) + Math.round((Date.now() - SES.t0) / 60000);
    if (SES.n >= 10 && SES.ok === SES.n) S.perfect = (S.perfect || 0) + 1;
    snapPred(); checkUnlocks(); save(true);
    if (pct >= 80 && SES.n >= 5) setTimeout(() => burst(30), 200);
  }
  const after = predict().total, d = after - SES.before;
  const wr = SES.wrongs.filter(q => q.key && !q.noSrs && q.type !== 'kana');
  const wk = SES.wrongs.filter(q => q.type === 'kana').map(q => q.kanaKey.slice(6));
  return `<div class="card result"><div class="big">${creature(S.avatar, {})}</div><div class="t">${pct >= 90 ? '최고예요! 🎉' : pct >= 70 ? '잘했어요! 💪' : pct >= 40 ? '좋아요, 조금씩 늘고 있어요' : '틀린 건 다 내 거 될 거예요!'}</div>
  <div class="score">${SES.ok}<small> / ${SES.n}</small></div><div class="small">정답률 ${pct}% · ${Math.max(1, Math.round((Date.now() - SES.t0) / 60000))}분</div>
  <div class="row" style="justify-content:center;margin-top:10px;gap:6px"><span class="tag">예상 점수 ${after}점</span>${d ? `<span class="tag ${d > 0 ? 'm' : 'p'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d)}</span>` : ''}</div></div>
  ${wr.length ? `<div class="card" style="margin-top:14px"><div class="h3">📒 틀린 문제 ${wr.length}개</div><div class="sub">오답 노트에 모아 뒀어요. 두 번 더 맞히면 빠져요.</div><div class="clist" style="margin-top:10px">${wr.slice(0, 15).map(wrongRow).join('')}</div></div>` : ''}
  ${wk.length ? `<div class="card" style="margin-top:14px"><div class="h3">🔤 헷갈린 가나</div><div class="kgrid" style="margin-top:8px">${[...new Set(wk)].slice(0, 15).map(c => { const x = KANA_ALL.find(y => y[0] === c); return `<button onclick="TTS.say('${c}')"><b>${c}</b><span>${x ? x[1] : ''}</span></button>`; }).join('')}</div></div>` : ''}
  <div class="acts"><button class="btn w" onclick="SES=null;tab('home')">홈으로</button>${wr.length ? `<button class="btn p" onclick="startWrong()">오답만 다시</button>` : ''}</div>`;
}

function wrongRow(q) {
  const it = q.item || {}, T = TYPE[q.type] || {};
  let a = '', b = '';
  if (it.kind === 'v') { a = rubyHTML(it.disp, 'all'); b = it.m; }
  else if (it.kind === 'g') { a = esc(it.p); b = it.m; }
  else if (it.kind === 'k') { a = esc(it.k); b = it.ko; }
  else if (it.kind === 'u') { a = esc(it.a[0]); b = '용법'; }
  else { a = esc(T.jp || ''); b = it.title || T.ko || ''; }
  return `<div class="citem"><span class="p">${a}</span><span class="m">${esc(b)}</span><span class="tag k">${esc(T.ko || '')}</span></div>`;
}

/* ---------- 연습 모드 ---------- */
const PRACTICE = [
  { g: '🔤 기초', items: [['kana_h', '히라가나', 'ひらがな'], ['kana_k', '가타카나', 'カタカナ'], ['imi', '단어 뜻', '単語'], ['kanji', '한자', '漢字'], ['conj', '동사 활용', '活用'], ['counter', '조수사·날짜', '助数詞']] },
  { g: '📝 문자·어휘', items: [['yomi', '한자 읽기', '漢字読み'], ['hyouki', '표기', '表記'], ['bunmyaku', '문맥 규정', '文脈規定'], ['para', '바꿔 말하기', '言い換え類義'], ['usage', '용법', '用法']] },
  { g: '🧩 문법', items: [['gram', '문법 형식', '文の文法1'], ['star', '문장 배열 ★', '文の文法2'], ['bunshou', '글의 문법', '文章の文法']] },
  { g: '📖 독해', items: [['short', '단문', '内容理解（短文）'], ['mid', '중문', '内容理解（中文）'], ['info', '정보 검색', '情報検索']] },
  { g: '🎧 청해', items: [['kadai', '과제 이해', '課題理解'], ['point', '포인트 이해', 'ポイント理解'], ['hatsuwa', '발화 표현', '発話表現'], ['sokuji', '즉시 응답', '即時応答']] },
];
function practiceStats(t) {
  const T = S.ty[t] || { c: 0, t: 0 };
  return T.t ? `정답률 ${Math.round(T.c / T.t * 100)}% · ${T.t}문제` : '아직 안 풀었어요';
}
function practiceSteps(t, n) {
  n = n || 15;
  const st = [];
  const mk = f => ({ kind: 'make', make: f });
  const vPick = (filter, cnt) => {
    const pool = stageVoc(VOC).filter(v => !S.bad[v.key] && filter(v));
    const known = pool.filter(v => S.it[v.key]), un = pool.filter(v => !S.it[v.key]);
    const due = known.filter(v => S.it[v.key].d <= today());
    return shuffle(due).concat(shuffle(known.filter(v => S.it[v.key].d > today())).slice(0, Math.ceil(cnt / 2))).concat(un.slice(0, cnt)).slice(0, cnt * 2);
  };
  switch (t) {
    case 'kana_h': case 'kana_k': for (let i = 0; i < 20; i++) st.push(mk(() => qKana(i < 10 ? KANA_BASIC : KANA_ALL, t === 'kana_k', pick(['read', 'read', 'write', 'listen'])))); break;
    case 'imi': vPick(() => true, n).slice(0, n).forEach(v => st.push(mk(() => qVocab(v, pick(['imi', 'imi2']))))); break;
    case 'kanji': pickUnseen(KAN, 0); shuffle(KAN.filter(k => !S.it[k.key] || S.it[k.key].d <= today())).slice(0, n).forEach(k => st.push({ kind: 'item', key: k.key })); break;
    case 'conj': { const keys = Object.keys(DRILL_FORMS); for (let i = 0; i < n; i++) { const k = VIEW && VIEW.form ? VIEW.form : pick(keys); st.push(mk(() => qConj(k))); } break; }
    case 'counter': for (let i = 0; i < n; i++) st.push(mk(qCounter)); break;
    case 'yomi': case 'hyouki': case 'bunmyaku': {
      const cands = vPick(v => t === 'bunmyaku' ? !!v.an && !['pron', 'ctr', 'exp', 'int', 'vsi'].includes(v.p) : v.hasK, n * 2);
      let c = 0; for (const v of cands) { const q = qVocab(v, t); if (q) { st.push({ kind: 'q', q }); if (++c >= n) break; } }
      break;
    }
    case 'para': pickSrs(PARA, n).forEach(x => st.push({ kind: 'q', q: qPara(x) })); break;
    case 'usage': pickSrs(USE, n).forEach(x => st.push({ kind: 'q', q: qUsage(x) })); break;
    case 'gram': pickSrs(stageVoc(GRAM), n).forEach(g => st.push({ kind: 'q', q: qGram(g, rnd(g.q.length)) })); break;
    case 'star': pickSrs(stageVoc(GRAM).filter(g => g.s.length), n).forEach(g => st.push({ kind: 'q', q: qStar(g, rnd(g.s.length)) })); break;
    case 'bunshou': pickSrs(BUN, 2).forEach(b => qBunshou(b).forEach(q => st.push({ kind: 'q', q }))); break;
    case 'short': pickSrs(READ.filter(r => r.type === 'short'), 5).forEach(b => qRead(b).forEach(q => st.push({ kind: 'q', q }))); break;
    case 'mid': pickSrs(READ.filter(r => r.type === 'mid'), 2).forEach(b => qRead(b).forEach(q => st.push({ kind: 'q', q }))); break;
    case 'info': pickSrs(READ.filter(r => r.type === 'info'), 2).forEach(b => qRead(b).forEach(q => st.push({ kind: 'q', q }))); break;
    case 'kadai': case 'point': case 'hatsuwa': case 'sokuji': pickSrs(LIS.filter(l => l.type === t), t === 'sokuji' ? 8 : 5).forEach(b => st.push({ kind: 'q', q: qListen(b) })); break;
  }
  return st;
}
function pickSrs(list, n) {
  const ok = list.filter(x => !S.bad[x.key]);
  const due = ok.filter(x => S.it[x.key] && S.it[x.key].d <= today());
  let un = ok.filter(x => !S.it[x.key]);
  if (stage() !== 'n4' && un.length && un[0].d != null) { un = easyFirst(un); const k = Math.max(n, Math.ceil(un.length * .4)); un = shuffle(un.slice(0, k)); } // 기초 단계엔 쉬운 것부터
  const rest = ok.filter(x => S.it[x.key] && S.it[x.key].d > today());
  return shuffle(due).concat(un[0] && un[0].d != null && stage() !== 'n4' ? un : shuffle(un)).concat(shuffle(rest)).slice(0, n);
}
function startPractice(t) {
  const st = practiceSteps(t);
  startSession(st, { practice: t, exam: true, noRequeue: ['kadai', 'point', 'hatsuwa', 'sokuji', 'short', 'mid', 'info', 'bunshou'].includes(t) });
  setTimeout(() => { const s = curStep(); if (s && s.q && s.q.listen && !S.set.mute) playQ(); else if (s && s.kind === 'make') { const q = buildStep(s); render(); if (q && q.audio) TTS.play(q.audio); } }, 450);
}
function startWrong() {
  const keys = wrongKeys();
  if (!keys.length) { toast('오답 노트가 비어 있어요 👍'); return; }
  startSession(shuffle(keys).slice(0, 30).map(k => ({ kind: 'item', key: k })), { wrong: true, exam: true });
}
function startToday() {
  let st = buildToday();
  if (!st.length) {
    const extra = dueKeys().filter(k => !k.startsWith('kana')).slice(0, 20).map(k => ({ kind: 'item', key: k }));
    if (extra.length) st = extra;
    else { const nv = newVocab(5); nv.forEach(v => st.push({ kind: 'flash', v })); nv.forEach(v => st.push({ kind: 'item', key: v.key })); }
    if (!st.length) { toast('오늘 할 공부를 다 했어요! 문제 탭에서 더 풀 수 있어요'); return; }
  }
  startSession(st, { today: true });
  setTimeout(() => { const s = curStep(); if (s && s.kind === 'make') { const q = buildStep(s); render(); if (q && q.audio) TTS.play(q.audio); } }, 400);
}

/* ---------- 화면: 처음 설정 ---------- */
let SETUP = { step: 0 };
function setupHTML() {
  const st = SETUP.step;
  const dots = `<div class="steps">${[0, 1, 2, 3, 4].map(i => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div>`;
  if (st === 0) return `<div class="setup">${dots}<div class="hero" style="margin-top:20px"><div class="bubble">같이 N4 붙어 보자!</div><div class="big mon">${creature({ sp: 'nyang', col: '#F2C9D3', eyes: 'sparkle', mouth: 'cat' })}</div>
    <div class="bigtitle" style="margin-top:6px"><span class="ttl" style="color:#F2D07A">공!부!해!</span><span class="n4">N4</span></div>
    <div class="q" style="margin-top:14px">JLPT N5·N4 합격, 이 앱 하나로 준비해요</div><div class="sub">단어 ${VOC.length.toLocaleString()}개 · 문법 ${GRAM.length}개 · 한자 ${KAN.length}자 · 독해 ${READ.length + BUN.length}지문 · 청해 ${LIS.length}문제<br>실제 시험과 같은 유형으로 풀고, 자주 틀리는 개념은 바로 설명해 줘요.</div></div>
    <button class="btn full" onclick="SETUP.step=1;render()">시작하기 ▶</button></div>`;
  if (st === 1) return `<div class="setup">${dots}<div class="hero"><div class="q">뭐라고 부를까요?</div></div>
    <input class="txt" id="nm" maxlength="10" placeholder="이름 또는 별명" value="${esc(S.name)}">
    <div class="sub" style="text-align:center">시험 날짜도 확인해 주세요 (바꿀 수 있어요)</div>
    <input class="txt" id="exd" type="date" value="${esc(S.exam)}">
    <div class="sub" style="text-align:center">2026년 12월 시험: <b>12월 6일(일)</b></div>
    <div class="sub" style="text-align:center;margin-top:6px">어느 급을 볼 거예요?</div>
    <div class="chips" style="justify-content:center">${[[5, 'N5 (가장 쉬운 급)'], [4, 'N4']].map(([k, n]) => `<button class="chip ${S.examLv === k ? 'on' : ''}" onclick="S.name=($('#nm').value.trim()||S.name);S.exam=$('#exd').value||S.exam;setExamLv(${k});render()">${n}</button>`).join('')}</div>
    <div class="sub" style="text-align:center">어느 급이든 공부는 <b>가나 → N5 → N4</b> 순서로 쉬운 것부터 해요</div>
    <button class="btn full" onclick="S.name=($('#nm').value.trim()||'나');S.exam=$('#exd').value||S.exam;SETUP.step=2;save();render()">다음 ▶</button></div>`;
  if (st === 2) {
    const ops = [['🥚', '히라가나도 아직 몰라요', '가나부터 차근차근 시작해요'], ['🐣', '히라가나는 읽어요', '가타카나 연습을 함께 넣어 줄게요'], ['🐥', '가나는 다 읽어요', '바로 단어·문법으로 들어가요']];
    return `<div class="setup">${dots}<div class="hero"><div class="q">일본어 글자, 어디까지 읽을 수 있어요?</div></div>
    <div class="lv">${ops.map((o, i) => `<button class="lvopt ${S.kanaLv === i ? 'on' : ''}" onclick="S.kanaLv=${i};render()"><span class="e">${o[0]}</span><div><div class="n">${o[1]}</div><div class="d">${o[2]}</div></div></button>`).join('')}</div>
    <button class="btn full" onclick="SETUP.step=3;save();render()">다음 ▶</button></div>`;
  }
  if (st === 3) {
    const left = Math.max(1, daysLeft());
    const VV = S.examLv === 5 ? VOC.filter(v => v.lv === 5) : VOC, GG = S.examLv === 5 ? GRAM.filter(g => g.lv === 5) : GRAM;
    const rec = Math.min(60, Math.max(10, Math.ceil(VV.length / Math.max(1, left - 7) / 5) * 5));
    const recG = Math.max(1, Math.ceil(GG.length / Math.max(1, left - 7)));
    if (!SETUP.planSet) { S.plan.v = rec; S.plan.g = recG; SETUP.planSet = 1; }
    return `<div class="setup">${dots}<div class="hero"><div class="q">하루에 얼마나 공부할까요?</div><div class="sub">시험까지 <b>${left}일</b> 남았어요. 시험 1주 전까지 전 범위를 한 번 끝내는 속도를 추천해요.</div></div>
    <div class="card"><div class="prow"><div class="pl"><div class="pt">새 단어 / 하루</div><div class="pd">추천 ${rec}개</div></div>${stepper('plan.v', 5, 80, 5)}</div>
    <div class="prow"><div class="pl"><div class="pt">새 문법 / 하루</div><div class="pd">추천 ${recG}개</div></div>${stepper('plan.g', 1, 8, 1)}</div>
    <div class="prow"><div class="pl"><div class="pt">청해 / 하루</div><div class="pd">기초가 쌓이면 쉬운 것부터 시작돼요</div></div>${stepper('plan.l', 0, 10, 1)}</div>
    <div class="prow"><div class="pl"><div class="pt">독해 / 하루</div><div class="pd">기초가 쌓이면 쉬운 것부터 시작돼요</div></div>${stepper('plan.r', 0, 5, 1)}</div></div>
    ${S.kanaLv === 0 ? '<div class="sub" style="text-align:center;background:#FBEFCB;border-radius:12px;padding:8px">🔤 처음 며칠은 <b>가나 집중 기간</b>이에요. 가나를 익히면 이 양으로 자동으로 늘어나요.</div>' : ''}
    <div class="sub" style="text-align:center">하루 분량은 10분짜리 라운드로 나눠서 풀어요 · 설정에서 바꿀 수 있어요<br>🪜 <b>가나 → N5 → N4</b> 순서로 쉬운 것부터 해요</div>
    <button class="btn full" onclick="SETUP.step=4;save();render()">다음 ▶</button></div>`;
  }
  return `<div class="setup">${dots}<div class="hero"><div class="q">나만의 캐릭터를 골라요</div><div class="sub">합격에 가까워질수록 꾸미기 아이템이 열려요</div><div class="big mon" style="margin-top:6px">${creature(S.avatar)}</div></div>
    ${avatarEditor()}
    <button class="btn full" onclick="finishSetup()">완료! 실력 진단하러 가기 ▶</button></div>`;
}
function stepper(path, min, max, step) {
  const [a, b] = path.split('.'); const v = S[a][b];
  return `<div class="stepper"><button onclick="stepV('${path}',${-step},${min},${max})">−</button><b>${v}</b><button onclick="stepV('${path}',${step},${min},${max})">＋</button></div>`;
}
function stepV(path, d, min, max) { const [a, b] = path.split('.'); S[a][b] = Math.max(min, Math.min(max, S[a][b] + d)); save(); render(); }
function setExamLv(k) {
  if (S.examLv === k) return;
  const old = passLine(S.examLv);
  S.examLv = k;
  if (S.target === (old === 90 ? 120 : 100) || !S.target) S.target = k === 5 ? 100 : 120;
  save();
}
function finishSetup() {
  S.setupDone = true; save(true);
  askNotify(); syncReminders();
  TAB = 'home'; VIEW = null; STACK = [];
  if (stage() === 'kana') { // 가나를 아직 못 읽으면 진단은 가나를 익힌 뒤에
    render();
    modal(`<div class="mt">🔤 가나부터 시작해요</div><div class="md">아직 가나를 못 읽으면 모의고사는 거의 다 '모르겠어요'가 돼요. 가나를 익히면 <b>N5 진단 모의고사</b>로 출발점을 기록할게요.</div>
    <div class="lv" style="margin-top:12px"><button class="lvopt on" onclick="closeModal();startToday()"><span class="e">🔤</span><div><div class="n">가나 공부 시작 (추천)</div></div></button>
    <button class="lvopt" onclick="closeModal();mockIntro('quick5',true)"><span class="e">📝</span><div><div class="n">그래도 지금 N5 진단 보기</div></div></button></div>`, { sticky: true });
    return;
  }
  mockIntro(stageLv() === 5 ? 'quick5' : 'quick', true); // 맨 처음엔 바로 실력 진단 모의고사
}

/* ---------- 화면: 홈 ---------- */
function gaugeSVG(pct) {
  const r = 80, c = Math.PI * r, p = Math.max(0, Math.min(100, pct)) / 100;
  return `<svg viewBox="0 0 200 118"><path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#3B2F4A" stroke-width="22" stroke-linecap="round"/>
  <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#F1E7CF" stroke-width="16" stroke-linecap="round"/>
  <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="${pct >= 100 ? '#9CCDB6' : '#F2D07A'}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${(c * p).toFixed(1)} ${c.toFixed(1)}"/></svg>`;
}
function homeHTML() {
  const { p, pct } = readiness();
  const st = todayStatus();
  const left = daysLeft();
  const m = lastMock();
  const mockDays = m ? Math.floor((Date.now() - m.ts) / 864e5) : null;
  const lkp = Math.round(p.lk / 120 * 100), lsp = Math.round(p.ls / 60 * 100);
  const PL = passLine();
  const pass90 = Math.min(100, PL / 180 * 100), tg = Math.min(100, S.target / 180 * 100), me = Math.min(100, p.total / 180 * 100);
  const weak = weakTags(3);
  const happy = st.done;
  const greet = happy ? '오늘 공부 끝! 최고야 🌟' : st.D.n ? `벌써 ${st.D.n}문제 풀었어! 조금만 더` : pick(['오늘도 조금씩, 합격까지 가 보자', '매일 하면 무조건 늘어요!', '오늘 할 거 같이 해치우자!']);
  let alert = '';
  const pz = mockPausedInfo(), due = mockDueDays();
  if (pz) alert = `<div class="alert"><span class="e">⏸</span><div class="sp"><div class="h3">멈춘 모의고사가 있어요</div><div class="sub">${esc(pz.txt)}</div></div><button class="btn sm" onclick="mockResume()">이어서</button></div>`;
  else if (stage() === 'kana') alert = `<div class="alert" style="background:#FBEFCB"><span class="e">🔤</span><div class="sp"><div class="h3">가나를 먼저 익혀요</div><div class="sub">가나를 다 익히면 ${lastMock(5) ? 'N5 단어·문법이 본격적으로 시작돼요' : 'N5 진단 모의고사로 출발점을 기록할게요'}. 독해·청해는 기초가 쌓인 뒤에 쉬운 것부터 나와요.</div></div></div>`;
  else if (!lastMock(stageLv())) alert = `<div class="card result" style="background:#FBEFCB"><div class="t">📍 ${m ? `N${stageLv()} 기준 출발점 기록하기` : '먼저 실력 진단 모의고사!'}</div><div class="sub">${stageLv() === 5 ? 'N5 수준(가장 쉬운 급) 모의고사로 지금 실력을 재요.' : 'N4 모의고사로 지금 실력을 재요.'} 이 점수가 성장 그래프의 출발점이 돼요. 모르는 문제는 '모르겠어요'를 누르면 돼요.</div><div class="acts"><button class="btn full" onclick="mockIntro('quick${stageLv() === 5 ? '5' : ''}',true)">N${stageLv()} 진단 모의고사 보기 ▶</button></div></div>`;
  else if (due >= 0) alert = `<div class="alert"><span class="e">🗓️</span><div class="sp"><div class="h3">${due === 0 ? '오늘은 정기 모의고사 날!' : `정기 모의고사가 ${due}일 밀렸어요`}</div><div class="sub">마지막 모의고사 후 ${mockDays}일 · 실력 변화를 확인해요</div></div><button class="btn sm" onclick="mockMenu()">보기</button></div>`;
  if (!hasJa()) alert += `<div class="alert" style="background:#E3ECF8"><span class="e">🔈</span><div class="sp"><div class="h3">일본어 음성이 없어요</div><div class="sub">청해를 하려면 일본어 음성을 설치해 주세요</div></div><button class="btn sm w" onclick="voiceGuide()">방법</button></div>`;
  return `<div class="top"><span class="ttl" style="font-size:30px;color:#F2D07A">공!부!해!</span><span class="tag p" style="font-family:var(--fe);font-weight:700">N4</span><span class="sp"></span><span class="pill">🔥 <b>${S.streak || 0}</b>일</span></div>
  <div class="stack">
  <div class="hello"><div class="me mon">${creature(S.avatar, {})}</div><div><div class="hi">${esc(S.name || '나')}, ${greet}</div><div class="dday" style="margin-top:6px"><span class="d">D${left >= 0 ? '-' + left : '+' + (-left)}</span><span class="small">${esc(S.exam.replace(/-/g, '.'))} 시험</span></div></div></div>
  ${alert}
  ${stageCardHTML()}
  <div class="card"><div class="row"><div class="h2">🎯 N${S.examLv} 합격까지</div><span class="sp"></span><button class="chip" onclick="targetEdit()">목표 ${S.target}점 ✎</button></div>
    <div class="gauge">${gaugeSVG(pct)}<div class="mid"><div class="pct">${pct}<small>%</small></div><div class="lbl">목표 달성도</div></div></div>
    <div style="text-align:center;font-size:18px;margin-top:-6px">${!hasData() ? '아직 측정 전이에요 · 진단 모의고사를 보면 계산돼요' : pct >= 100 ? '🎉 목표 점수 도달! 유지만 하면 돼요' : `목표까지 <b class="num" style="font-size:24px">${100 - pct}%</b> 남았어요 <span class="small">(${Math.max(0, S.target - p.total)}점)</span>`}</div>
    <div class="scoreline"><div class="track"></div><div class="fill" style="width:${me}%"></div><div class="mk" style="left:${pass90}%"><span>합격선 ${PL}</span></div><div class="mk t" style="left:${tg}%"><span>목표 ${S.target}</span></div><div class="me" style="left:${me}%">${p.total}</div></div>
    <div class="small" style="text-align:center;margin-top:14px">예상 점수 <b class="num" style="color:var(--ink);font-size:16px">${p.total}</b> / 180 ${p.sure ? '' : '· 문제를 더 풀면 정확해져요'}<br>(다 찍으면 약 ${CHANCE}점 → 0%, 목표 ${S.target}점 → 100%)</div>
    <div class="secs"><div class="sec"><div class="t">언어지식·독해</div><b>${p.lk}<small>/120</small></b><div class="bar"><i style="width:${lkp}%"></i></div><div class="ok" style="color:${p.lk >= 38 ? 'var(--ok)' : 'var(--no)'}">기준점 38 ${p.lk >= 38 ? '통과 ✓' : '미달'}</div></div>
      <div class="sec"><div class="t">청해</div><b>${p.ls}<small>/60</small></b><div class="bar k"><i style="width:${lsp}%"></i></div><div class="ok" style="color:${p.ls >= 19 ? 'var(--ok)' : 'var(--no)'}">기준점 19 ${p.ls >= 19 ? '통과 ✓' : '미달'}</div></div></div>
    <div class="trow" style="margin-top:10px">${AREAS.map(a => `<span>${AREA_KO[a]}</span><div class="bar ${a === 'choukai' ? 'k' : a === 'dokkai' ? 'm' : a === 'bunpou' ? 'l' : ''}"><i style="width:${Math.round(p.e[a] * 100)}%"></i></div><b>${Math.round(p.e[a] * 100)}%</b>`).join('')}</div>
    <div class="sub" style="margin-top:8px">💡 ${esc(nextAdvice(p))}</div>
  </div>
  <div class="plan"><div class="row"><div class="h2">📅 오늘의 학습</div><span class="sp"></span>${st.done ? '<span class="tag m">완료 ✓</span>' : ''}</div>
    <div class="row2">${st.L.kana ? `<div class="bx"><b>${st.L.kana}</b><span>가나</span></div>` : ''}<div class="bx"><b>${st.L.v}</b><span>새 단어</span></div><div class="bx"><b>${st.L.g}</b><span>새 문법</span></div><div class="bx"><b>${st.L.rev}</b><span>복습</span></div><div class="bx"><b>${rlOpen() ? st.L.r + st.L.l : '🔒'}</b><span>독해·청해</span></div></div>
    ${needKana() ? `<div class="small" style="margin-bottom:8px">🔤 가나 집중 기간 (완성도 ${Math.round(kanaMastery() * 100)}%) · 85%가 되면 단어·문법이 원래 양으로 늘어나요</div>` : ''}
    ${st.done ? '' : `<div class="small" style="margin-bottom:8px">남은 양: 약 ${st.rounds}라운드 (1라운드 ≈ 10분)</div>`}
    <button class="btn full" onclick="startToday()">${st.done ? '더 공부하기 ▶' : st.D.n ? '다음 라운드 ▶' : '오늘의 학습 시작 ▶'}</button>
    <div class="acts" style="margin-top:8px"><button class="btn sm w" onclick="startWrong()">📒 오답 노트 ${wrongKeys().length}</button><button class="btn sm w" onclick="tab('quiz')">🧩 유형별 연습</button></div></div>
  ${weak.length ? `<div class="card"><div class="h2">🧠 자주 틀리는 개념</div><div class="sub">눌러서 설명을 보고 바로 연습해요</div><div class="weak">${weak.map(w => `<button onclick="openConcept('${esc(w.t)}')"><span class="n">${esc(w.name)}</span><span class="c">✕${w.w}</span><span>›</span></button>`).join('')}</div></div>` : ''}
  ${S.mocks.length ? (() => { const lv = mLv(lastMock()), ms = S.mocks.filter(x => mLv(x) === lv), b = ms.find(x => x.base) || ms[0], l = ms[ms.length - 1]; return `<div class="card" onclick="CHART_LV=${lv};tab('mock')"><div class="row"><div class="h2">📈 N${lv} 모의고사 점수 변화</div><span class="sp"></span><span class="small">${ms.length}회 ›</span></div>${l !== b ? `<div class="small" style="margin-top:4px">📍 출발점 ${b.total}점 → 지금 <b>${l.total}점</b> (${l.total - b.total >= 0 ? '+' : ''}${l.total - b.total})</div>` : `<div class="small" style="margin-top:4px">📍 출발점 ${b.total}점 · 다음 정기 모의고사 ${nextMockDate() ? fmtMD(nextMockDate()) : ''}</div>`}<div class="chartbox" style="margin-top:6px">${mockChart(true, 'total', lv)}</div></div>`; })() : ''}
  <div class="stat2"><div class="mini2"><b>${mastered(VOC)}<small>/${VOC.length}</small></b><div>외운 단어</div></div><div class="mini2"><b>${mastered(GRAM)}<small>/${GRAM.length}</small></b><div>익힌 문법</div></div></div>
  </div>`;
}
function nextAdvice(p) {
  const e = p.e;
  const low = AREAS.slice().sort((a, b) => e[a] - e[b])[0];
  if (needKana()) return '먼저 가나를 확실히! 가나를 읽을 수 있어야 모든 문제가 풀려요.';
  if (stage() === 'n5' && !rlOpen()) return '지금은 N5 단어·문법을 쌓는 시기예요. 기초가 쌓이면 독해·청해가 쉬운 것부터 열려요.';
  if (!lastMock(S.examLv)) return `N${S.examLv} 모의고사를 한 번 보면 예상 점수가 훨씬 정확해져요.`;
  if (p.ls < 22) return '청해가 기준점(19점) 근처예요. 매일 청해 3문제는 꼭 들어요.';
  if (p.lk < 45) return '언어지식 기준점(38점)을 넉넉히 넘기려면 단어·문법 복습을 빠뜨리지 마세요.';
  const tips = { moji: '단어 복습을 늘려 보세요. 한자 읽기·표기는 장음·촉음 구별이 핵심!', bunpou: '문법이 가장 약해요. 개념 탭에서 틀린 문법을 다시 읽어 보세요.', dokkai: '독해가 약해요. 하루 1지문씩 꾸준히 읽어요.', choukai: '청해가 약해요. 대본을 보면서 한 번 더 듣는 연습이 효과적이에요.' };
  return tips[low];
}
function stageCardHTML() {
  const st = stage(), p5 = n5Prog(), p4 = n4Prog(), pct = (a, b) => Math.round(a / Math.max(1, b) * 100);
  const steps = [['kana', '🔤', '가나'], ['n5', '🐣', 'N5 기초'], ['n4', '🐥', 'N4 실전']];
  const idx = steps.findIndex(x => x[0] === st);
  const bar = (n, t, lab, gate) => `<div class="trow"><span>${lab}</span><div class="bar"><i style="width:${pct(n, t)}%"></i></div><b>${n}/${t}</b></div>${gate ? `<div class="small" style="margin:-2px 0 4px;text-align:right">${gate}</div>` : ''}`;
  let body = '';
  if (st === 'kana') body = `<div class="trow"><span>가나</span><div class="bar"><i style="width:${Math.round(kanaMastery() * 100)}%"></i></div><b>${Math.round(kanaMastery() * 100)}%</b></div><div class="sub">가나 85%가 되면 N5 단어·문법이 본격적으로 시작돼요.</div>`;
  else if (st === 'n5') {
    const g5 = Math.ceil(N4_GATE * p5.vt), gg = Math.ceil(N4_GATE * p5.gt);
    body = bar(p5.vn, p5.vt, 'N5 단어', '') + bar(p5.gn, p5.gt, 'N5 문법', '') +
      `<div class="sub">${rlOpen() ? '📖🎧 독해·청해가 열렸어요 (쉬운 것부터 하루 조금씩)' : `🔒 독해·청해는 N5 단어 ${Math.ceil(RL_GATE * p5.vt)}개 · 문법 ${Math.ceil(RL_GATE * p5.gt)}개를 익히면 쉬운 것부터 시작해요`}<br>🐥 N5 단어 ${g5}개 · 문법 ${gg}개를 익히면 N4 단계로 넘어가요</div>`;
  } else body = bar(p4.vn, p4.vt, 'N4 단어', '') + bar(p4.gn, p4.gt, 'N4 문법', '') + `<div class="sub">N5를 지나 N4 단어·문법과 실전 독해·청해를 해요.</div>`;
  return `<div class="card"><div class="row"><div class="h2">🪜 학습 단계</div><span class="sp"></span><span class="tag">${idx + 1}단계 · ${STAGE_KO[st]}</span></div>
  <div class="row" style="gap:6px;margin:10px 0 8px">${steps.map((x, i) => `<span class="tag ${i === idx ? 'p' : i < idx ? 'm' : ''}" style="flex:1;text-align:center">${i < idx ? '✓' : x[1]} ${x[2]}</span>`).join('')}</div>${body}</div>`;
}
function targetEdit() {
  const PL = passLine(), ops = S.examLv === 5 ? [85, 90, 100, 110, 120, 130, 140] : [95, 100, 110, 120, 130, 140, 150];
  modal(`<div class="mt">🎯 N${S.examLv} 목표 점수</div><div class="md">합격선은 ${PL}점이에요. '안정 합격'을 원하면 ${PL + 20}~${PL + 30}점을 추천해요.</div>
  <div class="chips" style="justify-content:center;margin-top:12px">${ops.map(t => `<button class="chip ${S.target === t ? 'on' : ''}" onclick="S.target=${t};save();closeModal();render()">${t}점</button>`).join('')}</div>`);
}
function weakTags(n) {
  return Object.entries(S.tg).map(([t, g]) => ({ t, w: g.w, c: g.c, score: g.w - g.c * .5 - Math.max(0, today() - g.last) * .05 }))
    .filter(x => x.w >= 2 && x.score > .5 && tagName(x.t)).sort((a, b) => b.score - a.score).slice(0, n).map(x => Object.assign(x, { name: tagName(x.t) }));
}
function tagName(t) {
  const [a, b] = [t.slice(0, t.indexOf(':')), t.slice(t.indexOf(':') + 1)];
  if (t === 'cnt') return '조수사·날짜 읽기';
  if (t === 'hyouki') return '비슷한 한자 구별 (표기)';
  if (a === 'g') return GBY[b] ? GBY[b].p + ' — ' + GBY[b].m : null;
  if (a === 'kana') return '가나 규칙: ' + (KANA_TAG[b] || b);
  if (a === 'type') return '문제 유형: ' + ((TYPE[b] || {}).ko || b) + ' 공략';
  if (a === 'cat') return '단어: ' + ((CATS[b] || {}).name || b);
  if (a === 'conj') return '동사 활용: ' + ((DRILL_FORMS[b] || {}).ko || b);
  return null;
}
function voiceGuide() {
  modal(`<div class="mt">🔈 일본어 음성 설치</div><div class="md" style="text-align:left">1. 휴대폰 <b>설정</b> → <b>일반</b>(또는 시스템) → <b>언어 및 입력</b><br>2. <b>텍스트 음성 변환(TTS)</b> → 기본 엔진을 <b>Google 음성 엔진</b>으로<br>3. 엔진 옆 ⚙️ → <b>음성 데이터 설치</b> → <b>일본어</b> 다운로드<br>4. 앱을 껐다 켜면 끝!<br><br>삼성은 '삼성 TTS'에서도 일본어를 받을 수 있어요.</div>
  <div class="acts"><button class="btn w" onclick="TTS.say('こんにちは。日本語の勉強をがんばりましょう。')">🔊 테스트</button><button class="btn" onclick="closeModal()">확인</button></div>`);
}

/* ---------- 화면: 문제 탭 ---------- */
function quizTabHTML() {
  const due = dueKeys().length, wr = wrongKeys().length;
  return `<div class="top"><div class="h2">🧩 유형별 연습</div></div>
  <div class="stack">
  <div class="card"><div class="row"><div class="sp"><div class="h3">📒 오답 노트</div><div class="sub">틀린 문제 ${wr}개 · 복습할 것 ${due}개</div></div><button class="btn sm p" onclick="startWrong()">풀기</button></div>
  <div class="acts"><button class="btn sm w" onclick="startSession(dueKeys().slice(0,40).map(k=>({kind:'item',key:k})),{exam:true})">🔁 복습만 하기</button><button class="btn sm w" onclick="startMix()">🎲 실전 섞어 풀기</button></div></div>
  ${PRACTICE.map(g => `<div class="grp"><div class="gt">${g.g}</div><div class="tiles">${g.items.map(([t, ko, jp]) => `<button class="tile" onclick="startPractice('${t}')"><span class="nm">${ko}</span><span class="jn">${jp}</span><span class="st">${t.startsWith('kana') ? '완성도 ' + Math.round(kanaPart(t === 'kana_k') * 100) + '%' : practiceStats(t === 'kana_h' ? 'kana' : t)}</span></button>`).join('')}</div></div>`).join('')}
  </div>`;
}
function kanaPart(kata) { const keys = KANA_ALL.map(x => 'kana:' + (kata ? 'k' : 'h') + x[0]); return keys.filter(k => (S.kana[k] || 0) >= 2).length / keys.length; }
function startMix() {
  const st = [];
  ['yomi', 'hyouki', 'bunmyaku', 'gram', 'gram', 'star', 'para', 'usage'].forEach(t => practiceSteps(t, 3).forEach(s => st.push(s)));
  startSession(shuffle(st).slice(0, 20), { exam: true });
}

/* ---------- 라우터 ---------- */
let TAB = 'home', VIEW = null, STACK = [];
function go(name, params) { if (VIEW) STACK.push(VIEW); VIEW = Object.assign({ name }, params || {}); render(); window.scrollTo(0, 0); }
function back() { TTS.stop(); VIEW = STACK.pop() || null; render(); }
function tab(t) { TTS.stop(); TAB = t; VIEW = null; STACK = []; SES = null; render(); window.scrollTo(0, 0); }
function render(keepScroll) {
  const y = window.scrollY;
  let h = '';
  if (!S.setupDone) h = setupHTML();
  else if (VIEW) {
    switch (VIEW.name) {
      case 'session': h = sessionHTML(); break;
      case 'mock': h = mockHTML(); break;
      case 'mockResult': h = mockResultHTML(VIEW.idx); break;
      case 'concept': h = conceptPageHTML(VIEW.id); break;
      case 'vocabList': h = vocabListHTML(VIEW.cat); break;
      case 'settings': h = settingsHTML(); break;
      case 'avatar': h = avatarPageHTML(); break;
      default: h = homeHTML();
    }
  } else {
    h = { home: homeHTML, quiz: quizTabHTML, mock: mockTabHTML, concept: conceptTabHTML, me: meTabHTML }[TAB]();
  }
  const showTabs = S.setupDone && (!VIEW || !['session', 'mock'].includes(VIEW.name));
  if (showTabs) {
    const T = [['home', '🏠', '홈'], ['quiz', '🧩', '문제'], ['mock', '📝', '모의고사'], ['concept', '📘', '개념'], ['me', '🐣', '나']];
    const due = dueKeys().length;
    h += `<nav class="tabs">${T.map(([k, ic, n]) => `<button class="${TAB === k && !VIEW ? 'on' : ''}" onclick="tab('${k}')"><span class="ic">${ic}</span>${n}${k === 'quiz' && wrongKeys().length ? `<span class="dot">${Math.min(99, wrongKeys().length)}</span>` : ''}</button>`).join('')}</nav>`;
  }
  app().innerHTML = h;
  markJa(app());
  if (keepScroll) window.scrollTo(0, y);
}
window.appBack = () => {
  if (MODAL) { closeModal(); return true; }
  if (VIEW) {
    if (VIEW.name === 'session') { quitSession(); return true; }
    if (VIEW.name === 'mock') { mockQuit(); return true; }
    back(); return true;
  }
  if (!S.setupDone && SETUP.step > 0) { SETUP.step--; render(); return true; }
  if (TAB !== 'home') { tab('home'); return true; }
  return false;
};
/* ---------- 알림 (매일 공부 · 정기 모의고사) ---------- */
function syncReminders() {
  if (!S) return;
  try {
    if (HAS && Android.setReminders) Android.setReminders(JSON.stringify({
      dailyOn: !!(S.setupDone && S.set.notiDaily), dailyTime: S.set.dailyTime || '21:00',
      mockOn: !!(S.setupDone && S.set.notiMock), mockDay: S.mocks.length ? mockDayOf() : -1, mockTime: S.set.mockTime || '20:00',
      exam: S.exam, name: S.name || '',
    }));
  } catch (e) { }
}
function askNotify() { try { if (HAS && Android.askNotify) Android.askNotify(); } catch (e) { } }
function notifyOK() { try { if (HAS && Android.notifyAllowed) return !!Android.notifyAllowed(); } catch (e) { } return true; }
window.__open = where => {
  if (!S || !S.setupDone) return;
  if (VIEW && ['mock', 'session'].includes(VIEW.name)) return; // 푸는 중이면 그대로
  if (where === 'mock') { if (mockPausedInfo()) mockResume(); else tab('mock'); }
  else tab('home');
};
function boot() {
  S = loadState(); prep();
  if (window.speechSynthesis) try { speechSynthesis.onvoiceschanged = () => { JA_VOICE = null; jaVoice(); }; } catch (e) { }
  snapPred(); save();
  render();
  syncReminders();
  // 진단 모의고사를 아직 안 봤으면 앱을 열 때마다 먼저 보여 줘요 (가나 단계는 가나부터)
  if (S.setupDone && !S.mocks.length && !mockPausedInfo() && stage() !== 'kana') mockIntro(stageLv() === 5 ? 'quick5' : 'quick', true);
}
