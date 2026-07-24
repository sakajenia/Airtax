# Guida: Calendario in italiano + 3 Workflow (Funnel Calcolatore)

Sub-account **Propromanager** · Location `E1HO8PRyWf2yGaTFLuLC`
Pipeline lead: **Funnel Calcolatore** (stage: 🔵 Registrato → 🟢 Report inviato → 🟠 In contatto → 🟡 Call fissata → ✅ Cliente → 🌑 KO)
Calendario call: **GIANLUCA BIONDI** (`lp9ZRQNmHMdZ4L8Pgnd3`)
Link prenotazione già inserito nel /grazie: `https://api.leadconnectorhq.com/widget/bookings/gianluca-biondi-personal-calendar-csgl-ewbf`

> ⚠️ Workflow, form, calendario NON sono creabili via API (limite GHL): sono da configurare a mano. Sotto trovi tutto passo-passo, coi testi italiani pronti da incollare.

---

# PARTE 1 — Calendario perfetto in italiano

**Calendars → apri "GIANLUCA BIONDI's Personal Calendar" → Edit.**
(Se preferisci non toccare il calendario personale, crea un nuovo calendario "Simple" chiamato `Call Strategica Affitti Brevi` e applica gli stessi passi: è più pulito perché dedicato.)

### 1.1 Meeting Details
- **Meeting name:** `Call Strategica Affitti Brevi — 15 min`
- **Description:** `In 15 minuti rivediamo insieme il tuo nuovo prezzo a notte, il regime fiscale e la strategia per non perdere guadagni con la nuova commissione Airbnb del 15,5%.`
- **Duration:** 15 (o 30) minuti
- **Meeting location:** Zoom / Google Meet / Telefono (scegli quello che usi)

### 1.2 Availability
- **Timezone:** `Europe/Rome` (importante per gli orari corretti)
- **Working hours:** imposta le fasce reali in cui fai le call
- **Minimum scheduling notice:** 1 giorno · **Buffer:** 10 min tra un appuntamento e l'altro · **Slot al giorno:** a piacere

### 1.3 Forms & Payment (il form di prenotazione)
- **Form:** Default (Name, Email, Phone) — abilita **Phone obbligatorio**
- Attiva **Consent checkbox** con testo:
  `Acconsento a essere contattato/a per la call e al trattamento dei miei dati secondo l'informativa privacy.`
- **Sticky contact:** ON (precompila chi è già nel CRM)

### 1.4 Confirmation (cosa vede dopo la prenotazione)
Scegli **"Display confirmation message"** e incolla:
> ✅ Perfetto, la tua call è prenotata! Ti abbiamo inviato l'invito via email. A presto — parleremo del tuo prezzo giusto e di come proteggere i tuoi guadagni. 👋
(In alternativa: **Redirect** a una tua pagina di ringraziamento.)

### 1.5 Notifications & Additional options (TUTTO in italiano)
Attiva e traduci questi messaggi:

**A) Conferma al contatto (Email)**
- Oggetto: `La tua call è confermata 📅 — {{appointment.start_time}}`
- Corpo:
  ```
  Ciao {{contact.first_name}},
  la tua call è confermata per {{appointment.start_time}}.
  Durata: 15 minuti. Ci sentiamo lì!
  Se hai un imprevisto puoi spostarla o annullarla dal link nell'invito.
  A presto,
  Il team di Affitti Brevi Roma
  ```

**B) Promemoria al contatto (Email e/o SMS)** — 24h prima e 1h prima:
- SMS: `Ciao {{contact.first_name}}, ti ricordiamo la call di oggi alle {{appointment.start_time}}. A tra poco! — Affitti Brevi Roma`

**C) Notifica interna al team** (a te): attiva "Notify assigned user" o inserisci l'email del team →
- `Nuova call prenotata da {{contact.first_name}} {{contact.last_name}} ({{contact.email}}, {{contact.phone}}) per {{appointment.start_time}}.`

### 1.6 Widget / Look & Feel
- **Language / Lingua del widget:** Italiano (se disponibile nel selettore lingua del widget)
- **Primary color:** `#FF385C` (corallo, coerente col calcolatore)
- Cover image / logo: opzionale

### 1.7 Policies (cancellazione/spostamento)
- Abilita **Allow rescheduling** e **Allow cancellation** (dà autonomia al lead, meno no-show)
- Testo policy: `Puoi spostare o annullare la call fino a 2 ore prima dell'orario prenotato.`

**Save.** Poi prova il link di prenotazione in incognito per vedere il risultato in italiano.

---

# PARTE 2 — I 3 Workflow

**Automation → Workflows → + Create Workflow → Start from scratch.**

## WORKFLOW A — «WF - Registrazione Calcolatore»
Scopo: chi si registra entra in pipeline e riceve il link al calcolatore.
1. **Trigger:** `Form Submitted` → Form is **Registrazioni Calcolatore tasse AIrbnb**.
2. **Add Contact Tag:** `calcolatore-registrato`.
3. **Create/Update Opportunity:**
   - Pipeline: **Funnel Calcolatore** · Stage: **🔵 Registrato**
   - Opportunity name: `Calcolatore — {{contact.first_name}} {{contact.last_name}}`
   - Status: Open
4. **Send Email** (benvenuto):
   - From: `[mittente verificato]` (es. noreply@affittibreviaroma.com)
   - Oggetto: `Il tuo calcolatore è pronto 👉 scopri il prezzo giusto`
   - Corpo: saluto + bottone/link a `https://tools.affittibreviaroma.com/calcolatore`
5. **Save** → **Publish** (toggle in alto a destra).

## WORKFLOW B — «WF - Report Calcolatore»
Scopo: chi chiede il report riceve Email o WhatsApp e avanza in pipeline.
1. **Trigger:** `Form Submitted` → Form is **Invio Report Calcolatore tasse AIrbnb** (il form report).
2. **Add Contact Tag:** `report-richiesto`.
3. **Create/Update Opportunity:** Pipeline **Funnel Calcolatore** → Stage **🟢 Report inviato**.
   (Se l'opportunity esiste già dalla registrazione, la sposta a questo stage.)
4. **If/Else** — condizione su **Custom Field `Canale Report`**:
   - **Ramo "Email"** (Canale Report is `email`):
     - **Send Email** → template **Report Calcolatore Airbnb** (vedi Parte 3).
   - **Ramo "WhatsApp"** (Else, Canale Report is `whatsapp`):
     - **Send WhatsApp** (canale Twilio) → incolla il testo di `report-whatsapp.txt`.
5. **Internal Notification** (comune, dopo l'If/Else): a `[email team]` →
   `Nuovo report richiesto da {{contact.first_name}} {{contact.last_name}} — canale {{contact.canale_report}} — prezzo consigliato {{contact.prezzo_consigliato}}€ (+{{contact.aumento_pct}}%). Tel {{contact.phone}}.`
6. **Save** → **Publish.**

## WORKFLOW C — «WF - Call Prenotata» (NUOVO)
Scopo: chi prenota la call avanza in pipeline a "Call fissata".
1. **Trigger:** `Customer Booked Appointment` (o `Appointment Status`) → Calendar is **GIANLUCA BIONDI's Personal Calendar** (o il calendario dedicato se ne crei uno).
   - (Se usi "Appointment Status", imposta Status = `Confirmed`/`Booked`.)
2. **Add Contact Tag:** `call-prenotata`.
3. **Create/Update Opportunity:** Pipeline **Funnel Calcolatore** → Stage **🟡 Call fissata**.
4. (Opzionale) **Internal Notification** al team: `{{contact.first_name}} ha prenotato una call per {{appointment.start_time}}.`
5. **Save** → **Publish.**

> Bonus consigliati (facoltativi): Workflow "No-show" (se l'appuntamento va in stato No-Show → sposta a 🟠 In contatto per follow-up) e Workflow "Nurture" per chi si registra ma non chiede il report entro 24h.

---

# PARTE 3 — Template email report (serve al Workflow B)

**Marketing → Emails → Templates → + New → Import HTML/Code** → nome esatto: `Report Calcolatore Airbnb`.
Incolla il contenuto di `funnel/report-email.html`. Usa i merge tag (già nel file):
`{{contact.first_name | Host}}`, `{{contact.prezzo_attuale}}`, `{{contact.prezzo_consigliato}}`,
`{{contact.aumento_pct}}`, `{{contact.regime_calc}}`, `{{contact.obiettivo_calc}}`,
`{{contact.netto_oggi}}`, `{{contact.netto_nuovo}}`, `{{contact.perdita_anno}}`.

---

# Dati che mi servi passarmi per finire
1. **Mittente email verificato** (nome + indirizzo) per i Workflow A e B.
2. **Email interna del team** per le notifiche.
3. Conferma che **WhatsApp/Twilio** mostra l'azione "Send WhatsApp" nel workflow (canale connesso).
