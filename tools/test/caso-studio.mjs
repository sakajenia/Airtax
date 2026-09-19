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

async function leggiVsl(query) {
  await p.goto(`http://127.0.0.1:${PORT}/vsl${query || ''}`);
  await wait(400);
  /* La comparsa allo scroll trasla i blocchi di 18px per 700ms. Misurare a
     meta' animazione vuol dire misurare un fotogramma, non l'allineamento:
     qui la transizione si spegne e si guarda lo stato fermo. */
  await p.addStyleTag({ content: '.ppm-reveal{transition:none !important}' });
  await p.evaluate(() => document.querySelectorAll('.ppm-reveal').forEach(e => e.classList.add('is-in')));
  await wait(120);
  return p.evaluate(() => {
    /* il centro del pallino contro la cima del suo blocco: il pallino e'
       centrato sulla sua coordinata (translate -50%), quindi si confronta
       il centro, non il bordo */
    function misuraScarti() {
      const blocchi = [...document.querySelectorAll('[data-ppm-step]')];
      const pallini = [...document.querySelectorAll('.ppm-tl-dot')];
      if (pallini.length !== blocchi.length) return null;
      return blocchi.map((b, i) => {
        const d = pallini[i].getBoundingClientRect();
        return Math.round(Math.abs((b.getBoundingClientRect().top + 11) - (d.top + d.height / 2)));
      });
    }
    /* Intl mette uno spazio unificatore (U+00A0) prima del simbolo dell'euro:
       nei confronti lo riportiamo a uno spazio normale, altrimenti ogni
       uguaglianza fallisce pur essendo il testo giusto. */
    const norm = s => (s || '').replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
    const txt = id => norm((document.getElementById(id) || {}).textContent);
    return {
      caso: txt('ppm-caso'),
      oggi: txt('ppm-tasse-oggi'), noi: txt('ppm-tasse-noi'),
      w: document.getElementById('ppm-barra-noi').style.getPropertyValue('--w').trim(),
      badge: !document.getElementById('ppm-tuoi').hidden,
      titolo: norm(document.querySelector('[data-ppm-h1]').textContent),
      /* quanto sono lontani i pallini dal loro blocco: se il binario smette
         di seguire la card, qui si vede subito */
      scarti: misuraScarti(),
      binario: (() => {
        const rail = document.querySelector('[data-ppm-tl-rail]').getBoundingClientRect();
        const card = document.querySelector('[data-ppm-tl-card]').getBoundingClientRect();
        return { aFianco: Math.round(rail.right) <= Math.round(card.left) + 1,
                 altezze: Math.round(Math.abs(rail.height - card.height)) };
      })(),
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
check('A4 · la barra verde e lunga quanto la quota dell esempio', v.w === '0.493', v.w);
check('A5 · titolo senza nome quando non si sa chi e', /^Stai pagando tasse/.test(v.titolo), v.titolo);

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
check('C1 · badge "I tuoi numeri" acceso', v.badge === true, `badge ${v.badge}`);
check('C2 · la riga parla della SUA prenotazione', v.caso === 'Su 460 € di una tua prenotazione tipo, di tasse paghi', v.caso);
check('C3 · tasse di oggi sul lordo', v.oggi === '96,60 €', v.oggi);
check('C4 · tasse col sostituto d imposta', v.noi === '46,41 €', v.noi);
check('C5 · la barra verde e lunga quanto la sua quota', v.w === '0.480', v.w);
check('C6 · i pallini del binario stanno sui loro blocchi', v.scarti && v.scarti.every(s => s <= 3), JSON.stringify(v.scarti));
check('C7 · il binario resta a fianco della card, alto uguale', v.binario.aFianco && v.binario.altezze <= 2, JSON.stringify(v.binario));

// ---------- D: regimi e casi che non reggono ----------
await compila({ price: 150, cleaning: 0, nights: 1, regime: 'impresa' });
v = await leggiVsl();
check('D1 · impresa (nessuna imposta sul lordo): torna all esempio', !v.badge && v.oggi === '71,40 €', `${v.badge} ${v.oggi}`);

await compila({ price: 180, cleaning: 30, nights: 4, regime: 'forf' });
v = await leggiVsl();
check('D2 · forfettario: personalizzato', v.badge && v.w === '0.571', `${v.badge} ${v.w}`);

await compila({ price: 90, cleaning: 25, nights: 3, regime: 'ced26' });
v = await leggiVsl();
check('D3 · cedolare 26%: aliquota applicata', v.badge && v.oggi === '76,70 €' && v.noi === '40,36 €', `${v.oggi} / ${v.noi}`);

// senza pulizie il risparmio scende sotto il 50%: deve dirlo, non arrotondare a favore
await compila({ price: 120, cleaning: 0, nights: 2, regime: 'ced21' });
v = await leggiVsl();
check('D4 · senza pulizie la barra verde e molto piu lunga (risparmio minore)', v.badge && v.w === '0.611', v.w);

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

// ---------- N: il nome nel titolo ----------
await p.goto(`http://127.0.0.1:${PORT}/vsl`);
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
v = await leggiVsl('?nome=gian');
check('N1 · il nome dalla querystring finisce nel titolo', /^Gian, stai pagando tasse/.test(v.titolo), v.titolo);

v = await leggiVsl();
check('N2 · e viene ricordato anche senza querystring', /^Gian, stai pagando tasse/.test(v.titolo), v.titolo);

await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
v = await leggiVsl('?nome=%7B%7Bcontact.first_name%7D%7D');
check('N3 · un merge tag non risolto non finisce in faccia al lead', /^Stai pagando tasse/.test(v.titolo), v.titolo);

v = await leggiVsl('?nome=' + encodeURIComponent('Maria Grazia De Santis'));
check('N4 · solo il nome di battesimo, con la maiuscola', /^Maria, stai pagando/.test(v.titolo), v.titolo);

// il calcolatore se lo ricorda per la pagina dopo
await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await p.goto(`http://127.0.0.1:${PORT}/calc?cid=rQlYydhMRsMktLjs7iN6&nome=LUCA`);
await wait(250);
v = await leggiVsl();
check('N5 · il nome passa dal calcolatore alla VSL', /^Luca, stai pagando/.test(v.titolo), v.titolo);

// ---------- T: il binario regge un ridimensionamento ----------
await p.setViewportSize({ width: 560, height: 900 });
await wait(500);
async function statoBinario() {
  return p.evaluate(() => {
    document.querySelectorAll('.ppm-reveal').forEach(e => e.classList.add('is-in'));
    const blocchi = [...document.querySelectorAll('[data-ppm-step]')];
    const pallini = [...document.querySelectorAll('.ppm-tl-dot')];
    const rail = document.querySelector('[data-ppm-tl-rail]').getBoundingClientRect();
    const card = document.querySelector('[data-ppm-tl-card]').getBoundingClientRect();
    return {
      n: pallini.length,
      aFianco: Math.round(rail.right) <= Math.round(card.left) + 1,
      altezze: Math.round(Math.abs(rail.height - card.height)),
      scarti: pallini.length !== blocchi.length ? null : blocchi.map((b, i) => {
        const d = pallini[i].getBoundingClientRect();
        return Math.round(Math.abs((b.getBoundingClientRect().top + 11) - (d.top + d.height / 2)));
      }),
    };
  });
}
/* il caso segnalato: la finestra cambia misura e il binario smette di seguire */
for (const larghezza of [1100, 900, 760, 640, 560, 430, 390, 1100]) {
  await p.setViewportSize({ width: larghezza, height: 900 });
  await wait(420);
  const s = await statoBinario();
  check(`T · binario a ${larghezza}px: pallini allineati, a fianco, senza residui`,
        s.scarti && s.scarti.every(x => x <= 3) && s.aFianco && s.altezze <= 2 && s.n === 4,
        JSON.stringify(s));
}
let scarti = (await statoBinario()).scarti;
check('T2 · e non se ne accumulano di vecchi', (await statoBinario()).n === 4, String(scarti));

check('E1 · nessuna eccezione JavaScript', errs.length === 0, errs.join(' | '));

await b.close(); srv.close();
let ok = 0;
for (const r of out) { if (r.ok) ok++; console.log(`${r.ok ? '  OK  ' : ' FAIL '} ${r.n}${r.d ? '   → ' + r.d : ''}`); }
console.log(`\n${ok}/${out.length} superati`);
process.exit(ok === out.length ? 0 : 1);
