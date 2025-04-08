document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = localStorage.getItem('baseUrl');
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
        const email = document.getElementById('input-email').value;
        const password = document.querySelector('input[name="password"]').value;

        // Paso 1: Buscar usuario por email
        $.ajax({
            method: "POST",
            url: baseUrl + `/api/Usuario/BuscarUsuarioPorEmail?email=${encodeURIComponent(email)}`,
            contentType: "application/json;charset=utf-8"
        })
            .done(function (response) {
                console.log("Usuario encontrado:", response);

                // Verificar si el usuario existe
                if (!response || !response.correoElectronico) {
                    showError("El usuario no existe en el sistema");
                    return;
                }

                const esDeveloper = response.roles.includes("Dev")//Buscar rol Dev en usuario
                if (esDeveloper) {
                    sessionStorage.setItem('usuarioActual', JSON.stringify(response));
                }
                // Paso 2: Validar contraseña
                validatePassword(email, password, esDeveloper);
            })
            .fail(function (error) {
                console.error("Error al buscar usuario:", error);
                showError("Error al buscar usuario");
            });
    }

    // Función para validar la contraseña
    function validatePassword(email, password, esDeveloper) {

        $.ajax({
            method: "POST",
            url: baseUrl + `/api/Usuario/ValidarUsuario?email=${encodeURIComponent(email)}&contrasena=${encodeURIComponent(password)}`,
            contentType: "application/json;charset=utf-8"
        })
            .done(function (response) {
                console.log("Validación de contraseña:", response);

                if (response === true) {
                    if (esDeveloper) {
                        createBasicCookie("Dev", "true", 7); 
                        // Redirigir al inicio si es developer
                        window.location.href = "/Home/IndexAutenticado";
                    }
                    else {
                        // Redirigir a la página de confirmación OTP
                        window.location.href = `/Auth/ConfirmarOTP?correo=${email}&origen=login`;
                    }
                    
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

//Funcion para crear cookie 
function createBasicCookie(name, value, daysToExpire) {
    // Create expiration date
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysToExpire);

    // Build the cookie string with name=value and expiration
    document.cookie = `${name}=${value}; path=/; SameSite=Lax; Secure`;
}