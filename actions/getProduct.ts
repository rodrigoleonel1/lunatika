import "server-only";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { serializeProduct } from "@/lib/serializers";
import { Product as ProductType } from "@/lib/types";
import mongoose from "mongoose";

export const getProduct = async (id: string): Promise<ProductType | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  await connectDB();
  const product = await Product.findById(id)
    .populate("category_id", "name")
    .populate("material_id", "name")
    .lean();

  if (!product) return null;
  return serializeProduct(product);
};
