import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stepper',
  host: { class: 'block' },
  template: `
    <p class="mb-4 text-center text-sm font-semibold text-blue-700 sm:hidden">
      Paso {{ current() + 1 }} de {{ steps().length }}: {{ steps()[current()] }}
    </p>
    <ol class="flex">
      @for (label of steps(); track label; let i = $index) {
        <li class="relative flex flex-1 flex-col items-center text-center">
          @if (i > 0) {
            <span
              class="absolute top-4 right-[calc(50%+1.25rem)] left-[calc(-50%+1.25rem)] h-0.5"
              [class.bg-blue-600]="i <= current()"
              [class.bg-slate-200]="i > current()"
              aria-hidden="true"
            ></span>
          }
          <span
            class="relative flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
            [class.bg-blue-600]="i <= current()"
            [class.text-white]="i <= current()"
            [class.bg-slate-200]="i > current()"
            [class.text-slate-600]="i > current()"
            [attr.aria-current]="i === current() ? 'step' : null"
          >
            @if (i < current()) { ✓ } @else { {{ i + 1 }} }
          </span>
          <span
            class="mt-2 hidden text-sm font-medium sm:block"
            [class.text-blue-700]="i === current()"
            [class.text-slate-500]="i !== current()"
          >{{ label }}</span>
        </li>
      }
    </ol>
  `,
})
export class Stepper {
  readonly steps = input.required<string[]>();
  readonly current = input(0);
}
