import { NextRequest, NextResponse } from "next/server";
import { supabaseStorage, PRODUCT_IMAGE_BUCKET } from "@/lib/supabase-storage";

/**
 * Endpoint pensado para ser llamado periódicamente por un cron (Vercel Cron,
 * ver vercel.json) para que el proyecto de Supabase no se pause por
 * inactividad. El plan gratis de Supabase pausa el proyecto (Storage
 * incluido) después de ~7 días sin actividad real contra la base — como
 * esta app ya no usa la base de Postgres de Supabase para nada (todo vive
 * en MongoDB), sin este ping nada lo mantendría "vivo".
 *
 * `storage.list()` alcanza: por debajo, Supabase Storage consulta la tabla
 * `storage.objects` de su propia base de Postgres, así que cuenta como
 * actividad real de base de datos.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  try {
    const { error } = await supabaseStorage.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .list("", { limit: 1 });

    if (error) throw error;

    return NextResponse.json({ ok: true, checkedAt: new Date().toISOString() });
  } catch (error) {
    console.error("[CRON_KEEP_SUPABASE_ALIVE]", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
