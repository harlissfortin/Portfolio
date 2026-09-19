# Module 1 narration tooling

Two scripts produce and embed the narration. Run from a scratch directory containing the
Kokoro ONNX model files (`kokoro/kokoro-v1.0.onnx`, `kokoro/voices-v1.0.bin`, from the
`thewh1teagle/kokoro-onnx` GitHub release `model-files-v1.0`); dependencies
`pip install kokoro-onnx soundfile lameenc`.

| Script | Does |
|---|---|
| `synth.py [voice] [speed]` | Reads cue text from `../narration.vtt`, synthesizes **each cue separately**, joins them with authored pauses, measures true cue times, writes `../audio/wb-m01-s{n}.mp3` + per-screen `.vtt`, a re-timed combined `../narration.vtt`, and `../audio/manifest.json`. Default `af_heart 0.82` (≈165 wpm speech-only, ≈150 overall) |
| `embed.py` | Injects the MP3s as data URIs and the measured cue times into `../index.html` (the published artifact cannot fetch external media) |

To replace the synthesized voice with a studio recording: record per screen, time the cues
(forced alignment or by hand) into `manifest.json` in the same shape, and run `embed.py`.
Nothing else changes.
