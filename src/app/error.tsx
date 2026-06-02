"use client";

import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="container-app flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="display-2 mt-4">We hit an unexpected error.</h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[var(--color-muted)]">
        {error.message?.replace(/<[^>]*>/g, "") ||
          "An issue was encountered while preparing this page. Please try again."}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Try Again
        </button>
        <Link href="/" className="btn btn-secondary">
          Return Home
        </Link>
      </div>
    </main>
  );
}
