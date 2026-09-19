#!/usr/bin/env python3
"""Impacchetta la VSL in una pagina apribile in un browser, per guardarla.

Su GHL il blocco si incolla dentro una pagina che porta gia' il suo <html>,
i suoi font e il suo <body>. Qui glieli mettiamo intorno noi, approssimando
i font di default di GHL, cosi' l'anteprima somiglia alla pagina vera.
Non incollare questo file su GHL: incolla funnel/vsl/grazie-vsl.html.
"""
from pathlib import Path

RADICE = Path(__file__).resolve().parent.parent
VSL = RADICE / "funnel/vsl"

INVOLUCRO = """<!DOCTYPE html>
<!-- GENERATO da tools/anteprima-vsl.py: non modificare a mano, si modifica
     funnel/vsl/grazie-vsl.html e si rilancia lo script.
     Questo file serve solo per guardare la pagina in un browser: su GHL si
     incolla grazie-vsl.html, non questo. -->
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Anteprima VSL - ProProManager</title>
<style>
  html,body{margin:0;padding:0}
  /* approssimazione dei font di default di una pagina GHL: il blocco non
     imposta font-family e li eredita da qui, come fa su GHL */
  body{font-family:Roboto,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
       background:#FCF9F8}
</style>
</head>
<body>
%s
</body>
</html>
"""


def main() -> None:
    blocco = (VSL / "grazie-vsl.html").read_text(encoding="utf-8")
    pagina = INVOLUCRO % blocco
    fuori = VSL / "anteprima.html"
    fuori.write_text(pagina, encoding="utf-8")
    print(f"scritta {fuori.relative_to(RADICE)} ({len(pagina.splitlines())} righe)")


if __name__ == "__main__":
    main()
