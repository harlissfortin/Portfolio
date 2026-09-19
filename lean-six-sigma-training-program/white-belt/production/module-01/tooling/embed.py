"""Embed synthesized narration + measured cue times into the built module.
Replaces the `const CUES={...};` and `const AUDIO={...};` blocks in place; touches nothing else."""
import json, base64, pathlib, re
ROOT = pathlib.Path("/home/user/Portfolio/lean-six-sigma-training-program/white-belt/production/module-01")
m = json.loads((ROOT/"audio/manifest.json").read_text())
html = (ROOT/"index.html").read_text()
order = sorted(m["screens"], key=lambda s:int(s[1:]))
cues = "const CUES={\n" + ",\n".join(
    f"{s}:[" + ",\n".join(json.dumps([c["id"],c["start"],c["end"],c["text"]], ensure_ascii=False) for c in m["screens"][s]["cues"]) + "]"
    for s in order) + "\n};"
aud = "const AUDIO={\n" + ",\n".join(
    f'{s}:"data:audio/mpeg;base64,{base64.b64encode((ROOT/m["screens"][s]["mp3"]).read_bytes()).decode()}"'
    for s in order) + "\n};"
html, n1 = re.subn(r"const CUES=\{.*?\n\};", lambda _: cues, html, count=1, flags=re.S)
html, n2 = re.subn(r"const AUDIO=\{.*?\n\};", lambda _: aud, html, count=1, flags=re.S)
assert n1==1 and n2==1, (n1,n2)
(ROOT/"index.html").write_text(html)
print("embedded: %.2f MB html, %d screens, %d cues"%(len(html.encode())/1e6, len(order), sum(len(m["screens"][s]["cues"]) for s in order)))
