# The 90-Day Sustainment Check and the `sustained` Flag

*Ninety days after the control plan is handed to its owner, the reviewer asks the sponsor one
thing: did it hold? The answer feeds the published outcomes page and sets the badge's
`sustained` flag. It never changes the credential. This page is the whole procedure, for the
reviewer who sends it, the sponsor who answers it and the Green Belt whose badge carries the
result.*

Rubric reference: item ★ C1 requires monitoring live for at least 30 days at submission and
60 days of monitoring evidence for the flag at day 90 — [`review-rubric.md`](review-rubric.md).

---

## 1. Why the program asks

A control plan that is signed and a control plan that is running are different things, and
only the second one is an improvement. Every other certification stops at the signature. This
program asks the question, publishes the answer in aggregate, and puts the individual answer
on the badge, because a sustainment rate the market can see is the difference between a
credential that claims impact and one that shows it.

The check measures the organization's outcome after handover. It is not a second review of
the Green Belt, which is why the result cannot revoke anything (§6).

## 2. When: day 0 and day 90

| Event | Day |
|---|---|
| **Handover** — the process owner signs the control plan and monitoring goes live (the date in Part A3 of the sponsor attestation) | **0** |
| Earliest submission for independent review (★ C1: 30 days live) | 30 |
| **Check sent** to the sponsor by the reviewer | **90** |
| First reminder | 97 |
| Second reminder, copied to the process owner | 104 |
| Check closes; flag set from whatever was received | 120 |

Day 0 is the handover date, not the certification date. Independent review, a possible
resubmission and the exam can put certification before or after day 90; the flag reads
`pending` on a badge issued before the check resolves and updates when it does. The Green
Belt is told the check has been sent and sees the sponsor's answer.

## 3. Who sends, who answers

- **Sender:** the reviewer of record — the independent Black Belt or Master Black Belt who
  scored the project. Not the instructor, not the coach, not an account manager. The sponsor
  met this person at the tollgates and knows they have no stake in a warm answer.
- **Recipient:** the sponsor, with the process owner copied. If the sponsor has left the
  organization, the process owner answers and names the sponsor's successor; if both have
  left, the check is sent to the successor and closes as `unverified` if unanswered.
- **The Green Belt** does not fill in or relay the check. They may remind the sponsor that it
  is coming; they may not draft the answer.

## 4. The check — five questions, ten minutes

The reviewer sends the message below, with the five questions as a form the sponsor can
answer by reply. Nothing else is attached; the sponsor already has the one-page summary and
the control plan.

> Subject: 90-day check — [project title]
>
> Ninety days ago, [process owner] took over the control plan for [project title], which
> [Green Belt] led and which I reviewed for the program. Five questions, ten minutes, any
> answer is the right answer as long as it is the true one. What you tell me sets one field on
> the credential and one number on the program's published outcomes; neither can harm the
> Green Belt's certification, which is already decided. Please reply by [day 100].

| # | Question | Answer |
|---|---|---|
| 1 | Is the control plan being run as written — the metric monitored by the method and at the frequency in the plan, by the named owner or a named replacement? | ☐ yes ☐ partly (say what changed) ☐ no |
| 2 | Attach or paste the monitoring record since handover — the chart, or the numbers by period. How many of the 90 days does it cover? | ____ days |
| 3 | Over the most recent 60 days of monitoring, has the primary metric stayed at the post-change level? *(At the post-change level means within the control limits recalculated after the change, with no run back toward the baseline. Your process owner can read this from the chart; if not, send the numbers and the reviewer will.)* | ☐ yes ☐ drifted, response plan acted and it recovered ☐ drifted, no response ☐ back at baseline |
| 4 | Has the response plan been triggered since handover? If so, what happened? | |
| 5 | Has anything changed that makes the control plan no longer apply — the process retired or redesigned, the countermeasure removed, a system replaced? | ☐ no ☐ yes (say what) |

An optional sixth line: *anything the Green Belt or the program should know.*

## 5. Setting the `sustained` flag

The reviewer sets the flag from the answers and the monitoring record, and records the reason
in one sentence. The table below is the program's definition of the value set: the badge
metadata in [`bok-crosswalk-and-credential.md`](../bok-crosswalk-and-credential.md) §2.3a and
the [evaluation plan](../evaluation/evaluation-plan.md) reference it rather than restate it,
and no other page adds a value or a condition. The rules:

| Flag value | Set when |
|---|---|
| **`true`** | Q1 *yes* or *partly with a named replacement owner*; Q2 monitoring covers ≥ 60 of the 90 days; Q3 *yes*, or *drifted, response plan acted and it recovered* — the response plan working is control working |
| **`false`** | Any of: Q1 *no*; Q3 *drifted, no response* or *back at baseline*; the countermeasure removed (Q5) with the metric back at baseline |
| **`unverified`** | No answer by day 120 after two reminders; or an answer with no monitoring record and no numbers (Q2 blank) — the reviewer records *reported held, no record* or *reported not held, no record* alongside |
| **`not-applicable`** | The process was retired or redesigned for reasons unrelated to the project (Q5) before 60 days of monitoring; or the project is Practicum track |
| **`pending`** | Before the check resolves |

Two edge rules. **Monitoring of 30–59 days with the metric held** is `unverified` with the note
*held on 45 days of record* — the 60-day requirement is the rubric's and is published; the
reviewer does not round up. **A metric that improved further** is `true`; the question is
whether the gain held, not whether the chart is identical.

The reviewer reads the chart, not the sponsor's adjective. "It's going great" with a chart
showing eight points climbing back toward baseline is `false`, kindly worded. Software is not
the point here, but for a reviewer checking the record: recalculate the limits from the
post-change data (Minitab: stages on the I-MR or p chart; Excel: limits from the post-change
subgroup; R/Python: the same by hand) and apply the rules you taught in week 4.

## 6. What happens when it did not hold

**No revocation. Nothing about the credential changes.** The credential attests what the
Green Belt did through handover, against the rubric, verified by the sponsor at the time.
Revocation exists for integrity findings only (terms of certification §4:
[`terms-of-certification.md`](../../program-operations/terms-of-certification.md)). A control
plan that stopped running is not one of those.

What does happen:

1. **The badge shows `sustained: false`** with the sentence the verification page carries for
   every value of this flag: *"Whether a control plan holds after handover is the
   organization's outcome; the program reports it because most programs do not."* The
   learner cannot withdraw the flag — it is credential metadata, not evidence — and the
   program does not soften it. It can be updated: a sponsor who later reports the plan
   restarted and held for 60 days can ask the reviewer to re-run the check once, at any time
   in the following year.
2. **The finding feeds the outcomes page.** The Green Belt sustainment rate is published per
   period with n: projects `true` ÷ projects checked, with `unverified` and `not-applicable`
   shown as their own counts, never folded into the denominator silently
   ([outcomes page](../../program-operations/outcomes-page.md)). The reason category is
   recorded for the evaluation plan: owner left without replacement · monitoring stopped ·
   countermeasure removed · metric drifted with no response · process changed. A rising
   share of any one reason is a week 8 curriculum question, not a learner question, and goes
   on the improvement board.
3. **A coaching note goes to the Green Belt**, from their coach, not from the reviewer. It is
   an offer of a thirty-minute conversation with three questions: what in the control plan
   assumed something that turned out not to hold; what would you write differently at C1 next
   time; what would you tell the sponsor now. The note is not scored, not stored on the
   credential, and is the Green Belt's to keep. A candidate later applying for Black Belt
   may cite it as practice evidence — it is exactly the kind of reflection that level asks for.
4. **The sponsor and process owner are offered** a thirty-minute conversation with the cohort
   instructor on restarting the plan. No fee, no obligation, not a condition of anything, and
   not a sales call.
5. **Corporate accounts** see their sustainment results in aggregate in the quarterly review.
   An individual project's result is never reported to an account as a performance matter
   about the Green Belt or the process owner; the rollout agreement's prohibition on
   performance-management use applies.

## 7. When the answer is not about sustainment

Occasionally a day-90 answer says something else: the numbers were never what the package
showed, or the baseline was written after the change. That is not a sustainment finding. The
reviewer records the answer, sets the flag `unverified`, and sends the matter to the
assessment lead, who puts it to the candidate in writing with the evidence and the 14-day
response window that the terms of certification require. The sustainment check does not
decide integrity questions and the reviewer does not investigate them.

## 8. The record the reviewer keeps

One row per project: project reference · handover date · send date · response date · Q1–Q5
answers · monitoring days · flag value · one-sentence reason · reason category where `false`
· whether the coaching note was sent. Retained with the project record for the audit
re-review (10% of certified projects annually), and the source of the published rate.

## 9. What this check is not

- Not a resubmission, and not a second score.
- Not a survey of the sponsor's satisfaction.
- Not a way to collect the organization's data; the monitoring record is the metric by period,
  nothing more, and is deleted after the flag is set and the aggregate recorded.
- Not optional for the program. The check is sent for every certified project, including
  the ones whose sponsor is likely to say no.

---
*v1.0 · 2026-09-20*
