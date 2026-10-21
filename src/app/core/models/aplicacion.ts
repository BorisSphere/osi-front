/** Aplicación tal como la devuelve osi-back (GET /api/aplicaciones). */
export interface Aplicacion {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  tecnologiaActual: string | null;
  tecnologiaObjetivo: string | null;
  activo: boolean;
}

/** Cuerpo de POST /api/aplicaciones y PUT /api/aplicaciones/{id}. */
export interface AplicacionRequest {
  nombre: string;
  descripcion: string;
  tecnologiaActual: string | null;
  tecnologiaObjetivo: string | null;
  activo: boolean;
}
