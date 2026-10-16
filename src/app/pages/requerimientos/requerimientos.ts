import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ESTADOS_REQUERIMIENTO, Requerimiento } from '../../core/models/requerimiento';
import { RequerimientoService } from '../../core/services/requerimiento.service';
import { Button } from '../../shared/components/button/button';
import { Icon } from '../../shared/components/icon/icon';
import { IconButton } from '../../shared/components/icon-button/icon-button';
import { PageHeader } from '../../shared/components/page-header/page-header';
import { Pagination } from '../../shared/components/pagination/pagination';
import { SearchInput } from '../../shared/components/search-input/search-input';
import { Select, SelectOption } from '../../shared/components/select/select';
import { StatusBadge } from '../../shared/components/status-badge/status-badge';
import { ESTADO_TONE, PRIORIDAD_TONE, formatDate } from './requerimiento-ui';

@Component({
  selector: 'app-requerimientos',
  imports: [RouterLink, PageHeader, Button, Icon, IconButton, SearchInput, Select, StatusBadge, Pagination],
  templateUrl: './requerimientos.html',
})
export class Requerimientos {
  private readonly service = inject(RequerimientoService);
  private readonly router = inject(Router);

  protected readonly pageSize = 5;
  protected readonly estadoOptions: SelectOption[] = [
    { value: '', label: 'Todos los estados' },
    ...ESTADOS_REQUERIMIENTO.map((e) => ({ value: e, label: e })),
  ];
  protected readonly estadoTone = ESTADO_TONE;
  protected readonly prioridadTone = PRIORIDAD_TONE;
  protected readonly formatDate = formatDate;

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
    return this.service
      .items()
      .filter(
        (r) =>
          (!estado || r.estado === estado) &&
          (!term ||
            r.codigo.toLowerCase().includes(term) ||
            r.titulo.toLowerCase().includes(term) ||
            r.aplicacion.toLowerCase().includes(term)),
      );
  });

  protected readonly paged = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  protected ver(r: Requerimiento): void {
    this.router.navigate(['/requerimientos', r.codigo]);
  }

  protected editar(r: Requerimiento): void {
    this.router.navigate(['/requerimientos', r.codigo], { queryParams: { editar: 1 } });
  }

  protected eliminar(r: Requerimiento): void {
    if (confirm(`¿Eliminar el requerimiento ${r.codigo}?`)) {
      this.service.remove(r.codigo);
      // Evita quedarse en una página que ya no existe.
      const lastPage = Math.max(1, Math.ceil(this.filtered().length / this.pageSize));
      if (this.page() > lastPage) this.page.set(lastPage);
    }
  }
}
