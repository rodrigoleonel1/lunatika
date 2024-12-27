import { Product } from "@/lib/types";
const URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

interface Query {
  category?: string;
  material?: string;
  isFeatured?: boolean;
}

export const getProducts = async (query: Query): Promise<Product[]> => {
  let url = `${URL}/api/products?`;
  if (query.category) {
    url += `category=${query.category}&`;
  }
  if (query.material) {
    url += `material=${query.material}&`;
  }
  if (query.isFeatured) {
    url += `featured=${query.isFeatured}&`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const res = await fetch(`${URL}/api/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }

  const data = await res.json();

  const featuredProducts = data.filter(
    (product: Product) => product.isFeatured
  );

  return featuredProducts;
};
