export default function RootLoading() {
  return (
    <main className="min-h-[60vh]">
      <div className="container-app py-16">
        <div className="space-y-4">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-10 w-72" />
          <div className="skeleton h-4 w-96" />
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="skeleton aspect-[4/5] w-full" />
              <div className="skeleton h-3 w-20" />
              <div className="skeleton h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
