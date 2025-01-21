import { getCategories } from "@/actions/getCategories";
import { getProducts } from "@/actions/getProducts";
import { CategoriesList } from "@/components/categories-list";
import Hero from "@/components/hero";
import ProductList from "@/components/product-list";

export const revalidate = 3600;

export default async function Home() {
  const query = { isFeatured: true, limit: 4 };
  const products = await getProducts(query);
  const categories = await getCategories();

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
