"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { MenuMobile } from "./menu-mobile";

export const AdminNavbar = () => {
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
    <header className="border-b h-16 flex items-center bg-white sticky top-0 z-40">
      <div className="flex justify-between items-center max-w-5xl mx-auto w-full gap-4 px-6">
        <Link href="/admin">
          <p className="font-bold text-2xl tracking-tighter">
            lunatika<span className="text-muted-foreground">.admin</span>
          </p>
        </Link>
        <button
          type="button"
          onClick={handleClick}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={menuOpen}
          className={`cursor-pointer transition-transform ${
            !menuOpen ? "rotate-0" : "rotate-90"
          }`}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
        <MenuMobile menuOpen={menuOpen} handleClick={handleClick} />
      </div>
    </header>
  );
};
