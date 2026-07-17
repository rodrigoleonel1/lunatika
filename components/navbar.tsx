import { getCategories } from "@/actions/getCategories";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const categories = await getCategories();

  return <NavbarClient categories={categories} />;
}
