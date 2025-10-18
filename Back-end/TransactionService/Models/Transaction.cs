namespace TransactionService.Models
{
    public enum TransactionType
    {
        Purchase = 1,
        Sale = 2
    }

    public class Transaction
    {
        public int Id { get; set; }
        public DateTime DateUtc { get; set; }
        public TransactionType Type { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string? Detail { get; set; }
    }
}
