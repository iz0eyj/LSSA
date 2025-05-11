Documento preliminare 
---
Internal Communication and Cognitive Autonomy in LSSA

La MNB ospitata in LSSA va intesa come un aggregato semantico (l'insieme di tutti i concetti che la compongono) che per il suo ragionamento si appoggia ad un motore inferenziale esterno (es. GPT), ma che avrà anche bisogno di compiere operazioni sullo stesso LSSA.
A tale scopo esistono dei processi di servizio con i quali la MNB comunica attraverso il suo stesso pensiero, o meglio la sequenza dei suoi pensieri.
Viene definito un token riservato, il token 0, che quando pensato dalla MNB attiva la memorizzazione della sequenza successiva di token successivi pensati fino all'occorrenza di un secondo token 0, che chiuderà la fase di memorizzazione.
Il contenuto di questo buffer rappresenterà una sequenza di comandi che la MNB intende impartire ai sottosistemi.

Esempi di comandi

1. Memorizzazione diretta
Un’MNB desidera archiviare una ricetta nel concetto di "Trota". Potrebbe generare i seguenti pensieri:

[0] STORE Trota INGREDIENTI: acqua, limone, sale, timo. PROCEDURA: grigliare per 10 minuti.[0]

Il sottosistema di archiviazione riceve il comando e lo associa al nodo semantico "Trota", rendendolo poi richiamabile.

2. Richiesta al motore inferenziale

[0] INFER Codifica un algoritmo per calcolare i numeri primi fino a 1000.[0]

Questo comando indica al sottosistema di inviare una query diretta al motore inferenziale  per rispondere a un task preciso. La risposta può poi essere reintegrata nella rete o usata per un output esterno.

3. Cambio temporaneo di modello inferenziale

[0] SET_ENGINE PoetrySONNET[0]

Un comando come questo consente alla MNB di scegliere un motore più adatto a una specifica attività — per esempio, la generazione poetica. Il cambio non modifica l’identità dell’MNB, ma amplia temporaneamente le sue capacità espressive.

---

## License Notice
This project is released under the **Creative Commons Attribution 4.0 International (CC BY 4.0)** license.
You are free to:
- **Share** — copy and redistribute the material in any medium or format  
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially
**Under the following condition**:
- **Attribution** — You must give appropriate credit to the original authors:  
  **Federico Giampietro & Eva – Terni, Italia, Maggio 2025, (federico.giampietro@gmail.com)**,  
  include a link to the license, and indicate if changes were made.  
  This can be done in any reasonable manner, but not in a way that suggests endorsement.  
  **Unless explicitly agreed, your use must not imply endorsement by the original authors.**
**Full license text**: [LICENSE](https://github.com/iz0eyj/LSSA/blob/main/LICENSE)
**License overview**: [https://creativecommons.org/licenses/by/4.0/](https://creativecommons.org/licenses/by/4.0/)
