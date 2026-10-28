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

/** Reporte guardado en Alfresco (GET /api/reportes/archivados). */
export interface ReporteArchivado {
  id: string;
  nombre: string;
  titulo: string | null;
  /** Filtros aplicados y quién lo archivó. */
  descripcion: string | null;
  fecha: string | null; // ISO 8601
  tamanio: number | null; // bytes
}

/** Respuesta de GET /api/reportes/seguimiento?desde=&hasta=&aplicacion= */
export interface Seguimiento {
  total: number;
  porEstado: Record<EstadoRequerimiento, number>;
  hhAprobadas: number;
  porAplicacion: SeguimientoAplicacion[];
}
