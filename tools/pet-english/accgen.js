const fs = require('fs'), { chromium } = require('/home/claude/.npm-global/lib/node_modules/playwright');
(async () => {
  eval(fs.readFileSync(__dirname + '/data.js', 'utf8').replace('const DATA', 'globalThis.DATA'));
  const keys = Object.keys(DATA.pics).filter(k => k.startsWith('w'));
  const b = await chromium.launch(), p = await b.newPage();
  const ac = await p.evaluate(async ({ keys, pics }) => {
    const SKIP = [[59, 51, 64], [255, 217, 184], [207, 230, 194], [143, 211, 255], [92, 110, 158], [107, 74, 58], [255, 241, 222], [255, 240, 184], [247, 154, 168]];
    const out = {}, cv = document.createElement('canvas'); cv.width = 96; cv.height = 72; const cx = cv.getContext('2d', { willReadFrequently: true });
    for (const k of keys) {
      const svg = pics[k].replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" '), img = new Image();
      await new Promise(r => { img.onload = r; img.onerror = r; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
      cx.clearRect(0, 0, 96, 72); try { cx.drawImage(img, 0, 0, 96, 72); } catch (e) { continue; }
      const d = cx.getImageData(0, 0, 96, 72).data, bins = {};
      for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 220) continue; const r = d[i], g = d[i + 1], bl = d[i + 2]; if (Math.max(r, g, bl) - Math.min(r, g, bl) < 46) continue; if (SKIP.some(s => Math.abs(s[0] - r) + Math.abs(s[1] - g) + Math.abs(s[2] - bl) < 46)) continue;
        const q = (r >> 4) + ',' + (g >> 4) + ',' + (bl >> 4), o = bins[q] || (bins[q] = [0, 0, 0, 0]); o[0]++; o[1] += r; o[2] += g; o[3] += bl; }
      const top = Object.values(bins).sort((a, c) => c[0] - a[0])[0];
      if (top && top[0] > 40) out[k] = '#' + [1, 2, 3].map(i => Math.round(top[i] / top[0]).toString(16).padStart(2, '0')).join('').toUpperCase();
    }
    return out;
  }, { keys, pics: DATA.pics });
  await b.close(); DATA.ac = ac;
  fs.writeFileSync(__dirname + '/data.js', 'const DATA=' + JSON.stringify(DATA) + ';');
  console.log(Object.keys(ac).length + '/' + keys.length, ['apple', 'banana', 'strawberry', 'cookie', 'ice cream', 'like', 'see', 'tiger', 'car', 'ball', 'frog', 'I', 'this', 'where', 'milk', 'water', 'tree'].map(w => w + ':' + (ac['w:' + w] || '-')).join(' '));
})();
