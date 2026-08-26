"use client";

import Link from "next/link";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteResource } from "@/hooks/use-delete-resource";

interface ProductItemProps {
  product: Product;
}

export const ProductItem = ({ product }: ProductItemProps) => {
  const [ConfirmDialog, confirm] = useConfirm();
  const { deletingId, deleteResource } = useDeleteResource();
  const deleting = deletingId === product.id;

  const onDelete = async () => {
    const ok = await confirm({
      title: "¿Eliminar este producto?",
      description: `Se va a eliminar "${product.name}" de forma permanente. Esta acción no se puede deshacer.`,
    });
    if (!ok) return;

    await deleteResource(
      `/api/products/${product.id}`,
      product.id,
      "Producto eliminado correctamente."
    );
  };

  return (
    <section className="font-medium border p-4 rounded-md shadow-md hover:shadow-lg space-y-3">
      <ConfirmDialog />
      <div className="relative w-full aspect-square overflow-hidden rounded-md bg-gray-100">
        {product.images[0]?.endsWith(".mp4") ? (
          <video
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
          >
            <source src={product.images[0]} type="video/mp4" />
          </video>
        ) : (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {product.isArchived && (
          <span className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            Archivado
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded">
            Destacado
          </span>
        )}
      </div>
      <div>
        <h2>{product.name}</h2>
        <p className="text-gray-600">${product.price}</p>
        <p className="text-gray-600 text-sm">
          {product.category.name} · {product.material.name} · Stock:{" "}
          {product.stock}
        </p>
      </div>
      <footer className="flex sm:flex-col gap-2">
        <Link className="w-full" href={`/admin/products/${product.id}`}>
          <Button className="w-full">Editar producto</Button>
        </Link>
        <Button
          onClick={onDelete}
          className="w-full"
          disabled={deleting}
          variant={"destructive"}
        >
          Eliminar producto
        </Button>
      </footer>
    </section>
  );
};
