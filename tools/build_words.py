"""words/*.txt → app/src/main/assets/words.js (검증 · 중복 제거)"""
import glob, json, re, sys, os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REMOVE={'jet-black coffee','receipt book','leverage our strengths','piece of mind'}
norm=lambda w: re.sub(r'[.?!,]+$','',w.strip().lower())
themes=[]; seen={}; dups=[]; errors=[]
for path in sorted(glob.glob(os.path.join(ROOT,'words','*.txt'))):
    lines=open(path,encoding='utf8').read().splitlines()
    tid,name,icon=lines[0][1:].strip().split('|')
    words=[]
    for i,l in enumerate(lines[1:],2):
        if not l.strip(): continue
        p=l.split('|')
        if len(p)!=5: errors.append(f'{path}:{i} fields={len(p)}'); continue
        w,k,ex,exk,lv=[x.strip() for x in p]
        if norm(w) in REMOVE: continue
        if lv not in '12345' or len(lv)!=1: errors.append(f'{path}:{i} lv={lv}'); continue
        if not all([w,k,ex,exk]): errors.append(f'{path}:{i} empty'); continue
        key=norm(w)
        if key in seen: dups.append((w,seen[key],tid)); continue
        seen[key]=tid
        words.append([w,k,ex,exk,int(lv)])
    themes.append({'id':tid,'name':name,'icon':icon,'words':words})
total=sum(len(t['words']) for t in themes)
lv=[0]*6
for t in themes:
    for w in t['words']: lv[w[4]]+=1
cloze=sum(1 for t in themes for w in t['words'] if norm(w[0]) in w[2].lower())
print('errors',len(errors)); [print(' ',e) for e in errors[:20]]
print('dups removed',len(dups))
for t in themes: print(f"  {t['id']:8} {t['name']:12} {len(t['words'])}")
print('TOTAL',total,'levels',lv[1:],'cloze-able',cloze)
out=os.path.join(ROOT,'app','src','main','assets','words.js')
os.makedirs(os.path.dirname(out),exist_ok=True)
open(out,'w',encoding='utf8').write('// 자동 생성: tools/build_words.py — 직접 고치지 말고 words/*.txt를 고쳐 주세요\nwindow.THEMES='+json.dumps(themes,ensure_ascii=False,separators=(',',':'))+';\n')
print('wrote',out,os.path.getsize(out)//1024,'KB')
