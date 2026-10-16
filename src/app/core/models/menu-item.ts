import { IconName } from '../../shared/components/icon/icon';
import { Rol } from './user';

export interface MenuItem {
  label: string;
  path: string;
  icon: IconName;
  /** Roles que ven la opción. Si se omite, la ven todos los usuarios autenticados. */
  roles?: Rol[];
}
