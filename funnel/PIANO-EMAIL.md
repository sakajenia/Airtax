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
| **M1** | Email *"Il tuo calcolatore è pronto 👉 scopri il prezzo giusto"* | WF - Registrazione Calcolatore | subito (+3s) | chi si registra | **da riscrivere** — va bene l'idea, manca il perché |
| **M2** | WhatsApp *"Ciao! Ho visto che hai messo mano al calcolatore…"* | altro workflow (non è tra i 3 che avevo specificato) | +5s | chi si registra | **da eliminare o riscrivere**: afferma il falso |
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
   │
   ├─ E1  subito ............ Benvenuto + link al calcolatore
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

**Regola di uscita (importante):** appena un contatto prende il tag
`report-richiesto`, E2/E3/E4 non devono più partire. Senza questa condizione
gli scriviamo "non hai ancora fatto il calcolo" a chi l'ha già fatto — lo stesso
errore di adesso, al contrario.

**Tono:** do del tu, firmo come persona (Gianluca), niente "Team", niente
maiuscole urlate, un solo invito all'azione per email, numeri veri.
I numeri che uso nelle email sono verificati contro il calcolatore stesso.

---

## PARTE 3 — Le email, testo completo

---

### E1 — Benvenuto
**Workflow:** WF - Registrazione Calcolatore · **Quando:** subito
**A chi:** chiunque si registra · **Sostituisce:** M1

**Oggetto:** `{{contact.first_name | Ciao}}, il tuo calcolatore è pronto`
**Preheader:** `Due minuti e sai a quanto alzare il prezzo dal 13 ottobre.`

```
Ciao {{contact.first_name | Host}},

dal 13 ottobre 2026 Airbnb ti trattiene il 15,5% al posto del 3%.
E in Italia le tasse le paghi lo stesso sul prezzo pieno, commissione inclusa.

Il punto è questo: alzare il prezzo del 15,5% non ti riporta al punto di prima.
Serve di più, e quanto di più dipende dal tuo regime fiscale.

Il calcolatore ti dà il numero esatto per il tuo caso. Ti serve un dato solo:
il prezzo a notte che fai oggi.

→ [Apri il calcolatore]

Se hai domande rispondi pure a questa email, la leggo io.

Gianluca
ProProManager — Affitti Brevi Roma
```

> **Perché così:** la vecchia diceva "il tuo calcolatore è pronto" senza dire
> perché dovrebbe importargliene. Qui do il motivo in tre righe e chiedo una
> cosa sola. "La leggo io" apre la porta alle risposte, che sono i lead migliori.

---

### E2 — Promemoria
**Workflow:** WF - Registrazione Calcolatore · **Quando:** 3 ore dopo la registrazione
**A chi:** chi NON ha il tag `report-richiesto` · **Sostituisce:** M3 (e M2 via email)

**Oggetto:** `Ti serve solo il prezzo a notte`
**Preheader:** `Il resto lo calcola lui. Due minuti.`

```
Ciao {{contact.first_name | Host}},

ti ho mandato il link al calcolatore stamattina ma non l'hai ancora aperto.
Nessun problema: ci vogliono davvero due minuti.

Ti serve un dato solo, il prezzo a notte che fai oggi. Il resto lo calcola lui,
sul tuo regime fiscale.

Quello che ottieni:
· il nuovo prezzo da mettere per non perderci
· quanto ti resta in tasca prima e dopo
· quanto rischi di lasciare sul piatto in un anno

→ [Fai il calcolo]

Gianluca
ProProManager — Affitti Brevi Roma
```

> **Perché così:** dice il vero ("non l'hai ancora aperto") invece del falso
> ("ho visto che l'hai usato"). Abbassa la barriera: un dato solo, due minuti.
> E arriva dopo tre ore, non dopo undici secondi.

---

### E3 — Perché +15,5% non basta
**Workflow:** WF - Registrazione Calcolatore · **Quando:** 1 giorno dopo
**A chi:** chi NON ha il tag `report-richiesto` · **Nuova**

**Oggetto:** `Perché alzare del 15,5% non basta`
**Preheader:** `Il conto che quasi nessuno si è fatto. Con numeri veri.`

```
Ciao {{contact.first_name | Host}},

quasi tutti gli host stanno facendo questo ragionamento:
"Airbnb mi prende il 15,5%, alzo del 15,5% e siamo pari".

Non torna. Ti faccio il conto con numeri veri.

Oggi fai 100 € a notte. Con la cedolare al 21% e la vecchia commissione del 3%,
in tasca ti restano 76 €.

Dal 13 ottobre la commissione diventa 15,5% e la paghi tu.
Se alzi a 115,50 €, in tasca ti restano 73 €.
Hai alzato il prezzo e guadagni meno di prima.

Il motivo: in Italia le tasse si calcolano sul prezzo pieno esposto,
commissione inclusa — e la commissione non si scarica.
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
Ciao {{contact.first_name | Host}},

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
Ciao {{contact.first_name | Host}},

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
Ciao {{contact.first_name | Host}},

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
| 🔴 1 | **Autenticare il dominio di invio.** Da `reply@send.lcmsgsndr.org` a `gianluca@affittibreviaroma.com`. In GHL: Settings → Email Services → Dedicated Domain (DKIM+SPF sul DNS) | Senza questo le email finiscono in spam o non vengono aperte. Vale più di tutti i testi messi insieme. Cristina infatti ha trovato la nostra email nello spam. |
| 🔴 2 | **Spegnere M3** (email di ripiego "Il tuo calcolo…") e correggere o spegnere **M2** (WhatsApp) | Dicono il falso a chi si è appena registrato |
| 🟠 3 | **Condizione di uscita su `report-richiesto`** per E2/E3/E4 | Altrimenti scriviamo "non hai fatto il calcolo" a chi l'ha fatto |
| 🟠 4 | **Footer disiscrizione in italiano** — Settings → Business Profile | Una riga in inglese in fondo a un'email italiana |
| 🟡 5 | **Timezone `Europe/Rome`** (ora è `Europe/Amsterdam`) | Le email "dopo 3 ore" e gli slot del calendario slittano di un'ora |
| 🟡 6 | **Tono di M6** (il "salve, sono Gianluca… le chiameremo") | Dà del lei mentre tutto il resto dà del tu |

---

## PARTE 5 — Cosa mi serve da te

1. **Ok sulle email**, anche una per una: puoi dirmi "E1 sì, E3 riscrivi il P.S., E4 no".
2. **Con quale indirizzo firmiamo?** Propongo `gianluca@affittibreviaroma.com`.
   Se preferisci un altro, dimmelo prima che imposti il dominio.
3. **M2 (WhatsApp dopo 5 secondi): lo spegniamo o lo riscrivo?** Il mio consiglio
   è riscriverlo e spostarlo a +30 minuti, perché su WhatsApp le risposte arrivano
   davvero — ma non può dire che ha usato il calcolatore se non l'ha usato.
4. **E4 e E7 sono le due più aggressive.** Se il tono non ti convince le ammorbidisco.

Appena approvi ti preparo i prompt per Ask AI con i testi definitivi, workflow per
workflow, più il test di verifica.
