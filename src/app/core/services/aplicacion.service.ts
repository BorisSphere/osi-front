import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Aplicacion, AplicacionRequest } from '../models/aplicacion';

const URL = '/api/aplicaciones';

@Injectable({ providedIn: 'root' })
export class AplicacionService {
  private readonly http = inject(HttpClient);

  list(): Observable<Aplicacion[]> {
    return this.http.get<Aplicacion[]>(URL);
  }

  create(data: AplicacionRequest): Observable<Aplicacion> {
    return this.http.post<Aplicacion>(URL, data);
  }

  update(id: number, data: AplicacionRequest): Observable<Aplicacion> {
    return this.http.put<Aplicacion>(`${URL}/${id}`, data);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${URL}/${id}`);
  }
}
