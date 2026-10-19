/* =========================================================
   마을 · 집 · 컬렉션 · 업적
   ========================================================= */
const PER_EGG=5;
const FOODS=[['🍙','주먹밥'],['🍓','딸기'],['🍪','쿠키'],['🍩','도넛'],['🍮','푸딩'],['🍕','피자'],['🍦','아이스크림'],['🧁','컵케이크'],['🍉','수박'],['🥞','팬케이크']];
const ACC_INFO={bow:['🎀','리본'],flower:['🌼','꽃'],beanie:['🧶','비니'],glasses:['👓','안경'],leaf:['🌱','새싹'],phones:['🎧','헤드폰'],party:['🥳','고깔'],crown:['👑','왕관']};
const BASIC_ACC=['bow','flower','beanie','glasses','leaf'];
const DECOS=['🌷','🌻','🍄','🎈','🪴','🌲','🧸','🎠','🌈','🏮','🪁','🐞','🦋','🍀','⛱️','🛝'];
const FUNNY=['졸린','배고픈','데굴데굴','엉뚱한','반짝반짝','뒤뚱뒤뚱','멍때리는','간지럼 타는','콧노래 부르는','말랑말랑','야근하는','월요병 걸린','출근하기 싫은','칼퇴하는','수줍은','폴짝폴짝','딸꾹질하는','영어 잘하는','방구 뀌는','자꾸 굴러가는','낮잠 자는','춤추는','단어 외우는','시험 망친','커피 마신','윙크하는'];
const HOUSE_TYPES={mushroom:'버섯 하우스',cake:'케이크 하우스',cloud:'구름 하우스'};
const batchim=w=>{ const c=String(w).charCodeAt(String(w).length-1)-0xAC00; return c>=0&&c%28!==0; };
const funnyName=sp=>`${pick(FUNNY)} ${ALL_SP[sp].ko}`;
const fspec=f=>({sp:f.sp,col:f.col,eyes:FACES[(f.face||0)%FACES.length][0],mouth:FACES[(f.face||0)%FACES.length][1],cheek:'pink',acc:f.acc||(f.lv===2?'crown':'')});
let vTimers=[], selItem=null;
function vClear(){ vTimers.forEach(clearTimeout); vTimers=[]; }
const isNight=()=>{ const h=new Date().getHours(); return h>=21||h<6; };

/* ---------- 별 · 알 · 아이템 ---------- */
function addStars(n){
  if(n<=0) return 0;
  const before=Math.floor(S.stars/PER_EGG); S.stars+=n; const after=Math.floor(S.stars/PER_EGG);
  ensureEggs(); return after-before;
}
function ensureEggs(){ const n=Math.floor(S.stars/PER_EGG); while(S.spawned<n){ S.friends.push({id:S.nextId++,egg:true}); S.spawned++; } }
const eggCount=()=>{ ensureEggs(); return S.friends.filter(f=>f.egg).length; };
function addItem(kind,key,n){ const box=kind==='food'?S.food:S.accs; box[key]=(box[key]||0)+(n||1); }
function useItem(kind,key){ const box=kind==='food'?S.food:S.accs; if(!box[key]) return false; box[key]--; if(box[key]<=0) delete box[key]; return true; }
const isHungry=f=>!f.egg&&f.fed!==today();
const hungryCount=()=>S.friends.filter(isHungry).length;
function randomSpecies(){
  // 처음 8종은 더 자주 나와서 같은 친구 3마리를 모으기 쉬워요
  const keys=Object.keys(SPECIES), bag=[]; keys.forEach((k,i)=>{ for(let n=0;n<(i<8?3:1);n++) bag.push(k); }); return pick(bag);
}
function spawnHidden(sp){
  if(S.friends.some(f=>f.sp===sp)||Object.values(S.sleepers).some(f=>f.sp===sp)) return null;
  const f={id:S.nextId++,sp,col:HIDDEN[sp].col,face:Math.floor(Math.random()*FACES.length),lv:1,hidden:true,name:HIDDEN[sp].ko,born:today()};
  S.friends.push(f); if(!S.found.includes(sp)) S.found.push(sp); return f;
}

/* ---------- 홈 미리보기 ---------- */
function villageMini(){
  ensureEggs(); const fr=S.friends, show=fr.slice(-4), eggs=eggCount(), hungry=hungryCount(), mail=S.mail!==today();
  const pv=show.length?show.map(f=>f.egg?eggSVG():creature(fspec(f))).join(''):`<span style="font-size:36px">🥚</span>`;
  const msg=eggs?`🥚 깨어나길 기다리는 알 ${eggs}개`:hungry?`🍙 배고픈 친구 ${hungry}명`:mail?'📮 우체통에 선물이 왔어요':fr.length?`친구 ${fr.length+Object.keys(S.sleepers).length}명이 살고 있어요`:`⭐ ${PER_EGG}개를 모으면 첫 알이 와요 (지금 ${S.stars}개)`;
  return `<button class="card vprev" onclick="go('village')"><div class="ppl">${pv}</div><div style="min-width:0"><div style="font-size:18px">🏡 ${esc(S.name||'친구')}네 마을</div><div class="sub">${msg}</div></div></button>`;
}

/* ---------- 마을 화면 ---------- */
function groups(){ const g={}; S.friends.forEach(f=>{ if(f.egg||f.hidden) return; const k=f.sp+'|'+(f.lv||1); (g[k]=g[k]||[]).push(f); }); return Object.entries(g).filter(([,a])=>a.length>=3).map(([k,a])=>({sp:k.split('|')[0],lv:+k.split('|')[1],list:a.slice(0,3)})); }
function eggSVG(){ return `<svg viewBox="0 0 80 96" aria-hidden="true"><path d="M40 6 C62 6 74 46 72 64 C70 84 56 92 40 92 C24 92 10 84 8 64 C6 46 18 6 40 6 Z" fill="#FFFDF6" stroke="${INK}" stroke-width="3"/><path d="M9 52 l10 -7 8 7 8 -7 8 7 8 -7 8 7 8 -7 4 4" fill="none" stroke="#E9A3B4" stroke-width="4" stroke-linejoin="round"/><circle cx="28" cy="32" r="5" fill="#CADAEE"/><circle cx="52" cy="72" r="6" fill="#F5E2A6"/><circle cx="30" cy="74" r="3.5" fill="#C3E3D4"/><ellipse cx="24" cy="20" rx="4" ry="7" fill="#fff" transform="rotate(25 24 20)"/></svg>`; }
function sky(){
  const m=new Date().getMonth()+1, night=isNight(), fall=m===12||m<=2?'❄️':m<=5?'🌸':m<=8?'':'🍁';
  let out=night?`<svg class="sun" viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" fill="#FFF3B0"/><circle cx="40" cy="24" r="20" fill="#3A3560"/></svg>${Array.from({length:14},(_,i)=>`<i class="star" style="left:${(i*37)%94+3}%;top:${(i*19)%70+8}px;animation-delay:-${i*.3}s"></i>`).join('')}`
    :`<svg class="sun" viewBox="0 0 60 60"><circle cx="30" cy="30" r="20" fill="#F2D07A" stroke="${INK}" stroke-width="3"/><circle cx="24" cy="28" r="2.4" fill="${INK}"/><circle cx="36" cy="28" r="2.4" fill="${INK}"/><path d="M26 35 q4 4 8 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/></svg><div class="cloud" style="left:8%;width:66px"></div><div class="cloud" style="left:46%;width:84px;top:40px"></div>`;
  if(fall) out+=Array.from({length:10},(_,i)=>`<span class="fall" style="left:${(i*41)%96}%;animation-duration:${6+(i%5)}s;animation-delay:-${i*1.1}s">${fall}</span>`).join('');
  return out;
}
function houseSVG(h){
  const lit=isNight()?'#FFE58A':'#E6F2FC', win=(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${lit}" stroke="${INK}" stroke-width="2.6"/>`;
  const sign=`<rect x="44" y="104" width="62" height="18" rx="9" fill="#fff" stroke="${INK}" stroke-width="2.4"/><text x="75" y="117" text-anchor="middle" font-family="JuaLocal,Jua,sans-serif" font-size="11" fill="${INK}">${esc((ALL_SP[h.sp]||{ko:''}).ko)}네</text>`;
  const zz=isNight()&&h.sleep.length?`<text x="118" y="64" font-size="16" fill="#fff" font-family="JuaLocal,Jua,sans-serif">zZ</text>`:'';
  if(h.type==='cake') return `<svg viewBox="0 0 150 130"><rect x="22" y="56" width="106" height="52" rx="10" fill="#FFF3E0" stroke="${INK}" stroke-width="3"/><path d="M22 70 C34 78 40 66 52 74 C64 82 70 68 82 76 C94 84 102 68 128 72 V60 H22Z" fill="#EDB9C6" stroke="${INK}" stroke-width="2.6"/><rect x="34" y="26" width="82" height="34" rx="8" fill="#FFF3E0" stroke="${INK}" stroke-width="3"/><path d="M34 38 C46 46 54 34 66 42 C78 50 86 36 116 40 V32 H34Z" fill="#F2D07A" stroke="${INK}" stroke-width="2.4"/><rect x="72" y="8" width="6" height="18" rx="2" fill="#CADAEE" stroke="${INK}" stroke-width="2"/><path d="M75 2 q4 4 0 7 q-4 -3 0 -7z" fill="#F2A33A"/>${win(50,88,9)}${win(100,88,9)}<rect x="66" y="80" width="18" height="28" rx="8" fill="#C9935C" stroke="${INK}" stroke-width="2.6"/>${zz}${sign}</svg>`;
  if(h.type==='cloud') return `<svg viewBox="0 0 150 130"><path d="M30 104 C8 104 8 72 28 68 C24 44 52 34 62 50 C68 26 104 26 106 50 C120 40 144 56 130 74 C148 82 140 106 120 104Z" fill="#fff" stroke="${INK}" stroke-width="3"/>${win(52,74,10)}${win(96,74,10)}<rect x="64" y="80" width="22" height="24" rx="10" fill="#CADAEE" stroke="${INK}" stroke-width="2.6"/>${zz}${sign}</svg>`;
  return `<svg viewBox="0 0 150 130"><rect x="40" y="56" width="70" height="52" rx="14" fill="#FFF3E0" stroke="${INK}" stroke-width="3"/><path d="M10 62 C10 26 44 6 75 6 C106 6 140 26 140 62 Q75 72 10 62Z" fill="#E9A3B4" stroke="${INK}" stroke-width="3"/><circle cx="40" cy="36" r="8" fill="#fff"/><circle cx="78" cy="22" r="7" fill="#fff"/><circle cx="110" cy="40" r="9" fill="#fff"/>${win(58,82,8)}${win(92,82,8)}<rect x="66" y="84" width="18" height="24" rx="8" fill="#C9935C" stroke="${INK}" stroke-width="2.6"/>${zz}${sign}</svg>`;
}
function villageHTML(){
  ensureEggs(); const fr=S.friends, gs=groups(), night=isNight();
  const residents=fr.filter(f=>!f.egg).length+Object.keys(S.sleepers).length;
  const houses=S.house.map(h=>`<div class="plot wide"><span class="ftag big">${esc(h.name)} · ${h.sleep.length}/6 쿨쿨</span><button class="house" data-house="${h.id}" aria-label="${esc(h.name)}">${houseSVG(h)}</button><div class="shadow" style="width:110px"></div></div>`).join('');
  const mail=S.mail!==today();
  const mailbox=`<div class="plot"><span class="ftag ${mail?'new':''}">${mail?'선물 왔어요!':'우체통'}</span><button class="mailbox ${mail?'ready':''}" data-act="mail" aria-label="우체통">📮</button><div class="shadow"></div></div>`;
  const plots=fr.map(f=>{
    if(f.egg) return `<div class="plot"><span class="ftag new">새 알!</span><button class="egg" data-egg="${f.id}" aria-label="알 깨우기">${eggSVG()}</button><div class="shadow"></div></div>`;
    const sleep=night||f.sp==='sleepy', w=f.lv===2?100:70;
    return `<div class="plot"><span class="ftag ${f.hidden?'hid':f.lv===2?'big':''}">${f.hidden?'✨ ':''}${esc(f.name)}</span><div class="mon ${sleep?'sleep':'walk'}" data-mon="${f.id}" style="--w:${w}px">${creature(fspec(f),{sleep})}${sleep?'<span class="zz">z<small>Z</small></span>':''}${isHungry(f)&&!sleep?'<span class="think">🍙</span>':''}</div><div class="shadow"></div></div>`;
  }).join('');
  const decos=S.decos.map((d,j)=>`<div class="plot deco"><span class="decoi" style="animation-delay:-${(j*.7)%3}s">${d}</span><div class="shadow"></div></div>`).join('');
  const foods=Object.entries(S.food), accs=Object.entries(S.accs);
  const ib=(kind,[k,n])=>`<button class="item ${selItem&&selItem.kind===kind&&selItem.key===k?'on':''}" data-item="${kind}" data-key="${k}" aria-label="${kind==='food'?k:ACC_INFO[k][1]}">${kind==='food'?k:ACC_INFO[k][0]}<b>${n}</b></button>`;
  const hint=selItem?(selItem.kind==='food'?`${selItem.key} 누구에게 줄까요? 친구를 눌러요`:`${ACC_INFO[selItem.key][1]}을(를) 누구에게 씌워 줄까요? 친구를 눌러요`)
    :night?'🌙 밤이라 친구들이 꾸벅꾸벅 졸아요. 집을 눌러 침대에 재워 주세요':hungryCount()?`🍙 배고픈 친구가 ${hungryCount()}명 있어요. 밥을 골라 친구를 눌러 주세요`:'친구를 누르면 내가 배운 단어를 말해 줘요';
  return `<section class="card village" id="village">
    <div class="vhead"><div class="t"><div class="h2">🏡 ${esc(S.name||'친구')}네 마을</div><div class="sub">주민 ${residents}명 · 집 ${S.house.length}채 · ⭐ ${PER_EGG-S.stars%PER_EGG}개 더 모으면 새 알</div></div>
      ${gs.map((g,i)=>`<button class="mergebtn" data-merge="${i}">✨ ${g.lv===2?'큰 ':''}${ALL_SP[g.sp].ko} ×3 ${g.lv===2?'→ 집':'합치기'}</button>`).join('')}</div>
    <div class="scene ${night?'night':''}">${sky()}<div class="plots" id="plots">${houses}${mailbox}${plots}${decos}${fr.length||S.house.length?'':`<div class="vempty">문제를 한 번에 맞히면 ⭐1개!<br>별 ${PER_EGG}개를 모으면 첫 알이 와요 🥚</div>`}</div></div>
    <div class="tray" id="tray"><div class="hint">${hint}</div>
      <div class="items"><span class="lab">밥</span>${foods.length?foods.map(x=>ib('food',x)).join(''):'<span class="none">없어요</span>'}<span class="sep"></span><span class="lab">꾸미기</span>${accs.length?accs.map(x=>ib('acc',x)).join(''):'<span class="none">없어요</span>'}</div></div>
    <div class="vnote">⭐ ${PER_EGG}개마다 알이 와요. 뭐가 나올지 몰라요! · <b>같은 친구 3명</b> → 큰 친구 · <b>같은 큰 친구 3명</b> → 그 친구네 집 (침대 6개) · 우체통엔 하루 한 번 선물이 와요 · 아주 가끔 히든 친구가 나와요</div>
  </section>`;
}
function rVillage(){ page(villageHTML()); wireVillage(true); }
function refreshVillage(){ const v=$('#village'); if(!v) return; v.outerHTML=villageHTML(); wireVillage(false); }
function wireVillage(autoAsk){
  vClear(); const el=$('#plots'); if(!el) return;
  el.querySelectorAll('.mon.walk').forEach((m,k)=>{ m.style.setProperty('--wx',((k%2?1:-1)*(8+k*3%10))+'px'); m.style.animationDelay=`-${(k*1.3)%6}s`; });
  el.querySelectorAll('.mon .bob').forEach((b,k)=>b.style.animationDelay=`-${(k*.37)%1.8}s`);
  el.onclick=e=>{
    if(e.target.closest('[data-act="mail"]')){ openMail(); return; }
    const eg=e.target.closest('[data-egg]'); if(eg){ hatch(+eg.dataset.egg); return; }
    const hs=e.target.closest('[data-house]'); if(hs){ openHouse(hs.dataset.house); return; }
    const m=e.target.closest('[data-mon]'); if(m) tapFriend(+m.dataset.mon,m);
  };
  const tr=$('#tray'); if(tr) tr.onclick=e=>{ const b=e.target.closest('[data-item]'); if(!b) return; const k=b.dataset.item, key=b.dataset.key;
    selItem=selItem&&selItem.kind===k&&selItem.key===key?null:{kind:k,key}; refreshVillage(); };
  document.querySelectorAll('[data-merge]').forEach(b=>b.onclick=()=>askMerge(+b.dataset.merge));
  const gs=groups();
  if(autoAsk&&gs.length&&S.mergeAsked!==S.friends.length&&!document.querySelector('.modal')){ S.mergeAsked=S.friends.length; save(); vTimers.push(setTimeout(()=>askMerge(0),800)); }
}
function bubble(el,html,ms){ el.querySelectorAll('.say').forEach(s=>s.remove()); const s=document.createElement('div'); s.className='say'; s.innerHTML=html; el.appendChild(s); setTimeout(()=>s.remove(),ms||2200); }
function jump(el,heart){ el.classList.remove('jump'); void el.offsetWidth; el.classList.add('jump'); sfx.pop();
  const h=document.createElement('span'); h.className='heart'; h.textContent=heart||pick(['💖','💛','💗','✨']); el.appendChild(h); setTimeout(()=>h.remove(),1100); }
function tapFriend(id,el){
  const f=S.friends.find(x=>x.id===id); if(!f) return;
  if(selItem){
    const it=selItem;
    if(it.kind==='food'){
      if(f.fed===today()){ jump(el,'😵'); bubble(el,'배불러요~ 내일 또 주세요!'); return; }
      if(!useItem('food',it.key)) return; f.fed=today(); f.joy=(f.joy||0)+1; S.fedN=(S.fedN||0)+1; if(!S.food[it.key]) selItem=null; save(); refreshVillage();
      const ne=document.querySelector(`[data-mon="${id}"]`); if(ne){ jump(ne,it.key); bubble(ne,pick(['냠냠! 맛있다 😋','힘이 난다! 💪','오늘 공부도 화이팅!','최고의 '+FOODS.find(x=>x[0]===it.key)[1]+'!'])); }
      sfx.ok(); return;
    }
    if(!useItem('acc',it.key)) return; if(f.acc) addItem('acc',f.acc); f.acc=it.key; if(!S.accs[it.key]) selItem=null; save(); refreshVillage();
    const ne=document.querySelector(`[data-mon="${id}"]`); if(ne){ jump(ne,'✨'); bubble(ne,'어때요? 잘 어울려요?'); } sfx.ok(); return;
  }
  jump(el);
  if(isNight()||f.sp==='sleepy'){ bubble(el,'쿨… 5분만 더…'); return; }
  if(isHungry(f)&&Math.random()<.4){ bubble(el,'꼬르륵… 배고파요 🍙'); return; }
  if(f.sp==='mong'&&Math.random()<.3){ bubble(el,'우우~ 놀랐지? 👻'); return; }
  const known=WL.filter(o=>{const p=S.p[o.id]; return p&&p.c>0;}), o=pick(known.length?known:WL.slice(0,40));
  bubble(el,`<b class="en">${esc(o.w)}</b> ${esc(o.k)}`,2600); setTimeout(()=>speak(o.w),150);
}
function hatch(id){
  const b=document.querySelector(`[data-egg="${id}"]`); if(!b) return; b.classList.add('cracking'); sfx.tap();
  setTimeout(()=>{
    const f=S.friends.find(x=>x.id===id); if(!f) return; delete f.egg; f.lv=1; f.face=Math.floor(Math.random()*FACES.length); f.born=today(); S.hatchedN++;
    const hid=Math.random()<.03&&!S.found.includes('alien');
    if(hid){ f.sp='alien'; f.hidden=true; f.col=HIDDEN.alien.col; f.name=HIDDEN.alien.ko; }
    else { f.sp=randomSpecies(); f.col=pick(COLORS); f.name=funnyName(f.sp); }
    const isNew=!S.found.includes(f.sp); if(isNew) S.found.push(f.sp);
    save(); refreshVillage(); sfx.win(); burst(24);
    modal(`<div class="mt">${hid?'✨ 히든 친구 발견! ✨':'🐣 알에서 누가 나왔어요!'}</div><div class="result2">${creature(fspec(f))}</div><div style="font-size:19px">${esc(f.name)}</div>
      <div class="md">${hid?HIDDEN.alien.hint+'<br>컬렉션에 등록됐어요.':isNew?'처음 만난 친구예요! 컬렉션 도감에 등록됐어요.':'몸 색과 표정은 랜덤이라 세상에 하나뿐인 친구예요.'}</div>
      <div class="acts" style="justify-content:center"><button class="btn" onclick="closeModal();checkAch()">좋아요</button></div>`);
  },520);
}
function openMail(){
  if(S.mail===today()){ sfx.tap(); toast('선물은 내일 또 와요'); return; }
  S.mail=today(); const r=Math.random(); let html;
  if(r<.5){ const f=pick(FOODS); addItem('food',f[0],2); html=`<div style="font-size:100px;line-height:1.2">${f[0]}</div><div class="md">${f[1]} 2개! 배고픈 친구에게 주세요</div>`; }
  else if(r<.8){ const a=pick(BASIC_ACC); addItem('acc',a); html=`<div style="font-size:100px;line-height:1.2">${ACC_INFO[a][0]}</div><div class="md">${ACC_INFO[a][1]}! 친구에게 씌워 줄 수 있어요</div>`; }
  else { const d=pick(DECOS); S.decos=S.decos.concat(d).slice(-24); html=`<div style="font-size:100px;line-height:1.2">${d}</div><div class="md">마을에 장식을 놓았어요</div>`; }
  save(); sfx.win(); burst(20);
  modal(`<div class="mt">오늘의 선물이 왔어요!</div>${html}<div class="acts" style="justify-content:center"><button class="btn" onclick="closeModal();refreshVillage()">좋아요</button></div>`);
}
function askMerge(i){
  const g=groups()[i]; if(!g) return; const ko=ALL_SP[g.sp].ko;
  modal(`<div class="mt">${g.lv===1?`${ko} 셋이 모였어요!<br>큰 ${ko}${batchim(ko)?'으로':'로'} 합칠까요?`:`큰 ${ko} 셋!<br>${ko}네 집을 지을까요?`}</div>
    <div class="three" id="three">${g.list.map((f,k)=>`<span class="src" style="--dx:${(1-k)*80+130}px">${creature(fspec(f))}</span>${k<2?'<b>+</b>':''}`).join('')}<b style="margin:0 4px">➜</b><span class="q">${g.lv===1?'❓':'🏠'}</span></div>
    <div class="acts" style="justify-content:center"><button class="btn w sm" onclick="closeModal()">그대로 둘래요</button><button class="btn sm" id="myes">합치기 ✨</button></div>`);
  $('#myes').onclick=()=>{ $('#three').classList.add('merging'); sfx.pop(); setTimeout(()=>doMerge(g),750); };
}
function doMerge(g){
  const ids=new Set(g.list.map(f=>f.id)), ko=ALL_SP[g.sp].ko;
  g.list.forEach(f=>{ if(f.acc) addItem('acc',f.acc); });
  S.friends=S.friends.filter(f=>!ids.has(f.id)); S.merges++;
  let html;
  if(g.lv===1){ const nf={id:S.nextId++,sp:g.sp,col:pick(g.list).col,lv:2,face:g.list[0].face,name:`큰 ${pick(FUNNY)} ${ko}`,born:today()}; S.friends.push(nf);
    html=`<div class="mt">짜잔! 큰 ${ko} 탄생!</div><div class="result2">${creature(fspec(nf))}</div><div style="font-size:18px">${esc(nf.name)}</div><div class="md">큰 ${ko}${batchim(ko)?'을':'를'} 3명 모으면 ${ko}네 집이 생겨요</div>`;
  } else { const t=pick(Object.keys(HOUSE_TYPES)), nm=`${ko}네 ${HOUSE_TYPES[t]}`, h={id:'h'+S.nextId++,type:t,name:nm,sp:g.sp,sleep:[]}; S.house.push(h);
    html=`<div class="mt">🏠 ${nm}${batchim(nm)?'이':'가'} 생겼어요!</div><div class="result2" style="display:flex;justify-content:center">${houseSVG(h)}</div><div class="md">집을 누르면 침대 6개에 친구들을 재울 수 있어요</div>`; }
  S.mergeAsked=S.friends.length; save(); sfx.win(); burst(40);
  modal(html+`<div class="acts" style="justify-content:center"><button class="btn" onclick="closeModal();refreshVillage();checkAch()">좋아요 🎉</button></div>`);
}
function openHouse(hid){
  const h=S.house.find(x=>x.id===hid); if(!h) return;
  const beds=[0,1,2,3,4,5].map(i=>{ const s=h.sleep[i]!=null?S.sleepers[h.sleep[i]]:null;
    return s?`<button class="bed" onclick="wakeUp('${hid}',${s.id})" aria-label="${esc(s.name)} 깨우기"><span class="pillow"></span>${creature(fspec(s),{sleep:true})}<span class="blanket"></span><span class="zz">z<small>Z</small></span></button>`:`<div class="bed empty"><span class="pillow"></span><span class="blanket"></span><em>빈 침대</em></div>`; }).join('');
  const awake=S.friends.filter(f=>!f.egg);
  modal(`<div class="mt">${esc(h.name)}</div><div class="md">폭신한 침대에서 쿨쿨 · 자는 친구를 누르면 깨워요</div><div class="room">${beds}</div>
    ${awake.length&&h.sleep.length<6?`<div style="font-size:15px">누구를 재울까요?</div><div class="awake">${awake.map(f=>`<button onclick="sleepIn('${hid}',${f.id})">${creature(fspec(f))}${esc(ALL_SP[f.sp].ko)}</button>`).join('')}</div>`:h.sleep.length>=6?'<div class="md">침대가 꽉 찼어요</div>':''}
    <div class="acts" style="justify-content:center"><button class="btn w sm" onclick="closeModal();refreshVillage()">닫기</button></div>`);
}
function sleepIn(hid,id){ const h=S.house.find(x=>x.id===hid), i=S.friends.findIndex(f=>f.id===id); if(!h||i<0||h.sleep.length>=6) return; const f=S.friends.splice(i,1)[0]; S.sleepers[f.id]=f; h.sleep.push(f.id); save(); openHouse(hid); toast(`${ALL_SP[f.sp].ko} 쿨쿨… 💤`); }
function wakeUp(hid,id){ const h=S.house.find(x=>x.id===hid); h.sleep=h.sleep.filter(x=>x!==id); const f=S.sleepers[id]; delete S.sleepers[id]; if(f) S.friends.push(f); save(); openHouse(hid); toast('하암~ 잘 잤다! ☀️'); }

/* ---------- 업적 ---------- */
const ACH=[
  {id:'streak3',ic:'🔥',n:'3일 연속 공부',v:()=>S.streak.best,m:3,rw:{acc:'phones'}},
  {id:'streak7',ic:'🔥',n:'7일 연속 공부',v:()=>S.streak.best,m:7,rw:{hidden:'sleepy'}},
  {id:'streak30',ic:'🔥',n:'30일 연속 공부',v:()=>S.streak.best,m:30,rw:{hidden:'uni'}},
  {id:'streak100',ic:'👼',n:'100일 연속 공부',v:()=>S.streak.best,m:100,rw:{hidden:'angel'}},
  {id:'learn100',ic:'📖',n:'단어 100개 배우기',v:()=>counts().seen,m:100,rw:{acc:'party'}},
  {id:'master200',ic:'📗',n:'단어 200개 완벽히 익히기',v:()=>counts().master,m:200,rw:{hidden:'king'}},
  {id:'master1000',ic:'📘',n:'단어 1,000개 완벽히 익히기',v:()=>counts().master,m:1000,rw:{hidden:'gold'}},
  {id:'perfect10',ic:'🌈',n:'퀴즈 만점 10번',v:()=>S.perfect,m:10,rw:{hidden:'rainjelly'}},
  {id:'night',ic:'🌙',n:'밤 11시 이후에 공부하기',v:()=>S.night?1:0,m:1,rw:{hidden:'devil'}},
  {id:'house1',ic:'🏠',n:'첫 집 짓기',v:()=>S.house.length,m:1,rw:{acc:'crown'}},
  {id:'merge10',ic:'✨',n:'친구 합치기 10번',v:()=>S.merges,m:10,rw:{deco:'🌟'}},
  {id:'hatch30',ic:'🥚',n:'알 30개 깨우기',v:()=>S.hatchedN,m:30,rw:{deco:'🎪'}},
  {id:'feed50',ic:'🍙',n:'밥 50번 주기',v:()=>S.fedN||0,m:50,rw:{deco:'⛲'}},
  {id:'dex20',ic:'📕',n:'친구 20종 모두 만나기',v:()=>S.found.filter(k=>SPECIES[k]).length,m:20,rw:{deco:'🏰'}},
];
const rwText=rw=>rw.hidden?`히든 친구: ${HIDDEN[rw.hidden].ko}`:rw.acc?`꾸미기: ${ACC_INFO[rw.acc][1]}`:`마을 장식 ${rw.deco}`;
let achBusy=false;
function checkAch(){
  if(achBusy||document.querySelector('.modal')) return;
  const a=ACH.find(x=>!S.ach[x.id]&&x.v()>=x.m); if(!a) return;
  S.ach[a.id]=today(); const rw=a.rw; let art='';
  if(rw.hidden){ const f=spawnHidden(rw.hidden); art=creature(f?fspec(f):{sp:rw.hidden,cheek:'pink'}); }
  if(rw.acc){ addItem('acc',rw.acc); S.ach.accUnlock=(S.ach.accUnlock||[]).concat(rw.acc); art=`<div style="font-size:90px">${ACC_INFO[rw.acc][0]}</div>`; }
  if(rw.deco){ S.decos=S.decos.concat(rw.deco); art=`<div style="font-size:90px">${rw.deco}</div>`; }
  save(); achBusy=true; sfx.win(); burst(40);
  modal(`<div class="mt">🏆 업적 달성!</div><div style="font-size:18px;margin-top:6px">${a.ic} ${a.n}</div><div class="result2">${art}</div><div class="md">보상 · ${rwText(rw)}${rw.hidden?'<br>마을에 놀러 왔어요!':''}</div>
    <div class="acts" style="justify-content:center"><button class="btn" onclick="achBusy=false;closeModal();render()">좋아요</button></div>`);
}
let ctab='dex';
function rCollect(){
  const dex=[...Object.keys(SPECIES).map(k=>({k,hid:false})),...Object.keys(HIDDEN).map(k=>({k,hid:true}))];
  const got=dex.filter(d=>S.found.includes(d.k)).length, done=ACH.filter(a=>S.ach[a.id]).length;
  page(`<div class="card"><div class="h2">🏆 컬렉션</div><div class="sub">도감 ${got}/${dex.length} · 업적 ${done}/${ACH.length}</div>
    <div class="ctabs"><button class="chip ${ctab==='dex'?'on':''}" onclick="ctab='dex';rCollect()">친구 도감</button><button class="chip ${ctab==='ach'?'on':''}" onclick="ctab='ach';rCollect()">업적</button></div>
    ${ctab==='dex'?`<div class="dex">${dex.map((d,i)=>{ const on=S.found.includes(d.k), s=ALL_SP[d.k], fc=FACES[i%FACES.length];
      return `<div class="dexc ${d.hid?'hid':''} ${on?'':'lock'}">${d.hid?'<span class="badge">HIDDEN</span>':''}${creature({sp:d.k,eyes:fc[0],mouth:fc[1],cheek:'pink'})}<div class="n">${on?s.ko:'???'}</div>${d.hid?`<div class="h">${on?s.hint:'🔒 '+s.how}</div>`:''}</div>`; }).join('')}</div>`
    :`<div class="stack" style="gap:8px">${ACH.map(a=>{ const v=Math.min(a.v(),a.m), ok=!!S.ach[a.id]||a.v()>=a.m;
      return `<div class="ach ${ok?'done':''}"><span class="i">${a.ic}</span><div class="b"><div class="n">${a.n}</div><div class="r">보상 · ${rwText(a.rw)}</div><div class="bar"><i style="width:${v/a.m*100}%"></i></div></div><span class="st">${ok?'완료 ✅':`${v}/${a.m}`}</span></div>`; }).join('')}</div>`}
  </div>`);
}
