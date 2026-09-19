/**
 * Ponte fra il calcolatore e GHL - Cloudflare Worker.
 * Riceve i dati dell'immobile dalla pagina (anche senza click sul report)
 * e li scrive sul contatto via API v2. Spiegazioni in tools/GUIDA-WORKER.md.
 * Il token vive come secret del Worker: non e' mai nella pagina pubblica.
 */

const GHL_BASE = 'https://services.leadconnectorhq.com';
const GHL_VERSION = '2021-07-28';
const PERCENTUALI_VIDEO = [25, 50, 75, 100];

// Che tag mettere, deciso qui in base al campo "fonte" della pagina.
// Il payload dice DA DOVE arriva, mai QUALE tag scrivere: uno che manomette
// la richiesta non puo' inventarsi tag nuovi sul contatto.
const TAG_PER_FONTE = {
  'calcolatore-v2-autosave': () => 'calcolatore-compilato',
  'vsl-grazie-video': (d) => {
    const p = Number(d.video_vsl_pct);
    return PERCENTUALI_VIDEO.includes(p) ? 'vsl-video-' + p : null;
  },
};

const ORIGINI_AMMESSE = [
  'https://tools.affittibreviaroma.com',
];

// Whitelist: chiave nel payload -> id del custom field GHL.
// Id reali del sub-account E1HO8PRyWf2yGaTFLuLC, verificati il 18/09/2026.
// Aggiungere una riga qui e' l'unico modo di far scrivere un campo in piu'.
const CAMPI = {
  citta_immobile:     '2EPV8IRyO3UEbJsibJQA',
  zona_immobile:      'aiovraZGkkS396EtydaU',
  via_immobile:       '3jhbti4RwiLq4totHvwI',
  camere_letto:       'qjLlbKXfFaUq7Ekjmdt6',
  posti_letto:        '5NTsbkA3yr6vYRPVyQgH',
  prezzo_attuale:     'hNKj8W7MfIux5R0k5NzJ',
  prezzo_consigliato: 'UmkV5eIzxji8AeXQZW1p',
  aumento_pct:        'yexerI0GvNOeOG25T9m9',
  regime_calc:        'fIzp0SVZFBJQeFru5tEh',
  obiettivo_calc:     'gCDOU6pnDedCJdKbqIkl',
  netto_oggi:         'uDf9DzrIiWU3TXIjSLjn',
  netto_nuovo:        'buoVJFSNhqnYwWqsbYCr',
  perdita_anno:       'QoVDV6jGxRvRYr2Vuonk',
  // quanto ha guardato del video sulla pagina VSL: 25, 50, 75 o 100
  video_vsl_pct:      '3Nv64YyptlobUcqyDWRa',
};

// Campi che accettano solo alcuni valori. Quelli non elencati passano come sono.
const VALORI_AMMESSI = {
  video_vsl_pct: PERCENTUALI_VIDEO,
};

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

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: {
        ...testa,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      } });
    }
    if (request.method !== 'POST') {
      return new Response('Solo POST', { status: 405, headers: testa });
    }
    if (!origin || !ORIGINI_AMMESSE.includes(origin)) {
      return new Response('Origine non ammessa', { status: 403, headers: testa });
    }
    if (!env.GHL_TOKEN) {
      console.error('GHL_TOKEN non configurato come secret del Worker');
      return new Response('Configurazione incompleta', { status: 500, headers: testa });
    }

    // La pagina manda text/plain apposta: e' "safelisted" e non scatena il
    // preflight CORS, che sendBeacon non saprebbe gestire.
    let dati;
    try {
      dati = JSON.parse(await request.text());
    } catch (e) {
      return new Response('JSON non valido', { status: 400, headers: testa });
    }

    const contactId = String(dati.contact_id || '').trim();
    if (!ID_PLAUSIBILE.test(contactId)) {
      return new Response('contact_id mancante o non valido', { status: 400, headers: testa });
    }

    const customFields = [];
    for (const chiave of Object.keys(CAMPI)) {
      const v = dati[chiave];
      if (v === undefined || v === null || v === '') continue;
      const ammessi = VALORI_AMMESSI[chiave];
      if (ammessi && !ammessi.includes(Number(v))) continue;
      customFields.push({ id: CAMPI[chiave], fieldValue: String(v) });
    }
    if (customFields.length === 0) {
      return new Response(null, { status: 204, headers: testa });
    }

    const intestazioni = {
      Authorization: 'Bearer ' + env.GHL_TOKEN,
      Version: GHL_VERSION,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const url = GHL_BASE + '/contacts/' + encodeURIComponent(contactId);

    try {
      const r = await fetch(url, {
        method: 'PUT',
        headers: intestazioni,
        body: JSON.stringify({ customFields }),
      });
      if (!r.ok) {
        console.error('GHL update-contact fallito', r.status, (await r.text()).slice(0, 500));
        return new Response('Aggiornamento contatto fallito', { status: 502, headers: testa });
      }

      // Tag a parte: /tags aggiunge, mentre il campo "tags" della
      // update-contact avrebbe CANCELLATO tutti i tag gia' sul contatto.
      // Se fallisce solo questo, i campi restano salvati: sono la cosa che conta.
      const scegliTag = TAG_PER_FONTE[String(dati.fonte || '')];
      const tag = scegliTag ? scegliTag(dati) : null;
      if (tag) {
        const rt = await fetch(url + '/tags', {
          method: 'POST',
          headers: intestazioni,
          body: JSON.stringify({ tags: [tag] }),
        });
        if (!rt.ok) {
          console.error('GHL add-tags fallito', rt.status, (await rt.text()).slice(0, 300));
        }
      }

      return new Response(null, { status: 204, headers: testa });
    } catch (e) {
      console.error('Errore di rete verso GHL', String(e));
      return new Response('Errore verso GHL', { status: 502, headers: testa });
    }
  },
};
