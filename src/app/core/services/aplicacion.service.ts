import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Aplicacion, AplicacionRequest } from '../models/aplicacion';

@Injectable({ providedIn: 'root' })
export class AplicacionService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/aplicaciones';

  list(): Observable<Aplicacion[]> {
    return this.http.get<Aplicacion[]>(this.url);
  }

  /** GET /api/aplicaciones: solo las activas, para elegir al registrar un requerimiento. */
  listActivas(): Observable<Aplicacion[]> {
    return this.list().pipe(map((lista) => lista.filter((aplicacion) => aplicacion.activo)));
  }

  /** POST /api/aplicaciones */
  create(request: AplicacionRequest): Observable<Aplicacion> {
    return this.http.post<Aplicacion>(this.url, request);
  }

  /** PUT /api/aplicaciones/{id} */
  update(id: number, request: AplicacionRequest): Observable<Aplicacion> {
    return this.http.put<Aplicacion>(`${this.url}/${id}`, request);
  }

  /** DELETE /api/aplicaciones/{id} */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
