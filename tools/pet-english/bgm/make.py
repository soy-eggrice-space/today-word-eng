import struct, subprocess, sys, os, json, urllib.request
import numpy as np, soundfile as sf, lameenc
from scipy.signal import butter, sosfiltfilt

PPQ = 480
N = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
def nn(s, base=60):
    o = 12 if s[0].islower() else 0
    return base + N[s[0].upper()] + o + (-12 if s.endswith(',') else 0)
def mel(txt):
    out = []
    for t in txt.split():
        if t == '|': continue
        i = 1
        while i < len(t) and t[i] in ",'": i += 1
        out.append((None if t[0] == 'z' else t[:i], float(t[i:] or 1)))
    return out
CH = {'C': [0, 4, 7], 'F': [5, 9, 12], 'G': [7, 11, 14], 'G7': [7, 11, 17], 'Am': [9, 12, 16], 'Dm': [2, 5, 9]}

def vlq(n):
    b = [n & 0x7F]; n >>= 7
    while n: b.append((n & 0x7F) | 0x80); n >>= 7
    return bytes(reversed(b))
class Song:
    def __init__(self, bpm): self.bpm = bpm; self.ev = []; self.prog = {}
    def inst(self, ch, program, vol=100, pan=64):
        self.ev += [(0, bytes([0xC0 | ch, program])), (0, bytes([0xB0 | ch, 7, vol])), (0, bytes([0xB0 | ch, 10, pan])), (0, bytes([0xB0 | ch, 91, 46]))]
    def note(self, ch, pitch, start, dur, vel):
        a = int(round(start * PPQ)); b = int(round((start + dur) * PPQ)) - 4
        self.ev += [(a, bytes([0x90 | ch, pitch, max(1, min(127, int(vel)))])), (max(a + 1, b), bytes([0x80 | ch, pitch, 0]))]
    def midi(self, end_beats):
        us = int(60e6 / self.bpm); ev = [(0, b'\xFF\x51\x03' + us.to_bytes(3, 'big'))] + self.ev
        ev.sort(key=lambda e: (e[0], 0 if e[1][0] & 0xF0 == 0x80 else 1)); out = b''; last = 0
        for t, d in ev: out += vlq(t - last) + d; last = t
        out += vlq(max(0, int(end_beats * PPQ) - last)) + b'\xFF\x2F\x00'
        return b'MThd' + struct.pack('>IHHH', 6, 0, 1, PPQ) + b'MTrk' + struct.pack('>I', len(out)) + out

def arrange(s, t0, tune, chords, cpb, lead, lead_oct, dbl=None, bar=4, sway=False, soft=1.0):
    t = t0
    for i, (p, d) in enumerate(tune):
        if p:
            strong = abs((t - t0) % bar) < 1e-6
            v = (96 if strong else 84) + (i * 7) % 5 - 2
            s.note(0, nn(p, 60 + 12 * lead_oct), t, d * .96, v * soft)
            if dbl is not None: s.note(1, nn(p, 60 + 12 * (lead_oct + dbl)), t, d * .9, 46 * soft)
        t += d
    total = t - t0
    for k, c in enumerate(chords):
        b0 = t0 + k * cpb
        if b0 >= t0 + total - 1e-6: break
        r, th, fi = CH[c][0], CH[c][1], CH[c][2]
        s.note(3, 36 + r, b0, cpb * .9, 58 * soft)
        if sway:
            for j in (1, 2):
                if j < cpb: s.note(2, 48 + th, b0 + j, .8, 40 * soft); s.note(2, 48 + fi, b0 + j, .8, 38 * soft)
        else:
            pat = [r, fi, th, fi]
            for j in range(int(cpb * 2)): s.note(2, 48 + pat[j % 4], b0 + j * .5, .46, (44 if j % 2 == 0 else 36) * soft)
    return t0 + total

TWINKLE = mel('C C G G | A A G2 | F F E E | D D C2 | G G F F | E E D2 | G G F F | E E D2 | C C G G | A A G2 | F F E E | D D C2')
TW_CH = 'C C F C F C G C  C F C G  C F C G  C C F C F C G C'.split()
BUTTERFLY = mel('G E E2 | F D D2 | C D E F | G G G2 | G E E2 | F D D2 | C E G G | E E E2 | D D D D | D E F2 | E E E E | E F G2 | G E E2 | F D D2 | C E G G | C C C2')
BF_CH = 'C G C C C G C C G G C C C G C C'.split()
LAMB = mel('E D C D | E E E2 | D D D2 | E G G2 | E D C D | E E E E | D D E D | C4')
LB_CH = 'C C G C C C G C'.split()
LULL = mel('E.5 E.5 | G1.5 E.5 E | G2 E.5 G.5 | c B1.5 A.5 | A G D.5 E.5 | F D D.5 E.5 | F2 D.5 F.5 | B.5 A.5 G B | c2 C.5 C.5 | c2 A.5 F.5 | G2 E.5 C.5 | F G A | G2 C.5 C.5 | c2 A.5 F.5 | G2 E.5 C.5 | F E D | C2')
LU_CH = 'C C C C G7 G7 G7 C F C G7 C F C G7 C'.split()

def kids(bpm, lead, acc, name, parts, dbl_prog=9):
    s = Song(bpm); s.inst(0, lead, 112); s.inst(1, dbl_prog, 78, 80); s.inst(2, acc, 80, 50); s.inst(3, 32, 84)
    t = 0
    for tune, ch, cpb, rep in parts:
        for r in range(rep): t = arrange(s, t, tune, ch, cpb, lead, 1, dbl=(1 if r % 2 else None))
    return name, s, t
def lull(bpm, name):
    s = Song(bpm); s.inst(0, 10, 110); s.inst(1, 8, 70, 80); s.inst(2, 46, 76, 50); s.inst(3, 32, 70)
    for r in range(2):
        base = r * 48
        arrange(s, base, LULL[:2], [], 3, 10, 1, bar=3, soft=.9)
        arrange(s, base + 1, LULL[2:], LU_CH, 3, 10, 1, dbl=(1 if r else None), bar=3, sway=True, soft=.9)
    return name, s, 96.0

SONGS = [
    kids(86, 10, 46, 'm1_star', [(TWINKLE, TW_CH, 2, 2)]),
    kids(86, 12, 45, 'm2_butterfly', [(BUTTERFLY, BF_CH, 4, 2)]),
    kids(86, 8, 24, 'm3_plane', [(LAMB, LB_CH, 4, 4)]),
    kids(86, 10, 46, 'm4_medley', [(TWINKLE, TW_CH, 2, 1), (BUTTERFLY, BF_CH, 4, 1), (LAMB, LB_CH, 4, 2)]),
    lull(72, 'm5_lullaby'),
]

def mp3(x, sr, path, kbps):
    enc = lameenc.Encoder(); enc.set_bit_rate(kbps); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    open(path, 'wb').write(enc.encode((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes()) + enc.flush())

def gentle(m, sr, lo, hi, order, fin, fout, level=.3):
    m = sosfiltfilt(butter(2, lo, 'highpass', fs=sr, output='sos'), m); m = sosfiltfilt(butter(order, hi, 'lowpass', fs=sr, output='sos'), m)
    m = m / (np.sqrt((m ** 2).mean()) or 1) * .10; m = np.tanh(m / .8) * .8
    a, b = int(fin * sr), int(fout * sr)
    if a: m[:a] *= np.linspace(0, 1, a) ** 2
    if b: m[-b:] *= np.linspace(1, 0, b) ** 2
    return (m * level).astype('float32')

if __name__ == '__main__':
    font, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True); info = {}

    name, s, beats = SONGS[0]
    open('_star.mid', 'wb').write(s.midi(beats + 10))
    subprocess.run(['fluidsynth', '-ni', '-F', '_star.wav', '-r', '44100', '-g', '0.7', font, '_star.mid'], check=True, stdout=subprocess.DEVNULL)
    d, sr = sf.read('_star.wav', dtype='float32', always_2d=True); m = d.mean(axis=1)
    L = int(round(beats * 60 / s.bpm * sr)); m = m[:L + int(3.6 * sr)]
    x = np.concatenate([gentle(m, sr, 90, 4500, 2, .05, 3.0), np.zeros(int(1.2 * sr), 'float32')])
    mp3(x, sr, os.path.join(out, 'star.mp3'), 64); os.remove('_star.wav'); os.remove('_star.mid')
    info['star'] = {'sec': round(len(x) / sr, 1), 'rms': round(float(np.sqrt((x ** 2).mean())), 4), 'peak': round(float(np.abs(x).max()), 3)}

    try:
        raw = urllib.request.urlopen(urllib.request.Request('https://incompetech.com/music/royalty-free/mp3-royaltyfree/Life%20of%20Riley.mp3', headers={'User-Agent': 'Mozilla/5.0'}), timeout=120).read()
        open('_riley.mp3', 'wb').write(raw); d, sr = sf.read('_riley.mp3', dtype='float32', always_2d=True); os.remove('_riley.mp3')
        x = gentle(d.mean(axis=1), sr, 100, 2800, 4, 2.5, 4.0)
        mp3(x, sr, os.path.join(out, 'riley.mp3'), 56)
        info['riley'] = {'sec': round(len(x) / sr, 1), 'rms': round(float(np.sqrt((x ** 2).mean())), 4), 'peak': round(float(np.abs(x).max()), 3)}
    except Exception as e:
        print('Life of Riley를 받지 못했어요:', repr(e))
    open(os.path.join(out, 'CREDITS.txt'), 'w', encoding='utf-8').write(
        'riley.mp3 — "Life of Riley" Kevin MacLeod (incompetech.com)\nLicensed under Creative Commons: By Attribution 4.0 License\nhttp://creativecommons.org/licenses/by/4.0/\n'
        '바꾼 점: 한 채널로 합치고, 높은 소리를 깎고, 소리 크기를 낮추고, 앞뒤를 서서히 키우고 줄였어요.\n\n'
        'star.mp3 — 전래 가락 "작은 별"(Ah! vous dirai-je, maman)을 이 앱에 맞춰 새로 엮은 것. 소리: FluidR3_GM (MIT)\n')
    print(json.dumps(info, ensure_ascii=False, indent=1))
