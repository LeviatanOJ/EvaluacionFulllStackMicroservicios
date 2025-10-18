using System.Net.Http.Json;

namespace TransactionService.Services;

#region Cliente HTTP hacia ProductService
/*
 * Este cliente encapsula todas las llamadas HTTP al ProductService.
 * La idea es centralizar aquí la lógica de integrar con:
 *   PATCH /api/products/{id}/reserve?quantity=Q   (venta)
 *   PATCH /api/products/{id}/add?quantity=Q       (compra)
 * Se registra como Typed Client en Program.cs para tener BaseAddress y timeouts listos.
 */
public class ProductsClient
{
    private readonly HttpClient _http;

    public ProductsClient(HttpClient http)
    {
        // HttpClient ya viene configurado con BaseAddress en Program.cs
        _http = http;
    }

    /*
     * Reserva stock para una venta.
     * Devuelve true si pudo reservar; false si hubo 409 (stock insuficiente).
     * Cualquier otro error HTTP se propaga como excepción para que el controller decida.
     */
    public async Task<bool> ReserveAsync(int productId, int quantity, CancellationToken ct = default)
    {
        var url = $"/api/products/{productId}/reserve?quantity={quantity}";
        using var res = await _http.PatchAsync(url, content: null, ct);
        if (res.IsSuccessStatusCode) return true;
        if ((int)res.StatusCode == 409) return false; // conflicto de stock
        res.EnsureSuccessStatusCode();
        return false;
    }

    /*
     * Agrega stock para una compra/reposición.
     * Devuelve true si se aplicó correctamente.
     * Otros errores HTTP se propagan.
     */
    public async Task<bool> AddAsync(int productId, int quantity, CancellationToken ct = default)
    {
        var url = $"/api/products/{productId}/add?quantity={quantity}";
        using var res = await _http.PatchAsync(url, content: null, ct);
        res.EnsureSuccessStatusCode();
        return true;
    }
}
#endregion
