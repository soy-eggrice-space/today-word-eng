const fs = require('fs'); const { ICON_SETS, iconSVG } = require('./icons.js'); const { APP_ICONS, CRAY_DEFS } = require('./appicons.js');
const KINDS = [['care', '친구들 돌보기'], ['museum', '미술관 보기'], ['listen', '듣기 모드'], ['cal', '달력 보기']];
let h = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>아이콘 세트</title><style>
body{margin:0;background:#FFF6E6;color:#4A3F3A;font:16px/1.5 system-ui,"Noto Sans KR",sans-serif;padding:20px 14px 40px}
.set{background:#fff;border:2px solid #EAD7BC;border-radius:22px;padding:14px;margin:0 auto 16px;max-width:520px}
.set h2{margin:0 0 2px;font-size:19px}.set p{margin:0 0 12px;color:#7A6C63;font-size:14px}
.row{display:flex;gap:14px;align-items:center}.appic{width:96px;height:96px;flex:none;border-radius:22px;box-shadow:0 4px 10px rgba(90,70,54,.18)}
.mock{flex:1;background:#FFF6E6;border-radius:18px;padding:12px 8px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;justify-items:center}
.go{grid-column:1/-1;width:108px;height:108px;border-radius:50%;background:#FFE27A;border:4px solid #E6B93A;box-shadow:0 5px 0 rgba(200,150,30,.3);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:13px;margin-bottom:6px}
.go svg{width:54px;height:54px}.t{display:flex;flex-direction:column;align-items:center;font-size:11px;gap:2px;text-align:center}.t svg{width:46px;height:46px}
</style></head><body>${CRAY_DEFS}`;
const ONLY = process.argv[2] ? process.argv[2].split(',') : Object.keys(ICON_SETS); let n = 0; for (const k of ONLY) { n++; h += `<div class="set"><h2>${n}. ${ICON_SETS[k].name}</h2><p>${ICON_SETS[k].note}</p><div class="row">${APP_ICONS[k]()}<div class="mock"><div class="go">${iconSVG('study', k)}오늘 공부하기</div>${KINDS.map(([a, b]) => `<div class="t">${iconSVG(a, k)}${b}</div>`).join('')}</div></div></div>`; }
fs.writeFileSync('/tmp/q/icons.html', h + '</body></html>'); console.log('ok', h.length);
