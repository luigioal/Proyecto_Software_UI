document.addEventListener('DOMContentLoaded', function () {
    // Get all input elements and edit icons
    const inputs = document.querySelectorAll('.settings-value');
    const editIcons = document.querySelectorAll('.settings-edit');

    // Add event listeners to edit icons
    editIcons.forEach((icon, index) => {
        icon.addEventListener('click', function () {
            enableEditing(inputs[index]);
        });
    });

    // Function to enable editing
    function enableEditing(input) {
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
        const isNumber = /^\d$/.test(e.key);

        if (!isNumber && !allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
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

    // Handle save button click
    const saveButton = document.querySelector('.settings-button');
    saveButton.addEventListener('click', function () {
        // Collect all values
        const values = {};
        inputs.forEach((input, index) => {
            const label = document.querySelectorAll('.settings-label')[index].textContent;
            if (label) { // Only save inputs that have labels
                values[label] = input.value;
            }
        });

        // Log to console (would be API call in production)
        console.log('Saving commission settings:', values);

        // Show success message with SweetAlert
        Swal.fire({
            title: 'Guardado',
            text: 'La configuración de comisiones ha sido guardada',
            icon: 'success',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#4CAF50'
        });
    });
});