import { EstadoRequerimiento } from './estimacion';

/** Respuesta de GET /api/dashboard/resumen. */
export interface DashboardResumen {
  aplicaciones: number;
  requerimientos: number;
  porEstado: Record<EstadoRequerimiento, number>;
  hhAprobadas: number;
  porAplicacion: { aplicacion: string; cantidad: number }[];
}
