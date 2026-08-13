"use client";

import { z } from "zod";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Image from "next/image";
import { Category, Material, Product } from "@/lib/types";
import { productSchema } from "@/lib/zod";
import {
  supabaseStorage,
  PRODUCT_IMAGE_BUCKET,
  removeStorageFiles,
} from "@/lib/supabase-storage";
import { ImagePickerDialog } from "@/components/admin/image-picker-dialog";
import { Heading } from "@/components/admin/heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFormProps {
  categories: Category[];
  materials: Material[];
  product: Product | null;
}

export const ProductForm = ({
  categories,
  materials,
  product,
}: ProductFormProps) => {
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>(
    product?.images || []
  );
  const router = useRouter();

  const title = product ? "Editar producto" : "Crear producto";
  const description = product
    ? "Edita un producto"
    : "Agrega un nuevo producto";
  const action = product ? "Guardar cambios" : "Agregar producto";

  const form = useForm<
    z.input<typeof productSchema>,
    unknown,
    z.output<typeof productSchema>
  >({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          price: product.price,
          stock: product.stock,
          isFeatured: product.isFeatured,
          isArchived: product.isArchived,
          images: product.images,
          category_id: product.category_id,
          material_id: product.material_id,
        }
      : {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      uploadImages(Array.from(files));
    }
  };

  const uploadImages = async (files: File[]): Promise<void> => {
    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        const fileName = encodeURIComponent(`${Date.now()}-${file.name}`);
        const { error } = await supabaseStorage.storage
          .from(PRODUCT_IMAGE_BUCKET)
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });

        if (error) throw error;

        const { data: publicUrlData } = supabaseStorage.storage
          .from(PRODUCT_IMAGE_BUCKET)
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrlData?.publicUrl || "");
      }

      setUploadedImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      toast.error("No se pudieron subir las imágenes.");
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    setUploadedImageUrls((prev) => prev.filter((image) => image !== url));
  };

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    if (uploadedImageUrls.length === 0) {
      toast.error("Subí al menos una imagen del producto.");
      return;
    }

    setSubmitting(true);
    try {
      values.images = uploadedImageUrls;

      const res = await fetch(
        product ? `/api/products/${product.id}` : "/api/products",
        {
          method: product ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "No se pudo guardar el producto.");
      }

      toast.success(
        product ? "Producto actualizado correctamente." : "Producto creado correctamente."
      );

      const removedImages = (product?.images ?? []).filter(
        (url) => !uploadedImageUrls.includes(url)
      );
      if (removedImages.length > 0) {
        await removeStorageFiles(removedImages, PRODUCT_IMAGE_BUCKET);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Heading title={title} description={description} />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 m-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                      value={field.value as number}
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
                      value={field.value as number}
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
              name="images"
              render={() => (
                <FormItem>
                  <FormLabel>Imágenes del producto</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*,video/mp4"
                      multiple
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="mb-4"
                    />
                  </FormControl>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>o</span>
                    <ImagePickerDialog
                      bucket={PRODUCT_IMAGE_BUCKET}
                      multiple
                      disabled={uploading}
                      alreadySelected={uploadedImageUrls}
                      onSelect={(urls) =>
                        setUploadedImageUrls((prev) => [...prev, ...urls])
                      }
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {uploadedImageUrls.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {uploadedImageUrls.map((url) => (
                <div key={url} className="relative w-20 h-20 group">
                  {url.endsWith(".mp4") ? (
                    <video
                      className="w-20 h-20 object-cover rounded border"
                      muted
                      loop
                      playsInline
                      autoPlay
                      preload="none"
                    >
                      <source src={url} type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      src={url}
                      alt="Vista previa"
                      fill
                      sizes="80px"
                      className="object-cover rounded border"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                    title="Quitar imagen"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      Este producto no aparecerá en la tienda.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={uploading || submitting}>
            {uploading ? "Subiendo..." : submitting ? "Guardando..." : action}
          </Button>
        </form>
      </Form>
    </>
  );
};
