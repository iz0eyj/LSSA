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
