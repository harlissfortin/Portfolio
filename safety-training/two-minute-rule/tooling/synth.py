"""
Synthesize the narration for "The 2-Minute Rule" from source/narration.json with Kokoro (ONNX),
measure the real start/end of every cue, and write:
  build/narration.wav      continuous narration track (24 kHz mono)
  source/timing.json       global cue + scene times the renderer animates against
  captions.vtt             WebVTT captions with the measured times
Each cue is synthesized separately so caption times are measured, not estimated. Punctuation carries the pauses inside
a cue. In a cue's "tts" text, " | " forces a split: each phrase is synthesized on its own and joined with PAUSE seconds of
silence. A split resets the voice's intonation, so use it only where a measured squeeze needs it (e.g. "Go, | fix it").

Run from a directory containing kokoro/kokoro-v1.0.onnx and kokoro/voices-v1.0.bin
(GitHub release thewh1teagle/kokoro-onnx model-files-v1.0); pip install kokoro-onnx soundfile.
Usage: python synth.py [voice] [speed]
"""
import json, re, sys, pathlib, hashlib
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT  = pathlib.Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"; BUILD.mkdir(exist_ok=True)
CACHE = BUILD / "cue-cache"; CACHE.mkdir(exist_ok=True)   # per-cue audio, keyed by voice+speed+text
VOICE = sys.argv[1] if len(sys.argv) > 1 else "af_heart"
SPEED = float(sys.argv[2]) if len(sys.argv) > 2 else 0.80
PAUSE = 0.16  # seconds between " | " phrases inside a cue
SR = 24000
GAP_CUE, GAP_BEAT, LEAD, TAIL = 0.34, 0.8, 0.6, 1.0   # seconds; GAP_BEAT after cues marked "beat"

src = json.loads((ROOT / "source/narration.json").read_text())
kok = Kokoro("kokoro/kokoro-v1.0.onnx", "kokoro/voices-v1.0.bin")

def tts_text(c):
    t = c.get("tts", c["text"])
    t = t.replace("—", ",").replace("–", "-").replace("“", '"').replace("”", '"').replace("’", "'")
    return re.sub(r",\s*,", ",", t)

def silence(sec): return np.zeros(int(round(sec * SR)), dtype=np.float32)

def fade(x, ms=10):
    n = int(SR * ms / 1000); r = np.linspace(0, 1, n, dtype=np.float32)
    x[:n] *= r; x[-n:] *= r[::-1]; return x

def word_times(text, x, start):
    """Measured word times for one cue: find the pauses in its audio, align them to the punctuation breaks in the
    caption (in order, nearest by expected position), then spread each phrase's words over its speech by length."""
    hop = SR // 100
    env = np.abs(x[: len(x) // hop * hop]).reshape(-1, hop).max(axis=1)
    quiet = env < 10 ** (-38 / 20)
    pauses, i = [], 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]: j += 1
            if j - i >= 8 and i > 5 and j < len(quiet) - 5: pauses.append((i / 100, j / 100))
            i = j
        else: i += 1
    toks = text.split()
    if not toks: return []
    cum, pos = [], 0
    for tk in toks: cum.append(pos); pos += len(tk) + 1
    dur = len(x) / SR
    bounds = [k for k, tk in enumerate(toks[:-1]) if re.search(r"[,.;:?!”)]$", tk)]
    # monotonic alignment of pauses to punctuation breaks: compare the share of VOICED time before each pause with the
    # share of characters before each break, so long pauses don't skew the positions; every real pause should land
    # on a break (skipping one costs more than a poor match), while a comma without a pause is cheap to skip
    total_pause = sum(pe - ps for ps, pe in pauses); voiced = max(dur - total_pause, 1e-3)
    fv, acc = [], 0.0
    for ps, pe in pauses: fv.append((ps - acc) / voiced); acc += pe - ps
    gb = [(cum[k] + len(toks[k]) + 1) / pos for k in bounds]
    n, m, SKIP_P, SKIP_B = len(pauses), len(bounds), 1.0, 0.15
    D = [[0.0] * (m + 1) for _ in range(n + 1)]; B = [[None] * (m + 1) for _ in range(n + 1)]
    for i in range(1, n + 1): D[i][0] = i * SKIP_P; B[i][0] = 'p'
    for j in range(1, m + 1): D[0][j] = j * SKIP_B; B[0][j] = 'b'
    for i in range(1, n + 1):
        for j in range(1, m + 1):
            opts = [(D[i-1][j-1] + abs(fv[i-1] - gb[j-1]) * voiced, 'm'), (D[i-1][j] + SKIP_P, 'p'), (D[i][j-1] + SKIP_B, 'b')]
            D[i][j], B[i][j] = min(opts)
    assigned, i, j = {}, n, m
    while i > 0 or j > 0:
        op = B[i][j]
        if op == 'm': assigned[bounds[j-1]] = pauses[i-1]; i -= 1; j -= 1
        elif op == 'p': i -= 1
        else: j -= 1
    segs, t0, k0 = [], 0.0, 0
    for k in sorted(assigned):
        ps, pe = assigned[k]; segs.append((k0, k, t0, ps)); t0, k0 = pe, k + 1
    segs.append((k0, len(toks) - 1, t0, dur))
    words = []
    for a, b, s0, s1 in segs:
        lens = [len(toks[i]) + 1 for i in range(a, b + 1)]; tot = sum(lens) or 1; acc = 0
        for i, ln in zip(range(a, b + 1), lens):
            words.append([re.sub(r"[^\w'’-]", "", toks[i]).lower(), round(start + s0 + (s1 - s0) * acc / tot, 3)]); acc += ln
    return words

def fmt(t):
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return "%02d:%02d:%06.3f" % (h, m, s)

parts, t = [silence(LEAD)], LEAD
timing = {"voice": VOICE, "speed": SPEED, "fps": src.get("fps", 30), "scenes": [], "cues": []}
vtt = ["WEBVTT", "Kind: captions", "Language: en", ""]
for si, scene in enumerate(src["scenes"]):
    pre = scene.get("pre", 0.0)            # silent lead-in for a visual beat before the first line
    if pre: parts.append(silence(pre)); t += pre
    s_start = 0.0 if si == 0 else t - pre
    for ci, c in enumerate(scene["cues"]):
        segs = []
        for phrase in [p.strip() for p in tts_text(c).split("|") if p.strip()]:
            key = hashlib.sha1(f"{VOICE}|{SPEED}|{phrase}".encode()).hexdigest()[:16]
            cache = CACHE / f"{key}.npy"
            if cache.exists():
                samples = np.load(cache)
            else:
                samples, sr = kok.create(phrase, voice=VOICE, speed=SPEED, lang="en-us")
                assert sr == SR
                np.save(cache, np.asarray(samples, dtype=np.float32))
            y = fade(np.asarray(samples, dtype=np.float32).copy())
            thr = 10 ** (-50 / 20); idx = np.where(np.abs(y) > thr)[0]
            if len(idx): y = y[max(0, idx[0] - int(0.02 * SR)): idx[-1] + int(0.06 * SR)]
            segs += [y, silence(PAUSE)]
        x = np.concatenate(segs[:-1])
        start = t; parts.append(x); t += len(x) / SR
        timing["cues"].append({"id": c["id"], "scene": scene["id"], "start": round(start, 3), "end": round(t, 3), "text": c["text"],
                               "words": word_times(c["text"], x, start)})
        gap = c.get("after", GAP_BEAT if c.get("beat") else GAP_CUE)
        parts.append(silence(gap)); t += gap
    post = scene.get("post", 0.4)
    parts.append(silence(post)); t += post
    timing["scenes"].append({"id": scene["id"], "chapter": scene.get("chapter", ""), "start": round(s_start, 3), "end": round(t, 3)})
    print("%-14s %6.1f – %6.1f s  %2d cues" % (scene["id"], s_start, t, len(scene["cues"])))
parts.append(silence(TAIL)); t += TAIL
timing["scenes"][-1]["end"] = round(t, 3)
timing["duration"] = round(t, 3)

audio = np.concatenate(parts)
audio *= 0.891 / (float(np.max(np.abs(audio))) or 1.0)      # peak-normalize to -1 dBFS
sf.write(BUILD / "narration.wav", audio, SR, subtype="PCM_16")
(ROOT / "source/timing.json").write_text(json.dumps(timing, indent=1, ensure_ascii=False))
# captions hold until the next line when the gap is short (matches the burned-in captions, avoids flicker)
cues = timing["cues"]
for i, c in enumerate(cues):
    nxt = cues[i + 1]["start"] if i + 1 < len(cues) else None
    end = nxt if nxt is not None and nxt - c["end"] < 0.9 else c["end"] + 0.25
    cue_text = c["text"].replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")   # WebVTT escaping
    vtt += [c["id"], "%s --> %s" % (fmt(c["start"]), fmt(end)), cue_text, ""]
(ROOT / "captions.vtt").write_text("\n".join(vtt))
words = sum(len(c["text"].split()) for c in timing["cues"])
print("total %.1f s, %d words, %.0f wpm overall" % (t, words, words / (t / 60)))
