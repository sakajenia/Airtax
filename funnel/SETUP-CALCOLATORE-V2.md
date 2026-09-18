# Calcolatore v2 — dati immobile (città, zona, via, camere, posti letto)

File nuovo: **`funnel/calcolatore-v2.html`**.
`calcolatore.html` **non è stato toccato**: resta identico e funzionante.

---

## Cosa cambia

Una sola aggiunta: la **domanda 4 — «📍 Dove si trova il tuo immobile?»**, subito
dopo le tre domande esistenti, con lo stesso design (stessa card, stessi colori,
stesso numero nel pallino rosso).

| Campo | Tipo | Obbligatorio |
|---|---|---|
| Città | testo (precompilato "Roma") | sì |
| Zona / quartiere | menu a tendina, 16 zone di Roma + "Altra zona di Roma" + "Fuori Roma" | sì |
| Via e numero civico | testo | sì |
| 🛏️ Camere da letto | numero | sì |
| 👥 Posti letto | numero | sì |

**Come funziona l'obbligo:** i campi non bloccano il calcolo — il prezzo
consigliato continua ad aggiornarsi in tempo reale come prima, così il lead vede
subito il valore. Bloccano invece il **pulsante «Ricevi il report»**: se manca
qualcosa, la modale non si apre, compare l'avviso rosso, i campi mancanti si
colorano di rosso e la pagina scorre da sola sulla domanda 4 mettendo il cursore
sul primo campo vuoto. Appena compili, l'errore sparisce da solo.

> **Camere da letto e posti letto sono due cose diverse** e nel messaggio me le
> hai nominate entrambe ("numero di camera da letto" e poi "i numeri di posti
> letto"), quindi le ho messe tutte e due: sono i due dati standard di un annuncio
> e servono per capire la taglia dell'immobile. Se preferisci chiederne uno solo
> dimmelo e tolgo l'altro in un minuto.

## Cosa NON cambia

- **Il calcolo è identico.** Verificato confrontando le due versioni con lo stesso
  scenario: 100 €/notte, cedolare 21%, "guadagnare come oggi" → **120 €/notte
  (+20%)**, netto 76 → 76, perdita 1625 €. Tutte e 8 le chiavi coincidono.
- **Il report non cambia.** L'email e il messaggio WhatsApp restano quelli:
  i 5 dati nuovi viaggiano al backend ma non vengono stampati nel report,
  come mi hai chiesto.
- Bottone di prenotazione, form GHL collegato, `form_embed.js`: invariati.

---

## Da fare in GHL (in quest'ordine)

### 1. ~~Creare 5 custom field nuovi~~ ✅ GIÀ FATTO via API

Creati il 18/09/2026 nel sub-account `E1HO8PRyWf2yGaTFLuLC`, già nel gruppo
`halXI5SE0wCXja3uZYIy` (quello degli altri campi calcolatore). **Le chiavi sono
uscite corrette, nessuna storpiatura.** Non serve rifare niente.

| Nome del campo | Tipo | fieldKey (verificata) | ID |
|---|---|---|---|
| `Citta Immobile` | TEXT | `contact.citta_immobile` | `2EPV8IRyO3UEbJsibJQA` |
| `Zona Immobile` | TEXT | `contact.zona_immobile` | `aiovraZGkkS396EtydaU` |
| `Via Immobile` | TEXT | `contact.via_immobile` | `3jhbti4RwiLq4totHvwI` |
| `Camere Letto` | NUMERICAL | `contact.camere_letto` | `qjLlbKXfFaUq7Ekjmdt6` |
| `Posti Letto` | NUMERICAL | `contact.posti_letto` | `5NTsbkA3yr6vYRPVyQgH` |

> Conferma sul campo minato degli accenti: nel sub-account esistono davvero
> `contact.quando__disponibile_il_tuo_immobile` (doppio underscore, da "è") e
> `contact.in_che_condizioni_e_il_tuo_immobile`. L'avvertimento era fondato.

> ⚠️ **Scrivi «Citta» senza accento.** GHL genera la chiave dal nome: con "Città"
> rischi una chiave storpiata tipo `contact.citt_immobile` e poi non combacia con
> la querystring. Con l'accento ci siamo già scottati sul campo `canale_report`,
> che è stato necessario cancellare e ricreare.

> ℹ️ Nel sub-account esistono già `contact.property_location` e
> `contact.number_of_units` da altri funnel. **Non usarli**: sono alimentati da
> altri form e ci sovrascriveremmo i dati a vicenda.

### 2. Aggiungere 5 campi nascosti al form report

Form **«Invio Report Calcolatore tasse AIrbnb»** (`Ompsev6jK1yZDrvBrKz8`).
Stessa procedura degli 8 già presenti: campo **Hidden**, mappato al custom field,
con la **Query Key** identica alla chiave.

```
citta_immobile
zona_immobile
via_immobile
camere_letto
posti_letto
```

### 3. Pubblicare la pagina

Il mio consiglio: pubblicala prima su un percorso nuovo (es. `/calcolatore-v2`)
e provala, poi quando sei sicuro sostituisci il contenuto di `/calcolatore`.
Così se qualcosa non va il funnel che gira oggi non si ferma.

---

## PROMPT per Ask AI — creare campi e campi nascosti

```
Nel sub-account Propromanager (E1HO8PRyWf2yGaTFLuLC) devo aggiungere 5 dati
sull'immobile raccolti da una nuova versione del calcolatore.

PARTE 1 — Custom field
Vai su Settings → Custom Fields e crea questi 5 campi per i CONTATTI,
mettendoli nello stesso gruppo dove stanno gia' Prezzo Attuale,
Prezzo Consigliato e Canale Report:

  Nome: Citta Immobile    Tipo: Single Line Text
  Nome: Zona Immobile     Tipo: Single Line Text
  Nome: Via Immobile      Tipo: Single Line Text
  Nome: Camere Letto      Tipo: Number
  Nome: Posti Letto       Tipo: Number

ATTENZIONE: scrivi "Citta" SENZA accento. GHL genera la chiave dal nome e con
l'accento verrebbe storpiata. Dopo averli creati, aprili uno per uno e dimmi la
fieldKey esatta che GHL ha generato per ciascuno: devono risultare
contact.citta_immobile, contact.zona_immobile, contact.via_immobile,
contact.camere_letto, contact.posti_letto.
Se una chiave e' diversa, NON correggerla modificando il campo (GHL non cambia
la chiave): cancella quel campo e ricrealo con un nome che produca la chiave
giusta, e dimmelo.

PARTE 2 — Campi nascosti nel form
Vai su Sites → Forms e apri il form "Invio Report Calcolatore tasse AIrbnb".
Contiene gia' 8 campi nascosti (prezzo_attuale, prezzo_consigliato, ecc.).
Aggiungine altri 5 nello stesso identico modo: campo di tipo Hidden, collegato
al custom field corrispondente, con Query Key uguale alla chiave:

  citta_immobile   -> Citta Immobile
  zona_immobile    -> Zona Immobile
  via_immobile     -> Via Immobile
  camere_letto     -> Camere Letto
  posti_letto      -> Posti Letto

Non toccare gli 8 campi nascosti gia' presenti, ne' il campo Canale Report,
ne' il redirect del form. Salva e pubblica.

Alla fine elencami tutti i campi nascosti del form con la loro Query Key.
```

---

## Test di verifica

Dopo aver pubblicato la pagina e aggiornato il form:

```
Test del calcolatore v2.

1. Apri la pagina del calcolatore v2.
2. Senza compilare la domanda 4, clicca "Ricevi il report personalizzato".
   ATTESO: la finestra del form NON si apre, compare un avviso rosso e i campi
   mancanti diventano rossi. Dimmi se e' andata cosi'.
3. Compila la domanda 4 con:
   Citta: Roma
   Zona: Trastevere
   Via: Via della Lungaretta 42
   Camere da letto: 2
   Posti letto: 4
4. Metti prezzo 100, regime "Affitto una casa sola", obiettivo "Guadagnare come oggi".
   ATTESO: prezzo consigliato 120 €/notte (+20%). Dimmi il numero che vedi.
5. Clicca "Ricevi il report personalizzato": ora il form si deve aprire.
   Compilalo con email blionbg+v2@gmail.com e canale Email. Invia.
6. In GHL cerca il contatto appena creato e dimmi il valore di TUTTI questi campi:
   Prezzo Attuale, Prezzo Consigliato, Aumento Pct, Regime Calc, Obiettivo Calc,
   Netto Oggi, Netto Nuovo, Perdita Anno, Canale Report,
   Citta Immobile, Zona Immobile, Via Immobile, Camere Letto, Posti Letto.

   ATTESI: 100, 120, 20, "una casa (cedolare 21%)", "Guadagnare come oggi",
   76, 76, 1625, email, Roma, Trastevere, "Via della Lungaretta 42", 2, 4.

Segnalami ogni campo vuoto o diverso dall'atteso.
```

Quando l'hai fatto dimmelo: rileggo io il contatto via API e confermo che tutti
e 14 i campi sono arrivati. Poi si cancella il contatto di test.

---

## Verifiche già fatte da me (Playwright, in locale)

| Controllo | Esito |
|---|---|
| Calcolo identico alla v1 (8 chiavi su 8) | ✅ 100 → 120 (+20%), netto 76 → 76, perdita 1625 |
| Errori JavaScript | ✅ zero, sia v1 sia v2 |
| Modale bloccata con campi vuoti | ✅ non si apre, avviso mostrato, 4 campi evidenziati |
| Errori che spariscono compilando | ✅ avviso e bordi rossi si tolgono da soli |
| Modale che si apre a campi pieni | ✅ e punta al form giusto (`Ompsev6jK1yZDrvBrKz8`) |
| I 5 dati nuovi nella querystring del form | ✅ tutti e 5 presenti |
| Overflow orizzontale a 320 / 390 / 768 / 1280 px | ✅ nessuno |

---
---

# AUTOSAVE (v2.1) — tenere i dati anche senza il click

## Il problema

Nella v2 i dati della domanda 4 arrivavano in GHL **solo** se la persona
cliccava «Ricevi il report» *e* poi compilava e inviava il form. Se compilava
l'indirizzo e chiudeva la scheda, quei dati sparivano: vivevano in una variabile
JavaScript (`window.__leadData`) e morivano con la pagina. Nel file non c'era
nessun `localStorage`, nessun `fetch`, nessun webhook.

## Perché adesso si può risolvere

Perché **chi arriva sul calcolatore è già un contatto GHL**: sulla landing
(`funnel/landing.html`) ha già lasciato nome, email, telefono e consensi, è
finito allo stage 🔵 Registrato, e solo dopo è stato reindirizzato qui.
Mancava solo che la pagina sapesse *chi* ha davanti.

> ⚠️ **Il limite, detto chiaro:** chi apre il calcolatore con un link diretto
> senza passare dalla landing resta anonimo. Nessun `cid`, nessun contatto a cui
> attaccare i dati, nessun invio. Per lui resta solo il `localStorage`.
> Si copre chi viene dal funnel, non il 100% dei visitatori.

## Come funziona

1. La landing reindirizza al calcolatore con **`?cid=<id contatto>`**.
2. Il calcolatore legge il `cid` e se lo ricorda (sopravvive a un refresh).
3. Mentre la persona compila, i dati partono verso un **Inbound Webhook GHL**,
   con 800 ms di debounce (non a ogni tasto: a 800 ms di pausa).
4. Alla chiusura della scheda o al cambio app parte un ultimo invio con
   **`navigator.sendBeacon`**, che il browser consegna anche mentre la pagina muore.
5. Tutto finisce anche in `localStorage`: se torna, ritrova i campi compilati.

Nota tecnica: si usa `Content-Type: text/plain` perché è "safelisted" e non
scatena il preflight CORS `OPTIONS`, che `sendBeacon` non sa gestire. Il corpo
resta JSON e GHL lo interpreta come tale.

## Cosa NON fa (di proposito)

- **Non invia nulla senza `cid`.** Niente dati orfani.
- **Non fa partire il report.** Il workflow del report resta agganciato al form:
  chi non chiede il report non lo riceve. Auto-inviare il form in silenzio
  avrebbe mandato l'email a gente che non l'ha chiesta — scartato.
- **Non tocca il calcolo.** Verificato: 100 → 120 €/notte, le 8 chiavi intatte.

---

## Da fare a mano in GHL (l'API non basta)

> I workflow in GHL sono **read-only via API**: esistono solo `get-workflow` e
> `add-contact-to-workflow`, non c'è `create-workflow`. Il webhook va creato
> nella UI.

### A. Creare l'Inbound Webhook

`Automation → Workflows → Create Workflow → Start from scratch`

1. Trigger: **Inbound Webhook**.
2. Salva e **copia l'URL** che GHL genera.
3. Manda un payload di prova (vedi sotto) per far imparare a GHL lo schema.
4. Azione: **Update Contact**, con `Contact ID` mappato su `contact_id` del payload.
5. Mappa i 5 campi: `citta_immobile`, `zona_immobile`, `via_immobile`,
   `camere_letto`, `posti_letto`.
6. Consigliato: aggiungi l'azione **Add Tag** → `calcolatore-compilato`, così in
   una Smart List vedi subito chi ha compilato l'immobile **senza** chiedere il
   report. È proprio la lista che serviva.
7. Pubblica il workflow.

Payload di prova da mandare al webhook per far imparare lo schema a GHL:

```json
{
  "contact_id": "METTI_UN_ID_CONTATTO_VERO",
  "fonte": "calcolatore-v2-autosave",
  "citta_immobile": "Roma",
  "zona_immobile": "Trastevere",
  "via_immobile": "Via della Lungaretta 42",
  "camere_letto": 2,
  "posti_letto": 4,
  "prezzo_attuale": 100,
  "prezzo_consigliato": 120,
  "aumento_pct": 20,
  "regime_calc": "una casa (cedolare 21%)",
  "obiettivo_calc": "Guadagnare come oggi",
  "netto_oggi": 76,
  "netto_nuovo": 76,
  "perdita_anno": 1625
}
```

### B. Incollare l'URL del webhook nella pagina

In `funnel/calcolatore-v2.html`, cerca:

```js
var AUTOSAVE_WEBHOOK_URL = 'INCOLLA_QUI_URL_INBOUND_WEBHOOK_GHL';
```

e sostituisci il placeholder con l'URL del punto A. **Finché resta il
placeholder l'autosave è inerte**: non invia nulla e non dà errori.

### C. Far passare il `cid` dalla landing al calcolatore

Form della landing → `Settings → On Submit → Redirect URL`. Da:

```
https://tools.affittibreviaroma.com/calcolatore
```

a:

```
https://tools.affittibreviaroma.com/calcolatore?cid={{contact.id}}
```

> **Questo è il passaggio che regge tutto.** Senza `cid` il calcolatore non sa
> chi ha davanti e l'autosave non parte mai. Se qualcosa non funziona, controlla
> questo per primo.

### D. I 5 campi nascosti nel form report

Resta valido il punto 2 della sezione precedente: servono comunque, perché il
report continua a passare dal form.

---

## Verifiche fatte (Playwright, browser vero — 17/17)

Server locale che faceva sia da pagina sia da finto webhook GHL.

| Controllo | Esito |
|---|---|
| I dati arrivano **senza** click su «Ricevi il report» | ✅ |
| `contact_id` corretto nel payload | ✅ `TEST_CONTACT_123` |
| I 5 campi immobile nel payload | ✅ Roma / Trastevere / Via della Lungaretta 42 / 2 / 4 |
| Invio finale alla chiusura della scheda (`pagehide`) | ✅ col valore aggiornato all'ultimo istante |
| Debounce: non un invio per tasto | ✅ 1 invio per 5 campi |
| Calcolo invariato | ✅ 100 → 120 €/notte, 8 chiavi intatte |
| Campi ripristinati al ritorno sulla pagina | ✅ |
| `cid` ricordato anche senza querystring | ✅ |
| Senza `cid`: nessun invio | ✅ 0 invii |
| Eccezioni JavaScript | ✅ zero |

## Test da fare tu, dopo A–D

1. Apri il calcolatore **passando dalla landing** (non con link diretto).
2. Controlla che l'URL contenga `?cid=...`.
3. Compila solo la domanda 4. **Non cliccare «Ricevi il report».**
4. Aspetta 2 secondi e chiudi la scheda.
5. In GHL apri quel contatto: i 5 campi immobile devono essere valorizzati e
   deve esserci il tag `calcolatore-compilato`.
6. Controlla che **non** sia partita nessuna email di report.
