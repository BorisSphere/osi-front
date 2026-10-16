import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MAIN_MENU } from '../../core/config/menu.config';
import { User } from '../../core/models/user';
import { Header } from '../../shared/components/header/header';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  protected readonly menu = MAIN_MENU;

  // Usuario de ejemplo hasta que exista la autenticación.
  protected readonly user: User = { name: 'Pochita', role: 'Analista' };

  protected readonly mobileMenuOpen = signal(false);
  protected readonly sidebarCollapsed = signal(false);

  /** En móvil abre/cierra el menú superpuesto; en escritorio colapsa la barra lateral. */
  protected toggleSidebar(): void {
    if (window.matchMedia('(min-width: 1024px)').matches) {
      this.sidebarCollapsed.update((value) => !value);
    } else {
      this.mobileMenuOpen.update((value) => !value);
    }
  }

  protected closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
