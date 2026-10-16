import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './core/auth/auth.guards';
import { MainLayout } from './layout/main-layout/main-layout';
import { Login } from './pages/login/login';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'aplicaciones', loadComponent: () => import('./pages/aplicaciones/aplicaciones').then((m) => m.Aplicaciones) },
      { path: 'requerimientos', loadComponent: () => import('./pages/requerimientos/requerimientos').then((m) => m.Requerimientos) },
      {
        path: 'requerimientos/nuevo',
        loadComponent: () => import('./pages/requerimientos/requerimiento-nuevo/requerimiento-nuevo').then((m) => m.RequerimientoNuevo),
      },
      {
        path: 'requerimientos/:codigo',
        loadComponent: () =>
          import('./pages/requerimientos/requerimiento-detalle/requerimiento-detalle').then((m) => m.RequerimientoDetalle),
      },
      { path: 'estimaciones', loadComponent: () => import('./pages/estimaciones/estimaciones').then((m) => m.Estimaciones) },
      { path: 'aprobaciones', loadComponent: () => import('./pages/aprobaciones/aprobaciones').then((m) => m.Aprobaciones) },
      { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes').then((m) => m.Reportes) },
      {
        path: 'administracion',
        canActivate: [roleGuard],
        data: { roles: ['COORDINADOR'] },
        loadComponent: () => import('./pages/administracion/administracion').then((m) => m.Administracion),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
