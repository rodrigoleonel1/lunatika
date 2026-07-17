"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-6xl mx-auto py-24 px-6 text-center space-y-4">
      <h2 className="text-2xl font-bold">Algo salió mal</h2>
      <p className="text-gray-500">
        No pudimos cargar esta página. Probá de nuevo en unos segundos.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </div>
  );
}
