import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthApiService } from '../core/auth-api.service';
import { BusinessApiService } from '../core/business-api.service';
import { BusinessResponse } from '../core/business-api.models';
import { PosnexStore } from '../core/posnex-store';

@Component({standalone:true,imports:[RouterLink],template:`<main class="welcome-screen"><header class="welcome-top"><a class="welcome-wordmark" routerLink="/businesses"><span class="welcome-mark">P</span><span>posnex<small>BUSINESS OS</small></span></a><div class="account-actions"><span class="account-email" [title]="auth.email()"><i class="pi pi-user"></i> {{auth.email()}}</span><button type="button" class="welcome-tag" (click)="logout()"><i class="pi pi-sign-out"></i> Cerrar sesión</button></div></header>
<section class="welcome-hero"><span class="eyebrow">TUS NEGOCIOS</span><h1>Elige tu <em>espacio</em></h1><p>Entra a uno de tus negocios o registra un comercio o restaurante nuevo.</p></section>
<section class="business-picker" aria-live="polite">
@if(loading()){<p class="picker-status"><i class="pi pi-spin pi-spinner"></i> Cargando tus negocios…</p>}
@else if(errorMessage()){<div class="picker-error"><p class="api-error" role="alert">{{errorMessage()}}</p><button type="button" class="button button-light" (click)="load()"><i class="pi pi-refresh"></i> Reintentar</button></div>}
@else{<div class="business-grid">
@for(b of businesses();track b.id){<button type="button" class="business-card" (click)="open(b)"><span class="business-card-logo" [style.background]="b.primaryColor" [style.color]="b.secondaryColor">{{b.name.slice(0,1)}}</span><span class="business-card-text"><strong>{{b.name}}</strong><small><i class="pi {{b.type==='Restaurant'?'pi-book':'pi-shopping-cart'}}"></i> {{b.type==='Restaurant'?'Restaurante':'Comercio electrónico'}}</small></span>@if(store.tenant().id===b.id){<span class="business-card-active">Activo</span>}<i class="pi pi-arrow-right business-card-arrow"></i></button>}
<a class="business-card business-card-new" routerLink="/new"><span class="business-card-logo"><i class="pi pi-plus"></i></span><span class="business-card-text"><strong>{{businesses().length?'Crear otro negocio':'Crear mi primer negocio'}}</strong><small>Comercio electrónico o restaurante</small></span></a>
</div>
@if(!businesses().length){<p class="picker-status">Todavía no tienes negocios registrados en esta cuenta.</p>}}
</section>
<footer class="welcome-footer"><span><i class="pi pi-shield"></i> POSNEX para tu negocio</span><span>Solo ves los negocios de tu cuenta.</span><span>© 2026 POSNEX</span></footer></main>`})
export class BusinessesPage implements OnInit {
  businesses=signal<BusinessResponse[]>([]); loading=signal(true); errorMessage=signal('');
  constructor(public auth:AuthApiService,public store:PosnexStore,private api:BusinessApiService,private router:Router){}
  ngOnInit():void{this.load();}
  load():void{
    this.loading.set(true);this.errorMessage.set('');
    this.api.list().subscribe({
      next:items=>{this.businesses.set(items);this.loading.set(false);},
      error:error=>{this.loading.set(false);this.errorMessage.set(error instanceof HttpErrorResponse&&error.status===0?'No se pudo conectar con la API. Verifica que el backend esté activo en localhost:5071.':'No pudimos cargar tus negocios.');}
    });
  }
  open(business:BusinessResponse):void{
    if(this.store.tenant().id!==business.id)this.store.saveTenant(this.store.tenantFromBusiness(business,this.auth.email()));
    this.router.navigateByUrl(business.type==='Restaurant'?'/restaurant/dashboard':'/dashboard');
  }
  logout():void{this.auth.logout();this.store.clearTenant();this.router.navigateByUrl('/login');}
}
