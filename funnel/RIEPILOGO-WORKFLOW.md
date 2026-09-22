# Riepilogo workflow — funnel Calcolatore

Sub-account **Propromanager** · `E1HO8PRyWf2yGaTFLuLC`
Letto via API GHL il **20/09/2026**. Nessuna modifica fatta: è tutta lettura.

> **Come l'ho ricostruito.** L'API GHL espone i workflow in sola lettura e solo
> come *elenco* (nome, stato, versione): **non restituisce i passi né i testi**.
> Quindi non ho dedotto il comportamento dalla configurazione — l'ho ricostruito
> dai **messaggi realmente partiti**, letti uno per uno dalle conversazioni.
> È più affidabile: dice cosa il lead ha ricevuto davvero, non cosa dovrebbe ricevere.

---

## 0. Il numero che conta

| Passaggio | Contatti | Come l'ho contato |
|---|---:|---|
| Si registra (tag `calcolatore-registrato`) | **31** | ricerca per tag |
| Usa il calcolatore (tag `calcolatore-compilato`) | **1** | solo il contatto di test: l'autosave è in produzione dal 19/09 |
| Chiede il report (tag `report-richiesto`) | **7** | di cui **6 ad agosto** e 1 il 15/09 |
| Prenota la call (tag `call-prenotata`) | **0** | ricerca per tag: nessun risultato |
| Opportunity oltre lo stage 🟢 Report inviato | **0** | pipeline `Funnel Calcolatore` |

**Zero call prenotate da quando il funnel esiste.** Non è un problema di calendario:
ho interrogato gli slot liberi di *ProProManager - Call Strategica Affitti Brevi*
e il 21, 22 e 23 settembre ci sono 7 slot al giorno. Il calendario funziona.
Il problema è che la pagina che porta alla call — il report — da sei settimane
non parte più.

---

## 1. Inventario: 33 workflow, 15 pubblicati

### Quelli del funnel calcolatore (creati a luglio/agosto)

| Workflow | ID | Stato | Ultima modifica |
|---|---|---|---|
| WF - Registrazione Calcolatore | `e59858e4-…60dc` | published v12 | 05/08 16:37 |
| WF - Report Calcolatore | `48b20908-…93bc` | published v11 | **07/08 09:50** |
| WF - Call Prenotata | `ed194d74-…4e78` | published v6 | 05/08 16:20 |
| AA - 01 Call prenotata | `a8a169d2-…7d01` | published v9 | 03/08 09:21 |
| AA - 02 Promemoria call | `2c188840-…4b5d` | published v3 | 02/08 19:38 |
| AA - 03 No show | `bcde553d-…7c50` | published v7 | 03/08 14:04 |

I tre `AA - *` sono le automazioni della call. **Non sono mai scattate per un lead
del calcolatore**, perché nessun lead del calcolatore ha mai prenotato.

### Quelli di altri funnel che toccano gli stessi lead

| Workflow | Stato | Cosa fa (verificato dai messaggi) |
|---|---|---|
| 01. Nuovo Lead - RENDITA - In Attesa di Contatto | published, agg. 08/09 | manda email + WhatsApp "la chiameremo a breve" — **10 invii a settembre** |
| Nuovo Lead ANALISI ANNUNCIO AIRBNB | published | funnel analisi annuncio |
| LEAD EVENT API META - LP SERVIZI | published | evento conversione Meta |
| 11/12/14/15/16/17 (onboarding, KO, contratto…) | published | post-vendita, non toccano il calcolatore |
| altri 18 | **draft** | eredità del setup Cosmica, non girano |

---

## 2. Cosa succede davvero, secondo per secondo

### A) Si registra → due messaggi in quattro secondi, poi il nulla

Caso reale: **Gianluca Tonelli, 16/09/2026 ore 23:48** (ultimo lead vero).

| Ora | Δ | Cosa parte | Canale |
|---|---|---|---|
| 21:48:05 | — | invia il form `Registrazioni Calcolatore tasse AIrbnb` | |
| 21:48:07 | **+2s** | Email *"Il tuo calcolatore è pronto 👉 scopri il prezzo giusto"* | email |
| 21:48:09 | **+4s** | WhatsApp *"Ciao! Ho visto che hai messo mano al calcolatore…"* | WhatsApp |
| — | — | *(poi più niente, per sempre)* | |

Stesso identico schema il 19/09, il 25/08, il 23/08, il 21/08.
**Nessun lead registrato ha mai ricevuto un secondo contatto dopo i primi 4 secondi.**

Se WhatsApp fallisce (numero non WhatsApp), il contatto prende il tag `no-whatsapp`
e parte una terza email di ripiego — verificata il 25/08 alle 08:57.

### B) Chiede il report → parte solo la notifica interna. Al lead non arriva niente.

Caso reale: **Laura Pigliapoco, 15/09/2026 ore 11:43**, canale scelto = **email**,
9 campi calcolati tutti pieni sul contatto (113 €/notte consigliati, +68%…).

| Ora | Cosa parte | A chi |
|---|---|---|
| 09:43 | Email *"Nuovo report richiesto - Laura Pigliapoco"* da `reply@ec1.msgsndr.org` | **al team** |
| — | *(niente)* | **a Laura** |

Ho esportato tutti i messaggi del suo contatto, su tutti i canali: **totale 0**.
Il workflow è partito (la notifica interna lo dimostra), ma il ramo che manda il
report al lead non ha inviato nulla.

Ultima email di report davvero recapitata a un lead: **Mani Camerini, 04/08**.
Da allora, **sei settimane, zero report**.

### C) Prenota la call → mai successo in produzione

`WF - Call Prenotata` e i tre `AA - *` non sono mai stati esercitati da un lead
del calcolatore. Non posso dire se funzionano: posso solo dire che non hanno
mai girato.

---

## 3. I testi, parola per parola

### M1 — Email di benvenuto (ATTIVA, doveva essere eliminata)
**Da:** `ProProManager <blionbg+gmail.com@ec1.msgsndr.org>`
**Oggetto:** `Il tuo calcolatore è pronto 👉 scopri il prezzo giusto`

```
Ciao {{contact.first_name}},

grazie per esserti registrato/a. Il tuo Calcolatore Tasse Airbnb è pronto:
in meno di 2 minuti scopri il prezzo giusto per non lasciare soldi sul tavolo
con le nuove commissioni.

Clicca qui sotto e inserisci i dati del tuo annuncio 👇

Se hai domande, rispondi pure a questa email: ti leggiamo noi.

A presto,

Gianluca.
ProProManager — Affitti Brevi Roma

[Apri il calcolator]   ← il link, con il refuso: manca la "e" finale

If you no longer wish to receive these emails you may unsubscribe
```

Tre cose sbagliate in una mail sola: il **refuso nel bottone** (l'unica cosa
cliccabile della pagina), il **punto dopo "Gianluca."**, e il **footer in inglese**.

### M2 — WhatsApp a +4 secondi (ATTIVA, credevi fosse già sistemata)
```
Ciao! Ho visto che hai messo mano al calcolatore per le nuove commissioni airbnb.

Com'è? Lo hai trovato utile?
```
Recapitato il 16/09 e il 19/09. **Dice il falso**: il lead si è appena registrato,
il calcolatore non l'ha ancora aperto. E arriva quattro secondi dopo, quindi il
"ho visto che" è smentito dall'orologio.

### M3 — Email di ripiego per chi non ha WhatsApp (ATTIVA)
**Da:** `reply@send.lcmsgsndr.net` · **Oggetto:** `Il tuo calcolo sulle nuove commissioni Airbnb 📊`
Stessa bugia di M2, in forma di email. Ultimo invio verificato: 25/08 08:57.

### M4 — Il report al lead (NON PARTE PIÙ)
Il template esiste ed è quello giusto: **"Il tuo report SalvaGuadagno Host"**
(`6a5c91c8eb3d45e6ff0fb5fb`, aggiornato il 05/08). L'ho scaricato e letto:
è l'HTML completo con prezzo consigliato, tabella "Quanto ti resta in tasca",
sezione "Perché proprio questo prezzo?", perdita annua e bottone call.
Il contenuto demo inglese di GHL non c'è più.

**Ma il workflow non lo manda.** Il template è a posto, il collegamento no.

> **Correzione (20/09, dopo verifica).** In una prima lettura avevo segnalato che
> nel template restava il fallback `{{contact.first_name | Host}}`. **È falso: nel
> template non c'è.** Avevo letto il `previewUrl` restituito dall'API, che è
> un'istantanea su Firebase rigenerata con comodo, non il contenuto vivo: quella
> che ho scaricato alle 10:47 era di agosto. Rileggendola alle 11:06, dopo che il
> file era stato rigenerato, il fallback non c'è più. **Vedi §8 su come non
> ricascarci.**

### M5 — Il report via WhatsApp (NON ESISTE)
Il ramo `canale_report = whatsapp` non ha mai avuto l'azione di invio.
Il testo pronto è in `funnel/report-whatsapp.txt`, mai incollato.
Due lead reali (Cristina Onorati, Liliana Galli) hanno scelto WhatsApp ad agosto
e non hanno mai ricevuto niente.

### M6 — "La chiameremo a breve" (ATTIVA, da un altro funnel)
**Da:** `Propromanager <info+propromanger.com@ec1.msgsndr.org>`
**Oggetto:** `Grazie per il suo interesse, la contatteremo a breve!`
Anche su WhatsApp:
```
Informazioni sulla sua richiesta.
Salve , sono Gianluca di Propromanager.

Grazie per la sua richiesta: la chiameremo a breve per approfondire la sua
situazione e quella dell'immobile.

Se preferisce un orario specifico, risponda pure a questo messaggio!
```
Dieci invii a settembre. Dà del **lei** mentre tutto il funnel calcolatore dà del tu.
E c'è uno spazio di troppo dopo "Salve".

---

## 4. I problemi, in ordine di quanto costano

| # | Problema | Evidenza | Gravità |
|---|---|---|---|
| 1 | **Il report non parte più.** Chi lo chiede non riceve nulla. | Laura Pigliapoco 15/09: 0 messaggi su tutti i canali | 🔴 |
| 2 | **M2 WhatsApp è ancora viva e dice il falso.** | recapitata 16/09 e 19/09 | 🔴 |
| 3 | **M1 email di benvenuto è ancora viva**, col refuso "Apri il calcolator". | 5 invii verificati tra 21/08 e 19/09 | 🔴 |
| 4 | **Dominio mittente non autenticato.** Le mail partono da `blionbg+gmail.com@ec1.msgsndr.org`: GHL riscrive l'indirizzo perché nessun dominio è verificato. | tutte le email lette | 🔴 |
| 5 | **Nessun follow-up.** E2/E3/E4/E6/E7 del piano email non sono mai stati costruiti. Dopo 4 secondi il lead non sente più nessuno. | nessun messaggio ritardato in 31 contatti | 🟠 |
| 6 | **Opportunity doppie.** 6 lead su 7 che hanno chiesto il report hanno **due** opportunity: una in 🔵 Registrato e una in 🟢 Report inviato. Il workflow ne crea una nuova invece di spostare quella esistente. | Cristina, Mani, Alberto, Liliana, Filippo, Nicoletta | 🟠 |
| 7 | **Refuso nel dominio dell'altro funnel:** `info@propromanger.com` — manca la "a" di *manager*. | 10 email a settembre | 🟠 |
| 8 | **Footer di disiscrizione in inglese** in fondo a email italiane. | tutte | 🟠 |
| 9 | **Ramo WhatsApp del report ancora vuoto.** | nessun invio, mai | 🟡 |
| 10 | **Nessun workflow reagisce a `calcolatore-compilato`.** L'autosave dal 19/09 scrive i dati sul contatto e poi non li usa nessuno. | tag presente, zero automazioni | 🟡 |
| 11 | **Timezone del sub-account `Europe/Amsterdam`** invece di `Europe/Rome`. | diagnosi 05/08, non corretta | 🟡 |

---

## 5. Piano email: cosa era stato deciso, cosa è stato fatto

`funnel/PIANO-EMAIL.md` era stato approvato il 05/08. Stato al 20/09:

| Decisione | Fatto? |
|---|---|
| Eliminare M1 (email di benvenuto) | ❌ è ancora viva |
| Spegnere M3 (email di ripiego) | ❌ è ancora viva |
| Sistemare M2 (WhatsApp) | ❌ è ancora viva e identica |
| Sostituire M4 con l'HTML completo | 🟡 template a posto, **ma scollegato dal workflow** |
| Aggiungere l'invio WhatsApp del report | ❌ |
| Costruire E2 (+3h) | ❌ |
| Costruire E3 (+1g) | ❌ |
| Costruire E4 (+4g) | ❌ |
| Costruire E6 (+2g dal report) | ❌ |
| Costruire E7 (+5g dal report) | ❌ |
| Condizione di uscita su `report-richiesto` | ❌ (non serve finché non esistono E2/E3/E4) |
| Autenticare il dominio mittente | ❌ |
| Footer disiscrizione in italiano | ❌ |
| Timezone `Europe/Rome` | ❌ |
| Nome mittente "ProProManager" | ✅ fatto |
| Template report riempito con l'HTML vero | ✅ fatto |

Due cose su sedici. E la più importante delle due — il report — è a metà:
il template è giusto ma il workflow non lo usa.

---

## 6. Da dove ripartire, in ordine

Sono tutte cose da fare a mano o via Ask AI: **l'API GHL non permette di scrivere
nei workflow**. I prompt pronti per i punti 1 e 2 sono già in `funnel/FIX-REPORT-WF2.md`.

1. **Rimettere in piedi l'invio del report.** È l'unica cosa che porta alla call, ed
   è ferma da sei settimane. Aprire `WF - Report Calcolatore` → ramo
   `canale_report = email` → verificare che l'azione Send Email esista e punti al
   template *"Il tuo report SalvaGuadagno Host"*. Poi il ramo `whatsapp`, che è vuoto.

   > **Il testo nuovo è `funnel/report-email-v3.html`** (sostituisce `report-email.html`).
   > Racconta il conto su base annua: quanto paghi di tasse oggi, quanto con il
   > sostituto d'imposta, e un bottone verso la pagina che lo spiega.
   > Servono tre custom field, **già creati via API il 22/09**:
   > `contact.notti_anno`, `contact.tasse_anno_oggi`, `contact.tasse_anno_noi`.
   > Il calcolatore li calcola e il Worker li scrive, ma **il Worker online va
   > ricaricato** perché la versione in produzione non li conosce ancora.
   > I tre campi restano vuoti quando il conto annuo non regge (zero notti/anno,
   > regime azienda, quota negativa): nel workflow, prima del Send Email, mettere
   > una condizione **Tasse Anno Oggi "is not empty"**, altrimenti a quei lead
   > arriva un'email con tre frasi monche.
   >
   > Il 22/09 il valore predefinito delle notti/anno è passato da 130 a **200**
   > in tutte e sette le copie del calcolatore. Copre il caso "zero notti", che
   > però era già raro (il campo non era mai partito vuoto). **Non copre il caso
   > del regime azienda**, che non paga sul lordo e quindi lascia i campi vuoti
   > comunque: la condizione nel workflow serve lo stesso.
   > Effetto collaterale voluto: tutti i numeri su base annua, `perdita_anno`
   > compresa, salgono del 54% per chi non tocca il campo.
2. **Spegnere M1, M2, M3.** Tre messaggi in quattro secondi, due dei quali dicono
   una cosa falsa, sono il modo più veloce per bruciare i 31 contatti che abbiamo.
3. **Autenticare il dominio mittente.** Finché le mail partono da `ec1.msgsndr.org`
   ogni miglioramento del testo conta poco: molte non vengono nemmeno viste.
4. **Costruire E2/E3/E4.** Due terzi dei registrati spariscono senza sentire più
   nessuno. I testi sono già scritti e approvati in `funnel/PIANO-EMAIL.md`.
5. Il resto (opportunity doppie, footer, timezone, fallback "Host") quando il
   sangue ha smesso di uscire.

---

## 7. Cosa NON ho potuto verificare

- **I passi interni dei workflow.** L'API non li espone. So cosa esce, non come
  è configurato. La differenza conta per il punto 1: so che il report non parte,
  non so *perché* — se manca l'azione, se la condizione dell'If/Else non fa match,
  o se l'azione c'è ma punta al vuoto. Serve aprire il workflow.
- **I testi delle notifiche del calendario** (conferma, promemoria, no-show):
  nessun appuntamento è mai stato preso dal funnel, quindi non c'è un messaggio
  reale da leggere.
- **Il contenuto dei tre `AA - *`.** Stesso motivo.

---

## 8. Come leggere davvero l'aggiornato via API

Imparato sbagliando, il 20/09. Due fonti dell'API GHL **non** sono affidabili
come fotografia dell'oggi, e una lo è.

| Fonte | Aggiornata? | Perché |
|---|---|---|
| `previewUrl` dei template email | ❌ **no** | è un file su Firebase Storage rigenerato **con comodo** (a quanto pare quando il template viene aperto nell'interfaccia). L'`Last-Modified` dell'oggetto dice quando è stato rigenerato, **non** quando il template è stato modificato. Il 20/09 alle 10:47 ho scaricato una copia di agosto; alle 11:06 lo stesso URL restituiva la versione attuale, 739 byte più grande. |
| `updatedAt` dei template | ⚠️ **sospetto** | diceva 05/08 su un template che nel frattempo era stato toccato |
| messaggi realmente inviati (`export-messages-by-location`, `search-conversation`) | ✅ **sì** | sono i fatti: cosa è uscito, quando, a chi, con che corpo |

**Regola operativa:** per sapere *cosa riceve il lead* non si guarda mai la
configurazione, si guardano i messaggi partiti — e si incrocia con un secondo
endpoint. Esempio: Laura Pigliapoco (15/09) risulta senza email sia da
`export-messages-by-location` (totale 0 su tutti i canali) sia da
`search-conversation` (una sola conversazione, `messageTypes: [100]`, cioè solo
un evento di attività, nessun messaggio). Due endpoint indipendenti, stessa
risposta: il report non le è arrivato.

Prima di controllare un `previewUrl`, **scaricarlo con cache-buster e leggere gli
header**:

```
curl -sS -D - -o tpl.html "<previewUrl>&cb=$(date +%s)" | grep -i 'last-modified\|x-goog-generation'
```

Se `Last-Modified` è vecchio, il file è vecchio: apri il template
nell'interfaccia GHL una volta, poi riscarica.
