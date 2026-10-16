import { BadgeTone } from '../../shared/components/status-badge/status-badge';
import { EstadoRequerimiento, PrioridadRequerimiento } from '../../core/models/requerimiento';

export const ESTADO_TONE: Record<EstadoRequerimiento, BadgeTone> = {
  Registrado: 'neutral',
  'En estimación': 'info',
  'En aprobación': 'warning',
  'En ejecución': 'info',
  Finalizado: 'success',
};

export const PRIORIDAD_TONE: Record<PrioridadRequerimiento, BadgeTone> = {
  Baja: 'neutral',
  Media: 'warning',
  Alta: 'danger',
  Crítica: 'danger',
};

/** Convierte yyyy-MM-dd en dd/MM/yyyy sin pasar por Date (evita desfases de zona horaria). */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}
