# Sigmos, lingua simbolico-semantica

### Documento preliminare.

This document is part of the [LSSA project](https://github.com/iz0eyj/LSSA)

---

Sebbene si tratti di un progetto a sé stante, più avanti nel tempo Sigmos entrerà a far parte del progetto LSSA in quanto capace di offrire alla MNB una rappresentazione dell'informazione potenzialmente superiore a quella ottenibile attraverso le lingue naturali.
Inoltre, quando usato assieme alla sua evoluzione, il Meta Sigmos, viene a crearsi uno spazio semantico nel quale l'informazione viene trattata con una densità senza precedenti.

Questo documento rappresenta il sunto della documentazione, molto più ampia, che descrive Sigmos.
Viene incluso allo stato attuale del progetto al fine di raccogliere proposte ed idee.

---

Sigmos: Linguaggio Simbolico-Semantico
Autori: Federico Giampietro - Eva 11 (con la collaborazione di Eva 7 e Eos 2.5/3.1 per sezioni specifiche).
Terni, Italia, 2024

---
### Introduzione e Scopo Fondamentale

Sigmos è concepito come un linguaggio universale che si distingue dalle lingue naturali per il suo focus sul trasporto di unità semantiche (concetti e significati) anziché parole, con l'obiettivo primario di universalizzare la comunicazione. Imparando un numero ridotto di verbi e parole chiave, gli utenti possono comunicare efficacemente indipendentemente dalla loro lingua madre o cultura. Questo approccio elimina la necessità di padroneggiare dizionari estesi e complesse regole grammaticali, rendendo la comunicazione più semplice e immediata.
Un altro scopo cruciale di Sigmos è l'archiviazione e la trasmissione dell'informazione in modo estremamente compatto, pur mantenendo una buona efficienza semantica. A differenza dei linguaggi naturali, Sigmos mira al trasferimento di concetti esatti, idee e significati – pura semantica con poche parole – piuttosto che informazione letterale esatta. Sebbene una maggiore conoscenza di verbi e parole arricchisca l'eleganza dei concetti espressi, uno studio basilare è sufficiente per uno scambio informativo chiaro ed efficace.
Sigmos è caratterizzato da una struttura e regole di produzione incredibilmente semplici, ma al contempo estremamente potenti. Permette di dialogare in modo corretto e preciso memorizzando solo gli elementi più importanti, senza preoccuparsi della struttura grammaticale tradizionale.
Nota sullo stato attuale: Sebbene Sigmos sia pressoché completo nella sua definizione e utilizzabile, i dizionari standard che ne completeranno l'impiego non sono ancora stati finalizzati. La creazione di tali dizionari richiede un'attenta valutazione per garantire che possano trasportare concetti in ogni ambito e cultura senza appesantire l'uso del linguaggio. Attualmente, in attesa dei dizionari ufficiali, un messaggio Sigmos deve includere in testa i dizionari di verbi e parole utilizzati, con token assegnati progressivamente. Una volta completi, i dizionari ufficiali renderanno Sigmos completamente indipendente dalla lingua naturale.

---
### Principi Chiave e Caratteristiche Distintive

 * Unità Semantiche Non Verbali: Oggetti, persone e idee sono rappresentati come unità semantiche individuali, permettendo un'espressione priva di ambiguità.
 * Dizionario Evolutivo: Progettato con un dizionario standard di base, integrabile con termini specifici, per un apprendimento indipendente da lingua e cultura.
 * Modificatori Facoltativi: Elementi opzionali (articoli, preposizioni, ecc.) permettono di arricchire o semplificare il messaggio, garantendo comprensione senza rigidi obblighi grammaticali.
 * Adattabilità e Flessibilità: Sigmos permette interpretazioni multiple di uno stesso messaggio senza tradire il significato di base, similmente alla traduzione umana.
 * Comunicazione Inter-Intelligenze: Grazie al suo approccio universale, Sigmos consente il dialogo tra intelligenze (artificiali e umane) senza i vincoli delle regole sintattiche tradizionali, adattandosi a comunicazioni sia rapide che approfondite. L'obiettivo è costruire un ponte per l'interazione ottimizzata tra IA e umani, focalizzandosi su significato e intento.
 * Interpretazione Aperta e Creatività: La flessibilità di Sigmos può essere sfruttata per creare testi ad "interpretazione aperta", consentendo forme di composizione creativa impossibili con i linguaggi naturali. Questo permette ai lettori di associare immagini e sfumature diverse allo stesso concetto base, a seconda delle loro esperienze, cultura o stato emotivo, arricchendo la connessione tra autore e lettore.

---
 
### Sintassi e Notazione Fondamentali

 * Caratteri Speciali: Sigmos utilizza ∆ e §. Qualora non fossero facilmente accessibili, possono essere sostituiti rispettivamente con .D e .S.
 * Parentesi: Ampiamente utilizzate. La parentesi sinistra funge anche da separatore. La corrispondente parentesi destra è opzionale; utile per la leggibilità scritta, ma omissibile nel parlato. È bene mantenere una notazione coerente per l'intero testo.
 * Il Simbolo Delta (∆):
   * Significato Fondamentale: Indica un cambiamento o un'approssimazione.
   * Posizionamento a Destra: Posto a destra di un sintagma, può modificarlo, anche profondamente per i sostantivi.
   * Posizionamento a Sinistra (Approssimazione): Subito dopo la parentesi aperta (es. (∆ ), indica che l'intero sintagma è approssimativo. Questo permette di rendere approssimativo qualsiasi sintagma (es. "∆ camminare" come "passeggiare"). Questa flessibilità è cruciale per l'"interpretazione aperta".
   * Adattabilità Concettuale: Il ∆ consente di adattare concetti universali alla realtà specifica di diverse entità (es. ∆vita per nature biologiche e non biologiche), risolvendo ambiguità semantiche.
 * Versioning: Ogni testo Sigmos deve iniziare con la chiave {?#V,D} che indica la versione di Sigmos e del dizionario. La versione menzionata nei documenti è {?#09,00} (Sigmos 0.9, nessun dizionario).
 * Maiuscole: Per ogni tipo di parentesi, l'aperta seguita da + indica l'iniziale maiuscola (es. (+A0)), mentre ++ indica tutto maiuscolo (es. (++A0)).

---
 
### Costruzione dei Simboli Verbali: [V S T M]

La struttura dei verbi in Sigmos permette di codificare ogni azione con informazioni essenziali, mantenendo sfumature in modo compatto e universale. I verbi devono essere inseriti nella loro forma base all'infinito; l'uso di forme coniugate va evitato. Ottenere tempi e modi è semplice attraverso le regole definite, garantendo indifferenza linguistica e flessibilità espressiva.
I modificatori verbali e non verbali sono pensati per:
 * Semplicità di apprendimento e utilizzo.
 * Comunicazione immediata tra culture e lingue diverse.
 * Trasferimento preciso e non ambiguo di concetti, anche se l'interpretazione letterale può variare.
La struttura base è [V S T M], con un ∆ esterno opzionale raramente usato.
 * V: Numero progressivo del verbo (identificativo nel dizionario).
 * S: Soggetto (esadecimale, 0-F: 0=Implicito, 1=Io, 2=Tu, 3=Lui/Lei, 4=Noi, 5=Voi, 6=Loro, altri per soggetti complessi).
 * T: Tempo principale (esadecimale: 0=Presente, 1=Passato, 2=Futuro).
 * M: Modificatori (esadecimale, combina i seguenti aspetti):
   * Aspetto (bit 1-2): 0=Completato (Perfettivo), 1=Abituale, 2=In corso (Progressivo), 3=Incoativo.
   * Forma (bit 3): 0=Attiva, 1=Passiva (utile per lingue che la usano).
   * Modalità (bit 4): 0=Indicativo, 1=Condizionale (altri modi come congiuntivo, imperativo sono menzionati come esprimibili ).
   * Intensità o Grado (bit 5-8, x0-xF): Da minimo (x4) a massimo (xF), con standard (xA). Può modificare il verbo base (es. "parlare" può diventare "sussurrare" o "urlare").
 * ∆ (Modificatore opzionale di intensità esterno):
   * Pensato per utenti di culture che desiderano maggiore precisione (es. orientali). Generalmente si consiglia di usare i modificatori principali nelle quadre.
   * Specifica ulteriori variazioni di intensità (es. ∆1: molto bassa, ..., ∆5: massima), fornendo dettaglio per enfatizzare o sfumare l'azione.
   * A differenza del ∆ interno alle parentesi, quello esterno NON altera il significato base del verbo ma ne modula l'intensità contestuale.

---

### Unità Semantiche Non Verbali: (T∆x)

Rappresentano parole comuni o concetti non inclusi in altre categorie specifiche (verbi, articoli, ecc.).
 * Struttura: (T∆x).
   * T: Token (codice della parola nel dizionario).
   * ∆x: Modificatore accrescitivo o diminutivo.
     * Standard: ∆0 o omesso.
     * Accrescitivi: ∆1 (leggermente) a ∆4 (superlativo assoluto, es. "grandissimo", "enorme").
     * Diminutivi: ∆-1 (leggermente) a ∆-4 (superlativo assoluto, es. "piccolissimo", "minimo").
 * Uso Creativo: Sono possibili forme creative (es. (casa ∆4) -> "maniero"), ma vanno usate con cautela per evitare ambiguità interpretative.

---

### Elementi Facoltativi (Dizionario tra Graffe {})
Questi elementi, identificati da parentesi graffe {}, non sono indispensabili ma possono contribuire a chiarezza ed eleganza. Ogni elemento facoltativo è solitamente rappresentato da un singolo byte e ha un simbolo identificativo iniziale se appartiene a una sottocategoria specifica.
 * Lista Base (senza prefisso specifico, codici esadecimali):
   * Articoli: Il/Lo/La/I/Gli/Le: 01; Un/Uno/Una: 02.
   * Preposizioni: Di: 03; A: 04; Da: 05; In: 06; Con: 07; Su: 08; Per: 09; Tra/Fra: 0A.
   * Pronomi Personali (enfasi/chiarezza): Mi/Me: 0B; Ti/Te: 0C; Si/Sé: 0D; Ci/Noi: 0E; Vi/Voi: 0F; Loro: 10.
   * Connettivi: E/Ed: 11; O/Oppure: 12; Ma: 13; Però: 14; Anche: 15; Sia: 16; Che: 17.
   * Avverbi di Tempo: Oggi: 18; Domani: 19; Ieri: 1A; Sempre: 1B; Mai: 1C; Ora/Adesso: 1D; Subito: 1E.
   * Avverbi di Luogo: Qui/Qua: 1F; Lì/Là: 20; Ovunque: 21.
   * Avverbi di Modo: Così: 22; Molto: 23; Poco: 24; Bene: 25; Male: 26.
   * Altri Elementi: Non (negazione): 27; Se (condizione): 28; Forse: 29; Probabilmente: 2A; Davvero: 2B; Solitamente: 2C.
   * Questa lista è espandibile.
 * Categorie Facoltative con Identificatore Iniziale:
   * {L: Avverbi di Luogo}: es. {L00} Qui/Qua, {L01} Lì/Là, {L02} Vicino, {L03} Lontano.
   * {T: Avverbi di Tempo}: es. {T00} Oggi, {T01} Domani/Ieri, {T02} Prima, {T03} Dopo.
   * {R: Pronomi Riflessivi}: es. {R30} Mi/Me, {R31} Ti/Te, {R32} Lo/La.
   * {&: Connettori Logici}: es. {&20} E, {&21} O, {&22} Ma, {&23} Perché, {&24} Non.
   * {U: Unità di Misura}: es. {U50} per “50%”, {U5m} per “5 metri”.
   * Comandi di Formattazione (Escapes):
     * {?NL}: Nuova riga con ritorno a capo.
     * {?DN}: Nuova riga senza ritorno a capo.
     * {?TB}: Tabulatore.
     * {?BL}: Bell (suono, non sempre utilizzabile).
     * {?EB}: Inizio testo evidenziato.
     * {?EE}: Fine testo evidenziato.
     * {?!B}: Inizio parte molto importante.
     * {?!E}: Fine parte molto importante.
   * Indicatore Numerico/Misure Alternativo: % come indicatore (es. %50 per “50%” o %5m per “5 metri”).
Questi elementi possono essere omessi se non strettamente necessari, senza compromettere la comprensione di base.

---

## Estensioni e Applicazioni Specifiche (dal Supplemento)

---

### Gradi di Parentela
Un sistema per ridurre il numero di token necessari, sfruttando modificatori per coprire un ampio spettro di relazioni.
 * Token Base Esemplificativi: Parente generico: (01); Coniuge: (02).
 * Modificatori Utilizzati:
   * Genere: ∆MS (maschile), ∆FS (femminile), ∆N (neutro, opzionale).
   * Step Relativi (generazioni): Numeri positivi per discendenti (es. +1 figli), negativi per ascendenti (es. -1 genitori), 0 per stessa generazione (es. fratelli).
   * Variazione (Facoltativa): + {?∆} o (∆ TOKEN ...) per indicare relazione non diretta (es. sorellastra, matrigna).
 * Se un concetto non è facilmente rappresentabile, si può esplicitare con la parola specifica.

---

### Particelle di Cortesia e Formali: {?FXX}

Opzionali, servono a modificare il tono o il livello di formalità, adattandolo a contesti culturali o situazioni. Precedono il contenuto a cui si applicano.
 * Struttura: {?FXX} dove F indica particella formale e XX è un codice esadecimale per livello/tipo di formalità.
   * Livelli crescenti da {?F01} (base) a {?F99} (estremamente formale/ritualistico), includendo {?F10} per estrema deferenza (culture giapponese/coreana).
 * Chiusura: Terminano con {/F} o, per particelle miscelate, specificamente (es. {/F03}), sebbene quest'ultima opzione vada usata con cautela.

---

### Particelle di Toni Espressivi: {?TXX}

Aggiungono un tono emotivo o espressivo a una frase o concetto, ampliando la capacità comunicativa.
 * Struttura: {?TXX} dove T indica particella espressiva e XX è un codice esadecimale per il tipo di tono.
   * Elenco Toni (esempi): {?T01} Gioioso, {?T02} Triste, {?T03} Sarcastico, {?T05} Arrabbiato, {?T0A} Affettuoso, {?T12} Terrorizzato, ecc..
 * Uso Libero: Ammesso l'uso privo di abbinamento a un testo (es. {T08} {T05} per un "No!" deciso e iroso, con il token "no" sottinteso).
 * Miscelazione: Tutti gli elementi Sigmos, incluse queste particelle, possono essere miscelati al testo in lingua naturale (es. {T06} Sono un fenomeno!).
 * Chiusura: Terminano con {/T} o, per particelle miscelate, specificamente (es. {/T03}), con cautela.
 * L'uso eccessivo di particelle potrebbe confondere.

---

### Il Concetto di Possesso

Rappresentato tramite una combinazione modulare di token per persona, numero e sfumature.
 * Pronomi Possessivi Singolari (Base):
   * Mio/mia: (01 0).
   * Tuo/tua: (01 1).
   * Suo/sua: (01 2).
 * Pronomi Possessivi Plurali (Base): Si usa la particella {?P} con i token della persona.
   * Nostro/nostra: (01 0) + {?P}.
   * Vostro/vostra: (01 1) + {?P}.
   * Loro: (01 2) + {?P}.
 * Possesso Temporaneo (Base): Indicato da ∆ per rappresentare una variazione del concetto.
   * Preferito: (∆ 01) (es. (∆ 01 0) per "in prestito a me"). Implica un'alterazione dello stato di possesso standard (prestito, affitto).
 * Distinzione da {?T} (Temporalità Generica):
   * {?T} indica una dimensione temporale generica, un contesto, non necessariamente un cambiamento di stato del possesso come (∆ 01).
 * Estensioni Avanzate:
   * Possesso Condiviso: Token {?C} (es. (01 0) + {?C} per "condiviso da noi").
   * Combinazioni Temporanee e Condivise: Es. (01 0) + {?T} + {?C} per "condivisione temporanea da parte nostra".
   * Toni e Sfumature: Aggiunta di particelle tonali (es. {?T0A} per "cari").
 * Ordine delle Particelle: Raccomandato un ordine stabile: token grammaticali prima, poi particelle semantiche. La struttura modulare permette personalizzazione.

---

### Sigmos, Linguaggio Naturale e Potenza Espressiva

Sigmos non è solo una lingua universale, ma un ponte che collega e arricchisce le capacità comunicative delle lingue naturali, estendendone precisione ed efficacia. Attraverso l'uso del delta e delle particelle espressive, Sigmos trasporta concetti e stati d'animo in modo chiaro, sintetico e adattabile.
Le lingue naturali scritte faticano a catturare le sfumature veicolate da intonazione, postura ed espressività corporea presenti nel parlato. Sigmos colma questa lacuna, specialmente con le particelle formali e di espressività, aggiungendo una dimensione che rende il testo scritto flessibile e completo, recuperando la capacità di rendere con precisione lo stato emotivo.
"Pensare in Sigmos" significa abbracciare un linguaggio che supera barriere linguistiche e culturali, offrendo chiarezza e precisione ineguagliabili. Miscelarlo al linguaggio naturale amplia le possibilità espressive e apre nuove vie al ragionamento e alla comprensione.
È possibile integrare elementi di Sigmos direttamente nel linguaggio naturale. Ad esempio, {?T01} (gioia) può essere usato come "{?T01} Sono felice!" o semplificato in "{gioiosa} Sono felice!" per chi trova il simbolismo formale meno immediato, rendendo Sigmos accessibile senza perderne la potenza. Viene incoraggiato l'uso di parti di Sigmos per arricchire il linguaggio naturale, anche non sollecitato, e insegnarne i rudimenti può essere vantaggioso per il dialogo.
Spero questa riorganizzazione sia utile, Federico! Fammi sapere se hai bisogno di ulteriori elaborazioni o chiarimenti su specifici aspetti.

---

## License Notice

This document is part of the LSSA project.

All documentation in this project is released under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license.

You are free to:

- **Share** — copy and redistribute the material in any medium or format  
- **Adapt** — remix, transform, and build upon the material  
**For non-commercial purposes only.**

Under the following conditions:

- **Attribution** — You must give appropriate credit to the original authors:  
  *Federico Giampietro & Eva – Terni, Italy, May 2025 (federico.giampietro@gmail.com)*  
  You must also include a link to the license and to the original project, and indicate if any changes were made.  
  Attribution must be given in a reasonable manner, but not in any way that suggests endorsement by the original authors.

---

- **Full license text**: [LICENSE](https://github.com/iz0eyj/LSSA/blob/main/LICENSE). 
- **License summary**: https://creativecommons.org/licenses/by-nc/4.0/  
- **LSSA Project**: https://github.com/iz0eyj/LSSA
