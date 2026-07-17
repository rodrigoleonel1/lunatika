import { Metadata } from "next";
import { getProduct } from "@/actions/getProduct";
import { Container } from "@/components/container";
import ProductGallery from "@/components/produtc-gallery";
import RelatedProducts from "@/components/related-products";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IoLogoWhatsapp } from "react-icons/io5";
import { notFound } from "next/navigation";

const SITE_URL = "https://lunatika.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}): Promise<Metadata> {
  const productId = (await params).productId;
  const product = await getProduct(productId);

  if (!product) {
    return { title: "Producto no encontrado | Lunatika" };
  }

  const title = `${product.name} | Lunatika Accesorios`;
  const description = `${product.name} - ${product.category.name} de ${product.material.name}. Precio: $${product.price}. Envíos a todo el país.`;
  const image = product.images?.[0];

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/products/${product.id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/products/${product.id}`,
      images: image ? [{ url: image, width: 800, height: 800, alt: product.name }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const productId = (await params).productId;
  const product = await getProduct(productId);

  if (!product) {
    notFound();
  }

  const message = `Hola, me interesó el producto ${product.name} en la página de Lunatika Accesorios. Quisiera más información.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: `${product.name} - ${product.category.name} de ${product.material.name}`,
    category: product.category.name,
    material: product.material.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "ARS",
      price: product.price,
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${SITE_URL}/products/${product.id}`,
    },
  };

  return (
    <Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 md:gap-y-10">
        <div className="md:hidden">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <Link
            className="mt-1 text-lg text-gray-500"
            href={`/category/${encodeURIComponent(product.category.name)}`}
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
              href={`/category/${encodeURIComponent(product.category.name)}`}
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
            className="block"
          >
            <Button className="w-full text-base py-6 [&_svg]:size-6">
              <IoLogoWhatsapp />
              Consultar
            </Button>
          </a>

          <div className="border-t border-gray-200 pt-6">
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
