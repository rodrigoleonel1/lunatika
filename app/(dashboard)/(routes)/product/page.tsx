"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(255, "El nombre no debe exceder los 255 caracteres"),
  price: z.coerce.number().min(1, "El precio debe ser un número positivo"),
  stock: z.coerce
    .number()
    .min(1, "El stock debe ser un número entero positivo"),
  isFeatured: z.boolean().optional().default(false),
  isArchived: z.boolean().optional().default(false),
  images: z
    .array(z.string().url("Cada imagen debe ser una URL válida"))
    .optional(),
  category_id: z.string().uuid("El ID de la categoría debe ser un UUID válido"),
  material_id: z.string().uuid("El ID del material debe ser un UUID válido"),
});

interface Category {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
}

export default function ProductPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      isFeatured: false,
      isArchived: false,
      images: [],
      category_id: "",
      material_id: "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("category").select("*");
      if (error) {
        setError(error.message);
      } else if (data) {
        setCategories(data);
      }
    };

    const fetchMaterials = async () => {
      const { data, error } = await supabase.from("material").select("*");
      if (error) {
        setError(error.message);
      } else if (data) {
        setMaterials(data);
      }
    };

    fetchCategories();
    fetchMaterials();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      uploadImages(fileArray);
    }
  };

  const uploadImages = async (files: File[]): Promise<void> => {
    setUploading(true);
    setError(null);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileName = encodeURIComponent(`${Date.now()}-${file.name}`);
        const { data, error } = await supabase.storage
          .from("product-image")
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });

          console.log(data)

        if (error) {
          throw error;
        }

        const { data: publicUrlData } = supabase.storage
          .from("product-image")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrlData?.publicUrl || "");
      }

      setUploadedImageUrls(uploadedUrls);
    } catch (error) {
      console.log(error)
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (uploadedImageUrls.length > 0) {
      values.images = uploadedImageUrls; // Asigna las URLs de las imágenes subidas al formulario
    }

    const res = await fetch("/api/product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json();
    console.log(data[0]);
  };

  if (error) return <p>Error: {error}</p>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 p-4 m-auto"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del producto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresá el nombre del producto"
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio del producto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresá el precio del producto"
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock del producto</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ingresá el stock del producto"
                  type="number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="material_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Material</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un material" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {materials.map((material) => (
                    <SelectItem key={material.id} value={material.id}>
                      {material.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFeatured"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Presentado</FormLabel>
                <FormDescription>
                  Este producto aparecerá en la página de inicio.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isArchived"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Archivado</FormLabel>
                <FormDescription>
                  Este producto no aparecerá en ninguna parte de la tienda.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={() => (
            <FormItem>
              <FormLabel>Imágenes del producto</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="mb-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={uploading}>
          {uploading ? "Subiendo..." : "Agregar producto"}
        </Button>
      </form>
    </Form>
  );
}
