import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { MainLayout } from './layout/main-layout/main-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'aplicaciones', loadComponent: () => import('./pages/aplicaciones/aplicaciones').then((m) => m.Aplicaciones) },
      { path: 'requerimientos', loadComponent: () => import('./pages/requerimientos/requerimientos').then((m) => m.Requerimientos) },
      { path: 'estimaciones', loadComponent: () => import('./pages/estimaciones/estimaciones').then((m) => m.Estimaciones) },
      { path: 'aprobaciones', loadComponent: () => import('./pages/aprobaciones/aprobaciones').then((m) => m.Aprobaciones) },
      { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes').then((m) => m.Reportes) },
      { path: 'administracion', loadComponent: () => import('./pages/administracion/administracion').then((m) => m.Administracion) },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
