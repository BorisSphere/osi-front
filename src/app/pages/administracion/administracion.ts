import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { EventoAuditoria, OperacionAuditoria } from '../../core/models/auditoria';
import { AuditoriaService } from '../../core/services/auditoria.service';
import { mensajeDeError } from '../../core/utils/api-error';
import { Button } from '../../shared/components/button/button';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Pagination } from '../../shared/components/pagination/pagination';
import { Select, SelectOption } from '../../shared/components/select/select';
import { BadgeTone, StatusBadge } from '../../shared/components/status-badge/status-badge';

const OPERACION: Record<OperacionAuditoria, { label: string; tone: BadgeTone }> = {
  REGISTRO: { label: 'Registro', tone: 'info' },
  ACTUALIZACION: { label: 'Actualización', tone: 'warning' },
  ESTIMACION: { label: 'Estimación', tone: 'success' },
  APROBACION: { label: 'Aprobación', tone: 'success' },
  RECHAZO: { label: 'Rechazo', tone: 'danger' },
};

/** Auditoría e historial de operaciones (RF07). */
@Component({
  selector: 'app-administracion',
  imports: [DatePipe, PageHeader, Button, Select, StatusBadge, Pagination],
  templateUrl: './administracion.html',
})
export class Administracion {
  private readonly service = inject(AuditoriaService);

  protected readonly pageSize = 10;

  // Filtros del formulario; se aplican al presionar "Consultar".
  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  protected readonly usuario = signal('');
  protected readonly error = signal('');
  protected readonly cargando = signal(false);

  /** Usuarios conocidos para el filtro; se completan con los que aparecen en las consultas. */
  private readonly usuariosConocidos = signal<string[]>([]);
  protected readonly usuarioOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Todos' },
    ...this.usuariosConocidos().map((u) => ({ value: u, label: u })),
  ]);
  protected readonly eventos = signal<EventoAuditoria[]>([]);
  protected readonly page = signal(1);

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.eventos().slice(start, start + this.pageSize);
  });

  constructor() {
    this.consultar();
  }

  protected consultar(): void {
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) {
      this.error.set('La fecha "Desde" no puede ser posterior a "Hasta".');
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.service.list({ desde: this.desde(), hasta: this.hasta(), usuario: this.usuario() }).subscribe({
      next: (eventos) => {
        this.eventos.set(eventos);
        this.usuariosConocidos.update((actuales) => [...new Set([...actuales, ...eventos.map((e) => e.usuario)])].sort());
        this.page.set(1);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeDeError(err, 'No se pudo consultar el historial.'));
        this.cargando.set(false);
      },
    });
  }

  protected operacion(e: EventoAuditoria) {
    return OPERACION[e.operacion] ?? { label: e.operacion, tone: 'neutral' as BadgeTone };
  }
}
