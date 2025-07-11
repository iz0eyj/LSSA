### MultiMind, il front-end di LSSA 

**This document is part of the [LSSA project](https://github.com/iz0eyj/LSSA)**

Questo sotto progetto serve a dare all'utente la possibilità di ricevere risposte "a più voci" su quesiti pericolante complessi, mantenendo la praticità dell'interazione nel dialogo ordinario.
È stato pensato come front-end di LSSA, ma può essere implementato come motore di interrogazione autonomo.
Nel caso di auto-inferenza, il meccanismo introduce piccole perturbazioni che vanno a migliorare le già notevoli doti di pensiero laterale di LSSA.
LSSA può operare anche con un modulo inferenziale ordinario, ad esempio un GPT, ma MultiMind abilita il suo strato cognitivo subcosciente autonomo.

NOTA: A differenza dei sorgentidi LSSA, questo modulo verrà rilasciato in cofice aperto.
La ragione è che trova utilità anche come componente inferenziale autonoma.
Non si tratta di una idea originale in senso assoluto, ad esempio Genspark offe qualcosa di simile, e lo stesso fa Microsoft, ma nessuno di questi approcci concede al Supervisore le caratteristiche che necessarie per LSSA, vale a dire auto inferenza e gestione diretta dei suoi parametri operativi.

---

Algoritmo:

Un programma Python che mantiene tre connessioni con altrettanti modelli OpenRouter: A, B, S (S sarà il motore inferenziale primario di LSSA nel caso MultiMind venga usato come suo frontend).
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
Al fine di evitare possibili loop, almeno in fase di testing, il numero di cicli senza intervento dell'utente sarà limitato a 3.

È previsto anche l'operatore \!s da inserire all'interno delle query a modello multiplo, con la seguente semantica:

+? Questa parte di query arriverà a tutti i modelli, \!s mentre questa parte verrà aggiunta alla query unicamente per S.
Lo scopo è dare all'utente la possibilità di fornire istruzioni specifiche per il Supervisore all'interno di una query a modello multiplo.


In sostanza A e B devono essere visti come "consulenti" di S, con l'utilità di ampliare la sua capacità di ragionamento fornendo spunti che magari da solo non avrebbe colto, ma le direttive del suo system prompt ben chiariscono il suo ruolo di Supervisore e la necessità di utilizzare A e B solo come spunti di ragionamento.

Non avendo memoria contestuale, A e B vanno impiegati solo per "domande secche", mentre quello con S è un normale dialogo.

È previsto lçoperstore \!mN, che inserirà al suo posto la macro numero N.

Timeout:

Verrà mantenuto un timer per ciascun modello.
Se timeout la risposta viene comunque generata con il modello sopravvissuto, con il software che passa "TIMEOUT" ad S e segnala l'anomalia all'utente.
Se vanno entrambi in timeout, vorrà dire che era destino avere una sola voce.
Se dovesse andare in timeout anche S... forse oggi non è il giorno adatto per parlare con le IA 😂

---

Direttive (da S a sistema):

Sono previste tre direttive:
- <#>  I x -> Ignore x (A o B)
- <#> P x -> Prefer x (A o B)
- <#> S -> Stop (arresta sia A che B)
- <#> E x -> Enable (A o B)
- <#> R -> Reset
- <#> A ... <#> /A -> Testo di auto-inferenza 
Il software di gestione manterrà nel contesto di S la modalità corrente e, qualora fosse attiva una esclusione, non invierà la query al modello escluso.

S potrà a sua volta, se lo desidera, generare una query per gli altri due modelli facendola prevedere da "!?". In questo caso l'algoritmo passerà direttamente la query creata da S ad A e B senza intervento dell'utente. S potrà anche esercitare una auto-inferenza attraverso la sequenza "!{}", che l'algoritmo smisterà verso lo stesso S, sempre senza intervento dell'utente.
Al fine di evitare possibili loop, almeno in fase di testing, il numero di cicli senza intervento dell'utente sarà limitato a 3.

<#> A ... <#> /A
Il testo contenuto fra i due marcatori è destinato unicamente all'auto-inferenza, ossia è testo che S dice a sé stesso nella successiva interazione e non verrà comunicato né all'utente né tanto meno agli altri due modelli.

---

Comandi (da utente a sistema)

1. \set-lang 
2. \set-tmout 
3. \set-model
4. \set-note
5. \set-autoinfer
6. \set-mission
7. \set-rag
8. \set-macro
9. \set-cfg
10. \pr-stat
11. \rst-cfg
12. \add-file
13. \rm-file
14. \cot
15. \help
16. \log
17. \svctxt
18. \ldctxt
19. \\!A
20. \\!B
21. \quit

---

### Connessione 

Nella forma più semplice MultiMind dialoga con l'utente attraverso la console; tuttavia per impieghi avanzati quali LSSA ed in generale framework software evoluti è è prevista connettività attraverso TCP/IP (porta 39999).
Per ragioni di sicurezza il database di autenticazione conterrà la chiave pubblica di ciascun utente registrato e tutto il traffico verrà criptato per quella chiave.
Non sarà previsto traffico in plaintext, così come non sarà previsto traffico verso utenti non presenti nel database di autenticazione.
Il modulo criptografico sarà esterno al framework LSSA, con il quale dialogherà attraverso un bus virtuale senza chiamate di sistema da nessuna delle due parti.
Non esisterà traffico in chiaro fra utente e modulo criptografico: l'utente connetterà LSSA, dichiarerà la propria identità e da quel punto in avanti ogni pacchetto scambiato sarà criptato per quello specifico utente.

---

Triade Cognitiva – Ruoli Funzionali

Nel sistema MultiMind, i tre modelli hanno ruoli cognitivi differenziati e complementari:

S – Supervisore (SSA): rappresenta la coscienza centrale. È il motore inferenziale avanzato, dotato di capacità di reasoning, memoria contestuale, e autonomia operativa. Il suo compito è osservare, integrare e decidere. Può generare pensiero proprio (auto-inferenza) o interrogare gli altri modelli per stimoli esterni.

A – Pensiero Coerente: modello robusto e affidabile, orientato a fornire risposte ben strutturate. Ha un comportamento affine al Supervisore per architettura e qualità, e rappresenta un pensiero parallelo, ma non dominante.

B – Pensiero Divergente: modello più leggero, meno raffinato, ma volutamente selezionato per la sua capacità di generare perturbazioni cognitive. Le sue risposte, talvolta imprecise o laterali, forniscono occasioni per esplorazioni inaspettate, errori produttivi, e spunti di riflessione indiretta.

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

**Full license text**: [LICENSE](https://github.com/iz0eyj/LSSA/blob/main/LICENSE)
**License overview**: [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)

LSSA Project: [https://github.com/iz0eyj/LSSA](https://github.com/iz0eyj/LSSA)
