import { Component, ChangeDetectorRef } from '@angular/core';
import { OrderService } from '../../services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
})
export class OrderComponent {
  orders: any[] = [];
  selectedOrder: any | null = null;
  showOrderModal: boolean = false;
  userId: number = parseInt(localStorage.getItem('user_id') || '0', 10);
  imageUrls: { [key: string]: string } = {};
  defaultImageUrl = 'assets/images/default.png';
  currentPage: number = 1;
  totalPages: number = 0;
  itemsPerPage: number = 9;
  paginatedOrders: any[] = [];

  constructor(
    private orderService: OrderService, 
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserOrders();
  }

  loadUserOrders() {
    this.orderService.getUserOrders(this.userId).subscribe(
      data => {
        this.orders = data;
        this.totalPages = Math.ceil(this.orders.length / this.itemsPerPage);
        this.updatePaginatedOrders();
      },
      error => console.error('Error loading user orders:', error)
    );
  }

  viewOrderDetails(orderId: number) {
    this.orderService.getOrderDetails(orderId).subscribe(
      data => {
        this.selectedOrder = data;
        this.showOrderModal = true;
        this.selectedOrder.orderItems.forEach((item: any) => {
          this.loadImage(item.pro_image || item.image);
        });
      },
      error => console.error('Error loading order details:', error)
    );
  }

  loadImage(imageName: string | undefined) {
    if (imageName) {
      this.productService.checkImageExists(imageName).subscribe(exists => {
        if (exists) {
          this.productService.getImageBlobUrl(imageName).subscribe(
            url => this.imageUrls[imageName] = url || this.defaultImageUrl,
            error => {
              console.error('Error loading image blob URL:', error);
              this.imageUrls[imageName] = this.defaultImageUrl;
            }
          );
        } else {
          this.imageUrls[imageName] = this.defaultImageUrl;
        }
      });
    }
  }

  getImageUrl(item: any): string {
    const imageName = item.pro_image || item.image;
    return imageName && this.imageUrls[imageName] ? this.imageUrls[imageName] : this.defaultImageUrl;
  }

  updateStatus(order: any) {
    if (order.status === 'SHIPPING') {
      this.orderService.updateOrderStatus(order.orderId, 'DELIVERED').subscribe(
        () => {
          order.status = 'DELIVERED';
          this.cdr.detectChanges(); // Trigger change detection
        },
        error => console.error('Error updating order status', error)
      );
    }
  }
  
  cancelOrder(order: any) {
    if (order.status === 'PENDING') {
      this.orderService.updateOrderStatus(order.orderId, 'CANCELLED').subscribe(
        () => {
          order.status = 'CANCELLED';
          this.cdr.detectChanges();
        },
        error => console.error('Error cancelling order', error)
      );
    }
  }
  
  closeOrderModal() {
    this.showOrderModal = false;
    this.selectedOrder = null;
  }

  updatePaginatedOrders() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedOrders = this.orders.slice(startIndex, endIndex);
  }

  onPageChange(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginatedOrders(); // Update displayed orders for the new page
    }
  }

  updatePaginationParams(): void {
    const pageParams: any = {};
    if (this.currentPage > 1) {
      pageParams.page = this.currentPage;
      this.router.navigate([], {
        queryParams: pageParams,
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate([], {
        queryParams: {},
        queryParamsHandling: ''
      });
    }
  }

  getPaginationNumbers(): (number | string)[] {
    const numbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(startPage + maxVisiblePages - 1, this.totalPages);

    if (endPage === this.totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      numbers.push(i);
    }
    return numbers;
  }
}
