import HeaderClient from "@/components/layout/HeaderClient";
import { getProductCategories } from "@/lib/graphql";

export default async function Navbar() {
  const categories = await getProductCategories(12);

  return <HeaderClient categories={categories} />;
}
