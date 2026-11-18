import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { BusinessResponse, CreateBusinessRequest } from './business-api.models';

@Injectable({ providedIn: 'root' })
export class BusinessApiService {
  private readonly baseUrl = 'http://localhost:5071/api/v1/businesses';

  constructor(private readonly http: HttpClient, private readonly auth: AuthApiService) {}

  create(request: CreateBusinessRequest): Observable<BusinessResponse> {
    const token = this.auth.accessToken();
    if (!token) throw new Error('Inicia sesión antes de registrar un negocio.');
    return this.http.post<BusinessResponse>(this.baseUrl, request, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    });
  }
}
