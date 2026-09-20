# White Belt — Production Spec (Storyboard, Accessibility, LMS Tracking)

The build contract for the self-paced course. An e-learning developer should be able to
produce the course from [`../modules.md`](../modules.md),
[`../vertical-variants.md`](../vertical-variants.md) and this document without asking a
design question.

---

## 1. Screen architecture

Each module is 6–10 screens following the module's own **Hook → Teach → Show → Try →
Takeaways** structure. Screen types and their rules:

| Type | Purpose | Rules |
|---|---|---|
| **Hook** | One question or claim that makes the module matter | One screen. ≤ 40 words on screen. No bullet lists. |
| **Teach** | The content | 2–4 screens. **One idea per screen.** ≤ 60 words on screen; the rest is narration. |
| **Show** | Vertical example | 1–2 screens. Image or footage leads; text supports. |
| **Try** | The interaction | 1 screen (may be multi-step). Feedback is immediate and explains *why*. |
| **Takeaways** | Consolidation | One screen, 2–3 lines, matching `modules.md` verbatim. |
| **Cumulative check** | Spaced retrieval (M4, 6, 8, 10, 12 only) | 2 items from the PRAC pool; feedback with rationale; not scored toward certification. |

**Narration is primary, on-screen text is secondary.** Never narrate the on-screen text
word-for-word (the redundancy effect degrades retention) and never put a paragraph on screen
and narrate something different over it. On-screen text carries the terms and the structure;
narration carries the explanation and the example.

Target seat time per module matches the `modules.md` table (10–20 min). Narration budget:
~140 words/minute, so a 7-minute module is ~950 words of script.

## 2. Interaction specifications

| Module | Interaction | Build notes |
|---|---|---|
| 1 | Reflection (free text) | Saved to the learner's workbook; never scored; echoed back in M12 to show their own thinking has progressed |
| 2 | SIPOC sort, 10 items into 5 columns | **Click-to-assign, not drag-and-drop** (see §3). Feedback per item, with the rationale |
| 3 | 3-item check | Straight MCQ with rationale |
| 4 | Classify 12 activities into VA / NVA / NNVA | Click-to-assign. Two items are deliberately arguable and the feedback says so and explains the discriminator |
| 5 | Spot-the-waste, Segment A | Four click-targets on video (see §2.1) |
| 6 | Spot-the-waste, Segment B | Four click-targets on video |
| 7 | 8 vertical scenarios, name the dominant waste | Distractors target transport/motion and inventory/overproduction confusions |
| 8 | Which S produced this change? (6 before/after pairs) | Photo pairs; click-to-assign |
| 9 | Place 15 activities into DMAIC phases | Click-to-assign; 3 per phase |
| 10 | 6 judgment scenarios | Three options including "can't tell yet — go look," correct for two items |
| 11 | — | No interaction; module is 10 minutes and ends on the role statement |
| 12 | Field exercise form | Completeness gate per the rubric; blame-screen advisory; submission routes per deployment |

### 2.1 Video click-target interaction (Modules 5–6)
- Video plays; a persistent prompt reads "Click the moment you see a waste."
- A click pauses playback, timestamps it, and asks the learner to name the waste from eight
  choices before revealing.
- Correct within ±4 seconds of a scripted target → reveal text from
  `vertical-variants.md`. Wrong category on a correct moment → "Right moment, different
  waste" plus the discriminator.
- All four targets must be found to advance; after two misses on a target the system offers
  a nudge ("watch her hands between 1:20 and 1:30").
- **Keyboard path:** a transcript-based alternative lists the timecoded moments; the learner
  selects a moment and names its waste. Functionally equivalent, not a lesser fallback.

## 3. Accessibility (WCAG 2.2 AA — required, not aspirational)

| Requirement | Implementation |
|---|---|
| **No drag-and-drop** | Every sorting interaction is click-to-assign: select item, then select bucket. This is a pointer-gesture and dexterity issue *and* it is why the prototype already works this way |
| Keyboard operable | Every control reachable and operable by keyboard in a logical order; visible focus indicator with ≥ 3:1 contrast against its background |
| Captions | Open-caption-quality closed captions on all video and narration, human-corrected — never auto-generated only |
| Transcripts | Full text transcript for every module, downloadable, including descriptions of what the footage shows |
| Audio descriptions | Provided for Modules 5–7 footage, where the visual *is* the content |
| Color | Never the sole carrier of meaning. Feedback states "Correct"/"Not quite" in text plus icon plus color. Text contrast ≥ 4.5:1; large text and UI components ≥ 3:1 |
| Motion | Respects `prefers-reduced-motion`; no auto-playing motion longer than 5 s without a pause control; no flashing |
| Timing | No time limits anywhere in the course, including the knowledge check at White Belt |
| Screen readers | Semantic structure with real headings; feedback panels announced via a polite live region; all images have purposeful alt text (decorative images marked as such) |
| Zoom / reflow | Usable at 400% zoom and at 320 CSS px width with no loss of function and no two-dimensional scrolling |
| Language | Plain language; reading level checked at roughly grade 9–10; jargon defined at first use and available in a glossary panel on every screen |

**Testing gate before release:** automated scan (axe or equivalent, zero critical issues),
then manual keyboard-only pass, then screen-reader pass (NVDA + JAWS on Windows, VoiceOver on
macOS/iOS) on one full module of each interaction type. Findings are fixed before launch,
not logged for later — accessibility remediation debt on a course sold to enterprises is a
procurement blocker, not a nice-to-have.

## 4. LMS packaging & tracking

### 4.1 Formats
- **Primary:** xAPI (Tin Can) for the full statement set below.
- **Also shipped:** SCORM 1.2 and 2004 4th edition wrappers for clients whose LMS predates
  xAPI, reporting completion, score, and pass/fail only.
- **Also shipped:** an LTI 1.3 launch for clients on a Canvas/Moodle-style platform.
- Hosted option for clients with no LMS, with SSO (SAML/OIDC) available.

### 4.2 xAPI statements to emit

| Verb | Object | Result / extensions | Why it exists |
|---|---|---|---|
| `attempted` / `completed` | each module | duration | Completion criteria; identifies modules people abandon |
| `answered` | each interaction item | response, success, latency | **Item analysis** — feeds the difficulty and discrimination statistics the assessment policy requires |
| `passed` / `failed` | pre-assessment | raw score | Pre/post learning gain |
| `passed` / `failed` | knowledge check | raw score, scaled score, attempt number, form ID | Cut-score monitoring, exposure control, retake overlap enforcement |
| `submitted` | field exercise | waste categories chosen, review path (`sampled` / `full` / `completeness-only`) | Rubric review routing; the observation gallery; badge `reviewStatus` |
| `earned` | credential | badge ID, verification URL | Credential issuance |
| `experienced` | glossary term, transcript, caption toggle | — | Tells us which accessibility features are actually load-bearing, so they are never "optimized away" |
| `responded` | each go-look dossier entry (M1–M12) | completion flag only; **text never transmitted** | Whether the workplace tasks are being done; the dossier itself stays on the learner's device |
| `experienced` | coach rule codes (`coach/<code>`, `…/cleared`) on the field exercise | — | Which rubric lessons are not landing, per the coach specification §5; no draft text |
| `reported` (custom verb) | andon cord, any screen | free text, screen ID | Feeds the public improvement board; the program's own response cadence is published |

Every statement carries `x/vertical` **and** `x/role` (frontline / supervisor / leader, per
[`../role-variants.md`](../role-variants.md)) as context extensions, so learning gain and
submission quality can be reported by role without ever reporting an individual.

Form ID on every knowledge-check statement is not optional: without it the item-exposure and
retake-overlap rules in the assessment policy cannot be enforced or audited.

### 4.3 Data handling
- Personal data minimized to what the credential and the client's reporting require.
- **Learner-level reporting to a corporate buyer covers completion and credential status
  only.** Individual interaction responses, reflection text, and knowledge-check item-level
  answers are aggregated before they reach the client — and the learner is told this in
  plain language at enrollment. This is an integrity control, not just a privacy one: data
  honesty in Module 3 is worthless if the course itself surveils the learner for their
  manager.
- Field exercise submissions are shared with the client's CI lead **by design and with
  notice** — that is the exercise's purpose — but never framed or exported as individual
  performance data.
- Retention, export, and deletion terms live in the program terms of certification.

## 5. Localization readiness
Narration scripts, on-screen text, and feedback strings are authored as separate string
resources with no text baked into images. Footage is shot without on-screen English signage
where avoidable. First-wave targets: Spanish and French; the vertical variants localize
independently of each other.

## 6. Definition of done (module-level release checklist)
- [ ] Narration recorded, human-corrected captions, full transcript, audio description where required
- [ ] On-screen text ≤ limits; no redundant narration of on-screen text
- [ ] Interaction built to spec with per-item rationale feedback
- [ ] Cumulative check wired (M4, 6, 8, 10, 12) from the PRAC pool
- [ ] xAPI statements emitting and verified in the LRS, including form ID where applicable
- [ ] Accessibility gate passed (automated + keyboard + screen reader)
- [ ] Reviewed against `modules.md` for content fidelity by the assessment lead
- [ ] Vertical variants swapped and spot-checked (MFG / HC / TXN); role variants where the module has them
- [ ] Go-look dossier task on the closing screen, saved locally, `responded` with completion flag only
- [ ] Andon cord present and emitting `reported` with the screen ID
