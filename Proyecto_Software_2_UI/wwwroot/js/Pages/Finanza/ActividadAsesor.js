// Dashboard Actividad - Script para renderizar información de usuarios

let usuarioActualString = sessionStorage.getItem('usuarioActual');
let usuarioActual = JSON.parse(usuarioActualString);
const id = usuarioActual.id;

document.addEventListener('DOMContentLoaded', function () {
    const idAsesor = id;
    console.log(idAsesor);
    // Configuración de API endpoints
    const API = {
        asesorInfo: `https://proyecto-software-2.azurewebsites.net/api/Usuario/ObtenerUsuario?idUsuario=${idAsesor}`,
        clientes: `https://proyecto-software-2.azurewebsites.net/api/Usuario/ObtenerClientesPorAsesor?idAsesor=${idAsesor}`,
        rendimientos: '/api/Rendimiento/ObtenerRendimientoAsesores'
    };

    // Referencias a elementos DOM
    const elements = {
        asesorPicture: document.querySelector('.dashboard-avatar-img'),
        asesorName: document.querySelector('.dashboard-user-name'),
        asesorDate: document.querySelector('.dashboard-user-meta'),
        clienteList: document.querySelector('.activity-list-container'),
        clienteSelect: document.querySelector('.performance-select'),
        chartContainer: document.querySelector('.chart-container'),
        chartCaption: document.querySelector('.chart-caption')
    };

    // Estado de la aplicación
    let state = {
        asesorInfo: null,
        clientes: [],
        selectedCliente: 'todos'
    };

    // Inicializar carga de datos
    inicializarDashboard();

    async function inicializarDashboard() {
        try {
            // Mostrar indicadores de carga
            mostrarCargando();

            // Cargar datos de administrador y asesores en paralelo
            const [asesorInfo, clientes] = await Promise.all([
                fetchAsesorInfo(),
                fetchClientes()
            ]);

            // Guardar datos en el estado
            state.asesorInfo = asesorInfo;
            state.clientes = clientes;

            // Renderizar información
            renderizarInfoAsesor(asesorInfo);
            renderizarClientes(clientes);
            inicializarSelectorClientes(clientes);

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
    async function fetchAsesorInfo() {
        try {
            const response = await fetch(API.asesorInfo);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Error al obtener información del administrador:', error);
            // Retornar datos por defecto en caso de error
            return {
                nombre: 'Asesor',
                fechaRegistro: new Date().toISOString()
            };
        }
    }

    async function fetchClientes() {
        const response = await fetch(API.clientes);
        if (!response.ok) throw new Error(`Error al cargar asesores: ${response.status}`);
        return await response.json();
    }

    async function fetchRendimientos(clienteId) {
        try {
            const url = clienteId && clienteId !== 'todos'
                ? `${API.rendimientos}?asesorId=${clienteId}`
                : API.rendimientos;

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

            return await response.json();
        } catch (error) {
            console.error('Error al cargar rendimientos:', error);
            //mostrarToast('Error al cargar rendimientos', 'error');

            // Retornar datos simulados en caso de error
            return Array.from({ length: 12 }, (_, i) => {
                const mes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i];
                return { mes, clientes: Math.floor(Math.random() * 50) + 10 };
            });
        }
    }

    // Funciones de renderizado
    function renderizarInfoAsesor(asesorInfo) {
        if (!asesorInfo) return;
        elements.asesorPicture.src = asesorInfo.fotoPerfil;
        elements.asesorName.textContent = asesorInfo.nombre + " " + asesorInfo.primerApellido || 'Asesor';
        elements.asesorDate.textContent = `Asesor(a) desde: ${formatearFecha(asesorInfo.fechaRegistro)}`;
    }

    function renderizarClientes(clientes, numeroActivos, numeroVentas) {
        console.log(clientes)
        if (!elements.clienteList) return;

        if (!clientes || clientes.length === 0) {
            elements.clienteList.innerHTML = '<div class="empty-state">No hay clientes disponibles</div>';
            return;
        }

        elements.clienteList.innerHTML = clientes.map(cliente => { console.log("Aqui " + JSON.stringify(cliente)); return generarHtmlCliente(cliente, numeroActivos, numeroVentas) }).join('');
    }

    function generarHtmlCliente(cliente, numeroInversiones) {
        return `
            <div class="activity-item">
                <div class="activity-id">${cliente.id || ''}</div>
                <div class="activity-name">
                    <div class="activity-icon">
                        <img src="${cliente.fotoPerfil}" alt="Foto de perfil" class="dashboard-avatar-img"/>
                    </div>
                    <div class="activity-name-text">
                        ${cliente.nombre + " " + cliente.primerApellido + " " + cliente.segundoApellido || ''}
                    </div>
                </div>
                <div class="activity-value ${(cliente.clientes > 10) ? 'highlight' : ''}">
                    ${numeroInversiones || 0} ${(numeroInversiones === 1) ? 'activo' : 'activos'}
                </div>
                <div class="activity-access">${formatearFecha(cliente.ultimoAcceso)}</div>
                <div class="activity-commission">$${cliente.saldo || 0}</div>
            </div>
        `;
    }

    function inicializarSelectorClientes(clientes) {
        if (!elements.clienteSelect) return;

        // Opción por defecto ya existe en el HTML

        // Agregar opciones para cada asesor
        if (clientes && clientes.length > 0) {
            // Limpiar opciones existentes excepto la primera
            elements.clienteSelect.innerHTML = '<option value="todos"><label class="performance-select-label">Todos los clientes</label></option>';

            // Agregar nuevas opciones
            clientes.forEach(cliente => {
                elements.clienteSelect.innerHTML += `
                    <option value="${cliente.id || cliente.usuarioId}">
                        ${cliente.nombre}
                    </option>
                `;
            });
        }
    }

    async function cargarYRenderizarGrafico(clienteId) {
        try {
            // Guardar asesor seleccionado en el estado
            state.selectedCliente = clienteId;

            // Mostrar cargando en el contenedor del gráfico
            elements.chartContainer.innerHTML = '<div class="loading">Cargando gráfico...</div>';

            // Obtener datos de rendimiento
            const datosRendimiento = await fetchRendimientos(clienteId);

            // Obtener nombre del cliente para el título
            const nombreCliente = clienteId === 'todos'
                ? 'Todos los asesores'
                : state.clientes.find(a => (a.id || a.usuarioId) == clienteId)?.nombre || 'Asesor seleccionado';

            // Actualizar título del gráfico
            if (elements.chartCaption) {
                elements.chartCaption.textContent = nombreCliente === 'Todos los asesores'
                    ? 'Clientes'
                    : `Clientes de ${nombreCliente}`;
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
        // Evento de cambio en selector de clientes
        if (elements.clienteSelect) {
            elements.clienteSelect.addEventListener('change', function () {
                cargarYRenderizarGrafico(this.value);
            });
        }

        // Eventos de ordenamiento en encabezados
        const headerLabels = document.querySelectorAll('.activity-header-label');
        headerLabels.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', function () {
                const columnIndex = Array.from(headerLabels).indexOf(this);
                const clientesOrdenados = ordenarClientes(state.clientes, columnIndex);
                renderizarAsesores(clientesOrdenados);

                // Mostrar notificación
                const columnas = ['ID', 'Nombre', 'Activos', 'Último acceso', 'Balance'];
                mostrarToast(`Ordenado por ${columnas[columnIndex]}`);
            });
        });
    }

    function ordenarClientes(clientes, columnIndex) {
        if (!clientes || !Array.isArray(clientes)) return clientes;

        let sortedData = [...clientes];

        switch (columnIndex) {
            case 0: // ID
                sortedData.sort((a, b) => String(a.id || a.usuarioId).localeCompare(String(b.id || b.usuarioId)));
                break;
            case 1: // Nombre
                sortedData.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
                break;
            case 2: // Clientes
                sortedData.sort((a, b) => (b.clientes || 0) - (a.clientes || 0));
                break;
            case 3: // Último acceso
                sortedData.sort((a, b) => {
                    const dateA = a.ultimoAcceso || a.ultimaConexion ? new Date(a.ultimoAcceso || a.ultimaConexion) : new Date(0);
                    const dateB = b.ultimoAcceso || b.ultimaConexion ? new Date(b.ultimoAcceso || b.ultimaConexion) : new Date(0);
                    return dateB - dateA;
                });
                break;
            case 4: // Comisiones
                sortedData.sort((a, b) => (b.comisiones || 0) - (a.comisiones || 0));
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