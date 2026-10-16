export type EstadoRequerimiento = 'Registrado' | 'En estimación' | 'En aprobación' | 'En ejecución' | 'Finalizado';
export type PrioridadRequerimiento = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export const ESTADOS_REQUERIMIENTO: EstadoRequerimiento[] = [
  'Registrado',
  'En estimación',
  'En aprobación',
  'En ejecución',
  'Finalizado',
];
export const PRIORIDADES: PrioridadRequerimiento[] = ['Baja', 'Media', 'Alta', 'Crítica'];
export const TIPOS_REQUERIMIENTO = ['Correctivo', 'Evolutivo', 'Adaptativo'];

export interface Requerimiento {
  codigo: string;
  aplicacion: string;
  titulo: string;
  tipo: string;
  prioridad: PrioridadRequerimiento;
  /** Formato yyyy-MM-dd. */
  fechaRequerida: string;
  /** Formato yyyy-MM-dd. */
  fechaRegistro: string;
  solicitante: string;
  descripcion: string;
  detalleTecnico: string;
  estado: EstadoRequerimiento;
  archivos: string[];
}
