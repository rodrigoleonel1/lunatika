import { Product } from "@/lib/types";
import ProductCard from "./product-card";
import { Heading } from "./ui/heading";
import NoResults from "./ui/no-results";
import { Container } from "./container";
import Link from "next/link";
import { IoChevronForward } from "react-icons/io5";

interface ProductListProps {
  title: string;
  items: Product[];
}

export default function ProductList({ title, items }: ProductListProps) {
  return (
    <Container>
      <div className="flex items-center justify-between mb-4">
        <Heading title={title} description="" />
        <Link
          href={"/featured"}
          className="items-center justify-between p-2 rounded-lg font-medium hidden md:flex"
        >
          <p>Ver todos los destacados</p>
          <IoChevronForward />
        </Link>
      </div>
      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
      <Link
        href={"/featured"}
        className="mt-4 flex items-center justify-between p-4 font-medium rounded-lg shadow-lg md:hidden"
      >
        <p>Ver todos los destacados</p>
        <IoChevronForward />
      </Link>
    </Container>
  );
}
