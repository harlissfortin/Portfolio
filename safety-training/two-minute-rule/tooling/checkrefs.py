"""List every cue/word time reference in the scene code that no longer resolves against source/script.json.
Run after editing the script: python tooling/checkrefs.py (prints 0 bad refs when clean; comment lines may show)."""
import json, re, pathlib
P = pathlib.Path(__file__).resolve().parent.parent
S = json.loads((P / "source/script.json").read_text())
cues = {c["id"]: c["text"].lower() for s in S["scenes"] for c in s["cues"]}
bad = []
for f in ["source/scenes-a.js", "source/scenes-b.js", "source/scenes-c.js"]:
    for i, line in enumerate((P / f).read_text().splitlines(), 1):
        for mo in re.finditer(r"\b(s\d+-\d+)(~([A-Za-z'’]+))?", line):
            cid, word = mo.group(1), (mo.group(3) or "").rstrip("'’") or None
            if cid not in cues: bad.append((f, i, mo.group(0), "no such cue")); continue
            if word and not re.search(r"\b" + word.lower().replace("’", "'").replace("'", "['’]") + r"\b", cues[cid].replace("’", "'")):
                bad.append((f, i, mo.group(0), "word not in: " + cues[cid][:70]))
for b in bad: print(*b, sep=" | ")
print(len(bad), "bad refs")
