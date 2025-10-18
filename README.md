# 🧩 Microservicios (.NET + Angular)

Este repositorio contiene una solución con dos microservicios (**ProductService** y **TransactionService**) en **.NET** y un **Frontend Angular**.  
Incluye scripts SQL para crear las bases de datos y un PDF con evidencias funcionales.

---

## 📁 Estructura

```plaintext
Microservicios/
├─ Back-end/
│  ├─ ProductService/
│  ├─ TransactionService/
│  └─ Microservicios.sln
├─ Front-end/
│  └─ (Proyecto Angular)
├─ 01_products_db.sql
├─ 02_transactions_db.sql
├─ docs/
│  └─ Evidencias.pdf
└─ README.md
```

---

## ✅ Requisitos

- .NET SDK 8+
- SQL Server (local o vía Docker)
- Node.js 20+
- Angular CLI (`npm i -g @angular/cli`)
- pnpm (recomendado) o npm

> Los scripts SQL están en la raíz: `01_products_db.sql` y `02_transactions_db.sql`.

---

## 🗄️ Base de datos

### 🔹 Opción A) SQL Server con Docker (rápida)

```powershell
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Root123!" -p 1433:1433 --name Sql-Server -d mcr.microsoft.com/mssql/server:2022-latest
```

Conéctate con:

- Servidor: `localhost,1433`
- Usuario: `sa`
- Password: `Root123!` (cámbiala si quieres)

Ejecuta los scripts, en este orden:

1. `01_products_db.sql`
2. `02_transactions_db.sql`

En **SSMS/Azure Data Studio**: abrir y ejecutar.  
O con **sqlcmd**:

```powershell
sqlcmd -S localhost,1433 -U sa -P "Root123!" -i 01_products_db.sql
sqlcmd -S localhost,1433 -U sa -P "Root123!" -i 02_transactions_db.sql
```

### 🔹 Opción B) SQL Server instalado local

Conéctate a tu instancia y ejecuta los mismos scripts.

---

## 🔧 Backend (.NET)

Ir a la carpeta **Back-end**:

```powershell
cd .\Back-end
```

Restaurar dependencias y compilar la solución:

```powershell
dotnet restore .\Microservicios.sln
dotnet build .\Microservicios.sln --no-restore
```

Configurar connection strings (si hace falta) en:

- `ProductService/appsettings.json`
- `TransactionService/appsettings.json`

Ejemplo:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost,1433;Database=ProductsDb;User Id=sa;Password=Root123!;TrustServerCertificate=True;"
}
```

(Análogo para `TransactionsDb`.)

Ejecutar cada microservicio (en terminales separadas):

```powershell
dotnet run --project .\ProductService\ProductService.csproj
dotnet run --project .\TransactionService\TransactionService.csproj
```

---

## 🖥️ Frontend (Angular)

Ir a **Front-end**:

```powershell
cd .\Front-end
```

Instalar dependencias:

```powershell
pnpm install
# o
npm install
```

Configurar endpoints en `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiProducts: "http://localhost:<puerto-products>/api",
  apiTransactions: "http://localhost:<puerto-transactions>/api",
};
```

Levantar el proyecto:

```powershell
ng serve
```

Abre [http://localhost:4200](http://localhost:4200)

---

## 🧪 Flujo de prueba rápido

1. Ejecuta los scripts SQL (si aún no lo hiciste).
2. Corre ProductService y TransactionService.
3. Actualiza los endpoints del Frontend.
4. Abre Angular y prueba:
   - Crear producto.
   - Registrar transacciones (compra/venta).
   - Verificar stock actualizado y listado de transacciones.

---

## 📄 Evidencias

En `docs/Evidencias.pdf` encontrarán capturas que demuestran el funcionamiento (CRUD, paginación/filtros, transacciones y actualización de stock).

---

## 🛠️ Comandos útiles

Ver migraciones:

```powershell
dotnet ef migrations list --project .\Back-end\ProductService\ProductService.csproj --startup-project .\Back-end\ProductService\ProductService.csproj
dotnet ef migrations list --project .\Back-end\TransactionService\TransactionService.csproj --startup-project .\Back-end\TransactionService\TransactionService.csproj
```

Scripts SQL (ya generados):

```plaintext
01_products_db.sql
02_transactions_db.sql
```

---

## 🚑 Troubleshooting

- **Error de conexión:** confirma host/puerto/credenciales y `TrustServerCertificate=True`.
- **CORS:** si el Frontend no puede llamar a la API, habilita CORS en los microservicios (origins `http://localhost:4200`).
- **Puertos:** si uno está ocupado, cambia en `launchSettings.json`.

---
