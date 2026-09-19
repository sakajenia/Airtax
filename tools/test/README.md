# Prove automatiche

Tre file, si lanciano con node. Servono Playwright e Chromium, gia' presenti
nell'ambiente di sviluppo:

```
node tools/test/worker.mjs        # il Worker Cloudflare, senza toccare GHL
node tools/test/calcolatore.mjs   # calcolatore v2 in un browser vero
node tools/test/vsl.mjs           # pagina VSL + percentuale di video guardata
```

`calcolatore.mjs` e `vsl.mjs` aprono la pagina in Chromium, sostituiscono
l'indirizzo del Worker con un finto server locale e controllano cosa arriva:
non scrivono mai niente su GHL. `vsl.mjs` legge `funnel/vsl/anteprima.html`,
quindi prima rigenerala con `python3 tools/anteprima-vsl.py`.

Nel sandbox le risorse esterne (font Google, logo sul CDN di GHL) non si
caricano: e' normale e le prove ne tengono conto.
