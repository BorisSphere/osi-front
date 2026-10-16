import { Component, ElementRef, computed, inject, input, output, signal } from '@angular/core';
import { User } from '../../../core/models/user';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-user-menu',
  imports: [Icon],
  templateUrl: './user-menu.html',
  host: {
    class: 'relative block',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class UserMenu {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly user = input.required<User>();
  readonly logout = output<void>();

  protected readonly open = signal(false);

  protected readonly initials = computed(() =>
    this.user()
      .name.split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(''),
  );

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected onLogout(): void {
    this.close();
    this.logout.emit();
  }

  /** Cierra el desplegable al hacer clic fuera de él. */
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
