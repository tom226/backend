/* ───────────────────────────────────────────────────────────────────
   The Nursery Green — Investor Deck PDF v3
   8 pages, catchy light palette, bigger fonts, story page, zero dead space
   ─────────────────────────────────────────────────────────────────── */

const path = require('path');
const fs   = require('fs');
const puppeteer = require('puppeteer');

const IMG = path.join(__dirname, '..', 'Images');
const OUT = path.resolve(__dirname, '..', 'INVESTOR_DECK_INDIA_2026.pdf');

function b64(f) {
  const p = path.join(IMG, f);
  if (!fs.existsSync(p)) return '';
  const e = path.extname(f).replace('.','').toLowerCase();
  return 'data:image/' + (e==='jpg'?'jpeg':e) + ';base64,' + fs.readFileSync(p).toString('base64');
}

const logo = b64('logo.png');
const banner = b64('Banner.png');
const prodsAll = b64('Products.png');
const prods = [
  { img: b64('Plant Booster Spray.png'),   name: 'Plant Booster Spray', price: '₹180' },
  { img: b64('Neem Oil.png'),              name: 'Neem Oil',            price: '₹150' },
  { img: b64('Flower Mixture.png'),        name: 'Flower Mixture',      price: '₹230' },
  { img: b64('All in one mixture.png'),    name: 'All-in-One Mixture',  price: '₹199' },
  { img: b64('Flower Booster Spray.png'),  name: 'Flower Booster',      price: '₹180' },
  { img: b64('Vermi Compost.jpg'),         name: 'Vermi Compost',       price: '₹220' },
];

function html() {
return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">
<title>The Nursery Green — Investor Deck 2026</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --g:#2d8a5e;--gd:#1a5c3a;--gl:rgba(45,138,94,.08);
  --li:#c5f76a;--am:#f6c957;
  --sand:#e8f5e0;--lt:#f0f9ea;--bg:#f4faf0;
  --bd:#d4e8cc;--dk:#1f3328;--tx:#2a3f30;--mt:#5e8a6a;
  --w:#fff;--r:#e85d5d;--bl:#4a90d9;--pu:#8b5cf6;--tl:#14b8a6;--pk:#ec4899;
}
@page{size:A4;margin:0}
html,body{margin:0;padding:0}
body{font-family:'Segoe UI','Sora',sans-serif;font-size:10.5pt;color:var(--tx);line-height:1.5;background:var(--w);
  -webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}

/* ── PAGE ── */
.pg{width:210mm;height:297mm;padding:10mm 14mm 10mm 14mm;page-break-after:always;position:relative;overflow:hidden;
  background:linear-gradient(170deg,#f0fae8 0%,#e8f5de 35%,#f2fced 65%,#eaf7e2 100%)}
.pg:last-child{page-break-after:avoid}
.pg::before{content:'';position:absolute;top:0;left:0;right:0;height:3.5px;background:linear-gradient(90deg,#2d8a5e,#7ee8a8,#c5f76a,#2d8a5e)}

/* ── COVER ── */
.cover{background:linear-gradient(160deg,#1a5c3a 0%,#2d8a5e 40%,#3fa876 100%);color:#fff;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;padding:28mm 24mm}
.cover::before{background:linear-gradient(90deg,#c5f76a,#7ee8a8,#c5f76a);height:4.5px}
.dc{position:absolute;border-radius:50%;pointer-events:none}
.dc1{top:-55mm;right:-30mm;width:180mm;height:180mm;background:radial-gradient(circle,rgba(126,232,168,.12),transparent 70%)}
.dc2{bottom:-45mm;left:-25mm;width:140mm;height:140mm;background:radial-gradient(circle,rgba(45,138,94,.15),transparent 70%)}
.dc3{top:45mm;right:20mm;width:65mm;height:65mm;background:radial-gradient(circle,rgba(197,247,106,.12),transparent 70%)}
.cover .lgs{display:flex;align-items:center;gap:12px;margin-bottom:18mm;z-index:1;position:relative}
.cover .lgs img{width:17mm;height:17mm;border-radius:4mm}
.cover .lgs span{font-size:11pt;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.6);font-weight:600}
.ctit{font-size:38pt;font-weight:800;line-height:1.08;margin-bottom:4mm;z-index:1;position:relative}
.cacc{width:48mm;height:3px;background:linear-gradient(90deg,var(--li),var(--am));margin-bottom:5mm;border-radius:2px;z-index:1;position:relative}
.csub{font-size:16pt;color:var(--li);font-weight:500;margin-bottom:10mm;z-index:1;position:relative;line-height:1.3}
.cpr{display:flex;gap:3mm;z-index:1;position:relative}
.cpr .pt{width:26mm;height:26mm;border-radius:4mm;background:rgba(255,255,255,.07);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:2mm;border:1px solid rgba(255,255,255,.08)}
.cpr .pt img{max-width:100%;max-height:100%;object-fit:contain}
.cmt{margin-top:12mm;font-size:9pt;color:rgba(255,255,255,.42);z-index:1;position:relative;line-height:1.7}

/* ── HEADINGS ── */
.sn{display:inline-block;background:linear-gradient(135deg,#2d8a5e,#3fa876);color:#fff;font-size:8pt;font-weight:700;padding:2px 10px;border-radius:12px;margin-bottom:2mm;letter-spacing:.6px}
h1{font-size:20pt;font-weight:800;color:var(--gd);margin-bottom:1.5mm;line-height:1.12}
.ss{font-size:10.5pt;color:var(--mt);margin-bottom:3mm;padding-bottom:2mm;border-bottom:1.5px solid var(--bd)}
h2{font-size:13pt;font-weight:700;color:var(--g);margin:3mm 0 2mm 0}
h3{font-size:11pt;font-weight:600;color:var(--dk);margin:2mm 0 1mm 0}
p,li{font-size:10pt;line-height:1.5;color:var(--tx)}
ul,ol{padding-left:5mm;margin:1mm 0}li{margin-bottom:.8mm}

/* ── CARD ── */
.cg{display:grid;gap:2.5mm}.cg.c2{grid-template-columns:1fr 1fr}.cg.c3{grid-template-columns:1fr 1fr 1fr}.cg.c4{grid-template-columns:1fr 1fr 1fr 1fr}
.cd{background:var(--w);border-radius:3.5mm;padding:3.5mm 4mm;border-left:3px solid var(--g);box-shadow:0 1px 4px rgba(0,0,0,.04)}
.cd.aa{border-left-color:var(--am)}.cd.ab{border-left-color:var(--bl)}.cd.at{border-left-color:var(--tl)}
.cd.ap{border-left-color:var(--pu)}.cd.apk{border-left-color:var(--pk)}.cd.ar{border-left-color:var(--r)}
.ci{font-size:16pt;margin-bottom:1mm}
.ct{font-size:10.5pt;font-weight:700;color:var(--dk);margin-bottom:.5mm}
.cb{font-size:9pt;color:var(--mt);line-height:1.45}

/* ── KPI ── */
.kg{display:grid;gap:2.5mm}.kg.c4{grid-template-columns:repeat(4,1fr)}.kg.c3{grid-template-columns:repeat(3,1fr)}
.kp{background:var(--w);border-radius:3mm;padding:3mm;text-align:center;border:1px solid var(--bd);box-shadow:0 1px 3px rgba(0,0,0,.03)}
.ktb{height:2.5px;border-radius:1px;margin:0 auto 2mm auto;width:55%}
.kv{font-size:15pt;font-weight:800;color:var(--gd);line-height:1.1}
.kl{font-size:7.5pt;color:var(--mt);margin-top:1mm}

/* ── TABLE ── */
table{width:100%;border-collapse:collapse;margin:2mm 0;font-size:9pt}
thead th{background:linear-gradient(135deg,#1a5c3a,#2d8a5e);color:#fff;padding:2.5mm 3mm;text-align:left;font-weight:600;font-size:8pt;letter-spacing:.3px}
tbody td{padding:2mm 3mm;border-bottom:.5px solid var(--bd)}
tbody tr:nth-child(even) td{background:rgba(224,245,210,.4)}
.ck{color:var(--g);font-weight:bold;font-size:11pt}.cx{color:var(--r);font-weight:bold;font-size:11pt}

/* ── CALLOUT ── */
.co{background:#eaf7e2;border-left:3.5px solid var(--g);padding:3mm 4mm;border-radius:0 3mm 3mm 0;margin:2.5mm 0;font-size:10pt;color:var(--tx);line-height:1.5;box-shadow:0 1px 4px rgba(0,0,0,.04)}
.co.dk{background:linear-gradient(135deg,#1a5c3a,#2d8a5e);border-left-color:var(--li);color:rgba(255,255,255,.9)}
.co strong{color:var(--g)}.co.dk strong{color:var(--li)}

/* ── FLYWHEEL ── */
.fwc{display:flex;gap:4mm;align-items:stretch;margin:2mm 0}
.fws{flex:1}.fwi{flex:0 0 52mm;background:linear-gradient(160deg,#1a5c3a,#3fa876);color:#fff;border-radius:3.5mm;padding:4mm}
.fwst{display:flex;align-items:center;gap:2.5mm;margin-bottom:2mm}
.sd{width:8mm;height:8mm;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11pt;flex-shrink:0;color:#fff}
.stx{font-size:9pt;line-height:1.35}.stx strong{color:var(--dk)}.stx span{color:var(--mt)}
.fwi h3{color:var(--li);margin-bottom:1.5mm;font-size:10pt}.fwi p{color:rgba(255,255,255,.78);font-size:9pt;line-height:1.4}

/* ── STREAMS ── */
.sg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2.5mm}
.st{display:flex;align-items:center;gap:2.5mm;background:var(--w);border-radius:3mm;padding:2.5mm 3mm;border:1px solid var(--bd);box-shadow:0 1px 3px rgba(0,0,0,.03)}
.sdt{width:7mm;height:7mm;border-radius:50%;flex-shrink:0}
.si{flex:1}.sn2{font-size:9.5pt;font-weight:700;color:var(--dk)}.sm{font-size:7.5pt;color:var(--mt)}
.sss{font-size:7pt;font-weight:700;padding:1mm 3mm;border-radius:3mm;color:#fff}
.sss.lv{background:var(--g)}.sss.pl{background:var(--am);color:var(--gd)}

/* ── TIMELINE ── */
.tl{margin:2mm 0}
.tp{display:flex;gap:3mm;margin-bottom:2.5mm;align-items:flex-start}
.pp{flex:0 0 24mm;padding:2mm;border-radius:3mm;color:#fff;font-size:8pt;font-weight:700;text-align:center}
.pi{flex:1;display:flex;flex-wrap:wrap;gap:1.5mm}
.pii{font-size:8pt;padding:1.2mm 3mm;border-radius:2mm;background:var(--w);color:var(--tx);border:.5px solid var(--bd);box-shadow:0 .5px 2px rgba(0,0,0,.03)}

/* ── PRODUCTS ── */
.pgr{display:grid;grid-template-columns:repeat(6,1fr);gap:2.5mm;margin:2mm 0}
.pc{background:var(--w);border-radius:3mm;padding:2.5mm;text-align:center;border:1px solid var(--bd);box-shadow:0 2px 6px rgba(0,0,0,.04)}
.pc img{width:100%;height:28mm;object-fit:contain;margin-bottom:1.5mm}
.pc .pn{font-size:8pt;font-weight:600;color:var(--dk);margin-bottom:1mm}
.pc .pp2{display:inline-block;font-size:8pt;font-weight:700;color:var(--gd);background:var(--li);padding:.5mm 3mm;border-radius:3mm}

/* ── PROGRESS ── */
.pr{display:flex;align-items:center;gap:2mm;margin-bottom:2mm}
.prl{flex:0 0 24mm;font-size:8.5pt;color:var(--dk);text-align:right;font-weight:600}
.prt{flex:1;height:5mm;background:var(--sand);border-radius:2.5mm;overflow:hidden}
.prf{height:100%;border-radius:2.5mm}
.prv{flex:0 0 12mm;font-size:8pt;font-weight:700}

/* ── ASK ── */
.ah{background:linear-gradient(135deg,#1a5c3a,#3fa876);color:#fff;border-radius:5mm;padding:5mm 8mm;text-align:center;margin:3mm 0}
.aav{font-size:30pt;font-weight:800;letter-spacing:.5px}
.alb{font-size:11pt;color:var(--li);margin-top:1mm;letter-spacing:2px}

/* ── ALLOC BAR ── */
.ab{display:flex;height:7mm;border-radius:3.5mm;overflow:hidden;margin:2mm 0;box-shadow:0 1px 4px rgba(0,0,0,.06)}
.as{display:flex;align-items:center;justify-content:center;font-size:7pt;font-weight:700;color:#fff}

/* ── 2-COL ── */
.tc{display:grid;grid-template-columns:1fr 1fr;gap:4mm}

/* ── MOAT ── */
.mg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2.5mm}
.mc{background:var(--w);border-radius:3mm;padding:3mm 3.5mm;border-left:3px solid var(--g);box-shadow:0 1px 3px rgba(0,0,0,.03)}

/* ── PHONE MOCKUP ── */
.phones{display:flex;gap:5mm;justify-content:center;margin:3mm 0}
.ph-wrap{text-align:center}
.phone{width:38mm;background:#fff;border-radius:5.5mm;border:2.5px solid #222;overflow:hidden;box-shadow:0 6px 20px rgba(0,0,0,.15)}
.phone-notch{width:15mm;height:3mm;background:#222;border-radius:0 0 2.5mm 2.5mm;margin:0 auto}
.phone-screen{height:66mm;overflow:hidden}
.phone-nav{height:5.5mm;background:#1a5c3a;display:flex;align-items:center;justify-content:space-around;padding:0 3mm}
.phone-nav span{font-size:5pt;color:rgba(255,255,255,.7)}
.ph-label{font-size:8.5pt;font-weight:700;color:var(--gd);margin-top:2mm}

/* Scanner */
.scr-scanner{background:linear-gradient(180deg,#1a5c3a,#3fa876);height:100%}
.scr-scanner .sh{padding:2.5mm 3mm;text-align:center}
.scr-scanner .sh p{font-size:5.5pt;color:var(--li);font-weight:700;letter-spacing:.6px}
.scr-scanner .sup{width:22mm;height:22mm;border-radius:3.5mm;border:2px dashed var(--li);margin:1.5mm auto;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.05)}
.scr-scanner .sup span{font-size:16pt}
.scr-scanner .sres{margin:2mm 2.5mm;background:rgba(255,255,255,.12);border-radius:2.5mm;padding:2mm}
.scr-scanner .sres p{font-size:5pt;color:#fff;line-height:1.45}
.scr-scanner .sres .tag{display:inline-block;background:var(--li);color:var(--gd);font-size:4.5pt;padding:.5mm 2mm;border-radius:1.5mm;font-weight:700;margin-top:.8mm}

/* Shop */
.scr-shop{background:#fff;height:100%}
.scr-shop .sh2{background:var(--g);padding:2mm 3mm;display:flex;align-items:center;gap:2mm}
.scr-shop .sh2 span{font-size:5.5pt;color:#fff;font-weight:600}
.scr-shop .sh2 .tag2{margin-left:auto;font-size:4.5pt;background:var(--li);color:var(--gd);padding:.5mm 2mm;border-radius:1.5mm;font-weight:700}
.scr-shop .spgrid{display:grid;grid-template-columns:1fr 1fr;gap:2mm;padding:2mm}
.scr-shop .spc{background:var(--lt);border-radius:2mm;padding:1.5mm;text-align:center;border:.5px solid var(--bd)}
.scr-shop .spc img{width:100%;height:15mm;object-fit:contain}
.scr-shop .spc p{font-size:4pt;color:var(--dk);font-weight:600;margin:.5mm 0}
.scr-shop .spc .pr2{font-size:4pt;color:var(--g);font-weight:700}
.scr-shop .sbtn{display:block;margin:1.5mm auto;background:var(--g);color:#fff;font-size:4pt;padding:1mm 3.5mm;border-radius:2mm;text-align:center;width:fit-content;font-weight:600}

/* Chat */
.scr-chat{background:var(--lt);height:100%}
.scr-chat .ch{background:var(--g);padding:2mm 3mm}
.scr-chat .ch span{font-size:5.5pt;color:#fff;font-weight:600}
.scr-chat .msgs{padding:2mm 2.5mm}
.scr-chat .msg{margin-bottom:2mm;max-width:85%}
.scr-chat .msg.bot{background:#fff;border-radius:0 2.5mm 2.5mm 2.5mm;padding:1.5mm 2.5mm;border:.5px solid var(--bd)}
.scr-chat .msg.usr{background:var(--g);color:#fff;border-radius:2.5mm 0 2.5mm 2.5mm;padding:1.5mm 2.5mm;margin-left:auto}
.scr-chat .msg p{font-size:4.5pt;line-height:1.45}.scr-chat .msg.usr p{color:#fff}
.scr-chat .msg .rec{background:var(--sand);border-radius:1.5mm;padding:1mm 2mm;margin-top:.8mm}
.scr-chat .msg .rec p{font-size:4pt;color:var(--g);font-weight:600}

/* Community */
.scr-comm{background:#fff;height:100%}
.scr-comm .ch2{background:var(--g);padding:2mm 3mm}
.scr-comm .ch2 span{font-size:5.5pt;color:#fff;font-weight:600}
.scr-comm .tabs{display:flex;background:var(--sand);border-bottom:.5px solid var(--bd)}
.scr-comm .tabs span{flex:1;text-align:center;font-size:4pt;padding:1.2mm;color:var(--mt);font-weight:600}
.scr-comm .tabs span.act{color:var(--g);border-bottom:1.5px solid var(--g)}
.scr-comm .post{padding:2mm 3mm;border-bottom:.5px solid var(--bd)}
.scr-comm .post .pa{display:flex;align-items:center;gap:1.5mm;margin-bottom:.8mm}
.scr-comm .post .av{width:4.5mm;height:4.5mm;border-radius:50%;background:var(--g);display:flex;align-items:center;justify-content:center;font-size:3.5pt;color:#fff}
.scr-comm .post .pa span{font-size:4pt;color:var(--dk);font-weight:600}
.scr-comm .post .pa em{font-size:3.5pt;color:var(--mt);font-style:normal}
.scr-comm .post p.ptxt{font-size:4pt;color:var(--dk);line-height:1.45;margin-bottom:.8mm}
.scr-comm .post .pact{display:flex;gap:2.5mm}
.scr-comm .post .pact span{font-size:3.5pt;color:var(--mt)}

/* ── STORY ── */
.story-q{font-size:18pt;font-style:italic;font-weight:300;color:var(--g);line-height:1.35;margin:4mm 0;padding:0 4mm;border-left:4px solid var(--li)}
.vision-box{background:linear-gradient(135deg,#1a5c3a,#2d8a5e);border-radius:4mm;padding:5mm 6mm;color:#fff;margin:3mm 0}
.vision-box h2{color:var(--li);margin:0 0 2mm 0;font-size:14pt}
.vision-box p{color:rgba(255,255,255,.85);font-size:10.5pt;line-height:1.55}
.timeline-story{display:flex;gap:3mm;margin:3mm 0}
.ts-step{flex:1;background:var(--w);border-radius:3.5mm;padding:3.5mm;text-align:center;border:1px solid var(--bd);box-shadow:0 1px 5px rgba(0,0,0,.04)}
.ts-step .ts-icon{font-size:22pt;margin-bottom:1.5mm}
.ts-step .ts-year{font-size:8pt;color:var(--g);font-weight:700;margin-bottom:.5mm}
.ts-step .ts-txt{font-size:8.5pt;color:var(--mt);line-height:1.4}

/* ── CLOSING ── */
.closing{background:linear-gradient(160deg,#1a5c3a 0%,#3fa876 100%);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30mm 24mm}
.closing::before{background:linear-gradient(90deg,#c5f76a,#7ee8a8,#c5f76a);height:4.5px}
.cl-logo{width:22mm;height:22mm;margin-bottom:8mm;border-radius:5mm}
.cl-title{font-size:32pt;font-weight:800;margin-bottom:3mm}
.cl-acc{width:40mm;height:3px;background:linear-gradient(90deg,var(--li),var(--am));margin:0 auto 6mm auto;border-radius:2px}
.cl-sub{font-size:15pt;color:var(--li);margin-bottom:10mm;line-height:1.4}
.cl-url{font-size:13pt;font-weight:600;color:#fff;opacity:.7}
.cl-prods{display:flex;gap:4mm;margin-top:12mm}
.cl-p{width:17mm;height:17mm;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(126,232,168,.3);display:flex;align-items:center;justify-content:center;padding:2mm}
.cl-p img{max-width:100%;max-height:100%;object-fit:contain}
.cl-ft{margin-top:15mm;font-size:8pt;color:rgba(255,255,255,.3)}

/* ── FOOTER ── */
.pf{position:absolute;bottom:6mm;left:14mm;right:14mm;font-size:7pt;color:var(--mt);display:flex;justify-content:space-between;border-top:1px solid var(--bd);padding-top:1.5mm}
.pf .r{opacity:.45}

/* SEVERITY */
.sh2c{color:var(--r);font-weight:700}.smm{color:var(--am);font-weight:700}.sl{color:var(--tl);font-weight:700}

@media print{body{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.pg{page-break-inside:avoid}}
</style></head><body>

<!-- ══════════ PAGE 1 — COVER ══════════ -->
<div class="pg cover">
  <div class="dc dc1"></div><div class="dc dc2"></div><div class="dc dc3"></div>
  ${logo?'<div class="lgs"><img src="'+logo+'" alt="Logo"><span>The Nursery Green</span></div>':''}
  <div class="ctit">The Nursery Green</div>
  <div class="cacc"></div>
  <div class="csub">India's First Integrated<br>Plant Health + Commerce Platform</div>
  <div class="cpr">${prods.filter(p=>p.img).map(p=>'<div class="pt"><img src="'+p.img+'" alt="'+p.name+'"></div>').join('')}</div>
  <div class="cmt">Investor Deck &bull; February 2026 &bull; Confidential<br>Live on Railway &bull; Expo / React Native &bull; thenurserygreen.com</div>
</div>

<!-- ══════════ PAGE 2 — OUR STORY & VISION ══════════ -->
<div class="pg">
  <span class="sn">OUR STORY</span>
  <h1>How It All Started</h1>
  <div class="ss">From a dying rose to India's plant health revolution</div>

  <div class="story-q">"I watched my grandmother's prized rose garden die because she trusted a shopkeeper's generic advice. When I searched online, every answer was different — YouTube said one thing, a nursery WhatsApp group said another, and Amazon reviews were useless. That day, I knew India needed a single platform that could truly diagnose, treat, and care for plants."</div>

  <p style="margin-bottom:3mm;font-size:10.5pt">That personal frustration became <strong>The Nursery Green</strong> — a platform that doesn't just sell plant products, but <strong>understands</strong> your plant's problem, <strong>verifies</strong> it scientifically, and <strong>prescribes</strong> the exact organic remedy. We built it because 30 million Indian households deserve a plant doctor in their pocket.</p>

  <div class="timeline-story">
    <div class="ts-step"><div class="ts-icon">💡</div><div class="ts-year">2024</div><div class="ts-txt">The idea — frustration with plant misdiagnosis drives the founding vision</div></div>
    <div class="ts-step"><div class="ts-icon">🛠️</div><div class="ts-year">Early 2025</div><div class="ts-txt">Built the stack — Node.js backend, MongoDB, Razorpay, deployed on Railway</div></div>
    <div class="ts-step"><div class="ts-icon">📱</div><div class="ts-year">Mid 2025</div><div class="ts-txt">Mobile app — Expo SDK 50, React Native, Google/FB OAuth, live on stores</div></div>
    <div class="ts-step"><div class="ts-icon">🧠</div><div class="ts-year">Late 2025</div><div class="ts-txt">Knowledge engine — 50+ diseases, 100+ desi remedies, auto-refreshing DB</div></div>
    <div class="ts-step"><div class="ts-icon">🚀</div><div class="ts-year">2026</div><div class="ts-txt">Scale — seed round, 5 metro cities, Hindi voice, community-led growth</div></div>
  </div>

  <div class="vision-box">
    <h2>🌱 Our Vision</h2>
    <p>To become India's default plant care companion — the platform every plant parent turns to first. We believe every plant deserves the right diagnosis, every home deserves a green corner, and every community should share the joy of growing. By 2030, we will serve <strong style="color:var(--li)">50 million households</strong> across India and Southeast Asia with AI-powered plant intelligence, vernacular voice support, and the world's largest India-specific plant health dataset.</p>
  </div>

  <div class="tc" style="margin-top:3mm">
    <div class="co" style="border-left-color:var(--li)"><strong style="color:var(--gd)">Mission:</strong> Make expert plant care accessible to every Indian household — regardless of language, location, or expertise.</div>
    <div class="co" style="border-left-color:var(--am)"><strong style="color:var(--gd)">Values:</strong> Verification-first science, organic-only products, community trust, 100% transparency in diagnosis confidence scores.</div>
  </div>

  <div class="kg c3" style="margin-top:3mm">
    <div class="kp"><div class="ktb" style="background:var(--g)"></div><div class="kv">30M+</div><div class="kl">Indian plant-owning households</div></div>
    <div class="kp"><div class="ktb" style="background:var(--am)"></div><div class="kv">₹18K Cr</div><div class="kl">Annual plant care market</div></div>
    <div class="kp"><div class="ktb" style="background:var(--bl)"></div><div class="kv">0</div><div class="kl">Integrated competitors</div></div>
  </div>

  <div class="pf"><span>The Nursery Green — Investor Deck</span><span class="r">Page 2 &bull; Confidential</span></div>
</div>

<!-- ══════════ PAGE 3 — PROBLEM + SOLUTION + APP ══════════ -->
<div class="pg">
  <span class="sn">THE PROBLEM</span>
  <h1>₹18,000 Crore of Silent Plant Deaths</h1>
  <div class="ss">Fragmented advice, zero verification, broken trust</div>

  <div class="cg c3" style="margin-bottom:2.5mm">
    <div class="cd ar"><div class="ci">🔍</div><div class="ct">Misdiagnosis</div><div class="cb">60%+ wrong treatment from generic Google searches</div></div>
    <div class="cd aa"><div class="ci">🧩</div><div class="ct">Fragmented</div><div class="cb">YouTube + Amazon + WhatsApp = no single truth</div></div>
    <div class="cd ap"><div class="ci">🚫</div><div class="ct">No Verification</div><div class="cb">Advice without checking leaf, soil, or environment</div></div>
    <div class="cd ab"><div class="ci">💸</div><div class="ct">Trust Deficit</div><div class="cb">Can't tell if ₹200 spray actually works</div></div>
    <div class="cd at"><div class="ci">🔄</div><div class="ct">No Feedback Loop</div><div class="cb">Brands sell but never learn if it worked</div></div>
    <div class="cd apk"><div class="ci">🌍</div><div class="ct">No Indian Context</div><div class="cb">Global apps miss Indian plants, climates, soils</div></div>
  </div>

  <span class="sn">OUR SOLUTION</span>
  <h1>Built & Live Today</h1>
  <div class="phones">
    <div class="ph-wrap"><div class="phone"><div class="phone-notch"></div><div class="phone-screen scr-scanner"><div class="sh"><p>🌿 PLANT SCANNER</p></div><div class="sup"><span>📷</span></div><div class="sres"><p><strong style="color:var(--li)">Diagnosis Result</strong></p><p>Leaf Spot Disease detected<br>Confidence: 87%</p><div class="tag">3 REMEDIES FOUND</div><p style="margin-top:1mm;font-size:4pt;color:rgba(255,255,255,.55)">✅ Neem oil spray (7 days)<br>✅ Remove affected leaves<br>✅ Improve air circulation</p></div></div><div class="phone-nav"><span>🏠</span><span>📷</span><span>💬</span><span>👤</span></div></div><div class="ph-label">Plant Scanner</div></div>
    <div class="ph-wrap"><div class="phone"><div class="phone-notch"></div><div class="phone-screen scr-chat"><div class="ch"><span>💬 Plant Care Assistant</span></div><div class="msgs"><div class="msg usr"><p>My money plant leaves turning yellow</p></div><div class="msg bot"><p>Yellow leaves can mean overwatering or nutrient deficiency. Let me check...</p><div class="rec"><p>🧪 Recommended: All-in-One ₹199</p></div></div><div class="msg usr"><p>Add to cart!</p></div><div class="msg bot"><p>✅ Added! Cart: 1× All-in-One ₹199<br>Proceed to checkout?</p></div></div></div><div class="phone-nav"><span>🏠</span><span>📷</span><span>💬</span><span>👤</span></div></div><div class="ph-label">Smart Chatbot</div></div>
    <div class="ph-wrap"><div class="phone"><div class="phone-notch"></div><div class="phone-screen scr-shop"><div class="sh2"><span>🛒 Shop</span><div class="tag2">🛒 2</div></div><div class="spgrid">${prods.slice(0,4).filter(p=>p.img).map(p=>'<div class="spc"><img src="'+p.img+'" alt="'+p.name+'"><p>'+p.name.split(' ').slice(0,2).join(' ')+'</p><div class="pr2">'+p.price+'</div></div>').join('')}</div><div class="sbtn">🛒 View Cart (₹379)</div></div><div class="phone-nav"><span>🏠</span><span>📷</span><span>💬</span><span>👤</span></div></div><div class="ph-label">Shop & Cart</div></div>
    <div class="ph-wrap"><div class="phone"><div class="phone-notch"></div><div class="phone-screen scr-comm"><div class="ch2"><span>👥 Plant Community</span></div><div class="tabs"><span class="act">Show&Tell</span><span>Tips</span><span>Help</span></div><div class="post"><div class="pa"><div class="av">P</div><span>Priya M.</span><em>&bull; Mumbai</em></div><p class="ptxt">My jasmine recovered using neem oil! Before/after 🌸</p><div class="pact"><span>❤️ 24</span><span>💬 8</span></div></div><div class="post"><div class="pa"><div class="av">R</div><span>Rahul K.</span><em>&bull; Delhi</em></div><p class="ptxt">Tip: Bone meal during monsoon for stronger roots 🌱</p><div class="pact"><span>❤️ 41</span><span>💬 12</span></div></div><div class="post"><div class="pa"><div class="av">A</div><span>Anita S.</span><em>&bull; Pune</em></div><p class="ptxt">White powder on my roses — what should I do? 🤔</p><div class="pact"><span>❤️ 5</span><span>💬 15</span></div></div></div><div class="phone-nav"><span>🏠</span><span>📷</span><span>💬</span><span>👤</span></div></div><div class="ph-label">Community</div></div>
  </div>

  <div class="cg c3" style="margin-top:2mm">
    <div class="cd"><div class="ct">📷 AI Scanner</div><div class="cb">50+ diseases, 100+ Indian remedies, confidence scores, 7-field verification, hybrid online/offline</div></div>
    <div class="cd ab"><div class="ct">🧠 Knowledge DB</div><div class="cb">MongoDB, 6 categories, daily auto-refresh, evidence scoring, full audit trail</div></div>
    <div class="cd at"><div class="ct">💬 Chat Commerce</div><div class="cb">Chat → browse → cart → order, Razorpay UPI+Card, order tracking</div></div>
  </div>
  <div class="pf"><span>All features live — Railway + Razorpay + OAuth</span><span class="r">Page 3 &bull; Confidential</span></div>
</div>

<!-- ══════════ PAGE 4 — PRODUCTS + BUSINESS MODEL ══════════ -->
<div class="pg">
  <span class="sn">PRODUCTS</span>
  <h1>100% Organic — Made for Indian Conditions</h1>
  <div class="pgr">${prods.filter(p=>p.img).map(p=>'<div class="pc"><img src="'+p.img+'" alt="'+p.name+'"><div class="pn">'+p.name+'</div><div class="pp2">'+p.price+'</div></div>').join('')}</div>
  <div class="co" style="text-align:center;margin-bottom:3mm">Free shipping ₹1,999+ &bull; 30-day replacement guarantee &bull; Traditional desi remedies included</div>

  <span class="sn">BUSINESS MODEL</span>
  <h1>Subscription Layered Over Repeat D2C</h1>
  <div class="sg" style="margin-bottom:2mm">
    <div class="st"><div class="sdt" style="background:var(--g)"></div><div class="si"><div class="sn2">D2C Products</div><div class="sm">GM: 45–55%</div></div><span class="sss lv">LIVE</span></div>
    <div class="st"><div class="sdt" style="background:var(--bl)"></div><div class="si"><div class="sn2">Subscription</div><div class="sm">GM: 80–90%</div></div><span class="sss pl">Q3 '26</span></div>
    <div class="st"><div class="sdt" style="background:var(--tl)"></div><div class="si"><div class="sn2">B2B / B2B2C</div><div class="sm">GM: 60–70%</div></div><span class="sss pl">2027</span></div>
    <div class="st"><div class="sdt" style="background:var(--am)"></div><div class="si"><div class="sn2">Marketplace</div><div class="sm">GM: 15–25%</div></div><span class="sss pl">2027</span></div>
    <div class="st"><div class="sdt" style="background:var(--pu)"></div><div class="si"><div class="sn2">Affiliate</div><div class="sm">GM: 70–80%</div></div><span class="sss pl">2027</span></div>
    <div class="st"><div class="sdt" style="background:var(--pk)"></div><div class="si"><div class="sn2">Data & Insights</div><div class="sm">GM: 90%+</div></div><span class="sss pl">2028</span></div>
  </div>
  <div class="tc">
    <div>
      <h2>Unit Economics</h2>
      <table><thead><tr><th>Metric</th><th>Target</th></tr></thead><tbody>
        <tr><td>AOV</td><td><strong>₹650–₹1,200</strong></td></tr>
        <tr><td>Repeat Frequency</td><td><strong>4–8×/year</strong></td></tr>
        <tr><td>CAC</td><td><strong>₹150–₹400</strong></td></tr>
        <tr><td>CAC Payback</td><td><strong>&lt;6 months</strong></td></tr>
        <tr><td>Blended Gross Margin</td><td><strong>55–62%</strong></td></tr>
        <tr><td>LTV:CAC Ratio</td><td><strong>&gt;4:1</strong></td></tr>
      </tbody></table>
    </div>
    <div>
      <h2>Go-to-Market</h2>
      <div class="cg" style="gap:2mm">
        <div class="cd"><div class="ct">🏙️ Phase 1 (0–12m): Metros</div><div class="cb">Mumbai, Delhi, BLR, Pune, HYD, Chennai. Scanner viral loops ₹50–100 CAC. 500 community seeders. 50 micro-influencers.</div></div>
        <div class="cd at"><div class="ct">🌍 Phase 2 (12–24m): Tier-2</div><div class="cb">Hindi + 4 languages. Voice diagnosis. ₹299 monthly bundles. City cohorts. College programs.</div></div>
        <div class="cd aa"><div class="ct">🏢 Phase 3 (24–36m): B2B</div><div class="cb">RWA managed care. Nursery partnerships. Smart City. White-label scanner.</div></div>
      </div>
    </div>
  </div>
  <div class="pf"><span>North Star: Monthly Diagnosis-to-Purchase Conversions</span><span class="r">Page 4 &bull; Confidential</span></div>
</div>

<!-- ══════════ PAGE 5 — COMPETITIVE + FLYWHEEL + WHY NOW ══════════ -->
<div class="pg">
  <span class="sn">COMPETITIVE EDGE</span>
  <h1>No One in India Combines All Four Layers</h1>
  <table style="margin-bottom:2mm">
    <thead><tr><th>Capability</th><th>E-commerce</th><th>Content</th><th>Plant ID Apps</th><th style="background:var(--g)">Nursery Green</th></tr></thead>
    <tbody>
      <tr><td>Commerce + Payments</td><td class="ck">✅</td><td class="cx">❌</td><td class="cx">❌</td><td class="ck">✅</td></tr>
      <tr><td>Verified Diagnosis</td><td class="cx">❌</td><td class="cx">❌</td><td>Partial</td><td class="ck">✅</td></tr>
      <tr><td>Auto-refresh Knowledge DB</td><td class="cx">❌</td><td class="cx">❌</td><td class="cx">❌</td><td class="ck">✅</td></tr>
      <tr><td>Community + Social Proof</td><td class="cx">❌</td><td>Partial</td><td class="cx">❌</td><td class="ck">✅</td></tr>
      <tr><td>India-specific Remedies</td><td class="cx">❌</td><td>Partial</td><td class="cx">❌</td><td class="ck">✅</td></tr>
      <tr><td>Chat → Order Flow</td><td class="cx">❌</td><td class="cx">❌</td><td class="cx">❌</td><td class="ck">✅</td></tr>
      <tr><td>Diagnosis Audit Trail</td><td class="cx">❌</td><td class="cx">❌</td><td class="cx">❌</td><td class="ck">✅</td></tr>
    </tbody>
  </table>

  <span class="sn">DATA FLYWHEEL</span>
  <h1>Every Interaction Makes Us Smarter</h1>
  <div class="fwc">
    <div class="fws">
      <div class="fwst"><div class="sd" style="background:var(--g)">📷</div><div class="stx"><strong>Scan / Ask</strong> — <span>User uploads photo or asks chatbot</span></div></div>
      <div class="fwst"><div class="sd" style="background:var(--tl)">✅</div><div class="stx"><strong>Verify</strong> — <span>Check leaf, soil, environment context</span></div></div>
      <div class="fwst"><div class="sd" style="background:var(--bl)">🧠</div><div class="stx"><strong>Diagnose</strong> — <span>KB returns verified match + solution</span></div></div>
      <div class="fwst"><div class="sd" style="background:var(--am)">🛒</div><div class="stx"><strong>Buy</strong> — <span>User purchases recommended product</span></div></div>
      <div class="fwst"><div class="sd" style="background:var(--pu)">📊</div><div class="stx"><strong>Log</strong> — <span>DiagnosisCase recorded with full context</span></div></div>
      <div class="fwst"><div class="sd" style="background:var(--g)">🔄</div><div class="stx"><strong>Learn</strong> — <span>Community + data → accuracy rises</span></div></div>
    </div>
    <div class="fwi">
      <h3>100K+ Cases Target</h3><p>India-specific plant health dataset — unmatched, proprietary, growing daily.</p>
      <h3 style="margin-top:2mm">Compounding Effect</h3><p>Better accuracy → higher conversion → more data → lower CAC.</p>
      <h3 style="margin-top:2mm">Defensible Moat</h3><p>Integration depth + flywheel = 2–3 years to replicate.</p>
    </div>
  </div>

  <div class="kg c4" style="margin-top:2mm">
    <div class="kp"><div class="ktb" style="background:var(--g)"></div><div class="kv">21.7B</div><div class="kl">UPI txns (Jan '26)</div></div>
    <div class="kp"><div class="ktb" style="background:var(--tl)"></div><div class="kv">$163B</div><div class="kl">E-commerce '26</div></div>
    <div class="kp"><div class="ktb" style="background:var(--am)"></div><div class="kv">900M+</div><div class="kl">Smartphones</div></div>
    <div class="kp"><div class="ktb" style="background:var(--bl)"></div><div class="kv">$60B</div><div class="kl">D2C by 2027</div></div>
  </div>
  <div class="pf"><span>Sources: IBEF, NPCI, Statista</span><span class="r">Page 5 &bull; Confidential</span></div>
</div>

<!-- ══════════ PAGE 6 — FINANCIALS + $1B PATH ══════════ -->
<div class="pg">
  <span class="sn">FINANCIALS</span>
  <h1>Revenue Projections & $1B Valuation Path</h1>
  <div class="ss">Revenue growth with improving margins as subscription mix rises</div>
  <table>
    <thead><tr><th>Year</th><th>Users</th><th>Revenue</th><th>Gross Margin</th><th>EBITDA</th><th>Cum. Investment</th></tr></thead>
    <tbody>
      <tr><td><strong>Y1</strong></td><td>25K</td><td>$0.9M</td><td>43%</td><td style="color:var(--r)">-60%</td><td>$1.5M</td></tr>
      <tr><td><strong>Y2</strong></td><td>120K</td><td>$4.2M</td><td>48%</td><td style="color:var(--r)">-32%</td><td>$4.0M</td></tr>
      <tr><td><strong>Y3</strong></td><td>400K</td><td>$15M</td><td>52%</td><td style="color:var(--r)">-10%</td><td>$7.5M</td></tr>
      <tr><td><strong>Y4</strong></td><td>1.1M</td><td>$38M</td><td>56%</td><td style="color:var(--g)">+5%</td><td>$10M</td></tr>
      <tr><td><strong>Y5</strong></td><td>2.5M</td><td>$82M</td><td>59%</td><td style="color:var(--g)">+13%</td><td>$12M</td></tr>
      <tr><td><strong>Y6</strong></td><td>5M</td><td>$160M</td><td>61%</td><td style="color:var(--g)">+18%</td><td>$14M</td></tr>
      <tr><td><strong>Y7</strong></td><td>8.5M</td><td>$265M</td><td>63%</td><td style="color:var(--g)">+21%</td><td>$15M</td></tr>
      <tr><td><strong>Y8</strong></td><td>13M</td><td>$420M</td><td>64%</td><td style="color:var(--g)">+24%</td><td>$16M</td></tr>
    </tbody>
  </table>

  <div class="tc" style="margin-top:2mm">
    <div>
      <h2>EBITDA Margin Trajectory</h2>
      <div class="pr"><div class="prl">Y1</div><div class="prt"><div class="prf" style="width:3%;background:var(--r)"></div></div><div class="prv" style="color:var(--r)">-60%</div></div>
      <div class="pr"><div class="prl">Y3</div><div class="prt"><div class="prf" style="width:8%;background:var(--am)"></div></div><div class="prv" style="color:var(--am)">-10%</div></div>
      <div class="pr"><div class="prl">Y5</div><div class="prt"><div class="prf" style="width:42%;background:var(--g)"></div></div><div class="prv" style="color:var(--g)">+13%</div></div>
      <div class="pr"><div class="prl">Y8</div><div class="prt"><div class="prf" style="width:68%;background:var(--g)"></div></div><div class="prv" style="color:var(--g)">+24%</div></div>
      <h2>Profitability Path</h2>
      <ul>
        <li><strong>Y1–2:</strong> Product build + retention. Burn = flywheel investment.</li>
        <li><strong>Y3:</strong> Contribution margin positive. Subscription enters.</li>
        <li><strong>Y4:</strong> EBITDA breakeven (subscription attach &gt;8%).</li>
        <li><strong>Y5+:</strong> Data moat + community virality + SaaS margin.</li>
      </ul>
    </div>
    <div>
      <h2>$1B Valuation Path</h2>
      <table>
        <thead><tr><th>Year</th><th>Revenue</th><th>Multiple</th><th style="background:var(--g)">Valuation</th></tr></thead>
        <tbody>
          <tr><td>Y2</td><td>$4.2M</td><td>8–12×</td><td><strong>$34M–$50M</strong></td></tr>
          <tr><td>Y4</td><td>$38M</td><td>6–9×</td><td><strong>$230M–$340M</strong></td></tr>
          <tr><td style="background:rgba(126,232,168,.2)">Y6</td><td style="background:rgba(126,232,168,.2)">$160M</td><td style="background:rgba(126,232,168,.2)">5–7×</td><td style="background:rgba(126,232,168,.2)"><strong style="color:var(--g)">$800M–$1.1B ✨</strong></td></tr>
          <tr><td style="background:rgba(126,232,168,.35)">Y7</td><td style="background:rgba(126,232,168,.35)">$265M</td><td style="background:rgba(126,232,168,.35)">4–6×</td><td style="background:rgba(126,232,168,.35)"><strong style="color:var(--g)">$1.06B–$1.6B 🚀</strong></td></tr>
        </tbody>
      </table>
      <h3 style="margin-top:2mm">Indian Comparables</h3>
      <table>
        <thead><tr><th>Company</th><th>Valuation</th><th>Multiple</th></tr></thead>
        <tbody>
          <tr><td>Mamaearth</td><td>$1.2B (IPO)</td><td>~6×</td></tr>
          <tr><td>Lenskart</td><td>$4.5B</td><td>~8×</td></tr>
          <tr><td>Country Delight</td><td>$1.5B</td><td>~7×</td></tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="pf"><span>₹83 = $1 planning basis &bull; Scenario-based, not guaranteed</span><span class="r">Page 6 &bull; Confidential</span></div>
</div>

<!-- ══════════ PAGE 7 — THE ASK + ROADMAP + DEFENSIBILITY ══════════ -->
<div class="pg">
  <span class="sn">THE ASK</span>
  <h1>Seed Round — Scale What Already Works</h1>
  <div class="ah"><div class="aav">$500K – $800K</div><div class="alb">S E E D &nbsp;&nbsp; R O U N D</div></div>

  <div class="ab">
    <div class="as" style="width:35%;background:linear-gradient(135deg,#2d8a5e,#3fa876)">Product 35%</div>
    <div class="as" style="width:30%;background:linear-gradient(135deg,#5ec98a,#7ee8a8)">Growth 30%</div>
    <div class="as" style="width:20%;background:linear-gradient(135deg,#8ad4a0,#a8e6b8)">Ops 20%</div>
    <div class="as" style="width:15%;background:linear-gradient(135deg,#b5e8c4,#c5f0d0)">Team 15%</div>
  </div>

  <div class="kg c4" style="margin-bottom:2mm">
    <div class="kp"><div class="ktb" style="background:var(--g)"></div><div class="kv" style="font-size:13pt">30K+ MAU</div><div class="kl">Series A Target</div></div>
    <div class="kp"><div class="ktb" style="background:var(--bl)"></div><div class="kv" style="font-size:13pt">D30 &gt;30%</div><div class="kl">Retention</div></div>
    <div class="kp"><div class="ktb" style="background:var(--am)"></div><div class="kv" style="font-size:13pt">₹25L GMV</div><div class="kl">Monthly</div></div>
    <div class="kp"><div class="ktb" style="background:var(--tl)"></div><div class="kv" style="font-size:13pt">&gt;35%</div><div class="kl">Repeat Rate</div></div>
  </div>

  <span class="sn">24-MONTH ROADMAP</span>
  <div class="tl" style="margin-top:2mm">
    <div class="tp"><div class="pp" style="background:linear-gradient(135deg,#2d8a5e,#3fa876)">0–6 mo</div><div class="pi"><span class="pii">D30 retention &gt;25%</span><span class="pii">Sub alpha ₹99/mo</span><span class="pii">Scanner UX polish</span><span class="pii">KB feedback loop</span><span class="pii">1K community × 5 cities</span><span class="pii">Referral K&gt;0.8</span></div></div>
    <div class="tp"><div class="pp" style="background:var(--tl)">6–12 mo</div><div class="pi"><span class="pii">Hindi + 2 languages</span><span class="pii">Care calendar + push</span><span class="pii">3-tier subscription</span><span class="pii">Post→product CTA</span><span class="pii">Expand 15 cities</span><span class="pii">Outcome tracking</span></div></div>
    <div class="tp"><div class="pp" style="background:var(--bl)">12–18 mo</div><div class="pi"><span class="pii">Nursery marketplace</span><span class="pii">Soil sensor bundle</span><span class="pii">B2B: 10 RWA + 5 corp</span><span class="pii">500 KB + 50K cases</span><span class="pii">ML model v1</span></div></div>
    <div class="tp"><div class="pp" style="background:var(--pu)">18–24 mo</div><div class="pi"><span class="pii">50+ cities incl. Tier-2</span><span class="pii">B2B managed care</span><span class="pii">IoT pilot</span><span class="pii">AI prediction beta</span><span class="pii">Series A ready</span></div></div>
  </div>

  <span class="sn">DEFENSIBILITY</span>
  <div class="mg" style="margin-top:2mm">
    <div class="mc"><div class="ct">💾 Data Moat</div><div class="cb">Every case logged. India dataset — 2–3yr to replicate</div></div>
    <div class="mc" style="border-left-color:var(--tl)"><div class="ct">📡 Distribution</div><div class="cb">Scanner→Chat→Shop→Community = 4 touchpoints</div></div>
    <div class="mc" style="border-left-color:var(--bl)"><div class="ct">🔁 Habit Loop</div><div class="cb">Monthly care = monthly habit, not annual purchase</div></div>
    <div class="mc" style="border-left-color:var(--am)"><div class="ct">🛡️ Trust</div><div class="cb">Verification-first + transparent confidence scores</div></div>
    <div class="mc" style="border-left-color:var(--pu)"><div class="ct">🌐 Network FX</div><div class="cb">More users = better data = better diagnosis = growth</div></div>
    <div class="mc" style="border-left-color:var(--pk)"><div class="ct">🇮🇳 Localization</div><div class="cb">100+ desi remedies, Indian plants, climates, soils</div></div>
  </div>

  <div class="co dk" style="text-align:center;margin-top:2mm"><strong>This is not a pitch for a concept.</strong> The product is built, deployed, and functional. The ask is capital to scale what already works.</div>
  <div class="pf"><span>The Nursery Green — Investor Deck</span><span class="r">Page 7 &bull; Confidential</span></div>
</div>

<!-- ══════════ PAGE 8 — CLOSING ══════════ -->
<div class="pg closing">
  <div class="dc dc1"></div><div class="dc dc2"></div>
  ${logo?'<img class="cl-logo" src="'+logo+'" alt="Logo">':''}
  <div class="cl-title">THE NURSERY GREEN</div>
  <div class="cl-acc"></div>
  <div class="cl-sub">India's plant health + commerce platform.<br>Built. Deployed. Ready to scale.</div>
  <div class="cl-url">thenurserygreen.com</div>
  <div class="cl-prods">${prods.filter(p=>p.img).map(p=>'<div class="cl-p"><img src="'+p.img+'" alt="'+p.name+'"></div>').join('')}</div>
  <div class="cl-ft">Confidential &bull; February 2026 &bull; Generated with Claude Opus 4.6</div>
</div>

</body></html>`;
}

(async () => {
  console.log('Building HTML...');
  const h = html();
  const hp = path.resolve(__dirname, '..', 'INVESTOR_DECK_PRINT_PREVIEW.html');
  fs.writeFileSync(hp, h, 'utf-8');
  console.log('HTML preview saved:', hp);
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(h, { waitUntil: 'networkidle0', timeout: 30000 });
  console.log('Generating PDF...');
  await page.pdf({ path: OUT, format: 'A4', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, displayHeaderFooter: false });
  await browser.close();
  const sz = fs.statSync(OUT).size;
  console.log('Done: ' + OUT + ' (' + (sz / 1024).toFixed(0) + ' KB)');
})().catch(e => { console.error(e); process.exit(1); });
