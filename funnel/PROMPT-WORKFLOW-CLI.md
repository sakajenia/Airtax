# PROMPT per il CLI GHL — Crea 3 Workflow (Funnel Calcolatore) — COMPLETO, zero sostituzioni

Copia tutto il blocco sotto e dallo al tuo CLI GHL. Tutti i valori sono già compilati coi dati
reali del sub-account: **non devi sostituire niente**.

---

```
Sei connesso al sub-account GoHighLevel "Propromanager".
locationId = E1HO8PRyWf2yGaTFLuLC

Crea 3 workflow, usando ESATTAMENTE questi ID già esistenti (NON ricrearli):

PIPELINE "Funnel Calcolatore":
  pipelineId = V82v8bJ18wJqkFXSXk8K
  stage "🔵 Registrato"      = 83f80977-075d-4266-bbd9-27cac1224a25
  stage "🟢 Report inviato"  = 2f0066a4-06b4-4f05-955e-c79aea406b03
  stage "🟠 In contatto"     = 72d37582-59a1-4ff0-bd4c-280448dce245
  stage "🟡 Call fissata"    = e4cc602a-cc02-43ba-b830-8b2f69ff17f7
  stage "✅ Cliente"          = 6617222b-e8e8-49dc-a567-5c3cf64d680d
  stage "🌑 KO"              = 1b03add5-3f6c-495e-9776-4b28478359cb

FORM registrazione = oRexxrmMwWz2ablBAUoz  ("Registrazioni Calcolatore tasse AIrbnb")
FORM report        = Ompsev6jK1yZDrvBrKz8  ("Invio Report Calcolatore tasse AIrbnb")
CALENDARIO call    = TlY0OLMYg4To6FNk0AGg  ("AIRTAX - Call Strategica Affitti Brevi")
EMAIL TEMPLATE     = "Report Calcolatore Airbnb"  (id 6a5c91c8eb3d45e6ff0fb5fb)
CUSTOM FIELD condizione = contact.canale_report  (id cFOteyweDLD6j1u66xPW; opzioni: email | whatsapp)

IMPOSTAZIONI MITTENTE E NOTIFICHE (già definite):
  Mittente email: usa il SENDER PREDEFINITO del sub-account (default location sender);
                  From Name = "Affitti Brevi Roma". Non impostare un from-email custom.
  Notifiche interne: invia all'utente admin GIANLUCA BIONDI
                     (userId WUX8ztdcfKfCXePW9C5I, email blionbg+1@gmail.com).

=================================================================
WORKFLOW 1 — "WF - Registrazione Calcolatore"   (Publish: ON)
=================================================================
Trigger: Form Submitted  →  form = oRexxrmMwWz2ablBAUoz
Azioni (in ordine):
  1) Add Contact Tag: "calcolatore-registrato"
  2) Create/Update Opportunity:
       pipelineId = V82v8bJ18wJqkFXSXk8K
       stageId    = 83f80977-075d-4266-bbd9-27cac1224a25   (🔵 Registrato)
       name       = "Calcolatore — {{contact.first_name}} {{contact.last_name}}"
       status     = open
  3) Send Email (sender predefinito, From Name "Affitti Brevi Roma"):
       subject = "Il tuo calcolatore è pronto 👉 scopri il prezzo giusto"
       body (HTML): saluto a {{contact.first_name}} + bottone/link a
                    https://tools.affittibreviaroma.com/calcolatore

=================================================================
WORKFLOW 2 — "WF - Report Calcolatore"   (Publish: ON)
=================================================================
Trigger: Form Submitted  →  form = Ompsev6jK1yZDrvBrKz8
Azioni (in ordine):
  1) Add Contact Tag: "report-richiesto"
  2) Create/Update Opportunity:
       pipelineId = V82v8bJ18wJqkFXSXk8K
       stageId    = 2f0066a4-06b4-4f05-955e-c79aea406b03   (🟢 Report inviato)
       name       = "Calcolatore — {{contact.first_name}} {{contact.last_name}}"
       status     = open
  3) If/Else su custom field contact.canale_report:
       RAMO A (contact.canale_report EQUALS "email"):
           Send Email → template "Report Calcolatore Airbnb"
                        (sender predefinito, From Name "Affitti Brevi Roma")
       RAMO B / ELSE (contact.canale_report EQUALS "whatsapp"):
           Send WhatsApp (canale Twilio) → corpo = TESTO_WHATSAPP (vedi sotto)
  4) (ramo comune, dopo l'If/Else) Internal Notification:
       to = utente WUX8ztdcfKfCXePW9C5I (Gianluca Biondi)
       message = "Nuovo report richiesto da {{contact.first_name}} {{contact.last_name}} —
                  canale {{contact.canale_report}} — prezzo consigliato
                  {{contact.prezzo_consigliato}}€ (+{{contact.aumento_pct}}%). Tel {{contact.phone}}."

=================================================================
WORKFLOW 3 — "WF - Call Prenotata"   (Publish: ON)
=================================================================
Trigger: Customer Booked Appointment  →  calendar = TlY0OLMYg4To6FNk0AGg
Azioni (in ordine):
  1) Add Contact Tag: "call-prenotata"
  2) Create/Update Opportunity:
       pipelineId = V82v8bJ18wJqkFXSXk8K
       stageId    = e4cc602a-cc02-43ba-b830-8b2f69ff17f7   (🟡 Call fissata)
       name       = "Calcolatore — {{contact.first_name}} {{contact.last_name}}"
       status     = open
  3) Internal Notification:
       to = utente WUX8ztdcfKfCXePW9C5I (Gianluca Biondi)
       message = "{{contact.first_name}} {{contact.last_name}} ha prenotato una call
                  ({{contact.email}}, {{contact.phone}})."

Al termine: metti tutti e 3 i workflow in stato PUBLISHED e stampa gli ID creati.
```

---

## TESTO_WHATSAPP (Ramo B del Workflow 2)

```
Ciao {{contact.first_name | Host}}! 🏠 Ecco il tuo report SalvaGuadagno Host.

Con la nuova commissione Airbnb del 15,5%, per NON perdere guadagni il tuo nuovo prezzo consigliato è:
👉 {{contact.prezzo_consigliato}} €/notte (+{{contact.aumento_pct}}%)

Oggi ti restano ~{{contact.netto_oggi}} €/notte; col nuovo prezzo continui a tenerti ~{{contact.netto_nuovo}} €.
Se non lo alzi, rischi di perdere ~{{contact.perdita_anno}} €/anno.

Vuoi rivederlo insieme in 15 min? Prenota qui la call gratuita:
https://tools.affittibreviaroma.com/grazie

(Strumento indicativo, non è consulenza fiscale. Rispondi STOP per non ricevere più messaggi.)
```

## Note tecniche
- Il **template email** "Report Calcolatore Airbnb" è ancora una shell: va riempito con l'HTML di
  `funnel/report-email.html`, altrimenti l'email parte vuota.
- Se il CLI non trova l'azione "Send WhatsApp", il canale Twilio/WhatsApp non è connesso: in quel caso
  crea comunque il ramo con un placeholder e connettilo dopo.
- Dopo la creazione, verifico io via API (lettura) che i 3 workflow risultino `published`.
