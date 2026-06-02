import { getPageByUri, stripHtml } from "@/lib/graphql";
import { siteConfig } from "@/lib/site-config";

export async function generateMetadata() {
  const page = await getPageByUri("contact");

  return {
    title: page?.title ?? "Contact",
    description: page?.content ? stripHtml(page.content).slice(0, 155) : undefined,
  };
}

export default async function ContactPage() {
  const page = await getPageByUri("contact");
  const configuredContact = Object.entries(siteConfig.contact).filter(([, value]) => value);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      <div className="container-app py-12 lg:py-20">
        <header className="border-b border-[var(--color-line)] pb-10 text-center lg:pb-14">
          <p className="eyebrow">Concierge</p>
          <h1 className="display-1 mt-4">
            {page?.title ?? "Speak with the studio."}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
            Order assistance, gifting, sizing, or aftercare — our team is on hand
            for any enquiry related to the house and its catalog.
          </p>
        </header>

        <div className="grid gap-12 pt-12 lg:grid-cols-2 lg:gap-16">
          <section>
            {page?.content ? (
              <div
                className="rich-text"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : (
              <p className="rich-text">
                Create a WordPress page with the URI <code>contact</code> to share
                your story here.
              </p>
            )}
          </section>

          <aside className="border border-[var(--color-line)] bg-white p-8">
            <p className="eyebrow">Direct</p>
            <h2 className="display-3 mt-3">Reach the studio</h2>

            {configuredContact.length ? (
              <dl className="mt-8 space-y-6 text-sm">
                {configuredContact.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-[0.66rem] uppercase tracking-[0.22em] text-[var(--color-faint)]">
                      {key}
                    </dt>
                    <dd className="mt-1 text-[var(--color-ink-soft)]">
                      {key === "email" ? (
                        <a className="hover:text-[var(--color-faint)]" href={`mailto:${value}`}>{value}</a>
                      ) : key === "phone" ? (
                        <a className="hover:text-[var(--color-faint)]" href={`tel:${value}`}>{value}</a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="mt-6 text-sm leading-7 text-[var(--color-muted)]">
                Configure <code>NEXT_PUBLIC_CONTACT_*</code> environment variables to
                populate this column.
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
