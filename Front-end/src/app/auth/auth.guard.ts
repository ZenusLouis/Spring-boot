import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = localStorage.getItem('access_token');
    if (!token || this.isTokenExpired(token)) {
      this.router.navigate(['/auth/login']);
      return false;
    }
    const requiredRoles = route.data['roles'] as Array<string>;
    if (requiredRoles && requiredRoles.length > 0) {
      const userRoles = this.getUserRoles(token);
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        this.router.navigate(['/home']);
        return false;
      }
    }

    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Math.floor(new Date().getTime() / 1000);
      return decoded.exp < currentTime;
    } catch (e) {
      return true;
    }
  }

  private getUserRoles(token: string): string[] {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.realm_access?.roles || [];
    } catch (e) {
      return [];
    }
  }
}
