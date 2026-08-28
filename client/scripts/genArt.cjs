// Generates vector invitation artwork + the matching template catalogue.
// Run: node scripts/genArt.cjs   (from the client folder)
//
// Every card is authored with artwork pushed to the top strip and the lower
// half, leaving the upper-middle clear for text. That is what keeps the
// auto-layout legible on all 200+ designs without hand-tuning per template.
const fs = require('fs');
const path = require('path');

const W = 720;
const H = 1280;
const OUT_DIR = path.join(__dirname, '..', 'public', 'templates', 'art');
const DATA_OUT = path.join(__dirname, '..', 'src', 'data', 'templatesGenerated.js');

// ─────────────────────────── palettes ───────────────────────────
const PALETTES = {
  'marigold-royale': { bg1: '#FFF6E0', bg2: '#F8DEAC', ink: '#7A3B12', gold: '#BE8A1E', accent: '#F0901C', accent2: '#D9541E', dark: '#5A2A0A', light: '#FFFAF0', name: 'Marigold' },
  'deep-maroon': { bg1: '#5C0E1F', bg2: '#2C0710', ink: '#FFE9C7', gold: '#E3B84B', accent: '#F5D27A', accent2: '#B21E38', dark: '#200508', light: '#FFF3DC', name: 'Maroon' },
  'peacock-teal': { bg1: '#E9F8F5', bg2: '#B4E2DC', ink: '#0B4F4A', gold: '#B98F22', accent: '#128088', accent2: '#0F6C94', dark: '#08413D', light: '#F4FCFB', name: 'Peacock' },
  'rani-pink': { bg1: '#FFF1F6', bg2: '#F7CFE0', ink: '#7A1E45', gold: '#C9A227', accent: '#D6236A', accent2: '#A81E6B', dark: '#5C1435', light: '#FFF7FA', name: 'Rani' },
  'emerald-ivory': { bg1: '#F5F8EE', bg2: '#D6E6C2', ink: '#1E4A22', gold: '#B4943E', accent: '#2E7D32', accent2: '#6D9A3E', dark: '#153A1A', light: '#FBFDF7', name: 'Emerald' },
  'midnight-gold': { bg1: '#171D33', bg2: '#06080F', ink: '#FFEFC9', gold: '#D9B45B', accent: '#F0D68A', accent2: '#8A6C2A', dark: '#03040A', light: '#FFF7E4', name: 'Midnight' },
  'sunrise-coral': { bg1: '#FFF4EB', bg2: '#FFD6B8', ink: '#8A3D20', gold: '#D2761A', accent: '#FF7A45', accent2: '#E14E3C', dark: '#5E2A15', light: '#FFF9F5', name: 'Sunrise' },
  'ivory-jade': { bg1: '#FBF8F0', bg2: '#E4EEE0', ink: '#33513A', gold: '#B99B46', accent: '#5F7A5B', accent2: '#8FAE86', dark: '#243A28', light: '#FEFCF6', name: 'Jade' },
  'saffron-temple': { bg1: '#FFF3D9', bg2: '#F6CB76', ink: '#7A3B12', gold: '#A9760A', accent: '#E8760B', accent2: '#C0392B', dark: '#4E250A', light: '#FFFBEE', name: 'Saffron' },
  'plum-noir': { bg1: '#2C1132', bg2: '#110614', ink: '#F6E3FA', gold: '#D4AF37', accent: '#A67BC4', accent2: '#6F5B94', dark: '#0B040D', light: '#FBF1FD', name: 'Plum' },
  'pastel-mint': { bg1: '#F2FBF7', bg2: '#D3F0E2', ink: '#26584B', gold: '#C4A96A', accent: '#4FB68C', accent2: '#7FD1AE', dark: '#173C33', light: '#FAFFFD', name: 'Mint' },
  'royal-blue': { bg1: '#EFF4FC', bg2: '#C6D8F1', ink: '#1F3A66', gold: '#BE9B3F', accent: '#2E5CA8', accent2: '#4C86C9', dark: '#142644', light: '#F8FBFF', name: 'Royal Blue' },
  'terracotta-raj': { bg1: '#FDEFE4', bg2: '#F0C6A6', ink: '#7C3417', gold: '#C57B3A', accent: '#C0392B', accent2: '#9C5A2B', dark: '#4E1F0D', light: '#FFF8F3', name: 'Terracotta' },
  'rose-gold': { bg1: '#FFF7F3', bg2: '#F6DACB', ink: '#7A3B34', gold: '#C08457', accent: '#D98C7A', accent2: '#B96A5C', dark: '#51231E', light: '#FFFCFA', name: 'Rose Gold' },
  'forest-night': { bg1: '#10231A', bg2: '#050D09', ink: '#EAF6E9', gold: '#D4AF37', accent: '#3E9B6D', accent2: '#1F6B47', dark: '#030705', light: '#F4FBF3', name: 'Forest' },
  'sky-trust': { bg1: '#EBF6FF', bg2: '#C3E2F9', ink: '#1B4B6B', gold: '#D6A94A', accent: '#3F92C4', accent2: '#6FB6DF', dark: '#12344A', light: '#F7FCFF', name: 'Sky' },
  'cocoa-cream': { bg1: '#FBF3E9', bg2: '#E4CDB1', ink: '#4A3121', gold: '#A9762F', accent: '#8B5A2B', accent2: '#C79A5E', dark: '#2E1D12', light: '#FEFBF6', name: 'Cocoa' },
  'carnival-pop': { bg1: '#FFFDF2', bg2: '#FFE9F0', ink: '#6B2D5C', gold: '#F2B705', accent: '#E8447A', accent2: '#3ABFC9', dark: '#3B1733', light: '#FFFFFF', name: 'Carnival' },
  'royal-purple': { bg1: '#F5F0FF', bg2: '#D4B8E8', ink: '#3D1A5C', gold: '#D4AF37', accent: '#7B2D8E', accent2: '#9B4DCA', dark: '#2A0E40', light: '#FAF5FF', name: 'Royal Purple' },
  'indigo-dream': { bg1: '#EEF0FF', bg2: '#B8C4E8', ink: '#1A2A5C', gold: '#C9A84C', accent: '#3B5998', accent2: '#5B7EC2', dark: '#0E1A3D', light: '#F5F7FF', name: 'Indigo' },
  'teal-lagoon': { bg1: '#F0FAF8', bg2: '#A8DDD4', ink: '#1A4A42', gold: '#C49A3C', accent: '#2A9D8F', accent2: '#40B4A6', dark: '#0E3029', light: '#F5FDFA', name: 'Teal Lagoon' },
  'ruby-wine': { bg1: '#FFF5F5', bg2: '#E8B4B8', ink: '#5C1A2A', gold: '#D4AF37', accent: '#C0392B', accent2: '#E74C3C', dark: '#3D0E1A', light: '#FFF8F8', name: 'Ruby Wine' },
  'sage-eucalyptus': { bg1: '#F5F8F2', bg2: '#C8D8BE', ink: '#2A4A22', gold: '#B8963E', accent: '#6B8E5A', accent2: '#8FAE7A', dark: '#1A3015', light: '#FAFDF8', name: 'Sage' },
  'dusty-lavender': { bg1: '#F8F5FF', bg2: '#D4C4E8', ink: '#4A2A6C', gold: '#C9A84C', accent: '#9B7EC2', accent2: '#B49AD4', dark: '#2E1A42', light: '#FCF8FF', name: 'Lavender' },
  'navy-silver': { bg1: '#F0F4F8', bg2: '#A8B8C8', ink: '#1A2A3C', gold: '#C0C0C0', accent: '#2C4A6C', accent2: '#4A6A8C', dark: '#0E1A28', light: '#F5F8FC', name: 'Navy Silver' },
  'champagne-blush': { bg1: '#FFF8F0', bg2: '#F0D4C4', ink: '#5C3A2A', gold: '#D4AF37', accent: '#D4A08A', accent2: '#E8B4A0', dark: '#3D2418', light: '#FFFCF8', name: 'Champagne' },
  'olive-bronze': { bg1: '#F5F5EE', bg2: '#C8C4A8', ink: '#3A3A1A', gold: '#B8860B', accent: '#8B8040', accent2: '#A09850', dark: '#242410', light: '#FAFAF5', name: 'Olive Bronze' },
  'cerulean-pearl': { bg1: '#F0F8FF', bg2: '#A8D4F0', ink: '#1A3A5C', gold: '#E8D4A0', accent: '#4A90C4', accent2: '#6AAAD4', dark: '#0E243D', light: '#F5FAFF', name: 'Cerulean' },
  // Christmas-specific palettes
  'xmas-classic': { bg1: '#FFF8F0', bg2: '#F0D8D0', ink: '#1A4A22', gold: '#D4AF37', accent: '#C0392B', accent2: '#2E7D32', dark: '#0E3015', light: '#FFF5F0', name: 'Xmas Classic' },
  'xmas-elegant': { bg1: '#FFFDF5', bg2: '#F5ECD8', ink: '#5C3A1A', gold: '#D4AF37', accent: '#8B0000', accent2: '#DAA520', dark: '#3D1A0A', light: '#FFFCF0', name: 'Xmas Elegant' },
  'xmas-winter': { bg1: '#F0F5FF', bg2: '#C8D8E8', ink: '#1A2A4A', gold: '#C0C0C0', accent: '#4169E1', accent2: '#87CEEB', dark: '#0E1A30', light: '#F5F8FF', name: 'Xmas Winter' },
  'xmas-burgundy': { bg1: '#FFF5F5', bg2: '#E8C0C0', ink: '#4A0A1A', gold: '#D4AF37', accent: '#800020', accent2: '#B22234', dark: '#2E0510', light: '#FFF8F8', name: 'Xmas Burgundy' },
  'xmas-forest': { bg1: '#F0FFF0', bg2: '#C8E8C8', ink: '#0A3A1A', gold: '#FFD700', accent: '#228B22', accent2: '#32CD32', dark: '#052010', light: '#F5FFF5', name: 'Xmas Forest' },
  'xmas-royal': { bg1: '#F8F0FF', bg2: '#D8C8E8', ink: '#2A1A4A', gold: '#FFD700', accent: '#4B0082', accent2: '#6A0DAD', dark: '#1A0E30', light: '#FAF5FF', name: 'Xmas Royal' },
};

const rnd = (seed) => {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
};

// ─────────────────────────── motif helpers ───────────────────────────
const petalRing = (cx, cy, r1, r2, count, fill, stroke, phase = 0) => {
  let out = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * 360 + phase;
    out += `<ellipse cx="0" cy="${-r2}" rx="${r1}" ry="${r2}" fill="${fill}" stroke="${stroke}" stroke-width="1.2" opacity="0.9" transform="translate(${cx} ${cy}) rotate(${a})"/>`;
  }
  return out;
};

const dotRow = (x1, x2, y, r, fill, step) => {
  let out = '';
  for (let x = x1; x <= x2; x += step) out += `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  return out;
};

const marigold = (cx, cy, r, P) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${P.accent}"/>` +
  `<circle cx="${cx}" cy="${cy}" r="${r * 0.62}" fill="${P.accent2}" opacity="0.85"/>` +
  `<circle cx="${cx}" cy="${cy}" r="${r * 0.28}" fill="${P.gold}"/>`;

const leaf = (cx, cy, len, rot, fill) =>
  `<path d="M0 0 Q ${len * 0.35} ${-len * 0.42} ${len} 0 Q ${len * 0.35} ${len * 0.42} 0 0 Z" fill="${fill}" transform="translate(${cx} ${cy}) rotate(${rot})"/>`;

const diya = (cx, cy, s, P) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${18 * s}" ry="${7 * s}" fill="${P.accent2}"/>` +
  `<ellipse cx="${cx}" cy="${cy - 2 * s}" rx="${15 * s}" ry="${5 * s}" fill="${P.gold}"/>` +
  `<path d="M${cx} ${cy - 8 * s} q ${6 * s} ${-10 * s} 0 ${-20 * s} q ${-6 * s} ${10 * s} 0 ${20 * s} Z" fill="#FFD24A"/>` +
  `<circle cx="${cx}" cy="${cy - 22 * s}" r="${16 * s}" fill="#FFD24A" opacity="0.16"/>`;

const lotus = (cx, cy, s, P) =>
  petalRing(cx, cy + 6 * s, 8 * s, 26 * s, 9, P.accent, P.gold, 10) +
  petalRing(cx, cy + 2 * s, 6 * s, 18 * s, 7, P.accent2, P.gold, 25) +
  `<circle cx="${cx}" cy="${cy}" r="${7 * s}" fill="${P.gold}"/>`;

const peacockFeather = (cx, cy, rot, P) =>
  `<g transform="translate(${cx} ${cy}) rotate(${rot})">` +
  `<path d="M0 0 q -6 -70 0 -120 q 6 50 0 120 Z" fill="${P.accent2}" opacity="0.75"/>` +
  `<ellipse cx="0" cy="-132" rx="20" ry="27" fill="${P.accent}"/>` +
  `<ellipse cx="0" cy="-134" rx="12" ry="17" fill="${P.gold}"/>` +
  `<ellipse cx="0" cy="-136" rx="6" ry="9" fill="${P.dark}"/></g>`;

const heart = (cx, cy, s, fill) =>
  `<path d="M0 ${5 * s} C ${-12 * s} ${-6 * s} ${-4 * s} ${-14 * s} 0 ${-7 * s} C ${4 * s} ${-14 * s} ${12 * s} ${-6 * s} 0 ${5 * s} Z" fill="${fill}" transform="translate(${cx} ${cy})"/>`;

const star = (cx, cy, r, fill) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }
  return `<path d="${d}Z" fill="${fill}"/>`;
};

const frame = (P, inset = 22, w = 2.5) =>
  `<rect x="${inset}" y="${inset}" width="${W - inset * 2}" height="${H - inset * 2}" fill="none" stroke="${P.gold}" stroke-width="${w}"/>` +
  `<rect x="${inset + 8}" y="${inset + 8}" width="${W - (inset + 8) * 2}" height="${H - (inset + 8) * 2}" fill="none" stroke="${P.gold}" stroke-width="1" opacity="0.6"/>`;

// ─────────────────────────── card designs ───────────────────────────
const DESIGNS = {
  'temple-arch': { label: 'Temple Arch', body: (P) => `${frame(P)}
    <g opacity="0.95"><rect x="120" y="820" width="480" height="460" fill="${P.dark}" opacity="0.14"/>
    <path d="M180 1280 L180 1000 L240 940 L300 1000 L300 900 L360 830 L420 900 L420 1000 L480 940 L540 1000 L540 1280 Z" fill="${P.dark}" opacity="0.5"/>
    <path d="M330 1280 L330 1090 Q360 1040 390 1090 L390 1280 Z" fill="${P.gold}" opacity="0.55"/>
    <rect x="352" y="770" width="16" height="70" fill="${P.gold}"/>
    <circle cx="360" cy="760" r="16" fill="${P.gold}"/>
    <path d="M344 752 L376 752 L360 726 Z" fill="${P.accent}"/></g>
    ${[150, 250, 360, 470, 570].map((x, i) => `<path d="M${x} 60 L${x} 130" stroke="${P.gold}" stroke-width="2"/><circle cx="${x}" cy="${140 + i * 3}" r="9" fill="${P.accent}"/>`).join('')}
    ${dotRow(70, 650, 44, 4, P.gold, 34)}`,
  },

  'mandala': { label: 'Mandala', body: (P) => `${frame(P, 18)}
    <g opacity="0.9">${petalRing(360, 1010, 26, 190, 16, P.accent, P.gold)}
    ${petalRing(360, 1010, 20, 140, 12, P.accent2, P.gold, 8)}
    ${petalRing(360, 1010, 14, 92, 10, P.gold, P.dark, 12)}
    <circle cx="360" cy="1010" r="42" fill="${P.light}" stroke="${P.gold}" stroke-width="2"/>
    <circle cx="360" cy="1010" r="16" fill="${P.accent}"/></g>
    <g opacity="0.5">${petalRing(360, 130, 16, 110, 14, P.gold, P.accent)}<circle cx="360" cy="130" r="30" fill="${P.light}"/></g>
    ${dotRow(60, 660, 1258, 5, P.gold, 30)}`,
  },

  'moorish-arch': { label: 'Moorish Arch', body: (P) => `
    <path d="M60 1280 L60 420 Q60 180 360 160 Q660 180 660 420 L660 1280 Z" fill="none" stroke="${P.gold}" stroke-width="4"/>
    <path d="M84 1280 L84 430 Q84 208 360 188 Q636 208 636 430 L636 1280 Z" fill="none" stroke="${P.gold}" stroke-width="1.4" opacity="0.7"/>
    <g opacity="0.28" stroke="${P.accent}" stroke-width="1.4" fill="none">
      ${[0, 1, 2, 3, 4, 5].map((r) => [0, 1, 2, 3, 4, 5, 6, 7].map((c) => `<circle cx="${140 + c * 64}" cy="${900 + r * 62}" r="24"/>`).join('')).join('')}
    </g>
    <g opacity="0.9">${[120, 360, 600].map((x) => `<path d="M${x - 40} 250 Q${x} 180 ${x + 40} 250" fill="none" stroke="${P.accent2}" stroke-width="3"/>`).join('')}</g>
    ${[150, 240, 360, 480, 570].map((x) => `<line x1="${x}" y1="270" x2="${x}" y2="330" stroke="${P.gold}" stroke-width="2"/>${marigold(x, 342, 11, P)}`).join('')}
    <rect x="0" y="0" width="${W}" height="30" fill="${P.dark}" opacity="0.35"/>`,
  },

  'toran-garland': { label: 'Toran Garland', body: (P) => `${frame(P)}
    <g>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
      const x = 60 + i * 75;
      const sag = 96 + (i % 2) * 22;
      return `<path d="M${x - 38} 40 Q${x} ${sag} ${x + 38} 40" fill="none" stroke="${P.gold}" stroke-width="2"/>
        ${leaf(x - 26, 70, 30, 60, P.accent2)}${leaf(x + 26, 70, 30, 120, P.accent2)}
        ${marigold(x, sag + 4, 13, P)}${marigold(x - 30, 58, 8, P)}`;
    }).join('')}</g>
    <g opacity="0.85">${[80, 190, 300, 410, 520, 630].map((x, i) => leaf(x, 1210 - (i % 2) * 26, 70, i % 2 ? 200 : 340, P.accent2)).join('')}</g>
    ${[170, 360, 550].map((x) => diya(x, 1178, 1.5, P)).join('')}
    ${dotRow(50, 670, 1258, 4, P.gold, 26)}`,
  },

  'diya-lights': { label: 'Diya Lights', body: (P) => {
    const r = rnd(7);
    let bokeh = '';
    for (let i = 0; i < 46; i++) {
      const x = r() * W; const y = 760 + r() * 480; const rad = 4 + r() * 22;
      bokeh += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(0)}" fill="${P.gold}" opacity="${(0.08 + r() * 0.22).toFixed(2)}"/>`;
    }
    return `${frame(P, 20)}${bokeh}
      ${[100, 220, 360, 500, 620].map((x, i) => diya(x, 1080 + i * 22, 1.9 - i * 0.08, P)).join('')}
      <path d="M0 1180 Q180 1140 360 1180 Q540 1220 720 1180 L720 1280 L0 1280 Z" fill="${P.dark}" opacity="0.28"/>
      ${[360, 200, 520].map((x) => `<circle cx="${x}" cy="120" r="34" fill="${P.gold}" opacity="0.35"/>`).join('')}`;
  } },

  'paisley-corner': { label: 'Paisley Corners', body: (P) => {
    const paisley = (x, y, rot, s) =>
      `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0 C 60 -20 70 -90 20 -110 C -40 -130 -60 -50 -18 -22 C 8 -4 30 -28 18 -52" fill="none" stroke="${P.accent}" stroke-width="5"/><path d="M6 -18 C 40 -34 44 -84 12 -94 C -26 -104 -38 -48 -12 -32" fill="none" stroke="${P.gold}" stroke-width="2.4"/></g>`;
    return `${frame(P, 26)}${frame(P, 44, 1)}
      ${paisley(130, 240, 0, 1)}${paisley(590, 240, 0, -1)}${paisley(130, 1090, 180, 1)}${paisley(590, 1090, 180, -1)}
      ${marigold(360, 96, 16, P)}${dotRow(200, 520, 96, 4, P.gold, 30)}
      ${marigold(360, 1216, 16, P)}${dotRow(200, 520, 1216, 4, P.gold, 30)}`;
  } },

  'lotus-pond': { label: 'Lotus Pond', body: (P) => `${frame(P)}
    <g opacity="0.5" stroke="${P.accent2}" fill="none" stroke-width="1.6">
      ${[1010, 1060, 1110, 1160, 1210].map((y) => `<path d="M40 ${y} Q180 ${y - 18} 360 ${y} Q540 ${y + 18} 680 ${y}"/>`).join('')}
    </g>
    ${lotus(190, 1050, 1.7, P)}${lotus(530, 1120, 1.4, P)}${lotus(360, 1195, 1.1, P)}
    ${[120, 620].map((x) => leaf(x, 1000, 110, x < 360 ? 300 : 220, P.accent2)).join('')}
    <g opacity="0.4">${[120, 260, 400, 540, 640].map((x, i) => `<circle cx="${x}" cy="${150 + i * 22}" r="${26 - i * 3}" fill="${P.gold}"/>`).join('')}</g>
    ${dotRow(60, 660, 60, 5, P.gold, 32)}`,
  },

  'peacock-fan': { label: 'Peacock Fan', body: (P) => `${frame(P)}
    <g>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => peacockFeather(360 + (i - 4) * 42, 1250, (i - 4) * 8, P)).join('')}</g>
    <ellipse cx="360" cy="1258" rx="210" ry="34" fill="${P.dark}" opacity="0.25"/>
    <g opacity="0.85">${[360].map(() => petalRing(360, 132, 14, 88, 12, P.accent, P.gold)).join('')}<circle cx="360" cy="132" r="26" fill="${P.light}"/></g>
    ${dotRow(70, 650, 48, 4, P.gold, 28)}`,
  },

  'rangoli-border': { label: 'Rangoli Border', body: (P) => {
    const dots = [];
    for (let i = 0; i < 26; i++) { dots.push(`<circle cx="${40 + i * 25}" cy="40" r="6" fill="${P.accent}"/><circle cx="${40 + i * 25}" cy="1240" r="6" fill="${P.accent}"/>`); }
    for (let i = 0; i < 46; i++) { dots.push(`<circle cx="40" cy="${40 + i * 26}" r="6" fill="${P.gold}"/><circle cx="680" cy="${40 + i * 26}" r="6" fill="${P.gold}"/>`); }
    return `<rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="${P.gold}" stroke-width="2"/>
      <g opacity="0.9">${dots.join('')}</g>
      ${petalRing(360, 1130, 18, 120, 12, P.accent2, P.gold)}${petalRing(360, 1130, 12, 70, 8, P.accent, P.gold, 15)}
      <circle cx="360" cy="1130" r="24" fill="${P.light}" stroke="${P.gold}" stroke-width="2"/>
      ${marigold(120, 1130, 14, P)}${marigold(600, 1130, 14, P)}`;
  } },

  'marble-pillar': { label: 'Marble Pillar', body: (P) => `
    <rect x="46" y="120" width="56" height="1160" fill="${P.dark}" opacity="0.18"/>
    <rect x="618" y="120" width="56" height="1160" fill="${P.dark}" opacity="0.18"/>
    <rect x="34" y="96" width="80" height="30" rx="6" fill="${P.gold}"/><rect x="606" y="96" width="80" height="30" rx="6" fill="${P.gold}"/>
    <path d="M102 160 Q360 330 618 160" fill="none" stroke="${P.gold}" stroke-width="3"/>
    ${[150, 250, 360, 470, 570].map((x) => { const t = (x - 102) / 516; const y = 160 + Math.sin(Math.PI * t) * 165; return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 44}" stroke="${P.accent2}" stroke-width="2"/>${marigold(x, y + 56, 11, P)}`; }).join('')}
    <g opacity="0.5"><rect x="0" y="1120" width="${W}" height="160" fill="${P.light}"/>
    ${[90, 230, 370, 510, 650].map((x) => `<path d="M${x - 44} 1280 L${x} 1178 L${x + 44} 1280 Z" fill="${P.accent2}" opacity="0.5"/>`).join('')}</g>`,
  },

  'star-night': { label: 'Star Night', body: (P) => {
    const r = rnd(11);
    let sky = '';
    for (let i = 0; i < 70; i++) {
      const x = r() * W; const y = r() * 760; const rad = 1 + r() * 3;
      sky += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${rad.toFixed(1)}" fill="${P.light}" opacity="${(0.35 + r() * 0.6).toFixed(2)}"/>`;
    }
    return `${sky}<circle cx="560" cy="150" r="52" fill="${P.gold}" opacity="0.9"/>
      <circle cx="536" cy="136" r="46" fill="${P.bg1}"/>
      <g opacity="0.92">
        <path d="M0 1280 L0 1080 L70 1080 L110 1000 L150 1080 L230 1080 L270 960 L310 1080 L400 1080 L440 1010 L480 1080 L570 1080 L610 1000 L650 1080 L720 1080 L720 1280 Z" fill="${P.dark}" opacity="0.72"/>
        <path d="M330 1280 L330 1120 Q360 1074 390 1120 L390 1280 Z" fill="${P.gold}" opacity="0.55"/>
      </g>
      ${[140, 300, 460, 620].map((x) => diya(x, 1250, 1.2, P)).join('')}`;
  } },

  'floral-wreath': { label: 'Floral Wreath', body: (P) => {
    const flowers = [];
    for (let i = 0; i < 22; i++) {
      const a = Math.PI * (0.08 + (i / 21) * 0.84);
      const x = 360 - Math.cos(a) * 250;
      const y = 1000 - Math.sin(a) * -210;
      flowers.push(`${petalRing(x, y, 7, 20, 6, i % 2 ? P.accent : P.accent2, P.gold, i * 7)}<circle cx="${x}" cy="${y}" r="6" fill="${P.gold}"/>`);
    }
    return `${frame(P)}${flowers.join('')}
      <g opacity="0.75">${[0, 1, 2, 3].map((i) => leaf(60 + i * 190, 72, 46, 40 + i * 80, P.accent2)).join('')}</g>
      ${dotRow(90, 630, 1240, 5, P.gold, 30)}`;
  } },

  'jali-band': { label: 'Jali Lattice', body: (P) => {
    const lattice = (y0) => `<g opacity="0.6" stroke="${P.gold}" stroke-width="1.6" fill="none">
      ${[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((c) => `<rect x="${c * 84 - 20}" y="${y0 + r * 34}" width="48" height="48" transform="rotate(45 ${c * 84 + 4} ${y0 + r * 34 + 24})"/>`).join('')).join('')}</g>`;
    return `${lattice(24)}<rect x="0" y="200" width="${W}" height="6" fill="${P.gold}"/>
      <rect x="0" y="206" width="${W}" height="6" fill="${P.accent}" opacity="0.7"/>
      ${lattice(1050)}<rect x="0" y="1044" width="${W}" height="6" fill="${P.gold}"/>
      ${frame(P, 250, 1)}
      ${[120, 360, 600].map((x) => marigold(x, 232, 12, P)).join('')}`;
  } },

  'silk-drape': { label: 'Silk Drape', body: (P) => `
    <path d="M0 940 Q180 860 360 940 Q540 1020 720 940 L720 1280 L0 1280 Z" fill="${P.accent}" opacity="0.85"/>
    <path d="M0 1000 Q180 920 360 1000 Q540 1080 720 1000 L720 1280 L0 1280 Z" fill="${P.accent2}" opacity="0.7"/>
    <path d="M0 940 Q180 860 360 940 Q540 1020 720 940" fill="none" stroke="${P.gold}" stroke-width="7"/>
    <g opacity="0.5" stroke="${P.gold}" stroke-width="1.4" fill="none">
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${i * 100} 1010 Q${i * 100 + 50} 1080 ${i * 100} 1280"/>`).join('')}
    </g>
    <rect x="0" y="0" width="${W}" height="34" fill="${P.gold}" opacity="0.85"/>
    ${dotRow(60, 660, 62, 6, P.gold, 28)}${frame(P, 100, 1)}`,
  },

  'bamboo-grove': { label: 'Bamboo Grove', body: (P) => {
    const stalk = (x) => `<g opacity="0.8"><rect x="${x - 9}" y="120" width="18" height="1140" rx="9" fill="${P.accent2}"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${x - 13}" y="${200 + i * 190}" width="26" height="8" rx="4" fill="${P.dark}" opacity="0.5"/>`).join('')}
      ${[1, 3, 5].map((i) => leaf(x + 9, 250 + i * 170, 60, -25, P.accent)).join('')}
      ${[2, 4].map((i) => leaf(x - 9, 260 + i * 170, 60, 205, P.accent)).join('')}</g>`;
    return `${stalk(60)}${stalk(110)}${stalk(610)}${stalk(660)}${frame(P, 160, 1)}
      ${[240, 480, 720].map((y) => dotRow(180, 540, y, 0, 'none', 1)).join('')}
      ${[360].map((x) => `<g>${leaf(x - 70, 1190, 60, 330, P.accent2)}${leaf(x + 70, 1190, 60, 210, P.accent2)}</g>`).join('')}
      ${diya(360, 1216, 1.6, P)}`;
  } },

  'layered-waves': { label: 'Layered Waves', body: (P) => `
    ${[0, 1, 2, 3].map((i) => `<path d="M0 ${1040 + i * 62} Q180 ${990 + i * 62} 360 ${1040 + i * 62} Q540 ${1090 + i * 62} 720 ${1040 + i * 62} L720 1280 L0 1280 Z" fill="${i % 2 ? P.accent : P.accent2}" opacity="${0.28 + i * 0.16}"/>`).join('')}
    <path d="M0 40 Q180 4 360 40 Q540 76 720 40 L720 0 L0 0 Z" fill="${P.gold}" opacity="0.85"/>
    ${frame(P, 96, 1.4)}
    <g opacity="0.7">${[130, 300, 420, 590].map((x) => `<circle cx="${x}" cy="${150 + (x % 3) * 20}" r="20" fill="${P.gold}" opacity="0.4"/>`).join('')}</g>`,
  },

  'balloon-party': { label: 'Balloon Party', body: (P) => {
    const balloon = (x, y, r0, fill) => `<g><ellipse cx="${x}" cy="${y}" rx="${r0}" ry="${r0 * 1.2}" fill="${fill}"/>
      <ellipse cx="${x - r0 * 0.32}" cy="${y - r0 * 0.4}" rx="${r0 * 0.22}" ry="${r0 * 0.3}" fill="#fff" opacity="0.45"/>
      <path d="M${x - 6} ${y + r0 * 1.18} L${x + 6} ${y + r0 * 1.18} L${x} ${y + r0 * 1.34} Z" fill="${fill}"/>
      <path d="M${x} ${y + r0 * 1.34} q 14 60 -2 118" stroke="${P.ink}" stroke-width="1.6" fill="none" opacity="0.5"/></g>`;
    const r = rnd(3);
    let confetti = '';
    for (let i = 0; i < 46; i++) {
      confetti += `<rect x="${(r() * W).toFixed(0)}" y="${(860 + r() * 380).toFixed(0)}" width="10" height="6" rx="3" fill="${[P.accent, P.gold, P.accent2, P.dark][i % 4]}" opacity="0.75" transform="rotate(${(r() * 90).toFixed(0)} ${(r() * W).toFixed(0)} ${(860 + r() * 380).toFixed(0)})"/>`;
    }
    return `${frame(P)}${balloon(96, 150, 54, P.accent)}${balloon(210, 214, 40, P.gold)}${balloon(618, 154, 52, P.accent2)}${balloon(506, 216, 38, P.accent)}${confetti}
      <path d="M0 1180 Q360 1120 720 1180 L720 1280 L0 1280 Z" fill="${P.dark}" opacity="0.2"/>`;
  } },

  'cake-celebration': { label: 'Cake Celebration', body: (P) => `${frame(P)}
    <g><rect x="230" y="1110" width="260" height="90" rx="10" fill="${P.accent}"/>
      <rect x="252" y="1040" width="216" height="76" rx="10" fill="${P.accent2}"/>
      <rect x="278" y="980" width="164" height="66" rx="10" fill="${P.gold}"/>
      <path d="M230 1122 q 32 22 65 0 q 32 22 65 0 q 32 22 65 0 q 32 22 65 0" fill="none" stroke="${P.light}" stroke-width="8" stroke-linecap="round"/>
      ${[300, 360, 420].map((x) => `<rect x="${x - 4}" y="932" width="8" height="50" fill="${P.light}"/><path d="M${x} 932 q 8 -14 0 -26 q -8 12 0 26" fill="#FFC24A"/>`).join('')}</g>
    <g opacity="0.6">${[120, 600].map((x) => `<circle cx="${x}" cy="1000" r="60" fill="${P.gold}" opacity="0.25"/>`).join('')}</g>
    ${dotRow(70, 650, 60, 5, P.accent, 30)}${dotRow(70, 650, 1250, 5, P.accent, 30)}`,
  },

  'corporate-grid': { label: 'Corporate Grid', body: (P) => `
    <path d="M0 0 L${W} 0 L${W} 150 Q360 230 0 150 Z" fill="${P.accent}" opacity="0.9"/>
    <path d="M0 1280 L0 1120 Q360 1030 ${W} 1120 L${W} 1280 Z" fill="${P.accent2}" opacity="0.85"/>
    <g opacity="0.22" stroke="${P.gold}" stroke-width="1.2" fill="none">
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<circle cx="640" cy="240" r="${40 + i * 34}"/>`).join('')}
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<circle cx="80" cy="1040" r="${40 + i * 34}"/>`).join('')}
    </g>
    <rect x="60" y="300" width="6" height="640" fill="${P.gold}" opacity="0.6"/>
    <rect x="654" y="300" width="6" height="640" fill="${P.gold}" opacity="0.6"/>`,
  },

  'hearts-romance': { label: 'Hearts Romance', body: (P) => {
    const r = rnd(5);
    let hearts = '';
    for (let i = 0; i < 26; i++) {
      const x = 40 + r() * (W - 80); const y = 900 + r() * 340; const s = 0.7 + r() * 1.5;
      hearts += heart(x, y, s, i % 3 ? P.accent : P.gold);
    }
    return `${frame(P)}<g opacity="0.55">${hearts}</g>
      <g opacity="0.9">${heart(360, 180, 3.4, P.accent)}<circle cx="360" cy="180" r="66" fill="none" stroke="${P.gold}" stroke-width="1.6"/></g>
      <path d="M120 260 Q360 340 600 260" fill="none" stroke="${P.gold}" stroke-width="2" opacity="0.7"/>`;
  } },

  'sunburst-horizon': { label: 'Sunburst', body: (P) => {
    let rays = '';
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2;
      rays += `<path d="M360 1140 L${360 + Math.cos(a) * 620} ${1140 + Math.sin(a) * 620} L${360 + Math.cos(a + 0.07) * 620} ${1140 + Math.sin(a + 0.07) * 620} Z" fill="${P.gold}" opacity="0.12"/>`;
    }
    return `${rays}<circle cx="360" cy="1140" r="130" fill="${P.accent}" opacity="0.5"/><circle cx="360" cy="1140" r="92" fill="${P.gold}" opacity="0.75"/>
      <rect x="0" y="1136" width="${W}" height="144" fill="${P.dark}" opacity="0.3"/>
      ${frame(P, 26, 2)}${dotRow(80, 640, 96, 5, P.gold, 32)}
      ${[360].map((x) => petalRing(x, 96, 12, 60, 10, P.accent2, P.gold)).join('')}`;
  } },

  'kalash-auspicious': { label: 'Kalash', body: (P) => {
    const kalash = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-46 0 Q-58 -60 0 -66 Q58 -60 46 0 Z" fill="${P.gold}"/>
      <rect x="-52" y="-8" width="104" height="16" rx="8" fill="${P.accent2}"/>
      <path d="M-24 -66 Q0 -108 24 -66 Z" fill="${P.accent}"/>
      <path d="M-40 -86 q -26 -34 6 -44 q 6 30 -6 44" fill="${P.accent2}"/>
      <path d="M40 -86 q 26 -34 -6 -44 q -6 30 6 44" fill="${P.accent2}"/>
      <path d="M0 -110 q 0 -30 0 -44" stroke="${P.gold}" stroke-width="4" fill="none"/>
      <circle cx="0" cy="-160" r="12" fill="${P.coconut || P.light}"/></g>`;
    return `${frame(P)}${kalash(360, 1210, 1.5)}${kalash(120, 1240, 0.8)}${kalash(600, 1240, 0.8)}
      <g opacity="0.5">${petalRing(360, 140, 14, 90, 12, P.gold, P.accent)}</g>
      ${dotRow(70, 650, 60, 5, P.accent, 30)}`;
  } },

  'crescent-moon': { label: 'Crescent Moon', body: (P) => `
    <g opacity="0.95"><path d="M360 180 A120 120 0 1 1 360 420 A90 90 0 1 0 360 210 Z" fill="${P.gold}"/>
    <circle cx="360" cy="300" r="16" fill="${P.accent}"/></g>
    ${[0,1,2,3,4,5,6,7].map(i => {
      const a = (i/8)*Math.PI*2 - Math.PI/2;
      const x = 360 + Math.cos(a)*200, y = 300 + Math.sin(a)*200;
      return star(x, y, 12 + (i%3)*4, P.gold);
    }).join('')}
    ${frame(P, 24)}
    <g opacity="0.4" stroke="${P.accent}" stroke-width="1.2" fill="none">
      ${[0,1,2,3,4,5].map(r => [0,1,2,3,4,5,6,7].map(c =>
        `<circle cx="${140+c*64}" cy="${900+r*62}" r="24"/>`).join('')).join('')}
    </g>
    <rect x="0" y="1190" width="${W}" height="90" fill="${P.dark}" opacity="0.22"/>
    ${dotRow(80, 640, 1240, 4, P.gold, 36)}`,
  },

  'geometric-star': { label: 'Geometric Star', body: (P) => {
    const r = rnd(17);
    let pattern = '';
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const x = 60 + col * 86 + (row % 2) * 43;
        const y = 880 + row * 66;
        pattern += star(x, y, 18 + r() * 8, row % 2 ? P.gold : P.accent);
      }
    }
    return `${frame(P)}<g opacity="0.75">${pattern}</g>
      <g opacity="0.9">${[180, 360, 540].map(x => star(x, 160, 28, P.gold)).join('')}</g>
      <rect x="0" y="1180" width="${W}" height="100" fill="${P.dark}" opacity="0.2"/>
      ${dotRow(70, 650, 60, 5, P.accent, 30)}`;
  } },

  'lotus-temple': { label: 'Lotus Temple', body: (P) => `
    <g opacity="0.9">${[0,1,2,3,4,5,6,7].map(i => {
      const a = (i/8)*Math.PI - Math.PI/2;
      const px = 360 + Math.cos(a)*160, py = 1100 + Math.sin(a)*80;
      return `<ellipse cx="${px}" cy="${py}" rx="36" ry="56" fill="${i%2?P.accent:P.accent2}" opacity="0.85" transform="rotate(${(i/8)*360-90} ${px} ${py})"/>`;
    }).join('')}</g>
    <circle cx="360" cy="1100" r="40" fill="${P.gold}"/>
    <circle cx="360" cy="1100" r="18" fill="${P.light}"/>
    ${frame(P, 20)}
    <g opacity="0.5">${petalRing(360, 140, 14, 90, 12, P.gold, P.accent)}</g>
    ${dotRow(80, 640, 1240, 4, P.gold, 36)}`,
  },

  'dharma-wheel': { label: 'Dharma Wheel', body: (P) => {
    const spokes = 24;
    let wheel = '';
    for (let i = 0; i < spokes; i++) {
      const a = (i/spokes)*Math.PI*2;
      wheel += `<line x1="360" y1="1100" x2="${360+Math.cos(a)*100}" y2="${1100+Math.sin(a)*100}" stroke="${P.gold}" stroke-width="2.5"/>`;
    }
    return `${frame(P)}<g opacity="0.9">
      <circle cx="360" cy="1100" r="100" fill="none" stroke="${P.gold}" stroke-width="3"/>
      <circle cx="360" cy="1100" r="16" fill="${P.accent}"/>
      ${wheel}</g>
    <g opacity="0.5">${[120, 600].map(x => petalRing(x, 140, 12, 60, 10, P.accent2, P.gold)).join('')}</g>
    ${dotRow(80, 640, 60, 5, P.accent, 30)}${dotRow(80, 640, 1240, 5, P.accent, 30)}`;
  } },

  'pookkalam': { label: 'Pookkalam', body: (P) => {
    const r = rnd(23);
    let flowers = '';
    for (let ring = 0; ring < 5; ring++) {
      const count = 8 + ring * 4;
      const radius = 30 + ring * 28;
      for (let i = 0; i < count; i++) {
        const a = (i/count)*Math.PI*2 + ring*0.3;
        const x = 360 + Math.cos(a)*radius;
        const y = 1100 + Math.sin(a)*radius*0.6;
        const colors = [P.accent, P.accent2, P.gold, P.light];
        flowers += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${8+ring*2}" fill="${colors[(ring+i)%4]}" opacity="0.85"/>`;
      }
    }
    return `${frame(P)}<g opacity="0.9">${flowers}</g>
      <g opacity="0.6">${[120, 600].map(x => leaf(x, 160, 50, x<360?30:330, P.accent2)).join('')}</g>
      ${dotRow(80, 640, 60, 5, P.gold, 30)}`;
  } },

  'kolam-rangoli': { label: 'Kolam Rangoli', body: (P) => {
    const dots = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 10; col++) {
        const x = 80 + col * 64 + (row % 2) * 32;
        const y = 860 + row * 52;
        dots.push(`<circle cx="${x}" cy="${y}" r="3" fill="${P.gold}"/>`);
      }
    }
    return `${frame(P, 20)}<g opacity="0.7">${dots.join('')}</g>
      <g opacity="0.85">${[0,1,2,3,4].map(i => {
        const x = 160 + i * 100;
        return `<path d="M${x} 860 Q${x+30} 900 ${x} 940 Q${x-30} 980 ${x} 1020" stroke="${P.accent}" stroke-width="2.5" fill="none"/>`;
      }).join('')}</g>
      ${marigold(360, 140, 18, P)}${dotRow(80, 640, 1240, 4, P.gold, 36)}`;
  } },

  'gudi-flag': { label: 'Gudi Flag', body: (P) => `
    <g opacity="0.9"><rect x="340" y="200" width="8" height="900" fill="${P.gold}" rx="4"/>
      <rect x="348" y="220" width="120" height="80" rx="4" fill="${P.accent}" opacity="0.9"/>
      <rect x="348" y="220" width="120" height="80" rx="4" fill="none" stroke="${P.gold}" stroke-width="2"/>
      <circle cx="408" cy="260" r="16" fill="${P.gold}"/>
      <path d="M340 200 L330 180 L350 180 Z" fill="${P.accent2}"/></g>
    ${frame(P)}
    <g opacity="0.5">${petalRing(360, 1130, 16, 100, 12, P.accent2, P.gold)}</g>
    ${dotRow(80, 640, 60, 5, P.accent, 30)}${dotRow(80, 640, 1240, 5, P.accent, 30)}`,
  },

  // ─── Christmas designs ───
  'xmas-tree': { label: 'Christmas Tree', body: (P) => {
    const tiers = [0,1,2].map(t => {
      const y = 400 + t * 180, w = 100 - t * 20;
      return `<path d="M360 ${y - 160} L${360 - w} ${y + 40} L${360 + w} ${y + 40} Z" fill="${P.accent2}" opacity="0.9"/>`;
    }).join('');
    const ornaments = [0,1,2,3,4,5].map(i => {
      const x = 200 + i * 70, y = 460 + (i % 3) * 120;
      return `<circle cx="${x}" cy="${y}" r="8" fill="${i%2?P.accent:P.gold}" opacity="0.85"/>`;
    }).join('');
    const stars = [0,1,2,3,4,5,6,7].map(i => {
      const a = (i/8)*Math.PI*2, x = 360+Math.cos(a)*280, y = 1000+Math.sin(a)*180;
      return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="3" fill="${P.gold}"/>`;
    }).join('');
    return `    <g opacity="0.95">${tiers}<rect x="340" y="580" width="40" height="50" rx="4" fill="${P.gold}" opacity="0.8"/>
    <circle cx="360" cy="240" r="14" fill="${P.gold}"/><path d="M360 210 L360 230" stroke="${P.gold}" stroke-width="3"/></g>
    ${ornaments}
    ${frame(P)}
    <g opacity="0.4">${stars}</g>
    ${dotRow(80, 640, 1240, 4, P.gold, 36)}`;
  } },

  'snowflake-pattern': { label: 'Snowflake', body: (P) => {
    const flakes = [];
    for (let i = 0; i < 12; i++) {
      const x = 80 + (i % 4) * 180, y = 880 + Math.floor(i / 4) * 140;
      const s = 20 + (i % 3) * 10;
      let flake = `<g transform="translate(${x} ${y})" opacity="0.85">`;
      for (let j = 0; j < 6; j++) {
        const a = (j / 6) * Math.PI * 2;
        flake += `<line x1="0" y1="0" x2="${Math.cos(a)*s}" y2="${Math.sin(a)*s}" stroke="${P.gold}" stroke-width="2"/>`;
        flake += `<line x1="${Math.cos(a)*s*0.5}" y1="${Math.sin(a)*s*0.5}" x2="${Math.cos(a+0.4)*s*0.7}" y2="${Math.sin(a+0.4)*s*0.7}" stroke="${P.accent}" stroke-width="1.5"/>`;
        flake += `<line x1="${Math.cos(a)*s*0.5}" y1="${Math.sin(a)*s*0.5}" x2="${Math.cos(a-0.4)*s*0.7}" y2="${Math.sin(a-0.4)*s*0.7}" stroke="${P.accent}" stroke-width="1.5"/>`;
      }
      flake += `<circle cx="0" cy="0" r="4" fill="${P.accent}"/></g>`;
      flakes.push(flake);
    }
    return `${frame(P)}<g>${flakes.join('')}</g>
    <g opacity="0.5">${[0,1,2,3,4,5,6,7,8,9].map(i => `<circle cx="${60+Math.random()*600}" cy="${100+Math.random()*200}" r="${2+Math.random()*3}" fill="${P.gold}" opacity="0.6"/>`).join('')}</g>
    ${dotRow(80, 640, 1240, 4, P.accent, 36)}`;
  } },

  'holly-bells': { label: 'Holly & Bells', body: (P) => {
    const bells = [0,1,2,3].map(i => {
      const x = 200 + i * 110, y = 1050 + (i % 2) * 60;
      return `<g transform="translate(${x} ${y})">
        <path d="M0 0 Q-20 -30 -10 -50 Q0 -30 10 -50 Q20 -30 0 0 Z" fill="${P.accent2}" opacity="0.85"/>
        <path d="M0 0 Q20 -20 30 -10 Q10 10 0 0 Z" fill="${P.accent2}" opacity="0.7" transform="rotate(60)"/>
        <circle cx="-5" cy="-20" r="5" fill="${P.accent}"/><circle cx="5" cy="-25" r="4" fill="${P.accent}"/>
        <ellipse cx="0" cy="10" rx="8" ry="12" fill="${P.gold}" opacity="0.9"/>
        <line x1="0" y1="-2" x2="0" y2="10" stroke="${P.dark}" stroke-width="1" opacity="0.5"/>
      </g>`;
    }).join('');
    const dots = [0,1,2,3,4,5].map(i => `<circle cx="${120+i*100}" cy="140" r="6" fill="${P.gold}" opacity="0.7"/>`).join('');
    return `    <g opacity="0.9">${bells}</g>
    ${frame(P, 22)}
    <g opacity="0.45">${dots}</g>
    ${dotRow(80, 640, 60, 5, P.accent, 30)}`;
  } },

  'ornament-garland': { label: 'Ornament Garland', body: (P) => {
    const ornaments = [0,1,2,3,4,5,6,7].map(i => {
      const x = 90 + i * 82, sag = Math.sin((i/7)*Math.PI) * 40;
      const y = 920 + sag;
      const colors = [P.accent, P.accent2, P.gold, P.accent, P.accent2, P.gold, P.accent, P.accent2];
      return `<g transform="translate(${x} ${y})">
        <line x1="0" y1="-30" x2="0" y2="0" stroke="${P.gold}" stroke-width="1.5" opacity="0.7"/>
        <circle cx="0" cy="0" r="18" fill="${colors[i]}" opacity="0.9"/>
        <circle cx="-5" cy="-5" r="5" fill="white" opacity="0.3"/>
        <rect x="-4" y="-22" width="8" height="6" rx="2" fill="${P.gold}"/>
      </g>`;
    }).join('');
    return `    <g opacity="0.9">${ornaments}</g>
    <path d="M90 890 Q200 940 360 920 Q520 900 630 920" fill="none" stroke="${P.gold}" stroke-width="2" opacity="0.6"/>
    ${frame(P)}
    <g opacity="0.4">${petalRing(360, 140, 12, 70, 10, P.gold, P.accent)}</g>
    ${dotRow(80, 640, 1240, 4, P.gold, 36)}`;
  } },

  'candy-cane': { label: 'Candy Cane', body: (P) => {
    const canes = [0,1,2,3].map(i => {
      const x = 180 + i * 130;
      return `<g transform="translate(${x} 1050) rotate(${-15 + i * 10})">
        <path d="M0 0 L0 -160 Q0 -200 40 -200" fill="none" stroke="${P.accent}" stroke-width="16" stroke-linecap="round" opacity="0.85"/>
        <path d="M0 0 L0 -160 Q0 -200 40 -200" fill="none" stroke="${P.light}" stroke-width="16" stroke-dasharray="12 12" stroke-linecap="round" opacity="0.7"/>
      </g>`;
    }).join('');
    const dots = [0,1,2,3,4,5].map(i => `<circle cx="${100+i*110}" cy="140" r="8" fill="${i%2?P.accent:P.gold}" opacity="0.7"/>`).join('');
    return `    <g opacity="0.9">${canes}</g>
    ${frame(P, 20)}
    <g opacity="0.5">${dots}</g>
    ${dotRow(80, 640, 1240, 4, P.gold, 36)}`;
  } },

  'star-bethlehem': { label: 'Star of Bethlehem', body: (P) => {
    const rays = [0,1,2,3,4,5,6,7].map(i => {
      const a = (i/8)*Math.PI*2, r = 200 + (i%3)*40;
      const x = 360+Math.cos(a)*r, y = 390+Math.sin(a)*r*0.6;
      return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${3+(i%3)*2}" fill="${P.gold}" opacity="0.6"/>`;
    }).join('');
    return `    <g opacity="0.95">
    <path d="M360 200 L380 340 L520 360 L400 440 L430 580 L360 500 L290 580 L320 440 L200 360 L340 340 Z" fill="${P.gold}" opacity="0.9"/>
    <path d="M360 240 L372 340 L472 356 L390 420 L412 530 L360 476 L308 530 L330 420 L248 356 L348 340 Z" fill="${P.accent}" opacity="0.7"/>
    <circle cx="360" cy="390" r="20" fill="${P.light}" opacity="0.8"/>
    </g>
    ${rays}
    ${frame(P)}
    ${dotRow(80, 640, 1240, 4, P.accent, 36)}`;
  } },

  'poinsettia': { label: 'Poinsettia', body: (P) => {
    const petals = [];
    for (let ring = 0; ring < 3; ring++) {
      const count = 8 + ring * 2;
      const r = 60 + ring * 40;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + ring * 0.2;
        const x = 360 + Math.cos(a) * r;
        const y = 1080 + Math.sin(a) * r * 0.6;
        const colors = [P.accent, P.accent2, P.gold];
        petals.push(`<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${18-ring*3}" ry="${30-ring*5}" fill="${colors[ring]}" opacity="0.85" transform="rotate(${(a*180/Math.PI).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`);
      }
    }
    return `${frame(P)}<g opacity="0.9">${petals.join('')}
    <circle cx="360" cy="1080" r="16" fill="${P.gold}"/>
    <circle cx="354" cy="1076" r="4" fill="${P.accent}"/><circle cx="366" cy="1076" r="4" fill="${P.accent}"/>
    <circle cx="360" cy="1086" r="4" fill="${P.accent2}"/></g>
    <g opacity="0.45">${[120, 600].map(x => `<path d="M${x} 140 Q${x+20} 100 ${x+40} 140 Q${x+20} 180 ${x} 140" fill="${P.accent2}" opacity="0.7"/>`).join('')}</g>
    ${dotRow(80, 640, 1240, 4, P.gold, 36)}`;
  } },

  'santa-silhouette': { label: 'Santa Night', body: (P) => {
    const stars = [0,1,2,3,4,5,6,7,8,9,10,11].map(i => `<circle cx="${60+i*55}" cy="${100+Math.sin(i*0.8)*30}" r="${1.5+Math.random()*2}" fill="${P.gold}" opacity="0.7"/>`).join('');
    return `    <g opacity="0.9">
    <path d="M100 1000 Q200 960 300 980 Q400 940 500 970 Q600 950 650 990 L650 1050 L100 1050 Z" fill="${P.dark}" opacity="0.3"/>
    <circle cx="540" cy="200" r="60" fill="${P.gold}" opacity="0.15"/>
    <circle cx="540" cy="200" r="40" fill="${P.gold}" opacity="0.1"/>
    <g transform="translate(360 300) scale(1.2)">
      <ellipse cx="0" cy="0" rx="30" ry="36" fill="${P.accent}" opacity="0.9"/>
      <path d="M-30 -10 Q-40 -40 0 -50 Q40 -40 30 -10" fill="${P.accent}" opacity="0.9"/>
      <circle cx="0" cy="-50" r="10" fill="white" opacity="0.9"/>
      <rect x="-35" y="-15" width="70" height="10" rx="5" fill="white" opacity="0.8"/>
    </g>
    </g>
    ${stars}
    ${frame(P, 24)}
    ${dotRow(80, 640, 1240, 4, P.accent, 36)}`;
  } },

  'gingerbread': { label: 'Gingerbread', body: (P) => {
    const canes = [0,1,2,3,4,5].map(i => {
      const x = 140 + i * 90;
      return `<g transform="translate(${x} 160) scale(0.5)"><path d="M0 0 L0 -30 Q0 -50 20 -50" fill="none" stroke="${P.accent}" stroke-width="8" stroke-linecap="round" opacity="0.6"/><path d="M0 0 L0 -30 Q0 -50 20 -50" fill="none" stroke="${P.light}" stroke-width="8" stroke-dasharray="6 6" stroke-linecap="round" opacity="0.5"/></g>`;
    }).join('');
    return `    <g opacity="0.9">
    <g transform="translate(360 1050)">
      <ellipse cx="0" cy="0" rx="50" ry="60" fill="${P.accent}" opacity="0.85" rx="20"/>
      <circle cx="-18" cy="-20" r="5" fill="${P.gold}"/><circle cx="18" cy="-20" r="5" fill="${P.gold}"/>
      <circle cx="0" cy="-5" r="4" fill="${P.accent2}"/>
      <circle cx="-12" cy="15" r="4" fill="${P.gold}"/><circle cx="12" cy="15" r="4" fill="${P.gold}"/>
      <path d="M-15 30 Q0 40 15 30" fill="none" stroke="${P.gold}" stroke-width="2"/>
      <rect x="-40" y="-50" width="16" height="40" rx="8" fill="${P.accent}" opacity="0.8" transform="rotate(-20 -40 -50)"/>
      <rect x="24" y="-50" width="16" height="40" rx="8" fill="${P.accent}" opacity="0.8" transform="rotate(20 24 -50)"/>
    </g>
    </g>
    ${canes}
    ${frame(P)}
    ${dotRow(80, 640, 1240, 4, P.gold, 36)}`;
  } },
};

// ─────────────────────────── occasion mapping ──────────────────────────
// design keys, palettes and name pools per occasion so cards look intentional
const OCCASIONS = {
  wedding: { label: 'Weddings', designs: ['temple-arch', 'marble-pillar', 'mandala', 'silk-drape', 'paisley-corner', 'toran-garland', 'floral-wreath', 'kalash-auspicious', 'peacock-fan', 'hearts-romance', 'sunburst-horizon'], palettes: ['deep-maroon', 'marigold-royale', 'rani-pink', 'ivory-jade', 'rose-gold', 'emerald-ivory', 'peacock-teal', 'saffron-temple', 'terracotta-raj', 'cocoa-cream', 'royal-purple', 'navy-silver', 'champagne-blush', 'ruby-wine', 'dusty-lavender'],
    names: ['Royal Mandap', 'Sacred Vows', 'Eternal Bond', 'Granite Palace', 'Golden Ritual', 'Blessed Union', 'Silk Ceremony', 'Heritage Wedding', 'Divine Alliance', 'Grand Kanyadaan', 'Saptapadi', 'Muhurat Celebration'], color: 'royal-maroon' },
  engagement: { label: 'Engagement', designs: ['hearts-romance', 'mandala', 'paisley-corner', 'toran-garland', 'floral-wreath', 'balloon-party', 'sunburst-horizon'], palettes: ['rani-pink', 'rose-gold', 'pastel-mint', 'peacock-teal', 'marigold-royale', 'carnival-pop', 'royal-purple', 'dusty-lavender', 'champagne-blush'],
    names: ['Ring Ceremony', 'Promise Night', 'Sagai Soiree', 'Forever Begins', 'Matched Hearts', 'Glowing Vows'], color: 'rani-pink' },
  haldi: { label: 'Haldi', designs: ['toran-garland', 'diya-lights', 'mandala', 'rangoli-border', 'lotus-pond', 'silk-drape', 'floral-wreath', 'sunburst-horizon'], palettes: ['marigold-royale', 'saffron-temple', 'sunrise-coral', 'ivory-jade', 'pastel-mint'],
    names: ['Haldi Harmony', 'Golden Hands', 'Turmeric Glow', 'Mehndi & Haldi', 'Sunlit Blessings'], color: 'marigold' },
  mehndi: { label: 'Mehndi', designs: ['paisley-corner', 'jali-band', 'mandala', 'rangoli-border', 'bamboo-grove', 'floral-wreath', 'peacock-fan', 'lotus-pond'], palettes: ['emerald-ivory', 'ivory-jade', 'terracotta-raj', 'peacock-teal', 'saffron-temple', 'cocoa-cream'],
    names: ['Mehndi Melody', 'Henna Nights', 'Green Elegance', 'Intricate Love', 'Sohera Sanskriti'], color: 'emerald' },
  sangeet: { label: 'Sangeet', designs: ['diya-lights', 'star-night', 'mandala', 'peacock-fan', 'rangoli-border', 'balloon-party', 'silk-drape'], palettes: ['midnight-gold', 'plum-noir', 'rani-pink', 'peacock-teal', 'carnival-pop', 'deep-maroon'],
    names: ['Sangeet Sparkle', 'Dhun & Dhol', 'Raas Raat', 'Melting Beats', 'Tarana Night'], color: 'magenta' },
  reception: { label: 'Reception', designs: ['marble-pillar', 'corporate-grid', 'paisley-corner', 'silk-drape', 'floral-wreath', 'hearts-romance', 'layered-waves'], palettes: ['ivory-jade', 'pastel-mint', 'royal-blue', 'rose-gold', 'midnight-gold', 'terracotta-raj', 'navy-silver', 'indigo-dream', 'olive-bronze'],
    names: ['Reception Royale', 'Evening Grace', 'Thank-You Soiree', 'Grand Gathering'], color: 'peacock-teal' },
  ganpati: { label: 'Ganpati', designs: ['temple-arch', 'mandala', 'toran-garland', 'rangoli-border', 'diya-lights', 'kalash-auspicious', 'silk-drape', 'lotus-pond', 'paisley-corner', 'gudi-flag'], palettes: ['marigold-royale', 'saffron-temple', 'deep-maroon', 'sunrise-coral', 'ivory-jade', 'terracotta-raj', 'ruby-wine', 'olive-bronze'],
    names: ['Ganpati Bappa', 'Morya Mandap', 'Vinayaka Vibhava', 'Ganesh Utsav', 'Sthapana Splendour'], color: 'saffron' },
  navratri: { label: 'Navratri', designs: ['diya-lights', 'mandala', 'rangoli-border', 'toran-garland', 'peacock-fan', 'star-night', 'kolam-rangoli'], palettes: ['rani-pink', 'marigold-royale', 'deep-maroon', 'peacock-teal', 'saffron-temple', 'carnival-pop', 'ruby-wine', 'royal-purple'],
    names: ['Garba Nights', 'Nine Nights', 'Dandiya Dhamaka', 'Mata Ki Mahima', 'Navratri Utsav'], color: 'rani-pink' },
  'durga-puja': { label: 'Durga Puja', designs: ['temple-arch', 'mandala', 'toran-garland', 'silk-drape', 'diya-lights', 'sunburst-horizon', 'rangoli-border', 'kolam-rangoli'], palettes: ['deep-maroon', 'saffron-temple', 'marigold-royale', 'terracotta-raj', 'rani-pink', 'ruby-wine', 'navy-silver'],
    names: ['Durga Pujo', 'Bengal Blessings', 'Shakti Swaroopa', 'Ashtiya Utsav', 'Devi Aagomon'], color: 'scarlet' },
  diwali: { label: 'Diwali', designs: ['diya-lights', 'rangoli-border', 'mandala', 'star-night', 'paisley-corner', 'jali-band', 'toran-garland', 'lotus-pond', 'gudi-flag', 'kolam-rangoli'], palettes: ['midnight-gold', 'deep-maroon', 'marigold-royale', 'plum-noir', 'peacock-teal', 'saffron-temple', 'ruby-wine', 'royal-purple', 'olive-bronze'],
    names: ['Deepavali Glow', 'Festival of Lights', 'Rangoli Radiance', 'Kanakdhara Night', 'Dhanteras Cheer'], color: 'gold-leaf' },
  holi: { label: 'Holi', designs: ['balloon-party', 'rangoli-border', 'toran-garland', 'layered-waves', 'sunburst-horizon', 'diya-lights'], palettes: ['carnival-pop', 'rani-pink', 'peacock-teal', 'sunrise-coral', 'emerald-ivory', 'marigold-royale'],
    names: ['Holi Hai', 'Rangeelo Utsav', 'Dulandi Dhamaka', 'Phag Fun'], color: 'magenta' },
  janmashtami: { label: 'Janmashtami', designs: ['peacock-fan', 'mandala', 'star-night', 'lotus-pond', 'floral-wreath', 'rangoli-border'], palettes: ['peacock-teal', 'emerald-ivory', 'midnight-gold', 'marigold-royale', 'ivory-jade'],
    names: ['Makhan Chor', 'Bal Gopal', 'Jhulan Utsav', 'Dahi Handi', 'Krishna Janmashtami'], color: 'peacock-teal' },
  birthday: { label: 'Birthdays', designs: ['balloon-party', 'cake-celebration', 'rangoli-border', 'toran-garland', 'sunburst-horizon', 'layered-waves'], palettes: ['carnival-pop', 'rani-pink', 'pastel-mint', 'marigold-royale', 'peacock-teal', 'sunrise-coral', 'rose-gold', 'teal-lagoon', 'indigo-dream', 'cerulean-pearl'],
    names: ['Birthday Bash', 'Little Star', 'Milestone Party', 'Cake & Confetti', 'Turning Grand'], color: 'rani-pink' },
  'griha-pravesh': { label: 'Griha Pravesh', designs: ['kalash-auspicious', 'temple-arch', 'marble-pillar', 'toran-garland', 'rangoli-border', 'corporate-grid'], palettes: ['ivory-jade', 'marigold-royale', 'saffron-temple', 'terracotta-raj', 'cocoa-cream'],
    names: ['Griha Pravesh', 'New Home Blessings', 'Vastu Shanti', 'Aangan Ki Pehchan'], color: 'saffron' },
  'maha-shivratri': { label: 'Maha Shivratri', designs: ['temple-arch', 'mandala', 'star-night', 'kalash-auspicious', 'sunburst-horizon'], palettes: ['midnight-gold', 'peacock-teal', 'ivory-jade', 'plum-noir'],
    names: ['Maha Shivratri', 'Om Namah Shivaya', 'Shiva Raatri', 'Rudra Abhishek'], color: 'peacock-blue' },
  dussehra: { label: 'Dussehra', designs: ['temple-arch', 'silk-drape', 'diya-lights', 'mandala', 'rangoli-border', 'marble-pillar'], palettes: ['deep-maroon', 'marigold-royale', 'saffron-temple', 'midnight-gold'],
    names: ['Dussehra Vijay', 'Navratri Shaurya', 'Buraai Par Jeet', 'Ramlila Utsav'], color: 'saffron' },
  'karva-chauth': { label: 'Karva Chauth', designs: ['hearts-romance', 'mandala', 'paisley-corner', 'diya-lights', 'floral-wreath'], palettes: ['rani-pink', 'deep-maroon', 'marigold-royale', 'plum-noir'],
    names: ['Karva Chauth', 'Sargi Suhaag', 'Chand Ka Chehra'], color: 'rani-pink' },
  teej: { label: 'Teej & Festivals', designs: ['toran-garland', 'peacock-fan', 'layered-waves', 'lotus-pond', 'mandala'], palettes: ['emerald-ivory', 'peacock-teal', 'marigold-royale', 'rani-pink'],
    names: ['Hariyali Teej', 'Teej Tyohaar', 'Shravan Splendour'], color: 'emerald' },
  'bhai-dooj': { label: 'Bhai Dooj', designs: ['rangoli-border', 'mandala', 'toran-garland', 'paisley-corner'], palettes: ['marigold-royale', 'rani-pink', 'deep-maroon', 'pastel-mint'],
    names: ['Bhai Dooj', 'Bhaubeej Blessings', 'Rakhi & Dooj'], color: 'marigold' },
  chhath: { label: 'Chhath', designs: ['sunburst-horizon', 'lotus-pond', 'layered-waves', 'temple-arch'], palettes: ['sunrise-coral', 'marigold-royale', 'deep-maroon', 'saffron-temple'],
    names: ['Chhath Puja', 'Surya Arghya', 'Nahay Khay'], color: 'saffron' },
  pongal: { label: 'Pongal & Sankranti', designs: ['sunburst-horizon', 'rangoli-border', 'kalash-auspicious', 'paisley-corner', 'kolam-rangoli', 'pookkalam'], palettes: ['marigold-royale', 'saffron-temple', 'emerald-ivory', 'terracotta-raj', 'olive-bronze', 'ruby-wine'],
    names: ['Pongal Petu', 'Sankranti Splendour', 'Thai Pirappu', 'Bhogi Bonfire'], color: 'saffron' },
  onam: { label: 'Onam', designs: ['floral-wreath', 'lotus-pond', 'layered-waves', 'peacock-fan', 'silk-drape', 'pookkalam', 'kolam-rangoli'], palettes: ['emerald-ivory', 'peacock-teal', 'ivory-jade', 'sunrise-coral', 'sage-eucalyptus', 'teal-lagoon'],
    names: ['Onam Sadhya', 'Pookkalam Pride', 'Maveli Njaan', 'Haritham Onams'], color: 'emerald' },
  'gudi-padwa': { label: 'New Year & Ugadi', designs: ['toran-garland', 'temple-arch', 'kalash-auspicious', 'rangoli-border', 'mandala', 'jali-band', 'gudi-flag'], palettes: ['marigold-royale', 'saffron-temple', 'deep-maroon', 'ivory-jade', 'olive-bronze', 'ruby-wine'],
    names: ['Gudi Padwa', 'Ugadi Puja', 'Yadi Am Bhanu', 'Chaitra Navratri'], color: 'saffron' },
  'ram-navami': { label: 'Ram Navami', designs: ['temple-arch', 'marble-pillar', 'mandala', 'diya-lights'], palettes: ['saffron-temple', 'marigold-royale', 'deep-maroon', 'terracotta-raj'],
    names: ['Ram Navami', 'Sita Ram', 'Kalyotsav', 'Maryada Purushottam'], color: 'saffron' },
  'saraswati-puja': { label: 'Saraswati Puja', designs: ['lotus-pond', 'floral-wreath', 'mandala', 'peacock-fan', 'silk-drape'], palettes: ['ivory-jade', 'pastel-mint', 'sky-trust', 'rose-gold'],
    names: ['Saraswati Vandana', 'Vasant Panchami', 'Gyanotsav', 'Basant Utsav'], color: 'peacock-blue' },
  annaprashan: { label: 'Annaprashan & Namkaran', designs: ['kalash-auspicious', 'lotus-pond', 'mandala', 'paisley-corner', 'toran-garland'], palettes: ['marigold-royale', 'rani-pink', 'pastel-mint', 'ivory-jade'],
    names: ['Annaprashan', 'Namkaran Sanskar', 'Mukh Bhaat', 'First Rice Ceremony'], color: 'marigold' },
  retirement: { label: 'Retirement', designs: ['corporate-grid', 'sunburst-horizon', 'marble-pillar', 'layered-waves'], palettes: ['royal-blue', 'cocoa-cream', 'ivory-jade', 'sky-trust', 'peacock-teal'],
    names: ['Retirement Gala', 'Silver Jubilee Farewell', 'Thank You Sir', 'Chapter Two'], color: 'royal-blue' },
  farewell: { label: 'Farewell', designs: ['star-night', 'layered-waves', 'corporate-grid', 'balloon-party'], palettes: ['midnight-gold', 'sky-trust', 'carnival-pop', 'royal-blue'],
    names: ['Farewell Fete', 'Alvida Night', 'Bon Voyage', 'Last Bench Days'], color: 'peacock-blue' },
  christmas: { label: 'Christmas', designs: ['xmas-tree', 'snowflake-pattern', 'holly-bells', 'ornament-garland', 'candy-cane', 'star-bethlehem', 'poinsettia', 'santa-silhouette', 'gingerbread', 'star-night', 'layered-waves', 'mandala', 'floral-wreath', 'hearts-romance', 'silk-drape', 'sunburst-horizon', 'moorish-arch', 'temple-arch', 'paisley-corner', 'rangoli-border', 'corporate-grid'], palettes: ['xmas-classic', 'xmas-elegant', 'xmas-winter', 'xmas-burgundy', 'xmas-forest', 'xmas-royal', 'forest-night', 'emerald-ivory', 'deep-maroon', 'ruby-wine', 'navy-silver', 'midnight-gold', 'plum-noir', 'royal-purple', 'dusty-lavender', 'champagne-blush', 'ivory-jade', 'carnival-pop'],
    names: ['Merry Christmas', 'Noel Night', 'Silent Night Supper', 'Christmas Carols', 'Joy to the World', 'Star of Bethlehem', 'Holly Jolly Christmas', 'Santa\'s Workshop', 'Winter Wonderland', 'Xmas Gala', 'Christmas Eve Dinner', 'Festive Feast', 'Holiday Celebration', 'Christmas Morning', 'Jingle Bell Bash', 'Nutcracker Night', 'Christmas Lights', 'Deck the Halls', 'O Christmas Tree', 'We Wish You'], color: 'emerald' },
  'new-year': { label: 'New Year', designs: ['star-night', 'diya-lights', 'corporate-grid', 'balloon-party', 'sunburst-horizon'], palettes: ['midnight-gold', 'plum-noir', 'royal-blue', 'carnival-pop'],
    names: ['New Year Eve', 'Naya Saal', 'Countdown Party', 'Toast to Tomorrow'], color: 'gold-leaf' },
  'makar-sankranti': { label: 'Sankranti', designs: ['sunburst-horizon', 'rangoli-border', 'kalash-auspicious', 'toran-garland', 'layered-waves', 'kolam-rangoli'], palettes: ['marigold-royale', 'saffron-temple', 'sunrise-coral', 'sky-trust', 'emerald-ivory', 'olive-bronze'],
    names: ['Makar Sankranti', 'Tilgul Tyohaar', 'Kite Utsav', 'Bhog Celebration'], color: 'marigold' },
  dhanteras: { label: 'Dhanteras', designs: ['diya-lights', 'mandala', 'jali-band', 'kalash-auspicious', 'star-night'], palettes: ['midnight-gold', 'marigold-royale', 'deep-maroon', 'cocoa-cream', 'saffron-temple'],
    names: ['Dhanteras Laabh', 'Diyas & Gold', 'Lakshmi Puja', 'Dhan Terah'], color: 'gold-leaf' },
  'raksha-bandhan': { label: 'Raksha Bandhan', designs: ['toran-garland', 'rangoli-border', 'paisley-corner', 'hearts-romance', 'floral-wreath'], palettes: ['rani-pink', 'marigold-royale', 'carnival-pop', 'peacock-teal', 'ivory-jade'],
    names: ['Raksha Bandhan', 'Bhaiya Bhabhi', 'Rakhi Rituals', 'Thread of Love'], color: 'rani-pink' },
  anniversary: { label: 'Anniversary', designs: ['hearts-romance', 'floral-wreath', 'mandala', 'marble-pillar', 'star-night', 'silk-drape'], palettes: ['rose-gold', 'rani-pink', 'midnight-gold', 'ivory-jade', 'plum-noir', 'deep-maroon', 'champagne-blush', 'dusty-lavender', 'royal-purple'],
    names: ['Golden Anniversary', 'Silver Jubilee', 'Ten Years Of Us', 'Renewal Of Vows'], color: 'dusty-rose' },
  'baby-shower': { label: 'Baby Shower', designs: ['balloon-party', 'floral-wreath', 'lotus-pond', 'layered-waves', 'cake-celebration'], palettes: ['pastel-mint', 'rani-pink', 'sky-trust', 'rose-gold', 'carnival-pop'],
    names: ['Little Wonder', 'Gender Reveal', 'Baby Blessings', 'Welcome Baby'], color: 'rose-blush' },
  naamkaran: { label: 'Naamkaran', designs: ['kalash-auspicious', 'mandala', 'toran-garland', 'rangoli-border', 'lotus-pond'], palettes: ['marigold-royale', 'ivory-jade', 'rani-pink', 'saffron-temple', 'pastel-mint'],
    names: ['Naamkaran Sanskar', 'Naming Ceremony', 'Sweet Name Day', 'Barakhana Baraat'], color: 'marigold' },
  satyanarayan: { label: 'Satyanarayan Puja', designs: ['temple-arch', 'kalash-auspicious', 'diya-lights', 'mandala', 'toran-garland'], palettes: ['saffron-temple', 'marigold-royale', 'ivory-jade', 'deep-maroon'],
    names: ['Satyanarayan Katha', 'Satyanarayan Vrat', 'Prasad Samaroh', 'Purnima Puja'], color: 'saffron' },
  'eid-ul-fitr': { label: 'Eid ul-Fitr', designs: ['moorish-arch', 'jali-band', 'star-night', 'floral-wreath', 'rangoli-border', 'crescent-moon', 'geometric-star'], palettes: ['emerald-ivory', 'midnight-gold', 'ivory-jade', 'plum-noir', 'peacock-teal', 'teal-lagoon', 'navy-silver', 'sage-eucalyptus'],
    names: ['Eid Mubarak', 'Meethi Eid', 'Chand Raat', 'Sheer Khurma Night'], color: 'emerald' },
  'eid-ul-adha': { label: 'Bakrid', designs: ['moorish-arch', 'jali-band', 'star-night', 'layered-waves', 'marble-pillar', 'crescent-moon', 'geometric-star'], palettes: ['cocoa-cream', 'forest-night', 'midnight-gold', 'terracotta-raj', 'olive-bronze', 'navy-silver'],
    names: ['Eid-ul-Adha', 'Bakrid Mubarak', 'Qurbani Utsav'], color: 'forest' },
  muharram: { label: 'Muharram', designs: ['jali-band', 'moorish-arch', 'star-night', 'layered-waves', 'crescent-moon', 'geometric-star'], palettes: ['forest-night', 'plum-noir', 'midnight-gold', 'cocoa-cream', 'navy-silver', 'sage-eucalyptus'],
    names: ['Muharram Majlis', 'Ashura Yaad', '10 Muharram'], color: 'forest' },
  'milad-un-nabi': { label: 'Milad-un-Nabi', designs: ['moorish-arch', 'star-night', 'jali-band', 'floral-wreath', 'crescent-moon', 'geometric-star'], palettes: ['emerald-ivory', 'royal-blue', 'midnight-gold', 'ivory-jade', 'teal-lagoon', 'cerulean-pearl'],
    names: ['Milad-un-Nabi', 'Jashn-e-Huzoori', 'Bari Mubarak', 'Roohani Jashn'], color: 'emerald' },
  easter: { label: 'Easter', designs: ['floral-wreath', 'lotus-pond', 'sunburst-horizon', 'layered-waves'], palettes: ['pastel-mint', 'sky-trust', 'sunrise-coral', 'ivory-jade'],
    names: ['Easter Blessings', 'Egg Hunt Day', 'Resurrection Sunday'], color: 'mint' },
  'good-friday': { label: 'Good Friday', designs: ['marble-pillar', 'jali-band', 'floral-wreath', 'corporate-grid'], palettes: ['ivory-jade', 'cocoa-cream', 'sky-trust', 'plum-noir'],
    names: ['Good Friday Service', 'Passion Day', 'Stations Of Cross'], color: 'graphite' },
  gurpurab: { label: 'Gurpurab', designs: ['jali-band', 'star-night', 'floral-wreath', 'rangoli-border', 'mandala'], palettes: ['saffron-temple', 'midnight-gold', 'ivory-jade', 'royal-blue', 'emerald-ivory'],
    names: ['Guru Nanak Jayanti', 'Gurpurab Glow', 'Parkash Utsav', 'Nishan Sahar'], color: 'peacock-teal' },
  'buddha-purnima': { label: 'Buddha Purnima', designs: ['lotus-pond', 'mandala', 'peacock-fan', 'sunburst-horizon', 'star-night', 'dharma-wheel', 'lotus-temple'], palettes: ['ivory-jade', 'emerald-ivory', 'saffron-temple', 'sky-trust', 'sage-eucalyptus'],
    names: ['Buddha Purnima', 'Bodhi Day', 'Dhamma Chakra', 'Vaishakh Full Moon'], color: 'emerald' },
  'mahavir-jayanti': { label: 'Mahavir Jayanti', designs: ['mandala', 'lotus-pond', 'jali-band', 'kalash-auspicious', 'rangoli-border', 'lotus-temple', 'dharma-wheel'], palettes: ['ivory-jade', 'pastel-mint', 'marigold-royale', 'cocoa-cream', 'sage-eucalyptus', 'champagne-blush'],
    names: ['Mahavir Jayanti', 'Keval Gyan', '24th Tirthankar', 'Ahimsa Utsav'], color: 'peacock-teal' },
  paryushan: { label: 'Paryushan', designs: ['mandala', 'rangoli-border', 'lotus-pond', 'jali-band', 'paisley-corner', 'lotus-temple', 'dharma-wheel'], palettes: ['ivory-jade', 'pastel-mint', 'midnight-gold', 'cocoa-cream', 'sage-eucalyptus', 'dusty-lavender'],
    names: ['Paryushan Parva', 'Kshama Prarthna', 'Ayambil Ols', 'Micchami Dukkadam'], color: 'forest' },
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// ─────────────────────────── layout variants ───────────────────────────
// Four compositions over the same motif library: gradient direction, top and
// bottom ornamentation, and whether a soft glow sits behind the text band.
// Nothing is ever drawn between y=260 and y=680, which is where the invitation
// copy lands, so every variant keeps the auto-layout legible.
const LAYOUTS = {
  classic: {
    name: 'Classic',
    grad: [0, 0, 0, 1],
    defs: () => '',
    decor: () => '',
  },
  arch: {
    name: 'Arch',
    grad: [0, 0, 1, 1],
    defs: () => '',
    decor: (P) => `
      <path d="M140 0 Q140 196 360 196 Q580 196 580 0" fill="none" stroke="${P.gold}" stroke-width="6" opacity="0.85"/>
      <path d="M96 0 Q96 252 360 252 Q624 252 624 0" fill="none" stroke="${P.accent}" stroke-width="2.5" opacity="0.5"/>
      ${[180, 260, 360, 460, 540].map((x) => `<circle cx="${x}" cy="${200 - Math.abs(360 - x) * 0.28}" r="7" fill="${P.accent}"/>`).join('')}
      <rect x="0" y="1196" width="${W}" height="9" fill="${P.gold}" opacity="0.6"/>
      <rect x="0" y="1218" width="${W}" height="62" fill="${P.dark}" opacity="0.18"/>
      ${dotRow(90, 630, 1249, 5, P.gold, 46)}`,
  },
  border: {
    name: 'Frame',
    grad: [0, 0, 0, 1],
    defs: () => '',
    decor: (P) => `
      ${frame(P, 26, 3)}
      <rect x="54" y="54" width="${W - 108}" height="${H - 108}" fill="none" stroke="${P.accent}" stroke-width="1.4" opacity="0.55"/>
      ${[[44, 44], [676, 44], [44, 1236], [676, 1236]].map(([x, y]) => marigold(x, y, 26, P) + petalRing(x, y, 15, 34, 8, P.gold, P.accent2)).join('')}`,
  },
  glow: {
    name: 'Soft Glow',
    grad: [0, 1, 1, 0],
    defs: (P, id) => `<radialGradient id="glow${id}" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${P.light}" stop-opacity="0.92"/><stop offset="0.62" stop-color="${P.light}" stop-opacity="0.5"/><stop offset="1" stop-color="${P.light}" stop-opacity="0"/>
  </radialGradient>`,
    decor: (P, id) => `
      <ellipse cx="360" cy="450" rx="356" ry="330" fill="url(#glow${id})"/>
      <ellipse cx="360" cy="450" rx="300" ry="272" fill="none" stroke="${P.gold}" stroke-width="1.2" opacity="0.35"/>
      <path d="M0 1130 L${W} 1058 L${W} 1280 L0 1280 Z" fill="${P.gold}" opacity="0.14"/>
      ${dotRow(90, 630, 1218, 4, P.gold, 42)}`,
  },
};

const buildSvg = (designKey, palKey, layoutKey) => {
  const P = PALETTES[palKey];
  const design = DESIGNS[designKey];
  const layout = LAYOUTS[layoutKey] || LAYOUTS.classic;
  const gid = `${designKey}-${palKey}-${layoutKey}`.replace(/[^a-z0-9]/g, '');
  const [gx1, gy1, gx2, gy2] = layout.grad;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="bg${gid}" x1="${gx1}" y1="${gy1}" x2="${gx2}" y2="${gy2}">
    <stop offset="0" stop-color="${P.bg1}"/><stop offset="1" stop-color="${P.bg2}"/>
  </linearGradient>
  ${layout.defs(P, gid)}
</defs>
<rect width="${W}" height="${H}" fill="url(#bg${gid})"/>
${design.body(P)}
${layout.decor(P, gid)}
</svg>`;
};

const SAMPLE_DATES = ['Sunday, 15 November 2026', 'Saturday, 5 December 2026', 'Monday, 11 January 2027', 'Friday, 20 February 2027', 'Sunday, 8 March 2026', 'Thursday, 24 September 2026'];
const VENUES = ['Shree Mandir Premises, Pune', 'Grand Ballroom, Taj Mumbai', 'Community Hall, Sector 15, Noida', 'Residence, Vasant Vihar, New Delhi', 'Banquet Lawn, Jaipur', 'The Leela Palace, New Delhi'];

const svgSafe = (s) => s;
void svgSafe;

fs.mkdirSync(OUT_DIR, { recursive: true });

// The art folder is owned entirely by this script, so clear previous output
// before regenerating — otherwise stale cards pile up in /dist.
if (OUT_DIR.endsWith(path.join('templates', 'art'))) {
  fs.readdirSync(OUT_DIR).filter((f) => /^art-.*\.svg$/.test(f)).forEach((f) => fs.unlinkSync(path.join(OUT_DIR, f)));
}
// Curated output: for every occasion we build the full design x palette x layout
// cross-product, shuffle it deterministically and take the first N, so the
// cards a user browses are spread across motifs, colours and compositions.
const PER_OCCASION = 100;

const rows = [];
let count = 0;
const writtenFiles = new Set();
const usedSlugs = new Set();
const LANGS = ['english', 'hindi', 'english', 'marathi', 'english', 'hindi'];
const LAYOUT_KEYS = Object.keys(LAYOUTS);

Object.entries(OCCASIONS).forEach(([cat, cfg], oi) => {
  const designs = cfg.designs.filter((d) => DESIGNS[d]);
  const palettes = cfg.palettes.filter((p) => PALETTES[p]);
  // Build unique design+palette combos only — each pair appears at most once
  // so every template looks visually distinct. Layout is assigned round-robin.
  const combos = [];
  const seen = new Set();
  designs.forEach((d) => palettes.forEach((p) => {
    const key = `${d}::${p}`;
    if (!seen.has(key)) { seen.add(key); combos.push([d, p]); }
  }));
  const shuffle = rnd(oi * 977 + 13);
  for (let i = combos.length - 1; i > 0; i--) {
    const j = Math.floor(shuffle() * (i + 1));
    [combos[i], combos[j]] = [combos[j], combos[i]];
  }
  combos.slice(0, PER_OCCASION).forEach(([designKey, palKey], i) => {
    // Assign layout round-robin so we get variety across compositions
    const layoutKey = LAYOUT_KEYS[i % LAYOUT_KEYS.length];
    const file = `art-${designKey}-${palKey}-${layoutKey}.svg`;
    const slug = slugify(`g-${cat}-${designKey}-${palKey}-${layoutKey}`);
    if (usedSlugs.has(slug)) return;
    usedSlugs.add(slug);
    if (!writtenFiles.has(file)) {
      fs.writeFileSync(path.join(OUT_DIR, file), buildSvg(designKey, palKey, layoutKey));
      writtenFiles.add(file);
    }
    count += 1;
    const variant = (i + oi) % LANGS.length;
    const layoutSuffix = layoutKey === 'classic' ? '' : ` ${LAYOUTS[layoutKey].name}`;
    rows.push({
      _id: `g${count}`,
      name: `${PALETTES[palKey].name} ${DESIGNS[designKey].label}${layoutSuffix}`,
      slug,
      category: cat,
      previewImage: `/templates/art/${file}`,
      language: LANGS[variant],
      recommendedColor: cfg.color,
      sampleText: {
        blessing: cfg.names[variant % cfg.names.length],
        event: cfg.names[(variant + 3) % cfg.names.length],
        date: SAMPLE_DATES[variant % SAMPLE_DATES.length],
        venue: VENUES[variant % VENUES.length],
      },
    });
  });
});

const lines = rows.map((r) =>
  `  { _id: '${r._id}', name: ${JSON.stringify(r.name)}, slug: '${r.slug}', category: '${r.category}', previewImage: '${r.previewImage}', language: '${r.language}', hasVideo: true, price: 49, videoPrice: 99, recommendedColor: '${r.recommendedColor}', sampleText: { blessing: ${JSON.stringify(r.sampleText.blessing)}, event: ${JSON.stringify(r.sampleText.event)}, date: ${JSON.stringify(r.sampleText.date)}, venue: ${JSON.stringify(r.sampleText.venue)} }},`
);

fs.writeFileSync(
  DATA_OUT,
  `// Generated by scripts/genArt.cjs — vector invitation cards.\n` +
  `// ${rows.length} designs, artwork in /public/templates/art/ (authored with a clear text band).\n\n` +
  `export const GENERATED_TEMPLATES = [\n${lines.join('\n')}\n];\n\n` +
  `export const GENERATED_CATEGORIES = ${JSON.stringify(
    Object.entries(OCCASIONS).map(([id, c]) => ({ id, label: c.label })), null, 0,
  ).replace(/\},\{/g, '},\n  {')};\n`,
);

console.log(`wrote ${rows.length} generated templates + svg files`);
