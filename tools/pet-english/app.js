const APPNAME = '쓰담쓰담 영어', UPD = { url: 'https://oneulgongbu-6nu.pages.dev/pet/version.json', page: 'https://oneulgongbu-6nu.pages.dev/pet/' };
let NEWV = 0, devN = 0;
const LS = 'petstudy.v1', app = document.getElementById('app'), $ = id => document.getElementById(id);
let S = null, view = 'home', RUN = 0, ac = null, master = null, noiseBuf = null, voices = [];
try { S = JSON.parse(localStorage.getItem(LS)); } catch (e) { S = null; }
const save = () => { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const jo = (n, a, b) => { const c = n.charCodeAt(n.length - 1); return n + (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? a : b); };
const clean = v => String(v || '').replace(/[<>&"'`]/g, '').trim().slice(0, 8);
const KDEF = ['첫째', '둘째', '셋째'], kname = kid => kid.name || KDEF[S.kids.indexOf(kid)] || '아이';
const rnd = a => a[Math.floor(Math.random() * a.length)];
const today = () => { const d = new Date(Date.now() + ((S && S.off) || 0) * 864e5); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

const newKid = (pet, name) => ({ name: name || '', pet, inv: {}, wear: {}, newAcc: [], care: null, giftBox: false, giftGiven: false, day: '', done: 0, idx: 0, days: 0, st: {} });
function migrate() { if (!S || S.kids || !S.pet) return; const k = newKid(S.pet); ['inv', 'wear', 'newAcc', 'care', 'giftBox', 'giftGiven'].forEach(f => { if (S[f] != null) k[f] = S[f]; });
  S = { v: 2, mode: 'solo', per: S.per || 1, ns: 6, kids: [k], cur: 0, day: S.day || '', done: S.done || 0, idx: S.idx || 0, days: S.days || 0, st: {}, off: S.off || 0, lagAdj: S.lagAdj || 0, dev: S.dev }; save(); }

const fixNs = () => { if (S && S.kids && ![3, 6, 9].includes(S.ns)) { S.ns = S.ns <= 3 ? 3 : 6; delete S.nw; save(); } };
const PG = () => S.mode === 'separate' ? S.kids[S.cur] : S;
const shown = () => S.mode === 'separate' ? [S.kids[S.cur]] : S.kids;
function rollDay() { if (!S || !S.kids) return; const t = today(); let ch = false;
  if (S.mode === 'separate') S.kids.forEach(k => { if (k.day !== t) { k.day = t; k.done = 0; k.extra = 0; k.t1 = 0; k.giftGiven = false; k.care = null; ch = true; } });
  else if (S.day !== t) { S.day = t; S.done = 0; S.extra = 0; S.t1 = 0; S.kids.forEach(k => { k.giftGiven = false; k.care = null; }); ch = true; }
  if (ch) save(); }
const HEART = `<svg viewBox="0 0 40 36"><path d="M20 33 C2 20 2 4 12 4 C17 4 20 9 20 9 C20 9 23 4 28 4 C38 4 38 20 20 33 Z" fill="#FF7B9C" stroke="#4A3F3A" stroke-width="3" stroke-linejoin="round"/></svg>`;
const STAR = `<svg viewBox="-50 -50 100 100"><path d="M0 -44 L12 -14 L44 -12 L19 8 L28 40 L0 22 L-28 40 L-19 8 L-44 -12 L-12 -14 Z" fill="#FFD84D" stroke="#4A3F3A" stroke-width="6" stroke-linejoin="round"/></svg>`;
const CLAP = `<svg viewBox="0 0 40 40"><path d="M10 30 L6 18 Q5 13 9 13 L14 24 L12 8 Q13 4 17 6 L20 20 L21 6 Q23 2 26 5 L27 21 L30 10 Q33 7 35 11 L33 28 Q30 37 20 37 Q13 37 10 30 Z" fill="#FFD9B8" stroke="#4A3F3A" stroke-width="2.6" stroke-linejoin="round"/></svg>`;
const MOUTH = `<svg viewBox="0 0 40 40"><path d="M6 14 Q20 6 34 14 Q30 34 20 34 Q10 34 6 14 Z" fill="#E8607A" stroke="#4A3F3A" stroke-width="3" stroke-linejoin="round"/><path d="M12 15 Q20 11 28 15 L27 19 Q20 16 13 19 Z" fill="#fff"/></svg>`;
const HAND = `<svg viewBox="0 0 60 60"><path d="M14 40 L8 26 Q7 20 12 20 L20 34 L17 12 Q18 7 23 9 L28 28 L29 9 Q31 4 35 8 L37 29 L41 15 Q45 11 47 16 L45 40 Q41 54 28 54 Q18 54 14 40 Z" fill="#FFD9B8" stroke="#4A3F3A" stroke-width="3.5" stroke-linejoin="round"/></svg>`;
const PITCH = `<svg viewBox="-50 -50 100 100"><path d="M-22 -30 L22 -30 L18 34 L-18 34 Z" fill="#BFE6FA" stroke="#4A3F3A" stroke-width="4" stroke-linejoin="round"/><path d="M22 -18 Q42 -16 40 4 Q38 18 20 16" fill="none" stroke="#4A3F3A" stroke-width="4"/><path d="M-22 -30 L-34 -36 L-24 -20 Z" fill="#BFE6FA" stroke="#4A3F3A" stroke-width="4" stroke-linejoin="round"/><path d="M-19 -6 L19 -6 L18 34 L-18 34 Z" fill="#7CC6F7"/></svg>`;

function pickVoices() { if ('speechSynthesis' in window) voices = speechSynthesis.getVoices(); }
if ('speechSynthesis' in window) { pickVoices(); speechSynthesis.onvoiceschanged = pickVoices; }
let ttsLag = 180;
const NATIVE = !!(window.Android && window.Android.speakTo);
let ttsN = 0; const ttsWait = {};
window.__ttsDone = id => { const w = ttsWait[id]; if (w) { delete ttsWait[id]; w.res(); } };
window.__ttsStart = id => { const w = ttsWait[id]; if (w && w.en) { const d = performance.now() - w.t0; if (d < 1200) ttsLag = ttsLag * .5 + d * .5; } };
function speak(text, lang = 'en', rate) {
  if (NATIVE) return new Promise(res => { const id = 't' + (++ttsN); let done = false; const fin = () => { if (!done) { done = true; res(); } };
    ttsWait[id] = { res: fin, t0: performance.now(), en: lang === 'en' }; setTimeout(() => { delete ttsWait[id]; fin(); }, 1200 + text.length * 260);
    try { Android.speakTo(text, lang === 'ko' ? 'ko' : 'en', lang === 'ko' ? 1.25 : 1.15, rate || (lang === 'ko' ? 1 : .82), id); } catch (e) { fin(); } });
  return new Promise(res => {
    if (!('speechSynthesis' in window)) return setTimeout(res, 600);
    const u = new SpeechSynthesisUtterance(text), L = lang === 'ko' ? 'ko-KR' : 'en-US';
    u.lang = L; const v = voices.filter(x => x.lang && x.lang.replace('_', '-').startsWith(L.slice(0, 2)));
    const pv = v.find(x => x.lang.replace('_', '-') === L && /Google|Female|Samantha|Yuna/i.test(x.name)) || v.find(x => x.lang.replace('_', '-') === L) || v[0]; if (pv) u.voice = pv;
    u.rate = rate || (lang === 'ko' ? 1 : .82); u.pitch = 1.12;
    const idle = !speechSynthesis.speaking && !speechSynthesis.pending, t0 = performance.now();
    u.onstart = () => { const d = performance.now() - t0; if (idle && lang === 'en' && d < 1200) ttsLag = ttsLag * .5 + d * .5; };
    let done = false; const fin = () => { if (!done) { done = true; res(); } };
    u.onend = fin; u.onerror = fin; setTimeout(fin, 900 + text.length * 260); speechSynthesis.speak(u);
  });
}

const VO = {}, VOP = {}; let voOrder = [], voSrc = [];
const VOV = '__VOV__';
const fnv = t => { let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const vslug = t => /[가-힣]/.test(t) ? 'k_' + fnv(String(t)) : String(t).toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + (/\?\s*$/.test(t) ? '_q' : '');
function voLoad(text) {
  const k = vslug(text); if (VOP[k]) return VOP[k];
  return VOP[k] = (async () => { try {
    audio(); if (!ac) return null; let ab;
    if (NATIVE) { if (!Android.voice) return null; const b = Android.voice(k); if (!b) return null; const bin = atob(b), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); ab = u.buffer; }
    else { if (location.protocol === 'file:') return null; const r = await fetch('voice/' + k + '.mp3?v=' + VOV);
      if (!r.ok) return null; ab = await r.arrayBuffer(); }
    const buf = await new Promise((res, rej) => ac.decodeAudioData(ab, res, rej)), d = buf.getChannelData(0), sr = buf.sampleRate, W = Math.max(1, Math.round(sr * .008));

    const env = []; let mx = 0; for (let i = 0; i < d.length; i += W) { let e = 0; const n = Math.min(W, d.length - i); for (let j = 0; j < n; j++) e += d[i + j] * d[i + j]; e = Math.sqrt(e / n); env.push(e); if (e > mx) mx = e; }
    if (!mx) return null; let a = 0; while (a < env.length && env[a] < mx * .06) a++; let z = env.length - 1; while (z > a && env[z] < mx * .05) z--; let p = a; while (p < env.length && env[p] < mx * .42) p++;
    const v = VO[k] = { buf, on: Math.max(0, a * W / sr - .008), pc: Math.min(p * W / sr, a * W / sr + .22), end: Math.min(buf.duration, (z + 1) * W / sr + .03) };
    voOrder = voOrder.filter(x => x !== k); voOrder.push(k); while (voOrder.length > 70) { const o = voOrder.shift(); delete VO[o]; delete VOP[o]; }
    return v;
  } catch (e) { return null; } })();
}
const voReady = (texts, ms = 2500) => Promise.race([Promise.all(texts.map(voLoad)), sleep(ms)]);

function voAt(text, t, beat) {
  const v = VO[vslug(text)]; if (!v || !ac) return 0; const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = v.buf; g.gain.value = 1.9; s.connect(g); g.connect(master);
  const st = Math.max(ac.currentTime + .005, t - (beat ? v.pc : v.on)); s.start(st); voSrc.push(s); s.onended = () => { voSrc = voSrc.filter(x => x !== s); }; return st + v.end;
}

let koCur = null, koTok = 0;
async function koSay(text, alt) {
  const tok = ++koTok; if (koCur) { try { koCur.stop(); } catch (e) {} koCur = null; }
  for (const t of [text, alt]) { if (!t) continue; const v = await voLoad(t); if (tok !== koTok) return; if (!v) continue;
    const n0 = voSrc.length, end = voAt(t, now() + .03); if (!end) continue; koCur = voSrc[n0] || null; await sleep(Math.max(0, (end - now()) * 1000) + 30); return; }
  return speak(text, 'ko');
}
const named = n => PET_NAMES.includes(n);

async function sayEn(text, rate) { const my = RUN; await voLoad(text); if (my !== RUN) return; const end = voAt(text, now() + .04); if (!end) return speak(text, 'en', rate); await sleep(Math.max(0, (end - now()) * 1000) + 30); }

const sayLead = () => Math.max(0, Math.min(.9, (ttsLag + 70 + ((S && S.lagAdj) || 0)) / 1000 - (ac ? (ac.outputLatency || ac.baseLatency || 0) : 0)));
const hush = () => { voSrc.forEach(s => { try { s.stop(); } catch (e) {} }); voSrc = []; if (NATIVE) { try { Android.stopSpeak(); } catch (e) {} for (const k in ttsWait) window.__ttsDone(k); } else if ('speechSynthesis' in window) speechSynthesis.cancel(); };
function audio() {
  bgmUnlock();
  if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = ac.createGain(); master.gain.value = .5; master.connect(ac.destination);
  noiseBuf = ac.createBuffer(1, Math.floor(ac.sampleRate * .3), ac.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
}
const env = (g, t, v, d) => { g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0008, t + d); };
function noise(t, type, f, v, d, q) { if (!ac) return; const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = noiseBuf; fl.type = type; fl.frequency.value = f; if (q) fl.Q.value = q; env(g, t, v, d); s.connect(fl).connect(g).connect(master); s.start(t); s.stop(t + d + .05); }
function tone(t, f, type, v, d, f2) { if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d * .6); env(g, t, v, d); o.connect(g).connect(master); o.start(t); o.stop(t + d + .05); }
const clap = t => [0, .011, .023].forEach((o, i) => noise(t + o, 'bandpass', 1250, i < 2 ? .55 : .9, i < 2 ? .03 : .16, 1.2));
const kick = (t, v = .7) => tone(t, 140, 'sine', v, .26, 48);
const hat = (t, v = .12) => noise(t, 'highpass', 7500, v, .035);
const now = () => ac ? ac.currentTime : 0;
function sfx(name) {
  audio(); if (!ac) return; const t = now() + .01;
  if (name === 'pop') tone(t, 520, 'sine', .35, .12, 900);
  if (name === 'ok') [660, 880, 1320].forEach((f, i) => tone(t + i * .09, f, 'triangle', .28, .25));
  if (name === 'yum') [0, .18, .36].forEach(o => noise(t + o, 'bandpass', 900, .5, .07, 2));
  if (name === 'water') [0, .1, .2, .3, .4, .5].forEach((o, i) => tone(t + o, 700 + i * 90, 'sine', .2, .09, 1100 + i * 90));
  if (name === 'tweet') [0, .12, .3].forEach((o, i) => tone(t + o, 2200 + i * 300, 'sine', .12, .09, 3000));
  if (name === 'stamp') { tone(t, 120, 'sine', .7, .3, 45); noise(t, 'lowpass', 500, .5, .12); }
  if (name === 'hop') tone(t, 300, 'sine', .3, .18, 620);
  if (name === 'boing') [0, .5, 1, 1.5].forEach(o => tone(t + o, 300, 'sine', .3, .18, 620));
  if (name === 'purr') [0, .12, .24, .36].forEach(o => tone(t + o, 880, 'sine', .14, .1, 1180));
  if (name === 'fanfare') [523, 659, 784, 1047, 1319].forEach((f, i) => tone(t + i * .11, f, 'triangle', .3, .4));
  if (name === 'merge') [392, 523, 659, 784, 1047, 1568].forEach((f, i) => tone(t + i * .07, f, 'sine', .28, .5));
}

const BGM = { sent: ['riley', .3], home: ['star', .36] }, bgmEl = {}; let bgmNow = '';
const bgmOn = () => !!S && S.bgm !== 0;
const bgmWant = () => !bgmOn() || document.hidden ? '' : view === 'sent' ? 'sent' : view === 'home' && $('room') ? 'home' : '';
function bgmGet(k) { if (!bgmEl[k]) { const a = new Audio(); a.loop = true; a.preload = 'auto'; a.addEventListener('error', () => { a.__bad = 1; }); a.src = 'bgm/' + BGM[k][0] + '.mp3'; bgmEl[k] = a; } return bgmEl[k]; }
function bgmFade(a, v, ms, done) { clearInterval(a.__f); const v0 = a.volume, t0 = Date.now(); a.__f = setInterval(() => { const r = Math.min(1, (Date.now() - t0) / ms); try { a.volume = Math.max(0, Math.min(1, v0 + (v - v0) * r)); } catch (e) {} if (r >= 1) { clearInterval(a.__f); if (done) done(); } }, 50); }

function bgmUnlock() { if (!bgmOn()) return; for (const k in BGM) { const a = bgmGet(k); if (a.__ok || a.__bad || a.__try || k === bgmNow) continue; a.__try = 1; a.muted = true;
  let p; try { p = a.play(); } catch (e) {} if (p && p.then) p.then(() => { a.__ok = 1; a.__try = 0; if (bgmNow !== k) { a.pause(); try { a.currentTime = 0; } catch (e) {} } a.muted = false; }).catch(() => { a.__try = 0; a.muted = false; }); else { a.__try = 0; a.muted = false; } } }
function bgmSync() { const k = bgmWant(); if (k === bgmNow) return; const old = bgmNow && bgmEl[bgmNow]; bgmNow = k;
  if (old) bgmFade(old, 0, 500, () => { if (bgmEl[bgmNow] !== old) old.pause(); });
  if (!k) return; const a = bgmGet(k); if (a.__bad) return; a.muted = false; try { a.volume = 0; a.currentTime = 0; } catch (e) {}
  let p; try { p = a.play(); } catch (e) {} if (p && p.catch) p.catch(() => { if (bgmNow === k) bgmNow = ''; }); bgmFade(a, BGM[k][1], 1600); }
setInterval(bgmSync, 300);
function bgStop() {}

let SU = null;
const ORD = ['첫 번째', '두 번째', '세 번째'];

const cardN = ns => ns / 3 * 4;
const secs = (ns, o) => Math.round(cardN(ns) * (2.95 * tf() + 1.9 + 480 / bpm()) + ns * 18 + 9 + (quizOn(o) ? 31 : 0));
const timeKo = (ns, o) => { const h = Math.round(secs(ns, o) / 30), m = Math.floor(h / 2); return '약 ' + (m ? m + '분' : '') + (h % 2 ? ' 30초' : ''); };
const segRow = (label, f, opts, unit, cur, act) => `<div class="arow"><span>${label}</span><div class="seg">${opts.map(n => `<button class="${cur === n ? 'on' : ''}" data-act="${act}" data-f="${f}" data-n="${n}">${n}${unit}</button>`).join('')}</div></div>`;
const nsCards = (o, act) => `<div class="nsrow">${[3, 6, 9].map(n => `<button class="nsc ${o.ns === n ? 'on' : ''}" data-act="${act}" data-f="ns" data-n="${n}"><b>문장 ${n}개</b><span class="t">${timeKo(n, o)}</span><small>낱말 카드 ${cardN(n)}장쯤<br>표현 ${n / 3}가지</small></button>`).join('')}</div>`;
const quizRow = (o, act) => `<div class="arow"><span>퀴즈 <small>이 그림은 뭘까?</small></span><div class="seg"><button class="${quizOn(o) ? 'on' : ''}" data-act="${act}" data-f="quiz" data-n="1">해요</button><button class="${quizOn(o) ? '' : 'on'}" data-act="${act}" data-f="quiz" data-n="0">안 해요</button></div></div>`;
const amtRows = (o, act) => segRow('하루에', 'per', [1, 2], '번', o.per, act) + nsCards(o, act) + quizRow(o, act);
const amtNote = o => `<span class="ln">낱말 카드는 그 문장에 나오는 말을 미리 만나 보는 거예요</span><span class="ln">동물 돌보기 시간은 따로예요</span>${o.per === 2 ? '<b class="gapn ln">두 번째 공부는 첫 공부를 마치고 1시간 뒤부터 열려요</b>' : ''}`;
function setupStart() { view = 'setup'; SU = { n: 1, mode: 'solo', per: 1, ns: 6, quiz: 1, pets: [], kids: [], kn: '', sp: 'dog', vi: 0, name: '', typing: false }; rSetupN(); }
function rSetupN() { app.innerHTML = `<div class="setup"><p>어른이 골라 주세요</p><h1>아이가 몇 명인가요?</h1><div class="picks">${[1, 2, 3].map(n => `<button class="pick num" data-kids="${n}"><b>${n}</b>명</button>`).join('')}</div><p>아이마다 반려동물을 한 마리씩 키워요</p></div>`; }
const MODES = [['together', '공부는 같이, 동물은 각자', '함께 앉아서 할 때', ['한 화면을 보며 같이 따라 말해요', '끝나면 한 방에 동물이 모두 모여요', '간식·쓰다듬기는 각자 자기 동물에게', '선물 상자도 한 마리에 하나씩']], ['separate', '공부도 각자, 동물도 각자', '차례로 할 때', ['시작할 때 누가 할지 골라요', '진도와 도장이 아이마다 따로예요', '방에는 자기 동물만 나와요', '하는 속도가 서로 다를 때 좋아요']]];
function rSetupMode() { app.innerHTML = `<div class="setup"><p>어른이 골라 주세요</p><h1>어떻게 할까요?</h1><div class="plans">${MODES.map(([m, t, tag, li]) => `<button class="plan" data-mode="${m}"><span class="n sm2">${t}</span><span class="tag2">${tag}</span><ul>${li.map(x => `<li>${x}</li>`).join('')}</ul></button>`).join('')}</div><button class="sm" data-act="backN">← 다시 고르기</button></div>`; }
function rSetupAmt() { app.innerHTML = `<div class="setup"><p>어른이 골라 주세요</p><h1>한 번에 얼마나 할까요?</h1><div class="amt">${amtRows(SU, 'su')}</div><p>${amtNote(SU)}<b class="gapn ln">횟수·문장 수·퀴즈·카드 빠르기는</b><b class="gapn ln">나중에 홈 화면 오른쪽 위 ‘관리자 옵션’에서 바꿀 수 있어요</b></p><button class="btn y big" data-act="amtok">다음</button></div>`; }
function rSetupKid() { const i = SU.pets.length; app.innerHTML = `<div class="setup"><p>어른이 적어 주세요</p><h1>${SU.n > 1 ? ORD[i] + ' ' : ''}아이 이름은?</h1><input class="tin" id="kn" maxlength="8" placeholder="예: 하늘" autocomplete="off" enterkeyhint="done" data-ok="kidok"><p>비워 두면 '${SU.n > 1 ? KDEF[i] : '우리 아이'}'로 할게요<br>나중에 옵션에서 바꿀 수 있어요</p><button class="btn y big" data-act="kidok">다음</button></div>`; }
function rSetup2() { app.innerHTML = `<div class="setup"><p>${SU.kn}의 친구</p><h1>누구랑 함께할까?</h1><div class="picks">${['dog', 'cat', 'rabbit'].map(sp => `<button class="pick" data-sp="${sp}">${petSVG(sp, 0)}${PETS[sp].name}</button>`).join('')}</div></div>`; koSay('누구랑 함께할까?'); }
function rSetup3() { app.innerHTML = `<div class="setup"><h1>어떤 ${PETS[SU.sp].name}가 좋아?</h1><div class="picks">${PETS[SU.sp].vars.map((v, i) => `<button class="pick" data-vi="${i}">${petSVG(SU.sp, i)}${v.name}</button>`).join('')}</div><button class="sm" data-act="back2">← 다시 고르기</button></div>`; koSay('어떤 친구가 좋아?'); }
function rSetup4() { if (!SU.name) { const used = SU.pets.map(p => p.name).concat(SU.kids, [SU.kn]); do SU.name = rnd(PET_NAMES); while (used.includes(SU.name)); }
  if (SU.typing) { app.innerHTML = `<div class="setup"><div class="bigpet">${petSVG(SU.sp, SU.vi, 'happy')}</div><h1>이름을 지어 주세요</h1><input class="tin" id="pn" maxlength="8" value="${SU.name}" autocomplete="off" enterkeyhint="done" data-ok="nameok"><div class="row"><button class="btn" data-act="nameno">취소</button><button class="btn y big" data-act="nameok">이 이름으로</button></div></div>`; const i = $('pn'); try { i.focus(); i.select(); } catch (e) {} return; }
  app.innerHTML = `<div class="setup"><div class="bigpet">${petSVG(SU.sp, SU.vi, 'happy')}</div><div class="namecard">안녕! 나는 <b>${SU.name}</b>${jo(SU.name, '이야', '야').slice(SU.name.length)}</div><div class="row"><button class="btn" data-act="rename">다른 이름</button><button class="btn" data-act="namein">직접 정하기</button></div><button class="btn y big" data-act="begin">좋아!</button></div>`;
  named(SU.name) ? koSay('안녕! 나는 ' + jo(SU.name, '이야', '야')) : speak('안녕! 나는 ' + jo(SU.name, '이야', '야'), 'ko'); }

function rWho() { view = 'who'; rollDay(); bgStop();
  app.innerHTML = `<div class="setup"><h1>누가 할까?</h1><div class="picks">${S.kids.map((k, i) => `<button class="pick" data-who="${i}">${petSVG(k.pet.sp, k.pet.vi, !canStudy(k) && !k.care && !k.giftBox ? 'sleep' : 'happy', wearNow(k))}${kname(k)}<small>${k.pet.name} · ${k.care ? '돌봐 줄 차례' : k.giftBox ? '선물이 왔어요' : !canStudy(k) ? '오늘 다 했어요' : waitLeft(k) ? clockKo(Date.now() + waitLeft(k)) + '부터 한 번 더' : k.done ? '한 번 더 남았어요' : '아직 안 했어요'}</small></button>`).join('')}</div><button class="sm ic" data-act="parent">${GEAR}관리자 옵션</button>${updChip()}</div>`; koSay('누가 할까?'); }
const goHub = () => rHub();
const goHome = () => S.mode === 'separate' && S.kids.length > 1 ? rWho() : rHub();

const HOMEIC = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.500 11.500 L12 4 L20.500 11.500 V20 H14.500 V14.500 H9.500 V20 H3.500 Z" fill="currentColor" stroke="currentColor" stroke-width="1.600" stroke-linejoin="round"/></svg>`;
let hubT = 0, hubHello = false;

const inSvg = (svg, x, y, w, h) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${h || w}" `);

const ICONSET = 'wax';
const pawSVG = (c, dog) => `<svg class="paw" viewBox="-37 -42 74 72" aria-hidden="true"><g fill="${c}"><ellipse cx="-23" cy="-8" rx="8.5" ry="11" transform="rotate(-24 -23 -8)"/><ellipse cx="-8.5" cy="-23" rx="8.5" ry="11.5" transform="rotate(-8 -8.5 -23)"/><ellipse cx="8.5" cy="-23" rx="8.5" ry="11.5" transform="rotate(8 8.5 -23)"/><ellipse cx="23" cy="-8" rx="8.5" ry="11" transform="rotate(24 23 -8)"/>${dog ? '<path d="M-31 -22 l2.5 -7 l3 6.5 Z M-11 -38 l2.5 -4 l2.5 4 Z M6 -38 l2.5 -4 l2.5 4 Z M25.5 -22.5 l3 -6.5 l2.5 7 Z"/><path d="M0 -8 C15 -8 25 5 23 17 C21.5 26 11 26 0 26 C-11 26 -21.5 26 -23 17 C-25 5 -15 -8 0 -8 Z"/>' : '<path d="M0 -6 C6 -9 14 -4 19 4 C25 13 21 24 12 24 C7 24 4 21 0 21 C-4 21 -7 24 -12 24 C-21 24 -25 13 -19 4 C-14 -4 -6 -9 0 -6 Z"/>'}</g></svg>`;
const GEAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 2.6h3.4l.5 2.4 1.9.8 2-1.3 2.4 2.4-1.3 2 .8 1.9 2.4.5v3.4l-2.4.5-.8 1.9 1.3 2-2.4 2.4-2-1.3-1.900.8-.5 2.4h-3.4l-.5-2.4-1.900-.8-2 1.3-2.400-2.400 1.300-2-.8-1.900-2.400-.500v-3.400l2.400-.500.8-1.900-1.300-2 2.400-2.400 2 1.300 1.900-.8z" fill="currentColor"/><circle cx="12" cy="12" r="3.400" fill="#fff"/></svg>`;

const roomOpen = () => PG().done > 0 || inCare() || shown().some(k => k.giftBox);

function weekInfo(p) {
  const t = nowD(), st = p.st || {}, key = d => ymd(d.getFullYear(), d.getMonth() + 1, d.getDate()), day = (t.getDay() + 6) % 7, days = [];
  for (let i = 0; i < 7; i++) { const d = new Date(t); d.setDate(t.getDate() - day + i); days.push({ on: st[key(d)] != null, today: i === day, late: i > day }); }
  let streak = 0; const d = new Date(t); if (st[key(d)] == null) d.setDate(d.getDate() - 1); while (st[key(d)] != null) { streak++; d.setDate(d.getDate() - 1); }
  return { days, streak };
}
function rHub() {
  rollDay(); stopAll(); view = 'hub'; clearTimeout(hubT); const p = PG(), kids = shown(), sep = S.mode === 'separate' && S.kids.length > 1, w = waitLeft(p), can = canStudy(p), care = inCare(), gift = kids.some(k => k.giftBox), wm = p.wm || {};
  const met = Object.keys(wm).length, tot = DATA.mus.reduce((n, g) => n + g[1].length, 0), wk = weekInfo(p), sn = (p.ls || []).length;
  const st = !can ? ['오늘 공부 끝!', 'done'] : w > 0 ? [clockKo(Date.now() + w) + '부터 할 수 있어요', 'wait'] : [`문장 ${S.ns}개 · ${timeKo(S.ns)}`, ''];
  if (w > 0) hubT = setTimeout(() => { if (view === 'hub') rHub(); }, Math.min(w + 500, 2e9));

  const nm = kids.length === 1 ? kids[0].name : '', call = nm ? jo(nm, '아', '야') + ', ' : kids.length > 1 ? '얘들아, ' : '';
  const hi = care ? ['배고파요, 돌봐 주세요!', '배고파요, 돌봐 주세요!'] : gift ? ['선물이 왔어요! 열어 봐요', '선물이 왔어요! 열어 봐요'] : !can ? [call + '오늘도 참 잘했어! 내일 또 만나', '오늘도 참 잘했어! 내일 또 만나'] : w > 0 ? [call + '조금 쉬었다가 또 하자', '조금 쉬었다가 또 하자'] : [call + '오늘도 공부하러 왔어?', '안녕! 오늘도 공부하러 왔어?'];
  const R = 34, C = 2 * Math.PI * R, pct = tot ? met / tot : 0;
  const open = roomOpen(), tile = (cls, act, kind, label, extra = '') => `<button class="hi ${cls}" data-act="${act}"><span class="ib">${iconSVG(kind, ICONSET)}</span><b>${label}</b>${extra}</button>`;
  app.innerHTML = `<div class="hub"><div class="top"><div class="brand">${pawSVG('#FF9DB5', false)}<span>${APPNAME}</span>${pawSVG('#C89A6B', true)}</div>${sep ? `<button class="who" data-act="who">${kname(kids[0])}<small>바꾸기</small></button>` : ''}<span class="sp"></span>${updChip()}<button class="sm ic" data-act="parent">${GEAR}관리자 옵션</button></div>
    <div class="hsay">${hi[0]}</div>
    <div class="hpets">${kids.map((k, i) => `<i style="animation-delay:${-i * .7}s">${petSVG(k.pet.sp, k.pet.vi, 'happy', wearNow(k))}</i>`).join('')}</div>
    <div class="hmain">
      ${tile('ha' + (open ? '' : ' lock'), 'room', 'care', '친구들 돌보기', (care || gift ? '<em>!</em>' : '') + (open ? '' : `<span class="lk">${LOCK}</span>`))}
      ${tile('hb', 'museum', 'museum', '미술관 보기')}
      <button class="hgo ${st[1]}" data-act="start"><span class="ib">${iconSVG('study', ICONSET)}</span><b>오늘 공부하기</b><small>${st[0]}</small>${can && !w ? '' : `<span class="more" data-act="more">${LOCK}한 번 더</span>`}</button>
      ${tile('hc', 'listen', 'listen', '듣기 모드')}
      ${tile('hd', 'cal', 'cal', '달력 보기')}
    </div>
    <div class="hstats" aria-label="공부 기록">
      <div class="hs"><b>이번 주</b><div class="wk">${'월화수목금토일'.split('').map((d, i) => `<span class="${wk.days[i].on ? 'on' : ''} ${wk.days[i].today ? 'td' : ''}"><i>${wk.days[i].on ? STAR : ''}</i>${d}</span>`).join('')}</div><small>${wk.streak > 1 ? `${wk.streak}일째 이어서 하고 있어요` : wk.days.filter(x => x.on).length ? `이번 주 ${wk.days.filter(x => x.on).length}일 했어요` : '도장을 모아 봐요'}</small></div>
      <div class="hs"><b>만난 낱말</b><div class="dn"><svg viewBox="0 0 90 90"><circle cx="45" cy="45" r="${R}" fill="none" stroke="#EFE3D0" stroke-width="12"/><circle cx="45" cy="45" r="${R}" fill="none" stroke="#7CC96A" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(C * pct).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 45 45)" opacity="${met ? 1 : 0}"/></svg><span>${met}</span></div><small>${tot}개 가운데</small></div>
      <div class="hs"><b>배운 문장</b><div class="bk">${[0, 1, 2, 3, 4].map(i => `<i class="${sn > i * 6 ? 'on' : ''}" style="height:${28 + i * 14}%"></i>`).join('')}<span>${sn}</span></div><small>${p.idx ? `공부 ${p.idx}번 했어요` : '첫 공부를 기다려요'}</small></div>
    </div></div>`;
  if (p.ask) setTimeout(() => { if (view === 'hub') lvAsk(); }, 400);
  if (!hubHello) { hubHello = true; if (NATIVE || ac) setTimeout(() => { if (view === 'hub' && !$('ov')) koSay(hi[1]); }, 500); }
}

const STAMPS = [['참', '잘했어요', '#E8504A'], ['', '최고예요', '#F07A1E'], ['', '멋져요', '#E8508C'], ['', '잘했어', '#3D8FD6'], ['', '대단해요', '#8A5BD6'], ['', '훌륭해요', '#3FA35C']];
function stampSVG(n, rot = 0) {
  const [a, b, c] = STAMPS[n % STAMPS.length], T = (y, t, s) => `<text x="0" y="${y}" text-anchor="middle" font-family="J" font-size="${s}" fill="${c}">${t}</text>`, st = `fill="none" stroke="${c}" stroke-linejoin="round" stroke-linecap="round"`;
  const star = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 L3 -3 L10 -3 L4.500 2 L6.500 9 L0 5 L-6.500 9 L-4.500 2 L-10 -3 L-3 -3 Z" fill="${c}"/>`;
  const art = [
    `<circle r="44" ${st} stroke-width="5"/><circle r="36" ${st} stroke-width="2"/>${T(-6, a, 26)}${T(16, b, 17)}${star(-22, -22, .6)}${star(22, -22, .6)}${star(0, 31, .6)}`,
    `<path d="${[...Array(16)].map((_, i) => { const r = i % 2 ? 36 : 46, t = i * Math.PI / 8; return (i ? 'L' : 'M') + (r * Math.sin(t)).toFixed(1) + ' ' + (-r * Math.cos(t)).toFixed(1); }).join(' ')} Z" ${st} stroke-width="4.500"/>${T(-2, '최고', 22)}${T(17, '예요', 15)}${star(0, -24, .55)}`,
    `<path d="M0 40 Q-48 8 -40 -18 Q-32 -40 -10 -30 Q-2 -26 0 -16 Q2 -26 10 -30 Q32 -40 40 -18 Q48 8 0 40 Z" ${st} stroke-width="5"/>${T(8, b, 18)}`,
    `<ellipse cx="0" cy="14" rx="30" ry="26" ${st} stroke-width="5"/><circle cx="-30" cy="-20" r="10" ${st} stroke-width="4.500"/><circle cx="-10" cy="-34" r="10" ${st} stroke-width="4.500"/><circle cx="10" cy="-34" r="10" ${st} stroke-width="4.500"/><circle cx="30" cy="-20" r="10" ${st} stroke-width="4.500"/>${T(20, b, 16)}`,
    `<circle r="44" ${st} stroke-width="5" stroke-dasharray="1 9"/><path d="M-24 -10 L-28 -32 L-12 -20 L0 -38 L12 -20 L28 -32 L24 -10 Z" ${st} stroke-width="4.500"/>${T(14, b, 17)}`,
    `<g ${st} stroke-width="4.500">${[0, 72, 144, 216, 288].map(d => `<ellipse cx="0" cy="-30" rx="15" ry="17" transform="rotate(${d})"/>`).join('')}</g><circle r="19" fill="#fff" ${st.replace('fill="none"', '')} stroke-width="4.500"/><path d="M-8 -3 v.1 M8 -3 v.1" ${st} stroke-width="5"/><path d="M-8 5 q8 8 16 0" ${st} stroke-width="3.500"/>`][n % STAMPS.length];
  return `<svg class="stamp" viewBox="-50 -50 100 100"><g transform="rotate(${rot})" opacity=".92">${art}</g></svg>`;
}
const ymd = (y, m, d) => y + '-' + m + '-' + d;
const nowD = () => new Date(Date.now() + ((S && S.off) || 0) * 864e5);
function calHTML(p, y, m, big) {
  const first = new Date(y, m - 1, 1).getDay(), days = new Date(y, m, 0).getDate(), t = nowD(), isNow = t.getFullYear() === y && t.getMonth() + 1 === m, st = p.st || {};
  let cells = ''; for (let i = 0; i < first; i++) cells += '<i class="e"></i>';
  for (let d = 1; d <= days; d++) { const s = st[ymd(y, m, d)], td = isNow && t.getDate() === d; cells += `<i class="${td ? 'td' : ''} ${s != null ? 'on' : ''}" ${td ? 'id="tdc"' : ''}><b>${d}</b>${s != null ? stampSVG(s, (d * 37) % 25 - 12) : ''}</i>`; }
  return `<div class="cal ${big ? 'big' : ''}"><div class="calh"><span class="pin"></span><b>${m}월</b><small>${y}</small></div><div class="calw">${['일', '월', '화', '수', '목', '금', '토'].map(w => `<i>${w}</i>`).join('')}</div><div class="calg">${cells}</div></div>`;
}
function calMini(p) {
  const t = nowD(), y = t.getFullYear(), m = t.getMonth() + 1, first = new Date(y, m - 1, 1).getDay(), days = new Date(y, m, 0).getDate(), st = p.st || {}; let g = '';
  for (let d = 1; d <= days; d++) { const i = first + d - 1, x = 13 + (i % 7) * 12.400, yy = 50 + Math.floor(i / 7) * 11.500, s = st[ymd(y, m, d)]; g += s != null ? `<circle cx="${x}" cy="${yy}" r="4.600" fill="${STAMPS[s % STAMPS.length][2]}"/>` : `<circle cx="${x}" cy="${yy}" r="2" fill="#E3D6C4"/>`; }
  return `<svg viewBox="0 -14 100 134"><path d="M50 -10 L20 8 M50 -10 L80 8" stroke="#B98A62" stroke-width="2.500" fill="none"/><circle cx="50" cy="-10" r="4" fill="#E8504A"/><rect x="3" y="6" width="94" height="110" rx="9" fill="#fff" stroke="#5A4636" stroke-width="5"/><path d="M3 15 Q3 6 12 6 H88 Q97 6 97 15 V34 H3 Z" fill="#FF8FA8"/><text x="50" y="29" text-anchor="middle" font-family="J" font-size="19" fill="#fff">${m}월</text>${g}</svg>`;
}
let calYM = null;
function rCal(dir) { const t = nowD(); if (!calYM || !dir) calYM = [t.getFullYear(), t.getMonth() + 1]; if (dir) { let [y, m] = calYM; m += dir; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } calYM = [y, m]; }
  const p = PG(), n = Object.keys(p.st || {}).length;
  modal(`${calHTML(p, calYM[0], calYM[1], true)}<div class="row"><button class="sm" data-act="calp">← 지난달</button><b>도장 ${n}개</b><button class="sm" data-act="caln">다음 달 →</button></div><button class="btn y" data-act="close">닫기</button>`); }

async function stampToday(my) {
  const p = PG(), t = nowD(), y = t.getFullYear(), m = t.getMonth() + 1, d = t.getDate(), key = ymd(y, m, d); p.st = p.st || {};
  const n = Object.keys(p.st).length % STAMPS.length;
  const who = shown().length === 1 && shown()[0].name ? shown()[0].name : '';
  app.innerHTML = `<div class="cheer calv"><h1>${who ? who + ', ' : ''}오늘 공부 끝!</h1>${calHTML(p, y, m, true)}</div>`; sfx('ok'); await sleep(1100); if (my !== RUN) return;
  p.st[key] = n; save(); const c = $('tdc'); if (c) { c.classList.add('on', 'bam'); c.insertAdjacentHTML('beforeend', stampSVG(n, (d * 37) % 25 - 12)); const cal = c.closest('.cal'); cal.classList.add('thud'); }
  sfx('stamp'); await sleep(350); if (my !== RUN) return; await koSay('참 잘했어요!'); await sleep(1500);
}

const bowlSVG = (kind, full) => kind === 'food'
  ? `<svg viewBox="-60 -44 120 84"><path d="M-48 -8 H48 L38 30 H-38 Z" fill="#FF9DB5" stroke="#4A3F3A" stroke-width="5" stroke-linejoin="round"/><ellipse cx="0" cy="-8" rx="48" ry="12" fill="#FFD0DC" stroke="#4A3F3A" stroke-width="5"/>${full ? `<ellipse cx="0" cy="-10" rx="36" ry="8" fill="#C98F5E"/><circle cx="-14" cy="-15" r="8" fill="#D9A06C" stroke="#4A3F3A" stroke-width="3"/><circle cx="6" cy="-18" r="9" fill="#D9A06C" stroke="#4A3F3A" stroke-width="3"/><circle cx="22" cy="-13" r="7" fill="#D9A06C" stroke="#4A3F3A" stroke-width="3"/>` : ''}<g fill="#fff"><ellipse cx="0" cy="18" rx="7" ry="5.5"/><circle cx="-9" cy="9" r="3.2"/><circle cx="-3" cy="5" r="3.2"/><circle cx="3" cy="5" r="3.2"/><circle cx="9" cy="9" r="3.2"/></g></svg>`
  : `<svg viewBox="-60 -44 120 84"><path d="M-48 -8 H48 L38 30 H-38 Z" fill="#8CC8F5" stroke="#4A3F3A" stroke-width="5" stroke-linejoin="round"/><ellipse cx="0" cy="-8" rx="48" ry="12" fill="${full ? '#DDF1FF' : '#F4F0EA'}" stroke="#4A3F3A" stroke-width="5"/>${full ? `<ellipse cx="0" cy="-7" rx="38" ry="8" fill="#6FBDF2"/><path d="M-20 -9 Q-10 -13 0 -9" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>` : `<path d="M-14 -8 L-6 -6 M8 -9 L16 -7" stroke="#D9CFC2" stroke-width="3" stroke-linecap="round"/>`}<path d="M0 6 Q-9 18 0 24 Q9 18 0 6 Z" fill="#fff"/></svg>`;
const ownBest = (kid, id) => { const a = kid.inv[id]; if (!a) return 0; for (let t = 3; t >= 1; t--) if (a[t] > 0) return t; return 0; };
const owned = (kid, cat) => ITEMS.filter(i => i.cat === cat && ownBest(kid, i.id));
const wearNow = kid => { const w = {}; for (const k in kid.wear) { const id = kid.wear[k], t = id && ownBest(kid, id); if (t) w[k] = [id, t]; } return w; };
const defSnack = kid => ({ dog: 'bone', cat: 'fish', rabbit: 'carrot' })[kid.pet.sp];
const CARE = ['feed', 'water', 'play', 'pet'];
const kDone = (kid, k) => { const c = kid.care; return !c || (k === 'feed' ? c.feed >= 2 : !!c[k]); };
const kScore = kid => { const c = kid.care; return c ? Math.min(c.feed, 2) + (c.pet ? 1 : 0) + (c.water ? 1 : 0) + (c.play ? 1 : 0) : 0; };
const inCare = () => shown().some(k => k.care);

const allDone = kid => !kid.care || CARE.every(c => kDone(kid, c));
const careOrder = () => { const ks = shown(), t = (S.turn || 0) % ks.length; return ks.slice(t).concat(ks.slice(0, t)); };
const activeKid = () => shown().length > 1 ? careOrder().find(k => k.care && !allDone(k)) || null : null;
const canCare = a => { const k = activeKid(); return !k || a.kid === k; };
const careDone = k => { const ak = activeKid(); return ak ? kDone(ak, k) : shown().every(kid => kDone(kid, k)); };
const bF = a => $('bowlF' + a.i), bW = a => $('bowlW' + a.i);

const GAP = 3600e3; let waitT = 0;
const canStudy = p => p.done < S.per || !!p.extra;
const waitLeft = p => p.done > 0 && p.done < S.per && p.t1 ? Math.max(0, p.t1 + GAP - Date.now()) : 0;
const clockKo = ms => { const d = new Date(ms), h = d.getHours(), m = d.getMinutes(); return (h < 12 ? '오전 ' : '오후 ') + (h % 12 || 12) + '시' + (m ? ' ' + m + '분' : ''); };
const LOCK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.500 11 V8 a4.500 4.500 0 0 1 9 0 V11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="5" y="10.500" width="14" height="10.500" rx="3" fill="currentColor"/></svg>`;
const EAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.500 15 V12 a7.500 7.500 0 0 1 15 0 V15" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="2.500" y="13" width="5.500" height="8" rx="2.500" fill="currentColor"/><rect x="16" y="13" width="5.500" height="8" rx="2.500" fill="currentColor"/></svg>`;
const moreBtn = () => `<button class="more" data-act="more">${LOCK}한 번 더</button>`;
const updChip = () => NEWV ? `<a class="sm upd" href="${UPD.page}">새 버전 받기</a>` : '';
const dayOver = () => !canStudy(PG()) && shown().every(k => !k.care && !k.giftBox);
const restMood = () => dayOver() ? 'sleep' : 'normal';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
let ACT = [], POS = new Map(), RW = 1000, wanderT = 0;
const XMIN = () => 150 / RW * 100, XMAX = () => 100 - 150 / RW * 100, ux = u => u / RW * 100;
function setPet(a, mood, ms) { a.mood = mood; const el = a.el.querySelector('.peti'); if (el) el.innerHTML = petSVG(a.kid.pet.sp, a.kid.pet.vi, mood, wearNow(a.kid)); clearTimeout(a.moodT); if (ms) a.moodT = setTimeout(() => { if (a.el.isConnected) setPet(a, restMood()); }, ms); think(a); }

function movePet(a, x, y, ms) {
  if (!a.el.isConnected) return; if (Math.abs(x - a.x) > 1) a.dir = x < a.x ? -1 : 1;
  const s = a.el.style; s.transition = `left ${ms}ms linear,top ${ms}ms linear`; s.left = x + '%'; s.top = y + '%'; s.zIndex = Math.round(y); a.el.querySelector('.petb').style.transform = `scaleX(${a.dir})`; a.x = x; a.y = y; POS.set(a.kid, { x, y, dir: a.dir });
  clearTimeout(a.walkT); a.el.classList.add('walk'); a.walkT = setTimeout(() => a.el.classList.remove('walk'), ms);
}
function stopPet(a) {
  const r = $('room'); if (!a.el.isConnected || !r) return; const p = a.el.getBoundingClientRect(), b = r.getBoundingClientRect();
  a.x = (p.left + p.width / 2 - b.left) / b.width * 100; a.y = clamp((p.top + p.height / 2 - b.top) / b.height * 100, 57, 75); POS.set(a.kid, { x: a.x, y: a.y, dir: a.dir });
  a.el.style.transition = 'none'; a.el.style.left = a.x + '%'; a.el.style.top = a.y + '%'; clearTimeout(a.walkT); a.el.classList.remove('walk');
}
function wander() {
  clearTimeout(wanderT); wanderT = setTimeout(() => {
    if (view === 'home' && !$('ov')) { const free = ACT.filter(a => a.el.isConnected && !a.busy && !a.lastP && a.mood === 'normal' && Date.now() > a.hold && ![...DRS.values()].some(d => d.a === a)), a = free.length && rnd(free);
      if (a) { if (Math.random() < .78) { const x = a.xmin + Math.random() * (a.xmax - a.xmin), y = 59 + Math.random() * 15, d = Math.hypot((x - a.x) * RW / 1000, (y - a.y) * 2); movePet(a, x, y, Math.max(600, d * 48)); }
        else { a.el.classList.remove('jump1'); void a.el.offsetWidth; a.el.classList.add('jump1'); setTimeout(() => a.el.classList.remove('jump1'), 700); } } }
    wander();
  }, (1800 + Math.random() * 2600) / Math.max(1, ACT.length * .7));
}
function fx(cls, html, x, y, ms) { const r = $('room'); if (!r) return null; const d = document.createElement('div'); d.className = 'fx ' + cls; d.style.left = x + '%'; d.style.top = y + '%'; d.innerHTML = html; r.appendChild(d); if (ms) setTimeout(() => d.remove(), ms); return d; }
function hearts(a, n = 4) { const w = 14 * 1000 / RW; for (let i = 0; i < n; i++) setTimeout(() => fx('heart', HEART, a.x - w + Math.random() * w * 2, a.y - 18 + Math.random() * 12, 1000), i * 140); }
function confetti() { const cols = ['#FF9DB5', '#FFD84D', '#8CC8F5', '#A8DDA0', '#C9A7F0']; for (let i = 0; i < 30; i++) { const d = fx('conf', '', 4 + Math.random() * 92, -4, 2600); if (!d) return; d.style.background = cols[i % 5]; d.style.animationDelay = Math.random() * .7 + 's'; d.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg'); } }
function bubble(text, ms = 2200) { const r = $('room'); if (!r) return; r.querySelectorAll('.say').forEach(e => e.remove()); const d = document.createElement('div'); d.className = 'say'; d.textContent = text; r.appendChild(d); setTimeout(() => d.remove(), ms); }
function think(a) { const t = a.el.querySelector('.think'); if (!t) return; const k = a.kid.care && canCare(a) && a.mood === 'normal' && CARE.find(k => !kDone(a.kid, k)); t.innerHTML = k ? kitSVG(k, a.kid) : ''; t.classList.toggle('on', !!k); }
const tagHTML = kid => `${kid.pet.name}${kid.care ? `<span class="mh">${[0, 1, 2, 3, 4].map(i => `<i class="${i < kScore(kid) ? 'on' : ''}">${HEART}</i>`).join('')}</span>` : ''}`;
const BIRD = `<svg viewBox="-30 -20 60 40"><path d="M-18 4 Q-10 -12 6 -8 Q18 -6 20 4 Q10 14 -4 12 Q-14 12 -18 4 Z" fill="#8CC8F5" stroke="#5A4636" stroke-width="3" stroke-linejoin="round"/><path class="wing" d="M-6 -2 Q0 -22 12 -14 Q8 -4 2 0 Z" fill="#BFE6FA" stroke="#5A4636" stroke-width="3" stroke-linejoin="round"/><path d="M20 2 L29 4 L20 8 Z" fill="#FFD84D" stroke="#5A4636" stroke-width="2.500" stroke-linejoin="round"/><circle cx="12" cy="0" r="2.200" fill="#5A4636"/></svg>`;

function layout() {
  const W = innerWidth, H = innerHeight, land = W > H * 1.15 && H >= 380, top = clamp(H * .09, 54, 76); let w, h;
  if (land) { const side = clamp(W * .17, 132, 220); h = H - top - 22; w = Math.min(W - side - 26, h * 2); if (w / h < 1.25) h = w / 1.25; }
  else { w = W - 16; h = Math.min(w / 1.25, H - top - clamp(H * .26, 150, 230)); w = Math.min(w, h * 1.25); h = w / 1.25; if (W / H > .8) { h = Math.min(H - top - 170, w / 1.25); w = Math.min(W - 16, h * 1.6); } }
  return { land, w: Math.floor(w), h: Math.floor(h) };
}

function zoneGeo(kids) {
  const n = kids.length; if (n < 2) return null; const zw = RW / n, hs = clamp(zw / 640, .46, .78), hw = 232 * hs, cw = clamp(zw * .2, 92, 150), mw = clamp(zw * .36, 150, 214);
  return kids.map((kid, j) => { const x0 = j * zw, x1 = x0 + zw, right = n === 2 ? j === 1 : j === 2, hx = right ? x1 - 14 - hw : x0 + 14, cl = right ? hx - 14 - cw / 2 : hx + hw + 14 + cw / 2, mx = right ? x1 - 20 - mw : x0 + 20;
    return { kid, sp: kid.pet.sp, x0, x1, right, hx, hs, hw, cl, cw, mx, mw, cx: x0 + zw * (right ? .43 : .57), rw: zw * .37, bf: mx + mw * .28, bw: mx + mw * .72, bs: mw * .42, sleep: right ? hx - hw * .28 : hx + hw * 1.28 }; });
}
function rHome() {
  rollDay(); view = 'home'; bgStop(); const L = layout(), kids = shown(), multi = kids.length > 1, over = dayOver(), p = PG(); RW = Math.round(800 * L.w / L.h); const Z = zoneGeo(kids);
  const toys = [...new Set(kids.flatMap(k => owned(k, 'toy').map(i => i.id)))].slice(0, 3).map(id => itemSVG(id, Math.max(...kids.map(k => ownBest(k, id)))));
  const who = `<div class="who" id="whochip">${multi ? '우리 집' : kids[0].pet.name}</div>`;
  ACT = kids.map((kid, i) => { const z = Z && Z[i], xmin = z ? ux(z.x0 + 112) : XMIN(), xmax = z ? ux(z.x1 - 112) : XMAX();
    let s = over ? { x: z ? ux(z.sleep) : ux(250 + i * 170), y: 63, dir: 1 } : POS.get(kid) || { x: z ? ux(z.cx) : 50, y: 66, dir: 1 }; s = { x: clamp(s.x, over ? 0 : xmin, over ? 100 : xmax), y: s.y, dir: s.dir };
    return { kid, i: S.kids.indexOf(kid), z, xmin, xmax, bfx: z ? ux(z.bf) : ux(92), bwx: z ? ux(z.bw) : ux(212), x: s.x, y: s.y, dir: s.dir, mood: 'normal', hold: 0, petN: 0, rub: 0, lastP: null, busy: false }; });
  const gifts = kids.filter(k => k.giftBox);
  const bowls = a => { const w = a.z ? (a.z.bs / 8).toFixed(1) : 12.5, full = k => !a.kid.care || kDone(a.kid, k);
    return `<div class="el tapme" id="bowlF${a.i}" style="left:${a.bfx}%;top:${a.z ? 93.5 : 92.5}%;width:${w}cqh;z-index:95" data-act="feed">${bowlSVG('food', full('feed'))}</div><div class="el tapme" id="bowlW${a.i}" style="left:${a.bwx}%;top:${a.z ? 94 : 93.5}%;width:${w}cqh;z-index:96" data-act="water">${bowlSVG('water', full('water'))}</div>`; };
  const closets = Z ? Z.map(z => `<div class="el tapme" style="left:${ux(z.cl)}%;top:${((467 - z.cw * .74) / 8).toFixed(1)}%;width:${(z.cw / 8).toFixed(1)}cqh;z-index:2" data-act="closetk" data-k="${S.kids.indexOf(z.kid)}">${closetSVG((z.kid.newAcc || []).length)}</div><div class="zname" style="left:${ux(z.hx + z.hw / 2)}%;top:${((528 - 228 * z.hs) / 8).toFixed(1)}%">${kname(z.kid)}</div>`).join('')
    : `<div class="el tapme" id="closet" style="left:calc(100% - 16cqh);top:41.500%;width:22.500cqh;z-index:2" data-act="closet">${closetSVG(kids.reduce((n, k) => n + (k.newAcc || []).length, 0))}</div>`;
  app.innerHTML = `<div class="home ${L.land ? 'land' : ''}"><div class="top"><button class="sm ic homeb" data-act="hub">${HOMEIC}홈</button>${who}<div class="gauge" id="gauge"></div><button class="sm" data-act="bag">보물 상자</button></div>
  <div class="mid"><div class="roomwrap"><div class="room ${over ? 'night' : ''} ${Z ? 'zoned z' + Z.length : ''}" id="room" style="width:${L.w}px;height:${L.h}px">${roomBG([...new Set(kids.map(k => k.pet.sp))], RW, Z)}
    <div class="el tapme" data-act="win" style="left:50%;top:29.500%;width:26cqh;height:22%"></div>
    <div class="el tapme" id="cal" style="left:calc(50% + 25.500cqh);top:21.500%;width:11.500cqh;z-index:2" data-act="cal">${calMini(p)}</div>
    ${closets}${ACT.map(bowls).join('')}
    ${Z ? '' : `<div class="el tapme" id="basket" style="left:calc(100% - 13cqh);top:89%;width:16cqh;z-index:95" data-act="basket">${basketSVG(toys)}</div>`}
    ${ACT.map(a => `<div class="el pet" data-k="${a.i}" style="left:${a.x}%;top:${a.y}%;z-index:${Math.round(a.y)}"><div class="think"></div><div class="petb" style="transform:scaleX(${a.dir})"><div class="peti"></div></div>${multi ? `<div class="ptag">${tagHTML(a.kid)}</div>` : ''}</div>`).join('')}
    ${gifts.map((k, j) => `<div class="el tapme gift" data-act="gift" data-k="${S.kids.indexOf(k)}" style="left:${Z ? ux(Z[kids.indexOf(k)].cx) + '%' : `calc(${gifts.length > 1 ? 50 : 62}% + ${(j - (gifts.length - 1) / 2) * 17}cqh)`};animation-delay:${j * .15}s,${.7 + j * .15}s">${giftSVG()}${multi ? `<span class="gtag">${kname(k)}</span>` : ''}</div>`).join('')}<div class="dim"></div>
  </div></div><div class="bar" id="bar"></div></div></div>`;
  ACT.forEach(a => { a.el = app.querySelector(`.el.pet[data-k="${a.i}"]`); setPet(a, restMood()); bindPet(a); }); rBar(); wander();
}
function rBar() {
  const bar = $('bar'); if (!bar) return; const kids = shown(), g = $('gauge'), p = PG();
  if (g) g.innerHTML = kids.length === 1 && kids[0].care ? [0, 1, 2, 3, 4].map(i => `<i class="${i < kScore(kids[0]) ? 'on' : ''}">${HEART}</i>`).join('') : '';
  const ak = activeKid(), wc = $('whochip');
  ACT.forEach(a => { const t = a.el.querySelector('.ptag'); if (t) t.innerHTML = tagHTML(a.kid); a.el.classList.toggle('wait', inCare() && !canCare(a)); think(a);
    const f = bF(a), w = bW(a), on = inCare() && canCare(a) && !!a.kid.care; if (f) f.classList.toggle('glow', on && a.kid.care.feed < 2); if (w) w.classList.toggle('glow', on && !a.kid.care.water); });
  if (wc) { wc.classList.toggle('turn', !!ak); wc.innerHTML = ak ? `${kname(ak)} <small>차례</small>` : kids.length > 1 ? '우리 집' : kids[0].pet.name; }
  if (inCare()) {
    kids.forEach(k => { if (k.care && !k.care.sn) { const sn = owned(k, 'snack'), ty = owned(k, 'toy'); k.care.sn = sn.length ? rnd(sn).id : defSnack(k); k.care.ty = ty.length ? rnd(ty).id : 'ball'; } }); save();
    if (!$('tray')) bar.innerHTML = `<div class="carebox"><div class="tray" id="tray">${[['feed', '간식'], ['water', '물'], ['play', '장난감'], ['pet', '쓰담쓰담']].map(([k, n]) => `<button class="act" data-care="${k}"><span class="ob" id="ob-${k}">${k === 'feed' ? '' : kitSVG(k)}</span><span class="lb">${n}</span></button>`).join('')}</div><div class="hint">끌어서 가져다주고, 손으로 쓰다듬어 줘요</div></div>`;
    const need = (ak ? [ak] : kids).filter(k => k.care && k.care.feed < 2), left = Math.max(0, Math.min(2, need.reduce((n, k) => n + 2 - k.care.feed, 0) - [...DRS.values()].filter(d => d.k === 'feed' && d.el).length));
    $('ob-feed').innerHTML = plateSVG(Array(left).fill(0).map((_, i) => kitSVG('feed', need[i % Math.max(1, need.length)])));
    document.querySelectorAll('[data-care]').forEach(b => b.classList.toggle('done', careDone(b.dataset.care)));
  } else if (kids.some(k => k.giftBox)) bar.innerHTML = `<div class="msg">선물 상자가 왔어요!<br>눌러서 열어 봐요</div>`;
  else if (canStudy(p)) { const w = waitLeft(p); clearTimeout(waitT);
    if (w > 0) { bar.innerHTML = `<div class="msg has">${moreBtn()}다음 공부는<br><b>${clockKo(Date.now() + w)}</b>부터<small>첫 공부를 마치고<br>1시간 쉬었다가 해요</small></div>`; waitT = setTimeout(() => { if (view === 'home') rBar(); }, Math.min(w + 500, 2e9)); }
    else bar.innerHTML = `<div class="startbox"><button class="btn y big" data-act="start">${p.done ? '한 번 더 공부하기' : '오늘 공부 시작'} ▶</button><div class="steps"><i>단어 카드</i><i>문장 말하기</i><i>돌봐 주기</i></div></div>`; }
  else bar.innerHTML = `<div class="msg has">${moreBtn()}오늘 공부 끝!<br>코 자고 내일 또 만나요</div>`;
}

function bindPet(a) {
  const el = a.el;
  const add = (e, n) => { const r = $('room').getBoundingClientRect(), x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100; a.rub += n; if (a.rub >= 1) { a.rub = 0; fx('heart', HEART, x, y - 6, 1000); petCount(a); } };
  el.onpointerdown = e => { if (inCare() && !canCare(a)) return; audio(); stopPet(a); a.hold = Date.now() + 2500; a.lastP = [e.clientX, e.clientY]; add(e, 1); try { el.setPointerCapture(e.pointerId); } catch (_) {} };
  el.onpointermove = e => { if (!a.lastP) return; const d = Math.hypot(e.clientX - a.lastP[0], e.clientY - a.lastP[1]); if (d > 24) { a.lastP = [e.clientX, e.clientY]; a.hold = Date.now() + 2500; add(e, .5); } };
  el.onpointerup = el.onpointercancel = () => { a.lastP = null; };
}
function petCount(a) {
  if (a.mood !== 'happy') setPet(a, 'happy', 1400); else { clearTimeout(a.moodT); a.moodT = setTimeout(() => { if (a.el.isConnected) setPet(a, restMood()); }, 1400); }
  if (a.petN % 3 === 0) sfx('purr'); a.petN++;
  if (a.kid.care && !a.kid.care.pet && a.petN >= 5) { clearHints(); markCare(a, 'pet', '기분 좋아!'); }
}
function careOK(a, text) { save(); sfx('ok'); hearts(a, 5); bubble(text); koSay(text); const fin = allDone(a.kid); rBar();
  if (shown().every(allDone)) setTimeout(finishCare, 1700); else if (fin && activeKid()) setTimeout(() => giftThenNext(a.kid), 1700); }

let nextAfterGift = false;
function giftThenNext(kid) {
  if (!S || view !== 'home') return;
  if (PG().done >= S.per && !kid.giftGiven) { kid.giftGiven = true; kid.giftBox = true; save(); nextAfterGift = true; bubble('잘 돌봐 줬어요! 선물이 왔어요', 2500); koSay('잘 돌봐 줬어요! 선물이 왔어요'); return setTimeout(() => { if (view === 'home' && kid.giftBox) openGift(S.kids.indexOf(kid)); }, 1900); }
  if (activeKid()) turnSay(activeKid(), false);
}

function turnSay(kid, first) {
  if (!kid || view !== 'home' || !S) return; clearHints(); rBar(); const a = ACT.find(x => x.kid === kid), nm = kid.name, pn = kid.pet.name;
  bubble(first ? `${kname(kid)} 먼저 돌봐 줘요` : `이제 ${kname(kid)} 차례예요`, 3000); if (a) { a.el.classList.remove('jump1'); void a.el.offsetWidth; a.el.classList.add('jump1'); }

  if (nm) { const v0 = view, pr = koSay(jo(nm, '아', '야')), tk = koTok; return pr.then(() => { if (tk === koTok && view === v0) return koSay(first ? '먼저 돌봐 줘' : '이제 네 차례야'); }); }
  const gen = first ? '친구 먼저 돌봐 줘요' : '이제 다음 친구 차례예요'; return koSay(named(pn) ? (first ? `${pn} 먼저 돌봐 줘요` : `이제 ${pn} 차례예요`) : gen, gen);
}
function markCare(a, k, text) { a.kid.care[k] = 1; careOK(a, text); }

const DRS = new Map();
const snackArt = (kid, id) => ['bone', 'fish', 'carrot'].includes(id) ? treatSVG(id) : shadowed(itemSVG(id, ownBest(kid, id) || 1));
const toyArt = (kid, id) => id === 'ball' && !ownBest(kid, 'ball') ? ballSVG() : shadowed(itemSVG(id, ownBest(kid, id) || 1));
const needKid = k => { const ak = activeKid(); return ak && !kDone(ak, k) ? ak : shown().find(kid => kid.care && !kDone(kid, k)) || shown()[0]; };
const kitSVG = (k, kid) => { kid = kid || needKid(k); const c = kid.care || {}; return k === 'feed' ? snackArt(kid, c.sn || defSnack(kid)) : k === 'water' ? pitcherSVG() : k === 'pet' ? handSVG() : toyArt(kid, c.ty || 'ball'); };
const HINT = { feed: n => `간식을 끌어서 ${n}에게 줘요`, water: () => '물병을 끌어서 물그릇에 부어요', play: () => '장난감을 끌어서 흔들어 줘요', pet: n => `${jo(n, '을', '를')} 손으로 쓰다듬어 줘요` };
const near = (el, x, y, pad) => { if (!el) return false; const r = el.getBoundingClientRect(), px = r.width * pad, py = r.height * pad; return x > r.left - px && x < r.right + px && y > r.top - py && y < r.bottom + py; };
const clearHints = () => document.querySelectorAll('.fx.hand,.dragging.demo').forEach(e => e.remove());
const cdist = (a, x, y) => { const r = a.el.getBoundingClientRect(); return Math.hypot(r.left + r.width / 2 - x, r.top + r.height / 2 - y); };
const nearest = (k, x, y, free) => { let c = ACT.filter(a => canCare(a) && a.kid.care && !kDone(a.kid, k) && !a.busy && (!free || ![...DRS.values()].some(d => d.a === a))); if (!c.length && free) c = ACT.filter(a => canCare(a) && ![...DRS.values()].some(d => d.a === a)); return c.sort((p, q) => cdist(p, x, y) - cdist(q, x, y))[0]; };
function careHint(k, quiet) {
  if (!S || view !== 'home' || $('ov')) return;
  if (!inCare()) { if (PG().done < S.per && !shown().some(x => x.giftBox)) { bubble('공부하고 나서 돌봐 줘요'); koSay('공부하고 나서 돌봐 주자'); } return; }
  const a = ACT.find(a => canCare(a) && a.kid.care && !kDone(a.kid, k) && !a.busy); if (!a || DRS.size) return;
  const text = HINT[k](a.kid.pet.name); bubble(text, 2800); if (!quiet) koSay(named(a.kid.pet.name) ? text : HINT[k]('친구'), HINT[k]('친구')); clearHints(); stopPet(a); a.hold = Date.now() + 3200;
  if (k === 'pet') { fx('hand', handSVG(), a.x, a.y - 6, 3000); return; }
  const b = document.querySelector(`[data-care="${k}"]`), t = k === 'water' ? bW(a) : a.el; if (!b || !t) return;
  const r = b.getBoundingClientRect(), q = t.getBoundingClientRect(), d = document.createElement('div');
  d.className = 'dragging demo'; d.innerHTML = kitSVG(k, a.kid) + `<span class="fing">${handSVG()}</span>`; d.style.left = r.left + r.width / 2 + 'px'; d.style.top = r.top + r.height / 2 + 'px'; document.body.appendChild(d);
  requestAnimationFrame(() => requestAnimationFrame(() => { d.style.left = q.left + q.width / 2 + 'px'; d.style.top = q.top + q.height * (k === 'water' ? .1 : .6) + 'px'; }));
  setTimeout(() => d.classList.add('out'), 1300); setTimeout(() => d.remove(), 1650);
}
function dragMove(e) {
  const D = DRS.get(e.pointerId); if (!D) return; const x = e.clientX, y = e.clientY;
  if (!D.el) { if (Math.hypot(x - D.x0, y - D.y0) < 8) return; clearHints();
    const d = document.createElement('div'); d.className = 'dragging'; d.innerHTML = kitSVG(D.k); document.body.appendChild(d); D.el = d; if (D.k === 'feed') rBar(); else D.b.classList.add('lift'); sfx('pop'); }
  D.el.style.left = x + 'px'; D.el.style.top = y + 'px';
  if (D.k === 'water') { D.el.classList.toggle('tilt', ACT.some(a => canCare(a) && a.kid.care && !a.kid.care.water && (near(bW(a), x, y, .7) || near(a.el, x, y, .05)))); return; }
  const room = $('room'); if (!room) return; const r = room.getBoundingClientRect(), now = Date.now();
  if (!(x > r.left && x < r.right && y > r.top && y < r.bottom + r.height * .12)) return;
  const px = (x - r.left) / r.width * 100; let tx = clamp(px, XMIN() * .7, 100 - XMIN() * .7);
  if (D.k === 'feed') { if (ACT.length === 1 && now - D.tm > 380) { D.tm = now; const a = nearest('feed', x, y); if (a && Math.abs(tx - a.x) > 7 * 1000 / RW) { a.hold = now + 1500; movePet(a, tx + (tx > a.x ? -5 : 5) * 1000 / RW, a.y, 420); } } return; }
  if (!D.a) { D.a = nearest('play', x, y, true); if (!D.a) return; stopPet(D.a); const pid = e.pointerId; D.endT = setTimeout(() => playEnd(pid), 3000); }
  const a = D.a; if (a.z) tx = clamp(px, a.xmin, a.xmax); if (D.lx != null) D.dist += Math.abs(px - D.lx) * RW / 1000; D.lx = px;
  if (now - D.tm > 110) { D.tm = now; movePet(a, tx, a.y, 220); }
  if (!a.el.classList.contains('chase')) { a.el.classList.add('chase'); setPet(a, 'happy'); }
  if (D.dist - D.beep > 38) { D.beep = D.dist; sfx('hop'); }
  if (!D.done && D.dist > 115 && a.kid.care && !a.kid.care.play) { D.done = true; markCare(a, 'play', '또 놀자!'); }
}

function playEnd(pid) {
  const D = DRS.get(pid); if (!D || D.k !== 'play') return; DRS.delete(pid); D.b.classList.remove('lift'); if (D.el) D.el.remove(); const a = D.a;
  if (a) { a.el.classList.remove('chase'); a.hold = Date.now() + 1200;
    if (!D.done && S && view === 'home' && a.kid.care && !a.kid.care.play) { D.done = true; markCare(a, 'play', '또 놀자!'); } else if (a.el.isConnected) setPet(a, 'happy', 1200); }
  if (S && view === 'home' && inCare()) rBar();
}
function dragEnd(e) {
  const D = DRS.get(e.pointerId); if (!D) return; clearTimeout(D.endT); DRS.delete(e.pointerId); D.b.classList.remove('lift');
  if (D.a) { D.a.el.classList.remove('chase'); D.a.hold = Date.now() + 1200; }
  if (!S || !inCare() || view !== 'home') { if (D.el) D.el.remove(); return; }
  rBar(); if (!D.el) return careHint(D.k);
  const x = e.clientX, y = e.clientY; D.el.remove();
  const on = k => ACT.filter(a => canCare(a) && a.kid.care && !kDone(a.kid, k) && !a.busy && near(a.el, x, y, .1)).sort((p, q) => cdist(p, x, y) - cdist(q, x, y))[0];
  if (D.k === 'feed') { const a = on('feed') || ACT.find(q => canCare(q) && q.kid.care && !kDone(q.kid, 'feed') && !q.busy && near(bF(q), x, y, .5)), r = $('room').getBoundingClientRect();
    if (a) doFeed(a); else if (x > r.left && x < r.right && y > r.top + r.height * .45 && y < r.bottom && nearest('feed', x, y)) doFeed(nearest('feed', x, y), { x: (x - r.left) / r.width * 100, y: (y - r.top) / r.height * 100 });
    else { const n = needKid('feed').pet.name; bubble(HINT.feed(n)); koSay(named(n) ? HINT.feed(n) : HINT.feed('친구'), HINT.feed('친구')); } }
  else if (D.k === 'water') { const a = on('water'), b = ACT.find(q => canCare(q) && q.kid.care && !q.kid.care.water && !q.busy && near(bW(q), x, y, .7)); if (b) doWater(b, true); else if (a) doWater(a, false); else { bubble(HINT.water()); koSay(HINT.water()); } }
  else if (D.a) { if (D.done) setPet(D.a, 'happy', 1200); else { setPet(D.a, restMood()); bubble('장난감을 이리저리 흔들어 줘요'); koSay('장난감을 이리저리 흔들어 줘요'); } }
}
document.addEventListener('pointerdown', e => { const b = e.target.closest('[data-care]'); if (!b || !S || view !== 'home' || !inCare() || DRS.has(e.pointerId)) return; audio(); const k = b.dataset.care; if (careDone(k)) return; if (k === 'pet') return careHint('pet');
  DRS.set(e.pointerId, { k, b, x0: e.clientX, y0: e.clientY, el: null, a: null, lx: null, dist: 0, beep: 0, tm: 0, done: false }); try { b.setPointerCapture(e.pointerId); } catch (_) {} });
document.addEventListener('pointermove', dragMove); document.addEventListener('pointerup', dragEnd);
document.addEventListener('pointercancel', e => { const D = DRS.get(e.pointerId); if (D) { if (!D.el) D.el = document.createElement('i'); dragEnd({ pointerId: e.pointerId, clientX: -9999, clientY: -9999 }); } });
async function doFeed(a, at) {
  if (a.busy || !a.kid.care || kDone(a.kid, 'feed')) return; a.busy = true; stopPet(a);
  if (at) { const g = fx('snack', kitSVG('feed', a.kid), at.x, at.y); g.style.width = '9cqh'; const tx = a.z ? clamp(at.x, a.xmin, a.xmax) : clamp(at.x, XMIN() * .7, 100 - XMIN() * .7), ty = clamp(at.y - 3, 57, 75), ms = Math.max(350, Math.hypot((tx - a.x) * RW / 1000, (ty - a.y) * 2) * 30); setPet(a, 'happy'); movePet(a, tx, ty, ms); await sleep(ms + 60); if (g) g.remove(); if (!a.el.isConnected || !a.kid.care) { a.busy = false; return; } }
  const f = fx('snack', kitSVG('feed', a.kid), a.x, a.y + 3); f.style.width = '9cqh'; setPet(a, 'eat'); sfx('yum'); await sleep(80); if (f) f.style.width = '1cqh'; await sleep(700); if (f) f.remove(); await sleep(650);
  a.busy = false; if (!S || !a.kid.care || view !== 'home' || !a.el.isConnected) return; a.kid.care.feed++;
  if (a.kid.care.feed >= 2) { if (bF(a)) bF(a).innerHTML = bowlSVG('food', true); setPet(a, 'happy', 1500); careOK(a, '냠냠, 맛있어!'); }
  else { save(); setPet(a, 'happy', 1100); sfx('pop'); hearts(a, 2); bubble('하나 더 주세요!'); koSay('하나 더 주세요'); rBar(); }
}
async function doWater(a, bowl) {
  if (a.busy || !a.kid.care || a.kid.care.water) return; a.busy = true; stopPet(a); sfx('water');
  if (bowl) { fx('pitcher', pitcherSVG(), a.bwx, 82, 1700); await sleep(900); if (bW(a)) bW(a).innerHTML = bowlSVG('water', true); await sleep(500); if (a.el.isConnected) { movePet(a, a.z ? clamp(a.bwx + (a.z.right ? -1 : 1) * ux(96), a.xmin, a.xmax) : ux(310), 75, 800); await sleep(850); } }
  else { fx('pitcher', pitcherSVG(), a.x - ux(40), a.y - 4, 1700); await sleep(900); fx('minibowl', bowlSVG('water', true), a.x - ux(70), a.y + 13, 2400); await sleep(400); }
  if (a.el.isConnected) { setPet(a, 'eat'); sfx('yum'); await sleep(1200); }
  a.busy = false; if (!S || !a.kid.care || view !== 'home' || !a.el.isConnected) return; setPet(a, 'happy', 1500); markCare(a, 'water', '시원해!');
}
function finishCare() {
  const kids = shown(); if (!kids.some(k => k.care)) return; DRS.forEach(D => { if (D.el) D.el.remove(); }); DRS.clear();
  kids.forEach(k => { k.care = null; if (PG().done >= S.per && !k.giftGiven) { k.giftGiven = true; k.giftBox = true; } });
  save(); sfx('fanfare'); if (view !== 'home') return;
  rHome(); ACT.forEach(a => { setPet(a, 'happy', 2500); hearts(a, 5); }); confetti();
  const g = kids.some(k => k.giftBox); bubble(g ? '잘 돌봐 줬어요! 선물이 왔어요' : '잘 돌봐 줬어요!', 3200); koSay(g ? '잘 돌봐 줬어요! 선물이 왔어요' : '잘 돌봐 줬어요!');
}

function pickGift(kid) { const near = ITEMS.filter(i => { const a = kid.inv[i.id]; return a && (a[1] === 1 || a[1] === 2); }); return (near.length && Math.random() < .55 ? rnd(near) : rnd(ITEMS)).id; }
function addItem(kid, id) {
  const a = kid.inv[id] || (kid.inv[id] = [0, 0, 0, 0]); a[1]++; const merges = []; for (let t = 1; t < 3; t++) if (a[t] >= 3) { a[t] -= 3; a[t + 1]++; merges.push(t + 1); }
  const it = ITEM[id]; let where = it.cat;
  if (it.slot) { const cur = kid.wear[it.slot]; if (!cur || !ownBest(kid, cur)) { kid.wear[it.slot] = id; where = 'wear'; } else if (cur === id) where = 'same'; else { where = 'closet'; kid.newAcc = [...new Set([...(kid.newAcc || []), id])]; } }
  return { merges, where };
}
const WHERE = { wear: '바로 입혀 줬어요', same: '지금 하고 있는 것과 똑같아요 · 하나 더 모았어요', closet: '옷장에 넣어 뒀어요 · 옷장을 눌러 갈아입혀요', snack: '간식 시간에 줄 수 있어요', toy: '장난감 바구니에 넣어 뒀어요' };
function modal(html) { closeModal(); const d = document.createElement('div'); d.className = 'ov'; d.id = 'ov'; d.innerHTML = `<div class="dlg">${html}</div>`; document.body.appendChild(d); }
const closeModal = () => { const o = $('ov'); if (o) o.remove(); };
async function openGift(i) {
  const kid = S.kids[i]; if (!kid || !kid.giftBox) return; audio();
  modal(`<h2>${shown().length > 1 ? kname(kid) + '의 ' : ''}선물 상자</h2><div class="giftbig shake" id="gb">${giftSVG()}</div>`); sfx('boing'); await sleep(1050);
  const id = pickGift(kid), { merges, where } = addItem(kid, id); kid.giftBox = false; save();
  const cat = { acc: '악세사리', snack: '특별한 간식', toy: '장난감' }[ITEM[id].cat];
  sfx('fanfare'); modal(`<p>${cat}</p><h2>${itemName(id, 1)}</h2><div class="reveal">${itemSVG(id, 1)}</div><p>${WHERE[where]}</p><button class="btn y big" data-act="${merges.length ? 'merge' : 'giftok'}" data-k="${i}" data-id="${id}" data-t="${merges[0] || 0}">좋아!</button>`);
  koSay(itemName(id, 1) + '!');
}
function showMerge(id, t, i) { sfx('merge'); modal(`<p>똑같은 게 3개 모였어요</p><div class="three">${itemSVG(id, t - 1)}${itemSVG(id, t - 1)}${itemSVG(id, t - 1)}<span class="ar">→</span><span class="new">${itemSVG(id, t)}</span></div><h2>${itemName(id, t)}</h2><button class="btn y big" data-act="giftok" data-k="${i}">우와!</button>`); koSay('우와! ' + itemName(id, t)); }

const SLOTS = [['head', '머리'], ['neck', '목'], ['face', '얼굴']];
const NOWEAR = `<svg viewBox="-50 -50 100 100"><circle r="30" fill="none" stroke="#C9BDB0" stroke-width="7"/><path d="M-21 21 L21 -21" stroke="#C9BDB0" stroke-width="7" stroke-linecap="round"/></svg>`;
let closetNew = [], dlgK = 0;
const kidTabs = act => shown().length > 1 ? `<div class="seg ktab">${shown().map(k => { const i = S.kids.indexOf(k); return `<button class="${i === dlgK ? 'on' : ''}" data-act="${act}" data-k="${i}">${k.pet.name}${act === 'closetk' && (k.newAcc || []).length ? ' <em>새</em>' : ''}</button>`; }).join('')}</div>` : '';
function rCloset(i, first) {
  if (i == null) { const ks = shown(); i = S.kids.indexOf(ks.find(k => (k.newAcc || []).length) || ks[0]); } dlgK = i; const kid = S.kids[i];
  if (first) { closetNew = kid.newAcc || []; kid.newAcc = []; save(); const c = $('closet'); if (c) c.innerHTML = closetSVG(shown().reduce((n, k) => n + (k.newAcc || []).length, 0)); }
  const any = ITEMS.some(it => it.slot && ownBest(kid, it.id));
  modal(`<h2>옷장</h2>${kidTabs('closetk')}<div class="bigpet">${petSVG(kid.pet.sp, kid.pet.vi, 'happy', wearNow(kid))}</div>${any ? `<p>눌러서 갈아입혀요</p>` + SLOTS.map(([s, n]) => { const its = ITEMS.filter(it => it.slot === s && ownBest(kid, it.id)); return its.length ? `<div class="invh">${n}</div><div class="inv">${its.map(it => `<button class="it ${kid.wear[s] === it.id ? 'worn' : ''}" data-act="wear" data-id="${it.id}">${itemSVG(it.id, ownBest(kid, it.id))}${closetNew.includes(it.id) ? '<span class="cnt nw">새</span>' : ''}${itemName(it.id, ownBest(kid, it.id))}</button>`).join('')}<button class="it ${kid.wear[s] && ownBest(kid, kid.wear[s]) ? '' : 'worn'}" data-act="unwear" data-slot="${s}">${NOWEAR}안 하기</button></div>` : ''; }).join('') : `<p>아직 옷장이 비어 있어요<br>선물 상자에서 악세사리가 나오면 여기에 넣어 둘게요</p>`}<button class="btn y" data-act="close">닫기</button>`);
}
function rBag(i) {
  if (i == null) i = S.kids.indexOf(shown()[0]); dlgK = i; const kid = S.kids[i];
  const sec = (cat, title) => `<div class="invh">${title}</div><div class="inv">${ITEMS.filter(it => it.cat === cat).map(it => { const t = ownBest(kid, it.id), a = kid.inv[it.id] || [0, 0, 0, 0], n = t ? a[t] : 0;
    return t ? `<div class="it">${itemSVG(it.id, t)}<span class="cnt">×${n}</span>${itemName(it.id, t)}${t < 3 ? `<span class="pg">${[0, 1, 2].map(k => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</span>` : ''}</div>` : `<div class="it none">${itemSVG(it.id, 1)}?</div>`; }).join('')}</div>`;
  modal(`<h2>보물 상자</h2>${kidTabs('bagk')}<p>지금까지 모은 선물이에요<br>똑같은 게 3개 모이면 더 특별해져요<br>악세사리는 방에 있는 옷장에서 갈아입혀요</p>${sec('acc', '악세사리')}${sec('snack', '특별한 간식')}${sec('toy', '장난감')}<button class="btn y" data-act="close">닫기</button>`);
}

function rParent() {
  const multi = S.kids.length > 1, nx = p => session(p).label;
  modal(`<h2 data-act="devtap">관리자 옵션</h2>${NEWV ? `<p><a class="btn y" href="${UPD.page}">새 버전이 나왔어요 · 받으러 가기</a></p>` : ''}
  <div class="amt">${amtRows(S, 'set')}</div><p>${amtNote(S)}</p>
  <div class="names">${S.kids.map((k, i) => `<div class="nrow"><input class="tin sm3" maxlength="8" value="${k.name || ''}" placeholder="${KDEF[i]}" data-k="${i}" data-f="kid" aria-label="아이 이름"><span>의 동물</span><input class="tin sm3" maxlength="8" value="${k.pet.name}" data-k="${i}" data-f="pet" aria-label="동물 이름"></div>`).join('')}</div><p style="opacity:.7">이름은 눌러서 바꿀 수 있어요</p>
  <div class="pchgs">${S.kids.map((k, i) => `<button class="sm pchgb" data-act="petchg" data-k="${i}"><i>${petSVG(k.pet.sp, k.pet.vi, 'happy')}</i>${k.pet.name} 모습 바꾸기</button>`).join('')}</div>
  ${multi ? `<p>아이 ${S.kids.length}명 · ${S.mode === 'together' ? '공부는 같이, 동물은 각자' : '공부도 각자, 동물도 각자'}<br><span style="opacity:.7">이 방식을 바꾸려면 아래 '처음부터 다시'로 새로 정해요</span></p>` : ''}
  <p>${S.mode === 'separate' ? S.kids.map(k => `${kname(k)}: ${k.idx}번 함 · 다음 ${nx(k)}`).join('<br>') : `지금까지 ${S.idx}번 공부했어요<br>다음 문장: ${nx(S)}`}</p>
  <div class="arow"><span>배경 음악 <small>문장 공부·친구들 방</small></span><div class="seg"><button class="${bgmOn() ? 'on' : ''}" data-act="set" data-f="bgm" data-n="1">켜기</button><button class="${bgmOn() ? '' : 'on'}" data-act="set" data-f="bgm" data-n="0">끄기</button></div></div>
  <p>단어 카드 빠르기 · 조금씩만 달라져요</p><div class="row"><button class="sm" data-act="tempo" data-d="-1">더 느리게</button><b class="tdots">${[-2, -1, 0, 1, 2].map(i => `<i class="${i === ((S.tempo || 0)) ? 'on' : ''}"></i>`).join('')}</b><button class="sm" data-act="tempo" data-d="1">더 빠르게</button></div>
  <p>단어 카드 발음 박자 맞추기<br>발음이 박수보다 늦으면 '더 빨리'</p><div class="row"><button class="sm" data-act="lag" data-d="50">더 빨리</button><b style="min-width:4.500em">${(S.lagAdj || 0) > 0 ? '+' : ''}${S.lagAdj || 0}</b><button class="sm" data-act="lag" data-d="-50">더 늦게</button></div>
  ${DEV() ? `<div class="testbox"><p>시험용 단추</p><div class="row"><button class="sm" data-act="nextday">다음 날로 넘기기</button><button class="sm" data-act="givegift">선물 상자 받기</button></div></div>` : ''}
  <p>관리자 비밀번호<br>오늘 공부를 마친 뒤 '한 번 더'를 열어 줄 때 써요</p><div class="row"><button class="sm" data-act="pinset">${S.pin ? '비밀번호 바꾸기' : '비밀번호 정하기'}</button></div>
  <div class="row"><button class="sm" data-act="reset">처음부터 다시 (동물·기록 지우기)</button></div><p style="opacity:.6">${APPNAME} ${NATIVE && Android.appVersion ? 'v' + Android.appVersion() : ''}<br><small>문장 공부 음악: “Life of Riley” Kevin MacLeod<br>incompetech.com · CC BY 4.0<br>작고 부드럽게 다듬어 썼어요</small></p>
  <button class="btn y" data-act="close">닫기</button>`);
}

function rPetChg(ki, sp) {
  const kid = S.kids[ki]; sp = sp || kid.pet.sp;
  modal(`<h2>${kid.pet.name} 모습 바꾸기</h2><p><span class="ln">모습만 바뀌어요</span><span class="ln">이름·선물·기록은 그대로예요</span></p>
  <div class="seg">${Object.keys(PETS).map(x => `<button class="${x === sp ? 'on' : ''}" data-act="petchg" data-k="${ki}" data-ps="${x}">${PETS[x].name}</button>`).join('')}</div>
  <div class="pchg">${PETS[sp].vars.map((v, i) => `<button class="${sp === kid.pet.sp && i === kid.pet.vi ? 'on' : ''}" data-act="petset" data-k="${ki}" data-ps="${sp}" data-pv="${i}">${petSVG(sp, i)}<span>${v.name}</span></button>`).join('')}</div>
  <button class="btn y" data-act="petback">돌아가기</button>`);
}

let SES = null;

const LV1 = [1, 2, 3, 4, 6, 7, 9, 11, 12, 18, 19, 24, 28, 32, 42, 47, 49], LV3 = [10, 13, 15, 25, 27, 30, 40];
const dayLv = i => LV1.includes(i + 1) ? 1 : LV3.includes(i + 1) ? 3 : 2;
const lvOf = p => clamp(p.lv || 1, 1, 3), lvDays = lv => DATA.days.map((d, i) => i).filter(i => dayLv(i) === lv);
const STARS = n => '★'.repeat(n);
const lvEx = lv => [...new Set(lvDays(lv).map(i => DATA.days[i].label))].slice(0, lv === 3 ? 3 : 4).join(' · ');
function lvAsk() {
  const p = PG(); if (!p.ask || $('ov')) return false; const lv = lvOf(p), nxt = lv < 3 ? lv + 1 : 1;
  modal(`<div class="lvask"><h1>어른을 불러 봐!</h1><p>별 ${lv}개 표현을 다 했어요<br>다음에는 무엇을 할까요?</p>
    <button class="btn big" data-act="lvset" data-n="${lv}"><b>${STARS(lv)} 한 번 더</b><small>${lvEx(lv)}</small></button>
    <button class="btn y big" data-act="lvset" data-n="${nxt}"><b>${STARS(nxt)} ${lv < 3 ? '다음 단계로' : '처음 단계부터 다시'}</b><small>${lvEx(nxt)}</small></button></div>`);
  sfx('fanfare'); koSay('어른을 불러 봐!'); return true;
}
function session(p) {
  const lv = lvOf(p), seq = lvDays(lv), li = (p.li || 0) % seq.length;
  const key = S.mode + S.cur + '|' + lv + '.' + (p.li || 0) + '|' + S.ns; if (SES && SES.key === key) return SES;
  const n = seq.length, i0 = seq[li], wm = p.wm || {}, ds = [i0];
  [1, 3].slice(0, (S.ns || 6) / 3 - 1).forEach((back, j) => { let q = li >= back ? li - back : li + 1 + j, k = seq[q % n]; while (ds.includes(k)) k = seq[++q % n]; ds.push(k); });
  const sents = [], cards = [], add = c => { if (c && !cards.some(x => x[0] === c[0])) cards.push(c); };
  ds.forEach(di => { const d = DATA.days[di], pick = d.sents.map((x, j) => [wm[x.c] || 0, j, x]).sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, 3).sort((a, b) => a[1] - b[1]).map(x => x[2]);
    add(d.flash[0]); pick.forEach(x => { sents.push(x); add(d.flash.find(f => f[0] === x.c)); }); });
  return SES = { key, cards, sents, label: ds.map((di, j) => DATA.days[di].label + (j ? ' (복습)' : '')).join(' + ') };
}

const ACSKIP = new Set(['#3B3340', '#4A3530', '#FFD9B8', '#F79AA8', '#FFFFFF', '#CFE6C2', '#8FD3FF', '#5C6E9E', '#6B4A3A', '#FFF0B8', '#FFF1DE', '#D9D2DC', '#F2B33D']), acCache = {};
function accent(pid) {
  if (acCache[pid]) return acCache[pid]; const cnt = {}, hx = (c, i) => parseInt(c.slice(i, i + 2), 16);
  for (const m of DATA.pics[pid].matchAll(/fill="(#[0-9A-Fa-f]{6})"/g)) { const c = m[1].toUpperCase(), v = [hx(c, 1), hx(c, 3), hx(c, 5)]; if (ACSKIP.has(c) || Math.max(...v) - Math.min(...v) < 45) continue; cnt[c] = (cnt[c] || 0) + 1; }
  const top = Object.entries(cnt).sort((a, b) => b[1] - a[1])[0], c = (DATA.ac && DATA.ac[pid]) || (DATA.ac ? '#4FA3E0' : top ? top[0] : '#4FA3E0'), mix = (t, k) => '#' + [1, 3, 5].map(i => Math.round(hx(c, i) * (1 - k) + t * k).toString(16).padStart(2, '0')).join('');
  return acCache[pid] = `--ac:${c};--acd:${mix(40, .34)};--acl:${mix(255, .62)}`;
}

const MOTIF = {
  heart: `<path d="M0 34 Q-44 4 -36 -18 Q-28 -38 -10 -28 Q-2 -24 0 -14 Q2 -24 10 -28 Q28 -38 36 -18 Q44 4 0 34 Z"/>`,
  star: `<path d="M0 -40 L11 -13 L40 -11 L18 8 L25 37 L0 21 L-25 37 L-18 8 L-40 -11 L-11 -13 Z" stroke="currentColor" stroke-width="8" stroke-linejoin="round"/>`,
  cloud: `<circle cx="-22" cy="8" r="17"/><circle cx="2" cy="-6" r="22"/><circle cx="26" cy="9" r="15"/><rect x="-22" y="4" width="48" height="21" rx="10"/>`,
  moon: `<path d="M8 -37 A37 37 0 1 0 36 12 A29 29 0 1 1 8 -37 Z" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>`,
};
const MKIND = ['heart', 'star', 'cloud', 'moon'];
const DSPOT = [[11, 17, -14, 8.500], [27, 11, 10, 4.500], [89, 16, 12, 6.500], [12, 85, 10, 5.500], [74, 90, -8, 4.500], [88, 81, -10, 8]];
function decoHTML(word) { let h = 0; for (const c of word) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const a = MKIND[h % 4], b = MKIND[(h % 4 + 1 + (h >>> 2) % 3) % 4], pick = i => [a, b, b, a, b, a][i];
  return `<div class="deco">${DSPOT.map(([x, y, r, s], i) => { const k = pick(i); return `<i style="left:${x}%;top:${y}%;width:${s}%;--r:${k === 'cloud' ? r * .3 : r}deg;animation-delay:${i * .06}s"><svg viewBox="-50 -50 100 100" fill="currentColor">${MOTIF[k]}</svg></i>`; }).join('')}</div>`; }

let QW = new Set();
const QSEC = 5, QSECW = 3, bpm = () => 86 + clamp((S && S.tempo) || 0, -2, 2) * 5, tf = () => 86 / bpm() * 1.12;
const quizOn = o => (o || S).quiz !== 0;
const QBAR = `<div class="qbar" id="qbar"><i></i></div>`;
let timers = [];
function at(t, fn, my) { timers.push(setTimeout(() => { if (my === RUN) fn(); }, Math.max(0, (t - now()) * 1000))); }
function stopAll() { RUN++; timers.forEach(clearTimeout); timers = []; hush(); bgStop(); }
const DEV = () => /[?&]test\b/.test(location.search) || !!(S && S.dev);
const hdr = (title, n, i) => `<div class="hd"><button class="sm" data-act="quit">× 그만</button><span class="ttl">${title}</span><div class="dots">${[...Array(n)].map((_, k) => `<i class="${k < i ? 'ok' : k === i ? 'on' : ''}"></i>`).join('')}</div>${DEV() ? '<button class="sm" data-act="skip">건너뛰기 ▶▶</button>' : '<span style="width:3em"></span>'}</div>`;
async function runFlash() {
  stopAll(); const my = RUN; view = 'flash'; audio(); const cards = session(PG()).cards; voReady(cards.map(c => c[0]), 1);
  for (let ci = 0; ci < cards.length; ci++) {
    const [w, pid] = cards[ci];
    app.innerHTML = hdr('단어 카드', cards.length, ci) + `<div class="stage" style="${accent(pid)}"><div class="cardbox"><div class="card" id="card"><div class="face front"><div class="pic">${DATA.pics[pid]}</div></div><div class="face back">${decoHTML(w)}<span class="word" style="--wl:${w.length}">${w}</span></div></div></div>
      <div class="beat" id="beat"><span class="bt">${CLAP}</span><span class="bt">${CLAP}</span><span class="bt sp">${MOUTH}</span><span class="bt"></span></div><div class="reads" id="reads"></div><div class="state" id="state"></div></div>`;
    let n = 0; const reads = () => { const e = $('reads'); if (e) e.innerHTML = [1, 2, 3, 4].map(i => `<span class="${i <= n ? 'on' : ''}">${i}</span>`).join(''); };
    const state = t => { const e = $('state'); if (e) e.innerHTML = t ? `<span class="tag">${t}</span>` : ''; };
    const side = b => { const e = $('card'); if (e) e.classList.toggle('flip', b); };
    const glow = on => { document.querySelectorAll('.face').forEach(f => f.classList.toggle('sayg', on)); const c = $('card'); if (on && c) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } };
    const beatOn = i => { const e = $('beat'); if (e) [...e.children].forEach((b, j) => b.classList.toggle('on', j === i)); };
    const BEAT = 60 / bpm(), T = tf();
    reads(); state('그림을 보고 들어요'); await Promise.all([sleep(550 * T), voReady([w], 1800)]); if (my !== RUN) return;
    glow(true); await sayEn(w); glow(false); n++; reads(); if (my !== RUN) return; await sleep(450 * T); if (my !== RUN) return;
    state('뒤집으면 글자!'); side(true); await sleep(700 * T); if (my !== RUN) return;
    glow(true); await sayEn(w); glow(false); n++; reads(); if (my !== RUN) return; await sleep(350 * T); if (my !== RUN) return;
    state('박수 짝짝! 같이 말해요');
    if (ac) {
      const t0 = now() + .5;
      for (let bar = 0; bar < 2; bar++) { const tb = t0 + bar * 4 * BEAT, ws = bar % 2 === 1; at(tb - BEAT * .35, () => side(ws), my);
        for (let b = 0; b < 4; b++) { const t = tb + b * BEAT; if (b < 2) clap(t); at(t, () => beatOn(b), my); }
        if (VO[vslug(w)]) at(tb + 2 * BEAT - .3, () => voAt(w, tb + 2 * BEAT - (S.lagAdj || 0) / 1000, true), my);
        else at(tb + 2 * BEAT - sayLead(), () => { speak(w, 'en', .9); }, my); at(tb + 2 * BEAT, () => { glow(true); n++; reads(); }, my); at(tb + 3 * BEAT, () => glow(false), my); }
      const tend = t0 + 2 * 4 * BEAT; await sleep((tend - now()) * 1000 + 100);
    } else { for (let k = 0; k < 2; k++) { side(k % 2 === 1); await sleep(500); if (my !== RUN) return; glow(true); await sayEn(w); glow(false); n++; reads(); if (my !== RUN) return; } }
    if (my !== RUN) return; beatOn(-1); state('잘했어요!'); sfx('ok'); await sleep(900 * T); if (my !== RUN) return;
  }

  const qs = quizOn() ? cards.map((c, i) => i).sort(() => Math.random() - .5).slice(0, 2) : []; QW = new Set(qs.map(i => cards[i][0]));
  for (let qi = 0; qi < qs.length; qi++) {
    const [w, pid] = cards[qs[qi]];
    app.innerHTML = hdr('이 그림은 뭘까?', qs.length, qi) + `<div class="stage" style="${accent(pid)}"><div class="cardbox"><div class="card" id="card"><div class="face front"><div class="pic">${DATA.pics[pid]}</div></div><div class="face back">${decoHTML(w)}<span class="word" style="--wl:${w.length}">${w}</span></div></div></div>${QBAR}<div class="state"><span class="tag q">이 그림은 뭘까?</span></div></div>`;
    sfx('pop'); await koSay('이 그림은 뭘까?'); if (my !== RUN) return;
    $('qbar').firstElementChild.style.animationDuration = QSECW + 's'; $('qbar').classList.add('go'); await sleep(QSECW * 1000); if (my !== RUN) return;
    $('card').classList.add('flip'); sfx('ok'); await sleep(600); if (my !== RUN) return; await sayEn(w); if (my !== RUN) return; await sleep(900); if (my !== RUN) return;
  }
  toSent(my);
}
async function toSent(my) {
  app.innerHTML = `<div class="cheer"><div class="stars">${STAR}</div><h1>이제 문장으로 말해 봐요</h1></div>`; sfx('ok'); await koSay('이제 문장으로 말해 봐요'); await sleep(400); if (my !== RUN) return; runSent();
}

let lastPr = '';
const praise = () => { let p; do p = rnd(PRAISE); while (p === lastPr); return lastPr = p; };
async function runSent() {
  stopAll(); const my = RUN; view = 'sent'; audio(); const ss = session(PG()).sents;
  for (let si = 0; si < ss.length; si++) {
    const s = ss[si]; voReady(s.w.map(w => w[0]).concat([s.t]), 1);
    app.innerHTML = hdr('문장 말하기', ss.length, si) + `<div class="stage"><div class="sstage"><div class="wcards" id="wcs">${s.w.map(([t, pid], i) => (i ? '<span class="plus">+</span>' : '') + `<div class="wc"><div class="pic">${DATA.pics[pid]}</div><b>${t}</b></div>`).join('')}</div>
      <div class="scene" id="scene"><div class="pic">${DATA.pics[s.s]}</div></div></div><div class="sline" id="sline">${s.w.map(([t], i) => i === 2 ? `<span class="hl">${t}</span>` : t).join(' ')}${s.p || '.'}</div><div class="state" id="state"></div></div>`;
    const state = t => { const e = $('state'); if (e) e.innerHTML = t ? `<span class="tag">${t}</span>` : ''; };
    const box = $('wcs'), sc = $('scene'), sl = $('sline'), wcs = [...box.querySelectorAll('.wc')], pl = [...box.querySelectorAll('.plus')];
    const ok = () => my === RUN && box.isConnected;
    const toScene = async () => { box.classList.add('merge'); sfx('merge'); await sleep(430); if (!ok()) return; sc.classList.add('in'); sl.classList.add('in'); await sleep(450); };

    state('잘 들어 봐요'); await sleep(350); if (!ok()) return;
    for (let i = 0; i < wcs.length; i++) { if (i) pl[i - 1].classList.add('in'); wcs[i].classList.add('in', 'now'); sfx('pop'); await sleep(200); if (!ok()) return; await sayEn(s.w[i][0], .78); if (!ok()) return; wcs[i].classList.remove('now'); await sleep(220); if (!ok()) return; }
    await sleep(250); if (!ok()) return; await toScene(); if (!ok()) return; await sayEn(s.t, .8); if (!ok()) return;
    await sleep(900); if (!ok()) return;

    state('따라 해 봐!'); await sleep(700); if (!ok()) return;
    sc.classList.remove('in'); box.classList.remove('merge'); wcs.forEach(w => { w.classList.add('in'); w.classList.remove('now'); }); pl.forEach(p => p.classList.add('in')); sl.classList.add('in'); sfx('pop'); await sleep(650); if (!ok()) return;
    wcs.forEach(w => w.classList.add('now')); await sayEn(s.t, .8); if (!ok()) return; wcs.forEach(w => w.classList.remove('now'));
    await sleep(1500); if (!ok()) return;
    await toScene(); if (!ok()) return; await sayEn(s.t, .8); if (!ok()) return;
    await sleep(1500); if (!ok()) return;
    const pr = praise(); state(pr); sfx('ok'); await sleep(250); if (!ok()) return; await koSay(pr); if (!ok()) return; await sleep(1100); if (!ok()) return;
  }

  const qs = []; if (quizOn()) { const fr = x => String(x.id).split('.')[0], order = ss.map((c, i) => i).sort(() => Math.random() - .5);
    for (const lv of [0, 1, 2, 3]) for (const i of order) { if (qs.length >= 2 || qs.includes(i)) continue;
      if (qs.every(j => (lv > 2 || ss[j].c !== ss[i].c) && (lv > 1 || fr(ss[j]) !== fr(ss[i]))) && (lv > 0 || !QW.has(ss[i].c))) qs.push(i); }
    qs.sort((a, b) => a - b); }
  for (let qi = 0; qi < qs.length; qi++) {
    const s = ss[qs[qi]];
    app.innerHTML = hdr('이 그림은 뭘까?', qs.length, qi) + `<div class="stage"><div class="sstage"><div class="scene in"><div class="pic">${DATA.pics[s.s]}</div></div></div><div class="sline" id="sline">${s.w.map(([t], i) => i === 2 ? `<span class="hl">${t}</span>` : t).join(' ')}${s.p || '.'}</div>${QBAR}<div class="state"><span class="tag q">이 그림은 뭘까?</span></div></div>`;
    sfx('pop'); await koSay('이 그림은 뭘까?'); if (my !== RUN) return;
    $('qbar').classList.add('go'); await sleep(QSEC * 1000); if (my !== RUN) return;
    $('sline').classList.add('in'); sfx('ok'); await sleep(400); if (my !== RUN) return; await sayEn(s.t, .8); if (my !== RUN) return; await sleep(1100); if (my !== RUN) return;
  }
  finishStudy();
}
async function finishStudy() {
  stopAll(); const my = RUN; view = 'cheer'; const p = PG(), kids = shown(), multi = kids.length > 1;
  const ses = session(p); p.wm = p.wm || {}; ses.cards.forEach(c => { p.wm[c[0]] = Math.min(10, (p.wm[c[0]] || 0) + 1); });
  p.ls = (p.ls || []).filter(id => !ses.sents.some(x => x.id === id)).concat(ses.sents.map(x => x.id)).slice(-240); SES = null;
  const wasExtra = p.done >= S.per; if (!p.done) p.days = (p.days || 0) + 1;
  p.done++; p.idx++; p.li = (p.li || 0) + 1; if (p.li >= lvDays(lvOf(p)).length) { p.li = 0; p.ask = 1; } p.t1 = Date.now(); if (wasExtra) p.extra = 0; kids.forEach(k => { k.care = { feed: 0, pet: 0, water: 0, play: 0 }; }); POS.clear(); save();
  const key = (() => { const t = nowD(); return ymd(t.getFullYear(), t.getMonth() + 1, t.getDate()); })();
  if (p.done >= S.per && !(p.st && p.st[key] != null)) { await stampToday(my); if (my !== RUN) return; }
  else {
    app.innerHTML = `<div class="cheer"><div class="stars">${STAR}${STAR}${STAR}</div><h1>참 잘했어요!</h1><div class="bigpet multi">${kids.map(k => petSVG(k.pet.sp, k.pet.vi, 'happy', wearNow(k))).join('')}</div></div>`;
    sfx('fanfare'); await koSay('참 잘했어요!'); await sleep(900); if (my !== RUN) return;
  }
  const n0 = kids[0].pet.name; if (multi) { S.turn = ((S.turn == null ? -1 : S.turn) + 1) % kids.length; save(); }
  rHome(); bubble('배고파요, 돌봐 주세요!', 3000); await koSay('배고파요, 돌봐 주세요!'); if (view !== 'home') return; await koSay(multi ? '이제 친구들을 돌봐 주자' : named(n0) ? '이제 ' + jo(n0, '을', '를') + ' 돌봐 주자' : '이제 친구를 돌봐 주자', '이제 친구를 돌봐 주자'); await sleep(300); if (view !== 'home' || !S || !inCare()) return; if (multi) { await turnSay(activeKid(), true); await sleep(300); } if (view === 'home' && S && inCare() && !DRS.size) careHint('feed');
}

const FRIC = `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2.500" fill="none" stroke="currentColor" stroke-width="2.600"/><path d="M6.500 16.500 l4-5 3 3.500 2-2.500 2.500 4z" fill="currentColor"/><circle cx="15.500" cy="9" r="1.600" fill="currentColor"/></svg>`;
const CROWN = `<svg class="crown" viewBox="0 0 40 26" aria-hidden="true"><path d="M4 22 L2 6 L12 13 L20 2 L28 13 L38 6 L36 22 Z" fill="#FFD84D" stroke="#B8860B" stroke-width="2.500" stroke-linejoin="round"/><circle cx="20" cy="15" r="2.600" fill="#F2556A"/><circle cx="11" cy="17" r="2" fill="#7FB7E6"/><circle cx="29" cy="17" r="2" fill="#8CCB7C"/></svg>`;
const WALLS = ['#D9E8CF', '#F6DEDA', '#D7E5F2', '#EADFF2', '#FBE8C6', '#D5ECE6'];
function rMuseum() {
  stopAll(); view = 'museum'; const p = PG(), wm = p.wm || {}; let met = 0, tot = 0;
  const body = DATA.mus.map(([g, ws], gi) => { let m = 0; const cells = ws.map(([w, pid]) => { const n = Math.min(10, wm[w] || 0); tot++; if (n) { met++; m++; }
    return `<button class="fr f${n}" data-act="mword" data-w="${w}" data-n="${n}" style="${n ? accent(pid) : ''}"><span class="fw"><span class="in"><span class="pic">${DATA.pics[pid]}</span></span>${n >= 8 ? '<i class="gem a"></i><i class="gem b"></i>' : ''}${n >= 10 ? CROWN : ''}${n ? `<em>${n >= 10 ? '★' : n}</em>` : ''}</span><b style="--wl:${w.length}">${w}</b></button>`; }).join('');
    return `<section class="mroom" style="--wall:${WALLS[gi % WALLS.length]}"><h2><small>제${gi + 1}전시실</small><span>${g}</span><i>${m} / ${ws.length}</i></h2><div class="mgrid">${cells}</div><div class="mfloor"></div></section>`; }).join('');
  app.innerHTML = `<div class="mus"><div class="hd"><button class="sm ic" data-act="quit">${HOMEIC}홈</button><span class="ttl">${FRIC}낱말 미술관</span><span class="mcount"><b>${met}</b> / ${tot}</span></div><div class="mscroll"><p class="mhelp"><span class="ln">공부에서 만난 낱말은 색이 들어와요</span><span class="ln">만날 때마다 액자가 조금씩 화려해져요 (열 번까지)</span></p>${body}</div></div>`;
}
function museumTap(b) { const w = b.dataset.w, n = +b.dataset.n; b.classList.remove('hop'); void b.offsetWidth; b.classList.add('hop'); audio(); sayEn(w, .9); }

let PIN = null;
function pinOpen(mode, then, skip) { PIN = { mode, buf: '', first: '', then, skip, err: '' }; rPin(); }
function rPin() {
  const T = { ask: ['부모 비밀번호', '숫자 4자리를 눌러 주세요'], old: ['지금 비밀번호', '바꾸기 전에 한 번 확인해요'], new1: ['관리자 비밀번호 만들기', "숫자 4자리 · 공부를 마친 뒤 '한 번 더'를 열어 줄 때 써요"], new2: ['한 번 더 눌러 주세요', '같은 숫자 4자리'] }[PIN.mode];
  modal(`<h2>${T[0]}</h2><p class="${PIN.err ? 'perr' : ''}">${PIN.err || T[1]}</p><div class="pdots">${[0, 1, 2, 3].map(i => `<i class="${i < PIN.buf.length ? 'on' : ''}"></i>`).join('')}</div>
  <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-act="pin" data-n="${n}">${n}</button>`).join('')}<button class="s" data-act="pinx">${PIN.skip ? '나중에' : '취소'}</button><button data-act="pin" data-n="0">0</button><button class="s" data-act="pindel">지우기</button></div>`);
}
function pinKey(n) {
  if (!PIN) return; PIN.err = ''; PIN.buf += n; if (PIN.buf.length < 4) return rPin(); const v = PIN.buf; PIN.buf = '';
  if (PIN.mode === 'ask' || PIN.mode === 'old') { if (v !== S.pin) { PIN.err = '비밀번호가 달라요. 다시 눌러 주세요'; return rPin(); } if (PIN.mode === 'old') { PIN.mode = 'new1'; return rPin(); } const t = PIN.then; PIN = null; closeModal(); return t(); }
  if (PIN.mode === 'new1') { PIN.first = v; PIN.mode = 'new2'; return rPin(); }
  if (v !== PIN.first) { PIN.mode = 'new1'; PIN.err = '두 번이 서로 달라요. 처음부터 다시 눌러 주세요'; return rPin(); }
  const t = PIN.then; PIN = null; closeModal(); t(v);
}
function unlockMore() { const p = PG(); if (p.done >= S.per) p.extra = 1; else p.t1 = 0; save(); closeModal(); sfx('ok'); if (view === 'hub') rHub(); else rHome(); }

let LSN = { native: false }, wakeL = null;

function learned(p) {
  const all = {}; DATA.days.forEach(d => d.sents.forEach(x => { all[x.id] = x; }));
  let out = (p.ls || []).map(id => all[id]).filter(Boolean).reverse();
  if (!out.length && p.idx > 0) { const n = Math.min(p.idx, DATA.days.length); for (let i = n - 1; i >= 0; i--) out = out.concat(DATA.days[i].sents.slice(0, 3)); }
  return out.length ? out : session(p).sents; }
function listenArt() {
  const cloud = (x, y, k) => `<g transform="translate(${x} ${y}) scale(${k})"><path d="M-46 14 Q-66 14 -62 -4 Q-58 -20 -40 -16 Q-34 -40 -8 -36 Q14 -34 18 -16 Q40 -22 48 -4 Q54 14 34 14 Z" fill="#FFFFFF" stroke="#C5DCEB" stroke-width="5" stroke-linejoin="round"/></g>`;
  const flower = (x, y, c, d) => `<g transform="translate(${x} ${y})"><path d="M0 0 V26" stroke="#7DB970" stroke-width="5" stroke-linecap="round"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-10" rx="6.500" ry="9" fill="${c}" stroke="${d}" stroke-width="2.500" transform="rotate(${a})"/>`).join('')}<circle r="5" fill="#FFE08A" stroke="#E9B84A" stroke-width="2"/></g>`;
  const note = (x, y, r, c) => `<g transform="translate(${x} ${y}) rotate(${r})" fill="${c}"><path d="M-4 16 V-18 L16 -24 V10" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="-11" cy="16" rx="8" ry="6"/><ellipse cx="9" cy="10" rx="8" ry="6"/></g>`;
  return `<svg class="lart" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="800" height="600" fill="#DFF1FA"/><g filter="url(#crw)">
    <circle cx="462" cy="106" r="38" fill="#FFE08A" stroke="#E9B84A" stroke-width="5"/><path d="${[...Array(10)].map((_, i) => { const a = i * Math.PI / 5; return `M${(462 + 52 * Math.cos(a)).toFixed(1)} ${(106 + 52 * Math.sin(a)).toFixed(1)} L${(462 + 66 * Math.cos(a)).toFixed(1)} ${(106 + 66 * Math.sin(a)).toFixed(1)}`; }).join(' ')}" stroke="#E9B84A" stroke-width="6" stroke-linecap="round" fill="none"/>
    ${cloud(318, 196, .9)}${cloud(120, 90, 1.2)}${cloud(690, 200, 1.1)}${cloud(486, 258, .55)}
    <path d="M-20 420 Q160 330 360 400 T820 370 V620 H-20 Z" fill="#C9E8BC" stroke="#98CC8A" stroke-width="5"/>
    <g transform="translate(140 372)"><rect x="-11" y="-10" width="22" height="70" rx="8" fill="#C79A6B" stroke="#A67B4E" stroke-width="4"/><circle cx="0" cy="-48" r="52" fill="#9FD48F" stroke="#72B463" stroke-width="5"/><circle cx="-34" cy="-20" r="30" fill="#9FD48F" stroke="#72B463" stroke-width="5"/><circle cx="34" cy="-22" r="32" fill="#9FD48F" stroke="#72B463" stroke-width="5"/><circle cx="0" cy="-36" r="40" fill="#9FD48F"/></g>
    <g transform="translate(680 380)"><rect x="-9" y="-6" width="18" height="56" rx="7" fill="#C79A6B" stroke="#A67B4E" stroke-width="4"/><circle cx="0" cy="-36" r="42" fill="#B4DE9E" stroke="#84C272" stroke-width="5"/></g>
    <path d="M-20 500 Q220 430 430 480 T820 460 V620 H-20 Z" fill="#AEDD9E" stroke="#7DBF6E" stroke-width="5"/>
    ${flower(292, 500, '#FFB3C7', '#E88AA4')}${flower(322, 540, '#FFFFFF', '#D8CFC2')}${flower(498, 512, '#C9B6F2', '#A78FDE')}${flower(540, 548, '#FFB3C7', '#E88AA4')}${flower(90, 520, '#FFFFFF', '#D8CFC2')}${flower(720, 528, '#C9B6F2', '#A78FDE')}
    ${note(300, 330, -12, '#F28CA8')}${note(505, 318, 10, '#7FB7E6')}${note(404, 262, 0, '#F2B33D')}
  </g></svg>`;
}
function drawListen() {
  const v = LSN.video, kids = shown();
  app.innerHTML = `<div class="lsn ${v ? 'von' : 'voff'}">${v ? '' : `<div class="lbg">${listenArt()}<div class="lpets">${kids.map(k => `<i>${petSVG(k.pet.sp, k.pet.vi, 'happy', wearNow(k))}</i>`).join('')}</div></div>`}
    <div class="hd"><button class="sm" data-act="lquit">× 그만</button><span class="ttl">${EAR}듣기 모드</span><div class="vt" role="group" aria-label="영상"><button class="${v ? 'on' : ''}" data-act="lvid" ${v ? 'disabled' : ''}>영상 켜기</button><button class="${v ? '' : 'on'}" data-act="lvid" ${v ? '' : 'disabled'}>영상 끄기</button></div></div>
    ${v ? `<div class="stage" id="lst"></div>` : `<div class="lnote">${LSN.bg ? '화면을 꺼도, 다른 앱을 열어도 계속 들려요' : '화면이 켜져 있는 동안 들려요'}</div>`}</div>`;
  LSN.cur = -1; if (v) showAt(LSN.i, true);
}
function showAt(i, instant) {
  LSN.i = i; if (!LSN.video || view !== 'listen') return; const e = LSN.seq[i], s = LSN.sents[e.si], st = $('lst'); if (!st) return;
  if (LSN.cur !== e.si) { LSN.cur = e.si;
    st.innerHTML = `<div class="sstage"><div class="wcards" id="wcs">${s.w.map(([t, pid], j) => (j ? '<span class="plus">+</span>' : '') + `<div class="wc"><div class="pic">${DATA.pics[pid]}</div><b>${t}</b></div>`).join('')}</div>
      <div class="scene" id="scene"><div class="pic">${DATA.pics[s.s]}</div></div></div><div class="sline" id="sline">${s.w.map(([t], j) => j === 2 ? `<span class="hl">${t}</span>` : t).join(' ')}${s.p || '.'}</div>`; void st.offsetWidth; }
  const box = $('wcs'), sc = $('scene'), sl = $('sline'), wcs = [...box.querySelectorAll('.wc')], pl = [...box.querySelectorAll('.plus')], tok = LSN.tk = (LSN.tk || 0) + 1;
  if (e.wi < 3) { box.classList.remove('merge'); sc.classList.remove('in'); sl.classList.remove('in'); wcs.forEach((w, j) => { w.classList.toggle('in', j <= e.wi); w.classList.toggle('now', j === e.wi); }); pl.forEach((p, j) => p.classList.toggle('in', j < e.wi)); }
  else { wcs.forEach(w => { w.classList.add('in'); w.classList.remove('now'); }); pl.forEach(p => p.classList.add('in')); box.classList.add('merge'); const go = () => { if (LSN.tk === tok && sc.isConnected) { sc.classList.add('in'); sl.classList.add('in'); } }; if (instant) go(); else setTimeout(go, 430); }
}
async function listenLoop(my) {
  let i = LSN.i; while (my === RUN && view === 'listen') {
    if (document.visibilityState !== 'visible') { await sleep(600); continue; }
    const e = LSN.seq[i]; showAt(i); await sleep(e.pre); if (my !== RUN) return; if (document.visibilityState !== 'visible') continue;
    await sayEn(e.t, e.r); if (my !== RUN) return; if (document.visibilityState === 'visible') i = (i + 1) % LSN.seq.length; }
}

function wake(on) {
  if (NATIVE) { try { if (Android.keepScreen) Android.keepScreen(on ? !(LSN.bg && !LSN.video) : true); } catch (e) {} return; }
  try { if (on && navigator.wakeLock && document.visibilityState === 'visible') navigator.wakeLock.request('screen').then(l => { if (wakeL) wakeL.release().catch(() => {}); wakeL = l; }).catch(() => {}); else if (!on && wakeL) { wakeL.release().catch(() => {}); wakeL = null; } } catch (e) {}
}
function rListen() {
  stopAll(); const my = RUN; view = 'listen'; audio(); const sents = learned(PG()), seq = [];
  sents.forEach((s, si) => { s.w.forEach(([t], wi) => seq.push({ t, si, wi, r: .78, pre: wi ? 380 : 1200 })); seq.push({ t: s.t, si, wi: 3, r: .8, pre: 850 }); });
  const bg = NATIVE && !!Android.listenStart; LSN = { my, sents, seq, i: 0, video: S.lv !== 0, native: false, bg, cur: -1, tk: 0 };
  drawListen(); wake(true);
  if (bg) { try { Android.listenStart(JSON.stringify(seq.map(e => [e.t, e.r, e.pre, vslug(e.t)]))); LSN.native = true; } catch (e) {} }
  if (!LSN.native) listenLoop(my);
}
function listenQuit() { if (LSN.native) { try { Android.listenStop(); } catch (e) {} } LSN.native = false; if (view !== 'listen') return; wake(false); stopAll(); rHub(); }

function listenSync() { if (view !== 'listen' || !LSN.native) return; let i = -1; try { i = Android.listenPos(); } catch (e) {} if (i < 0) { LSN.native = false; return listenQuit(); } if (i !== LSN.i) showAt(i % LSN.seq.length, true); }
window.__listenAt = i => { if (view === 'listen' && LSN.native) showAt(+i % LSN.seq.length); };
window.__listenEnd = () => { if (view === 'listen' && LSN.native) { LSN.native = false; listenQuit(); } };
window.__resume = () => { listenSync(); if (view === 'home' && S && !$('ov')) rBar(); if (view === 'hub' && S && !$('ov')) rHub(); };

document.addEventListener('click', e => {
  const b = e.target.closest('[data-kids],[data-mode],[data-sp],[data-vi],[data-who],[data-act]'); if (!b) return; audio(); const ds = b.dataset;
  if (ds.kids) { SU.n = +ds.kids; SU.mode = 'solo'; return SU.n > 1 ? rSetupMode() : rSetupAmt(); }
  if (ds.mode) { SU.mode = ds.mode; return rSetupAmt(); }
  if (ds.sp) { SU.sp = ds.sp; sfx('pop'); return rSetup3(); }
  if (ds.vi) { SU.vi = +ds.vi; SU.name = ''; sfx('pop'); return rSetup4(); }
  if (ds.who) { S.cur = +ds.who; save(); sfx('pop'); hush(); return rHub(); }
  const a = ds.act, kOf = () => ds.k != null ? +ds.k : dlgK;
  if (a === 'backN') return rSetupN();
  if (a === 'su') { SU[ds.f] = +ds.n; return rSetupAmt(); }
  if (a === 'amtok') return pinOpen('new1', v => { SU.pin = v; rSetupKid(); }, () => rSetupKid());
  if (a === 'kidok') { SU.kn = clean($('kn') && $('kn').value) || (SU.n > 1 ? KDEF[SU.pets.length] : '우리 아이'); SU.knRaw = clean($('kn') && $('kn').value); return rSetup2(); }
  if (a === 'namein') { hush(); SU.typing = true; return rSetup4(); }
  if (a === 'nameno') { SU.typing = false; return rSetup4(); }
  if (a === 'nameok') { const v = clean($('pn') && $('pn').value); if (v) SU.name = v; SU.typing = false; return rSetup4(); }
  if (a === 'back2') return rSetup2();
  if (a === 'rename') { const used = SU.pets.map(p => p.name).concat(SU.kids, [SU.kn]); let n; do n = rnd(PET_NAMES); while (n === SU.name || used.includes(n)); SU.name = n; return rSetup4(); }
  if (a === 'begin') { hush(); SU.pets.push({ sp: SU.sp, vi: SU.vi, name: SU.name }); SU.kids.push(SU.knRaw || ''); SU.name = ''; if (SU.pets.length < SU.n) { sfx('ok'); return rSetupKid(); }
    S = { v: 2, mode: SU.mode, per: SU.per, ns: SU.ns, quiz: SU.quiz, kids: SU.pets.map((p, i) => newKid(p, SU.kids[i])), cur: 0, day: '', done: 0, idx: 0, days: 0, st: {}, off: 0, pin: SU.pin || '' }; POS.clear(); save(); sfx('fanfare'); return goHome(); }
  if (a === 'who') { stopAll(); return rWho(); }
  if (a === 'lvset') { const p = PG(); p.lv = clamp(+ds.n, 1, 3); p.li = 0; p.ask = 0; SES = null; save(); closeModal(); sfx('ok'); return view === 'hub' ? rHub() : view === 'home' ? rBar() : null; }
  if (a === 'start') { const p = PG(); if (p.ask) return lvAsk(); if (!canStudy(p) || waitLeft(p)) { if (view === 'hub') { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); sfx('pop'); return; } return rBar(); } return runFlash(); }
  if (a === 'hub') { stopAll(); return goHub(); }
  if (a === 'room') { sfx('pop'); if (!roomOpen()) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); koSay('공부하고 나서 만나요!'); return; } return rHome(); }
  if (a === 'more') return S.pin ? pinOpen('ask', unlockMore) : pinOpen('new1', v => { S.pin = v; save(); unlockMore(); });
  if (a === 'pinset') return S.pin ? pinOpen('old', v => { S.pin = v; save(); sfx('ok'); rParent(); }) : pinOpen('new1', v => { S.pin = v; save(); sfx('ok'); rParent(); });
  if (a === 'pin') return pinKey(ds.n);
  if (a === 'pindel') { PIN.buf = PIN.buf.slice(0, -1); PIN.err = ''; return rPin(); }
  if (a === 'pinx') { const sk = PIN && PIN.skip; PIN = null; closeModal(); if (sk) sk(); return; }
  if (a === 'listen') return rListen();
  if (a === 'museum') return rMuseum();
  if (a === 'mword') return museumTap(b);
  if (a === 'lquit') return listenQuit();
  if (a === 'lvid') { LSN.video = !LSN.video; S.lv = LSN.video ? 1 : 0; save(); drawListen(); wake(true); return; }
  if (a === 'updlater') { S.updSeen = NEWV; save(); return closeModal(); }
  if (a === 'quit') { stopAll(); return rHub(); }
  if (a === 'skip') { if (view === 'flash') { stopAll(); return toSent(RUN); } if (view === 'sent') return finishStudy(); return; }
  if (a === 'feed' || a === 'water') return careHint(a);
  if (a === 'gift') return openGift(+ds.k);
  if (a === 'merge') return showMerge(ds.id, +ds.t, +ds.k);
  if (a === 'giftok') { closeModal(); rHome(); const x = ACT.find(q => q.i === +ds.k); if (x) { setPet(x, 'happy', 2500); hearts(x, 6); } bubble('고마워요!'); const th = koSay('고마워요!'); if (nextAfterGift) { nextAfterGift = false; th.then(() => { if (view === 'home' && inCare() && activeKid()) turnSay(activeKid(), false); }); } return; }
  if (a === 'bag') return rBag(); if (a === 'bagk') return rBag(+ds.k);
  if (a === 'closet') return rCloset(null, true); if (a === 'closetk') return rCloset(+ds.k, true);
  if (a === 'wear' || a === 'unwear') { const kid = S.kids[dlgK]; if (a === 'wear') { const it = ITEM[ds.id]; kid.wear[it.slot] = it.id; } else kid.wear[ds.slot] = null; save(); sfx('pop'); rCloset(dlgK); const x = ACT.find(q => q.i === dlgK); if (x) setPet(x, x.mood); return; }
  if (a === 'cal') return rCal(0); if (a === 'calp') return rCal(-1); if (a === 'caln') return rCal(1);
  if (a === 'win') { if (!dayOver()) { fx('bird', BIRD, -6, 16 + Math.random() * 14, 2600); sfx('tweet'); } return; }
  if (a === 'basket') { const el = $('basket'); el.classList.remove('wig'); void el.offsetWidth; el.classList.add('wig'); sfx('pop'); return; }
  if (a === 'parent') return S.pin ? pinOpen('ask', rParent) : pinOpen('new1', v => { S.pin = v; save(); rParent(); });
  if (a === 'petchg') return rPetChg(+ds.k, ds.ps);
  if (a === 'petset') { const kid = S.kids[+ds.k]; kid.pet.sp = ds.ps; kid.pet.vi = +ds.pv; save(); sfx('ok'); return rParent(); }
  if (a === 'petback') return rParent();
  if (a === 'tempo') { S.tempo = clamp((S.tempo || 0) + +ds.d, -2, 2); save(); return rParent(); }
  if (a === 'lag') { S.lagAdj = clamp((S.lagAdj || 0) + +ds.d, -300, 500); save(); return rParent(); }
  if (a === 'set') { S[ds.f] = +ds.n; SES = null; save(); rParent(); rBar(); return; }
  if (a === 'nextday') { S.off = (S.off || 0) + 1; SES = null; save(); closeModal(); return goHome(); }
  if (a === 'givegift') { shown().forEach(k => { k.giftBox = true; }); save(); closeModal(); return rHome(); }
  if (a === 'devtap') { devN = (devN || 0) + 1; if (devN >= 5) { devN = 0; S.dev = !S.dev; save(); sfx('ok'); rParent(); } return; }
  if (a === 'reset' && !ds.sure) { ds.sure = 1; b.textContent = '정말 다 지울까요? 한 번 더 누르면 지워요'; return; }
  if (a === 'reset') { stopAll(); try { localStorage.removeItem(LS); } catch (_) {} S = null; closeModal(); return setupStart(); }
  if (a === 'close') { closeModal(); if (view === 'who') rWho(); else if (view === 'hub') rHub(); else if (view === 'home') rHome(); return; }
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset && e.target.dataset.ok) { e.preventDefault(); e.target.blur(); const b = document.querySelector(`[data-act="${e.target.dataset.ok}"]`); if (b) b.click(); } });
document.addEventListener('change', e => { const d = e.target.dataset; if (!S || !d || !d.f || d.k == null) return; const k = S.kids[+d.k], v = clean(e.target.value); if (d.f === 'kid') k.name = v; else if (v) k.pet.name = v; else e.target.value = k.pet.name; save(); if (view === 'home') { rHome(); } });
document.addEventListener('visibilitychange', () => { const vis = document.visibilityState === 'visible';
  if (!vis && (view === 'flash' || view === 'sent')) { stopAll(); if (S) rHub(); }
  if (view === 'listen') { if (!vis && !LSN.native) hush(); if (vis) { wake(true); listenSync(); } }
  if (vis && view === 'home' && S && !$('ov')) rBar(); if (vis && view === 'hub' && S && !$('ov')) rHub(); });
let rsT = 0; addEventListener('resize', () => { clearTimeout(rsT); rsT = setTimeout(() => { if (S && view === 'home' && !$('ov') && !DRS.size && !ACT.some(a => a.busy)) rHome(); }, 250); });
migrate(); fixNs(); if (NATIVE && Android.listenStop) { try { Android.listenStop(); } catch (e) {} }
if (S && S.kids && S.kids.length) goHome(); else setupStart();

window.appBack = () => { if ($('ov')) { closeModal(); return true; } if (view === 'listen') { listenQuit(); return true; } if (view === 'museum') { stopAll(); rHub(); return true; } if (view === 'home') { stopAll(); rHub(); return true; } if (view === 'flash' || view === 'sent') { stopAll(); rHome(); return true; } if (view === 'hub' && S && S.mode === 'separate' && S.kids.length > 1) { rWho(); return true; } return false; };

window.__upd = b => { try { const j = JSON.parse(b), me = NATIVE && Android.appVersion ? Android.appVersion() : 0; if (me > 0 && j && j.v > me) { NEWV = j.v; updShow(); } } catch (e) {} };

function updShow() { if (!S || !S.kids) return; const t = document.querySelector('.hub .top'); if (t && !t.querySelector('.upd')) t.querySelector('[data-act=parent]').insertAdjacentHTML('beforebegin', updChip());
  if ((view === 'hub' || view === 'who') && !$('ov') && S.updSeen !== NEWV) modal(`<h2>새 버전이 나왔어요</h2><p>어른께 보여 주세요<br>새로 받아서 설치하면 기록은 그대로 남아요</p><a class="btn y" href="${UPD.page}" data-act="updlater">받으러 가기</a><button class="sm" data-act="updlater">나중에</button>`); }
if (NATIVE && Android.checkUpdate) { try { Android.checkUpdate(UPD.url); } catch (e) {} }

if (!NATIVE && location.protocol === 'https:') setTimeout(async () => { try {
  const m = await (await fetch('voice/_meta.json', { cache: 'no-cache' })).json(), ks = Object.keys(m.files || {}), tag = m.voice + '|' + m.rate + '|' + ks.length;
  if (localStorage.getItem('petstudy.vo') === tag) return; for (const k of ks) await fetch('voice/' + k + '.mp3'); localStorage.setItem('petstudy.vo', tag); } catch (e) {} }, 9000);
if (!NATIVE && location.protocol === 'https:' && 'serviceWorker' in navigator && /\/pet\/app\//.test(location.pathname)) navigator.serviceWorker.register('sw.js').catch(() => {});
