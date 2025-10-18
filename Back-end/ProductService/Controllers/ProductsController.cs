using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProductService.Data;
using ProductService.Models;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ProductsDbContext _db;

    public ProductsController(ProductsDbContext db)
    {
        // Inyectamos el contexto de la base de datos para acceder a los productos
        _db = db;
    }

    #region GET - Listado con filtros y paginación
    /*
     * Este endpoint devuelve la lista de productos con varios filtros opcionales:
     * - q: búsqueda por nombre
     * - category: filtra por categoría exacta
     * - priceMin y priceMax: rango de precios
     * Y tiene paginación con los parámetros "page" y "size".
     */
    [HttpGet]
    public async Task<ActionResult<object>> Get(
        [FromQuery] string? q, [FromQuery] string? category,
        [FromQuery] decimal? priceMin, [FromQuery] decimal? priceMax,
        [FromQuery] int page = 1, [FromQuery] int size = 10)
    {
        // Empezamos consultando todos los productos
        var query = _db.Products.AsQueryable();

        // Aplicamos filtros si vienen en la consulta
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(p => p.Name.Contains(q));
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);
        if (priceMin.HasValue)
            query = query.Where(p => p.Price >= priceMin.Value);
        if (priceMax.HasValue)
            query = query.Where(p => p.Price <= priceMax.Value);

        // Contamos el total de productos antes de aplicar paginación
        var total = await query.CountAsync();

        // Ordenamos por Id, saltamos los registros de las páginas anteriores y tomamos los que tocan
        var items = await query
            .OrderBy(p => p.Id)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync();

        // Devolvemos un objeto con los datos paginados
        return Ok(new { total, page, size, items });
    }
    #endregion

    #region GET - Obtener producto por ID
    /*
     * Busca un producto por su Id.
     * Si lo encuentra lo devuelve con estado 200, si no, devuelve 404.
     */
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetById(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        return Ok(product);
    }
    #endregion

    #region POST - Crear un nuevo producto
    /*
     * Crea un nuevo producto en la base de datos.
     * EF Core se encarga de asignar el Id automáticamente.
     */
    [HttpPost("bulk")]
    public async Task<IActionResult> CreateMany(List<Product> products)
    {
        if (products == null || !products.Any()) return BadRequest("No hay productos para agregar.");

        _db.AddRange(products);
        _db.AddRange(products);
        await _db.SaveChangesAsync();
        return Ok(products);
    }
    #endregion

    #region PUT - Actualizar un producto existente
    /*
     * Reemplaza todos los datos de un producto existente.
     * Verifica que el id del cuerpo y el id de la ruta coincidan.
     */
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Product p)
    {
        if (id != p.Id)
            return BadRequest("El ID de la ruta y el del producto no coinciden.");

        // Marcamos el producto como modificado para que EF lo actualice
        _db.Entry(p).State = EntityState.Modified;
        await _db.SaveChangesAsync();

        // No devuelve contenido, solo indica que se actualizó correctamente
        return NoContent();
    }
    #endregion

    #region DELETE - Eliminar un producto
    /*
     * Elimina un producto de la base de datos.
     * Si el producto no existe, devuelve 404.
     */
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound();

        _db.Remove(product);
        await _db.SaveChangesAsync();

        return NoContent(); // 204
    }
    #endregion

    #region PATCH - Reservar stock (venta)
    /*
     * Este endpoint se usa cuando se realiza una venta.
     * Disminuye el stock del producto validando que haya suficiente cantidad.
     * Devuelve el nuevo stock o un error si no hay suficiente.
     */
    [HttpPatch("{id:int}/reserve")]
    public async Task<IActionResult> Reserve(int id, [FromQuery] int quantity)
    {
        if (quantity <= 0)
            return BadRequest("La cantidad debe ser mayor que 0.");

        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound("Producto no encontrado.");

        // Validamos que haya stock suficiente
        if (product.Stock < quantity)
            return Conflict("Stock insuficiente.");

        product.Stock -= quantity;
        await _db.SaveChangesAsync();

        // Retornamos el nuevo stock del producto
        return Ok(new { product.Id, product.Stock });
    }
    #endregion

    #region PATCH - Agregar stock (compra o reposición)
    /*
     * Este endpoint se usa para registrar una compra o una reposición de productos.
     * Aumenta el stock de un producto existente.
     */
    [HttpPatch("{id:int}/add")]
    public async Task<IActionResult> Add(int id, [FromQuery] int quantity)
    {
        if (quantity <= 0)
            return BadRequest("La cantidad debe ser mayor que 0.");

        var product = await _db.Products.FindAsync(id);
        if (product == null)
            return NotFound("Producto no encontrado.");

        product.Stock += quantity;
        await _db.SaveChangesAsync();

        // Retorna el nuevo stock actualizado
        return Ok(new { product.Id, product.Stock });
    }
    #endregion
}
