import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";

export default function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0">
        <img
          className="h-full w-full object-cover"
          src="/hero.jpg"
          alt="Colección de accesorios"
        />
        <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-24 px-6 md:py-44">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Lunatika Accesorios
        </h1>
        <p className="mt-6  text-xl text-white max-w-3xl">
          Descubrí nuestra colección de accesorios y encontrá el complemento
          perfecto para cualquier ocasión.
        </p>
        <Link href={"/products"}>
          <Button variant="secondary" className="mt-2 md:mt-4 font-semibold">Ver productos</Button>
        </Link>
      </div>
    </section>
  );
}
