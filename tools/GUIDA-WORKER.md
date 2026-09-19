# Mettere online il ponte GHL (Cloudflare Worker)

Il codice è in `tools/ghl-autosave-worker.js`, già scritto e provato. Qui
ci sono solo i passi da fare tu, perché servono due cose che solo tu puoi
creare: un token dentro GHL e un account Cloudflare.

**Tempo: ~15 minuti. Costo: zero** (il piano gratuito di Cloudflare Workers
copre 100.000 richieste al giorno; il tuo funnel ne farà qualche decina).

---

## Passo 1 — Creare il token dentro GHL (5 minuti)

Serve un **Private Integration Token**: è una funzione standard di GHL, non
è una Premium Action, non si paga.

1. Nel sub-account Propromanager: `Settings` → `Private Integrations`
2. `Create new integration`
3. Nome: `Calcolatore autosave`
4. Scopes (spunta **solo** questi due, non di più):
   - `contacts.write`
   - `contacts.readonly`
5. Crea, e **copia il token**. Inizia con `pit-`.

> ⚠️ Copialo subito e tienilo da parte: GHL lo mostra una volta sola.
> Non incollarlo in chat, non metterlo in un file del repo, non mandarmelo.
> Serve solo a te, nel passo 3.

---

## Passo 2 — Creare il Worker su Cloudflare (5 minuti)

1. Vai su **dash.cloudflare.com** e registrati (gratis, serve solo un'email).
2. Nel menu a sinistra: `Compute (Workers)` → `Create` → `Start with Hello World`
3. Dai un nome, per esempio `ghl-autosave`
4. Clicca **Deploy** (per ora pubblica l'esempio, va bene così)
5. Clicca **Edit code**
6. **Cancella tutto** quello che c'è nell'editor e incolla al suo posto il
   contenuto di `tools/ghl-autosave-worker.js`
7. Clicca **Deploy** di nuovo
8. **Copia l'URL del Worker**: sarà tipo
   `https://ghl-autosave.TUONOME.workers.dev`

---

## Passo 3 — Dare il token al Worker (2 minuti)

Il token non va nel codice: va messo come "secret", così resta sul server e
non è leggibile da nessuno che apra la pagina.

1. Nella pagina del Worker su Cloudflare: `Settings` → `Variables and Secrets`
2. `Add` → tipo **Secret** (non "Text", deve essere Secret)
3. Nome della variabile: `GHL_TOKEN` (esatto, maiuscolo)
4. Valore: il token `pit-...` del passo 1
5. Salva e fai **Deploy**

---

## Passo 4 — Collegare la pagina al Worker

Mandami l'URL del Worker del passo 2 e lo incollo io nel file, con commit e
push. Oppure fallo tu: in `funnel/calcolatore-v2.html` cerca

```js
var AUTOSAVE_WEBHOOK_URL = 'INCOLLA_QUI_URL_INBOUND_WEBHOOK_GHL';
```

e sostituisci il placeholder con l'URL. Poi ripubblica la pagina su GHL.

---

## Passo 5 — Il redirect della landing (indispensabile)

Questo resta uguale a prima ed è **il passaggio senza il quale niente
funziona**: il Worker ha bisogno di sapere di quale contatto si tratta.

Form della landing → `Settings` → `On Submit` → `Redirect URL`. Da:

```
https://tools.affittibreviaroma.com/calcolatore
```

a:

```
https://tools.affittibreviaroma.com/calcolatore?cid={{contact.id}}
```

---

## Passo 6 — La prova

1. Apri il calcolatore **passando dalla landing**, non con un link diretto.
2. Controlla che nell'URL ci sia `?cid=...`
3. Compila solo la domanda 3 (città, zona, via, camere, posti letto).
   **Non cliccare "Ricevi il report".**
4. Aspetta 2 secondi e chiudi la scheda.
5. In GHL apri quel contatto: i 5 campi immobile devono essere pieni e deve
   esserci il tag `calcolatore-compilato`.

Se i campi restano vuoti, guarda in quest'ordine:

| Sintomo | Dove guardare |
|---|---|
| Nessun `?cid=` nell'URL | Passo 5, il redirect della landing |
| `cid` c'è ma i campi restano vuoti | Passo 4: il placeholder è ancora nel file? |
| Il Worker risponde 403 | L'origine: la pagina è servita da un dominio diverso da `tools.affittibreviaroma.com`. Aggiungilo in `ORIGINI_AMMESSE` dentro il Worker |
| Il Worker risponde 502 | Token sbagliato o scaduto, oppure scope mancanti. Rifai il passo 1 |
| Il Worker risponde 500 | Il secret `GHL_TOKEN` non è configurato: passo 3 |

Su Cloudflare, `Workers` → il tuo worker → `Logs` → `Begin log stream` ti
mostra in diretta cosa arriva e cosa risponde. È il posto dove guardare per
primo se qualcosa non torna.

---

## Cosa è già stato verificato da me

30 test sul Worker e una prova end-to-end col browser vero (pagina → Worker
→ GHL finto):

- l'origine non ammessa viene bloccata **prima** di chiamare GHL
- senza `contact_id` valido non parte nessuna chiamata
- si scrivono solo i 13 campi in whitelist: email, nome, telefono e tag
  arbitrari iniettati nel payload vengono ignorati
- il tag si aggiunge con l'endpoint dedicato, che **non** cancella i tag
  già presenti sul contatto
- se GHL rifiuta l'aggiornamento non si tenta il tag; se fallisce solo il
  tag, i campi restano comunque salvati
- i dati partono senza click sul report, e alla chiusura della scheda parte
  un ultimo invio col valore aggiornato

## Quanto è esposto l'URL del Worker

L'URL finisce nel codice della pagina pubblica, quindi è visibile. Il peggio
che può fare chi lo trova è scrivere quei 13 campi su un contatto **di cui
conosce già l'id** (una stringa casuale di 20 caratteri, non indovinabile).
Non può leggere nulla, non può toccare email, telefono, nome o altri tag,
non può creare o cancellare contatti. Il token non è mai nella pagina.
