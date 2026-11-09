// Reusable vector illustrations for video.html. Each returns an SVG string; call before window.ready().
// Flat style: steel blues, 3–4px strokes, no faces, no gore.
window.ART = (function () {
  const C = { steel: '#6f93b8', steelDark: '#22405f', steelFill: '#173250', plasma: '#e7c46a', n2: '#6cb4ff', red: '#ff5f5f', teal: '#34d1bf', amber: '#ffb81c', ink: '#f2f6fa', muted: '#9fb3c8', person: '#cfd9e4' };

  // A person as a rounded silhouette. (x,y) = feet centre; h = height in px.
  // opts: color, id, attrs; gown (cleanroom coverall + hood), mask, goggles, helmet (colour), shield (face shield),
  // gloves (colour), vest (colour: a lead's hi-vis vest); ppeAttrs = attributes for the PPE layer (e.g. a fade-in).
  function person(x, y, h, opts = {}) {
    const s = h / 200, id = opts.id ? `id="${opts.id}"` : '', extra = opts.attrs || '';
    const col = opts.gown ? '#eef3f8' : (opts.color || 'var(--person)');
    const line = opts.gown ? 'stroke="var(--steel)" stroke-width="2.4"' : '';
    const body = `<path ${line} d="M-24 -156 Q0 -162 24 -156 Q32 -153 33 -144 L37 -92 Q38 -84 31 -83 Q25 -83 24 -90 L21 -128 L20 -76 L17 -6 Q16 0 9 0 Q3 0 3 -6 L0 -64 L-3 -6 Q-3 0 -9 0 Q-16 0 -17 -6 L-20 -76 L-21 -128 L-24 -90 Q-25 -83 -31 -83 Q-38 -84 -37 -92 L-33 -144 Q-32 -153 -24 -156 Z"/>`;
    const head = opts.gown
      ? `<path ${line} d="M-23 -158 Q-25 -205 0 -205 Q25 -205 23 -158 Z"/><ellipse cx="0" cy="-180" rx="12" ry="14" fill="var(--person)"/>`
      : `<circle cx="0" cy="-180" r="17"/>`;
    let ppe = '';
    if (opts.vest) ppe += `<path d="M-22 -153 L22 -153 L20 -96 L-20 -96 Z" fill="${opts.vest}"/><path d="M-21 -128 H21 M-20.5 -112 H20.5" stroke="#f4f7fb" stroke-width="5"/>`;
    if (opts.mask) ppe += `<rect x="-10" y="-178" width="20" height="10" rx="4" fill="#a9cbe8" stroke="var(--steel)" stroke-width="1.2"/>`;
    if (opts.goggles) ppe += `<rect x="-15" y="-189" width="30" height="9" rx="4.5" fill="#2a3b4f"/><rect x="-11" y="-187" width="8" height="4" rx="2" fill="#9fd0ff"/><rect x="3" y="-187" width="8" height="4" rx="2" fill="#9fd0ff"/>`;
    if (opts.helmet) ppe += `<path d="M-19 -190 Q-19 -208 0 -208 Q19 -208 19 -190 Z" fill="${opts.helmet}"/><rect x="-24" y="-192" width="48" height="5" rx="2.5" fill="${opts.helmet}"/>`;
    if (opts.shield) ppe += `<rect x="-20" y="-194" width="40" height="5" rx="2" fill="var(--steel)"/><path d="M-21 -190 H21 V-168 Q21 -157 10 -157 H-10 Q-21 -157 -21 -168 Z" fill="rgba(170,215,250,.38)" stroke="var(--steel)" stroke-width="2.2"/>`;
    if (opts.gloves) ppe += `<circle cx="-33" cy="-87" r="6.5" fill="${opts.gloves}"/><circle cx="33" cy="-87" r="6.5" fill="${opts.gloves}"/>`;
    if (opts.ppeOnly) return `<g ${extra} transform="translate(${x},${y}) scale(${s})"><g ${opts.ppeAttrs || ''}>${ppe}</g></g>`;
    return `<g ${id} ${extra} transform="translate(${x},${y}) scale(${s})" style="fill:${col}">
      ${head}${body}${ppe ? `<g ${opts.ppeAttrs || ''}>${ppe}</g>` : ''}
    </g>`;
  }

  // stopwatch ring: progress 0..1 (fraction of two minutes elapsed)
  function stopwatch(id, o = {}) {
    const sz = o.size || 420;
    return `<svg id="${id}" viewBox="0 0 420 460" width="${sz}" height="${sz * 460 / 420}" style="${o.style || ''}" class="${o.cls || ''}">
      <rect x="180" y="6" width="60" height="26" rx="8" fill="${C.amber}"/>
      <rect x="200" y="28" width="20" height="26" fill="${C.amber}"/>
      <path d="M330 92 l26 -26" stroke="${C.amber}" stroke-width="16" stroke-linecap="round"/>
      <circle cx="210" cy="250" r="180" fill="#0f2338" stroke="#24476b" stroke-width="18"/>
      <circle class="sw-ring" cx="210" cy="250" r="180" fill="none" stroke="${C.amber}" stroke-width="18" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="1" transform="rotate(-90 210 250)" stroke-linecap="round"/>
      ${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<line x1="${210 + 150 * Math.sin(a)}" y1="${250 - 150 * Math.cos(a)}" x2="${210 + (i % 3 ? 140 : 128) * Math.sin(a)}" y2="${250 - (i % 3 ? 140 : 128) * Math.cos(a)}" stroke="#4a6b8e" stroke-width="${i % 3 ? 4 : 7}" stroke-linecap="round"/>`; }).join('')}
      <text class="sw-txt num" x="210" y="282" text-anchor="middle" font-size="104" font-weight="850" fill="${C.ink}">2:00</text>
    </svg>`;
  }
  function setStopwatch(id, p, showTime) {
    const el = document.getElementById(id); if (!el) return;
    el.querySelector('.sw-ring').setAttribute('stroke-dashoffset', (1 - p).toFixed(4));
    if (showTime !== false) {
      const left = Math.round(120 * (1 - p)); el.querySelector('.sw-txt').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    }
  }

  return { C, person, stopwatch, setStopwatch };
})();
