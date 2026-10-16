import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Decision, EstadoRequerimiento, Prioridad, RequerimientoResumen } from '../../core/models/estimacion';
import { AprobacionService } from '../../core/services/aprobacion.service';
import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Pagination } from '../../shared/components/pagination/pagination';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { Select, SelectOption } from '../../shared/components/select/select';
import { BadgeTone, StatusBadge } from '../../shared/components/status-badge/status-badge';

type Pestana = Exclude<EstadoRequerimiento, 'REGISTRADO'>;

const PRIORIDAD: Record<Prioridad, { label: string; tone: BadgeTone }> = {
  ALTA: { label: 'Alta', tone: 'danger' },
  MEDIA: { label: 'Media', tone: 'warning' },
  BAJA: { label: 'Baja', tone: 'success' },
};

/** Requerimiento sobre el que se está decidiendo (abre el diálogo de confirmación). */
interface DecisionEnCurso {
  req: RequerimientoResumen;
  decision: Decision['decision'];
}

@Component({
  selector: 'app-aprobaciones',
  imports: [NgTemplateOutlet, PageHeader, Button, Icon, SearchInput, Select, StatusBadge, Pagination],
  templateUrl: './aprobaciones.html',
})
export class Aprobaciones {
  private readonly service = inject(AprobacionService);
  private readonly auth = inject(AuthService);

  /** Solo el APROBADOR decide; el resto solo consulta. */
  protected readonly puedeDecidir = computed(() => this.auth.hasRole(['APROBADOR']));

  protected readonly pageSize = 5;
  protected readonly pestanas: { value: Pestana; label: string }[] = [
    { value: 'ESTIMADO', label: 'Pendientes' },
    { value: 'APROBADO', label: 'Aprobados' },
    { value: 'RECHAZADO', label: 'Rechazados' },
  ];

  protected readonly requerimientos = signal<RequerimientoResumen[]>([]);
  protected readonly pestana = signal<Pestana>('ESTIMADO');
  protected readonly search = signal('');
  protected readonly aplicacion = signal('');
  // Vuelve a la página 1 cada vez que cambian la pestaña o los filtros.
  protected readonly page = linkedSignal(() => {
    this.pestana();
    this.search();
    this.aplicacion();
    return 1;
  });

  protected readonly conteo = computed(() => {
    const conteo: Record<Pestana, number> = { ESTIMADO: 0, APROBADO: 0, RECHAZADO: 0 };
    for (const r of this.requerimientos()) {
      if (r.estado !== 'REGISTRADO') conteo[r.estado]++;
    }
    return conteo;
  });

  protected readonly aplicacionOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Todas las aplicaciones' },
    ...[...new Set(this.requerimientos().map((r) => r.aplicacion))].sort().map((a) => ({ value: a, label: a })),
  ]);

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const aplicacion = this.aplicacion();
    return this.requerimientos().filter(
      (r) =>
        r.estado === this.pestana() &&
        (!aplicacion || r.aplicacion === aplicacion) &&
        (!term || r.codigo.toLowerCase().includes(term) || r.titulo.toLowerCase().includes(term)),
    );
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  // Diálogo de decisión
  protected readonly enCurso = signal<DecisionEnCurso | null>(null);
  protected readonly motivo = signal('');
  protected readonly errorDialogo = signal('');
  protected readonly mensaje = signal('');
  protected readonly detalle = signal<RequerimientoResumen | null>(null);

  constructor() {
    this.cargar();
  }

  protected prioridad(r: RequerimientoResumen) {
    return PRIORIDAD[r.prioridad];
  }

  protected abrir(req: RequerimientoResumen, decision: Decision['decision']): void {
    this.enCurso.set({ req, decision });
    this.motivo.set('');
    this.errorDialogo.set('');
  }

  protected cerrar(): void {
    this.enCurso.set(null);
  }

  protected confirmar(): void {
    const actual = this.enCurso();
    if (!actual) return;
    const body: Decision = { decision: actual.decision, motivo: this.motivo() };
    this.service.decidir(actual.req.id, body).subscribe({
      next: (req) => {
        this.enCurso.set(null);
        this.mensaje.set(
          req.estado === 'APROBADO' ? `${req.codigo} fue aprobado.` : `${req.codigo} fue rechazado. Motivo: ${req.motivoRechazo}`,
        );
        this.cargar();
      },
      error: (err: Error) => this.errorDialogo.set(err.message),
    });
  }

  private cargar(): void {
    this.service.list().subscribe((list) => this.requerimientos.set(list));
  }
}
