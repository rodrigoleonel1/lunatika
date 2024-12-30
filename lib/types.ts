export interface Category {
  id: string;
  name: string;
  billboard: string;
  createdAt: Date;
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
  category: {
    name: string;
  };
  material: {
    name: string;
  };
}

export interface Query {
  category?: string;
  material?: string;
  isFeatured?: boolean;
  limit?: number;
}
