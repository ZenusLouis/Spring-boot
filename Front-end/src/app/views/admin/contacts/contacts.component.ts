import { Component, OnInit } from '@angular/core';
import { ContactService } from '../../../services/contact.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.component.html',
})
export class ContactsComponent implements OnInit {
  contacts: any[] = [];
  selectedContact: any = null;
  page: number = 0;
  totalPages: number = 0;
  totalElements: number = 0;
  replyMessage: string = '';

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.loadContacts();
  }

  loadContacts() {
    this.contactService.getAllContacts(this.page, 10).subscribe((response: any) => {
      this.contacts = response.content;
      this.totalPages = response.totalPages;
      this.totalElements = response.totalElements;
    });
  }

  viewMessage(contact: any) {
    this.selectedContact = contact;
  }

  // sendMessage() {
  //   if (this.replyMessage.trim()) {
  //     console.log('Sending reply:', this.replyMessage);
  //     this.replyMessage = '';
  //   }
  // }

  closeModal() {
    this.selectedContact = null;
  }

  goToPreviousPage() {
    if (this.page > 0) {
      this.page--;
      this.loadContacts();
    }
  }

  goToNextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadContacts();
    }
  }
}
