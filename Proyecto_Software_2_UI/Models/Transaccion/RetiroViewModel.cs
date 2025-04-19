using System.ComponentModel.DataAnnotations;

namespace Proyecto_Software_2_UI.Models.Transaccion
{
    public class RetiroViewModel
    {
        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "El monto debe ser mayor a 0")]
        public decimal Monto { get; set; }

        public double ComisionPlataforma { get; set; }
        public double ComisionReserva { get; set; }
        public double ComisionPaypal { get; set; }
        public decimal Total { get; set; }
    }

}