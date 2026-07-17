/**
 * Recorre una carpeta local con tus fotos originales y las sube a Supabase
 * Storage, usando exactamente el mismo nombre de archivo que ya está
 * guardado en las URLs de Mongo (categorías y productos). Así no hace
 * falta tocar la base de datos: las URLs que ya existen simplemente
 * empiezan a resolver en cuanto el archivo aparece en el bucket.
 *
 * Uso:
 *   npm run reupload:images -- --dir="C:\ruta\a\tus\fotos"
 *
 * Podés apuntar a una carpeta con subcarpetas (categorías, productos
 * mezclados, como sea que las tengas organizadas) — el script busca
 * recursivamente.
 *
 * Cómo empareja cada foto:
 *  - Si el archivo local se llama igual que el nombre completo guardado
 *    (ej. "1737595903417-20250120_165348.jpg"), lo usa directo.
 *  - Si no, prueba con el nombre "de fábrica" sin el prefijo de timestamp
 *    que agrega el uploader (ej. "20250120_165348.jpg"), que es como
 *    suelen quedar guardadas las fotos originales en tu compu/celular.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import Category from "../lib/models/Category";
import Product from "../lib/models/Product";
import { supabaseStorage } from "../lib/supabase-storage";
 
function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found?.slice(prefix.length).replace(/^["']|["']$/g, "");
}
 
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".mp4"]);
 
function walk(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}
 
function bucketAndKeyFromUrl(url: string): { bucket: string; key: string } | null {
  const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
  if (!match) return null;
  return { bucket: match[1], key: decodeURIComponent(match[2]) };
}
 
/** Nombre "de fábrica" sin el prefijo `${Date.now()}-` que agrega el uploader. */
function originalSuffix(fileName: string): string {
  const dashIdx = fileName.indexOf("-");
  return dashIdx === -1 ? fileName : fileName.slice(dashIdx + 1);
}
 
function contentTypeFor(ext: string): string {
  switch (ext) {
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".mp4":
      return "video/mp4";
    default:
      return "image/jpeg";
  }
}
 
async function main() {
  const dir = getArg("dir");
  if (!dir) {
    console.error('Uso: npm run reupload:images -- --dir="C:\\ruta\\a\\tus\\fotos"');
    process.exit(1);
  }
 
  const resolvedDir = path.resolve(dir);
  if (!fs.existsSync(resolvedDir)) {
    console.error(`No encuentro la carpeta: ${resolvedDir}`);
    process.exit(1);
  }
 
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Falta la variable de entorno MONGODB_URI en tu .env");
    process.exit(1);
  }
 
  console.log("Buscando fotos en la carpeta local...");
  const localFiles = walk(resolvedDir);
  console.log(`Encontré ${localFiles.length} archivo(s) de imagen/video localmente.`);
 
  const localByName = new Map<string, string[]>();
  for (const filePath of localFiles) {
    const base = path.basename(filePath);
    const list = localByName.get(base) ?? [];
    list.push(filePath);
    localByName.set(base, list);
  }
 
  await mongoose.connect(mongoUri);
 
  const categories = await Category.find({}, { billboard: 1, name: 1 }).lean();
  const products = await Product.find({}, { images: 1, name: 1 }).lean();
 
  type Expected = { url: string; bucket: string; key: string; label: string };
  const expected: Expected[] = [];
 
  for (const cat of categories) {
    if (!cat.billboard) continue;
    const parsed = bucketAndKeyFromUrl(cat.billboard);
    if (parsed) expected.push({ url: cat.billboard, ...parsed, label: `categoría "${cat.name}"` });
  }
  for (const prod of products) {
    for (const url of prod.images ?? []) {
      const parsed = bucketAndKeyFromUrl(url);
      if (parsed) expected.push({ url, ...parsed, label: `producto "${prod.name}"` });
    }
  }
 
  console.log(
    `Hay ${expected.length} imagen(es)/video(s) referenciados en Mongo (categorías + productos).\n`
  );
 
  let uploaded = 0;
  const notFound: string[] = [];
  const ambiguous: string[] = [];
  const failed: string[] = [];
 
  for (const item of expected) {
    const fullName = path.basename(item.key);
    const suffix = originalSuffix(fullName);
 
    const candidates = localByName.get(fullName) ?? localByName.get(suffix) ?? [];
 
    if (candidates.length === 0) {
      notFound.push(`${item.label}: ${item.key}`);
      continue;
    }
    if (candidates.length > 1) {
      ambiguous.push(
        `${item.label}: "${suffix}" — encontré ${candidates.length} archivos con ese nombre, subí el primero (${candidates[0]})`
      );
    }
 
    const localPath = candidates[0];
    const ext = path.extname(localPath).toLowerCase();
    const buffer = fs.readFileSync(localPath);
 
    const { error } = await supabaseStorage.storage
      .from(item.bucket)
      .upload(item.key, buffer, { contentType: contentTypeFor(ext), upsert: true });
 
    if (error) {
      failed.push(`${item.label}: ${item.key} — ${error.message}`);
    } else {
      uploaded++;
      console.log(`✅ [${item.bucket}] ${item.key}`);
    }
  }
 
  console.log(`\n--- Resumen ---`);
  console.log(`Subidas: ${uploaded} / ${expected.length}`);
 
  if (ambiguous.length > 0) {
    console.log(`\n⚠️  Nombres ambiguos (revisá si subió la foto correcta):`);
    ambiguous.forEach((line) => console.log(`   - ${line}`));
  }
  if (failed.length > 0) {
    console.log(`\n❌ Fallaron al subir (error de Supabase):`);
    failed.forEach((line) => console.log(`   - ${line}`));
  }
  if (notFound.length > 0) {
    console.log(
      `\n❌ No encontré la foto local para ${notFound.length} imagen(es) — vas a tener que subirlas a mano desde /admin:`
    );
    notFound.forEach((line) => console.log(`   - ${line}`));
  }
 
  await mongoose.disconnect();
  process.exit(0);
}
 
main().catch((error) => {
  console.error(error);
  process.exit(1);
});