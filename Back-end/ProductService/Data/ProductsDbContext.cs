using Microsoft.EntityFrameworkCore;
using ProductService.Models;

namespace ProductService.Data
{
    /*
     * Esta clase representa el contexto de la base de datos del microservicio de productos.
     * Hereda de DbContext y es la encargada de comunicarse con SQL Server mediante Entity Framework Core.
     * Aquí se definen las entidades o tablas y sus configuraciones.
     */
    public class ProductsDbContext : DbContext
    {
        #region Constructor
        /*
         * El constructor recibe las opciones del contexto.
         * y las pasa a la clase base. Esto se configura en Program.cs con AddDbContext().
         */
        public ProductsDbContext(DbContextOptions<ProductsDbContext> options) : base(options) { }
        #endregion

        #region DbSet (Tablas del modelo)
        /*
         * Cada DbSet representa una tabla en la base de datos.
         * En este caso, "Products" será la tabla que almacenará la información de los productos.
         * Entity Framework se encarga de mapear la clase Product a la tabla dbo.Products automáticamente.
         */
        public DbSet<Product> Products => Set<Product>();
        #endregion

        #region Configuración del modelo
        /*
         * Aquí personalizamos cómo se crean las tablas y columnas en la base de datos.
         * EF Core tiene convenciones por defecto
         * pero en esta sección podemos ajustar reglas específicas como longitudes, tipos de datos o índices.
         */
        protected override void OnModelCreating(ModelBuilder b)
        {
            // Configuración de la entidad Product
            b.Entity<Product>(e =>
            {
                /*
                 * Name:
                 * - Máximo 150 caracteres para evitar cadenas demasiado largas.
                 * - Obligatorio (IsRequired) porque todo producto debe tener un nombre.
                 */
                e.Property(x => x.Name)
                 .HasMaxLength(150)
                 .IsRequired();

                /*
                 * Category:
                 * - Máximo 80 caracteres.
                 * - También es obligatoria para poder clasificar los productos.
                 */
                e.Property(x => x.Category)
                 .HasMaxLength(80)
                 .IsRequired();

                /*
                 * Price:
                 * - Tipo decimal con 18 dígitos y 2 decimales.
                 *   Esto se usa comúnmente para precios y valores monetarios.
                 */
                e.Property(x => x.Price)
                 .HasColumnType("decimal(18,2)");

                /*
                 * Índices:
                 * - Creamos un índice sobre el campo Name para acelerar búsquedas por nombre.
                 * - Creamos otro índice combinado de Category + Price para consultas filtradas.
                 */
                e.HasIndex(x => x.Name);
                e.HasIndex(x => new { x.Category, x.Price });
            });
        }
        #endregion
    }
}
