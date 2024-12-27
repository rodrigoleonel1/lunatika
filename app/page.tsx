import { getCategories } from "@/actions/getCategories";
import { getProducts } from "@/actions/getProducts";
import { CategoriesList } from "@/components/categories-list";
import Hero from "@/components/hero";
import ProductList from "@/components/product-list";

export default async function Home() {
  const products = await getProducts({ isFeatured: true });
  const categories = await getCategories();

  return (
    <>
      <Hero />
      <CategoriesList title="Categorías" items={categories} />
      <ProductList title="Productos destacados" items={products} />
    </>
  );
}
