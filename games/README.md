# Games

Browser games, each shipped as one self-contained HTML file with procedural art and audio. To play, open a game's `index.html` in a current browser. There is nothing to install and no build step.

| Game | Pitch | Docs |
|---|---|---|
| [Ooh × Aah](ooh-and-aah/) | Load fireworks into a rack of mortar tubes and light one fuse. Every burst scores off whatever earlier bursts left hanging in the sky, and the crowd's Applause is literally Ooh × Aah. A turn-based engine-builder roguelite: 24 shows across 8 festivals, ending at the Midnight Countdown. | [README](ooh-and-aah/README.md) (how to play, how it was made, architecture) · [Build spec](ooh-and-aah/DESIGN.md) · [Play](ooh-and-aah/index.html) |

## How these games are made

Each game goes through the same pipeline: a research brief, several competing pitches scored against a fun rubric, a build spec whose balance numbers come from a headless simulator run over 1,000 seeds, an independent red team, a revised spec, a parallel build of separate modules against a fixed contract, and review rounds backed by automated tools. The [Ooh × Aah README](ooh-and-aah/README.md#how-it-was-made) walks through each step with its numbers.

## Research

- [What Makes Games Fun: Design Research Brief](what-makes-games-fun.md). Seven research angles, from theory of fun to single-file browser engineering, combined into eight design principles, loop anatomy, checkable feel and onboarding rules, and the 14-criterion fun rubric that every pitch and build in this folder is scored against.
