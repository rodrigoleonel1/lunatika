import { getProducts } from "@/actions/getProducts";
import ProductList from "@/components/product-list";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const limit = (await searchParams).limit;
  const featured = (await searchParams).featured;
  const material = (await searchParams).material;
  const categoryId = (await params).categoryId;

  const query = {
    ...(limit ? { limit: Number(limit) } : {}),
    ...(featured ? { isFeatured: Boolean(featured) } : {}),
    ...(material ? { material: material.toString() } : {}),
    ...{ category: categoryId },
  };

  const products = await getProducts(query);

  return (
    <main className="min-h-[calc(100vh-300px)]">
      <ProductList title={categoryId} items={products} query={query} filters />
    </main>
  );
}
