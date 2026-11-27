const RI = '#5A4636';
const RS = `stroke="${RI}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const RS3 = `stroke="${RI}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"`;
let _gid = 0;
const qpt = (a, b, c, t) => [(1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * b[0] + t * t * c[0], (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * b[1] + t * t * c[1]];
const nest = (svg, x, y, s) => svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${s}" height="${s}" `);

function houseSVG(sp) {
  const sh = `<ellipse cx="105" cy="218" rx="112" ry="12" fill="#5A4636" opacity=".12"/>`;
  if (sp === 'dog') return `<g transform="translate(26 252)">${sh}
    <rect x="18" y="88" width="174" height="128" rx="10" fill="#FFE2B8" ${RS}/><path d="M22 130 H188 M22 172 H188" stroke="#EAC592" stroke-width="3"/>
    <path d="M68 216 V152 Q68 114 105 114 Q142 114 142 152 V216 Z" fill="#6B4F3F" ${RS}/><path d="M80 216 V156 Q80 128 105 128" fill="none" stroke="#8A6A55" stroke-width="4" stroke-linecap="round"/>
    <path d="M-6 96 L105 6 L216 96 Q216 108 204 108 L6 108 Q-6 108 -6 96 Z" fill="#F0706A" ${RS}/><path d="M40 84 L105 30 L170 84" fill="none" stroke="#FF9C93" stroke-width="5" stroke-linecap="round"/>
    <g transform="translate(105 80) scale(.5)"><path d="M-22 -6 Q-36 -18 -38 -4 Q-44 4 -34 8 Q-30 18 -20 8 L20 8 Q30 18 34 8 Q44 4 38 -4 Q36 -18 22 -6 Z" fill="#FFF8EC" stroke="${RI}" stroke-width="7" stroke-linejoin="round"/></g></g>`;
  if (sp === 'cat') return `<g transform="translate(26 214)"><ellipse cx="105" cy="256" rx="112" ry="12" fill="#5A4636" opacity=".12"/>
    <rect x="92" y="96" width="30" height="142" fill="#E9C48A" ${RS}/><path d="${[...Array(9)].map((_, i) => `M92 ${110 + i * 14} L122 ${104 + i * 14}`).join(' ')}" stroke="#C99B5C" stroke-width="3"/>
    <rect x="16" y="234" width="178" height="22" rx="9" fill="#F7C9D4" ${RS}/>
    <rect x="118" y="150" width="88" height="16" rx="8" fill="#F7C9D4" ${RS}/><path d="M190 166 V192" stroke="${RI}" stroke-width="3"/><circle class="swing" cx="190" cy="202" r="11" fill="#FFD84D" ${RS3}/>
    <path d="M50 14 L62 -12 L84 10 Z M168 14 L156 -12 L134 10 Z" fill="#BFE3D0" ${RS}/>
    <rect x="40" y="8" width="138" height="94" rx="18" fill="#BFE3D0" ${RS}/><circle cx="109" cy="56" r="31" fill="#6B4F3F" ${RS}/><path d="M88 62 Q92 36 112 32" fill="none" stroke="#8A6A55" stroke-width="4" stroke-linecap="round"/></g>`;
  return `<g transform="translate(26 252)">${sh}
    <rect x="14" y="84" width="182" height="132" rx="12" fill="#E9C48A" ${RS}/><path d="M18 126 H192 M18 170 H192 M60 88 V126 M150 126 V170 M40 170 V214 M170 170 V214" stroke="#D2A766" stroke-width="3"/>
    <path d="M66 216 V150 Q66 112 105 112 Q144 112 144 150 V216 Z" fill="#6B4F3F" ${RS}/><path d="M78 216 V156 Q78 126 105 126" fill="none" stroke="#8A6A55" stroke-width="4" stroke-linecap="round"/>
    <path d="M-6 94 L105 18 L216 94 Q216 106 204 106 L6 106 Q-6 106 -6 94 Z" fill="#8FCB8A" ${RS}/><path d="M40 82 L105 38 L170 82" fill="none" stroke="#BDE5B8" stroke-width="5" stroke-linecap="round"/>
    <g transform="translate(105 76) scale(.42) rotate(20)"><path d="M-6 -14 Q-16 -34 -4 -32 Q0 -44 6 -32 Q18 -34 8 -14 Z" fill="#6CC36A" stroke="${RI}" stroke-width="8" stroke-linejoin="round"/><path d="M-16 -12 Q0 -24 16 -12 Q12 22 0 40 Q-12 22 -16 -12 Z" fill="#F5913A" stroke="${RI}" stroke-width="8" stroke-linejoin="round"/></g>
    <path d="M-4 216 L6 190 L14 212 L22 184 L30 214 L40 192 L46 216 Z" fill="#F4DA7A" ${RS3}/></g>`;
}
const gSegs = W => [[[-10, 12], [W * .25, 70], [W * .5, 36]], [[W * .5, 36], [W * .75, 70], [W + 10, 12]]];
function garland(W = 1000) {
  const cols = ['#FF9DB5', '#FFD84D', '#8CC8F5', '#A8DDA0', '#C9A7F0']; let flags = '', n = 0;
  gSegs(W).forEach(s => { const n7 = Math.round(W / 143); for (let i = 0; i < n7; i++) { const [x, y] = qpt(s[0], s[1], s[2], (i + .5) / n7); flags += `<path d="M${x - 17} ${y - 2} L${x + 17} ${y - 2} L${x} ${y + 30} Z" fill="${cols[n++ % 5]}" ${RS3}/>`; } });
  return `<path d="M-10 12 Q${W * .25} 70 ${W * .5} 36 Q${W * .75} 70 ${W + 10} 12" fill="none" stroke="${RI}" stroke-width="3.5"/>` + flags;
}
function garlandLights(W = 1000) {
  let o = '', n = 0; gSegs(W).forEach(s => { const n7 = Math.round(W / 143); for (let i = 1; i < n7; i++) { const [x, y] = qpt(s[0], s[1], s[2], i / n7); o += `<circle class="tw" style="animation-delay:${(n++ % 4) * .35}s" cx="${x}" cy="${y + 6}" r="6.5" fill="#FFF3A6" stroke="#E3B96A" stroke-width="2.5"/>`; } }); return o;
}
function roomBG(sps, W = 1000, Z = null) {
  const cx = W / 2, dots = []; for (let r = 0; r < 6; r++) for (let c = 0; c < Math.ceil(W / 96) + 1; c++) dots.push(`<circle cx="${c * 96 + (r % 2 ? 60 : 12)}" cy="${r * 62 + 96}" r="5" fill="#FFE2B4"/>`);
  const hills = `<path d="M300 266 q44 -44 96 -14 q44 -36 104 14z"`;
  const vl = (y1, y2, off) => { let o = ''; for (let x = off; x < W; x += 300) o += `M${x} ${y1} V${y2} `; return o; };
  const hs = sps.length === 1 ? 1 : sps.length === 2 ? .8 : .66;
  const houses = sps.map((sp, i) => `<g transform="translate(${14 + i * 232 * hs} 528) scale(${hs}) translate(0 -${sp === 'cat' ? 470 : 470})">${houseSVG(sp)}</g>`).join('');
  const hEnd = 14 + sps.length * 232 * hs, plantX = hEnd + 44, showPlant = !Z && plantX + 60 < cx - 120;
  const ZR = [['#FFE3EA', '#FFC2D2'], ['#DDEEFB', '#B4D8F3'], ['#FFF4CF', '#FFE08F']], ZM = ['#CDEBD0', '#F9DCC6', '#DDD5F4'];
  const plantAt = x => `<g transform="translate(${x - 316} 58)"><path d="M316 420 Q296 372 306 330 Q326 366 316 420 Z M316 420 Q340 366 338 318 Q312 362 316 420 Z M316 420 Q276 396 266 356 Q302 372 316 420 Z M316 420 Q360 398 372 358 Q334 372 316 420 Z" fill="#7CC97A" ${RS3}/><path d="M290 418 H342 L335 470 H297 Z" fill="#8CC8F5" ${RS}/><path d="M286 412 H346 V424 H286 Z" fill="#BFE6FA" ${RS3}/></g>`;
  const floor1 = `<ellipse cx="${cx + 10}" cy="664" rx="${W * .38}" ry="102" fill="url(#rmrug)" ${RS}/><ellipse cx="${cx + 10}" cy="664" rx="${W * .34}" ry="82" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 12" stroke-linecap="round"/>
  ${[[.33, 650], [.45, 620], [.6, 640], [.72, 676], [.4, 706], [.56, 712]].map(([x, y]) => `<path transform="translate(${x * W} ${y}) scale(.9 .5)" d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4 Z" fill="#fff" opacity=".75"/>`).join('')}
  <rect x="26" y="700" width="254" height="88" rx="28" fill="#CDEBD0" ${RS}/><rect x="38" y="710" width="230" height="68" rx="20" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"/>`;
  const zHouses = Z ? Z.map(z => `<g transform="translate(${z.hx} 528) scale(${z.hs}) translate(0 -470)">${houseSVG(z.sp)}</g>`).join('') : houses;
  const zFloor = Z ? Z.map((z, i) => `<defs><radialGradient id="rmrug${i}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${ZR[i % 3][0]}"/><stop offset="1" stop-color="${ZR[i % 3][1]}"/></radialGradient></defs>
    <ellipse cx="${z.cx}" cy="660" rx="${z.rw}" ry="94" fill="url(#rmrug${i})" ${RS}/><ellipse cx="${z.cx}" cy="660" rx="${z.rw - 26}" ry="74" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="14 12" stroke-linecap="round"/>
    <rect x="${z.mx}" y="712" width="${z.mw}" height="78" rx="26" fill="${ZM[i % 3]}" ${RS}/><rect x="${z.mx + 10}" y="721" width="${z.mw - 20}" height="60" rx="18" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="2 12" stroke-linecap="round"/>`).join('')
    + Z.slice(1).map(z => `<path d="M${z.x0} 476 V796" stroke="#fff" stroke-width="8" stroke-dasharray="1 22" stroke-linecap="round"/>${Z.length === 2 ? plantAt(z.x0) : ''}`).join('') : '';
  return `<svg class="bg" viewBox="0 0 ${W} 800" preserveAspectRatio="xMidYMid slice"><defs>
    <linearGradient id="rmwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF5DE"/><stop offset="1" stop-color="#FFE9C8"/></linearGradient>
    <linearGradient id="rmfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5D5A4"/><stop offset="1" stop-color="#E9BF88"/></linearGradient>
    <linearGradient id="rmsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9DBF8"/><stop offset="1" stop-color="#E4F5FF"/></linearGradient>
    <radialGradient id="rmrug" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#FFE3EA"/><stop offset="1" stop-color="#FFC2D2"/></radialGradient></defs>
  <rect width="${W}" height="480" fill="url(#rmwall)"/>${dots.join('')}
  <rect y="394" width="${W}" height="70" fill="#FBDDB0"/><path d="M0 394 H${W}" stroke="${RI}" stroke-width="3.5"/><path d="${[...Array(Math.ceil(W / 84))].map((_, i) => `M${i * 84 + 30} 402 V456`).join(' ')}" stroke="#F0C78E" stroke-width="3"/>
  <rect y="460" width="${W}" height="340" fill="url(#rmfloor)"/><path d="M0 540 H${W} M0 630 H${W} M0 716 H${W} ${vl(464, 540, 150)}${vl(540, 630, 280)}${vl(630, 716, 110)}${vl(716, 800, 260)}" stroke="#DDB078" stroke-width="3"/>
  <rect y="452" width="${W}" height="16" fill="#F2CF9A" stroke="${RI}" stroke-width="3.5"/>
  <g transform="translate(${cx - 400} 58)"><rect x="268" y="66" width="264" height="14" rx="7" fill="#E9A66B" ${RS3}/>
    <rect x="296" y="86" width="208" height="186" rx="16" fill="#fff" ${RS}/>
    <g class="sky-day"><rect x="306" y="96" width="188" height="166" rx="10" fill="url(#rmsky)"/><circle cx="462" cy="130" r="26" fill="#FFF3B0" opacity=".7"/><circle cx="462" cy="130" r="19" fill="#FFE066" ${RS3}/>${hills} fill="#BFE8B0" stroke="${RI}" stroke-width="3" clip-path="inset(0 6px 4px 6px)"/></g>
    <g class="sky-night"><rect x="306" y="96" width="188" height="166" rx="10" fill="#2E3F73"/><circle cx="456" cy="136" r="21" fill="#FFF3B0"/><circle cx="446" cy="129" r="20" fill="#2E3F73"/>${hills} fill="#3F5C6E" clip-path="inset(0 6px 4px 6px)"/></g>
    <path d="M400 96 V262 M306 178 H494" stroke="${RI}" stroke-width="5"/><rect x="296" y="86" width="208" height="186" rx="16" fill="none" ${RS}/>
    <path d="M284 78 H352 Q342 150 302 190 Q293 230 291 264 H284 Z" fill="#FFB7C9" ${RS}/><path d="M516 78 H448 Q458 150 498 190 Q507 230 509 264 H516 Z" fill="#FFB7C9" ${RS}/>
    <path d="M296 184 q8 8 16 -2 M504 184 q-8 8 -16 -2" fill="none" stroke="#FFD84D" stroke-width="6" stroke-linecap="round"/><rect x="280" y="266" width="240" height="18" rx="9" fill="#fff" ${RS}/></g>
  <g transform="translate(24 58)"><rect x="44" y="176" width="204" height="14" rx="6" fill="#E9B97E" ${RS}/><path d="M72 190 q0 16 -14 16 M220 190 q0 16 14 16" fill="none" stroke="${RI}" stroke-width="4" stroke-linecap="round"/>
    <path d="M90 146 Q70 118 80 98 Q98 118 90 146 Z M90 146 Q108 116 104 94 Q84 116 90 146 Z M90 146 Q62 138 56 118 Q80 122 90 146 Z M90 146 Q118 138 124 118 Q100 122 90 146 Z" fill="#7CC97A" ${RS3}/>
    <path d="M70 146 H110 L104 176 H76 Z" fill="#F2A27C" ${RS}/><path d="M66 142 H114 V152 H66 Z" fill="#F7B693" ${RS3}/>
    <rect x="150" y="112" width="74" height="64" rx="9" fill="#fff" ${RS}/><rect x="159" y="121" width="56" height="46" rx="5" fill="#FFE3EC" stroke="${RI}" stroke-width="3"/>
    <g fill="#FF8FB1"><ellipse cx="187" cy="151" rx="9" ry="7.5"/><circle cx="175" cy="139" r="4"/><circle cx="183" cy="133" r="4"/><circle cx="192" cy="133" r="4"/><circle cx="200" cy="139" r="4"/></g></g>
  <g transform="translate(${cx + 204} 176)"><circle r="38" fill="#fff" ${RS}/><circle r="28" fill="#FFF6E6"/><path d="M0 0 V-20 M0 0 L14 8" stroke="${RI}" stroke-width="5" stroke-linecap="round"/><circle r="4.5" fill="#FF8FB1"/></g>
  ${W > 1250 ? `<g transform="translate(${cx + 330} 150)"><rect x="-44" y="-36" width="88" height="72" rx="10" fill="#fff" ${RS}/><rect x="-34" y="-26" width="68" height="52" rx="5" fill="#D6EFE2" stroke="${RI}" stroke-width="3"/><path d="M0 14 Q-22 -4 -12 -14 Q-4 -20 0 -8 Q4 -20 12 -14 Q22 -4 0 14 Z" fill="#FF8FB1"/></g>` : ''}
  ${garland(W)}${showPlant ? `<g transform="translate(${plantX - 316} 58)"><path d="M316 420 Q296 372 306 330 Q326 366 316 420 Z M316 420 Q340 366 338 318 Q312 362 316 420 Z M316 420 Q276 396 266 356 Q302 372 316 420 Z M316 420 Q360 398 372 358 Q334 372 316 420 Z" fill="#7CC97A" ${RS3}/><path d="M290 418 H342 L335 470 H297 Z" fill="#8CC8F5" ${RS}/><path d="M286 412 H346 V424 H286 Z" fill="#BFE6FA" ${RS3}/></g>` : ''}${zHouses}
  ${Z ? zFloor : `<ellipse cx="${W - 310}" cy="524" rx="92" ry="30" fill="#A9D0F5" ${RS}/><ellipse cx="${W - 310}" cy="517" rx="68" ry="18" fill="#D5E9FB"/>`}
  ${Z ? '' : floor1}</svg>
  <svg class="bg2" viewBox="0 0 ${W} 800" preserveAspectRatio="xMidYMid slice"><defs><clipPath id="rmwin"><path d="M456 154 H544 Q552 208 594 244 V320 H406 V244 Q448 208 456 154 Z"/></clipPath></defs>
    <g transform="translate(${cx - 500} 0)"><g class="sky-day" clip-path="url(#rmwin)"><g transform="translate(100 58)"><g class="cloud c1"><path d="M300 176 q4 -18 22 -14 q8 -16 26 -6 q18 -4 18 14 q10 6 0 14 h-62 q-12 -2 -4 -8z" fill="#fff" stroke="#DDB48A" stroke-width="3" stroke-linejoin="round"/></g>
      <g class="cloud c2"><path d="M300 214 q3 -12 15 -10 q6 -11 18 -4 q12 -3 12 10 q7 4 0 9 h-42 q-8 -1 -3 -5z" fill="#fff" stroke="#DDB48A" stroke-width="3" stroke-linejoin="round"/></g></g></g>
    <g class="sky-night">${[[430, 178], [472, 208], [445, 248], [520, 168], [570, 258], [498, 272]].map(([x, y], i) => `<circle class="tw" style="animation-delay:${i * .3}s" cx="${x}" cy="${y}" r="3.2" fill="#FFF3B0"/>`).join('')}</g>
    <path d="M500 156 V318 M408 236 H592" stroke="#DDB48A" stroke-width="3"/></g>${garlandLights(W)}</svg>`;
}
function closetSVG(nNew) {
  return `<svg viewBox="0 0 200 322"><defs><linearGradient id="clg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D6EFE2"/><stop offset="1" stop-color="#A9D8C2"/></linearGradient><linearGradient id="clm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F2FAFF"/><stop offset="1" stop-color="#C4E2F6"/></linearGradient></defs>
  <ellipse cx="100" cy="310" rx="94" ry="10" fill="#5A4636" opacity=".12"/><rect x="24" y="290" width="18" height="22" rx="4" fill="#D9A766" ${RS3}/><rect x="158" y="290" width="18" height="22" rx="4" fill="#D9A766" ${RS3}/>
  <rect x="10" y="34" width="180" height="264" rx="16" fill="url(#clg)" ${RS}/><path d="M2 40 Q100 -4 198 40 Q198 52 186 52 L14 52 Q2 52 2 40 Z" fill="#8CCBB0" ${RS}/>
  <rect x="22" y="64" width="74" height="174" rx="10" fill="#EAF7F0" stroke="${RI}" stroke-width="4"/><rect x="104" y="64" width="74" height="174" rx="10" fill="#EAF7F0" stroke="${RI}" stroke-width="4"/>
  <ellipse cx="59" cy="140" rx="24" ry="42" fill="url(#clm)" stroke="${RI}" stroke-width="4"/><path d="M48 118 Q52 108 62 104 M46 132 Q47 128 49 125" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
  <path d="M141 164 Q112 142 122 124 Q132 112 141 126 Q150 112 160 124 Q170 142 141 164 Z" fill="#FFB7C9" stroke="${RI}" stroke-width="4" stroke-linejoin="round"/>
  <circle cx="88" cy="200" r="6.5" fill="#FFD84D" ${RS3}/><circle cx="112" cy="200" r="6.5" fill="#FFD84D" ${RS3}/>
  <rect x="22" y="246" width="156" height="40" rx="10" fill="#EAF7F0" stroke="${RI}" stroke-width="4"/><rect x="84" y="260" width="32" height="12" rx="6" fill="#FFD84D" ${RS3}/>
  <g transform="translate(100 20) scale(.5)"><path d="M0 0 Q-34 -30 -38 -4 Q-40 22 0 0 Z M0 0 Q34 -30 38 -4 Q40 22 0 0 Z" fill="#FF8FB1" stroke="${RI}" stroke-width="7" stroke-linejoin="round"/><circle r="9" fill="#FFD0DC" stroke="${RI}" stroke-width="7"/></g>
  ${nNew ? `<g class="newb"><circle cx="170" cy="40" r="25" fill="#FF6B8B" ${RS}/><text x="170" y="50" text-anchor="middle" font-family="J" font-size="28" fill="#fff">새</text></g>` : ''}</svg>`;
}
function basketSVG(toys) {
  return `<svg viewBox="0 -24 140 136"><ellipse cx="70" cy="106" rx="62" ry="7" fill="#5A4636" opacity=".12"/>${toys.map((t, i) => nest(t, [14, 52, 84][i], [-18, -24, -14][i], 50)).join('')}
  <path d="M14 46 H126 L114 98 Q112 106 104 106 H36 Q28 106 26 98 Z" fill="#E9C48A" ${RS}/><path d="M34 52 L42 102 M54 52 L58 104 M74 52 L74 104 M94 52 L90 104 M112 52 L104 102 M20 70 H120 M24 88 H116" stroke="#C99B5C" stroke-width="3" stroke-linecap="round"/>
  <rect x="8" y="38" width="124" height="16" rx="8" fill="#D9A766" ${RS}/></svg>`;
}

function treatSVG(id) {
  const g = 'tr' + (++_gid), shadow = `<ellipse cx="2" cy="36" rx="32" ry="6" fill="#5A4636" opacity=".14"/>`;
  if (id === 'fish') return `<svg viewBox="-50 -50 100 100"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFCDB6"/><stop offset="1" stop-color="#EF8363"/></linearGradient></defs>${shadow}
    <g transform="rotate(-14)"><path d="M-36 0 Q-12 -26 16 -9 L38 -22 Q31 0 38 22 L16 9 Q-12 26 -36 0 Z" fill="url(#${g})" ${RS}/><path d="M-6 -11 Q2 0 -6 11 M6 -9 Q12 0 6 9" fill="none" stroke="#C9603F" stroke-width="3" stroke-linecap="round"/><circle cx="-21" cy="-3" r="3.4" fill="${RI}"/><path d="M-28 -8 Q-16 -18 2 -13" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></g></svg>`;
  if (id === 'carrot') return `<svg viewBox="-50 -50 100 100"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#FFB25E"/><stop offset="1" stop-color="#EE7A1E"/></linearGradient></defs>${shadow}
    <g transform="rotate(28)"><path d="M-7 -18 Q-20 -40 -5 -36 Q0 -50 7 -36 Q22 -40 9 -18 Z" fill="#6CC36A" ${RS}/><path d="M-2 -22 Q0 -34 2 -22" fill="none" stroke="#3F9A45" stroke-width="3" stroke-linecap="round"/><path d="M-18 -14 Q0 -27 18 -14 Q14 20 0 42 Q-14 20 -18 -14 Z" fill="url(#${g})" ${RS}/><path d="M-10 -2 L0 0 M2 12 L10 13 M-8 20 L-1 22" stroke="#C45F12" stroke-width="3" stroke-linecap="round"/><path d="M-11 -12 Q-12 6 -5 22" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6"/></g></svg>`;
  return `<svg viewBox="-50 -50 100 100"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCE6BC"/><stop offset="1" stop-color="#DEA965"/></linearGradient></defs>${shadow}
    <g transform="rotate(-18)"><path d="M-22 -9 Q-34 -24 -41 -9 Q-49 2 -38 10 Q-32 23 -20 11 L20 11 Q32 23 38 10 Q49 2 41 -9 Q34 -24 22 -9 Z" fill="url(#${g})" ${RS}/><circle cx="-10" cy="2" r="2.6" fill="#BE8A4C"/><circle cx="1" cy="-1" r="2.6" fill="#BE8A4C"/><circle cx="11" cy="3" r="2.6" fill="#BE8A4C"/><path d="M-33 -8 Q-30 -15 -24 -5 L16 -5" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/></g></svg>`;
}
function plateSVG(arts) {
  return `<svg viewBox="-60 -52 120 104"><ellipse cx="0" cy="42" rx="46" ry="6" fill="#5A4636" opacity=".14"/><ellipse cx="0" cy="26" rx="54" ry="18" fill="#fff" ${RS}/><ellipse cx="0" cy="23" rx="40" ry="11" fill="#EEF4F8" stroke="#D5DEE6" stroke-width="2.5"/>
  ${arts.map((a, i) => nest(a, arts.length > 1 ? [-50, -6][i] : -29, arts.length > 1 ? [-34, -40][i] : -40, 58)).join('')}</svg>`;
}
function pitcherSVG() {
  const g = 'pt' + (++_gid);
  return `<svg viewBox="-50 -50 100 100"><defs><linearGradient id="${g}a" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#F6FCFF"/><stop offset="1" stop-color="#CFEAF9"/></linearGradient><linearGradient id="${g}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AD6FA"/><stop offset="1" stop-color="#4BA6E6"/></linearGradient></defs>
  <ellipse cx="0" cy="40" rx="30" ry="6" fill="#5A4636" opacity=".14"/>
  <path d="M22 -16 Q48 -18 46 6 Q44 26 20 20" fill="none" stroke="${RI}" stroke-width="13" stroke-linecap="round"/><path d="M22 -16 Q48 -18 46 6 Q44 26 20 20" fill="none" stroke="#E4F4FD" stroke-width="5" stroke-linecap="round"/>
  <path d="M-25 -34 Q-36 -42 -40 -34 L-27 -22 L-23 30 Q-23 37 -16 37 L16 37 Q23 37 23 30 L27 -34 Z" fill="url(#${g}a)" ${RS}/>
  <path d="M-26 -6 Q-13 -12 0 -6 Q13 0 25.5 -6 L22.5 30 Q22.5 34.500 16 34.500 L-16 34.500 Q-22.500 34.500 -22.500 30 Z" fill="url(#${g}b)"/>
  <path d="M-26 -6 Q-13 -12 0 -6 Q13 0 25.500 -6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
  <circle cx="6" cy="12" r="3" fill="#fff" opacity=".7"/><circle cx="-4" cy="22" r="2.200" fill="#fff" opacity=".7"/><circle cx="12" cy="24" r="1.800" fill="#fff" opacity=".7"/>
  <path d="M-25 -34 Q-36 -42 -40 -34 L-27 -22 L-23 30 Q-23 37 -16 37 L16 37 Q23 37 23 30 L27 -34 Z" fill="none" ${RS}/>
  <path d="M-15 -24 L-13 22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/></svg>`;
}
function ballSVG() {
  const g = 'bl' + (++_gid);
  return `<svg viewBox="-50 -50 100 100"><defs><radialGradient id="${g}" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#B9E4FF"/><stop offset=".6" stop-color="#5DB2EE"/><stop offset="1" stop-color="#3A8FD6"/></radialGradient></defs>
  <ellipse cx="2" cy="38" rx="28" ry="6" fill="#5A4636" opacity=".14"/><circle r="33" fill="url(#${g})" ${RS}/>
  <path d="M-32 -6 Q0 -26 32 -6 L32 8 Q0 -12 -32 8 Z" fill="#fff" opacity=".9"/><path d="M-33 -6 Q0 -26 33 -6 M-33 8 Q0 -12 33 8" fill="none" stroke="${RI}" stroke-width="3"/>
  <path d="M0 -17 L3 -10 L10 -10 L4.500 -5.500 L6.500 1.500 L0 -2.500 L-6.500 1.500 L-4.500 -5.500 L-10 -10 L-3 -10 Z" fill="#FF8FB1" stroke="${RI}" stroke-width="2" stroke-linejoin="round"/>
  <circle r="33" fill="none" ${RS}/><ellipse cx="-13" cy="-19" rx="8" ry="5" fill="#fff" opacity=".8" transform="rotate(-30 -13 -19)"/></svg>`;
}
function shadowed(svg) { return svg.replace(/(<svg [^>]*>)/, `$1<ellipse cx="2" cy="40" rx="30" ry="6" fill="#5A4636" opacity=".14"/>`); }
function handSVG() {
  const g = 'hd' + (++_gid);
  return `<svg viewBox="0 0 60 66"><defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE7D2"/><stop offset="1" stop-color="#F7C39A"/></linearGradient></defs>
  <path d="M14 40 L8 26 Q7 20 12 20 L20 34 L17 12 Q18 7 23 9 L28 28 L29 9 Q31 4 35 8 L37 29 L41 15 Q45 11 47 16 L45 40 Q43 50 40 54 L18 54 Q15 48 14 40 Z" fill="url(#${g})" stroke="${RI}" stroke-width="3.500" stroke-linejoin="round"/>
  <path d="M22 40 Q28 44 36 40" fill="none" stroke="#E0A57C" stroke-width="2.500" stroke-linecap="round"/><path d="M21 15 L23 24 M32 12 L32.500 22 M42.500 19 L41 27" stroke="#fff" stroke-width="2.500" stroke-linecap="round" opacity=".7"/>
  <rect x="14" y="51" width="30" height="13" rx="5" fill="#FF9DB5" stroke="${RI}" stroke-width="3.500"/><path d="M20 55 V60 M26 55 V60 M32 55 V60 M38 55 V60" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/></svg>`;
}
