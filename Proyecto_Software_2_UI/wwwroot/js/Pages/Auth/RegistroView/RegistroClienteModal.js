document.addEventListener('DOMContentLoaded', function () {
    // Buscar el botón dentro de user-mgmt-panel (o usar el ID)
    const btnRegistrarPanel = document.getElementById('btn-registrar');
    const modalConfirmacion = document.getElementById('modalConfirmacion');
    const btnCerrarModal = document.getElementById('btnCerrarModal-cliente');
    const registroModalForm = document.getElementById('registroClienteModalForm');
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

    FormValidator.inicializar('registroClienteModalForm');

    const registroCliente = new RegistroCliente();

    document.getElementById("registroClienteModalForm").addEventListener("submit", function (event) {
        event.preventDefault();

        if (FormValidator.validarFormulario('registroClienteModalForm')) {
            registroCliente.SubmitRegistroRequest();
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

function RegistroCliente() {
    this.SubmitRegistroRequest = async function () {
        const formData = new FormData();

        const fotoPerfil = document.getElementById('input-foto-cliente').files[0];
        try {
            const urlFoto = await S3Uploader.uploadFile(fotoPerfil);
            formData.append("FotoPerfil", urlFoto);
            //console.log('File uploaded to:', fileUrl);
        } catch (error) {
            alert('Upload failed: ' + error.message);
        }

        const archivoContrato = document.getElementById('input-archivo-cliente').files[0];
        try {
            const urlArchivo = await S3Uploader.uploadFile(archivoContrato);
            formData.append("DocumentoContrato", urlArchivo);
            //console.log('File uploaded to:', fileUrl);
        } catch (error) {
            alert('Upload failed: ' + error.message);
        }

        formData.append("IdSupervisor", id);
        formData.append("Nombre", $('#input-nombre-cliente').val());
        formData.append("PrimerApellido", $('#input-apellido1-cliente').val());
        formData.append("SegundoApellido", $('#input-apellido2-cliente').val());
        formData.append("FechaNacimiento", $('#input-fecha-cliente').val());
        formData.append("CorreoElectronico", $('#input-email-cliente').val());
        formData.append("Direccion", $('#input-direccion-cliente').val());
        formData.append("Contrasena", $('#input-password-cliente').val());
        formData.append("FechaRegistro", new Date().toISOString());
        formData.append("Tipo", "Cliente");
        formData.append("Estado", false);

        $.ajax({
            method: "POST",
            url: baseUrl + "/api/Usuario/CrearUsuario",
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
            $('#registroClienteModalForm')[0].reset();
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
        url: baseUrl + "/api/Usuario/BuscarUsuarioPorEmail?",
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