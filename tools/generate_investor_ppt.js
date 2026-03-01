/* ───────────────────────────────────────────────────────────────────
   The Nursery Green — High-Graphics Investor Deck Generator
   Produces a 16-slide widescreen PPTX with embedded images,
   decorative shapes, donut charts, bar charts, timelines,
   progress bars, and creative layouts.
   ─────────────────────────────────────────────────────────────────── */

const path = require('path');
const fs   = require('fs');
const PptxGenJS = require('pptxgenjs');

// ── Brand palette (from styles.css :root) ──
const C = {
  green:      '1C6B44',
  forest:     '0F2F25',
  lime:       'B1F24B',
  amber:      'F6AD37',
  sand:       'EEF2E8',
  lightGray:  'F5F7F2',
  border:     'DFE5D9',
  dark:       '1F2B2A',
  muted:      '5C6F68',
  white:      'FFFFFF',
  red:        'E85D5D',
  blue:       '4A90D9',
  purple:     '8B5CF6',
  teal:       '14B8A6',
  pink:       'EC4899',
};

const F = { h: 'Segoe UI Semibold', b: 'Segoe UI', m: 'Consolas' };
const W = 13.333, H = 7.5;

const IMG = (...parts) => path.join(__dirname, '..', 'Images', ...parts);

// ── Helpers ──────────────────────────────────────────────────────────

let ST; // ShapeType – set after pptx instantiation

function bg(s, style = 'light') {
  const isDark = style === 'dark';
  const isGreen = style === 'green';

  // Full background
  s.addShape(ST.rect, { x: 0, y: 0, w: W, h: H,
    fill: { color: isGreen ? C.green : isDark ? C.forest : C.sand },
  });

  // Decorative circles (large, translucent)
  s.addShape(ST.ellipse, { x: -3, y: -3, w: 8, h: 8,
    fill: { color: isGreen ? C.lime : isDark ? C.green : C.green, transparency: isDark ? 92 : 90 },
    line: { width: 0 },
  });
  s.addShape(ST.ellipse, { x: 8, y: -4, w: 9, h: 9,
    fill: { color: isDark ? C.lime : C.amber, transparency: 93 },
    line: { width: 0 },
  });
  s.addShape(ST.ellipse, { x: 9, y: 4, w: 7, h: 7,
    fill: { color: isDark ? C.amber : C.lime, transparency: 94 },
    line: { width: 0 },
  });

  // Small decorative dots
  const dotC = isDark || isGreen ? C.lime : C.green;
  for (let i = 0; i < 12; i++) {
    const dx = 0.5 + Math.random() * 12;
    const dy = 0.5 + Math.random() * 6;
    const ds = 0.06 + Math.random() * 0.12;
    s.addShape(ST.ellipse, { x: dx, y: dy, w: ds, h: ds,
      fill: { color: dotC, transparency: 75 + Math.floor(Math.random() * 15) },
      line: { width: 0 },
    });
  }

  // Top accent bar
  s.addShape(ST.rect, { x: 0, y: 0, w: W, h: 0.08,
    fill: { color: isGreen ? C.lime : isDark ? C.lime : C.green },
  });

  // Bottom accent line
  s.addShape(ST.rect, { x: 0, y: H - 0.04, w: W, h: 0.04,
    fill: { color: C.amber, transparency: 50 },
  });
}

function heading(s, title, sub, tag, opts = {}) {
  const c = opts.light ? C.white : C.forest;
  const mc = opts.light ? 'DDDDDD' : C.muted;
  s.addText(title, { x: 0.75, y: 0.5, w: 10.5, h: 0.7,
    fontFace: F.h, fontSize: 34, color: c, bold: true });
  if (sub) s.addText(sub, { x: 0.75, y: 1.15, w: 10, h: 0.35,
    fontFace: F.b, fontSize: 14, color: mc });
  if (tag) {
    s.addShape(ST.roundRect, { x: 11.5, y: 0.55, w: 1.1, h: 0.55,
      fill: { color: C.green }, line: { width: 0 }, rectRadius: 0.15 });
    s.addText(tag, { x: 11.5, y: 0.55, w: 1.1, h: 0.55,
      fontFace: F.h, fontSize: 16, color: C.white, align: 'center', valign: 'middle' });
  }
}

function footer(s, t, opts = {}) {
  const c = opts.light ? 'AAAAAA' : C.muted;
  s.addText(t, { x: 0.75, y: 7.1, w: 11, h: 0.25,
    fontFace: F.b, fontSize: 9, color: c });
}

function card(s, x, y, w, h, title, body, accent = C.green) {
  s.addShape(ST.roundRect, { x, y, w, h,
    fill: { color: C.white }, shadow: { type: 'outer', blur: 8, offset: 3, color: '000000', opacity: 0.06 },
    rectRadius: 0.18, line: { color: C.border, width: 0.5 } });
  // Left color stripe
  s.addShape(ST.roundRect, { x, y, w: 0.09, h,
    fill: { color: accent }, rectRadius: 0.04, line: { width: 0 } });
  s.addText(title, { x: x + 0.25, y: y + 0.15, w: w - 0.38, h: 0.4,
    fontFace: F.h, fontSize: 15, color: C.dark, bold: true });
  s.addText(body, { x: x + 0.25, y: y + 0.55, w: w - 0.38, h: h - 0.7,
    fontFace: F.b, fontSize: 11, color: C.muted, lineSpacingMultiple: 1.15 });
}

function iconCircle(s, x, y, size, emoji, color) {
  s.addShape(ST.ellipse, { x, y, w: size, h: size,
    fill: { color, transparency: 80 }, line: { width: 0 } });
  s.addShape(ST.ellipse, { x: x + size * 0.1, y: y + size * 0.1, w: size * 0.8, h: size * 0.8,
    fill: { color }, line: { width: 0 } });
  s.addText(emoji, { x, y: y + size * 0.05, w: size, h: size * 0.9,
    fontFace: 'Segoe UI Emoji', fontSize: Math.round(size * 22), color: C.white,
    align: 'center', valign: 'middle' });
}

function kpiBox(s, x, y, w, val, label, color = C.green) {
  s.addShape(ST.roundRect, { x, y, w, h: 1.25,
    fill: { color: C.white }, shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.05 },
    rectRadius: 0.16, line: { color: C.border, width: 0.5 } });
  // Top bar
  s.addShape(ST.rect, { x: x + 0.15, y: y + 0.12, w: w - 0.3, h: 0.06,
    fill: { color, transparency: 50 }, line: { width: 0 } });
  s.addText(val, { x, y: y + 0.28, w, h: 0.5,
    fontFace: F.h, fontSize: 24, color: C.forest, align: 'center', bold: true });
  s.addText(label, { x, y: y + 0.82, w, h: 0.3,
    fontFace: F.b, fontSize: 10, color: C.muted, align: 'center' });
}

function progressBar(s, x, y, w, pct, label, color = C.green) {
  s.addText(label, { x, y: y - 0.22, w, h: 0.22,
    fontFace: F.b, fontSize: 10, color: C.dark });
  s.addShape(ST.roundRect, { x, y, w, h: 0.22,
    fill: { color: C.lightGray }, rectRadius: 0.11, line: { width: 0 } });
  s.addShape(ST.roundRect, { x, y, w: w * pct, h: 0.22,
    fill: { color }, rectRadius: 0.11, line: { width: 0 } });
  s.addText(Math.round(pct * 100) + '%', { x: x + w + 0.08, y: y - 0.03, w: 0.5, h: 0.25,
    fontFace: F.h, fontSize: 10, color });
}

function donutChart(s, cx, cy, r, segments) {
  // Fake donut with overlapping arcs (PptxGenJS doesn't support real arcs,
  // so we approximate with quarter/half ellipses + layered circles)
  const total = segments.reduce((a, seg) => a + seg.pct, 0);
  let cumAngle = 0;
  segments.forEach((seg) => {
    const angle = (seg.pct / total) * 360;
    const midA = ((cumAngle + angle / 2) * Math.PI) / 180 - Math.PI / 2;
    const bx = cx + r * 0.55 * Math.cos(midA) - 0.45;
    const by = cy + r * 0.55 * Math.sin(midA) - 0.18;

    // Segment indicator dot
    s.addShape(ST.ellipse, { x: cx + r * 0.72 * Math.cos(midA) - 0.12,
      y: cy + r * 0.72 * Math.sin(midA) - 0.12, w: 0.24, h: 0.24,
      fill: { color: seg.color }, line: { width: 0 } });
    // Label next to it
    s.addText(`${seg.pct}%`, {
      x: cx + r * 0.72 * Math.cos(midA) - 0.12 + 0.3,
      y: cy + r * 0.72 * Math.sin(midA) - 0.14, w: 0.6, h: 0.28,
      fontFace: F.h, fontSize: 10, color: seg.color });

    cumAngle += angle;
  });

  // Outer ring
  s.addShape(ST.ellipse, { x: cx - r, y: cy - r, w: r * 2, h: r * 2,
    fill: { color: C.lightGray }, line: { color: C.border, width: 1 } });
  // Colored segments (layered arcs using quadrant ellipses)
  let cAngle = 0;
  segments.forEach((seg) => {
    const a = (seg.pct / total) * 360;
    const midA2 = ((cAngle + a / 2) * Math.PI) / 180 - Math.PI / 2;
    const sx = cx + r * 0.38 * Math.cos(midA2);
    const sy = cy + r * 0.38 * Math.sin(midA2);
    s.addShape(ST.ellipse, { x: sx - r * 0.35, y: sy - r * 0.35, w: r * 0.7, h: r * 0.7,
      fill: { color: seg.color, transparency: 25 }, line: { width: 0 } });
    cAngle += a;
  });
  // Inner hole
  s.addShape(ST.ellipse, { x: cx - r * 0.52, y: cy - r * 0.52, w: r * 1.04, h: r * 1.04,
    fill: { color: C.white }, line: { width: 0 } });
}

function barChart(s, x, y, w, h, data, barColor = C.green) {
  const maxVal = Math.max(...data.map(d => d.v));
  const gap = 0.12;
  const bw = (w - gap * (data.length + 1)) / data.length;
  const chartH = h - 0.5;

  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const ly = y + chartH * (1 - i / 4);
    s.addShape(ST.line, { x, y: ly, w, h: 0,
      line: { color: C.border, width: 0.5, dashType: 'dash' } });
  }

  data.forEach((d, i) => {
    const bh = Math.max((d.v / maxVal) * (chartH - 0.15), 0.08);
    const bx = x + gap + i * (bw + gap);
    const by = y + chartH - bh;

    // Shadow bar
    s.addShape(ST.roundRect, { x: bx + 0.04, y: by + 0.04, w: bw, h: bh,
      fill: { color: '000000', transparency: 94 }, rectRadius: 0.08, line: { width: 0 } });
    // Main bar (gradient effect: two stacked rects)
    s.addShape(ST.roundRect, { x: bx, y: by, w: bw, h: bh,
      fill: { color: barColor }, rectRadius: 0.08, line: { width: 0 } });
    s.addShape(ST.roundRect, { x: bx, y: by, w: bw, h: bh * 0.4,
      fill: { color: C.white, transparency: 75 }, rectRadius: 0.08, line: { width: 0 } });
    // Value label
    s.addText('$' + d.v + 'M', { x: bx - 0.1, y: by - 0.32, w: bw + 0.2, h: 0.28,
      fontFace: F.h, fontSize: 9, color: C.forest, align: 'center' });
    // Axis label
    s.addText(d.l, { x: bx, y: y + chartH + 0.05, w: bw, h: 0.22,
      fontFace: F.b, fontSize: 9, color: C.muted, align: 'center' });
  });
}

function timelineRow(s, x, y, w, phase, items, color) {
  // Phase pill
  s.addShape(ST.roundRect, { x, y, w: 1.7, h: 0.4,
    fill: { color }, rectRadius: 0.2, line: { width: 0 } });
  s.addText(phase, { x, y, w: 1.7, h: 0.4,
    fontFace: F.h, fontSize: 11, color: C.white, align: 'center', valign: 'middle' });
  // Connecting line
  s.addShape(ST.rect, { x: x + 1.8, y: y + 0.17, w: w - 1.95, h: 0.06,
    fill: { color, transparency: 60 }, line: { width: 0 } });
  // Item dots + labels
  const stepW = (w - 2.2) / items.length;
  items.forEach((item, i) => {
    const ix = x + 2.0 + i * stepW;
    s.addShape(ST.ellipse, { x: ix, y: y + 0.1, w: 0.2, h: 0.2,
      fill: { color }, line: { color: C.white, width: 2 } });
    s.addText(item, { x: ix - 0.3, y: y + 0.38, w: stepW + 0.3, h: 0.6,
      fontFace: F.b, fontSize: 9, color: C.dark, lineSpacingMultiple: 1.05 });
  });
}

function featureCard(s, x, y, w, h, emoji, title, body, color) {
  s.addShape(ST.roundRect, { x, y, w, h,
    fill: { color: C.white },
    shadow: { type: 'outer', blur: 6, offset: 2, color: '000000', opacity: 0.05 },
    rectRadius: 0.18, line: { color: C.border, width: 0.5 } });
  iconCircle(s, x + w / 2 - 0.32, y + 0.2, 0.64, emoji, color);
  s.addText(title, { x: x + 0.15, y: y + 1.0, w: w - 0.3, h: 0.35,
    fontFace: F.h, fontSize: 12, color: C.dark, align: 'center', bold: true });
  s.addText(body, { x: x + 0.15, y: y + 1.35, w: w - 0.3, h: h - 1.6,
    fontFace: F.b, fontSize: 10, color: C.muted, align: 'center', lineSpacingMultiple: 1.1 });
}

function compTable(s, x, y, w, headers, rows) {
  const colW = w / headers.length;
  const rowH = 0.52;
  // Header row
  headers.forEach((h2, i) => {
    const isLast = i === headers.length - 1;
    s.addShape(ST.rect, { x: x + i * colW, y, w: colW, h: rowH,
      fill: { color: isLast ? C.green : C.forest }, line: { color: C.forest, width: 0.5 } });
    s.addText(h2, { x: x + i * colW, y, w: colW, h: rowH,
      fontFace: F.h, fontSize: 10, color: C.white, align: 'center', valign: 'middle', bold: true });
  });
  // Data rows
  rows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const isLast = ci === row.length - 1;
      const isAlt = ri % 2 === 0;
      s.addShape(ST.rect, {
        x: x + ci * colW, y: y + rowH + ri * rowH, w: colW, h: rowH,
        fill: { color: isLast ? (isAlt ? 'E8F5E9' : 'F1F8E9') : (isAlt ? C.lightGray : C.white) },
        line: { color: C.border, width: 0.5 } });
      s.addText(cell, {
        x: x + ci * colW, y: y + rowH + ri * rowH, w: colW, h: rowH,
        fontFace: ci === 0 ? F.h : F.b, fontSize: 10,
        color: cell === '✅' ? C.green : cell === '❌' ? C.red : C.dark,
        align: 'center', valign: 'middle' });
    });
  });
}

// ── Build deck ──────────────────────────────────────────────────────

function build() {
  const pptx = new PptxGenJS();
  ST = pptx.ShapeType;

  pptx.layout  = 'LAYOUT_WIDE';
  pptx.author  = 'The Nursery Green';
  pptx.company = 'The Nursery Green';
  pptx.title   = 'Investor Deck — India (Feb 2026)';
  pptx.subject = 'Plant Health + Commerce Platform';

  /* ── Slide 1: Cover ─────────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'dark');

    // Big decorative leaf-like shapes
    s.addShape(ST.ellipse, { x: -1, y: 2, w: 5, h: 8,
      fill: { color: C.green, transparency: 80 }, line: { width: 0 }, rotate: -30 });
    s.addShape(ST.ellipse, { x: 9, y: -1, w: 6, h: 10,
      fill: { color: C.lime, transparency: 88 }, line: { width: 0 }, rotate: 20 });

    // Logo
    if (fs.existsSync(IMG('logo.png'))) {
      s.addImage({ path: IMG('logo.png'), x: 0.75, y: 0.5, h: 1.2, w: 1.2 });
    }

    s.addText('THE NURSERY GREEN', { x: 0.75, y: 2.0, w: 11, h: 1.0,
      fontFace: F.h, fontSize: 52, color: C.white, bold: true });

    s.addShape(ST.rect, { x: 0.75, y: 3.1, w: 3.5, h: 0.06,
      fill: { color: C.lime }, line: { width: 0 } });

    s.addText("India's First Integrated\nPlant Health + Commerce Platform", {
      x: 0.75, y: 3.35, w: 9, h: 0.9,
      fontFace: F.b, fontSize: 22, color: C.lime });

    // Product thumbnails row
    const prods = ['Plant Booster Spray.png', 'Neem Oil.png', 'Flower Mixture.png', 'All in one mixture.png'];
    prods.forEach((p, i) => {
      const imgPath = IMG(p);
      if (fs.existsSync(imgPath)) {
        s.addShape(ST.roundRect, { x: 0.75 + i * 2.2, y: 4.8, w: 1.9, h: 1.9,
          fill: { color: C.white, transparency: 85 }, rectRadius: 0.2, line: { width: 0 } });
        s.addImage({ path: imgPath, x: 0.95 + i * 2.2, y: 4.95, h: 1.6, w: 1.5,
          sizing: { type: 'contain', w: 1.5, h: 1.6 } });
      }
    });

    s.addText('Investor Deck  •  February 2026  •  Confidential', {
      x: 0.75, y: 6.9, w: 11, h: 0.3,
      fontFace: F.b, fontSize: 11, color: 'AAAAAA' });
  }

  /* ── Slide 2: Problem ───────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'light');
    heading(s, 'The Problem', '₹18,000 Crore of silent plant deaths — fragmented diagnosis, no trust', '01');

    const pains = [
      { e: '🔍', t: 'Misdiagnosis', b: '60%+ wrong treatment from generic Google searches', c: C.red },
      { e: '🧩', t: 'Fragmented', b: 'YouTube + Amazon + WhatsApp = no single source of truth', c: C.amber },
      { e: '🚫', t: 'No Verification', b: 'Advice given without leaf, soil, or environment check', c: C.purple },
      { e: '💸', t: 'Trust Deficit', b: 'Users can\'t tell if a ₹200 spray will actually work', c: C.blue },
      { e: '🔄', t: 'No Feedback Loop', b: 'Brands sell but never learn if treatments actually worked', c: C.teal },
    ];
    pains.forEach((p, i) => {
      const px = 0.75 + (i % 3) * 4.1;
      const py = 2.0 + Math.floor(i / 3) * 2.6;
      featureCard(s, px, py, 3.8, 2.4, p.e, p.t, p.b, p.c);
    });

    // Market size callout
    s.addShape(ST.roundRect, { x: 8.95, y: 4.6, w: 3.65, h: 2.2,
      fill: { color: C.forest }, rectRadius: 0.2, line: { width: 0 } });
    s.addText('TAM', { x: 9.1, y: 4.75, w: 3.35, h: 0.3,
      fontFace: F.b, fontSize: 12, color: C.lime });
    s.addText('₹6K–₹18K Cr', { x: 9.1, y: 5.1, w: 3.35, h: 0.55,
      fontFace: F.h, fontSize: 26, color: C.white, bold: true });
    s.addText('30M+ urban plant-owning\nhouseholds × ₹2K–₹6K\nannual spend', {
      x: 9.1, y: 5.7, w: 3.35, h: 0.8,
      fontFace: F.b, fontSize: 11, color: 'CCCCCC' });

    footer(s, 'Growing 15–20% annually — urban gardening, balcony farming, wellness green living');
  }

  /* ── Slide 3: Solution overview ─────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'light');
    heading(s, 'Our Solution', 'Verified diagnosis + treatment + commerce + community — one app', '02');

    const feats = [
      { e: '📷', t: 'Plant Scanner', b: '50+ diseases\n100+ Indian remedies\nPixel-level analysis\nHybrid online/offline', c: C.green },
      { e: '🧠', t: 'Knowledge DB', b: 'Auto-refreshing MongoDB\nVerification pipeline\n6 categories\nAudit trail', c: C.blue },
      { e: '💬', t: 'Smart Chatbot', b: 'Chat → order flow\nPlant-care routing\nOrder tracking\nKnowledge integration', c: C.teal },
      { e: '👥', t: 'Community', b: 'Show & Tell\nTips & Tricks\nHelp & Advice\nBefore/after photos', c: C.purple },
      { e: '🛒', t: 'Commerce', b: '100% organic products\nRazorpay (UPI + Card)\nFree shipping ₹1999+\n30-day guarantee', c: C.amber },
      { e: '📱', t: 'Mobile App', b: 'Expo + React Native\niOS + Android\nGoogle/FB OAuth\nDeep-link support', c: C.pink },
    ];

    feats.forEach((f, i) => {
      featureCard(s, 0.55 + (i % 3) * 4.15, 1.85 + Math.floor(i / 3) * 2.7, 3.85, 2.5, f.e, f.t, f.b, f.c);
    });

    footer(s, 'All features live & deployed — Railway backend, Razorpay payments, OAuth, admin tooling');
  }

  /* ── Slide 4: Product showcase (images) ─────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'green');
    heading(s, 'Product Catalog', '100% organic plant care — made for Indian conditions', '03', { light: true });

    const products = [
      { img: 'Plant Booster Spray.png', name: 'Plant Booster Spray', price: '₹180' },
      { img: 'Neem Oil.png', name: 'Neem Oil', price: '₹150' },
      { img: 'Flower Mixture.png', name: 'Flower Mixture', price: '₹230' },
      { img: 'All in one mixture.png', name: 'All-in-One Mixture', price: '₹199' },
      { img: 'Flower Booster Spray.png', name: 'Flower Booster', price: '₹180' },
    ];

    products.forEach((p, i) => {
      const px = 0.5 + i * 2.5;
      // Card bg
      s.addShape(ST.roundRect, { x: px, y: 2.0, w: 2.3, h: 4.5,
        fill: { color: C.white }, rectRadius: 0.2,
        shadow: { type: 'outer', blur: 10, offset: 4, color: '000000', opacity: 0.12 },
        line: { width: 0 } });
      // Product image
      const imgPath = IMG(p.img);
      if (fs.existsSync(imgPath)) {
        s.addImage({ path: imgPath, x: px + 0.2, y: 2.2, w: 1.9, h: 2.8,
          sizing: { type: 'contain', w: 1.9, h: 2.8 } });
      }
      // Name + price
      s.addText(p.name, { x: px + 0.1, y: 5.1, w: 2.1, h: 0.4,
        fontFace: F.h, fontSize: 11, color: C.dark, align: 'center' });
      // Price pill
      s.addShape(ST.roundRect, { x: px + 0.55, y: 5.55, w: 1.2, h: 0.38,
        fill: { color: C.lime }, rectRadius: 0.19, line: { width: 0 } });
      s.addText(p.price, { x: px + 0.55, y: 5.55, w: 1.2, h: 0.38,
        fontFace: F.h, fontSize: 13, color: C.forest, align: 'center', valign: 'middle' });
    });

    footer(s, 'Free shipping above ₹1,999  •  30-day replacement guarantee  •  Desi remedies included', { light: true });
  }

  /* ── Slide 5: Why Now (India) ───────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'light');
    heading(s, 'Why Now — India\'s Moment', 'UPI + mobile + D2C momentum = perfect convergence', '04');

    kpiBox(s, 0.5, 2.0, 2.9, '21.7B', 'UPI txns (Jan 2026)', C.green);
    kpiBox(s, 3.6, 2.0, 2.9, '₹28.3L Cr', 'UPI value (Jan 2026)', C.teal);
    kpiBox(s, 6.7, 2.0, 2.9, '$163B', 'E-commerce 2026', C.amber);
    kpiBox(s, 9.8, 2.0, 2.85, '900M+', 'Smartphones', C.blue);

    kpiBox(s, 0.5, 3.6, 2.9, '$60B', 'D2C by 2027', C.purple);
    kpiBox(s, 3.6, 3.6, 2.9, '40%', 'D2C CAGR', C.pink);
    kpiBox(s, 6.7, 3.6, 2.9, '$170B', 'E-retail 2030', C.green);
    kpiBox(s, 9.8, 3.6, 2.85, '691', 'Banks on UPI', C.amber);

    card(s, 0.5, 5.2, 12.1, 1.8, 'What this means for us',
      '• UPI removes friction (₹130 spray = one-tap purchase)\n' +
      '• Mobile-first discovery → diagnosis → purchase in-app\n' +
      '• D2C trust > marketplace listings = higher repeat\n' +
      '• Content + commerce convergence → diagnosis-led flywheel',
      C.green);

    footer(s, 'Sources: IBEF, NPCI, Statista');
  }

  /* ── Slide 6: Competitive landscape ─────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'light');
    heading(s, 'Competitive Landscape', 'No one in India combines all four layers', '05');

    compTable(s, 0.5, 1.85, 12.3,
      ['Capability', 'E-commerce', 'Content Sites', 'Plant ID Apps', 'Nursery Green'],
      [
        ['Commerce', '✅', '❌', '❌', '✅'],
        ['Verified diagnosis', '❌', '❌', 'Partial', '✅'],
        ['Auto-refresh knowledge DB', '❌', '❌', '❌', '✅'],
        ['Community + social proof', '❌', 'Partial', '❌', '✅'],
        ['India-specific remedies', '❌', 'Partial', '❌', '✅'],
        ['Chat → Order', '❌', '❌', '❌', '✅'],
        ['Leaf + soil + env verification', '❌', '❌', '❌', '✅'],
        ['Diagnosis audit trail', '❌', '❌', '❌', '✅'],
      ]
    );

    // Callout
    s.addShape(ST.roundRect, { x: 0.5, y: 6.35, w: 12.3, h: 0.7,
      fill: { color: C.green, transparency: 90 }, rectRadius: 0.15, line: { color: C.green, width: 1 } });
    s.addText('🔑 Key: Verification-first diagnosis  •  100+ desi remedies  •  Closed-loop data flywheel  •  Chat-to-cart', {
      x: 0.7, y: 6.35, w: 11.9, h: 0.7,
      fontFace: F.h, fontSize: 13, color: C.green, align: 'center', valign: 'middle' });

    footer(s, 'The Nursery Green — Only platform with all 8 capabilities');
  }

  /* ── Slide 7: Data Flywheel ─────────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'dark');
    heading(s, 'The Data Flywheel', 'Every interaction makes the platform smarter', '06', { light: true });

    const steps = [
      { e: '📷', t: 'Scan / Ask', c: C.lime },
      { e: '✅', t: 'Verify\n(leaf/soil/env)', c: C.teal },
      { e: '🧠', t: 'Diagnosis\n+ Plan', c: C.blue },
      { e: '🛒', t: 'Buy\nTreatment', c: C.amber },
      { e: '📊', t: 'Log Case\n+ Outcome', c: C.purple },
      { e: '🔄', t: 'Knowledge\nImproves', c: C.green },
    ];

    const cx = 4.9, cy = 4.45, r = 2.4;
    // Outer decorative ring
    s.addShape(ST.ellipse, { x: cx - r - 0.3, y: cy - r - 0.3, w: (r + 0.3) * 2, h: (r + 0.3) * 2,
      fill: { color: C.green, transparency: 88 }, line: { width: 0 } });
    // Center
    s.addShape(ST.ellipse, { x: cx - 1.1, y: cy - 1.1, w: 2.2, h: 2.2,
      fill: { color: C.forest }, line: { color: C.lime, width: 2 } });
    s.addText('TRUST\n→\nREPEAT', { x: cx - 1.1, y: cy - 0.75, w: 2.2, h: 1.5,
      fontFace: F.h, fontSize: 16, color: C.lime, align: 'center', valign: 'middle' });

    steps.forEach((st, i) => {
      const angle = (Math.PI * 2 * i) / steps.length - Math.PI / 2;
      const bx = cx + r * Math.cos(angle);
      const by = cy + r * Math.sin(angle);
      iconCircle(s, bx - 0.35, by - 0.35, 0.7, st.e, st.c);
      // Label
      const lx = cx + (r + 0.85) * Math.cos(angle);
      const ly = cy + (r + 0.85) * Math.sin(angle);
      s.addText(st.t, { x: lx - 0.65, y: ly - 0.25, w: 1.3, h: 0.5,
        fontFace: F.b, fontSize: 9, color: C.white, align: 'center', valign: 'middle' });
    });

    // Right-side info cards
    card(s, 9.6, 2.0, 3.1, 1.5, '100K+ cases', 'After 100K diagnosis logs, our India-specific plant health dataset will be unmatched.', C.lime);
    card(s, 9.6, 3.7, 3.1, 1.5, 'Compounding', 'Better accuracy → higher conversion → more data → lower CAC.', C.teal);
    card(s, 9.6, 5.4, 3.1, 1.5, 'Defensible', 'Integration depth + data flywheel is impossible to clone quickly.', C.amber);

    footer(s, 'Powered by verification-first inputs — leaf + soil + environment', { light: true });
  }

  /* ── Slide 8: Business Model ────────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'light');
    heading(s, 'Business Model', 'Subscription layered over repeat D2C commerce', '07');

    // Revenue streams
    const streams = [
      { t: 'D2C Products', m: '45–55%', s: 'Live', c: C.green },
      { t: 'Subscription', m: '80–90%', s: 'Q3 2026', c: C.blue },
      { t: 'B2B / B2B2C', m: '60–70%', s: '2027', c: C.teal },
      { t: 'Marketplace', m: '15–25%', s: '2027', c: C.amber },
      { t: 'Affiliate', m: '70–80%', s: '2027', c: C.purple },
      { t: 'Data & Insights', m: '90%+', s: '2028', c: C.pink },
    ];

    streams.forEach((st, i) => {
      const sx = 0.5 + (i % 3) * 4.15;
      const sy = 2.0 + Math.floor(i / 3) * 1.35;
      s.addShape(ST.roundRect, { x: sx, y: sy, w: 3.9, h: 1.15,
        fill: { color: C.white }, rectRadius: 0.15,
        shadow: { type: 'outer', blur: 4, offset: 2, color: '000000', opacity: 0.04 },
        line: { color: C.border, width: 0.5 } });
      // Color dot
      s.addShape(ST.ellipse, { x: sx + 0.18, y: sy + 0.35, w: 0.44, h: 0.44,
        fill: { color: st.c }, line: { width: 0 } });
      s.addText(st.t, { x: sx + 0.72, y: sy + 0.12, w: 2.5, h: 0.35,
        fontFace: F.h, fontSize: 13, color: C.dark, bold: true });
      s.addText(`GM: ${st.m}`, { x: sx + 0.72, y: sy + 0.45, w: 1.5, h: 0.25,
        fontFace: F.b, fontSize: 10, color: C.muted });
      // Status pill
      s.addShape(ST.roundRect, { x: sx + 2.6, y: sy + 0.45, w: 1.1, h: 0.3,
        fill: { color: st.s === 'Live' ? C.green : C.amber, transparency: st.s === 'Live' ? 0 : 20 },
        rectRadius: 0.15, line: { width: 0 } });
      s.addText(st.s, { x: sx + 2.6, y: sy + 0.45, w: 1.1, h: 0.3,
        fontFace: F.h, fontSize: 9, color: st.s === 'Live' ? C.white : C.forest,
        align: 'center', valign: 'middle' });
    });

    // Unit economics
    card(s, 0.5, 4.9, 6.0, 2.0, 'Unit Economics (Target)',
      'AOV: ₹650–₹1,200  •  Repeat: 4–8×/yr  •  CAC: ₹150–₹400\nPayback: <6 mo  •  Blended GM: 55–62%  •  LTV:CAC > 4:1',
      C.green);

    card(s, 6.75, 4.9, 5.85, 2.0, 'Revenue Mix Evolution',
      'Y1: 90% commerce → Y5: 55% commerce + 30% subscription + 15% B2B\nSubscription is the margin accelerator',
      C.blue);

    footer(s, 'All targets are planning assumptions; replace with cohort data as collected');
  }

  /* ── Slide 9: Go-to-Market ──────────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'light');
    heading(s, 'Go-to-Market (India)', 'Scanner acquisition → community retention → repeat commerce', '08');

    card(s, 0.5, 2.0, 3.9, 4.9,
      '🏙️  Phase 1: Metro (0–12 mo)',
      'Mumbai, Delhi, Bangalore, Pune, Hyderabad, Chennai\n\n' +
      '• Scanner viral loops (₹50–100 CAC)\n' +
      '• 500 community seeders\n' +
      '• WhatsApp referrals (₹100–150)\n' +
      '• 50 micro-influencers\n' +
      '• Meta/Google retargeting',
      C.green);

    card(s, 4.65, 2.0, 3.9, 4.9,
      '🌍  Phase 2: Tier-2 (12–24 mo)',
      'Hindi, Tamil, Telugu, Bengali, Marathi\n\n' +
      '• Voice-based diagnosis\n' +
      '• ₹299 monthly bundles\n' +
      '• City cohorts ("Plant Circles")\n' +
      '• College/school programs\n' +
      '• Non-typing user support',
      C.teal);

    card(s, 8.8, 2.0, 3.9, 4.9,
      '🏢  Phase 3: B2B (24–36 mo)',
      'Institutional & enterprise layer\n\n' +
      '• RWA managed care contracts\n' +
      '• Nursery partnerships\n' +
      '• Corporate green buildings\n' +
      '• Smart City initiatives\n' +
      '• White-label scanner',
      C.amber);

    footer(s, 'North Star Metric → monthly diagnosis-to-purchase conversions');
  }

  /* ── Slide 10: Financial projections ────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'light');
    heading(s, 'Financial Projections', 'Revenue growth with improving margins as subscription mix rises', '09');

    barChart(s, 0.6, 2.2, 8.0, 4.5, [
      { l: 'Y1', v: 0.9 }, { l: 'Y2', v: 4.2 }, { l: 'Y3', v: 15 }, { l: 'Y4', v: 38 },
      { l: 'Y5', v: 82 }, { l: 'Y6', v: 160 }, { l: 'Y7', v: 265 }, { l: 'Y8', v: 420 },
    ], C.green);

    s.addText('Revenue (USD millions)', { x: 0.6, y: 1.85, w: 5, h: 0.3,
      fontFace: F.h, fontSize: 14, color: C.dark });

    // Right-side margin + user metrics
    const ry = 2.2;
    s.addText('EBITDA Margin', { x: 8.9, y: ry, w: 3.8, h: 0.3,
      fontFace: F.h, fontSize: 13, color: C.dark, bold: true });

    progressBar(s, 8.9, ry + 0.65, 3.5, 0, 'Y1: -60%', C.red);
    progressBar(s, 8.9, ry + 1.25, 3.5, 0.05, 'Y4: +5%', C.amber);
    progressBar(s, 8.9, ry + 1.85, 3.5, 0.21, 'Y7: +21%', C.green);
    progressBar(s, 8.9, ry + 2.45, 3.5, 0.24, 'Y8: +24%', C.green);

    s.addText('Active Users', { x: 8.9, y: ry + 3.2, w: 3.8, h: 0.3,
      fontFace: F.h, fontSize: 13, color: C.dark, bold: true });
    progressBar(s, 8.9, ry + 3.85, 3.5, 0.02, 'Y1: 25K', C.blue);
    progressBar(s, 8.9, ry + 4.45, 3.5, 0.65, 'Y7: 8.5M', C.blue);

    footer(s, 'Scenario-based planning — not guaranteed forecast. ₹83 = $1 exchange rate.');
  }

  /* ── Slide 11: $1B valuation path ───────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'dark');
    heading(s, '$1 Billion Valuation Path', 'Achievable in Year 6–7 with disciplined execution', '10', { light: true });

    // Valuation trajectory as ascending steps
    const vals = [
      { l: 'Y1', v: '$12M', h: 0.5 },
      { l: 'Y2', v: '$42M', h: 0.85 },
      { l: 'Y3', v: '$128M', h: 1.3 },
      { l: 'Y4', v: '$285M', h: 1.8 },
      { l: 'Y5', v: '$575M', h: 2.4 },
      { l: 'Y6', v: '$950M', h: 3.2 },
      { l: 'Y7', v: '$1.3B', h: 3.9 },
      { l: 'Y8', v: '$1.9B', h: 4.5 },
    ];

    const baseY = 6.3;
    vals.forEach((vv, i) => {
      const vx = 0.6 + i * 1.55;
      const vy = baseY - vv.h;
      const isB = vv.h >= 3.2;
      s.addShape(ST.roundRect, { x: vx, y: vy, w: 1.35, h: vv.h,
        fill: { color: isB ? C.lime : C.green }, rectRadius: 0.1, line: { width: 0 } });
      // Highlight bar for $1B+
      if (isB) {
        s.addShape(ST.roundRect, { x: vx, y: vy, w: 1.35, h: vv.h * 0.3,
          fill: { color: C.white, transparency: 70 }, rectRadius: 0.1, line: { width: 0 } });
      }
      s.addText(vv.v, { x: vx, y: vy - 0.35, w: 1.35, h: 0.3,
        fontFace: F.h, fontSize: 11, color: isB ? C.lime : C.white, align: 'center', bold: true });
      s.addText(vv.l, { x: vx, y: baseY + 0.08, w: 1.35, h: 0.25,
        fontFace: F.b, fontSize: 10, color: 'AAAAAA', align: 'center' });
    });

    // Comparables
    card(s, 9.0, 2.0, 3.7, 4.3, 'Indian Comparables',
      'Mamaearth: $1.2B (IPO 2023)\nLenskart: $4.5B (2023)\nPharmEasy: $5.6B (peak)\nCountry Delight: $1.5B (2024)\n\nD2C + vertical AI + subscription = premium multiples',
      C.lime);

    footer(s, 'Revenue multiples calibrated against Indian D2C and vertical SaaS comparables', { light: true });
  }

  /* ── Slide 12: Future features ──────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'light');
    heading(s, 'Future Features', 'Customer attraction + moat expansion', '11');

    const futures = [
      { e: '🗣️', t: 'Voice Plant Doctor', b: 'Hindi + 5 languages\nVoice symptom capture\n3–5× TAM expansion', c: C.green, pri: 'HIGH' },
      { e: '📡', t: 'Sensor Fusion', b: 'BT soil sensors\nPhoto + data diagnosis\nPremium tier unlock', c: C.blue, pri: 'HIGH' },
      { e: '📅', t: 'Care Calendar', b: 'Weather + lifecycle\nPush notifications\n2–3× weekly usage', c: C.teal, pri: 'HIGH' },
      { e: '📈', t: 'Outcome Tracker', b: 'Before/after photos\nRecovery trajectory\nEfficacy dataset', c: C.purple, pri: 'MED' },
      { e: '🏪', t: 'Marketplace', b: 'Local nurseries\nService providers\n15–25% take rate', c: C.amber, pri: 'MED' },
      { e: '🎮', t: 'Gamification', b: 'Leaderboards\nCare streaks\nK-factor > 1.2', c: C.pink, pri: 'MED' },
      { e: '🤖', t: 'AI Prediction', b: 'Growth models\nRecovery timeline\nPatent-worthy IP', c: C.green, pri: 'LATER' },
      { e: '🌐', t: 'IoT Garden', b: 'Auto-watering\nClimate control\nSmart home integration', c: C.blue, pri: 'LATER' },
    ];

    futures.forEach((f, i) => {
      const fx = 0.35 + (i % 4) * 3.2;
      const fy = 1.85 + Math.floor(i / 4) * 2.85;
      featureCard(s, fx, fy, 2.95, 2.65, f.e, f.t, f.b, f.c);
      // Priority pill
      const pc = f.pri === 'HIGH' ? C.green : f.pri === 'MED' ? C.amber : C.muted;
      s.addShape(ST.roundRect, { x: fx + 0.7, y: fy + 2.3, w: 1.55, h: 0.28,
        fill: { color: pc }, rectRadius: 0.14, line: { width: 0 } });
      s.addText(f.pri + ' PRIORITY', { x: fx + 0.7, y: fy + 2.3, w: 1.55, h: 0.28,
        fontFace: F.h, fontSize: 8, color: C.white, align: 'center', valign: 'middle' });
    });
  }

  /* ── Slide 13: Defensibility moats ──────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'dark');
    heading(s, 'Defensibility — Why We Win', '6 compounding moats', '12', { light: true });

    const moats = [
      { e: '💾', t: 'Data Moat', b: 'Every diagnosis logged\nIndia-specific dataset\n2–3yr to replicate', c: C.lime },
      { e: '📡', t: 'Distribution', b: 'Scanner → chatbot → shop → community\n4 touchpoints in 1 funnel', c: C.teal },
      { e: '🔁', t: 'Behavior', b: 'Care cycles = monthly habit\nNot one-time transactions', c: C.blue },
      { e: '🛡️', t: 'Trust', b: 'Reference-backed solutions\nVerification-first diagnosis', c: C.amber },
      { e: '🌐', t: 'Network Effects', b: 'More users = better data\n= better diagnosis = more users', c: C.purple },
      { e: '🇮🇳', t: 'Localization', b: '100+ desi remedies\nIndian plants & climates\n12–18mo to replicate', c: C.green },
    ];

    moats.forEach((m, i) => {
      const mx = 0.4 + (i % 3) * 4.2;
      const my = 2.0 + Math.floor(i / 3) * 2.75;
      featureCard(s, mx, my, 3.95, 2.55, m.e, m.t, m.b, m.c);
    });

    footer(s, 'Integration depth + data flywheel = hard to clone', { light: true });
  }

  /* ── Slide 14: Roadmap ──────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'light');
    heading(s, '24-Month Roadmap', 'Stage-gated by retention & unit economics milestones', '13');

    timelineRow(s, 0.5, 2.2, 12.3, '0–6 mo', [
      'D30 retention loops', 'Subscription alpha ₹99/mo', 'Scanner UX upgrade', 'Community seeding (5 cities)', 'Referral engine'
    ], C.green);

    timelineRow(s, 0.5, 3.5, 12.3, '6–12 mo', [
      'Hindi + regional voice', 'Care calendar + push', '3-tier subscription', 'Outcome tracker v1', 'Expand 15 cities'
    ], C.teal);

    timelineRow(s, 0.5, 4.8, 12.3, '12–18 mo', [
      'Nursery marketplace', 'Soil sensor bundle', 'B2B pilot (10 societies)', '500+ knowledge entries', 'ML model v1'
    ], C.blue);

    timelineRow(s, 0.5, 6.1, 12.3, '18–24 mo', [
      'Expand 50+ cities', 'Corporate green packages', 'IoT pilot', 'AI growth prediction', 'Series A ready'
    ], C.purple);

    footer(s, 'Each phase unlocked only when retention & payback milestones are met');
  }

  /* ── Slide 15: The Ask ──────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'green');
    heading(s, 'The Ask', 'Seed round to scale what already works', '14', { light: true });

    // Big number
    s.addShape(ST.roundRect, { x: 0.5, y: 2.0, w: 5.5, h: 1.6,
      fill: { color: C.white, transparency: 10 }, rectRadius: 0.25, line: { color: C.lime, width: 2 } });
    s.addText('$500K – $800K', { x: 0.5, y: 2.1, w: 5.5, h: 0.8,
      fontFace: F.h, fontSize: 42, color: C.white, align: 'center', bold: true });
    s.addText('SEED ROUND', { x: 0.5, y: 2.95, w: 5.5, h: 0.4,
      fontFace: F.h, fontSize: 16, color: C.lime, align: 'center' });

    // Donut-style allocation visual
    donutChart(s, 3.2, 5.55, 1.3, [
      { pct: 35, color: C.lime, label: 'Product' },
      { pct: 30, color: C.amber, label: 'Growth' },
      { pct: 20, color: C.blue, label: 'Ops' },
      { pct: 15, color: C.purple, label: 'Team' },
    ]);

    // Allocation details
    card(s, 6.3, 2.0, 6.3, 2.4, 'Use of Funds',
      '🟢 35% — Product + AI + Data (scanner ML, knowledge DB, vernacular voice)\n' +
      '🟠 30% — Growth & Brand (influencers, referrals, community seeding)\n' +
      '🔵 20% — Supply Chain & Ops (SKU expansion, 3PL, fulfillment)\n' +
      '🟣 15% — Team & Compliance (engineers, plant science, legal)',
      C.lime);

    // Milestones
    card(s, 6.3, 4.6, 6.3, 2.65, 'Series A Milestones (12 months)',
      '📊 30K+ MAU                    📈 D30 retention > 30%\n' +
      '💰 Monthly GMV ₹25L+    🔄 Repeat orders > 35%\n' +
      '⭐ Subscription attach > 5%  ⏱️ CAC payback < 5 months\n' +
      '👥 Community DAU/MAU > 20%  🔬 25K+ diagnosis cases',
      C.white);

    footer(s, 'Contact: thenurserygreen.com  •  Confidential', { light: true });
  }

  /* ── Slide 16: Closing ──────────────────────────────────────── */
  {
    const s = pptx.addSlide();
    bg(s, 'dark');

    // Big decorative leaf shapes
    s.addShape(ST.ellipse, { x: -2, y: 1, w: 7, h: 11,
      fill: { color: C.green, transparency: 82 }, line: { width: 0 }, rotate: -25 });
    s.addShape(ST.ellipse, { x: 8, y: -2, w: 8, h: 12,
      fill: { color: C.lime, transparency: 90 }, line: { width: 0 }, rotate: 15 });

    // Logo
    if (fs.existsSync(IMG('logo.png'))) {
      s.addImage({ path: IMG('logo.png'), x: 5.6, y: 1.5, h: 1.8, w: 1.8 });
    }

    s.addText('THE NURSERY GREEN', { x: 0.5, y: 3.45, w: 12.3, h: 0.9,
      fontFace: F.h, fontSize: 44, color: C.white, align: 'center', bold: true });

    s.addShape(ST.rect, { x: 5, y: 4.4, w: 3.3, h: 0.06,
      fill: { color: C.lime }, line: { width: 0 } });

    s.addText("India's plant health + commerce platform.\nBuilt. Deployed. Ready to scale.", {
      x: 1, y: 4.65, w: 11.3, h: 0.8,
      fontFace: F.b, fontSize: 20, color: C.lime, align: 'center' });

    s.addText('thenurserygreen.com', { x: 1, y: 5.8, w: 11.3, h: 0.5,
      fontFace: F.h, fontSize: 18, color: C.white, align: 'center' });

    // Product strip
    const prodList = ['Plant Booster Spray.png', 'Neem Oil.png', 'Flower Mixture.png',
      'All in one mixture.png', 'Flower Booster Spray.png'];
    prodList.forEach((p, i) => {
      const imgPath = IMG(p);
      if (fs.existsSync(imgPath)) {
        s.addShape(ST.ellipse, { x: 1.5 + i * 2.2, y: 6.2, w: 1.1, h: 1.1,
          fill: { color: C.white, transparency: 85 }, line: { color: C.lime, width: 1 } });
        s.addImage({ path: imgPath, x: 1.6 + i * 2.2, y: 6.3, w: 0.9, h: 0.9,
          sizing: { type: 'contain', w: 0.9, h: 0.9 } });
      }
    });

    s.addText('Confidential  •  February 2026  •  Generated with Claude Opus 4.6', {
      x: 0.5, y: 7.1, w: 12.3, h: 0.25,
      fontFace: F.b, fontSize: 9, color: '777777', align: 'center' });
  }

  return pptx;
}

// ── Generate ──────────────────────────────────────────────────────

(async () => {
  const pptx = build();
  const outPath = path.resolve(__dirname, '..', 'INVESTOR_DECK_INDIA_2026.pptx');
  console.log('Generating PPTX...');
  const buffer = await pptx.write('nodebuffer');
  fs.writeFileSync(outPath, buffer);
  console.log(`Done: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
})().catch(e => { console.error(e); process.exit(1); });
