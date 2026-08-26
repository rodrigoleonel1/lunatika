"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ImagesIcon, Loader2 } from "lucide-react";
import { listStorageFiles, StorageFile } from "@/lib/supabase-storage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ImagePickerDialogProps {
  bucket: string;
  /** Si es true, permite tildar varias y confirmar con un botón; si es
   * false, elegir una imagen la selecciona y cierra el diálogo al toque. */
  multiple?: boolean;
  /** URLs ya elegidas, para no dejar clickear de nuevo lo que ya está agregado
   * (solo aplica cuando multiple=true, en un producto con varias fotos). */
  alreadySelected?: string[];
  onSelect: (urls: string[]) => void;
  disabled?: boolean;
}

const PAGE_SIZE = 40;

export const ImagePickerDialog = ({
  bucket,
  multiple = false,
  alreadySelected = [],
  onSelect,
  disabled,
}: ImagePickerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [picked, setPicked] = useState<string[]>([]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const list = await listStorageFiles(bucket);
      setFiles(list);
      setVisibleCount(PAGE_SIZE);
    } catch (error) {
      toast.error("No pude cargar las imágenes ya subidas.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setPicked([]);
      loadFiles();
    }
  };

  const handleClickImage = (url: string) => {
    if (alreadySelected.includes(url)) return;

    if (!multiple) {
      onSelect([url]);
      setOpen(false);
      return;
    }

    setPicked((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  };

  const confirmMultiple = () => {
    onSelect(picked);
    setOpen(false);
  };

  const visibleFiles = files.slice(0, visibleCount);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={() => handleOpenChange(true)}
        className="gap-2"
      >
        <ImagesIcon className="h-4 w-4" />
        Elegir de imágenes subidas
      </Button>
      <DialogContent className="max-w-2xl flex flex-col max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Imágenes ya subidas</DialogTitle>
          <DialogDescription>
            {multiple
              ? "Tildá una o varias y confirmá para agregarlas."
              : "Elegí una imagen para usarla como portada."}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando...
          </div>
        ) : files.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Todavía no hay imágenes subidas en este bucket.
          </p>
        ) : (
          <div className="overflow-y-auto -mx-1 px-1">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {visibleFiles.map((file) => {
                const isVideo = file.name.toLowerCase().endsWith(".mp4");
                const isUsed = alreadySelected.includes(file.url);
                const isPicked = picked.includes(file.url);
                return (
                  <button
                    type="button"
                    key={file.name}
                    onClick={() => handleClickImage(file.url)}
                    disabled={isUsed}
                    className={`relative block aspect-square rounded-md overflow-hidden border-2 bg-gray-100 transition ${
                      isPicked
                        ? "border-primary ring-2 ring-primary"
                        : "border-transparent"
                    } ${isUsed ? "opacity-40 cursor-not-allowed" : "hover:border-primary"}`}
                    title={isUsed ? "Ya está usada en este formulario" : file.name}
                  >
                    {isVideo ? (
                      <video className="absolute inset-0 w-full h-full object-cover" muted preload="metadata">
                        <source src={file.url} type="video/mp4" />
                      </video>
                    ) : (
                      // Usamos <img> nativo (no next/image) a propósito: dentro de un
                      // diálogo animado, el modo `fill` de next/image puede medir mal
                      // el tamaño del contenedor mientras corre la animación de
                      // apertura, y las miniaturas quedan apiladas.
                      <img
                        src={file.url}
                        alt={file.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {visibleCount < files.length && (
              <Button
                type="button"
                variant="ghost"
                className="w-full mt-3"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              >
                Cargar más ({files.length - visibleCount} restantes)
              </Button>
            )}
          </div>
        )}

        {multiple && (
          <Button type="button" onClick={confirmMultiple} disabled={picked.length === 0}>
            Agregar {picked.length > 0 ? `(${picked.length})` : ""}
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};
