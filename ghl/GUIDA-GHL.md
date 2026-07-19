# Come mettere il calcolatore dentro GHL (sub-account ProProManager)

Obiettivo: il calcolatore vive dentro GHL su **go.affittibreviaroma.com**, e ogni lead che lascia l'email entra in una **pipeline automatizzata**.

I due file da usare (in questa cartella):
- `calcolatore.html` → la pagina principale (con il pulsante "Ricevi il report via email")
- `avanzato.html` → la versione avanzata

---

## Passo 1 — Crea il form che alimenta la pipeline

1. In GHL: **Sites → Forms → Builder → + Build Form**. Nome: `Report Calcolatore Airbnb`.
2. Campi visibili: **Nome**, **Email** (obbligatorio), **Telefono** (facoltativo).
3. Aggiungi 8 **campi nascosti** (Hidden). Per ognuno apri le impostazioni del campo e imposta la **Query Key** ESATTAMENTE così (sono i dati che il calcolatore invia da solo):

   | Campo nascosto | Query Key |
   |---|---|
   | Prezzo attuale | `prezzo_attuale` |
   | Prezzo consigliato | `prezzo_consigliato` |
   | Aumento % | `aumento_pct` |
   | Regime fiscale | `regime` |
   | Obiettivo | `obiettivo` |
   | Netto oggi | `netto_oggi` |
   | Netto nuovo | `netto_nuovo` |
   | Perdita all'anno | `perdita_anno` |

   > Se un campo standard non permette la Query Key, crea prima i **Custom Fields** (Settings → Custom Fields) con questi nomi e poi aggiungili al form.
4. Salva. Poi **Integrate Form → Link**: copia l'URL. Ha questa forma:
   `https://api.leadconnectorhq.com/widget/form/XXXXXXXXXXXX`

## Passo 2 — Incolla l'URL del form nel calcolatore

1. Apri `calcolatore.html` con un editor di testo.
2. Cerca la riga:
   ```js
   var GHL_FORM_URL = 'INCOLLA-QUI-URL-FORM-GHL';
   ```
3. Sostituisci con il tuo URL, es.:
   ```js
   var GHL_FORM_URL = 'https://api.leadconnectorhq.com/widget/form/abc123XYZ';
   ```
4. Salva. (Finché non lo fai, il pulsante mostra un avviso invece del form — così vedi comunque quali dati verrebbero inviati.)

## Passo 3 — Metti le due pagine nel sito GHL

1. **Sites → Websites → + New Website** (blank). O usa un funnel.
2. Crea due pagine con questi **percorsi (path)**:
   - la home → path `/`
   - la seconda → path `/avanzato`
   (i link tra le due pagine puntano già a `/` e `/avanzato`)
3. In ogni pagina: sezione a **larghezza piena, senza padding** → elemento **Custom Code / HTML** → incolla **tutto** il contenuto del file corrispondente (`calcolatore.html` nella home, `avanzato.html` in `/avanzato`).
4. Salva e **pubblica**.

> Nota: nel builder l'anteprima del Custom Code può apparire vuota — è normale. Guarda la **preview della pagina pubblicata**.

## Passo 4 — Collega il dominio go.affittibreviaroma.com

1. **Settings → Domains → Add Domain** → `go.affittibreviaroma.com`.
2. GHL ti dà un record **CNAME**: crealo nel DNS di `affittibreviaroma.com` (host `go` → il valore indicato da GHL).
3. Assegna il dominio al sito/funnel e imposta la home come pagina predefinita. SSL parte da solo.

## Passo 5 — Automazione: dal form alla pipeline

1. **Automation → Workflows → + Create Workflow** (da zero).
2. **Trigger**: `Form Submitted` → seleziona `Report Calcolatore Airbnb`.
3. Azioni consigliate:
   - **Create/Update Opportunity** → Pipeline della ProProManager, stage es. `Nuovo Lead Calcolatore`. Nel valore/note puoi inserire i campi con i merge tag, es. `{{contact.prezzo_consigliato}}`, `{{contact.regime}}`.
   - **Add Tag**: `calcolatore-airbnb`.
   - **Send Email** (il "report"): usa i merge tag dei campi nascosti per scrivere una mail personalizzata (es. «Il tuo nuovo prezzo consigliato è {{contact.prezzo_consigliato}} €/notte»).
   - (Opzionale) **Send SMS**, o assegna a un utente.
4. Salva e **Publish** il workflow.

## Passo 6 — Tracking

Nel builder GHL, in **Settings → Tracking Code** (o Head Tracking della pagina), incolla il tuo pixel/tag (Meta Pixel, Google Tag, ecc.). GHL registra già le submission del form come conversioni.

---

### Dati che il calcolatore invia al form (riassunto)
`prezzo_attuale`, `prezzo_consigliato`, `aumento_pct`, `regime`, `obiettivo`, `netto_oggi`, `netto_nuovo`, `perdita_anno` — tutti passati automaticamente come campi nascosti quando l'utente apre il form. Così ogni lead arriva in pipeline **già profilato** (che regime ha, che prezzo fa, quanto rischia di perdere).
