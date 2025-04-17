document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-recuperar-contrasena');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const correo = document.getElementById('input-correo').value;

        if (!correo) {
            Swal.fire("Campo requerido", "Por favor ingresa tu correo.", "warning");
            return;
        }

        // Solo redirige con el correo y origen
        window.location.href = `/Auth/ConfirmarOTP?correo=${encodeURIComponent(correo)}&origen=recuperar`;
    });
});