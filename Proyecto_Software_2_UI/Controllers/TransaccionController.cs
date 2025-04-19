using Microsoft.AspNetCore.Mvc;
using Proyecto_Software_2_UI.Models.Transaccion;

namespace Proyecto_Software_2_UI.Controllers
{
    public class TransaccionController : Controller
    {
      // GET: Transaccion/Deposit
    public IActionResult Deposit()
        {
            var viewModel = new DepositoViewModel
            {
                ComisionPlataforma = 46.8,
                ComisionPaypal = 6
            };
            return View(viewModel); // Esto renderizará Views/Transaccion/Deposit.cshtml
        }

        // GET: Transaccion/Withdraw
        public IActionResult Withdraw()
        {
            // Lógica para retiros
            return View(); // Buscará Views/Transaccion/Withdraw.cshtml
        }
        public IActionResult ConfiguracionComisiones()
        {
            //ViewData["Layout"] = "_AdminLayout";
            return View();
        }
    }
}
