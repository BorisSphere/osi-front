import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Rol } from '../models/user';
import { AuthService } from './auth.service';

/** Exige sesión iniciada; si no, va al login recordando la ruta pedida. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated() || router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Exige uno de los roles de `data.roles`. Solo mejora la experiencia: el backend es quien protege. */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data['roles'] as Rol[] | undefined;
  return auth.hasRole(roles) || router.createUrlTree(['/dashboard']);
};

/** Evita ver el login con la sesión ya iniciada. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return !auth.isAuthenticated() || router.createUrlTree(['/dashboard']);
};
