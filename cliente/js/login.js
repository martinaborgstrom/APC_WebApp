var main = () => {

    const $user = $('.js-user');
    const $pass = $('.js-pass');
    const $showPass = $('.showpass');
    const $hidePass = $('.hidepass');
    const $btnSign = $('.form .form-field .secondary-btn');
    const $btnLog = $('.form .form-field .login-btn');

    // Funzione per rendere interattivi gli elementi del DOM
	function effectOn(effect, effectString, object){
	    object.on(effectString, function(){
	        effect(object);
	    });
	}

    // Si richiama la funzione precedente e si applicano gli effetti di focus e blur agli elementi
	function effectFocusBlur(object){
	    effectOn(focus, 'focus', object);
	    effectOn(blur, 'blur', object);
	}
	
	// Gli effetti sono applicati all'user e alla password
	effectFocusBlur($user);
	effectFocusBlur($pass);
	
	function focus($element) {
	    const $parentEl = $element.parent();
	    $parentEl.addClass('active');
	}

	function blur($element) {
	    const $parentEl = $element.parent();
	    if (!$element.val()) {
	        $parentEl.removeClass('active');
	    }
	}

	$(window).on('pageshow', function() {
	    focus($user);
	    blur($user);
	    focus($pass);
	    blur($pass);
	});

	// Click del bottone di signin: reindirizzamento alla pagina di signin
    $btnSign.on('click', function(event) {
        // Gestisce l'evento
        event.preventDefault();

        // Reindirizzamento alla pagina di signin
        window.location.href = "signin.html";
    });

    // Funzione per visualizzare la password
	$showPass.on('click', function() {
	    $showPass.hide();
	    $hidePass.show();
	    $pass.attr('type', 'text');
	});

	// Funzione per nascondere la password
	$hidePass.on('click', function() {
	    $hidePass.hide();
	    $showPass.show();
	    $pass.attr('type', 'password');
	});

    // Click del bottone login
    $btnLog.on('click', function(event){

        // Gestisce l'evento
        event.preventDefault();

        // Recupero i dati inseriti
		var username = $user.val();
		var password = $pass.val();

		// Validazione input:
        // Verifico che l'username non sia vuoto
        if (username.trim() === "") {
            window.alert("Inserisci un nome utente valido.");
            return;
        }

        // Verifico che la password abbia almeno 8 caratteri
        if (password.length < 8) {
            window.alert("La password deve contenere almeno 8 caratteri.");
            return;
        }

		//Creo l'oggetto di richiesta contenente i dati  inseriti dall'utente
		var requestLogin = {
			username : username,
			password : password
		}

		//Effettuo una richiesta Ajax per inviare i dati al server
		$.ajax({
			method: "POST",
			url: "/login",
			dataType: "json",
			data : requestLogin
		})
		.then((res) => {
			if (res.outcome === "success") {
				//Se l'accesso ha successo, mostra un messaggio e reindirizza l'utente alla pagina personale
				window.alert("Log in avvenuto con successo");
				window.location.href = "/home.html";
			}else {
				// Se l'accesso non ha successo, mostra un messaggio di errore
				window.alert("Credenziali non valide")
			}
		});
	});
};

$(document).ready(main);