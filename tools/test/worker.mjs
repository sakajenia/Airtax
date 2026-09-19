import worker from '/home/user/Airtax/tools/ghl-autosave-worker.js';

const OK_ORIGIN = 'https://tools.affittibreviaroma.com';
const env = { GHL_TOKEN: 'pit-finto-per-il-test' };

let chiamate = [];
let rispostaGhl = { ok: true, status: 200, body: '{}' };
let rispostaTag = { ok: true, status: 200, body: '{}' };

const fetchVero = globalThis.fetch;
globalThis.fetch = async (url, opts) => {
  chiamate.push({ url: String(url), method: opts?.method, headers: opts?.headers, body: opts?.body });
  const r = String(url).endsWith('/tags') ? rispostaTag : rispostaGhl;
  return new Response(r.body, { status: r.status });
};

function req(body, { method = 'POST', origin = OK_ORIGIN } = {}) {
  const headers = {};
  if (origin) headers.Origin = origin;
  return new Request('https://worker.example/', {
    method,
    headers,
    body: method === 'POST' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
  });
}

const risultati = [];
const check = (nome, ok, dettaglio = '') => risultati.push({ nome, ok, dettaglio });
const reset = () => { chiamate = []; rispostaGhl = { ok: true, status: 200, body: '{}' }; rispostaTag = { ok: true, status: 200, body: '{}' }; };

const payloadBuono = {
  contact_id: 'rQlYydhMRsMktLjs7iN6',
  fonte: 'calcolatore-v2-autosave',
  citta_immobile: 'Roma',
  zona_immobile: 'Trastevere',
  via_immobile: 'Via della Lungaretta 42',
  camere_letto: 2,
  posti_letto: 4,
  prezzo_attuale: 100,
  prezzo_consigliato: 136,
};

// ---------- difese ----------
reset();
let r = await worker.fetch(req(payloadBuono, { method: 'GET' }), env);
check('A1 · GET rifiutato', r.status === 405, `status ${r.status}`);
check('A2 · GET non chiama GHL', chiamate.length === 0, `${chiamate.length} chiamate`);

reset();
r = await worker.fetch(req(payloadBuono, { origin: 'https://sito-cattivo.example' }), env);
check('A3 · origine sconosciuta rifiutata', r.status === 403, `status ${r.status}`);
check('A4 · origine sconosciuta non chiama GHL', chiamate.length === 0, `${chiamate.length} chiamate`);

reset();
r = await worker.fetch(req(payloadBuono, { origin: null }), env);
check('A5 · richiesta senza Origin rifiutata', r.status === 403, `status ${r.status}`);

reset();
r = await worker.fetch(req(payloadBuono), {});
check('A6 · senza token configurato non chiama GHL', r.status === 500 && chiamate.length === 0, `status ${r.status}, ${chiamate.length} chiamate`);

reset();
r = await worker.fetch(req('non sono json'), env);
check('A7 · corpo non JSON rifiutato', r.status === 400 && chiamate.length === 0, `status ${r.status}`);

reset();
r = await worker.fetch(req({ citta_immobile: 'Roma' }), env);
check('A8 · senza contact_id rifiutato', r.status === 400 && chiamate.length === 0, `status ${r.status}`);

reset();
r = await worker.fetch(req({ contact_id: 'abc', citta_immobile: 'Roma' }), env);
check('A9 · contact_id malformato rifiutato', r.status === 400 && chiamate.length === 0, `status ${r.status}`);

reset();
r = await worker.fetch(req({ contact_id: 'rQlYydhMRsMktLjs7iN6' }), env);
check('A10 · nessun campo da scrivere: non disturba GHL', r.status === 204 && chiamate.length === 0, `status ${r.status}, ${chiamate.length} chiamate`);

// ---------- caso buono ----------
reset();
r = await worker.fetch(req(payloadBuono), env);
check('B1 · richiesta valida accettata', r.status === 204, `status ${r.status}`);
check('B2 · due chiamate a GHL: campi + tag', chiamate.length === 2, `${chiamate.length} chiamate`);

const put = chiamate.find(c => c.method === 'PUT');
const corpo = put ? JSON.parse(put.body) : {};
check('B3 · PUT sul contatto giusto', put?.url.endsWith('/contacts/rQlYydhMRsMktLjs7iN6'), put?.url);
check('B4 · token nell intestazione, non nel corpo', put?.headers?.Authorization === 'Bearer pit-finto-per-il-test' && !put.body.includes('pit-finto'), '');
check('B5 · esattamente i 7 campi valorizzati del payload', corpo.customFields?.length === 7, `${corpo.customFields?.length} campi`);

const perId = Object.fromEntries((corpo.customFields || []).map(c => [c.id, c.fieldValue]));
check('B6 · citta mappata sull id giusto', perId['2EPV8IRyO3UEbJsibJQA'] === 'Roma', perId['2EPV8IRyO3UEbJsibJQA']);
check('B7 · via mappata sull id giusto', perId['3jhbti4RwiLq4totHvwI'] === 'Via della Lungaretta 42', perId['3jhbti4RwiLq4totHvwI']);
check('B8 · numeri convertiti in stringa', perId['qjLlbKXfFaUq7Ekjmdt6'] === '2', perId['qjLlbKXfFaUq7Ekjmdt6']);
check('B9 · "fonte" NON finisce nei campi (non e in whitelist)', !JSON.stringify(corpo).includes('calcolatore-v2-autosave'), '');
check('B10 · il corpo non contiene "tags" (cancellerebbe quelli esistenti)', !('tags' in corpo), Object.keys(corpo).join(','));

const tag = chiamate.find(c => c.url.endsWith('/tags'));
check('B11 · tag aggiunto con endpoint separato', !!tag && JSON.parse(tag.body).tags[0] === 'calcolatore-compilato', tag?.body);

// ---------- video della VSL ----------
const payloadVideo = { contact_id: 'rQlYydhMRsMktLjs7iN6', fonte: 'vsl-grazie-video', video_vsl_pct: 50 };

reset();
r = await worker.fetch(req(payloadVideo), env);
const putV = chiamate.find(c => c.method === 'PUT');
const corpoV = putV ? JSON.parse(putV.body) : {};
check('V1 · la percentuale guardata viene scritta', corpoV.customFields?.length === 1 && corpoV.customFields[0].id === '3Nv64YyptlobUcqyDWRa', JSON.stringify(corpoV.customFields));
check('V2 · valore 50', corpoV.customFields?.[0]?.fieldValue === '50', corpoV.customFields?.[0]?.fieldValue);
const tagV = chiamate.find(c => c.url.endsWith('/tags'));
check('V3 · tag legato alla percentuale, non "calcolatore-compilato"', !!tagV && JSON.parse(tagV.body).tags[0] === 'vsl-video-50', tagV?.body);

reset();
r = await worker.fetch(req({ ...payloadVideo, video_vsl_pct: 37 }), env);
check('V4 · percentuale fuori dalle quattro tappe: scartata', r.status === 204 && chiamate.length === 0, `status ${r.status}, ${chiamate.length} chiamate`);

reset();
r = await worker.fetch(req({ contact_id: 'rQlYydhMRsMktLjs7iN6', fonte: 'inventata', citta_immobile: 'Roma' }), env);
check('V5 · fonte sconosciuta: campi sì, nessun tag', r.status === 204 && chiamate.filter(c => c.url.endsWith('/tags')).length === 0, `${chiamate.length} chiamate`);

reset();
r = await worker.fetch(req({ ...payloadVideo, video_vsl_pct: 100, citta_immobile: 'Roma' }), env);
const tagV2 = chiamate.find(c => c.url.endsWith('/tags'));
check('V6 · al 100% il tag è vsl-video-100', !!tagV2 && JSON.parse(tagV2.body).tags[0] === 'vsl-video-100', tagV2?.body);

// ---------- campi non in whitelist ----------
reset();
r = await worker.fetch(req({ ...payloadBuono, email: 'attaccante@example.com', tags: ['admin'], firstName: 'Cambiato' }), env);
const put2 = chiamate.find(c => c.method === 'PUT');
const corpo2 = JSON.parse(put2.body);
check('C1 · email iniettata viene ignorata', !JSON.stringify(corpo2).includes('attaccante'), '');
check('C2 · firstName iniettato viene ignorato', !JSON.stringify(corpo2).includes('Cambiato'), '');
check('C3 · tag arbitrario iniettato viene ignorato', !JSON.stringify(corpo2).includes('admin'), '');
check('C4 · si scrivono solo chiavi note', Object.keys(corpo2).join(',') === 'customFields', Object.keys(corpo2).join(','));

// ---------- errori di GHL ----------
reset();
rispostaGhl = { ok: false, status: 401, body: 'token scaduto' };
r = await worker.fetch(req(payloadBuono), env);
check('D1 · GHL che rifiuta -> 502 al chiamante', r.status === 502, `status ${r.status}`);
check('D2 · se il PUT fallisce non prova il tag', chiamate.filter(c => c.url.endsWith('/tags')).length === 0, '');

reset();
rispostaTag = { ok: false, status: 500, body: 'ko' };
r = await worker.fetch(req(payloadBuono), env);
check('D3 · tag fallito non butta via i campi salvati', r.status === 204, `status ${r.status}`);

// ---------- CORS ----------
reset();
r = await worker.fetch(req(payloadBuono, { method: 'OPTIONS' }), env);
check('E1 · preflight risposto', r.status === 204, `status ${r.status}`);
check('E2 · preflight solo per origine ammessa', r.headers.get('Access-Control-Allow-Origin') === OK_ORIGIN, r.headers.get('Access-Control-Allow-Origin'));

globalThis.fetch = fetchVero;

let ok = 0;
for (const x of risultati) { if (x.ok) ok++; console.log(`${x.ok ? '  OK  ' : ' FAIL '} ${x.nome}${x.dettaglio ? '   → ' + x.dettaglio : ''}`); }
console.log(`\n${ok}/${risultati.length} superati`);
process.exit(ok === risultati.length ? 0 : 1);
