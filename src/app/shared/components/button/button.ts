import { Component, computed, input } from '@angular/core';

const VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600/40',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-400/40',
} as const;

/** Botón de texto. Uso: `<button app-button variant="primary">...</button>`. */
@Component({
  selector: 'button[app-button], a[app-button]',
  host: { '[class]': 'classes()' },
  template: `<ng-content />`,
})
export class Button {
  readonly variant = input<keyof typeof VARIANTS>('primary');

  protected readonly classes = computed(
    () =>
      'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ' +
      VARIANTS[this.variant()],
  );
}
