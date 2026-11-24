import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthApiService } from './auth-api.service';
import { PosnexStore } from './posnex-store';

/**
 * Adjunta el bearer token a las llamadas de la API POSNEX (excepto /auth).
 * Ante un 401 intenta renovar el token una vez; si no se puede, cierra la sesión y envía al login.
 */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(API_BASE_URL) || request.url.startsWith(`${API_BASE_URL}/auth/`)) return next(request);

  const auth = inject(AuthApiService);
  const store = inject(PosnexStore);
  const router = inject(Router);
  const withToken = (req: HttpRequest<unknown>, token: string | null) =>
    token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(withToken(request, auth.accessToken())).pipe(
    catchError(error => {
      if (!(error instanceof HttpErrorResponse) || error.status !== 401 || !auth.isAuthenticated()) return throwError(() => error);
      return auth.refresh().pipe(
        switchMap(token => next(withToken(request, token))),
        catchError(() => {
          auth.logout();
          store.clearTenant();
          router.navigateByUrl('/login');
          return throwError(() => error);
        })
      );
    })
  );
};
