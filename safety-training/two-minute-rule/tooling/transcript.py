"""Write transcript.md from source/timing.json (measured cue times) and source/script.json (on-screen text), so the
transcript always matches the video. Each line gives the narration and, in italics, what is on screen, so the transcript
also works as a text description for people who can't see the picture."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
t = json.loads((ROOT / "source/timing.json").read_text())
script = json.loads((ROOT / "source/script.json").read_text())
onscreen = {c["id"]: c.get("on_screen", "") for s in script["scenes"] for c in s["cues"]}
cue = {c["id"]: c for c in t["cues"]}
def mmss(s): return "%d:%02d" % (int(s // 60), int(s % 60))
out = ["# The 2-Minute Rule: One Shift on a Patch Line — transcript", "",
       f"Runtime {mmss(t['duration'])}. Narration is a synthesized voice (Kokoro, `{t['voice']}`, speed {t['speed']}). "
       "Times are when each line starts in `two-minute-rule.mp4`; the same lines are in `captions.vtt`. "
       "Italic text describes what is on screen. In each save, the video pauses twice and asks you to answer first: "
       "the cards read “What would make you stop here?” and “Your call?”.", ""]
for sc in t["scenes"]:
    out += [f"## {mmss(sc['start'])} · {sc['chapter'] or 'Intro'}", ""]
    for c in t["cues"]:
        if c["scene"] == sc["id"]:
            os_ = onscreen.get(c["id"], "")
            out.append(f"**{mmss(c['start'])}** {c['text']}" + (f" — *{os_}*" if os_ else "") + "  ")
    out.append("")
last = [c for c in t["cues"] if c["scene"] == "close-recap"]
slate, end = last[-2]["start"] - 0.5, last[-1]["start"] - 0.6
out += ["## The last screens", "",
        f"**Your site slate** ({mmss(slate)}), spoken: *“{last[-2]['text']}”* On screen: *Who do you call for help?* "
        "Your lead: days ____ · nights ____ · weekends ____ · Radio or phone: ____ · No answer? Call: ____ · "
        "Report what I caught to: ____ · Write it on your pocket card.", "",
        f"**End card** ({mmss(end)}), under the last spoken line: *Follow your site's procedures, permits and lockout. "
        "This video is awareness training, not lockout, solvent-bonding, forklift-operator or potent-compound handling training.*", "",
        "Sources: 21 CFR 211.130(e) (line clearance); OSHA 29 CFR 1910.147 (lockout/tagout), including (e)(3) on removing another person's lock; OSHA 29 CFR 1910.106(e)(6)(ii) and NFPA 77 (bonding before dispensing flammable liquids); OSHA 29 CFR 1910.178(l) (powered industrial truck operator training) and (m)(2) (no one under raised forks); NIOSH skin-exposure guidance (wash skin with soap and water).", "",
        "*Use cases are illustrative composites, not real incidents. Narration is a synthesized voice.*", ""]
(ROOT / "transcript.md").write_text("\n".join(out))
print("transcript.md:", len(t["cues"]), "lines")
