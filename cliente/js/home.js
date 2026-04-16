var main = ()=>{
    // Elementi del DOM
    var $cont = $('<ul>')
    const $nomiPescherie = ['Addor e mar','La rete di Maradona','Mare in tavola','Mare Nostrum','Vir o mar quant è bell']
    var $labelPescheria = $('<label class="labelPescheria">').text("Pescheria: ")
    var $select = $('<select name="select-pescheria">')
    var $btn = $('<button>').text("Ricerca prodotti")
    var $email = $('<input>');

    // Inserimento degli elementi nella select
    for(var i = 0; i < $nomiPescherie.length; i++){
        var $option = $('<option>').text($nomiPescherie[i])
        $select.append($option)
    }

    $(".tabs a span").toArray().forEach(function(element) {
        var cartItems = [];         // Array per memorizzare i prodotti nel carrello
        var id = [];                // Array per memorizzare gli id selezionati
        var qtaTot;                 // Variabile che tiene conto della quantità dei dati
        var productId;              // Id del prodotto selezionato
        var obj = {};               // Variabile associata ad un prodotto
        var click = {};             // Variabile che tiene conto di quante volte un prodotto è stato rimosso/aggiunto
        
        var $element = $(element);  // Per la gestione dei tab
        var oneTime = false;        // Per effettuare le operazioni presenti nel forEach una sola volta
        
        $element.on("click", function() {
            // Gestione del tab attivo
            $(".tabs a span").removeClass("active");
            $element.addClass("active");

            // Pulizia del contenuto inserito nel main
            $('.products').empty()
            $('.cart').hide()
            $('.fattorino').empty()
            $('.notify').empty()
            $('.camioncino').hide()
            $('.work_in_progress').hide()
            $('.camioncino').empty()
            $('.work_in_progress').empty()

            // RISTORANTE
            // Il ristorante può ricercare i prodotti delle singole pescherie ed effettuare un ordine,
            // una volta terminato quest'ultimo il sistema invierà al ristorante una mail con le 
            // informazioni dell'ordine
            if ($element.parent().is(":nth-child(1)")) {
                // Visualizzazione degli elementi precedentemente nascosti
                $('.products').show()
                $('.notify').show()
                $('.cart').show()
                
                // Inserimento dinamico degli elementi
                $('.products').append($labelPescheria).append($select).append($btn)

                // Alla pressione del bottone ricerca prodotti, vengono cancellati gli elementi della ricerca
                // per lasciare spazio ai prodotti da visualizzare
                $btn.on("click",()=>{
                    $labelPescheria.hide()
                    $select.hide()
                    $btn.hide()
                    // Al click del bottone viene effettuata una richiesta AJAX che passerà come parametro
                    // la pescheria selezionata dall'utente. Sulla base di questa richiesta lato server, si
                    // ricercheranno i prodotti che hanno come nome quello della pescheria inserita dall'utente
                    // In caso di successo verranno stampati a video in caso di insuccesso, verrà mostrato un 
                    // messaggio
                    $.ajax({
                        method: "GET",
                        dataType: "json",
                        url: "/getProdotti/"+$select.val(),
                        data: $select.val()
                    }).then((prods)=>{
                        
                        // Scorrimento dell'array
                        prods.forEach((prodotto)=>{
                            
                            prodotto.prodotti.forEach((prodottoSingolo) => {
                                // Per l'inserimento della foto del prodotto, è necessario assegnare la giusta estensione
                                var estensioneFoto;
                                if(prodottoSingolo.descrizione === "Alici" || prodottoSingolo.descrizione === "Sogliola" || prodottoSingolo.descrizione === "Vongole"){
                                    estensioneFoto = ".webp"
                                } else if(prodottoSingolo.descrizione === "Cozze"){
                                    estensioneFoto = ".jpeg"
                                } else if(prodottoSingolo.descrizione === "Granchio" || prodottoSingolo.descrizione === "Polpo"){
                                    estensioneFoto = ".jpg"
                                }

                                // Stampa degli elementi
                                var $img = $("<li><img src='img/" + prodottoSingolo.descrizione + estensioneFoto + "'>");
                                var $codice = $("<li>").text("Codice: " + prodottoSingolo.codice);
                                var $tipologia = $("<li>").text("Tipologia: " + prodottoSingolo.tipologia);
                                var $categoria = $("<li>").text("Categoria: " + prodottoSingolo.categoria);
                                var $descrizione = $("<li class='description'>").text("Descrizione: " + prodottoSingolo.descrizione);
                                var $costo = $("<li class='price'>").text("Costo: €" + (prodottoSingolo.costo).toFixed(2));
                        
                                // Aggiunta degli elementi della lista
                                $cont.append($img).append('<br>').append($codice).append($categoria).append($tipologia).append($descrizione).append($costo).append("<br>").append('<li><button class="add-to-cart" data-product-id=' + prodottoSingolo.codice + '><ion-icon name="cart-outline"></ion-icon>').append("<br>");
                            
                                // Alla pressione del pulsante si procede con l'inserimento degli elementi nel carrello
                                // senza creare ancora una spesa effettiva
                                $(".add-to-cart").on("click",function(){
                                    
                                    
                                    productId = $(this).attr('data-product-id');                //viene salvato il valore di data-product-id
                                    var productDescription = prodottoSingolo.descrizione;       // viene salvata la descrizione del prodotto
                                    var productPrice = prodottoSingolo.costo;                   // viene salvato il prezzo del prodotto
                                                
                                    // Inizializzazione dell'oggetto click
                                    if (!click[productId]) {
                                        click[productId] = 0;
                                    }
                                    
                                    id.push(productId);                                         // Salvataggio dell'id nel vettore id
                                    click[productId]++;                                         // Incremento del click sul relativo prodotto
                                    obj = {id: productId, qta: qtaTot, ck: click[productId]};   // Associo il click all'oggetto che tiene conto dell'id e della qta
                                    cartItems.push({                                            // Nel vettore del carrello aggiungo il prodotto
                                        id: productId,
                                        name: productDescription,
                                        price: productPrice,
                                        quantity: qtaTot
                                    });    
                                    
                                    // Aggiornamento del carrello
                                    updateCart();
                                })
                
                                // Gestione dell'invio del modulo di checkout (bottone Invia mail)
                                $('.checkoutBtn').click(function(event) {
                                    // Se ci sono elementi nel carrello
                                    if(cartItems.length > 0){
        
                                        event.preventDefault();
                            
                                        // Calcola il totale dopo lo sconto (se applicabile)
                                        var totalPrice = 0;
                                        $.each(cartItems, function(index, item) {
                                            var numericPrice = parseFloat(item.price);
                                            totalPrice += numericPrice;
                                        });
                    
                                        // Imposto il giorno della spesa a domani, in quanto pescheria
                                        // e fattorino riceveranno l'ordine il giorno successivo alla
                                        // creazione dell'ordine. L'ora viene impostata per le 9.00 
                                        // (orario di apertura della pescheria)
                                        // Lo stato dell'ordine è impostato a "ORDINATA"
                                        var domani = new Date()
                                        domani.setHours(9,0,0,0);
                                        domani.setDate(domani.getDate() + 1)
                                        domani.toString()
                                        var stato = "ORDINATA";
            
                    
                                        // Viene creata una spesa da usare per una richiesta AJAX
                                        var dataSpesa = {
                                            data: domani,
                                            costo: totalPrice,
                                            stato: stato,
                                            prodAcquistati: id,
                                            qta: click,
                                            nome: $email.val()
                                        }
                    
                                        // Richiesta AJAX - metodo POST.
                                        // Sulla base dei dati forniti, viene creato un oggetto spesa che passerà
                                        // come parametri quelli precedentemente definiti. In caso di successo si
                                        // procederà con l'invio della mail alla pescheria
                                        $.ajax({
                                            method: "POST",
                                            url: "/newSpesa",
                                            dataType: "json",
                                            data : dataSpesa
                                        }).then(() =>{
                                            if (!oneTime) {
                                                alert("Grazie per aver acquistato ;)");
                                                
                                                // Salvataggio dei dati: destinatario, oggetto e corpoMessaggio, per la
                                                // creazione della mail
                                                datiInseriti = {
                                                    destinatario: prodotto.email,
                                                    oggetto: "ORDINE PER LA PESCHERIA: "+($select.val()).toUpperCase(),
                                                    corpoMessaggio: 
                                                    "Data ordine: "+ domani + "\nCosto ordine: €" + totalPrice.toFixed(2)+
                                                    "\nStato ordine: "+stato+"\nCodice prodotti acquistati: "+ id +
                                                    "\nPezzi acquistati: "+click[productId]
                                                }
                            
                                                // Richiesta AJAX - metodo POST
                                                // In caso di successo, dopo l'invio della mail viene svuotato il carrello e
                                                // fatto l'update dei prodotti e si ricarica la pagina
                                                $.ajax({ 
                                                    method: "POST",
                                                    url: "/inviaEmail",
                                                    dataType: "json",
                                                    data: datiInseriti
                                                }).then(()=>{
                                                    cartItems = [];
                                                    updateCart();
                                                    alert("Email inviata a "+prodotto.email)
                                                    setTimeout(function() {
                                                        window.location.reload();
                                                    }, 1000);
                                                });
                                                oneTime = true; 
                                            }
                                        })
                                    } else{
                                        // In caso di carrello vuoto viene stampato un messaggio
                                        alert('Inserire prodotti nel carrello!')
                                    }
                                });
                            })
                        })
                    }).fail(()=>{
                        // Fail nella ricerca dei prodotti. Viene stampato un messaggio di errore
                        $(".notify").append($("<li class='error'>")
                        .text("Non sono stati trovati prodotti per questa pescheria!"))
                        .hide().fadeIn(800).fadeOut(3000);
                        setTimeout(function() {
                            window.location.reload();
                        }, 3000);
                    });
        
                    // Inserimento dinamico degli elementi
                    $(".products").append($cont);
                })
                
                // Funzione per aggiornare il contenuto del carrello
                function updateCart() {
                    var totalPrice = 0;
                    var totalItems = 0;
                    var cartList = $('.cart-items');
                    cartList.empty();
        
                    // Per ogni oggetto che sta nel carrello, viene creata una lista di elementi di cui
                    // salvo descrizione e prezzo. Si incrementa la dim degli elementi e si aggiorna il
                    // prezzo e l'elemento h2 del carrello
                    $.each(cartItems, function(index, item) {
                        cartList.append('<li data-product-id="' + item.id + '">' + item.name + ' - €' + (item.price).toFixed(2) + ' <button class="remove-from-cart-btn"><ion-icon name="trash-outline"></button></li>');
                        totalItems++;

                        var numericPrice = parseFloat(item.price);
                        totalPrice += numericPrice;
                    });
                    
                    $('.cart h2').text('Carrello (' + totalItems + ' elementi)');
                    $('.cart-total').text('Totale: €' + totalPrice.toFixed(2));
        
                    // Funzione per rimuovere un prodotto dal carrello
                    $('.remove-from-cart-btn').off('click').on('click', function(event) {
                        click[productId]--;                                         // Decremento il click relativo al prodotto
                        obj = {id: productId, qta: qtaTot, ck: click[productId]};   // Aggiorno l'oggetto prodotto
                        event.stopPropagation();                                    // Si impedisce la propagazione dell'evento
        
                        // Nel caso di rimozione di più elementi con stesso id, verrà eliminato solo quello selezionato
                        var index = $(this).closest('li').index();
                        cartItems.splice(index, 1);
                        id.splice(index, 1);
        
                        // Aggiornamento del carrello
                        updateCart();
                    });
                }

        
                // Gestione del bottone "Remove" nel carrello
                $(document).on('click', '.remove-from-cart-btn', function(event) {
                    event.stopPropagation();                    // Impedisce la propagazione dell'evento
                    var index = $(this).closest('li').index();  // Si ricerca l'indice più vicino
                    cartItems.splice(index, 1);                 // Si rimuove l'elemento
                    updateCart();                               // Si fa l'update
        
                });
            } 
            // PESCHERIA
            // E' possibile prima ricercare i prodotti
            // per data = oggi e stato = "ORDINATA" e successivamente aggiornare le
            // quantità acquistate, inviando una mail con l'ordine modificato
            else if ($element.parent().is(":nth-child(2)")){
                $('.fattorino').show()
                $('.work_in_progress').show()
                $('.work_in_progress').append('<img src="img/loading.gif" alt="">')
                $buttonRicerca = $('<button>').text('Ricerca ordini')
                $('.fattorino').append($buttonRicerca)

                // Si effettua la ricerca per stato e data
                $buttonRicerca.on('click',()=>{
                    // Vengono impostate le variabili da usare per la richiesta AJAX
                    $buttonRicerca.hide()
                    var oggi = new Date()
                    oggi.setHours(9,0,0,0);

                    var statoOrdinata = "ORDINATA"
                    dataInput = {
                        data: oggi.toString(),
                        stato: statoOrdinata
                    }
                    
                    // Richiesta AJAX - metodo GET
                    // Nel caso esistano prodotti con data pari a oggi e stato ordinato,
                    // vengono stampate a video e si procede con la modifica
                    $.ajax({
                        method: "GET",
                        dataType: "json",
                        url: "/getSpesa/"+oggi.toString() + "/"+statoOrdinata,
                        data: dataInput
                    }).then((ordini)=>{
                        
                        // Scorrimento dell'array
                        ordini.forEach((ordine) => {

                            // Stampa degli elementi
                            var $id = $("<li>").text("Id spesa: "+ordine.id);
                            var $data = $("<li>").text("Data: " + ordine.data);
                            var $costo = $("<li>").text("Costo: €" + (ordine.costo).toFixed(2));
                            var $stato = $("<li>").text("Stato: " + ordine.stato);
                            
                            // Inserimento dinamico
                            $cont.append('<br>').append($id).append($data).append($costo).append($stato).append('<br>')
                            
                            // Scorrimento dei prodotti per ogni ordine
                            ordine.prodAcquistati.prod.forEach((prodottoSingolo)=>{
                            var $prodottoCod = $("<li>").text("Codice prodotto: " + prodottoSingolo.codice);
                            var $prodottoDesc = $("<li>").text("Descrizione prodotto: " + prodottoSingolo.descrizione);
                            var $buttonControll = $('<li><button class="modify" data-product-id='+prodottoSingolo.codice+'>Modifica ordine <ion-icon name="pencil-outline"></ion-icon>');
                                
                            // Inserimento dinamico
                            $cont.append($prodottoCod).append($prodottoDesc).append($buttonControll).append("<br>");                            
                            $('.fattorino').append($cont)

                            // Al click del pulsante modifica, vengono creati: label, input e button
                            $(".modify").on('click',function(){
                                
                                var $inputQta = $('<input type=number>')
                                var $buttonModifica = $('<button class="modify-btn">').text('Modifica')
                            
                                var idProdotto = $(this).attr('data-product-id');
                                if (!oneTime) {
                                    // Inserimento dinamico degli elementi
                                    $cont.append('<li><label> Quantità ').append($inputQta).append($buttonModifica)
                                    oneTime = true
                                }
                                
                                // Se la quantità inserita è non negativa, si prosegue con l'update
                                $('.modify-btn').on('click',function(){
                                    if($inputQta.val()> 0){
                                        if(oneTime){
                                            // Disabilita temporaneamente il pulsante per evitare più clic durante la richiesta
                                            $(this).prop('disabled', true);
            
                                            // Dati della richiesta AJAX
                                            dataInput = {
                                                id: idProdotto,
                                                qta: $inputQta.val()
                                            }
                                            
                                            // Richiesta AJAX - metodo PUT.
                                            // Sulla base dell'id del prodotto inserito, si ricercano gli elementi
                                            // e si fa l'update della quantità (inserita dall'utente)
                                            $.ajax({
                                                url: "/updateQta/"+idProdotto,
                                                type: "PUT",
                                                dataType: "json",
                                                data: dataInput,
                                                success: function() {
                                                    // Se non ci sono errori, viene mostrato un messaggio di successo.
                                                    // Si fa inserire alla pescheria la mail del ristorante e si prosegue con l'invio
                                                    // di quest'ultima con la quantità aggiornata
                                                    $(".notify").text("Ordine aggiornato con successo!").fadeIn(800).fadeOut(3000);
                                                    setTimeout(function(){
                                                        var $inputEmail = $('<input>')
                                                        var $btnEmail = $('<button class="btnEmail">').text('Invia mail')
                                                        $cont.append('<li><label> Email ').append($inputEmail).append($btnEmail)
    
                                                        // Alla pressione del pulsante, viene effettuata una richiesta AJAX, per l'invio della mail
                                                        $('.btnEmail').on('click',function(){
                                                            
                                                            // Vengono salvati i dati relativi al destinatario, corpo e oggetto della mail
                                                            datiInseriti = {
                                                                destinatario: $inputEmail.val(),
                                                                oggetto: "ORDINE AGGIORNATO",
                                                                corpoMessaggio: "Ci scusiamo per il disagio, ma è stato necessario aggiornare l'ordine"+
                                                                "\nIl prodotto aggiornato è il seguente:"+
                                                                "\nCodice prodotto: "+idProdotto+
                                                                "\nPezzi acquistati: "+$inputQta.val()
                                                            }
                                        
                                                            // Richiesta AJAX - metodo POST
                                                            // Invio della mail. In caso di successo, viene stampato a video il messaggio
                                                            // e si ricarica la pagina
                                                            $.ajax({ 
                                                                method: "POST",
                                                                url: "/inviaEmail",
                                                                dataType: "json",
                                                                data: datiInseriti
                                                            }).then(()=>{
                                                                alert("Email inviata a "+$inputEmail.val())
                                                                setTimeout(function() {
                                                                    window.location.reload();
                                                                }, 1000);
                                                            });
                                                        })
                                                    },3000)
                                                },
                                                error: function(jqXHR) {
                                                    // Se si verifica un errore, viene stampato un messaggio a video e si riabilita il pulsante
                                                    console.error("Errore durante la richiesta di aggiornamento:", jqXHR.responseText);
                                                    $(this).prop('disabled', false);
                                                }
                                            });
                                        } 
                                    // In caso di quantità negativa viene stampato un messaggio
                                    } else{
                                        alert('Inserire quantità non negativa!')
                                    }
                                })
                            })
                        })
                    })

                    }).fail(()=>{
                        // Fail nella ricerca degli ordini e ricarica della pagina
                        $(".notify").append($("<li class='error'>")
                        .text("Non sono stati trovati ordini per la giornata di oggi!"))
                        .hide().fadeIn(800).fadeOut(3000);
                        setTimeout(function() {
                            window.location.reload();
                        }, 3000);
                    });
                })
            } 
            // FATTORINO
            // Il fattorino visualizza gli ordini, ricercandoli per data odierna e per
            // stato = "ORDINATA", successivamente conferma l'ordine una volta avvenuto
            // modificando lo stato in "CONSEGNATA"
            else{
                $buttonRicerca = $('<button>').text('Visualizza ordini')
                
                $('.fattorino').show()
                $('.camioncino').show()
                $('.camioncino').append('<img src="img/camioncino.png" alt="">')
                $('.camioncino').append('<img src="img/loading2.gif" alt="">')

                // Inserimento dinamico
                $('.fattorino').append($buttonRicerca)

                // Alla pressione del pulsante viene inviata la richiesta AJAX,
                // in caso di successo verranno stampati gli ordini
                $buttonRicerca.on('click',()=>{
                    $buttonRicerca.hide()

                    // Definizione dei parametri per la ricerca
                    var oggi = new Date()
                    oggi.setHours(9,0,0,0);
                    var statoOrdinata = "ORDINATA"

                    // Variabile da passare in ingresso alla richiesta
                    dataInput = {
                        data: oggi.toString(),
                        stato: statoOrdinata
                    }
                    
                    // Richiesta AJAX - metodo GET
                    // Ricerca degli ordini per data e stato. Se la richiesta ha esito
                    // positivo si può procedere con l'aggiornamento
                    $.ajax({
                        method: "GET",
                        dataType: "json",
                        url: "/getSpesa/"+oggi.toString() + "/"+statoOrdinata,
                        data: dataInput
                    }).then((ordini)=>{
                        // Scorrimento del vettore
                        ordini.forEach((ordine) => {
                            
                            // Stampa degli elementi
                            var $id = $("<li>").text("Id: "+ordine.id);
                            var $data = $("<li>").text("Data: " + ordine.data);
                            var $costo = $("<li>").text("Costo: €" + (ordine.costo).toFixed(2));
                            var $stato = $("<li>").text("Stato: " + ordine.stato);
                            var $buttonCheck = $('<li><button class="check" data-product-id='+ordine.id+' ><ion-icon name="checkmark-outline"></ion-icon>');
                            
                            // Inserimento dinamico
                            $cont.append('<br>').append($id).append($data).append($costo).append($stato).append($buttonCheck).append("<br>");
                            $('.fattorino').append($cont)

                            // Alla pressione del bottone di check, viene effettuata una richiesta AJAX per
                            // l'aggiornamento dello stato
                            $('.check').on('click', function() {
                                var idOrdine = $(this).attr('data-product-id');
                                
                                // Si disabilita temporaneamente il pulsante per evitare più clic durante la richiesta
                                $(this).prop('disabled', true);
                                
                                // Richiesta AJAX - metodo PUT
                                // Viene effettuata una ricerca sulla base dell'id e una volta trovata la spesa
                                // si procede con l'aggiornamento dello stato
                                $.ajax({
                                    url: "/updateOrdine",
                                    type: "PUT",
                                    dataType: "json",
                                    data: { id: idOrdine },
                                    success: function() {
                                        // Se l'aggiornamento va a buon fine, si stampa un messaggio di successo 
                                        // e si ricarica la pagina
                                        $(".notify").text("Ordine aggiornato con successo!").fadeIn(800).fadeOut(3000);
                                        setTimeout(function() {
                                            window.location.reload();
                                        }, 3000);
                                    },
                                    error: function(jqXHR) {
                                        // Se si verifica un errore, viene stampato il messaggio e si riabilita il pulsante
                                        console.error("Errore durante la richiesta di aggiornamento:", jqXHR.responseText);
                                        $(this).prop('disabled', false);
                                    }
                                });
                            });  
                        })
                    }).fail(()=>{
                        //Fail nella ricerca degli ordini e riaggiornamento della pagina
                        $(".notify").append($("<li class='error'>").text("Non sono stati trovati ordini per la giornata di oggi!"))
                        .hide().fadeIn(800).fadeOut(3000);
                        setTimeout(function() {
                            window.location.reload();
                        }, 3000);
                    });
                })
            }
            return false; //Evita la ripropagazione del click sui tabs
        })
    })

    $(".tabs a:first-child span").trigger("click"); // Trigger per settare il tab di default (RISTORANTE) all'apertura della pagina
}

$(document).ready(main)