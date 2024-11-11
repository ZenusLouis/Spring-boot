import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { KeycloakAuthService } from './app/auth/keycloak.service';
import { APP_INITIALIZER } from '@angular/core';
import { routes } from './app/app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { TokenInterceptor } from './app/auth/token.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    KeycloakService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (authService: KeycloakAuthService) => () => authService.initKeycloak(),
      deps: [KeycloakAuthService],
      multi: true,
    },
  ],
}).catch((err) => console.error(err));
