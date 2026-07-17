import Link from "next/link";
import {
  FilePlus2,
  FileSearch,
  FolderPlus,
  FolderSearch2,
  PackagePlus,
  PackageSearch,
  Images,
  LucideIcon,
} from "lucide-react";
import { Container } from "@/components/admin/container";
import { Heading } from "@/components/admin/heading";
import { adminRoutes } from "@/lib/constants";
import { auth } from "@/auth";

type IconName =
  | "FilePlus2"
  | "FileSearch"
  | "FolderPlus"
  | "FolderSearch2"
  | "PackagePlus"
  | "PackageSearch"
  | "Images";

const iconMap: Record<IconName, LucideIcon> = {
  FilePlus2,
  FileSearch,
  FolderPlus,
  FolderSearch2,
  PackagePlus,
  PackageSearch,
  Images,
};

export default async function AdminHome() {
  const session = await auth();

  return (
    <Container>
      <Heading
        title={`Hola, ${session?.user?.name ?? "Administradora"}`}
        description="Dashboard de Lunatika Accesorios, elegí qué querés hacer."
      />
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mx-auto">
        {adminRoutes.map((route) => {
          const IconComponent = iconMap[route.icon as IconName];
          return (
            <Link
              key={route.href}
              href={route.href}
              className="bg-black/95 text-white font-medium hover:bg-black/80 rounded-md p-4 shadow-md flex justify-center gap-2"
            >
              <IconComponent />
              {route.name}
            </Link>
          );
        })}
      </ul>
    </Container>
  );
}
