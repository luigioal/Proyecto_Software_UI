document.addEventListener('DOMContentLoaded', () => {
    // Inicializar validador
    FormValidator.inicializar('form-confirmar-otp');

    // Crear instancia del manejador
    const otpManager = new ValidarOTP();

    // Manejar el envío del formulario
    document.getElementById("form-confirmar-otp").addEventListener("submit", function (event) {
        event.preventDefault();

        if (FormValidator.validarFormulario('form-confirmar-otp')) {
            otpManager.SubmitOtpValidation();
            console.log('✅ Formulario OTP válido, enviando datos...');
        } else {
            Swal.fire({
                title: "Campos incompletos",
                text: "Por favor, completa todos los campos requeridos.",
                icon: "warning"
            });
        }
    });
});

function ValidarOTP() {
    this.SubmitOtpValidation = function () {
        const api_url = "http://localhost:5058";

        const data = {
            email: $('#input-correo').val(),
            otpCode: $('#input-otp').val()
        };

        // Mostrar en consola el JSON enviado
        console.log("📤 Enviando JSON:", JSON.stringify(data));

        // Validar campos antes de enviar
        if (!data.email || !data.otpCode) {
            Swal.fire({
                title: "Datos faltantes",
                text: "Correo electrónico y código OTP son requeridos.",
                icon: "warning"
            });
            return;
        }

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
                Swal.fire({
                    title: "Código verificado",
                    text: "Ahora puedes cambiar tu contraseña.",
                    icon: "success"
                }).then(() => {
                    window.location.href = `/Auth/NuevaContrasena?correo=${encodeURIComponent(response.email)}`;
                });
            } else {
                Swal.fire({
                    title: "Código inválido",
                    text: response.message,
                    icon: "error"
                });
            }
        }).fail(function (error) {
            console.error("❌ ValidarOTP - ERROR!:", error);
            console.log("📨 responseText:", error.responseText);
            if (error.responseJSON) {
                console.log("📦 responseJSON:", error.responseJSON);
            }

            Swal.fire({
                title: "Error del servidor",
                text: "No se pudo validar el código. Intenta nuevamente.",
                icon: "error"
            });
        });
    };
}
