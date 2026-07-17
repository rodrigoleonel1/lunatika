"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { Material } from "@/lib/types";
import { materialSchema } from "@/lib/zod";
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

interface MaterialFromProps {
  material: Material | null;
}

export const MaterialForm = ({ material }: MaterialFromProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = material ? "Editar material" : "Crear material";
  const description = material
    ? "Edita el nombre del material"
    : "Agrega un nuevo material";
  const action = material ? "Guardar cambios" : "Agregar material";

  const form = useForm<z.infer<typeof materialSchema>>({
    resolver: zodResolver(materialSchema),
    defaultValues: material || {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof materialSchema>) => {
    setLoading(true);
    try {
      const res = await fetch(
        material ? `/api/materials/${material.id}` : "/api/materials",
        {
          method: material ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "No se pudo guardar el material.");
      }

      toast.success(
        material ? "Material actualizado correctamente." : "Material creado correctamente."
      );
      router.push("/admin/materials");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setLoading(false);
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
                <FormLabel>Nombre del material</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresá el nombre del material"
                    type="text"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : action}
          </Button>
        </form>
      </Form>
    </>
  );
};
