"use client";

import Link from "next/link";
import { Material } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { useDeleteResource } from "@/hooks/use-delete-resource";

interface MaterialsListProps {
  materials: Material[];
}

export const MaterialsList = ({ materials }: MaterialsListProps) => {
  const [ConfirmDialog, confirm] = useConfirm();
  const { deletingId, deleteResource } = useDeleteResource();

  const onDelete = async (materialId: string, materialName: string) => {
    const ok = await confirm({
      title: "¿Eliminar este material?",
      description: `Se va a eliminar "${materialName}" de forma permanente. Esta acción no se puede deshacer.`,
    });
    if (!ok) return;

    await deleteResource(
      `/api/materials/${materialId}`,
      materialId,
      "Material eliminado correctamente."
    );
  };

  if (materials.length === 0) {
    return (
      <p className="text-center pt-[25vh] font-semibold text-xl">
        Todavía no hay materiales.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <ConfirmDialog />
      {materials.map((material) => (
        <section
          key={material.id}
          className="font-medium border p-4 rounded-md shadow-md hover:shadow-lg"
        >
          <h2>Material: {material.name}</h2>
          <p className="text-gray-600">Id: {material.id}</p>
          <footer className="mt-4 flex sm:flex-col gap-2">
            <Link className="w-full" href={`/admin/materials/${material.id}`}>
              <Button className="w-full">Editar material </Button>
            </Link>
            <Button
              onClick={() => onDelete(material.id, material.name)}
              className="w-full"
              disabled={deletingId === material.id}
              variant={"destructive"}
            >
              Eliminar material
            </Button>
          </footer>
        </section>
      ))}
    </div>
  );
};
