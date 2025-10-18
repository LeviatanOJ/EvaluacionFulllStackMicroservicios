using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TransactionService.Data;
using TransactionService.Models;
using TransactionService.Services;

namespace TransactionService.Controllers;

#region DTOs de entrada/salida
public record CreateTransactionRequest(
    TransactionType Type,
    int ProductId,
    int Quantity,
    decimal UnitPrice,
    string? Detail
);
#endregion

[ApiController]
[Route("api/[controller]")]
public class TransactionsController : ControllerBase
{
    private readonly TransactionsDbContext _db;
    private readonly ProductsClient _products;

    public TransactionsController(TransactionsDbContext db, ProductsClient products)
    {
        _db = db;
        _products = products;
    }

    #region POST - Crear transacción (compra/venta) y ajustar stock
    /*
     * Flujo:
     * 1) Validamos datos básicos y calculamos el total.
     * 2) Si es venta (Sale): llamamos a ProductService /reserve. Si no hay stock (409), cortamos.
     *    Si es compra (Purchase): llamamos a ProductService /add para incrementar stock.
     * 3) Si la llamada al ProductService fue exitosa, persistimos la transacción en nuestra BD.
     */
    [HttpPost]
    public async Task<ActionResult<Transaction>> Create(CreateTransactionRequest req, CancellationToken ct)
    {
        if (req.Quantity <= 0) return BadRequest("Quantity must be > 0.");
        if (req.UnitPrice < 0) return BadRequest("UnitPrice must be >= 0.");

        var total = req.Quantity * req.UnitPrice;

        var ok = true;
        if (req.Type == TransactionType.Sale)
        {
            // Venta: hay que reservar (descontar) stock
            ok = await _products.ReserveAsync(req.ProductId, req.Quantity, ct);
            if (!ok) return Conflict("Insufficient stock.");
        }
        else if (req.Type == TransactionType.Purchase)
        {
            // Compra: incrementa stock
            ok = await _products.AddAsync(req.ProductId, req.Quantity, ct);
        }

        // Si llegamos aquí, el ajuste de stock fue exitoso → persistimos la transacción
        var tx = new Transaction
        {
            DateUtc = DateTime.UtcNow,
            Type = req.Type,
            ProductId = req.ProductId,
            Quantity = req.Quantity,
            UnitPrice = req.UnitPrice,
            TotalPrice = total,
            Detail = req.Detail
        };

        _db.Add(tx);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetById), new { id = tx.Id }, tx);
    }
    #endregion

    #region GET - Obtener transacción por Id
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Transaction>> GetById(int id, CancellationToken ct)
    {
        var tx = await _db.Transactions.FindAsync([id], ct);
        return tx is null ? NotFound() : Ok(tx);
    }
    #endregion

    #region GET - Listado con filtros y paginación
    /*
     * Listado general de transacciones con filtros:
     * - from / to: por rango de fechas (UTC)
     * - type: Purchase o Sale
     * - productId: filtrar por producto
     * Paginación: page/size
     */
    [HttpGet]
    public async Task<ActionResult<object>> Get(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] TransactionType? type,
        [FromQuery] int? productId,
        [FromQuery] int page = 1,
        [FromQuery] int size = 10,
        CancellationToken ct = default)
    {
        var q = _db.Transactions.AsQueryable();

        if (from.HasValue) q = q.Where(x => x.DateUtc >= from.Value);
        if (to.HasValue) q = q.Where(x => x.DateUtc <= to.Value);
        if (type.HasValue) q = q.Where(x => x.Type == type.Value);
        if (productId.HasValue) q = q.Where(x => x.ProductId == productId.Value);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(x => x.DateUtc)
            .ThenBy(x => x.Id)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(ct);

        return Ok(new { total, page, size, items });
    }
    #endregion

    #region GET - Historial por producto
    /*
     * Devuelve el historial de transacciones de un producto específico, con filtros de fecha opcionales.
     * Ideal para la vista "histórico por producto".
     */
    [HttpGet("by-product/{productId:int}")]
    public async Task<ActionResult<object>> GetByProduct(
        int productId,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] TransactionType? type,
        [FromQuery] int page = 1,
        [FromQuery] int size = 10,
        CancellationToken ct = default)
    {
        var q = _db.Transactions.Where(x => x.ProductId == productId);

        if (from.HasValue) q = q.Where(x => x.DateUtc >= from.Value);
        if (to.HasValue) q = q.Where(x => x.DateUtc <= to.Value);
        if (type.HasValue) q = q.Where(x => x.Type == type.Value);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(x => x.DateUtc)
            .ThenBy(x => x.Id)
            .Skip((page - 1) * size)
            .Take(size)
            .ToListAsync(ct);

        return Ok(new { total, page, size, items });
    }
    #endregion
}
