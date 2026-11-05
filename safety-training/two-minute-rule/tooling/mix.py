"""Mix the soundtrack: narration + a quiet music bed that ducks under the voice + soft sound cues.
Inputs:  build/narration.wav (synth.py), build/events.json (events.js), source/timing.json
Output:  build/mix.wav (48 kHz mono, peak -1 dBFS; render.js loudness-normalizes it)
Everything is synthesized here from sines (no samples, no licences). Usage: python tooling/mix.py [--no-music]
Levels: the bed sits about 26 dB under the voice while someone is speaking and about 17 dB under it in pauses;
cues peak about 16-20 dB under the voice peak."""
import json, sys, subprocess, pathlib
import numpy as np, soundfile as sf

ROOT = pathlib.Path(__file__).resolve().parent.parent
B = ROOT / "build"
SR = 48000
timing = json.loads((ROOT / "source/timing.json").read_text())
events = json.loads((B / "events.json").read_text())

# narration, resampled to 48 kHz by ffmpeg
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", str(B / "narration.wav"), "-ar", str(SR), "-ac", "1", str(B / "narr48.wav")], check=True)
voice, _ = sf.read(B / "narr48.wav", dtype="float32")
N = len(voice); T = N / SR
db = lambda d: 10 ** (d / 20)
note = lambda n: 440.0 * 2 ** ((n - 69) / 12)          # MIDI note -> Hz

# ---------- music bed: slow pad, four chords, 8 s each, crossfaded ----------
def pad(n_samples):
    t = np.arange(n_samples) / SR
    chords = [[50, 57, 62, 66, 69], [47, 54, 59, 62, 66], [43, 50, 55, 59, 66], [45, 52, 57, 61, 64]]   # D, Bm, G, A (add9/7 colours)
    L = 8.0; out = np.zeros(n_samples, dtype=np.float64)
    for k in range(int(np.ceil(T / L)) + 1):
        c0, c1 = int(max(0, (k * L - 2.5) * SR)), int(min(n_samples, ((k + 1) * L + 2.5) * SR))
        if c0 >= c1: continue
        tt = t[c0:c1]; x = np.zeros(c1 - c0)
        for i, m in enumerate(chords[k % 4]):
            f = note(m); amp = (1.0 if i == 0 else 0.55) / (1 + 0.15 * i)
            x += amp * (np.sin(2 * np.pi * f * tt + i) + 0.6 * np.sin(2 * np.pi * f * 1.003 * tt + 2 * i)
                        + 0.12 * np.sin(2 * np.pi * 2 * f * tt + 3 * i))
        # raised-cosine envelope: 2.5 s in, 2.5 s out, overlapping the neighbours
        rel = tt - k * L; env = np.ones_like(tt)
        a = rel < 0.0; env[a] = 0.5 - 0.5 * np.cos(np.pi * np.clip((rel[a] + 2.5) / 2.5, 0, 1))
        z = rel > L; env[z] = 0.5 + 0.5 * np.cos(np.pi * np.clip((rel[z] - L) / 2.5, 0, 1))
        out[c0:c1] += x * env
    out *= 1 + 0.08 * np.sin(2 * np.pi * 0.07 * t)          # slow breathing
    return (out / np.max(np.abs(out))).astype(np.float32)

# ---------- ducking envelope from the voice ----------
hop = SR // 100
frames = np.sqrt(np.mean(np.pad(voice, (0, (-N) % hop)).reshape(-1, hop) ** 2, axis=1))
active = frames > db(-42)
g = np.empty(len(frames)); cur = 0.0
for i, a in enumerate(active):                              # fast duck (60 ms), slow release (700 ms)
    tgt = 1.0 if a else 0.0
    cur += (tgt - cur) * (1 - np.exp(-1 / (6 if tgt > cur else 70)))
    g[i] = cur
duck = np.repeat(g, hop)[:N]
vpk = float(np.max(np.abs(voice))) or 1.0
vrms = float(np.sqrt(np.mean(voice[np.repeat(active, hop)[:N]] ** 2)))
bed_gain = vrms * (db(-17) * (1 - duck) + db(-26) * duck)   # relative to the voice's speaking level
bed = np.zeros(N, dtype=np.float32)
if "--no-music" not in sys.argv:
    p = pad(N); p_rms = float(np.sqrt(np.mean(p ** 2)))
    bed = (p / p_rms * bed_gain).astype(np.float32)
    fi, fo = int(1.5 * SR), int(4.0 * SR)                    # fade in at the top, out over the last 4 s
    bed[:fi] *= np.linspace(0, 1, fi); bed[-fo:] *= np.linspace(1, 0, fo)

# ---------- sound cues ----------
def tone(freqs, dur, decay, amps=None, attack=0.004):
    t = np.arange(int(dur * SR)) / SR
    amps = amps or [1.0] * len(freqs)
    x = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t / (decay / (1 + 0.6 * i))) for i, (f, a) in enumerate(zip(freqs, amps)))
    x *= np.minimum(1, t / attack)
    return (x / np.max(np.abs(x))).astype(np.float32)
marimba = lambda m, dur=0.6: tone([note(m), note(m) * 3.9, note(m) * 9.2], dur, 0.22, [1, 0.18, 0.05])
bell = lambda m, dur=1.6: tone([note(m), note(m) * 2.76, note(m) * 5.4, note(m) * 2.0], dur, 0.5, [1, 0.35, 0.12, 0.2])
def seq(parts):                                              # [(offset s, signal)] -> one signal
    n = max(int(o * SR) + len(x) for o, x in parts); y = np.zeros(n, dtype=np.float32)
    for o, x in parts: y[int(o * SR):int(o * SR) + len(x)] += x
    return y / np.max(np.abs(y))
tick = tone([1650, 3300], 0.06, 0.012, [1, 0.25])
SOUNDS = {   # kind: (signal, peak in dB relative to the voice peak)
    "tick": (tick, -24),
    "sting": (seq([(0.0, marimba(74)), (0.2, marimba(78)), (0.4, marimba(81)), (0.6, marimba(86))]), -19),
    "ring": (bell(81), -20),
    "go": (seq([(0.0, bell(86, 1.0)), (0.12, bell(93, 1.2))]), -19),
    "fix": (marimba(69, 0.8), -18),
    "stop": (seq([(0.0, marimba(62, 0.7)), (0.16, marimba(57, 0.9))]), -18),
}
fx = np.zeros(N + SR * 3, dtype=np.float32)
for e in events:
    sig, lvl = SOUNDS[e["kind"]]; i = int(e["t"] * SR)
    if 0 <= i < N: fx[i:i + len(sig)] += sig * vpk * db(lvl)
fx = fx[:N]

mix = voice + bed + fx
mix *= db(-1) / float(np.max(np.abs(mix)))
sf.write(B / "mix.wav", mix, SR, subtype="PCM_16")
sp = np.repeat(active, hop)[:N]
r = lambda x, m: 20 * np.log10(float(np.sqrt(np.mean(x[m] ** 2))) + 1e-12)
print("mix.wav %.1f s | %d cues | voice-to-bed while speaking %.1f dB, in pauses: bed %.1f dB under speaking level"
      % (T, len(events), r(voice, sp) - r(bed, sp), r(voice, sp) - r(bed, ~sp)) if "--no-music" not in sys.argv else "mix.wav (no music)")
