"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Category, Material, Query } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaterialSelectProps {
  query?: Query;
  basePath: string;
  categories: Category[];
  materials: Material[];
}

const ALL_CATEGORIES = "Todas";
const ALL_MATERIALS = "Todos";

export default function MaterialSelect({
  query,
  basePath,
  categories,
  materials,
}: MaterialSelectProps) {
  const router = useRouter();
  // Se inicializan a partir del query actual para que el select refleje el
  // filtro aplicado (antes siempre arrancaban vacíos y mostraban el
  // placeholder aunque ya hubiera un filtro activo en la URL).
  const [selectedMaterial, setSelectedMaterial] = useState<string>(
    query?.material ?? ""
  );
  const [selectedCategory, setSelectedCategory] = useState<string>(
    query?.category ?? ""
  );

  const handleMaterialChange = (value: string) => {
    const material = value === ALL_MATERIALS ? "" : value;
    setSelectedMaterial(material);
    const params = material ? `?material=${encodeURIComponent(material)}` : "";
    router.push(`${basePath}${params}`);
  };

  const handleCategoryChange = (value: string) => {
    const params = selectedMaterial
      ? `?material=${encodeURIComponent(selectedMaterial)}`
      : "";

    if (value === ALL_CATEGORIES) {
      setSelectedCategory("");
      router.push(`/products${params}`);
    } else {
      setSelectedCategory(value);
      router.push(`/category/${encodeURIComponent(value)}${params}`);
    }
  };

  return (
    <section className="flex justify-end flex-wrap gap-2">
      <Select onValueChange={handleCategoryChange} value={selectedCategory}>
        <SelectTrigger className="md:w-[180px]">
          <SelectValue placeholder="Categorías" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.name}>
              {cat.name}
            </SelectItem>
          ))}
          <SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={handleMaterialChange} value={selectedMaterial}>
        <SelectTrigger className="md:w-[180px]">
          <SelectValue placeholder="Materiales" />
        </SelectTrigger>
        <SelectContent>
          {materials.map((mat) => (
            <SelectItem key={mat.id} value={mat.name}>
              {mat.name}
            </SelectItem>
          ))}
          <SelectItem value={ALL_MATERIALS}>Todos los materiales</SelectItem>
        </SelectContent>
      </Select>
    </section>
  );
}
