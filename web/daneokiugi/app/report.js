'use strict';
// 단어키우기 · 부모 리포트 (하루 · 한 주 · 전체). 기록은 이 기기에 쌓인 것만 써요
const RP = { tab: 'day', day: null, wk: 0, i: -1 };
const RTY = { t1: '뜻 고르기', t2: '단어 고르기', t3: '스펠링 눌러 쓰기', t4: '키보드로 쓰기', t5: '예문 빈칸 채우기' };
const RDOW = ['일', '월', '화', '수', '목', '금', '토'];
const RGOAL = { starter: '처음 만나는 쉬운 낱말을 알게 돼요', elem_low: '초등 저학년 수준 단어를 알게 돼요', elem_high: '초등학교 수준 단어를 두루 알게 돼요', middle_basic: '중학교에서 꼭 쓰는 단어를 알게 돼요', middle_adv: '중학교 수준 단어를 두루 알게 돼요' };
const rDate = n => new Date(n * 864e5);
const rYmd = n => { const d = rDate(n); return `${d.getUTCFullYear()}년 ${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`; };
const rMd = n => { const d = rDate(n); return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일`; };
const rDow = n => rDate(n).getUTCDay();
const rWk0 = n => n - (rDow(n) + 6) % 7;   // 그 주 월요일
const rMin = ms => Math.round((ms || 0) / 6e4);
const rDur = m => m >= 60 ? `${Math.floor(m / 60)}시간${m % 60 ? ' ' + m % 60 + '분' : ''}` : `${m}분`;
const rClock = mn => `${mn < 720 ? '오전' : '오후'} ${(Math.floor(mn / 60) + 11) % 12 + 1}시${mn % 60 ? ' ' + mn % 60 + '분' : ''}`;
const rPct = (a, b) => b ? Math.round(a / b * 100) : 0;
const rH = (o, n) => o.hist[dfrom(n)];
const rOn = h => !!h && h.q > 0;
let _rMean = null;
const rMean = w => { if (!_rMean) { _rMean = {}; BOOKS.forEach(b => b.words.forEach(x => { if (!_rMean[x[0]]) _rMean[x[0]] = x[1]; })); } return _rMean[w] || ''; };
function rCount(o, id) {
  const m = o.w[id] || {}, b = BOOKS.find(x => x.id === id); let a = 0, c = 0, e = 0, steps = 0;
  for (const w of b.words) { const s = m[w[0]]; if (!s) { steps += 3; continue; } if (s[0] >= 3) a++; else { steps += 3 - Math.min(3, s[1] || 0); if (s[0] === 2) c++; else e++; } }
  return { done: a, mid: c, seen: e, none: b.words.length - a - c - e, total: b.words.length, steps };
}
const rCard = (title, body, right) => `<div class="card" style="gap:8px">${title ? `<div class="row" style="align-items:baseline"><h2 class="sp" style="font-size:18px">${title}</h2>${right ? `<span class="sub">${right}</span>` : ''}</div>` : ''}${body}</div>`;
const rKv = (k, v) => `<div class="row" style="align-items:baseline;gap:10px;font-size:14.5px;padding:2px 0"><span class="sp" style="color:var(--sub2)">${k}</span><span style="text-align:right">${v}</span></div>`;
const rTile = (n, l, c, sub) => `<div class="tile" style="padding:12px 4px 10px;gap:2px;background:var(${c})"><b class="d tn" style="font-weight:400;font-size:24px;white-space:nowrap">${n}</b><span class="sub">${l}</span>${sub ? `<span style="font-size:11.5px;color:var(--sub)">${sub}</span>` : ''}</div>`;
const rWord = (w, note) => `<div class="row" style="gap:8px;background:var(--bg);border-radius:14px;padding:8px 12px"><span class="d" style="font-size:17px">${esc(w)}</span><span class="sp" style="font-size:14px;color:var(--sub2);min-width:0">${esc(rMean(w))}</span><span style="font-size:12.5px;color:var(--sub);white-space:nowrap">${note}</span></div>`;
const rNav = (label, act, canNext) => `<div class="row" style="justify-content:center;gap:14px"><button type="button" class="ibtn" style="width:40px;height:40px" data-a="${act}" data-d="-1" aria-label="이전">${ico(IC.back, 20)}</button><span class="d" style="font-size:18px;min-width:150px;text-align:center">${label}</span><button type="button" class="ibtn" style="width:40px;height:40px;${canNext ? '' : 'opacity:.3'}" data-a="${act}" data-d="1" aria-label="다음" ${canNext ? '' : 'disabled'}>${ico(IC.fwd, 20)}</button></div>`;
const rTypes = ty => { const ks = Object.keys(RTY).filter(k => ty[k] && ty[k][0]); if (!ks.length) return '';
  return ks.sort((a, b) => ty[b][1] / ty[b][0] - ty[a][1] / ty[a][0]).map(k => { const p = rPct(ty[k][1], ty[k][0]); return `<div style="display:flex;flex-direction:column;gap:3px"><div class="row" style="gap:8px;font-size:14.5px"><span class="sp">${RTY[k]}</span><span class="tn" style="font-size:12.5px;color:var(--sub)">${ty[k][0]}문제</span><span class="tn" style="width:42px;text-align:right">${p}%</span></div><div class="bar" style="height:8px"><i style="width:${p}%"></i></div></div>`; }).join(''); };

// 지금 수준과 마쳤을 때 수준
function rLevel(o) {
  const i = BOOKS.findIndex(b => b.id === o.book), from = clamp(i - 1, 0, BOOKS.length - 3), bs = BOOKS.slice(from, from + 3);
  const chip = (t, c) => `<span style="flex:none;width:52px;text-align:center;padding:1px 0 2px;border-radius:10px;border:1.5px solid var(--ink);font-size:12.5px;background:var(${c})">${t}</span>`;
  return `<div class="card" style="gap:8px;padding:12px 14px"><div class="row" style="gap:10px;font-size:14.5px">${chip('지금', '--y')}<span>${BOOKS[i].name} 단어를 익히는 중이에요</span></div><div class="row" style="gap:10px;font-size:14.5px">${chip('마치면', '--mainLt')}<span>${RGOAL[o.book]}</span></div>
<div class="row" style="gap:8px;align-items:flex-start;padding-top:4px">${bs.map(b => { const c = rCount(o, b.id), p = rPct(c.done + c.mid, c.total); return `<div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:4px"><div class="bar" style="height:8px"><i style="width:${p}%"></i></div><span class="row" style="gap:4px;font-size:12.5px;white-space:nowrap">${b.name}${b.id === o.book ? '<span style="padding:0 6px;border-radius:8px;border:1.5px solid var(--ink);background:var(--y);font-size:11px;line-height:15px">지금</span>' : ''}</span><span class="tn" style="font-size:12px;color:var(--sub)">${p}% 알아요</span></div>`; }).join('')}</div></div>`;
}

// ---------- 하루 ----------
function rDay(o, n, t) {
  const h = rH(o, n), on = rOn(h), isT = n === t;
  const head = rNav(`${rMd(n)} ${RDOW[rDow(n)]}요일`, 'rpDay', n < t);
  const hasWr = !!(h && h.wr && Object.keys(h.wr).length);
  if (!on && !hasWr && !(h && (h.mg || (h.nr && h.nr.length)))) return head + `<div class="card" style="align-items:center;padding:26px 14px"><span class="sub" style="font-size:15px;text-align:center">${isT ? '오늘은 아직 공부하지 않았어요' : '이날은 공부를 쉬었어요'}</span></div>`;
  const hh = h || {}, streak = (o.last === dfrom(t) || o.last === dfrom(t - 1)) ? o.streak : 0;
  const tiles = `<div class="grid2">${rTile(hh.q || 0, '푼 문제', '--t2')}${rTile(hh.q ? rPct(hh.ok, hh.q) + '%' : '-', '정답률', '--stary')}${rTile(rDur(rMin(hh.ms)), '공부 시간', '--t0')}${isT ? rTile(streak + '일', '이어서 공부', '--t3') : rTile(hh.st || 0, '받은 별', '--t3')}</div>`;
  const study = [hh.t0 != null ? rKv('공부한 시각', hh.t0 === hh.t1 ? rClock(hh.t0) : `${rClock(hh.t0)} ~ ${rClock(hh.t1)}`) : '', hh.nw != null || hh.rv != null ? rKv('새로 배운 단어', (hh.nw || 0) + '개') + rKv('복습한 단어', (hh.rv || 0) + '개') : '', hh.pf ? rKv('완벽히 알게 된 단어', hh.pf + '개') : '', hh.wo ? rKv('오답노트에서 뺀 단어', hh.wo + '개') : ''].join('');
  const ty = hh.ty ? rTypes(hh.ty) : '', wr = Object.entries(hh.wr || {}).sort((a, b) => b[1] - a[1]);
  const vilRows = [hh.st ? rKv('받은 별', hh.st + '개') : '', hh.bx ? rKv('받은 상자', `알 상자 ${hh.bx}개 · 물건 상자 ${hh.bx}개`) : '', hh.mg ? rKv('합치기', hh.mg + '번') : '', hh.nr && hh.nr.length ? rKv('새로 찾은 조합', hh.nr.map(esc).join(', ')) : ''].join('');
  return head + (on ? tiles : '') + (study ? rCard(isT ? '오늘 공부' : '이날 공부', study) : '') + (ty ? rCard('시험 유형별 정답률', ty) : '')
    + ((on && hh.wr) || hasWr ? rCard(isT ? '오늘 틀린 단어' : '이날 틀린 단어', wr.length ? wr.slice(0, 8).map(([w, c]) => rWord(w, c > 1 ? `${c}번 틀림` : (o.wr[w] && o.wr[w].n > c ? `전에도 ${o.wr[w].n - c}번 틀림` : '처음 틀림'))).join('') : '<span class="sub">틀린 단어가 없어요</span>', wr.length ? wr.length + '개' : '') : '')
    + (vilRows ? rCard(isT ? '오늘 마을에서' : '이날 마을에서', vilRows) : '')
    + (on && hh.t0 == null ? '<div class="hint" style="text-align:center">이날은 자세한 기록이 없어요. 자세한 기록은 이 버전부터 쌓여요</div>' : '');
}

// ---------- 한 주 ----------
function rWeekSum(o, w0, t) {
  const r = { days: 0, q: 0, ok: 0, ms: 0, ty: {}, wr: {}, nw: 0, pf: 0, wo: 0, hasNw: false, per: [], longest: null };
  for (let i = 0; i < 7; i++) { const n = w0 + i, h = rH(o, n); r.per.push(n > t ? null : (rOn(h) ? h.q : 0)); if (!rOn(h)) continue;
    r.days++; r.q += h.q; r.ok += h.ok; r.ms += h.ms || 0; if (!r.longest || (h.ms || 0) > r.longest[1]) r.longest = [n, h.ms || 0];
    if (h.nw != null) { r.hasNw = true; r.nw += h.nw; } r.pf += h.pf || 0; r.wo += h.wo || 0;
    for (const k in (h.ty || {})) { const a = r.ty[k] || (r.ty[k] = [0, 0]); a[0] += h.ty[k][0]; a[1] += h.ty[k][1]; }
    for (const w in (h.wr || {})) r.wr[w] = (r.wr[w] || 0) + h.wr[w]; }
  return r;
}
function rBars(per, w0, t) {
  const mx = Math.max(10, ...per.map(x => x || 0)), W = 310, H = 120, bw = 26, x = i => 24 + i * (W - 48) / 6;
  return `<svg viewBox="0 0 ${W} ${H + 24}" width="100%" role="img" aria-label="하루에 푼 문제 막대 그래프" style="display:block"><path d="M10 ${H}H${W - 10}" style="stroke:var(--track)" stroke-width="2"/>${per.map((v, i) => { const hh = v ? Math.max(6, v / mx * (H - 24)) : 0, cx = x(i), today = w0 + i === t;
    return `${v ? `<rect x="${f1(cx - bw / 2)}" y="${f1(H - hh)}" width="${bw}" height="${f1(hh)}" rx="5" style="fill:var(--main)" stroke="${INK}" stroke-width="${today ? 2 : 0}"/><text x="${f1(cx)}" y="${f1(H - hh - 5)}" text-anchor="middle" font-size="11.5" fill="${INK}">${v}</text>` : v === 0 ? `<circle cx="${f1(cx)}" cy="${H - 5}" r="2.5" style="fill:var(--sub)" opacity=".5"/>` : ''}<text x="${f1(cx)}" y="${H + 17}" text-anchor="middle" font-size="12" style="fill:var(--sub2)" ${today ? 'font-weight="700"' : ''}>${RDOW[(i + 1) % 7]}</text>`; }).join('')}</svg>`;
}
function rWeek(o, w0, t) {
  const a = rWeekSum(o, w0, t), b = rWeekSum(o, w0 - 7, t), cur = w0 === rWk0(t);
  const head = rNav(`${rMd(w0)} ~ ${rMd(w0 + 6)}`, 'rpWk', !cur);
  if (!a.days) return head + `<div class="card" style="align-items:center;padding:26px 14px"><span class="sub" style="font-size:15px;text-align:center">${cur ? '이번 주는 아직 공부한 날이 없어요' : '이 주에는 공부한 날이 없어요'}</span></div>`;
  const rest = a.per.map((v, i) => v === 0 ? RDOW[(i + 1) % 7] + '요일' : '').filter(Boolean);
  const acc = rPct(a.ok, a.q), accB = rPct(b.ok, b.q), ty = rTypes(a.ty), tks = Object.keys(a.ty).filter(k => a.ty[k][0] >= 3), hard = tks.length > 1 ? tks.sort((x, y) => a.ty[x][1] / a.ty[x][0] - a.ty[y][1] / a.ty[y][0])[0] : null;
  const wr = Object.entries(a.wr).sort((x, y) => y[1] - x[1]).slice(0, 5), mins = rMin(a.ms);
  const say = []; if (b.days) { say.push(a.days > b.days ? `지난주보다 ${a.days - b.days}일 더 공부했어요.` : a.days < b.days ? `지난주보다 ${b.days - a.days}일 덜 공부했어요.` : '지난주와 같은 날만큼 공부했어요.'); if (b.q && Math.abs(acc - accB) >= 2) say.push(acc > accB ? '정답률도 올랐어요.' : '정답률은 조금 내려갔어요.'); } else say.push(`이번 주에 ${a.days}일 공부했어요.`);
  if (hard && rPct(a.ty[hard][1], a.ty[hard][0]) < 90) say.push(hard === 't3' || hard === 't4' ? '스펠링을 쓰는 문제에서 많이 틀리니, 틀린 단어를 소리 내어 읽고 써 보게 해 주세요.' : hard === 't5' ? '예문 빈칸 문제를 어려워하니, 단어 카드의 예문을 같이 읽어 보세요.' : '뜻과 단어를 잇는 문제에서 틀리니, 단어 카드를 한 번 더 보게 해 주세요.');
  return head + rCard('하루에 푼 문제', rBars(a.per, w0, t) + (rest.length && rest.length < 7 ? `<span class="sub">${rest.join(', ')}은 쉬었어요</span>` : ''), `모두 ${a.q}문제`)
    + `<div class="grid3">${rTile(a.days + '일', '공부한 날', '--t2', b.days ? `지난주 ${b.days}일` : '')}${rTile(a.q, '푼 문제', '--t0', b.q ? `지난주 ${b.q}문제` : '')}${rTile(acc + '%', '정답률', '--stary', b.q ? `지난주 ${accB}%` : '')}</div>`
    + rCard('공부 시간', rKv('한 주 동안', rDur(mins)) + rKv('공부한 날 평균', '하루 ' + rDur(Math.round(mins / a.days))) + (a.longest && a.longest[1] ? rKv('가장 길게 한 날', `${RDOW[rDow(a.longest[0])]}요일 ${rDur(rMin(a.longest[1]))}`) : ''))
    + (ty ? rCard('시험 유형별 정답률', ty + (hard && rPct(a.ty[hard][1], a.ty[hard][0]) < 90 ? `<span class="sub">${RTY[hard]}를 가장 어려워했어요</span>` : '')) : '')
    + (a.hasNw || a.pf || a.wo ? rCard('단어 변화', (a.hasNw ? rKv('새로 본 단어', a.nw + '개') : '') + rKv('완벽히 알게 된 단어', a.pf + '개') + rKv('오답노트에서 빠진 단어', a.wo + '개') + (cur ? rKv('오답노트에 남은 단어', Object.keys(o.wr).length + '개') : '')) : '')
    + (wr.length ? rCard(cur ? '이번 주에 자주 틀린 단어' : '이 주에 자주 틀린 단어', wr.map(([w, c]) => rWord(w, c + '번 틀림')).join('')) : '')
    + rCard(cur ? '이번 주 한마디' : '이 주 한마디', `<span style="font-size:14.5px;line-height:1.6">${say.join(' ')}</span>`);
}

// ---------- 전체 ----------
function rPace(o, t) {
  const days = Object.keys(o.hist).filter(k => rOn(o.hist[k])).map(dnum).sort((a, b) => a - b), c = rCount(o, o.book);
  if (!days.length) return { c, none: true };
  const first = days[0], span = Math.min(28, t - first + 1), rec = days.filter(n => n > t - span), mine = rec.filter(n => { const h = rH(o, n); return !h.b || h.b === o.book; });
  const dpw = clamp(rec.length / span * 7, .5, 7), qpd = rec.reduce((a, n) => a + rH(o, n).q, 0) / Math.max(1, rec.length), okpd = rec.reduce((a, n) => a + rH(o, n).ok, 0) / Math.max(1, rec.length);
  const withNw = mine.filter(n => rH(o, n).nw != null), seen = c.total - c.none, bookDays = days.filter(n => { const h = rH(o, n); return !h.b || h.b === o.book; }).length;
  let npd = withNw.length >= 3 ? withNw.reduce((a, n) => a + rH(o, n).nw, 0) / withNw.length : seen / Math.max(1, bookDays); npd = Math.max(.5, npd);
  const calc = (dw, k) => { const d1 = c.none ? Math.ceil(c.none / (npd * k) * 7 / dw) : 0, d2 = c.steps ? Math.max(Math.ceil(c.steps / Math.max(1, okpd * k * .8) * 7 / dw), d1 + 8) : 0; return [d1, d2]; };
  const [d1, d2] = calc(dpw, 1);
  return { c, first, few: days.length < 3, dpw, qpd, npd, d1, d2, calc, seen, all: days };
}
function rChart(o, P, t) {
  const W = 310, H = 172, x0 = P.first, x1 = t + Math.max(P.d2, P.d1, 21) * 1.08, X = n => 34 + (n - x0) / (x1 - x0) * 266, Y = v => 150 - v / P.c.total * 128, tot = P.c.total, hf = Math.round(tot / 2);
  let mo = ''; { const d = rDate(x0); let y = d.getUTCFullYear(), m = d.getUTCMonth(); const step = Math.max(1, Math.ceil((x1 - x0) / 31 / 5)); let i = 0; for (;;) { m++; if (m > 11) { m = 0; y++; } const n = Math.round(Date.UTC(y, m, 1) / 864e5); if (n > x1) break; if (i++ % step === 0 && X(n) > 44 && X(n) < 292) mo += `<text x="${f1(X(n))}" y="166" text-anchor="middle" font-size="11" style="fill:var(--sub)">${m + 1}월</text>`; } }
  const xt = X(t), ys = Y(P.seen), yd = Y(P.c.done), xa = X(t + P.d1), xb = X(t + P.d2), end = (x, y, st) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="5" style="${st}" stroke="${INK}" stroke-width="1.5"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="앞으로 예상 그래프" style="display:block">${[0, hf, tot].map(v => `<path d="M34 ${f1(Y(v))}H300" style="stroke:var(--track)" stroke-width="1"/><text x="28" y="${f1(Y(v) + 4)}" text-anchor="end" font-size="11" style="fill:var(--sub)">${v}</text>`).join('')}${mo}
<path d="M${f1(xt)} 14V150" style="stroke:var(--sub)" stroke-width="1.2" stroke-dasharray="2 3"/><text x="${f1(xt)}" y="10" text-anchor="middle" font-size="11" style="fill:var(--sub2)">오늘</text>
<path d="M34 150L${f1(xt)} ${f1(ys)}" fill="none" style="stroke:var(--main)" stroke-width="2.6" stroke-linecap="round"/>${P.c.none ? `<path d="M${f1(xt)} ${f1(ys)}L${f1(xa)} ${f1(Y(tot))}" fill="none" style="stroke:var(--main)" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="5 4"/>` : ''}
<path d="M34 150L${f1(xt)} ${f1(yd)}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>${P.c.steps ? `<path d="M${f1(xt)} ${f1(yd)}L${f1(xb)} ${f1(Y(tot))}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="5 4"/>` : ''}
<circle cx="${f1(xt)}" cy="${f1(ys)}" r="4" style="fill:var(--main)" stroke="#FFFDF6" stroke-width="2"/><circle cx="${f1(xt)}" cy="${f1(yd)}" r="4" fill="${INK}" stroke="#FFFDF6" stroke-width="2"/>${P.c.none ? end(xa, Y(tot), 'fill:var(--main)') : ''}${P.c.steps ? end(xb, Y(tot), 'fill:' + INK) : ''}
<text x="${f1(xt - 7)}" y="${f1(Math.min(ys - 7, yd - 22))}" text-anchor="end" font-size="11.5" style="fill:var(--sub2)">본 단어 ${P.seen}</text><text x="${f1(xt + 8)}" y="${f1(Math.min(146, yd + 14))}" font-size="11.5" fill="${INK}">완벽 ${P.c.done}</text></svg>`;
}
function rCal(o, t) {
  const d = rDate(t), y = d.getUTCFullYear(), m = d.getUTCMonth(), n0 = Math.round(Date.UTC(y, m, 1) / 864e5), len = new Date(Date.UTC(y, m + 1, 0)).getUTCDate(), lead = (rDow(n0) + 6) % 7, per = o.per || 20; let cnt = 0, cells = '';
  for (let i = 0; i < lead; i++) cells += '<span></span>';
  for (let i = 0; i < len; i++) { const n = n0 + i, h = rH(o, n), q = rOn(h) ? h.q : 0; if (q) cnt++;
    const st = n > t ? 'border:1px solid var(--track);color:var(--sub)' : !q ? 'background:var(--track);color:var(--sub2)' : q < per * .75 ? 'background:var(--mainPale)' : q < per * 1.5 ? 'background:var(--mainMid)' : 'background:var(--main)';
    cells += `<span class="tn" style="height:34px;box-sizing:border-box;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:12.5px;${st}${n === t ? ';box-shadow:0 0 0 2px var(--paper),0 0 0 4px var(--ink)' : ''}">${i + 1}</span>`; }
  const lg = (c, tx) => `<span class="row" style="gap:4px"><span style="width:12px;height:12px;border-radius:4px;background:var(${c})"></span>${tx}</span>`;
  return rCard(`${m + 1}월 공부 달력`, `<div style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px">${['월', '화', '수', '목', '금', '토', '일'].map(x => `<span style="text-align:center;font-size:12px;color:var(--sub)">${x}</span>`).join('')}${cells}</div><div class="row" style="gap:12px;font-size:12.5px;color:var(--sub2);flex-wrap:wrap">${lg('--track', '쉼')}${lg('--mainPale', '조금')}${lg('--mainMid', `${per}문제쯤`)}${lg('--main', '많이')}</div>`, `${d.getUTCDate()}일 중 ${cnt}일 공부`);
}
function rAccLine(o, t) {
  const w0 = rWk0(t), pts = []; for (let i = 7; i >= 0; i--) { const s = rWeekSum(o, w0 - i * 7, t); if (s.q) pts.push([7 - i, rPct(s.ok, s.q)]); }
  if (pts.length < 2) return rCard('주별 정답률', '<span class="sub">두 주 넘게 공부하면 정답률이 어떻게 바뀌는지 보여 드려요</span>');
  const lo = Math.min(...pts.map(p => p[1])) < 50 ? 0 : 50, X = i => 36 + i * 33, Y = v => 106 - (v - lo) / (100 - lo) * 86, a = pts[0][1], b = pts[pts.length - 1][1], last = pts[pts.length - 1];
  return rCard('주별 정답률', `<svg viewBox="0 0 310 130" width="100%" role="img" aria-label="주별 정답률 그래프" style="display:block">${[lo, (lo + 100) / 2, 100].map(v => `<path d="M30 ${f1(Y(v))}H306" style="stroke:var(--track)" stroke-width="1"/><text x="24" y="${f1(Y(v) + 4)}" text-anchor="end" font-size="11" style="fill:var(--sub)">${v}</text>`).join('')}<path d="${pts.map((p, i) => (i ? 'L' : 'M') + f1(X(p[0])) + ' ' + f1(Y(p[1]))).join('')}" fill="none" style="stroke:var(--main)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${f1(X(last[0]))}" cy="${f1(Y(last[1]))}" r="5" style="fill:var(--main)" stroke="${INK}" stroke-width="1.5"/><text x="${f1(X(last[0]) + 9)}" y="${f1(Y(last[1]) + 4)}" font-size="12.5" fill="${INK}">${last[1]}%</text><text x="${f1(X(pts[0][0]))}" y="124" text-anchor="middle" font-size="11.5" style="fill:var(--sub)">${7 - pts[0][0]}주 전</text><text x="${f1(X(7))}" y="124" text-anchor="middle" font-size="11.5" style="fill:var(--sub)">이번 주</text></svg><span class="sub">${Math.abs(a - b) < 2 ? `${pts.length}주 동안 ${b}% 안팎을 지키고 있어요` : `${7 - pts[0][0]}주 전 ${a}%에서 ${b}%로 ${b > a ? '올랐어요' : '내려갔어요'}`}</span>`);
}
function rAll(o, t) {
  const P = rPace(o, t), c = P.c, bk = BOOKS.find(b => b.id === o.book), seen = c.total - c.none, th = DT.themes[o.theme];
  let top;
  if (P.none || P.few) top = `<div class="card" style="align-items:center;text-align:center;padding:18px 14px;gap:6px"><span style="font-size:14px;color:var(--sub2)">단어장을 한 번 다 보는 날 (1회독 예상일)</span><span class="d" style="font-size:22px">사흘쯤 공부하면 알려 드려요</span><div class="row" style="align-self:stretch;gap:10px;padding-top:6px;font-size:13.5px"><div class="bar f1" style="height:8px"><i style="width:${rPct(seen, c.total)}%"></i></div><span class="tn" style="white-space:nowrap">${c.total}개 중 ${seen}개 봄 · ${rPct(seen, c.total)}%</span></div></div>`;
  else {
    const wk = Math.round(P.dpw * 10) / 10, sc = [];
    if (P.dpw < 6.5) { const d = P.calc(7, 1)[0]; sc.push(['매일 공부하면', d]); }
    { const k = (P.qpd + 10) / Math.max(1, P.qpd), d = P.calc(P.dpw, k)[0]; sc.push([`하루 ${Math.round(P.qpd / 5) * 5 + 10}문제로 늘리면`, d]); }
    if (P.dpw > 3.5) sc.push(['일주일에 3일만 하면', P.calc(3, 1)[0]]); else if (P.dpw < 4.5) sc.push(['일주일에 5일 하면', P.calc(5, 1)[0]]);
    top = `<div class="card" style="align-items:center;text-align:center;padding:18px 14px;gap:6px"><span style="font-size:14px;color:var(--sub2)">단어장을 한 번 다 보는 날 (1회독 예상일)</span><span class="d" style="font-size:31px;line-height:1.2;white-space:nowrap">${c.none ? rYmd(t + P.d1) : '다 봤어요'}</span><span style="font-size:13.5px;line-height:1.5;color:var(--sub)">${c.none ? `지금처럼 일주일에 ${Number.isInteger(wk) ? wk : wk.toFixed(1)}일, 하루 ${Math.round(P.qpd)}문제씩 하면<br>${P.d1}일 남았어요` : '이제 복습으로 완벽하게 다지는 중이에요'}</span><div class="row" style="align-self:stretch;gap:10px;padding-top:6px;font-size:13.5px"><div class="bar f1" style="height:8px"><i style="width:${rPct(seen, c.total)}%"></i></div><span class="tn" style="white-space:nowrap">${c.total}개 중 ${seen}개 봄 · ${rPct(seen, c.total)}%</span></div></div>`
      + rCard('앞으로 예상', rChart(o, P, t) + `<div class="row" style="gap:12px;font-size:12.5px;color:var(--sub2)"><span class="row" style="gap:5px"><span style="width:16px;height:3px;border-radius:2px;background:var(--main)"></span>한 번이라도 본 단어</span><span class="row" style="gap:5px"><span style="width:16px;height:3px;border-radius:2px;background:var(--ink)"></span>완벽히 아는 단어</span></div>
<div class="row" style="gap:8px;align-items:stretch">${[['1회독 끝', c.none ? P.d1 : 0, '다 봤어요'], ['모두 완벽', c.steps ? P.d2 : 0, '다 익혔어요']].map(([l, d, z]) => `<div style="flex:1 1 0;min-width:0;background:var(--bg);border-radius:14px;padding:10px 12px;display:flex;flex-direction:column;gap:1px"><span class="d" style="font-size:15px">${l}</span><span class="d" style="font-size:24px;line-height:1.2;white-space:nowrap">${d ? d + '일 뒤' : z}</span><span style="font-size:12.5px;color:var(--sub);white-space:nowrap">${d ? rYmd(t + d) + '쯤' : ''}</span></div>`).join('')}</div>
<span style="font-size:13px;line-height:1.5;color:var(--sub)">단어를 세 번 이어서 맞히면 완벽히 아는 단어가 돼요. 지금까지의 속도가 그대로 간다고 본 값이라, 공부한 날이 쌓일수록 더 정확해져요</span>`, '실선은 지금까지 · 점선은 예상')
      + (c.none ? rCard('이렇게 하면 달라져요', sc.map(([l, d]) => { const df = P.d1 - d; return `<div class="row" style="gap:8px;background:var(--bg);border-radius:14px;padding:9px 12px;font-size:14px"><span class="sp">${l}</span><span class="d" style="font-size:16px;white-space:nowrap">${rMd(t + d)}</span><span style="width:78px;text-align:right;font-size:12.5px;color:var(--sub);white-space:nowrap">${df > 0 ? df + '일 빨라져요' : df < 0 ? -df + '일 늦어져요' : '같아요'}</span></div>`; }).join('')) : '');
  }
  const seg4 = [[c.done, '--ink', '완벽히 알아요'], [c.mid, '--main', '조금 알아요'], [c.seen, '--mainLt', '한 번 봤어요'], [c.none, '--track', '아직 안 봤어요']];
  const days = Object.keys(o.hist).filter(k => rOn(o.hist[k])), tq = days.reduce((a, k) => a + o.hist[k].q, 0), tok = days.reduce((a, k) => a + o.hist[k].ok, 0), tms = days.reduce((a, k) => a + (o.hist[k].ms || 0), 0);
  const hard = Object.entries(o.wr).sort((a, b) => b[1].n - a[1].n).slice(0, 5), fr = o.vil.objs.filter(x => x.t === 'f'), topLv = fr.reduce((a, x) => Math.max(a, x.m ? 0 : x.lv || 1), 0);
  return top
    + rCard(`${bk.name} ${c.total.toLocaleString()}단어`, `<div style="display:flex;gap:2px;height:8px;border-radius:4px;overflow:hidden">${seg4.filter(s => s[0]).map(s => `<span style="flex:${s[0]} 1 0;background:var(${s[1]})"></span>`).join('')}</div>${seg4.map(s => `<div class="row" style="gap:8px;font-size:14px;padding:1px 0"><span style="width:12px;height:12px;border-radius:4px;background:var(${s[1]});flex:none"></span><span class="sp">${s[2]}</span><span class="tn">${s[0]}개</span><span class="tn" style="width:40px;text-align:right;color:var(--sub)">${rPct(s[0], c.total)}%</span></div>`).join('')}`)
    + rCal(o, t) + rAccLine(o, t)
    + `<div class="grid3">${rTile(days.length + '일', '공부한 날', '--t2')}${rTile(tq.toLocaleString(), '푼 문제', '--t0')}${rTile(tq ? rPct(tok, tq) + '%' : '-', '전체 정답률', '--stary')}</div><div class="grid2">${rTile((o.best || 0) + '일', '가장 길게 이어서', '--t3')}${rTile(rDur(rMin(tms)), '모두 공부한 시간', '--t1')}</div>`
    + rCard('가장 어려워하는 단어', hard.length ? hard.map(([w, x]) => rWord(w, x.n + '번 틀림')).join('') : '<span class="sub">오답노트가 비어 있어요</span>')
    + rCard('마을 소식', rKv('마을', `${th.name} · 완성 ${vilScore(o.vil, th).pct}%`) + rKv('함께 사는 친구', fr.length + '마리') + (topLv ? rKv('가장 많이 자란 친구', `${topLv}단계 ${DT.lvn[topLv - 1]}`) : '') + rKv('조합 도감', `${th.sets.reduce((a, s) => a + s.recs.length, 0)}가지 중 ${foundCount(o)}가지`) + rKv('얻은 칭호', `${Object.keys(o.titles || {}).length}개`));
}

SCR.parent = {
  view(p) {
    if (!S.owners.length) return `<div class="scr">${topbar('부모 리포트')}<div class="card" style="align-items:center;padding:28px 14px"><span class="sub" style="font-size:15px;text-align:center">아직 마을이 없어요.<br>먼저 아이와 마을을 만들어 주세요</span></div></div>`;
    const i = clamp(p.i == null ? Math.max(0, S.cur) : p.i, 0, S.owners.length - 1), o = S.owners[i], t = dnum(today());
    if (RP.i !== i) { RP.i = i; RP.day = null; RP.wk = 0; }
    const n = RP.day == null ? t : Math.min(RP.day, t);
    const body = RP.tab === 'day' ? rDay(o, n, t) : RP.tab === 'week' ? rWeek(o, rWk0(t) + RP.wk * 7, t) : rAll(o, t);
    return `<div class="scr" style="gap:12px">${topbar('부모 리포트', `<span class="pill" style="height:36px;padding:0 12px 0 6px;gap:6px;font-size:14px">${stk(DT.themes[o.theme].hero, 26)}${esc(o.name)}</span>`)}
${S.owners.length > 1 ? seg('parOwner', S.owners.map((x, j) => [j, esc(x.name)]), i) : ''}${seg('rpTab', [['day', '하루'], ['week', '한 주'], ['all', '전체']], RP.tab)}${rLevel(o)}${body}
<div class="hint" style="text-align:center">기록은 이 기기에만 저장되고 밖으로 보내지 않아요</div></div>`;
  },
  after() { const i = clamp(R.p.i == null ? Math.max(0, S.cur) : R.p.i, 0, Math.max(0, S.owners.length - 1)); applyTheme(S.owners[i] ? S.owners[i].theme : 'dino'); },
  leave() { applyTheme(S.cur >= 0 && O() ? O().theme : 'dino'); }
};
ACT.rpTab = d => { RP.tab = d.v; render(); const s = $('.scr'); if (s) s.scrollTop = 0; };
ACT.rpDay = d => { const t = dnum(today()); RP.day = Math.min(t, (RP.day == null ? t : RP.day) + (+d.d)); render(); };
ACT.rpWk = d => { RP.wk = Math.min(0, RP.wk + (+d.d)); render(); };
ACT.report = () => go('parent', { i: S.cur });
