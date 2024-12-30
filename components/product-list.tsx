import { Product, Query } from "@/lib/types";
import ProductCard from "./product-card";
import { Heading } from "./ui/heading";
import NoResults from "./ui/no-results";
import { Container } from "./container";
import MaterialSelect from "./material-select";

interface ProductListProps {
  title: string;
  items: Product[];
  filters?: boolean;
  query: Query;
}

export default function ProductList({
  title,
  items,
  filters,
  query,
}: ProductListProps) {
  return (
    <Container>
      <Heading title={title} separator />
      {filters && <MaterialSelect query={query} category={title} />}
      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </Container>
  );
}
