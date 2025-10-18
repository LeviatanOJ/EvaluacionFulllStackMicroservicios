import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Product } from '../../../../shared/models/product';
import { ProductsService } from '../../services/products';
import { NotificationsService } from '../../../../core/services/notifications';
import { FormFieldErrorComponent } from '../../../../shared/components/form-field-error/form-field-error';

@Component({
  selector: 'app-stock-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormFieldErrorComponent,
  ],
  templateUrl: './stock-dialog.html',
})
export class StockDialogComponent {
  title = '';
  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { product: Product; mode: 'add' | 'reserve' },
    private ref: MatDialogRef<StockDialogComponent>,
    private fb: FormBuilder,
    private products: ProductsService,
    private notify: NotificationsService,
  ) {
    this.title = this.data.mode === 'add' ? 'Añadir stock' : 'Reservar / Quitar stock';

    this.form = this.fb.nonNullable.group({
      quantity: [1, [Validators.required, Validators.min(1)]],
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const qty = this.form.value.quantity as number;

    const obs =
      this.data.mode === 'add'
        ? this.products.addStock(this.data.product.id, qty)
        : this.products.reserveStock(this.data.product.id, qty);

    obs.subscribe({
      next: () => {
        this.notify.success('Stock actualizado');
        this.ref.close({ refresh: true });
      },
      error: () => {},
    });
  }

  close() {
    this.ref.close();
  }
}
