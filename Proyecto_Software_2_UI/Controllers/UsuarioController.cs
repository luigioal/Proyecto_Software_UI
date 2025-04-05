using Microsoft.AspNetCore.Mvc;

namespace Proyecto_Software_2_UI.Controllers
{
    public class UsuarioController : Controller
    {
        public IActionResult UsuariosAdmin()
        {
            //ViewData["Layout"] = "_AdminLayout";
            return View();
        }

    }
}
