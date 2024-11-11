import { Category } from './category.model';

export interface Product {
  pro_id: number;
  pro_name: string;
  pro_des: string;
  pro_price: number;
  pro_stock: number;
  pro_status: number;
  category: Category;
  pro_image?: string;
}