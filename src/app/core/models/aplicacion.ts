export type EstadoAplicacion = 'Activa' | 'Inactiva';

export interface Aplicacion {
  codigo: string;
  nombre: string;
  descripcion: string;
  tecnologia: string;
  estado: EstadoAplicacion;
}

export interface AplicacionApi {
  id: number;
  codigo: string;
  nombre: string;
  activo: boolean;
}
