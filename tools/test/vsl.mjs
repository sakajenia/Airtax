import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http'; import fs from 'node:fs';

const SRC = '/home/user/Airtax/funnel/vsl/anteprima.html';
const PORT = 8911;
const HOOK = `http://127.0.0.1:${PORT}/hook`;

const html = fs.readFileSync(SRC, 'utf8')
  .replace('"https://ghl-autosave-airtax.blionbg.workers.dev/"', JSON.stringify(HOOK));
if (!html.includes(HOOK)) { console.error('FATAL: webhook non sostituito'); process.exit(1); }

const ricevuti = [];
const srv = http.createServer((req, res) => {
  if (req.url.startsWith('/hook')) {
    let b = ''; req.on('data', c => b += c);
    req.on('end', () => {
      try { ricevuti.push(JSON.parse(b)); } catch { ricevuti.push({ __raw: b }); }
      res.writeHead(204, { 'Access-Control-Allow-Origin': '*' }); res.end();
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html);
});
await new Promise(r => srv.listen(PORT, '127.0.0.1', r));

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 1100, height: 800 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push('JS: ' + e));

const out = []; const check = (n, ok, d = '') => out.push({ n, ok, d });
const wait = ms => new Promise(r => setTimeout(r, ms));

// finto lettore: fisso durata e tempo, e sparo timeupdate come farebbe il browser
async function guarda(pagina, secondi) {
  await pagina.evaluate((t) => {
    const v = document.querySelector('[data-ppm-video]');
    if (!v.__finto) {
      Object.defineProperty(v, 'duration', { get: () => 200, configurable: true });
      let now = 0;
      Object.defineProperty(v, 'currentTime', { get: () => now, set: (x) => { now = x; }, configurable: true });
      v.__finto = true;
    }
    v.currentTime = t;
    v.dispatchEvent(new Event('timeupdate'));
  }, secondi);
  await wait(120);
}

// ---------- A: senza cid non si manda niente ----------
await p.goto(`http://127.0.0.1:${PORT}/`);
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await p.reload();
await guarda(p, 120);               // 60% del video
check('A1 · senza cid non si manda niente', ricevuti.length === 0, `${ricevuti.length} invii`);

// ---------- B: con ?cid= si mandano le tappe ----------
await p.goto(`http://127.0.0.1:${PORT}/?cid=rQlYydhMRsMktLjs7iN6`);
await guarda(p, 10);                            // 5%
check('B1 · sotto il 25% non parte niente', ricevuti.length === 0, `${ricevuti.length} invii`);

await guarda(p, 60);                            // 30%
check('B2 · al 30% parte la tappa 25', ricevuti.length === 1 && ricevuti[0].video_vsl_pct === 25, JSON.stringify(ricevuti[0] || {}));
check('B3 · con il contact_id giusto', ricevuti[0]?.contact_id === 'rQlYydhMRsMktLjs7iN6', String(ricevuti[0]?.contact_id));
check('B4 · con la fonte giusta', ricevuti[0]?.fonte === 'vsl-grazie-video', String(ricevuti[0]?.fonte));

await guarda(p, 70);                            // 35%: ancora nella stessa tappa
check('B5 · la stessa tappa non si ripete', ricevuti.length === 1, `${ricevuti.length} invii`);

await guarda(p, 30);                            // riavvolge: non conta
check('B6 · riavvolgere non rimanda niente', ricevuti.length === 1, `${ricevuti.length} invii`);

await guarda(p, 160);                           // 80%: scattano 50 e 75 insieme
const tappe = ricevuti.map(x => x.video_vsl_pct);
check('B7 · saltando avanti scattano tutte le tappe passate', JSON.stringify(tappe) === '[25,50,75]', JSON.stringify(tappe));

await p.evaluate(() => document.querySelector('[data-ppm-video]').dispatchEvent(new Event('ended')));
await wait(150);
check('B8 · a fine video arriva il 100', ricevuti[ricevuti.length - 1]?.video_vsl_pct === 100, JSON.stringify(ricevuti.map(x => x.video_vsl_pct)));

// ---------- C: il cid resta in memoria per la visita dopo ----------
const prima = ricevuti.length;
await p.goto(`http://127.0.0.1:${PORT}/`);      // senza querystring
await guarda(p, 120);                            // 60% -> 25 e 50
const nuovi = ricevuti.slice(prima);
check('C1 · il cid viene ricordato anche senza ?cid', nuovi.length > 0 && nuovi[0].contact_id === 'rQlYydhMRsMktLjs7iN6', JSON.stringify(nuovi[0] || {}));

// ---------- D: struttura della pagina ----------
const s = await p.evaluate(() => ({
  fasi: document.querySelectorAll('[data-ppm-step]').length,
  card: document.querySelectorAll('.ppm-vcard').length,
  cta: [...document.querySelectorAll('.ppm-btn')].map(a => a.getAttribute('href')),
  hdr: !!document.querySelector('.ppmhdr'),
  hdrCta: document.querySelector('.ppmhdr .ppm-shiny')?.getAttribute('href'),
  titolo: document.querySelector('.ppm-hero-title')?.innerText.replace(/\s+/g, ' ').trim(),
  h2: [...document.querySelectorAll('.ppm-h2')].map(h => h.innerText.trim()),
  ancora: !!document.getElementById('ppm-prenota'),
  vw: window.innerWidth,
  btn: (() => { const b = document.querySelector('.ppm-btn').getBoundingClientRect();
                return { w: Math.round(b.width), h: Math.round(b.height) }; })(),
}));
check('D1 · quattro fasi', s.fasi === 4, String(s.fasi));
check('D2 · otto obiezioni', s.card === 8, String(s.card));
check('D3 · due pulsanti, entrambi sul calendario', s.cta.length === 2 && s.cta.every(h => h.includes('call-strategica-affitti')), JSON.stringify(s.cta));
check('D4 · sticky header presente', s.hdr, '');
check('D5 · la CTA in alto scorre al pulsante', s.hdrCta === '#ppm-prenota' && s.ancora, String(s.hdrCta));
check('D6 · titolo giusto', /non hai mai incassato/i.test(s.titolo || ''), s.titolo);
check('D8 · il pulsante ha misure da pulsante, non da banda',
      s.btn && s.btn.h <= 56 && s.btn.w < s.vw * 0.75, JSON.stringify(s.btn) + ' vw=' + s.vw);
check('D7 · le quattro sezioni richieste', JSON.stringify(s.h2).includes('Il metodo in 4 fasi') && JSON.stringify(s.h2).includes('Cosa sapere prima di sentirci') && JSON.stringify(s.h2).includes('Oltre 20 host'), JSON.stringify(s.h2));

// ---------- E: niente eccezioni ----------
check('E1 · nessuna eccezione JavaScript', errs.length === 0, errs.join(' | '));

await b.close(); srv.close();
let ok = 0;
for (const r of out) { if (r.ok) ok++; console.log(`${r.ok ? '  OK  ' : ' FAIL '} ${r.n}${r.d ? '   → ' + r.d : ''}`); }
console.log(`\n${ok}/${out.length} superati`);
process.exit(ok === out.length ? 0 : 1);
