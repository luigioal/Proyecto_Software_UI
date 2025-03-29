using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Proyecto_Software_2_UI.Models;

namespace Proyecto_Software_2_UI.Controllers
{
    public class AuthController : Controller
    {
        public IActionResult Login()
        {
            return View();
        }

        [HttpGet]
        public IActionResult RegistroAsesor()
        {
            return View();
        }

        [HttpPost]
        public IActionResult RegistrarAsesor()
        {
            if (!ModelState.IsValid)
            {
                TempData["RegistroError"] = "Registro incompleto. Revise el formulario.";
                return View();
            }

            // Simulación de procesamiento (guardar en base de datos, enviar notificación, etc.)
            TempData["RegistroExitoso"] = "Registro exitoso. Se ha notificado al administrador.";
            return RedirectToAction("RegistroAsesor");
        }

        [HttpGet]
        public IActionResult RecuperarContrasena()
        {
            return View();
        }

        // vista de confirmación del OTP
        [HttpGet]
        public IActionResult ConfirmarOTP(string correo)
        {
            ViewBag.Correo = correo;
            return View();
        }

        // la vista de nueva contraseña
        [HttpGet]
        public IActionResult NuevaContrasena(string correo)
        {
            ViewBag.Correo = correo;
            return View();
        }

    }
}
