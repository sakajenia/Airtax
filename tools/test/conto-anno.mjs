/* Il conto su base annua che finisce nell'email del report.
   Verifica i tre campi nuovi (notti_anno, tasse_anno_oggi, tasse_anno_noi)
   contro un conto rifatto a mano, e i casi in cui devono restare vuoti. */
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import http from 'node:http';
import fs from 'node:fs';

const SRC = '/home/user/Airtax/funnel/calcolatore-v2.html';
const PORT = 8917;
const html = fs.readFileSync(SRC, 'utf8');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); res.end(html);
});
await new Promise(r => server.listen(PORT, '127.0.0.1', r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('JS-EXCEPTION: ' + String(e)));

const results = [];
const check = (name, pass, detail = '') => results.push({ name, pass, detail });

async function scenario({ price, cleaning, nights, nightsYear, regime, goal }) {
  await page.goto(`http://127.0.0.1:${PORT}/`);
  await page.click(`#regimeChoices button[data-regime="${regime}"]`);
  await page.click(`#goalChoices button[data-goal="${goal}"]`);
  await page.fill('#price', String(price));
  await page.fill('#cleaning', String(cleaning));
  await page.fill('#nights', String(nights));
  await page.fill('#nightsYear', String(nightsYear));
  await page.waitForTimeout(150);
  return page.evaluate(() => window.__leadData || {});
}

/* --- caso base: 250 €/notte, niente pulizie, 250 notti l'anno, cedolare 21% --- */
const VAT = 0.22, F_OLD = 0.03, F_NEW = 0.155, MARG = 0.08, FEE = 0.20;
const effO = F_OLD * (1 + VAT), effN = F_NEW * (1 + VAT);

function atteso({ price, cleaning, nights, nightsYear, t }) {
  const k    = (1 - effO - t) / (1 - effN - t);
  const np   = Math.ceil(price * k * (1 + MARG));
  const nc   = cleaning > 0 ? Math.ceil(cleaning * k * (1 + MARG)) : 0;
  const base = np + nc / nights;
  const lordoAnno   = base * nightsYear;
  const pulizieAnno = (nc / nights) * nightsYear;
  const tua = lordoAnno * (1 - effN - FEE) - pulizieAnno;
  return { np, oggi: Math.round(lordoAnno * t), noi: Math.round(tua * t) };
}

{
  const d = await scenario({ price: 250, cleaning: 0, nights: 3, nightsYear: 250, regime: 'ced21', goal: 'net' });
  const a = atteso({ price: 250, cleaning: 0, nights: 3, nightsYear: 250, t: 0.21 });
  check('notti_anno riporta le notti inserite', d.notti_anno === 250, `ricevuto ${d.notti_anno}`);
  check('prezzo consigliato come da formula', d.prezzo_consigliato === a.np, `${d.prezzo_consigliato} vs ${a.np}`);
  check('tasse_anno_oggi = lordo annuo x aliquota', d.tasse_anno_oggi === a.oggi, `${d.tasse_anno_oggi} vs ${a.oggi}`);
  check('tasse_anno_noi = quota che resta x aliquota', d.tasse_anno_noi === a.noi, `${d.tasse_anno_noi} vs ${a.noi}`);
  check('con noi si paga meno di oggi', d.tasse_anno_noi < d.tasse_anno_oggi, `${d.tasse_anno_noi} < ${d.tasse_anno_oggi}`);
  const calo = 1 - d.tasse_anno_noi / d.tasse_anno_oggi;
  check('il calo sta fra il 30% e il 60%', calo > 0.30 && calo < 0.60, `calo ${(calo * 100).toFixed(1)}%`);
}

/* --- con le pulizie: entrano nel lordo tassato ma non in quello che resta --- */
{
  const d = await scenario({ price: 120, cleaning: 40, nights: 3, nightsYear: 180, regime: 'ced26', goal: 'net' });
  const a = atteso({ price: 120, cleaning: 40, nights: 3, nightsYear: 180, t: 0.26 });
  check('con pulizie: tasse_anno_oggi torna', d.tasse_anno_oggi === a.oggi, `${d.tasse_anno_oggi} vs ${a.oggi}`);
  check('con pulizie: tasse_anno_noi torna', d.tasse_anno_noi === a.noi, `${d.tasse_anno_noi} vs ${a.noi}`);
}

/* --- i casi in cui i campi devono restare vuoti --- */
{
  const d = await scenario({ price: 250, cleaning: 0, nights: 3, nightsYear: 0, regime: 'ced21', goal: 'net' });
  check('zero notti/anno: notti_anno vuoto', d.notti_anno === '', `ricevuto ${JSON.stringify(d.notti_anno)}`);
  check('zero notti/anno: tasse_anno_oggi vuoto', d.tasse_anno_oggi === '', `ricevuto ${JSON.stringify(d.tasse_anno_oggi)}`);
  check('zero notti/anno: tasse_anno_noi vuoto', d.tasse_anno_noi === '', `ricevuto ${JSON.stringify(d.tasse_anno_noi)}`);
}
{
  const d = await scenario({ price: 250, cleaning: 0, nights: 3, nightsYear: 250, regime: 'impresa', goal: 'net' });
  check('regime azienda: tasse_anno_oggi vuoto', d.tasse_anno_oggi === '', `ricevuto ${JSON.stringify(d.tasse_anno_oggi)}`);
  check('regime azienda: tasse_anno_noi vuoto', d.tasse_anno_noi === '', `ricevuto ${JSON.stringify(d.tasse_anno_noi)}`);
}

/* --- i tre campi viaggiano nell'autosave --- */
{
  const keys = await page.evaluate(() => {
    const m = document.documentElement.innerHTML.match(/var CALC_KEYS = \[([\s\S]*?)\];/);
    return m ? m[1] : '';
  });
  for (const k of ['notti_anno', 'tasse_anno_oggi', 'tasse_anno_noi']) {
    check(`${k} e' fra le chiavi spedite al Worker`, keys.includes(`'${k}'`), keys.replace(/\s+/g, ' ').trim());
  }
}

check('nessuna eccezione JavaScript', errors.length === 0, errors.join(' | '));

await browser.close(); server.close();
let ok = 0;
for (const r of results) { console.log(`${r.pass ? 'OK  ' : 'FAIL'} ${r.name}${r.pass ? '' : '  -> ' + r.detail}`); if (r.pass) ok++; }
console.log(`${ok}/${results.length} superati`);
process.exit(ok === results.length ? 0 : 1);
