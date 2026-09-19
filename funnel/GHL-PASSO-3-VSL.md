# Passo 3 — la pagina VSL e la sticky header

Tutto quello che c'è da fare su GHL per mettere online il terzo passo del
funnel. **Sub-account: ProProManager, `E1HO8PRyWf2yGaTFLuLC`.**

Il passo 1 (campi immobile) e il passo 2 (Worker + autosave) sono chiusi e
funzionanti: i dati passano. Qui si parte da lì.

---

## 0 · Cosa ho già fatto io

| Cosa | Dove |
|---|---|
| Sticky header nuova (logo a sinistra, CTA "shiny" a destra) | `funnel/parti/sticky-header.html`, già dentro alle pagine |
| Header messa in v2, avanzato (3 copie) e VSL | `funnel/calcolatore-v2.html`, `funnel/avanzato.html`, `avanzato.html`, `ghl/avanzato.html` |
| Pagina VSL completa | `funnel/vsl/grazie-vsl.html` |
| Anteprima apribile in un browser | `funnel/vsl/anteprima.html` |
| Campo GHL per la percentuale di video guardata | creato via API: **Video VSL Pct**, `contact.video_vsl_pct`, numerico, nel gruppo del calcolatore |
| Worker aggiornato: accetta `video_vsl_pct` e mette i tag giusti | `tools/ghl-autosave-worker.js` |
| Il conto della cedolare rifatto sui numeri veri di chi guarda | `funnel/calcolatore-v2.html` + `funnel/vsl/grazie-vsl.html` |
| Prove automatiche (103 in tutto, tutte verdi) | `tools/test/` |

La vecchia header a una sola colonna è stata tolta: non esiste più in nessuna
pagina.

---

## 1 · Ripubblicare il calcolatore e l'avanzato

La sticky header nuova è già dentro ai file. Devi solo riportarli su GHL.

1. `Sites → Funnels → Airtax | Calcolatore Tasse → Calcolatore` (`/calcolatore`)
2. Apri il blocco di codice che contiene il calcolatore, **seleziona tutto e
   cancella**, poi incolla il contenuto di `funnel/calcolatore-v2.html`.
3. Save → **Publish**.
4. Stessa cosa sul passo `avanzato` (`/avanzato`) con `funnel/avanzato.html`.

Quando la pagina è online controlla, a occhio: logo a sinistra, pulsante
rosso a destra con la scritta che gli scorre sopra una lama di luce. Su
telefono il pulsante diventa "Paga meno tasse", è previsto.

> Il pulsante porta a `https://tools.affittibreviaroma.com/grazie`, cioè la
> VSL. Se un giorno vuoi darle un indirizzo dedicato (tipo `/meno-tasse`),
> cambia l'`href` in `funnel/parti/sticky-header.html` e rilancia
> `python3 tools/applica-header.py`: si aggiorna in tutte le pagine insieme.

---

## 2 · Costruire la pagina VSL su /grazie

La VSL **sostituisce** la vecchia thank you page. Stesso indirizzo, contenuto
completamente diverso.

1. `Sites → Funnels → Airtax | Calcolatore Tasse → Grazie` (`/grazie`)
2. Cancella tutte le sezioni che ci sono adesso.
3. Aggiungi una Row, dentro una Column a larghezza piena, e dentro un elemento
   **Custom JS/HTML** (si chiama anche "Code").
4. Alla Row metti **padding 0** su tutti e quattro i lati: la pagina gestisce
   da sola i propri margini, se GHL ne aggiunge altri si vede uno stacco.
5. Incolla dentro tutto il contenuto di `funnel/vsl/grazie-vsl.html`.
6. Save → **Publish**.

> **Se l'incollaggio si tronca** (è già successo con il Worker): scarica il
> file, aprilo in un editor di testo, seleziona tutto da lì e incolla.
> Controlla sempre che l'ultima riga incollata sia `</div>`.

I font non sono impostati dentro al blocco: la pagina eredita quelli della
pagina GHL, come mi avevi chiesto.

### Le tre cose da riempire a mano

Sono segnate nel file con `DA METTERE`:

| # | Cosa | Dove nel file |
|---|---|---|
| 1 | L'indirizzo del video principale | nel tag `<video>` dell'hero |
| 2 | Miniature e video delle 8 obiezioni (facoltativi) | dentro ogni `<article class="ppm-vcard">` |
| 3 | Le foto delle testimonianze | dentro al muro scorrevole in fondo |

**Il video principale.** `Media Storage` → carica il video → apri → copia il
link, poi nel file sostituisci

```html
<video controls playsinline preload="none" data-ppm-video="vsl-principale"></video>
```

con

```html
<video controls playsinline preload="none"
       src="INCOLLA-QUI-IL-LINK" poster="LINK-DELLA-COPERTINA"
       data-ppm-video="vsl-principale"></video>
```

Il `poster` è facoltativo: senza, si vede un riquadro scuro col pulsante play,
che sta bene lo stesso.

**Le testimonianze.** Ogni riquadro tratteggiato va sostituito con:

```html
<figure class="ppm-wall-card" style="width:460px">
  <img src="LINK-IMMAGINE" alt="Testimonianza di un host" width="460" height="230" loading="lazy" decoding="async">
</figure>
```

Ogni riquadro compare **due volte** (il nastro scorre in continuo ed è fatto
di due metà identiche): sostituiscile entrambe, altrimenti a metà giro si
vede un salto.

**Le 8 obiezioni** funzionano anche senza video: il pulsante play mostra
"Video in arrivo. Intanto prenota pure la call." Quando avrai i video, in ogni
card togli il commento e riempi `src`.

---

## 3 · Ricaricare il Worker (obbligatorio per la percentuale video)

Il Worker che hai già online non conosce ancora il campo `video_vsl_pct`:
finché non lo aggiorni, le percentuali vengono rifiutate.

1. Vai su `dash.cloudflare.com` → Workers & Pages → `ghl-autosave-airtax`
2. `Edit code`
3. Cancella tutto e incolla il contenuto di `tools/ghl-autosave-worker.js`
4. Controlla che l'ultima riga sia `};`
5. `Deploy`

Il secret `GHL_TOKEN` resta dov'è: non va rifatto.

Cosa cambia rispetto a prima:

- accetta `video_vsl_pct`, ma **solo** i valori 25, 50, 75, 100 (qualunque
  altro numero viene buttato);
- il tag non è più sempre `calcolatore-compilato`: adesso dipende da chi
  scrive. Il calcolatore mette `calcolatore-compilato`, il video della VSL
  mette `vsl-video-25` / `-50` / `-75` / `-100`.

---

## 4 · Far arrivare l'ID del contatto sulla VSL

Senza ID contatto la percentuale di video **non si registra**: il Worker
rifiuta le richieste senza un `contact_id` valido, ed è giusto così (meglio
niente che dati appiccicati alla persona sbagliata).

Nella maggior parte dei casi l'ID c'è già, perché la pagina lo rilegge dal
`localStorage` che il calcolatore ha scritto sullo stesso dominio. Ma se uno
arriva su `/grazie` da un link in email, quel dato non c'è.

Quindi, sul form **`Invio Report Calcolatore tasse AIrbnb` (`Ompsev6jK1yZDrvBrKz8`)**,
nelle impostazioni di redirect metti:

```
https://tools.affittibreviaroma.com/grazie?cid={{contact.id}}
```

> ⚠️ Nel sub-account ci sono **due form con nomi quasi uguali**. Non
> confonderli:
>
> | Form | ID | Redirect |
> |---|---|---|
> | Registrazioni Calcolatore tasse AIrbnb (dalla landing) | `oRexxrmMwWz2ablBAUoz` | `…/calcolatore?cid={{contact.id}}` |
> | Invio Report Calcolatore tasse AIrbnb (dal calcolatore) | `Ompsev6jK1yZDrvBrKz8` | `…/grazie?cid={{contact.id}}` |

---

## 5 · Dove leggi quanto hanno guardato il video

Sul contatto, campo **Video VSL Pct**: contiene la percentuale più alta
raggiunta (25, 50, 75 o 100). Se è vuoto, quel contatto il video non l'ha
aperto o non è arrivato al 25%.

Per lavorarci sopra:

- **Smart List** `Video VSL Pct` ≥ 75 → chi ha guardato quasi tutto: sono
  quelli da richiamare per primi.
- **Tag** `vsl-video-25/50/75/100` → per far partire un workflow.
  `Automation → Workflows → Trigger: Contact Tag` → tag `vsl-video-75` →
  quello che vuoi (notifica a te, task, email diversa).

### Volendo usare invece il trigger nativo di GHL

GHL ha un trigger **Video Tracking** (funnel + video + percentuale). Lo puoi
usare, ma ha due vincoli che qui costano cari:

1. funziona **solo** con l'elemento Video nativo di GHL su una pagina funnel,
   non con un video dentro a un blocco di codice. Vorrebbe dire rinunciare al
   riquadro con l'alone e il pulsante play, cioè al pezzo di design che regge
   la pagina;
2. va disattivata la barra di avanzamento del player, altrimenti il conteggio
   non è attendibile.

In compenso non richiede nessun campo custom. Vale la stessa condizione della
soluzione che ho messo io: **il contatto deve essere già nel CRM**, altrimenti
il trigger non scatta.

Se un giorno la preferisci: spezza il blocco in due (tutto fino a
`</section>` dell'hero in un blocco, il resto in un altro), metti in mezzo
l'elemento Video nativo, e crea quattro workflow con trigger Video Tracking,
funnel `Airtax | Calcolatore Tasse`, operatore "maggiore o uguale a",
percentuali 25/50/75/100, azione Update Contact su `Video VSL Pct`.

---

## 6 · Prove da fare quando è tutto online

1. Apri `https://tools.affittibreviaroma.com/calcolatore` da telefono: la
   header resta attaccata in alto mentre scorri, il pulsante brilla.
2. Clicca il pulsante: arrivi su `/grazie`.
3. Su `/grazie` fai partire il video e guardane un terzo, poi chiudi.
4. Apri il tuo contatto su GHL: **Video VSL Pct** deve dire `25`, e fra i tag
   deve esserci `vsl-video-25`.
5. Guarda il video fino in fondo su un altro contatto di prova: deve arrivare
   `100`.
6. Clicca "Prenota la call gratuita": deve aprirsi il calendario.
7. Apri tutte e 8 le card delle obiezioni: se non hai ancora i video deve
   uscire il messaggino, non un errore.

Se qualcosa non arriva, il posto dove guardare è Cloudflare → il Worker →
`Logs` → `Begin log stream`, e poi ricarica la pagina: lì vedi la richiesta
che arriva e l'eventuale errore.

---

## 7 · Il conto, e i numeri veri del lead

Subito sotto la prova sociale, prima del metodo in 4 fasi, c'è la card che
risponde a una domanda sola: **quanto di tasse paghi oggi, quanto con noi.**
Due barre, due numeri, una frase. Niente di più: su un telefono una barra a
quattro fette si legge male e si capisce in tre secondi invece che in uno.

E quando può, non usa un esempio: usa **i numeri che quella persona ha appena
messo nel calcolatore.**

Come funziona: il calcolatore salva nel browser (`localStorage`, chiave
`airtax_caso`) gli ingredienti del suo conto — prezzo a notte, pulizie, notti
per soggiorno, regime fiscale, aliquota, commissione. La VSL, che sta sullo
stesso dominio, li rilegge e rifà le due righe. Nessun dato esce dal browser e
non serve nessuna configurazione su GHL: è roba sua, mostrata a lui.

Quando è personalizzato si vede: pillola verde **«I tuoi numeri»**, la riga
sopra le barre parla della *sua* prenotazione, e sotto compare «rifai il
calcolo».

Torna da solo all'esempio, senza rompere niente, se:

- la persona non è passata dal calcolatore, o lo ha fatto da un altro
  dispositivo (arriva su `/grazie` da un link in email);
- ha scelto il regime **impresa**, che non paga un'imposta sul lordo: il
  confronto sarebbe 0 contro 0;
- il dato è più vecchio di 60 giorni;
- i numeri non reggono, o il `localStorage` è corrotto.

### L'unico numero da decidere: la quota di gestione

Dentro `funnel/vsl/grazie-vsl.html`, nel blocco `ppm:035b-caso`:

```js
var FEE_GESTIONE = 0.20;          /* <-- la vostra quota di gestione */
```

Quella costante regge **sia** l'esempio **sia** il caso personale: si cambia
lì e basta.

La percentuale mostrata («−51%») è calcolata e arrotondata **per difetto**,
mai a favore. Dipende da quanto pesano commissione, pulizie e gestione sul
lordo, quindi cambia da host a host: con il 20% di gestione va da circa −38%
(host senza costi di pulizia) a circa −51%. Per questo il titolo dice **«fino
al 50%»** e non «oltre il 50%»: così regge in tutti e due i casi.

Dammi la tua percentuale di gestione e la aggiorno.

