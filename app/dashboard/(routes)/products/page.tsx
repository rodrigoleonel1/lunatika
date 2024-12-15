"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  isFeatured: boolean;
  isArchived: boolean;
  images: string[];
  category_id: string;
  material_id: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("product")
          .select("*")
          .order("createdAt", { ascending: false });
        if (error) {
          console.log(error);
        } else if (data) {
          console.log(data);
          setProducts(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchProducts();
  }, []);

  if (products.length === 0) {
    return <div className="p-4">No hay productos creados.</div>;
  }

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-6">
      <Heading
        title={`Productos (${products.length})`}
        description="Gestiona productos para tu tienda"
      />
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border p-4 rounded-md shadow-md hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600">Precio: ${product.price}</p>
            <p className="text-gray-600">Stock: {product.stock}</p>
            <p className="text-gray-500">
              {product.isFeatured ? "Destacado" : "No Destacado"}
            </p>
            <p className="text-gray-500">
              {product.isArchived ? "Archivado" : "Activo"}
            </p>

            <div className="mt-4">
              <h3 className="text-lg font-medium">Imágenes</h3>
              <div className="flex space-x-2 mt-2">
                {product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Imagen del producto ${product.name}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button className="text-blue-500 hover:underline">
                Ver Detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
