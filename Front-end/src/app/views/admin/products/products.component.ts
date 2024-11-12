import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/product.model';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from "../../../components/notification/notification";
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../../../auth/auth.interceptor';

@Component({
  selector: 'app-product',
  templateUrl: './products.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, NotificationComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  paginatedProducts: Product[] = [];
  currentProduct: Product = {
    pro_id: 0,
    pro_name: '',
    pro_des: '',
    pro_price: 0,
    pro_stock: 0,
    pro_status: 1,
    pro_image: '',
    category: {
      cate_name: '',
      cate_id: 0,
    },
  };
  categories: Category[] = [];
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  isEdit = false;
  isModalOpen: boolean = false;
  selectedFile: File | null = null;
  importMessage = '';

  // Notification variables
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'info';
  isDragging = false;
  imageUrls: { [key: string]: string } = {};
  defaultImageUrl = 'assets/images/default.png'

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
  ) { }

  getDisplayedCount(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.filteredProducts.length);
  }

  ngOnInit() {
    this.fetchProducts();
    this.fetchCategories();
  }

  fetchProducts() {
    this.productService.getProducts().subscribe((data: Product[]) => {
      this.products = data;
      this.filteredProducts = [...this.products];
      this.applyPagination();
      this.products.forEach(product => {
        const imageName = product.pro_image;
        if (imageName) {
          this.productService.checkImageExists(imageName).subscribe(exists => {
            if (exists) {
              this.productService.getImageBlobUrl(imageName).subscribe(url => {
                this.imageUrls[imageName] = url || this.defaultImageUrl;
              });
            } else {
              this.imageUrls[imageName] = this.defaultImageUrl;
            }
          });
        } else {
          this.imageUrls[imageName as string] = this.defaultImageUrl;
        }
      });
    });
  }

  getImageUrl(product: Product): string {
    const imageName = product.pro_image;
    return imageName && this.imageUrls[imageName] ? this.imageUrls[imageName] : this.defaultImageUrl; 
  }

  fetchCategories() {
    this.categoryService.getCategories().subscribe((data: Category[]) => {
      this.categories = data;
    });
  }

  searchProducts() {
    this.filteredProducts = this.products.filter((product) =>
      product.pro_name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.applyPagination();
  }

  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  openAddModal() {
    this.isEdit = false;
    this.currentProduct = {
      pro_id: 0,
      pro_name: '',
      pro_des: '',
      pro_price: 0,
      pro_stock: 0,
      pro_status: 1,
      category: {
        cate_name: '',
        cate_id: 0,
      },
    };
    this.selectedFile = null; // Reset the selected file
    this.toggleModal();
  }

  openEditModal(product: Product) {
    this.isEdit = true;
    this.currentProduct = { ...product };
    this.selectedFile = null;
    this.toggleModal();
  }

  toggleModal(): void {
    this.isModalOpen = !this.isModalOpen;
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }

  showNotificationMessage(message: string, type: 'success' | 'error' | 'info') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;

    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  saveProduct() {
    const saveObservable = this.isEdit
        ? this.productService.updateProduct(this.currentProduct, this.selectedFile)
        : this.productService.addProduct(this.currentProduct, this.selectedFile!);

    saveObservable.subscribe(() => {
        this.fetchProducts();
        this.showNotificationMessage(this.isEdit ? 'Product updated successfully!' : 'Product added successfully!', 'success');
        this.toggleModal();
        this.selectedFile = null; // Reset selected file after save
    }, error => {
        this.showNotificationMessage(this.isEdit ? 'Error updating product!' : 'Error adding product!', 'error');
    });
}

  deleteProduct(productId: number) {
    this.productService.deleteProduct(productId).subscribe(() => {
      this.fetchProducts();
      this.showNotificationMessage('Product deleted successfully!', 'success');
    }, error => {
      this.showNotificationMessage('Error deleting product!', 'error');
    });
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredProducts.length) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  showExportOptions = false;
  exportFileName = 'products';
  isImportModalOpen = false;

  toggleExportOptions() {
    this.showExportOptions = !this.showExportOptions;
  }

  onFileSelect(event: any) {
    this.selectedFile = event.target.files[0];
  }

  exportToPdf() {
    this.productService.exportToPdf().subscribe(blob => {
      const filename = this.exportFileName ? `${this.exportFileName}.pdf` : 'products.pdf';
      this.downloadFile(blob, filename);
      this.showExportOptions = false;
    });
  }

  exportToExcel() {
    this.productService.exportToExcel().subscribe(blob => {
      const filename = this.exportFileName ? `${this.exportFileName}.xlsx` : 'products.xlsx';
      this.downloadFile(blob, filename);
      this.showExportOptions = false;
    });
  }

  exportToDocx() {
    this.productService.exportToDocx().subscribe(blob => {
      const filename = this.exportFileName ? `${this.exportFileName}.docx` : 'products.docx';
      this.downloadFile(blob, filename);
    });
  }

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  openImportModal() {
    this.isImportModalOpen = true;
  }

  closeImportModal() {
    this.isImportModalOpen = false;
    this.selectedFile = null;
  }

  importProducts() {
    if (this.selectedFile) {
      this.productService.importProducts(this.selectedFile).subscribe(
        () => {
          this.showNotificationMessage('Products imported successfully!', 'success');
          this.fetchProducts();
          this.closeImportModal();
        },
        error => {
          if (error.status === 200) {
            this.showNotificationMessage('Products imported successfully!', 'success');
          } else {
            this.showNotificationMessage('Error importing products!', 'error');
          }
        }
      );
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.selectedFile = event.dataTransfer.files[0];
      event.dataTransfer.clearData();
    }
  }

  resetFileInput(): void {
    this.selectedFile = null;
  }
}
