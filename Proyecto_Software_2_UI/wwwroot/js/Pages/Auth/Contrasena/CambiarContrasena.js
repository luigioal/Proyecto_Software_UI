document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-cambiar-contrasena');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const correo = document.getElementById('input-correo').value;
        const nuevaContrasena = document.getElementById('input-nueva-contrasena').value;
        const confirmarContrasena = document.getElementById('input-confirmar-contrasena').value;

        if (nuevaContrasena !== confirmarContrasena) {
            Swal.fire({
                icon: 'warning',
                title: 'Las contraseñas no coinciden',
                text: 'Por favor, verifica los campos.'
            });
            return;
        }

        const payload = {
            email: correo,
            nuevaContrasena: nuevaContrasena
        };

        let api_url = "http://localhost:5058"; // Asegúrate que sea tu puerto correcto

        $.ajax({
            url: api_url + "/api/Seguridad/CambiarContrasena",
            type: "PUT",
            data: JSON.stringify(payload),
            contentType: "application/json",
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Contraseña actualizada',
                        text: response.message
                    }).then(() => {
                        window.location.href = '/Auth/Login';
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: response.message
                    });
                }
            },
            error: function (xhr, status, error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error del servidor',
                    text: 'No se pudo actualizar la contraseña.'
                });
                console.error(xhr.responseText);
            }
        });
    });
});
