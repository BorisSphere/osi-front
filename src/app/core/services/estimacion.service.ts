import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { EstadoRequerimiento, Estimacion, RequerimientoResumen } from '../models/estimacion';
import { calcularDistribucion } from '../utils/estimacion-calc';
import { LabMockStore } from './lab-mock.store';

/** Estados en los que se puede (re)estimar: una estimación rechazada puede corregirse. */
const ESTIMABLES: ReadonlySet<EstadoRequerimiento> = new Set(['REGISTRADO', 'ESTIMADO', 'RECHAZADO']);

@Injectable({ providedIn: 'root' })
export class EstimacionService {
  private readonly store = inject(LabMockStore);
  private readonly auth = inject(AuthService);

  /** Requerimientos que pueden estimarse. */
  listEstimables(): Observable<RequerimientoResumen[]> {
    return of(this.store.requerimientos().filter((r) => ESTIMABLES.has(r.estado)));
  }

  /** PUT /api/requerimientos/{id}/estimacion */
  guardar(requerimientoId: number, hhDesarrollo: number): Observable<Estimacion> {
    const req = this.store.requerimientos().find((r) => r.id === requerimientoId);
    if (!req) {
      return throwError(() => new Error('El requerimiento no existe.'));
    }
    if (!(hhDesarrollo > 0)) {
      return throwError(() => new Error('Las horas de desarrollo deben ser mayores a cero.'));
    }
    const d = calcularDistribucion(hhDesarrollo);
    this.store.actualizar(requerimientoId, { estado: 'ESTIMADO', hhTotal: d.total, motivoRechazo: null });
    this.store.registrarEvento(
      this.auth.usuario()?.username ?? 'desconocido',
      'ESTIMACION',
      req.codigo,
      `Estimó ${d.total.toFixed(2)} HH para ${req.codigo}`,
    );
    return of({
      requerimientoId,
      hhAnalisis: d.analisis,
      hhDesarrollo: d.desarrollo,
      hhPruebas: d.pruebas,
      hhDocumentacion: d.documentacion,
      hhTotal: d.total,
    });
  }
}
