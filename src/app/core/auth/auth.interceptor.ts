import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

/** Endpoints que no llevan Bearer ni disparan un refresh al recibir 401. */
const PUBLIC_AUTH_URLS = ['/api/auth/login', '/api/auth/entra', '/api/auth/refresh', '/api/auth/logout'];

const withToken = (req: HttpRequest<unknown>, token: string | null) =>
  token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

/**
 * Agrega "Authorization: Bearer <token>" a las llamadas a /api. Si el backend responde 401
 * (token vencido), renueva el token una vez y repite la petición; si no se puede, vuelve al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/') || PUBLIC_AUTH_URLS.some((url) => req.url.startsWith(url))) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  return next(withToken(req, auth.token())).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
        return throwError(() => error);
      }
      return auth.refresh().pipe(
        catchError((refreshError: unknown) => {
          auth.endSession(router.url);
          return throwError(() => refreshError);
        }),
        switchMap((token) => next(withToken(req, token))),
      );
    }),
  );
};
