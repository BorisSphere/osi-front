import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { Aplicacion, AplicacionApi } from '../models/aplicacion';

// Datos de ejemplo hasta conectar con osi-back.
const APLICACIONES_MOCK: Aplicacion[] = [
  { codigo: 'APP001', nombre: 'SIGED', descripcion: 'Sistema de Gestión Documental', tecnologia: 'Java / Oracle', estado: 'Activa' },
  { codigo: 'APP002', nombre: 'SICAM', descripcion: 'Sistema de Catastro de Instalaciones', tecnologia: '.NET / SQL Server', estado: 'Activa' },
  { codigo: 'APP003', nombre: 'FISE', descripcion: 'Fondo de Inclusión Social Energético', tecnologia: 'Java / Oracle', estado: 'Activa' },
  { codigo: 'APP004', nombre: 'GPA', descripcion: 'Gestión de Procesos Administrativos', tecnologia: 'Java / Oracle', estado: 'Activa' },
  { codigo: 'APP005', nombre: 'MOVIL', descripcion: 'Aplicación móvil de inspecciones', tecnologia: 'Java / Android', estado: 'Activa' },
  { codigo: 'APP006', nombre: 'SGF', descripcion: 'Sistema de Gestión de Fiscalización', tecnologia: 'Java / Oracle', estado: 'Activa' },
  { codigo: 'APP007', nombre: 'SCOP', descripcion: 'Sistema de Control de Órdenes de Pedido', tecnologia: '.NET / SQL Server', estado: 'Activa' },
  { codigo: 'APP008', nombre: 'PVO', descripcion: 'Portal Virtual de Osinergmin', tecnologia: 'PHP / MySQL', estado: 'Activa' },
  { codigo: 'APP009', nombre: 'SISEG', descripcion: 'Sistema de Seguridad y Accesos', tecnologia: '.NET / SQL Server', estado: 'Activa' },
  { codigo: 'APP010', nombre: 'SIAF-INT', descripcion: 'Integración con SIAF', tecnologia: 'Java / Oracle', estado: 'Inactiva' },
  { codigo: 'APP011', nombre: 'GEOMIN', descripcion: 'Visor geográfico de minería', tecnologia: 'Angular / PostgreSQL', estado: 'Activa' },
  { codigo: 'APP012', nombre: 'RECLAMOS', descripcion: 'Sistema de atención de reclamos', tecnologia: 'Java / Oracle', estado: 'Inactiva' },
];

@Injectable({ providedIn: 'root' })
export class AplicacionService {
  private readonly http = inject(HttpClient);

  list(): Observable<Aplicacion[]> {
    return of(APLICACIONES_MOCK);
  }

  /** GET /api/aplicaciones: solo las activas, para elegir al registrar un requerimiento. */
  listActivas(): Observable<AplicacionApi[]> {
    return this.http.get<AplicacionApi[]>('/api/aplicaciones').pipe(map((lista) => lista.filter((a) => a.activo)));
  }
}
