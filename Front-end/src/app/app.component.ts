import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import { ClearStorageService } from './clear-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(private clearStorageService: ClearStorageService) {
  }
}
