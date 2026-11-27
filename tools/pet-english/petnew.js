const BR = '#7A5A48', CRM = '#FFF3DF', ORG = '#F3A55B';
const BV = {
  dog: [
    { c: '#FFFFFF', d: '#C9A98C', ear: 'flop', top: 1, tail: 'pom' },
    { c: '#CF9A6C', d: '#9C6A3C', ear: 'puff', top: 2, tail: 'pom', muz: '#E8C39E', belly: '#E8C39E' },
    { c: ORG, d: '#C4722E', ear: 'point', inner: '#FFD9C2', tail: 'cat', tailC: CRM, belly: CRM, mark: 'shiba' },
    { c: '#FFFFFF', d: '#B08A6A', ear: 'flop', earC: '#B5774A', tail: 'dog', tailC: '#B5774A', mark: 'beagle' },
    { c: '#EFC08A', d: '#B8834A', ear: 'bat', inner: '#FFCFC0', tail: 'dog', belly: CRM, muz: CRM, muzS: 1, big: 1 },
    { c: '#EBCB9E', d: '#B8926A', ear: 'fold', earC: '#6B5548', tail: 'pom', belly: '#F8E8CF', muz: '#8E7566', mark: 'pug' }],
  cat: [
    { c: '#F7B267', d: '#C97A35', ear: 'point', inner: '#FFC9D4', tail: 'cat', belly: '#FFE3BF', mark: 'stripe', sc: '#D98845' },
    { c: '#C3C8D4', d: '#8388A0', ear: 'point', inner: '#FFC9D4', tail: 'cat', belly: '#F1F3F8', mark: 'stripe', sc: '#9197AE' },
    { c: '#57525E', d: '#2E2A33', ear: 'point', inner: '#FFB7C6', tail: 'cat', belly: '#FFFFFF', paw: '#FFFFFF', mark: 'tux', lit: 1 },
    { c: '#FFFFFF', d: '#B08A6A', ear: 'point', earL: ORG, earR: BR, inner: '#FFC9D4', tail: 'cat', tailC: ORG, mark: 'calico' },
    { c: '#F7EBD9', d: '#C9B49A', ear: 'point', earC: '#7A5C4D', inner: '#E9B9B4', tail: 'cat', tailC: '#7A5C4D', paw: '#7A5C4D', belly: '#FFF8EC', mark: 'siam', eye: '#7CC4F2' },
    { c: '#FFFFFF', d: '#C9B8C8', ear: 'point', inner: '#FFC9D4', tail: 'fluff', belly: '#FFFFFF', fluff: 1, eye: '#F2B33D' }],
  rabbit: [
    { c: '#FFFFFF', d: '#D9A9B6', ear: 'up', inner: '#FFC2D2', tail: 'pom' },
    { c: '#F6DDBB', d: '#C49A66', ear: 'lop', inner: '#FFC2D2', tail: 'pom', muz: '#FFFFFF', belly: '#FFFFFF' },
    { c: '#C9CCD6', d: '#8B90A3', ear: 'up', inner: '#FFC2D2', tail: 'pom', tailC: '#FFFFFF', muz: '#FFFFFF', belly: '#FFFFFF' },
    { c: '#FFFFFF', d: '#8A6A58', ear: 'up', earC: BR, inner: '#D9A9A0', tail: 'pom', bodyC: BR, belly: '#FFFFFF', paw: '#FFFFFF', mark: 'dutch' },
    { c: '#EDC197', d: '#B98A5A', ear: 'up', inner: '#FFC2D2', tail: 'pom', tailC: CRM, muz: '#FFFFFF', belly: CRM, mane: '#FBE3C0' },
    { c: '#5A545F', d: '#2E2A33', ear: 'short', inner: '#FFB7C6', tail: 'pom', tailC: '#FFFFFF', muz: '#FFFFFF', belly: '#FFFFFF', lit: 1, eye: '#FFFFFF' }]
};
const m3 = f => f(-1) + f(1);
const HEADP = 'M28 126 Q26 62 100 60 Q174 62 172 126 Q172 178 100 178 Q28 178 28 126 Z';
let _pn = 0;
function petSVG(sp, vi, mood = 'normal', wear = {}) {
  const q = BV[sp][vi], id = 'pn' + (++_pn), ink = '#4A3A32';
  const eC = (s, o) => o || (s < 0 ? q.earL : q.earR) || q.earC || q.c;
  const tail = o => { const tc = o || q.tailC || q.c; return q.tail === 'cat' ? `<path d="M136 214 q34 0 30 -34 q-3 -12 -12 -6" fill="none" stroke="${tc}" stroke-width="${o ? 19 : 14}" stroke-linecap="round"/>` : q.tail === 'dog' ? `<path d="M136 210 q22 -6 20 -28 q-12 -3 -15 10 z" fill="${tc}"/>` : q.tail === 'fluff' ? `<circle cx="146" cy="204" r="17" fill="${tc}"/><circle cx="158" cy="186" r="14" fill="${tc}"/><circle cx="162" cy="168" r="11" fill="${tc}"/>` : `<circle cx="144" cy="208" r="13" fill="${tc}"/>`; };
  const body = o => `<path d="M60 222 Q52 160 100 158 Q148 160 140 222 Q100 232 60 222 Z" fill="${o || q.bodyC || q.c}"/>` + m3(s => `<ellipse cx="${100 + s * 24}" cy="224" rx="17" ry="9" fill="${o || q.paw || q.c}"/>`);
  const back = o => (q.ear === 'point' ? m3(s => `<path d="M${100 + s * 64} 100 Q${100 + s * 68} 46 ${100 + s * 52} 38 Q${100 + s * 28} 46 ${100 + s * 14} 66 Z" fill="${eC(s, o)}"/>`) : q.ear === 'up' ? m3(s => `<ellipse cx="${100 + s * 28}" cy="32" rx="15" ry="42" transform="rotate(${s * 10} ${100 + s * 28} 68)" fill="${eC(s, o)}"/>`)
    : q.ear === 'bat' ? m3(s => `<path d="M${100 + s * 70} 120 Q${100 + s * 108} 82 ${100 + s * 94} 36 Q${100 + s * 88} 24 ${100 + s * 74} 30 Q${100 + s * 38} 46 ${100 + s * 18} 68 Z" fill="${eC(s, o)}"/>` + (q.fringe ? `<circle cx="${100 + s * 96}" cy="62" r="10" fill="${o || q.fringe}"/><circle cx="${100 + s * 97}" cy="80" r="11" fill="${o || q.fringe}"/><circle cx="${100 + s * 90}" cy="98" r="11" fill="${o || q.fringe}"/><circle cx="${100 + s * 80}" cy="112" r="10" fill="${o || q.fringe}"/>` : ''))
    : q.ear === 'short' ? m3(s => `<ellipse cx="${100 + s * 27}" cy="50" rx="14" ry="27" transform="rotate(${s * 12} ${100 + s * 27} 72)" fill="${eC(s, o)}"/>`) : '')
    + (q.mane ? Array.from({ length: 13 }, (_, i) => { const a = Math.PI * (0.92 + i * 1.16 / 12 * 1.0) , t = Math.PI * (-0.08 + i * 1.16 / 12) + Math.PI; return `<circle cx="${(100 + 76 * Math.cos(t)).toFixed(1)}" cy="${(124 + 62 * Math.sin(t)).toFixed(1)}" r="18" fill="${o || q.mane}"/>`; }).join('') + m3(s => `<circle cx="${100 + s * 70}" cy="150" r="17" fill="${o || q.mane}"/><circle cx="${100 + s * 52}" cy="170" r="16" fill="${o || q.mane}"/>`) : '');
  const front = o => (q.ear === 'flop' || q.ear === 'lop' ? m3(s => `<ellipse cx="${100 + s * 70}" cy="${q.ear === 'lop' ? 124 : 118}" rx="18" ry="${q.ear === 'lop' ? 40 : 34}" transform="rotate(${-s * 12} ${100 + s * 70} 90)" fill="${eC(s, o)}"/>`) : q.ear === 'puff' ? m3(s => `<circle cx="${100 + s * 70}" cy="102" r="19" fill="${o || q.c}"/><circle cx="${100 + s * 73}" cy="128" r="19" fill="${o || q.c}"/>`) : q.ear === 'fold' ? m3(s => `<path d="M${100 + s * 34} 66 Q${100 + s * 70} 54 ${100 + s * 78} 92 Q${100 + s * 66} 108 ${100 + s * 54} 86 Q${100 + s * 46} 74 ${100 + s * 34} 66 Z" fill="${eC(s, o)}"/>`) : '')
    + (q.fluff ? m3(s => `<circle cx="${100 + s * 76}" cy="112" r="13" fill="${o || q.c}"/><circle cx="${100 + s * 78}" cy="134" r="16" fill="${o || q.c}"/><circle cx="${100 + s * 70}" cy="156" r="15" fill="${o || q.c}"/><circle cx="${100 + s * 54}" cy="168" r="12" fill="${o || q.c}"/>`) : '')
    + (q.top === 1 ? `<path d="M80 68 q-10 -20 10 -20 q6 -13 19 -4 q16 -4 14 11 q8 8 -3 13 z" fill="${o || q.c}"/>` : q.top === 2 ? `<circle cx="80" cy="62" r="18" fill="${o || q.c}"/><circle cx="120" cy="62" r="18" fill="${o || q.c}"/><circle cx="100" cy="52" r="20" fill="${o || q.c}"/>` : '');
  const U = inner => `<g transform="translate(0 2.5)" opacity=".8" stroke="${q.d}" stroke-width="5" stroke-linejoin="round">${inner}</g>`;
  const inner = q.ear === 'point' ? m3(s => `<path d="M${100 + s * 54} 82 Q${100 + s * 56} 56 ${100 + s * 50} 52 Q${100 + s * 38} 56 ${100 + s * 32} 66 Z" fill="${q.inner}"/>`) : q.ear === 'up' ? m3(s => `<ellipse cx="${100 + s * 28}" cy="36" rx="7" ry="28" transform="rotate(${s * 10} ${100 + s * 28} 68)" fill="${q.inner}"/>`) : q.ear === 'lop' ? m3(s => `<ellipse cx="${100 + s * 71}" cy="128" rx="8" ry="26" transform="rotate(${-s * 12} ${100 + s * 70} 90)" fill="${q.inner}" opacity=".8"/>`)
    : q.ear === 'bat' ? m3(s => `<path d="M${100 + s * 68} 98 Q${100 + s * 94} 76 ${100 + s * 86} 44 Q${100 + s * 56} 50 ${100 + s * 38} 68 Z" fill="${q.inner}"/>`)
    : q.ear === 'short' ? m3(s => `<ellipse cx="${100 + s * 27}" cy="52" rx="6.5" ry="17" transform="rotate(${s * 12} ${100 + s * 27} 72)" fill="${q.inner}"/>`) : '';
  const M = { stripe: `<path d="M88 66 l3 13 M100 63 v14 M112 66 l-3 13 M32 122 l13 2 M34 134 l12 -1 M168 122 l-13 2 M166 134 l-12 -1" stroke="${q.sc}" stroke-width="5.5" stroke-linecap="round"/>`,
    tux: `<path d="M100 100 Q130 124 142 180 L58 180 Q70 124 100 100 Z" fill="#fff"/>`,
    calico: `<ellipse cx="50" cy="84" rx="42" ry="36" fill="${ORG}"/><ellipse cx="152" cy="86" rx="38" ry="34" fill="${BR}"/>`,
    shiba: `<ellipse cx="100" cy="158" rx="64" ry="34" fill="${CRM}"/><circle cx="72" cy="104" r="6" fill="${CRM}"/><circle cx="128" cy="104" r="6" fill="${CRM}"/>`,
    beagle: `<ellipse cx="100" cy="70" rx="64" ry="32" fill="#B5774A"/><path d="M100 54 Q114 80 109 112 L91 112 Q86 80 100 54 Z" fill="#fff"/>`,
    dutch: `<ellipse cx="30" cy="118" rx="28" ry="56" fill="${BR}"/><ellipse cx="170" cy="118" rx="28" ry="56" fill="${BR}"/>`,
    chi: `<path d="M100 58 Q113 88 108 116 L92 116 Q87 88 100 58 Z" fill="${CRM}"/>`,
    chitan: `<circle cx="72" cy="104" r="6.5" fill="${q.tan}"/><circle cx="128" cy="104" r="6.5" fill="${q.tan}"/><ellipse cx="42" cy="146" rx="18" ry="14" fill="${q.tan}"/><ellipse cx="158" cy="146" rx="18" ry="14" fill="${q.tan}"/>`,
    pug: `<path d="M86 84 q14 -7 28 0 M90 95 q10 -5 20 0" stroke="${q.d}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`,
    siam: `<ellipse cx="100" cy="134" rx="40" ry="32" fill="#A98672"/>` }[q.mark] || '';
  const ex = q.lit ? 31 : 30, iris = q.eye || (q.lit ? '#FFE27A' : ''), ec = q.lit ? iris : ink, er = q.big ? 8 : 5.2, ew = q.big ? 33 : 30;
  const eyes = mood === 'normal' ? m3(s => iris ? `<ellipse cx="${100 + s * 31}" cy="124" rx="7.5" ry="8.5" fill="${iris}"${q.lit ? '' : ` stroke="${ink}" stroke-width="1.6"`}/><ellipse cx="${100 + s * 31}" cy="124" rx="3.5" ry="6" fill="${ink}"/>` : `<circle cx="${100 + s * ew}" cy="125" r="${er}" fill="${ink}"/><circle cx="${100 + s * ew - er * .3}" cy="${125 - er * .38}" r="${(er * .33).toFixed(1)}" fill="#fff"/>` + (q.big ? `<circle cx="${100 + s * ew + 2.6}" cy="128" r="1.5" fill="#fff"/>` : ''))
    : mood === 'sleep' ? m3(s => `<path d="M${100 + s * ex - 7} 124 q7 6 14 0" fill="none" stroke="${ec}" stroke-width="3.2" stroke-linecap="round"/>`)
    : m3(s => `<path d="M${100 + s * ex - 7} 128 q7 -9 14 0" fill="none" stroke="${ec}" stroke-width="3.4" stroke-linecap="round"/>`);
  const mouth = mood === 'happy' ? `<path d="M91 138 q9 13 18 0 z" fill="#E8607A" stroke="${ink}" stroke-width="2.6" stroke-linejoin="round"/>`
    : mood === 'eat' ? `<ellipse class="pet-chew" cx="100" cy="142" rx="7" ry="6" fill="#E8607A" stroke="${ink}" stroke-width="2.6"/>`
    : `<path d="M92 139 q4 5 8 0 q4 5 8 0" stroke="${ink}" stroke-width="2.8" stroke-linecap="round" fill="none"/>`;
  const V = { kind: q.ear === 'up' ? 'up' : '' };
  return `<svg viewBox="0 -14 200 256" class="pet pet-${mood}"><defs><clipPath id="${id}"><path d="${HEADP}"/></clipPath></defs><ellipse cx="100" cy="232" rx="56" ry="8" fill="#8A6A4A" opacity=".16"/>
  <g filter="url(#crp)">${U(tail(q.d) + body(q.d) + back(q.d) + front(q.d))}${tail()}${body()}<ellipse cx="100" cy="204" rx="${q.mark === 'tux' || q.mark === 'dutch' ? 25 : 21}" ry="20" fill="${q.belly || '#fff'}" opacity="${q.belly ? 1 : .75}"/>${q.mark === 'beagle' ? `<ellipse cx="128" cy="198" rx="10" ry="14" fill="#6B4A3A"/>` : ''}
  ${wear.neck ? `<g transform="translate(-20 20)">${wearNeck(wear.neck[0], wear.neck[1])}</g>` : ''}${m3(s => `<ellipse cx="${100 + s * 12}" cy="212" rx="8.5" ry="11" fill="${q.d}" opacity=".8"/><ellipse cx="${100 + s * 12}" cy="210" rx="8" ry="10.5" fill="${q.paw || q.c}"/>`)}
  ${back()}<path d="${HEADP}" transform="translate(0 2.5)" fill="${q.d}" opacity=".8" stroke="${q.d}" stroke-width="5"/><path d="${HEADP}" fill="${q.c}"/>${front()}${inner}<g clip-path="url(#${id})">${M}${q.muz ? `<ellipse cx="100" cy="${q.muzS ? 141 : 142}" rx="${q.muzS ? 23 : 32}" ry="${q.muzS ? 16 : 22}" fill="${q.muz}"/>` : ''}</g></g>
  ${wear.head ? `<g transform="translate(-20 18)">${wearHead(wear.head[0], wear.head[1], sp, V)}</g>` : ''}
  ${m3(s => `<ellipse cx="${100 + s * 50}" cy="140" rx="13" ry="8.5" fill="#FF9FB2" opacity=".8"/>`)}<g class="pet-eyes">${eyes}</g><path d="M95 131 q5 -3 10 0 q-5 6.5 -10 0z" fill="${sp === 'dog' ? ink : '#EE7C95'}"/>${mouth}
  ${wear.face ? `<g transform="translate(-20 0)">${wearFace(wear.face[0], wear.face[1], 30, 125)}</g>` : ''}
  ${mood === 'sleep' ? `<g class="pet-zzz" fill="#7FA8E0" font-family="J" font-weight="700"><text x="150" y="78" font-size="22">z</text><text x="166" y="58" font-size="16">z</text></g>` : ''}</svg>`;
}
