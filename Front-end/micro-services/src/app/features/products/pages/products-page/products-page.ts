import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, computed, signal } from '@angular/core';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import {
  DataTableComponent,
  TableColumn,
} from '../../../../shared/components/data-table/data-table';
import {
  FilterBarComponent,
  FilterField,
} from '../../../../shared/components/filter-bar/filter-bar';

import { Product } from '../../../../shared/models/product';
import { PagedResult } from '../../../../shared/models/paging';
import { ProductsService } from '../../services/products';
import {
  TransactionsService,
  TransactionsQuery,
} from '../../../transactions/services/transactions';
import { NotificationsService } from '../../../../core/services/notifications';
import { ProductDialogComponent } from './product-dialog';
import { StockDialogComponent } from './stock-dialog';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSidenavModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    DataTableComponent,
    FilterBarComponent,
  ],
  templateUrl: './products-page.html',
  styleUrls: ['./products-page.scss'],
})
export class ProductsPageComponent implements OnInit {
  // tabla
  columns: TableColumn<Product>[] = [
    { key: 'imageUrl', header: '', cellTpl: 'image', width: '56px' },
    { key: 'id', header: 'ID', width: '80px' },
    { key: 'name', header: 'Nombre', sortable: true },
    { key: 'category', header: 'Categoría', sortable: true },
    { key: 'price', header: 'Precio', cellTpl: 'price', sortable: true, width: '120px' },
    { key: 'stock', header: 'Stock', sortable: true, width: '100px' },
  ];
  actionButtons: Array<'edit' | 'delete' | 'stockPlus' | 'stockMinus' | 'view'> = [
    'edit',
    'delete',
    'stockPlus',
    'stockMinus',
  ];

  // filtros
  filterFields: FilterField[] = [
    { key: 'q', label: 'Buscar', type: 'text', placeholder: 'Nombre...' },
    { key: 'category', label: 'Categoría', type: 'text' },
    { type: 'number-range', label: 'Precio', rangeKeys: { min: 'priceMin', max: 'priceMax' } },
  ];
  filters = signal<{
    q?: string | null;
    category?: string | null;
    priceMin?: number | null;
    priceMax?: number | null;
  }>({});

  // paginación
  page = signal(1);
  size = signal(10);

  // data
  loading = signal(false);
  rows = signal<Product[]>([]);
  total = signal(0);

  // drawer (historial por producto)
  @ViewChild('historyDrawer') historyDrawer!: MatSidenav;
  historyLoading = signal(false);
  historyItems = signal<any[]>([]);
  historyTotal = signal(0);
  historyQuery = signal<TransactionsQuery>({ page: 1, size: 10 });
  selectedProduct = signal<Product | null>(null);

  // computados
  query = computed(() => ({
    ...this.filters(),
    page: this.page(),
    size: this.size(),
  }));

  constructor(
    private products: ProductsService,
    private tx: TransactionsService,
    private notify: NotificationsService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadList();
  }

  loadList() {
    this.loading.set(true);
    this.products.list(this.query()).subscribe({
      next: (res: PagedResult<Product>) => {
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

  onSort(_: { active: string; direction: 'asc' | 'desc' | '' }) {
    this.page.set(1);
    this.loadList();
  }

  onRowAction(ev: {
    action: 'edit' | 'delete' | 'stockPlus' | 'stockMinus' | 'view';
    row: Product;
  }) {
    const row = ev.row;

    if (ev.action === 'edit') {
      this.openProductDialog(row);
      return;
    }

    if (ev.action === 'delete') {
      if (confirm(`¿Eliminar el producto "${row.name}"?`)) {
        this.products.delete(row.id).subscribe({
          next: () => {
            this.notify.success('Producto eliminado correctamente');
            this.loadList();
          },
          error: (err) => this.notify.error('No se pudo eliminar el producto'),
        });
      }
      return;
    }

    if (ev.action === 'stockPlus') {
      this.openStockDialog(row, 'add');
      return;
    }

    if (ev.action === 'stockMinus') {
      this.openStockDialog(row, 'reserve');
      return;
    }

    if (ev.action === 'view') {
      this.openHistory(row);
    }
  }

  newProduct() {
    this.openProductDialog(null);
  }

  private openProductDialog(product: Product | null) {
    const ref = this.dialog.open(ProductDialogComponent, {
      width: '520px',
      data: { product },
    });
    ref.afterClosed().subscribe((res) => {
      if (res?.refresh) this.loadList();
    });
  }

  private openStockDialog(product: Product, mode: 'add' | 'reserve') {
    const ref = this.dialog.open(StockDialogComponent, {
      width: '420px',
      data: { product, mode },
    });
    ref.afterClosed().subscribe((res) => {
      if (res?.refresh) this.loadList();
    });
  }

  // Historial (drawer derecho)
  openHistory(p: Product) {
    this.selectedProduct.set(p);
    this.historyQuery.set({ page: 1, size: 10 });
    this.historyItems.set([]);
    this.historyTotal.set(0);
    this.historyDrawer.open();
    this.loadHistory();
  }

  closeHistory() {
    this.historyDrawer.close();
  }

  loadHistory() {
    const p = this.selectedProduct();
    if (!p) return;
    this.historyLoading.set(true);

    const q = this.historyQuery();
    this.tx.listByProduct(p.id, q).subscribe({
      next: (res) => {
        this.historyItems.set(res.items);
        this.historyTotal.set(res.total);
        this.historyLoading.set(false);
      },
      error: () => this.historyLoading.set(false),
    });
  }

  historyPage(ev: { page: number; size: number }) {
    this.historyQuery.update((q) => ({ ...q, page: ev.page, size: ev.size }));
    this.loadHistory();
  }
}
