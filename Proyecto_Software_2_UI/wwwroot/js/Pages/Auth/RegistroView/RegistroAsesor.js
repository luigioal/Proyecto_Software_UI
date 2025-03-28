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

        const formData = new FormData();
        formData.append("Nombre", $('#input-nombre').val());
        formData.append("Apellido1", $('#input-apellido1').val());
        formData.append("Apellido2", $('#input-apellido2').val());
        formData.append("FechaNacimiento", $('#input-fecha').val());
        formData.append("CorreoElectronico", $('#input-correo').val());
        formData.append("Direccion", $('#input-direccion').val());
        formData.append("Contrasena", $('#input-contrasena').val());
        formData.append("FotoPerfil", $('#input-foto')[0].files[0]);

        $.ajax({
            method: "POST",
            url: api_url + "/api/Usuario/CrearUsuario",
            processData: false,
            contentType: false,
            data: formData
        }).done(function (response) {
            console.log("Registro - Success!", response);
            Swal.fire({
                title: "Registro exitoso",
                text: "Se ha notificado al administrador para la activación de la cuenta.",
                icon: "success"
            });
            $('#registroAsesorForm')[0].reset();
        }).fail(function (error) {
            console.log("Registro - ERROR!:", error);
            Swal.fire({
                title: "Error al registrar",
                text: "Ocurrió un error. Inténtalo más tarde.",
                icon: "error"
            });
        });
    }
}
