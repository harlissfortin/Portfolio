"""
Synthesize WB-M01 narration from narration.vtt cue text with Kokoro (ONNX),
measure real cue timings, write per-screen MP3s + VTTs, a re-timed combined VTT,
and a JSON manifest the build step uses to embed audio and cue times.
"""
import re, json, sys, base64, pathlib
import numpy as np, soundfile as sf, lameenc
from kokoro_onnx import Kokoro

ROOT = pathlib.Path("/home/user/Portfolio/lean-six-sigma-training-program/white-belt/production/module-01")
OUT  = ROOT / "audio"; OUT.mkdir(exist_ok=True)
VOICE = sys.argv[1] if len(sys.argv)>1 else "af_heart"
SPEED = float(sys.argv[2]) if len(sys.argv)>2 else 0.82
LANG = "en-us"
SR = 24000
GAP_CUE, GAP_PARA, LEAD, TAIL = 0.42, 0.75, 0.35, 0.6   # seconds

# ---- parse authored VTT: cue id -> text, grouped by screen ----
vtt = (ROOT/"narration.vtt").read_text()
blocks = re.split(r"\n\s*\n", vtt.strip())
cues = {}  # screen -> list of (id, text)
for b in blocks:
    lines = b.strip().split("\n")
    if not re.match(r"^s\d+-\d+$", lines[0]): continue
    cid = lines[0]; text = " ".join(l.strip() for l in lines[2:])
    scr = cid.split("-")[0]
    cues.setdefault(scr, []).append((cid, text))

def tts_text(t):
    t = t.replace("—", ",").replace(" — ", ", ").replace("—", ",")
    t = t.replace("“", '"').replace("”", '"').replace("’", "'")
    t = t.replace("W. Edwards Deming", "W Edwards Deming").replace("Out of the Crisis:", "Out of the Crisis.")
    t = re.sub(r",\s*,", ",", t)
    return t

# Paragraph breaks from the storyboard: a longer pause AFTER these cue ids
PARA_AFTER = {"s1-3","s1-5","s2-1","s2-4","s2-6","s3-2","s3-4","s3-6","s4-1","s4-4","s4-6",
              "s5-1","s5-3","s5-5","s5-7","s5-8","s6-1","s6-3","s6-5","s6-7","s7-1","s7-4","s8-1","s8-3","s8-5","s8-6"}

kok = Kokoro(str(pathlib.Path("kokoro/kokoro-v1.0.onnx")), str(pathlib.Path("kokoro/voices-v1.0.bin")))

def silence(sec): return np.zeros(int(sec*SR), dtype=np.float32)
def fade(x, ms=12):
    n=int(SR*ms/1000); r=np.linspace(0,1,n,dtype=np.float32)
    x[:n]*=r; x[-n:]*=r[::-1]; return x

manifest = {"voice":VOICE,"speed":SPEED,"sample_rate":SR,"screens":{}}
combined_offset = 0.0
combined_vtt = ["WEBVTT","Kind: captions","Language: en","",
  "NOTE","Measured cue times from the synthesized narration (Kokoro, voice %s, speed %.2f)."%(VOICE,SPEED),
  "Times are continuous across screens for reference; the build uses the per-screen files in audio/.",""]

def fmt(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60
    return "%02d:%02d:%06.3f"%(h,m,s)

for scr in sorted(cues, key=lambda s:int(s[1:])):
    parts=[silence(LEAD)]; t=LEAD; timings=[]
    for i,(cid,text) in enumerate(cues[scr]):
        samples, sr = kok.create(tts_text(text), voice=VOICE, speed=SPEED, lang=LANG)
        assert sr==SR
        x = fade(np.asarray(samples, dtype=np.float32).copy())
        # trim leading/trailing silence below -50 dBFS
        thr=10**(-50/20); idx=np.where(np.abs(x)>thr)[0]
        if len(idx): x=x[max(0,idx[0]-int(0.02*SR)):idx[-1]+int(0.05*SR)]
        start=t; parts.append(x); t+=len(x)/SR; end=t
        timings.append({"id":cid,"start":round(start,3),"end":round(end,3),"text":text})
        gap = GAP_PARA if cid in PARA_AFTER else GAP_CUE
        if i < len(cues[scr])-1: parts.append(silence(gap)); t+=gap
    parts.append(silence(TAIL)); t+=TAIL
    audio=np.concatenate(parts)
    peak=float(np.max(np.abs(audio))) or 1.0
    audio = audio*(0.891/peak)            # peak-normalize to -1 dBFS
    # per-screen VTT
    v=["WEBVTT","Kind: captions","Language: en","","NOTE Screen %s of WB-M01 — audio/wb-m01-%s.mp3"%(scr[1:],scr),""]
    for c in timings:
        v += [c["id"], "%s --> %s"%(fmt(c["start"]),fmt(c["end"])), c["text"], ""]
        combined_vtt += [c["id"], "%s --> %s"%(fmt(c["start"]+combined_offset),fmt(c["end"]+combined_offset)), c["text"], ""]
    (OUT/f"wb-m01-{scr}.vtt").write_text("\n".join(v))
    # MP3 via lameenc (mono, 24 kHz, 56 kbps)
    pcm=(np.clip(audio,-1,1)*32767).astype(np.int16).tobytes()
    enc=lameenc.Encoder(); enc.set_bit_rate(56); enc.set_in_sample_rate(SR); enc.set_channels(1); enc.set_quality(2)
    mp3=enc.encode(pcm)+enc.flush()
    (OUT/f"wb-m01-{scr}.mp3").write_bytes(mp3)
    manifest["screens"][scr]={"duration":round(t,3),"mp3":f"audio/wb-m01-{scr}.mp3","bytes":len(mp3),"cues":timings}
    combined_offset += t
    print(f"{scr}: {t:6.1f}s  {len(mp3)/1024:6.0f} KB  {len(timings)} cues")

(ROOT/"narration.vtt").write_text("\n".join(combined_vtt))
(OUT/"manifest.json").write_text(json.dumps(manifest, indent=1))
print("total %.1f s, %.2f MB mp3"%(combined_offset, sum(s["bytes"] for s in manifest["screens"].values())/1e6))
