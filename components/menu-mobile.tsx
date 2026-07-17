import Link from "next/link";
import { MouseEventHandler } from "react";
import { Category } from "@/lib/types";

interface MenuMobileProps {
  menuOpen: boolean;
  handleClick: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement>;
  categories: Category[];
}

export const MenuMobile = ({ menuOpen, handleClick, categories }: MenuMobileProps) => {
  return (
    <>
      {/* Fondo semitransparente: aparece con el drawer y permite cerrarlo tocando afuera */}
      <div
        onClick={handleClick}
        aria-hidden
        className={`md:hidden fixed inset-0 top-16 z-40 bg-black/50 transition-opacity ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`md:hidden fixed top-16 left-0 z-50 h-[calc(100vh-64px)] w-72 max-w-[85vw] bg-white border-r p-4 flex flex-col gap-1 overflow-y-auto transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link
          href="/"
          onClick={handleClick}
          className="p-2 rounded-md hover:bg-black hover:text-white flex place-items-center gap-1 font-medium"
        >
          Inicio
        </Link>
        <Link
          href="/products"
          onClick={handleClick}
          className="p-2 rounded-md hover:bg-black hover:text-white flex place-items-center gap-1 font-medium"
        >
          Todos los productos
        </Link>

        <p className="px-2 pt-4 pb-1 text-xs font-semibold uppercase text-muted-foreground">
          Categorías
        </p>
        <div className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${encodeURIComponent(category.name)}`}
              className="p-2 rounded-md hover:bg-black hover:text-white flex place-items-center gap-1"
              onClick={handleClick}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
};
