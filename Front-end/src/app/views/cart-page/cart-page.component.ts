import { Component, OnInit } from '@angular/core';
import { CartService } from '../../services/cart.service';
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

  // Properties for the notification modal
  showNotificationModal: boolean = false;
  notificationMessage: string = '';
  isCheckoutSuccess: boolean = false; // Indicates if the checkout was successful

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit() {
    this.loadCart();
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

  checkout() {
    const userId = parseInt(localStorage.getItem('user_id') || '0', 10);
    this.cartService.checkout(userId).subscribe(
      () => {
        // On successful checkout
        this.isCheckoutSuccess = true;
        this.notificationMessage = "Checkout successful! Your order has been placed.";
        this.showNotificationModal = true;
        this.loadCart(); // Clear cart
      },
      error => {
        // On failed checkout
        this.isCheckoutSuccess = false;
        if (error.status === 400 && error.error === 'Not enough money in the account') {
          this.notificationMessage = 'Checkout failed: You do not have enough money to complete the purchase.';
        } else {
          this.notificationMessage = 'Checkout failed. Please try again.';
        }
        this.showNotificationModal = true;
      }
    );
  }

  closeNotificationModal() {
    this.showNotificationModal = false;
    window.location.reload();
  }

  seeOrder() {
    console.log('Navigating to order details page...');
    this.router.navigate(['/orders']);
    this.showNotificationModal = false;
  }
}
