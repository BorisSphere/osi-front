import { Component, computed, inject, signal } from '@angular/core';
import { EstadoRequerimiento } from '../../core/models/estimacion';
import { Seguimiento } from '../../core/models/reporte';
import { ReporteService } from '../../core/services/reporte.service';
import { mensajeDeError } from '../../core/utils/api-error';
import { Button } from '../../shared/components/button/button';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Select, SelectOption } from '../../shared/components/select/select';

/** Mismo orden y colores que el Dashboard (paleta validada para daltonismo). */
const ESTADOS: { estado: EstadoRequerimiento; label: string; color: string; tarjeta: string }[] = [
  { estado: 'REGISTRADO', label: 'Registrados', color: '#3b82f6', tarjeta: 'border-blue-200 bg-blue-50 text-blue-700' },
  { estado: 'APROBADO', label: 'Aprobados', color: '#16a34a', tarjeta: 'border-green-200 bg-green-50 text-green-700' },
  { estado: 'ESTIMADO', label: 'Estimados', color: '#f59e0b', tarjeta: 'border-amber-200 bg-amber-50 text-amber-700' },
  { estado: 'RECHAZADO', label: 'Rechazados', color: '#dc2626', tarjeta: 'border-red-200 bg-red-50 text-red-700' },
];

/** Seguimiento y reportes (RF08). */
@Component({
  selector: 'app-reportes',
  imports: [PageHeader, Button, Select],
  templateUrl: './reportes.html',
})
export class Reportes {
  private readonly service = inject(ReporteService);

  protected readonly estados = ESTADOS;

  // Filtros del formulario; se aplican al presionar "Consultar".
  protected readonly desde = signal('');
  protected readonly hasta = signal('');
  protected readonly aplicacion = signal('');
  protected readonly error = signal('');

  protected readonly aplicacionOptions = signal<SelectOption[]>([{ value: '', label: 'Todas' }]);
  protected readonly datos = signal<Seguimiento | null>(null);

  /** Barras verticales por estado (alto en % del máximo). */
  protected readonly barrasEstado = computed(() => {
    const d = this.datos();
    if (!d) return [];
    const max = Math.max(1, ...ESTADOS.map((e) => d.porEstado[e.estado]));
    return ESTADOS.map((e) => ({ ...e, valor: d.porEstado[e.estado], alto: (d.porEstado[e.estado] / max) * 100 }));
  });

  /** Barras horizontales de HH aprobadas por aplicación (solo las que tienen HH). */
  protected readonly barrasHH = computed(() => {
    const d = this.datos();
    if (!d) return [];
    const filas = d.porAplicacion.filter((a) => a.hhAprobadas > 0);
    const max = Math.max(1, ...filas.map((a) => a.hhAprobadas));
    return filas.map((a) => ({ aplicacion: a.aplicacion, valor: a.hhAprobadas, ancho: (a.hhAprobadas / max) * 100 }));
  });

  protected readonly cargando = signal(false);

  constructor() {
    this.service.aplicaciones().subscribe({
      next: (apps) =>
        this.aplicacionOptions.set([{ value: '', label: 'Todas' }, ...apps.map((a) => ({ value: a, label: a }))]),
      error: () => {
        // Sin la lista se puede consultar igual con "Todas"; el error principal lo muestra consultar().
      },
    });
    this.consultar();
  }

  protected consultar(): void {
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) {
      this.error.set('La fecha "Desde" no puede ser posterior a "Hasta".');
      return;
    }
    this.error.set('');
    this.cargando.set(true);
    this.service.seguimiento({ desde: this.desde(), hasta: this.hasta(), aplicacion: this.aplicacion() }).subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeDeError(err, 'No se pudo consultar el seguimiento.'));
        this.cargando.set(false);
      },
    });
  }
}
