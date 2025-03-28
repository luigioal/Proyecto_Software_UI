document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-recuperar-contrasena');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const correo = document.getElementById('input-correo').value;
        const api_url = "http://localhost:5058"; // Ajusta tu puerto

        if (!correo) {
            Swal.fire("Campo requerido", "Por favor ingresa tu correo.", "warning");
            return;
        }

        $.ajax({
            url: `${api_url}/api/Seguridad/GenerarOTP?email=${encodeURIComponent(correo)}`,
            method: "POST",
            success: function (response) {
                if (response.success) {
                    Swal.fire("Código enviado", "Revisa tu correo electrónico.", "success")
                        .then(() => {
                            window.location.href = `/Auth/ConfirmarOTP?correo=${correo}`;
                        });
                } else {
                    Swal.fire("Error", response.message, "error");
                }
            },
            error: function () {
                Swal.fire("Error", "No se pudo enviar el código. Intenta más tarde.", "error");
            }
        });
    });
});
