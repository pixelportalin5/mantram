import { redirect } from "next/navigation";

import CheckoutPageContent from "@/components/checkout/CheckoutPageContent";
import { loginRedirectPath } from "@/lib/auth-guard";
import { readSession } from "@/lib/auth-server";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Checkout",
  description: `Complete your order at ${siteConfig.brandName}.`,
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await readSession();

  if (!session) {
    redirect(loginRedirectPath("/checkout"));
  }

  return <CheckoutPageContent />;
}
