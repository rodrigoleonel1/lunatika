"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Query } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MaterialSelectProps {
  query?: Query;
  category: string;
}

export default function MaterialSelect({
  query,
  category,
}: MaterialSelectProps) {
  const router = useRouter();
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const handleMaterialChange = (value: string) => {
    const material = value == "Todos" ? "" : value;
    setSelectedMaterial(material);
    if (category == "Todos nuestros productos.") {
      router.push(`/products?material=${material}`);
    } else {
      router.push(`/category/${category}?material=${material}`);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value == "Todas") {
      router.push("/products");
    } else {
      const category = value;
      console.log(selectedMaterial);
      setSelectedCategory(category);
      router.push(`/category/${category}?material=${selectedMaterial}`);
    }
  };

  return (
    <section className="flex justify-end flex-wrap gap-2">
      <Select onValueChange={handleCategoryChange} value={selectedCategory}>
        <SelectTrigger className="md:w-[180px]">
          <SelectValue
            placeholder={query.category ? query.category : "Categorías"}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={"Anillos"}>Anillos</SelectItem>
          <SelectItem value={"Aritos"}>Aritos</SelectItem>
          <SelectItem value={"Cadenas"}>Cadenas</SelectItem>
          <SelectItem value={"Pulseras"}>Pulseras</SelectItem>
          <SelectItem value={"Todas"}>Todas las categorías</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={handleMaterialChange} value={selectedMaterial}>
        <SelectTrigger className="md:w-[180px]">
          <SelectValue
            placeholder={query.material ? query.material : "Materiales"}
          />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={"Acero%20Quirúrgico"}>Acero Quirúrgico</SelectItem>
          <SelectItem value={"Acero%20Blanco"}>Acero Blanco</SelectItem>
          <SelectItem value={"Acero%20Dorado"}>Acero Dorado</SelectItem>
          <SelectItem value={"Todos"}>Todos los materiales</SelectItem>
        </SelectContent>
      </Select>
    </section>
  );
}
