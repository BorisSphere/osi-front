import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Aplicacion, EstadoAplicacion } from '../../core/models/aplicacion';
import { AplicacionService } from '../../core/services/aplicacion.service';
import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { IconButton } from '../../shared/components/icon-button/icon-button';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Pagination } from '../../shared/components/pagination/pagination';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { Select, SelectOption } from '../../shared/components/select/select';
import { BadgeTone, StatusBadge } from '../../shared/components/status-badge/status-badge';

const ESTADO_TONE: Record<EstadoAplicacion, BadgeTone> = {
  Activa: 'success',
  Inactiva: 'neutral',
};

@Component({
  selector: 'app-aplicaciones',
  imports: [PageHeader, Button, Icon, IconButton, SearchInput, Select, StatusBadge, Pagination],
  templateUrl: './aplicaciones.html',
})
export class Aplicaciones {
  private readonly aplicaciones = toSignal(inject(AplicacionService).list(), { initialValue: [] });

  protected readonly pageSize = 5;
  protected readonly estadoOptions: SelectOption[] = [
    { value: '', label: 'Todas' },
    { value: 'Activa', label: 'Activas' },
    { value: 'Inactiva', label: 'Inactivas' },
  ];

  protected readonly search = signal('');
  protected readonly estado = signal('');
  // Vuelve a la página 1 cada vez que cambian los filtros.
  protected readonly page = linkedSignal(() => {
    this.search();
    this.estado();
    return 1;
  });

  protected readonly filtered = computed(() => {
    const term = this.search().trim().toLowerCase();
    const estado = this.estado();
    return this.aplicaciones().filter(
      (app) =>
        (!estado || app.estado === estado) &&
        (!term || app.nombre.toLowerCase().includes(term) || app.descripcion.toLowerCase().includes(term)),
    );
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected tone(app: Aplicacion): BadgeTone {
    return ESTADO_TONE[app.estado];
  }
}
