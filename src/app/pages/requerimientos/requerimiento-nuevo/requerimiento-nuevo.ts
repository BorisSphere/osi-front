import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { PRIORIDADES, PrioridadRequerimiento, TIPOS_REQUERIMIENTO } from '../../../core/models/requerimiento';
import { AplicacionService } from '../../../core/services/aplicacion.service';
import { RequerimientoService } from '../../../core/services/requerimiento.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Button } from '../../../shared/components/button/button';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Select, SelectOption } from '../../../shared/components/select/select';
import { Stepper } from '../../../shared/components/stepper/stepper';

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
  private readonly auth = inject(AuthService);

  readonly steps = ['Datos generales', 'Detalle técnico', 'Archivos', 'Confirmación'];

  private readonly aplicaciones = toSignal(inject(AplicacionService).list(), { initialValue: [] });

  readonly appOptions = computed(() =>
    toOptions(
      'Seleccione una aplicación',
      this.aplicaciones()
        .filter((app) => app.estado === 'Activa')
        .map((app) => app.nombre),
    ),
  );
  readonly priorityOptions = toOptions('Seleccione una prioridad', PRIORIDADES);
  readonly typeOptions = toOptions('Seleccione un tipo', TIPOS_REQUERIMIENTO);

  readonly step = signal(0);
  private readonly triedNext = signal(false);

  readonly application = signal('');
  readonly priority = signal('');
  readonly title = signal('');
  readonly requiredDate = signal('');
  readonly requestType = signal('');
  readonly description = signal('');
  readonly technicalDetails = signal('');
  readonly files = signal<string[]>([]);

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

  selectFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.files.set(Array.from(input.files ?? []).map((file) => file.name));
  }

  submit(): void {
    this.service.create({
      aplicacion: this.application(),
      titulo: this.title().trim(),
      tipo: this.requestType(),
      prioridad: this.priority() as PrioridadRequerimiento,
      fechaRequerida: this.requiredDate(),
      solicitante: this.auth.displayUser()?.name ?? '',
      descripcion: this.description().trim(),
      detalleTecnico: this.technicalDetails().trim(),
      archivos: this.files(),
    });
    this.router.navigate(['/requerimientos']);
  }
}
