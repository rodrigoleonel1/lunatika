import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

// Las categorías de la navbar cambian poco: revalidamos cada hora en vez de
// pegarle a MongoDB en cada request. `router.refresh()` en el admin no
// invalida esto, pero es un desfasaje aceptable para un menú de navegación.
export const revalidate = 3600;

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
