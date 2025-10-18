import { HttpParams } from '@angular/common/http';

//Convierte un objeto en HttpParams limpio sin datos nullos

export function buildHttpParams(obj: Record<string, any>): HttpParams {
  let params = new HttpParams();

  Object.entries(obj).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;

    // Si es array -> agregar múltiples params
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== null && v !== undefined && v !== '') params = params.append(key, String(v));
      });
    } else {
      params = params.set(key, String(value));
    }
  });

  return params;
}
