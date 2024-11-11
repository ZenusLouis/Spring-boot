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
  categories: Category[] = [];  // Full list of categories
  paginatedCategories: Category[] = [];  // Categories shown on the current page
  category: Category = { cate_id: 0, cate_name: '' };
  isEditMode: boolean = false;
  isModalOpen: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // Calculate the end of the displayed count for the current page
  getDisplayedCount(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.categories.length);
  }

  // Load all categories and apply pagination
  loadCategories(): void {
    this.categoryService.getCategories().subscribe(
      (data: Category[]) => {
        this.categories = data;
        this.applyPagination();  // Paginate after loading data
      },
      error => {
        console.error('Error fetching categories', error);
      }
    );
  }

  // Create a new category
  createCategory(): void {
    this.categoryService.createCategory(this.category).subscribe(
      () => {
        this.loadCategories();  // Refresh categories list
        this.resetForm();
        this.toggleModal();  // Close modal after creation
      },
      error => {
        console.error('Error creating category', error);
      }
    );
  }

  // Edit an existing category
  editCategory(cate: Category): void {
    this.category = { ...cate };
    this.isEditMode = true;
    this.toggleModal();  // Open modal for editing
  }

  // Update an existing category
  updateCategory(): void {
    this.categoryService.updateCategory(this.category).subscribe(
      () => {
        this.loadCategories();
        this.resetForm();
        this.isEditMode = false;
        this.toggleModal();  // Close modal after update
      },
      error => {
        console.error('Error updating category', error);
      }
    );
  }

  // Delete a category
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

  // Reset the form
  resetForm(): void {
    this.category = { cate_id: 0, cate_name: '' };
    this.isEditMode = false;
  }

  // Toggle modal visibility
  toggleModal(): void {
    this.isModalOpen = !this.isModalOpen;
  }

  // Navigate to the next page
  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.categories.length) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  // Navigate to the previous page
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  // Apply pagination to the categories
  applyPagination() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedCategories = this.categories.slice(startIndex, startIndex + this.itemsPerPage);
  }
}
