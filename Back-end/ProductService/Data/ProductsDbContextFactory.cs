using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace ProductService.Data
{
    #region Factory de diseño para EF (migrations)
    /*
     * Esta clase SOLO se usa en “tiempo de diseño” (design time), es decir,
     * cuando corremos comandos como:
     *
     *   dotnet ef migrations add 
     *   dotnet ef database update
     *
     * EF necesita instanciar el DbContext sin levantar toda la app, y este archivo hace el trabajo de Program.cs si se iniciar la app
     */
    public class ProductsDbContextFactory : IDesignTimeDbContextFactory<ProductsDbContext>
    {
        public ProductsDbContext CreateDbContext(string[] args)
        {
            // 1) Cargamos configuración igual que lo haría Program.cs
            var cfg = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: false) // conexión local para desarrollo
                .AddEnvironmentVariables()                        // permite sobreescribir por variables de entorno
                .Build();

            // 2) Armamos las opciones del DbContext apuntando a SQL Server con la connection string "Default"
            var opt = new DbContextOptionsBuilder<ProductsDbContext>()
                .UseSqlServer(cfg.GetConnectionString("Default"))
                .Options;

            // 3) Devolvemos un DbContext listo por las herramientas de EF
            return new ProductsDbContext(opt);
        }
    }
    #endregion
}
