import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiError } from '../../../core/auth/auth.models';
import { Aplicacion, AplicacionRequest } from '../../../core/models/aplicacion';
import { AplicacionService } from '../../../core/services/aplicacion.service';
import { Button } from '../../../shared/components/button/button';

export type ModoDialogo = 'ver' | 'crear' | 'editar';

type Campo = keyof AplicacionRequest;

const INPUT_CLASSES =
  'w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:outline-none disabled:bg-slate-50 disabled:text-slate-700 ';

/** Ver, crear o editar una aplicación en un `<dialog>` modal. */
@Component({
  selector: 'app-aplicacion-dialog',
  imports: [ReactiveFormsModule, Button],
  templateUrl: './aplicacion-dialog.html',
})
export class AplicacionDialog implements OnInit, AfterViewInit {
  private readonly service = inject(AplicacionService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly modo = input.required<ModoDialogo>();
  readonly aplicacion = input<Aplicacion | null>(null);
  readonly saved = output<Aplicacion>();
  readonly closed = output<void>();

  protected readonly form = inject(NonNullableFormBuilder).group({
    nombre: ['', [Validators.required, Validators.maxLength(160)]],
    descripcion: ['', [Validators.required, Validators.maxLength(500)]],
    tecnologiaActual: ['', Validators.maxLength(160)],
    tecnologiaObjetivo: ['', Validators.maxLength(160)],
    activo: [true],
  });

  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  /** Mensajes de validación por campo que devuelve el backend (400). */
  protected readonly serverErrors = signal<Partial<Record<Campo, string>>>({});

  protected readonly soloLectura = computed(() => this.modo() === 'ver');
  protected readonly titulo = computed(() => {
    switch (this.modo()) {
      case 'crear':
        return 'Nueva aplicación';
      case 'editar':
        return `Editar ${this.aplicacion()?.codigo ?? ''}`;
      default:
        return this.aplicacion()?.codigo ?? 'Aplicación';
    }
  });

  ngOnInit(): void {
    const app = this.aplicacion();
    if (app) {
      this.form.setValue({
        nombre: app.nombre,
        descripcion: app.descripcion ?? '',
        tecnologiaActual: app.tecnologiaActual ?? '',
        tecnologiaObjetivo: app.tecnologiaObjetivo ?? '',
        activo: app.activo,
      });
    }
    if (this.soloLectura()) this.form.disable();
  }

  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
  }

  protected invalid(campo: Campo): boolean {
    const control = this.form.controls[campo];
    return (control.invalid && control.touched) || !!this.serverErrors()[campo];
  }

  protected mensaje(campo: Campo, porDefecto: string): string {
    return this.serverErrors()[campo] ?? (this.form.controls[campo].hasError('maxlength') ? 'Texto demasiado largo.' : porDefecto);
  }

  protected inputClasses(campo: Campo): string {
    return (
      INPUT_CLASSES +
      (this.invalid(campo)
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
        : 'border-slate-300 focus:border-blue-600 focus:ring-blue-600/20')
    );
  }

  protected cerrar(): void {
    this.dialog().nativeElement.close();
  }

  protected guardar(): void {
    this.serverErrors.set({});
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const data: AplicacionRequest = {
      nombre: raw.nombre.trim(),
      descripcion: raw.descripcion.trim(),
      tecnologiaActual: raw.tecnologiaActual.trim() || null,
      tecnologiaObjetivo: raw.tecnologiaObjetivo.trim() || null,
      activo: raw.activo,
    };
    const app = this.aplicacion();
    const request$ = this.modo() === 'editar' && app ? this.service.update(app.id, data) : this.service.create(data);

    this.saving.set(true);
    this.error.set(null);
    request$.subscribe({
      next: (guardada) => {
        this.saved.emit(guardada);
        this.cerrar();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.mostrarError(err);
      },
    });
  }

  private mostrarError(err: unknown): void {
    if (!(err instanceof HttpErrorResponse)) {
      this.error.set('Ocurrió un error inesperado. Intente nuevamente.');
      return;
    }
    if (err.status === 0) {
      this.error.set('No se pudo conectar con el servidor. Intente nuevamente.');
      return;
    }
    const body = err.error as ApiError | null;
    this.serverErrors.set((body?.campos ?? {}) as Partial<Record<Campo, string>>);
    this.error.set(body?.message ?? 'Ocurrió un error inesperado. Intente nuevamente.');
  }
}
