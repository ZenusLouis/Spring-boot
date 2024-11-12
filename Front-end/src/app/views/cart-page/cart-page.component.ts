import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { UserService } from '../../services/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CartPageComponent implements OnInit {
  items: any[] = [];
  totalItems: number = 0;
  totalPrice: number = 0;
  
  phone: string = '';
  address: string = '';

  showPreReviewModal: boolean = false;
  showNotificationModal: boolean = false;
  notificationMessage: string = '';
  isCheckoutSuccess: boolean = false;

  constructor(
    private cartService: CartService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCart();
    this.loadUserDetails();
  }

  loadCart() {
    this.cartService.getCart().subscribe(
      (data: any[]) => {
        this.items = data;
        this.items.forEach((item, index) => {
          this.cartService.getProductDetails(item.productId).subscribe(
            (productDetails) => {
              this.items[index].product = productDetails;
              this.calculateTotals();
            },
            error => console.error('Failed to load product details:', error)
          );
        });
      },
      error => console.error('Failed to load cart:', error)
    );
  }

  loadUserDetails() {
    const userId = parseInt(localStorage.getItem('user_id') || '0', 10);
    this.userService.getUserDetails(userId).subscribe(
      userDetails => {
        this.phone = userDetails.phone || '';
        this.address = userDetails.address || '';
      },
      error => console.error('Failed to load user details:', error)
    );
  }

  calculateTotals() {
    this.totalItems = this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    this.totalPrice = this.items.reduce((sum, item) => sum + (item.quantity * (item.product?.pro_price || 0)), 0);
  }

  updateQuantity(productId: number, quantity: number) {
    if (productId) {
      this.cartService.updateQuantity(productId, quantity).subscribe(
        () => this.loadCart(),
        error => console.error('Failed to update quantity:', error)
      );
    }
  }

  removeItem(productId: number) {
    if (productId) {
      this.cartService.removeItem(productId).subscribe(
        () => this.loadCart(),
        error => console.error('Failed to remove item:', error)
      );
    }
  }

  openPreReviewModal() {
    this.showPreReviewModal = true;
  }

  confirmCheckout() {
    const userId = parseInt(localStorage.getItem('user_id') || '0', 10);
    const updatedData = {
      phone: this.phone,
      address: this.address
    };
    if (this.phone && this.address) {
      this.proceedCheckout(userId);
    } else {
      this.userService.updateUserDetails(userId, updatedData).subscribe(
        () => {
          this.proceedCheckout(userId);
        },
        error => console.error('Failed to update user details before checkout:', error)
      );
    }
  }

  proceedCheckout(userId: number) {
    this.cartService.checkout(userId, this.phone, this.address).subscribe(
      (response) => {
        console.log("Checkout Response:", response); // Log response khi thành công
        this.isCheckoutSuccess = true;
        this.notificationMessage = "Checkout successful! Your order has been placed.";
        this.showNotificationModal = true;
        this.showPreReviewModal = false;
        this.loadCart();
      },
      error => {
        console.error("Checkout Error:", error);
        this.isCheckoutSuccess = false;
        this.notificationMessage = error.error === 'Not enough money in the account'
          ? 'Checkout failed: You do not have enough money to complete the purchase.'
          : 'Checkout failed. Please try again.';
        this.showNotificationModal = true;
      }
    );
  }
  
  closePreReviewModal() {
    this.showPreReviewModal = false;
  }

  closeNotificationModal() {
    this.showNotificationModal = false;
    window.location.reload();
  }

  seeOrder() {
    this.router.navigate(['/orders']);
    this.showNotificationModal = false;
  }
}
