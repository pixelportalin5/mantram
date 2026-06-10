import OrderSuccessContent from "@/components/order-success/OrderSuccessContent";
import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Order Confirmed",
  description: `Your ${siteConfig.brandName} order has been received.`,
};

export default function OrderSuccessPage() {
  return <OrderSuccessContent />;
}
