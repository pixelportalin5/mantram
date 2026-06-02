export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app">
        <header className="border-b border-[var(--color-line)] py-12 text-center lg:py-16">
          <div className="mx-auto skeleton h-3 w-24" />
          <div className="mx-auto skeleton mt-4 h-12 w-72" />
        </header>
        <div className="grid gap-10 py-10 lg:grid-cols-[260px_1fr] lg:gap-14 lg:py-12">
          <div className="hidden space-y-4 lg:block">
            <div className="skeleton h-4 w-24" />
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="skeleton h-4 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <div className="skeleton aspect-[4/5] w-full" />
                <div className="skeleton h-3 w-20" />
                <div className="skeleton h-4 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
