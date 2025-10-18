using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using TransactionService.Models;

namespace TransactionService.Data;

public class TransactionsDbContext : DbContext
{
    public TransactionsDbContext(DbContextOptions<TransactionsDbContext> options) : base(options) { }

    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Transaction>(e =>
        {
            e.Property(x => x.DateUtc).HasColumnType("datetime2");
            e.Property(x => x.UnitPrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.TotalPrice).HasColumnType("decimal(18,2)");
            e.Property(x => x.Detail).HasMaxLength(500);

            e.HasIndex(x => x.ProductId);
            e.HasIndex(x => x.DateUtc);
            e.HasIndex(x => x.Type);
        });
    }
}
