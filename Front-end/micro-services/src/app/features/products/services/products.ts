import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../shared/models/product';
import { PagedResult } from '../../../shared/models/paging';
import { buildHttpParams } from '../../../shared/utils/http-params';

export interface ProductsQuery {
  q?: string | null;
  category?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  page?: number;
  size?: number;
}

/** Adapta cualquier forma de respuesta a {items,total} */
function adaptPaged<T>(resp: any): PagedResult<T> {
  // Caso 1: backend ya devuelve { items, total }
  if (resp && Array.isArray(resp.items) && typeof resp.total === 'number') {
    return { items: resp.items as T[], total: resp.total };
  }
  // Caso 2: backend devuelve un array "puro"
  if (Array.isArray(resp)) {
    return { items: resp as T[], total: resp.length };
  }
  // Caso 3: backend devuelve { data, total }
  if (resp?.data && Array.isArray(resp.data) && typeof resp.total === 'number') {
    return { items: resp.data as T[], total: resp.total };
  }
  return { items: [], total: 0 };
}

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private base = environment.apiBaseProducts; //Aqui apuntamos al backend

  list(query: ProductsQuery): Observable<PagedResult<Product>> {
    const params = buildHttpParams({
      q: query.q ?? null,
      category: query.category ?? null,
      priceMin: query.priceMin ?? null,
      priceMax: query.priceMax ?? null,
      page: query.page ?? 1,
      size: query.size ?? 10,
    });

    return this.http
      .get<any>(`${this.base}/api/Products`, { params })
      .pipe(map((resp) => adaptPaged<Product>(resp)));
  }

  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/api/Products/${id}`);
  }

  /** Crea varios productos de una sola vez */
  createBulk(products: Product[]): Observable<any> {
    return this.http.post(`${this.base}/api/Products/bulk`, products);
  }

  update(id: number, dto: Partial<Product>) {
    const payload = { id, ...dto };
    return this.http.put(`${this.base}/api/Products/${id}`, payload);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.base}/api/Products/${id}`);
  }

  /** Suma stock */
  addStock(id: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.base}/api/Products/${id}/add`, null, {
      params: buildHttpParams({ quantity }),
    });
  }

  /** Resta stock (reserva/venta) */
  reserveStock(id: number, quantity: number): Observable<any> {
    return this.http.patch(`${this.base}/api/Products/${id}/reserve`, null, {
      params: buildHttpParams({ quantity }),
    });
  }
}
