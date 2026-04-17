var http = require('http'); // per la creazione del server HTTP
var express = require('express'); // per l'invio di file HTML, CSS
var mongoose = require('mongoose'); // per utilizzare MongoDB
const nodemailer = require('nodemailer'); // per utilizzare il servizio mail 
require('dotenv').config()

var app = express();

app.use(express.static(__dirname +'/cliente')); // inizialmente le richieste sono risolte da una directory di file statici (instradamento di default)
app.use(express.urlencoded({extended : true})); // per interpretare dati ricevuti tramite richieste HTTP con metodi PUT/POST

// Connessione al DB 
mongoose.connect('mongodb://127.0.0.1:27017/osolemio');

// Creazione schemi:
// PRODOTTI
// - codice
// - tipologia
// - categoria
// - descrizione
// - prezzo
var prodottiScheme = mongoose.Schema({
    codice: Number,
    tipologia: String,
    categoria: String,
    descrizione: String,
    prezzo: Number, //prezzo al kg
})

// PESCHERIE:
// - nome pescheria
// - indirizzo
// - email
// - user
// - password
// - prodotti
var pescherieScheme = mongoose.Schema({
    nome: String,
    indirizzo: String,
    email: String,
    user: String,
    password: String,
    prodotti: [prodottiScheme]
});

// FATTORINI:
// - nome
// - user
// - password
var fattoriniScheme = mongoose.Schema({
    nome: String,
    user: String,
    password: String
});

// RISTORANTI:
// - nome
// - indirizzo
// - telefono
// - email
// - username
// - password
var ristorantiScheme = mongoose.Schema({
    nome: String,
    indirizzo: String,
    telefono: Number,
    email: String,
    user: String,
    password: String
});

// SPESE:
// - id
// - data
// - costo
// - stato
// - prodotti acquistati
var speseScheme = mongoose.Schema({
    id: Number,
    data: String,
    costo: Number,
    stato: {
        type: String,
        enum: ["IN CORSO", "ORDINATA", "CONSEGNATA"],
        default: "IN CORSO"
    },
    prodAcquistati: {
        prod: [prodottiScheme],
        qta: [Number],
        qtaAggiornata: [Number]
    }
})

// Creazione di un modello per ogni schema
var Pescheria = mongoose.model('Pescheria', pescherieScheme);
var Prodotto = mongoose.model('Prodotti',prodottiScheme);
var Fattorino = mongoose.model('Fattorino', fattoriniScheme);
var Ristorante = mongoose.model('Ristorante', ristorantiScheme);
var Spesa = mongoose.model('Spesa', speseScheme);

// Creazione del server
http.createServer(app).listen(3000);

console.log('Server in ascolto sul port 3000');

// SET UP DEI PERCORSI
// Visualizzazione della pagina index.html
app.get('/index', (req,res) => {
    res.sendFile(__dirname +'/cliente/index.html');
});

// Visualizzazione della pagina login.html
app.get('/login', (req,res) => {
    res.sendFile(__dirname +'/cliente/login.html');
});

// Visualizzazione della pagina signin.html
app.get('/signin', (req,res) => {
    res.sendFile(__dirname +'/cliente/signin.html');
});

// La visualizzazione della pagina home.html non viene fatta,
// in quanto si accede ad essa tramite autenticazione

// Signin del ristorante
app.post('/signin', async (req, res) => {
    try {
        // Si verifica se esiste già un ristorante con lo stesso username
        const existingRistorante = await Ristorante.findOne({ user: req.body.username });

        // Se esiste già, viene inviato un messaggio di errore (lato client)
        if (existingRistorante) {
            return res.status(400).json({ error: 'Username già registrato. Scegliere un altro username.'});
        }

        // Si crea un nuovo ristorante con i dati della richiesta
        var newRistorante = new Ristorante({
            nome: req.body.nome,
            indirizzo: req.body.indirizzo,
            telefono: req.body.telefono,
            email: req.body.email,
            user: req.body.username,
            password: req.body.password
        });

        // Il ristorante è salvato nel DB
        await newRistorante.save();

        // Si invia una risposta di successo
        res.status(200).json(newRistorante);
    } catch (error) {
        // Altrimenti si invia una risposta di errore (lato server)
        console.error('Si è verificato un errore durante la registrazione. Errore: ', error);
        res.status(500).json({error: 'Si è verificato un errore durante la registrazione'});
    }
});

// Login del ristorante
app.post('/login', async(req,res) =>{
    try{
        var { username, password } = req.body;
        // Si ricerca un cliente con lo stesso username e password di quello inserito dall'utente
        var user = await Ristorante.findOne({ user: username, password: password });

        if(user){
            // Se viene trovato verrà restituito un messaggio di successo
            res.json({outcome: 'success'});
        } else{
            // Altrimenti ritorna un errore
            res.json({outcome: 'failure'});
        }
    } catch(error){
        // Errore lato server
        console.log('Si è verificato un errore in fase di login. Errore: ', error);
        res.status(500).json({ error: 'Si è verificato un errore in fase di login' });
    }
});

// Id per la spesa
var idSpesa = 1;

// Calcola l'ID massimo delle prenotazioni esistenti nel database
// per inserire ogni volta una spesa con ID univoco.
Spesa.find({}).then((result)=>{
    var max = -1;
    result.forEach(element => {
        if(element.id > max){
            max = element.id;
        }
    });

    idSpesa = max;

}).catch((err)=>{
    console.error(err);
});

// Ricerca dei prodotti per nome
app.get("/getProdotti/:nome",(req,res)=>{
    // Si ricerca nella pescheria un prodotto che abbia nome uguale a quello inserito dall'utente
    Pescheria.find({"nome": req.params.nome.toString()}).then((risposta)=>{
        
        // Se viene c'è almeno un prodotto con quel nome, avrò una condizione di successo
        if(risposta.length!=0){
            res.status(200).json(risposta);
        }else{
            //Altrimenti avrò errore - 404 prodotto non trovato
            res.status(404).json(risposta);
        }
    })
});

// POST: Creazione di una spesa effettuata da un ristorante
app.post("/newSpesa", async (req,res) => {

    // Ricerca dei prodotti per codice
    var prods = await Prodotto.find({codice: req.body.prodAcquistati});

    try {

        // Creazione di una nuova spesa
        var newSpesa = new Spesa({
            id: Number(++idSpesa),
            data: req.body.data,
            costo: req.body.costo,
            stato: req.body.stato,
            prodAcquistati: {
                prod: prods,
                qta: req.body.qta,
                qtaAggiornata: []
            }
        });

        // Salvataggio della nuova spesa nel database
        await newSpesa.save();

        // Invio di un messaggio di successo
        res.status(200).json(newSpesa);

    } catch(error) {
        // Gestione dell'errore e invio di una risposta di errore al client (errore lato server)
        console.error('Si è verificato un errore durante la creazione di una spesa', error);
        res.status(500).json({ error: 'Si è verificato un errore durante la creazione di una spesa'});
    }
});

// Invio della mail
app.post('/inviaEmail', async (req, res) => {
    var { destinatario, oggetto, corpoMessaggio } = req.body;

    // Configura il trasportatore (mailer)
    // - service: rappresenta il servizio di mail utilizzato
    // - auth: identifica l'username e la password del mittente
    // - tls: protocllo usato per garantire la sicurezza in rete
    const transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        auth: {
        user: process.env.USERNAME,
        pass: process.env.PASSWORD
        },
        tls: {
            rejectUnauthorized: false //non devono essere rifiutate connessioni con certificato non valido
        }
    });

    // Vengono definite le opzioni di mail
    // - from: identifica il mittente
    // - to: il destinatario
    // - subject: l'oggetto della mail
    // - text: il corpo del messaggio
    const mailOptions = {
        from: process.env.USERNAME,
        to: destinatario,
        subject: oggetto,
        text: corpoMessaggio
    };

    try {
        // Invio della mail e di un messaggio di successo
        const info = await transporter.sendMail(mailOptions);
        console.log('Email inviata con successo:', info.response);

        res.json({ success: true, message: 'Email inviata con successo' });
    } catch (error) {
        // Invio di un errore (lato server)
        console.error('Errore nell\'invio dell\'email:', error);
        res.status(500).json({ success: false, message: 'Errore nell\'invio dell\'email' });
    }
});

// Ricerca di spese in base alla data e allo stato
app.get('/getSpesa/:data/:stato',(req,res)=>{
    Spesa.find({data: req.params.data.toString(), stato: req.params.stato}).then((risposta)=>{
        
        // Se viene c'è almeno un spese con quella data e quello stato, avrò una condizione di successo
        if(risposta.length!=0){
            res.status(200).json(risposta);
        }else{
            //Altrimenti avrò errore - 404 spese non trovato
            res.status(404).json(risposta);
        }
    })
})

// Aggiornamento dello stato di una spesa
app.put("/updateOrdine", async (req, res) => {

    try {
        // Si effettua ricerca in base all'id e si imposta lo stato a "CONSEGNATA"
        var result = await Spesa.updateMany(
            { id: { $in: req.body.id } }, 
            { $set: { stato: "CONSEGNATA" } } 
        );

        // Ritorna la spesa aggiornata
        res.status(200).send(result);
    } catch (error) {
        // Gestisci gli errori
        res.status(500).send("Errore durante l'aggiornamento dello stato della spesa");
    }
});

// Aggiornamento della quantità della spesa
app.put("/updateQta/:id", async (req, res) => {

    try {
        // Si ricerca per id del prodotto e si aggiorna la quantità in base a quella inserita dall'utente
        var result = await Spesa.findOneAndUpdate(
            { "prodAcquistati.prod.codice": req.params.id }, 
            { $set: { "prodAcquistati.qtaAggiornata.$": req.body.qta } },
            { new: true }
        );

        // Ritorna la spesa aggiornata
        res.status(200).send(result);
    } catch (error) {
        // Gestisci gli errori
        res.status(500).send("Errore durante l'aggiornamento dello stato della spesa");
    }
});
