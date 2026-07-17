import { Metadata } from "next";
import { getProducts } from "@/actions/getProducts";
import { getCategories } from "@/actions/getCategories";
import { getMaterials } from "@/actions/getMaterials";
import ProductList from "@/components/product-list";

export const metadata: Metadata = {
  title: "Todos los productos | Lunatika Accesorios",
  description:
    "Explorá todo el catálogo de Lunatika: aritos, pulseras, anillos y cadenas en acero quirúrgico. Filtrá por categoría y material.",
  alternates: { canonical: "https://lunatika.vercel.app/products" },
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const limit = (await searchParams).limit;
  const featured = (await searchParams).featured;
  const category = (await searchParams).category;
  const material = (await searchParams).material;
  const query = {
    ...(limit ? { limit: Number(limit) } : {}),
    ...(featured ? { isFeatured: featured === "true" } : {}),
    ...(material ? { material: material.toString() } : {}),
    ...(category ? { category: category.toString() } : {}),
  };
  const [products, categories, materials] = await Promise.all([
    getProducts(query),
    getCategories(),
    getMaterials(),
  ]);

  return (
    <>
      <ProductList
        title="Todos nuestros productos."
        items={products}
        query={query}
        categories={categories}
        materials={materials}
        filters
      />
    </>
  );
}
