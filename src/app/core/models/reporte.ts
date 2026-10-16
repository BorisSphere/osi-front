import { EstadoRequerimiento } from './estimacion';

export interface FiltroSeguimiento {
  desde?: string; // yyyy-MM-dd
  hasta?: string; // yyyy-MM-dd
  aplicacion?: string;
}

/** Fila del resumen por aplicación (vista para coordinación). */
export interface SeguimientoAplicacion {
  aplicacion: string;
  porEstado: Record<EstadoRequerimiento, number>;
  hhAprobadas: number;
}

/** Respuesta de GET /api/reportes/seguimiento?desde=&hasta=&aplicacion= */
export interface Seguimiento {
  total: number;
  porEstado: Record<EstadoRequerimiento, number>;
  hhAprobadas: number;
  porAplicacion: SeguimientoAplicacion[];
}
