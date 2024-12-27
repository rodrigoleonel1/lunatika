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
      <Heading title={title} description="Explora nuestras categorías." />

      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {items.map((item) => (
          <Link
            href={`/category/${item.name}`}
            key={item.id}
            className="flex flex-col items-center justify-between bg-white rounded-lg gap-4 shadow-md p-4"
          >
            <div className="w-full overflow-hidden rounded-lg bg-gray-200">
              <img
                src={item.billboard}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex justify-between w-full items-center">
              <p className="text-xl font-semibold">{item.name}</p>
              <IoChevronForward size={20} className="mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
};
