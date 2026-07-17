import { createClient } from "@supabase/supabase-js";

/**
 * Este cliente de Supabase se usa EXCLUSIVAMENTE para el almacenamiento de
 * imágenes (Supabase Storage). La base de datos de la aplicación fue
 * migrada por completo a MongoDB (ver lib/mongodb.ts y lib/models).
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseStorage = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const PRODUCT_IMAGE_BUCKET = "product-image";
export const CATEGORY_IMAGE_BUCKET = "category-image";

/**
 * Extrae el nombre de archivo dentro del bucket a partir de la URL pública
 * que devuelve Supabase Storage, para poder borrarlo del bucket.
 * Devuelve null si la URL no pertenece a ese bucket.
 */
export function getStorageFileName(url: string, bucket: string): string | null {
  const [, fileName] = url.split(`${bucket}/`);
  return fileName || null;
}

/**
 * Borra archivos de un bucket de Supabase Storage a partir de sus URLs
 * públicas. Pensado para limpiar imágenes viejas que quedan huérfanas al
 * reemplazarlas (portada de categoría) o al quitarlas de un producto.
 * No lanza si falla: la limpieza de storage no debe bloquear el guardado.
 */
export async function removeStorageFiles(urls: string[], bucket: string): Promise<void> {
  const fileNames = urls
    .map((url) => getStorageFileName(url, bucket))
    .filter((name): name is string => Boolean(name));

  if (fileNames.length === 0) return;

  try {
    const { error } = await supabaseStorage.storage.from(bucket).remove(fileNames);
    if (error) console.error(`[STORAGE_CLEANUP:${bucket}]`, error);
  } catch (error) {
    console.error(`[STORAGE_CLEANUP:${bucket}]`, error);
  }
}

export interface StorageFile {
  name: string;
  url: string;
  createdAt: string | null;
}

/**
 * Lista los archivos ya subidos a un bucket (para el selector de "elegir
 * una imagen ya subida" en los formularios de categoría/producto), con la
 * URL pública de cada uno ya armada. Los más nuevos primero.
 */
export async function listStorageFiles(bucket: string, limit = 200): Promise<StorageFile[]> {
  const { data, error } = await supabaseStorage.storage.from(bucket).list("", {
    limit,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error) throw error;

  return (data ?? [])
    .filter((file) => file.id && !file.name.startsWith("."))
    .map((file) => {
      const { data: publicUrlData } = supabaseStorage.storage.from(bucket).getPublicUrl(file.name);
      return {
        name: file.name,
        url: publicUrlData.publicUrl,
        createdAt: file.created_at ?? null,
      };
    });
}
