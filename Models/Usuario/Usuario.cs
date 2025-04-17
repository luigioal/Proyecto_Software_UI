namespace Proyecto_Software_2_UI.Models.Usuario
{
    public class Usuario
    {
        public string Tipo { get; set; }
        public string Nombre { get; set; }
        public string PrimerApellido { get; set; }
        public string? SegundoApellido { get; set; }
        public DateTime FechaNacimiento { get; set; }
        public string CorreoElectronico { get; set; }
        public string? Direccion { get; set; }
        public string? FotoPerfil { get; set; }
        public string Contrasena { get; set; }
        public bool Estado { get; set; }
        public DateTime FechaRegistro { get; set; }
        public DateTime? UltimoAcceso { get; set; }
    }
}
