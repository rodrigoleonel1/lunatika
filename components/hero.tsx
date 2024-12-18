import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <div className="relative">
      <div className="absolute inset-0">
        <img
          className="h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0"
          alt="Colección de accesorios"
        />
        <div className="absolute inset-0 bg-gray-900 opacity-40"></div>
      </div>
      <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Lunatika Accesorios
        </h1>
        <p className="mt-6 text-xl text-white max-w-3xl">
          Descubrí nuestra colección de accesorios y encontrá el complemento perfecto para cualquier ocasión.
        </p>
        <div className="mt-10">
          <Link href={"/products"}>
            <Button variant="secondary">Ver productos</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
