import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { LoginResponse, RegisterRequest } from './business-api.models';

interface StoredSession {
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const SESSION_KEY = 'posnex:session';

/**
 * Sesión de usuario con ASP.NET Core Identity (bearer token).
 * Se guarda en sessionStorage: sobrevive a recargas de la pestaña y se descarta al cerrarla.
 */
@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly baseUrl = `${API_BASE_URL}/auth`;
  private readonly session = signal<StoredSession | null>(this.readSession());

  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly email = computed(() => this.session()?.email ?? '');
  readonly isAuthenticated = computed(() => this.session() !== null);

  constructor(private readonly http: HttpClient) {}

  login(credentials: RegisterRequest): Observable<void> {
    const email = credentials.email.trim();
    return this.http.post<LoginResponse>(`${this.baseUrl}/login?useCookies=false`, { email, password: credentials.password }).pipe(
      tap(response => this.saveSession(email, response)),
      map(() => undefined)
    );
  }

  register(credentials: RegisterRequest): Observable<void> {
    const email = credentials.email.trim();
    return this.http.post<void>(`${this.baseUrl}/register`, { email, password: credentials.password }).pipe(
      switchMap(() => this.login({ email, password: credentials.password }))
    );
  }

  /** Renueva el access token con el refresh token. Devuelve el nuevo access token. */
  refresh(): Observable<string> {
    const current = this.session();
    if (!current) return throwError(() => new Error('No hay sesión activa.'));
    return this.http.post<LoginResponse>(`${this.baseUrl}/refresh`, { refreshToken: current.refreshToken }).pipe(
      tap(response => this.saveSession(current.email, response)),
      map(response => response.accessToken)
    );
  }

  logout(): void {
    this.session.set(null);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Storage is optional. */ }
  }

  private saveSession(email: string, response: LoginResponse): void {
    const session: StoredSession = {
      email,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresAt: Date.now() + response.expiresIn * 1000
    };
    this.session.set(session);
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch { /* Storage is optional. */ }
  }

  private readSession(): StoredSession | null {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (!saved) return null;
      const session = JSON.parse(saved) as StoredSession;
      return session?.accessToken && session.refreshToken && session.email ? session : null;
    } catch {
      return null;
    }
  }
}
