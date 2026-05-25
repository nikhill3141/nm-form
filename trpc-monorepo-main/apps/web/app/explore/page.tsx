"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Loader2,
  MousePointer2,
  Radio,
  Sparkles,
  TextCursorInput,
  UserRound,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { PageShell } from "~/components/nm/site-chrome";
import { GlassPanel } from "~/components/nm/ui-blocks";
import { templates } from "~/components/nm/data";
import { getFormTheme } from "~/components/nm/themes";
import { trpc } from "~/trpc/client";

const publicFormPreviewQuestions = [
  "What should we improve first?",
  "How satisfied are you?",
  "Tell us what made that moment work.",
];

function getTemplatePreviewOptions(template: (typeof templates)[number]) {
  const optionQuestion = template.questions.find((question) => question.options?.length);
  if (optionQuestion?.options?.length) {
    return optionQuestion.options.slice(0, 4);
  }

  return template.questions.slice(0, 4).map((question) => question.label);
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const highlightedFormId = searchParams.get("formId");
  const publicFormsQuery = trpc.explore.explorePublicForms.useQuery({}, { retry: false });
  const publicForms = useMemo(
    () =>
      [...(publicFormsQuery.data ?? [])].sort(
        (a, b) =>
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime(),
      ),
    [publicFormsQuery.data],
  );

  return (
    <PageShell
      description="Step into public forms that feel like tiny experiences, then fill them or remix a polished template into your own."
      eyebrow="Explore"
      title="A gallery of live forms you can actually feel."
    >
      <section className="px-6 py-14">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          <GlassPanel className="relative overflow-hidden p-7">
            <div className="forest-scene absolute inset-0 opacity-35" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.92),rgba(236,253,245,0.74))] dark:bg-[linear-gradient(90deg,rgba(6,18,13,0.92),rgba(6,18,13,0.58))]" />
            <div className="relative">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/75 dark:text-emerald-200/75">
                Public discovery
              </p>
              <h2 className="max-w-2xl text-3xl font-semibold leading-tight text-emerald-950 md:text-5xl dark:text-white">
                Fill a real community form or turn a template into your next launch.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-emerald-900/70 dark:text-emerald-50/70">
                Each card previews the form mood, creator, response activity, and the kind of questions respondents will see.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ["Live public forms", publicForms.length],
                  ["Starter templates", templates.length],
                  ["Total responses", publicForms.reduce((sum, form) => sum + form.responseCount, 0)],
                ].map(([label, value]) => (
                  <div className="rounded-lg border border-emerald-900/10 bg-white/72 p-4 dark:border-white/10 dark:bg-white/[0.08]" key={label}>
                    <p className="text-2xl font-semibold text-emerald-950 dark:text-white">{value}</p>
                    <p className="mt-1 text-xs text-emerald-900/58 dark:text-emerald-50/58">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel className="overflow-hidden p-5">
            <div className="rounded-xl border border-emerald-900/10 bg-[#07140d] p-5 text-white shadow-2xl shadow-emerald-950/20">
              <div className="forest-scene absolute inset-0 hidden" />
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/70">Form preview</p>
                  <h3 className="mt-1 text-2xl font-semibold">Community feedback</h3>
                </div>
                <span className="rounded-full border border-emerald-300/25 bg-emerald-300/12 px-3 py-1 text-xs text-emerald-100">
                  3 questions
                </span>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-white/12 bg-white/[0.08] p-4">
                  <p className="mb-3 text-sm font-medium">Which part should we improve first?</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {["Design", "Speed", "Sharing", "Analytics"].map((option, index) => (
                      <div
                        className={`rounded-lg border px-3 py-2 text-sm ${index === 1 ? "border-emerald-300/60 bg-emerald-300/16" : "border-white/10 bg-black/16"}`}
                        key={option}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[64%] rounded-full bg-emerald-300" />
                </div>
                <Button className="w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
                  Continue form
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </GlassPanel>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/70 dark:text-emerald-200/70">
                Public forms
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-emerald-950 dark:text-white">
                Browse what people are collecting.
              </h2>
            </div>
            {publicFormsQuery.isFetching && <Loader2 className="size-5 animate-spin text-emerald-500 dark:text-emerald-200" />}
          </div>

          {publicForms.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {publicForms.map((form) => {
                const theme = getFormTheme(form.theme);
                const Icon = theme.icon;
                const isHighlighted = form.id === highlightedFormId;

                return (
                  <GlassPanel
                    className={`group overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/15 ${isHighlighted ? "ring-2 ring-emerald-300/70" : ""}`}
                    key={form.id}
                  >
                    <div className={`relative min-h-44 overflow-hidden ${theme.pageClass}`}>
                      <div className={`${theme.sceneClass} absolute inset-0 opacity-50`} />
                      <div className={`absolute inset-0 ${theme.overlayClass}`} />
                      <div className="relative flex h-full min-h-44 flex-col justify-between p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex size-12 items-center justify-center rounded-lg border border-white/14 bg-white/12 text-current backdrop-blur-xl">
                            <Icon className="size-6" />
                          </div>
                          <span className="rounded-full border border-white/14 bg-white/12 px-3 py-1 text-xs backdrop-blur-xl">
                            {form.responseCount} responses
                          </span>
                        </div>
                        <div>
                          <p className="mb-2 text-xs uppercase tracking-[0.2em] opacity-70">{theme.label}</p>
                          <h3 className="line-clamp-2 text-2xl font-semibold">{form.title}</h3>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="min-h-12 text-sm leading-6 text-emerald-900/65 dark:text-emerald-50/65">
                        {form.description || "A public form shared with the NM Forms community."}
                      </p>

                      <div className="mt-5 space-y-2 rounded-lg border border-emerald-900/10 bg-emerald-50/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
                        {publicFormPreviewQuestions.map((question, index) => (
                          <div className="flex items-center gap-3 text-sm text-emerald-900/72 dark:text-emerald-50/72" key={question}>
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-emerald-300/22 text-xs font-semibold text-emerald-800 dark:text-emerald-100">
                              {index + 1}
                            </span>
                            <span className="truncate">{question}</span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-5 flex items-center gap-2 text-sm text-emerald-900/62 dark:text-emerald-50/62">
                        <UserRound className="size-4 text-emerald-500 dark:text-emerald-200" />
                        Created by {form.creatorName ?? "NM Forms user"}
                      </div>
                      <div className="mt-7 grid gap-2 sm:grid-cols-2">
                        <Button asChild className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
                          <Link href={`/form/${form.slug}`}>
                            <MousePointer2 className="size-4" />
                            Fill form
                          </Link>
                        </Button>
                        <Button asChild className="nm-button-glass" variant="outline">
                          <Link href={`/builder?template=${templates[0]?.slug ?? "product-feedback"}`}>
                            <Sparkles className="size-4" />
                            Remix
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </GlassPanel>
                );
              })}
            </div>
          ) : (
            <GlassPanel className="p-8 text-center">
              <Compass className="mx-auto mb-4 size-10 text-emerald-500 dark:text-emerald-200" />
              <h3 className="text-2xl font-semibold">No public forms yet.</h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-emerald-900/65 dark:text-emerald-50/65">
                Publish a form as public and it will appear here for anyone to fill.
              </p>
              <Button asChild className="mt-6 bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
                <Link href="/builder">
                  Create public form
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </GlassPanel>
          )}
        </div>
      </section>

      <section className="px-6 pb-20 pt-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700/70 dark:text-emerald-200/70">
              Starter templates
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-emerald-950 dark:text-white">
              Good-looking forms you can make your own.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {templates.map((template) => {
              const options = getTemplatePreviewOptions(template);
              const theme = getFormTheme(template.themeValue);
              const Icon = theme.icon;

              return (
              <GlassPanel className="overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-950/15" key={template.slug}>
                <div className="p-5">
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-300/18 text-emerald-700 dark:text-emerald-200">
                    <Icon className="size-6" />
                  </div>
                  <span className="rounded-full border border-emerald-900/10 bg-white/64 px-3 py-1 text-xs text-emerald-900/68 dark:border-white/10 dark:bg-white/[0.06] dark:text-emerald-50/68">
                    {template.fields} fields
                  </span>
                </div>
                <p className="mb-2 text-xs uppercase tracking-[0.2em] text-emerald-700/70 dark:text-emerald-200/65">
                  {template.category}
                </p>
                <h3 className="text-2xl font-semibold text-emerald-950 dark:text-white">{template.title}</h3>
                <p className="mt-3 min-h-16 text-sm leading-6 text-emerald-900/65 dark:text-emerald-50/65">
                  {template.description}
                </p>
                <div className="mt-5 rounded-lg border border-emerald-900/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700/70 dark:text-emerald-200/65">
                    <TextCursorInput className="size-4" />
                    Form feel
                  </div>
                  <div className="grid gap-2">
                    {options.map((option, index) => (
                      <div
                        className="flex items-center gap-2 rounded-lg border border-emerald-900/10 bg-emerald-50/70 px-3 py-2 text-sm text-emerald-900/72 dark:border-white/10 dark:bg-black/20 dark:text-emerald-50/72"
                        key={option}
                      >
                        {index === 0 ? <CheckCircle2 className="size-4 text-emerald-500 dark:text-emerald-200" /> : <Radio className="size-4 text-emerald-500 dark:text-emerald-200" />}
                        <span className="truncate">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button asChild className="mt-7 w-full bg-emerald-300 text-emerald-950 hover:bg-emerald-200">
                    <Link href={`/builder?template=${template.slug}`}>
                      Use template
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </GlassPanel>
            );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}
