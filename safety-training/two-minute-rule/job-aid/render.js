// Renders job-aid.html to print PDFs and PNG previews, and checks every layout for text that runs outside its box.
// Usage: node render.js            (from any directory; writes next to this file)
//        node render.js --check    (layout check only, no files written)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname;
const SRC = 'file://' + path.join(DIR, 'job-aid.html');
const CHECK_ONLY = process.argv.includes('--check');

const PDFS = [
  { view: 'pocket', out: 'pocket-card.pdf', width: '105mm', height: '148mm', pages: 2 },
  { view: 'pocket-a4', out: 'pocket-card-sheet-a4.pdf', width: '297mm', height: '210mm', pages: 1 },
  { view: 'pocket-letter', out: 'pocket-card-sheet-letter.pdf', width: '11in', height: '8.5in', pages: 1 },
  { view: 'sign-a4', out: 'machine-sign-a4.pdf', width: '297mm', height: '210mm', pages: 1 },
  { view: 'sign-letter', out: 'machine-sign-letter.pdf', width: '11in', height: '8.5in', pages: 1 },
  { view: 'badge', out: 'badge-card.pdf', width: '85.6mm', height: '54mm', pages: 2 },
  { view: 'badge-a4', out: 'badge-card-sheet-a4.pdf', width: '210mm', height: '297mm', pages: 1 },
  { view: 'badge-letter', out: 'badge-card-sheet-letter.pdf', width: '8.5in', height: '11in', pages: 1 },
  { view: 'sorting', out: 'sorting-cards.pdf', width: '210mm', height: '297mm', pages: 6 },
  { view: 'callcards', out: 'call-cards.pdf', width: '210mm', height: '297mm', pages: 1 },
  { view: 'huddle', out: 'huddle-sheet.pdf', width: '210mm', height: '297mm', pages: 1 },
];
const PNGS = [
  { view: 'pocket-front', out: 'pocket-card-front.png' },
  { view: 'pocket-back', out: 'pocket-card-back.png' },
  { view: 'sign-a4', out: 'machine-sign.png' },
  { view: 'badge-front', out: 'badge-card-front.png' },
  { view: 'badge-back', out: 'badge-card-back.png' },
  { view: 'sorting', out: 'sorting-cards-front.png', nth: 0 },
  { view: 'sorting', out: 'sorting-cards-back.png', nth: 1 },
  { view: 'callcards', out: 'call-cards.png' },
  { view: 'huddle', out: 'huddle-sheet.png' },
];
const CHECK_VIEWS = ['pocket-front', 'pocket-back', 'badge-front', 'badge-back', 'sign-a4', 'sign-letter', 'sorting', 'callcards', 'huddle'];
// keep text this far inside the trim edge (mm)
const SAFE_MM = { pocket: 3.0, badge: 2.0, sign: 5.0, sort: 5.0, call: 5.0, huddle: 6.0 };
// smallest type allowed (pt). Sign: 16 pt for body text, 12 pt for the caps labels and the footer line.
const MIN_PT = { pocket: 9, badge: 6.5, sign: 16, signLabel: 12, labelSel: '.step, .pill, .sep, .base', sort: 10, call: 10, huddle: 9 };
// boxes whose content must fit inside them
const BOX_SEL = '.page, .sc, .cc, .q, .call, .t';

// Runs in the page: returns a list of problems (text outside its own box, inside the trim margin, too small, or overflowing a box).
function audit([safe, min, boxSel]) {
  const mm = 96 / 25.4, out = [];
  for (const page of document.querySelectorAll('.page[data-kind]')) {
    const kind = page.dataset.kind, where0 = `${kind} ${page.dataset.layout}`;
    const pr = page.getBoundingClientRect(), m = safe[kind] * mm;
    const tw = document.createTreeWalker(page, NodeFilter.SHOW_TEXT);
    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
      if (!n.textContent.trim()) continue;
      const box = n.parentElement.closest('div, p, span, td') || n.parentElement;
      const br = box.getBoundingClientRect();
      const pt = parseFloat(getComputedStyle(n.parentElement).fontSize) * 0.75;
      const floor = kind === 'sign' ? (n.parentElement.closest(min.labelSel) ? min.signLabel : min.sign) : min[kind];
      const where = `${where0}: "${n.textContent.trim().slice(0, 40)}"`;
      if (pt < floor - .01) out.push(`${where} is ${pt} pt (min ${floor} pt)`);
      const range = document.createRange(); range.selectNodeContents(n);
      for (const r of range.getClientRects()) {
        if (r.left < pr.left + m - .5 || r.right > pr.right - m + .5 || r.top < pr.top + m - .5 || r.bottom > pr.bottom - m + .5)
          out.push(`${where} is inside the ${safe[kind]} mm trim margin`);
        // glyph boxes are taller than a tight line box, so allow a quarter of the font size vertically
        const tol = parseFloat(getComputedStyle(n.parentElement).fontSize) * 0.25;
        if (r.right > br.right + 1 || r.left < br.left - 1 || r.bottom > br.bottom + tol || r.top < br.top - tol)
          out.push(`${where} runs outside its box`);
      }
    }
    for (const el of page.querySelectorAll('*')) {
      if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow !== 'visible' && el.textContent.trim())
        out.push(`${where0}: clipped text in <${el.tagName.toLowerCase()} class="${el.className}">`);
    }
    // every child of a fixed box must end inside it
    for (const bx of [page, ...page.querySelectorAll(boxSel)]) {
      const b = bx.getBoundingClientRect();
      for (const ch of bx.children) {
        const c = ch.getBoundingClientRect();
        if (c.width && c.height && (c.bottom > b.bottom + 1 || c.right > b.right + 1))
          out.push(`${where0}: <${ch.tagName.toLowerCase()} class="${ch.className}"> runs past the bottom or right of <${bx.tagName.toLowerCase()} class="${bx.className}">`);
      }
    }
  }
  return [...new Set(out)];
}

(async () => {
  const browser = await chromium.launch();
  let problems = 0;
  // 1. layout check on every layout
  for (const view of CHECK_VIEWS) {
    const page = await browser.newPage();
    await page.goto(`${SRC}?view=${view}`);
    await page.evaluate(() => document.fonts.ready);
    const res = await page.evaluate(audit, [SAFE_MM, MIN_PT, BOX_SEL]);
    res.forEach(r => console.log('CHECK', r));
    problems += res.length;
    await page.close();
  }
  console.log(problems ? `${problems} layout problem(s) found` : 'layout check: clean');
  if (CHECK_ONLY) { await browser.close(); process.exit(problems ? 1 : 0); }

  // 2. PDFs at true size
  for (const p of PDFS) {
    const page = await browser.newPage();
    await page.goto(`${SRC}?view=${p.view}`);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: path.join(DIR, p.out), width: p.width, height: p.height, printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: false });
    const pages = (fs.readFileSync(path.join(DIR, p.out), 'latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    if (pages !== p.pages) { console.log(`CHECK ${p.out} has ${pages} page(s), expected ${p.pages}`); problems++; }
    console.log('wrote', p.out);
    await page.close();
  }
  // 3. PNG previews at 2x
  const ctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 1200, height: 900 } });
  for (const p of PNGS) {
    const page = await ctx.newPage();
    await page.goto(`${SRC}?view=${p.view}`);
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.page').nth(p.nth || 0).screenshot({ path: path.join(DIR, p.out) });
    console.log('wrote', p.out);
    await page.close();
  }
  await browser.close();
  process.exit(problems ? 1 : 0);
})();
