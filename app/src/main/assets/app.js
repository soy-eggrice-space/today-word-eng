/* =========================================================
   공!부!해! — 영어 단어 + 다마고치 마을
   ========================================================= */
const $=s=>document.querySelector(s);
const app=$('#app');
const HAS_ANDROID=typeof window.Android!=='undefined';
const KEY='gongbuhae.v1';
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const pad=n=>String(n).padStart(2,'0');
const dstr=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>dstr(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return dstr(d);};
const IV=[0,1,2,4,7,15,30];   // 복습 간격(일)
const MASTER=5;               // 이 단계 이상이면 '완벽히 익힘'
const norm=w=>String(w).toLowerCase().replace(/[’']/g,"'").replace(/[.?!,]+$/,'').replace(/\s+/g,' ').trim();

/* ---------- 단어 ---------- */
const WL=[], BY={}, TBY={};
THEMES.forEach(t=>{ TBY[t.id]=t; t.words.forEach(([w,k,ex,exk,lv])=>{ const o={id:w,w,k,ex,exk,lv,th:t.id,i:WL.length}; WL.push(o); BY[w]=o; }); });

/* ---------- 저장 ---------- */
function blank(){ return {v:1,started:false,name:'',lv:3,perDay:15,
  av:{sp:'nyang',col:'#F2C9D3',eyes:'sparkle',mouth:'cat',cheek:'pink',acc:'bow'},
  rate:1,auto:true,showKo:true,
  p:{},wrong:{},day:null,log:{},streak:{last:'',n:0,best:0},
  stars:0,friends:[],spawned:0,house:[],sleepers:{},food:{'🍙':3},accs:{bow:1},decos:[],mail:'',
  found:[],hatchedN:0,merges:0,perfect:0,night:false,ach:{},mergeAsked:-1,nextId:1}; }
function load(){
  let raw=null;
  try{ if(HAS_ANDROID) raw=Android.loadData(); }catch(e){}
  if(!raw){ try{ raw=localStorage.getItem(KEY); }catch(e){} }
  const b=blank(); if(!raw) return b;
  try{ const d=JSON.parse(raw); return Object.assign(b,d,{streak:Object.assign(b.streak,d.streak||{}),av:Object.assign(b.av,d.av||{})}); }catch(e){ return b; }
}
let S=load();
function save(){ const j=JSON.stringify(S); try{localStorage.setItem(KEY,j);}catch(e){} try{ if(HAS_ANDROID) Android.saveData(j);}catch(e){} }

/* ---------- 소리 ---------- */
let mutedQuiz=false;   // '소리 못 들어요'를 누른 퀴즈 동안 켜짐
function speak(text){
  if(!text||mutedQuiz) return;
  const t=String(text).replace(/^[AB]:\s*/,'').replace(/\s[AB]:\s/g,' … ');
  const rate=.92*S.rate;
  try{ if(HAS_ANDROID && Android.speakLang){ Android.speakLang(t,'en-US',rate); return; } }catch(e){}
  try{ if(window.speechSynthesis){ speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(t); u.lang='en-US'; u.rate=rate; speechSynthesis.speak(u);} }catch(e){}
}
const sayW=i=>speak(WL[i].w), sayEx=i=>speak(WL[i].ex);
let AC=null;
function tone(seq){ try{ AC=AC||new (window.AudioContext||window.webkitAudioContext)(); let t=AC.currentTime;
  seq.forEach(([f,d,type,vol])=>{const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.value=f;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||.2,t+.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+d+.02);t+=d*.8;}); }catch(e){} }
const sfx={ ok:()=>tone([[784,.1,'triangle'],[1175,.2,'triangle']]), no:()=>tone([[240,.16,'sine',.15],[200,.22,'sine',.15]]),
  pop:()=>tone([[392,.08,'sine',.18],[587,.12,'sine',.18]]), tap:()=>tone([[660,.05,'sine',.12]]),
  win:()=>tone([[523,.1,'triangle'],[659,.1,'triangle'],[784,.1,'triangle'],[1046,.3,'triangle']]) };
function buzz(ms){ try{ if(HAS_ANDROID && Android.vibrate) Android.vibrate(ms); }catch(e){} }
let toastT=null;
function toast(m){ const t=$('#toast'); t.textContent=m; t.classList.add('show'); clearTimeout(toastT); toastT=setTimeout(()=>t.classList.remove('show'),2300); }
function burst(n){ const c=document.createElement('div'); c.id='burst'; document.body.appendChild(c); const ic=['✨','⭐','💛','🎉','💫','🌟'];
  for(let i=0;i<(n||28);i++){ const s=document.createElement('span'); s.textContent=ic[i%ic.length]; const x=Math.random()*100,sz=16+Math.random()*20,d=1.3+Math.random()*.9;
    s.style.cssText=`left:${x}%;font-size:${sz}px;transition:transform ${d}s cubic-bezier(.2,.6,.4,1),opacity ${d}s`; c.appendChild(s);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{ s.style.transform=`translateY(${innerHeight+80}px) rotate(${Math.random()*360}deg)`; s.style.opacity='.2'; })); }
  setTimeout(()=>c.remove(),2600); }
function modal(h){ closeModal(); const m=document.createElement('div'); m.className='modal'; m.innerHTML=`<div class="mbox">${h}</div>`; m.addEventListener('click',e=>{ if(e.target===m) closeModal(); }); document.body.appendChild(m); }
function closeModal(){ document.querySelectorAll('.modal').forEach(m=>m.remove()); }

/* =========================================================
   학습 (간격 반복)
   ========================================================= */
function order(){
  // 고른 단계부터 위로, 그다음 아래 단계 · 테마를 돌아가며 섞기
  const lvs=[S.lv,...[1,2,3,4,5].filter(x=>x>S.lv),...[5,4,3,2,1].filter(x=>x<S.lv)];
  const out=[], ths=THEMES.map(t=>t.id);
  lvs.forEach(lv=>{ const b=ths.map(id=>WL.filter(o=>o.th===id&&o.lv===lv)); let k=0,any=true; while(any){ any=false; b.forEach(x=>{ if(x[k]){ out.push(x[k]); any=true; } }); k++; } });
  return out;
}
let ORDER=null;
const unseen=()=>{ ORDER=ORDER||order(); return ORDER.filter(o=>!S.p[o.id]); };
function dueList(){ const t=today(); return WL.filter(o=>{const p=S.p[o.id]; return p&&p.b>0&&p.b<7&&p.due<=t;}).sort((a,b)=>S.p[a.id].due<S.p[b.id].due?-1:1); }
function ensureDay(){
  const t=today(); let d=S.day;
  if(!d||d.d!==t){ d=S.day={d:t,rev:dueList().slice(0,40).map(o=>o.id),fresh:unseen().slice(0,S.perDay).map(o=>o.id),done:{},fin:false}; save(); }
  return d;
}
const dayItems=d=>[...d.fresh,...d.rev];
const dayLeft=d=>dayItems(d).filter(id=>!(id in d.done));
const stage=id=>{ const p=S.p[id]; return p?p.b:-1; };
function grade(id,ok){
  const t=today(), p=S.p[id]||(S.p[id]={b:0,due:t,c:0,x:0});
  if(ok){ if(p.b===0||p.due<=t){ p.b=Math.min(p.b+1,6); p.due=addDays(t,IV[p.b]); } p.c++;
    if(S.wrong[id]!=null){ S.wrong[id]--; if(S.wrong[id]<=0) delete S.wrong[id]; } }
  else { p.b=1; p.due=addDays(t,1); p.x++; S.wrong[id]=2; }
  p.t=t;
  const g=S.log[t]||(S.log[t]={n:0,c:0}); g.n++; if(ok) g.c++;
  const d=S.day; if(d&&d.d===t&&dayItems(d).includes(id)&&!(id in d.done)) d.done[id]=ok?1:0;
  const h=new Date().getHours(); if(h>=23||h<4) S.night=true;
}
function markKnown(id){ const t=today(); S.p[id]={b:MASTER,due:addDays(t,IV[MASTER]),c:1,x:0,t,known:1}; save(); }
const streakNow=()=>{ const s=S.streak,t=today(); return (s.last===t||s.last===addDays(t,-1))?s.n:0; };
function finishDay(){
  const d=S.day; if(!d||d.fin) return false;
  d.fin=true; const t=today(), s=S.streak;
  if(s.last!==t){ s.n=s.last===addDays(t,-1)?s.n+1:1; s.last=t; s.best=Math.max(s.best,s.n); }
  d.bonusEggs=addStars(5); d.bonusFood=pick(FOODS)[0]; addItem('food',d.bonusFood,2);
  save(); return true;
}
function counts(){ let seen=0,master=0; for(const id in S.p){ seen++; if(S.p[id].b>=MASTER) master++; } return {seen,master,learning:seen-master,total:WL.length}; }
const studyDays=()=>Object.keys(S.log).filter(k=>S.log[k].n>0).length;

/* =========================================================
   화면
   ========================================================= */
let view='home', ctx={};
function go(v,c){ vClear(); closeModal(); view=v; ctx=c||{}; render(); window.scrollTo(0,0); }
function render(){
  if(!S.started){ rSetup(); return; }
  ({home:rHome,village:rVillage,words:rWords,theme:rTheme,cards:rCards,quiz:rQuiz,result:rResult,wrong:rWrong,collect:rCollect,records:rRecords,settings:rSettings,avatar:rAvatar}[view]||rHome)();
}
window.appBack=function(){
  if(document.querySelector('.modal')){ closeModal(); return true; }
  if(view==='quiz'){ quitQuiz(); return true; }
  if(view==='theme'){ go('words'); return true; }
  if(view==='cards'||view==='result'){ ctx.theme?go('theme',{id:ctx.theme}):go('home'); return true; }
  if(view==='avatar'){ go('settings'); return true; }
  if(view!=='home'){ go('home'); return true; }
  return false;
};
const TCOL=['#E9A3B4','#EBC066','#86C2A9','#EBC066','#97B3DE','#EBC066'];
function title(size){ return `<span class="ttl" style="font-size:${size}px">${['공','!','부','!','해','!'].map((c,i)=>`<span style="color:${TCOL[i]}">${c}</span>`).join('')}</span>`; }
function topbar(){ return `<div class="top">${title(26)}<div class="sp"></div><div class="pill">🔥<b>${streakNow()}</b></div><button class="pill" onclick="go('village')">⭐<b id="starN">${S.stars}</b></button><button class="av" onclick="go('settings')" aria-label="설정">${creature(S.av)}</button></div>`; }
function tabs(){
  const eggs=eggCount(), w=Object.keys(S.wrong).length;
  const T=[['home','☀️','오늘'],['village','🏡','마을'],['words','📚','단어'],['collect','🏆','컬렉션'],['records','📊','기록']];
  return `<nav class="tabs">${T.map(([v,i,t])=>`<button class="${view===v?'on':''}" onclick="go('${v}')"><span class="ic">${i}</span>${t}${v==='village'&&(eggs||S.mail!==today())?`<span class="dot">${eggs||'!'}</span>`:''}</button>`).join('')}</nav>`;
}
function page(inner){ app.innerHTML=topbar()+inner+tabs(); }
const wordHTML=o=>`<span class="en">${esc(o.w)}</span>`;
const isLong=o=>o.w.length>14;
const stDot=id=>{ const b=stage(id); return b<0?'':b>=MASTER?'l3':b>=3?'l2':'l1'; };
const LEVELS=[[1,'🐣','중학생','교과서 필수 단어 · 중학교 수준'],[2,'🐥','고등학생','수능 기본 단어 · 고등학교 수준'],[3,'🐤','대학생','토익·일상 회화 · 대학 교양 수준'],[4,'🦉','직장인','비즈니스·고급 회화 · 해외 업무 가능'],[5,'🦄','원어민','관용어·뉘앙스·구어 표현 · 원어민 수준']];
const AMOUNTS=[[5,'가볍게'],[10,'적당히'],[15,'추천'],[20,'열심히'],[30,'빡세게']];

/* ---------- 처음 설정 ---------- */
let step=0;
const PRESETS=['mallang','nyang','torong','gom','ssak','bbul','biyong','kong','bogeul','kkori','nalgae','peng'];
const ACC_LIST=['','bow','flower','beanie','glasses','phones','party','leaf','crown'];
function avatarEditor(){
  const a=S.av;
  const mini=(key,vals)=>`<div class="mini">${vals.map(v=>`<button class="opt ${a[key]===v?'on':''}" onclick="S.av.${key}='${v}';save();render()" aria-label="${v||'없음'}">${creature({...a,[key]:v})}</button>`).join('')}</div>`;
  const ownAcc=ACC_LIST.filter(x=>!x||['bow','flower','beanie','glasses','leaf'].includes(x)||S.ach.accUnlock&&S.ach.accUnlock.includes(x));
  return `<div class="presets">${PRESETS.map(k=>`<button class="opt ${a.sp===k?'on':''}" onclick="S.av.sp='${k}';S.av.col=SPECIES['${k}'].col;save();render()">${creature({...a,sp:k,col:SPECIES[k].col})}<small>${SPECIES[k].ko}</small></button>`).join('')}</div>
  <div class="card cust">
    <div class="crow"><div class="lab">몸 색깔</div><div class="swatches">${COLORS.map(c=>`<button class="sw ${a.col===c?'on':''}" style="background:${c}" onclick="S.av.col='${c}';save();render()" aria-label="색"></button>`).join('')}</div></div>
    <div class="crow"><div class="lab">눈</div>${mini('eyes',['oval','sparkle','dot','happy','wink','heart','star','tiny','swirl'])}</div>
    <div class="crow"><div class="lab">입</div>${mini('mouth',['cat','smile','open','tongue','o','fang','wave'])}</div>
    <div class="crow"><div class="lab">볼터치</div><div class="swatches">${Object.entries(CHEEKS).map(([k,c])=>`<button class="sw ${a.cheek===k?'on':''}" style="background:${c||'repeating-linear-gradient(45deg,#fff 0 4px,#eee 4px 8px)'}" onclick="S.av.cheek='${k}';save();render()" aria-label="볼터치"></button>`).join('')}</div></div>
    <div class="crow"><div class="lab">꾸미기</div>${mini('acc',ownAcc)}<div class="sub">헤드폰·고깔·왕관은 컬렉션 업적으로 열려요</div></div>
  </div>`;
}
function rSetup(){
  const st=`<div class="steps">${[0,1,2,3,4].map(i=>`<i class="${i<=step?'on':''}"></i>`).join('')}</div>`;
  const buddy=msg=>`<div class="hero"><div class="bubble">${msg}</div><div class="big">${creature(S.av)}</div></div>`;
  let h='';
  if(step===0) h=`<div class="hero"><div class="welcome">${['mallang','torong','nyang','haepa','bbul'].map((k,i)=>`<span style="--d:${i*.15}s">${creature({sp:k,col:SPECIES[k].col,eyes:FACES[i][0],mouth:FACES[i][1],cheek:'pink'})}</span>`).join('')}</div>
      <div class="bigtitle">${title(62)}</div>
      <div class="q" style="font-size:19px">알에서 뭐가 나올지 몰라요!</div>
      <div class="sub">영어 단어 공부하면 별을 받고, 별 5개마다 새 알이 와요<br>일상 · 회화 · 여행 · 비즈니스 영어 ${WL.length.toLocaleString()}개</div></div>
    <button class="btn" onclick="step=1;rSetup()">시작하기</button>`;
  if(step===1) h=buddy('안녕! 뭐라고 부르면 돼?')+`<input class="txt" id="nm" maxlength="10" placeholder="이름 또는 별명" value="${esc(S.name)}">
    <button class="btn" onclick="S.name=($('#nm').value.trim()||'친구');step=2;rSetup()">다음</button>`;
  if(step===2) h=`<div class="hero"><div class="q">지금 내 영어 실력은?</div><div class="sub">고른 단계부터 새 단어가 나와요. 설정에서 언제든 바꿀 수 있어요.</div></div>
    <div class="lv">${LEVELS.map(([v,e,n,d])=>`<button class="lvopt ${S.lv===v?'on':''}" onclick="S.lv=${v};rSetup()"><span class="e">${e}</span><span style="flex:1;min-width:0"><div class="n">${v}단계 · ${n} 수준</div><div class="d">${d}</div></span><span class="lvdots">${[1,2,3,4,5].map(i=>`<i class="${i<=v?'on':''}"></i>`).join('')}</span></button>`).join('')}</div>
    <button class="btn" onclick="step=3;rSetup()">다음</button>`;
  if(step===3) h=`<div class="hero"><div class="q">하루에 새 단어 몇 개?</div><div class="sub">복습할 단어는 따로 알아서 나와요. 나중에 바꿀 수 있어요.</div></div>
    <div class="amount">${AMOUNTS.map(([n,t])=>`<button class="${S.perDay===n?'on':''}" onclick="S.perDay=${n};rSetup()"><b>${n}</b><span>${t}</span></button>`).join('')}</div>
    <div class="sub" style="text-align:center">${S.perDay}개씩이면 하루 약 ${Math.max(3,Math.round(S.perDay*0.6))}~${Math.round(S.perDay*1.2)}분 걸려요</div>
    <button class="btn" onclick="step=4;rSetup()">다음</button>`;
  if(step===4){ h=buddy(`${esc(S.name)}의 친구를 골라 줘!`)+avatarEditor()+`<button class="btn s" onclick="startApp()">이 친구랑 시작하기</button>`; }
  app.innerHTML=`<div class="setup">${st}${h}</div>`;
}
function startApp(){ S.started=true; S.firstAt=today(); ORDER=null; save(); go('home'); toast('준비 완료! 첫 알이 기다리고 있어요'); }

/* ---------- 오늘 ---------- */
function rHome(){
  const d=ensureDay(), items=dayItems(d), left=dayLeft(d), done=items.length-left.length, c=counts(), lvl=LEVELS[S.lv-1];
  const pct=items.length?Math.round(done/items.length*100):100;
  const tom=WL.filter(o=>{const p=S.p[o.id]; return p&&p.b>0&&p.due===addDays(today(),1);}).length;
  let tw;
  if(!items.length) tw=`<div class="donebig"><div style="font-size:44px">🌿</div><div class="t">오늘은 복습할 단어가 없어요</div><div class="sub">단어장에서 테마를 골라 자유롭게 공부해 보세요</div></div>`;
  else if(!left.length){ const f=Object.values(d.done).filter(v=>v===1).length;
    tw=`<div class="donebig"><div style="font-size:44px">🎉</div><div class="t">오늘 공부 끝!</div><div class="sub">${items.length}개 중 ${f}개를 한 번에 맞혔어요</div></div>
      <div class="acts"><button class="btn w sm" onclick="startToday(true)">한 번 더 풀기</button><button class="btn sm" onclick="moreNew()">새 단어 5개 더</button></div>`; }
  else tw=`<div style="font-size:18px">오늘의 단어</div>
      <div class="row"><div class="bx"><b>${d.fresh.length}</b><span>새 단어</span></div><div class="bx"><b>${d.rev.length}</b><span>복습</span></div><div class="bx"><b>${done}</b><span>끝낸 것</span></div></div>
      <div class="bar"><i style="width:${pct}%"></i></div>
      <div class="acts">${d.fresh.length?`<button class="btn w sm" onclick="go('cards',{list:S.day.fresh.slice(),title:'오늘의 새 단어',today:1})">📖 카드 보기</button>`:''}<button class="btn sm" onclick="startToday()">✏️ ${done?'이어서 풀기':'퀴즈 시작'}</button></div>`;
  page(`<div class="stack">
    <div class="card"><div class="hello"><div class="me">${creature(S.av)}</div><div style="min-width:0"><div class="hi"><b>${esc(S.name||'친구')}</b>, 오늘도<br>공부해 볼까?</div><div class="sub">${lvl[1]} ${lvl[0]}단계 · ${lvl[2]} 수준 · 하루 ${S.perDay}개</div></div></div>
      <div class="today">${tw}</div>${tom?`<div class="sub" style="margin-top:8px">내일 복습 예정 ${tom}개</div>`:''}</div>
    ${villageMini()}
    <div class="minis"><div class="mini2"><b>${streakNow()}<small>일</small></b><div>🔥 연속 공부</div></div><div class="mini2"><b>${c.master}</b><div>🏅 완벽히 익힘</div></div><div class="mini2"><b>${c.seen}</b><div>📖 배운 단어</div></div></div>
  </div>`);
  checkAch();
}
function moreNew(){ const d=ensureDay(), add=unseen().filter(o=>!d.fresh.includes(o.id)).slice(0,5).map(o=>o.id);
  if(!add.length){ toast('새 단어를 모두 배웠어요!'); return; } d.fresh.push(...add); d.fin=false; save(); go('cards',{list:add,title:'새 단어 5개 더',today:1}); }

/* ---------- 단어장 ---------- */
function themeStat(t){ let seen=0,m=0; t.words.forEach(w=>{const p=S.p[w[0]]; if(p){seen++; if(p.b>=MASTER) m++;}}); return {seen,m,n:t.words.length}; }
function rWords(){
  page(`<div class="h2" style="margin:2px 2px 10px">단어장 · ${WL.length.toLocaleString()}개</div>
    <div class="tiles">${THEMES.map(t=>{const s=themeStat(t); return `<button class="tile" onclick="go('theme',{id:'${t.id}'})"><div class="ic">${t.icon}</div><div class="nm">${t.name}</div><div class="st">${s.seen}/${s.n} 배움 · 익힘 ${s.m}</div><div class="bar m"><i style="width:${s.seen/s.n*100}%"></i></div></button>`}).join('')}</div>
    <div class="card" style="margin-top:14px"><div style="font-size:17px">📒 오답노트 · ${Object.keys(S.wrong).length}개</div><div class="sub">틀린 단어가 모여요. 2번 더 맞히면 빠져요.</div><div class="acts"><button class="btn w sm" onclick="go('wrong')">오답노트 보기</button></div></div>`);
}
const MODES=[['mix','🎲 섞어서'],['meaning','뜻 고르기'],['reverse','영어 고르기'],['listen','🎧 듣기'],['cloze','빈칸 채우기'],['spell','⌨️ 철자 쓰기']];
function rTheme(){
  const t=TBY[ctx.id]; if(!t){ go('words'); return; }
  const lvF=ctx.lv||0, ws=t.words.map(w=>BY[w[0]]).filter(o=>!lvF||o.lv===lvF), s=themeStat(t), shown=ctx.n||60;
  page(`<div class="top" style="margin-top:-4px"><button class="back" onclick="go('words')">← 단어장</button></div>
    <div class="card"><div class="thead"><div class="ic">${t.icon}</div><div><div class="h2">${t.name}</div><div class="sub">${s.seen}/${s.n} 배움 · 완벽히 익힘 ${s.m}</div></div>
      <button class="btn w sm" onclick="go('cards',{list:TBY['${t.id}'].words.map(w=>w[0]).filter(id=>${lvF?`BY[id].lv===${lvF}`:'true'}),title:'${t.name}',theme:'${t.id}'})">📖 카드로 보기</button></div>
      <div class="sub" style="margin-top:12px">퀴즈 (덜 익힌 단어 위주 10문제)</div>
      <div class="chips" style="margin-top:8px">${MODES.map(([m,n])=>`<button class="chip" onclick="startTheme('${t.id}','${m}')">${n}</button>`).join('')}</div>
      <div class="sub" style="margin-top:12px">단계별로 보기</div>
      <div class="chips" style="margin-top:8px">${[0,1,2,3,4,5].map(l=>`<button class="chip ${lvF===l?'on':''}" onclick="go('theme',{id:'${t.id}',lv:${l}})">${l?l+'단계':'전체'}</button>`).join('')}</div>
      <div class="legend"><span><i></i>안 배움</span><span><i style="background:var(--yolk)"></i>익히는 중</span><span><i style="background:var(--sky)"></i>익숙함</span><span><i style="background:var(--mint)"></i>완벽</span></div></div>
    <div class="wlist">${ws.slice(0,shown).map(o=>`<div class="wrow"><span class="dot ${stDot(o.id)}"></span><div class="tx"><div class="w">${wordHTML(o)}<span class="lvtag">${o.lv}</span></div><div class="k">${esc(o.k)}</div></div><button class="iconbtn" onclick="sayW(${o.i})" aria-label="듣기">🔊</button></div>`).join('')}</div>
    ${ws.length>shown?`<div class="more"><button class="btn w sm" onclick="ctx.n=${shown+60};rTheme()">더 보기 (${ws.length-shown}개 남음)</button></div>`:''}`);
}

/* ---------- 카드 ---------- */
function markEx(o){ const ex=esc(o.ex), re=new RegExp('('+norm(o.w).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','i'); return ex.replace(re,'<mark>$1</mark>'); }
function exBox(o){ return `<div class="exbox"><div class="tx"><div class="ex en" style="font-family:var(--fb)">${markEx(o)}</div><div class="exk ${S.showKo?'':'blur'}" onclick="this.classList.remove('blur')">${esc(o.exk)}</div></div><button class="iconbtn" onclick="sayEx(${o.i})" aria-label="예문 듣기">🔊</button></div>`; }
function rCards(){
  const list=(ctx.list||[]).filter(id=>BY[id]); if(!list.length){ go('home'); return; }
  const i=Math.min(ctx.i||0,list.length-1); ctx.i=i; const o=BY[list[i]], b=stage(o.id);
  const st=b<0?'새 단어':b>=MASTER?'완벽히 익힘':b>=3?'익숙함':'익히는 중', last=i===list.length-1;
  app.innerHTML=`<div class="top"><button class="back" onclick="window.appBack()">← ${esc(ctx.title||'')}</button><div class="sp"></div><div class="pill"><b>${i+1}</b>/ ${list.length}</div></div>
  <div class="fcard"><div class="tag">${st} · ${o.lv}단계</div><button class="iconbtn say" onclick="sayW(${o.i})">🔊</button>
    <div class="wd ${isLong(o)?'long':''}">${wordHTML(o)}</div><div class="mean">${esc(o.k)}</div>${exBox(o)}</div>
  <div class="cnav"><button class="btn w sm" ${i?'':'disabled'} onclick="ctx.i--;rCards()">◀ 이전</button><span class="cnt">${i+1} / ${list.length}</span>${last?`<button class="btn sm" onclick="cardsDone()">퀴즈로 확인 ✏️</button>`:`<button class="btn sm" onclick="ctx.i++;rCards()">다음 ▶</button>`}</div>
  ${b<MASTER?`<div style="text-align:center;margin-top:12px"><button class="chip" onclick="knowIt(${o.i})">✅ 이미 알아요 (다시 안 나오게)</button></div>`:''}`;
  if(S.auto) setTimeout(()=>speak(o.w),250);
}
function knowIt(i){
  const id=WL[i].id; markKnown(id); const d=S.day;
  if(ctx.today&&d&&d.d===today()&&d.fresh.includes(id)){
    d.fresh=d.fresh.filter(x=>x!==id); delete d.done[id];
    const nx=unseen().find(o=>!d.fresh.includes(o.id));
    ctx.list=ctx.list.filter(x=>x!==id); if(nx){ d.fresh.push(nx.id); ctx.list.push(nx.id); }
    save(); toast(nx?'다시 안 나와요. 새 단어로 바꿨어요':'다시 안 나와요');
  } else toast('완벽히 익힌 단어로 옮겼어요');
  if(!ctx.list.length){ go('home'); return; } rCards();
}
function cardsDone(){ if(ctx.today) startToday(); else if(ctx.theme) startTheme(ctx.theme,'mix'); else go('home'); }

/* ---------- 퀴즈 ---------- */
let Q=null, advT=null;
function canMode(o,m){
  if(m==='cloze') return o.ex.toLowerCase().includes(norm(o.w));
  if(m==='spell') return /^[a-z-]+$/i.test(o.w)&&o.w.length<=13;
  return true;
}
function pickMode(o,pref){
  if(pref&&pref!=='mix') return canMode(o,pref)?pref:'meaning';
  const b=stage(o.id), pool=b<=0?['meaning','meaning','listen']:b<=2?['meaning','reverse','listen','cloze']:['reverse','listen','cloze','spell'];
  return shuffle(pool).find(m=>canMode(o,m))||'meaning';
}
function startToday(again){
  const d=ensureDay(), ids=again?dayItems(d):dayLeft(d); if(!ids.length){ go('home'); return; }
  const fr=ids.filter(id=>d.fresh.includes(id)), rv=shuffle(ids.filter(id=>!d.fresh.includes(id)));
  beginQuiz([...shuffle(fr),...rv],'mix',{kind:'today'});
}
function startTheme(tid,mode){
  let ids=TBY[tid].words.map(w=>w[0]);
  if(mode!=='mix'){ const ok=ids.filter(id=>canMode(BY[id],mode)); if(ok.length>=4) ids=ok; }
  ids=shuffle(ids).sort((a,b)=>stage(a)-stage(b)).slice(0,10);
  beginQuiz(shuffle(ids),mode,{kind:'theme',theme:tid});
}
function startWrong(){ const ids=Object.keys(S.wrong).filter(id=>BY[id]); if(ids.length) beginQuiz(shuffle(ids).slice(0,15),'mix',{kind:'wrong'}); }
function beginQuiz(ids,mode,meta){
  mutedQuiz=false;
  Q={mode,meta,items:ids.map(id=>({id,m:pickMode(BY[id],mode),retry:false})),i:0,first:0,total:ids.length,miss:[],stars:0,eggs:0,t0:Date.now(),answered:false};
  go('quiz',{theme:meta.theme});
}
function distract(o,field){
  const val=x=>field==='k'?x.k:norm(x.w), wc=s=>String(s).split(' ').length;
  let pool=[...shuffle(WL.filter(x=>x.th===o.th&&x.id!==o.id)),...shuffle(WL.filter(x=>x.th!==o.th)).slice(0,200)];
  if(field==='w'){ const n=wc(o.w); pool=[...pool.filter(x=>Math.abs(wc(x.w)-n)<=1),...pool.filter(x=>Math.abs(wc(x.w)-n)>1)]; }
  const out=[], seen=new Set([val(o)]);
  for(const x of pool){ const v=val(x); if(seen.has(v)) continue; seen.add(v); out.push(x); if(out.length>=3) break; }
  return out;
}
function noSound(){
  mutedQuiz=true; try{ speechSynthesis&&speechSynthesis.cancel(); }catch(e){}
  Q.items.forEach((it,k)=>{ if(k>=Q.i&&it.m==='listen') it.m='meaning'; });
  toast('🔇 이번 퀴즈에서는 듣기 문제를 빼고 소리도 끌게요'); rQuiz();
}
function rQuiz(){
  if(!Q){ go('home'); return; }
  if(Q.i>=Q.items.length){ finishQuiz(); return; }
  const it=Q.items[Q.i], o=BY[it.id], m=it.m; Q.answered=false; clearTimeout(advT);
  const opts=(field,fn)=>shuffle([o,...distract(o,field)]).map(x=>`<button class="choice ${field==='w'?'en':''}" data-ok="${x.id===o.id?1:0}" onclick="pickChoice(this)">${fn(x)}</button>`).join('');
  let prompt, body;
  if(m==='meaning'){ prompt=`<div class="ask">이 표현의 뜻은?</div><div class="qw ${isLong(o)?'long':''}">${wordHTML(o)}</div>${mutedQuiz?'':`<button class="iconbtn say" onclick="sayW(${o.i})">🔊</button>`}`; body=opts('k',x=>esc(x.k)); }
  else if(m==='reverse'){ prompt=`<div class="ask">영어로 하면?</div><div class="qk">${esc(o.k)}</div>`; body=opts('w',x=>esc(x.w)); }
  else if(m==='listen'){ prompt=`<div class="ask">잘 듣고 뜻을 골라요</div><button class="bigsay" onclick="sayW(${o.i})" aria-label="다시 듣기">🔊</button><button class="nosound" onclick="noSound()">🔇 지금 소리 못 들어요</button>`; body=opts('k',x=>esc(x.k)); }
  else if(m==='cloze'){ const re=new RegExp(norm(o.w).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'), parts=o.ex.split(re);
    prompt=`<div class="ask">빈칸에 알맞은 표현은?</div><div class="cloze">${esc(parts[0])}<u>____</u>${esc(parts.slice(1).join(''))}</div><div class="clozek">${esc(o.exk)}</div>`; body=opts('w',x=>esc(norm(x.w))); }
  else { const hint=o.w[0]+' '+'_ '.repeat(Math.max(0,o.w.length-1)).trim();
    prompt=`<div class="ask">영어로 써 보세요</div><div class="qk">${esc(o.k)}</div><div class="clozek">${esc(o.exk)}</div>`;
    body=`<div class="spell"><div class="hint">${esc(hint)}</div><input id="sp" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="여기에 입력" onkeydown="if(event.key==='Enter')checkSpell()"><div class="acts" style="width:100%"><button class="btn w sm" onclick="spellGiveUp()">모르겠어요</button><button class="btn sm" onclick="checkSpell()">확인</button></div></div>`; }
  app.innerHTML=`<div class="qhead"><button class="iconbtn" onclick="quitQuiz()" aria-label="그만하기">✕</button><div class="bar"><i style="width:${Q.i/Q.items.length*100}%"></i></div><b>${Q.i+1}/${Q.items.length}</b>${mutedQuiz?'<span class="pill">🔇</span>':''}</div>
    <div class="card prompt">${prompt}<div class="buddy" id="buddy">${creature(S.av)}</div></div>
    ${m==='spell'?body:`<div class="choices">${body}</div>`}<div id="fb"></div>`;
  if(m==='listen') setTimeout(()=>speak(o.w),300); else if(m==='meaning'&&S.auto) setTimeout(()=>speak(o.w),300);
  if(m==='spell') setTimeout(()=>{ const x=$('#sp'); if(x) x.focus(); },200);
}
function pickChoice(btn){
  if(Q.answered) return; Q.answered=true; const ok=btn.dataset.ok==='1';
  document.querySelectorAll('.choice').forEach(b=>{ if(b.dataset.ok==='1') b.classList.add('ok'); else if(b===btn) b.classList.add('no'); else b.classList.add('dim'); });
  answer(ok);
}
function checkSpell(){ if(Q.answered) return; const inp=$('#sp'), v=norm(inp.value); if(!v){ inp.focus(); return; }
  const ok=v===norm(BY[Q.items[Q.i].id].w); Q.answered=true; inp.classList.add(ok?'ok':'no'); inp.blur(); answer(ok); }
function spellGiveUp(){ if(Q.answered) return; Q.answered=true; const inp=$('#sp'); inp.classList.add('no'); inp.value=BY[Q.items[Q.i].id].w; answer(false); }
function answer(ok){
  const it=Q.items[Q.i], o=BY[it.id];
  if(!it.retry){ grade(it.id,ok); if(ok){ Q.first++; Q.stars++; Q.eggs+=addStars(1); const sn=$('#starN'); if(sn) sn.textContent=S.stars; } else Q.miss.push(it.id); save(); }
  if(!ok&&!it.retry) Q.items.push({id:it.id,m:it.m==='spell'||it.m==='cloze'?'reverse':'meaning',retry:true});
  ok?sfx.ok():(sfx.no(),buzz(60));
  const bd=$('#buddy'); if(bd) bd.innerHTML=creature({...S.av,eyes:ok?'star':'swirl',mouth:ok?'open':'wave'});
  if(it.m!=='meaning'&&it.m!=='listen'&&S.auto) setTimeout(()=>speak(o.w),350);
  const last=Q.i>=Q.items.length-1;
  $('#fb').innerHTML=`<div class="fb ${ok?'ok':'no'}"><div class="topr"><span class="verdict">${ok?(it.retry?'⭕ 정답':'⭕ 정답 <span style="font-size:14px">⭐+1</span>'):'❌ 아쉬워요'}</span><div class="sp"></div>${mutedQuiz?'':`<button class="iconbtn" onclick="sayW(${o.i})">🔊</button>`}</div>
    <div class="w">${wordHTML(o)}</div><div class="k">${esc(o.k)}</div>${exBox(o)}
    <button class="btn sm next" onclick="nextQ()">${last?'결과 보기':'다음 →'}</button></div>`;
  if(ok) advT=setTimeout(nextQ,1700);
  const fb=$('#fb .fb'); if(fb) fb.addEventListener('click',e=>{ if(!e.target.closest('button')) clearTimeout(advT); });
  setTimeout(()=>{ const f=$('#fb'); if(f) f.scrollIntoView({behavior:'smooth',block:'nearest'}); },60);
}
function nextQ(){ clearTimeout(advT); if(!Q) return; Q.i++; rQuiz(); }
function quitQuiz(){
  clearTimeout(advT); const n=Q?Q.items.slice(0,Q.i).filter(x=>!x.retry).length:0;
  const back=()=>{ const m=Q&&Q.meta; Q=null; mutedQuiz=false; closeModal(); m&&m.kind==='theme'?go('theme',{id:m.theme}):m&&m.kind==='wrong'?go('wrong'):go('home'); };
  if(!n){ back(); return; }
  modal(`<div style="font-size:40px">🚪</div><div class="mt">그만할까요?</div><div class="md">지금까지 푼 ${n}문제와 받은 별은 저장돼요.</div><div class="acts"><button class="btn w sm" onclick="closeModal()">계속하기</button><button class="btn sm" id="qq">그만하기</button></div>`);
  $('#qq').onclick=back;
}
function finishQuiz(){
  const meta=Q.meta; let dayDone=false;
  if(meta.kind==='today'){ const d=S.day; if(d&&!dayLeft(d).length) dayDone=finishDay(); }
  if(Q.first===Q.total&&Q.total>=5) S.perfect++;
  Q.secs=Math.round((Date.now()-Q.t0)/1000); save();
  const r={...Q,dayDone}; Q=null; mutedQuiz=false; go('result',{r,theme:meta.theme});
}
function rResult(){
  const r=ctx.r; if(!r){ go('home'); return; }
  const pct=r.total?Math.round(r.first/r.total*100):0, d=S.day;
  const msg=r.dayDone?'오늘 공부 완료! 내일 또 만나요':pct===100?'완벽해요! 만점!':pct>=70?'잘하고 있어요':'틀린 단어는 내일 다시 나와요';
  const st=r.stars+(r.dayDone?5:0), eg=r.eggs+(r.dayDone&&d?d.bonusEggs||0:0), miss=[...new Set(r.miss)].map(id=>BY[id]);
  app.innerHTML=`<div class="result"><div class="big">${creature({...S.av,eyes:pct>=70?'star':'happy',mouth:'open'})}</div><div class="t">${msg}</div>
    <div class="score">${r.first}<small> / ${r.total}</small></div><div class="sub">한 번에 맞힌 문제 · 약 ${Math.max(1,Math.round(r.secs/60))}분</div>
    <div class="gain">${st?`<span>⭐ +${st}</span>`:''}${r.dayDone&&d&&d.bonusFood?`<span>${d.bonusFood} 밥 +2</span>`:''}${eg?`<span>🥚 새 알 ${eg}개!</span>`:''}</div>
    ${miss.length?`<div class="card" style="margin-top:14px;text-align:left"><div style="font-size:17px;margin-bottom:8px">다시 볼 단어 ${miss.length}개</div><div class="wlist" style="margin-top:0">${miss.map(o=>`<div class="wrow"><div class="tx"><div class="w">${wordHTML(o)}</div><div class="k">${esc(o.k)}</div></div><button class="iconbtn" onclick="sayW(${o.i})">🔊</button></div>`).join('')}</div></div>`:''}
    <div class="acts" style="justify-content:center">${r.meta.kind==='theme'?`<button class="btn w" onclick="startTheme('${r.meta.theme}','${r.mode}')">한 번 더</button>`:r.meta.kind==='wrong'?`<button class="btn w" onclick="go('wrong')">오답노트</button>`:`<button class="btn w" onclick="go('home')">홈으로</button>`}${eggCount()?`<button class="btn" onclick="go('village')">🥚 알 보러 가기</button>`:`<button class="btn m" onclick="go('village')">🏡 마을</button>`}</div></div>`;
  if(r.dayDone||pct===100){ sfx.win(); burst(30); }
  setTimeout(checkAch,600);
}

/* ---------- 오답 · 기록 · 설정 ---------- */
function rWrong(){
  const ids=Object.keys(S.wrong).filter(id=>BY[id]);
  page(ids.length?`<div class="card"><div class="thead"><div class="ic">📒</div><div><div class="h2">오답노트</div><div class="sub">틀린 단어가 모여요. 2번 더 맞히면 빠져요.</div></div><button class="btn" onclick="startWrong()">오답 퀴즈 (${Math.min(15,ids.length)}문제)</button></div></div>
    <div class="wlist">${ids.map(id=>{const o=BY[id]; return `<div class="wrow"><span class="dot l1"></span><div class="tx"><div class="w">${wordHTML(o)}</div><div class="k">${esc(o.k)} · 남은 횟수 ${S.wrong[id]}</div></div><button class="iconbtn" onclick="sayW(${o.i})">🔊</button></div>`}).join('')}</div>`
    :`<div class="card empty"><div style="font-size:48px">🌈</div><div class="t">틀린 단어가 없어요</div><div class="sub">퀴즈에서 틀리면 여기에 모여요</div></div>`);
}
function rRecords(){
  const c=counts(); let n=0,cr=0; Object.values(S.log).forEach(g=>{ n+=g.n; cr+=g.c; });
  const tom=WL.filter(o=>{const p=S.p[o.id]; return p&&p.b>0&&p.due<=addDays(today(),1);}).length;
  const days=[...Array(14)].map((_,k)=>addDays(today(),k-13)), vals=days.map(d=>(S.log[d]&&S.log[d].n)||0), mx=Math.max(10,...vals);
  page(`<div class="stats">
      <div class="mini2"><b>${streakNow()}<small>일</small></b><div>🔥 연속 공부 (최고 ${S.streak.best}일)</div></div>
      <div class="mini2"><b>${studyDays()}<small>일</small></b><div>📅 공부한 날</div></div>
      <div class="mini2"><b>${c.master}<small>/${c.total.toLocaleString()}</small></b><div>🏅 완벽히 익힌 단어</div></div>
      <div class="mini2"><b>${c.seen}</b><div>📖 배운 단어</div></div>
      <div class="mini2"><b>${n?Math.round(cr/n*100):0}<small>%</small></b><div>🎯 정답률 (${n}문제)</div></div>
      <div class="mini2"><b>${tom}</b><div>⏰ 내일까지 복습</div></div></div>
    <div class="card" style="margin-top:14px"><div style="font-size:17px">최근 2주 푼 문제</div>
      <div class="chart">${days.map((d,k)=>`<div class="c">${vals[k]?`<em>${vals[k]}</em>`:''}<i class="${vals[k]?'':'z'}" style="height:${Math.max(4,vals[k]/mx*100)}%"></i><span>${+d.slice(8)}</span></div>`).join('')}</div></div>
    <div class="card" style="margin-top:14px"><div style="font-size:17px">테마별 진도</div>
      <div class="tprog">${THEMES.map(t=>{const s=themeStat(t); return `<div class="r"><span style="font-size:20px">${t.icon}</span><div><div>${t.name}</div><div class="bar m"><i style="width:${s.seen/s.n*100}%"></i></div></div><b>${s.seen}/${s.n}</b></div>`}).join('')}</div></div>`);
}
function rSettings(){
  const tg=(k)=>`<button class="tgl ${S[k]?'on':''}" onclick="S.${k}=!S.${k};save();rSettings()" aria-label="켜기/끄기"></button>`;
  const ch=(cur,arr,fn)=>arr.map(([v,n])=>`<button class="chip ${cur===v?'on':''}" onclick="${fn}(${v})">${n}</button>`).join('');
  page(`<div class="card">
    <div class="prow"><div class="pl"><div class="pt">내 캐릭터</div><div class="pd">모양·색·표정·꾸미기를 바꿔요</div></div><button class="av" style="width:56px;height:56px" onclick="go('avatar')">${creature(S.av)}</button></div>
    <div class="prow"><div class="pl"><div class="pt">이름</div></div><input class="ntxt" id="nm" maxlength="10" value="${esc(S.name)}" onchange="S.name=this.value.trim()||'친구';save();toast('저장했어요')"></div>
    <div class="prow"><div class="pl"><div class="pt">난이도</div><div class="pd">새 단어를 몇 단계부터 꺼낼지 정해요 (지금: ${LEVELS[S.lv-1][2]} 수준)</div></div><div class="chips">${ch(S.lv,LEVELS.map(l=>[l[0],l[0]+'단계 '+l[2]]),'setLv')}</div></div>
    <div class="prow"><div class="pl"><div class="pt">하루 새 단어</div><div class="pd">복습 단어는 따로 나와요</div></div><div class="chips">${ch(S.perDay,AMOUNTS.map(a=>[a[0],a[0]+'개']),'setPer')}</div></div>
    <div class="prow"><div class="pl"><div class="pt">발음 속도</div></div><div class="chips">${ch(S.rate,[[0.8,'천천히'],[1,'보통'],[1.15,'빠르게']],'setRate')}<button class="chip" onclick="speak('Nice to meet you. Let\\'s study together!')">🔊 들어 보기</button></div></div>
    <div class="prow"><div class="pl"><div class="pt">자동 발음</div><div class="pd">카드·문제가 나오면 단어를 읽어 줘요</div></div>${tg('auto')}</div>
    <div class="prow"><div class="pl"><div class="pt">예문 해석 바로 보기</div><div class="pd">끄면 해석이 흐리게 가려지고, 누르면 보여요</div></div>${tg('showKo')}</div>
    <div class="prow"><div class="pl"><div class="pt">백업 · 복원</div><div class="pd">폰을 바꿀 때 기록과 마을을 옮길 수 있어요</div></div><div class="chips"><button class="btn w sm" onclick="exportData()">💾 백업</button><button class="btn w sm" onclick="$('#backupInput').click()">📂 복원</button></div></div>
    <div class="prow"><div class="pl"><div class="pt">처음부터 다시</div><div class="pd">모든 기록과 마을이 지워져요</div></div><button class="btn w sm" onclick="resetAll()">초기화</button></div>
  </div><div class="sub" style="text-align:center;margin-top:14px">공!부!해! · 영어 단어 ${WL.length.toLocaleString()}개</div>`);
}
function rAvatar(){ page(`<div class="top" style="margin-top:-4px"><button class="back" onclick="go('settings')">← 설정</button></div><div class="hero"><div class="big">${creature(S.av)}</div></div><div class="stack" style="margin-top:10px">${avatarEditor()}</div>`); }
function resetDayIfFresh(){ const d=S.day; if(d&&d.d===today()&&!Object.keys(d.done).length) S.day=null; ORDER=null; }
function setLv(v){ S.lv=v; resetDayIfFresh(); save(); rSettings(); }
function setPer(v){ S.perDay=v; resetDayIfFresh(); save(); rSettings(); }
function setRate(v){ S.rate=v; save(); rSettings(); }
function resetAll(){
  modal(`<div style="font-size:40px">🗑️</div><div class="mt">정말 처음부터 할까요?</div><div class="md">배운 단어, 마을 친구들, 컬렉션이 모두 지워지고 되돌릴 수 없어요.</div><div class="acts"><button class="btn w sm" onclick="closeModal()">취소</button><button class="btn sm" id="rs">지우기</button></div>`);
  $('#rs').onclick=()=>{ S=blank(); save(); closeModal(); step=0; ORDER=null; render(); };
}
function exportData(){
  const name=`gongbuhae-backup-${today()}.json`, json=JSON.stringify(S);
  try{ if(HAS_ANDROID&&Android.exportBackup){ toast(Android.exportBackup(name,json)); return; } }catch(e){}
  const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([json],{type:'application/json'})); a.download=name; a.click();
}
$('#backupInput').addEventListener('change',e=>{
  const f=e.target.files[0]; if(!f) return; const rd=new FileReader();
  rd.onload=()=>{ try{ const d=JSON.parse(rd.result); if(!d||!d.p) throw 0; S=Object.assign(blank(),d); ORDER=null; save(); toast('복원했어요'); go('home'); }catch(err){ toast('백업 파일이 아니에요'); } };
  rd.readAsText(f); e.target.value='';
});

/* ---------- 시작 ---------- */
if(location.hash==='#test') window.__t={get Q(){return Q;},get S(){return S;},set S(v){S=v;},WL,BY,grade,ensureDay,dayLeft,canMode,addStars};
document.addEventListener('visibilitychange',()=>{ if(!document.hidden&&(view==='home'||view==='village')) render(); });
render();
