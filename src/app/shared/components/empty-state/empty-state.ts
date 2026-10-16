import { Component, input } from '@angular/core';
import { Icon, IconName } from '../icon/icon';

@Component({
  selector: 'app-empty-state',
  imports: [Icon],
  host: { class: 'block' },
  template: `
    <div class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
      <app-icon [name]="icon()" class="h-10 w-10 text-slate-400" />
      <p>{{ message() }}</p>
    </div>
  `,
})
export class EmptyState {
  readonly message = input.required<string>();
  readonly icon = input<IconName>('document');
}
