# White Belt — Body-of-Knowledge Crosswalk & Credential Specification

Two things employers and procurement reviewers ask about an awareness credential:
*what does it actually cover*, and *can it be verified*. This document answers both, and is
published (not internal) — transparency is the differentiation strategy.

---

## Part 1 — Body-of-knowledge crosswalk

### 1.1 What this level claims, and what it does not

White Belt is an **awareness credential**. It is not aligned to a practitioner body of
knowledge and the program never markets it as one. The claim is narrower and honest:
coverage of the White Belt / awareness tier as commonly defined across the recognized
bodies, plus one applied artifact that awareness credentials normally lack.

Badge metadata states this in a machine-readable field (§2.3) so the claim travels with
the credential and cannot be inflated by a résumé.

### 1.2 Coverage map

Awareness-tier topics as commonly enumerated (ASQ's Six Sigma White/Yellow entry material,
the IASSC Yellow Belt BoK's foundational sections, and the Council for Six Sigma
Certification's White Belt outline), mapped to this course.

| Awareness-tier topic | Covered in | Depth |
|---|---|---|
| Purpose of process improvement; quality as a business issue | M1, M3 | Awareness |
| Lean origins (TPS) and core aim: waste elimination, flow | M3, M4 | Awareness |
| Six Sigma origins (Motorola/GE) and core aim: variation reduction | M3 | Awareness |
| Variation as the customer's experience; common vs. special cause (conceptual) | M3 | Concept only — *rules and charts are Yellow Belt* |
| The role of data in improvement | M3, M9 | Awareness |
| Process definition; SIPOC elements; internal customers | M2 | Awareness |
| Voice of the customer (concept: quality defined by the receiver) | M2 | Concept only — *VOC/CTQ terminology is Yellow Belt* |
| Value-added vs. non-value-added; necessary NVA | M4 | Applied (classification exercise) |
| The 8 wastes (DOWNTIME), all eight | M5, M6, M7 | Applied (identification in scenes and in own work) |
| 5S — the five S's, purpose, digital application | M8 | Awareness |
| Visual management (concept) | M8 | Concept only — *design levels are Yellow Belt* |
| DMAIC phases and the question each answers | M9 | Awareness |
| Kaizen / continuous improvement as a culture | M1, M11 | Awareness |
| System vs. individual attribution; process-vs-people diagnosis | M1, M10 | Applied (judgment scenarios) |
| Belt roles and team structure | M11 | Awareness |
| The individual's contribution to a CI culture | M11, M12 | Applied (field exercise) |

### 1.3 Explicit exclusions

Deliberately **out of scope** at White Belt, with the level that owns each. Published so no
buyer infers coverage we do not provide:

| Not covered here | Owned by |
|---|---|
| Process mapping / swimlanes / VSM construction | Yellow (map), Green (VSM) |
| Operational definitions, check sheets, data collection design | Yellow |
| Pareto, run charts, run-chart signal rules | Yellow |
| Descriptive statistics; histograms; reading control charts; Cpk; MSA awareness | Yellow (reading depth), Green (computation) |
| Problem statements, 5 Whys, fishbone | Yellow |
| PDCA execution, kaizen participation | Yellow |
| Project leadership, hypothesis testing, capability studies, FMEA, control plans | Green |
| DOE, advanced statistics, change leadership | Black |

### 1.4 Exit-competence statement (what a holder can do)

> A White Belt holder can explain why process design — not individual effort — drives most
> recurring workplace problems; identify and correctly name the eight wastes in a process
> they work in; distinguish value-added from non-value-added activity; state the five DMAIC
> phases and the question each answers; describe 5S and its purpose; apply three diagnostic
> questions to distinguish a process-designed error from a person-specific one; and produce
> a fair, specific, blame-free waste observation with its impact named. They are not
> qualified to map, measure, analyze, or lead improvement work.

This statement is the badge description and the text a hiring manager sees on verification.

---

## Part 2 — Credential specification

### 2.1 Award criteria (all required)
1. All 12 modules completed (LMS completion, per the tracking spec).
2. Knowledge check passed at the current cut score.
3. Field exercise submitted and past the completeness gate — and, where sampled or
   corporately reviewed, scoring ≥ 5/8 with no dimension at 0.

### 2.2 What the credential is called
**"Lean Six Sigma White Belt (Awareness)"** — the parenthetical is part of the name, in every
surface: badge, PDF, verification page, LMS record. It costs nothing in market terms and it
is the single cheapest credibility signal the program owns, because it proves the program
distinguishes its own tiers honestly.

### 2.3 Badge metadata (Open Badges 3.0 / Credly-compatible)

| Field | Value |
|---|---|
| `name` | Lean Six Sigma White Belt (Awareness) |
| `description` | The exit-competence statement (§1.4), verbatim |
| `criteria` | URL to this document's Part 2 |
| `alignment` | Awareness tier; links to the §1.2 coverage map and §1.3 exclusions |
| `skills` | waste identification; value analysis; DMAIC awareness; 5S awareness; process-vs-person diagnosis |
| `learningHours` | 3.5 (structured), excluding field exercise time |
| `assessmentType` | Knowledge check (proctoring: none) **+ applied artifact (rubric-reviewed, sampled)** |
| `reviewStatus` | `human-reviewed` \| `completeness-checked` — set per learner from the actual path their submission took |
| `expires` | None (awareness credential, evergreen) |
| `issuer` | Program issuer profile with accreditation identifiers once granted |

`assessmentType` and `reviewStatus` are the two fields that separate this badge from a
click-through certificate, and the reason the metadata is worth designing at all: they are
honest at the level of the individual learner, not the marketing page.

### 2.4 Verification
- Every badge carries a public verification URL resolving to: holder name, credential name,
  issue date, criteria met, `reviewStatus`, and the exit-competence statement.
- Verification pages are permanent and remain resolvable if a learner's account closes.
- **Revocation:** established academic dishonesty (proxy completion, fabricated field
  exercise) revokes the badge; the verification URL then resolves to "revoked" with a date
  and no other detail. Appeals follow the program terms of certification.

### 2.5 What the learner receives
A digital badge; a one-page PDF certificate carrying the same name and a verification QR
code; a completion record in their LMS transcript; the 8-wastes pocket card; and their
scored field-exercise feedback where a human reviewed it.

### 2.6 CEUs
White Belt does **not** carry IACET CEUs. At 3.5 structured hours with an unproctored
assessment it does not meet the criteria the program is pursuing for Yellow and above, and
claiming otherwise would put the whole accreditation application at risk. This is stated
plainly in the course description rather than left ambiguous.
