import { Product } from "@/lib/types";

export const getProducts = async (): Promise<Product[]> => {
  // Correct the URL by removing the extra slash
  const res = await fetch("http://localhost:3000/api/products", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  // Ensure the response is valid before parsing
  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.statusText}`);
  }

  // Parse the JSON data
  const data = await res.json();

  // Log the data (optional)
  console.log(data);

  return data; // Return the parsed data
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  const res = await fetch("http://localhost:3000/api/products", {
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
