// Dashboard Actividad - Script para renderizar información de usuarios

let usuarioActualString = sessionStorage.getItem('usuarioActual');
let usuarioActual = JSON.parse(usuarioActualString);
const id = usuarioActual.id;
const SupervisorId = usuarioActual.idSupervisor;

document.addEventListener('DOMContentLoaded', function () {
    const idAsesor = SupervisorId;
    const idCliente = id; // ID del cliente, se puede obtener dinámicamente si es necesario

    // Configuración de API endpoints
    const API = {
        clienteInfo: `https://proyecto-software-2.azurewebsites.net/api/Usuario/ObtenerUsuario?idUsuario=${idCliente}`,
        inversionesActivas: `https://proyecto-software-2.azurewebsites.net/api/Transaccion/ObtenerInversiones?idCliente=${idCliente}&Tipo=Activo`,
        inversionesVendidas: `https://proyecto-software-2.azurewebsites.net/api/Transaccion/ObtenerInversiones?idCliente=${idCliente}&Tipo=Venta`,
    };

    // Referencias a elementos DOM
    const elements = {
        clientePicture: document.querySelector('.dashboard-avatar-img'),
        clienteName: document.querySelector('.dashboard-user-name'),
        clienteDate: document.querySelector('.dashboard-user-meta'),
        clienteAsesor: document.querySelector('.dashboard-user-meta-asesor'), 
        investmentList: document.querySelector('.activity-list-container'),
        investmentSelect: document.querySelector('.performance-select'),
        chartContainer: document.querySelector('.chart-container'),
        chartCaption: document.querySelector('.chart-caption')
    };

    // Estado de la aplicación
    let state = {
        clienteInfo: null,
        investments: [],
        selectedInvestment: 'todos'
    };

    // Inicializar carga de datos
    inicializarDashboard();

    async function inicializarDashboard() {
        try {
            // Mostrar indicadores de carga
            mostrarCargando();

            // Cargar datos de administrador y asesores en paralelo
            const [clienteInfo, inversiones] = await Promise.all([
                fetchClienteInfo(),
                fetchInversiones()
            ]);

            // Guardar datos en el estado
            state.clienteInfo = clienteInfo;
            state.inversiones = inversiones;

            // Renderizar información
            renderizarInfoCliente(clienteInfo);
            renderizarInversiones(inversiones);
            inicializarSelectorInversiones(inversiones);

            // Cargar rendimientos iniciales (todos los asesores)
            await cargarYRenderizarGrafico('todos');

            // Inicializar eventos
            inicializarEventos();

        } catch (error) {
            console.error('Error al inicializar dashboard:', error);
            mostrarError('No se pudo cargar la información del dashboard', error.message);
        }
    }

    // Funciones para obtener datos
    async function fetchClienteInfo() {
        try {
            const response = await fetch(API.clienteInfo);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error al obtener información del cliente:', error);
            // Retornar datos por defecto en caso de error
            return {
                nombre: 'Cliente',
                fechaRegistro: new Date().toISOString()
            };
        }
    }

    async function fetchInversiones() {
        const response = await fetch(API.inversionesActivas);
        if (!response.ok) throw new Error(`Error al cargar inversiones: ${response.status}`);
        return await response.json();
    }

    async function fetchRendimientos(asesorId) {
        try {
            const url = asesorId && asesorId !== 'todos'
                ? `${API.rendimientos}?asesorId=${asesorId}`
                : API.rendimientos;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            return await response.json();
        } catch (error) {
            console.error('Error al cargar rendimientos:', error);
            mostrarToast('Error al cargar rendimientos', 'error');

            // Retornar datos simulados en caso de error
            return Array.from({ length: 12 }, (_, i) => {
                const mes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i];
                return { mes, clientes: Math.floor(Math.random() * 50) + 10 };
            });
        }
    }

    // Funciones de renderizado
    function renderizarInfoCliente(clienteInfo) {
        if (!clienteInfo) return;
        elements.clientePicture.src = clienteInfo.fotoPerfil;
        elements.clienteName.textContent = clienteInfo.nombre + " " + clienteInfo.primerApellido || 'Cliente';
        elements.clienteDate.textContent = `Cliente/a desde: ${formatearFecha(clienteInfo.fechaRegistro)}`;
        elements.clienteAsesor.textContent = `Id del asesor: ${clienteInfo.idSupervisor}`;
    }

    function renderizarInversiones(inversiones) {
        if (!elements.investmentList) return;

        if (!inversiones || inversiones.length === 0) {
            elements.investmentList.innerHTML = '<div class="empty-state">No hay inversiones disponibles</div>';
            return;
        }

        elements.investmentList.innerHTML = inversiones.map(inversion => generarHtmlInversion(inversion)).join('');
    }

    function generarHtmlInversion(inversion) {
        return `
            <div class="activity-item">
                <div class="activity-name">
                    <div class="activity-icon">
                        <img src="${inversion.fotoLogo}" alt="" class="dashboard-avatar-img" onerror="this.onerror=null; this.src='https://s3-symbol-logo.tradingview.com/nasdaq.svg'"/>
                    </div>
                    <div class="activity-text-name">
                        ${inversion.nombre}
                    </div>
                </div>
                <div class="activity-simbolo">
                    ${inversion.simbolo}
                </div>
                <div class="activity-cantidad ${(inversion.cantidad > 10) ? 'highlight' : ''}">
                    ${inversion.cantidad || 0}
                </div>
                <div class="activity-precio">$${Math.ceil(inversion.precioPromedioCompra * 100) / 100 || 0}</div>
                <div class="activity-fechaCompra">${formatearFecha(inversion.fechaUltimaCompra)}</div>
                <div class="activity-ganancia">$${Math.ceil(inversion.cantidad * inversion.precioPromedioCompra * 100) / 100 || 0}</div>
            </div>
        `;
    }

    function inicializarSelectorInversiones(inversiones) {
        if (!elements.investmentSelect) return;

        // Opción por defecto ya existe en el HTML

        // Agregar opciones para cada asesor
        if (inversiones && inversiones.length > 0) {
            // Limpiar opciones existentes excepto la primera
            elements.investmentSelect.innerHTML = '<option value="todas"><label class="performance-select-label">Todas las inversiones</label></option>';

            // Agregar nuevas opciones
            inversiones.forEach(inversion => {
                elements.investmentSelect.innerHTML += `
                    <option value="${inversion.simbolo || ""}">
                        ${inversion.simbolo}
                    </option>
                `;
            });
        }
    }

    async function cargarYRenderizarGrafico(idInversion) {
        try {
            // Guardar asesor seleccionado en el estado
            state.selectedInvestment = idInversion;

            // Mostrar cargando en el contenedor del gráfico
            elements.chartContainer.innerHTML = '<div class="loading">Cargando gráfico...</div>';

            // Obtener datos de rendimiento
            const datosRendimiento = await fetchRendimientos(idInversion);

            // Obtener nombre del asesor para el título
            const simboloInversion = idInversion === 'todos'
                ? 'Todas las inversiones'
                : state.inversiones.find(a => (a.id || a.simbolo) == idInversion)?.simbolo || 'Inversion seleccionada';

            // Actualizar título del gráfico
            if (elements.chartCaption) {
                elements.chartCaption.textContent = nombreAsesor === 'Todas las inversiones'
                    ? 'Inversiones'
                    : `Inversiones en ${nombreAsesor}`;
            }

            // Renderizar gráfico
            renderizarGrafico(datosRendimiento);

        } catch (error) {
            console.error('Error al cargar el gráfico:', error);
            elements.chartContainer.innerHTML = '<div class="error-message">No se pudo cargar el gráfico</div>';
            mostrarToast('Error al cargar el gráfico', 'error');
        }
    }

    function renderizarGrafico(datos) {
        // Verificar si se debe usar Chart.js o una imagen como en el HTML original
        const usarChartJS = typeof Chart !== 'undefined';

        if (usarChartJS) {
            // Usar Chart.js si está disponible
            renderizarGraficoConChartJS(datos);
        } else {
            // Usar imagen como fallback
            elements.chartContainer.innerHTML = `
                <img src="/api/placeholder/800/300" alt="Gráfico de rendimientos" class="chart-image" />
            `;
        }
    }

    function renderizarGraficoConChartJS(datos) {
        // Limpiar contenedor
        elements.chartContainer.innerHTML = '<canvas id="rendimiento-chart" width="800" height="300"></canvas>';

        // Obtener canvas
        const canvas = document.getElementById('rendimiento-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        // Preparar datos
        const labels = datos.map(item => item.mes);
        const values = datos.map(item => item.clientes);

        // Crear gráfico
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Clientes',
                    data: values,
                    borderColor: '#4b5563',
                    backgroundColor: 'rgba(75, 85, 99, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }

    // Funciones de utilidad
    function formatearFecha(fecha) {
        if (!fecha) return 'N/A';

        // Si es string ISO, convertir a Date
        const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

        // Verificar si es fecha válida
        if (isNaN(date.getTime())) return 'N/A';

        // Formatear como DD/MM/YYYY
        return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
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

    function mostrarToast(mensaje, tipo = 'info') {
        // Si tenemos SweetAlert, usarlo
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: mensaje,
                icon: tipo,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
            return;
        }

        // Si no hay SweetAlert, usar console
        console[tipo === 'error' ? 'error' : 'info'](mensaje);
    }

    // Inicializar eventos de interacción
    function inicializarEventos() {
        // Evento de cambio en selector de asesores
        if (elements.investmentSelect) {
            elements.investmentSelect.addEventListener('change', function () {
                cargarYRenderizarGrafico(this.value);
            });
        }

        // Eventos de ordenamiento en encabezados *Pendiente implementacion
        //const headerLabels = document.querySelectorAll('.activity-header-label');
        //headerLabels.forEach(header => {
        //    header.style.cursor = 'pointer';
        //    header.addEventListener('click', function () {
        //        const columnIndex = Array.from(headerLabels).indexOf(this);
        //        //const inversionesOrdenadas = ordenarInversiones(state.inversiones, columnIndex);
        //        renderizarInversiones(state.inversiones);

        //        // Mostrar notificación
        //        const columnas = ['ID', 'Asesor', 'Clientes', 'Último acceso', 'Comisiones'];
        //        mostrarToast(`Ordenado por ${columnas[columnIndex]}`);
        //    });
        //});

        // Eventos de mouse sobre inversion para activar opcion de vender
        inicializarVenderButtons();
    }

    function ordenarInversiones(inversiones, columnIndex) {
        if (!inversiones || !Array.isArray(inversiones)) return inversiones;

        let sortedData = [...inversiones];

        switch (columnIndex) {
            case 0: // precio promedio de compra
                sortedData.sort((a, b) => String(a.precioPromedioCompra).localeCompare(String(b.precioPromedioCompra)));
                break;
            case 1: // cantidad
                sortedData.sort((a, b) => (a.simbolo || '').localeCompare(b.simbolo || ''));
                break;
            case 2: // cantidad
                sortedData.sort((a, b) => (a.cantidad || '').localeCompare(b.cantidad || ''));
                break;
            case 3: // cantidad
                sortedData.sort((a, b) => (a.precio || '').localeCompare(b.precio || ''));
                break;
            case 4: // cantidad
                sortedData.sort((a, b) => {
                    const dateA = a.fechaUltimaCompra ? new Date(a.fechaUltimaCompra) : new Date(0);
                    const dateB = b.fechaUltimaCompra ? new Date(b.fechaUltimaCompra) : new Date(0);
                    return dateB - dateA;
                });
                break;
            case 5: // Última compra
                sortedData.sort((a, b) => (a.ganancia || '').localeCompare(b.precio || ''));
                break;
        }

        return sortedData;
    }

    // Carga condicional de bibliotecas necesarias
    function cargarBibliotecasDinamicamente() {
        // Cargar Chart.js si no está disponible
        if (typeof Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = function () {
                // Volver a renderizar el gráfico si hay datos
                if (state.selectedAsesor) {
                    cargarYRenderizarGrafico(state.selectedAsesor);
                }
            };
            document.head.appendChild(script);
        }

        // Cargar SweetAlert si no está disponible
        if (typeof Swal === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
            document.head.appendChild(script);
        }
    }

    // Intentar cargar bibliotecas dinámicamente
    cargarBibliotecasDinamicamente();
});


function inicializarVenderButtons() {
    // Get all investment items
    const inversionItems = document.querySelectorAll('.activity-item');

    inversionItems.forEach(item => {
        // Get the ganancia cell
        const gananciaCell = item.querySelector('.activity-ganancia');

        if (gananciaCell) {
            // Create the vender button with icon
            const venderButton = document.createElement('button');
            venderButton.className = 'vender-button';
            venderButton.innerHTML = `
                Vender
            `;

            // Add click event to the button
            venderButton.addEventListener('click', function (event) {
                event.stopPropagation(); // Prevent event bubbling

                // Get investment info for this item
                const nombre = item.querySelector('.activity-text-name')?.textContent.trim() || 'Inversión';
                const simbolo = item.querySelector('.activity-simbolo')?.textContent.trim() || '';

                // Show confirmation dialog (if SweetAlert is available)
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: `¿Vender ${simbolo}?`,
                        text: `¿Estás seguro de que quieres vender tu inversión en ${nombre}?`,
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#ef4444',
                        cancelButtonColor: '#6b7280',
                        confirmButtonText: 'Sí, vender',
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // Here you would call your API to sell the investment
                            console.log(`Vendiendo inversión: ${simbolo}`);

                            // Show success message
                            Swal.fire(
                                '¡Vendido!',
                                `Tu inversión en ${nombre} ha sido vendida.`,
                                'success'
                            );
                        }
                    });
                } else {
                    // Fallback if SweetAlert is not available
                    if (confirm(`¿Estás seguro de que quieres vender tu inversión en ${nombre}?`)) {
                        console.log(`Vendiendo inversión: ${simbolo}`);
                        alert(`Tu inversión en ${nombre} ha sido vendida.`);
                    }
                }
            });

            // Append the button to the ganancia cell
            gananciaCell.appendChild(venderButton);
        }
    });
}
