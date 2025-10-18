import { Routes } from '@angular/router';
import { ProductsPageComponent } from './features/products/pages/products-page/products-page';
import { TransactionsPageComponent } from './features/transactions/pages/transactions-page/transactions-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'productos' },
  { path: 'productos', component: ProductsPageComponent },
  { path: 'transacciones', component: TransactionsPageComponent },
  { path: '**', redirectTo: 'productos' },
];
