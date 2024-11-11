import { Component } from '@angular/core';
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../components/header/header.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [SidebarComponent, RouterOutlet, HeaderComponent],
  templateUrl: './admin.component.html',
})
export class AdminComponent {

}
