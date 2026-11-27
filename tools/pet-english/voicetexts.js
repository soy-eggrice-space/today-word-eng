const fs = require('fs'); const DATA = new Function(fs.readFileSync(__dirname + '/data.js', 'utf8') + ';return DATA')();
const vslug = t => String(t).toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + (/\?\s*$/.test(t) ? '_q' : '');
const map = new Map(); const add = t => { const k = vslug(t); if (map.has(k) && map.get(k).toLowerCase().replace(/[.!]/g, '') !== t.toLowerCase().replace(/[.!]/g, '')) throw new Error('이름이 겹쳐요: ' + t + ' / ' + map.get(k)); if (!map.has(k) || /[.!?]$/.test(t)) map.set(k, t); };
DATA.days.forEach(d => { d.flash.forEach(f => add(f[0])); d.sents.forEach(s => { s.w.forEach(w => add(w[0])); add(s.t); }); });
const out = [...map].map(([k, t]) => [t, k, 'en']).sort((a, b) => a[1] < b[1] ? -1 : 1);

const fnv = t => { let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0'); };
const ko = new Function(fs.readFileSync(__dirname + '/pet.js', 'utf8') + ';return koLines()')(); const kn = new Set();
ko.forEach(t => { const k = 'k_' + fnv(t); if (kn.has(k)) throw new Error('이름이 겹쳐요: ' + t); kn.add(k); out.push([t, k, 'ko']); });

const koJo = new Function(fs.readFileSync(__dirname + '/pet.js', 'utf8') + ';return koJo')(), KN = JSON.parse(fs.readFileSync(__dirname + '/kidnames.json', 'utf8')); let nn = 0;
[...new Set([...KN.male, ...KN.female])].sort().forEach(n => { const t = koJo(n, '아', '야'), k = 'k_' + fnv(t); if (kn.has(k)) return; kn.add(k); out.push([t, k, 'ko']); nn++; });
console.log('아이 이름', nn);
fs.writeFileSync(__dirname + '/voice_texts.json', JSON.stringify(out, null, 0).replace(/\],\[/g, '],\n['));
console.log('voice texts', out.length, '(ko ' + ko.length + ')', 'chars', out.reduce((n, x) => n + x[0].length, 0), '| e.g.', out.slice(0, 4).map(x => x.join('→')).join('  '));
