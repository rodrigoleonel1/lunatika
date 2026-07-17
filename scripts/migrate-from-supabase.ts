/**
 * Migra las categorías, materiales y productos de un dump de Postgres de
 * Supabase (`pg_dump` en formato texto plano, el que baja el dashboard de
 * Supabase como "Database backup") a las colecciones de MongoDB que usa
 * esta app.
 *
 * Uso:
 *   npm run migrate:supabase -- --file=scripts/data/mi-backup.backup
 *
 * Si en Mongo ya hay categorías, materiales o productos cargados, el script
 * no hace nada (para no duplicar datos) salvo que agregues --force.
 *
 * Las URLs de imágenes se copian tal cual vienen en el dump — asumen que el
 * proyecto de Supabase sigue activo y sirviendo el Storage desde la misma
 * URL. Si en algún momento cerrás ese proyecto, hay que re-subir las
 * imágenes y actualizar estas URLs.
 */
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";
import Category from "../lib/models/Category";
import Material from "../lib/models/Material";
import Product from "../lib/models/Product";

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found?.slice(prefix.length);
}

/** Revierte el escapado que usa `COPY ... TO stdout` en formato texto. */
function unescapeCopyField(raw: string): string {
  return raw
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\\\/g, "\\");
}

/** Parsea el literal de array de Postgres `{a,b,c}` que usa la columna images. */
function parseImagesArray(raw: string | undefined): string[] {
  if (!raw || raw === "\\N") return [];
  const inner = raw.trim().replace(/^\{/, "").replace(/\}$/, "");
  if (inner.length === 0) return [];
  return inner
    .split(",")
    .map((item) => unescapeCopyField(item.trim()))
    .filter(Boolean);
}

/**
 * Extrae las filas de un bloque `COPY public.<tabla> (...) FROM stdin; ... \.`
 * del dump, devolviendo cada fila ya separada por tabulador.
 */
function extractCopyBlock(content: string, tableName: string): string[][] {
  const startRe = new RegExp(
    `^COPY public\\.${tableName} \\([^)]*\\) FROM stdin;$`,
    "m"
  );
  const startMatch = startRe.exec(content);
  if (!startMatch) return [];

  const startIdx = startMatch.index + startMatch[0].length;
  const endIdx = content.indexOf("\n\\.", startIdx);
  const block = content
    .slice(startIdx, endIdx === -1 ? undefined : endIdx)
    .replace(/^\n/, "");

  if (!block.trim()) return [];
  return block.split("\n").map((line) => line.split("\t"));
}

async function main() {
  const filePath = getArg("file");
  if (!filePath) {
    console.error(
      "Uso: npm run migrate:supabase -- --file=scripts/data/tu-backup.backup"
    );
    process.exit(1);
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`No encuentro el archivo: ${resolved}`);
    process.exit(1);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("Falta la variable de entorno MONGODB_URI en tu .env");
    process.exit(1);
  }

  const content = fs.readFileSync(resolved, "utf-8");

  const categoryRows = extractCopyBlock(content, "category");
  const materialRows = extractCopyBlock(content, "material");
  const productRows = extractCopyBlock(content, "product");

  console.log(
    `Encontrados en el backup: ${categoryRows.length} categorías, ${materialRows.length} materiales, ${productRows.length} productos.`
  );

  if (categoryRows.length === 0 && materialRows.length === 0 && productRows.length === 0) {
    console.error(
      "No encontré datos de category/material/product en ese archivo. ¿Es el backup correcto?"
    );
    process.exit(1);
  }

  await mongoose.connect(mongoUri);

  const force = process.argv.includes("--force");
  const [existingCategories, existingMaterials, existingProducts] = await Promise.all([
    Category.countDocuments(),
    Material.countDocuments(),
    Product.countDocuments(),
  ]);

  if ((existingCategories || existingMaterials || existingProducts) && !force) {
    console.error(
      `Ya hay datos cargados en Mongo (categorías: ${existingCategories}, materiales: ${existingMaterials}, productos: ${existingProducts}).\n` +
        "Para evitar duplicar, no sigo. Si de verdad querés migrar igual, corré de nuevo agregando --force."
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  // --- Categorías ---
  const categoryIdMap = new Map<string, mongoose.Types.ObjectId>();
  const categoryDocs = categoryRows.map((fields) => {
    const [oldId, name, createdAt, billboard] = fields;
    const _id = new mongoose.Types.ObjectId();
    categoryIdMap.set(oldId, _id);
    const createdDate = new Date(createdAt);
    return {
      _id,
      name: unescapeCopyField(name),
      billboard: unescapeCopyField(billboard),
      createdAt: createdDate,
      updatedAt: createdDate,
    };
  });
  if (categoryDocs.length > 0) {
    await Category.collection.insertMany(categoryDocs);
  }
  console.log(`✅ ${categoryDocs.length} categorías migradas.`);

  // --- Materiales ---
  const materialIdMap = new Map<string, mongoose.Types.ObjectId>();
  const materialDocs = materialRows.map((fields) => {
    const [oldId, name] = fields;
    const _id = new mongoose.Types.ObjectId();
    materialIdMap.set(oldId, _id);
    return { _id, name: unescapeCopyField(name) };
  });
  if (materialDocs.length > 0) {
    await Material.collection.insertMany(materialDocs);
  }
  console.log(`✅ ${materialDocs.length} materiales migrados.`);

  // --- Productos ---
  const skipped: string[] = [];
  const productDocs: Record<string, unknown>[] = [];

  for (const fields of productRows) {
    const [
      oldId,
      oldCategoryId,
      oldMaterialId,
      name,
      price,
      stock,
      isFeatured,
      isArchived,
      images,
      createdAt,
      updatedAt,
    ] = fields;

    const category_id = categoryIdMap.get(oldCategoryId);
    const material_id = materialIdMap.get(oldMaterialId);
    const cleanName = unescapeCopyField(name).trim();

    if (!category_id || !material_id) {
      skipped.push(
        `${cleanName} (id vieja ${oldId}) — no encontré la categoría o el material que usaba`
      );
      continue;
    }

    productDocs.push({
      _id: new mongoose.Types.ObjectId(),
      name: cleanName,
      price: Number(price),
      stock: Number(stock),
      isFeatured: isFeatured === "t",
      isArchived: isArchived === "t",
      images: parseImagesArray(images),
      category_id,
      material_id,
      createdAt: new Date(createdAt),
      updatedAt: new Date(updatedAt),
    });
  }

  if (productDocs.length > 0) {
    await Product.collection.insertMany(productDocs, { ordered: false });
  }
  console.log(`✅ ${productDocs.length} productos migrados.`);

  if (skipped.length > 0) {
    console.log(`\n⚠️  ${skipped.length} producto(s) NO se migraron:`);
    skipped.forEach((line) => console.log(`   - ${line}`));
  }

  // Aviso (no bloqueante) de posibles productos duplicados por nombre+precio,
  // para que los revises a mano en el panel si corresponde.
  const seen = new Map<string, number>();
  for (const doc of productDocs) {
    const key = `${(doc.name as string).toLowerCase()}|${doc.price}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  const dupes = [...seen.entries()].filter(([, count]) => count > 1);
  if (dupes.length > 0) {
    console.log(
      `\n⚠️  Posibles productos duplicados (mismo nombre y precio), revisalos en /admin/products:`
    );
    dupes.forEach(([key, count]) => console.log(`   - "${key.split("|")[0]}" aparece ${count} veces`));
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
