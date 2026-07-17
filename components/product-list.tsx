import { Category, Material, Product, Query } from "@/lib/types";
import ProductCard from "./product-card";
import { Heading } from "./ui/heading";
import NoResults from "./ui/no-results";
import { Container } from "./container";
import MaterialSelect from "./material-select";
import { getCategories } from "@/actions/getCategories";
import { getMaterials } from "@/actions/getMaterials";

interface ProductListProps {
  title: string;
  items: Product[];
  filters?: boolean;
  query: Query;
  basePath?: string;
  categories?: Category[];
  materials?: Material[];
}

export default async function ProductList({
  title,
  items,
  filters,
  query,
  basePath = "/products",
  categories: categoriesProp,
  materials: materialsProp,
}: ProductListProps) {
  let categories: Category[] = categoriesProp ?? [];
  let materials: Material[] = materialsProp ?? [];

  // Si el que llama ya trajo categorías/materiales (en paralelo con los
  // productos), no hace falta pedirlos de nuevo acá.
  if (filters && !categoriesProp && !materialsProp) {
    [categories, materials] = await Promise.all([getCategories(), getMaterials()]);
  }

  return (
    <Container>
      <Heading title={title} separator />
      {filters && (
        <MaterialSelect
          query={query}
          basePath={basePath}
          categories={categories}
          materials={materials}
        />
      )}
      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </Container>
  );
}
