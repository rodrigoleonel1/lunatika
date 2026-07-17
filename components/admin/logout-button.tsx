"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export const LogoutButton = () => {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full p-2 rounded-md hover:bg-black hover:text-white flex items-center gap-2 text-sm font-medium"
      title="Cerrar sesión"
    >
      <LogOut size={18} />
      Cerrar sesión
    </button>
  );
};
