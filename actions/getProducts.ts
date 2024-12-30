import { Product, Query } from "@/lib/types";
const URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

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
  if (query.limit) {
    url += `limit=${query.limit}&`;
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
