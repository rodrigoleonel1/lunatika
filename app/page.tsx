import Navbar from "@/components/navbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Navbar />
      <ul className="p-4 flex flex-col gap-4">
        <li>
          <Link href={"/product"}>Crear Producto</Link>
        </li>
        <li>
          <Link href={"/products"}>Ver Productos</Link>
        </li>
      </ul>
    </>
  );
}
