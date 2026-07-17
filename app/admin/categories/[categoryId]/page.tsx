import { CategoryForm } from "@/components/admin/category-form";
import { Container } from "@/components/admin/container";
import { connectDB } from "@/lib/mongodb";
import CategoryModel from "@/lib/models/Category";
import { serializeCategory } from "@/lib/serializers";
import { Category } from "@/lib/types";
import mongoose from "mongoose";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const categoryId = (await params).categoryId;
  let category: Category | null = null;

  if (categoryId !== "create" && mongoose.Types.ObjectId.isValid(categoryId)) {
    await connectDB();
    const doc = await CategoryModel.findById(categoryId).lean();
    if (doc) category = serializeCategory(doc);
  }

  return (
    <Container>
      <CategoryForm category={category} />
    </Container>
  );
}
