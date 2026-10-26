/* =========================================================
   오늘단어 · 마을 (별 5개마다 알, 3마리 합치기, 밥 주기, 꾸미기)
   ========================================================= */
const PER_EGG=5;
const INK='#2F2B4A';
const pickOne=a=>a[Math.floor(Math.random()*a.length)];
function rnd(i,s){ const x=Math.sin(i*127.1+s*311.7)*43758.5453; return x-Math.floor(x); }
const SP={
  apple:{ko:'사과',col:'#FF7B7B'}, shark:{ko:'상어',col:'#9CC7F2'}, poop:{ko:'응가',col:'#C08B5C'}, banana:{ko:'바나나',col:'#FFE066'},
  octopus:{ko:'문어',col:'#D3A8FF'}, icecream:{ko:'아이스크림',col:'#FFB3D6'}, toast:{ko:'식빵',col:'#F2C27A'},
  bunny:{ko:'토끼',col:'#FFD0E6'}, cat:{ko:'고양이',col:'#A8EBD0'}, chick:{ko:'병아리',col:'#FFE38A'}, dino:{ko:'공룡',col:'#C8F0A8'}, slime:{ko:'말랑이',col:'#B5DCFF'},
  bear:{ko:'곰',col:'#FFC9AA'}, frog:{ko:'개구리',col:'#C8F0A8'}, hamster:{ko:'햄스터',col:'#FFE38A'}
};
const SP_LIST=Object.keys(SP);
const STK=`stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
function face(cx,ey,gap,opt){
  gap=gap||10; const r=4.8;
  const eyes=`<g class="eyes" style="transform-origin:${cx}px ${ey}px"><circle cx="${cx-gap}" cy="${ey}" r="${r}" fill="${INK}"/><circle cx="${cx+gap}" cy="${ey}" r="${r}" fill="${INK}"/><circle cx="${cx-gap+1.6}" cy="${ey-1.8}" r="1.6" fill="#fff"/><circle cx="${cx+gap+1.6}" cy="${ey-1.8}" r="1.6" fill="#fff"/></g>`;
  const blush=`<ellipse cx="${cx-gap-9}" cy="${ey+9}" rx="5.5" ry="3.4" fill="#FF8FBF" opacity=".75"/><ellipse cx="${cx+gap+9}" cy="${ey+9}" rx="5.5" ry="3.4" fill="#FF8FBF" opacity=".75"/>`;
  let mouth=`<path d="M${cx-6} ${ey+8} q3 4 6 0 q3 4 6 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
  if(opt==='teeth') mouth=`<path d="M${cx-10} ${ey+8} Q${cx} ${ey+18} ${cx+10} ${ey+8} Z" fill="#fff" ${STK} stroke-width="2.4"/><path d="M${cx-7} ${ey+9} l2.5 3 2.5 -3 2.5 3 2.5 -3 2.5 3 2.5 -3" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
  if(opt==='beak') mouth=`<path d="M${cx-5} ${ey+6} L${cx+5} ${ey+6} L${cx} ${ey+13} Z" fill="#FFA24C" ${STK} stroke-width="2"/>`;
  if(opt==='open') mouth=`<ellipse cx="${cx}" cy="${ey+11}" rx="5" ry="4.5" fill="#FF7B9C" ${STK} stroke-width="2.4"/>`;
  return blush+eyes+mouth;
}
function mon(sp){
  const c=SP[sp].col; let g='';
  if(sp==='apple') g=`<path d="M50 30 C70 20 90 38 87 60 C84 84 64 94 50 88 C36 94 16 84 13 60 C10 38 30 20 50 30 Z" fill="${c}" ${STK}/>
    <path d="M50 30 Q50 18 56 12" fill="none" stroke="#8A5A3C" stroke-width="4" stroke-linecap="round"/><path d="M54 20 Q66 8 76 16 Q66 26 54 20 Z" fill="#7FD07A" ${STK} stroke-width="2.5"/>
    <ellipse cx="32" cy="44" rx="5" ry="9" fill="#fff" opacity=".55" transform="rotate(25 32 44)"/>`+face(50,60,11);
  else if(sp==='shark') g=`<path d="M46 40 L58 16 L66 42 Z" fill="${c}" ${STK}/><path d="M84 62 L99 46 L97 78 Z" fill="${c}" ${STK}/>
    <ellipse cx="48" cy="64" rx="38" ry="25" fill="${c}" ${STK}/><path d="M18 70 Q48 92 80 70 Q48 80 18 70 Z" fill="#fff"/>
    <path d="M70 56 q3 3 0 6 M75 55 q3 3 0 6" fill="none" stroke="${INK}" stroke-width="2"/>`+face(42,58,10,'teeth');
  else if(sp==='poop') g=`<ellipse cx="50" cy="82" rx="36" ry="13" fill="${c}" ${STK}/><ellipse cx="50" cy="66" rx="28" ry="12" fill="${c}" ${STK}/>
    <ellipse cx="50" cy="51" rx="19" ry="10" fill="${c}" ${STK}/><path d="M44 43 Q50 24 60 30 Q54 34 56 42 Z" fill="${c}" ${STK}/>
    <ellipse cx="40" cy="48" rx="4" ry="2.5" fill="#fff" opacity=".5"/>`+face(50,66,10,'open');
  else if(sp==='banana') g=`<path d="M20 30 Q14 74 52 88 Q80 94 92 70 Q70 78 48 66 Q30 54 30 30 Z" fill="${c}" ${STK}/>
    <path d="M20 30 L24 18 L32 20 L30 30 Z" fill="#8A5A3C" ${STK} stroke-width="2.5"/><path d="M30 46 Q36 66 56 76" fill="none" stroke="#E9C33F" stroke-width="3"/>`+face(58,64,9);
  else if(sp==='octopus') g=`${[18,34,50,66,82].map((x,i)=>`<path d="M${x} 62 Q${x+(i%2?6:-6)} 80 ${x+(i%2?-2:2)} 94" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M${x} 62 Q${x+(i%2?6:-6)} 80 ${x+(i%2?-2:2)} 94" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`).join('')}
    <path d="M14 64 C10 30 30 14 50 14 C70 14 90 30 86 64 Q50 74 14 64 Z" fill="${c}" ${STK}/><circle cx="30" cy="34" r="4" fill="#fff" opacity=".6"/><circle cx="68" cy="28" r="3" fill="#fff" opacity=".6"/>`+face(50,46,11,'open');
  else if(sp==='icecream') g=`<path d="M30 58 L70 58 L50 97 Z" fill="#F2C27A" ${STK}/><path d="M36 66 L60 66 M40 76 L58 76 M44 86 L54 86" stroke="#C99550" stroke-width="2"/>
    <path d="M18 58 C14 30 34 16 50 16 C66 16 86 30 82 58 Q76 66 70 58 Q64 70 58 58 Q50 68 44 58 Q36 70 30 58 Q24 66 18 58 Z" fill="${c}" ${STK}/>
    <circle cx="50" cy="12" r="7" fill="#FF5C7A" ${STK} stroke-width="2.5"/>
    <circle cx="32" cy="32" r="2" fill="#7FD07A"/><circle cx="66" cy="28" r="2" fill="#FFE066"/><circle cx="60" cy="44" r="2" fill="#9CC7F2"/>`+face(50,38,10);
  else if(sp==='toast') g=`<path d="M18 46 C10 20 90 20 82 46 L78 90 L22 90 Z" fill="#E0A55A" ${STK}/><path d="M26 48 C20 30 80 30 74 48 L71 84 L29 84 Z" fill="#FFE9B8"/>
    <path d="M58 70 l6 0 l0 6 l-6 0 Z" fill="#FFC94A" opacity=".8"/>`+face(50,58,10);
  else {
    let back='';
    if(sp==='bunny') back=`<ellipse cx="37" cy="26" rx="8" ry="20" fill="${c}" ${STK} transform="rotate(-8 37 26)"/><ellipse cx="63" cy="26" rx="8" ry="20" fill="${c}" ${STK} transform="rotate(8 63 26)"/><ellipse cx="37" cy="28" rx="3.5" ry="12" fill="#FF9CC8" transform="rotate(-8 37 28)"/><ellipse cx="63" cy="28" rx="3.5" ry="12" fill="#FF9CC8" transform="rotate(8 63 28)"/>`;
    if(sp==='cat') back=`<path d="M24 46 L28 22 L44 36 Z" fill="${c}" ${STK}/><path d="M76 46 L72 22 L56 36 Z" fill="${c}" ${STK}/>`;
    if(sp==='bear'||sp==='hamster'){ const b=sp==='bear', x1=b?27:30, x2=b?73:70, y=b?38:40, r=b?11:8; back=`<circle cx="${x1}" cy="${y}" r="${r}" fill="${c}" ${STK}/><circle cx="${x2}" cy="${y}" r="${r}" fill="${c}" ${STK}/><circle cx="${x1}" cy="${y}" r="4.5" fill="#FF9CC8"/><circle cx="${x2}" cy="${y}" r="4.5" fill="#FF9CC8"/>`; }
    if(sp==='frog') back=`<circle cx="35" cy="40" r="12" fill="${c}" ${STK}/><circle cx="65" cy="40" r="12" fill="${c}" ${STK}/>`;
    if(sp==='dino') back=`<path d="M38 36 l5 -12 l5 10 l5 -12 l5 10 l5 -11 l4 14" fill="#FFB0C8" ${STK}/>`;
    if(sp==='chick') back=`<path d="M50 34 q-6 -12 2 -16 q-1 7 6 4 q-3 6 -8 12" fill="${c}" ${STK}/>`;
    const body= sp==='slime' ? `<path d="M16 86 C12 60 30 30 50 30 C70 30 88 60 84 86 Q50 92 16 86 Z" fill="${c}" ${STK}/><ellipse cx="34" cy="48" rx="5" ry="8" fill="#fff" opacity=".7" transform="rotate(25 34 48)"/>`
      : `<ellipse cx="38" cy="91" rx="8" ry="4.5" fill="${c}" ${STK}/><ellipse cx="62" cy="91" rx="8" ry="4.5" fill="${c}" ${STK}/><ellipse cx="50" cy="64" rx="34" ry="28" fill="${c}" ${STK}/><ellipse cx="50" cy="72" rx="18" ry="12" fill="#fff" opacity=".45"/>`;
    g=back+body+face(50,60,10,sp==='chick'?'beak':null);
  }
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="bob">${g}</g></svg>`;
}
function egg(col){ return `<svg viewBox="0 0 80 96" aria-hidden="true"><path d="M40 6 C62 6 74 46 72 64 C70 84 56 92 40 92 C24 92 10 84 8 64 C6 46 18 6 40 6 Z" fill="#FFFDF6" stroke="${INK}" stroke-width="3"/>
  <circle cx="28" cy="40" r="6" fill="${col}"/><circle cx="52" cy="58" r="8" fill="${col}"/><circle cx="34" cy="72" r="4.5" fill="${col}"/><circle cx="54" cy="30" r="3.5" fill="${col}"/><ellipse cx="26" cy="24" rx="4" ry="7" fill="#fff" transform="rotate(25 26 24)"/></svg>`; }
const OBJ={
  house:{ko:'아늑한 집',svg:()=>`<svg viewBox="0 0 110 100" aria-hidden="true"><rect x="18" y="44" width="74" height="50" rx="8" fill="#FFF8EE" ${STK}/><path d="M8 50 L55 12 L102 50 Z" fill="#FF9F8E" ${STK}/><rect x="46" y="64" width="20" height="30" rx="9" fill="#8FD3FF" ${STK}/><rect x="25" y="56" width="15" height="14" rx="4" fill="#CDEBFF" ${STK} stroke-width="2.5"/><rect x="72" y="56" width="13" height="14" rx="4" fill="#CDEBFF" ${STK} stroke-width="2.5"/></svg>`},
  tree:{ko:'사과나무',svg:()=>`<svg viewBox="0 0 80 100" aria-hidden="true"><rect x="34" y="58" width="12" height="38" rx="4" fill="#E2B48A" ${STK}/><circle cx="40" cy="40" r="30" fill="#8BDB86" ${STK}/><circle cx="28" cy="34" r="5" fill="#FF6B6B" ${STK} stroke-width="2"/><circle cx="50" cy="48" r="5" fill="#FF6B6B" ${STK} stroke-width="2"/><circle cx="46" cy="24" r="5" fill="#FF6B6B" ${STK} stroke-width="2"/></svg>`},
  cafe:{ko:'작은 카페',svg:()=>`<svg viewBox="0 0 110 100" aria-hidden="true"><rect x="16" y="40" width="78" height="54" rx="6" fill="#FFF3E2" ${STK}/><path d="M10 40 h90 l-8 -16 h-74 z" fill="#FFFFFF" ${STK}/>${[0,1,2,3,4].map(i=>`<path d="M${18+i*16} 24 h8 l-1 16 h-9 z" fill="#FF8F7E"/>`).join('')}<rect x="26" y="54" width="26" height="22" rx="4" fill="#CDEBFF" ${STK} stroke-width="2.5"/><rect x="62" y="56" width="20" height="38" rx="8" fill="#B98A5E" ${STK}/><path d="M33 64 h10 v6 a5 5 0 0 1 -10 0 z" fill="#fff" stroke="${INK}" stroke-width="2"/></svg>`},
  rainbow:{ko:'무지개',svg:()=>`<svg viewBox="0 0 120 80" aria-hidden="true">${['#FF7B7B','#FFB86B','#FFE066','#8AE5C6','#8FD3FF','#CFB8FF'].map((c,i)=>`<path d="M${10+i*7} 72 A${50-i*7} ${50-i*7} 0 0 1 ${110-i*7} 72" fill="none" stroke="${c}" stroke-width="7"/>`).join('')}<ellipse cx="14" cy="72" rx="14" ry="8" fill="#fff" ${STK} stroke-width="2.5"/><ellipse cx="106" cy="72" rx="14" ry="8" fill="#fff" ${STK} stroke-width="2.5"/></svg>`},
  castle:{ko:'반짝 성',svg:()=>`<svg viewBox="0 0 120 110" aria-hidden="true"><rect x="22" y="44" width="76" height="62" rx="4" fill="#FFF0F7" ${STK}/><rect x="10" y="30" width="24" height="76" rx="4" fill="#FFD0E6" ${STK}/><rect x="86" y="30" width="24" height="76" rx="4" fill="#FFD0E6" ${STK}/><path d="M6 32 L22 10 L38 32 Z" fill="#CFB8FF" ${STK}/><path d="M82 32 L98 10 L114 32 Z" fill="#CFB8FF" ${STK}/><path d="M50 44 L60 24 L70 44 Z" fill="#8FD3FF" ${STK}/><rect x="50" y="76" width="20" height="30" rx="10" fill="#FFE066" ${STK}/><path d="M22 10 v-8 l8 3 -8 3" fill="#FF7B7B" stroke="${INK}" stroke-width="2"/></svg>`}
};
const FOODS=[['🍙','주먹밥'],['🍓','딸기'],['🍪','쿠키'],['🍩','도넛'],['🍮','푸딩'],['🍕','피자'],['🍦','아이스크림'],['🧁','컵케이크'],['🍉','수박'],['🍤','새우튀김']];
const ACCS=[['🎀','리본'],['🎩','모자'],['👑','왕관'],['🧢','캡모자'],['🌼','꽃핀'],['🍒','체리핀'],['⭐','별핀'],['🎓','학사모'],['🌸','벚꽃핀'],['🪖','헬멧']];
const DECOS=['🌷','🌻','🍄','🎈','🪴','🌲','🧸','🎠','⛲','🌈','🏮','🪁','🐞','🦋','🍀','🎪','⛱️','🛝'];
const FUNNY=['졸린','배고픈','방귀 뀌는','춤추는','부끄럼쟁이','엉뚱한','반짝반짝','꼬르륵','데굴데굴','뒤뚱뒤뚱','멍때리는','간지럼 타는','콧노래 부르는','심술쟁이','말랑말랑','깜짝 놀란','잠꾸러기','용감한','수줍은','폴짝폴짝','딸꾹질하는','야근하는','월요병 걸린','커피 마신','출근하기 싫은','칼퇴하는','윙크하는','노래하는','영어 잘하는','일본어 하는'];
const funnyName=f=>`${pickOne(FUNNY)} ${SP[f.sp]?SP[f.sp].ko:'친구'}`;
const spName=f=>f.kind==='obj'?OBJ[f.obj].ko:SP[f.sp]?SP[f.sp].ko:'친구';
const batchimEnd=w=>{ const c=w.charCodeAt(w.length-1)-0xAC00; return c>=0&&c%28!==0; };

/* ---------- 별 · 알 · 아이템 ---------- */
let newEggs=0, selItem=null, vTimers=[];
function vInit(){
  if(S.stars==null) S.stars=0;
  if(!S.friends) S.friends=[];
  if(S.spawned==null) S.spawned=S.friends.length;
  if(!S.food){ S.food={'🍙':3}; }
  if(!S.accs){ S.accs={'🎀':1}; }
  if(!S.decos) S.decos=[];
}
function addStars(n){
  vInit(); if(n<=0) return 0;
  const before=Math.floor(S.stars/PER_EGG); S.stars+=n; const after=Math.floor(S.stars/PER_EGG);
  if(after>before){ newEggs+=after-before; ensureFriends(); }
  return after-before;
}
function ensureFriends(){ const n=Math.floor(S.stars/PER_EGG); while(S.spawned<n){ S.friends.push({name:'',sp:pickOne(SP_LIST),hatched:false,lv:1}); S.spawned++; } }
function addItem(kind,e,n){ const box=kind==='food'?S.food:S.accs; box[e]=(box[e]||0)+(n||1); }
function useItem(kind,e){ const box=kind==='food'?S.food:S.accs; if(!box[e]) return false; box[e]--; if(box[e]<=0) delete box[e]; return true; }
const isHungry=f=>f.hatched&&f.kind!=='obj'&&f.fed!==today();
const hungryCount=()=>{ vInit(); return S.friends.filter(isHungry).length; };
const eggCount=()=>{ vInit(); ensureFriends(); return S.friends.filter(f=>!f.hatched).length; };

/* ---------- 하늘 · 우체통 ---------- */
function isNight(){ const h=new Date().getHours(); return h>=19||h<6; }
function sky(){
  const m=new Date().getMonth()+1, night=isNight();
  const fall = m===12||m<=2 ? '❄️' : m<=5 ? '🌸' : m<=8 ? '' : '🍁';
  let out = night ? `<div class="moon"></div>${Array.from({length:14},(_,i)=>`<i class="twk" style="left:${(i*37)%96+2}%;top:${(i*23)%80+8}px;animation-delay:-${(i*.4)%2}s"></i>`).join('')}`
                  : `<div class="sun"></div><div class="cloud" style="left:8%;width:70px"></div><div class="cloud" style="left:48%;width:90px;top:42px"></div>`;
  if(fall) out += Array.from({length:12},(_,i)=>`<span class="fall" style="left:${(i*41)%96}%;animation-duration:${6+(i%5)}s;animation-delay:-${i*1.1}s">${fall}</span>`).join('');
  if(m>=6&&m<=8&&!night) out += `<span class="flutter">🦋</span>`;
  return out;
}
function mailboxHTML(){
  const ready=S.mail!==today();
  return `<div class="plot"><span class="tag ${ready?'lv2':''}">${ready?'선물 왔어요!':'우체통'}</span><button class="mailbox ${ready?'ready':''}" data-act="mail" aria-label="우체통">📮</button><div class="shadow"></div></div>`;
}

/* ---------- 마을 화면 ---------- */
function villageHTML(){
  vInit(); ensureFriends();
  const fr=S.friends, hatched=fr.filter(f=>f.hatched).length, eggs=fr.length-hatched;
  let named=false; fr.forEach(f=>{ if(f.hatched&&f.kind!=='obj'&&!f.name){ f.name=funnyName(f); named=true; } }); if(named) save();
  const can=mergeLevel()>0, left=PER_EGG-(S.stars%PER_EGG);
  const plots=fr.map((f,i)=>{
    if(!f.hatched) return `<div class="plot"><span class="tag new">새 알!</span><button class="egg" data-egg="${i}" aria-label="알 깨우기">${egg((SP[f.sp]||SP.slime).col)}</button><div class="shadow"></div></div>`;
    if(f.kind==='obj') return `<div class="plot"><span class="tag lv2">${OBJ[f.obj].ko}</span><div class="mon obj" style="--w:${f.obj==='castle'?150:118}px" data-mon="${i}" role="button" tabindex="0">${OBJ[f.obj].svg()}</div><div class="shadow"></div></div>`;
    const lv=f.lv||1, w=lv===3?160:lv===2?122:84, hungry=isHungry(f);
    return `<div class="plot"><span class="tag ${lv>1?'lv'+lv:''}">${lv===3?'👑 ':lv===2?'🎀 ':''}${esc(f.name||spName(f))}</span>
      <div class="mon" style="--w:${w}px" data-mon="${i}" role="button" tabindex="0">${mon(SP[f.sp]?f.sp:'slime')}${f.acc?`<span class="acc">${f.acc}</span>`:''}${hungry?`<span class="think">🍙</span>`:''}</div><div class="shadow"></div></div>`;
  }).join('');
  const decos=S.decos.map((d,j)=>`<div class="plot deco"><span class="decoi" style="animation-delay:-${(j*.7)%3}s">${d}</span><div class="shadow"></div></div>`).join('');
  const foods=Object.entries(S.food), accs=Object.entries(S.accs);
  const itemBtn=(kind,[e,n])=>`<button class="item ${selItem&&selItem.kind===kind&&selItem.e===e?'on':''}" data-item="${kind}" data-e="${e}">${e}<b>${n}</b></button>`;
  const hint = selItem ? (selItem.kind==='food'?`${selItem.e} 누구에게 줄까요? 친구를 눌러요`:`${selItem.e} 누구에게 씌워 줄까요? 친구를 눌러요`) : hungryCount() ? `🍽️ 배고픈 친구가 ${hungryCount()}명 있어요. 밥을 골라 친구를 눌러 주세요` : '친구를 누르면 내가 배운 단어를 말해 줘요';
  const vname=S.name?`${esc(S.name)}네 마을`:'오늘 마을';
  return `<section class="panel village" id="village">
    <div class="vhead">
      <div><div class="h2">🏡 ${vname}</div><div class="muted" style="font-size:15px;margin-top:4px;font-family:var(--fb);font-weight:600">주민 ${hatched}명${eggs?` · 알 ${eggs}개`:''} · 장식 ${S.decos.length}개</div></div>
      ${can?`<button class="mergebtn" data-merge="1">✨ 친구 합치기</button>`:''}
      <div class="next">⭐ ${left}개 더 모으면 새 알이 생겨요<div class="bar"><i style="width:${(S.stars%PER_EGG)/PER_EGG*100}%"></i></div></div>
    </div>
    <div class="scene ${isNight()?'night':''}">${sky()}
      <div class="plots" id="plots">${mailboxHTML()}${plots}${decos}${fr.length?'':`<div class="vempty">문제를 한 번에 맞히면 ⭐ 1개! 별 ${PER_EGG}개를 모으면 첫 번째 알이 생겨요 🥚</div>`}</div></div>
    <div class="tray" id="tray">
      <div class="hint">${hint}</div>
      <div class="items"><span class="lab">밥</span>${foods.length?foods.map(x=>itemBtn('food',x)).join(''):'<span class="none">없어요</span>'}<span class="sep"></span><span class="lab">꾸미기</span>${accs.length?accs.map(x=>itemBtn('acc',x)).join(''):'<span class="none">없어요</span>'}</div>
    </div>
    <div class="vnote">한 번에 맞힌 문제마다 ⭐1, 오늘의 단어를 끝내면 ⭐5와 밥 2개를 받아요. 별 ${PER_EGG}개마다 알이 생기고, 같은 크기 친구 3명을 합치면 더 큰 친구나 집·카페·성이 돼요. 우체통에는 하루 한 번 밥·꾸미기·장식 선물이 와요.</div>
  </section>`;
}
function rVillage(){ vInit(); page(villageHTML()); wireVillage(true); }
function refreshVillage(){ const v=$('#village'); if(!v) return; v.outerHTML=villageHTML(); wireVillage(false); }
function wireVillage(autoAsk){
  vTimers.forEach(clearTimeout); vTimers=[];
  const el=$('#plots'); if(!el) return;
  el.querySelectorAll('.mon .bob').forEach((b,k)=>b.style.animationDelay='-'+(rnd(k,4)*1.8).toFixed(2)+'s');
  el.querySelectorAll('.eyes').forEach((b,k)=>b.style.animationDelay='-'+(rnd(k,6)*4).toFixed(2)+'s');
  el.querySelectorAll('.mon:not(.obj)').forEach((m,k)=>{ m.style.setProperty('--wx',((k%2?1:-1)*(10+(k*7)%14))+'px'); m.style.animationDelay='-'+((k*1.3)%6).toFixed(1)+'s'; m.classList.add('walk'); });
  el.onclick=e=>{
    if(e.target.closest('[data-act="mail"]')){ openMail(); return; }
    const eg=e.target.closest('[data-egg]'); if(eg){ hatch(+eg.dataset.egg); return; }
    const m=e.target.closest('[data-mon]'); if(m) tapFriend(+m.dataset.mon);
  };
  const tr=$('#tray'); if(tr) tr.onclick=e=>{ const b=e.target.closest('[data-item]'); if(!b) return;
    const k=b.dataset.item, em=b.dataset.e; selItem = selItem&&selItem.kind===k&&selItem.e===em ? null : {kind:k,e:em}; refreshVillage(); };
  const mb=document.querySelector('[data-merge]'); if(mb) mb.onclick=()=>askMerge();
  if(autoAsk && mergeLevel() && S.mergeAsked!==S.friends.length && !document.querySelector('.modal')){ S.mergeAsked=S.friends.length; save(); vTimers.push(setTimeout(askMerge,800)); }
}
function bubble(i,html,ms){
  const m=document.querySelector(`[data-mon="${i}"]`); if(!m) return;
  m.querySelectorAll('.say').forEach(s=>s.remove());
  const s=document.createElement('div'); s.className='say'; s.innerHTML=html; m.appendChild(s); setTimeout(()=>s.remove(),ms||2200);
}
function jump(i,heart){
  const m=document.querySelector(`[data-mon="${i}"]`); if(!m) return;
  m.classList.remove('jump'); void m.offsetWidth; m.classList.add('jump'); tone([[392,.08,'sine',.18],[587,.12,'sine',.18]]);
  const h=document.createElement('span'); h.className='heart'; h.textContent=heart||pickOne(['💖','💕','💗','✨']); m.appendChild(h); setTimeout(()=>h.remove(),1100);
}
function tapFriend(i){
  const f=S.friends[i];
  if(selItem && f.kind!=='obj'){
    const it=selItem;
    if(it.kind==='food'){
      if(f.fed===today()){ jump(i,'😵'); bubble(i,'배불러요~ 내일 또 주세요!'); return; }
      if(!useItem('food',it.e)) return;
      f.fed=today(); f.joy=(f.joy||0)+1; if(!S.food[it.e]) selItem=null; save(); refreshVillage();
      setTimeout(()=>{ jump(i,it.e); bubble(i,pickOne(['냠냠! 맛있다 😋','최고의 '+FOODS.find(x=>x[0]===it.e)[1]+'!','힘이 난다! 💪','오늘 공부도 화이팅!'])); },40);
      sfx.ok(); return;
    }
    if(it.kind==='acc'){
      if(!useItem('acc',it.e)) return;
      if(f.acc) addItem('acc',f.acc);
      f.acc=it.e; if(!S.accs[it.e]) selItem=null; save(); refreshVillage();
      setTimeout(()=>{ jump(i,'✨'); bubble(i,'어때요? 잘 어울려요?'); },40); sfx.ok(); return;
    }
  }
  jump(i);
  if(f.kind==='obj'){ bubble(i,`${spName(f)}${batchimEnd(spName(f))?'이에요':'예요'}!`); return; }
  if(isHungry(f) && Math.random()<.5){ bubble(i,'꼬르륵… 배고파요 🍽️'); return; }
  if(f.sp==='poop' && Math.random()<.3){ bubble(i,'뿌직! 😆'); return; }
  const l=L(), known=WL[l].filter(o=>{const p=S.p[l][o.id]; return p&&p.c>0;});
  const o=pickOne(known.length?known:WL[l].slice(0,24));
  bubble(i,`<b class="${l==='ja'?'ja':'en'}" ${l==='ja'?'lang="ja"':''}>${esc(o.w)}</b> ${esc(o.k)}`,2600); setTimeout(()=>speak(o.w,l),150);
}
function hatch(i){
  const b=document.querySelector(`[data-egg="${i}"]`); if(!b) return;
  b.classList.add('cracking'); tone([[660,.05,'sine',.12]]);
  setTimeout(()=>{
    const f=S.friends[i]; f.hatched=true; f.born=today(); f.name=funnyName(f); save();
    refreshVillage(); sfx.win(); burst(26);
    const m=document.querySelector(`[data-mon="${i}"]`); if(m) m.classList.add('hatched');
    toast(`🐣 ${f.name}${batchimEnd(f.name)?'이':'가'} 태어났어요!`);
    setTimeout(()=>{ jump(i); bubble(i,`안녕, 나는 ${esc(f.name)}!`); },500);
  },520);
}
function openMail(){
  if(S.mail===today()){ tone([[392,.08,'sine',.18]]); toast('선물은 내일 또 와요'); return; }
  S.mail=today(); const r=Math.random(); let html;
  if(r<.45){ const f=pickOne(FOODS), n=2; addItem('food',f[0],n); html=`<div style="font-size:120px;line-height:1.15">${f[0]}</div><div class="md">${f[1]} ${n}개! 배고픈 친구에게 주세요</div>`; }
  else if(r<.75){ const a=pickOne(ACCS); addItem('acc',a[0]); html=`<div style="font-size:120px;line-height:1.15">${a[0]}</div><div class="md">${a[1]}! 친구에게 씌워 줄 수 있어요</div>`; }
  else { const d=pickOne(DECOS); S.decos=S.decos.concat(d).slice(-30); html=`<div style="font-size:120px;line-height:1.15">${d}</div><div class="md">마을에 장식을 놓았어요</div>`; }
  save(); sfx.win(); burst(24);
  modal(`<div class="mt">오늘의 선물이 왔어요!</div>${html}<div class="acts"><button class="btn" onclick="closeModal();refreshVillage()">좋아요</button></div>`);
}
function mergeLevel(){ const fr=S.friends||[]; const n=lv=>fr.filter(f=>f.hatched&&f.kind!=='obj'&&(f.lv||1)===lv).length; return n(2)>=3?2:n(1)>=3?1:0; }
function askMerge(){
  const lv=mergeLevel(); if(!lv) return;
  const fr=S.friends, three=fr.map((f,i)=>({f,i})).filter(x=>x.f.hatched&&x.f.kind!=='obj'&&(x.f.lv||1)===lv).slice(0,3);
  modal(`<div class="mt">친구 셋을 합쳐서<br>더 크게 만들까요?</div>
    <div class="three" id="three">${three.map((x,k)=>`<span class="src" style="--dx:${(1-k)*90+140}px">${mon(SP[x.f.sp]?x.f.sp:'slime')}</span>${k<2?'<span class="plus">+</span>':''}`).join('')}<span class="arrow">➜</span><span class="mystery">❓</span></div>
    <div class="acts"><button class="btn w sm" id="mno">그대로 둘래요</button><button class="btn sm" id="myes">합치기 ✨</button></div>`);
  $('#mno').onclick=closeModal;
  $('#myes').onclick=()=>{
    $('#three').classList.add('merging'); tone([[392,.08,'sine',.18],[587,.12,'sine',.18]]);
    setTimeout(()=>{
      const r=Math.random(), keep=three[0].f; let made;
      if(lv===1) made = r<.6 ? {name:'',sp:pickOne(three.map(x=>x.f.sp)),lv:2,hatched:true} : {name:'',sp:keep.sp,kind:'obj',obj:pickOne(['house','tree','cafe','rainbow']),lv:2,hatched:true};
      else made = r<.5 ? {name:'',sp:pickOne(three.map(x=>x.f.sp)),lv:3,hatched:true} : {name:'',sp:keep.sp,kind:'obj',obj:'castle',lv:3,hatched:true};
      // 합쳐진 친구들이 쓰던 꾸미기는 가방으로
      three.forEach(x=>{ if(x.f.acc) addItem('acc',x.f.acc); });
      const idx=new Set(three.map(x=>x.i)); S.friends=fr.filter((_,i)=>!idx.has(i)); S.friends.push(made); S.mergeAsked=S.friends.length;
      if(made.kind!=='obj') made.name=(made.lv===3?'왕 ':'큰 ')+funnyName(made);
      save();
      const nm = made.kind==='obj' ? OBJ[made.obj].ko : made.name;
      $('.modal .box').innerHTML=`<div class="mt">짜잔! ${esc(nm)}${made.kind==='obj'?(batchimEnd(nm)?'이':'가')+' 생겼어요!':' 탄생!'}</div>
        <div class="result">${made.kind==='obj'?OBJ[made.obj].svg():mon(SP[made.sp]?made.sp:'slime')}</div>
        <div class="acts"><button class="btn" id="mok">좋아요 🎉</button></div>`;
      sfx.win(); burst(50);
      $('#mok').onclick=()=>{ closeModal(); refreshVillage(); };
    },750);
  };
}
