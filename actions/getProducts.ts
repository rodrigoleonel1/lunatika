import "server-only";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Material from "@/lib/models/Material";
import { serializeProduct } from "@/lib/serializers";
import { Product as ProductType, Query } from "@/lib/types";

const categoryCache = new Map<string, { id: unknown; exp: number }>();
const materialCache = new Map<string, { id: unknown; exp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

export const getProducts = async (query: Query = {}): Promise<ProductType[]> => {
  await connectDB();

  const filter: Record<string, unknown> = { isArchived: { $ne: true } };

  if (query.category) {
    const cached = categoryCache.get(query.category);
    if (cached && cached.exp > Date.now()) {
      filter.category_id = cached.id;
    } else {
      const category = await Category.findOne({ name: query.category }).select("_id").lean();
      if (!category) return [];
      filter.category_id = category._id;
      categoryCache.set(query.category, { id: category._id, exp: Date.now() + CACHE_TTL });
    }
  }

  if (query.material) {
    const materialName = decodeURIComponent(query.material);
    const cached = materialCache.get(materialName);
    if (cached && cached.exp > Date.now()) {
      filter.material_id = cached.id;
    } else {
      const material = await Material.findOne({ name: materialName }).select("_id").lean();
      if (!material) return [];
      filter.material_id = material._id;
      materialCache.set(materialName, { id: material._id, exp: Date.now() + CACHE_TTL });
    }
  }

  if (query.isFeatured) {
    filter.isFeatured = true;
  }

  let mongoQuery = Product.find(filter)
    .select("name price images category_id material_id isFeatured isArchived createdAt updatedAt")
    .sort({ createdAt: -1 })
    .populate("category_id", "name")
    .populate("material_id", "name");

  // Paginación: solo si se pide page/limit. Default Load More = 12
  if (query.page !== undefined || query.limit !== undefined) {
    const limit = query.limit ?? 12;
    const page = query.page && query.page > 0 ? query.page : 1;
    mongoQuery = mongoQuery.skip((page - 1) * limit).limit(limit);
  }

  const products = await mongoQuery.lean();
  return products.map(serializeProduct);
};
