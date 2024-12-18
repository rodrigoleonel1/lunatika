import { Product } from "@/lib/types";
import { Button } from "./ui/button";


interface ProductCard {
  product: Product
}

export default function ProductCard({ product }: ProductCard) {

console.log(product)
  return (
    <div className="group relative">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 max-h-64">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover object-bottom group-hover:opacity-75"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <a href="#">
              <span aria-hidden="true" className="absolute inset-0" />
              {product.name}
            </a>
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.category_id}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">${product.price}</p>
      </div>
      <Button className="w-full">Ver producto</Button>
    </div>
  );
}
