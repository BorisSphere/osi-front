import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Decision, RequerimientoResumen } from '../models/estimacion';
import { LabMockStore } from './lab-mock.store';

const MOTIVO_MIN = 10;

@Injectable({ providedIn: 'root' })
export class AprobacionService {
  private readonly store = inject(LabMockStore);
  private readonly auth = inject(AuthService);

  /** Requerimientos estimados, aprobados y rechazados (los que aparecen en la bandeja). */
  list(): Observable<RequerimientoResumen[]> {
    return of(this.store.requerimientos().filter((r) => r.estado !== 'REGISTRADO'));
  }

  /**
   * PATCH /api/requerimientos/{id}/decision
   * Replica las reglas del back: solo APROBADOR (403), solo requerimientos ESTIMADO con
   * estimación positiva y motivo obligatorio para rechazar (400).
   */
  decidir(requerimientoId: number, body: Decision): Observable<RequerimientoResumen> {
    if (!this.auth.hasRole(['APROBADOR'])) {
      return throwError(() => new Error('403 · Solo el rol Aprobador puede aprobar o rechazar.'));
    }
    const req = this.store.requerimientos().find((r) => r.id === requerimientoId);
    if (!req) {
      return throwError(() => new Error('El requerimiento no existe.'));
    }
    if (req.estado !== 'ESTIMADO' || !req.hhTotal || req.hhTotal <= 0) {
      return throwError(() => new Error('Solo se puede decidir sobre un requerimiento ESTIMADO con estimación positiva.'));
    }
    const motivo = body.motivo?.trim() ?? '';
    if (body.decision === 'RECHAZADO' && motivo.length < MOTIVO_MIN) {
      return throwError(() => new Error(`El motivo del rechazo es obligatorio (mínimo ${MOTIVO_MIN} caracteres).`));
    }

    const rechazo = body.decision === 'RECHAZADO';
    this.store.actualizar(req.id, { estado: body.decision, motivoRechazo: rechazo ? motivo : null });
    this.store.registrarEvento(
      this.auth.usuario()?.username ?? 'desconocido',
      rechazo ? 'RECHAZO' : 'APROBACION',
      req.codigo,
      rechazo ? `Rechazó requerimiento ${req.codigo}. Motivo: ${motivo}` : `Aprobó requerimiento ${req.codigo}`,
    );
    return of(this.store.requerimientos().find((r) => r.id === req.id)!);
  }
}
