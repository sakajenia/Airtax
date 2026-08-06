# Piano email — funnel Calcolatore ProProManager

Proposta da approvare. **Non ho cambiato niente in GHL**: qui sotto c'è cosa parte
oggi, cosa propongo di sostituire e il testo completo di ogni email nuova.
Dammi l'ok (anche parziale, email per email) e procedo.

Ricostruito il 2026-08-05 dai messaggi **realmente inviati** letti via API, non
dalle specifiche: è quello che i lead hanno ricevuto davvero.

---

## PARTE 1 — Cosa parte oggi

### Il caso Laura, cronometrato

| Ora | Δ | Cosa è partito |
|---|---|---|
| 09:56:15 | — | si registra dal form (arriva da un'ad Facebook) |
| 09:56:17 | +2s | opportunity creata → stage 🔵 Registrato |
| 09:56:18 | +3s | **EMAIL 1** "Il tuo calcolatore è pronto" |
| 09:56:20 | +5s | **WHATSAPP** "Ho visto che hai messo mano al calcolatore" → **fallito** (non è un numero WhatsApp) |
| 09:56:26 | +11s | **EMAIL 2** "Il tuo calcolo sulle nuove commissioni Airbnb 📊" ← lo screenshot |

**Tre messaggi in undici secondi.** E due su tre le dicono *"ho visto che hai
utilizzato il nostro calcolatore"* quando Laura si era appena registrata e il
calcolatore non l'aveva ancora aperto — verificato: i suoi 9 custom field sono
vuoti. Le stiamo scrivendo una cosa falsa, due volte, undici secondi dopo.

### Inventario dei messaggi automatici attivi

| # | Messaggio | Workflow | Quando | A chi | Giudizio |
|---|---|---|---|---|---|
| **M1** | Email *"Il tuo calcolatore è pronto 👉 scopri il prezzo giusto"* | WF - Registrazione Calcolatore | subito (+3s) | chi si registra | **da eliminare** (tua decisione): il form porta già sul calcolatore, l'email era una ripetizione |
| **M2** | WhatsApp *"Ciao! Ho visto che hai messo mano al calcolatore…"* | altro workflow (non è tra i 3 che avevo specificato) | +5s | chi si registra | ✅ **già sistemato da te** |
| **M3** | Email *"Il tuo calcolo sulle nuove commissioni Airbnb 📊"* | stesso workflow di M2, come ripiego quando WhatsApp fallisce (tag `no-whatsapp`) | +11s | chi non ha WhatsApp | **da eliminare**: afferma il falso, zero contenuto, chiede solo una consulenza |
| **M4** | Email *"Il tuo report SalvaGuadagno Host è pronto 🏠"* | WF - Report Calcolatore | subito dopo la richiesta report | chi chiede il report via email | **già sostituita** dall'HTML completo (`report-email.html`), in attesa che tu la carichi |
| **M5** | WhatsApp report | WF - Report Calcolatore | — | chi chiede il report via WhatsApp | **non parte proprio** (azione mancante) |
| **M6** | WhatsApp *"Salve, sono Gianluca di Propromanager. Grazie per la sua richiesta…"* | workflow preesistente | su richiesta contatto | lead generici | **da rivedere**: dà del "lei", tono diverso da tutto il resto |

Su M1 e M4 la responsabilità è mia: le ho specificate io nel prompt del CLI.
M2, M3 e M6 vengono da altri workflow che non ho scritto io — ma vanno sistemate
lo stesso, perché è tutto lo stesso lead che le riceve tutte insieme.

### Cinque problemi trasversali

1. **Il mittente è `reply@send.lcmsgsndr.org`.** È l'indirizzo tecnico di GHL. Un
   host che riceve una mail da un dominio che non conosce la cestina o non la
   vede proprio. Serve autenticare `affittibreviaroma.com` come dominio di invio.
   *È il problema più grave dei cinque: senza questo, ogni miglioramento del testo vale poco.*
2. **Diciamo il falso.** "Ho visto che hai utilizzato il calcolatore" a chi non
   l'ha usato. Oltre a essere sbagliato, è il modo più veloce per perdere fiducia.
3. **Nessuna dilazione.** Tre contatti in 11 secondi sembrano un bot impazzito.
4. **Niente valore, solo richieste.** M3 non dà un dato, un numero, un motivo:
   chiede solo "vuoi una consulenza gratuita?". Non c'è ragione di rispondere.
5. **Il footer di disiscrizione è in inglese** in fondo a email italiane.

### Numeri di conversione (utili per decidere)

Su ~16 registrati, **5 hanno chiesto il report**: circa il 31%.
Due terzi si registrano e spariscono. È lì che serve la sequenza, ed è esattamente
quello che M2/M3 stanno bruciando.

---

## PARTE 2 — Struttura proposta

Due percorsi, divisi da una sola domanda: **ha usato il calcolatore o no?**

```
SI REGISTRA
   │   (nessuna email subito: il form lo porta già sul calcolatore)
   │
   ├─ E2  dopo 3 ore ........ Promemoria          ─┐
   ├─ E3  dopo 1 giorno ..... "Perché +15,5% non   │ SOLO se NON ha
   │                            basta" (educativa) │ ancora chiesto
   ├─ E4  dopo 4 giorni ..... Ultima chiamata     ─┘ il report
   │
   └─ CHIEDE IL REPORT  → esce dalla sequenza sopra
          │
          ├─ E5  subito ........... IL REPORT (l'HTML già pronto)
          ├─ E6  dopo 2 giorni ..... "Hai già aggiornato i prezzi?"
          └─ E7  dopo 5 giorni ..... L'obiezione vera + call
```

> **E1 (benvenuto) eliminata su tua indicazione.** Di conseguenza l'azione
> Send Email dentro *WF - Registrazione Calcolatore* va **rimossa**, non
> riscritta: chi si registra viene già portato sul calcolatore dal form, quindi
> l'email di benvenuto era una ripetizione. Il primo contatto diventa E2 a +3 ore,
> e il suo testo funziona benissimo come prima email della sequenza.
> **Numerazione lasciata invariata** (E2…E7) per non perdere i riferimenti.

**Regola di uscita (importante):** appena un contatto prende il tag
`report-richiesto`, E2/E3/E4 non devono più partire. Senza questa condizione
gli scriviamo "non hai ancora fatto il calcolo" a chi l'ha già fatto — lo stesso
errore di adesso, al contrario.

**Tono:** do del tu, firmo come persona (Gianluca), niente "Team", niente
maiuscole urlate, un solo invito all'azione per email, numeri veri.
I numeri che uso nelle email sono verificati contro il calcolatore stesso.

**Nome del contatto:** uso `{{contact.first_name}}` **senza fallback**. Il vecchio
`| Host` è stato tolto da tutte le email, dal report e dal WhatsApp: non deve mai
comparire la parola "Host" al posto del nome. Il form ha il campo Nome
obbligatorio, quindi risulta sempre valorizzato.

---

## PARTE 3 — Le email, testo completo

---

### ~~E1 — Benvenuto~~ — ELIMINATA
Su tua indicazione non mandiamo nessuna email al momento della registrazione.
**Azione:** rimuovere del tutto l'azione *Send Email* da *WF - Registrazione
Calcolatore*. Il workflow continua a fare tag + opportunity, ma non scrive.

---

### E2 — Primo contatto
**Workflow:** WF - Registrazione Calcolatore · **Quando:** 3 ore dopo la registrazione
**A chi:** chi NON ha il tag `report-richiesto` · **Sostituisce:** M1 e M3

**Oggetto:** `Ti serve solo il prezzo a notte`
**Preheader:** `Il resto lo calcola lui. Due minuti.`

```
Ciao {{contact.first_name}},

hai fatto la registrazione per usare il calcolatore, ma non l'hai ancora usato.

Ci vogliono davvero due minuti e ti serve un dato solo: il prezzo a notte
che fai oggi. Il resto lo calcola lui, sul tuo regime fiscale.

Quello che ottieni:
· il nuovo prezzo da mettere per non perderci
· quanto ti resta in tasca prima e dopo
· quanto rischi di lasciare sul piatto in un anno

→ [Fai il calcolo]

Se ti serve una mano per capire, scrivilo qui rispondendo a questa email:
ti rispondo io.

Gianluca
ProProManager — Affitti Brevi Roma
```

> **Perché così:** dice il vero — si è registrato ma non ha usato il calcolatore —
> invece del falso "ho visto che l'hai usato". Niente riferimenti all'orario
> ("stamattina"), che sarebbero sbagliati per chi si registra la sera.
> Con E1 eliminata questa è la prima email che il lead riceve da noi, e regge
> bene il ruolo: spiega cosa ottiene e apre la porta a una risposta.

---

### E3 — Perché +15,5% non basta
**Workflow:** WF - Registrazione Calcolatore · **Quando:** 1 giorno dopo
**A chi:** chi NON ha il tag `report-richiesto` · **Nuova**

**Oggetto:** `Perché alzare del 15,5% non basta`
**Preheader:** `Il conto che quasi nessuno si è fatto. Con numeri veri.`

```
Ciao {{contact.first_name}},

quasi tutti gli host stanno facendo questo ragionamento:
"Airbnb mi prende il 15,5%, alzo del 15,5% e siamo pari".

Non torna. Ti faccio il conto con numeri veri.

Oggi fai 100 € a notte. Con la cedolare al 21% e la vecchia commissione del 3%,
in tasca ti restano 76 €.

Dal 13 ottobre la commissione diventa 15,5% e la paghi tu.
Se alzi a 115,50 €, in tasca ti restano 73 €.
Hai alzato il prezzo e guadagni meno di prima.

Il motivo: in Italia le tasse si calcolano sul prezzo pieno esposto,
commissione inclusa — e la commissione non si scarica, se non hai
un'azienda e una gestione fiscale.
Prezzo più alto significa anche più tasse.

Per restare davvero a 76 € netti servono 120 € a notte. Un +20%, non un +15,5%.

Questo vale per la cedolare al 21%. Con il forfettario, l'IRPEF o la seconda
casa il numero cambia parecchio. Il calcolatore lo fa sul tuo caso:

→ [Calcola il tuo numero]

Gianluca
ProProManager — Affitti Brevi Roma

P.S. Il 13 ottobre vale per chi non usa un channel manager. Chi lo usa è già
passato ad aprile.
```

> **Perché così:** è l'email che costruisce l'autorità. Regala il ragionamento
> completo senza chiedere niente in cambio, e il calcolatore diventa la
> conseguenza naturale invece che una richiesta.
> **I numeri sono verificati contro il calcolatore** (100 → 120, netto 76 → 76).

---

### E4 — Ultima chiamata
**Workflow:** WF - Registrazione Calcolatore · **Quando:** 4 giorni dopo
**A chi:** chi NON ha il tag `report-richiesto` · **Nuova**

**Oggetto:** `Il 13 ottobre non si sposta`
**Preheader:** `Ultimo promemoria, poi non ti scrivo più su questo.`

```
Ciao {{contact.first_name}},

questa è l'ultima volta che ti scrivo del calcolatore, promesso.

Il 13 ottobre la commissione unica del 15,5% entra in vigore e basta.
Chi arriva a quella data con i prezzi di oggi comincia a perdere margine
su ogni singola prenotazione, senza accorgersene subito.

Non serve che ti fidi di me: fai il conto e guarda il numero.

→ [Apri il calcolatore]

Se invece la cosa non ti interessa, ignora pure — non ti scrivo più su questo.

Gianluca
ProProManager — Affitti Brevi Roma
```

> **Perché così:** la scadenza è vera, non inventata. E dire "non ti scrivo più
> su questo" mantenendolo fa più bene alla lista di dieci solleciti.

---

### E5 — Il report
**Workflow:** WF - Report Calcolatore · **Quando:** subito dopo la richiesta
**A chi:** chi chiede il report scegliendo Email · **Sostituisce:** M4

**Oggetto:** `Il tuo report: {{contact.prezzo_consigliato}} €/notte è il tuo nuovo prezzo 🏠`

Testo e grafica già pronti in **`report-email.html`** (già approvato come layout).
Contiene: prezzo attuale → consigliato, quanto ti resta a notte prima/dopo,
il tuo regime e obiettivo, il perché, la perdita annua, la call.

---

### E6 — Hai già aggiornato i prezzi?
**Workflow:** WF - Report Calcolatore · **Quando:** 2 giorni dopo il report
**A chi:** chi ha ricevuto il report e NON ha prenotato la call · **Nuova**

**Oggetto:** `Hai già messo il nuovo prezzo?`
**Preheader:** `Se ti sei bloccato su qualcosa, dimmelo e ti aiuto.`

```
Ciao {{contact.first_name}},

due giorni fa ti ho mandato il tuo numero: {{contact.prezzo_consigliato}} €/notte.

Domanda secca: l'hai messo?

Se sì, ottimo — non devi fare altro, ci risentiamo se cambiano le regole.

Se no, di solito è per uno di questi tre motivi:
· hai paura che alzando il prezzo si fermino le prenotazioni
· non sei sicuro che il regime fiscale che hai scelto sia quello giusto
· hai più annunci e non sai da quale partire

Sono tutte e tre risolvibili in un quarto d'ora. Rispondi a questa email
dicendomi quale è il tuo caso, oppure prenditi uno slot qui:

→ [Prenota 15 minuti]

Gianluca
ProProManager — Affitti Brevi Roma
```

> **Perché così:** nomina gli ostacoli al posto suo. Chi si riconosce in uno dei
> tre risponde, e chi risponde è un lead caldo vero.

---

### E7 — L'obiezione vera
**Workflow:** WF - Report Calcolatore · **Quando:** 5 giorni dopo il report
**A chi:** chi non ha prenotato la call · **Nuova**

**Oggetto:** `«E se alzo il prezzo e non prenota più nessuno?»`
**Preheader:** `È la domanda che mi fanno tutti. Rispondo qui.`

```
Ciao {{contact.first_name}},

è la cosa che mi sento dire più spesso, e ha senso: alzare il prezzo fa paura.

Tre cose da tenere presenti.

La prima: non lo stai alzando solo tu. Il 13 ottobre la commissione cambia per
tutti gli host italiani senza channel manager. Chi non si adegua non è più
economico — è solo uno che guadagna meno.

La seconda: l'ospite oggi vede già un prezzo maggiorato dalle commissioni.
Col nuovo modello la commissione all'ospite sparisce: il prezzo che imposti è
quello che vede. Su molti annunci il totale che l'ospite paga si muove pochissimo.

La terza, la più scomoda: se non alzi non è che tieni le prenotazioni di prima.
Le tieni lavorando uguale per meno soldi. Nel tuo caso circa
{{contact.perdita_anno}} € in un anno.

Se vuoi guardarlo insieme sui tuoi annunci veri, quindici minuti bastano:

→ [Prenota 15 minuti]

Gianluca
ProProManager — Affitti Brevi Roma
```

> **Perché così:** questa è l'obiezione che blocca la conversione. Affrontarla
> di petto, con un dato personalizzato in fondo, converte molto più di un
> generico "vuoi una consulenza?".

---

## PARTE 4 — Da sistemare oltre ai testi

| Priorità | Cosa | Perché |
|---|---|---|
| 🔴 1 | **Autenticare il dominio di invio.** Da `reply@send.lcmsgsndr.org` a **`info@propromanager.com`**. In GHL: Settings → Email Services → Dedicated Domain, autenticando **`propromanager.com`** (record DKIM + SPF sul DNS di quel dominio) | Senza questo le email finiscono in spam o non vengono aperte. Vale più di tutti i testi messi insieme. Cristina infatti ha trovato la nostra email nello spam. |
| 🔴 2 | **Spegnere M3** (email di ripiego "Il tuo calcolo…") e **rimuovere M1** (email di benvenuto) | M3 afferma il falso; M1 è la E1 che hai deciso di eliminare |
| 🟠 3 | **Condizione di uscita su `report-richiesto`** per E2/E3/E4 | Altrimenti scriviamo "non hai fatto il calcolo" a chi l'ha fatto |
| 🟠 4 | **Footer disiscrizione in italiano** — Settings → Business Profile | Una riga in inglese in fondo a un'email italiana |
| 🟡 5 | **Timezone `Europe/Rome`** (ora è `Europe/Amsterdam`) | Le email "dopo 3 ore" e gli slot del calendario slittano di un'ora |
| 🟡 6 | **Tono di M6** (il "salve, sono Gianluca… le chiameremo") | Dà del lei mentre tutto il resto dà del tu |

---

## PARTE 5 — Stato delle decisioni

| Punto | Stato |
|---|---|
| **E1 — benvenuto** | ❌ **eliminata** (tua decisione). L'azione Send Email esce da WF - Registrazione Calcolatore |
| **E2 — primo contatto** | ✏️ **riscritta** come da tue indicazioni: niente "stamattina", niente "Host", e aggiunto l'invito a scrivere se serve una mano |
| **E3 — perché +15,5% non basta** | ✏️ **corretta**: "la commissione non si scarica, se non hai un'azienda e una gestione fiscale" |
| **Fallback `\| Host`** | ❌ **rimosso ovunque** — email, report HTML e WhatsApp (11 occorrenze) |
| **Indirizzo mittente** | ✅ **`info@propromanager.com`** — va autenticato il dominio `propromanager.com` |
| **M2 — WhatsApp a +5s** | ✅ **già sistemato da te**, non ci metto mano |
| **E4, E6, E7** | ⏳ in attesa del tuo ok (E4 ed E7 sono le più dirette: se il tono non ti convince le ammorbidisco) |

> ⚠️ **Nota sul dominio.** `info@propromanager.com` è su un dominio diverso da
> quello dei link nelle email (`tools.affittibreviaroma.com`). Non è un problema
> di consegna — il marchio è ProProManager — ma va autenticato **propromanager.com**,
> non affittibreviaroma.com. Se hai il DNS di propromanager.com a portata di mano
> procediamo di lì.

Appena mi dai l'ok su E4/E6/E7 ti preparo i prompt per Ask AI con i testi
definitivi, workflow per workflow, più il test di verifica.
