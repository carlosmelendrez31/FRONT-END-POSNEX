import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, switchMap, tap, throwError } from 'rxjs';
import { LoginResponse, RegisterRequest } from './business-api.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly baseUrl = 'http://localhost:5071/api/v1/auth';
  readonly accessToken = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  registerAndLogin(credentials: RegisterRequest): Observable<LoginResponse> {
    const login = () => this.http.post<LoginResponse>(`${this.baseUrl}/login?useCookies=false`, credentials);
    return this.http.post<void>(`${this.baseUrl}/register`, credentials).pipe(
      switchMap(() => login()),
      catchError(error => error.status === 400 ? login() : throwError(() => error)),
      tap(session => this.accessToken.set(session.accessToken))
    );
  }
}
