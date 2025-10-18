import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private sb = inject(MatSnackBar);

  private open(msg: string, type: 'success' | 'error' | 'info' = 'info') {
    const classes = ['app-snackbar', type];
    this.sb.open(msg, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: classes,
    });
  }

  success(msg: string) {
    this.open(msg, 'success');
  }
  error(msg: string) {
    this.open(msg, 'error');
  }
  info(msg: string) {
    this.open(msg, 'info');
  }
}
