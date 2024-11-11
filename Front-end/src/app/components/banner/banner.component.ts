import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-banner',
  templateUrl: './banner.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class BannerComponent implements OnInit, OnDestroy {
  currentSlide = 0;
  intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % 3;
  }

  prevSlide() {
    this.currentSlide = (this.currentSlide - 1 + 3) % 3;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }
}
