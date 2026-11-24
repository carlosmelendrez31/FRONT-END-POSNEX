import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthApiService } from '../core/auth-api.service';
import { PosnexStore } from '../core/posnex-store';

type Mode = 'login' | 'register';

@Component({standalone:true,imports:[FormsModule],template:`<div class="onboarding"><div class="onboarding-brand"><span class="brand-mark">P</span><span class="brand-name">posnex<small>BUSINESS OS</small></span><span class="onboard-secure"><i class="pi pi-lock"></i> Acceso seguro</span></div><div class="onboard-layout"><aside class="onboard-aside"><span class="eyebrow">TU CUENTA POSNEX</span><h1>Una cuenta,<br><em>todos tus negocios.</em></h1><p>Inicia sesión y administra tus comercios y restaurantes desde un solo lugar.</p><div class="onboard-proof"><div><i class="pi pi-check"></i><span>Crea los comercios y restaurantes que necesites</span></div><div><i class="pi pi-check"></i><span>Cambia de negocio cuando quieras</span></div><div><i class="pi pi-check"></i><span>Cada negocio conserva su propia información</span></div></div><div class="onboard-decoration"></div></aside>
<section class="onboard-form-area"><div class="step-heading"><span class="eyebrow">{{mode()==='login'?'INICIAR SESIÓN':'CREAR CUENTA'}}</span><h2>{{mode()==='login'?'Bienvenido de nuevo':'Crea tu cuenta'}}</h2><p>{{mode()==='login'?'Entra con el correo y la contraseña de tu cuenta.':'Después podrás registrar tus negocios.'}}</p></div>
<form class="onboard-fields" (ngSubmit)="submit()"><label>Correo electrónico<input name="email" type="email" autocomplete="email" [(ngModel)]="email" placeholder="tu@correo.com" required></label><label>Contraseña<input name="password" type="password" [attr.autocomplete]="mode()==='login'?'current-password':'new-password'" [(ngModel)]="password" placeholder="Contraseña de tu cuenta" required></label>
@if(errorMessage()){<p class="api-error" role="alert">{{errorMessage()}}</p>}
<div class="onboard-actions auth-actions"><button type="submit" class="button button-dark" [disabled]="busy()">{{busy()?(mode()==='login'?'Entrando…':'Creando cuenta…'):(mode()==='login'?'Iniciar sesión':'Crear cuenta')}} <i class="pi pi-arrow-right"></i></button></div></form>
<div class="demo-option"><button type="button" (click)="toggleMode()">{{mode()==='login'?'¿No tienes cuenta? Crear cuenta':'¿Ya tienes cuenta? Iniciar sesión'}} <i class="pi pi-arrow-right"></i></button></div></section></div></div>`})
export class LoginPage {
  mode=signal<Mode>('login'); busy=signal(false); errorMessage=signal('');
  email=''; password='';
  constructor(private auth:AuthApiService,private store:PosnexStore,private router:Router){}
  toggleMode():void{this.mode.update(m=>m==='login'?'register':'login');this.errorMessage.set('');}
  submit():void{
    this.errorMessage.set('');
    if(!this.email.includes('@')||!this.password){this.errorMessage.set('Escribe tu correo y tu contraseña.');return;}
    this.busy.set(true);
    const credentials={email:this.email,password:this.password};
    const request=this.mode()==='login'?this.auth.login(credentials):this.auth.register(credentials);
    request.subscribe({
      next:()=>{this.busy.set(false);this.store.clearTenant();this.router.navigateByUrl('/businesses');},
      error:error=>{this.busy.set(false);this.errorMessage.set(this.describe(error));}
    });
  }
  private describe(error:unknown):string{
    if(!(error instanceof HttpErrorResponse))return 'No se pudo completar la solicitud.';
    if(error.status===0)return 'No se pudo conectar con la API. Verifica que el backend esté activo en localhost:5071.';
    if(error.status===429)return 'Demasiados intentos. Espera un minuto y vuelve a intentarlo.';
    if(error.status===401)return error.error?.detail==='LockedOut'?'La cuenta está bloqueada temporalmente por intentos fallidos. Intenta más tarde.':'Correo o contraseña incorrectos.';
    if(error.status===400){
      const codes=Object.keys(error.error?.errors??{});
      if(codes.some(code=>code.startsWith('Duplicate')))return 'Ese correo ya tiene una cuenta. Inicia sesión.';
      if(codes.some(code=>code.startsWith('InvalidEmail')))return 'El correo no es válido.';
      return 'No se pudo crear la cuenta. Revisa el correo y la contraseña.';
    }
    return 'Ocurrió un error. Intenta de nuevo.';
  }
}
