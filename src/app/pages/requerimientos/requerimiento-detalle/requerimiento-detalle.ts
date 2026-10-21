import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  ESTADO_LABEL,
  PRIORIDADES,
  PRIORIDAD_LABEL,
  PrioridadRequerimiento,
  Requerimiento,
  TIPOS_REQUERIMIENTO,
} from '../../../core/models/requerimiento';
import { EventoAuditoria } from '../../../core/models/auditoria';
import { AuditoriaService } from '../../../core/services/auditoria.service';
import { RequerimientoService } from '../../../core/services/requerimiento.service';
import { ApprovalFlow, FlowStep } from '../../../shared/components/approval-flow/approval-flow';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../shared/components/icon/icon';
import { Select, SelectOption } from '../../../shared/components/select/select';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ESTADO_TONE, PRIORIDAD_TONE, formatDate, mensajeError } from '../requerimiento-ui';
import { CanDirective } from '../../../shared/directives/can.directive';

const TABS = ['Resumen', 'Detalle técnico', 'Estimación', 'Aprobaciones', 'Historial'] as const;
type Tab = (typeof TABS)[number];

/** Posición de la etapa en curso según el estado (4 = todas completadas). */
const ETAPA_ACTUAL = {
  REGISTRADO: 1,
  ESTIMADO: 2,
  APROBADO: 4,
  RECHAZADO: 2,
} as const;
const ETAPAS = ['Registro', 'Estimación', 'Aprobación', 'Ejecución'];

const INPUT_CLASSES =
  'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none ';

const toOptions = (values: string[]): SelectOption[] => values.map((value) => ({ value, label: value }));

@Component({
  selector: 'app-requerimiento-detalle',
  imports: [DatePipe, RouterLink, CanDirective, Button, Icon, Select, StatusBadge, ApprovalFlow, EmptyState],
  templateUrl: './requerimiento-detalle.html',
})
export class RequerimientoDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RequerimientoService);
  private readonly auditoriaService = inject(AuditoriaService);

  protected readonly tabs = TABS;
  protected readonly estadoTone = ESTADO_TONE;
  protected readonly estadoLabel = ESTADO_LABEL;
  protected readonly prioridadTone = PRIORIDAD_TONE;
  protected readonly prioridadLabel = PRIORIDAD_LABEL;
  protected readonly formatDate = formatDate;
  protected readonly tipoOptions = toOptions(TIPOS_REQUERIMIENTO);
  protected readonly prioridadOptions: SelectOption[] = PRIORIDADES.map((p) => ({
    value: p,
    label: PRIORIDAD_LABEL[p],
  }));

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  protected readonly req = signal<Requerimiento | undefined>(undefined);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly eventosAuditoria = signal<EventoAuditoria[]>([]);
  protected readonly cargandoAuditoria = signal(false);
  protected readonly errorAuditoria = signal('');
  private readonly auditoriaCargada = signal(false);

  protected readonly eventosDecision = computed(() =>
    this.eventosAuditoria().filter((evento) => evento.operacion === 'APROBACION' || evento.operacion === 'RECHAZO'),
  );

  protected readonly tab = signal<Tab>('Resumen');
  protected readonly editing = signal(this.route.snapshot.queryParamMap.has('editar'));

  protected readonly titulo = signal('');
  protected readonly tipo = signal('');
  protected readonly prioridad = signal('');
  protected readonly fechaRequerida = signal('');
  protected readonly descripcion = signal('');
  protected readonly detalleTecnico = signal('');
  protected readonly triedSave = signal(false);

  protected readonly flow = computed<FlowStep[]>(() => {
    const r = this.req();
    if (!r) return [];
    const actual = ETAPA_ACTUAL[r.estado];
    return ETAPAS.map((label, i): FlowStep => ({
      label,
      state: i < actual ? 'done' : i === actual ? 'current' : 'pending',
      detail: i === 0 ? `${r.solicitante} - ${formatDate(r.fechaRegistro)}` : i === actual ? 'En proceso' : undefined,
    }));
  });

  constructor() {
    if (!Number.isInteger(this.id)) {
      this.loading.set(false);
      return;
    }
    this.service.get(this.id).subscribe({
      next: (r) => {
        this.req.set(r);
        if (this.editing()) this.loadDraft(r);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.loading.set(false);
      },
    });
  }

  protected startEdit(): void {
    const r = this.req();
    if (!r) return;
    this.loadDraft(r);
    this.triedSave.set(false);
    this.error.set('');
    this.editing.set(true);
  }

  protected seleccionarTab(tab: Tab): void {
    this.tab.set(tab);
    if ((tab === 'Aprobaciones' || tab === 'Historial') && !this.auditoriaCargada() && !this.cargandoAuditoria()) {
      this.cargarAuditoria();
    }
  }

  protected cancelEdit(): void {
    this.error.set('');
    this.editing.set(false);
  }

  protected save(): void {
    const r = this.req();
    if (!r || this.saving()) return;
    this.triedSave.set(true);
    if (!this.titulo().trim() || !this.fechaRequerida() || !this.descripcion().trim()) {
      this.tab.set('Resumen');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.service
      .update(r.id, {
        aplicacionId: r.aplicacionId,
        titulo: this.titulo().trim(),
        tipo: this.tipo(),
        prioridad: this.prioridad() as PrioridadRequerimiento,
        fechaRequerida: this.fechaRequerida(),
        descripcion: this.descripcion().trim(),
        detalleTecnico: this.detalleTecnico().trim(),
      })
      .subscribe({
        next: (actualizado) => {
          this.req.set(actualizado);
          this.saving.set(false);
          this.editing.set(false);
        },
        error: (err) => {
          this.error.set(mensajeError(err));
          this.saving.set(false);
        },
      });
  }

  /** Descarga con el Bearer (un enlace directo no lo enviaría) y dispara el guardado en el navegador. */
  protected descargar(): void {
    const r = this.req();
    if (!r?.archivoNombre) return;
    this.service.descargar(r.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = r.archivoNombre ?? 'archivo';
        a.click();
        URL.revokeObjectURL(url);
      },
      error: (err) => this.error.set(mensajeError(err)),
    });
  }

  protected reemplazarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    const r = this.req();
    if (!archivo || !r || this.saving()) return;
    this.saving.set(true);
    this.error.set('');
    this.service.adjuntar(r.id, archivo).subscribe({
      next: (actualizado) => {
        this.req.set(actualizado);
        this.saving.set(false);
        input.value = '';
      },
      error: (err) => {
        this.error.set(mensajeError(err));
        this.saving.set(false);
        input.value = '';
      },
    });
  }

  protected isInvalid(value: string): boolean {
    return this.triedSave() && !value.trim();
  }

  protected fieldClass(value: string): string {
    return (
      INPUT_CLASSES +
      (this.isInvalid(value)
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20')
    );
  }

  private loadDraft(r: Requerimiento): void {
    this.titulo.set(r.titulo);
    this.tipo.set(r.tipo);
    this.prioridad.set(r.prioridad);
    this.fechaRequerida.set(r.fechaRequerida);
    this.descripcion.set(r.descripcion);
    this.detalleTecnico.set(r.detalleTecnico);
  }

  private cargarAuditoria(): void {
    this.cargandoAuditoria.set(true);
    this.errorAuditoria.set('');
    this.auditoriaService.historial(this.id).subscribe({
      next: (eventos) => {
        this.eventosAuditoria.set(eventos);
        this.auditoriaCargada.set(true);
        this.cargandoAuditoria.set(false);
      },
      error: (err) => {
        this.errorAuditoria.set(mensajeError(err));
        this.cargandoAuditoria.set(false);
      },
    });
  }
}
