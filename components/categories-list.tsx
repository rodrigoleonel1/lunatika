import { Category } from "@/lib/types";
import { Container } from "./container";
import { Heading } from "./ui/heading";
import { IoChevronForward } from "react-icons/io5";
import NoResults from "./ui/no-results";
import Link from "next/link";
import Image from "next/image";

interface CategoriesListProps {
  title: string;
  items: Category[];
}

export const CategoriesList = ({ title, items }: CategoriesListProps) => {
  return (
    <Container>
      <Heading title={title} description="Explora nuestras categorías." />

      {items.length === 0 && <NoResults />}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mt-4">
        {items.map((item) => (
          <Link
            href={`/category/${encodeURIComponent(item.name)}`}
            key={item.id}
            className="flex flex-col items-center justify-between bg-white rounded-lg gap-4 shadow-md p-4"
          >
            <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={item.billboard}
                alt={`Categoría ${item.name}`}
                fill
                sizes="(max-width: 768px) 45vw, 22vw"
                className="object-cover"
              />
            </div>
            <div className="flex justify-between w-full items-center">
              <p className="text-lg font-medium md:text-xl">{item.name}</p>
              <IoChevronForward size={20} className="mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </Container>
  );
};
