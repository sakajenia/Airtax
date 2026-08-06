# Checklist finale — Funnel Calcolatore SalvaGuadagno Host

Sub-account **Propromanager** · Location ID `E1HO8PRyWf2yGaTFLuLC`
Riferimenti capitoli = `GUIDA-SETUP-GHL.md`. Verifica QA end-to-end eseguita il **2026-07-19**.

I link diretti `app.gohighlevel.com` funzionano solo se sei loggato **e** già dentro il sub-account
Propromanager (altrimenti GHL ti reindirizza al login/scelta location).

---

## ✅ Fatto automaticamente (già pronto, nessuna azione)

| Cosa | Dettaglio / percorso |
|---|---|
| **5 pagine funnel** scritte e QA-verificate | `funnel/landing.html`, `funnel/calcolatore.html`, `funnel/grazie.html`, `funnel/avanzato.html`, `funnel/privacy.html` |
| **Template email report** pronto (HTML brandizzato) | `funnel/report-email.html` — merge tag `{{contact.*}}` con chiavi canoniche |
| **Testo report WhatsApp** pronto | `funnel/report-whatsapp.txt` |
| **Guida setup GHL** completa click-by-click | `funnel/GUIDA-SETUP-GHL.md` |
| **Bozza consensi / note legali** | `funnel/consensi-e-note-legali.md` |
| **`window.__leadData` usa le 8 chiavi canoniche** | Verificato: `prezzo_attuale, prezzo_consigliato, aumento_pct, regime_calc, obiettivo_calc, netto_oggi, netto_nuovo, perdita_anno` |
| **Modale report** apre correttamente | Verificato via Playwright; con placeholder `GHL_FORM_URL` mostra i dati come querystring |
| **Zero errori JS/console** su tutte le 5 pagine | light + dark, viewport 320/390/768/1280 |
| **Nessun overflow orizzontale** | Verificato a 320/390/768/1280 (light + dark) su tutte le pagine |
| **Dark mode leggibile** | Verificata su tutte le pagine (screenshot in `scratchpad/qa-shots/`) |
| **DIFETTO CORRETTO — overflow privacy.html** | `.ph` aveva `white-space:nowrap` → forzava larghezza pagina a 571px a 320/390. Cambiato in `white-space:normal; overflow-wrap:anywhere`. Ora `ok` a tutte le larghezze. |
| **Contatto di test GHL creato via MCP** | `Test Calcolatore QA` · email `qa-test+calcolatore@example.com` · tel `+393510000000` · tag `qa-test` · **ID `zPnJzAMdGZVNVCwZAiqJ`** (`new: true`, HTTP 201) |
| ✅ **9 CUSTOM FIELD CREATI VIA CLI (API REST)** | Creati automaticamente con `tools/ghl-cli.mjs create-fields` — key ESATTE: `prezzo_attuale, prezzo_consigliato, aumento_pct, regime_calc, obiettivo_calc, netto_oggi, netto_nuovo, perdita_anno, canale_report`. Il passo manuale #1 NON serve più. |
| ✅ **Contatto test popolato coi 9 campi (end-to-end)** | `ghl-cli.mjs test-contact` → rilettura conferma tutti e 9 i valori salvati sul contatto `zPnJzAMdGZVNVCwZAiqJ`. Percorso dati verificato. |

> ⚠️ **Custom field NON valorizzati sul contatto test**: i 9 campi canonici del calcolatore
> **non esistono ancora** nel sub-account (verificato via MCP `get-custom-fields`: presenti 28 campi,
> nessuno dei 9 canonici). L'upsert dei custom field è quindi stato **omesso**: creato solo il
> contatto base + tag. **I 9 custom field vanno creati a mano PRIMA (cap. B)** — è il passo #1 qui sotto.

> 🧹 **Post-test**: elimina il contatto `qa-test` a fine collaudo (Contacts → filtra tag `qa-test` → Delete).

---

## 🖱️ Da fare in GHL UI (in quest'ordine — per dipendenza)

| # | Passo | Cap. | Link diretto GHL (dentro Propromanager) |
|---|---|---|---|
| ~~**1**~~ | ✅ **FATTO VIA CLI** — i 9 custom field sono già creati con le key canoniche (`tools/ghl-cli.mjs create-fields`). Nessuna azione. | ~~B~~ | — |
| **2** | **Creare pipeline `Funnel Calcolatore`** con i 6 stage: 🔵 Registrato → 🟢 Report inviato → 🟡 In contatto → 🟠 Call fissata → ✅ Cliente → ⚫ KO | **F** | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/opportunities/pipelines` |
| **3** | **Form 1 «Registrazione Calcolatore»**: Nome, Cognome, Telefono, Email + consenso privacy (obbl.) + marketing (facolt.). On-submit → redirect `/calcolatore` | **C** | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/form-builder-v2/list` |
| **4** | **Form 2 «Report Calcolatore»**: Email+Nome sticky, **8 hidden field** (Query Key = chiavi canoniche, mappati ai custom field), radio **`canale_report`** (email/whatsapp), consenso privacy. On-submit → redirect `/grazie` | **D** | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/form-builder-v2/list` |
| **5** | **D7 — Collegare il form al calcolatore**: copia `Report Calcolatore → Integrate → Link` e incollalo in `funnel/calcolatore.html` riga ~595 (`var GHL_FORM_URL = '…'`), sostituendo `INCOLLA-QUI-URL-FORM-REPORT-GHL` | **D7** | (edit file locale, poi ripubblica pagina `/calcolatore`) |
| **6** | **Template email «Report Calcolatore Airbnb»**: importa `funnel/report-email.html` (Import HTML / Code). Merge tag già con chiavi canoniche | **H-bis** | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/emails/templates` |
| **7** | **Funnel `Funnel Calcolatore` con 5 pagine**: incolla ogni file come blocco Custom Code ai path `/`, `/calcolatore` (con URL aggiornato), `/grazie`, `/avanzato`, `/privacy`. Publish. | **E** | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/funnels-websites/funnels` |
| **8** | **Dominio `tools.affittibreviaroma.com`**: DNS CNAME (valore fornito da GHL, Cloudflare in "DNS only") → Settings/Domains → Add → Verify → assegna al funnel, home = `/` | **A** | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/settings/domain` |
| **9** | **Workflow A «WF - Registrazione Calcolatore»**: trigger Form `Registrazione` → tag `calcolatore-registrato` → crea Opportunity stage 🔵 Registrato → email benvenuto con link `/calcolatore`. **Publish** | **G** | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/automation/workflows` |
| **10** | **Workflow B «WF - Report Calcolatore»**: trigger Form `Report` → tag `report-richiesto` → Opportunity a 🟢 Report inviato → **If/Else su `canale_report`** (email→Send Email template; whatsapp→Send WhatsApp con `report-whatsapp.txt`) → notifica interna al team. **Publish** | **H** | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/automation/workflows` |
| **11** | **Impostazioni sub-account**: **Currency = EUR** (ora vuota); valutare **Timezone Europe/Rome** (ora Europe/Amsterdam — impatta altri funnel: confermare col Titolare) | I / Ambiguità 1-2 | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/settings/business_info` |
| **12** | **Tracking** Meta Pixel / GA4-GTM su funnel (Settings → Tracking Code), evento `Lead` su `/grazie`. **Solo dopo consenso cookie** | **I** | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/funnels-websites/funnels` → Settings del funnel |
| **13** | **Test end-to-end reale**: registrati → calcola → report (prova **Email e WhatsApp**) → verifica contatto, tag, opportunity spostata di stage, messaggi ricevuti, redirect `/grazie` | J.11 | — |
| **14** | **Compliance legale**: sostituire `[Ragione Sociale del Titolare]` in `privacy.html` e `report-email.html`; far validare da legale/DPO i testi di `consensi-e-note-legali.md`. Confermare WhatsApp Business/Twilio connesso e template approvati | J.12 / Ambiguità 4-5-7 | `app.gohighlevel.com/location/E1HO8PRyWf2yGaTFLuLC/settings/phone_number` |

---

### Prerequisiti bloccanti (catena di dipendenze)
`#1 custom field` → abilita `#3/#4 form` (mapping + hidden) e `#6/#10 email/WhatsApp` (merge tag).
`#4 form` → abilita `#5` (URL da incollare) → `#7` pagina `/calcolatore` funzionante.
`#2 pipeline` → richiesta da `#9/#10` (azioni Opportunity).
`#7 pagine` + `#8 dominio` → prerequisiti del `#13 test end-to-end`.
