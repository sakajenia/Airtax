# Prompt Ask AI — autosave calcolatore v2

Cosa resta da fare in GHL dopo l'autosave. I 5 custom field sono **gia' creati
via API**: qui non si ricreano.

## Cosa NON puo' fare l'API (verificato)

| Dominio | Operazioni esposte | Scrittura? |
|---|---|---|
| Custom fields | create / update / read | si' — gia' fatti |
| Workflows | `get-workflow`, `add-contact-to-workflow` | **no** `create-workflow` |
| Forms | `get-forms`, `get-forms-submissions` | **no**, read-only totale |

Quindi webhook, campi nascosti e redirect vanno fatti nella UI o via Ask AI.

> ⚠️ Ask AI non e' affidabile al 100% su queste operazioni. La spec precedente
> conteneva gia' un prompt Ask AI per i 5 custom field, e quei campi non
> esistevano. Per ogni punto qui sotto trovi **prima i click**, poi il prompt.
> Se Ask AI dice di aver fatto qualcosa, **verifica sempre** con il punto 4.

---

## 1. Inbound Webhook (il pezzo centrale)

### A mano

1. `Automation → Workflows → Create Workflow → Start from scratch`
2. Nome: `Calcolatore v2 — Autosave dati immobile`
3. Trigger: **Inbound Webhook**. Salva e **copia l'URL generato**.
4. Manda il payload di prova (sotto) a quell'URL, cosi' GHL impara lo schema.
5. Azione **Update Contact**:
   - contatto identificato da `contact_id` del payload
   - `Citta Immobile` ← `citta_immobile`
   - `Zona Immobile` ← `zona_immobile`
   - `Via Immobile` ← `via_immobile`
   - `Camere Letto` ← `camere_letto`
   - `Posti Letto` ← `posti_letto`
6. Azione **Add Tag**: `calcolatore-compilato`
7. **Publish** (non lasciarlo in Draft).

### Payload di prova

```json
{
  "contact_id": "ID_DI_UN_CONTATTO_VERO",
  "fonte": "calcolatore-v2-autosave",
  "citta_immobile": "Roma",
  "zona_immobile": "Trastevere",
  "via_immobile": "Via della Lungaretta 42",
  "camere_letto": 2,
  "posti_letto": 4,
  "prezzo_attuale": 100,
  "prezzo_consigliato": 120,
  "aumento_pct": 20,
  "regime_calc": "una casa (cedolare 21%)",
  "obiettivo_calc": "Guadagnare come oggi",
  "netto_oggi": 76,
  "netto_nuovo": 76,
  "perdita_anno": 1625
}
```

### Prompt Ask AI

```
Nel sub-account Propromanager (E1HO8PRyWf2yGaTFLuLC) devo creare un workflow
che riceve dati da una pagina web e aggiorna un contatto gia' esistente.

Crea un workflow chiamato "Calcolatore v2 - Autosave dati immobile".

TRIGGER: Inbound Webhook.
Dopo averlo creato dimmi l'URL del webhook, per esteso.

AZIONE 1 - Update Contact.
Il contatto da aggiornare NON va cercato per email: arriva il suo ID nel campo
"contact_id" del payload. Mappa cosi':
  contact_id      -> identifica il contatto da aggiornare
  citta_immobile  -> campo Citta Immobile
  zona_immobile   -> campo Zona Immobile
  via_immobile    -> campo Via Immobile
  camere_letto    -> campo Camere Letto
  posti_letto     -> campo Posti Letto
I 5 custom field esistono gia', non ricrearli. Le chiavi sono
contact.citta_immobile, contact.zona_immobile, contact.via_immobile,
contact.camere_letto, contact.posti_letto.

AZIONE 2 - Add Tag: calcolatore-compilato

Poi pubblica il workflow (non lasciarlo in Draft) e dimmi:
1. l'URL completo del webhook
2. se l'Inbound Webhook RIESCE davvero a identificare il contatto dal solo
   contact_id, oppure se pretende email o telefono. Questa risposta mi serve
   precisa: se serve l'email devo cambiare la pagina web.
3. lo stato del workflow (Published o Draft)
```

> **La domanda 2 e' la piu' importante.** Se GHL risponde che serve l'email,
> nella pagina c'e' gia' il ripiego: vedi `getEmail()` in `calcolatore-v2.html`
> e aggiungi `&em={{contact.email}}` al redirect del punto 3. Costo: l'email
> finisce nell'URL, quindi in cronologia e nei referrer. Usalo solo se serve.

---

## 2. Cinque campi nascosti nel form report

### A mano

`Sites → Forms` → form **«Invio Report Calcolatore tasse AIrbnb»**
(`Ompsev6jK1yZDrvBrKz8`). Aggiungi 5 campi **Hidden**, ognuno collegato al suo
custom field, con **Query Key** identica alla chiave. Non toccare gli 8 gia'
presenti, ne' `canale_report`, ne' il redirect del form.

### Prompt Ask AI

```
Nel sub-account Propromanager (E1HO8PRyWf2yGaTFLuLC), vai su Sites -> Forms e
apri il form "Invio Report Calcolatore tasse AIrbnb" (ID Ompsev6jK1yZDrvBrKz8).

Contiene gia' 8 campi nascosti (prezzo_attuale, prezzo_consigliato, aumento_pct,
regime_calc, obiettivo_calc, netto_oggi, netto_nuovo, perdita_anno) piu' il
campo canale_report. NON toccare nessuno di questi, e non toccare il redirect.

Aggiungi 5 campi nuovi di tipo Hidden, ognuno collegato al custom field
corrispondente, con Query Key uguale alla chiave del campo:

  citta_immobile   -> Citta Immobile
  zona_immobile    -> Zona Immobile
  via_immobile     -> Via Immobile
  camere_letto     -> Camere Letto
  posti_letto      -> Posti Letto

I 5 custom field esistono gia', non crearne di nuovi: collegati a quelli.
Salva e pubblica.

Alla fine elencami TUTTI i campi nascosti del form con la loro Query Key, cosi'
verifico che siano 13 e che nessuno dei vecchi sia cambiato.
```

---

## 3. Redirect della landing con il contact id

> **Senza questo punto niente funziona.** Se il calcolatore non riceve il `cid`
> non sa chi ha davanti e l'autosave non parte mai.

### A mano

Form della landing (quello di «Accedi al calcolatore gratis») →
`Settings → On Submit → Redirect URL`. Da:

```
https://tools.affittibreviaroma.com/calcolatore
```

a:

```
https://tools.affittibreviaroma.com/calcolatore?cid={{contact.id}}
```

### Prompt Ask AI

```
Nel sub-account Propromanager (E1HO8PRyWf2yGaTFLuLC) c'e' il form della landing
del calcolatore, quello col pulsante "Accedi al calcolatore gratis", che dopo
l'invio reindirizza a https://tools.affittibreviaroma.com/calcolatore

Devo cambiare SOLO il redirect di quel form, aggiungendo l'id del contatto:

  https://tools.affittibreviaroma.com/calcolatore?cid={{contact.id}}

Non cambiare nessun campo del form, ne' i consensi, ne' lo stage/pipeline, ne'
gli automatismi collegati: solo l'URL di redirect.

Prima dimmi il nome esatto del form che stai per modificare, cosi' confermo che
sia quello giusto. Dopo la modifica, dimmi l'URL di redirect risultante per
esteso e conferma che {{contact.id}} venga sostituito con l'id reale del
contatto al momento dell'invio.
```

---

## 4. Verifica finale (fallo sempre, anche se Ask AI dice ok)

```
Nel sub-account Propromanager (E1HO8PRyWf2yGaTFLuLC) fammi un controllo e
rispondi punto per punto, senza modificare nulla:

1. Elenca i custom field dei contatti con queste chiavi e dimmi se esistono e di
   che tipo sono: contact.citta_immobile, contact.zona_immobile,
   contact.via_immobile, contact.camere_letto, contact.posti_letto

2. Apri il form "Invio Report Calcolatore tasse AIrbnb" e elencami tutti i campi
   nascosti con la loro Query Key. Quanti sono in totale?

3. Esiste un workflow chiamato "Calcolatore v2 - Autosave dati immobile"?
   E' Published o Draft? Qual e' l'URL del suo Inbound Webhook? Quali azioni
   contiene, in ordine?

4. Qual e' l'URL di redirect del form della landing del calcolatore? Contiene
   ?cid={{contact.id}} ?

5. Quanti contatti hanno il tag "calcolatore-compilato"?
```

---

## 5. Test end-to-end (lo fai tu, non Ask AI)

1. Apri il calcolatore **passando dalla landing**, non con link diretto.
2. Controlla che l'URL contenga `?cid=...`
3. Compila solo la domanda 3. **Non cliccare «Ricevi il report».**
4. Aspetta 2 secondi, chiudi la scheda.
5. In GHL apri quel contatto: i 5 campi immobile devono essere valorizzati e
   deve esserci il tag `calcolatore-compilato`.
6. Controlla che **non** sia partita nessuna email di report.

Se il punto 5 e' vuoto, l'ordine in cui guardare:
`cid` nell'URL → `AUTOSAVE_WEBHOOK_URL` ancora col placeholder → workflow in
Draft → il webhook non identifica il contatto dal contact_id (vedi punto 1).
