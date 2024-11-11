import { Component, OnInit } from '@angular/core';
import { BannerComponent } from "../../components/banner/banner.component";
import { HomeService } from '../../services/home.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BannerComponent, CommonModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  newestProducts: Product[] = [];
  bestSellerProducts: Product[] = [];
  imageUrls: { [key: string]: string } = {};
  defaultImageUrl = 'assets/images/default.png';

  constructor(private homeService: HomeService, private router: Router) { }

  ngOnInit() {
    this.loadBestSellers();
    this.loadNewestProducts();
  }

  private loadBestSellers() {
    this.homeService.getBestSellers().subscribe(data => {
      this.bestSellerProducts = data;
      this.loadImagesForProducts(this.bestSellerProducts);
    });
  }

  private loadNewestProducts() {
    this.homeService.getNewestProducts().subscribe(data => {
      this.newestProducts = data;
      this.loadImagesForProducts(this.newestProducts);
    });
  }

  viewProductDetails(productId: number): void {
    this.router.navigate(['/products', productId]);
  }

  getImageUrl(product: Product): string {
    const imageName = product.pro_image;
    return imageName && this.imageUrls[imageName] ? this.imageUrls[imageName] : this.defaultImageUrl;
  }

  private loadImagesForProducts(products: Product[]): void {
    products.forEach(product => {
      const imageName = product.pro_image || '';
      if (imageName && !this.imageUrls[imageName]) {
        this.homeService.checkImageExists(imageName).subscribe(
          exists => {
            if (exists) {
              this.homeService.getImageBlobUrl(imageName).subscribe(
                url => this.imageUrls[imageName] = url,
                error => console.error("Failed to load image:", error)
              );
            } else {
              this.imageUrls[imageName] = this.defaultImageUrl;
            }
          },
          error => console.error("Image existence check failed:", error)
        );
      }
    });
  }
}
