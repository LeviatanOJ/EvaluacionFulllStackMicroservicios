using Microsoft.EntityFrameworkCore;
using TransactionService.Data;
using TransactionService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<TransactionsDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddHttpClient<ProductsClient>(client =>
{
    var baseUrl = builder.Configuration["Services:Products:BaseUrl"];
    client.BaseAddress = new Uri(baseUrl!);
    client.Timeout = TimeSpan.FromSeconds(10);
});

builder.Services.AddCors(o => o.AddPolicy("ng",
    p => p.WithOrigins("http://localhost:4200")
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors("ng");
app.MapControllers();

app.Run();
