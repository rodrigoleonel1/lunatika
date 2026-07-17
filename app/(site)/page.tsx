import { Metadata } from "next";
import { getCategories } from "@/actions/getCategories";
import { getProducts } from "@/actions/getProducts";
import { CategoriesList } from "@/components/categories-list";
import Hero from "@/components/hero";
import ProductList from "@/components/product-list";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Lunatika Accesorios | Aritos, pulseras, anillos y cadenas",
  description:
    "Tienda online de accesorios en acero quirúrgico: aritos, pulseras, anillos y cadenas. Envíos a todo el país. Descubrí la colección de Lunatika.",
  alternates: { canonical: "https://lunatika.vercel.app" },
};

export default async function Home() {
  const query = { isFeatured: true, limit: 4 };
  const [products, categories] = await Promise.all([
    getProducts(query),
    getCategories(),
  ]);

  return (
    <>
      <Hero />
      <CategoriesList title="Categorías" items={categories} />
      <ProductList
        title="Productos destacados"
        items={products}
        query={query}
      />
    </>
  );
}
