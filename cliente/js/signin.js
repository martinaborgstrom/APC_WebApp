$(document).ready(function() {

   const $showPass = $('.showpass');
   const $hidePass = $('.hidepass');
   const $nome = $('.js-nome');
   const $indirizzo = $('.js-indirizzo');
   const $telefono = $('.js-telefono');
   const $email = $('.js-email');
   const $user = $('.js-user');
   const $pass = $('.js-pass');

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

   // Gli effetti sono applicati a:
   // nome
   effectFocusBlur($nome);

   // indirizzo
   effectFocusBlur($indirizzo);
   
   // telefono
   effectFocusBlur($telefono);

   // email
   effectFocusBlur($email);

   // username
   effectFocusBlur($user);

   // password
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

   // Click del bottone di signin
   $('.signin-btn').on('click', function(event) {

      // Gestisce l'evento
      event.preventDefault();

      // Recupero i dati
      var nome = $('#nome').val();
      var indirizzo = $('#indirizzo').val();
      var telefono = $('#telefono').val();
      var email = $('#email').val();
      var username = $('#user').val();
      var password = $('#password').val();
      var checkbox = $('#checkbox');

      // Validazioni degli input:
      // Si verifica che il campo nome sia non vuoto
      if (nome.trim() === "") {
         window.alert("Inserisci un nome valido.");
         return;
      }

      // Si verifica che il campo indirizzo sia non vuoto
      if (indirizzo.trim() === "") {
         window.alert("Inserisci un indirizzo valido.");
         return;
      }

      // Si verifica che il campo telefono sia numerico e abbia 10 cifre
      if(!/^\d{10}$/.test(telefono)){
         window.alert("Inserire un numero di telefono valido");
         return
      }

      // Si verifica che il campo email sia non vuoto
      if (email.trim() === "") {
         window.alert("Inserisci un indirizzo valido.");
         return;
      }

      // Si verifica che il campo username sia non vuoto
      if (username.trim() === "") {
         window.alert("Inserisci un nome utente valido.");
         return;
      }

      // Si verifica che il campo password abbia almeno 8 caratteri
      if (password.length < 8) {
         window.alert("La password deve contenere almeno 8 caratteri.");
         return;
      }

      // Si verifica che l'utente abbia accettato i termini
      if (!checkbox.prop('checked')) {
          window.alert("Si prega di accettare i termini per poter proseguire");
          return;
      }

      // Viene creato un oggetto con i dati precedentemente inseriti
      var requestSignIn = {
         nome: nome,
         indirizzo: indirizzo,
         telefono: telefono,
         email: email,
         username: username,
         password: password,
      }

      // Viene fatta una richiesta AJAX per inviare i dati al server.
      $.ajax({
         method: "POST",
         url: "/signin",
         dataType: "json",
         data: requestSignIn
      }).done(() => {
         // Se l'iscrizione ha successo, viene stampato un messaggio 
         // e l'utente è reindirizzato alla pagina di login
         window.alert("Sign in avvenuto con successo");

         window.location.href = "/login.html";
      }).fail((jqXHR, textStatus, errorThrown) => {
         // Se la richiesta restituisce un errore, viene stampato un messaggio
         if (jqXHR.status === 400) {
             window.alert("Username già registrato!");
         } else {
             window.alert("Errore durante la richiesta. Si prega di riprovare più tardi.");
         }
      });
   });
});