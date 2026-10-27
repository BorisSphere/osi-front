import { Injectable } from '@angular/core';
import type { IPublicClientApplication } from '@azure/msal-browser';
import { ENTRA_CONFIG } from './entra.config';

/** Inicio de sesión con Microsoft (MSAL, Authorization Code + PKCE). Solo obtiene el token para la API. */
@Injectable({ providedIn: 'root' })
export class EntraService {
  private client?: Promise<IPublicClientApplication>;

  /** Abre el popup de Microsoft y devuelve el access token para osi-back. */
  async login(): Promise<string> {
    const client = await this.getClient();
    const result = await client.loginPopup({ scopes: ENTRA_CONFIG.apiScopes, prompt: 'select_account' });
    return result.accessToken;
  }

  /** Borra la caché local de MSAL (no cierra la sesión de Microsoft en el navegador). */
  async clear(): Promise<void> {
    if (this.client) {
      await (await this.client).clearCache();
    }
  }

  private getClient(): Promise<IPublicClientApplication> {
    // Carga diferida: MSAL solo se descarga al usar el login con Microsoft.
    this.client ??= import('@azure/msal-browser').then(({ createStandardPublicClientApplication }) =>
      createStandardPublicClientApplication({
        auth: {
          clientId: ENTRA_CONFIG.clientId,
          authority: ENTRA_CONFIG.authority,
          redirectUri: `${window.location.origin}/redirect.html`,
        },
        cache: { cacheLocation: 'sessionStorage' },
      }),
    );
    return this.client;
  }
}
