import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/admin/container";
import { Heading } from "@/components/admin/heading";
import { Button } from "@/components/ui/button";
import { CategoriesList } from "@/components/admin/categories-list";
import { getCategories } from "@/actions/getCategories";

export const dynamic = "force-dynamic";

export default async function CategoriesAdminPage() {
  const categories = await getCategories();

  return (
    <Container>
      <div className="flex justify-between items-center gap-4">
        <Heading
          title={`Categorías (${categories.length})`}
          description="Gestiona categorías para tu tienda."
        />
        <Link href="/admin/categories/create">
          <Button>
            <Plus /> Añadir
          </Button>
        </Link>
      </div>
      <CategoriesList categories={categories} />
    </Container>
  );
}
