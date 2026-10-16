import { Component, computed, input, model } from '@angular/core';
import { Icon } from '../icon/icon';

/** Paginación con resumen de registros. Uso: `<app-pagination [total]="n" [pageSize]="5" [(page)]="pagina" />`. */
@Component({
  selector: 'app-pagination',
  imports: [Icon],
  templateUrl: './pagination.html',
  host: { class: 'block' },
})
export class Pagination {
  readonly total = input.required<number>();
  readonly pageSize = input(10);
  readonly page = model(1);

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly pages = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
  protected readonly from = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  protected goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.page.set(page);
    }
  }
}
