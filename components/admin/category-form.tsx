"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Category } from "@/lib/types";
import { categorySchema } from "@/lib/zod";
import { Heading } from "@/components/admin/heading";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CATEGORY_IMAGE_BUCKET, removeStorageFiles } from "@/lib/supabase-storage";
import { ImagePickerDialog } from "@/components/admin/image-picker-dialog";

interface CategoryFromProps {
  category: Category | null;
}

export const CategoryForm = ({ category }: CategoryFromProps) => {
  const router = useRouter();
  const [uploadedImageUrl, setUploadedImageUrls] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const title = category ? "Editar categoría" : "Crear categoría";
  const description = category
    ? "Edita el nombre de la categoría"
    : "Agrega una nueva categoría";
  const action = category ? "Guardar cambios" : "Agregar categoría";

  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: category || {
      name: "",
      billboard: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      uploadImage(files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("bucket", CATEGORY_IMAGE_BUCKET);
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "No se pudo subir la imagen.");
      }
      const data = (await res.json()) as { url: string };
      setUploadedImageUrls(data.url);
    } catch (error) {
      toast.error("No se pudo subir la imagen.");
      console.log("Error subiendo la imagen:", error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof categorySchema>) => {
    setSubmitting(true);
    try {
      const oldBillboard = category?.billboard;
      const replacedBillboard = Boolean(
        category && uploadedImageUrl.length > 0 && uploadedImageUrl !== oldBillboard
      );

      if (category) {
        values.billboard = uploadedImageUrl.length > 0 ? uploadedImageUrl : category.billboard;
      } else {
        if (uploadedImageUrl.length === 0) {
          toast.error("Subí una imagen de portada.");
          setSubmitting(false);
          return;
        }
        values.billboard = uploadedImageUrl;
      }

      const res = await fetch(
        category ? `/api/categories/${category.id}` : "/api/categories",
        {
          method: category ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "No se pudo guardar la categoría.");
      }

      toast.success(
        category ? "Categoría actualizada correctamente." : "Categoría creada correctamente."
      );

      if (replacedBillboard && oldBillboard) {
        await removeStorageFiles([oldBillboard], CATEGORY_IMAGE_BUCKET);
      }

      router.push("/admin/categories");
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
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la categoría</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresá el nombre de la categoría"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(category || uploadedImageUrl) && (
            <section>
              <h2 className="text-sm font-medium">Portada de la categoría</h2>
              <figure className="relative rounded-md overflow-hidden w-40 h-40 bg-gray-100">
                <img
                  src={uploadedImageUrl || category!.billboard}
                  alt={category?.name ?? "Vista previa"}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </figure>
            </section>
          )}

          <FormField
            control={form.control}
            name="billboard"
            render={() => (
              <FormItem>
                <FormLabel>
                  {category
                    ? "Nueva portada de la categoría"
                    : "Portada de la categoría"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="mb-4"
                  />
                </FormControl>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>o</span>
                  <ImagePickerDialog
                    bucket={CATEGORY_IMAGE_BUCKET}
                    disabled={uploading}
                    onSelect={(urls) => setUploadedImageUrls(urls[0])}
                  />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={uploading || submitting}>
            {uploading ? "Subiendo imagen..." : submitting ? "Guardando..." : action}
          </Button>
        </form>
      </Form>
    </>
  );
};
