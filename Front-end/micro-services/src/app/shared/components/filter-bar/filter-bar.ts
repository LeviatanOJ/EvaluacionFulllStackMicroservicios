import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export type FilterType = 'text' | 'select' | 'number' | 'date' | 'number-range' | 'date-range';

export interface FilterOption {
  value: any;
  label: string;
}

export interface RangeKeys {
  min: string; // ej. 'priceMin' o 'from'
  max: string; // ej. 'priceMax' o 'to'
}

export interface FilterField {
  key?: string; // para text/number/date/select
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[]; // para 'select'
  min?: number; // para number
  max?: number; // para number
  /** Para rangos usa 'rangeKeys'. Ej: {min:'priceMin', max:'priceMax'} o {min:'from', max:'to'} */
  rangeKeys?: RangeKeys; // para number-range / date-range
}

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './filter-bar.html',
  styleUrls: ['./filter-bar.scss'],
})
export class FilterBarComponent implements OnChanges {
  @Input() fields: FilterField[] = [];
  @Input() model: Record<string, any> = {};
  @Input() compact = false;

  @Output() apply = new EventEmitter<Record<string, any>>();
  @Output() reset = new EventEmitter<void>();

  form!: FormGroup;
  changed = false;

  private fb = new FormBuilder();

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form || changes['fields'] || changes['model']) {
      this.buildForm();
    }
  }

  private buildForm() {
    const group: Record<string, any> = {};

    for (const f of this.fields) {
      if (f.type === 'number-range' || f.type === 'date-range') {
        if (!f.rangeKeys) {
          console.warn('FilterField con tipo rango requiere rangeKeys:', f);
          continue;
        }
        const kmin = f.rangeKeys.min;
        const kmax = f.rangeKeys.max;
        group[kmin] = [this.model?.[kmin] ?? null];
        group[kmax] = [this.model?.[kmax] ?? null];
      } else {
        if (!f.key) continue;
        group[f.key] = [this.model?.[f.key] ?? null];
      }
    }

    this.form = this.fb.group(group);
    this.changed = false;

    this.form.valueChanges.subscribe(() => (this.changed = true));
  }

  onApply() {
    const raw = this.form.getRawValue();
    // Limpia null/undefined/''
    const clean: Record<string, any> = {};
    Object.keys(raw).forEach((k) => {
      const v = raw[k];
      if (v === null || v === undefined || v === '') return;

      // Para fechas, convierte a ISO (sin ms)
      if (this.isDate(v)) {
        const d = v as Date;
        clean[k] = new Date(
          Date.UTC(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
            d.getSeconds(),
          ),
        ).toISOString();
      } else {
        clean[k] = v;
      }
    });

    this.apply.emit(clean);
    this.changed = false;
  }

  onReset() {
    this.form.reset();
    this.reset.emit();
    this.changed = false;
  }

  isDate(v: any) {
    return v instanceof Date && !isNaN(v.getTime());
  }
}
