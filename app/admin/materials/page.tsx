import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/admin/container";
import { Heading } from "@/components/admin/heading";
import { Button } from "@/components/ui/button";
import { MaterialsList } from "@/components/admin/materials-list";
import { getMaterials } from "@/actions/getMaterials";

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const materials = await getMaterials();

  return (
    <Container>
      <div className="flex justify-between items-center gap-4">
        <Heading
          title={`Materiales (${materials.length})`}
          description="Gestiona materiales para tu tienda."
        />
        <Link href="/admin/materials/create">
          <Button>
            <Plus /> Añadir
          </Button>
        </Link>
      </div>
      <MaterialsList materials={materials} />
    </Container>
  );
}
