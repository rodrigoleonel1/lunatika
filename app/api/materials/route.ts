import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Material from "@/lib/models/Material";
import { serializeMaterial } from "@/lib/serializers";
import { materialSchema } from "@/lib/zod";

export async function GET() {
  try {
    await connectDB();
    const materials = await Material.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(materials.map(serializeMaterial), { status: 200 });
  } catch (error) {
    console.log("[MATERIALS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = materialSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const material = await Material.create(parsed.data);

    return NextResponse.json(serializeMaterial(material), { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json(
        { message: "Ya existe un material con ese nombre" },
        { status: 409 }
      );
    }
    console.log("[MATERIALS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
