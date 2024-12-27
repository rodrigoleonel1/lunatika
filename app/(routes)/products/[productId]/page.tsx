import { getProduct } from "@/actions/getProduct";
import { Container } from "@/components/container";
import ProductGallery from "@/components/produtc-gallery";
import RelatedProducts from "@/components/related-products";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IoLogoWhatsapp } from "react-icons/io5";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const productId = (await params).productId;
  const product = await getProduct(productId);
  const message = `Hola, me interesó el producto ${product.name} en la página de Lunatika Accesorios. Quisiera más información.`;

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <h1>Producto no encontrado</h1>
      </div>
    );
  }

  return (
    <Container>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 md:gap-y-10">
        <div className="md:hidden">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <Link
            className="mt-1 text-lg text-gray-500"
            href={`/category/${product.category.name}`}
          >
            {product.category.name}
          </Link>
        </div>
        <ProductGallery
          mainImage={product.images[0]}
          productName={product.name}
          productImages={product.images}
        />
        <div className="space-y-6 col-span-1">
          <div className="hidden md:block">
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <Link
              className="mt-1 text-lg text-gray-500"
              href={`/category/${product.category.name}`}
            >
              {product.category.name}
            </Link>
          </div>

          <p className="text-2xl font-semibold border-t border-gray-200 pt-6">
            Precio: ${product.price}
          </p>
          <a
            href={`https://wa.me/5491168501099?text=${encodeURIComponent(
              message
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white flex gap-1"
          >
            <Button className="w-full text-base py-6 [&_svg]:size-6">
              <IoLogoWhatsapp />
              Consultar
            </Button>
          </a>

          <div className="border-t border-gray-200 pt-6">
            {/* <div className="space-y-4">
                  <h2 className="text-sm font-medium ">
                    Descripción
                  </h2>
                  <p className="text-base text-gray-700">
                    {product.description}
                  </p>
                </div> */}
            <div>
              <h3 className="font-medium">Material</h3>
              <p className="mt-2  text-gray-600">{product.material.name}</p>
            </div>
          </div>
        </div>
      </section>
      <RelatedProducts product={product} />
    </Container>
  );
}
