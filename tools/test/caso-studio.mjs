/* Il passaggio dei dati fra calcolatore e pagina VSL.
   Le due pagine sono servite dalla STESSA origine, come su
   tools.affittibreviaroma.com: e' l'unico modo perche' il localStorage sia
   in comune, ed e' esattamente il meccanismo che si vuole verificare. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';

const PORT = 8915;
const calc = fs.readFileSync('/home/user/Airtax/funnel/calcolatore-v2.html', 'utf8')
  .replace("'https://ghl-autosave-airtax.blionbg.workers.dev/'", "''");   // niente invii nei test
const vsl = fs.readFileSync('/home/user/Airtax/funnel/vsl/anteprima.html', 'utf8');

const srv = http.createServer((req, res) => {
  const body = req.url.startsWith('/vsl') ? vsl : calc;
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(body);
});
await new Promise(r => srv.listen(PORT, '127.0.0.1', r));

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', e => errs.push(String(e)));

const out = []; const check = (n, ok, d = '') => out.push({ n, ok, d });
const wait = ms => new Promise(r => setTimeout(r, ms));

async function compila({ price, cleaning, nights, regime }) {
  await p.goto(`http://127.0.0.1:${PORT}/calc`);
  await p.fill('#price', String(price));
  await p.fill('#cleaning', String(cleaning));
  await p.fill('#nights', String(nights));
  await p.click(`#regimeChoices > button[data-regime="${regime}"]`);
  await p.click('#goalChoices > button[data-goal="net"]');
  await wait(300);
  return p.evaluate(() => JSON.parse(localStorage.getItem('airtax_caso') || 'null'));
}

async function leggiVsl() {
  await p.goto(`http://127.0.0.1:${PORT}/vsl`);
  await wait(400);
  return p.evaluate(() => {
    /* Intl mette uno spazio unificatore (U+00A0) prima del simbolo dell'euro:
       nei confronti lo riportiamo a uno spazio normale, altrimenti ogni
       uguaglianza fallisce pur essendo il testo giusto. */
    const norm = s => (s || '').replace(/\u00A0/g, ' ').trim();
    const txt = id => norm((document.getElementById(id) || {}).textContent);
    return {
      caso: txt('ppm-caso'), nota: txt('ppm-nota'), piccolo: txt('ppm-piccolo'),
      oggi: txt('ppm-tasse-oggi'), noi: txt('ppm-tasse-noi'),
      w: document.getElementById('ppm-barra-noi').style.getPropertyValue('--w').trim(),
      badge: !document.getElementById('ppm-tuoi').hidden,
      rifai: !document.getElementById('ppm-rifai').hidden,
    };
  });
}

// ---------- A: senza dati, resta l'esempio ----------
await p.goto(`http://127.0.0.1:${PORT}/vsl`);
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
let v = await leggiVsl();
check('A1 · senza dati resta l esempio', v.caso === 'Su 340 € che versa l’ospite, di tasse paghi', v.caso);
check('A2 · con i suoi due numeri', v.oggi === '71,40 €' && v.noi === '35,22 €', `${v.oggi} / ${v.noi}`);
check('A3 · niente badge "I tuoi numeri"', !v.badge && !v.rifai, `badge ${v.badge}`);
check('A4 · dichiarato come esempio', /^Esempio su una prenotazione tipo/.test(v.piccolo), v.piccolo);
check('A5 · il risparmio è arrotondato per difetto', /^−50%\./.test(v.nota), v.nota.slice(0, 24));

// ---------- B: il calcolatore lascia il caso ----------
const d = await compila({ price: 200, cleaning: 60, nights: 2, regime: 'ced21' });
check('B1 · il calcolatore scrive airtax_caso', !!d, JSON.stringify(d));
check('B2 · con gli ingredienti giusti', d && d.price === 200 && d.cleaning === 60 && d.nights === 2, JSON.stringify(d));
check('B3 · e con aliquota e commissione', d && Math.abs(d.t - 0.21) < 1e-9 && Math.abs(d.effN - 0.155 * 1.22) < 1e-9, `t=${d?.t} effN=${d?.effN}`);
check('B4 · niente dati personali nel caso', d && !('via' in d) && !('email' in d), Object.keys(d || {}).join(','));

// ---------- C: la VSL li usa ----------
// lordo 460 · tua quota 221,01 (tolti Airbnb 18,91%, gestione 20%, pulizie 60)
// tasse oggi 21% di 460 = 96,60 · con noi 21% di 221,01 = 46,41 · −51%
v = await leggiVsl();
check('C1 · badge "I tuoi numeri" acceso', v.badge && v.rifai, `badge ${v.badge}`);
check('C2 · la riga parla della SUA prenotazione', v.caso === 'Su 460 € di una tua prenotazione tipo, di tasse paghi', v.caso);
check('C3 · tasse di oggi sul lordo', v.oggi === '96,60 €', v.oggi);
check('C4 · tasse col sostituto d imposta', v.noi === '46,41 €', v.noi);
check('C5 · la barra verde e lunga quanto la sua quota', v.w === '0.480', v.w);
check('C6 · percentuale calcolata, non copiata', /^−51%\./.test(v.nota), v.nota.slice(0, 24));
check('C7 · e nomina la sua imposta', /cedolare del 21%/.test(v.nota), v.nota);
check('C8 · la nota in fondo non dice più "esempio"', /^Sui numeri del tuo calcolo/.test(v.piccolo), v.piccolo);

// ---------- D: regimi e casi che non reggono ----------
await compila({ price: 150, cleaning: 0, nights: 1, regime: 'impresa' });
v = await leggiVsl();
check('D1 · impresa (nessuna imposta sul lordo): torna all esempio', !v.badge && v.oggi === '71,40 €', `${v.badge} ${v.oggi}`);

await compila({ price: 180, cleaning: 30, nights: 4, regime: 'forf' });
v = await leggiVsl();
check('D2 · forfettario: personalizzato e col nome giusto', v.badge && /forfettario/.test(v.nota), v.nota.slice(0, 60));

await compila({ price: 90, cleaning: 25, nights: 3, regime: 'ced26' });
v = await leggiVsl();
check('D3 · cedolare 26%: la frase dice 26%', v.badge && /cedolare del 26%/.test(v.nota), v.nota.slice(0, 60));

// senza pulizie il risparmio scende sotto il 50%: deve dirlo, non arrotondare a favore
await compila({ price: 120, cleaning: 0, nights: 2, regime: 'ced21' });
v = await leggiVsl();
check('D4 · senza pulizie dichiara la percentuale vera, piu bassa', v.badge && /^−38%\./.test(v.nota), v.nota.slice(0, 24));

// dato vecchio: non si usa
await p.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('airtax_caso'));
  d.ts = Date.now() - 90 * 864e5;
  localStorage.setItem('airtax_caso', JSON.stringify(d));
});
v = await leggiVsl();
check('D5 · dato di 90 giorni fa: torna all esempio', !v.badge && v.oggi === '71,40 €', `${v.badge} ${v.oggi}`);

// roba rotta in localStorage non deve buttare giu' la pagina
await p.evaluate(() => localStorage.setItem('airtax_caso', '{non sono json'));
v = await leggiVsl();
check('D6 · localStorage corrotto: torna all esempio senza errori', !v.badge && v.oggi === '71,40 €', `${v.badge} ${v.oggi}`);

check('E1 · nessuna eccezione JavaScript', errs.length === 0, errs.join(' | '));

await b.close(); srv.close();
let ok = 0;
for (const r of out) { if (r.ok) ok++; console.log(`${r.ok ? '  OK  ' : ' FAIL '} ${r.n}${r.d ? '   → ' + r.d : ''}`); }
console.log(`\n${ok}/${out.length} superati`);
process.exit(ok === out.length ? 0 : 1);
