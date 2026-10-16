import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Icon } from '../../shared/components/icon/icon';
import { Logo } from '../../shared/components/logo/logo';

@Component({
  selector: 'app-login',
  imports: [Logo, Icon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);

  protected togglePassword(): void {
    this.showPassword.update((value) => !value);
  }

  // Sin autenticación todavía: solo navega al dashboard.
  protected login(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/dashboard']);
  }
}
