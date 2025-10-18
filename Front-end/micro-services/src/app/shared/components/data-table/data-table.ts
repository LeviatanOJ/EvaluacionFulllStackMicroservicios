import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

type CellTemplate = 'text' | 'price' | 'badge' | 'image' | 'actions';

export interface TableColumn<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  cellTpl?: CellTemplate;
}

type RowAction = 'view' | 'edit' | 'delete' | 'stockPlus' | 'stockMinus';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.scss'],
})
export class DataTableComponent implements AfterViewInit, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() total = 0;
  @Input() pageIndex = 1; // 1-como base
  @Input() pageSize = 10;
  @Input() loading = false;

  @Input() actionButtons: RowAction[] = ['edit', 'delete'];

  @Output() pageChange = new EventEmitter<{ page: number; size: number }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: 'asc' | 'desc' | '' }>();
  @Output() rowAction = new EventEmitter<{ action: RowAction; row: any }>();

  displayedColumns: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    if (this.sort) {
      this.sort.sortChange.subscribe((s: Sort) => {
        this.sortChange.emit({ active: s.active, direction: s.direction as 'asc' | 'desc' | '' });
        if (this.paginator) this.paginator.firstPage();
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['columns'] || changes['actionButtons']) {
      this.displayedColumns = this.columns.map((c) => c.key);

      if ((this.actionButtons?.length ?? 0) > 0 && !this.displayedColumns.includes('actions')) {
        this.displayedColumns.push('actions');
      }
    }
  }

  onPageChange(ev: PageEvent) {
    this.pageChange.emit({ page: ev.pageIndex + 1, size: ev.pageSize });
  }

  emitAction(action: RowAction, row: any) {
    this.rowAction.emit({ action, row });
  }

  asPrice(value: any): string {
    const n = Number(value ?? 0);
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  columnStyle(col: TableColumn) {
    return col.width ? { width: col.width, minWidth: col.width } : {};
  }

  private readonly PLACEHOLDER_DATA_URI =
    'data:image/svg+xml;utf8,' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">' +
    '<rect width="100%" height="100%" fill="%23e0e0e0"/>' +
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="10" fill="%23999">img</text>' +
    '</svg>';

  normalizeUrl(u?: string | null): string {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    if (/^\/\//.test(u)) return `https:${u}`;
    return `https://${u}`;
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;

    if (img.dataset['fallbackApplied'] === '1') return;

    img.dataset['fallbackApplied'] = '1';
    img.src = this.PLACEHOLDER_DATA_URI;
  }
}
