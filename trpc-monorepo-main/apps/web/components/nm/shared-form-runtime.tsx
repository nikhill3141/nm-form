"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Home, Leaf, Loader2, PenTool, Send, Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";
import { loadBuilderDraft, type BuilderDraftField } from "./builder-draft";
import { getDefaultOptionsForFieldType, getInputTypeForFieldType, isOptionField, type FieldType } from "./field-types";
import { getFormTheme } from "./themes";

const demoFields = [
  { id: "demo-1", label: "What part of the experience felt most alive?", type: "single_select", required: true, options: ["The opening scene", "The form flow", "The visual theme", "The thank you screen"] },
  { id: "demo-2", label: "Tell us what made that moment work.", type: "long_text", required: true, options: undefined },
] satisfies BuilderDraftField[];

type RuntimeField = BuilderDraftField & {
  persistedId?: string;
};

function normalizeOptions(options: unknown, type: FieldType) {
  if (Array.isArray(options) && options.every((option) => typeof option === "string")) {
    return options;
  }

  return getDefaultOptionsForFieldType(type);
}

function toRuntimeType(type: string): FieldType {
  const supportedTypes = [
    "short_text",
    "long_text",
    "email",
    "number",
    "single_select",
    "multi_select",
    "checkbox",
    "phone",
    "date",
    "rating",
    "yes_no",
    "password",
    "url",
    "time",
  ];

  return supportedTypes.includes(type) ? (type as FieldType) : "short_text";
}

export function SharedFormRuntime() {
  const routeParams = useParams<{ slug?: string }>();
  const params = useSearchParams();
  const routeSlug = routeParams.slug;
  const formIdParam = params.get("formId") ?? "";
  const isDraftPreview = params.get("previewDraft") === "1";
  const [draft, setDraft] = useState<ReturnType<typeof loadBuilderDraft>>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ratingFeedback, setRatingFeedback] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isDraftPreview) {
      setDraft(loadBuilderDraft());
    }
  }, [isDraftPreview]);

  const formQuery = trpc.formLink.getFormByLinkSlug.useQuery(
    { slug: routeSlug ?? "" },
    { enabled: Boolean(routeSlug) && !isDraftPreview, retry: false },
  );
  const form = formQuery.data?.form;
  const formId = draft?.activeFormId || form?.id || formIdParam;
  const theme = getFormTheme(draft?.theme ?? form?.theme);

  const fieldsQuery = trpc.field.getFieldsByFormId.useQuery(
    { formId, linkSlug: routeSlug },
    { enabled: Boolean(formId) && !isDraftPreview, retry: false },
  );
  const submit = trpc.response.submitResponse.useMutation({
    onSuccess: () => {
      toast.success("Response planted successfully.", {
        className: "nm-toast",
        description: "Thanks for walking through the form.",
      });
      setSubmitted(true);
      setMessage("Response submitted. Thank you for moving through the experience.");
    },
    onError: (error) => {
      toast.error("The response trail paused.", {
        className: "nm-toast",
        description: error.message,
      });
      setMessage(error.message);
    },
  });

  const fields: RuntimeField[] = useMemo(() => {
    if (isDraftPreview && draft?.fields.length) {
      return draft.fields;
    }

    if (fieldsQuery.data?.length) {
      return fieldsQuery.data.map((field) => {
        const type = toRuntimeType(field.type);
        return {
          id: field.id,
          persistedId: field.id,
          label: field.label,
          type,
          required: field.required,
          options: normalizeOptions(field.options, type),
        };
      });
    }

    return demoFields;
  }, [draft?.fields, fieldsQuery.data, isDraftPreview]);

  const progress = useMemo(() => {
    const answered = fields.filter((field) => answers[field.id]).length;
    return Math.max(18, Math.round((answered / Math.max(fields.length, 1)) * 100));
  }, [answers, fields]);

  function toggleMultiValue(fieldId: string, option: string) {
    setAnswers((current) => {
      const values = new Set((current[fieldId] ?? "").split(", ").filter(Boolean));
      if (values.has(option)) {
        values.delete(option);
      } else {
        values.add(option);
      }
      return { ...current, [fieldId]: Array.from(values).join(", ") };
    });
  }

  function renderFieldInput(field: RuntimeField) {
    if (field.type === "long_text") {
      return (
        <textarea
          className="nm-input min-h-28"
          onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}
          placeholder="Type your answer..."
          value={answers[field.id] ?? ""}
        />
      );
    }

    if (field.type === "rating") {
      const selectedRating = Number(answers[field.id] ?? 0);
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                className="rounded-lg border border-white/10 bg-black/12 p-2 transition hover:border-emerald-300/50"
                key={star}
                onClick={() => setAnswers((current) => ({ ...current, [field.id]: String(star) }))}
                type="button"
              >
                <Star className={`size-7 ${star <= selectedRating ? "fill-emerald-300 text-emerald-300" : "text-current opacity-45"}`} />
              </button>
            ))}
          </div>
          <textarea
            className="nm-input min-h-24"
            onChange={(event) => setRatingFeedback((current) => ({ ...current, [field.id]: event.target.value }))}
            placeholder="Add feedback for this rating..."
            value={ratingFeedback[field.id] ?? ""}
          />
        </div>
      );
    }

    if (isOptionField(field.type)) {
      const options = field.options ?? getDefaultOptionsForFieldType(field.type) ?? [];
      const isMulti = field.type === "multi_select" || field.type === "checkbox";
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {options.map((option) => {
            const selected = isMulti
              ? (answers[field.id] ?? "").split(", ").includes(option)
              : answers[field.id] === option;
            return (
              <button
                className={`rounded-lg border p-4 text-left transition ${
                  selected ? theme.selectedChoiceClass : theme.choiceClass
                }`}
                key={option}
                onClick={() => {
                  if (isMulti) {
                    toggleMultiValue(field.id, option);
                    return;
                  }
                  setAnswers((current) => ({ ...current, [field.id]: option }));
                }}
                type="button"
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <input
        className="nm-input"
        onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}
        placeholder="Type your answer..."
        type={getInputTypeForFieldType(field.type)}
        value={answers[field.id] ?? ""}
      />
    );
  }

  function submitForm() {
    setMessage("");

    const missingField = fields.find((field) => field.required && !answers[field.id]);
    if (missingField) {
      const nextMessage = `Please answer: ${missingField.label}`;
      toast.warning("A required leaf is still empty.", {
        className: "nm-toast",
        description: nextMessage,
      });
      setMessage(nextMessage);
      return;
    }

    if (isDraftPreview) {
      toast.info("Preview response captured locally.", {
        className: "nm-toast",
        description: "Publish the form when you are ready to collect real responses.",
      });
      setSubmitted(true);
      setMessage("Preview response captured locally. Publish to submit through tRPC.");
      return;
    }

    if (!formId || !fieldsQuery.data?.length) {
      setMessage("Demo response captured locally. Add a real form to submit through tRPC.");
      return;
    }

    submit.mutate({
      formId,
      linkSlug: routeSlug,
      answers: fieldsQuery.data.map((field) => {
        const answer = answers[field.id] || "Skipped";
        const value = field.type === "rating" && ratingFeedback[field.id]
          ? `${answer} star${answer === "1" ? "" : "s"} - ${ratingFeedback[field.id]}`
          : answer;

        return {
          fieldId: field.id,
          value,
        };
      }),
    });
  }

  return (
    <main className={`relative min-h-screen overflow-hidden px-6 py-10 ${theme.pageClass}`}>
      <div className={`${theme.sceneClass} absolute inset-0 opacity-84`} />
      <div className={`absolute inset-0 ${theme.overlayClass}`} />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link className="flex items-center gap-3" href="/">
              <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-300 text-emerald-950">
                <Leaf className="size-5" />
              </span>
              <span className="font-semibold">NM Forms</span>
            </Link>
            {isDraftPreview && (
              <Button className="border-current/15 bg-current/5 hover:bg-current/10" asChild size="sm" variant="outline">
                <Link href="/builder">
                  <PenTool className="size-4" />
                  Builder
                </Link>
              </Button>
            )}
          </div>
          <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm">{fields.length} questions</span>
        </div>
        {submitted ? (
          <section className="grid flex-1 place-items-center py-16">
            <div className={`w-full max-w-2xl rounded-xl border p-8 text-center shadow-2xl backdrop-blur-xl ${theme.panelClass}`}>
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-300 text-emerald-950">
                <CheckCircle2 className="size-8" />
              </div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] opacity-70">Thank you</p>
              <h1 className="text-4xl font-semibold leading-tight md:text-5xl">Your response has been received.</h1>
              <p className="mx-auto mt-4 max-w-lg text-base leading-7 opacity-76">
                We appreciate the time you spent here. You can close this page, return home, or go back to the builder if this was a preview.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {isDraftPreview && (
                  <Button className={theme.buttonClass} asChild>
                    <Link href="/builder">
                      <PenTool className="size-4" />
                      Open builder
                    </Link>
                  </Button>
                )}
                <Button className="border-current/15 bg-current/5 hover:bg-current/10" asChild variant="outline">
                  <Link href="/">
                    <Home className="size-4" />
                    Go home
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        ) : (
        <section className="py-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200/75">{theme.label}</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            {draft?.title ?? form?.title ?? "Move through a form that feels like a mini website."}
          </h1>
          {(draft?.description || form?.description) && <p className="mt-4 max-w-2xl text-base leading-7 opacity-76">{draft?.description ?? form?.description}</p>}
          <div className="mt-10 space-y-5">
            {fields.map((field, index) => (
              <div className={`rounded-xl border p-5 shadow-2xl shadow-black/15 backdrop-blur-xl ${theme.panelClass}`} key={field.id}>
                <label className="mb-4 block text-lg font-medium">
                  {index + 1}. {field.label}
                  {field.required && <span className="text-emerald-300"> *</span>}
                </label>
                {renderFieldInput(field)}
              </div>
            ))}
          </div>
        </section>
        )}
        <div>
          {!submitted && (
            <>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {message ? <p className="text-sm opacity-76">{message}</p> : <span />}
                <Button className={theme.buttonClass} disabled={submit.isPending} onClick={submitForm}>
                  {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                  Submit response
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
