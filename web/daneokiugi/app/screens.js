'use strict';

const STICKS = ['s_flower', 's_star', 's_heart', 's_sprout', 's_moon', 's_sun', 's_cloud', 's_ribbon', 's_crown', 's_note', 's_rocket', 's_ball', 's_bolt', 's_car'];
const BOOKNOTE = { starter: '처음 만나는 쉬운 낱말', elem_low: '눈에 보이는 것과 쉬운 동작', elem_high: '저학년 다음에 배우는 낱말', middle_basic: '중학교에서 꼭 쓰는 낱말', middle_adv: '기본 다음에 배우는 낱말', high_basic: '수능에 자주 나오는 낱말', high_adv: '기본 다음에 배우는 어려운 낱말', talk: '일상에서 바로 쓰는 낱말과 표현' };
const VERSION = '0.1.36';
function enter(i) { S.cur = i; applyTheme(O().theme); V.cam = null; save(); go('home', {}, { reset: true }); }

SCR.main = {
  view() {
    const rows = S.owners.map((o, i) => `<button type="button" class="card kc" style="flex-direction:row;align-items:center;gap:12px;text-align:left;padding-bottom:16px" data-a="enter" data-i="${i}">${stk(DT.themes[o.theme].hero, 56, '', true)}<span style="display:flex;flex-direction:column;gap:2px;min-width:0;margin-right:auto"><span class="row" style="gap:6px"><span class="d" style="font-size:21px">${esc(o.name)}</span>${o.stick ? stk(o.stick, 22) : ''}</span><span class="sub">${DT.themes[o.theme].name} · ${BOOKS.find(b => b.id === o.book).name}</span></span>${ico(IC.fwd, 20)}</button>`).join('');
    return `<div class="scr" style="gap:14px">
<div class="row" style="justify-content:center;gap:2px;margin-top:22px">${stk('c1', 76, '', true)}${stk('d2', 96, '', true)}${stk('a1', 76, '', true)}</div>
<div style="text-align:center"><h1 style="font-size:42px">단어키우기</h1><div style="font-size:15.5px;color:var(--sub2);margin-top:2px">단어를 공부하면, 마을이 자라요</div></div>
${rows ? `<div class="sub" style="margin-top:6px">누구 마을로 갈까요?</div>${rows}` : ''}
<button type="button" class="${rows ? 'card' : 'btn'}" style="${rows ? 'flex-direction:row;align-items:center;justify-content:center;gap:8px;border-style:dashed;background:transparent' : 'margin-top:20px;height:62px;font-size:22px'}" data-a="newOwner">${rows ? ico(IC.plus, 20) + `<span class="d" style="font-size:18px">새 마을 만들기</span>` : '마을 만들기'}</button>
${verCard()}<div class="sub mta" style="text-align:center;font-size:12px;line-height:1.7">${VERSION} · 기록은 이 기기에만 저장돼요<br>문의 ${contactBtns()}</div></div>`;
  },
  after() { applyTheme('dino'); }
};
ACT.enter = d => enter(+d.i);
ACT.newOwner = () => {
  if (S.owners.length >= 8) return toast('마을은 여덟 개까지 만들 수 있어요');
  go('profile', { d: { name: '', stick: '', theme: 'dino', book: 'elem_low', per: 20, mode: 'card' } });
};
const stepTop = n => `<div class="row" style="justify-content:space-between"><button type="button" class="ibtn" data-a="back" aria-label="뒤로">${ico(IC.back)}</button><span class="sub tn" style="font-size:14.5px">${n} / 5</span></div>`;
const heading = (t, s) => `<div><h1>${t}</h1><div class="sub" style="font-size:14.5px;margin-top:2px">${s}</div></div>`;
SCR.profile = {
  view(p) {
    const d = p.d;
    return `<div class="scr">${stepTop(1)}${heading('마을 주인은 누구인가요?', '마을에서 부를 이름을 정해요')}
<div class="card"><h2>마을 주인 이름</h2><input class="inp" id="nm" maxlength="8" value="${esc(d.name)}" placeholder="이름" style="font-size:22px;height:52px"><div class="hint">여덟 글자까지 쓸 수 있어요 · 진짜 이름이 아니어도 돼요</div></div>
<div class="card"><h2>이름 옆 스티커</h2><div class="grid5">${[''].concat(STICKS).map(k => `<button type="button" class="tile${d.stick === k ? ' on' : ''}" style="padding:8px 2px;border-radius:16px" data-a="pStick" data-k="${k}">${k ? stk(k, 36) : `<span style="height:36px;display:flex;align-items:center;font-size:13px">없음</span>`}</button>`).join('')}</div></div>
<button type="button" class="btn mta" data-a="pNext">다음</button></div>`;
  },
  after(p) { const i = $('#nm'); i.oninput = () => { p.d.name = i.value; }; }
};
ACT.pStick = d => { R.p.d.stick = d.k; render(); };
ACT.pNext = () => { const d = R.p.d; d.name = (d.name || '').trim(); if (!d.name) return toast('이름을 써 주세요'); go('theme', { d }); };
SCR.theme = {
  view(p) {
    const d = p.d;
    return `<div class="scr">${stepTop(2)}${heading('어떤 마을을 키울까요?', '마을마다 친구와 물건이 달라요')}
${['dino', 'chara', 'animal'].map(k => { const t = DT.themes[k], c = t.col; return `<button type="button" class="card kc" style="flex-direction:row;align-items:center;gap:12px;text-align:left;padding:12px 14px 16px;background:${c.mainPale};${d.theme === k ? 'box-shadow:0 0 0 3px var(--ink),0 6px 0 rgba(74,65,56,.22)' : ''}" data-a="pTheme" data-k="${k}"><span class="row" style="gap:0">${stk(t.fr[1], 60, '', true)}${stk(t.fr[0], 50)}</span><span style="display:flex;flex-direction:column;gap:4px;min-width:0"><span class="d" style="font-size:22px">${t.name}</span><span class="sub" style="color:var(--sub2)">${t.mood}</span><span class="row" style="gap:4px">${[c.main].concat(c.acc).map(x => `<span style="width:18px;height:18px;border-radius:9px;border:1.5px solid var(--ink);background:${x}"></span>`).join('')}</span></span></button>`; }).join('')}
<button type="button" class="btn mta" data-a="pGo" data-s="pbook">다음</button></div>`;
  },
  after(p) { applyTheme(p.d.theme); }
};
ACT.pTheme = d => { R.p.d.theme = d.k; render(); };
ACT.pGo = d => go(d.s, { d: R.p.d });
const bookCard = (b, on, act) => `<button type="button" class="card kc" style="flex-direction:row;align-items:center;justify-content:space-between;gap:12px;text-align:left;padding:10px 16px 14px;border-radius:22px;${on ? 'box-shadow:0 0 0 3px var(--ink),0 6px 0 rgba(74,65,56,.22);background:var(--mainPale)' : ''}" data-a="${act}" data-k="${b.id}"><span style="display:flex;flex-direction:column;gap:3px"><span class="d" style="font-size:21px">${b.name}</span><span class="sub" style="font-size:14px">${BOOKNOTE[b.id]}</span></span><span class="chip ln tn" style="background:var(--t1);font-size:13px;padding:3px 10px">${b.words.length.toLocaleString()}단어</span></button>`;
SCR.pbook = {
  view(p) { return `<div class="scr" style="gap:12px">${stepTop(3)}${heading('어떤 단어장으로 공부할까요?', '나중에 설정에서 바꿀 수 있어요')}${BOOKS.map(b => bookCard(b, p.d.book === b.id, 'pBook')).join('')}<button type="button" class="btn mta" data-a="pGo" data-s="psetup">다음</button></div>`; }
};
ACT.pBook = d => { R.p.d.book = d.k; render(); };
SCR.psetup = {
  view(p) {
    const d = p.d, n = BOOKS.find(b => b.id === d.book).words.length;
    return `<div class="scr">${stepTop(4)}${heading('하루 공부를 정해요', '나중에 설정에서 바꿀 수 있어요')}
<div class="card"><h2>하루에 공부할 단어</h2>${seg('pPer', [[10, '10개'], [15, '15개'], [20, '20개'], [30, '30개']], d.per)}<div class="hint">복습까지 하면 약 ${Math.ceil(n / d.per * (d.book === 'starter' ? 1.6 : 1.3))}일이면 한 바퀴 돌아요</div></div>
<div class="card"><h2>공부 방법</h2>${seg('pMode', [['card', '카드 + 시험'], ['test', '시험만']], d.mode)}<div class="hint">카드로 먼저 익히거나, 바로 시험만 볼 수 있어요</div></div>
<button type="button" class="btn mta" data-a="pGo" data-s="ptypes">다음</button></div>`;
  }
};

const QTYPES = [['t1', '뜻 고르기', '영어를 보고 뜻을 골라요'], ['t2', '단어 고르기', '뜻을 보고 영어를 골라요'], ['t3', '스펠링 눌러서 쓰기', '글자를 눌러 단어를 만들어요'], ['t4', '키보드로 쓰기', '힌트 없이 맞히면 별 두 개'], ['t5', '예문 빈칸', '예문이 있는 단어에만 나와요']];
const typeRows = (types, act) => QTYPES.map(([k, t, d]) => `<button type="button" class="row" style="min-height:54px;border-radius:16px;border:2px solid var(--ink);background:var(--paper);padding:6px 12px;text-align:left;gap:12px" role="checkbox" aria-checked="${!!types[k]}" data-a="${act}" data-k="${k}"><span style="width:26px;height:26px;flex:none;border-radius:9px;border:2px solid var(--ink);background:var(${types[k] ? '--main' : '--paper'});display:flex;align-items:center;justify-content:center">${types[k] ? ico(IC.check, 16, 3.2) : ''}</span><span style="display:flex;flex-direction:column;gap:1px"><span style="font-size:16px">${t}</span><span style="font-size:12.5px;color:var(--sub)">${d}</span></span></button>`).join('');
SCR.ptypes = {
  view(p) {
    const d = p.d; if (!d.types || d.typesFor !== d.book) { d.types = defTypes(d.book); d.typesFor = d.book; d.typesSet = 0; }
    return `<div class="scr" style="gap:12px">${stepTop(5)}${heading('어떤 문제를 풀까요?', '체크한 종류만 나와요 · 나중에 설정에서 바꿀 수 있어요')}
${typeRows(d.types, 'pType')}
<div class="card" style="flex-direction:row;align-items:center;background:var(--stary)">${itm('eggbox', 54)}${itm('itembox', 54)}<span style="font-size:14.5px;line-height:1.5">마을을 만들면 상자 두 개를<br>선물로 받아요</span></div>
<button type="button" class="btn mta" data-a="pDone">마을 만들기</button></div>`;
  }
};
ACT.pType = d => { const pd = R.p.d, t = pd.types; if (t[d.k] && Object.values(t).filter(Boolean).length === 1) return toast('하나는 꼭 골라 두어야 해요'); t[d.k] = t[d.k] ? 0 : 1; pd.typesSet = 1; render(); };
ACT.pPer = d => { R.p.d.per = +d.v; render(); };
ACT.pMode = d => { R.p.d.mode = d.v; render(); };
ACT.pDone = () => { S.owners.push(newOwner(R.p.d)); save(true); enter(S.owners.length - 1); };

function vilMini() {
  layoutItems(); navFix();
  const objs = O().vil.objs.slice().sort((a, b) => a.y - b.y).map(x => objHTML(x, true)).join('');
  return `<div id="minis" style="position:relative;flex:none;width:${Math.round(WW * .42)}px;height:${Math.round(WH * .42)}px"><div class="world" id="miniw" style="width:${WW}px;height:${WH}px;transform:scale(.42)">${groundSVG()}${trophyHTML()}${qWorld(O().vil, true)}${pileHTML()}${objs}</div></div>`;
}
const hChip = (inner, bg, label) => `<span class="pill" aria-label="${label}" style="flex:1 1 0;height:38px;padding:0 6px 1px 4px;gap:3px;background:var(${bg || '--paper'});font-size:13.5px;justify-content:center;white-space:nowrap">${inner}</span>`;
const hGauge = (nm, n, m) => `<div style="display:flex;flex-direction:column;gap:2px"><div class="row" style="gap:4px;font-size:12.5px"><span class="sp">${nm}</span><span class="tn d" style="font-size:13.5px">${n} / ${m}</span></div><div class="bar" style="height:7px"><i style="width:${Math.min(100, n / m * 100).toFixed(0)}%;${n >= m - 2 ? 'background:var(--a3)' : ''}"></i></div></div>`;
function vilPreview() {
  const v = O().vil, t = TH();
  const fs = v.objs.filter(o => o.t === 'f').sort((a, b) => (b.m ? 9 : b.lv) - (a.m ? 9 : a.lv)).slice(0, 4), is = v.objs.filter(o => o.t === 'i').slice(-3);
  const fp = [[8, 38], [50, 30], [30, 62], [66, 64]], ip = [[5, 5], [34, 12], [78, 34]];
  if (!fs.length && !is.length) return `<div style="position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;align-items:center;gap:8px">${stk(t.egg, 90)}<span class="chip ln" style="background:var(--paper);font-size:13.5px;padding:4px 12px">상자를 열면 친구가 태어나요</span></div>`;
  return is.map((o, i) => `<span style="position:absolute;left:${ip[i][0]}%;top:${ip[i][1]}%">${pic(o.k, 62)}</span>`).join('') + fs.map((o, i) => `<span style="position:absolute;left:${fp[i][0]}%;top:${fp[i][1]}%">${frInner(o, 52 + (o.m ? 4 : o.lv) * 6)}</span>`).join('');
}
SCR.home = {
  view() {
    qBefore();
    const o = O(), d = dayOf(o), c = counts(), boxes = o.eggBox + o.itemBox, pct = n => (n / c.total * 100).toFixed(1);
    const leg = (col, label, n) => `<div class="row" style="gap:6px"><span style="width:14px;height:14px;flex:none;border-radius:5px;border:1.5px solid var(--ink);background:var(${col})"></span><span>${label}</span><span class="tn" style="margin-left:auto">${n}</span></div>`;
    const doneDay = d.words >= o.per;
    return `<div class="scr np" style="gap:12px;padding-top:18px">${verCard()}
<div class="row" style="justify-content:space-between"><button type="button" data-a="go" data-s="main" class="row" style="gap:8px;min-width:0;border:0;background:none;padding:0;text-align:left">${stk('face', 46)}${o.stick ? stk(o.stick, 24) : ''}<span style="display:flex;flex-direction:column;align-items:flex-start;min-width:0;gap:1px">${ownerTitle(o) ? tchip(ownerTitle(o), 12) : ''}<span class="d" style="font-size:20px;line-height:1.2">${esc(o.name)}</span>${ownerTitle(o) ? '' : `<span style="font-size:13px;color:var(--sub)">${TH().name}</span>`}</span></button>
<div class="row" style="gap:8px">${starPill()}<button type="button" class="ibtn rd d" style="width:auto;padding:0 12px 2px 9px;gap:5px;font-size:15.5px;white-space:nowrap" data-a="go" data-s="set">${ico(IC.gear, 20)}설정</button></div></div>
<div class="card"><div class="row" style="gap:8px">${ttl('오늘의 단어', '--a0', IC.book)}<span class="chip sp">${o.mode === 'card' ? '카드 + 시험' : '시험만'}</span><span class="tn" style="font-size:14.5px;color:var(--sub)">${Math.min(d.words, o.per)} / ${o.per}</span></div>
<div class="bar"><i style="width:${Math.min(100, d.words / o.per * 100)}%"></i></div>
<button type="button" class="btn${doneDay ? ' sec' : ''}" style="height:50px" data-a="study">${doneDay ? '오늘 공부 끝! 조금 더 하기' : d.words ? '이어서 공부하기' : '오늘 공부 시작하기'}</button></div>
${qHomeCard()}
<div style="display:flex;flex-direction:column;align-items:center;gap:8px">
<div class="field mini" id="minif" data-a="tab" data-t="vil" role="button" aria-label="마을 들어가기" style="flex:none;width:100%;height:176px;min-height:0;touch-action:pan-y;cursor:pointer;overflow:hidden">${vilMini()}</div>
${townCount() > 1 || townRoom() > 0 ? `<button type="button" class="row" data-a="towns" style="align-self:stretch;justify-content:center;gap:8px;height:42px;border-radius:14px;border:2px solid var(--ink);background:var(--paper);font-size:15px">${allTowns().map(tw => stk(DT.themes[tw.theme].fr[0], 26)).join('')}<span class="d">${townCount() > 1 ? `마을 바꾸기 · ${townCount()}개` : '새 마을을 열 수 있어요'}</span>${ico(IC.fwd, 16)}</button>` : ''}
<div class="row" style="gap:6px;align-self:stretch">${hChip(`<span class="d tn">완성 ${vilScore().pct}%</span>`, '--stary', '마을 완성도')}${hChip(frInner({ k: TH().hero, lv: 1 }, 24, true) + `<span class="tn">${cntF()}/${MAXF}</span>`, '', '친구 자리')}${hChip(pic(TH().base[0], 22) + `<span class="tn">${cntI()}/${MAXI}</span>`, '', '물건 자리')}${hChip(itm('eggbox', 24) + `<span class="tn d">${boxes}</span>`, boxes ? '--stary' : '', '상자')}${hChip(actIcons('merge').replace(/width="\d+" height="\d+"/g, 'width="22" height="22"') + `<span class="tn d">${mergeable()}</span>`, mergeable() ? '--y' : '', '합칠 묶음')}</div></div>
<div class="card"><div class="row" style="justify-content:space-between;align-items:center">${ttl('전체 단어', '--a2', IC.chart)}<span class="tn" style="font-size:14px;color:var(--sub)">${c.total.toLocaleString()}개 중 ${c.total - c.none}개 만났어요</span></div>
<div class="bar" style="height:14px;border-radius:7px"><i style="width:${pct(c.done)}%;border-radius:0"></i><i style="width:${pct(c.mid)}%;background:var(--mainMid);border-radius:0"></i><i style="width:${pct(c.seen)}%;background:var(--mainLt);border-radius:0"></i></div>
<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 14px;font-size:14px">${leg('--main', '완벽히 알아요', c.done)}${leg('--mainMid', '조금 알아요', c.mid)}${leg('--mainLt', '한 번 봤어요', c.seen)}${leg('--track', '아직 안 봤어요', c.none)}</div></div>
</div>${tabbar('home')}`;
  },
  after() { applyTheme(O().theme); const f = $('#minif'), w = $('#miniw'), sp = $('#minis'); if (f && w && sp) { const k = Math.max(f.clientWidth / WW, .3), H = Math.min(Math.round(WH * k), 176), ob = O().vil.objs, cy = ob.length ? ob.reduce((a, o) => a + o.y, 0) / ob.length : WH / 2, cx = ob.length ? ob.reduce((a, o) => a + o.x, 0) / ob.length : WW / 2;
      sp.style.width = Math.round(WW * k) + 'px'; sp.style.height = Math.round(WH * k) + 'px'; f.style.height = H + (f.offsetHeight - f.clientHeight) + 'px'; w.style.transform = `scale(${k})`;
      sp.style.top = -Math.round(clamp(cy * k - H * .55, 0, Math.max(0, WH * k - H))) + 'px'; sp.style.left = -Math.round(clamp(cx * k - f.clientWidth / 2, 0, Math.max(0, WW * k - f.clientWidth))) + 'px'; } if (S.pnSeen !== PATCH.v && !window.NO_TUT) { setTimeout(pnCheck, 350); return; } if (weeklyPop()) return; afterChecks(); },
  back() { return false; }
};
ACT.study = () => startSession('daily');

SCR.set = {
  view() {
    const o = O(), n = curBook().words.length;
    return `<div class="scr">${topbar('설정')}
<div class="card"><h2>소리</h2>${sw('setBgm', !S.noBgm, '배경음악 켜기')}${sw('setSfx', !S.noSfx, '효과음 켜기')}<div class="hint">단어 카드와 시험 화면에서는 음악이 나오지 않아요</div></div>
<div class="card"><h2>단어장</h2><div class="grid3">${BOOKS.map(b => `<button type="button" class="tile${o.book === b.id ? ' on' : ''}" style="padding:8px 2px;gap:1px;border-radius:16px;${o.book === b.id ? 'background:var(--main)' : ''}" data-a="setBook" data-k="${b.id}"><span class="d" style="font-size:15px;white-space:nowrap">${b.name}</span><span class="tn" style="font-size:12.5px">${b.words.length.toLocaleString()}단어</span></button>`).join('')}</div><div class="hint">단어장은 한 번에 하나만 공부해요<br>바꿔도 공부 기록은 그대로 남아요</div></div>
${vxCard()}
<div class="card"><h2>하루에 공부할 단어</h2>${seg('setPer', [[10, '10개'], [15, '15개'], [20, '20개'], [30, '30개']], o.per)}<div class="hint">복습까지 하면 약 ${Math.ceil(n / o.per * (o.book === 'starter' ? 1.6 : 1.3))}일이면 한 바퀴 돌아요<br>전체 ${n.toLocaleString()}단어 기준</div></div>
<div class="card"><h2>공부 방법</h2>${seg('setMode', [['card', '카드 + 시험'], ['test', '시험만']], o.mode)}</div>
<div class="card"><h2>문제 종류</h2><div class="hint">체크한 종류만 문제로 나와요<br>하나는 꼭 골라 두어야 해요</div>${typeRows(o.types, 'setType')}</div>
<div class="card"><h2>단어 카드 읽어 주기</h2>${sw('setAuto', o.auto, '자동으로 넘기기')}${sw('setEx', o.exRead, '예문도 읽어 주기')}<span style="font-size:15.5px">읽어 주는 속도</span>${seg('setSpeed', [['slow', '느리게'], ['mid', '보통'], ['fast', '빠르게']], o.speed)}</div>
<div class="card"><h2>백업</h2><button type="button" class="btn sec sm" data-a="backup">백업 저장</button><div class="hint">기록을 파일로 저장해 두어요<br>불러오기는 다음 버전에 들어가요</div></div>
${S.dev || o.inf ? `<div class="card" style="background:var(--t3)"><h2>테스트</h2>${sw('setInf', o.inf, '무한모드')}<div class="hint" style="color:var(--sub2)">꽤 자란 마을로 바꿔서 이것저것 눌러 볼 수 있어요.<br>별이 줄지 않고 상자도 계속 생겨요.<br>끄면 원래 마을과 기록으로 돌아와요.</div></div>` : ''}
<div class="card"><h2>이 마을</h2><button type="button" class="btn sec sm" data-a="delAsk">이 마을 지우기</button></div>
<div class="card"><h2>앱 정보</h2><div class="row" style="gap:8px"><button type="button" class="btn sec sm f1" data-a="pnShow">업데이트 내용</button><button type="button" class="btn sec sm f1" data-a="go" data-s="privacy">개인정보처리방침</button></div></div>
<div class="card"><h2>알림</h2><div class="hint" style="font-size:13px;line-height:1.6">기록은 이 기기에만 저장되고 밖으로 보내지 않아요.${window.Android ? '<br>새 버전이 나왔는지만 앱을 열 때 확인해요.' : ''}<br>궁금한 점은 인스타그램이나 쓰레드로 연락 주세요<br>${contactBtns()}<br>글꼴: 낭만있구미체(구미시), 눈누 기초고딕(눈누)<br>단어장: 초등·중학교는 2022 개정 영어과 교육과정 기본 어휘 목록 참고, 고등은 수능 수준 어휘에서, 회화·실생활은 일상에서 자주 쓰는 말에서 골랐어요<br><span data-a="verTap">버전 ${VERSION}</span>${NEWVER ? ` · <button type="button" data-a="verGet" class="d" style="border:0;background:none;padding:0 2px;font-size:14px;color:var(--ink);text-decoration:underline">새 버전 ${NEWVER} 받기</button>` : window.Android ? ` · <button type="button" data-a="verAsk" class="d" style="border:0;background:none;padding:0 2px;font-size:14px;color:var(--ink);text-decoration:underline">새 버전 확인</button>` : ''}</div></div></div>`;
  }
};
ACT.setBook = d => {
  const o = O(); if (o.book === d.k) return;
  if (!o.used.includes(d.k)) {
    o.used.push(d.k); var fresh = true;
  }
  o.book = d.k; if (!o.typesSet) o.types = defTypes(d.k); save(); render();
  if (fresh && townRoom() > 0) setTimeout(() => modal(`<h1>새 단어장을 시작해요</h1><div class="hint" style="font-size:15px">마을은 어떻게 할까요?<br>지금 마을(완성 ${vilScore().pct}%)을 끝까지 키워도 되고, 새 마을을 열어도 돼요.<br>새 마을은 마을 이름을 누르면 나중에도 열 수 있어요</div><button type="button" class="btn sec" data-a="close">지금 마을 이어서 키우기</button><button type="button" class="btn" data-a="townPick">새 마을 열기</button>`), 0);
  else setTimeout(() => vxAsk(true), 300);
};
ACT.setPer = d => { O().per = +d.v; save(); render(); };
ACT.setMode = d => { O().mode = d.v; save(); render(); };
ACT.setType = d => { const t = O().types; if (t[d.k] && Object.values(t).filter(Boolean).length === 1) return toast('하나는 꼭 골라 두어야 해요'); t[d.k] = t[d.k] ? 0 : 1; O().typesSet = 1; save(); render(); };
ACT.setBgm = () => { S.noBgm = S.noBgm ? 0 : 1; save(); SND.reset(); render(); };
ACT.setSfx = () => { S.noSfx = S.noSfx ? 0 : 1; save(); if (!S.noSfx) SND.fx('tap'); render(); };
ACT.setAuto = () => { const o = O(); o.auto = !o.auto; save(); render(); };
ACT.setEx = () => { const o = O(); o.exRead = !o.exRead; save(); render(); };
ACT.setSpeed = d => { O().speed = d.v; save(); render(); speak('apple', RATE[d.v]); };
ACT.setInf = () => { const on = !O().inf; setInf(on); render(); toast(on ? '무한모드를 켰어요 · 마을에 가 보세요' : '무한모드를 껐어요 · 원래 마을로 돌아왔어요'); };
ACT.backup = () => { const j = JSON.stringify(S), name = 'daneokiugi-backup-' + today() + '.json'; if (window.Android && Android.exportBackup) return toast(Android.exportBackup(name, j));
  try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([j], { type: 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); toast('백업 파일을 내려받았어요'); } catch (e) { toast('이 기기에서는 백업 파일을 저장할 수 없어요'); } };
ACT.delAsk = () => modal(`<h1>이 마을을 지울까요?</h1><div class="hint" style="font-size:15px">${esc(O().name)}의 마을과 공부 기록이 모두 사라져요. 되돌릴 수 없어요.</div><div class="row"><button type="button" class="btn f2" data-a="close">그대로 둘게요</button><button type="button" class="btn sec f1" data-a="delYes">지우기</button></div>`);
ACT.delYes = () => { closeModal(true); if (S.keep) delete S.keep[S.cur]; S.owners.splice(S.cur, 1); S.keep = {}; S.cur = -1; save(true); go('main', {}, { reset: true }); };

const PATCH = { v: '0.1.36', date: '11월 27일', items: [
  ['잘 모르겠어요', '시험에서 ‘잘 모르겠어요’를 누르면 정답과 예문을 보여 준 다음 넘어가요', 'study'],
  ['음성 파일 받기', '설정에서 단어장마다 음성 파일을 받을 수 있어요. 받아 두면 낱말과 예문을 또렷한 목소리로 읽어 주고, 인터넷이 없어도 돼요. 받지 않으면 내 기기의 내장 음성 목소리가 읽어줘요', 'study'],
  ['친구들의 부탁', '마을 친구 머리 위에 느낌표가 뜨면 눌러서 부탁을 받아요. 하루 다섯 개까지, 모두 공부 부탁이에요', 'quest'],
  ['가장 신비한 알', '부탁을 들어줄 때마다 꼭대기 광장의 알이 자라요. 80번이면 가장 신비한 친구가 깨어나 마을에 멋진 효과를 뿌려요', 'egg'],
  ['부탁 칭호 10개', '칭호에 부탁 묶음이 새로 생겼어요', 'title'],
  ['공부가 더 편해졌어요', '카드 고르기 문제가 더 자주 나와요. 모르는 문제는 잘 모르겠어요를 누르면 오답노트에 담고 넘어가요', 'study'],
  ['홈과 문의', '오늘의 단어를 홈 맨 위로 올렸어요. 궁금한 점은 설정에서 인스타그램·쓰레드로 연락 주세요', 'home2']] };
function pnIcon(k, sz) {
  const t = TH();
  return k === 'quest' ? `<span class="qbub qon sm" style="animation:none">!</span>` : k === 'egg' ? eggCell(5, sz * .8) : k === 'title' ? ico(IC.star, sz * .7, 2.6) : k === 'study' ? ico(IC.book, sz * .7, 2.6) : k === 'home2' ? ico(IC.home, sz * .7, 2.6) : k === 'home' ? pic(t.homes[0].k, sz) : k === 'town' ? stk(DT.themes[['dino', 'chara', 'animal'].find(x => x !== O().theme)].fr[0], sz) : k === 'res' ? pic('log', sz) : k === 'rec' ? pic(t.sets[10].recs[0].out, sz) : k === 'mys' ? stk(t.mys[0], sz) : ico(IC.check, sz * .7, 3);
}
function pnModal() {
  modal(`<div class="row" style="gap:8px;align-items:baseline"><h1 style="margin:0">새로워졌어요</h1><span class="chip ln" style="background:var(--stary);font-size:12.5px">${PATCH.date} · ${PATCH.v}</span></div>
<div style="display:flex;flex-direction:column;gap:8px">${PATCH.items.map(([h, d, ic], i) => `<div class="row" style="gap:10px;align-items:center;padding:8px 10px;border:2px solid var(--ink);border-radius:16px;background:${i % 2 ? 'var(--paper)' : 'var(--t1)'}"><span style="flex:none;width:44px;height:44px;border-radius:13px;background:var(--paper);border:1.5px solid var(--ink);display:flex;align-items:center;justify-content:center">${pnIcon(ic, 34)}</span><span style="display:flex;flex-direction:column;gap:1px;min-width:0"><span class="d" style="font-size:16px">${h}</span><span style="font-size:12.5px;line-height:1.45;color:var(--sub2)">${d}</span></span></div>`).join('')}</div>
<button type="button" class="btn" data-a="close">좋아요</button>`, { mid: true });
}
ACT.pnShow = () => pnModal();
function pnCheck() {
  if (S.pnSeen === PATCH.v || S.cur < 0 || $('#ov') || $('#tut')) return;
  S.pnSeen = PATCH.v; save(); pnModal();
}

SCR.privacy = {
  view() {
    const sec = (h, body) => `<div class="card" style="gap:6px"><h2 style="font-size:18px">${h}</h2><div style="font-size:14.5px;line-height:1.65;color:var(--tx)">${body}</div></div>`;
    return `<div class="scr">${topbar('개인정보처리방침')}
<div class="hint" style="font-size:13.5px">단어키우기 · 시행일 2026년 11월 27일</div>
${sec('한 줄 요약', '단어키우기는 개인정보를 모으지 않아요. 회원가입이나 로그인이 없고, 공부 기록과 마을은 이 기기 안에만 저장돼요. 만든 사람을 포함해 누구에게도 보내지 않아요.')}
${sec('1. 모으는 개인정보', '없어요. 이름, 전화번호, 이메일, 위치, 사진, 연락처 같은 정보를 받거나 보내지 않아요.')}
${sec('2. 기기 안에만 저장되는 것', '앱을 쓰려고 입력하거나 만든 아래 내용은 이 기기 안에만 저장돼요.<br>· 프로필 이름(별명)과 스티커<br>· 공부 기록(단어별로 맞힌 횟수와 날짜, 오답노트)<br>· 마을, 친구, 물건, 칭호, 앨범 사진, 설정<br>앱을 지우거나 설정에서 마을을 지우면 함께 지워져요. 웹앱은 브라우저 저장소에 저장되어, 브라우저의 사이트 데이터를 지우면 사라져요.')}
${sec('3. 인터넷을 쓰는 곳', '설치 파일로 받은 앱은 새 버전이 나왔는지 확인할 때와, 음성 파일을 받을 때만 인터넷을 써요. 버전 번호가 적힌 파일(daneokiugi.pages.dev/version.txt)과 음성 파일 목록과 파일(daneokiugi.pages.dev/voice)을 읽을 뿐이고, 기기나 사용자를 알아볼 수 있는 정보는 보내지 않아요. 음성 파일은 ‘받기’를 눌렀을 때만 받아요. 앱 화면 안에서는 인터넷 연결을 막아 두었어요.<br>웹앱과 설치 파일은 Cloudflare Pages에서 내려받아요. 이때 Cloudflare가 서비스를 운영하려고 접속 기록(IP 주소 등)을 처리할 수 있어요. 만든 사람은 방문 통계나 추적 도구를 쓰지 않아요.')}
${sec('4. 광고, 분석, 제3자 제공', '광고, 분석 도구, 추적 도구가 없어요. 개인정보를 다른 곳에 주거나 맡기지 않아요.')}
${sec('5. 기기 권한', '인터넷(새 버전 확인, 음성 파일 받기)과 진동만 써요. 카메라, 마이크, 위치, 연락처, 사진첩은 쓰지 않아요. 백업 저장은 직접 눌렀을 때만 기기에 파일로 저장해요.')}
${sec('6. 단어 읽어 주기', '읽어 주는 소리는 휴대폰이나 브라우저에 있는 음성 기능으로 만들어요. 음성 처리 방식은 기기와 브라우저 설정을 따라요.<br>음성 파일을 받으면, 미리 만들어 둔 소리 파일(Google Cloud Text-to-Speech로 만든 목소리)을 기기에 저장해 두고 그걸로 읽어요. 받지 않으면 내 기기의 내장 음성 목소리가 읽어줘요. 읽는 낱말이나 공부 기록을 밖으로 보내지 않아요.')}
${sec('7. 어린이', '어린이도 안심하고 쓸 수 있도록 개인정보를 모으지 않게 만들었어요. 보호자는 앱을 지우거나 마을을 지워서 언제든 모든 기록을 지울 수 있어요.')}
${sec('8. 바깥 링크', '인스타그램이나 쓰레드 버튼을 누르면 그 앱이나 사이트로 이동해요. 그곳에서는 각 서비스의 개인정보 처리방침이 적용돼요.')}
${sec('9. 문의와 바뀔 때', `궁금한 점은 인스타그램이나 쓰레드로 메시지를 보내 주세요. ${contactBtns()}<br>이 방침이 바뀌면 앱 업데이트 소식과 이 화면에서 알려 드려요.`)}
</div>`;
  }
};

ACT.parOwner = d => { R.p = { i: +d.v }; render(); };

function boot() {
  load(); buildCat(); verCheck(); vxInit(); if (!S.owners.length) S.pnSeen = PATCH.v;
  if (S.cur >= 0 && S.owners[S.cur]) { applyTheme(O().theme); go('home', {}, { reset: true }); }
  else { S.cur = -1; go('main', {}, { reset: true }); }
}
window.addEventListener('load', boot);

let _verTap = 0;
ACT.verTap = () => { if (++_verTap < 7) return; _verTap = 0; S.dev = S.dev ? 0 : 1; save(); render(); toast(S.dev ? '테스트 칸을 켰어요' : '테스트 칸을 껐어요'); };

ACT.maker = d => { const u = (CONTACT[+d.u || 0] || CONTACT[0])[1]; if (window.Android) location.href = u; else window.open(u, '_blank', 'noopener'); };

let NEWVER = '';
const verGt = (a, b) => { const x = String(a).split('.'), y = String(b).split('.'); for (let i = 0; i < 3; i++) { const p = +x[i] || 0, q = +y[i] || 0; if (p !== q) return p > q; } return false; };
function verCard() {
  if (!NEWVER || S.verHide === today()) return '';
  return `<div id="vercard" class="row" style="flex:none;gap:8px;padding:8px 8px 8px 14px;background:#FFE27A;border:2.5px solid var(--ink);border-radius:20px;box-shadow:0 4px 0 rgba(74,65,56,.2);color:#4A4138"><span style="flex:1 1 0;min-width:0;font-size:15px;line-height:1.35"><span class="d" style="font-size:16px">새 버전이 나왔어요</span><br>지금 ${VERSION} → 새 버전 ${NEWVER}</span><button type="button" class="d" data-a="verGet" style="flex:none;height:40px;padding:0 14px 2px;border:2.5px solid #4A4138;border-radius:14px;background:#FFFDF6;font-size:15.5px;color:#4A4138">받기</button><button type="button" data-a="verLater" aria-label="나중에" style="flex:none;width:34px;height:40px;border:0;background:none;padding:0;color:#4A4138;display:flex;align-items:center;justify-content:center">${ico(IC.x, 18)}</button></div>`;
}
let verAt = 0, verAsk = 0;
window.onVer = v => {
  v = String(v || '').trim(); if (!/^\d+\.\d+\.\d+$/.test(v)) return;
  S.verNew = v; save();
  const was = NEWVER; NEWVER = verGt(v, VERSION) ? v : '';
  if (verAsk) { clearTimeout(verAsk); verAsk = 0; toast(NEWVER ? `새 버전 ${NEWVER}이 나왔어요` : '지금이 가장 새 버전이에요'); }
  if (NEWVER !== was && R && (R.name === 'main' || R.name === 'home' || R.name === 'set') && !$('#ov') && !$('#tut')) render();
};

function verCheck(force) {
  if (S.verNew && verGt(S.verNew, VERSION)) NEWVER = S.verNew;
  if (!(window.Android && Android.checkVersion)) return false;
  const now = Date.now(); if (!force && now - verAt < 10 * 6e4) return false;
  verAt = now; try { Android.checkVersion(); } catch (e) { return false; } return true;
}
window.onAppResume = () => { verCheck(); };
document.addEventListener('visibilitychange', () => { if (!document.hidden) verCheck(); });
ACT.verAsk = () => {
  if (!(window.Android && Android.checkVersion)) return toast('웹앱은 다시 열면 알아서 새 버전으로 바뀌어요');
  if (!verCheck(true)) return toast('확인하지 못했어요'); toast('새 버전이 있는지 확인하고 있어요');
  clearTimeout(verAsk); verAsk = setTimeout(() => { verAsk = 0; toast('확인하지 못했어요. 인터넷 연결을 봐 주세요'); }, 9000);
};
ACT.verGet = () => { if (window.Android && Android.openUpdate) Android.openUpdate(); else toast('설치했던 주소에서 새 파일을 받아 주세요'); };
ACT.verLater = () => { S.verHide = today(); save(); render(); toast('설정 맨 아래에서 언제든 받을 수 있어요'); };
