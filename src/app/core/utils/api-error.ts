import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../auth/auth.models';

/**
 * Mensaje legible de un error del back (ErrorResponse de osi-back). Si hay errores por campo
 * (400 de validación) se muestran esos, que son más específicos que el "Datos inválidos" general.
 */
export function mensajeDeError(err: unknown, porDefecto = 'Ocurrió un error. Intente nuevamente.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. Verifique que osi-back esté en ejecución.';
    }
    const body = err.error as Partial<ApiError> | null;
    const campos = body?.campos ? Object.values(body.campos) : [];
    if (campos.length) {
      return campos.join(' ');
    }
    if (body?.message) {
      return body.message;
    }
  }
  return porDefecto;
}
