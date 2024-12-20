import { Component, OnInit } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  selectedOrder: any | null = null;
  totalOrderValue: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private orderService: OrderService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe(
      (data) => {
        this.orders = data;
      },
      (error) => {
        console.error('Failed to load orders:', error);
      }
    );
  }

  openOrderModal(orderId: number): void {
    this.orderService.getOrderDetails(orderId).subscribe(
      (data) => {
        this.selectedOrder = data;
        this.calculateTotalOrderValue();
      },
      (error) => {
        console.error('Failed to load order details:', error);
      }
    );
  }

  closeOrderModal(): void {
    this.selectedOrder = null;
    this.totalOrderValue = 0;
  }

  calculateTotalOrderValue(): void {
    if (this.selectedOrder && this.selectedOrder.orderItems) {
      this.totalOrderValue = this.selectedOrder.orderItems.reduce((sum: number, item: any) => {
        return sum + item.quantity * item.price;
      }, 0);
    }
  }

  paginatedOrders(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.orders.slice(startIndex, startIndex + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.orders.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.totalPages()) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  updateToShipping(order: any): void {
    if (order.status === 'PENDING') {
      this.orderService.updateOrderStatus(order.orderId, 'SHIPPING').subscribe(
        () => this.loadOrders(),
        error => console.error('Error updating order status', error)
      );
    }
  }
  
  statusClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-500 bg-yellow-100';
      case 'SHIPPING':
        return 'text-blue-500 bg-blue-100';
      case 'DELIVERED':
        return 'text-green-500 bg-green-100';
      case 'CANCELLED':
        return 'text-red-500 bg-red-100';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  }

  statusIcon(status: string): SafeHtml {
    let svg = '';
    switch (status) {
      case 'PENDING':
        svg = `<svg class="svg-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M589.94 931.646c8.6-1.637 17.196-3.274 25.382-5.322 5.325-1.229 10.236-4.911 13.103-9.413 2.867-4.916 3.688-10.647 2.457-15.97-2.457-9.416-10.645-15.968-20.471-15.968-1.639 0-3.276 0.409-4.913 0.819-7.776 2.047-15.146 3.686-22.928 4.915-11.462 2.044-18.832 13.1-16.782 24.562 0.817 5.321 4.093 10.232 8.595 13.511 3.686 2.456 7.781 3.684 11.875 3.684C587.485 932.057 588.711 932.057 589.94 931.646zM896.992 407.202c2.045 0 4.503-0.41 6.547-1.229 11.056-3.685 17.196-15.559 13.512-26.612-2.864-8.188-5.729-16.375-9.006-24.563-3.275-8.188-11.053-13.101-19.649-13.101-2.865 0-5.322 0.41-7.78 1.639-5.32 2.045-9.415 6.141-11.463 11.053-2.047 4.913-2.457 11.053 0 15.966 2.865 7.369 5.731 14.739 8.188 22.108 1.229 4.093 4.095 7.779 7.777 10.646C888.396 405.975 892.488 407.202 896.992 407.202L896.992 407.202zM715.22 884.562c3.683 0 7.366-0.817 10.644-2.862 7.369-4.503 15.146-9.009 22.105-13.513 4.505-3.274 7.779-7.777 9.008-13.51 1.228-5.32 0-11.054-2.864-15.967-4.097-5.73-10.646-9.416-17.605-9.416-4.094 0-8.188 1.229-11.462 3.686-6.552 4.503-13.103 8.598-20.062 12.28-10.236 5.733-13.51 18.835-7.779 28.659 1.64 2.867 3.685 4.911 6.143 6.55C706.618 882.928 710.713 884.562 715.22 884.562L715.22 884.562zM905.179 539.439c3.275 2.455 7.369 3.685 11.466 3.685l0.406 0c11.466 0 20.883-9.416 20.883-20.472 0-8.597 0-17.194-0.411-25.792-0.408-11.462-9.825-20.062-20.878-20.062l-0.819 0c-11.466 0.409-20.471 10.236-20.061 21.698 0.409 7.779 0.409 15.558 0 23.337C896.174 528.794 899.45 535.344 905.179 539.439zM849.091 739.226c-3.684-2.863-8.188-4.092-12.69-4.092-6.551 0-12.691 3.275-16.784 8.598-4.505 6.142-9.417 12.281-14.738 18.424-7.368 9.008-6.552 22.107 2.456 29.479 0.407 0.407 0.817 0.815 1.638 1.226 3.686 2.458 7.778 3.687 12.282 3.687 6.14 0 11.874-2.867 15.967-7.369 5.73-6.551 11.052-13.511 16.374-20.47C860.146 759.696 858.1 746.188 849.091 739.226zM905.179 613.542c-2.046-0.819-4.093-0.819-6.142-0.819-9.414 0-17.194 5.731-20.062 14.736-2.455 7.37-4.912 14.739-7.776 22.109-3.274 9.008-0.408 19.24 7.368 24.562 1.229 0.818 2.866 1.639 4.505 2.456 2.453 0.819 4.911 1.23 7.369 1.23 8.596 0 16.375-5.322 19.65-13.513 2.866-7.778 5.731-15.968 8.597-24.562C922.375 629.098 916.234 617.226 905.179 613.542zM819.206 238.937c2.047 0 4.094-1.226 4.909-2.455 0.819-1.229 1.229-3.276 0.409-5.322l-30.702-110.54-32.343 46.672-11.872-7.779C679.19 112.434 597.72 87.458 513.382 87.458c-24.563 0-49.129 2.048-73.692 6.55-10.646 2.048-21.699 4.095-32.342 6.96l-1.229 0.41c-94.571 24.155-175.635 78.605-234.176 156.802l-0.818 1.226c0 0.41-0.41 0.41-0.41 0.819-2.048 2.867-4.096 5.322-5.731 8.188-3.276 4.503-6.141 9.008-9.008 13.511l-0.819 1.637c-48.307 74.51-71.235 160.485-67.551 248.916 0 0.41 0 0.819 0 1.229 0.408 8.187 1.229 16.785 2.047 25.383l0.41 1.639c0.819 9.006 2.048 17.604 3.687 25.792 15.146 87.61 56.497 167.033 119.136 228.854l0 0 0.41 0.41c16.785 16.375 35.207 31.933 54.449 45.442 51.177 36.025 108.492 60.184 169.493 70.827 1.229 0.408 2.455 0.408 3.685 0.408 10.235 0 18.832-7.369 20.47-17.193 0.818-5.73-0.409-11.056-3.276-15.559-3.273-4.503-8.187-7.78-13.511-8.598-32.752-5.732-64.275-15.967-94.163-29.887l-0.407-0.409c-0.41 0-0.41-0.409-0.818-0.409-6.959-3.273-13.92-6.55-20.062-10.234l0 0-0.41 0-2.048-1.229c-11.872-6.551-23.334-13.919-34.387-21.699-83.52-58.954-139.198-146.977-156.803-248.096-17.604-101.124 5.322-202.654 64.278-286.173 25.793-36.846 57.723-68.369 94.16-93.754l1.229-0.816c64.685-44.627 140.016-67.962 218.621-67.962 75.737 0 149.021 22.109 212.07 64.276l12.281 8.188-32.343 47.081L819.206 238.937zM736.506 664.717c5.321 0 10.233-2.868 12.69-7.779 3.687-6.96 0.818-15.558-6.141-19.241l-237.452-122.82L505.603 255.724c0-7.778-6.55-14.329-14.33-14.329s-14.327 6.55-14.327 14.329L476.946 532.07l253.008 131.009C732.003 664.307 734.049 664.717 736.506 664.717z"  /></svg>`;
        break;
      case 'SHIPPING':
        svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h1l1 2h13l1-2h1M3 10l.13-2.63A1 1 0 014.13 7h15.74a1 1 0 01.99 1.37L20 10M3 10h18m-5 5a3 3 0 100 6 3 3 0 000-6zm-10 3a3 3 0 100 6 3 3 0 000-6z"/></svg>`;
        break;
      case 'DELIVERED':
        svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
        break;
      case 'CANCELLED':
        svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>`;
        break;
      default:
        svg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12h.01M12 16h.01M12 8h.01"/></svg>`;
        break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}
