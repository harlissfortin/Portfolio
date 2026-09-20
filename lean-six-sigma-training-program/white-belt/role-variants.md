# White Belt — Role Variants

The vertical layer ([`vertical-variants.md`](vertical-variants.md)) changes the *footage*:
what the learner sees. The role layer changes the *question*: what the learner is asked to
do with it. A supervisor and a frontline operator watching the same click-target clip
should leave with different next actions, because they have different levers.

Three roles, chosen at enrollment alongside the vertical, switchable at any time:

| Role | Who picks it | What changes |
|---|---|---|
| **Frontline** (default) | Operators, nurses, clerks, technicians, analysts — people who *do* the process | Reflection prompts ask what they see and what they would report; go-look tasks are done at their own station |
| **Supervisor / team lead** | First-line leaders who own a team's daily work | Prompts ask what they would *respond* to and what they would change about how work is assigned; Module 10 and 11 carry supervisor-specific Show examples |
| **Leader** | Managers and above who sponsor rollouts or own budgets | Prompts ask what the *system* they own makes likely, and what they would fund or stop; Modules 1, 5 and 11 carry leader-specific Show examples |

The teaching skeleton, narration, knowledge check and rubric are identical for all three.
**Role never changes what is assessed.** It changes the examples and the reflection prompts,
because those are where transfer happens.

Role is recorded as an xAPI context extension on every statement (`x/role`), so the
evaluation plan can report gain and submission quality by role without ever reporting an
individual.

---

## Per-module role differences

Only modules with a role-specific element are listed; everything else is shared.

### Module 1 — Why Processes Fail People
**S7 reflection prompt hints**
- Frontline: "The way it probably gets discussed today." / "What about the way the work is set up makes it likely?"
- Supervisor: "The way it gets raised with you today — usually as someone's name." / "What about the way you assign, sequence or equip the work makes it likely?"
- Leader: "The way it reaches you — as a performance issue in one team." / "What about the policies, systems or targets you own makes it likely in *every* team?"

**Leader Show example (replaces the vertical card's closing line):** the same story told from
the budget holder's seat — three teams, three replacements, one unchanged handoff. The lever
is the handoff, and only the leader can fund changing it.

**Go look (dossier entry 1)** — shared wording; role hint appended: *frontline: your own
station · supervisor: something you get escalated · leader: something that appears in more
than one team.*

### Module 5 — The 8 Wastes: D-O-W-N
**Non-utilized talent Show example, leader role:** the shim story from the MFG variant (A4)
is retold as a management failure: nobody has asked. The leader's go-look asks: *when did
your organization last ask a frontline person for an improvement idea, and what happened to
it?*

### Module 7 — Waste in Your World
**Reflection by role:** frontline — "which of the eight would you report first?";
supervisor — "which of the eight could your team fix without asking anyone?";
leader — "which of the eight is your organization currently paying people to tolerate?"

### Module 10 — Process vs. People Problems
**Supervisor Show example:** a first-line leader receiving the same error from a third
person, with the three-question test run live. The supervisor variant closes with the
sentence the module wants them to say next time: *"thank you — what made that likely?"*

### Module 11 — The Belt System and Your Role in CI Culture
Role is the whole module here. Three closing screens, one per role:
- Frontline: surface problems, offer ideas, join projects, hold standards.
- Supervisor: respond to every observation within the stated cadence; protect the reporter;
  triage honestly ("noted, not now" is a legitimate status; silence is not).
- Leader: fund the response owner; publish what happens to what people report; never allow
  an observation into a performance conversation.

### Module 12 — See a Waste
The submission form is identical. The coach's worked examples are picked by vertical *and*
role, so a supervisor sees a supervisor's observation as the model.

---

## Production rules

1. Role text is a **content layer**, not a branch: one module file, role-tagged fragments,
   swapped at render. No role produces a different screen count or a different xAPI object.
2. A learner who changes role mid-course keeps progress. Reflection text is kept as typed.
3. Corporate rollouts set a default role by enrollment group (frontline for the workforce,
   supervisor for team leads, leader for the sponsor's cohort). The sponsor cohort takes the
   course *first*, in the kickoff week — the playbook's readiness gate condition 2 is met by a
   leader who has done the go-look tasks, not one who has read a brief.
4. Role-specific Show examples are written to the same fairness rules as everything else: no
   named villain, no cause asserted as fact.
