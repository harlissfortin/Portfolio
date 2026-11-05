# Job aid: the 2-Minute Rule at the point of work

A pocket card for each person and a sign for each point of work. Both carry the five times to pause, Stop · Look ·
Ask · Decide, the four questions with a plain meaning for each, the three calls with the boundary rule (when you may
Fix it, and when you Stop & get help), and blanks for local help. The colours and type match the video; the icons are simplified for print, and each icon has one meaning across video and print (the bell is Interruption, the phone is calling for help).

It is not a form. There are no tick boxes and no signature lines, and nobody hands it in. It is an awareness aid: it
adds to your procedures, permits and lockout, and never replaces them.

The same source also prints the facilitator's huddle materials: the ten sorting cards, the call cards the crew votes
with, and a one-page huddle sheet.

## Files

| File | What it is |
|---|---|
| `pocket-card.pdf` | **The main handout.** A6 (105 × 148 mm), body text 9 pt or larger. Page 1 is the front, page 2 the back. For a print shop, or a printer that takes A6 card. |
| `pocket-card-sheet-a4.pdf`, `pocket-card-sheet-letter.pdf` | One pocket card on an A4 or US Letter sheet (landscape) for an office printer, front and back side by side, with corner marks and a fold line. |
| `machine-sign-a4.pdf`, `machine-sign-letter.pdf` | The sign, A4 or US Letter landscape. Body text 16 pt or larger, readable from about 1 m. |
| `badge-card.pdf`, `badge-card-sheet-a4.pdf`, `badge-card-sheet-letter.pdf` | Optional. The same words at credit-card size (85.6 × 54 mm) for a badge holder. The print is small (6.5 pt), so give it only as well as the pocket card, to people who ask. |
| `sorting-cards.pdf` | The ten sorting cards from the facilitator guide, four to an A4 page. Pages alternate fronts (the situation) and backs (the model answer and reason), laid out for long-edge double-sided printing. |
| `call-cards.pdf` | Go, Fix it, Stop & get help: one set per person, four sets to an A4 page. The crew holds them up to vote at the holds and on the cards. |
| `huddle-sheet.pdf` | The six huddle steps, with timings, what to say, the 10-minute version and the never-say lines, on one A4 page. |
| `*.png` | Screen previews at 2×. Don't print these. |
| `job-aid.html` | The source for every layout. The words are in `T`, `CARDS` and `HUDDLE`, and the local entries in `LOCAL`, at the top of its script. Open it in a browser to see every layout at once. |
| `render.js` | Rebuilds the PDFs and PNGs, and checks the layout. |

## Print

Print the pocket card, badge card and sign at **Actual size (100%)**, never "Fit to page". Check the first copy with a
ruler: the pocket card is 105 mm wide. The sorting cards, call cards and huddle sheet are A4; on US Letter, print them
with "Fit to page".

- **Pocket card, print shop.** Send `pocket-card.pdf`: double-sided, front and back the same way up, on 300–350 gsm
  card. Ask for lamination or a wipe-clean finish.
- **Pocket card, office printer.** Print `pocket-card-sheet-a4.pdf` or `pocket-card-sheet-letter.pdf` on 160–200 gsm
  card. Cut on the corner marks, fold on the dashed line with the printed sides out, and laminate in an A6 pouch.
- **Sign.** Print `machine-sign-a4.pdf` or `machine-sign-letter.pdf` and laminate it, or use the material QA approves.
  Post it at eye level where people start the job: on the machine, at the door to the room, or by the permit board.
- **Clean and contained areas.** QA approves the sign as a controlled posting, including its material. In classified,
  aseptic or potent-compound areas, post the sign outside the gowning room or airlock door, or outside the viewing
  window, or use a cleanroom-compatible version approved by QA that can be wiped with your disinfectant. Pocket cards
  stay outside the gowning line unless your site has approved a cleanroom version.
- **Sorting cards.** Print `sorting-cards.pdf` double-sided, flipping on the long edge, on card. Cut on the dashed
  lines on the fronts. Check that card 1's answer is behind card 1 before you cut the rest.
- **Call cards.** Print `call-cards.pdf` single-sided on card, once for every four people. Cut on the dashed lines.
- **Colour or black and white.** Both work. Every question has a number, and every call has a word and an icon, so
  nothing depends on colour.

## Fill in the local help

Fill the blanks for each area and shift before the launch: your lead (days, nights, weekends), radio or phone, who to
call if there's no answer, and where to report catches. The facilitator guide says what goes in each one. If you can't
fill a blank, there's a gap in the response standard: close it first.

- **By hand.** Use a permanent pen before laminating, or a wet-erase marker after laminating so names can change.
- **Typed.** Put the entries in `LOCAL` at the top of the script in `job-aid.html` and run `node render.js`. Keep them
  short: about 30 characters on the pocket card, about 20 on the sign, and about 15 on the badge card. `render.js`
  flags any entry that doesn't fit. Typed entries print on every copy, so make one set of files per area.
- **Sorting-card names.** `LOCAL.names` holds the equipment and permit names on the sorting cards (the words in
  [brackets] in the facilitator guide). Change them to yours and re-render. Change names only; an answer marked "Check
  locally" is changed only after your area lead and EHS confirm it against your fix list.

## Translate

1. Copy this folder, one per language. In `job-aid.html`, change the words in `T`, `CARDS` and (if your supervisors
   need it) `HUDDLE`, and set `lang` to the language code. Don't change the keys, the icon names or the `{name}` tokens.
2. Terms marked `LOCKED`, and the plain meanings of the steps and the four questions, must match the locked glossary in
   the facilitator guide (section 10) and the captions, word for word: The 2-Minute Rule; the five times to pause
   (Before you start, After a break, At handover, After an interruption, After any change); Stop, Look, Ask, Decide;
   the four questions and their meanings; Go, Fix it, Stop & get help, and their lines; When in doubt, get help; Your
   lead.
3. Translate the other lines for meaning, in short everyday words. Keep the `<b>` tags on the same idea. The sign's
   example line under Stop & get help ("For example: a glove change, guard or interlock work, opening a vessel") is
   "check locally": make sure each example is a Stop & get help job on your fix list.
4. Run `node render.js`. Fix every `CHECK` line by shortening the words, not by shrinking the type: the pocket card
   stays at 9 pt or more, the sign body at 16 pt or more, the badge card at 6.5 pt or more, and the sorting cards at
   10 pt or more. The script enforces all of them. Then look at the PNGs.
5. Ask two or three people from the floor who read that language to check it reads plainly. Read the sign from 1 m.
6. Right-to-left languages also need `dir="rtl"` on the `<html>` tag, and a careful look at every layout.
   Languages that Inter doesn't cover need a font that does, added to the `font-family` in the style block.

## Rebuild

`node render.js` needs Node and Playwright with Chromium. It checks every layout (text inside its box and inside the
trim margin, minimum type sizes, boxes that overflow, page counts), then writes the PDFs and PNGs. `node render.js
--check` only checks.
