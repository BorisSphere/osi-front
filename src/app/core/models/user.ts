/** Debe coincidir con la restricción CK_LAB_USUARIO_ROL de Oracle. */
export type Rol = 'ANALISTA' | 'COORDINADOR' | 'APROBADOR';

export const ROL_LABEL: Record<Rol, string> = {
  ANALISTA: 'Analista',
  COORDINADOR: 'Coordinador',
  APROBADOR: 'Aprobador',
};

/** Usuario tal como lo devuelve osi-back (sin datos sensibles). */
export interface UsuarioAuth {
  id: number;
  username: string;
  rol: Rol;
  activo: boolean;
}

/** Datos que muestra la interfaz (menú de usuario). */
export interface User {
  name: string;
  role: string;
}
