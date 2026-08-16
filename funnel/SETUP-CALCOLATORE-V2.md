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

### 1. Creare 5 custom field nuovi

`Settings → Custom Fields → Add Field`, gruppo dove stanno già gli altri del
calcolatore.

| Nome del campo | Tipo | fieldKey che deve risultare |
|---|---|---|
| `Citta Immobile` | Single Line Text | `contact.citta_immobile` |
| `Zona Immobile` | Single Line Text | `contact.zona_immobile` |
| `Via Immobile` | Single Line Text | `contact.via_immobile` |
| `Camere Letto` | Number | `contact.camere_letto` |
| `Posti Letto` | Number | `contact.posti_letto` |

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
