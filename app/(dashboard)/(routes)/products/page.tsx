"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("product")
          .select("*")
          .order("createdAt", { ascending: false }); // Ordena los productos por fecha de creación

        if (error) {
          setError(error.message);
        } else if (data) {
          setProducts(data);
        }
      } catch (error: any) {
        setError("Hubo un error al obtener los productos");
      }
    };

    fetchProducts();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (products.length === 0) {
    return <div>No hay productos creados.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Productos</h1>

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