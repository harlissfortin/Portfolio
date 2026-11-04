"""Convert the approved script JSON (scenes -> cues) into source/narration.json (synth input)
and storyboard.md (human-readable scene plan). Usage: python from_script.py script.json"""
import json, sys, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
sc = json.loads(pathlib.Path(sys.argv[1]).read_text())
pace = json.loads((ROOT / "source/pacing.json").read_text())
out = {"fps": 30, "scenes": []}
md = [f"# {sc['title']} — storyboard", "",
      "Scene plan and narration. Cue ids match `captions.vtt`, `source/timing.json` and the `data-in` references in `source/video.html`.", ""]
words = 0
for i, s in enumerate(sc["scenes"], 1):
    scene = {"id": s["id"], "chapter": s["chapter"], "cues": []}
    scene.update(pace["scenes"].get(s["id"], {}))
    md += [f"## {i}. {s['id']}" + (f" — {s['chapter']}" if s['chapter'] else ""), "", f"**Purpose.** {s['purpose']}", "", f"**Visual.** {s['visual']}", "", "| Cue | Narration | On screen |", "|---|---|---|"]
    for c in s["cues"]:
        assert len(c["text"]) <= 95, (c["id"], len(c["text"]), c["text"])
        cue = {"id": c["id"], "text": c["text"]}
        if c.get("tts"): cue["tts"] = c["tts"]
        cue.update(pace["cues"].get(c["id"], {}))
        scene["cues"].append(cue); words += len(c["text"].split())
        md.append(f"| `{c['id']}` | {c['text']} | {c.get('on_screen','') or ''} |")
    md.append(""); out["scenes"].append(scene)
(ROOT / "source/narration.json").write_text(json.dumps(out, indent=1, ensure_ascii=False))
(ROOT / "storyboard.md").write_text("\n".join(md))
print(len(out["scenes"]), "scenes,", sum(len(s["cues"]) for s in out["scenes"]), "cues,", words, "words")
