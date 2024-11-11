import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {KeycloakService} from 'keycloak-angular';
import {from, Observable, switchMap} from 'rxjs';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.keycloakService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
          const clonedRequest = req.clone({ headers });
          return next.handle(clonedRequest);
        }
        return next.handle(req);
      })
    )
  }
}
