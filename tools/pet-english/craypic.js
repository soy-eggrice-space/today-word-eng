const CRAY_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="crw" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="1" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter></defs></svg>`;
function crayPic(svg) {
  const INK = '#3B3340', LINE = '#5A3E30', DARK = '#4A3530';
  const hex = h => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const edge = f => { const a = hex(f), b = [138, 82, 48], lum = (a[0] * .3 + a[1] * .59 + a[2] * .11) / 255, t = lum > .86 ? .5 : .42; return '#' + a.map((v, i) => Math.round(v * (1 - t) + b[i] * t).toString(16).padStart(2, '0')).join(''); };
  const out = svg.replace(/<(path|ellipse|circle|rect|line|polygon|polyline|g)\b[^>]*>/g, tag => {
    let t = tag; const f = (t.match(/\bfill="([^"]+)"/) || [])[1], s = (t.match(/\bstroke="([^"]+)"/) || [])[1];
    if (s === INK) t = t.replace(/\bstroke="[^"]+"/, `stroke="${!f || /^none$/i.test(f) || f === INK || !/^#[0-9a-f]{3,6}$/i.test(f) ? LINE : edge(f)}"`);
    if (f === INK) t = t.replace(/\bfill="[^"]+"/, `fill="${DARK}"`);
    return t; });
  const a = out.indexOf('>') + 1, b = out.lastIndexOf('</svg>');
  return out.slice(0, a) + '<g filter="url(#crw)">' + out.slice(a, b) + '</g>' + out.slice(b);
}
if (typeof module !== 'undefined') module.exports = { crayPic, CRAY_DEFS };
