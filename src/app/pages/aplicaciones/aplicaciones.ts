import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { ApiError } from '../../core/auth/auth.models';
import { AuthService } from '../../core/auth/auth.service';
import { Aplicacion } from '../../core/models/aplicacion';
import { AplicacionService } from '../../core/services/aplicacion.service';
import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { IconButton } from '../../shared/components/icon-button/icon-button';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Pagination } from '../../shared/components/pagination/pagination';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { Select, SelectOption } from '../../shared/components/select/select';
import { BadgeTone, StatusBadge } from '../../shared/components/status-badge/status-badge';
import { AplicacionDialog, ModoDialogo } from './aplicacion-dialog/aplicacion-dialog';

@Component({
  selector: 'app-aplicaciones',
  imports: [PageHeader, Button, Icon, IconButton, SearchInput, Select, StatusBadge, Pagination, AplicacionDialog],
  templateUrl: './aplicaciones.html',
})
export class Aplicaciones {
  private readonly service = inject(AplicacionService);

  /** Crear, editar y eliminar solo para COORDINADOR (el backend también lo valida). */
  protected readonly puedeEditar = inject(AuthService).hasRole(['COORDINADOR']);

  protected readonly pageSize = 5;
  protected readonly estadoOptions: SelectOption[] = [
    { value: '', label: 'Todas' },
    { value: 'Activa', label: 'Activas' },
    { value: 'Inactiva', label: 'Inactivas' },
  ];

  private readonly aplicaciones = signal<Aplicacion[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly dialogo = signal<{ modo: ModoDialogo; aplicacion: Aplicacion | null } | null>(null);

  protected readonly search = signal('');
  protected readonly estado = signal('');
  // Vuelve a la página 1 cada vez que cambian los filtros.
  protected readonly page = linkedSignal(() => {
    this.search();
    this.estado();
    return 1;
  });

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const estado = this.estado();
    return this.aplicaciones().filter(
      (app) =>
        (!estado || this.estadoLabel(app) === estado) &&
        (!term || app.nombre.toLowerCase().includes(term) || !!app.descripcion?.toLowerCase().includes(term)),
    );
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  constructor() {
    this.cargar();
  }

  protected estadoLabel(app: Aplicacion): string {
    return app.activo ? 'Activa' : 'Inactiva';
  }

  protected tone(app: Aplicacion): BadgeTone {
    return app.activo ? 'success' : 'neutral';
  }

  protected abrir(modo: ModoDialogo, aplicacion: Aplicacion | null = null): void {
    this.dialogo.set({ modo, aplicacion });
  }

  protected guardada(): void {
    this.cargar();
  }

  protected eliminar(app: Aplicacion): void {
    if (!confirm(`¿Eliminar la aplicación ${app.codigo} - ${app.nombre}?`)) return;

    this.error.set(null);
    this.service.remove(app.id).subscribe({
      next: () => {
        this.aplicaciones.update((list) => list.filter((a) => a.id !== app.id));
        // Evita quedarse en una página que ya no existe.
        const lastPage = Math.max(1, Math.ceil(this.filtered().length / this.pageSize));
        if (this.page() > lastPage) this.page.set(lastPage);
      },
      error: (err: unknown) => this.error.set(this.errorMessage(err, 'No se pudo eliminar la aplicación.')),
    });
  }

  private cargar(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (apps) => {
        this.aplicaciones.set(apps);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(this.errorMessage(err, 'No se pudieron cargar las aplicaciones.'));
      },
    });
  }

  private errorMessage(err: unknown, porDefecto: string): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) return 'No se pudo conectar con el servidor. Intente nuevamente.';
      const body = err.error as ApiError | null;
      if (body?.message) return body.message;
    }
    return porDefecto;
  }
}
