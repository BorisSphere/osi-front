import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  PRIORIDADES,
  PrioridadRequerimiento,
  Requerimiento,
  TIPOS_REQUERIMIENTO,
} from '../../../core/models/requerimiento';
import { RequerimientoService } from '../../../core/services/requerimiento.service';
import { ApprovalFlow, FlowStep } from '../../../shared/components/approval-flow/approval-flow';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Icon } from '../../../shared/components/icon/icon';
import { Select, SelectOption } from '../../../shared/components/select/select';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';
import { ESTADO_TONE, PRIORIDAD_TONE, formatDate } from '../requerimiento-ui';

const TABS = ['Resumen', 'Detalle técnico', 'Estimación', 'Aprobaciones', 'Historial'] as const;
type Tab = (typeof TABS)[number];

/** Posición de la etapa en curso según el estado (4 = todas completadas). */
const ETAPA_ACTUAL = {
  Registrado: 1,
  'En estimación': 1,
  'En aprobación': 2,
  'En ejecución': 3,
  Finalizado: 4,
} as const;
const ETAPAS = ['Registro', 'Estimación', 'Aprobación', 'Ejecución'];

const INPUT_CLASSES =
  'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none ';

const toOptions = (values: string[]): SelectOption[] => values.map((value) => ({ value, label: value }));

@Component({
  selector: 'app-requerimiento-detalle',
  imports: [RouterLink, Button, Icon, Select, StatusBadge, ApprovalFlow, EmptyState],
  templateUrl: './requerimiento-detalle.html',
})
export class RequerimientoDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(RequerimientoService);

  protected readonly tabs = TABS;
  protected readonly estadoTone = ESTADO_TONE;
  protected readonly prioridadTone = PRIORIDAD_TONE;
  protected readonly formatDate = formatDate;
  protected readonly tipoOptions = toOptions(TIPOS_REQUERIMIENTO);
  protected readonly prioridadOptions = toOptions(PRIORIDADES);

  private readonly codigo = this.route.snapshot.paramMap.get('codigo') ?? '';

  /** Se vuelve a leer del servicio para reflejar los cambios guardados. */
  protected readonly req = computed(() => this.service.items().find((r) => r.codigo === this.codigo));

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
    const r = this.req();
    if (r && this.editing()) this.loadDraft(r);
  }

  protected startEdit(): void {
    const r = this.req();
    if (!r) return;
    this.loadDraft(r);
    this.triedSave.set(false);
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected save(): void {
    this.triedSave.set(true);
    if (!this.titulo().trim() || !this.fechaRequerida() || !this.descripcion().trim()) {
      this.tab.set('Resumen');
      return;
    }
    this.service.update(this.codigo, {
      titulo: this.titulo().trim(),
      tipo: this.tipo(),
      prioridad: this.prioridad() as PrioridadRequerimiento,
      fechaRequerida: this.fechaRequerida(),
      descripcion: this.descripcion().trim(),
      detalleTecnico: this.detalleTecnico().trim(),
    });
    this.editing.set(false);
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
}
