import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="max-w-6xl mx-auto py-24 px-6 text-center space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500">
        No encontramos la página que estás buscando.
      </p>
      <Link href="/">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
