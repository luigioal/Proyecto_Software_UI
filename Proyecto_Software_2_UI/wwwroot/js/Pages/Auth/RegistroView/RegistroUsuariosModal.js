document.addEventListener('DOMContentLoaded', function () {
    // Buscar el botón dentro de user-mgmt-panel (o usar el ID)
    const btnRegistrarPanel = document.getElementById('btn-registrar');
    const modalConfirmacion = document.getElementById('modalConfirmacion');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const registroModalForm = document.getElementById('registroUsuariosModalForm');
    const modalAlertExito = document.getElementById('modalAlertExito');
    const modalAlertError = document.getElementById('modalAlertError');

    // Selectores de roles
    const roleCliente = document.getElementById('roleCliente');
    const roleAsesor = document.getElementById('roleAsesor');
    const roleAdmin = document.getElementById('roleAdmin');

    // Campos específicos por rol
    const asesorFields = document.querySelector('.asesor-fields');
    const adminFields = document.querySelector('.admin-fields');
    const clienteFields = document.querySelectorAll('.cliente-fields');
    const tipoUsuarioInput = document.getElementById('tipoUsuario');

    // Gestionar cambio de roles
    function handleRoleChange() {
        // Ocultar todos los campos específicos
        asesorFields.style.display = 'none';
        adminFields.style.display = 'none';
        clienteFields.forEach(field => { field.style.display = 'none'; });

        // Mostrar campos según el rol seleccionado
        if (roleAsesor.checked) {
            asesorFields.style.display = 'block';
            tipoUsuarioInput.value = 'asesor';
        } else if (roleAdmin.checked) {
            adminFields.style.display = 'block';
            tipoUsuarioInput.value = 'admin';
        } else if (roleCliente.checked) {
            clienteFields.forEach(field => { field.style.display = 'block'; });
            tipoUsuarioInput.value = 'cliente';
        }
    }

    // Asignar event listeners para cambios de rol
    roleCliente.addEventListener('change', handleRoleChange);
    roleAsesor.addEventListener('change', handleRoleChange);
    roleAdmin.addEventListener('change', handleRoleChange);

    // Inicializar visualización de campos según el rol seleccionado
    handleRoleChange();

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

            // Restablecer al rol predeterminado (Cliente)
            roleCliente.checked = true;
            handleRoleChange();
        }, 300);
    }

    FormValidator.inicializar('registroUsuariosModalForm');

    //const registroManager = new RegistroAsesor();

    //document.getElementById("registroAsesorForm").addEventListener("submit", function (event) {
    //    event.preventDefault();

    //    if (FormValidator.validarFormulario('registroAsesorForm')) {
    //        registroManager.SubmitRegistroRequest();
    //        console.log('Formulario válido, enviando datos...');
    //    } else {
    //        Swal.fire({
    //            title: "Registro incompleto",
    //            text: "Por favor, completa todos los campos requeridos.",
    //            icon: "warning"
    //        });
    //    }
    //});
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
