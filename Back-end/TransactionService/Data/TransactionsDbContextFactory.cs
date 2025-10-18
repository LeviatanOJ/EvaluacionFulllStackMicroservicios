using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace TransactionService.Data;

public class TransactionsDbContextFactory : IDesignTimeDbContextFactory<TransactionsDbContext>
{
    public TransactionsDbContext CreateDbContext(string[] args)
    {
        var cfg = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json", optional: false)
            .AddEnvironmentVariables()
            .Build();

        var opt = new DbContextOptionsBuilder<TransactionsDbContext>()
            .UseSqlServer(cfg.GetConnectionString("Default"))
            .Options;

        return new TransactionsDbContext(opt);
    }
}
