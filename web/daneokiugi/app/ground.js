'use strict';

const GK = '#4A4138', GS = 1.25, GX = 0, GY = 60;

const GXLV = [{ sx: 1.15, sy: 1.45, rows: 3, d: 1.55 }, { sx: 1.3, sy: 1.9, rows: 4, d: 2.1 }, { sx: 1.45, sy: 2.35, rows: 5, d: 2.65 }];
const XLCOST = [null, { s: 80, w: 300, t: 200 }, { s: 160, w: 600, t: 400 }];
let GXL = 0, GSX = 1, GSY = 1;
const MX = x => x * GSX, MY = y => y <= 500 ? y * GSY : 500 * GSY + (y - 500), MP = ([x, y]) => [MX(x), MY(y)];
let GW = 960, GH = 825, GCORE = { x: 0, w: GW };
const gx = x => Math.round(GX + x * GS), gy = y => Math.round(GY + y * GS);
let PLAZA, GTROPHY;
const f1 = n => +(+n).toFixed(1);
function gsm(pts, closed) {
  const n = pts.length, p = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) { const a = p(i - 1), b = p(i), c = p(i + 1), e = p(i + 2);
    d += `C${f1(b[0] + (c[0] - a[0]) / 6)} ${f1(b[1] + (c[1] - a[1]) / 6)} ${f1(c[0] - (e[0] - b[0]) / 6)} ${f1(c[1] - (e[1] - b[1]) / 6)} ${f1(c[0])} ${f1(c[1])}`; }
  return d + (closed ? 'Z' : '');
}
const gp = (d, fill, sw, st) => `<path d="${d}" fill="${fill || 'none'}" stroke="${sw === 0 ? 'none' : st || GK}" stroke-width="${sw == null ? 2 : sw}" stroke-linejoin="round" stroke-linecap="round"/>`;
const gel = (x, y, rx, ry, fill, sw, st) => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill || 'none'}" stroke="${sw === 0 ? 'none' : st || GK}" stroke-width="${sw == null ? 2 : sw}"/>`;
const grnd = (seed, i) => { const v = Math.sin(seed * 127.1 + i * 311.7) * 43758.5453; return v - Math.floor(v); };
function gblobPts(cx, cy, rx, ry, seed, wob, n) { n = n || 12; const P = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + (grnd(seed, i) - .5) * (wob == null ? .16 : wob); P.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]); } return P; }
const gblob = (cx, cy, rx, ry, seed, wob, n) => gsm(gblobPts(cx, cy, rx, ry, seed, wob, n), true);
const gtuft = (x, y, c, s) => gp(`M${x} ${y}l${-3 * (s || 1)} ${-7 * (s || 1)}M${x} ${y}v${-9 * (s || 1)}M${x} ${y}l${3 * (s || 1)} ${-7 * (s || 1)}`, 'none', 1.8, c);
const gflower = (x, y, c) => [[-3, 0], [3, 0], [0, -3], [0, 3]].map(([a, b]) => gel(x + a, y + b, 2.3, 2.3, c, 0)).join('') + gel(x, y, 1.6, 1.6, '#FFE27A', 0);
const gsign = (x, y, t) => { const w = Math.max(24, t.replace(/ /g, '').length * 5.6 + (t.includes(' ') ? 2 : 0) + 11); return gp(`M${x - w} ${y - 9}h${w * 2}a4 4 0 0 1 4 4v10a4 4 0 0 1 -4 4h${-w * 2}a4 4 0 0 1 -4 -4v-10a4 4 0 0 1 4 -4Z`, '#F6E2BC', 1.6) + gel(x - w + 1.5, y, 1.3, 1.3, GK, 0) + gel(x + w - 1.5, y, 1.3, 1.3, GK, 0) + `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="10.5" fill="${GK}" style="font-family:var(--D)">${t}</text>`; };
const gwave = (x, y, c) => gp(`M${x - 8} ${y}q4 -4 8 0t8 0`, 'none', 1.8, c || '#FFFFFF');
const gstar4 = (x, y, r, c, sw) => gp(`M${x} ${f1(y - r)}l${f1(r * .3)} ${f1(r * .7)} ${f1(r * .7)} ${f1(r * .3)} ${f1(-r * .7)} ${f1(r * .3)} ${f1(-r * .3)} ${f1(r * .7)} ${f1(-r * .3)} ${f1(-r * .7)} ${f1(-r * .7)} ${f1(-r * .3)} ${f1(r * .7)} ${f1(-r * .3)}Z`, c, sw == null ? 1.4 : sw);
const gheart = (x, y, s, c, sw) => gp(`M${x} ${f1(y + 5 * s)}c${f1(-9 * s)} ${f1(-5 * s)} ${f1(-8 * s)} ${f1(-13 * s)} ${f1(-3.4 * s)} ${f1(-13 * s)}c${f1(1.8 * s)} 0 ${f1(2.9 * s)} ${f1(1.3 * s)} ${f1(3.4 * s)} ${f1(2.6 * s)}c${f1(.5 * s)} ${f1(-1.3 * s)} ${f1(1.6 * s)} ${f1(-2.6 * s)} ${f1(3.4 * s)} ${f1(-2.6 * s)}c${f1(4.6 * s)} 0 ${f1(5.6 * s)} ${f1(8 * s)} ${f1(-3.4 * s)} ${f1(13 * s)}Z`, c, sw == null ? 1.5 : sw);

const GWHT = '#FFFDF6';

function gcr(P) { const out = [], n = P.length, g = i => P[Math.max(0, Math.min(n - 1, i))]; for (let i = 0; i < n - 1; i++) { const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2), cnt = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 4)); for (let k = 0; k < cnt; k++) { const t = k / cnt, t2 = t * t, t3 = t2 * t, f = j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3); out.push([f(0), f(1)]); } } out.push(P[n - 1]); return out; }
const gdp = (pts, close) => 'M' + pts.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + (close ? 'Z' : '');
function gevery(pts, d) { const out = []; let acc = d / 2; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; acc += Math.hypot(b[0] - a[0], b[1] - a[1]); if (acc >= d) { acc = 0; out.push(b); } } return out; }
const gop = (str, a) => str.replace(/<(path|ellipse)/g, '<$1 opacity="' + a + '"');
const gblobF = (cx, cy, rx, ry, seed, wob, fill, st) => gp(gsm(gblobPts(cx, cy, rx, ry, seed, wob == null ? .14 : wob, 14), true), fill, st ? 1.5 : 0, st);

const GFH = 18;
const R_GH0 = ([[-10, 27], [60, 22], [140, 28], [220, 23], [300, 28], [390, 22], [480, 28], [570, 23], [650, 27], [720, 22], [778, 26]]);
const R_GE1 = [[-10, 150], [80, 160], [180, 168], [290, 170], [380, 166], [440, 150], [486, 112], [512, 66], [528, 27]];
const R_GE2 = [[-10, 330], [80, 322], [170, 326], [270, 332], [370, 338], [460, 334], [550, 326], [640, 322], [720, 328], [778, 324]];
function glevel(E, hx, top, face, tick, shade) {
  const D = gcr(E), dn = k => D.map(p => [p[0], p[1] + k]), hz = GH0.filter(p => p[0] >= hx[0] - 1 && p[0] <= hx[1] + 1).reverse();
  let q = gp(gdp(dn(GFH - 4).concat(dn(GFH + 9).reverse()), true), shade, 0) + gp(gdp(D.concat(dn(GFH).reverse()), true), face, 1.8) + gp(gdp(dn(GFH * .6)), 'none', 1.3, tick);
  let a = '', b = ''; gevery(D, 12).forEach(p => { if (p[1] > 40) { a += gel(p[0], p[1] + 1, 7.5, 7.5, GK, 0); b += gel(p[0], p[1] + 1, 5.9, 5.9, top, 0); } });
  return q + a + b + gp(gdp(D.map(p => [p[0], p[1] + 1]).concat(hz), true), top, 0);
}

const R_GPATHS = [[[-10, 128], [90, 134], [180, 140], [270, 142], [340, 138], [392, 126]], [[270, 142], [270, 166]], [[270, 206], [272, 254], [270, 306]],
  [[-10, 306], [90, 304], [180, 308], [270, 306], [360, 312], [450, 308], [540, 306], [596, 284], [640, 240], [668, 194], [676, 158]], [[540, 306], [620, 308], [700, 302], [778, 306]],
  [[400, 310], [400, 334]], [[400, 372], [402, 414], [400, 458]], [[-10, 458], [100, 462], [200, 456], [300, 460], [400, 458], [500, 462], [600, 456], [700, 460], [778, 458]],
  [[400, 458], [402, 524], [400, 590]], [[-10, 590], [100, 594], [200, 588], [300, 592], [400, 590], [500, 594], [600, 588], [700, 592], [778, 590]]];

const R_GLOTS = [44, 104, 164, 224, 284, 344, 456, 516, 576, 636, 696, 748].map(x => [x, 540]);
const R_GSTAIRS = [[270, 166, 42], [400, 334, 42]];
function gstair(x, y, len, cA, cB, sh) { const w = 30, w2 = 40, n = Math.round(len / 7), W = t => w + (w2 - w) * t; let q = gel(x, y + len + 2, w2 / 2 + 3, 5, sh, 0);
  for (let i = 0; i < n; i++) { const t1 = i / n, t2 = (i + 1) / n; q += gp('M' + f1(x - W(t1) / 2) + ' ' + f1(y + len * t1) + 'h' + f1(W(t1)) + 'L' + f1(x + W(t2) / 2) + ' ' + f1(y + len * t2) + 'h' + f1(-W(t2)) + 'Z', i % 2 ? cB : cA, 1.4); }
  return q + gp('M' + (x - w / 2) + ' ' + y + 'h' + w + 'l' + ((w2 - w) / 2) + ' ' + len + 'h' + (-w2) + 'Z', 'none', 1.9); }
const gtreeT = (x, y, r, c, tr) => gp('M' + x + ' ' + y + 'v' + f1(-r * .9), 'none', Math.max(2.6, r * .24), tr) + gel(x, y - r * 1.55, r, r * .94, c, 0) + gop(gel(x - r * .32, y - r * 1.85, r * .32, r * .24, GWHT, 0), .45);
const gbushT = (x, y, k, c) => gel(x - 7 * k, y - 5 * k, 7 * k, 6 * k, c, 0) + gel(x + 7 * k, y - 5 * k, 7 * k, 6 * k, c, 0) + gel(x, y - 9 * k, 8.5 * k, 7.5 * k, c, 0);
const grockT = (x, y, w, h, c) => gp('M' + f1(x - w / 2) + ' ' + y + 'q' + f1(w * .06) + ' ' + (-h) + ' ' + f1(w * .5) + ' ' + (-h) + 't' + f1(w * .5) + ' ' + h + 'Z', c || '#DAD4C6', 0);

const R_GTREES = [[548, 150, 11], [742, 212, 14], [718, 246, 10], [754, 264, 11], [706, 256, 9], [20, 214, 11], [22, 398, 12], [742, 400, 14], [760, 372, 9], [300, 236, 9]];
const R_GBUSH = [[232, 206, .8], [520, 204, .8], [356, 388, .8], [446, 384, .8], [36, 372, .8], [724, 366, .8], [584, 206, .7]];
const R_GTUFT = [[30, 508], [372, 500], [430, 502], [760, 506], [250, 604], [560, 606], [290, 60], [380, 84], [20, 110], [500, 232], [330, 222], [596, 250], [746, 300], [20, 474], [250, 474], [450, 474], [660, 474], [336, 420], [440, 424], [746, 130], [556, 100], [230, 250], [20, 290]];

const R_GZR = [
  [[14, 46], [80, 38], [170, 42], [250, 38], [326, 48], [350, 80], [334, 106], [260, 112], [170, 114], [90, 112], [22, 108], [8, 76]],
  [[550, 46], [640, 40], [736, 44], [770, 64], [772, 150], [770, 222], [772, 288], [700, 290], [644, 288], [656, 264], [700, 250], [714, 204], [706, 164], [690, 142], [650, 134], [600, 138], [560, 130], [540, 98]],
  [[12, 192], [90, 186], [170, 190], [242, 198], [248, 240], [244, 280], [170, 286], [90, 284], [16, 282], [6, 238]],
  [[298, 196], [378, 192], [430, 178], [468, 148], [494, 114], [518, 98], [540, 142], [580, 152], [628, 152], [650, 174], [638, 212], [612, 248], [580, 274], [520, 284], [450, 286], [418, 270], [384, 262], [352, 272], [322, 282], [296, 280], [290, 238]],
  [[10, 356], [90, 350], [180, 352], [280, 358], [370, 362], [380, 400], [372, 440], [280, 442], [180, 438], [90, 442], [14, 440], [4, 398]],
  [[428, 360], [520, 354], [620, 350], [720, 354], [768, 360], [772, 400], [768, 440], [680, 442], [560, 438], [460, 442], [426, 438], [420, 398]]];
const R_HOLE = [null, null, null, null, [120, 410, 92, 26], null];

function gIn(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function gSpans(P, y) { const xs = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0])); } xs.sort((p, q) => p - q); const s = []; for (let i = 0; i + 1 < xs.length; i += 2) s.push([xs[i], xs[i + 1]]); return s; }
const gInZones = (x, y, m) => GZD.some(z => gIn(z.poly, x, y) || (m && [[m, 0], [-m, 0], [0, m], [0, -m]].some(([a, b]) => gIn(z.poly, x + a, y + b))));

function gzr(z, k, T) {
  const P = z.poly, sm = gsm(P, true), [kind, c, dec, dc] = k, ys = P.map(p => p[1]), top = Math.min(...ys), bot = Math.max(...ys), cy = (top + bot) / 2;
  let q = '';
  if (kind === 'pit') q += gp(sm, c[1], 13, c[1]) + gp(sm, c[0], 8, c[0]);
  else if (kind === 'pond') { const H = z.hole, hx = H.map(p => p[0]), hy = H.map(p => p[1]); q += gp(sm, '#F6EBC8', 1.5, '#E6D6A6') + gp(gsm(H, true), c[0], 1.5, c[1]); for (let i = 0; i < 7; i++) { const x = Math.min(...hx) + 16 + grnd(4, i) * (Math.max(...hx) - Math.min(...hx) - 32), y = Math.min(...hy) + 10 + grnd(5, i) * (Math.max(...hy) - Math.min(...hy) - 20); if (gIn(H, x, y)) q += gwave(x, y); } }
  else q += gp(sm, c[0], 1.5, c[1]);
  const edge = gevery(gcr(P.concat([P[0]])), 46);
  if (kind === 'rock') edge.forEach((p, i) => { if (p[1] < cy && i % 2 === 0) q += grockT(p[0], p[1] + 10, 18 + (i % 3) * 6, 11 + (i % 3) * 4); });
  if (kind === 'glade') edge.forEach((p, i) => { if (p[1] < cy - 4) q += gtreeT(p[0], p[1] + 6, 11 + (i % 3) * 3, T.tree, T.trunk); });
  if (kind === 'pit') edge.forEach((p, i) => { if (i % 2 === 0) q += gp('M' + f1(p[0]) + ' ' + f1(p[1]) + 'v-10', 'none', 3, c[1]); });
  if (kind === 'pond') gevery(gcr(z.hole.concat([z.hole[0]])), 40).forEach((p, i) => { if (i % 2 === 1) q += gp('M' + f1(p[0] - 3) + ' ' + f1(p[1]) + 'l-2 -7M' + f1(p[0]) + ' ' + f1(p[1]) + 'v-9M' + f1(p[0] + 3) + ' ' + f1(p[1]) + 'l2 -7', 'none', 2, '#8FBF7C'); });
  if (dec && GDEC[dec]) { const y = top + 16, s = gSpans(P, y + 10).sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))[0]; if (s) q += GDEC[dec](s[0] + 14, Math.min(220, s[1] - s[0] - 28), y, dc || c[1]); }
  return q;
}
const GZK = {
  dino: [['rock', ['#ECE9E0', '#D5D0C4']], ['glade', ['#D6EEC4', '#BCDAA6']], ['plain', ['#FBE8CC', '#E8CDA2']], ['pit', ['#F5E9C4', '#DBCB94']], ['pond', ['#CFE8F5', '#B0D5EA']], ['plain', ['#FDE6DD', '#EFC4B6'], 'flags']],
  chara: [['plain', ['#FFE9D2', '#F2CDA6'], 'awning'], ['plain', ['#E5E6FB', '#C7C9F0'], 'stars'], ['plain', ['#DDF2D6', '#B8DDB0'], 'flowers', '#F2BFD0'], ['pit', ['#FBE0EE', '#EFC0D8'], 'garland', '#E9B2CE'], ['plain', ['#DDEFFB', '#B7D8EF'], 'notes', '#A9CDE8'], ['plain', ['#FFE1DD', '#F2BDB8'], 'hearts']],
  animal: [['pit', ['#EBDCC0', '#D2BE98'], 'furrows'], ['plain', ['#FBEFC8', '#E4D29A'], 'hay'], ['glade', ['#D2E8C0', '#AFD09C']], ['plain', ['#FBE3EC', '#EFC2D2'], 'flowers'], ['pond', ['#D7ECF6', '#B2D6EA']], ['plain', ['#FFE9D6', '#F0CBA8'], 'picnic']] };
const R_GZD = [{ cx: 150, by: 80, w: 220, cap: 8, sg: [72, 40] }, { cx: 660, by: 98, w: 180, cap: 6, sg: [598, 50] }, { cx: 120, by: 242, w: 190, cap: 6, sg: [62, 192] }, { cx: 440, by: 240, w: 250, cap: 9, sg: [350, 192] }, { cx: 190, by: 396, w: 280, cap: 9, sg: [90, 358] }, { cx: 590, by: 394, w: 230, cap: 7, sg: [512, 352] }];
let GH0, GE1, GE2, GPATHS, GLOTS, GSTAIRS, GTREES, GBUSH, GTUFT, GZD, GZ, NAV;
const gzb = (z, c, ry, seed, wob) => { ry *= z.d || 1; return gblobF(z.cx, z.by - ry * .5, z.w / 2, ry, seed, wob, c[0], c[1]); };
const gzpit = (z, c) => { const D = z.d || 1, x0 = z.cx - z.w / 2, d = 'M' + (x0 + 12) + ' ' + (z.by - 38 * D) + 'L' + (x0 + z.w - 16) + ' ' + (z.by - 42 * D) + 'L' + (x0 + z.w - 6) + ' ' + (z.by + 4) + 'L' + (x0 + 6) + ' ' + (z.by + 8) + 'Z'; return gp(d, c[1], 19, c[1]) + gp(d, c[0], 15, c[0]) + gop(gp('M' + (x0 + 10) + ' ' + (z.by - 40 * D) + 'L' + (x0 + z.w - 14) + ' ' + (z.by - 44 * D), 'none', 5, c[1]), .6); };
const gzposts = (z, c, n) => { const x0 = z.cx - z.w / 2; let q = ''; for (let i = 0; i <= n; i++) { const x = x0 + 8 + (z.w - 22) * i / n, y = z.by - 46 - 4 * i / n; q += gp('M' + f1(x) + ' ' + f1(y) + 'v-12', 'none', 3, c); if (i < n) q += gp('M' + f1(x) + ' ' + f1(y - 10) + 'q' + f1((z.w - 22) / n / 2) + ' 6 ' + f1((z.w - 22) / n) + ' ' + f1(-4 / n), 'none', 1.4, c); } return q; };
const GDEC = {
  awning: (x, W, y, c) => { let q = gp('M' + (x + 24) + ' ' + (y + 8) + 'v22M' + (x + W - 26) + ' ' + (y + 8) + 'v22', 'none', 3, c); const n = Math.floor((W - 44) / 14); for (let i = 0; i < n; i++) q += gp('M' + (x + 22 + i * 14) + ' ' + (y + 2) + 'h14v9a7 7 0 0 1 -14 0Z', i % 2 ? GWHT : c, 0); return q + gp('M' + (x + 20) + ' ' + (y + 2) + 'h' + (n * 14 + 4), 'none', 3, c); },
  stars: (x, W, y, c) => [[x + 24, y + 14, 6], [x + 60, y + 6, 4], [x + 100, y + 16, 5], [x + W - 30, y + 10, 6.5], [x + W - 70, y + 20, 4], [x + 44, y + 34, 3.5], [x + W - 50, y + 38, 3.5]].map(([a, b, r]) => gstar4(a, b, r, c, 0)).join('') + gp('M' + (x + W / 2 + 22) + ' ' + (y + 2) + 'a9 9 0 1 0 8 13a7 7 0 0 1 -8 -13Z', GWHT, 0),
  flowers: (x, W, y, c) => [[x + 22, y + 12], [x + 44, y + 24], [x + 70, y + 10], [x + W / 2, y + 20], [x + W - 66, y + 10], [x + W - 40, y + 24], [x + W - 20, y + 12], [x + 30, y + 40], [x + W - 30, y + 40]].map(([a, b], i) => gflower(a, b, i % 2 ? GWHT : c)).join('') + gtuft(x + 56, y + 40, c) + gtuft(x + W - 58, y + 42, c),
  garland: (x, W, y, c) => { let q = gp('M' + (x + 14) + ' ' + (y + 26) + 'V' + (y + 2) + 'M' + (x + W - 14) + ' ' + (y + 22) + 'V' + (y - 2), 'none', 3, c) + gp('M' + (x + 14) + ' ' + (y + 4) + 'Q' + (x + W / 2) + ' ' + (y + 20) + ' ' + (x + W - 14) + ' ' + y, 'none', 1.5, c); for (let i = 1; i < 12; i++) { const t = i / 12, a = x + 14 + (W - 28) * t, b = y + 4 - 4 * t + 32 * t * (1 - t); q += i % 3 === 0 ? gp('M' + f1(a) + ' ' + f1(b + 2) + 'l-6 -3v8l6 -3 6 3v-8Z', c, 0) : gel(a, b + 3, 3.3, 3.3, i % 2 ? GWHT : c, 0); } return q; },
  notes: (x, W, y, c) => [0, 7, 14].map(d => gp('M' + (x + 18) + ' ' + (y + 8 + d) + 'q' + f1((W - 36) / 4) + ' -6 ' + f1((W - 36) / 2) + ' 0t' + f1((W - 36) / 2) + ' 0', 'none', 1.3, c)).join('') + [[x + 40, y + 20], [x + 84, y + 12], [x + W - 70, y + 22], [x + W - 34, y + 14]].map(([a, b]) => gel(a, b, 4.4, 3.4, c, 0) + gp('M' + (a + 4) + ' ' + b + 'v-13', 'none', 1.8, c)).join(''),
  hearts: (x, W, y, c) => [[x + 26, y + 16, 1], [x + 62, y + 10, .7], [x + W / 2 + 4, y + 20, .9], [x + W - 60, y + 10, .7], [x + W - 26, y + 18, 1.1], [x + 46, y + 40, .6], [x + W - 44, y + 42, .6]].map(([a, b, k], i) => gheart(a, b, k, i % 3 === 1 ? GWHT : c, 0)).join(''),
  furrows: (x, W, y, c) => [8, 21, 34].map((d, j) => gp('M' + (x + 16) + ' ' + (y + d) + 'q' + f1((W - 32) / 8) + ' -4 ' + f1((W - 32) / 4) + ' 0t' + f1((W - 32) / 4) + ' 0t' + f1((W - 32) / 4) + ' 0t' + f1((W - 32) / 4) + ' 0', 'none', 3, c) + [0, 1, 2, 3, 4].map(i => gtuft(x + 30 + j * 9 + i * (W - 70) / 4, y + d, '#B4D99C', .7)).join('')).join(''),
  hay: (x, W, y, c) => { let q = gp('M' + (x + 16) + ' ' + (y + 6) + 'H' + (x + W - 16) + 'M' + (x + 16) + ' ' + (y + 13) + 'H' + (x + W - 16), 'none', 2.2, c); for (let a = x + 18; a < x + W - 14; a += 23) q += gp('M' + a + ' ' + (y + 1) + 'v18', 'none', 3, c); return q + gp('M' + (x + W - 62) + ' ' + (y + 40) + 'v-12q14 -6 28 0v12Z', '#F4E3A6', 0) + gp('M' + (x + 30) + ' ' + (y + 42) + 'v-10q11 -5 22 0v10Z', '#F4E3A6', 0); },
  picnic: (x, W, y, c) => { let q = ''; for (let j = 0; j < 3; j++) for (let i = 0; i < 9; i++) if ((i + j) % 2) q += gp('M' + (x + W / 2 - 58 + i * 13 - j * 3) + ' ' + (y + 6 + j * 11) + 'h13l-3 11h-13Z', c, 0); return gop(gp('M' + (x + W / 2 - 60) + ' ' + (y + 5) + 'h119l-9 35h-119Z', GWHT, 0), .7) + q; },
  flags: (x, W, y, c) => { const x1 = x + 12, x2 = x + W - 12; let q = gp('M' + x1 + ' ' + (y + 32) + 'V' + y + 'M' + x2 + ' ' + (y + 28) + 'V' + (y - 4), 'none', 3, c) + gp('M' + x1 + ' ' + y + 'Q' + (x + W / 2) + ' ' + (y + 14) + ' ' + x2 + ' ' + (y - 4), 'none', 1.5, c); for (let i = 1; i < 9; i++) { const t = i / 9, a = x1 + (x2 - x1) * t, b = y - 4 * t + 28 * t * (1 - t); q += gp('M' + f1(a - 5) + ' ' + f1(b) + 'h10l-5 9Z', i % 2 ? c : GWHT, 0); } return q; } };
const gdec = (k, z, c, dy) => GDEC[k](z.cx - z.w / 2, z.w, z.by - (dy || 46) - ((z.d || 1) - 1) * 40, c);
const gglade = (z, c, T) => { const n = Math.max(4, Math.round(z.w / 30)), R = [15, 11, 18, 12, 16, 10, 14]; let q = ''; for (let i = 0; i < n; i++) { const t = i / (n - 1), x = z.cx - z.w / 2 + 8 + (z.w - 16) * t + (i % 2 ? 5 : -3); q += gtreeT(x, z.by - 30 * (z.d || 1) - Math.sin(t * Math.PI) * 12 + (i % 3) * 3, R[i % 7], T.tree, T.trunk); } return q + gzb(z, c, 27, 5, .18) + gtuft(z.cx - z.w * .34, z.by + 4, c[1]) + gtuft(z.cx + z.w * .3, z.by - 30, c[1]) + gflower(z.cx + z.w * .38, z.by + 2, GWHT); };
const gpond = (z, c) => { const D = z.d || 1; return gblobF(z.cx - 6, z.by - 26 * D, z.w / 2, 30 * D, 11, .16, c[0], c[1]) + [[-.3, -40], [.1, -32], [-.12, -18], [.3, -44], [-.1, -56], [.22, -66]].filter((_, i) => i < 4 || D > 1.2).map(([a, b]) => gwave(z.cx + z.w * a, z.by + b * D, GWHT)).join('') + gel(z.cx - z.w * .4, z.by - 22 * D, 7, 4, '#C4E6B8', 0) + gp('M' + f1(z.cx + z.w * .4) + ' ' + (z.by - 30 * D) + 'v-15M' + f1(z.cx + z.w * .4 + 6) + ' ' + (z.by - 28 * D) + 'v-10', 'none', 2, '#A9D092') + gblobF(z.cx + 6, z.by - 3, z.w * .42, 13, 2, .14, '#FBF3DA', '#E6DAB0'); };

const GTH = {
  dino: { sky: '#EEF5E6', top: ['#F1E8C2', '#FCF3D6', '#DDF0C6'], face: ['#DCCB95', '#E8D8A6'], tick: ['#C2AF74', '#CDBB82'], shade: ['#EFE3BE', '#CCE4B2'], road: '#FFF8E2', edge: '#DCCF9E', st: ['#F6F1E4', '#E6DECB'], tree: '#BEDDA8', trunk: '#D2C29A', tuft: ['#CFC48F', '#DCCB95', '#B7D79F'], ped: '#DCD0A2',
    back: () => gp(gsm([[-170, 40], [-120, 8], [-70, 22], [-20, 0], [30, 12], [70, 20], [120, 2], [170, 22], [215, 40]], false) + 'Z', '#DCE9CF', 0) + gp('M330 40L378 -26q14 -9 28 0L454 40Z', '#CBDDBD', 0) + gp('M378 -26q14 -9 28 0l5 8q-19 8 -38 0Z', '#F3C9A6', 0) + gel(398, -40, 9, 6, GWHT, 0) + gel(412, -50, 7, 4.6, GWHT, 0) + gel(388, -52, 5, 3.4, GWHT, 0) + gp('M236 40L266 0q9 -6 18 0L314 40Z', '#D8E6CB', 0) + gp(gsm([[450, 40], [500, 10], [550, 22], [600, 4], [660, 20], [660, 40]], false) + 'Z', '#DCE9CF', 0),
    zones: [
      (z, T) => gzb(z, ['#ECE9E0', '#D5D0C4'], 31, 3, .2) + grockT(z.cx - z.w * .3, z.by - 26, 34, 20) + grockT(z.cx - z.w * .12, z.by - 30, 20, 11) + grockT(z.cx + z.w * .28, z.by - 24, 40, 24) + [[-.38, -6], [.06, -34], [.4, -2], [.16, 6], [-.2, 8]].map(([a, b]) => gel(z.cx + z.w * a, z.by + b, 4, 2.6, '#D5D0C4', 0)).join(''),
      (z, T) => gglade(z, ['#D6EEC4', '#BCDAA6'], T),
      (z, T) => gzb(z, ['#FBE8CC', '#E8CDA2'], 37, 8, .12) + gp('M' + (z.cx + z.w * .12) + ' ' + (z.by - 28) + 'l19 -27 19 27Z', '#EBCFA3', 0) + gop(gp('M' + (z.cx + z.w * .12 + 19) + ' ' + (z.by - 46) + 'l-6 18h12Z', GWHT, 0), .6) + gp('M' + (z.cx - z.w * .36) + ' ' + (z.by - 34) + 'h24', 'none', 8, '#E8CDA2') + gel(z.cx - z.w * .36 + 24, z.by - 34, 2.6, 4, '#F6E3C6', 0),
      (z, T) => gzpit(z, ['#F5E9C4', '#DBCB94']) + gzposts(z, '#D2C08A', Math.round(z.w / 34)),
      (z, T) => gpond(z, ['#CFE8F5', '#B0D5EA']),
      (z, T) => gzb(z, ['#FDE6DD', '#EFC4B6'], 28, 6, .08) + gdec('flags', z, '#EFC4B6', 54)] },
  chara: { sky: '#F5F0FC', top: ['#F4EAFB', '#FFF4E6', '#FDEAF0'], face: ['#F3DDB9', '#F3DDB9'], tick: ['#E2C596', '#E2C596'], shade: ['#F6E7D2', '#F6D9E3'], road: '#FFFDF6', edge: '#EBD9E6', st: ['#FFF8FB', '#F3DCE9'], tree: '#F6CADB', trunk: '#E6D3C2', tuft: ['#DCC9EE', '#F1D3B0', '#F2C3D2'], ped: '#E2D3F0',
    back: () => [[56, '#F7C6D6'], [47, '#FCE5B0'], [38, '#BFE3CF']].map(([r, c]) => '<circle cx="404" cy="34" r="' + r + '" fill="none" stroke="' + c + '" stroke-width="9"/>').join('') + [[-110, -6, 1.1], [40, -22, 1], [176, -4, .8], [300, -30, .9], [520, -14, 1.1], [610, 6, .8]].map(([x, y, s]) => gel(x - 11 * s, y + 3 * s, 9 * s, 7 * s, GWHT, 0) + gel(x + 11 * s, y + 3 * s, 9 * s, 7 * s, GWHT, 0) + gel(x, y - 2 * s, 12 * s, 10 * s, GWHT, 0)).join('') + gp('M96 40v-34l10 -12 10 12v34ZM116 40v-48l12 -14 12 14v48ZM140 40v-30l10 -12 10 12v30Z', '#E4D7F4', 0) + gp('M124 -6h8v10h-8Z', '#F5F0FC', 0),
    zones: [
      (z, T) => gzb(z, ['#FFE9D2', '#F2CDA6'], 31, 3, .12) + gdec('awning', z, '#F2CDA6', 56),
      (z, T) => gp('M' + (z.cx - z.w * .46) + ' ' + (z.by - 26 * (z.d || 1)) + 'q' + f1(z.w * .46) + ' ' + f1(-58 * (z.d || 1)) + ' ' + f1(z.w * .92) + ' 0Z', '#D6D8F6', 0) + gzb(z, ['#E5E6FB', '#C7C9F0'], 27, 5, .16) + gdec('stars', z, '#C7C9F0', 62),
      (z, T) => gzb(z, ['#DDF2D6', '#B8DDB0'], 37, 8, .12) + gdec('flowers', z, '#F2BFD0', 52),
      (z, T) => gzpit(z, ['#FBE0EE', '#EFC0D8']) + gdec('garland', z, '#E9B2CE', 62),
      (z, T) => gel(z.cx, z.by - 18 * (z.d || 1), z.w / 2, 33 * (z.d || 1), '#DDEFFB', 1.5, '#B7D8EF') + gel(z.cx, z.by - 18 * (z.d || 1), z.w / 2 - 14, 24 * (z.d || 1), 'none', 1.3, '#B7D8EF') + gdec('notes', z, '#A9CDE8', 50),
      (z, T) => gzb(z, ['#FFE1DD', '#F2BDB8'], 28, 6, .08) + gdec('hearts', z, '#F2BDB8', 44)] },
  animal: { sky: '#EAF4F6', top: ['#E3F0C6', '#F8F0C8', '#D5EBBE'], face: ['#D2C08F', '#D8C797'], tick: ['#B9A674', '#BFAD7C'], shade: ['#EADFB2', '#C3DEAB'], road: '#FFF6DC', edge: '#D9CC98', st: ['#F6ECD0', '#E2D2A8'], tree: '#B3D69A', trunk: '#CDBB90', tuft: ['#B5D79C', '#D9CC98', '#A9D096'], ped: '#C9DFA8',
    back: () => gel(60, -22, 16, 16, '#FDEFBE', 0) + gp(gsm([[-170, 40], [-110, 6], [-40, 22], [40, -2], [130, 24], [200, 8], [270, 40]], false) + 'Z', '#D3E7BC', 0) + gp(gsm([[230, 40], [300, 12], [380, 22], [440, 0], [520, 16], [600, 2], [660, 20], [660, 40]], false) + 'Z', '#C6DEB0', 0) + gp('M372 40v-26l10 -13 16 -6 16 6 10 13v26Z', '#EBC4B3', 0) + gp('M388 40v-16h20v16Z', '#F6E2D6', 0) + gp('M434 40v-36q9 -9 18 0v36Z', '#E3D6C0', 0),
    zones: [
      (z, T) => gzpit(z, ['#EBDCC0', '#D2BE98']) + gdec('furrows', z, '#D2BE98', 40),
      (z, T) => gzb(z, ['#FBEFC8', '#E4D29A'], 31, 5, .16) + gdec('hay', z, '#E4D29A', 54),
      (z, T) => gglade(z, ['#D2E8C0', '#AFD09C'], T),
      (z, T) => gzb(z, ['#FBE3EC', '#EFC2D2'], 31, 5, .18) + gdec('flowers', z, '#EFC2D2', 48),
      (z, T) => gpond(z, ['#D7ECF6', '#B2D6EA']),
      (z, T) => gzb(z, ['#FFE9D6', '#F0CBA8'], 28, 6, .08) + gdec('picnic', z, '#F0CBA8', 44)] } };
const _gcache = {};
function gbuild(th) {
  const ck = th + GXL; if (_gcache[ck]) return _gcache[ck];
  const T = GTH[th];
  let s = '<g transform="translate(' + f1(144 * GSX) + ' 0) scale(' + GSX + ' 1)">' + T.back() + '</g>' + gp(gdp(GH0.concat([MP([778, 640]), MP([-10, 640])]), true), T.top[2], 0) + glevel(GE2, [MX(-10), MX(778)], T.top[1], T.face[1], T.tick[1], T.shade[1]) + glevel(GE1, [MX(-10), MX(528)], T.top[0], T.face[0], T.tick[0], T.shade[0]);
  GTREES.forEach(([x, y, r]) => { s += gtreeT(x, y, r, T.tree, T.trunk); }); GBUSH.forEach(([x, y, k]) => { s += gbushT(x, y, k, T.tree); });
  GTUFT.forEach(([x, y], i) => { const c = T.tuft[y < 150 && x < 480 ? 0 : y < 330 ? 1 : 2]; s += i % 3 === 1 ? gflower(x, y, GWHT) + gtuft(x + 8, y + 4, c, .8) : gtuft(x, y, c); });
  const PD = GPATHS.map(p => gdp(gcr(p))); s += PD.map(d => gp(d, 'none', 37, T.edge)).join('') + PD.map(d => gp(d, 'none', 32, T.road)).join('');
  GPATHS.forEach(p => { if (p.length > 3) gevery(gcr(p), 30).forEach((q, i) => { s += gel(q[0], q[1] + (i % 2 ? 9 : -9), 2.2, 1.5, T.edge, 0); }); });
  GSTAIRS.forEach(([x, y, len]) => { s += gstair(x, y, len, T.st[0], T.st[1], T.shade[1]); });
  GLOTS.forEach(([x, y]) => { s += gel(x, y - 2, 25, 8, T.top[1], 1.4, T.edge); });
  GZD.forEach((z, i) => { s += gzr(z, GZK[th][i], T); });
  s += gel(MX(440), MY(99), 30, 9, GWHT, 1.5, T.ped) + gGrow(T, th);
  return _gcache[ck] = `<svg class="ground" width="${GW}" height="${GH}" viewBox="0 0 ${GW} ${GH}" aria-hidden="true"><rect width="${GW}" height="${GH}" fill="${T.sky}"/><g transform="translate(${GX} ${GY}) scale(${GS})">${s}</g></svg>`;
}
const GROUND = { dino: () => gbuild('dino'), chara: () => gbuild('chara'), animal: () => gbuild('animal') };

const gsign2 = (x, y, t) => `<div class="obj sgn" style="transform:translate(${gx(x)}px,${gy(y)}px);z-index:${gy(y) + 30}"><svg width="1" height="1" aria-hidden="true"><g transform="scale(${GS})">${gp('M0 6v14', 'none', 2.6)}${gsign(0, 0, t)}</g></svg></div>`;
const gsigns = names => gsign2(MX(400), MY(494), '보금자리 줄') + gsign2(MX(60), MY(566), '탈것 길') + GZD.map((z, i) => `<div class="obj sgn" style="transform:translate(${gx(z.sg[0])}px,${gy(z.sg[1])}px);z-index:${gy(z.by) + 1}"><svg width="1" height="1" aria-hidden="true"><g transform="scale(${GS})">${gp('M0 6v14', 'none', 2.6)}${gsign(0, 0, names[i])}</g></svg></div>`).join('');

const R_NAVD = [[40, 140], [110, 142], [190, 146], [270, 148], [340, 145], [270, 170], [270, 204], [271, 256], [270, 312], [200, 313], [130, 311], [60, 311],
    [340, 317], [400, 316], [470, 314], [540, 312], [598, 290], [642, 246], [670, 200], [676, 166], [620, 314], [700, 308], [400, 338], [400, 372], [402, 416], [400, 464],
    [330, 465], [260, 463], [190, 464], [120, 466], [50, 464], [470, 466], [540, 464], [610, 463], [680, 465], [740, 464],
    [50, 598], [130, 600], [210, 596], [290, 599], [370, 597], [450, 600], [530, 597], [610, 595], [690, 598], [745, 597]];
const R_NAVP = [[0, 1], [1, 2], [2, 3], [3, 4], [3, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 11], [8, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18], [18, 19], [15, 20], [20, 21],
    [13, 22], [22, 23], [23, 24], [24, 25], [25, 26], [26, 27], [27, 28], [28, 29], [29, 30], [25, 31], [31, 32], [32, 33], [33, 34], [34, 35], [36, 37], [37, 38], [38, 39], [39, 40], [40, 41], [41, 42], [42, 43], [43, 44], [44, 45]];

function gGrow(T, th) {
  let q = '';
  const lamp = (x, y) => gp(`M${f1(x)} ${f1(y)}v-26`, 'none', 2.4, GK) + gp(`M${f1(x - 5)} ${f1(y)}h10`, 'none', 2.4, GK) + gel(x, y - 30, 5, 5, '#FFE27A', 1.8) + gop(gel(x, y - 30, 9, 9, '#FFF3B8', 0), .5);
  [R_GPATHS[0], R_GPATHS[3], R_GPATHS[7]].forEach((P, pi) => gevery(gcr(P.map(MP)), 118).forEach((pt, i) => { if (i % 2 === pi % 2 && !gInZones(pt[0], pt[1] - 20, 8)) q += lamp(pt[0], pt[1] - 20); }));
  const free = (x, y) => !gInZones(x, y, 12) && !GPATHS.some(P => P.some(p => Math.hypot(p[0] - x, p[1] - y) < 26)) && !GSTAIRS.some(([sx, sy, l]) => Math.abs(x - sx) < 34 && y > sy - 14 && y < sy + l + 34) && !GZD.some(z => Math.hypot(z.sg[0] - x, z.sg[1] - y) < 40);
  const fl = ['#F29BB5', GWHT, '#F7C94B', '#C9B6F2'];
  for (let i = 0; i < 60 * (GXL + 1); i++) { const x = 20 + grnd(7, i) * (MX(778) - 40), y = 60 + grnd(11, i) * (MY(500) - 80); if (free(x, y)) q += i % 3 ? gflower(x, y, fl[i % 4]) : gtuft(x, y, T.tuft[i % 3]); }
  if (GXL >= 1) {
    const bench = (x, y) => gp(`M${f1(x - 14)} ${f1(y)}h28v-6h-28Z`, '#E8C99A', 1.8) + gp(`M${f1(x - 11)} ${f1(y)}v6M${f1(x + 11)} ${f1(y)}v6`, 'none', 1.8);
    [[330, 120], [470, 290], [140, 440], [620, 440]].forEach(([x, y]) => { q += bench(MX(x), MY(y)); });
    for (let i = 0; i < 10; i++) { const x = i % 2 ? MX(778) - 14 - (i % 3) * 8 : 12 + (i % 3) * 8, y = MY(80) + i * (MY(470) - MY(80)) / 10; if (free(x, y)) q += gtreeT(x, y, 10 + (i % 3) * 2, T.tree, T.trunk); }
  }
  if (GXL >= 2) {
    const cand = []; for (let y = MY(120); y < MY(480); y += 18) for (let x = 70; x < MX(778) - 70; x += 18) cand.push([x, y]);
    cand.sort((a, b) => Math.hypot(a[0] - MX(384), a[1] - MY(300)) - Math.hypot(b[0] - MX(384), b[1] - MY(300)));
    const at = cand.find(([x, y]) => [[0, 0], [-46, 0], [46, 0], [0, -60], [-30, -40], [30, -40]].every(([a, b]) => free(x + a, y + b)));
    if (at) q += `<g transform="translate(${f1(at[0])} ${f1(at[1])}) scale(1.5)">${gPlazaDeco(th, 0, 0, T)}</g>`;
    [[120, 300], [660, 300], [380, 470]].forEach(([bx, by], j) => { const x0 = MX(bx), y0 = MY(by); if (!free(x0, y0)) return; q += gop(gel(x0, y0, 46, 15, T.tuft[0], 0), .55); for (let i = 0; i < 15; i++) q += gflower(x0 - 36 + (i % 5) * 18 + (Math.floor(i / 5) % 2) * 9, y0 - 9 + Math.floor(i / 5) * 9, fl[(i + j) % 4]); });
  }
  return q;
}

function gPlazaDeco(th, x, y, T) {
  if (th === 'animal') return gel(x, y + 2, 30, 8, '#E8D2A6', 1.8) + gp(`M${x - 22} ${y}v-30M${x + 22} ${y}v-30M${x - 8} ${y + 3}v-30M${x + 8} ${y + 3}v-30`, 'none', 3) + gp(`M${x - 34} ${y - 30}L${x} ${y - 52}L${x + 34} ${y - 30}Z`, '#E07A5F', 2) + gp(`M${x - 30} ${y - 30}h60`, 'none', 2) + gel(x, y - 54, 3, 3, '#F7C94B', 1.5);
  if (th === 'chara') { let s = gel(x, y + 2, 30, 8, '#F6D9E4', 1.8); [-20, -7, 7, 20].forEach((d, i) => { s += gp(`M${x + d} ${y}v-32`, 'none', 2, '#B48CC9') + gel(x + d, y - 12 - (i % 2) * 6, 5, 4, ['#F29BB5', '#C9B6F2', '#F7C94B', '#9ED3E8'][i], 1.5); });
    return s + gp(`M${x - 32} ${y - 32}Q${x} ${y - 62} ${x + 32} ${y - 32}Z`, '#F29BB5', 2) + gp(`M${x - 16} ${y - 33}Q${x - 8} ${y - 52} ${x} ${y - 47}M${x + 16} ${y - 33}Q${x + 8} ${y - 52} ${x} ${y - 47}`, 'none', 1.6) + gel(x, y - 49, 3, 3, '#FFE27A', 1.5); }
  return gel(x, y, 30, 10, '#CFC6B4', 2) + gel(x, y - 2, 24, 7, '#9ED3E8', 1.5) + gp(`M${x - 5} ${y - 4}v-14h10v14`, '#CFC6B4', 2) + gel(x, y - 20, 9, 3.5, '#CFC6B4', 1.8) + gp(`M${x} ${y - 22}q-10 -14 -18 4M${x} ${y - 22}q10 -14 18 4M${x} ${y - 22}v-12`, 'none', 2, '#7FC4E0') + gel(x, y - 36, 2.6, 2.6, '#BFE6F5', 0);
}

function gSetup(xl) {
  GXL = Math.max(0, Math.min(GXLV.length - 1, xl || 0)); const L = GXLV[GXL]; GSX = L.sx; GSY = L.sy;
  GW = Math.round(960 * GSX); GH = Math.round(GY + MY(612) * GS); GCORE = { x: 0, w: GW };
  GH0 = gcr(R_GH0.map(MP)); GE1 = R_GE1.map(MP); GE2 = R_GE2.map(MP); GPATHS = R_GPATHS.map(P => P.map(MP));
  GLOTS = R_GLOTS.map(([x, y]) => [MX(x), MY(y)]); GSTAIRS = R_GSTAIRS.map(([x, y, len]) => [MX(x), MY(y), MY(y + len) - MY(y)]);
  GZD = R_GZD.map((z, i) => ({ poly: R_GZR[i].map(MP), hole: R_HOLE[i] ? gblobPts(MX(R_HOLE[i][0]), MY(R_HOLE[i][1]), R_HOLE[i][2] * GSX, R_HOLE[i][3] * GSY, 9, .12, 12) : null, cx: MX(z.cx), by: MY(z.by), w: z.w * GSX, d: L.d, cap: Math.round(z.cap * GSX * L.rows / 2), sg: [MX(z.sg[0]), MY(z.sg[1])] }));
  GTREES = R_GTREES.map(([x, y, r]) => [MX(x), MY(y), r]).filter(([x, y]) => !gInZones(x, y, 14)); GBUSH = R_GBUSH.map(([x, y, k]) => [MX(x), MY(y), k]).filter(([x, y]) => !gInZones(x, y, 10)); GTUFT = R_GTUFT.map(MP).filter(([x, y]) => !gInZones(x, y, 6));
  GZ = GZD.map(z => { const poly = z.poly.map(([x, y]) => [gx(x), gy(y)]), ys = poly.map(p => p[1]), top = Math.min(...ys), bot = Math.max(...ys); let w = 0; for (let y = top + 40; y <= bot - 4; y += 34) gSpans(poly, y).forEach(s => { w += Math.max(0, s[1] - s[0] - 20); });
    const hole = z.hole && z.hole.map(([x, y]) => [gx(x), gy(y)]); if (hole) { for (let y = top + 40; y <= bot - 4; y += 34) gSpans(hole, y).forEach(s => { w -= s[1] - s[0]; }); }
    return { poly, hole, cx: poly.reduce((a, p) => a + p[0], 0) / poly.length, yb: top, yf: bot, cap: Math.max(4, Math.floor(w / 72)) }; });
  PLAZA = { x: gx(MX(384)), y: gy(MY(262)) }; GTROPHY = { x: gx(MX(440)), y: gy(MY(100)) };
  const n = R_NAVD.map(([x, y]) => [gx(MX(x)), gy(MY(y))]), e = n.map(() => []); R_NAVP.forEach(([a, b]) => { e[a].push(b); e[b].push(a); });
  const ride = {}; for (let i = 36; i <= 45; i++) ride[i] = 1;
  NAV = { n, e, pairs: R_NAVP, pass: { 5: 1, 6: 1, 7: 1, 22: 1, 23: 1, 24: 1 }, ride };
}
gSetup(0);
