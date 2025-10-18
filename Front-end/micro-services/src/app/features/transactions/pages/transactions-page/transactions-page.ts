import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import {
  DataTableComponent,
  TableColumn,
} from '../../../../shared/components/data-table/data-table';
import {
  FilterBarComponent,
  FilterField,
} from '../../../../shared/components/filter-bar/filter-bar';

import { Transaction } from '../../../../shared/models/transaction';
import { PagedResult } from '../../../../shared/models/paging';
import { TransactionsService, TransactionType } from '../../services/transactions';
import { NotificationsService } from '../../../../core/services/notifications';
import { TransactionDialogComponent } from './transaction-dialog';

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    DataTableComponent,
    FilterBarComponent,
  ],
  templateUrl: './transactions-page.html',
  styleUrls: ['./transactions-page.scss'],
})
export class TransactionsPageComponent implements OnInit {
  columns: TableColumn<Transaction>[] = [
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'dateUtc', header: 'Fecha' },
    { key: 'type', header: 'Tipo', width: '100px' },
    { key: 'productId', header: 'Producto ID', width: '120px' },
    { key: 'quantity', header: 'Cantidad', width: '100px' },
    { key: 'unitPrice', header: 'Precio U.', cellTpl: 'price', width: '120px' },
    { key: 'totalPrice', header: 'Total', cellTpl: 'price', width: '120px' },
  ];

  filterFields: FilterField[] = [
    { type: 'date-range', label: 'Fecha', rangeKeys: { min: 'from', max: 'to' } },
    {
      key: 'type',
      label: 'Tipo',
      type: 'select',
      options: [
        { value: 1, label: 'Compra' },
        { value: 2, label: 'Venta' },
      ],
    },
    { key: 'productId', label: 'Producto ID', type: 'number' },
  ];

  filters = signal<{
    from?: string | null;
    to?: string | null;
    type?: TransactionType | null;
    productId?: number | null;
  }>({});
  page = signal(1);
  size = signal(10);

  loading = signal(false);
  rows = signal<Transaction[]>([]);
  total = signal(0);

  query = computed(() => ({
    ...this.filters(),
    page: this.page(),
    size: this.size(),
  }));

  constructor(
    private tx: TransactionsService,
    private notify: NotificationsService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadList();
  }

  loadList() {
    this.loading.set(true);
    this.tx.list(this.query()).subscribe({
      next: (res: PagedResult<Transaction>) => {
        this.rows.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onApplyFilters(f: any) {
    this.filters.set(f);
    this.page.set(1);
    this.loadList();
  }
  onResetFilters() {
    this.filters.set({});
    this.page.set(1);
    this.loadList();
  }
  onPage(ev: { page: number; size: number }) {
    this.page.set(ev.page);
    this.size.set(ev.size);
    this.loadList();
  }
  onSort(_: any) {
    this.page.set(1);
    this.loadList();
  }

  newTransaction() {
    const ref = this.dialog.open(TransactionDialogComponent, { width: '520px' });
    ref.afterClosed().subscribe((res) => {
      if (res?.refresh) this.loadList();
    });
  }
}
