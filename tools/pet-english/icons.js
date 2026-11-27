const ICON_PAL = {
  study: { main: '#FFFFFF', light: '#FFF1B8', accent: '#F26B5E', accent2: '#6BBF59', theme: '#F2B02E' },
  care: { main: '#FFB7C9', light: '#FFE3EA', accent: '#FF6F91', accent2: '#FF6F91', theme: '#F27C98' },
  museum: { main: '#E0A85A', light: '#FFFDF6', accent: '#FFD84D', accent2: '#7CC96A', theme: '#4DB37A' },
  listen: { main: '#7DB8E8', light: '#CFE6F8', accent: '#F28CB1', accent2: '#F28CB1', theme: '#4F9BE0' },
  cal: { main: '#FFFFFF', light: '#F3ECFD', accent: '#B79BEA', accent2: '#FFD84D', theme: '#9A7BE0' },
};
const ICON_STAR = (cx, cy, R, r = R * .46) => 'M' + [...Array(10)].map((_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; return (cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1); }).join(' L') + ' Z';

const ICON_SHAPES = {
  study: { rot: -8, s: [
    ['main', 'rect', 'x="22" y="11" width="56" height="78" rx="11"'], ['light', 'rect', 'x="29" y="18" width="42" height="38" rx="7"'],
    ['accent', 'circle', 'cx="50" cy="39" r="11.5"'], ['accent2', 'path', 'd="M50 28 q2 -8 9 -8 q0 7 -9 8 Z"'],
    ['line', 'path', 'd="M36 68 H64 M41 78 H59"'], ['gloss', 'ellipse', 'cx="46" cy="35" rx="4" ry="2.5"']] },
  care: { s: [
    ['accent', 'path', 'd="M50 43 C34 31 33 14 43 13 C47.5 12.6 50 16 50 18.5 C50 16 52.5 12.6 57 13 C67 14 66 31 50 43 Z"'],
    ['main', 'path', 'd="M19 60 H81 L74 85 Q72.5 90 67 90 H33 Q27.5 90 26 85 Z"'], ['light', 'rect', 'x="13" y="51" width="74" height="13" rx="6.5"'],
    ['gloss', 'ellipse', 'cx="44" cy="20.5" rx="4" ry="2.4"'], ['gloss', 'ellipse', 'cx="33" cy="72" rx="3" ry="8" transform="rotate(14 33 72)"']] },
  museum: { s: [
    ['line', 'path', 'd="M50 9 L33 24 M50 9 L67 24"'], ['main', 'circle', 'cx="50" cy="9" r="3.6"'],
    ['main', 'rect', 'x="13" y="24" width="74" height="62" rx="8"'], ['light', 'rect', 'x="24" y="35" width="52" height="40" rx="3"'],
    ['accent2', 'path', 'd="M26 75 L41 54 L51 66 L59 57 L74 75 Z"'], ['accent', 'circle', 'cx="63" cy="46.5" r="5.5"'],
    ['gloss', 'ellipse', 'cx="31" cy="29.5" rx="9" ry="2.2"']] },
  listen: { s: [
    ['band', 'path', 'd="M21 58 V50 A29 29 0 0 1 79 50 V58"'],
    ['main', 'rect', 'x="11" y="54" width="20" height="32" rx="9"'], ['main', 'rect', 'x="69" y="54" width="20" height="32" rx="9"'],
    ['accent', 'path', 'd="M50 46 L64 41 V51 L54.5 54.4 V71 H50 Z"'], ['accent', 'ellipse', 'cx="46.5" cy="71" rx="7.4" ry="5.6" transform="rotate(-18 46.5 71)"'],
    ['gloss', 'ellipse', 'cx="17.5" cy="64" rx="2.6" ry="6.5"'], ['gloss', 'ellipse', 'cx="75.5" cy="64" rx="2.6" ry="6.5"']] },
  cal: { s: [
    ['main', 'rect', 'x="15" y="20" width="70" height="68" rx="11"'], ['accent', 'path', 'd="M15 31 Q15 20 26 20 H74 Q85 20 85 31 V42 H15 Z"'],
    ['line', 'path', 'd="M34 12 V27 M66 12 V27"'], ['accent2', 'path', `d="${ICON_STAR(50, 65.5, 15.5)}"`],
    ['gloss', 'ellipse', 'cx="31" cy="27" rx="8" ry="2.3"']] },
};
const icHex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const icMix = (a, b, t) => '#' + icHex(a).map((v, i) => Math.round(v * (1 - t) + icHex(b)[i] * t).toString(16).padStart(2, '0')).join('');
const ICON_SETS = {
  crayon: { name: '크레파스', note: '지금 앱 그림과 같은 손그림 느낌' },
  sticker: { name: '말랑 스티커', note: '테두리 선 없이 파스텔 색, 하얀 스티커 테두리' },
  solid: { name: '동글 단추', note: '색 동그라미 안에 하얀 그림, 가장 단순해요' },
  line: { name: '선 그림', note: '갈색 선으로만 그리고 색은 한 군데만' },
  jelly: { name: '젤리', note: '반짝이는 입체 사탕 느낌' },

  pencil: { name: '색연필', note: '선도 제 색으로, 안은 빗금으로 살살 칠한 느낌' },
  wax: { name: '꾹꾹 칠한 크레파스', note: '테두리 선 없이 진하게 칠하고 거친 결이 보여요' },
  kid: { name: '삐뚤빼뚤 색칠', note: '굵은 선에 색이 살짝 빗나간, 아이가 칠한 느낌' },
  chalk: { name: '분필', note: '색종이 위에 흰 분필로 그린 느낌' },
};

const icWob = (id, sc, fq, seed = 4, oct = 1) => `<filter id="${id}" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency="${fq}" numOctaves="${oct}" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${sc}" xChannelSelector="R" yChannelSelector="G"/></filter>`;
const icGrain = (id, sc, fq, cut = -2.1, gf = .33) => `<filter id="${id}" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency="${fq}" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="${sc}" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="${gf}" numOctaves="2" seed="11" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  6 0 0 0 ${cut}" result="ga"/><feComposite in="d" in2="ga" operator="in"/></filter>`;
function iconSVG(kind, set = 'crayon', cls = 'ic5') {
  const P = ICON_PAL[kind], G = ICON_SHAPES[kind], INK = '#4A3F3A', id = 'ig-' + set + '-' + kind; let defs = '', body = '', pre = '', post = '';
  const el = (tag, at, st) => `<${tag} ${at} ${st}/>`, rj = 'stroke-linejoin="round" stroke-linecap="round"';
  for (const [role, tag, at] of G.s) {
    if (role === 'gloss') { if (set === 'jelly') body += el(tag, at, 'fill="#fff" opacity=".62"'); continue; }
    const c = P[role] || P.main;
    if (set === 'crayon') body += role === 'line' ? el(tag, at, `fill="none" stroke="${INK}" stroke-width="4.5" ${rj}`) : role === 'band' ? el(tag, at, `fill="none" stroke="${INK}" stroke-width="7" ${rj}`) : el(tag, at, `fill="${c}" stroke="${INK}" stroke-width="4.5" ${rj}`);
    else if (set === 'sticker') { const dk = icMix(P.theme, '#5A4636', .25);
      pre += role === 'line' || role === 'band' ? el(tag, at, `fill="none" stroke="#fff" stroke-width="${role === 'band' ? 19 : 14}" ${rj}`) : el(tag, at, `fill="#fff" stroke="#fff" stroke-width="10" ${rj}`);
      body += role === 'line' ? el(tag, at, `fill="none" stroke="${dk}" stroke-width="5" ${rj}`) : role === 'band' ? el(tag, at, `fill="none" stroke="${icMix(P.main, '#5A4636', .18)}" stroke-width="9" ${rj}`) : el(tag, at, `fill="${role === 'main' && c === '#FFFFFF' ? icMix(P.theme, '#FFFFFF', .72) : c}"`); }
    else if (set === 'solid') { const w = '#FFFFFF', tint = icMix(P.theme, '#FFFFFF', .62);
      body += role === 'line' || role === 'band' ? el(tag, at, `fill="none" stroke="${w}" stroke-width="${role === 'band' ? 8 : 6}" ${rj}`) : el(tag, at, `fill="${role === 'main' ? w : role === 'light' ? tint : role === 'accent2' && (kind === 'museum') ? P.theme : P.theme}" ${role === 'main' ? '' : `stroke="${role === 'light' ? 'none' : w}" stroke-width="${role === 'light' ? 0 : 2.5}" ${rj}`}`); }
    else if (set === 'line') { const BR = '#5A4636';
      body += role === 'line' || role === 'band' ? el(tag, at, `fill="none" stroke="${BR}" stroke-width="${role === 'band' ? 6.5 : 5}" ${rj}`) : el(tag, at, `fill="${role === 'accent' ? P.theme : role === 'accent2' ? icMix(P.theme, '#FFFFFF', .45) : role === 'light' ? 'none' : '#FFFDF8'}" stroke="${BR}" stroke-width="${role === 'light' ? 3 : 5}" ${rj}`); }
    else if (set === 'pencil') { const base = c === '#FFFFFF' ? icMix(P.theme, '#FFFFFF', .2) : c, ln = icMix(base, '#4A3528', .42), hid = id + '-h' + (defs.split('<pattern').length);
      if (role === 'line' || role === 'band') { body += el(tag, at, `fill="none" stroke="${ln}" stroke-width="${role === 'band' ? 6 : 3.6}" ${rj}`); post += el(tag, at, `fill="none" stroke="${ln}" stroke-width="1.6" opacity=".55" ${rj}`); }
      else { defs += `<pattern id="${hid}" width="5.5" height="5.5" patternUnits="userSpaceOnUse" patternTransform="rotate(${role === 'light' ? -38 : 42})"><path d="M0 2.7 H5.5" stroke="${icMix(base, '#4A3528', .08)}" stroke-width="2.3" stroke-linecap="round"/></pattern>`;
        body += el(tag, at, `fill="${icMix(base, '#FFFFFF', .7)}"`) + el(tag, at, `fill="url(#${hid})"`) + el(tag, at, `fill="none" stroke="${ln}" stroke-width="3.4" ${rj}`); post += el(tag, at, `fill="none" stroke="${ln}" stroke-width="1.5" opacity=".5" ${rj}`); } }
    else if (set === 'wax') { const base = c === '#FFFFFF' ? icMix(P.theme, '#FFFFFF', kind === 'study' ? .0 : .4) : icMix(c, '#FFFFFF', role === 'light' ? .1 : 0), dk = icMix(P.theme, '#3A2E2A', .32);
      body += role === 'line' || role === 'band' ? el(tag, at, `fill="none" stroke="${role === 'band' ? icMix(P.main, '#3A2E2A', .25) : dk}" stroke-width="${role === 'band' ? 9 : 6}" ${rj}`) : el(tag, at, `fill="${base}" stroke="${base}" stroke-width="2.5" ${rj}`); }
    else if (set === 'kid') { const base = c === '#FFFFFF' ? icMix(P.theme, '#FFFFFF', .62) : c;
      if (role === 'line' || role === 'band') post += el(tag, at, `fill="none" stroke="${INK}" stroke-width="${role === 'band' ? 8 : 5.6}" ${rj}`);
      else { body += el(tag, at, `fill="${base}" stroke="${base}" stroke-width="3" ${rj}`); post += el(tag, at, `fill="none" stroke="${INK}" stroke-width="5.6" ${rj}`); } }
    else if (set === 'chalk') { const w = '#FFFFFF';
      body += role === 'line' || role === 'band' ? el(tag, at, `fill="none" stroke="${w}" stroke-width="${role === 'band' ? 8 : 5.5}" ${rj}`) : el(tag, at, `fill="${w}" fill-opacity="${role === 'main' ? .2 : role === 'light' ? .0 : .88}" stroke="${w}" stroke-width="${role === 'light' ? 3 : 5}" ${rj}`); }
    else { const base = role === 'main' && c === '#FFFFFF' ? icMix(P.theme, '#FFFFFF', .55) : c, gid = id + '-' + (defs.split('<linearGradient').length);
      if (role === 'line' || role === 'band') body += el(tag, at, `fill="none" stroke="${icMix(P.theme, '#3A2E2A', .35)}" stroke-width="${role === 'band' ? 8.5 : 5}" ${rj}`);
      else { defs += `<linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${icMix(base, '#FFFFFF', .5)}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${icMix(base, '#3A2E2A', .18)}"/></linearGradient>`;
        body += el(tag, at, `fill="url(#${gid})" stroke="${icMix(base, '#3A2E2A', .38)}" stroke-width="3.2" ${rj}`); } }
  }
  const rot = G.rot ? ` transform="rotate(${G.rot} 50 50)"` : '';
  let inner = `<g${rot}>${pre}${body}</g>`;
  if (set === 'crayon') inner = `<g filter="url(#crw)">${inner}</g>`;
  if (set === 'pencil') { defs += icWob(id + '-w', 2.4, .05) + icWob(id + '-w2', 3.2, .07, 9); inner = `<g${rot}><g filter="url(#${id}-w)">${body}</g><g filter="url(#${id}-w2)" transform="translate(.9 .7)">${post}</g></g>`; }
  if (set === 'wax') { defs += icGrain(id + '-g', 2.6, .1, -.95, .16); inner = `<g${rot} filter="url(#${id}-g)">${body}</g>`; }
  if (set === 'kid') { defs += icGrain(id + '-g', 3, .06, -1.7, .22) + icWob(id + '-w', 3.6, .04, 3); inner = `<g${rot}><g filter="url(#${id}-g)" transform="translate(3 2.4)">${body}</g><g filter="url(#${id}-w)">${post}</g></g>`; }
  if (set === 'chalk') { defs += icGrain(id + '-g', 2.2, .07, -1.25, .3); inner = `<rect x="3" y="3" width="94" height="94" rx="27" fill="${icMix(P.theme, '#2E3A36', .16)}"/><g filter="url(#${id}-g)" transform="translate(50 50) scale(.7) translate(-50 -50)"><g${rot}>${body}</g></g>`; }
  if (set === 'sticker') { defs += `<filter id="${id}-sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="2.4" flood-color="#8A6A4A" flood-opacity=".28"/></filter>`; inner = `<g filter="url(#${id}-sh)" transform="translate(50 50) scale(.9) translate(-50 -50)">${inner}</g>`; }
  if (set === 'solid') { defs += `<linearGradient id="${id}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${icMix(P.theme, '#FFFFFF', .12)}"/><stop offset="1" stop-color="${icMix(P.theme, '#3A2E2A', .08)}"/></linearGradient>`;
    inner = `<circle cx="50" cy="50" r="49" fill="url(#${id}-bg)"/><g transform="translate(50 50) scale(.66) translate(-50 -50)">${inner}</g>`; }
  if (set === 'jelly') { defs += `<filter id="${id}-sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="4" stdDeviation="2.6" flood-color="${icMix(P.theme, '#3A2E2A', .3)}" flood-opacity=".3"/></filter>`; inner = `<g filter="url(#${id}-sh)" transform="translate(50 48) scale(.94) translate(-50 -50)">${inner}</g>`; }
  return `<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true">${defs ? `<defs>${defs}</defs>` : ''}${inner}</svg>`;
}
if (typeof module !== 'undefined') module.exports = { ICON_PAL, ICON_SHAPES, ICON_SETS, ICON_STAR, iconSVG, icMix };
