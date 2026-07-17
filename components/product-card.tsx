import { Product } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

interface ProductCard {
  product: Product;
}

export default function ProductCard({ product }: ProductCard) {
  return (
    <section className=" bg-white rounded-lg shadow-md p-4 space-y-4">
      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-200">
        {product.images[0]?.endsWith(".mp4") ? (
          <video
            className="h-full w-full object-cover object-center"
            muted
            loop
            playsInline
            autoPlay
            preload="none"
          >
            <source src={product.images[0]} type="video/mp4" />
            Tu navegador no soporta el elemento de video.
          </video>
        ) : (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
          />
        )}
      </div>
      <main className="flex justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-700">{product.name}</h3>
          <div className="flex gap-2">
            <p className="mt-1 text-sm text-gray-500">
              {product.category.name}
            </p>
            <span className="mt-1 text-sm text-gray-500">|</span>
            <p className="mt-1 text-sm text-gray-500">
              {product.material.name}
            </p>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-900">${product.price}</p>
      </main>
      <footer>
        <Link href={`/products/${product.id}`}>
          <Button className="w-full">Ver producto</Button>
        </Link>
      </footer>
    </section>
  );
}
