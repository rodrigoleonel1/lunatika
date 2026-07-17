import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import { serializeProduct } from "@/lib/serializers";
import { productSchema } from "@/lib/zod";
import { supabaseStorage, PRODUCT_IMAGE_BUCKET } from "@/lib/supabase-storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const productId = (await params).productId;

    await connectDB();
    const product = await Product.findById(productId)
      .populate("category_id", "name")
      .populate("material_id", "name")
      .lean();

    if (!product) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(serializeProduct(product), { status: 200 });
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const productId = (await params).productId;
    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Faltan campos obligatorios", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.findByIdAndUpdate(productId, parsed.data, {
      new: true,
    })
      .populate("category_id", "name")
      .populate("material_id", "name")
      .lean();

    if (!product) {
      return NextResponse.json({ message: "Producto no encontrado" }, { status: 404 });
    }

    revalidatePath("/");

    return NextResponse.json(serializeProduct(product), { status: 200 });
  } catch (error) {
    console.log("[PRODUCT_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const productId = (await params).productId;
    if (!productId) {
      return new NextResponse("Missing productId parameter", { status: 400 });
    }

    await connectDB();
    const product = await Product.findById(productId).lean();

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const images = (product as { images?: string[] }).images ?? [];
    if (images.length > 0) {
      // Las imágenes se guardan como URLs públicas completas; extraemos
      // solo el nombre de archivo para poder borrarlas del bucket.
      const fileNames = images
        .map((url) => url.split(`${PRODUCT_IMAGE_BUCKET}/`)[1])
        .filter((name): name is string => Boolean(name));

      if (fileNames.length > 0) {
        const { error: deleteImagesError } = await supabaseStorage.storage
          .from(PRODUCT_IMAGE_BUCKET)
          .remove(fileNames);

        if (deleteImagesError) {
          console.error(deleteImagesError);
        }
      }
    }

    await Product.findByIdAndDelete(productId);

    revalidatePath("/");

    return NextResponse.json({ message: "Producto eliminado correctamente" }, { status: 200 });
  } catch (error) {
    console.error("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
