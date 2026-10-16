import { UsuarioAuth } from '../models/user';

export interface LoginResponse {
  token: string;
  tipo: string;
  expiraEn: string;
  usuario: UsuarioAuth;
}

export interface ApiError {
  status: number;
  error: string;
  message: string;
  campos?: Record<string, string> | null;
}
