# Guida setup GHL — Funnel Calcolatore SalvaGuadagno Host

Guida operativa **click-by-click** per configurare a mano in GoHighLevel (GHL)
tutto ciò che l'API/MCP non può creare. Sub-account **Propromanager**
(Location ID `E1HO8PRyWf2yGaTFLuLC`).

> Compila questa guida seguendo l'ordine del **capitolo J (Checklist)** in fondo.
> I valori tra `[ ]` sono da compilare con dati reali del Titolare.

---

## Stato reale rilevato via MCP (letto il 2026-07-19)

Verificato direttamente sul sub-account, così **non crei duplicati**:

**Sub-account**
- Nome: `Propromanager` · Location ID `E1HO8PRyWf2yGaTFLuLC` · Company ID `DDg1AdVz57KyyPlAM4fT`
- Timezone attuale: **Europe/Amsterdam** (⚠️ per un funnel italiano valuta di usare Europe/Rome — vedi Ambiguità)
- Currency: **vuota** (⚠️ impostare EUR) · Domain: **vuoto** (nessun dominio ancora collegato)
- Twilio rebilling: **disattivato** (`saasMode: not_activated`) — l'invio WhatsApp/SMS usa il Twilio già connesso al sub-account.

**Pipeline già esistenti** (nessuna è quella del funnel → va creata da zero, cap. F):
| Pipeline | ID |
|---|---|
| CRM - ANALISI ANNUNCIO | `lQTPMIhxbL6IgMcn0gG3` |
| CRM - BUROCRAZIA + FOMO | `ate37ghVEjUFrrwruqER` |
| Crm Cosmica Italia Affitti Brevi | `PG4N5tN7kocI25dxumXB` |
| Marketing Pipeline | `GyMMD8SMfH8nwdENmfsU` |
| Proprietari Cosmica Italia | `wOeZ7AgtO948KhCptaI4` |

→ **NON** esiste una pipeline «Funnel Calcolatore»: creala (cap. F).

**Custom field contatto già esistenti**: 28 campi (tutti `contact.*`, es. `contact.codice_fiscale`,
`contact.link_annuncio`, `contact.utm`, `contact.che_tipo_di_gestione_ti_interessa`…).
→ **Nessuno** dei 9 campi canonici del calcolatore esiste. Vanno creati tutti (cap. B):
`prezzo_attuale, prezzo_consigliato, aumento_pct, regime_calc, obiettivo_calc, netto_oggi,
netto_nuovo, perdita_anno, canale_report`. Nessun conflitto di nome/chiave.

---

## A. DOMINIO — collegare `tools.affittibreviaroma.com`

Obiettivo: il funnel vive su **tools.affittibreviaroma.com** (5 pagine).

**A1 — DNS (pannello di chi gestisce `affittibreviaroma.com`)**
1. Entra nel pannello DNS del dominio `affittibreviaroma.com` (Aruba/GoDaddy/Cloudflare…).
2. Crea un record **CNAME**:
   - Host / Name: `tool`
   - Value / Target: il valore che ti darà GHL al passo A2 (tipicamente `sites.ludicrous.cloud` o simile — **usa quello che mostra GHL**, non inventarlo).
   - TTL: default (o 3600).
   - Se usi **Cloudflare**: imposta la nuvoletta su **DNS only** (grigia), non proxy.

**A2 — Aggiungere il dominio in GHL**
1. In alto a sinistra assicurati di essere nel sub-account **Propromanager**.
2. **Settings** (rotella in basso a sinistra) → **Domains** → **Add Domain**.
3. Digita `tools.affittibreviaroma.com` → **Continue**.
4. GHL mostra il record CNAME da creare: **copia il valore** e usalo nel passo A1 (se non l'hai già fatto).
5. Torna qui e premi **Verify** / **Add Domain**. La propagazione DNS può richiedere da minuti ad alcune ore. SSL si attiva da solo.

**A3 — Assegnare il dominio al funnel e impostare la home**
1. **Sites → Funnels** (o **Websites**) → apri il funnel `Funnel Calcolatore` (creato al cap. E).
2. **Settings** del funnel → **Domain** → seleziona `tools.affittibreviaroma.com`.
3. Path della prima pagina = `/` (vuoto). Imposta la pagina **landing** come **default/home** del dominio.
4. **Save**.

---

## B. CUSTOM FIELDS — i 9 campi del calcolatore

**B1 — Creare la cartella**
1. **Settings → Custom Fields**.
2. In alto a destra: **Add Folder** → nome esatto: `Calcolatore Airbnb` → **Save**.

**B2 — Creare i 9 campi** (per ciascuno: **Add Field** → scegli il tipo → **Folder = Calcolatore Airbnb**)

> ⚠️ **Chiave del campo (Field Key).** In GHL la Field Key si genera **dal Nome**:
> minuscolo, spazi → underscore, accenti/simboli rimossi, e prefisso `contact.`.
> Per ottenere ESATTAMENTE le chiavi canoniche, **scrivi come Nome del campo la chiave stessa**
> (es. Nome = `prezzo_attuale`). Così GHL genera Field Key = `contact.prezzo_attuale`.
> Dopo aver salvato ogni campo, **verifica la Field Key** che GHL mostra: deve terminare
> con la chiave canonica indicata. Se differisce, elimina e ricrea con il nome corretto.

| # | Nome campo (scrivilo così) | Tipo GHL da scegliere | Field Key attesa | Note |
|---|---|---|---|---|
| 1 | `prezzo_attuale` | **Number** (Numerical) | `contact.prezzo_attuale` | prezzo/notte di oggi |
| 2 | `prezzo_consigliato` | **Number** | `contact.prezzo_consigliato` | nuovo prezzo/notte |
| 3 | `aumento_pct` | **Number** | `contact.aumento_pct` | aumento % |
| 4 | `regime_calc` | **Text** (Single Line) | `contact.regime_calc` | es. "Forfettario 21%" |
| 5 | `obiettivo_calc` | **Text** (Single Line) | `contact.obiettivo_calc` | es. "Guadagnare come oggi" |
| 6 | `netto_oggi` | **Number** | `contact.netto_oggi` | netto/notte oggi |
| 7 | `netto_nuovo` | **Number** | `contact.netto_nuovo` | netto/notte col nuovo prezzo |
| 8 | `perdita_anno` | **Number** | `contact.perdita_anno` | perdita annua stimata (può arrivare vuoto) |
| 9 | `canale_report` | **Single Option** (Dropdown Single) | `contact.canale_report` | opzioni: `email`, `whatsapp` |

**Per il campo 9 `canale_report`** (Single Option): aggiungi 2 opzioni con **valore esattamente minuscolo**:
- Opzione 1 → `email`
- Opzione 2 → `whatsapp`

> Nota tipi: se GHL chiama il tipo numerico "Number" o "Numerical" è lo stesso. Per i testi
> usa "Single Line" (Text). Non usare "Monetary" per i prezzi: il calcolatore invia interi puri.

---

## C. FORM 1 — «Registrazione Calcolatore» (pagina `/`)

Serve a raccogliere il lead prima di mostrargli il calcolatore.

**C1 — Creare il form**
1. **Sites → Forms → Builder → + Add Form** (o **+ Build Form**).
2. Rinominalo (in alto): `Registrazione Calcolatore`.

**C2 — Campi (in ordine)**
1. **First Name** (standard) — obbligatorio.
2. **Last Name** (standard) — obbligatorio.
3. **Phone** (standard) — obbligatorio (serve per il canale WhatsApp).
4. **Email** (standard) — **obbligatorio**.
5. **Consenso privacy (checkbox singola, obbligatoria, NON pre-spuntata)**
   - Trascina un campo **Terms and Conditions** (o **Checkbox**) → 1 sola opzione, required = ON.
   - Testo label (da `consensi-e-note-legali.md`, sez. a):
     > Ho letto e accetto l'informativa sulla privacy e acconsento al trattamento dei miei dati personali per ricevere il calcolatore e il report richiesto. (obbligatorio)
   - Il link "informativa sulla privacy" deve puntare a `/privacy` (target nuova scheda).
6. **Consenso marketing (checkbox singola, FACOLTATIVA, NON pre-spuntata)**
   - Campo **Checkbox** separato, required = OFF.
   - Testo label (sez. b):
     > Acconsento a ricevere via Email e/o WhatsApp aggiornamenti sulle regole degli affitti brevi, consigli, novità e offerte del Titolare. (facoltativo — puoi revocarlo quando vuoi)

> Suggerito: mappa il consenso marketing a un tag/campo per il registro consensi (vedi checklist compliance nel file consensi).

**C3 — On-submit → redirect**
1. In alto: **Settings / Options** del form → **On Submit** → **Redirect to URL**.
2. URL: `https://tools.affittibreviaroma.com/calcolatore` (oppure path relativo `/calcolatore`).
3. **Save**.

**C4 — Micro-nota sotto il bottone** (opzionale, testo da sez. c del file consensi):
> 🔒 Zero spam. I tuoi dati restano riservati… Nessuna carta richiesta.

**C5 — Incorporare il form nella landing**
La landing (`funnel/landing.html`) è HTML statico. Due modi:
- **(Consigliato) Form nativo GHL dentro la pagina**: nel builder della pagina `/` aggiungi un
  elemento **Form** e seleziona `Registrazione Calcolatore`. Attorno incolla la grafica della
  landing come blocchi **Custom Code/HTML**. Così il redirect e il tracking funzionano nativi.
- **(Alternativa) Embed inline**: **Forms → il tuo form → Integrate → Embed** → copia lo snippet
  `<iframe …>` e incollalo in un blocco **Custom Code** al posto del form fittizio nella landing.

---

## D. FORM 2 — «Report Calcolatore» (modale su `/calcolatore`)

Riceve i dati calcolati e fa scegliere il canale (Email/WhatsApp).

**D1 — Creare il form**
1. **Sites → Forms → Builder → + Add Form** → nome: `Report Calcolatore`.

**D2 — Campi visibili (sticky / precompilati)**
1. **Email** (standard) — obbligatorio. In **field settings** attiva **Sticky contact / prefill**
   così si precompila con l'email lasciata alla registrazione.
2. **First Name** (standard) — sticky/prefill ON.

**D3 — 8 campi NASCOSTI** (i dati arrivano in querystring dal calcolatore)
Per ognuno: trascina un campo **Hidden Field** → apri le impostazioni → imposta **Query Key**
ESATTAMENTE come sotto (senza prefisso `contact.`) → **mappa il campo al Custom Field** creato al cap. B.

| Hidden field → Query Key (esatta) | Mappa al Custom Field |
|---|---|
| `prezzo_attuale` | prezzo_attuale (`contact.prezzo_attuale`) |
| `prezzo_consigliato` | prezzo_consigliato |
| `aumento_pct` | aumento_pct |
| `regime_calc` | regime_calc |
| `obiettivo_calc` | obiettivo_calc |
| `netto_oggi` | netto_oggi |
| `netto_nuovo` | netto_nuovo |
| `perdita_anno` | perdita_anno |

> La **Query Key** è ciò che GHL legge dall'URL. Il calcolatore invia esattamente questi 8 nomi
> (vedi `window.__leadData` in `calcolatore.html`, righe ~558-567). `perdita_anno` può arrivare
> vuoto se l'utente non ha inserito le notti/anno: è normale.

**D4 — Campo canale (radio) → `canale_report`**
1. Trascina un campo **Radio** (o **Single Option**) → label: `Dove vuoi il report?`.
2. Opzioni (label → **value**):
   - `📧 Email` → value `email`
   - `💬 WhatsApp` → value `whatsapp`
3. **Mappa** il campo al custom field `canale_report`. Required = ON. Default suggerito: `email`.

**D5 — Consenso privacy** (obbligatorio, non pre-spuntato) — stesso testo del cap. C5/sez. a.

**D6 — On-submit → redirect**
- **On Submit → Redirect to URL** → `https://tools.affittibreviaroma.com/grazie`.

**D7 — Collegare il form al calcolatore (GHL_FORM_URL)**
1. **Forms → `Report Calcolatore` → Integrate → Link**: copia l'URL, forma:
   `https://api.leadconnectorhq.com/widget/form/XXXXXXXXXXXX`
2. Apri `funnel/calcolatore.html`, trova la riga (~595):
   ```js
   var GHL_FORM_URL = 'INCOLLA-QUI-URL-FORM-REPORT-GHL';
   ```
   e sostituisci con l'URL copiato:
   ```js
   var GHL_FORM_URL = 'https://api.leadconnectorhq.com/widget/form/XXXXXXXXXXXX';
   ```
3. Salva il file e ripubblica la pagina `/calcolatore` (cap. E). Il calcolatore accoda da solo
   i valori come querystring (`?prezzo_attuale=…&prezzo_consigliato=…`) all'URL del form dentro
   l'iframe della modale, e i campi nascosti li leggono via Query Key.

---

## E. PAGINE — 5 pagine del funnel

Crea un **Funnel** (o Website) con 5 pagine ai path indicati. Ogni pagina = un blocco
**Custom Code/HTML** a larghezza piena.

**E1 — Creare il funnel**
1. **Sites → Funnels → + New Funnel** → nome: `Funnel Calcolatore`.

**E2 — Creare le 5 pagine** (per ognuna: **+ Add Step/Page**, imposta il **Path**, poi
sezione full-width senza padding → elemento **Custom Code/HTML** → incolla TUTTO il file):

| Path | File da incollare |
|---|---|
| `/` (vuoto) | `funnel/landing.html` |
| `/calcolatore` | `funnel/calcolatore.html` (con `GHL_FORM_URL` già sostituito, cap. D7) |
| `/grazie` | `funnel/grazie.html` |
| `/avanzato` | `funnel/avanzato.html` |
| `/privacy` | `funnel/privacy.html` |

3. I link interni delle pagine usano già path assoluti (`/`, `/calcolatore`, `/grazie`, `/avanzato`, `/privacy`): non serve modificarli.
4. **Save** e **Publish** ogni pagina.

> Nota: nel builder l'anteprima del Custom Code può apparire vuota — è normale. Verifica sulla
> **pagina pubblicata**.

---

## F. PIPELINE — «Funnel Calcolatore»

1. **Opportunities → Pipelines → + Create new Pipeline** (o **Add Pipeline**).
2. Nome: `Funnel Calcolatore`.
3. Crea gli **stage** in quest'ordine (rinomina/aggiungi con **+ Add Stage**):

| Pos | Nome stage |
|---|---|
| 0 | `🔵 Registrato` |
| 1 | `🟢 Report inviato` |
| 2 | `🟡 In contatto` |
| 3 | `🟠 Call fissata` |
| 4 | `✅ Cliente` |
| 5 | `⚫ KO` |

4. **Save**. Annota l'ID pipeline e degli stage se ti servono (li rivedi con `get-pipelines`).

---

## G. WORKFLOW A — Registrazione

**Automation → Workflows → + Create Workflow → Start from scratch** → nome `WF - Registrazione Calcolatore`.

1. **Trigger**: `Form Submitted` → **Form is** `Registrazione Calcolatore`.
2. **Action — Add Contact Tag**: `calcolatore-registrato`.
3. **Action — Create/Update Opportunity**:
   - Pipeline: `Funnel Calcolatore`
   - Stage: `🔵 Registrato`
   - Opportunity name: `Calcolatore — {{contact.first_name}} {{contact.last_name}}`
   - Status: Open · Value: (vuoto o 0)
4. **Action — Send Email** (benvenuto):
   - From name: `[Nome mittente]` · From email: `[email mittente verificata]`
   - Subject: `Il tuo calcolatore è pronto 👉 apri e scopri il prezzo giusto`
   - Corpo: saluto + link `https://tools.affittibreviaroma.com/calcolatore`. Merge tag disponibile: `{{contact.first_name}}`.
5. **Save** e imposta il workflow su **Publish** (toggle in alto).

---

## H. WORKFLOW B — Report (con ramo Email/WhatsApp)

**Automation → Workflows → + Create Workflow** → nome `WF - Report Calcolatore`.

1. **Trigger**: `Form Submitted` → **Form is** `Report Calcolatore`.
   - (I custom field del contatto si aggiornano da soli perché i campi del form sono mappati
     ai custom field — cap. D. Se vuoi essere esplicito, aggiungi un'azione **Update Contact Field**.)
2. **Action — Add Contact Tag**: `report-richiesto`.
3. **Action — Create/Update Opportunity**:
   - Pipeline `Funnel Calcolatore` → Stage `🟢 Report inviato`
   - (Se l'opportunity esiste già dalla registrazione, questa la **sposta** allo stage successivo.)
4. **Condition — If/Else** su `canale_report`:
   - **Ramo IF** → condizione: **Custom Field** `canale_report` **is** `email`
     - **Action — Send Email** → template `Report Calcolatore Airbnb` (cap. H-bis).
   - **Ramo ELSE** (canale = whatsapp)
     - **Action — Send WhatsApp** (canale Twilio del sub-account) → corpo = testo di
       `funnel/report-whatsapp.txt` (blocco tra «--- TESTO DA INCOLLARE ---»).
5. **Action — Internal Notification** (a fine ramo, comune): notifica al team
   → **Notify: assigned user / specific email** `[email team]`
   → testo: `Nuovo report richiesto da {{contact.first_name}} {{contact.last_name}} — canale {{contact.canale_report}} — prezzo consigliato {{contact.prezzo_consigliato}}€ (+{{contact.aumento_pct}}%). Tel {{contact.phone}}.`
6. **Save** e **Publish**.

### H-bis — Template email «Report Calcolatore Airbnb»
1. **Marketing → Emails → Templates → + New → il builder che preferisci** → nome esatto:
   `Report Calcolatore Airbnb`.
2. Contenuto basato su `funnel/report-email.html` (già pronto e brandizzato). Puoi incollarlo via
   builder **Import HTML / Code** oppure ricostruirlo con i blocchi.
3. **Merge tag esatti da usare** (chiavi canoniche):

| Merge tag | Significato |
|---|---|
| `{{contact.first_name}}` | nome — **senza fallback**: non usare `| Host`, non deve mai comparire "Host" al posto del nome |
| `{{contact.prezzo_attuale}}` | prezzo/notte oggi |
| `{{contact.prezzo_consigliato}}` | nuovo prezzo/notte consigliato |
| `{{contact.aumento_pct}}` | aumento % |
| `{{contact.regime_calc}}` | regime fiscale scelto |
| `{{contact.obiettivo_calc}}` | obiettivo scelto |
| `{{contact.netto_oggi}}` | netto/notte oggi |
| `{{contact.netto_nuovo}}` | netto/notte col nuovo prezzo |
| `{{contact.perdita_anno}}` | perdita annua stimata |

### Merge tag per il messaggio WhatsApp
Gli stessi (sono le stesse chiavi contatto). Il testo pronto in `funnel/report-whatsapp.txt` usa:
`{{contact.first_name}}`, `{{contact.prezzo_consigliato}}`, `{{contact.aumento_pct}}`,
`{{contact.netto_oggi}}`, `{{contact.netto_nuovo}}`, `{{contact.perdita_anno}}`, `{{contact.regime_calc}}`.
Il link CTA punta a `https://tools.affittibreviaroma.com/grazie`. Includi l'opt-out "rispondi STOP".

> WhatsApp/Twilio: il mittente/template devono essere approvati (WhatsApp Business API). Se GHL
> non mostra l'azione "Send WhatsApp", verifica che il canale WhatsApp sia connesso in
> **Settings → Integrations / Phone Numbers (Twilio)**.

---

## I. TRACKING — pixel Meta / Google

Due livelli, incolla in entrambi se ti servono:
1. **Tutto il funnel**: **Sites → Funnels → `Funnel Calcolatore` → Settings → Tracking Code / SEO**
   → campi **Head Tracking Code** e **Body Tracking Code**: incolla lì Meta Pixel e Google Tag (GA4/GTM).
2. **Sub-account (globale)**: **Settings → Business Profile / Tracking** (se disponibile) per il tag a livello location.
3. **Per singola pagina**: nel builder della pagina → **Settings → Custom CSS/JS o Tracking** (es. evento `Lead` solo su `/grazie`).
4. GHL registra già le **submission dei form** come conversioni native. Per l'evento standard
   `Lead` di Meta, aggancia il fire dell'evento al redirect verso `/grazie`.

> ⚠️ Compliance: i pixel/analytics sono cookie non essenziali → vanno caricati **solo dopo
> consenso** del cookie banner (vedi `consensi-e-note-legali.md`, sez. d).

---

## J. CHECKLIST — ordine di esecuzione consigliato

1. **B** — Cartella + 9 custom field (prima di tutto: i form li useranno). Verifica ogni Field Key.
2. **F** — Pipeline `Funnel Calcolatore` con i 6 stage.
3. **C** — Form 1 `Registrazione Calcolatore` (+ consensi, redirect `/calcolatore`).
4. **D** — Form 2 `Report Calcolatore` (8 hidden + radio `canale_report` + consenso, redirect `/grazie`).
   → poi **D7**: incolla `GHL_FORM_URL` in `calcolatore.html`.
5. **H-bis** — Template email `Report Calcolatore Airbnb`.
6. **E** — Funnel `Funnel Calcolatore` con le 5 pagine (incolla gli HTML; `/calcolatore` con URL aggiornato).
7. **A** — Dominio `tools.affittibreviaroma.com` (DNS CNAME → GHL → assegna al funnel → home `/`).
8. **G** — Workflow A (registrazione).
9. **H** — Workflow B (report, ramo Email/WhatsApp, notifica interna). **Publish** entrambi.
10. **I** — Tracking (dopo cookie banner) + impostare **Currency = EUR** e valutare **Timezone Europe/Rome**.
11. **Test end-to-end**: registrati → calcola → richiedi report (prova sia Email sia WhatsApp) →
    verifica: contatto creato, tag, opportunity spostata di stage, email/WhatsApp ricevuti, redirect `/grazie`.
12. Compila con il legale i placeholder in `consensi-e-note-legali.md` e nella pagina `/privacy`.

---

## Ambiguità / punti da confermare

1. **Timezone**: il sub-account è su **Europe/Amsterdam**. Per orari corretti (invii, appuntamenti)
   in Italia valuta **Europe/Rome** — ma cambiarlo impatta gli altri funnel già attivi sul sub-account:
   **conferma col Titolare** prima di modificarlo.
2. **Currency vuota**: impostare **EUR** (Settings → Business Profile) per report/valori opportunity.
3. **Dominio**: il vecchio `ghl/GUIDA-GHL.md` citava `go.affittibreviaroma.com` e query key `regime`/`obiettivo`.
   Questa guida è la versione aggiornata e canonica: dominio **tool.**affittibreviaroma.com e chiavi
   **regime_calc**/**obiettivo_calc**. Se `go.` fosse già collegato, decidi se dismetterlo o tenerlo come redirect.
4. **Titolare del trattamento**: l'anagrafica GHL del sub-account è "Propromanager" con indirizzo in
   **Albania (Tiranë)**. Per l'informativa privacy serve la **ragione sociale/​P.IVA italiana reale**
   del Titolare dietro affittibreviaroma.com (placeholder `[Ragione Sociale del Titolare]`).
5. **WhatsApp/Twilio**: `saasMode: not_activated` e twilioRebilling disattivato. Confermare che il
   numero/canale WhatsApp Business sia connesso e i template approvati prima di pubblicare il ramo WhatsApp.
6. **Field Key generation**: GHL genera la Field Key dal Nome e in alcuni piani **non è editabile a mano**.
   Se un campo non genera la chiave canonica esatta, ricrealo cambiando il Nome finché la chiave combacia.
7. **Consensi**: i testi in `consensi-e-note-legali.md` sono bozza non validata da legale/DPO — vanno
   approvati prima del go-live.
