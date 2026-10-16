import { Component } from '@angular/core';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-reportes',
  imports: [PageHeader, EmptyState],
  templateUrl: './reportes.html',
})
export class Reportes {}
