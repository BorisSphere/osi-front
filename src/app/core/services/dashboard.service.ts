import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DashboardResumen } from '../models/dashboard';
import { EstadoRequerimiento } from '../models/estimacion';
import { AplicacionService } from './aplicacion.service';
import { LabMockStore } from './lab-mock.store';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly store = inject(LabMockStore);
  private readonly aplicaciones = inject(AplicacionService);

  /** GET /api/dashboard/resumen */
  resumen(): Observable<DashboardResumen> {
    return this.aplicaciones.list().pipe(
      map((apps) => {
        const reqs = this.store.requerimientos();
        const porEstado: Record<EstadoRequerimiento, number> = { REGISTRADO: 0, ESTIMADO: 0, APROBADO: 0, RECHAZADO: 0 };
        const porAplicacion = new Map<string, number>();
        let hhAprobadas = 0;
        for (const r of reqs) {
          porEstado[r.estado]++;
          porAplicacion.set(r.aplicacion, (porAplicacion.get(r.aplicacion) ?? 0) + 1);
          if (r.estado === 'APROBADO') hhAprobadas += r.hhTotal ?? 0;
        }
        return {
          aplicaciones: apps.length,
          requerimientos: reqs.length,
          porEstado,
          hhAprobadas,
          porAplicacion: [...porAplicacion].map(([aplicacion, cantidad]) => ({ aplicacion, cantidad })),
        };
      }),
    );
  }
}
