import { Heading } from "./ui/heading";
import { Product } from "@/lib/types";
import ProductCard from "./product-card";
import { getProducts } from "@/actions/getProducts";

interface RelatedProductsProps {
  product: Product;
}

export default async function RelatedProducts({
  product,
}: RelatedProductsProps) {
  const relatedProducts = await getProducts({
    category: product.category.name,
  });

  return (
    <section className="pt-6 md:mt-16 md:pt-8 border-t border-gray-200">
      <Heading
        title={"Productos relacionados"}
        description={"También te puede gustar."}
      />
      <div className="mt-6 grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
