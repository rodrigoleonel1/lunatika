"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MenuMobile } from "./menu-mobile";
import { IoClose, IoMenu } from "react-icons/io5";

export default function Navbar() {
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
    <header className="border-b h-16 flex items-center">
      <div className="flex justify-between max-w-7xl mx-auto w-full gap-4 px-6">
        <Link href="/">
          <p className="font-bold text-2xl tracking-tighter">lunatika.ac</p>
        </Link>
        <nav className="flex items-center gap-2">
          <span
            className={`md:hidden cursor-pointer transition-transform group: ${
              !menuOpen ? "rotate-0" : "rotate-90"
            }`}
          >
            {menuOpen ? (
              <IoClose size={28} onClick={handleClick} />
            ) : (
              <IoMenu size={28} onClick={handleClick} />
            )}
          </span>
          <Link
            href={"/category/Pulseras"}
            className="text-sm font-medium hover:underline hidden md:flex"
          >
            Pulseras
          </Link>
          <Link
            href={"/category/Anillos"}
            className="text-sm font-medium hover:underline hidden md:flex"
          >
            Anillos
          </Link>
          <Link
            href={"/category/Aritos"}
            className="text-sm font-medium hover:underline hidden md:flex"
          >
            Aritos
          </Link>
          <Link
            href={"/category/Cadenas"}
            className="text-sm font-medium hover:underline hidden md:flex"
          >
            Cadenas
          </Link>
        </nav>
        <MenuMobile menuOpen={menuOpen} handleClick={handleClick} />
      </div>
    </header>
  );
}
