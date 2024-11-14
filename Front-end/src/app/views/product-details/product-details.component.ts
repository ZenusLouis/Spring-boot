import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { CategoryService } from '../../services/category.service';
import { ReviewService } from '../../services/review.service';
import { UserService } from '../../services/user.service';
import { Product } from '../../models/product.model';
import { Category } from '../../models/category.model';
import { Review, Reaction, Reply } from '../../models/review.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationComponent } from '../../components/notification/notification';
import { forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  imports: [CommonModule, FormsModule, NotificationComponent],
  standalone: true,

})
export class ProductDetailsComponent implements OnInit {
  Math = Math;
  product: Product | null = null;
  user: User | null = null;
  category: Category | null = null;
  quantity: number = 1;
  imageUrls: { [key: string]: string } = {};
  defaultImageUrl = 'assets/images/default.png';
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' | 'info' = 'info';
  reviewRating: number = 5;
  reviewContent: string = '';
  reviews: Review[] = [];
  averageRating: number = 0;
  replyContent: { [key: number]: string } = {};
  reactionTypes: string[] = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'];
  replyBoxStates: { [reviewId: number]: boolean } = {};
  usernames: { [userId: number]: string } = {};
  collapsedReplies: { [reviewId: number]: boolean } = {};
  paginatedReviews: Review[] = [];
  totalReviewsCount: number = 0;
  showAllReviews: boolean = false;
  currentPage: number = 1;
  reviewsPerPage: number = 5;

  @ViewChild('replyInput', { static: false }) replyInput!: ElementRef;

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private cartService: CartService,
    private reviewService: ReviewService,
    private userService: UserService,
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
    this.loadProduct();
    this.loadCurrentUser();
    this.replyBoxStates = {};
    this.collapsedReplies = {};
  }

  loadCurrentUser() {
    const userId = Number(localStorage.getItem('user_id'));
    if (userId) {
      this.userService.getUserDetails(userId).subscribe(
        userData => this.user = userData,
        error => console.error('Error fetching user data:', error)
      );
    }
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
          this.loadReviews(productId);
          this.loadAverageRating(productId);
          this.updatePaginatedReviews();
        },
        error => console.error('Error loading product:', error)
      );
    }
  }
  loadReviews(productId: number) {
    this.reviewService.getReviewsByProductId(productId).pipe(
      switchMap((reviews) => {
        this.reviews = reviews;
        this.replyBoxStates = {};
        this.collapsedReplies = {};

        reviews.forEach(review => {
          this.replyBoxStates[review.reviewId!] = false;
          this.collapsedReplies[review.reviewId!] = true;
        });

        const userRequests = reviews.map((review) =>
          this.userService.getUserDetails(review.userId).pipe(
            switchMap(userData => {
              this.usernames[review.userId] = userData.username; // Save username by userId
              return [review];
            })
          )
        );
        return forkJoin(userRequests);
      })
    ).subscribe(
      () => { },
      error => {
        console.error('Error loading reviews:', error);
      }
    );
  }

  loadAverageRating(productId: number) {
    this.reviewService.getAverageRating(productId).subscribe(
      data => {
        this.averageRating = data;
      },
      error => {
        console.error('Error loading average rating:', error);
      }
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
        this.quantity = this.product.pro_stock;
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

  setRating(rating: number) {
    this.reviewRating = rating;
  }

  submitReview() {
    const userId = this.user?.id;
    if (this.reviewContent.trim() && userId) {
      const newReview: Review = {
        content: this.reviewContent,
        rating: this.reviewRating,
        productId: this.product!.pro_id,
        userId: userId,
      };

      this.reviewService.addReview(newReview.productId, userId, newReview).subscribe(
        (response) => {
          this.showNotificationMessage("Review submitted successfully!", "success");
          this.reviewContent = '';
          this.loadReviews(this.product!.pro_id);
        },
        (error) => {
          this.showNotificationMessage("Failed to submit review!", "error");
          console.error('Error submitting review:', error);
        }
      );
    } else {
      this.showNotificationMessage("Please write a review before submitting!", "info");
    }
  }

  toggleReplies(reviewId: number) {
    this.collapsedReplies[reviewId] = !this.collapsedReplies[reviewId];
  }

  toggleReplyBox(reviewId: number, username?: string) {
    Object.keys(this.replyBoxStates).forEach(key => {
      if (Number(key) !== reviewId) {
        this.replyBoxStates[Number(key)] = false;
      }
    });
    this.replyBoxStates[reviewId] = !this.replyBoxStates[reviewId];
    if (this.replyBoxStates[reviewId] && username) {
      this.replyContent[reviewId] = `@${username} `;
    } else if (this.replyBoxStates[reviewId]) {
      this.replyContent[reviewId] = '';
    }
    setTimeout(() => {
      if (this.replyInput) {
        this.replyInput.nativeElement.focus();
      }
    }, 0);
  }

  submitReply(reviewId: number) {
    if (this.replyContent[reviewId]?.trim() && this.user) {
      const newReply: Reply = {
        content: this.replyContent[reviewId],
        userId: this.user.id,
        reviewId: reviewId,
        createdAt: new Date(),
        username: this.user.username
      };

      this.reviewService.addReply(reviewId, this.user.id, newReply).subscribe(
        (reply) => {
          const review = this.reviews.find(r => r.reviewId === reviewId);
          if (review) {
            review.replies = review.replies || [];
            review.replies.push(newReply);
          }
          this.replyContent[reviewId] = '';
          this.replyBoxStates[reviewId] = false;
        },
        (error) => {
          console.error('Failed to submit reply:', error);
        }
      );
    }
  }

  reactToReview(reviewId: number, reactionType: string) {
    const transformedType = reactionType.toUpperCase();
    if (this.user) {
      const reaction: Reaction = {
        userId: this.user.id,
        reviewId: reviewId,
        reactionType: transformedType,
      };

      this.reviewService.reactToReview(reviewId, this.user.id, reaction).subscribe(
        () => {
          this.updateReviewReactionCount(reviewId, transformedType, 'review');
        },
        (error) => {
          console.error('Error reacting to review:', error.error ? error.error.message : error);
          this.showNotificationMessage("Failed to react to review", 'error');
        }
      );
    }
  }

  updateReviewReactionCount(id: number, reactionType: string, type: 'review' | 'reply') {
    let target: Review | Reply | undefined = undefined;

    if (type === 'review') {
      target = this.reviews.find(r => r.reviewId === id);
    } else if (type === 'reply') {
      for (let review of this.reviews) {
        const reply = review.replies?.find(r => r.replyId === id);
        if (reply) {
          target = reply as Reply;
          break;
        }
      }
    }

    if (target) {
      switch (reactionType) {
        case 'LIKE':
          target.likeCount = (target.likeCount || 0) + 1;
          break;
        case 'LOVE':
          target.loveCount = (target.loveCount || 0) + 1;
          break;
        case 'HAHA':
          target.hahaCount = (target.hahaCount || 0) + 1;
          break;
        case 'WOW':
          target.wowCount = (target.wowCount || 0) + 1;
          break;
        case 'SAD':
          target.sadCount = (target.sadCount || 0) + 1;
          break;
        case 'ANGRY':
          target.angryCount = (target.angryCount || 0) + 1;
          break;
        default:
          break;
      }
    }
  }

  getReactionCount(item: Review | Reply, reactionType: string): number {
    switch (reactionType) {
      case 'LIKE':
        return item.likeCount || 0;
      case 'LOVE':
        return item.loveCount || 0;
      case 'HAHA':
        return item.hahaCount || 0;
      case 'WOW':
        return item.wowCount || 0;
      case 'SAD':
        return item.sadCount || 0;
      case 'ANGRY':
        return item.angryCount || 0;
      default:
        return 0;
    }
  }

  getUsername(userId: number): string {
    return this.usernames[userId] || 'Unknown';
  }

  getTimeAgo(date: Date | string | undefined): string {
    if (!date) return "Date not available";

    const reviewDate = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(reviewDate.getTime())) return "Invalid date";

    const now = new Date();
    const timeDifference = Math.floor((now.getTime() - reviewDate.getTime()) / 1000 / 60);

    if (timeDifference < 1) return "Just now";
    if (timeDifference < 60) return `${timeDifference} minutes ago`;

    const hours = Math.floor(timeDifference / 60);
    if (hours < 24) return `${hours} hours ago`;

    const days = Math.floor(hours / 24);
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  loadMoreReviews() {
    this.showAllReviews = true;
    this.currentPage = 1;
    this.updatePaginatedReviews();
  }

  updatePaginatedReviews(): void {
    const startIndex = (this.currentPage - 1) * this.reviewsPerPage;
    const endIndex = startIndex + this.reviewsPerPage;
    this.paginatedReviews = this.reviews.slice(startIndex, endIndex);
  }

  nextPage() {
    if (this.currentPage * this.reviewsPerPage < this.reviews.length) {
      this.currentPage++;
      this.updatePaginatedReviews();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedReviews();
    }
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.reviews.length / this.reviewsPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePaginatedReviews();
  }
}
