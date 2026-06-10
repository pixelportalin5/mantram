import CartPageContent from "@/components/cart/CartPageContent";
import { getFeaturedProducts } from "@/lib/graphql";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Shopping Bag",
  description: `Review your selected pieces and proceed to checkout at ${siteConfig.brandName}.`,
};

export default async function CartPage() {
  const recommendations = await getFeaturedProducts(8);

  return <CartPageContent recommendations={recommendations} />;
}
