/** Aplicación tal como la devuelve osi-back (GET /api/aplicaciones). */
export interface Aplicacion {
  id: number;
  codigo: string;
  nombre: string;
  /** Puede venir vacía en aplicaciones registradas antes de agregar la columna. */
  descripcion: string | null;
  tecnologiaActual: string | null;
  tecnologiaObjetivo: string | null;
  activo: boolean;
}

/** Cuerpo de POST/PUT /api/aplicaciones. El código lo asigna el backend. */
export type AplicacionRequest = Omit<Aplicacion, 'id' | 'codigo'>;
