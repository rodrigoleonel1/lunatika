/**
 * Reemplaza el dominio viejo de Supabase por el nuevo en todas las URLs de
 * imágenes guardadas en Mongo (billboard de categorías + images de
 * productos). Los nombres de archivo y la estructura de carpetas quedaron
 * iguales entre un proyecto y el otro, así que es un simple reemplazo de
 * dominio, sin tocar el resto de la URL.
 *
 * Uso:
 *   npm run fix:image-urls -- --from=psueyxkxjxyrdicdauls.supabase.co --to=pypdiywanszlvcovrwlx.supabase.co
 *
 * Por defecto corre en modo "dry run" (solo te muestra qué cambiaría, sin
 * escribir nada). Agregá --apply para que grabe los cambios de verdad.
 */
import "dotenv/config";
import mongoose from "mongoose";
import Category from "../lib/models/Category";
import Product from "../lib/models/Product";
 
function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found?.slice(prefix.length);
}
 
async function main() {
  const from = getArg("from");
  const to = getArg("to");
  const apply = process.argv.includes("--apply");
 
  if (!from || !to) {
    console.error(
      "Uso: npm run fix:image-urls -- --from=dominio-viejo.supabase.co --to=dominio-nuevo.supabase.co [--apply]"
    );
    process.exit(1);
  }
 
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Falta la variable de entorno MONGODB_URI en tu .env");
    process.exit(1);
  }
 
  await mongoose.connect(mongoUri);
 
  let categoriesChanged = 0;
  let productsChanged = 0;
  let imagesChanged = 0;
 
  const categories = await Category.find({});
  for (const cat of categories) {
    if (cat.billboard?.includes(from)) {
      const newUrl = cat.billboard.replace(from, to);
      console.log(`[categoría "${cat.name}"]\n  antes: ${cat.billboard}\n  ahora: ${newUrl}`);
      categoriesChanged++;
      if (apply) {
        cat.billboard = newUrl;
        await cat.save({ timestamps: false });
      }
    }
  }
 
  const products = await Product.find({});
  for (const prod of products) {
    let touched = false;
    const newImages = (prod.images ?? []).map((url) => {
      if (url.includes(from)) {
        imagesChanged++;
        touched = true;
        return url.replace(from, to);
      }
      return url;
    });
    if (touched) {
      console.log(`[producto "${prod.name}"] ${newImages.length} imagen(es) actualizada(s)`);
      productsChanged++;
      if (apply) {
        prod.images = newImages;
        await prod.save({ timestamps: false });
      }
    }
  }
 
  console.log(`\n--- Resumen ---`);
  console.log(`Categorías con URL a actualizar: ${categoriesChanged}`);
  console.log(`Productos con URL a actualizar: ${productsChanged}`);
  console.log(`Imágenes individuales a actualizar: ${imagesChanged}`);
 
  if (!apply) {
    console.log(
      `\nEsto fue un dry run, no se guardó nada. Si está todo bien, corré de nuevo agregando --apply.`
    );
  } else {
    console.log(`\n✅ Cambios guardados en Mongo.`);
  }
 
  await mongoose.disconnect();
  process.exit(0);
}
 
main().catch((error) => {
  console.error(error);
  process.exit(1);
});