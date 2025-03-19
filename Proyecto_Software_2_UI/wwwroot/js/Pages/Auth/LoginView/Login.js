document.addEventListener('DOMContentLoaded', () => {
    // Inicializar validación para el formulario de login
    FormValidator.inicializar('loginForm');

    // Crear una sola instancia de Login
    const loginManager = new Login();

    // Manejar únicamente el envío del formulario
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        // Si el formulario es válido, realizar la autenticación
        if (FormValidator.validarFormulario('loginForm')) {
            loginManager.SubmitLoginRequests();
            console.log('Formulario válido, enviando datos...');
        }
    });
});

function Login() {
    
    this.SubmitLoginRequests = function () {
        let api_url = "http://localhost:5058"; //PLACEHOLDER CAMBIAR
        let user = {};
        user.email = $('#input-email').val();
        user.password = $('#input-password').val();

        $.ajax({
            headers: {
                'Accept': "application/json",
                'Content-Type': "application/json"
            },
            method: "POST",
            url: api_url + "/api/Usuario/BuscarUsuarioPorEmail",
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(user),
            hasContent: true
        }).done(function (response) {
            console.log("BuscarUsuario - Success!", response);
           
        }).fail(function (error) {
            console.log("BuscarUsuario - ERROR!:", error);
            Swal.fire({
                title: "Error de autenticación",
                text: "Error interno del servidor. Por favor, inténtalo más tarde.",
                icon: "error"
            });
            
        });
    }
}