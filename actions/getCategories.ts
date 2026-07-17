import "server-only";
import { connectDB } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { serializeCategory } from "@/lib/serializers";
import { Category as CategoryType } from "@/lib/types";

export const getCategories = async (): Promise<CategoryType[]> => {
  await connectDB();
  const categories = await Category.find().sort({ createdAt: -1 }).lean();
  return categories.map(serializeCategory);
};
