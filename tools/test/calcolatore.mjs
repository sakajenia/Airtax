import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';

const SRC = '/home/user/Airtax/funnel/calcolatore-v2.html';
const PORT = 8899;
const HOOK = `http://127.0.0.1:${PORT}/hook`;

// pagina con il webhook di test al posto del placeholder
const html = fs.readFileSync(SRC, 'utf8')
  .replace("'https://ghl-autosave-airtax.blionbg.workers.dev/'", JSON.stringify(HOOK));
if (!html.includes(HOOK)) { console.error('FATAL: placeholder webhook non sostituito'); process.exit(1); }

const received = [];
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/hook')) {
    let b = '';
    req.on('data', c => b += c);
    req.on('end', () => {
      try { received.push(JSON.parse(b)); } catch { received.push({ __raw: b }); }
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*' }); res.end('ok');
    });
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html);
});
await new Promise(r => server.listen(PORT, '127.0.0.1', r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const ctx = await browser.newContext();
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('JS-EXCEPTION: ' + String(e)));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
page.on('requestfailed', r => errors.push('NET-FAIL: ' + r.url()));

const results = [];
const check = (name, pass, detail = '') => { results.push({ name, pass, detail }); };
const wait = ms => new Promise(r => setTimeout(r, ms));

// ---------- A: autosave con debounce, SENZA toccare "Ricevi il report" ----------
await page.goto(`http://127.0.0.1:${PORT}/?cid=TEST_CONTACT_123`);
await page.fill('#citta', 'Roma');
await page.selectOption('#zona', { label: 'Trastevere' }).catch(async () => {
  const v = await page.$$eval('#zona option', o => o.map(x => x.value)).then(a => a.find(x => /trastevere/i.test(x)) || a[1]);
  await page.selectOption('#zona', v);
});
await page.fill('#via', 'Via della Lungaretta 42');
await page.fill('#camere', '2');
await page.fill('#postiletto', '4');
await wait(1500);

const a = received.filter(r => r.fonte === 'calcolatore-v2-autosave');
check('A1 · i dati arrivano SENZA click su "Ricevi il report"', a.length > 0, `${a.length} invii`);
const last = a[a.length - 1] || {};
check('A2 · contact_id presente', last.contact_id === 'TEST_CONTACT_123', String(last.contact_id));
check('A3 · citta_immobile', last.citta_immobile === 'Roma', String(last.citta_immobile));
check('A4 · via_immobile', last.via_immobile === 'Via della Lungaretta 42', String(last.via_immobile));
check('A5 · camere_letto', String(last.camere_letto) === '2', String(last.camere_letto));
check('A6 · posti_letto', String(last.posti_letto) === '4', String(last.posti_letto));
check('A7 · zona_immobile valorizzata', !!last.zona_immobile, String(last.zona_immobile));
check('A8 · debounce: non un invio per tasto', a.length <= 8, `${a.length} invii per 5 campi`);

// ---------- B: chiusura scheda (pagehide) ----------
const before = received.length;
await page.fill('#camere', '3');
await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
await wait(400);
const b = received.slice(before).filter(r => r.fonte === 'calcolatore-v2-autosave');
check('B1 · invio finale alla chiusura della scheda', b.length > 0, `${b.length} invii`);
check('B2 · il valore aggiornato viene salvato', b.length > 0 && String(b[b.length - 1].camere_letto) === '3', b.length ? String(b[b.length - 1].camere_letto) : '-');

// ---------- C: il calcolo NON deve cambiare ----------
await page.fill('#price', '100');
await page.click('#regimeChoices > button[data-regime="ced21"]');
await page.click('#goalChoices > button[data-goal="net"]');
await wait(300);
const prezzo = await page.textContent('#newPrice').catch(() => null)
  || await page.evaluate(() => (window.__leadData || {}).prezzo_consigliato);
check('C1 · consigliato = pareggio + margine 8% (100 → 136)', String(prezzo).includes('136'), String(prezzo));
const minTxt = await page.textContent('#priceRange .rv');
check('C1b · minimo mostrato = pareggio secco (126, come la pagina live)', /126/.test(minTxt), minTxt.trim());
const noteTxt = await page.textContent('#priceRange');
check('C1c · spiega perche consigliamo di piu', /sconti settimanali/.test(noteTxt), '');
const ld = await page.evaluate(() => window.__leadData);
check('C2 · le 8 chiavi del calcolo restano', ['prezzo_attuale','prezzo_consigliato','aumento_pct','regime_calc','obiettivo_calc','netto_oggi','netto_nuovo','perdita_anno'].every(k => k in ld), '');

// ---------- D: ritorno sulla pagina, campi ripristinati ----------
const page2 = await ctx.newPage();
await page2.goto(`http://127.0.0.1:${PORT}/`);   // senza cid
await wait(600);
check('D1 · citta ripristinata al ritorno', await page2.inputValue('#citta') === 'Roma', await page2.inputValue('#citta'));
check('D2 · via ripristinata', await page2.inputValue('#via') === 'Via della Lungaretta 42', await page2.inputValue('#via'));
check('D3 · cid ricordato anche senza querystring', await page2.evaluate(() => localStorage.getItem('airtax_cid')) === 'TEST_CONTACT_123', '');

// ---------- E: visitatore anonimo (mai passato dalla landing) ----------
const ctx3 = await browser.newContext();
const page3 = await ctx3.newPage();
const n3 = received.length;
await page3.goto(`http://127.0.0.1:${PORT}/`);
await page3.fill('#citta', 'Milano');
await page3.fill('#via', 'Via Anonima 1');
await wait(1500);
await page3.evaluate(() => window.dispatchEvent(new Event('pagehide')));
await wait(400);
check('E1 · senza cid NON si invia nulla (contatto sconosciuto)', received.length === n3, `${received.length - n3} invii`);

// ---------- G: ordine delle domande dopo lo scambio ----------
const ordine = await page.$$eval('.q .n', ns => ns.map(n => ({
  num: n.textContent.trim(),
  testo: (n.parentElement.textContent || '').replace(n.textContent, '').trim().slice(0, 34)
})));
check('G1 · quattro domande numerate', ordine.length === 4, JSON.stringify(ordine.map(o => o.num)));
check('G2 · la 3 e i dati immobile', ordine[2] && ordine[2].num === '3' && /immobile/i.test(ordine[2].testo), ordine[2] ? ordine[2].num + ' ' + ordine[2].testo : '-');
check('G3 · la 4 e l obiettivo', ordine[3] && ordine[3].num === '4' && /conta/i.test(ordine[3].testo), ordine[3] ? ordine[3].num + ' ' + ordine[3].testo : '-');
check('G4 · numeri in sequenza 1-2-3-4', ordine.map(o => o.num).join('') === '1234', ordine.map(o => o.num).join(''));
const warnTxt = await page.textContent('#propWarn');
check('G5 · avviso rosso cita la domanda 3', /domanda 3/.test(warnTxt), warnTxt.trim().slice(0, 60));

// ---------- F: errori JS ----------
const jsErr = errors.filter(e => e.startsWith('JS-EXCEPTION'));
const netErr = [...new Set(errors.filter(e => e.startsWith('NET-FAIL')).map(e => e.replace('NET-FAIL: ','')))];
check('F1 · zero eccezioni JavaScript nel MIO codice', jsErr.length === 0, jsErr.join(' | '));
const extNote = () => { console.log('\n  risorse esterne non caricate nel sandbox:'); netErr.forEach(u => console.log('    - ' + u)); };

await browser.close(); server.close();

let ok = 0;
for (const r of results) { if (r.pass) ok++; console.log(`${r.pass ? '  OK  ' : ' FAIL '} ${r.name}${r.detail ? '   → ' + r.detail : ''}`); }
extNote();
console.log(`\n${ok}/${results.length} superati`);
process.exit(ok === results.length ? 0 : 1);
