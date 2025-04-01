document.addEventListener('DOMContentLoaded', () => {
    FormValidator.inicializar('registroAsesorForm');
    const registroManager = new RegistroAsesor();
    document.getElementById("registroAsesorForm").addEventListener("submit", function (event) {
        event.preventDefault();
        if (FormValidator.validarFormulario('registroAsesorForm')) {
            registroManager.SubmitRegistroRequest();
            console.log('Formulario válido, enviando datos...');
        } else {
            Swal.fire({
                title: "Registro incompleto",
                text: "Por favor, completa todos los campos requeridos.",
                icon: "warning"
            });
        }
    });
});

function RegistroAsesor() {
    this.SubmitRegistroRequest = function () {
        let api_url = "http://localhost:5058";

        // Usar FormData ya que el backend espera [FromForm]
        const formData = new FormData();

        // Obtener valores directamente de los elementos del DOM
        formData.append("Nombre", document.getElementById('input-nombre').value);
        formData.append("PrimerApellido", document.getElementById('input-apellido1').value);
        formData.append("SegundoApellido", document.getElementById('input-apellido2').value);
        formData.append("FechaNacimiento", document.getElementById('input-fecha').value);
        formData.append("CorreoElectronico", document.getElementById('input-correo').value);
        formData.append("Direccion", document.getElementById('input-direccion').value);
        formData.append("Contrasena", document.getElementById('input-contrasena').value);

        // Valores hardcodeados
        formData.append("Tipo", "Asesor");
        formData.append("IdSupervisor", 1); // Como string para evitar problemas de conversión
        formData.append("FotoPerfil", "Test");

        // Los roles no se pasan al procedimiento almacenado en el backend,
        // pero los incluimos por si son necesarios para el modelo
        formData.append("Roles", "Asesor");

        // Para debug: mostrar lo que estamos enviando
        console.log("Enviando el siguiente FormData:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        // Deshabilitar el botón mientras se procesa
        const submitButton = document.getElementById("btnSubmitRegistro");
        const originalText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Procesando...';

        $.ajax({
            method: "POST",
            url: api_url + "/api/Usuario/CrearUsuario",
            processData: false,
            contentType: false, // Importante para FormData
            data: formData,
            complete: function () {
                // Siempre restaurar el botón al finalizar
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            },
            success: function (response) {
                console.log("Registro exitoso:", response);

                // Crear una variable para almacenar si la redirección ya se realizó
                let redirectionDone = false;

                // Mostrar mensaje de éxito
                Swal.fire({
                    title: "Registro exitoso",
                    text: "Se ha notificado al administrador para la activación de la cuenta.",
                    icon: "success",
                    confirmButtonText: "Ir a login",
                    allowOutsideClick: false,
                    allowEscapeKey: false
                }).then(function () {
                    if (!redirectionDone) {
                        redirectionDone = true;
                        console.log("Redirigiendo a login...");

                        // Usar setTimeout para asegurarnos que el código se ejecute después de todo
                        setTimeout(function () {
                            // Limpiar el formulario
                            document.getElementById('registroAsesorForm').reset();
                            // Redireccionar
                            window.location.href = "/Auth/Login";
                        }, 100);
                    }
                });
            },
            error: function (xhr, status, error) {
                console.error("Error en registro:", error);
                console.error("Respuesta del servidor:", xhr.responseText);

                Swal.fire({
                    title: "Error al registrar",
                    text: "Detalles: " + (xhr.responseText || error || "Error desconocido"),
                    icon: "error"
                });
            }
        });
    }
}