import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  standalone: true,
  imports : [CommonModule],
  styleUrls: ['./notification.component.css']})
  export class NotificationComponent {
    @Input() message: string = '';
    @Input() type: 'success' | 'error' | 'info' = 'info';
    @Input() show: boolean = false;
  
    get icon() {
      return this.type === 'success' ? 'checkmark' : 'error';
    }
  
    closeModal() {
      this.show = false;
    }
  }