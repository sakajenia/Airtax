#!/usr/bin/env node
// GHL CLI — sottile wrapper sull'API REST HighLevel per il funnel Calcolatore.
// Nessun segreto qui dentro: token e location arrivano da variabili d'ambiente
//   GHL_TOKEN     = Private Integration Token (pit-...)
//   GHL_LOCATION  = Location Id del sub-account
// Uso: GHL_TOKEN=... GHL_LOCATION=... node tools/ghl-cli.mjs <comando>
// Comandi: verify | list-fields | create-fields | test-contact | status
import process from 'node:process';

const BASE = 'https://services.leadconnectorhq.com';
const VERSION = '2021-07-28';
const TOKEN = process.env.GHL_TOKEN;
const LOCATION = process.env.GHL_LOCATION;

if (!TOKEN || !LOCATION) {
  console.error('ERRORE: imposta GHL_TOKEN e GHL_LOCATION nell\'ambiente.');
  process.exit(2);
}

const H = {
  Authorization: `Bearer ${TOKEN}`,
  Version: VERSION,
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: H,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  return { ok: res.ok, status: res.status, json };
}

// I 9 campi canonici del calcolatore. Il fieldKey lo genera GHL dal name
// (es. "Prezzo Attuale" -> contact.prezzo_attuale); dopo la creazione
// rileggiamo le key REALI e le riconciliamo.
const FIELDS = [
  { name: 'Prezzo Attuale',      dataType: 'NUMERICAL', want: 'prezzo_attuale' },
  { name: 'Prezzo Consigliato',  dataType: 'NUMERICAL', want: 'prezzo_consigliato' },
  { name: 'Aumento Pct',         dataType: 'NUMERICAL', want: 'aumento_pct' },
  { name: 'Regime Calc',         dataType: 'TEXT',      want: 'regime_calc' },
  { name: 'Obiettivo Calc',      dataType: 'TEXT',      want: 'obiettivo_calc' },
  { name: 'Netto Oggi',          dataType: 'NUMERICAL', want: 'netto_oggi' },
  { name: 'Netto Nuovo',         dataType: 'NUMERICAL', want: 'netto_nuovo' },
  { name: 'Perdita Anno',        dataType: 'NUMERICAL', want: 'perdita_anno' },
  { name: 'Canale Report',       dataType: 'TEXT',      want: 'canale_report' },
];

const shortKey = (k) => (k || '').replace(/^contact\./, '');

async function getFields() {
  const r = await api('GET', `/locations/${LOCATION}/customFields?model=contact`);
  if (!r.ok) throw new Error(`get custom fields ${r.status}: ${JSON.stringify(r.json)}`);
  return r.json.customFields || [];
}

async function verify() {
  const r = await api('GET', `/locations/${LOCATION}`);
  if (r.ok) {
    const n = r.json.location?.name || r.json.name || '(sconosciuto)';
    console.log(`OK — token valido. Location: ${n} (${LOCATION})`);
    return;
  }
  // fallback: se /locations/{id} non è nello scope, prova i custom fields
  const f = await api('GET', `/locations/${LOCATION}/customFields?model=contact`);
  if (f.ok) { console.log(`OK — token valido (via customFields). Location ${LOCATION}. Campi contatto: ${(f.json.customFields||[]).length}`); return; }
  console.error(`FALLITO — status ${r.status}: ${JSON.stringify(r.json)}`);
  process.exit(1);
}

async function listFields() {
  const fields = await getFields();
  console.log(`Custom field contatto: ${fields.length}`);
  for (const f of fields) console.log(`  ${shortKey(f.fieldKey).padEnd(24)} ${f.dataType.padEnd(14)} ${f.name}  [id ${f.id}]`);
}

async function createFields() {
  const existing = await getFields();
  const byKey = new Map(existing.map((f) => [shortKey(f.fieldKey), f]));
  const byName = new Map(existing.map((f) => [f.name.toLowerCase(), f]));
  const result = [];
  let pos = 1000;
  for (const spec of FIELDS) {
    const hitKey = byKey.get(spec.want);
    const hitName = byName.get(spec.name.toLowerCase());
    if (hitKey || hitName) {
      const f = hitKey || hitName;
      result.push({ want: spec.want, key: shortKey(f.fieldKey), id: f.id, status: 'gia-presente' });
      continue;
    }
    const r = await api('POST', `/locations/${LOCATION}/customFields`, {
      name: spec.name, dataType: spec.dataType, model: 'contact', position: pos++,
    });
    if (!r.ok) { result.push({ want: spec.want, status: `ERRORE ${r.status}`, detail: r.json }); continue; }
    const f = r.json.customField || r.json;
    result.push({ want: spec.want, key: shortKey(f.fieldKey), id: f.id, status: 'creato' });
  }
  console.log(JSON.stringify(result, null, 2));
  // riepilogo mismatch key
  const mism = result.filter((r) => r.key && r.key !== r.want);
  if (mism.length) {
    console.log('\nATTENZIONE: key generate diverse da quelle attese — vanno riconciliate nell\'HTML:');
    for (const m of mism) console.log(`  atteso "${m.want}"  ->  reale "${m.key}"`);
  } else {
    console.log('\nTutte le key coincidono con quelle canoniche attese.');
  }
  return result;
}

async function testContact() {
  const fields = await getFields();
  const idByKey = new Map(fields.map((f) => [shortKey(f.fieldKey), f.id]));
  const demo = {
    prezzo_attuale: 100, prezzo_consigliato: 120, aumento_pct: 20,
    regime_calc: 'una casa (cedolare 21%)', obiettivo_calc: 'Guadagnare come oggi',
    netto_oggi: 76, netto_nuovo: 76, perdita_anno: 1650, canale_report: 'email',
  };
  const customFields = [];
  const missing = [];
  for (const [k, v] of Object.entries(demo)) {
    const id = idByKey.get(k);
    if (id) customFields.push({ id, value: String(v) });
    else missing.push(k);
  }
  const body = {
    locationId: LOCATION,
    firstName: 'Test', lastName: 'Calcolatore QA',
    email: 'qa-test+calcolatore@example.com', phone: '+393510000000',
    tags: ['qa-test', 'calcolatore-cli'], source: 'ghl-cli',
    customFields,
  };
  const r = await api('POST', '/contacts/upsert', body);
  console.log(`upsert contatto: status ${r.status}`);
  if (missing.length) console.log(`campi non trovati (crea prima i custom field): ${missing.join(', ')}`);
  console.log(JSON.stringify(r.json?.contact ? { id: r.json.contact.id, new: r.json.new } : r.json, null, 2));
}

async function status() {
  const fields = await getFields();
  const present = new Set(fields.map((f) => shortKey(f.fieldKey)));
  const want = FIELDS.map((f) => f.want);
  const have = want.filter((k) => present.has(k));
  console.log(`Custom field calcolatore: ${have.length}/9 presenti${have.length ? ' -> ' + have.join(', ') : ''}`);
  const miss = want.filter((k) => !present.has(k));
  if (miss.length) console.log(`Mancanti: ${miss.join(', ')}`);
}

const cmd = process.argv[2] || 'verify';
const map = { verify, 'list-fields': listFields, 'create-fields': createFields, 'test-contact': testContact, status };
const fn = map[cmd];
if (!fn) { console.error(`Comando sconosciuto: ${cmd}. Usa: ${Object.keys(map).join(' | ')}`); process.exit(2); }
fn().catch((e) => { console.error('ERRORE:', e.message); process.exit(1); });
