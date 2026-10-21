import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardResumen } from '../../core/models/dashboard';
import { EstadoRequerimiento } from '../../core/models/estimacion';
import { DashboardService } from '../../core/services/dashboard.service';
import { mensajeDeError } from '../../core/utils/api-error';
import { Icon, IconName } from '../../shared/components/icon/icon';
import { PageHeader } from '../../shared/components/page-header/page-header';

/**
 * Orden y colores de los estados. El rojo no va junto al verde para que se distingan
 * con daltonismo (paleta validada); además cada segmento lleva etiqueta y valor.
 */
const ESTADOS: { estado: EstadoRequerimiento; label: string; color: string }[] = [
  { estado: 'REGISTRADO', label: 'Registrado', color: '#3b82f6' },
  { estado: 'APROBADO', label: 'Aprobado', color: '#16a34a' },
  { estado: 'ESTIMADO', label: 'Estimado', color: '#f59e0b' },
  { estado: 'RECHAZADO', label: 'Rechazado', color: '#dc2626' },
];

/** Separación entre segmentos de la dona, en % de la circunferencia. */
const GAP = 0.8;

interface Kpi {
  label: string;
  detalle?: string;
  valor: number;
  /** 'x-circle' se dibuja aquí porque no existe en el componente de íconos compartido. */
  icon: IconName | 'x-circle';
  clase: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [PageHeader, Icon, RouterLink],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  protected readonly resumen = signal<DashboardResumen | null>(null);
  protected readonly error = signal('');

  private readonly carrusel = viewChild<ElementRef<HTMLElement>>('carrusel');

  constructor() {
    inject(DashboardService)
      .resumen()
      .subscribe({
        next: (r) => this.resumen.set(r),
        error: (err) => this.error.set(mensajeDeError(err, 'No se pudo cargar el resumen.')),
      });

    // El carrusel aparece recién cuando llegan los datos: ahí se calculan las flechas y se
    // recalculan si cambia el ancho (ventana o menú lateral colapsado).
    effect((onCleanup) => {
      const el = this.carrusel()?.nativeElement;
      if (!el) return;
      this.actualizarFlechas(el);
      const observer = new ResizeObserver(() => this.actualizarFlechas(el));
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    });
  }

  protected readonly kpis = computed<Kpi[]>(() => {
    const r = this.resumen();
    if (!r) return [];
    return [
      { label: 'Aplicaciones registradas', valor: r.aplicaciones, icon: 'apps', clase: 'border-blue-200 bg-blue-50 text-blue-700' },
      { label: 'Requerimientos totales', valor: r.requerimientos, icon: 'document', clase: 'border-slate-200 bg-white text-slate-800' },
      {
        label: 'En proceso',
        detalle: 'Registrados y estimados',
        valor: r.porEstado.REGISTRADO + r.porEstado.ESTIMADO,
        icon: 'calculator',
        clase: 'border-amber-200 bg-amber-50 text-amber-700',
      },
      {
        label: 'Aprobados',
        detalle: `${r.hhAprobadas} HH aprobadas`,
        valor: r.porEstado.APROBADO,
        icon: 'check-circle',
        clase: 'border-green-200 bg-green-50 text-green-700',
      },
      {
        label: 'Rechazados',
        detalle: 'Pueden corregirse y reenviarse',
        valor: r.porEstado.RECHAZADO,
        icon: 'x-circle',
        clase: 'border-red-200 bg-red-50 text-red-700',
      },
    ];
  });

  // Arrastre con el mouse del carrusel de KPIs.
  private arrastre: { x: number; scroll: number } | null = null;

  protected iniciarArrastre(event: PointerEvent, el: HTMLElement): void {
    if (event.pointerType !== 'mouse') return; // en táctil el scroll nativo ya funciona
    this.arrastre = { x: event.clientX, scroll: el.scrollLeft };
    el.setPointerCapture(event.pointerId);
  }

  protected arrastrar(event: PointerEvent, el: HTMLElement): void {
    if (!this.arrastre) return;
    el.scrollLeft = this.arrastre.scroll - (event.clientX - this.arrastre.x);
  }

  protected terminarArrastre(): void {
    this.arrastre = null;
  }

  // Flechas del carrusel: solo se muestran si hay contenido oculto hacia ese lado.
  protected readonly puedeIzquierda = signal(false);
  protected readonly puedeDerecha = signal(false);

  protected actualizarFlechas(el: HTMLElement): void {
    this.puedeIzquierda.set(el.scrollLeft > 4);
    this.puedeDerecha.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  protected desplazar(el: HTMLElement, direccion: 1 | -1): void {
    el.scrollBy({ left: direccion * (el.clientWidth * 0.8), behavior: 'smooth' });
  }

  /** Segmentos de la dona (círculo de circunferencia 100 → dasharray en %). */
  protected readonly segmentos = computed(() => {
    const r = this.resumen();
    if (!r || r.requerimientos === 0) return [];
    let offset = 0;
    return ESTADOS.map((e) => {
      const valor = r.porEstado[e.estado];
      const pct = (valor / r.requerimientos) * 100;
      const largo = Math.max(pct - GAP, 0);
      const seg = { ...e, valor, pct, dash: `${largo} ${100 - largo}`, offset: 25 - offset };
      offset += pct;
      return seg;
    });
  });

  protected readonly barras = computed(() => {
    const r = this.resumen();
    if (!r) return [];
    const max = Math.max(1, ...r.porAplicacion.map((a) => a.cantidad));
    return [...r.porAplicacion]
      .sort((a, b) => b.cantidad - a.cantidad || a.aplicacion.localeCompare(b.aplicacion))
      .map((a) => ({ ...a, alto: (a.cantidad / max) * 100 }));
  });

  protected readonly accesos: { label: string; path: string; icon: IconName }[] = [
    { label: 'Estimaciones', path: '/estimaciones', icon: 'calculator' },
    { label: 'Aprobaciones', path: '/aprobaciones', icon: 'check-circle' },
    { label: 'Reportes', path: '/reportes', icon: 'chart' },
  ];
}
