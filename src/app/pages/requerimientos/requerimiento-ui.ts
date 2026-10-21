import { HttpErrorResponse } from '@angular/common/http';
import { BadgeTone } from '../../shared/components/status-badge/status-badge';
import { EstadoRequerimiento, PrioridadRequerimiento } from '../../core/models/requerimiento';

export const ESTADO_TONE: Record<EstadoRequerimiento, BadgeTone> = {
  REGISTRADO: 'neutral',
  ESTIMADO: 'info',
  APROBADO: 'success',
  RECHAZADO: 'danger',
};

export const PRIORIDAD_TONE: Record<PrioridadRequerimiento, BadgeTone> = {
  BAJA: 'neutral',
  MEDIA: 'warning',
  ALTA: 'danger',
};

/** Convierte yyyy-MM-dd en dd/MM/yyyy sin pasar por Date (evita desfases de zona horaria). */
export function formatDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
}

/** Mensaje legible a partir del error de osi-back (ErrorResponse). */
export function mensajeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Ocurrió un error inesperado.';
  if (error.status === 0) return 'No se pudo conectar con el servidor.';
  const body = error.error as { message?: string; campos?: Record<string, string> | null } | null;
  const campos = body?.campos ? Object.values(body.campos).join(' ') : '';
  return [body?.message, campos].filter(Boolean).join(' ') || 'No se pudo completar la operación.';
}
