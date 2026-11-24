import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { isDevMode } from '@angular/core';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { PosnexStore } from './app/core/posnex-store';
import { authInterceptor } from './app/core/auth.interceptor';

bootstrapApplication(AppComponent, { providers: [provideRouter(routes), provideHttpClient(withInterceptors([authInterceptor])), PosnexStore, provideServiceWorker('ngsw-worker.js', { enabled: !isDevMode(), registrationStrategy: 'registerWhenStable:30000' })] }).catch(console.error);

