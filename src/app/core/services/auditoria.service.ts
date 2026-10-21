import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EventoAuditoria } from '../models/auditoria';

export interface FiltroAuditoria {
  desde?: string; // yyyy-MM-dd
  hasta?: string; // yyyy-MM-dd
  usuario?: string;
}

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly http = inject(HttpClient);

  /** GET /api/requerimientos/{id}/auditoria */
  historial(requerimientoId: number): Observable<EventoAuditoria[]> {
    return this.http.get<EventoAuditoria[]>(`/api/requerimientos/${requerimientoId}/auditoria`);
  }

  /** Historial global, del más reciente al más antiguo (GET /api/auditoria). Filtros vacíos se omiten. */
  list(filtro: FiltroAuditoria = {}): Observable<EventoAuditoria[]> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.get<EventoAuditoria[]>('/api/auditoria', { params });
  }
}
