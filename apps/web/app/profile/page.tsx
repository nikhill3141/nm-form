import { Suspense } from "react";
import { ProtectedView } from "~/components/nm/protected-view";
import { UserProfile } from "~/components/nm/user-profile";

export default function ProfilePage() {
  return (
    <ProtectedView>
      <section className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="forest-scene absolute inset-0 opacity-35" />
        <div className="fog-layer absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.72),#f8fafc_88%)] dark:bg-[linear-gradient(180deg,rgba(6,18,13,0.58),#06120d_88%)]" />
      </section>
      <section className="relative">
        <Suspense>
          <UserProfile />
        </Suspense>
      </section>
    </ProtectedView>
  );
}
