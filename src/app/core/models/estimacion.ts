/** Estados del requerimiento según el motor de estados del laboratorio. */
export type EstadoRequerimiento = 'REGISTRADO' | 'ESTIMADO' | 'APROBADO' | 'RECHAZADO';

export type Prioridad = 'ALTA' | 'MEDIA' | 'BAJA';

/** Datos del requerimiento que necesitan las pantallas de estimación y aprobación. */
export interface RequerimientoResumen {
  id: number;
  codigo: string;
  titulo: string;
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
