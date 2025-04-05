using Microsoft.AspNetCore.Mvc;

namespace Proyecto_Software_2_UI.Controllers
{
    public class FinanzaController : Controller
    {
        public IActionResult ActividadAdmin()
        {
            
            //ViewData["Layout"] = "_AdminLayout";
            return View();
        }

        public IActionResult ActividadCliente()
        {
            
            //ViewData["Layout"] = "_ClienteLayout";
            return View();
        }

        public IActionResult ActividadAsesor()
        {
            
            //ViewData["Layout"] = "_AsesorLayout";
            return View();
        }
    }
}
