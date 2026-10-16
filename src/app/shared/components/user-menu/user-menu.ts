import { Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { User } from '../../../core/models/user';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-user-menu',
  imports: [RouterLink, Icon],
  templateUrl: './user-menu.html',
  host: {
    class: 'relative block',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class UserMenu {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly user = input.required<User>();

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

  /** Cierra el desplegable al hacer clic fuera de él. */
  protected onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
