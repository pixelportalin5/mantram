import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-app flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">404</p>
      <h1 className="display-1 mt-4">We can&apos;t find that.</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-muted)]">
        The page you were looking for may have moved or no longer exists. Continue
        with the catalog or get in touch with the studio.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/shop" className="btn btn-primary">
          Shop the Collection
        </Link>
        <Link href="/contact" className="btn btn-secondary">
          Contact Concierge
        </Link>
      </div>
    </main>
  );
}
