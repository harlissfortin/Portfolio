// Reusable vector illustrations for video.html. Each returns an SVG string; call before window.ready().
// Flat style: steel blues, 3–4px strokes, no faces, no gore.
window.ART = (function () {
  const C = { steel: '#6f93b8', steelDark: '#22405f', steelFill: '#173250', plasma: '#e7c46a', n2: '#6cb4ff', red: '#ff5f5f', teal: '#34d1bf', amber: '#ffb81c', ink: '#f2f6fa', muted: '#9fb3c8', person: '#cfd9e4' };

  // A person as a rounded silhouette. (x,y) = feet centre; h = height in px.
  function person(x, y, h, opts = {}) {
    const s = h / 200, col = opts.color || 'var(--person)', id = opts.id ? `id="${opts.id}"` : '', extra = opts.attrs || '';
    return `<g ${id} ${extra} transform="translate(${x},${y}) scale(${s})" style="fill:${col}">
      <circle cx="0" cy="-180" r="17"/>
      <path d="M-24 -156 Q0 -162 24 -156 Q32 -153 33 -144 L37 -92 Q38 -84 31 -83 Q25 -83 24 -90 L21 -128 L20 -76 L17 -6 Q16 0 9 0 Q3 0 3 -6 L0 -64 L-3 -6 Q-3 0 -9 0 Q-16 0 -17 -6 L-20 -76 L-21 -128 L-24 -90 Q-25 -83 -31 -83 Q-38 -84 -37 -92 L-33 -144 Q-32 -153 -24 -156 Z"/>
    </g>`;
  }

  // Process tank cut-away. Returns {svg, ids}. Box ~ 760 x 640.
  function tank(o = {}) {
    const P = o.prefix || 't', W = 860, H = 660, cx = 470, top = 150, bot = 560, r = 190, liquidTop = o.liquidTop || 430;
    return `<svg viewBox="0 0 ${W} ${H}" width="${o.width || W}" height="${o.height || H}" class="${o.cls || ''}" style="${o.style || ''}" overflow="visible">
      <defs>
        <clipPath id="${P}-clip"><path d="M${cx - r + 10} ${top + 10} L${cx + r - 10} ${top + 10} L${cx + r - 10} ${bot - 40} Q${cx + r - 10} ${bot - 10} ${cx + r - 40} ${bot - 10} L${cx - r + 40} ${bot - 10} Q${cx - r + 10} ${bot - 10} ${cx - r + 10} ${bot - 40} Z"/></clipPath>
        <linearGradient id="${P}-n2fill" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.n2}" stop-opacity=".55"/><stop offset="1" stop-color="${C.n2}" stop-opacity=".18"/></linearGradient>
      </defs>
      <!-- walkway at the tank top (right) + ladder (left) -->
      <g stroke="${C.steel}" stroke-width="5" fill="none" stroke-linecap="round">
        <path d="M${cx - r - 26} ${top - 30} V${bot + 60} M${cx - r - 76} ${top - 30} V${bot + 60}"/>
        ${Array.from({ length: 9 }, (_, i) => `<path d="M${cx - r - 76} ${top + 10 + i * 56} H${cx - r - 26}"/>`).join('')}
      </g>
      <path d="M0 ${bot + 62} H${W}" stroke="#24476b" stroke-width="4"/>
      <!-- interior -->
      <g clip-path="url(#${P}-clip)">
        <rect x="0" y="0" width="${W}" height="${H}" fill="#0e2136"/>
        <rect id="${o.prefix || 't'}-n2" x="0" y="${top}" width="${W}" height="${liquidTop - top}" fill="url(#${P}-n2fill)" opacity="0"/>
        <rect x="0" y="${liquidTop}" width="${W}" height="${H}" fill="${C.plasma}" opacity=".85"/>
        <path d="M0 ${liquidTop} Q190 ${liquidTop - 8} 380 ${liquidTop} T760 ${liquidTop}" stroke="#f6dc98" stroke-width="4" fill="none"/>
        <g id="${o.prefix || 't'}-bubbles" fill="none" stroke="#fff6d6" stroke-width="3" opacity="0"></g>
      </g>
      <!-- shell -->
      <path d="M${cx - r} ${top} L${cx + r} ${top} L${cx + r} ${bot - 40} Q${cx + r} ${bot} ${cx + r - 40} ${bot} L${cx - r + 40} ${bot} Q${cx - r} ${bot} ${cx - r} ${bot - 40} Z" fill="none" stroke="${C.steel}" stroke-width="8"/>
      <!-- manway: open lid, or closed hatch with bolts -->
      <rect x="${cx - 70}" y="${top - 18}" width="140" height="22" rx="4" fill="${C.steelDark}" stroke="${C.steel}" stroke-width="5"/>
      ${o.closed ? `<rect x="${cx - 80}" y="${top - 30}" width="160" height="16" rx="5" fill="${C.steel}"/>${[-60, -20, 20, 60].map(d => `<circle cx="${cx + d}" cy="${top - 22}" r="4" fill="${C.steelDark}"/>`).join('')}`
        : `<rect x="${cx - 60}" y="${top - 14}" width="120" height="14" fill="#06101c"/><path d="M${cx + 70} ${top - 18} l52 -66" stroke="${C.steel}" stroke-width="9" stroke-linecap="round"/>`}
      <!-- nitrogen: supply line over the top head, dip tube to a sparger near the bottom -->
      <g id="${P}-n2line" ${o.n2 === false ? 'display="none"' : ''}>
        <path d="M${W + 40} 90 H${cx + 150} V${top}" stroke="${C.n2}" stroke-width="12" fill="none" stroke-linejoin="round"/>
        <path d="M${cx + 150} ${top} V${bot - 34} H${cx - 140}" stroke="${C.n2}" stroke-width="7" fill="none" clip-path="url(#${P}-clip)"/>
        <path d="M${cx + 140} ${bot - 34} H${cx - 140}" stroke="#d6ecff" stroke-width="3" stroke-dasharray="2 12" stroke-linecap="round" fill="none" clip-path="url(#${P}-clip)"/>
        <g transform="translate(${cx + 290},90)"><path d="M-26 -18 L0 0 L-26 18 Z M26 -18 L0 0 L26 18 Z" fill="#18222f" stroke="${C.n2}" stroke-width="5" stroke-linejoin="round"/><path d="M0 -2 V-26 M-16 -26 H16" stroke="${C.n2}" stroke-width="6" stroke-linecap="round"/></g>
        <text x="${W + 30}" y="70" text-anchor="end" font-size="34" font-weight="800" fill="${C.n2}">N₂</text>
      </g>
      <!-- legs -->
      <path d="M${cx - r + 40} ${bot} v60 M${cx + r - 40} ${bot} v60" stroke="${C.steel}" stroke-width="10" stroke-linecap="round"/>
      <!-- depth marker -->
      <g id="${o.prefix || 't'}-depth" opacity="0" stroke="${C.muted}" stroke-width="3" fill="${C.muted}">
        <path d="M${cx + r + 50} ${top} V${bot}" /><path d="M${cx + r + 36} ${top} h28 M${cx + r + 36} ${bot} h28"/>
        <text x="${cx + r + 66}" y="${(top + bot) / 2 - 30}" font-size="30" font-weight="700" stroke="none">7 ft</text>
      </g>
      ${o.person !== false ? person(cx - r - 150, bot + 60, 328, { id: (o.prefix || 't') + '-person' }) : ''}
    </svg>`;
  }

  // deterministic bubbles inside the tank liquid; call each frame
  function bubbles(gEl, t, on, liquidTop = 430, base = 524) {
    if (!gEl) return;
    const n = 26; let s = '';
    for (let i = 0; i < n; i++) {
      // golden-ratio phases and irregular speeds/positions so the bubbles never line up
      const g = (i * 0.6180339887) % 1, h = (i * 0.7548776662) % 1;
      const x = 312 + h * 316;
      const speed = 58 + ((i * 29) % 47) + g * 9;
      const phase = g;
      const yspan = base - liquidTop;
      const y = base - (((t * speed) / yspan + phase) % 1) * yspan;
      const rr = 5 + (i % 4) * 2;
      s += `<circle cx="${(x + Math.sin(t * 2 + i) * 6).toFixed(1)}" cy="${y.toFixed(1)}" r="${rr}"/>`;
    }
    gEl.innerHTML = s;
    gEl.setAttribute('opacity', on.toFixed(3));
  }

  // Oxygen gauge: semicircle 0–25%. value in %, returns svg string; update with setGauge
  function gauge(id, o = {}) {
    return `<svg id="${id}" viewBox="0 0 420 300" width="${o.width || 420}" height="${o.height || 300}" style="${o.style || ''}" class="${o.cls || ''}">
      <path d="M50 230 A160 160 0 0 1 370 230" fill="none" stroke="var(--line)" stroke-width="28" stroke-linecap="round"/>
      <path class="g-red" d="" fill="none" stroke="${C.red}" stroke-width="28" stroke-linecap="butt" opacity=".9"/>
      <path class="g-ok" d="" fill="none" stroke="${C.teal}" stroke-width="28" stroke-linecap="butt" opacity=".9"/>
      <line class="g-needle" x1="210" y1="230" x2="210" y2="96" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="210" cy="230" r="16" fill="var(--ink)"/>
      <text class="g-val" x="210" y="292" text-anchor="middle" font-size="46" font-weight="800" fill="var(--ink)">20.9%</text>
      <text x="210" y="40" text-anchor="middle" font-size="26" font-weight="700" fill="var(--muted)" letter-spacing="3">OXYGEN</text>
    </svg>`;
  }
  function arc(v0, v1) { // percent 0..25 -> arc path
    const a = v => Math.PI * (1 - v / 25), p = v => [210 + 160 * Math.cos(a(v)), 230 - 160 * Math.sin(a(v))];
    const [x0, y0] = p(v0), [x1, y1] = p(v1);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A160 160 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  function setGauge(id, v, label) {
    const el = document.getElementById(id); if (!el) return;
    el.querySelector('.g-red').setAttribute('d', arc(0, 19.5));
    el.querySelector('.g-ok').setAttribute('d', arc(19.5, 23.5));
    const ang = Math.PI * (1 - v / 25);
    const n = el.querySelector('.g-needle');
    n.setAttribute('x2', (210 + 134 * Math.cos(ang)).toFixed(1)); n.setAttribute('y2', (230 - 134 * Math.sin(ang)).toFixed(1));
    const tv = el.querySelector('.g-val'); tv.textContent = label != null ? label : v.toFixed(1) + '%';
    tv.setAttribute('fill', v < 19.5 ? 'var(--stop)' : 'var(--ink)');
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

  // Drum on a pallet with a grounding clamp lead and a monitored earth indicator (id-earth: set red/green per frame).
  function drum(id, o = {}) {
    return `<svg viewBox="0 0 420 420" width="${o.width || 420}" height="${o.height || 420}" style="${o.style || ''}" overflow="visible">
      <rect x="70" y="70" width="190" height="270" rx="16" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <path d="M70 140 H260 M70 270 H260" stroke="var(--steel)" stroke-width="5"/>
      <ellipse cx="165" cy="70" rx="95" ry="16" fill="var(--panel2)" stroke="var(--steel)" stroke-width="6"/>
      <text x="165" y="215" text-anchor="middle" font-size="26" font-weight="800" fill="var(--muted)">POWDER</text>
      <path d="M40 340 H300 M60 340 v26 M280 340 v26 M40 366 H300" stroke="var(--steel)" stroke-width="6" stroke-linecap="round"/>
      <g id="${id}-clamp">
        <path id="${id}-lead" d="M262 120 C 320 120, 330 200, 380 230" fill="none" stroke="#2f9e5a" stroke-width="6" stroke-linecap="round"/>
        <path d="M250 110 l22 0 l0 24 l-22 0 z" fill="#2f9e5a"/>
      </g>
      <rect x="336" y="220" width="92" height="104" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="5"/>
      <circle id="${id}-earth" cx="382" cy="256" r="20" fill="#cf3434"/>
      <text x="382" y="308" text-anchor="middle" font-size="18" font-weight="800" fill="var(--muted)">EARTH</text>
    </svg>`;
  }
  // Pipe with an in-line pressure gauge (needle angle set per frame via setNeedle(id, 0..1)).
  function lineGauge(id, o = {}) {
    return `<svg viewBox="0 0 520 360" width="${o.width || 520}" height="${o.height || 360}" style="${o.style || ''}" overflow="visible">
      <path d="M0 270 H520" stroke="var(--steel)" stroke-width="22" stroke-linecap="round"/>
      <path d="M260 270 V190" stroke="var(--steel)" stroke-width="12"/>
      <circle cx="260" cy="120" r="86" fill="var(--panel)" stroke="var(--steel)" stroke-width="8"/>
      ${Array.from({ length: 7 }, (_, i) => { const a = Math.PI * 1.25 - i * Math.PI * 0.25; return `<line x1="${(260 + 70 * Math.cos(a)).toFixed(1)}" y1="${(120 - 70 * Math.sin(a)).toFixed(1)}" x2="${(260 + 80 * Math.cos(a)).toFixed(1)}" y2="${(120 - 80 * Math.sin(a)).toFixed(1)}" stroke="var(--steel)" stroke-width="${i ? 4 : 7}"/>`; }).join('')}
      <text x="226" y="166" text-anchor="middle" font-size="24" font-weight="800" fill="var(--ink)">0</text>
      <line id="${id}-needle" x1="260" y1="120" x2="210" y2="160" stroke="var(--ink)" stroke-width="7" stroke-linecap="round"/>
      <circle cx="260" cy="120" r="10" fill="var(--ink)"/>
      <text x="260" y="324" text-anchor="middle" font-size="20" font-weight="700" fill="var(--muted)">LOCAL GAUGE</text>
    </svg>`;
  }
  function setNeedle(id, f) { // f: 0 (zero, lower-left) .. 1 (full, lower-right)
    const el = document.getElementById(id + '-needle'); if (!el) return;
    const a0 = Math.PI * 1.25, a = a0 - f * Math.PI * 1.5, L = 64;
    el.setAttribute('x2', (260 + L * Math.cos(a)).toFixed(1)); el.setAttribute('y2', (120 - L * Math.sin(a)).toFixed(1));
  }
  // Containment isolator front with two glove ports and a pressure-differential display.
  function isolator(id, o = {}) {
    return `<svg viewBox="0 0 700 460" width="${o.width || 700}" height="${o.height || 460}" style="${o.style || ''}" overflow="visible">
      <rect x="40" y="40" width="620" height="300" rx="22" fill="var(--panel)" stroke="var(--steel)" stroke-width="7"/>
      <rect x="80" y="80" width="540" height="220" rx="14" fill="color-mix(in srgb, var(--n2) 10%, var(--panel))" stroke="var(--line)" stroke-width="4"/>
      ${[220, 450].map(x => `<path d="M${x - 34} 262 V170 Q${x - 34} 140 ${x - 16} 140 H${x + 16} Q${x + 34} 140 ${x + 34} 170 V262" fill="color-mix(in srgb, var(--q3) 22%, var(--panel))" stroke="var(--steel)" stroke-width="4"/>${[-24, -8, 8, 24].map(d => `<path d="M${x + d} 142 V112" stroke="var(--steel)" stroke-width="12" stroke-linecap="round"/><path d="M${x + d} 142 V112" stroke="color-mix(in srgb, var(--q3) 22%, var(--panel))" stroke-width="5" stroke-linecap="round"/>`).join('')}<circle cx="${x}" cy="262" r="52" fill="none" stroke="var(--steel)" stroke-width="12"/>`).join('')}
      <circle id="${id}-pin" cx="470" cy="176" r="8" fill="var(--stop)" opacity="0"/>
      <rect x="506" y="96" width="112" height="54" rx="8" fill="#0b1420"/>
      <text id="${id}-dp" x="562" y="132" text-anchor="middle" font-size="24" font-weight="800" fill="#43d17e">ΔP OK</text>
      <path d="M90 340 v70 M610 340 v70 M60 410 H640" stroke="var(--steel)" stroke-width="7" stroke-linecap="round"/>
      <text x="350" y="380" text-anchor="middle" font-size="22" font-weight="700" fill="var(--muted)">ISOLATOR</text>
    </svg>`;
  }
  // Forklift carrying an IBC (position the group with a transform from the scene hook).
  function forklift() {
    return `<g>
      <rect x="0" y="40" width="120" height="110" rx="10" fill="var(--panel)" stroke="var(--steel)" stroke-width="6"/>
      <path d="M20 40 V0 H100 V40" fill="none" stroke="var(--steel)" stroke-width="6"/>
      <path d="M120 10 V160 M120 150 H200" stroke="var(--steel)" stroke-width="8" stroke-linecap="round"/>
      <circle cx="30" cy="160" r="22" fill="var(--steel)"/><circle cx="100" cy="160" r="22" fill="var(--steel)"/>
      <rect x="128" y="60" width="96" height="84" rx="6" fill="color-mix(in srgb, var(--n2) 18%, var(--panel))" stroke="var(--steel)" stroke-width="5"/>
      <path d="M128 88 H224 M128 116 H224 M160 60 V144 M192 60 V144" stroke="var(--steel)" stroke-width="3"/>
      <text x="176" y="56" text-anchor="middle" font-size="18" font-weight="800" fill="var(--muted)">IBC</text>
    </g>`;
  }
  return { C, person, tank, bubbles, gauge, setGauge, stopwatch, setStopwatch, drum, lineGauge, setNeedle, isolator, forklift };
})();
