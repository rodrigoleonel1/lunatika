import Link from "next/link";
import { MouseEventHandler } from "react";

interface MenuMobileProps {
  menuOpen: boolean;
  handleClick: MouseEventHandler<HTMLAnchorElement>;
}

export const MenuMobile = ({ menuOpen, handleClick }: MenuMobileProps) => {
  return (
    <aside
      className={`${
        menuOpen ? "w-full p-4 z-50" : "left-full w-0 p-0"
      } absolute h-[calc(100vh-64px)] mt-[64px] top-0 left-0 flex flex-col gap-4 bg-white transition-all overflow-hidden`}
    >
      <div className="space-y-2">
        <Link
          href={"/category/Pulseras"}
          className="p-2 rounded-md hover:bg-black hover:text-white flex place-items-center gap-1"
          onClick={handleClick}
        >
          Pulseras
        </Link>
        <Link
          href={"/category/Anillos"}
          className="p-2 rounded-md hover:bg-black hover:text-white flex place-items-center gap-1"
          onClick={handleClick}
        >
          Anillos
        </Link>
        <Link
          href={"/category/Aritos"}
          className="p-2 rounded-md hover:bg-black hover:text-white flex place-items-center gap-1"
          onClick={handleClick}
        >
          Aritos
        </Link>
        <Link
          href={"/category/Cadenas"}
          className="p-2 rounded-md hover:bg-black hover:text-white flex place-items-center gap-1"
          onClick={handleClick}
        >
          Cadenas
        </Link>
      </div>
    </aside>
  );
};
