import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NotificationsService } from '../../services/notifications';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationsService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let msg = 'Ha ocurrido un error. Inténtalo de nuevo.';
      if (err.status === 0) msg = 'No hay conexión con el servidor.';
      else if (err.status === 400) msg = extraerMensaje(err) ?? 'Solicitud inválida.';
      else if (err.status === 404) msg = 'Recurso no encontrado.';
      else if (err.status === 409) msg = 'Conflicto con el estado actual.';
      else if (err.status >= 500) msg = 'Error interno del servidor.';

      notify.error(msg);
      return throwError(() => err);
    }),
  );
};

function extraerMensaje(err: HttpErrorResponse): string | null {
  const b = err.error;
  if (!b) return null;
  // Intenta sacar un mensaje legible si tu API devuelve {message} o {errors}
  if (typeof b === 'string') return b;
  if (b.message) return b.message;
  if (b.title) return b.title;
  return null;
}
