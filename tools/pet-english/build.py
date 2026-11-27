import re, base64, subprocess
css=open('app.css',encoding='utf-8').read(); data=open('data.js',encoding='utf-8').read(); pet=open('craypic.js',encoding='utf-8').read().split('if (typeof module')[0]+'\nfor (const k in DATA.pics) DATA.pics[k] = crayPic(DATA.pics[k]);\n'+open('pet.js',encoding='utf-8').read()+'\n'+open('petnew.js',encoding='utf-8').read()+'\n'+open('room.js',encoding='utf-8').read()+'\n'+open('icons.js',encoding='utf-8').read().split('if (typeof module')[0]; appjs=open('app.js',encoding='utf-8').read()

import hashlib, os
_vj=[p for p in ('voice/voice.json','/home/claude/today-word-eng/tools/pet-english/voice/voice.json') if os.path.exists(p)]
appjs=appjs.replace('__VOV__', hashlib.md5(open(_vj[0],'rb').read()).hexdigest()[:6] if _vj else '1')
def sub(src, text, out):
    open('/tmp/pa_chars.txt','w',encoding='utf-8').write(text)
    subprocess.run(['pyftsubset',src,'--text-file=/tmp/pa_chars.txt','--flavor=woff','--output-file='+out],check=True,capture_output=True)
    return base64.b64encode(open(out,'rb').read()).decode()
ko=''.join(sorted(set(re.sub(r'[\x00-\x7f]','',css+pet+appjs))))

ko=''.join(sorted(set(ko+''.join(bytes([a,b]).decode('euc-kr') for a in range(0xB0,0xC9) for b in range(0xA1,0xFF)))))
fj=sub('/home/claude/word-play/app/src/main/assets/fonts/GumiRomance.otf', ko+''.join(chr(c) for c in range(32,127))+'·→←×▶✕', '/tmp/pa_j.woff')
css=css.replace('font-family:F,','font-family:J,').replace('font-family:F;','font-family:J;').replace('font-family:F}','font-family:J}')
html=f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<title>쓰담쓰담 영어</title><meta name="theme-color" content="#FFF6E6"><link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon-192.png"><link rel="apple-touch-icon" href="icon-192.png"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes">
<style>
@font-face{{font-family:J;src:url(data:font/woff;base64,{fj}) format('woff')}}
{css}</style></head><body><svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="crw" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="1" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter><filter id="crp" x="-6%" y="-6%" width="112%" height="112%"><feTurbulence type="fractalNoise" baseFrequency=".024" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5.5"/></filter><filter id="crA" x="-3%" y="-3%" width="106%" height="106%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4"/></filter></defs></svg><div id="app"></div>
<script>{data}</script>
<script>{pet}</script>
<script>{appjs}</script>
</body></html>'''
open('index.html','w',encoding='utf-8').write(html); print(len(html)//1024,'KB')
