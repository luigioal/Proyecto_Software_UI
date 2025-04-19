using System.ComponentModel.DataAnnotations;

namespace Proyecto_Software_2_UI.Models.Transaccion
{
    public class DepositoViewModel
    {
        [Required]
        [Range(5, double.MaxValue, ErrorMessage = "El monto mínimo es $5")]
        public decimal Monto { get; set; }

        public double ComisionPlataforma { get; set; }
        public double ComisionReserva { get; set; }
        public double ComisionPaypal { get; set; }
    }
}

