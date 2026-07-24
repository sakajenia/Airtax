# Consensi e note legali — Funnel Calcolatore

Testi **esatti** da incollare nei form e nelle pagine GHL del funnel
(`tools.affittibreviaroma.com`). Italiano, coerenti con GDPR / Reg. UE 2016/679
e Codice Privacy (D.lgs. 196/2003 agg. 101/2018).

> ⚠️ **AVVISO DI VALIDAZIONE LEGALE — leggere prima dell'uso.**
> Questi testi sono una **bozza tecnica predisposta da un agente automatico** e
> **NON sono stati validati da un avvocato o DPO**. Prima della messa online
> vanno **verificati e adattati da un legale**, in particolare per: ragione
> sociale e recapiti reali del Titolare, tempi di conservazione, elenco dei
> Responsabili e degli strumenti di tracciamento effettivamente attivi, basi
> giuridiche dei trasferimenti extra-UE. I placeholder tra `[ ]` sono
> obbligatori da compilare.

---

## (a) Consenso privacy — OBBLIGATORIO

Da inserire nel **form di registrazione** (pagina `/`) e nel **form report**
(modale su `/calcolatore`). Checkbox **non pre-spuntata**, campo **obbligatorio**.
Il link punta a `/privacy` e apre in nuova scheda.

**Testo label (HTML):**

```html
<span>Ho letto e accetto l'<a href="/privacy" target="_blank" rel="noopener">informativa sulla privacy</a> e acconsento al trattamento dei miei dati personali per ricevere il calcolatore e il report richiesto. <b>(obbligatorio)</b></span>
```

**Testo semplice (per campo consenso GHL):**

> Ho letto e accetto l'informativa sulla privacy e acconsento al trattamento
> dei miei dati personali per ricevere il calcolatore e il report richiesto.
> (obbligatorio)

---

## (b) Consenso marketing — OPZIONALE (non pre-spuntato)

Checkbox **separata**, **non obbligatoria**, **non pre-selezionata**. Non deve
mai condizionare l'accesso al calcolatore o l'invio del report (consenso libero,
art. 7 GDPR).

**Testo label (HTML):**

```html
<span>Acconsento a ricevere via Email e/o WhatsApp aggiornamenti sulle regole degli affitti brevi, consigli, novità e offerte del Titolare. <i>(facoltativo — puoi revocarlo quando vuoi)</i></span>
```

**Testo semplice (per campo consenso GHL):**

> Acconsento a ricevere via Email e/o WhatsApp aggiornamenti sulle regole degli
> affitti brevi, consigli, novità e offerte del Titolare. (facoltativo — puoi
> revocarlo quando vuoi)

---

## (c) Micro-nota sotto il bottone di invio

Testo rassicurante da mostrare subito sotto il pulsante di submit (registrazione
e report).

**Registrazione (`/`):**

> 🔒 Zero spam. I tuoi dati restano riservati, sono usati per darti il
> calcolatore e il report, e puoi cancellarti quando vuoi. Nessuna carta
> richiesta.

**Form report (modale su `/calcolatore`):**

> 🔒 Ti inviamo solo il report che hai chiesto, sul canale che scegli.
> Consulta l'[informativa privacy](/privacy). Puoi opporti o cancellarti in
> qualsiasi momento.

---

## (d) Cookie banner

Da usare nel banner cookie del sottodominio. Bottoni: **Accetta**,
**Rifiuta**, **Preferenze** (rifiuto facile quanto l'accetto — requisito Garante).

**Testo banner:**

> 🍪 Usiamo cookie tecnici necessari al funzionamento del sito e, **solo con il
> tuo consenso**, cookie di analisi e marketing per migliorare il servizio.
> Puoi accettarli tutti, rifiutare quelli non essenziali o scegliere le tue
> preferenze. Maggiori informazioni nell'[informativa privacy](/privacy).
>
> `[ Accetta ]  [ Rifiuta ]  [ Preferenze ]`

**Nota tecnica:** i cookie/script non essenziali (es. pixel, analytics) devono
essere caricati **solo dopo** il consenso. Il pulsante "Rifiuta" deve essere
visivamente equivalente ad "Accetta".

---

## (e) Disclaimer "non è consulenza fiscale"

Da mostrare nel **footer del calcolatore**, nella **pagina /grazie** e in cima
al **report** (Email e WhatsApp).

**Versione estesa (footer calcolatore / pagina):**

> ⚠️ I risultati sono **stime indicative** calcolate sui dati che inserisci e su
> assunzioni generali sui regimi fiscali italiani. **Non costituiscono
> consulenza fiscale, legale o professionale** e non sostituiscono il parere di
> un commercialista. Strumento non affiliato ad Airbnb.

**Versione breve (intestazione report / WhatsApp):**

> Stima indicativa, non è consulenza fiscale. Verifica sempre con il tuo
> commercialista. Non affiliato ad Airbnb.

---

## Checklist di compliance

Da spuntare con il Titolare / legale prima del go-live.

**Consensi e form**
- [ ] Consenso privacy e consenso marketing sono **due checkbox separate**.
- [ ] Nessuna checkbox è **pre-spuntata** (né privacy né marketing).
- [ ] Il consenso marketing è **facoltativo** e non blocca l'accesso al servizio.
- [ ] Il link all'informativa (`/privacy`) è presente e funzionante in ogni form.
- [ ] I campi raccolti nel form coincidono con quelli dichiarati in informativa
      (nome, cognome, telefono, email, dati d'uso calcolatore, canale report).

**Registro dei consensi (accountability, art. 7.1 GDPR)**
- [ ] GHL registra per ogni contatto: testo/versione del consenso, data/ora,
      valore (sì/no) di privacy e marketing, canale scelto (`canale_report`).
- [ ] È possibile dimostrare a posteriori **quando e a cosa** l'utente ha
      acconsentito.

**Doppio opt-in email — DA DECIDERE**
- [ ] Deciso se attivare il **double opt-in** (email di conferma prima di
      considerare valido l'iscritto marketing). *Non obbligatorio per legge ma
      fortemente consigliato per provare il consenso e la deliverability.*
- [ ] Se attivato: configurato in GHL il workflow di conferma.

**WhatsApp / Twilio**
- [ ] L'invio WhatsApp usa numero/mittente e template **approvati** (WhatsApp
      Business / Twilio).
- [ ] Presente meccanismo di **opt-out** (es. "rispondi STOP").
- [ ] Il consenso al canale WhatsApp è tracciato (campo `canale_report`).

**Informativa e responsabili**
- [ ] Ragione sociale, indirizzo, P.IVA, email/PEC del Titolare compilati.
- [ ] Eventuale **DPO** nominato e indicato (o confermato che non c'è).
- [ ] **DPA (accordo art. 28)** firmato con GoHighLevel e con Twilio.
- [ ] Base giuridica dei **trasferimenti extra-UE** (SCC / Data Privacy
      Framework) verificata con ciascun fornitore e citata in informativa.
- [ ] **Tempi di conservazione** definiti e inseriti (placeholder rimossi).

**Cookie**
- [ ] Cookie banner attivo con rifiuto facile quanto l'accetto.
- [ ] Script non essenziali caricati **solo dopo** consenso.
- [ ] **Cookie Policy** dettagliata (elenco cookie, finalità, durate) pubblicata
      e collegata.

**Diritti e trasparenza**
- [ ] Casella email per l'esercizio dei diritti attiva e presidiata.
- [ ] Link di disiscrizione presente in ogni email marketing.
- [ ] Disclaimer "non è consulenza fiscale" presente su calcolatore, /grazie e report.

**Validazione finale**
- [ ] Testi rivisti e approvati da **avvocato / DPO**.
- [ ] Data di "ultimo aggiornamento" dell'informativa allineata al go-live.

---

## Punti aperti da confermare con il Titolare

1. **Ragione sociale, indirizzo, P.IVA/C.F., email privacy e PEC** del Titolare
   (Cosmica Italia / ProProManager o altra società dietro affittibreviaroma.com).
2. **DPO**: nominato? Se sì, recapiti.
3. **Double opt-in email**: si attiva o no?
4. **Tempi di conservazione** effettivi per servizio e marketing (i valori in
   informativa sono placeholder, es. 24 mesi).
5. **Strumenti di tracciamento realmente attivi** (Google Analytics, Meta Pixel,
   tracking GHL…) da elencare in informativa e cookie policy.
6. **Base giuridica del trasferimento extra-UE** confermata da GoHighLevel e
   Twilio (SCC e/o Data Privacy Framework).
7. **DPA firmati** con GoHighLevel e Twilio.
8. Esistenza di un **provider email/SMTP** distinto da GHL da citare come
   Responsabile.
