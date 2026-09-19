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
    const seg = k => {
      const s = document.querySelector(`[data-seg="${k}"]`);
      return s ? { w: s.style.width, v: norm(s.querySelector('b')?.textContent) } : null;
    };
    return {
      caso: txt('ppm-caso'), graffa: txt('ppm-graffa-oggi'), piccolo: txt('ppm-piccolo'),
      oggi: txt('ppm-tasse-oggi'), noi: txt('ppm-tasse-noi'), nota: txt('ppm-nota'),
      badge: !document.getElementById('ppm-tuoi').hidden,
      rifai: !document.getElementById('ppm-rifai').hidden,
      larghNoi: document.getElementById('ppm-graffa-noi').style.width,
      tua: seg('tua'), ges: seg('ges'), abn: seg('abn'), pul: seg('pul'),
    };
  });
}

// ---------- A: senza dati, resta l'esempio generico ----------
await p.goto(`http://127.0.0.1:${PORT}/vsl`);
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
let v = await leggiVsl();
check('A1 · senza dati resta l esempio generico', /340/.test(v.caso) && v.oggi === '71,40 €', `${v.caso} | ${v.oggi}`);
check('A2 · niente badge "I tuoi numeri"', !v.badge && !v.rifai, `badge ${v.badge}`);
check('A3 · il generico dice comunque il suo 50,7%', /50,7% di tasse in meno/.test(v.nota), v.nota);
check('A4 · e resta dichiarato come esempio', /^Esempio a scopo illustrativo/.test(v.piccolo), v.piccolo.slice(0, 60));

// ---------- B: il calcolatore lascia il caso ----------
const d = await compila({ price: 200, cleaning: 60, nights: 2, regime: 'ced21' });
check('B1 · il calcolatore scrive airtax_caso', !!d, JSON.stringify(d));
check('B2 · con gli ingredienti giusti', d && d.price === 200 && d.cleaning === 60 && d.nights === 2, JSON.stringify(d));
check('B3 · e con aliquota e commissione', d && Math.abs(d.t - 0.21) < 1e-9 && Math.abs(d.effN - 0.155 * 1.22) < 1e-9, `t=${d?.t} effN=${d?.effN}`);
check('B4 · niente dati personali nel caso', d && !('via' in d) && !('email' in d), Object.keys(d || {}).join(','));

// ---------- C: la VSL li usa ----------
v = await leggiVsl();
// lordo 460 · Airbnb 86,99 · gestione 92 · pulizie 60 · tua 221,01
// tasse oggi 21% di 460 = 96,60 · con noi 21% di 221,01 = 46,41 · risparmio 52%
check('C1 · badge "I tuoi numeri" acceso', v.badge && v.rifai, `badge ${v.badge}`);
check('C2 · la riga descrive la SUA prenotazione', /La tua prenotazione tipo: 2 notti a 200 €, più 60 € di pulizie: l’ospite versa 460 €\./.test(v.caso), v.caso);
check('C3 · tasse di oggi sul lordo', v.oggi === '96,60 €', v.oggi);
check('C4 · tasse col sostituto d imposta', v.noi === '46,41 €', v.noi);
check('C5 · risparmio calcolato, non copiato', /il 52% di tasse in meno/.test(v.nota) && /Sui tuoi numeri/.test(v.nota), v.nota);
check('C6 · quota dell host nella barra', v.tua?.v === '221,01 €', v.tua?.v);
check('C7 · commissione Airbnb con IVA', v.abn?.v === '86,99 €', v.abn?.v);
check('C8 · pulizie e gestione', v.pul?.v === '60 €' && v.ges?.v === '92 €', `${v.pul?.v} / ${v.ges?.v}`);
check('C9 · la graffa verde copre solo la sua quota', v.larghNoi === v.tua?.w, `${v.larghNoi} vs ${v.tua?.w}`);
const somma = ['tua', 'ges', 'abn', 'pul'].reduce((s, k) => s + parseFloat(v[k].w), 0);
check('C10 · le quattro fette fanno il 100%', Math.abs(somma - 100) < 0.05, somma.toFixed(2) + '%');
check('C11 · la nota in fondo non dice più "esempio"', /sui numeri che hai messo nel calcolatore/.test(v.piccolo) && !/Esempio a scopo/.test(v.piccolo), v.piccolo.slice(0, 80));

// ---------- D: regimi e casi che non reggono ----------
await compila({ price: 150, cleaning: 0, nights: 1, regime: 'impresa' });
v = await leggiVsl();
check('D1 · impresa (nessuna imposta sul lordo): torna al generico', !v.badge && v.oggi === '71,40 €', `${v.badge} ${v.oggi}`);

await compila({ price: 180, cleaning: 30, nights: 4, regime: 'forf' });
v = await leggiVsl();
check('D2 · forfettario: personalizzato e con il nome giusto', v.badge && /forfettario/.test(v.graffa), v.graffa);

await compila({ price: 90, cleaning: 25, nights: 3, regime: 'ced26' });
v = await leggiVsl();
check('D3 · cedolare 26%: la graffa dice 26%', v.badge && /cedolare del 26%/.test(v.graffa), v.graffa);

// dato vecchio: non si usa
await p.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('airtax_caso'));
  d.ts = Date.now() - 90 * 864e5;
  localStorage.setItem('airtax_caso', JSON.stringify(d));
});
v = await leggiVsl();
check('D4 · dato di 90 giorni fa: torna al generico', !v.badge && v.oggi === '71,40 €', `${v.badge} ${v.oggi}`);

// roba rotta in localStorage non deve buttare giu' la pagina
await p.evaluate(() => localStorage.setItem('airtax_caso', '{non sono json'));
v = await leggiVsl();
check('D5 · localStorage corrotto: torna al generico senza errori', !v.badge && v.oggi === '71,40 €', `${v.badge} ${v.oggi}`);

check('E1 · nessuna eccezione JavaScript', errs.length === 0, errs.join(' | '));

await b.close(); srv.close();
let ok = 0;
for (const r of out) { if (r.ok) ok++; console.log(`${r.ok ? '  OK  ' : ' FAIL '} ${r.n}${r.d ? '   → ' + r.d : ''}`); }
console.log(`\n${ok}/${out.length} superati`);
process.exit(ok === out.length ? 0 : 1);
