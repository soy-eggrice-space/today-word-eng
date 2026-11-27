const fs = require('fs'), P = '/home/claude/petapp/';
const src = ['data.js', 'craypic.js', 'pet.js', 'petnew.js', 'room.js'].map(f => fs.readFileSync(P + f, 'utf8').replace(/if \(typeof module[^\n]*\n?/, '')).join('\n');
const app = fs.readFileSync(P + 'app.js', 'utf8');
const grab = n => app.match(new RegExp('const ' + n + ' = `([^`]*)`'))[1];
const out = new Function(src + `; const pic = k => crayPic(DATA.pics[k]);
  return { pets: ['dog','cat','rabbit'].flatMap(sp => [0,1,2,3].map(i => petSVG(sp, i))), cat: petSVG('cat', 0), catH: petSVG('cat', 0, 'happy'), dogH: petSVG('dog', 2, 'happy'), rabH: petSVG('rabbit', 1, 'happy'),
    apple: pic('w:apple'), wI: pic('w:I'), wsee: pic('w:see'), wtiger: pic('w:tiger'), scene: pic('s:see:tiger'), gift: giftSVG(), rib1: itemSVG('ribbon', 1), rib2: itemSVG('ribbon', 2), treat: treatSVG('fish'), hand: handSVG(), garland: garland(1000) };`)();
out.qrApk = fs.readFileSync('/tmp/q/qr_apk.svg', 'utf8'); out.qrWeb = fs.readFileSync('/tmp/q/qr_web.svg', 'utf8');
const CLAP = grab('CLAP'), MOUTH = grab('MOUTH'), HEART = grab('HEART');
const tpl = fs.readFileSync('tpl.html', 'utf8');
let html = tpl.replace(/%(\w+)%/g, (m, k) => k === 'FONT' ? m : k === 'PETS' ? out.pets.concat(out.pets).map(s => `<span>${s}</span>`).join('') : k === 'CLAP' ? CLAP : k === 'MOUTH' ? MOUTH : k === 'HEART' ? HEART : (out[k] !== undefined ? out[k] : m));
fs.writeFileSync('/tmp/q/page_body.html', html); console.log(Math.round(html.length / 1024) + 'KB', (html.match(/%\w+%/g) || []).join(' '));
