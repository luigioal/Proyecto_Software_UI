document.addEventListener('DOMContentLoaded', () => {
    // Inicializar validación para el formulario de login
    FormValidator.inicializar('loginForm');

    // Manejo del envío del formulario (lógica específica de login)
    document.getElementById("loginForm").addEventListener("submit", function (event) {
        event.preventDefault();

        // Si el formulario es válido, realizar la autenticación
        if (FormValidator.validarFormulario('loginForm')) {
            // Aquí iría tu lógica de autenticación
            // Por ejemplo, una llamada fetch a tu API
            console.log('Formulario válido, enviando datos...');


        }
    });
});