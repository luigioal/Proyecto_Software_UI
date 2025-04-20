// Mercado.js - JavaScript para la vista de Mercado
const baseUrl = localStorage.getItem('baseUrl');
let usuarioActualString = sessionStorage.getItem('usuarioActual');
let usuarioActual = JSON.parse(usuarioActualString || '{}');

document.addEventListener('DOMContentLoaded', function () {
    // API key para financialmodelingprep.com
    const API_KEY = "XzFe20z0QYPx9ERuPNernOO5zMgDGuJ5"; // Usando la misma clave que se encuentra en FinanceConnector.cs

    // Contenedores para los activos
    const stocksContainer = document.getElementById('stocks-container');
    const etfsContainer = document.getElementById('etfs-container');

    // Template para los activos
    const assetTemplate = document.getElementById('asset-template');

    // Estado de la aplicación
    const state = {
        stocks: [],
        etfs: [],
        loading: true
    };

    // Inicializar carga de datos
    initializePage();

    async function initializePage() {
        try {
            // Mostrar spinner de carga
            showLoading();

            console.log("🚀 Iniciando carga de la página de Mercado");

            // IMPORTANTE: Para el plan Basic, solo hacemos UNA llamada a la API
            console.log("📡 Solicitando datos de acciones (única llamada API)");
            const stocks = await fetchStocks();

            // Para ETFs, usamos datos mock para no consumir llamadas adicionales
            console.log("📝 Usando datos simulados para ETFs (ahorrando llamadas API)");
            const etfs = generateMockETFs();

            // Guardar en el estado
            state.stocks = stocks;
            state.etfs = etfs;
            state.loading = false;

            console.log("🎯 Estado final de la aplicación:", {
                stocksCount: stocks.length,
                etfsCount: etfs.length,
                loading: false
            });

            // Renderizar los activos
            console.log("🖌️ Renderizando acciones en la interfaz");
            renderStocks(stocks);

            console.log("🖌️ Renderizando ETFs en la interfaz");
            renderETFs(etfs);

            // Inicializar eventos
            console.log("⚡ Inicializando eventos de interacción");
            initializeEvents();

            console.log("✅ Inicialización de la página completada");

        } catch (error) {
            console.error('❌ Error al inicializar la página:', error);
            showError('No se pudieron cargar los datos del mercado', error.message);
        }
    }

    // Función para obtener listado de acciones populares
    // Hacemos una única llamada API para obtener acciones populares
    async function fetchStocks() {
        try {
            // Lista específica de símbolos que queremos mostrar - Nota importante: el enpoint https://financialmodelingprep.com/api/v3/actives?apikey=${API_KEY} devuelve un set especifico de stocks ya determinados por el proveedor entonces ver la lista de stock que devuelve el endpoint en el console log si se quiere cambiar un simbolo.
            const targetSymbols = [
                "AAPL", "TSLA", "NVDA", "AMZN", "PLTR",
                "F", "INTC", "SPY", "QQQ", "BAC"
            ];

            console.log("📡 Iniciando solicitud a API de acciones activas...");
            console.log("🎯 Símbolos específicos buscados:", targetSymbols);

            // Endpoint para obtener acciones más activas - ÚNICA LLAMADA API
            const response = await fetch(`https://financialmodelingprep.com/api/v3/actives?apikey=${API_KEY}`);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Log de la estructura completa de la respuesta
            console.log("✅ Respuesta exitosa del endpoint 'actives':", {
                endpoint: "https://financialmodelingprep.com/api/v3/actives",
                statusCode: response.status,
                dataType: typeof data,
                isArray: Array.isArray(data),
                length: Array.isArray(data) ? data.length : 'N/A',
                firstItem: Array.isArray(data) && data.length > 0 ? data[0] : 'No hay elementos',
                fullResponse: data
            });

            // Filtrar solo los símbolos específicos que buscamos
            const filteredStocks = [];
            const foundSymbols = new Set();

            // Primero buscamos coincidencias en los datos de la API
            if (Array.isArray(data)) {
                data.forEach(stock => {
                    if (targetSymbols.includes(stock.ticker)) {
                        filteredStocks.push({
                            ticker: stock.ticker,
                            name: stock.companyName || stock.ticker,
                            price: parseFloat(stock.price || stock.changesPercentage) || 100,
                            logoUrl: `https://financialmodelingprep.com/image-stock/${stock.ticker}.png`
                        });
                        foundSymbols.add(stock.ticker);
                        console.log(`✅ Símbolo encontrado en API: ${stock.ticker}`);
                    }
                });
            }

          

            // Ordenamos según el orden original de targetSymbols
            filteredStocks.sort((a, b) => {
                return targetSymbols.indexOf(a.ticker) - targetSymbols.indexOf(b.ticker);
            });

            console.log("📊 Datos de acciones procesados:", filteredStocks);
            return filteredStocks;
        } catch (error) {
            

            

            return console.error('❌ Error al obtener acciones:', error);
        }
    }

   

    // Función para renderizar acciones
    function renderStocks(stocks) {
        stocksContainer.innerHTML = '';

        if (!stocks || stocks.length === 0) {
            stocksContainer.innerHTML = '<div class="text-center py-4">No se encontraron acciones disponibles</div>';
            return;
        }

        stocks.forEach(stock => {
            const assetElement = createAssetElement(stock);
            stocksContainer.appendChild(assetElement);
        });
    }

    // Función para renderizar ETFs
    function renderETFs(etfs) {
        etfsContainer.innerHTML = '';

        if (!etfs || etfs.length === 0) {
            etfsContainer.innerHTML = '<div class="text-center py-4">No se encontraron ETFs disponibles</div>';
            return;
        }

        etfs.forEach(etf => {
            const assetElement = createAssetElement(etf);
            etfsContainer.appendChild(assetElement);
        });
    }

    // Función para crear un elemento de activo
    function createAssetElement(asset) {
        // Clonar el template
        const assetElement = assetTemplate.content.cloneNode(true);

        // Llenar con datos
        const logoImg = assetElement.querySelector('.asset-logo');
        logoImg.src = asset.logoUrl;
        logoImg.alt = asset.name;
        logoImg.onerror = function () {
            // Usar una clase de estilo en lugar de intentar cargar otra imagen
            this.style.display = 'flex';
            this.style.alignItems = 'center';
            this.style.justifyContent = 'center';
            this.style.backgroundColor = '#f0f0f0';
            this.style.width = '40px';
            this.style.height = '40px';
            this.style.fontSize = '12px';
            this.style.fontWeight = 'bold';
            this.style.color = '#666';

            // Mostrar las iniciales del símbolo en lugar de una imagen
            this.outerHTML = `<div class="asset-logo-placeholder">${asset.ticker.substring(0, 2)}</div>`;
        };

        assetElement.querySelector('.asset-name').textContent = asset.name;
        assetElement.querySelector('.asset-symbol').textContent = asset.ticker;
        assetElement.querySelector('.asset-price').textContent = `$${formatPrice(asset.price)}`;

        // Configurar el botón de compra
        const buyButton = assetElement.querySelector('.btn-buy');
        buyButton.setAttribute('data-symbol', asset.ticker);
        buyButton.setAttribute('data-name', asset.name);
        buyButton.setAttribute('data-price', asset.price);
        buyButton.addEventListener('click', handleBuyClick);

        return assetElement;
    }

    // Manejar clic en botón de compra
    function handleBuyClick(event) {
        const button = event.currentTarget;
        const symbol = button.getAttribute('data-symbol');
        const name = button.getAttribute('data-name');
        const price = parseFloat(button.getAttribute('data-price'));

        // Llenar el modal con los datos del activo
        document.getElementById('modal-asset-symbol').textContent = symbol;
        document.getElementById('modal-asset-name').textContent = name;
        document.getElementById('modal-asset-price').textContent = `$${formatPrice(price)}`;
        document.getElementById('modal-total-price').textContent = `$${formatPrice(price)}`;

        // Actualizar total cuando cambia la cantidad
        const quantityInput = document.getElementById('quantity');
        quantityInput.value = 1; // Resetear a 1
        quantityInput.addEventListener('input', function () {
            const quantity = parseInt(this.value) || 1;
            document.getElementById('modal-total-price').textContent = `$${formatPrice(price * quantity)}`;
        });

        // Mostrar el modal
        const buyModal = new bootstrap.Modal(document.getElementById('buyModal'));
        buyModal.show();
    }

    // Inicializar eventos de interacción
    function initializeEvents() {
        // Manejar ordenamiento en acciones
        document.querySelectorAll('#stocksSortDropdown + .dropdown-menu .dropdown-item').forEach(item => {
            item.addEventListener('click', function (event) {
                event.preventDefault();
                const sortType = this.getAttribute('data-sort');
                const sortedStocks = sortAssets(state.stocks, sortType);
                renderStocks(sortedStocks);
            });
        });

        // Manejar ordenamiento en ETFs
        document.querySelectorAll('#etfsSortDropdown + .dropdown-menu .dropdown-item').forEach(item => {
            item.addEventListener('click', function (event) {
                event.preventDefault();
                const sortType = this.getAttribute('data-sort');
                const sortedETFs = sortAssets(state.etfs, sortType);
                renderETFs(sortedETFs);
            });
        });
    }

    // Función para ordenar activos
    function sortAssets(assets, sortType) {
        const sorted = [...assets];

        switch (sortType) {
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'symbol':
                sorted.sort((a, b) => a.ticker.localeCompare(b.ticker));
                break;
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
        }

        return sorted;
    }

    // Utilidades
    function formatPrice(price) {
        
        // Si el precio es menor a 1, usamos 4 decimales, si no, usamos 2
        const decimals = price < 1 ? 4 : 2;
        return price.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    function showLoading() {
        // Ya implementado con spinners en el HTML
    }

    function showError(title, message) {
        // Usar SweetAlert si está disponible
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: title,
                text: message,
                icon: 'error',
                confirmButtonText: 'Reintentar',
                confirmButtonColor: '#188754'
            }).then(result => {
                if (result.isConfirmed) {
                    window.location.reload();
                }
            });
            return;
        }

        // Fallback si no hay SweetAlert
        alert(`${title}\n${message}`);
    }

    // Función para datos simulados de ETFs
    function generateMockETFs() {
        console.log("📊 Generando datos simulados de ETFs (sin llamar a la API)");
        const mockETFs = [
            { ticker: "SPY", name: "SPDR S&P 500 ETF Trust", price: 486.83, logoUrl: "https://financialmodelingprep.com/image-stock/SPY.png" },
            { ticker: "VOO", name: "Vanguard S&P 500 ETF", price: 447.73, logoUrl: "https://financialmodelingprep.com/image-stock/VOO.png" },
            { ticker: "QQQ", name: "Invesco QQQ Trust", price: 423.48, logoUrl: "https://financialmodelingprep.com/image-stock/QQQ.png" },
            { ticker: "VTI", name: "Vanguard Total Stock Market ETF", price: 252.90, logoUrl: "https://financialmodelingprep.com/image-stock/VTI.png" },
            { ticker: "IVV", name: "iShares Core S&P 500 ETF", price: 490.59, logoUrl: "https://financialmodelingprep.com/image-stock/IVV.png" },
            { ticker: "IEFA", name: "iShares Core MSCI EAFE ETF", price: 71.57, logoUrl: "https://financialmodelingprep.com/image-stock/IEFA.png" },
            { ticker: "EFA", name: "iShares MSCI EAFE ETF", price: 77.95, logoUrl: "https://financialmodelingprep.com/image-stock/EFA.png" },
            { ticker: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", price: 97.96, logoUrl: "https://financialmodelingprep.com/image-stock/AGG.png" },
            { ticker: "VEA", name: "Vanguard FTSE Developed Markets ETF", price: 48.37, logoUrl: "https://financialmodelingprep.com/image-stock/VEA.png" },
            { ticker: "BND", name: "Vanguard Total Bond Market ETF", price: 71.79, logoUrl: "https://financialmodelingprep.com/image-stock/BND.png" }
        ];
        console.log("📊 Datos simulados de ETFs generados:", mockETFs);
        return mockETFs;
    }

    
});