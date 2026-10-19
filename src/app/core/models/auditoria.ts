export type OperacionAuditoria = 'REGISTRO' | 'ESTIMACION' | 'APROBACION' | 'RECHAZO';

/** Evento de GET /api/requerimientos/{id}/auditoria. */
export interface EventoAuditoria {
  id: number;
  fecha: string; // ISO 8601
  usuario: string;
  operacion: OperacionAuditoria;
  requerimientoCodigo: string;
  detalle: string;
}
