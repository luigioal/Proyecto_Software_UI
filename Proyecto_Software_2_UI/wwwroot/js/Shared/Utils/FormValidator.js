/**
 * Utilidades para validación de formularios
 * Convención: Los inputs deben seguir la nomenclatura input-[tipo]
 * Ejemplo: input-email, input-password, input-nombre
 */

const FormValidator = {
    // Configuración de validaciones
    validaciones: {
        'email': { // Verifica formato válido de correo electrónico mediante regex
            regex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
            mensaje: 'Por favor, ingresa un correo electrónico válido'
        },
        'password': { // Requiere mínimo 8 caracteres con letras y números
            regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            mensaje: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números'
        },
        'nombre': { //Acepta letras, acentos y espacios (2-50 caracteres)
            regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
            mensaje: 'Por favor, ingresa un nombre válido'
        },
        'apellido1': { //Acepta letras, acentos y espacios (2-50 caracteres)
            regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
            mensaje: 'Por favor, ingresa un apellido válido'
        },
        'apellido2': { //Acepta letras, acentos y espacios (2-50 caracteres)
            regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/,
            mensaje: 'Por favor, ingresa un apellido válido'
        },
        'telefono': {
            regex: /^\d{8,15}$/,
            mensaje: 'Por favor, ingresa un número de teléfono válido'
        },
        'fecha': { //Comprueba formato YYYY-MM-DD
            regex: /^\d{4}-\d{2}-\d{2}$/,
            mensaje: 'Usa el formato YYYY-MM-DD'
        },
        'numero': { //Permite solo dígitos
            regex: /^\d+$/,
            mensaje: 'Por favor, ingresa solo números'
        },
        'requerido': { //Comprueba que el campo no esté vacío
            condicion: (valor) => valor.trim() !== '',
            mensaje: 'Este campo es obligatorio'
        }
    },

    // Método para agregar una nueva validación personalizada
    agregarValidacion: function (tipo, validacion) {
        this.validaciones[tipo] = validacion;
    },

    // Método para validar un campo específico
    validarCampo: function (input) {
        // Obtener el tipo de input desde el ID (ejemplo: input-email)
        const idPartes = input.id.split('-');
        if (idPartes.length < 2) return true; // Si no sigue la convención, se considera válido

        const tipo = idPartes[1];
        const valor = input.value;

        // Verificar si tenemos una validación para este tipo
        if (!this.validaciones[tipo]) return true;

        let esValido = true;
        let mensajeError = '';

        // Ejecutar la validación
        if (this.validaciones[tipo].regex) {
            esValido = this.validaciones[tipo].regex.test(valor);
            mensajeError = this.validaciones[tipo].mensaje;
        } else if (this.validaciones[tipo].condicion) {
            esValido = this.validaciones[tipo].condicion(valor);
            mensajeError = this.validaciones[tipo].mensaje;
        }

        // Manejar visualización de error
        this.mostrarErrorCampo(input, esValido, mensajeError);

        return esValido;
    },

    // Mostrar/ocultar mensaje de error para un campo
    mostrarErrorCampo: function (input, esValido, mensaje) {
        // Buscar o crear contenedor de error
        let errorContainer = document.getElementById(`error-${input.id}`);

        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.id = `error-${input.id}`;
            errorContainer.className = 'invalid-feedback';
            input.parentNode.appendChild(errorContainer); // Aqui  define donde agregar el contenedor. Se añade como último hijo del elemento padre. 
        }

        if (!esValido) {
            input.classList.add('is-invalid');
            input.classList.remove('is-valid');
            errorContainer.textContent = mensaje;
            errorContainer.style.display = 'block';
        } else {
            input.classList.remove('is-invalid');
            input.classList.add('is-valid');
            errorContainer.style.display = 'none';
        }
    },

    // Validar todos los campos de un formulario
    validarFormulario: function (formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        let esFormularioValido = true;

        // Obtener todos los inputs que siguen la convención
        const inputs = form.querySelectorAll('input[id^="input-"]');

        inputs.forEach(input => {
            const campoValido = this.validarCampo(input);
            esFormularioValido = esFormularioValido && campoValido;
        });

        // Si hay campos con el atributo required pero no siguen la convención
        const camposRequeridos = form.querySelectorAll('input[required]:not([id^="input-"])');
        camposRequeridos.forEach(campo => {
            const esValido = campo.value.trim() !== '';
            this.mostrarErrorCampo(campo, esValido, 'Este campo es obligatorio');
            esFormularioValido = esFormularioValido && esValido;
        });

        return esFormularioValido;
    },

    // Inicializar validación en tiempo real para un formulario
    inicializar: function (formId) {
        console.log("No se encontro nada en los forms.")
        const form = document.getElementById(formId);
        if (!form) { return };

        // Validar al enviar el formulario
        form.addEventListener('submit', (e) => {
            const esValido = this.validarFormulario(formId);
            if (!esValido) {
                e.preventDefault();
            }
        });

        // Validar en tiempo real cuando se escribe
        const inputs = form.querySelectorAll('input[id^="input-"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validarCampo(input);
            });

            input.addEventListener('blur', () => {
                this.validarCampo(input);
            });
        });
    }
};

// Exportar el objeto para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}

// Autodetectar formularios en la página
document.addEventListener('DOMContentLoaded', () => {
    // Buscar formularios con el atributo data-validacion="auto"
    const formularios = document.querySelectorAll('form[data-validacion="auto"]');
    formularios.forEach(form => {
        FormValidator.inicializar(form.id);
    });
});