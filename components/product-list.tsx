import { Product } from "@/lib/types";
import ProductCard from "./product-card";
import { Heading } from "./ui/heading";
import NoResults from "./ui/no-results";
import { Container } from "./container";

interface ProductListProps {
  title: string;
  items: Product[];
}

export default function ProductList({ title, items }: ProductListProps) {
  return (
    <Container>
      <div className="flex items-center justify-between mb-4">
        <Heading title={title} description="" />
      </div>
      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </Container>
  );
}
