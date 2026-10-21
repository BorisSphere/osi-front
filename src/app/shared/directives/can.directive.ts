import { Directive, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Permiso } from '../../core/models/user';

/**
 * Muestra el elemento solo si el usuario tiene el permiso (o alguno de la lista).
 * Uso: `<button *appCan="'REQUERIMIENTO_CREAR'">Nuevo</button>`.
 * Solo adapta la interfaz: el backend responde 403 igual si se llama al endpoint sin permiso.
 */
@Directive({ selector: '[appCan]' })
export class CanDirective {
  private readonly auth = inject(AuthService);
  private readonly template = inject(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  readonly appCan = input.required<Permiso | Permiso[]>();

  private visible = false;

  constructor() {
    effect(() => {
      const permitido = this.auth.can(this.appCan());
      if (permitido && !this.visible) {
        this.container.createEmbeddedView(this.template);
      } else if (!permitido && this.visible) {
        this.container.clear();
      }
      this.visible = permitido;
    });
  }
}
