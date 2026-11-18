import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { DashboardPage, OnboardingPage, InventoryPage, PosPage, SalesPage, SimplePage } from './pages/pages.component';
import { WelcomePage } from './pages/welcome.component';
import { RestaurantDashboardPage, RestaurantMenuPage, RestaurantOrdersPage, RestaurantPosPage, WaitersPage } from './pages/restaurant-pages.component';
import { PosnexStore } from './core/posnex-store';

const requireBusiness: CanActivateFn = () => {
  const store = inject(PosnexStore);
  return store.tenant().id ? true : inject(Router).parseUrl('/');
};

export const routes: Routes = [
  { path: '', component: WelcomePage },
  { path: 'welcome', redirectTo: '' },
  { path: 'onboarding', component: OnboardingPage },
  { path: 'dashboard', component: DashboardPage, canActivate: [requireBusiness] },
  { path: 'perfumeria', redirectTo: 'dashboard' },
  { path: 'restaurant/dashboard', component: RestaurantDashboardPage, canActivate: [requireBusiness] },
  { path: 'restaurant/pos', component: RestaurantPosPage, canActivate: [requireBusiness] },
  { path: 'restaurant/orders', component: RestaurantOrdersPage, canActivate: [requireBusiness] },
  { path: 'restaurant/menu', component: RestaurantMenuPage, canActivate: [requireBusiness] },
  { path: 'restaurant/waiters', component: WaitersPage, canActivate: [requireBusiness] },
  { path: 'inventory', component: InventoryPage, canActivate: [requireBusiness] },
  { path: 'pos', component: PosPage, canActivate: [requireBusiness] },
  { path: 'sales', component: SalesPage, canActivate: [requireBusiness] },
  { path: 'customers', component: SimplePage, canActivate: [requireBusiness], data: { title: 'Clientes', icon: 'pi-users', text: 'Administra la información y el historial de compra de tus clientes.' } },
  { path: 'suppliers', component: SimplePage, canActivate: [requireBusiness], data: { title: 'Proveedores', icon: 'pi-truck', text: 'Mantén organizados tus proveedores y datos de contacto.' } },
  { path: 'orders', component: SimplePage, canActivate: [requireBusiness], data: { title: 'Pedidos', icon: 'pi-inbox', text: 'Administra los pedidos de tu negocio.' } },
  { path: 'expenses', component: SimplePage, canActivate: [requireBusiness], data: { title: 'Gastos', icon: 'pi-wallet', text: 'Registra y clasifica los gastos de tu negocio.' } },
  { path: 'reports', component: SimplePage, canActivate: [requireBusiness], data: { title: 'Reportes', icon: 'pi-chart-bar', text: 'Analiza ventas, ingresos y movimientos de inventario.' } },
  { path: 'employees', component: SimplePage, canActivate: [requireBusiness], data: { title: 'Empleados', icon: 'pi-id-card', text: 'Gestiona usuarios y roles de tu negocio.' } },
  { path: 'integrations', component: SimplePage, canActivate: [requireBusiness], data: { title: 'Integraciones', icon: 'pi-share-alt', text: 'Conexiones disponibles para configurar en una futura versión.' } },
  { path: 'settings', component: SimplePage, canActivate: [requireBusiness], data: { title: 'Configuración', icon: 'pi-cog', text: 'Personaliza la identidad y preferencias de tu empresa.' } },
  { path: '**', redirectTo: '' }
];

