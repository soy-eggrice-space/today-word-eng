const fs = require('fs');
const acorn = require('acorn');
function stripJs(src) {
  const cs = []; let ok = true;
  for (const st of ['script', 'module']) {
    cs.length = 0;
    try { acorn.parse(src, { ecmaVersion: 'latest', sourceType: st, allowHashBang: true, allowReturnOutsideFunction: true, onComment: (b, t, s, e) => cs.push([s, e, b, t]) }); ok = true; break; } catch (e) { ok = false; }
  }
  if (!ok) return null;
  let out = '', p = 0;
  for (const [s, e, block, text] of cs) { out += src.slice(p, s) + (block ? (text.includes('\n') ? '\n' : ' ') : ''); p = e; }
  return tidy(out + src.slice(p));
}
const tidy = s => s.split('\n').map(l => l.replace(/[ \t]+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+/, '');
const stripCss = s => tidy(s.replace(/\/\*[\s\S]*?\*\//g, ''));
function stripHtml(s, bad) {
  s = s.replace(/<!--(?!\[if)[\s\S]*?-->/g, '');
  s = s.replace(/(<script\b(?![^>]*\bsrc=)([^>]*)>)([\s\S]*?)(<\/script>)/g, (m, a, attrs, body, z) => {
    if (/type\s*=\s*["']?(?!text\/javascript|module|application\/javascript)[a-z]/i.test(attrs) || !body.trim()) return m;
    const r = stripJs(body); if (r == null) { bad.push('inline script'); return m; }
    return a + '\n' + r.trim() + '\n' + z; });
  s = s.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/g, (m, a, body, z) => a + stripCss(body) + z);
  return tidy(s);
}
let n = 0, cut = 0; const bad = [];
for (const p of process.argv.slice(2)) {
  const a = fs.readFileSync(p, 'utf8'); let b;
  if (/\.(js|mjs)$/.test(p)) { b = stripJs(a); if (b == null) { bad.push(p); continue; } }
  else if (/\.css$/.test(p)) b = stripCss(a);
  else if (/\.html?$/.test(p)) { const k = bad.length; b = stripHtml(a, bad); if (bad.length > k) bad[bad.length - 1] = p + ' (inline script 그대로 둠)'; }
  else continue;
  if (a !== b) { fs.writeFileSync(p, b); n++; cut += a.length - b.length; }
}
console.log('js/css/html 바뀐 파일', n, '지운 글자', cut, bad.length ? '못 읽음: ' + bad.join(', ') : '');
