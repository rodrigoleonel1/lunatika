export interface Category {
  id: string;
  name: string;
}

export interface Material {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  category_id: string;
  material_id: string;
  name: string;
  price: number;
  stock: number;
  isFeatured: boolean;
  isArchived: boolean;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}