import { Component, computed, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

const TONES = {
  neutral: 'text-slate-700 hover:bg-slate-200',
  danger: 'text-red-600 hover:bg-red-50',
} as const;

/**
 * Botón cuadrado con solo un ícono. Siempre agregar `aria-label`.
 * Uso: `<button app-icon-button icon="pencil" aria-label="Editar"></button>`.
 */
@Component({
  selector: 'button[app-icon-button]',
  imports: [Icon],
  host: { type: 'button', '[class]': 'classes()' },
  template: `<app-icon [name]="icon()" class="h-4 w-4" [strokeWidth]="2" />`,
})
export class IconButton {
  readonly icon = input.required<IconName>();
  readonly tone = input<keyof typeof TONES>('neutral');

  protected readonly classes = computed(
    () =>
      'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 transition-colors focus:ring-2 focus:ring-blue-600/30 focus:outline-none ' +
      TONES[this.tone()],
  );
}
