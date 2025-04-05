document.addEventListener('DOMContentLoaded', () => {
    // Inicializar validación para el formulario de login
    FormValidator.inicializar('loginForm');

    // Manejar el envío del formulario
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        // Si el formulario es válido, realizar la autenticación
        if (FormValidator.validarFormulario('loginForm')) {
            handleLogin();
        }
    });

    // Función principal de autenticación
    function handleLogin() {
        const api_url = "https://proyecto-software-2.azurewebsites.net";
        const email = document.getElementById('input-email').value;
        const password = document.querySelector('input[name="password"]').value;

        // Paso 1: Buscar usuario por email
        $.ajax({
            method: "POST",
            url: `${api_url}/api/Usuario/BuscarUsuarioPorEmail?email=${encodeURIComponent(email)}`,
            contentType: "application/json;charset=utf-8"
        })
            .done(function (response) {
                console.log("Usuario encontrado:", response);

                // Verificar si el usuario existe
                if (!response || !response.correoElectronico) {
                    showError("El usuario no existe en el sistema");
                    return;
                }

                // Paso 2: Validar contraseña
                validatePassword(email, password);
            })
            .fail(function (error) {
                console.error("Error al buscar usuario:", error);
                showError("Error al buscar usuario");
            });
    }

    // Función para validar la contraseña
    function validatePassword(email, password) {
        const api_url = "https://proyecto-software-2.azurewebsites.net";

        $.ajax({
            method: "POST",
            url: `${api_url}/api/Usuario/ValidarUsuario?email=${encodeURIComponent(email)}&contrasena=${encodeURIComponent(password)}`,
            contentType: "application/json;charset=utf-8"
        })
            .done(function (response) {
                console.log("Validación de contraseña:", response);

                if (response === true) {
                    // Redirigir a la página de confirmación OTP
                    window.location.href = `/Auth/ConfirmarOTP?correo=${email}&origen=login`;
                } else {
                    showError("Correo electrónico o contraseña incorrectos");
                }
            })
            .fail(function (error) {
                console.error("Error al validar contraseña:", error);
                showError("Error al validar credenciales");
            });
    }

    // Función para mostrar mensajes de error
    function showError(message) {
        Swal.fire({
            title: "Error de autenticación",
            text: message,
            icon: "error"
        });
    }
});