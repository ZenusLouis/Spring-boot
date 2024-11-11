import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ClearStorageService {
  private isRouteNavigation = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isRouteNavigation = true;
      }
    });

    window.addEventListener('beforeunload', (event) => {
      if (!this.isRouteNavigation) {
        this.clearLocalStorage();
      }
      this.isRouteNavigation = false;
    });
  }

  private clearLocalStorage(): void {
    localStorage.clear();
  }
}
