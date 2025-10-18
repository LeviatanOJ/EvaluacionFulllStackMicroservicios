import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import {
  TransactionsService,
  CreateTransactionRequest,
  TransactionType,
} from '../../services/transactions';
import { NotificationsService } from '../../../../core/services/notifications';
import { FormFieldErrorComponent } from '../../../../shared/components/form-field-error/form-field-error';

@Component({
  selector: 'app-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    FormFieldErrorComponent,
  ],
  templateUrl: './transaction-dialog.html',
})
export class TransactionDialogComponent {
  form!: FormGroup;
  total = 0;

  constructor(
    private ref: MatDialogRef<TransactionDialogComponent>,
    private fb: FormBuilder,
    private tx: TransactionsService,
    private notify: NotificationsService,
  ) {
    this.form = this.fb.nonNullable.group({
      type: [1 as TransactionType, [Validators.required]],
      productId: [0, [Validators.required, Validators.min(1)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      detail: [''],
    });

    this.form.valueChanges.subscribe((v) => {
      const q = Number(v.quantity ?? 0);
      const u = Number(v.unitPrice ?? 0);
      this.total = q * u;
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Gracias a nonNullable, dto no tiene nulls
    const dto = this.form.getRawValue() as CreateTransactionRequest;

    this.tx.create(dto).subscribe({
      next: () => {
        this.notify.success('Transacción creada');
        this.ref.close({ refresh: true });
      },
      error: () => {},
    });
  }

  close() {
    this.ref.close();
  }
}
