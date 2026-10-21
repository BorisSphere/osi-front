import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { map, of, switchMap, tap } from 'rxjs';
import {
  PRIORIDADES,
  PRIORIDAD_LABEL,
  PrioridadRequerimiento,
  TIPOS_REQUERIMIENTO,
} from '../../../core/models/requerimiento';
import { AplicacionService } from '../../../core/services/aplicacion.service';
import { RequerimientoService } from '../../../core/services/requerimiento.service';
import { Button } from '../../../shared/components/button/button';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Select, SelectOption } from '../../../shared/components/select/select';
import { Stepper } from '../../../shared/components/stepper/stepper';
import { mensajeError } from '../requerimiento-ui';

const INPUT_CLASSES =
  'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none ';

const toOptions = (placeholder: string, values: string[]): SelectOption[] => [
  { value: '', label: placeholder },
  ...values.map((value) => ({ value, label: value })),
];

@Component({
  selector: 'app-requerimiento-nuevo',
  imports: [PageHeader, Select, Button, Stepper],
  templateUrl: './requerimiento-nuevo.html',
})
export class RequerimientoNuevo {
  private readonly router = inject(Router);
  private readonly service = inject(RequerimientoService);

  readonly steps = ['Datos generales', 'Detalle técnico', 'Archivos', 'Confirmación'];

  private readonly aplicaciones = toSignal(inject(AplicacionService).listActivas(), { initialValue: [] });

  readonly appOptions = computed<SelectOption[]>(() => [
    { value: '', label: 'Seleccione una aplicación' },
    ...this.aplicaciones().map((app) => ({ value: String(app.id), label: app.nombre })),
  ]);
  readonly priorityOptions: SelectOption[] = [
    { value: '', label: 'Seleccione una prioridad' },
    ...PRIORIDADES.map((p) => ({ value: p, label: PRIORIDAD_LABEL[p] })),
  ];
  readonly typeOptions = toOptions('Seleccione un tipo', TIPOS_REQUERIMIENTO);

  readonly step = signal(0);
  private readonly triedNext = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');

  /** Id de la aplicación elegida (como texto, por el componente Select). */
  readonly application = signal('');
  readonly priority = signal('');
  readonly title = signal('');
  readonly requiredDate = signal('');
  readonly requestType = signal('');
  readonly description = signal('');
  readonly technicalDetails = signal('');
  readonly file = signal<File | null>(null);
  readonly dragging = signal(false);
  private createdId: number | null = null;

  readonly applicationName = computed(
    () => this.appOptions().find((o) => o.value === this.application())?.label ?? '',
  );
  readonly priorityName = computed(() => this.priorityOptions.find((o) => o.value === this.priority())?.label ?? '');

  readonly isLast = computed(() => this.step() === this.steps.length - 1);

  private readonly missing = computed((): Record<string, boolean> => {
    switch (this.step()) {
      case 0:
        return {
          application: !this.application(),
          priority: !this.priority(),
          title: !this.title().trim(),
          requiredDate: !this.requiredDate(),
          requestType: !this.requestType(),
          description: !this.description().trim(),
        };
      case 1:
        return { technicalDetails: !this.technicalDetails().trim() };
      default:
        return {};
    }
  });

  /** Un campo se marca como inválido solo después de intentar avanzar. */
  invalid(field: string): boolean {
    return this.triedNext() && !!this.missing()[field];
  }

  inputClasses(field: string): string {
    return (
      INPUT_CLASSES +
      (this.invalid(field)
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20')
    );
  }

  next(): void {
    this.triedNext.set(true);
    if (Object.values(this.missing()).some(Boolean)) return;
    this.triedNext.set(false);
    this.step.update((s) => Math.min(s + 1, this.steps.length - 1));
  }

  back(): void {
    this.triedNext.set(false);
    this.step.update((s) => Math.max(s - 1, 0));
  }

  /** Cancelar vuelve al listado sin guardar. */
  cancel(): void {
    this.router.navigate(['/requerimientos']);
  }

  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file.set(input.files?.[0] ?? null);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  /** Sin preventDefault el navegador abre el archivo soltado en lugar de entregarlo a la página. */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const archivo = event.dataTransfer?.files?.[0];
    if (archivo) this.file.set(archivo);
  }

  submit(): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set('');

    // Si el registro ya se creó y solo falló la subida, el reintento sube el archivo sin duplicar el requerimiento.
    const creado$ = this.createdId
      ? of(this.createdId)
      : this.service
          .create({
            aplicacionId: Number(this.application()),
            titulo: this.title().trim(),
            tipo: this.requestType(),
            prioridad: this.priority() as PrioridadRequerimiento,
            fechaRequerida: this.requiredDate(),
            descripcion: this.description().trim(),
            detalleTecnico: this.technicalDetails().trim(),
          })
          .pipe(map((r) => r.id));

    creado$
      .pipe(
        tap((id) => (this.createdId = id)),
        switchMap((id) => {
          const archivo = this.file();
          return archivo ? this.service.adjuntar(id, archivo) : of(null);
        }),
      )
      .subscribe({
        next: () => this.router.navigate(['/requerimientos']),
        error: (err) => {
          const detalle = mensajeError(err);
          this.error.set(
            this.createdId
              ? `El requerimiento se registró, pero no se pudo adjuntar el archivo: ${detalle}`
              : detalle,
          );
          this.saving.set(false);
        },
      });
  }
}
