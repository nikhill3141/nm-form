"use client";

import { useMemo, useState } from "react";
import { BarChart3, Copy, Eye, FileText, Link2, Loader2, MessageSquare, Plus, Send, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";
import { recentForms } from "./data";
import { AnalyticsMockup, GlassPanel } from "./ui-blocks";

export function FunctionalDashboard() {
  const utils = trpc.useUtils();
  const me = trpc.auth.getLogedInUser.useQuery({}, { retry: false });
  const formsQuery = trpc.form.getAllFormsByUserId.useQuery({}, { enabled: Boolean(me.data), retry: false });
  const forms = useMemo(() => formsQuery.data ?? [], [formsQuery.data]);
  const [activeFormId, setActiveFormId] = useState<string>("");
  const activeForm = forms.find((form) => form.id === activeFormId) ?? forms[0];

  const responsesQuery = trpc.response.getResponsesByFormId.useQuery(
    { formId: activeForm?.id ?? "" },
    { enabled: Boolean(me.data && activeForm?.id), retry: false },
  );
  const linksQuery = trpc.formLink.getFormLinksByFormId.useQuery(
    { formId: activeForm?.id ?? "" },
    { enabled: Boolean(me.data && activeForm?.id && activeForm.visibility === "unlisted"), retry: false },
  );

  const publishForm = trpc.form.editForm.useMutation({
    onSuccess: async () => {
      await utils.form.getAllFormsByUserId.invalidate();
    },
  });
  const deleteForm = trpc.form.deleteForm.useMutation({
    onSuccess: async () => {
      setActiveFormId("");
      await utils.form.getAllFormsByUserId.invalidate();
    },
  });
  const createLink = trpc.formLink.createFormLink.useMutation({
    onSuccess: async () => {
      await utils.formLink.getFormLinksByFormId.invalidate();
    },
  });

  const stats = useMemo(
    () => [
      { label: "Live forms", value: forms.length || recentForms.length, icon: FileText },
      { label: "Responses", value: forms.reduce((sum, form) => sum + form.responseCount, 0) || 2171, icon: MessageSquare },
      { label: "Published", value: forms.filter((form) => form.isPublished).length || 3, icon: Send },
      { label: "Active links", value: linksQuery.data?.length ?? 1, icon: Link2 },
    ],
    [forms, linksQuery.data?.length],
  );

  const demoMode = !me.data;

  return (
    <div className="grid gap-6">
      {demoMode && (
        <GlassPanel className="p-5">
          <p className="text-sm leading-6 text-emerald-50/72">
            Sign in to hydrate this dashboard from your tRPC backend. Until then, this view shows the exact controls wired for form, link, response, and publish procedures.
          </p>
        </GlassPanel>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <GlassPanel className="p-5" key={stat.label}>
              <Icon className="mb-6 size-7 text-emerald-200" />
              <p className="text-sm text-emerald-50/60">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
            </GlassPanel>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassPanel className="p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/65">Recent forms</p>
              <h2 className="mt-1 text-2xl font-semibold">Workspace library</h2>
            </div>
            <Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" asChild>
              <a href="/builder">
                <Plus className="size-4" />
                New form
              </a>
            </Button>
          </div>
          <div className="grid gap-3">
            {(forms.length > 0 ? forms : recentForms).map((form) => {
              const isReal = "id" in form;
              const id = isReal ? form.id : form.title;
              return (
                <button
                  className="rounded-lg border border-white/10 bg-white/[0.06] p-4 text-left transition hover:border-emerald-300/35"
                  key={id}
                  onClick={() => isReal && setActiveFormId(form.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{form.title}</p>
                      <p className="mt-1 text-xs text-emerald-50/55">
                        {isReal ? `${form.visibility} · ${form.status}` : `${form.theme} · ${form.status}`}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-emerald-50/68">
                      {isReal ? form.responseCount : form.responses}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/65">Selected form</p>
              <h2 className="mt-1 text-2xl font-semibold">{activeForm?.title ?? "Forest launch survey"}</h2>
            </div>
            {formsQuery.isFetching && <Loader2 className="size-5 animate-spin text-emerald-200" />}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200"
              disabled={!activeForm}
              onClick={() => activeForm && publishForm.mutate({ id: activeForm.id, status: "published", isPublished: true })}
            >
              <Send className="size-4" />
              Publish
            </Button>
            <Button
              className="border-white/15 bg-white/10 text-white hover:bg-white/15"
              disabled={!activeForm || activeForm.visibility !== "unlisted"}
              onClick={() => activeForm && createLink.mutate({ formId: activeForm.id })}
              variant="outline"
            >
              <Link2 className="size-4" />
              Create link
            </Button>
            <Button className="border-white/15 bg-white/10 text-white hover:bg-white/15" disabled={!activeForm} asChild variant="outline">
              <a href={activeForm ? `/form/forest-feedback?formId=${activeForm.id}` : "/form/forest-feedback"}>
                <Eye className="size-4" />
                Preview
              </a>
            </Button>
            <Button
              className="border-red-300/20 bg-red-500/10 text-red-100 hover:bg-red-500/15"
              disabled={!activeForm}
              onClick={() => activeForm && deleteForm.mutate({ id: activeForm.id })}
              variant="outline"
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
          <div className="mt-5 grid gap-3">
            {(linksQuery.data ?? []).map((link) => (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-3 text-sm text-emerald-50/72" key={link.id}>
                <span className="truncate">/form/forest-feedback?formId={link.formId}&token={link.token}</span>
                <Copy className="size-4 text-emerald-200" />
              </div>
            ))}
            <div className="rounded-lg border border-white/10 bg-black/20 p-4">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <BarChart3 className="size-4 text-emerald-200" />
                Responses
              </p>
              <p className="text-sm text-emerald-50/62">
                {responsesQuery.data?.length ?? activeForm?.responseCount ?? 0} collected responses for the selected form.
              </p>
            </div>
          </div>
        </GlassPanel>
      </div>

      <AnalyticsMockup />
    </div>
  );
}
