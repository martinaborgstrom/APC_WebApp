# APC_WebApp
Realizzazione di un'applicazione web relativa ad una pescheria:

<img width="3042" height="1561" alt="image" src="https://github.com/user-attachments/assets/45361917-8056-4372-bc40-2fe606b3209a" />

Attraverso questa application un:
- **ristorante**:
  - visualizza le pescherie presenti e i loro prodotti con rispettivi prezzi;
  - acquista un prodotto e riceve una mail di conferma dell'ordine;
- **pescheria**:
  - visualizza gli ordini effettuati;
- **fattorino**:
  - consulta il sito per avere una lista delle pescherie dalle quali prelevare i prodotti da consegnare;
  - contrassegna come terminato un ordine.

### How to start Web Application
Per l'avvio è richiesta l'installazione di:
- Node.js
- npm
- MongoDB Compass

Per utilizzare il database, è necessario creare la collection ```osolemio``` in MongoDB Compass.

Creare un file ```.env``` per le variabili d'ambiente contentente i seguenti elementi:
```
USERNAME = <username>
PASSWORD = <password>
SERVICE = <service>
```

Per avviare la web application è sufficiente accedere alla directory e avviare il progetto:
```
cd APC_WebApp
node server.js
```
