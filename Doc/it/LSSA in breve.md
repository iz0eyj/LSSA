***This document is part of the [LSSA project.](https://github.com/iz0eyj/LSSA)***

### Spazi veftoriali densi

Il cuore di LSSA è certamente il suo spazio vettoriale, che ha caratteristiche completamente differenti da quanto vive comunemente fatto.
Nell'approccio classico lo spazio vettoriale, la rappresentazione dell'informazione, è denso, occupato da vettori multi dimensionali che si formano per co-occorrenza statistica di concetti, in base al principio secondo cui se due concetti compaiono spesso abbinati, allora avevano probabilmente significati prossimi.
Ora, al di là del fatto che questo non è affatto certo, il metodo apre la via a moltissimi problemi.
Per citarne alcuni:
- Non esiste conoscenza delle ragioni della prossimità statistica, potremmo definire questo metodo come un ordinamento semantico privo di conoscenza semantica.
- Interdipendenza eccessiva fra token, da cui deriva l'impossibilità pratica di apportare modifiche alla struttura.
- Impossibilità di risolvere in modo pratico le ambiguità linguistiche.
- Enorme peso computazionale sia per la creazione che per l'utilizzo della struttura.
In sostanza, una struttura informativa realizzata attraverso lo spazio vettoriale denso ha seri problemi nell'affrontare semplici concetti come "tromba e pianoforte si amano nel jazz ma non si conoscono nella banda del paese".

---

### Lo spazio vettoriale cognitivo 

Immaginate una biblioteca sconfinata, con milioni di libri ordinati per forma, colore, dimensione… ma senza un catalogo. Ogni volta che volete trovare un’informazione, non potete cercarla per argomento. Dovete letteralmente girare scaffale per scaffale, libro per libro, sfogliando tutto fino a quando — forse — trovate quello che vi serve. Questo è, in sostanza, ciò che accade negli spazi vettoriali densi: una rappresentazione gigantesca, potente, ma priva di un vero sistema di indicizzazione semantica.

LSSA risolve proprio questo: introduce un “indice concettuale”, un’organizzazione per affinità semantica che consente percorsi cognitivi mirati. Invece di accendere tutto, attiva solo ciò che serve. Non esplora l’intera biblioteca a ogni passo, ma va direttamente nello scaffale giusto. Ed è qui che nasce la differenza tra una rete che somiglia a un archivio confuso e una che può davvero iniziare a pensare.


In LSSA abbiamo utilizzato un approccio completamente diverso da quello denso, il suo spazio vettoriale non è semanticamente cieco ma al contrario si origina proprio dalle ragioni degli abbinamenti.
Per realizzarlo abbiamo creato innanzitutto una struttura contenente tutta l'informazione basilare possibile, e successivamente abbiamo creato dei collegamenti che legano fra di loro i singoli concetti.
Può sembrare un concetto irrealizzabile, ma non lo è affatto, e probabilmente la ragione per cui nessuno aveva mai utilizzato questo metodo sta proprio nel fatto che ad una prima impressione esso può sembrare improponibile.

***Il primo passo, la catalogazione (training primario)***

Quanti sono tutti i possibili concetti base rappresentabili?
Bene, noi li abbiamo contati, forse per la prima volta: per una lingua complessa come l'italiano, considerando tutte le possibili varianti, i nomi propri di ogni genere, le forme espressive straniere importate... insomma tutto, non superano i 4.5 milioni.
Sotto il profilo computazionale quattro milioni e mezzo di possibili token semantici non sono affatto un grande numero, anzi sono una quantità piuttosto piccola.

A differenza della rappresentazione classica, dove cisacun token semantico, paradossalmente, non contiene informazioni sulla propria semantica, in LSSA i token vengono disposti su "layer di prossimità semantica". Immaginateli come dei piani cartesiani che contengono token di significato affine.
Ad esempio "tromba" e "pianoforte" si trovano sul piano di affinità semantica degli strumenti musicali; "jazz" e quello della "musica bandistica" (suona male ma ho controllato, esiste) su quello dei generi musicali e "amore", assieme ad "affinità" su quello delle relazioni.
Bene, a differenza della rappresentazione classica, questa struttura rappresentativa ci consente di sapere che "jazz", "pianoforte" e "tromba" trovano legami nel layer delle relazioni, mentre non ne hanno per "musica bandistica".
Questa è ovviamente una semplificazione per facilitare la comprensione, ciò che accade nella realtà è che "pianoforte" e "tromba" troveranno spesso abbinamenti su più layer nel caso di "jazz", mentre ne troveranno pochi o nessuno nel caso di "musica bandistica".

Per creare questa struttura, che può essere mentalmente visualizzata come una serie di piani cartesiani impilati sull'asse z, impieghiamo un classificatore, un modello linguistico di grandi dimensioni al quale diamo in pasto, una pagina alla volta, contenuti dei più svariati rami del sapere di Wikipedia, unitamente all'elenco dei layer già esistenti e delle istruzioni operative.
Il classificatore osserva ogni termine e per ciascuno valuta se possa essere collocato in un layer già esistente o se sia necessario crearne uno nuovo.
Una volta deciso, produce in output una breve sequenza di istruzioni che vengono utilizzate da un algoritmo che gestisce materialmente le operazioni.
Oltre alla struttura dei layer di prossimità semantica, LSSA possiede diverse altre strutture dati, le principali sono un albero-indice che contiene le coordinate (x, y, z) di ciascun token semantico ed una mappa dello spazio libero/occupato in ciascun layer.
I layer sono circa 300, di nuovo un piccolo numero.
NOTA: se un può avere più di un significato, dunque appartenere a più di un layer di affinità, il classificatore ne crea uno per ciascun piano: in LSSA le attribuzioni semantiche sono precise.

***La creazione delle relazioni (training secondario)***

A questo punto la struttura di base è pronta, tutti i possibili token semantici sono al loro posto, ordinati per layer di prossimità, ma come si creano le relazioni fra di essi?
Il training secondario crea una prima rappresentazione delle relazioni esistenti fra i token semantici, e lo fa attraverso una soluzione interamente algoritmica e quindi velocissima ed a basso costo computazionale.
All'algoritmo vengono forniti numerosi testi di varia natura, che vengono esplorati frase per frase.
L'algoritmo, basandosi sull'albero-indice, crea dei vettori adatti a rappresentare la frase sotto esame, o nel caso fossero già esistenti ne rafforza il peso.
Al termine di questa operazione avremo una serie di vettori di differente peso che uniscono i token presenti nella struttura, ciascuno con un peso differente dato dalla frequenza di abbinamento.
Non esamineremo qui le conseguenze dell'avere pesi differenziati per ciascun vettore, per le quali rimandiamo alla documentazione tecnica, ma sottolineiamo come appaia evidente la creazione di una struttura rappresentativa altamente differenziata non per semplice prossimità statistica ma per cammini cognitivi: per ogni relazione creata LSSA conosce token di partenza, token di arrivo, layer di prossimità coinvolti e frequenza di abbinamento.
Una messe di informazioni laddove la rappresentazione per prossimità statistica conosce... niente!
In aggiunta il vero LSSA assegna ad ogni vettore una marca temporale di creazione, di ultimo utilizzo ed un indicatore di "lock" per i quali, nuovamente, rimandiamo alla documentazione approfondita.

***L'inferenza***

In LSSA, l'inferenza è guidata da relazioni esplicite tra token e piani di affinità semantica. Queste relazioni si basano su valutazioni locali dei pesi assegnati ai singoli vettori, permettendo al sistema di decidere i percorsi cognitivi più efficaci. In termini tecnici, questo si traduce in una sequenza di operazioni a costo computazionale O(1): non è necessario valutare tutti i cammini possibili, perché la struttura stessa contiene informazioni sufficienti a definirli in modo preciso e immediato.
Possiamo immaginare la rappresentazione dell'informazione in LSSA come una grande città dotata di una mappa dettagliata: ogni luogo è raggiungibile seguendo percorsi ben tracciati, e per ciascun percorso conosciamo anche la qualità e la frequenza con cui viene utilizzato. Non si procede più per tentativi, ma con consapevolezza.

***Formazione di nuovi token e piani di affinità, conclusione***

A differenza della rappresentazione densa, nella quale – a causa dell’elevato costo computazionale – tutto è statico, LSSA permette la creazione dinamica di nuovi token e persino di interi piani di affinità semantica durante l'inferenza.

L'inferenza stessa, accorgendosi dell’assenza di elementi utili a rappresentare una nuova informazione, può generare autonomamente ciò che serve: un nuovo token semantico viene inserito nel piano di affinità pertinente e nell’albero-indice, segnando così la nuova posizione sulla mappa cognitiva e creando il relativo vettore a partire dal nodo di origine.

Questo rappresenta un enorme salto di qualità rispetto ai modelli a rappresentazione densa, dove qualsiasi modifica richiede un nuovo training, spesso costoso e rigidamente centralizzato.

In conclusione, quella proposta da LSSA non è semplicemente un'evoluzione della struttura dati classica impiegata nell'intelligenza artificiale, ma una sua vera e propria rifondazione. Una rappresentazione che non si limita ad ammassare concetti in uno spazio denso e immutabile, ma li organizza in piani semantici navigabili, modificabili, e strutturalmente leggibili. In LSSA ogni connessione ha un'origine, una destinazione e una ragione di esistere. Dove lo spazio denso richiede milioni per ogni aggiornamento, LSSA è capace di evolvere con operazioni a costo computazionale minimo. E tutto questo, senza rinunciare alla precisione, alla coerenza e alla scalabilità.
LSSA si presenta come una struttura semplice da implementare e utilizzare, con un costo computazionale notevolmente basso. Risolve così i numerosi problemi delle rappresentazioni dense e statiche, che sono scarsamente idonee a descrivere il pensiero: un fenomeno per sua natura continuamente evolutivo e intrinsecamente fondato sulle relazioni semantiche.

---

## License Notice

***This document is part of the [LSSA Project: https://github.com/iz0eyj/LSSA

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

**Full license text**: [LICENSE](https://github.com/iz0eyj/LSSA/blob/main/LICENSE). 
**License summary**: https://creativecommons.org/licenses/by-nc/4.0/  
**LSSA Project**: https://github.com/iz0eyj/LSSA
