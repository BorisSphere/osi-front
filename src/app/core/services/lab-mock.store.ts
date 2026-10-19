import { Injectable, signal } from '@angular/core';
import { EventoAuditoria, OperacionAuditoria } from '../models/auditoria';
import { RequerimientoResumen } from '../models/estimacion';

/**
 * Datos de ejemplo compartidos por las pantallas de Analista 3 (estimación, aprobación,
 * auditoría, dashboard y reportes) hasta conectar con osi-back. Se pierden al recargar.
 */
@Injectable({ providedIn: 'root' })
export class LabMockStore {
  readonly requerimientos = signal<RequerimientoResumen[]>([
    { id: 1, codigo: 'REQ-2025-001', titulo: 'Implementar módulo de reportes', aplicacion: 'SIGED', prioridad: 'ALTA', estado: 'REGISTRADO', fechaRegistro: '2025-04-10', hhTotal: null },
    { id: 2, codigo: 'REQ-2025-002', titulo: 'Migración a Angular', aplicacion: 'SICAM', prioridad: 'ALTA', estado: 'ESTIMADO', fechaRegistro: '2025-03-05', hhTotal: 160 },
    { id: 3, codigo: 'REQ-2025-003', titulo: 'Optimización de consultas', aplicacion: 'FISE', prioridad: 'MEDIA', estado: 'ESTIMADO', fechaRegistro: '2025-03-12', hhTotal: 80 },
    { id: 4, codigo: 'REQ-2025-004', titulo: 'Integración con API', aplicacion: 'GPA', prioridad: 'MEDIA', estado: 'ESTIMADO', fechaRegistro: '2025-03-20', hhTotal: 120 },
    { id: 5, codigo: 'REQ-2025-005', titulo: 'Actualización de librerías', aplicacion: 'MOVIL', prioridad: 'BAJA', estado: 'ESTIMADO', fechaRegistro: '2025-02-14', hhTotal: 60 },
    { id: 6, codigo: 'REQ-2025-006', titulo: 'Firma digital de documentos', aplicacion: 'SIGED', prioridad: 'ALTA', estado: 'APROBADO', fechaRegistro: '2025-04-01', hhTotal: 240 },
    { id: 7, codigo: 'REQ-2025-007', titulo: 'Exportación de reportes a PDF', aplicacion: 'SICAM', prioridad: 'MEDIA', estado: 'APROBADO', fechaRegistro: '2025-02-03', hhTotal: 100 },
    { id: 8, codigo: 'REQ-2025-008', titulo: 'Notificaciones por correo', aplicacion: 'FISE', prioridad: 'BAJA', estado: 'RECHAZADO', fechaRegistro: '2025-01-28', hhTotal: 40, motivoRechazo: 'Fuera del alcance del trimestre.' },
    { id: 9, codigo: 'REQ-2025-009', titulo: 'Nuevo flujo de trámites', aplicacion: 'GPA', prioridad: 'MEDIA', estado: 'REGISTRADO', fechaRegistro: '2025-04-22', hhTotal: null },
  ]);

  readonly auditoria = signal<EventoAuditoria[]>([
    { id: 1, fecha: '2025-04-01T10:30:00', usuario: 'mtorres', operacion: 'REGISTRO', requerimientoCodigo: 'REQ-2025-006', detalle: 'Creó requerimiento REQ-2025-006' },
    { id: 2, fecha: '2025-04-01T11:15:00', usuario: 'cruiz', operacion: 'ESTIMACION', requerimientoCodigo: 'REQ-2025-006', detalle: 'Estimó 240.00 HH para REQ-2025-006' },
    { id: 3, fecha: '2025-04-01T14:20:00', usuario: 'alopez', operacion: 'APROBACION', requerimientoCodigo: 'REQ-2025-006', detalle: 'Aprobó requerimiento REQ-2025-006' },
    { id: 4, fecha: '2025-04-02T11:45:00', usuario: 'alopez', operacion: 'RECHAZO', requerimientoCodigo: 'REQ-2025-008', detalle: 'Rechazó requerimiento REQ-2025-008. Motivo: Fuera del alcance del trimestre.' },
  ]);

  private nextAuditoriaId = 5;

  actualizar(id: number, cambios: Partial<RequerimientoResumen>): void {
    this.requerimientos.update((list) => list.map((r) => (r.id === id ? { ...r, ...cambios } : r)));
  }

  registrarEvento(usuario: string, operacion: OperacionAuditoria, requerimientoCodigo: string, detalle: string): void {
    const evento: EventoAuditoria = {
      id: this.nextAuditoriaId++,
      fecha: new Date().toISOString(),
      usuario,
      operacion,
      requerimientoCodigo,
      detalle,
    };
    this.auditoria.update((list) => [...list, evento]);
  }
}
