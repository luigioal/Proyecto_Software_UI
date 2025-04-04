using Microsoft.AspNetCore.Mvc;

namespace Proyecto_Software_2_UI.Controllers
{
    public class FinanzaController : Controller
    {
        public IActionResult ActividadAdmin()
        {
            return View();
        }

        public IActionResult ActividadCliente()
        {
            return View();
        }
        public IActionResult ActividadAsesor()
        {
            return View();
        }
    }
}
