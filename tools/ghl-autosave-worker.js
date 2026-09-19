/**
 * Ponte fra il calcolatore e GHL — Cloudflare Worker.
 *
 * A COSA SERVE
 * Il calcolatore manda qui i dati dell'immobile mentre la persona li scrive,
 * anche se poi non clicca "Ricevi il report". Questo Worker li scrive sul
 * contatto GHL usando l'API, e aggiunge il tag calcolatore-compilato.
 *
 * PERCHE' NON L'INBOUND WEBHOOK DI GHL
 * L'Inbound Webhook e' una Premium Action: si paga a esecuzione, e l'autosave
 * per sua natura spara piu' volte per visitatore. Qui il costo e' zero (il
 * piano gratuito di Cloudflare Workers copre 100.000 richieste al giorno) e
 * non cresce col traffico del funnel.
 *
 * IL TOKEN NON STA NELLA PAGINA
 * Il Private Integration Token vive come secret del Worker, lato server.
 * Nella pagina pubblica finisce solo l'URL di questo Worker, che da solo non
 * permette di leggere nulla: vedi le difese piu' sotto.
 *
 * DIFESE (l'URL del Worker e' pubblico, quindi vanno messe)
 *  1. Solo POST.
 *  2. Solo dalle origini in ORIGINI_AMMESSE.
 *  3. Serve un contact_id di forma plausibile: senza quello non si fa nulla.
 *  4. Si scrivono SOLO i campi nella whitelist CAMPI, mappati per id.
 *     Nessun altro campo del contatto e' raggiungibile da qui: niente
 *     email, telefono, nome, niente tag arbitrari.
 *  5. Il tag e' fisso e viene aggiunto con l'endpoint /tags, che NON
 *     sovrascrive i tag gia' presenti (l'API update-contact invece li
 *     azzererebbe tutti: trappola da evitare).
 *
 * Il peggio che puo' fare chi trova l'URL e' scrivere quei 5 campi su un
 * contatto di cui conosce gia' l'id. Non puo' leggere niente, non puo'
 * toccare altro.
 */

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';
const TAG = 'calcolatore-compilato';

const ORIGINI_AMMESSE = [
  'https://tools.affittibreviaroma.com',
];

/**
 * Whitelist: chiave nel payload -> id del custom field in GHL.
 * Gli id sono quelli reali del sub-account Propromanager
 * (E1HO8PRyWf2yGaTFLuLC), verificati il 18/09/2026.
 * Aggiungere una riga qui e' l'unico modo di far scrivere un campo in piu'.
 */
const CAMPI = {
  citta_immobile:     '2EPV8IRyO3UEbJsibJQA',
  zona_immobile:      'aiovraZGkkS396EtydaU',
  via_immobile:       '3jhbti4RwiLq4totHvwI',
  camere_letto:       'qjLlbKXfFaUq7Ekjmdt6',
  posti_letto:        '5NTsbkA3yr6vYRPVyQgH',
  // dati del calcolo: utili in scheda contatto anche se il report non parte
  prezzo_attuale:     'hNKj8W7MfIux5R0k5NzJ',
  prezzo_consigliato: 'UmkV5eIzxji8AeXQZW1p',
  aumento_pct:        'yexerI0GvNOeOG25T9m9',
  regime_calc:        'fIzp0SVZFBJQeFru5tEh',
  obiettivo_calc:     'gCDOU6pnDedCJdKbqIkl',
  netto_oggi:         'uDf9DzrIiWU3TXIjSLjn',
  netto_nuovo:        'buoVJFSNhqnYwWqsbYCr',
  perdita_anno:       'QoVDV6jGxRvRYr2Vuonk',
};

// id GHL: stringa alfanumerica, ~20 caratteri. Filtro grezzo ma taglia
// via subito i payload spazzatura senza sprecare una chiamata all'API.
const ID_PLAUSIBILE = /^[A-Za-z0-9]{15,30}$/;

function cors(origin) {
  const h = { 'Cache-Control': 'no-store' };
  if (origin && ORIGINI_AMMESSE.includes(origin)) {
    h['Access-Control-Allow-Origin'] = origin;
    h['Vary'] = 'Origin';
  }
  return h;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const testa = cors(origin);

    // preflight: non dovrebbe mai arrivare (la pagina usa text/plain, che e'
    // "safelisted" e non lo scatena) ma se arriva va risposto comunque
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { ...testa, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Solo POST', { status: 405, headers: testa });
    }

    if (!origin || !ORIGINI_AMMESSE.includes(origin)) {
      // niente dettagli nel messaggio: non serve spiegare a chi sonda
      return new Response('Origine non ammessa', { status: 403, headers: testa });
    }

    if (!env.GHL_TOKEN) {
      console.error('GHL_TOKEN non configurato come secret del Worker');
      return new Response('Configurazione incompleta', { status: 500, headers: testa });
    }

    // il corpo arriva come text/plain (scelta della pagina, per non far
    // scattare il preflight che sendBeacon non saprebbe gestire)
    let dati;
    try {
      dati = JSON.parse(await request.text());
    } catch {
      return new Response('JSON non valido', { status: 400, headers: testa });
    }

    const contactId = String(dati.contact_id || '').trim();
    if (!ID_PLAUSIBILE.test(contactId)) {
      return new Response('contact_id mancante o non valido', { status: 400, headers: testa });
    }

    // solo i campi in whitelist, solo se hanno davvero un valore
    const customFields = [];
    for (const [chiave, id] of Object.entries(CAMPI)) {
      const v = dati[chiave];
      if (v === undefined || v === null || v === '') continue;
      customFields.push({ id, fieldValue: String(v) });
    }

    if (customFields.length === 0) {
      // niente da scrivere: si esce senza disturbare GHL
      return new Response(null, { status: 204, headers: testa });
    }

    const intestazioni = {
      Authorization: `Bearer ${env.GHL_TOKEN}`,
      Version: GHL_VERSION,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };

    try {
      const r = await fetch(`${GHL_BASE}/contacts/${encodeURIComponent(contactId)}`, {
        method: 'PUT',
        headers: intestazioni,
        body: JSON.stringify({ customFields }),
      });

      if (!r.ok) {
        const dettaglio = await r.text();
        console.error('GHL update-contact fallito', r.status, dettaglio.slice(0, 500));
        return new Response('Aggiornamento contatto fallito', { status: 502, headers: testa });
      }

      // Tag a parte: l'endpoint /tags aggiunge, mentre il campo "tags" della
      // update-contact avrebbe cancellato tutti i tag gia' sul contatto.
      // Se fallisce non si butta via l'aggiornamento dei campi, che e' la
      // cosa importante: si registra e basta.
      const rt = await fetch(`${GHL_BASE}/contacts/${encodeURIComponent(contactId)}/tags`, {
        method: 'POST',
        headers: intestazioni,
        body: JSON.stringify({ tags: [TAG] }),
      });
      if (!rt.ok) {
        console.error('GHL add-tags fallito', rt.status, (await rt.text()).slice(0, 300));
      }

      return new Response(null, { status: 204, headers: testa });
    } catch (e) {
      console.error('Errore di rete verso GHL', String(e));
      return new Response('Errore verso GHL', { status: 502, headers: testa });
    }
  },
};
