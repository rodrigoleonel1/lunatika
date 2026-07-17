import Link from "next/link";
import { Plus } from "lucide-react";
import { Container } from "@/components/admin/container";
import { Heading } from "@/components/admin/heading";
import { Button } from "@/components/ui/button";
import { ProductsList } from "@/components/admin/products-list";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/lib/models/Product";
import { serializeProduct } from "@/lib/serializers";
import { getCategories } from "@/actions/getCategories";
import { getMaterials } from "@/actions/getMaterials";

export const dynamic = "force-dynamic";

export default async function ProductsAdminPage() {
  await connectDB();
  const [productDocs, categories, materials] = await Promise.all([
    ProductModel.find()
      .sort({ createdAt: -1 })
      .populate("category_id", "name")
      .populate("material_id", "name")
      .lean(),
    getCategories(),
    getMaterials(),
  ]);

  const products = productDocs.map(serializeProduct);

  return (
    <Container>
      <div className="flex justify-between items-center gap-4">
        <Heading
          title={`Productos (${products.length})`}
          description="Gestiona los productos de tu tienda."
        />
        <Link href="/admin/products/create">
          <Button>
            <Plus /> Añadir
          </Button>
        </Link>
      </div>
      <ProductsList
        products={products}
        categories={categories}
        materials={materials}
      />
    </Container>
  );
}
