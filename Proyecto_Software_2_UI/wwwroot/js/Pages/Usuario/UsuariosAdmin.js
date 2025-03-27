
// Función para cargar y renderizar los usuarios
document.addEventListener('DOMContentLoaded', function () {
    // Referencia al contenedor donde se renderizarán las filas
    const userRowsContainer = document.querySelector('.user-mgmt-content');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'text-center py-3';
    loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';

    // Función para obtener los datos de los usuarios
    async function fetchUsuarios() {
        $.ajax({
            url: "http://localhost:5058/api/Usuario/ObtenerUsuarios",
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

            renderUsuarios(result);
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

    async function fetchUsuario(userId, callbackFunction) {
        return $.ajax({
            url: `http://localhost:5058/api/Usuario/ObtenerUsuario?idUsuario=${userId}`,
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

            callbackFunction(result);
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

    // Función para renderizar los usuarios en el componente
    function renderUsuarios(usuarios) {
        userRowsContainer.innerHTML = '';

        if (!usuarios || usuarios.length === 0) {
            userRowsContainer.innerHTML = `
                <div class="text-center py-4 text-secondary">
                    No se encontraron usuarios para mostrar.
                </div>
            `;
            return;
        }

        usuarios.forEach((usuario, index) => {
            const row = document.createElement('div');
            row.className = 'user-mgmt-row';
            row.setAttribute('data-id', usuario.id);

            // Aplicar fondo alterno para filas pares
            if (index % 2 !== 0) {
                row.classList.add('bg-light');
            }

            row.innerHTML = `
                <div class="user-mgmt-id">${usuario.id}</div>
                <div class="user-mgmt-name">
                    <div class="user-mgmt-avatar">
                        <img src="${usuario.fotoPerfil}">
                    </div>
                    ${usuario.nombre + " " + usuario.primerApellido + " " + usuario.segundoApellido}
                </div>
                <div class="user-mgmt-checkbox-container">
                    <span class="user-mgmt-custom-checkbox ${usuario.roles.includes("Admin") ? "user-mgmt-checkbox-active" : "user-mgmt-checkbox-inactive"}"></span>
                </div>
                <div class="user-mgmt-checkbox-container">
                    <span class="user-mgmt-custom-checkbox ${usuario.roles.includes("Asesor") ? "user-mgmt-checkbox-active" : "user-mgmt-checkbox-inactive"}"></span>
                </div>
                <div class="user-mgmt-checkbox-container">
                    <span class="user-mgmt-custom-checkbox ${usuario.roles.includes("Cliente") ? "user-mgmt-checkbox-active" : "user-mgmt-checkbox-inactive"}"></span>
                </div>
                <div class="user-mgmt-date">${formatearFecha(usuario.ultimoAcceso)}</div>
                <div class="user-mgmt-edit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                </div>
                <div class="user-mgmt-checkbox-container">
                    <label class="user-mgmt-toggle-switch">
                        <input type="checkbox" class="toggle-activo" ${usuario.estado ? "checked" : "unchecked"}>
                        <span class="user-mgmt-slider "></span>
                    </label>
                </div>
            `;

            userRowsContainer.appendChild(row);
        });

        // Agregar event listeners a los botones de edición
        document.querySelectorAll('.btn-editar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.getAttribute('data-id');
                //editarUsuario(userId);
            });
        });

        // Agregar event listeners a los toggles de activación
        document.querySelectorAll('.toggle-activo').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                e.preventDefault();
                cambiarEstadoUsuario(e.currentTarget);
            });
        });

        // Agregar event listeners a los checkbox de roles
        document.querySelectorAll('.user-mgmt-custom-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', function (e) {
                // Prevent the default action
                e.preventDefault();
                definirRolUsuario(e.currentTarget);
            });
        });

        // Función para formatear la fecha
        function formatearFecha(fechaStr) {
            if (!fechaStr) return 'N/A';

            try {
                // La fecha puede venir en diferentes formatos desde la API
                const fecha = new Date(fechaStr);
                if (isNaN(fecha.getTime())) return 'Fecha inválida';

                return fecha.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            } catch (error) {
                console.error('Error al formatear fecha:', error);
                return fechaStr;
            }
        }
    };

    function definirRolUsuario(entity) {
        // Get checkbox details
        const row = entity.closest('.user-mgmt-row');
        const userName = row.querySelector('.user-mgmt-name').textContent.trim();
        const userId = row.querySelector('.user-mgmt-id').textContent.trim();

        // Determine which role is being changed
        const colIndex = Array.from(row.children).indexOf(entity.parentNode);
        let roleName = "";

        // Map column index to role name
        switch (colIndex) {
            case 2: roleName = "Admin"; break;
            case 3: roleName = "Asesor"; break;
            case 4: roleName = "Cliente"; break;
            default: roleName = "Rol desconocido";
        }

        // Check current state
        const isActive = entity.classList.contains('user-mgmt-checkbox-active');
        const actionText = isActive ? 'quitar' : 'asignar';

        // Show confirmation dialog
        Swal.fire({
            title: `¿${isActive ? 'Quitar' : 'Asignar'} rol de ${roleName}?`,
            html: `¿Estás seguro que deseas ${actionText} el rol de <b>${roleName}</b> al usuario <b>${userName}</b>?`,
            showCancelButton: true,
            confirmButton: '<p style="color: blue;">This is a custom message.</p>',
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'No',
            reverseButtons: true,
            focusCancel: true,
            customClass: {
                confirmButton: 'checkbox-custom-confirm-button'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                //Enviar instruccion al backend sobre el rol del usuario
                var api_url = "http://localhost:5058/";
                console.log(userId, roleName);
                $.ajax({
                    url: api_url + `api/Usuario/ModificarRolesDeUsuario?idUsuario=${userId}&rol=${roleName}`,
                    method: 'PUT'
                }).done(function () {
                    entity.classList.toggle('user-mgmt-checkbox-active');
                    Swal.fire({
                        title: 'Completado',
                        html: `El rol de ${roleName} ha sido ${isActive ? 'removido de' : 'asignado a'} <b>${userName}</b> correctamente.`,
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        timer: 2000,
                        timerProgressBar: true,
                        customClass: {
                            confirmButton: 'checkbox-custom-confirm-button'
                        }
                    });
                }).fail(function () {
                    Swal.fire({
                        title: "Message",
                        text: "Hubo un erro al llamar al API",
                        icon: "error"
                    })
                })
            }
        });
    };



    // Función para editar un usuario
    function editarUsuario(userId) {
        console.log(`Editando usuario con ID: ${userId}`);
        // Aquí implementarías la lógica para abrir un modal de edición
        // o navegar a la página de edición

        // Ejemplo de redirección:
        // window.location.href = `/Usuario/Editar/${userId}`;

        // O abrir un modal (ejemplo):
        // $('#modalEditarUsuario').modal('show');
        // document.getElementById('userId').value = userId;
        };

    // Función para cambiar el estado activo/inactivo de un usuario
    async function cambiarEstadoUsuario(entity) {
        const row = entity.closest('.user-mgmt-row');
        const userName = row.querySelector('.user-mgmt-name').textContent.trim();
        const userId = row.querySelector('.user-mgmt-id').textContent.trim();

        const actionText = !entity.checked ? 'desactivar' : 'activar';

        Swal.fire({
            title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} la cuenta de ${userName}?`,
            html: `¿Estás seguro que deseas ${actionText} la cuenta de <b>${userName}</b>?`,
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar',
            cancelButtonText: 'No',
            reverseButtons: true,
            focusCancel: true,
            customClass: {
                confirmButton: 'checkbox-custom-confirm-button'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                //Enviar instruccion al backend para cambiar estado del usuario
                var api_url = "http://localhost:5058/";
                entity.checked = entity.checked;
                $.ajax({
                    url: api_url + `api/Usuario/ActivarDesactivarUsuario?idUsuario=${userId}&nuevoEstado=${entity.checked}`,
                    method: 'PUT'
                }).done(function () {
                    entity.classList.toggle('user-mgmt-checkbox-active');
                    Swal.fire({
                        title: 'Completado',
                        html: `La cuenta de ${userName} ha sido ${!entity.checked ? 'deactivada' : 'activada'} correctamente.`,
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        timer: 3500,
                        timerProgressBar: true,
                        customClass: {
                            confirmButton: 'checkbox-custom-confirm-button'
                        }
                    });
                }).fail(function () {
                    Swal.fire({
                        title: "Message",
                        text: "Hubo un erro al llamar al API",
                        icon: "error"
                    })
                })
            }
            else {
                entity.checked = !entity.checked;
            }
        });
    }

    // Event listener para el botón de registro
    const btnRegistrar = document.getElementById('btnRegistrar');
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', () => {
            console.log('Registrando nuevo usuario');
            // Implementar lógica para abrir modal de registro o redireccionar
            // window.location.href = '/Usuario/Registrar';
        });
    }

    // Cargar los usuarios al iniciar
    fetchUsuarios();
    });
