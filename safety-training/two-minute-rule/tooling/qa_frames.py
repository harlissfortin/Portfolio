"""Extract frames from the encoded MP4 (not the HTML) at the end of every caption line and mid-silence beats,
and tile them into labelled contact sheets for review: build/qa/sheet-NN.png (6 frames each)."""
import json, pathlib, subprocess, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
QA = ROOT / "build/qa"; QA.mkdir(parents=True, exist_ok=True)
for f in QA.glob("*.png"): f.unlink()
t = json.loads((ROOT / "source/timing.json").read_text())
points = [(c["id"], max(0, c["end"] - 0.15)) for c in t["cues"]]
points += [("memorial", [c for c in t["cues"] if c["id"] == "s6-7"][0]["end"] + 2.0), ("sources", t["duration"] - 4.5)]
points.sort(key=lambda p: p[1])
frames = []
for name, ts in points:
    out = QA / f"{ts:07.2f}-{name}.png"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{ts:.3f}", "-i", str(ROOT / "two-minute-rule.mp4"), "-frames:v", "1", str(out)], check=True)
    frames.append((out, f"{name}  t={ts:.1f}"))
for i in range(0, len(frames), 6):
    args = []
    for f, l in frames[i:i + 6]: args += ["-label", l, str(f)]
    sheet = QA / f"sheet-{i // 6 + 1:02d}.png"
    subprocess.run(["montage", *args, "-tile", "2x3", "-geometry", "940x529+6+6", "-pointsize", "22", "-background", "#888", str(sheet)], check=True)
    print(sheet)
