import { NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseStorage } from "@/lib/supabase-storage";

export const runtime = "nodejs";

const ALLOWED_BUCKETS = new Set(["product-image", "category-image"]);
const MAX_DIMENSION = 1200;
const WEBP_QUALITY = 80;
const CACHE_CONTROL = "31536000";

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/\.webp$/i, "")
    .replace(/\.(jpg|jpeg|png|webp)$/i, "");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const bucket = formData.get("bucket");
    const file = formData.get("file");

    if (typeof bucket !== "string" || !ALLOWED_BUCKETS.has(bucket) || !(file instanceof File)) {
      return NextResponse.json({ message: "Faltan datos válidos" }, { status: 400 });
    }

    const isVideo = file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");

    // Videos: subir tal cual sin sharp
    if (isVideo) {
      const fileName = `${Date.now()}-${file.name}`;
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error } = await supabaseStorage.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: "video/mp4",
          upsert: false,
          cacheControl: CACHE_CONTROL,
        });
      if (error) throw error;
      const { data } = supabaseStorage.storage.from(bucket).getPublicUrl(fileName);
      return NextResponse.json({ url: data.publicUrl }, { status: 200 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Solo se permiten imágenes o video mp4" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Ya es webp pequeño: evitar recompresión innecesaria si es <300KB y <1200px
    // Pero igual aplicamos resize por si es 3000px aunque pese poco
    const metadata = await sharp(inputBuffer).metadata();

    let pipeline = sharp(inputBuffer).rotate();

    const width = metadata.width ?? MAX_DIMENSION;
    const height = metadata.height ?? MAX_DIMENSION;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      pipeline = pipeline.resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const outputBuffer = await pipeline
      .webp({ quality: WEBP_QUALITY, effort: 4 })
      .toBuffer();

    const baseName = sanitizeFileName(file.name) || "image";
    const fileName = `${Date.now()}-${baseName}.webp`;

    const { error } = await supabaseStorage.storage.from(bucket).upload(fileName, outputBuffer, {
      contentType: "image/webp",
      upsert: false,
      cacheControl: CACHE_CONTROL,
    });

    if (error) throw error;

    const { data } = supabaseStorage.storage.from(bucket).getPublicUrl(fileName);

    return NextResponse.json(
      {
        url: data.publicUrl,
        bytesIn: inputBuffer.length,
        bytesOut: outputBuffer.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log("[ADMIN_UPLOAD]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
