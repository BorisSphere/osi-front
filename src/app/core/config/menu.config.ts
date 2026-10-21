import { MenuItem } from '../models/menu-item';

export const MAIN_MENU: MenuItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'home' },
  { label: 'Aplicaciones', path: '/aplicaciones', icon: 'apps' },
  { label: 'Requerimientos', path: '/requerimientos', icon: 'document' },
  { label: 'Estimaciones', path: '/estimaciones', icon: 'calculator' },
  { label: 'Aprobaciones', path: '/aprobaciones', icon: 'check-circle' },
  { label: 'Reportes', path: '/reportes', icon: 'chart' },
  { label: 'Administración', path: '/administracion', icon: 'settings', permiso: 'AUDITORIA_VER' },
];
