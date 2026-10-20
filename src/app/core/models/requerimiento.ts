export type EstadoRequerimiento = 'REGISTRADO' | 'ESTIMADO' | 'APROBADO' | 'RECHAZADO';
export type PrioridadRequerimiento = 'BAJA' | 'MEDIA' | 'ALTA';

export const ESTADOS_REQUERIMIENTO: EstadoRequerimiento[] = ['REGISTRADO', 'ESTIMADO', 'APROBADO', 'RECHAZADO'];
export const PRIORIDADES: PrioridadRequerimiento[] = ['BAJA', 'MEDIA', 'ALTA'];
export const TIPOS_REQUERIMIENTO = ['Correctivo', 'Evolutivo', 'Adaptativo'];

export const ESTADO_LABEL: Record<EstadoRequerimiento, string> = {
  REGISTRADO: 'Registrado',
  ESTIMADO: 'Estimado',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
};

export const PRIORIDAD_LABEL: Record<PrioridadRequerimiento, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
};

export interface Requerimiento {
  id: number;
  codigo: string;
  aplicacionId: number;
  aplicacion: string;
  titulo: string;
  tipo: string;
  prioridad: PrioridadRequerimiento;
  /** Formato yyyy-MM-dd; vacío si no se registró. */
  fechaRequerida: string;
  /** Formato yyyy-MM-dd. */
  fechaRegistro: string;
  solicitante: string;
  descripcion: string;
  detalleTecnico: string;
  estado: EstadoRequerimiento;
  /** Nombre del archivo adjunto; null si no tiene. */
  archivoNombre: string | null;
}

/** Cuerpo de POST /api/requerimientos y PUT /api/requerimientos/{id}. */
export interface RequerimientoForm {
  aplicacionId: number;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadRequerimiento;
  tipo: string;
  fechaRequerida: string;
  detalleTecnico: string;
}
