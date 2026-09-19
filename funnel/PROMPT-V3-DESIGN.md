# calcolatore-v3.html — proposta di design (non pubblicata)

File creato su richiesta esplicita per **vedere** come potrebbe diventare la
v2 con uno strato visivo diverso. **Non sostituisce nulla**: `calcolatore.html`
e `calcolatore-v2.html` restano quelli in produzione. Questo file non è
linkato da nessuna pagina del funnel.

## Cosa NON è cambiato (garantito, non promesso)

Il file e' costruito incollando il JavaScript della v2 **senza modificarlo**:
stesso file byte per byte da `<script>` a `</script>`, spostato di peso dentro
la v3. Ne consegue che sono identici:

- il calcolo (IVA su tutti i regimi, margine 8%, tutte le formule)
- l'autosave (cid, localStorage, sendBeacon, debounce)
- le chiavi inviate a GHL (`window.__leadData`, 13 campi)
- la validazione della domanda 3

Verificato: la stessa suite Playwright della v2, puntata sul file v3,
passa **24/24** senza modifiche alle assertion sui dati (solo i selettori
CSS di due controlli sull'ordine delle domande sono stati adattati al nuovo
markup: `.clause-no`/`.clause-q` invece di `.q .n`).

## Cosa e' cambiato

Solo `<style>` e il markup statico (HTML). Direzione: non una landing SaaS,
un documento — carta calda, filetti al posto delle card, una lastra rossa
annidata una volta sola (il risultato), tipografia serif per i numeri.

- Layout a due colonne su desktop (editoriale, sticky sinistra); una colonna
  su mobile con una barra fissa in fondo che rispecchia il prezzo consigliato
  e apre il report con un tap, sempre a portata mentre si scorre.
- Le opzioni (regime fiscale, obiettivo) sono righe con pallino, non pillole
  a card: meno rumore visivo, piu' vicino a un modulo che a un'app.
- Le quattro domande entrano in scena con una dissolvenza leggera
  (IntersectionObserver) in un secondo `<script>` separato e additivo, che
  legge il DOM ma non tocca la logica sopra: se quello script fallisse per
  qualsiasi motivo, calcolo e autosave restano intatti lo stesso.

## Verifiche fatte

- Suite Playwright completa (calcolo, IVA, autosave, cid, localStorage,
  sendBeacon, validazione): 24/24.
- Screenshot a 320px, 390px (mobile) e 1440px (desktop): un difetto trovato
  e corretto — l'etichetta "Camere da letto" andava a capo su due righe
  mentre "Posti letto" restava su una, disallineando le due colonne.
  Accorciato in "Camere letto" (coerente anche col nome del custom field
  GHL `Camere Letto`): ora entrambe su una riga a 390px, entrambe su due
  righe (simmetriche) a 320px.

## Cosa manca per essere pubblicabile, se si decide di procedere

Non e' stato verificato: contrasto colore in automatico (va controllato a
occhio con lo screenshot, il rosso su crema sembra a norma ma non e' stato
passato a uno strumento), performance reale del font Fraunces (un serif
variabile, piu' pesante di quello che serve solo per i numeri), test su
Safari iOS reale (qui verificato solo su Chromium).

## Il rischio che non risolve il design, lo risolve il traffico

La v2 attuale ha gia' portato 7 lead a completare il calcolatore, uno
diventato opportunita'. Un redesign, per quanto curato, e' un cambio di
esperienza su un funnel che sta convertendo: se si decide di procedere, il
modo piu' sicuro e' testarlo in parallelo (A/B) invece di sostituire la v2
di colpo, cosi' si vede se il numero di lead migliora o peggiora prima di
impegnarsi.
