var main = () => {
    
    // Al click del bottone di login, l'utente è reindirizzato alla pagina di login
    $('.btn-signin').on('click', ()=>{
        window.location.href = 'login.html';
    });
};

$(document).ready(main);