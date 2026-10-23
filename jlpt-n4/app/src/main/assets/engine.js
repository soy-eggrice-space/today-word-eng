/* ================= 공!부!해! N4 — 엔진 (후리가나 · 활용 · 문제 생성) ================= */
'use strict';
const KJ = '[\\u3400-\\u4DBF\\u4E00-\\u9FFF\\uF900-\\uFAFF々〇ヶ]';
const RUBY = new RegExp('(' + KJ + '+)\\(([\\u3041-\\u309F\\u30A0-\\u30FFー]+)\\)', 'g');
const KJ1 = new RegExp(KJ);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const sample = (a, n) => shuffle(a).slice(0, n);
const k2h = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
const h2k = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));

/* ---------- 후리가나 ---------- */
let N5K = new Set();          // N5 한자 (설정이 'n5'면 후리가나 생략)
function initKanjiLevels() { N5K = new Set(DATA.kanji.filter(k => k[4] === 5).map(k => k[0])); }
function surf(s) { return String(s).replace(RUBY, '$1').replace(/[［］]/g, ''); }
function yomi(s) { return String(s).replace(RUBY, '$2').replace(/[［］]/g, ''); }
function speech(s) { return k2h(yomi(s)).replace(/[（(].*?[）)]/g, '').replace(/[・]/g, '、'); }
/* mode: 'all' | 'n5' (N5 한자는 숨김) | 'none' */
function rubyHTML(s, mode) {
  return esc(s).replace(RUBY, (m, k, r) => {
    if (mode === 'none') return k;
    if (mode === 'n5' && [...k].every(c => N5K.has(c))) return k;
    return `<ruby>${k}<rt>${r}</rt></ruby>`;
  });
}
/* 문장 렌더: tgt = 'u'(밑줄) | 'uk'(밑줄+대상 후리가나 숨김) | 'kana'(대상만 히라가나로) | 'blank'(빈칸) | 'plain' */
function sentHTML(s, mode, tgt) {
  const m = String(s).match(/^(.*?)［(.*?)］(.*)$/);
  if (!m) return rubyHTML(s, mode);
  const [, a, t, b] = m;
  let mid;
  if (tgt === 'blank') mid = '<span class="blank">（　　　）</span>';
  else if (tgt === 'kana') mid = `<u>${esc(yomi(t))}</u>`;
  else if (tgt === 'uk') mid = `<u>${esc(surf(t))}</u>`;
  else if (tgt === 'plain') mid = rubyHTML(t, mode);
  else mid = `<u>${rubyHTML(t, mode)}</u>`;
  return rubyHTML(a, mode) + mid + rubyHTML(b, mode);
}
const blankHTML = (s, mode) => rubyHTML(s, mode).replace(/（　）/g, '<span class="blank">（　　　）</span>');

/* ---------- 표기와 읽기 맞추기: 間に合う + まにあう → 間(ま)に合(あ)う ---------- */
function align(w, r) {
  const segs = w.match(new RegExp(KJ + '+|[^\\u3400-\\u9FFF\\uF900-\\uFAFF々〇ヶ]+', 'g')) || [];
  if (!segs.some(x => KJ1.test(x))) return w;
  const rh = k2h(r);
  let re = '^';
  segs.forEach(x => { re += KJ1.test(x) ? '(.+?)' : k2h(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
  const m = rh.match(new RegExp(re + '$'));
  if (!m) return segs.every(x => KJ1.test(x)) ? `${w}(${r})` : w + `(${r})`;
  let i = 1;
  return segs.map(x => KJ1.test(x) ? `${x}(${m[i++]})` : x).join('');
}

/* ---------- 동사·형용사 활용 ---------- */
const ROW = { う: 'わいうえお', く: 'かきくけこ', ぐ: 'がぎぐげご', す: 'さしすせそ', つ: 'たちつてと', ぬ: 'なにぬねの', ぶ: 'ばびぶべぼ', む: 'まみむめも', る: 'らりるれろ' };
const RU_I = new Set(['いらっしゃる', 'おっしゃる', 'なさる', 'くださる', 'ござる']);
const ix = (st, last, i) => st + ROW[last][i];
/* 사전형(표시용 루비 문자열 d, 읽기 r) → 활용형 {key: [표시, 읽기]} */
function vforms(d, r, pos) {
  const F = {};
  const set = (k, a, b) => { F[k] = [a, b]; };
  const rh = k2h(r);
  if (pos === 'vk') {
    const kd = d.includes('来') ? x => `来(${x})` : x => x;
    [['dict', 'く', 'る'], ['renyou', 'き', ''], ['mizen', 'こ', ''], ['te', 'き', 'て'], ['ta', 'き', 'た'], ['e', 'く', 'れ'], ['pot', 'こ', 'られ'], ['pass', 'こ', 'られ'], ['caus', 'こ', 'させ'], ['vol', 'こ', 'よう'], ['imp', 'こ', 'い']]
      .forEach(([k, a, b]) => set(k, kd(a) + b, a + b));
  } else if (pos === 'vsi' || pos === 'vs') {
    const pd = pos === 'vs' ? d : '', pr = pos === 'vs' ? rh : '';
    [['dict', 'する'], ['renyou', 'し'], ['mizen', 'し'], ['te', 'して'], ['ta', 'した'], ['e', 'すれ'], ['pot', 'でき'], ['pass', 'され'], ['caus', 'させ'], ['vol', 'しよう'], ['imp', 'しろ']]
      .forEach(([k, x]) => set(k, pd + x, pr + x));
  } else if (pos === 'v1') {
    const sd = d.slice(0, -1), sr = rh.slice(0, -1);
    [['dict', 'る'], ['renyou', ''], ['mizen', ''], ['te', 'て'], ['ta', 'た'], ['e', 'れ'], ['pot', 'られ'], ['pass', 'られ'], ['caus', 'させ'], ['vol', 'よう'], ['imp', 'ろ']]
      .forEach(([k, x]) => set(k, sd + x, sr + x));
  } else if (pos === 'v5') {
    const last = rh.slice(-1); if (!ROW[last]) return null;
    const sd = d.slice(0, -1), sr = rh.slice(0, -1);
    const iku = /^(行|い)く$/.test(surf(d)) || surf(d).endsWith('行く');
    const special = RU_I.has(rh);
    let te, ta;
    if (iku) { te = 'って'; ta = 'った'; }
    else switch (last) {
      case 'う': case 'つ': case 'る': te = 'って'; ta = 'った'; break;
      case 'む': case 'ぶ': case 'ぬ': te = 'んで'; ta = 'んだ'; break;
      case 'く': te = 'いて'; ta = 'いた'; break;
      case 'ぐ': te = 'いで'; ta = 'いだ'; break;
      case 'す': te = 'して'; ta = 'した'; break;
    }
    const A = ROW[last][0], I = special ? 'い' : ROW[last][1], E = ROW[last][3], O = ROW[last][4];
    [['dict', last], ['renyou', I], ['mizen', A], ['te', te], ['ta', ta], ['e', E], ['pot', E], ['pass', A + 'れ'], ['caus', A + 'せ'], ['vol', O + 'う'], ['imp', special ? 'い' : E]]
      .forEach(([k, x]) => set(k, sd + x, sr + x));
    if (rh === 'ある') { F.mizen = ['', '']; }
  } else return null;
  return F;
}
/* 탐지용 접미 패턴 */
const VPAT = [['masu', 'renyou', 'ま'], ['tai', 'renyou', 'たい'], ['nagara', 'renyou', 'ながら'], ['sou', 'renyou', 'そう'], ['yasui', 'renyou', 'やす'], ['nikui', 'renyou', 'にく'],
['te', 'te', ''], ['ta', 'ta', ''], ['nai', 'mizen', 'な'], ['zu', 'mizen', 'ず'], ['pass', 'pass', ''], ['caus', 'caus', ''], ['ba', 'e', 'ば'], ['pot', 'pot', ''], ['vol', 'vol', ''], ['dict', 'dict', ''], ['renyou', 'renyou', '']];
function formOf(F, key) { const p = VPAT.find(x => x[0] === key); return p ? [F[p[1]][0] + p[2], F[p[1]][1] + p[2]] : null; }
/* 표시 문자열에서 읽기 길이 L 만큼 잘라낸 나머지 (루비 경계가 안 맞으면 null) */
function cutDisp(disp, L) {
  let i = 0, used = 0;
  const re = new RegExp('^(' + KJ + '+)\\(([^)]*)\\)');
  while (used < L && i < disp.length) {
    const m = disp.slice(i).match(re);
    if (m) { used += m[2].length; i += m[0].length; }
    else { used += 1; i += 1; }
  }
  return used === L ? disp.slice(i) : null;
}
/* 단어 ↔ 예문 속 대상 활용형 분석 → {key, rest} */
function analyze(wd, tgt) {
  const w = wd.w.replace('〜', ''), r = k2h(wd.r), p = wd.p, tr = k2h(yomi(tgt)), ts = surf(tgt);
  if (['v5', 'v1', 'vk'].includes(p)) {
    const F = vforms(align(w, wd.r), r, p); if (!F) return null;
    let best = null;
    VPAT.forEach(([key, base, suf]) => { const f = F[base][1] + suf; if (f && tr.startsWith(f) && (!best || f.length > best.len)) best = { key, len: f.length }; });
    if (!best) return null;
    const rest = cutDisp(tgt, best.len); if (rest == null) return null;
    return { key: best.key, rest };
  }
  if (p === 'adj-i') {
    if (w === 'いい') return null;
    const st = r.slice(0, -1); if (!tr.startsWith(st)) return null;
    const rest = cutDisp(tgt, st.length); if (rest == null) return null;
    return { key: 'i', rest };
  }
  if (p === 'adj-na' || p === 'vs') {
    if (!tr.startsWith(r) || !ts.startsWith(w)) return null;
    const rest = cutDisp(tgt, r.length); if (rest == null) return null;
    return { key: p, rest };
  }
  if (['n', 'adv', 'conj'].includes(p)) return ts === w ? { key: p, rest: '' } : null;
  return null;
}
/* 다른 단어를 같은 꼴로 활용 (표시 문자열) */
function conjLike(wd, an) {
  const w = wd.w.replace('〜', ''), d = align(w, wd.r), r = k2h(wd.r);
  if (an.key === 'i') { if (w === 'いい' || wd.p !== 'adj-i') return null; return d.slice(0, -1) + an.rest; }
  if (an.key === 'adj-na' || an.key === 'vs') return d + an.rest;
  if (['n', 'adv', 'conj'].includes(an.key)) return d;
  const F = vforms(d, r, wd.p); if (!F) return null;
  const f = formOf(F, an.key); if (!f || !f[1]) return null;
  return f[0] + an.rest;
}
const VGROUP = p => ['v5', 'v1', 'vk'].includes(p) ? 'v' : p;

/* ---------- 읽기 오답 만들기 (장음·촉음·탁음·요음·ん) ---------- */
const DAKU = { か: 'が', き: 'ぎ', く: 'ぐ', け: 'げ', こ: 'ご', さ: 'ざ', し: 'じ', す: 'ず', せ: 'ぜ', そ: 'ぞ', た: 'だ', ち: 'ぢ', つ: 'づ', て: 'で', と: 'ど', は: 'ば', ひ: 'び', ふ: 'ぶ', へ: 'べ', ほ: 'ぼ' };
const UNDAKU = {}; Object.entries(DAKU).forEach(([a, b]) => UNDAKU[b] = a);
const HAN = { は: 'ぱ', ひ: 'ぴ', ふ: 'ぷ', へ: 'ぺ', ほ: 'ぽ', ば: 'ぱ', び: 'ぴ', ぶ: 'ぷ', べ: 'ぺ', ぼ: 'ぽ' };
const OROW = 'おこごそぞとどのほぼぽもよろょ', EROW = 'えけげせぜてでねへべぺめれ', IROW = 'きぎしじちぢにひびぴみり';
const SOKU_OK = 'かきくけこさしすせそたちつてとぱぴぷぺぽ';
const KANA_TAG = { long: '장음(ー)', soku: '촉음(っ)', daku: '탁음·반탁음', yoon: '요음(ゃゅょ)', n: '발음(ん)', other: '비슷한 단어' };
/* mask[i] = true 인 위치(한자 읽기 부분)만 바꿔요 */
function mutations(r, mask) {
  const out = new Map();
  const add = (s, t) => { if (s && s !== r && !out.has(s) && !/^[っんーゃゅょう]/.test(s) && !/っ$/.test(s) && !/んん|っっ|っん|んっ|っう/.test(s)) out.set(s, t); };
  const A = [...r];
  const M = i => !mask || mask[i];
  const small = { ゃ: 'や', ゅ: 'ゆ', ょ: 'よ' }, big = { や: 'ゃ', ゆ: 'ゅ', よ: 'ょ' };
  for (let i = 0; i < A.length; i++) {
    if (!M(i)) continue;
    const c = A[i], p = A[i - 1], nx = A[i + 1];
    const rep = x => A.slice(0, i).join('') + x + A.slice(i + 1).join('');
    // 장음
    if (c === 'う' && p && (OROW.includes(p) || 'ゅょ'.includes(p))) add(rep(''), 'long');
    if (c === 'い' && p && EROW.includes(p)) add(rep(''), 'long');
    if (c === 'お' && p && OROW.includes(p)) add(rep(''), 'long');
    if ((OROW.includes(c) || 'ゅょ'.includes(c)) && nx !== 'う' && nx !== 'お' && nx && M(i + 1) && !'んっゃゅょー'.includes(nx)) add(rep(c + 'う'), 'long');
    if ((OROW.includes(c) || 'ゅょ'.includes(c)) && nx !== 'う' && (i === A.length - 1 || !M(i + 1)) && A.length > 2) add(rep(c + 'う'), 'long');
    // 촉음
    if (c === 'っ') { add(rep(''), 'soku'); add(rep('つ'), 'soku'); }
    if (i > 0 && SOKU_OK.includes(c) && p !== 'っ' && p !== 'ん' && M(i - 1) && !'ゃゅょ'.includes(nx || '')) add(rep('っ' + c), 'soku');
    if ((c === 'つ' || c === 'く' || c === 'ち') && nx && SOKU_OK.includes(nx) && M(i + 1)) add(rep('っ'), 'soku');
    // 탁음
    if (DAKU[c]) add(rep(DAKU[c]), 'daku');
    if (UNDAKU[c]) add(rep(UNDAKU[c]), 'daku');
    if (HAN[c]) add(rep(HAN[c]), 'daku');
    // 요음
    if (small[c]) { add(rep(small[c]), 'yoon'); add(rep(''), 'yoon'); }
    if (big[c] && p && IROW.includes(p) && M(i - 1)) add(rep(big[c]), 'yoon');
    if (IROW.includes(c) && nx && 'やゆよ'.includes(nx) === false && 'あうお'.includes(nx) && M(i + 1)) add(A.slice(0, i).join('') + c + ({ あ: 'ゃ', う: 'ゅ', お: 'ょ' })[nx] + A.slice(i + 2).join(''), 'yoon');
    // ん
    if (c === 'ん' && i > 0) add(rep(''), 'n');
  }
  return out;
}
function readingDistractors(r, bad, mask, others) {
  const m = mutations(r, mask);
  const by = {};
  m.forEach((t, s) => { if (bad && bad.has(s)) return; (by[t] = by[t] || []).push(s); });
  const order = shuffle(Object.keys(by));
  const res = [];
  for (let round = 0; res.length < 3 && round < 4; round++)
    order.forEach(t => { if (res.length < 3 && by[t].length) { const s = by[t].splice(rnd(by[t].length), 1)[0]; res.push([s, t]); } });
  if (res.length < 3) {
    const more = [];
    [...m.keys()].forEach(s => mutations(s, mask).forEach((t, s2) => { if (s2 !== r && !(bad && bad.has(s2)) && !res.some(x => x[0] === s2)) more.push([s2, t]); }));
    shuffle(more).forEach(x => { if (res.length < 3 && !res.some(y => y[0] === x[0])) res.push(x); });
  }
  if (res.length < 3 && others) others.forEach(o => { if (res.length < 3 && o !== r && !(bad && bad.has(o)) && !res.some(y => y[0] === o)) res.push([o, 'other']); });
  return res.length >= 3 ? res.slice(0, 3) : null;
}
/* 대상 표시 문자열 → 읽기 위치 마스크 (한자 읽기 부분 = true) */
function readMask(disp) {
  const mask = [];
  const re = new RegExp('(' + KJ + '+)\\(([^)]*)\\)|.', 'gu');
  let m;
  while ((m = re.exec(disp))) { if (m[2]) [...m[2]].forEach(() => mask.push(true)); else mask.push(false); }
  return mask;
}

/* ---------- 표기 오답 (비슷한 한자) ---------- */
let CONF = {}, SAMEON = {};
function initConf() {
  CONF = {}; SAMEON = {};
  DATA.conf.forEach(g => [...g].forEach(c => { CONF[c] = (CONF[c] || []).concat([...g].filter(x => x !== c)); }));
  const byOn = {};
  DATA.kanji.forEach(k => String(k[1]).split('・').filter(x => x && x !== '-').forEach(o => (byOn[o] = byOn[o] || []).push(k[0])));
  DATA.kanji.forEach(k => { const set = new Set(); String(k[1]).split('・').forEach(o => (byOn[o] || []).forEach(c => { if (c !== k[0]) set.add(c); })); SAMEON[k[0]] = [...set]; });
}
function writingDistractors(s, bad) {
  const ch = [...s], idx = ch.map((c, i) => (CONF[c] || SAMEON[c] && SAMEON[c].length) ? i : -1).filter(i => i >= 0);
  if (!idx.length) return null;
  const cands = i => [...new Set((CONF[ch[i]] || []).concat(SAMEON[ch[i]] || []))];
  const pri = [], sec = [];
  idx.forEach(i => {
    (CONF[ch[i]] || []).forEach(x => { const a = ch.slice(); a[i] = x; pri.push(a.join('')); });
    (SAMEON[ch[i]] || []).forEach(x => { const a = ch.slice(); a[i] = x; sec.push(a.join('')); });
  });
  if (idx.length > 1) for (let k = 0; k < 6; k++) { const a = ch.slice(); idx.forEach(i => { const c = cands(i); if (c.length) a[i] = pick(c); }); sec.push(a.join('')); }
  const ok = x => x !== s && !(bad && bad.has(x));
  const arr = [...new Set(shuffle(pri).concat(shuffle(sec)))].filter(ok);
  return arr.length >= 3 ? arr.slice(0, 3) : null;
}

/* ---------- 조수사 (읽기 드릴) ---------- */
const NUMR = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう', 'じゅう'];
const NUMK = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
const COUNTERS = {
  本: { ko: '~자루/병 (긴 것)', r: ['', 'いっぽん', 'にほん', 'さんぼん', 'よんほん', 'ごほん', 'ろっぽん', 'ななほん', 'はっぽん', 'きゅうほん', 'じゅっぽん'] },
  杯: { ko: '~잔', r: ['', 'いっぱい', 'にはい', 'さんばい', 'よんはい', 'ごはい', 'ろっぱい', 'ななはい', 'はっぱい', 'きゅうはい', 'じゅっぱい'] },
  匹: { ko: '~마리', r: ['', 'いっぴき', 'にひき', 'さんびき', 'よんひき', 'ごひき', 'ろっぴき', 'ななひき', 'はっぴき', 'きゅうひき', 'じゅっぴき'] },
  分: { ko: '~분', r: ['', 'いっぷん', 'にふん', 'さんぷん', 'よんぷん', 'ごふん', 'ろっぷん', 'ななふん', 'はっぷん', 'きゅうふん', 'じゅっぷん'] },
  階: { ko: '~층', r: ['', 'いっかい', 'にかい', 'さんがい', 'よんかい', 'ごかい', 'ろっかい', 'ななかい', 'はっかい', 'きゅうかい', 'じゅっかい'] },
  個: { ko: '~개', r: ['', 'いっこ', 'にこ', 'さんこ', 'よんこ', 'ごこ', 'ろっこ', 'ななこ', 'はっこ', 'きゅうこ', 'じゅっこ'] },
  回: { ko: '~번', r: ['', 'いっかい', 'にかい', 'さんかい', 'よんかい', 'ごかい', 'ろっかい', 'ななかい', 'はっかい', 'きゅうかい', 'じゅっかい'] },
  冊: { ko: '~권', r: ['', 'いっさつ', 'にさつ', 'さんさつ', 'よんさつ', 'ごさつ', 'ろくさつ', 'ななさつ', 'はっさつ', 'きゅうさつ', 'じゅっさつ'] },
  枚: { ko: '~장', r: ['', 'いちまい', 'にまい', 'さんまい', 'よんまい', 'ごまい', 'ろくまい', 'ななまい', 'はちまい', 'きゅうまい', 'じゅうまい'] },
  台: { ko: '~대', r: ['', 'いちだい', 'にだい', 'さんだい', 'よんだい', 'ごだい', 'ろくだい', 'ななだい', 'はちだい', 'きゅうだい', 'じゅうだい'] },
  人: { ko: '~명', r: ['', 'ひとり', 'ふたり', 'さんにん', 'よにん', 'ごにん', 'ろくにん', 'しちにん', 'はちにん', 'きゅうにん', 'じゅうにん'] },
  歳: { ko: '~살', r: ['', 'いっさい', 'にさい', 'さんさい', 'よんさい', 'ごさい', 'ろくさい', 'ななさい', 'はっさい', 'きゅうさい', 'じゅっさい'] },
  時: { ko: '~시', r: ['', 'いちじ', 'にじ', 'さんじ', 'よじ', 'ごじ', 'ろくじ', 'しちじ', 'はちじ', 'くじ', 'じゅうじ'] },
  月: { ko: '~월', r: ['', 'いちがつ', 'にがつ', 'さんがつ', 'しがつ', 'ごがつ', 'ろくがつ', 'しちがつ', 'はちがつ', 'くがつ', 'じゅうがつ'] },
  日: { ko: '~일 (날짜)', r: ['', 'ついたち', 'ふつか', 'みっか', 'よっか', 'いつか', 'むいか', 'なのか', 'ようか', 'ここのか', 'とおか'] },
  つ: { ko: '~개 (고유어)', r: ['', 'ひとつ', 'ふたつ', 'みっつ', 'よっつ', 'いつつ', 'むっつ', 'ななつ', 'やっつ', 'ここのつ', 'とお'] },
  円: { ko: '~엔', r: ['', 'いちえん', 'にえん', 'さんえん', 'よえん', 'ごえん', 'ろくえん', 'ななえん', 'はちえん', 'きゅうえん', 'じゅうえん'] },
  週間: { ko: '~주일', r: ['', 'いっしゅうかん', 'にしゅうかん', 'さんしゅうかん', 'よんしゅうかん', 'ごしゅうかん', 'ろくしゅうかん', 'ななしゅうかん', 'はっしゅうかん', 'きゅうしゅうかん', 'じゅっしゅうかん'] },
};
function counterQuestion() {
  const k = pick(Object.keys(COUNTERS)), n = 1 + rnd(10), c = COUNTERS[k], right = c.r[n];
  const bad = new Set(c.r);
  const naive = (k === 'つ' || k === '人' || k === '日') ? null : NUMR[n] + (c.r[2] || '').replace(/^に/, '');
  const pool = [];
  if (naive && naive !== right) pool.push(naive);
  if (k === '日' || k === 'つ' || k === '人') c.r.forEach((x, m) => { if (m && m !== n && x) pool.push(x, x); });
  mutations(right).forEach((t, s) => { if ((!bad.has(s) || s === naive) && t !== 'yoon') pool.push(s); });
  // 다른 숫자의 읽기 패턴을 섞은 오답
  for (let m = 1; m <= 10; m++) if (m !== n) { const alt = c.r[m]; const head = NUMR[n]; if (alt && !bad.has(head + alt.slice(NUMR[m].length))) pool.push(head + alt.slice(NUMR[m].length)); }
  const tail = right.slice(-1), loose = k === '日' || k === 'つ' || k === '人';
  const opts = [...new Set(pool.filter(s => s && s !== right && s.length >= 2 && s !== NUMR[n] && (loose || s.slice(-1) === tail)))];
  const wrong = shuffle(opts).slice(0, 3);
  if (wrong.length < 3) return counterQuestion();
  const disp = k === 'つ' ? (n === 10 ? '十' : NUMK[n] + 'つ') : NUMK[n] + k;
  return { disp, right, wrong, ko: c.ko, table: c.r, k };
}

/* ---------- 활용 드릴 ---------- */
const DRILL_FORMS = {
  masu: { ko: 'ます형', ex: '書く→書きます' }, te: { ko: 'て형', ex: '書く→書いて' }, ta: { ko: 'た형', ex: '書く→書いた' }, nai: { ko: 'ない형', ex: '書く→書かない' },
  pot: { ko: '가능형', ex: '書く→書ける' }, vol: { ko: '의향형', ex: '書く→書こう' }, ba: { ko: 'ば형(가정)', ex: '書く→書けば' }, imp: { ko: '명령형', ex: '書く→書け' },
  pass: { ko: '수동형', ex: '書く→書かれる' }, caus: { ko: '사역형', ex: '書く→書かせる' },
};
function drillForm(F, key) {
  switch (key) {
    case 'masu': return F.renyou[1] + 'ます';
    case 'te': return F.te[1]; case 'ta': return F.ta[1];
    case 'nai': return F.mizen[1] + 'ない';
    case 'pot': return F.pot[1] + 'る';
    case 'vol': return F.vol[1]; case 'ba': return F.e[1] + 'ば'; case 'imp': return F.imp[1];
    case 'pass': return F.pass[1] + 'る'; case 'caus': return F.caus[1] + 'る';
  }
}
function drillQuestion(verbs, key) {
  for (let tries = 0; tries < 30; tries++) {
    const wd = pick(verbs);
    const r = k2h(wd.r);
    if (RU_I.has(r) || r === 'ある' && key !== 'masu' && key !== 'te' && key !== 'ta') continue;
    const F = vforms(r, r, wd.p); if (!F) continue;
    const right = drillForm(F, key);
    const wrongs = new Set();
    // 다른 그룹으로 잘못 활용한 형태들
    ['v5', 'v1'].forEach(p => {
      if (p === wd.p) return;
      if (p === 'v1' && !r.endsWith('る')) return;
      const G = vforms(r, r, p); if (G) wrongs.add(drillForm(G, key));
    });
    if (wd.p === 'v5') {
      const last = r.slice(-1), st = r.slice(0, -1);
      const tes = { te: ['って', 'んで', 'いて', 'して', 'いで'], ta: ['った', 'んだ', 'いた', 'した', 'いだ'] };
      if (tes[key]) tes[key].forEach(x => wrongs.add(st + x));
      if (key === 'nai') { wrongs.add(st + ROW[last][1] + 'ない'); wrongs.add(st + ROW[last][3] + 'ない'); if (last === 'う') wrongs.add(st + 'あない'); }
      if (key === 'pot') { wrongs.add(st + ROW[last][0] + 'れる'); wrongs.add(r + 'れる'); wrongs.add(st + ROW[last][3] + 'られる'); wrongs.add(st + ROW[last][3] + 'れる'); }
      if (key === 'vol') { wrongs.add(st + ROW[last][4] + 'よう'); wrongs.add(st + ROW[last][2] + 'よう'); }
      if (key === 'masu') { wrongs.add(st + ROW[last][0] + 'ます'); wrongs.add(st + ROW[last][3] + 'ます'); }
      if (key === 'ba') { wrongs.add(st + ROW[last][0] + 'ば'); wrongs.add(r + 'れば'); wrongs.add(st + ROW[last][1] + 'ば'); wrongs.add(st + ROW[last][3] + 'れば'); }
      if (key === 'imp') { wrongs.add(st + ROW[last][4]); wrongs.add(st + ROW[last][3] + 'ろ'); wrongs.add(st + ROW[last][1] + 'ろ'); wrongs.add(r + 'な'); }
      if (key === 'pass') { wrongs.add(st + ROW[last][3] + 'れる'); wrongs.add(st + ROW[last][0] + 'られる'); wrongs.add(st + ROW[last][0] + 'せる'); wrongs.add(r + 'られる'); }
      if (key === 'caus') { wrongs.add(st + ROW[last][0] + 'させる'); wrongs.add(st + ROW[last][3] + 'せる'); }
    } else if (wd.p === 'v1') {
      const st = r.slice(0, -1);
      ({ pot: [st + 'れる', st + 'させる', st + 'らせる', r + 'れる'], pass: [st + 'れる', st + 'させる', st + 'らせる', r + 'られる'], caus: [st + 'せる', st + 'られる', st + 'らせる', r + 'させる'], vol: [st + 'ろう', st + 'おう', r + 'よう'], imp: [st + 'れ', st + 'よ', r + 'な', st + 'い'], ba: [st + 'ば', r + 'ば', st + 'らば'], te: [st + 'って', r + 'て', st + 'いて'], ta: [st + 'った', r + 'た', st + 'いた'], nai: [st + 'らない', r + 'ない', st + 'りない'], masu: [st + 'ります', r + 'ます', st + 'いま'] }[key] || []).forEach(x => wrongs.add(x));
    } else if (wd.p === 'vk') {
      ({ te: ['こて', 'くって', 'きって'], ta: ['こた', 'くった', 'きった'], nai: ['きない', 'くない', 'からない'], pot: ['きられる', 'くられる', 'これる'], vol: ['きよう', 'くよう', 'ころう'], ba: ['きれば', 'これば', 'くらば'], imp: ['きろ', 'くれ', 'こよ'], masu: ['こます', 'くます', 'きります'], pass: ['きられる', 'くられる', 'こされる'], caus: ['きさせる', 'くさせる', 'こらせる'] }[key] || []).forEach(x => wrongs.add(x));
    }
    wrongs.delete(right);
    const w = shuffle([...wrongs]).slice(0, 3);
    if (w.length < 3) continue;
    return { wd, right, wrong: w, key };
  }
  return null;
}

/* ---------- 가나 ---------- */
const KANA_BASIC = [
  ['あ', 'a', '아'], ['い', 'i', '이'], ['う', 'u', '우'], ['え', 'e', '에'], ['お', 'o', '오'],
  ['か', 'ka', '카'], ['き', 'ki', '키'], ['く', 'ku', '쿠'], ['け', 'ke', '케'], ['こ', 'ko', '코'],
  ['さ', 'sa', '사'], ['し', 'shi', '시'], ['す', 'su', '스'], ['せ', 'se', '세'], ['そ', 'so', '소'],
  ['た', 'ta', '타'], ['ち', 'chi', '치'], ['つ', 'tsu', '츠'], ['て', 'te', '테'], ['と', 'to', '토'],
  ['な', 'na', '나'], ['に', 'ni', '니'], ['ぬ', 'nu', '누'], ['ね', 'ne', '네'], ['の', 'no', '노'],
  ['は', 'ha', '하'], ['ひ', 'hi', '히'], ['ふ', 'fu', '후'], ['へ', 'he', '헤'], ['ほ', 'ho', '호'],
  ['ま', 'ma', '마'], ['み', 'mi', '미'], ['む', 'mu', '무'], ['め', 'me', '메'], ['も', 'mo', '모'],
  ['や', 'ya', '야'], ['', '', ''], ['ゆ', 'yu', '유'], ['', '', ''], ['よ', 'yo', '요'],
  ['ら', 'ra', '라'], ['り', 'ri', '리'], ['る', 'ru', '루'], ['れ', 're', '레'], ['ろ', 'ro', '로'],
  ['わ', 'wa', '와'], ['', '', ''], ['', '', ''], ['', '', ''], ['を', 'o(wo)', '오'],
  ['ん', 'n', '응(ㄴ)'], ['', '', ''], ['', '', ''], ['', '', ''], ['', '', ''],
];
const KANA_DAKU = [
  ['が', 'ga', '가'], ['ぎ', 'gi', '기'], ['ぐ', 'gu', '구'], ['げ', 'ge', '게'], ['ご', 'go', '고'],
  ['ざ', 'za', '자'], ['じ', 'ji', '지'], ['ず', 'zu', '즈'], ['ぜ', 'ze', '제'], ['ぞ', 'zo', '조'],
  ['だ', 'da', '다'], ['ぢ', 'ji', '지'], ['づ', 'zu', '즈'], ['で', 'de', '데'], ['ど', 'do', '도'],
  ['ば', 'ba', '바'], ['び', 'bi', '비'], ['ぶ', 'bu', '부'], ['べ', 'be', '베'], ['ぼ', 'bo', '보'],
  ['ぱ', 'pa', '파'], ['ぴ', 'pi', '피'], ['ぷ', 'pu', '푸'], ['ぺ', 'pe', '페'], ['ぽ', 'po', '포'],
];
const KANA_YOON = [
  ['きゃ', 'kya', '캬'], ['きゅ', 'kyu', '큐'], ['きょ', 'kyo', '쿄'], ['しゃ', 'sha', '샤'], ['しゅ', 'shu', '슈'], ['しょ', 'sho', '쇼'],
  ['ちゃ', 'cha', '차'], ['ちゅ', 'chu', '추'], ['ちょ', 'cho', '초'], ['にゃ', 'nya', '냐'], ['にゅ', 'nyu', '뉴'], ['にょ', 'nyo', '뇨'],
  ['ひゃ', 'hya', '햐'], ['ひゅ', 'hyu', '휴'], ['ひょ', 'hyo', '효'], ['みゃ', 'mya', '먀'], ['みゅ', 'myu', '뮤'], ['みょ', 'myo', '묘'],
  ['りゃ', 'rya', '랴'], ['りゅ', 'ryu', '류'], ['りょ', 'ryo', '료'], ['ぎゃ', 'gya', '갸'], ['ぎゅ', 'gyu', '규'], ['ぎょ', 'gyo', '교'],
  ['じゃ', 'ja', '자'], ['じゅ', 'ju', '주'], ['じょ', 'jo', '조'], ['びゃ', 'bya', '뱌'], ['びゅ', 'byu', '뷰'], ['びょ', 'byo', '뵤'],
  ['ぴゃ', 'pya', '퍄'], ['ぴゅ', 'pyu', '퓨'], ['ぴょ', 'pyo', '표'],
];
const KANA_ALL = [...KANA_BASIC, ...KANA_DAKU, ...KANA_YOON].filter(x => x[0]);
/* 헷갈리는 가나 묶음 (오답용) */
const KANA_LOOK = ['あお', 'いり', 'うら', 'さち', 'ぬめ', 'ねれわ', 'はほま', 'るろ', 'きさ', 'くへ', 'こに', 'たな', 'しつ', 'シツ', 'ソン', 'クケタ', 'ウワ', 'コユ', 'ヌス', 'チテ', 'フワ', 'メナ', 'マム', 'ルレ', 'ヲラ'];
function kanaQuestion(set, mode, kata) {
  const pool = set.filter(x => x[0]);
  const it = pick(pool), ch = kata ? h2k(it[0]) : it[0];
  const look = KANA_LOOK.find(g => g.includes(ch[0]));
  let wrongPool = pool.filter(x => x[0] !== it[0] && x[1] !== it[1]);
  let near = look ? [...look].filter(c => c !== ch[0]).map(c => pool.find(x => (kata ? h2k(x[0]) : x[0]) === c)).filter(Boolean) : [];
  const wrongs = [...new Set([...near, ...shuffle(wrongPool)])].slice(0, 3);
  return { it, ch, mode, wrong: wrongs, kata };
}
