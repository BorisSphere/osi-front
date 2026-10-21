import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, finalize, firstValueFrom, map, of, shareReplay, tap, throwError } from 'rxjs';
import { Permiso, ROL_LABEL, User, UsuarioAuth } from '../models/user';
import { LoginResponse } from './auth.models';

/**
 * Sesión del usuario.
 * - El access token (JWT, 15 min) vive solo en memoria: nunca en localStorage.
 * - El refresh token lo maneja el navegador como cookie HttpOnly; este servicio no puede leerlo.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly accessToken = signal<string | null>(null);
  private refreshInFlight$: Observable<string> | null = null;

  readonly usuario = signal<UsuarioAuth | null>(null);
  readonly isAuthenticated = computed(() => this.usuario() !== null);
  readonly displayUser = computed<User | null>(() => {
    const usuario = this.usuario();
    return usuario ? { name: usuario.username, role: ROL_LABEL[usuario.rol] } : null;
  });

  token(): string | null {
    return this.accessToken();
  }

  login(username: string, password: string): Observable<void> {
    return this.http
      .post<LoginResponse>('/api/auth/login', { username, password })
      .pipe(
        tap((response) => this.setSession(response)),
        map(() => undefined),
      );
  }

  /**
   * Pide un access token nuevo usando la cookie. Si varias peticiones lo necesitan a la vez,
   * comparten una sola llamada (evita rotar el refresh token dos veces).
   */
  refresh(): Observable<string> {
    this.refreshInFlight$ ??= this.http.post<LoginResponse>('/api/auth/refresh', null).pipe(
      tap((response) => this.setSession(response)),
      map((response) => response.token),
      catchError((error) => {
        this.clearSession();
        return throwError(() => error);
      }),
      finalize(() => (this.refreshInFlight$ = null)),
      shareReplay(1),
    );
    return this.refreshInFlight$;
  }

  /** Al iniciar la app: recupera la sesión si el navegador tiene la cookie. Nunca falla. */
  restoreSession(): Promise<void> {
    return firstValueFrom(
      this.refresh().pipe(
        map(() => undefined),
        catchError(() => of(undefined)),
      ),
    );
  }

  logout(): void {
    this.http
      .post('/api/auth/logout', null)
      .pipe(catchError(() => of(null)))
      .subscribe();
    this.endSession();
  }

  /** Cierra la sesión local y vuelve al login (p. ej. cuando el refresh falla). */
  endSession(returnUrl?: string): void {
    this.clearSession();
    this.router.navigate(['/login'], returnUrl ? { queryParams: { returnUrl } } : undefined);
  }

  private readonly permisos = computed(() => new Set(this.usuario()?.permisos ?? []));

  /**
   * ¿El usuario tiene el permiso? Con una lista, basta con uno de ellos; sin permisos, solo exige sesión.
   * Solo adapta la interfaz: quien protege de verdad es el backend.
   */
  can(permiso: Permiso | readonly Permiso[] | undefined): boolean {
    if (!this.isAuthenticated()) {
      return false;
    }
    const requeridos = permiso === undefined ? [] : typeof permiso === 'string' ? [permiso] : permiso;
    return !requeridos.length || requeridos.some((p) => this.permisos().has(p));
  }

  private setSession(response: LoginResponse): void {
    this.accessToken.set(response.token);
    this.usuario.set(response.usuario);
  }

  private clearSession(): void {
    this.accessToken.set(null);
    this.usuario.set(null);
  }
}
