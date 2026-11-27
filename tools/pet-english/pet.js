const PI = '#5A4636', PPINK = '#FFB3C4';
const PS = `stroke="${PI}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"`;
const pE = (cx, cy, rx, ry, f, s = PS, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${s}${x}/>`;
const pC = (cx, cy, r, f, s = PS, x = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${s}${x}/>`;
const pP = (d, f = 'none', s = PS, x = '') => `<path d="${d}" fill="${f}" ${s}${x}/>`;
const NS = 'stroke="none"';
const mir = s => `<g transform="translate(240 0) scale(-1 1)">${s}</g>`;
const both = s => s + mir(s);

const fluff = (pts, f) => pts.map(([x, y, r]) => pC(x, y, r, f)).join('') + pts.map(([x, y, r]) => pC(x, y, r - 2.2, f, NS)).join('');

const PETS = {
  dog: { name: '강아지', vars: [
    { id: 'malt', name: '하얀 몰티즈', base: '#FFFFFF', sub: '#FFFFFF', ear: '#F6EEE6', kind: 'floppy', top: 'tuft' },
    { id: 'poodle', name: '갈색 푸들', base: '#CF9A6B', sub: '#DDB088', ear: '#B97F50', kind: 'poodle' },
    { id: 'shiba', name: '시바', base: '#F4AC62', sub: '#FFF3E0', ear: '#F4AC62', kind: 'pointy', pat: 'shiba' },
    { id: 'beagle', name: '비글', base: '#FFFFFF', sub: '#FFFFFF', ear: '#8E5E3C', kind: 'floppy', pat: 'beagle', p1: '#C98A54' },
    { id: 'chi', name: '치와와', base: '#EFC08A', sub: '#FFF3DF', ear: '#EFC08A', kind: 'pointy' },
    { id: 'pug', name: '퍼그', base: '#EBCB9E', sub: '#F8E8CF', ear: '#6B5548', kind: 'floppy' },
  ] },
  cat: { name: '고양이', vars: [
    { id: 'cheese', name: '치즈', base: '#FABB6E', sub: '#FFF4E3', ear: '#FABB6E', pat: 'tabby', p1: '#E8923E' },
    { id: 'gray', name: '고등어', base: '#B9C0CA', sub: '#F4F6F8', ear: '#B9C0CA', pat: 'tabby', p1: '#858E9B' },
    { id: 'tux', name: '턱시도', base: '#5B5661', sub: '#FFFFFF', ear: '#5B5661', pat: 'tux' },
    { id: 'calico', name: '삼색이', base: '#FFFFFF', sub: '#FFFFFF', ear: '#F4AC62', ear2: '#6A6169', pat: 'calico', p1: '#F4AC62', p2: '#6A6169' },
    { id: 'siam', name: '샴', base: '#F7EBD9', sub: '#FFF8EC', ear: '#7A5C4D' },
    { id: 'persian', name: '페르시안', base: '#FFFFFF', sub: '#FFFFFF', ear: '#FFFFFF' },
  ] },
  rabbit: { name: '토끼', vars: [
    { id: 'white', name: '하얀 토끼', base: '#FFFFFF', sub: '#FFFFFF', ear: '#FFFFFF', kind: 'up' },
    { id: 'lop', name: '갈색 롭이어', base: '#DDB083', sub: '#F7E6D0', ear: '#C99A6A', kind: 'lop' },
    { id: 'grayr', name: '회색 토끼', base: '#C3C7D0', sub: '#F3F4F7', ear: '#C3C7D0', kind: 'up' },
    { id: 'dutch', name: '얼룩 토끼', base: '#FFFFFF', sub: '#FFFFFF', ear: '#7A6860', kind: 'up', pat: 'dutch', p1: '#7A6860' },
    { id: 'lion', name: '라이언헤드', base: '#EDC197', sub: '#FFF3DF', ear: '#EDC197', kind: 'up' },
    { id: 'blackr', name: '까만 토끼', base: '#5A545F', sub: '#FFFFFF', ear: '#5A545F', kind: 'up' },
  ] },
};
const PET_NAMES = ['코코', '보리', '초코', '콩이', '두부', '모카', '호두', '구름', '솜이', '라떼', '까미', '뭉치', '별이', '달이', '망고', '치즈', '나비', '레오', '루비', '밤이', '사랑이', '해피', '토리', '감자', '우유', '쿠키', '하늘', '봄이', '자두', '땅콩'];

let _pid = 0;

function petSVG(sp, vi, mood = 'normal', wear = {}) {
  const V = PETS[sp].vars[vi], id = 'pc' + (++_pid), B = V.base, dark = sp === 'cat' && V.pat === 'tux';
  let o = `<svg viewBox="0 -34 240 274" class="pet pet-${mood}"><defs><clipPath id="${id}h"><ellipse cx="120" cy="102" rx="70" ry="58"/></clipPath><clipPath id="${id}b"><ellipse cx="120" cy="182" rx="46" ry="38"/></clipPath></defs>`;
  o += `<ellipse cx="120" cy="222" rx="74" ry="9" fill="rgba(90,70,54,.14)"/>`;

  if (sp === 'dog') o += V.kind === 'pointy'
    ? `<g class="pet-tail">${pC(170, 170, 17, B)}${pP('M170 160 Q180 164 176 174 Q172 180 166 176', 'none')}</g>`
    : `<g class="pet-tail">${pP('M158 196 Q198 192 194 158 Q192 146 182 151 Q186 178 156 180 Z', V.kind === 'poodle' ? V.ear : B)}${V.kind === 'poodle' ? fluff([[190, 150, 12]], V.ear) : ''}</g>`;
  if (sp === 'cat') o += `<g class="pet-tail">${pP('M156 204 Q208 210 204 166 Q202 148 189 152 Q193 188 154 188 Z', V.pat === 'calico' ? V.p2 : B)}</g>`;
  if (sp === 'rabbit') o += fluff([[172, 198, 13]], '#FFFFFF');

  if (sp === 'cat') {
    const ear = (c) => pP('M54 78 L50 24 Q52 14 61 20 L104 54 Z', c) + pP('M64 64 L62 36 L86 54 Z', PPINK, NS);
    o += ear(V.ear) + mir(ear(V.ear2 || V.ear));
  }
  if (sp === 'dog' && V.kind === 'pointy') o += both(pP('M60 74 L62 26 Q64 18 72 23 L106 52 Z', V.ear) + pP('M70 62 L70 38 L90 54 Z', V.sub, NS));
  if (sp === 'rabbit' && V.kind === 'up') o += both(`<g transform="rotate(-9 98 60)">${pE(98, 30, 16, 46, V.ear)}${pE(98, 34, 7.5, 32, PPINK, NS)}</g>`);

  o += pE(120, 182, 46, 38, B);
  if (V.pat === 'calico') o += `<g clip-path="url(#${id}b)">${pE(158, 168, 26, 24, V.p1, NS)}${pE(84, 204, 22, 18, V.p2, NS)}</g>`;
  if (V.pat === 'dutch') o += `<g clip-path="url(#${id}b)"><rect x="60" y="186" width="120" height="50" fill="${V.p1}"/></g>`;
  if (V.sub !== B || V.pat === 'tux') o += pE(120, 190, 27, 26, V.sub, NS);
  o += pE(120, 182, 46, 38, 'none');

  const paw = dark || V.pat === 'tux' ? '#FFFFFF' : (V.pat === 'dutch' ? '#FFFFFF' : B);
  o += both(pE(86, 214, 19, 10, paw));
  o += both(pE(106, 208, 11.5, 14, paw));

  o += pE(120, 102, 70, 58, B);
  let pat = '';
  if (V.pat === 'beagle') pat += both(pE(66, 82, 44, 52, V.p1, NS));
  if (V.pat === 'calico') pat += pE(72, 66, 44, 38, V.p1, NS) + pE(172, 70, 36, 36, V.p2, NS);
  if (V.pat === 'dutch') pat += both(pE(78, 98, 36, 48, V.p1, NS));
  if (V.pat === 'shiba') pat += pE(120, 138, 56, 36, V.sub, NS) + both(pC(96, 86, 5, V.sub, NS));
  if (V.pat === 'tux') pat += pP('M120 78 Q132 104 150 122 Q150 160 120 162 Q90 160 90 122 Q108 104 120 78 Z', '#FFFFFF', NS);
  if (V.pat === 'tabby') pat += pP('M108 46 L110 64 M120 43 L120 62 M132 46 L130 64', 'none', `stroke="${V.p1}" stroke-width="6.5" stroke-linecap="round"`) + both(pP('M50 100 L66 103 M52 116 L66 115', 'none', `stroke="${V.p1}" stroke-width="6" stroke-linecap="round"`));
  if (pat) o += `<g clip-path="url(#${id}h)">${pat}</g>` + pE(120, 102, 70, 58, 'none');

  if (sp === 'dog' && V.pat !== 'shiba') o += pE(120, 128, 25, 18, V.kind === 'poodle' ? V.sub : '#FFFFFF', NS);
  if (sp === 'cat' && V.pat === 'tabby') o += pE(120, 130, 22, 15, V.sub, NS);

  if (sp === 'dog' && V.kind === 'floppy') o += both(pP('M68 58 Q32 56 32 104 Q32 140 56 138 Q76 134 76 94 Z', V.ear));
  if (sp === 'dog' && V.kind === 'poodle') o += both(fluff([[50, 100, 21], [44, 124, 17], [60, 128, 15]], V.ear)) + fluff([[96, 52, 20], [120, 44, 24], [144, 52, 20]], V.ear);
  if (sp === 'dog' && V.top === 'tuft') o += fluff([[108, 50, 13], [124, 46, 15], [138, 52, 11]], '#FFFFFF');
  if (sp === 'rabbit' && V.kind === 'lop') o += both(pP('M70 56 Q30 52 28 112 Q28 156 50 156 Q72 152 74 100 Z', V.ear) + pP('M60 76 Q42 82 42 118 Q44 140 52 140 Q62 136 62 102 Z', PPINK, NS, ' opacity=".7"'));

  if (wear.neck) o += wearNeck(wear.neck[0], wear.neck[1]);

  const ex = sp === 'cat' ? 28 : 26, ey = 108, EYE = '#3B2E28';
  o += both(pE(120 - ex - 22, ey + 19, 12, 7.5, '#FF9FB2', NS, ' opacity=".6"'));
  if (mood === 'happy' || mood === 'eat') o += both(pP(`M${120 - ex - 9} ${ey + 3} Q${120 - ex} ${ey - 10} ${120 - ex + 9} ${ey + 3}`, 'none', `stroke="${dark ? '#FFFFFF' : EYE}" stroke-width="5" stroke-linecap="round"`));
  else if (mood === 'sleep') o += both(pP(`M${120 - ex - 9} ${ey - 2} Q${120 - ex} ${ey + 8} ${120 - ex + 9} ${ey - 2}`, 'none', `stroke="${dark ? '#FFFFFF' : EYE}" stroke-width="5" stroke-linecap="round"`));
  else o += `<g class="pet-eyes">${[120 - ex, 120 + ex].map(x => (dark ? pE(x, ey, 11, 13, '#FFFFFF', NS) : '') + pE(x, ey, 9, 11, EYE, NS) + pC(x - 3, ey - 4, 3.6, '#FFFFFF', NS) + pC(x + 3.5, ey + 4, 1.8, '#FFFFFF', NS)).join('')}</g>`;
  const MS = `stroke="${PI}" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"`;
  if (sp === 'dog') {
    o += pE(120, 119, 8.5, 6.5, '#3B2E28', NS) + pE(117.5, 117, 2.6, 1.6, '#FFFFFF', NS, ' opacity=".7"');
    if (mood === 'happy') o += pP('M110 127 Q120 146 130 127 Z', '#E8607A', MS) + pP('M110 127 Q115 134 120 127 Q125 134 130 127', 'none', MS);
    else if (mood === 'eat') o += `<g class="pet-chew">${pE(120, 132, 8, 6, '#E8607A', MS)}</g>`;
    else o += pP('M110 127 Q115 135 120 127 Q125 135 130 127', 'none', MS);
  } else if (sp === 'cat') {
    o += pP('M115 117 L125 117 L120 123 Z', '#FF8FA5', `stroke="${PI}" stroke-width="2.5" stroke-linejoin="round"`);
    if (mood === 'happy') o += pP('M112 127 Q120 142 128 127 Z', '#E8607A', MS) + pP('M112 127 Q116 133 120 126 Q124 133 128 127', 'none', MS);
    else if (mood === 'eat') o += `<g class="pet-chew">${pE(120, 131, 7, 5.5, '#E8607A', MS)}</g>`;
    else o += pP('M112 127 Q116 133 120 126 Q124 133 128 127', 'none', MS);
    o += both(pP('M66 122 L46 118 M66 130 L48 134', 'none', `stroke="${dark ? '#FFFFFF' : PI}" stroke-width="2.6" stroke-linecap="round" opacity=".7"`));
  } else {
    o += pP('M115 116 Q120 113 125 116 L120 122 Z', '#FF8FA5', `stroke="${PI}" stroke-width="2.5" stroke-linejoin="round"`);
    if (mood === 'happy') o += pP('M113 129 Q120 142 127 129 Z', '#E8607A', MS) + pP('M120 122 L120 127 M113 129 Q117 133 120 127 Q123 133 127 129', 'none', MS);
    else if (mood === 'eat') o += `<g class="pet-chew">${pE(120, 131, 6.5, 5, '#E8607A', MS)}</g>`;
    else o += pP('M120 122 L120 127 M113 129 Q117 133 120 127 Q123 133 127 129', 'none', MS);
  }
  if (mood === 'sleep') o += `<g class="pet-zzz" fill="none" stroke="#8FA3D9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M176 60 h12 l-12 12 h12"/><path d="M196 38 h9 l-9 9 h9"/></g>`;
  if (wear.face) o += wearFace(wear.face[0], wear.face[1], ex, ey);
  if (wear.head) o += wearHead(wear.head[0], wear.head[1], sp, V);
  return o + '</svg>';
}

const ITEMS = [
  { id: 'ribbon', name: '리본', cat: 'acc', slot: 'head', c: ['#FF8FB1', '#FFD0DE'], c2: ['#7C8CF8', '#FFFFFF'] },
  { id: 'flower', name: '꽃핀', cat: 'acc', slot: 'head', c: ['#FFFFFF', '#FFD84D'], c2: ['#FF9DC0', '#FFE66B'] },
  { id: 'hat', name: '고깔모자', cat: 'acc', slot: 'head', c: ['#7CC6F7', '#FFFFFF'], c2: ['#B58CF2', '#FFE66B'] },
  { id: 'collar', name: '방울 목걸이', cat: 'acc', slot: 'neck', c: ['#F2647A', '#FFD84D'], c2: ['#4FC3B4', '#FFE66B'] },
  { id: 'scarf', name: '목도리', cat: 'acc', slot: 'neck', c: ['#F28C4B', '#FFE1C2'], c2: ['#5FA8F2', '#FFFFFF'] },
  { id: 'glasses', name: '안경', cat: 'acc', slot: 'face', c: ['#5A4636', '#E9F6FF'], c2: ['#F2647A', '#FFE3EA'] },
  { id: 'cookie', name: '쿠키', cat: 'snack', c: ['#E7B273', '#8A5A3C'], c2: ['#F7C6D6', '#FF6B8E'] },
  { id: 'cupcake', name: '컵케이크', cat: 'snack', c: ['#FFC2D4', '#F2647A'], c2: ['#BFE3FF', '#7C8CF8'] },
  { id: 'donut', name: '도넛', cat: 'snack', c: ['#F7A8C8', '#E7B273'], c2: ['#8FD9C8', '#E7B273'] },
  { id: 'berry', name: '딸기', cat: 'snack', c: ['#F2556A', '#6CC36A'], c2: ['#FF9DC0', '#6CC36A'] },
  { id: 'milk', name: '우유', cat: 'snack', c: ['#FFFFFF', '#7CC6F7'], c2: ['#FFE1EA', '#F2647A'] },
  { id: 'ball', name: '공', cat: 'toy', c: ['#7CC6F7', '#FFFFFF'], c2: ['#F2647A', '#FFE66B'] },
  { id: 'yarn', name: '털실', cat: 'toy', c: ['#F7A8C8', '#F27FA6'], c2: ['#9CD98B', '#5FB24E'] },
  { id: 'duck', name: '삑삑 오리', cat: 'toy', c: ['#FFE066', '#F28C4B'], c2: ['#BFE3FF', '#F28C4B'] },
  { id: 'plush', name: '곰 인형', cat: 'toy', c: ['#D7A679', '#F7E6D0'], c2: ['#F7A8C8', '#FFFFFF'] },
  { id: 'wand', name: '깃털 낚싯대', cat: 'toy', c: ['#B58CF2', '#F2647A'], c2: ['#4FC3B4', '#FFD84D'] },
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));
const TIER_NAME = ['', '', '반짝 ', '황금 '];
const itemName = (id, t) => TIER_NAME[t] + ITEM[id].name;
const itemCol = (id, t) => !ITEM[id] ? ['', ''] : t >= 3 ? ['#FFD24A', '#FFF3B0'] : t === 2 ? ITEM[id].c2 : ITEM[id].c;
const IS = `stroke="${PI}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
const iP = (d, f = 'none', s = IS, x = '') => `<path d="${d}" fill="${f}" ${s}${x}/>`;
const iC = (cx, cy, r, f, s = IS) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${f}" ${s}/>`;
const iE = (cx, cy, rx, ry, f, s = IS, x = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${s}${x}/>`;
const spk = (x, y, s, c = '#FFFFFF') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -10 Q1.5 -1.5 10 0 Q1.5 1.5 0 10 Q-1.5 1.5 -10 0 Q-1.5 -1.5 0 -10 Z" fill="${c}" stroke="${PI}" stroke-width="${1.6 / s}" stroke-linejoin="round"/>`;
const dots = (pts, c) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${c}"/>`).join('');

function itemArt(id, t) {
  const [a, b] = itemCol(id, t), p = t >= 2;
  switch (id) {
    case 'ribbon': return iP('M0 0 Q-34 -30 -38 -4 Q-40 22 0 0 Z', a) + iP('M0 0 Q34 -30 38 -4 Q40 22 0 0 Z', a) + iP('M-6 6 L-16 34 L-4 26 Z', a) + iP('M6 6 L16 34 L4 26 Z', a) + (p ? dots([[-24, -8], [-16, 4], [24, -8], [16, 4]], b) : '') + iC(0, 0, 9, b);
    case 'flower': return [0, 72, 144, 216, 288].map(r => `<g transform="rotate(${r})">${iE(0, -20, 12, 16, a)}</g>`).join('') + iC(0, 0, 11, b) + (p ? iC(0, 0, 4, '#FF8FB1', 'stroke="none"') : '');
    case 'hat': return iP('M-28 30 L0 -34 L28 30 Z', a) + iP('M-17 4 L17 4 M-23 18 L23 18', 'none', `stroke="${b}" stroke-width="6" stroke-linecap="round"`) + iP('M-28 30 L0 -34 L28 30 Z') + iC(0, -36, 9, b) + (p ? dots([[-6, -10], [6, -10], [0, 26]], '#FF8FB1') : '');
    case 'collar': return iP('M-34 -12 Q0 22 34 -12', 'none', `stroke="${PI}" stroke-width="17" stroke-linecap="round"`) + iP('M-34 -12 Q0 22 34 -12', 'none', `stroke="${a}" stroke-width="9" stroke-linecap="round"`) + iC(0, 20, 13, b) + iP('M-9 22 L9 22 M0 22 L0 30', 'none', `stroke="${PI}" stroke-width="3" stroke-linecap="round"`) + (p ? dots([[-22, -3], [22, -3]], '#FFFFFF') : '');
    case 'scarf': return iP('M-36 -14 Q0 10 36 -14 L36 4 Q0 30 -36 4 Z', a) + iP('M12 12 L22 40 L38 34 L28 8 Z', a) + iP('M-22 -2 L-22 12 M-6 4 L-6 18 M10 2 L10 16', 'none', `stroke="${b}" stroke-width="5" stroke-linecap="round"`) + (p ? iP('M24 36 L20 44 M30 34 L30 43 M35 32 L38 40', 'none', `stroke="${PI}" stroke-width="2.5" stroke-linecap="round"`) : '');
    case 'glasses': return iC(-20, 0, 17, b, `stroke="${a}" stroke-width="6"`) + iC(20, 0, 17, b, `stroke="${a}" stroke-width="6"`) + iP('M-4 -2 Q0 -7 4 -2 M-36 -4 L-44 -10 M36 -4 L44 -10', 'none', `stroke="${a}" stroke-width="5" stroke-linecap="round"`) + iP('M-27 -6 L-19 -12 M13 -6 L21 -12', 'none', 'stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"') + (p ? spk(34, -18, .5, '#FFE66B') : '');
    case 'cookie': return iC(0, 0, 32, a) + [[-12, -10], [10, -14], [14, 8], [-8, 14], [0, 0]].map(([x, y]) => iC(x, y, 5, b, 'stroke="none"')).join('') + (p ? iP('M-20 -22 Q0 -34 20 -22', 'none', 'stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"') : '');
    case 'cupcake': return iP('M-24 4 L24 4 L18 34 L-18 34 Z', '#F7DDB4') + iP('M-12 6 L-9 32 M0 6 L0 32 M12 6 L9 32', 'none', `stroke="${PI}" stroke-width="2.5" opacity=".5"`) + iP('M-28 6 Q-34 -12 -16 -14 Q-14 -30 2 -28 Q20 -32 20 -14 Q36 -10 28 6 Z', a) + iC(2, -30, 7, b) + (p ? dots([[-14, -4], [0, -12], [14, -2], [-2, 0]], '#FFFFFF') : '');
    case 'donut': return iC(0, 0, 33, b) + iP('M-28 -6 Q-30 -30 0 -30 Q30 -30 28 -6 Q24 4 16 -2 Q8 8 0 0 Q-8 10 -16 0 Q-24 6 -28 -6 Z', a) + iC(0, 0, 10, '#FFF8EC') + [[-14, -16, 30], [8, -20, -20], [18, -8, 60], [-2, -22, 80]].map(([x, y, r]) => `<rect x="${x}" y="${y}" width="8" height="3.5" rx="1.7" fill="${p ? '#FFE66B' : '#FFFFFF'}" transform="rotate(${r} ${x} ${y})"/>`).join('');
    case 'berry': return iP('M0 34 Q-34 6 -24 -16 Q-12 -30 0 -18 Q12 -30 24 -16 Q34 6 0 34 Z', a) + [[-10, -4], [8, -6], [0, 8], [-12, 10], [12, 8], [0, 22]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.8" ry="3" fill="#FFF3B0"/>`).join('') + iP('M-16 -20 L-4 -16 L0 -30 L4 -16 L16 -20 L6 -10 Q0 -6 -6 -10 Z', b, `stroke="${PI}" stroke-width="3" stroke-linejoin="round"`) + (p ? iP('M-18 -2 Q-22 8 -14 18', 'none', 'stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" opacity=".7"') : '');
    case 'milk': return iP('M-18 -12 L-10 -30 L10 -30 L18 -12 L18 34 L-18 34 Z', a) + iP('M-10 -30 L10 -30 L10 -38 L-10 -38 Z', b) + iP('M-18 2 L18 2 L18 22 L-18 22 Z', b, 'stroke="none"') + iP('M-18 -12 L18 -12', 'none') + iP('M-18 -12 L-10 -30 L10 -30 L18 -12 L18 34 L-18 34 Z') + (p ? iP('M0 6 Q-7 0 -7 8 Q-7 14 0 19 Q7 14 7 8 Q7 0 0 6 Z', '#FFFFFF', 'stroke="none"') : '');
    case 'ball': return iC(0, 0, 32, a) + iP('M-32 0 Q0 -16 32 0 M-32 0 Q0 16 32 0', 'none', `stroke="${b}" stroke-width="7"`) + iC(0, 0, 32, 'none') + (p ? spk(-12, -16, .7, '#FFFFFF') : iE(-12, -14, 7, 5, '#FFFFFF', 'stroke="none"', ' opacity=".7"'));
    case 'yarn': return iP('M22 22 Q38 34 30 40 Q22 44 14 36', 'none', `stroke="${b}" stroke-width="5" stroke-linecap="round"`) + iC(0, 0, 31, a) + iP('M-26 -14 Q0 -30 26 -12 M-30 2 Q0 -14 30 4 M-26 16 Q0 2 24 20 M-14 -26 Q-22 0 -10 28 M6 -30 Q0 0 12 28', 'none', `stroke="${b}" stroke-width="3.5" stroke-linecap="round"`) + (p ? spk(18, -22, .6, '#FFFFFF') : '');
    case 'duck': return iE(0, 12, 32, 22, a) + iC(-12, -14, 18, a) + iP('M-28 -14 L-42 -10 L-28 -5 Z', b) + iC(-16, -18, 3, PI, 'stroke="none"') + iP('M2 8 Q16 0 26 12', 'none', `stroke="${PI}" stroke-width="3.5" stroke-linecap="round"`) + (p ? iP('M-22 -32 L-18 -40 L-12 -34 L-6 -40 L-2 -32 Z', '#FFD24A', `stroke="${PI}" stroke-width="2.5" stroke-linejoin="round"`) : '');
    case 'plush': return iC(-20, -24, 9, a) + iC(20, -24, 9, a) + iE(0, 16, 22, 20, a) + iE(0, 20, 11, 11, b, 'stroke="none"') + iC(0, -10, 24, a) + iE(0, -4, 9, 7, b, 'stroke="none"') + iC(-8, -13, 2.6, PI, 'stroke="none"') + iC(8, -13, 2.6, PI, 'stroke="none"') + iE(0, -6, 3, 2.3, PI, 'stroke="none"') + iE(-22, 14, 7, 9, a) + iE(22, 14, 7, 9, a) + (p ? iP('M0 6 L-9 1 L-9 11 Z M0 6 L9 1 L9 11 Z', '#F2647A', `stroke="${PI}" stroke-width="2.2" stroke-linejoin="round"`) : '');
    case 'wand': return iP('M-34 34 L8 -8', 'none', `stroke="${PI}" stroke-width="9" stroke-linecap="round"`) + iP('M-34 34 L8 -8', 'none', 'stroke="#E9C48A" stroke-width="4.5" stroke-linecap="round"') + iP('M8 -8 Q22 -14 26 -24', 'none', `stroke="${PI}" stroke-width="2.5"`) + iP('M26 -24 Q14 -40 30 -42 Q44 -40 34 -20 Z', a) + iP('M26 -24 Q40 -30 44 -14 Q42 -4 28 -14 Z', b) + (p ? spk(40, -40, .6, '#FFE66B') : '');

    case 'bone': return iP('M-22 -6 Q-36 -18 -38 -4 Q-44 4 -34 8 Q-30 18 -20 8 L20 8 Q30 18 34 8 Q44 4 38 -4 Q36 -18 22 -6 Z', '#FFF8EC');
    case 'fish': return iP('M-30 0 Q-10 -22 16 -8 L34 -18 L34 18 L16 8 Q-10 22 -30 0 Z', '#9ED3F5') + iC(-16, -3, 3, PI, 'stroke="none"') + iP('M-4 -8 Q2 0 -4 8', 'none', `stroke="${PI}" stroke-width="3" stroke-linecap="round"`);
    case 'carrot': return iP('M-6 -14 Q-16 -34 -4 -32 Q0 -44 6 -32 Q18 -34 8 -14 Z', '#6CC36A') + iP('M-16 -12 Q0 -24 16 -12 Q12 22 0 40 Q-12 22 -16 -12 Z', '#F5913A') + iP('M-8 0 L2 2 M-4 14 L6 16', 'none', `stroke="${PI}" stroke-width="2.6" stroke-linecap="round"`);
  }
  return '';
}
function tierDeco(t) {
  if (t === 2) return spk(34, -32, 1) + spk(-36, 30, .7);
  if (t >= 3) return spk(36, -34, 1.1) + spk(-38, -28, .8) + spk(-34, 34, .7) + spk(38, 30, .6);
  return '';
}
function itemSVG(id, t = 1) {
  const glow = t >= 3 ? `<circle cx="0" cy="0" r="46" fill="#FFF3B0" opacity=".9"/><circle cx="0" cy="0" r="46" fill="none" stroke="#FFD24A" stroke-width="3" stroke-dasharray="3 7" stroke-linecap="round"/>` : t === 2 ? `<circle cx="0" cy="0" r="44" fill="#FFFFFF" opacity=".55"/>` : '';
  return `<svg viewBox="-50 -50 100 100" class="item item-t${t}">${glow}${itemArt(id, t)}${tierDeco(t)}</svg>`;
}

function wearHead(id, t, sp, V) {
  const up = sp === 'rabbit' && V.kind === 'up';
  if (id === 'ribbon') return `<g transform="translate(${up ? 120 : 160} ${up ? 64 : 54}) rotate(${up ? 0 : 16}) scale(.56)">${itemArt(id, t)}</g>`;
  if (id === 'flower') return `<g transform="translate(${up ? 68 : 76} ${up ? 70 : 58}) scale(.5)">${itemArt(id, t)}</g>`;
  if (id === 'hat') return `<g transform="translate(120 ${up ? 36 : 28}) scale(${up ? .62 : .72})">${itemArt(id, t)}</g>`;
  return '';
}
function wearNeck(id, t) {
  const [a, b] = itemCol(id, t);
  if (id === 'collar') return pP('M78 150 Q120 178 162 150', 'none', `stroke="${PI}" stroke-width="15" stroke-linecap="round"`) + pP('M78 150 Q120 178 162 150', 'none', `stroke="${a}" stroke-width="7.5" stroke-linecap="round"`) + pC(120, 172, 10, b, `stroke="${PI}" stroke-width="3.5"`) + pP('M114 174 L126 174 M120 174 L120 180', 'none', `stroke="${PI}" stroke-width="2.4" stroke-linecap="round"`);
  if (id === 'scarf') return pP('M150 160 L160 198 L176 192 L166 156 Z', a) + pP('M76 146 Q120 172 164 146 L166 162 Q120 190 74 162 Z', a) + pP('M96 160 L96 172 M112 166 L112 178 M128 166 L128 178 M144 160 L144 172', 'none', `stroke="${b}" stroke-width="4.5" stroke-linecap="round"`);
  return '';
}
function wearFace(id, t, ex, ey) {
  const [a, b] = itemCol(id, t);
  return [120 - ex, 120 + ex].map(x => `<circle cx="${x}" cy="${ey}" r="19" fill="${b}" fill-opacity=".28" stroke="${a}" stroke-width="5"/>`).join('') + pP(`M${120 - ex + 19} ${ey - 2} Q120 ${ey - 9} ${120 + ex - 19} ${ey - 2}`, 'none', `stroke="${a}" stroke-width="4.5" stroke-linecap="round"`) + pP(`M${120 - ex - 13} ${ey - 8} L${120 - ex - 5} ${ey - 14} M${120 + ex - 7} ${ey - 8} L${120 + ex + 1} ${ey - 14}`, 'none', 'stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"');
}

function giftSVG(open = false) {
  return `<svg viewBox="-50 -56 100 110">${open ? '' : ''}<rect x="-36" y="-10" width="72" height="56" rx="8" fill="#FF8FB1" ${IS}/><rect x="-9" y="-10" width="18" height="56" fill="#FFE66B" ${IS}/>
  <g transform="${open ? 'translate(-6 -22) rotate(-18)' : ''}"><rect x="-42" y="-26" width="84" height="20" rx="7" fill="#FFA9C3" ${IS}/><rect x="-10" y="-26" width="20" height="20" fill="#FFE66B" ${IS}/>
  <path d="M0 -26 Q-26 -54 -30 -34 Q-30 -22 0 -26 Z" fill="#FFE66B" ${IS}/><path d="M0 -26 Q26 -54 30 -34 Q30 -22 0 -26 Z" fill="#FFE66B" ${IS}/></g></svg>`;
}

const koJo = (n, a, b) => { const c = n.charCodeAt(n.length - 1); return n + (c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 ? a : b); };
const PRAISE = ['잘했어!', '최고야!', '멋져!', '대단해!'];
const KOFIX = ['누가 할까?', '누구랑 함께할까?', '어떤 친구가 좋아?', '안녕! 만나서 반가워', '이 그림은 뭘까?', '이제 문장으로 말해 봐요', '참 잘했어요!', '이제 친구를 돌봐 주자', '이제 친구들을 돌봐 주자',
  '공부하고 나서 돌봐 주자', '하나 더 주세요', '잘 돌봐 줬어요!', '잘 돌봐 줬어요! 선물이 왔어요', '간식을 끌어서 친구에게 줘요', '물병을 끌어서 물그릇에 부어요', '장난감을 끌어서 흔들어 줘요', '장난감을 이리저리 흔들어 줘요', '친구를 손으로 쓰다듬어 줘요',
  '안녕! 오늘도 공부하러 왔어?', '오늘도 참 잘했어! 내일 또 만나', '조금 쉬었다가 또 하자', '공부하고 나서 만나요!', '어른을 불러 봐!', '선물이 왔어요! 열어 봐요',
  '배고파요, 돌봐 주세요!', '고마워요!', '냠냠, 맛있어!', '기분 좋아!', '또 놀자!', '시원해!', '선물 상자가 왔어요! 눌러서 열어 봐요', '친구 먼저 돌봐 줘요', '이제 다음 친구 차례예요', '먼저 돌봐 줘', '이제 네 차례야'];
const KONAME = [n => `간식을 끌어서 ${n}에게 줘요`, n => `${koJo(n, '을', '를')} 손으로 쓰다듬어 줘요`, n => `이제 ${koJo(n, '을', '를')} 돌봐 주자`, n => `안녕! 나는 ${koJo(n, '이야', '야')}`, n => `${n} 먼저 돌봐 줘요`, n => `이제 ${n} 차례예요`];

function koLines() { const out = PRAISE.concat(KOFIX); PET_NAMES.forEach(n => KONAME.forEach(f => out.push(f(n))));
  ITEMS.forEach(i => { out.push(itemName(i.id, 1) + '!'); out.push('우와! ' + itemName(i.id, 2)); out.push('우와! ' + itemName(i.id, 3)); }); return [...new Set(out)]; }
