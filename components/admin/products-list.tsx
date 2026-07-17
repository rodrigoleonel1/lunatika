"use client";

import { useMemo, useState } from "react";
import { Category, Material, Product } from "@/lib/types";
import { ProductItem } from "@/components/admin/product-item";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductsListProps {
  products: Product[];
  categories: Category[];
  materials: Material[];
}

const ALL = "all";

export const ProductsList = ({
  products,
  categories,
  materials,
}: ProductsListProps) => {
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [materialFilter, setMaterialFilter] = useState<string>(ALL);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        categoryFilter === ALL || product.category_id === categoryFilter;
      const matchesMaterial =
        materialFilter === ALL || product.material_id === materialFilter;
      return matchesCategory && matchesMaterial;
    });
  }, [products, categoryFilter, materialFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="sm:w-60">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={materialFilter} onValueChange={setMaterialFilter}>
          <SelectTrigger className="sm:w-60">
            <SelectValue placeholder="Filtrar por material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos los materiales</SelectItem>
            {materials.map((material) => (
              <SelectItem key={material.id} value={material.id}>
                {material.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center pt-[15vh] font-semibold text-xl">
          No hay productos que coincidan con el filtro.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
