"""Fill the chapter and prediction-hold times in facilitator-guide.md from source/timing.json, between the
<!-- PAUSE-POINTS --> and <!-- /PAUSE-POINTS --> markers (re-runnable). Usage: python tooling/pause_points.py"""
import json, re, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
t = json.loads((ROOT / "source/timing.json").read_text())
pace = json.loads((ROOT / "source/pacing.json").read_text())["cues"]
f = lambda s: "%d:%02d" % (int(s // 60), int(s % 60))
rows = ["| Chapter | Starts | Hold 1: “What would make you stop here?” | Hold 2: “Your call?” |", "|---|---|---|---|"]
for sc in t["scenes"]:
    if not sc["id"].startswith("save-"): continue
    cs = [c for c in t["cues"] if c["scene"] == sc["id"]]
    # the two prediction holds are the only cues in a save followed by a pause of 2.4 s or more
    h1, h2 = [c for c in cs if pace.get(c["id"], {}).get("after", 0) >= 2.4][:2]
    end = lambda c: c["end"] + pace.get(c["id"], {}).get("after", 0.34)
    rows.append(f"| {sc['chapter']} | {f(sc['start'])} | {f(h1['start'])} (holds to {f(end(h1))}) | {f(h2['start'])} (holds to {f(end(h2))}) |")
other = " · ".join(f"{sc['chapter'] or 'Intro'} {f(sc['start'])}" for sc in t["scenes"] if not sc["id"].startswith("save-"))
block = "\n".join(rows) + f"\n\nOther chapters: {other}. Full video: {f(t['duration'])}.\n\n" \
        "*Times come from `source/timing.json` (`python tooling/pause_points.py` refreshes them).*"
p = ROOT / "facilitator-guide.md"; s = p.read_text()
s, n = re.subn(r"<!-- PAUSE-POINTS -->.*?<!-- /PAUSE-POINTS -->|<!-- PAUSE-POINTS -->",
               lambda m: f"<!-- PAUSE-POINTS -->\n{block}\n<!-- /PAUSE-POINTS -->", s, count=1, flags=re.S)
assert n == 1, "no PAUSE-POINTS marker in facilitator-guide.md"
p.write_text(s); print("facilitator-guide.md: pause points for", len(rows) - 2, "saves")
