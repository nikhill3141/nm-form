"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Leaf, Loader2, Send } from "lucide-react";
import { Button } from "~/components/ui/button";
import { trpc } from "~/trpc/client";

const demoFields = [
  { id: "demo-1", label: "What part of the experience felt most alive?", type: "single_select", required: true, options: ["The opening scene", "The form flow", "The visual theme", "The thank you screen"] },
  { id: "demo-2", label: "Tell us what made that moment work.", type: "long_text", required: true, options: null },
] as const;

export function SharedFormRuntime() {
  const params = useSearchParams();
  const formId = params.get("formId") ?? "";
  const token = params.get("token") ?? undefined;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const fieldsQuery = trpc.field.getFieldsByFormId.useQuery(
    { formId, linkToken: token },
    { enabled: Boolean(formId), retry: false },
  );
  const submit = trpc.response.submitResponse.useMutation({
    onSuccess: () => setMessage("Response submitted. Thank you for moving through the experience."),
    onError: (error) => setMessage(error.message),
  });

  const fields = fieldsQuery.data?.length ? fieldsQuery.data : demoFields;
  const progress = useMemo(() => {
    const answered = fields.filter((field) => answers[field.id]).length;
    return Math.max(18, Math.round((answered / fields.length) * 100));
  }, [answers, fields]);

  function submitForm() {
    setMessage("");
    if (!formId || !fieldsQuery.data?.length) {
      setMessage("Demo response captured locally. Add a formId query param to submit through tRPC.");
      return;
    }
    submit.mutate({
      formId,
      linkToken: token,
      answers: fieldsQuery.data.map((field) => ({
        fieldId: field.id,
        value: answers[field.id] || "Skipped",
      })),
    });
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07140d] px-6 py-10 text-white">
      <div className="forest-scene absolute inset-0 opacity-84" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(3,8,6,0.78))]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col justify-between">
        <div className="flex items-center justify-between">
          <Link className="flex items-center gap-3" href="/">
            <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-300 text-emerald-950">
              <Leaf className="size-5" />
            </span>
            <span className="font-semibold">NM Forms</span>
          </Link>
          <span className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm text-emerald-50/72">{fields.length} questions</span>
        </div>
        <section className="py-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-200/75">Shared form</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">Move through a form that feels like a mini website.</h1>
          <div className="mt-10 space-y-5">
            {fields.map((field, index) => (
              <div className="rounded-xl border border-white/12 bg-white/[0.08] p-5 backdrop-blur-xl" key={field.id}>
                <label className="mb-4 block text-lg font-medium text-white">
                  {index + 1}. {field.label}
                  {field.required && <span className="text-emerald-200"> *</span>}
                </label>
                {field.type === "single_select" || field.type === "multi_select" || field.type === "checkbox" ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {(Array.isArray(field.options) ? field.options : ["Option A", "Option B"]).map((option) => (
                      <button
                        className={`rounded-lg border p-4 text-left transition ${answers[field.id] === option ? "border-emerald-300/60 bg-emerald-300/15" : "border-white/10 bg-black/18 hover:border-emerald-300/40"}`}
                        key={option}
                        onClick={() => setAnswers((current) => ({ ...current, [field.id]: option }))}
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="nm-input min-h-28"
                    onChange={(event) => setAnswers((current) => ({ ...current, [field.id]: event.target.value }))}
                    placeholder="Type your answer..."
                    value={answers[field.id] ?? ""}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
        <div>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-300 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {message ? <p className="text-sm text-emerald-50/72">{message}</p> : <span />}
            <Button className="bg-emerald-300 text-emerald-950 hover:bg-emerald-200" disabled={submit.isPending} onClick={submitForm}>
              {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Submit response
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
