import base64, io, json, os, re, struct, sys, time, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
import numpy as np, soundfile as sf, lameenc

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "../../.."))
OUT = os.path.join(ROOT, "web/daneokiugi/voice")
KEY = os.environ.get("GOOGLE_TTS_KEY", "").strip()
if not KEY: print("키가 없어요 (GOOGLE_TTS_KEY)"); sys.exit(1)
cfg = json.load(open(os.path.join(HERE, "voice.json"), encoding="utf-8"))
SIG = f'{cfg["voice"]}|{cfg["rate"]}|{cfg["kbps"]}'
PART = int(cfg.get("part_mb", 3) * 1024 * 1024)
src = open(os.path.join(ROOT, "web/daneokiugi/app/words.js"), encoding="utf-8").read()
books = json.loads(src[src.index("["):src.rindex("]") + 1])
os.makedirs(OUT, exist_ok=True)
idx_path = os.path.join(OUT, "index.json")
try: idx = json.load(open(idx_path, encoding="utf-8"))
except Exception: idx = {}
if idx.get("sig") != SIG: idx = {"v": 1, "sig": SIG, "books": {}}

def read_part(name):
    b = open(os.path.join(OUT, name), "rb").read(); n = struct.unpack("<I", b[:4])[0]
    return json.loads(b[4:4 + n].decode("utf-8"))["items"], b[4 + n:]

def write_part(name, clips):
    items = {}; off = 0
    for t, mp in clips: items[t] = [off, len(mp)]; off += len(mp)
    head = json.dumps({"items": items}, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    with open(os.path.join(OUT, name), "wb") as f:
        f.write(struct.pack("<I", len(head))); f.write(head)
        for _, mp in clips: f.write(mp)
    return 4 + len(head) + off

def synth(text):
    body = {"input": {"text": text}, "voice": {"languageCode": cfg["voice"][:5], "name": cfg["voice"]},
            "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": 24000, "speakingRate": cfg["rate"]}}
    for tries in range(7):
        req = urllib.request.Request("https://texttospeech.googleapis.com/v1/text:synthesize", data=json.dumps(body).encode(),
                                     headers={"X-Goog-Api-Key": KEY, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return sf.read(io.BytesIO(base64.b64decode(json.loads(r.read())["audioContent"])), dtype="float32")
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")
            try: msg = json.loads(msg)["error"]["message"]
            except Exception: msg = msg[:200]
            if e.code in (429, 500, 503) and tries < 6: time.sleep(5 * (tries + 1)); continue
            raise RuntimeError(f"HTTP {e.code}: {msg}")
        except urllib.error.URLError as e:
            if tries < 6: time.sleep(3); continue
            raise RuntimeError(str(e.reason))

def tidy(a, sr):
    a = np.asarray(a, dtype=np.float32).reshape(-1); peak = float(np.max(np.abs(a))) if len(a) else 0.0
    if peak <= 0: return a
    i = np.where(np.abs(a) > peak * 0.02)[0]
    a = a[max(0, i[0] - int(sr * 0.015)):min(len(a), i[-1] + int(sr * 0.07))]
    a = a * (0.89 / peak)
    n = min(len(a), int(sr * 0.004)); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n)
    return a

def mp3(a, sr):
    enc = lameenc.Encoder(); enc.set_bit_rate(int(cfg["kbps"])); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    return bytes(enc.encode((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())) + bytes(enc.flush())

def make(text):
    try: a, sr = synth(text); return text, mp3(tidy(a, sr), sr), ""
    except Exception as e: return text, None, str(e)[:160]

cache = {}; have = {}
for b in books:
    have[b["id"]] = set()
    for name, _, _ in idx["books"].get(b["id"], {}).get("parts", []):
        try: items, data = read_part(name)
        except Exception: continue
        for t, (o, n) in items.items(): cache[t] = data[o:o + n]; have[b["id"]].add(t)

made = reused = 0; fails = []; chars = 0
for b in books:
    bid = b["id"]; texts = []
    for w in b["words"]:
        for t in (w[0], w[3] if len(w) > 3 else ""):
            t = (t or "").strip()
            if t and t not in texts: texts.append(t)
    parts = idx["books"].get(bid, {}).get("parts", [])
    if parts and len(have[bid] - set(texts)) > 0.4 * max(1, len(have[bid])): parts = []; have[bid] = set()
    miss = [t for t in texts if t not in have[bid]]
    todo = [t for t in miss if t not in cache]
    if todo:
        with ThreadPoolExecutor(4) as ex:
            for k, (t, mp, err) in enumerate(ex.map(make, todo)):
                if mp: cache[t] = mp; made += 1; chars += len(t)
                else:
                    fails.append(t); print("실패", bid, str(k), err, flush=True)
                if (k + 1) % 200 == 0: print("…", bid, k + 1, "/", len(todo), flush=True)
                if len(fails) >= 30: break
    reused += len(miss) - len(todo)
    seq = max([int(re.search(r"-(\d+)\.bin$", p[0]).group(1)) for p in parts] + [0]); clips = []; size = 0
    def flush():
        global seq, clips, size
        if not clips: return
        seq += 1; name = f"{bid}-{seq}.bin"; parts.append([name, write_part(name, clips), len(clips)]); clips = []; size = 0
    for t in miss:
        if t not in cache: continue
        clips.append((t, cache[t])); size += len(cache[t])
        if size >= PART: flush()
    flush()
    idx["books"][bid] = {"parts": parts, "n": len(texts), "size": sum(p[1] for p in parts)}
    json.dump(idx, open(idx_path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"{bid}: 말 {len(texts)}개 · 묶음 {len(parts)}개 · {idx['books'][bid]['size'] // 1024} KB", flush=True)
    if len(fails) >= 30: print("실패가 많아서 멈춰요"); break
want = {p[0] for v in idx["books"].values() for p in v["parts"]}; gone = 0
for f in os.listdir(OUT):
    if f.endswith(".bin") and f not in want: os.remove(os.path.join(OUT, f)); gone += 1
total = sum(v["size"] for v in idx["books"].values())
print(f"목소리 {cfg['voice']} · 새로 {made}개({chars}자) · 다른 단어장 것 다시 씀 {reused}개 · 지운 묶음 {gone}개 · 실패 {len(fails)}개 · 모두 {total // 1024} KB")
sys.exit(1 if fails else 0)
