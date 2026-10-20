import { Location } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { RequerimientoResumen } from '../../core/models/estimacion';
import { EstimacionService } from '../../core/services/estimacion.service';
import { mensajeDeError } from '../../core/utils/api-error';
import { DistribucionHH, PORCENTAJES, calcularDistribucion } from '../../core/utils/estimacion-calc';
import { Button } from '../../shared/components/button/button';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { Icon } from '../../shared/components/icon/icon';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Select, SelectOption } from '../../shared/components/select/select';

const MAX_HH = 10000;

@Component({
  selector: 'app-estimaciones',
  imports: [PageHeader, Button, Icon, Select, EmptyState],
  templateUrl: './estimaciones.html',
})
export class Estimaciones {
  private readonly service = inject(EstimacionService);
  private readonly auth = inject(AuthService);
  private readonly location = inject(Location);

  protected readonly etapas = [
    { key: 'analisis', label: 'Análisis y diseño técnico', porcentaje: PORCENTAJES.analisis },
    { key: 'desarrollo', label: 'Desarrollo y pruebas unitarias', porcentaje: PORCENTAJES.desarrollo },
    { key: 'pruebas', label: 'Pruebas de sistemas', porcentaje: PORCENTAJES.pruebas },
    { key: 'documentacion', label: 'Documentación de pases', porcentaje: PORCENTAJES.documentacion },
  ] as const;

  /** Según la matriz de permisos, solo el ANALISTA guarda estimaciones. */
  protected readonly puedeGuardar = computed(() => this.auth.hasRole(['ANALISTA']));

  protected readonly requerimientos = signal<RequerimientoResumen[]>([]);
  protected readonly opciones = computed<SelectOption[]>(() =>
    this.requerimientos().map((r) => ({ value: String(r.id), label: `${r.codigo} · ${r.titulo}` })),
  );

  // Permite llegar con ?requerimiento=<id> (p. ej. desde el detalle del requerimiento).
  protected readonly seleccionId = signal(inject(ActivatedRoute).snapshot.queryParamMap.get('requerimiento') ?? '');
  protected readonly seleccionado = computed(
    () => this.requerimientos().find((r) => String(r.id) === this.seleccionId()) ?? null,
  );

  // Al cambiar de requerimiento se limpia el formulario.
  protected readonly hhDesarrollo = linkedSignal({ source: this.seleccionId, computation: () => '' });
  protected readonly resultado = linkedSignal<string, DistribucionHH | null>({ source: this.seleccionId, computation: () => null });
  protected readonly error = linkedSignal({ source: this.seleccionId, computation: () => '' });
  protected readonly mensaje = linkedSignal({ source: this.seleccionId, computation: () => '' });
  protected readonly guardando = signal(false);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal('');

  constructor() {
    this.cargar();
  }

  private cargar(): void {
    this.cargando.set(true);
    this.service.listEstimables().subscribe({
      next: (list) => {
        this.requerimientos.set(list);
        if (!list.some((r) => String(r.id) === this.seleccionId()) && list.length) {
          this.seleccionId.set(String(list[0].id));
        }
        this.errorCarga.set('');
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorCarga.set(mensajeDeError(err, 'No se pudieron cargar los requerimientos.'));
        this.cargando.set(false);
      },
    });
  }

  protected calcular(): void {
    this.mensaje.set('');
    const raw = this.hhDesarrollo().trim().replace(',', '.');
    const hh = Number(raw);
    if (!raw || !Number.isFinite(hh) || hh <= 0) {
      this.fallar('Ingrese las horas de desarrollo (un número mayor a cero).');
    } else if (hh > MAX_HH) {
      this.fallar(`Las horas de desarrollo no pueden superar ${MAX_HH}.`);
    } else if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
      this.fallar('Use como máximo 2 decimales.');
    } else {
      this.error.set('');
      this.resultado.set(calcularDistribucion(hh));
    }
  }

  protected guardar(): void {
    const req = this.seleccionado();
    const res = this.resultado();
    if (!req || !res || !this.puedeGuardar()) return;

    this.guardando.set(true);
    this.service.guardar(req.id, res.desarrollo).subscribe({
      next: (estimacion) => {
        // El cálculo que vale es el del back: se muestra el resultado guardado y se recarga la lista.
        this.resultado.set({
          analisis: estimacion.hhAnalisis,
          desarrollo: estimacion.hhDesarrollo,
          pruebas: estimacion.hhPruebas,
          documentacion: estimacion.hhDocumentacion,
          total: estimacion.hhTotal,
        });
        this.mensaje.set(
          `Estimación guardada: ${estimacion.codigo} quedó en estado ${estimacion.estado} con ${estimacion.hhTotal.toFixed(2)} HH.`,
        );
        this.guardando.set(false);
        this.cargar();
      },
      error: (err) => {
        this.error.set(mensajeDeError(err, 'No se pudo guardar la estimación.'));
        this.guardando.set(false);
      },
    });
  }

  protected volver(): void {
    this.location.back();
  }

  private fallar(message: string): void {
    this.error.set(message);
    this.resultado.set(null);
  }
}
