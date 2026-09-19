# GHL — tutto quello che resta da fare, in un file solo

Non hai ancora toccato nulla in GHL: parti da qui, in ordine, dall'alto in
basso. Questo file sostituisce e riassume `SETUP-CALCOLATORE-V2.md` e
`PROMPT-ASK-AI-AUTOSAVE.md` — quelli restano nel repo come storico, ma per
lavorare usa solo questo.

**Sub-account: Propromanager, `E1HO8PRyWf2yGaTFLuLC`.**

---

## 0 · Cosa è già fatto (non toccare)

I 5 custom field dell'immobile esistono già, creati via API il 18/09/2026,
nello stesso gruppo degli altri campi del calcolatore:

| Nome campo | Tipo | Chiave (`fieldKey`) |
|---|---|---|
| Citta Immobile | Testo | `contact.citta_immobile` |
| Zona Immobile | Testo | `contact.zona_immobile` |
| Via Immobile | Testo | `contact.via_immobile` |
| Camere Letto | Numero | `contact.camere_letto` |
| Posti Letto | Numero | `contact.posti_letto` |

Non ricrearli, non rinominarli. Se in Settings → Custom Fields li vedi già,
questo punto è chiuso.

> ⚠️ Occhio a due campi che esistono già nel sub-account per **altri** funnel:
> `contact.property_location` e `contact.number_of_units`. Non sono i nostri,
> non usarli: sono alimentati da altri form, e ci si sovrascriverebbero i dati
> a vicenda.

---

## 1 · Creare l'Inbound Webhook (il pezzo centrale, quello che manca davvero)

**Cosa fa:** riceve i dati dell'immobile mentre la persona compila il
calcolatore — anche se non clicca mai "Ricevi il report" — e li scrive sul
contatto GHL. È il pezzo che fa funzionare l'autosave descritto più sotto.

**Perché lo fai tu e non l'API:** i workflow GHL sono di sola lettura via
API (esistono solo `get-workflow` e `add-contact-to-workflow`, non
`create-workflow`). Va creato dalla UI, o con Ask AI.

### A mano

1. `Automation → Workflows → Create Workflow → Start from scratch`
2. Nome: `Calcolatore v2 - Autosave dati immobile`
3. Trigger: **Inbound Webhook**. Salvalo e **copia l'URL** che GHL genera —
   ti servirà al punto 2 di questo file.
4. Manda il payload di prova qui sotto a quell'URL (con Postman, o anche solo
   incollandolo nel tester che GHL offre dopo aver creato il trigger), così
   GHL impara la struttura dei dati.
5. Aggiungi l'azione **Update Contact**:
   - il contatto da aggiornare è quello identificato da `contact_id` nel payload
     (non cercarlo per email)
   - `Citta Immobile` ← `citta_immobile`
   - `Zona Immobile` ← `zona_immobile`
   - `Via Immobile` ← `via_immobile`
   - `Camere Letto` ← `camere_letto`
   - `Posti Letto` ← `posti_letto`
6. Aggiungi l'azione **Add Tag**: `calcolatore-compilato`. Ti serve dopo per
   vedere in una Smart List chi ha compilato l'immobile anche senza chiedere
   il report.
7. **Pubblica il workflow** (non lasciarlo in Draft — è l'errore più comune).

**Payload di prova** (sostituisci `contact_id` con l'ID di un tuo contatto vero):

```json
{
  "contact_id": "ID_DI_UN_CONTATTO_VERO",
  "fonte": "calcolatore-v2-autosave",
  "citta_immobile": "Roma",
  "zona_immobile": "Trastevere",
  "via_immobile": "Via della Lungaretta 42",
  "camere_letto": 2,
  "posti_letto": 4,
  "prezzo_attuale": 100,
  "prezzo_consigliato": 136,
  "aumento_pct": 36,
  "regime_calc": "una casa (cedolare 21%)",
  "obiettivo_calc": "Guadagnare come oggi",
  "netto_oggi": 75,
  "netto_nuovo": 82,
  "perdita_anno": 1983
}
```

### Oppure, prompt per Ask AI

```
Nel sub-account Propromanager (E1HO8PRyWf2yGaTFLuLC) devo creare un workflow
che riceve dati da una pagina web e aggiorna un contatto gia' esistente.

Crea un workflow chiamato "Calcolatore v2 - Autosave dati immobile".

TRIGGER: Inbound Webhook.
Dopo averlo creato dimmi l'URL del webhook, per esteso.

AZIONE 1 - Update Contact.
Il contatto da aggiornare NON va cercato per email: arriva il suo ID nel campo
"contact_id" del payload. Mappa cosi':
  contact_id      -> identifica il contatto da aggiornare
  citta_immobile  -> campo Citta Immobile
  zona_immobile   -> campo Zona Immobile
  via_immobile    -> campo Via Immobile
  camere_letto    -> campo Camere Letto
  posti_letto     -> campo Posti Letto
I 5 custom field esistono gia', non ricrearli. Le chiavi sono
contact.citta_immobile, contact.zona_immobile, contact.via_immobile,
contact.camere_letto, contact.posti_letto.

AZIONE 2 - Add Tag: calcolatore-compilato

Poi pubblica il workflow (non lasciarlo in Draft) e dimmi:
1. l'URL completo del webhook
2. se l'Inbound Webhook RIESCE davvero a identificare il contatto dal solo
   contact_id, oppure se pretende email o telefono. Questa risposta mi serve
   precisa: se serve l'email devo cambiare la pagina web.
3. lo stato del workflow (Published o Draft)
```

> ⚠️ **La domanda 2 del prompt è la più importante di tutte.** Se GHL risponde
> che serve l'email, non ignorarlo: nella pagina c'è già pronto un ripiego
> (cerca `getEmail()` in `calcolatore-v2.html`). In quel caso, al punto 3 di
> questo file, invece di `?cid={{contact.id}}` userai
> `?cid={{contact.id}}&em={{contact.email}}`. Costo di farlo comunque: l'email
> finisce nell'URL, quindi in cronologia e nei referrer verso terzi — usalo
> solo se GHL ti obbliga.

> ⚠️ Ask AI non è affidabile al 100% su queste operazioni: la spec di questo
> stesso calcolatore conteneva già un prompt Ask AI per creare i 5 custom
> field, e quei campi non risultavano creati quando ho controllato. **Dopo
> aver usato Ask AI, verifica sempre** con il punto 4 di questo file.

---

## 2 · Incollare l'URL del webhook nella pagina

Apri `funnel/calcolatore-v2.html`, cerca questa riga (circa riga 786):

```js
var AUTOSAVE_WEBHOOK_URL = 'INCOLLA_QUI_URL_INBOUND_WEBHOOK_GHL';
```

e sostituisci il placeholder con l'URL copiato al punto 1.

**Finché questo resta un placeholder, l'autosave è spento e innocuo**: non
invia nulla e non dà errori. Puoi pubblicare la pagina anche prima di questo
passaggio, senza rischi — semplicemente l'autosave non farà ancora nulla.

> Se non vuoi editare il file a mano, mandami l'URL del webhook e te lo
> incollo io: faccio commit e push sulla pull request.

---

## 3 · Far arrivare l'ID del contatto dalla landing al calcolatore

> ⚠️ **Questo è il passaggio che regge tutto l'autosave.** Senza, il
> calcolatore non sa mai chi ha davanti e il webhook del punto 1 non riceve
> mai nulla, anche se è configurato perfettamente.

> ⚠️ **I form sono due e si somigliano. Quello giusto e' il primo:**
>
> | Form | ID | Redirect attuale | Da toccare? |
> |---|---|---|---|
> | **Registrazioni Calcolatore tasse AIrbnb** | `oRexxrmMwWz2ablBAUoz` | `/calcolatore` | **SI'** |
> | Invio Report Calcolatore tasse AIrbnb | `Ompsev6jK1yZDrvBrKz8` | `/grazie` | **NO** |
>
> Il `/grazie` e' il redirect del form del report, ed e' corretto cosi'.

Form **Registrazioni Calcolatore tasse AIrbnb** (`oRexxrmMwWz2ablBAUoz`),
quello con il pulsante "Accedi al calcolatore gratis" →
`Settings → On Submit → Redirect URL`. Cambia da:

```
https://tools.affittibreviaroma.com/calcolatore
```

a:

```
https://tools.affittibreviaroma.com/calcolatore?cid={{contact.id}}
```

(oppure con `&em={{contact.email}}` in coda, solo se il punto 1 ha richiesto
il ripiego email — vedi sopra).

### Oppure, prompt per Ask AI

```
Nel sub-account Propromanager (E1HO8PRyWf2yGaTFLuLC) c'e' il form della landing
del calcolatore, quello col pulsante "Accedi al calcolatore gratis", che dopo
l'invio reindirizza a https://tools.affittibreviaroma.com/calcolatore

Devo cambiare SOLO il redirect di quel form, aggiungendo l'id del contatto:

  https://tools.affittibreviaroma.com/calcolatore?cid={{contact.id}}

Non cambiare nessun campo del form, ne' i consensi, ne' lo stage/pipeline, ne'
gli automatismi collegati: solo l'URL di redirect.

Prima dimmi il nome esatto del form che stai per modificare, cosi' confermo che
sia quello giusto. Dopo la modifica, dimmi l'URL di redirect risultante per
esteso e conferma che {{contact.id}} venga sostituito con l'id reale del
contatto al momento dell'invio.
```

---

## 4 · Cinque campi nascosti nel form report

**Cosa fa:** questi sono per il report vero e proprio (quello che parte
quando il lead clicca "Ricevi il report" e invia il form) — cosa diversa
dall'autosave. Servono comunque, anche se hai già fatto i punti 1-3.

Form: **«Invio Report Calcolatore tasse AIrbnb»** (`Ompsev6jK1yZDrvBrKz8`).
Contiene già 8 campi nascosti (`prezzo_attuale`, `prezzo_consigliato`, ecc.)
più il campo `canale_report`. Aggiungi 5 campi nuovi di tipo **Hidden**,
ognuno collegato al custom field corrispondente, con **Query Key** identica
alla chiave:

```
citta_immobile   -> Citta Immobile
zona_immobile    -> Zona Immobile
via_immobile     -> Via Immobile
camere_letto     -> Camere Letto
posti_letto      -> Posti Letto
```

Non toccare gli 8 campi già presenti, né `canale_report`, né il redirect
del form.

### Oppure, prompt per Ask AI

```
Nel sub-account Propromanager (E1HO8PRyWf2yGaTFLuLC), vai su Sites -> Forms e
apri il form "Invio Report Calcolatore tasse AIrbnb" (ID Ompsev6jK1yZDrvBrKz8).

Contiene gia' 8 campi nascosti (prezzo_attuale, prezzo_consigliato, aumento_pct,
regime_calc, obiettivo_calc, netto_oggi, netto_nuovo, perdita_anno) piu' il
campo canale_report. NON toccare nessuno di questi, e non toccare il redirect.

Aggiungi 5 campi nuovi di tipo Hidden, ognuno collegato al custom field
corrispondente, con Query Key uguale alla chiave del campo:

  citta_immobile   -> Citta Immobile
  zona_immobile    -> Zona Immobile
  via_immobile     -> Via Immobile
  camere_letto     -> Camere Letto
  posti_letto      -> Posti Letto

I 5 custom field esistono gia', non crearne di nuovi: collegati a quelli.
Salva e pubblica.

Alla fine elencami TUTTI i campi nascosti del form con la loro Query Key, cosi'
verifico che siano 13 e che nessuno dei vecchi sia cambiato.
```

---

## 5 · Pubblicare la pagina

`funnel/calcolatore-v2.html` è già nel formato giusto da incollare nel
blocco codice GHL, così com'è (nessun `<!DOCTYPE>`/`<head>`/`<body>` da
togliere).

Consiglio: pubblicalo prima su un percorso nuovo (es. `/calcolatore-v2`) e
provalo, poi quando sei sicuro sostituisci il contenuto di `/calcolatore`.
Così se qualcosa non va, il funnel che gira oggi non si ferma.

---

## 6 · Verifica finale — falla sempre, anche se Ask AI dice che è tutto ok

```
Nel sub-account Propromanager (E1HO8PRyWf2yGaTFLuLC) fammi un controllo e
rispondi punto per punto, senza modificare nulla:

1. Elenca i custom field dei contatti con queste chiavi e dimmi se esistono e di
   che tipo sono: contact.citta_immobile, contact.zona_immobile,
   contact.via_immobile, contact.camere_letto, contact.posti_letto

2. Apri il form "Invio Report Calcolatore tasse AIrbnb" e elencami tutti i campi
   nascosti con la loro Query Key. Quanti sono in totale?

3. Esiste un workflow chiamato "Calcolatore v2 - Autosave dati immobile"?
   E' Published o Draft? Qual e' l'URL del suo Inbound Webhook? Quali azioni
   contiene, in ordine?

4. Qual e' l'URL di redirect del form della landing del calcolatore? Contiene
   ?cid={{contact.id}} ?

5. Quanti contatti hanno il tag "calcolatore-compilato"?
```

Le risposte attese: 5 campi tutti presenti; 13 campi nascosti nel form (8
vecchi + `canale_report` + 5 nuovi); un workflow Published con webhook e le
due azioni; il redirect con `?cid={{contact.id}}`.

---

## 7 · Test end-to-end — questo lo fai tu, non Ask AI

### Test A — l'autosave (i punti 1-3)

1. Apri il calcolatore **passando dalla landing**, non con un link diretto.
2. Controlla che l'URL contenga `?cid=...`.
3. Compila **solo la domanda 3** (città, zona, via, camere, posti letto).
   **Non cliccare "Ricevi il report".**
4. Aspetta 2 secondi, poi chiudi la scheda.
5. In GHL apri quel contatto: i 5 campi immobile devono essere valorizzati e
   deve esserci il tag `calcolatore-compilato`.
6. Controlla che **non** sia partita nessuna email di report — non deve
   partire, perché non hai inviato il form.

Se il punto 5 risulta vuoto, controlla in quest'ordine: `cid` presente
nell'URL → `AUTOSAVE_WEBHOOK_URL` ancora col placeholder nel file →
workflow lasciato in Draft → il webhook non riesce a identificare il
contatto dal solo `contact_id` (vedi la nota al punto 1).

### Test B — il calcolo e il report (il punto 4)

1. Prezzo **100 €**, pulizie vuote, notti per soggiorno **3** (il default),
   regime **"Affitto una casa sola, senza partita IVA"**, obiettivo
   **"Guadagnare come oggi"**.
   **Atteso: prezzo consigliato 136 €/notte (+36%).** Dimmi il numero che vedi.
2. Compila anche la domanda 3 con: Città Roma, Zona Trastevere, Via
   "Via della Lungaretta 42", 2 camere, 4 posti letto.
3. Clicca "Ricevi il report personalizzato": il form deve aprirsi.
   Compilalo con un'email di prova e canale Email. Invia.
4. In GHL cerca il contatto e controlla **tutti** questi campi:

   | Campo | Atteso |
   |---|---|
   | Prezzo Attuale | 100 |
   | Prezzo Consigliato | 136 |
   | Aumento Pct | 36 |
   | Regime Calc | una casa (cedolare 21%) |
   | Obiettivo Calc | Guadagnare come oggi |
   | Netto Oggi | 75 |
   | Netto Nuovo | 82 |
   | Perdita Anno | 1983 |
   | Canale Report | email |
   | Citta Immobile | Roma |
   | Zona Immobile | Trastevere |
   | Via Immobile | Via della Lungaretta 42 |
   | Camere Letto | 2 |
   | Posti Letto | 4 |

Segnalami ogni campo vuoto o diverso dall'atteso: rileggo io il contatto via
API e confermo che tutti e 14 i campi siano arrivati corretti.

---

## Cose che potresti chiederti dopo

- **Perché "136 €" e non "120 €" come in una spec precedente?** Quel numero
  era prima di due correzioni fatte oggi: l'IVA 22% ora si applica alla
  commissione in ogni regime (non solo al forfettario), e le pulizie ora
  entrano nel calcolo di commissione e tasse (prima no, e la perdita mostrata
  era sottostimata). 136 € è il numero corretto, verificato contro la pagina
  live e la versione avanzata.
- **Che margine è l'8% tra "minimo" (126 €) e "consigliato" (136 €)?** Copre
  gli sconti settimanali/mensili che il calcolatore non modella: chi li
  applica, al prezzo minimo secco finirebbe sotto il pareggio su quelle
  prenotazioni.
