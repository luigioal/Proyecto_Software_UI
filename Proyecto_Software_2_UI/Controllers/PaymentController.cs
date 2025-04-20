using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Proyecto_Software_2_UI.Models.Transaccion;
using AppLogic.SeguridadAdmin;
using AppLogic.TransaccionAdmin;
using System.Security.Claims;

namespace Proyecto_Software_2_UI.Controllers
{
    [Authorize]
    public class PaymentController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly TransaccionAdmin _transaccionAdmin;
        private readonly Notificador _notificador;
        private readonly SeguridadAdmin _seguridadAdmin;

        public PaymentController(
            IHttpClientFactory httpClientFactory,
            TransaccionAdmin transaccionAdmin,
            Notificador notificador,
            SeguridadAdmin seguridadAdmin)
        {
            _httpClient = httpClientFactory.CreateClient();
            _baseUrl = "http://localhost:5058";
            _transaccionAdmin = transaccionAdmin;
            _notificador = notificador;
            _seguridadAdmin = seguridadAdmin;
        }

        // GET: Payment/Deposit
        public IActionResult Deposit()
        {
            var viewModel = new DepositoViewModel
            {
                ComisionPlataforma = 46.8,
                ComisionPaypal = 6
            };
            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ProcessDeposit(DepositoViewModel model)
        {
            if (!ModelState.IsValid)
                return View("Deposit", model);

            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var email = User.Identity.Name;

                TempData["MontoDeposito"] = model.Monto;
                TempData["OperacionTipo"] = "deposito";

                await _seguridadAdmin.GenerateOTP(email);

                return RedirectToAction("ConfirmarOTP");
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"Error: {ex.Message}";
                return View("Deposit", model);
            }
        }

        // GET: Payment/ConfirmarOTP
        public IActionResult ConfirmarOTP()
        {
            if (TempData["MontoRetiro"] == null && TempData["MontoDeposito"] == null)
            {
                return RedirectToAction("Index", "Home");
            }

            var viewModel = new ConfirmacionOTPViewModel
            {
                Monto = TempData["MontoRetiro"] != null
                    ? Convert.ToDecimal(TempData["MontoRetiro"])
                    : Convert.ToDecimal(TempData["MontoDeposito"]),
                Operacion = TempData["OperacionTipo"]?.ToString()
            };

            TempData.Keep();
            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ConfirmarTransaccion(ConfirmacionOTPViewModel model)
        {
            if (!ModelState.IsValid)
                return View("ConfirmarOTP", model);

            try
            {
                var email = User.Identity.Name;
                if (!_seguridadAdmin.Verify(email, model.OTP))
                {
                    TempData["Error"] = "OTP inválido";
                    return View("ConfirmarOTP", model);
                }

                int userId;
                if (!int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId))
                {
                    TempData["Error"] = "Error al obtener el ID del usuario.";
                    return View("ConfirmarOTP", model);
                }

                if (model.Operacion == "deposito")
                {
                    _transaccionAdmin.ProcesarDeposito(
                        userId,
                         Convert.ToDouble(model.Monto)
                    );
                    TempData["Success"] = "Depósito exitoso";
                }
                else
                {
                    _transaccionAdmin.ProcesarRetiro(
                        userId,
                        Convert.ToDouble(model.Monto)
                    );
                    TempData["Success"] = "Retiro exitoso";
                }

                return RedirectToAction("Index", "Home");
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"Error: {ex.Message}";
                return View("ConfirmarOTP", model);
            }
        }
    }
}
