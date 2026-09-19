#!/usr/bin/env python3
"""Inietta la sticky header di funnel/parti/sticky-header.html nelle pagine.

Una sola sorgente, tante copie: header e CTA cambiano in un punto solo.
Al primo giro sostituisce la vecchia header (o la inserisce dove indicato);
dai giri successivi in poi riscrive solo cio' che sta fra i due marcatori,
quindi si puo' rilanciare quante volte si vuole.
"""
import re
import sys
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
SNIPPET = RADICE / "funnel/parti/sticky-header.html"
INIZIO = "<!-- PPM-HEADER-START (generato da tools/applica-header.py) -->"
FINE = "<!-- PPM-HEADER-END -->"

# pagina -> (testo prima del quale inserire l'header se non c'e' gia',
#            dove deve puntare la CTA: None = lascia quello del sorgente)
CTA_DEFAULT = "https://tools.affittibreviaroma.com/grazie"
PAGINE = {
    "funnel/calcolatore-v2.html": ('<div class="wrap">', None),
    "funnel/avanzato.html": ('<header class="hero">', None),
    "avanzato.html": ('<header class="hero">', None),
    "ghl/avanzato.html": ('<header class="hero">', None),
    # sulla VSL la CTA non porta altrove: scorre al pulsante di prenotazione
    "funnel/vsl/grazie-vsl.html": (None, "#ppm-prenota"),
}

# la vecchia header a una sola colonna, da buttare
VECCHIA = re.compile(
    r'<header style="position:sticky;top:0;.*?</header>\n?',
    re.DOTALL,
)
GIA_FATTA = re.compile(re.escape(INIZIO) + r".*?" + re.escape(FINE) + r"\n?", re.DOTALL)


def main() -> int:
    sorgente = SNIPPET.read_text(encoding="utf-8").rstrip("\n")
    uscita = 0
    for relativo, (ancora, cta) in PAGINE.items():
        corpo = sorgente if cta is None else sorgente.replace(f'href="{CTA_DEFAULT}"', f'href="{cta}"')
        if cta is not None and f'href="{cta}"' not in corpo:
            print(f"  !! {relativo}: non ho trovato la CTA da ripuntare su {cta}")
            uscita = 1
            continue
        blocco = INIZIO + "\n" + corpo + "\n" + FINE + "\n"
        percorso = RADICE / relativo
        testo = percorso.read_text(encoding="utf-8")
        if GIA_FATTA.search(testo):
            nuovo, come = GIA_FATTA.sub(lambda _m: blocco, testo, count=1), "aggiornata"
        elif VECCHIA.search(testo):
            nuovo, come = VECCHIA.sub(lambda _m: blocco, testo, count=1), "sostituita la vecchia"
        elif ancora and ancora in testo:
            nuovo, come = testo.replace(ancora, blocco + ancora, 1), "inserita"
        else:
            print(f"  !! {relativo}: non so dove metterla (ancora '{ancora}' assente)")
            uscita = 1
            continue
        if nuovo != testo:
            percorso.write_text(nuovo, encoding="utf-8")
        print(f"  ok {relativo}: {come}")
    return uscita


if __name__ == "__main__":
    sys.exit(main())
