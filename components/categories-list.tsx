import { Category } from "@/lib/types";
import { Container } from "./container";
import { Heading } from "./ui/heading";
import { IoChevronForward } from "react-icons/io5";
import NoResults from "./ui/no-results";
import Link from "next/link";

interface CategoriesListProps {
  title: string;
  items: Category[];
}

export const CategoriesList = ({ title, items }: CategoriesListProps) => {
  return (
    <Container>
      <Heading title={title} description="" />

      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {items.map((item) => (
          <Link
            href={`/category/${item.name}`}
            key={item.id}
            className="flex items-center justify-between bg-white rounded-lg shadow-md p-4"
          >
            <p>{item.name}</p>
            <IoChevronForward />
          </Link>
        ))}
      </div>
    </Container>
  );
};
