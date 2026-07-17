import "server-only";
import { connectDB } from "@/lib/mongodb";
import Material from "@/lib/models/Material";
import { serializeMaterial } from "@/lib/serializers";
import { Material as MaterialType } from "@/lib/types";

export const getMaterials = async (): Promise<MaterialType[]> => {
  await connectDB();
  const materials = await Material.find().sort({ createdAt: -1 }).lean();
  return materials.map(serializeMaterial);
};
