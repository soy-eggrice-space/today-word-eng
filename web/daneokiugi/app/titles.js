'use strict';
// 단어키우기 · 칭호 (마을 주인 칭호 36개: 기본 24개는 조건을 올렸고, 특별한 칭호 12개가 있어요)
const OTG = [['공부', '--a2', '--t2'], ['친구', '--a0', '--t0'], ['물건', '--a1', '--t1'], ['마을', '--a3', '--t3'], ['특별', '--main', '--mainLt']];
function perfectCount(o) { let n = 0; for (const b in o.w) for (const e in o.w[b]) if (o.w[b][e][0] >= 3) n++; return n; }
function foundCount(o, hid) { const t = DT.themes[o.theme], f = o.vil.found; return (hid ? t.hidden : t.sets).reduce((a, s) => a + s.recs.filter(r => f[r.out]).length, 0); }
const sv = (o, k) => (o.stat && o.stat[k]) || 0;
const OT = [
  { id: 'steady', g: 0, n: '꾸준히 하는', c: '14일 이어서 공부', t: o => (o.best || 0) >= 14 },
  { id: 'month', g: 0, n: '한 달을 채운', c: '50일 이어서 공부', t: o => (o.best || 0) >= 50 },
  { id: 'know100', g: 0, n: '단어를 많이 아는', c: '완벽히 아는 단어 200개', t: o => perfectCount(o) >= 200 },
  { id: 'know500', g: 0, n: '단어 박사', c: '완벽히 아는 단어 1,000개', t: o => perfectCount(o) >= 1000 },
  { id: 'again', g: 0, n: '틀려도 다시 하는', c: '오답노트에서 80개 빼기', t: o => sv(o, 'wrOut') >= 80 },
  { id: 'spell', g: 0, n: '스펠링을 잘 쓰는', c: '스펠링 문제 300개 맞히기', t: o => sv(o, 'spell') >= 300 },
  { id: 'perfect', g: 0, n: '백 점을 맞은', c: '하루 공부 다 맞히기 15번', t: o => sv(o, 'perfect') >= 15 },
  { id: 'collect', g: 1, n: o => ({ dino: '공룡 수집가', chara: '캐릭터 수집가', animal: '병아리 수집가' }[o.theme]), c: '기본 친구 열 마리 모으기', t: o => DT.themes[o.theme].fr.every(k => o.vil.seen['f:' + k]) },
  { id: 'legend', g: 1, n: '전설을 키운', c: '전설 친구 세 마리와 함께 살기', t: o => o.vil.objs.filter(x => x.t === 'f' && !x.m && x.lv >= 5).length >= 3 },
  { id: 'rare', g: 1, n: '희귀 친구와 친한', c: '희귀 친구 네 마리', t: o => DT.themes[o.theme].rare.every(r => o.vil.seen['r:' + r.k + r.hold]) },
  { id: 'mysf', g: 1, n: '미스터리 친구를 만난', c: '미스터리 친구 한 마리', t: o => DT.themes[o.theme].mys.some(k => o.vil.seen['m:' + k]) },
  { id: 'feed', g: 1, n: '먹이를 잘 주는', c: '간식 150번 주기', t: o => sv(o, 'feed') >= 150 },
  { id: 'deco', g: 1, n: '꾸미기를 좋아하는', c: '꾸미기 30번 달아 주기', t: o => sv(o, 'deco') >= 30 },
  { id: 'gold', g: 2, n: '반짝이는 게 좋은', c: '황금 물건 다섯 개 만들기', t: o => sv(o, 'gold') >= 5 },
  { id: 'merge', g: 2, n: '합치기를 잘하는', c: '합치기 300번', t: o => sv(o, 'merge') >= 300 },
  { id: 'mix25', g: 2, n: '조합 박사', c: '조합 도감 25개 찾기', t: o => foundCount(o) >= 25 },
  { id: 'mix50', g: 2, n: '도감을 다 채운', c: '조합 도감 50개 찾기', t: o => foundCount(o) >= 50 },
  { id: 'mys5', g: 2, n: '미스터리를 쫓는', c: '미스터리 물건 5개 찾기', t: o => foundCount(o, true) >= 5 },
  { id: 'mys20', g: 2, n: '비밀을 다 아는', c: '미스터리 물건 20개 찾기', t: o => foundCount(o, true) >= 20 },
  { id: 'homes', g: 3, n: '집을 잘 짓는', c: '보금자리 10개 짓기', t: o => sv(o, 'homes') >= 10 },
  { id: 'rich', g: 3, n: '별 부자', c: '별 3,000개 모으기', t: o => (o.total || 0) >= 3000 },
  { id: 'gift', g: 3, n: '선물을 잘 찾는', c: '하루 선물 40번 찾기', t: o => sv(o, 'gift') >= 40 },
  { id: 'guard', g: 3, n: '마을을 지킨', c: '위급상황 도전에서 은 트로피 받기', t: o => o.vil.trophy >= 2 },
  { id: 'goldtr', g: 3, n: '금 트로피를 든', c: '금 트로피 받기', t: o => o.vil.trophy >= 3 },
  { id: 'early', g: 4, n: '아침을 여는', c: '아침 8시 전에 공부 10번', t: o => sv(o, 'early') >= 10 },
  { id: 'photo', g: 4, n: '마을 사진작가', c: '마을 사진 15장 찍기', t: o => sv(o, 'shots') >= 15 },
  { id: 'talk', g: 4, n: '친구 말을 잘 들어 주는', c: '친구에게 말 걸기 200번', t: o => sv(o, 'says') >= 200 },
  { id: 'star2', g: 4, n: '별을 단 친구를 둔', c: '3성 희귀 친구 만들기', t: o => o.vil.objs.some(x => x.t === 'f' && x.hold && (x.st || 1) >= 3) },
  { id: 'herd', g: 4, n: '무리 대장', c: '같은 친구 다섯 마리가 한 무리', t: o => { const c = {}; let m = 0; o.vil.objs.forEach(x => { if (x.t === 'f') { const k = x.k + ':' + (x.lv || 1) + (x.hold || '') + (x.st || ''); m = Math.max(m, c[k] = (c[k] || 0) + 1); } }); return m >= 5; } },
  { id: 'full36', g: 4, n: '빈틈없이 채운', c: '물건 자리 36개를 다 채우기', t: o => o.vil.objs.filter(x => x.t === 'i').length >= 36 },
  { id: 'clean', g: 4, n: '오답노트를 비운', c: '오답노트에서 20개 넘게 빼고 텅 비우기', t: o => sv(o, 'wrOut') >= 20 && !Object.keys(o.wr || {}).length },
  { id: 'combo', g: 4, n: '번개처럼 맞히는', c: '위급상황에서 25번 이어 맞히기', t: o => sv(o, 'cstreak') >= 25 },
  { id: 'chal30', g: 4, n: '마을 지킴이 대장', c: '위급상황 도전에서 트로피 30번 받기', t: o => sv(o, 'chalWin') >= 30 },
  { id: 'saver', g: 4, n: '별을 아껴 둔', c: '별 500개를 한꺼번에 가지고 있기', t: o => !o.inf && (o.stars || 0) >= 500 },
  { id: 'rider', g: 4, n: '탈것 길의 주인', c: '탈것을 탄 친구 다섯 마리', t: o => o.vil.objs.filter(x => x.t === 'f' && CAT[x.seat] === 'ride').length >= 5 },
  { id: 'street', g: 4, n: '보금자리 줄을 채운', c: '집에 사는 친구 열두 마리', t: o => o.vil.objs.filter(x => x.t === 'f' && CAT[x.seat] === 'home').length >= 12 }];
const otName = (t, o) => typeof t.n === 'function' ? t.n(o) : t.n;
function ownerTitle(o) { const t = o.title && OT.find(x => x.id === o.title); return t ? otName(t, o) : ''; }
function tchip(t, size, col) { return t ? `<span class="tchip" style="font-size:${size || 14}px;background:var(${col || '--t1'})">${esc(t)}</span>` : ''; }
function checkTitles() {
  const o = S.cur >= 0 && O(); if (!o || $('#ov')) return false;
  for (const t of OT) {
    if (o.titles[t.id] || !t.t(o)) continue;
    o.titles[t.id] = 1; save(); vib(30);
    const nm = otName(t, o);
    modal(`<div style="display:flex;justify-content:center;position:relative;height:124px">${stk(TH().hero, 116, 'hop', true)}${spark(28, 56, 8, 'twk')}${spark(20, 246, 30, 'twk')}</div>
<div class="d" style="font-size:24px;text-align:center">새 칭호를 얻었어요!</div>
<div style="display:flex;justify-content:center"><span class="d kc" style="padding:6px 22px 9px;border-radius:24px;border:2px solid var(--ink);background:var(${OTG[t.g][2]});font-size:26px">${nm}</span></div>
<div style="font-size:14.5px;color:var(--sub2);text-align:center">${t.c}</div>
<div class="row" style="justify-content:center;gap:6px;background:var(--paper);border:2px dashed var(--ink);border-radius:16px;padding:8px">${tchip(nm, 15, OTG[t.g][2])}<span class="d" style="font-size:19px">${esc(o.name)}</span></div>
<div class="row" style="gap:8px"><button type="button" class="btn sec f1" data-a="close">나중에</button><button type="button" class="btn" style="flex:1.7 1 0;font-size:17px;white-space:nowrap;padding:0 6px 3px" data-a="otSet" data-id="${t.id}" data-pop="1">이름 앞에 붙이기</button></div>`, { mid: true });
    return true;
  }
  return false;
}
ACT.otSet = d => {
  const o = O(); if (!o.titles[d.id]) return;
  o.title = o.title === d.id && !d.pop ? '' : d.id; save();
  if (d.pop) { closeModal(true); toast('이름 앞에 칭호를 붙였어요'); }
  render();
};
SCR.titles = {
  view() {
    const o = O(), got = OT.filter(t => o.titles[t.id]).length, cur = ownerTitle(o);
    const tile = t => { const on = o.title === t.id, g = OTG[t.g], nm = otName(t, o);
      return o.titles[t.id] ? `<button type="button" data-a="otSet" data-id="${t.id}" class="${on ? 'kc' : ''}" style="position:relative;border-radius:16px;border:${on ? 3 : 2}px solid var(--ink);background:var(${g[2]});padding:8px 8px 9px;display:flex;flex-direction:column;gap:2px;text-align:left"><span class="d" style="font-size:15.5px;line-height:1.25">${nm}</span><span style="font-size:12px;color:var(--sub2)">${t.c}</span>${on ? `<span style="position:absolute;right:-6px;top:-8px;width:24px;height:24px;border-radius:12px;border:2px solid var(--ink);background:var(--paper);display:flex;align-items:center;justify-content:center">${ico(IC.check, 14, 3.4)}</span>` : ''}</button>`
        : `<div style="border-radius:16px;border:1.5px dashed var(--sub);padding:8px 8px 9px;display:flex;flex-direction:column;gap:2px"><span class="d" style="font-size:15.5px;line-height:1.25;color:var(--sub)">${nm}</span><span style="font-size:12px;color:var(--sub)">${t.c}</span></div>`; };
    return `<div class="scr" style="gap:12px">${topbar('칭호', `<span class="sub tn" style="font-size:14px">${OT.length}개 중 ${got}개</span>`)}
<div class="card" style="flex-direction:row;align-items:center;gap:12px;background:var(--mainLt)">${stk('face', 54)}<div style="display:flex;flex-direction:column;gap:4px;min-width:0"><span style="font-size:13px;color:var(--sub2)">${cur ? '지금 이름 앞에 붙인 칭호' : '아직 붙인 칭호가 없어요'}</span><span class="row" style="gap:6px;flex-wrap:wrap">${tchip(cur, 17)}<span class="d" style="font-size:22px">${esc(o.name)}</span>${o.stick ? stk(o.stick, 24) : ''}</span></div></div>
<div class="hint">미션을 해내면 칭호를 얻어요.<br>얻은 칭호를 누르면 이름 앞에 붙고, 한 번 더 누르면 떼어져요</div>
${OTG.map((g, gi) => { const ts = OT.filter(t => t.g === gi); return `<div class="card" style="gap:8px;padding:12px"><div class="row" style="gap:7px"><span style="width:22px;height:22px;border-radius:11px;border:1.5px solid var(--ink);background:var(${g[1]})"></span><h2 class="sp">${g[0]}</h2><span class="sub tn" style="font-size:13px">${ts.length}개 중 ${ts.filter(t => o.titles[t.id]).length}개</span></div><div class="grid2" style="gap:8px">${ts.map(tile).join('')}</div></div>`; }).join('')}</div>`;
  }
};

// ---------- 친구 칭호 ----------
const FT_ACC = { '@s_ribbon': '리본이 잘 어울리는', '@s_crown': '임금님이 된', '@s_flower': '꽃을 좋아하는', '@s_star': '반짝반짝 빛나는', '@s_heart': '사랑스러운', '@s_moon': '달빛을 닮은' };
const FT_RAND = ['항상 예쁜', '잠꾸러기', '호기심 많은', '용감한', '수줍은', '장난꾸러기', '노래를 잘하는', '느긋한', '씩씩한', '배고픈', '웃음이 많은', '똑똑한'];
const FT_HOW = { '집이 제일 좋은': '보금자리를 줘서', '달리기를 좋아하는': '탈것에 태워 줘서', '잘 먹는': '간식을 다섯 번 줘서', '듬직한': '큰 친구로 자라서', '전설의': '전설 친구가 돼서' };
Object.keys(FT_ACC).forEach(k => { FT_HOW[FT_ACC[k]] = josa(DT.names[k] || '꾸미기', '을', '를') + ' 달아 줘서'; });
function ftAdd(f, t) { f.tt = f.tt || []; if (f.tt.includes(t)) return false; f.tt.push(t); if (!f.ts) f.ts = t; return true; }
const ftHow = t => FT_HOW[t] || '태어날 때부터';

// 화면이 바뀐 뒤 잠깐 있다가: 모아 온 나무와 돌, 새 칭호 순서로 알려 줘요
let _ac = null;
function afterChecks(ms) {
  clearTimeout(_ac);
  _ac = setTimeout(() => {
    if (S.cur < 0 || $('#ov') || $('#tut')) return;
    if (R.name === 'vil' && V.mode === 'main' && gatherCheck()) return;
    if (['vil', 'home', 'result', 'chalWin', 'shop', 'bag', 'book2', 'rec', 'titles'].includes(R.name)) checkTitles();
  }, ms || 450);
}
