"""Write transcript.md from source/timing.json (measured cue times) so the transcript always matches the video."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
t = json.loads((ROOT / "source/timing.json").read_text())
def mmss(s): return "%d:%02d" % (int(s // 60), int(s % 60))
out = ["# The 2-Minute Rule — transcript", "",
       f"Runtime {mmss(t['duration'])}. Narration is a synthesized voice (Kokoro, `{t['voice']}`, speed {t['speed']}). "
       "Times are when each line starts in `two-minute-rule.mp4`; the same lines are in `captions.vtt`.", ""]
for sc in t["scenes"]:
    out += [f"## {mmss(sc['start'])} · {sc['chapter'] or ('Title' if sc['id'].startswith('cold') else 'Close')}", ""]
    for c in t["cues"]:
        if c["scene"] == sc["id"]:
            out.append(f"**{mmss(c['start'])}** {c['text']}  ")
            if c["id"] == "s6-7": out.append("*On screen, held in three seconds of silence: “The technician died.”*  ")
            if c["id"] == "s6-8": out.append("*On screen: “Not careless people. Gaps in the system.”*  ")
    out.append("")
out += ["## Sources shown at the end", "",
        "1. Cal/OSHA citations announced July 2011, as reported by Fierce Pharma and CBS Los Angeles",
        "2. OSHA accident summary 202542296 (event date January 21, 2011)",
        "3. U.S. Chemical Safety Board, Safety Bulletin 2003-10-B, *Hazards of Nitrogen Asphyxiation*",
        "4. 21 CFR 211.130(e) (line clearance) · 29 CFR 1910.146 (permit-required confined spaces)",
        "5. NIOSH Publication 94-103, *Worker Deaths in Confined Spaces* (1994)",
        "6. IOGP Report 459-1, *Start Work Checks*; IOGP *Process Safety Fundamentals*",
        "7. SLAM (Stop, Look, Assess, Manage), Leadership and Worker Involvement Toolkit hosted by UK HSE",
        "8. Havinga, Shire & Rae (2022), “Should We Cut the Cards?”, *Safety* 8(2):27", ""]
(ROOT / "transcript.md").write_text("\n".join(out))
print("transcript.md:", len(t["cues"]), "lines")
