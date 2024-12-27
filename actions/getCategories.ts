import { Category } from "@/lib/types";
const URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const getCategories = async (): Promise<Category[]> => {
  const res = await fetch(`${URL}/api/categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }

  const data = await res.json();
  return data;
};
