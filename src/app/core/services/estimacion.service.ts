import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoRequerimiento, Estimacion, RequerimientoResumen } from '../models/estimacion';

/** Estados en los que se puede (re)estimar: una estimación rechazada puede corregirse. */
const ESTIMABLES: EstadoRequerimiento[] = ['REGISTRADO', 'ESTIMADO', 'RECHAZADO'];

@Injectable({ providedIn: 'root' })
export class EstimacionService {
  private readonly http = inject(HttpClient);

  /** Requerimientos que pueden estimarse (GET /api/estimaciones). */
  listEstimables(): Observable<RequerimientoResumen[]> {
    const params = ESTIMABLES.reduce((p, estado) => p.append('estado', estado), new HttpParams());
    return this.http.get<RequerimientoResumen[]>('/api/estimaciones', { params });
  }

  /** Calcula y guarda en el back; el back aplica la regla 5/78/15/2 y el permiso de ANALISTA. */
  guardar(requerimientoId: number, hhDesarrollo: number): Observable<Estimacion> {
    return this.http.put<Estimacion>(`/api/requerimientos/${requerimientoId}/estimacion`, { hhDesarrollo });
  }
}
