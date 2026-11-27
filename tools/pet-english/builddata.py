import sys, json, re
sys.path.insert(0,'/home/claude/flash'); sys.path.insert(0,'/home/claude/say')
from pics2 import *
from scenes2 import FRAMES, svg as scene_svg
SING={'apples':'apple','bananas':'banana','cookies':'cookie','strawberries':'strawberry','hands':'hand','ears':'ear','feet':'foot','teeth':'tooth','eyes':'eye'}
KO={w:ko for w,p,ko,g in WORDS}
KO.update({'I':'나'})
SKIP={'touch','wear','need','take'}
import scenes2 as SC
def QM(x, y, sc=1, col='#FF7A45'):
    return f'<g transform="translate({x} {y}) scale({sc})">'+P('M-13 -16 Q-13 -34 2 -34 Q17 -34 17 -19 Q17 -8 2 -2 L2 8','none',10,col)+C(2,24,6.5,col,0)+'</g>'
BUB=lambda x,y,r: C(x,y,r,'#FFFFFF',4)+C(x-r*.62,y+r*.86,r*.2,'#FFFFFF',3.5)

def _bottle(cap=True):
    return R(-15,-16,30,52,'#E8F7FF',9,3.5)+P('M-13 6 H13 V26 Q13 34 5 34 H-5 Q-13 34 -13 26 Z','#8FD0F5',0)+R(-15,-16,30,52,'none',9,3.5)+R(-8,-27,16,12,'#E8F7FF',3,3.5)+(R(-10,-38,20,12,'#4FA3E0',4,3.5) if cap else '')+R(-15,-4,30,11,'#FFFFFF',0,0)+P('M-15 -4 H15 M-15 7 H15',None,2.5)+P('M-8 14 V26',None,3,'#FFFFFF')
O['bottle']=_bottle()
_ABC=G(P('M0 20 L8 0 L16 20 M4 12 L12 12',None,4.5,'#4F8FE0'),0,0)+G(P('M0 0 V20 M0 0 Q12 0 12 5 Q12 10 0 10 Q14 10 14 15 Q14 20 0 20',None,4.5,'#4F8FE0'),24,0)+G(P('M14 3 Q0 -3 0 10 Q0 23 14 17',None,4.5,'#4F8FE0'),46,0)
PIC['write']=lambda: GROUND+SC.table(150,306,172)+R(166,92,136,76,'#FFFFFF',6,3.5)+P('M176 134 H292',None,2,'#D8E6F0')+G(_ABC,180,104,1.15)+P('M252 126 q7 -9 14 0',None,4.5,'#4F8FE0')+K(96,'smile',look=4)+AR(96,[(60,170)],[(140,160),(268,156)])+G(O['pencil'],274,142,.55,'',30)+H((270,156))
_BRUSH=R(-3.5,-30,7,38,'#B07A4E',3,3)+R(-5,-41,10,12,'#C9CED6',2,3)+P('M-5.5 -41 Q-9 -56 0 -66 Q9 -56 5.5 -41 Z','#F25C54',3)
_PALETTE=E(0,0,24,16,'#E2B57E',3.5)+C(-8,2,4.5,'#FFFFFF',2.5)+C(-12,-6,4,'#F25C54',0)+C(-1,-9,4,'#FFD84D',0)+C(10,-6,4,'#4FA3E0',0)+C(13,3,4,'#7CC96A',0)
PIC['paint']=lambda: GROUND+G(O['easel'],236,140,1.3)+P('M212 100 Q226 86 244 100',None,7,'#F25C54')+K(104,'happy')+AR(104,[(72,146),(60,158)],[(150,140),(176,124)])+G(_PALETTE,54,168)+H((62,160))+G(_BRUSH,176,124,1,'',52)+H((176,124))
_HAT=P('M90 60 Q74 44 90 32 Q92 12 110 20 Q128 12 130 32 Q146 44 130 60 Z','#FFFFFF',3.5)+R(90,54,40,13,'#FFFFFF',4,3.5)
PIC['cook']=lambda: GROUND+SC.table(190,306,172)+P('M210 150 H274 L268 164 Q266 168 260 168 H224 Q218 168 216 164 Z','#5A5A62',3.5)+E(242,150,32,7,'#7A7A84',3.5)+E(242,150,15,4,'#FFFFFF',0)+C(244,150,4.5,'#F2B33D',0)+SC.steam(242,132)+K(110,'happy')+_HAT+AR(110,[(74,170)],[(154,150),(184,152)])+P('M212 152 L184 152',None,10)+P('M212 152 L184 152',None,5.5,'#B07A4E')+H((180,152))

PIC['fast']=lambda: GROUND+'<g opacity=".4">'+G(O['snail'],62,190,.55)+'</g>'+G(O['rabbit'],226,152,1.05)+SC.lines((110,112,172,112),(96,140,166,140),(116,168,172,168))+arrow_dn(226,56,.8)
PIC['slow']=lambda: GROUND+'<g opacity=".4">'+G(O['rabbit'],276,168,.5)+SC.lines((214,150,246,150),(208,166,244,166))+'</g>'+G(O['snail'],120,166,1.3)+'<g class="sv-tw">'+C(30,186,4,'#B9B0BC',0)+C(46,186,4,'#B9B0BC',0)+'</g>'+arrow_dn(120,92,.8)

import math
_ray=lambda x,y,r0,r1,n=8,col='#F2B33D',w=3.5: ''.join(P(f'M{x+r0*math.cos(i*2*math.pi/n):.1f} {y+r0*math.sin(i*2*math.pi/n):.1f} L{x+r1*math.cos(i*2*math.pi/n):.1f} {y+r1*math.sin(i*2*math.pi/n):.1f}',None,w,col) for i in range(n))

O['lemon']=P('M-40 2 Q-34 -26 -4 -28 Q26 -28 38 -7 Q49 0 38 8 Q26 30 -4 28 Q-34 28 -40 2 Z','#FFE14D')+E(-14,-11,9,5,'#FFFFFF',0,' opacity=".7"')+''.join(C(x,y,1.7,'#E0AE12',0) for x,y in [(6,-8),(18,4),(2,10),(-14,8),(22,-10),(-24,-2)])+P('M-36 -6 Q-48 -24 -30 -34 Q-20 -18 -32 -8 Z','#7CC96A',3.5)
_LEMON_HALF=C(0,0,30,'#FFE14D')+C(0,0,23,'#FFF8B0',2.5)+_ray(0,0,0,23,8,'#E0AE12',2.5)+C(0,0,3.5,'#FFFFFF',0)
PIC['lemon']=lambda: GROUND+G(O['lemon'],112,126,1.45)+G(_LEMON_HALF,238,152,1.3)

O['pillow']=P('M-48 -24 Q-56 -34 -44 -30 Q0 -38 44 -30 Q56 -34 48 -24 Q54 0 48 24 Q56 34 44 30 Q0 38 -44 30 Q-56 34 -48 24 Q-54 0 -48 -24 Z','#CFE8FF')+P('M-32 -14 Q-27 0 -32 14 M32 -14 Q27 0 32 14',None,3,'#8FBCE8')+''.join(C(x,y,3.2,'#FFFFFF',0) for x,y in [(-14,-13),(10,-11),(-4,3),(16,11),(-18,14),(0,-22),(2,20)])
PIC['pillow']=lambda: GROUND+'<g opacity=".55">'+R(26,84,18,128,'#B07A4E',6,3.5)+R(42,156,256,34,'#FFFFFF',8,3.5)+P('M168 150 H298 V192 H168 Q180 171 168 150 Z','#F7A8B8',3.5)+R(50,190,12,24,'#B07A4E',3,3.5)+R(280,190,12,24,'#B07A4E',3,3.5)+'</g>'+G(O['pillow'],108,122,1.12,'',-7)+arrow_dn(108,70,.7)

O['shoe']=P('M-32 10 L-32 -18 Q-22 -25 -12 -18 Q-6 -4 18 0 Q36 2 38 12 L-32 12 Z','#F25C54')+P('M20 0 Q36 3 38 12 L18 12 Q14 5 20 0 Z','#FFFFFF',3.5)+R(-35,10,76,11,'#FFFFFF',5,3.5)+P('M-13 -10 L-1 -14 M-9 -3 L5 -7',None,3.5,'#FFFFFF')

def _sib(w,ay): return GROUND+G(SC.baby(0),104,43,.8)+SC.kidp(214,w,'happy')+SC.karms(214,w,[(174,130),(126,122)],[(250,170)])+H((124,121),(251,176))+arrow_dn(214,ay,.9)
PIC['brother']=lambda: _sib('brother',50)
PIC['sister']=lambda: _sib('sister',40)
_T0=PIC['teacher']
PIC['teacher']=lambda: GROUND+G(_T0().replace(GROUND,'').replace(arrow_dn(230,0,.7),''),24,38,.84)+arrow_dn(217,40,.6)
def _playground():
    sun=C(40,40,17,'#FFD84D',3.5)+_ray(40,40,25,33)
    cloud=G(O['cloud'],250,34,.45)
    bush=P('M150 214 Q146 190 164 190 Q170 172 188 182 Q204 174 208 194 Q222 198 216 214 Z','#8FCB8A',3.5)
    slide=G(O['playground'],88,150,1.25)
    swing=P('M196 214 L212 92 L290 92 L306 214',None,11)+P('M196 214 L212 92 L290 92 L306 214',None,6,'#4FA3E0')+P('M234 94 V164 M268 94 V164',None,3)+R(226,162,50,10,'#FFD84D',4,3.5)
    fl=G(O['flower'],176,206,.34)+G(O['flower'],24,208,.3)+G(O['flower'],150,210,.26)
    return GROUND+sun+cloud+bush+swing+slide+fl
PIC['playground']=_playground
def _pool():
    deck=R(18,88,284,130,'#FFE4BD',24,3.5)+R(36,104,248,98,'#8FD3FF',16,3.5)
    wave=P('M54 128 q10 -7 20 0 t20 0 M150 186 q10 -7 20 0 t20 0 t20 0 M180 126 q10 -7 20 0 t20 0',None,3.5,'#FFFFFF')
    ladder=P('M232 116 V74 Q232 62 242 62 M260 116 V74 Q260 62 270 62 M232 84 H260 M232 100 H260',None,8)+P('M232 116 V74 Q232 62 242 62 M260 116 V74 Q260 62 270 62 M232 84 H260 M232 100 H260',None,4,'#C9D3E2')
    para=P('M62 92 V40',None,5,'#B07A4E')+P('M22 46 Q62 0 102 46 Z','#F25C54',3.5)+P('M48 46 Q52 16 62 10 Q72 16 76 46 Z','#FFFFFF',3)
    ring=C(104,164,27,'#F25C54',3.5)+P('M104 137 V150 M104 178 V191 M77 164 H90 M118 164 H131',None,6,'#FFFFFF')+C(104,164,27,'none',3.5)
    kid=G(SC.head(0,0,'happy'),104,148,.52)
    toys=G(O['ball'],222,172,.5)+G(O['duck'],172,150,.36)
    drop='<g class="sv-drop">'+SC.drops([(150,96),(140,84),(70,132)])+'</g>'
    return GROUND+deck+wave+ladder+para+ring+kid+toys+drop
PIC['pool']=_pool
def _tuft(x,y,s=1): return G(P('M-9 0 L-6 -12 L-2 0 L1 -16 L5 0 L8 -11 L11 0',None,3.5,'#4FAE57'),x,y,s)
def _river():
    mt=P('M40 70 L92 12 L144 70 Z','#B9C7D9',3.5)+P('M76 30 L92 12 L108 30 L98 38 L92 30 L84 38 Z','#FFFFFF',3)+P('M150 70 L190 26 L232 70 Z','#C8D4E3',3.5)
    land=R(8,64,304,162,'#DDF2CC',38,0)
    riv='M150 64 Q112 96 150 128 Q196 160 108 226 L242 226 Q292 166 206 124 Q170 104 186 64'
    river=P(riv+' Z','#8FD3FF',0)+P('M150 64 Q112 96 150 128 Q196 160 108 226 M242 226 Q292 166 206 124 Q170 104 186 64',None,3.5)
    wave=P('M152 90 q8 -6 16 0 M168 140 q9 -6 18 0 t18 0 M160 200 q10 -7 20 0 t20 0 M206 176 q8 -6 16 0',None,3.5,'#FFFFFF')
    deco=_tuft(40,120)+_tuft(70,196,1.1)+_tuft(104,150,.9)+_tuft(250,106)+_tuft(286,200,1.1)+_tuft(226,92,.8)+_tuft(30,170,.9)
    deco+=G(O['flower'],58,150,.3)+G(O['flower'],282,150,.3)+G(O['flower'],96,108,.26)+G(O['flower'],274,112,.24)
    deco+=E(118,212,12,7,'#C9CED6',3)+E(262,170,10,6,'#C9CED6',3)+G(O['tree'],286,84,.34)
    life=G(SC.fishy('#F5A142'),190,206,.5)+G(O['duck'],176,112,.26)
    return mt+land+river+wave+deco+life+arrow_at(162,172,0,.7)
PIC['river']=_river

def SPK(x,y,s=1,n=3,col='#F25C54'):
    return G(P('M-18 -9 H-7 L9 -22 V22 L-7 9 H-18 Z','#FFFFFF',3.5)+''.join(P(f'M{17+i*10} {-8-i*6} Q{26+i*12} 0 {17+i*10} {8+i*6}',None,4.5,col) for i in range(n)),x,y,s)
_L0=PIC['loud']; PIC['loud']=lambda: _L0()+'<g class="sv-wave">'+SPK(172,42,1.1,3)+'</g>'
_Q0=PIC['quiet']; PIC['quiet']=lambda: _Q0()+SPK(176,40,1.1,1,'#9CB4D8')
def _wet():
    cx=160; cloud=G(O['rain'],160,30,.7)+P('M112 52 l-6 14 M136 58 l-6 14 M186 58 l-6 14 M210 52 l-6 14',None,3.5,'#6FB8E8')
    puddle=E(cx,222,96,11,'#9AD7F5',3.5)+P('M96 222 q8 -4 16 0 M206 222 q8 -4 16 0 M148 226 q12 -4 24 0',None,2.5,'#FFFFFF')
    k=K(cx,'sad')+AR(cx,[(cx-40,150),(cx-52,170)],[(cx+40,150),(cx+52,170)])
    soak=P(f'M{cx-28} 156 Q{cx-14} 148 {cx} 156 Q{cx+14} 164 {cx+29} 154 L{cx+31} 184 Q{cx} 193 {cx-31} 184 Z','#58AEEB',0)+P(f'M{cx-26} 128 Q{cx} 116 {cx+26} 128 L{cx+31} 184 Q{cx} 193 {cx-31} 184 Z','none',4)
    hair=P(f'M{cx-30} 100 q-3 9 0 15 M{cx+30} 100 q3 9 0 15 M{cx-10} 62 q-2 7 0 11 M{cx+12} 60 q2 7 0 11',None,3.5,'#6FB8E8')
    dr='<g class="sv-drop">'+SC.drops([(cx-54,192),(cx+54,192),(cx-44,204),(cx+46,206),(cx-22,200),(cx+20,202),(cx-66,178),(cx+66,180),(cx-36,118),(cx+38,120),(cx,206)])+'</g>'
    return GROUND+puddle+cloud+k+soak+H((cx-53,174),(cx+53,174))+hair+dr
PIC['wet']=_wet
pics={}
def put(key, inner):
    if key not in pics: pics[key]=(f'<svg viewBox="0 0 320 240" class="sv-pic">{inner}</svg>').replace('%C%',B)
    return key
def noun_pic(w):
    s=SING.get(w,w)
    if s in PIC: return put('w:'+s, PIC[s]()), s
    return put('w:'+s, GROUND+G(O[s],160,124,1.5)), s
I_PIC=put('w:I', GROUND+K(160,'happy')+AR(160,[(124,170)],[(198,150),(170,150)])+H((123,176),(168,150))+arrow_dn(160,40,.9))
days=[]
for fr in FRAMES:
    if len(fr)>3 or fr[0] in SKIP: continue
    fk=fr[0]; v=fr[1].split()[1]
    vp=put('w:'+v, PIC[v]())
    flash=[[v,vp,'v']]; sents=[]
    for pre,w in fr[2]:
        np,s=noun_pic(w)
        if not any(f[0]==s for f in flash): flash.append([s,np,'n'])
        toks=pre.split(); rest=' '.join(toks[2:]+[w])
        sc=scene_svg(fk,w).replace('%C%',B); key='s:%s:%s'%(fk,w); pics[key]=sc
        sents.append({'w':[['I',I_PIC],[toks[1],vp],[rest,np]],'s':key,'t':pre+' '+w+'.'})
    days.append({'v':v,'flash':flash,'sents':sents})

def _want(w): cx=92; ob=G(O['toy'],222,128,1.5,'sv-bob') if w=='toy' else SC.obj(w,236,152,1,'sv-bob'); return SC.kid(cx,'star',3)+SC.arms(cx,[(cx-36,170)],[(cx+46,124),(cx+70,118)])+SC.hand(cx-37,176)+SC.hand(cx+72,117)+'<g class="sv-tw">'+SC.spark(196,64,.9)+SC.spark(282,92,.7)+SC.spark(286,176,.6)+'</g>'+ob
def _have(w): cx=150; y=166; return SC.kid(cx,'happy')+SC.arms(cx,[(cx-38,152),(cx-28,y)],[(cx+38,152),(cx+28,y)])+SC.obj(w,cx,y,.62,'sv-bob')+SC.hand(cx-28,y)+SC.hand(cx+28,y)
def _eat(w): cx=128; o=(172,118,.72); return SC.kid(cx,'eat')+SC.arms(cx,[(cx-8,164),(o[0]-14,o[1]+30)],[(cx+48,166),(o[0]+16,o[1]+30)])+'<g class="sv-crumb">'+C(146,128,3,'#E9A94F',0)+C(140,138,2.5,'#E9A94F',0)+'</g>'+G(O[w],o[0],o[1],o[2])+SC.hand(o[0]-14,o[1]+30)+SC.hand(o[0]+16,o[1]+30)
def _sandwich():
    cx=84; st=SC.table(168,306,176)+E(238,174,50,8,'#FFFFFF',3.5)+R(204,158,68,12,'#E9B872',6,3.5)+P('M200 158 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0 q8 -8 16 0 q8 -8 12 0',"#7CC96A",3.5)+R(206,142,64,9,'#FFD84D',3,3.5)+E(222,138,12,5,'#F25C54',3)+E(252,138,12,5,'#F25C54',3)
    top=G(R(-34,-7,68,14,'#E9B872',7,3.5),238,104,1,'sv-bob'); arrow=P('M238 116 V128 M232 123 L238 130 L244 123',None,4,'#FF7A45')
    return st+SC.kid(cx,'happy',3)+SC.arms(cx,[(cx+24,164),(cx+84,150)],[(cx+50,128),(cx+118,106)])+top+arrow+SC.hand(cx+84,150)+SC.hand(cx+120,106)+'<g class="sv-tw">'+SC.spark(296,90,.6)+SC.spark(180,70,.5)+'</g>'
def _make(w):
    if w=='sandwich': return _sandwich()
    cx=88; return SC.obj(w,236,160,1)+SC.kid(cx,'happy')+SC.arms(cx,[(cx+20,170),(cx+56,156)],[(cx+50,134),(cx+76,140)])+SC.hand(cx+56,156)+SC.hand(cx+78,140)+'<g class="sv-tw">'+SC.spark(186,74,.8)+SC.spark(290,84,.6)+SC.spark(292,188,.5)+'</g>'
_std=lambda fk: (lambda w: SC.scene1(fk,w))
MORE_IV={
 'see':(_std('see'),'a rabbit|a puppy|a fish|a pig|a sheep|a cow|a monkey|a bear|a panda|a horse'),
 'like':(_std('like'),'pizza|cake|cheese|chocolate|bread|milk|juice|soup|noodles|watermelon'),
 'draw':(_std('draw'),'a tree|a car|a fish|an apple|a heart|a rainbow|a bird|a ball'),
 'want':(_want,'a toy|a doll|a kite|a robot|a puppy|a ball|an ice cream'),
 'have':(_have,'a doll|a teddy bear|a cup|a bag|a pencil|a key|a kite|a robot'),
 'eat':(_eat,'a cookie|pizza|cheese|a sandwich|a strawberry|a tomato|an egg|chocolate'),
 'make':(_make,'a sandwich|a pizza|a robot|a tower|a house'),
}
for d in days:
    if d['v'] not in MORE_IV: continue
    fn,items=MORE_IV[d['v']]; v=d['v']; vp='w:'+v
    for it in items.split('|'):
        toks=it.split(); w=' '.join(toks[1:]) if toks[0] in('a','an') else it
        if any(f[0]==w for f in d['flash']): continue
        np,s_=noun_pic(w); d['flash'].append([s_,np,'n'])
        key='s:%s:%s'%(v,w); pics[key]=(f'<svg viewBox="0 0 320 240" class="sv-pic sv-{v}" aria-hidden="true">{GROUND}{fn(w)}</svg>').replace('%C%',B)
        d['sents'].append({'w':[['I',I_PIC],[v,vp],[it,np]],'s':key,'t':f'I {v} {it}.'})

kid,arms,hand,obj,limb,heart=SC.kid,SC.arms,SC.hand,SC.obj,SC.limb,SC.heart
def _ride(w):
    if w=='boat': return obj('boat',170,160,1.25)+G(SC.head(0,0,'happy')+limb([(-26,14),(-40,-14)],'%C%')+hand(-40,-18),128,152,.5)+P('M104 170 Q128 162 152 170','%C%',3.5)+'<g class="sv-wind">'+P('M10 130 L36 130 M4 150 L32 150',None,4,'#B9B0BC')+'</g>'
    return obj(w,160,160,1.25)+G(SC.head(0,0,'happy')+limb([(28,10),(40,-18)],'%C%')+hand(40,-22),{'car':150,'truck':206,'boat':160,'airplane':150}.get(w,112),{'car':132,'truck':128,'boat':112,'airplane':140}.get(w,150),.5)+'<g class="sv-wind">'+P('M10 130 L36 130 M4 150 L32 150',None,4,'#B9B0BC')+'</g>'
def _open(w):
    cx=88
    if w=='bag':
        bag=P('M222 128 Q222 104 240 104 Q258 104 258 128',None,6)+R(204,132,72,66,'#F2788F',14,3.5)+E(240,136,32,9,'#8A3B4E',3.5)+G(R(-9,-26,18,36,'#4FA3E0',3,3),228,124,1,'',-8)+G(O['pencil'],252,116,.4,'',10)+P('M208 140 Q240 156 272 140 V150 Q240 166 208 150 Z','#F2788F',3.5)+R(226,168,28,16,'#FFFFFF',5,3)
        flap=G(R(-36,-11,72,22,'#F7A8B8',11,3.5),196,104,1,'',-62)
        return bag+flap+kid(cx,'happy')+arms(cx,[(cx-36,170)],[(cx+50,120),(178,92)])+hand(cx-37,176)+hand(178,90)+SC.tw((296,84,.6),(210,62,.5))
    if w=='bottle':
        return G(_bottle(False),240,150,1.5)+kid(cx,'happy')+arms(cx,[(cx-36,170)],[(cx+50,120),(214,84)])+hand(cx-37,176)+G(R(-10,-6,20,12,'#4FA3E0',4,3.5),222,76,1.5,'sv-bob',-18)+hand(212,86)+P('M232 98 q8 -6 16 0',None,3.5,'#B9B0BC')+SC.tw((296,84,.6))
    tgt=(190,134); return obj(w,240,160,1)+kid(cx,'happy')+arms(cx,[(cx-36,170)],[(cx+50,130),tgt])+hand(cx-37,176)+hand(*tgt)+SC.tw((290,60,.6),(200,70,.5))
def _playb(w):
    a=84; b=244; arc=P('M132 70 Q166 6 204 70',None,4,'#F2B33D',' stroke-dasharray="3 11"')
    k1=kid(a,'happy',3,legs='kick')+arms(a,[(a-44,150)],[(a+40,112),(a+50,80)])+hand(a-46,152)+hand(a+50,78)
    k2=SC.kidp(b,'friend','happy',-3)+SC.karms(b,'friend',[(b-40,112),(b-46,82)],[(b+40,112),(b+30,70)])+hand(b-46,80)+hand(b+30,68)
    return arc+k1+k2+obj(w,168,34,.75 if w=='ball' else 1,'sv-bob')+SC.lines((120,36,140,30),(116,52,138,50))+SC.tw((300,40,.6),(30,60,.5))
def _wash(w):
    cx=84; soap=R(292,176,22,38,'#F7A8C8',6,3.5)+R(299,166,8,12,'#FFFFFF',2,3)+P('M303 166 V160 H314',None,4)+R(296,190,14,10,'#FFFFFF',3,0)
    big=w=='car'; ob=obj(w,226,176 if big else 158,1 if big else .85)
    tub='' if big else P('M176 180 H280 L272 212 Q270 216 264 216 H192 Q186 216 184 212 Z','#9AD7F5',3.5)+E(228,180,52,8,'#DFF3FF',3.5)
    front='' if big else P('M178 184 Q228 198 278 184 L272 212 Q270 216 264 216 H192 Q186 216 184 212 Z','#9AD7F5',3.5)
    foam=SC.bubbles([(206,112,13),(228,100,15),(250,110,12),(238,84,9),(214,90,8),(262,92,7),(190,128,9),(268,130,10),(180,176,9),(204,186,10),(228,190,11),(254,186,10),(276,176,8),(288,120,5),(176,100,5),(246,66,5)])
    return tub+ob+front+soap+kid(cx,'happy')+arms(cx,[(cx-36,170)],[(cx+50,138),(196,128)])+hand(cx-37,176)+'<g class="sv-bub">'+foam+'</g>'+hand(196,128)+'<g class="sv-drop">'+SC.drops([(170,150),(290,150)])+'</g>'
def _hear(w): cx=88; return kid(cx,'o',3)+arms(cx,[(cx-36,170)],[(cx+52,110),(cx+40,92)])+hand(cx-37,176)+hand(cx+40,90)+E(cx+38,94,6,10,SC.SKIN,3)+'<g class="sv-wave">'+P('M190 80 Q178 96 190 112 M174 72 Q158 96 174 120 M158 64 Q138 96 158 128',None,4,'#F2B33D')+'</g>'+obj(w,244,168,1)
def _find(w):
    cx=88; grass=P('M206 214 L212 190 L220 214 M224 214 L232 184 L240 214 M250 214 L258 192 L264 214 M270 214 L276 198 L280 214','#8FCB8A',3.5)
    mag=G(R(-5,22,10,32,'#B07A4E',4,3)+C(0,0,24,'#E8F7FF',5)+E(-9,-9,5,8,'#FFFFFF',0),184,144,1,'',40)
    return obj(w,242,188,.7)+grass+kid(cx,'o',4)+arms(cx,[(cx-36,170)],[(cx+44,150),(cx+66,172)])+hand(cx-37,176)+mag+hand(cx+68,174)+BUB(150,40,26)+QM(150,38,.8)+'<g class="sv-tw">'+SC.spark(210,160,.6)+SC.spark(280,168,.6)+SC.spark(246,148,.5)+'</g>'
def _hug(w):
    if w in SC.PEOPLE:
        mx=190; kc=128; col=SC.ACOL.get(w,'#8ED1A5')
        return SC.PEOPLE[w](mx)+limb([(mx-22,104),(kc+20,124),(kc-24,150)],col)+kid(kc,'happy')+hand(kc-26,152)+limb([(kc+24,140),(mx+8,150),(mx+30,146)],'%C%')+hand(mx+32,146)+'<g class="sv-hearts">'+heart(150,26,1.2)+heart(112,18,.8)+heart(250,32,.9)+'</g>'
    if w in SC.KIDS:
        a=118; b=200; c2=SC.KIDS[w]
        return kid(b,'happy',-3,shirt=c2)+kid(a,'happy',3)+limb([(a+24,140),(b-8,150),(b+20,146)],'%C%')+hand(b+22,146)+limb([(b-24,140),(a+8,150),(a-20,146)],c2)+hand(a-22,146)+'<g class="sv-hearts">'+heart(160,40,1.1)+heart(130,28,.7)+'</g>'
    cx=150; return kid(cx,'happy')+obj(w,cx,160,.75)+arms(cx,[(cx-40,150),(cx-16,170)],[(cx+40,150),(cx+16,170)])+hand(cx-16,170)+hand(cx+16,170)+'<g class="sv-hearts">'+heart(110,50,.9)+heart(196,40,1.1)+'</g>'
_CORN=G(E(0,0,9,20,'#FFD84D',3)+P('M-5 -10 H5 M-7 -2 H7 M-7 6 H7 M-4 14 H4',None,2,'#E0A91E')+P('M-9 8 Q-14 22 0 24 Q14 22 9 8 Q0 18 -9 8 Z','#7CC96A',3),0,0,1,'',60)
_HAY=P('M-16 10 L-10 -14 L-4 8 L0 -18 L5 8 L11 -14 L16 10 Z','#8FCB8A',3)+R(-14,4,28,8,'#E2B57E',3,3)
def _feed(w):
    cx=88; food={'monkey':G(O['banana'],0,0,.45),'horse':G(O['carrot'],0,0,.5,'',70),'duck':G(O['bread'],0,0,.42),'pig':G(O['apple'],0,0,.42),'cow':_HAY,'sheep':_HAY,'chicken':_CORN}.get(w,G(O['bread'],0,0,.42)); crumb='<g class="sv-crumb">'+C(196,158,3,'#E9A94F',0)+C(204,170,2.5,'#E9A94F',0)+'</g>' if w=='duck' else ''
    return crumb+ obj(w,240,168,1)+kid(cx,'happy',3)+arms(cx,[(cx-36,170)],[(cx+46,150),(cx+80,146)])+hand(cx-37,176)+G(food,cx+92,140,1,'sv-bob')+hand(cx+80,146)
def _love(w):
    kc=96; px=230; who=SC.person(w,px) if w in SC.ACOL and w not in SC.PEOPLE else SC.kidp(px,w,'happy',-3) if w in SC.KIDS else obj(w,px,170,1)
    return who+kid(kc,'love')+arms(kc,[(kc-4,150)],[(kc+8,150)])+G(heart(0,0,2.2,'#F25C54'),kc+2,128)+hand(kc-6,152)+hand(kc+12,152)+'<g class="sv-hearts">'+heart(164,48,1)+heart(150,24,.7)+heart(178,20,.6)+'</g>'
def _catch(w): cx=150; return kid(cx,'happy')+arms(cx,[(cx-40,104),(cx-20,54)],[(cx+40,104),(cx+20,54)])+obj(w,cx,38,.8)+hand(cx-20,54)+hand(cx+20,54)+SC.lines((236,40,266,26),(240,62,278,56),(234,84,262,92))
def _pick(w): cx=110; return G(O[w],226,186,.7)+G(O[w],270,180,.8)+G(O[w],298,192,.6)+kid(cx,'happy',3)+arms(cx,[(cx-36,170)],[(cx+44,122),(cx+58,96)])+hand(cx-37,176)+G(O[w],cx+60,72,.55,'sv-bob')+hand(cx+58,96)
def _throw(w): cx=96; return kid(cx,'happy',3)+arms(cx,[(cx-44,150)],[(cx+44,112),(cx+56,78)])+hand(cx-46,152)+hand(cx+56,78)+SC.lines((158,96,196,84),(162,116,206,104),(156,76,190,62))+obj(w,250,70,.8,'sv-bob')
def _cut(w):
    cx=92; pc={'apple':G(P('M0 -17 Q17 -19 17 2 Q17 19 0 19 Z','#FFF6DC',3.5)+P('M0 -17 Q17 -19 17 2 Q17 19 0 19',None,4.5,'#E8504A')+C(6,-3,2.2,'#7A4A2A',0)+C(6,6,2.2,'#7A4A2A',0)+P('M0 -17 V19',None,3.5),278,150),
        'cheese':G(O['cheese'],284,158,.38),'sandwich':G(O['sandwich'],286,156,.42),'banana':C(274,160,7.5,'#FFF3C4',3)+C(290,164,7.5,'#FFF3C4',3)+C(274,160,2,'#E9D58A',0)+C(290,164,2,'#E9D58A',0),
        'carrot':C(274,160,7.5,'#F5913A',3)+C(290,164,7.5,'#F5913A',3)+C(274,160,2.5,'#FFC98A',0)+C(290,164,2.5,'#FFC98A',0),'tomato':C(282,160,11,'#F25C54',3)+C(282,160,5.5,'#F9A99A',0)+C(278,157,1.5,'#FFF3C4',0)+C(286,163,1.5,'#FFF3C4',0)}.get(w,'')
    return SC.table(176,306)+obj(w,236 if pc else 242,146,.72 if pc else .8)+pc+kid(cx,'happy',3)+arms(cx,[(cx-36,170)],[(cx+46,150),(182,150)])+hand(cx-37,176)+G(O['knife'],214,146,.8,'',20)+hand(182,150)
def _brush(w): cx=92; return kid(cx,'happy',3)+obj(w,232,170,1)+arms(cx,[(cx-36,170)],[(cx+50,140),(204,134)])+hand(cx-37,176)+G(O['hairbrush'],222,128,.7,'',-10)+hand(204,134)+SC.tw((270,118,.6),(214,98,.5))
def _climb(w):
    tx=206; t=G(O[w],tx,138,1.3); ed=tx-(40 if w=='tower' else 62)
    k=G(kid(0,'happy',3,legs='kick')+arms(0,[(-24,140),(34,128)],[(46,110),(40,50)])+hand(36,128)+hand(42,48),ed-24,64,.62)
    up=P('M60 86 l12 -14 l12 14 M60 112 l12 -14 l12 14 M60 138 l12 -14 l12 14',None,5.5,'#FF7A45')
    return t+k+up+'<g class="sv-drop">'+SC.drops([(ed-52,96)])+'</g>'+SC.tw((290,40,.6))
def _push(w): cx=88; return obj(w,222,176,.95)+kid(cx,'happy',3)+arms(cx,[(cx-10,160),(cx+56,152)],[(cx+46,146),(cx+62,146)])+hand(cx+56,152)+hand(cx+62,146)+SC.lines((20,140,44,140),(14,160,40,160))
def _build(w):
    if w=='snowman':
        cx=70; b=268; sn=obj('snowman',172,158,1.05)
        k1=kid(cx,'happy',3)+arms(cx,[(cx-36,170)],[(cx+44,140),(cx+72,128)])+hand(cx-37,176)+obj('snowball',cx+78,118,.5,'sv-bob')+hand(cx+72,130)
        k2=SC.kidp(b,'friend','happy',-3)+SC.karms(b,'friend',[(b-44,150),(b-66,160)],[(b+36,170)])+hand(b-68,160)+hand(b+37,176)
        snow=''.join(C(x,y,3,'#FFFFFF',2) for x,y in [(120,40),(150,20),(210,30),(230,60),(110,84),(240,100)])+E(118,210,16,6,'#FFFFFF',3)+E(226,210,14,5,'#FFFFFF',3)
        return sn+k1+k2+'<g class="sv-tw">'+snow+'</g>'
    cx=84; return obj(w,232,166,1)+kid(cx,'happy',3)+arms(cx,[(cx-36,170)],[(cx+44,130),(cx+66,120)])+hand(cx-37,176)+G(SC.blk(-12,-12,24,24,'#8BD07A'),cx+70,104,1,'sv-bob')+hand(cx+66,120)+SC.tw((290,70,.6),(180,60,.5))
def _carry(w): cx=150; return kid(cx,'happy')+arms(cx,[(cx-38,152),(cx-30,160)],[(cx+38,152),(cx+30,160)])+obj(w,cx,164,.75)+hand(cx-30,160)+hand(cx+30,160)+SC.lines((40,120,70,120),(32,144,66,144),(42,168,70,168))
def _smell(w): cx=110; return kid(cx,'happy',3)+arms(cx,[(cx-36,170)],[(cx+44,150),(cx+44,124)])+hand(cx-37,176)+obj(w,cx+58,106,.5)+hand(cx+44,124)+SC.steam(cx+64,78)+'<g class="sv-tw">'+P(f'M{cx+30} 84 Q{cx+38} 80 {cx+44} 86 M{cx+30} 74 Q{cx+40} 68 {cx+48} 76',None,3,'#B9B0BC')+'</g>'
def _buy(w): cx=90; return G(O['stall'],250,150,1)+obj(w,250,128,.5)+kid(cx,'happy',3)+arms(cx,[(cx-36,170)],[(cx+46,140),(cx+76,134)])+hand(cx-37,176)+G(O['coin'],cx+80,118,.45,'sv-bob')+hand(cx+76,134)
def _close(w): cx=88; tgt=(206,134); return obj(w,240,160,1)+kid(cx,'happy',3)+arms(cx,[(cx-36,170)],[(cx+50,130),tgt])+hand(cx-37,176)+hand(*tgt)+SC.tw((290,50,.6))
MORE_IV2={
 'drink':(_std('drink'),'soup'),
 'ride':(_ride,'a car|a truck|a boat|an airplane'),
 'open':(_open,'the bag|the bottle'),
 'play':(_playb,'ball|frisbee'),
 'wash':(_wash,'my cat|my car|my cup|my doll|my teddy bear'),
 'hear':(_hear,'a cat|a train|a bus|a phone|a piano|a guitar|a frog|a duck'),
 'find':(_find,'a ball|a sock|a leaf|a rock|a pencil|a spoon|a flower'),
 'hug':(_hug,'my grandma|my grandpa|my brother|my sister|my doll|my cat|my rabbit|my pillow'),
 'feed':(_feed,'the duck|the pig|the horse|the cow|the sheep|the monkey|the chicken'),
 'love':(_love,'my brother|my sister|my friend|my teacher|my dog|my cat|my puppy'),
 'catch':(_catch,'a balloon|a snowball|a paper plane|an apple'),
 'pick':(_pick,'a carrot|a potato|a leaf|a pumpkin|a lemon'),
 'throw':(_throw,'a sock|a leaf|a pillow|a toy'),
 'cut':(_cut,'the cheese|the sandwich|the apple|the banana|the carrot|the tomato'),
 'brush':(_brush,'my rabbit|my horse|my puppy|my sheep'),
 'climb':(_climb,'a tower|a castle'),
 'push':(_push,'a chair|a car|a table|a bike'),
 'build':(_build,'a snowman|a sandcastle|a car|a train'),
 'carry':(_carry,'a ball|a book|a cake|a watermelon|a teddy bear|a cat'),
 'smell':(_smell,'the soup|the cheese|the cookie|the chocolate|the soap|the banana'),
 'buy':(_buy,'a cake|a toy|a doll|a ball|an apple|milk|a cookie|a kite'),
}
for d in days:
    if d['v'] not in MORE_IV2: continue
    fn,items=MORE_IV2[d['v']]; v=d['v']; vp='w:'+v
    for it in items.split('|'):
        toks=it.split(); w=' '.join(toks[1:]) if toks[0] in('a','an','the','my') else it
        if any(f[0]==w for f in d['flash']): continue
        np,s_=noun_pic(w); d['flash'].append([s_,np,'n'])
        key='s:%s:%s'%(v,w); pics[key]=(f'<svg viewBox="0 0 320 240" class="sv-pic sv-{v}" aria-hidden="true">{GROUND}{fn(w)}</svg>').replace('%C%',B)
        d['sents'].append({'w':[['I',I_PIC],[v,vp],[it,np]],'s':key,'t':f'I {v} {it}.'})

OR='#FF7A45'
def inner_of(w):
    s2=SING.get(w,w)
    return PIC[s2]() if s2 in PIC else GROUND+G(O[s2],160,124,1.5)
def mini(w, x, y, sc):
    return f'<g transform="translate({x-160*sc:.1f} {y-120*sc:.1f}) scale({sc})">{inner_of(w)}</g>'
def QM(x, y, sc=1, col=OR):
    return f'<g transform="translate({x} {y}) scale({sc})">'+P('M-13 -16 Q-13 -34 2 -34 Q17 -34 17 -19 Q17 -8 2 -2 L2 8','none',10,col)+C(2,24,6.5,col,0)+'</g>'
def dash(x1,y1,x2,y2): return P(f'M{x1} {y1} L{x2} {y2}','none',5,OR,'stroke-dasharray="3 12" stroke-linecap="round"')
def kid_point(cx, hx, hy, face='smile'):
    return K(cx,face)+AR(cx,[(cx-36,170)],[(hx,hy)])+H((cx-37,176),(hx+4,hy-1))
EQ=R(118,84,84,22,OR,11,4)+R(118,132,84,22,OR,11,4)
KEY={
 'this': GROUND+kid_point(104,150,150)+glow(214,158,44)+arrow_dn(214,62,.9),
 'that': GROUND+kid_point(86,128,134)+dash(140,128,236,70)+glow(262,54,24)+arrow_dn(262,2,.5),
 'these': GROUND+kid_point(86,128,150)+glow(188,120,24)+glow(244,120,24)+glow(216,172,24),
 'is': EQ, 'are': EQ,
 'where': GROUND+C(140,104,58,'#FFFFFF',7)+P('M182 146 L232 196','none',16)+P('M182 146 L232 196','none',8,'#B07A4E')+QM(140,100,1.5),
 'who': GROUND+C(160,86,44,'#D9D2DC',4)+P('M88 214 Q92 138 160 138 Q228 138 232 214 Z','#D9D2DC',4)+QM(160,84,1.25,'#FFFFFF'),
 'when': GROUND+C(160,116,84,'#FFFFFF',7)+''.join(P(f'M{160+70*__import__("math").sin(i*1.5708):.0f} {116-70*__import__("math").cos(i*1.5708):.0f} L{160+60*__import__("math").sin(i*1.5708):.0f} {116-60*__import__("math").cos(i*1.5708):.0f}','none',6) for i in range(4))+QM(160,112,1.7),
 'do you': GROUND+kid_point(92,134,150)+K(226,'smile')+AR(226,[(190,170)],[(262,170)])+H((189,176),(263,176))+arrow_dn(226,40,.9),
}
for k,v in KEY.items(): put('w:'+k, v)
def clockq(x,y,r): return C(x,y,r,'#FFFFFF',5)+P(f'M{x} {y} L{x} {y-r*.55} M{x} {y} L{x+r*.4} {y+r*.2}','none',5)+QM(x+r*1.25,y-r*.5,.9)
NEWF=[
 ('this','This is ~',[('This','is','a dog'),('This','is','a cat'),('This','is','a ball'),('This','is','a book'),('This','is','a car')],
   lambda w: GROUND+kid_point(72,116,150)+mini(w,214,138,.62)+arrow_dn(214,20,.7)),
 ('that','That is ~',[('That','is','a bird'),('That','is','a tree'),('That','is','a house'),('That','is','a star'),('That','is','a bus')],
   lambda w: GROUND+kid_point(78,120,136)+dash(132,130,206,88)+mini(w,246,64,.34)+arrow_dn(246,-2,.45)),
 ('these','These are ~',[('These','are','apples'),('These','are','cookies'),('These','are','balloons'),('These','are','flowers'),('These','are','stars')],
   lambda w: GROUND+kid_point(64,104,150)+mini(w,160,84,.34)+mini(w,254,84,.34)+mini(w,207,166,.34)),
 ('where','Where is ~?',[('Where','is','the cat'),('Where','is','the dog'),('Where','is','the ball'),('Where','is','the hat'),('Where','is','the key')],
   lambda w: GROUND+K(92,'o')+AR(92,[(56,170)],[(134,110),(112,88)])+H((55,176),(110,86))+BUB(176,52,30)+QM(176,50,.95)+f'<g opacity=".5">{mini(w,246,150,.42)}</g>'+P('M196 222 Q196 176 226 180 Q236 156 258 172 Q286 162 290 192 Q306 198 300 222 Z','#8FCB8A',4)),
 ('who','Who is ~?',[('Who','is','happy'),('Who','is','sad'),('Who','is','sleepy'),('Who','is','hungry'),('Who','is','angry')],
   lambda w: f'<g transform="translate(26 30) scale(.86)">{inner_of(w)}</g>'+BUB(52,46,30)+QM(52,44,.95)),
 ('when','When do you ~?',[('When','do you','sleep'),('When','do you','eat'),('When','do you','play'),('When','do you','read'),('When','do you','wash')],
   lambda w: f'<g transform="translate(40 34) scale(.84)">{inner_of(w)}</g>'+clockq(50,52,34)),
]
SC_THIS=NEWF[0][3]; SC_THAT=NEWF[1][3]; SC_THESE=NEWF[2][3]; SC_WHERE=NEWF[3][3]; SC_WHO=NEWF[4][3]; SC_WHEN=NEWF[5][3]
def rows(a,b,items): return [(a,b,x) for x in items.split('|')]
NEWF+=[
 ('this','This is ~',rows('This','is','a chair|a cup|a spoon|a clock|a pencil'),SC_THIS),
 ('that','That is ~',rows('That','is','the moon|a cloud|a rainbow|an airplane|a boat'),SC_THAT),
 ('these','These are ~',rows('These','are','grapes|socks|blocks|crayons|potatoes'),SC_THESE),
 ('where','Where is ~?',rows('Where','is','the bed|the lamp|the phone|the towel|the soap'),SC_WHERE),
 ('who','Who is ~?',rows('Who','is','scared|tired|thirsty|sick|strong'),SC_WHO),
 ('when','When do you ~?',rows('When','do you','run|swim|dance|sing|walk'),SC_WHEN),
 ('this','This is ~',rows('This','is','a duck|a pig|a cow|a mouse|a monkey'),SC_THIS),
 ('that','That is ~',rows('That','is','an elephant|a lion|a bear|a truck|a sheep'),SC_THAT),
 ('these','These are ~',rows('These','are','pants|glasses|scissors|noodles|toys'),SC_THESE),
 ('where','Where is ~?',rows('Where','is','the panda|the chicken|the toothbrush|the plate|the fork'),SC_WHERE),
 ('this','This is ~',rows('This','is','a shirt|a dress|a doll|a puzzle|an umbrella'),SC_THIS),
 ('that','That is ~',rows('That','is','a school|a park|a zoo|a hospital|a store'),SC_THAT),
 ('this','This is ~',rows('This','is','a sandwich|cheese|soup|chocolate|a bowl'),SC_THIS),
 ('this','This is my ~',rows('This','is','my head|my nose|my mouth|my arm|my leg'),SC_THIS),
]
MORE_NF=['a hat|a bag|a box|a key|a kite|a bike|a tree','a kite|a balloon|a mountain|a bridge|a castle|a train','bananas|strawberries|eggs|carrots|tomatoes','the book|the car|the bag|the cup|the shoe','funny|cute|big|small|tall','jump|cook|draw|write|talk',
 'a table|a bed|a lamp|a fork|a plate|a door|a window','the sun|a butterfly|a tower','pencils|spoons|cups|books|balls','the chair|the table|the pillow|the clock|the door','fast|slow|loud|quiet|wet','climb|ride|paint|count|laugh',
 'a rabbit|a horse|a frog|a fish|a bear|a tiger|a butterfly','a horse|a cow|a tiger|a panda|a monkey','shoes|keys|hats|cars|dolls','the rabbit|the monkey|the duck|the pencil|the umbrella',
 'a coat|a skirt|a shoe|a sock|a robot|a drum|a balloon','a playground|a pool|the beach|the sea|a river','bread|rice|pizza|a cake|a cookie|an egg|milk','my hand|my foot|my ear|my eye|my hair|my face|my tummy']
assert len(MORE_NF)==len(NEWF)
NEWF=[(fk,label,list(rw)+[(rw[0][0],rw[0][1],x) for x in MORE_NF[i].split('|')],sc) for i,(fk,label,rw,sc) in enumerate(NEWF)]
PL={'bananas':'banana','strawberries':'strawberry','eggs':'egg','carrots':'carrot','tomatoes':'tomato','pencils':'pencil','spoons':'spoon','cups':'cup','books':'book','balls':'ball','keys':'key','hats':'hat','cars':'car','dolls':'doll','apples':'apple','cookies':'cookie','balloons':'balloon','flowers':'flower','stars':'star','grapes':'grape','blocks':'block','crayons':'crayon','potatoes':'potato','toys':'toy','socks':'sock'}
POS={w:p for w,p,ko,g in WORDS}
new_days=[]
for fk,label,rows,scene in NEWF:
    q=label.endswith('?'); flash=[[fk,'w:'+fk,'v']]; sents=[]
    for a,b,c in rows:
        w=c.split()[-1]; base=PL.get(w,w)
        np=put('w:'+base, inner_of(base))
        if not any(f[0]==base for f in flash): flash.append([base,np,'n'])
        cp=np
        if w in PL: cp=put('w3:'+base, GROUND+E(160,124,124,92,'#FFF3C4',0)+''.join(mini(base,x,y,.52).replace(GROUND,'') for x,y in [(110,92),(210,92),(160,158)]))
        key='s:%s:%s'%(fk,w); pics[key]=(f'<svg viewBox="0 0 320 240" class="sv-pic">{scene(base)}</svg>').replace('%C%',B)
        sents.append({'w':[[a,'w:'+a.lower()],[b,'w:'+b],[c,cp]],'s':key,'t':f'{a} {b} {c}'+('?' if q else '.'),'p':'?' if q else '.'})
    new_days.append({'v':fk,'label':label,'flash':flash,'sents':sents})
for d in days: d['label']='I '+d['v']+' ~'

mixed=[]; ni=0; NI=len(new_days); NA=len(days)
for i,d in enumerate(days):
    mixed.append(d)
    while ni<NI and ni<(i+1)*NI//NA: mixed.append(new_days[ni]); ni+=1
mixed+=new_days[ni:]; days=mixed
for i,d in enumerate(days):
    for j,st in enumerate(d['sents']):
        st['id']=f'{i}.{j}'; nw=st['w'][2][1].replace('w3:','w:'); c=[f for f in d['flash'] if f[1]==nw]; st['c']=c[0][0] if c else d['flash'][0][0]

def _wrap(inner, cls=''): return (f'<svg viewBox="0 0 320 240" class="sv-pic{cls}" aria-hidden="true">{inner}</svg>').replace('%C%',B)
def _addicon(prefix, icon):
    for k in list(pics):
        if k.startswith(prefix) or k==prefix: p=pics[k]; i=p.rindex('</svg>'); pics[k]=p[:i]+icon+p[i:]

NOSEICON=lambda x,y,s=1: G(P('M-5 -24 Q-7 -2 -16 6 Q-25 14 -14 20 Q-8 23 -4 18 Q0 22 4 18 Q8 23 14 20 Q25 14 16 6 Q7 -2 5 -24',SKIN,4)+E(-9,14,3.2,2.2,INK,0)+E(9,14,3.2,2.2,INK,0)+'<g class="sv-wave">'+P('M-10 54 q-6 -5 0 -10 q6 -5 0 -10 M10 56 q-6 -5 0 -10 q6 -5 0 -10',None,3.5,'#B9B0BC')+'</g>',x,y,s)
_addicon('s:see:', EYEICON(164,42,1)); _addicon('s:hear:', EARICON(176,34,.85)); _addicon('s:smell:', NOSEICON(40,40)); _addicon('w:smell', NOSEICON(40,40))

_WANT={'balloon':(238,150,.9),'kite':(238,132,.9),'teddy bear':(236,136,.8),'doll':(236,150,.85),'robot':(238,150,.78),'puppy':(232,134,.8),'ice cream':(236,152,1),'cake':(240,150,.85),'cookie':(236,136,1.2),'candy':(236,136,1.1),'ball':(236,136,.9)}
def _want2(w):
    cx=84; ob=G(O['toy'],226,132,1.3,'sv-bob') if w=='toy' else SC.obj(w,*_WANT.get(w,(236,136,1)),'sv-bob')
    return glow(236,134,60)+ob+SC.kid(cx,'star',3)+SC.arms(cx,[(cx+16,156),(cx+62,138)],[(cx+48,122),(cx+80,108)])+SC.hand(cx+64,137)+SC.hand(cx+82,106)+SC.hearts((150,52,.8),(176,34,.6))
for k in list(pics):
    if k.startswith('s:want:'): pics[k]=_wrap(GROUND+_want2(k[7:]),' sv-want')
pics['w:want']=_wrap(GROUND+_want2('cake'))

def _these(w):
    inner=inner_of(w).replace(GROUND,'')
    return GROUND+E(220,134,88,76,'#FFF3C4',0)+kid_point(64,108,146)+''.join(f'<g transform="translate({x-160*.42:.1f} {y-120*.42:.1f}) scale(.42)">{inner}</g>' for x,y in [(184,108),(254,108),(219,164)])
for k in list(pics):
    if k.startswith('s:these:'): pics[k]=_wrap(_these(PL.get(k[8:],k[8:])))

def _m(k,s,x=0,y=0,r=0): return G(O[k],x,y,s,'',r)
_sq=lambda x,y,c,r=0: G(R(-9,-9,18,18,c,3,3),x,y,1,'',r)
MAKE={
 'cake':[R(-30,-12,22,30,'#F3E3C3',4,3)+P('M-24 -2 H-14 M-24 6 H-14',None,2.5,'#C9A46A')+E(6,8,9,11,'#FFFFFF',3)+E(24,10,8,10,'#FFF1DE',3),
         _m('bowl',.85,0,6)+P('M6 0 L24 -24',None,6)+P('M6 0 L24 -24',None,3,'#B07A4E'), _m('cake',.42,4,9)],
 'snowman':[_m('snowball',.75,0,4), C(0,10,17,'#FFFFFF',3.5)+C(0,-13,11,'#FFFFFF',3.5), _m('snowman',.42,0,0)],
 'kite':[G(P('M0 -22 L15 -3 L0 18 L-15 -3 Z','#9AD7F5',3),-12,2)+P('M10 -18 L28 14 M30 -16 L12 16',None,4,'#B07A4E'),
         P('M0 -24 L17 -4 L0 20 L-17 -4 Z','#9AD7F5',3)+P('M0 -24 V20 M-17 -4 H17',None,3.5,'#B07A4E'), _m('kite',.46,0,2)],
 'card':[_m('paper',.5,-10,0)+_m('crayon',.3,22,2), R(-22,-22,44,44,'#FFF1DE',3,3)+P('M0 8 Q-14 -4 -8 -11 Q-2 -15 0 -7',None,3.5,'#F2788F')+_m('crayon',.26,12,-4), _m('card',.5,0,0)],
 'sandcastle':[_m('bucket',.5,-12,4)+P('M18 -22 V4',None,4,'#B07A4E')+P('M11 2 H25 V12 Q18 22 11 12 Z','#F25C54',3),
         P('M-28 20 L-24 -8 H-2 L2 20 Z','#E9C46A',3)+P('M8 20 L11 2 H25 L28 20 Z','#E9C46A',3)+''.join(C(x,y,1.5,'#C99A3A',0) for x,y in [(-18,2),(-8,10),(-14,-2),(16,10),(20,14)])+_m('bucket',.3,18,-14,160), _m('sandcastle',.46,0,-2)],
 'sandwich':[R(-32,-12,22,24,'#E9B872',7,3)+R(-6,-9,18,18,'#FFD84D',2,3)+C(24,0,9,'#F25C54',3)+C(24,0,3.5,'#F9A99A',0),
         R(-24,10,48,10,'#E9B872',5,3)+P('M-26 10 q6 -7 13 0 q6 -7 13 0 q6 -7 13 0 q6 -7 13 0','#7CC96A',3)+R(-22,-4,44,7,'#FFD84D',2,3)+E(-9,-8,9,4,'#F25C54',2.5)+E(11,-8,9,4,'#F25C54',2.5), _m('sandwich',.5,0,0)],
 'pizza':[E(-10,8,18,13,'#F3DDB0',3)+G(R(-15,-5,30,10,'#E2B57E',5,3)+P('M-22 0 H-15 M15 0 H22',None,4.5,'#B07A4E'),16,-13,1,'',-24),
         C(0,0,23,'#F3DDB0',3)+C(0,0,17,'#F25C54',0)+''.join(R(x,y,6,4,'#FFD84D',1,0) for x,y in [(-10,-8),(4,-10),(-4,2),(6,6),(-12,6)]), _m('pizza',.5,0,0)],
 'robot':[R(-30,-4,22,22,'#C9CED6',3,3)+R(-2,-18,18,16,'#C9CED6',3,3)+C(18,12,6,'#9AA3AF',3)+C(18,12,2,'#FFFFFF',0)+P('M-6 16 H6',None,5,'#F2B33D'),
         R(-14,-2,28,24,'#C9CED6',4,3)+R(-6,6,12,7,'#FFD84D',2,2.5)+G(R(-10,-8,20,16,'#C9CED6',3,3)+C(-4,0,2.5,'#6FB8E8',0)+C(4,0,2.5,'#6FB8E8',0),4,-18,1,'',12), _m('robot',.4,0,6)],
 'tower':[_sq(-20,10,'#F25C54',-14)+_sq(4,-8,'#6FB8E8',10)+_sq(22,12,'#FFD84D',22), _sq(-8,13,'#F25C54')+_sq(-8,-5,'#6FB8E8')+_sq(20,13,'#FFD84D',16), _m('tower',.46,0,0)],
 'house':[R(-30,-4,24,24,'#FFF1DE',2,3)+P('M2 18 L20 -8 L38 18 Z','#F25C54',3)+R(-22,8,8,12,'#B07A4E',1,2.5),
         R(-16,-2,32,24,'#FFF1DE',2,3)+R(-5,8,10,14,'#B07A4E',1,2.5)+G(P('M-22 8 L0 -12 L22 8 Z','#F25C54',3),2,-18,1,'',-10), _m('house',.44,0,4)],
}
def _flow(steps):
    o=''
    for i,st in enumerate(steps):
        x=20+i*102
        o+=R(x,168,76,64,'#FFF3C4' if i==2 else '#FFFFFF',14,3.5).replace(f'stroke="{INK}"','stroke="#FF7A45"' if i==2 else 'stroke="#E2B57E"')+G(st,x+38,200)
        if i<2: o+=P(f'M{x+81} 200 H{x+95} M{x+89} 193 L{x+96} 200 L{x+89} 207',None,5,'#FF7A45')
    return o
for k in list(pics):
    if k.startswith('s:make:'):
        w=k[7:]; p=pics[k]; inner=p[p.index('>')+1:p.rindex('</svg>')].replace(GROUND,'')
        pics[k]=_wrap(E(160,160,120,6,'#CFE6C2',0)+G(inner,46,0,.72)+_flow(MAKE[w]),' sv-make')

GRP={w:g for w,p,ko,g in WORDS}
for g,ws in {'음식':'tea lemonade mushroom pumpkin','탈것·장소':'scooter cart stroller wagon bridge tower castle','학교·놀이':'soccer basketball guitar snowman card sandcastle frisbee snowball|paper plane|swing robot','자연·날씨':'shell stick','동물':'puppy','집':'ladder rope basket bucket coin','옷':'sock'}.items():
    for part in ws.split('|'):
        for w in ([part] if ' ' in part and part=='paper plane' else part.split()): GRP[w]=g
GRP['bell']='학교·놀이'; GRP['shoe']='옷'; GRP['pillow']='집'; GRP['bottle']='집'; GRP['oven']='집'; GRP['lemon']='음식'
GORD=['동물','음식','집','옷','몸','사람','학교·놀이','탈것·장소','자연·날씨','그 밖','보고 듣고 말하기','몸으로','하는 일','마음','기분·몸','느낌','색깔','크기·모양']
seenw={};
for d in days:
    for f in d['flash']: seenw.setdefault(f[0],f[1])
mus={}
for w,pid in seenw.items(): mus.setdefault(GRP.get(w,'가리키는 말 · 묻는 말'),[]).append([w,pid])
mus=[[g,mus[g]] for g in GORD+['가리키는 말 · 묻는 말'] if g in mus]
assert sum(len(x[1]) for x in mus)==len(seenw)

open('data.js','w').write('const DATA='+json.dumps({'pics':pics,'days':days,'mus':mus},ensure_ascii=False,separators=(',',':'))+';')
print(len(days), len(pics), sum(len(v) for v in pics.values())//1024,'KB')
print([ (d['v'],[f[0] for f in d['flash']]) for d in days[:3]])

print('문장',sum(len(d['sents']) for d in days),[ (d['label'],len(d['sents'])) for d in days]); print('묶음 없는 낱말',[w for w in seenw if w not in GRP])
print('cards',len(seenw),'groups',[(g,len(x)) for g,x in mus])
print('order',[d['label'] for d in days])
