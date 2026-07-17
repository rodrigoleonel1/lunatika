"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

/**
 * Centraliza el patrón repetido de "pegarle a un DELETE, mostrar toast de
 * éxito/error y refrescar la página" que se repetía casi idéntico en las
 * listas de categorías, materiales y productos del admin.
 */
export function useDeleteResource() {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteResource = async (
    url: string,
    id: string,
    successMessage: string
  ): Promise<boolean> => {
    setDeletingId(id);
    try {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "No se pudo eliminar.");
      }
      toast.success(successMessage);
      router.refresh();
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error.");
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  return { deletingId, deleteResource };
}
