document.addEventListener('DOMContentLoaded', function () {
    const modalEdicion = document.getElementById('modalEdicionUsuario');
    const btnCerrarModalEditar = document.getElementById('btnCerrarModalEditar');
    const formEditar = document.getElementById('editarUsuarioForm');
    const alertEditExito = document.getElementById('modalEditAlertExito');
    const alertEditError = document.getElementById('modalEditAlertError');
    const grupoNuevoAsesor = document.getElementById('grupo-nuevo-asesor');
    const selectNuevoAsesor = document.getElementById('edit-nuevo-asesor');

    inicializarEventos();

    function inicializarEventos() {
        if (btnCerrarModalEditar) {
            btnCerrarModalEditar.addEventListener('click', function (e) {
                e.preventDefault();
                cerrarModalEdicion();
            });
        }

        if (modalEdicion) {
            modalEdicion.addEventListener('click', function (e) {
                if (e.target === modalEdicion) {
                    cerrarModalEdicion();
                }
            });
        }

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

                const nuevaContrasena = document.getElementById('edit-contrasena').value;
                if (nuevaContrasena) {
                    usuarioActualizado.Contrasena = nuevaContrasena;
                }

                if (grupoNuevoAsesor && !grupoNuevoAsesor.classList.contains('d-none')) {
                    usuarioActualizado.IdSupervisor = selectNuevoAsesor.value;
                }

                actualizarUsuario(usuarioActualizado);
            });
        }
    }

    function mostrarModalEdicion() {
        if (typeof Swal !== 'undefined') {
            Swal.close();
        }
        document.body.classList.add('modal-open');
        modalEdicion.classList.add('show');
    }

    function cerrarModalEdicion() {
        modalEdicion.classList.remove('show');
        setTimeout(function () {
            document.body.classList.remove('modal-open');
            alertEditExito.classList.add('d-none');
            alertEditError.classList.add('d-none');
            formEditar.reset();
        }, 300);
    }

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

    function cargarAsesores() {
        const api_url = "https://proyecto-software-2.azurewebsites.net";
        $.ajax({
            url: `${api_url}/api/Usuario/ObtenerAsesoresPorAdmin?idAdmin=1`,
            method: "GET",
            success: function (asesores) {
                selectNuevoAsesor.innerHTML = '<option value="">Seleccione un asesor</option>';
                asesores.forEach(asesor => {
                    const option = document.createElement('option');
                    option.value = asesor.id;
                    option.textContent = `${asesor.nombre} ${asesor.primerApellido}`;
                    selectNuevoAsesor.appendChild(option);
                });
            },
            error: function () {
                console.error("Error al cargar asesores.");
            }
        });
    }

    function cargarUsuarioParaEditar(userId) {
        mostrarCargandoModal("Cargando datos del usuario...");

        fetchUsuarioEditar(userId, function (usuario) {
            document.getElementById('edit-id').value = usuario.id;
            document.getElementById('edit-nombre').value = usuario.nombre || '';
            document.getElementById('edit-apellido1').value = usuario.primerApellido || '';
            document.getElementById('edit-apellido2').value = usuario.segundoApellido || '';
            document.getElementById('edit-correo').value = usuario.correoElectronico || '';
            document.getElementById('edit-direccion').value = usuario.direccion || '';
            document.getElementById('edit-contrasena').value = '';

            if (usuario.roles && usuario.roles.includes("Cliente")) {
                grupoNuevoAsesor.classList.remove("d-none");
                cargarAsesores();
            } else {
                grupoNuevoAsesor.classList.add("d-none");
            }

            mostrarModalEdicion();
        });
    }

    function fetchUsuarioEditar(userId, callback) {
        const api_url = "https://proyecto-software-2.azurewebsites.net";

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

    function actualizarUsuario(usuario) {
        const api_url = "https://proyecto-software-2.azurewebsites.net";

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
                alertEditExito.classList.remove('d-none');
                alertEditError.classList.add('d-none');
                modalEdicion.querySelector('.modal-content').scrollTop = 0;
                setTimeout(function () {
                    cerrarModalEdicion();
                    if (typeof window.fetchUsuarios === 'function') {
                        window.fetchUsuarios();
                    }
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
                alertEditError.classList.remove('d-none');
                alertEditExito.classList.add('d-none');
                alertEditError.textContent = `Error: ${error.responseText || "No se pudo actualizar el usuario"}`;
                modalEdicion.querySelector('.modal-content').scrollTop = 0;
                if (typeof Swal !== 'undefined') {
                    Swal.close();
                }
            }
        });
    }

    window.EditarUsuarioModal = {
        cargarUsuarioParaEditar: cargarUsuarioParaEditar
    };
});
