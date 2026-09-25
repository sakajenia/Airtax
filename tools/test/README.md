# Prove automatiche

Cinque file, si lanciano con node. Servono Playwright e Chromium, gia' presenti
nell'ambiente di sviluppo:

```
node tools/test/worker.mjs        # il Worker Cloudflare, senza toccare GHL
node tools/test/calcolatore.mjs   # calcolatore v2 in un browser vero
node tools/test/vsl.mjs           # pagina VSL + percentuale di video guardata
node tools/test/caso-studio.mjs   # i numeri che passano dal calcolatore alla VSL
node tools/test/conto-anno.mjs    # il conto annuo delle tasse che finisce nell'email
```

`caso-studio.mjs` serve le due pagine dalla **stessa** origine, come su
`tools.affittibreviaroma.com`: e' l'unico modo perche' condividano il
localStorage, ed e' esattamente il meccanismo che verifica.

`calcolatore.mjs` e `vsl.mjs` aprono la pagina in Chromium, sostituiscono
l'indirizzo del Worker con un finto server locale e controllano cosa arriva:
non scrivono mai niente su GHL. `vsl.mjs` legge `funnel/vsl/anteprima.html`,
quindi prima rigenerala con `python3 tools/anteprima-vsl.py`.

Nel sandbox le risorse esterne (font Google, logo sul CDN di GHL) non si
caricano: e' normale e le prove ne tengono conto.
