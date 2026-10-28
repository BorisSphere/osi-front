import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { FiltroSeguimiento, ReporteArchivado, Seguimiento } from '../models/reporte';
import { DashboardService } from './dashboard.service';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly http = inject(HttpClient);
  private readonly dashboard = inject(DashboardService);

  /** GET /api/reportes/seguimiento?desde=&hasta=&aplicacion= (filtros vacíos se omiten). */
  seguimiento(filtro: FiltroSeguimiento = {}): Observable<Seguimiento> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.get<Seguimiento>('/api/reportes/seguimiento', { params });
  }

  /**
   * Descarga el seguimiento en PDF o Excel (JasperReports en el back), con los mismos filtros.
   * Se pide como blob con HttpClient para que el interceptor agregue el token.
   */
  exportar(formato: 'pdf' | 'xlsx', filtro: FiltroSeguimiento = {}): Observable<HttpResponse<Blob>> {
    let params = new HttpParams().set('formato', formato);
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.get('/api/reportes/seguimiento/exportar', { params, responseType: 'blob', observe: 'response' });
  }

  /** Genera el PDF con los filtros y lo guarda en Alfresco (POST /api/reportes/seguimiento/archivar). */
  archivar(filtro: FiltroSeguimiento = {}): Observable<ReporteArchivado> {
    let params = new HttpParams();
    for (const [clave, valor] of Object.entries(filtro)) {
      if (valor) params = params.set(clave, valor);
    }
    return this.http.post<ReporteArchivado>('/api/reportes/seguimiento/archivar', null, { params });
  }

  /** Reportes guardados en Alfresco, del más reciente al más antiguo. */
  archivados(): Observable<ReporteArchivado[]> {
    return this.http.get<ReporteArchivado[]>('/api/reportes/archivados');
  }

  /** Contenido de un reporte archivado (como blob, para que el interceptor agregue el token). */
  descargarArchivado(id: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`/api/reportes/archivados/${encodeURIComponent(id)}`, { responseType: 'blob', observe: 'response' });
  }

  /** Códigos de aplicación para el filtro (los mismos que usa el dashboard). */
  aplicaciones(): Observable<string[]> {
    return this.dashboard.resumen().pipe(map((r) => r.porAplicacion.map((a) => a.aplicacion)));
  }
}
