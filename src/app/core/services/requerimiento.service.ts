import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  EstadoRequerimiento,
  PrioridadRequerimiento,
  Requerimiento,
  RequerimientoForm,
} from '../models/requerimiento';

/** Respuesta de osi-back (RequerimientoResponse). */
interface RequerimientoApi {
  id: number;
  codigo: string;
  aplicacion: { id: number; codigo: string; nombre: string };
  titulo: string;
  descripcion: string;
  prioridad: PrioridadRequerimiento;
  estado: EstadoRequerimiento;
  tipo: string | null;
  fechaRequerida: string | null;
  detalleTecnico: string | null;
  archivoNombre: string | null;
  creadoPor: string;
  fechaCreacion: string;
}

/** Convierte un instante ISO a yyyy-MM-dd en hora local. */
function fechaLocal(iso: string): string {
  const d = new Date(iso);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function aModelo(api: RequerimientoApi): Requerimiento {
  return {
    id: api.id,
    codigo: api.codigo,
    aplicacionId: api.aplicacion.id,
    aplicacion: api.aplicacion.nombre,
    titulo: api.titulo,
    tipo: api.tipo ?? '',
    prioridad: api.prioridad,
    fechaRequerida: api.fechaRequerida ?? '',
    fechaRegistro: fechaLocal(api.fechaCreacion),
    solicitante: api.creadoPor,
    descripcion: api.descripcion,
    detalleTecnico: api.detalleTecnico ?? '',
    estado: api.estado,
    archivoNombre: api.archivoNombre,
  };
}

/** Los campos vacíos se envían como null para que el backend los guarde como NULL. */
function aCuerpo(form: RequerimientoForm) {
  return { ...form, fechaRequerida: form.fechaRequerida || null };
}

@Injectable({ providedIn: 'root' })
export class RequerimientoService {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/requerimientos';

  /** GET /api/requerimientos?estado= */
  list(estado?: EstadoRequerimiento): Observable<Requerimiento[]> {
    const params: Record<string, string> = estado ? { estado } : {};
    return this.http.get<RequerimientoApi[]>(this.url, { params }).pipe(map((lista) => lista.map(aModelo)));
  }

  /** GET /api/requerimientos/{id} */
  get(id: number): Observable<Requerimiento> {
    return this.http.get<RequerimientoApi>(`${this.url}/${id}`).pipe(map(aModelo));
  }

  /** POST /api/requerimientos */
  create(form: RequerimientoForm): Observable<Requerimiento> {
    return this.http.post<RequerimientoApi>(this.url, aCuerpo(form)).pipe(map(aModelo));
  }

  /** PUT /api/requerimientos/{id} */
  update(id: number, form: RequerimientoForm): Observable<Requerimiento> {
    return this.http.put<RequerimientoApi>(`${this.url}/${id}`, aCuerpo(form)).pipe(map(aModelo));
  }

  /** DELETE /api/requerimientos/{id} */
  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  /** POST /api/requerimientos/{id}/archivo (multipart); reemplaza el adjunto anterior. */
  adjuntar(id: number, archivo: File): Observable<Requerimiento> {
    const datos = new FormData();
    datos.append('archivo', archivo);
    return this.http.post<RequerimientoApi>(`${this.url}/${id}/archivo`, datos).pipe(map(aModelo));
  }

  /** GET /api/requerimientos/{id}/archivo; se pide como blob porque el Bearer no viaja en un enlace normal. */
  descargar(id: number): Observable<Blob> {
    return this.http.get(`${this.url}/${id}/archivo`, { responseType: 'blob' });
  }
}
