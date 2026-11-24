import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PosnexStore } from './core/posnex-store';
import { AuthApiService } from './core/auth-api.service';

@Component({ selector:'app-root', standalone:true, imports:[RouterOutlet,RouterLink,RouterLinkActive], template:`
@if(isWelcome()){<router-outlet />} @else {<div class="app-frame" [class.sidebar-small]="collapsed()" [class.dark-theme]="store.tenant().theme==='dark'" [class.restaurant-theme]="store.tenant().trade==='Restaurante'" [style.--tenant-primary]="store.tenant().colors.primary" [style.--tenant-secondary]="store.tenant().colors.secondary" [style.--tenant-accent]="store.tenant().colors.accent">
<aside class="sidebar" [class.mobile-open]="mobileOpen()"><a class="brand" routerLink="/businesses"><span class="brand-mark">P</span><span class="brand-name">posnex<small>BUSINESS OS</small></span></a>
<a class="workspace-switch" routerLink="/businesses" title="Cambiar de negocio"><span class="business-logo" [style.background]="store.tenant().colors.primary" [style.color]="store.tenant().colors.secondary">@if(store.tenant().logo){<img [src]="store.tenant().logo" alt="">} @else {{{store.tenant().name.slice(0,1)}}}</span><span class="workspace-name">{{store.tenant().name}}<small>Cambiar de negocio</small></span><i class="pi pi-sort-alt"></i></a>
<div class="nav-label">ESPACIO DE TRABAJO</div><nav>@for (link of links(); track link.path) {<a class="nav-link" [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="mobileOpen.set(false)"><i class="pi {{link.icon}}"></i><span>{{link.label}}</span>@if(link.path==='inventory' && lowStock()>0){<b class="nav-count">{{lowStock()}}</b>}</a>}</nav>
<div class="sidebar-bottom"><div class="plan-card"><div class="plan-icon"><i class="pi pi-star"></i></div><strong>Tu negocio, en orden.</strong><p>Tu espacio de trabajo está listo para operar.</p><a routerLink="/new">Crear otro negocio <i class="pi pi-arrow-up-right"></i></a></div><a class="nav-link" routerLink="/settings"><i class="pi pi-question-circle"></i><span>Ayuda y soporte</span></a></div></aside>
<main class="main-area"><header class="topbar"><button class="icon-button mobile-menu" (click)="toggleMobile()" aria-label="Abrir menú"><i class="pi pi-bars"></i></button><button class="icon-button collapse-button" (click)="toggleSidebar()" aria-label="Contraer menú"><i class="pi pi-bars"></i></button><div class="crumb"><span>Espacio de trabajo</span><i class="pi pi-angle-right"></i><strong>{{activeTitle()}}</strong></div><div class="top-actions"><label class="search-box"><i class="pi pi-search"></i><input placeholder="Buscar en POSNEX..." aria-label="Buscar"><kbd>⌘ K</kbd></label><span class="connection" [class.offline]="!online()"><span></span> {{online()?'En línea':'Sin conexión'}}</span><button class="icon-button notification" aria-label="Notificaciones"><i class="pi pi-bell"></i><b></b></button><span class="top-divider"></span><span class="profile" [title]="auth.email()"><span class="avatar">{{store.tenant().owner.slice(0,1)}}</span><span class="profile-label">{{store.tenant().owner}}<small>Propietario</small></span></span><button class="icon-button" (click)="logout()" aria-label="Cerrar sesión" title="Cerrar sesión"><i class="pi pi-sign-out"></i></button></div></header><section class="page-wrap"><router-outlet /></section><footer class="footer"><span>© 2026 POSNEX</span><span>Información de tu negocio</span></footer></main></div>}`})
export class AppComponent {
  collapsed=signal(false); mobileOpen=signal(false); online=signal(navigator.onLine);
  restaurantMode=computed(()=>this.store.tenant().trade==='Restaurante');
  isWelcome=computed(()=>!this.store.tenant().id||['/','/welcome','/new','/onboarding','/login','/businesses'].includes(this.activePath()));
  links=computed(()=>this.restaurantMode()?[
    {path:'/restaurant/dashboard',label:'Dashboard',icon:'pi-home'},{path:'/restaurant/pos',label:'Punto de venta',icon:'pi-shopping-cart'},{path:'/restaurant/orders',label:'Pedidos',icon:'pi-receipt'},{path:'/restaurant/menu',label:'Menú',icon:'pi-book'},{path:'/restaurant/waiters',label:'Meseros',icon:'pi-users'},{path:'/customers',label:'Clientes',icon:'pi-user'},{path:'/reports',label:'Reportes',icon:'pi-chart-bar'},{path:'/settings',label:'Configuración',icon:'pi-cog'}
  ]:[
    {path:'/dashboard',label:'Dashboard',icon:'pi-home'},{path:'/pos',label:'Punto de venta',icon:'pi-shopping-bag'},{path:'/sales',label:'Ventas',icon:'pi-receipt'},{path:'/inventory',label:'Inventario',icon:'pi-box'},{path:'/customers',label:'Clientes',icon:'pi-users'},{path:'/suppliers',label:'Proveedores',icon:'pi-truck'},{path:'/orders',label:'Pedidos',icon:'pi-inbox'},{path:'/expenses',label:'Gastos',icon:'pi-wallet'},{path:'/reports',label:'Reportes',icon:'pi-chart-bar'},{path:'/employees',label:'Empleados',icon:'pi-id-card'},{path:'/integrations',label:'Integraciones',icon:'pi-share-alt'},{path:'/settings',label:'Configuración',icon:'pi-cog'}
  ]);
  private activePath=signal(location.pathname);
  private router=inject(Router);
  activeTitle=computed(()=>this.links().find(link=>link.path===this.activePath())?.label??'Dashboard');
  lowStock=computed(()=>this.store.products().filter(p=>p.stock<=p.minStock).length);
  constructor(public store:PosnexStore,public auth:AuthApiService){this.router.events.pipe(filter(event=>event instanceof NavigationEnd)).subscribe(event=>this.activePath.set((event as NavigationEnd).urlAfterRedirects.split(/[?#]/)[0]));}
  logout():void{this.auth.logout();this.store.clearTenant();this.router.navigateByUrl('/login');}
  toggleMobile():void{this.mobileOpen.update(value=>!value);}
  toggleSidebar():void{this.collapsed.update(value=>!value);}
  @HostListener('window:online') onOnline():void{this.online.set(true);}
  @HostListener('window:offline') onOffline():void{this.online.set(false);}
}

