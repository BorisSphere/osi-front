/** Debe coincidir con la restricción CK_LAB_USUARIO_ROL de Oracle. */
export type Rol = 'ANALISTA' | 'COORDINADOR' | 'APROBADOR';

export const ROL_LABEL: Record<Rol, string> = {
  ANALISTA: 'Analista',
  COORDINADOR: 'Coordinador',
  APROBADOR: 'Aprobador',
};

/** Acciones del sistema. Debe coincidir con el enum Permiso de osi-back. */
export type Permiso =
  | 'CATALOGO_VER'
  | 'CATALOGO_GESTIONAR'
  | 'REQUERIMIENTO_CREAR'
  | 'REQUERIMIENTO_MODIFICAR'
  | 'REQUERIMIENTO_ELIMINAR'
  | 'ESTIMACION_GUARDAR'
  | 'REQUERIMIENTO_APROBAR'
  | 'AUDITORIA_VER'
  | 'USUARIO_ADMINISTRAR';

/** Usuario tal como lo devuelve osi-back (sin datos sensibles). */
export interface UsuarioAuth {
  id: number;
  username: string;
  rol: Rol;
  activo: boolean;
  /** Permisos del rol, calculados por el backend (matriz de permisos). */
  permisos: Permiso[];
}

/** Datos que muestra la interfaz (menú de usuario). */
export interface User {
  name: string;
  role: string;
}
