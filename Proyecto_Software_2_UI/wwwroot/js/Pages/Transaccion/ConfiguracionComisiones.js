
document.addEventListener('DOMContentLoaded', function () {

    // Configuración de API endpoints
    const API = {
        cargosExtra: "http://localhost:5058/api/Transaccion/ObtenerCargosExtra",
        modificarCargosExtra: "http://localhost:5058/api/Transaccion/ModificarCargosExtra"
    };

    // Estado de la aplicación
    let cargosExtra = {};

    // Referencias a elementos DOM
    const elements = {
        cargosExtraInputs: document.querySelectorAll('.settings-value'),
        editIcons: document.querySelectorAll('.settings-edit'),
        saveButton: document.getElementById('saveButton')
    };

    function establecerEventListeners() {
        // Add event listeners to edit icons
        document.querySelectorAll('.settings-edit').forEach((icon, index) => {
            icon.addEventListener('click', function () {
                enableEditing(document.querySelectorAll('.settings-value')[index])
            });
        });

        // Handle save button click
        const saveButton = elements.saveButton;
        saveButton.addEventListener('click', function () {
            // Collect all values
            const cargosExtra = {
                ComisionTransaccion: document.getElementById('comisionTransaccion').value,
                ComisionAsesor: document.getElementById('comisionAsesor').value,
                ComisionAsesorGanancia: document.getElementById('comisionAsesorGanancia').value,
                ComisionAsesorPerdida: document.getElementById('comisionAsesorPerdida').value,
                ImpuestoSobreGanancia: document.getElementById('impuestoSobreGanancia').value,
                TarifaMinimaTransaccion: document.getElementById('tarifaMinimaTransaccion').value
            }

            // Do the POST API call
            $.ajax({
                headers: {
                    'Accept': "application/json",
                    'Content-Type': "application/json",
                },
                method: "POST",
                url: API.modificarCargosExtra,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(cargosExtra),
                hasContent: true
            }).done(function () {
                // Show success message with SweetAlert
                Swal.fire({
                    title: 'Guardado',
                    text: 'La configuración de comisiones ha sido guardada',
                    icon: 'success',
                    confirmButtonText: 'Aceptar',
                    confirmButtonColor: '#4CAF50'
                });
            }).fail(function () {
                Swal.fire({
                    title: "Message",
                    text: "Hubo un erro al llamar al API",
                    icon: "error"
                })
            })
        });
    }

    // Function to enable editing
    function enableEditing(input) {
        console.log('enabling');
        // Store original value
        const originalValue = input.value;
        input.setAttribute('data-original', originalValue);

        // Enable editing
        input.readOnly = false;
        input.classList.add('editing');
        input.focus();
        input.select();

        // Add event listeners
        input.addEventListener('keydown', handleKeyPress);
        input.addEventListener('blur', handleBlur);
    }

    // Funciones para obtener datos
    async function fetchCargosExtra() {
        try {
            const response = await fetch(API.cargosExtra);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error al obtener información de las comisiones e impuestos:', error);
            // Retornar datos por defecto en caso de error
            return {
                comisionTransaccion: 1.,
                comisionAsesor: 1.,
                comisionAsesorGanancia: 1.,
                comisionAsesorPerdida: 1.,
                impuestoSobreGanancia: 1.,
                tarifaMinimaTransaccion: 1.,
                editIcons: document.querySelector('.settings-edit'),
            };
        }
    }

    function renderizarCargosExtra(cargosExtra) {
        cargoRowsContainer = document.querySelector('.settings-form');
        heightDiv = document.createElement('div');
        heightDiv.innerHTML = '<div style="height: 84px;"></div>'
        cargoRowsContainer.innerHTML = '';

        if (!cargosExtra || cargosExtra.length === 0) {
            cargoRowsContainer.innerHTML = `
                <div class="text-center py-4 text-secondary">
                    No se encontraron cargos para mostrar.
                </div>
            `;
            return;
        }

        Object.entries(cargosExtra).forEach(([key, value]) => {
            const row = document.createElement('div');
            row.className = 'settings-form';

            row.innerHTML = `
                <div class="settings-row">
                    <label class="settings-label">${value.descripcion}</label>
                    <div class="settings-symbol">${!(key == 'tarifaMinimaTransaccion') ? "%": "$"}</div>
                    <input type="text" class="settings-value" id="${key}" value="${value.valor}" readonly>
                    <div class="settings-edit">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                    </div>
                </div>
            `;

            cargoRowsContainer.appendChild(row);
        });

        cargoRowsContainer.appendChild(heightDiv);
    }
    // Inicializar carga de datos

    async function inicializarComponente() {
        try {
            // Mostrar indicadores de carga
            mostrarCargando();

            // Cargar datos de cargosExtra
            const peticionCargosExtra = await fetchCargosExtra();

            // Guardar datos en el estado
            cargosExtra["comisionAsesor"] = { descripcion: "Comision de asesor por transaccion", valor: peticionCargosExtra.comisionAsesor };
            cargosExtra["comisionAsesorGanancia"] = { descripcion: "Comision de asesor por venta con ganancia", valor: peticionCargosExtra.comisionAsesorGanancia };
            cargosExtra["comisionAsesorPerdida"] = { descripcion: "Comision de asesor por venta con perdida", valor: peticionCargosExtra.comisionAsesorPerdida };
            cargosExtra["comisionTransaccion"] = { descripcion: "Comision de plataforma por transaccion", valor: peticionCargosExtra.comisionTransaccion };
            cargosExtra["tarifaMinimaTransaccion"] = { descripcion: "Tarifa minima por transaccion", valor: peticionCargosExtra.tarifaMinimaTransaccion };
            cargosExtra["impuestoSobreGanancia"] = { descripcion: "Impuesto sobre ganancia", valor: peticionCargosExtra.impuestoSobreGanancia };

            // Renderizar información
            renderizarCargosExtra(cargosExtra);

            // Asignar listeners a elementos
            establecerEventListeners();
        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
            mostrarError('No se pudo cargar la información del dashboard', error.message);
        }
    }

    // Handle key presses during editing
    function handleKeyPress(e) {
        // Enter key confirms editing
        if (e.key === 'Enter') {
            e.preventDefault();
            this.blur();
            return;
        }

        // Escape key cancels editing
        if (e.key === 'Escape') {
            e.preventDefault();
            this.value = this.getAttribute('data-original');
            this.blur();
            return;
        }

        // Allow only numbers, backspace, delete, arrows
        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
        const isNumber = /^[\d.]$/.test(e.key);  // Changed regex to allow digits and dot

        if (!isNumber && !allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
    }

    function mostrarCargando() {
        // Si tenemos SweetAlert, usarlo
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: 'Cargando información...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });
            setTimeout(() => Swal.close(), 1000); // Cerrar después de 1 segundo máximo
        }

        // Si no hay SweetAlert, usar indicadores nativos
        if (elements.asesorList) {
            elements.asesorList.innerHTML = '<div class="loading">Cargando asesores...</div>';
        }
    }

    function mostrarError(titulo, mensaje) {
        // Si tenemos SweetAlert, usarlo
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: titulo,
                text: mensaje,
                icon: 'error',
                confirmButtonText: 'Reintentar',
                confirmButtonColor: '#4b5563'
            }).then(result => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
            return;
        }

        // Fallback si no hay SweetAlert
        alert(`${titulo}\n${mensaje}`);
    }

    // Handle blur event
    function handleBlur() {
        // Get original value
        const originalValue = this.getAttribute('data-original');
        let newValue = this.value.trim();

        // Validate value
        if (newValue === '' || isNaN(newValue)) {
            // Reset to original if invalid
            this.value = originalValue;
            this.readOnly = true;
            this.classList.remove('editing');
            this.removeEventListener('keydown', handleKeyPress);
            this.removeEventListener('blur', handleBlur);
            return;
        }

        // If value has changed, show confirmation
        if (originalValue !== newValue) {
            const input = this;
            const fieldName = this.closest('.settings-row').querySelector('.settings-label').textContent;
            const symbol = this.closest('.settings-row').querySelector('.settings-symbol').textContent;

            // Show SweetAlert confirmation
            Swal.fire({
                title: 'Confirmar cambio',
                html: `¿Está seguro que desea cambiar <strong>${fieldName}</strong> de <strong>${originalValue}${symbol}</strong> a <strong>${newValue}${symbol}</strong>?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Confirmar',
                cancelButtonText: 'Cancelar',
                customClass: {
                    confirmButton: 'checkbox-custom-confirm-button'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Apply the new value
                    applyNewValue(input, newValue);

                    // Show success message
                    Swal.fire({
                        title: 'Valor actualizado',
                        text: `${fieldName} ha sido actualizado a ${newValue}${symbol}`,
                        icon: 'success',
                        confirmButtonColor: '#4CAF50',
                        timer: 2000
                    });
                } else {
                    // Reset to original value
                    input.value = originalValue;
                    finishEditing(input);
                }
            });
        } else {
            // No change, just finish editing
            finishEditing(this);
        }
    }

    // Apply new value and animation
    function applyNewValue(input, newValue) {
        input.value = newValue;
        input.classList.remove('pulse');
        void input.offsetWidth; // Trigger reflow
        input.classList.add('pulse');
        finishEditing(input);
    }

    // Function to finish editing
    function finishEditing(input) {
        // Remove editing class and disable editing
        input.readOnly = true;
        input.classList.remove('editing');

        // Remove event listeners
        input.removeEventListener('keydown', handleKeyPress);
        input.removeEventListener('blur', handleBlur);
    }

    inicializarComponente();
});