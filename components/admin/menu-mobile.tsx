import { adminRoutes } from "@/lib/constants";
import Link from "next/link";
import { MouseEventHandler } from "react";
import { LogoutButton } from "./logout-button";

interface MenuMobileProps {
  menuOpen: boolean;
  handleClick: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement | HTMLDivElement>;
}

export const MenuMobile = ({ menuOpen, handleClick }: MenuMobileProps) => {
  return (
    <>
      <div
        onClick={handleClick}
        aria-hidden
        className={`fixed inset-0 top-16 z-40 bg-black/50 transition-opacity ${
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <aside
        className={`fixed top-16 left-0 z-50 h-[calc(100vh-64px)] w-72 max-w-[85vw] bg-white border-r p-4 flex flex-col justify-between gap-1 overflow-y-auto transition-transform duration-300 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-1">
          {adminRoutes.map((route) => (
            <Link
              onClick={handleClick}
              key={route.href}
              href={route.href}
              className="p-2 rounded-md hover:bg-black hover:text-white flex place-items-center gap-1"
            >
              {route.name}
            </Link>
          ))}
        </div>
        <div className="border-t pt-4">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
};
