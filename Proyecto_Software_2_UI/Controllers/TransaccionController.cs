using Microsoft.AspNetCore.Mvc;

namespace Proyecto_Software_2_UI.Controllers
{
    public class TransaccionController : Controller
    {
        public IActionResult ConfiguracionComisiones()
        {
            //ViewData["Layout"] = "_AdminLayout";
            return View();
        }
    }
}
