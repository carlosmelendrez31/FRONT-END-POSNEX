export type ApiBusinessType = 'Ecommerce' | 'Restaurant';

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
}

export interface CreateBusinessRequest {
  name: string;
  type: ApiBusinessType;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}

export interface BusinessResponse {
  id: string;
  name: string;
  type: ApiBusinessType;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
