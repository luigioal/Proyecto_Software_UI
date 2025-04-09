using System;
using System.Diagnostics;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Mvc;
using Proyecto_Software_2_UI.Models;

namespace Proyecto_Software_2_UI.Controllers
{
    public class HomeController : Controller
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<HomeController> _logger;

        public HomeController(IWebHostEnvironment env, ILogger<HomeController> logger)
        {
            _env = env;
            _logger = logger;
        }

        // COnfiguracion de baseUrl dependiendo del ambiente
        [HttpGet("api/config")]
        public IActionResult GetClientConfig()
        {
            var config = new
            {
                baseUrl = _env.IsDevelopment()
                    ? "http://localhost:5058"
                    : "https://proyecto-software-2.azurewebsites.net"
            };
            return Ok(config);
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult IndexAutenticado()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
