"use client";

import { useCallback, useRef, useState, ReactNode, ReactElement } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title?: ReactNode;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  /** Por defecto el botón de confirmar es "destructivo" (rojo). Poné false
   * para una confirmación neutra que no sea sobre borrar algo. */
  destructive?: boolean;
}

/**
 * Reemplazo de `window.confirm()` con un modal prolijo (AlertDialog).
 * Uso:
 *   const [ConfirmDialog, confirm] = useConfirm();
 *   ...
 *   const ok = await confirm({ title: "¿Eliminar producto?" });
 *   if (!ok) return;
 *   ...
 *   return <>{...} <ConfirmDialog /></>;
 */
export function useConfirm(): [() => ReactElement, (options?: ConfirmOptions) => Promise<boolean>] {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    setOptions(opts);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const answer = useCallback((value: boolean) => {
    setOpen(false);
    resolveRef.current?.(value);
    resolveRef.current = null;
  }, []);

  const ConfirmDialog = useCallback(
    () => (
      <AlertDialog open={open} onOpenChange={(next) => !next && answer(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title ?? "¿Estás seguro?"}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>{options.description ?? "Esta acción no se puede deshacer."}</div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => answer(false)}>
              {options.cancelText ?? "Cancelar"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => answer(true)}
              className={
                options.destructive === false
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : undefined
              }
            >
              {options.confirmText ?? "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
    [open, options, answer]
  );

  return [ConfirmDialog, confirm];
}
