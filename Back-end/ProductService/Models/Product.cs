namespace ProductService.Models
{

    //Aquí definimos la clase Product que representa un producto en nuestro sistema.
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string Category { get; set; } = null!;
        public string? ImageUrl { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
    }
}
