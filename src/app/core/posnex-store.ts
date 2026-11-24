import { Injectable, signal } from '@angular/core';
import { BusinessResponse } from './business-api.models';

export interface Product { id: string; name: string; brand: string; category: string; sku: string; barcode: string; cost: number; price: number; stock: number; minStock: number; image: string; }
export interface Sale { id: string; date: string; customer: string; method: string; total: number; items: number; }
export interface Tenant { id: string; name: string; owner: string; email: string; trade: string; subtype: string; logo?: string; colors: { primary: string; secondary: string; accent: string }; theme: 'light'|'dark'; }
export interface MenuItem { id:string; name:string; category:string; description:string; price:number; available:boolean; }
export interface Waiter { id:string; name:string; phone:string; active:boolean; }
export type OrderStatus='Nuevo'|'En preparación'|'Listo'|'Entregado'|'Cancelado';
export interface RestaurantOrder { id:string; number:number; table:string; waiterId:string; waiterName:string; items:{menuItemId:string;name:string;quantity:number;price:number}[]; total:number; note?:string; status:OrderStatus; createdAt:string; }

const emptyTenant: Tenant = {
  id: '', name: '', owner: '', email: '', trade: '', subtype: '',
  colors: { primary: '#171614', secondary: '#c5a66d', accent: '#8d7350' }, theme: 'light'
};
export interface BusinessPrefs { accent: string; theme: 'light'|'dark'; logo?: string; subtype?: string; }

const ACTIVE_BUSINESS_KEY = 'posnex:active-business';
const prefsKey = (businessId: string) => `posnex:business:${businessId}:prefs`;

@Injectable()
export class PosnexStore {
  readonly tenant = signal(this.readTenant());
  readonly products = signal<Product[]>([]);
  readonly sales = signal<Sale[]>([]);
  readonly customers = signal<string[]>([]);
  readonly restaurantMenu = signal<MenuItem[]>([]);
  readonly restaurantOrders = signal<RestaurantOrder[]>([]);
  readonly waiters = signal<Waiter[]>([]);

  constructor() {
    this.removeLocalDemoRecords();
    // El negocio activo ahora vive por pestaña junto con la sesión; se descarta la clave anterior.
    try { localStorage.removeItem('posnex:tenant'); } catch { /* Storage is optional. */ }
  }

  private readTenant(): Tenant {
    try {
      const saved = sessionStorage.getItem(ACTIVE_BUSINESS_KEY);
      if (!saved) return emptyTenant;
      const tenant = JSON.parse(saved) as Tenant;
      return tenant?.id ? tenant : emptyTenant;
    } catch {
      return emptyTenant;
    }
  }

  private removeLocalDemoRecords(): void {
    try {
      const keysToRemove: string[] = [];
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key && /^posnex:tenant:[^:]+:(products|sales|customers|menu|orders|waiters)$/.test(key)) keysToRemove.push(key);
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
      // Las pantallas pueden iniciar vacías cuando el navegador no permite usar almacenamiento.
    }
  }

  /** Convierte un negocio de la API en el contexto de interfaz, completando lo que aún no persiste el servidor. */
  tenantFromBusiness(business: BusinessResponse, accountEmail: string): Tenant {
    const prefs = this.readBusinessPrefs(business.id);
    const restaurant = business.type === 'Restaurant';
    return {
      id: business.id,
      name: business.name,
      owner: accountEmail.split('@')[0] || accountEmail,
      email: accountEmail,
      trade: restaurant ? 'Restaurante' : 'Comercio',
      subtype: restaurant ? 'Restaurante' : prefs?.subtype || 'Comercio electrónico',
      logo: prefs?.logo || business.logoUrl || undefined,
      colors: { primary: business.primaryColor, secondary: business.secondaryColor, accent: prefs?.accent || emptyTenant.colors.accent },
      theme: prefs?.theme || 'light'
    };
  }

  /** Acento, tema, logotipo y subtipo todavía no se guardan en la API: se conservan en este dispositivo. */
  saveBusinessPrefs(businessId: string, prefs: BusinessPrefs): void {
    try { localStorage.setItem(prefsKey(businessId), JSON.stringify(prefs)); } catch { /* Storage is optional. */ }
  }

  private readBusinessPrefs(businessId: string): BusinessPrefs | null {
    try {
      const saved = localStorage.getItem(prefsKey(businessId));
      return saved ? JSON.parse(saved) as BusinessPrefs : null;
    } catch {
      return null;
    }
  }

  saveTenant(tenant: Tenant): void {
    this.tenant.set(tenant);
    try { sessionStorage.setItem(ACTIVE_BUSINESS_KEY, JSON.stringify(tenant)); } catch { /* Storage is optional. */ }
    this.resetOperationalData();
  }

  clearTenant(): void {
    this.tenant.set(emptyTenant);
    try { sessionStorage.removeItem(ACTIVE_BUSINESS_KEY); } catch { /* Storage is optional. */ }
    this.resetOperationalData();
  }

  private resetOperationalData(): void {
    this.products.set([]);
    this.sales.set([]);
    this.customers.set([]);
    this.restaurantMenu.set([]);
    this.restaurantOrders.set([]);
    this.waiters.set([]);
  }

  saveProducts(products: Product[]): void { this.products.set(products); }
  saveSales(sales: Sale[]): void { this.sales.set(sales); }
  addSale(sale: Sale): void { this.saveSales([sale, ...this.sales()]); }
  saveMenu(items: MenuItem[]): void { this.restaurantMenu.set(items); }
  saveWaiters(items: Waiter[]): void { this.waiters.set(items); }
  saveRestaurantOrders(items: RestaurantOrder[]): void { this.restaurantOrders.set(items); }
}
