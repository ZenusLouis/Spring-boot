import { CategoryService } from '../../services/category.service';
import { Category } from './../../models/category.model';
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReviewService } from '../../services/review.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
})
export class ProductListComponent implements OnInit {
  Math = Math;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  filterText: string = '';
  priceRange: number = 1000;     
  minPrice: number = 0;
  sortOrder: string = '';
  selectedCategory: Category | null = null;
  categories: Category[] = [];
  currentPage: number = 1;
  totalPages: number = 0;
  itemsPerPage: number = 9;
  imageUrls: { [key: string]: string } = {};
  defaultImageUrl = 'assets/images/default.png';
  averageRatings: { [productId: number]: number } = {};

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private reviewService: ReviewService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.fetchProducts();
    this.fetchCategories();
    this.handleQueryParams();
    this.router.navigate([], {
      queryParams: {},
      queryParamsHandling: ''
    });
  }

  fetchProducts(): void {
    this.productService.getProducts().subscribe((products: Product[]) => {
      this.products = products.filter((product) => product.pro_status === 1);
      this.filterProducts();

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
        this.loadAverageRating(product.pro_id);
      });
    });
  }


  getImageUrl(product: Product): string {
    const imageName = product.pro_image;
    return imageName && this.imageUrls[imageName] ? this.imageUrls[imageName] : this.defaultImageUrl;
  }

  fetchCategories(): void {
    this.categoryService.getCategories().subscribe((categories: Category[]) => {
      this.categories = categories;
    });
  }

  filterProducts(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesName = product.pro_name.toLowerCase().includes(this.filterText.toLowerCase());
      const matchesPrice = product.pro_price <= this.priceRange;
      const matchesCategory = this.selectedCategory
        ? product.category.cate_id === this.selectedCategory.cate_id
        : true;

      return matchesName && matchesPrice && matchesCategory;
    });

    this.sortProducts();
    this.calculateTotalPages();
    this.updateFilterParams();
  }

  sortProducts(): void {
    if (this.sortOrder === 'asc') {
      this.filteredProducts.sort((a, b) => a.pro_price - b.pro_price);
    } else if (this.sortOrder === 'desc') {
      this.filteredProducts.sort((a, b) => b.pro_price - a.pro_price);
    }
  }

  updateFilterParams(): void {
    const filterParams: any = {};
    if (this.filterText) filterParams.filterText = this.filterText;
    if (this.priceRange !== 1000) filterParams.priceRange = this.priceRange;
    if (this.selectedCategory) filterParams.categoryId = this.selectedCategory.cate_id;
    if (this.sortOrder) filterParams.sortOrder = this.sortOrder;
    if (Object.keys(filterParams).length > 0) {
      this.router.navigate([], {
        queryParams: filterParams,
        queryParamsHandling: 'merge'
      });
    } else {
      this.router.navigate([], {
        queryParams: {},
        queryParamsHandling: ''
      });
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

  handleQueryParams(): void {
    this.router.routerState.root.queryParams.subscribe(params => {
      this.filterText = params['filterText'] || '';
      this.priceRange = params['priceRange'] ? +params['priceRange'] : 1000;
      this.selectedCategory = params['categoryId']
        ? this.categories.find(category => category.cate_id === +params['categoryId']) || null
        : null;
      this.currentPage = params['page'] ? +params['page'] : 1;
      this.sortOrder = params['sortOrder'] || '';
      this.filterProducts();
    });
  }

  getPaginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, startIndex + this.itemsPerPage);
  }

  viewProductDetails(productId: number): void {
    this.router.navigate(['/products', productId], {
      queryParams: {},
      queryParamsHandling: ''
    });
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
  }

  loadAverageRating(productId: number): void {
    this.reviewService.getAverageRating(productId).subscribe(
      data => {
        this.averageRatings[productId] = data;
      },
      error => {
        console.error('Error loading average rating:', error);
      }
    );
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

  onPageChange(page: number | string): void {
    if (typeof page === 'number' && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePaginationParams();
    }
  }
}
