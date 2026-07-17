import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import { serializeCategory } from "@/lib/serializers";
import { categorySchema } from "@/lib/zod";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(categories.map(serializeCategory), { status: 200 });
  } catch (error) {
    console.log("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const category = await Category.create(parsed.data);

    // El home y la navbar cachean la lista de categorías por 1 hora
    // (ISR). Como recién se creó una, la invalidamos ya mismo para que
    // aparezca sin esperar.
    revalidatePath("/");
    revalidatePath("/", "layout");

    return NextResponse.json(serializeCategory(category), { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return NextResponse.json(
        { message: "Ya existe una categoría con ese nombre" },
        { status: 409 }
      );
    }
    console.log("[CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
