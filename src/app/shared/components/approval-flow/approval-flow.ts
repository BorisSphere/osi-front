import { Component, input } from '@angular/core';

export type FlowStepState = 'done' | 'current' | 'pending';

export interface FlowStep {
  label: string;
  state: FlowStepState;
  /** Texto secundario, p. ej. responsable y fecha. */
  detail?: string;
}

/**
 * Cuadro vertical con las etapas de un flujo.
 * Uso: `<app-approval-flow [steps]="etapas" />`.
 */
@Component({
  selector: 'app-approval-flow',
  host: { class: 'block rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5' },
  template: `
    <h2 class="text-sm font-semibold text-slate-900">{{ title() }}</h2>
    <ol class="mt-4">
      @for (step of steps(); track step.label; let last = $last) {
        <li class="relative flex gap-3 pb-6" [class.pb-0]="last">
          @if (!last) {
            <span
              class="absolute top-8 bottom-1 left-4 w-0.5 -translate-x-1/2"
              [class.bg-green-500]="step.state === 'done'"
              [class.bg-slate-200]="step.state !== 'done'"
              aria-hidden="true"
            ></span>
          }
          <span
            class="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white"
            [class.bg-green-500]="step.state === 'done'"
            [class.bg-blue-600]="step.state === 'current'"
            [class.bg-slate-200]="step.state === 'pending'"
          >
            @switch (step.state) {
              @case ('done') { <span class="text-sm font-bold">✓</span> }
              @case ('current') { <span class="h-2.5 w-2.5 rounded-full bg-white"></span> }
              @default { <span class="h-2.5 w-2.5 rounded-full bg-slate-400"></span> }
            }
          </span>
          <div class="min-w-0 pt-1">
            <p
              class="text-sm font-semibold"
              [class.text-green-600]="step.state === 'done'"
              [class.text-blue-700]="step.state === 'current'"
              [class.text-slate-500]="step.state === 'pending'"
            >{{ step.label }}</p>
            @if (step.detail) {
              <p class="mt-0.5 text-xs break-words text-slate-500">{{ step.detail }}</p>
            }
          </div>
        </li>
      }
    </ol>
  `,
})
export class ApprovalFlow {
  readonly steps = input.required<FlowStep[]>();
  readonly title = input('Flujo de aprobación');
}
