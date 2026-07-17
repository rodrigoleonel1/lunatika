"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/admin/container";

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
    <Container>
      <div className="text-center space-y-4 pt-24">
        <h2 className="text-2xl font-bold">Algo salió mal</h2>
        <p className="text-muted-foreground">
          No pudimos cargar esta página del panel. Probá de nuevo.
        </p>
        <Button onClick={reset}>Reintentar</Button>
      </div>
    </Container>
  );
}
