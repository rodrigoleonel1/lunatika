"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuMobile } from "./menu-mobile";
import { IoClose, IoChevronDown, IoMenu } from "react-icons/io5";
import { Category } from "@/lib/types";

interface NavbarClientProps {
  categories: Category[];
}

export default function NavbarClient({ categories }: NavbarClientProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleClick = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  return (
    <header className="relative border-b h-16 flex items-center">
      <div className="flex justify-between items-center max-w-6xl mx-auto w-full gap-4 px-6">
        <Link href="/">
          <p className="font-bold text-2xl tracking-tighter">lunatika.ac</p>
        </Link>

        {/* Nav de escritorio: Inicio / Productos / Categorías (con dropdown al hover) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium hover:underline">
            Inicio
          </Link>
          <Link href="/products" className="text-sm font-medium hover:underline">
            Productos
          </Link>
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1 text-sm font-medium hover:underline"
            >
              Categorías
              <IoChevronDown size={14} className="transition-transform group-hover:rotate-180" />
            </button>
            {/* Puente invisible para que el mouse no "pierda" el hover entre el botón y el dropdown */}
            <div className="absolute left-0 top-full h-2 w-full" />
            <div
              className="absolute right-0 top-full pt-2 hidden group-hover:block z-50"
            >
              <div className="min-w-[200px] rounded-md border bg-white py-2 shadow-lg">
                {categories.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-muted-foreground">
                    Todavía no hay categorías.
                  </p>
                ) : (
                  categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/category/${encodeURIComponent(category.name)}`}
                      className="block px-4 py-2 text-sm hover:bg-black hover:text-white"
                    >
                      {category.name}
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Botón hamburguesa: solo en mobile, abre el drawer lateral */}
        <button
          type="button"
          onClick={handleClick}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          className="md:hidden cursor-pointer"
        >
          {menuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
        </button>

        <MenuMobile
          menuOpen={menuOpen}
          handleClick={handleClick}
          categories={categories}
        />
      </div>
    </header>
  );
}
