# FIX «WF - Report Calcolatore» — il lead riceve solo la cifra (o niente)

Diagnosi eseguita il 2026-08-04 sui contatti reali del sub-account
**Propromanager** (`E1HO8PRyWf2yGaTFLuLC`) via API.

---

## Cosa NON è rotto (verificato)

| Verifica | Esito |
|---|---|
| Il calcolatore passa gli 8 valori al form | ✅ querystring completa da `window.__leadData` |
| I 9 custom field esistono con le key canoniche | ✅ `prezzo_attuale, prezzo_consigliato, aumento_pct, regime_calc, obiettivo_calc, netto_oggi, netto_nuovo, perdita_anno, canale_report` |
| I valori arrivano davvero sul contatto | ✅ es. Cristina Onorati: 185 → 237 (+28%), netto 130→131, perdita 3668 — tutti e 9 popolati |
| I merge tag si risolvono nei workflow | ✅ le email inviate mostrano i numeri reali |
| Link prenotazione call | ✅ HTTP 200 |

**Il dato c'è tutto. Il problema è solo in cosa spedisce il Workflow 2.**

---

## Bug 1 — ramo EMAIL: manda un testo scarno, non il report

Email realmente recapitata (Mani Camerini, 04/08 08:46), oggetto
*"Il tuo report SalvaGuadagno Host è pronto 🏠"*:

> Ciao Mani, ecco il tuo report SalvaGuadagno Host.
> Con la nuova commissione Airbnb del 15,5%, per non perdere guadagni il tuo nuovo prezzo consigliato è: 314 €/notte (+26%).
> Oggi ti restano ~188 €/notte; col nuovo prezzo continui a tenerti ~189 €. Se non lo alzi, rischi di perdere ~4956 €/anno. […]

È il **testo breve inline** scritto dal CLI, non il report. Mancano
`prezzo_attuale`, `regime_calc`, `obiettivo_calc`, la spiegazione del perché,
la tabella prima/dopo e tutto il brand.

**Fix:** sostituire il corpo dell'azione *Send Email* con l'HTML di
`funnel/report-email.html` (Code / Import HTML).

## Bug 2 — ramo WHATSAPP: non manda NIENTE

Chi sceglie WhatsApp non riceve alcun report. Prova sui due contatti con
`canale_report = whatsapp`:

- **Cristina Onorati** — nessun report; ha scritto in chat:
  *"Dove trovo il report?"* e *"Non c'è il report però ma solamente il calcolatore"*
- **Liliana Galli** — nessun report

**Fix:** aggiungere l'azione *Send WhatsApp* nel ramo `whatsapp` col testo di
`funnel/report-whatsapp.txt`.

## Bug 3 — il template email è ancora il demo di GHL

Il template **"Il tuo report SalvaGuadagno Host"** (`6a5c91c8eb3d45e6ff0fb5fb`)
contiene ancora il contenuto dimostrativo di serie, in inglese
(*"Welcome to email — Create ready-to-send emails in minutes…"*), zero merge tag.
Se un workflow ci puntasse, partirebbe quello. O lo si riempie con
`funnel/report-email.html`, o lo si elimina per non lasciare la mina.

---

## PROMPT per il CLI GHL (copia da qui)

```
Sei connesso al sub-account GoHighLevel "Propromanager".
locationId = E1HO8PRyWf2yGaTFLuLC

Modifica il workflow "WF - Report Calcolatore"
(trigger: Form Submitted, form Ompsev6jK1yZDrvBrKz8).

Il ramo If/Else è sul custom field contact.canale_report
(id cFOteyweDLD6j1u66xPW, opzioni: email | whatsapp).

=== RAMO A — canale_report EQUALS "email" ===
Azione Send Email, sender predefinito della location, From Name "Affitti Brevi Roma".
  subject = Il tuo report: {{contact.prezzo_consigliato}} €/notte è il tuo nuovo prezzo 🏠
  body    = HTML COMPLETO del file funnel/report-email.html (usa Import HTML /
            editor "Code", NON il testo breve attuale: quello va sostituito).
Il file usa questi merge tag, tutti già popolati sul contatto:
  contact.first_name, contact.prezzo_attuale, contact.prezzo_consigliato,
  contact.aumento_pct, contact.regime_calc, contact.obiettivo_calc,
  contact.netto_oggi, contact.netto_nuovo, contact.perdita_anno

=== RAMO B — canale_report EQUALS "whatsapp" ===
QUESTO RAMO OGGI NON INVIA NULLA: aggiungi l'azione mancante.
Azione Send WhatsApp (canale Twilio), corpo = testo di funnel/report-whatsapp.txt.

=== INVARIATO ===
Non toccare: trigger, tag "report-richiesto", Create/Update Opportunity
(pipeline V82v8bJ18wJqkFXSXk8K → stage 2f0066a4-06b4-4f05-955e-c79aea406b03
"🟢 Report inviato"), notifica interna a WUX8ztdcfKfCXePW9C5I.

Al termine ripubblica il workflow (PUBLISHED) e stampa cosa hai cambiato.
```

---

## Se preferisci farlo a mano nella UI

1. **Automation → Workflows → «WF - Report Calcolatore» → Edit**
2. Ramo **email** → azione *Send Email* → apri l'editor → `</>` **Code / Import HTML**
   → cancella tutto → incolla `funnel/report-email.html` → Save
   → subject: `Il tuo report: {{contact.prezzo_consigliato}} €/notte è il tuo nuovo prezzo 🏠`
3. Ramo **whatsapp** → **+ Add Action → Send WhatsApp** → incolla il testo di
   `funnel/report-whatsapp.txt` → Save
4. **Publish** (toggle in alto a destra)
5. Test: rifai il giro dal calcolatore una volta con `email` e una con `whatsapp`

## Dopo il fix — recuperare chi non ha ricevuto il report

Questi contatti hanno `report-richiesto` ma non hanno mai visto il report
(hanno scelto WhatsApp): **Cristina Onorati**, **Liliana Galli**.
Si recuperano lanciando manualmente il workflow su di loro, o mandando
il messaggio a mano dalla conversazione.

## Nota minore

Il piè di pagina di disiscrizione che GHL aggiunge in automatico è in inglese
(*"If you no longer wish to receive these emails you may unsubscribe"*).
Si cambia in **Settings → Business Profile**, sezione compliance/footer email.
