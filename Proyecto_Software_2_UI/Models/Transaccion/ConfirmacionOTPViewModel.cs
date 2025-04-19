using System.ComponentModel.DataAnnotations;

namespace Proyecto_Software_2_UI.Models.Transaccion
{
    public class ConfirmacionOTPViewModel
    {
        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "El código OTP debe tener 6 dígitos")]
        public string OTP { get; set; }

        // Campo oculto para pasar datos entre vistas
        public decimal Monto { get; set; }
        public string Operacion { get; set; } // "retiro" o "deposito"
    }
}

