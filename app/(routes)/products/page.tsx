import { getProducts } from "@/actions/getProducts";
import ProductList from "@/components/product-list";


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
    ...(featured ? { isFeatured: Boolean(featured) } : {}),
    ...(material ? { material: material.toString() } : {}),
    ...(category ? { category: category.toString() } : {}),
  };
  const products = await getProducts(query);

  return (
    <>
      <ProductList
        title="Todos nuestros productos."
        items={products}
        query={query}
        filters
      />
    </>
  );
}
