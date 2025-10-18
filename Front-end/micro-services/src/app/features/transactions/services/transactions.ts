import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Transaction } from '../../../shared/models/transaction';
import { PagedResult } from '../../../shared/models/paging';
import { buildHttpParams } from '../../../shared/utils/http-params';

export type TransactionType = 1 | 2; // 1 = purchase, 2 = sale

export interface TransactionsQuery {
  from?: string | Date | null;
  to?: string | Date | null;
  type?: TransactionType | null;
  productId?: number | null;
  page?: number;
  size?: number;
}

export interface CreateTransactionRequest {
  type: TransactionType;
  productId: number;
  quantity: number;
  unitPrice: number;
  detail?: string | null;
}

/** Adapta cualquier forma de respuesta a {items,total} */
function adaptPaged<T>(resp: any): PagedResult<T> {
  if (resp && Array.isArray(resp.items) && typeof resp.total === 'number') {
    return { items: resp.items as T[], total: resp.total };
  }
  if (Array.isArray(resp)) {
    return { items: resp as T[], total: resp.length };
  }
  if (resp?.data && Array.isArray(resp.data) && typeof resp.total === 'number') {
    return { items: resp.data as T[], total: resp.total };
  }
  return { items: [], total: 0 };
}

function toIso(v?: string | Date | null) {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString();
  return null;
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private http = inject(HttpClient);
  private base = environment.apiBaseTransactions; // Aqui tambien aputamos al backend

  list(query: TransactionsQuery): Observable<PagedResult<Transaction>> {
    const params = buildHttpParams({
      from: toIso(query.from),
      to: toIso(query.to),
      type: query.type ?? null,
      productId: query.productId ?? null,
      page: query.page ?? 1,
      size: query.size ?? 10,
    });

    return this.http
      .get<any>(`${this.base}/api/Transactions`, { params })
      .pipe(map((resp) => adaptPaged<Transaction>(resp)));
  }

  get(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.base}/api/Transactions/${id}`);
  }

  /** Historial por producto con filtros/paginación */
  listByProduct(
    productId: number,
    query: Omit<TransactionsQuery, 'productId'>,
  ): Observable<PagedResult<Transaction>> {
    const params = buildHttpParams({
      from: toIso(query.from),
      to: toIso(query.to),
      type: query.type ?? null,
      page: query.page ?? 1,
      size: query.size ?? 10,
    });

    return this.http
      .get<any>(`${this.base}/api/Transactions/by-product/${productId}`, { params })
      .pipe(map((resp) => adaptPaged<Transaction>(resp)));
  }

  /** Crear transacción (compra o venta) */
  create(dto: CreateTransactionRequest): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.base}/api/Transactions`, dto);
  }
}
