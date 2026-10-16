export type EstadoAplicacion = 'Activa' | 'Inactiva';

export interface Aplicacion {
  codigo: string;
  nombre: string;
  descripcion: string;
  tecnologia: string;
  estado: EstadoAplicacion;
}
