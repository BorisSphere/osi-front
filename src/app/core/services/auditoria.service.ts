import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { EventoAuditoria } from '../models/auditoria';
import { LabMockStore } from './lab-mock.store';

export interface FiltroAuditoria {
  desde?: string; // yyyy-MM-dd
  hasta?: string; // yyyy-MM-dd
  usuario?: string;
}

/** Fecha local yyyy-MM-dd de un ISO 8601 (evita desfases por zona horaria). */
function fechaLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly store = inject(LabMockStore);

  /**
   * Historial global de operaciones, del más reciente al más antiguo.
   * En el back: GET /api/auditoria?desde=&hasta=&usuario= (el contrato mínimo solo define
   * GET /api/requerimientos/{id}/auditoria; esta consulta global hay que agregarla).
   */
  list(filtro: FiltroAuditoria = {}): Observable<EventoAuditoria[]> {
    const eventos = this.store
      .auditoria()
      .filter((e) => {
        const dia = fechaLocal(e.fecha);
        return (
          (!filtro.desde || dia >= filtro.desde) &&
          (!filtro.hasta || dia <= filtro.hasta) &&
          (!filtro.usuario || e.usuario === filtro.usuario)
        );
      })
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
    return of(eventos);
  }

  /** Usuarios que aparecen en el historial (para el filtro). */
  usuarios(): Observable<string[]> {
    return of([...new Set(this.store.auditoria().map((e) => e.usuario))].sort());
  }
}
