import { Container } from "@/components/admin/container";
import { ProductForm } from "@/components/admin/product-form";
import { connectDB } from "@/lib/mongodb";
import ProductModel from "@/lib/models/Product";
import { serializeProduct } from "@/lib/serializers";
import { getCategories } from "@/actions/getCategories";
import { getMaterials } from "@/actions/getMaterials";
import { Product } from "@/lib/types";
import mongoose from "mongoose";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const productId = (await params).productId;
  await connectDB();

  let product: Product | null = null;
  if (productId !== "create" && mongoose.Types.ObjectId.isValid(productId)) {
    const doc = await ProductModel.findById(productId)
      .populate("category_id", "name")
      .populate("material_id", "name")
      .lean();
    if (doc) product = serializeProduct(doc);
  }

  const [categories, materials] = await Promise.all([
    getCategories(),
    getMaterials(),
  ]);

  return (
    <Container>
      <ProductForm
        categories={categories}
        materials={materials}
        product={product}
      />
    </Container>
  );
}
