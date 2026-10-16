import { Component } from '@angular/core';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { PageHeader } from '../../shared/components/page-header/page-header';

@Component({
  selector: 'app-estimaciones',
  imports: [PageHeader, EmptyState],
  templateUrl: './estimaciones.html',
})
export class Estimaciones {}
