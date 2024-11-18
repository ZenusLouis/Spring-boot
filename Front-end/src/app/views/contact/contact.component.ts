import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './contact.component.html',
})
export class ContactComponent implements OnInit {
  contact = {
    email: '',
    message: '',
  };

  isSending = false;
  isSuccess = false;
  isError = false;

  userContacts: any[] = [];

  constructor(private contactService: ContactService) {}

  ngOnInit() {
    }

  sendMessage() {
    const { email, message } = this.contact;
  
    this.isSending = true;
    this.isSuccess = false;
    this.isError = false;
  
    this.contactService.sendMessage(email, message).subscribe(
      (response) => {
        this.isSending = false;
        this.isSuccess = true;
        setTimeout(() => {
          this.isSuccess = false;
        }, 3000);
        this.contact.message = '';
      },
      (error) => {
        this.isSending = false;
        this.isError = true;
        setTimeout(() => {
          this.isError = false;
        }, 3000);
      }
    );
  }
    
  getUserContacts(email: string) {
    this.contactService.getUserContacts(email).subscribe(
      (contacts) => {
        this.userContacts = contacts;
      },
      (error) => {
        console.error('Error fetching user contacts:', error);
      }
    );
  }
}
