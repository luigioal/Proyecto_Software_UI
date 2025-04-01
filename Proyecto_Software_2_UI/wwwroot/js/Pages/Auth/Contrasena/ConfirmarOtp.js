document.addEventListener('DOMContentLoaded', () => {
    // Inicializar validador
    FormValidator.inicializar('form-confirmar-otp');

    // Obtener el correo del input hidden
    const email = document.getElementById('input-correo').value;
    console.log("Email encontrado:", email);
    

    // Generar OTP automáticamente al cargar la página (solo una vez, no duplicar)
    if (email) {
        // Pequeño retraso para asegurar que todo está listo
        setTimeout(() => {
            console.log("Generando OTP para:", email);
            generarOTP(email);
        }, 500);
    }

    // Manejar el envío del formulario
    document.getElementById("form-confirmar-otp").addEventListener("submit", function (event) {
        event.preventDefault();

        if (FormValidator.validarFormulario('form-confirmar-otp')) {
            validarOTP();
        } else {
            Swal.fire({
                title: "Campos incompletos",
                text: "Por favor, completa todos los campos requeridos.",
                icon: "warning"
            });
        }
    });

    // Función para generar OTP
    function generarOTP(email) {
        const api_url = "http://localhost:5058";

        // Mostrar indicador de carga
        Swal.fire({
            title: "Generando código",
            text: "Estamos enviando un código a tu correo...",
            icon: "info",
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });

        $.ajax({
            method: "POST",
            url: `${api_url}/api/Seguridad/GenerarOTP?email=${encodeURIComponent(email)}`,
            success: function (response) {
                console.log("✅ GenerarOTP - Success!", response);

                Swal.fire({
                    title: "Código enviado",
                    text: "Hemos enviado un código de verificación a tu correo electrónico.",
                    icon: "success",
                    timer: 3000,
                    timerProgressBar: true
                });

                // Enfocar el campo de OTP para mejorar la experiencia
                document.getElementById('input-otp').focus();
            },
            error: function (error) {
                console.error("❌ GenerarOTP - ERROR:", error);

                Swal.fire({
                    title: "Error",
                    text: "No pudimos generar el código de verificación. Intenta nuevamente.",
                    icon: "error"
                });
            }
        });
    }

    // Función para validar OTP
    function validarOTP() {
        const api_url = "http://localhost:5058";

        const data = {
            email: document.getElementById('input-correo').value,
            otpCode: document.getElementById('input-otp').value
        };

        // Validar campos antes de enviar
        if (!data.email || !data.otpCode) {
            Swal.fire({
                title: "Datos faltantes",
                text: "Correo electrónico y código OTP son requeridos.",
                icon: "warning"
            });
            return;
        }

        // Mostrar indicador de carga
        Swal.fire({
            title: "Verificando",
            text: "Estamos verificando tu código...",
            icon: "info",
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        $.ajax({
            method: "POST",
            url: `${api_url}/api/Seguridad/ValidarOTP`,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            contentType: "application/json;charset=utf-8",
            data: JSON.stringify(data)
        }).done(function (response) {
            console.log("✅ ValidarOTP - Success!", response);

            if (response.success) {
                // Guardar el correo en sessionStorage para uso en otras pantallas
                sessionStorage.setItem('userEmail', response.email);

                // Determinar la redirección basada en el origen
                const urlParams = new URLSearchParams(window.location.search);
                const origen = urlParams.get('origen');

                Swal.fire({
                    title: "Código verificado",
                    text: "Verificación exitosa.",
                    icon: "success"
                }).then(() => {
                    if (origen === 'recuperar') {
                        window.location.href = `/Auth/NuevaContrasena?correo=${response.email}`;
                    } else {
                        // Por defecto o si origen es 'login'
                        window.location.href = "/Home/Index";
                    }
                });
            } else {
                Swal.fire({
                    title: "Código inválido",
                    text: response.message || "El código ingresado no es válido. Verifica e intenta nuevamente.",
                    icon: "error"
                });
            }
        }).fail(function (error) {
            console.error("❌ ValidarOTP - ERROR:", error);

            Swal.fire({
                title: "Error del servidor",
                text: "No se pudo validar el código. Intenta nuevamente.",
                icon: "error"
            });
        });
    }
});