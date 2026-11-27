import base64, io, json, os, sys, time, urllib.request, urllib.error
import numpy as np, soundfile as sf, lameenc

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.normpath(os.path.join(HERE, "../../../web/today-study/pet/app/voice"))
KEY = os.environ.get("GOOGLE_TTS_KEY", "").strip()
if not KEY: print("키가 없어요 (GOOGLE_TTS_KEY)"); sys.exit(1)
cfg = json.load(open(os.path.join(HERE, "voice.json"), encoding="utf-8"))
texts = json.load(open(os.path.join(HERE, "texts.json"), encoding="utf-8"))
os.makedirs(OUT, exist_ok=True)
meta_path = os.path.join(OUT, "_meta.json")
try: meta = json.load(open(meta_path, encoding="utf-8"))
except Exception: meta = {}

sig = lambda text, lang: f'{text}|{cfg[lang]["voice"]}|{cfg[lang]["rate"]}'
if meta.get("fmt") == 2:
    meta = {"fmt": 3, "files": {n: f'{t}|{meta.get("voice")}|{meta.get("rate")}' for n, t in meta.get("files", {}).items()}}
elif meta.get("fmt") != 3: meta = {"fmt": 3, "files": {}}
meta["voice"] = cfg["en"]["voice"]; meta["rate"] = cfg["en"]["rate"]; meta["ko"] = cfg["ko"]["voice"]

def synth(text, lang):
    v = cfg[lang]
    body = {"input": {"text": text}, "voice": {"languageCode": v["voice"][:5], "name": v["voice"]},
            "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": 24000, "speakingRate": v["rate"]}}
    for tries in range(6):
        req = urllib.request.Request("https://texttospeech.googleapis.com/v1/text:synthesize", data=json.dumps(body).encode(),
                                     headers={"X-Goog-Api-Key": KEY, "Content-Type": "application/json"})
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return sf.read(io.BytesIO(base64.b64decode(json.loads(r.read())["audioContent"])), dtype="float32")
        except urllib.error.HTTPError as e:
            msg = e.read().decode("utf-8", "replace")
            try: msg = json.loads(msg)["error"]["message"]
            except Exception: msg = msg[:200]
            if e.code in (429, 500, 503) and tries < 5: time.sleep(4 * (tries + 1)); continue
            raise RuntimeError(f"HTTP {e.code}: {msg}")
        except urllib.error.URLError as e:
            if tries < 5: time.sleep(3); continue
            raise RuntimeError(str(e.reason))

def tidy(a, sr):
    a = np.asarray(a, dtype=np.float32).reshape(-1); peak = float(np.max(np.abs(a))) if len(a) else 0.0
    if peak <= 0: return a
    idx = np.where(np.abs(a) > peak * 0.02)[0]
    a = a[max(0, idx[0] - int(sr * 0.015)):min(len(a), idx[-1] + int(sr * 0.07))]
    a = a * (0.89 / peak)
    n = min(len(a), int(sr * 0.004)); a[:n] *= np.linspace(0, 1, n); a[-n:] *= np.linspace(1, 0, n)
    return a

def mp3(a, sr):
    enc = lameenc.Encoder(); enc.set_bit_rate(48); enc.set_in_sample_rate(sr); enc.set_channels(1); enc.set_quality(2)
    return bytes(enc.encode((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())) + bytes(enc.flush())

made = skipped = 0; fails = []
for row in texts:
    text, name = row[0], row[1]; lang = row[2] if len(row) > 2 else "en"
    path = os.path.join(OUT, name + ".mp3")
    if meta["files"].get(name) == sig(text, lang) and os.path.exists(path): skipped += 1; continue
    try:
        a, sr = synth(text, lang); open(path, "wb").write(mp3(tidy(a, sr), sr)); meta["files"][name] = sig(text, lang); made += 1
        if made % 40 == 0: print("…", made, flush=True)
        time.sleep(0.12)
    except Exception as e:
        fails.append(name); print("실패", name, str(e)[:160], flush=True)
        if len(fails) >= 12: print("실패가 많아서 멈춰요"); break
want = {r[1] for r in texts}; gone = 0
for f in os.listdir(OUT):
    if f.endswith(".mp3") and f[:-4] not in want: os.remove(os.path.join(OUT, f)); meta["files"].pop(f[:-4], None); gone += 1
json.dump(meta, open(meta_path, "w", encoding="utf-8"), ensure_ascii=False, sort_keys=True)
size = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if f.endswith(".mp3"))
print(f"목소리 {cfg['en']['voice']} / {cfg['ko']['voice']} · 새로 {made}개 · 그대로 {skipped}개 · 지움 {gone}개 · 실패 {len(fails)}개 · 모두 {size // 1024} KB")
sys.exit(1 if fails else 0)
