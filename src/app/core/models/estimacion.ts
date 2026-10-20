/** Estados del requerimiento (CK_LAB_REQ_ESTADO). */
export type EstadoRequerimiento = 'REGISTRADO' | 'ESTIMADO' | 'APROBADO' | 'RECHAZADO';

export type Prioridad = 'ALTA' | 'MEDIA' | 'BAJA';

/** Fila de GET /api/estimaciones (bandeja de estimación y aprobación). */
export interface RequerimientoResumen {
  id: number;
  codigo: string;
  titulo: string;
  /** Código de la aplicación, p. ej. LAB-001. */
  aplicacion: string;
  prioridad: Prioridad;
  estado: EstadoRequerimiento;
  hhTotal: number | null;
  /** Fecha de registro (yyyy-MM-dd). */
  fechaRegistro: string;
  /** Motivo del rechazo; solo cuando estado = RECHAZADO. */
  motivoRechazo?: string | null;
}

/** Respuesta de PUT /api/requerimientos/{id}/estimacion. */
export interface Estimacion {
  requerimientoId: number;
  codigo: string;
  estado: EstadoRequerimiento;
  hhAnalisis: number;
  hhDesarrollo: number;
  hhPruebas: number;
  hhDocumentacion: number;
  hhTotal: number;
}

/** Cuerpo de PATCH /api/requerimientos/{id}/decision. */
export interface Decision {
  decision: 'APROBADO' | 'RECHAZADO';
  motivo?: string;
}

/** Respuesta de PATCH /api/requerimientos/{id}/decision. */
export interface DecisionResultado {
  requerimientoId: number;
  codigo: string;
  estado: EstadoRequerimiento;
  motivoRechazo: string | null;
}
