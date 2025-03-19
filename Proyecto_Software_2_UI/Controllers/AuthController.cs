using Microsoft.AspNetCore.Mvc;

namespace Proyecto_Software_2_UI.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Login()
        {
            return View();
        }
    }
}
