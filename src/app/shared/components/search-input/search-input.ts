import { Component, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

/** Caja de búsqueda. Uso: `<app-search-input [(value)]="texto" placeholder="Buscar..." />`. */
@Component({
  selector: 'app-search-input',
  imports: [Icon],
  host: { class: 'relative block' },
  template: `
    <app-icon name="search" class="pointer-events-none absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-slate-400" />
    <input
      type="search"
      [value]="value()"
      (input)="value.set($any($event.target).value)"
      [placeholder]="placeholder()"
      [attr.aria-label]="placeholder()"
      class="w-full rounded-lg border border-slate-300 bg-white py-2.5 pr-4 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none"
    />
  `,
})
export class SearchInput {
  readonly value = model('');
  readonly placeholder = input('Buscar...');
}
