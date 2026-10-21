/** Valores de LAB_AUDITORIA.ACCION. REGISTRO y ACTUALIZACION los registra el módulo de requerimientos. */
export type OperacionAuditoria = 'REGISTRO' | 'ACTUALIZACION' | 'ESTIMACION' | 'APROBACION' | 'RECHAZO';

/** Evento de GET /api/auditoria y GET /api/requerimientos/{id}/auditoria. */
export interface EventoAuditoria {
  id: number;
  fecha: string; // ISO 8601
  usuario: string;
  operacion: OperacionAuditoria;
  requerimientoCodigo: string;
  /** En un RECHAZO es el motivo. */
  detalle: string | null;
}
