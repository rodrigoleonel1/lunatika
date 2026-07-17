import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Category from "@/lib/models/Category";
import Product from "@/lib/models/Product";
import { serializeCategory } from "@/lib/serializers";
import { categorySchema } from "@/lib/zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const categoryId = (await params).categoryId;
    if (!categoryId) {
      return new NextResponse("Missing categoryId parameter", { status: 400 });
    }

    await connectDB();
    const category = await Category.findById(categoryId).lean();

    if (!category) {
      return NextResponse.json({ message: "Categoría no encontrada" }, { status: 404 });
    }

    return NextResponse.json(serializeCategory(category), { status: 200 });
  } catch (error) {
    console.log("[CATEGORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const categoryId = (await params).categoryId;
    if (!categoryId) {
      return new NextResponse("Missing categoryId parameter", { status: 400 });
    }

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const category = await Category.findByIdAndUpdate(categoryId, parsed.data, {
      new: true,
    }).lean();

    if (!category) {
      return NextResponse.json({ message: "Categoría no encontrada" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/", "layout");

    return NextResponse.json(serializeCategory(category), { status: 200 });
  } catch (error) {
    console.log("[CATEGORY_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const categoryId = (await params).categoryId;
    if (!categoryId) {
      return new NextResponse("Missing categoryId parameter", { status: 400 });
    }

    await connectDB();

    const productsUsingCategory = await Product.countDocuments({ category_id: categoryId });
    if (productsUsingCategory > 0) {
      return NextResponse.json(
        {
          message: `No se puede eliminar: hay ${productsUsingCategory} producto(s) usando esta categoría.`,
        },
        { status: 409 }
      );
    }

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return NextResponse.json({ message: "Categoría no encontrada" }, { status: 404 });
    }

    revalidatePath("/");
    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Categoría eliminada correctamente" }, { status: 200 });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
