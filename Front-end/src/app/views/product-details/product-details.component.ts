import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CategoryService } from '../../services/category.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationComponent } from '../../components/notification/notification';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  imports: [CommonModule, FormsModule, NotificationComponent],
  standalone: true
})
export class ProductDetailsComponent implements OnInit {
  product: Product | null = null;
  category: Category | null = null;
  quantity: number = 1;
  imageUrls: { [key: string]: string } = {};
  defaultImageUrl = 'assets/images/default.png';
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'info';

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadProduct();
  }

  loadProduct() {
    const productIdStr = this.route.snapshot.paramMap.get('id');
    const productId = productIdStr ? Number(productIdStr) : null;

    if (productId !== null) {
      this.productService.getProductById(productId).subscribe(
        data => {
          this.product = data;
          if (this.product.category?.cate_id) {
            this.loadCategory(this.product.category.cate_id);
          }
          this.loadImage(this.product.pro_image);
        },
        error => console.error('Error loading product:', error)
      );
    }
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
  getImageUrl(product: Product): string {
    const imageName = product.pro_image;
    return imageName && this.imageUrls[imageName] ? this.imageUrls[imageName] : this.defaultImageUrl;
  }

  showNotificationMessage(message: string, type: 'success' | 'error' | 'info') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  loadCategory(categoryId: number) {
    this.categoryService.getCategoryById(categoryId).subscribe(
      data => this.category = data,
      error => this.showNotificationMessage('Error loading category.', 'error')
    );
  }

  addToCart() {
    if (this.product) {
      if (this.product.pro_stock === 0) {
        this.showNotificationMessage("This product is out of stock.", 'info');
        return;
      }
      
      if (this.quantity > this.product.pro_stock) {
        this.showNotificationMessage(`Only ${this.product.pro_stock} items are available. Please enter a valid quantity.`, 'error');
        this.quantity = this.product.pro_stock; // Set quantity to max available
        return;
      }

      this.cartService.addToCart(this.product.pro_id, this.quantity).subscribe(
        () => this.showNotificationMessage("Item added to cart successfully!", 'success'),
        error => {
          console.error('Failed to add item to cart:', error);
          this.showNotificationMessage("Failed to add item to cart.", 'error');
        }
      );
    } else {
      this.showNotificationMessage("Please select a valid quantity.", 'info');
    }
  }
}
