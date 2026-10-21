import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { MAIN_MENU } from '../../core/config/menu.config';
import { Header } from '../../shared/components/header/header';
import { Sidebar } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './main-layout.html',
})
export class MainLayout {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.displayUser;
  /** Solo las opciones que permiten los permisos del usuario. */
  protected readonly menu = computed(() => MAIN_MENU.filter((item) => this.auth.can(item.permiso)));

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

  protected logout(): void {
    this.auth.logout();
  }
}
