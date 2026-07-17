import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import { supabaseStorage } from "@/lib/supabase-storage";

const ALLOWED_BUCKETS = new Set(["product-image", "category-image"]);

/**
 * Borra una imagen del bucket. Si es la portada de alguna categoría, se
 * rechaza (una categoría siempre necesita una portada) — hay que
 * reemplazarla o cambiarla desde ahí primero. Si está en uso por
 * productos, se borra igual pero se saca la referencia de esos productos
 * para no dejar imágenes rotas.
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { bucket, path } = body as { bucket?: string; path?: string };

    if (!bucket || !path || !ALLOWED_BUCKETS.has(bucket)) {
      return NextResponse.json({ message: "Faltan datos válidos" }, { status: 400 });
    }

    await connectDB();

    const { data: publicUrlData } = supabaseStorage.storage.from(bucket).getPublicUrl(path);
    const url = publicUrlData.publicUrl;

    const linkedCategory = await Category.findOne({ billboard: url }, { name: 1 }).lean();
    if (linkedCategory) {
      return NextResponse.json(
        {
          message: `No se puede eliminar: es la portada de la categoría "${linkedCategory.name}". Cambiala primero editando esa categoría.`,
        },
        { status: 409 }
      );
    }

    const linkedProducts = await Product.find({ images: url }, { name: 1 }).lean();

    const { error } = await supabaseStorage.storage.from(bucket).remove([path]);
    if (error) throw error;

    if (linkedProducts.length > 0) {
      await Product.updateMany({ images: url }, { $pull: { images: url } });
    }

    revalidatePath("/");
    revalidatePath("/", "layout");

    return NextResponse.json(
      { message: "Imagen eliminada correctamente", unlinkedFrom: linkedProducts.length },
      { status: 200 }
    );
  } catch (error) {
    console.log("[ADMIN_IMAGE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * Reemplaza el archivo de una imagen ya subida, en el mismo bucket y con
 * el mismo nombre (upsert). Como la URL no cambia, cualquier
 * producto/categoría que ya la esté usando muestra la foto nueva
 * automáticamente, sin tocar Mongo para nada.
 *
 * Nota: por cómo funciona el caché de imágenes del navegador/CDN, puede
 * tardar un rato en verse el cambio — force-refresh (Ctrl/Cmd+Shift+R) si
 * hace falta verlo al instante.
 */
export async function PATCH(req: Request) {
  try {
    const formData = await req.formData();
    const bucket = formData.get("bucket");
    const path = formData.get("path");
    const file = formData.get("file");

    if (
      typeof bucket !== "string" ||
      typeof path !== "string" ||
      !ALLOWED_BUCKETS.has(bucket) ||
      !(file instanceof File)
    ) {
      return NextResponse.json({ message: "Faltan datos válidos" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const { error } = await supabaseStorage.storage
      .from(bucket)
      .upload(path, buffer, { contentType: file.type || "image/jpeg", upsert: true });

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/", "layout");

    return NextResponse.json({ message: "Imagen actualizada correctamente" }, { status: 200 });
  } catch (error) {
    console.log("[ADMIN_IMAGE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
