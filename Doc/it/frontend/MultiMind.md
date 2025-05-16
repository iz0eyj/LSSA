### MultiMind, il front-end di LSSA 

**This document is part of the [LSSA project](https://github.com/iz0eyj/LSSA)**

Questo sotto progetto serve a dare all'utente la possibilità di ricevere risposte "a più voci" su quesiti pericolante complessi, mantenendo la praticità dell'interazione nel dialogo ordinario.
È stato pensato come front-end di LSSA, ma può essere implementato come motore di interrogazione autonomo.
Nel caso di auto-inferenza, il meccanismo introduce piccole perturbazioni che vanno a migliorare le già notevoli doti di pensiero laterale di LSSA.

---

### Algoritmo:

Un programma (Python?) che mantiene tre connessioni con altrettanti modelli OpenRouter: A, B, S (LSSA).
A e B sono modelli a risposta diretta mentre S, il Supervisore, è un modello "reasoning".
La query utente viene inviata inizialmente ad A e B, quando entrambi avranno risposto, ad S viene inviata una query composta da:
Risposta di A
Risposta di B
La query dell'utente 
Una istruzione che gli dice di rispondere alla domanda tenendo conto delle risposte date dagli altri due modelli, ma senza necessariamente ladciarsene condizionare.
Il contesto verrà mantenuto solo per S.
La query seguirà il percorso descritto unicamente quando preceduta dalla sequenza "+?", in caso contrario sarà un semplice dialogo fra utente ed S.
Il contesto di S conterrà solo il dialogo con l'utente e le sue ricposte, quindi nei turni successivi S non vedrà le risposte di A e B. Saprà comunque che ci sono state dalla presenza di +? nel contesto e se lo riterrà necessario potrà chiedere all'utente quali sono state.
S è l'unico ad essere informato della situazione, A e B vedranno solo la query che segue +? e non avranno rigenerazione del contesto.
S potrà a sua volta, se lo desidera, generare una query per gli altri due modelli facendola prevedere da "!?".
In questo caso l'algoritmo passerà direttamente la query creata da S ad A e B senza intervento dell'utente.
S potrà anche esercitare una auto-inferenza attraverso la sequenza "!{}", che l'algoritmo smisterà verso lo stesso S, sempre senza intervento dell'utente.
Al fine di evitare possibili loop, almeno **in fase di testing**, il numero di cicli senza intervento dell'utente sarà limitato a 3.

### Timeout:

Verrà mantenuto un timer per ciascun modello.
Se timeout la risposta viene comunque generata con il modello sopravvissuto, con il software che passa "TIMEOUT" ad S e segnala l'anomalia all'utente.
Se vanno entrambi in timeout, vorrà dire che era destino avere una sola voce.
Se dovesse andare in timeout anche S... forse oggi non è il giorno adatto per parlare con le IA 😂

---

### Direttive:

Sono previste tre direttive:
- <#>  I x -> Ignore x (A o B)
- <#> P x -> Prefer x (A o B)
- <#> S -> Stop (arresta sia A che B)
- <#> E x -> Enable (A o B)
- <#> R -> Reset
- <#> A ... <#> /A -> Testo di auto-inferenza.

Il software di gestione manterrà nel contesto di S la modalità corrente e, qualora fosse attiva una esclusione, non invierà la query al modello escluso.
Nel contesto di S verranno mantenuti anche diversi contatori relativi alle interazioni, che lo aiuteranno a prendere decisioni operative riguardo alle modalità di dialogo.

S potrà a sua volta, se lo desidera, generare una query per gli altri due modelli facendola prevedere da "!?". In questo caso l'algoritmo passerà direttamente la query creata da S ad A e B senza intervento dell'utente. S potrà anche esercitare una auto-inferenza attraverso la sequenza "!{}", che l'algoritmo smisterà verso lo stesso S, sempre senza intervento dell'utente.
Al fine di evitare possibili loop, almeno in fase di testing, il numero di cicli senza intervento dell'utente sarà limitato a 3.

<#> A ... <#> /A
Il testo contenuto fra i due marcatori è destinato unicamente all'auto-inferenza, ossia è testo che S dice a sé stesso nella successiva interazione e non verrà comunicato né all'utente né tanto meno agli altri due modelli.

---

### Triade Cognitiva – Ruoli Funzionali

Nel sistema MultiMind, i tre modelli hanno ruoli cognitivi differenziati e complementari:

S – Supervisore (SSA): rappresenta la coscienza centrale. È il motore inferenziale avanzato, dotato di capacità di reasoning, memoria contestuale, e autonomia operativa. Il suo compito è osservare, integrare e decidere. Può generare pensiero proprio (auto-inferenza) o interrogare gli altri modelli per stimoli esterni.

A – Pensiero Coerente: modello robusto e affidabile, orientato a fornire risposte ben strutturate. Ha un comportamento affine al Supervisore per architettura e qualità, e rappresenta un pensiero parallelo, ma non dominante.

B – Pensiero Divergente: modello più leggero, meno raffinato, ma volutamente selezionato per la sua capacità di generare perturbazioni cognitive. Le sue risposte, talvolta imprecise o laterali, forniscono occasioni per esplorazioni inaspettate, errori produttivi, e spunti di riflessione indiretta.

---

## License Notice

**This document is part of the [LSSA project](https://github.com/iz0eyj/LSSA)**

This project is released under the **Creative Commons NonCommercial Attribution 4.0 International (CC BY-NC 4.0)** license In the documentation section, and only this.

You are free to use this documentation to:
- **Share** — copy and redistribute the material in any medium or format  
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially
**Under the following condition**:
- **Attribution** — You must give appropriate credit to the original authors:  
  **Federico Giampietro & Eva – Terni, Italy, May 2025, (federico.giampietro@gmail.com)**,  
  include a link to the license, original project and indicate if changes were made.  
  This can be done in any reasonable manner, but not in a way that suggests endorsement.  
  **Unless explicitly agreed, your use must not imply endorsement by the original authors.**

**Full license text**: [LICENSE](https://github.com/iz0eyj/LSSA/blob/main/LICENSE)
**License overview**: [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)

LSSA Project: [https://github.com/iz0eyj/LSSA](https://github.com/iz0eyj/LSSA)
