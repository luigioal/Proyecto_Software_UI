

document.addEventListener('DOMContentLoaded', function () {
    // Referencias a elementos DOM
    const modalEdicion = document.getElementById('modalEdicionUsuario');
    const btnCerrarModalEditar = document.getElementById('btnCerrarModalEditar');
    const formEditar = document.getElementById('editarUsuarioForm');
    const alertEditExito = document.getElementById('modalEditAlertExito');
    const alertEditError = document.getElementById('modalEditAlertError');

    // Inicializar eventos
    inicializarEventos();

    // Función principal para inicializar todos los eventos
    function inicializarEventos() {
        // Cerrar modal al hacer clic en el botón cancelar
        if (btnCerrarModalEditar) {
            btnCerrarModalEditar.addEventListener('click', function (e) {
                e.preventDefault();
                cerrarModalEdicion();
            });
        }

        // Cerrar modal al hacer clic fuera del contenido
        if (modalEdicion) {
            modalEdicion.addEventListener('click', function (e) {
                if (e.target === modalEdicion) {
                    cerrarModalEdicion();
                }
            });
        }

        // Manejar envío del formulario de edición
        if (formEditar) {
            if (window.FormValidator) {
                window.FormValidator.inicializar('editarUsuarioForm');
            }

            formEditar.addEventListener('submit', function (e) {
                e.preventDefault();

                const usuarioActualizado = {
                    Id: document.getElementById('edit-id').value,
                    Nombre: document.getElementById('edit-nombre').value,
                    PrimerApellido: document.getElementById('edit-apellido1').value,
                    SegundoApellido: document.getElementById('edit-apellido2').value,
                    CorreoElectronico: document.getElementById('edit-correo').value,
                    Direccion: document.getElementById('edit-direccion').value
                };

                // Solo incluir la contraseña si se ha proporcionado una nueva
                const nuevaContrasena = document.getElementById('edit-contrasena').value;
                if (nuevaContrasena) {
                    usuarioActualizado.Contrasena = nuevaContrasena;
                }

                actualizarUsuario(usuarioActualizado);
            });
        }
    }

    // Función para mostrar el modal de edición
    function mostrarModalEdicion() {
        if (typeof Swal !== 'undefined') {
            Swal.close(); // Cerrar cualquier Swal abierto
        }
        document.body.classList.add('modal-open');
        modalEdicion.classList.add('show');
    }

    // Función para cerrar el modal de edición
    function cerrarModalEdicion() {
        modalEdicion.classList.remove('show');

        // Esperar a que termine la transición antes de quitar la clase del body
        setTimeout(function () {
            document.body.classList.remove('modal-open');
            // Ocultar alertas
            alertEditExito.classList.add('d-none');
            alertEditError.classList.add('d-none');
            // Resetear el formulario
            formEditar.reset();
        }, 300);
    }

    // Mostrar indicador de carga en el modal
    function mostrarCargandoModal(mensaje) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: mensaje,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
        }
    }

    // Función para cargar un usuario para edición
    function cargarUsuarioParaEditar(userId) {
        mostrarCargandoModal("Cargando datos del usuario...");

        fetchUsuarioEditar(userId, function (usuario) {
            // Llenar el formulario con los datos del usuario
            document.getElementById('edit-id').value = usuario.id;
            document.getElementById('edit-nombre').value = usuario.nombre || '';
            document.getElementById('edit-apellido1').value = usuario.primerApellido || '';
            document.getElementById('edit-apellido2').value = usuario.segundoApellido || '';
            document.getElementById('edit-correo').value = usuario.correoElectronico || '';
            document.getElementById('edit-direccion').value = usuario.direccion || '';
            //AGREGAR LOS NUEVOS CAMPOS DEL FORM....
            

            // Contraseña vacía por defecto (se mantiene la actual si no se cambia)
            document.getElementById('edit-contrasena').value = '';

            // Mostrar el modal
            mostrarModalEdicion();
        });
    }

    // Función para obtener un usuario específico
    function fetchUsuarioEditar(userId, callback) {
        const api_url = "http://localhost:5058";

        $.ajax({
            url: `${api_url}/api/Usuario/ObtenerUsuario?idUsuario=${userId}`,
            method: "GET",
            contentType: "application/json",
            dataType: "json",
            success: function (data) {
                callback(data);
            },
            error: function (error) {
                console.error('Error al obtener usuario:', error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudo cargar la información del usuario",
                    icon: "error"
                });
            }
        });
    }

    // Función para enviar los datos actualizados al servidor
    function actualizarUsuario(usuario) {
        const api_url = "http://localhost:5058";

        // Mostrar indicador de carga
        mostrarCargandoModal("Actualizando usuario...");

        $.ajax({
            url: `${api_url}/api/Usuario/ModificarUsuario`,
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            data: JSON.stringify(usuario),
            success: function (response) {
                console.log("Usuario actualizado:", response);

                // Mostrar mensaje de éxito
                alertEditExito.classList.remove('d-none');
                alertEditError.classList.add('d-none');

                // Desplazar hacia arriba para ver el mensaje
                modalEdicion.querySelector('.modal-content').scrollTop = 0;

                // Cerrar después de unos segundos
                setTimeout(function () {
                    cerrarModalEdicion();

                    // Actualizar la tabla de usuarios
                    if (typeof window.fetchUsuarios === 'function') {
                        window.fetchUsuarios();
                    }

                    // Mostrar notificación
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: "Actualizado",
                            text: "Usuario actualizado correctamente",
                            icon: "success",
                            timer: 2000,
                            timerProgressBar: true
                        });
                    }
                }, 1500);
            },
            error: function (error) {
                console.error("Error al actualizar usuario:", error);

                // Mostrar mensaje de error
                alertEditError.classList.remove('d-none');
                alertEditExito.classList.add('d-none');
                alertEditError.textContent = `Error: ${error.responseText || "No se pudo actualizar el usuario"}`;

                // Desplazar hacia arriba para ver el mensaje
                modalEdicion.querySelector('.modal-content').scrollTop = 0;

                if (typeof Swal !== 'undefined') {
                    Swal.close();
                }
            }
        });
    }

    // Exponer funciones que necesitamos usar desde UsuariosAdmin.js
    window.EditarUsuarioModal = {
        cargarUsuarioParaEditar: cargarUsuarioParaEditar
    };
});