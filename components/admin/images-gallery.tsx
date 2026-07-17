"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ImageOff, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/use-confirm";
import { ImageUsage } from "@/actions/getImagesWithUsage";

interface ImagesGalleryProps {
  images: ImageUsage[];
}

const BUCKET_LABELS: Record<string, string> = {
  "product-image": "Productos",
  "category-image": "Categorías",
};

const keyOf = (img: ImageUsage) => `${img.bucket}/${img.name}`;

export const ImagesGallery = ({ images }: ImagesGalleryProps) => {
  const router = useRouter();
  const [ConfirmDialog, confirm] = useConfirm();
  const [bucketFilter, setBucketFilter] = useState<"all" | string>("all");
  const [onlyUnused, setOnlyUnused] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingReplaceRef = useRef<ImageUsage | null>(null);

  const filtered = useMemo(() => {
    return images.filter((img) => {
      if (bucketFilter !== "all" && img.bucket !== bucketFilter) return false;
      if (onlyUnused && (img.products.length > 0 || img.categories.length > 0)) return false;
      return true;
    });
  }, [images, bucketFilter, onlyUnused]);

  const handleDelete = async (img: ImageUsage) => {
    if (img.categories.length > 0) {
      toast.error(
        `No se puede borrar: es la portada de "${img.categories[0].name}". Cambiala primero editando esa categoría.`
      );
      return;
    }

    const ok = await confirm({
      title: "¿Eliminar esta imagen?",
      description: (
        <div className="space-y-2 text-left">
          <p>Esta acción no se puede deshacer.</p>
          {img.products.length > 0 ? (
            <>
              <p>
                Está enlazada a {img.products.length === 1 ? "este producto" : "estos productos"}{" "}
                (se les va a sacar esta foto):
              </p>
              <ul className="list-disc pl-5 max-h-32 overflow-y-auto">
                {img.products.map((p) => (
                  <li key={p.id}>{p.name}</li>
                ))}
              </ul>
            </>
          ) : (
            <p>No está siendo usada por ningún producto ni categoría.</p>
          )}
        </div>
      ),
    });
    if (!ok) return;

    setBusyKey(keyOf(img));
    try {
      const res = await fetch("/api/admin/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bucket: img.bucket, path: img.name }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "No se pudo eliminar la imagen.");
      toast.success("Imagen eliminada correctamente.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleEditClick = (img: ImageUsage) => {
    pendingReplaceRef.current = img;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const img = pendingReplaceRef.current;
    event.target.value = "";
    if (!file || !img) return;

    const linkedTotal = img.products.length + img.categories.length;
    const ok = await confirm({
      title: "¿Reemplazar esta imagen?",
      description:
        linkedTotal > 0
          ? `La foto nueva va a reemplazar a la actual en ${
              linkedTotal === 1 ? "el lugar" : `los ${linkedTotal} lugares`
            } donde ya se usa — se actualiza sola, no hace falta editar cada producto o categoría a mano.`
          : "Esta imagen todavía no está en uso, pero igual se va a reemplazar el archivo.",
      confirmText: "Reemplazar",
      destructive: false,
    });
    if (!ok) return;

    setBusyKey(keyOf(img));
    try {
      const formData = new FormData();
      formData.append("bucket", img.bucket);
      formData.append("path", img.name);
      formData.append("file", file);

      const res = await fetch("/api/admin/images", { method: "PATCH", body: formData });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || "No se pudo reemplazar la imagen.");
      toast.success("Imagen actualizada. Puede tardar un momento en verse el cambio en todos lados.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error.");
    } finally {
      setBusyKey(null);
    }
  };

  if (images.length === 0) {
    return (
      <p className="text-center pt-[25vh] font-semibold text-xl">
        Todavía no hay imágenes subidas.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ConfirmDialog />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={bucketFilter === "all" ? "default" : "outline"}
          onClick={() => setBucketFilter("all")}
        >
          Todas ({images.length})
        </Button>
        <Button
          type="button"
          size="sm"
          variant={bucketFilter === "product-image" ? "default" : "outline"}
          onClick={() => setBucketFilter("product-image")}
        >
          Productos
        </Button>
        <Button
          type="button"
          size="sm"
          variant={bucketFilter === "category-image" ? "default" : "outline"}
          onClick={() => setBucketFilter("category-image")}
        >
          Categorías
        </Button>
        <Button
          type="button"
          size="sm"
          variant={onlyUnused ? "default" : "outline"}
          onClick={() => setOnlyUnused((prev) => !prev)}
        >
          Solo sin usar
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center pt-[15vh] text-muted-foreground">
          No hay imágenes que coincidan con el filtro.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((img) => {
            const key = keyOf(img);
            const isBusy = busyKey === key;
            const isUnused = img.products.length === 0 && img.categories.length === 0;
            const isVideo = img.name.toLowerCase().endsWith(".mp4");

            return (
              <div key={key} className="border rounded-md overflow-hidden shadow-sm bg-white">
                <div className="relative aspect-square bg-gray-100">
                  {isVideo ? (
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      muted
                      preload="metadata"
                    >
                      <source src={img.url} type="video/mp4" />
                    </video>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.url}
                      alt={img.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    {BUCKET_LABELS[img.bucket] ?? img.bucket}
                  </span>
                  {isBusy && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="p-2 space-y-1">
                  {isUnused ? (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ImageOff className="h-3 w-3" /> Sin usar
                    </p>
                  ) : (
                    <ul className="text-xs space-y-0.5 max-h-16 overflow-y-auto">
                      {img.categories.map((c) => (
                        <li key={c.id} className="truncate font-medium" title={c.name}>
                          📁 {c.name}
                        </li>
                      ))}
                      {img.products.map((p) => (
                        <li key={p.id} className="truncate" title={p.name}>
                          {p.name}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="flex gap-1 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="flex-1 px-2"
                      disabled={isBusy}
                      onClick={() => handleEditClick(img)}
                      title="Reemplazar esta imagen"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="flex-1 px-2"
                      disabled={isBusy || img.categories.length > 0}
                      onClick={() => handleDelete(img)}
                      title={
                        img.categories.length > 0
                          ? "No se puede borrar: es portada de una categoría"
                          : "Eliminar esta imagen"
                      }
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
