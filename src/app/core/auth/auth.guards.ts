import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Permiso } from '../models/user';
import { AuthService } from './auth.service';

/** Exige sesión iniciada; si no, va al login recordando la ruta pedida. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() || router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Exige el permiso de `data.permiso`. Solo mejora la experiencia: el backend es quien protege. */
export const permisoGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const permiso = route.data['permiso'] as Permiso | Permiso[] | undefined;
  return auth.can(permiso) || router.createUrlTree(['/dashboard']);
};

/** Evita ver el login con la sesión ya iniciada. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return !auth.isAuthenticated() || router.createUrlTree(['/dashboard']);
};
