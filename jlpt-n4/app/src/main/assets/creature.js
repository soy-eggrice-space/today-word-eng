/* ============ 생물 그리기 (다마고치 느낌 · 몸 모양 × 귀/뿔 × 랜덤 색) ============ */
const INK='#3B2F4A';
const SK=`stroke="${INK}" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"`;
const COLORS=['#F5E2A6','#F2C9D3','#C3E3D4','#CADAEE','#DAD1EE','#F2D3BE','#FFFFFF','#D8E7BF','#C2DFDF','#F1DCE5','#F4EBCC','#D0C8E8'];
function shade(hex,a){ const n=parseInt(hex.slice(1),16); let r=n>>16,g=n>>8&255,b=n&255; const t=a<0?0:255,p=Math.abs(a); r=Math.round(r+(t-r)*p); g=Math.round(g+(t-g)*p); b=Math.round(b+(t-b)*p); return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1); }
const CHEEKS={pink:'#FF8FB1',peach:'#FFA97A',none:null};

function eyes(type,cx,ey,g){
  const L=cx-g,R=cx+g;
  const oval=(x,rx,ry)=>`<ellipse cx="${x}" cy="${ey}" rx="${rx}" ry="${ry}" fill="${INK}"/><ellipse cx="${x+rx*.32}" cy="${ey-ry*.42}" rx="${rx*.42}" ry="${ry*.36}" fill="#fff"/><circle cx="${x-rx*.35}" cy="${ey+ry*.42}" r="${rx*.22}" fill="#fff"/>`;
  const arc=(x,up)=>`<path d="M${x-5} ${ey+(up?2:-1)} q5 ${up?-7:6} 10 0" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
  switch(type){
    case 'dot': return `<g class="eyes"><circle cx="${L}" cy="${ey}" r="4.2" fill="${INK}"/><circle cx="${R}" cy="${ey}" r="4.2" fill="${INK}"/><circle cx="${L+1.4}" cy="${ey-1.4}" r="1.4" fill="#fff"/><circle cx="${R+1.4}" cy="${ey-1.4}" r="1.4" fill="#fff"/></g>`;
    case 'sparkle': return `<g class="eyes">${oval(L,6.4,7)}${oval(R,6.4,7)}</g>`;
    case 'happy': return arc(L,1)+arc(R,1);
    case 'sleep': return arc(L,0)+arc(R,0);
    case 'line': return `<path d="M${L-4} ${ey} h8 M${R-4} ${ey} h8" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
    case 'wink': return oval(L,5,6.4)+arc(R,1);
    case 'tiny': return `<circle cx="${L}" cy="${ey}" r="2.6" fill="${INK}"/><circle cx="${R}" cy="${ey}" r="2.6" fill="${INK}"/>`;
    case 'star': return [L,R].map(x=>`<path d="M${x} ${ey-6} l1.9 4 4.3 .5 -3.2 2.9 .9 4.3 -3.9 -2.2 -3.9 2.2 .9 -4.3 -3.2 -2.9 4.3 -.5z" fill="#FFC21A" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`).join('');
    case 'heart': return [L,R].map(x=>`<path d="M${x} ${ey+5} l-5.4 -5.4 a3.2 3.2 0 0 1 5.4 -4 a3.2 3.2 0 0 1 5.4 4 z" fill="#FF5C8A" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`).join('');
    case 'swirl': return [L,R].map(x=>`<path d="M${x} ${ey} m-1 0 a1 1 0 1 1 2 0 a2.6 2.6 0 1 1 -5 0 a4 4 0 1 1 8 0" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`).join('');
    case 'cyclops': return `<g class="eyes"><ellipse cx="${cx}" cy="${ey-1}" rx="10" ry="11" fill="#fff" ${SK} stroke-width="2.6"/>${oval(cx,6,7).replace(/cy="[\d.]+"/,`cy="${ey}"`)}</g>`;
    case 'three': return `<g class="eyes">${[cx-g-2,cx,cx+g+2].map((x,i)=>`<ellipse cx="${x}" cy="${ey-(i===1?6:0)}" rx="4" ry="4.8" fill="${INK}"/><circle cx="${x+1.3}" cy="${ey-(i===1?6:0)-1.6}" r="1.5" fill="#fff"/>`).join('')}</g>`;
    default: return `<g class="eyes">${oval(L,5,6.4)}${oval(R,5,6.4)}</g>`; // oval: 다마고치식 세로 눈
  }
}
function mouth(type,cx,my){
  switch(type){
    case 'smile': return `<path d="M${cx-5} ${my} q5 5 10 0" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`;
    case 'open': return `<path d="M${cx-5.5} ${my-1} q5.5 10 11 0 z" fill="#F0607E" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M${cx-2.5} ${my+3.5} q2.5 -2 5 0" fill="none" stroke="#FFB0C0" stroke-width="1.6"/>`;
    case 'tongue': return `<path d="M${cx-5} ${my} q5 5 10 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M${cx-1} ${my+2.6} q3 7 6 0" fill="#FF7E95" stroke="${INK}" stroke-width="2"/>`;
    case 'o': return `<ellipse cx="${cx}" cy="${my+1.5}" rx="3" ry="3.6" fill="#F0607E" stroke="${INK}" stroke-width="2.2"/>`;
    case 'fang': return `<path d="M${cx-6} ${my} q6 5 12 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/><path d="M${cx+1} ${my+2.2} l2 4 2 -3.4" fill="#fff" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`;
    case 'flat': return `<path d="M${cx-4} ${my+1} h8" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    case 'wave': return `<path d="M${cx-7} ${my+1} q1.75 -3 3.5 0 t3.5 0 t3.5 0 t3.5 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
    default: return `<path d="M${cx-6.5} ${my} q3.25 4 6.5 0 q3.25 4 6.5 0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`; // cat ω
  }
}
function face(cx,ey,f,g){
  g=g||12; const ch=CHEEKS[f.cheek||'pink'];
  const one=['cyclops'].includes(f.eyes);
  const blush=ch?`<ellipse cx="${cx-g-(one?2:8)}" cy="${ey+8}" rx="6.4" ry="4" fill="${ch}" opacity=".7"/><ellipse cx="${cx+g+(one?2:8)}" cy="${ey+8}" rx="6.4" ry="4" fill="${ch}" opacity=".7"/>`:'';
  return blush+eyes(f.eyes||'oval',cx,ey,g)+mouth(f.mouth||'cat',cx,ey+(one?13:10));
}
/* 몸통 모양: [path, 얼굴 y, 눈 간격] */
const SHAPES={
  round:['M50 30 C76 30 88 46 88 64 C88 84 72 94 50 94 C28 94 12 84 12 64 C12 46 24 30 50 30Z',64,12],
  mochi:['M12 82 C8 58 26 36 50 36 C74 36 92 58 88 82 C86 93 14 93 12 82Z',68,13],
  drop:['M50 18 C64 34 86 48 86 68 C86 86 70 94 50 94 C30 94 14 86 14 68 C14 48 36 34 50 18Z',68,12],
  bean:['M16 60 C14 38 34 32 46 40 C56 30 86 32 86 60 C86 84 68 94 50 94 C30 94 18 82 16 60Z',64,12],
  ghost:['M16 62 C16 38 32 28 50 28 C68 28 84 38 84 62 L84 92 L73 85 L62 93 L50 85 L38 93 L27 85 L16 92Z',58,12],
  cloud:['M22 90 C6 90 6 68 20 64 C16 46 34 38 42 48 C46 32 68 32 70 48 C80 40 96 52 86 66 C98 72 94 92 78 90Z',70,12],
  star:['M50 20 C56 20 58 37 63 41 C68 45 85 43 87 50 C89 57 74 64 72 70 C70 77 79 90 72 95 C66 99 56 88 50 88 C44 88 34 99 28 95 C21 90 30 77 28 70 C26 64 11 57 13 50 C15 43 32 45 37 41 C42 37 44 20 50 20Z',60,9],
  jelly:['M12 64 C12 36 30 24 50 24 C70 24 88 36 88 64 Q50 74 12 64Z',50,12],
  tall:['M50 22 C72 22 82 42 82 62 C82 84 70 94 50 94 C30 94 18 84 18 62 C18 42 28 22 50 22Z',56,11],
  mushroom:['M28 54 h44 C78 72 72 93 50 93 C28 93 22 72 28 54Z',72,10],
};
/* 부위 (뒤 / 앞) */
function partBack(p,c){
  const d=shade(c,-.12), pk='#FF9FBE';
  switch(p){
    case 'cat': return `<path d="M20 50 L22 20 L44 36Z M80 50 L78 20 L56 36Z" fill="${c}" ${SK}/><path d="M25 42 L26 28 L37 36Z M75 42 L74 28 L63 36Z" fill="${pk}"/>`;
    case 'bunny': return `<ellipse cx="36" cy="22" rx="8.5" ry="20" fill="${c}" ${SK} transform="rotate(-10 36 22)"/><ellipse cx="64" cy="22" rx="8.5" ry="20" fill="${c}" ${SK} transform="rotate(10 64 22)"/><ellipse cx="36" cy="24" rx="3.6" ry="12" fill="${pk}" transform="rotate(-10 36 24)"/><ellipse cx="64" cy="24" rx="3.6" ry="12" fill="${pk}" transform="rotate(10 64 24)"/>`;
    case 'bear': return `<circle cx="25" cy="38" r="12" fill="${c}" ${SK}/><circle cx="75" cy="38" r="12" fill="${c}" ${SK}/><circle cx="25" cy="38" r="5.5" fill="${pk}"/><circle cx="75" cy="38" r="5.5" fill="${pk}"/>`;
    case 'fox': return `<path d="M16 54 L18 12 L46 34Z M84 54 L82 12 L54 34Z" fill="${c}" ${SK}/><path d="M18 22 L19 12 L28 19Z M82 22 L81 12 L72 19Z" fill="${INK}"/><path d="M84 84 C104 80 104 56 92 52 C96 66 88 74 80 76Z" fill="${c}" ${SK}/><path d="M96 56 C100 60 100 66 98 70 C94 66 92 60 96 56Z" fill="#fff"/>`;
    case 'wings': return `<path d="M14 64 C-4 52 2 34 14 42 C10 30 26 30 26 46Z M86 64 C104 52 98 34 86 42 C90 30 74 30 74 46Z" fill="#fff" ${SK} stroke-width="2.8"/>`;
    case 'bee': return `<ellipse cx="26" cy="32" rx="12" ry="8" fill="#E6F4FF" ${SK} stroke-width="2.6" transform="rotate(-30 26 32)"/><ellipse cx="74" cy="32" rx="12" ry="8" fill="#E6F4FF" ${SK} stroke-width="2.6" transform="rotate(30 74 32)"/>`;
    case 'jelly': return [22,36,50,64,78].map((x,i)=>`<path d="M${x} 64 q${i%2?6:-6} 14 0 28" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M${x} 64 q${i%2?6:-6} 14 0 28" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/>`).join('');
    case 'mushroom': return '';
    case 'tail': return `<path d="M84 84 q14 -2 12 -14 q-2 -6 -8 -4" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M86 66 l6 -2 -2 6z" fill="#FF6F8F" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    case 'halo': return `<ellipse cx="50" cy="12" rx="17" ry="5" fill="none" stroke="#FFC21A" stroke-width="4.5"/>`;
    case 'mane': return `<path d="M30 40 C20 30 30 16 44 22 C46 12 64 12 66 24 C78 20 86 34 76 42" fill="none" stroke="#FF9FC4" stroke-width="9" stroke-linecap="round"/><path d="M32 40 C24 32 32 20 44 25" fill="none" stroke="#B8D8FF" stroke-width="4" stroke-linecap="round"/><path d="M66 27 C76 24 82 34 75 40" fill="none" stroke="#FFE27A" stroke-width="4" stroke-linecap="round"/>`;
    case 'flippers': return `<ellipse cx="17" cy="64" rx="6" ry="13" fill="${d}" ${SK} stroke-width="2.6" transform="rotate(20 17 64)"/><ellipse cx="83" cy="64" rx="6" ry="13" fill="${d}" ${SK} stroke-width="2.6" transform="rotate(-20 83 64)"/>`;
    default: return '';
  }
}
function partFront(p,c,shape){
  const d=shade(c,-.15);
  switch(p){
    case 'sprout': return `<path d="M50 ${shape==='drop'?20:30} v-10" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M50 ${shape==='drop'?12:22} C44 4 30 6 32 14 C38 18 46 16 50 ${shape==='drop'?12:22}Z M50 ${shape==='drop'?12:22} C56 4 70 6 68 14 C62 18 54 16 50 ${shape==='drop'?12:22}Z" fill="#8FD16A" ${SK} stroke-width="2.6"/>`;
    case 'horns': return `<path d="M32 36 C30 24 36 18 40 16 C40 24 42 30 42 33Z M68 36 C70 24 64 18 60 16 C60 24 58 30 58 33Z" fill="#FFF3C4" ${SK} stroke-width="2.6"/>`;
    case 'devil': return `<path d="M30 38 C24 26 28 16 32 12 C34 22 38 30 40 33Z M70 38 C76 26 72 16 68 12 C66 22 62 30 60 33Z" fill="#7A3A64" ${SK} stroke-width="2.6"/>`;
    case 'antenna': return `<path d="M50 30 C50 20 56 14 58 8" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="59" cy="7" r="6" fill="#FF8FB1" ${SK} stroke-width="2.6"/><circle cx="57" cy="5" r="1.8" fill="#fff"/>`;
    case 'antenna2': return `<path d="M38 32 C36 22 30 16 28 12 M62 32 C64 22 70 16 72 12" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="27" cy="10" r="5" fill="#FFE27A" ${SK} stroke-width="2.4"/><circle cx="73" cy="10" r="5" fill="#FFE27A" ${SK} stroke-width="2.4"/>`;
    case 'curls': return `<g fill="#fff" ${SK} stroke-width="2.6">${[[30,36],[42,30],[56,29],[70,35],[36,30],[63,30]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="9"/>`).join('')}</g><path d="M28 40 C40 34 60 34 72 40" fill="#fff" stroke="none"/>`;
    case 'spikes': return `<path d="M30 34 L34 22 L40 31 L46 18 L52 30 L58 19 L63 31 L70 23 L72 36" fill="#FFB0C8" ${SK} stroke-width="2.6"/>`;
    case 'stripes': return `<path d="M24 40 C40 36 60 36 76 40 L80 47 C62 43 38 43 20 47Z M14 80 C30 77 70 77 86 80 L82 88 C68 85 32 85 18 88Z" fill="${INK}" opacity=".8"/>`;
    case 'belly': return `<ellipse cx="50" cy="74" rx="20" ry="17" fill="#fff" opacity=".9"/>`;
    case 'spots': return `<circle cx="24" cy="56" r="5" fill="${d}"/><circle cx="78" cy="52" r="6.5" fill="${d}"/><circle cx="72" cy="80" r="4" fill="${d}"/>`;
    case 'unihorn': return `<path d="M44 34 L50 6 L56 34Z" fill="#FFE27A" ${SK} stroke-width="2.6"/><path d="M46 26 l8 -3 M47 18 l6 -2" stroke="${INK}" stroke-width="2"/>`;
    case 'cap': return `<path d="M8 54 C8 26 30 12 50 12 C70 12 92 26 92 54 Q50 62 8 54Z" fill="${c}" ${SK}/><circle cx="30" cy="34" r="6" fill="#fff" opacity=".9"/><circle cx="56" cy="24" r="5" fill="#fff" opacity=".9"/><circle cx="74" cy="40" r="7" fill="#fff" opacity=".9"/>`;
    case 'nightcap': return `<path d="M24 40 C28 18 60 6 82 16 C74 18 70 26 72 38Z" fill="#8FB8FF" ${SK}/><circle cx="84" cy="16" r="6" fill="#fff" ${SK} stroke-width="2.4"/><path d="M22 40 C40 34 60 34 76 38" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M22 40 C40 34 60 34 76 38" fill="none" stroke="${INK}" stroke-width="1.6" opacity=".5"/>`;
    case 'cape': return `<path d="M24 74 C30 82 70 82 76 74 L84 92 C60 98 40 98 16 92Z" fill="#E2483D" ${SK} stroke-width="2.6"/>`;
    case 'sparkles': return `<path d="M82 22 l2.4 -6 2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4z" fill="#fff" stroke="${INK}" stroke-width="1.6"/><path d="M14 30 l1.6 -4 1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6z" fill="#fff" stroke="${INK}" stroke-width="1.4"/>`;
    default: return '';
  }
}
/* 머리 장식 */
function acc(a){
  switch(a){
    case 'bow': return `<path d="M50 30 L33 21 L33 39 Z M50 30 L67 21 L67 39 Z" fill="#FF8FB1" ${SK} stroke-width="2.6"/><circle cx="50" cy="30" r="5" fill="#FF6F98" ${SK} stroke-width="2.4"/>`;
    case 'flower': return `<g transform="translate(70 30)">${[0,72,144,216,288].map(r=>`<circle cx="0" cy="-6" r="5" fill="#fff" ${SK} stroke-width="2" transform="rotate(${r})"/>`).join('')}<circle r="4" fill="#FFD23F" ${SK} stroke-width="2"/></g>`;
    case 'crown': return `<path d="M33 34 L36 16 L44 26 L50 12 L56 26 L64 16 L67 34 Z" fill="#FFD23F" ${SK}/><circle cx="50" cy="25" r="2.8" fill="#FF6F6F"/>`;
    case 'beanie': return `<path d="M24 44 C24 18 76 18 76 44 Z" fill="#FF9F7A" ${SK}/><path d="M22 44 h56" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M22 44 h56" stroke="#FFD6C4" stroke-width="3.6" stroke-linecap="round"/><circle cx="50" cy="16" r="6" fill="#fff" ${SK} stroke-width="2.4"/>`;
    case 'glasses': return `<g fill="rgba(255,255,255,.35)" stroke="${INK}" stroke-width="2.6"><circle cx="38" cy="64" r="9"/><circle cx="62" cy="64" r="9"/><path d="M47 64 h6" fill="none"/></g>`;
    case 'phones': return `<path d="M18 62 C18 30 82 30 82 62" fill="none" stroke="${INK}" stroke-width="4"/><rect x="10" y="56" width="12" height="18" rx="5" fill="#8FB8FF" ${SK} stroke-width="2.6"/><rect x="78" y="56" width="12" height="18" rx="5" fill="#8FB8FF" ${SK} stroke-width="2.6"/>`;
    case 'party': return `<path d="M40 34 L54 6 L62 32Z" fill="#B8D8FF" ${SK} stroke-width="2.6"/><path d="M45 25 l12 3 M49 16 l8 2" stroke="#FF8FB1" stroke-width="3"/><circle cx="54" cy="6" r="4" fill="#FFE27A" ${SK} stroke-width="2"/>`;
    case 'leaf': return `<path d="M50 32 C42 16 56 10 64 16 C60 22 58 28 50 32Z" fill="#8FD16A" ${SK} stroke-width="2.6"/>`;
    default: return '';
  }
}
/* 종류: 몸 모양 + 부위 + 기본 색 */
const SPECIES={
  mallang:{ko:'말랑이',shape:'mochi',parts:[],col:'#F5E2A6'},
  nyang:{ko:'냥냥이',shape:'round',parts:['cat'],col:'#F2C9D3'},
  torong:{ko:'토롱이',shape:'round',parts:['bunny'],col:'#FFFFFF'},
  gom:{ko:'곰실이',shape:'round',parts:['bear'],col:'#F2D3BE'},
  ssak:{ko:'새싹이',shape:'drop',parts:['sprout'],col:'#D8E7BF'},
  bbul:{ko:'뿔뿔이',shape:'round',parts:['horns','spots'],col:'#DAD1EE'},
  biyong:{ko:'삐용이',shape:'mochi',parts:['antenna'],col:'#C2DFDF'},
  dungsil:{ko:'둥실이',shape:'cloud',parts:[],col:'#FFFFFF'},
  mong:{ko:'몽글이',shape:'ghost',parts:[],col:'#CADAEE'},
  kong:{ko:'콩콩이',shape:'bean',parts:['belly'],col:'#C3E3D4'},
  byeol:{ko:'별똥이',shape:'star',parts:[],col:'#F4EBCC'},
  bogeul:{ko:'뽀글이',shape:'round',parts:['curls'],col:'#F1DCE5'},
  kkori:{ko:'꼬리펑',shape:'round',parts:['fox','belly'],col:'#F2D3BE'},
  nalgae:{ko:'날개짱',shape:'drop',parts:['wings'],col:'#F1DCE5'},
  bungbung:{ko:'붕붕이',shape:'round',parts:['bee','stripes','antenna2'],col:'#F5E2A6'},
  haepa:{ko:'해파링',shape:'jelly',parts:['jelly'],col:'#D0C8E8'},
  beoseot:{ko:'버섯돌이',shape:'mushroom',parts:['cap'],col:'#F2C9D3'},
  oenun:{ko:'외눈이',shape:'mochi',parts:['horns'],col:'#C3E3D4',eyes:'cyclops'},
  peng:{ko:'펭글이',shape:'tall',parts:['flippers','belly'],col:'#CADAEE'},
  dinoppi:{ko:'공룡삐',shape:'round',parts:['spikes','spots'],col:'#D8E7BF'},
};
const HIDDEN={
  uni:{ko:'무지개 유니콘',shape:'round',parts:['mane','unihorn'],col:'#FFFFFF',how:'30일 연속 공부',hint:'갈기가 무지개색이에요'},
  devil:{ko:'꼬마 악마',shape:'round',parts:['tail','devil'],col:'#F2C9D3',mouth:'fang',how:'밤 11시 이후에 공부하기',hint:'장난은 치지만 착해요'},
  angel:{ko:'꼬마 천사',shape:'drop',parts:['wings','halo'],col:'#FFFFFF',eyes:'happy',how:'100일 연속 공부',hint:'날개는 있는데 날진 못해요'},
  gold:{ko:'황금 말랑이',shape:'mochi',parts:['sparkles'],col:'#FFC93C',eyes:'star',how:'단어 1,000개 완벽히 익히기',hint:'만지면 반짝반짝'},
  alien:{ko:'외계인 삐삐',shape:'round',parts:['antenna2'],col:'#CFE8BE',eyes:'three',how:'알 깰 때 아주 가끔',hint:'눈이 세 개라 단어도 세 배로 봐요'},
  king:{ko:'왕관 냥',shape:'round',parts:['cat','cape'],col:'#F5E2A6',acc:'crown',how:'단어 200개 완벽히 익히기',hint:'자기가 마을 주인인 줄 알아요'},
  rainjelly:{ko:'무지개 해파링',shape:'jelly',parts:['jelly'],col:'#F1DCE5',rainbow:true,how:'퀴즈 만점 10번',hint:'바다에서 온 반짝이'},
  sleepy:{ko:'잠꾸러기',shape:'mochi',parts:['nightcap'],col:'#DAD1EE',eyes:'sleep',mouth:'o',how:'7일 연속 공부',hint:'늘 자고 있지만 꿈에서 공부해요'},
};
const ALL_SP={...SPECIES,...HIDDEN};
/* 그리기: spec = {sp, col, eyes, mouth, cheek, acc} */
function creature(spec,opt){
  opt=opt||{};
  const s=ALL_SP[spec.sp]||SPECIES.mallang, c=spec.col||s.col, sh=SHAPES[s.shape];
  const f={eyes:opt.sleep?'sleep':(s.eyes||spec.eyes),mouth:opt.sleep?'o':(s.mouth||spec.mouth),cheek:spec.cheek};
  const d=shade(c,-.14);
  const feetY=s.shape==='jelly'?null:94;
  const feet=feetY&&!['ghost','cloud','star'].includes(s.shape)?`<ellipse cx="36" cy="${feetY}" rx="9" ry="5" fill="${d}" ${SK} stroke-width="2.8"/><ellipse cx="64" cy="${feetY}" rx="9" ry="5" fill="${d}" ${SK} stroke-width="2.8"/>`:'';
  const arms=['round','mochi','bean','drop'].includes(s.shape)&&!s.parts.includes('wings')&&!s.parts.includes('flippers')?`<ellipse cx="13" cy="72" rx="5.5" ry="7.5" fill="${c}" ${SK} stroke-width="2.8" transform="rotate(-30 13 72)"/><ellipse cx="87" cy="72" rx="5.5" ry="7.5" fill="${c}" ${SK} stroke-width="2.8" transform="rotate(30 87 72)"/>`:'';
  let fill=c, defs='';
  if(s.rainbow){ defs=`<defs><linearGradient id="rb${spec.sp}" x1="0" y1="0" x2="1" y2="0">${['#FFB3C7','#FFD8A8','#FFF3A8','#C6F0B8','#B8DCFF','#D6C4FF'].map((k,i)=>`<stop offset="${i/5}" stop-color="${k}"/>`).join('')}</linearGradient></defs>`; fill=`url(#rb${spec.sp})`; }
  if(spec.sp==='gold'){ defs=`<defs><radialGradient id="gd" cx=".35" cy=".3"><stop offset="0" stop-color="#FFF6B8"/><stop offset="1" stop-color="#F2A81C"/></radialGradient></defs>`; fill='url(#gd)'; }
  const back=s.parts.map(p=>partBack(p,c)).join('');
  const front=s.parts.map(p=>partFront(p,c,s.shape)).join('');
  const body=`<path d="${sh[0]}" fill="${fill}" ${SK}/>`;
  const shine=s.shape==='mushroom'?'':`<ellipse cx="30" cy="${sh[1]-16}" rx="4.5" ry="7" fill="#fff" opacity=".75" transform="rotate(28 30 ${sh[1]-16})"/><circle cx="35" cy="${sh[1]-7}" r="1.8" fill="#fff" opacity=".75"/>`;
  const capBack=s.shape==='mushroom'?'':'';
  const a=acc(s.acc||spec.acc);
  return `<svg viewBox="-8 -14 116 116" aria-hidden="true">${defs}<g class="bob">${back}${feet}${arms}${body}${s.shape==='mushroom'?front:''}${s.shape!=='mushroom'?front:''}${shine}${face(50,sh[1],f,sh[2])}${a}${opt.sleep?'':''}</g></svg>`;
}
const FACES=[['oval','cat'],['sparkle','smile'],['happy','open'],['wink','tongue'],['dot','o'],['oval','fang'],['tiny','wave'],['sparkle','cat']];
