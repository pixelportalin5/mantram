import ProductCard from "@/components/ui/ProductCard";
import { getProducts } from "@/lib/graphql";

type ProductGridProps = {
  category?: string;
  limit?: number;
  title?: string;
  eyebrow?: string;
};

export default async function ProductGrid({
  category,
  limit = 4,
  title,
  eyebrow,
}: ProductGridProps) {
  const products = await getProducts(limit, category);

  return (
    <section className="container-app py-16 lg:py-24">
      {title ? (
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
            <h2 className="display-2 text-[var(--color-ink-soft)]">{title}</h2>
          </div>
          <div className="hidden h-px flex-1 bg-[var(--color-line)] md:block md:max-w-md" />
        </div>
      ) : null}

      {products.length ? (
        <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="border border-[var(--color-line)] bg-white px-8 py-16 text-center">
          <p className="eyebrow">Catalog Empty</p>
          <h3 className="display-3 mt-4 text-[var(--color-ink-soft)]">
            No products have been added yet.
          </h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
            Add products in WooCommerce and they will automatically appear here after
            the next GraphQL revalidation.
          </p>
        </div>
      )}
    </section>
  );
}
