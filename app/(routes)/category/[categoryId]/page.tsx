import { getProducts } from "@/actions/getProducts";
import ProductList from "@/components/product-list";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const categoryId = (await params).categoryId;
  const products = await getProducts({ category: categoryId });
  return (
    <main className="min-h-[calc(100vh-300px)]">
      <ProductList title={categoryId} items={products} />
    </main>
  );
}
