"""Write transcript.md from source/timing.json (measured cue times) so the transcript always matches the video."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
t = json.loads((ROOT / "source/timing.json").read_text())
def mmss(s): return "%d:%02d" % (int(s // 60), int(s % 60))
out = ["# The 2-Minute Rule — transcript", "",
       f"Runtime {mmss(t['duration'])}. Narration is a synthesized voice (Kokoro, `{t['voice']}`, speed {t['speed']}). "
       "Times are when each line starts in `two-minute-rule.mp4`; the same lines are in `captions.vtt`.", ""]
for sc in t["scenes"]:
    out += [f"## {mmss(sc['start'])} · {sc['chapter'] or 'Intro'}", ""]
    for c in t["cues"]:
        if c["scene"] == sc["id"]:
            out.append(f"**{mmss(c['start'])}** {c['text']}  ")
    out.append("")
out += ["## On screen at the end (not spoken)", "",
        "**Your site** slate (5:13). *Stop & get help:* Call your area lead. Ask them for the radio channel or extension. · Nights and weekends: call the on-call lead. · Report what you caught through your usual reporting route. · Ask your lead which permits apply in your area. Sites can localize this slate with named contacts (see README).", "",
        "**End card** (5:23), under the last spoken line: *Follow your site's SOPs, lockout and permit procedures. This video is awareness training, not lockout or confined-space training.*", "",
        "Sources: 21 CFR 211.130(e) (line clearance); OSHA 29 CFR 1910.147 (lockout/tagout) and OSHA interpretations on minor servicing; OSHA 29 CFR 1910.212 (machine guarding); OSHA 29 CFR 1910.146 (permit-required confined spaces); U.S. Chemical Safety Board Safety Bulletin 2003-10-B, *Hazards of Nitrogen Asphyxiation*; NFPA 77 and the CCPS Process Safety Beacon, March 2025 (static); isolator glove programs, including EU GMP Annex 1 (2022) for aseptic isolators.", "",
        "*Use cases are illustrative composites, not real incidents. Narration is a synthesized voice.*", ""]
(ROOT / "transcript.md").write_text("\n".join(out))
print("transcript.md:", len(t["cues"]), "lines")
