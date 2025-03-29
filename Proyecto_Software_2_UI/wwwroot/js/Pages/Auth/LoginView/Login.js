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
    let api_url = "http://localhost:5058";

    this.SubmitLoginRequests = function () {
        let email = $('#input-email').val();
        $.ajax({
            method: "POST",
            url: api_url + "/api/Usuario/BuscarUsuarioPorEmail?email=" + encodeURIComponent(email),
            contentType: "application/json;charset=utf-8"
        }).done(function (response) {
            console.log("BuscarUsuario - Success!", response);

            //  EMPTY o NULL
            if (!response || response === null ||
                response.correoElectronico === null ||
                response.correoElectronico === undefined) {

                Swal.fire({
                    title: "Error de autenticación",
                    text: "El usuario no existe en el sistema",
                    icon: "error"
                });
                return; // Stop execution here
            }

            // Si encontramos el usuario, procedemos a validar las credenciales
            this.validarUsuario(email, $('#input-password').val());
        }.bind(this)).fail(function (error) {
            console.log("BuscarUsuario - ERROR!:", error);
            Swal.fire({
                title: "Error de autenticación",
                text: "El usuario o contrasena son invalidos",
                icon: "error"
            });
        });
    }

    this.validarUsuario = function (email, contrasena) {
        console.log("Intentando validar con:", email, contrasena);
        $.ajax({
            method: "POST",
            url: api_url + "/api/Usuario/ValidarUsuario?email=" + encodeURIComponent(email) + "&contrasena=" + encodeURIComponent(contrasena),
            contentType: "application/json;charset=utf-8"
        }).done(function (response) {
            console.log("ValidarUsuario - Success!", response);
            

            // Usuario autenticado correctamente, ahora generamos OTP
           
            if (response === true) {

                this.generarOTP(email);
            } else {
                Swal.fire({
                    title: "Credenciales incorrectas",
                    text: "Correo electrónico o contraseña incorrectos",
                    icon: "error"
                });
            }

        }.bind(this)).fail(function (error) {
            console.log("ValidarUsuario - ERROR!:", error);
            Swal.fire({
                title: "Error de autenticación",
                text: "BackendError",
                icon: "error"
            });
        });
    }

    this.generarOTP = function (email) {
        // Crear el objeto de solicitud
        const requestBody = JSON.stringify({ email: email });

        $.ajax({
            method: "POST",
            url: api_url + "/api/Seguridad/GenerarOTP",
            contentType: "application/json;charset=utf-8",
            data: requestBody
        }).done(function (response) {
            console.log("GenerarOTP - Success!", response);

            if (response && response.success) {
                // Redireccionar a la página de OTP
                window.location.href = "Auth/OTP";
            } else {
                // Manejar caso de error en la respuesta
                Swal.fire({
                    title: "Error al generar OTP",
                    text: response.message || "No se pudo generar el código de verificación",
                    icon: "error"
                });
            }
        }).fail(function (error) {
            console.log("GenerarOTP - ERROR!:", error);
            Swal.fire({
                title: "Error de autenticación",
                text: "No se pudo generar el código de verificación",
                icon: "error"
            });
        });
    };
}