import { Metadata } from "next";
import { getProducts } from "@/actions/getProducts";
import { getCategories } from "@/actions/getCategories";
import { getMaterials } from "@/actions/getMaterials";
import ProductList from "@/components/product-list";

const SITE_URL = "https://lunatika.vercel.app";

export const revalidate = 2592000;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}): Promise<Metadata> {
  const categoryId = decodeURIComponent((await params).categoryId);
  const title = `${categoryId} | Lunatika Accesorios`;
  const description = `Descubrí nuestra colección de ${categoryId.toLowerCase()}. Envíos a todo el país.`;

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/category/${encodeURIComponent(categoryId)}` },
    openGraph: { title, description, url: `${SITE_URL}/category/${encodeURIComponent(categoryId)}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const limit = (await searchParams).limit;
  const page = (await searchParams).page;
  const featured = (await searchParams).featured;
  const material = (await searchParams).material;
  const categoryId = decodeURIComponent((await params).categoryId);

  const query = {
    limit: limit ? Number(limit) : 12,
    ...(page ? { page: Number(page) } : {}),
    ...(featured ? { isFeatured: featured === "true" } : {}),
    ...(material ? { material: material.toString() } : {}),
    ...{ category: categoryId },
  };

  const [products, categories, materials] = await Promise.all([
    getProducts(query),
    getCategories(),
    getMaterials(),
  ]);

  return (
    <main className="min-h-[calc(100vh-300px)]">
      <ProductList
        title={categoryId}
        items={products}
        query={query}
        categories={categories}
        materials={materials}
        basePath={`/category/${encodeURIComponent(categoryId)}`}
        filters
      />
    </main>
  );
}
