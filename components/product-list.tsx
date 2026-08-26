"use client";

import { useEffect, useState } from "react";
import { Category, Material, Product, Query } from "@/lib/types";
import ProductCard from "./product-card";
import { Heading } from "./ui/heading";
import NoResults from "./ui/no-results";
import { Container } from "./container";
import MaterialSelect from "./material-select";
import { Button } from "./ui/button";

interface ProductListProps {
  title: string;
  items: Product[];
  filters?: boolean;
  query: Query;
  basePath?: string;
  categories?: Category[];
  materials?: Material[];
}

export default function ProductList({
  title,
  items: initialItems,
  filters,
  query,
  basePath = "/products",
  categories = [],
  materials = [],
}: ProductListProps) {
  const [items, setItems] = useState<Product[]>(initialItems);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialItems.length === 12);

  useEffect(() => {
    setItems(initialItems);
    setPage(1);
    setHasMore(initialItems.length === 12);
  }, [initialItems]);

  const handleLoadMore = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.category) params.set("category", query.category);
      if (query.material) params.set("material", query.material);
      if (query.isFeatured) params.set("featured", "true");
      params.set("page", String(page + 1));
      params.set("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Error al cargar más productos");
      const data: Product[] = await res.json();

      setItems((prev) => [...prev, ...data]);
      setPage((p) => p + 1);
      if (data.length < 12) setHasMore(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Heading title={title} separator />
      {filters && (
        <MaterialSelect query={query} basePath={basePath} categories={categories} materials={materials} />
      )}
      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
      {hasMore && items.length > 0 && (
        <div className="flex justify-center mt-8">
          <Button onClick={handleLoadMore} disabled={loading} variant="outline" className="min-w-40">
            {loading ? "Cargando..." : "Cargar más"}
          </Button>
        </div>
      )}
    </Container>
  );
}
