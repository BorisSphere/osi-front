import { IconName } from '../../shared/components/icon/icon';
import { Permiso } from './user';

export interface MenuItem {
  label: string;
  path: string;
  icon: IconName;
  /** Permiso necesario para ver la opción. Si se omite, la ven todos los usuarios autenticados. */
  permiso?: Permiso;
}
