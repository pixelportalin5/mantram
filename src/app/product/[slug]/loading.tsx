export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app py-10 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="skeleton aspect-square w-full" />
          <div className="space-y-5">
            <div className="skeleton h-3 w-32" />
            <div className="skeleton h-10 w-3/4" />
            <div className="skeleton h-6 w-32" />
            <div className="space-y-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-4/6" />
            </div>
            <div className="skeleton h-12 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
