import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from '../../../core/models/menu-item';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, Icon],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly items = input.required<MenuItem[]>();
  /** Visible como panel superpuesto en móvil. */
  readonly mobileOpen = input(false);
  /** Oculto en escritorio. */
  readonly collapsed = input(false);

  readonly itemSelected = output<MenuItem>();
}
