"use client";

import Link from "next/link";
import Image from "next/image";
import { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteResource } from "@/hooks/use-delete-resource";

interface CategoriesListProps {
  categories: Category[];
}

export const CategoriesList = ({ categories }: CategoriesListProps) => {
  const [ConfirmDialog, confirm] = useConfirm();
  const { deletingId, deleteResource } = useDeleteResource();

  const onDelete = async (categoryId: string, categoryName: string) => {
    const ok = await confirm({
      title: "¿Eliminar esta categoría?",
      description: `Se va a eliminar "${categoryName}" de forma permanente. Esta acción no se puede deshacer.`,
    });
    if (!ok) return;

    await deleteResource(
      `/api/categories/${categoryId}`,
      categoryId,
      "Categoría eliminada correctamente."
    );
  };

  if (categories.length === 0) {
    return (
      <p className="text-center pt-[25vh] font-semibold text-xl">
        Todavía no hay categorías.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <ConfirmDialog />
      {categories.map((category) => (
        <section
          key={category.id}
          className="font-medium border p-4 rounded-md shadow-md hover:shadow-lg space-y-4"
        >
          <div className="space-y-1 ">
            <div className="relative w-full aspect-video overflow-hidden rounded-md">
              <Image
                src={category.billboard}
                alt={category.name}
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover"
              />
            </div>
            <h2>Categoría: {category.name}</h2>
            <p className="text-gray-600">Id: {category.id}</p>
          </div>

          <footer className="flex sm:flex-col gap-2">
            <Link className="w-full" href={`/admin/categories/${category.id}`}>
              <Button className="w-full">Editar categoría </Button>
            </Link>
            <Button
              onClick={() => onDelete(category.id, category.name)}
              className="w-full"
              disabled={deletingId === category.id}
              variant={"destructive"}
            >
              Eliminar categoría
            </Button>
          </footer>
        </section>
      ))}
    </div>
  );
};
