"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { trpc } from "~/trpc/client";

// this code is the parent component were call the me procdure(getLogedInUser)
export function ProtectedView({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const me = trpc.auth.getLogedInUser.useQuery({}, { retry: false });

  useEffect(() => {
    if (me.isError) {
      router.replace("/login");
    }
  }, [me.isError, router]);

  if (me.isLoading || me.isError) {
    return (
      <main className="nm-app flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-emerald-200" />
      </main>
    );
  }

  return <main className="nm-app min-h-screen pb-16">{children}</main>;
}
