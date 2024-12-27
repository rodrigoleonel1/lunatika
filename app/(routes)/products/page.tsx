import ProductList from "@/components/product-list";
import { getProducts } from "@/actions/getProducts";

export default async function ProductsPage() {
  const products = await getProducts({});
  return <ProductList title="Todos nuestros productos." items={products} />;
}
