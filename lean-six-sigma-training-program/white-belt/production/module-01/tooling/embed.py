"""Embed synthesized narration + measured cue times into the built module."""
import json, base64, pathlib, re
ROOT = pathlib.Path("/home/user/Portfolio/lean-six-sigma-training-program/white-belt/production/module-01")
m = json.loads((ROOT/"audio/manifest.json").read_text())
html = (ROOT/"index.html").read_text()

# 1. CUES with measured times
lines=["const CUES={"]
for scr in sorted(m["screens"], key=lambda s:int(s[1:])):
    arr=",\n".join(json.dumps([c["id"],c["start"],c["end"],c["text"]], ensure_ascii=False) for c in m["screens"][scr]["cues"])
    lines.append(f"{scr}:[{arr}],")
lines[-1]=lines[-1].rstrip(",")
lines.append("};")
new_cues="\n".join(lines)
i=html.index("const CUES={"); j=html.index("\n/* ---- vertical-specific content", i)
html=html[:i]+new_cues+html[j:]

# 2. AUDIO data URIs
aud=["const AUDIO={"]
for scr in sorted(m["screens"], key=lambda s:int(s[1:])):
    b=(ROOT/m["screens"][scr]["mp3"]).read_bytes()
    aud.append(f'{scr}:"data:audio/mpeg;base64,{base64.b64encode(b).decode()}",')
aud[-1]=aud[-1].rstrip(","); aud.append("};")
html=html.replace("\n/* ---- vertical-specific content", "\n"+"\n".join(aud)+"\n\n/* ---- vertical-specific content",1)

# 3. player: data URIs, preload, auto-continue, time readout
old="""const audio=new Audio();
let audioOK=false, tick=null;
audio.preload="none";
function loadAudio(){
  audio.src="audio/wb-m01-"+S[state.i].id+".mp3";
  audioOK=false;
  audio.load();
}
audio.addEventListener("canplay",()=>{audioOK=true;renderPlayer()});"""
new="""const audio=new Audio();
let audioOK=false;
let autoNarrate=store.get("autoNarrate",false);   /* keeps narrating across screens once the learner presses play */
audio.preload="auto";
function loadAudio(){
  audioOK=false;
  audio.src=AUDIO[S[state.i].id]||("audio/wb-m01-"+S[state.i].id+".mp3");
  audio.load();
}
const mmss=t=>{t=Math.max(0,Math.floor(t||0));return Math.floor(t/60)+":"+String(t%60).padStart(2,"0")};
function pTime(){
  const el=document.getElementById("ptime"); if(!el||!audioOK) return;
  el.textContent=mmss(audio.currentTime)+" / "+mmss(audio.duration);
}
audio.addEventListener("canplay",()=>{
  if(audioOK) return;
  audioOK=true; renderPlayer(); pTime();
  if(autoNarrate && audio.paused) audio.play().then(renderPlayer).catch(()=>{autoNarrate=false;store.set("autoNarrate",false);renderPlayer()});
});
audio.addEventListener("loadedmetadata",pTime);
audio.addEventListener("play",renderPlayer);"""
assert old in html; html=html.replace(old,new)

old2="""audio.addEventListener("timeupdate",()=>{
  /* only mark a cue current while narration is genuinely playing */
  if(!audioOK||audio.paused) return;
  highlight(audio.currentTime);
});"""
new2="""audio.addEventListener("timeupdate",()=>{
  /* only mark a cue current while narration is genuinely playing */
  if(!audioOK||audio.paused) return;
  highlight(audio.currentTime); pTime();
  const on=document.querySelector("#caps p.cue.on");
  if(on) on.scrollIntoView({block:"nearest",behavior:reduceMotion?"auto":"smooth"});
});"""
assert old2 in html; html=html.replace(old2,new2)

old3="""    st.innerHTML="<b>Narration</b> &middot; captions follow along below.";
  }else{
    b.disabled=true; b.innerHTML="&#9654;"; b.setAttribute("aria-label","Play narration (audio not yet available)");
    st.innerHTML="<b>Narration audio: pending recording.</b> The full script is below and in the transcript — nothing in this module depends on hearing it.";
  }"""
new3="""    st.innerHTML="<b>Narration</b> &middot; <span id=\\"ptime\\">0:00 / 0:00</span> &middot; captions follow along below.";
    pTime();
  }else{
    b.disabled=true; b.innerHTML="&#9654;"; b.setAttribute("aria-label","Play narration (loading)");
    st.innerHTML="<b>Narration</b> &middot; loading&hellip; The full script is below and in the transcript.";
  }"""
assert old3 in html, "renderPlayer block"; html=html.replace(old3,new3)

old4="""document.getElementById("play").addEventListener("click",()=>{
  if(!audioOK) return;
  audio.paused?audio.play():audio.pause();
  renderPlayer();
});"""
new4="""document.getElementById("play").addEventListener("click",()=>{
  if(!audioOK) return;
  if(audio.paused){ autoNarrate=true; audio.play().catch(()=>{}); emit("experienced","narration-play"); }
  else { autoNarrate=false; audio.pause(); }
  store.set("autoNarrate",autoNarrate);
  renderPlayer();
});"""
assert old4 in html; html=html.replace(old4,new4)

old5="""    "Production build of Module 1 of 12, White Belt. Narration audio is pending recording; "+
    "captions, transcript and every interaction are complete and this module is fully usable "+
    "without audio. Progress and your reflection are saved on this device only — nothing you "+
    "write here is transmitted.";"""
new5="""    "Production build of Module 1 of 12, White Belt. Narration is a synthesized neural voice "+
    "(Kokoro, \\u201c"+"%s"+"\\u201d); captions are timed from it, and everything here works with the "+
    "sound off. Progress and your reflection are saved on this device only — nothing you "+
    "write here is transmitted.";""" % m["voice"]
assert old5 in html, "buildnote"; html=html.replace(old5,new5)

# 4. reduceMotion is declared later in the file than the timeupdate handler uses it (hoisting: const is
#    in TDZ only until evaluated; handler runs after load, so fine). Nothing to change.
(ROOT/"index.html").write_text(html)
print("embedded: %.2f MB html"%(len(html.encode())/1e6))
