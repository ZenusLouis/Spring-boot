import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  standalone: true,
  imports: [CommonModule]
})

export class UsersComponent implements OnInit {
  users: any[] = [];
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers(this.page, this.size).subscribe({
      next: (data) => {
        this.users = data.content;
        this.totalPages = data.totalPages;
      },
      error: (err) => console.error('Error loading users:', err),
    });
  }

  goToPreviousPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadUsers();
    }
  }

  goToNextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadUsers();
    }
  }
}
