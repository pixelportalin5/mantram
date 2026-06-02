import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-16 lg:py-24">
      <div className="container-app">
        <div className="mx-auto max-w-md">
          <Link
            href="/"
            className="block text-center text-[0.7rem] uppercase tracking-[0.32em] text-[var(--color-faint)]"
          >
            Mantram
          </Link>
          <div className="mt-10 border border-[var(--color-line)] bg-white p-8 shadow-[var(--shadow-luxury-sm)] lg:p-10">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="display-3 mt-3">{title}</h1>
            {description ? (
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                {description}
              </p>
            ) : null}
            <div className="mt-8">{children}</div>
          </div>
          {footer ? (
            <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
              {footer}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
}
