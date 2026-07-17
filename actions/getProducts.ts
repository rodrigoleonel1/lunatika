import "server-only";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Material from "@/lib/models/Material";
import { serializeProduct } from "@/lib/serializers";
import { Product as ProductType, Query } from "@/lib/types";

export const getProducts = async (query: Query = {}): Promise<ProductType[]> => {
  await connectDB();

  const filter: Record<string, unknown> = { isArchived: { $ne: true } };

  if (query.category) {
    const category = await Category.findOne({ name: query.category }).lean();
    if (!category) return [];
    filter.category_id = category._id;
  }

  if (query.material) {
    const material = await Material.findOne({
      name: decodeURIComponent(query.material),
    }).lean();
    if (!material) return [];
    filter.material_id = material._id;
  }

  if (query.isFeatured) {
    filter.isFeatured = true;
  }

  let mongoQuery = Product.find(filter)
    .sort({ createdAt: -1 })
    .populate("category_id", "name")
    .populate("material_id", "name");

  if (query.limit) {
    mongoQuery = mongoQuery.limit(query.limit);
  }

  const products = await mongoQuery.lean();
  return products.map(serializeProduct);
};
