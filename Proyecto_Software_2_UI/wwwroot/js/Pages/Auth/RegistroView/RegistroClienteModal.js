document.addEventListener('DOMContentLoaded', function () {
    // Buscar el botón dentro de user-mgmt-panel (o usar el ID)
    const btnRegistrarPanel = document.getElementById('btn-registrar');
    const modalConfirmacion = document.getElementById('modalConfirmacion');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const registroModalForm = document.getElementById('registroUsuariosModalForm');
    const modalAlertExito = document.getElementById('modalAlertExito');
    const modalAlertError = document.getElementById('modalAlertError');

    

    // Función para mostrar el modal
    function mostrarModal(e) {
        if (e) e.preventDefault();
        document.body.classList.add('modal-open');
        modalConfirmacion.classList.add('show');
    }

    btnRegistrarPanel.addEventListener('click', mostrarModal);

    // Cerrar modal al hacer clic en el botón cancelar
    btnCerrarModal.addEventListener('click', function (e) {
        e.preventDefault();
        cerrarModal();
    });

    // Cerrar modal al hacer clic fuera del contenido
    modalConfirmacion.addEventListener('click', function (e) {
        if (e.target === modalConfirmacion) {
            cerrarModal();
        }
    });

    // Procesar envío del formulario modal
    registroModalForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Aquí se procesaría el formulario (AJAX, etc.)
        // Por ejemplo, mostrar mensaje de éxito
        modalAlertExito.classList.remove('d-none');

        // O mostrar mensaje de error
        // modalAlertError.classList.remove('d-none');

        // Desplazar hacia arriba para ver el mensaje
        modalConfirmacion.querySelector('.modal-content').scrollTop = 0;

        // Opcional: cerrar después de unos segundos
        // setTimeout(cerrarModal, 3000);
    });

    function cerrarModal() {
        modalConfirmacion.classList.remove('show');

        // Esperar a que termine la transición antes de quitar la clase del body
        setTimeout(function () {
            document.body.classList.remove('modal-open');
            // Ocultar alertas cuando se cierra el modal
            modalAlertExito.classList.add('d-none');
            modalAlertError.classList.add('d-none');
            // Opcional: resetear el formulario
            registroModalForm.reset();

         
            
        }, 300);
    }

    FormValidator.inicializar('registroUsuariosModalForm');

    const registroManager = new RegistroAsesor();

    document.getElementById("registroUsuariosModalForm").addEventListener("submit", function (event) {
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
        let api_url = "https://proyecto-software-2.azurewebsites.net";

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

function RegistroCliente() {
    this.SubmitRegistroRequest = function () {
        let idSupervisor = buscar

        let api_url = "https://proyecto-software-2.azurewebsites.net";

        const formData = new FormData();
        formData.append("IdSupervisor", $('#input-').val());
        formData.append("Nombre", $('#input-nombre').val());
        formData.append("Apellido1", $('#input-apellido1').val());
        formData.append("Apellido2", $('#input-apellido2').val());
        formData.append("FechaNacimiento", $('#input-fecha').val());
        formData.append("CorreoElectronico", $('#input-correo').val());
        formData.append("Direccion", $('#input-direccion').val());
        formData.append("Contrasena", $('#input-contrasena').val());
        formData.append("FotoPerfil", $('#input-foto')[0].files[0]);
        formData.append("DocumentoContrato", $('#input-archivo')[0].files[0]);
        formData.append("Estado", false);

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

function buscarSuperDeUsuario(idUsuario) {
    let idSuper = 0;
    $.ajax({
        url: "https://proyecto-software-2.azurewebsites.net/api/Usuario/BuscarUsuarioPorEmail?",
        method: "GET",
        contentType: "application/json:charset=utf-8",
        dataType: "json"
    }).done(function (result) {
        //Implementacion con wrapper API_Response en el backend
        //if (result.result == "OK") {
        //    renderUsuarios(result.data);
        //}
        //else {
        //    throw new Error(`Error HTTP: ${result.message}`);
        //}
        console.log(result)
        const resultados = filtrarResultados(result);
        renderUsuarios(resultados);
    }
    ).fail(function (error) {
        console.error('Error al obtener usuarios:', error);
        userRowsContainer.innerHTML = `
                <div class="alert alert-danger my-3" role="alert">
                    Error al cargar los usuarios. Por favor, intente de nuevo más tarde.
                </div>
            `;
        //Swal.fire({
        //    title: "Message",
        //    text: "Error Loaoding Vacation Data",
        //    icon: "error"
        //})
    });

}