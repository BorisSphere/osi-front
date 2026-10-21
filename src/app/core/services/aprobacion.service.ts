import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Decision, DecisionResultado, EstadoRequerimiento, RequerimientoResumen } from '../models/estimacion';

/** Estados que aparecen en la bandeja de aprobación (pendientes, aprobados y rechazados). */
const BANDEJA: EstadoRequerimiento[] = ['ESTIMADO', 'APROBADO', 'RECHAZADO'];

@Injectable({ providedIn: 'root' })
export class AprobacionService {
  private readonly http = inject(HttpClient);

  list(): Observable<RequerimientoResumen[]> {
    const params = BANDEJA.reduce((p, estado) => p.append('estado', estado), new HttpParams());
    return this.http.get<RequerimientoResumen[]>('/api/estimaciones', { params });
  }

  /**
   * PATCH /api/requerimientos/{id}/decision. Las reglas las aplica el back: solo APROBADOR (403),
   * solo requerimientos ESTIMADO (409) y motivo obligatorio para rechazar (400).
   */
  decidir(requerimientoId: number, body: Decision): Observable<DecisionResultado> {
    return this.http.patch<DecisionResultado>(`/api/requerimientos/${requerimientoId}/decision`, body);
  }
}
