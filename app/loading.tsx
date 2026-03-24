export default function GlobalLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="skeleton-soft h-10 w-52 rounded-xl" />
      <div className="skeleton-soft mt-4 h-5 w-80 rounded-lg" />

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={`route-loading-${index}`} className="skeleton-soft h-[320px] rounded-3xl" />
        ))}
      </div>
    </section>
  );
}
