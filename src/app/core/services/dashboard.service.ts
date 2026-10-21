import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardResumen } from '../models/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  /** Totales calculados en Oracle (CA09). */
  resumen(): Observable<DashboardResumen> {
    return this.http.get<DashboardResumen>('/api/dashboard/resumen');
  }
}
