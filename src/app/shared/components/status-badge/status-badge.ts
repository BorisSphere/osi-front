import { Component, computed, input } from '@angular/core';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-slate-200 text-slate-600',
};

/** Etiqueta de estado. Uso: `<app-status-badge label="Activa" tone="success" />`. */
@Component({
  selector: 'app-status-badge',
  template: `<span [class]="classes()">{{ label() }}</span>`,
})
export class StatusBadge {
  readonly label = input.required<string>();
  readonly tone = input<BadgeTone>('neutral');

  protected readonly classes = computed(
    () => 'inline-flex rounded-md px-2.5 py-1 text-xs font-semibold whitespace-nowrap ' + TONES[this.tone()],
  );
}
