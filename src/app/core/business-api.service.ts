import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { BusinessResponse, CreateBusinessRequest } from './business-api.models';

/** Negocios del usuario autenticado. El token lo agrega authInterceptor y el servidor filtra por propietario. */
@Injectable({ providedIn: 'root' })
export class BusinessApiService {
  private readonly baseUrl = `${API_BASE_URL}/businesses`;

  constructor(private readonly http: HttpClient) {}

  list(): Observable<BusinessResponse[]> {
    return this.http.get<BusinessResponse[]>(this.baseUrl);
  }

  create(request: CreateBusinessRequest): Observable<BusinessResponse> {
    return this.http.post<BusinessResponse>(this.baseUrl, request);
  }
}
