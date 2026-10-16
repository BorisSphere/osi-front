import { Component, booleanAttribute, computed, input } from '@angular/core';
import { APP_NAME } from '../../../core/config/app-info';

@Component({
  selector: 'app-logo',
  host: { class: 'inline-flex items-center' },
  template: `
    <span class="flex items-center" [class]="size() === 'lg' ? 'gap-4' : 'gap-2'">
      <svg [class]="iconClass()" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M19.14 12.94c.04-.31.06-.62.06-.94s-.02-.63-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.71 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.05.31-.08.64-.08.94s.02.63.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.48.48 0 0 0-.12-.61l-2.01-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z"
        />
      </svg>
      <span [class]="textClass()">{{ appName }}</span>
    </span>
  `,
})
export class Logo {
  /** `sm` para barras de navegación, `lg` para portadas como el login. */
  readonly size = input<'sm' | 'lg'>('sm');
  /** `light` para fondos oscuros, `dark` para fondos claros. */
  readonly theme = input<'light' | 'dark'>('light');
  /** Oculta el nombre en pantallas pequeñas y deja solo el ícono. */
  readonly hideTextOnMobile = input(false, { transform: booleanAttribute });

  protected readonly appName = APP_NAME;

  protected readonly iconClass = computed(() =>
    [
      'shrink-0',
      this.size() === 'lg' ? 'h-16 w-16' : 'h-8 w-8',
      this.theme() === 'dark' ? 'text-blue-700' : 'text-white',
    ].join(' '),
  );

  protected readonly textClass = computed(() =>
    [
      'whitespace-nowrap',
      this.size() === 'lg' ? 'text-3xl font-bold' : 'text-lg font-semibold',
      this.theme() === 'dark' ? 'text-blue-900' : 'text-white',
      this.hideTextOnMobile() ? 'hidden sm:inline' : '',
    ].join(' '),
  );
}
