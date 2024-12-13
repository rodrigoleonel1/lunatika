import Link from "next/link";

export default function Navbar() {
  return (
    <div className="border-b h-16 px-4 flex items-center justify-between">
      <Link href="/">
        <p className="font-bold text-xl">lunatika</p>
      </Link>
      <nav className="flex items-center gap-2">
        <Link
          href={"/pulseras"}
          className={"text-sm font-medium transition-colors hover:text-black"}
        >
          Pulseras
        </Link>
        <Link
          href={"/pulseras"}
          className={"text-sm font-medium transition-colors hover:text-black"}
        >
          Anillos
        </Link>
        <Link
          href={"/aritos"}
          className={"text-sm font-medium transition-colors hover:text-black"}
        >
          Aritos
        </Link>
        <Link
          href={"/cadenas"}
          className={"text-sm font-medium transition-colors hover:text-black"}
        >
          Cadenas
        </Link>
      </nav>
    </div>
  );
}
