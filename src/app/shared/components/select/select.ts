import { Component, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

export interface SelectOption {
  value: string;
  label: string;
}

/** Lista desplegable. Uso: `<app-select [options]="opciones" [(value)]="filtro" />`. */
@Component({
  selector: 'app-select',
  imports: [Icon],
  host: { class: 'relative block' },
  template: `
    <select
      [value]="value()"
      (change)="value.set($any($event.target).value)"
      [attr.aria-label]="label()"
      class="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pr-10 pl-4 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
    >
      @for (option of options(); track option.value) {
        <option [value]="option.value" [selected]="option.value === value()">{{ option.label }}</option>
      }
    </select>
    <app-icon name="chevron-down" class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-500" [strokeWidth]="2" />
  `,
})
export class Select {
  readonly options = input.required<SelectOption[]>();
  readonly value = model('');
  readonly label = input('');
}
