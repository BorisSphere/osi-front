import { Injectable, signal } from '@angular/core';
import { Requerimiento } from '../models/requerimiento';

// Datos de ejemplo hasta conectar con osi-back.
const REQUERIMIENTOS_MOCK: Requerimiento[] = [
  {
    codigo: 'REQ-2025-001',
    aplicacion: 'SIGED',
    titulo: 'Implementar módulo de reportes',
    tipo: 'Evolutivo',
    prioridad: 'Alta',
    fechaRequerida: '2025-04-30',
    fechaRegistro: '2025-04-01',
    solicitante: 'María Torres',
    descripcion: 'Desarrollo de nuevos reportes para la gestión documental.',
    detalleTecnico: 'Reportes en PDF y Excel con filtros por fecha, área y tipo de documento.',
    estado: 'En estimación',
    archivos: [],
  },
  {
    codigo: 'REQ-2025-002',
    aplicacion: 'SICAM',
    titulo: 'Corregir cálculo de coordenadas',
    tipo: 'Correctivo',
    prioridad: 'Crítica',
    fechaRequerida: '2025-04-15',
    fechaRegistro: '2025-04-03',
    solicitante: 'Luis Quispe',
    descripcion: 'Las coordenadas UTM se muestran desfasadas en el visor.',
    detalleTecnico: 'Revisar la conversión de datum WGS84 a PSAD56.',
    estado: 'En ejecución',
    archivos: [],
  },
  {
    codigo: 'REQ-2025-003',
    aplicacion: 'FISE',
    titulo: 'Integración con servicio de identidad',
    tipo: 'Adaptativo',
    prioridad: 'Media',
    fechaRequerida: '2025-06-10',
    fechaRegistro: '2025-04-07',
    solicitante: 'Ana Rojas',
    descripcion: 'Reemplazar el login propio por el servicio de identidad institucional.',
    detalleTecnico: 'Integración OAuth2 / OpenID Connect.',
    estado: 'En aprobación',
    archivos: [],
  },
  {
    codigo: 'REQ-2025-004',
    aplicacion: 'GPA',
    titulo: 'Nuevo filtro de expedientes',
    tipo: 'Evolutivo',
    prioridad: 'Baja',
    fechaRequerida: '2025-07-01',
    fechaRegistro: '2025-04-10',
    solicitante: 'Carlos Díaz',
    descripcion: 'Agregar filtro por estado y responsable en la bandeja de expedientes.',
    detalleTecnico: '',
    estado: 'Registrado',
    archivos: [],
  },
  {
    codigo: 'REQ-2025-005',
    aplicacion: 'PVO',
    titulo: 'Actualizar librería de captcha',
    tipo: 'Correctivo',
    prioridad: 'Media',
    fechaRequerida: '2025-03-20',
    fechaRegistro: '2025-03-05',
    solicitante: 'María Torres',
    descripcion: 'La versión actual del captcha quedó fuera de soporte.',
    detalleTecnico: 'Migrar a reCAPTCHA v3.',
    estado: 'Finalizado',
    archivos: [],
  },
  {
    codigo: 'REQ-2025-006',
    aplicacion: 'MOVIL',
    titulo: 'Modo sin conexión para inspecciones',
    tipo: 'Evolutivo',
    prioridad: 'Alta',
    fechaRequerida: '2025-08-15',
    fechaRegistro: '2025-04-12',
    solicitante: 'Luis Quispe',
    descripcion: 'Permitir registrar inspecciones sin cobertura y sincronizar después.',
    detalleTecnico: 'Almacenamiento local con cola de sincronización.',
    estado: 'Registrado',
    archivos: [],
  },
];

@Injectable({ providedIn: 'root' })
export class RequerimientoService {
  private readonly _items = signal<Requerimiento[]>(REQUERIMIENTOS_MOCK);
  readonly items = this._items.asReadonly();

  get(codigo: string): Requerimiento | undefined {
    return this._items().find((r) => r.codigo === codigo);
  }

  create(data: Omit<Requerimiento, 'codigo' | 'fechaRegistro' | 'estado'>): Requerimiento {
    const year = new Date().getFullYear();
    const max = this._items().reduce((acc, r) => Math.max(acc, Number(r.codigo.split('-').pop()) || 0), 0);
    const nuevo: Requerimiento = {
      ...data,
      codigo: `REQ-${year}-${String(max + 1).padStart(3, '0')}`,
      fechaRegistro: new Date().toISOString().slice(0, 10),
      estado: 'Registrado',
    };
    this._items.update((list) => [nuevo, ...list]);
    return nuevo;
  }

  update(codigo: string, changes: Partial<Omit<Requerimiento, 'codigo'>>): void {
    this._items.update((list) => list.map((r) => (r.codigo === codigo ? { ...r, ...changes } : r)));
  }

  remove(codigo: string): void {
    this._items.update((list) => list.filter((r) => r.codigo !== codigo));
  }
}
