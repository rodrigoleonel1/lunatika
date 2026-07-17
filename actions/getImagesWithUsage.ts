import "server-only";
import { connectDB } from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import Category from "@/lib/models/Category";
import {
  listStorageFiles,
  PRODUCT_IMAGE_BUCKET,
  CATEGORY_IMAGE_BUCKET,
  StorageFile,
} from "@/lib/supabase-storage";

export interface ImageUsage {
  bucket: string;
  name: string;
  url: string;
  createdAt: string | null;
  products: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

/** Ignora el query string al comparar URLs (por si en algún momento se le
 * agrega un `?v=` para invalidar caché al reemplazar una imagen). */
function baseUrl(url: string): string {
  return url.split("?")[0];
}

export async function getImagesWithUsage(): Promise<ImageUsage[]> {
  await connectDB();

  const [productDocs, categoryDocs, productFiles, categoryFiles] = await Promise.all([
    Product.find({}, { name: 1, images: 1 }).lean(),
    Category.find({}, { name: 1, billboard: 1 }).lean(),
    listStorageFiles(PRODUCT_IMAGE_BUCKET),
    listStorageFiles(CATEGORY_IMAGE_BUCKET),
  ]);

  const productsByUrl = new Map<string, { id: string; name: string }[]>();
  for (const product of productDocs) {
    for (const url of product.images ?? []) {
      const key = baseUrl(url);
      const list = productsByUrl.get(key) ?? [];
      list.push({ id: String(product._id), name: product.name });
      productsByUrl.set(key, list);
    }
  }

  const categoriesByUrl = new Map<string, { id: string; name: string }[]>();
  for (const category of categoryDocs) {
    const key = baseUrl(category.billboard);
    const list = categoriesByUrl.get(key) ?? [];
    list.push({ id: String(category._id), name: category.name });
    categoriesByUrl.set(key, list);
  }

  const build = (files: StorageFile[], bucket: string): ImageUsage[] =>
    files.map((file) => {
      const key = baseUrl(file.url);
      return {
        bucket,
        name: file.name,
        url: file.url,
        createdAt: file.createdAt,
        products: productsByUrl.get(key) ?? [],
        categories: categoriesByUrl.get(key) ?? [],
      };
    });

  return [
    ...build(categoryFiles, CATEGORY_IMAGE_BUCKET),
    ...build(productFiles, PRODUCT_IMAGE_BUCKET),
  ];
}
