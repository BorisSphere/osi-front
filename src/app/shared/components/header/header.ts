import { Component, input, output } from '@angular/core';
import { User } from '../../../core/models/user';
import { Icon } from '../icon/icon';
import { Logo } from '../logo/logo';
import { UserMenu } from '../user-menu/user-menu';

@Component({
  selector: 'app-header',
  imports: [Icon, Logo, UserMenu],
  templateUrl: './header.html',
})
export class Header {
  readonly user = input.required<User>();
  readonly menuToggle = output<void>();
  readonly logout = output<void>();
}
