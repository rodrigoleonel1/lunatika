import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import Material from "@/lib/models/Material";
import { serializeProduct } from "@/lib/serializers";
import { productSchema } from "@/lib/zod";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryName = searchParams.get("category");
    const materialName = searchParams.get("material");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");
    const page = searchParams.get("page");
    const includeArchived = searchParams.get("includeArchived") === "true";

    await connectDB();

    const filter: Record<string, unknown> = {};

    if (categoryName) {
      const category = await Category.findOne({ name: categoryName }).lean();
      if (!category) return NextResponse.json([], { status: 200 });
      filter.category_id = category._id;
    }

    if (materialName) {
      const material = await Material.findOne({
        name: decodeURIComponent(materialName),
      }).lean();
      if (!material) return NextResponse.json([], { status: 200 });
      filter.material_id = material._id;
    }

    if (featured) {
      filter.isFeatured = featured === "true";
    }

    // La tienda pública nunca debe mostrar productos archivados, salvo que
    // el panel de administración los pida explícitamente.
    if (!includeArchived) {
      filter.isArchived = { $ne: true };
    }

    let query = Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("category_id", "name")
      .populate("material_id", "name");

    if (page || limit) {
      const parsedLimit = limit ? Number(limit) : 12;
      const parsedPage = page ? Number(page) : 1;
      const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 && parsedLimit <= 50 ? parsedLimit : 12;
      const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      query = query.skip((safePage - 1) * safeLimit).limit(safeLimit);
    }

    const products = await query.lean();

    return NextResponse.json(products.map(serializeProduct), { status: 200 });
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.create(parsed.data);
    const populated = await Product.findById(product._id)
      .populate("category_id", "name")
      .populate("material_id", "name")
      .lean();

    // El home cachea los productos destacados por 1 hora (ISR); si este
    // producto nuevo es "isFeatured", que aparezca ya sin esperar.
    revalidatePath("/");

    return NextResponse.json(serializeProduct(populated), { status: 201 });
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
