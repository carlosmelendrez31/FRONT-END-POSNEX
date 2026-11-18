import { Component, computed, HostListener, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PosnexStore } from './core/posnex-store';

@Component({ selector:'app-root', standalone:true, imports:[RouterOutlet,RouterLink,RouterLinkActive], template:`
@if(isWelcome()){<router-outlet />} @else {<div class="app-frame" [class.sidebar-small]="collapsed()" [class.dark-theme]="store.tenant().theme==='dark'" [class.restaurant-theme]="store.tenant().trade==='Restaurante'" [style.--tenant-primary]="store.tenant().colors.primary" [style.--tenant-secondary]="store.tenant().colors.secondary" [style.--tenant-accent]="store.tenant().colors.accent">
<aside class="sidebar" [class.mobile-open]="mobileOpen()"><a class="brand" routerLink="/"><span class="brand-mark">P</span><span class="brand-name">posnex<small>BUSINESS OS</small></span></a>
<div class="workspace-switch"><span class="business-logo" [style.background]="store.tenant().colors.primary" [style.color]="store.tenant().colors.secondary">@if(store.tenant().logo){<img [src]="store.tenant().logo" alt="">} @else {{{store.tenant().name.slice(0,1)}}}</span><span class="workspace-name">{{store.tenant().name}}<small>Cuenta POSNEX</small></span><i class="pi pi-angle-down"></i></div>
<div class="nav-label">ESPACIO DE TRABAJO</div><nav>@for (link of links(); track link.path) {<a class="nav-link" [routerLink]="link.path" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="mobileOpen.set(false)"><i class="pi {{link.icon}}"></i><span>{{link.label}}</span>@if(link.path==='inventory' && lowStock()>0){<b class="nav-count">{{lowStock()}}</b>}</a>}</nav>
<div class="sidebar-bottom"><div class="plan-card"><div class="plan-icon"><i class="pi pi-star"></i></div><strong>Tu negocio, en orden.</strong><p>Tu espacio de trabajo está listo para operar.</p><a routerLink="/onboarding">Configurar mi negocio <i class="pi pi-arrow-up-right"></i></a></div><a class="nav-link" routerLink="/settings"><i class="pi pi-question-circle"></i><span>Ayuda y soporte</span></a></div></aside>
<main class="main-area"><header class="topbar"><button class="icon-button mobile-menu" (click)="toggleMobile()" aria-label="Abrir menú"><i class="pi pi-bars"></i></button><button class="icon-button collapse-button" (click)="toggleSidebar()" aria-label="Contraer menú"><i class="pi pi-bars"></i></button><div class="crumb"><span>Espacio de trabajo</span><i class="pi pi-angle-right"></i><strong>{{activeTitle()}}</strong></div><div class="top-actions"><label class="search-box"><i class="pi pi-search"></i><input placeholder="Buscar en POSNEX..." aria-label="Buscar"><kbd>⌘ K</kbd></label><span class="connection" [class.offline]="!online()"><span></span> {{online()?'En línea':'Sin conexión'}}</span><button class="icon-button notification" aria-label="Notificaciones"><i class="pi pi-bell"></i><b></b></button><span class="top-divider"></span><button class="profile"><span class="avatar">{{store.tenant().owner.slice(0,1)}}{{store.tenant().owner.split(' ')[1]?.slice(0,1)}}</span><span class="profile-label">{{store.tenant().owner}}<small>Administrador</small></span><i class="pi pi-angle-down"></i></button></div></header><section class="page-wrap"><router-outlet /></section><footer class="footer"><span>© 2026 POSNEX</span><span>Información de tu negocio</span></footer></main></div>}`})
export class AppComponent {
  collapsed=signal(false); mobileOpen=signal(false); online=signal(navigator.onLine);
  restaurantMode=computed(()=>this.store.tenant().trade==='Restaurante');
  isWelcome=computed(()=>!this.store.tenant().id||this.activePath()==='/'||this.activePath()==='/welcome'||this.activePath()==='/onboarding');
  links=computed(()=>this.restaurantMode()?[
    {path:'/restaurant/dashboard',label:'Dashboard',icon:'pi-home'},{path:'/restaurant/pos',label:'Punto de venta',icon:'pi-shopping-cart'},{path:'/restaurant/orders',label:'Pedidos',icon:'pi-receipt'},{path:'/restaurant/menu',label:'Menú',icon:'pi-book'},{path:'/restaurant/waiters',label:'Meseros',icon:'pi-users'},{path:'/customers',label:'Clientes',icon:'pi-user'},{path:'/reports',label:'Reportes',icon:'pi-chart-bar'},{path:'/settings',label:'Configuración',icon:'pi-cog'}
  ]:[
    {path:'/dashboard',label:'Dashboard',icon:'pi-home'},{path:'/pos',label:'Punto de venta',icon:'pi-shopping-bag'},{path:'/sales',label:'Ventas',icon:'pi-receipt'},{path:'/inventory',label:'Inventario',icon:'pi-box'},{path:'/customers',label:'Clientes',icon:'pi-users'},{path:'/suppliers',label:'Proveedores',icon:'pi-truck'},{path:'/orders',label:'Pedidos',icon:'pi-inbox'},{path:'/expenses',label:'Gastos',icon:'pi-wallet'},{path:'/reports',label:'Reportes',icon:'pi-chart-bar'},{path:'/employees',label:'Empleados',icon:'pi-id-card'},{path:'/integrations',label:'Integraciones',icon:'pi-share-alt'},{path:'/settings',label:'Configuración',icon:'pi-cog'}
  ]);
  private activePath=signal(location.pathname);
  activeTitle=computed(()=>this.links().find(link=>link.path===this.activePath())?.label??'Dashboard');
  lowStock=computed(()=>this.store.products().filter(p=>p.stock<=p.minStock).length);
  constructor(public store:PosnexStore,router:Router){router.events.pipe(filter(event=>event instanceof NavigationEnd)).subscribe(event=>this.activePath.set((event as NavigationEnd).urlAfterRedirects));}
  toggleMobile():void{this.mobileOpen.update(value=>!value);}
  toggleSidebar():void{this.collapsed.update(value=>!value);}
  @HostListener('window:online') onOnline():void{this.online.set(true);}
  @HostListener('window:offline') onOffline():void{this.online.set(false);}
}

