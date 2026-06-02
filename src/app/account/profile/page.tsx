import ProfileForm from "@/components/account/ProfileForm";
import { fetchCustomer, requireSession } from "@/lib/auth-server";

export const metadata = {
  title: "Profile",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireSession();
  if (!session) return null;

  const profile = await fetchCustomer(session.authToken);

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">Account</p>
        <h2 className="display-3 mt-2">Profile &amp; addresses</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-muted)]">
          Keep your contact and shipping information up to date. Changes are
          synced to your WooCommerce account immediately.
        </p>
      </header>
      <ProfileForm initialProfile={profile} />
    </div>
  );
}
