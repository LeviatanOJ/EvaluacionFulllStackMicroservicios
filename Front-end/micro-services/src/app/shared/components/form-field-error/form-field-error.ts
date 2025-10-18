import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-field-error.html',
  styleUrls: ['./form-field-error.scss'],
})
export class FormFieldErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() labels: Record<string, string> = {}; // opcional: { price: 'Precio' }
  @Input() map: Record<string, string | ((e: any) => string)> = {};

  get message(): string | null {
    const c = this.control;
    if (!c || !c.touched) return null;
    const errors = c.errors;
    if (!errors) return null;

    const order = ['required', 'email', 'minlength', 'maxlength', 'min', 'max', 'pattern', 'url'];
    for (const key of order) {
      if (errors[key]) {
        return this.resolveMessage(key, errors[key]);
      }
    }
    // Primer error si no está en orden
    const firstKey = Object.keys(errors)[0];
    return this.resolveMessage(firstKey, errors[firstKey]);
  }

  private resolveMessage(key: string, errVal: any): string {
    // mensajes custom
    const custom = this.map[key];
    if (custom) {
      return typeof custom === 'function' ? custom(errVal) : custom;
    }

    switch (key) {
      case 'required':
        return 'Este campo es obligatorio.';
      case 'email':
        return 'Ingresa un correo válido.';
      case 'minlength':
        return `Mínimo ${errVal.requiredLength} caracteres.`;
      case 'maxlength':
        return `Máximo ${errVal.requiredLength} caracteres.`;
      case 'min':
        return `Debe ser mayor o igual a ${errVal.min}.`;
      case 'max':
        return `Debe ser menor o igual a ${errVal.max}.`;
      case 'pattern':
        return 'Formato inválido.';
      case 'url':
        return 'Ingresa una URL válida.';
      default:
        return 'Valor inválido.';
    }
  }
}
