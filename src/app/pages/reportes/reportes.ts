import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { EstadoRequerimiento } from '../../core/models/estimacion';
import { ReporteArchivado, Seguimiento } from '../../core/models/reporte';
import { ReporteService } from '../../core/services/reporte.service';
import { mensajeDeError, mensajeDeErrorBlob } from '../../core/utils/api-error';
import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
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
  imports: [DatePipe, PageHeader, Button, Icon, Select],
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
    this.cargarArchivados();
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

  /** Formato que se está generando (para mostrar "Generando..." y evitar dobles clics). */
  protected readonly descargando = signal<'pdf' | 'xlsx' | null>(null);

  /** Descarga el reporte (PDF o Excel) con los filtros que están en el formulario. */
  protected descargar(formato: 'pdf' | 'xlsx'): void {
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) {
      this.error.set('La fecha "Desde" no puede ser posterior a "Hasta".');
      return;
    }
    this.error.set('');
    this.descargando.set(formato);
    this.service.exportar(formato, { desde: this.desde(), hasta: this.hasta(), aplicacion: this.aplicacion() }).subscribe({
      next: (respuesta) => {
        const nombre = nombreDeArchivo(respuesta.headers.get('Content-Disposition')) ?? `seguimiento.${formato}`;
        guardarArchivo(respuesta.body!, nombre);
        this.descargando.set(null);
      },
      error: async (err) => {
        this.error.set(await mensajeDeErrorBlob(err, 'No se pudo generar el reporte.'));
        this.descargando.set(null);
      },
    });
  }

  // ---------- Archivo en Alfresco ----------

  protected readonly archivados = signal<ReporteArchivado[]>([]);
  protected readonly cargandoArchivados = signal(false);
  protected readonly archivando = signal(false);
  /** Mensaje de la sección de Alfresco (por ejemplo, "Alfresco no disponible"); no bloquea el resto. */
  protected readonly avisoAlfresco = signal('');
  protected readonly mensajeAlfresco = signal('');

  /** Genera el PDF con los filtros del formulario y lo guarda en Alfresco. */
  protected archivar(): void {
    if (this.desde() && this.hasta() && this.desde() > this.hasta()) {
      this.error.set('La fecha "Desde" no puede ser posterior a "Hasta".');
      return;
    }
    this.error.set('');
    this.mensajeAlfresco.set('');
    this.archivando.set(true);
    this.service.archivar({ desde: this.desde(), hasta: this.hasta(), aplicacion: this.aplicacion() }).subscribe({
      next: (reporte) => {
        this.mensajeAlfresco.set(`Reporte archivado en Alfresco: ${reporte.nombre}`);
        this.archivando.set(false);
        this.cargarArchivados();
      },
      error: (err) => {
        this.avisoAlfresco.set(mensajeDeError(err, 'No se pudo archivar el reporte en Alfresco.'));
        this.archivando.set(false);
      },
    });
  }

  protected cargarArchivados(): void {
    this.cargandoArchivados.set(true);
    this.service.archivados().subscribe({
      next: (lista) => {
        this.archivados.set(lista);
        this.avisoAlfresco.set('');
        this.cargandoArchivados.set(false);
      },
      error: (err) => {
        // Sin respuesta de Alfresco no se muestra la lista anterior (los archivos siguen guardados allá).
        this.archivados.set([]);
        this.avisoAlfresco.set(mensajeDeError(err, 'No se pudo consultar Alfresco.'));
        this.cargandoArchivados.set(false);
      },
    });
  }

  protected abrir(reporte: ReporteArchivado): void {
    this.service.descargarArchivado(reporte.id).subscribe({
      next: (respuesta) =>
        guardarArchivo(respuesta.body!, nombreDeArchivo(respuesta.headers.get('Content-Disposition')) ?? reporte.nombre),
      error: async (err) => this.avisoAlfresco.set(await mensajeDeErrorBlob(err, 'No se pudo abrir el reporte.')),
    });
  }

  protected tamanio(bytes: number | null): string {
    if (bytes == null) return '';
    return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
}

/** Nombre del archivo enviado por el back en Content-Disposition (attachment; filename="..."). */
function nombreDeArchivo(contentDisposition: string | null): string | null {
  const coincidencia = contentDisposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return coincidencia ? decodeURIComponent(coincidencia[1]) : null;
}

/** Dispara la descarga del archivo en el navegador. */
function guardarArchivo(contenido: Blob, nombre: string): void {
  const url = URL.createObjectURL(contenido);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}
