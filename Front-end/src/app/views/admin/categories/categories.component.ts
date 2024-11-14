import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-category',
  templateUrl: './categories.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  paginatedCategories: Category[] = [];
  category: Category = { cate_id: 0, cate_name: '' };
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  getDisplayedCount(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.categories.length);
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
        this.applyPagination();
      },
      error => {
        console.error('Error fetching categories', error);
      }
    );
  }

  createCategory(): void {
    this.categoryService.createCategory(this.category).subscribe(
      () => {
        this.loadCategories();
        this.resetForm();
        this.toggleModal();
      },
      error => {
        console.error('Error creating category', error);
      }
    );
  }

  editCategory(cate: Category): void {
    this.category = { ...cate };
    this.isEditMode = true;
    this.toggleModal();
  }

  updateCategory(): void {
    this.categoryService.updateCategory(this.category).subscribe(
      () => {
        this.loadCategories();
        this.resetForm();
        this.isEditMode = false;
        this.toggleModal();
      },
      error => {
        console.error('Error updating category', error);
      }
    );
  }

  deleteCategory(cate_id: number): void {
    this.categoryService.deleteCategory(cate_id).subscribe(
      () => {
        this.loadCategories();
      },
      error => {
        console.error('Error deleting category', error);
      }
    );
  }

  resetForm(): void {
    this.category = { cate_id: 0, cate_name: '' };
    this.isEditMode = false;
  }

  toggleModal(): void {
    this.isModalOpen = !this.isModalOpen;
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.categories.length) {
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

  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedCategories = this.categories.slice(startIndex, startIndex + this.itemsPerPage);
  }
}
