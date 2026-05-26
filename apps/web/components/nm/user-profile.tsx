"use client";

import Link from "next/link";
import { CalendarDays, FileText, Link2, Loader2, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";
import { docsHref } from "./data";
import { GlassPanel } from "./ui-blocks";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "NM";
}

function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function UserProfile() {
  const me = trpc.auth.getLogedInUser.useQuery({}, { retry: false });
  const formsQuery = trpc.form.getAllFormsByUserId.useQuery(
    {},
    { enabled: Boolean(me.data), retry: false },
  );

  if (me.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-emerald-500 dark:text-emerald-200" />
      </div>
    );
  }

  if (!me.data) return null;

  const forms = formsQuery.data ?? [];
  const publishedForms = forms.filter((form) => form.isPublished);
  const protectedForms = forms.filter((form) => form.isPasswordProtected);
  const latestForm = [...forms].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )[0];

  const stats = [
    { label: "Forms", value: forms.length, icon: FileText },
    { label: "Published", value: publishedForms.length, icon: Link2 },
    { label: "Protected", value: protectedForms.length, icon: ShieldCheck },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16">
      <GlassPanel className="p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="size-24 border border-emerald-900/10 bg-white/70 dark:border-white/10 dark:bg-white/[0.08]">
              <AvatarImage src={me.data.profileImageUrl ?? undefined} alt={me.data.fullName} />
              <AvatarFallback className="bg-emerald-300 text-2xl font-semibold text-emerald-950">
                {getInitials(me.data.fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">
                <UserRound className="size-4" />
                User profile
              </p>
              <h1 className="break-words text-3xl font-semibold text-emerald-950 dark:text-white md:text-5xl">
                {me.data.fullName}
              </h1>
              <p className="mt-3 flex items-center gap-2 break-all text-sm text-emerald-900/64 dark:text-emerald-50/64">
                <Mail className="size-4 shrink-0" />
                {me.data.email}
              </p>
            </div>
          </div>
          <Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" asChild>
            <Link href="/builder">Create form</Link>
          </Button>
        </div>
      </GlassPanel>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassPanel className="p-5" key={stat.label}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-emerald-900/62 dark:text-emerald-50/62">{stat.label}</p>
                <Icon className="size-5 text-emerald-600 dark:text-emerald-200" />
              </div>
              <p className="mt-3 text-4xl font-semibold text-emerald-950 dark:text-white">{stat.value}</p>
            </GlassPanel>
          );
        })}
      </div>

      <GlassPanel className="p-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">
              Workspace activity
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-emerald-950 dark:text-white">
              {latestForm ? latestForm.title : "No forms yet"}
            </h2>
            <p className="mt-2 flex items-center gap-2 text-sm text-emerald-900/58 dark:text-emerald-50/58">
              <CalendarDays className="size-4" />
              Latest update: {formatDate(latestForm?.updatedAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="nm-button-glass" asChild variant="outline">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
            <Button className="nm-button-glass" asChild variant="outline">
              <a href={docsHref}>Documentation</a>
            </Button>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
