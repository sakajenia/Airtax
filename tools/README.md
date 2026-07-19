# tools/ghl-cli.mjs — CLI GHL per il funnel Calcolatore

Sottile wrapper sull'API REST HighLevel. **Nessun segreto nel repo**: il token
arriva da variabili d'ambiente e resta in un file gitignored fuori dal codice.

## Uso

```bash
export GHL_TOKEN='pit-...'                 # Private Integration Token del sub-account
export GHL_LOCATION='E1HO8PRyWf2yGaTFLuLC'  # Location Id (Propromanager)

node tools/ghl-cli.mjs verify         # controlla token + location
node tools/ghl-cli.mjs list-fields    # elenca i custom field contatto (nome -> key -> id)
node tools/ghl-cli.mjs create-fields  # crea i 9 custom field del calcolatore (idempotente)
node tools/ghl-cli.mjs test-contact   # upsert contatto di test coi 9 campi valorizzati
node tools/ghl-cli.mjs status         # quanti dei 9 campi sono presenti
```

## Cosa automatizza (limiti dell'API GHL)

L'API REST di HighLevel consente di creare **custom field**, **contatti/opportunità/tag**.
NON consente di creare **form**, **workflow**, **funnel/pagine**, **pipeline** né di
gestire il **DNS**: quelle restano operazioni manuali nella dashboard (vedi
`funnel/GUIDA-SETUP-GHL.md`). Questo vale per qualsiasi strumento — MCP, CLI o curl —
non è un limite del CLI.

## Sicurezza

- Il token NON è mai committato: `.ghl-token` e `.ghl-location` sono in `.gitignore`.
- Il token dà accesso al sub-account: **ruotalo/revocalo** in GHL (Settings →
  Private Integrations) quando non serve più.
