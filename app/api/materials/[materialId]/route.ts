import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Material from "@/lib/models/Material";
import Product from "@/lib/models/Product";
import { serializeMaterial } from "@/lib/serializers";
import { materialSchema } from "@/lib/zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const materialId = (await params).materialId;
    if (!materialId) {
      return new NextResponse("Missing materialId parameter", { status: 400 });
    }

    await connectDB();
    const material = await Material.findById(materialId).lean();

    if (!material) {
      return NextResponse.json({ message: "Material no encontrado" }, { status: 404 });
    }

    return NextResponse.json(serializeMaterial(material), { status: 200 });
  } catch (error) {
    console.log("[MATERIAL_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const materialId = (await params).materialId;
    if (!materialId) {
      return new NextResponse("Missing materialId parameter", { status: 400 });
    }

    const body = await req.json();
    const parsed = materialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Required fields are missing", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const material = await Material.findByIdAndUpdate(materialId, parsed.data, {
      new: true,
    }).lean();

    if (!material) {
      return NextResponse.json({ message: "Material no encontrado" }, { status: 404 });
    }

    return NextResponse.json(serializeMaterial(material), { status: 200 });
  } catch (error) {
    console.log("[MATERIAL_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ materialId: string }> }
) {
  try {
    const materialId = (await params).materialId;
    if (!materialId) {
      return new NextResponse("Missing materialId parameter", { status: 400 });
    }

    await connectDB();

    const productsUsingMaterial = await Product.countDocuments({ material_id: materialId });
    if (productsUsingMaterial > 0) {
      return NextResponse.json(
        {
          message: `No se puede eliminar: hay ${productsUsingMaterial} producto(s) usando este material.`,
        },
        { status: 409 }
      );
    }

    const material = await Material.findByIdAndDelete(materialId);
    if (!material) {
      return NextResponse.json({ message: "Material no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ message: "Material eliminado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("[MATERIAL_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
