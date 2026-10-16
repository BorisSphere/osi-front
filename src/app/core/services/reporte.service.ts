import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EstadoRequerimiento } from '../models/estimacion';
import { FiltroSeguimiento, Seguimiento, SeguimientoAplicacion } from '../models/reporte';
import { LabMockStore } from './lab-mock.store';

const vacio = (): Record<EstadoRequerimiento, number> => ({ REGISTRADO: 0, ESTIMADO: 0, APROBADO: 0, RECHAZADO: 0 });

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly store = inject(LabMockStore);

  /**
   * Seguimiento por rango de fechas de registro y aplicación.
   * En el back: GET /api/reportes/seguimiento?desde=&hasta=&aplicacion= (no está en el
   * contrato mínimo; hay que agregarlo).
   */
  seguimiento(filtro: FiltroSeguimiento = {}): Observable<Seguimiento> {
    const reqs = this.store
      .requerimientos()
      .filter(
        (r) =>
          (!filtro.desde || r.fechaRegistro >= filtro.desde) &&
          (!filtro.hasta || r.fechaRegistro <= filtro.hasta) &&
          (!filtro.aplicacion || r.aplicacion === filtro.aplicacion),
      );

    const porEstado = vacio();
    const porAplicacion = new Map<string, SeguimientoAplicacion>();
    let hhAprobadas = 0;
    for (const r of reqs) {
      porEstado[r.estado]++;
      const fila = porAplicacion.get(r.aplicacion) ?? { aplicacion: r.aplicacion, porEstado: vacio(), hhAprobadas: 0 };
      fila.porEstado[r.estado]++;
      if (r.estado === 'APROBADO') {
        fila.hhAprobadas += r.hhTotal ?? 0;
        hhAprobadas += r.hhTotal ?? 0;
      }
      porAplicacion.set(r.aplicacion, fila);
    }

    return of({
      total: reqs.length,
      porEstado,
      hhAprobadas,
      porAplicacion: [...porAplicacion.values()].sort(
        (a, b) => b.hhAprobadas - a.hhAprobadas || a.aplicacion.localeCompare(b.aplicacion),
      ),
    });
  }

  /** Aplicaciones con requerimientos (para el filtro). */
  aplicaciones(): Observable<string[]> {
    return of([...new Set(this.store.requerimientos().map((r) => r.aplicacion))].sort());
  }
}
