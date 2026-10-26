/* ================= 모의고사 ================= */
'use strict';
const MOCK_SPEC = {
  full5: { name: 'N5 정식 모의고사', lv: 5, s: [
    { id: 's1', name: '言語知識（文字・語彙）', ko: '언어지식 (문자·어휘)', min: 20, parts: [['yomi', 7], ['hyouki', 5], ['bunmyaku', 6], ['para', 3]] },
    { id: 's2', name: '言語知識（文法）・読解', ko: '언어지식 (문법) · 독해', min: 40, parts: [['gram', 9], ['star', 4], ['bunshou', 1], ['short', 2], ['mid', 1], ['info', 1]] },
    { id: 's3', name: '聴解', ko: '청해', min: 30, parts: [['kadai', 7], ['point', 6], ['hatsuwa', 5], ['sokuji', 6]] }] },
  quick5: { name: 'N5 빠른 모의고사', lv: 5, s: [
    { id: 's1', name: '言語知識（文字・語彙）', ko: '언어지식 (문자·어휘)', min: 10, parts: [['yomi', 4], ['hyouki', 2], ['bunmyaku', 3], ['para', 2]] },
    { id: 's2', name: '言語知識（文法）・読解', ko: '언어지식 (문법) · 독해', min: 20, parts: [['gram', 5], ['star', 2], ['short', 2], ['info', 1]] },
    { id: 's3', name: '聴解', ko: '청해', min: 15, parts: [['kadai', 3], ['point', 3], ['hatsuwa', 3], ['sokuji', 3]] }] },
  full: { name: 'N4 정식 모의고사', lv: 4, s: [
    { id: 's1', name: '言語知識（文字・語彙）', ko: '언어지식 (문자·어휘)', min: 25, parts: [['yomi', 7], ['hyouki', 5], ['bunmyaku', 8], ['para', 4], ['usage', 4]] },
    { id: 's2', name: '言語知識（文法）・読解', ko: '언어지식 (문법) · 독해', min: 55, parts: [['gram', 13], ['star', 4], ['bunshou', 1], ['short', 3], ['mid', 1], ['info', 1]] },
    { id: 's3', name: '聴解', ko: '청해', min: 35, parts: [['kadai', 8], ['point', 7], ['hatsuwa', 5], ['sokuji', 8]] }] },
  quick: { name: 'N4 빠른 모의고사', lv: 4, s: [
    { id: 's1', name: '言語知識（文字・語彙）', ko: '언어지식 (문자·어휘)', min: 13, parts: [['yomi', 4], ['hyouki', 2], ['bunmyaku', 4], ['para', 2], ['usage', 2]] },
    { id: 's2', name: '言語知識（文法）・読解', ko: '언어지식 (문법) · 독해', min: 28, parts: [['gram', 7], ['star', 2], ['bunshou', 1], ['short', 2], ['info', 1]] },
    { id: 's3', name: '聴解', ko: '청해', min: 18, parts: [['kadai', 4], ['point', 3], ['hatsuwa', 3], ['sokuji', 4]] }] },
};
let M = null; // 진행 중인 모의고사
let MOCK_WEAK = new Set(); // 지난 모의고사에서 틀린 것 (구성은 그대로, 일부를 다시 확인)
const WEEK_KO = ['일', '월', '화', '수', '목', '금', '토'];
function mockFresh(list, n) {
  const seenM = S.mockSeen || {};
  const ok = list.filter(x => !S.bad[x.key]);
  // 지난번에 틀린 것 중 일부(최대 1/4)를 다시 내서 정말 고쳐졌는지 확인
  const w = shuffle(ok.filter(x => MOCK_WEAK.has(x.key))).slice(0, Math.ceil(n / 4));
  const ws = new Set(w.map(x => x.key));
  const a = shuffle(ok.filter(x => !ws.has(x.key) && !seenM[x.key] && !S.it[x.key]));
  const b = shuffle(ok.filter(x => !ws.has(x.key) && !seenM[x.key] && S.it[x.key]));
  const c = shuffle(ok.filter(x => !ws.has(x.key) && seenM[x.key]));
  return shuffle(w.concat(a, b, c).slice(0, n));
}
// N5 모의고사는 N5 단어·문법과 쉬운 지문만 (모자라면 쉬운 순서로 채워요)
function lvPool(list, lv, n) {
  if (lv !== 5) return list;
  const seenM = S.mockSeen || {};
  const lvd = list.filter(x => x.lv === 5);
  if (lvd.filter(x => !seenM[x.key]).length >= n) return lvd;
  return lvd.concat(easyFirst(list.filter(x => x.lv !== 5 && x.e))); // N5 전용이 모자라면 쉬운 지문으로
}
function buildMock(kind) {
  const spec = MOCK_SPEC[kind], LV = spec.lv;
  const lm = lastMock(LV); MOCK_WEAK = new Set(lm && lm.wrong ? lm.wrong : []);
  const secs = spec.s.map(sec => {
    const qs = [];
    sec.parts.forEach(([t, n]) => {
      if (['yomi', 'hyouki', 'bunmyaku'].includes(t)) {
        const pool = VOC.filter(v => !S.bad[v.key] && (t === 'bunmyaku' ? v.an : v.hasK));
        const n4 = LV === 5 ? [] : mockFresh(pool.filter(v => v.lv === 4), n * 3), n5 = mockFresh(pool.filter(v => v.lv === 5), n * 3);
        const cands = []; for (let i = 0; i < n * 3; i++) { if (n4[i]) cands.push(n4[i]); if ((LV === 5 || i % 2 === 0) && n5[i]) cands.push(n5[i]); }
        let c = 0; const used = new Set();
        for (const v of cands) { if (used.has(v.key)) continue; const q = qVocab(v, t); if (q) { qs.push(q); used.add(v.key); if (++c >= n) break; } }
      } else if (t === 'para') mockFresh(lvPool(PARA, LV, n), n).forEach(x => qs.push(qPara(x)));
      else if (t === 'usage') mockFresh(USE, n).forEach(x => qs.push(qUsage(x)));
      else if (t === 'gram') mockFresh(lvPool(GRAM, LV, n), n).forEach(g => qs.push(qGram(g, rnd(g.q.length))));
      else if (t === 'star') mockFresh(lvPool(GRAM.filter(g => g.s.length), LV, n), n).forEach(g => qs.push(qStar(g, rnd(g.s.length))));
      else if (t === 'bunshou') mockFresh(lvPool(BUN, LV, n), n).forEach(b => qBunshou(b).forEach(q => qs.push(q)));
      else if (['short', 'mid', 'info'].includes(t)) mockFresh(lvPool(READ.filter(r => r.type === t), LV, n), n).forEach(b => qRead(b).forEach(q => qs.push(q)));
      else mockFresh(lvPool(LIS.filter(l => l.type === t), LV, n), n).forEach(b => qs.push(qListen(b)));
    });
    qs.forEach(q => { q._ans = null; });
    return { id: sec.id, name: sec.name, ko: sec.ko, min: sec.min, qs, listen: sec.id === 's3' };
  });
  return { kind, lv: LV, secs, si: 0, qi: 0, phase: 'intro', t0: Date.now(), secStart: 0, timer: 0, baseline: false, mute: false };
}
function mockMenu() { tab('mock'); }
function mockIntro(kind, baseline) {
  if (mockLoad()) {
    modal(`<div class="mt">⏸ 멈춘 모의고사가 있어요</div><div class="md">이어서 볼까요, 아니면 버리고 새로 시작할까요?</div>
    <div class="acts"><button class="btn w" onclick="closeModal();mockDiscard();mockIntro('${kind}',${!!baseline})">새로 시작</button><button class="btn" onclick="closeModal();mockResume()">이어서 보기</button></div>`);
    return;
  }
  M = buildMock(kind); M.baseline = !!baseline || !lastMock(M.lv);
  if (VIEW && VIEW.name === 'mock') { VIEW = { name: 'mock' }; render(); window.scrollTo(0, 0); } else go('mock');
}
function mockSetKind(k) { if (!M || M.phase !== 'intro' || M.kind === k) return; const b = M.baseline; M = buildMock(k); M.baseline = b || !lastMock(M.lv); render(true); }
function mockHTML() {
  if (!M) return mockTabHTML();
  const sec = M.secs[M.si];
  if (M.phase === 'intro') {
    const spec = MOCK_SPEC[M.kind];
    const pick2 = M.baseline ? `<div class="lv" style="margin-top:12px">${(M.lv === 5 ? [['quick5', '⚡', 'N5 빠른 진단', '약 35문항 · 45분 · 처음엔 이걸 추천해요'], ['full5', '📝', 'N5 정식 모의고사', '실제 N5와 같은 구성 · 90분']] : [['quick', '⚡', 'N4 빠른 진단', '약 45문항 · 60분 · 처음엔 이걸 추천해요'], ['full', '📝', 'N4 정식 모의고사', '실제 시험과 같은 85문항 · 115분']]).map(([k, e, n, d]) => `<button class="lvopt ${M.kind === k ? 'on' : ''}" onclick="mockSetKind('${k}')"><span class="e">${e}</span><div><div class="n">${n}</div><div class="d">${d}</div></div></button>`).join('')}</div>` : '';
    return `<div class="top"><button class="back" onclick="mockQuit()">✕ ${M.baseline ? '나중에' : '그만'}</button><span class="sp"></span><span class="tag">${esc(spec.name)}</span></div>
    ${M.baseline ? `<div class="card result"><div class="big mon">${creature(S.avatar, {})}</div><div class="t">📍 먼저 지금 실력을 재 볼게요</div><div class="sub">이 점수가 <b>출발점</b>이 돼요. 앞으로 매주 모의고사를 보면 얼마나 늘었는지 그래프로 보여 줄게요.${S.kanaLv === 0 ? '<br><br>아직 가나를 모르면 점수가 낮게 나오는 게 정상이에요. 모르는 문제는 \'모르겠어요\', 한 영역을 통째로 모르면 위의 \'제출\'을 눌러 넘어가도 돼요 🙂' : ''}</div>${pick2}</div>` : ''}
    <div class="card"><div class="h2">📝 ${esc(spec.name)}${M.baseline ? ' · 실력 진단' : ''}</div><div class="sub">실제 JLPT N${M.lv}와 같은 순서·유형이에요. 시간이 끝나면 그 영역은 자동으로 제출돼요.</div>
    <div class="clist" style="margin-top:12px">${M.secs.map((s, i) => `<div class="citem"><span class="p" style="font-size:14px">${esc(s.name)}</span><span class="m">${s.qs.length}문항</span><span class="tag">${s.min}분</span></div>`).join('')}</div>
    <div class="sub" style="margin-top:10px">• N${M.lv} 합격 기준: 총점 ${passLine(M.lv)}/180 이상, 언어지식·독해 38/120 이상, 청해 19/60 이상<br>• 모르는 문제는 '모르겠어요'를 눌러요 (찍기 방지)<br>• 청해는 소리가 한 번만 나와요. 이어폰을 준비해 주세요 🎧<br>• 중간에 전화가 오면 ✕ → '잠깐 멈추기'로 멈췄다가 이어서 볼 수 있어요</div></div>
    <div class="acts"><button class="btn full" onclick="mockStartSec()">${esc(sec.ko)} 시작 ▶</button></div>`;
  }
  if (M.phase === 'break') {
    const prev = M.secs[M.si - 1];
    return `<div class="card result"><div class="big mon">${creature(S.avatar, {})}</div><div class="t">${esc(prev.ko)} 끝! 수고했어요</div><div class="sub">잠깐 쉬고 다음 영역으로 가요</div></div>
    <div class="card" style="margin-top:14px"><div class="h3">다음: ${esc(sec.name)}</div><div class="sub">${sec.qs.length}문항 · ${sec.min}분${sec.listen ? '<br>🎧 소리가 한 번만 나와요. 볼륨을 확인하세요.' : ''}</div>
    ${sec.listen ? `<div class="acts"><button class="btn sm w" onclick="TTS.say('これから聴解の試験を始めます。')">🔊 소리 테스트</button><button class="btn sm w" onclick="mockMuteAsk()">🎧 소리를 못 들어요</button></div>` : ''}</div>
    <div class="acts"><button class="btn full" onclick="mockStartSec()">시작 ▶</button></div>`;
  }
  // 문제
  const q = sec.qs[M.qi]; CUR_Q = q;
  const left = Math.max(0, sec.min * 60 - Math.floor((Date.now() - M.secStart) / 1000));
  const answered = sec.qs.filter(x => x._ans != null).length;
  let h = `<div class="qhead"><button class="back" onclick="mockQuit()">✕</button><span class="tag">${esc(sec.ko)}</span><span class="sp"></span><span class="timer ${left < 120 ? 'low' : ''}" id="mtimer">${fmtT(left)}</span></div>
  <div class="row" style="margin-bottom:8px"><b class="num">${M.qi + 1}</b><span class="small">/ ${sec.qs.length} · 답한 문제 ${answered}</span><span class="sp"></span>${sec.listen ? '' : `<button class="chip" onclick="mockNavToggle()">목록</button>`}<button class="chip" onclick="mockSubmitAsk()">제출</button></div>`;
  if (M.nav && !sec.listen) h += `<div class="qnav">${sec.qs.map((x, i) => `<button class="${x._ans != null ? 'a' : ''} ${i === M.qi ? 'cur' : ''}" onclick="M.qi=${i};M.nav=0;render()">${i + 1}</button>`).join('')}</div>`;
  const muted = sec.listen && M.mute;
  const saveMute = S.set.mute; S.set.mute = muted;
  h += quizHTML(q, null, true);
  S.set.mute = saveMute;
  h += `<button class="unknown" onclick="mockAnswer(-1)">🤔 모르겠어요</button>`;
  if (sec.listen) h += `<div class="acts"><button class="btn full" onclick="mockNext()">${M.qi < sec.qs.length - 1 ? '다음 문제 ▶' : '청해 제출 ▶'}</button></div>`;
  else h += `<div class="acts"><button class="btn w" ${M.qi === 0 ? 'disabled' : ''} onclick="M.qi--;mockAutosave();render()">◀ 이전</button>${M.qi < sec.qs.length - 1 ? `<button class="btn" onclick="M.qi++;mockAutosave();render();window.scrollTo(0,0)">다음 ▶</button>` : `<button class="btn p" onclick="mockSubmitAsk()">제출 ✓</button>`}</div>`;
  return h;
}

/* ---------- 멈추기 · 이어서 보기 (전화가 와도, 앱이 꺼져도 이어서) ---------- */
function mockKV(v) {
  if (v === undefined) {
    let j = null;
    try { if (HAS && Android.loadKey) j = Android.loadKey('mock'); } catch (e) { }
    if (!j) try { j = localStorage.getItem('n4mock'); } catch (e) { }
    return j || null;
  }
  try { if (HAS && Android.saveKey) Android.saveKey('mock', v || ''); } catch (e) { }
  try { if (v) localStorage.setItem('n4mock', v); else localStorage.removeItem('n4mock'); } catch (e) { }
}
function mockElapsed() { return M && M.phase === 'q' ? Math.max(0, Math.round((Date.now() - M.secStart) / 1000)) : 0; }
function mockSerialize() {
  const sq = q => ({
    type: q.type, key: q.key, tags: q.tags, html: q.html, opts: q.opts, title: q.title, row3: q.row3, ko: q.ko,
    ps: q.passage ? q.passage() : null, mh: q.muteHTML ? q.muteHTML() : null, audio: q.audio, listen: q.listen,
    group: q.group, gi: q.gi, gn: q.gn, _ans: q._ans, _ok: q._ok, _played: q._played,
  });
  return { v: 1, ts: Date.now(), kind: M.kind, baseline: M.baseline, si: M.si, qi: M.qi, phase: M.phase, mute: M.mute, el: mockElapsed(), weak: [...MOCK_WEAK],
    secs: M.secs.map(s => ({ id: s.id, name: s.name, ko: s.ko, min: s.min, listen: s.listen, time: s.time, qs: s.qs.map(sq) })) };
}
let mockSaveT = 0;
function mockAutosave(now) {
  clearTimeout(mockSaveT);
  const f = () => { if (M && M.phase !== 'intro') try { mockKV(JSON.stringify(mockSerialize())); } catch (e) { } };
  if (now) f(); else mockSaveT = setTimeout(f, 400);
}
function mockLoad() { const j = mockKV(); if (!j) return null; try { const o = JSON.parse(j); return o && o.secs ? o : null; } catch (e) { return null; } }
function mockDiscard() { clearTimeout(mockSaveT); mockKV(''); }
function mockPausedInfo() {
  const o = mockLoad(); if (!o) return null;
  const s = o.secs[o.si] || o.secs[0];
  return { o, txt: `${MOCK_SPEC[o.kind].name}${o.baseline ? ' (실력 진단)' : ''} · ${s.ko} ${o.phase === 'q' ? (o.qi + 1) + '번' : '시작 전'}에서 멈춤` };
}
function mockPause() {
  if (!M) return;
  mockAutosave(true);
  clearInterval(M.timer); TTS.stop();
  M = null; VIEW = null; STACK = [];
  tab('home'); toast('⏸ 멈췄어요. 홈에서 이어서 볼 수 있어요');
}
function mockResume() {
  const o = mockLoad(); if (!o) { toast('이어서 볼 모의고사가 없어요'); return; }
  MOCK_WEAK = new Set(o.weak || []);
  const dq = x => Object.assign({}, x, { item: ITEM[x.key], passage: x.ps != null ? (() => x.ps) : undefined, muteHTML: x.mh != null ? (() => x.mh) : undefined });
  M = { kind: o.kind, lv: MOCK_SPEC[o.kind].lv, baseline: o.baseline, si: o.si, qi: o.qi, phase: o.phase === 'intro' ? 'break' : o.phase, mute: o.mute, t0: Date.now(), timer: 0, secStart: 0,
    secs: o.secs.map(s => Object.assign({}, s, { qs: s.qs.map(dq) })) };
  if (M.si === 0 && M.phase === 'break') M.phase = 'intro';
  VIEW = null; STACK = []; TAB = 'mock';
  go('mock');
  if (M.phase === 'q') {
    M.secStart = Date.now() - (o.el || 0) * 1000;
    const sec = M.secs[M.si], q = sec.qs[M.qi];
    if (sec.listen && q && q._ans == null) q._played = 0; // 끊긴 문제는 다시 들을 수 있게
    clearInterval(M.timer); M.timer = setInterval(mockTick, 1000);
    render();
    if (sec.listen && !M.mute) setTimeout(playQ, 700);
  }
  toast('▶ 멈춘 곳부터 이어서 봐요');
}
// 앱이 뒤로 가 있는 동안(전화 등)은 시간을 멈춰요
let mockHiddenAt = 0;
document.addEventListener('visibilitychange', () => {
  if (!M || M.phase !== 'q') return;
  if (document.hidden) {
    mockHiddenAt = Date.now(); mockAutosave(true);
    const sec = M.secs[M.si], q = sec.qs[M.qi];
    if (sec.listen && TTS.playing) { TTS.stop(); if (q && q._ans == null) q._played = 0; }
  } else if (mockHiddenAt) {
    M.secStart += Date.now() - mockHiddenAt; mockHiddenAt = 0;
    const el = $('#lstate'); if (el) el.textContent = '🔊를 눌러 다시 들어요';
  }
});
function fmtT(s) { return Math.floor(s / 60) + ':' + pad(s % 60); }
function mockNavToggle() { M.nav = !M.nav; render(true); }
function mockMuteAsk() {
  modal(`<div class="mt">🎧 소리를 못 듣는 상황인가요?</div><div class="md">청해를 <b>대본 읽기</b>로 풀 수 있어요. 대신 이번 청해 점수는 실제보다 높게 나올 수 있어서, '참고용'으로 표시할게요.</div>
  <div class="acts"><button class="btn w" onclick="closeModal()">소리로 들을게요</button><button class="btn" onclick="M.mute=true;closeModal();toast('청해를 대본으로 풀어요')">대본으로 풀기</button></div>`);
}
function mockStartSec() {
  M.phase = 'q'; M.qi = 0; M.secStart = Date.now();
  clearInterval(M.timer);
  M.timer = setInterval(mockTick, 1000);
  render(); window.scrollTo(0, 0); mockAutosave(true);
  const sec = M.secs[M.si];
  if (sec.listen && !M.mute) setTimeout(playQ, 600);
}
function mockTick() {
  if (!M || M.phase !== 'q' || !VIEW || VIEW.name !== 'mock') return;
  const sec = M.secs[M.si];
  const left = Math.max(0, sec.min * 60 - Math.floor((Date.now() - M.secStart) / 1000));
  const el = $('#mtimer'); if (el) { el.textContent = fmtT(left); el.classList.toggle('low', left < 120); }
  if (left <= 0 && !sec.listen) { toast('⏰ 시간 종료! 자동 제출했어요'); mockSubmitSec(); }
}
function mockAnswer(i) {
  const sec = M.secs[M.si], q = sec.qs[M.qi];
  q._ans = i; q._ok = !!(i >= 0 && q.opts[i] && q.opts[i].ok);
  vib(15); mockAutosave();
  if (sec.listen) { render(true); return; }
  // 자동으로 다음 문제
  const at = M.qi;
  if (at < sec.qs.length - 1) { setTimeout(() => { if (M && M.secs[M.si] === sec && M.qi === at && M.phase === 'q') { M.qi++; render(); window.scrollTo(0, 0); } }, 260); render(true); }
  else render(true);
}
function mockNext() {
  const sec = M.secs[M.si];
  TTS.stop();
  if (M.qi < sec.qs.length - 1) { M.qi++; mockAutosave(); render(); window.scrollTo(0, 0); if (!M.mute) setTimeout(playQ, 500); }
  else mockSubmitSec();
}
function mockSubmitAsk() {
  const sec = M.secs[M.si], un = sec.qs.filter(x => x._ans == null).length;
  if (!un) { mockSubmitSec(); return; }
  modal(`<div class="mt">제출할까요?</div><div class="md">아직 답하지 않은 문제가 ${un}개 있어요. 답하지 않은 문제는 오답 처리돼요.</div>
  <div class="acts"><button class="btn w" onclick="closeModal()">더 풀기</button><button class="btn p" onclick="closeModal();mockSubmitSec()">제출</button></div>`);
}
function mockSubmitSec() {
  clearInterval(M.timer); TTS.stop();
  const sec = M.secs[M.si]; sec.time = Math.round((Date.now() - M.secStart) / 1000);
  if (M.si < M.secs.length - 1) { M.si++; M.phase = 'break'; render(); window.scrollTo(0, 0); mockAutosave(true); }
  else mockFinish();
}
function mockQuit() {
  if (M && M.phase === 'intro') {
    if (M.baseline) modal(`<div class="mt">진단은 나중에 볼까요?</div><div class="md">출발점 점수가 있어야 성장 그래프와 예상 점수가 정확해져요. 앱을 다시 열면 또 물어볼게요.</div>
    <div class="acts"><button class="btn w" onclick="closeModal();M=null;VIEW=null;STACK=[];tab('home')">나중에</button><button class="btn" onclick="closeModal()">지금 볼래요</button></div>`);
    else { M = null; VIEW = null; STACK = []; tab('mock'); }
    return;
  }
  modal(`<div class="mt">모의고사를 멈출까요?</div><div class="md"><b>잠깐 멈추기</b>를 누르면 지금까지 푼 답과 남은 시간이 저장돼서 나중에 이어서 볼 수 있어요.</div>
  <div class="lv" style="margin-top:12px"><button class="lvopt" onclick="closeModal();mockPause()"><span class="e">⏸</span><div><div class="n">잠깐 멈추기</div><div class="d">홈에서 '이어서 보기'로 계속해요</div></div></button>
  <button class="lvopt" onclick="closeModal()"><span class="e">▶</span><div><div class="n">계속 보기</div></div></button>
  <button class="lvopt" onclick="closeModal();clearInterval(M&&M.timer);M=null;TTS.stop();mockDiscard();VIEW=null;STACK=[];tab('mock')"><span class="e">🗑️</span><div><div class="n">그만두기</div><div class="d">이번 모의고사는 기록되지 않아요</div></div></button></div>`);
}
function mockFinish() {
  const sec = {}; AREAS.forEach(a => sec[a] = [0, 0]);
  const ty = {}; const wrong = [];
  const seenM = S.mockSeen || (S.mockSeen = {});
  M.secs.forEach(s => s.qs.forEach(q => {
    const area = TYPE[q.type].area, ok = !!q._ok;
    sec[area][1]++; if (ok) sec[area][0]++;
    const T = ty[q.type] || (ty[q.type] = [0, 0]); T[1]++; if (ok) T[0]++;
    if (!ok) wrong.push(q.key);
    seenM[q.key] = 1;
    const o = q._ans >= 0 ? q.opts[q._ans] : null;
    record(q, ok, o && !ok ? o.tag : null, { mock: true });
  }));
  const acc = a => sec[a][1] ? sec[a][0] / sec[a][1] : 0;
  const lk = Math.round(120 * (.38 * acc('moji') + .37 * acc('bunpou') + .25 * acc('dokkai'))), ls = Math.round(60 * acc('choukai'));
  const pi = passInfo(lk, ls, M.lv);
  const rec = { ts: Date.now(), d: dstr(), kind: M.kind, lv: M.lv, base: M.baseline, sec, ty, lk, ls, total: pi.total, pass: pi.pass, mute: M.mute, wrong: [...new Set(wrong)], time: M.secs.map(s => s.time || 0) };
  S.mocks.push(rec); mockDiscard();
  if (S.set.mockDay == null) S.set.mockDay = new Date().getDay();
  touchStreak(); snapPred(); checkUnlocks(); save(true); syncReminders();
  const idx = S.mocks.length - 1;
  M = null; VIEW = null; STACK = [];
  TAB = 'mock'; go('mockResult', { idx, fresh: true });
  if (pi.pass) setTimeout(() => burst(40), 300);
}
function mockResultHTML(idx) {
  const r = S.mocks[idx]; if (!r) return mockTabHTML();
  const RL = mLv(r);
  const prev = S.mocks.slice(0, idx).reverse().find(x => mLv(x) === RL);
  const d = prev ? r.total - prev.total : null;
  const accp = a => r.sec[a][1] ? Math.round(r.sec[a][0] / r.sec[a][1] * 100) : 0;
  return `<div class="top"><button class="back" onclick="VIEW=null;STACK=[];tab('mock')">◀ 기록</button><span class="sp"></span><span class="tag">${esc(MOCK_SPEC[r.kind].name)} · ${esc(r.d.replace(/-/g, '.'))}</span></div>
  <div class="stack"><div class="card result"><div class="big mon">${creature(S.avatar, {})}</div>
  <div class="t">${r.base ? '📍 출발점 기록 완료!' : r.pass ? '합격 점수예요! 🎉' : '조금만 더! 💪'}</div>
  <div class="score">${r.total}<small> / 180</small></div>
  <div class="pass ${r.pass ? 'y' : 'n'}">${r.pass ? `✅ N${RL} 합격 기준 충족` : `❌ N${RL} 합격 기준 미달 (합격선 ${passLine(RL)})`}</div>
  ${d != null ? `<div class="row" style="justify-content:center;margin-top:10px"><span class="tag ${d >= 0 ? 'm' : 'p'}">지난번보다 ${d >= 0 ? '▲' : '▼'} ${Math.abs(d)}점</span></div>` : ''}
  ${r.mute ? '<div class="small" style="margin-top:6px">※ 청해를 대본으로 풀어서 청해 점수는 참고용이에요</div>' : ''}</div>
  <div class="secs"><div class="sec"><div class="t">언어지식·독해</div><b>${r.lk}<small>/120</small></b><div class="bar"><i style="width:${r.lk / 1.2}%"></i></div><div class="ok" style="color:${r.lk >= 38 ? 'var(--ok)' : 'var(--no)'}">기준점 38 ${r.lk >= 38 ? '통과' : '미달'}</div></div>
  <div class="sec"><div class="t">청해</div><b>${r.ls}<small>/60</small></b><div class="bar k"><i style="width:${r.ls / .6}%"></i></div><div class="ok" style="color:${r.ls >= 19 ? 'var(--ok)' : 'var(--no)'}">기준점 19 ${r.ls >= 19 ? '통과' : '미달'}</div></div></div>
  <div class="card"><div class="h3">영역별 정답률</div>${AREAS.map(a => `<div class="trow"><span>${AREA_KO[a]}</span><div class="bar"><i style="width:${accp(a)}%"></i></div><b>${r.sec[a][0]}/${r.sec[a][1]}</b></div>`).join('')}
  <div class="h3" style="margin-top:14px">유형별</div>${Object.entries(r.ty).map(([t, v]) => `<div class="trow"><span>${esc(TYPE[t].ko)}</span><div class="bar ${TYPE[t].area === 'choukai' ? 'k' : TYPE[t].area === 'dokkai' ? 'm' : TYPE[t].area === 'bunpou' ? 'l' : ''}"><i style="width:${v[1] ? v[0] / v[1] * 100 : 0}%"></i></div><b>${v[0]}/${v[1]}</b></div>`).join('')}</div>
  ${RL === 5 && r.pass && stage() === 'r5' && idx === S.mocks.length - 1 ? `<div class="card" style="background:#E4F3EA"><div class="h3">🐥 N5 합격 점수예요!</div><div class="sub">N5 실력은 충분해요.${S.examLv === 5 ? ' 목표가 N5라면 이대로 실전 연습을 계속하면 돼요. N4도 준비하고 싶으면' : ''} N4 단어 단계로 넘어갈까요? (N4도 단어 → 문법 → 실전 순서예요)</div><div class="acts"><button class="btn" onclick="gates().r5=1;save();toast('N4 단어 단계로 넘어갔어요 📘');render()">📘 N4 단어 단계로 가기</button></div></div>` : ''}
  <div class="card"><div class="h3">💡 다음 일주일 공부 포인트</div><div class="sub">${mockAdvice(r)}</div></div>
  ${idx === S.mocks.length - 1 ? `<div class="card"><div class="h3">🗓️ ${r.base ? '매주 몇 요일에 모의고사를 볼까요?' : '다음 정기 모의고사'}</div><div class="sub">${nextMockDate() ? `다음: <b>${fmtMD(nextMockDate())}</b> · 오늘 틀린 개념은 그날까지 학습 계획에 먼저 나와요` : ''}</div>${mockScheduleHTML()}</div>` : ''}
  ${S.mocks.filter(x => mLv(x) === RL).length > 1 ? mockChartCard(RL) : ''}
  <div class="acts">${r.wrong.length ? `<button class="btn p" onclick="startSession(S.mocks[${idx}].wrong.filter(k=>ITEM[k]).map(k=>({kind:'item',key:k})),{exam:true})">틀린 문제 다시 풀기 (${r.wrong.length})</button>` : ''}<button class="btn w" onclick="VIEW=null;STACK=[];tab('home')">홈으로</button></div></div>`;
}
function mockAdvice(r) {
  const tys = Object.entries(r.ty).filter(([t, v]) => v[1]).map(([t, v]) => [t, v[0] / v[1]]).sort((a, b) => a[1] - b[1]);
  const worst = tys.slice(0, 2).map(([t]) => TYPE[t].ko);
  const lines = [];
  if (r.ls < 19) lines.push('🎧 청해가 기준점 미달이에요. 하루 청해 개수를 5개 이상으로 늘려 보세요.');
  if (r.lk < 38) lines.push('📚 언어지식·독해가 기준점 미달이에요. 매일 새 단어와 복습을 빠뜨리지 마세요.');
  if (worst.length) lines.push(`🧩 특히 <b>${worst.join(', ')}</b> 유형이 약해요. 문제 탭에서 이 유형을 집중 연습해요.`);
  if (r.total >= S.target) lines.push('🌟 목표 점수를 넘었어요! 다음 주에도 유지되는지 확인해요.');
  lines.push('🗓️ 일주일 뒤 정기 모의고사에서 틀렸던 것 일부가 다시 나와요. 고쳐졌는지 확인해 봐요!');
  return lines.join('<br>');
}
let CHART_MODE = 'total', CHART_LV = 0;
const CHART_DEF = {
  total: { ko: '총점', max: 180, f: m => m.total, lines: lv => [[passLine(lv), '#D46A5C', '합격선 ' + passLine(lv)]].concat(lv === S.examLv ? [[S.target, '#4E9E73', '목표 ' + S.target]] : []) },
  lk: { ko: '언어지식·독해', max: 120, f: m => m.lk, lines: () => [[38, '#D46A5C', '기준점 38']] },
  ls: { ko: '청해', max: 60, f: m => m.ls, lines: () => [[19, '#D46A5C', '기준점 19']] },
};
function mockChart(small, mode, lv) {
  lv = lv || mLv(lastMock() || {});
  const ms = S.mocks.filter(m => mLv(m) === lv).slice(small ? -8 : -16);
  if (!ms.length) return '';
  const C = CHART_DEF[mode || 'total'];
  const W = 320, H = small ? 120 : 200, L = 30, R = 12, T = 16, B = 22;
  const x = i => ms.length === 1 ? (L + W - R) / 2 : L + 12 + i * (W - L - R - 16) / (ms.length - 1);
  const y = v => T + (1 - v / C.max) * (H - T - B);
  const ticks = [0, .25, .5, .75, 1].map(f => Math.round(C.max * f));
  const grid = ticks.map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#EDE2C8" stroke-width="1"/><text x="${L - 5}" y="${y(v) + 3.5}" font-size="9" text-anchor="end" fill="#8E8098">${v}</text>`).join('');
  const refs = C.lines(lv).map(([v, col]) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${col}" stroke-width="1.6" stroke-dasharray="5 4"/>`).join('');
  const pts = ms.map((m, i) => x(i) + ',' + y(C.f(m))).join(' ');
  const area = ms.length > 1 ? `<polygon fill="rgba(242,208,122,.28)" points="${x(0)},${y(0)} ${pts} ${x(ms.length - 1)},${y(0)}"/>` : '';
  const passOf = m => mode === 'lk' ? m.lk >= 38 : mode === 'ls' ? m.ls >= 19 : m.pass;
  const dots = ms.map((m, i) => `<circle cx="${x(i)}" cy="${y(C.f(m))}" r="${m.base ? 6 : 4.5}" fill="${passOf(m) ? '#9CCDB6' : '#F2D07A'}" stroke="#3B2F4A" stroke-width="2"/>${small && i !== ms.length - 1 ? '' : `<text x="${x(i)}" y="${y(C.f(m)) - 9}" font-size="10" text-anchor="middle" fill="#3B2F4A" font-weight="700">${C.f(m)}</text>`}`).join('');
  const xl = ms.map((m, i) => (ms.length <= 7 || i % 2 === 0 || i === ms.length - 1) ? `<text x="${x(i)}" y="${H - 6}" font-size="9" text-anchor="middle" fill="#8E8098">${m.base ? '📍' : ''}${m.d.slice(5).replace('-', '/')}</text>` : '').join('');
  return `<svg viewBox="0 0 ${W} ${H}">${grid}${area}${refs}<polyline fill="none" stroke="#3B2F4A" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" points="${pts}"/>${dots}${xl}</svg>`;
}
function mockChartCard(lvIn) {
  const lvs = [...new Set(S.mocks.map(mLv))].sort();
  const lv = lvIn || (lvs.includes(CHART_LV) ? CHART_LV : mLv(lastMock()));
  const C = CHART_DEF[CHART_MODE], ms = S.mocks.filter(m => mLv(m) === lv);
  const base = ms.find(m => m.base) || ms[0], last = ms[ms.length - 1];
  const d = last && base && last !== base ? C.f(last) - C.f(base) : null;
  const best = ms.reduce((b, m) => Math.max(b, C.f(m)), 0);
  return `<div class="card"><div class="row"><div class="h3">📈 N${lv} 모의고사 점수 변화</div><span class="sp"></span><span class="small">${ms.length}회 · 최고 ${best}</span></div>
  ${!lvIn && lvs.length > 1 ? `<div class="chips" style="margin-top:8px">${lvs.map(l => `<button class="chip ${l === lv ? 'on' : ''}" onclick="CHART_LV=${l};render(true)">N${l} 모의고사</button>`).join('')}</div>` : ''}
  <div class="chips" style="margin-top:8px">${Object.entries(CHART_DEF).map(([k, v]) => `<button class="chip ${CHART_MODE === k ? 'on' : ''}" onclick="CHART_MODE='${k}';render(true)">${v.ko}</button>`).join('')}</div>
  ${d != null ? `<div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap"><span class="tag ${d >= 0 ? 'm' : 'p'}">📍 출발점 ${C.f(base)} → 지금 ${C.f(last)} (${d >= 0 ? '+' : ''}${d})</span></div>` : ''}
  <div class="chartbox" style="margin-top:8px">${mockChart(false, CHART_MODE, lv)}</div>
  <div class="legend"><span><i style="background:#3B2F4A"></i>${C.ko}</span>${C.lines(lv).map(([v, col, n]) => `<span><i style="background:${col}"></i>${n}</span>`).join('')}<span>📍 출발점(진단)</span></div></div>`;
}
/* ---------- 정기 모의고사 일정 ---------- */
function mockDayOf() { const m = S.mocks.find(x => x.base) || S.mocks[0]; return S.set.mockDay != null ? S.set.mockDay : (m ? new Date(m.ts).getDay() : 6); }
function nextMockDate() {
  const m = lastMock(); if (!m) return null;
  const d = new Date(m.ts); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 5); // 최소 5일 간격
  const wd = mockDayOf();
  while (d.getDay() !== wd) d.setDate(d.getDate() + 1);
  return d;
}
function mockDueDays() { const n = nextMockDate(); return n ? today() - dnum(dstr(n)) : null; } // 0 = 오늘, 양수 = 밀린 날
function fmtMD(d) { return `${d.getMonth() + 1}/${d.getDate()}(${WEEK_KO[d.getDay()]})`; }
function setMockDay(k) { S.set.mockDay = k; save(); syncReminders(); render(true); toast(`매주 ${WEEK_KO[k]}요일에 모의고사를 알려 줄게요`); }
function mockScheduleHTML() {
  const wd = mockDayOf();
  return `<div class="prow" style="margin-top:6px"><div class="pl"><div class="pt">정기 모의고사 요일</div><div class="pd">${S.set.notiMock ? `이 요일 ${esc(S.set.mockTime)}에 알림이 와요` : '알림은 설정에서 켤 수 있어요'}</div></div></div>
  <div class="chips wk">${WEEK_KO.map((n, i) => `<button class="chip ${wd === i ? 'on' : ''}" onclick="setMockDay(${i})">${n}</button>`).join('')}</div>`;
}
function predChart() {
  const ks = Object.keys(S.pred).sort().slice(-30);
  if (ks.length < 2) return '<div class="small">공부한 날이 쌓이면 예상 점수 추이가 그려져요</div>';
  const W = 320, H = 130, L = 30, R = 10, T = 10, B = 20;
  const x = i => L + i * (W - L - R) / (ks.length - 1), y = v => T + (1 - v / 180) * (H - T - B);
  const grid = [0, 90, 180].map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="#EDE2C8"/><text x="${L - 5}" y="${y(v) + 3.5}" font-size="9" text-anchor="end" fill="#8E8098">${v}</text>`).join('');
  const area = `<polygon fill="rgba(242,208,122,.35)" points="${x(0)},${y(0)} ${ks.map((k, i) => x(i) + ',' + y(S.pred[k])).join(' ')} ${x(ks.length - 1)},${y(0)}"/>`;
  return `<svg viewBox="0 0 ${W} ${H}">${grid}<line x1="${L}" x2="${W - R}" y1="${y(S.target)}" y2="${y(S.target)}" stroke="#4E9E73" stroke-width="1.5" stroke-dasharray="5 4"/>${area}<polyline fill="none" stroke="#3B2F4A" stroke-width="2.5" points="${ks.map((k, i) => x(i) + ',' + y(S.pred[k])).join(' ')}"/>
  <text x="${L}" y="${H - 5}" font-size="9" fill="#8E8098">${ks[0].slice(5).replace('-', '/')}</text><text x="${W - R}" y="${H - 5}" font-size="9" text-anchor="end" fill="#8E8098">${ks[ks.length - 1].slice(5).replace('-', '/')}</text></svg>`;
}
function mockButtonsHTML() {
  const cur = stageLv();
  const b5 = `<div class="h3" style="margin-top:12px">N5 모의고사 ${cur === 5 ? '<span class="tag p">지금 단계</span>' : ''}</div>
  <div class="lv" style="margin-top:6px"><button class="lvopt" onclick="mockIntro('full5')"><span class="e">📝</span><div><div class="n">N5 정식</div><div class="d">실제 N5와 같은 구성 · 약 65문항 · 90분</div></div></button>
  <button class="lvopt" onclick="mockIntro('quick5')"><span class="e">⚡</span><div><div class="n">N5 빠른</div><div class="d">절반 구성 · 약 35문항 · 45분</div></div></button></div>`;
  const b4 = `<div class="h3" style="margin-top:12px">N4 모의고사 ${cur === 4 ? '<span class="tag p">지금 단계</span>' : '<span class="small">(N4 단계 전에는 어려울 수 있어요)</span>'}</div>
  <div class="lv" style="margin-top:6px"><button class="lvopt" onclick="mockIntro('full')"><span class="e">📝</span><div><div class="n">N4 정식</div><div class="d">실제 N4와 같은 구성 · 85문항 · 115분</div></div></button>
  <button class="lvopt" onclick="mockIntro('quick')"><span class="e">⚡</span><div><div class="n">N4 빠른</div><div class="d">절반 구성 · 약 45문항 · 60분</div></div></button></div>`;
  return cur === 5 ? b5 + b4 : b4 + b5;
}
let MOCK_FORCE = false;
function mockTabHTML() {
  const m = lastMock(), nx = nextMockDate(), due = mockDueDays(), pz = mockPausedInfo();
  let head;
  if (stageIdx() < 3 && !MOCK_FORCE) return `<div class="top"><div class="h2">📝 모의고사</div></div><div class="stack"><div class="card"><div class="h3">🔒 모의고사는 독해·청해 단계부터</div>
    <div class="sub">지금은 <b>${STAGE_IC[stage()]} ${STAGE_KO[stage()]}</b> 단계예요. 모의고사에는 문법·독해·청해가 다 나와서, 지금 보면 대부분 처음 보는 문제예요.<br>단어 → 문법을 끝내고 <b>📖 N5 독해·청해</b> 단계가 되면 첫 모의고사로 출발점을 기록할게요.</div>
    <div class="acts"><button class="btn sm w" onclick="MOCK_FORCE=true;render()">그래도 모의고사 보기</button></div></div>
    ${S.mocks.length ? mockChartCard() : ''}</div>`;
  if (!m) head = `<div class="h3">📍 먼저 실력 진단부터!</div><div class="sub">지금 단계(${STAGE_KO[stage()]})에 맞는 <b>N${stageLv()} 모의고사</b>로 출발점을 기록해요. 이후 매주 한 번 보면 성장 그래프가 쌓여요.</div>`;
  else if (due >= 0) head = `<div class="h3">🗓️ ${due === 0 ? '오늘은 정기 모의고사 날!' : `정기 모의고사가 ${due}일 밀렸어요`}</div><div class="sub">일주일 동안 얼마나 늘었는지 확인해 봐요.</div>`;
  else head = `<div class="h3">다음 정기 모의고사: ${fmtMD(nx)}</div><div class="sub">그 전에도 원할 때 언제든 볼 수 있어요. 지금 단계에서는 <b>N${stageLv()} 모의고사</b>를 추천해요.</div>`;
  return `<div class="top"><div class="h2">📝 모의고사</div></div><div class="stack">
  ${pz ? `<div class="alert"><span class="e">⏸</span><div class="sp"><div class="h3">멈춘 모의고사가 있어요</div><div class="sub">${esc(pz.txt)}</div></div><button class="btn sm" onclick="mockResume()">이어서</button></div>` : ''}
  <div class="card">${head}
  ${mockButtonsHTML()}
  ${m ? mockScheduleHTML() : ''}</div>
  ${S.mocks.length ? mockChartCard() : ''}
  <div class="card"><div class="h3">🔮 예상 점수 추이</div><div class="sub">매일 푼 문제로 계산한 예상 점수예요 (모의고사 사이의 변화를 보여 줘요)</div><div class="chartbox" style="margin-top:8px">${predChart()}</div></div>
  ${S.mocks.length ? `<div class="card"><div class="h3">🗂️ 기록</div><div class="mlist" style="margin-top:8px">${S.mocks.map((x, i) => [x, i]).reverse().map(([x, i]) => `<button class="mitem" onclick="TAB='mock';go('mockResult',{idx:${i}})"><span class="sc" style="color:${x.pass ? 'var(--ok)' : 'var(--ink)'}">${x.total}</span><div class="b"><div>${esc(MOCK_SPEC[x.kind].name)}${x.base ? ' · 📍출발점' : ''}</div><div class="small">${esc(x.d.replace(/-/g, '.'))} · 언어 ${x.lk} · 청해 ${x.ls}${x.mute ? ' (대본)' : ''}</div></div><span>${x.pass ? '✅' : '›'}</span></button>`).join('')}</div></div>` : ''}
  </div>`;
}
