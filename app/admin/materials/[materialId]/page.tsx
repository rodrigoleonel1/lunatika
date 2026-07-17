import { Container } from "@/components/admin/container";
import { MaterialForm } from "@/components/admin/material-form";
import { connectDB } from "@/lib/mongodb";
import MaterialModel from "@/lib/models/Material";
import { serializeMaterial } from "@/lib/serializers";
import { Material } from "@/lib/types";
import mongoose from "mongoose";

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ materialId: string }>;
}) {
  const materialId = (await params).materialId;
  let material: Material | null = null;

  if (materialId !== "create" && mongoose.Types.ObjectId.isValid(materialId)) {
    await connectDB();
    const doc = await MaterialModel.findById(materialId).lean();
    if (doc) material = serializeMaterial(doc);
  }

  return (
    <Container>
      <MaterialForm material={material} />
    </Container>
  );
}
