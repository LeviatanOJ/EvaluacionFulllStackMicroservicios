import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Product } from '../../../../shared/models/product';
import { ProductsService } from '../../services/products';
import { NotificationsService } from '../../../../core/services/notifications';
import { FormFieldErrorComponent } from '../../../../shared/components/form-field-error/form-field-error';

@Component({
  selector: 'app-product-dialog',
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
  templateUrl: './product-dialog.html',
})
export class ProductDialogComponent {
  isEdit = false;
  form!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { product: Product | null },
    private ref: MatDialogRef<ProductDialogComponent>,
    private fb: FormBuilder,
    private products: ProductsService,
    private notify: NotificationsService,
  ) {
    this.isEdit = !!this.data?.product;

    this.form = this.fb.nonNullable.group({
      name: [this.data.product?.name ?? '', [Validators.required, Validators.maxLength(120)]],
      description: [this.data.product?.description ?? '', [Validators.maxLength(500)]],
      category: [
        this.data.product?.category ?? '',
        [Validators.required, Validators.maxLength(80)],
      ],
      imageUrl: [this.data.product?.imageUrl ?? ''],
      price: [this.data.product?.price ?? 0, [Validators.required, Validators.min(0)]],
      stock: [this.data.product?.stock ?? 0, [Validators.required, Validators.min(0)]],
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.form.getRawValue();

    if (this.isEdit && this.data.product) {
      // UPDATE
      this.products.update(this.data.product.id, dto).subscribe({
        next: () => {
          this.notify.success('Producto actualizado');
          this.ref.close({ refresh: true });
        },
        error: (err) => {
          console.error(err);
          this.notify.error('Error al actualizar el producto');
        },
      });
    } else {
      // CREATE
      const one: Product = { id: 0, ...dto } as any;
      this.products.createBulk([one]).subscribe({
        next: () => {
          this.notify.success('Producto creado');
          this.ref.close({ refresh: true });
        },
        error: (err) => {
          console.error(err);
          this.notify.error('Error al crear el producto');
        },
      });
    }
  }

  close() {
    this.ref.close();
  }
}
