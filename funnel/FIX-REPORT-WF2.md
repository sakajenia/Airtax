# Fix report calcolatore — pacchetto completo

Sub-account **Propromanager** · `E1HO8PRyWf2yGaTFLuLC` · diagnosi 2026-08-05 via API.

---

## 1. Cosa ho verificato via API (nessuna azione richiesta)

| Verifica | Esito |
|---|---|
| Il calcolatore passa gli 8 valori al form | ✅ querystring completa da `window.__leadData` |
| I 9 custom field esistono con le key canoniche | ✅ |
| I valori arrivano davvero sul contatto | ✅ **5 lead su 5** con tutti e 9 i campi pieni, nessuno mancante |
| `canale_report` sempre valorizzato | ✅ 3 `email` + 2 `whatsapp`, mai vuoto |
| I merge tag si risolvono nei workflow | ✅ le email inviate mostrano i numeri reali |
| Link prenotazione call | ✅ HTTP 200 |
| Merge tag orfani nel nuovo HTML | ✅ zero: tutti e 9 mappati su campi esistenti |
| Origine del mittente "Affitti Brevi Roma" | ⚠️ **non** è il Business Name (è già `Propromanager`): è hardcoded nel *From Name* delle azioni Send Email → **Prompt 0** |
| Timezone del sub-account | ⚠️ `Europe/Amsterdam`, dovrebbe essere `Europe/Rome` (impatta gli orari del calendario) |

**Il dato è integro lungo tutta la catena. È rotto solo cosa spedisce il Workflow 2.**

---

## 2. I tre bug

**Bug 1 — ramo Email: manda un testo scarno.** Email realmente recapitata
(Mani Camerini, 04/08 08:46): *"…il tuo nuovo prezzo consigliato è: 314 €/notte
(+26%). Oggi ti restano ~188 €/notte…"*. È il testo breve inline scritto dal CLI.
Mancano `prezzo_attuale`, `regime_calc`, `obiettivo_calc`, la spiegazione e tutto il brand.

**Bug 2 — ramo WhatsApp: non manda nulla.** L'azione di invio non c'è.
Cristina Onorati l'ha scritto in chat: *"Dove trovo il report?"*,
*"Non c'è il report però ma solamente il calcolatore"*. Idem Liliana Galli.

**Bug 3 — il template email è il demo di GHL.** "Il tuo report SalvaGuadagno Host"
(`6a5c91c8eb3d45e6ff0fb5fb`) contiene ancora *"Welcome to email — Create
ready-to-send emails in minutes…"* in inglese, zero merge tag.

---

## 3. Perché non posso sistemarli io via API

L'API pubblica GHL (`services.leadconnectorhq.com`, v2021-07-28) **non espone**
workflow, form e contenuto dei template email — verificato: `POST /workflows/`
risponde `404 Cannot POST`. Non esiste nemmeno un endpoint di update del corpo
di un template, né di delete contatto tra i tool disponibili.

Quindi: la diagnosi e la verifica finale le faccio io via API; le tre modifiche
vanno fatte da Ask AI / a mano. Sotto trovi i prompt pronti.

---

# PROMPT 0 — Il marchio ProProManager davanti in tutte le comunicazioni

**Origine del problema, verificata via API:** il Business Name del sub-account è
già `Propromanager`, quindi "Affitti Brevi Roma" **non** arriva dalle impostazioni:
è scritto a mano nel campo *From Name* delle azioni Send Email dei workflow
(era così nel prompt con cui il CLI li ha creati). Va corretto lì.

**Stringa di marca da usare ovunque: `ProProManager`.**
Dove serve il contesto geografico, va dopo: `ProProManager — Affitti Brevi Roma`.
Mai "Affitti Brevi Roma" da solo come mittente o come firma.

```
Nel sub-account Propromanager devo uniformare il nome del marchio in tutte le
comunicazioni che arrivano al cliente. Il marchio è "ProProManager" e deve
venire SEMPRE per primo. "Affitti Brevi Roma" può restare solo come
descrizione dopo il marchio, mai da solo.

1. Settings → Business Profile: il Business Name è scritto "Propromanager".
   Correggilo in "ProProManager" (con le P e la M maiuscole).
   Non cambiare indirizzo, email o telefono.

2. Automation → Workflows. Apri UNO PER UNO questi tre workflow e, in OGNI
   azione "Send Email" che contengono, cambia il campo From Name / Sender Name
   da "Affitti Brevi Roma" a "ProProManager":
     - WF - Registrazione Calcolatore
     - WF - Report Calcolatore
     - WF - Call Prenotata
   Non toccare l'indirizzo email del mittente: resta quello predefinito.

3. Sempre in "WF - Registrazione Calcolatore", apri il corpo dell'email di
   benvenuto: in fondo c'è la firma "Gianluca. ProProManager Affitti Brevi".
   Sostituiscila con:
     Gianluca
     ProProManager — Affitti Brevi Roma

4. Calendars → apri il calendario "AIRTAX - Call Strategica Affitti Brevi" →
   Notifications. Nei testi di conferma e nei promemoria (email e SMS) sostituisci
   ogni "Affitti Brevi Roma" o "Il team di Affitti Brevi Roma" con
   "Il team di ProProManager". Lascia invariato il resto del testo e gli orari.

5. Fai Publish di tutti e tre i workflow e salva il calendario.

6. Riportami l'elenco di ogni punto in cui hai trovato e cambiato la scritta,
   e segnalami se in qualche azione il From Name era diverso da quello atteso.
```

> Nota: il nome del calendario ("AIRTAX - Call Strategica Affitti Brevi") lo vede
> il lead nella pagina di prenotazione. Se vuoi, rinominalo in
> **"ProProManager — Call Strategica Affitti Brevi"**: dimmelo e lo aggiungo al
> prompt, ma cambia lo slug pubblico solo se GHL te lo chiede esplicitamente —
> il link `/widget/bookings/call-strategica-affitti` è già usato nelle pagine e
> nelle email, quindi lo slug **non va toccato**.

---

# PROMPT 1 — Riempire il template e agganciarlo al workflow
### (sistema Bug 1 e Bug 3 in un colpo solo)

> ⚠️ Prima di lanciarlo: apri `funnel/report-email.html` e copia **tutto** il
> contenuto negli appunti. Ask AI non può leggere un file dal tuo computer:
> l'incollata dell'HTML la fai tu quando il prompt te lo chiede.

```
Vai su Marketing → Emails → Templates.

1. Apri il template chiamato "Il tuo report SalvaGuadagno Host".
   Contiene ancora il contenuto demo di GoHighLevel in inglese
   ("Welcome to email — Create ready-to-send emails in minutes...").
   Devo sostituirlo integralmente.

2. Cerca l'opzione per importare/incollare HTML grezzo
   (di solito: menu ⋮ → "Import HTML", oppure l'editor "Code"/"</>").
   Cancella tutto il contenuto esistente e fermati: ti incollo io l'HTML.
   Dimmi quando sei pronto a ricevere l'incollata.

3. Dopo che ho incollato l'HTML, salva il template.

4. Se il template esistente NON permette di reimportare HTML, allora:
   crea un NUOVO template di tipo "Import HTML" chiamato
   "Report Calcolatore Airbnb — PPM", incollaci dentro lo stesso HTML,
   salvalo, e poi RINOMINA il vecchio in
   "[NON USARE] demo GHL" così non lo usa più nessuno per sbaglio.

5. Poi vai su Automation → Workflows → apri "WF - Report Calcolatore" → Edit.
   Nel ramo dell'If/Else in cui la condizione è canale_report = "email",
   apri l'azione "Send Email".
   - Sostituisci il corpo attuale (è un testo breve scritto a mano)
     selezionando invece il template salvato al punto 3 o 4.
   - Imposta l'oggetto esattamente così:
     Il tuo report: {{contact.prezzo_consigliato}} €/notte è il tuo nuovo prezzo 🏠
   - From Name: ProProManager. Mittente: quello predefinito della location.

6. Salva e fai Publish del workflow.

7. Dimmi: nome esatto del template collegato, oggetto impostato,
   e conferma che il workflow risulta Published.
```

---

# PROMPT 2 — Aggiungere l'invio WhatsApp mancante
### (sistema Bug 2)

```
Vai su Automation → Workflows → apri "WF - Report Calcolatore" → Edit.

Guarda l'azione If/Else che verifica il custom field "Canale Report"
(contact.canale_report, opzioni: email | whatsapp).

PROBLEMA: il ramo "whatsapp" non contiene nessuna azione di invio, quindi
chi sceglie WhatsApp non riceve mai il report. Va aggiunta.

1. Nel ramo dove la condizione è canale_report = "whatsapp",
   aggiungi l'azione "Send WhatsApp" (canale Twilio già connesso).

2. Come corpo del messaggio incolla ESATTAMENTE questo testo:

Ciao {{contact.first_name}}! 👋 Ecco il tuo report SalvaGuadagno Host.

Con la nuova commissione Airbnb del 15,5% (dal 13/10/2026) il prezzo giusto per te e':

💶 *{{contact.prezzo_consigliato}} EUR/notte* (+{{contact.aumento_pct}}%)
Oggi il tuo prezzo e' {{contact.prezzo_attuale}} EUR/notte.

Cosi' in tasca ti resta come oggi:
• Oggi: {{contact.netto_oggi}} EUR/notte
• Col nuovo prezzo: {{contact.netto_nuovo}} EUR/notte

⚠️ Se non fai nulla rischi di perdere circa *{{contact.perdita_anno}} EUR all'anno*.

Calcolo fatto sul tuo caso: {{contact.regime_calc}}, obiettivo "{{contact.obiettivo_calc}}".

Perche' non basta alzare del 15,5%? Perche' in Italia le tasse si pagano sul prezzo intero e la commissione non si scarica: piu' prezzo = piu' tasse. Il conto giusto tiene dentro tutte e due le cose.

📞 Vuoi rivedere i numeri insieme? Prenota una call gratuita di 15 min:
👉 https://api.leadconnectorhq.com/widget/bookings/call-strategica-affitti

— *ProProManager* · Affitti Brevi Roma

Strumento indicativo, non e' consulenza fiscale. Rispondi STOP per non ricevere piu' messaggi.

3. Verifica che i merge tag siano riconosciuti dall'editor (devono apparire
   come token/pillole, non come testo grezzo). Se "canale_report" non compare
   tra i campi disponibili, dimmelo invece di inventare un campo simile.

4. Controlla anche che il ramo ELSE (nessuna condizione soddisfatta) non
   lasci il contatto senza nulla: se esiste un ramo di fallback, mettici
   la stessa azione Send Email del ramo "email".

5. Salva e fai Publish.

6. Dimmi quali azioni contiene ora ogni ramo, in ordine.
```

---

# PROMPT 3 — Test di verifica end-to-end

> Nel prompt sostituisci **`+39XXXXXXXXXX`** col tuo numero WhatsApp reale
> (serve per verificare il ramo WhatsApp).
> I valori del test sono scelti apposta e li ho verificati eseguendo il
> calcolatore: **100 €/notte, cedolare 21% su una casa, obiettivo "guadagnare
> come oggi" → 120 €/notte (+20%)**. Set atteso completo:
>
> | Campo | Valore atteso |
> |---|---|
> | Prezzo Attuale | 100 |
> | Prezzo Consigliato | **120** |
> | Aumento Pct | **20** |
> | Regime Calc | una casa (cedolare 21%) |
> | Obiettivo Calc | Guadagnare come oggi |
> | Netto Oggi | 76 |
> | Netto Nuovo | 76 |
> | Perdita Anno | 1625 |
> | Canale Report | email / whatsapp |
>
> Se esce un numero diverso, il problema è nel calcolatore, non nel workflow.

```
Devo fare un test end-to-end del funnel calcolatore. Fai esattamente questo,
in ordine, e riportami ogni risultato.

TEST A — canale Email
1. Apri in una scheda nuova:
   https://tools.affittibreviaroma.com/calcola-il-tuo-prezzo-dopo-le-nuove-commissioni-airbnb
2. Compila il form di registrazione con:
   Nome: Test        Cognome: ReportQA
   Email: blionbg+qa1@gmail.com
   Telefono: +39XXXXXXXXXX
   Spunta il consenso privacy. Invia.
3. Verifica che ti porti al calcolatore.
4. Nel calcolatore imposta: prezzo attuale 100 €/notte,
   regime "cedolare secca 21% (una casa)", obiettivo "guadagnare come oggi".
5. CONTROLLO: il prezzo consigliato deve essere 120 €/notte (+20%).
   Dimmi il numero che vedi.
6. Clicca "Ricevi il report personalizzato".
   Nel form scegli canale = Email, conferma il consenso, invia.
7. Verifica che porti alla pagina Grazie e che NON ci sia più
   il cerchio verde con l'emoji in cima.

TEST B — canale WhatsApp
8. Rifai i punti 1-6 ma con Email: blionbg+qa2@gmail.com
   e al punto 6 scegli canale = WhatsApp.

CONTROLLI IN GHL
9. Contacts: cerca "ReportQA". Devono esserci 2 contatti.
   Per ciascuno apri la scheda e verifica questi 9 campi. Valori attesi:
     Prezzo Attuale = 100
     Prezzo Consigliato = 120
     Aumento Pct = 20
     Regime Calc = una casa (cedolare 21%)
     Obiettivo Calc = Guadagnare come oggi
     Netto Oggi = 76
     Netto Nuovo = 76
     Perdita Anno = 1625
     Canale Report = email (primo contatto) / whatsapp (secondo)
   Segnalami QUALSIASI campo vuoto o diverso dall'atteso.
10. Opportunities → pipeline "Funnel Calcolatore": entrambi devono essere
    nello stage "🟢 Report inviato".
11. Apri la conversazione di ciascun contatto e dimmi cosa è stato inviato:
    - il primo deve avere una EMAIL con il report completo
      (deve contenere sia 100 che 120, la tabella "Quanto ti resta in tasca",
      la sezione "Perché proprio questo prezzo?" e il logo ProProManager)
    - il secondo deve avere un messaggio WHATSAPP col report
12. Controlla la casella blionbg+qa1@gmail.com (anche in Spam/Promozioni)
    e dimmi se l'email è arrivata e se è quella grafica completa
    o un testo scarno.
13. CONTROLLO MARCHIO: nell'email ricevuta il mittente deve risultare
    "ProProManager", NON "Affitti Brevi Roma". Dimmi il nome mittente esatto
    che vedi. Stesso controllo sulla firma in fondo al messaggio WhatsApp:
    deve esserci "ProProManager · Affitti Brevi Roma".

NON cancellare niente: la pulizia la facciamo dopo, in un passaggio separato.
Riportami un elenco puntato con l'esito di ogni punto.
```

---

# PROMPT 4 — Pulizia dei contatti di test
### ⚠️ da lanciare SOLO dopo che il Prompt 3 è andato tutto a buon fine

```
Pulizia post-test nel sub-account Propromanager.

1. Vai su Opportunities → pipeline "Funnel Calcolatore".
   Elimina le opportunity intestate a "Test ReportQA" (ce ne sono 2).

2. Vai su Contacts. Cerca "ReportQA" ed elimina entrambi i contatti
   (blionbg+qa1@gmail.com e blionbg+qa2@gmail.com).

3. Cerca anche il vecchio contatto di collaudo "Test Calcolatore QA"
   (email qa-test+calcolatore@example.com, tag "qa-test") ed eliminalo:
   è un residuo di una prova precedente.

4. Verifica che cercando "ReportQA" e "qa-test" non risulti più nulla,
   e confermami che i contatti reali (Cristina Onorati, Mani Camerini,
   Alberto Pieri, Liliana Galli, Filippo Fini) sono ancora tutti presenti.

Non toccare nient'altro.
```

---

## 4. Da decidere: i due lead che non hanno mai ricevuto il report

**Cristina Onorati** e **Liliana Galli** hanno il tag `report-richiesto`, tutti
i dati calcolati sul contatto, e non hanno mai visto il report (avevano scelto
WhatsApp). Cristina ha già una conversazione umana aperta con te sull'argomento.

Posso mandare io il report via API su WhatsApp a entrambe, ma sono messaggi a
persone reali dentro conversazioni già avviate: **dimmi tu se procedere**, oppure
scrivilo a mano dalla conversazione. Non lo faccio di iniziativa.

## 5. Nota minore

Il footer di disiscrizione che GHL aggiunge in automatico è in inglese
(*"If you no longer wish to receive these emails you may unsubscribe"*).
Si cambia in **Settings → Business Profile**, sezione compliance/footer email.

---

## 6. Cosa verifico io dopo il tuo test

Appena il Prompt 3 è girato, dimmelo: rileggo via API i due contatti ReportQA,
controllo che i 9 campi siano quelli attesi (100 → 120, +20%) e che nelle
conversazioni risultino davvero un'email e un messaggio WhatsApp in uscita.
Poi lanci il Prompt 4.
