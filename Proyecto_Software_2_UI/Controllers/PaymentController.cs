// En Proyecto_Software_2_UI/Controllers/PaymentController.cs
using Microsoft.AspNetCore.Mvc;
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
    public class PaymentController : Controller
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly TransaccionAdmin _transaccionAdmin;
        private readonly Notificador _notificador;
        private readonly SeguridadAdmin _seguridadAdmin;


        public PaymentController(IHttpClientFactory httpClientFactory)
        {
            _httpClient = httpClientFactory.CreateClient();
            _baseUrl = "http://localhost:5058"; // Ajusta esto a la URL de tu API

        }

        // GET: Payment/Withdraw
        public async Task<IActionResult> Withdraw()
        {
            try
            {
                // Obtener cargos extra de la API
                var response = await _httpClient.GetAsync($"{_baseUrl}/api/Transaccion/ObtenerCargosExtra");

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var cargosExtra = JsonConvert.DeserializeObject<dynamic>(content);

                    var viewModel = new RetiroViewModel
                    {
                        ComisionPlataforma = cargosExtra.ComisionTransaccion,
                        ComisionReserva = cargosExtra.ComisionAsesor,
                        ComisionPaypal = cargosExtra.TarifaMinimaTransaccion
                    };

                    return View(viewModel);
                }

                TempData["Error"] = "No se pudieron obtener los datos de comisiones";
                return RedirectToAction("ActividadCliente", "Finanza");
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"Error: {ex.Message}";
                return RedirectToAction("ActividadCliente", "Finanza");
            }
        }

        // POST: Payment/IniciarRetiro
        [HttpPost]
        public async Task<IActionResult> IniciarRetiro(RetiroViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View("Withdraw", model);
            }

            try
            {
                // Obtener ID del usuario de la sesión
                int userId = Convert.ToInt32(HttpContext.Session.GetString("UserId"));

                var requestData = new
                {
                    IdUsuario = userId,
                    Monto = (double)model.Monto
                };

                var content = new StringContent(JsonConvert.SerializeObject(requestData), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{_baseUrl}/api/Transaccion/IniciarRetiro", content);

                if (response.IsSuccessStatusCode)
                {
                    // Guardar monto en TempData para usarlo en la confirmación
                    TempData["MontoRetiro"] = model.Monto;
                    TempData["OperacionTipo"] = "retiro";

                    // Redirigir a la página de confirmación OTP
                    return RedirectToAction("ConfirmarOTP");
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                TempData["Error"] = errorContent;
                return View("Withdraw", model);
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"Error: {ex.Message}";
                return View("Withdraw", model);
            }
        }

        // GET: Payment/ConfirmarOTP
        public IActionResult ConfirmarOTP()
        {
            // Verificar si hay un proceso de transacción en curso
            if (TempData["MontoRetiro"] == null && TempData["MontoDeposito"] == null)
            {
                return RedirectToAction("ActividadCliente", "Finanza");
            }

            var viewModel = new ConfirmacionOTPViewModel
            {
                Monto = TempData["MontoRetiro"] != null
                    ? Convert.ToDecimal(TempData["MontoRetiro"])
                    : Convert.ToDecimal(TempData["MontoDeposito"]),

                Operacion = TempData["OperacionTipo"]?.ToString()
            };

            // Mantener los valores en TempData para el post
            TempData.Keep("MontoRetiro");
            TempData.Keep("MontoDeposito");
            TempData.Keep("OperacionTipo");

            return View(viewModel);
        }

        [HttpPost]
        public async Task<IActionResult> ProcessDeposit(DepositoViewModel model)
        {
            if (!ModelState.IsValid)
                return View("Deposit", model);

            try
            {
                // Obtener ID del usuario de la sesión (con validación)
                if (!HttpContext.User.Identity.IsAuthenticated)
                {
                    TempData["Error"] = "Usuario no autenticado";
                    return RedirectToAction("Login", "Account");
                }

                // Obtener el ID del usuario (ajusta según tu sistema de autenticación)
                var userIdClaim = HttpContext.User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    TempData["Error"] = "No se pudo obtener el ID de usuario";
                    return RedirectToAction("Login", "Account");
                }

                // Generar OTP
                var userEmail = HttpContext.User.Identity.Name; // Asume que el email está en el claim Name
                string otp = await _seguridadAdmin.GenerateOTP(userEmail);

                // Guardar datos temporales
                TempData["MontoDeposito"] = model.Monto;
                TempData["OperacionTipo"] = "deposito";

                return RedirectToAction("ConfirmarOTP");
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"Error: {ex.Message}";
                return View("Deposit", model);
            }
        }

        // POST: Payment/ConfirmarTransaccion
        [HttpPost]
        public async Task<IActionResult> ConfirmarTransaccion(ConfirmacionOTPViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View("ConfirmarOTP", model);
            }

            try
            {
                // Obtener datos de TempData
                decimal monto = 0;
                string operacion = model.Operacion;

                if (operacion == "retiro" && TempData["MontoRetiro"] != null)
                {
                    monto = Convert.ToDecimal(TempData["MontoRetiro"]);
                }
                else if (operacion == "deposito" && TempData["MontoDeposito"] != null)
                {
                    monto = Convert.ToDecimal(TempData["MontoDeposito"]);
                }
                else
                {
                    TempData["Error"] = "Los datos de la transacción no son válidos";
                    return RedirectToAction("ActividadCliente", "Finanza");
                }

                // Obtener ID del usuario de la sesión
                int userId = Convert.ToInt32(HttpContext.Session.GetString("UserId"));

                var requestData = new
                {
                    IdUsuario = userId,
                    Monto = (double)monto,
                    OTP = model.OTP
                };

                var content = new StringContent(JsonConvert.SerializeObject(requestData), Encoding.UTF8, "application/json");

                // Llamar al endpoint correspondiente según la operación
                var endpoint = operacion == "retiro" ? "ConfirmarRetiro" : "ConfirmarDeposito";
                var response = await _httpClient.PostAsync($"{_baseUrl}/api/Transaccion/{endpoint}", content);

                if (response.IsSuccessStatusCode)
                {
                    TempData["Exito"] = operacion == "retiro"
                        ? "Retiro procesado exitosamente"
                        : "Depósito procesado exitosamente";

                    return RedirectToAction("ActividadCliente", "Finanza");
                }

                var errorContent = await response.Content.ReadAsStringAsync();
                TempData["Error"] = errorContent;

                // Mantener los datos para reintentar
                TempData.Keep("MontoRetiro");
                TempData.Keep("MontoDeposito");
                TempData.Keep("OperacionTipo");

                return View("ConfirmarOTP", model);
            }
            catch (Exception ex)
            {
                TempData["Error"] = $"Error: {ex.Message}";
                return View("ConfirmarOTP", model);
            }
        }
    }
}