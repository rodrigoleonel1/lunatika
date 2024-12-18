import { getFeaturedProducts } from "@/actions/getProducts";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import Navbar from "@/components/navbar";
import ProductList from "@/components/product-list";

export default async function Home() {
  const items = await getFeaturedProducts();

  return (
    <>
      <Navbar />
      <Hero />
      <ProductList title="Productos destacados" items={items} />
      <Footer />
    </>
  );
}
