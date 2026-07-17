/**
 * Borra las imágenes de Supabase Storage que no están enlazadas a ningún
 * producto ni categoría en Mongo (por ejemplo, fotos que quedaron
 * "colgadas" de pruebas viejas, o de productos borrados antes de que
 * existiera la limpieza automática de huérfanos).
 *
 * Por defecto corre en modo "dry run" (solo lista qué borraría, sin tocar
 * nada). Agregá --apply para que borre de verdad.
 *
 * Uso:
 *   npm run cleanup:images
 *   npm run cleanup:images -- --apply
 *
 * Nota: para un uso puntual (ver una por una qué es cada imagen antes de
 * decidir) es más cómodo usar la página "Ver imágenes" del panel de admin
 * (/admin/images), que tiene el mismo filtro de "sin usar" pero con
 * miniaturas. Este script sirve para una limpieza masiva de una sola vez.
 */
import "dotenv/config";
import mongoose from "mongoose";
import Product from "../lib/models/Product";
import Category from "../lib/models/Category";
import {
  listStorageFiles,
  supabaseStorage,
  PRODUCT_IMAGE_BUCKET,
  CATEGORY_IMAGE_BUCKET,
} from "../lib/supabase-storage";

function baseUrl(url: string): string {
  return url.split("?")[0];
}

async function main() {
  const apply = process.argv.includes("--apply");

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Falta la variable de entorno MONGODB_URI en tu .env");
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const [productDocs, categoryDocs, productFiles, categoryFiles] = await Promise.all([
    Product.find({}, { images: 1 }).lean(),
    Category.find({}, { billboard: 1 }).lean(),
    listStorageFiles(PRODUCT_IMAGE_BUCKET),
    listStorageFiles(CATEGORY_IMAGE_BUCKET),
  ]);

  const usedUrls = new Set<string>();
  for (const product of productDocs) {
    for (const url of product.images ?? []) usedUrls.add(baseUrl(url));
  }
  for (const category of categoryDocs) {
    if (category.billboard) usedUrls.add(baseUrl(category.billboard));
  }

  const orphans = [
    ...productFiles.map((f) => ({ ...f, bucket: PRODUCT_IMAGE_BUCKET })),
    ...categoryFiles.map((f) => ({ ...f, bucket: CATEGORY_IMAGE_BUCKET })),
  ].filter((file) => !usedUrls.has(baseUrl(file.url)));

  console.log(
    `Encontradas ${productFiles.length + categoryFiles.length} imágenes en total, ${orphans.length} sin usar.\n`
  );

  if (orphans.length === 0) {
    console.log("No hay nada para limpiar. 🎉");
    await mongoose.disconnect();
    process.exit(0);
  }

  orphans.forEach((file) => console.log(`  - [${file.bucket}] ${file.name}`));

  if (!apply) {
    console.log(
      `\nEsto fue un dry run, no se borró nada. Si está todo bien, corré de nuevo agregando --apply.`
    );
    await mongoose.disconnect();
    process.exit(0);
  }

  let deleted = 0;
  for (const file of orphans) {
    const { error } = await supabaseStorage.storage.from(file.bucket).remove([file.name]);
    if (error) {
      console.error(`  ❌ No pude borrar [${file.bucket}] ${file.name}: ${error.message}`);
    } else {
      deleted++;
    }
  }

  console.log(`\n✅ Se borraron ${deleted}/${orphans.length} imágenes sin usar.`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
