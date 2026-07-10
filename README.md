# SalvaGuadagno Host 🏠

Calcolatori in **singoli file HTML** (zero dipendenze, funzionano offline) che aiutano gli host Airbnb italiani a **non perdere guadagni** con il passaggio alla **commissione unica del 15,5% a carico dell'host**, annunciato per l'Italia (host senza channel manager) il **13 ottobre 2026**.

## Due versioni

### `index.html` — versione semplice (per tutti)

Tre passi guidati con bottoni grandi ed emoji, zero gergo fiscale, ma con tutta la sostanza:

1. **💶 Prezzo, notti, pulizie, notti/anno** — campi grandi con default sensati.
2. **🧾 «Come paghi le tasse sull'affitto?»** — cinque bottoni in linguaggio umano: una casa (cedolare 21%), due case (26%), dichiarazione normale (IRPEF, con la domanda *«quanto guadagni in totale all'anno?»* al posto dell'aliquota marginale), P.IVA forfettaria (con domanda start-up 5%/15%), impresa.
3. **🎯 «Cosa è più importante per te?»** — non perdere niente (netto invariato) / non spaventare gli ospiti / fare come dice Airbnb (con avviso su quanto ci perdi).

Risposta: numero gigante col nuovo prezzo (+ pulizie adeguate), quanto perdi se non fai nulla, rassicurazione sul prezzo visto dagli ospiti, tabelle «a soggiorno» e «in un anno», e i conti voce per voce in una sezione richiudibile.

### `avanzato.html` — versione avanzata

Per chi vuole il dettaglio completo:

1. Prenotazione tipo (prezzo/notte, notti, pulizie, notti/anno).
2. Regime fiscale esplicito (cedolare 21%/26%, IRPEF con aliquota marginale, forfettario 15%/5%, impresa).
3. Obiettivo: proteggere il **netto dopo le tasse** (consigliato), il payout Airbnb, o il prezzo totale per l'ospite.

Restituisce prezzo consigliato, confronto prima/dopo, proiezione annua, calcoli passo-passo, confronto tra regimi e opzioni avanzate (commissioni modificabili, IVA sulla fee).

Le due pagine si linkano a vicenda. Nessun dato viene raccolto o inviato: tutto il calcolo avviene nel browser, anche da file locale su smartphone.

## Perché «+15,5%» non basta

Le imposte italiane sugli affitti brevi (cedolare secca, IRPEF, forfettario) si calcolano sul **corrispettivo lordo** — il prezzo esposto, commissione inclusa (Circolare AdE 24/E/2017): la commissione Airbnb **non è deducibile** per i privati, e anche la ritenuta d'acconto del 21% è calcolata sul lordo. Alzando il prezzo aumentano quindi anche le tasse:

| Regime | Rincaro per non perdere il netto |
|---|---|
| Cedolare secca 21% | **+19,7%** |
| Cedolare secca 26% | **+21,4%** |
| IRPEF (marginale 33% + addizionali) | **+24,3%** |
| Forfettario 15% (coeff. 40%, IVA sulla fee in reverse charge) | **+20,3%** |
| Suggerimento di Airbnb (payout invariato) | +14,8% → **perdi comunque ~4% di netto** |

## Fatti verificati (luglio 2026)

- Commissione unica **15,5%** a carico host (range 14–16%; 16% Brasile/Messico); l'ospite non paga più commissioni. Fonte: [Airbnb, 7 lug 2026](https://www.airbnb.com/resources/hosting-homes/a/simplifying-service-fees-on-airbnb-771), [Airbnb Help art. 1857](https://www.airbnb.com/help/article/1857).
- Base di calcolo: subtotale (notti + pulizie + costi extra, dopo gli sconti, escluse tasse e cauzioni).
- Italia: passaggio per host senza PMS annunciato per il **13/10/2026**; host con PMS già passati il 13/04/2026. Le prenotazioni precedenti mantengono le vecchie commissioni.
- Ritenuta 21% (a titolo d'acconto dal 2024) calcolata **sul lordo prima della commissione**, pulizie incluse; non applicata a chi comunica la P.IVA. Fonte: [Airbnb Help art. 3527](https://www.airbnb.com/help/article/3527).
- Legge di Bilancio 2026 (L. 199/2025): cedolare **21% sul 1° immobile** (anche via piattaforma), **26% sul 2°**, **obbligo P.IVA dal 3°**; IRPEF 23/33/43%.

## Limiti

Strumento indicativo, **non è consulenza fiscale**. Non modella: imposta di soggiorno (partita di giro), contributi INPS fissi (forfettari/imprese), IMU e costi di gestione, sconti settimanali/mensili, co-hosting. Le aliquote sono costanti modificabili nelle «Opzioni avanzate». Non affiliato ad Airbnb.
