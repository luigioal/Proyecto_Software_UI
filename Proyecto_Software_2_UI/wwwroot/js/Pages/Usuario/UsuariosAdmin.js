// Función para cargar y renderizar los usuarios

let usuarioActualString = sessionStorage.getItem('usuarioActual');
let usuarioActual = JSON.parse(usuarioActualString);
const id = usuarioActual.id;

document.addEventListener('DOMContentLoaded', function () {
    const idAdmin = id;
    // Referencia al contenedor donde se renderizarán las filas
    const userRowsContainer = document.querySelector('.user-mgmt-content');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'text-center py-3';
    loadingIndicator.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
    state = [];

    // Función para obtener los datos de los usuarios
    async function fetchUsuarios() {
        $.ajax({
            url: "https://proyecto-software-2.azurewebsites.net/api/Usuario/ObtenerUsuarios",
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

    function filtrarResultados(resultados) {
        const adminsFiltrados = [];
        const asesoresFiltrados = [];
        const clientesFiltrados = []
        const asesorIds = new Set(); // Track supervisor IDs for faster lookup

        // First pass: Filter by direct conditions
        resultados.forEach(resultado => {
            if (resultado.idSupervisor === 0) {
                adminsFiltrados.push(resultado);
            }
            if (resultado.idSupervisor === idAdmin) {
                asesoresFiltrados.push(resultado);
                asesorIds.add(resultado.id); // Store IDs for quick lookup
            }
        });

        // Second pass: Add results linked to asesores
        resultados.forEach(resultado => {
            if (asesorIds.has(resultado.idSupervisor)) {
                clientesFiltrados.push(resultado);
            }
        });
        state.asesores = asesoresFiltrados;
        state.admins = adminsFiltrados;
        state.clientes = clientesFiltrados;


        // Return combined array (no duplicates)
        return [...adminsFiltrados, ...asesoresFiltrados, ...clientesFiltrados];
    }

    //async function fetchUsuario(userId, callbackFunction) {
    //    return $.ajax({
    //        url: `proyecto-software-2.azurewebsites.net/api/Usuario/ObtenerUsuario?idUsuario=${userId}`,
    //        method: "GET",
    //        contentType: "application/json:charset=utf-8",
    //        dataType: "json"
    //    }).done(function (result) {
            //Implementacion con wrapper API_Response en el backend
            //if (result.result == "OK") {
            //    renderUsuarios(result.data);
            //}
            //else {
            //    throw new Error(`Error HTTP: ${result.message}`);
            //}

    //async function fetchUsuario(userId, callbackFunction) {
    //    return $.ajax({
    //        url: `proyecto-software-2.azurewebsites.net/api/Usuario/ObtenerUsuario?idUsuario=${userId}`,
    //        method: "GET",
    //        contentType: "application/json:charset=utf-8",
    //        dataType: "json"
    //    }).done(function (result) {
    //        //Implementacion con wrapper API_Response en el backend
    //        //if (result.result == "OK") {
    //        //    renderUsuarios(result.data);
    //        //}
    //        //else {
    //        //    throw new Error(`Error HTTP: ${result.message}`);
    //        //}


    //        callbackFunction(result);
    //    }
    //    ).fail(function (error) {
    //        console.error('Error al obtener usuarios:', error);
    //        userRowsContainer.innerHTML = `
    //                <div class="alert alert-danger my-3" role="alert">
    //                    Error al cargar los usuarios. Por favor, intente de nuevo más tarde.
    //                </div>
    //                `;
    //        //Swal.fire({
    //        //    title: "Message",
    //        //    text: "Error Loaoding Vacation Data",
    //        //    icon: "error"
    //        //})
    //    });
    //}

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

        // Define which IDs should be grayed out (inactive)
        const inactiveUserIds = [idAdmin]; // Add your specific IDs here

        usuarios.forEach((usuario, index) => {
            const row = document.createElement('div');
            row.className = 'user-mgmt-row';
            row.setAttribute('data-id', usuario.id);

            // Check if this user should be inactive
            const isInactive = inactiveUserIds.includes(usuario.id);
            if (isInactive) {
                row.classList.add('user-row-inactive');
            }

            // Apply alternate background for even rows
            if (index % 2 !== 0) {
                row.classList.add('bg-light');
            }

            row.innerHTML = `
            <div class="user-mgmt-id ${isInactive ? 'text-muted' : ''}">${usuario.id}</div>
            <div class="user-mgmt-name ${isInactive ? 'text-muted' : ''}">
                <div class="user-mgmt-avatar">
                    <img ${usuario.fotoPerfil != 'string' ? 'src="' + usuario.fotoPerfil + '"' : ""} 
                         ${isInactive ? 'style="filter: grayscale(80%); opacity: 0.7;"' : ''}>
                </div>
                ${usuario.nombre + " " + usuario.primerApellido + " " + usuario.segundoApellido}
            </div>

            <div class="user-mgmt-checkbox-container ${!usuario.estado || isInactive ? "opacity-50" : ""}">
                <span class="user-mgmt-custom-checkbox ${isInactive ? "text-muted" : ""} ${usuario.roles.includes("Admin") ? "user-mgmt-checkbox-active" : "user-mgmt-checkbox-inactive"}">
                </span>
            </div>
            <div class="user-mgmt-checkbox-container ${!usuario.estado || isInactive ? "opacity-50" : ""}">
                <span class="user-mgmt-custom-checkbox ${isInactive ? "text-muted" : ""} ${usuario.roles.includes("Asesor") ? "user-mgmt-checkbox-active" : "user-mgmt-checkbox-inactive"}"></span>
            </div>
            <div class="user-mgmt-checkbox-container ${!usuario.estado || isInactive ? "opacity-50" : ""}">
                <span class="user-mgmt-custom-checkbox ${isInactive ? "text-muted" : ""} ${usuario.roles.includes("Cliente") ? "user-mgmt-checkbox-active" : "user-mgmt-checkbox-inactive"}"></span>
            </div>
            <div class="user-mgmt-date ${isInactive ? 'text-muted' : ''}">${formatearFecha(usuario.ultimoAcceso)}</div>
            <div class="user-mgmt-edit-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${isInactive ? 'fill="#999"' : ''}>
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
            </div>
            <div class="user-mgmt-actions-container">
                <label class="user-mgmt-toggle-switch ${isInactive ? 'disabled' : ''}">
                    <input type="checkbox" class="toggle-activo" ${usuario.estado ? "checked" : ""} ${isInactive ? 'disabled' : ''}>
                    <span class="user-mgmt-slider ${isInactive ? 'disabled' : ''}"></span>
                </label>
                <div class="user-mgmt-delete-icon" title="Eliminar usuario" data-id="${usuario.id}" ${isInactive ? 'style="pointer-events: none; opacity: 0.5;"' : ''}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" ${isInactive ? 'fill="#999"' : ''}>
                        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                </div>
            </div>
        `;

            userRowsContainer.appendChild(row);
        });

        // Rest of your event listeners...
        document.querySelectorAll('.user-mgmt-row').forEach(row => {
            const stateReference = row.querySelector('.toggle-activo');
            if (!stateReference.checked && !row.classList.contains('user-row-inactive')) {
                row.addEventListener("mouseenter", makeVisible);
                row.addEventListener('mouseleave', makeInvisible);
            }
        });

        // Esto para abrir el modal/poUup de Editar Usuario
        document.querySelectorAll('.user-mgmt-edit-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.closest('.user-mgmt-row').getAttribute('data-id');
                console.log("Editando Usuario ID:", userId);

                // Usar el módulo de edición para cargar el usuario
                if (window.EditarUsuarioModal) {
                    window.EditarUsuarioModal.cargarUsuarioParaEditar(userId);
                }
            });
        });

        document.querySelectorAll('.toggle-activo').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                cambiarEstadoUsuario(e.currentTarget);
            });
        });

        document.querySelectorAll('.user-mgmt-custom-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', function (e) {
                e.preventDefault();
                const row = e.currentTarget.closest('.user-mgmt-row');
                const isActive = row.querySelector('.toggle-activo').checked;
                if (isActive) {
                    definirRolUsuario(e.currentTarget);
                }
            });
        });

        // Add event listener for delete bucket icon
        document.querySelectorAll('.user-mgmt-delete-icon').forEach(deleteIcon => {
            deleteIcon.addEventListener('click', function (e) {
                e.preventDefault();
                const userId = this.getAttribute('data-id');
                const row = this.closest('.user-mgmt-row');
                const userName = row.querySelector('.user-mgmt-name').textContent.trim();
                eliminarUsuario(userId, userName);
            });
        });

        // Additional event to update delete icon visibility when user state changes
        document.querySelectorAll('.toggle-activo').forEach(toggle => {
            toggle.addEventListener('change', function () {
                const row = this.closest('.user-mgmt-row');

                if (!this.checked) {
                    row.addEventListener('mouseenter', makeVisible);
                    row.addEventListener('mouseleave', makeInvisible);
                } else {
                    row.removeEventListener('mouseenter', makeVisible);
                    row.removeEventListener('mouseleave', makeInvisible);
                }
            });
        });

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
    }

    // New function to handle user deletion
    function eliminarUsuario(userId, userName) {
        Swal.fire({
            title: `¿Eliminar usuario ${userName}?`,
            html: `¿Estás seguro que deseas eliminar permanentemente al usuario <b>${userName}</b>? Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#e74c3c',
            reverseButtons: true,
            focusCancel: true
        }).then((result) => {
            if (result.isConfirmed) {
                // Call API to delete user
                var api_url = "proyecto-software-2.azurewebsites.net";
                $.ajax({
                    url: api_url + `api/Usuario/EliminarUsuario?idUsuario=${userId}`,
                    method: 'DELETE'
                }).done(function () {
                    // Remove the row from UI
                    const row = document.querySelector(`.user-mgmt-row[data-id="${userId}"]`);
                    if (row) {
                        row.remove();
                    }

                    Swal.fire({
                        title: 'Eliminado',
                        html: `El usuario <b>${userName}</b> ha sido eliminado correctamente.`,
                        icon: 'success',
                        confirmButtonText: 'Aceptar',
                        timer: 2000,
                        timerProgressBar: true
                    });
                }).fail(function (error) {
                    console.error('Error al eliminar usuario:', error);
                    Swal.fire({
                        title: "Error",
                        text: "Hubo un error al eliminar el usuario",
                        icon: "error"
                    });
                });
            }
        });
    }



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
                var api_url = "proyecto-software-2.azurewebsites.net";
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

    function makeVisible(e) {
        const deleteIcon = e.currentTarget.querySelector('.user-mgmt-delete-icon');
        deleteIcon.style.opacity = '1';
        deleteIcon.style.width = '35px';
        deleteIcon.style.visibility = 'visible';
        deleteIcon.setAttribute('margin-left', '10px');
    }

    function makeInvisible(e) {
        const deleteIcon = e.currentTarget.querySelector('.user-mgmt-delete-icon');
        deleteIcon.style.opacity = '0';
        deleteIcon.style.width = '0px';
        deleteIcon.style.visibility = 'invisible';
        deleteIcon.setAttribute('margin-left', '0px');
    }

    // Función para cambiar el estado activo/inactivo de un usuario
    async function cambiarEstadoUsuario(entity) {
        const row = entity.closest('.user-mgmt-row');
        const deleteIcon = row.querySelector('.user-mgmt-delete-icon');
        const userName = row.querySelector('.user-mgmt-name').textContent.trim();
        const userId = row.querySelector('.user-mgmt-id').textContent.trim();

        const actionText = !entity.checked ? 'desactivar' : 'activar';

        // Only show email checkbox when activating a user (not when deactivating)
        const emailCheckboxHtml = !entity.checked ? '' : `
        <div class="mt-4 text-left">
            <input type="checkbox" id="send-activation-email" checked>
            <label for="send-activation-email" class="ml-2">Enviar correo de activación al usuario</label>
        </div>
    `;

        Swal.fire({
            title: `¿${actionText.charAt(0).toUpperCase() + actionText.slice(1)} la cuenta de ${userName}?`,
            html: `¿Estás seguro que deseas ${actionText} la cuenta de <b>${userName}</b>?${emailCheckboxHtml}`,
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
                // Check if the email checkbox is checked (only when activating)
                const sendEmail = !entity.checked ? false : document.getElementById('send-activation-email')?.checked || false;

                //Enviar instruccion al backend para cambiar estado del usuario
                var api_url = "proyecto-software-2.azurewebsites.net";
                $.ajax({
                    url: api_url + `api/Usuario/ActivarDesactivarUsuario?idUsuario=${userId}&nuevoEstado=${!entity.checked}&enviarCorreo=${sendEmail}`,
                    method: 'PUT'
                }).done(function () {
                    entity.checked = !entity.checked;
                    row.querySelectorAll('.user-mgmt-checkbox-container').forEach(checkbox => checkbox.classList.toggle('opacity-50'));

                    if (entity.checked) {
                        row.removeEventListener('mouseenter', makeVisible);
                        row.removeEventListener('mouseleave', makeInvisible);
                    }
                    else {
                        row.addEventListener('mouseenter', makeVisible);
                        row.addEventListener('mouseleave', makeInvisible);
                    }
                    deleteIcon.classList.toggle('can-delete');
                    entity.classList.toggle('user-mgmt-checkbox-active');

                    // Update success message to include email status if an activation email was sent
                    let successMessage = `La cuenta de ${userName} ha sido ${!entity.checked ? 'desactivada' : 'activada'} correctamente.`;
                    if (sendEmail) {
                        successMessage += `<br><br>Se ha enviado un correo de activación al usuario.`;
                    }

                    Swal.fire({
                        title: 'Completado',
                        html: successMessage,
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
                        text: "Hubo un error al llamar al API",
                        icon: "error"
                    })
                })

            }
        });
    }

    // Exponer fetchUsuarios globalmente para que el modal pueda actualizar la tabla
    window.fetchUsuarios = fetchUsuarios;

    // Cargar los usuarios al iniciar
    fetchUsuarios();
});